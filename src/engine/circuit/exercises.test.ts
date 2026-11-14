import { describe, expect, it } from 'vitest'
import { CIRCUIT_EXERCISES, CIRCUIT_EXERCISE_BY_ID } from '../../content/circuitExercises'
import { MODULE_BY_ID } from '../../content/modules'
import { circuit, cloneDoc } from './build'
import { evaluateExercise, EVALUATED_EXERCISES } from './exercises'
import { bridgeLegs, driverOf, switchRoles } from './roles'
import { buildTopology } from './topology'
import { analyseCircuit } from './validate'
import type { CircuitDoc } from './types'

const ref = (id: string) => cloneDoc(CIRCUIT_EXERCISE_BY_ID[id].reference)
const kinds = (d: CircuitDoc) => analyseCircuit(d).issues.map((i) => i.kind)
const failed = (id: string, d: CircuitDoc) => evaluateExercise(id, d).criteria.filter((c) => !c.passed).map((c) => c.id)
/** Replace the far end of the wire from `a` that currently goes to `oldB` with `newB`. */
function rewire(d: CircuitDoc, a: string, oldB: string, newB: string) {
  const [pa, ta] = [a.slice(0, a.indexOf('.')), a.slice(a.indexOf('.') + 1)]
  const [po, to] = [oldB.slice(0, oldB.indexOf('.')), oldB.slice(oldB.indexOf('.') + 1)]
  const [pn, tn] = [newB.slice(0, newB.indexOf('.')), newB.slice(newB.indexOf('.') + 1)]
  for (const w of d.wires) {
    for (const [x, y] of [['a', 'b'], ['b', 'a']] as const) {
      if (w[x].partId === pa && w[x].terminalId === ta && w[y].partId === po && w[y].terminalId === to) w[y] = { partId: pn, terminalId: tn }
    }
  }
  return d
}
const dropWire = (d: CircuitDoc, a: string, b: string) => {
  d.wires = d.wires.filter((w) => !([`${w.a.partId}.${w.a.terminalId}`, `${w.b.partId}.${w.b.terminalId}`].sort().join() === [a, b].sort().join()))
  return d
}
const addWire = (d: CircuitDoc, a: string, b: string) => {
  const i = a.indexOf('.')
  const j = b.indexOf('.')
  d.wires.push({ id: `x${d.wires.length}`, a: { partId: a.slice(0, i), terminalId: a.slice(i + 1) }, b: { partId: b.slice(0, j), terminalId: b.slice(j + 1) } })
  return d
}

describe('exercise content', () => {
  it('defines ten exercises matching the ten Circuit Lab lessons, each with an evaluator', () => {
    expect(CIRCUIT_EXERCISES.map((e) => e.id)).toEqual(MODULE_BY_ID['circuit-lab'].lessons.map((l) => l.id))
    for (const e of CIRCUIT_EXERCISES) {
      expect(EVALUATED_EXERCISES, e.id).toContain(e.id)
      expect(e.objectives.length).toBeGreaterThan(1)
      expect(e.steps.length).toBeGreaterThan(2)
      expect(e.expected.length).toBeGreaterThan(1)
      for (const p of e.reference.parts) expect(e.toolbox, `${e.id}: ${p.type} in toolbox`).toContain(p.type)
    }
  })

  it.each(CIRCUIT_EXERCISES.map((e) => [e.id, e.title] as const))('%s (%s): worked solution passes with no danger issues', (id) => {
    const r = evaluateExercise(id, ref(id))
    expect(r.criteria.filter((c) => !c.passed).map((c) => `${c.id}: ${c.detail}`)).toEqual([])
    expect(r.blocking.map((b) => b.title)).toEqual([])
    expect(r.passed).toBe(true)
    // A worked solution is also clean as built: no danger or warning issues at all.
    expect(analyseCircuit(ref(id)).issues.filter((i) => i.severity !== 'info').map((i) => i.title)).toEqual([])
  })

  it('starter circuits do not pass by themselves', () => {
    for (const e of CIRCUIT_EXERCISES) expect(evaluateExercise(e.id, cloneDoc(e.starter)).passed, e.id).toBe(false)
  })
})

