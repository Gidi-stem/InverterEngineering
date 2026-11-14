import { describe, expect, it } from 'vitest'
import { circuit } from '../circuit/build'
import { solveCircuit } from '../circuit/solve'
import { buildTopology } from '../circuit/topology'
import type { CircuitDoc } from '../circuit/types'
import { acSweep } from './ac'
import { measure, spectrum, timeConstant } from './analysis'
import { TransientSim } from './transient'

function sim(doc: CircuitDoc, h?: number) {
  const s = TransientSim.fromDoc(doc, { h })
  if ('error' in s) throw new Error(s.error)
  return s
}
/** Run for `seconds`, recording the named signals every step. */
function record(s: TransientSim, seconds: number, keys: string[]) {
  const idx = keys.map((k) => {
    const j = s.signals.findIndex((x) => x.key === k)
    if (j < 0) throw new Error(`no signal ${k}: ${s.signals.map((x) => x.key).join(', ')}`)
    return j
  })
  const n = Math.round(seconds / s.h)
  const out = keys.map(() => new Float64Array(n))
  const buf = new Float64Array(s.signals.length)
  for (let k = 0; k < n; k++) {
    if (!s.step()) break
    s.values(buf)
    idx.forEach((j, c) => (out[c][k] = buf[j]))
  }
  return out
}
const rel = (a: number, b: number) => Math.abs(a - b) / Math.abs(b)

const gen = (mode: number, extra: Record<string, number> = {}, states: Record<string, number> = {}) => ({ params: { Vhigh: 12, f: 1000, duty: 50, phase: 0, fm: 50, m: 0.9, td: 0, ...extra }, states: { mode, level: 0, invert: 0, ...states } })

