import type { Course } from '../types'
import { F2_M1 } from './m1'
import { F2_M2 } from './m2'
import { F2_M3 } from './m3'
import { F2_M4 } from './m4'
import { F2_M5 } from './m5'

/**
 * F2 DC Electrical Systems and Fundamentals. Mandatory before DC circuit construction,
 * battery engineering and solar/battery practical work (see gates.ts); its own
 * practicals (ckt-01…03, sim-01, sim-02) need F1 only.
 */
export const F2: Course = {
  id: 'F2',
  title: 'DC Electrical Systems and Fundamentals',
  level: 'beginner',
  stage: 'foundation',
  summary: 'Charge, current, voltage and units; resistance, Ohm’s law, power and energy; series, parallel and Kirchhoff analysis; capacitors and inductors in time; batteries, DC wiring, voltage drop, fusing, polarity, diodes and LEDs. Passing F2 opens DC construction, battery and solar practicals.',
  prerequisites: ['F1'],
  status: 'published',
  phase: 7,
  competency: 'CU-02',
  modules: [F2_M1, F2_M2, F2_M3, F2_M4, F2_M5],
  exam: {
    pass: 0.7,
    minutes: 60,
    attempts: 3,
    cooldownHours: 24,
    questions: [
      { id: 'e1', type: 'numeric', prompt: 'Current when 1800 C passes in 10 minutes (A)?', answer: 3, tol: 0.01, unit: 'A', explain: '1800/600.' },
      { id: 'e2', type: 'numeric', prompt: '0.0047 F in µF?', answer: 4700, tol: 0.001, unit: 'µF', explain: '0.0047 × 10⁶.' },
      { id: 'e3', type: 'mcq', prompt: 'A voltmeter is connected…', options: ['across the component', 'in series', 'only to earth', 'between two loops'], answer: 0, explain: 'Voltage is between two points.' },
      { id: 'e4', type: 'numeric', prompt: 'Round-trip resistance of a 4 m route of 10 mm² copper (mΩ)?', answer: 13.76, tol: 0.01, unit: 'mΩ', explain: '0.0172 × 8/10.' },
      { id: 'e5', type: 'numeric', prompt: 'Current in 680 Ω at 17 V (mA)?', answer: 25, tol: 0.01, unit: 'mA', explain: '17/680.' },
      { id: 'e6', type: 'numeric', prompt: 'Power in 47 Ω carrying 0.2 A (W)?', answer: 1.88, tol: 0.01, unit: 'W', explain: '0.04 × 47.' },
      { id: 'e7', type: 'numeric', prompt: 'Battery input power for 1500 W output at η = 0.94 (W)?', answer: 1596, tol: 0.01, unit: 'W', explain: '1500/0.94 = 1595.7 W.' },
      { id: 'e8', type: 'numeric', prompt: 'Total of 220 Ω, 330 Ω and 470 Ω in series (Ω)?', answer: 1020, tol: 0.01, unit: 'Ω', explain: 'They add.' },
      { id: 'e9', type: 'numeric', prompt: 'Divider output: 30 V, R₁ = 27 kΩ, R₂ = 3 kΩ (V)?', answer: 3, tol: 0.01, unit: 'V', explain: '30 × 3/30.' },
      { id: 'e10', type: 'numeric', prompt: '60 Ω ∥ 30 Ω (Ω)?', answer: 20, tol: 0.01, unit: 'Ω', explain: '1800/90.' },
      { id: 'e11', type: 'numeric', prompt: '2 Ω in series with (3 Ω ∥ 6 Ω) across 12 V: supply current (A)?', answer: 3, tol: 0.01, unit: 'A', explain: '3∥6 = 2 Ω; 12/4 = 3 A.' },
      { id: 'e12', type: 'mcq', prompt: 'Kirchhoff’s current law states that…', options: ['current into a node equals current out', 'voltages around a loop add to zero', 'V = IR', 'power is conserved'], answer: 0, explain: 'Conservation of charge.' },
      { id: 'e13', type: 'numeric', prompt: 'τ for 4.7 kΩ and 470 µF (s)?', answer: 2.209, tol: 0.01, unit: 's', explain: '4700 × 470 × 10⁻⁶.' },
      { id: 'e14', type: 'numeric', prompt: 'Capacitor voltage after 1τ charging from 0 to 20 V (V)?', answer: 12.64, tol: 0.01, unit: 'V', explain: '20 × 0.632.' },
      { id: 'e15', type: 'numeric', prompt: 'τ for 60 mH and 20 Ω (ms)?', answer: 3, tol: 0.01, unit: 'ms', explain: '0.06/20.' },
      { id: 'e16', type: 'mcq', prompt: 'Switching off an inductive load with no freewheeling path causes…', options: ['a large voltage spike across the switch', 'a current spike in the supply', 'nothing', 'the inductor to charge'], answer: 0, explain: 'v = L·di/dt.' },
      { id: 'e17', type: 'numeric', prompt: 'Terminal voltage: E = 51.2 V, r = 20 mΩ, I = 60 A (V)?', answer: 50, tol: 0.01, unit: 'V', explain: '51.2 − 1.2.' },
      { id: 'e18', type: 'numeric', prompt: 'Runtime: 4.8 kWh bank, 50 % DoD, 400 W load, η = 0.9 (h)?', answer: 5.4, tol: 0.01, unit: 'h', explain: '2400 × 0.9/400.' },
      { id: 'e19', type: 'numeric', prompt: 'Minimum cable: 24 V, 100 A, 3 m route, 2 % drop (mm²)?', answer: 21.5, tol: 0.01, unit: 'mm²', explain: '0.0172 × 6 × 100/0.48 = 21.5 → 25 mm².' },
      { id: 'e20', type: 'numeric', prompt: 'LED resistor: 12 V supply, V_f = 2.0 V, 10 mA (Ω)?', answer: 1000, tol: 0.01, unit: 'Ω', explain: '10/0.01.' },
    ],
  },
}
