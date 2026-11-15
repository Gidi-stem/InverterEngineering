import { describe, expect, it } from 'vitest'
import { asBuilt, evaluateCommissioning, expectedString } from './commissioning'
import { ambient, irradiance, simulateDispatch } from './dispatch'
import { SOLAR_FAULTS, faultDesign } from './faults'
import { SOLAR_PRESET_BY_ID, SOLAR_PRESETS } from './presets'
import { EXAMPLE_MODULES, MODULE_BY_ID, arrayCurve, fitModule, mpp, operating, perturbObserve, pwmOperating } from './pv'
import { hourlyProfile, loadEnergy, peakPower, sizeSystem } from './sizing'

const rel = (a: number, b: number) => Math.abs(a - b) / Math.abs(b)

describe('PV single-diode model', () => {
  it('reproduces each example module’s STC datasheet points', () => {
    for (const m of EXAMPLE_MODULES) {
      const f = fitModule(m)
      expect(f.rs, m.id).toBeGreaterThanOrEqual(0)
      const c = arrayCurve(m, { series: 1, strings: 1, g: 1000, tCell: 25, points: 600 })
      const p = mpp(c)
      expect(rel(p.p, m.pmax), `${m.id} Pmax`).toBeLessThan(0.005)
      expect(rel(p.v, m.vmp), `${m.id} Vmp`).toBeLessThan(0.02)
      const op = operating(m, 1000, 25)
      expect(rel(op.voc, m.voc)).toBeLessThan(1e-6)
      expect(rel(op.isc, m.isc)).toBeLessThan(1e-6)
    }
  })
  it('follows the datasheet temperature and irradiance behaviour', () => {
    const m = MODULE_BY_ID['mono-400']
    const hot = mpp(arrayCurve(m, { series: 1, strings: 1, g: 1000, tCell: 50 })).p
    expect(rel(hot, m.pmax * (1 + (m.gammaPmax / 100) * 25))).toBeLessThan(0.03)
    expect(rel(operating(m, 1000, 0).voc, m.voc * (1 + (m.betaVoc / 100) * -25))).toBeLessThan(1e-6)
    expect(rel(operating(m, 500, 25).isc, m.isc / 2)).toBeLessThan(1e-6)
    // V_oc falls only logarithmically with irradiance.
    expect(operating(m, 200, 25).voc).toBeGreaterThan(0.9 * m.voc)
  })
  it('series adds voltage and parallel strings add current', () => {
    const m = MODULE_BY_ID['mono-400']
    const one = mpp(arrayCurve(m, { series: 1, strings: 1, g: 1000, tCell: 25, points: 600 }))
    const arr = mpp(arrayCurve(m, { series: 3, strings: 2, g: 1000, tCell: 25, points: 600 }))
    expect(rel(arr.v, 3 * one.v)).toBeLessThan(0.01)
    expect(rel(arr.i, 2 * one.i)).toBeLessThan(0.01)
    expect(rel(arr.p, 6 * one.p)).toBeLessThan(0.01)
  })
  it('partial shading creates a local peak that simple P&O can stick on; a scan finds the global maximum', () => {
    const m = MODULE_BY_ID['mono-400']
    const c = arrayCurve(m, { series: 4, strings: 1, g: [250, 1000, 1000, 1000], tCell: 25, points: 600 })
    let peaks = 0
    for (let k = 1; k < c.length - 1; k++) if (c[k].p > c[k - 1].p && c[k].p >= c[k + 1].p && c[k].p > 50) peaks++
    expect(peaks).toBeGreaterThanOrEqual(2)
    const g = mpp(c)
    const po = perturbObserve(c)
    const sc = perturbObserve(c, { scan: true })
    expect(po.final.p).toBeLessThan(g.p * 0.98)
    expect(sc.final.p).toBeGreaterThan(g.p * 0.97)
  })
  it('P&O converges near the MPP of an unshaded curve', () => {
    const m = MODULE_BY_ID['mono-550']
    const c = arrayCurve(m, { series: 3, strings: 1, g: 800, tCell: 40, points: 600 })
    expect(perturbObserve(c).final.p).toBeGreaterThan(mpp(c).p * 0.98)
  })
  it('PWM harvests most of a matched 36-cell module but little of a 72-cell module on 12 V', () => {
    const small = arrayCurve(MODULE_BY_ID['mono-100-12v'], { series: 1, strings: 1, g: 1000, tCell: 45 })
    const big = arrayCurve(MODULE_BY_ID['poly-330'], { series: 1, strings: 1, g: 1000, tCell: 45 })
    const fs = pwmOperating(small, 13.2).p / mpp(small).p
    const fb = pwmOperating(big, 13.2).p / mpp(big).p
    expect(fs).toBeGreaterThan(0.7)
    expect(fb).toBeLessThan(0.45)
  })
})

