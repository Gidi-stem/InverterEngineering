import { PART_DEFS, param, terminalPosition } from '../../engine/circuit/parts'
import type { CircuitAnalysis } from '../../engine/circuit/validate'
import type { CircuitDoc, Solution } from '../../engine/circuit/types'
import { volts } from './format'
import type { NodeLabel } from './Workspace'

/** Display helpers that turn a solved circuit into what the workspace draws. */
export const modeLabel = (s: Solution) => (s.mode.kind === 'dc' ? 'DC' : s.mode.polarity === 1 ? '+ peak' : '− peak')

/** Which parts to draw as lit / conducting / closed, from every solved state. */
export function partVisuals(doc: CircuitDoc, a: CircuitAnalysis): Record<string, { on: boolean; glow: number }> {
  const out: Record<string, { on: boolean; glow: number }> = {}
  for (const p of doc.parts) {
    let on = false
    let glow = 0
    for (const s of a.solutions) {
      const r = s.parts[p.id]
      if (!r) continue
      switch (p.type) {
        case 'led':
          if (r.state === 'conducting' && r.i > 1e-4) {
            on = true
            glow = Math.max(glow, Math.min(1, r.i / (param(p, 'Imax') / 1000)))
          }
          break
        case 'dc-load':
        case 'ac-load':
          if (Math.abs(r.i) > 1e-3) {
            on = true
            glow = Math.max(glow, Math.min(1, Math.abs(r.p) / 6))
          }
          break
        case 'mosfet':
        case 'igbt':
          if (r.state === 'on') on = true
          break
        case 'relay':
          if (r.state?.startsWith('energised')) on = true
          break
        default:
          break
      }
    }
    if (p.type === 'switch') on = !!p.states.closed
    if (p.type === 'breaker') on = !!p.states.on
    if (p.type === 'gate-source') on = !!p.states.level
    out[p.id] = { on, glow }
  }
  return out
}

/**
 * Nodes with no conducting path to the reference (only open switches, capacitors at DC or gates in
 * between). Their solved voltage is set by the solver's tiny leakage conductance, not by the
 * circuit, so the display says "floating" instead of showing a number.
 */
export function floatingNodes(doc: CircuitDoc, a: CircuitAnalysis): Set<number> {
  const ref = a.topo.referenceNode
  const parent = a.topo.nodes.map((n) => n.id)
  const find = (x: number): number => (parent[x] === x ? x : (parent[x] = find(parent[x])))
  const join = (p: string, t1: string, t2: string) => {
    const n1 = a.topo.nodeOf.get(`${p}:${t1}`)
    const n2 = a.topo.nodeOf.get(`${p}:${t2}`)
    if (n1 !== undefined && n2 !== undefined) parent[find(n1)] = find(n2)
  }
  for (const p of doc.parts) {
    const j = (t1: string, t2: string) => join(p.id, t1, t2)
    switch (p.type) {
      case 'capacitor':
      case 'electrolytic':
      case 'ground':
        break
      case 'switch':
        if (p.states.closed) j('1', '2')
        break
      case 'breaker':
        if (p.states.on) {
          j('in+', 'out+')
          j('in-', 'out-')
        }
        break
      case 'mosfet':
        j('d', 's')
        break
      case 'igbt':
        j('c', 'e')
        break
      case 'transformer':
        j('p1', 'p2')
        j('s1', 's2')
        break
      case 'relay': {
        j('a1', 'a2')
        const energised = a.solutions.some((s) => s.parts[p.id]?.state?.startsWith('energised'))
        j('com', energised ? 'no' : 'nc')
        break
      }
      default: {
        const ts = PART_DEFS[p.type].terminals.map((t) => t.id)
        for (let i = 1; i < ts.length; i++) j(ts[0], ts[i])
      }
    }
  }
  const out = new Set<number>()
  if (ref === null) return out
  for (const n of a.topo.nodes) if (find(n.id) !== find(ref)) out.add(n.id)
  return out
}

/** One voltage tag per wired node (except the reference), placed at its first terminal. */
export function nodeVoltageLabels(doc: CircuitDoc, a: CircuitAnalysis): NodeLabel[] {
  if (!a.solutions.length || a.solutions.some((s) => !s.ok)) return []
    const labels: NodeLabel[] = []
  const floating = floatingNodes(doc, a)
  for (const n of a.topo.nodes) {
    if (n.id === a.topo.referenceNode) continue
    // Tag the middle of the node's first wire, clear of part labels and pins.
    const inNode = new Set(n.terminals.map((r) => `${r.partId}:${r.terminalId}`))
    const w = doc.wires.find((x) => inNode.has(`${x.a.partId}:${x.a.terminalId}`))
    if (!w) continue
    const pa = doc.parts.find((x) => x.id === w.a.partId)
    const pb = doc.parts.find((x) => x.id === w.b.partId)
    if (!pa || !pb) continue
    const [x1, y1] = terminalPosition(pa, w.a.terminalId)
    const [x2, y2] = terminalPosition(pb, w.b.terminalId)
    const x = x1 === x2 || y1 === y2 ? (x1 + x2) / 2 : Math.round((x1 + x2) / 2)
    const y = (y1 + y2) / 2
    const vs = a.solutions.map((s) => s.nodeVoltages[n.id] ?? 0)
    if (floating.has(n.id)) {
      labels.push({ x, y, text: 'floating' })
      continue
    }
    const text = vs.length === 1 ? volts(vs[0]) : vs.map((v) => volts(v)).join(' | ')
    labels.push({ x, y, text, hazard: vs.some((v) => Math.abs(v) > 50) })
  }
  return labels
}
