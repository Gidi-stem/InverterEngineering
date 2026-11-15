import { cloneDoc } from '../circuit/build'
import { param } from '../circuit/parts'
import type { CircuitDoc } from '../circuit/types'
import { measure, spectrum } from '../sim/analysis'
import { TransientSim } from '../sim/transient'
import type { ProjectBuild, Probes } from './generate'
import type { DesignNumbers, DesignSpec } from './types'

/**
 * Engineering test suite. Every test runs the student's OWN assembled circuit (or a variant of
 * it: load, supply, fault) in the transient engine and measures the result over a settled
 * window. Nothing is taken from the design calculations except the pass criteria.
 */
export type TestKind = 'no-load' | 'resistive' | 'inductive' | 'overload' | 'protection' | 'vin-low' | 'vin-high' | 'regulation' | 'efficiency' | 'thermal' | 'waveform' | 'mppt' | 'grid' | 'generator'
export interface Reading {
  label: string
  value: number | null
  unit: string
  /** A non-numeric reading (e.g. the name of the device that operated). */
  text?: string
}
export interface TestResult {
  kind: TestKind
  title: string
  status: 'pass' | 'fail' | 'info'
  criterion: string
  readings: Reading[]
  explanation: string
}
export interface RunMeasure {
  ok: boolean
  error?: string
  vrms: number
  vmean: number
  vpk: number
  freq: number | null
  thd: number | null
  crest: number
  irms: number
  pout: number
  pin: number
  iinMean: number
  iinMin: number
  tj: { part: string; tj: number }[]
  trips: Record<string, number>
  pv?: { v: number; i: number; p: number }
  charge?: number
}

export const TEST_TITLE: Record<TestKind, string> = {
  'no-load': 'No-load operation',
  resistive: 'Rated resistive load',
  inductive: 'Inductive load',
  overload: 'Overload (150 %)',
  protection: 'Protection response (output short circuit)',
  'vin-low': 'Input voltage variation: low battery',
  'vin-high': 'Input voltage variation: high battery',
  regulation: 'Output voltage regulation',
  efficiency: 'Efficiency evaluation',
  thermal: 'Thermal assessment',
  waveform: 'Waveform quality',
  mppt: 'MPPT stage (PV to battery)',
  grid: 'Grid mode (bypass and charging)',
  generator: 'Generator mode',
}

const AMBIENT = 40

/** Simulate a circuit for `cycles` output cycles and measure the last `keep` cycles. */
export function runVariant(doc: CircuitDoc, pr: { out: string; iout: string; vin: string; iin: string; pv?: { v: string; i: string }; charge?: string }, f: number, cycles: number, keep: number, h?: number): RunMeasure {
  const made = TransientSim.fromDoc(doc, { h, ambient: AMBIENT })
  const fail = (error: string): RunMeasure => ({ ok: false, error, vrms: 0, vmean: 0, vpk: 0, freq: null, thd: null, crest: 0, irms: 0, pout: 0, pin: 0, iinMean: 0, iinMin: 0, tj: [], trips: {} })
  if ('error' in made) return fail(made.error)
  const s = made
  const total = Math.round(cycles / f / s.h)
  const nKeep = Math.round(keep / f / s.h)
  const g = (k: string) => s.probe(k)
  const keys = [pr.out, pr.iout, pr.vin, pr.iin, ...(pr.pv ? [pr.pv.v, pr.pv.i] : []), ...(pr.charge ? [pr.charge] : [])]
  const getters = keys.map(g)
  const missing = keys.filter((_, i) => !getters[i])
  if (missing.length) return fail(`The circuit no longer has: ${missing.join(', ')} (check the parts kit names).`)
  const tr = keys.map(() => new Float64Array(nKeep))
  let startLoss: Map<string, number> | null = null
  for (let k = 0; k < total; k++) {
    if (k === total - nKeep) startLoss = new Map(s.switchLosses().map((l) => [l.part, l.cond + l.sw]))
    if (!s.step()) return fail(s.status.error ?? 'The simulation stopped.')
    const j = k - (total - nKeep)
    if (j >= 0) getters.forEach((gt, c) => (tr[c][j] = gt!()))
  }
  const [vo, io, vi, ii] = tr
  const mv = measure(vo, s.h)
  const mi = measure(io, s.h)
  const sp = mv.freq ? spectrum(vo, s.h, f, 49) : null
  const mean = (x: Float64Array) => x.reduce((a, v) => a + v, 0) / x.length
  const prod = (a: Float64Array, b: Float64Array) => a.reduce((acc, v, i) => acc + v * b[i], 0) / a.length
  const T = nKeep * s.h
  const tj = s.switchLosses().map((l) => {
    const p = s.net.doc.parts.find((x) => x.id === l.part)!
    const P = (l.cond + l.sw - (startLoss?.get(l.part) ?? 0)) / T
    return { part: l.part, tj: AMBIENT + P * param(p, 'Rth') }
  })
  const out: RunMeasure = {
    ok: true,
    vrms: mv.rms,
    vmean: mv.mean,
    vpk: Math.max(mv.max, -mv.min),
    freq: mv.freq,
    thd: sp?.thd ?? null,
    crest: mv.rms > 0 ? Math.max(mv.max, -mv.min) / mv.rms : 0,
    irms: mi.rms,
    pout: prod(vo, io),
    pin: prod(vi, ii),
    iinMean: mean(ii),
    iinMin: measure(ii, s.h).min,
    tj,
    trips: { ...s.tripAt },
  }
  if (pr.pv) {
    const pv = tr[4]
    const ipv = tr[5]
    out.pv = { v: mean(pv), i: mean(ipv), p: prod(pv, ipv) }
  }
  if (pr.charge) out.charge = mean(tr[tr.length - 1])
  return out
}

