import type { ProgressData } from '../../types/progress'
import { COMPETENCIES, COURSE_BY_ID, COURSES } from './catalogue'
import { courseComplete, evidenceMet, examStatus, lessonDone, moduleStatus } from './logic'
import type { Course } from './types'

/**
 * Catalogue-dependent Academy logic: course prerequisite unlocking and the competency record. Both
 * need full course titles and need to walk every course's modules, so — unlike `./logic` — this
 * file imports the full, authored catalogue (`./catalogue`). It is used only from inside the
 * Learning Academy's own pages (`features/academy/AcademyPages.tsx`), which are already a separate,
 * lazily-loaded route, so importing the full catalogue here does not affect the dashboard or the
 * prerequisite gates on the circuit/build/solar/3D laboratory pages (see `./gates`, `./shells`).
 */

export interface Unlock {
  unlocked: boolean
  /** Published prerequisites not yet passed: these lock the course. */
  missing: string[]
  /** Scheduled prerequisites: shown as recommended prior study (blueprint §1.1). */
  recommended: string[]
}

export function courseUnlock(p: ProgressData, c: Course): Unlock {
  const missing: string[] = []
  const recommended: string[] = []
  for (const id of c.prerequisites) {
    const pre = COURSE_BY_ID[id]
    if (!pre) continue
    if (pre.status === 'scheduled') recommended.push(id)
    else if (!courseComplete(p, pre)) missing.push(id)
  }
  for (const id of c.recommended ?? []) if (COURSE_BY_ID[id] && !recommended.includes(id) && !courseComplete(p, COURSE_BY_ID[id])) recommended.push(id)
  return { unlocked: missing.length === 0, missing, recommended }
}

export type CompetencyLevel = 'none' | 'awareness' | 'applied' | 'virtual-competency'
export interface CompetencyRecord {
  id: string
  title: string
  level: CompetencyLevel
  evidence: string[]
  available: boolean
}

/** Awareness: a lesson check passed. Applied: every module quiz and practical. Virtual competency: everything including the exam. */
export function competencyRecord(p: ProgressData): CompetencyRecord[] {
  return COMPETENCIES.map((cu) => {
    const courses = cu.courses.map((id) => COURSE_BY_ID[id]).filter(Boolean)
    const published = courses.filter((c) => c.status === 'published')
    const evidence: string[] = []
    let level: CompetencyLevel = 'none'
    if (published.length) {
      const mods = published.flatMap((c) => c.modules)
      const anyLesson = mods.some((m) => m.lessons.some((l) => lessonDone(p, l)))
      const applied = mods.every((m) => moduleStatus(p, m).quizPassed && m.practicals.every((x) => evidenceMet(p, x.evidence)))
      const full = published.every((c) => courseComplete(p, c))
      level = full ? 'virtual-competency' : applied ? 'applied' : anyLesson ? 'awareness' : 'none'
      for (const c of published) {
        for (const m of c.modules) {
          const st = moduleStatus(p, m)
          if (m.quiz && st.quizPassed) evidence.push(`${m.id} quiz ${Math.round(st.quizBest * 100)} %`)
          for (const x of m.practicals) if (evidenceMet(p, x.evidence)) evidence.push(x.title)
        }
        const ex = examStatus(p, c)
        if (ex.passed) evidence.push(`${c.id} examination ${Math.round(ex.best * 100)} %`)
      }
    }
    return { id: cu.id, title: cu.title, level, evidence, available: published.length > 0 }
  })
}

/** Full (non-shell) flattening of every lesson, for tests that check authored content depth. */
export const ALL_LESSONS_FULL = COURSES.flatMap((c) => c.modules.flatMap((m) => m.lessons.map((l) => ({ course: c, module: m, lesson: l }))))
