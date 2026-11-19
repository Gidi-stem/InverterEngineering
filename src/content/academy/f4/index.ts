import type { Course } from '../types'
import { F4_M1 } from './m1'
import { F4_M2 } from './m2'
import { F4_M3 } from './m3'
import { F4_M4 } from './m4'
import { F4_M5 } from './m5'

/**
 * F4 Electronic Components for Inverter Engineering. Phase 9. Passive, semiconductor, magnetic,
 * protection, control, sensing and thermal components: how they work, their ratings, how to test
 * them and how to identify faults and replacements. Integrates with the Component Library, the 3D
 * Dissection Laboratory and the Repair Workshop throughout.
 */
export const F4: Course = {
  id: 'F4',
  title: 'Electronic Components for Inverter Engineering',
  level: 'beginner',
  stage: 'foundation',
  summary: 'Passive, semiconductor, magnetic, protection, control, sensing and thermal components: how they work, their ratings, how to test them and how to identify faults and replacements.',
  prerequisites: ['F2'],
  recommended: ['F3'],
  status: 'published',
  phase: 9,
  competency: 'CU-04',
  modules: [F4_M1, F4_M2, F4_M3, F4_M4, F4_M5],
  exam: {
    pass: 0.8,
    minutes: 60,
    attempts: 3,
    cooldownHours: 24,
    questions: [
      { id: 'e1', type: 'numeric', prompt: 'Power dissipated (W) by a 22 Ω resistor carrying 0.5 A?', answer: 5.5, tol: 0.02, unit: 'W', explain: 'P=I²R=0.25×22=5.5 W.' },
      { id: 'e2', type: 'mcq', prompt: 'A capacitor\'s ESR mainly causes...', options: ['self-heating from ripple current, worsening with age', 'an increase in capacitance over time', 'reverse polarity protection', 'a decrease in voltage rating'], answer: 0, explain: 'ESR dissipates I²·ESR as heat; it typically rises as electrolytic capacitors age.' },
      { id: 'e3', type: 'mcq', prompt: 'An inductor driven beyond its saturation current rating...', options: ['loses most of its inductance, and current rises sharply', 'gains additional inductance', 'becomes a perfect open circuit', 'converts to a capacitor'], answer: 0, explain: 'The core can no longer contribute additional flux once saturated.' },
      { id: 'e4', type: 'mcq', prompt: 'A PN junction conducts easily when...', options: ['forward biased beyond its barrier voltage', 'reverse biased', 'at absolute zero temperature', 'disconnected'], answer: 0, explain: 'Forward bias shrinks the depletion barrier.' },
      { id: 'e5', type: 'numeric', prompt: 'MOSFET conduction loss (W) for R_DS(on)=15 mΩ at 20 A RMS?', answer: 6, tol: 0.02, unit: 'W', explain: '20²×0.015=400×0.015=6 W.' },
      { id: 'e6', type: 'mcq', prompt: 'IGBT conduction loss is best modelled as...', options: ['P ≈ V_CE(sat) × I', 'P = I²R', 'P = V²/R', 'zero, always'], answer: 0, explain: 'A nearly constant saturation voltage, unlike a resistance.' },
      { id: 'e7', type: 'mcq', prompt: 'Dead time in a bridge leg exists mainly to prevent...', options: ['shoot-through (both switches on at once)', 'excessive gate charge', 'reverse polarity', 'ESR rise'], answer: 0, explain: 'Both switches on at once would short the DC bus.' },
      { id: 'e8', type: 'numeric', prompt: 'Switching loss (W) for (E_on+E_off)=40 µJ at 20 kHz?', answer: 0.8, tol: 0.02, unit: 'W', explain: '40e-6×20000=0.8 W.' },
      { id: 'e9', type: 'mcq', prompt: 'A device reading 0.00 V in both diode-test directions, where one should show a diode drop, has failed...', options: ['short', 'open', 'with normal leakage', 'within tolerance'], answer: 0, explain: 'No blocking behaviour in either direction.' },
      { id: 'e10', type: 'mcq', prompt: 'Before fitting a non-identical replacement MOSFET, which rating is it safe to skip checking?', options: ['None — voltage, current, on-state loss and gate characteristics should all be checked', 'Current rating', 'Voltage rating', 'Gate characteristics'], answer: 0, explain: 'Every relevant rating should be checked; none is safe to skip.' },
      { id: 'e11', type: 'mcq', prompt: 'HF transformers are typically much smaller than LF transformers of equal power rating mainly because...', options: ['higher frequency needs less flux swing per cycle for the same induced voltage', 'HF transformers carry less power', 'HF transformers use no core material', 'HF transformers operate at lower voltage only'], answer: 0, explain: 'Faraday\'s law links EMF to frequency × flux swing.' },
      { id: 'e12', type: 'numeric', prompt: 'LC filter corner frequency (Hz, to nearest whole number) for L=2 mH, C=10 µF?', answer: 1126, tol: 0.02, unit: 'Hz', explain: 'f_c=1/(2π√(0.002×10e-6))≈1126 Hz.' },
      { id: 'e13', type: 'mcq', prompt: 'Shorted turns in a winding are best detected by...', options: ['a reduced inductance reading, even with healthy resistance', 'resistance alone', 'visual inspection only', 'core colour'], answer: 0, explain: 'Resistance can look normal while inductance drops.' },
      { id: 'e14', type: 'mcq', prompt: 'A fuse\'s breaking capacity must exceed...', options: ['the circuit\'s prospective fault current', 'only its own continuous current rating', 'the ambient temperature', 'the supply frequency'], answer: 0, explain: 'Otherwise it can fail destructively instead of interrupting safely.' },
      { id: 'e15', type: 'mcq', prompt: 'A breaker\'s magnetic trip mechanism responds to...', options: ['a severe short-circuit current, nearly instantaneously', 'a slow, gradual overload', 'low voltage', 'reversed polarity'], answer: 0, explain: 'The solenoid\'s field is only strong enough to trip directly at high current.' },
      { id: 'e16', type: 'mcq', prompt: 'A relay cannot be used for kilohertz-rate PWM switching mainly because...', options: ['its mechanical switching speed is orders of magnitude too slow', 'it conducts in only one direction', 'it has no coil', 'it requires isolation'], answer: 0, explain: 'Millisecond mechanical movement versus microsecond switching needs.' },
      { id: 'e17', type: 'mcq', prompt: 'A closed feedback loop corrects the switching pattern based on...', options: ['the difference between desired reference and measured output', 'ambient temperature only', 'a fixed pattern that never changes', 'switching frequency alone'], answer: 0, explain: 'Error-driven correction is the basis of closed-loop control.' },
      { id: 'e18', type: 'numeric', prompt: 'Current (A) from a 10 mΩ shunt showing 0.25 V?', answer: 25, tol: 0.02, unit: 'A', explain: 'I=0.25/0.01=25 A.' },
      { id: 'e19', type: 'numeric', prompt: 'Junction temperature (°C) for P=10 W, R_th=3 °C/W, T_a=30 °C?', answer: 60, tol: 0.02, unit: '°C', explain: '30+10×3=60 °C.' },
      { id: 'e20', type: 'mcq', prompt: 'Derating below absolute maximum ratings is...', options: ['standard practice preserving real-world margin', 'unnecessary caution', 'only relevant to voltage, never temperature', 'a sign of poor design'], answer: 0, explain: 'Margin accounts for tolerance, ambient variation and degradation.' },
      { id: 'e21', type: 'mcq', prompt: 'A degraded connector or terminal is most reliably found by...', options: ['a voltage-drop measurement across the joint under load', 'a no-load continuity check alone', 'visual inspection only', 'checking the circuit\'s overall current draw'], answer: 0, explain: 'No-load continuity can look healthy even with significant contact resistance.' },
      { id: 'e22', type: 'mcq', prompt: 'A near-immediate repeat failure of a like-for-like replacement semiconductor most strongly suggests...', options: ['an unaddressed external root cause, not coincidence', 'a bad batch of parts, nothing more', 'the component family is universally unreliable', 'the voltage rating was too high'], answer: 0, explain: 'Root-cause investigation, not just replacement, is needed.' },
    ],
  },
}
