import { describe, expect, it } from 'vitest'
import { emptyProgress } from './progressStore'
import { summarise } from './selectors'

describe('progress summary', () => {
  it('starts at zero with no rates', () => {
    const s = summarise(emptyProgress())
    expect(s.overallPct).toBe(0)
    expect(s.troubleshooting.ratePct).toBeNull()
    expect(s.assessments.averagePct).toBeNull()
  })

  it('computes troubleshooting success rate and best-attempt assessment average', () => {
    const p = emptyProgress()
    p.diagnoses = [
      { scenarioId: 'a', at: 0, sectionGuess: 'power-stage', partGuess: 'q1', correct: true, usedHints: 0, testsPerformed: 2 },
      { scenarioId: 'b', at: 0, sectionGuess: 'control', partGuess: 'u1', correct: false, usedHints: 1, testsPerformed: 1 },
    ]
    p.assessments = [
      { assessmentId: 'x', at: 0, score: 5, maxScore: 10 },
      { assessmentId: 'x', at: 1, score: 9, maxScore: 10 },
    ]
    const s = summarise(p)
    expect(s.troubleshooting.ratePct).toBe(50)
    expect(s.assessments.averagePct).toBeCloseTo(90)
    expect(s.overallPct).toBeGreaterThan(0)
  })
})
