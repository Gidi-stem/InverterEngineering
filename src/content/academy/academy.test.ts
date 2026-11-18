import { describe, expect, it } from 'vitest'
import { emptyProgress } from '../../store/progressStore'
import { sanitizeProgress } from '../../store/sanitize'
import type { Attempt, ProgressData } from '../../types/progress'
import { BUILD_PROJECT_BY_ID } from '../buildProjects'
import { CIRCUIT_EXERCISE_BY_ID } from '../circuitExercises'
import { COMPONENT_BY_ID } from '../components'
import { COMPARISON_BY_ID } from '../components/comparisons'
import { TEST_PROCEDURES } from '../components/testing'
import { INSTRUMENTS } from '../instruments'
import { INSTRUMENT_SCENARIO_IDS } from '../../engine/instruments'
import type { InstrumentId } from '../../types/domain'
import { MODEL_BY_ID } from '../models'
import { MODULE_BY_ID, MODULES } from '../modules'
import { SIM_EXPERIMENT_BY_ID } from '../simExperiments'
import { COMPETENCIES, COURSE_BY_ID, COURSES } from './catalogue'
import { GLOSSARY, glossaryRefs } from './glossary'
import { F2_PRACTICAL_EXERCISES, gateStatus } from './gates'
import { competencyRecord, courseComplete, courseUnlock, examStatus, lessonDone, markAll, markQuestion, markTask, moduleStatus, practicalCredited, quizAvailability, seededOrder, type TaskResponse } from './logic'
import { routeOf } from './routes'
import { DIAGRAM_IDS, SOLAR_TABS, type Course, type Evidence, type LessonContent, type PracticalTask, type Question, type ToolLink } from './types'

/** Full (non-shell) flattening of every lesson, for tests that check authored content depth —
 * `ALL_LESSONS` in `./logic` is shell-based (no content) by design; see ARCHITECTURE.md §10b/§10c. */
