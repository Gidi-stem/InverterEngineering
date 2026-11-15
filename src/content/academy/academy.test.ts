import { describe, expect, it } from 'vitest'
import { emptyProgress } from '../../store/progressStore'
import { sanitizeProgress } from '../../store/sanitize'
import type { Attempt, ProgressData } from '../../types/progress'
import { BUILD_PROJECT_BY_ID } from '../buildProjects'
import { CIRCUIT_EXERCISE_BY_ID } from '../circuitExercises'
import { COMPONENT_BY_ID } from '../components'
import { COMPARISON_BY_ID } from '../components/comparisons'
import { TEST_PROCEDURES } from '../components/testing'
import { MODEL_BY_ID } from '../models'
import { MODULES } from '../modules'
import { SIM_EXPERIMENT_BY_ID } from '../simExperiments'
import { COMPETENCIES, COURSE_BY_ID, COURSES } from './catalogue'
import { GLOSSARY, glossaryRefs } from './glossary'
import { ALL_LESSONS, competencyRecord, courseUnlock, examStatus, lessonDone, markAll, markQuestion, moduleStatus, practicalCredited, quizAvailability, seededOrder } from './logic'
import { routeOf } from './routes'
import { DIAGRAM_IDS, type LessonContent, type Question, type ToolLink } from './types'

const published = ALL_LESSONS.filter((x) => x.lesson.content)
const textOf = (c: LessonContent) =>
  [c.introduction, c.lecture, c.technical, c.applications, ...c.objectives, ...c.summary, ...c.mistakes.flatMap((m) => [m.mistake, m.correction]), c.demo.text, ...c.examples.flatMap((e) => [e.problem, ...e.steps, e.answer, e.check ?? '']), c.homework.brief].join('\n')

function linkExists(l: ToolLink): boolean {
  switch (l.kind) {
    case 'lab3d':
      return (!l.model || !!MODEL_BY_ID[l.model]) && (!l.part || (!!l.model && MODEL_BY_ID[l.model].parts.some((p) => p.id === l.part)))
    case 'library':
      return !!COMPONENT_BY_ID[l.id]
    case 'procedure':
      return !!COMPONENT_BY_ID[l.component] && (TEST_PROCEDURES[l.component] ?? []).some((t) => t.id === l.procedure)
    case 'compare':
      return !!COMPARISON_BY_ID[l.id]
    case 'circuit':
      return !!CIRCUIT_EXERCISE_BY_ID[l.ex]
    case 'sim':
      return !!SIM_EXPERIMENT_BY_ID[l.exp]
    case 'build':
      return !!BUILD_PROJECT_BY_ID[l.project]
  }
}

function questionValid(q: Question): string | null {
  if (!q.prompt || !q.explain) return `${q.id}: prompt and explanation required`
  if (q.type === 'mcq') return q.options.length >= 2 && q.answer >= 0 && q.answer < q.options.length ? null : `${q.id}: bad answer index`
  if (q.type === 'multi') return q.answers.length >= 1 && q.answers.every((a) => a >= 0 && a < q.options.length) && new Set(q.answers).size === q.answers.length ? null : `${q.id}: bad answers`
  return Number.isFinite(q.answer) && q.tol > 0 && q.tol <= 0.05 ? null : `${q.id}: numeric answer/tolerance`
}
const uniqueIds = (qs: Question[]) => new Set(qs.map((q) => q.id)).size === qs.length

