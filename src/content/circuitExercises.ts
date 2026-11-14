import { circuit } from '../engine/circuit/build'
import type { CircuitDoc, PartType } from '../engine/circuit/types'

/**
 * Circuit Connection Laboratory exercises (lesson ids ckt-01 … ckt-10). Each exercise states its
 * objectives, steps, the connections an engineer would expect, and its assessment rule. The
 * evaluator for each id lives in engine/circuit/exercises.ts. `reference` is a worked solution:
 * the test suite proves it passes, and students can load it after an attempt (without credit).
 */
export interface CircuitExercise {
  id: string
  title: string
  level: 'foundation' | 'intermediate' | 'advanced'
  objectives: string[]
  steps: string[]
  expected: string[]
  assessment: string
  toolbox: PartType[]
  starter: CircuitDoc
  reference: CircuitDoc
  safety?: string
}

const empty = (): CircuitDoc => ({ version: 1, parts: [], wires: [] })
const partsOnly = (d: CircuitDoc): CircuitDoc => ({ version: 1, parts: d.parts.map((p) => ({ ...p })), wires: [] })
const LV = 'Low-voltage, isolated, current-limited circuit: safe to build on a real bench under supervision.'

const ex1 = circuit().add('PS1', 'dc-supply', 6, 10).add('R1', 'resistor', 16, 10, 90, { R: 1000 }).add('GND1', 'ground', 6, 14).wire('PS1.+', 'R1.1').wire('R1.2', 'PS1.-').wire('PS1.-', 'GND1.gnd').doc
const ex2 = circuit().add('PS1', 'dc-supply', 6, 10, 0, { V: 9 }).add('R1', 'resistor', 11, 6, 0, { R: 470 }).add('LED1', 'led', 16, 10, 90).add('GND1', 'ground', 6, 14).wire('PS1.+', 'R1.1').wire('R1.2', 'LED1.a').wire('LED1.k', 'PS1.-').wire('PS1.-', 'GND1.gnd').doc
const ex3 = circuit()
  .add('PS1', 'dc-supply', 6, 12)
  .add('S1', 'switch', 11, 6)
  .add('R1', 'resistor', 17, 6, 0, { R: 1000 })
  .add('C1', 'electrolytic', 22, 12, 90, { C: 1000, Vmax: 25 })
  .add('S2', 'switch', 28, 10, 90)
  .add('R2', 'resistor', 28, 16, 90, { R: 2200 })
  .add('GND1', 'ground', 6, 16)
  .wire('PS1.+', 'S1.1').wire('S1.2', 'R1.1').wire('R1.2', 'C1.+').wire('C1.+', 'S2.1').wire('S2.2', 'R2.1').wire('R2.2', 'C1.-').wire('C1.-', 'PS1.-').wire('PS1.-', 'GND1.gnd').doc
const bridge = () =>
  circuit()
    .add('AC1', 'ac-source', 5, 12, 0, { Vrms: 12 })
    .add('D1', 'diode', 13, 7)
    .add('D2', 'diode', 13, 11)
    .add('D3', 'diode', 13, 15)
    .add('D4', 'diode', 13, 19)
    .add('LD1', 'dc-load', 26, 13, 0, { R: 100 })
    .wire('AC1.1', 'D1.a').wire('AC1.1', 'D3.k').wire('AC1.2', 'D2.a').wire('AC1.2', 'D4.k')
    .wire('D1.k', 'LD1.+').wire('D2.k', 'LD1.+').wire('D3.a', 'LD1.-').wire('D4.a', 'LD1.-')
const ex4 = bridge().doc
const ex5 = bridge().add('C1', 'electrolytic', 21, 13, 90, { C: 2200, Vmax: 35 }).wire('C1.+', 'LD1.+').wire('C1.-', 'LD1.-').doc
const ex6 = circuit()
  .add('PS1', 'dc-supply', 5, 12)
  .add('LD1', 'dc-load', 15, 7, 0, { R: 24 })
  .add('Q1', 'mosfet', 14, 15)
  .add('RG1', 'resistor', 9, 15, 0, { R: 47 })
  .add('G1', 'gate-source', 4, 21)
  .add('GND1', 'ground', 5, 26)
  .wire('PS1.+', 'LD1.+').wire('LD1.-', 'Q1.d').wire('Q1.s', 'PS1.-').wire('G1.+', 'RG1.1').wire('RG1.2', 'Q1.g').wire('G1.-', 'Q1.s').wire('PS1.-', 'GND1.gnd').doc
