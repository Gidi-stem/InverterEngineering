import type { AcademyModule, Competency, Course, Level, Stage } from './types'
import { S1 } from './s1'

/**
 * The programme (docs/CURRICULUM-BLUEPRINT.md §1–2). Scheduled courses list their syllabus only:
 * they are shown as "scheduled" with the phase that authors them, never as empty lesson pages.
 */
type Syllabus = [title: string, lessons: string[]][]

function scheduled(id: string, title: string, level: Level, stage: Stage, phase: number, prerequisites: string[], competency: string, summary: string, syllabus: Syllabus): Course {
  const modules: AcademyModule[] = syllabus.map(([mt, lessons], mi) => ({
    id: `${id}.M${mi + 1}`,
    title: mt,
    summary: '',
    lessons: lessons.map((lt, li) => ({ id: `${id}.M${mi + 1}.L${li + 1}`, title: lt, minutes: 30 })),
    practicals: [],
  }))
  return { id, title, level, stage, summary, prerequisites, status: 'scheduled', phase, competency, modules }
}

export const COURSES: Course[] = [
  scheduled('F1', 'Electrical Safety and Workshop Practice', 'beginner', 'foundation', 11, [], 'CU-01', 'How electricity harms people and equipment, and the procedures that prevent it: isolation, proving dead, capacitor discharge, protection, earthing and safe workshop practice. Required before any practical work is credited once published.', [
    ['Hazards of electricity', ['How current harms the body', 'Shock, arc flash, burns and fire', 'Batteries: short-circuit current, hydrogen and acid', 'Stored energy in capacitors and inductors']],
    ['Safe isolation', ['Isolation and lock-out/tag-out', 'Proving dead: test before touch', 'Capacitor discharge and verification', 'PV arrays cannot be switched off by daylight']],
    ['Protection and earthing', ['Fuses and breakers: what they protect', 'Protective earth, bonding and RCDs', 'Insulation and double insulation', 'Enclosures, IP ratings and labelling']],
    ['Workshop practice', ['Tools, PPE and the bench', 'Low-voltage, current-limited practice supplies', 'Documentation and permits', 'When to stop and ask a qualified person']],
  ]),
  scheduled('F2', 'DC Electrical Fundamentals', 'beginner', 'foundation', 11, ['F1'], 'CU-02', 'Charge, voltage, current, resistance, power and energy; series and parallel circuits; Kirchhoff’s laws; capacitors, inductors and time constants; DC sources.', [
    ['Charge, voltage and current', ['Atoms, charge and conductors', 'Current and its direction', 'Voltage as energy per charge', 'Units, prefixes and engineering notation']],
    ['Resistance and Ohm’s law', ['Resistance and resistivity', 'Ohm’s law, derived and applied', 'Power and energy', 'Resistor ratings and heat']],
    ['Circuits', ['Series circuits and voltage dividers', 'Parallel circuits and current dividers', 'Kirchhoff’s current and voltage laws', 'Combination circuits, worked analysis', 'Open and short circuits']],
    ['Energy storage and time', ['Capacitance and stored energy', 'RC charging and the time constant', 'Inductance and stored energy', 'RL response']],
    ['DC sources', ['Batteries and internal resistance', 'Bench supplies and current limit', 'Diodes as one-way valves', 'LEDs and current limiting']],
  ]),
  scheduled('F3', 'AC Electrical Fundamentals', 'beginner', 'foundation', 12, ['F2'], 'CU-03', 'Alternating quantities, RMS, reactance and impedance, AC power and power factor, harmonics, transformers and rectification.', [
    ['Alternating quantities', ['Why AC is used', 'Sine waves: amplitude, period, frequency, phase', 'Peak, average and RMS', 'Non-sinusoidal waveforms']],
    ['Reactance and impedance', ['Capacitive reactance', 'Inductive reactance', 'Impedance and phasors', 'Resonance and filters']],
    ['AC power', ['Real, reactive and apparent power', 'Power factor and current lag', 'Harmonics and THD', 'Energy returned by reactive loads']],
    ['Transformers', ['Mutual induction and turns ratio', 'Ideal and real transformers', 'Isolation and safety', 'Transformer connection']],
    ['Rectification', ['Half-wave and full-wave rectification', 'The bridge rectifier', 'Smoothing and ripple']],
  ]),
  scheduled('F4', 'Electronic Components for Inverter Engineering', 'beginner', 'foundation', 12, ['F2'], 'CU-04', 'Passive, semiconductor, magnetic, protection, control, sensing and thermal components: how they work, their ratings, how to test them and how to identify faults and replacements.', [
    ['Passive components', ['Resistors', 'Capacitors: electrolytic, film and ceramic', 'Inductors', 'Testing passive components']],
    ['Semiconductor devices', ['Introduction to semiconductors', 'Diodes', 'Rectification with diodes', 'MOSFETs', 'IGBTs', 'Gate drivers', 'Switching characteristics', 'Component testing', 'Fault identification', 'Component replacement']],
    ['Magnetic components', ['Magnetic circuits and saturation', 'Transformers in inverters', 'Output and filter inductors', 'Testing windings']],
    ['Protection and switching devices', ['Fuses', 'Circuit breakers', 'Relays and contactors', 'Relays versus semiconductor switches']],
    ['Control, sensing and thermal', ['PWM controllers and microcontrollers', 'Voltage and current sensing', 'Heat sinks, fans and thermal resistance', 'PCBs, connectors and terminals']],
  ]),
  scheduled('F5', 'Measurement and Virtual Instruments', 'beginner', 'foundation', 8, ['F2', 'F3'], 'CU-05', 'Accuracy and uncertainty, measurement categories, the multimeter, clamp meter, oscilloscope and specialist instruments, used on live simulations.', [
    ['Measurement basics', ['Accuracy, resolution and uncertainty', 'Measurement categories and probe safety', 'Recording results']],
    ['Multimeter and clamp meter', ['Voltage, current, resistance, continuity and diode test', 'Clamp meters and DC/AC current']],
    ['Oscilloscope', ['Time base, volts per division and trigger', 'Measuring frequency, duty and RMS', 'Spectrum and THD']],
    ['Specialist instruments', ['Insulation resistance testing', 'LCR and ESR meters', 'Thermal imaging and temperature probes']],
  ]),
  scheduled('P1', 'Circuit Analysis and Construction', 'intermediate', 'practitioner', 13, ['F2', 'F4'], 'CU-06', 'Reading schematics, nodal analysis, Thevenin and Norton equivalents, non-linear devices, building and fault-finding circuits, and switching circuits up to the H-bridge.', [
    ['Reading schematics', ['Symbols and pin identification', 'Nodes and the connection graph', 'Reference (ground) and measurement']],
    ['Analysis methods', ['Nodal analysis by hand', 'Thevenin and Norton equivalents', 'Superposition', 'Non-linear devices and piecewise-linear models']],
    ['Construction practice', ['Building and verifying circuits', 'Fault finding from symptoms', 'Validation messages and what they mean']],
    ['Switching circuits', ['MOSFET switching circuits', 'The half-bridge', 'The H-bridge', 'Basic inverter architecture']],
  ]),
  scheduled('P2', 'Power Electronics Fundamentals', 'intermediate', 'practitioner', 13, ['F3', 'F4', 'P1'], 'CU-07', 'Switching conversion, PWM and DC-DC converters, switching devices in practice, losses and thermal design, bridges with inductive loads, filters and EMI.', [
    ['Switching principles', ['Why switch instead of dissipate', 'PWM and averaging', 'Duty cycle and DC-DC conversion']],
    ['Switching devices in practice', ['MOSFET switching', 'Conduction and switching losses', 'Thermal design', 'Gate drive and dead time']],
    ['Bridges', ['Half-bridge operation', 'Full H-bridge operation', 'Inductive loads and freewheeling']],
    ['Filters and EMI', ['LC filters and corner frequency', 'Ripple and filter sizing', 'Introduction to EMI and layout']],
  ]),
  scheduled('P3', 'Inverter Principles', 'intermediate', 'practitioner', 13, ['P2'], 'CU-08', 'From DC to AC: square-wave, modified-sine and sine-wave inverters, SPWM, filtering, regulation, waveform quality, efficiency and ratings.', [
    ['From DC to AC', ['The H-bridge and polarity reversal', 'Square-wave inverters', 'Modified sine and harmonic content']],
    ['Sine-wave inverters', ['SPWM generation', 'Output filtering', 'Feedback and regulation']],
    ['Ratings and performance', ['Waveform families and RMS', 'Harmonics, THD and filtering', 'Efficiency, losses and heat', 'Watts, VA and battery current']],
  ]),
  scheduled('P4', 'Inside a Real Inverter', 'intermediate', 'practitioner', 13, ['F1', 'F4'], 'CU-09', 'A guided tour of two real inverter architectures in the 3D laboratory, safe disassembly and reassembly, and component identification on the boards.', [
    ['Architecture tour', ['Enclosure, terminals and earthing', 'The power stage', 'Magnetics', 'Control electronics', 'Protection and sensing']],
    ['Safe disassembly and reassembly', ['Isolation and discharge in practice', 'Disassembly sequence and why', 'Reassembly and functional test']],
    ['Identification', ['Recognising components on a board', 'Comparing a square-wave and a hybrid inverter']],
  ]),
  scheduled('P5', 'Batteries and DC Systems', 'intermediate', 'practitioner', 7, ['F2', 'F1'], 'CU-10', 'Battery technologies, capacity and state of charge, DC system design, cable sizing, fusing, charging profiles and battery management.', [
    ['Battery technology', ['Lead-acid, LiFePO₄ and lithium-ion', 'Capacity, C-rate and Peukert', 'State of charge and depth of discharge']],
    ['DC system design', ['Cable sizing and voltage drop', 'Fusing and isolation', 'Series and parallel banks, balancing']],
    ['Charging and protection', ['Charge profiles', 'BMS and low-voltage disconnect', 'Battery safety and maintenance']],
  ]),
  S1,
  scheduled('S2', 'Solar PV and Hybrid Systems', 'advanced', 'specialist', 7, ['S1', 'P5'], 'CU-12', 'Photovoltaic physics and I–V curves, MPPT and charge control, hybrid dispatch and transfer switching, and system sizing.', [
    ['PV fundamentals', ['The photovoltaic effect and I–V curves', 'Irradiance and temperature', 'Strings, arrays, shading and bypass diodes']],
    ['MPPT and charge control', ['MPPT algorithms', 'PWM and MPPT controllers', 'Charging stages']],
    ['Hybrid systems', ['Energy dispatch priorities', 'Grid, generator and transfer switching', 'Anti-islanding and grid codes']],
    ['System sizing', ['Load profiles and energy budgets', 'Array and battery sizing', 'A worked system design']],
  ]),
  scheduled('S3', 'Installation, Commissioning and Compliance', 'advanced', 'specialist', 14, ['S1', 'F1'], 'CU-13', 'Planning, DC and AC installation, earthing, pre-energisation tests, staged commissioning, records and the role of standards and certification.', [
    ['Planning', ['Site survey and load assessment', 'Equipment location, ventilation and clearances', 'Single-line diagrams']],
    ['Installation', ['DC wiring and protection', 'AC wiring, earthing and RCDs', 'PV mounting and DC isolation']],
    ['Commissioning', ['Pre-energisation checks', 'Staged energisation', 'Commissioning records and handover']],
    ['Compliance', ['Standards and certification', 'Documentation and labelling']],
  ]),
  scheduled('S4', 'Testing, Maintenance and Troubleshooting', 'advanced', 'specialist', 9, ['P4', 'F5', 'S1'], 'CU-14', 'Systematic testing with virtual instruments, preventive maintenance, the troubleshooting method and seventeen repair scenarios.', [
    ['Systematic testing', ['Test plans', 'Measuring with virtual instruments', 'Interpreting results']],
    ['Preventive maintenance', ['Inspection schedules', 'Fans, filters, terminals and torque', 'Battery maintenance']],
    ['Troubleshooting method', ['Symptom, hypothesis, test, conclusion', 'Fault trees', 'Safety during diagnosis']],
    ['Repair workshop', ['Seventeen repair scenarios (one lesson each, Phase 9)']],
  ]),
  scheduled('S5', 'Capstone Project and Competency Certification', 'advanced', 'specialist', 14, ['S1', 'S2', 'S3', 'S4'], 'CU-01…CU-14', 'A capstone design brief taken from requirements to a simulated, tested design and report, followed by the competency assessments and final examination.', [
    ['Capstone design', ['Brief and requirements', 'Design, simulation and report']],
    ['Competency assessment', ['Practical competency tasks', 'Final examination', 'Portfolio review and virtual-competency record']],
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
