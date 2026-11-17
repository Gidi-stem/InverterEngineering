import type { Attempt, ProgressData } from '../../types/progress'
import { SHELL_BY_ID, SHELL_COMPETENCIES, SHELL_COURSES } from './shells'
import { lessonAuthored, type AcademyLesson, type AcademyModule, type Course, type Evidence, type Practical, type PracticalTask, type Question } from './types'

/**
 * Learning Academy rules: marking, completion, prerequisites, examination availability and the
 * competency record. Everything is derived from ProgressData, so nothing can drift out of step.
 * This file deliberately never imports the full, authored course catalogue (`./catalogue`) — only
 * the lightweight course shells (`./shells`), which carry every field these functions need (ids,
 * titles, prerequisites, structure, quiz pass marks, exam settings, practical evidence) without any
 * lesson/quiz/exam content. That keeps every consumer of this file — the prerequisite gates, the
 * dashboard banner, and the Academy pages' course-unlock/competency-record displays — free of course
 * content, which the Academy pages instead load per course, on demand, via `./courseLoader`.
 */
export type Answer = number | number[] | null

/** Mark one answer. Numeric answers accept a relative tolerance (and an absolute floor for answers near zero). */
export function markQuestion(q: Question, a: Answer): boolean {
  if (a === null || a === undefined) return false
  if (q.type === 'mcq') return a === q.answer
  if (q.type === 'multi') {
    if (!Array.isArray(a)) return false
    const s = new Set(a)
    return s.size === q.answers.length && q.answers.every((x) => s.has(x))
  }
  if (typeof a !== 'number' || !Number.isFinite(a)) return false
  return Math.abs(a - q.answer) <= Math.max(q.tol * Math.abs(q.answer), 1e-9)
}

export function markAll(qs: Question[], answers: Record<string, Answer>) {
  const results = qs.map((q) => ({ id: q.id, correct: markQuestion(q, answers[q.id] ?? null) }))
  return { score: results.filter((r) => r.correct).length, max: qs.length, results }
}

