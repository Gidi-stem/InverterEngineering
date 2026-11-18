import type { Course } from '../types'
import { F5_M1 } from './m1'
import { F5_M2 } from './m2'
import { F5_M3 } from './m3'
import { F5_M4 } from './m4'

/**
 * F5 Measurement and Virtual Instruments. Phase 8. Teaches accuracy/uncertainty, measurement
 * categories, the multimeter, clamp meter, oscilloscope and specialist instruments (ESR, LCR,
 * insulation, thermal), each linked into the Phase 8 Virtual Instruments and Measurement
 * Engineering Laboratory (features/instruments).
 */
export const F5: Course = {
  id: 'F5',
  title: 'Measurement and Virtual Instruments',
  level: 'beginner',
  stage: 'foundation',
  summary: 'Accuracy and uncertainty, measurement categories, the multimeter, clamp meter, oscilloscope and specialist instruments, used on realistic simulated scenarios and the Phase 5 waveform engine.',
  prerequisites: ['F1', 'F2'],
  recommended: ['F3'],
  status: 'published',
  phase: 8,
  competency: 'CU-05',
  modules: [F5_M1, F5_M2, F5_M3, F5_M4],
  exam: {
    pass: 0.8,
    minutes: 45,
    attempts: 3,
    cooldownHours: 24,
    questions: [
      { id: 'e1', type: 'mcq', prompt: 'A reading that is repeatable but wrong is...', options: ['precise but not accurate', 'accurate but not precise', 'high resolution', 'uncalibrated'], answer: 0, explain: 'Repeatability is precision, not accuracy.' },
      { id: 'e2', type: 'numeric', prompt: 'A meter "± (1.0 % + 2 digits)", 0.01 Ω resolution, reads 4.00 Ω. Uncertainty (Ω)?', answer: 0.062, tol: 0.05, unit: 'Ω', explain: '1% of 4.00 = 0.04, plus 2×0.01 = 0.02 → 0.06 Ω.' },
      { id: 'e3', type: 'mcq', prompt: 'A distribution board measurement needs at minimum...', options: ['CAT III', 'CAT I', 'CAT II', 'No rating'], answer: 0, explain: 'Distribution level is CAT III.' },
      { id: 'e4', type: 'mcq', prompt: 'Voltage function, probes left in a current socket, connected across a live source: this is...', options: ['dangerous — a near-short through the meter', 'safe and correct', 'only a concern on AC', 'identical to the correct connection'], answer: 0, explain: 'The current socket is a near-zero-resistance shunt.' },
      { id: 'e5', type: 'mcq', prompt: 'Current function, probes left in the VΩ sockets: the meter reads...', options: ['close to zero, safe but wrong', 'the true current', 'FUSE', 'the supply voltage'], answer: 0, explain: 'High input impedance blocks current flow.' },
      { id: 'e6', type: 'mcq', prompt: 'A healthy diode on diode test reads approximately...', options: ['0.5–0.8 V forward, OL reverse', '0 V both directions', 'OL both directions', 'the supply voltage both directions'], answer: 0, explain: 'A healthy junction conducts forward and blocks reverse.' },
      { id: 'e7', type: 'mcq', prompt: 'Why must resistance, continuity and diode test be used on an isolated circuit?', options: ['They apply their own test voltage, disturbed by an external supply', 'They need mains power', 'They are only accurate when live', 'No reason; it is convention'], answer: 0, explain: 'The meter\'s own test source conflicts with external power.' },
      { id: 'e8', type: 'mcq', prompt: 'A clamp meter senses current by...', options: ['the magnetic field around a conductor', 'direct electrical contact', 'counting PWM pulses', 'measuring self-heating'], answer: 0, explain: 'The jaws form a magnetic sensing loop.' },
      { id: 'e9', type: 'mcq', prompt: 'Clamping both conductors of a loaded cable together gives...', options: ['a near-zero reading, misleadingly', 'the true current', 'double the true current', 'OL'], answer: 0, explain: 'Equal and opposite currents cancel.' },
      { id: 'e10', type: 'mcq', prompt: 'Inrush current at motor start is typically...', options: ['several times the steady running current, briefly', 'always less than running current', 'only present in DC motors', 'irrelevant to protection sizing'], answer: 0, explain: 'This is why motor circuits need delay-rated protection.' },
      { id: 'e11', type: 'numeric', prompt: 'A cycle spans 5 divisions at 4 ms/div. Frequency (Hz)?', answer: 50, tol: 0.02, unit: 'Hz', explain: 'T = 20 ms, f = 1/0.02 = 50 Hz.' },
      { id: 'e12', type: 'mcq', prompt: 'RMS of an ideal square wave equals...', options: ['its peak value', 'peak/√2', 'half its peak', 'zero'], answer: 0, explain: 'A square wave is at full amplitude for the whole cycle.' },
      { id: 'e13', type: 'mcq', prompt: 'A true-RMS meter differs from an average-sensing meter by...', options: ['computing actual RMS regardless of waveform shape', 'always reading higher', 'only working on DC', 'requiring a trigger'], answer: 0, explain: 'Average-sensing meters assume a sine shape.' },
      { id: 'e14', type: 'mcq', prompt: 'The waveform with the lowest THD is...', options: ['pure sine', 'square wave', 'modified sine', 'unfiltered PWM'], answer: 0, explain: 'A pure sine is essentially just its fundamental.' },
      { id: 'e15', type: 'mcq', prompt: 'A rising ESR in an electrolytic capacitor usually indicates...', options: ['an ageing capacitor, often before capacitance drops much', 'a healthy capacitor', 'a wrong voltage rating', 'nothing significant'], answer: 0, explain: 'ESR often rises first as a capacitor ages.' },
      { id: 'e16', type: 'mcq', prompt: 'Near-zero ESR with no measurable capacitance indicates...', options: ['a shorted capacitor', 'an excellent capacitor', 'an open capacitor', 'correct rating'], answer: 0, explain: 'Check ESR and capacitance together.' },
      { id: 'e17', type: 'mcq', prompt: 'A common guideline minimum for insulation resistance on a final circuit at 500 V DC is...', options: ['1 MΩ', '1 Ω', '1 kΩ', '10 Ω'], answer: 0, explain: 'A widely used general guideline.' },
      { id: 'e18', type: 'mcq', prompt: 'Why is the insulation resistance tester simulation-only in this course?', options: ['It intentionally applies a hazardous voltage to a circuit of unknown condition', 'It is not a real instrument', 'There is no safety concern', 'It only works on AC'], answer: 0, explain: 'That combination is exactly the hazard the simulation-only policy addresses.' },
      { id: 'e19', type: 'mcq', prompt: 'A shiny, low-emissivity surface on an infrared camera tends to...', options: ['under-read the true temperature', 'over-read the true temperature', 'read perfectly', 'disable the camera'], answer: 0, explain: 'Low emissivity causes under-reading unless corrected.' },
      { id: 'e20', type: 'mcq', prompt: 'Completing every exercise in this laboratory means a student is...', options: ['more competent at interpreting measurements, but not certified to work independently on live equipment', 'certified to work independently on live electrical equipment', 'exempt from further supervision', 'qualified as an electrician'], answer: 0, explain: 'Virtual exercises build judgement; they never substitute for supervised, qualified real-world training and certification.' },
    ],
  },
}
