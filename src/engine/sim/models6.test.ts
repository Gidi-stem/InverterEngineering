import { describe, expect, it } from 'vitest'
import { SIM_EXPERIMENT_BY_ID } from '../../content/simExperiments'
import { circuit, cloneDoc } from '../circuit/build'
import { solveCircuit } from '../circuit/solve'
import { buildTopology } from '../circuit/topology'
import { measure } from './analysis'
import { recordRun } from './record'
import { TransientSim } from './transient'

const rel = (a: number, b: number) => Math.abs(a - b) / Math.abs(b)
const pwm = (invert: number) => ({ params: { Vhigh: 12, f: 50, duty: 50, phase: 0, td: 0 }, states: { mode: 1, level: 0, invert } })

describe('Phase 6 models', () => {
  it('centre-tapped transformer push-pull: ±n·V_half square output, off-switch stress 2·V_dc', () => {
    const d = circuit()
      .add('B1', 'battery', 0, 10, 0, { V: 12, Rint: 0.01 })
      .add('T1', 'transformer-ct', 10, 10, 0, { n: 10, Rw: 0.01, Lm: 1 })
      .add('Q1', 'mosfet', 6, 18, 0, { Ron: 0.01 })
      .add('Q2', 'mosfet', 14, 18, 0, { Ron: 0.01 })
      .add('G1', 'gate-source', 2, 22, 0, pwm(0).params, pwm(0).states)
      .add('G2', 'gate-source', 10, 22, 0, pwm(1).params, pwm(1).states)
      .add('LA1', 'ac-load', 18, 10, 0, { R: 100 })
      .add('GND1', 'ground', 0, 16)
      .wire('B1.+', 'T1.pc').wire('T1.p1', 'Q1.d').wire('T1.p2', 'Q2.d').wire('Q1.s', 'B1.-').wire('Q2.s', 'B1.-')
      .wire('G1.+', 'Q1.g').wire('G1.-', 'Q1.s').wire('G2.+', 'Q2.g').wire('G2.-', 'Q2.s').wire('T1.s1', 'LA1.1').wire('T1.s2', 'LA1.2').wire('B1.-', 'GND1.gnd').doc
    const r = recordRun(d, 0.1, ['V:LA1', 'V:Q1', 'V:Q2'], 0.06)
    expect(r.error).toBeUndefined()
    const v = measure(r.traces['V:LA1'], r.h)
    expect(rel(v.freq!, 50)).toBeLessThan(5e-3)
    // Ideal: |V_s| = n·V_half with V_half ≈ 12 V less the drops (load 100 Ω → 1.2 A secondary, 12 A primary).
    const ideal = 10 * 12
    expect(rel(v.max, ideal)).toBeLessThan(0.05)
    expect(rel(-v.min, v.max)).toBeLessThan(0.01)
    // When Q2 conducts, the other half-winding adds another V_half: V_DS(Q1) ≈ 2·V_dc.
    expect(rel(measure(r.traces['V:Q1'], r.h).max, 24)).toBeLessThan(0.05)
  })

  it('regulated SPWM: the output settles on the voltage-sensor set-point from a wrong starting index', () => {
    const base = cloneDoc(SIM_EXPERIMENT_BY_ID['sim-10'].circuit)
    for (const p of base.parts) if (p.type === 'gate-source') {
      p.states.mode = 3
      p.params.m = 0.5
    }
    base.parts.push({ id: 'VS1', type: 'vsense', label: 'VS1', x: 66, y: 17, rotation: 0, params: { Vset: 13 }, states: {} })
    base.wires.push({ id: 'wv1', a: { partId: 'VS1', terminalId: '+' }, b: { partId: 'LA1', terminalId: '1' } }, { id: 'wv2', a: { partId: 'VS1', terminalId: '-' }, b: { partId: 'LA1', terminalId: '2' } })
    const s = TransientSim.fromDoc(base) as TransientSim
    s.run(Math.round(0.3 / s.h))
    expect(Math.abs(s.regLast! - 13) / 13).toBeLessThan(0.02)
    expect(s.regM).toBeGreaterThan(0.6)
    expect(s.regM).toBeLessThan(0.9)
  })

  it('PV array: I_sc below the knee, the knee line above it; matches the steady-state solver', () => {
    const run = (R: number) => {
      const d = circuit().add('PV1', 'pv-array', 0, 0, 0, { Voc: 44, Isc: 10 }).add('R1', 'resistor', 4, -2, 0, { R, Pmax: 50 }).add('GND1', 'ground', 0, 4)
        .wire('PV1.+', 'R1.1').wire('R1.2', 'PV1.-').wire('PV1.-', 'GND1.gnd').doc
      const r = recordRun(d, 1e-3, ['V:R1', 'I:PV1'], 1e-4)
      const p4 = solveCircuit(d, buildTopology(d), { kind: 'dc' }).parts.R1
      return { v: r.traces['V:R1'].at(-1)!, i: r.traces['I:PV1'].at(-1)!, p4: p4.v['1'] - p4.v['2'] }
    }
    const a = run(2)
    expect(rel(a.i, 10)).toBeLessThan(1e-3)
    expect(rel(a.v, 20)).toBeLessThan(1e-3)
    const b = run(10) // I = 10 − (10·I − 35.2)/0.88  ⇒  I = 50/12.364 = 4.044 A
    expect(rel(b.i, 50 / (1 + 10 / 0.88))).toBeLessThan(2e-3)
    expect(rel(b.v, b.p4)).toBeLessThan(1e-3)
  })
})
