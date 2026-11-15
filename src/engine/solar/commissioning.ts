import { operating } from './pv'
import type { SolarDesign } from './types'

/**
 * Commissioning tests for a designed system (S2.M5). The learner predicts the expected values for
 * the measurement conditions, the laboratory supplies "as-built" measurements from the engine, and
 * each test passes when the measurement agrees with the correct expectation within its tolerance.
 * Pass limits that come from standards (insulation resistance) are entered by the learner from
 * the applicable standard; this tool does not invent them.
 */
export interface CommissionConditions {
  /** Plane-of-array irradiance from a reference cell, W/m². */
  g: number
  /** Module back-sheet temperature, °C. */
  tCell: number
}

export interface Measurements {
  polarity: (1 | -1)[]
  stringVoc: number[]
  stringIsc: number[]
  batteryV: number
  inverterV: number
  insulationMOhm: number
}

/** Expected string values at the conditions (single-diode model with the datasheet coefficients). */
export function expectedString(d: SolarDesign, c: CommissionConditions): { voc: number; isc: number } {
  const op = operating(d.spec.module, c.g, c.tCell)
  return { voc: d.numbers.series * op.voc, isc: op.isc }
}

/** Deterministic small instrument and module spread (±1.5 %) so each string reads slightly differently. */
const spread = (k: number, seed: number) => 1 + 0.015 * Math.sin(1.7 * k + seed)

export type AsBuiltFault = 'none' | 'reversed-string' | 'low-string' | 'low-insulation'

export function asBuilt(d: SolarDesign, c: CommissionConditions, fault: AsBuiltFault = 'none', seed = 1): Measurements {
  const e = expectedString(d, c)
  const n = d.numbers.strings
  const last = n - 1
  return {
    polarity: Array.from({ length: n }, (_, k) => (fault === 'reversed-string' && k === last ? -1 : 1)),
    stringVoc: Array.from({ length: n }, (_, k) => e.voc * spread(k, seed) * (fault === 'low-string' && k === last ? (d.numbers.series - 1) / d.numbers.series : 1)),
    stringIsc: Array.from({ length: n }, (_, k) => e.isc * spread(k + 3, seed)),
    batteryV: d.spec.type === 'grid-tied' ? 0 : d.numbers.batSeries * d.spec.battery.unitV * 1.03,
    inverterV: 230 * spread(9, seed),
    insulationMOhm: fault === 'low-insulation' ? 0.15 : 40,
  }
}

export interface LearnerEntries {
  vocExpected: number
  iscExpected: number
  /** Minimum insulation resistance from the applicable standard, MΩ (entered by the learner). */
  irLimit: number
  /** Nominal AC output voltage of the inverter and its tolerance (datasheet), V and fraction. */
  acNominal: number
  acTol: number
}

export interface CommissionCheck {
  id: string
  label: string
  expected: string
  measured: string
  pass: boolean
  note: string
}

export interface CommissionReport {
  checks: CommissionCheck[]
  predictionsCorrect: boolean
  passed: boolean
}

export const VOC_TOL = 0.05
export const ISC_TOL = 0.1

export function evaluateCommissioning(d: SolarDesign, c: CommissionConditions, m: Measurements, l: LearnerEntries): CommissionReport {
  const e = expectedString(d, c)
  const checks: CommissionCheck[] = []
  const vocOk = Math.abs(l.vocExpected - e.voc) <= 0.02 * e.voc
  const iscOk = Math.abs(l.iscExpected - e.isc) <= 0.02 * e.isc
  checks.push({ id: 'pred-voc', label: 'Your expected string V_oc for these conditions', expected: `${e.voc.toFixed(1)} V`, measured: `${l.vocExpected.toFixed(1)} V`, pass: vocOk, note: vocOk ? 'Prediction correct (±2 %).' : `V_oc = n × [V_oc,STC(1 + β(T − 25)) + a·ln(G/1000)] = ${e.voc.toFixed(1)} V.` })
  checks.push({ id: 'pred-isc', label: 'Your expected string I_sc for these conditions', expected: `${e.isc.toFixed(2)} A`, measured: `${l.iscExpected.toFixed(2)} A`, pass: iscOk, note: iscOk ? 'Prediction correct (±2 %).' : `I_sc = I_sc,STC × G/1000 × (1 + α(T − 25)) = ${e.isc.toFixed(2)} A.` })
  m.polarity.forEach((p, k) => checks.push({ id: `pol-${k}`, label: `String ${k + 1} polarity`, expected: '+', measured: p > 0 ? '+' : '−', pass: p > 0, note: p > 0 ? 'Correct.' : 'Reversed: do not connect; correct the wiring first.' }))
  m.stringVoc.forEach((v, k) => {
    const ok = Math.abs(v * m.polarity[k] - e.voc) <= VOC_TOL * e.voc
    checks.push({ id: `voc-${k}`, label: `String ${k + 1} V_oc`, expected: `${e.voc.toFixed(1)} V ± 5 %`, measured: `${(v * m.polarity[k]).toFixed(1)} V`, pass: ok, note: ok ? 'Within tolerance.' : Math.abs(v - (e.voc * (d.numbers.series - 1)) / d.numbers.series) < 0.03 * e.voc ? 'About one module’s voltage missing: a module is short-circuited, bypassed or mis-wired.' : 'Outside tolerance: investigate.' })
  })
  m.stringIsc.forEach((i, k) => {
    const ok = Math.abs(i - e.isc) <= ISC_TOL * e.isc
    checks.push({ id: `isc-${k}`, label: `String ${k + 1} I_sc`, expected: `${e.isc.toFixed(2)} A ± 10 %`, measured: `${i.toFixed(2)} A`, pass: ok, note: ok ? 'Within tolerance (irradiance measurement uncertainty is the main reason for the wider band).' : 'Outside tolerance: check irradiance, shading, soiling and connections.' })
  })
  const irOk = l.irLimit > 0 && m.insulationMOhm >= l.irLimit
  checks.push({ id: 'ir', label: 'PV array insulation resistance', expected: l.irLimit > 0 ? `≥ ${l.irLimit} MΩ (your entry from the standard)` : 'enter the limit from the applicable standard', measured: `${m.insulationMOhm} MΩ`, pass: irOk, note: irOk ? 'Pass.' : l.irLimit > 0 ? 'Below the limit: an insulation fault (damaged cable, wet connector) must be found before energising.' : 'No limit entered.' })
  if (d.spec.type !== 'grid-tied') {
    const vb = d.numbers.batSeries * d.spec.battery.unitV
    const ok = m.batteryV > vb * 0.9 && m.batteryV < vb * 1.15
    checks.push({ id: 'bat', label: 'Battery bank voltage and polarity before connection', expected: `${vb.toFixed(1)} V nominal (−10 %/+15 %)`, measured: `${m.batteryV.toFixed(2)} V`, pass: ok, note: ok ? 'Consistent with the bank configuration.' : 'Wrong number of batteries in series or a reversed block.' })
  }
  const acOk = Math.abs(m.inverterV - l.acNominal) <= l.acTol * l.acNominal
  checks.push({ id: 'ac', label: 'Inverter AC output, no load', expected: `${l.acNominal} V ± ${(l.acTol * 100).toFixed(0)} % (datasheet)`, measured: `${m.inverterV.toFixed(1)} V`, pass: acOk, note: acOk ? 'Within the datasheet tolerance.' : 'Outside tolerance: check settings and the inverter.' })
  const predictionsCorrect = vocOk && iscOk
  return { checks, predictionsCorrect, passed: checks.every((x) => x.pass) }
}
