import { describe, expect, it } from 'vitest'
import { BUILD_PROJECTS, DEFAULT_SELECTION, suggestSelection } from '../../content/buildProjects'
import { cloneDoc } from '../circuit/build'
import { analyseCircuit } from '../circuit/validate'
import { compile } from '../sim/netlist'
import { verifySteps } from './assembly'
import { calculate } from './calc'
import { checkCompatibility } from './compat'
import { generateProject } from './generate'
import { inSyncWithDesign, kitRemaining, placeKitPart, starterDoc, syncToDesign } from './kit'
import { runSuite, type SuiteContext, type TestKind } from './testing'

const P = (id: string) => BUILD_PROJECTS.find((p) => p.id === id)!

/** A correctly completed design: suggested ratings and, for the solar project, the MPPT duty nearest the maximum-power point. */
function setup(id: string) {
  const p = P(id)
  let d = p.defaults
  const sel = suggestSelection(id, d)
  if (id === 'bld-g') {
    const ideal = calculate(id, d, sel).numbers.mpptDutyIdeal
    d = { ...d, mpptDuty: p.options.mpptDuty!.reduce((a, x) => (Math.abs(x - ideal) < Math.abs(a - ideal) ? x : a)) }
  }
  const { numbers: nb, items } = calculate(id, d, sel)
  const build = generateProject(id, d, sel, nb)
  return { p, d, sel, nb, items, build }
}
const ctxOf = (s: ReturnType<typeof setup>): SuiteContext => ({ projectId: s.p.id, design: s.d, numbers: s.nb, build: { probes: s.build.probes, simStep: s.build.simStep }, regulated: s.d.waveform === 'sine' && s.sel.vsensor, waveform: s.d.waveform })

describe('design calculations', () => {
  it('square-wave 12 V → 230 V, 500 W: hand values', () => {
    const { nb, items } = setup('bld-b')
    expect(nb.s).toBeCloseTo(500, 6)
    expect(nb.iout).toBeCloseTo(500 / 230, 4)
    expect(nb.rload).toBeCloseTo((230 * 230) / 500, 3)
    // DC current at minimum battery voltage = P / (η · V_min)
    expect(nb.idcMax).toBeCloseTo(500 / (nb.efficiency * nb.vmin), 2)
    expect(nb.vmin).toBeCloseTo(10.5, 6)
    expect(nb.efficiency).toBeGreaterThan(0.7)
    expect(nb.efficiency).toBeLessThan(1)
    // Every item carries an explanation and a formula
    for (const it of items) {
      expect(it.why.length).toBeGreaterThan(10)
      expect(it.formula.length).toBeGreaterThan(0)
    }
  })
  it('transformer ratio: square at nominal, sine with the peak at the minimum battery voltage and m = 0.95', () => {
    const val = (items: { id: string; value: number }[], id: string) => items.find((x) => x.id === id)!.value
    const b = calculate('bld-b', P('bld-b').defaults, DEFAULT_SELECTION)
    expect(b.numbers.n).toBeCloseTo(230 / ((12 - val(b.items, 'drop')) * (1 - val(b.items, 'xreg'))), 2)
    const dd = calculate('bld-d', P('bld-d').defaults, DEFAULT_SELECTION)
    expect(dd.numbers.n).toBeCloseTo((Math.SQRT2 * 230) / (0.95 * (dd.numbers.vmin - val(dd.items, 'drop')) * (1 - val(dd.items, 'xreg'))), 2)
  })
  it('modified sine uses α = 90° and push-pull doubles switch stress', () => {
    expect(setup('bld-c').nb.alpha).toBeCloseTo(90, 6)
    const e = setup('bld-e')
    expect(e.nb.switchVReq).toBeGreaterThanOrEqual(2 * e.nb.vmax)
  })
  it('fuse is the next standard size above 1.25 · I_dc,max', () => {
    const { nb } = setup('bld-b')
    expect(nb.fuse).toBeGreaterThanOrEqual(1.25 * nb.idcMax)
  })
})

describe('component compatibility', () => {
  it('suggested selections have no failures for every project', () => {
    for (const p of BUILD_PROJECTS) {
      const s = setup(p.id)
      const fails = checkCompatibility(p.id, s.d, s.sel, s.nb).filter((c) => c.status === 'fail')
      expect(fails.map((f) => `${p.id}:${f.aspect}`)).toEqual([])
    }
  })
  it('detects an under-rated switch, an IGBT at high frequency and a missing sensor', () => {
    const s = setup('bld-d')
    const bad = { ...s.sel, switchV: 20, switchType: 'igbt' as const, vsensor: false }
    const nb = calculate('bld-d', { ...s.d, fsw: 25000 }, bad).numbers
    const c = checkCompatibility('bld-d', { ...s.d, fsw: 25000 }, bad, nb)
    const failed = c.filter((x) => x.status === 'fail').map((x) => x.aspect)
    expect(failed.length).toBeGreaterThanOrEqual(2)
    expect(c.some((x) => x.status === 'fail' && /voltage/i.test(x.aspect))).toBe(true)
  })
})