// ── variants ────────────────────────────────────────────────────────────────
const setP = (d: CircuitDoc, id: string, key: string, v: number) => {
  const p = d.parts.find((x) => x.id === id)
  if (p) p.params[key] = v
}
const setS = (d: CircuitDoc, id: string, key: string, v: number) => {
  const p = d.parts.find((x) => x.id === id)
  if (p) p.states[key] = v
}
/** Insert a series inductor LT between the load's terminal 1 and whatever fed it. */
export function withSeriesInductor(d0: CircuitDoc, loadId: string, lMilli: number): CircuitDoc {
  const d = cloneDoc(d0)
  for (const w of d.wires) for (const e of [w.a, w.b]) if (e.partId === loadId && e.terminalId === '1') e.partId = 'LT'
  d.parts.push({ id: 'LT', type: 'inductor', label: 'LT', x: 0, y: 0, rotation: 0, params: { L: Math.min(1000, Math.max(0.001, lMilli)), Rdc: 0.01 }, states: {} })
  d.wires.push({ id: 'wlt', a: { partId: 'LT', terminalId: '2' }, b: { partId: loadId, terminalId: '1' } })
  return d
}

export interface SuiteContext {
  projectId: string
  design: DesignSpec
  numbers: DesignNumbers
  build: Pick<ProjectBuild, 'probes' | 'simStep'>
  regulated: boolean
  waveform: DesignSpec['waveform']
}

export function testsFor(projectId: string): TestKind[] {
  const base: TestKind[] = ['no-load', 'resistive', 'inductive', 'overload', 'protection', 'vin-low', 'vin-high', 'regulation', 'efficiency', 'thermal', 'waveform']
  if (projectId === 'bld-g') return [...base, 'mppt']
  if (projectId === 'bld-h') return ['grid', 'generator', ...base]
  return base
}

/**
 * Run the suite on the student's circuit. `onProgress` reports each finished test; the worker
 * streams these to the UI. Shared runs (rated load, no load, …) are simulated once.
 */
