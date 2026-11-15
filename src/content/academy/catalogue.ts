import type { AcademyModule, Competency, Course, Level, Stage } from './types'
import { F1 } from './f1'
import { F2 } from './f2'
import { S1 } from './s1'
import { S2 } from './s2'

/**
 * The programme (docs/CURRICULUM-BLUEPRINT.md §1–2). Scheduled courses list their syllabus only:
 * they are shown as "scheduled" with the phase that authors them, never as empty lesson pages.
 */
type Syllabus = [title: string, lessons: string[]][]

/** Recommended (advisory) prior study per scheduled course; never a lock. */
const RECOMMENDED: Record<string, string[]> = { F4: ['F3'], F5: ['F3'], P1: ['F4'], P2: ['F4'], P4: ['F4'], P5: ['S2'], S3: ['S2', 'F5'] }

export function scheduled(id: string, title: string, level: Level, stage: Stage, phase: number, prerequisites: string[], competency: string, summary: string, syllabus: Syllabus, recommended: string[] = []): Course {
  const modules: AcademyModule[] = syllabus.map(([mt, lessons], mi) => ({
    id: `${id}.M${mi + 1}`,
    title: mt,
    summary: '',
    lessons: lessons.map((lt, li) => ({ id: `${id}.M${mi + 1}.L${li + 1}`, title: lt, minutes: 30 })),
    practicals: [],
  }))
  return { id, title, level, stage, summary, prerequisites, recommended: RECOMMENDED[id] ?? recommended, status: 'scheduled', phase, competency, modules }
}