const ALL_LESSONS = COURSES.flatMap((c) => c.modules.flatMap((m) => m.lessons.map((l) => ({ course: c, module: m, lesson: l }))))

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
    case 'solar':
      return (SOLAR_TABS as readonly string[]).includes(l.tab)
    case 'instrument':
      return !!INSTRUMENTS[l.id as InstrumentId] && (!l.scenario || (INSTRUMENT_SCENARIO_IDS[l.id] ?? []).includes(l.scenario))
    case 'fundamentals':
      return MODULE_BY_ID.fundamentals.lessons.some((x) => x.id === l.lessonId)
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
    const links = COURSES.flatMap((c) => c.modules.flatMap((m) => [...m.practicals.flatMap((p) => (p.link ? [p.link] : [])), ...m.lessons.flatMap((l) => (l.content ? [l.content.demo.link, ...l.content.activities] : []))]))
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
  const satisfy = (p: ProgressData, e: Evidence): ProgressData => {
    switch (e.kind) {
      case 'project': return { ...p, completedProjects: [...p.completedProjects, e.id] }
      case 'exercise': return { ...p, completedExercises: [...p.completedExercises, e.id] }
      case 'lesson': return { ...p, completedLessons: [...p.completedLessons, e.id] }
      case 'activity': return { ...p, activities: [...p.activities, { activityId: e.id, at: 1, label: '', level: 'beginner' as const }] }
      case 'troubleshoot': return at(p, { kind: 'troubleshoot', ref: e.project, score: 1, max: 1 })
      case 'task': return at(p, { kind: 'practical', ref: e.id, score: 1, max: 1 })
    }
  }
  const completeCourse = (p0: ProgressData, c: Course): ProgressData => {
    let p = p0
    for (const m of c.modules) {
      for (const l of m.lessons) p = at(p, { kind: 'check', ref: l.id, score: 4, max: 4 })
      if (m.quiz) p = at(p, { kind: 'quiz', ref: m.id, score: 10, max: 10 })
      if (m.assignment) p = at(p, { kind: 'assignment', ref: m.assignment.id, score: 5, max: 5 })
      for (const pr of m.practicals) p = satisfy(p, pr.evidence)
    }
    return c.exam ? at(p, { kind: 'exam', ref: c.id, score: 20, max: 20 }) : p
  }
  const passAllLessons = (p: ProgressData) => S1.modules.flatMap((m) => m.lessons).reduce((q, l) => at(q, { kind: 'check', ref: l.id, score: 4, max: 4 }), p)
  const passModules = (p: ProgressData) =>
    S1.modules.reduce((q, m) => at(at(q, { kind: 'quiz', ref: m.id, score: 10, max: 10 }), { kind: 'assignment', ref: m.assignment!.id, score: 5, max: 5 }), p)
  const doPracticals = (p: ProgressData): ProgressData => {
    let q: ProgressData = { ...p, completedProjects: ['bld-a', 'bld-b', 'bld-c', 'bld-d', 'bld-e', 'bld-f', 'bld-g', 'bld-h'], activities: [{ activityId: 'build:design-ok:bld-d', at: 1, label: '', level: 'beginner' as const }, { activityId: 'lab3d:discharge', at: 1, label: '', level: 'beginner' as const }, { activityId: 'sim:sim-10', at: 1, label: '', level: 'beginner' as const }] }
    for (const id of ['bld-d', 'bld-c', 'bld-e', 'bld-h']) q = at(q, { kind: 'troubleshoot', ref: id, score: 1, max: 1 })
    return q
  }

  it('S1 is locked until F1 and F2 are passed; scheduled courses stay recommended, never locks', () => {
    const u = courseUnlock(emptyProgress(), S1)
    expect(u.unlocked).toBe(false)
    expect(u.missing).toEqual(['F1', 'F2'])
    const done = completeCourse(completeCourse(emptyProgress(), COURSE_BY_ID.F1), COURSE_BY_ID.F2)
    const v = courseUnlock(done, S1)
    expect(v.unlocked).toBe(true)
    expect(v.missing).toEqual([])
    expect(v.recommended).toEqual(['P2', 'P3', 'P4'])
  })
  it('F1 has no prerequisites; F2 requires F1', () => {
    expect(courseUnlock(emptyProgress(), COURSE_BY_ID.F1).unlocked).toBe(true)
    expect(courseUnlock(emptyProgress(), COURSE_BY_ID.F2).missing).toEqual(['F1'])
    expect(courseUnlock(completeCourse(emptyProgress(), COURSE_BY_ID.F1), COURSE_BY_ID.F2).unlocked).toBe(true)
  })
  it('F1 and F2 are not complete without their practical assessments and examinations', () => {
    for (const c of [COURSE_BY_ID.F1, COURSE_BY_ID.F2]) {
      const full = completeCourse(emptyProgress(), c)
      expect(courseComplete(full, c), c.id).toBe(true)
      const noExam = { ...full, attempts: full.attempts.filter((a) => a.kind !== 'exam') }
      expect(courseComplete(noExam, c), `${c.id} without exam`).toBe(false)
      const noPractical = { ...full, attempts: full.attempts.filter((a) => a.kind !== 'practical'), completedExercises: [], activities: [] }
      expect(courseComplete(noPractical, c), `${c.id} without practicals`).toBe(false)
      const failedExam = { ...noExam, attempts: [...noExam.attempts, { id: 'x', kind: 'exam' as const, ref: c.id, score: Math.ceil(c.exam!.pass * 20) - 1, max: 20, at: 1, durationMs: 1, answers: {} }] }
      expect(courseComplete(failedExam, c), `${c.id} with a failed exam`).toBe(false)
    }
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
    // Scheduled courses' competencies are reported as not yet available; published ones are.
    expect(competencyRecord(p).find((c) => c.id === 'CU-04')!.available).toBe(false)
    expect(competencyRecord(p).find((c) => c.id === 'CU-01')!.available).toBe(true)
    expect(competencyRecord(p).find((c) => c.id === 'CU-03')!.available).toBe(true)
    expect(competencyRecord(p).find((c) => c.id === 'CU-15')).toBeDefined()
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

describe('practical tasks and gates (Phase 7)', () => {
  const tasks = COURSES.flatMap((c) => c.modules.flatMap((m) => m.practicals.flatMap((p) => (p.task ? [{ c, m, p, t: p.task }] : []))))

  it('every practical has a laboratory link or an academy task, and task evidence matches its task', () => {
    for (const c of COURSES) for (const m of c.modules) for (const p of m.practicals) {
      expect(!!p.link || !!p.task, p.id).toBe(true)
      if (p.task) expect(p.evidence, p.id).toEqual({ kind: 'task', id: p.task.id })
    }
    expect(new Set(tasks.map((x) => x.t.id)).size).toBe(tasks.length)
    expect(tasks.length).toBeGreaterThanOrEqual(7)
  })

  it('tasks are well formed', () => {
    for (const { t } of tasks) {
      expect(t.title && t.brief && t.explain, t.id).toBeTruthy()
      if (t.kind === 'sequence') {
        expect(t.steps.length, t.id).toBeGreaterThanOrEqual(4)
        expect(t.distractors.length, t.id).toBeGreaterThanOrEqual(2)
        for (const d of t.distractors) expect(t.steps.includes(d.text), t.id).toBe(false)
      }
      if (t.kind === 'hazards') {
        expect(t.items.some((i) => i.hazard) && t.items.some((i) => !i.hazard), t.id).toBe(true)
        expect(new Set(t.items.map((i) => i.id)).size).toBe(t.items.length)
      }
      if (t.kind === 'procedure') {
        const ids = new Set(t.actions.map((a) => a.id))
        for (const r of t.required) {
          expect(ids.has(r), `${t.id} ${r}`).toBe(true)
          expect(t.actions.find((a) => a.id === r)!.unsafe, `${t.id} ${r} required but unsafe`).toBeUndefined()
        }
        expect(t.actions.some((a) => a.unsafe), t.id).toBe(true)
        expect(t.conclusion.answer).toBeLessThan(t.conclusion.options.length)
      }
      if (t.kind === 'calc') for (const q of t.questions) expect(questionValid(q), `${t.id} ${q.id}`).toBeNull()
    }
  })

  const perfect = (t: PracticalTask): TaskResponse => {
    if (t.kind === 'sequence') return { kind: 'sequence', chosen: [...t.steps] }
    if (t.kind === 'hazards') return { kind: 'hazards', selected: t.items.filter((i) => i.hazard).map((i) => i.id) }
    if (t.kind === 'procedure') return { kind: 'procedure', log: [...t.required], conclusion: t.conclusion.answer }
    return { kind: 'calc', answers: Object.fromEntries(t.questions.map((q) => [q.id, q.type === 'numeric' ? q.answer : q.type === 'multi' ? q.answers : q.answer])) }
  }

  it('a perfect response passes every task with full marks', () => {
    for (const { t } of tasks) {
      const m = markTask(t, perfect(t))
      expect(m.passed, t.id).toBe(true)
      expect(m.score, t.id).toBe(m.max)
    }
  })

  it('sequence tasks fail on a distractor, a missing step or the wrong order', () => {
    const t = tasks.find((x) => x.t.kind === 'sequence')!.t as Extract<PracticalTask, { kind: 'sequence' }>
    expect(markTask(t, { kind: 'sequence', chosen: [...t.steps, t.distractors[0].text] }).passed).toBe(false)
    expect(markTask(t, { kind: 'sequence', chosen: t.steps.slice(1) }).passed).toBe(false)
    const swapped = [...t.steps]
    ;[swapped[0], swapped[1]] = [swapped[1], swapped[0]]
    const m = markTask(t, { kind: 'sequence', chosen: swapped })
    expect(m.passed).toBe(false)
    expect(m.score).toBeLessThan(m.max)
    expect(m.feedback.join(' ')).toMatch(/order/)
  })

  it('hazard tasks require exactly the hazards', () => {
    const t = tasks.find((x) => x.t.kind === 'hazards')!.t as Extract<PracticalTask, { kind: 'hazards' }>
    const hz = t.items.filter((i) => i.hazard).map((i) => i.id)
    const safe = t.items.find((i) => !i.hazard)!.id
    expect(markTask(t, { kind: 'hazards', selected: hz.slice(1) }).passed).toBe(false)
    expect(markTask(t, { kind: 'hazards', selected: [...hz, safe] }).passed).toBe(false)
  })

  it('the prove-dead drill fails on an unsafe action, a skipped re-test or the wrong conclusion', () => {
    const t = tasks.find((x) => x.t.id === 'f1-prove-dead')!.t as Extract<PracticalTask, { kind: 'procedure' }>
    const unsafe = t.actions.find((a) => a.unsafe)!.id
    const u = markTask(t, { kind: 'procedure', log: [...t.required, unsafe], conclusion: t.conclusion.answer })
    expect(u.passed).toBe(false)
    expect(u.score).toBe(0)
    expect(markTask(t, { kind: 'procedure', log: t.required.slice(0, -1), conclusion: t.conclusion.answer }).passed).toBe(false)
    expect(markTask(t, { kind: 'procedure', log: [...t.required], conclusion: 0 }).passed).toBe(false)
    // Extra harmless actions (the non-contact detector) do not fail a correct sequence.
    expect(markTask(t, { kind: 'procedure', log: ['ncv', ...t.required], conclusion: t.conclusion.answer }).passed).toBe(true)
  })

  it('calculation tasks need every answer correct', () => {
    const t = tasks.find((x) => x.t.kind === 'calc')!.t as Extract<PracticalTask, { kind: 'calc' }>
    const r = perfect(t) as Extract<TaskResponse, { kind: 'calc' }>
    const q = t.questions[0]
    expect(markTask(t, { kind: 'calc', answers: { ...r.answers, [q.id]: q.type === 'numeric' ? q.answer * 2 + 1 : -1 } }).passed).toBe(false)
  })

  it('gates: F1 opens 3D procedures and F2’s own exercises; F1 + F2 open construction, build and solar', () => {
    const at = (p: ProgressData, a: Pick<Attempt, 'kind' | 'ref' | 'score' | 'max'>): ProgressData => ({ ...p, attempts: [{ id: `${p.attempts.length}`, at: 1, durationMs: 1, answers: {}, ...a }, ...p.attempts] })
    const complete = (p0: ProgressData, c: Course) => {
      let p = p0
      for (const m of c.modules) {
        for (const l of m.lessons) p = at(p, { kind: 'check', ref: l.id, score: 4, max: 4 })
        p = at(at(p, { kind: 'quiz', ref: m.id, score: 1, max: 1 }), { kind: 'assignment', ref: m.assignment!.id, score: 1, max: 1 })
        for (const pr of m.practicals) {
          const e = pr.evidence
          if (e.kind === 'task') p = at(p, { kind: 'practical', ref: e.id, score: 1, max: 1 })
          if (e.kind === 'exercise') p = { ...p, completedExercises: [...p.completedExercises, e.id] }
          if (e.kind === 'activity') p = { ...p, activities: [...p.activities, { activityId: e.id, at: 1, label: '', level: 'beginner' }] }
        }
      }
      return at(p, { kind: 'exam', ref: c.id, score: 20, max: 20 })
    }
    const none = emptyProgress()
    for (const area of ['circuit', 'build', 'solar', 'lab3d-procedure'] as const) expect(gateStatus(none, area).open, area).toBe(false)
    expect(gateStatus(none, 'circuit', 'ckt-01').missing.map((m) => m.id)).toEqual(['F1'])
    expect(gateStatus(none, 'build').missing.map((m) => m.id)).toEqual(['F1', 'F2'])
    const f1 = complete(none, COURSE_BY_ID.F1)
    expect(gateStatus(f1, 'lab3d-procedure').open).toBe(true)
    for (const ex of F2_PRACTICAL_EXERCISES) expect(gateStatus(f1, 'circuit', ex).open, ex).toBe(true)
    expect(gateStatus(f1, 'circuit', 'ckt-04').open).toBe(false)
    expect(gateStatus(f1, 'circuit').open).toBe(false)
    expect(gateStatus(f1, 'build').missing.map((m) => m.id)).toEqual(['F2'])
    expect(gateStatus(f1, 'solar').open).toBe(false)
    const both = complete(f1, COURSE_BY_ID.F2)
    for (const area of ['circuit', 'build', 'solar', 'lab3d-procedure'] as const) expect(gateStatus(both, area).open, area).toBe(true)
  })

  it('F2’s laboratory practicals are exactly the exercises its gate exempts', () => {
    const refs = COURSE_BY_ID.F2.modules.flatMap((m) => m.practicals.map((p) => p.evidence)).flatMap((e) => (e.kind === 'exercise' ? [e.id] : e.kind === 'activity' ? [e.id.replace(/^sim:/, '')] : []))
    expect([...refs].sort()).toEqual([...F2_PRACTICAL_EXERCISES].sort())
  })

  it('the course order is unchanged and F1/F2 are published with mandatory pass marks', () => {
    expect(COURSES.map((c) => c.id)).toEqual(['F1', 'F2', 'F3', 'F4', 'F5', 'P1', 'P2', 'P3', 'P4', 'P5', 'S1', 'S2', 'S3', 'S4', 'S5'])
    expect(COURSE_BY_ID.F1.status).toBe('published')
    expect(COURSE_BY_ID.F2.status).toBe('published')
    expect(COURSE_BY_ID.F1.exam!.pass).toBe(0.8)
    expect(COURSE_BY_ID.F1.exam!.questions.length).toBe(20)
    expect(COURSE_BY_ID.F2.exam!.questions.length).toBe(20)
    expect(COURSE_BY_ID.F2.prerequisites).toEqual(['F1'])
    expect(COURSE_BY_ID.F1.modules.flatMap((m) => m.lessons).length).toBe(12)
    expect(COURSE_BY_ID.F2.modules.flatMap((m) => m.lessons).length).toBe(14)
    for (const c of COURSES) expect(c.phase, c.id).toBeLessThanOrEqual(14)
    for (const c of COURSES) for (const r of c.recommended ?? []) expect(COURSE_BY_ID[r], `${c.id} recommends ${r}`).toBeDefined()
  })
})
