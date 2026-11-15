import { arrayCurve, cellTemp, mpp, pwmOperating, type ModuleSpec } from './pv'
import type { Load, SizedItem, SolarDesign, SolarIssue, SolarSpec } from './types'

/**
 * Size a complete solar / hybrid system from a load profile. Every number is an explained item
 * (formula, working, why) so the learner can follow and check it. Values marked "assumption" are
 * typical design allowances, not standards or manufacturer data.
 */

export const STD = {
  inverter: [300, 500, 800, 1000, 1500, 2000, 3000, 4000, 5000, 6000, 8000, 10000],
  controller: [10, 20, 30, 40, 50, 60, 70, 80, 100],
  fuse: [10, 15, 20, 25, 32, 40, 50, 63, 80, 100, 125, 150, 160, 200, 250, 300, 400],
  cable: [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150],
  generator: [2, 3, 5, 6, 8, 10, 15, 20],
  isolatorA: [16, 25, 32, 40, 63, 80, 100, 125, 160, 200, 250],
}
export const RHO_CU = 0.0172

export const nextStd = (list: number[], v: number) => list.find((x) => x >= v - 1e-9) ?? list[list.length - 1]
const ceil = (v: number) => Math.ceil(v - 1e-9)

/** Hours (in 0.25 h steps) that a window covers, handling wrap past midnight. */
export function onAt(l: Load, h: number): boolean {
  return l.windows.some(([a, b]) => (a <= b ? h >= a && h < b : h >= a || h < b))
}
export function windowHours(l: Load): number {
  return l.windows.reduce((s, [a, b]) => s + (a <= b ? b - a : 24 - a + b), 0)
}
export function loadEnergy(l: Load): number {
  return l.watts * l.qty * l.duty * windowHours(l)
}

/** Hourly average power profile (24 values) for the AC or DC loads. */
export function hourlyProfile(loads: Load[], ac: boolean): number[] {
  const out = new Array(24).fill(0)
  for (const l of loads) {
    if (l.ac !== ac) continue
    for (let q = 0; q < 96; q++) if (onAt(l, q / 4)) out[Math.floor(q / 4)] += (l.watts * l.qty * l.duty) / 4
  }
  return out
}

/** Highest simultaneous running power (full running watts of every load that is on), and the time. */
export function peakPower(loads: Load[]): { p: number; at: number } {
  let best = { p: 0, at: 0 }
  for (let q = 0; q < 96; q++) {
    const h = q / 4
    const p = loads.filter((l) => l.ac && onAt(l, h)).reduce((s, l) => s + l.watts * l.qty, 0)
    if (p > best.p) best = { p, at: h }
  }
  return best
}

/** Typical cut-off as a fraction of nominal voltage: 10.5 V of 12 V for lead-acid and 11.2 V of 12.8 V for LiFePO₄ are both 0.875. */
const CUTOFF_FRAC = 0.875
/** Typical absorption (bulk) charging voltage as a fraction of nominal (14.4 V of 12 V; 14.2 V of 12.8 V). */
const chargeFrac = (chem: string) => (chem === 'lead-acid' ? 1.2 : 1.11)

