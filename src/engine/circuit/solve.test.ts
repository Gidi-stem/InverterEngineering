import { describe, expect, it } from 'vitest'
import { circuit } from './build'
import { solveCircuit } from './solve'
import { buildTopology, connected, nodeOfTerminal } from './topology'
import type { CircuitDoc, SimMode } from './types'

const DC: SimMode = { kind: 'dc' }
const run = (doc: CircuitDoc, mode: SimMode = DC, ov = {}) => solveCircuit(doc, buildTopology(doc), mode, ov)
const rel = (a: number, b: number) => Math.abs(a - b) / Math.abs(b)

describe('topology', () => {
  it('merges wired terminals into nodes and uses the ground part as reference', () => {
    const d = circuit().add('B1', 'battery', 0, 0).add('R1', 'resistor', 3, -2).add('G', 'ground', 0, 3).wire('B1.+', 'R1.1').wire('R1.2', 'B1.-').wire('B1.-', 'G.gnd').doc
    const t = buildTopology(d)
    expect(t.nodes).toHaveLength(2)
    expect(t.referenceNode).toBe(nodeOfTerminal(t, 'B1', '-'))
    expect(t.nodes[t.referenceNode!].isGround).toBe(true)
    expect(connected(d, t, nodeOfTerminal(t, 'R1', '1'), nodeOfTerminal(t, 'R1', '2'), { partId: 'R1', path: ['1', '2'] })).toBe(true)
  })

  it('ignores wires to missing parts', () => {
    const d = circuit().add('R1', 'resistor', 0, 0).doc
    d.wires.push({ id: 'x', a: { partId: 'R1', terminalId: '1' }, b: { partId: 'nope', terminalId: '1' } })
    expect(buildTopology(d).nodes).toHaveLength(2)
  })
})