describe('curriculum structure', () => {
  it('has fifteen courses in three stages, each with modules and lessons', () => {
    expect(COURSES.map((c) => c.id)).toEqual(['F1', 'F2', 'F3', 'F4', 'F5', 'P1', 'P2', 'P3', 'P4', 'P5', 'S1', 'S2', 'S3', 'S4', 'S5'])
    for (const c of COURSES) {
      expect(c.modules.length).toBeGreaterThan(0)
      for (const m of c.modules) expect(m.lessons.length).toBeGreaterThan(0)
      for (const p of c.prerequisites) expect(COURSE_BY_ID[p], `${c.id} prerequisite ${p}`).toBeTruthy()
    }
  })
  it('scheduled courses carry no lesson content (no placeholder pages)', () => {
    for (const c of COURSES.filter((x) => x.status === 'scheduled')) for (const m of c.modules) for (const l of m.lessons) expect(l.content).toBeUndefined()
  })
  it('every competency unit maps to existing courses', () => {
    for (const cu of COMPETENCIES) for (const id of cu.courses) expect(COURSE_BY_ID[id]).toBeTruthy()
  })
  it('S1 is fully published: 20 lessons, six modules with quizzes, assignments and practicals, and an examination', () => {
    const s1 = COURSE_BY_ID.S1
    expect(s1.status).toBe('published')
    expect(s1.modules).toHaveLength(6)
    expect(s1.modules.flatMap((m) => m.lessons).filter((l) => l.content)).toHaveLength(20)
    for (const m of s1.modules) {
      expect(m.quiz!.questions.length, m.id).toBeGreaterThanOrEqual(6)
      expect(m.assignment, m.id).toBeTruthy()
      expect(m.practicals.length, m.id).toBeGreaterThanOrEqual(1)
    }
    expect(s1.exam!.questions.length).toBeGreaterThanOrEqual(20)
    // Every build project is a practical somewhere in S1.
    const projects = s1.modules.flatMap((m) => m.practicals).filter((p) => p.evidence.kind === 'project').map((p) => (p.evidence as { id: string }).id)
    expect(projects.sort()).toEqual(['bld-a', 'bld-b', 'bld-c', 'bld-d', 'bld-e', 'bld-f', 'bld-g', 'bld-h'])
  })
})

describe('lesson standard (14 sections, minimum depth)', () => {
  for (const { lesson: l } of published) {
    it(`${l.id} ${l.title}`, () => {
      const c = l.content!
      expect(c.objectives.length).toBeGreaterThanOrEqual(3)
      expect(c.introduction.length).toBeGreaterThan(200)
      expect(c.lecture.length).toBeGreaterThan(1500)
      expect(c.technical.length).toBeGreaterThan(400)
      expect(c.diagrams.length).toBeGreaterThanOrEqual(1)
      expect(c.formulas.length).toBeGreaterThanOrEqual(1)
      expect(c.examples.length).toBeGreaterThanOrEqual(2)
      for (const e of c.examples) expect(e.steps.length).toBeGreaterThanOrEqual(2)
      expect(c.applications.length).toBeGreaterThan(100)
      expect(c.mistakes.length).toBeGreaterThanOrEqual(3)
      expect(c.demo.text.length).toBeGreaterThan(40)
      expect(c.activities.length).toBeGreaterThanOrEqual(1)
      expect(c.check.length).toBeGreaterThanOrEqual(3)
      expect(c.summary.length).toBeGreaterThanOrEqual(4)
      expect(c.homework.tasks.length + c.homework.written.length).toBeGreaterThanOrEqual(2)
      for (const f of c.formulas) for (const [sym, meaning] of f.where) expect(sym && meaning).toBeTruthy()
    })
  }
})

