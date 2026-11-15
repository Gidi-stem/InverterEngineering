import type { ModuleSpec } from './pv'

/**
 * Phase 7 solar and hybrid system design types. A design is an EDUCATIONAL estimate built from a
 * load profile with typical design allowances; it teaches the method and drives the simulation,
 * but it is not a certified installation design. Real systems are designed to the applicable
 * standards with the manufacturers' data, and installed and certified by qualified persons.
 */
export type SystemType = 'off-grid' | 'grid-tied' | 'hybrid'
export type Chemistry = 'lead-acid' | 'lifepo4'

export interface Load {
  id: string
  name: string
  /** Running power of one unit, W. */
  watts: number
  qty: number
  /** Time windows when the load is on, [start, end) in hours 0–24 (end may be less than start to wrap past midnight). */
  windows: [number, number][]
  /** Fraction of the on-time it actually draws power (a fridge compressor cycles), 0–1. */
  duty: number
  /** Starting (surge) power of one unit, W; equal to `watts` for loads without inrush. */
  surgeW: number
  /** AC loads go through the inverter; DC loads are supplied straight from the battery. */
  ac: boolean
}

export interface Site {
  name: string
  /** Peak sun hours (kWh/m²/day) in the design month. */
  psh: number
  /** Lowest expected ambient (for cold V_oc) and highest daytime ambient (for hot V_mp), °C. */
  tMin: number
  tMax: number
}

export interface BatterySpec {
  chem: Chemistry
  /** One battery (block) nominal voltage and capacity. */
  unitV: number
  unitAh: number
  /** Allowed depth of discharge for the design, 0–1. */
  dod: number
  /** Round-trip efficiency, 0–1. */
  eff: number
}

export interface SolarSpec {
  type: SystemType
  /** 0 = choose automatically from the inverter rating. */
  vsys: 0 | 12 | 24 | 48
  site: Site
  loads: Load[]
  module: ModuleSpec
  battery: BatterySpec
  /** Days of autonomy (off-grid) or of backup/self-consumption storage (hybrid). */
  autonomy: number
  controller: 'mppt' | 'pwm'
  /** MPPT controller maximum PV input voltage class, V. For grid-tied: inverter maximum DC voltage. */
  controllerMaxV: number
  /** Grid-tied inverter minimum MPPT voltage, V. */
  mpptMinV: number
  inverterEff: number
  /** Inverter surge capability as a multiple of its continuous rating (from the datasheet). */
  inverterSurge: number
  /** Design allowances (typical values; editable). */
  soiling: number
  wiring: number
  mismatch: number
  /** One-way cable route lengths, m. */
  routePv: number
  routeCtrl: number
  routeInv: number
  /** Voltage-drop limits, fraction of circuit voltage. */
  dropPv: number
  dropDc: number
  generator: boolean
  /** Generator auto-start and stop thresholds, state of charge 0–1. */
  genStart: number
  genStop: number
  /** Hybrid: battery reserve kept for outages, 0–1 SOC. */
  reserve: number
  /** Hybrid/grid-tied: allow export of surplus PV. */
  exportAllowed: boolean
  /** Grid-tied: fraction of daily load energy the array should produce on average. */
  gridOffset: number
}

export interface SizedItem {
  id: string
  group: 'Loads' | 'Inverter' | 'Battery' | 'PV array' | 'Controller' | 'Cables' | 'Protection' | 'Generator' | 'Grid'
  label: string
  value: number
  unit: string
  formula: string
  working: string
  why: string
  kind: 'calculated' | 'assumption' | 'selected'
}

export interface SolarIssue {
  severity: 'danger' | 'warning' | 'info'
  code: string
  message: string
}

export interface SolarDesign {
  spec: SolarSpec
  items: SizedItem[]
  issues: SolarIssue[]
  /** Hourly average load (W) for hours 0–23, AC loads at the AC side, DC loads at the battery. */
  profileAc: number[]
  profileDc: number[]
  numbers: {
    eAc: number
    eDc: number
    eDaily: number
    pPeak: number
    pSurge: number
    vsys: number
    inverterW: number
    batSeries: number
    batParallel: number
    bankKWh: number
    bankAh: number
    arrayReqW: number
    series: number
    strings: number
    modules: number
    arrayW: number
    vocColdString: number
    vmpHotString: number
    iscArray: number
    controllerA: number
    cablePv: number
    cableArray: number
    cableCtrl: number
    cableInv: number
    stringFuse: number
    batteryFuse: number
    ctrlFuse: number
    isolatorV: number
    isolatorA: number
    generatorKVA: number
    chargeA: number
    derate: number
    pwmFactor: number
    annualKWh: number
  }
}
