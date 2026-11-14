import { circuit, type CircuitBuilder } from '../engine/circuit/build'
import { param } from '../engine/circuit/parts'
import type { CircuitDoc, PlacedPart } from '../engine/circuit/types'
import { measure, spectrum, timeConstant } from '../engine/sim/analysis'
import type { RunResult } from '../engine/sim/record'
import { SIM_EXPERIMENT_TITLES } from './fundamentalsCriteria'

/**
 * Phase 5 guided simulation experiments (sim-01 … sim-10).
 *
 * Every number shown to the student is either
 *  - EXPECTED: an independent closed-form calculation from the circuit's current parameters
 *    (so it updates when the student changes a value), labelled "approximation" where the formula
 *    is one, or
 *  - OBSERVED: measured from the transient simulation of the circuit as built.
 * An observation passes when it agrees with the expectation within the stated tolerance, which
 * also confirms the circuit still does what the experiment is about.
 */
export interface Expected {
  id: string
  label: string
  value: number
  unit: string
  formula: string
  approx?: boolean
}
export interface Observation {
  id: string
  label: string
  measured: number | null
  unit: string
  /** Expected value it is compared with, if any. */
  expected?: number
  /** Relative tolerance (or absolute when `abs`). */
  tol?: number
  abs?: boolean
  pass: boolean
  note?: string
}
export type Question =
  | { id: string; kind: 'choice'; prompt: string; options: string[]; answer: number; explain: string }
  | { id: string; kind: 'numeric'; prompt: string; observation: string; unit: string; scale: number; tol: number; explain: string }

export interface ScopeChannel {
  key: string
  perDiv: number
}
export interface SimExperiment {
  id: string
  title: string
  level: 'foundation' | 'intermediate' | 'advanced'
  objectives: string[]
  setup: string[]
  explore: string[]
  safety: string
  circuit: CircuitDoc
  scope: { timeDiv: number; channels: ScopeChannel[] }
  run: { duration: number; keep: number; keys: string[] }
  expected: (doc: CircuitDoc) => Expected[]
  observe: (doc: CircuitDoc, r: RunResult) => Observation[]
  questions: Question[]
}

// ── helpers ────────────────────────────────────────────────────────────────
const part = (d: CircuitDoc, id: string): PlacedPart | undefined => d.parts.find((p) => p.id === id)
const P = (d: CircuitDoc, id: string, key: string) => {
  const p = part(d, id)
  return p ? param(p, key) : NaN
}
const GEN_R = 10
const LV = 'Low-voltage, current-limited circuit: values are simulated; the same circuit is safe to build on a supervised bench.'
const obs = (id: string, label: string, measured: number | null, unit: string, expected?: number, tol = 0.02, abs = false, note?: string): Observation => {
  const pass = measured !== null && Number.isFinite(measured) && (expected === undefined ? true : abs ? Math.abs(measured - expected) <= tol : Math.abs(measured - expected) <= tol * Math.abs(expected))
  return { id, label, measured, unit, expected, tol: expected === undefined ? undefined : tol, abs, pass, note }
}
const info = (id: string, label: string, measured: number | null, unit: string, pass: boolean, note?: string): Observation => ({ id, label, measured, unit, pass, note })
/** Indices of rising (or falling) crossings of the mid level. */
function edges(x: Float64Array, rising: boolean): number[] {
  let lo = Infinity
  let hi = -Infinity
  for (const v of x) {
    lo = Math.min(lo, v)
    hi = Math.max(hi, v)
  }
  const mid = (lo + hi) / 2
  const out: number[] = []
  for (let i = 1; i < x.length; i++) if (rising ? x[i - 1] < mid && x[i] >= mid : x[i - 1] >= mid && x[i] < mid) out.push(i)
  return out
}
const mean = (x: Float64Array) => x.reduce((s, v) => s + v, 0) / (x.length || 1)
const product = (a: Float64Array, b: Float64Array) => Float64Array.from(a, (v, i) => v * b[i])
const pwm = (Vhigh: number, f: number, duty: number, extra: Record<string, number> = {}, invert = 0) => ({ params: { Vhigh, f, duty, phase: 0, td: 0, ...extra }, states: { mode: 1, level: 0, invert } })
const spwm = (f: number, fm: number, m: number, invert = 0) => ({ params: { Vhigh: 12, f, fm, m, td: 0 }, states: { mode: 2, level: 0, invert } })
/** Ideal quasi-square wave of conduction angle α (deg): V_rms/V_pk and THD from its Fourier series. */
export function quasiSquare(alphaDeg: number) {
  const a = (Math.min(Math.max(alphaDeg, 1), 180) * Math.PI) / 180
  const rmsRatio = Math.sqrt(a / Math.PI)
  const v1rms = ((4 / Math.PI) * Math.sin(a / 2)) / Math.SQRT2
  return { rmsRatio, thd: Math.sqrt(Math.max(0, (rmsRatio * rmsRatio) / (v1rms * v1rms) - 1)) }
}
/** Bridge-rectifier closed form (PWL diodes): peak and average load voltage. */
function bridgeExpected(d: CircuitDoc) {
  const vpk = P(d, 'AC1', 'Vrms') * Math.SQRT2
  const vf = P(d, 'D1', 'Vf')
  const R = P(d, 'LD1', 'R')
  const k = R / (R + 2 * 0.05 + 0.1)
  const th0 = Math.asin(Math.min(1, (2 * vf) / vpk))
  return { vpk, vf, R, k, peak: k * (vpk - 2 * vf), avg: ((2 * k) / Math.PI) * (vpk * Math.cos(th0) - vf * (Math.PI - 2 * th0)), f: 2 * P(d, 'AC1', 'f') }
}
function hbridge(b: CircuitBuilder, src: string, gates: Record<'G1' | 'G2' | 'G3' | 'G4', { params: Record<string, number>; states: Record<string, number> }>, ron?: number) {
  const q: Record<string, number> = ron === undefined ? {} : { Ron: ron }
  b.add('F1', 'fuse', 10, 4, 0, { Irated: src === 'B1' ? 30 : 5 })
    .add('Q1', 'mosfet', 22, 10, 0, q).add('Q2', 'mosfet', 22, 24, 0, q).add('Q3', 'mosfet', 42, 10, 0, q).add('Q4', 'mosfet', 42, 24, 0, q)
    .add('G1', 'gate-source', 15, 14, 0, gates.G1.params, gates.G1.states).add('G2', 'gate-source', 15, 28, 0, gates.G2.params, gates.G2.states)
    .add('G3', 'gate-source', 35, 14, 0, gates.G3.params, gates.G3.states).add('G4', 'gate-source', 35, 28, 0, gates.G4.params, gates.G4.states)
    .add('GND1', 'ground', 4, 32)
    .wire(`${src}.+`, 'F1.1').wire('F1.2', 'Q1.d').wire('F1.2', 'Q3.d').wire('Q1.s', 'Q2.d').wire('Q3.s', 'Q4.d').wire('Q2.s', `${src}.-`).wire('Q4.s', `${src}.-`)
    .wire('G1.+', 'Q1.g').wire('G1.-', 'Q1.s').wire('G2.+', 'Q2.g').wire('G2.-', 'Q2.s').wire('G3.+', 'Q3.g').wire('G3.-', 'Q3.s').wire('G4.+', 'Q4.g').wire('G4.-', 'Q4.s')
    .wire(`${src}.-`, 'GND1.gnd')
  return b
}
const OUT = 'T:Q1.s|T:Q3.s'

