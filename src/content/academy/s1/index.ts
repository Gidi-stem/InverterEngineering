import type { Course } from '../types'
import { S1_M1 } from './m1'
import { S1_M2 } from './m2'
import { S1_M3 } from './m3'
import { S1_M4 } from './m4'
import { S1_M5 } from './m5'
import { S1_M6 } from './m6'

/** S1 Inverter Design and Construction: fully authored in Phase 6. */
export const S1: Course = {
  id: 'S1',
  title: 'Inverter Design and Construction',
  level: 'advanced',
  stage: 'specialist',
  summary: 'Design, assemble and test eight inverters, from a bare H-bridge to a hybrid inverter. You will learn the design method and the safety principles, then build square-wave, modified-sine, pure-sine, push-pull, high-frequency, solar and hybrid inverters. Every calculation is explained. Assembly is verified on the electrical connection graph, and every design is tested in the simulator.',
  prerequisites: ['F1', 'F2'],
  recommended: ['P2', 'P3', 'P4'],
  status: 'published',
  phase: 6,
  competency: 'CU-11',
  modules: [S1_M1, S1_M2, S1_M3, S1_M4, S1_M5, S1_M6],
  exam: {
    pass: 0.7,
    minutes: 60,
    attempts: 3,
    cooldownHours: 24,
    questions: [
      { id: 'e1', type: 'numeric', prompt: 'A 1.2 kW load with PF 0.8 on 230 V. Output current (A rms)?', answer: 6.52, tol: 0.01, unit: 'A', explain: 'S = 1500 VA; I = 1500/230 = 6.52 A.' },
      { id: 'e2', type: 'numeric', prompt: 'A 24 V inverter delivers 1000 W at 93 % efficiency. DC current at the 21 V cut-off (A)?', answer: 51.2, tol: 0.01, unit: 'A', explain: '1075.3/21 = 51.2 A.' },
      { id: 'e3', type: 'mcq', prompt: 'Standard fuse sizes …50, 60, 80, 100 A. Fuse for I_dc,max = 51.2 A?', options: ['80 A', '60 A', '50 A', '100 A'], answer: 0, explain: '1.25 × 51.2 = 64 A → 80 A.' },
      { id: 'e4', type: 'numeric', prompt: 'Minimum V_DSS for a 48 V full bridge (V_max = 57.6 V) with the 1.5× rule (V)?', answer: 86.4, tol: 0.01, unit: 'V', explain: '1.5 × 57.6.' },
      { id: 'e5', type: 'mcq', prompt: 'At 12 V and 5 kHz the better bridge switch is…', options: ['MOSFET', 'IGBT', 'thyristor', 'relay'], answer: 0, explain: 'An IGBT’s V_CE(sat) wastes a large fraction of 12 V.' },
      { id: 'e6', type: 'numeric', prompt: 'Energy stored in 680 µF at 360 V (J)?', answer: 44.06, tol: 0.01, unit: 'J', explain: '½ × 680 × 10⁻⁶ × 360² = 44.1 J.' },
      { id: 'e7', type: 'mcq', prompt: 'Which pair of switches must never be on together in an H-bridge?', options: ['Q1 and Q2 (same leg)', 'Q1 and Q4', 'Q3 and Q2', 'Q2 and Q4'], answer: 0, explain: 'Same-leg switches short the bus (shoot-through).' },
      { id: 'e8', type: 'numeric', prompt: 'Peak of the fundamental of a ±48 V square wave (V)?', answer: 61.12, tol: 0.01, unit: 'V', explain: '(4/π) × 48 = 61.1 V.' },
      { id: 'e9', type: 'numeric', prompt: 'RMS of a stepped wave with 325 V pulses and 120° conduction (V)?', answer: 265.4, tol: 0.01, unit: 'V', explain: '325 × √(2/3) = 265.4 V.' },
      { id: 'e10', type: 'mcq', prompt: 'At 90° conduction, the THD of a modified sine is about…', options: ['48 %', '31 %', '5 %', '0 %'], answer: 0, explain: 'The same as a square wave; the minimum (31 %) is at 120°.' },
      { id: 'e11', type: 'numeric', prompt: 'Bipolar SPWM with m = 0.9: duty at ωt = 270° (%)?', answer: 5, tol: 0.01, unit: '%', explain: '(1 − 0.9)/2 = 0.05.' },
      { id: 'e12', type: 'numeric', prompt: 'Average dead-time error: t_d = 1.5 µs, f_sw = 10 kHz, V_dc = 24 V (V)?', answer: 0.72, tol: 0.01, unit: 'V', explain: '2 × 1.5 × 10⁻⁶ × 10⁴ × 24 = 0.72 V.' },
      { id: 'e13', type: 'numeric', prompt: 'Filter capacitance on the secondary: C_ref = 2000 µF on the primary, n = 20 (µF)?', answer: 5, tol: 0.01, unit: 'µF', explain: '2000/400 = 5 µF.' },
      { id: 'e14', type: 'numeric', prompt: 'Carrier attenuation of an LC filter with f_c = 400 Hz at f_sw = 8 kHz (×)?', answer: 400, tol: 0.01, unit: '×', explain: '(8000/400)² = 400.' },
      { id: 'e15', type: 'mcq', prompt: 'A regulated sine inverter outputs 290 V and does not respond to battery changes. The fault is most likely…', options: ['a disconnected voltage sensor', 'an open filter capacitor', 'a tripped breaker', 'a reversed bus capacitor'], answer: 0, explain: 'The regulator drives m to its maximum.' },
      { id: 'e16', type: 'numeric', prompt: 'Off-state voltage of a 24 V push-pull switch at 28.8 V (V)?', answer: 57.6, tol: 0.01, unit: 'V', explain: '2 × 28.8.' },
      { id: 'e17', type: 'numeric', prompt: 'Minimum HV bus for a 230 V output at m = 0.95 (V)?', answer: 342.4, tol: 0.01, unit: 'V', explain: '√2 × 230 / 0.95.' },
      { id: 'e18', type: 'numeric', prompt: 'MPPT buck duty for V_mp = 35.2 V and a 24 V battery?', answer: 0.682, tol: 0.01, unit: '', explain: '24/35.2.' },
      { id: 'e19', type: 'mcq', prompt: 'In a hybrid inverter with changeover relays, the grid and the inverter output are…', options: ['never connected together', 'paralleled to share the load', 'connected only at night', 'connected through the charger'], answer: 0, explain: 'Unsynchronised sources must never be paralleled.' },
      { id: 'e20', type: 'multi', prompt: 'Which statements are true of a design that passes every simulated test? (select all)', options: ['It is a successful educational design', 'It is certified for construction', 'Real construction needs datasheet-verified parts and physical testing', 'Mains-voltage work requires qualified people'], answers: [0, 2, 3], explain: 'Simulation never certifies a design.' },
    ],
  },
}
