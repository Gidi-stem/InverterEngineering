import { simulateDispatch } from './dispatch'
import { arrayCurve, cellTemp, mpp, operating, perturbObserve, pwmOperating } from './pv'
import { SOLAR_PRESET_BY_ID } from './presets'
import { RHO_CU, sizeSystem } from './sizing'
import type { SolarDesign } from './types'

/**
 * Solar-system troubleshooting scenarios. Every reading is produced by the solar engine from a
 * sized reference system with the fault injected, so the numbers are consistent with what the
 * learner calculates. Each scenario asks for the diagnosis and explains the fix.
 */
export interface FaultReading {
  label: string
  value: number
  unit: string
  /** The value a healthy system would show under the same conditions (if meaningful). */
  healthy?: number
}

export interface SolarFault {
  id: string
  title: string
  preset: string
  symptom: string
  conditions: string
  readings: (d: SolarDesign) => FaultReading[]
  options: string[]
  answer: number
  explain: string
  fix: string
}

const G = 900
const TA = 25

function stringTerms(d: SolarDesign, g: number | number[] = G, tCell?: number) {
  const m = d.spec.module
  const tc = tCell ?? cellTemp(m, TA, Array.isArray(g) ? Math.max(...g) : g)
  return arrayCurve(m, { series: d.numbers.series, strings: 1, g, tCell: tc })
}
const round = (v: number, k = 2) => Math.round(v * 10 ** k) / 10 ** k

