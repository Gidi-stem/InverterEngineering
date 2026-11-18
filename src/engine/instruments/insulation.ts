/**
 * Insulation resistance tester — SIMULATION AND SAFETY INSTRUCTION ONLY, as required for Phase 8.
 * A real insulation tester applies a DC test voltage (commonly 250/500/1000 V) between a conductor
 * and earth/another conductor and reads the resulting leakage resistance in MΩ. This module never
 * drives anything real; it returns representative readings for named insulation conditions so
 * students learn what "good", "damp" and "damaged" look like and the safety procedure around the
 * test, without any live high-voltage step.
 */

export type InsulationCondition = 'good' | 'damp' | 'damaged' | 'short'

export interface InsulationScenario {
  id: string
  condition: InsulationCondition
  label: string
  description: string
  megohms: number | null // null = essentially a dead short, reads ~0
}

export const INSULATION_SCENARIOS: InsulationScenario[] = [
  { id: 'new-cable', condition: 'good', label: 'New PVC-insulated cable, dry', description: 'Healthy insulation, properly terminated.', megohms: 980 },
  { id: 'damp-conduit', condition: 'damp', label: 'Cable run through a damp conduit', description: 'Moisture ingress lowers insulation resistance well below a healthy new cable, but it is not yet failed.', megohms: 4.2 },
  { id: 'rodent-damage', condition: 'damaged', label: 'Insulation damaged (rodent/abrasion)', description: 'Physical damage to the insulation has created a partial leakage path to earth.', megohms: 0.6 },
  { id: 'earth-fault', condition: 'short', label: 'Conductor in direct contact with earth', description: 'A hard fault: the conductor and earth are effectively joined.', megohms: null },
]

export type TestVoltageV = 250 | 500 | 1000

/** Minimum acceptable insulation resistance by circuit test voltage, per common low-voltage wiring
 * guidance (BS 7671 / IEC 60364 style thresholds used for teaching): 1 MΩ at the standard 500 V DC
 * test for a final circuit. This module teaches the rule; it is not a substitute for the applicable
 * regulation in the student's jurisdiction. */
export function minimumAcceptableMegohms(_testVoltage: TestVoltageV): number {
  return 1
}

export interface InsulationResult {
  ok: boolean
  display: string
  note: string
}

const SAFETY_PRECONDITIONS = ['Isolate the circuit and lock off the supply.', 'Prove the circuit dead with a proving unit before and after.', 'Disconnect anything that cannot withstand the test voltage (electronics, surge arrestors, some sensors).', 'Discharge the circuit (and any capacitors) before and after the test — the test itself leaves a charge on the insulation’s capacitance.']

export function describeSafetyProcedure(): string[] {
  return SAFETY_PRECONDITIONS
}

export function readInsulation(scenario: InsulationScenario, testVoltage: TestVoltageV): InsulationResult {
  if (scenario.megohms === null) return { ok: false, display: '0.00 MΩ', note: 'Effectively a dead short to earth. Do not energise this circuit. Locate and repair the fault before any further test.' }
  const min = minimumAcceptableMegohms(testVoltage)
  const ok = scenario.megohms >= min
  return { ok, display: `${scenario.megohms.toFixed(scenario.megohms < 10 ? 2 : 0)} MΩ at ${testVoltage} V DC`, note: ok ? `At or above the ${min} MΩ guideline minimum for this test voltage: acceptable.` : `Below the ${min} MΩ guideline minimum: this circuit should not be energised until the cause is found and corrected.` }
}