describe('load profile and system sizing', () => {
  const d = sizeSystem(SOLAR_PRESET_BY_ID['offgrid-home'].spec)
  const n = d.numbers
  it('load energy, peak and surge (hand-checked)', () => {
    // 8 LEDs 320 + fridge 1152 + TV 240 + phones 160 + laptop 240 + fans 500 + pump 750 + router 240.
    expect(n.eAc).toBeCloseTo(3602, 6)
    expect(n.eDaily).toBeCloseTo(3602 / 0.9, 6)
    expect(n.pPeak).toBe(880)
    expect(n.pSurge).toBe(2380)
    const prof = hourlyProfile(d.spec.loads, true)
    expect(prof.reduce((a, b) => a + b, 0)).toBeCloseTo(n.eAc, 6)
    expect(peakPower(d.spec.loads).at).toBe(6)
    expect(loadEnergy({ id: 'w', name: 'wrap', watts: 100, qty: 1, windows: [[22, 2]], duty: 1, surgeW: 100, ac: true })).toBe(400)
  })
  it('inverter, system voltage and battery bank (hand-checked)', () => {
    expect(n.inverterW).toBe(1500) // max(1.25 × 880, 2380 / 2) = 1190 → 1500 W
    expect(n.vsys).toBe(24)
    expect(n.batSeries).toBe(2)
    expect(n.batParallel).toBe(3) // 4002 × 2 / 0.8 / 24 = 417 Ah → 3 × 200 Ah
    expect(n.bankKWh).toBeCloseTo(15.36, 6)
  })
  it('PV array, string window and controller (hand-checked)', () => {
    expect(n.derate).toBeCloseTo(0.8775 * 0.95 * 0.97 * 0.98, 6)
    expect(n.arrayReqW).toBeCloseTo(4002.22 / (0.95 * 0.97 * 4.5 * n.derate), 0)
    // Cold V_oc 37.1 × (1 + 0.0027 × 13) = 38.40 V → at most 3 in series under 150 V; hot V_mp 28.07 V
    // needs at least 2 for 26.6 + 5 V. Four modules: 2 × 2 (fewest modules; 3 × 2 would need six).
    expect(n.series).toBe(2)
    expect(n.strings).toBe(2)
    expect(n.arrayW).toBe(1600)
    expect(n.vocColdString).toBeCloseTo(2 * 37.1 * (1 + 0.0027 * 13), 6)
    expect(n.stringFuse).toBe(0) // (2 − 1) × 1.25 × 13.8 = 17.3 A ≤ 25 A maximum series fuse
    expect(n.controllerA).toBe(70) // 1600 × 0.97 / 24 = 64.7 A
    expect(n.batteryFuse).toBe(100) // 1.25 × 1500 / (0.9 × 21) = 99.2 A
  })
  it('every item is explained and every preset sizes without danger issues', () => {
    for (const p of SOLAR_PRESETS) {
      const x = sizeSystem(p.spec)
      for (const it of x.items) {
        expect(Number.isFinite(it.value), `${p.id} ${it.id}`).toBe(true)
        expect(it.formula && it.working && it.why, `${p.id} ${it.id}`).toBeTruthy()
      }
      expect(x.issues.filter((i) => i.severity === 'danger'), p.id).toEqual([])
      expect(x.numbers.vocColdString, p.id).toBeLessThanOrEqual(Math.min(p.spec.controllerMaxV, p.spec.module.maxSystemV))
      if (p.spec.type !== 'grid-tied') expect(x.numbers.bankKWh * 1000 * p.spec.battery.dod, p.id).toBeGreaterThanOrEqual(x.numbers.eDaily * p.spec.autonomy * 0.95)
    }
  })
  it('flags dangerous designs', () => {
    const s = SOLAR_PRESET_BY_ID['offgrid-home'].spec
    const tooCold = sizeSystem({ ...s, controllerMaxV: 60 })
    expect(tooCold.issues.some((i) => i.code === 'string-window')).toBe(true)
    const gen = sizeSystem({ ...SOLAR_PRESET_BY_ID['clinic-hybrid'].spec, genStart: 0.2 })
    expect(gen.issues.some((i) => i.code === 'gen-threshold')).toBe(true)
    const pwm = sizeSystem({ ...SOLAR_PRESET_BY_ID['cabin-pwm'].spec, module: MODULE_BY_ID['poly-330'] })
    expect(pwm.issues.some((i) => i.code === 'pwm-mismatch' || i.code === 'pwm-module')).toBe(true)
    const wrongBat = sizeSystem({ ...s, vsys: 48, battery: { ...s.battery, unitV: 12.8 * 1.5 } })
    expect(wrongBat.issues.some((i) => i.code === 'bat-voltage')).toBe(true)
  })
})

