import { param } from './parts'
import { bridgeLegs, busNodes, gateStates, switchRoles, type SwitchRole } from './roles'
import { defaultModes, solveCircuit } from './solve'
import { buildTopology, nodeOfTerminal } from './topology'
import { validateSolution, validateTopology } from './validate'
import type { CircuitDoc, CriterionResult, ExerciseResult, PlacedPart, SimMode, Solution, SolveOverrides, Topology, ValidationIssue } from './types'

/**
 * Exercise evaluation. Each evaluator runs the circuit through the solver in the test states the
 * exercise needs (switch positions, gate signals, AC half-cycles) and checks electrical facts:
 * currents, voltages, polarities and node relationships. No rule counts wires or parts by position.
 */
const DC: SimMode = { kind: 'dc' }
const POS: SimMode = { kind: 'ac-snapshot', polarity: 1 }
const NEG: SimMode = { kind: 'ac-snapshot', polarity: -1 }

const fmtV = (v: number) => `${v.toFixed(Math.abs(v) >= 100 ? 0 : 2)} V`
const fmtI = (i: number) => (Math.abs(i) < 1 ? `${(i * 1000).toFixed(1)} mA` : `${i.toFixed(2)} A`)
const fmtT = (t: number) => (t < 1e-3 ? `${(t * 1e6).toFixed(0)} µs` : t < 1 ? `${(t * 1000).toFixed(1)} ms` : `${t.toFixed(2)} s`)
const within = (x: number, target: number, tol: number) => Math.abs(x - target) <= Math.abs(target) * tol

class Ctx {
  doc: CircuitDoc
  topo: Topology
  roles: SwitchRole[]
  criteria: CriterionResult[] = []
  blocking: ValidationIssue[] = []
  readings: { label: string; value: string }[] = []
  curves: NonNullable<ExerciseResult['curves']> = []
  constructor(doc: CircuitDoc) {
    this.doc = doc
    this.topo = buildTopology(doc)
    this.roles = switchRoles(doc, this.topo)
    this.blocking.push(...validateTopology(doc, this.topo).filter((i) => i.severity === 'danger'))
    // The circuit exactly as built (current switch and gate settings) must not be dangerous either.
    for (const m of defaultModes(doc)) this.blocking.push(...validateSolution(doc, this.topo, solveCircuit(doc, this.topo, m)).filter((i) => i.severity === 'danger'))
  }
  of = (type: PlacedPart['type']) => this.doc.parts.filter((p) => p.type === type)
  node = (p: PlacedPart, t: string) => nodeOfTerminal(this.topo, p.id, t)
  /** Solve a required test state; danger issues found here block a pass. */
  solve(mode: SimMode, ov: SolveOverrides = {}, required = true): Solution {
    const s = solveCircuit(this.doc, this.topo, mode, ov)
    if (required) this.blocking.push(...validateSolution(this.doc, this.topo, s).filter((i) => i.severity === 'danger'))
    return s
  }
  check(id: string, label: string, passed: boolean, detail: string, weight = 1) {
    this.criteria.push({ id, label, passed, weight, detail })
    return passed
  }
  read(label: string, value: string) {
    this.readings.push({ label, value })
  }
  result(): ExerciseResult {
    const seen = new Set<string>()
    const blocking = this.blocking.filter((i) => (seen.has(i.id) ? false : (seen.add(i.id), true)))
    const max = this.criteria.reduce((s, c) => s + c.weight, 0)
    const score = this.criteria.filter((c) => c.passed).reduce((s, c) => s + c.weight, 0)
    return { passed: max > 0 && score === max && blocking.length === 0, score, maxScore: max, criteria: this.criteria, blocking, readings: this.readings, curves: this.curves.length ? this.curves : undefined }
  }
}

const sourceOf = (c: Ctx) => c.of('dc-supply')[0] ?? c.of('battery')[0]
const srcV = (s: PlacedPart) => param(s, 'V')

