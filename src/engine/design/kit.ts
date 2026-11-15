import { PART_DEFS } from '../circuit/parts'
import type { CircuitDoc, PlacedPart } from '../circuit/types'
import type { ProjectBuild } from './generate'

/**
 * The parts kit of a build project: the generated parts (with the design's values) that the student
 * places, rotates and wires. Placement alone earns nothing: steps are verified on the connection graph.
 */
export type BuildLevel = 'beginner' | 'intermediate' | 'advanced'

/** Kit parts not yet on the workspace. */
export function kitRemaining(doc: CircuitDoc, build: ProjectBuild): PlacedPart[] {
  const have = new Set(doc.parts.map((p) => p.id))
  return build.doc.parts.filter((p) => !have.has(p.id))
}

/** Place a kit part at a grid position (keeps its id, label, values and default orientation). */
export function placeKitPart(doc: CircuitDoc, part: PlacedPart, x: number, y: number): CircuitDoc {
  if (doc.parts.some((p) => p.id === part.id)) return doc
  return { ...doc, parts: [...doc.parts, { ...part, x: Math.round(x), y: Math.round(y), params: { ...part.params }, states: { ...part.states } }] }
}

/**
 * Bring the student's circuit up to date with the current design and component selection: every
 * kit part keeps its position, rotation and wiring but takes the design's type, label and values.
 * If a part changes type (e.g. MOSFET → IGBT), its wires move to the corresponding terminals.
 */
export function syncToDesign(doc: CircuitDoc, build: ProjectBuild): CircuitDoc {
  const ref = new Map(build.doc.parts.map((p) => [p.id, p]))
  const termMap = new Map<string, Map<string, string>>()
  const parts = doc.parts.map((p) => {
    const r = ref.get(p.id)
    if (!r) return p
    if (r.type !== p.type) {
      const from = PART_DEFS[p.type].terminals
      const to = PART_DEFS[r.type].terminals
      termMap.set(p.id, new Map(from.map((t, i) => [t.id, to[i]?.id ?? t.id])))
    }
    return { ...p, type: r.type, label: r.label, params: { ...r.params }, states: { ...r.states } }
  })
  const wires = termMap.size
    ? doc.wires.map((w) => ({
        ...w,
        a: termMap.has(w.a.partId) ? { ...w.a, terminalId: termMap.get(w.a.partId)!.get(w.a.terminalId) ?? w.a.terminalId } : w.a,
        b: termMap.has(w.b.partId) ? { ...w.b, terminalId: termMap.get(w.b.partId)!.get(w.b.terminalId) ?? w.b.terminalId } : w.b,
      }))
    : doc.wires
  return { ...doc, parts, wires }
}

/** True when the student's kit parts already carry the design's values. */
export function inSyncWithDesign(doc: CircuitDoc, build: ProjectBuild): boolean {
  const ref = new Map(build.doc.parts.map((p) => [p.id, p]))
  return doc.parts.every((p) => {
    const r = ref.get(p.id)
    return !r || (r.type === p.type && JSON.stringify(r.params) === JSON.stringify(p.params) && JSON.stringify(r.states) === JSON.stringify(p.states))
  })
}

/** Starting workspace: beginners get every part pre-placed (wires still to connect); others start empty. */
export function starterDoc(build: ProjectBuild, level: BuildLevel): CircuitDoc {
  if (level === 'beginner') return { version: 1, parts: build.doc.parts.map((p) => ({ ...p, params: { ...p.params }, states: { ...p.states } })), wires: [] }
  return { version: 1, parts: [], wires: [] }
}