describe('transient engine: DC and first-order circuits', () => {
  it('DC steady state equals the hand calculation and the Phase 4 operating point', () => {
    const d = circuit().add('B1', 'battery', 0, 0, 0, { V: 12, Rint: 0.05 }).add('R1', 'resistor', 4, -2, 0, { R: 100 }).add('R2', 'resistor', 8, -2, 0, { R: 200 }).add('GND1', 'ground', 0, 4)
      .wire('B1.+', 'R1.1').wire('R1.2', 'R2.1').wire('R2.2', 'B1.-').wire('B1.-', 'GND1.gnd').doc
    const [v2] = record(sim(d, 1e-5), 1e-3, ['V:R2'])
    const expected = (12 * 200) / (300 + 0.05) // independent: voltage divider including Rint
    expect(rel(v2[v2.length - 1], expected)).toBeLessThan(1e-6)
    const p4 = solveCircuit(d, buildTopology(d), { kind: 'dc' }).parts.R2
    expect(rel(v2[v2.length - 1], p4.v['1'] - p4.v['2'])).toBeLessThan(1e-6)
  })

  it('RC charging: v(τ) = 63.2 %, measured τ = RC, energy delivered = C·V·v(t)', () => {
    const R = 1000
    const C = 10e-6
    const d = circuit().add('PS1', 'dc-supply', 0, 0, 0, { V: 10, Ilim: 5 }).add('R1', 'resistor', 4, -2, 0, { R }).add('C1', 'capacitor', 8, 0, 90, { C: 10 }).add('GND1', 'ground', 0, 4)
      .wire('PS1.+', 'R1.1').wire('R1.2', 'C1.1').wire('C1.2', 'PS1.-').wire('PS1.-', 'GND1.gnd').doc
    const s = sim(d, 10e-6)
    const tau = (R + 0.01) * C // supply output resistance 10 mΩ in series
    const [vc] = record(s, 5 * tau, ['V:C1'])
    const at = (t: number) => vc[Math.round(t / s.h) - 1]
    expect(rel(at(tau), 10 * (1 - Math.exp(-1)))).toBeLessThan(2e-3)
    expect(rel(at(5 * tau), 10 * (1 - Math.exp(-5)))).toBeLessThan(1e-3)
    const measured = timeConstant([0, ...vc], s.h, 0, vc.length + 1, 10)!
    expect(rel(measured, tau)).toBeLessThan(5e-3)
    const e = s.energy()
    const vEnd = vc[vc.length - 1]
    expect(rel(e.delivered, C * 10 * vEnd)).toBeLessThan(5e-3)
    expect(rel(e.stored, 0.5 * C * vEnd * vEnd)).toBeLessThan(1e-9)
    expect(Math.abs(e.error) / e.delivered).toBeLessThan(5e-3)
  })

  it('RL response: i(τ) = 63.2 % of V/R with τ = L/R', () => {
    const d = circuit().add('PS1', 'dc-supply', 0, 0, 0, { V: 10, Ilim: 5 }).add('R1', 'resistor', 4, -2, 0, { R: 100 }).add('L1', 'inductor', 8, 0, 90, { L: 100, Rdc: 0.1 }).add('GND1', 'ground', 0, 4)
      .wire('PS1.+', 'R1.1').wire('R1.2', 'L1.1').wire('L1.2', 'PS1.-').wire('PS1.-', 'GND1.gnd').doc
    const s = sim(d, 5e-6)
    const Rt = 100 + 0.1 + 0.01
    const tau = 0.1 / Rt
    const iInf = 10 / Rt
    const [il] = record(s, 6 * tau, ['I:L1'])
    expect(rel(il[Math.round(tau / s.h) - 1], iInf * (1 - Math.exp(-1)))).toBeLessThan(2e-3)
    expect(rel(il[il.length - 1], iInf * (1 - Math.exp(-6)))).toBeLessThan(1e-3)
    expect(Math.abs(s.energy().error) / s.energy().delivered).toBeLessThan(5e-3)
  })

  it('a step-size halving changes the RC result by less than 0.1 % (convergence)', () => {
    const d = circuit().add('PS1', 'dc-supply', 0, 0, 0, { V: 10 }).add('R1', 'resistor', 4, -2, 0, { R: 1000 }).add('C1', 'capacitor', 8, 0, 90, { C: 10 }).add('GND1', 'ground', 0, 4)
      .wire('PS1.+', 'R1.1').wire('R1.2', 'C1.1').wire('C1.2', 'PS1.-').wire('PS1.-', 'GND1.gnd').doc
    const a = record(sim(d, 20e-6), 0.01, ['V:C1'])[0]
    const b = record(sim(d, 10e-6), 0.01, ['V:C1'])[0]
    expect(rel(a[a.length - 1], b[b.length - 1])).toBeLessThan(1e-3)
  })
})

describe('transient engine: energy conservation', () => {
  it('LC tank: the trapezoidal rule adds no numerical damping (energy follows the resistive decay e^(−Rt/L))', () => {
    // Charge C1 from the supply, then open S1 and close S2 to connect L1 across C1 (live update).
    const base = () =>
      circuit()
        .add('PS1', 'dc-supply', 0, 0, 0, { V: 10 })
        .add('S1', 'switch', 4, -2, 0, {}, { closed: 1 })
        .add('C1', 'capacitor', 8, 0, 90, { C: 100 })
        .add('S2', 'switch', 12, -2, 0, {}, { closed: 0 })
        .add('L1', 'inductor', 16, 0, 90, { L: 10, Rdc: 0.001 })
        .add('GND1', 'ground', 0, 4)
        .wire('PS1.+', 'S1.1').wire('S1.2', 'C1.1').wire('C1.2', 'PS1.-').wire('C1.1', 'S2.1').wire('S2.2', 'L1.1').wire('L1.2', 'C1.2').wire('PS1.-', 'GND1.gnd').doc
    const d = base()
    const s = sim(d, 5e-6)
    s.run(400)
    const d2 = base()
    d2.parts.find((p) => p.id === 'S1')!.states.closed = 0
    d2.parts.find((p) => p.id === 'S2')!.states.closed = 1
    expect(s.update(d2)).toBe(true)
    s.run(10) // pass the backward-Euler restart steps
    const e0 = s.energy().stored
    const err0 = s.energy().error
    const T = 2 * Math.PI * Math.sqrt(0.01 * 100e-6)
    const t0 = s.t
    s.run(Math.round((10 * T) / s.h))
    const Rloop = 0.001 + 1e-3 // inductor R_dc + closed-switch resistance
    const expected = e0 * Math.exp((-Rloop * (s.t - t0)) / 0.01)
    expect(rel(s.energy().stored, expected)).toBeLessThan(2e-3)
    // The energy error (fixed by the near-instant initial charge, τ ≈ 1 µs < h) must not grow while it oscillates.
    expect(Math.abs(s.energy().error - err0) / e0).toBeLessThan(1e-5)
  })
})

