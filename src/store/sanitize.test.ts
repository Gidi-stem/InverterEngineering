import { describe, expect, it } from 'vitest'
import { niceStep } from '../engine/waveform/scale'
import { newId } from './id'
import { emptyProgress } from './progressStore'
import { looksLikeBackup, sanitizeProgress } from './sanitize'
import { summarise } from './selectors'

describe('sanitizeProgress (audit fix: corrupted backups and storage)', () => {
  it('repairs moduleVisits: null, which previously crashed every page on load', () => {
    const p = sanitizeProgress({ schemaVersion: 1, moduleVisits: null })
    expect(p.moduleVisits).toEqual({})
    expect(() => summarise(p)).not.toThrow()
  })

  it('drops malformed entries but keeps valid ones', () => {
    const p = sanitizeProgress({
      completedLessons: ['fun-01', 42, 'fun-01', null],
      simulationRuns: [{ id: 'a', at: 1, label: 'ok', params: {}, results: {} }, { id: 'b' }, 'junk'],
      assessments: [{ assessmentId: 'x', at: 1, score: 3, maxScore: 5 }, { assessmentId: 'y', score: 'high' }],
      moduleVisits: { lab3d: 5, solar: 'yesterday' },
    })
    expect(p.completedLessons).toEqual(['fun-01'])
    expect(p.simulationRuns.map((r) => r.id)).toEqual(['a'])
    expect(p.assessments).toHaveLength(1)
    expect(p.moduleVisits).toEqual({ lab3d: 5 })
  })

  it('round-trips a valid record unchanged', () => {
    const e = emptyProgress()
    expect(sanitizeProgress(e)).toEqual(e)
  })

  it('accepts only schema v1 objects as backups', () => {
    expect(looksLikeBackup({ schemaVersion: 1 })).toBe(true)
    expect(looksLikeBackup([{ schemaVersion: 1 }])).toBe(false)
    expect(looksLikeBackup({ schemaVersion: 2 })).toBe(false)
    expect(looksLikeBackup(null)).toBe(false)
  })
})

describe('newId (audit fix: non-secure contexts)', () => {
  it('produces RFC 4122 v4-shaped, unique ids without crypto.randomUUID', () => {
    const original = crypto.randomUUID
    Object.defineProperty(crypto, 'randomUUID', { value: undefined, configurable: true })
    try {
      const ids = new Set(Array.from({ length: 500 }, newId))
      expect(ids.size).toBe(500)
      for (const id of ids) expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
    } finally {
      Object.defineProperty(crypto, 'randomUUID', { value: original, configurable: true })
    }
  })
})

describe('niceStep', () => {
  it('follows the 1-2-5 scope sequence', () => {
    expect([0.7, 1, 1.1, 2.5, 5, 93, 0.0042].map(niceStep)).toEqual([1, 1, 2, 5, 5, 100, 0.005])
    expect(niceStep(0)).toBe(1)
    expect(niceStep(Number.NaN)).toBe(1)
  })
})