describe('MNA solver against hand calculations', () => {
  it('battery + resistor: I = V / (R + Rint)', () => {
    const d = circuit().add('B1', 'battery', 0, 0, 0, { V: 12, Rint: 0.05 }).add('R1', 'resistor', 3, -2, 0, { R: 100 }).wire('B1.+', 'R1.1').wire('R1.2', 'B1.-').doc
    const s = run(d)
    expect(s.ok).toBe(true)
    expect(rel(s.parts.R1.i, 12 / 100.05)).toBeLessThan(1e-6)
    expect(rel(s.parts.B1.i, 12 / 100.05)).toBeLessThan(1e-6)
    expect(rel(s.parts.R1.p, (12 / 100.05) ** 2 * 100)).toBeLessThan(1e-6)
  })

  it('voltage divider 10 kΩ / 10 kΩ from a 12 V supply gives 6 V', () => {
    const d = circuit().add('PS', 'dc-supply', 0, 0).add('R1', 'resistor', 3, -2, 0, { R: 10_000 }).add('R2', 'resistor', 3, 2, 0, { R: 10_000 }).wire('PS.+', 'R1.1').wire('R1.2', 'R2.1').wire('R2.2', 'PS.-').doc
    const s = run(d)
    expect(s.parts.R1.v['2']).toBeCloseTo(6, 3)
  })

  it('LED with series resistor: I = (V − V_f) / (R + R_d)', () => {
    const d = circuit().add('B1', 'battery', 0, 0, 0, { V: 9, Rint: 0.05 }).add('R1', 'resistor', 3, -2, 0, { R: 470 }).add('L1', 'led', 6, 0).wire('B1.+', 'R1.1').wire('R1.2', 'L1.a').wire('L1.k', 'B1.-').doc
    const s = run(d)
    expect(s.parts.L1.state).toBe('conducting')
    expect(rel(s.parts.L1.i, (9 - 1.8) / (470 + 10 + 0.05))).toBeLessThan(1e-6)
  })

  it('reversed LED blocks: microamp leakage only', () => {
    const d = circuit().add('B1', 'battery', 0, 0, 0, { V: 9 }).add('R1', 'resistor', 3, -2, 0, { R: 470 }).add('L1', 'led', 6, 0).wire('B1.+', 'R1.1').wire('R1.2', 'L1.k').wire('L1.a', 'B1.-').doc
    const s = run(d)
    expect(s.parts.L1.state).toBe('off')
    expect(Math.abs(s.parts.L1.i)).toBeLessThan(1e-7)
  })

  it('bench supply enters current limit: 12 V, 1 A limit into 2 Ω gives 1 A at 2 V', () => {
    const d = circuit().add('PS', 'dc-supply', 0, 0, 0, { V: 12, Ilim: 1 }).add('R1', 'resistor', 3, -2, 0, { R: 2 }).wire('PS.+', 'R1.1').wire('R1.2', 'PS.-').doc
    const s = run(d)
    expect(s.parts.PS.state).toBe('current limit')
    expect(s.parts.R1.i).toBeCloseTo(1, 6)
    expect(s.parts.PS.v['+'] - s.parts.PS.v['-']).toBeCloseTo(2, 4)
  })

  it('ideal transformer in AC snapshot: V_s = n·V_p with the load reflected as R/n²', () => {
    const d = circuit().add('AC', 'ac-source', 0, 0, 0, { Vrms: 12 }).add('T1', 'transformer', 4, 0, 0, { n: 0.5 }).add('LA', 'ac-load', 8, 0, 0, { R: 100 }).wire('AC.1', 'T1.p1').wire('AC.2', 'T1.p2').wire('T1.s1', 'LA.1').wire('T1.s2', 'LA.2').doc
    const vpk = 12 * Math.SQRT2
    const vp = (vpk * 400) / 400.1
    for (const pol of [1, -1] as const) {
      const s = run(d, { kind: 'ac-snapshot', polarity: pol })
      expect(rel(s.parts.LA.v['1'] - s.parts.LA.v['2'], pol * 0.5 * vp)).toBeLessThan(1e-6)
      expect(rel(s.parts.T1.extra!.secondary, (-pol * 0.5 * vp) / 100)).toBeLessThan(1e-6)
    }
  })

  it('MOSFET low-side switch follows its gate', () => {
    const d = circuit()
      .add('B1', 'battery', 0, 0, 0, { V: 12, Rint: 0.05 })
      .add('LD', 'dc-load', 5, -1, 0, { R: 24 })
      .add('Q1', 'mosfet', 4, 4)
      .add('G1', 'gate-source', 0, 6)
      .wire('B1.+', 'LD.+').wire('LD.-', 'Q1.d').wire('Q1.s', 'B1.-').wire('G1.+', 'Q1.g').wire('G1.-', 'Q1.s').doc
    const off = run(d)
    expect(off.parts.Q1.state).toBe('off')
    expect(Math.abs(off.parts.LD.i)).toBeLessThan(1e-6)
    const on = run(d, DC, { states: { G1: { level: 1 } } })
    expect(on.parts.Q1.state).toBe('on')
    expect(rel(on.parts.LD.i, 12 / (24 + 0.05 + 0.05))).toBeLessThan(1e-6)
  })

  it('bridge rectifier keeps load polarity on both half-cycles', () => {
    const d = circuit()
      .add('AC', 'ac-source', 0, 0, 0, { Vrms: 12 })
      .add('D1', 'diode', 4, -3).add('D2', 'diode', 4, 3).add('D3', 'diode', 8, -3).add('D4', 'diode', 8, 3)
      .add('LD', 'dc-load', 12, 0, 0, { R: 100 })
      // AC.1 → D1.a, D3.k ; AC.2 → D2.a, D4.k ; D1.k, D2.k → + ; D3.a, D4.a → −
      .wire('AC.1', 'D1.a').wire('AC.1', 'D3.k').wire('AC.2', 'D2.a').wire('AC.2', 'D4.k')
      .wire('D1.k', 'LD.+').wire('D2.k', 'LD.+').wire('D3.a', 'LD.-').wire('D4.a', 'LD.-').doc
    const vpk = 12 * Math.SQRT2
    for (const pol of [1, -1] as const) {
      const s = run(d, { kind: 'ac-snapshot', polarity: pol })
      expect(s.parts.LD.i).toBeGreaterThan(0)
      // Two diode drops (0.7 V knee + R_d) and 0.1 Ω source resistance.
      const i = (vpk - 1.4) / (100 + 0.1 + 0.1)
      expect(rel(s.parts.LD.i, i)).toBeLessThan(1e-4)
      const on = ['D1', 'D2', 'D3', 'D4'].filter((x) => s.parts[x].state === 'conducting')
      expect(on).toEqual(pol === 1 ? ['D1', 'D4'] : ['D2', 'D3'])
    }
  })

  it('relay pulls in with rated coil voltage and moves COM to NO', () => {
    const d = circuit()
      .add('B1', 'battery', 0, 0, 0, { V: 12 })
      .add('K1', 'relay', 5, 0)
      .add('LD', 'dc-load', 10, 0)
      .wire('B1.+', 'K1.a1').wire('K1.a2', 'B1.-').wire('B1.+', 'K1.com').wire('K1.no', 'LD.+').wire('LD.-', 'B1.-').doc
    const s = run(d)
    expect(s.parts.K1.state).toMatch(/energised/)
    expect(s.parts.LD.i).toBeGreaterThan(0.45)
  })

  it('is deterministic', () => {
    const d = circuit().add('B1', 'battery', 0, 0).add('R1', 'resistor', 3, -2).wire('B1.+', 'R1.1').wire('R1.2', 'B1.-').doc
    expect(run(d)).toEqual(run(d))
  })
})