describe('transient engine: rectification, PWM and switching', () => {
  it('bridge rectifier: 100 Hz output, peak = V_pk − 2 V_f (less R_d drops), never negative', () => {
    const d = circuit()
      .add('AC1', 'ac-source', 0, 0, 0, { Vrms: 12, f: 50 })
      .add('D1', 'diode', 6, -4).add('D2', 'diode', 6, -2).add('D3', 'diode', 6, 2).add('D4', 'diode', 6, 4)
      .add('LD1', 'dc-load', 14, 0, 0, { R: 100 })
      .wire('AC1.1', 'D1.a').wire('AC1.1', 'D3.k').wire('AC1.2', 'D2.a').wire('AC1.2', 'D4.k').wire('D1.k', 'LD1.+').wire('D2.k', 'LD1.+').wire('D3.a', 'LD1.-').wire('D4.a', 'LD1.-').doc
    const s = sim(d)
    const [v] = record(s, 0.06, ['V:LD1'])
    const m = measure(v, s.h)
    const vpk = 12 * Math.SQRT2
    const expectedPeak = ((vpk - 1.4) * 100) / (100 + 2 * 0.05 + 0.1)
    expect(rel(m.freq!, 100)).toBeLessThan(5e-3)
    expect(rel(m.max, expectedPeak)).toBeLessThan(2e-3)
    expect(m.min).toBeGreaterThan(-0.01)
  })

  it('PWM generator: measured frequency, duty and mean match the settings', () => {
    const d = circuit().add('G1', 'gate-source', 0, 0, 0, gen(1, { duty: 25 }).params, gen(1).states).add('R1', 'resistor', 4, -2, 0, { R: 1000 }).wire('G1.+', 'R1.1').wire('R1.2', 'G1.-').doc
    const s = sim(d)
    expect(s.h).toBeLessThanOrEqual(1 / (200 * 1000))
    const [v] = record(s, 0.01, ['V:R1'])
    const m = measure(v, s.h)
    expect(rel(m.freq!, 1000)).toBeLessThan(1e-3)
    expect(Math.abs(m.duty! - 0.25)).toBeLessThan(0.006)
    expect(rel(m.mean, 0.25 * 12 * (1000 / 1010))).toBeLessThan(5e-3)
  })

  it('dead time delays each turn-on edge and shortens the pulse by t_d', () => {
    const d = circuit().add('G1', 'gate-source', 0, 0, 0, gen(1, { duty: 50, td: 50 }).params, gen(1).states).add('R1', 'resistor', 4, -2, 0, { R: 1000 }).wire('G1.+', 'R1.1').wire('R1.2', 'G1.-').doc
    const s = sim(d, 1e-6)
    const [v] = record(s, 0.005, ['V:R1'])
    expect(Math.abs(measure(v, s.h).duty! - (0.5 - 50e-6 / 1e-3))).toBeLessThan(0.003)
  })

  it('MOSFET low-side switch: load current follows the gate, V_DS(on) = I·R_DS(on), losses match hand values', () => {
    const d = circuit()
      .add('PS1', 'dc-supply', 0, 0, 0, { V: 12, Ilim: 5 })
      .add('LD1', 'dc-load', 8, -6, 0, { R: 24 })
      .add('Q1', 'mosfet', 8, 4, 0, { Ron: 0.05, tsw: 100 })
      .add('G1', 'gate-source', 2, 8, 0, gen(1, { f: 1000, duty: 50 }).params, gen(1).states)
      .add('GND1', 'ground', 0, 6)
      .wire('PS1.+', 'LD1.+').wire('LD1.-', 'Q1.d').wire('Q1.s', 'PS1.-').wire('G1.+', 'Q1.g').wire('G1.-', 'Q1.s').wire('PS1.-', 'GND1.gnd').doc
    const s = sim(d)
    const [id, vds] = record(s, 0.01, ['I:Q1', 'V:Q1'])
    const Ion = 12 / (24 + 0.05 + 0.01)
    expect(rel(measure(id, s.h).max, Ion)).toBeLessThan(1e-3)
    expect(rel(measure(id, s.h).mean, 0.5 * Ion)).toBeLessThan(1e-2)
    const onIdx = id.findIndex((x) => x > 0.4)
    expect(rel(vds[onIdx], Ion * 0.05)).toBeLessThan(1e-3)
    const L = s.switchLosses()[0]
    expect(L.edges).toBe(21) // 10 periods: 10 on + 10 off edges, plus the turn-on that starts period 11 at t = 10 ms
    expect(rel(L.cond, Ion * Ion * 0.05 * 0.005)).toBeLessThan(2e-2) // on for half of 10 ms
    // The first turn-on (t = 0) switches no voltage, so it costs nothing: 20 edges of ½·V·I·t_sw.
    expect(rel(L.sw, 20 * 0.5 * 12 * Ion * 100e-9)).toBeLessThan(2e-2)
  })

  it('IGBT: conducts with V_CE ≈ V_CE(sat) when the gate is high', () => {
    const d = circuit()
      .add('PS1', 'dc-supply', 0, 0, 0, { V: 24, Ilim: 5 })
      .add('LD1', 'dc-load', 8, -6, 0, { R: 24 })
      .add('Q1', 'igbt', 8, 4, 0, { Vsat: 1.6 })
      .add('G1', 'gate-source', 2, 8, 0, { Vhigh: 15 }, { mode: 0, level: 1 })
      .wire('PS1.+', 'LD1.+').wire('LD1.-', 'Q1.c').wire('Q1.e', 'PS1.-').wire('G1.+', 'Q1.g').wire('G1.-', 'Q1.e').doc
    const s = sim(d)
    const [vce, ic] = record(s, 1e-3, ['V:Q1', 'I:Q1'])
    const I = (24 - 1.6) / (24 + 0.05 + 0.01)
    expect(rel(ic[ic.length - 1], I)).toBeLessThan(1e-3)
    expect(rel(vce[vce.length - 1], 1.6 + I * 0.05)).toBeLessThan(1e-3)
  })

  it('H-bridge: diagonal pairs give a ±V_bus square wave at the set frequency', () => {
    const b = circuit().add('PS1', 'dc-supply', 0, 10, 0, { V: 24, Ilim: 5 })
    for (const [q, x, y] of [['Q1', 10, 4], ['Q2', 10, 14], ['Q3', 20, 4], ['Q4', 20, 14]] as const) b.add(q, 'mosfet', x, y)
    b.add('G1', 'gate-source', 6, 6, 0, gen(1, { f: 50 }).params, gen(1).states)
      .add('G2', 'gate-source', 6, 16, 0, gen(1, { f: 50 }).params, gen(1, {}, { invert: 1 }).states)
      .add('G3', 'gate-source', 16, 6, 0, gen(1, { f: 50 }).params, gen(1, {}, { invert: 1 }).states)
      .add('G4', 'gate-source', 16, 16, 0, gen(1, { f: 50 }).params, gen(1).states)
      .add('LA1', 'ac-load', 15, 9, 0, { R: 24 })
      .wire('PS1.+', 'Q1.d').wire('PS1.+', 'Q3.d').wire('Q1.s', 'Q2.d').wire('Q3.s', 'Q4.d').wire('Q2.s', 'PS1.-').wire('Q4.s', 'PS1.-')
      .wire('Q1.s', 'LA1.1').wire('Q3.s', 'LA1.2')
    for (const [g, q] of [['G1', 'Q1'], ['G2', 'Q2'], ['G3', 'Q3'], ['G4', 'Q4']]) b.wire(`${g}.+`, `${q}.g`).wire(`${g}.-`, `${q}.s`)
    const s = sim(b.doc)
    const [v] = record(s, 0.1, ['V:LA1'])
    const m = measure(v, s.h)
    const Vout = (24 * 24) / (24 + 2 * 0.05 + 0.01)
    expect(rel(m.freq!, 50)).toBeLessThan(2e-3)
    expect(rel(m.max, Vout)).toBeLessThan(1e-3)
    expect(rel(-m.min, Vout)).toBeLessThan(1e-3)
    expect(Math.abs(m.mean)).toBeLessThan(0.05 * Vout)
    expect(rel(m.rms, Vout)).toBeLessThan(5e-3)
    const sp = spectrum(v.slice(v.length / 2), s.h, 50, 49)!
    expect(rel(sp.thd, Math.sqrt((Math.PI * Math.PI) / 8 - 1))).toBeLessThan(0.05) // ideal square-wave THD 48.3 %
  })
})

