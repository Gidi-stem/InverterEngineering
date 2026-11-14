import { defaultParams, defaultStates } from './parts'
import type { CircuitDoc, PartType, Rotation } from './types'

/**
 * Small fluent builder for circuits in code (exercise solutions, tests).
 *   circuit().add('B1', 'battery', 0, 0).add('R1', 'resistor', 4, -2).wire('B1.+', 'R1.1').doc
 * The part id doubles as its label.
 */
export function circuit() {
  const doc: CircuitDoc = { version: 1, parts: [], wires: [] }
  const api = {
    doc,
    add(id: string, type: PartType, x: number, y: number, rotation: Rotation = 0, params: Record<string, number> = {}, states: Record<string, number> = {}) {
      doc.parts.push({ id, type, label: id, x, y, rotation, params: { ...defaultParams(type), ...params }, states: { ...defaultStates(type), ...states } })
      return api
    },
    wire(a: string, b: string) {
      const [pa, ta] = split(a)
      const [pb, tb] = split(b)
      doc.wires.push({ id: `w${doc.wires.length + 1}`, a: { partId: pa, terminalId: ta }, b: { partId: pb, terminalId: tb } })
      return api
    },
  }
  return api
}

/** "Q1.d" → ["Q1", "d"]; terminal ids may contain + and − (e.g. "CB1.in+"). */
function split(ref: string): [string, string] {
  const i = ref.indexOf('.')
  return [ref.slice(0, i), ref.slice(i + 1)]
}

export const cloneDoc = (d: CircuitDoc): CircuitDoc => JSON.parse(JSON.stringify(d))
