import { describe, expect, it } from 'vitest'
import { markAll, restoredText } from '../../content/academy/logic'
import type { Question } from '../../content/academy/types'

/**
 * Regression test for the Phase 9 browser-verification finding: after a reload, a practice
 * QuestionSet (lesson knowledge check, homework, module assignment) used to open blank even
 * though the authoritative result was already recorded and correct everywhere else. The fix
 * passes the last-recorded answers back in as `restore`; these two pure helpers are what that
 * restoration is built on, so they're covered directly rather than through a UI render (this
 * project's test suite is logic/content-level only — see academy.test.ts — with no component-
 * rendering harness, so a unit test on the pure restoration logic is the fit here).
 */

const Q: Question[] = [
  { id: 'q1', type: 'numeric', prompt: 'Current through a 46 Ω load on 230 V (A)?', answer: 5, tol: 0.01, unit: 'A', explain: 'I = 230/46 = 5 A.' },
  { id: 'q2', type: 'mcq', prompt: 'What is needed for current to flow?', options: ['A complete loop', 'High voltage', 'A thick wire', 'An open switch'], answer: 0, explain: 'A closed loop.' },
  { id: 'q3', type: 'numeric', prompt: 'Power drawn by a 12 Ω resistor on 12 V (W)?', answer: 12, tol: 0.01, unit: 'W', explain: 'P = 12 W.' },
]

describe('QuestionSet restoration (reload rehydration fix)', () => {
  it('rebuilds the numeric text fields from stored answers, leaving MCQ ids untouched', () => {
    const stored = { q1: 99, q2: 0, q3: 12 }
    const text = restoredText(Q, stored)
    expect(text).toEqual({ q1: '99', q3: '12' })
    expect(text.q2).toBeUndefined() // MCQ answers render via the option `checked` state, not a text field
  })

  it('omits a question from the text map when its stored answer is null or missing', () => {
    expect(restoredText(Q, { q1: null, q2: 0 })).toEqual({})
    expect(restoredText(Q, { q2: 0 })).toEqual({})
  })

  it('re-marking restored answers reproduces the originally recorded, persisted score exactly', () => {
    // This is what QuestionSet does on mount when `restore` is given: markAll(questions, restore).
    const submitted = { q1: 99, q2: 0, q3: 12 } // the exact mixed-score case exercised in live browser testing
    const original = markAll(Q, submitted)
    const rehydrated = markAll(Q, submitted)
    expect(rehydrated.score).toBe(original.score)
    expect(rehydrated.max).toBe(original.max)
    expect(rehydrated.score).toBe(2) // q1 wrong (99 ≠ 5), q2 and q3 correct
    expect(rehydrated.results.find((r) => r.id === 'q1')?.correct).toBe(false)
    expect(rehydrated.results.find((r) => r.id === 'q3')?.correct).toBe(true)
  })
})
