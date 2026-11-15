import { defaultParams, defaultStates } from '../circuit/parts'
import type { CircuitDoc, PartType, Rotation } from '../circuit/types'
import { ASSUME, archetypeOf, batteryRint } from './calc'
import type { DesignNumbers, DesignSpec, Selection } from './types'

/**
 * Circuit generation for the construction projects. The parts kit carries the student's design
 * values and selected generic ratings, so the simulation reflects their choices. Assembly steps
 * are requirements on the connection graph (never on where a part is placed).
 */
export type Stage = 'input' | 'bus' | 'power' | 'control' | 'protection' | 'output' | 'feedback' | 'solar' | 'grid'
export type Req = { kind: 'conn'; a: string; b: string } | { kind: 'series'; a: string; part: string; b: string }
export interface AssemblyStep {
  id: string
  stage: Stage
  title: string
  text: { beginner: string; intermediate: string; advanced: string }
  req: Req[]
}
export interface Zone {
  x: number
  y: number
  w: number
  h: number
  label: string
}
export interface Probes {
  out: string
  iout: string
  vin: string
  iin: string
  load: string
  source: string
  prot: string[]
  bridge?: string
  gate?: string
  pv?: { v: string; i: string }
  charge?: string
}
export interface ProjectBuild {
  doc: CircuitDoc
  zones: Zone[]
  steps: AssemblyStep[]
  probes: Probes
  /** Role of every kit part, shown in the parts kit. */
  roles: Record<string, string>
  /** Fixed simulation step for heavy designs (s), otherwise automatic. */
  simStep?: number
}

export const STAGE_LABEL: Record<Stage, string> = {
  input: 'DC input',
  bus: 'DC bus',
  power: 'Power stage',
  control: 'Control and gate drive',
  protection: 'Protection',
  output: 'Output stage',
  feedback: 'Feedback',
  solar: 'PV and MPPT stage',
  grid: 'Grid, generator and transfer',
}

const c = (a: string, b: string): Req => ({ kind: 'conn', a, b })
const ser = (a: string, part: string, b: string): Req => ({ kind: 'series', a, part, b })

class Kit {
  doc: CircuitDoc = { version: 1, parts: [], wires: [] }
  roles: Record<string, string> = {}
  steps: AssemblyStep[] = []
  zones: Zone[] = []
  part(id: string, type: PartType, x: number, y: number, role: string, params: Record<string, number> = {}, states: Record<string, number> = {}, rot: Rotation = 0) {
    this.doc.parts.push({ id, type, label: id, x, y, rotation: rot, params: { ...defaultParams(type), ...params }, states: { ...defaultStates(type), ...states } })
    this.roles[id] = role
    return this
  }
  wire(a: string, b: string) {
    const [pa, ta] = [a.slice(0, a.indexOf('.')), a.slice(a.indexOf('.') + 1)]
    const [pb, tb] = [b.slice(0, b.indexOf('.')), b.slice(b.indexOf('.') + 1)]
    this.doc.wires.push({ id: `w${this.doc.wires.length + 1}`, a: { partId: pa, terminalId: ta }, b: { partId: pb, terminalId: tb } })
    return this
  }
  step(id: string, stage: Stage, title: string, beginner: string, intermediate: string, advanced: string, req: Req[]) {
    this.steps.push({ id, stage, title, text: { beginner, intermediate, advanced }, req })
    return this
  }
  zone(x: number, y: number, w: number, h: number, label: string) {
    this.zones.push({ x, y, w, h, label })
    return this
  }
}

const GEN_OK = (mode: number, f: number, extra: Record<string, number>, invert = 0, level = 0) => ({ params: { Vhigh: 12, f, duty: 50, phase: 0, td: 0, ...extra }, states: { mode, level, invert } })

/** Per-device thermal resistance that reproduces a shared heat sink: R_θjc + R_θcs + n·R_θsa(eff). */
function deviceRth(sel: Selection, nSw: number) {
  const sink = sel.fan ? sel.heatsink * 0.4 : sel.heatsink
  return ASSUME.rthJC + ASSUME.rthCS + nSw * sink
}
function switchParams(sel: Selection, nSw: number, hv = false): Record<string, number> {
  const type = hv ? sel.hvType : sel.switchType
  return type === 'mosfet'
    ? { Ron: Math.max(0.001, (hv ? sel.hvRonMilli : sel.ronMilli) / 1000), Imax: hv ? sel.hvI : sel.switchI, tsw: sel.tsw, Rth: deviceRth(sel, nSw), Vth: 4 }
    : { Vsat: sel.vsat, Imax: hv ? sel.hvI : sel.switchI, tsw: sel.tsw, Rth: deviceRth(sel, nSw), Vth: 7 }
}

// ── reusable blocks ─────────────────────────────────────────────────────────
function batteryInput(k: Kit, d: DesignSpec, sel: Selection, withBus: boolean) {
  k.zone(0, 1, 17, 26, 'Input & protection')
  k.part('B1', 'battery', 4, 18, `Battery, ${d.vdc} V nominal (internal resistance: typical assumption)`, { V: d.vdc, Rint: batteryRint(d.vdc) })
    .part('F1', 'fuse', 9, 4, `DC input fuse, ${sel.fuse} A (your selection)`, { Irated: sel.fuse })
    .part('GND1', 'ground', 4, 24, 'Battery negative bonded to chassis / protective earth')
    .wire('B1.+', 'F1.1').wire('B1.-', 'GND1.gnd')
  k.step('in-fuse', 'input', 'Battery positive through the fuse', 'Connect B1 + to one end of fuse F1. The fuse must be the first thing after the battery positive so it protects every wire after it.', 'Fuse the battery positive before anything else.', 'DC input protection.', [ser('B1.+', 'F1', 'BUS+')])
  k.step('in-gnd', 'input', 'Battery negative to earth', 'Connect B1 − to the ground symbol GND1 (chassis / protective earth). This is also the 0 V reference for measurements.', 'Bond the battery negative to earth.', 'Reference the DC side.', [c('B1.-', 'GND1.gnd')])
  if (withBus) {
    k.zone(13, 1, 4, 26, '')
    k.part('C1', 'electrolytic', 14, 12, `DC bus capacitor, ${sel.busC} µF / ${sel.busV} V (your selection)`, { C: Math.min(100000, sel.busC), Vmax: Math.min(630, sel.busV) }, {}, 90)
    k.wire('C1.+', 'F1.2').wire('C1.-', 'B1.-')
    k.step('bus-cap', 'bus', 'DC bus capacitor across the bus', 'Connect C1 + to the fused bus (after F1) and C1 − to the battery negative. Watch the polarity: + to positive.', 'Decouple the DC bus close to the switches, observing polarity.', 'DC bus decoupling.', [c('C1.+', 'BUS+'), c('C1.-', 'B1.-')])
  }
}

