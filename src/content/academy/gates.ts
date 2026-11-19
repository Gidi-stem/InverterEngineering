import type { ProgressData } from '../../types/progress'
import { SHELL_BY_ID as COURSE_BY_ID } from './shells'
import { courseComplete } from './logic'

/**
 * Prerequisite gates for practical laboratory work (CURRICULUM-BLUEPRINT §1.1):
 * - F1 before any practical activity involving electrical systems;
 * - F2 before DC circuit construction, battery engineering and solar/battery practicals,
 *   except F2's own practical exercises, which need F1 only.
 * Study (library reading, exploring the 3D models, academy lessons) is never gated here.
 * A gate course that is not yet published is not enforced (it cannot be passed).
 */
export type PracticalArea = 'circuit' | 'build' | 'solar' | 'lab3d-procedure' | 'instrument' | 'repair'

/** F2's own practical tasks in the circuit laboratory (F1 required). */
export const F2_PRACTICAL_EXERCISES = ['ckt-01', 'ckt-02', 'ckt-03', 'sim-01', 'sim-02']

export function requiredCourses(area: PracticalArea, ex?: string | null): string[] {
  if (area === 'lab3d-procedure') return ['F1']
  if (area === 'circuit' && ex && F2_PRACTICAL_EXERCISES.includes(ex)) return ['F1']
  return ['F1', 'F2']
}

export interface GateStatus {
  open: boolean
  required: string[]
  missing: { id: string; title: string }[]
}

export function gateStatus(p: ProgressData, area: PracticalArea, ex?: string | null): GateStatus {
  const required = requiredCourses(area, ex)
  const missing = required
    .map((id) => COURSE_BY_ID[id])
    .filter((c) => c && c.status === 'published' && !courseComplete(p, c))
    .map((c) => ({ id: c.id, title: c.title }))
  return { open: missing.length === 0, required, missing }
}
