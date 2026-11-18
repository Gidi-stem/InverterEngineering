/**
 * Virtual oscilloscope engine. Samples the SAME physics-based waveform engine Phase 5 uses
 * (`engine/waveform/waveforms.ts`, `instantaneous()`), so an inverter's square-wave, modified-sine,
 * SPWM/PWM, pure-sine or rectified output on this scope is the identical model the simulator shows
 * elsewhere — not a separate fabricated trace. Measurement math (RMS, duty cycle, frequency) is
 * computed once here from the sampled trace, so every instrument and course lesson that needs it
 * reads from this one place rather than duplicating the arithmetic.
 */
import { instantaneous, type WaveformParams } from '../waveform/waveforms'
import type { WaveformKind } from '../../types/domain'

export interface ScopeSettings {
  waveform: WaveformKind
  params: WaveformParams
  /** Time per division, seconds. The frame shows 10 horizontal divisions, as on a real scope. */
  timePerDiv: number
  /** Volts per division. The frame shows 8 vertical divisions (±4). */
  voltsPerDiv: number
  /** Trigger level, volts; the trace starts at the first rising crossing of this level. */
  triggerLevel: number
  /** Samples drawn across the frame. */
  samples?: number
}

export interface ScopeTrace {
  /** [time (s), voltage (V)] pairs across one frame (10 × timePerDiv). */
  points: [number, number][]
  frameSeconds: number
  /** Measurements derived from one full fundamental period captured within (or spanning) the frame. */
  measurements: ScopeMeasurements
}

export interface ScopeMeasurements {
  periodS: number | null
  frequencyHz: number | null
  vPeak: number
  vPeakToPeak: number
  vRms: number
  vAverage: number
  /** Fraction of the period the signal is at its higher level (square/modified-sine/PWM only). */
  dutyCycle: number | null
}

const DEFAULT_DIVS_H = 10
const DEFAULT_DIVS_V = 8

/** Finds the first rising crossing of `level` at or after `fromT`, by linear search at fine resolution. */
function firstRisingCrossing(f: (t: number) => number, fromT: number, toT: number, level: number, steps = 4000): number {
  const dt = (toT - fromT) / steps
  let prev = f(fromT)
  for (let i = 1; i <= steps; i++) {
    const t = fromT + i * dt
    const v = f(t)
    if (prev < level && v >= level) return t - dt * (v - level === 0 ? 0 : (level - prev) / (v - prev))
    prev = v
  }
  return fromT
}

/** Samples one frame of the waveform, triggered on the requested level, and measures it. */
export function captureScope(s: ScopeSettings): ScopeTrace {
  const frameSeconds = s.timePerDiv * DEFAULT_DIVS_H
  const n = s.samples ?? 1000
  const f = (t: number) => instantaneous(s.waveform, s.params, t)

  // Trigger: search up to two fundamental periods back from t=0 for a clean rising edge, so the
  // displayed frame always starts at the same point of the cycle, as a real scope's trigger does.
  const period = s.params.frequencyHz > 0 ? 1 / s.params.frequencyHz : frameSeconds
  const searchFrom = -2 * period
  const t0 = firstRisingCrossing(f, searchFrom, searchFrom + 2 * period + frameSeconds, s.triggerLevel)

  const points: [number, number][] = []
  for (let i = 0; i <= n; i++) {
    const t = t0 + (i / n) * frameSeconds
    points.push([t - t0, f(t)])
  }

  const measurements = measure(f, t0, period, s.params.frequencyHz)
  return { points, frameSeconds, measurements }
}

/** Measures one fundamental period of the signal starting at `t0`, by dense sampling. */
function measure(f: (t: number) => number, t0: number, period: number, frequencyHz: number): ScopeMeasurements {
  const n = 2000
  let sum = 0
  let sumSq = 0
  let vMax = -Infinity
  let vMin = Infinity
  let highSamples = 0
  const threshold = 0 // high/low split for duty-cycle counting on bipolar waveforms
  for (let i = 0; i < n; i++) {
    const t = t0 + (i / n) * period
    const v = f(t)
    sum += v
    sumSq += v * v
    if (v > vMax) vMax = v
    if (v < vMin) vMin = v
    if (v > threshold) highSamples++
  }
  const vAverage = sum / n
  const vRms = Math.sqrt(sumSq / n)
  const vPeak = Math.max(Math.abs(vMax), Math.abs(vMin))
  return {
    periodS: frequencyHz > 0 ? period : null,
    frequencyHz: frequencyHz > 0 ? frequencyHz : null,
    vPeak,
    vPeakToPeak: vMax - vMin,
    vRms,
    vAverage,
    dutyCycle: frequencyHz > 0 ? highSamples / n : null,
  }
}

export const SCOPE_GRID = { divsH: DEFAULT_DIVS_H, divsV: DEFAULT_DIVS_V }
