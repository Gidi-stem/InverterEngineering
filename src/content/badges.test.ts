import { describe, expect, it } from 'vitest'
import { emptyProgress } from '../store/progressStore'
import { BADGES } from './badges'

describe('Fault Finder badge', () => {
  const faultFinder = BADGES.find((b) => b.id === 'fault-finder')!

  it('is not earned with no diagnoses or troubleshoot attempts', () => {
    expect(faultFinder.earned(emptyProgress())).toBe(false)
  })

  // Regression for the Phase 9 review finding: the Repair Workshop records a passed scenario as a
  // 'troubleshoot' Attempt, not a legacy `diagnoses` entry (nothing writes those any more), so this
  // badge must read attempts to ever fire from real Repair Workshop play.
  it('is earned after three distinct repair-workshop scenarios are passed via troubleshoot attempts', () => {
    const p = emptyProgress()
    p.attempts = ['rsc-01', 'rsc-02', 'rsc-03'].map((ref, i) => ({
      id: `att-${i}`,
      kind: 'troubleshoot' as const,
      ref,
      score: 8,
      max: 8,
      at: i,
      durationMs: 1000,
      answers: {},
    }))
    expect(faultFinder.earned(p)).toBe(true)
  })

  it('does not count a failed (partial-score) attempt', () => {
    const p = emptyProgress()
    p.attempts = ['rsc-01', 'rsc-02', 'rsc-03'].map((ref, i) => ({
      id: `att-${i}`,
      kind: 'troubleshoot' as const,
      ref,
      score: 6,
      max: 8,
      at: i,
      durationMs: 1000,
      answers: {},
    }))
    expect(faultFinder.earned(p)).toBe(false)
  })

  it('still honours legacy diagnoses data', () => {
    const p = emptyProgress()
    p.diagnoses = ['a', 'b', 'c'].map((scenarioId, i) => ({
      scenarioId,
      at: i,
      sectionGuess: 'power-stage',
      partGuess: 'q1',
      correct: true,
      usedHints: 0,
      testsPerformed: 2,
    }))
    expect(faultFinder.earned(p)).toBe(true)
  })
})