/** Thevenin equivalent across two terminals of a part: V_oc and R_th from two solves. */
function thevenin(c: Ctx, part: PlacedPart, plus: string, minus: string, ov: SolveOverrides) {
  const s0 = solveCircuit(c.doc, c.topo, DC, ov)
  const voc = s0.parts[part.id].v[plus] - s0.parts[part.id].v[minus]
  const I = 1e-3
  const s1 = solveCircuit(c.doc, c.topo, DC, { ...ov, inject: [{ partId: part.id, plus, minus, amps: I }] })
  const v1 = s1.parts[part.id].v[plus] - s1.parts[part.id].v[minus]
  return { voc, rth: (v1 - voc) / I, sol: s0 }
}

function exOhm(c: Ctx) {
  const src = sourceOf(c)
  const r = c.of('resistor')[0]
  if (!c.check('parts', 'A source and a resistor are placed', !!src && !!r, src && r ? `${src.label} and ${r.label}` : 'Place a bench supply (or battery) and a resistor.')) return
  const s = c.solve(DC)
  const R = s.parts[r.id]
  const vr = R.v['1'] - R.v['2']
  c.check('loop', 'Current flows in a closed loop through the resistor', Math.abs(R.i) > 1e-6, `I = ${fmtI(R.i)}`)
  c.check('across', 'The resistor is connected across the source (full source voltage)', within(Math.abs(vr), srcV(src), 0.03), `V_R = ${fmtV(Math.abs(vr))} of ${fmtV(srcV(src))}`)
  c.check('ohm', 'Measured current agrees with Ohm’s law, I = V / R', Math.abs(R.i) > 1e-6 && within(Math.abs(R.i), Math.abs(vr) / param(r, 'R'), 0.01), `${fmtV(Math.abs(vr))} / ${param(r, 'R')} Ω = ${fmtI(Math.abs(vr) / param(r, 'R'))}`)
  c.check('power', 'Resistor power within its rating', Math.abs(R.p) <= param(r, 'Pmax'), `P = I²R = ${(Math.abs(R.p) * 1000).toFixed(0)} mW, rating ${param(r, 'Pmax')} W`)
  c.read('Current', fmtI(Math.abs(R.i)))
  c.read('Power in resistor', `${(Math.abs(R.p) * 1000).toFixed(1)} mW`)
}

function exLed(c: Ctx) {
  const led = c.of('led')[0]
  const src = sourceOf(c)
  if (!c.check('parts', 'A source, a resistor and an LED are placed', !!led && !!src && c.of('resistor').length > 0, 'Place a source, a resistor and an LED.')) return
  const s = c.solve(DC)
  const L = s.parts[led.id]
  c.check('forward', 'The LED is forward-biased (anode towards +)', L.state === 'conducting', L.state === 'conducting' ? `V_LED = ${fmtV(L.v.a - L.v.k)}` : `LED ${L.state}; V_AK = ${fmtV(L.v.a - L.v.k)}`)
  const series = c.of('resistor').find((r) => Math.abs(s.parts[r.id].i) > 1e-6 && within(Math.abs(s.parts[r.id].i), Math.abs(L.i), 0.01))
  c.check('series', 'A resistor limits the LED current (same current flows through both)', !!series, series ? `${series.label} carries ${fmtI(Math.abs(s.parts[series.id].i))}` : 'No resistor carries the LED current.')
  c.check('current', 'LED current is between 5 mA and 20 mA', L.i >= 5e-3 && L.i <= 20e-3, `I_LED = ${fmtI(L.i)}`, 2)
  c.read('LED current', fmtI(L.i))
  if (src) c.read('Resistor for 15 mA', `(${srcV(src)} V − ${param(led, 'Vf') + 0.15} V) / 15 mA ≈ ${Math.round((srcV(src) - param(led, 'Vf') - 0.15) / 0.015)} Ω`)
}