export const SOLAR_FAULTS: SolarFault[] = [
  {
    id: 'string-open',
    title: 'One string produces nothing',
    preset: 'clinic-hybrid',
    symptom: 'Charging power at midday is about half of what it was last month. The controller shows no fault.',
    conditions: `Clear sky, about ${G} W/m², ${TA} °C ambient. Currents measured with a DC clamp meter on each string at the combiner.`,
    readings: (d) => {
      const c = stringTerms(d)
      const p = mpp(c)
      const rows: FaultReading[] = [{ label: 'Array voltage at the controller (operating)', value: round(p.v, 1), unit: 'V', healthy: round(p.v, 1) }]
      for (let k = 0; k < d.numbers.strings; k++) rows.push({ label: `String ${k + 1} current`, value: k === d.numbers.strings - 1 ? 0 : round(p.i, 2), unit: 'A', healthy: round(p.i, 2) })
      rows.push({ label: `String ${d.numbers.strings}: voltage across the open point found (connector or fuse holder)`, value: round(p.v, 1), unit: 'V' })
      return rows
    },
    options: ['An open circuit in the last string (blown string fuse or disconnected connector)', 'Soiling of the whole array', 'The battery is full', 'The controller’s voltage limit is exceeded'],
    answer: 0,
    explain: 'One string carries zero current while the others are normal, and the array voltage is normal. Full array voltage across a fuse holder means the fuse is open: no current flows through it. A blown string fuse indicates a past fault (for example a back-fed short) that must also be found.',
    fix: 'Isolate the array (DC isolator, then open the string fuses), prove dead, find why the fuse blew (insulation test of that string, inspect connectors), repair, replace the fuse with the specified rating, re-test V_oc and current.',
  },
  {
    id: 'shading',
    title: 'Low output with a stepped I–V curve',
    preset: 'offgrid-home',
    symptom: 'Output dropped after a water tank was installed near the array. The controller’s I–V scan shows a curve with two humps.',
    conditions: 'One module is shaded (≈ 250 W/m²) while the rest receive about 900 W/m².',
    readings: (d) => {
      const s = d.numbers.series
      const gs = Array.from({ length: s }, (_, k) => (k === 0 ? 250 : G))
      const shaded = stringTerms(d, gs)
      const healthy = stringTerms(d)
      const po = perturbObserve(shaded)
      const glob = mpp(shaded)
      return [
        { label: 'String power at the controller’s operating point (P&O)', value: round(po.final.p, 0), unit: 'W', healthy: round(mpp(healthy).p, 0) },
        { label: 'Operating voltage', value: round(po.final.v, 1), unit: 'V', healthy: round(mpp(healthy).v, 1) },
        { label: 'Global maximum on the scanned curve', value: round(glob.p, 0), unit: 'W' },
        { label: 'Voltage of the global maximum', value: round(glob.v, 1), unit: 'V' },
      ]
    },
    options: ['Partial shading: the shaded module’s bypass diode conducts, creating several power peaks', 'An open string fuse', 'A failed battery', 'Cold-weather overvoltage'],
    answer: 0,
    explain: 'A shaded module cannot carry the string current, so its bypass diode conducts and the I–V curve develops steps with more than one power peak. A simple perturb-and-observe tracker can settle on a local peak.',
    fix: 'Remove or avoid the shading (relocate the tank or the modules); enable the controller’s periodic global scan if it has one; avoid mixing shaded and unshaded modules in one string.',
  },
  {
    id: 'soiling',
    title: 'All currents low, voltages normal',
    preset: 'offgrid-home',
    symptom: 'After the dry season, every string produces less than expected. Nothing is shaded.',
    conditions: `Irradiance meter in the plane of the array: ${G} W/m²; module temperature measured with a thermometer.`,
    readings: (d) => {
      const m = d.spec.module
      const tc = cellTemp(m, TA, G)
      const op = operating(m, G, tc)
      const dirty = operating(m, G * 0.72, tc)
      return [
        { label: 'String V_oc (isolator open)', value: round(d.numbers.series * dirty.voc, 1), unit: 'V', healthy: round(d.numbers.series * op.voc, 1) },
        { label: 'String I_sc (brief short through the test instrument)', value: round(dirty.isc, 2), unit: 'A', healthy: round(op.isc, 2) },
      ]
    },
    options: ['Soiling (dust) reducing the light reaching the cells', 'One shaded module', 'A blown fuse', 'Wrong battery voltage'],
    answer: 0,
    explain: 'Current is proportional to the light reaching the cells, while V_oc changes only logarithmically. A uniform current loss of about 28 % with nearly normal V_oc matches dust across the whole array.',
    fix: 'Clean the modules following the manufacturer’s method (safe access, water only, no abrasives); add a cleaning interval to the maintenance plan (course S5).',
  },
  {
    id: 'voc-cold',
    title: 'Controller trips on cold mornings',
    preset: 'offgrid-home',
    symptom: 'After two modules were added to each string, the controller shows “PV overvoltage” on clear, cold mornings and was later found damaged.',
    conditions: 'Coldest morning: 2 °C at sunrise, low sun but V_oc near its maximum.',
    readings: (d) => {
      const m = d.spec.module
      const n = d.numbers.series + 2
      const vocCold = m.voc * (1 + (m.betaVoc / 100) * (2 - 25))
      return [
        { label: 'Modules in series now', value: n, unit: '' },
        { label: 'String V_oc at 2 °C (calculated)', value: round(n * vocCold, 1), unit: 'V' },
        { label: 'Controller maximum PV voltage', value: d.spec.controllerMaxV, unit: 'V' },
      ]
    },
    options: ['The strings are too long: cold-morning V_oc exceeds the controller’s maximum', 'Soiling', 'Partial shading', 'The battery is undersized'],
    answer: 0,
    explain: 'V_oc rises as temperature falls (negative β). With two extra modules the cold-morning string voltage exceeds the controller’s absolute limit, which destroys its input stage.',
    fix: 'Return to a string length within n ≤ V_max / V_oc,cold; add the extra modules as a new parallel string (checking current and fusing) or use a controller with a higher voltage rating.',
  },
  {
    id: 'reverse-polarity',
    title: 'Negative voltage at the combiner',
    preset: 'clinic-hybrid',
    symptom: 'During commissioning a new string is measured before its fuse is inserted.',
    conditions: `${G} W/m². Meter red lead on the combiner’s + terminal for the string, black on −.`,
    readings: (d) => {
      const m = d.spec.module
      const op = operating(m, G, cellTemp(m, TA, G))
      return [
        { label: 'New string, + to − at the combiner', value: round(-d.numbers.series * op.voc, 1), unit: 'V' },
        { label: 'Existing string, + to −', value: round(d.numbers.series * op.voc, 1), unit: 'V' },
      ]
    },
    options: ['The new string’s polarity is reversed: do not insert its fuse', 'The string is shaded', 'The meter is faulty', 'Normal: PV voltage is negative'],
    answer: 0,
    explain: 'Connected in parallel with the correctly wired strings, a reversed string would be driven against its own polarity: about twice V_oc would appear across its fuse holder, and its bypass diodes would carry a large fault current. This is exactly why every string is polarity-checked before connection.',
    fix: 'Leave the string isolated; correct the connections at the module end or combiner (positive to +); re-measure V_oc and polarity; then insert the fuse.',
  },
  {
    id: 'cable-drop',
    title: 'Inverter cuts out under heavy load, battery looks fine',
    preset: 'offgrid-home',
    symptom: 'The inverter shuts down with “low battery” when the pump starts, but the battery voltage at its terminals stays reasonable.',
    conditions: 'Pump starting; readings taken simultaneously at the battery terminals and the inverter terminals.',
    readings: (d) => {
      const i = Math.min(d.numbers.inverterW, d.numbers.pSurge) / (d.spec.inverterEff * d.numbers.vsys * 0.95)
      const a = 6
      const r = (RHO_CU * 2 * d.spec.routeInv) / a + 0.004
      const vb = d.numbers.vsys * 1.03 - i * 0.008
      return [
        { label: 'Battery current', value: round(i, 0), unit: 'A' },
        { label: 'Voltage at the battery terminals', value: round(vb, 2), unit: 'V' },
        { label: 'Voltage at the inverter terminals', value: round(vb - i * r, 2), unit: 'V' },
        { label: 'Battery cable found installed', value: a, unit: 'mm²', healthy: d.numbers.cableInv },
      ]
    },
    options: ['Excessive voltage drop: undersized cable and/or a poor connection between battery and inverter', 'A failed battery', 'Soiled modules', 'A tripped RCD'],
    answer: 0,
    explain: 'The battery holds its voltage, but the inverter sees much less: the difference is I × R of the cable and its connections. At this current a 6 mm² cable plus a few milliohms of contact resistance drops several volts, pushing the inverter below its cut-off.',
    fix: 'Isolate, then install the designed cable size with correctly crimped lugs torqued to specification; check every joint with a voltage-drop test under load (F2.M5.L2).',
  },
  {
    id: 'battery-aged',
    title: 'Voltage collapses whenever a load starts',
    preset: 'offgrid-home',
    symptom: 'Lights dim and the inverter alarms when the pump starts, even after a full day of sun.',
    conditions: 'Battery at rest for one hour after charging; then a known load step is applied.',
    readings: (d) => {
      const v = d.numbers.vsys * 1.04
      const i = 80
      const rOld = 0.055
      return [
        { label: 'Open-circuit voltage (rested)', value: round(v, 2), unit: 'V' },
        { label: 'Voltage with an 80 A load step', value: round(v - i * rOld, 2), unit: 'V' },
        { label: 'Internal resistance when new (commissioning record)', value: 10, unit: 'mΩ' },
      ]
    },
    options: ['High internal resistance: the battery is at the end of its life (or one block/cell is failing)', 'Undersized PV array', 'Soiling', 'Cold-weather overvoltage'],
    answer: 0,
    explain: 'The rested voltage shows a charged battery, but r = ΔV/ΔI = (4.4 V)/(80 A) = 55 mΩ, more than five times its commissioning value. The battery can no longer deliver high currents.',
    fix: 'Measure each block or cell under load to find weak units; replace the bank (do not mix new and old batteries); check the BMS records and the charging settings that may have shortened its life (course P5).',
  },
  {
    id: 'pwm-mismatch',
    title: 'Big modules, little charging (PWM)',
    preset: 'cabin-pwm',
    symptom: 'A cabin owner replaced two 100 W “12 V” modules with one 330 W, 72-cell module on the same PWM controller. Charging did not improve.',
    conditions: 'Clear sky, 900 W/m², battery at 13.2 V.',
    readings: (d) => {
      const big = { ...d.spec.module, ...({ pmax: 330, voc: 46.0, isc: 9.3, vmp: 37.5, imp: 8.8, betaVoc: -0.31, alphaIsc: 0.05, gammaPmax: -0.39, cells: 72 } as const) }
      const tc = cellTemp(big, TA, G)
      const c = arrayCurve(big, { series: 1, strings: 1, g: G, tCell: tc })
      const pw = pwmOperating(c, 13.2)
      const old = arrayCurve(d.spec.module, { series: 1, strings: 2, g: G, tCell: cellTemp(d.spec.module, TA, G) })
      return [
        { label: 'New module MPP power available', value: round(mpp(c).p, 0), unit: 'W' },
        { label: 'Charging power with PWM at 13.2 V', value: round(pw.p, 0), unit: 'W' },
        { label: 'Previous two 36-cell modules with PWM', value: round(pwmOperating(old, 13.2).p, 0), unit: 'W' },
      ]
    },
    options: ['A PWM controller holds the 72-cell module near battery voltage, far below its MPP', 'The new module is faulty', 'The battery is full', 'Shading'],
    answer: 0,
    explain: 'With PWM the array voltage equals the battery voltage. A 72-cell module’s MPP is near 30–37 V; at 13–14 V it delivers roughly its short-circuit current, so most of its power is wasted.',
    fix: 'Use an MPPT controller (sized for the module’s cold V_oc) or modules matched to the battery voltage.',
  },
  {
    id: 'gen-threshold',
    title: 'Lights go out before the generator starts',
    preset: 'clinic-hybrid',
    symptom: 'After a cloudy spell the clinic lost power overnight although the generator has fuel and works when started by hand.',
    conditions: 'Three overcast days (30 % of design irradiance) simulated with the installed settings: generator start at 20 % SOC.',
    readings: (d) => {
      const bad = sizeSystem({ ...d.spec, genStart: 0.2 })
      const r = simulateDispatch(bad, { days: 3, weather: [0.3, 0.3, 0.3], soc0: 0.6 })
      return [
        { label: 'Depth-of-discharge limit (low-voltage disconnect)', value: round((1 - d.spec.battery.dod) * 100, 0), unit: '% SOC' },
        { label: 'Generator start setting', value: 20, unit: '% SOC' },
        { label: 'Generator starts in 3 days', value: r.totals.genStarts, unit: '' },
        { label: 'Load energy not supplied', value: round(r.totals.unmet / 1000, 2), unit: 'kWh' },
      ]
    },
    options: ['The generator start threshold is below the low-voltage disconnect, so loads are shed first', 'The generator is too small', 'The PV array is shaded', 'A blown battery fuse'],
    answer: 0,
    explain: 'The inverter disconnects the loads at the depth-of-discharge limit (50 % SOC for this lead-acid bank) before the battery ever reaches the 20 % start threshold, so the generator never starts.',
    fix: 'Set the start threshold above the disconnect level (the design uses 55 %), with a stop threshold well above it (90 %) for hysteresis; test the auto-start during commissioning.',
  },
  {
    id: 'anti-island',
    title: 'No power during a grid outage despite sunshine',
    preset: 'grid-home',
    symptom: 'During a midday power cut the house had no electricity although the sun was shining.',
    conditions: 'Grid outage from 11:00 to 14:00 on a clear day.',
    readings: (d) => {
      const r = simulateDispatch(d, { days: 1, weather: [1], soc0: 0, outage: [11, 14] })
      const at = (h: number) => r.steps.find((s) => Math.abs(s.t - h) < 1e-6)!
      return [
        { label: 'PV power at 10:00 (grid up)', value: round(at(10).pv, 0), unit: 'W' },
        { label: 'PV power at 12:00 (grid down)', value: round(at(12).pv, 0), unit: 'W' },
        { label: 'Load not supplied during the outage', value: round(r.totals.unmet / 1000, 2), unit: 'kWh' },
      ]
    },
    options: ['Normal anti-islanding: a grid-tied inverter must stop when the grid fails', 'A failed inverter', 'Soiling', 'An open string'],
    answer: 0,
    explain: 'Grid-tied inverters are required to disconnect within a short time of grid loss so that they cannot energise lines that utility workers believe are dead (back-feed, F1.M2.L3). Without a battery and a hybrid inverter there is no back-up.',
    fix: 'Explain the behaviour to the owner; if back-up is needed, design a hybrid system with a battery and an automatic transfer arrangement (preset “hybrid home”).',
  },
]
export const SOLAR_FAULT_BY_ID: Record<string, SolarFault> = Object.fromEntries(SOLAR_FAULTS.map((f) => [f.id, f]))

export function faultDesign(f: SolarFault): SolarDesign {
  return sizeSystem(SOLAR_PRESET_BY_ID[f.preset].spec)
}

