export * from './dmm'
export * from './clamp'
export * from './scope'
export * from './esrLcr'
export * from './battery'
export * from './insulation'
export * from './componentTester'

import { DMM_SCENARIOS } from './dmm'
import { CLAMP_SCENARIOS } from './clamp'
import { LCR_CASES } from './esrLcr'
import { BATTERY_PRESETS } from './battery'
import { INSULATION_SCENARIOS } from './insulation'

/** Scenario ids available per instrument, used to validate ToolLink#scenario references in content. */
export const INSTRUMENT_SCENARIO_IDS: Record<string, string[]> = {
  dmm: DMM_SCENARIOS.map((s) => s.id),
  clamp: CLAMP_SCENARIOS.map((s) => s.id),
  scope: ['square', 'modified-sine', 'pure-sine', 'pwm', 'rectified'],
  esr: LCR_CASES.filter((c) => c.kind === 'capacitor').map((c) => c.id),
  lcr: LCR_CASES.map((c) => c.id),
  battery: Object.keys(BATTERY_PRESETS),
  insulation: INSULATION_SCENARIOS.map((s) => s.id),
  'component-tester': [],
}