describe('energy management simulation', () => {
  it('irradiance integrates to the peak sun hours and ambient spans the site range', () => {
    let e = 0
    for (let k = 0; k < 24 * 60; k++) e += irradiance(k / 60, 5) / 60
    expect(e / 1000).toBeCloseTo(5, 2)
    expect(ambient(5, 10, 30)).toBeCloseTo(10, 6)
    expect(ambient(14, 10, 30)).toBeCloseTo(30, 6)
  })
  it('a sized off-grid system serves its load on design days and conserves energy', () => {
    const d = sizeSystem(SOLAR_PRESET_BY_ID['offgrid-home'].spec)
    const r = simulateDispatch(d, { days: 3, weather: [1, 1, 1], soc0: 0.9 })
    expect(r.totals.unmet).toBeLessThan(1)
    expect(r.totals.load).toBeCloseTo(3 * d.numbers.eAc, -1)
    expect(r.totals.socMin).toBeGreaterThanOrEqual(1 - d.spec.battery.dod - 1e-9)
    for (const s of r.steps) expect(s.soc).toBeLessThanOrEqual(1 + 1e-9)
  })
  it('autonomy: the battery alone carries the load for about the design days, then loads are shed', () => {
    const d = sizeSystem(SOLAR_PRESET_BY_ID['offgrid-home'].spec)
    const r = simulateDispatch(d, { days: 4, weather: [0, 0, 0, 0], soc0: 1 })
    expect(r.totals.unmet).toBeGreaterThan(0)
    const firstUnmet = r.steps.find((s) => s.unmet > 0)!.t
    expect(firstUnmet / 24).toBeGreaterThan(d.spec.autonomy * 0.8)
  })
  it('the generator starts below its threshold and stops above the stop threshold', () => {
    const d = sizeSystem(SOLAR_PRESET_BY_ID['clinic-hybrid'].spec)
    const r = simulateDispatch(d, { days: 3, weather: [0.3, 0.3, 0.3], soc0: 0.6 })
    expect(r.totals.genStarts).toBeGreaterThanOrEqual(1)
    expect(r.totals.unmet).toBeLessThan(1)
    const on = r.steps.findIndex((s) => s.genOn)
    expect(r.steps[on - 1].soc).toBeLessThan(d.spec.genStart + 0.01)
  })
  it('hybrid: imports when short, exports surplus, and rides through an outage on the battery', () => {
    const d = sizeSystem(SOLAR_PRESET_BY_ID['hybrid-home'].spec)
    const r = simulateDispatch(d, { days: 2, weather: [1, 1], soc0: 0.95, outage: [30, 36] })
    expect(r.totals.gridOut).toBeGreaterThan(0)
    expect(r.totals.unmet).toBeLessThan(1)
    expect(r.steps.filter((s) => !s.gridUp).every((s) => s.gridIn === 0)).toBe(true)
  })
  it('grid-tied: anti-islanding stops PV during an outage', () => {
    const d = sizeSystem(SOLAR_PRESET_BY_ID['grid-home'].spec)
    const r = simulateDispatch(d, { days: 1, weather: [1], soc0: 0, outage: [11, 14] })
    expect(r.steps.filter((s) => s.t >= 11 && s.t < 14).every((s) => s.pv === 0)).toBe(true)
    expect(r.totals.unmet).toBeGreaterThan(0)
    // Annual yield roughly offsets the annual load.
    expect(d.numbers.annualKWh).toBeGreaterThan(0.9 * ((d.numbers.eAc * 365) / 1000))
  })
})