/** Deterministic shuffle (mulberry32) so an attempt can be reproduced from its seed. */
export function seededOrder(n: number, seed: number): number[] {
  let t = seed >>> 0
  const rnd = () => {
    t = (t + 0x6d2b79f5) >>> 0
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
  const a = Array.from({ length: n }, (_, i) => i)
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export const LESSON_CHECK_PASS = 0.7
const attemptsOf = (p: ProgressData, kind: Attempt['kind'], ref: string) => p.attempts.filter((a) => a.kind === kind && a.ref === ref)
export const bestScore = (p: ProgressData, kind: Attempt['kind'], ref: string) => attemptsOf(p, kind, ref).reduce((b, a) => Math.max(b, a.max ? a.score / a.max : 0), 0)

/** A lesson is complete when its knowledge check is passed (understanding demonstrated, not a page visit). */
export function lessonDone(p: ProgressData, l: AcademyLesson): boolean {
  return lessonAuthored(l) && bestScore(p, 'check', l.id) >= LESSON_CHECK_PASS
}

export function evidenceMet(p: ProgressData, e: Evidence): boolean {
  switch (e.kind) {
    case 'project':
      return p.completedProjects.includes(e.id)
    case 'exercise':
      return p.completedExercises.includes(e.id)
    case 'lesson':
      return p.completedLessons.includes(e.id)
    case 'activity':
      return p.activities.some((a) => a.activityId === e.id)
    case 'troubleshoot':
      return attemptsOf(p, 'troubleshoot', e.project).some((a) => a.score >= a.max && a.max > 0)
    case 'task':
      return attemptsOf(p, 'practical', e.id).some((a) => a.score >= a.max && a.max > 0)
  }
}

export type TaskResponse =
  | { kind: 'sequence'; chosen: string[] }
  | { kind: 'hazards'; selected: string[] }
  | { kind: 'procedure'; log: string[]; conclusion: number | null }
  | { kind: 'calc'; answers: Record<string, Answer> }

export interface TaskMark {
  passed: boolean
  score: number
  max: number
  feedback: string[]
}

/** Mark an academy practical assessment. Practicals are pass/fail: score = max only when fully correct. */
export function markTask(t: PracticalTask, r: TaskResponse): TaskMark {
  const fb: string[] = []
  if (t.kind === 'sequence' && r.kind === 'sequence') {
    for (const d of t.distractors) if (r.chosen.includes(d.text)) fb.push(`“${d.text}” should not be part of the procedure: ${d.why}`)
    const missing = t.steps.filter((x) => !r.chosen.includes(x))
    for (const m of missing) fb.push(`Missing step: “${m}”.`)
    const inOrder = r.chosen.filter((x) => t.steps.includes(x))
    const orderOk = missing.length === 0 && inOrder.every((x, i) => x === t.steps[i])
    if (!missing.length && !orderOk) fb.push('All the right steps are there, but not in the right order.')
    const passed = orderOk && r.chosen.length === t.steps.length
    const score = t.steps.filter((x, i) => r.chosen[i] === x).length
    return { passed, score: passed ? t.steps.length : Math.min(score, t.steps.length - 1), max: t.steps.length, feedback: fb }
  }
  if (t.kind === 'hazards' && r.kind === 'hazards') {
    const hz = t.items.filter((i) => i.hazard)
    for (const i of t.items) {
      const sel = r.selected.includes(i.id)
      if (i.hazard && !sel) fb.push(`Missed hazard: ${i.label}. ${i.why}`)
      if (!i.hazard && sel) fb.push(`Not a hazard: ${i.label}. ${i.why}`)
    }
    const correct = t.items.filter((i) => i.hazard === r.selected.includes(i.id)).length
    const passed = correct === t.items.length
    return { passed, score: passed ? hz.length : Math.min(hz.length - 1, hz.filter((i) => r.selected.includes(i.id)).length), max: hz.length, feedback: fb }
  }
  if (t.kind === 'procedure' && r.kind === 'procedure') {
    const unsafe = r.log.map((id) => t.actions.find((a) => a.id === id)).find((a) => a?.unsafe)
    if (unsafe) return { passed: false, score: 0, max: t.required.length + 1, feedback: [`Unsafe action: ${unsafe.label}. ${unsafe.unsafe}`] }
    let k = 0
    for (const id of r.log) if (id === t.required[k]) k++
    if (k < t.required.length) {
      const next = t.actions.find((a) => a.id === t.required[k])
      fb.push(`The procedure is incomplete or out of order: “${next?.label}” was not done at the right point.`)
    }
    const concl = r.conclusion === t.conclusion.answer
    if (!concl) fb.push(`Conclusion: ${t.conclusion.explain}`)
    const passed = k === t.required.length && concl
    return { passed, score: passed ? t.required.length + 1 : Math.min(t.required.length, k + (concl ? 1 : 0)), max: t.required.length + 1, feedback: fb }
  }
  if (t.kind === 'calc' && r.kind === 'calc') {
    const m = markAll(t.questions, r.answers)
    for (const x of m.results) if (!x.correct) fb.push(`Question ${t.questions.findIndex((q) => q.id === x.id) + 1} is not correct.`)
    return { passed: m.score === m.max, score: m.score, max: m.max, feedback: fb }
  }
  return { passed: false, score: 0, max: 1, feedback: ['Response does not match the task.'] }
}

export interface ModuleStatus {
  lessonsDone: number
  lessons: number
  quizBest: number
  quizPassed: boolean
  quizAttempts: number
  assignmentBest: number
  practicalsDone: number
  practicals: number
  complete: boolean
}

export const QUIZ_ATTEMPTS = 3
export const QUIZ_WINDOW_MS = 24 * 3600_000

/** Module quizzes: three attempts in any 24-hour window (best score counts); feedback after each. */
export function quizAvailability(p: ProgressData, m: AcademyModule, now = Date.now()) {
  const recent = attemptsOf(p, 'quiz', m.id).filter((a) => now - a.at < QUIZ_WINDOW_MS).sort((a, b) => a.at - b.at)
  const allowed = recent.length < QUIZ_ATTEMPTS
  return { allowed, used: recent.length, nextAt: allowed ? now : recent[0].at + QUIZ_WINDOW_MS }
}

export function moduleStatus(p: ProgressData, m: AcademyModule): ModuleStatus {
  const lessons = m.lessons.filter(lessonAuthored)
  const lessonsDone = lessons.filter((l) => lessonDone(p, l)).length
  const quizBest = m.quiz ? bestScore(p, 'quiz', m.id) : 1
  const quizPassed = !m.quiz || quizBest >= m.quiz.pass
  const assignmentBest = m.assignment ? bestScore(p, 'assignment', m.assignment.id) : 1
  const practicalsDone = m.practicals.filter((x) => evidenceMet(p, x.evidence)).length
  return {
    lessonsDone,
    lessons: lessons.length,
    quizBest,
    quizPassed,
    quizAttempts: m.quiz ? attemptsOf(p, 'quiz', m.id).length : 0,
    assignmentBest,
    practicalsDone,
    practicals: m.practicals.length,
    complete: lessons.length > 0 && lessonsDone === lessons.length && quizPassed && assignmentBest >= 0.7 && practicalsDone === m.practicals.length,
  }
}

/** A practical is credited to the module only once the module quiz has been passed (blueprint §1.1). */
export const practicalCredited = (p: ProgressData, m: AcademyModule, x: Practical) => evidenceMet(p, x.evidence) && moduleStatus(p, m).quizPassed

export interface ExamStatus {
  attempts: number
  remaining: number
  best: number
  passed: boolean
  /** Ready: every module complete. */
  eligible: boolean
  /** Earliest time the next attempt may start (cool-down after a failed attempt). */
  nextAt: number
}

export function examStatus(p: ProgressData, c: Course, now = Date.now()): ExamStatus {
  const ex = c.exam
  const list = attemptsOf(p, 'exam', c.id)
  const best = list.reduce((b, a) => Math.max(b, a.max ? a.score / a.max : 0), 0)
  const passed = !!ex && best >= ex.pass
  const last = list.reduce((t, a) => Math.max(t, a.at), 0)
  const eligible = c.status === 'published' && c.modules.every((m) => moduleStatus(p, m).complete)
  return {
    attempts: list.length,
    remaining: ex ? Math.max(0, ex.attempts - list.length) : 0,
    best,
    passed,
    eligible,
    nextAt: !ex || !last || passed ? now : Math.max(now, last + ex.cooldownHours * 3600_000),
  }
}

export function courseComplete(p: ProgressData, c: Course): boolean {
  return c.status === 'published' && c.modules.every((m) => moduleStatus(p, m).complete) && examStatus(p, c).passed
}

/** Lightweight (shell) flattening of every lesson, for the dashboard's "continue learning" banner:
 * course/module/lesson ids and titles and whether each lesson is authored, nothing heavier. */
export const ALL_LESSONS = SHELL_COURSES.flatMap((c) => c.modules.flatMap((m) => m.lessons.map((l) => ({ course: c, module: m, lesson: l }))))

export interface Unlock {
  unlocked: boolean
  /** Published prerequisites not yet passed: these lock the course. */
  missing: string[]
  /** Scheduled prerequisites: shown as recommended prior study (blueprint §1.1). */
  recommended: string[]
}

/** Whether a course's own pages (lessons/quiz/assignment/exam/practicals) are open to the student.
 * Reads only the course shells — titles for display come from `SHELL_BY_ID` wherever a component
 * shows a prerequisite's name (e.g. `CourseLock`), never from the full, authored course. */
export function courseUnlock(p: ProgressData, c: Course): Unlock {
  const missing: string[] = []
  const recommended: string[] = []
  for (const id of c.prerequisites) {
    const pre = SHELL_BY_ID[id]
    if (!pre) continue
    if (pre.status === 'scheduled') recommended.push(id)
    else if (!courseComplete(p, pre)) missing.push(id)
  }
  for (const id of c.recommended ?? []) if (SHELL_BY_ID[id] && !recommended.includes(id) && !courseComplete(p, SHELL_BY_ID[id])) recommended.push(id)
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

/** Awareness: a lesson check passed. Applied: every module quiz and practical. Virtual competency:
 * everything including the exam. Reads only the course shells — the practical titles shown in the
 * evidence list are preserved on the shell (shells.test.ts checks this stays in sync). */
export function competencyRecord(p: ProgressData): CompetencyRecord[] {
  return SHELL_COMPETENCIES.map((cu) => {
    const courses = cu.courses.map((id: string) => SHELL_BY_ID[id]).filter(Boolean)
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