// ── circuits ───────────────────────────────────────────────────────────────
const rc = circuit().add('G1', 'gate-source', 4, 10, 0, pwm(10, 10, 50).params, pwm(10, 10, 50).states).add('R1', 'resistor', 10, 6, 0, { R: 1000 }).add('C1', 'capacitor', 16, 10, 90, { C: 10 }).add('GND1', 'ground', 4, 15)
  .wire('G1.+', 'R1.1').wire('R1.2', 'C1.1').wire('C1.2', 'G1.-').wire('G1.-', 'GND1.gnd').doc
const rl = circuit().add('G1', 'gate-source', 4, 10, 0, pwm(10, 100, 50).params, pwm(10, 100, 50).states).add('R1', 'resistor', 10, 6, 0, { R: 100 }).add('L1', 'inductor', 16, 10, 90, { L: 100, Rdc: 1 }).add('GND1', 'ground', 4, 15)
  .wire('G1.+', 'R1.1').wire('R1.2', 'L1.1').wire('L1.2', 'G1.-').wire('G1.-', 'GND1.gnd').doc
const bridgeB = () =>
  circuit()
    .add('AC1', 'ac-source', 5, 12, 0, { Vrms: 12, f: 50 })
    .add('D1', 'diode', 13, 7).add('D2', 'diode', 13, 11).add('D3', 'diode', 13, 15).add('D4', 'diode', 13, 19)
    .add('LD1', 'dc-load', 28, 13, 0, { R: 100 })
    .add('GND1', 'ground', 28, 17)
    .wire('AC1.1', 'D1.a').wire('AC1.1', 'D3.k').wire('AC1.2', 'D2.a').wire('AC1.2', 'D4.k')
    .wire('D1.k', 'LD1.+').wire('D2.k', 'LD1.+').wire('D3.a', 'LD1.-').wire('D4.a', 'LD1.-').wire('LD1.-', 'GND1.gnd')
const bridge = bridgeB().doc
const filter = bridgeB().add('C1', 'electrolytic', 22, 13, 90, { C: 1000, Vmax: 35 }).wire('C1.+', 'LD1.+').wire('C1.-', 'LD1.-').doc
const mosfet = circuit()
  .add('PS1', 'dc-supply', 4, 12, 0, { V: 12, Ilim: 5 })
  .add('LD1', 'dc-load', 15, 6, 0, { R: 24 })
  .add('Q1', 'mosfet', 14, 15, 0, { tsw: 100, Rth: 5 })
  .add('RG1', 'resistor', 8, 15, 0, { R: 47 })
  .add('G1', 'gate-source', 4, 21, 0, pwm(12, 20000, 50).params, pwm(12, 20000, 50).states)
  .add('GND1', 'ground', 4, 26)
  .wire('PS1.+', 'LD1.+').wire('LD1.-', 'Q1.d').wire('Q1.s', 'PS1.-').wire('G1.+', 'RG1.1').wire('RG1.2', 'Q1.g').wire('G1.-', 'Q1.s').wire('PS1.-', 'GND1.gnd').doc
const pwmCkt = circuit()
  .add('PS1', 'dc-supply', 4, 14, 0, { V: 12, Ilim: 5 })
  .add('R1', 'resistor', 16, 4, 0, { R: 10, Pmax: 10 })
  .add('L1', 'inductor', 22, 8, 90, { L: 10, Rdc: 0.1 })
  .add('D1', 'diode', 28, 8, 270, { Imax: 5 })
  .add('Q1', 'mosfet', 21, 17)
  .add('G1', 'gate-source', 12, 21, 0, pwm(12, 5000, 25).params, pwm(12, 5000, 25).states)
  .add('GND1', 'ground', 4, 26)
  .wire('PS1.+', 'R1.1').wire('R1.2', 'L1.1').wire('L1.2', 'Q1.d').wire('D1.a', 'Q1.d').wire('D1.k', 'PS1.+').wire('Q1.s', 'PS1.-').wire('G1.+', 'Q1.g').wire('G1.-', 'Q1.s').wire('PS1.-', 'GND1.gnd').doc
const half = circuit()
  .add('PS1', 'dc-supply', 4, 16, 0, { V: 24, Ilim: 5 })
  .add('F1', 'fuse', 10, 4, 0, { Irated: 5 })
  .add('Q1', 'mosfet', 20, 10)
  .add('Q2', 'mosfet', 20, 22)
  .add('G1', 'gate-source', 13, 14, 0, pwm(12, 10000, 50, { td: 1 }).params, pwm(12, 10000, 50).states)
  .add('G2', 'gate-source', 13, 26, 0, pwm(12, 10000, 50, { td: 1 }).params, pwm(12, 10000, 50, {}, 1).states)
  .add('L1', 'inductor', 30, 14, 90, { L: 2, Rdc: 0.05 })
  .add('R1', 'resistor', 30, 20, 90, { R: 10, Pmax: 50 })
  .add('GND1', 'ground', 4, 30)
  .wire('PS1.+', 'F1.1').wire('F1.2', 'Q1.d').wire('Q1.s', 'Q2.d').wire('Q2.s', 'PS1.-').wire('Q1.s', 'L1.1').wire('L1.2', 'R1.1').wire('R1.2', 'PS1.-')
  .wire('G1.+', 'Q1.g').wire('G1.-', 'Q1.s').wire('G2.+', 'Q2.g').wire('G2.-', 'Q2.s').wire('PS1.-', 'GND1.gnd').doc
const sq50 = (invert: number, phase = 0) => pwm(12, 50, 50, { phase }, invert)
const hb = hbridge(circuit().add('PS1', 'dc-supply', 4, 17, 0, { V: 24, Ilim: 5 }), 'PS1', { G1: sq50(0), G2: sq50(1), G3: sq50(1), G4: sq50(0) })
  .add('L1', 'inductor', 32, 14, 90, { L: 50, Rdc: 0.5 }).add('R1', 'resistor', 32, 20, 90, { R: 24, Pmax: 50 })
  .wire('Q1.s', 'L1.1').wire('L1.2', 'R1.1').wire('R1.2', 'Q3.s').doc
const inv = hbridge(circuit().add('B1', 'battery', 4, 17, 0, { V: 12, Rint: 0.02 }), 'B1', { G1: sq50(0), G2: sq50(1), G3: sq50(0, 180), G4: sq50(1, 180) }, 0.01)
  .add('T1', 'transformer', 52, 17, 0, { n: 19, Rw: 0.05, Lm: 1 }).add('LA1', 'ac-load', 60, 17, 0, { R: 1000 })
  .wire('Q1.s', 'T1.p1').wire('Q3.s', 'T1.p2').wire('T1.s1', 'LA1.1').wire('T1.s2', 'LA1.2').doc
