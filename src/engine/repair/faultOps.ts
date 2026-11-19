import { cloneDoc } from '../circuit/build'
import type { CircuitDoc } from '../circuit/types'

/**
 * Generic CircuitDoc edits used to inject a fault into a scenario's healthy circuit — the same
 * three edits the Build lab's own troubleshooting tasks already use (`content/buildProjects.ts`):
 * disconnect a terminal (open fault), force a parameter (drift/degradation fault), or force a
 * state (stuck-closed/stuck-open fault). No solving logic lives here; these only edit the document
 * that the one real circuit engine then solves.
 */
export const removeWiresTouching = (doc: CircuitDoc, ref: string): CircuitDoc => {
  const d = cloneDoc(doc)
  d.wires = d.wires.filter((w) => `${w.a.partId}.${w.a.terminalId}` !== ref && `${w.b.partId}.${w.b.terminalId}` !== ref)
  return d
}

export const withParam = (doc: CircuitDoc, partId: string, key: string, value: number): CircuitDoc => {
  const d = cloneDoc(doc)
  const p = d.parts.find((x) => x.id === partId)
  if (p) p.params[key] = value
  return d
}

export const withState = (doc: CircuitDoc, partId: string, key: string, value: number): CircuitDoc => {
  const d = cloneDoc(doc)
  const p = d.parts.find((x) => x.id === partId)
  if (p) p.states[key] = value
  return d
}

/** Simulate a part shorted across its own two named terminals by driving the equivalent circuit
 * param to a near-zero value where the part has one (resistor/fuse/breaker 'R'/'Irated' is not a
 * short, so this only applies to parts with a genuine series-resistance param). */
export const shortedResistance = 0.02
export const openResistance = 5_000_000
