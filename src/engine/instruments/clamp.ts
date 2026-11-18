/**
 * Clamp meter engine. A clamp meter infers current from the magnetic field around a SINGLE
 * current-carrying conductor — it never needs to break the circuit. The classic student mistake is
 * clamping both conductors of a cable together: their fields cancel (equal and opposite current),
 * so the meter reads ~0 even though real current is flowing.
 */

export interface ClampScenario {
  id: string
  title: string
  description: string
  steadyCurrentRms: number
  acFrequencyHz?: number
  /** Present for scenarios where a motor/transformer inrush is the teaching point. */
  inrushPeakCurrent?: number
  inrushDecayMs?: number
}

export const CLAMP_SCENARIOS: ClampScenario[] = [
  {
    id: 'inverter-output',
    title: 'Inverter AC output feeding a 1.5 kW load',
    description: 'Single live conductor of the inverter output cable, 230 V rms, 50 Hz.',
    steadyCurrentRms: 6.52,
    acFrequencyHz: 50,
  },
  {
    id: 'solar-array-string',
    title: 'DC string from a solar array (DC-capable clamp)',
    description: 'One DC conductor from a 3-panel series string into the charge controller.',
    steadyCurrentRms: 9.1,
  },
  {
    id: 'motor-start',
    title: 'Induction motor starting (inrush)',
    description: 'A 750 W single-phase motor at the moment of starting, before it reaches run speed.',
    steadyCurrentRms: 3.4,
    acFrequencyHz: 50,
    inrushPeakCurrent: 24.8,
    inrushDecayMs: 400,
  },
]

export const CLAMP_SCENARIO_BY_ID: Record<string, ClampScenario> = Object.fromEntries(CLAMP_SCENARIOS.map((s) => [s.id, s]))

export interface ClampResult {
  ok: boolean
  display: string
  note: string
}

export type ClampPlacement = 'single-conductor' | 'both-conductors' | 'open-not-clamped'

/** `tMs` lets the UI sweep across a motor-start transient; irrelevant scenarios ignore it. */
export function readClamp(scenario: ClampScenario, placement: ClampPlacement, tMs = 0): ClampResult {
  if (placement === 'open-not-clamped') return { ok: false, display: '0.00 A', note: 'The jaws are not fully closed around the conductor. A clamp meter needs a closed magnetic loop to sense current — reads zero (or an unstable value) until the jaws click shut around a single conductor.' }
  if (placement === 'both-conductors') return { ok: false, display: '≈ 0.00 A', note: "Both the live and the return (or neutral) conductor are inside the jaws. Their currents are equal and opposite, so their magnetic fields cancel and the meter reads close to zero — even though real current is flowing in the cable. Clamp only ONE conductor to measure the current it carries." }
  let i = scenario.steadyCurrentRms
  if (scenario.inrushPeakCurrent && tMs < (scenario.inrushDecayMs ?? 0)) {
    const frac = tMs / (scenario.inrushDecayMs ?? 1)
    i = scenario.inrushPeakCurrent * (1 - frac) + scenario.steadyCurrentRms * frac
  }
  return { ok: true, display: `${i.toFixed(2)} A ${scenario.acFrequencyHz ? 'rms' : 'DC'}`, note: scenario.inrushPeakCurrent && tMs < (scenario.inrushDecayMs ?? 0) ? 'Inrush: starting current is far above the steady run current, which is why motor circuits need slow-blow fuses or motor-rated breakers, not instant-trip ones.' : 'Correct: single conductor clamped, jaws fully closed.' }
}
