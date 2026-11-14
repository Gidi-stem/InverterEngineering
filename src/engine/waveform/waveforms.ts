/**
 * Waveform engine — deterministic, physics-based output waveforms of an ideal single-phase H-bridge.
 *
 * MODEL ASSUMPTIONS (documented so students can see what is and isn't modelled):
 *  1. Switches are ideal: zero on-resistance, zero switching time, no dead-time.
 *  2. The DC bus is stiff (constant Vdc, no ripple) and the output is measured across a resistive load
 *     directly on the bridge (no transformer) unless stated otherwise.
 *  3. 'pure-sine' is the ideal filtered output of a sinusoidal PWM bridge: v = m·Vdc·sin(ωt).
 *     The unfiltered bridge voltage is the 'pwm' waveform (unipolar SPWM).
 *  4. 'rectified' is an ideal full-wave rectified sine of peak Vdc (diode drops ignored).
 *
 * No random values are used anywhere: identical parameters always give identical results.
 */

import type { WaveformKind } from '../../types/domain'

export interface WaveformParams {
  /** DC bus voltage (V). For 'rectified' it is the peak of the sine being rectified. */
  vdc: number
  /** Fundamental frequency (Hz). */
  frequencyHz: number
  /** Modified sine: conduction angle per half cycle (degrees, 0–180). */
  conductionDeg: number
  /** SPWM modulation index (0–1). */
  modulationIndex: number
  /** SPWM carrier (switching) frequency (Hz). */
  carrierHz: number
}

export const DEFAULT_PARAMS: WaveformParams = {
  vdc: 325,
  frequencyHz: 50,
  conductionDeg: 120,
  modulationIndex: 1,
  carrierHz: 1000,
}

const TAU = Math.PI * 2

/** Symmetric triangle carrier in [-1, 1] at phase p (cycles). */
function triangle(p: number): number {
  const x = p - Math.floor(p)
  return x < 0.5 ? 4 * x - 1 : 3 - 4 * x
}

/** Instantaneous output voltage at time t (seconds). */
export function instantaneous(kind: WaveformKind, p: WaveformParams, t: number): number {
  const theta = TAU * p.frequencyHz * t
  const s = Math.sin(theta)
  switch (kind) {
    case 'square':
      return s >= 0 ? p.vdc : -p.vdc
    case 'modified-sine': {
      // Quasi-square: ±Vdc for a window of width α centred on each half-cycle peak, 0 otherwise.
      const alpha = (Math.min(Math.max(p.conductionDeg, 0), 180) * Math.PI) / 180
      const half = ((theta % TAU) + TAU) % TAU
      const inHalf = half % Math.PI
      const on = Math.abs(inHalf - Math.PI / 2) < alpha / 2
      if (!on) return 0
      return half < Math.PI ? p.vdc : -p.vdc
    }
    case 'pure-sine':
      return p.modulationIndex * p.vdc * s
    case 'pwm': {
      // Unipolar SPWM: leg A compares +m·sin with carrier, leg B compares −m·sin with carrier.
      const ref = p.modulationIndex * s
      const c = triangle(p.carrierHz * t)
      const a = ref > c ? 1 : 0
      const b = -ref > c ? 1 : 0
      return p.vdc * (a - b)
    }
    case 'rectified':
      return Math.abs(p.vdc * s)
  }
}

/** Sample exactly `cycles` fundamental periods with `perCycle` midpoint samples each. */
export function sampleWaveform(kind: WaveformKind, p: WaveformParams, perCycle = 2000, cycles = 1): Float64Array {
  const n = perCycle * cycles
  const T = 1 / p.frequencyHz
  const out = new Float64Array(n)
  for (let i = 0; i < n; i++) out[i] = instantaneous(kind, p, ((i + 0.5) / perCycle) * T)
  return out
}

export interface WaveformAnalysis {
  peak: number
  rms: number
  average: number
  /** RMS of the fundamental (first-harmonic) component. */
  fundamentalRms: number
  /** Total harmonic distortion relative to the fundamental (ratio, not %). NaN when fundamental ≈ 0. */
  thd: number
  /** Harmonic amplitudes (peak) for orders 1..maxOrder. Index 0 is order 1. */
  harmonics: number[]
}

/**
 * Analyse one or more whole cycles of samples.
 * THD uses Parseval's theorem: THD = √(Vrms² − V₀² − V₁²) / V₁, which includes every harmonic
 * up to the sampling Nyquist limit without computing a full spectrum.
 */
export function analyse(samples: Float64Array, cycles = 1, maxOrder = 25): WaveformAnalysis {
  const n = samples.length
  let sum = 0
  let sumSq = 0
  let peak = 0
  for (let i = 0; i < n; i++) {
    const v = samples[i]
    sum += v
    sumSq += v * v
    if (Math.abs(v) > peak) peak = Math.abs(v)
  }
  const average = sum / n
  const rms = Math.sqrt(sumSq / n)

  const harmonics: number[] = []
  for (let k = 1; k <= maxOrder; k++) {
    let a = 0
    let b = 0
    const w = (TAU * k * cycles) / n
    for (let i = 0; i < n; i++) {
      const ph = w * (i + 0.5)
      a += samples[i] * Math.cos(ph)
      b += samples[i] * Math.sin(ph)
    }
    harmonics.push((2 / n) * Math.hypot(a, b))
  }
  const fundamentalRms = harmonics[0] / Math.SQRT2
  const distortionSq = Math.max(rms * rms - average * average - fundamentalRms * fundamentalRms, 0)
  const thd = fundamentalRms > 1e-9 ? Math.sqrt(distortionSq) / fundamentalRms : Number.NaN
  return { peak, rms, average, fundamentalRms, thd, harmonics }
}

/** Closed-form reference values used to validate the numerical engine (see waveforms.test.ts). */
export const theory = {
  squareRms: (vdc: number) => vdc,
  squareFundamentalRms: (vdc: number) => (4 * vdc) / (Math.PI * Math.SQRT2),
  squareThd: () => Math.sqrt((Math.PI * Math.PI) / 8 - 1),
  modifiedRms: (vdc: number, deg: number) => vdc * Math.sqrt(deg / 180),
  modifiedFundamentalRms: (vdc: number, deg: number) =>
    ((4 * vdc) / Math.PI) * Math.sin(((deg / 2) * Math.PI) / 180) / Math.SQRT2,
  sineRms: (vdc: number, m: number) => (m * vdc) / Math.SQRT2,
  rectifiedAverage: (vpk: number) => (2 * vpk) / Math.PI,
}
