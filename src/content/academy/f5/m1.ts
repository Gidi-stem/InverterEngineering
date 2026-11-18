import type { AcademyModule } from '../types'
import { to } from '../s1/links'

/** F5.M1 Measurement basics. */
export const F5_M1: AcademyModule = {
  id: 'F5.M1',
  title: 'Measurement basics',
  summary: 'Why a reading is only as good as its accuracy and resolution, how to choose a safe measurement category, and how to record a result so it means something later.',
  lessons: [
    {
      id: 'F5.M1.L1',
      title: 'Accuracy, resolution and uncertainty',
      minutes: 30,
      content: {
        objectives: [
          'Distinguish accuracy, resolution and precision in a measurement.',
          'Express a measurement result with an appropriate number of significant figures and an uncertainty.',
          'Explain why a "more decimal places" reading is not automatically a better one.',
          'State typical multimeter accuracy specifications and use them to bound a result.',
        ],
        introduction: `Every instrument in this laboratory — and every real one on a bench — gives a number that is close to the truth, not the truth itself. Before touching a single probe, you need the three ideas that decide how much to trust that number: [[accuracy]], [[resolution]] and [[precision]]. Get these right and you will read every later lesson's "0.04 Ω" or "452 µF" as an engineering fact with known limits, not as gospel.`,
        lecture: `### Three different ideas

- **[[resolution|Resolution]]** is the smallest change the instrument can display — the last digit on the screen. A meter reading "11.71 V" has 10 mV resolution on that range.
- **[[accuracy]]** is how close the reading is to the true value. A cheap meter might show four digits of resolution but only be accurate to ±2 % — three of those digits could be noise.
- **[[precision]]** is how repeatable the reading is. Measure the same thing five times and get 11.70, 11.71, 11.71, 11.70, 11.71 V: that is precise. If the true value is actually 11.60 V, it is precise but not accurate.

A cheap bathroom scale that always reads 2 kg light is precise (repeatable) but not accurate. A high-resolution display on an inaccurate instrument is the electrical-measurement version of the same trap.

### Where the specification comes from

Multimeter manufacturers state accuracy as a percentage of the reading plus a number of counts, e.g. **"± (0.5 % + 2 digits)"** on the DC volts range. For a reading of 11.71 V on a 4-digit (0.01 V resolution) range:

- 0.5 % of 11.71 V = 0.059 V
- 2 digits = 2 × 0.01 V = 0.02 V
- Total uncertainty ≈ ±0.08 V, so the true value lies roughly between 11.63 V and 11.79 V.

Every instrument in this lab (and every real one) carries a specification like this. ESR, LCR, insulation and battery testers all have their own accuracy classes, usually worse (a few percent) than a good bench DMM.

### How many figures to report

Report a result to a precision that matches its uncertainty — not to every digit the display shows. "11.71 ± 0.08 V" is honest. "11.714285 V" (what a calculator might show after a division) implies a precision the instrument never had.`,
        technical: `**Why "+ digits" matters more at low readings.** The percentage term in "0.5 % + 2 digits" shrinks with the reading, but the digit term does not. On a 200 mV range, 2 digits = 0.2 mV, which can dominate the uncertainty of a small reading even though it looks negligible in isolation. Always check the full specification, not just the headline "%" figure, especially near the bottom of a range.

**True value versus measured value.** A "true value" is a convenient fiction: in practice we only ever have a *reference* measurement made with a better-calibrated instrument, traceable (ultimately) to a national standards laboratory. Calibration is the process of comparing an instrument against such a reference and correcting or documenting its error.`,
        diagrams: [{ id: 'test-bench', caption: 'Resolution, accuracy and precision shown on the same reading: display digits, the true value, and the scatter of repeated readings.' }],
        formulas: [{ name: 'Accuracy specification', expr: 'uncertainty = (accuracy % × reading) + (digits × resolution)', where: [['accuracy %', "the instrument's stated percentage error", '%'], ['digits', 'stated digit count', 'count'], ['resolution', 'value of the last displayed digit', 'unit']] }],
        examples: [
          {
            title: 'Bounding a resistance reading',
            problem: 'A DMM specified "± (1.0 % + 3 digits)" on the 400 Ω range (resolution 0.1 Ω) reads 46.8 Ω. What is the uncertainty, and is a 47 kΩ ±5 % resistor (rated 44.65–49.35 Ω... scaled appropriately) consistent with this reading on the correct range?',
            steps: ['1.0 % of 46.8 Ω = 0.47 Ω', '3 digits = 3 × 0.1 Ω = 0.3 Ω', 'Total uncertainty ≈ ±0.77 Ω, so the reading is 46.8 ± 0.8 Ω'],
            answer: '46.8 ± 0.8 Ω (45.99–47.57 Ω). This overlaps the resistor\'s tolerance band, so the reading is consistent with a good component.',
            check: 'The uncertainty (0.8 Ω) is small compared with the 5 % tolerance band (±2.35 Ω) being checked, so this instrument is fit for the job.',
          },
          {
            title: 'Why more decimal places is not more accuracy',
            problem: 'A cheap meter rated "± (3 % + 5 digits)" and a bench meter rated "± (0.1 % + 2 digits)" both measure the same 12.00 V source. Both show 4 digits. Which result should you trust more, and by how much?',
            steps: ['Cheap meter: 3 % of 12 V = 0.36 V, plus 5 × 0.01 V = 0.05 V → ±0.41 V', 'Bench meter: 0.1 % of 12 V = 0.012 V, plus 2 × 0.01 V = 0.02 V → ±0.032 V'],
            answer: 'The bench meter is about 13 times tighter, even though both displayed the same number of digits.',
          },
        ],
        applications: `This is why a component's test procedure in the library (lesson F5.M4.L1) gives a *good/bad* reading with margin, not a single magic number: it has to stay valid across ordinary meter accuracy. It is also why, in troubleshooting, a reading "close to" the expected value is treated as healthy — a measurement that disagrees by far more than the combined uncertainty is the one worth acting on.`,
        mistakes: [
          { mistake: '"The display shows four decimal places, so it must be accurate to four decimal places."', correction: 'Resolution and accuracy are different specifications. Check the accuracy spec before trusting the last digits.' },
          { mistake: 'Quoting a result with more precision than the instrument supports.', correction: 'Round the result to match the calculated uncertainty.' },
          { mistake: 'Assuming all ranges of one meter share the same accuracy.', correction: 'Accuracy specifications are given per range or per function; check the datasheet for the range in use.' },
        ],
        demo: { title: 'Instrument scenarios in this lab', text: 'Every instrument in the Virtual Instruments Laboratory returns a reading together with an explanation. Open the DMM and compare the displayed value with the explanation of what it means.', link: to.instrument('Open the digital multimeter', 'dmm') },
        activities: [to.instrument('Digital multimeter', 'dmm'), to.lib('Resistor', 'resistor')],
        check: [
          { id: 'k1', type: 'mcq', prompt: 'A meter reads the same value five times in a row, but the value is wrong. This is...', options: ['precise but not accurate', 'accurate but not precise', 'high resolution', 'uncalibrated resolution'], answer: 0, explain: 'Repeatable but wrong is precise, not accurate.' },
          { id: 'k2', type: 'numeric', prompt: 'A meter rated "± (2 % + 1 digit)" on a range with 0.01 V resolution reads 5.00 V. Uncertainty (V)?', answer: 0.11, tol: 0.05, unit: 'V', explain: '2% of 5.00 = 0.10 V, plus 1 digit = 0.01 V → 0.11 V.' },
          { id: 'k3', type: 'mcq', prompt: 'Resolution is...', options: ['the smallest change the display can show', 'the percentage error of the instrument', 'how repeatable readings are', 'the calibration date'], answer: 0, explain: 'Resolution is a display property, distinct from accuracy.' },
          { id: 'k4', type: 'mcq', prompt: 'Why might the "+ digits" term matter more at the bottom of a range?', options: ['It is a fixed value, so it becomes a larger fraction of a small reading', 'It only applies above half-scale', 'It never matters', 'Digits only apply to AC'], answer: 0, explain: 'A fixed digit count is proportionally larger for small readings.' },
        ],
        summary: [
          'Resolution is display detail; accuracy is closeness to truth; precision is repeatability — they are independent.',
          'Manufacturers specify accuracy as "± (% of reading + digits)"; both terms matter, especially near the bottom of a range.',
          'Report a result to match its uncertainty, not to every digit the display shows.',
          'A reading within the combined uncertainty of an expected value is treated as healthy; a reading far outside it is the one to investigate.',
        ],
        homework: {
          id: 'F5.M1.L1.hw',
          title: 'Uncertainty practice',
          brief: 'Apply "± (% + digits)" to three readings.',
          tasks: [
            { id: 'h1', type: 'numeric', prompt: 'A meter "± (0.8 % + 2 digits)", 0.01 Ω resolution, reads 4.00 Ω. Uncertainty (Ω)?', answer: 0.052, tol: 0.05, unit: 'Ω', explain: '0.8% of 4.00 = 0.032, plus 2×0.01 = 0.02 → 0.052 Ω.' },
            { id: 'h2', type: 'numeric', prompt: 'Same meter reads 400 Ω on a range with 0.1 Ω resolution. Uncertainty (Ω)?', answer: 3.4, tol: 0.05, unit: 'Ω', explain: '0.8% of 400 = 3.2, plus 2×0.1 = 0.2 → 3.4 Ω.' },
            { id: 'h3', type: 'numeric', prompt: 'A clamp meter "± (2.5 % + 5 digits)", 0.01 A resolution, reads 6.52 A. Uncertainty (A)?', answer: 0.213, tol: 0.05, unit: 'A', explain: '2.5% of 6.52 = 0.163, plus 5×0.01 = 0.05 → 0.213 A.' },
          ],
          written: [{ prompt: 'A student says "my new meter has a 6-digit display so it is more accurate than my old 4-digit meter." Explain what is wrong with this reasoning and what the student should check instead.', model: 'Digit count is resolution, not accuracy. Two meters with different digit counts can have the same or even reversed accuracy classes. The student should compare the "± (% + digits)" accuracy specification for the relevant function and range on each meter\'s datasheet, not the number of displayed digits.' }],
        },
      },
    },
    {
      id: 'F5.M1.L2',
      title: 'Measurement categories and probe safety',
      minutes: 30,
      content: {
        objectives: [
          'Explain CAT I–IV measurement categories and why they matter.',
          'Select a correctly rated meter and probes for a given measurement location.',
          'Describe the fuse protection a safe multimeter carries on its current ranges.',
          'Identify unsafe probe or lead conditions before use.',
        ],
        introduction: `A multimeter is not just a sensor; it is a device you hold in your hands while it is connected to a possible fault current. The [[cat-rating|CAT rating]] system exists because a transient (a brief, very high voltage spike) can occur anywhere on a power system, and it is far larger closer to the source. Choosing the wrong instrument for the location can be as dangerous as a wiring fault.`,
        lecture: `### CAT I–IV

| Category | Typical location | Example |
|---|---|---|
| CAT I | Protected electronic circuits | Signal and low-energy circuits inside equipment |
| CAT II | Single-phase, plug-connected loads | Appliance sockets, extension leads |
| CAT III | Fixed installation, distribution level | Distribution boards, fixed wiring, inverter AC output terminals |
| CAT IV | The origin of the installation | Service entrance, utility meter, outdoor overhead lines |

A higher category number means the instrument (and its probes) is rated to withstand a larger transient without the insulation failing or an internal arc forming. **A CAT II meter used on a CAT III distribution board is unsafe**, even if the steady-state voltage reading would be identical to a CAT III meter — the risk is from a transient, not the everyday voltage.

### Why it is the whole chain, not just the meter

The meter, the leads, and the probe tips must all be rated for the category and voltage in use. A CAT III meter with worn, cracked or CAT II-only replacement leads is no longer a CAT III measurement system. Before use, check:

- Insulation is unbroken, with no exposed metal beyond the tip.
- The exposed metal tip length is short, especially for CAT III/IV work (shrouded probes).
- The fuse is intact and correctly rated (next section).

### Fuse protection on current ranges

A multimeter's current ranges connect almost directly across whatever you are measuring (through the shunt resistor) — this is *why* connecting a current-mode meter across a voltage source is dangerous (F5.M2.L1). A correctly designed meter protects its current ranges with a **high-energy fuse** rated to interrupt a high-current, high-voltage fault safely, often combined with a voltage-dependent resistor or ceramic fuse body to avoid an internal arc. Never bridge a blown fuse with foil or a replacement of the wrong rating "to keep working" — the fuse is there for your protection, not the meter's.

### Working out which category you need

Ask: *what is downstream of me, and how big a fault could occur here?* A measurement at an inverter's 48 V battery terminals is low energy electrically but can still deliver enormous short-circuit current (F1 lesson on battery short circuits) — category ratings are about transient withstand, not just "mains vs DC", and a bench supply measurement is typically CAT I/II while a distribution-board or inverter AC-output measurement is CAT III.`,
        technical: `**What actually fails.** A transient that exceeds a probe or meter's rating can cause the insulation to break down internally, creating an arc path. The danger is not only electric shock to the user but also an arc flash: an explosive release of energy that can cause severe burns even without direct body contact. CAT ratings are set from statistical studies of transient energy expected at each class of location.

**Digital vs analogue effect on category needs.** The category requirement is about the circuit being measured, not the display technology. A category rating is unrelated to whether the meter is analogue or digital, true-RMS or average-sensing (F5.M3.L2 covers true-RMS).`,
        diagrams: [{ id: 'risk-hierarchy', caption: 'CAT I–IV locations along a power system, from protected electronics to the service origin.' }],
        formulas: [{ name: 'Fuse margin (reused from F1)', expr: 'I_n ≥ 1.25 × I_b, I_n ≤ I_z', where: [['I_n', "the fuse's rated current", 'A'], ['I_b', 'the design current it must carry', 'A'], ['I_z', 'the cable\'s current-carrying capacity', 'A']], note: 'The same margin principle from F1 applies to a multimeter\'s own internal fuse, sized to protect the meter without nuisance-blowing on ordinary use.' }],
        examples: [
          {
            title: 'Choosing a category for an inverter job',
            problem: 'You need to measure the AC output terminals of an installed inverter feeding a distribution board, and separately the 3.3 V logic rail inside its control board. What category does each need at minimum?',
            steps: ['AC output terminals, connected to fixed wiring/distribution: CAT III', 'Internal 3.3 V logic rail, a protected low-energy electronic circuit: CAT I is sufficient, though a CAT III meter used throughout is also safe and simpler to manage'],
            answer: 'CAT III for the output terminals (minimum); CAT I is sufficient for the internal logic rail, though using one CAT III-rated meter for both jobs is the simpler and safer practice.',
          },
          {
            title: 'Why a correct CAT III meter with the wrong leads is unsafe',
            problem: 'A technician has a correctly CAT III-rated meter, but its original leads are damaged and have been replaced with unrated leads from a hobby electronics kit. Is the technician still protected to CAT III at a distribution board?',
            steps: ['CAT rating applies to the WHOLE measurement chain: meter, leads and probe tips together', 'Unrated hobby leads have no stated transient withstand rating', 'The weakest link in the chain sets the effective protection, not the meter alone'],
            answer: 'No — the measurement system is no longer CAT III rated, regardless of the meter\'s own rating, because the leads are the weak link.',
          },
        ],
        applications: `Every scenario used elsewhere in this course (F5.M2 onward) states where the measurement is taken, because that is exactly the information you need to choose a CAT-rated instrument in real life: the DC bus, the mains socket circuit, and the solar string all imply different categories.`,
        mistakes: [
          { mistake: '"A higher voltage range setting is the same as a higher CAT rating."', correction: 'CAT rating is about transient withstand at a given location, not the number on the range dial.' },
          { mistake: 'Using a lower-rated meter "because the reading will be the same".', correction: 'The steady reading may be identical; the risk is from a transient that a lower-rated meter cannot safely withstand.' },
          { mistake: 'Bridging a blown fuse to keep measuring.', correction: 'The fuse protects you from a fault current through the meter. Replace it with the correct type and rating, never bridge it.' },
        ],
        demo: { title: 'Consequences of a wrong connection', text: 'The multimeter in this lab shows exactly what happens when the probes are left in the wrong socket on a live source — the same principle behind fuse protection and category ratings.', link: to.instrument('Open the digital multimeter', 'dmm') },
        activities: [to.instrument('Digital multimeter', 'dmm'), to.lib('Fuse', 'fuse')],
        check: [
          { id: 'k1', type: 'mcq', prompt: 'A distribution board measurement needs at least...', options: ['CAT III', 'CAT I', 'Any category', 'CAT II only'], answer: 0, explain: 'Distribution level is CAT III.' },
          { id: 'k2', type: 'mcq', prompt: 'CAT ratings mainly protect against...', options: ['transient over-voltage withstand failure', 'everyday voltage reading error', 'display resolution loss', 'battery drain'], answer: 0, explain: 'The rating is about transient energy withstand.' },
          { id: 'k3', type: 'mcq', prompt: 'A CAT III meter with cracked CAT II-only replacement leads is...', options: ['no longer a CAT III measurement system', 'still fully CAT III', 'safe if used carefully', 'fine for DC only'], answer: 0, explain: 'The whole chain — meter, leads, probes — must meet the rating.' },
          { id: 'k4', type: 'mcq', prompt: 'What should you never do to a blown current-range fuse?', options: ['Bridge it to keep measuring', 'Replace it with the correct rating', 'Check the rating printed on it', 'Buy a spare of the correct type'], answer: 0, explain: 'Bridging removes your protection entirely.' },
        ],
        summary: [
          'CAT I–IV rates an instrument\'s ability to withstand a transient at a given point in a power system, from protected electronics (I) to the service origin (IV).',
          'The whole measurement chain — meter, leads and probe tips — must meet the category, not just the meter.',
          'Current ranges are protected by a high-energy fuse; never bridge it.',
          'Choose a category from where the fault energy could come from, not from the steady-state voltage you expect to read.',
        ],
        homework: {
          id: 'F5.M1.L2.hw',
          title: 'Category selection',
          brief: 'Match locations to categories.',
          tasks: [
            { id: 'h1', type: 'mcq', prompt: 'A utility service entrance is...', options: ['CAT IV', 'CAT I', 'CAT II', 'CAT III'], answer: 0, explain: 'The origin of the installation is CAT IV.' },
            { id: 'h2', type: 'mcq', prompt: 'A plug-in extension lead supplying a laptop charger is...', options: ['CAT II', 'CAT IV', 'CAT I', 'CAT III'], answer: 0, explain: 'A plug-connected load is CAT II.' },
          ],
          written: [{ prompt: 'Explain why a meter rated CAT III 600 V is not automatically safe for a CAT IV 300 V location, even though 300 V is lower than 600 V.', model: 'Category and voltage are two separate ratings. CAT IV locations can produce much larger transients than CAT III locations even at a lower nominal voltage, because they are closer to the energy source. A CAT III meter, however high its voltage number, is not rated to withstand a CAT IV transient.' }],
        },
      },
    },
    {
      id: 'F5.M1.L3',
      title: 'Recording results',
      minutes: 25,
      content: {
        objectives: [
          'Record a measurement result with instrument, setting, connection and reading together.',
          'Explain why a reading without its context is of little use later.',
          'Use a consistent format for logging test results across a troubleshooting session.',
        ],
        introduction: `A number on its own is nearly worthless a week later. "11.71 V" means nothing without knowing where it was measured, with what, on what setting, and under what conditions. This short lesson sets the habit used throughout the rest of the course and the component library: **instrument, setting, connection, reading, and the verdict it supports.**`,
        lecture: `### The five fields worth recording

1. **What** was measured (the test point or component).
2. **Instrument and setting** (DMM, DC V, autorange; or LCR meter, C mode, 1 kHz).
3. **Connection** (which terminals, in which direction).
4. **Reading**, with its units and, where it matters, its uncertainty.
5. **Conclusion** drawn from the reading (healthy / suspect / faulty, and why).

This is exactly the structure every test procedure in the Component Library (F4, and reused by the component tester in this lab) already follows: instruction, instrument, setting, connection, and a set of labelled readings with their meaning. You are learning the professional habit, not inventing a new one.

### Why "just the number" fails

Six months later, "0.04" means nothing on its own: 0.04 Ω? 0.04 V? Measured where? With what meter, on what range? Was the circuit powered or isolated? A terse log entry like *"Cap bank +/−, ESR meter, ESR mode: 0.04 Ω — healthy (ref. 0.04 Ω good / 1.6 Ω aged)"* answers all of that in one line and lets anyone, including you later, trust or challenge the conclusion.

### Conditions that change the answer

Some readings are meaningless without stating the conditions under which they were taken:

- Load current at the moment of the reading (a battery's loaded voltage depends on it).
- Temperature, where it affects the result (thermal measurements, battery internal resistance).
- Whether the circuit was live or isolated (resistance/continuity/diode tests require isolation).
- Test frequency, for LCR/impedance readings.

Leaving any of these out turns a precise-looking number into a guess.`,
        technical: `**Traceability.** In regulated industries, a recorded test result is often required to be *traceable*: to a calibrated instrument (with a calibration certificate and date), a documented procedure, and the person who performed it. This course does not require formal calibration records, but the same five fields are the foundation of that discipline.

**Why the component tester in this lab enforces the structure.** The component tester instrument (F5.M4.L2, and reused by F4's test procedures) does not let you skip straight to a bare reading: it always shows the instrument, setting and connection for the current step before you choose a result, and it never gives a verdict without a reading for every step. This is the five-field habit built into the tool itself, so that even a student in a hurry cannot produce a conclusion that is not traceable back to what was actually measured.`,
        diagrams: [{ id: 'test-bench', caption: 'The five fields of a complete log entry: instrument, setting, connection, reading and conclusion.' }],
        formulas: [{ name: 'Loaded voltage (why load current must be recorded)', expr: 'V_loaded = V_OCV − I · R_int', where: [['V_OCV', 'open-circuit voltage', 'V'], ['I', 'load current at the time of the reading', 'A'], ['R_int', 'internal resistance', 'Ω']], note: 'A "loaded voltage" reading is meaningless without the load current that produced it (F5.M4, battery tester).' }],
        examples: [
          {
            title: 'A complete log entry',
            problem: 'Write a log entry for an ESR measurement of a 470 µF bank, found healthy.',
            steps: ['What: DC-bus reservoir capacitor bank, +/− terminals', 'Instrument/setting: ESR meter, ESR mode', 'Connection: + to −, circuit isolated and confirmed discharged', 'Reading: 0.04 Ω', 'Conclusion: within the healthy range (ref. 0.04 Ω good / 1.6 Ω aged) — bank is healthy'],
            answer: '"Cap bank +/−, ESR meter, ESR mode, isolated & discharged confirmed: 0.04 Ω — healthy (ref. 0.04 Ω / 1.6 Ω aged)."',
          },
          {
            title: 'Spotting an incomplete record',
            problem: 'A log simply reads "48 V bus: 47.6 V". What is missing, and why does it matter?',
            steps: ['No instrument, setting or connection is stated', 'No conclusion is drawn', 'Without the load current at the time, a small sag from 48 V nominal cannot be judged as healthy or not'],
            answer: 'The entry is missing instrument/setting, connection, load current and a conclusion — as written, a reader cannot tell whether 47.6 V represents a healthy, lightly-loaded reading or an early warning sign.',
          },
        ],
        applications: `This exact habit is what the component tester instrument in this lab automates for you: it already prompts for instrument, setting, connection and reading at each step, and produces the conclusion. Troubleshooting write-ups later in the programme (P4/S4) will expect this structure without being told.`,
        mistakes: [
          { mistake: 'Recording only the number.', correction: 'Record instrument, setting, connection and conclusion alongside it.' },
          { mistake: 'Omitting load current when recording a loaded-voltage reading.', correction: 'A loaded voltage without its load current cannot be checked or reproduced later.' },
          { mistake: 'Assuming you will remember the context later.', correction: 'Write it down at the time; memory of "which point" fades within days.' },
        ],
        demo: { title: 'See the structure already in use', text: 'Open the component tester: each step already shows instrument, setting and connection before you choose a reading, exactly the structure this lesson describes.', link: to.instrument('Open the component tester', 'component-tester') },
        activities: [to.instrument('Component tester', 'component-tester'), to.proc('Capacitor ESR test procedure', 'capacitor', 'cap-esr')],
        check: [
          { id: 'k1', type: 'mcq', prompt: 'Which is NOT one of the five fields worth recording?', options: ['The meter\'s purchase price', 'Instrument and setting', 'Connection', 'Conclusion'], answer: 0, explain: 'Price is irrelevant to the measurement\'s meaning.' },
          { id: 'k2', type: 'mcq', prompt: 'Why record whether a circuit was live or isolated when logging a resistance reading?', options: ['Resistance/continuity readings on a live circuit are meaningless or unsafe', 'It changes the units', 'It is required by law everywhere', 'It does not matter'], answer: 0, explain: 'F5.M2 covers why resistance ranges require isolation.' },
          { id: 'k3', type: 'mcq', prompt: 'A battery\'s "loaded voltage" reading is meaningless without also recording...', options: ['the load current at the time', 'the meter\'s serial number', 'the ambient light level', 'the technician\'s name'], answer: 0, explain: 'Loaded voltage depends on the current drawn.' },
        ],
        summary: [
          'Record instrument, setting, connection, reading and conclusion together — never the number alone.',
          'State the conditions (load current, temperature, live/isolated, test frequency) that change what the number means.',
          'This is the same structure already used by every test procedure in the component library and this lab\'s component tester.',
          'A number recorded alone cannot be checked, trusted or acted on correctly later.',
        ],
        homework: {
          id: 'F5.M1.L3.hw',
          title: 'Write two log entries',
          brief: 'Practise the five-field format.',
          tasks: [],
          written: [
            { prompt: 'Write a complete log entry for a DMM diode test on a rectifier diode found good (0.55 V forward, OL reverse).', model: '"Rectifier diode D1, DMM, diode-test mode. Forward (red-anode, black-cathode): 0.55 V. Reverse: OL. Conclusion: healthy junction — conducts forward, blocks reverse."' },
            { prompt: 'Explain why "battery loaded voltage: 11.44 V" is an incomplete record, and rewrite it as a complete one using a load current of 2.86 A.', model: 'It is incomplete because loaded voltage depends on the current drawn — the same battery would show a different "loaded voltage" under a different load. Complete version: "12 V battery, DMM DC V, across terminals, with a 4 Ω load drawing 2.86 A: 11.44 V. Conclusion: sag of about 0.27 V, consistent with a healthy low internal resistance."' },
          ],
        },
      },
    },
  ],
  quiz: {
    pass: 0.8,
    questions: [
      { id: 'q1', type: 'mcq', prompt: 'A reading that is repeatable but wrong is described as...', options: ['precise but not accurate', 'accurate but not precise', 'high resolution', 'uncalibrated'], answer: 0, explain: 'Repeatability is precision, not accuracy.' },
      { id: 'q2', type: 'numeric', prompt: 'A meter "± (1.5 % + 2 digits)", 0.1 V resolution, reads 230.0 V. Uncertainty (V)?', answer: 3.65, tol: 0.05, unit: 'V', explain: '1.5% of 230 = 3.45, plus 2×0.1 = 0.2 → 3.65 V.' },
      { id: 'q3', type: 'mcq', prompt: 'A distribution board requires at minimum...', options: ['CAT III', 'CAT I', 'CAT II', 'No rating'], answer: 0, explain: 'Distribution level is CAT III.' },
      { id: 'q4', type: 'mcq', prompt: 'What protects a multimeter\'s current ranges against a fault?', options: ['A high-energy fuse', 'The display resolution', 'The CAT rating alone', 'Nothing; current ranges are inherently safe'], answer: 0, explain: 'A correctly rated fuse protects current ranges.' },
      { id: 'k5', type: 'mcq', prompt: 'Which of these belongs in a complete measurement log entry?', options: ['Instrument, setting, connection, reading and conclusion', 'Only the numeric reading', 'Only the conclusion', 'Only the date'], answer: 0, explain: 'All five fields give the reading its meaning.' },
      { id: 'k6', type: 'mcq', prompt: 'CAT ratings mainly guard against...', options: ['transient over-voltage withstand failure', 'display rounding error', 'battery drain in the meter', 'resolution loss at low readings'], answer: 0, explain: 'Category ratings are about transient energy withstand.' },
    ],
  },
  practicals: [],
}
