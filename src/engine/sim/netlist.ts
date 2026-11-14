import { PART_DEFS, param, stateOf, tkey } from '../circuit/parts'
import { buildTopology } from '../circuit/topology'
import type { CircuitDoc, PlacedPart, Topology } from '../circuit/types'
import { generatorSpec, type GeneratorSpec } from './sources'

/**
 * Compiles a lab circuit into SPICE-like primitive elements for the transient engine. The node
 * numbering comes from the Phase 4 connection graph, so the simulation and the static checks
 * describe the same circuit. Every primitive maps onto a SPICE element:
 *   R → R,  VS (Norton) → V + series R,  C → C,  L → L,  D → piecewise-linear D,
 *   SW → voltage-controlled switch,  X → ideal transformer (coupled L with k = 1, plus L_m).
 *
 * Currents use the convention "flowing from terminal a to terminal b inside the element".
 */
export const R_OPEN = 1e9
export const R_CLOSED = 1e-3
export const DIODE_RD = 0.05
export const LED_RD = 10
export const GEN_R = 10
export const AC_R = 0.1
export const SUPPLY_R = 0.01
export const FUSE_R = 5e-3

export type Ctrl =
  | { kind: 'fixed'; on: boolean }
  | { kind: 'gate'; g: number; s: number; vth: number }
  | { kind: 'relay'; relay: string; contact: 'no' | 'nc' }
  | { kind: 'fuse' }
  | { kind: 'breaker' }

export type SourceFn = { kind: 'dc'; V: number } | { kind: 'ac'; vrms: number; f: number } | { kind: 'gen'; spec: GeneratorSpec }

export type El =
  | { k: 'R'; part: string; tag: string; a: number; b: number; R: number }
  | { k: 'VS'; part: string; tag: string; a: number; b: number; R: number; src: SourceFn }
  | { k: 'CC'; part: string; tag: string; a: number; b: number; V: number; Ilim: number }
  | { k: 'C'; part: string; tag: string; a: number; b: number; C: number }
  | { k: 'L'; part: string; tag: string; a: number; b: number; L: number }
  | { k: 'D'; part: string; tag: string; a: number; b: number; Vf: number; Rd: number }
  | { k: 'SW'; part: string; tag: string; a: number; b: number; Ron: number; ctrl: Ctrl }
  | { k: 'IG'; part: string; tag: string; a: number; b: number; Vsat: number; Rs: number; g: number; e: number; vth: number }
  | { k: 'X'; part: string; tag: string; a: number; b: number; s1: number; s2: number; n: number; br: number }

export interface Netlist {
  doc: CircuitDoc
  topo: Topology
  /** Number of circuit (topology) nodes, including the reference. */
  nodes: number
  /** Total voltage unknowns = topology nodes + internal nodes (reference included at index ref). */
  allNodes: number
  ref: number
  branches: number
  els: El[]
  /** Signature of parts + wires: equal signatures can take a live parameter update. */
  signature: string
}

export const signatureOf = (doc: CircuitDoc) =>
  JSON.stringify([doc.parts.map((p) => [p.id, p.type]), doc.wires.map((w) => [w.a.partId, w.a.terminalId, w.b.partId, w.b.terminalId])])

