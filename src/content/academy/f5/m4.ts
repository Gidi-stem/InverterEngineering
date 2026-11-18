import type { AcademyModule } from '../types'
import { to } from '../s1/links'

/** F5.M4 Specialist instruments. */
export const F5_M4: AcademyModule = {
  id: 'F5.M4',
  title: 'Specialist instruments',
  summary: 'Insulation resistance testing (simulation and safety instruction only), LCR and ESR meters for component condition, and thermal measurement.',
  lessons: [
    {
      id: 'F5.M4.L1',
      title: 'Insulation resistance testing',
      minutes: 25,
      content: {
        objectives: [
          'Explain what an insulation resistance test measures and why.',
          'State the safe procedure around an insulation test, including isolation and discharge.',
          'Interpret a megohm reading against a guideline minimum.',
          'Explain why this course teaches insulation testing in simulation only.',
        ],
        introduction: `An insulation resistance test checks the health of the insulation separating a conductor from earth (or from another conductor) by applying a test voltage well above normal operating voltage and measuring the tiny leakage current that results. It finds damage — damp, abrasion, rodent damage, ageing — long before it would show up as a working fault. Because the test itself applies a few hundred volts DC, **this course teaches it in simulation only**, with full attention to the safety procedure around it.`,
        lecture: `### What the test does

An insulation resistance tester ("megger") applies a DC test voltage — commonly 250 V, 500 V or 1000 V, chosen to suit the circuit's normal operating voltage — between a conductor and earth (or between two conductors), and measures the resulting leakage current. Healthy insulation passes almost no current at this voltage, giving a reading in the hundreds of megohms or more. Damaged, damp or aged insulation passes more current, giving a lower reading.

### Reading the result

| Condition | Typical reading (500 V test) |
|---|---|
| New, dry cable | Many hundreds of MΩ |
| Damp conduit run | A few MΩ |
| Physically damaged insulation | Below 1 MΩ |
| Direct contact with earth (fault) | Essentially 0 MΩ |

Installation wiring guidance commonly sets a **guideline minimum of 1 MΩ** for a final circuit tested at 500 V DC — a circuit reading below this should not be energised until the cause is found and corrected. (Always follow the specific regulation applicable in your jurisdiction; this course teaches the general principle, not a specific national standard.)

### The safety procedure

Because the test applies a voltage well above normal operating levels:

1. **Isolate** the circuit and lock off the supply (F1.M3).
2. **Prove dead** with a proving unit, before and after.
3. **Disconnect** anything that cannot withstand the test voltage — sensitive electronics, surge arrestors, some sensors.
4. **Discharge** the circuit (and any capacitance in it) before AND after the test — the test itself leaves a charge on the circuit's own capacitance, which must be discharged before it is touched again.

### Why this course never applies a real test voltage

An insulation tester deliberately applies a hazardous voltage to a circuit that is, by definition, not yet confirmed safe (that is the point of the test). This combination of "intentionally elevated voltage" and "circuit of unknown condition" is exactly the situation this programme's simulation-only policy exists for: you learn the procedure, the readings, and the judgement calls completely safely here, and apply real tests only under qualified supervision with real equipment.`,
        technical: `**Why DC, not AC, for the test voltage.** A DC test voltage avoids the capacitive charging current that an AC test would also measure, isolating the TRUE leakage (resistive) component of the current. Most insulation testers also include a timer function (the resistance reading tends to rise over the first minute as the circuit's own capacitance finishes charging) for a more stable final reading.

**Polarization index.** For larger installations, insulation resistance is sometimes read at 1 minute and 10 minutes into the test; a rising ratio (polarization index) indicates healthy, dry insulation, while a flat or falling ratio can indicate contamination or moisture, even if the absolute reading looks acceptable.`,
        diagrams: [{ id: 'isolation-flow', caption: 'The safe-isolation and discharge sequence around an insulation resistance test, before and after applying the test voltage.' }],
        formulas: [{ name: 'Insulation resistance (Ohm\'s law, at the test voltage)', expr: 'R_insulation = V_test / I_leakage', where: [['V_test', 'applied DC test voltage', 'V'], ['I_leakage', 'the small leakage current the test detects', 'A']], note: 'Healthy insulation passes almost no current, giving a very high resistance reading; damaged insulation passes more.' }],
        examples: [
          {
            title: 'Judging a borderline reading',
            problem: 'A circuit tested at 500 V DC reads 4.2 MΩ. Is it acceptable against the 1 MΩ guideline minimum, and would you energise it without further investigation?',
            steps: ['4.2 MΩ is above the 1 MΩ guideline minimum', 'However, it is far below a healthy new cable\'s reading (hundreds of MΩ), suggesting dampness or early degradation'],
            answer: 'Technically acceptable against the bare guideline, but worth investigating the cause (likely dampness) before leaving it in service — a reading this far below a healthy new cable is a warning sign, not a clean pass.',
          },
          {
            title: 'A direct earth fault',
            problem: 'A conductor tested at 500 V DC reads close to 0 MΩ to earth. What does this mean, and is it safe to energise?',
            steps: ['A reading near 0 MΩ means almost no resistance separates the conductor from earth', 'This is consistent with a direct contact fault, not degraded insulation'],
            answer: 'No — this is effectively a dead short to earth. The circuit must not be energised until the fault is located and repaired.',
          },
        ],
        applications: `Insulation testing is the standard check after a cable is newly installed, after work that may have disturbed insulation, or during periodic inspection of fixed wiring and installed inverter/solar systems — a key part of the commissioning sequence covered in S2's Commissioning module.`,
        mistakes: [
          { mistake: 'Testing a circuit with sensitive electronics still connected.', correction: 'Disconnect anything that cannot withstand the test voltage before testing.' },
          { mistake: 'Touching the circuit immediately after the test without discharging it.', correction: 'The test itself leaves a charge on the circuit\'s own capacitance; discharge before and after.' },
          { mistake: 'Treating "above the guideline minimum" as "perfectly healthy".', correction: 'A reading far below a healthy new cable\'s typical value is worth investigating even if it technically passes the minimum.' },
        ],
        demo: { title: 'Walk through the safety procedure', text: 'This instrument requires you to confirm every safety step before it will apply a (simulated) test voltage — exactly the discipline the real procedure demands.', link: to.instrument('Open the insulation resistance tester', 'insulation') },
        activities: [to.instrument('Insulation resistance tester', 'insulation'), to.lib('Protective earth', 'protective-earth')],
        check: [
          { id: 'k1', type: 'mcq', prompt: 'An insulation resistance test measures...', options: ['leakage resistance between a conductor and earth (or another conductor) at an elevated test voltage', 'the conductor\'s DC resistance along its length', 'the supply frequency', 'the conductor\'s current rating'], answer: 0, explain: 'It specifically checks insulation health, not conductor resistance.' },
          { id: 'k2', type: 'mcq', prompt: 'Why must a circuit be discharged AFTER an insulation test, not just before?', options: ['The test itself leaves a charge on the circuit\'s own capacitance', 'The tester needs to cool down', 'It resets the tester\'s calibration', 'It is not necessary after, only before'], answer: 0, explain: 'The applied test voltage charges the circuit\'s capacitance.' },
          { id: 'k3', type: 'mcq', prompt: 'A common guideline minimum for a final circuit at 500 V DC test is...', options: ['1 MΩ', '1 Ω', '1 kΩ', '100 Ω'], answer: 0, explain: 'A widely used general guideline, subject to local regulation.' },
          { id: 'k4', type: 'mcq', prompt: 'Why is this instrument simulation-only in this course?', options: ['It intentionally applies a hazardous test voltage to a circuit of unknown condition', 'It is too expensive to model', 'It only works on DC circuits', 'There is no real safety concern, it is just convention'], answer: 0, explain: 'The combination of elevated voltage and unknown circuit condition is the exact hazard the simulation-only policy addresses.' },
        ],
        summary: [
          'An insulation resistance test applies an elevated DC voltage and measures leakage resistance to judge insulation health.',
          'Readings in the hundreds of MΩ are healthy; a few MΩ suggests dampness or ageing; below 1 MΩ is commonly a guideline failure.',
          'Isolate, prove dead, disconnect sensitive equipment, test, then discharge before AND after.',
          'This instrument is simulation and safety instruction only in this course; real testing needs qualified supervision and real equipment.',
        ],
        homework: {
          id: 'F5.M4.L1.hw',
          title: 'Insulation test judgement',
          brief: 'Judge readings and safety steps.',
          tasks: [{ id: 'h1', type: 'mcq', prompt: 'A reading of 0.6 MΩ at 500 V DC against a 1 MΩ guideline minimum is...', options: ['below the guideline: do not energise until investigated', 'acceptable', 'irrelevant without the frequency', 'only a concern above 1000 V'], answer: 0, explain: '0.6 MΩ < 1 MΩ.' }],
          written: [{ prompt: 'Explain, step by step, the full safety sequence around an insulation resistance test, and why the order of steps matters.', model: 'Isolate the circuit and lock off the supply, then prove dead with a proving unit to confirm no voltage remains. Disconnect anything that cannot withstand the elevated test voltage. Apply the test and read the result. Afterward, discharge the circuit again, because the test itself leaves a charge on the circuit\'s own capacitance. The order matters because each step depends on the one before it being true: proving dead before testing confirms it is safe to touch to disconnect sensitive items, and discharging after is necessary precisely because the test just charged the circuit.' }],
        },
      },
    },
    {
      id: 'F5.M4.L2',
      title: 'LCR and ESR meters',
      minutes: 30,
      content: {
        objectives: [
          'Explain what an LCR meter measures and why it needs a test frequency.',
          'Explain why ESR, not capacitance alone, is the key health check for an electrolytic capacitor.',
          'Relate reactance at a given frequency to the same impedance formulas from F3.M2.',
          'Use good/degraded/open/shorted reference values to judge a capacitor or inductor.',
        ],
        introduction: `A multimeter's ohms range cannot properly characterise a capacitor or inductor — a capacitor passes no DC at all, and an inductor looks like a plain wire to a DC ohmmeter. LCR and ESR meters apply an AC test signal instead, and this lesson's readings are taken directly from the component library's own reference data (F4), so what you see here matches what the library already teaches about capacitor and inductor failure.`,
        lecture: `### What an LCR meter measures

An **LCR meter** applies a small AC test signal at a chosen frequency and measures the component's **inductance (L)**, **capacitance (C)**, or **impedance (Z)**, depending on the mode selected. Because capacitive and inductive reactance both depend on frequency (F3.M2), the TEST FREQUENCY matters: a healthy part can look quite different at 100 Hz versus 20 kHz, and manufacturers usually specify capacitance/inductance at a stated reference frequency (often 100 Hz or 1 kHz for larger components).

**Z = √(X² + R²)** — the same impedance formula from F3.M2 — where X is the reactance (X_C = 1/2πfC for a capacitor, X_L = 2πfL for an inductor) and R is the component's series resistance (ESR for a capacitor, DC resistance for an inductor).

### ESR: the real health check for an electrolytic capacitor

A capacitor's **equivalent series resistance (ESR)** represents internal losses — in the electrolyte, the foil, the connections. As an electrolytic capacitor ages, its electrolyte dries out: capacitance falls AND ESR rises, often well before the part fails outright. Because ESR shows up directly as heating under ripple current, **a rising ESR is usually the first and most practically important sign of an ageing capacitor** — more diagnostic, in many cases, than capacitance alone. The component library's own reference values make this concrete: a healthy 470 µF capacitor reads about 452 µF / 0.04 Ω ESR; an aged one reads about 210 µF / 1.6 Ω — the ESR has risen by a factor of 40, far more dramatically than the capacitance has fallen.

### Reading good/degraded/open/shorted

| Condition | Capacitor (C / ESR) | Inductor (L / DCR) |
|---|---|---|
| Good | Near nominal / low ESR | Near nominal / low DCR |
| Degraded | Reduced C / high ESR | Reduced L (shorted turns), DCR may look normal |
| Open | OL, no reading | OL, no reading |
| Shorted | Near-zero or erratic C, near-zero ESR | — |

Note the trap in the "shorted" row: a near-zero ESR on its own LOOKS like "very healthy", but combined with no measurable capacitance it actually indicates a short, not a good part. **Always read ESR together with capacitance**, never ESR alone.

### Why an inductor needs both L and DC resistance checked

Shorted turns in an inductor's winding reduce its effective inductance (less magnetic coupling reaching the core) while its DC resistance can still look roughly normal, because only a small fraction of turns may be shorted. This is why the component library's inductor test checks DC resistance AND inductance as separate steps — DC resistance alone would miss a shorted-turns fault.`,
        technical: `**Test signal amplitude.** LCR meters use a small test signal (often under 1 V), deliberately kept low so as not to forward-bias any semiconductor junctions that might be in parallel with the part under test, and to stay within the component's own small-signal linear region.

**Frequency dependence as a diagnostic tool, not just a specification detail.** Sweeping the test frequency and plotting impedance (as F3.M2 covers conceptually) can reveal a capacitor's self-resonant frequency, above which its own parasitic inductance dominates and it stops behaving as a capacitor at all — a real effect relevant to high-frequency switching design, beyond what this introductory treatment requires you to calculate.`,
        diagrams: [{ id: 'rc-curve', caption: 'Capacitor impedance magnitude falling with frequency, and inductor impedance rising with frequency — the same X_C/X_L relationships from F3.M2, now read off an LCR meter.' }],
        formulas: [
          { name: 'Capacitive reactance', expr: 'X_C = 1 / (2πfC)', where: [['X_C', 'capacitive reactance', 'Ω'], ['f', 'test frequency', 'Hz'], ['C', 'capacitance', 'F']] },
          { name: 'Inductive reactance', expr: 'X_L = 2πfL', where: [['X_L', 'inductive reactance', 'Ω'], ['L', 'inductance', 'H']] },
          { name: 'Impedance magnitude', expr: 'Z = √(X² + R²)', where: [['R', 'ESR (capacitor) or DC resistance (inductor)', 'Ω']] },
        ],
        examples: [
          {
            title: 'Spotting a shorted capacitor from ESR alone',
            problem: 'A capacitor reads ESR = 0.002 Ω (very low) and capacitance = 0 µF. Is this a healthy capacitor?',
            steps: ['Low ESR alone would look "good"', 'But zero measurable capacitance means it is not behaving as a capacitor at all'],
            answer: 'No — this combination indicates a shorted capacitor, not a healthy one. Always check ESR together with capacitance.',
          },
          {
            title: 'Impedance of a 470 µF capacitor at two frequencies',
            problem: 'Using the healthy reference values (C = 452 µF, ESR = 0.04 Ω), estimate the impedance magnitude at 100 Hz and at 20 kHz.',
            steps: ['X_C(100 Hz) = 1/(2π×100×452e-6) ≈ 3.52 Ω; Z ≈ √(3.52² + 0.04²) ≈ 3.52 Ω', 'X_C(20 kHz) = 1/(2π×20000×452e-6) ≈ 0.0176 Ω; Z ≈ √(0.0176² + 0.04²) ≈ 0.044 Ω'],
            answer: 'Impedance falls from about 3.52 Ω at 100 Hz to about 0.044 Ω at 20 kHz — the capacitor "filters" far more effectively at the higher frequency, which is exactly why it is chosen to bypass high-frequency switching ripple rather than low-frequency mains hum.',
          },
        ],
        applications: `This is the same reasoning the component tester instrument automates, and the same reference data used by F4's capacitor and inductor test procedures — one consistent set of numbers across the library, the LCR/ESR instrument, and the component tester.`,
        mistakes: [
          { mistake: 'Judging a capacitor by ESR alone.', correction: 'A very low ESR with no measurable capacitance indicates a short, not health. Check both together.' },
          { mistake: 'Comparing a capacitance reading at one frequency with a spec at another without accounting for frequency dependence.', correction: 'Measure at (or close to) the frequency the component is specified at, where practical.' },
          { mistake: 'Checking only DC resistance on a suspect inductor.', correction: 'Shorted turns can leave DC resistance looking roughly normal; also measure inductance.' },
        ],
        demo: { title: 'Measure a real capacitor/inductor case', text: 'Select a good, degraded, open or shorted case and measure C, L, ESR, DCR or Z — the good-case values match the component library exactly.', link: to.instrument('Open the LCR meter', 'lcr') },
        activities: [to.instrument('LCR meter', 'lcr'), to.proc('Capacitor ESR test procedure', 'capacitor', 'cap-esr'), to.proc('Inductor test procedure', 'inductor', 'inductor-lcr')],
        check: [
          { id: 'k1', type: 'mcq', prompt: 'What does ESR represent in an electrolytic capacitor?', options: ['Internal losses (electrolyte, foil, connections) in series with the ideal capacitance', 'The capacitor\'s voltage rating', 'Its physical size', 'Its leakage current only'], answer: 0, explain: 'ESR models the real losses in the device.' },
          { id: 'k2', type: 'mcq', prompt: 'A near-zero ESR with no measurable capacitance most likely indicates...', options: ['a shorted capacitor', 'an excellent, healthy capacitor', 'an open capacitor', 'a correctly rated capacitor'], answer: 0, explain: 'Always check ESR together with capacitance.' },
          { id: 'k3', type: 'mcq', prompt: 'Why does capacitive reactance fall as test frequency rises?', options: ['X_C = 1/(2πfC): frequency is in the denominator', 'Capacitors behave as resistors at high frequency', 'It does not change with frequency', 'It only falls for inductors'], answer: 0, explain: 'Reactance is inversely proportional to frequency for a capacitor.' },
          { id: 'k4', type: 'mcq', prompt: 'A suspect inductor with normal DC resistance but reduced inductance most likely has...', options: ['shorted turns', 'an open winding', 'the wrong core material', 'no fault'], answer: 0, explain: 'Shorted turns reduce effective inductance without necessarily changing overall DC resistance much.' },
        ],
        summary: [
          'An LCR meter measures L, C or Z at a chosen AC test frequency; reactance depends on that frequency (F3.M2).',
          'ESR, not capacitance alone, is usually the first practical sign of an ageing electrolytic capacitor.',
          'Always read ESR together with capacitance — near-zero ESR with no capacitance means shorted, not healthy.',
          'An inductor needs both DC resistance AND inductance checked, because shorted turns can leave DC resistance looking normal.',
        ],
        homework: {
          id: 'F5.M4.L2.hw',
          title: 'LCR/ESR judgement',
          brief: 'Apply the good/degraded/open/shorted table.',
          tasks: [{ id: 'h1', type: 'numeric', prompt: 'X_C of a 100 µF capacitor at 1 kHz (Ω)?', answer: 1.59, tol: 0.03, unit: 'Ω', explain: 'X_C = 1/(2π×1000×100e-6) ≈ 1.59 Ω.' }],
          written: [{ prompt: 'A technician measures a capacitor\'s capacitance only, finds it close to the marked value, and declares it healthy. Explain what they may be missing and why.', model: 'Capacitance alone does not catch a rising ESR, which is often the earliest and most practically important sign of an ageing electrolytic capacitor. A capacitor can retain close-to-nominal capacitance while its ESR has risen significantly, causing excess heating under ripple current and eventual failure. The technician should also measure ESR before declaring the capacitor healthy.' }],
        },
      },
    },
    {
      id: 'F5.M4.L3',
      title: 'Thermal imaging and temperature probes',
      minutes: 20,
      content: {
        objectives: [
          'Explain what a thermal (infrared) camera measures, and its limitations.',
          'Explain how a contact temperature probe differs from a non-contact infrared reading.',
          'Interpret a thermal reading against a device\'s rated operating temperature.',
          'Relate excess heating to likely causes in an inverter.',
        ],
        introduction: `Heat is one of the clearest symptoms of an electrical problem: a loose connection, an overloaded component or a failing device almost always runs hotter than it should before it fails outright. This lesson covers how thermal measurement works and its limits, building on the heat-sink and cooling content already in the component library.`,
        lecture: `### Non-contact infrared versus contact probes

A **thermal (infrared) camera** measures the infrared radiation a surface emits and converts it to a temperature map, without touching anything — useful for scanning a whole board or enclosure quickly and spotting a hot spot you were not specifically looking for. A **contact temperature probe** (thermocouple or similar) touches the surface directly and reads a single point, generally more accurate for that one point but requiring you to already know where to check.

### The emissivity trap

Infrared cameras assume a surface **emissivity** (how efficiently it radiates, relative to a perfect "black body") to convert the detected radiation into a temperature. Shiny, reflective surfaces (bare metal, some heat-sink finishes) have low emissivity and can read significantly LOWER than their true temperature on an infrared camera set for the wrong emissivity — a dangerous trap if you trust the number without checking. Matte, dark surfaces are closer to ideal and read more reliably. When in doubt, cross-check a suspicious infrared reading with a contact probe.

### Interpreting a reading

Compare the measured temperature against the device's rated maximum operating (junction or case) temperature, not against "how hot it feels". A heat sink that feels hot to the touch may still be well within a power MOSFET's rated junction temperature; conversely, a device can be dangerously overheating well before it feels alarmingly hot to a brief touch.

### Likely causes of excess heating in an inverter

- A loose or corroded connection (increased resistance, localised heating at the joint, not spread across the conductor).
- An undersized conductor or heat sink for the actual load.
- A failing switching device with increased on-resistance or switching losses.
- Blocked or failed cooling (clogged heat sink fins, a stalled fan).`,
        technical: `**Thermal resistance and rise above ambient.** A component's temperature rise above ambient is set by its power dissipation and the thermal resistance of its path to ambient (device → heat sink → air), covered conceptually in the component library's cooling entries. The same absolute temperature reading means something different on a 20 °C day versus a 40 °C day — always note ambient temperature alongside a thermal reading, consistent with F5.M1.L3's "record the conditions" principle.

**Thermal imaging cannot see inside an enclosure.** Infrared cameras only see the surface actually in their line of sight; a hot internal component behind a closed metal enclosure will not show up until its heat has conducted to a visible outer surface, by which point the internal temperature may already be considerably higher.`,
        diagrams: [{ id: 'thermal-network', caption: 'Heat flow from a switching device through its heat sink to ambient air, and where a thermal camera and a contact probe each "see" the resulting temperature.' }],
        formulas: [{ name: 'Temperature rise above ambient', expr: 'ΔT = P_diss × R_thermal', where: [['ΔT', 'rise above ambient temperature', '°C'], ['P_diss', 'power dissipated by the device', 'W'], ['R_thermal', 'total thermal resistance to ambient', '°C/W']], note: 'Always record ambient temperature alongside a thermal reading — the same absolute reading means something different on a hot day versus a cool one.' }],
        examples: [
          {
            title: 'A misleading low reading',
            problem: 'An infrared camera reads a bare, shiny aluminium heat sink at 38 °C, but a contact probe on the same spot reads 61 °C. What is the likely explanation?',
            steps: ['Bare, shiny aluminium has low emissivity', 'An infrared reading set for a higher (incorrect) emissivity under-reads a low-emissivity surface'],
            answer: 'The camera\'s emissivity setting does not match the shiny surface, causing it to under-read. The contact probe\'s 61 °C is the more trustworthy figure here; cross-checking caught the error.',
          },
          {
            title: 'Estimating temperature rise',
            problem: 'A device dissipates 8 W through a heat sink with a total thermal resistance to ambient of 4 °C/W, in a 30 °C room. Estimate its case temperature.',
            steps: ['ΔT = P_diss × R_thermal = 8 × 4 = 32 °C', 'Case temperature = ambient + ΔT = 30 + 32'],
            answer: '≈ 62 °C case temperature — compare this against the device\'s rated maximum, not against how hot it feels.',
          },
        ],
        applications: `Thermal checks are a standard part of commissioning and troubleshooting an installed inverter (S2's commissioning module, and the Repair and Troubleshooting Workshop ahead), typically run alongside electrical measurements, not instead of them.`,
        mistakes: [
          { mistake: 'Trusting an infrared reading on a shiny metal surface without checking emissivity.', correction: 'Cross-check with a contact probe, or set the camera\'s emissivity correctly for the surface.' },
          { mistake: 'Judging "too hot" by feel.', correction: 'Compare the measured temperature against the specific device\'s rated maximum, not a subjective impression.' },
          { mistake: 'Assuming a cool-looking enclosure means everything inside is fine.', correction: 'Infrared imaging only sees visible surfaces; an internal hot spot may not yet have conducted to the outside.' },
        ],
        demo: { title: 'Review the component library\'s thermal reference', text: 'The heat sink and cooling fan entries in the component library describe thermal resistance and rated operating ranges relevant to this lesson.', link: to.lib('Heat sink', 'heat-sink') },
        activities: [to.lib('Heat sink', 'heat-sink'), to.lib('Cooling fan', 'cooling-fan')],
        check: [
          { id: 'k1', type: 'mcq', prompt: 'An infrared camera on a shiny, low-emissivity surface tends to...', options: ['under-read the true temperature', 'over-read the true temperature', 'read perfectly regardless of surface', 'only work on metal'], answer: 0, explain: 'Low emissivity causes under-reading unless corrected for.' },
          { id: 'k2', type: 'mcq', prompt: 'A contact temperature probe, compared with an infrared camera, is generally...', options: ['more accurate for the single point it touches, but cannot scan a wide area quickly', 'always less accurate', 'unaffected by surface finish and always faster', 'only usable on DC circuits'], answer: 0, explain: 'Contact probes trade scanning speed for single-point accuracy.' },
          { id: 'k3', type: 'mcq', prompt: 'The correct way to judge "too hot" is to compare against...', options: ['the specific device\'s rated maximum operating temperature', 'how hot it feels to a brief touch', 'room temperature only', 'the inverter\'s weight'], answer: 0, explain: 'Subjective feel is not a reliable or quantitative check.' },
        ],
        summary: [
          'Infrared cameras read surface temperature without contact but depend on a correct emissivity setting; contact probes read one point more reliably.',
          'Shiny, low-emissivity surfaces can under-read significantly on an infrared camera; cross-check with a contact probe when in doubt.',
          'Judge heating against the specific device\'s rated maximum, not by feel.',
          'Infrared imaging only sees visible surfaces; internal hot spots can exist before they are visible from outside an enclosure.',
        ],
        homework: {
          id: 'F5.M4.L3.hw',
          title: 'Thermal interpretation',
          brief: 'Explain thermal readings.',
          tasks: [{ id: 'h1', type: 'numeric', prompt: 'A device dissipates 5 W with a total thermal resistance to ambient of 6 °C/W, in a 25 °C room. Case temperature (°C)?', answer: 55, tol: 0.02, unit: '°C', explain: 'ΔT = 5 × 6 = 30 °C; case = 25 + 30 = 55 °C.' }],
          written: [{ prompt: 'An infrared scan of an inverter enclosure shows nothing unusual, but the unit is intermittently shutting down on thermal protection. Explain why the infrared result does not rule out a thermal problem.', model: 'An infrared camera only sees the temperature of surfaces within its line of sight. If the enclosure is closed, an internal component (such as a switching device or a connection) can be significantly overheating without that heat yet having conducted to a visible outer surface, especially during a brief scan. The thermal protection shutdown is real evidence of a genuine internal thermal problem that an external infrared scan of the closed enclosure would not detect.' }],
        },
      },
    },
  ],
  quiz: {
    pass: 0.8,
    questions: [
      { id: 'q1', type: 'mcq', prompt: 'A 500 V DC insulation test guideline minimum for a final circuit is commonly...', options: ['1 MΩ', '1 Ω', '1 kΩ', '10 Ω'], answer: 0, explain: 'A widely used general guideline.' },
      { id: 'q2', type: 'mcq', prompt: 'A rising ESR in an electrolytic capacitor usually indicates...', options: ['an ageing capacitor, often before capacitance drops much', 'a healthy capacitor', 'a wrong voltage rating', 'nothing significant'], answer: 0, explain: 'ESR often rises as the first sign of ageing.' },
      { id: 'q3', type: 'mcq', prompt: 'Near-zero ESR with no measurable capacitance indicates...', options: ['a shorted capacitor', 'an excellent capacitor', 'an open capacitor', 'a correctly rated capacitor'], answer: 0, explain: 'Check ESR and capacitance together.' },
      { id: 'q4', type: 'mcq', prompt: 'A shiny, low-emissivity surface on an infrared camera tends to...', options: ['under-read the true temperature', 'over-read the true temperature', 'read perfectly', 'disable the camera'], answer: 0, explain: 'Low emissivity causes under-reading unless corrected.' },
      { id: 'q5', type: 'mcq', prompt: 'Why is the insulation resistance tester simulation-only in this course?', options: ['It intentionally applies a hazardous voltage to a circuit of unknown condition', 'It is not a real instrument', 'It only works in theory', 'There is no safety concern'], answer: 0, explain: 'The combination of elevated voltage and unknown circuit condition is the specific hazard addressed.' },
    ],
  },
  practicals: [],
}