const sine = hbridge(circuit().add('PS1', 'dc-supply', 4, 17, 0, { V: 24, Ilim: 5 }), 'PS1', { G1: spwm(5000, 50, 0.9), G2: spwm(5000, 50, 0.9, 1), G3: spwm(5000, 50, 0.9, 1), G4: spwm(5000, 50, 0.9) })
  .add('L1', 'inductor', 50, 10, 0, { L: 2, Rdc: 0.05 }).add('C1', 'capacitor', 54, 17, 90, { C: 47 }).add('LA1', 'ac-load', 60, 17, 0, { R: 24 })
  .wire('Q1.s', 'L1.1').wire('L1.2', 'C1.1').wire('C1.2', 'Q3.s').wire('C1.1', 'LA1.1').wire('C1.2', 'LA1.2').doc

// ── experiments ────────────────────────────────────────────────────────────
export const SIM_EXPERIMENTS: SimExperiment[] = [
  {
    id: 'sim-01',
    title: SIM_EXPERIMENT_TITLES['sim-01'],
    level: 'foundation',
    objectives: ['Observe the exponential charge and discharge of a capacitor.', 'Measure the time constant τ and compare it with R·C.', 'See that a capacitor voltage cannot change instantly.'],
    setup: ['The pulse generator G1 switches between 0 V and 10 V at 10 Hz (a square wave), with 10 Ω output resistance.', 'It charges C1 (10 µF) through R1 (1 kΩ) for 50 ms, then discharges it through the same path.', 'CH1 shows the capacitor voltage; CH2 shows the generator output.'],
    explore: ['Double R1 to 2.2 kΩ: the curve becomes slower and no longer reaches 10 V in half a period.', 'Raise the generator frequency to 50 Hz: the capacitor never charges fully, leaving a triangle-like waveform.'],
    safety: LV,
    circuit: rc,
    scope: { timeDiv: 0.01, channels: [{ key: 'V:C1', perDiv: 2 }, { key: 'V:G1', perDiv: 5 }, { key: 'I:C1', perDiv: 0.005 }] },
    run: { duration: 0.3, keep: 0.15, keys: ['V:C1', 'V:G1'] },
    expected: (d) => {
      const tau = (P(d, 'R1', 'R') + GEN_R) * P(d, 'C1', 'C') * 1e-6
      const a = 1 / (2 * P(d, 'G1', 'f') * tau)
      return [
        { id: 'tau', label: 'Time constant τ = (R1 + R_gen)·C1', value: tau, unit: 's', formula: `(${P(d, 'R1', 'R')} + 10) Ω × ${P(d, 'C1', 'C')} µF` },
        { id: 'vmax', label: 'Highest capacitor voltage (periodic steady state)', value: P(d, 'G1', 'Vhigh') / (1 + Math.exp(-a)), unit: 'V', formula: 'V_high / (1 + e^(−T/2τ))' },
      ]
    },
    observe: (d, r) => {
      const [tau, vmax] = SIM_EXPERIMENTS[0].expected(d)
      const vc = r.traces['V:C1']
      const up = edges(r.traces['V:G1'], true)[0]
      const down = edges(r.traces['V:G1'], false).find((i) => i > (up ?? 0))
      const Vh = P(d, 'G1', 'Vhigh')
      const tc = up !== undefined && down !== undefined ? timeConstant(vc, r.h, up - 1, down, Vh) : null
      const td = down !== undefined ? timeConstant(vc, r.h, down - 1, vc.length, 0) : null
      return [obs('tau_c', 'Charging time constant (63.2 % point)', tc, 's', tau.value, 0.03), obs('tau_d', 'Discharging time constant (to 36.8 %)', td, 's', tau.value, 0.03), obs('vmax', 'Highest capacitor voltage', measure(vc, r.h).max, 'V', vmax.value, 0.01)]
    },
    questions: [
      { id: 'q1', kind: 'choice', prompt: 'After one time constant of charging, the capacitor voltage has reached about what fraction of the supply?', options: ['37 %', '50 %', '63 %', '100 %'], answer: 2, explain: 'v = V(1 − e^(−t/τ)); at t = τ that is 1 − e^(−1) = 0.632.' },
      { id: 'q2', kind: 'numeric', prompt: 'Enter your measured charging time constant.', observation: 'tau_c', unit: 'ms', scale: 1e-3, tol: 0.05, explain: 'Read the time from the rising edge to 63.2 % of the step on CH1.' },
      { id: 'q3', kind: 'choice', prompt: 'If R1 is doubled, the time constant…', options: ['halves', 'stays the same', 'doubles', 'quadruples'], answer: 2, explain: 'τ = R·C is proportional to R.' },
    ],
  },
  {
    id: 'sim-02',
    title: SIM_EXPERIMENT_TITLES['sim-02'],
    level: 'foundation',
    objectives: ['Observe that inductor current rises and falls exponentially.', 'Measure τ = L/R and the final current V/R.', 'See the inductor voltage reverse when the source switches off.'],
    setup: ['G1 produces a 10 V, 100 Hz square wave (10 Ω output resistance).', 'R1 (100 Ω) and L1 (100 mH, 1 Ω winding resistance) are in series.', 'CH1: inductor current. CH2: inductor voltage. CH3: generator output.'],
    explore: ['Increase L1 to 300 mH: the current no longer settles within half a period.', 'Note how the inductor voltage jumps to about −V when the generator switches low: the current keeps flowing.'],
    safety: LV,
    circuit: rl,
    scope: { timeDiv: 0.001, channels: [{ key: 'I:L1', perDiv: 0.02 }, { key: 'V:L1', perDiv: 5 }, { key: 'V:G1', perDiv: 5 }] },
    run: { duration: 0.05, keep: 0.015, keys: ['I:L1', 'V:L1', 'V:G1'] },
    expected: (d) => {
      const Rt = P(d, 'R1', 'R') + P(d, 'L1', 'Rdc') + GEN_R
      const tau = (P(d, 'L1', 'L') * 1e-3) / Rt
      const iInf = P(d, 'G1', 'Vhigh') / Rt
      const a = 1 / (2 * P(d, 'G1', 'f') * tau)
      return [
        { id: 'tau', label: 'Time constant τ = L / R_total', value: tau, unit: 's', formula: `${P(d, 'L1', 'L')} mH / ${Rt.toFixed(1)} Ω` },
        { id: 'imax', label: 'Peak current (periodic steady state)', value: iInf / (1 + Math.exp(-a)), unit: 'A', formula: '(V/R_total) / (1 + e^(−T/2τ))' },
      ]
    },
    observe: (d, r) => {
      const [tau, imax] = SIM_EXPERIMENTS[1].expected(d)
      const il = r.traces['I:L1']
      const up = edges(r.traces['V:G1'], true)[0]
      const down = edges(r.traces['V:G1'], false).find((i) => i > (up ?? 0))
      const Rt = P(d, 'R1', 'R') + P(d, 'L1', 'Rdc') + GEN_R
      const tc = up !== undefined && down !== undefined ? timeConstant(il, r.h, up - 1, down, P(d, 'G1', 'Vhigh') / Rt) : null
      const m = measure(il, r.h)
      const vl = measure(r.traces['V:L1'], r.h)
      const rest = P(d, 'R1', 'R') + GEN_R
      return [
        obs('tau', 'Time constant (63.2 % point)', tc, 's', tau.value, 0.03),
        obs('imax', 'Peak inductor current', m.max, 'A', imax.value, 0.01),
        obs('vneg', 'Inductor voltage just after switch-off', vl.min, 'V', -m.max * rest, 0.03, false, 'The current keeps flowing, so the inductor drives it: v_L = −I·(R1 + R_gen).'),
      ]
    },
    questions: [
      { id: 'q1', kind: 'choice', prompt: 'At the instant the generator switches low, the inductor current…', options: ['drops to zero instantly', 'continues, then decays exponentially', 'reverses instantly', 'doubles'], answer: 1, explain: 'Energy ½LI² cannot change instantly, so the current is continuous.' },
      { id: 'q2', kind: 'numeric', prompt: 'Enter the measured peak inductor current.', observation: 'imax', unit: 'mA', scale: 1e-3, tol: 0.05, explain: 'Read the flat top of CH1.' },
      { id: 'q3', kind: 'choice', prompt: 'Which change makes the current rise more slowly?', options: ['Smaller L', 'Larger R', 'Larger L', 'Higher generator voltage'], answer: 2, explain: 'τ = L/R grows with L.' },
    ],
  },
  {
    id: 'sim-03',
    title: SIM_EXPERIMENT_TITLES['sim-03'],
    level: 'foundation',
    objectives: ['See four diodes turn AC into a pulsating, single-polarity voltage.', 'Account for two diode drops: V_peak,out ≈ V_peak − 2·V_f.', 'Explain why the output repeats at twice the mains frequency.'],
    setup: ['An isolated 12 V rms, 50 Hz AC source feeds a four-diode bridge.', 'The bridge drives a 100 Ω DC load; the load − is the 0 V reference.', 'CH1: AC input. CH2: load voltage. CH3: current in D1.'],
    explore: ['Remove D2: the circuit becomes a half-wave rectifier and the output frequency halves.', 'Raise the input to 24 V and compare how much of the voltage the diodes lose.'],
    safety: LV,
    circuit: bridge,
    scope: { timeDiv: 0.005, channels: [{ key: 'V:AC1', perDiv: 10 }, { key: 'V:LD1', perDiv: 5 }, { key: 'I:D1', perDiv: 0.1 }] },
    run: { duration: 0.08, keep: 0.04, keys: ['V:LD1'] },
    expected: (d) => {
      const b = bridgeExpected(d)
      return [
        { id: 'f', label: 'Output frequency', value: b.f, unit: 'Hz', formula: '2 × input frequency' },
        { id: 'peak', label: 'Peak load voltage', value: b.peak, unit: 'V', formula: `(V_pk − 2V_f) × R/(R + 2R_d + R_src) = (${b.vpk.toFixed(2)} − ${(2 * b.vf).toFixed(1)}) × ${b.k.toFixed(4)}` },
        { id: 'avg', label: 'Average load voltage', value: b.avg, unit: 'V', formula: '(2k/π)·[V_pk·cos θ₀ − V_f(π − 2θ₀)], θ₀ = asin(2V_f/V_pk)' },
      ]
    },
    observe: (d, r) => {
      const [f, peak, avg] = SIM_EXPERIMENTS[2].expected(d)
      const m = measure(r.traces['V:LD1'], r.h)
      return [obs('f', 'Output frequency', m.freq, 'Hz', f.value, 0.01), obs('peak', 'Peak load voltage', m.max, 'V', peak.value, 0.01), obs('avg', 'Average load voltage', m.mean, 'V', avg.value, 0.01), obs('min', 'Lowest load voltage (never negative)', m.min, 'V', 0, 0.05, true)]
    },
    questions: [
      { id: 'q1', kind: 'choice', prompt: 'What is the frequency of the bumps in the rectified output from a 50 Hz supply?', options: ['25 Hz', '50 Hz', '100 Hz', '200 Hz'], answer: 2, explain: 'Both half-cycles produce a positive bump, so there are two per input cycle.' },
      { id: 'q2', kind: 'numeric', prompt: 'Enter the measured peak load voltage.', observation: 'peak', unit: 'V', scale: 1, tol: 0.03, explain: 'Read the top of CH2: about V_pk minus two diode drops.' },
      { id: 'q3', kind: 'choice', prompt: 'How many diodes conduct at any instant (away from the zero crossings)?', options: ['1', '2', '3', '4'], answer: 1, explain: 'One diode on each side of the load: a different pair each half-cycle.' },
    ],
  },
  {
    id: 'sim-04',
    title: SIM_EXPERIMENT_TITLES['sim-04'],
    level: 'intermediate',
    objectives: ['Smooth rectified DC with a reservoir capacitor.', 'Measure ripple and compare it with ΔV ≈ I/(2fC).', 'See the short, high diode-current pulses that recharge the capacitor.'],
    setup: ['The bridge rectifier from experiment 3, with a 1000 µF electrolytic across the 100 Ω load.', 'The run simulates 0.6 s so the capacitor reaches steady state; measurements use the last two cycles.', 'CH1: load voltage. CH2: current in D1.'],
    explore: ['Set C1 to 2200 µF: the ripple roughly halves.', 'Halve the load resistance: twice the current, twice the ripple.'],
    safety: LV,
    circuit: filter,
    scope: { timeDiv: 0.005, channels: [{ key: 'V:LD1', perDiv: 2 }, { key: 'I:D1', perDiv: 0.5 }, { key: 'V:AC1', perDiv: 10 }] },
    run: { duration: 0.6, keep: 0.04, keys: ['V:LD1', 'I:D1', 'I:LD1'] },
    expected: (d) => {
      const b = bridgeExpected(d)
      const I = b.peak / b.R
      const dv = I / (2 * P(d, 'AC1', 'f') * P(d, 'C1', 'C') * 1e-6)
      return [
        { id: 'ripple', label: 'Ripple (peak-to-peak)', value: dv, unit: 'V', formula: 'ΔV ≈ I_load / (2·f·C)', approx: true },
        { id: 'vdc', label: 'Average output voltage', value: b.peak - dv / 2, unit: 'V', formula: 'V_peak,out − ΔV/2', approx: true },
      ]
    },
    observe: (d, r) => {
      const [ripple, vdc] = SIM_EXPERIMENTS[3].expected(d)
      const v = measure(r.traces['V:LD1'], r.h)
      const id = measure(r.traces['I:D1'], r.h)
      const iload = mean(r.traces['I:LD1'])
      return [
        obs('ripple', 'Measured ripple (peak-to-peak)', v.pkpk, 'V', ripple.value, 0.25, false, 'Compared with an approximation (it assumes the capacitor supplies the load for a whole half-cycle).'),
        obs('vdc', 'Average output voltage', v.mean, 'V', vdc.value, 0.05),
        info('ipk', 'Peak diode current ÷ average load current', iload > 0 ? id.max / iload : null, '×', iload > 0 && id.max / iload > 3, 'Charge for a whole half-cycle is delivered in a short pulse near the peak.'),
      ]
    },
    questions: [
      { id: 'q1', kind: 'choice', prompt: 'Doubling the filter capacitance makes the ripple…', options: ['double', 'stay the same', 'roughly halve', 'disappear'], answer: 2, explain: 'ΔV ≈ I/(2fC): ripple is inversely proportional to C.' },
      { id: 'q2', kind: 'numeric', prompt: 'Enter the measured peak-to-peak ripple.', observation: 'ripple', unit: 'V', scale: 1, tol: 0.08, explain: 'Use the max − min of CH1 over a cycle.' },
      { id: 'q3', kind: 'choice', prompt: 'Why are the diode current pulses much larger than the load current?', options: ['The diodes are faulty', 'The capacitor only recharges near the voltage peak, in a short time', 'The AC source is overloaded', 'The load draws pulsed current'], answer: 1, explain: 'The same charge must be replaced in a short conduction window.' },
    ],
  },
  {
    id: 'sim-05',
    title: SIM_EXPERIMENT_TITLES['sim-05'],
    level: 'intermediate',
    objectives: ['Drive an N-channel MOSFET with a PWM gate signal.', 'Measure V_DS(on), drain current and duty cycle.', 'Estimate conduction and switching losses and the junction temperature.'],
    setup: ['A 12 V supply drives a 24 Ω lamp through a low-side MOSFET.', 'G1 applies a 20 kHz, 50 % gate signal through RG1 (47 Ω), referenced to the source.', 'CH1: drain current. CH2: V_DS. CH3: V_GS.'],
    explore: ['Raise the frequency to 100 kHz: conduction loss stays the same, switching loss rises five-fold.', 'Increase R_DS(on) to 0.5 Ω and watch the junction temperature estimate.'],
    safety: LV,
    circuit: mosfet,
    scope: { timeDiv: 0.00002, channels: [{ key: 'I:Q1', perDiv: 0.2 }, { key: 'V:Q1', perDiv: 5 }, { key: 'VG:Q1', perDiv: 5 }] },
    run: { duration: 0.001, keep: 0.0005, keys: ['I:Q1', 'V:Q1', 'VG:Q1'] },
    expected: (d) => {
      const V = P(d, 'PS1', 'V')
      const Ron = P(d, 'Q1', 'Ron')
      const I = V / (P(d, 'LD1', 'R') + Ron + 0.01)
      const D = P(d, 'G1', 'duty') / 100
      const pc = D * I * I * Ron
      const ps = P(d, 'G1', 'f') * V * I * P(d, 'Q1', 'tsw') * 1e-9
      return [
        { id: 'ion', label: 'On-state drain current', value: I, unit: 'A', formula: 'V / (R_load + R_DS(on) + R_supply)' },
        { id: 'vds', label: 'V_DS when on', value: I * Ron, unit: 'V', formula: 'I_D × R_DS(on)' },
        { id: 'pc', label: 'Conduction loss', value: pc, unit: 'W', formula: 'D × I² × R_DS(on)' },
        { id: 'ps', label: 'Switching loss', value: ps, unit: 'W', formula: 'f × V × I × t_sw (two edges of ½·V·I·t_sw)', approx: true },
        { id: 'tj', label: 'Junction temperature (steady state)', value: 25 + (pc + ps) * P(d, 'Q1', 'Rth'), unit: '°C', formula: 'T_a + P × R_θ(j-a), T_a = 25 °C' },
      ]
    },
    observe: (d, r) => {
      const [ion, vds, pc, ps] = SIM_EXPERIMENTS[4].expected(d)
      const id = measure(r.traces['I:Q1'], r.h)
      const vg = measure(r.traces['VG:Q1'], r.h)
      const onIdx = r.traces['I:Q1'].findIndex((x) => x > 0.9 * id.max)
      const L = r.sim?.switchLosses().find((x) => x.part === 'Q1')
      const T = r.sim ? r.sim.t : 1
      const Pc = L ? L.cond / T : null
      const Ps = L ? L.sw / T : null
      return [
        obs('ion', 'On-state drain current', id.max, 'A', ion.value, 0.01),
        obs('vds', 'V_DS when on', onIdx >= 0 ? r.traces['V:Q1'][onIdx] : null, 'V', vds.value, 0.02),
        obs('duty', 'Gate duty cycle', vg.duty, '', P(d, 'G1', 'duty') / 100, 0.01, true),
        obs('pc', 'Conduction loss (from simulated v·i)', Pc, 'W', pc.value, 0.05),
        obs('ps', 'Switching loss (½·V·I·t_sw per simulated edge)', Ps, 'W', ps.value, 0.05),
        info('tj', 'Junction temperature estimate', Pc !== null && Ps !== null ? 25 + (Pc + Ps) * P(d, 'Q1', 'Rth') : null, '°C', true, 'Steady state, ambient 25 °C; thermal capacitance is not modelled.'),
      ]
    },
    questions: [
      { id: 'q1', kind: 'choice', prompt: 'If the switching frequency doubles (same duty), the switching loss…', options: ['halves', 'stays the same', 'doubles', 'quadruples'], answer: 2, explain: 'There are twice as many edges per second, each costing ½·V·I·t_sw.' },
      { id: 'q2', kind: 'numeric', prompt: 'Enter the measured conduction loss.', observation: 'pc', unit: 'mW', scale: 1e-3, tol: 0.05, explain: 'D × I² × R_DS(on), from the simulation results.' },
      { id: 'q3', kind: 'choice', prompt: 'What is the main job of the gate resistor RG1 in a real circuit?', options: ['Limit the gate charging current and damp ringing', 'Reduce the load current', 'Provide the drain voltage', 'Discharge the supply'], answer: 0, explain: 'A real gate is a capacitance; RG controls how fast it charges. (The lab gate is ideal, so RG has no effect here.)' },
    ],
  },
  {
    id: 'sim-06',
    title: SIM_EXPERIMENT_TITLES['sim-06'],
    level: 'intermediate',
    objectives: ['Generate PWM and relate duty cycle to average voltage.', 'See an inductive load average the pulses into a nearly steady current.', 'Understand why a freewheeling diode is required.'],
    setup: ['G1 generates 5 kHz PWM at 25 % duty to switch Q1.', 'The load is R1 (10 Ω) in series with L1 (10 mH), like a small DC motor winding.', 'D1 lets the load current continue when Q1 turns off. CH1: V_GS. CH2: load current. CH3: V_DS.'],
    explore: ['Set the duty to 50 % and 75 %: the load current scales with duty.', 'Lower the frequency to 500 Hz: the current ripple grows.'],
    safety: LV,
    circuit: pwmCkt,
    scope: { timeDiv: 0.0001, channels: [{ key: 'VG:Q1', perDiv: 5 }, { key: 'I:L1', perDiv: 0.1 }, { key: 'V:Q1', perDiv: 5 }] },
    run: { duration: 0.02, keep: 0.004, keys: ['VG:Q1', 'I:L1', 'I:D1'] },
    expected: (d) => {
      const D = P(d, 'G1', 'duty') / 100
      const V = P(d, 'PS1', 'V')
      const Rl = P(d, 'R1', 'R') + P(d, 'L1', 'Rdc')
      const vf = P(d, 'D1', 'Vf')
      const I = (D * V - (1 - D) * vf) / (Rl + D * (P(d, 'Q1', 'Ron') + 0.01) + (1 - D) * 0.05)
      const ripple = ((V - I * Rl) * D) / (P(d, 'G1', 'f') * P(d, 'L1', 'L') * 1e-3)
      return [
        { id: 'iavg', label: 'Average load current', value: I, unit: 'A', formula: '[D·V − (1−D)·V_f] / (R_load + D·R_on + (1−D)·R_d)' },
        { id: 'ripple', label: 'Current ripple (peak-to-peak)', value: ripple, unit: 'A', formula: '(V − I·R)·D / (f·L)', approx: true },
      ]
    },
    observe: (d, r) => {
      const [iavg, ripple] = SIM_EXPERIMENTS[5].expected(d)
      const g = measure(r.traces['VG:Q1'], r.h)
      const il = measure(r.traces['I:L1'], r.h)
      const idd = measure(r.traces['I:D1'], r.h)
      return [
        obs('f', 'PWM frequency', g.freq, 'Hz', P(d, 'G1', 'f'), 0.005),
        obs('duty', 'Duty cycle', g.duty, '', P(d, 'G1', 'duty') / 100, 0.01, true),
        obs('iavg', 'Average load current', il.mean, 'A', iavg.value, 0.02),
        obs('ripple', 'Current ripple (peak-to-peak)', il.pkpk, 'A', ripple.value, 0.2, false, 'Compared with an approximation.'),
        info('diode', 'Freewheeling current in D1 while Q1 is off', idd.max, 'A', idd.max > 0.5 * il.mean, 'Without D1 the inductor would force a destructive voltage spike across Q1.'),
      ]
    },
    questions: [
      { id: 'q1', kind: 'choice', prompt: 'With a 12 V supply and 25 % duty, the average voltage applied to the load is closest to…', options: ['3 V', '6 V', '9 V', '12 V'], answer: 0, explain: 'V_avg ≈ D × V = 0.25 × 12 V (less small drops).' },
      { id: 'q2', kind: 'numeric', prompt: 'Enter the measured average load current.', observation: 'iavg', unit: 'A', scale: 1, tol: 0.05, explain: 'Mean of CH2.' },
      { id: 'q3', kind: 'choice', prompt: 'What does D1 do?', options: ['Rectifies the supply', 'Carries the inductor current while Q1 is off', 'Limits the gate voltage', 'Protects against reverse battery'], answer: 1, explain: 'It is the freewheeling (flyback) path for the inductor current.' },
    ],
  },
  {
    id: 'sim-07',
    title: SIM_EXPERIMENT_TITLES['sim-07'],
    level: 'advanced',
    objectives: ['Drive a half-bridge with complementary gate signals.', 'Measure the dead time and see the body diode conduct during it.', 'Relate the average output voltage to duty cycle and bus voltage.'],
    setup: ['A 24 V fused supply feeds Q1 (high side) and Q2 (low side).', 'G1 and G2 are complementary 10 kHz PWM with 1 µs dead time; G1 is referenced to the switch node (floating drive).', 'The load is L1 (2 mH) + R1 (10 Ω) from the switch node to 0 V. CH1: output voltage. CH2: load current. CH3: Q2 body-diode current.'],
    explore: ['Set both dead times to 0: no diode conduction, slightly higher output.', 'Set G2 to "Normal" polarity (same as G1): shoot-through. The fuse blows.'],
    safety: LV,
    circuit: half,
    scope: { timeDiv: 0.00002, channels: [{ key: 'V:Q2', perDiv: 5 }, { key: 'I:L1', perDiv: 0.5 }, { key: 'IB:Q2', perDiv: 0.5 }, { key: 'VG:Q1', perDiv: 10 }] },
    run: { duration: 0.004, keep: 0.0005, keys: ['V:Q2', 'I:L1', 'IB:Q2', 'VG:Q1', 'VG:Q2'] },
    expected: (d) => {
      const f = P(d, 'G1', 'f')
      const td = P(d, 'G1', 'td') * 1e-6
      const Don = 0.5 - td * f
      const Dd = 2 * td * f
      const Ron = P(d, 'Q1', 'Ron')
      const R = P(d, 'R1', 'R') + P(d, 'L1', 'Rdc')
      const I = (Don * P(d, 'PS1', 'V') - Dd * 0.7) / (R + Don * (2 * Ron + 0.015) + Dd * 0.05)
      return [
        { id: 'vout', label: 'Average output voltage', value: I * R, unit: 'V', formula: 'Q1 on (½T − t_d): +V_bus; Q2 on: 0 V; dead times: −V_f (body diode)' },
        { id: 'iavg', label: 'Average load current', value: I, unit: 'A', formula: 'V_out,avg / R_load' },
        { id: 'dt', label: 'Dead time per edge', value: td, unit: 's', formula: 'G1/G2 dead-time setting' },
      ]
    },
    observe: (d, r) => {
      const [vout, iavg, dt] = SIM_EXPERIMENTS[6].expected(d)
      const g1 = r.traces['VG:Q1']
      const g2 = r.traces['VG:Q2']
      let both = 0
      for (let i = 0; i < g1.length; i++) if (g1[i] < 2 && g2[i] < 2) both++
      const f = P(d, 'G1', 'f')
      const deadPerEdge = ((both / g1.length) * (1 / f)) / 2
      const ib = measure(r.traces['IB:Q2'], r.h)
      return [
        obs('vout', 'Average output voltage', mean(r.traces['V:Q2']), 'V', vout.value, 0.02),
        obs('iavg', 'Average load current', mean(r.traces['I:L1']), 'A', iavg.value, 0.02),
        obs('dt', 'Measured dead time per edge (both gates low)', deadPerEdge, 's', dt.value, Math.max(r.h, 0.1 * dt.value), true),
        info('diode', 'Q2 body diode carries the load current in the dead time', ib.max, 'A', ib.max > 0.8 * mean(r.traces['I:L1']) || dt.value === 0),
      ]
    },
    questions: [
      { id: 'q1', kind: 'choice', prompt: 'Why is a dead time inserted between turning one switch off and the other on?', options: ['To reduce the output frequency', 'So both switches are never on together (shoot-through)', 'To charge the load', 'To measure the current'], answer: 1, explain: 'Real switches take time to turn off; the dead time prevents a short across the bus.' },
      { id: 'q2', kind: 'numeric', prompt: 'Enter the measured dead time per edge.', observation: 'dt', unit: 'µs', scale: 1e-6, tol: 0.25, explain: 'Look for the gaps where both V_GS traces are low.' },
      { id: 'q3', kind: 'choice', prompt: 'During the dead time, which device carries the inductive load current?', options: ['Q1 channel', 'Q2 channel', 'Q2 body diode', 'Nothing: the current stops'], answer: 2, explain: 'The inductor keeps the current flowing; with both channels off it finds the low-side body diode.' },
    ],
  },
  {
    id: 'sim-08',
    title: SIM_EXPERIMENT_TITLES['sim-08'],
    level: 'advanced',
    objectives: ['Reverse the load voltage with diagonal switch pairs.', 'Observe the inductive load current lag the voltage.', 'See stored energy return to the supply through the body diodes.'],
    setup: ['A 24 V fused supply feeds a full H-bridge (Q1–Q4).', 'Q1 + Q4 conduct for half of each 50 Hz cycle, then Q2 + Q3.', 'The load is L1 (50 mH) + R1 (24 Ω) between the leg outputs. CH1: load voltage. CH2: load current. CH3: supply current.'],
    explore: ['Increase L1 to 300 mH: the current becomes nearly triangular.', 'Watch CH3 go negative after each reversal: the supply briefly absorbs energy.'],
    safety: LV,
    circuit: hb,
    scope: { timeDiv: 0.005, channels: [{ key: OUT, perDiv: 10 }, { key: 'I:L1', perDiv: 0.5 }, { key: 'I:PS1', perDiv: 0.5 }] },
    run: { duration: 0.13, keep: 0.07, keys: [OUT, 'I:L1', 'I:PS1'] },
    expected: (d) => {
      const Rt = P(d, 'R1', 'R') + P(d, 'L1', 'Rdc') + 2 * P(d, 'Q1', 'Ron') + 0.015
      const tau = (P(d, 'L1', 'L') * 1e-3) / Rt
      const a = 1 / (2 * P(d, 'G1', 'f') * tau)
      const V = P(d, 'PS1', 'V')
      return [
        { id: 'f', label: 'Output frequency', value: P(d, 'G1', 'f'), unit: 'Hz', formula: 'gate frequency' },
        { id: 'ipk', label: 'Peak load current', value: (V / Rt) * Math.tanh(a / 2), unit: 'A', formula: '(V/R)·tanh(T/4τ) for a symmetric ±V square wave' },
        { id: 'vrms', label: 'Output RMS voltage', value: V, unit: 'V', formula: '±V_bus square wave: V_rms = V_bus (less switch drops)', approx: true },
      ]
    },
    observe: (d, r) => {
      const [f, ipk, vrms] = SIM_EXPERIMENTS[7].expected(d)
      const v = measure(r.traces[OUT], r.h)
      const i = measure(r.traces['I:L1'], r.h)
      const ps = measure(r.traces['I:PS1'], r.h)
      return [
        obs('f', 'Output frequency', v.freq, 'Hz', f.value, 0.005),
        obs('vrms', 'Output RMS voltage', v.rms, 'V', vrms.value, 0.03),
        obs('ipk', 'Peak load current', i.max, 'A', ipk.value, 0.02),
        info('regen', 'Lowest supply current (negative = energy returned)', ps.min, 'A', ps.min < 0, 'After each reversal the inductor current flows back through the body diodes into the supply.'),
      ]
    },
    questions: [
      { id: 'q1', kind: 'choice', prompt: 'Just after the bridge reverses, the load current still flows in the old direction. Through what?', options: ['The switches that just turned off', 'The body diodes of the switches that just turned on', 'The fuse only', 'It cannot flow'], answer: 1, explain: 'The inductor keeps the current flowing; it returns through the body diodes of the newly-on pair until it reverses.' },
      { id: 'q2', kind: 'numeric', prompt: 'Enter the measured output RMS voltage.', observation: 'vrms', unit: 'V', scale: 1, tol: 0.03, explain: 'For a ±V square wave, the RMS equals V.' },
      { id: 'q3', kind: 'choice', prompt: 'Why does the supply current go negative briefly?', options: ['A short circuit', 'Energy stored in the load inductance is returned to the supply', 'The fuse is blowing', 'The supply is faulty'], answer: 1, explain: 'This is reactive energy flowing back and forth each cycle.' },
    ],
  },
  {
    id: 'sim-09',
    title: SIM_EXPERIMENT_TITLES['sim-09'],
    level: 'advanced',
    objectives: ['Build a battery inverter: H-bridge plus step-up transformer.', 'Measure output RMS, frequency and THD.', 'Turn the square wave into a modified sine by phase-shifting one leg, and compare THD.'],
    setup: ['A 12 V battery, 30 A fuse and H-bridge drive the primary of a 1:19 transformer.', 'Leg B (G3, G4) is shifted by 180°, giving a square wave. Set G3 and G4 phase to 120° for a modified sine (120° conduction).', 'The secondary supplies a 1000 Ω load at about 230 V. CH1: secondary voltage. CH2: load current. CH3: battery current.'],
    explore: ['Set G3 and G4 phase to 120°: zero-voltage steps appear and THD drops from about 48 % to about 31 %.', 'Try 140°: compare the RMS voltage and the THD.'],
    safety: 'The secondary reaches about 230 V: simulated only. Mains-voltage inverter outputs must never be built or probed as a student exercise.',
    circuit: inv,
    scope: { timeDiv: 0.005, channels: [{ key: 'VS:T1', perDiv: 100 }, { key: 'I:LA1', perDiv: 0.2 }, { key: 'I:B1', perDiv: 2 }] },
    run: { duration: 0.13, keep: 0.07, keys: ['VS:T1', 'I:LA1', 'V:B1', 'I:B1'] },
    expected: (d) => {
      const alpha = Math.min(P(d, 'G3', 'phase'), 360 - P(d, 'G3', 'phase'))
      const q = quasiSquare(alpha)
      return [
        { id: 'f', label: 'Output frequency', value: P(d, 'G1', 'f'), unit: 'Hz', formula: 'gate frequency' },
        { id: 'ratio', label: 'V_rms / V_peak', value: q.rmsRatio, unit: '', formula: `√(α/180°), α = ${alpha}°` },
        { id: 'thd', label: 'THD of the ideal waveform', value: q.thd, unit: '', formula: alpha === 180 ? '√(π²/8 − 1) = 48.3 % for a square wave' : 'from the Fourier series of a quasi-square wave' },
      ]
    },
    observe: (d, r) => {
      const [f, ratio, thd] = SIM_EXPERIMENTS[8].expected(d)
      const v = measure(r.traces['VS:T1'], r.h)
      const sp = v.freq ? spectrum(r.traces['VS:T1'], r.h, P(d, 'G1', 'f'), 49) : null
      const pout = mean(product(r.traces['VS:T1'], r.traces['I:LA1']))
      const pin = mean(product(r.traces['V:B1'], r.traces['I:B1']))
      const vpk = Math.max(v.max, -v.min)
      return [
        obs('f', 'Output frequency', v.freq, 'Hz', f.value, 0.005),
        obs('vrms', 'Output RMS voltage', v.rms, 'V'),
        obs('ratio', 'V_rms / V_peak', vpk > 0 ? v.rms / vpk : null, '', ratio.value, 0.03),
        obs('thd', 'Total harmonic distortion', sp?.thd ?? null, '', thd.value, 0.03, true),
        info('eff', 'Efficiency (P_load / P_battery)', pin > 0 ? pout / pin : null, '', pin > 0 && pout / pin > 0.8 && pout / pin < 1, 'Losses: switch R_DS(on), winding and battery resistance; magnetising current.'),
      ]
    },
    questions: [
      { id: 'q1', kind: 'choice', prompt: 'Which output has the lower THD?', options: ['Square wave', 'Modified sine with 120° conduction', 'They are equal', 'THD does not apply to inverters'], answer: 1, explain: 'With 120° conduction the third harmonic cancels, so THD falls from 48.3 % to 31 %.' },
      { id: 'q2', kind: 'numeric', prompt: 'Enter the measured output RMS voltage.', observation: 'vrms', unit: 'V', scale: 1, tol: 0.03, explain: 'RMS of CH1.' },
      { id: 'q3', kind: 'choice', prompt: 'What is the transformer for?', options: ['Filtering the output to a sine wave', 'Stepping the 12 V bridge output up to mains voltage and isolating it', 'Storing energy for the battery', 'Measuring current'], answer: 1, explain: 'A 1:19 ratio turns about ±12 V into about ±230 V, with galvanic isolation.' },
    ],
  },
  {
    id: 'sim-10',
    title: SIM_EXPERIMENT_TITLES['sim-10'],
    level: 'advanced',
    objectives: ['Generate sinusoidal PWM (SPWM) with an H-bridge.', 'Filter it with an LC low-pass filter to obtain a sine wave.', 'Compare THD before and after the filter.'],
    setup: ['A 24 V fused supply feeds an H-bridge driven by bipolar SPWM: 5 kHz carrier, 50 Hz sine, modulation index 0.9.', 'L1 (2 mH) and C1 (47 µF) form a low-pass filter (corner about 520 Hz) feeding a 24 Ω load.', 'CH1: load voltage. CH2: bridge output (before the filter). CH3: load current. Low voltage, so it is safe; a real inverter adds a transformer or a higher bus.'],
    explore: ['Lower the carrier to 1 kHz: the filter passes more carrier ripple and THD rises.', 'Reduce the modulation index to 0.5: the output amplitude scales with m.'],
    safety: LV,
    circuit: sine,
    scope: { timeDiv: 0.005, channels: [{ key: 'V:LA1', perDiv: 10 }, { key: OUT, perDiv: 20 }, { key: 'I:LA1', perDiv: 0.5 }] },
    run: { duration: 0.11, keep: 0.07, keys: ['V:LA1', OUT] },
    expected: (d) => {
      const m = P(d, 'G1', 'm')
      const V = P(d, 'PS1', 'V')
      const w = 2 * Math.PI * P(d, 'G1', 'fm')
      const L = P(d, 'L1', 'L') * 1e-3
      const C = P(d, 'C1', 'C') * 1e-6
      const R = P(d, 'LA1', 'R')
      // H = Zp / (R_dc + jωL + Zp), Zp = R ∥ 1/(jωC) = R / (1 + jωRC)
      const den = { re: 1, im: w * R * C }
      const zp = { re: R / (den.re ** 2 + den.im ** 2), im: (-R * den.im) / (den.re ** 2 + den.im ** 2) }
      const tot = { re: P(d, 'L1', 'Rdc') + zp.re, im: w * L + zp.im }
      const H = Math.hypot(zp.re, zp.im) / Math.hypot(tot.re, tot.im)
      return [
        { id: 'f', label: 'Output frequency', value: P(d, 'G1', 'fm'), unit: 'Hz', formula: 'modulating frequency' },
        { id: 'v1', label: 'Output fundamental (peak)', value: m * V * H, unit: 'V', formula: `m × V_bus × |H(j2π·50)| = ${m} × ${V} V × ${H.toFixed(3)}` },
        { id: 'fc', label: 'Filter corner frequency', value: 1 / (2 * Math.PI * Math.sqrt(L * C)), unit: 'Hz', formula: '1 / (2π√(LC))' },
      ]
    },
    observe: (d, r) => {
      const [f, v1] = SIM_EXPERIMENTS[9].expected(d)
      const v = measure(r.traces['V:LA1'], r.h)
      const fm = P(d, 'G1', 'fm')
      const sp = spectrum(r.traces['V:LA1'], r.h, fm, 50)
      const spb = spectrum(r.traces[OUT], r.h, fm, 200)
      return [
        obs('f', 'Output frequency', v.freq, 'Hz', f.value, 0.005),
        obs('v1', 'Output fundamental (peak)', sp?.amp[1] ?? null, 'V', v1.value, 0.03),
        obs('vrms', 'Output RMS voltage', v.rms, 'V'),
        info('thd', 'THD after the filter', sp?.thd ?? null, '', !!sp && sp.thd < 0.05, 'A good sine-wave inverter is below 5 %.'),
        info('thdb', 'THD of the bridge output (before the filter)', spb?.thd ?? null, '', !!spb && spb.thd > 0.5, 'Bipolar SPWM is rich in carrier harmonics until filtered (harmonics to the 200th counted).'),
      ]
    },
    questions: [
      { id: 'q1', kind: 'choice', prompt: 'What does the LC filter do?', options: ['Raises the voltage', 'Passes the 50 Hz fundamental and blocks the switching-frequency harmonics', 'Converts DC to AC', 'Prevents shoot-through'], answer: 1, explain: 'Its corner (about 520 Hz) is far above 50 Hz and far below the 5 kHz carrier.' },
      { id: 'q2', kind: 'numeric', prompt: 'Enter the measured output RMS voltage.', observation: 'vrms', unit: 'V', scale: 1, tol: 0.03, explain: 'RMS of CH1 (about the peak ÷ √2).' },
      { id: 'q3', kind: 'choice', prompt: 'Raising the carrier frequency (same filter) mainly…', options: ['lowers THD but raises switching loss', 'raises THD', 'changes the output frequency', 'has no effect'], answer: 0, explain: 'Harmonics move further above the filter corner and are attenuated more, at the cost of more switching edges.' },
    ],
  },
]

export const SIM_EXPERIMENT_BY_ID: Record<string, SimExperiment> = Object.fromEntries(SIM_EXPERIMENTS.map((e) => [e.id, e]))

export { FUNDAMENTALS_CRITERIA } from './fundamentalsCriteria'