describe('validation detects and explains faults', () => {
  it('battery short circuit is danger; supply short is protected by current limit', () => {
    const d = circuit().add('B1', 'battery', 0, 0).add('F1', 'fuse', 4, -2, 0, { Irated: 100 }).wire('B1.+', 'F1.1').wire('F1.2', 'B1.-').doc
    const issues = analyseCircuit(d).issues
    expect(issues.find((i) => i.kind === 'short-circuit')?.severity).toBe('danger')
    const s = addWire(ref('ckt-01'), 'PS1.+', 'PS1.-')
    expect(analyseCircuit(s).issues.find((i) => i.kind === 'short-circuit')?.severity).toBe('warning')
    expect(evaluateExercise('ckt-01', s).passed).toBe(false)
  })

  it('reversed LED: reverse-bias issue and the forward criterion fails', () => {
    const d = ref('ckt-02')
    rewire(d, 'R1.2', 'LED1.a', 'LED1.k')
    rewire(d, 'PS1.-', 'LED1.k', 'LED1.a')
    // R1.2 now on K; the wire LED1.k→PS1.- was rewritten so PS1.- connects to A.
    expect(kinds(d)).toContain('reverse-bias')
    expect(failed('ckt-02', d)).toContain('forward')
  })

  it('LED without a resistor: overcurrent danger blocks the exercise', () => {
    const d = ref('ckt-02')
    d.parts = d.parts.filter((p) => p.id !== 'R1')
    d.wires = d.wires.filter((w) => w.a.partId !== 'R1' && w.b.partId !== 'R1')
    addWire(d, 'PS1.+', 'LED1.a')
    expect(kinds(d)).toContain('overcurrent')
    const r = evaluateExercise('ckt-02', d)
    expect(r.passed).toBe(false)
    expect(r.blocking.some((b) => b.kind === 'overcurrent')).toBe(true)
  })

  it('reversed electrolytic in the RC circuit is a danger and blocks the pass', () => {
    const d = ref('ckt-03')
    for (const w of d.wires) for (const e of [w.a, w.b]) if (e.partId === 'C1') e.terminalId = e.terminalId === '+' ? '-' : '+'
    const r = evaluateExercise('ckt-03', d)
    expect(r.passed).toBe(false)
    expect(r.blocking.some((b) => b.kind === 'reverse-polarity')).toBe(true)
  })

  it('discharging through a bare switch (dead short) fails the discharge criterion', () => {
    const d = ref('ckt-03')
    dropWire(d, 'R2.2', 'C1.-')
    addWire(d, 'S2.2', 'C1.-')
    expect(failed('ckt-03', d)).toContain('discharge')
  })

  it('RC time constants are measured from the circuit: τ = R·C', () => {
    const r = evaluateExercise('ckt-03', ref('ckt-03'))
    const [charge, discharge] = r.curves!
    expect(charge.tauS).toBeCloseTo(1000 * 1000e-6, 2) // 1 kΩ × 1000 µF = 1 s (supply R negligible)
    expect(discharge.tauS).toBeCloseTo(2200 * 1000e-6, 2)
    expect(charge.to).toBeCloseTo(12, 1)
  })

  it('half-wave rectifier (only one diode path) fails the full-wave criterion', () => {
    const d = ref('ckt-04')
    // Keep all four diodes placed but disconnect D2 and D3: only one conduction path remains.
    d.wires = d.wires.filter((w) => !['D2', 'D3'].includes(w.a.partId) && !['D2', 'D3'].includes(w.b.partId))
    expect(failed('ckt-04', d)).toContain('both')
  })

  it('one rectifier diode reversed shorts the AC source on a half-cycle', () => {
    const d = ref('ckt-04')
    for (const w of d.wires) for (const e of [w.a, w.b]) if (e.partId === 'D3') e.terminalId = e.terminalId === 'a' ? 'k' : 'a'
    expect(kinds(d)).toContain('short-circuit')
    expect(evaluateExercise('ckt-04', d).passed).toBe(false)
  })

  it('filter capacitor too small fails the ripple criterion; the default value is not enough', () => {
    const d = ref('ckt-05')
    d.parts.find((p) => p.id === 'C1')!.params.C = 1000
    expect(failed('ckt-05', d)).toEqual(['ripple'])
  })

  it('MOSFET with drain and source swapped: body diode conducts and the load cannot be switched off', () => {
    const d = ref('ckt-06')
    for (const w of d.wires) for (const e of [w.a, w.b]) if (e.partId === 'Q1' && e.terminalId !== 'g') e.terminalId = e.terminalId === 'd' ? 's' : 'd'
    expect(kinds(d)).toContain('body-diode')
    expect(failed('ckt-06', d)).toEqual(expect.arrayContaining(['off']))
  })

  it('gate tied to the drain is flagged; gate without resistor fails the driver criterion', () => {
    const d = ref('ckt-06')
    addWire(d, 'Q1.g', 'Q1.d')
    expect(kinds(d)).toContain('gate-in-power-path')
    const e = ref('ckt-06')
    e.parts = e.parts.filter((p) => p.id !== 'RG1')
    e.wires = e.wires.filter((w) => w.a.partId !== 'RG1' && w.b.partId !== 'RG1')
    addWire(e, 'G1.+', 'Q1.g')
    expect(failed('ckt-06', e)).toEqual(['driver'])
  })

  it('DC supply on a transformer primary is a danger; bridging windings loses isolation', () => {
    const d = circuit().add('PS1', 'dc-supply', 0, 0).add('T1', 'transformer', 6, 0).add('LA1', 'ac-load', 12, 0).wire('PS1.+', 'T1.p1').wire('PS1.-', 'T1.p2').wire('T1.s1', 'LA1.1').wire('T1.s2', 'LA1.2').doc
    expect(analyseCircuit(d).issues.some((i) => i.kind === 'transformer-dc' || (i.kind === 'short-circuit' && i.parts.includes('PS1')))).toBe(true)
    const e = addWire(ref('ckt-07'), 'T1.p2', 'T1.s2')
    expect(kinds(e)).toContain('isolation-bridged')
    expect(failed('ckt-07', e)).toContain('iso')
  })

  it('high-side gate drive referenced to ground is explained and fails the floating-drive criterion', () => {
    const d = ref('ckt-08')
    rewire(d, 'G1.-', 'Q1.s', 'PS1.-')
    expect(kinds(d)).toContain('gate-reference')
    expect(failed('ckt-08', d)).toContain('float')
  })

  it('missing fuse fails the protection criteria', () => {
    const d = ref('ckt-10')
    dropWire(d, 'B1.+', 'F1.1')
    addWire(d, 'B1.+', 'F1.2')
    d.parts = d.parts.filter((p) => p.id !== 'F1')
    d.wires = d.wires.filter((w) => w.a.partId !== 'F1' && w.b.partId !== 'F1')
    addWire(d, 'B1.+', 'Q1.d')
    addWire(d, 'B1.+', 'Q3.d')
    expect(kinds(d)).toContain('missing-protection')
    expect(failed('ckt-10', d)).toEqual(expect.arrayContaining(['fuse', 'protect']))
  })

  it('shoot-through is detected when both switches of a leg conduct', () => {
    const d = ref('ckt-09')
    for (const g of ['G1', 'G2']) d.parts.find((p) => p.id === g)!.states.level = 1
    const issues = analyseCircuit(d).issues
    expect(issues.find((i) => i.kind === 'shoot-through')?.severity).toBe('danger')
    const r = evaluateExercise('ckt-09', ref('ckt-09'))
    expect(r.readings.find((x) => x.label.startsWith('Demonstration'))?.value).toMatch(/shoot-through detected/)
  })

  it('inverter output is flagged as hazardous (simulated) at about 120 V', () => {
    const d = ref('ckt-10')
    for (const g of ['G1', 'G4']) d.parts.find((p) => p.id === g)!.states.level = 1
    const hv = analyseCircuit(d).issues.find((i) => i.id === 'hv:nodes')
    expect(hv?.severity).toBe('warning')
  })

  it('an overloaded bench supply is reported as being in current limit, not as a short', () => {
    const d = circuit().add('PS1', 'dc-supply', 0, 0, 0, { V: 12, Ilim: 0.1 }).add('R1', 'resistor', 4, -2, 0, { R: 60, Pmax: 50 }).wire('PS1.+', 'R1.1').wire('R1.2', 'PS1.-').doc
    const issues = analyseCircuit(d).issues
    expect(issues.find((i) => i.kind === 'current-limit')?.severity).toBe('warning')
    expect(issues.some((i) => i.kind === 'short-circuit')).toBe(false)
  })

  it('open circuit and unconnected terminals are reported', () => {
    const d = circuit().add('PS1', 'dc-supply', 0, 0).add('R1', 'resistor', 4, -2).add('R2', 'resistor', 8, -2).wire('PS1.+', 'R1.1').wire('R1.2', 'R2.1').wire('R2.2', 'PS1.-').doc
    dropWire(d, 'R2.2', 'PS1.-')
    expect(kinds(d)).toEqual(expect.arrayContaining(['unconnected', 'open-circuit']))
  })
})

describe('topological roles', () => {
  it('finds drivers through gate resistors, high/low sides and both H-bridge legs', () => {
    const d6 = ref('ckt-06')
    const t6 = buildTopology(d6)
    expect(driverOf(d6, t6, d6.parts.find((p) => p.id === 'Q1')!)?.id).toBe('G1')
    const d9 = ref('ckt-09')
    const t9 = buildTopology(d9)
    const roles = Object.fromEntries(switchRoles(d9, t9).map((r) => [r.sw.id, r.role]))
    expect(roles).toEqual({ Q1: 'high', Q2: 'low', Q3: 'high', Q4: 'low' })
    expect(bridgeLegs(d9, t9).map((l) => `${l.high.sw.id}/${l.low.sw.id}`).sort()).toEqual(['Q1/Q2', 'Q3/Q4'])
  })
})