function exRc(c: Ctx) {
  const cap = c.of('electrolytic')[0] ?? c.of('capacitor')[0]
  const src = sourceOf(c)
  const sws = c.of('switch')
  if (!c.check('parts', 'Source, switch(es), resistor(s) and a capacitor are placed', !!cap && !!src && sws.length > 0 && c.of('resistor').length > 0, 'Place a source, at least one switch, resistors and a capacitor.')) return
  const plus = cap.type === 'electrolytic' ? '+' : '1'
  const minus = cap.type === 'electrolytic' ? '-' : '2'
  const C = param(cap, 'C') * 1e-6
  const combos = Array.from({ length: 1 << Math.min(sws.length, 3) }, (_, k) => Object.fromEntries(sws.slice(0, 3).map((s, i) => [s.id, { closed: (k >> i) & 1 }])))
  const evals = combos.map((states) => ({ states, ...thevenin(c, cap, plus, minus, { states }) }))
  for (const e of evals) c.blocking.push(...validateSolution(c.doc, c.topo, e.sol).filter((i) => i.severity === 'danger'))
  const V = srcV(src)
  const charge = evals.find((e) => e.voc > 0.9 * V && e.rth < 1e7)
  const discharge = evals.find((e) => Math.abs(e.voc) < 0.05 * V && e.rth < 1e7)
  const desc = (st: Record<string, { closed: number }>) => Object.entries(st).map(([id, s]) => `${c.doc.parts.find((p) => p.id === id)!.label} ${s.closed ? 'closed' : 'open'}`).join(', ')
  c.check('charge', 'A switch position charges the capacitor from the source through a resistor', !!charge && charge.rth >= 10, charge ? `${desc(charge.states)}: V_final = ${fmtV(charge.voc)}, R = ${charge.rth.toFixed(0)} Ω` : 'No switch position connects the capacitor to the source.', 2)
  c.check('polarity', 'Capacitor + terminal charges positive', !!charge && charge.voc > 0, charge ? `V(+) − V(−) = ${fmtV(charge.voc)}` : '—')
  c.check('discharge', 'A switch position discharges it through a resistor (not a dead short)', !!discharge && discharge.rth >= 10, discharge ? `${desc(discharge.states)}: R = ${discharge.rth.toFixed(0)} Ω` : 'No switch position gives the capacitor a discharge path.', 2)
  if (charge) {
    const tau = charge.rth * C
    c.read('Charge time constant τ = R·C', fmtT(tau))
    c.read('Charged to 99 % after 5τ', fmtT(5 * tau))
    c.curves.push({ label: 'Charging', tauS: tau, from: 0, to: charge.voc })
  }
  if (discharge && charge) {
    const tau = discharge.rth * C
    c.read('Discharge time constant', fmtT(tau))
    c.curves.push({ label: 'Discharging', tauS: tau, from: charge.voc, to: discharge.voc })
  }
}

function rectifierCore(c: Ctx) {
  const ac = c.of('ac-source')[0]
  const load = c.of('dc-load')[0]
  const diodes = c.of('diode')
  if (!c.check('parts', 'AC source, four diodes and a DC load are placed', !!ac && !!load && diodes.length >= 4, 'Place an AC source, four diodes and a DC load.')) return null
  const sp = c.solve(POS)
  const sn = c.solve(NEG)
  const ip = sp.parts[load.id].i
  const iN = sn.parts[load.id].i
  const vpk = param(ac, 'Vrms') * Math.SQRT2
  const vf = param(diodes[0], 'Vf')
  const vp = sp.parts[load.id].v['+'] - sp.parts[load.id].v['-']
  const vn = sn.parts[load.id].v['+'] - sn.parts[load.id].v['-']
  c.check('both', 'Load current flows on both half-cycles, in the same direction', ip > 1e-3 && iN > 1e-3, `positive half: ${fmtI(ip)}, negative half: ${fmtI(iN)}`, 2)
  c.check('level', 'Load voltage ≈ V_peak − 2·V_f on both half-cycles (full-wave)', within(vp, vpk - 2 * vf, 0.1) && within(vn, vpk - 2 * vf, 0.1), `${fmtV(vp)} / ${fmtV(vn)}; expected ≈ ${fmtV(vpk - 2 * vf)}`)
  const onP = diodes.filter((d) => sp.parts[d.id].state === 'conducting').map((d) => d.label)
  const onN = diodes.filter((d) => sn.parts[d.id].state === 'conducting').map((d) => d.label)
  c.check('pairs', 'Exactly two diodes conduct on each half-cycle, a different pair each time', onP.length === 2 && onN.length === 2 && !onP.some((x) => onN.includes(x)), `positive: ${onP.join(', ') || 'none'}; negative: ${onN.join(', ') || 'none'}`)
  c.read('Peak input', fmtV(vpk))
  c.read('Load voltage (peak)', fmtV(vp))
  return { ac, load, sp, sn, vp }
}

