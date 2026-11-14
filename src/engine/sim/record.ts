import type { CircuitDoc } from '../circuit/types'
import { TransientSim, type SimOptions } from './transient'

/**
 * Headless run: simulate a circuit for `duration` seconds and keep the last `keep` seconds of the
 * requested signals at full resolution. Used by the experiment evaluator (in the worker) and tests.
 */
export interface RunResult {
  ok: boolean
  error?: string
  h: number
  /** Time of the first kept sample. */
  t0: number
  traces: Record<string, Float64Array>
  sim: TransientSim | null
}

export function recordRun(doc: CircuitDoc, duration: number, keys: string[], keep = duration, opts: SimOptions = {}): RunResult {
  const made = TransientSim.fromDoc(doc, opts)
  if ('error' in made) return { ok: false, error: made.error, h: 0, t0: 0, traces: {}, sim: null }
  const s = made
  const total = Math.round(duration / s.h)
  const n = Math.min(total, Math.round(keep / s.h))
  const getters = keys.map((k) => s.probe(k))
  const traces: Record<string, Float64Array> = {}
  keys.forEach((k) => (traces[k] = new Float64Array(n)))
  const missing = keys.filter((_, c) => !getters[c])
  if (missing.length) return { ok: false, error: `The circuit no longer has: ${missing.join(', ')}.`, h: s.h, t0: 0, traces, sim: s }
  for (let step = 0; step < total; step++) {
    if (!s.step()) return { ok: false, error: s.status.error, h: s.h, t0: 0, traces, sim: s }
    const j = step - (total - n)
    if (j >= 0) getters.forEach((g, c) => (traces[keys[c]][j] = g!()))
  }
  return { ok: true, h: s.h, t0: (total - n + 1) * s.h, traces, sim: s }
}
