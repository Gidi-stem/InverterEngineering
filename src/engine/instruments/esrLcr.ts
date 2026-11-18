/**
 * ESR and LCR meter engine. Good-component values are taken directly from the component library's
 * own test-procedure reference data (`content/components/testing.ts`, ids `cap-esr` and
 * `inductor-lcr`) so a student sees the identical numbers on this instrument and on the component
 * reference page — genuine reuse, not a second invented data set. Impedance at the chosen test
 * frequency is computed from the same reactance formulas taught in F3.M2 (X_C = 1/2πfC, X_L = 2πfL),
 * so the LCR meter's frequency-dependence is real physics, not a lookup table.
 */

export type LcrComponentKind = 'capacitor' | 'inductor'
export type LcrCondition = 'good' | 'degraded' | 'open' | 'shorted'
export type LcrMode = 'C' | 'L' | 'ESR' | 'Z' | 'DCR'

export interface LcrCase {
  id: string
  kind: LcrComponentKind
  condition: LcrCondition
  label: string
  /** Farads for capacitors, Henries for inductors. Undefined where the reading is simply OL/erratic. */
  value?: number
  /** ESR (capacitor) or DC resistance (inductor), ohms. */
  seriesR?: number
}

// Values match content/components/testing.ts 'cap-esr' (good 452 µF / 0.04 Ω, aged 210 µF / 1.6 Ω)
// and 'inductor-lcr' (good 1.18 mH / 0.03 Ω, shorted-turns 0.42 mH) exactly.
export const LCR_CASES: LcrCase[] = [
  { id: 'cap-good', kind: 'capacitor', condition: 'good', label: '470 µF electrolytic, healthy', value: 452e-6, seriesR: 0.04 },
  { id: 'cap-degraded', kind: 'capacitor', condition: 'degraded', label: '470 µF electrolytic, dried out', value: 210e-6, seriesR: 1.6 },
  { id: 'cap-open', kind: 'capacitor', condition: 'open', label: '470 µF electrolytic, open circuit', seriesR: undefined },
  { id: 'cap-shorted', kind: 'capacitor', condition: 'shorted', label: '470 µF electrolytic, shorted', value: 0, seriesR: 0.002 },
  { id: 'ind-good', kind: 'inductor', condition: 'good', label: '1.2 mH output choke, healthy', value: 1.18e-3, seriesR: 0.03 },
  { id: 'ind-degraded', kind: 'inductor', condition: 'degraded', label: '1.2 mH choke, shorted turns', value: 0.42e-3, seriesR: 0.025 },
  { id: 'ind-open', kind: 'inductor', condition: 'open', label: '1.2 mH choke, broken winding', seriesR: undefined },
]

export const LCR_CASE_BY_ID: Record<string, LcrCase> = Object.fromEntries(LCR_CASES.map((c) => [c.id, c]))

export interface LcrResult {
  ok: boolean
  display: string
  note: string
}

const TAU = Math.PI * 2

export function measureLcr(c: LcrCase, mode: LcrMode, testFrequencyHz = 1000): LcrResult {
  if (mode === 'C' && c.kind !== 'capacitor') return { ok: false, display: 'n/a', note: 'This case is an inductor: select L, ESR, Z or DCR.' }
  if ((mode === 'L' || mode === 'DCR') && c.kind !== 'inductor') return { ok: false, display: 'n/a', note: 'This case is a capacitor: select C, ESR or Z.' }
  if (mode === 'ESR' && c.kind !== 'capacitor') return { ok: false, display: 'n/a', note: 'ESR is measured on capacitors. For an inductor, DC resistance (DCR) is the equivalent health check.' }

  if (c.condition === 'open' || c.value === undefined) return { ok: false, display: 'OL', note: `Open circuit: ${c.kind === 'capacitor' ? 'an open electrolytic reads no capacitance and an unstable or infinite ESR' : 'a broken winding reads no inductance and OL on the DC-resistance check'}.` }

  if (mode === 'C') return c.condition === 'good' ? { ok: true, display: `${(c.value! * 1e6).toFixed(0)} µF`, note: 'Within tolerance of the marked value.' } : { ok: false, display: `${(c.value! * 1e6).toFixed(0)} µF`, note: c.condition === 'shorted' ? 'A shorted capacitor often reads an erratic or near-zero capacitance with a very low ESR — treat any near-zero ESR reading as a possible short, not a healthy low-ESR part.' : 'Significantly below the marked value: the dielectric has dried out. Replace.' }

  if (mode === 'L') return c.condition === 'good' ? { ok: true, display: `${(c.value! * 1e3).toFixed(2)} mH`, note: 'Within tolerance of the marked value.' } : { ok: false, display: `${(c.value! * 1e3).toFixed(2)} mH`, note: 'Far below the marked value: shorted turns reduce the effective inductance. Replace.' }

  if (mode === 'ESR') return c.condition === 'good' ? { ok: true, display: `${c.seriesR!.toFixed(2)} Ω`, note: 'Low ESR for a large electrolytic: healthy.' } : c.condition === 'shorted' ? { ok: false, display: `${c.seriesR!.toFixed(3)} Ω`, note: 'Near-zero ESR together with no measurable capacitance points to a shorted capacitor, not a good one — always cross-check ESR against the capacitance reading.' } : { ok: false, display: `${c.seriesR!.toFixed(2)} Ω`, note: 'High ESR: the capacitor can no longer absorb switching ripple current. This is the single most common cause of inverter output ripple and intermittent resets. Replace the whole bank.' }

  if (mode === 'DCR') return c.condition === 'good' ? { ok: true, display: `${c.seriesR!.toFixed(2)} Ω`, note: 'Winding continuous, resistance as expected.' } : { ok: false, display: `${c.seriesR!.toFixed(2)} Ω`, note: 'Resistance alone does not catch shorted turns — compare with the inductance reading too.' }

  // mode === 'Z': |Z| = sqrt(X^2 + R^2), the same impedance formula taught in F3.M2.
  const omega = TAU * testFrequencyHz
  const x = c.kind === 'capacitor' ? 1 / (omega * c.value!) : omega * c.value!
  const z = Math.sqrt(x * x + (c.seriesR ?? 0) ** 2)
  return { ok: c.condition === 'good', display: `${z < 1 ? (z * 1000).toFixed(1) + ' mΩ' : z.toFixed(2) + ' Ω'} at ${testFrequencyHz} Hz`, note: `Z = √(X² + R²); here X = ${x.toFixed(3)} Ω from the ${c.kind === 'capacitor' ? 'capacitance' : 'inductance'} reading at this frequency. Impedance falls with frequency for a capacitor and rises with frequency for an inductor — this is why the same part filters differently at 50 Hz mains ripple and at a 20 kHz switching frequency.` }
}
