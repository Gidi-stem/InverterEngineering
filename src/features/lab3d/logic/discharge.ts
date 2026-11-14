import type { CapacitorBank } from '../../../types/domain'

/**
 * Capacitor-bank discharge through a resistance: first-order RC decay.
 *   V(t) = V₀·e^(−t/τ),  τ = R·C,  E(t) = ½·C·V(t)²,  I(t) = V(t)/R,  P(t) = V(t)²/R
 * Time to reach a threshold V_s: t = τ·ln(V₀/V_s).
 *
 * Assumptions: ideal capacitor (no ESR, no dielectric absorption), constant R, no other loads.
 * Dielectric absorption means a real capacitor can recover a few volts after discharge, which is
 * one reason the procedure always ends with a meter check and why banks are left shorted through
 * a resistor during long repairs.
 */
export const SAFE_V = 50

export interface DischargeMethod {
  id: string
  label: string
  ohms: number
  /** Continuous power rating of the resistor (W). */
  ratedW: number
  kind: 'bleeder' | 'tool' | 'short'
  description: string
}

export function methodsFor(bank: CapacitorBank): DischargeMethod[] {
  return [
    {
      id: 'bleeder',
      label: 'Wait for the built-in bleeder resistors',
      ohms: bank.bleederOhms,
      ratedW: 4,
      kind: 'bleeder',
      description: `The board's ${formatR(bank.bleederOhms)} bleeder network drains the bank automatically. Slow, and only works if the bleeders are intact.`,
    },
    { id: 'tool-470', label: 'Discharge tool: 470 Ω, 25 W wirewound', ohms: 470, ratedW: 25, kind: 'tool', description: 'Insulated probe with a power resistor. Fast and controlled.' },
    { id: 'tool-2k2', label: 'Discharge tool: 2.2 kΩ, 10 W', ohms: 2200, ratedW: 10, kind: 'tool', description: 'Smaller resistor. Slower, lower current, but less able to absorb energy.' },
    { id: 'short', label: 'Short the terminals with a screwdriver', ohms: 0.02, ratedW: 0, kind: 'short', description: 'A metal tool across the terminals (about 20 mΩ including contact resistance).' },
  ]
}

export function formatR(ohms: number) {
  return ohms >= 1000 ? `${+(ohms / 1000).toPrecision(3)} kΩ` : `${+ohms.toPrecision(3)} Ω`
}

export const tau = (bank: CapacitorBank, ohms: number) => ohms * bank.capacitanceF
export const voltageAt = (bank: CapacitorBank, ohms: number, t: number) => bank.initialV * Math.exp(-t / tau(bank, ohms))
export const energyAt = (bank: CapacitorBank, v: number) => 0.5 * bank.capacitanceF * v * v
export const timeToSafe = (bank: CapacitorBank, ohms: number, threshold = SAFE_V) => (bank.initialV <= threshold ? 0 : tau(bank, ohms) * Math.log(bank.initialV / threshold))

/** A wirewound resistor's single-pulse energy capability, simplified as rated power × 5 s of thermal mass. */
export const PULSE_SECONDS = 5

export interface DischargeAssessment {
  tauS: number
  tSafeS: number
  initialEnergyJ: number
  peakCurrentA: number
  peakPowerW: number
  pulseCapacityJ: number
  verdict: 'safe' | 'caution' | 'unsafe'
  notes: string[]
}

export function assess(bank: CapacitorBank, m: DischargeMethod): DischargeAssessment {
  const t = tau(bank, m.ohms)
  const e0 = energyAt(bank, bank.initialV)
  const iPk = bank.initialV / m.ohms
  const pPk = (bank.initialV * bank.initialV) / m.ohms
  const cap = m.ratedW * PULSE_SECONDS
  const notes: string[] = []
  let verdict: DischargeAssessment['verdict'] = 'safe'
  if (m.kind === 'short') {
    verdict = 'unsafe'
    notes.push(
      `Peak current ≈ ${Math.round(iPk).toLocaleString()} A: all ${e0.toFixed(1)} J is released in about ${(5 * t * 1e6).toFixed(0)} µs as an arc that can weld the tool, spray molten metal and damage the capacitor.`,
      'Never use a screwdriver. This lab refuses to run it as a valid method.',
    )
  } else {
    if (m.kind === 'tool' && e0 > cap) {
      verdict = 'caution'
      notes.push(`The bank's ${e0.toFixed(1)} J exceeds this resistor's single-pulse capacity (≈ ${cap} J): it will get very hot. Use a larger resistor or let it cool between banks.`)
    }
    if (m.kind === 'bleeder') notes.push(`Takes ${(timeToSafe(bank, m.ohms) / 60).toFixed(1)} minutes to fall below ${SAFE_V} V, and relies on the bleeders being intact: always verify with a meter.`)
    if (m.kind === 'tool') notes.push(`Peak current ${iPk < 1 ? (iPk * 1000).toFixed(0) + ' mA' : iPk.toFixed(2) + ' A'}, peak power ${pPk.toFixed(0)} W for a fraction of a second.`)
    if (bank.initialV <= SAFE_V) notes.push(`The bank starts at ${bank.initialV} V, below the ${SAFE_V} V touch threshold, but ${e0.toFixed(2)} J can still cause a damaging spark if shorted.`)
  }
  return { tauS: t, tSafeS: timeToSafe(bank, m.ohms), initialEnergyJ: e0, peakCurrentA: iPk, peakPowerW: pPk, pulseCapacityJ: cap, verdict, notes }
}

/** Advanced-level prediction check: within ±15 % of the true time to reach the safe threshold. */
export function predictionCorrect(bank: CapacitorBank, ohms: number, predictedS: number): boolean {
  const truth = timeToSafe(bank, ohms)
  if (truth === 0) return predictedS <= 1
  return Math.abs(predictedS - truth) / truth <= 0.15
}
