import { describe, expect, it } from 'vitest'
import { CLAMP_SCENARIO_BY_ID, readClamp } from './clamp'
import { LCR_CASE_BY_ID, measureLcr } from './esrLcr'
import { BATTERY_PRESETS, readBattery, simulateCapacityTest } from './battery'
import { INSULATION_SCENARIOS, minimumAcceptableMegohms, readInsulation } from './insulation'
import { availableProcedures, evaluateComponentTest } from './componentTester'

describe('clamp meter engine', () => {
  const scenario = CLAMP_SCENARIO_BY_ID['inverter-output']
  it('reads the correct current with a single conductor clamped', () => {
    expect(readClamp(scenario, 'single-conductor').display).toBe('6.52 A rms')
  })
  it('both conductors clamped cancels the field and reads ~0', () => {
    const r = readClamp(scenario, 'both-conductors')
    expect(r.ok).toBe(false)
    expect(r.display).toContain('0.00')
  })
  it('open jaws read 0', () => {
    expect(readClamp(scenario, 'open-not-clamped').ok).toBe(false)
  })
  it('motor inrush current is well above steady run current', () => {
    const motor = CLAMP_SCENARIO_BY_ID['motor-start']
    const atStart = readClamp(motor, 'single-conductor', 0)
    expect(parseFloat(atStart.display)).toBeCloseTo(24.8, 1)
  })
})

describe('ESR/LCR engine', () => {
  it('matches the component library reference values exactly', () => {
    expect(measureLcr(LCR_CASE_BY_ID['cap-good'], 'ESR').display).toBe('0.04 Ω')
    expect(measureLcr(LCR_CASE_BY_ID['cap-good'], 'C').display).toBe('452 µF')
    expect(measureLcr(LCR_CASE_BY_ID['ind-good'], 'L').display).toBe('1.18 mH')
  })
  it('an open capacitor reads OL', () => {
    expect(measureLcr(LCR_CASE_BY_ID['cap-open'], 'C').ok).toBe(false)
    expect(measureLcr(LCR_CASE_BY_ID['cap-open'], 'C').display).toBe('OL')
  })
  const ohms = (s: string) => (s.includes('mΩ') ? parseFloat(s) / 1000 : parseFloat(s))
  it('capacitor impedance falls as frequency rises (X_C = 1/2πfC)', () => {
    const low = measureLcr(LCR_CASE_BY_ID['cap-good'], 'Z', 100)
    const high = measureLcr(LCR_CASE_BY_ID['cap-good'], 'Z', 20000)
    expect(ohms(high.display)).toBeLessThan(ohms(low.display))
  })
  it('inductor impedance rises as frequency rises (X_L = 2πfL)', () => {
    const low = measureLcr(LCR_CASE_BY_ID['ind-good'], 'Z', 100)
    const high = measureLcr(LCR_CASE_BY_ID['ind-good'], 'Z', 20000)
    expect(ohms(high.display)).toBeGreaterThan(ohms(low.display))
  })
})

describe('battery tester engine', () => {
  it('a healthy pack sags little under load', () => {
    const r = readBattery(BATTERY_PRESETS['lead-acid-12v-healthy'], 10)
    expect(r.verdict).toBe('healthy')
    expect(r.loadedVoltage).toBeLessThan(r.openCircuitVoltage)
  })
  it('an aged pack of the same chemistry sags more under the same load', () => {
    const healthy = readBattery(BATTERY_PRESETS['lead-acid-12v-healthy'], 10)
    const aged = readBattery(BATTERY_PRESETS['lead-acid-12v-aged'], 10)
    expect(aged.voltageSagV).toBeGreaterThan(healthy.voltageSagV)
    expect(aged.verdict).not.toBe('healthy')
  })
  it('capacity test on a degraded pack yields less than rated Ah', () => {
    const cap = simulateCapacityTest(BATTERY_PRESETS['lifepo4-48v-degraded'], 10, 44)
    expect(cap.pctOfRated).toBeLessThan(100)
    expect(cap.measuredAh).toBeGreaterThan(0)
  })
})

describe('insulation tester (simulation only)', () => {
  it('new dry cable passes the 500 V test', () => {
    const good = INSULATION_SCENARIOS.find((s) => s.id === 'new-cable')!
    expect(readInsulation(good, 500).ok).toBe(true)
  })
  it('a damaged cable fails against the minimum guideline', () => {
    const bad = INSULATION_SCENARIOS.find((s) => s.id === 'rodent-damage')!
    expect(readInsulation(bad, 500).ok).toBe(false)
    expect(minimumAcceptableMegohms(500)).toBe(1)
  })
  it('a direct earth fault reads ~0', () => {
    const fault = INSULATION_SCENARIOS.find((s) => s.id === 'earth-fault')!
    expect(readInsulation(fault, 500).display).toContain('0.00')
  })
})

describe('component tester engine', () => {
  it('reuses the real capacitor test procedure and passes an all-good run', () => {
    const proc = availableProcedures('capacitor')[0]
    const verdict = evaluateComponentTest({ componentId: 'capacitor', procedure: proc, chosenReadingPerStep: proc.steps.map((s) => s.readings.find((r) => r.good)!) })
    expect(verdict.verdict).toBe('good')
  })
  it('flags a fault when any step reading is a bad one', () => {
    const proc = availableProcedures('capacitor')[0]
    const verdict = evaluateComponentTest({ componentId: 'capacitor', procedure: proc, chosenReadingPerStep: proc.steps.map((s) => s.readings.find((r) => !r.good) ?? s.readings[0]) })
    expect(verdict.verdict).toBe('fault')
    expect(verdict.failingSteps.length).toBeGreaterThan(0)
  })
})
