import type { Course } from '../types'
import { F1_M1 } from './m1'
import { F1_M2 } from './m2'
import { F1_M3 } from './m3'
import { F1_M4 } from './m4'

/**
 * F1 Electrical Safety and Fundamentals. Mandatory before any practical
 * laboratory activity involving electrical systems (see gates.ts).
 */
export const F1: Course = {
  id: 'F1',
  title: 'Electrical Safety and Fundamentals',
  level: 'beginner',
  stage: 'foundation',
  summary: 'The mandatory first course: how electricity harms people, where energy is stored, safe isolation and proving dead, protection, earthing and safe workshop practice. Passing F1 (80 %) opens the practical laboratories.',
  prerequisites: [],
  status: 'published',
  phase: 7,
  competency: 'CU-01',
  modules: [F1_M1, F1_M2, F1_M3, F1_M4],
  exam: {
    pass: 0.8,
    minutes: 45,
    attempts: 3,
    cooldownHours: 24,
    questions: [
      { id: 'e1', type: 'numeric', prompt: 'A 230 V supply drives current through a body path of 1150 Ω. Current (mA)?', answer: 200, tol: 0.01, unit: 'mA', explain: '230/1150 = 0.2 A = 200 mA: far above the fibrillation threshold.' },
      { id: 'e2', type: 'mcq', prompt: 'Which quantity most directly determines the harm from an electric shock?', options: ['The current through the body and its duration', 'The voltage alone', 'The wire colour', 'The power rating of the supply'], answer: 0, explain: 'Current and duration (and path) determine the effect; voltage drives the current.' },
      { id: 'e3', type: 'mcq', prompt: 'Why are DC arcs harder to extinguish than AC arcs?', options: ['DC current never passes through zero', 'DC voltage is always higher', 'DC arcs are colder', 'AC has no arcs'], answer: 0, explain: 'AC passes zero twice per cycle, giving the arc a chance to go out.' },
      { id: 'e4', type: 'numeric', prompt: 'A 12.8 V battery with 8 mΩ internal resistance is short-circuited. Current (A)?', answer: 1600, tol: 0.01, unit: 'A', explain: '12.8/0.008 = 1600 A.' },
      { id: 'e5', type: 'numeric', prompt: 'Energy stored in 2200 µF at 400 V (J)?', answer: 176, tol: 0.01, unit: 'J', explain: '½ × 0.0022 × 160 000 = 176 J.' },
      { id: 'e6', type: 'numeric', prompt: 'Time for 1000 µF with a 100 kΩ bleeder to fall from 400 V to 50 V (s)?', answer: 207.9, tol: 0.02, unit: 's', explain: 'τ = 100 s; t = 100 × ln 8 = 207.9 s.' },
      { id: 'e7', type: 'mcq', prompt: 'A grid-tied PV inverter is switched off at its AC breaker during the day. The PV cables to the inverter are…', options: ['still live from the array', 'dead', 'dead after 1 s', 'only live at night'], answer: 0, explain: 'A PV array produces voltage whenever it is lit.' },
      { id: 'e8', type: 'mcq', prompt: 'What is back-feed?', options: ['Energy reaching a supposedly dead circuit from another source, such as an inverter or generator', 'A feedback loop in a controller', 'Reverse polarity on a battery', 'A fan blowing backwards'], answer: 0, explain: 'Back-feed energises circuits from an unexpected direction.' },
      { id: 'e9', type: 'mcq', prompt: 'Which is the correct start of a safe-isolation procedure?', options: ['Identify every source supplying the equipment', 'Prove dead', 'Remove the cover', 'Discharge the capacitors'], answer: 0, explain: 'Sources must be identified before they can be isolated.' },
      { id: 'e10', type: 'mcq', prompt: 'A non-contact voltage detector shows no voltage. This means…', options: ['nothing conclusive: prove dead with a verified two-pole tester', 'the circuit is dead', 'the circuit is DC', 'the RCD has tripped'], answer: 0, explain: 'Non-contact detectors are screening tools only.' },
      { id: 'e11', type: 'multi', prompt: 'Proving dead on a single-phase AC circuit tests which combinations? (select all)', options: ['L–N', 'L–E', 'N–E', 'Only the one you are working on'], answers: [0, 1, 2], explain: 'All three combinations.' },
      { id: 'e12', type: 'mcq', prompt: 'Why is the tester re-checked on the proving unit after testing?', options: ['To prove it did not fail during the test', 'To recharge it', 'It is optional', 'To calibrate it'], answer: 0, explain: 'A failed tester shows false “dead” readings.' },
      { id: 'e13', type: 'numeric', prompt: 'Largest discharge resistor to bring 470 µF from 400 V to 50 V within 10 s (kΩ)?', answer: 10.23, tol: 0.03, unit: 'kΩ', explain: 'R = 10 / (470 × 10⁻⁶ × ln 8) = 10.23 kΩ.' },
      { id: 'e14', type: 'mcq', prompt: 'Two technicians work on the same isolated circuit. The isolator carries…', options: ['two personal locks', 'one shared lock', 'a tag only', 'no lock'], answer: 0, explain: 'Each worker fits their own lock.' },
      { id: 'e15', type: 'numeric', prompt: 'Fuse for a 70 A maximum current with the 1.25 margin; sizes 80/100/125 A (A)?', answer: 100, tol: 0.001, unit: 'A', explain: '1.25 × 70 = 87.5 → 100 A.' },
      { id: 'e16', type: 'mcq', prompt: 'A 100 A fuse protects a cable rated 80 A. This is…', options: ['wrong: I_n must not exceed I_z', 'correct', 'correct for DC only', 'correct if the fuse is slow'], answer: 0, explain: 'I_b ≤ I_n ≤ I_z.' },
      { id: 'e17', type: 'numeric', prompt: 'Earth-fault current with U₀ = 230 V and Z_s = 1.0 Ω (A)?', answer: 230, tol: 0.01, unit: 'A', explain: '230/1.0 = 230 A.' },
      { id: 'e18', type: 'mcq', prompt: 'An RCD protects against…', options: ['leakage current to earth, including through a person', 'line-to-neutral contact', 'overload of the cable', 'battery short circuits'], answer: 0, explain: 'It detects the difference between line and neutral currents.' },
      { id: 'e19', type: 'mcq', prompt: 'In the hierarchy of controls, which is applied first?', options: ['Elimination (for example, working dead)', 'PPE', 'Warning signs', 'Training'], answer: 0, explain: 'Elimination is the most effective control.' },
      { id: 'e20', type: 'mcq', prompt: 'Which meter category is the minimum for measurements in a distribution board?', options: ['CAT III', 'CAT I', 'CAT II', 'Any'], answer: 0, explain: 'Distribution level is CAT III.' },
    ],
  },
}