describe('questions, links, diagrams and glossary', () => {
  const allQuestionSets = COURSES.flatMap((c) => [
    ...(c.exam ? [{ id: `${c.id} exam`, qs: c.exam.questions }] : []),
    ...c.modules.flatMap((m) => [
      ...(m.quiz ? [{ id: `${m.id} quiz`, qs: m.quiz.questions }] : []),
      ...(m.assignment ? [{ id: m.assignment.id, qs: m.assignment.tasks }] : []),
      ...m.lessons.flatMap((l) => (l.content ? [{ id: `${l.id} check`, qs: l.content.check }, { id: l.content.homework.id, qs: l.content.homework.tasks }] : [])),
    ]),
  ])
  it('every question is well formed and ids are unique within each set', () => {
    const errors = allQuestionSets.flatMap((s) => [...s.qs.map(questionValid).filter(Boolean).map((e) => `${s.id} ${e}`), ...(uniqueIds(s.qs) ? [] : [`${s.id}: duplicate ids`])])
    expect(errors).toEqual([])
  })
  it('the correct answer of every question marks as correct, and wrong answers do not', () => {
    for (const s of allQuestionSets)
      for (const q of s.qs) {
        const right = q.type === 'mcq' ? q.answer : q.type === 'multi' ? q.answers : q.answer
        expect(markQuestion(q, right), `${s.id} ${q.id}`).toBe(true)
        const wrong = q.type === 'mcq' ? (q.answer + 1) % q.options.length : q.type === 'multi' ? [] : q.answer * 1.2 + 1
        expect(markQuestion(q, wrong), `${s.id} ${q.id}`).toBe(false)
      }
  })
  it('every laboratory link resolves to a real model part, entry, procedure, comparison, exercise, experiment or project', () => {
    const links = COURSES.flatMap((c) => c.modules.flatMap((m) => [...m.practicals.map((p) => p.link), ...m.lessons.flatMap((l) => (l.content ? [l.content.demo.link, ...l.content.activities] : []))]))
    expect(links.length).toBeGreaterThan(50)
    expect(links.filter((l) => !linkExists(l)).map((l) => `${l.kind}:${JSON.stringify(l)}`)).toEqual([])
    for (const l of links) expect(routeOf(l).startsWith('/')).toBe(true)
  })
  it('every diagram id is implemented or is a schematic of a real project', () => {
    for (const { lesson } of published)
      for (const d of lesson.content!.diagrams) {
        if (d.id.startsWith('schematic:')) expect(BUILD_PROJECT_BY_ID[d.id.slice(10)], d.id).toBeTruthy()
        else expect((DIAGRAM_IDS as readonly string[]).includes(d.id), d.id).toBe(true)
      }
  })
  it('every glossary term used in lesson text exists', () => {
    const missing = published.flatMap(({ lesson }) => glossaryRefs(textOf(lesson.content!)).filter((r) => !GLOSSARY[r]).map((r) => `${lesson.id}: ${r}`))
    expect(missing).toEqual([])
    expect(published.flatMap(({ lesson }) => glossaryRefs(textOf(lesson.content!))).length).toBeGreaterThan(60)
  })
  it('legacy lesson ids refer to real platform lessons', () => {
    const ids = new Set(MODULES.flatMap((m) => m.lessons.map((l) => l.id)))
    for (const { lesson } of ALL_LESSONS) if (lesson.legacyId) expect(ids.has(lesson.legacyId), lesson.legacyId).toBe(true)
  })
  it('practical evidence refers to real projects, experiments and troubleshooting tasks', () => {
    for (const c of COURSES)
      for (const m of c.modules)
        for (const p of m.practicals) {
          const e = p.evidence
          if (e.kind === 'project' || e.kind === 'troubleshoot') expect(BUILD_PROJECT_BY_ID[e.kind === 'project' ? e.id : e.project], p.id).toBeTruthy()
          if (e.kind === 'activity' && e.id.startsWith('sim:')) expect(SIM_EXPERIMENT_BY_ID[e.id.slice(4)], p.id).toBeTruthy()
        }
  })
})

