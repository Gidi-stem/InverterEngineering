import { describe, expect, it } from 'vitest'
import { cloneDoc } from '../engine/circuit/build'
import { recordRun } from '../engine/sim/record'
import { MODULE_BY_ID } from './modules'
import { FUNDAMENTALS_CRITERIA, SIM_EXPERIMENTS, quasiSquare } from './simExperiments'

describe('simulation experiments', () => {
  it('ten experiments with objectives, setup, questions and valid question references', () => {
    expect(SIM_EXPERIMENTS.map((e) => e.id)).toEqual(Array.from({ length: 10 }, (_, i) => `sim-${String(i + 1).padStart(2, '0')}`))
    for (const e of SIM_EXPERIMENTS) {
      expect(e.objectives.length).toBeGreaterThan(1)
      expect(e.setup.length).toBeGreaterThan(1)
      expect(e.questions.length).toBeGreaterThanOrEqual(3)
      const ids = e.observe.toString()
      for (const q of e.questions) if (q.kind === 'numeric') expect(ids, `${e.id} ${q.id}`).toMatch(new RegExp(`['"]${q.observation}['"]`))
    }
  })

  it('every Fundamentals lesson is earned by experiments that exist', () => {
    expect(FUNDAMENTALS_CRITERIA.map((c) => c.lessonId)).toEqual(MODULE_BY_ID.fundamentals.lessons.map((l) => l.id))
    const ids = new Set(SIM_EXPERIMENTS.map((e) => e.id))
    for (const c of FUNDAMENTALS_CRITERIA) for (const x of c.experiments) expect(ids.has(x)).toBe(true)
    expect(new Set(FUNDAMENTALS_CRITERIA.flatMap((c) => c.experiments)).size).toBe(10)
  })

  it('quasi-square closed forms: square wave 48.3 % THD, 120° conduction 31.1 %', () => {
    expect(quasiSquare(180).thd).toBeCloseTo(0.4834, 3)
    expect(quasiSquare(120).thd).toBeCloseTo(0.3108, 3)
    expect(quasiSquare(120).rmsRatio).toBeCloseTo(Math.sqrt(2 / 3), 6)
  })

  it.each(SIM_EXPERIMENTS.map((e) => [e.id, e.title] as const))('%s (%s): simulated observations agree with the independent expectations', (id) => {
    const e = SIM_EXPERIMENTS.find((x) => x.id === id)!
    const doc = cloneDoc(e.circuit)
    const r = recordRun(doc, e.run.duration, e.run.keys, e.run.keep)
    expect(r.error).toBeUndefined()
    const o = e.observe(doc, r)
    expect(o.filter((x) => !x.pass).map((x) => `${x.id}: measured ${x.measured} vs ${x.expected}`)).toEqual([])
  })

  it('sim-09: setting leg B to 120° gives a modified sine with lower THD, still matching its closed form', () => {
    const e = SIM_EXPERIMENTS[8]
    const doc = cloneDoc(e.circuit)
    for (const g of ['G3', 'G4']) doc.parts.find((p) => p.id === g)!.params.phase = 120
    const o = e.observe(doc, recordRun(doc, e.run.duration, e.run.keys, e.run.keep))
    expect(o.filter((x) => !x.pass).map((x) => x.id)).toEqual([])
    expect(o.find((x) => x.id === 'thd')!.measured!).toBeLessThan(0.35)
  })

  it('changing a parameter changes the simulated result (sim-06: duty 25 % → 75 %)', () => {
    const e = SIM_EXPERIMENTS[5]
    const doc = cloneDoc(e.circuit)
    const before = e.observe(doc, recordRun(doc, e.run.duration, e.run.keys, e.run.keep)).find((x) => x.id === 'iavg')!.measured!
    doc.parts.find((p) => p.id === 'G1')!.params.duty = 75
    const o = e.observe(doc, recordRun(doc, e.run.duration, e.run.keys, e.run.keep))
    expect(o.filter((x) => !x.pass).map((x) => x.id)).toEqual([])
    expect(o.find((x) => x.id === 'iavg')!.measured! / before).toBeGreaterThan(3)
  })
})