describe('troubleshooting scenarios and commissioning', () => {
  it('every scenario produces finite readings from its reference system with a valid answer', () => {
    expect(SOLAR_FAULTS.length).toBeGreaterThanOrEqual(10)
    for (const f of SOLAR_FAULTS) {
      const d = faultDesign(f)
      const rs = f.readings(d)
      expect(rs.length, f.id).toBeGreaterThanOrEqual(2)
      for (const r of rs) expect(Number.isFinite(r.value), `${f.id} ${r.label}`).toBe(true)
      expect(f.answer).toBeLessThan(f.options.length)
      expect(f.explain.length + f.fix.length).toBeGreaterThan(150)
    }
  })
  it('scenario readings show the fault they describe', () => {
    const get = (id: string) => {
      const f = SOLAR_FAULTS.find((x) => x.id === id)!
      return f.readings(faultDesign(f))
    }
    const open = get('string-open')
    expect(open.filter((r) => r.label.includes('current') && r.value === 0).length).toBe(1)
    expect(faultDesign(SOLAR_FAULTS.find((x) => x.id === 'string-open')!).numbers.strings).toBeGreaterThanOrEqual(2)
    const cold = get('voc-cold')
    expect(cold[1].value).toBeGreaterThan(cold[2].value)
    const gen = get('gen-threshold')
    expect(gen[2].value).toBe(0)
    expect(gen[3].value).toBeGreaterThan(0)
    const isl = get('anti-island')
    expect(isl[0].value).toBeGreaterThan(0)
    expect(isl[1].value).toBe(0)
    const drop = get('cable-drop')
    expect(drop[1].value - drop[2].value).toBeGreaterThan(1)
    const shade = get('shading')
    expect(shade[0].value).toBeLessThan(shade[0].healthy!)
  })
  it('commissioning: correct predictions and a healthy system pass; injected faults fail the right check', () => {
    const d = sizeSystem(SOLAR_PRESET_BY_ID['clinic-hybrid'].spec)
    const c = { g: 850, tCell: 41 }
    const e = expectedString(d, c)
    const l = { vocExpected: e.voc, iscExpected: e.isc, irLimit: 1, acNominal: 230, acTol: 0.05 }
    expect(evaluateCommissioning(d, c, asBuilt(d, c), l).passed).toBe(true)
    const wrong = evaluateCommissioning(d, c, asBuilt(d, c), { ...l, vocExpected: e.voc * 1.1 })
    expect(wrong.predictionsCorrect).toBe(false)
    const rev = evaluateCommissioning(d, c, asBuilt(d, c, 'reversed-string'), l)
    expect(rev.checks.filter((x) => !x.pass).map((x) => x.id)).toContain(`pol-${d.numbers.strings - 1}`)
    const low = evaluateCommissioning(d, c, asBuilt(d, c, 'low-string'), l)
    expect(low.checks.find((x) => x.id === `voc-${d.numbers.strings - 1}`)!.pass).toBe(false)
    const ir = evaluateCommissioning(d, c, asBuilt(d, c, 'low-insulation'), l)
    expect(ir.checks.find((x) => x.id === 'ir')!.pass).toBe(false)
    expect(evaluateCommissioning(d, c, asBuilt(d, c), { ...l, irLimit: 0 }).passed).toBe(false)
  })
})