describe('marking', () => {
  it('numeric answers accept the relative tolerance only', () => {
    const q: Question = { id: 'x', type: 'numeric', prompt: 'p', answer: 100, tol: 0.02, unit: 'V', explain: 'e' }
    expect(markQuestion(q, 101.9)).toBe(true)
    expect(markQuestion(q, 98.1)).toBe(true)
    expect(markQuestion(q, 102.5)).toBe(false)
    expect(markQuestion(q, null)).toBe(false)
    expect(markQuestion(q, Number.NaN)).toBe(false)
  })
  it('multi-select needs exactly the right set', () => {
    const q: Question = { id: 'x', type: 'multi', prompt: 'p', options: ['a', 'b', 'c'], answers: [0, 2], explain: 'e' }
    expect(markQuestion(q, [2, 0])).toBe(true)
    expect(markQuestion(q, [0])).toBe(false)
    expect(markQuestion(q, [0, 1, 2])).toBe(false)
  })
  it('markAll scores a set', () => {
    const qs = COURSE_BY_ID.S1.modules[0].quiz!.questions
    const answers = Object.fromEntries(qs.map((q) => [q.id, q.type === 'mcq' ? q.answer : q.type === 'multi' ? q.answers : q.answer]))
    expect(markAll(qs, answers).score).toBe(qs.length)
    expect(markAll(qs, {}).score).toBe(0)
  })
  it('seeded order is a reproducible permutation', () => {
    const a = seededOrder(20, 42)
    expect([...a].sort((x, y) => x - y)).toEqual(Array.from({ length: 20 }, (_, i) => i))
    expect(seededOrder(20, 42)).toEqual(a)
    expect(seededOrder(20, 43)).not.toEqual(a)
  })
})