/** Full H-bridge (legs A and B) with its four gate drivers on a control board below. Ids Q(base+1…4), G(base+1…4). */
function hbridge(k: Kit, sel: Selection, x0: number, gate: (q: 1 | 2 | 3 | 4) => { params: Record<string, number>; states: Record<string, number> }, plus: string, minus: string, opts: { base?: number; hv?: boolean; nTotal?: number } = {}) {
  const base = opts.base ?? 0
  const hv = !!opts.hv
  const Q = (i: number) => `Q${base + i}`
  const G = (i: number) => `G${base + i}`
  const type = (hv ? sel.hvType : sel.switchType) as PartType
  k.zone(x0 - 6, 1, 30, 29, hv ? 'HV power stage (H-bridge)' : 'Power stage (H-bridge)')
  k.zone(x0 - 6, 31, 30, 9, hv ? 'HV control & gate drive' : 'Control & gate drive')
  const pos: [number, number, number][] = [
    [1, x0, 10],
    [2, x0, 24],
    [3, x0 + 18, 10],
    [4, x0 + 18, 24],
  ]
  const role = (i: number) => `${i === 1 || i === 3 ? 'High' : 'Low'}-side switch, leg ${i <= 2 ? 'A' : 'B'} (your selection)`
  for (const [i, x, y] of pos) k.part(Q(i), type, x, y, role(i), switchParams(sel, opts.nTotal ?? 4, hv))
  const gx = [x0 - 4, x0 + 2, x0 + 14, x0 + 20]
  for (let i = 1; i <= 4; i++) {
    const g = gate(i as 1 | 2 | 3 | 4)
    k.part(G(i), 'gate-source', gx[i - 1], 35, `Gate driver for ${Q(i)}${i === 1 || i === 3 ? ' (floating, referenced to the switch node)' : ''}`, g.params, g.states)
  }
  const [d1, s1] = type === 'mosfet' ? ['d', 's'] : ['c', 'e']
  k.wire(plus, `${Q(1)}.${d1}`).wire(plus, `${Q(3)}.${d1}`).wire(`${Q(1)}.${s1}`, `${Q(2)}.${d1}`).wire(`${Q(3)}.${s1}`, `${Q(4)}.${d1}`).wire(`${Q(2)}.${s1}`, minus).wire(`${Q(4)}.${s1}`, minus)
  for (let i = 1; i <= 4; i++) k.wire(`${G(i)}.+`, `${Q(i)}.g`).wire(`${G(i)}.-`, `${Q(i)}.${s1}`)
  const dn = d1.toUpperCase()
  const sn = s1.toUpperCase()
  const pre = hv ? 'hv-' : 'hb-'
  k.step(`${pre}bus`, 'power', `${hv ? 'HV bus' : 'Bus'} to the high-side switches`, `Connect the ${dn} terminals of ${Q(1)} and ${Q(3)} to the ${hv ? 'HV bus +' : 'fused DC bus (F1 output)'}.`, `Feed both high-side switches from the ${hv ? 'HV' : 'fused'} bus.`, 'Supply the bridge.', [c(`${Q(1)}.${d1}`, plus), c(`${Q(3)}.${d1}`, plus)])
  k.step(`${pre}legs`, 'power', 'Form the two legs', `Leg A: ${Q(1)} ${sn} → ${Q(2)} ${dn}. Leg B: ${Q(3)} ${sn} → ${Q(4)} ${dn}. These two midpoints are the bridge outputs.`, 'Stack the switches into two half-bridge legs.', 'Two half-bridge legs.', [c(`${Q(1)}.${s1}`, `${Q(2)}.${d1}`), c(`${Q(3)}.${s1}`, `${Q(4)}.${d1}`)])
  k.step(`${pre}neg`, 'power', 'Low-side switches to the negative rail', `Connect ${Q(2)} ${sn} and ${Q(4)} ${sn} to the ${hv ? 'HV bus −' : 'battery negative'}.`, 'Return both legs to the negative rail.', 'Close the bridge.', [c(`${Q(2)}.${s1}`, minus), c(`${Q(4)}.${s1}`, minus)])
  k.step(`${pre}gates`, 'control', 'Gate drivers to each switch', `Each driver OUT goes to its switch gate G, and its REF to that switch's ${sn}. High-side drivers ${G(1)} and ${G(3)} float on the leg midpoints.`, 'Drive every gate relative to its own source/emitter.', 'Gate drive.', [1, 2, 3, 4].flatMap((i) => [c(`${G(i)}.+`, `${Q(i)}.g`), c(`${G(i)}.-`, `${Q(i)}.${s1}`)]))
  return { a: `${Q(1)}.${s1}`, b: `${Q(3)}.${s1}` }
}