function exBridge(c: Ctx) {
  rectifierCore(c)
}

function exFilter(c: Ctx) {
  const core = rectifierCore(c)
  const cap = c.of('electrolytic')[0]
  if (!core) return
  if (!c.check('cap', 'An electrolytic capacitor is connected directly across the load', !!cap && [c.node(cap, '+'), c.node(cap, '-')].sort().join() === [c.node(core.load, '+'), c.node(core.load, '-')].sort().join(), cap ? `${cap.label} terminals on the load nodes` : 'Place an electrolytic capacitor across the load.')) return
  const pol = [core.sp, core.sn].every((s) => s.parts[cap!.id].v['+'] - s.parts[cap!.id].v['-'] > 0)
  c.check('polarity', 'Capacitor + is on the positive output on both half-cycles', pol, pol ? 'Correct polarity.' : 'Reversed: + must face the diode cathodes (positive output).')
  const iload = core.sp.parts[core.load.id].i
  const f = param(core.ac, 'f')
  const C = param(cap!, 'C') * 1e-6
  const ripple = iload / (2 * f * C)
  c.check('ripple', 'Ripple (approximation ΔV ≈ I / (2·f·C)) is at most 1.0 V', ripple <= 1.0, `ΔV ≈ ${fmtI(iload)} / (2 × ${f} Hz × ${param(cap!, 'C')} µF) = ${fmtV(ripple)}`, 2)
  c.check('rating', 'Capacitor voltage rating exceeds the peak output', param(cap!, 'Vmax') > core.vp, `${param(cap!, 'Vmax')} V rating vs ${fmtV(core.vp)} peak`)
  c.read('Estimated ripple (full-wave, approximation)', fmtV(ripple))
  c.read('Capacitance for 1 V ripple', `${Math.ceil((iload / (2 * f * 1.0)) * 1e6)} µF`)
}

function exMosfet(c: Ctx) {
  const src = sourceOf(c)
  const load = c.of('dc-load')[0]
  const r = c.roles.find((x) => x.sw.type === 'mosfet')
  if (!c.check('parts', 'Source, DC load, MOSFET and gate-drive signal are placed', !!src && !!load && !!r && c.of('gate-source').length > 0, 'Place a supply, a DC load, an N-channel MOSFET and a gate-drive signal.')) return
  const sw = r!.sw
  c.check('lowside', 'MOSFET is a low-side switch: source to supply −, drain to the load', r!.role === 'low' && [c.node(load, '+'), c.node(load, '-')].includes(c.node(sw, 'd')), `role: ${r!.role}`)
  c.check('driver', 'Gate is driven by the gate signal through a gate resistor', !!r!.driver && c.node(sw, 'g') !== c.node(r!.driver, '+'), r!.driver ? (c.node(sw, 'g') === c.node(r!.driver, '+') ? 'Driven directly: add a gate resistor (e.g. 10–100 Ω) to limit gate current and ringing.' : `${r!.driver.label} via gate resistor`) : 'No gate-drive signal reaches the gate.')
  c.check('ref', 'Gate drive REF is on the MOSFET source', !!r!.driver && c.node(r!.driver, '-') === c.node(sw, 's'), r!.driver ? 'REF checked against S.' : '—')
  if (!r!.driver) return
  const off = c.solve(DC, { states: gateStates(c.roles, []) })
  const on = c.solve(DC, { states: gateStates(c.roles, [sw]) })
  const iOff = Math.abs(off.parts[load.id].i)
  const iOn = Math.abs(on.parts[load.id].i)
  c.check('off', 'Gate low: load is off (< 1 mA)', iOff < 1e-3, `I_load = ${fmtI(iOff)}`)
  const expect = srcV(src) / (param(load, 'R') + param(sw, 'Ron'))
  c.check('on', 'Gate high: load is on at full current (within 5 %)', within(iOn, expect, 0.05), `I_load = ${fmtI(iOn)}, expected ≈ ${fmtI(expect)}`, 2)
  c.read('MOSFET on: V_DS', fmtV(on.parts[sw.id].v.d - on.parts[sw.id].v.s))
  c.read('Conduction loss I²·R_DS(on)', `${(iOn * iOn * param(sw, 'Ron') * 1000).toFixed(1)} mW`)
}

