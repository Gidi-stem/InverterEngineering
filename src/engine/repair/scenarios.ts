import { circuit } from '../circuit/build'
import { BATTERY_PRESETS, readBattery } from '../instruments/battery'
import { liveDmmSeriesPoint, liveDmmTwoProbePoint } from '../instruments/liveProbe'
import { measure } from '../sim/analysis'
import { recordRun } from '../sim/record'
import { arrayCurve, cellTemp, curveCurrent, mpp, operating, perturbObserve } from '../solar/pv'
import { SOLAR_PRESET_BY_ID } from '../solar/presets'
import { removeWiresTouching, withParam } from './faultOps'
import type { RepairReading, RepairScenario } from './types'

const round = (v: number, k = 2) => Math.round(v * 10 ** k) / 10 ** k

/** rsc-01 — reverse battery polarity at power-on. */
const c01healthy = circuit().add('B1', 'battery', 0, 0, 0, { V: 12, Rint: 0.05 }).add('D1', 'diode', 4, 0, 0, { Vf: 0.7 }).add('LD1', 'dc-load', 8, 0, 0, { R: 24 }).wire('B1.+', 'D1.a').wire('D1.k', 'LD1.+').wire('LD1.-', 'B1.-').doc
const c01fault = circuit().add('B1', 'battery', 0, 0, 0, { V: 12, Rint: 0.05 }).add('D1', 'diode', 4, 0, 0, { Vf: 0.7 }).add('LD1', 'dc-load', 8, 0, 0, { R: 24 }).wire('B1.-', 'D1.a').wire('D1.k', 'LD1.+').wire('LD1.-', 'B1.+').doc
const dcAcross = (doc: ReturnType<typeof circuit>['doc'], aId: string, aT: string, bId: string, bT: string, label: string, healthy?: number): RepairReading => {
  const v = liveDmmTwoProbePoint(doc, { partId: aId, terminalId: aT }, { partId: bId, terminalId: bT }).dcVoltage
  return { label, value: round(v ?? 0, 2), unit: 'V', healthy }
}

/** rsc-02 — blown DC input fuse. */
const c02healthy = circuit().add('B1', 'battery', 0, 0, 0, { V: 12, Rint: 0.05 }).add('F1', 'fuse', 4, 0, 0, { Irated: 10 }).add('LD1', 'dc-load', 8, 0, 0, { R: 6 }).wire('B1.+', 'F1.1').wire('F1.2', 'LD1.+').wire('LD1.-', 'B1.-').doc
const c02fault = removeWiresTouching(c02healthy, 'F1.2')

/** rsc-03 — a loose, high-resistance connector that drops out under load. */
const c03healthy = circuit().add('B1', 'battery', 0, 0, 0, { V: 12, Rint: 0.05 }).add('R1', 'resistor', 4, 0, 0, { R: 0.02, Pmax: 50 }).add('LD1', 'dc-load', 8, 0, 0, { R: 3 }).wire('B1.+', 'R1.1').wire('R1.2', 'LD1.+').wire('LD1.-', 'B1.-').doc
const c03fault = withParam(c03healthy, 'R1', 'R', 2.5)

/** rsc-04 — control-supply rectifier smoothing capacitor dried out (excessive ripple). */
const c04 = (cUf: number) => circuit().add('AC1', 'ac-source', 0, 0, 0, { Vrms: 12, f: 50 }).add('D1', 'diode', 4, 0, 0, { Vf: 0.7 }).add('C1', 'electrolytic', 8, 0, 0, { C: cUf, Vmax: 25 }).add('LD1', 'dc-load', 12, 0, 0, { R: 24 }).wire('AC1.1', 'D1.a').wire('D1.k', 'C1.+').wire('D1.k', 'LD1.+').wire('C1.-', 'AC1.2').wire('LD1.-', 'AC1.2').doc
function rippleReading(doc: ReturnType<typeof circuit>['doc'], label: string, healthyPkPk?: number): RepairReading {
  const key = 'T:C1.+|T:C1.-'
  const r = recordRun(doc, 0.12, [key], 0.08)
  const m = r.ok ? measure(r.traces[key], r.h) : { pkpk: 0 }
  return { label, value: round(m.pkpk, 2), unit: 'V pk-pk', healthy: healthyPkPk }
}

/** rsc-05 — aged / sulfated battery: terminal voltage collapses under load. */
const c05healthy = BATTERY_PRESETS['lead-acid-12v-healthy']
const c05fault = BATTERY_PRESETS['lead-acid-12v-aged']

/** rsc-06 — a flat/deeply-discharged battery trips the inverter's low-battery cut-off. */
const c06healthy = { ...BATTERY_PRESETS['lifepo4-48v-healthy'] }
const c06fault = { ...BATTERY_PRESETS['lifepo4-48v-healthy'], stateOfChargePct: 8 }

/** rsc-07 — a corroded/cracked PCB track opens the DC bus. */
const c07healthy = circuit().add('B1', 'battery', 0, 0, 0, { V: 12, Rint: 0.05 }).add('TRK', 'resistor', 4, 0, 0, { R: 0.03, Pmax: 10 }).add('LD1', 'dc-load', 8, 0, 0, { R: 12 }).wire('B1.+', 'TRK.1').wire('TRK.2', 'LD1.+').wire('LD1.-', 'B1.-').doc
const c07fault = removeWiresTouching(c07healthy, 'TRK.2')

/** rsc-08 — a switching MOSFET has failed open (no drain connection). */
const c08healthy = circuit()
  .add('PS1', 'dc-supply', 0, 0, 0, { V: 24, Ilim: 5 })
  .add('G1', 'gate-source', 4, -4, 0, { Vhigh: 12 }, { mode: 0, level: 1 })
  .add('LD1', 'dc-load', 4, 4, 0, { R: 8 })
  .add('Q1', 'mosfet', 8, 0, 0, { Vth: 4, Ron: 0.05 })
  .wire('PS1.+', 'LD1.+')
  .wire('LD1.-', 'Q1.d')
  .wire('Q1.s', 'PS1.-')
  .wire('G1.+', 'Q1.g')
  .wire('G1.-', 'PS1.-')
  .doc
const c08fault = removeWiresTouching(c08healthy, 'Q1.d')

/** rsc-09 — a switching MOSFET has failed short (drain–source bridged internally): it never turns off. */
const c09healthy = circuit()
  .add('PS1', 'dc-supply', 0, 0, 0, { V: 24, Ilim: 5 })
  .add('G1', 'gate-source', 4, -4, 0, { Vhigh: 12 }, { mode: 0, level: 0 })
  .add('LD1', 'dc-load', 4, 4, 0, { R: 8 })
  .add('Q1', 'mosfet', 8, 0, 0, { Vth: 4, Ron: 0.05 })
  .wire('PS1.+', 'LD1.+')
  .wire('LD1.-', 'Q1.d')
  .wire('Q1.s', 'PS1.-')
  .wire('G1.+', 'Q1.g')
  .wire('G1.-', 'PS1.-')
  .doc
const c09fault = circuit()
  .add('PS1', 'dc-supply', 0, 0, 0, { V: 24, Ilim: 5 })
  .add('G1', 'gate-source', 4, -4, 0, { Vhigh: 12 }, { mode: 0, level: 0 })
  .add('LD1', 'dc-load', 4, 4, 0, { R: 8 })
  .add('Q1', 'mosfet', 8, 0, 0, { Vth: 4, Ron: 0.05 })
  .add('RFAULT', 'resistor', 8, 4, 0, { R: 0.02, Pmax: 50 })
  .wire('PS1.+', 'LD1.+')
  .wire('LD1.-', 'Q1.d')
  .wire('Q1.s', 'PS1.-')
  .wire('G1.+', 'Q1.g')
  .wire('G1.-', 'PS1.-')
  .wire('RFAULT.1', 'Q1.d')
  .wire('RFAULT.2', 'Q1.s')
  .doc

/** rsc-10 — the gate driver's signal never reaches the switch (open gate connection). */
const c10healthy = c08healthy
const c10fault = removeWiresTouching(c08healthy, 'G1.+')

/** rsc-11 — the output filter inductor's winding has broken open. */
const c11healthy = circuit().add('PS1', 'dc-supply', 0, 0, 0, { V: 24, Ilim: 5 }).add('L1', 'inductor', 4, 0, 0, { L: 2, Rdc: 0.15 }).add('LD1', 'dc-load', 8, 0, 0, { R: 10 }).wire('PS1.+', 'L1.1').wire('L1.2', 'LD1.+').wire('LD1.-', 'PS1.-').doc
const c11fault = removeWiresTouching(c11healthy, 'L1.2')

