import { cloneDoc } from '../engine/circuit/build'
import type { CircuitDoc } from '../engine/circuit/types'
import { calculate, STANDARD_BREAKERS } from '../engine/design/calc'
import type { DesignNumbers, DesignSpec, Selection } from '../engine/design/types'
import type { TestKind } from '../engine/design/testing'

/**
 * The eight Build Your Own Inverter projects (lessons bld-a … bld-h). Each has its own
 * architecture, component roles (Component Library entries), configurator options, assembly
 * (generated from the design in engine/design/generate.ts), questions, a troubleshooting task,
 * and safety notes. Designs are educational estimates, never certified construction designs.
 */
export interface Stage3D {
  label: string
  detail: string
  model?: 'lf3k' | 'sq1k'
  part?: string
}
export interface EnergyPath {
  label: string
  route: string[]
  tone: 'live' | 'signal' | 'caution' | 'danger'
}
export interface Role {
  role: string
  componentId: string
  why: string
}
export interface Question {
  id: string
  prompt: string
  options: string[]
  answer: number
  explain: string
}
export interface Troubleshoot {
  prompt: string
  /** Inject the fault into a copy of the student's circuit. */
  apply: (doc: CircuitDoc) => CircuitDoc
  /** The test whose readings show the symptom. */
  test: TestKind
  options: string[]
  answer: number
  explain: string
}
export interface BuildProject {
  id: string
  letter: string
  title: string
  level: 'beginner' | 'intermediate' | 'advanced'
  summary: string
  objectives: string[]
  stages: Stage3D[]
  paths: EnergyPath[]
  roles: Role[]
  defaults: DesignSpec
  options: Partial<Record<keyof DesignSpec, number[]>>
  questions: Question[]
  troubleshoot: Troubleshoot
  safety: string
  hazardous: boolean
}

const baseDesign: DesignSpec = { vdc: 12, vac: 230, f: 50, power: 500, load: 'resistive', pf: 1, fsw: 50, fswLink: 10000, waveform: 'square', pvVoc: 44, pvIsc: 10, mpptDuty: 0.6, chargeCurrent: 10 }

/** A generic starting selection: deliberately not tuned, so students must check and improve it. */
export const DEFAULT_SELECTION: Selection = {
  switchType: 'mosfet', switchV: 60, switchI: 40, ronMilli: 10, vsat: 1.6, tsw: 100, heatsink: 2, fan: false,
  driver: 'bootstrap', controller: 'pwm-ic', xfmrCore: 'laminated', xfmrVA: 500,
  filterL: 1, filterC: 4.7, filterCType: 'film-ac', busC: 2200, busV: 25, fuse: 30, breaker: 6,
  vsensor: false, csensor: false, hvType: 'igbt', hvV: 600, hvI: 20, hvRonMilli: 200, diodeV: 200, diodeI: 10, bleeder: false,
}

export const SELECTION_OPTIONS = {
  switchV: [30, 40, 60, 80, 100, 150, 200, 250, 600, 650, 1200],
  switchI: [10, 20, 40, 60, 80, 100, 150, 200, 300, 400, 600],
  ronMilli: [1, 2, 3, 5, 8, 10, 20, 50, 100, 200, 500],
  vsat: [1.2, 1.6, 2, 2.5],
  tsw: [20, 50, 100, 200, 300, 500, 1000],
  heatsink: [0.3, 0.5, 0.8, 1.2, 2, 4, 8],
  xfmrVA: [100, 150, 300, 500, 1000, 1500, 2000, 3000, 5000],
  filterL: [0.05, 0.1, 0.2, 0.3, 0.5, 1, 2, 3, 5, 10, 20],
  filterC: [0.47, 1, 2.2, 4.7, 10, 22, 47, 100, 220],
  busC: [470, 1000, 2200, 4700, 10000, 22000],
  busV: [16, 25, 35, 50, 63, 100, 160, 250, 400, 450, 500, 630],
  fuse: [5, 10, 15, 20, 25, 30, 40, 50, 60, 80, 100, 125, 150, 200, 250, 300, 400],
  breaker: STANDARD_BREAKERS,
  hvV: [400, 600, 650, 900, 1200],
  hvI: [5, 10, 15, 20, 30, 40, 60],
  hvRonMilli: [50, 100, 200, 500, 1000],
  diodeV: [50, 100, 200, 400, 600, 800, 1000],
  diodeI: [1, 3, 5, 10, 20, 40],
}
const up = (list: number[], x: number) => list.find((v) => v >= x - 1e-9) ?? list[list.length - 1]
const down = (list: number[], x: number) => [...list].reverse().find((v) => v <= x + 1e-9) ?? list[0]

/**
 * Compatible generic ratings derived from the requirements (offered to beginners, and used by the
 * tests). Not a parts list: real parts must be checked against their datasheets.
 */