export function runSuite(doc: CircuitDoc, ctx: SuiteContext, kinds: TestKind[] = testsFor(ctx.projectId), onProgress?: (r: TestResult, done: number, total: number) => void): TestResult[] {
  const { design: d, numbers: nb, build } = ctx
  const pr = build.probes
  const isH = ctx.projectId === 'bld-h'
  // Six output cycles: three to settle (filter, regulator, magnetising current) and three measured.
  const cycles = 6
  const keep = 3
  const nominal = ctx.projectId === 'bld-a' ? d.vdc : d.vac
  const tolRun = ctx.regulated ? 0.03 : ctx.projectId === 'bld-a' ? 0.12 : 0.1
  const tolLine = ctx.regulated ? 0.05 : 0.25
  // Base document for inverter tests: the hybrid runs them in backup (inverter) mode.
  const baseDoc = cloneDoc(doc)
  if (isH) {
    setS(baseDoc, 'CBG', 'on', 0)
    setS(baseDoc, 'CBN', 'on', 0)
    setS(baseDoc, 'GK1', 'level', 1)
  }
  const cache = new Map<string, RunMeasure>()
  const run = (key: string, make: () => CircuitDoc, probes: Partial<Probes> = {}): RunMeasure => {
    if (!cache.has(key)) cache.set(key, runVariant(make(), { out: probes.out ?? pr.out, iout: probes.iout ?? pr.iout, vin: pr.vin, iin: pr.iin, pv: pr.pv, charge: pr.charge }, d.f, cycles, keep, build.simStep))
    return cache.get(key)!
  }
  const rated = () => run('rated', () => baseDoc)
  const R = (label: string, value: number | null, unit: string): Reading => ({ label, value: value === null || !Number.isFinite(value) ? null : value, unit })
  const fail = (kind: TestKind, m: RunMeasure): TestResult => ({ kind, title: TEST_TITLE[kind], status: 'fail', criterion: 'The simulation must run', readings: [], explanation: m.error ?? 'The simulation did not run.' })
  const within = (v: number, target: number, tol: number) => Math.abs(v - target) <= tol * target
  const results: TestResult[] = []
  const push = (r: TestResult) => {
    results.push(r)
    onProgress?.(r, results.length, kinds.length)
  }
  for (const kind of kinds) {
    const t = TEST_TITLE[kind]
    if (kind === 'no-load') {
      const m = run('noload', () => {
        const x = cloneDoc(baseDoc)
        setP(x, pr.load, 'R', 100000)
        return x
      })
      if (!m.ok) push(fail(kind, m))
      else
        push({ kind, title: t, status: within(m.vrms, nominal, tolRun * 1.5) ? 'pass' : 'fail', criterion: `Output within ±${(tolRun * 150).toFixed(0)} % of ${nominal} V with no load`, readings: [R('Output voltage', m.vrms, 'V rms'), R('No-load input current', Math.abs(m.iinMean), 'A'), R('No-load input power', m.pin, 'W')], explanation: 'With no load the switch and winding drops vanish, so an unregulated output rises; the input power that remains is the no-load (standby) loss: magnetising current, switching and control.' })
    } else if (kind === 'resistive') {
      const m = rated()
      if (!m.ok) push(fail(kind, m))
      else
        push({ kind, title: t, status: within(m.vrms, nominal, tolRun) && m.freq !== null && within(m.freq, d.f, 0.01) && m.pout >= 0.8 * d.power ? 'pass' : 'fail', criterion: `V_out within ±${(tolRun * 100).toFixed(0)} % of ${nominal} V, f within ±1 %, P_out ≥ 80 % of ${d.power} W`, readings: [R('Output voltage', m.vrms, 'V rms'), R('Frequency', m.freq, 'Hz'), R('Output power', m.pout, 'W'), R('Output current', m.irms, 'A rms'), R('Input current (mean)', m.iinMean, 'A')], explanation: 'The design point: the rated resistive load drawn at nominal battery voltage.' })
    } else if (kind === 'inductive') {
      const m = run('ind', () => {
        const x = withSeriesInductor(baseDoc, pr.load, (nb.loadL || ((nb.rload * 0.75) / (2 * Math.PI * d.f)) * 0.8) * 1000)
        setP(x, pr.load, 'R', nb.loadL ? nb.loadR : nb.rload * 0.8)
        return x
      }, { out: `T:LT.1|T:${pr.load}.2` })
      if (!m.ok) push(fail(kind, m))
      else {
        const pf = m.vrms * m.irms > 0 ? m.pout / (m.vrms * m.irms) : 0
        push({ kind, title: t, status: m.vrms >= 0.8 * nominal && m.vrms <= 1.25 * nominal ? 'pass' : 'fail', criterion: 'The inverter keeps supplying an inductive (PF ≈ 0.8) load: output within −20 % / +25 %', readings: [R('Output voltage', m.vrms, 'V rms'), R('Output current', m.irms, 'A rms'), R('Measured power factor', pf, ''), R('Lowest input current', m.iinMin, 'A')], explanation: `The current lags the voltage, so for part of every half-cycle energy flows back to the DC side through the body diodes${m.iinMin < 0 ? ' (the input current goes negative)' : ''}. The bridge must carry the full apparent current although less real power is delivered.` })
      }
    } else if (kind === 'overload') {
      const m = run('over', () => {
        const x = cloneDoc(baseDoc)
        setP(x, pr.load, 'R', Math.max(1, nb.rload / 1.5))
        return x
      })
      if (!m.ok) push(fail(kind, m))
      else {
        const hot = Math.max(...m.tj.map((x) => x.tj), 0)
        const tripped = Object.keys(m.trips)
        push({ kind, title: t, status: tripped.length || (m.vrms >= 0.75 * nominal && hot <= 150) ? 'pass' : 'fail', criterion: 'At 150 % load the output is held (≥ 75 % of nominal) with T_j ≤ 150 °C, or a protection device operates', readings: [R('Output voltage', m.vrms, 'V rms'), R('Output power', m.pout, 'W'), R('Hottest switch T_j', hot, '°C'), R('Input current (mean)', m.iinMean, 'A')], explanation: tripped.length ? `${tripped.join(', ')} operated.` : `Over this short window the fuse is still heating (simplified I²t: it would melt only if the overload lasts). The real limit is thermal: T_j rises to about ${hot.toFixed(0)} °C. Real inverters limit overload time electronically.` })
      }
    } else if (kind === 'protection') {
      const m = run('short', () => {
        const x = cloneDoc(baseDoc)
        x.wires.push({ id: 'wshort', a: { partId: pr.load, terminalId: '1' }, b: { partId: pr.load, terminalId: '2' } })
        return x
      })
      if (!m.ok) push(fail(kind, m))
      else {
        const trips = Object.entries(m.trips).sort((a, b) => a[1] - b[1])
        push({ kind, title: t, status: trips.length > 0 ? 'pass' : 'fail', criterion: 'A short circuit across the output makes a protective device operate within the test window', readings: [{ label: 'First device to operate', value: null, unit: '', text: trips.length ? trips[0][0] : 'none' }, R('Operating time', trips.length ? trips[0][1] * 1000 : null, 'ms'), R('Output current after the event', m.irms, 'A rms')], explanation: trips.length ? `${trips.map(([id, at]) => `${id} at ${(at * 1000).toFixed(2)} ms`).join(', ')}. Breakers trip magnetically above 5× rating; fuses melt by I²t (simplified models). Real inverters add fast electronic current limiting to protect the switches.` : 'Nothing interrupted the fault current: check that the fuse and breaker ratings and connections actually protect the output.' })
      }
    } else if (kind === 'vin-low' || kind === 'vin-high') {
      const v = kind === 'vin-low' ? nb.vmin : nb.vmax
      const m = run(kind, () => {
        const x = cloneDoc(baseDoc)
        setP(x, pr.source, 'V', v)
        return x
      })
      if (!m.ok) push(fail(kind, m))
      else
        push({ kind, title: t, status: within(m.vrms, nominal, tolLine) ? 'pass' : 'fail', criterion: `At ${v.toFixed(1)} V input the output stays within ±${(tolLine * 100).toFixed(0)} % of ${nominal} V${ctx.regulated ? ' (regulated design)' : ' (unregulated design)'}`, readings: [R('Battery voltage', v, 'V'), R('Output voltage', m.vrms, 'V rms'), R('Deviation from nominal', ((m.vrms - nominal) / nominal) * 100, '%')], explanation: ctx.regulated ? 'The voltage feedback changes the modulation index to compensate the battery voltage.' : 'Without feedback the output follows the battery voltage (and the transformer ratio).' })
    } else if (kind === 'regulation') {
      const nl = cache.get('noload') ?? run('noload', () => {
        const x = cloneDoc(baseDoc)
        setP(x, pr.load, 'R', 100000)
        return x
      })
      const fl = rated()
      const lo = cache.get('vin-low')
      const hi = cache.get('vin-high')
      if (!nl.ok || !fl.ok) push(fail(kind, nl.ok ? fl : nl))
      else {
        const load = ((nl.vrms - fl.vrms) / fl.vrms) * 100
        const line = lo?.ok && hi?.ok ? ((hi.vrms - lo.vrms) / fl.vrms) * 100 : null
        const lim = ctx.regulated ? 5 : 25
        push({ kind, title: t, status: Math.abs(load) <= lim && (line === null || Math.abs(line) <= lim * 2) ? 'pass' : 'fail', criterion: `Load regulation ≤ ${lim} %${line !== null ? `, line regulation ≤ ${lim * 2} %` : ''}`, readings: [R('Load regulation (no load → full load)', load, '%'), R('Line regulation (low → high battery)', line, '%')], explanation: 'Load regulation = (V_no-load − V_full-load) / V_full-load. Line regulation compares the output at the lowest and highest battery voltage.' })
      }
    } else if (kind === 'efficiency') {
      const m = rated()
      if (!m.ok) push(fail(kind, m))
      else {
        const eta = m.pin > 0 ? m.pout / m.pin : 0
        push({ kind, title: t, status: eta >= 0.8 ? 'pass' : 'fail', criterion: 'η ≥ 80 % at rated load (simulated)', readings: [R('Input power', m.pin, 'W'), R('Output power', m.pout, 'W'), R('Efficiency (simulated)', eta * 100, '%'), R('Efficiency (calculated estimate)', nb.efficiency * 100, '%')], explanation: 'Simulated from the input and output power over whole cycles. The calculated estimate also includes control power and core losses the simulation does not model, so it is usually a little lower.' })
      }
    } else if (kind === 'thermal') {
      const m = rated()
      if (!m.ok) push(fail(kind, m))
      else {
        const hot = m.tj.reduce((a, x) => (x.tj > a.tj ? x : a), { part: '—', tj: AMBIENT })
        push({ kind, title: t, status: hot.tj <= 125 ? 'pass' : 'fail', criterion: 'Hottest junction ≤ 125 °C (design limit) at rated load, 40 °C ambient', readings: [R(`Hottest switch (${hot.part})`, hot.tj, '°C'), R('Calculated estimate', nb.tj, '°C')], explanation: 'T_j = T_a + P·R_θ from the simulated conduction and switching losses of each switch and your heat-sink choice (steady state; thermal capacitance not modelled).' })
      }
    } else if (kind === 'waveform') {
      const m = rated()
      if (!m.ok) push(fail(kind, m))
      else {
        const thd = m.thd ?? NaN
        if (ctx.waveform === 'sine') {
          push({ kind, title: t, status: thd <= 0.05 && m.freq !== null && within(m.freq, d.f, 0.01) ? 'pass' : 'fail', criterion: 'THD < 5 % (pure sine), frequency within ±1 %', readings: [R('THD', thd * 100, '%'), R('Frequency', m.freq, 'Hz'), R('Crest factor V_pk / V_rms', m.crest, ''), R('DC offset', m.vmean, 'V')], explanation: 'The LC filter removes the carrier harmonics, leaving a sine (crest factor √2 ≈ 1.41).' })
        } else {
          const delta = ctx.waveform === 'square' ? 180 : nb.alpha || 90
          const thdT = quasiSquareTHD(delta)
          const crestT = quasiSquareCrest(delta)
          const ok = Math.abs(thd - thdT) <= 0.05 && Math.abs(m.crest - crestT) <= 0.15 * crestT && m.freq !== null && within(m.freq, d.f, 0.01)
          push({ kind, title: t, status: ok ? 'pass' : 'fail', criterion: `THD within ±5 points of ${(thdT * 100).toFixed(1)} % and crest factor within ±15 % of ${crestT.toFixed(2)} (theory for ${delta}° conduction), frequency within ±1 %`, readings: [R('THD', thd * 100, '%'), R('Theoretical THD', thdT * 100, '%'), R('Frequency', m.freq, 'Hz'), R('Crest factor V_pk / V_rms', m.crest, ''), R('DC offset', m.vmean, 'V')], explanation: `A stepped wave with ${delta}° conduction per half-cycle has V_rms = V_pk·√(${delta}/180) and harmonics of order 3, 5, 7… in proportion sin(nδ/2)/n. ${delta === 180 ? 'For a square wave the THD is 48.3 %.' : 'At 90° the RMS matches a sine of the same peak but the THD is still 48.3 %; the THD is lowest (31 %) at 120°.'} The crest factor is a little higher in practice because the DC bus sags during each pulse and recovers during the zero interval. Motors and transformers run hotter on these harmonics and some electronics misbehave.` })
        }
      }
    } else if (kind === 'mppt') {
      const m = rated()
      if (!m.ok || !m.pv) push(fail(kind, m))
      else
        push({ kind, title: t, status: m.pv.p >= 0.9 * nb.pvPmp ? 'pass' : 'fail', criterion: `PV power ≥ 90 % of the array's maximum (${nb.pvPmp.toFixed(0)} W)`, readings: [R('PV voltage', m.pv.v, 'V'), R('PV current', m.pv.i, 'A'), R('PV power', m.pv.p, 'W'), R('Battery charge current (MPPT stage)', m.charge ?? null, 'A'), R('Duty for maximum power (calculated)', nb.mpptDutyIdeal * 100, '%')], explanation: 'The buck duty sets the PV operating voltage (V_pv = V_bat / D). Too high a duty drags the array towards the battery voltage; too low pushes it past the knee where the current collapses. Phase 7 adds an automatic perturb-and-observe tracker.' })
    } else if (kind === 'grid' || kind === 'generator') {
      const m = run(kind, () => {
        const x = cloneDoc(doc)
        setS(x, 'CBG', 'on', kind === 'grid' ? 1 : 0)
        setS(x, 'CBN', 'on', kind === 'generator' ? 1 : 0)
        setS(x, 'GK2', 'level', kind === 'generator' ? 1 : 0)
        setS(x, 'GK1', 'level', 0)
        return x
      })
      if (!m.ok) push(fail(kind, m))
      else
        push({ kind, title: t, status: within(m.vrms, d.vac, 0.06) && (m.charge ?? 0) > 0.5 ? 'pass' : 'fail', criterion: `Load supplied from the ${kind} at ${d.vac} V (±6 %) and the battery charging (> 0.5 A)`, readings: [R('Load voltage', m.vrms, 'V rms'), R('Load power', m.pout, 'W'), R('Battery charge current', m.charge ?? null, 'A')], explanation: `Energy paths: ${kind} → K${kind === 'generator' ? '2 NO' : '2 NC'} → K1 NC (bypass) → load, and ${kind} → charger → battery. The inverter stays ready on K1 NO.` })
    }
  }
  return results
}

/**
 * Quasi-square (stepped) wave with conduction δ per half-cycle: V_rms = V·√(δ/180°), fundamental
 * V₁ = (4V/π)·sin(δ/2)/√2, THD = √(V_rms² − V₁²) / V₁. δ = 180° is a square wave (48.3 %).
 */
export function quasiSquareTHD(deltaDeg: number): number {
  const d = (deltaDeg * Math.PI) / 180
  const vr2 = d / Math.PI
  const v1 = ((4 / Math.PI) * Math.sin(d / 2)) / Math.SQRT2
  return Math.sqrt(Math.max(0, vr2 - v1 * v1)) / v1
}
export const quasiSquareCrest = (deltaDeg: number) => 1 / Math.sqrt(deltaDeg / 180)

export const suitePassed = (r: TestResult[]) => r.length > 0 && r.every((x) => x.status !== 'fail')