export function compile(doc: CircuitDoc): Netlist | { error: string } {
  const topo = buildTopology(doc)
  if (!doc.parts.length) return { error: 'The circuit is empty.' }
  if (topo.referenceNode === null) return { error: 'The circuit has no reference node.' }
  const els: El[] = []
  let next = topo.nodes.length
  let br = 0
  const N = (p: PlacedPart, t: string) => topo.nodeOf.get(tkey(p.id, t))!
  const internal = () => next++
  for (const p of doc.parts) {
    const id = p.id
    const R = (tag: string, a: number, b: number, r: number) => els.push({ k: 'R', part: id, tag, a, b, R: r })
    switch (p.type) {
      case 'battery':
        els.push({ k: 'VS', part: id, tag: 'main', a: N(p, '+'), b: N(p, '-'), R: Math.max(param(p, 'Rint'), 1e-3), src: { kind: 'dc', V: param(p, 'V') } })
        break
      case 'dc-supply':
        els.push({ k: 'CC', part: id, tag: 'main', a: N(p, '+'), b: N(p, '-'), V: param(p, 'V'), Ilim: param(p, 'Ilim') })
        break
      case 'ac-source':
        els.push({ k: 'VS', part: id, tag: 'main', a: N(p, '1'), b: N(p, '2'), R: AC_R, src: { kind: 'ac', vrms: param(p, 'Vrms'), f: param(p, 'f') } })
        break
      case 'gate-source':
        els.push({ k: 'VS', part: id, tag: 'main', a: N(p, '+'), b: N(p, '-'), R: GEN_R, src: { kind: 'gen', spec: generatorSpec(p) } })
        break
      case 'resistor':
      case 'ac-load':
        R('main', N(p, '1'), N(p, '2'), param(p, 'R'))
        break
      case 'dc-load':
        R('main', N(p, '+'), N(p, '-'), param(p, 'R'))
        break
      case 'capacitor':
        els.push({ k: 'C', part: id, tag: 'main', a: N(p, '1'), b: N(p, '2'), C: param(p, 'C') * 1e-6 })
        break
      case 'electrolytic':
        els.push({ k: 'C', part: id, tag: 'main', a: N(p, '+'), b: N(p, '-'), C: param(p, 'C') * 1e-6 })
        break
      case 'inductor': {
        const x = internal()
        R('rdc', N(p, '1'), x, Math.max(param(p, 'Rdc'), 1e-6))
        els.push({ k: 'L', part: id, tag: 'main', a: x, b: N(p, '2'), L: param(p, 'L') * 1e-3 })
        break
      }
      case 'diode':
        els.push({ k: 'D', part: id, tag: 'main', a: N(p, 'a'), b: N(p, 'k'), Vf: param(p, 'Vf'), Rd: DIODE_RD })
        break
      case 'led':
        els.push({ k: 'D', part: id, tag: 'main', a: N(p, 'a'), b: N(p, 'k'), Vf: param(p, 'Vf'), Rd: LED_RD })
        break
      case 'mosfet':
        els.push({ k: 'SW', part: id, tag: 'main', a: N(p, 'd'), b: N(p, 's'), Ron: param(p, 'Ron'), ctrl: { kind: 'gate', g: N(p, 'g'), s: N(p, 's'), vth: param(p, 'Vth') } })
        els.push({ k: 'D', part: id, tag: 'body', a: N(p, 's'), b: N(p, 'd'), Vf: 0.7, Rd: DIODE_RD })
        break
      case 'igbt':
        els.push({ k: 'IG', part: id, tag: 'main', a: N(p, 'c'), b: N(p, 'e'), Vsat: param(p, 'Vsat'), Rs: 0.05, g: N(p, 'g'), e: N(p, 'e'), vth: param(p, 'Vth') })
        els.push({ k: 'D', part: id, tag: 'body', a: N(p, 'e'), b: N(p, 'c'), Vf: 0.8, Rd: DIODE_RD })
        break
      case 'transformer': {
        const x1 = internal()
        const y1 = internal()
        const rw = Math.max(param(p, 'Rw'), 1e-6)
        R('rp', N(p, 'p1'), x1, rw)
        els.push({ k: 'L', part: id, tag: 'lm', a: x1, b: N(p, 'p2'), L: param(p, 'Lm') })
        els.push({ k: 'X', part: id, tag: 'main', a: x1, b: N(p, 'p2'), s1: y1, s2: N(p, 's2'), n: param(p, 'n'), br: br++ })
        R('rs', y1, N(p, 's1'), rw)
        break
      }
      case 'relay':
        R('coil', N(p, 'a1'), N(p, 'a2'), param(p, 'Rcoil'))
        els.push({ k: 'SW', part: id, tag: 'no', a: N(p, 'com'), b: N(p, 'no'), Ron: R_CLOSED, ctrl: { kind: 'relay', relay: id, contact: 'no' } })
        els.push({ k: 'SW', part: id, tag: 'nc', a: N(p, 'com'), b: N(p, 'nc'), Ron: R_CLOSED, ctrl: { kind: 'relay', relay: id, contact: 'nc' } })
        break
      case 'fuse':
        els.push({ k: 'SW', part: id, tag: 'main', a: N(p, '1'), b: N(p, '2'), Ron: FUSE_R, ctrl: { kind: 'fuse' } })
        break
      case 'breaker':
        els.push({ k: 'SW', part: id, tag: 'main', a: N(p, 'in+'), b: N(p, 'out+'), Ron: R_CLOSED, ctrl: { kind: 'breaker' } })
        els.push({ k: 'SW', part: id, tag: 'pole2', a: N(p, 'in-'), b: N(p, 'out-'), Ron: R_CLOSED, ctrl: { kind: 'breaker' } })
        break
      case 'switch':
        els.push({ k: 'SW', part: id, tag: 'main', a: N(p, '1'), b: N(p, '2'), Ron: R_CLOSED, ctrl: { kind: 'fixed', on: stateOf(p, 'closed') === 1 } })
        break
      case 'ground':
        break
    }
  }
  return { doc, topo, nodes: topo.nodes.length, allNodes: next, ref: topo.referenceNode, branches: br, els, signature: signatureOf(doc) }
}

