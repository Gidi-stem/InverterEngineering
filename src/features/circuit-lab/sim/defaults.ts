import type { SimExperiment } from '../../../content/simExperiments'
import { param } from '../../../engine/circuit/parts'
import type { CircuitDoc } from '../../../engine/circuit/types'
import { TIME_DIVS } from './scale'
import type { ScopeSettings } from './useSimulation'

const blank = { key: '', perDiv: 1, offset: 0, on: false }

export function scopeFromExperiment(e: SimExperiment): ScopeSettings {
  const ch = e.scope.channels.map((c) => ({ key: c.key, perDiv: c.perDiv, offset: 0, on: true }))
  while (ch.length < 4) ch.push({ ...blank })
  return { timeDiv: e.scope.timeDiv, channels: ch.slice(0, 4), trigger: true, spectrumOf: 0 }
}

/** Sensible first view for a free circuit: the main load's voltage and current, two periods on screen. */
export function defaultScope(doc: CircuitDoc): ScopeSettings {
  const order = ['ac-load', 'dc-load', 'led', 'electrolytic', 'capacitor', 'inductor', 'resistor']
  const load = order.map((t) => doc.parts.find((p) => p.type === t)).find(Boolean)
  let period = 0
  for (const p of doc.parts) {
    if (p.type === 'ac-source') period = Math.max(period, 1 / param(p, 'f'))
    if (p.type === 'gate-source' && (p.states.mode ?? 0) === 1) period = Math.max(period, 1 / param(p, 'f'))
    if (p.type === 'gate-source' && p.states.mode === 2) period = Math.max(period, 1 / param(p, 'fm'))
  }
  const want = period ? (2 * period) / 10 : 1e-3
  const timeDiv = TIME_DIVS.find((t) => t >= want * 0.999) ?? 1e-3
  const channels = [
    load ? { key: `V:${load.id}`, perDiv: 5, offset: 0, on: true } : { ...blank },
    load ? { key: `I:${load.id}`, perDiv: 0.5, offset: 0, on: true } : { ...blank },
    { ...blank },
    { ...blank },
  ]
  return { timeDiv, channels, trigger: true, spectrumOf: 0 }
}
