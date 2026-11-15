import { MODULE_BY_ID } from './pv'
import type { Load, SolarSpec } from './types'

/**
 * Example load profiles and system specifications for the solar laboratory. Load figures are
 * typical appliance values for learning; site figures are illustrative design-month values.
 */
const L = (id: string, name: string, watts: number, qty: number, windows: [number, number][], opts: Partial<Pick<Load, 'duty' | 'surgeW' | 'ac'>> = {}): Load => ({ id, name, watts, qty, windows, duty: opts.duty ?? 1, surgeW: opts.surgeW ?? watts, ac: opts.ac ?? true })

export const LOAD_LIBRARY: Load[] = [
  L('led', 'LED lamp', 8, 1, [[18, 23]]),
  L('fridge', 'Refrigerator (A-class)', 120, 1, [[0, 24]], { duty: 0.4, surgeW: 600 }),
  L('freezer', 'Chest freezer', 100, 1, [[0, 24]], { duty: 0.45, surgeW: 500 }),
  L('tv', 'LED television', 80, 1, [[19, 22]]),
  L('phone', 'Phone charger', 10, 1, [[18, 22]]),
  L('laptop', 'Laptop', 60, 1, [[9, 13]]),
  L('fan', 'Ceiling fan', 50, 1, [[12, 17]]),
  L('pump', 'Water pump 0.75 kW', 750, 1, [[6, 7]], { surgeW: 2250 }),
  L('router', 'Wi-Fi router', 10, 1, [[0, 24]]),
  L('iron', 'Clothes iron', 1000, 1, [[10, 10.5]]),
  L('microwave', 'Microwave oven', 1100, 1, [[7, 7.25], [19, 19.25]]),
  L('washer', 'Washing machine (cold wash)', 500, 1, [[10, 11]], { surgeW: 1000 }),
  L('vaccine', 'Vaccine refrigerator', 60, 1, [[0, 24]], { duty: 0.5, surgeW: 300 }),
  L('dc-light', '12 V LED light (DC)', 5, 1, [[18, 23]], { ac: false }),
]

const home: Load[] = [
  { ...LOAD_LIBRARY[0], qty: 8 },
  LOAD_LIBRARY[1],
  LOAD_LIBRARY[3],
  { ...LOAD_LIBRARY[4], qty: 4 },
  LOAD_LIBRARY[5],
  { ...LOAD_LIBRARY[6], qty: 2 },
  LOAD_LIBRARY[7],
  LOAD_LIBRARY[8],
]

const base: Omit<SolarSpec, 'type' | 'loads' | 'module' | 'battery' | 'controller' | 'controllerMaxV' | 'autonomy' | 'generator'> = {
  vsys: 0,
  site: { name: 'Illustrative tropical site, design month', psh: 4.5, tMin: 12, tMax: 35 },
  mpptMinV: 120,
  inverterEff: 0.9,
  inverterSurge: 2,
  soiling: 0.95,
  wiring: 0.97,
  mismatch: 0.98,
  routePv: 15,
  routeCtrl: 3,
  routeInv: 2,
  dropPv: 0.03,
  dropDc: 0.02,
  genStart: 0.35,
  genStop: 0.9,
  reserve: 0.3,
  exportAllowed: false,
  gridOffset: 1,
}

export interface SolarPreset {
  id: string
  title: string
  summary: string
  spec: SolarSpec
}

export const SOLAR_PRESETS: SolarPreset[] = [
  {
    id: 'offgrid-home',
    title: 'Off-grid rural home (LiFePO₄, MPPT)',
    summary: 'Lighting, refrigerator, TV, fans, a laptop and a water pump with a large starting current; two days of autonomy.',
    spec: { ...base, type: 'off-grid', loads: home, module: MODULE_BY_ID['mono-400'], battery: { chem: 'lifepo4', unitV: 12.8, unitAh: 200, dod: 0.8, eff: 0.95 }, autonomy: 2, controller: 'mppt', controllerMaxV: 150, generator: false },
  },
  {
    id: 'clinic-hybrid',
    title: 'Rural clinic with generator back-up',
    summary: 'A vaccine refrigerator, lighting, a laptop and a sterilising load, with a generator that starts automatically on low battery.',
    spec: {
      ...base,
      type: 'off-grid',
      loads: [{ ...LOAD_LIBRARY[0], qty: 12, windows: [[17, 23], [5, 7]] }, LOAD_LIBRARY[12], LOAD_LIBRARY[1], { ...LOAD_LIBRARY[5], qty: 2, windows: [[8, 16]] }, { ...LOAD_LIBRARY[6], qty: 3 }, LOAD_LIBRARY[8], { ...LOAD_LIBRARY[9], name: 'Steriliser 1 kW', windows: [[9, 10]] }],
      module: MODULE_BY_ID['mono-550'],
      battery: { chem: 'lead-acid', unitV: 12, unitAh: 200, dod: 0.5, eff: 0.85 },
      autonomy: 1.5,
      controller: 'mppt',
      controllerMaxV: 150,
      generator: true,
      genStart: 0.55,
      genStop: 0.9,
    },
  },
  {
    id: 'hybrid-home',
    title: 'Grid-connected home with battery (hybrid)',
    summary: 'Self-consumption with a battery that also covers grid outages; surplus PV is exported where allowed.',
    spec: { ...base, type: 'hybrid', vsys: 48, loads: [...home, LOAD_LIBRARY[10], LOAD_LIBRARY[11]], module: MODULE_BY_ID['mono-400'], battery: { chem: 'lifepo4', unitV: 51.2, unitAh: 100, dod: 0.8, eff: 0.95 }, autonomy: 1, controller: 'mppt', controllerMaxV: 450, generator: false, exportAllowed: true },
  },
  {
    id: 'grid-home',
    title: 'Grid-tied home (no battery)',
    summary: 'An array that offsets the daily load on average; no back-up during outages (anti-islanding).',
    spec: { ...base, type: 'grid-tied', loads: [...home, LOAD_LIBRARY[10], LOAD_LIBRARY[11]], module: MODULE_BY_ID['mono-400'], battery: { chem: 'lifepo4', unitV: 51.2, unitAh: 100, dod: 0.8, eff: 0.95 }, autonomy: 0, controller: 'mppt', controllerMaxV: 600, generator: false, exportAllowed: true, gridOffset: 1 },
  },
  {
    id: 'cabin-pwm',
    title: 'Small 12 V cabin (PWM controller)',
    summary: 'LED lights and phone charging from a 12 V AGM battery with “12 V” modules and a PWM controller.',
    spec: { ...base, type: 'off-grid', vsys: 12, loads: [{ ...LOAD_LIBRARY[13], qty: 6 }, { ...LOAD_LIBRARY[4], qty: 2 }, { ...LOAD_LIBRARY[3], windows: [[19, 21]] }], module: MODULE_BY_ID['mono-100-12v'], battery: { chem: 'lead-acid', unitV: 12, unitAh: 100, dod: 0.5, eff: 0.85 }, autonomy: 2, controller: 'pwm', controllerMaxV: 50, generator: false, inverterSurge: 2 },
  },
]
export const SOLAR_PRESET_BY_ID: Record<string, SolarPreset> = Object.fromEntries(SOLAR_PRESETS.map((p) => [p.id, p]))
