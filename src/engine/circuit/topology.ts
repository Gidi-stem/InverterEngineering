import { PART_DEFS, tkey } from './parts'
import type { CircuitDoc, CircuitNode, PlacedPart, TerminalRef, Topology } from './types'

/**
 * Electrical nodes from wires: every terminal starts as its own node and each wire merges the
 * two nodes it joins (union-find). Wires that reference missing parts or terminals are ignored.
 */
export function buildTopology(doc: CircuitDoc): Topology {
  const parent = new Map<string, string>()
  const find = (k: string): string => {
    let r = k
    while (parent.get(r) !== r) r = parent.get(r)!
    let c = k
    while (parent.get(c) !== r) {
      const n = parent.get(c)!
      parent.set(c, r)
      c = n
    }
    return r
  }
  const refs: TerminalRef[] = []
  for (const p of doc.parts)
    for (const t of PART_DEFS[p.type].terminals) {
      const k = tkey(p.id, t.id)
      parent.set(k, k)
      refs.push({ partId: p.id, terminalId: t.id })
    }
  for (const w of doc.wires) {
    const a = tkey(w.a.partId, w.a.terminalId)
    const b = tkey(w.b.partId, w.b.terminalId)
    if (!parent.has(a) || !parent.has(b)) continue
    const ra = find(a)
    const rb = find(b)
    if (ra !== rb) parent.set(ra, rb)
  }
  const idOfRoot = new Map<string, number>()
  const nodes: CircuitNode[] = []
  const nodeOf = new Map<string, number>()
  for (const r of refs) {
    const k = tkey(r.partId, r.terminalId)
    const root = find(k)
    let id = idOfRoot.get(root)
    if (id === undefined) {
      id = nodes.length
      idOfRoot.set(root, id)
      nodes.push({ id, terminals: [], isGround: false })
    }
    nodes[id].terminals.push(r)
    nodeOf.set(k, id)
  }
  const grounds = doc.parts.filter((p) => p.type === 'ground')
  for (const g of grounds) nodes[nodeOf.get(tkey(g.id, 'gnd'))!].isGround = true
  let referenceNode: number | null = grounds.length ? nodeOf.get(tkey(grounds[0].id, 'gnd'))! : null
  if (referenceNode === null) {
    const src = doc.parts.find((p) => p.type === 'battery' || p.type === 'dc-supply') ?? doc.parts.find((p) => p.type === 'ac-source')
    if (src) referenceNode = nodeOf.get(tkey(src.id, src.type === 'ac-source' ? '2' : '-'))!
    else if (nodes.length) referenceNode = 0
  }
  return { nodeOf, nodes, referenceNode, hasGroundPart: grounds.length > 0 }
}

export const nodeOfTerminal = (topo: Topology, partId: string, terminalId: string) => topo.nodeOf.get(tkey(partId, terminalId)) ?? -1

/**
 * Terminal pairs that can carry current through a part (gate and coil isolation respected).
 * Used for closed-loop and path searches.
 */
export function internalPaths(p: PlacedPart): [string, string][] {
  switch (p.type) {
    case 'mosfet':
      return [['d', 's']]
    case 'igbt':
      return [['c', 'e']]
    case 'transformer':
      return [
        ['p1', 'p2'],
        ['s1', 's2'],
      ]
    case 'relay':
      return [
        ['a1', 'a2'],
        ['com', 'nc'],
        ['com', 'no'],
      ]
    case 'breaker':
      return [
        ['in+', 'out+'],
        ['in-', 'out-'],
      ]
    case 'ground':
      return []
    default: {
      const t = PART_DEFS[p.type].terminals
      return [[t[0].id, t[1].id]]
    }
  }
}

/** Is there a path between two nodes through parts' internal paths, optionally excluding one path of one part? */
export function connected(doc: CircuitDoc, topo: Topology, from: number, to: number, exclude?: { partId: string; path: [string, string] }, opts: { gates?: boolean } = {}): boolean {
  if (from === to) return true
  const adj = new Map<number, number[]>()
  // With `gates`, the gate–source (gate–emitter) input capacitance also closes a loop: a gate-drive loop is a real circuit.
  const gatePath = (p: PlacedPart): [string, string][] => (opts.gates ? (p.type === 'mosfet' ? [['g', 's']] : p.type === 'igbt' ? [['g', 'e']] : []) : [])
  for (const p of doc.parts)
    for (const path of [...internalPaths(p), ...gatePath(p)]) {
      if (exclude && exclude.partId === p.id && exclude.path[0] === path[0] && exclude.path[1] === path[1]) continue
      const a = nodeOfTerminal(topo, p.id, path[0])
      const b = nodeOfTerminal(topo, p.id, path[1])
      if (a < 0 || b < 0 || a === b) continue
      if (!adj.has(a)) adj.set(a, [])
      if (!adj.has(b)) adj.set(b, [])
      adj.get(a)!.push(b)
      adj.get(b)!.push(a)
    }
  const seen = new Set([from])
  const queue = [from]
  while (queue.length) {
    const n = queue.shift()!
    for (const m of adj.get(n) ?? []) {
      if (m === to) return true
      if (!seen.has(m)) {
        seen.add(m)
        queue.push(m)
      }
    }
  }
  return false
}

/** Terminals of a part that no wire touches. */
export function unconnectedTerminals(doc: CircuitDoc, p: PlacedPart): string[] {
  const wired = new Set<string>()
  for (const w of doc.wires) {
    if (w.a.partId === p.id) wired.add(w.a.terminalId)
    if (w.b.partId === p.id) wired.add(w.b.terminalId)
  }
  return PART_DEFS[p.type].terminals.map((t) => t.id).filter((t) => !wired.has(t))
}
