import { describe, expect, it } from 'vitest'
import { PANEL_ENTRY_BY_ID } from '../../../content/components'
import { COMPONENT_INDEX } from '../../../content/componentCatalogue'
import { INVERTER_MODELS, MODEL_BY_ID } from '../../../content/models'
import { emptyProgress } from '../../../store/progressStore'
import { terminalsFor } from '../scene/terminals'
import { SAFE_V, assess, energyAt, methodsFor, predictionCorrect, timeToSafe, voltageAt } from './discharge'
import { ASSESSMENT_ID, CHALLENGE_SIZE, buildChallenge, countsAsAssessment } from './identify'
import { LAB3D_LESSONS, newlySatisfiedLessons } from './lessons'
import { canInstall, canRemove, currentInstallStage, currentRemovalStage, installableNow, procedureParts, removableNow, removalPrerequisites, stageOf } from './procedure'
import { resistorBands } from './resistor'

const LF = MODEL_BY_ID.lf3k

describe.each(INVERTER_MODELS.map((m) => [m.id, m] as const))('model %s integrity', (_id, m) => {
  it('has unique part ids and resolvable components', () => {
    expect(new Set(m.parts.map((p) => p.id)).size).toBe(m.parts.length)
    for (const p of m.parts) expect(PANEL_ENTRY_BY_ID[p.componentId], p.id).toBeDefined()
  })

  it('places 3D terminals only on pins documented for that component', () => {
    for (const p of m.parts) {
      const documented = PANEL_ENTRY_BY_ID[p.componentId].terminals.map((t) => t.id)
      for (const t of terminalsFor(p.geometry)) expect(documented, `${p.id}:${t.terminalId}`).toContain(t.terminalId)
    }
  })

  it('has explode offsets for every movable part and valid assemblies', () => {
    const asm = new Set(m.assemblies.map((a) => a.id))
    for (const p of m.parts) {
      expect(asm.has(p.assembly), p.id).toBe(true)
      if (p.id !== 'enclosure') expect(Math.hypot(...p.explodeOffset), p.id).toBeGreaterThan(0)
    }
  })

  it('assigns every part except the chassis frame to exactly one procedure stage', () => {
    const inStages = procedureParts(m)
    expect(new Set(inStages).size).toBe(inStages.length)
    expect([...inStages].sort()).toEqual(m.parts.filter((p) => p.id !== 'enclosure').map((p) => p.id).sort())
  })

  it('never requires a later-stage part to be removed first', () => {
    for (const p of m.parts.filter((q) => q.id !== 'enclosure')) {
      for (const d of removalPrerequisites(m, p.id)) expect(stageOf(m, d), `${d} before ${p.id}`).toBeLessThanOrEqual(stageOf(m, p.id))
      if (p.mountedOn) expect(m.parts.find((q) => q.id === p.mountedOn), p.id).toBeDefined()
    }
  })

  it('can be fully disassembled and reassembled by following the rules (no dead ends)', () => {
    const removed: string[] = []
    const actions: string[] = []
    for (let guard = 0; guard < 500 && currentRemovalStage(m, removed, actions) < m.procedure.length; guard++) {
      const stage = m.procedure[currentRemovalStage(m, removed, actions)]
      if (stage.action && !actions.includes(stage.id)) {
        actions.push(stage.id)
        continue
      }
      const next = removableNow(m, removed, actions)
      expect(next.length, `stuck in ${stage.id}`).toBeGreaterThan(0)
      removed.push(next[0].id)
    }
    expect(currentRemovalStage(m, removed, actions)).toBe(m.procedure.length)
    for (let guard = 0; guard < 500 && currentInstallStage(m, removed) !== -1; guard++) {
      const next = installableNow(m, removed)
      expect(next.length).toBeGreaterThan(0)
      removed.splice(removed.indexOf(next[0].id), 1)
    }
    expect(removed).toEqual([])
  })

  it('has checkpoint answers within their options and a valid discharge bank', () => {
    for (const s of m.procedure) if (s.checkpoint) expect(s.checkpoint.correct).toBeLessThan(s.checkpoint.options.length)
    expect(m.dischargeBank.capacitanceF).toBeGreaterThan(0)
    for (const id of m.dischargeBank.partIds) expect(m.parts.find((p) => p.id === id)?.componentId).toBe('capacitor')
  })
})

describe('LF-3K coverage and sequencing rules', () => {
  it('contains every one of the 24 catalogued components', () => {
    const used = new Set(LF.parts.map((p) => p.componentId))
    for (const c of COMPONENT_INDEX) expect(used.has(c.id), c.id).toBe(true)
  })

  it('blocks removal before isolation and explains why', () => {
    const r = canRemove(LF, [], [], 'cover')
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.reason).toMatch(/isolate every energy source/)
  })

  it('refuses a board before its components and names the blockers', () => {
    const actions = ['isolate', 'discharge']
    const removed = ['cover', 'disp']
    const r = canRemove(LF, removed, actions, 'pcb-ctrl')
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.reason).toMatch(/Microcontroller U6/)
  })

  it('requires the discharge action before the display board', () => {
    expect(canRemove(LF, ['cover'], ['isolate'], 'disp').ok).toBe(false)
    expect(canRemove(LF, ['cover'], ['isolate', 'discharge'], 'disp').ok).toBe(true)
  })

  it('installs the earth stud first and boards before their parts on reassembly', () => {
    const all = procedureParts(LF)
    expect(canInstall(LF, all, 'bat-pos').ok).toBe(false)
    expect(canInstall(LF, all, 'pe').ok).toBe(true)
    const afterTerminals = all.filter((id) => !['pe', 'ac-out', 'breaker', 'pv-pos', 'pv-neg', 'fuse', 'bat-pos', 'bat-neg', 't1', 'l1', 'c7'].includes(id))
    expect(canInstall(LF, afterTerminals, 'c5').ok).toBe(false)
    expect(canInstall(LF, afterTerminals, 'pcb-main').ok).toBe(true)
  })
})

