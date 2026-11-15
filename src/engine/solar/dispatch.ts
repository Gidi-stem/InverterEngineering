import type { SolarDesign } from './types'

/**
 * Energy-management simulation: 24-hour (or multi-day) energy flows in 10-minute steps.
 * PV power follows a clear-sky sine between sunrise and sunset scaled to the design-month peak sun
 * hours; ambient temperature swings between the site minimum (05:00) and maximum (14:00). The
 * dispatch rules are the ones taught in S2.M4: off-grid, grid-tied and hybrid, with optional
 * generator auto-start on low state of charge. An educational model, not a yield prediction.
 */
export interface DispatchOptions {
  days: number
  /** Multiplies the irradiance of each day (1 = design-month clear day; 0.3 = heavy overcast). */
  weather: number[]
  /** Starting state of charge, 0–1. */
  soc0: number
  /** Grid outage window in hours from the start of the run, [from, to). */
  outage?: [number, number]
  sunrise?: number
  sunset?: number
  /** Inverter self-consumption while on, W. */
  idleW?: number
}

export interface Step {
  t: number
  g: number
  pv: number
  load: number
  /** Positive charging, negative discharging, measured at the battery terminals, W. */
  battery: number
  soc: number
  gridIn: number
  gridOut: number
  gen: number
  curtailed: number
  unmet: number
  gridUp: boolean
  genOn: boolean
}

export interface DispatchResult {
  steps: Step[]
  totals: { pv: number; load: number; served: number; unmet: number; curtailed: number; gridIn: number; gridOut: number; gen: number; genHours: number; genStarts: number; socMin: number; socMax: number; selfSufficiency: number }
}

export function irradiance(h: number, psh: number, sunrise = 6, sunset = 18): number {
  const day = sunset - sunrise
  const hh = h % 24
  if (hh <= sunrise || hh >= sunset) return 0
  const gpk = (psh * 1000 * Math.PI) / (2 * day)
  return gpk * Math.sin((Math.PI * (hh - sunrise)) / day)
}

export function ambient(h: number, tMin: number, tMax: number): number {
  const hh = h % 24
  // Cosine with minimum at 05:00 and maximum at 14:00 (rising 9 h, falling 15 h).
  if (hh >= 5 && hh <= 14) return tMin + ((tMax - tMin) * (1 - Math.cos((Math.PI * (hh - 5)) / 9))) / 2
  const k = hh > 14 ? hh - 14 : hh + 10
  return tMin + ((tMax - tMin) * (1 + Math.cos((Math.PI * k) / 15))) / 2
}

