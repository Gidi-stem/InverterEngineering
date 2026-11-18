import type { Course } from '../types'
import { F3_M1 } from './m1'
import { F3_M2 } from './m2'
import { F3_M3 } from './m3'
import { F3_M4 } from './m4'
import { F3_M5 } from './m5'

/**
 * F3 AC Electrical Fundamentals. Phase 8. Teaches alternating quantities, RMS, reactance and
 * impedance, AC power and power factor, harmonics, transformers and rectification — the AC
 * theory foundation that F5's Virtual Instruments laboratory, F4's components and P2's power
 * electronics all build on.
 */
export const F3: Course = {
  id: 'F3',
  title: 'AC Electrical Fundamentals',
  level: 'beginner',
  stage: 'foundation',
  summary: 'Alternating quantities, RMS, reactance and impedance, AC power and power factor, harmonics, transformers and rectification.',
  prerequisites: ['F2'],
  recommended: [],
  status: 'published',
  phase: 8,
  competency: 'CU-03',
  modules: [F3_M1, F3_M2, F3_M3, F3_M4, F3_M5],
  exam: {
    pass: 0.8,
    minutes: 50,
    attempts: 3,
    cooldownHours: 24,
    questions: [
      { id: 'e1', type: 'mcq', prompt: 'Why is power transmitted at high voltage?', options: ['To reduce current and resistive loss for the same power', 'Because generators can only make high voltage', 'To make it safer to touch', 'To reduce frequency'], answer: 0, explain: 'Loss = I²R; lower current at the same power sharply reduces loss.' },
      { id: 'e2', type: 'numeric', prompt: 'Period of a 50 Hz waveform (ms)?', answer: 20, tol: 0.01, unit: 'ms', explain: 'T = 1/50 = 20 ms.' },
      { id: 'e3', type: 'numeric', prompt: 'RMS of a pure sine with 100 V peak (V)?', answer: 70.7, tol: 0.01, unit: 'V', explain: '100/√2 = 70.7 V.' },
      { id: 'e4', type: 'mcq', prompt: 'RMS of an ideal square wave equals...', options: ['its peak value', 'peak/√2', 'half its peak', 'zero'], answer: 0, explain: 'A square wave is at full amplitude the whole cycle.' },
      { id: 'e5', type: 'mcq', prompt: 'Unfiltered SPWM, on an oscilloscope, looks like...', options: ['a fast train of varying-width pulses, not a smooth sine', 'a smooth sine directly', 'a plain square wave', 'a DC level'], answer: 0, explain: 'Filtering afterward produces the smooth sine.' },
      { id: 'e6', type: 'numeric', prompt: 'X_C of a 100 µF capacitor at 50 Hz (Ω, to 2 decimals)?', answer: 31.83, tol: 0.02, unit: 'Ω', explain: 'X_C = 1/(2π×50×100e-6) ≈ 31.83 Ω.' },
      { id: 'e7', type: 'mcq', prompt: 'As frequency rises, inductive reactance...', options: ['rises', 'falls', 'stays constant', 'becomes resistive'], answer: 0, explain: 'X_L = 2πfL.' },
      { id: 'e8', type: 'numeric', prompt: 'Impedance for R = 30 Ω, X = 40 Ω in series (Ω)?', answer: 50, tol: 0.01, unit: 'Ω', explain: '√(900+1600)=√2500=50 Ω.' },
      { id: 'e9', type: 'mcq', prompt: 'At resonance, net reactance is...', options: ['zero', 'maximum', 'infinite', 'equal to R always'], answer: 0, explain: 'X_L = X_C at resonance.' },
      { id: 'e10', type: 'numeric', prompt: 'Apparent power of 230 V rms at 10 A rms (VA)?', answer: 2300, tol: 0.01, unit: 'VA', explain: 'S = 230×10 = 2300 VA.' },
      { id: 'e11', type: 'numeric', prompt: 'Power factor for P = 1500 W, S = 2000 VA?', answer: 0.75, tol: 0.01, unit: '', explain: 'PF = 1500/2000 = 0.75.' },
      { id: 'e12', type: 'mcq', prompt: 'A lagging power factor is caused by...', options: ['net inductive reactance', 'net capacitive reactance', 'purely resistive loads', 'a fault'], answer: 0, explain: 'Inductive loads make current lag voltage.' },
      { id: 'e13', type: 'mcq', prompt: 'True power factor differs from displacement power factor by also including...', options: ['harmonic current distortion', 'supply frequency', 'ambient temperature', 'the meter brand'], answer: 0, explain: 'True PF accounts for phase shift and harmonic content.' },
      { id: 'e14', type: 'mcq', prompt: 'Over a full cycle, an ideal reactive load\'s net energy transfer is...', options: ['zero', 'positive', 'negative', 'equal to apparent power'], answer: 0, explain: 'Energy is stored and returned each cycle.' },
      { id: 'e15', type: 'numeric', prompt: 'Secondary voltage for N_p=800, N_s=40, V_p=230 V (V)?', answer: 11.5, tol: 0.01, unit: 'V', explain: 'V_s = 230×(40/800) = 11.5 V.' },
      { id: 'e16', type: 'mcq', prompt: 'Copper loss in a transformer winding scales with...', options: ['the square of load current', 'load current linearly', 'frequency only', 'core material only'], answer: 0, explain: 'P = I²R.' },
      { id: 'e17', type: 'mcq', prompt: 'Galvanic isolation means...', options: ['no direct conductive path between primary and secondary', 'a 1:1 voltage ratio', 'no magnetic core', 'no load connected'], answer: 0, explain: 'Only a magnetic link exists between the windings.' },
      { id: 'e18', type: 'mcq', prompt: 'A star winding connection provides a natural point for...', options: ['a neutral conductor', 'a centre tap', 'core lamination', 'leakage reactance'], answer: 0, explain: 'The common junction of the three windings.' },
      { id: 'e19', type: 'numeric', prompt: 'Ripple frequency from full-wave rectification of a 50 Hz input (Hz)?', answer: 100, tol: 0.01, unit: 'Hz', explain: 'Full-wave gives two pulses per cycle: 2×50=100 Hz.' },
      { id: 'e20', type: 'mcq', prompt: 'In a bridge rectifier, how many diodes conduct at any one instant?', options: ['two', 'one', 'four', 'zero'], answer: 0, explain: 'One pair conducts per half-cycle; the other pair blocks.' },
      { id: 'e21', type: 'numeric', prompt: 'Ripple voltage for I=2 A, f=100 Hz, C=4000 µF (V, to 2 decimals)?', answer: 5, tol: 0.03, unit: 'V', explain: 'ΔV=2/(100×4000e-6)=2/0.4=5 V.' },
    ],
  },
}
