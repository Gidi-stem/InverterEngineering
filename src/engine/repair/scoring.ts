import { RUBRIC_ORDER, type Checkpoint, type Rubric } from './types'

export type RepairAnswer = number | number[] | null

/** Marks one checkpoint. Mirrors `content/academy/logic.ts`'s `markQuestion` exactly (mcq exact
 * match, multi exact set match, numeric within a relative tolerance) — duplicated at this small
 * size rather than imported, so the repair engine does not depend on the academy content layer
 * (which instead depends on engines, never the reverse). */
export function markCheckpoint(c: Checkpoint, a: RepairAnswer): boolean {
  if (a === null || a === undefined) return false
  if (c.type === 'mcq') return a === c.answer
  if (c.type === 'multi') {
    if (!Array.isArray(a)) return false
    const s = new Set(a)
    return s.size === c.answers.length && c.answers.every((x) => s.has(x))
  }
  if (typeof a !== 'number' || !Number.isFinite(a)) return false
  return Math.abs(a - c.answer) <= Math.max(c.tol * Math.abs(c.answer), 1e-9)
}

export interface RubricScore {
  rubric: Rubric
  correct: number
  total: number
}

export interface ScenarioScore {
  byRubric: RubricScore[]
  score: number
  max: number
  /** Every rubric category answered correctly at least once — not just the diagnosis. */
  passed: boolean
}

/**
 * Score a complete attempt at a scenario (brief §7): every checkpoint counts, not only the final
 * diagnosis, so a correct guess with no supporting evidence does not earn full marks. `passed`
 * requires every checkpoint correct, matching how every other academy practical is marked
 * (`content/academy/logic.ts`'s `markTask`: "practicals are pass/fail: score = max only when
 * fully correct").
 */
export function scoreScenario(checkpoints: Checkpoint[], answers: Record<string, RepairAnswer>): ScenarioScore {
  const byRubric = RUBRIC_ORDER.map((rubric) => {
    const cs = checkpoints.filter((c) => c.rubric === rubric)
    return { rubric, correct: cs.filter((c) => markCheckpoint(c, answers[c.id] ?? null)).length, total: cs.length }
  }).filter((r) => r.total > 0)
  const score = byRubric.reduce((t, r) => t + r.correct, 0)
  const max = byRubric.reduce((t, r) => t + r.total, 0)
  return { byRubric, score, max, passed: max > 0 && score === max }
}