function exTransformer(c: Ctx) {
  const ac = c.of('ac-source')[0]
  const t = c.of('transformer')[0]
  const load = c.of('ac-load')[0]
  if (!c.check('parts', 'AC source, transformer and AC load are placed', !!ac && !!t && !!load, 'Place an AC source, a transformer and an AC load.')) return
  const pri = [c.node(t, 'p1'), c.node(t, 'p2')].sort().join()
  const sec = [c.node(t, 's1'), c.node(t, 's2')].sort().join()
  c.check('primary', 'AC source connected across the primary (P1–P2)', [c.node(ac, '1'), c.node(ac, '2')].sort().join() === pri && c.node(t, 'p1') !== c.node(t, 'p2'), 'Source terminals on P1 and P2.')
  c.check('secondary', 'Load connected across the secondary (S1–S2)', [c.node(load, '1'), c.node(load, '2')].sort().join() === sec && c.node(t, 's1') !== c.node(t, 's2'), 'Load terminals on S1 and S2.')
  const noDc = !c.doc.parts.some((p) => (p.type === 'battery' || p.type === 'dc-supply') && [c.node(p, '+'), c.node(p, '-')].some((n) => [c.node(t, 'p1'), c.node(t, 'p2'), c.node(t, 's1'), c.node(t, 's2')].includes(n)))
  c.check('nodc', 'No DC source connected to a winding', noDc, noDc ? 'Windings fed from AC only.' : 'A DC source touches a winding.')
  const iso = c.node(t, 's1') !== c.node(t, 'p1') && c.node(t, 's1') !== c.node(t, 'p2') && c.node(t, 's2') !== c.node(t, 'p1') && c.node(t, 's2') !== c.node(t, 'p2')
  c.check('iso', 'Primary and secondary stay isolated', iso, iso ? 'No connection between windings.' : 'A wire bridges primary and secondary.')
  const n = param(t, 'n')
  const sp = c.solve(POS)
  const sn = c.solve(NEG)
  const vsp = sp.parts[load.id].v['1'] - sp.parts[load.id].v['2']
  const vsn = sn.parts[load.id].v['1'] - sn.parts[load.id].v['2']
  const vpp = sp.parts[t.id].v.p1 - sp.parts[t.id].v.p2
  c.check('ratio', 'Secondary voltage = n × primary voltage on both half-cycles (within 3 %)', within(Math.abs(vsp), n * Math.abs(vpp), 0.03) && within(Math.abs(vsn), Math.abs(vsp), 0.03) && Math.sign(vsp) !== Math.sign(vsn), `V_p = ${fmtV(vpp)} → V_s = ${fmtV(vsp)} (n = ${n})`, 2)
  c.read('Secondary peak', fmtV(Math.abs(vsp)))
  c.read('Secondary rms', fmtV(Math.abs(vsp) / Math.SQRT2))
}