/** Secondary side: (optional C filter) → breaker → load, with earthing and optional feedback sensor. */
function output(k: Kit, d: DesignSpec, sel: Selection, nb: DesignNumbers, x0: number, s1: string, s2: string, opts: { filterC?: boolean; sensor?: boolean }) {
  k.zone(x0 - 2, 1, 32, 39, 'Output & protection')
  if (opts.filterC) {
    k.part('C2', 'capacitor', x0 + 2, 17, `Output filter capacitor, ${sel.filterC} µF AC film (your selection)`, { C: Math.min(1000, Math.max(0.001, sel.filterC)) }, {}, 90)
    k.wire(s1, 'C2.1').wire(s2, 'C2.2')
    k.step('out-cap', 'output', 'Filter capacitor across the output', 'Connect C2 across the transformer secondary (S1 and S2). Together with L1 it forms the low-pass filter that removes the switching frequency.', 'Complete the LC low-pass filter.', 'Output filter.', [c('C2.1', s1), c('C2.2', s2)])
  }
  k.part('CB1', 'breaker', x0 + 9, 9, `AC output breaker, ${sel.breaker} A (your selection)`, { Irated: Math.min(125, sel.breaker) })
  k.part('LA1', 'ac-load', x0 + 18, 24, `Test load: ${Math.round(nb.rload)} Ω for ${d.power} W`, { R: Math.min(100000, Math.max(1, nb.rload)) })
  k.part('GND2', 'ground', x0 + 9, 30, 'Output neutral bonded to protective earth')
  k.wire(s1, 'CB1.in+').wire(s2, 'CB1.in-').wire('CB1.out+', 'LA1.1').wire('CB1.out-', 'LA1.2').wire('CB1.out-', 'GND2.gnd')
  k.step('out-cb', 'protection', 'Output through the breaker', 'Line (S1) to CB1 "+ in", neutral (S2) to CB1 "− in". The breaker protects the output wiring.', 'Protect the output with the two-pole breaker.', 'Output protection.', [c('CB1.in+', s1), c('CB1.in-', s2)])
  k.step('out-load', 'output', 'Load on the protected output', 'Connect the load LA1 between CB1 "+ out" and "− out".', 'Connect the load after the breaker.', 'Load.', [c('LA1.1', 'CB1.out+'), c('LA1.2', 'CB1.out-')])
  k.step('out-earth', 'protection', 'Earth the output neutral', 'Connect CB1 "− out" (neutral) to GND2. Bonding neutral to protective earth lets an RCD detect earth faults (educational: follow local wiring rules).', 'Bond the output neutral to earth.', 'Earthing.', [c('CB1.out-', 'GND2.gnd')])
  if (opts.sensor) {
    k.part('VS1', 'vsense', x0 + 24, 24, `Output voltage sensor, set-point ${d.vac} V rms (feedback)`, { Vset: d.vac })
    k.wire('VS1.+', 'LA1.1').wire('VS1.-', 'LA1.2')
    k.step('fb', 'feedback', 'Voltage feedback across the output', 'Connect VS1 + to the load line and VS1 − to neutral. The controller reads this RMS voltage every cycle and adjusts the SPWM modulation index.', 'Close the regulation loop at the output.', 'Feedback.', [c('VS1.+', 'LA1.1'), c('VS1.-', 'LA1.2')])
  }
}

function lfTransformer(k: Kit, d: DesignSpec, sel: Selection, nb: DesignNumbers, x: number, a: string, b: string, viaL: boolean) {
  const ipri = nb.n * nb.iout
  const rw = (0.6 * (1 / ASSUME.etaXfmrLF - 1) * d.power) / Math.max(ipri * ipri, 1e-6)
  const lm = d.vdc / (2 * Math.PI * d.f * 0.03 * Math.max(ipri, 1e-3))
  k.part('T1', 'transformer', x, 17, `Step-up transformer 1 : ${nb.n.toFixed(2)}, ${sel.xfmrVA} VA, ${sel.xfmrCore} core (winding R and L_m: typical assumptions)`, { n: Math.min(50, nb.n), Rw: Math.min(50, Math.max(0.001, rw)), Lm: Math.min(100, Math.max(0.001, lm)) })
  if (viaL) {
    const rl = (ASSUME.filterLossFrac * d.power) / Math.max(ipri * ipri, 1e-6)
    k.part('L1', 'inductor', x - 6, 12, `Filter inductor ${sel.filterL} mH (your selection)`, { L: Math.min(1000, Math.max(0.001, sel.filterL)), Rdc: Math.max(0.001, Math.min(1, rl)) })
    k.wire(a, 'L1.1').wire('L1.2', 'T1.p1').wire(b, 'T1.p2')
    k.step('xf-pri', 'output', 'Bridge → filter inductor → transformer primary', 'Leg A output → L1 → T1 P1; leg B output → T1 P2. L1 smooths the SPWM pulses into a sine current.', 'Connect the bridge to the primary through the filter inductor.', 'Primary circuit.', [ser(a, 'L1', 'T1.p1'), c(b, 'T1.p2')])
  } else {
    k.wire(a, 'T1.p1').wire(b, 'T1.p2')
    k.step('xf-pri', 'output', 'Bridge outputs to the transformer primary', 'Leg A output → T1 P1, leg B output → T1 P2. The bridge applies ±V_dc across the primary.', 'Drive the primary from the bridge outputs.', 'Primary circuit.', [c(a, 'T1.p1'), c(b, 'T1.p2')])
  }
}

