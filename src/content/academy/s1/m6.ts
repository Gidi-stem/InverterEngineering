import type { AcademyModule } from '../types'
import { to } from './links'

/** S1.M6 Engineering testing and troubleshooting. */
export const S1_M6: AcademyModule = {
  id: 'S1.M6',
  title: 'Engineering testing and troubleshooting',
  summary: 'How an inverter is verified against its specification, how test results are reported, and how faults are found systematically from measurements.',
  lessons: [
    {
      id: 'S1.M6.L1',
      title: 'The engineering test suite and engineering reports',
      minutes: 40,
      content: {
        objectives: [
          'State the purpose, test condition and pass criterion of each of the ten engineering tests.',
          'Distinguish calculated estimates, simulated measurements and real measurements, and explain why they differ.',
          'Write an engineering test report with results, criteria, explanations and limitations.',
          'Choose which additional tests a real product would need beyond the simulation.',
        ],
        introduction: `A design is a hypothesis: "this circuit will deliver 1 kW of clean 230 V for the whole battery range." Testing is how the hypothesis is checked. In industry, a development engineer runs a defined test plan against the specification and records every result, pass or fail, with the conditions under which it was measured. The build laboratory's test suite is a simulated version of such a plan.`,
        lecture: `### The test plan

Each test changes one condition and measures what the specification cares about.

| Test | Condition | What it reveals |
|---|---|---|
| No-load | Load removed | Standby consumption (magnetising current, switching, control); unregulated voltage rise |
| Resistive | Rated resistive load at nominal input | The design point: voltage, frequency, power |
| Inductive | Load with PF ≈ 0.8 | Handling of reactive current; energy returned through the diodes |
| Overload | 150 % load | Thermal and protection margin |
| Short circuit | Output shorted | That a protective device operates |
| Input variation | Battery at its cut-off and at its charging voltage | Output across the battery range |
| Regulation | No load → full load; low → high battery | Load and line regulation |
| Efficiency | Rated load | P_out / P_in |
| Thermal | Rated load | Hottest junction temperature |
| Waveform | Rated load | THD, frequency, crest factor, DC offset |

Solar and hybrid projects add MPPT, grid-mode and generator-mode tests.

### Three kinds of number again

1. **Calculated** (the configurator): hand-calculation formulas with typical assumptions. Quick, transparent, approximate.
2. **Simulated** (the test suite): the circuit equations solved in time for the parts and parameters you built. More accurate for circuit behaviour, but still limited by the models.
3. **Measured** (real hardware): the only ground truth, and it requires equipment, safety procedures and qualified people.

When calculation and simulation disagree, the difference is information. The simulated efficiency, for example, comes out a little higher or lower than the estimate depending on which losses each includes. Always ask *why*.

### Writing the report

A test report states, for each test:

- the **condition** (input voltage, load, ambient);
- the **readings**, with units;
- the **criterion** and the **result** (pass or fail);
- an **explanation**: what the readings mean physically.

It ends with a **conclusion** against the specification and a list of **limitations**: what was not, or could not be, tested. The build laboratory generates this structure and lets you export it.

### What the simulation cannot test

A real product's test plan also includes:

- EMI emissions and immunity;
- insulation (hipot) testing;
- earth continuity;
- temperature rise in a thermal chamber;
- surge and transient tests;
- long-term reliability (burn-in);
- mechanical tests;
- for grid-connected products, grid-code and anti-islanding tests.

These need physical hardware and, for certification, an accredited laboratory.`,
        technical: `**Window and settling.** Each simulated test runs six output cycles and measures the last three, after the filter, the regulator and the magnetising current have settled. A real test lets the equipment reach thermal equilibrium, which can take an hour.

**Why measure RMS, THD and power over whole cycles?** These quantities are defined over a period. A window that is not a whole number of cycles introduces error. The analysis finds the zero crossings and uses whole cycles.

**Cached runs.** Several tests share one simulation. The resistive, efficiency, thermal and waveform tests all use the rated-load run, so the suite reports them consistently.

**Pass criteria are educational.** The thresholds (±3 % regulated, THD < 5 %, η ≥ 80 %, T_j ≤ 125 °C) are typical engineering targets chosen for this course. Product standards and customer specifications set their own.`,
        diagrams: [{ id: 'test-bench', caption: 'What each test changes in the circuit, and what it measures.' }],
        formulas: [
          { name: 'Deviation from nominal', expr: 'Δ = (V_measured − V_nominal) / V_nominal × 100 %', where: [] },
          { name: 'Simulated efficiency', expr: 'η = mean(v_out · i_out) / mean(v_in · i_in)', where: [] },
        ],
        examples: [
          {
            title: 'Interpreting a no-load result',
            problem: 'Project B (unregulated) reads 254.5 V at no load and 229.9 V at rated load, with a no-load input power of 0.8 W. Explain both.',
            steps: ['At no load the switch and winding drops vanish, so the unregulated output rises: (254.5 − 229.9)/229.9 = 10.7 % load regulation', 'The 0.8 W no-load input is the magnetising current and the small losses the model includes; real products also power their controller, which adds a few watts'],
            answer: 'Both are expected for an unregulated design. A real unit’s no-load consumption would be several watts higher because of its control electronics.',
          },
          {
            title: 'Estimate versus simulation',
            problem: 'Project D’s calculation sheet estimates η = 93.6 %, and the simulation measures 92.9 %. Which losses could explain the difference?',
            steps: ['The estimate includes control power and a typical transformer loss; the simulation has no control power but does include battery-side ripple, magnetising current and the actual switch currents', 'Losses not modelled in either (ESR, core loss detail, gate drive, wiring) would lower real efficiency further'],
            answer: 'The two agree within about 1 %, which is good. Real hardware would probably measure lower than both.',
          },
        ],
        applications: `Every inverter datasheet is the summary of such a test report: efficiency curve, no-load consumption, output tolerance, THD, surge capability, operating temperature range. Certification laboratories run their own test plans to the applicable standards.`,
        mistakes: [
          { mistake: 'Reporting only the tests that passed.', correction: 'A report records every result; failures are the most useful information.' },
          { mistake: 'Treating simulated results as measured.', correction: 'Label them “simulated” and state the model limitations.' },
          { mistake: 'Comparing numbers measured under different conditions.', correction: 'State the input voltage, load and ambient with every result.' },
        ],
        demo: {
          title: 'Run a full suite and export the report',
          text: 'Run the complete suite on any project you have built, read every explanation, and export the report. Add your own conclusion and limitations.',
          link: to.build('Open project D', 'bld-d'),
        },
        activities: [to.build('Project B test suite', 'bld-b'), to.build('Project F test suite', 'bld-f')],
        check: [
          { id: 'k1', type: 'mcq', prompt: 'Which test reveals the standby (no-load) consumption?', options: ['No-load', 'Overload', 'Waveform', 'Short circuit'], answer: 0, explain: 'With the load removed, the remaining input power is the standby loss.' },
          { id: 'k2', type: 'numeric', prompt: 'Deviation of 223.1 V from 230 V nominal (%)?', answer: -3, tol: 0.01, unit: '%', explain: '(223.1 − 230)/230 = −3.0 %.' },
          { id: 'k3', type: 'mcq', prompt: 'Which of these can the simulation NOT test?', options: ['EMI emissions of the real layout', 'Output THD of the model', 'Efficiency of the model', 'Line regulation of the model'], answer: 0, explain: 'EMI needs physical hardware and a test laboratory.' },
          { id: 'k4', type: 'mcq', prompt: 'A good test report includes…', options: ['conditions, readings, criteria, results, explanations and limitations', 'only the pass/fail summary', 'only the passed tests', 'only the calculations'], answer: 0, explain: 'All of these make the report verifiable and useful.' },
        ],
        summary: [
          'A test plan changes one condition per test and measures what the specification requires.',
          'Calculated, simulated and measured values differ; the differences carry information.',
          'Reports give conditions, readings, criteria, results, explanations and limitations.',
          'Simulation cannot test EMI, insulation, thermal equilibrium, reliability or certification requirements.',
          'Pass criteria here are educational targets; standards set real ones.',
        ],
        homework: {
          id: 'S1.M6.L1.hw',
          title: 'Write up project B’s results',
          brief: 'Project B measured: no load 254.5 V; rated 229.9 V, 499.6 W; at 10.5 V 201.2 V; at 14.4 V 275.9 V; P_in = 531.4 W; THD 47.3 %.',
          tasks: [
            { id: 'h1', type: 'numeric', prompt: 'Efficiency (%)?', answer: 94.02, tol: 0.01, unit: '%', explain: '499.6/531.4 = 94.0 %.' },
            { id: 'h2', type: 'numeric', prompt: 'Deviation at 10.5 V (%)?', answer: -12.5, tol: 0.02, unit: '%', explain: '(201.2 − 230)/230 = −12.5 %.' },
            { id: 'h3', type: 'numeric', prompt: 'Deviation at 14.4 V (%)?', answer: 19.96, tol: 0.02, unit: '%', explain: '(275.9 − 230)/230 = +20.0 %.' },
          ],
          written: [{ prompt: 'Write a two-sentence conclusion for project B.', model: 'The square-wave inverter delivers its rated 500 W at 230 V with 94 % (simulated) efficiency, but as an unregulated design its output varies from −12.5 % to +20 % over the battery range and its THD is 47 %. It is suitable for resistive loads that tolerate this variation, not for motors or sensitive electronics.' }],
        },
      },
    },
    {
      id: 'S1.M6.L2',
      title: 'Troubleshooting a constructed inverter',
      minutes: 45,
      content: {
        objectives: [
          'Apply the troubleshooting cycle: symptom → hypotheses → test → conclusion.',
          'Use the test suite’s readings as diagnostic evidence.',
          'Diagnose the characteristic symptoms of open switches, swapped gate signals, wrong phase settings, lost feedback, lost windings, missing bus capacitance, MPPT mis-setting and transfer faults.',
          'Explain the safety rules that apply during diagnosis of real equipment.',
        ],
        introduction: `When an inverter does not work, guessing and replacing parts wastes time and money, and can be dangerous. Troubleshooting is a method: observe the symptom precisely, form hypotheses that would explain it, choose a measurement that distinguishes between them, and conclude only from evidence. Each build project has a troubleshooting task that exercises this method on a real fault in your own circuit.`,
        lecture: `### The troubleshooting cycle

1. **Observe the symptom precisely.** Not "it doesn't work", but "the output is 0 V, the battery current is near zero, and the frequency reads 100 Hz".
2. **List the hypotheses** consistent with the symptom. Use the circuit: which faults would produce exactly this?
3. **Choose a test** whose result differs between the hypotheses. The best tests split the list in half.
4. **Conclude** from the result, and repeat if needed.
5. **Repair and verify**: re-run the tests to prove the fault is gone and nothing else broke.

### Reading symptoms from the test suite

| Symptom | Likely cause | Project |
|---|---|---|
| Output with a large DC offset, crest factor ≈ √2 on a square wave | One switch open: only one half-cycle is driven | A |
| Output ≈ 0, battery current ≈ 0, frequency doubled | Legs switching in phase: equal voltage at both midpoints | B |
| "Modified sine" with crest factor 1.0 and RMS ≈ peak | Leg-B phase at 180°: square wave | C |
| Clean sine but output too high, no response to the battery | Feedback lost: the regulator at maximum m | D |
| Unipolar output, large DC offset | One half-winding disconnected (push-pull) | E |
| Output collapses under load | HV bus capacitor open: the bus cannot support the bridge | F |
| PV power far below its maximum | MPPT duty far from D_mp | G |
| Load dark in backup although the inverter runs | Transfer relay coil not driven | H |

### Safety during diagnosis of real equipment

- Diagnose **de-energised** wherever possible: resistance, diode and continuity tests on an isolated, discharged unit.
- **Live measurements** are taken only by qualified people, with the right meter category, insulated probes, and the enclosure arrangement the procedure permits. Never with one hand inside a mains-voltage enclosure.
- Many inverter faults leave capacitors charged. Discharge and prove dead before handling.
- A failed switch often has a *cause* (overheating, a shorted load, a failed driver). Find it before replacing parts, or the new part fails too.

### Common fault patterns in real inverters

- **Shorted MOSFETs** after shoot-through or overheating.
- **Open fuses**, which are the *result* of another fault.
- **Dried-out electrolytic capacitors**, with high ESR.
- **Failed gate drivers.**
- **Corroded battery terminals**, which cause a voltage drop and heat.
- **Failed fans**, which cause thermal shut-down.
- **Cracked solder joints** on heavy parts.

The repair workshop in Phase 9 covers seventeen such scenarios.`,
        technical: `**Why the test suite is a good diagnostic instrument.** Each test isolates a variable:

- the no-load test removes load effects;
- the input-variation tests reveal regulation;
- the waveform test reveals harmonics and DC offset, the signature of asymmetry.

Comparing a faulty unit's readings with a known-good reference, as the troubleshooting tasks do, is the core of diagnostic practice.

**DC offset is a powerful clue.** A healthy inverter output has zero mean. Any asymmetry (an open switch, a lost half-winding, unequal on-times) appears as a DC component, which a transformer cannot pass for long. It saturates instead.

**Doubled frequency** in a "zero output" reading comes from the small residual ripple at twice the switching rate. It confirms that the bridge is switching but cancelling itself.`,
        diagrams: [{ id: 'fault-method', caption: 'The troubleshooting cycle, and how one measurement splits the hypotheses.' }],
        formulas: [{ name: 'DC offset', expr: 'V_dc,offset = mean(v_out) over whole cycles', where: [] }],
        examples: [
          {
            title: 'Splitting hypotheses',
            problem: 'A square-wave inverter gives 0 V output. Hypotheses: (1) fuse blown, (2) legs in phase, (3) transformer open. Which single measurement best distinguishes them?',
            steps: ['Battery current: (1) zero, no supply; (2) near zero, the bridge cancels itself; (3) near zero, no load', 'Bridge midpoint voltages: (1) both 0; (2) both switching, identical; (3) switching in antiphase', 'The midpoint voltages distinguish all three'],
            answer: 'Measure the two bridge midpoints with respect to the negative rail. Their relationship identifies the fault.',
          },
          {
            title: 'Project A’s open switch',
            problem: 'Project A’s faulty build shows THD ≈ 47 %, crest factor 1.42 and a DC offset of −5.9 V on a 12 V output. Explain.',
            steps: ['Q4 open: the positive state (Q1 + Q4) cannot form, so only the negative half-cycle drives the load', 'The output is a unipolar square wave: mean ≈ −V/2, about −5.9 V', 'Crest factor = V_pk/V_rms = 1/√0.5 = 1.41'],
            answer: 'A single open switch in the positive diagonal.',
          },
        ],
        applications: `Field technicians use exactly this cycle with a multimeter, a clamp meter and an oscilloscope (course F5). Manufacturers' service manuals provide symptom-to-cause tables like the one above for their products.`,
        mistakes: [
          { mistake: 'Replacing the blown fuse and switching on again.', correction: 'A fuse blows because of another fault. Find it first, de-energised.' },
          { mistake: 'Replacing a failed MOSFET without checking its driver and load.', correction: 'The cause usually destroys the replacement too.' },
          { mistake: 'Taking live measurements without the right training and equipment.', correction: 'Live work on mains-voltage equipment is for qualified people with rated instruments.' },
        ],
        demo: {
          title: 'Solve a troubleshooting task',
          text: 'Open any built project’s troubleshooting tab. Study the faulty build’s readings against the reference, choose the diagnosis, and read the explanation.',
          link: to.build('Project C troubleshooting', 'bld-c'),
        },
        activities: [to.build('Project A troubleshooting', 'bld-a'), to.build('Project E troubleshooting', 'bld-e'), to.build('Project H troubleshooting', 'bld-h'), to.proc('Test a MOSFET', 'mosfet', 'mosfet-diode')],
        check: [
          { id: 'k1', type: 'mcq', prompt: 'The correct first step in troubleshooting is…', options: ['describe the symptom precisely', 'replace the most likely part', 'switch on and listen', 'replace the fuse'], answer: 0, explain: 'A precise symptom narrows the hypotheses.' },
          { id: 'k2', type: 'mcq', prompt: 'A transformer-output inverter shows a growing DC offset. Which fault fits?', options: ['Asymmetric drive (open switch or lost half-winding)', 'A missing filter capacitor', 'Feedback lost', 'A tripped breaker'], answer: 0, explain: 'Asymmetry produces a DC component.' },
          { id: 'k3', type: 'mcq', prompt: 'A fuse has blown. Before replacing it you should…', options: ['find and fix the cause, de-energised', 'fit a larger fuse', 'bypass it to test', 'replace it and retry'], answer: 0, explain: 'The fuse protected against another fault.' },
          { id: 'k4', type: 'mcq', prompt: 'PV power is far below its maximum but the array is healthy. Check…', options: ['the MPPT duty or operating point', 'the AC breaker', 'the dead time', 'the output filter'], answer: 0, explain: 'The operating point sets the PV power.' },
        ],
        summary: [
          'Troubleshoot by method: symptom → hypotheses → distinguishing test → conclusion → repair → verify.',
          'The test suite’s readings (offset, crest factor, THD, currents, regulation) are diagnostic evidence.',
          'Each fault type has a signature; compare against a known-good reference.',
          'Diagnose de-energised where possible; live work only by qualified people.',
          'Find the cause of a failure before replacing the failed part.',
        ],
        homework: {
          id: 'S1.M6.L2.hw',
          title: 'Diagnose from readings',
          brief: 'A pure-sine inverter (230 V, regulated) reads: no load 286 V, rated 284 V, at low battery 252 V, at high battery 330 V, THD 2.1 %.',
          tasks: [
            { id: 'h1', type: 'numeric', prompt: 'Deviation at rated load (%)?', answer: 23.5, tol: 0.02, unit: '%', explain: '(284 − 230)/230 = +23.5 %.' },
            { id: 'h2', type: 'numeric', prompt: 'Line regulation span ((330 − 252)/230, %)?', answer: 33.9, tol: 0.02, unit: '%', explain: '78/230 = 33.9 %: the output follows the battery.' },
          ],
          written: [{ prompt: 'Give your diagnosis and the measurement that would confirm it.', model: 'The waveform is clean (filter and SPWM working) but the output is high and follows the battery: the regulation loop is open, most likely a disconnected or failed voltage sensor, with m at its maximum. Confirm by measuring the sensor output (or the controller’s feedback input), which will read zero or implausibly low.' }],
        },
      },
    },
  ],
  quiz: {
    pass: 0.7,
    questions: [
      { id: 'q1', type: 'mcq', prompt: 'Which test checks that a protective device operates?', options: ['Short circuit', 'No-load', 'Efficiency', 'Waveform'], answer: 0, explain: 'The output is shorted and a device must operate.' },
      { id: 'q2', type: 'mcq', prompt: 'A clean but too-high output that ignores battery changes indicates…', options: ['lost feedback', 'an open switch', 'a missing filter', 'a blown fuse'], answer: 0, explain: 'The regulator is at maximum m.' },
      { id: 'q3', type: 'mcq', prompt: 'A square-wave inverter output ≈ 0 with both midpoints switching identically indicates…', options: ['legs switching in phase', 'transformer open', 'fuse blown', 'battery flat'], answer: 0, explain: 'Equal midpoint voltages cancel across the primary.' },
      { id: 'q4', type: 'numeric', prompt: 'Simulated efficiency: P_out = 980 W, P_in = 1060 W (%)?', answer: 92.45, tol: 0.01, unit: '%', explain: '980/1060 = 92.5 %.' },
      { id: 'q5', type: 'mcq', prompt: 'Which value is ground truth?', options: ['Measured on real hardware', 'Simulated', 'Calculated', 'Typical'], answer: 0, explain: 'Only real measurements are ground truth.' },
      { id: 'q6', type: 'multi', prompt: 'Which belong in an engineering test report? (select all)', options: ['Test conditions', 'Readings with units', 'Pass criteria', 'Limitations of the method'], answers: [0, 1, 2, 3], explain: 'All four are required.' },
    ],
  },
  assignment: {
    id: 'S1.M6.asg',
    title: 'Module assignment: fault-finding report',
    brief: 'Choose one built project, run its troubleshooting task and write a short fault-finding report.',
    tasks: [
      { id: 'a1', type: 'mcq', prompt: 'The first section of a fault-finding report is…', options: ['the precise symptom with readings', 'the parts replaced', 'the cost', 'the conclusion'], answer: 0, explain: 'Reports start from the observed evidence.' },
      { id: 'a2', type: 'mcq', prompt: 'After a repair you must…', options: ['re-run the tests to verify the fault is gone and nothing else changed', 'close the case', 'only check the fuse', 'nothing'], answer: 0, explain: 'Verification completes the cycle.' },
    ],
    written: [{ prompt: 'Write the report: symptom (with readings), hypotheses considered, distinguishing evidence, diagnosis, repair, verification.', model: 'Example (project E): Symptom: output unipolar with −75 V DC offset, THD 47 %, crest factor 1.4. Hypotheses: Q1 or Q2 open; one half-winding disconnected; gate signal missing. Evidence: the drain of Q2 never falls to 0 V and the T1.p2 terminal has no connection on the graph. Diagnosis: the lower half-winding is disconnected from Q2. Repair: reconnect T1.p2 to Q2’s drain. Verification: the full suite passes with zero offset.' }],
  },
  practicals: [
    { id: 'S1.M6.P1', title: 'Troubleshoot project C', description: 'Diagnose the modified-sine phase fault.', link: to.build('Project C', 'bld-c'), evidence: { kind: 'troubleshoot', project: 'bld-c' } },
    { id: 'S1.M6.P2', title: 'Troubleshoot project E', description: 'Diagnose the push-pull winding fault.', link: to.build('Project E', 'bld-e'), evidence: { kind: 'troubleshoot', project: 'bld-e' } },
    { id: 'S1.M6.P3', title: 'Troubleshoot project H', description: 'Diagnose the hybrid transfer fault.', link: to.build('Project H', 'bld-h'), evidence: { kind: 'troubleshoot', project: 'bld-h' } },
  ],
}