function legChecks(c: Ctx, expectLegs: number) {
  const legs = bridgeLegs(c.doc, c.topo)
  const bus = busNodes(c.doc, c.topo)
  const src = sourceOf(c)
  c.check('legs', `${expectLegs === 1 ? 'A half-bridge leg' : 'Two half-bridge legs'}: high-side drain on the DC bus +, low-side source on −, joined at the output`, legs.length >= expectLegs, `${legs.length} leg(s) found`, 2)
  const fuse = c.of('fuse').find((f) => src && [c.node(f, '1'), c.node(f, '2')].includes(c.node(src, '+')))
  const fuseFirst = !!fuse && legs.every((l) => c.node(l.high.sw, l.high.sw.type === 'mosfet' ? 'd' : 'c') !== c.node(src!, '+'))
  c.check('fuse', 'A fuse protects the DC bus (between the source + and the switches)', fuseFirst, fuse ? (fuseFirst ? `${fuse.label} at ${src!.label} +` : 'A switch connects to the source + before the fuse.') : 'No fuse at the source positive.')
  const drivers = legs.every((l) => l.high.driver && l.low.driver)
  c.check('drivers', 'Every switch has its own gate-drive signal', drivers, drivers ? 'All switches driven.' : 'A switch has no gate drive.')
  const floating = legs.every((l) => l.high.driver && c.node(l.high.driver, '-') === l.mid)
  c.check('float', 'High-side gate drives are floating: REF on the leg output (switch node)', floating, floating ? 'High-side REF on the output node.' : 'A high-side driver REF is not on its switch node, so V_GS would collapse as the output rises.')
  const lowRef = legs.every((l) => l.low.driver && bus.minus.has(c.node(l.low.driver, '-')))
  c.check('lowref', 'Low-side gate drives are referenced to the DC bus −', lowRef, lowRef ? 'Low-side REF on bus −.' : 'A low-side driver REF is not on bus −.')
  return { legs, bus, src }
}

function shootThroughDemo(c: Ctx, leg: { high: SwitchRole; low: SwitchRole }) {
  const s = c.solve(DC, { states: gateStates(c.roles, [leg.high.sw, leg.low.sw]) }, false)
  const found = validateSolution(c.doc, c.topo, s).some((i) => i.kind === 'shoot-through')
  c.read(`Demonstration: ${leg.high.sw.label} and ${leg.low.sw.label} on together`, found ? 'shoot-through detected (never allowed)' : 'no shoot-through detected')
}

function exHalf(c: Ctx) {
  const { legs, bus, src } = legChecks(c, 1)
  const load = c.of('dc-load')[0] ?? c.of('ac-load')[0]
  if (!legs.length || !src || !load) return
  const l = legs[0]
  const lt = load.type === 'dc-load' ? ['+', '-'] : ['1', '2']
  const ln = [c.node(load, lt[0]), c.node(load, lt[1])]
  c.check('load', 'Load connected between the leg output and a DC bus rail', ln.includes(l.mid) && ln.some((n) => bus.minus.has(n) || bus.plus.has(n)), 'Load from output to rail.')
  if (!l.high.driver || !l.low.driver) return
  const hi = c.solve(DC, { states: gateStates(c.roles, [l.high.sw]) })
  const lo = c.solve(DC, { states: gateStates(c.roles, [l.low.sw]) })
  const vneg = (s: Solution) => s.nodeVoltages[[...bus.minus][0]]
  const vh = hi.nodeVoltages[l.mid] - vneg(hi)
  const vl = lo.nodeVoltages[l.mid] - vneg(lo)
  c.check('high', 'High-side on: output ≈ V_bus', within(vh, srcV(src), 0.05), `V_out = ${fmtV(vh)}`, 2)
  c.check('low', 'Low-side on: output ≈ 0 V', Math.abs(vl) < 0.05 * srcV(src), `V_out = ${fmtV(vl)}`, 2)
  shootThroughDemo(c, l)
}

function hbridgeStates(c: Ctx, legs: ReturnType<typeof bridgeLegs>) {
  const [a, b] = legs
  const sa = c.solve(DC, { states: gateStates(c.roles, [a.high.sw, b.low.sw]) })
  const sb = c.solve(DC, { states: gateStates(c.roles, [b.high.sw, a.low.sw]) })
  return { a, b, sa, sb }
}

function exHbridge(c: Ctx) {
  const { legs, src } = legChecks(c, 2)
  const load = c.of('ac-load')[0] ?? c.of('dc-load')[0]
  if (legs.length < 2 || !src || !load) return
  const lt = load.type === 'dc-load' ? ['+', '-'] : ['1', '2']
  const ln = [c.node(load, lt[0]), c.node(load, lt[1])].sort().join()
  const { a, b, sa, sb } = hbridgeStates(c, legs)
  c.check('load', 'Load connected between the two leg outputs', ln === [a.mid, b.mid].sort().join(), 'Load across the bridge outputs.')
  if (!legs.every((l) => l.high.driver && l.low.driver)) return
  const va = sa.nodeVoltages[a.mid] - sa.nodeVoltages[b.mid]
  const vb = sb.nodeVoltages[a.mid] - sb.nodeVoltages[b.mid]
  const V = srcV(src)
  c.check('stateA', `${a.high.sw.label} + ${b.low.sw.label} on: load sees +V_bus`, within(va, V, 0.05), `V_load = ${fmtV(va)}`, 2)
  c.check('stateB', `${b.high.sw.label} + ${a.low.sw.label} on: load sees −V_bus (reversed)`, within(vb, -V, 0.05), `V_load = ${fmtV(vb)}`, 2)
  c.read('Output, state A / state B', `${fmtV(va)} / ${fmtV(vb)}`)
  shootThroughDemo(c, a)
}