describe('assembly sequences and circuit integration', () => {
  for (const p of BUILD_PROJECTS) {
    it(`${p.id}: reference build satisfies every step, has no danger issues and compiles`, () => {
      const { build } = setup(p.id)
      const st = verifySteps(build.doc, build.steps)
      expect(st.filter((x) => !x.done).map((x) => `${x.id}: ${x.missing.join('; ')}`)).toEqual([])
      const a = analyseCircuit(build.doc)
      expect(a.issues.filter((i) => i.severity === 'danger').map((i) => i.id)).toEqual([])
      const net = compile(build.doc)
      expect('error' in net ? net.error : 'ok').toBe('ok')
    })
  }
  it('a removed connection fails its step; placement alone is not credited', () => {
    const { build } = setup('bld-d')
    const broken = cloneDoc(build.doc)
    broken.wires = broken.wires.filter((w) => !(w.a.partId === 'Q1' || w.b.partId === 'Q1'))
    const st = verifySteps(broken, build.steps)
    expect(st.some((x) => !x.done)).toBe(true)
    const bare = cloneDoc(build.doc)
    bare.wires = []
    expect(verifySteps(bare, build.steps).every((x) => !x.done)).toBe(true)
  })
})

describe('simulation results', () => {
  for (const p of BUILD_PROJECTS) {
    it(`${p.id}: resistive and waveform tests pass`, () => {
      const s = setup(p.id)
      const kinds: TestKind[] = p.id === 'bld-h' ? ['grid', 'resistive'] : ['resistive', 'waveform']
      const r = runSuite(s.build.doc, ctxOf(s), kinds)
      expect(r.filter((x) => x.status === 'fail').map((x) => `${x.kind}: ${x.explanation}`)).toEqual([])
    }, 120_000)
  }
  it('bld-a and bld-d: full engineering test suite passes', () => {
    for (const id of ['bld-a', 'bld-d']) {
      const s = setup(id)
      const r = runSuite(s.build.doc, ctxOf(s))
      expect(r.filter((x) => x.status === 'fail').map((x) => `${id} ${x.kind}: ${x.readings.map((q) => `${q.label}=${q.value}`).join(', ')}`)).toEqual([])
    }
  }, 300_000)
  it('troubleshooting faults change the measured behaviour', () => {
    for (const p of BUILD_PROJECTS) {
      const s = setup(p.id)
      const good = runSuite(s.build.doc, ctxOf(s), [p.troubleshoot.test])[0]
      const bad = runSuite(p.troubleshoot.apply(s.build.doc), ctxOf(s), [p.troubleshoot.test])[0]
      expect(`${p.id} faulty: ${bad.status}`).toBe(`${p.id} faulty: fail`)
      expect(`${p.id} good: ${good.status} ${good.readings.map((q) => `${q.label}=${q.value}`).join(', ')}`).not.toMatch(/ fail /)
    }
  }, 300_000)
})

describe('parts kit and level-dependent assembly', () => {
  it('beginner starts with every part placed and no wires; others start empty; placement alone completes nothing', () => {
    const { build } = setup('bld-d')
    const beg = starterDoc(build, 'beginner')
    expect(beg.parts).toHaveLength(build.doc.parts.length)
    expect(beg.wires).toHaveLength(0)
    expect(verifySteps(beg, build.steps).filter((s) => s.done).map((s) => s.id)).toEqual([])
    expect(starterDoc(build, 'advanced').parts).toHaveLength(0)
  })
  it('placing every kit part anywhere and wiring as the reference completes all steps', () => {
    const { build } = setup('bld-b')
    let doc = starterDoc(build, 'intermediate')
    build.doc.parts.forEach((p, i) => {
      doc = placeKitPart(doc, p, 100 + i * 7, 60)
    })
    expect(kitRemaining(doc, build)).toHaveLength(0)
    expect(placeKitPart(doc, build.doc.parts[0], 0, 0)).toBe(doc) // no duplicates
    doc = { ...doc, wires: build.doc.wires }
    expect(verifySteps(doc, build.steps).every((s) => s.done)).toBe(true)
  })
  it('changing MOSFET to IGBT keeps every connection by mapping terminals', () => {
    const s = setup('bld-d')
    const igbtSel = { ...s.sel, switchType: 'igbt' as const }
    const nb = calculate('bld-d', s.d, igbtSel).numbers
    const next = generateProject('bld-d', s.d, igbtSel, nb)
    const synced = syncToDesign(s.build.doc, next)
    expect(synced.parts.find((p) => p.id === 'Q1')!.type).toBe('igbt')
    expect(inSyncWithDesign(synced, next)).toBe(true)
    expect(inSyncWithDesign(s.build.doc, next)).toBe(false)
    expect(verifySteps(synced, next.steps).every((x) => x.done)).toBe(true)
  })
})
