import type { AcademyModule } from '../types'
import { to } from '../s1/links'

/** S2.M5 Installation, commissioning and troubleshooting. */
export const S2_M5: AcademyModule = {
  id: 'S2.M5',
  title: 'Installation, commissioning and troubleshooting',
  summary: 'Turning a design into a safe installation: DC and AC protection, isolation and labelling; the commissioning sequence with predicted and measured values; and a systematic method for finding faults in solar and battery systems.',
  lessons: [
    {
      id: 'S2.M5.L1',
      title: 'Installation design and commissioning',
      minutes: 45,
      content: {
        objectives: [
          'List the protection, isolation, earthing and labelling an installation design must specify.',
          'Describe the commissioning sequence for a PV and battery system.',
          'Predict string V_oc and I_sc for the measurement conditions and judge measurements against them.',
          'Produce a commissioning record and explain why it matters.',
        ],
        introduction: `A design becomes an installation through careful specification and testing. [[commissioning|Commissioning]] is the structured process that proves the installation is safe and performs as designed before it is handed over — and it leaves a record that every later maintenance visit and fault-finding job depends on. In this lesson you will practise it in the laboratory with predicted and simulated measured values. Real installation and commissioning are carried out by qualified persons under the applicable standards (course S3 develops them).`,
        lecture: `### What the installation design specifies

**DC side (PV):**

- string configuration and cable type (solar cable, UV-resistant, double insulated) and cross-section;
- polarised connectors of one compatible type;
- string fuses where required, both poles where the standard requires;
- surge protection;
- a lockable **DC isolator** rated for the cold string V_oc and 1.25 × array I_sc.

**DC side (battery):**

- battery fuse at the positive terminal with adequate breaking capacity;
- fuses on parallel strings;
- battery isolator, cable sizes, terminal covers;
- ventilation where batteries can release gas.

**AC side:**

- overcurrent protection;
- RCDs where required;
- the earthing arrangement and bonding of frames (F1.M4.L2);
- transfer switching for generators and back-up.

**Labelling:** warnings that PV conductors stay live in daylight, isolation points, the DC voltage, the battery's stored energy and emergency shutdown instructions.

### The commissioning sequence

1. **Visual inspection** against the design: components, ratings, cable routes, connectors, fixings, labels.
2. **Before connection — DC tests on each string (isolators open):**
   - polarity;
   - open-circuit voltage V_oc;
   - short-circuit or operating current (with suitable instruments);
   - [[insulation-resistance|insulation resistance]] to earth.
3. **Battery:** bank voltage and polarity before connection; correct configuration.
4. **Settings:** charge set-points from the battery datasheet; generator thresholds; grid settings from the network operator.
5. **Energise in the manufacturer's order**; functional tests: inverter output voltage and frequency, load test, transfer to generator, generator auto-start, anti-islanding (for grid systems, where the procedure requires).
6. **Record** everything: values, instruments, conditions, settings, as-built drawing.

### Predicting what you should measure

Commissioning compares measurements with **expected values for the conditions** at the time of the test:

- **V_oc,string = n × [V_oc,STC(1 + β(T_cell − 25)) + a·ln(G/1000)]**
- **I_sc = I_sc,STC × G/1000 × (1 + α(T_cell − 25))**

Irradiance is measured with a reference cell in the array's plane and the module temperature with a probe on the back. Typical acceptance:

- V_oc within a few per cent of expected (this laboratory uses ±5 %), and strings within a small spread of each other;
- I_sc within about ±10 % (irradiance measurement is the main uncertainty).

The **insulation-resistance limit** depends on the system voltage and is given by the applicable standard (for PV, typically IEC 62446-1 or its national equivalent). Look it up: do not guess it.`,
        technical: `**What deviations mean.**

- One module's voltage missing from a string: a short-circuited or reversed module, or a bypass diode failed short.
- Negative V_oc: reversed string polarity. Never connect it.
- Low I_sc on all strings: irradiance measurement, soiling or shading.
- Low insulation resistance: damaged insulation, a pinched cable, water in a connector or junction box.

**Instruments.** Commissioning uses instruments rated for the DC voltage and measurement category: PV testers that measure V_oc and I_sc safely, insulation testers at the specified test voltage, clamp meters, irradiance meters. Measuring I_sc by shorting a string with improvised links is dangerous: breaking a DC short draws an arc.

**The laboratory.** The Commissioning tab gives the conditions and simulated "as-built" measurements; you enter your predictions and the standard's limit. Practice modes inject faults so you can recognise them; only a correctly predicted, healthy installation is recorded.`,
        diagrams: [{ id: 'string-config', caption: 'The DC side to be tested: strings, fuses, combiner and isolator.' }],
        formulas: [
          { name: 'Expected string V_oc', expr: 'V_oc,str = n × [V_oc,STC(1 + β(T − 25)) + a·ln(G/1000)]', where: [['a', 'diode parameter of the module (given)', 'V']] },
          { name: 'Expected I_sc', expr: 'I_sc = I_sc,STC × G/1000 × (1 + α(T − 25))', where: [] },
          { name: 'Acceptance', expr: '|measured − expected| ≤ tolerance × expected', where: [] },
        ],
        examples: [
          {
            title: 'Expected V_oc and I_sc',
            problem: 'Strings of 2 illustrative 550 W modules (V_oc 49.6 V, I_sc 14.0 A, β −0.27 %/°C, α +0.048 %/°C, a = 2.6 V at 41 °C). Conditions: 850 W/m², module 41 °C.',
            steps: ['V_oc per module = 49.6 × (1 − 0.0027 × 16) + 2.6 × ln 0.85 = 49.6 × 0.9568 − 0.42 = 47.46 − 0.42 = 47.04 V', 'String V_oc = 2 × 47.04 = 94.1 V', 'I_sc = 14.0 × 0.85 × (1 + 0.00048 × 16) = 11.9 × 1.0077 = 11.99 A'],
            answer: 'Expect about 94 V (±5 %: 89–99 V) and 12.0 A (±10 %).',
          },
          {
            title: 'Judging the measurements',
            problem: 'For those strings you measure: string 1 94.6 V, 12.1 A; string 2 −94.0 V, 11.8 A. Insulation resistance 40 MΩ; the standard’s limit for this voltage is 1 MΩ.',
            steps: ['String 1 within tolerance; insulation passes', 'String 2: magnitude correct but negative: reversed polarity'],
            answer: 'Do not connect string 2: correct its polarity, then re-test. Everything else passes.',
          },
        ],
        applications: `Every new PV and battery installation is commissioned, and the record is kept for the owner, the installer and maintenance (course S5). Course S3 develops installation methods and the full test schedule.`,
        mistakes: [
          { mistake: 'Measuring V_oc without recording irradiance and temperature.', correction: 'Expected values depend on both; record them with every measurement.' },
          { mistake: 'Shorting a string with a wire to “measure I_sc”.', correction: 'Use a PV tester designed for it; breaking a DC short draws an arc.' },
          { mistake: 'Inventing an insulation-resistance limit.', correction: 'Take it from the applicable standard for the system voltage.' },
        ],
        demo: {
          title: 'Commissioning practice',
          text: 'On the Commissioning tab, predict V_oc and I_sc for the conditions, enter the standard’s insulation limit, and evaluate the as-built measurements; try the practice faults.',
          link: to.solar('Solar laboratory: commissioning', 'commission'),
          embed: 'pv-iv',
        },
        activities: [to.solar('Commissioning tab', 'commission'), to.proc('PV open-circuit voltage test', 'solar-input', 'pv-voc'), to.proc('Protective earth continuity', 'protective-earth', 'pe-continuity')],
        check: [
          { id: 'k1', type: 'numeric', prompt: 'Expected I_sc: 13.8 A module at 750 W/m², 25 °C (A)?', answer: 10.35, tol: 0.01, unit: 'A', explain: '13.8 × 0.75.' },
          { id: 'k2', type: 'mcq', prompt: 'A string reads −120 V at the combiner. You…', options: ['do not connect it; correct the polarity and re-test', 'connect it if the magnitude is right', 'insert the fuse to test it', 'ignore the sign'], answer: 0, explain: 'Reversed polarity.' },
          { id: 'k3', type: 'mcq', prompt: 'One string reads about one module’s voltage lower than the others. Likely cause?', options: ['A short-circuited or bypassed module in that string', 'Low irradiance', 'A full battery', 'An RCD trip'], answer: 0, explain: 'One module’s voltage is missing.' },
          { id: 'k4', type: 'mcq', prompt: 'The insulation-resistance pass limit comes from…', options: ['the applicable standard for the system voltage', 'the module’s efficiency', 'the inverter’s colour', 'the installer’s preference'], answer: 0, explain: 'Standards set it.' },
        ],
        summary: [
          'The design specifies DC and AC protection, isolation, earthing and labels.',
          'Commissioning: inspect, test strings, check the battery, set, energise, test functions, record.',
          'Predict V_oc and I_sc for the measured irradiance and temperature.',
          'Deviations point to specific faults: reversed polarity, missing module, insulation damage.',
          'The record supports maintenance and fault-finding for the system’s life.',
        ],
        homework: {
          id: 'S2.M5.L1.hw',
          title: 'Commissioning predictions',
          brief: 'Strings of 3 illustrative 400 W modules (V_oc 37.1 V, I_sc 13.8 A, β −0.27 %/°C, α +0.048 %/°C, a = 2.25 V at 37 °C). Conditions: 720 W/m², module 37 °C.',
          tasks: [
            { id: 'h1', type: 'numeric', prompt: 'Module V_oc (V)?', answer: 35.16, tol: 0.01, unit: 'V', explain: '37.1 × (1 − 0.0027 × 12) + 2.25 × ln 0.72 = 35.90 − 0.74 = 35.16 V.' },
            { id: 'h2', type: 'numeric', prompt: 'String V_oc (V)?', answer: 105.5, tol: 0.01, unit: 'V', explain: '3 × 35.16.' },
            { id: 'h3', type: 'numeric', prompt: 'I_sc (A)?', answer: 9.993, tol: 0.01, unit: 'A', explain: '13.8 × 0.72 × (1 + 0.00048 × 12) = 9.936 × 1.0058 = 9.99 A.' },
          ],
          written: [{ prompt: 'List, in order, the commissioning steps you would carry out on this system before handing it over.', model: 'Visual inspection against the design; with isolators open: polarity, V_oc and I_sc of each string with irradiance and temperature recorded, insulation resistance against the standard’s limit; battery voltage and polarity; controller and inverter settings from datasheets; energise in the manufacturer’s order; functional tests (output, load, transfer, generator start, anti-islanding where applicable); complete and sign the record.' }],
        },
      },
    },
    {
      id: 'S2.M5.L2',
      title: 'Solar system troubleshooting',
      minutes: 45,
      content: {
        objectives: [
          'Apply a systematic fault-finding method to solar and battery systems.',
          'Interpret measurements to distinguish shading, soiling, open strings, reversed polarity, overvoltage, voltage drop, battery ageing, controller mismatch and setting errors.',
          'Explain the safe way to take each measurement.',
          'Recommend and verify a repair.',
        ],
        introduction: `Solar systems usually fail gradually: a little less energy each month, an inverter that trips on cold mornings, lights that dim when a pump starts. Finding the cause needs a method, the right measurements and an understanding of what each one means. The laboratory's ten troubleshooting scenarios give you readings produced by the solar engine; this lesson teaches you to read them.`,
        lecture: `### The method

1. **Gather symptoms and history:** what changed, when, under what conditions? Check the monitoring data and the commissioning record.
2. **Make safe:** isolate as required (F1.M3); PV conductors stay live in daylight.
3. **Measure, comparing with expected values** for the conditions (lesson L1).
4. **Form a hypothesis** that explains *all* the readings, not just one.
5. **Confirm** with a targeted test.
6. **Repair**, then **verify** with the same measurements, and **record**.

### Reading the signs

| Symptom and readings | Likely cause |
|---|---|
| One string 0 A, others normal; full voltage across a fuse holder | Open string: blown fuse or open connector (find why it blew) |
| Stepped I–V curve with two peaks; low power | Partial shading; bypass diodes conducting |
| All currents low in proportion, V_oc normal | Soiling (or irradiance lower than thought) |
| Controller "PV overvoltage" on cold mornings | Strings too long for the coldest V_oc |
| Negative voltage at a combiner input | Reversed string polarity |
| Inverter low-voltage cut-out under load, battery terminals fine | Voltage drop in cable or connections |
| Large voltage dip on load steps, normal rested voltage | High battery internal resistance (ageing, a failing block) |
| Little charging with large modules on PWM | Controller–module mismatch |
| Loads shed though a generator is available | Generator start threshold below LVD |
| No power during a grid outage, grid-tied | Normal anti-islanding: not a fault |

### Measurements and their safety

- **Voltages** with a meter of the right category and DC rating; isolators open where testing string V_oc.
- **Currents** with a DC clamp meter, not by breaking live DC circuits.
- **Voltage drop under load:** measure simultaneously at both ends of a cable.
- **Internal resistance:** r = ΔV/ΔI from a known load step.
- **Insulation resistance:** with an insulation tester at the standard's test voltage, on isolated circuits only.

### Verify and record

After a repair, repeat the measurements that showed the fault and compare with expected values. Update the system record. A fuse that blew, an overvoltage or a hot joint each had a cause: find it, or the fault will return.`,
        technical: `**Monitoring data.** Modern controllers and inverters log PV voltage and current, battery voltage, SOC and events. Comparing daily yield with expected yield for the weather, and strings with each other, finds faults early: a string producing 50 % of its neighbour is never "weather".

**Thermal imaging.** An infrared camera shows hot cells (shading, cell cracks, failed bypass diodes) and hot joints (high resistance) at a distance, without contact. It complements electrical measurements.

**When to stop.** Damaged modules, melted connectors, battery swelling or a smell of electrolyte call for making the area safe and referring the work to a qualified person with the right equipment (F1.M4.L3).`,
        diagrams: [{ id: 'fault-method', caption: 'A systematic method: symptoms, make safe, measure, hypothesise, confirm, repair, verify, record.' }],
        formulas: [
          { name: 'Internal resistance', expr: 'r = ΔV / ΔI', where: [] },
          { name: 'Cable and joint drop', expr: 'V_drop = V_battery − V_inverter = I × R_path', where: [] },
          { name: 'Uniform current loss', expr: 'loss = 1 − I_measured / I_expected', where: [] },
        ],
        examples: [
          {
            title: 'Battery or cable?',
            problem: 'With the pump starting, the battery terminals read 24.1 V and the inverter terminals 20.3 V at 120 A. The rested battery voltage is 26.6 V. What do you conclude?',
            steps: ['Path drop: 24.1 − 20.3 = 3.8 V at 120 A → R_path = 32 mΩ: far too high', 'Battery sag: 26.6 − 24.1 = 2.5 V at 120 A → r ≈ 21 mΩ: high too, but the cable path is the bigger problem'],
            answer: 'Fix the cable and connections first (undersized cable or a poor joint), then re-test the battery’s internal resistance.',
          },
          {
            title: 'Soiling',
            problem: 'Expected I_sc for the conditions is 12.4 A; all strings read 9.0–9.2 A; V_oc is within 2 % of expected; nothing is shaded.',
            steps: ['Current loss = 1 − 9.1/12.4 = 27 %, uniform across strings', 'V_oc normal → cells working; less light reaching them'],
            answer: 'Soiling: clean the modules and re-measure; add cleaning to the maintenance plan.',
          },
        ],
        applications: `Fault-finding on solar and hybrid systems in the field, remote diagnosis from monitoring data, and the troubleshooting tab of the laboratory. Course S4 develops diagnostics and professional repair across the whole programme.`,
        mistakes: [
          { mistake: 'Replacing a blown string fuse without finding why it blew.', correction: 'Test the string’s insulation and connectors first.' },
          { mistake: 'Blaming the weather for one string’s low output.', correction: 'Compare strings: weather affects all of them alike.' },
          { mistake: 'Measuring DC current by disconnecting a live conductor.', correction: 'Use a DC clamp meter; breaking DC under load draws an arc.' },
        ],
        demo: {
          title: 'Troubleshooting scenarios',
          text: 'Work through the laboratory’s ten scenarios: read the symptoms and engine-generated readings, choose a diagnosis, and study the explanation and fix.',
          link: to.solar('Solar laboratory: troubleshooting', 'faults'),
          embed: 'mppt-track',
        },
        activities: [to.solar('Troubleshooting tab', 'faults'), to.proc('Battery terminal voltage-drop test', 'battery-terminals', 'terminal-drop')],
        check: [
          { id: 'k1', type: 'numeric', prompt: 'r from a 60 A step dropping 1.5 V (mΩ)?', answer: 25, tol: 0.01, unit: 'mΩ', explain: '1.5/60.' },
          { id: 'k2', type: 'numeric', prompt: 'Uniform current loss: 8.2 A measured, 11.0 A expected (%)?', answer: 25.45, tol: 0.01, unit: '%', explain: '1 − 0.745.' },
          { id: 'k3', type: 'mcq', prompt: 'A controller reports PV overvoltage only on cold mornings. Cause?', options: ['Strings too long for the cold V_oc', 'Soiling', 'Battery ageing', 'Shading'], answer: 0, explain: 'Voltage rises in the cold.' },
          { id: 'k4', type: 'mcq', prompt: 'A hypothesis is accepted when it…', options: ['explains all the readings and is confirmed by a test', 'explains the first reading', 'is the most common fault', 'is cheapest to fix'], answer: 0, explain: 'Systematic method.' },
        ],
        summary: [
          'Method: symptoms → make safe → measure → hypothesise → confirm → repair → verify → record.',
          'Compare measurements with expected values and with each other.',
          'Patterns identify shading, soiling, open strings, polarity, overvoltage, drop, ageing, mismatch and settings.',
          'Measure DC current with clamps; never break live DC.',
          'Find the cause of every blown fuse or overvoltage.',
        ],
        homework: {
          id: 'S2.M5.L2.hw',
          title: 'Diagnose from readings',
          brief: 'Three parallel strings at the combiner: 11.9 A, 12.1 A, 0 A; array voltage 96 V; the third fuse holder reads 96 V across it.',
          tasks: [
            { id: 'h1', type: 'mcq', prompt: 'Diagnosis?', options: ['The third string’s fuse is open', 'Shading on all strings', 'Battery failure', 'PV overvoltage'], answer: 0, explain: 'Full voltage across an open fuse; zero current.' },
            { id: 'h2', type: 'mcq', prompt: 'Before replacing the fuse you should…', options: ['isolate, prove dead and insulation-test that string to find why it blew', 'insert a larger fuse', 'bridge the fuse holder', 'ignore it'], answer: 0, explain: 'Find the cause.' },
          ],
          written: [{ prompt: 'Describe how you would verify the repair.', model: 'With the string isolated, repeat polarity, V_oc and insulation resistance against expected values; insert the correctly rated fuse; close the isolator; measure the string current with a clamp meter and compare with the other strings under the same conditions; record the results.' }],
        },
      },
    },
  ],
  quiz: {
    pass: 0.7,
    questions: [
      { id: 'q1', type: 'mcq', prompt: 'The PV DC isolator must be rated for at least…', options: ['the cold string V_oc and 1.25 × array I_sc', 'the battery voltage', 'the AC output voltage', 'the module efficiency'], answer: 0, explain: 'It must break the highest DC voltage on load.' },
      { id: 'q2', type: 'numeric', prompt: 'Expected string V_oc: 4 modules × 36.0 V at the conditions (V)?', answer: 144, tol: 0.01, unit: 'V', explain: '4 × 36.' },
      { id: 'q3', type: 'mcq', prompt: 'A measured string V_oc of 104 V against 108 V expected (±5 %) is…', options: ['within tolerance', 'a fail', 'a reversed string', 'a short circuit'], answer: 0, explain: '3.7 % low.' },
      { id: 'q4', type: 'mcq', prompt: 'Which must be recorded with every V_oc and I_sc measurement?', options: ['Irradiance and module temperature', 'The weather forecast', 'The battery brand', 'The cable colour'], answer: 0, explain: 'Expected values depend on them.' },
      { id: 'q5', type: 'numeric', prompt: 'Path resistance: 2.4 V drop at 80 A (mΩ)?', answer: 30, tol: 0.01, unit: 'mΩ', explain: '2.4/80.' },
      { id: 'q6', type: 'mcq', prompt: 'Lights dim when the pump starts; rested voltage normal; r measured 5× its commissioning value. Cause?', options: ['Battery ageing (high internal resistance)', 'Soiling', 'Anti-islanding', 'String fuse'], answer: 0, explain: 'High r.' },
      { id: 'q7', type: 'mcq', prompt: 'A grid-tied home has no power during an outage. This is…', options: ['normal anti-islanding behaviour', 'an inverter failure', 'a blown string fuse', 'soiling'], answer: 0, explain: 'Not a fault.' },
      { id: 'q8', type: 'mcq', prompt: 'The safe way to measure a live PV string current is…', options: ['a DC clamp meter', 'opening a connector under load', 'shorting it with a wire', 'touching it'], answer: 0, explain: 'No circuit is broken.' },
    ],
  },
  assignment: {
    id: 'S2.M5.asg',
    title: 'Module assignment: commissioning and fault report',
    brief: 'Commission your S2.M3 design in the solar laboratory, then solve at least five troubleshooting scenarios.',
    tasks: [
      { id: 'a1', type: 'mcq', prompt: 'In the commissioning practice fault in which one string reads a negative voltage, the correct action is…', options: ['leave it isolated, correct its polarity and re-test', 'insert its fuse', 'connect it and watch', 'replace the controller'], answer: 0, explain: 'Reversed polarity must be corrected before connection.' },
      { id: 'a2', type: 'mcq', prompt: 'In the scenario where the inverter cuts out on pump start but the battery looks fine, the confirming measurement is…', options: ['simultaneous voltages at the battery and inverter terminals under load', 'string V_oc', 'module temperature', 'insulation resistance'], answer: 0, explain: 'It reveals the path drop.' },
    ],
    written: [{ prompt: 'Write a short commissioning record summary and a fault report for one scenario (symptom, readings, diagnosis, fix, verification).', model: 'Commissioning: conditions (G, T), expected and measured V_oc/I_sc per string within tolerance, insulation resistance above the standard’s limit, battery voltage, settings, functional tests passed. Fault report example: “cable-drop” — symptom inverter low-voltage trips on pump start; readings battery 25.4 V vs inverter 21.2 V at ~79 A; diagnosis excessive path resistance (6 mm² cable, poor joint); fix replace with the designed 16 mm² and re-terminate; verification drop now below 2 % under the same load.' }],
  },
  practicals: [
    { id: 'S2.M5.P1', title: 'Solar laboratory: commission a design', description: 'Predict the expected values, evaluate the as-built measurements and pass the commissioning record for a healthy installation.', link: to.solar('Commissioning', 'commission'), evidence: { kind: 'activity', id: 'solar:commission' } },
    { id: 'S2.M5.P2', title: 'Troubleshooting: partial shading', description: 'Diagnose the shading scenario from its I–V and power readings.', link: to.solar('Troubleshooting', 'faults'), evidence: { kind: 'activity', id: 'solar:fault:shading' } },
    { id: 'S2.M5.P3', title: 'Troubleshooting: cold-morning overvoltage', description: 'Diagnose the controller-overvoltage scenario.', link: to.solar('Troubleshooting', 'faults'), evidence: { kind: 'activity', id: 'solar:fault:voc-cold' } },
    { id: 'S2.M5.P4', title: 'Troubleshooting: inverter cut-out on load', description: 'Diagnose the voltage-drop scenario.', link: to.solar('Troubleshooting', 'faults'), evidence: { kind: 'activity', id: 'solar:fault:cable-drop' } },
    { id: 'S2.M5.P5', title: 'Troubleshooting: generator does not start', description: 'Diagnose the generator-threshold scenario.', link: to.solar('Troubleshooting', 'faults'), evidence: { kind: 'activity', id: 'solar:fault:gen-threshold' } },
    {
      id: 'S2.M5.P6',
      title: 'Commissioning sequence drill',
      description: 'Put the commissioning steps for a PV-battery system in order, rejecting unsafe or wrong steps.',
      task: {
        id: 's2-commission-sequence',
        kind: 'sequence',
        title: 'Commissioning a PV and battery system',
        brief: 'Choose the steps you would carry out, in order, to commission a new off-grid PV and battery system. Some offered steps are wrong or unsafe.',
        steps: [
          'Inspect the installation visually against the design and labels',
          'With the DC isolators open, check each string’s polarity',
          'Measure each string’s V_oc and I_sc, recording irradiance and module temperature',
          'Test the array insulation resistance against the standard’s limit',
          'Check the battery bank voltage and polarity before connection',
          'Set the controller and inverter from the battery datasheet',
          'Energise in the manufacturer’s order and carry out functional tests',
          'Complete and sign the commissioning record',
        ],
        distractors: [
          { text: 'Measure string I_sc by shorting the string with a wire and then pulling it off', why: 'Breaking a DC short draws an arc; use a PV tester designed for I_sc.' },
          { text: 'Connect all strings first to see whether the controller reports a fault', why: 'A reversed or overvoltage string can destroy equipment; test every string before connection.' },
          { text: 'Use generic charging voltages until the system has run for a week', why: 'Set-points must come from the battery datasheet from the start.' },
        ],
        explain: 'Inspect, test each string isolated (polarity, V_oc/I_sc with conditions, insulation), check the battery, configure from datasheets, energise in order with functional tests, and record.',
      },
      evidence: { kind: 'task', id: 's2-commission-sequence' },
    },
  ],
}