export const COURSES: Course[] = [
  F1,
  F2,
  scheduled('F3', 'AC Electrical Fundamentals', 'beginner', 'foundation', 8, ['F2'], 'CU-03', 'Alternating quantities, RMS, reactance and impedance, AC power and power factor, harmonics, transformers and rectification.', [
    ['Alternating quantities', ['Why AC is used', 'Sine waves: amplitude, period, frequency, phase', 'Peak, average and RMS', 'Non-sinusoidal waveforms']],
    ['Reactance and impedance', ['Capacitive reactance', 'Inductive reactance', 'Impedance and phasors', 'Resonance and filters']],
    ['AC power', ['Real, reactive and apparent power', 'Power factor and current lag', 'Harmonics and THD', 'Energy returned by reactive loads']],
    ['Transformers', ['Mutual induction and turns ratio', 'Ideal and real transformers', 'Isolation and safety', 'Transformer connection']],
    ['Rectification', ['Half-wave and full-wave rectification', 'The bridge rectifier', 'Smoothing and ripple']],
  ]),
  scheduled('F4', 'Electronic Components for Inverter Engineering', 'beginner', 'foundation', 9, ['F2'], 'CU-04', 'Passive, semiconductor, magnetic, protection, control, sensing and thermal components: how they work, their ratings, how to test them and how to identify faults and replacements.', [
    ['Passive components', ['Resistors', 'Capacitors: electrolytic, film and ceramic', 'Inductors', 'Testing passive components']],
    ['Semiconductor devices', ['Introduction to semiconductors', 'Diodes', 'Rectification with diodes', 'MOSFETs', 'IGBTs', 'Gate drivers', 'Switching characteristics', 'Component testing', 'Fault identification', 'Component replacement']],
    ['Magnetic components', ['Magnetic circuits and saturation', 'Transformers in inverters', 'Output and filter inductors', 'Testing windings']],
    ['Protection and switching devices', ['Fuses', 'Circuit breakers', 'Relays and contactors', 'Relays versus semiconductor switches']],
    ['Control, sensing and thermal', ['PWM controllers and microcontrollers', 'Voltage and current sensing', 'Heat sinks, fans and thermal resistance', 'PCBs, connectors and terminals']],
  ]),
  scheduled('F5', 'Measurement and Virtual Instruments', 'beginner', 'foundation', 8, ['F1', 'F2'], 'CU-05', 'Accuracy and uncertainty, measurement categories, the multimeter, clamp meter, oscilloscope and specialist instruments, used on live simulations.', [
    ['Measurement basics', ['Accuracy, resolution and uncertainty', 'Measurement categories and probe safety', 'Recording results']],
    ['Multimeter and clamp meter', ['Voltage, current, resistance, continuity and diode test', 'Clamp meters and DC/AC current']],
    ['Oscilloscope', ['Time base, volts per division and trigger', 'Measuring frequency, duty and RMS', 'Spectrum and THD']],
    ['Specialist instruments', ['Insulation resistance testing', 'LCR and ESR meters', 'Thermal imaging and temperature probes']],
  ]),
  scheduled('P1', 'Circuit Analysis and Construction', 'intermediate', 'practitioner', 10, ['F2'], 'CU-06', 'Reading schematics, nodal analysis, Thevenin and Norton equivalents, non-linear devices, building and fault-finding circuits, and switching circuits up to the H-bridge.', [
    ['Reading schematics', ['Symbols and pin identification', 'Nodes and the connection graph', 'Reference (ground) and measurement']],
    ['Analysis methods', ['Nodal analysis by hand', 'Thevenin and Norton equivalents', 'Superposition', 'Non-linear devices and piecewise-linear models']],
    ['Construction practice', ['Building and verifying circuits', 'Fault finding from symptoms', 'Validation messages and what they mean']],
    ['Switching circuits', ['MOSFET switching circuits', 'The half-bridge', 'The H-bridge', 'Basic inverter architecture']],
  ]),
  scheduled('P2', 'Power Electronics Fundamentals', 'intermediate', 'practitioner', 10, ['F3', 'P1'], 'CU-07', 'Switching conversion, PWM and DC-DC converters, switching devices in practice, losses and thermal design, bridges with inductive loads, filters and EMI.', [
    ['Switching principles', ['Why switch instead of dissipate', 'PWM and averaging', 'Duty cycle and DC-DC conversion']],
    ['Switching devices in practice', ['MOSFET switching', 'Conduction and switching losses', 'Thermal design', 'Gate drive and dead time']],
    ['Bridges', ['Half-bridge operation', 'Full H-bridge operation', 'Inductive loads and freewheeling']],
    ['Filters and EMI', ['LC filters and corner frequency', 'Ripple and filter sizing', 'Introduction to EMI and layout']],
  ]),
  scheduled('P3', 'Inverter Principles', 'intermediate', 'practitioner', 10, ['P2'], 'CU-08', 'From DC to AC: square-wave, modified-sine and sine-wave inverters, SPWM, filtering, regulation, waveform quality, efficiency and ratings.', [
    ['From DC to AC', ['The H-bridge and polarity reversal', 'Square-wave inverters', 'Modified sine and harmonic content']],
    ['Sine-wave inverters', ['SPWM generation', 'Output filtering', 'Feedback and regulation']],
    ['Ratings and performance', ['Waveform families and RMS', 'Harmonics, THD and filtering', 'Efficiency, losses and heat', 'Watts, VA and battery current']],
  ]),
  scheduled('P4', 'Inside a Real Inverter', 'intermediate', 'practitioner', 9, ['F1'], 'CU-09', 'A guided tour of two real inverter architectures in the 3D laboratory, safe disassembly and reassembly, and component identification on the boards.', [
    ['Architecture tour', ['Enclosure, terminals and earthing', 'The power stage', 'Magnetics', 'Control electronics', 'Protection and sensing']],
    ['Safe disassembly and reassembly', ['Isolation and discharge in practice', 'Disassembly sequence and why', 'Reassembly and functional test']],
    ['Identification', ['Recognising components on a board', 'Comparing a square-wave and a hybrid inverter']],
  ]),
  scheduled('P5', 'Battery Engineering and Energy Storage', 'intermediate', 'practitioner', 11, ['F1', 'F2'], 'CU-10', 'Battery technologies, capacity and state of charge, DC system design, cable sizing, fusing, charging profiles, battery management and energy storage, taught in the Phase 11 battery laboratory.', [
    ['Battery technology', ['Lead-acid, LiFePO₄ and lithium-ion', 'Capacity, C-rate and Peukert', 'State of charge and depth of discharge']],
    ['DC system design', ['Cable sizing and voltage drop', 'Fusing and isolation', 'Series and parallel banks, balancing']],
    ['Charging and protection', ['Charge profiles', 'BMS and low-voltage disconnect', 'Battery safety and maintenance']],
  ]),
  S1,
  S2,
  scheduled('S3', 'Installation and Commissioning', 'advanced', 'specialist', 12, ['F1', 'F2'], 'CU-13', 'Planning, DC and AC installation, earthing, pre-energisation tests, staged commissioning, records and the role of standards and certification.', [
    ['Planning', ['Site survey and load assessment', 'Equipment location, ventilation and clearances', 'Single-line diagrams']],
    ['Installation', ['DC wiring and protection', 'AC wiring, earthing and RCDs', 'PV mounting and DC isolation']],
    ['Commissioning', ['Pre-energisation checks', 'Staged energisation', 'Commissioning records and handover']],
    ['Compliance', ['Standards and certification', 'Documentation and labelling']],
  ]),
  scheduled('S4', 'Advanced Diagnostics and Professional Repair', 'advanced', 'specialist', 13, ['F1', 'F2'], 'CU-14', 'Systematic testing with virtual instruments, the troubleshooting method, seventeen repair scenarios from the repair workshop and professional repair practice: root-cause analysis, verification and return to service.', [
    ['Systematic testing', ['Test plans', 'Measuring with virtual instruments', 'Interpreting results']],
    ['Troubleshooting method', ['Symptom, hypothesis, test, conclusion', 'Fault trees', 'Safety during diagnosis']],
    ['Repair workshop', ['Seventeen repair scenarios (one lesson each)']],
    ['Professional repair practice', ['Component-level versus board-level repair', 'Root-cause analysis and failure reports', 'Verification and return to service']],
  ], ['F5', 'P4', 'S1']),
  scheduled('S5', 'Maintenance, Standards and Professional Practice', 'advanced', 'specialist', 14, ['S1', 'S2', 'S3', 'S4'], 'CU-15', 'Preventive maintenance of inverter, battery and PV systems; how standards and certification work; documentation, ethics and working within one’s competence; and the capstone project with the competency assessments and final examination.', [
    ['Preventive maintenance', ['Inspection schedules', 'Fans, filters, terminals and torque', 'Battery and PV maintenance']],
    ['Standards and professional practice', ['How standards and certification work', 'Documentation, records and ethics', 'Working within one’s competence and supervised training']],
    ['Capstone and certification', ['Capstone brief and requirements', 'Design, simulation and report', 'Practical competency tasks, final examination and virtual-competency record']],
  ]),
]

