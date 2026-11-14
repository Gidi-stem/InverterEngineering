import { stateOf } from './parts'
import { nodeOfTerminal } from './topology'
import type { CircuitDoc, PlacedPart, Topology } from './types'

/**
 * Topology-based roles: which gate signal drives which switch, where the DC bus is, and which
 * switches form half-bridge legs. Found from the node graph, never from part labels or positions.
 */
export const isSwitch = (p: PlacedPart) => p.type === 'mosfet' || p.type === 'igbt'
export const swPins = (p: PlacedPart) => (p.type === 'mosfet' ? { hi: 'd', lo: 's' } : { hi: 'c', lo: 'e' })

/** Gate source driving a switch: its OUT on the gate node directly, or through one gate resistor. */
export function driverOf(doc: CircuitDoc, topo: Topology, sw: PlacedPart): PlacedPart | undefined {
  const gate = nodeOfTerminal(topo, sw.id, 'g')
  const outOn = (n: number) => doc.parts.find((p) => p.type === 'gate-source' && nodeOfTerminal(topo, p.id, '+') === n)
  const direct = outOn(gate)
  if (direct) return direct
  for (const r of doc.parts.filter((p) => p.type === 'resistor')) {
    const a = nodeOfTerminal(topo, r.id, '1')
    const b = nodeOfTerminal(topo, r.id, '2')
    if (a === gate && outOn(b)) return outOn(b)
    if (b === gate && outOn(a)) return outOn(a)
  }
  return undefined
}

/**
 * DC bus: nodes reachable from the battery/supply terminals through series protection and
 * closed switching elements (fuse, closed breaker pole, closed switch). Loads are not crossed.
 */
export function busNodes(doc: CircuitDoc, topo: Topology) {
  const plus = new Set<number>()
  const minus = new Set<number>()
  const sources = doc.parts.filter((p) => p.type === 'battery' || p.type === 'dc-supply')
  for (const s of sources) {
    plus.add(nodeOfTerminal(topo, s.id, '+'))
    minus.add(nodeOfTerminal(topo, s.id, '-'))
  }
  const links: [number, number][] = []
  for (const p of doc.parts) {
    if (p.type === 'fuse' || (p.type === 'switch' && stateOf(p, 'closed'))) links.push([nodeOfTerminal(topo, p.id, '1'), nodeOfTerminal(topo, p.id, '2')])
    if (p.type === 'breaker' && stateOf(p, 'on')) {
      links.push([nodeOfTerminal(topo, p.id, 'in+'), nodeOfTerminal(topo, p.id, 'out+')])
      links.push([nodeOfTerminal(topo, p.id, 'in-'), nodeOfTerminal(topo, p.id, 'out-')])
    }
  }
  for (const set of [plus, minus]) {
    let grew = true
    while (grew) {
      grew = false
      for (const [a, b] of links) {
        if (set.has(a) && !set.has(b)) {
          set.add(b)
          grew = true
        } else if (set.has(b) && !set.has(a)) {
          set.add(a)
          grew = true
        }
      }
    }
  }
  return { plus, minus, sources }
}

export interface SwitchRole {
  sw: PlacedPart
  driver?: PlacedPart
  role: 'high' | 'low' | 'other'
  /** Node shared with the opposite switch of the leg (bridge output), if any. */
  mid: number | null
}

export function switchRoles(doc: CircuitDoc, topo: Topology): SwitchRole[] {
  const bus = busNodes(doc, topo)
  const sws = doc.parts.filter(isSwitch)
  return sws.map((sw) => {
    const { hi, lo } = swPins(sw)
    const nHi = nodeOfTerminal(topo, sw.id, hi)
    const nLo = nodeOfTerminal(topo, sw.id, lo)
    const role: SwitchRole['role'] = bus.plus.has(nHi) && !bus.minus.has(nLo) ? 'high' : bus.minus.has(nLo) && !bus.plus.has(nHi) ? 'low' : 'other'
    return { sw, driver: driverOf(doc, topo, sw), role, mid: role === 'high' ? nLo : role === 'low' ? nHi : null }
  })
}

/** Half-bridge legs: a high-side and a low-side switch sharing their mid node. */
export function bridgeLegs(doc: CircuitDoc, topo: Topology) {
  const roles = switchRoles(doc, topo)
  const legs: { high: SwitchRole; low: SwitchRole; mid: number }[] = []
  for (const h of roles.filter((r) => r.role === 'high'))
    for (const l of roles.filter((r) => r.role === 'low')) if (h.mid !== null && h.mid === l.mid) legs.push({ high: h, low: l, mid: h.mid })
  return legs
}

/** Gate-state overrides that turn the given switches on and every other driven switch off. */
export function gateStates(roles: SwitchRole[], on: PlacedPart[]): Record<string, Record<string, number>> {
  const states: Record<string, Record<string, number>> = {}
  for (const r of roles) if (r.driver) states[r.driver.id] = { level: on.includes(r.sw) ? 1 : 0 }
  return states
}