describe('progression, completion and competency', () => {
  const S1 = COURSE_BY_ID.S1
  const at = (p: ProgressData, a: Omit<Attempt, 'id' | 'at' | 'durationMs' | 'answers'> & { at?: number }): ProgressData => ({ ...p, attempts: [{ id: `${p.attempts.length}`, at: a.at ?? 1, durationMs: 1000, answers: {}, kind: a.kind, ref: a.ref, score: a.score, max: a.max }, ...p.attempts] })
  const passAllLessons = (p: ProgressData) => S1.modules.flatMap((m) => m.lessons).reduce((q, l) => at(q, { kind: 'check', ref: l.id, score: 4, max: 4 }), p)
  const passModules = (p: ProgressData) =>
    S1.modules.reduce((q, m) => at(at(q, { kind: 'quiz', ref: m.id, score: 10, max: 10 }), { kind: 'assignment', ref: m.assignment!.id, score: 5, max: 5 }), p)
  const doPracticals = (p: ProgressData): ProgressData => {
    let q: ProgressData = { ...p, completedProjects: ['bld-a', 'bld-b', 'bld-c', 'bld-d', 'bld-e', 'bld-f', 'bld-g', 'bld-h'], activities: [{ activityId: 'build:design-ok:bld-d', at: 1, label: '', level: 'beginner' as const }, { activityId: 'lab3d:discharge', at: 1, label: '', level: 'beginner' as const }, { activityId: 'sim:sim-10', at: 1, label: '', level: 'beginner' as const }] }
    for (const id of ['bld-d', 'bld-c', 'bld-e', 'bld-h']) q = at(q, { kind: 'troubleshoot', ref: id, score: 1, max: 1 })
    return q
  }

  it('S1 is open while its prerequisites are only scheduled (recommended, not locked)', () => {
    const u = courseUnlock(emptyProgress(), S1)
    expect(u.unlocked).toBe(true)
    expect(u.missing).toEqual([])
    expect(u.recommended).toEqual(['P2', 'P3', 'P4'])
  })
  it('a lesson is complete only when its knowledge check is passed (≥ 70 %), not by visiting', () => {
    const l = S1.modules[0].lessons[0]
    let p = { ...emptyProgress(), completedLessons: [l.id] }
    expect(lessonDone(p, l)).toBe(false)
    p = at(p, { kind: 'check', ref: l.id, score: 2, max: 4 })
    expect(lessonDone(p, l)).toBe(false)
    p = at(p, { kind: 'check', ref: l.id, score: 3, max: 4 })
    expect(lessonDone(p, l)).toBe(true)
  })
  it('practicals are credited to a module only after its quiz is passed', () => {
    const m = S1.modules[1]
    const pr = m.practicals[0]
    const p = { ...emptyProgress(), completedProjects: ['bld-a'] }
    expect(practicalCredited(p, m, pr)).toBe(false)
    expect(practicalCredited(at(p, { kind: 'quiz', ref: m.id, score: 7, max: 8 }), m, pr)).toBe(true)
  })
  it('module completion needs lessons, quiz, assignment and practicals', () => {
    let p = passAllLessons(emptyProgress())
    expect(moduleStatus(p, S1.modules[1]).complete).toBe(false)
    p = passModules(p)
    expect(moduleStatus(p, S1.modules[1]).complete).toBe(false)
    p = doPracticals(p)
    for (const m of S1.modules) expect(moduleStatus(p, m).complete, m.id).toBe(true)
  })
  it('the examination opens when all modules are complete, limits attempts and applies the cool-down', () => {
    let p = passAllLessons(emptyProgress())
    expect(examStatus(p, S1, 10).eligible).toBe(false)
    p = doPracticals(passModules(p))
    expect(examStatus(p, S1, 10).eligible).toBe(true)
    p = at(p, { kind: 'exam', ref: 'S1', score: 10, max: 20, at: 1000 })
    const st = examStatus(p, S1, 2000)
    expect(st.passed).toBe(false)
    expect(st.remaining).toBe(2)
    expect(st.nextAt).toBe(1000 + 24 * 3600_000)
    p = at(p, { kind: 'exam', ref: 'S1', score: 16, max: 20, at: 1000 + 25 * 3600_000 })
    expect(examStatus(p, S1).passed).toBe(true)
  })
  it('module quizzes allow three attempts per 24 hours', () => {
    const m = S1.modules[0]
    let p = emptyProgress()
    for (const t of [1000, 2000, 3000]) p = at(p, { kind: 'quiz', ref: m.id, score: 3, max: 10, at: t })
    expect(quizAvailability(p, m, 4000).allowed).toBe(false)
    expect(quizAvailability(p, m, 4000).nextAt).toBe(1000 + 24 * 3600_000)
    expect(quizAvailability(p, m, 1000 + 24 * 3600_000 + 1).allowed).toBe(true)
  })
  it('competency CU-11 progresses awareness → applied → virtual competency', () => {
    const level = (p: ProgressData) => competencyRecord(p).find((c) => c.id === 'CU-11')!.level
    let p = emptyProgress()
    expect(level(p)).toBe('none')
    p = at(p, { kind: 'check', ref: 'S1.M1.L1', score: 4, max: 4 })
    expect(level(p)).toBe('awareness')
    p = doPracticals(passModules(passAllLessons(p)))
    expect(level(p)).toBe('applied')
    p = at(p, { kind: 'exam', ref: 'S1', score: 18, max: 20 })
    expect(level(p)).toBe('virtual-competency')
    // Scheduled courses' competencies are reported as not yet available.
    expect(competencyRecord(p).find((c) => c.id === 'CU-01')!.available).toBe(false)
  })
})

describe('records', () => {
  it('sanitize keeps valid enrolments and attempts, drops malformed ones, and accepts older backups', () => {
    const good: Attempt = { id: 'a', kind: 'quiz', ref: 'S1.M1', score: 7, max: 10, at: 5, durationMs: 100, answers: { q1: 0, q2: [1, 2], q3: null } }
    const s = sanitizeProgress({ schemaVersion: 1, enrolments: [{ courseId: 'S1', at: 1 }, { courseId: 'S1', at: 2 }, { bad: 1 }], attempts: [good, { id: 'b', kind: 'hack', ref: 'x', score: 1, max: 1, at: 1, durationMs: 1, answers: {} }, { id: 'c' }] })
    expect(s.enrolments).toEqual([{ courseId: 'S1', at: 1 }])
    expect(s.attempts).toEqual([good])
    const old = sanitizeProgress({ schemaVersion: 1, completedLessons: ['ckt-01'] })
    expect(old.enrolments).toEqual([])
    expect(old.attempts).toEqual([])
    expect(old.completedLessons).toEqual(['ckt-01'])
  })
})