const ex7 = circuit().add('AC1', 'ac-source', 5, 10, 0, { Vrms: 24 }).add('T1', 'transformer', 14, 10, 0, { n: 0.5 }).add('LA1', 'ac-load', 22, 10, 0, { R: 100 }).wire('AC1.1', 'T1.p1').wire('AC1.2', 'T1.p2').wire('T1.s1', 'LA1.1').wire('T1.s2', 'LA1.2').doc
const ex8 = circuit()
  .add('PS1', 'dc-supply', 5, 14, 0, { V: 24, Ilim: 2 })
  .add('F1', 'fuse', 11, 6, 0, { Irated: 2 })
  .add('Q1', 'mosfet', 18, 10)
  .add('Q2', 'mosfet', 18, 20)
  .add('LD1', 'dc-load', 27, 18, 0, { R: 24 })
  .add('G1', 'gate-source', 11, 13)
  .add('G2', 'gate-source', 11, 23)
  .add('GND1', 'ground', 5, 26)
  .wire('PS1.+', 'F1.1').wire('F1.2', 'Q1.d').wire('Q1.s', 'Q2.d').wire('Q2.s', 'PS1.-').wire('Q1.s', 'LD1.+').wire('LD1.-', 'PS1.-')
  .wire('G1.+', 'Q1.g').wire('G1.-', 'Q1.s').wire('G2.+', 'Q2.g').wire('G2.-', 'Q2.s').wire('PS1.-', 'GND1.gnd').doc
const hbridge = (src: 'supply' | 'battery') => {
  const b = circuit()
  if (src === 'supply') b.add('PS1', 'dc-supply', 4, 17, 0, { V: 24, Ilim: 3 }).add('F1', 'fuse', 10, 4, 0, { Irated: 3 })
  else b.add('B1', 'battery', 4, 17, 0, { V: 12 }).add('F1', 'fuse', 10, 4, 0, { Irated: 5 })
  const S = src === 'supply' ? 'PS1' : 'B1'
  b.add('Q1', 'mosfet', 22, 10).add('Q2', 'mosfet', 22, 24).add('Q3', 'mosfet', 42, 10).add('Q4', 'mosfet', 42, 24)
    .add('G1', 'gate-source', 15, 14).add('G2', 'gate-source', 15, 28).add('G3', 'gate-source', 35, 14).add('G4', 'gate-source', 35, 28)
    .add('GND1', 'ground', 4, 32)
    .wire(`${S}.+`, 'F1.1').wire('F1.2', 'Q1.d').wire('F1.2', 'Q3.d').wire('Q1.s', 'Q2.d').wire('Q3.s', 'Q4.d').wire('Q2.s', `${S}.-`).wire('Q4.s', `${S}.-`)
    .wire('G1.+', 'Q1.g').wire('G1.-', 'Q1.s').wire('G2.+', 'Q2.g').wire('G2.-', 'Q2.s').wire('G3.+', 'Q3.g').wire('G3.-', 'Q3.s').wire('G4.+', 'Q4.g').wire('G4.-', 'Q4.s')
    .wire(`${S}.-`, 'GND1.gnd')
  return b
}
const ex9 = hbridge('supply').add('LA1', 'ac-load', 32, 17, 90, { R: 24 }).wire('Q1.s', 'LA1.1').wire('Q3.s', 'LA1.2').doc
const ex10 = hbridge('battery').add('T1', 'transformer', 52, 17, 0, { n: 10 }).add('LA1', 'ac-load', 60, 17, 0, { R: 1000 }).wire('Q1.s', 'T1.p1').wire('Q3.s', 'T1.p2').wire('T1.s1', 'LA1.1').wire('T1.s2', 'LA1.2').doc

