/**
 * Waveform measurements on uniformly sampled data (sample spacing dt). These are the same
 * definitions a digital oscilloscope uses:
 *  - frequency from rising crossings of the mid level (with 10 % hysteresis against noise and PWM edges)
 *  - mean / RMS / duty over a whole number of cycles when a frequency is found (cycle RMS)
 *  - harmonics by direct DFT at k·f₀ over whole cycles; THD = √(Σ_{k≥2} A_k²) / A₁
 */
export interface Measurements {
  mean: number
  rms: number
  /** RMS of the AC part: √(rms² − mean²). */
  acRms: number
  min: number
  max: number
  pkpk: number
  /** Hz, or null when less than one full cycle is visible. */
  freq: number | null
  /** Fraction of time above the mid level (0–1), null without a frequency. */
  duty: number | null
  /** Number of whole cycles the mean/RMS/duty were taken over (0 = whole window). */
  cycles: number
}

export function measure(x: ArrayLike<number>, dt: number): Measurements {
  const n = x.length
  if (!n) return { mean: 0, rms: 0, acRms: 0, min: 0, max: 0, pkpk: 0, freq: null, duty: null, cycles: 0 }
  let min = Infinity
  let max = -Infinity
  for (let i = 0; i < n; i++) {
    if (x[i] < min) min = x[i]
    if (x[i] > max) max = x[i]
  }
  const pkpk = max - min
  const mid = (max + min) / 2
  const hyst = 0.1 * pkpk
  const rising: number[] = []
  let armed = false
  if (pkpk > 1e-9) {
    for (let i = 1; i < n; i++) {
      if (x[i] < mid - hyst) armed = true
      if (armed && x[i - 1] < mid && x[i] >= mid) {
        // Linear interpolation of the crossing instant (sample units).
        const f = (mid - x[i - 1]) / (x[i] - x[i - 1])
        rising.push(i - 1 + f)
        armed = false
      }
    }
  }
  let i0 = 0
  let i1 = n
  let freq: number | null = null
  let cycles = 0
  if (rising.length >= 2) {
    cycles = rising.length - 1
    const period = (rising[rising.length - 1] - rising[0]) / cycles
    freq = 1 / (period * dt)
    i0 = Math.round(rising[0])
    i1 = Math.round(rising[rising.length - 1])
  }
  let s = 0
  let s2 = 0
  let above = 0
  for (let i = i0; i < i1; i++) {
    s += x[i]
    s2 += x[i] * x[i]
    if (x[i] > mid) above++
  }
  const m = i1 - i0
  const mean = s / m
  const rms = Math.sqrt(s2 / m)
  return { mean, rms, acRms: Math.sqrt(Math.max(0, rms * rms - mean * mean)), min, max, pkpk, freq, duty: freq ? above / m : null, cycles }
}

export interface Spectrum {
  f0: number
  /** Peak amplitude of each harmonic, index k = harmonic order (index 0 = DC mean). */
  amp: number[]
  thd: number
  cycles: number
}

/**
 * Harmonic amplitudes at k·f0 (k = 0 … kmax) over the largest whole number of cycles in the data.
 * Returns null if less than one whole cycle is available.
 */
export function spectrum(x: ArrayLike<number>, dt: number, f0: number, kmax = 50): Spectrum | null {
  const perCycle = 1 / (f0 * dt)
  const cycles = Math.floor(x.length / perCycle + 1e-9)
  if (cycles < 1) return null
  const n = Math.round(cycles * perCycle)
  const kTop = Math.min(kmax, Math.floor(1 / (2 * f0 * dt)) - 1)
  const amp: number[] = []
  for (let k = 0; k <= kTop; k++) {
    let re = 0
    let im = 0
    const w = (2 * Math.PI * k * f0 * dt) % (2 * Math.PI)
    for (let i = 0; i < n; i++) {
      re += x[i] * Math.cos(w * i)
      im -= x[i] * Math.sin(w * i)
    }
    amp.push(k === 0 ? re / n : (2 * Math.hypot(re, im)) / n)
  }
  let h = 0
  for (let k = 2; k < amp.length; k++) h += amp[k] * amp[k]
  return { f0, amp, thd: amp[1] > 1e-12 ? Math.sqrt(h) / amp[1] : 0, cycles }
}

/**
 * Time for a first-order response to cover 63.2 % of its step, measured from index i0 (or null).
 * `final` is the settled value; by default the last sample (which must then be well settled).
 */
export function timeConstant(x: ArrayLike<number>, dt: number, i0: number, i1 = x.length, final?: number): number | null {
  const v0 = x[i0]
  const vEnd = final ?? x[i1 - 1]
  const target = v0 + 0.632 * (vEnd - v0)
  const up = vEnd > v0
  for (let i = i0 + 1; i < i1; i++) {
    if (up ? x[i] >= target : x[i] <= target) {
      const f = (target - x[i - 1]) / (x[i] - x[i - 1])
      return (i - 1 - i0 + f) * dt
    }
  }
  return null
}