describe('capacitor discharge physics', () => {
  const bank = LF.dischargeBank
  const [bleeder, t470, t2k2, short] = methodsFor(bank)

  it('stores ½CV² ≈ 82.9 J at 420 V on 940 µF', () => {
    expect(energyAt(bank, 420)).toBeCloseTo(82.9, 1)
  })

  it('follows V₀·e^(−t/RC) and reaches 50 V at τ·ln(V₀/50)', () => {
    const t = timeToSafe(bank, bleeder.ohms)
    expect(t).toBeCloseTo(94_000 * 940e-6 * Math.log(420 / 50), 6)
    expect(voltageAt(bank, bleeder.ohms, t)).toBeCloseTo(SAFE_V, 6)
    expect(voltageAt(bank, t470.ohms, 470 * 940e-6)).toBeCloseTo(420 / Math.E, 6)
  })

  it('rates the methods: bleeder safe but slow, small tool caution, screwdriver unsafe', () => {
    expect(assess(bank, bleeder).verdict).toBe('safe')
    expect(assess(bank, bleeder).tSafeS).toBeGreaterThan(180)
    expect(assess(bank, t470).verdict).toBe('safe')
    expect(assess(bank, t2k2).verdict).toBe('caution')
    const s = assess(bank, short)
    expect(s.verdict).toBe('unsafe')
    expect(s.peakCurrentA).toBeGreaterThan(10_000)
  })

  it('accepts predictions within ±15 %', () => {
    const t = timeToSafe(bank, t470.ohms)
    expect(predictionCorrect(bank, t470.ohms, t * 1.1)).toBe(true)
    expect(predictionCorrect(bank, t470.ohms, t * 1.3)).toBe(false)
  })

  it('handles a bank that starts below the threshold (SQ-1K)', () => {
    const b = MODEL_BY_ID.sq1k.dischargeBank
    expect(timeToSafe(b, 1000)).toBe(0)
    expect(assess(b, methodsFor(b)[0]).notes.join(' ')).toMatch(/below the 50 V/)
  })
})

describe('identification challenge by level', () => {
  it('sizes challenges 8 / 12 / 20 on the LF-3K with unique, present components', () => {
    for (const level of ['beginner', 'intermediate', 'advanced'] as const) {
      const c = buildChallenge(LF, level, 42)
      expect(c).toHaveLength(CHALLENGE_SIZE[level])
      expect(new Set(c.map((p) => p.componentId)).size).toBe(c.length)
      for (const p of c) expect(LF.parts.some((q) => q.componentId === p.componentId)).toBe(true)
    }
    expect(countsAsAssessment(LF, 'advanced', 20)).toBe(true)
    expect(ASSESSMENT_ID).toBe('asm-01')
  })

  it('describes intermediate targets by function without naming them', () => {
    for (const p of buildChallenge(LF, 'intermediate', 7)) expect(p.text).toMatch(/^Find the part that does this/)
  })

  it('does not count a smaller model as the 20-component assessment', () => {
    const c = buildChallenge(MODEL_BY_ID.sq1k, 'advanced', 1)
    expect(c.length).toBeLessThan(20)
    expect(countsAsAssessment(MODEL_BY_ID.sq1k, 'advanced', c.length)).toBe(false)
  })
})

describe('lesson completion criteria', () => {
  it('completes l3d-03 once transformer and inductor are inspected', () => {
    const p = emptyProgress()
    p.inspectedComponents = ['transformer']
    expect(newlySatisfiedLessons(p)).not.toContain('l3d-03')
    p.inspectedComponents.push('inductor')
    expect(newlySatisfiedLessons(p)).toContain('l3d-03')
  })

  it('references only real components and covers all six 3D Lab lessons', () => {
    expect(LAB3D_LESSONS.map((l) => l.lessonId)).toEqual(['l3d-01', 'l3d-02', 'l3d-03', 'l3d-04', 'l3d-05', 'l3d-06'])
    for (const l of LAB3D_LESSONS) for (const id of l.inspect ?? []) expect(PANEL_ENTRY_BY_ID[id], id).toBeDefined()
  })
})

describe('resistor colour code', () => {
  it('encodes common values', () => {
    expect(resistorBands(47_000, 5)).toEqual(['yellow', 'violet', 'orange', 'gold'])
    expect(resistorBands(1000, 5)).toEqual(['brown', 'black', 'red', 'gold'])
    expect(resistorBands(220, 1)).toEqual(['red', 'red', 'brown', 'brown'])
    expect(resistorBands(10, 10)).toEqual(['brown', 'black', 'black', 'silver'])
  })
})