export const CIRCUIT_EXERCISES: CircuitExercise[] = [
  {
    id: 'ckt-01',
    title: 'Battery and resistor circuit',
    level: 'foundation',
    objectives: ['Build a closed loop: source → load → back to source.', 'Relate current to voltage and resistance with Ohm’s law.', 'Check the resistor’s power rating, P = I²·R.'],
    steps: ['Place a bench DC supply (12 V, 1 A limit) and a resistor (1 kΩ).', 'Wire the supply + to one end of the resistor.', 'Wire the other end of the resistor back to the supply −.', 'Add a ground symbol on the supply − to define 0 V.', 'Select the resistor and read its current; compare with I = V/R.', 'Choose “Check exercise”.'],
    expected: ['PS1 + → R1 terminal 1', 'R1 terminal 2 → PS1 −', 'PS1 − → ground'],
    assessment: 'Pass when current flows through the resistor, the measured current equals V/R, and the resistor is within its power rating, with no short circuit.',
    toolbox: ['dc-supply', 'battery', 'resistor', 'ground', 'switch'],
    starter: empty(),
    reference: ex1,
    safety: LV,
  },
  {
    id: 'ckt-02',
    title: 'LED circuit',
    level: 'foundation',
    objectives: ['Identify LED anode and cathode and forward bias.', 'Calculate a current-limiting resistor: R = (V − V_f) / I.', 'Keep the LED within its current rating.'],
    steps: ['Place a 9 V supply, a resistor and an LED.', 'Connect supply + → resistor → LED anode (A).', 'Connect the LED cathode (K) back to supply −.', 'Choose R so the LED current is 5–20 mA (try 470 Ω).', 'Check what happens with no resistor, or with the LED reversed.', 'Choose “Check exercise”.'],
    expected: ['PS1 + → R1', 'R1 → LED1 anode (A)', 'LED1 cathode (K) → PS1 −'],
    assessment: 'Pass when the LED is forward-biased, its current flows through a series resistor, and the current is 5–20 mA.',
    toolbox: ['dc-supply', 'battery', 'resistor', 'led', 'switch', 'ground'],
    starter: empty(),
    reference: ex2,
    safety: LV,
  },
  {
    id: 'ckt-03',
    title: 'Capacitor charging and discharging',
    level: 'foundation',
    objectives: ['Charge a capacitor through a resistor and predict τ = R·C.', 'Discharge it safely through a resistor, never a dead short.', 'Observe electrolytic polarity.'],
    steps: ['Place a 12 V supply, switch S1, a 1 kΩ charge resistor and a 1000 µF electrolytic capacitor.', 'Wire supply + → S1 → R1 → capacitor +, and capacitor − → supply −.', 'Add switch S2 with a 2.2 kΩ discharge resistor across the capacitor.', 'Toggle S1 and S2 and watch the charge and discharge curves in the exercise panel.', 'Choose “Check exercise”.'],
    expected: ['PS1 + → S1 → R1 → C1 +', 'C1 − → PS1 −', 'C1 + → S2 → R2 → C1 −'],
    assessment: 'Pass when one switch position charges the capacitor to the supply voltage through a resistor, with correct polarity, and another discharges it through a resistor. τ is reported for both.',
    toolbox: ['dc-supply', 'switch', 'resistor', 'electrolytic', 'capacitor', 'ground'],
    starter: empty(),
    reference: ex3,
    safety: `${LV} Discharge capacitors through a resistor, never with a screwdriver.`,
  },
  {
    id: 'ckt-04',
    title: 'Bridge rectifier',
    level: 'intermediate',
    objectives: ['Convert AC to DC with four diodes.', 'Trace which pair of diodes conducts on each half-cycle.', 'Account for two diode drops: V_out ≈ V_peak − 2·V_f.'],
    steps: ['Place an isolated 12 V AC source, four diodes and a DC load (100 Ω).', 'Join the two upper diodes’ cathodes to the load + and the two lower diodes’ anodes to the load −.', 'Connect AC L to D1 anode and D3 cathode; AC N to D2 anode and D4 cathode.', 'Check both half-cycles in the validation panel.', 'Choose “Check exercise”.'],
    expected: ['AC1 L → D1 A and D3 K', 'AC1 N → D2 A and D4 K', 'D1 K, D2 K → LD1 +', 'D3 A, D4 A → LD1 −'],
    assessment: 'Pass when the load current flows in the same direction on both half-cycles, the load voltage is about V_peak − 2·V_f, and a different pair of diodes conducts each half-cycle.',
    toolbox: ['ac-source', 'diode', 'dc-load', 'resistor', 'ground'],
    starter: empty(),
    reference: ex4,
    safety: LV,
  },
  {
    id: 'ckt-05',
    title: 'DC filtering',
    level: 'intermediate',
    objectives: ['Smooth rectified DC with a reservoir capacitor.', 'Estimate ripple: ΔV ≈ I / (2·f·C) for full-wave rectification.', 'Choose capacitance and voltage rating.'],
    steps: ['Build the bridge rectifier from exercise 4.', 'Connect an electrolytic capacitor directly across the load, + to the positive output.', 'Set C so the estimated ripple is at most 1.0 V (the default 1000 µF is too small).', 'Make the capacitor’s voltage rating exceed the peak output.', 'Choose “Check exercise”.'],
    expected: ['Bridge rectifier as exercise 4', 'C1 + → LD1 +', 'C1 − → LD1 −'],
    assessment: 'Pass when the rectifier works, the capacitor is across the load with correct polarity, estimated ripple ≤ 1.0 V and the voltage rating exceeds the peak.',
    toolbox: ['ac-source', 'diode', 'dc-load', 'electrolytic', 'resistor', 'ground'],
    starter: empty(),
    reference: ex5,
    safety: LV,
  },
  {
    id: 'ckt-06',
    title: 'MOSFET switching',
    level: 'intermediate',
    objectives: ['Use an N-channel MOSFET as a low-side switch.', 'Drive the gate relative to the source through a gate resistor.', 'Calculate conduction loss, I²·R_DS(on).'],
    steps: ['Place a 12 V supply, a 24 Ω DC load (lamp), a MOSFET, a gate-drive signal and a 47 Ω gate resistor.', 'Supply + → load +; load − → MOSFET drain; MOSFET source → supply −.', 'Gate signal OUT → gate resistor → MOSFET gate; gate signal REF → MOSFET source.', 'Toggle the gate signal High/Low in the properties panel and watch the load current.', 'Choose “Check exercise”.'],
    expected: ['PS1 + → LD1 +', 'LD1 − → Q1 D', 'Q1 S → PS1 −', 'G1 OUT → RG1 → Q1 G', 'G1 REF → Q1 S'],
    assessment: 'Pass when the MOSFET is a low-side switch with a gate resistor and correctly referenced drive, the load is off with the gate low and fully on with the gate high.',
    toolbox: ['dc-supply', 'dc-load', 'mosfet', 'gate-source', 'resistor', 'ground'],
    starter: empty(),
    reference: ex6,
    safety: LV,
  },
  {
    id: 'ckt-07',
    title: 'Transformer connection',
    level: 'intermediate',
    objectives: ['Connect primary and secondary windings correctly.', 'Apply V_s = n·V_p with n = N_s/N_p.', 'Keep primary and secondary isolated; never apply DC to a winding.'],
    steps: ['Place a 24 V AC source, a transformer (n = 0.5) and an AC load (100 Ω).', 'Connect the AC source across P1–P2.', 'Connect the load across S1–S2.', 'Try a DC supply on the primary to see why it is rejected.', 'Choose “Check exercise”.'],
    expected: ['AC1 L → T1 P1', 'AC1 N → T1 P2', 'T1 S1 → LA1', 'T1 S2 → LA1'],
    assessment: 'Pass when the source drives the primary, the load is on the secondary, the windings stay isolated, no DC touches a winding, and V_s = n·V_p on both half-cycles.',
    toolbox: ['ac-source', 'transformer', 'ac-load', 'dc-supply', 'ground'],
    starter: empty(),
    reference: ex7,
    safety: '24 V AC is within the low-voltage pathway. Mains-voltage transformers are simulated only.',
  },
  {
    id: 'ckt-08',
    title: 'Half-bridge',
    level: 'advanced',
    objectives: ['Build a totem-pole half-bridge from two MOSFETs.', 'Drive the high-side gate with a floating supply referenced to the switch node.', 'Recognise shoot-through and why switches in a leg are complementary.'],
    steps: ['The parts are placed for you: wire the circuit.', 'Supply + → fuse → Q1 drain (high side). Q1 source → Q2 drain (output node). Q2 source → supply −.', 'Load from the output node to supply −.', 'G1 drives Q1 with REF on the output node (floating); G2 drives Q2 with REF on supply −.', 'Set G1 high / G2 low, then the opposite, and read the output.', 'Choose “Check exercise” (it also demonstrates what happens if both switches turn on).'],
    expected: ['PS1 + → F1 → Q1 D', 'Q1 S → Q2 D (output)', 'Q2 S → PS1 −', 'Output → LD1 → PS1 −', 'G1 OUT → Q1 G, G1 REF → Q1 S', 'G2 OUT → Q2 G, G2 REF → Q2 S'],
    assessment: 'Pass when a leg is found with fused supply, each switch driven, the high-side drive floating on the output node, and the output equals V_bus or 0 V in the two complementary states.',
    toolbox: ['dc-supply', 'fuse', 'mosfet', 'gate-source', 'dc-load', 'resistor', 'ground'],
    starter: partsOnly(ex8),
    reference: ex8,
    safety: LV,
  },
  {
    id: 'ckt-09',
    title: 'Full H-bridge',
    level: 'advanced',
    objectives: ['Combine two legs into an H-bridge.', 'Reverse the load voltage with diagonal switch pairs.', 'Avoid shoot-through in either leg.'],
    steps: ['The parts are placed for you: wire both legs from the fused supply.', 'Connect the load between the two leg outputs.', 'Give every switch its gate drive; high-side REFs on their leg outputs, low-side REFs on supply −.', 'State A: Q1 and Q4 high. State B: Q3 and Q2 high. Compare the load voltage.', 'Choose “Check exercise”. This exercise also counts as practical assessment asm-03.'],
    expected: ['PS1 + → F1 → Q1 D and Q3 D', 'Q1 S → Q2 D (output A); Q3 S → Q4 D (output B)', 'Q2 S, Q4 S → PS1 −', 'LA1 between output A and output B', 'Each G REF on its switch source'],
    assessment: 'Pass when two fused legs drive the load across their outputs, all gate drives are correctly referenced, and the load sees +V_bus in state A and −V_bus in state B.',
    toolbox: ['dc-supply', 'fuse', 'mosfet', 'gate-source', 'ac-load', 'dc-load', 'resistor', 'ground'],
    starter: partsOnly(ex9),
    reference: ex9,
    safety: LV,
  },
  {
    id: 'ckt-10',
    title: 'Basic inverter architecture',
    level: 'advanced',
    objectives: ['Assemble battery, protection, H-bridge and step-up transformer into an inverter.', 'Explain how alternating bridge states become AC on the secondary.', 'Recognise the hazardous output (simulated).'],
    steps: ['The parts are placed for you: wire the battery through the fuse to the H-bridge.', 'Connect the transformer primary across the bridge outputs, and the AC load across the secondary.', 'Wire all gate drives as in exercise 9.', 'Alternate the diagonal states and read the secondary voltage.', 'Choose “Check exercise”.'],
    expected: ['B1 + → F1 only', 'F1 → Q1 D and Q3 D', 'Bridge outputs → T1 P1 and P2', 'T1 S1, S2 → LA1'],
    assessment: 'Pass when the battery is fused, the bridge drives the primary, the load is on the secondary, and the secondary voltage reverses between states at n × the bridge voltage.',
    toolbox: ['battery', 'fuse', 'mosfet', 'gate-source', 'transformer', 'ac-load', 'resistor', 'ground'],
    starter: partsOnly(ex10),
    reference: ex10,
    safety: 'The secondary of this inverter reaches about 120 V: simulated only. Never build mains-voltage outputs as a student exercise.',
  },
]

export const CIRCUIT_EXERCISE_BY_ID: Record<string, CircuitExercise> = Object.fromEntries(CIRCUIT_EXERCISES.map((e) => [e.id, e]))