describe('waveform analysis against closed forms', () => {
  const dt = 1e-5
  const N = 10000 // 0.1 s
  const wave = (f: (t: number) => number) => Float64Array.from({ length: N }, (_, i) => f(i * dt))
  it('sine: RMS = V_pk/√2, frequency, zero THD', () => {
    const x = wave((t) => 10 * Math.sin(2 * Math.PI * 50 * t))
    const m = measure(x, dt)
    expect(rel(m.rms, 10 / Math.SQRT2)).toBeLessThan(1e-3)
    expect(rel(m.freq!, 50)).toBeLessThan(1e-4)
    expect(spectrum(x, dt, 50)!.thd).toBeLessThan(1e-3)
  })
  it('square: RMS = V, THD → 48.3 %; PWM: RMS = V·√D, mean = V·D', () => {
    const sq = wave((t) => (Math.sin(2 * Math.PI * 50 * t) >= 0 ? 5 : -5))
    expect(rel(measure(sq, dt).rms, 5)).toBeLessThan(1e-3)
    expect(rel(spectrum(sq, dt, 50, 199)!.thd, Math.sqrt((Math.PI * Math.PI) / 8 - 1))).toBeLessThan(0.02)
    const pwm = wave((t) => ((t * 1000) % 1 < 0.3 ? 12 : 0))
    const m = measure(pwm, dt)
    expect(rel(m.rms, 12 * Math.sqrt(0.3))).toBeLessThan(1e-2)
    expect(rel(m.mean, 3.6)).toBeLessThan(1e-2)
    expect(Math.abs(m.duty! - 0.3)).toBeLessThan(0.01)
  })
})