function exInverter(c: Ctx) {
  const { legs, src } = legChecks(c, 2)
  const t = c.of('transformer')[0]
  const load = c.of('ac-load')[0]
  if (!c.check('parts2', 'Transformer and AC load are placed', !!t && !!load, 'Place a step-up transformer and an AC load.') || legs.length < 2 || !src) return
  const [a, b] = legs
  c.check('primary', 'Transformer primary across the bridge outputs', [c.node(t!, 'p1'), c.node(t!, 'p2')].sort().join() === [a.mid, b.mid].sort().join(), 'P1/P2 on the two leg outputs.')
  c.check('secondary', 'AC load across the secondary', [c.node(load!, '1'), c.node(load!, '2')].sort().join() === [c.node(t!, 's1'), c.node(t!, 's2')].sort().join() && c.node(t!, 's1') !== c.node(t!, 's2'), 'Load on S1/S2.')
  const protectedOk = !validateTopology(c.doc, c.topo).some((i) => i.kind === 'missing-protection')
  c.check('protect', 'Battery positive goes straight into the fuse', protectedOk, protectedOk ? 'Battery protected.' : 'Parts connect to the battery + before the fuse.')
  if (!legs.every((l) => l.high.driver && l.low.driver)) return
  const sa = c.solve(POS, { states: gateStates(c.roles, [a.high.sw, b.low.sw]) })
  const sb = c.solve(POS, { states: gateStates(c.roles, [b.high.sw, a.low.sw]) })
  const n = param(t!, 'n')
  const vsa = sa.parts[load!.id].v['1'] - sa.parts[load!.id].v['2']
  const vsb = sb.parts[load!.id].v['1'] - sb.parts[load!.id].v['2']
  const vpa = sa.parts[t!.id].v.p1 - sa.parts[t!.id].v.p2
  c.check('alternate', 'Secondary voltage reverses between the two switching states', Math.sign(vsa) !== Math.sign(vsb) && Math.abs(vsa) > 1 && within(Math.abs(vsb), Math.abs(vsa), 0.05), `${fmtV(vsa)} / ${fmtV(vsb)}`, 2)
  c.check('stepup', 'Secondary amplitude ≈ n × bridge output (within 3 %)', within(Math.abs(vsa), n * Math.abs(vpa), 0.03), `n = ${n}: ${fmtV(Math.abs(vpa))} → ${fmtV(Math.abs(vsa))}`)
  c.read('Square-wave output amplitude', fmtV(Math.abs(vsa)))
  c.read('Output rms (square wave: rms = peak)', fmtV(Math.abs(vsa)))
  c.read('Battery current, state A', fmtI(Math.abs(sa.parts[src.id].i)))
  shootThroughDemo(c, a)
}

const EVALUATORS: Record<string, (c: Ctx) => void> = {
  'ckt-01': exOhm,
  'ckt-02': exLed,
  'ckt-03': exRc,
  'ckt-04': exBridge,
  'ckt-05': exFilter,
  'ckt-06': exMosfet,
  'ckt-07': exTransformer,
  'ckt-08': exHalf,
  'ckt-09': exHbridge,
  'ckt-10': exInverter,
}

export function evaluateExercise(exerciseId: string, doc: CircuitDoc): ExerciseResult {
  const c = new Ctx(doc)
  EVALUATORS[exerciseId]?.(c)
  return c.result()
}

export const EVALUATED_EXERCISES = Object.keys(EVALUATORS)
