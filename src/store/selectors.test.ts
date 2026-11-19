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
      { assessmentId: 'asm-01', at: 0, score: 5, maxScore: 10 },
      { assessmentId: 'asm-01', at: 1, score: 9, maxScore: 10 },
    ]
    p.assessments.push({ assessmentId: 'not-a-syllabus-assessment', at: 2, score: 0, maxScore: 10 })
    const s = summarise(p)
    expect(s.assessments.taken).toBe(1)
    expect(s.troubleshooting.ratePct).toBe(50)
    expect(s.assessments.averagePct).toBeCloseTo(90)
    expect(s.overallPct).toBeGreaterThan(0)
  })

  // Regression for the Phase 9 review finding: a passed Repair Workshop scenario is recorded as a
  // 'troubleshoot' Attempt (the current Academy attempt model), not as a legacy `diagnoses` entry.
  // Before this fix, summarise() only ever read `diagnoses` (which nothing writes any more), so a
  // scenario scored 8/8 in the workshop never moved the troubleshooting share of overall progress
  // and the sidebar kept showing 0.0% regardless of how many scenarios had been solved.
  it('credits a passed repair-workshop scenario (troubleshoot attempt), not just legacy diagnoses', () => {
    const p = emptyProgress()
    p.attempts = [{ id: 'att-1', kind: 'troubleshoot', ref: 'rsc-05', score: 8, max: 8, at: 0, durationMs: 1000, answers: {} }]
    const s = summarise(p)
    expect(s.troubleshooting.attempts).toBe(1)
    expect(s.troubleshooting.correct).toBe(1)
    expect(s.troubleshooting.ratePct).toBe(100)
    expect(s.overallPct).toBeGreaterThan(0)
  })

  it('does not double-count a scenario solved via both legacy diagnoses and a troubleshoot attempt', () => {
    const p = emptyProgress()
    p.diagnoses = [{ scenarioId: 'rsc-05', at: 0, sectionGuess: 'power-stage', partGuess: 'q1', correct: true, usedHints: 0, testsPerformed: 2 }]
    p.attempts = [{ id: 'att-1', kind: 'troubleshoot', ref: 'rsc-05', score: 8, max: 8, at: 1, durationMs: 1000, answers: {} }]
    const s = summarise(p)
    // Two attempt records, but the same scenario — the overall-progress fraction only credits it once.
    const withoutAttempt = summarise({ ...p, attempts: [] })
    expect(s.overallPct).toBe(withoutAttempt.overallPct)
  })
})