// ── projects ────────────────────────────────────────────────────────────────
export function generateProject(projectId: string, d: DesignSpec, sel: Selection, nb: DesignNumbers): ProjectBuild {
  const k = new Kit()
  const arch = archetypeOf(projectId)
  const td = sel.switchType === 'mosfet' ? 1 : 2
  const sqGate = (q: 1 | 2 | 3 | 4, phaseB = 180) => (q === 1 ? GEN_OK(1, d.f, { td }) : q === 2 ? GEN_OK(1, d.f, { td }, 1) : q === 3 ? GEN_OK(1, d.f, { td, phase: phaseB }) : GEN_OK(1, d.f, { td, phase: phaseB }, 1))
  const spwmMode = sel.vsensor ? 3 : 2
  const sineGate = (q: 1 | 2 | 3 | 4, f = d.fsw) => GEN_OK(spwmMode, f, { fm: d.f, m: Math.min(1, Math.max(0.05, nb.m)), td }, q === 2 || q === 3 ? 1 : 0)
  let probes: Probes = { out: 'V:LA1', iout: 'I:LA1', vin: 'V:B1', iin: 'I:B1', load: 'LA1', source: 'B1', prot: ['F1', 'CB1'], bridge: 'T:Q1.s|T:Q3.s', gate: 'VG:Q1' }
  let simStep: number | undefined

  if (arch === 'lv-bridge') {
    batteryInput(k, d, sel, false)
    const o = hbridge(k, sel, 24, (q) => sqGate(q), 'F1.2', 'B1.-')
    k.zone(46, 1, 16, 29, 'Low-voltage AC output')
    k.part('LA1', 'ac-load', 52, 17, `Low-voltage AC lamp: ${Math.round(nb.rload * 10) / 10} Ω for ${d.power} W`, { R: Math.max(1, nb.rload) })
    k.wire(o.a, 'LA1.1').wire(o.b, 'LA1.2')
    k.step('out-load', 'output', 'Load between the bridge outputs', 'Connect the lamp LA1 between the two leg midpoints (Q1 S and Q3 S). Diagonal pairs reverse the voltage across it: that is AC.', 'Put the load across the two leg outputs.', 'Load.', [ser(o.a, 'LA1', o.b)])
    probes = { ...probes, prot: ['F1'] }
  } else if (projectId === 'bld-b' || projectId === 'bld-c') {
    batteryInput(k, d, sel, true)
    const o = hbridge(k, sel, 24, (q) => sqGate(q, projectId === 'bld-c' ? nb.alpha : 180), 'F1.2', 'B1.-')
    lfTransformer(k, d, sel, nb, 54, o.a, o.b, false)
    output(k, d, sel, nb, 58, 'T1.s1', 'T1.s2', {})
  } else if (projectId === 'bld-d') {
    batteryInput(k, d, sel, true)
    const o = hbridge(k, sel, 24, (q) => sineGate(q), 'F1.2', 'B1.-')
    lfTransformer(k, d, sel, nb, 56, o.a, o.b, true)
    output(k, d, sel, nb, 60, 'T1.s1', 'T1.s2', { filterC: true, sensor: sel.vsensor })
  } else if (arch === 'push-pull') {
    batteryInput(k, d, sel, true)
    k.zone(18, 1, 30, 39, 'Push-pull power stage & gate drive')
    const ipri = nb.n * nb.iout
    const rw = (0.6 * (1 / ASSUME.etaXfmrLF - 1) * d.power) / Math.max(ipri * ipri, 1e-6)
    k.part('T1', 'transformer-ct', 38, 17, `Centre-tapped transformer, 1 : ${nb.n.toFixed(2)} per half, ${sel.xfmrVA} VA, ${sel.xfmrCore} core`, { n: Math.min(100, nb.n), Rw: Math.max(0.001, rw), Lm: Math.max(0.0001, d.vdc / (2 * Math.PI * d.f * 0.03 * Math.max(ipri, 1e-3))) })
    const [dd, ss] = sel.switchType === 'mosfet' ? ['d', 's'] : ['c', 'e']
    k.part('Q1', sel.switchType as PartType, 28, 26, 'Push-pull switch 1 (low side, your selection)', switchParams(sel, 2))
      .part('Q2', sel.switchType as PartType, 28, 12, 'Push-pull switch 2 (low side, your selection)', switchParams(sel, 2))
      .part('G1', 'gate-source', 22, 34, 'Gate driver for Q1 (low side)', GEN_OK(1, d.f, { td }).params, GEN_OK(1, d.f, { td }).states)
      .part('G2', 'gate-source', 22, 18, 'Gate driver for Q2 (low side)', GEN_OK(1, d.f, { td }, 1).params, GEN_OK(1, d.f, { td }, 1).states)
      .wire('F1.2', 'T1.pc').wire('T1.p1', `Q2.${dd}`).wire('T1.p2', `Q1.${dd}`).wire(`Q1.${ss}`, 'B1.-').wire(`Q2.${ss}`, 'B1.-')
      .wire('G1.+', 'Q1.g').wire('G1.-', `Q1.${ss}`).wire('G2.+', 'Q2.g').wire('G2.-', `Q2.${ss}`)
    k.step('pp-ct', 'power', 'Centre tap to the fused supply', 'Connect T1 CT (centre tap) to the fused bus (F1 output). Current flows from the centre tap into whichever half-winding is switched on.', 'Supply the centre tap.', 'Primary supply.', [c('T1.pc', 'BUS+')])
    k.step('pp-ends', 'power', 'Each primary end to its switch', `Connect T1 P1 to Q2 ${dd.toUpperCase()} and T1 P2 to Q1 ${dd.toUpperCase()}, and both ${ss.toUpperCase()} terminals to the battery negative.`, 'Each half-winding returns through its own low-side switch.', 'Push-pull primary.', [c('T1.p1', `Q2.${dd}`), c('T1.p2', `Q1.${dd}`), c(`Q1.${ss}`, 'B1.-'), c(`Q2.${ss}`, 'B1.-')])
    k.step('pp-gates', 'control', 'Low-side gate drivers', 'G1 drives Q1 and G2 drives Q2 (OUT → gate, REF → source). They alternate every half-cycle.', 'Drive both switches from the negative rail.', 'Gate drive.', [c('G1.+', 'Q1.g'), c('G1.-', `Q1.${ss}`), c('G2.+', 'Q2.g'), c('G2.-', `Q2.${ss}`)])
    output(k, d, sel, nb, 50, 'T1.s1', 'T1.s2', {})
    probes = { ...probes, bridge: 'V:T1', gate: 'VG:Q1' }
  } else if (arch === 'hf-link') {
    batteryInput(k, d, sel, true)
    simStep = 1e-6
    k.zone(18, 1, 34, 39, 'High-frequency DC-DC stage')
    const ipri = d.power / (d.vdc * 0.9)
    const rw = (0.5 * (1 / ASSUME.etaXfmrHF - 1) * d.power) / Math.max(ipri * ipri, 1e-6)
    k.part('T1', 'transformer-ct', 32, 17, `HF centre-tapped transformer, 1 : ${nb.nLink.toFixed(2)} per half, ${sel.xfmrVA} VA, ${sel.xfmrCore} core`, { n: Math.min(100, nb.nLink), Rw: Math.max(0.001, rw), Lm: Math.max(0.0001, d.vdc / (2 * Math.PI * d.fswLink * 0.05 * ipri)) })
      .part('Q1', 'mosfet', 24, 26, 'Push-pull switch 1 (low side, your selection)', switchParams({ ...sel, switchType: 'mosfet' }, 6))
      .part('Q2', 'mosfet', 24, 12, 'Push-pull switch 2 (low side, your selection)', switchParams({ ...sel, switchType: 'mosfet' }, 6))
      .part('G1', 'gate-source', 19, 34, `Gate driver Q1, ${d.fswLink} Hz`, GEN_OK(1, d.fswLink, { td: 0.5 }).params, GEN_OK(1, d.fswLink, { td: 0.5 }).states)
      .part('G2', 'gate-source', 19, 18, `Gate driver Q2, ${d.fswLink} Hz`, GEN_OK(1, d.fswLink, { td: 0.5 }, 1).params, GEN_OK(1, d.fswLink, { td: 0.5 }, 1).states)
      .wire('F1.2', 'T1.pc').wire('T1.p1', 'Q2.d').wire('T1.p2', 'Q1.d').wire('Q1.s', 'B1.-').wire('Q2.s', 'B1.-')
      .wire('G1.+', 'Q1.g').wire('G1.-', 'Q1.s').wire('G2.+', 'Q2.g').wire('G2.-', 'Q2.s')
    k.step('pp-ct', 'power', 'Centre tap to the fused supply', 'Connect T1 CT to the fused bus (F1 output).', 'Supply the centre tap.', 'Primary supply.', [c('T1.pc', 'BUS+')])
    k.step('pp-ends', 'power', 'Primary ends to the push-pull switches', 'T1 P1 → Q2 D, T1 P2 → Q1 D; both sources to the battery negative.', 'Each half-winding returns through its own switch.', 'Push-pull primary.', [c('T1.p1', 'Q2.d'), c('T1.p2', 'Q1.d'), c('Q1.s', 'B1.-'), c('Q2.s', 'B1.-')])
    k.step('pp-gates', 'control', 'High-frequency gate drive', `G1 → Q1 and G2 → Q2, alternating at ${d.fswLink} Hz with a short dead time.`, 'Drive the push-pull pair.', 'Gate drive.', [c('G1.+', 'Q1.g'), c('G1.-', 'Q1.s'), c('G2.+', 'Q2.g'), c('G2.-', 'Q2.s')])
    // Rectifier and HV bus
    k.part('D1', 'diode', 40, 10, `Fast rectifier diode (your selection ${sel.diodeV} V / ${sel.diodeI} A)`, { Vf: 1.0, Imax: Math.min(50, sel.diodeI) })
      .part('D2', 'diode', 40, 14, 'Fast rectifier diode', { Vf: 1.0, Imax: Math.min(50, sel.diodeI) })
      .part('D3', 'diode', 40, 20, 'Fast rectifier diode', { Vf: 1.0, Imax: Math.min(50, sel.diodeI) })
      .part('D4', 'diode', 40, 24, 'Fast rectifier diode', { Vf: 1.0, Imax: Math.min(50, sel.diodeI) })
      .part('C3', 'electrolytic', 48, 17, `HV bus capacitor ${sel.busC} µF / ${sel.busV} V (your selection)`, { C: Math.min(100000, Math.max(1, sel.busC)), Vmax: Math.min(630, sel.busV) }, {}, 90)
    k.wire('T1.s1', 'D1.a').wire('T1.s1', 'D3.k').wire('T1.s2', 'D2.a').wire('T1.s2', 'D4.k').wire('D1.k', 'C3.+').wire('D2.k', 'C3.+').wire('D3.a', 'C3.-').wire('D4.a', 'C3.-')
    k.step('rect', 'bus', 'Bridge-rectify the HF secondary', 'S1 → D1 anode and D3 cathode; S2 → D2 anode and D4 cathode. D1/D2 cathodes form HV bus +, D3/D4 anodes HV bus −.', 'Full-wave rectify the secondary into the HV bus.', 'HV rectifier.', [c('T1.s1', 'D1.a'), c('T1.s1', 'D3.k'), c('T1.s2', 'D2.a'), c('T1.s2', 'D4.k'), c('D1.k', 'C3.+'), c('D2.k', 'C3.+'), c('D3.a', 'C3.-'), c('D4.a', 'C3.-')])
    if (sel.bleeder) {
      const cb = sel.busC * 1e-6
      const rb = Math.min(10_000_000, Math.max(1000, 60 / (cb * Math.log(Math.max(nb.vbus, 60) / 50))))
      k.part('R1', 'resistor', 52, 17, `Bleeder resistor ${Math.round(rb / 1000)} kΩ (discharges the HV bus)`, { R: rb, Pmax: 10 }, {}, 90)
      k.wire('R1.1', 'C3.+').wire('R1.2', 'C3.-')
      k.step('bleed', 'protection', 'Bleeder across the HV bus', 'Connect R1 across C3. It slowly discharges the HV capacitor after switch-off, so it is not left charged.', 'Give the HV bus a discharge path.', 'Capacitor discharge.', [ser('C3.+', 'R1', 'C3.-')])
    }
    const o = hbridge(k, sel, 62, (q) => sineGate(q), 'C3.+', 'C3.-', { base: 2, hv: true, nTotal: 6 })
    const ipk = nb.iout * Math.SQRT2
    k.part('L1', 'inductor', 88, 12, `Output filter inductor ${sel.filterL} mH (your selection)`, { L: Math.min(1000, Math.max(0.001, sel.filterL)), Rdc: Math.max(0.001, Math.min(5, (ASSUME.filterLossFrac * d.power) / Math.max((ipk * ipk) / 2, 1e-6))) })
    k.wire(o.a, 'L1.1')
    k.step('flt-l', 'output', 'HV bridge → filter inductor', 'Leg A output (Q3 S) → L1. Leg B output (Q5 S) is the return conductor.', 'Insert the filter inductor after the HV bridge.', 'Output filter.', [c(o.a, 'L1.1')])
    output(k, d, sel, nb, 92, 'L1.2', o.b, { filterC: true, sensor: sel.vsensor })
    probes = { ...probes, bridge: `T:${o.a}|T:${o.b}`, gate: 'VG:Q3' }
  } else if (projectId === 'bld-g') {
    // PV → buck MPPT → battery → SPWM inverter → transformer → output
    k.zone(0, 1, 17, 39, 'PV input & MPPT stage')
    k.part('PV1', 'pv-array', 3, 10, `PV array (simplified model) V_oc ${d.pvVoc} V, I_sc ${d.pvIsc} A`, { Voc: d.pvVoc, Isc: d.pvIsc })
      .part('CM', 'electrolytic', 7, 16, 'PV input capacitor', { C: 470, Vmax: 100 }, {}, 0)
      .part('QM', 'mosfet', 11, 6, 'MPPT buck switch (high side)', switchParams({ ...sel, switchType: 'mosfet' }, 5))
      .part('GM', 'gate-source', 4, 30, `MPPT PWM, duty ${(d.mpptDuty * 100).toFixed(0)} % at 5 kHz`, GEN_OK(1, 5000, { duty: d.mpptDuty * 100 }).params, GEN_OK(1, 5000, {}).states)
      .part('DM', 'diode', 12, 22, 'Buck freewheel diode', { Imax: 20 }, {}, 270)
      .part('LM', 'inductor', 16, 14, 'Buck inductor 1 mH', { L: 1, Rdc: 0.02 })
    k.part('B1', 'battery', 22, 26, `Battery, ${d.vdc} V nominal`, { V: d.vdc, Rint: batteryRint(d.vdc) })
      .part('F1', 'fuse', 26, 4, `Battery fuse, ${sel.fuse} A (your selection)`, { Irated: sel.fuse })
      .part('GND1', 'ground', 22, 32, 'Battery negative / PV negative bonded to earth')
      .part('C1', 'electrolytic', 30, 12, `DC bus capacitor, ${sel.busC} µF / ${sel.busV} V`, { C: Math.min(100000, sel.busC), Vmax: Math.min(630, sel.busV) }, {}, 90)
    k.wire('PV1.+', 'CM.+').wire('PV1.-', 'CM.-').wire('PV1.+', 'QM.d').wire('QM.s', 'DM.k').wire('DM.a', 'PV1.-').wire('QM.s', 'LM.1').wire('LM.2', 'B1.+').wire('PV1.-', 'B1.-')
      .wire('GM.+', 'QM.g').wire('GM.-', 'QM.s').wire('B1.+', 'F1.1').wire('B1.-', 'GND1.gnd').wire('C1.+', 'F1.2').wire('C1.-', 'B1.-')
    k.step('pv-in', 'solar', 'PV array to the MPPT input', 'PV1 + → CM + and the drain of QM; PV1 − → CM − and the battery negative.', 'Connect the array to the buck MPPT input with its capacitor.', 'PV input.', [c('PV1.+', 'QM.d'), c('PV1.+', 'CM.+'), c('PV1.-', 'CM.-'), c('PV1.-', 'B1.-')])
    k.step('pv-buck', 'solar', 'Buck converter: switch, diode and inductor', 'QM source = switch node: to DM cathode and LM. DM anode to the negative rail. LM output to the battery positive.', 'Build the buck stage that charges the battery.', 'MPPT power stage.', [c('QM.s', 'DM.k'), c('DM.a', 'PV1.-'), ser('QM.s', 'LM', 'B1.+')])
    k.step('pv-gate', 'control', 'MPPT gate drive (floating)', 'GM OUT → QM gate, GM REF → QM source (the switch node: a floating, high-side drive).', 'Drive the high-side buck switch.', 'MPPT drive.', [c('GM.+', 'QM.g'), c('GM.-', 'QM.s')])
    k.step('in-fuse', 'input', 'Battery positive through the fuse to the inverter', 'B1 + → F1 → DC bus (C1 +).', 'Fuse the battery before the inverter.', 'DC input protection.', [ser('B1.+', 'F1', 'C1.+')])
    k.step('in-gnd', 'input', 'Negative rail to earth', 'Connect B1 − to GND1, and C1 − to B1 −.', 'Bond the negative rail and decouple the bus.', 'Reference.', [c('B1.-', 'GND1.gnd'), c('C1.-', 'B1.-')])
    const o = hbridge(k, sel, 40, (q) => sineGate(q), 'F1.2', 'B1.-')
    lfTransformer(k, d, sel, nb, 72, o.a, o.b, true)
    output(k, d, sel, nb, 76, 'T1.s1', 'T1.s2', { filterC: true, sensor: sel.vsensor })
    probes = { ...probes, pv: { v: 'V:PV1', i: 'I:PV1' }, charge: 'I:LM' }
    simStep = 1e-6
  } else {
    // bld-h hybrid: grid + generator inputs, transfer relays, charger, battery inverter, AC output.
    k.zone(0, 1, 30, 39, 'Grid, generator & transfer')
    k.part('AC1', 'ac-source', 3, 10, `Grid input ${d.vac} V ${d.f} Hz (simulated mains)`, { Vrms: d.vac, f: d.f })
      .part('AC2', 'ac-source', 3, 26, `Generator input ${d.vac} V ${d.f} Hz (simulated)`, { Vrms: d.vac, f: d.f })
      .part('CBG', 'breaker', 9, 6, 'Grid input breaker', { Irated: 63 })
      .part('CBN', 'breaker', 9, 22, 'Generator input breaker', { Irated: 63 }, { on: 0 })
      .part('K2', 'relay', 18, 14, 'Source selector relay (NC = grid, NO = generator)')
      .part('K1', 'relay', 24, 30, 'Transfer relay (NC = AC input bypass, NO = inverter)')
      .part('GK2', 'gate-source', 14, 36, 'Transfer controller: source select (High = generator)', { Vhigh: 12 }, { mode: 0, level: 0 })
      .part('GK1', 'gate-source', 20, 36, 'Transfer controller: inverter select (High = backup)', { Vhigh: 12 }, { mode: 0, level: 0 })
    k.wire('AC1.1', 'CBG.in+').wire('AC1.2', 'CBG.in-').wire('AC2.1', 'CBN.in+').wire('AC2.2', 'CBN.in-')
      .wire('CBG.out+', 'K2.nc').wire('CBN.out+', 'K2.no').wire('CBG.out-', 'CBN.out-')
      .wire('K2.com', 'K1.nc').wire('GK2.+', 'K2.a1').wire('GK2.-', 'K2.a2').wire('GK1.+', 'K1.a1').wire('GK1.-', 'K1.a2')
    k.step('h-grid', 'grid', 'Grid and generator through their breakers', 'AC1 → CBG (line to + in, neutral to − in); AC2 → CBN likewise. Join the two neutral outputs.', 'Protect both AC inputs and share the neutral.', 'AC inputs.', [c('AC1.1', 'CBG.in+'), c('AC1.2', 'CBG.in-'), c('AC2.1', 'CBN.in+'), c('AC2.2', 'CBN.in-'), c('CBG.out-', 'CBN.out-')])
    k.step('h-k2', 'grid', 'Source selector relay K2', 'Grid line (CBG + out) → K2 NC, generator line (CBN + out) → K2 NO. K2 COM is the selected AC input.', 'Select grid or generator with K2.', 'Source selection.', [c('CBG.out+', 'K2.nc'), c('CBN.out+', 'K2.no')])
    k.step('h-k1', 'grid', 'Transfer relay K1', 'K2 COM → K1 NC (bypass from the AC input). The inverter output goes to K1 NO; the load hangs on K1 COM.', 'Transfer the load between AC input and inverter with K1.', 'Transfer switching.', [c('K2.com', 'K1.nc')])
    k.step('h-ctl', 'control', 'Transfer controller to the relay coils', 'GK2 OUT/REF → K2 A1/A2, GK1 OUT/REF → K1 A1/A2.', 'Drive both relay coils from the transfer controller.', 'Transfer control.', [c('GK2.+', 'K2.a1'), c('GK2.-', 'K2.a2'), c('GK1.+', 'K1.a1'), c('GK1.-', 'K1.a2')])
    // Charger: step-down transformer, bridge, current-limit resistor → battery
    // Simplified charger: the transformer peak exceeds the battery by V_ex and RC limits the peak current to
    // 2·I_charge, keeping RC's peak dissipation (2·I_charge·V_ex) at 50 W. A real charger regulates its current
    // with a converter and CC/CV control (Phase 7).
    const vEx = Math.min(0.15 * d.vdc, 50 / (2 * d.chargeCurrent))
    const nCh = (d.vdc + 2 * ASSUME.vfRect + vEx) / (d.vac * Math.SQRT2)
    const rCh = Math.max(0.02, vEx / (2 * d.chargeCurrent))
    k.zone(0, 41, 40, 14, 'Battery charger (simplified)')
    k.part('T2', 'transformer', 6, 48, `Charger step-down transformer 1 : ${nCh.toFixed(3)}`, { n: nCh, Rw: 0.05, Lm: 2 })
      .part('D1', 'diode', 14, 44, 'Charger rectifier', { Imax: Math.min(50, sel.diodeI) })
      .part('D2', 'diode', 14, 47, 'Charger rectifier', { Imax: Math.min(50, sel.diodeI) })
      .part('D3', 'diode', 14, 50, 'Charger rectifier', { Imax: Math.min(50, sel.diodeI) })
      .part('D4', 'diode', 14, 53, 'Charger rectifier', { Imax: Math.min(50, sel.diodeI) })
      .part('RC', 'resistor', 22, 44, `Charge current limit ${rCh.toFixed(3)} Ω (simplified charger model)`, { R: rCh, Pmax: 50 })
    k.wire('K2.com', 'T2.p1').wire('CBG.out-', 'T2.p2').wire('T2.s1', 'D1.a').wire('T2.s1', 'D3.k').wire('T2.s2', 'D2.a').wire('T2.s2', 'D4.k').wire('D1.k', 'RC.1').wire('D2.k', 'RC.1')
    k.step('h-chg', 'bus', 'Charger from the AC input', 'T2 primary across the selected AC input (K2 COM and neutral). Bridge-rectify the secondary (D1–D4) and feed the battery through RC.', 'Build the simplified charger from the AC input.', 'Charger.', [c('K2.com', 'T2.p1'), c('CBG.out-', 'T2.p2'), c('T2.s1', 'D1.a'), c('T2.s1', 'D3.k'), c('T2.s2', 'D2.a'), c('T2.s2', 'D4.k'), c('D1.k', 'RC.1'), c('D2.k', 'RC.1')])
    // Battery + inverter (shifted right)
    k.part('B1', 'battery', 34, 26, `Battery, ${d.vdc} V nominal`, { V: d.vdc, Rint: batteryRint(d.vdc) })
      .part('F1', 'fuse', 38, 4, `Battery fuse, ${sel.fuse} A (your selection)`, { Irated: sel.fuse })
      .part('GND1', 'ground', 34, 32, 'Battery negative bonded to earth')
      .part('C1', 'electrolytic', 42, 12, `DC bus capacitor, ${sel.busC} µF / ${sel.busV} V`, { C: Math.min(100000, sel.busC), Vmax: Math.min(630, sel.busV) }, {}, 90)
    k.wire('RC.2', 'B1.+').wire('D3.a', 'B1.-').wire('D4.a', 'B1.-').wire('B1.+', 'F1.1').wire('B1.-', 'GND1.gnd').wire('C1.+', 'F1.2').wire('C1.-', 'B1.-')
    k.step('h-bat', 'input', 'Charger output and battery fuse', 'RC → B1 +, D3/D4 anodes → B1 −. B1 + → F1 → DC bus (C1 +); C1 − → B1 −; B1 − → GND1.', 'Connect the charger to the battery and fuse the inverter supply.', 'Battery connections.', [c('RC.2', 'B1.+'), c('D3.a', 'B1.-'), c('D4.a', 'B1.-'), ser('B1.+', 'F1', 'C1.+'), c('C1.-', 'B1.-'), c('B1.-', 'GND1.gnd')])
    const o = hbridge(k, sel, 52, (q) => sineGate(q), 'F1.2', 'B1.-')
    lfTransformer(k, d, sel, nb, 84, o.a, o.b, true)
    k.zone(86, 1, 30, 39, 'Inverter output, load & protection')
    k.part('C2', 'capacitor', 90, 17, `Output filter capacitor ${sel.filterC} µF film`, { C: Math.min(1000, Math.max(0.001, sel.filterC)) }, {}, 90)
      .part('CB1', 'breaker', 96, 9, `Inverter output breaker ${sel.breaker} A`, { Irated: Math.min(125, sel.breaker) })
      .part('LA1', 'ac-load', 108, 24, `Test load ${Math.round(nb.rload)} Ω`, { R: Math.min(100000, Math.max(1, nb.rload)) })
      .part('GND2', 'ground', 100, 30, 'AC neutral bonded to protective earth')
    k.wire('T1.s1', 'C2.1').wire('T1.s2', 'C2.2').wire('T1.s1', 'CB1.in+').wire('T1.s2', 'CB1.in-').wire('CB1.out+', 'K1.no').wire('CB1.out-', 'CBG.out-').wire('K1.com', 'LA1.1').wire('LA1.2', 'CBG.out-').wire('CBG.out-', 'GND2.gnd')
    k.step('out-cap', 'output', 'Filter capacitor across the secondary', 'C2 across T1 S1–S2.', 'Complete the LC filter.', 'Output filter.', [c('C2.1', 'T1.s1'), c('C2.2', 'T1.s2')])
    k.step('out-cb', 'protection', 'Inverter output breaker to K1 NO', 'T1 S1 → CB1 + in → CB1 + out → K1 NO; T1 S2 → CB1 − in → neutral.', 'Protect the inverter output and offer it to the transfer relay.', 'Inverter output.', [c('CB1.in+', 'T1.s1'), c('CB1.in-', 'T1.s2'), c('CB1.out+', 'K1.no'), c('CB1.out-', 'CBG.out-')])
    k.step('out-load', 'output', 'Load on the transfer relay', 'Load LA1 between K1 COM and the common neutral.', 'Supply the load from K1.', 'Load.', [c('LA1.1', 'K1.com'), c('LA1.2', 'CBG.out-')])
    k.step('out-earth', 'protection', 'Earth the neutral', 'Connect the common neutral to GND2 (protective earth).', 'Bond neutral to earth.', 'Earthing.', [c('CBG.out-', 'GND2.gnd')])
    if (sel.vsensor) {
      k.part('VS1', 'vsense', 104, 14, `Inverter output voltage sensor, set-point ${d.vac} V`, { Vset: d.vac })
      k.wire('VS1.+', 'CB1.out+').wire('VS1.-', 'CB1.out-')
      k.step('fb', 'feedback', 'Feedback from the inverter output', 'VS1 across CB1 outputs (inverter side of K1).', 'Regulate the inverter output.', 'Feedback.', [c('VS1.+', 'CB1.out+'), c('VS1.-', 'CB1.out-')])
    }
    probes = { ...probes, charge: 'I:RC', prot: ['F1', 'CB1'] }
  }
  // Resolve the BUS+ placeholder (fused positive) in step requirements.
  const busPlus = k.doc.parts.some((p) => p.id === 'F1') ? 'F1.2' : 'B1.+'
  for (const s of k.steps)
    s.req = s.req.map((r) => (r.kind === 'conn' ? { ...r, a: r.a === 'BUS+' ? busPlus : r.a, b: r.b === 'BUS+' ? busPlus : r.b } : { ...r, a: r.a === 'BUS+' ? busPlus : r.a, b: r.b === 'BUS+' ? busPlus : r.b }))
  return { doc: k.doc, zones: k.zones.filter((z) => z.w > 0 && z.label), steps: k.steps, probes, roles: k.roles, simStep }
}