export const COURSE_BY_ID: Record<string, Course> = Object.fromEntries(COURSES.map((c) => [c.id, c]))

export const COMPETENCIES: Competency[] = [
  { id: 'CU-01', title: 'Apply electrical safety, isolation and discharge procedures', courses: ['F1'] },
  { id: 'CU-02', title: 'Analyse DC circuits and energy storage', courses: ['F2'] },
  { id: 'CU-03', title: 'Analyse AC circuits, power and transformers', courses: ['F3'] },
  { id: 'CU-04', title: 'Identify, test and select inverter components', courses: ['F4'] },
  { id: 'CU-05', title: 'Use measurement instruments safely and correctly', courses: ['F5'] },
  { id: 'CU-06', title: 'Build and verify circuits from schematics', courses: ['P1'] },
  { id: 'CU-07', title: 'Explain and analyse power-electronic switching circuits', courses: ['P2'] },
  { id: 'CU-08', title: 'Explain inverter operation and waveform quality', courses: ['P3'] },
  { id: 'CU-09', title: 'Disassemble and reassemble an inverter safely', courses: ['P4'] },
  { id: 'CU-10', title: 'Specify and protect battery DC systems', courses: ['P5'] },
  { id: 'CU-11', title: 'Design, assemble and test inverters to a specification', courses: ['S1'] },
  { id: 'CU-12', title: 'Design solar and hybrid systems', courses: ['S2'] },
  { id: 'CU-13', title: 'Plan installation and commissioning', courses: ['S3'] },
  { id: 'CU-14', title: 'Diagnose and repair inverter faults', courses: ['S4'] },
  { id: 'CU-15', title: 'Maintain systems and practise professionally to standards', courses: ['S5'] },
]

export const VIRTUAL_COMPETENCY_NOTE = 'Virtual competency. Real-world practice requires supervised physical training and locally required qualifications.'

export function findLesson(lessonId: string) {
  for (const c of COURSES)
    for (const m of c.modules) {
      const l = m.lessons.find((x) => x.id === lessonId)
      if (l) return { course: c, module: m, lesson: l }
    }
  return undefined
}