describe('AC analysis', () => {
  it('RC low-pass: −3 dB at 1/(2πRC), −45° there', () => {
    const d = circuit().add('AC1', 'ac-source', 0, 0).add('R1', 'resistor', 4, -2, 0, { R: 1000 }).add('C1', 'capacitor', 8, 0, 90, { C: 1 }).add('GND1', 'ground', 0, 4)
      .wire('AC1.1', 'R1.1').wire('R1.2', 'C1.1').wire('C1.2', 'AC1.2').wire('AC1.2', 'GND1.gnd').doc
    const r = acSweep(d, 'AC1', 'V:C1', 1, 1e5, 400)
    if ('error' in r) throw new Error(r.error)
    const fc = 1 / (2 * Math.PI * 1000.1 * 1e-6)
    expect(rel(r.f3db!, fc)).toBeLessThan(0.01)
  })
  it('series LC: resonance at 1/(2π√(LC))', () => {
    const d = circuit().add('AC1', 'ac-source', 0, 0).add('R1', 'resistor', 4, -2, 0, { R: 10 }).add('L1', 'inductor', 8, -2, 0, { L: 10, Rdc: 0.1 }).add('C1', 'capacitor', 12, 0, 90, { C: 10 }).add('GND1', 'ground', 0, 4)
      .wire('AC1.1', 'R1.1').wire('R1.2', 'L1.1').wire('L1.2', 'C1.1').wire('C1.2', 'AC1.2').wire('AC1.2', 'GND1.gnd').doc
    const r = acSweep(d, 'AC1', 'V:C1', 10, 1e4, 600)
    if ('error' in r) throw new Error(r.error)
    // The voltage across C peaks at f₀·√(1 − 1/(2Q²)), slightly below f₀ = 1/(2π√(LC)).
    const f0 = 1 / (2 * Math.PI * Math.sqrt(0.01 * 10e-6))
    const Q = Math.sqrt(0.01 / 10e-6) / (10 + 0.1 + 0.1)
    expect(rel(r.peak!.f, f0 * Math.sqrt(1 - 1 / (2 * Q * Q)))).toBeLessThan(0.01)
  })
})

