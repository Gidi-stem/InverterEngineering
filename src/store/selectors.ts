import { BADGES } from '../content/badges'
import { COMPONENT_INDEX } from '../content/componentCatalogue'
import { ALL_LESSON_IDS, PATHWAY } from '../content/modules'
import type { ProgressData } from '../types/progress'

const EXERCISE_TOTAL = PATHWAY.find((m) => m.id === 'circuit-lab')!.lessons.length
const PROJECT_TOTAL = PATHWAY.find((m) => m.id === 'build')!.lessons.length
/** Fault scenarios specified for the Repair workshop (Phase 9 replaces this with the scenario list length). */
export const FAULT_SCENARIO_TOTAL = 17
const ASSESSMENT_IDS = PATHWAY.find((m) => m.id === 'assessments')!.lessons.map((l) => l.id)
const ASSESSMENT_TOTAL = ASSESSMENT_IDS.length

export interface ProgressSummary {
  lessons: { done: number; total: number }
  exercises: { done: number; total: number }
  projects: { done: number; total: number }
  components: { done: number; total: number }
  studied: { done: number; total: number }
  activities: number
  assessments: { taken: number; total: number; averagePct: number | null }
  troubleshooting: { attempts: number; correct: number; ratePct: number | null }
  simulations: number
  badges: { earned: number; total: number }
  /** Weighted overall progress, 0–100. Weights documented below. */
  overallPct: number
}

/**
 * Overall progress weighting: lessons 35 %, exercises 15 %, projects 15 %,
 * component identification 10 %, assessments 15 %, troubleshooting 10 %.
 */
export function summarise(p: ProgressData): ProgressSummary {
  const lessonsDone = p.completedLessons.filter((id) => ALL_LESSON_IDS.includes(id)).length
  const bestByAssessment = new Map<string, number>()
  for (const a of p.assessments.filter((x) => ASSESSMENT_IDS.includes(x.assessmentId))) {
    const pct = a.maxScore > 0 ? a.score / a.maxScore : 0
    bestByAssessment.set(a.assessmentId, Math.max(bestByAssessment.get(a.assessmentId) ?? 0, pct))
  }
  const assessPcts = [...bestByAssessment.values()]

  // The Repair Workshop (Phase 9) records its results as `attempts` of kind 'troubleshoot' —
  // the same Academy attempt model used for checks/quizzes/exams — not as legacy `diagnoses`
  // entries (nothing writes those any more; they're kept only so progress saved by the earlier
  // troubleshooting prototype, if any, still counts). Both sources are merged here so a solved
  // scenario is credited regardless of which system produced it.
  const troubleshootAttempts = p.attempts.filter((a) => a.kind === 'troubleshoot')
  const bestTroubleshootByScenario = new Map<string, number>()
  for (const a of troubleshootAttempts) {
    const pct = a.max > 0 ? a.score / a.max : 0
    bestTroubleshootByScenario.set(a.ref, Math.max(bestTroubleshootByScenario.get(a.ref) ?? 0, pct))
  }
  const solvedScenarios = new Set([
    ...p.diagnoses.filter((d) => d.correct).map((d) => d.scenarioId),
    ...[...bestTroubleshootByScenario].filter(([, pct]) => pct >= 1).map(([id]) => id),
  ]).size
  const troubleshootAttemptCount = p.diagnoses.length + troubleshootAttempts.length
  const correct =
    p.diagnoses.filter((d) => d.correct).length + troubleshootAttempts.filter((a) => a.max > 0 && a.score === a.max).length
  const frac = (a: number, b: number) => (b > 0 ? Math.min(a / b, 1) : 0)

  const overall =
    0.35 * frac(lessonsDone, ALL_LESSON_IDS.length) +
    0.15 * frac(p.completedExercises.length, EXERCISE_TOTAL) +
    0.15 * frac(p.completedProjects.length, PROJECT_TOTAL) +
    0.1 * frac(p.identifiedComponents.length, COMPONENT_INDEX.length) +
    0.15 * (assessPcts.reduce((s, x) => s + x, 0) / ASSESSMENT_TOTAL) +
    0.1 * frac(solvedScenarios, FAULT_SCENARIO_TOTAL)

  return {
    lessons: { done: lessonsDone, total: ALL_LESSON_IDS.length },
    exercises: { done: p.completedExercises.length, total: EXERCISE_TOTAL },
    projects: { done: p.completedProjects.length, total: PROJECT_TOTAL },
    components: { done: p.identifiedComponents.length, total: COMPONENT_INDEX.length },
    studied: { done: p.inspectedComponents.filter((id) => COMPONENT_INDEX.some((c) => c.id === id)).length, total: COMPONENT_INDEX.length },
    activities: p.activities.length,
    assessments: {
      taken: bestByAssessment.size,
      total: ASSESSMENT_TOTAL,
      averagePct: assessPcts.length ? (100 * assessPcts.reduce((s, x) => s + x, 0)) / assessPcts.length : null,
    },
    troubleshooting: {
      attempts: troubleshootAttemptCount,
      correct,
      ratePct: troubleshootAttemptCount ? (100 * correct) / troubleshootAttemptCount : null,
    },
    simulations: p.simulationRuns.length,
    badges: { earned: BADGES.filter((b) => b.earned(p)).length, total: BADGES.length },
    overallPct: Math.round(overall * 1000) / 10,
  }
}

export function moduleCompletion(p: ProgressData, lessonIds: string[]): number {
  if (!lessonIds.length) return 0
  return lessonIds.filter((id) => p.completedLessons.includes(id)).length / lessonIds.length
}