export function simulateDispatch(d: SolarDesign, o: DispatchOptions): DispatchResult {
  const s = d.spec
  const n = d.numbers
  const dtH = 1 / 6
  const grid = s.type !== 'off-grid'
  const hasBat = s.type !== 'grid-tied'
  const capWh = n.bankKWh * 1000
  const socMin = hasBat ? (s.type === 'hybrid' ? Math.max(1 - s.battery.dod, s.reserve) : 1 - s.battery.dod) : 0
  const socFloor = hasBat ? 1 - s.battery.dod : 0
  const effOne = Math.sqrt(hasBat ? s.battery.eff : 1)
  const etaCtrl = s.controller === 'mppt' ? 0.97 : 0.98
  const maxCharge = hasBat ? n.controllerA * n.vsys : Infinity
  const genW = n.generatorKVA * 1000 * 0.8
  const chargeGenW = n.chargeA * n.vsys * 1.2
  const idle = o.idleW ?? (s.type === 'grid-tied' ? 0 : 0.01 * n.inverterW)
  let soc = hasBat ? o.soc0 : 0
  let genOn = false
  let genStarts = 0
  const steps: Step[] = []
  const tot = { pv: 0, load: 0, served: 0, unmet: 0, curtailed: 0, gridIn: 0, gridOut: 0, gen: 0, genHours: 0 }
  let sMin = soc
  let sMax = soc
  const total = Math.round((o.days * 24) / dtH)
  for (let k = 0; k < total; k++) {
    const t = k * dtH
    const day = Math.floor(t / 24)
    const h = t % 24
    const w = o.weather[day] ?? o.weather[o.weather.length - 1] ?? 1
    const g = irradiance(h, s.site.psh, o.sunrise, o.sunset) * w
    const tc = ambient(h, s.site.tMin, s.site.tMax) + ((s.module.noct - 20) / 800) * g
    const fT = 1 + (s.module.gammaPmax / 100) * (tc - 25)
    const gridUp = grid && !(o.outage && t >= o.outage[0] && t < o.outage[1])
    // Available DC power from the array after the controller (or grid inverter MPPT).
    let pv = n.arrayW * (g / 1000) * fT * s.soiling * s.wiring * s.mismatch * (s.type === 'grid-tied' ? 1 : etaCtrl * n.pwmFactor)
    // Grid-tied inverters stop exporting during an outage (anti-islanding).
    if (s.type === 'grid-tied' && !gridUp) pv = 0
    const hr = Math.floor(h)
    const loadAc = d.profileAc[hr]
    const loadDc = d.profileDc[hr]
    const load = loadAc + loadDc
    // Demand at the DC bus (battery side): AC through the inverter plus DC loads plus idle.
    const eta = s.inverterEff
    let demandDc = s.type === 'grid-tied' ? loadAc / eta : loadAc / eta + loadDc + idle
    let battery = 0
    let gridIn = 0
    let gridOut = 0
    let gen = 0
    let curtailed = 0
    let unmet = 0

    if (s.type === 'grid-tied') {
      const pvAc = pv * eta
      const net = pvAc - loadAc
      if (net >= 0) gridOut = s.exportAllowed && gridUp ? net : 0
      else if (gridUp) gridIn = -net
      else unmet = loadAc
      if (net > 0 && !(s.exportAllowed && gridUp)) curtailed = net
    } else {
      // Generator control (off-grid and hybrid with generator).
      if (s.generator && n.generatorKVA > 0) {
        if (!genOn && soc < s.genStart && !(s.type === 'hybrid' && gridUp)) {
          genOn = true
          genStarts++
        } else if (genOn && (soc >= s.genStop || (s.type === 'hybrid' && gridUp))) genOn = false
      }
      // 1. PV supplies the DC demand first.
      const pvToLoad = Math.min(pv, demandDc)
      demandDc -= pvToLoad
      let surplus = pv - pvToLoad
      // 2. Surplus PV charges the battery.
      const room = ((1 - soc) * capWh) / dtH / effOne
      const pvCharge = Math.min(surplus, room, maxCharge)
      battery += pvCharge
      surplus -= pvCharge
      // 3. Remaining surplus is exported (hybrid) or curtailed.
      if (surplus > 0) {
        if (s.type === 'hybrid' && gridUp && s.exportAllowed) gridOut = surplus * eta
        else curtailed = surplus
      }
      // 4. Remaining demand: grid (hybrid, grid up, below reserve) / battery / generator.
      if (demandDc > 0) {
        if (genOn) {
          const g1 = Math.min(genW, demandDc * eta)
          gen += g1
          demandDc -= g1 / eta
        }
        const avail = Math.max(0, ((soc - (s.type === 'hybrid' && gridUp ? socMin : socFloor)) * capWh) / dtH) * effOne
        const fromBat = Math.min(avail, demandDc)
        battery -= fromBat / effOne
        demandDc -= fromBat
        if (demandDc > 1e-9) {
          if (s.type === 'hybrid' && gridUp) {
            gridIn = demandDc * eta
            demandDc = 0
          } else {
            unmet = demandDc * eta
            demandDc = 0
          }
        }
      }
      // 5. Generator charges the battery with what it has left.
      if (genOn) {
        const roomNow = Math.max(0, ((1 - soc) * capWh) / dtH / effOne - Math.max(0, battery))
        const gc = Math.min(Math.max(0, genW - gen), chargeGenW, roomNow)
        battery += gc * 0.9
        gen += gc
      }
      // Hybrid: top up to the reserve from the grid.
      if (s.type === 'hybrid' && gridUp && soc < socMin) {
        const roomNow = Math.max(0, ((socMin - soc) * capWh) / dtH / effOne - Math.max(0, battery))
        const gc = Math.min(roomNow, maxCharge)
        battery += gc
        gridIn += gc / 0.95
      }
      soc = Math.min(1, Math.max(0, soc + ((battery > 0 ? battery * effOne : battery) * dtH) / capWh))
    }
    sMin = Math.min(sMin, soc)
    sMax = Math.max(sMax, soc)
    steps.push({ t, g, pv, load, battery, soc, gridIn, gridOut, gen, curtailed, unmet, gridUp, genOn })
    tot.pv += pv * dtH
    tot.load += load * dtH
    tot.unmet += unmet * dtH
    tot.curtailed += curtailed * dtH
    tot.gridIn += gridIn * dtH
    tot.gridOut += gridOut * dtH
    tot.gen += gen * dtH
    if (genOn) tot.genHours += dtH
  }
  tot.served = tot.load - tot.unmet
  const selfSufficiency = tot.load > 0 ? Math.max(0, 1 - (tot.gridIn + tot.gen + tot.unmet) / tot.load) : 1
  return { steps, totals: { ...tot, genStarts, socMin: sMin, socMax: sMax, selfSufficiency } }
}