export function suggestSelection(projectId: string, d: DesignSpec): Selection {
  const O = SELECTION_OPTIONS
  let sel: Selection = { ...DEFAULT_SELECTION, switchType: 'mosfet', controller: d.waveform === 'square' && projectId !== 'bld-g' && projectId !== 'bld-h' ? 'pwm-ic' : 'mcu', vsensor: d.waveform === 'sine', csensor: true, filterCType: 'film-ac', bleeder: true, tsw: d.waveform === 'sine' || projectId === 'bld-f' ? 50 : 100 }
  sel.driver = projectId === 'bld-e' ? 'low-side' : d.waveform === 'sine' || projectId === 'bld-f' ? 'bootstrap' : 'isolated'
  sel.xfmrCore = projectId === 'bld-f' ? 'ferrite' : 'laminated'
  for (let pass = 0; pass < 3; pass++) {
    const nb = calculate(projectId, d, sel).numbers
    const priRms = nb.iPriPk / Math.SQRT2
    const ronMax = (0.01 * d.power) / Math.max(priRms * priRms * 2, 1e-9)
    sel = {
      ...sel,
      switchV: up(O.switchV, nb.switchVReq),
      switchI: up(O.switchI, nb.switchIReq),
      ronMilli: down(O.ronMilli, ronMax * 1000),
      xfmrVA: up(O.xfmrVA, nb.xfmrVAReq),
      filterL: nb.filterL ? up(O.filterL, nb.filterL * 0.9) : sel.filterL,
      busV: up(O.busV, nb.busVReq),
      busC: projectId === 'bld-f' ? up(O.busC, (d.power / (2 * Math.PI * d.f * Math.max(nb.vbus, 1) * 0.05 * Math.max(nb.vbus, 1))) * 1e6) : 4700,
      fuse: up(O.fuse, nb.fuse),
      breaker: nb.breaker || sel.breaker,
      hvType: d.fsw > 20000 ? 'mosfet' : 'igbt',
      hvV: up(O.hvV, nb.hvVReq),
      hvI: up(O.hvI, nb.hvIReq),
      diodeV: up(O.diodeV, nb.diodeVReq),
      diodeI: up(O.diodeI, nb.diodeIReq),
    }
    if (nb.filterL) {
      const cRef = 1 / ((2 * Math.PI * (d.fsw / 10)) ** 2 * (sel.filterL / 1000))
      sel.filterC = up(O.filterC, (projectId === 'bld-f' ? cRef : cRef / (nb.n * nb.n)) * 1e6 * 0.9)
    }
    // Thermal design for the 150 % overload test as well as rated load (inverters must ride through surges).
    const nb2 = calculate(projectId, { ...d, power: d.power * 1.5 }, sel).numbers
    const sink = O.heatsink.slice().reverse().find((r) => r <= nb2.heatsinkReq)
    if (sink !== undefined) sel = { ...sel, heatsink: sink, fan: false }
    else sel = { ...sel, fan: true, heatsink: O.heatsink.slice().reverse().find((r) => r * 0.4 <= nb2.heatsinkReq) ?? 0.3 }
  }
  return sel
}

const rm = (doc: CircuitDoc, pred: (a: string, b: string) => boolean) => {
  const d = cloneDoc(doc)
  d.wires = d.wires.filter((w) => !pred(`${w.a.partId}.${w.a.terminalId}`, `${w.b.partId}.${w.b.terminalId}`))
  return d
}
const touches = (ref: string) => (a: string, b: string) => a === ref || b === ref
const setState = (doc: CircuitDoc, id: string, key: string, v: number) => {
  const d = cloneDoc(doc)
  const p = d.parts.find((x) => x.id === id)
  if (p) p.states[key] = v
  return d
}
const setParam = (doc: CircuitDoc, id: string, key: string, v: number) => {
  const d = cloneDoc(doc)
  const p = d.parts.find((x) => x.id === id)
  if (p) p.params[key] = v
  return d
}

const LF_SAFE = 'The 110/230 V output is mains voltage: SIMULATED ONLY. A real mains inverter must be built and tested by qualified people to the applicable standards, with isolation, earthing, RCD protection and approved enclosures.'