describe('robustness', () => {
  it('reports a convergence failure instead of plotting an inconsistent result', () => {
    // Gate tied to the drain: on → V_DS tiny → off → V_DS high → on … no consistent state exists.
    const d = circuit().add('PS1', 'dc-supply', 0, 0).add('R1', 'resistor', 4, -2, 0, { R: 100 }).add('Q1', 'mosfet', 8, 2)
      .wire('PS1.+', 'R1.1').wire('R1.2', 'Q1.d').wire('Q1.d', 'Q1.g').wire('Q1.s', 'PS1.-').doc
    const s = sim(d)
    expect(s.run(100)).toBe(0)
    expect(s.status.ok).toBe(false)
    expect(s.status.error).toMatch(/Convergence failure/)
    expect(s.step()).toBe(false)
  })

  it('a fuse melts under a short (simplified I²t model) and interrupts the current', () => {
    const d = circuit().add('B1', 'battery', 0, 0, 0, { V: 12, Rint: 0.05 }).add('F1', 'fuse', 4, -2, 0, { Irated: 2 }).add('R1', 'resistor', 8, 0, 90, { R: 0.5, Pmax: 50 })
      .wire('B1.+', 'F1.1').wire('F1.2', 'R1.1').wire('R1.2', 'B1.-').doc
    const s = sim(d, 1e-4)
    const [i] = record(s, 0.1, ['I:F1'])
    expect(s.events().blown).toEqual(['F1'])
    expect(Math.abs(i[i.length - 1])).toBeLessThan(1e-6)
    const I = 12 / (0.5 + 0.05 + 0.005)
    const tBlow = (1 * 4) / (I * I - 4) // FUSE_K·Ir² / (I² − Ir²)
    const k = i.findIndex((x) => Math.abs(x) < 1e-6)
    expect(Math.abs(k * s.h - tBlow)).toBeLessThan(3 * s.h)
  })

  it('is deterministic', () => {
    const d = circuit().add('AC1', 'ac-source', 0, 0).add('D1', 'diode', 4, -2).add('C1', 'electrolytic', 8, 0, 90).add('R1', 'resistor', 12, 0, 90)
      .wire('AC1.1', 'D1.a').wire('D1.k', 'C1.+').wire('C1.-', 'AC1.2').wire('C1.+', 'R1.1').wire('R1.2', 'AC1.2').doc
    const a = record(sim(d), 0.04, ['V:C1'])[0]
    const b = record(sim(d), 0.04, ['V:C1'])[0]
    expect(Array.from(a)).toEqual(Array.from(b))
  })
})
