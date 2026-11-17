import { describe, expect, it } from 'vitest'
import { COURSES, COMPETENCIES, VIRTUAL_COMPETENCY_NOTE } from './catalogue'
import { SHELL_COURSES, SHELL_BY_ID, SHELL_COMPETENCIES, SHELL_VIRTUAL_COMPETENCY_NOTE } from './shells'
import { lessonAuthored } from './types'

/**
 * shells.ts is a generated, lightweight stand-in for the real, fully-authored catalogue (see its
 * own header comment). Nothing keeps it in sync automatically, so this test fails loudly whenever
 * a course's structure changes without regenerating it — a lesson, module, practical or exam
 * added, removed or renamed; a prerequisite, quiz pass mark or exam setting changed.
 *
 * It deliberately does NOT compare the heavy fields (lesson content, question text, assignment
 * briefs) — those are exactly what the shell strips out.
 */
describe('course shells stay in sync with the real catalogue', () => {
  it('has exactly the same course ids, in the same order', () => {
    expect(SHELL_COURSES.map((c) => c.id)).toEqual(COURSES.map((c) => c.id))
  })

  it('matches every course and module structural field', () => {
    for (const c of COURSES) {
      const s = SHELL_BY_ID[c.id]
      expect(s, `shell missing for ${c.id}`).toBeTruthy()
      expect({ title: s.title, level: s.level, stage: s.stage, prerequisites: s.prerequisites, recommended: s.recommended ?? [], status: s.status, phase: s.phase, competency: s.competency }).toEqual({
        title: c.title,
        level: c.level,
        stage: c.stage,
        prerequisites: c.prerequisites,
        recommended: c.recommended ?? [],
        status: c.status,
        phase: c.phase,
        competency: c.competency,
      })
      expect(s.exam ? { pass: s.exam.pass, minutes: s.exam.minutes, attempts: s.exam.attempts, cooldownHours: s.exam.cooldownHours } : null).toEqual(c.exam ? { pass: c.exam.pass, minutes: c.exam.minutes, attempts: c.exam.attempts, cooldownHours: c.exam.cooldownHours } : null)
      expect(s.modules.map((m) => m.id)).toEqual(c.modules.map((m) => m.id))
      c.modules.forEach((m, mi) => {
        const sm = s.modules[mi]
        expect(sm.title).toBe(m.title)
        expect(sm.lessons.map((l) => l.id)).toEqual(m.lessons.map((l) => l.id))
        expect(sm.lessons.map(lessonAuthored)).toEqual(m.lessons.map(lessonAuthored))
        expect(sm.quiz?.pass).toBe(m.quiz?.pass)
        expect(!!sm.assignment).toBe(!!m.assignment)
        expect(sm.practicals.map((x) => ({ id: x.id, title: x.title, evidence: x.evidence }))).toEqual(m.practicals.map((x) => ({ id: x.id, title: x.title, evidence: x.evidence })))
      })
    }
  })

  it('carries the same competency units and virtual-competency note', () => {
    expect(SHELL_COMPETENCIES).toEqual(COMPETENCIES)
    expect(SHELL_VIRTUAL_COMPETENCY_NOTE).toBe(VIRTUAL_COMPETENCY_NOTE)
  })
})