export const BUILD_PROJECTS: BuildProject[] = [
  {
    id: 'bld-a', letter: 'A', title: 'Basic DC-to-AC inverter', level: 'beginner',
    summary: 'The smallest possible inverter: a battery, a fuse and four MOSFETs in an H-bridge reverse the voltage across a low-voltage lamp 50 or 60 times a second.',
    objectives: ['Explain how an H-bridge turns DC into AC by reversing polarity.', 'Assemble a fused battery input, two bridge legs and their gate drivers.', 'Measure the square-wave output, frequency and input current in simulation.'],
    stages: [
      { label: 'Battery & fuse', detail: 'Fused DC input; battery negative bonded to earth.', model: 'lf3k', part: 'fuse' },
      { label: 'H-bridge', detail: 'Four MOSFETs in two legs; diagonal pairs conduct alternately.', model: 'lf3k', part: 'q1' },
      { label: 'Gate drivers', detail: 'Complementary 50 Hz signals; high-side drivers float.', model: 'lf3k', part: 'u2' },
      { label: 'Low-voltage AC load', detail: '±V_dc square wave across the lamp (no transformer).' },
    ],
    paths: [{ label: 'Energy: battery → bridge → load', route: ['Battery', 'Fuse', 'H-bridge', 'Load'], tone: 'live' }],
    roles: [
      { role: 'Main switches', componentId: 'mosfet', why: 'Low on-resistance at low voltage.' },
      { role: 'Gate driver', componentId: 'gate-driver', why: 'High-side switches need a floating drive.' },
      { role: 'Controller', componentId: 'pwm-controller', why: 'A fixed 50/60 Hz complementary square wave.' },
      { role: 'DC input fuse', componentId: 'fuse', why: 'Protects the battery wiring.' },
      { role: 'Battery connection', componentId: 'battery-terminals', why: 'High-current DC terminals.' },
      { role: 'Heat sink', componentId: 'heat-sink', why: 'Removes switch losses.' },
    ],
    defaults: { ...baseDesign, vac: 12, power: 60, fsw: 50 },
    options: { vdc: [12, 24], f: [50, 60], power: [20, 40, 60, 100] },
    questions: [
      { id: 'q1', prompt: 'Which switches conduct together to make the load voltage positive?', options: ['Q1 and Q2', 'Q1 and Q4', 'Q1 and Q3', 'All four'], answer: 1, explain: 'A diagonal pair: the high side of one leg with the low side of the other. Q1 + Q2 together would short the battery (shoot-through).' },
      { id: 'q2', prompt: 'Why is this circuit not a mains inverter?', options: ['It has no fuse', 'Without a transformer it can only produce ±V_dc', 'MOSFETs cannot switch at 50 Hz', 'The battery is too small'], answer: 1, explain: 'The bridge only reverses the battery voltage; a transformer (or boost stage) is needed to reach 110/230 V.' },
      { id: 'q3', prompt: 'Where must the fuse be placed?', options: ['Next to the load', 'At the battery positive, before everything else', 'In the gate-drive wiring', 'Anywhere in the circuit'], answer: 1, explain: 'A fuse protects the wiring after it; at the battery positive it protects everything.' },
    ],
    troubleshoot: { prompt: 'A student’s basic inverter lights the lamp only dimly and its output has a large DC offset. The test readings of the faulty build are shown. What is the most likely fault?', apply: (d) => rm(d, touches('Q4.d')), test: 'waveform', options: ['Q4 has failed open (no connection at its drain)', 'The fuse has blown', 'The load is open-circuit', 'The battery is reversed'], answer: 0, explain: 'With Q4 open, only one half-cycle drives current through the load: the output becomes unipolar, with a DC offset and half the power.' },
    safety: 'Low-voltage circuit (12/24 V). Batteries can still deliver very large short-circuit currents: always fuse the positive close to the battery.',
    hazardous: false,
  },
  {
    id: 'bld-b', letter: 'B', title: 'Square-wave inverter', level: 'beginner',
    summary: 'Adds a DC bus capacitor and a low-frequency step-up transformer to the H-bridge, giving a 110/230 V square wave.',
    objectives: ['Size the transformer ratio and VA rating from the design.', 'Wire bus decoupling, the transformer, the output breaker and earthing.', 'Measure output RMS, regulation, efficiency and the 48 % THD of a square wave.'],
    stages: [
      { label: 'Battery, fuse & DC bus', detail: 'Fuse and bus capacitors close to the bridge.', model: 'lf3k', part: 'c1' },
      { label: 'H-bridge + drivers', detail: 'Square-wave switching at the output frequency.', model: 'lf3k', part: 'q1' },
      { label: 'Step-up transformer', detail: 'Laminated core; ratio n = V_out / V_dc; isolation.', model: 'sq1k', part: 't1' },
      { label: 'Breaker & earth', detail: 'Two-pole output breaker; neutral bonded to PE.', model: 'lf3k', part: 'ac-out' },
    ],
    paths: [{ label: 'Energy: battery → bridge → transformer → load', route: ['Battery', 'Fuse', 'DC bus', 'H-bridge', 'Transformer', 'Breaker', 'Load'], tone: 'live' }],
    roles: [
      { role: 'Main switches', componentId: 'mosfet', why: 'Low-voltage, high-current bridge.' },
      { role: 'Gate driver', componentId: 'gate-driver', why: 'Floating high-side drive for 50/60 Hz.' },
      { role: 'Controller', componentId: 'pwm-controller', why: 'Square-wave timing.' },
      { role: 'Transformer', componentId: 'transformer', why: 'Steps up and isolates.' },
      { role: 'DC bus capacitor', componentId: 'capacitor', why: 'Supplies switching currents locally.' },
      { role: 'DC input fuse', componentId: 'fuse', why: 'Battery wiring protection.' },
      { role: 'AC output breaker', componentId: 'circuit-breaker', why: 'Output wiring protection.' },
      { role: 'Protective earth', componentId: 'protective-earth', why: 'Earthing of chassis and neutral.' },
    ],
    defaults: { ...baseDesign },
    options: { vdc: [12, 24, 48], vac: [110, 230], f: [50, 60], power: [300, 500, 1000, 1500] },
    questions: [
      { id: 'q1', prompt: 'A square wave has the same RMS as its peak. What does that mean for the transformer ratio?', options: ['n = V_out / V_dc (less drops)', 'n = √2 · V_out / V_dc', 'n = V_dc / V_out', 'n = 1'], answer: 0, explain: 'V_rms = V_peak for a square wave, so the secondary must reach the full output voltage.' },
      { id: 'q2', prompt: 'Why does the output of this design fall when the battery runs down?', options: ['There is no feedback: V_out = n · V_dc', 'The fuse heats up', 'The frequency changes', 'The breaker limits it'], answer: 0, explain: 'An unregulated square-wave inverter follows its battery voltage.' },
      { id: 'q3', prompt: 'What does the transformer provide besides voltage step-up?', options: ['Galvanic isolation between battery and output', 'Overcurrent protection', 'Waveform filtering to a sine wave', 'Battery charging'], answer: 0, explain: 'The windings are electrically separate; only magnetic coupling links them.' },
    ],
    troubleshoot: { prompt: 'This square-wave inverter draws almost no battery current and gives almost no output. Readings of the faulty build are shown. Which fault explains it?', apply: (d) => setState(setState(d, 'G3', 'invert', 1), 'G4', 'invert', 0), test: 'resistive', options: ['Leg B’s gate signals were swapped, so both legs switch in phase', 'The transformer is shorted', 'The battery fuse has blown', 'The load is too small'], answer: 0, explain: 'With both midpoints rising and falling together, the voltage across the primary is zero: no output and no current.' },
    safety: LF_SAFE,
    hazardous: true,
  },
  {
    id: 'bld-c', letter: 'C', title: 'Modified sine-wave inverter', level: 'intermediate',
    summary: 'Delays one bridge leg so the output rests at zero between pulses: a three-level "modified sine" with the peak and RMS of a sine wave. Its harmonic content depends on the conduction angle, which you will measure.',
    objectives: ['Explain phase-shift control of a full bridge.', 'Choose the conduction angle that gives the sine-wave peak and RMS (α = 90°).', 'Measure THD and crest factor and compare them with the square wave and with the quasi-square theory (48.3 % at 90°, minimum 31 % at 120°).'],
    stages: [
      { label: 'Battery, fuse & DC bus', detail: 'As project B.', model: 'lf3k', part: 'fuse' },
      { label: 'Phase-shifted H-bridge', detail: 'Leg B delayed by 90°: +V, 0, −V, 0 steps (90° conduction).', model: 'lf3k', part: 'q3' },
      { label: 'Microcontroller timing', detail: 'Generates the two phase-shifted leg signals.', model: 'lf3k', part: 'u6' },
      { label: 'Transformer, breaker & earth', detail: 'n = √2·V_out / V_dc keeps the sine-wave peak.', model: 'lf3k', part: 't1' },
    ],
    paths: [{ label: 'Energy: battery → bridge → transformer → load', route: ['Battery', 'Fuse', 'DC bus', 'Phase-shifted bridge', 'Transformer', 'Breaker', 'Load'], tone: 'live' }],
    roles: [
      { role: 'Main switches', componentId: 'mosfet', why: 'Low-voltage bridge.' },
      { role: 'Controller', componentId: 'microcontroller', why: 'Phase-shifted timing.' },
      { role: 'Gate driver', componentId: 'gate-driver', why: 'Floating high-side drive.' },
      { role: 'Transformer', componentId: 'transformer', why: 'Step-up and isolation.' },
      { role: 'DC input fuse', componentId: 'fuse', why: 'Battery protection.' },
      { role: 'AC output breaker', componentId: 'circuit-breaker', why: 'Output protection.' },
    ],
    defaults: { ...baseDesign, waveform: 'modified' },
    options: { vdc: [12, 24, 48], vac: [110, 230], f: [50, 60], power: [300, 500, 1000, 1500] },
    questions: [
      { id: 'q1', prompt: 'How is the zero-voltage step created?', options: ['By switching both high-side (or both low-side) switches on together', 'By turning the transformer off', 'By a series resistor', 'By reversing the battery'], answer: 0, explain: 'When both midpoints are at the same rail the primary sees 0 V while current freewheels through the switches.' },
      { id: 'q2', prompt: 'With the sine-wave peak, which conduction angle gives the sine-wave RMS?', options: ['60°', '90°', '120°', '180°'], answer: 1, explain: 'V_rms = V_pk·√(α/180°) = V_pk/√2 when α = 90°.' },
      { id: 'q3', prompt: 'With 90° conduction (sine-wave peak and RMS), the THD of a modified sine is…', options: ['about the same as a square wave, 48 %', 'zero', 'below 5 %', 'twice that of a square wave'], answer: 0, explain: 'A common misconception is that "modified sine" means low distortion. At 90° the THD is 48.3 %, the same as a square wave; it falls to its minimum of about 31 % at 120°, which no longer gives the sine-wave RMS for the same peak. The benefit at 90° is the correct peak and RMS for loads that rely on them.' },
    ],
    troubleshoot: { prompt: 'This "modified sine" inverter gives an output about 40 % above its rating, with a crest factor of 1.0 (RMS = peak). Readings of the faulty build are shown. What is wrong?', apply: (d) => setParam(setParam(d, 'G3', 'phase', 180), 'G4', 'phase', 180), test: 'waveform', options: ['Leg B’s phase delay is set to 180° instead of the conduction angle', 'The transformer ratio is too high', 'The filter capacitor is missing', 'A switch is open'], answer: 0, explain: 'A 180° delay makes the legs exactly complementary: no zero step, so the output becomes a square wave whose RMS equals the sine-wave peak (√2 × 230 ≈ 325 V).' },
    safety: LF_SAFE,
    hazardous: true,
  },
  {
    id: 'bld-d', letter: 'D', title: 'Pure sine-wave inverter', level: 'advanced',
    summary: 'The full design: DC bus, gate drivers with dead time, an H-bridge switched by regulated SPWM, an LC filter, a step-up transformer, voltage feedback and output protection.',
    objectives: ['Trace the signal chain: sine reference → SPWM → gate drivers → bridge → LC filter → transformer.', 'Size the filter from ripple and corner-frequency targets and see it remove the carrier.', 'Close the feedback loop and verify line and load regulation.', 'Show the relationship between switching signals, bridge voltage and the filtered output.'],
    stages: [
      { label: 'DC input & bus', detail: 'Fuse, bus capacitors close to the bridge.', model: 'lf3k', part: 'c1' },
      { label: 'Gate drivers + dead time', detail: 'Bootstrap high-side drive; 1 µs dead time.', model: 'lf3k', part: 'u2' },
      { label: 'MOSFET H-bridge', detail: 'Bipolar SPWM at f_sw.', model: 'lf3k', part: 'q1' },
      { label: 'SPWM generation', detail: 'MCU compares a sine reference with a triangle carrier.', model: 'lf3k', part: 'u6' },
      { label: 'LC filter', detail: 'L on the bridge side, C on the secondary; corner ≈ f_sw/10.', model: 'lf3k', part: 'l1' },
      { label: 'Transformer', detail: 'Steps up and isolates.', model: 'lf3k', part: 't1' },
      { label: 'Feedback & regulation', detail: 'Output RMS sensed every cycle; m adjusted.', model: 'lf3k', part: 'u7' },
      { label: 'Output protection', detail: 'Breaker, earthing, current sensing.', model: 'lf3k', part: 'hall' },
    ],
    paths: [
      { label: 'Energy: battery → bridge → filter → transformer → load', route: ['Battery', 'Fuse', 'DC bus', 'H-bridge', 'L filter', 'Transformer', 'C filter', 'Breaker', 'Load'], tone: 'live' },
      { label: 'Control: sensor → MCU → SPWM → gate drivers', route: ['Voltage sensor', 'Controller', 'SPWM', 'Gate drivers', 'H-bridge'], tone: 'signal' },
    ],
    roles: [
      { role: 'Main switches', componentId: 'mosfet', why: 'Fast, low R_DS(on) for kHz SPWM.' },
      { role: 'Gate driver', componentId: 'gate-driver', why: 'Bootstrap high side, dead time.' },
      { role: 'Controller', componentId: 'microcontroller', why: 'Sine reference, SPWM, regulation.' },
      { role: 'Filter inductor', componentId: 'inductor', why: 'Smooths the carrier current.' },
      { role: 'Filter capacitor', componentId: 'capacitor', why: 'AC film capacitor on the output.' },
      { role: 'Transformer', componentId: 'transformer', why: 'Step-up, isolation.' },
      { role: 'Voltage sensor', componentId: 'voltage-sensor', why: 'Feedback for regulation.' },
      { role: 'Current sensor', componentId: 'current-sensor', why: 'Fast overcurrent shutdown.' },
      { role: 'DC input fuse', componentId: 'fuse', why: 'Battery protection.' },
      { role: 'AC output breaker', componentId: 'circuit-breaker', why: 'Output protection.' },
    ],
    defaults: { ...baseDesign, vdc: 24, power: 1000, waveform: 'sine', fsw: 5000 },
    options: { vdc: [12, 24, 48], vac: [110, 230], f: [50, 60], power: [500, 1000, 2000], fsw: [2500, 5000, 10000] },
    questions: [
      { id: 'q1', prompt: 'In bipolar SPWM, when is Q1 (with Q4) switched on?', options: ['While the sine reference is above the triangle carrier', 'For the whole positive half-cycle', 'Only at the peak', 'When the output current is zero'], answer: 0, explain: 'The comparison of reference and carrier sets the duty, so the average bridge voltage follows the sine.' },
      { id: 'q2', prompt: 'What does the feedback loop change to hold 230 V as the battery discharges?', options: ['The modulation index m', 'The carrier frequency', 'The transformer ratio', 'The dead time'], answer: 0, explain: 'The fundamental is m·V_dc·n; as V_dc falls, m rises.' },
      { id: 'q3', prompt: 'Why is the filter corner placed about a decade below the carrier?', options: ['To attenuate the carrier ~100× while passing 50 Hz', 'To resonate with the load', 'To raise the output voltage', 'To reduce dead time'], answer: 0, explain: 'A second-order filter falls at 40 dB/decade: a decade above the corner the carrier is about 100× smaller.' },
    ],
    troubleshoot: { prompt: 'This pure-sine inverter’s output is clean but about 25 % above 230 V, and it no longer changes when the battery voltage changes. Readings of the faulty build are shown. What failed?', apply: (d) => rm(d, (a, b) => a.startsWith('VS1.') || b.startsWith('VS1.')), test: 'resistive', options: ['The output voltage sensor is disconnected, so the controller sees 0 V and drives the modulation index to its maximum', 'The output filter capacitor is open-circuit', 'The dead time is too long', 'The battery fuse has blown'], answer: 0, explain: 'With no feedback signal the regulator believes the output is far too low and raises m to 1. The output is then n·V_dc with no regulation, which is too high. A real controller should treat a missing feedback signal as a fault and shut down.' },
    safety: LF_SAFE,
    hazardous: true,
  },
  {
    id: 'bld-e', letter: 'E', title: 'Transformer-based (push-pull) inverter', level: 'intermediate',
    summary: 'A centre-tapped transformer lets two low-side MOSFETs drive the primary alternately: no high-side drivers, but each switch must block twice the battery voltage.',
    objectives: ['Explain push-pull operation with a centre-tapped primary.', 'Account for the 2·V_dc switch stress when choosing switches.', 'Compare part count, gate drive and stresses with the full bridge.'],
    stages: [
      { label: 'Battery, fuse & bus', detail: 'Fused supply to the centre tap.', model: 'sq1k', part: 'fuse' },
      { label: 'Push-pull switches', detail: 'Two low-side MOSFETs; simple drive.', model: 'sq1k', part: 'heatsink' },
      { label: 'Centre-tapped transformer', detail: 'Each half-winding conducts in turn.', model: 'sq1k', part: 't1' },
      { label: 'Breaker & earth', detail: 'Isolated output with earthed neutral.', model: 'sq1k', part: 'ac-out' },
    ],
    paths: [{ label: 'Energy: battery → centre tap → half-winding → switch → battery', route: ['Battery', 'Fuse', 'Centre tap', 'Half-winding', 'Switch', 'Battery −'], tone: 'live' }],
    roles: [
      { role: 'Main switches', componentId: 'mosfet', why: 'Low side, rated for 2·V_dc plus spikes.' },
      { role: 'Gate driver', componentId: 'gate-driver', why: 'Low-side only.' },
      { role: 'Controller', componentId: 'pwm-controller', why: 'Push-pull outputs (SG3525 class).' },
      { role: 'Transformer (centre-tapped)', componentId: 'transformer', why: 'Push-pull primary.' },
      { role: 'DC input fuse', componentId: 'fuse', why: 'Battery protection.' },
      { role: 'AC output breaker', componentId: 'circuit-breaker', why: 'Output protection.' },
    ],
    defaults: { ...baseDesign, power: 300 },
    options: { vdc: [12, 24], vac: [110, 230], f: [50, 60], power: [150, 300, 500] },
    questions: [
      { id: 'q1', prompt: 'Why must push-pull switches be rated for at least twice the battery voltage?', options: ['The off switch sees the supply plus the voltage induced in its half-winding', 'Because of the fuse', 'Because the output is 230 V', 'They are in series'], answer: 0, explain: 'When one half is driven with V_dc, the other half also has V_dc induced, so the off drain sits at 2·V_dc.' },
      { id: 'q2', prompt: 'What is the main advantage of push-pull over a full bridge?', options: ['Both switches are on the negative rail: simple low-side drive', 'Lower switch voltage', 'No transformer needed', 'Lower THD'], answer: 0, explain: 'No floating gate supplies are needed.' },
      { id: 'q3', prompt: 'Where does the battery positive connect?', options: ['To the centre tap', 'To one end of the primary', 'To the secondary', 'To the switch gates'], answer: 0, explain: 'Current flows from the centre tap through whichever half is switched on.' },
    ],
    troubleshoot: { prompt: 'This push-pull inverter gives only every other half-cycle and the transformer draws a growing magnetising current. Readings shown. Which fault?', apply: (d) => rm(d, touches('T1.p2')), test: 'waveform', options: ['One half of the primary is disconnected from its switch', 'The battery is reversed', 'The breaker is too small', 'The load is inductive'], answer: 0, explain: 'Only one half-winding conducts, so the core is driven in one direction only: a unipolar output and DC flux build-up.' },
    safety: LF_SAFE,
    hazardous: true,
  },
  {
    id: 'bld-f', letter: 'F', title: 'High-frequency inverter', level: 'advanced',
    summary: 'A push-pull DC-DC stage at kHz uses a small ferrite transformer to make a ~360 V DC bus, which a second H-bridge turns into a filtered sine wave.',
    objectives: ['Explain why a high switching frequency shrinks the transformer.', 'Assemble the HF link, fast rectifier, HV bus with bleeder, and HV SPWM bridge.', 'Recognise the HV DC bus hazard and the need for a discharge path.'],
    stages: [
      { label: 'Battery & fuse', detail: 'Low-voltage, high-current input.', model: 'lf3k', part: 'bat-pos' },
      { label: 'HF push-pull + ferrite transformer', detail: 'Kilohertz switching; small core.', model: 'lf3k', part: 'q1' },
      { label: 'Fast rectifier & HV bus', detail: 'Fast diodes, 400 V-class capacitors, bleeder.', model: 'lf3k', part: 'c5' },
      { label: 'HV H-bridge (SPWM)', detail: '600 V-class switches.', model: 'lf3k', part: 'q5' },
      { label: 'LC filter, breaker, feedback', detail: 'Sine output, regulated.', model: 'lf3k', part: 'c7' },
    ],
    paths: [
      { label: 'Energy: battery → HF link → HV bus → HV bridge → filter → load', route: ['Battery', 'Push-pull', 'Ferrite transformer', 'Rectifier', 'HV bus', 'HV bridge', 'LC filter', 'Load'], tone: 'live' },
      { label: 'Hazard: HV DC bus (stays charged without a bleeder)', route: ['HV bus capacitor', 'Bleeder'], tone: 'danger' },
    ],
    roles: [
      { role: 'Push-pull switches', componentId: 'mosfet', why: 'Fast, low-voltage.' },
      { role: 'HF transformer', componentId: 'transformer', why: 'Ferrite core at kHz.' },
      { role: 'Fast rectifier diodes', componentId: 'diode', why: 'Recover quickly at kHz.' },
      { role: 'HV bus capacitor', componentId: 'capacitor', why: '400 V-class electrolytic.' },
      { role: 'Bus bleeder', componentId: 'resistor', why: 'Discharges the HV bus.' },
      { role: 'HV bridge switches', componentId: 'igbt', why: '600 V class.' },
      { role: 'Controller', componentId: 'microcontroller', why: 'Two stages and regulation.' },
      { role: 'Filter inductor', componentId: 'inductor', why: 'SPWM ripple.' },
      { role: 'Voltage sensor', componentId: 'voltage-sensor', why: 'Regulation.' },
    ],
    defaults: { ...baseDesign, vdc: 48, power: 1000, waveform: 'sine', fsw: 10000, fswLink: 10000 },
    options: { vdc: [24, 48], vac: [110, 230], f: [50, 60], power: [500, 1000, 1500], fsw: [5000, 10000], fswLink: [5000, 10000] },
    questions: [
      { id: 'q1', prompt: 'Why can the HF transformer be so much smaller than a 50 Hz one?', options: ['Flux per cycle is proportional to V/f: higher f needs less core area and fewer turns', 'It carries less power', 'It is made of copper only', 'It has no secondary'], answer: 0, explain: 'For the same voltage, flux swing scales with 1/f.' },
      { id: 'q2', prompt: 'Why does the HV bus need a bleeder resistor?', options: ['So the capacitor discharges after switch-off', 'To regulate the output', 'To limit inrush', 'To filter harmonics'], answer: 0, explain: 'A 400 V capacitor can stay charged for minutes: a serious shock hazard.' },
      { id: 'q3', prompt: 'Why must the HV rectifier diodes be "fast"?', options: ['Slow diodes conduct backwards briefly at each kHz reversal, wasting power', 'They carry 50 Hz', 'They block 12 V only', 'For lower cost'], answer: 0, explain: 'Reverse recovery losses scale with frequency.' },
    ],
    troubleshoot: { prompt: 'The HF inverter’s output collapses and distorts heavily under load. Readings shown. Which fault?', apply: (d) => rm(d, (a, b) => a.startsWith('C3.') || b.startsWith('C3.')), test: 'resistive', options: ['The HV bus capacitor is open-circuit', 'The bleeder resistor is too large', 'The fan has stopped', 'The output breaker is too large'], answer: 0, explain: 'Without the bus capacitor the HV bus follows the rectified HF voltage and cannot supply the SPWM bridge between pulses.' },
    safety: 'The HV DC bus (~360 V) and the 110/230 V output are SIMULATED ONLY. HV capacitors must be discharged and verified with a meter before any contact; real HV designs require qualified engineers and certification.',
    hazardous: true,
  },
  {
    id: 'bld-g', letter: 'G', title: 'Solar inverter', level: 'advanced',
    summary: 'A PV array charges the battery through an MPPT buck stage, and a pure-sine inverter supplies the load. Two energy paths share the battery. Prepares Phase 7.',
    objectives: ['Trace the PV → battery and battery → load energy paths.', 'Operate the MPPT stage near the array’s maximum-power point by choosing the duty cycle.', 'Size PV fusing, charge current and the inverter for the system.'],
    stages: [
      { label: 'PV array', detail: 'Simplified piecewise-linear model (Phase 7: single-diode).', model: 'lf3k', part: 'pv-pos' },
      { label: 'MPPT buck stage', detail: 'Duty sets the PV voltage (V_pv = V_bat/D).', model: 'lf3k', part: 'breaker' },
      { label: 'Battery bank', detail: 'Energy store shared by both paths.', model: 'lf3k', part: 'bat-pos' },
      { label: 'Pure-sine inverter', detail: 'As project D.', model: 'lf3k', part: 'q1' },
      { label: 'Output & protection', detail: 'Breaker, earth, feedback.', model: 'lf3k', part: 'ac-out' },
    ],
    paths: [
      { label: 'PV → MPPT → battery (charging)', route: ['PV array', 'MPPT buck', 'Battery'], tone: 'caution' },
      { label: 'Battery → inverter → load', route: ['Battery', 'Fuse', 'H-bridge', 'Filter', 'Transformer', 'Load'], tone: 'live' },
    ],
    roles: [
      { role: 'PV input', componentId: 'solar-input', why: 'Array connection.' },
      { role: 'MPPT switch', componentId: 'mosfet', why: 'Buck converter.' },
      { role: 'Controller', componentId: 'microcontroller', why: 'MPPT and inverter control.' },
      { role: 'Battery connection', componentId: 'battery-terminals', why: 'Shared DC bus.' },
      { role: 'Main switches', componentId: 'mosfet', why: 'Inverter bridge.' },
      { role: 'Transformer', componentId: 'transformer', why: 'Step-up and isolation.' },
      { role: 'Protection', componentId: 'circuit-breaker', why: 'PV and AC isolation.' },
    ],
    defaults: { ...baseDesign, vdc: 24, power: 500, waveform: 'sine', fsw: 5000, pvVoc: 44, pvIsc: 10, mpptDuty: 0.6 },
    options: { vdc: [24, 48], vac: [110, 230], f: [50, 60], power: [300, 500, 1000], fsw: [2500, 5000], pvVoc: [44, 88], pvIsc: [5, 8, 10], mpptDuty: [0.3, 0.4, 0.5, 0.55, 0.6, 0.65, 0.68, 0.7, 0.75, 0.8, 0.9] },
    questions: [
      { id: 'q1', prompt: 'In a buck MPPT stage, increasing the duty cycle…', options: ['lowers the PV operating voltage', 'raises the PV voltage', 'has no effect', 'reverses the current'], answer: 0, explain: 'V_pv = V_bat / D: a larger D pulls the array voltage down towards the battery.' },
      { id: 'q2', prompt: 'Why can PV current not simply be switched off by covering the array?', options: ['Daylight keeps generating; DC isolators and fuses are required', 'It can', 'PV is AC', 'The inverter stops it'], answer: 0, explain: 'A PV array is a current source whenever light falls on it.' },
      { id: 'q3', prompt: 'Which energy path supplies the load at night?', options: ['Battery → inverter → load', 'PV → load directly', 'Grid → PV', 'None'], answer: 0, explain: 'The battery stores the daytime PV energy.' },
    ],
    troubleshoot: { prompt: 'The solar system charges the battery with far less power than the array can give. Readings shown. Which fault?', apply: (d) => setParam(d, 'GM', 'duty', 95), test: 'mppt', options: ['The MPPT duty is far from the maximum-power point', 'The battery fuse has blown', 'The inverter filter is missing', 'The transformer ratio is wrong'], answer: 0, explain: 'At 95 % duty the array is held near the battery voltage, low on its curve.' },
    safety: `${LF_SAFE} PV arrays generate whenever lit: real installations need DC isolators, PV-rated fuses and qualified installation.`,
    hazardous: true,
  },
  {
    id: 'bld-h', letter: 'H', title: 'Hybrid inverter', level: 'advanced',
    summary: 'Grid and generator inputs, a source selector and a transfer relay, a battery charger and a pure-sine battery inverter. Four energy paths: grid → load, grid → battery, battery → load, generator → load. PV is reserved for Phase 7.',
    objectives: ['Explain the energy paths of a hybrid inverter and when each is used.', 'Wire source selection, the transfer relay, the charger path and the inverter path.', 'Test grid, generator and backup (battery) modes in simulation.'],
    stages: [
      { label: 'Grid & generator inputs', detail: 'Each through its own breaker.', model: 'lf3k', part: 'breaker' },
      { label: 'Source selector & transfer relays', detail: 'K2 selects grid/generator; K1 transfers the load.', model: 'lf3k', part: 'k1' },
      { label: 'Charger', detail: 'Step-down, rectifier, current limit (simplified).', model: 'lf3k', part: 'd1' },
      { label: 'Battery & inverter', detail: 'Pure-sine inverter as project D.', model: 'lf3k', part: 'q1' },
      { label: 'AC output & protection', detail: 'Common neutral bonded to earth.', model: 'lf3k', part: 'ac-out' },
      { label: 'PV input (Phase 7)', detail: 'Reserved: MPPT path arrives with the solar lab.', model: 'lf3k', part: 'pv-pos' },
    ],
    paths: [
      { label: 'Grid → load (bypass)', route: ['Grid', 'CBG', 'K2 NC', 'K1 NC', 'Load'], tone: 'signal' },
      { label: 'Grid → battery (charging)', route: ['Grid', 'K2', 'Charger', 'Battery'], tone: 'caution' },
      { label: 'Battery → load (backup)', route: ['Battery', 'Inverter', 'K1 NO', 'Load'], tone: 'live' },
      { label: 'Generator → load', route: ['Generator', 'CBN', 'K2 NO', 'K1 NC', 'Load'], tone: 'danger' },
    ],
    roles: [
      { role: 'Transfer relay', componentId: 'relay', why: 'Switches the load between sources.' },
      { role: 'Charger rectifier', componentId: 'diode', why: 'AC → DC charging.' },
      { role: 'Controller', componentId: 'microcontroller', why: 'Transfer and charge logic.' },
      { role: 'Main switches', componentId: 'mosfet', why: 'Inverter bridge.' },
      { role: 'Transformer', componentId: 'transformer', why: 'Inverter step-up.' },
      { role: 'Input/output breakers', componentId: 'circuit-breaker', why: 'Protection of each source.' },
      { role: 'Voltage sensor', componentId: 'voltage-sensor', why: 'Grid detection and regulation.' },
    ],
    defaults: { ...baseDesign, vdc: 24, power: 500, waveform: 'sine', fsw: 5000, chargeCurrent: 10 },
    options: { vdc: [24, 48], vac: [110, 230], f: [50, 60], power: [300, 500, 1000], fsw: [2500, 5000], chargeCurrent: [5, 10, 20] },
    questions: [
      { id: 'q1', prompt: 'In grid mode, which path supplies the load?', options: ['Grid → K2 NC → K1 NC → load (bypass)', 'Battery → inverter → load', 'Generator → load', 'PV → load'], answer: 0, explain: 'The inverter waits on K1 NO while the grid supplies the load and charges the battery.' },
      { id: 'q2', prompt: 'When the grid fails, what does the transfer controller do?', options: ['Energises K1 so the inverter output supplies the load', 'Opens the battery fuse', 'Starts charging', 'Nothing'], answer: 0, explain: 'K1 changes over from NC (AC input) to NO (inverter).' },
      { id: 'q3', prompt: 'Why must the grid and inverter never be connected to the load at the same time (in this design)?', options: ['They are not synchronised: connecting them would short two unsynchronised AC sources', 'The breaker is too small', 'The battery would discharge', 'It is allowed'], answer: 0, explain: 'A changeover relay makes the two connections mutually exclusive.' },
    ],
    troubleshoot: { prompt: 'During a grid failure the load goes dark although the inverter is running. Readings of the backup test of the faulty build are shown. Which fault?', apply: (d) => rm(d, touches('GK1.+')), test: 'resistive', options: ['The transfer relay coil is not driven by the controller', 'The charger diodes are reversed', 'The grid breaker is tripped', 'The battery is flat'], answer: 0, explain: 'Without coil drive K1 stays on NC (the dead AC input), so the inverter output never reaches the load.' },
    safety: `${LF_SAFE} Grid and generator connections are simulated only; real hybrid systems need approved transfer equipment and anti-islanding protection.`,
    hazardous: true,
  },
]

export const BUILD_PROJECT_BY_ID: Record<string, BuildProject> = Object.fromEntries(BUILD_PROJECTS.map((p) => [p.id, p]))

export function designNumbers(projectId: string, d: DesignSpec, sel: Selection): DesignNumbers {
  return calculate(projectId, d, sel).numbers
}
