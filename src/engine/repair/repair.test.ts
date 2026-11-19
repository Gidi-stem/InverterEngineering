import { describe, expect, it } from 'vitest'
import { markCheckpoint, scoreScenario } from './scoring'
import { REPAIR_CATEGORY_SCENARIOS, REPAIR_SCENARIOS } from './scenarios'
import { RUBRIC_ORDER, type Checkpoint } from './types'

describe('repair scenarios: structure', () => {
  it('has exactly seventeen scenarios, matching the brief', () => {
    expect(REPAIR_SCENARIOS.length).toBe(17)
  })

  it('every scenario id is unique', () => {
    const ids = REPAIR_SCENARIOS.map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('every scenario belongs to one of the five workshop categories, and the category map covers all of them', () => {
    const fromMap = Object.values(REPAIR_CATEGORY_SCENARIOS).flat()
    expect(new Set(fromMap)).toEqual(new Set(REPAIR_SCENARIOS.map((s) => s.id)))
  })

  it('every scenario has at least one checkpoint for every rubric category (brief §7: not just the final diagnosis)', () => {
    for (const s of REPAIR_SCENARIOS) {
      const present = new Set(s.checkpoints.map((c) => c.rubric))
      for (const r of RUBRIC_ORDER) expect(present.has(r), `${s.id} is missing a '${r}' checkpoint`).toBe(true)
    }
  })

  it('every scenario names the reported problem, equipment, symptoms, instruments, candidate causes, confirmed fault, repair steps, verification and safety context (brief §3/§8)', () => {
    for (const s of REPAIR_SCENARIOS) {
      expect(s.reportedProblem.length).toBeGreaterThan(10)
      expect(s.equipment.length).toBeGreaterThan(10)
      expect(s.initialSymptoms.length).toBeGreaterThanOrEqual(2)
      expect(s.usefulInstruments.length).toBeGreaterThanOrEqual(1)
      expect(s.candidateCauses.length).toBeGreaterThanOrEqual(3)
      expect(s.confirmedFault.length).toBeGreaterThan(5)
      expect(s.repairSteps.length).toBeGreaterThanOrEqual(5)
      expect(s.verificationNote.length).toBeGreaterThan(5)
      expect(s.safety.length).toBeGreaterThan(5)
    }
  })

  it('every repair step named by a scenario is one of the fixed taxonomy ids, in a sensible order (inspect before verify)', () => {
    const order = ['inspect', 'isolate', 'discharge', 'visual', 'measure', 'remove', 'replace', 'solder', 'post-test', 'verify', 'document']
    for (const s of REPAIR_SCENARIOS) {
      const idx = s.repairSteps.map((r) => order.indexOf(r.id))
      expect(idx.every((i) => i >= 0), `${s.id} uses an unknown repair-step id`).toBe(true)
      expect(idx, `${s.id}'s repair steps are not in the taxonomy's order`).toEqual([...idx].sort((a, b) => a - b))
    }
  })

  it('every readings() function runs without throwing and returns at least one real reading', () => {
    for (const s of REPAIR_SCENARIOS) {
      const r = s.readings()
      expect(r.length, `${s.id} produced no readings`).toBeGreaterThan(0)
      for (const row of r) expect(Number.isFinite(row.value), `${s.id} reading "${row.label}" is not a finite number`).toBe(true)
    }
  })
})

describe('repair scenarios: fault injection reaches the real engine (brief §4)', () => {
  it('a faulted circuit reads differently from its healthy counterpart for every circuit-grounded scenario', () => {
    // Every scenario whose reading set carries a `healthy` comparison value for at least one row is
    // claiming the fault actually changed something observable; confirm the two differ. The one
    // exception is rsc-14, whose whole diagnostic point is that the ACTUAL current (independently
    // clamped) is unchanged — the fault is a sensor over-reporting, a mismatch between two different
    // displayed rows rather than a healthy/fault drift in any one of them.
    // rsc-15 and rsc-16 are the same shape: the upstream quantity (sensing/coil command; array V_oc/
    // I_sc) reads correctly and unchanged, because the fault is downstream of it (the relay's
    // mechanical contacts; the controller's own tracking) — evidenced by a mismatch BETWEEN rows,
    // not a healthy/fault drift within any one of them.
    const crossRowScenarios = new Set(['rsc-14', 'rsc-15', 'rsc-16'])
    for (const s of REPAIR_SCENARIOS) {
      if (crossRowScenarios.has(s.id)) continue
      const rows = s.readings()
      const compared = rows.filter((r) => r.healthy !== undefined)
      if (compared.length === 0) continue
      const changed = compared.some((r) => Math.abs(r.value - (r.healthy as number)) > 1e-6)
      expect(changed, `${s.id}: no reading differs from its healthy comparison value`).toBe(true)
    }
  })

  it('rsc-14: the sensor-reported current disagrees with the independent clamp reading, which is the whole fault', () => {
    const rows = REPAIR_SCENARIOS.find((s) => s.id === 'rsc-14')!.readings()
    const clamp = rows.find((r) => r.label.toLowerCase().includes('clamp'))!
    const sensor = rows.find((r) => r.label.toLowerCase().includes('sensor'))!
    expect(Math.abs(sensor.value - clamp.value)).toBeGreaterThan(1)
  })

  it('rsc-15: the relay is commanded correctly but the load stays on the backup path, which is the whole fault', () => {
    const rows = REPAIR_SCENARIOS.find((s) => s.id === 'rsc-15')!.readings()
    const path = rows.find((r) => r.label.toLowerCase().includes('supply path'))!
    expect(String(path.unit)).toContain('backup')
  })

  it('rsc-16: the controller\'s actual operating power is far below the reference maximum-power point', () => {
    const rows = REPAIR_SCENARIOS.find((s) => s.id === 'rsc-16')!.readings()
    const actual = rows.find((r) => r.label.includes('actual operating point'))!
    const reference = rows.find((r) => r.label.includes('reference'))!
    expect(actual.value).toBeLessThan(reference.value * 0.5)
  })
})

describe('markCheckpoint', () => {
  const mcq: Checkpoint = { id: 'x', rubric: 'diagnose', type: 'mcq', prompt: '', options: ['a', 'b'], answer: 1, explain: '' }
  const multi: Checkpoint = { id: 'y', rubric: 'eliminate', type: 'multi', prompt: '', options: ['a', 'b', 'c'], answers: [0, 2], explain: '' }
  const numeric: Checkpoint = { id: 'z', rubric: 'interpret', type: 'numeric', prompt: '', answer: 10, tol: 0.05, unit: 'V', explain: '' }

  it('marks mcq by exact index', () => {
    expect(markCheckpoint(mcq, 1)).toBe(true)
    expect(markCheckpoint(mcq, 0)).toBe(false)
  })
  it('marks multi by exact set match', () => {
    expect(markCheckpoint(multi, [0, 2])).toBe(true)
    expect(markCheckpoint(multi, [2, 0])).toBe(true)
    expect(markCheckpoint(multi, [0])).toBe(false)
    expect(markCheckpoint(multi, [0, 1, 2])).toBe(false)
  })
  it('marks numeric within tolerance', () => {
    expect(markCheckpoint(numeric, 10.4)).toBe(true)
    expect(markCheckpoint(numeric, 10.6)).toBe(false)
  })
  it('treats a null/undefined answer as incorrect for every type', () => {
    expect(markCheckpoint(mcq, null)).toBe(false)
    expect(markCheckpoint(multi, null)).toBe(false)
    expect(markCheckpoint(numeric, null)).toBe(false)
  })
})

describe('scoreScenario (brief §7: do not award full marks for the diagnosis alone)', () => {
  const scenario = REPAIR_SCENARIOS[0]

  it('scores less than full marks when only the diagnosis checkpoint is answered correctly', () => {
    const diagnose = scenario.checkpoints.find((c) => c.rubric === 'diagnose')!
    const answers: Record<string, number> = { [diagnose.id]: (diagnose as { answer: number }).answer }
    const score = scoreScenario(scenario.checkpoints, answers)
    expect(score.passed).toBe(false)
    expect(score.score).toBeLessThan(score.max)
  })

  it('scores full marks, across every rubric category, when every checkpoint is answered correctly', () => {
    const answers: Record<string, number | number[]> = {}
    for (const c of scenario.checkpoints) answers[c.id] = c.type === 'multi' ? c.answers : c.answer
    const score = scoreScenario(scenario.checkpoints, answers)
    expect(score.passed).toBe(true)
    expect(score.score).toBe(score.max)
    expect(score.byRubric.length).toBe(RUBRIC_ORDER.length)
  })
})