/** Measurable signals of a circuit: node voltages, voltages across parts and currents through parts. */
export interface SignalDef {
  key: string
  label: string
  unit: 'V' | 'A'
  part?: string
  /** Voltage: V(a) − V(b) over all nodes (internal included). */
  va?: number
  vb?: number
  /** Current: Σ sign·i(element). */
  terms?: { el: number; sign: number }[]
  /** Delivered current of a Norton/CC source element (out of terminal a). */
  delivered?: number
}

export function signalsOf(net: Netlist): SignalDef[] {
  const { doc, topo, els } = net
  const out: SignalDef[] = []
  const N = (p: PlacedPart, t: string) => topo.nodeOf.get(tkey(p.id, t))!
  const elIdx = (part: string, tag: string) => els.findIndex((e) => e.part === part && e.tag === tag)
  const V = (key: string, label: string, p: PlacedPart, a: string, b: string) => out.push({ key, label, unit: 'V', part: p.id, va: N(p, a), vb: N(p, b) })
  const I = (key: string, label: string, p: PlacedPart, terms: [string, number][]) => {
    const t = terms.map(([tag, sign]) => ({ el: elIdx(p.id, tag), sign })).filter((x) => x.el >= 0)
    if (t.length) out.push({ key, label, unit: 'A', part: p.id, terms: t })
  }
  for (const p of doc.parts) {
    const L = p.label
    const ts = PART_DEFS[p.type].terminals.map((t) => t.id)
    switch (p.type) {
      case 'ground':
        break
      case 'battery':
      case 'dc-supply':
      case 'ac-source':
      case 'gate-source': {
        V(`V:${p.id}`, `V(${L}) ${p.type === 'gate-source' ? 'OUT−REF' : ts.join('−')}`, p, ts[0], ts[1])
        out.push({ key: `I:${p.id}`, label: `I(${L}) delivered`, unit: 'A', part: p.id, delivered: elIdx(p.id, 'main') })
        break
      }
      case 'mosfet':
      case 'igbt': {
        const [d, s] = p.type === 'mosfet' ? ['d', 's'] : ['c', 'e']
        V(`V:${p.id}`, `${p.type === 'mosfet' ? 'V_DS' : 'V_CE'}(${L})`, p, d, s)
        V(`VG:${p.id}`, `${p.type === 'mosfet' ? 'V_GS' : 'V_GE'}(${L})`, p, 'g', s)
        I(`I:${p.id}`, `${p.type === 'mosfet' ? 'I_D' : 'I_C'}(${L})`, p, [['main', 1], ['body', -1]])
        I(`IB:${p.id}`, `I diode(${L})`, p, [['body', 1]])
        break
      }
      case 'transformer':
        V(`V:${p.id}`, `V primary(${L})`, p, 'p1', 'p2')
        V(`VS:${p.id}`, `V secondary(${L})`, p, 's1', 's2')
        I(`I:${p.id}`, `I primary(${L})`, p, [['rp', 1]])
        I(`IS:${p.id}`, `I secondary(${L}) out of S1`, p, [['rs', -1]])
        I(`IM:${p.id}`, `I magnetising(${L})`, p, [['lm', 1]])
        break
      case 'relay':
        V(`V:${p.id}`, `V coil(${L})`, p, 'a1', 'a2')
        I(`I:${p.id}`, `I coil(${L})`, p, [['coil', 1]])
        I(`IC:${p.id}`, `I contacts(${L})`, p, [['no', 1], ['nc', 1]])
        break
      case 'breaker':
        V(`V:${p.id}`, `V pole +(${L})`, p, 'in+', 'out+')
        I(`I:${p.id}`, `I pole +(${L})`, p, [['main', 1]])
        break
      case 'inductor':
        V(`V:${p.id}`, `V(${L})`, p, '1', '2')
        I(`I:${p.id}`, `I(${L})`, p, [['main', 1]])
        break
      default:
        V(`V:${p.id}`, `V(${L})${ts[0] === 'a' ? ' A−K' : ts[0] === '+' ? ' +−' : ''}`, p, ts[0], ts[1])
        I(`I:${p.id}`, `I(${L})`, p, [['main', 1]])
    }
  }
  return out
}
