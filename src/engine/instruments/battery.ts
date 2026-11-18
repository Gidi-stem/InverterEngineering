/**
 * Battery tester / capacity analyser engine. A genuine (if simplified — see the Phase 8 report)
 * equivalent-circuit model: V_loaded = OCV(SoC) − I·R_int, with a chemistry-specific open-circuit-
 * voltage curve and internal resistance, consistent with the battery/solar presets used in S2. This
 * is an educational approximation of a real cell, not a fabricated single number: changing SoC, load
 * current or chemistry changes the result the way a real battery would.
 */

export type BatteryChemistry = 'lead-acid' | 'lifepo4'

export interface BatteryPack {
  chemistry: BatteryChemistry
  nominalVoltage: number // V, per the pack (e.g. 12 V, 48 V)
  capacityAh: number
  /** Internal resistance at a healthy state, ohms, scaled to the pack voltage/capacity. */
  internalResistanceOhm: number
  /** 0–100. */
  stateOfChargePct: number
  /** A healthy pack has a factor of 1; an aged/degraded pack raises internal resistance and lowers capacity. */
  healthFactor: number
}

export const BATTERY_PRESETS: Record<string, BatteryPack> = {
  'lead-acid-12v-healthy': { chemistry: 'lead-acid', nominalVoltage: 12, capacityAh: 100, internalResistanceOhm: 0.015, stateOfChargePct: 80, healthFactor: 1 },
  'lead-acid-12v-aged': { chemistry: 'lead-acid', nominalVoltage: 12, capacityAh: 100, internalResistanceOhm: 0.015, stateOfChargePct: 80, healthFactor: 6 },
  'lifepo4-48v-healthy': { chemistry: 'lifepo4', nominalVoltage: 48, capacityAh: 100, internalResistanceOhm: 0.02, stateOfChargePct: 60, healthFactor: 1 },
  'lifepo4-48v-degraded': { chemistry: 'lifepo4', nominalVoltage: 48, capacityAh: 100, internalResistanceOhm: 0.02, stateOfChargePct: 60, healthFactor: 3.2 },
}

/** Open-circuit voltage as a fraction of nominal pack voltage, by chemistry and state of charge.
 * Lead-acid has a fairly linear OCV/SoC slope; LiFePO₄ is famously flat across most of its range and
 * only falls steeply near the empty and full ends — both curves are the real, well-known shape. */
function ocvFraction(chem: BatteryChemistry, socPct: number): number {
  const s = Math.min(100, Math.max(0, socPct)) / 100
  if (chem === 'lead-acid') return 0.917 + 0.083 * s // ≈ 1.0 at 100%, ≈ 0.917 (11.0/12) at 0%
  // LiFePO4: flat plateau ~1.0 between 15-95%, dropping off at the ends.
  if (s < 0.15) return 0.85 + (0.15 * (s / 0.15))
  if (s > 0.95) return 1.0 - 0.08 * ((s - 0.95) / 0.05)
  return 1.0
}

export interface BatteryReading {
  openCircuitVoltage: number
  loadedVoltage: number
  internalResistanceOhm: number
  voltageSagV: number
  dropPct: number
  verdict: 'healthy' | 'weak' | 'fail'
}

/** OCV and loaded voltage under a given discharge test current. */
export function readBattery(pack: BatteryPack, testCurrentA: number): BatteryReading {
  const ocv = pack.nominalVoltage * ocvFraction(pack.chemistry, pack.stateOfChargePct)
  const rInt = pack.internalResistanceOhm * pack.healthFactor
  const sag = testCurrentA * rInt
  const loaded = ocv - sag
  const dropPct = (sag / ocv) * 100
  const verdict: BatteryReading['verdict'] = dropPct < 5 ? 'healthy' : dropPct < 15 ? 'weak' : 'fail'
  return { openCircuitVoltage: ocv, loadedVoltage: loaded, internalResistanceOhm: rInt, voltageSagV: sag, dropPct, verdict }
}

export interface CapacityTestResult {
  durationHours: number
  measuredAh: number
  measuredWh: number
  ratedAh: number
  pctOfRated: number
}

/** Simulates a constant-current discharge test from the pack's current SoC down to a cutoff
 * voltage, by stepping SoC down and re-evaluating OCV each step (coulomb counting). */
export function simulateCapacityTest(pack: BatteryPack, dischargeCurrentA: number, cutoffVoltage: number): CapacityTestResult {
  const stepHours = 0.05
  let soc = pack.stateOfChargePct
  let ahOut = 0
  let whOut = 0
  const rInt = pack.internalResistanceOhm * pack.healthFactor
  const effectiveAh = pack.capacityAh / pack.healthFactor // an aged pack also holds less charge, not just more resistance
  for (let i = 0; i < 4000 && soc > 0; i++) {
    const ocv = pack.nominalVoltage * ocvFraction(pack.chemistry, soc)
    const loaded = ocv - dischargeCurrentA * rInt
    if (loaded <= cutoffVoltage) break
    ahOut += dischargeCurrentA * stepHours
    whOut += dischargeCurrentA * loaded * stepHours
    soc -= (dischargeCurrentA * stepHours * 100) / effectiveAh
  }
  return { durationHours: ahOut / dischargeCurrentA, measuredAh: ahOut, measuredWh: whOut, ratedAh: pack.capacityAh, pctOfRated: (ahOut / pack.capacityAh) * 100 }
}