export function sizeSystem(spec: SolarSpec): SolarDesign {
  const items: SizedItem[] = []
  const issues: SolarIssue[] = []
  const add = (it: SizedItem) => {
    items.push(it)
    return it.value
  }
  const m: ModuleSpec = spec.module
  const grid = spec.type === 'grid-tied'
  const bat = spec.battery

  // ---- Loads ---------------------------------------------------------------------------------
  const acLoads = spec.loads.filter((l) => l.ac)
  const dcLoads = spec.loads.filter((l) => !l.ac)
  const eAc = acLoads.reduce((s, l) => s + loadEnergy(l), 0)
  const eDc = dcLoads.reduce((s, l) => s + loadEnergy(l), 0)
  add({ id: 'e-ac', group: 'Loads', label: 'Daily AC load energy', value: eAc, unit: 'Wh/day', formula: 'E_AC = Σ P × qty × duty × hours', working: acLoads.map((l) => `${l.name}: ${l.watts}×${l.qty}×${l.duty}×${windowHours(l)} h = ${loadEnergy(l).toFixed(0)}`).join('; ') || 'no AC loads', why: 'The energy the inverter must deliver each day.', kind: 'calculated' })
  if (dcLoads.length) add({ id: 'e-dc', group: 'Loads', label: 'Daily DC load energy', value: eDc, unit: 'Wh/day', formula: 'E_DC = Σ P × qty × duty × hours', working: dcLoads.map((l) => `${l.name}: ${loadEnergy(l).toFixed(0)}`).join('; '), why: 'Supplied straight from the battery, without inverter losses.', kind: 'calculated' })
  add({ id: 'eta-inv', group: 'Loads', label: 'Inverter efficiency', value: spec.inverterEff, unit: '', formula: 'η_inv (datasheet, typical part-load value)', working: `${spec.inverterEff}`, why: 'Converts AC energy into the DC energy drawn from the battery.', kind: 'assumption' })
  const eDaily = add({ id: 'e-daily', group: 'Loads', label: 'Daily energy at the battery (DC)', value: eAc / spec.inverterEff + eDc, unit: 'Wh/day', formula: 'E_d = E_AC / η_inv + E_DC', working: `${eAc.toFixed(0)} / ${spec.inverterEff} + ${eDc.toFixed(0)}`, why: 'The figure used to size the battery and the PV array.', kind: 'calculated' })
  const pk = peakPower(spec.loads)
  const pPeak = add({ id: 'p-peak', group: 'Loads', label: 'Peak simultaneous AC load', value: pk.p, unit: 'W', formula: 'max over the day of Σ running power of loads that are on', working: `${pk.p.toFixed(0)} W at ${String(Math.floor(pk.at)).padStart(2, '0')}:${String(Math.round((pk.at % 1) * 60)).padStart(2, '0')}`, why: 'Sets the inverter’s continuous rating.', kind: 'calculated' })
  const extra = Math.max(0, ...acLoads.map((l) => (l.surgeW - l.watts) * Math.min(1, l.qty)))
  const pSurge = add({ id: 'p-surge', group: 'Loads', label: 'Peak with the largest motor starting', value: pPeak + extra, unit: 'W', formula: 'P_surge = P_peak + max(P_start − P_run)', working: `${pPeak.toFixed(0)} + ${extra.toFixed(0)}`, why: 'Motors and compressors draw several times their running power while starting; the inverter must ride through it.', kind: 'calculated' })

  // ---- Inverter and system voltage ------------------------------------------------------------
  const invReq = 1.25 * pPeak
  let inverterW = 0
  if (!grid) {
    inverterW = add({ id: 'inv', group: 'Inverter', label: 'Inverter continuous rating', value: nextStd(STD.inverter, Math.max(invReq, pSurge / spec.inverterSurge)), unit: 'W', formula: 'P_inv ≥ 1.25 × P_peak and P_inv × surge factor ≥ P_surge', working: `1.25 × ${pPeak.toFixed(0)} = ${invReq.toFixed(0)} W; ${pSurge.toFixed(0)} / ${spec.inverterSurge} = ${(pSurge / spec.inverterSurge).toFixed(0)} W → next standard size`, why: 'Continuous margin for ageing and heat; the surge capability (from the datasheet) must cover motor starting.', kind: 'selected' })
  }
  const vsys = spec.vsys || (grid ? 48 : inverterW <= 1200 ? 12 : inverterW <= 3000 ? 24 : 48)
  if (!grid)
    add({ id: 'vsys', group: 'Inverter', label: 'Battery system voltage', value: vsys, unit: 'V', formula: spec.vsys ? 'chosen by the designer' : 'rule of thumb: ≤ 1.2 kW → 12 V, ≤ 3 kW → 24 V, larger → 48 V', working: `${vsys} V`, why: 'Higher voltage keeps the battery current, cable size and I²R losses manageable (F2.M2.L3).', kind: spec.vsys ? 'selected' : 'assumption' })
  const vMin = vsys * CUTOFF_FRAC
  const iInvMax = !grid ? inverterW / (spec.inverterEff * vMin) : 0
  if (!grid) {
    add({ id: 'i-inv', group: 'Inverter', label: 'Maximum battery current at full inverter load', value: iInvMax, unit: 'A', formula: 'I = P_inv / (η × V_cut-off)', working: `${inverterW} / (${spec.inverterEff} × ${vMin.toFixed(1)})`, why: 'The worst case for the battery cable and fuse: full power at the lowest battery voltage.', kind: 'calculated' })
    if (vsys === 12 && inverterW > 1500) issues.push({ severity: 'warning', code: 'vsys-low', message: `A ${inverterW} W inverter on 12 V draws about ${iInvMax.toFixed(0)} A; consider 24 V or 48 V to reduce current, cable size and losses.` })
  }

  // ---- Battery --------------------------------------------------------------------------------
  let batSeries = 0
  let batParallel = 0
  let bankAh = 0
  let bankKWh = 0
  if (!grid) {
    add({ id: 'dod', group: 'Battery', label: 'Allowed depth of discharge', value: bat.dod, unit: '', formula: bat.chem === 'lead-acid' ? 'typical 50 % for lead-acid cycle life' : 'typical 80 % for LiFePO₄', working: `${bat.dod}`, why: 'Deeper cycling shortens battery life; the datasheet’s cycle-life curve sets the real value.', kind: 'assumption' })
    const eStore = add({ id: 'e-store', group: 'Battery', label: 'Nominal energy storage required', value: (eDaily * spec.autonomy) / bat.dod, unit: 'Wh', formula: 'E_bat = E_d × autonomy / DoD', working: `${eDaily.toFixed(0)} × ${spec.autonomy} / ${bat.dod}`, why: spec.type === 'hybrid' ? 'Storage for self-consumption and outages.' : 'Carries the loads through nights and cloudy days without discharging too deeply.', kind: 'calculated' })
    const ahReq = add({ id: 'ah', group: 'Battery', label: 'Capacity at system voltage', value: eStore / vsys, unit: 'Ah', formula: 'C = E_bat / V_sys', working: `${eStore.toFixed(0)} / ${vsys}`, why: 'Converts energy to the ampere-hours batteries are rated in.', kind: 'calculated' })
    batSeries = add({ id: 'bat-s', group: 'Battery', label: 'Batteries in series per string', value: Math.max(1, Math.round(vsys / bat.unitV)), unit: '', formula: 'N_s = V_sys / V_unit', working: `${vsys} / ${bat.unitV}`, why: 'Series connection adds voltage (F2.M3.L1).', kind: 'calculated' })
    if (Math.abs(batSeries * bat.unitV - vsys) / vsys > 0.1) issues.push({ severity: 'danger', code: 'bat-voltage', message: `${batSeries} × ${bat.unitV} V does not make a ${vsys} V bank. Choose batteries whose voltage divides the system voltage.` })
    batParallel = add({ id: 'bat-p', group: 'Battery', label: 'Parallel strings', value: Math.max(1, ceil(ahReq / bat.unitAh)), unit: '', formula: 'N_p = ⌈C / C_unit⌉', working: `⌈${ahReq.toFixed(0)} / ${bat.unitAh}⌉`, why: 'Parallel strings add capacity (F2.M3.L2).', kind: 'calculated' })
    bankAh = batParallel * bat.unitAh
    bankKWh = (batSeries * bat.unitV * bankAh) / 1000
    add({ id: 'bank', group: 'Battery', label: 'Installed bank', value: bankKWh, unit: 'kWh', formula: 'E = N_s·V_unit × N_p·C_unit', working: `${batSeries}×${bat.unitV} V × ${batParallel}×${bat.unitAh} Ah = ${(batSeries * bat.unitV).toFixed(1)} V, ${bankAh} Ah`, why: `${batSeries * batParallel} batteries in total.`, kind: 'selected' })
    if (batParallel > 3) issues.push({ severity: 'warning', code: 'bat-parallel', message: `${batParallel} parallel strings: current sharing becomes uneven and each string needs a fuse. Larger-capacity batteries would reduce the number of strings.` })
    const cRate = iInvMax / bankAh
    add({ id: 'c-rate', group: 'Battery', label: 'Discharge rate at full inverter load', value: cRate, unit: 'C', formula: 'C-rate = I_max / C_bank', working: `${iInvMax.toFixed(0)} / ${bankAh}`, why: 'High discharge rates reduce available capacity (especially lead-acid) and heat the battery.', kind: 'calculated' })
    const cLim = bat.chem === 'lead-acid' ? 0.25 : 0.5
    if (cRate > cLim) issues.push({ severity: 'warning', code: 'c-rate', message: `Discharge rate ${cRate.toFixed(2)}C exceeds typical guidance for ${bat.chem === 'lead-acid' ? 'lead-acid (≈ 0.2–0.25C)' : 'LiFePO₄ (≈ 0.5C)'}; check the battery datasheet or add capacity.` })
  }

  // ---- PV array -------------------------------------------------------------------------------
  const tCellHot = cellTemp(m, spec.site.tMax, 800)
  const fTemp = 1 + (m.gammaPmax / 100) * (tCellHot - 25)
  add({ id: 't-cell', group: 'PV array', label: 'Hot cell temperature (NOCT method, 800 W/m²)', value: tCellHot, unit: '°C', formula: 'T_c = T_a + (NOCT − 20)/800 × G', working: `${spec.site.tMax} + (${m.noct} − 20)/800 × 800`, why: 'Cells run well above ambient; power and voltage fall as they heat.', kind: 'calculated' })
  const derate = fTemp * spec.soiling * spec.wiring * spec.mismatch
  add({ id: 'derate', group: 'PV array', label: 'Array derating factor', value: derate, unit: '', formula: 'k = [1 + γ(T_c − 25)] × k_soiling × k_wiring × k_mismatch', working: `[1 + (${m.gammaPmax}/100)(${tCellHot.toFixed(1)} − 25)] × ${spec.soiling} × ${spec.wiring} × ${spec.mismatch} = ${fTemp.toFixed(3)} × ${(spec.soiling * spec.wiring * spec.mismatch).toFixed(3)}`, why: 'Real output is below the nameplate: heat, dirt, cable losses and module mismatch (typical allowances).', kind: 'assumption' })

  // PWM: how much of the module's power reaches a battery at its charging voltage (from the model).
  let pwmFactor = 1
  const vCharge = vsys * chargeFrac(bat.chem)
  if (!grid && spec.controller === 'pwm') {
    const per = Math.max(1, Math.round(vsys / 12))
    const curve = arrayCurve(m, { series: per, strings: 1, g: 800, tCell: tCellHot })
    const pw = pwmOperating(curve, (vsys + vCharge) / 2)
    pwmFactor = Math.min(1, pw.p / Math.max(1e-9, mpp(curve).p))
    add({ id: 'pwm-f', group: 'Controller', label: 'PWM harvest factor (from the I–V model)', value: pwmFactor, unit: '', formula: 'k_PWM = P(V_battery) / P_mpp', working: `${per} module(s) in series at ${((vsys + vCharge) / 2).toFixed(1)} V: ${pw.p.toFixed(0)} W of ${mpp(curve).p.toFixed(0)} W`, why: 'A PWM controller holds the array at battery voltage, wherever that falls on its curve.', kind: 'calculated' })
    if (pwmFactor < 0.7) issues.push({ severity: 'warning', code: 'pwm-mismatch', message: `This module operates far from its MPP on a ${vsys} V battery with PWM (only ${(pwmFactor * 100).toFixed(0)} % harvest). Use an MPPT controller or modules matched to the battery voltage (36-cell per 12 V).` })
  }
  const etaCtrl = spec.controller === 'mppt' ? 0.97 : 0.98
  const etaBat = grid ? 1 : bat.eff
  let arrayReq: number
  if (grid) {
    arrayReq = add({ id: 'p-array', group: 'PV array', label: 'Array power required', value: (eDaily * spec.gridOffset * spec.inverterEff) / (spec.site.psh * derate), unit: 'W', formula: 'P_array = E_AC × offset / (PSH × k)', working: `${(eDaily * spec.inverterEff).toFixed(0)} × ${spec.gridOffset} / (${spec.site.psh} × ${derate.toFixed(3)})`, why: 'Produces the chosen fraction of the daily load on average; the grid supplies the rest.', kind: 'calculated' })
  } else {
    add({ id: 'eta-chg', group: 'PV array', label: 'Charging path efficiency', value: etaBat * etaCtrl, unit: '', formula: 'η = η_battery(round trip) × η_controller', working: `${etaBat} × ${etaCtrl}`, why: 'Energy is lost charging and discharging the battery and in the controller (typical values).', kind: 'assumption' })
    arrayReq = add({ id: 'p-array', group: 'PV array', label: 'Array power required', value: eDaily / (etaBat * etaCtrl * spec.site.psh * derate * pwmFactor), unit: 'W', formula: spec.controller === 'pwm' ? 'P_array = E_d / (η × PSH × k × k_PWM)' : 'P_array = E_d / (η × PSH × k)', working: `${eDaily.toFixed(0)} / (${(etaBat * etaCtrl).toFixed(3)} × ${spec.site.psh} × ${derate.toFixed(3)}${spec.controller === 'pwm' ? ` × ${pwmFactor.toFixed(3)}` : ''})`, why: 'Replaces each day’s energy in the design month’s sun hours.', kind: 'calculated' })
  }
  const nMin = Math.max(1, ceil(arrayReq / m.pmax))
  add({ id: 'n-min', group: 'PV array', label: 'Modules needed', value: nMin, unit: '', formula: 'N = ⌈P_array / P_max⌉', working: `⌈${arrayReq.toFixed(0)} / ${m.pmax}⌉`, why: `Module: ${m.name}${m.source === 'illustrative' ? ' (illustrative values)' : ''}.`, kind: 'calculated' })

  // ---- Strings -------------------------------------------------------------------------------
  const vocCold = m.voc * (1 + (m.betaVoc / 100) * (spec.site.tMin - 25))
  add({ id: 'voc-cold', group: 'PV array', label: 'Module V_oc at the coldest morning', value: vocCold, unit: 'V', formula: 'V_oc,cold = V_oc × [1 + β(T_min − 25)]', working: `${m.voc} × [1 + (${m.betaVoc}/100)(${spec.site.tMin} − 25)]`, why: 'Voltage rises in the cold; the string must never exceed the controller’s or module’s maximum voltage.', kind: 'calculated' })
  const vmpHot = m.vmp * (1 + (m.betaVoc / 100) * (tCellHot - 25))
  add({ id: 'vmp-hot', group: 'PV array', label: 'Module V_mp when hot', value: vmpHot, unit: 'V', formula: 'V_mp,hot ≈ V_mp × [1 + β(T_c − 25)]', working: `${m.vmp} × [1 + (${m.betaVoc}/100)(${tCellHot.toFixed(1)} − 25)]`, why: 'The string’s working voltage must stay above the controller’s minimum on hot days.', kind: 'calculated' })
  const vLimit = Math.min(spec.controllerMaxV, m.maxSystemV)
  const maxSeries = Math.floor(vLimit / vocCold + 1e-9)
  let minSeries: number
  let minWhy: string
  if (grid) {
    minSeries = ceil(spec.mpptMinV / vmpHot)
    minWhy = `n × V_mp,hot ≥ inverter MPPT minimum ${spec.mpptMinV} V`
  } else if (spec.controller === 'mppt') {
    minSeries = ceil((vCharge + 5) / vmpHot)
    minWhy = `n × V_mp,hot ≥ V_charge + 5 V = ${(vCharge + 5).toFixed(1)} V (typical buck-converter headroom)`
  } else {
    minSeries = Math.max(1, Math.round(vsys / 12))
    minWhy = 'PWM: modules in series to match the battery (one 36-cell module per 12 V)'
  }
  add({ id: 'series-max', group: 'PV array', label: 'Most modules in series', value: maxSeries, unit: '', formula: 'n_max = ⌊V_max / V_oc,cold⌋', working: `⌊${vLimit} / ${vocCold.toFixed(2)}⌋`, why: `V_max is the lower of the ${grid ? 'inverter' : 'controller'} limit (${spec.controllerMaxV} V) and the module’s maximum system voltage (${m.maxSystemV} V).`, kind: 'calculated' })
  add({ id: 'series-min', group: 'PV array', label: 'Fewest modules in series', value: minSeries, unit: '', formula: minWhy, working: grid ? `⌈${spec.mpptMinV} / ${vmpHot.toFixed(2)}⌉` : spec.controller === 'mppt' ? `⌈${(vCharge + 5).toFixed(1)} / ${vmpHot.toFixed(2)}⌉` : `${vsys} / 12`, why: 'Below this the controller cannot regulate at the maximum power point on a hot day.', kind: 'calculated' })
  let series = minSeries
  let strings = ceil(nMin / series)
  if (spec.controller === 'pwm' && !grid) {
    strings = ceil(nMin / series)
  } else if (minSeries > maxSeries) {
    issues.push({ severity: 'danger', code: 'string-window', message: `No valid string length: at least ${minSeries} modules are needed for voltage but at most ${maxSeries} fit under ${vLimit} V cold. Choose a controller with a higher voltage limit or a different module.` })
  } else {
    let best = { s: minSeries, n: Infinity, st: 0 }
    for (let s = minSeries; s <= maxSeries; s++) {
      const st = ceil(nMin / s)
      const n = s * st
      if (n < best.n || (n === best.n && s > best.s)) best = { s, n, st }
    }
    series = best.s
    strings = best.st
  }
  if (spec.controller === 'pwm' && !grid && m.cells > 40) issues.push({ severity: 'warning', code: 'pwm-module', message: `${m.cells}-cell modules are intended for MPPT or grid inverters; with PWM much of their power is lost.` })
  const modules = series * strings
  const arrayW = modules * m.pmax
  add({ id: 'config', group: 'PV array', label: 'Array configuration', value: arrayW, unit: 'W', formula: 'P_installed = n_series × n_strings × P_max', working: `${series} in series × ${strings} string(s) = ${modules} modules × ${m.pmax} W`, why: 'Chosen to use the fewest modules within the voltage window (more in series where it ties, for lower current).', kind: 'selected' })
  const vocColdString = series * vocCold
  const vmpHotString = series * vmpHot
  add({ id: 'voc-string', group: 'PV array', label: 'String V_oc (cold)', value: vocColdString, unit: 'V', formula: 'n × V_oc,cold', working: `${series} × ${vocCold.toFixed(2)}`, why: `Must stay below ${vLimit} V. ${vocColdString > 120 ? 'Above 120 V DC: a hazardous voltage requiring qualified installation.' : ''}`, kind: 'calculated' })
  if (vocColdString > vLimit + 1e-9) issues.push({ severity: 'danger', code: 'voc-over', message: `String V_oc ${vocColdString.toFixed(0)} V exceeds the ${vLimit} V limit on a cold morning: the controller can be destroyed.` })
  const iscArray = strings * m.isc
  add({ id: 'isc-array', group: 'PV array', label: 'Array short-circuit current', value: iscArray, unit: 'A', formula: 'I_sc,array = n_strings × I_sc', working: `${strings} × ${m.isc}`, why: 'Basis for the PV cables, fuses and isolator (with a 1.25 irradiance factor).', kind: 'calculated' })

  // ---- Controller ----------------------------------------------------------------------------
  let controllerA = 0
  if (!grid) {
    const iOut = (arrayW * etaCtrl) / vsys
    controllerA = add({ id: 'ctrl', group: 'Controller', label: `${spec.controller.toUpperCase()} controller output rating`, value: nextStd(STD.controller, spec.controller === 'mppt' ? iOut : 1.25 * iscArray), unit: 'A', formula: spec.controller === 'mppt' ? 'I ≥ P_array × η / V_sys' : 'I ≥ 1.25 × I_sc,array', working: spec.controller === 'mppt' ? `${arrayW} × ${etaCtrl} / ${vsys} = ${iOut.toFixed(1)} A` : `1.25 × ${iscArray.toFixed(1)} = ${(1.25 * iscArray).toFixed(1)} A`, why: spec.controller === 'mppt' ? 'An MPPT controller converts array power to battery current at the battery voltage.' : 'A PWM controller passes the array current straight through.', kind: 'selected' })
    if (controllerA === STD.controller[STD.controller.length - 1] && iOut > controllerA) issues.push({ severity: 'warning', code: 'ctrl-big', message: `The array needs more than ${controllerA} A of charge current; split it across two controllers.` })
    add({ id: 'ctrl-v', group: 'Controller', label: 'Controller PV voltage limit', value: spec.controllerMaxV, unit: 'V', formula: 'V_max ≥ string V_oc (cold)', working: `${spec.controllerMaxV} V ≥ ${vocColdString.toFixed(0)} V`, why: 'The single most important controller check.', kind: 'selected' })
  }

  // ---- Cables --------------------------------------------------------------------------------
  const cable = (id: string, label: string, i: number, route: number, v: number, drop: number, why: string) => {
    const aMin = (RHO_CU * 2 * route * i) / (drop * v)
    const a = nextStd(STD.cable, Math.max(aMin, id === 'cab-pv' ? 4 : 1.5))
    const actual = (RHO_CU * 2 * route * i) / a
    add({ id, group: 'Cables', label, value: a, unit: 'mm²', formula: 'A ≥ ρ·2L·I / (drop × V)', working: `0.0172 × 2 × ${route} × ${i.toFixed(1)} / (${drop} × ${v.toFixed(1)}) = ${aMin.toFixed(2)} mm² → ${a} mm² (drop ${((actual / v) * 100).toFixed(2)} %)`, why: `${why} Check the cable’s current-carrying capacity in the manufacturer’s table is above the protective device rating.`, kind: 'selected' })
    return a
  }
  const cablePv = cable('cab-pv', 'PV string cable', 1.25 * m.isc, spec.routePv, vmpHotString, spec.dropPv, 'Per string, at 1.25 × I_sc; PV cable is UV- and double-insulated (solar cable); 4 mm² minimum here.')
  const cableArray = strings > 1 ? cable('cab-arr', 'Array cable (combiner to controller)', 1.25 * iscArray, spec.routeCtrl, vmpHotString, spec.dropPv, 'Carries all strings together.') : cablePv
  const cableCtrl = !grid ? cable('cab-ctrl', 'Controller to battery cable', controllerA, spec.routeCtrl, vsys, spec.dropDc, 'At the controller’s rated output current.') : 0
  const cableInv = !grid ? cable('cab-inv', 'Battery to inverter cable', iInvMax, spec.routeInv, vsys, spec.dropDc, 'At full inverter power and the lowest battery voltage.') : 0

  // ---- Protection ----------------------------------------------------------------------------
  const reverse = (strings - 1) * 1.25 * m.isc
  let stringFuse = 0
  if (strings >= 2) {
    const need = reverse > m.maxFuse
    if (need) {
      const lo = 1.56 * m.isc
      stringFuse = add({ id: 'fuse-str', group: 'Protection', label: 'PV string fuse (each string, both poles where required)', value: nextStd(STD.fuse, lo), unit: 'A', formula: '1.56 × I_sc ≤ I_n ≤ module max series fuse', working: `1.56 × ${m.isc} = ${lo.toFixed(1)} A → ${nextStd(STD.fuse, lo)} A ≤ ${m.maxFuse} A`, why: `With ${strings} strings, a faulty string can be back-fed by ${reverse.toFixed(1)} A, above the module’s ${m.maxFuse} A rating. (Standards use factors between about 1.5 and 1.56 × I_sc; follow the applicable one.)`, kind: 'selected' })
      if (stringFuse > m.maxFuse) issues.push({ severity: 'danger', code: 'fuse-window', message: `No string fuse fits between 1.56 × I_sc and the module’s ${m.maxFuse} A maximum series fuse.` })
    } else add({ id: 'fuse-str', group: 'Protection', label: 'PV string fuses', value: 0, unit: 'A', formula: '(n_strings − 1) × 1.25 × I_sc ≤ max series fuse → not required', working: `${reverse.toFixed(1)} A ≤ ${m.maxFuse} A`, why: 'The worst-case reverse current cannot exceed the module’s rating.', kind: 'calculated' })
  }
  let batteryFuse = 0
  let ctrlFuse = 0
  if (!grid) {
    batteryFuse = add({ id: 'fuse-bat', group: 'Protection', label: 'Battery fuse (inverter circuit)', value: nextStd(STD.fuse, 1.25 * iInvMax), unit: 'A', formula: 'I_n ≥ 1.25 × I_max, at the battery positive', working: `1.25 × ${iInvMax.toFixed(1)} = ${(1.25 * iInvMax).toFixed(1)} A`, why: 'Protects the cable; must be DC-rated with a breaking capacity above the bank’s short-circuit current (F1.M4.L1).', kind: 'selected' })
    ctrlFuse = add({ id: 'fuse-ctrl', group: 'Protection', label: 'Controller output fuse or breaker', value: nextStd(STD.fuse, 1.25 * controllerA), unit: 'A', formula: 'I_n ≥ 1.25 × I_controller', working: `1.25 × ${controllerA}`, why: 'Protects the controller-to-battery cable at the battery end.', kind: 'selected' })
    if (batParallel > 1) add({ id: 'fuse-strbat', group: 'Protection', label: 'Fuse on each parallel battery string', value: nextStd(STD.fuse, (1.25 * iInvMax) / batParallel), unit: 'A', formula: 'I_n ≥ 1.25 × I_max / N_p', working: `1.25 × ${iInvMax.toFixed(0)} / ${batParallel}`, why: 'A short in one string is fed by all the others (F2.M3.L2).', kind: 'selected' })
  }
  const isolatorV = add({ id: 'iso-pv', group: 'Protection', label: 'PV DC isolator voltage rating', value: Math.ceil(vocColdString / 50) * 50, unit: 'V DC', formula: 'U ≥ string V_oc (cold)', working: `≥ ${vocColdString.toFixed(0)} V → ${Math.ceil(vocColdString / 50) * 50} V`, why: 'The isolator must break the highest DC voltage the array can produce, on load.', kind: 'selected' })
  const isolatorA = add({ id: 'iso-pv-a', group: 'Protection', label: 'PV DC isolator current rating', value: nextStd(STD.isolatorA, 1.25 * iscArray), unit: 'A', formula: 'I ≥ 1.25 × I_sc,array', working: `1.25 × ${iscArray.toFixed(1)}`, why: 'DC-rated, lockable, close to the controller or inverter, so PV can be isolated for work (F1.M3).', kind: 'selected' })
  if (!grid) add({ id: 'iso-bat', group: 'Protection', label: 'Battery isolator', value: nextStd(STD.isolatorA, batteryFuse), unit: 'A', formula: 'I ≥ battery fuse rating, DC-rated', working: `≥ ${batteryFuse} A`, why: 'Allows the battery to be isolated and locked off.', kind: 'selected' })

  // ---- Generator -----------------------------------------------------------------------------
  let generatorKVA = 0
  let chargeA = 0
  if (!grid && spec.generator) {
    chargeA = add({ id: 'chg', group: 'Generator', label: 'Charger current from the generator', value: Math.round(bankAh * (bat.chem === 'lead-acid' ? 0.15 : 0.2)), unit: 'A', formula: bat.chem === 'lead-acid' ? 'I ≈ 0.1–0.2 C (typical; datasheet sets the limit)' : 'I ≈ 0.2 C (typical; datasheet sets the limit)', working: `${bankAh} Ah × ${bat.chem === 'lead-acid' ? 0.15 : 0.2}`, why: 'Recharges the bank in a few hours of generator running.', kind: 'assumption' })
    const pCh = (chargeA * vCharge) / 0.9
    const kw = (pPeak + pCh) * 1.25
    generatorKVA = add({ id: 'gen', group: 'Generator', label: 'Generator rating', value: nextStd(STD.generator, kw / 0.8 / 1000), unit: 'kVA', formula: 'S ≥ 1.25 × (P_peak + P_charge) / PF', working: `1.25 × (${pPeak.toFixed(0)} + ${pCh.toFixed(0)}) / 0.8 = ${(kw / 0.8 / 1000).toFixed(2)} kVA`, why: 'Supplies the loads and the charger together, with margin; PF 0.8 is the usual generator rating basis.', kind: 'selected' })
    add({ id: 'gen-th', group: 'Generator', label: 'Auto-start / stop thresholds', value: spec.genStart * 100, unit: '% SOC', formula: 'start below, stop above', working: `start < ${(spec.genStart * 100).toFixed(0)} %, stop > ${(spec.genStop * 100).toFixed(0)} %`, why: 'Hysteresis prevents short runs; the start threshold must be above the DoD limit.', kind: 'selected' })
    if (spec.genStart < 1 - bat.dod) issues.push({ severity: 'warning', code: 'gen-threshold', message: `Generator start (${(spec.genStart * 100).toFixed(0)} %) is below the depth-of-discharge limit (${((1 - bat.dod) * 100).toFixed(0)} %): the loads will be shed before the generator starts.` })
    if (spec.genStop <= spec.genStart) issues.push({ severity: 'danger', code: 'gen-hyst', message: 'The generator stop threshold must be above its start threshold.' })
  }

  // ---- Grid-tied -----------------------------------------------------------------------------
  let annualKWh = 0
  if (grid) {
    inverterW = add({ id: 'inv-grid', group: 'Grid', label: 'Grid inverter AC rating', value: nextStd(STD.inverter, arrayW / 1.2), unit: 'W', formula: 'P_AC ≈ P_array / (DC/AC ratio ≈ 1.1–1.3)', working: `${arrayW} / 1.2 = ${(arrayW / 1.2).toFixed(0)} W`, why: 'Arrays rarely reach nameplate power, so the inverter is usually a little smaller (typical ratio).', kind: 'selected' })
    annualKWh = add({ id: 'yield', group: 'Grid', label: 'Estimated annual yield', value: (arrayW * spec.site.psh * 365 * derate * spec.inverterEff) / 1000, unit: 'kWh/yr', formula: 'E = P_array × PSH × 365 × k × η_inv', working: `${arrayW} × ${spec.site.psh} × 365 × ${derate.toFixed(3)} × ${spec.inverterEff}`, why: 'Uses the design-month sun hours for every day: a simple, conservative estimate.', kind: 'calculated' })
    issues.push({ severity: 'info', code: 'anti-island', message: 'A grid-tied inverter must disconnect when the grid fails (anti-islanding): it gives no backup power. Grid connection needs the network operator’s approval.' })
  } else annualKWh = (arrayW * spec.site.psh * 365 * derate * etaCtrl) / 1000

  if (spec.module.source === 'illustrative') issues.push({ severity: 'info', code: 'illustrative', message: 'The module values are illustrative examples. A real design uses the chosen product’s datasheet.' })

  return {
    spec,
    items,
    issues,
    profileAc: hourlyProfile(spec.loads, true),
    profileDc: hourlyProfile(spec.loads, false),
    numbers: { eAc, eDc, eDaily, pPeak, pSurge, vsys, inverterW, batSeries, batParallel, bankKWh, bankAh, arrayReqW: arrayReq, series, strings, modules, arrayW, vocColdString, vmpHotString, iscArray, controllerA, cablePv, cableArray, cableCtrl, cableInv, stringFuse, batteryFuse, ctrlFuse, isolatorV, isolatorA, generatorKVA, chargeA, derate, pwmFactor, annualKWh },
  }
}
