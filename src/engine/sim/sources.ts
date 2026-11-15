import { param, stateOf } from '../circuit/parts'
import type { PlacedPart } from '../circuit/types'

/**
 * Time functions of the independent sources. Deterministic: a source's value depends only on its
 * parameters and t.
 *
 * Pulse / gate generator modes:
 *   0 Static : level state (High/Low)
 *   1 PWM    : high for duty·T of each period, delayed by phase/360·T
 *   2 SPWM   : bipolar sinusoidal PWM, high while m·sin(2π·fm·t) > triangle carrier at f
 *   3 SPWM regulated : as SPWM, with m supplied by the output-voltage regulator
 * "Inverted" complements the logic; dead time delays every turn-on edge by td (the output is high
 * only if the logic was already high td earlier), as a gate-drive dead-time circuit does.
 */
const TAU = 2 * Math.PI

/** Symmetric triangle in [−1, 1] with period 1, starting at −1 (phase 0). */
export function triangle(x: number): number {
  const f = x - Math.floor(x)
  return f < 0.5 ? 4 * f - 1 : 3 - 4 * f
}

export interface GeneratorSpec {
  mode: number
  level: number
  invert: boolean
  f: number
  duty: number
  phase: number
  fm: number
  m: number
  td: number
  vhigh: number
}

export function generatorSpec(p: PlacedPart): GeneratorSpec {
  return {
    mode: stateOf(p, 'mode'),
    level: stateOf(p, 'level'),
    invert: stateOf(p, 'invert') === 1,
    f: param(p, 'f'),
    duty: param(p, 'duty') / 100,
    phase: param(p, 'phase') / 360,
    fm: param(p, 'fm'),
    m: param(p, 'm'),
    td: param(p, 'td') * 1e-6,
    vhigh: param(p, 'Vhigh'),
  }
}

function rawLogic(g: GeneratorSpec, t: number): boolean {
  let on: boolean
  if (g.mode === 1) {
    const x = t * g.f - g.phase
    let frac = x - Math.floor(x)
    if (frac > 1 - 1e-9) frac = 0
    // Compare in a tolerance band so edges that land on a step boundary are not lost to rounding.
    on = frac < g.duty - 1e-9
  } else {
    on = g.m * Math.sin(TAU * g.fm * t) > triangle(t * g.f)
  }
  return g.invert ? !on : on
}

/** Generator logic output (true = OUT driven high) at time t. */
export function generatorHigh(g: GeneratorSpec, t: number, mOverride?: number): boolean {
  if (g.mode === 0) return g.level === 1
  const spec = g.mode === 3 ? { ...g, mode: 2, m: mOverride ?? g.m } : g
  if (!rawLogic(spec, t)) return false
  return spec.td > 0 ? rawLogic(spec, t - spec.td) : true
}

export const acValue = (vrms: number, f: number, t: number) => vrms * Math.SQRT2 * Math.sin(TAU * f * t)