export const REPAIR_SCENARIOS: RepairScenario[] = [
  {
    id: 'rsc-01',
    category: 'rep-01',
    domain: 'inverter',
    title: 'Reverse battery polarity at power-on',
    reportedProblem: 'The inverter was commissioned on a new battery bank and will not power on at all. No display, no fan, nothing.',
    equipment: 'A small off-grid inverter whose DC input stage is a reverse-polarity protection diode in series with the internal DC bus, exactly as fitted on every build-lab project.',
    initialSymptoms: ['No power-on indication whatsoever', 'Battery reads a normal voltage at its own terminals', 'No burning smell and nothing visibly damaged'],
    usefulInstruments: ['Digital multimeter (DC voltage)'],
    unhelpfulInstruments: ['Oscilloscope (nothing is switching yet)', 'Clamp meter (the fault is a blocked DC path, not a current to clamp)'],
    diagram: 'Battery (+) → reverse-polarity protection diode (anode to battery +) → internal DC bus → inverter electronics → battery (−).',
    readings: () => [dcAcross(c01healthy, 'LD1', '+', 'LD1', '-', 'DC bus voltage (healthy wiring)'), dcAcross(c01fault, 'LD1', '+', 'LD1', '-', 'DC bus voltage (as found)')],
    checkpoints: [
      { id: 'k1', rubric: 'symptom', type: 'mcq', prompt: 'Which symptom most narrows this toward the DC input stage rather than the control electronics?', options: ['No power-on indication at all, with a normal battery voltage at its own terminals', 'A burning smell', 'A fan running with no display', 'A display that flickers'], answer: 0, explain: 'A completely dead unit with a healthy battery points at the path between the battery and the bus, not at the electronics that path feeds.' },
      { id: 'k2', rubric: 'instrument', type: 'mcq', prompt: 'What should you measure first?', options: ['DC voltage at the internal bus, with the battery connected as found', 'AC voltage at the output terminals', 'Continuity of the output relay', 'Insulation resistance of the output cable'], answer: 0, explain: 'The bus is the next point downstream of the suspected blockage.' },
      { id: 'k3', rubric: 'procedure', type: 'mcq', prompt: 'Before probing, what must you confirm about the meter and connections?', options: ['The meter is set to DC volts, on the correct range, with black lead on the bus return', 'The meter is set to AC volts', 'The circuit is isolated first', 'The battery is disconnected first'], answer: 0, explain: 'This is a live DC reading, not an isolation procedure: isolating the battery would remove the very voltage you need to read.' },
      { id: 'k4', rubric: 'interpret', type: 'mcq', prompt: 'The bus reads close to 0 V while the battery itself reads a normal 12 V. What does that tell you?', options: ['Something between the battery and the bus is blocking the path', 'The battery is flat', 'The load is open-circuit', 'The meter is faulty'], answer: 0, explain: 'A healthy source with no voltage reaching the next point downstream means the path between them is interrupted.' },
      { id: 'k5', rubric: 'eliminate', type: 'multi', prompt: 'Given the readings, which of these can you now rule out?', options: ['The battery is flat', 'A blown input fuse would look electrically identical here', 'The electronics downstream have failed', 'The protection diode is reverse-biased because the battery leads are swapped'], answers: [0, 2], explain: 'The battery itself reads normally, which rules it out, and a bus at 0 V with nothing drawing current means the electronics have not even been reached — they cannot yet be blamed. A blown fuse is a genuinely open question at this stage (also worth checking); reversed polarity is the actual cause here, not yet ruled out.' },
      { id: 'k6', rubric: 'diagnose', type: 'mcq', prompt: 'What is the confirmed fault?', options: ['The battery leads were connected with reversed polarity, so the protection diode blocks the reverse voltage', 'The protection diode has failed open', 'The battery is internally failed', 'The DC bus capacitor is short-circuited'], answer: 0, explain: 'A diode blocks current in the reverse direction by design: this is the protection working correctly against a wiring error, not a component failure.' },
      { id: 'k7', rubric: 'repair', type: 'mcq', prompt: 'What is the correct repair?', options: ['Isolate, correct the battery polarity, re-verify with a meter before reconnecting, then test', 'Replace the diode', 'Replace the battery', 'Bypass the diode'], answer: 0, explain: 'Nothing has failed; the wiring error must be corrected, and bypassing the protection diode would remove a safety feature.' },
      { id: 'k8', rubric: 'verify', type: 'mcq', prompt: 'After correcting the polarity, what confirms the repair?', options: ['The DC bus now reads close to the battery voltage (minus the normal diode drop) and the unit powers on', 'The battery voltage changes', 'The diode gets warm', 'The fuse rating increases'], answer: 0, explain: 'Restoring the healthy voltage at the bus, with the unit powering on normally, is the functional confirmation.' },
    ],
    candidateCauses: ['Reversed battery polarity at the DC input', 'A blown DC input fuse', 'A failed protection diode', 'An internally failed battery', 'A short-circuited DC bus capacitor'],
    confirmedFault: 'Reversed battery polarity: the protection diode is correctly blocking the reverse-biased connection.',
    repairSteps: [
      { id: 'inspect', detail: 'Read the reported symptom and check the battery terminal labelling against the inverter\'s input labelling.' },
      { id: 'isolate', detail: 'Switch off any load and open the battery breaker before touching the DC wiring.' },
      { id: 'discharge', detail: 'No significant stored energy here beyond the battery itself; proceed to proving dead on the wiring to be moved.' },
      { id: 'visual', detail: 'Visually confirm which lead is on which terminal at both the battery and the inverter.' },
      { id: 'measure', detail: 'Measure the bus voltage as found, then measure polarity at the battery terminals directly.' },
      { id: 'remove', detail: 'Disconnect the reversed leads.' },
      { id: 'replace', detail: 'Reconnect with correct polarity (no component is replaced; this is a wiring correction).' },
      { id: 'solder', detail: 'Re-torque/re-crimp the lugs if disturbed; no soldering is normally needed on a battery lead.' },
      { id: 'post-test', detail: 'Re-energise with the inverter\'s own breaker, unloaded first.' },
      { id: 'verify', detail: 'Confirm the bus voltage and that the unit powers on and accepts load.' },
      { id: 'document', detail: 'Record the wiring error and the corrected connection for the installation record.' },
    ],
    verificationNote: 'The DC bus voltage must return to the healthy reading (battery voltage less the normal diode drop), and the unit must power on and accept load — not just "read something".',
    safety: 'Battery DC is not switched off by removing a load: isolate at the battery breaker before touching any DC wiring, and verify polarity with a meter before reconnecting.',
  },
  {
    id: 'rsc-02',
    category: 'rep-01',
    domain: 'inverter',
    title: 'Blown DC input fuse',
    reportedProblem: 'The inverter powered off abruptly during a surge load (a pump starting) and has not powered on since.',
    equipment: 'The same DC input stage, now with its rated input fuse fitted between the battery and the bus.',
    initialSymptoms: ['No power-on indication', 'The event coincided with a known high-current surge', 'No smell of burning, no visible damage to the enclosure'],
    usefulInstruments: ['Digital multimeter (DC voltage, then resistance/continuity with the circuit isolated)'],
    unhelpfulInstruments: ['Clamp meter (there is no current flowing to clamp while the fuse is open)', 'Insulation tester (this is not an insulation fault)'],
    diagram: 'Battery (+) → input fuse → internal DC bus → inverter electronics → battery (−).',
    readings: () => [
      { label: 'DC bus voltage at the load', value: round(liveDmmTwoProbePoint(c02fault, { partId: 'LD1', terminalId: '+' }, { partId: 'LD1', terminalId: '-' }).dcVoltage ?? 0, 2), unit: 'V', healthy: round(liveDmmTwoProbePoint(c02healthy, { partId: 'LD1', terminalId: '+' }, { partId: 'LD1', terminalId: '-' }).dcVoltage ?? 0, 2) },
      { label: 'Voltage present across the fuse holder\'s output side (battery still connected, live test)', value: round(liveDmmTwoProbePoint(c02fault, { partId: 'F1', terminalId: '2' }, { partId: 'LD1', terminalId: '+' }).dcVoltage ?? 0, 1), unit: 'V', healthy: round(liveDmmTwoProbePoint(c02healthy, { partId: 'F1', terminalId: '2' }, { partId: 'LD1', terminalId: '+' }).dcVoltage ?? 0, 2) },
    ],
    checkpoints: [
      { id: 'k1', rubric: 'symptom', type: 'mcq', prompt: 'Which detail points specifically at an overcurrent protection device rather than a wiring error?', options: ['The failure coincided with a known high-current surge', 'There is no power-on indication', 'The battery is new', 'The enclosure is undamaged'], answer: 0, explain: 'A fuse exists precisely to open on a surge; the timing is the strongest clue.' },
      { id: 'k2', rubric: 'instrument', type: 'mcq', prompt: 'With the battery still safely connected, what quick live test across the fuse (input side to output side) helps localise the break before isolating anything?', options: ['DC voltage present across the fuse', 'AC voltage', 'Inductance', 'Clamp current'], answer: 0, explain: 'A live voltage-presence test across a suspect fuse is a standard quick check: a healthy, closed fuse drops almost no voltage across itself, while an open one shows the source voltage across the break.' },
      { id: 'k3', rubric: 'procedure', type: 'mcq', prompt: 'What must you do before removing the fuse itself to inspect or replace it, once the live test has pointed at it?', options: ['Isolate the battery and prove the circuit dead first', 'Increase the meter range', 'Leave the battery connected while removing the fuse', 'Short the fuse holder first'], answer: 0, explain: 'A live voltage test is safe to localise the fault, but the fuse must never be removed or replaced while still live.' },
      { id: 'k4', rubric: 'interpret', type: 'mcq', prompt: 'The live test shows close to the full battery voltage across the fuse, where a healthy, closed fuse shows almost none. What does this confirm?', options: ['The fuse element has opened', 'The fuse is undersized', 'The battery is flat', 'The bus capacitor has failed'], answer: 0, explain: 'A full source voltage appearing across a device that should drop almost none is the signature of an open circuit inside it.' },
      { id: 'k5', rubric: 'eliminate', type: 'multi', prompt: 'Which of these are ruled out by this live-voltage evidence alone?', options: ['A flat battery (a flat battery could not supply this voltage across the gap at all)', 'Reversed battery polarity (this test still shows the expected open-fuse signature regardless of polarity, so it is not specific to this)', 'The fuse being open', 'The protection diode\'s condition (not yet tested)'], answers: [0], explain: 'A flat battery could not produce this reading at all, which rules it out; the fuse-open evidence is specific and confirmed. Polarity and the diode are separate, unconfirmed questions this particular reading does not settle either way.' },
      { id: 'k6', rubric: 'diagnose', type: 'mcq', prompt: 'What is the confirmed fault?', options: ['The DC input fuse has opened, most likely from the reported surge', 'The battery is discharged', 'The protection diode has failed', 'A PCB track has corroded'], answer: 0, explain: 'The voltage evidence is specific to the fuse.' },
      { id: 'k7', rubric: 'repair', type: 'mcq', prompt: 'What is the correct repair, and what must be checked first?', options: ['Before replacing the fuse, check that the surge was within the inverter\'s rated surge capability (not a symptom of a deeper fault), then fit a fuse of the SAME rating and type', 'Fit a higher-rated fuse so it will not blow again', 'Bridge the fuse holder permanently', 'Replace the battery'], answer: 0, explain: 'Simply fitting a bigger fuse removes the protection the original rating was providing; if the surge was within the unit\'s own rating, a repeated blow points to a separate, deeper fault that must be found first.' },
      { id: 'k8', rubric: 'verify', type: 'mcq', prompt: 'After fitting a new fuse, what confirms the repair?', options: ['Continuity across the new fuse reads near zero, and the bus voltage returns to normal on power-up, including under the original surge load', 'The inverter powers on with no load tested', 'The fuse looks physically intact', 'The battery voltage is checked once'], answer: 0, explain: 'Verification must repeat the condition that caused the original failure (the surge load), not just confirm power-on at no load.' },
    ],
    candidateCauses: ['A blown DC input fuse from a rated surge', 'Reversed battery polarity', 'A failed protection diode', 'An internally failed battery', 'A corroded PCB track'],
    confirmedFault: 'The DC input fuse opened under the reported surge current.',
    repairSteps: [
      { id: 'inspect', detail: 'Check the inverter\'s rated surge capability against the known load (the pump\'s starting current) before assuming the fuse is simply undersized.' },
      { id: 'isolate', detail: 'Open the battery isolator/breaker and lock it off.' },
      { id: 'discharge', detail: 'The DC bus capacitor is small here; confirm it reads near zero before handling the fuse holder.' },
      { id: 'visual', detail: 'Inspect the fuse holder and element for discolouration, and the surrounding wiring for heat damage.' },
      { id: 'measure', detail: 'Measure resistance across the isolated fuse holder to confirm it is open.' },
      { id: 'remove', detail: 'Remove the blown fuse.' },
      { id: 'replace', detail: 'Fit a new fuse of the same rating and type (never a higher rating).' },
      { id: 'solder', detail: 'Not applicable to a cartridge fuse holder; re-seat and re-torque its terminals.' },
      { id: 'post-test', detail: 'Re-energise unloaded, then apply the original surge load under controlled observation.' },
      { id: 'verify', detail: 'Confirm normal bus voltage and that the fuse does not reopen under the same surge.' },
      { id: 'document', detail: 'Record the fuse replacement and the surge-capability check performed.' },
    ],
    verificationNote: 'Verification must repeat the surge condition that caused the failure, not just confirm power-on with no load.',
    safety: 'Never fit a higher-rated fuse than specified: the rating protects the wiring and the inverter\'s own internal conductors, not only the load.',
  },
  {
    id: 'rsc-03',
    category: 'rep-01',
    domain: 'component',
    title: 'A loose connector that only fails under load',
    reportedProblem: 'The inverter powers on fine and runs small loads, but resets or dims as soon as a heavier load is switched on.',
    equipment: 'A DC input connection made with a crimped lug that was under-torqued during commissioning.',
    initialSymptoms: ['Normal operation at light load', 'Voltage sag or reset specifically when current rises', 'The connector feels warm to the touch after a heavy-load run'],
    usefulInstruments: ['Digital multimeter (DC voltage, under load, at each side of the suspect joint)'],
    unhelpfulInstruments: ['Oscilloscope (this is a DC voltage-drop problem, not a waveform-quality one)', 'LCR meter (there is no reactive component here to characterise)'],
    diagram: 'Battery (+) → crimped lug joint (modelled as a small series resistance that rises under load/heat) → load.',
    readings: () => [dcAcross(c03healthy, 'LD1', '+', 'LD1', '-', 'Load terminal voltage, sound joint'), dcAcross(c03fault, 'LD1', '+', 'LD1', '-', 'Load terminal voltage, loose joint')],
    checkpoints: [
      { id: 'k1', rubric: 'symptom', type: 'mcq', prompt: 'Which symptom is the clearest sign of a load-dependent connection problem rather than a fixed fault?', options: ['Normal at light load, failing only as current rises', 'No power-on at all', 'A fault present from the very first switch-on', 'A fault that is the same at every load'], answer: 0, explain: 'A fault that only appears with current is consistent with a resistance that drops meaningful voltage only once current rises through it (V = I·R).' },
      { id: 'k2', rubric: 'instrument', type: 'mcq', prompt: 'What is the most direct instrument check here?', options: ['DC voltage at the load terminals, measured while the load is actually drawing current', 'Resistance with the circuit isolated and no load connected', 'AC frequency', 'Insulation resistance'], answer: 0, explain: 'An isolated, no-load resistance check can look perfectly healthy even on a joint that only drops voltage under current and heat; the under-load voltage reading is what actually reproduces the fault.' },
      { id: 'k3', rubric: 'procedure', type: 'mcq', prompt: 'How should the voltage be measured to find the joint responsible?', options: ['Across each suspect joint individually while under load, moving the test points along the path', 'Only at the battery terminals', 'Only at the inverter input terminals', 'With the load switched off'], answer: 0, explain: 'A voltage-drop test isolates which specific section of the path is dropping the voltage, by measuring across each joint in turn under load.' },
      { id: 'k4', rubric: 'interpret', type: 'mcq', prompt: 'The load terminal voltage sags well below the healthy reading only once the heavier load is applied. What does this show?', options: ['A series resistance somewhere in the path is dropping significant voltage under load', 'The battery has failed', 'The load itself is faulty', 'The meter is miscalibrated'], answer: 0, explain: 'A sag that appears specifically with current is the voltage-drop signature of an added series resistance.' },
      { id: 'k5', rubric: 'eliminate', type: 'multi', prompt: 'Which of these does the under-load voltage-drop evidence rule out as the cause?', options: ['A battery that is simply flat (a flat battery sags gradually with state of charge, not suddenly with load current at full charge)', 'The load device itself drawing more current than rated', 'A resistance in the connection path', 'A warm connector'], answers: [0], explain: 'A battery at a healthy charge does not reproduce a load-dependent sag this way; a resistance in the path explains both the sag and the warmth, and is consistent with (not ruled out by) the evidence.' },
      { id: 'k6', rubric: 'diagnose', type: 'mcq', prompt: 'What is the confirmed fault?', options: ['A loose/under-torqued connection is adding series resistance that drops significant voltage under load', 'The battery is discharged', 'The load device has failed', 'The fuse is undersized'], answer: 0, explain: 'The warmth, the load-dependence and the voltage-drop measurement all point to the same joint.' },
      { id: 'k7', rubric: 'repair', type: 'mcq', prompt: 'What is the correct repair?', options: ['Isolate, remake the joint correctly (clean, correct crimp or terminal, torqued to specification), then re-test under load', 'Add a second wire alongside the existing one without disturbing the joint', 'Increase the fuse rating to compensate', 'Replace the battery'], answer: 0, explain: 'The joint itself must be remade correctly; working around it with extra wire leaves a poor joint in place to fail further.' },
      { id: 'k8', rubric: 'verify', type: 'mcq', prompt: 'What confirms the repair is successful?', options: ['The load terminal voltage no longer sags when the heavy load is reapplied, and the joint stays cool', 'The joint looks neat', 'The inverter powers on at no load', 'The battery voltage is unchanged'], answer: 0, explain: 'Verification must repeat the load condition that exposed the fault.' },
    ],
    candidateCauses: ['A loose/under-torqued DC connection', 'A flat battery', 'An overloaded or faulty load device', 'An undersized fuse'],
    confirmedFault: 'A loose crimped connection is adding series resistance that drops significant voltage once load current rises.',
    repairSteps: [
      { id: 'inspect', detail: 'Note where the symptom appears relative to the load level, and feel (do not touch live) for warmth after a load run.' },
      { id: 'isolate', detail: 'Isolate the DC source before disturbing any joint.' },
      { id: 'discharge', detail: 'Confirm no residual bus voltage before handling the connector.' },
      { id: 'visual', detail: 'Inspect the lug and crimp for discolouration, looseness and incorrect tooling.' },
      { id: 'measure', detail: 'Voltage-drop test each joint along the path under the problem load.' },
      { id: 'remove', detail: 'Remove the defective lug/terminal.' },
      { id: 'replace', detail: 'Fit a new, correctly sized lug.' },
      { id: 'solder', detail: 'Crimp (or solder, if specified) and torque to the connector manufacturer\'s specification.' },
      { id: 'post-test', detail: 'Re-energise and apply the problem load under controlled observation.' },
      { id: 'verify', detail: 'Confirm the voltage drop across the joint is now negligible under the same load.' },
      { id: 'document', detail: 'Record the joint remade and the verification load applied.' },
    ],
    verificationNote: 'Re-apply the specific load that exposed the fault; a joint that passes at no load but fails under load is not actually verified by a no-load test.',
    safety: 'Isolate before remaking any DC connection; a loose joint under load can run hot enough to burn.',
  },
  {
    id: 'rsc-04',
    category: 'rep-02',
    domain: 'component',
    title: 'Dried-out smoothing capacitor: excessive ripple',
    reportedProblem: 'The control board resets intermittently under load; a colleague says the control supply "looks noisy" on the scope.',
    equipment: 'The inverter\'s low-voltage control supply: a small AC step-down, a rectifier diode and a smoothing electrolytic capacitor feeding the control electronics.',
    initialSymptoms: ['Intermittent control-board resets, worse under load', 'An audible high-pitched noise from the control board at times', 'No visible damage, but the capacitor is several years old'],
    usefulInstruments: ['Oscilloscope (ripple on the DC rail)', 'ESR meter (capacitor condition, with the board isolated and the capacitor discharged)'],
    unhelpfulInstruments: ['Clamp meter (ripple is a voltage-quality question here, not a current-magnitude one)', 'Insulation tester'],
    diagram: 'AC step-down → rectifier diode → smoothing capacitor (in parallel with the control load) → control electronics.',
    readings: () => [rippleReading(c04(1000), 'Ripple on the control rail, healthy capacitor', undefined), rippleReading(c04(15), 'Ripple on the control rail, as found')],
    checkpoints: [
      { id: 'k1', rubric: 'symptom', type: 'mcq', prompt: 'Which symptom is most specific to a smoothing-capacitor problem rather than a control-logic fault?', options: ['Resets that worsen under load, with an audible high-pitched noise', 'A fault present even with no load at all', 'A fault that never varies with load', 'A display backlight fault'], answer: 0, explain: 'Load-dependent misbehaviour of the SUPPLY rail (not the logic) with audible switching noise is consistent with excessive ripple, not a logic fault.' },
      { id: 'k2', rubric: 'instrument', type: 'mcq', prompt: 'Which instrument directly shows whether the rail is "noisy"?', options: ['The oscilloscope, on the DC rail with the supply running', 'The clamp meter', 'The insulation tester', 'The LCR meter on the running board'], answer: 0, explain: 'Ripple is a time-varying voltage: the oscilloscope is the direct tool for it.' },
      { id: 'k3', rubric: 'procedure', type: 'mcq', prompt: 'How should the capacitor itself be condition-tested, once a fault is suspected?', options: ['Isolate, discharge, then measure ESR with a dedicated ESR meter (in-circuit DC resistance readings are not reliable for this)', 'Measure its capacitance while still powered', 'Measure AC voltage across it while powered, and infer ESR from that alone', 'Visually inspect only'], answer: 0, explain: 'ESR measurement needs the capacitor isolated and discharged; a powered in-circuit reading is not a valid ESR test.' },
      { id: 'k4', rubric: 'interpret', type: 'mcq', prompt: 'The ripple reading is many times larger than the healthy figure. What does a large RISE in ripple, at the same load and frequency, indicate?', options: ['The smoothing capacitance available has fallen well below its rated value', 'The AC input voltage has risen', 'The rectifier diode has failed short', 'The load resistance has risen'], answer: 0, explain: 'Ripple amplitude for a given load current and frequency is set mainly by the smoothing capacitance; a large rise in ripple with everything else unchanged points at lost capacitance.' },
      { id: 'k5', rubric: 'eliminate', type: 'multi', prompt: 'Which of these does the ripple-only evidence rule out so far?', options: ['A rise in AC input voltage (this would raise the DC level, not specifically the ripple shape for a given load)', 'A capacitor that has lost most of its effective capacitance', 'A change in the load current drawn (not yet tested, so not ruled out either way)', 'A diode that has failed open (this would remove rectification almost entirely, a far larger and different-shaped change than extra ripple at the same frequency)'], answers: [0, 3], explain: 'A supply-voltage rise would raise the mean level, not specifically worsen ripple shape, and a fully open diode would look dramatically different (far larger, and at half the ripple frequency) — neither matches this evidence as well as lost capacitance does.' },
      { id: 'k6', rubric: 'diagnose', type: 'mcq', prompt: 'What is the confirmed fault?', options: ['The smoothing (electrolytic) capacitor has dried out and lost most of its effective capacitance', 'The rectifier diode has failed short', 'The AC step-down transformer has failed', 'The control electronics logic has failed'], answer: 0, explain: 'The ripple signature and the capacitor\'s age both point the same way; an ESR test would confirm it directly.' },
      { id: 'k7', rubric: 'repair', type: 'mcq', prompt: 'What is the correct repair?', options: ['Isolate, discharge, remove and replace the capacitor with one of the same (or better) voltage rating and capacitance, correct polarity', 'Add a second small capacitor in parallel without removing the old one', 'Replace the rectifier diode instead', 'Increase the load resistance to reduce ripple'], answer: 0, explain: 'A degraded electrolytic should be replaced properly, with correct polarity and rating; piling a second capacitor on top of a failing one is not a reliable repair.' },
      { id: 'k8', rubric: 'verify', type: 'mcq', prompt: 'What confirms the repair?', options: ['Ripple on the control rail returns to the healthy range under the same load that originally caused resets', 'The new capacitor looks new', 'The capacitor\'s voltage rating is checked once', 'The board powers on with no load'], answer: 0, explain: 'The original fault only appeared under load; verification must reproduce that load and show the ripple back in range.' },
    ],
    candidateCauses: ['A dried-out/degraded smoothing capacitor', 'A failed rectifier diode', 'A rise in AC input voltage', 'A control-logic fault unrelated to the supply'],
    confirmedFault: 'The smoothing electrolytic capacitor has lost most of its effective capacitance, allowing excessive ripple onto the control rail.',
    repairSteps: [
      { id: 'inspect', detail: 'Note the capacitor\'s age and any bulging/venting of its case before opening the enclosure.' },
      { id: 'isolate', detail: 'Isolate the AC supply feeding this section.' },
      { id: 'discharge', detail: 'Discharge the capacitor and verify with a meter before touching its leads.' },
      { id: 'visual', detail: 'Check the capacitor case, the diode and the board around them for heat or electrolyte staining.' },
      { id: 'measure', detail: 'Measure ripple on the rail, then ESR of the isolated, discharged capacitor.' },
      { id: 'remove', detail: 'Desolder/unclamp the degraded capacitor.' },
      { id: 'replace', detail: 'Fit a replacement of correct capacitance, voltage rating and polarity.' },
      { id: 'solder', detail: 'Make sound joints and inspect neighbouring joints disturbed during removal.' },
      { id: 'post-test', detail: 'Re-energise unloaded, then apply the load that originally caused resets.' },
      { id: 'verify', detail: 'Confirm ripple is back within the healthy range under that load.' },
      { id: 'document', detail: 'Record the capacitor replaced, its rating, and the before/after ripple readings.' },
    ],
    verificationNote: 'Verify under the load that originally caused the resets, not only at no load — ripple from a marginal capacitor can look fine unloaded.',
    safety: 'Electrolytic capacitors hold a charge after power is removed and can also fail violently if reverse-fitted: isolate, discharge, verify dead, and observe polarity when fitting the replacement.',
  },
  {
    id: 'rsc-05',
    category: 'rep-02',
    domain: 'inverter',
    title: 'Aged, sulfated battery: voltage collapses under load',
    reportedProblem: 'The system was working fine for two years. Now lights dim and the inverter alarms every time a load starts, even right after a full charge.',
    equipment: 'A 12 V lead-acid battery bank supplying the inverter directly.',
    initialSymptoms: ['Normal open-circuit voltage after charging', 'Severe voltage sag the instant a load starts', 'The alarm clears once the load stops'],
    usefulInstruments: ['Digital multimeter (open-circuit and loaded DC voltage)', 'Battery/capacity analyser (internal resistance under a known test current)'],
    unhelpfulInstruments: ['Oscilloscope', 'Insulation tester'],
    diagram: 'Battery bank → inverter DC input, no other component between them.',
    readings: () => {
      const i = 60
      const h = readBattery(c05healthy, i)
      const f = readBattery(c05fault, i)
      return [
        { label: 'Open-circuit voltage (rested)', value: round(f.openCircuitVoltage, 2), unit: 'V', healthy: round(h.openCircuitVoltage, 2) },
        { label: `Loaded voltage at a ${i} A test current`, value: round(f.loadedVoltage, 2), unit: 'V', healthy: round(h.loadedVoltage, 2) },
        { label: 'Internal resistance (computed from the sag)', value: round(f.internalResistanceOhm * 1000, 1), unit: 'mΩ', healthy: round(h.internalResistanceOhm * 1000, 1) },
      ]
    },
    checkpoints: [
      { id: 'k1', rubric: 'symptom', type: 'mcq', prompt: 'Which detail most clearly separates this from a simple state-of-charge problem?', options: ['The open-circuit voltage after charging is normal, yet it still sags severely under load', 'The alarm clears once the load stops', 'Lights dim', 'The inverter alarms'], answer: 0, explain: 'A normal rested (open-circuit) voltage with a severe sag only under load is the classic signature of high internal resistance, not low charge.' },
      { id: 'k2', rubric: 'instrument', type: 'mcq', prompt: 'What test specifically isolates internal resistance from state of charge?', options: ['A loaded-voltage test at a known test current, compared with the rested open-circuit voltage', 'An open-circuit voltage reading alone', 'A clamp current reading on the output cable only', 'A continuity test of the battery terminals'], answer: 0, explain: 'Internal resistance only shows up as the DIFFERENCE between rested and loaded voltage at a known current (r = ΔV/I).' },
      { id: 'k3', rubric: 'procedure', type: 'mcq', prompt: 'Why must the battery be rested before the open-circuit reading?', options: ['A battery under recent charge or discharge shows a temporarily shifted terminal voltage that is not its true rested value', 'The meter needs to warm up', 'Resting discharges the battery', 'Resting improves meter accuracy generally'], answer: 0, explain: 'Surface charge/discharge effects settle out over rest; a reading taken immediately after charging would be misleadingly high.' },
      { id: 'k4', rubric: 'interpret', type: 'mcq', prompt: 'The computed internal resistance is several times the healthy value, with a normal open-circuit voltage. What does this show?', options: ['The battery has lost its ability to deliver current without sagging, even though it is well charged', 'The battery is simply flat', 'The load is drawing too much current by design', 'The meter is mis-set'], answer: 0, explain: 'A well-charged battery that still sags heavily under load has a genuine internal-resistance problem — ageing or sulfation — not a charge problem.' },
      { id: 'k5', rubric: 'eliminate', type: 'multi', prompt: 'Which of these does the evidence rule out?', options: ['The battery is simply undercharged (the open-circuit voltage rules this out)', 'The load itself is drawing far more current than rated (not established by this evidence, and would need its own check)', 'The battery\'s internal resistance has risen', 'A loose terminal connection (would also raise effective series resistance, and has not yet been checked by inspecting the terminals themselves)'], answers: [0], explain: 'The healthy open-circuit voltage specifically rules out undercharging. A loose terminal is a real alternative explanation for added resistance and should still be inspected before blaming the cells themselves; the load\'s own current draw is a separate, unconfirmed question.' },
      { id: 'k6', rubric: 'diagnose', type: 'mcq', prompt: 'Assuming the terminals are inspected and found sound, what is the confirmed fault?', options: ['The battery (or one weak cell/block within it) has aged/sulfated, raising its internal resistance well above healthy', 'A loose terminal connection', 'An undersized load cable', 'A failed inverter input stage'], answer: 0, explain: 'With terminals confirmed sound, the resistance rise is internal to the battery itself.' },
      { id: 'k7', rubric: 'repair', type: 'mcq', prompt: 'What is the correct repair?', options: ['Replace the battery bank (do not mix a new battery with old cells of different age/condition), and review the charging regime that may have shortened its life', 'Add a second, smaller battery in parallel to share the load', 'Increase the inverter\'s low-voltage cut-off only', 'Clean the terminals and leave the battery in service'], answer: 0, explain: 'An internally degraded battery cannot be restored by adding another battery or by terminal cleaning alone; mixing ages/conditions in one bank causes further problems.' },
      { id: 'k8', rubric: 'verify', type: 'mcq', prompt: 'What confirms the repair?', options: ['The loaded-voltage test, repeated at the same test current, now shows a sag consistent with a healthy internal resistance', 'The new battery\'s box looks new', 'The open-circuit voltage is checked once', 'The alarm light is removed'], answer: 0, explain: 'Repeating the same loaded test that exposed the fault is what actually verifies the repair.' },
    ],
    candidateCauses: ['An aged/sulfated battery with high internal resistance', 'A simply undercharged battery', 'A loose battery terminal connection', 'An undersized load cable'],
    confirmedFault: 'The battery has aged (sulfation or plate degradation), raising its internal resistance well above a healthy value.',
    repairSteps: [
      { id: 'inspect', detail: 'Check the battery\'s age and service history against its expected life.' },
      { id: 'isolate', detail: 'Isolate the battery from the inverter before disturbing any connection.' },
      { id: 'discharge', detail: 'Not applicable beyond the battery itself; proceed to inspection.' },
      { id: 'visual', detail: 'Inspect terminals for corrosion/looseness, and the case for bulging or leakage.' },
      { id: 'measure', detail: 'Rested open-circuit voltage, then loaded voltage at a known test current; compute internal resistance.' },
      { id: 'remove', detail: 'Disconnect and remove the aged battery bank.' },
      { id: 'replace', detail: 'Fit a new battery bank of matched age, chemistry and capacity.' },
      { id: 'solder', detail: 'Not applicable; re-torque terminal connections to specification.' },
      { id: 'post-test', detail: 'Re-energise and apply the original problem load under controlled observation.' },
      { id: 'verify', detail: 'Repeat the loaded-voltage test and confirm a healthy sag.' },
      { id: 'document', detail: 'Record the replacement, the test currents used, and the before/after internal resistance.' },
    ],
    verificationNote: 'A single rested open-circuit reading after replacement is not enough: repeat the loaded test at the same current used to find the fault.',
    safety: 'A lead-acid battery can deliver very large fault currents: isolate before disconnecting, and handle a bulging or leaking case as a chemical hazard, not just an electrical one.',
  },
  {
    id: 'rsc-06',
    category: 'rep-02',
    domain: 'inverter',
    title: 'Flat battery trips the low-voltage cut-off',
    reportedProblem: 'The inverter shuts down with a "low battery" alarm every evening, even though it charged all day.',
    equipment: 'A 48 V LiFePO₄ battery bank.',
    initialSymptoms: ['Shutdown happens at a predictable time each evening', 'The alarm is specifically "low battery", not a fault code', 'Charging during the day appears normal'],
    usefulInstruments: ['Digital multimeter (DC voltage)', 'Battery/capacity analyser (state of charge behaviour)'],
    unhelpfulInstruments: ['Clamp meter', 'Oscilloscope'],
    diagram: 'Battery bank → inverter DC input, with the inverter\'s own low-voltage disconnect threshold.',
    readings: () => {
      const h = readBattery(c06healthy, 5)
      const f = readBattery(c06fault, 5)
      return [
        { label: 'State of charge used for this reading', value: c06healthy.stateOfChargePct, unit: '%', healthy: c06healthy.stateOfChargePct },
        { label: 'State of charge, as found in the evening', value: c06fault.stateOfChargePct, unit: '%' },
        { label: 'Terminal voltage at a light 5 A load', value: round(f.loadedVoltage, 2), unit: 'V', healthy: round(h.loadedVoltage, 2) },
      ]
    },
    checkpoints: [
      { id: 'k1', rubric: 'symptom', type: 'mcq', prompt: 'Which detail distinguishes this from the aged-battery scenario (rsc-05)?', options: ['The alarm is specifically "low battery", and the timing matches the load running down a daily charge rather than failing under a single load step', 'The battery is LiFePO₄ not lead-acid', 'The system is 48 V not 12 V', 'There is no sag at all'], answer: 0, explain: 'A predictable evening shutdown with a low-battery code points at state of charge being genuinely depleted by the day\'s usage, not an internal-resistance problem.' },
      { id: 'k2', rubric: 'instrument', type: 'mcq', prompt: 'What should you check to confirm whether the battery is actually reaching a healthy state of charge during the day?', options: ['Terminal voltage at the end of the charging period, and the charging current trend', 'A single voltage reading taken at night', 'Insulation resistance', 'AC frequency at the inverter output'], answer: 0, explain: 'If the battery never reaches its intended end-of-charge voltage during the day, it never gets a full day\'s energy stored.' },
      { id: 'k3', rubric: 'procedure', type: 'mcq', prompt: 'Why is a single evening voltage reading, on its own, not conclusive?', options: ['Terminal voltage under a load depends on both state of charge and load current, so the reading must be interpreted together with the load present at the time', 'Voltage readings are never reliable', 'The meter needs calibration', 'Evening readings are always wrong'], answer: 0, explain: 'The same low voltage could come from a low state of charge or from a heavier evening load; both must be considered.' },
      { id: 'k4', rubric: 'interpret', type: 'mcq', prompt: 'The state of charge found in the evening is far below the level that was present at commissioning for the same loads. What does this most directly suggest?', options: ['The load (or the battery\'s usable capacity) is drawing the bank down further than the system was designed for', 'The battery\'s internal resistance has risen', 'The meter is wrong', 'The inverter\'s cut-off is miscalibrated'], answer: 0, explain: 'A genuinely low state of charge, reached on a normal daily cycle, points at an energy-balance mismatch (load versus charge versus storage), not a resistance fault.' },
      { id: 'k5', rubric: 'eliminate', type: 'multi', prompt: 'Which of these does this evidence make less likely as the primary cause?', options: ['High internal resistance (the terminal voltage tracks state of charge normally here, without the severe load-only sag seen in an aged pack)', 'The loads drawing more energy per day than the system was designed to supply', 'A charging source or regime that is not fully replacing the day\'s usage', 'The inverter\'s low-voltage cut-off being set correctly for the battery chemistry'], answers: [0], explain: 'Unlike rsc-05, nothing here points at an internal-resistance problem; the pattern is consistent with the stored energy simply running out, from either higher load, under-charging, or both.' },
      { id: 'k6', rubric: 'diagnose', type: 'mcq', prompt: 'What is the confirmed fault?', options: ['The battery is being discharged to a genuinely low state of charge by the daily load/charge balance, not failing internally', 'The battery has failed internally', 'The inverter\'s meter is miscalibrated', 'A fuse has blown'], answer: 0, explain: 'This is an energy-balance problem (load versus charge input versus storage), confirmed by the state-of-charge evidence.' },
      { id: 'k7', rubric: 'repair', type: 'mcq', prompt: 'What is the appropriate next step?', options: ['Review and correct the energy balance: reduce load, increase charging capacity/time, or add storage, as the design review indicates', 'Replace the battery with an identical one', 'Lower the low-voltage cut-off so the alarm stops', 'Do nothing; this is normal'], answer: 0, explain: 'Simply lowering the cut-off risks deep-discharging the battery, which shortens its life and can trigger the very failure mode of rsc-05; the real fix is correcting the mismatch between load and available energy.' },
      { id: 'k8', rubric: 'verify', type: 'mcq', prompt: 'What confirms the fix has worked?', options: ['The battery reaches a healthy end-of-day state of charge over several representative days, with no low-battery shutdown', 'One evening without an alarm', 'The battery voltage is checked once at noon', 'The inverter display no longer shows an alarm icon'], answer: 0, explain: 'A single good day is not enough evidence; the energy balance should be confirmed over several representative days, including a cloudy or high-load day if relevant.' },
    ],
    candidateCauses: ['The daily load exceeds the system\'s available stored energy', 'The battery has failed internally (high resistance)', 'The inverter\'s low-voltage cut-off is miscalibrated', 'A blown fuse is preventing charging'],
    confirmedFault: 'The system\'s loads are drawing the battery down to a genuinely low state of charge each day; this is an energy-balance issue, not a component failure.',
    repairSteps: [
      { id: 'inspect', detail: 'Review the system\'s original load and charging design against actual daily usage.' },
      { id: 'isolate', detail: 'Not required for this investigation; no live work is performed on a healthy system.' },
      { id: 'discharge', detail: 'Not applicable.' },
      { id: 'visual', detail: 'Check for any load added since commissioning that was not in the original design.' },
      { id: 'measure', detail: 'Log state of charge and terminal voltage through a full day/night cycle.' },
      { id: 'remove', detail: 'Not applicable: no component is removed for an energy-balance correction.' },
      { id: 'replace', detail: 'Not applicable, unless the review finds the storage itself undersized for the actual load.' },
      { id: 'solder', detail: 'Not applicable.' },
      { id: 'post-test', detail: 'Implement the agreed correction (load reduction, more charging capacity, or more storage).' },
      { id: 'verify', detail: 'Re-log the cycle over several representative days.' },
      { id: 'document', detail: 'Record the original design assumptions, actual measured usage, and the correction applied.' },
    ],
    verificationNote: 'Confirm over several representative days, not a single good one.',
    safety: 'Do not simply lower the low-voltage cut-off to silence the alarm: deep discharge below the battery chemistry\'s safe limit shortens life and can cause the separate failure mode of rsc-05.',
  },
  {
    id: 'rsc-07',
    category: 'rep-02',
    domain: 'component',
    title: 'Corroded PCB track opens the DC bus',
    reportedProblem: 'A unit stored in a humid environment now fails to power on, although it worked before storage.',
    equipment: 'A DC bus track on the main PCB, between the input terminal block and the rest of the board, modelled as a very low (near-zero) resistance in good condition.',
    initialSymptoms: ['No power-on', 'Visible green/white corrosion near the input terminal block', 'Input fuse found intact'],
    usefulInstruments: ['Digital multimeter (resistance/continuity, board isolated)', 'Visual inspection with adequate lighting/magnification'],
    unhelpfulInstruments: ['Clamp meter (no current is flowing to clamp)', 'Oscilloscope'],
    diagram: 'Input terminal block → corroded track section → rest of the DC bus.',
    readings: () => [
      // Probed across the break (track output to the next pad), not across the track's own modelled
      // resistance: a corroded-through track is an open JOINT, not a change in the track's own fixed
      // resistance value.
      { label: 'Resistance across the suspect joint, board isolated, healthy', value: round(liveDmmTwoProbePoint(c07healthy, { partId: 'TRK', terminalId: '2' }, { partId: 'LD1', terminalId: '+' }).resistanceOhms ?? 0, 3), unit: 'Ω' },
      { label: 'Resistance across the suspect joint, board isolated, as found', value: round(liveDmmTwoProbePoint(c07fault, { partId: 'TRK', terminalId: '2' }, { partId: 'LD1', terminalId: '+' }).resistanceOhms ?? 1e9, 0), unit: 'Ω' },
    ],
    checkpoints: [
      { id: 'k1', rubric: 'symptom', type: 'mcq', prompt: 'Which detail most directs suspicion toward the board itself rather than the external wiring?', options: ['Visible corrosion near the input terminal block, after humid storage, with the fuse confirmed intact', 'No power-on at all', 'The unit worked before storage', 'The fault is total, not partial'], answer: 0, explain: 'Visible corrosion in a known-vulnerable spot, with the fuse already ruled out, points at the board\'s own tracks or terminal block.' },
      { id: 'k2', rubric: 'instrument', type: 'mcq', prompt: 'With the fuse already confirmed intact, what is the next check?', options: ['Continuity/resistance along the suspect track, with the board isolated', 'AC voltage at the output', 'Clamp current on the input cable', 'Insulation resistance to earth'], answer: 0, explain: 'The next point to check for an open path is the track itself, by continuity.' },
      { id: 'k3', rubric: 'procedure', type: 'mcq', prompt: 'What must be true of the board before this continuity test is valid?', options: ['It must be fully isolated from any source, including residual capacitor charge', 'It should remain powered for an accurate reading', 'Only the fuse needs to be removed', 'The test is valid live'], answer: 0, explain: 'A continuity/resistance test on a powered or charged board gives an unreliable (and potentially unsafe) result.' },
      { id: 'k4', rubric: 'interpret', type: 'mcq', prompt: 'The joint reads a resistance far higher than the healthy near-zero reading. What does this confirm?', options: ['The track has corroded through and is now open', 'The track is undersized', 'The terminal block is fine', 'The board is fine and the fault is elsewhere'], answer: 0, explain: 'A joint that should carry current with almost no resistance, now reading far higher, has lost continuity.' },
      { id: 'k5', rubric: 'eliminate', type: 'multi', prompt: 'Which of these does this evidence rule out?', options: ['The input fuse (already confirmed intact, and this reading is on a different part of the path entirely)', 'A reversed battery connection (a reversed connection would show as a diode blocking, not as an open resistance reading like this)', 'The PCB track itself being open', 'The possibility that corrosion is also present elsewhere nearby, requiring a wider visual check'], answers: [0, 1], explain: 'The fuse was already confirmed separately, and a reversed connection has a different electrical signature (diode blocking, not an open resistive track) — so neither matches this specific reading. Corrosion elsewhere nearby remains worth checking visually.' },
      { id: 'k6', rubric: 'diagnose', type: 'mcq', prompt: 'What is the confirmed fault?', options: ['The DC bus track has corroded through near the input terminal block and is now open-circuit', 'The input fuse has blown', 'The battery leads are reversed', 'The output relay has failed'], answer: 0, explain: 'The resistance evidence is specific to the track.' },
      { id: 'k7', rubric: 'repair', type: 'mcq', prompt: 'What is the correct board-level repair?', options: ['Clean the corrosion, assess whether the track can be safely re-bridged (a rated jumper wire soldered across the damaged section) or whether the board must be replaced, per the manufacturer\'s repair policy', 'Solder a jumper directly over the corrosion without cleaning it', 'Replace the input fuse', 'Reverse the input polarity to compensate'], answer: 0, explain: 'Corrosion must be cleaned before any repair, and a board-level repair like this has limits: it is reasonable for some tracks and not others, depending on current rating and position — this is the distinction between component-level and board-level repair (brief §5).' },
      { id: 'k8', rubric: 'verify', type: 'mcq', prompt: 'What confirms the repair?', options: ['Continuity along the repaired track reads near zero again, and the unit powers on and holds load', 'The jumper wire is visible', 'The corrosion is no longer visible', 'The fuse is intact'], answer: 0, explain: 'Electrical continuity restored, confirmed functionally under load, is what verifies the repair — appearance alone is not enough.' },
    ],
    candidateCauses: ['A corroded, open PCB track near the input terminal block', 'A blown input fuse', 'Reversed battery polarity', 'A failed output relay'],
    confirmedFault: 'The DC bus PCB track has corroded through and is open-circuit.',
    repairSteps: [
      { id: 'inspect', detail: 'Note the storage history (humidity) and inspect the terminal-block area under good lighting/magnification.' },
      { id: 'isolate', detail: 'Isolate every source before handling the board.' },
      { id: 'discharge', detail: 'Discharge and prove dead any bus capacitance before touching the track.' },
      { id: 'visual', detail: 'Identify the full extent of the corrosion, not just the first visible spot.' },
      { id: 'measure', detail: 'Continuity-test the track to confirm and localise the open.' },
      { id: 'remove', detail: 'Clean the corrosion back to sound copper/solder mask.' },
      { id: 'replace', detail: 'Decide: rated jumper repair, or board replacement, per the manufacturer\'s repair policy for this current rating/position.' },
      { id: 'solder', detail: 'Make a sound, correctly rated joint if a jumper repair is used; inspect neighbouring joints.' },
      { id: 'post-test', detail: 'Re-energise unloaded, then under load, with careful observation for heating at the repair.' },
      { id: 'verify', detail: 'Confirm continuity and functional operation under load.' },
      { id: 'document', detail: 'Record the repair method chosen and why, for future reference.' },
    ],
    verificationNote: 'A jumper repair must also be checked for heating under full load, not only for continuity at no load.',
    safety: 'Corrosion can be an indicator of other moisture ingress nearby: inspect the wider board, not just the first affected track, before closing up the enclosure.',
  },
  {
    id: 'rsc-08',
    category: 'rep-03',
    domain: 'component',
    title: 'A switching MOSFET has failed open',
    reportedProblem: 'One leg of the inverter\'s switching stage shows no current at all, although the gate signal looks correct on the scope.',
    equipment: 'A switching MOSFET feeding a resistive load from a current-limited DC supply, gate driven directly high.',
    initialSymptoms: ['No current through the load leg', 'The gate-drive signal measures correctly at the gate terminal', 'The MOSFET shows no obvious external damage'],
    usefulInstruments: ['Digital multimeter (DC voltage at drain and source)', 'Clamp meter (current in the leg)'],
    unhelpfulInstruments: ['LCR meter', 'Insulation tester'],
    diagram: 'DC supply (+) → load → MOSFET drain → MOSFET source → DC supply (−), gate driven high from a separate driver.',
    readings: () => [
      { label: 'Current through the switching leg, healthy', value: round(liveDmmSeriesPoint(c08healthy, 'Q1').seriesCurrentDc ?? 0, 2), unit: 'A' },
      { label: 'Current through the switching leg, as found', value: round(liveDmmSeriesPoint(c08fault, 'Q1').seriesCurrentDc ?? 0, 2), unit: 'A' },
      // Probed across the break itself (load return to drain), not across Q1's own terminals: an
      // open device has no internal path to carry a voltage reading between its own two terminals,
      // but the open JOINT it created shows the full supply voltage sitting across it unused.
      { label: 'Voltage across the open connection at the drain, as found', value: round(liveDmmTwoProbePoint(c08fault, { partId: 'LD1', terminalId: '-' }, { partId: 'Q1', terminalId: 'd' }).dcVoltage ?? 0, 1), unit: 'V', healthy: round(liveDmmTwoProbePoint(c08healthy, { partId: 'LD1', terminalId: '-' }, { partId: 'Q1', terminalId: 'd' }).dcVoltage ?? 0, 2) },
    ],
    checkpoints: [
      { id: 'k1', rubric: 'symptom', type: 'mcq', prompt: 'Which detail rules the gate driver itself in or out early?', options: ['The gate-drive signal already measures correctly at the gate, so the driver is not the first suspect', 'There is no current at all', 'The MOSFET shows no damage', 'The load is resistive'], answer: 0, explain: 'A confirmed-correct gate signal shifts suspicion downstream, to the switch itself or its connections.' },
      { id: 'k2', rubric: 'instrument', type: 'mcq', prompt: 'With the gate signal already confirmed, what should you measure next?', options: ['DC voltage across the MOSFET\'s own drain–source terminals, and current in the leg', 'AC ripple on the gate', 'Insulation resistance of the heat sink', 'LCR on the load'], answer: 0, explain: 'The drain-source voltage and the leg current together show whether the device is actually conducting.' },
      { id: 'k3', rubric: 'procedure', type: 'mcq', prompt: 'How should the current be measured without breaking the circuit?', options: ['Clamp meter around the single conductor carrying the leg current', 'Clamp meter around both supply conductors together', 'In-line ammeter inserted at the gate', 'DMM set to resistance, powered'], answer: 0, explain: 'A clamp meter reads current without breaking the circuit, but only around ONE conductor at a time — clamping both cancels the reading (Phase 8, F5.M2).' },
      { id: 'k4', rubric: 'interpret', type: 'mcq', prompt: 'The leg carries essentially no current, and the full supply voltage appears across the MOSFET\'s drain–source. What does this combination show?', options: ['The MOSFET is not conducting at all, despite a correct gate signal: it is open', 'The MOSFET is conducting normally', 'The load has failed open', 'The supply has failed'], answer: 0, explain: 'A device with the full available voltage across it and no current through it is open, not conducting.' },
      { id: 'k5', rubric: 'eliminate', type: 'multi', prompt: 'Which of these does this evidence rule out?', options: ['The gate driver (already independently confirmed correct)', 'The load itself being open (the full supply voltage appears across the MOSFET, not across the load, which is the opposite pattern an open load would show)', 'The MOSFET having failed open', 'The DC supply being unavailable (it is still present and measurable)'], answers: [0, 1, 3], explain: 'The driver was independently confirmed, the voltage pattern is specific to the MOSFET rather than the load, and the supply itself is clearly present — all pointing at the MOSFET and only the MOSFET.' },
      { id: 'k6', rubric: 'diagnose', type: 'mcq', prompt: 'What is the confirmed fault?', options: ['The MOSFET has failed open (no drain-source conduction despite correct gate drive)', 'The gate driver has failed', 'The load has failed open', 'The DC supply has failed'], answer: 0, explain: 'Every measurement is consistent with, and only with, an open switching device.' },
      { id: 'k7', rubric: 'repair', type: 'mcq', prompt: 'What is the correct repair?', options: ['Isolate, discharge, remove the failed MOSFET and fit a replacement of the same (or better) voltage/current rating and package', 'Bypass the MOSFET with a wire link', 'Replace the gate driver instead', 'Increase the supply voltage to force conduction'], answer: 0, explain: 'A failed switching device must be replaced to specification; bypassing it removes the switching function entirely.' },
      { id: 'k8', rubric: 'verify', type: 'mcq', prompt: 'What confirms the repair?', options: ['Current returns to the healthy value in the leg, and drain-source voltage drops to the small on-state value expected when the gate is driven high', 'The new part looks correct', 'The gate signal is re-measured once more', 'The supply voltage is checked'], answer: 0, explain: 'Restoring the healthy current and the expected small on-state drop together confirm normal conduction, not just a part swap.' },
    ],
    candidateCauses: ['The MOSFET has failed open', 'The gate driver has failed', 'The load has failed open', 'The DC supply is unavailable'],
    confirmedFault: 'The switching MOSFET has failed open: no drain–source conduction despite a correct gate signal.',
    repairSteps: [
      { id: 'inspect', detail: 'Confirm the gate signal independently before suspecting the switch itself.' },
      { id: 'isolate', detail: 'Isolate the DC supply feeding this leg.' },
      { id: 'discharge', detail: 'Discharge any local bus capacitance and prove dead.' },
      { id: 'visual', detail: 'Inspect the MOSFET package and board for heat damage or cracked solder.' },
      { id: 'measure', detail: 'Measure drain-source voltage and leg current to confirm the open device.' },
      { id: 'remove', detail: 'Desolder/unmount the failed MOSFET without damaging the board or heat sink.' },
      { id: 'replace', detail: 'Fit a replacement of matching or better voltage/current rating and package, correctly oriented.' },
      { id: 'solder', detail: 'Make sound joints; re-torque the heat-sink mounting to specification.' },
      { id: 'post-test', detail: 'Re-energise current-limited, unloaded first, then with load.' },
      { id: 'verify', detail: 'Confirm leg current and drain-source voltage both return to healthy values.' },
      { id: 'document', detail: 'Record the part replaced and the before/after readings.' },
    ],
    verificationNote: 'Check both the current AND the on-state drain–source voltage — a part that conducts but with an abnormally high drop is a different, ongoing problem, not a full repair.',
    safety: 'Confirm the gate driver separately before replacing a switching device: do not replace a part that was never actually at fault.',
  },
  {
    id: 'rsc-09',
    category: 'rep-03',
    domain: 'component',
    title: 'A switching MOSFET has failed short',
    reportedProblem: 'The protection circuit keeps tripping on overcurrent as soon as the stage is enabled, even with the gate commanded off.',
    equipment: 'The same switching leg as rsc-08, with the gate deliberately commanded LOW (off) during this test.',
    initialSymptoms: ['Overcurrent protection trips immediately on enable', 'The gate signal measures correctly LOW at the gate terminal', 'Noticeable heating at the MOSFET even in the brief time before protection trips'],
    usefulInstruments: ['Clamp meter (current in the leg, with the gate confirmed low)', 'Digital multimeter (drain-source voltage/resistance, circuit isolated)'],
    unhelpfulInstruments: ['LCR meter', 'Insulation tester'],
    diagram: 'Same switching leg as rsc-08, gate held low (device should be fully off).',
    readings: () => [
      // Measured on LD1, not Q1: a failed-short device conducts through a path that bypasses Q1's
      // own branch (modelled here as a near-zero-ohm path across its drain-source), so the leg's
      // actual current shows up on the load/supply conductor, not "through Q1" specifically — exactly
      // the point a technician learns from this fault (clamp the conductor, don't assume the switch
      // itself carries every amp the leg draws).
      { label: 'Leg current with the gate held low, healthy device', value: round(liveDmmSeriesPoint(c09healthy, 'LD1').seriesCurrentDc ?? 0, 3), unit: 'A' },
      { label: 'Leg current with the gate held low, as found', value: round(liveDmmSeriesPoint(c09fault, 'LD1').seriesCurrentDc ?? 0, 2), unit: 'A' },
      { label: 'Drain–source resistance, circuit isolated, as found', value: round(liveDmmTwoProbePoint(c09fault, { partId: 'Q1', terminalId: 'd' }, { partId: 'Q1', terminalId: 's' }).resistanceOhms ?? 0, 2), unit: 'Ω' },
    ],
    checkpoints: [
      { id: 'k1', rubric: 'symptom', type: 'mcq', prompt: 'Which detail is the most alarming, safety-relevant symptom here?', options: ['Full current flows even with the gate confirmed held low (off)', 'The protection trips', 'The device gets warm', 'The gate signal is correct'], answer: 0, explain: 'Current flowing with the device commanded OFF means the switch cannot be turned off at all — a serious, not merely inconvenient, fault.' },
      { id: 'k2', rubric: 'instrument', type: 'mcq', prompt: 'What is the safe way to confirm this before further testing?', options: ['Clamp the leg current with the gate independently confirmed low, using a current-limited supply', 'Apply full, unlimited DC supply and observe', 'Disconnect the protection circuit to "see what happens"', 'Increase the gate drive voltage'], answer: 0, explain: 'Confirm with a current-LIMITED supply; removing protection or raising drive voltage to "test harder" risks real damage.' },
      { id: 'k3', rubric: 'procedure', type: 'mcq', prompt: 'How is drain–source resistance correctly checked here?', options: ['With the circuit fully isolated, using the meter\'s resistance function', 'While the gate-drive signal is still active', 'Using the clamp meter', 'Using the LCR meter while powered'], answer: 0, explain: 'A resistance reading needs the circuit isolated and de-energised, exactly as for any other resistance test.' },
      { id: 'k4', rubric: 'interpret', type: 'mcq', prompt: 'Full current flows with the gate held low, and the isolated drain-source resistance reads very low (near the device\'s normal on-resistance). What does this combination mean?', options: ['The device is conducting internally regardless of the gate signal: it has failed short/shorted internally', 'The device is working correctly and the gate circuit is at fault', 'The load has failed short', 'The supply is the wrong voltage'], answer: 0, explain: 'A low drain-source resistance that does not respond to the gate at all is the signature of an internally shorted switch.' },
      { id: 'k5', rubric: 'eliminate', type: 'multi', prompt: 'Which of these does this evidence rule out?', options: ['The gate driver/signal (already confirmed correctly low)', 'The load having failed short (a shorted load would not explain why drain-source itself reads low with the device isolated FROM the load circuit at the terminals tested)', 'The MOSFET having failed short internally', 'The possibility that this device has been overheating for some time before full failure (worth checking thermally, not ruled out)'], answers: [0], explain: 'The gate is independently confirmed correct. The resistance measurement is taken at the device\'s own terminals, so a load fault elsewhere would not explain it directly — though it is not fully "ruled out" without also checking the load, this evidence most directly confirms the MOSFET itself.' },
      { id: 'k6', rubric: 'diagnose', type: 'mcq', prompt: 'What is the confirmed fault?', options: ['The MOSFET has failed short: it conducts regardless of the gate signal', 'The gate driver has failed', 'The load has failed short', 'The protection circuit is miscalibrated'], answer: 0, explain: 'The device no longer responds to its own control terminal — it has failed as a short, not as a controllable switch.' },
      { id: 'k7', rubric: 'repair', type: 'mcq', prompt: 'What is the correct repair, and what extra check does a shorted switching device call for?', options: ['Replace the MOSFET, and also check the gate driver and any adjacent device in the same bridge leg for damage from the fault current it may have passed', 'Replace only the MOSFET and re-energise immediately', 'Replace the gate driver only', 'Increase the protection trip threshold so it does not trip again'], answer: 0, explain: 'A shorted switching device can pass damaging current through neighbouring parts of the same leg (e.g. the complementary switch during any shoot-through); check them before returning to service, and never raise a protection threshold to "stop" a real fault from tripping it.' },
      { id: 'k8', rubric: 'verify', type: 'mcq', prompt: 'What confirms the repair?', options: ['With the gate held low, the leg now carries no significant current and the isolated drain-source resistance reads high (off-state)', 'The new part has the correct part number printed on it', 'The protection circuit no longer trips once, briefly', 'The heat sink is reattached'], answer: 0, explain: 'The device must be shown to actually respond to the gate again — carrying no current when commanded off — not just to be a new part.' },
    ],
    candidateCauses: ['The MOSFET has failed short internally', 'The gate driver/signal has failed', 'The load has failed short', 'The protection circuit is miscalibrated'],
    confirmedFault: 'The MOSFET has failed internally short: it conducts regardless of the gate signal.',
    repairSteps: [
      { id: 'inspect', detail: 'Note that current flows with the device commanded off — treat this as a serious fault, not a nuisance trip.' },
      { id: 'isolate', detail: 'Isolate the supply using a current-limited source for any further live checks; do not remove protection to investigate.' },
      { id: 'discharge', detail: 'Discharge and prove dead before handling the device.' },
      { id: 'visual', detail: 'Inspect the failed device and its immediate neighbours (especially the complementary switch in the same leg) for heat damage.' },
      { id: 'measure', detail: 'Confirm with the gate independently low, then isolated resistance across drain-source.' },
      { id: 'remove', detail: 'Remove the shorted device and inspect the board under it for damage.' },
      { id: 'replace', detail: 'Fit a replacement to the correct rating, and replace any neighbouring device found damaged by the fault current.' },
      { id: 'solder', detail: 'Make sound joints on every part disturbed; re-torque the heat sink.' },
      { id: 'post-test', detail: 'Re-energise current-limited, gate held off first, confirming no conduction, before enabling normal switching.' },
      { id: 'verify', detail: 'Confirm the device now responds correctly to the gate (off when commanded off, on when commanded on).' },
      { id: 'document', detail: 'Record the failed device, any collateral damage found and replaced, and the verification readings.' },
    ],
    verificationNote: 'Verify the OFF state specifically (no current with the gate low) as well as normal switching, since the original fault was precisely a failure to turn off.',
    safety: 'Never raise a protection trip threshold to stop nuisance tripping from an unconfirmed cause: confirm and fix the fault first.',
  },
  {
    id: 'rsc-10',
    category: 'rep-03',
    domain: 'component',
    title: 'Gate-driver signal never reaches the switch',
    reportedProblem: 'A switching leg produces no output at all, and the MOSFET itself tests fine when checked directly.',
    equipment: 'The same switching leg as rsc-08, with the connection between the gate driver\'s output and the MOSFET gate open.',
    initialSymptoms: ['No current in the leg despite the controller commanding the switch on', 'The MOSFET itself, tested directly, switches normally', 'No damage visible on the board'],
    usefulInstruments: ['Digital multimeter (DC voltage at the gate terminal itself, and at the driver\'s output terminal)'],
    unhelpfulInstruments: ['Clamp meter (there is no current to clamp while the switch never turns on)', 'ESR meter'],
    diagram: 'Gate driver output → (connection in question) → MOSFET gate.',
    readings: () => [
      { label: 'Voltage at the MOSFET gate terminal, healthy connection', value: round(liveDmmTwoProbePoint(c10healthy, { partId: 'Q1', terminalId: 'g' }, { partId: 'Q1', terminalId: 's' }).dcVoltage ?? 0, 1), unit: 'V' },
      { label: 'Voltage at the MOSFET gate terminal, as found', value: round(liveDmmTwoProbePoint(c10fault, { partId: 'Q1', terminalId: 'g' }, { partId: 'Q1', terminalId: 's' }).dcVoltage ?? 0, 2), unit: 'V' },
      { label: 'Current in the switching leg, as found', value: round(liveDmmSeriesPoint(c10fault, 'Q1').seriesCurrentDc ?? 0, 2), unit: 'A' },
    ],
    checkpoints: [
      { id: 'k1', rubric: 'symptom', type: 'mcq', prompt: 'Which stated detail is most useful for narrowing the search quickly?', options: ['The MOSFET itself tests fine when checked directly', 'There is no output at all', 'No damage is visible', 'The controller commands the switch on'], answer: 0, explain: 'If the switch itself is confirmed healthy, the fault must be in whatever drives it or connects to it.' },
      { id: 'k2', rubric: 'instrument', type: 'mcq', prompt: 'Where should voltage be checked first, given the device itself is already confirmed good?', options: ["At the MOSFET's own gate terminal, relative to its source, while the driver is commanded on", "At the drain, relative to the source", 'At the load', 'At the DC supply'], answer: 0, explain: 'The gate-source voltage is exactly what decides whether the device conducts; check it at the device, not just at the driver.' },
      { id: 'k3', rubric: 'procedure', type: 'mcq', prompt: 'If the gate-source voltage reads near zero at the device while the driver output is confirmed correct, what should you check next?', options: ['The connection between the driver output and the gate terminal (wiring/trace/connector continuity)', 'Replace the MOSFET anyway', 'Replace the driver anyway', 'Increase the supply voltage'], answer: 0, explain: 'A correct source with nothing arriving at the destination means the path between them is open — exactly the pattern of rsc-01 and rsc-07, applied here to a signal path instead of a power path.' },
      { id: 'k4', rubric: 'interpret', type: 'mcq', prompt: 'The gate terminal reads close to 0 V even while the driver is commanded on, and no current flows in the leg. What does this show?', options: ['The drive signal is not reaching the gate, so the device never turns on, even though it is capable of doing so', 'The device has failed open internally', 'The device has failed short internally', 'The load has failed'], answer: 0, explain: 'A device confirmed good, receiving no gate signal, simply never turns on — the fault is in the path to the gate, not in the device.' },
      { id: 'k5', rubric: 'eliminate', type: 'multi', prompt: 'Which of these does this evidence rule out?', options: ['The MOSFET itself (already independently confirmed, and this evidence is fully consistent with a healthy device that is simply never driven)', 'A break in the gate connection', 'The DC supply (present and measurable elsewhere in the circuit)', 'The driver\'s own output stage (not yet directly measured at the driver, so not fully ruled out)'], answers: [0, 2], explain: 'The device and the supply are both independently accounted for; the driver\'s OWN output has not yet been measured directly at its own terminal, so it is not yet fully eliminated — only the connection onward from it has been shown to carry nothing.' },
      { id: 'k6', rubric: 'diagnose', type: 'mcq', prompt: 'With the driver\'s own output terminal then confirmed correct (a further check), what is the confirmed fault?', options: ['The connection between the gate driver output and the MOSFET gate is open', 'The MOSFET has failed open', 'The MOSFET has failed short', 'The driver has failed'], answer: 0, explain: 'With both ends confirmed healthy on their own terminals, only the connection between them remains as the fault.' },
      { id: 'k7', rubric: 'repair', type: 'mcq', prompt: 'What is the correct repair?', options: ['Isolate, trace and repair the open gate connection (wire, trace or connector), then re-verify continuity before re-energising', 'Replace the MOSFET', 'Replace the gate driver', 'Increase the driver\'s output voltage to "push through" the connection'], answer: 0, explain: 'Nothing has failed except the connection itself; replacing good parts would not fix it, and raising drive voltage does not restore a broken path.' },
      { id: 'k8', rubric: 'verify', type: 'mcq', prompt: 'What confirms the repair?', options: ['Gate-source voltage at the device now follows the driver\'s command, and the leg carries the expected current when switched on', 'The connector looks intact', 'The driver output alone is re-measured once more', 'The MOSFET is re-tested in isolation'], answer: 0, explain: 'The repair must be verified at the device, under actual switching, not just at the point that was repaired.' },
    ],
    candidateCauses: ['An open connection between the gate driver and the MOSFET gate', 'The MOSFET has failed open', 'The MOSFET has failed short', 'The gate driver has failed'],
    confirmedFault: 'The connection carrying the gate-drive signal from the driver to the MOSFET gate is open.',
    repairSteps: [
      { id: 'inspect', detail: 'Confirm the MOSFET itself tests healthy in isolation before suspecting the connection.' },
      { id: 'isolate', detail: 'Isolate the supply before tracing the gate connection.' },
      { id: 'discharge', detail: 'Discharge and prove dead before handling any wiring or connector.' },
      { id: 'visual', detail: 'Inspect the connector, trace or wire along the gate path for a visible break.' },
      { id: 'measure', detail: 'Measure gate-source voltage at the device and at the driver output to localise the open.' },
      { id: 'remove', detail: 'If a connector or wire is at fault, remove/disconnect it.' },
      { id: 'replace', detail: 'Fit a replacement wire/connector, or repair the trace, as appropriate.' },
      { id: 'solder', detail: 'Make sound joints and inspect them.' },
      { id: 'post-test', detail: 'Re-energise and command the switch on under controlled, current-limited conditions first.' },
      { id: 'verify', detail: 'Confirm gate-source voltage follows the command and current flows as expected.' },
      { id: 'document', detail: 'Record the break found and the repair made.' },
    ],
    verificationNote: 'Verify that the gate actually follows the driver\'s command under switching, not only that a static voltage is present.',
    safety: 'A gate signal that never arrives can, in a bridge leg, sometimes leave a device in an undefined state: confirm the leg\'s other switch is also behaving as commanded before re-energising fully.',
  },
  {
    id: 'rsc-11',
    category: 'rep-03',
    domain: 'inverter',
    title: 'Output filter inductor winding has broken open',
    reportedProblem: 'The output stage switches normally on the scope, but there is no current delivered to the load at all.',
    equipment: 'An output filter inductor in series between the switching stage and the load.',
    initialSymptoms: ['Switching waveform present and correct at the switching stage', 'No current reaches the load', 'The inductor shows no visible scorching'],
    usefulInstruments: ['Clamp meter (current before and after the inductor)', 'Digital multimeter (resistance across the inductor, isolated)'],
    unhelpfulInstruments: ['LCR meter on a live circuit', 'Insulation tester'],
    diagram: 'Switching stage → output inductor → load → return.',
    readings: () => [
      { label: 'Current into the load, healthy inductor', value: round(liveDmmSeriesPoint(c11healthy, 'L1').seriesCurrentDc ?? 0, 2), unit: 'A' },
      { label: 'Current into the load, as found', value: round(liveDmmSeriesPoint(c11fault, 'L1').seriesCurrentDc ?? 0, 2), unit: 'A' },
      // Probed across the broken joint (inductor output to load), not across the inductor's own two
      // terminals: a winding break shows up as an open connection at the joint, not as a change in
      // the part's own fixed winding-resistance model.
      { label: 'Resistance across the break at the inductor\'s output, isolated', value: round(liveDmmTwoProbePoint(c11fault, { partId: 'L1', terminalId: '2' }, { partId: 'LD1', terminalId: '+' }).resistanceOhms ?? 1e9, 0), unit: 'Ω', healthy: round(liveDmmTwoProbePoint(c11healthy, { partId: 'L1', terminalId: '2' }, { partId: 'LD1', terminalId: '+' }).resistanceOhms ?? 0, 2) },
    ],
    checkpoints: [
      { id: 'k1', rubric: 'symptom', type: 'mcq', prompt: 'Which detail most clearly separates this from a switching-stage fault?', options: ['The switching waveform itself is confirmed correct', 'There is no current', 'There is no scorching', 'The load is unpowered'], answer: 0, explain: 'A confirmed-correct switching waveform shifts suspicion downstream of the switches, toward the filter or the load path.' },
      { id: 'k2', rubric: 'instrument', type: 'mcq', prompt: 'How can you localise the break without yet isolating the circuit?', options: ['Clamp current on each side of the inductor in turn', 'Resistance across the inductor while live', 'LCR on the live inductor', 'Insulation test while live'], answer: 0, explain: 'A clamp reading on each side of a suspect series component, while still live, shows where the current stops without needing to break the circuit.' },
      { id: 'k3', rubric: 'procedure', type: 'mcq', prompt: 'Once current is confirmed on one side only, what must happen before a resistance test of the inductor itself?', options: ['Isolate and prove dead', 'Nothing further is needed', 'Increase the supply current', 'Clamp both sides simultaneously'], answer: 0, explain: 'A resistance test requires isolation, exactly as with every other component in this workshop.' },
      { id: 'k4', rubric: 'interpret', type: 'mcq', prompt: 'Current is present up to the inductor and absent beyond it, and the resistance measured across that joint is far higher than the near-zero healthy reading. What does this confirm?', options: ['The winding has broken open inside the inductor', 'The load has failed open', 'The switching stage has failed', 'The inductor is simply undersized'], answer: 0, explain: 'A series component with current stopping exactly at it, and a joint resistance far above the healthy near-zero reading, has an open winding.' },
      { id: 'k5', rubric: 'eliminate', type: 'multi', prompt: 'Which of these does this evidence rule out?', options: ['The switching stage (already confirmed by the correct waveform)', 'The load (current never reaches it to be tested by the load itself, but the clamp evidence already places the break before the load, at the inductor)', 'The inductor\'s winding being open', 'The possibility that the load itself ALSO has a fault, which has not yet been checked once the inductor is repaired'], answers: [0, 1], explain: 'The switching stage is independently confirmed, and the clamp evidence localises the break specifically to the inductor, before the load — so the load is not implicated by this evidence (though it should still be checked once the inductor is fixed, before assuming total success).' },
      { id: 'k6', rubric: 'diagnose', type: 'mcq', prompt: 'What is the confirmed fault?', options: ['The output filter inductor\'s winding has broken open', 'The load has failed open', 'The switching stage has failed', 'A connector before the switching stage is loose'], answer: 0, explain: 'Every measurement points at, and only at, the inductor.' },
      { id: 'k7', rubric: 'repair', type: 'mcq', prompt: 'What is the correct repair?', options: ['Isolate, discharge, remove the failed inductor and fit a replacement of the same inductance, current rating and winding resistance', 'Bypass the inductor with a plain wire', 'Replace the switching devices instead', 'Increase the switching frequency to compensate'], answer: 0, explain: 'Bypassing the output filter inductor removes the filtering function it exists to provide (brief §9: never silently remove a safety- or quality-relevant function); it must be replaced to specification.' },
      { id: 'k8', rubric: 'verify', type: 'mcq', prompt: 'What confirms the repair?', options: ['Current is restored on both sides of the inductor and reaches the load at the expected value', 'The new inductor looks the same', 'The switching waveform is re-checked once more', 'The resistance reading alone is taken, unpowered'], answer: 0, explain: 'Verification must confirm current actually flows through to the load under power, not only that the part looks right or reads a sensible resistance unpowered.' },
    ],
    candidateCauses: ['An open winding in the output filter inductor', 'A failed switching stage', 'An open-circuit load', 'A loose connector before the switching stage'],
    confirmedFault: 'The output filter inductor\'s winding has broken open.',
    repairSteps: [
      { id: 'inspect', detail: 'Confirm the switching waveform independently before suspecting the filter/load path.' },
      { id: 'isolate', detail: 'Isolate the supply before any resistance test or component removal.' },
      { id: 'discharge', detail: 'Discharge and prove dead before handling the inductor.' },
      { id: 'visual', detail: 'Inspect the inductor for scorching, cracked windings or a damaged bobbin.' },
      { id: 'measure', detail: 'Clamp current on each side live, then isolated resistance across the inductor.' },
      { id: 'remove', detail: 'Remove the failed inductor without damaging the board.' },
      { id: 'replace', detail: 'Fit a replacement of matching inductance, current rating and winding resistance.' },
      { id: 'solder', detail: 'Make sound joints and inspect them.' },
      { id: 'post-test', detail: 'Re-energise unloaded, then with load, under controlled observation.' },
      { id: 'verify', detail: 'Confirm current flows on both sides of the inductor and reaches the load.' },
      { id: 'document', detail: 'Record the part replaced and the before/after current readings.' },
    ],
    verificationNote: 'Confirm the load actually receives current, not only that the replaced inductor measures a sensible resistance unpowered.',
    safety: 'Never bypass a filter component with a plain wire link "to get the unit running": it removes a function the design relies on for waveform quality or protection.',
  },
  {
    id: 'rsc-12',
    category: 'rep-04',
    domain: 'component',
    title: 'Output feedback sensor disconnected: overvoltage',
    reportedProblem: 'A regulated pure-sine inverter\'s output is clean on the scope but measures well above its rated voltage, and does not change when the load changes.',
    equipment: 'A regulated SPWM inverter, whose output voltage sensor feeds back to the modulation controller so it can hold a set-point regardless of load or battery voltage.',
    initialSymptoms: ['Output voltage well above the rated set-point', 'Output voltage does not respond to load changes the way a healthy regulated unit does', 'Waveform shape itself looks clean, just the wrong amplitude'],
    usefulInstruments: ['Digital multimeter (AC voltage at the output, and DC/signal continuity at the sensor)', 'Oscilloscope (confirming waveform shape is otherwise normal)'],
    unhelpfulInstruments: ['Clamp meter', 'Insulation tester'],
    diagram: 'Output → voltage sensor (feedback) → modulation controller → gate drivers. (Reasoned from the regulation principle taught in P3/S1; this scenario is evaluated qualitatively rather than by a live simulation — see the limitations in the Phase 9 report.)',
    readings: () => [
      { label: 'Output voltage, healthy regulation', value: 230, unit: 'V rms', healthy: 230 },
      { label: 'Output voltage, as found', value: 325, unit: 'V rms' },
      { label: 'Feedback signal reaching the controller, as found', value: 0, unit: 'V (no signal)', healthy: 230 },
    ],
    checkpoints: [
      { id: 'k1', rubric: 'symptom', type: 'mcq', prompt: 'Which detail is the strongest clue that this is a REGULATION fault rather than a switching fault?', options: ['The output no longer responds to load changes the way a regulated unit should', 'The output is too high', 'The waveform shape is clean', 'The unit is a pure-sine design'], answer: 0, explain: 'A regulated inverter is specifically supposed to adjust itself with load and battery voltage; losing that responsiveness points at the regulation loop, not the switches themselves.' },
      { id: 'k2', rubric: 'instrument', type: 'mcq', prompt: 'What should you check at the controller\'s feedback input?', options: ['Whether the feedback signal from the voltage sensor is actually present at the controller', 'The gate-drive waveform only', 'The battery voltage only', 'The output frequency only'], answer: 0, explain: 'If the controller believes the output is lower than it is, it will raise drive to compensate — exactly the symptom reported.' },
      { id: 'k3', rubric: 'procedure', type: 'mcq', prompt: 'Why must this check be made with the sensor\'s own wiring inspected, not just at the controller pin?', options: ['A missing OR disconnected sensor reads the same "no signal" at the controller, so the wiring itself must be traced to tell which it is', 'The controller pin reading alone is always sufficient', 'Only the sensor\'s datasheet needs checking', 'This check is not necessary'], answer: 0, explain: 'The symptom at the controller (no feedback) is the same whether the sensor has failed or its wiring has — tracing the wiring distinguishes them.' },
      { id: 'k4', rubric: 'interpret', type: 'mcq', prompt: 'No feedback signal reaches the controller, and the output sits at approximately the open-loop maximum the modulation can produce. What does this show?', options: ['With no feedback, the controller believes the output is far too low and drives the modulation index to its maximum', 'The sensor is reading correctly', 'The output is correctly regulated', 'The switching devices have failed short'], answer: 0, explain: 'This is exactly the regulation failure mode: a missing feedback signal is read by the controller as "far too low," so it raises drive without limit.' },
      { id: 'k5', rubric: 'eliminate', type: 'multi', prompt: 'Which of these does this evidence rule out?', options: ['A switching device failed short (that would typically look very different — a collapsed or badly distorted waveform, not a clean waveform at the open-loop maximum)', 'A disconnected feedback sensor/wiring', 'A battery voltage that has simply risen (this alone would not remove the feedback signal itself)', 'The possibility that the sensor wiring is intact but the sensor itself has failed internally (still to be distinguished by direct inspection)'], answers: [0, 2], explain: 'A shorted switch and a rise in battery voltage would each look different from, or would not explain, a total loss of feedback at the controller; both are ruled out by this specific evidence.' },
      { id: 'k6', rubric: 'diagnose', type: 'mcq', prompt: 'With the sensor\'s own wiring found intact on inspection, what is the confirmed fault?', options: ['The voltage sensor itself has failed, producing no feedback signal', 'The feedback wiring is disconnected', 'A switching device has failed short', 'The battery voltage has risen'], answer: 0, explain: 'With the wiring confirmed intact, the sensor itself is the remaining explanation.' },
      { id: 'k7', rubric: 'repair', type: 'mcq', prompt: 'What is the correct repair, and what must be checked about the controller\'s own behaviour?', options: ['Replace the sensor, and separately confirm the controller treats a genuinely missing feedback signal as a fault condition (shutting down) rather than running open-loop at maximum, since relying on the sensor never failing again is not itself a safe design', 'Replace the sensor only', 'Disable the regulation feature permanently', 'Reduce the modulation index limit as a permanent workaround'], answer: 0, explain: 'A unit that "fails to maximum output" on a lost sensor has a latent safety gap worth raising, separate from fixing this specific sensor — fixing the part and noting the design concern are both part of a thorough repair.' },
      { id: 'k8', rubric: 'verify', type: 'mcq', prompt: 'What confirms the repair?', options: ['Output voltage returns to the rated set-point and responds correctly to a load-change test', 'The new sensor is the correct part number', 'The wiring looks intact', 'The waveform shape alone is checked'], answer: 0, explain: 'Regulation must be demonstrated, not just presence of output at roughly the right level: apply a load step and confirm the output holds its set-point.' },
    ],
    candidateCauses: ['The output voltage sensor has failed, producing no feedback', 'The feedback wiring is disconnected', 'A switching device has failed short', 'The battery voltage has risen'],
    confirmedFault: 'The output voltage sensor has failed, so the controller receives no feedback and drives the modulation index to its maximum.',
    repairSteps: [
      { id: 'inspect', detail: 'Note the loss of load-responsiveness as the key regulation-specific symptom.' },
      { id: 'isolate', detail: 'Isolate the mains-voltage output section before handling any connection to it.' },
      { id: 'discharge', detail: 'Discharge any local bus capacitance relevant to the sensor circuit.' },
      { id: 'visual', detail: 'Trace and inspect the sensor\'s wiring before condemning the sensor itself.' },
      { id: 'measure', detail: 'Confirm the feedback signal is absent at the controller, then isolate whether the wiring or the sensor is at fault.' },
      { id: 'remove', detail: 'Remove the failed sensor.' },
      { id: 'replace', detail: 'Fit a replacement sensor of correct type and rating.' },
      { id: 'solder', detail: 'Make sound connections and inspect them.' },
      { id: 'post-test', detail: 'Re-energise under controlled conditions, output isolated from any load first.' },
      { id: 'verify', detail: 'Apply a load-change test and confirm the output holds its set-point.' },
      { id: 'document', detail: 'Record the sensor replacement and raise the open-loop-on-failure design observation.' },
    ],
    verificationNote: 'A load-change test is required: a steady no-load reading alone cannot show that regulation itself has been restored.',
    safety: 'This fault produces a sustained OVERVOLTAGE at the mains-referenced output: treat the output as hazardous and do not connect test equipment or loads not rated for the measured (not just the intended) voltage until the fault is confirmed fixed.',
  },
  {
    id: 'rsc-13',
    category: 'rep-04',
    domain: 'inverter',
    title: 'Repeated thermal shutdown: failed cooling fan',
    reportedProblem: 'The inverter runs normally for a few minutes under load, then shuts down on a thermal-protection code, every time.',
    equipment: 'An inverter rated to run its full load continuously only with its cooling fan operating; natural convection alone is rated for a much lower continuous load.',
    initialSymptoms: ['Shutdown always on the same thermal-protection code', 'Time-to-shutdown is roughly consistent for the same load', 'The fan is not audibly running'],
    usefulInstruments: ['Thermal/temperature probe (heat-sink temperature over time)', 'Digital multimeter (fan supply voltage)'],
    unhelpfulInstruments: ['Clamp meter on the AC output', 'LCR meter'],
    diagram: 'Heat sink (switching devices) ← fan-forced airflow (normal) or natural convection only (as found).',
    readings: () => {
      // Simplified thermal model (clearly labelled): steady-state rise ΔT = P_loss × R_th-to-ambient.
      const ploss = 28 // W, typical conduction+switching loss at this load
      const rthFan = 1.1 // °C/W, junction-to-ambient with the fan running
      const rthStill = 4.6 // °C/W, junction-to-ambient on natural convection alone
      const ta = 30
      return [
        { label: 'Fan supply voltage, as found', value: 0, unit: 'V', healthy: 12 },
        { label: 'Heat-sink steady-state temperature (simplified model, ΔT = P·R_th)', value: round(ta + ploss * rthStill, 0), unit: '°C', healthy: round(ta + ploss * rthFan, 0) },
        { label: 'Manufacturer\'s thermal-protection threshold', value: 95, unit: '°C' },
      ]
    },
    checkpoints: [
      { id: 'k1', rubric: 'symptom', type: 'mcq', prompt: 'Which detail most directly suggests a cooling problem rather than an electrical fault?', options: ['A consistent time-to-shutdown under the same load, with a thermal-protection code', 'A code appearing immediately on power-up', 'An intermittent, unpredictable shutdown', 'A code unrelated to temperature'], answer: 0, explain: 'A reproducible time-to-trip under a steady load is consistent with something heating up toward a threshold, rather than an abrupt electrical failure.' },
      { id: 'k2', rubric: 'instrument', type: 'mcq', prompt: 'What is the first useful check?', options: ['Fan supply voltage, and whether the fan actually runs', 'AC output waveform', 'Insulation resistance', 'Battery capacity'], answer: 0, explain: 'If the fan is not confirmed running, that is the simplest, most direct explanation to check first.' },
      { id: 'k3', rubric: 'procedure', type: 'mcq', prompt: 'How should the heat-sink temperature be tracked to confirm the pattern?', options: ['Logged over time under the same load that causes the shutdown, not a single snapshot', 'A single reading taken right after shutdown only', 'A single reading taken at power-up only', 'Estimated by touch'], answer: 0, explain: 'A single reading cannot show a RATE of rise; logging over time under the problem load reproduces and confirms the pattern.' },
      { id: 'k4', rubric: 'interpret', type: 'mcq', prompt: 'The fan supply measures 0 V while running, and the simplified thermal model shows the heat sink reaching the protection threshold on natural convection alone, at this load. What does this show?', options: ['The fan has stopped, and without it the heat sink cannot stay below the protection threshold at this load', 'The load is simply too high for the unit, fan or no fan', 'The thermal protection is miscalibrated', 'The switching devices are failing'], answer: 0, explain: 'A fan confirmed not running, combined with a model showing the natural-convection case alone reaching the threshold, explains the whole pattern without needing any other fault.' },
      { id: 'k5', rubric: 'eliminate', type: 'multi', prompt: 'Which of these does this evidence rule out as the PRIMARY cause?', options: ['A simple overload beyond the unit\'s fan-cooled rating (the load is within the fan-cooled rating; the model shows the fan-cooled case stays safely below threshold)', 'The thermal protection itself being miscalibrated (no evidence of this; it is doing exactly what it should at this temperature)', 'The fan having stopped', 'The possibility that the fan\'s own supply fuse, rather than the fan itself, has failed (worth checking directly, not yet distinguished)'], answers: [0, 1], explain: 'The model shows the load is fine WITH the fan running, and the protection is behaving correctly for the temperature reached — both point away from those as the primary cause. Whether it is the fan itself or its supply fuse still needs a direct check.' },
      { id: 'k6', rubric: 'diagnose', type: 'mcq', prompt: 'With the fan\'s own supply fuse then found intact (a further check), what is the confirmed fault?', options: ['The cooling fan itself has failed (stalled motor or open winding)', 'The fan\'s supply fuse has blown', 'The thermal-protection threshold is wrong', 'The load exceeds the unit\'s rating'], answer: 0, explain: 'With the fuse confirmed intact and voltage present at the fan\'s own terminals (a check worth adding before replacing it), the fan itself is the remaining explanation.' },
      { id: 'k7', rubric: 'repair', type: 'mcq', prompt: 'What is the correct repair?', options: ['Isolate, discharge, remove and replace the fan with one of the same specification (voltage, airflow, mounting), and clear any accumulated dust from the heat sink while it is open', 'Remove the fan and derate the unit instead', 'Raise the thermal-protection threshold so it trips later', 'Fit a larger fan than specified'], answer: 0, explain: 'Replacing like-for-like, and clearing dust (a very common contributor to this exact fault pattern), restores the design\'s intended cooling; raising the protection threshold would remove a genuine safety margin.' },
      { id: 'k8', rubric: 'verify', type: 'mcq', prompt: 'What confirms the repair?', options: ['The fan runs on power-up, and the unit holds the original problem load continuously without a thermal shutdown', 'The new fan spins freely by hand, unpowered', 'The heat sink is touched and feels cool at power-up', 'The thermal-protection code no longer appears once, briefly'], answer: 0, explain: 'The repair must be verified against the actual failure condition — sustained operation at the problem load — not a brief or unpowered check.' },
    ],
    candidateCauses: ['A failed/stalled cooling fan', 'A blown fan supply fuse', 'An overload beyond the fan-cooled rating', 'A miscalibrated thermal-protection threshold'],
    confirmedFault: 'The cooling fan has failed (stalled or open winding), leaving only natural convection, which cannot hold the heat sink below the protection threshold at this load.',
    repairSteps: [
      { id: 'inspect', detail: 'Note the reproducible time-to-trip under a known load as a thermal, not electrical, pattern.' },
      { id: 'isolate', detail: 'Isolate the unit before accessing the fan or heat sink.' },
      { id: 'discharge', detail: 'Discharge and prove dead before working near the heat sink/bus.' },
      { id: 'visual', detail: 'Inspect the fan for dust, obstruction and free rotation; inspect the fan fuse.' },
      { id: 'measure', detail: 'Fan supply voltage, fuse continuity, and a logged heat-sink temperature under the problem load.' },
      { id: 'remove', detail: 'Remove the failed fan.' },
      { id: 'replace', detail: 'Fit a replacement of the same specification; clean the heat sink.' },
      { id: 'solder', detail: 'Make sound connections to the new fan; inspect the fuse holder.' },
      { id: 'post-test', detail: 'Re-energise and run the original problem load under observation.' },
      { id: 'verify', detail: 'Confirm continuous operation at that load with no thermal shutdown.' },
      { id: 'document', detail: 'Record the fan replacement, the cleaning performed and the verification run duration.' },
    ],
    verificationNote: 'Verify with a sustained run at the original problem load — the fault only appeared after several minutes, so a brief test proves nothing.',
    safety: 'A unit that has been running hot may have a heat sink and nearby components still hot enough to burn: allow it to cool, or confirm temperature, before handling.',
  },
  {
    id: 'rsc-14',
    category: 'rep-04',
    domain: 'component',
    title: 'False overcurrent trip from a faulty current sensor',
    reportedProblem: 'The inverter trips on "overcurrent" at a load well within its rating, every time that load is applied.',
    equipment: 'A current sensor on the output stage feeding the protection circuit.',
    initialSymptoms: ['Trip occurs at a load the unit is clearly rated for', 'A clamp meter on the same conductor, used independently, shows a normal current at the moment of trip', 'No heating or damage found anywhere in the power path'],
    usefulInstruments: ['Clamp meter (independent current check on the same conductor)', 'Digital multimeter (sensor output signal)'],
    unhelpfulInstruments: ['Insulation tester', 'LCR meter'],
    diagram: 'Output conductor ← current sensor → protection circuit (trip comparator).',
    readings: () => [
      { label: 'Independent clamp-meter current at the moment of trip', value: 7.2, unit: 'A', healthy: 7.2 },
      { label: 'Unit\'s rated trip threshold', value: 20, unit: 'A' },
      { label: 'Current sensor\'s own reported output, as found', value: 23.5, unit: 'A (sensor-reported)' },
    ],
    checkpoints: [
      { id: 'k1', rubric: 'symptom', type: 'mcq', prompt: 'Which detail most strongly suggests a SENSING fault rather than a real overcurrent?', options: ['An independent clamp-meter reading at the same point, at the moment of trip, shows a current well within rating', 'The unit trips on overcurrent', 'The load is "well within rating" by specification alone', 'No damage is found'], answer: 0, explain: 'An independent measurement, taken at the same point and moment, that disagrees with the protection circuit\'s own reading is the strongest evidence the sensing itself is wrong, not the current.' },
      { id: 'k2', rubric: 'instrument', type: 'mcq', prompt: 'Why is an independent clamp-meter reading the right way to check this, rather than trusting the unit\'s own display?', options: ['It measures the actual conductor current directly, without relying on the very sensor suspected of being faulty', 'It is simply a more expensive instrument', 'It reads AC and DC simultaneously', 'It requires no calibration'], answer: 0, explain: 'The unit\'s own display is driven by the sensor under suspicion; an independent instrument breaks that dependency.' },
      { id: 'k3', rubric: 'procedure', type: 'mcq', prompt: 'What must be true of the clamp measurement for the comparison to be valid?', options: ['It must be taken on the SAME single conductor, at the SAME time as the unit reports its reading', 'It can be taken on either conductor, at any convenient time', 'It should be taken with the load removed', 'It should clamp both conductors together for a "total" reading'], answer: 0, explain: 'A different conductor, a different moment, or clamping both conductors together (which cancels the reading, Phase 8 F5.M2) would all invalidate the comparison.' },
      { id: 'k4', rubric: 'interpret', type: 'mcq', prompt: 'The independent clamp reading is well below the trip threshold while the sensor reports a value above it. What does this combination show?', options: ['The current sensor is over-reporting the actual current', 'The load is genuinely overcurrent and the clamp meter is wrong', 'The protection circuit\'s threshold is set too low', 'The conductor itself has extra resistance'], answer: 0, explain: 'With the actual current confirmed normal by an independent instrument, a sensor reporting a higher value is itself in error.' },
      { id: 'k5', rubric: 'eliminate', type: 'multi', prompt: 'Which of these does this evidence rule out?', options: ['A genuine overcurrent condition (the independent clamp reading rules this out directly)', 'The protection threshold simply being set too low for this unit\'s own rating (the threshold matches the rating; the ACTUAL current is the problem)', 'The current sensor over-reporting', 'The possibility of a wiring/connector fault on the sensor\'s own signal output, which has not yet been checked directly'], answers: [0, 1], explain: 'A genuine overcurrent and a wrongly-set threshold are both ruled out by comparing the independent reading to the correctly-set threshold; the sensor\'s signal path itself still needs direct checking to distinguish the sensor from its own wiring.' },
      { id: 'k6', rubric: 'diagnose', type: 'mcq', prompt: 'With the sensor\'s signal wiring then found intact, what is the confirmed fault?', options: ['The current sensor itself is faulty, over-reporting the actual current', 'A connector on the sensor\'s signal line is loose', 'The protection circuit\'s comparator has failed', 'The load genuinely draws excess current intermittently'], answer: 0, explain: 'With the wiring confirmed intact, the sensor\'s own output is the remaining explanation for the mismatch.' },
      { id: 'k7', rubric: 'repair', type: 'mcq', prompt: 'What is the correct repair?', options: ['Isolate, discharge, replace the current sensor with one of the same type and rating, then re-verify its reading against the independent clamp measurement before returning to service', 'Raise the protection threshold to stop the trips', 'Disable overcurrent protection on this unit', 'Replace the load instead'], answer: 0, explain: 'Raising or disabling the protection to "fix" a false trip removes real protection for a genuine future overcurrent; the faulty sensor must be replaced.' },
      { id: 'k8', rubric: 'verify', type: 'mcq', prompt: 'What confirms the repair?', options: ['The sensor\'s reported current now matches an independent clamp reading at the same load, and the unit no longer trips at that load', 'The new sensor looks correct', 'The unit simply stops tripping once', 'The protection circuit is re-wired'], answer: 0, explain: 'Agreement between the sensor and an independent measurement, under the actual problem load, is what verifies the repair.' },
    ],
    candidateCauses: ['A faulty current sensor over-reporting the actual current', 'A genuine overcurrent condition', 'A protection threshold set too low', 'A loose connector on the sensor\'s signal line'],
    confirmedFault: 'The current sensor is faulty and over-reports the actual output current, causing a false protection trip.',
    repairSteps: [
      { id: 'inspect', detail: 'Compare the reported trip current against the unit\'s own rating before assuming the load is really at fault.' },
      { id: 'isolate', detail: 'Isolate before accessing the sensor or its wiring.' },
      { id: 'discharge', detail: 'Discharge and prove dead before handling the sensor connections.' },
      { id: 'visual', detail: 'Inspect the sensor\'s mounting and signal wiring for damage or looseness.' },
      { id: 'measure', detail: 'Compare an independent clamp reading with the sensor\'s own reported value at the same load and moment.' },
      { id: 'remove', detail: 'Remove the faulty sensor.' },
      { id: 'replace', detail: 'Fit a replacement of the same type and rating, correctly oriented on the conductor.' },
      { id: 'solder', detail: 'Make sound signal connections and inspect them.' },
      { id: 'post-test', detail: 'Re-energise and apply the original problem load under controlled observation.' },
      { id: 'verify', detail: 'Confirm the sensor\'s reading agrees with an independent measurement and the trip no longer occurs.' },
      { id: 'document', detail: 'Record the sensor replacement and the before/after comparison readings.' },
    ],
    verificationNote: 'Verification must compare the sensor against an independent measurement, not just confirm the trips have stopped — a sensor that under-reports would also stop nuisance trips while hiding a real fault.',
    safety: 'Never disable or raise overcurrent protection to silence a trip you have not yet confirmed is false: verify independently first.',
  },
  {
    id: 'rsc-15',
    category: 'rep-05',
    domain: 'solar',
    title: 'Hybrid system stuck on backup after the grid returns',
    reportedProblem: 'After a grid outage, the hybrid inverter continues running from the battery/generator path even though the grid has clearly been restored for some time.',
    equipment: 'A hybrid system with a transfer relay that should return the load to the grid path once grid voltage is confirmed present and stable.',
    initialSymptoms: ['Grid voltage confirmed present and stable at the inverter\'s own grid-sensing input', 'The relay remains on the backup contact', 'No fault code is shown; the unit believes it is operating correctly'],
    usefulInstruments: ['Digital multimeter (grid-sensing input voltage, and relay coil voltage)', 'Visual inspection of the relay contacts, isolated'],
    unhelpfulInstruments: ['Oscilloscope', 'Clamp meter'],
    diagram: 'Grid-sensing input → controller → relay coil → relay contacts (grid / backup) → load.',
    readings: () => [
      { label: 'Grid-sensing input voltage, as found', value: 230, unit: 'V', healthy: 230 },
      { label: 'Relay coil voltage commanded by the controller, as found', value: 12, unit: 'V', healthy: 12 },
      { label: 'Load terminal supply path, as found (confirmed by tracing, not by the controller\'s own display)', value: 0, unit: '(backup path still selected)' },
    ],
    checkpoints: [
      { id: 'k1', rubric: 'symptom', type: 'mcq', prompt: 'Which detail is the most important one to confirm independently, rather than trust from the controller\'s own display?', options: ['Which path (grid or backup) the load is actually being supplied from', 'The grid voltage reading', 'The absence of a fault code', 'The time since the outage'], answer: 0, explain: 'The controller believes it is operating correctly and shows no fault; the actual supply path must be confirmed by direct measurement/tracing, not taken on trust from the display that is itself in question.' },
      { id: 'k2', rubric: 'instrument', type: 'mcq', prompt: 'What two measurements together localise whether this is a sensing, control or relay problem?', options: ['The grid-sensing input voltage, and the relay coil voltage actually commanded by the controller', 'The battery voltage only', 'The output waveform only', 'The generator fuel level'], answer: 0, explain: 'Confirming the controller sees correct grid voltage AND is commanding the coil correctly narrows the fault to the relay itself if both are confirmed correct.' },
      { id: 'k3', rubric: 'procedure', type: 'mcq', prompt: 'How should the relay contacts be checked once the coil is confirmed to be commanded correctly?', options: ['Isolate, then inspect and test the contacts themselves, since a mechanical fault in the switching element is now the remaining explanation', 'Leave the system live and tap the relay case', 'Replace the controller without checking the relay', 'Increase the grid-sensing threshold'], answer: 0, explain: 'With sensing and coil command both confirmed, the contacts themselves are the next thing to examine — safely, isolated.' },
      { id: 'k4', rubric: 'interpret', type: 'mcq', prompt: 'Grid sensing is correct, the coil is being commanded to the grid position, yet the load remains on backup. What does this combination indicate?', options: ['The relay\'s mechanical contacts are not following the coil command (e.g. welded/stuck on the backup contact)', 'The grid sensor has failed', 'The controller logic has failed to command the relay', 'The battery has failed'], answer: 0, explain: 'Correct sensing and correct coil command, with the wrong physical outcome, points at the mechanical switching element itself, not the electronics commanding it.' },
      { id: 'k5', rubric: 'eliminate', type: 'multi', prompt: 'Which of these does this evidence rule out?', options: ['A fault in the grid-sensing input (confirmed correct)', 'A fault in the controller\'s coil-drive logic (confirmed correctly commanding the grid position)', 'A mechanically stuck/welded relay contact', 'The possibility of a wiring fault between the relay\'s output contacts and the load, which has not yet been checked and would look different from this evidence anyway'], answers: [0, 1], explain: 'Both the sensing input and the coil command are independently confirmed correct, leaving the relay\'s own switching element as the explanation; a downstream wiring fault would not explain why the relay itself shows backup selected on inspection.' },
      { id: 'k6', rubric: 'diagnose', type: 'mcq', prompt: 'On isolated inspection, the contacts are found fused/welded on the backup position. What is the confirmed fault?', options: ['The transfer relay\'s contacts have welded shut on the backup path, most likely from an earlier high-current transfer event', 'The grid sensor has failed', 'The controller logic has failed', 'The generator is still running and overriding the relay'], answer: 0, explain: 'Contacts can weld from switching current at the moment of transfer if a transfer happens under load beyond the relay\'s rating — a mechanical, not electronic, failure.' },
      { id: 'k7', rubric: 'repair', type: 'mcq', prompt: 'What is the correct repair, and what should be reviewed alongside it?', options: ['Replace the relay with one of the correct rating, and review whether transfers are happening under more current than the relay is rated to switch', 'Clean the contacts and refit the same relay', 'Replace the controller instead', 'Disable automatic transfer and operate the switch manually from now on'], answer: 0, explain: 'A welded contact is usually a symptom of switching beyond rating; replacing with the same (possibly marginal) relay without reviewing the transfer condition risks a repeat failure.' },
      { id: 'k8', rubric: 'verify', type: 'mcq', prompt: 'What confirms the repair?', options: ['A deliberate, controlled grid-loss-and-return test shows the relay correctly switching to backup and back to grid', 'The new relay\'s coil reads the correct resistance, unpowered', 'The old contacts are visibly removed', 'The controller\'s display shows "grid" once'], answer: 0, explain: 'The fault was specifically about FAILING TO RETURN to grid; verification must actually exercise a full outage-and-return cycle, not just confirm a static state.' },
    ],
    candidateCauses: ['The transfer relay\'s contacts have welded shut on the backup path', 'The grid-sensing input has failed', 'The controller\'s coil-drive logic has failed', 'The generator is overriding the transfer decision'],
    confirmedFault: 'The transfer relay\'s contacts have welded shut on the backup position, most likely from a transfer under a current beyond the relay\'s rating.',
    repairSteps: [
      { id: 'inspect', detail: 'Confirm the actual supply path independently rather than trusting the controller\'s display alone.' },
      { id: 'isolate', detail: 'Isolate both the grid and backup sources before accessing the relay.' },
      { id: 'discharge', detail: 'Discharge any local capacitance on the control board before handling it.' },
      { id: 'visual', detail: 'Inspect the relay contacts directly for welding/pitting once isolated.' },
      { id: 'measure', detail: 'Confirm grid-sensing voltage and coil-command voltage before condemning the relay.' },
      { id: 'remove', detail: 'Remove the welded relay.' },
      { id: 'replace', detail: 'Fit a replacement of correct (or improved) switching rating for the transfer currents actually seen.' },
      { id: 'solder', detail: 'Make sound connections to the new relay and inspect them.' },
      { id: 'post-test', detail: 'Re-energise and perform a controlled transfer test before returning to unattended service.' },
      { id: 'verify', detail: 'Exercise a full grid-loss-and-return cycle and confirm correct switching both ways.' },
      { id: 'document', detail: 'Record the relay replacement and the transfer-current review performed.' },
    ],
    verificationNote: 'Exercise a full outage-and-return cycle; the fault specifically affected the RETURN direction, so confirming only the loss-of-grid transfer would miss it.',
    safety: 'Treat both the grid and backup sources as potentially live until each is independently isolated and proved dead: a transfer relay exists precisely because either source can be present.',
  },
  {
    id: 'rsc-16',
    category: 'rep-05',
    domain: 'solar',
    title: 'MPPT controller stuck away from the maximum power point',
    reportedProblem: 'Charging power is far below what the array should deliver on a clear day, although the array itself tests fine.',
    equipment: 'An MPPT charge controller using a perturb-and-observe algorithm, feeding a battery bank from a PV string.',
    initialSymptoms: ['Array open-circuit voltage and short-circuit current both test normal when checked directly', 'The controller\'s operating voltage sits far from the array\'s known maximum-power voltage', 'Charging power does not improve across the day as irradiance changes'],
    usefulInstruments: ['Digital multimeter (array voltage at the controller terminals)', 'The platform\'s own I–V curve tool (Solar and Hybrid Engineering Laboratory)'],
    unhelpfulInstruments: ['Clamp meter on the AC output (this is a DC input-side fault)', 'Insulation tester'],
    diagram: 'PV string → MPPT controller (perturb-and-observe tracking) → battery.',
    readings: () => {
      const preset = SOLAR_PRESET_BY_ID['offgrid-home']
      const m = preset.spec.module
      const g = 900
      const tc = cellTemp(m, 25, g)
      const op = operating(m, g, tc)
      const series = 10
      const curve = arrayCurve(m, { series, strings: 1, g, tCell: tc })
      const healthyMpp = mpp(curve)
      const po = perturbObserve(curve, { scan: true })
      const stuckV = op.voc * series * 0.97 // near V_oc for the whole string: the tracker has walked up and stalled there
      const stuckP = stuckV * curveCurrent(curve, stuckV)
      return [
        { label: 'Array V_oc, tested directly', value: round(op.voc * series, 1), unit: 'V', healthy: round(op.voc * series, 1) },
        { label: 'Array I_sc, tested directly', value: round(op.isc, 2), unit: 'A', healthy: round(op.isc, 2) },
        { label: 'Controller\'s chosen operating voltage, as found', value: round(stuckV, 1), unit: 'V' },
        { label: 'Power at the maximum-power point (reference)', value: round(healthyMpp.p, 0), unit: 'W', healthy: round(healthyMpp.p, 0) },
        { label: 'Power at the controller\'s actual operating point, as found', value: round(stuckP, 0), unit: 'W' },
        { label: 'Power a correctly tracking controller finds (cross-check)', value: round(po.final.p, 0), unit: 'W', healthy: round(healthyMpp.p, 0) },
      ]
    },
    checkpoints: [
      { id: 'k1', rubric: 'symptom', type: 'mcq', prompt: 'Which detail most clearly points away from the array itself?', options: ['V_oc and I_sc both test normal when checked directly', 'Charging power is low', 'The day is clear', 'The battery is present'], answer: 0, explain: 'If the array\'s own fundamental parameters are normal, the array itself is not the fault — something in how it is being operated is.' },
      { id: 'k2', rubric: 'instrument', type: 'mcq', prompt: 'What single additional reading best confirms where on the curve the controller is actually operating?', options: ['The array voltage at the controller\'s own input terminals, while charging', 'A second V_oc test', 'Battery voltage alone', 'Ambient temperature'], answer: 0, explain: 'Comparing the controller\'s actual operating voltage against the known maximum-power voltage shows directly whether it is tracking correctly.' },
      { id: 'k3', rubric: 'procedure', type: 'mcq', prompt: 'Why compare the operating voltage against V_mp rather than just against V_oc?', options: ['The maximum-power point sits at a specific voltage below V_oc (typically ≈ 80 % of V_oc); operating near V_oc itself is a world away from maximum power, not just "a bit off"', 'V_oc and V_mp are always the same', 'Only V_oc matters for charging power', 'This comparison is unnecessary'], answer: 0, explain: 'The whole point of MPPT is to sit near V_mp, well below V_oc; parking near V_oc produces very little current and very little power.' },
      { id: 'k4', rubric: 'interpret', type: 'mcq', prompt: 'The controller is operating near V_oc, where the power available is a small fraction of the true maximum-power point, even though the array itself tests normal. What does this show?', options: ['The tracking algorithm is not finding or holding the maximum-power point: the controller itself is the fault', 'The array is shaded', 'The array has degraded', 'The battery is full and backing off charging'], answer: 0, explain: 'A normal array with the controller stuck at the wrong operating voltage is a tracking fault, not an array fault.' },
      { id: 'k5', rubric: 'eliminate', type: 'multi', prompt: 'Which of these does this evidence rule out?', options: ['Array degradation or shading (V_oc and I_sc both test normal, which a degraded or heavily shaded array would not show)', 'A battery that is simply full and reducing the charge current by design (this would show a controlled, battery-referenced voltage, not a voltage parked near V_oc)', 'A tracking-algorithm fault in the controller', 'The possibility of a wiring fault between the array and the controller, which has not yet been directly checked'], answers: [0, 1], explain: 'Both a degraded/shaded array and a legitimately full battery would produce a different, more specific pattern than "parked near V_oc" — neither matches this evidence as well as a stuck tracker does; wiring has not yet been separately checked.' },
      { id: 'k6', rubric: 'diagnose', type: 'mcq', prompt: 'What is the confirmed fault?', options: ['The MPPT controller\'s tracking algorithm has failed or is stuck, operating the array far from its maximum-power point', 'The array has degraded', 'The array is shaded', 'The battery is simply full'], answer: 0, explain: 'The array and the battery charge-state are both accounted for; the controller\'s own tracking behaviour is the remaining explanation.' },
      { id: 'k7', rubric: 'repair', type: 'mcq', prompt: 'What is the correct repair?', options: ['Isolate, inspect/update or replace the controller as the manufacturer specifies, then re-verify tracking across a range of conditions, not just one moment', 'Manually fix the operating voltage at today\'s V_mp and leave it there permanently', 'Replace the array instead', 'Add a second controller in parallel'], answer: 0, explain: 'V_mp moves with irradiance and temperature through the day (S2.M2); fixing it at one value defeats the purpose of MPPT and would itself become a new fault as conditions change.' },
      { id: 'k8', rubric: 'verify', type: 'mcq', prompt: 'What confirms the repair?', options: ['The controller\'s operating voltage tracks near V_mp as conditions change through the day, and charging power approaches the reference maximum', 'The controller powers on', 'A single good reading at one moment', 'The display shows "MPPT" mode selected'], answer: 0, explain: 'Tracking must be shown to actually follow the moving maximum-power point over time, not just produce one good reading.' },
    ],
    candidateCauses: ['A failed/stuck MPPT tracking algorithm', 'Array degradation', 'Partial shading of the array', 'The battery simply being full'],
    confirmedFault: 'The MPPT controller\'s tracking algorithm has failed or is stuck, holding the array far from its maximum-power point.',
    repairSteps: [
      { id: 'inspect', detail: 'Confirm the array\'s own V_oc and I_sc are normal before suspecting the controller.' },
      { id: 'isolate', detail: 'Isolate the DC array input at its own isolator before accessing the controller.' },
      { id: 'discharge', detail: 'Note that a PV array cannot be switched off at the panel itself (F1.M2.L3): confirm isolation is at the controller/combiner, not assumed from the array.' },
      { id: 'visual', detail: 'Inspect the controller for fault indicators and firmware/version information.' },
      { id: 'measure', detail: 'Compare the controller\'s operating voltage against the array\'s known V_mp over a range of conditions.' },
      { id: 'remove', detail: 'Remove the faulty controller.' },
      { id: 'replace', detail: 'Fit a replacement (or apply the manufacturer\'s firmware fix) of the correct rating for the array.' },
      { id: 'solder', detail: 'Not typically applicable; make sound terminal connections and inspect them.' },
      { id: 'post-test', detail: 'Re-energise and observe tracking behaviour across changing irradiance.' },
      { id: 'verify', detail: 'Confirm operating voltage follows V_mp and charging power approaches the reference maximum.' },
      { id: 'document', detail: 'Record the controller replaced/updated and the before/after tracking behaviour.' },
    ],
    verificationNote: 'Verify across changing conditions through the day, not a single good reading — a tracker can appear to work momentarily and still be faulty.',
    safety: 'A PV array cannot be switched off at the panel: isolate at the array isolator/combiner, and treat array conductors as live whenever light falls on them.',
  },
  {
    id: 'rsc-17',
    category: 'rep-05',
    domain: 'solar',
    title: 'Lost battery communication defaults the charger to a conservative stage',
    reportedProblem: 'A system with a communicating lithium battery (BMS) is charging far more slowly than its rating allows, even on a clear day with the battery well below full.',
    equipment: 'A hybrid system whose charge controller normally receives charge-current and voltage limits from the battery\'s own BMS over a communication link, and falls back to a fixed, conservative default profile if that link is lost.',
    initialSymptoms: ['Charging current far below the battery\'s rated maximum', 'The controller shows a generic/default charge profile rather than the battery\'s own specified one', 'No fault code on the battery itself when checked at its own display'],
    usefulInstruments: ['Digital multimeter (communication-link signal presence/continuity)', 'Visual inspection of the communication connector'],
    unhelpfulInstruments: ['Clamp meter on the DC charge current alone, without the context of the profile being used', 'LCR meter'],
    diagram: 'Battery BMS ↔ communication link ↔ charge controller → charge current/voltage limits applied.',
    readings: () => [
      { label: 'Charging current applied, as found', value: 8, unit: 'A', healthy: 40 },
      { label: 'Charge profile selected by the controller', value: 0, unit: '(generic default, not the battery\'s own profile)' },
      { label: 'Battery\'s own BMS status, checked directly at the battery', value: 1, unit: '(no fault reported by the BMS itself)' },
    ],
    checkpoints: [
      { id: 'k1', rubric: 'symptom', type: 'mcq', prompt: 'Which detail most clearly points at the COMMUNICATION link rather than the battery or the controller\'s power stage?', options: ['The controller is using a generic default profile, and the battery itself reports no fault', 'Charging is slow', 'It is a clear day', 'The battery is below full'], answer: 0, explain: 'A controller falling back to a generic profile, with the battery itself healthy, is the specific signature of a lost communication link, not a power or battery fault.' },
      { id: 'k2', rubric: 'instrument', type: 'mcq', prompt: 'What should be checked first, given this pattern?', options: ['The communication link itself (connector, cable, signal presence) between the battery and the controller', 'The charge current alone', 'The array I–V curve', 'The battery\'s internal resistance'], answer: 0, explain: 'The pattern already points at the link; checking it directly is the efficient next step rather than re-checking the power path.' },
      { id: 'k3', rubric: 'procedure', type: 'mcq', prompt: 'Why check the connector and cable before assuming the BMS or the controller\'s communication port has failed?', options: ['A loose or damaged connector is the most common and easiest-to-fix cause of a lost link, and must be ruled out before replacing electronics', 'Connectors never fail', 'The BMS is always the cause', 'The controller port is always the cause'], answer: 0, explain: 'Working from the simplest, most likely cause toward the more invasive ones avoids replacing good electronics for a bad connector.' },
      { id: 'k4', rubric: 'interpret', type: 'mcq', prompt: 'The communication connector is found damaged, with no signal reaching the controller, while the battery\'s own BMS reports healthy. What does this confirm?', options: ['The communication link itself has failed, so the controller cannot see the battery\'s real charge limits and defaults to a conservative profile', 'The battery has failed', 'The controller\'s power stage has failed', 'The array is undersized'], answer: 0, explain: 'A healthy battery and a healthy (by design) conservative default, with a confirmed broken link between them, explains the whole symptom.' },
      { id: 'k5', rubric: 'eliminate', type: 'multi', prompt: 'Which of these does this evidence rule out?', options: ['A fault in the battery\'s own BMS (confirmed healthy at the battery)', 'An undersized PV array or controller for this battery (not evidenced here; the limitation is the controller defaulting, not a sizing shortfall)', 'A broken communication link', 'The possibility that the controller\'s own communication port, not just the cable, is also damaged, which has not yet been separately tested'], answers: [0, 1], explain: 'The BMS is independently confirmed healthy, and nothing here suggests an undersized system — the controller is simply defaulting because it cannot see the battery\'s real limits. Whether the controller\'s own port is also damaged (versus just the cable/connector) still needs its own check.' },
      { id: 'k6', rubric: 'diagnose', type: 'mcq', prompt: 'With the controller\'s own communication port then tested and found working (using a known-good cable), what is the confirmed fault?', options: ['The communication cable/connector between the battery and the controller has failed', 'The controller\'s communication port has failed', 'The battery\'s BMS has failed', 'The array is undersized'], answer: 0, explain: 'With the controller\'s port confirmed working on a known-good cable, the original cable/connector is the remaining explanation.' },
      { id: 'k7', rubric: 'repair', type: 'mcq', prompt: 'What is the correct repair?', options: ['Isolate, discharge, replace the damaged communication cable/connector with the correct type, then confirm the controller reads the battery\'s own profile', 'Permanently set the controller to a higher, hand-chosen charge current to compensate', 'Replace the battery', 'Replace the controller'], answer: 0, explain: 'Manually overriding the charge current without the BMS\'s own limits risks exceeding what the battery can safely accept; fixing the link restores the intended, safe automatic limits.' },
      { id: 'k8', rubric: 'verify', type: 'mcq', prompt: 'What confirms the repair?', options: ['The controller displays the battery\'s own charge profile (not the generic default), and charging current rises to the battery\'s rated value while it is below full', 'The connector looks intact', 'The charging current rises at all, by any amount', 'The battery\'s BMS display is checked once more'], answer: 0, explain: 'The repair must be confirmed by the controller actually using the battery\'s OWN profile and charging at its rated current, not merely by some improvement.' },
    ],
    candidateCauses: ['A failed/damaged communication cable or connector', 'A fault in the battery\'s own BMS', 'A fault in the controller\'s communication port', 'An undersized array or controller for this battery'],
    confirmedFault: 'The communication cable/connector between the battery\'s BMS and the charge controller has failed, so the controller defaults to a conservative generic charge profile.',
    repairSteps: [
      { id: 'inspect', detail: 'Note that the battery itself reports no fault while the controller shows a generic profile — the specific signature of a lost link.' },
      { id: 'isolate', detail: 'Isolate the charging source before accessing the communication wiring.' },
      { id: 'discharge', detail: 'Discharge any local capacitance relevant to the communication circuit before handling it.' },
      { id: 'visual', detail: 'Inspect the communication connector and cable for damage.' },
      { id: 'measure', detail: 'Check signal presence/continuity on the link, and verify the controller\'s own port with a known-good cable.' },
      { id: 'remove', detail: 'Remove the damaged cable/connector.' },
      { id: 'replace', detail: 'Fit a replacement of the correct type and pin-out.' },
      { id: 'solder', detail: 'Make sound connector terminations and inspect them.' },
      { id: 'post-test', detail: 'Re-energise and confirm the controller establishes communication with the battery.' },
      { id: 'verify', detail: 'Confirm the controller displays the battery\'s own profile and charges at its rated current while below full.' },
      { id: 'document', detail: 'Record the cable/connector replaced and the before/after charge current.' },
    ],
    verificationNote: 'Confirm the controller is using the battery\'s OWN profile, not just that the charge current has risen by some amount.',
    safety: 'Never manually override a communicating battery\'s charge limits to compensate for a lost link: restore the link so the battery\'s own, chemistry-specific limits are respected.',
  },
]

export const REPAIR_SCENARIO_BY_ID: Record<string, RepairScenario> = Object.fromEntries(REPAIR_SCENARIOS.map((s) => [s.id, s]))

/** Scenarios grouped by the five workshop categories (brief §4; also the five `rep-0X` lesson ids
 * already reserved in `content/modules.ts`). */
export const REPAIR_CATEGORY_SCENARIOS: Record<string, string[]> = {
  'rep-01': REPAIR_SCENARIOS.filter((s) => s.category === 'rep-01').map((s) => s.id),
  'rep-02': REPAIR_SCENARIOS.filter((s) => s.category === 'rep-02').map((s) => s.id),
  'rep-03': REPAIR_SCENARIOS.filter((s) => s.category === 'rep-03').map((s) => s.id),
  'rep-04': REPAIR_SCENARIOS.filter((s) => s.category === 'rep-04').map((s) => s.id),
  'rep-05': REPAIR_SCENARIOS.filter((s) => s.category === 'rep-05').map((s) => s.id),
}

