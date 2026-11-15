import type { AcademyModule } from '../types'
import { to } from './links'

/** S1.M2 Square-wave and modified-sine construction (projects A, B, C). */
export const S1_M2: AcademyModule = {
  id: 'S1.M2',
  title: 'Square-wave and modified-sine construction',
  summary: 'Build the three simplest inverters: a bare H-bridge, a square-wave inverter with a step-up transformer, and a phase-shifted "modified sine" inverter. Measure what each waveform really contains.',
  lessons: [
    {
      id: 'S1.M2.L1',
      title: 'The basic DC-to-AC inverter (project A)',
      minutes: 40,
      legacyId: 'bld-a',
      content: {
        objectives: [
          'Explain how the four switch states of an H-bridge produce +V, −V and zero across a load.',
          'Predict the frequency, RMS value and fundamental of a square-wave output.',
          'Explain shoot-through and why diagonal pairs must never overlap with their leg partners.',
          'Assemble, verify and test project A in the build laboratory.',
        ],
        introduction: `The simplest possible [[inverter]] is a battery, a fuse and four switches. It changes no voltage level and makes no sine wave. What it does is *reverse the polarity* of the battery across a load 50 or 60 times a second, and that is already alternating current. Every other project in this course is this circuit with something added.`,
        lecture: `### The H-bridge

The four switches form two [[leg|legs]]: Q1 above Q2 (leg A) and Q3 above Q4 (leg B). The load connects between the leg midpoints. This shape, with the load as the crossbar, gives the [[h-bridge]] its name.

| State | On | Load voltage | Current path |
|---|---|---|---|
| Positive | Q1 + Q4 | +V_dc | + → Q1 → load (A→B) → Q4 → − |
| Negative | Q3 + Q2 | −V_dc | + → Q3 → load (B→A) → Q2 → − |
| Zero (top) | Q1 + Q3 | 0 | Load shorted through the high side |
| Zero (bottom) | Q2 + Q4 | 0 | Load shorted through the low side |
| **Forbidden** | Q1 + Q2 or Q3 + Q4 | Short circuit | [[shoot-through]] across the battery |

Alternating the positive and negative states every half-period gives a square wave of amplitude ±V_dc at frequency f = 1/T.

### Timing

At 50 Hz the period is 20 ms, so each diagonal pair is on for 10 ms. The gate-drive generator for leg A drives Q1 with a 50 % square wave and Q2 with its complement. Leg B is driven in antiphase (Q4 with Q1, Q3 with Q2). Between each turn-off and the next turn-on there is a short [[dead-time]], so that one switch has fully stopped conducting before its partner starts.

### What a square wave contains

A square wave of amplitude V has:

- **RMS value:** V. The voltage is always ±V, so its square is always V².
- **[[crest-factor|Crest factor]]:** 1.0.
- **Fundamental (Fourier analysis):** a 50 Hz component of peak (4/π)·V ≈ 1.27·V.
- **Odd [[harmonic|harmonics]]** at 3f, 5f, 7f…, with amplitudes 1/3, 1/5, 1/7… of the fundamental.

These harmonics give a [[thd|THD]] of 48.3 %. A heater does not care; a motor does.

### Project A in the laboratory

Project A drives a 12 V, 60 W lamp directly from the bridge, with no transformer. Each assembly step is verified on the electrical connection graph: the laboratory checks that every terminal is connected to the right node, not merely that parts are in roughly the right place. The test suite then simulates the circuit and measures the output voltage, frequency, THD, crest factor and input current.`,
        technical: `**Derivation of the RMS value.** V_rms = √((1/T)∫v²dt). For a square wave v² = V² everywhere, so V_rms = V.

**Derivation of the fundamental.** The Fourier coefficient of an odd square wave is b_k = (4V/(kπ)) for odd k and 0 for even k. The fundamental (k = 1) has peak 4V/π, i.e. an RMS of (4V/π)/√2 = 0.900·V. THD = √(V_rms² − V₁²)/V₁ = √(1 − 0.81)/0.9003 = 0.483.

**Body diodes and dead time.** During the dead time the load current (if it is inductive) continues through the [[body-diode|body diodes]] of the switches that are about to turn on. In project A the lamp is resistive, so the current simply stops for that brief interval.

**Losses at 12 V.** Every milliohm matters: with 5 A flowing through two switches of 10 mΩ each, 0.1 V is lost out of 12 V. Project A's calculation sheet shows the output as V_dc − 2·I·R_DS(on).`,
        diagrams: [
          { id: 'hbridge-states', caption: 'The four allowed states of the H-bridge and the forbidden shoot-through state.' },
          { id: 'schematic:bld-a', caption: 'Project A as assembled in the build laboratory.' },
        ],
        formulas: [
          { name: 'Period and frequency', expr: 'T = 1/f,  each diagonal pair on for T/2', where: [['f', 'output frequency', 'Hz'], ['T', 'period', 's']] },
          { name: 'Square wave RMS and fundamental', expr: 'V_rms = V,   V₁,pk = (4/π)·V,   V₁,rms = 0.900·V', where: [['V', 'square-wave amplitude', 'V']] },
          { name: 'Harmonics of a square wave', expr: 'V_k = V₁ / k  for k = 3, 5, 7, …', where: [['k', 'harmonic order', '—']] },
        ],
        examples: [
          {
            title: 'Output of project A',
            problem: 'The bridge switches 12 V into a 2.4 Ω lamp through two 10 mΩ MOSFETs. Estimate the load current, the output RMS voltage and the power.',
            steps: ['Total resistance = 2.4 + 2 × 0.010 = 2.42 Ω; I = 12/2.42 = 4.96 A', 'V_out = I × 2.4 = 11.90 V (square, so RMS = amplitude)', 'P = 11.90² / 2.4 = 59.0 W'],
            answer: 'About 4.96 A, 11.9 V rms and 59 W. The test suite measures values within a few per cent of this, the difference being the battery’s internal resistance.',
          },
          {
            title: 'Harmonic content',
            problem: 'For a ±12 V square wave, find the peak and RMS of the fundamental and the peak of the 3rd and 5th harmonics.',
            steps: ['V₁,pk = (4/π) × 12 = 15.28 V;  V₁,rms = 15.28/√2 = 10.80 V', 'V₃,pk = 15.28/3 = 5.09 V;  V₅,pk = 15.28/5 = 3.06 V'],
            answer: 'The fundamental is 10.8 V rms, though the total RMS is 12 V. The difference is harmonic content, which is what THD measures.',
            check: '√(12² − 10.8²) / 10.8 = 5.23/10.8 = 48 % THD. ✓',
          },
        ],
        applications: `Low-voltage H-bridges are everywhere:

- DC motor drives (reversing a motor);
- stepper-motor drivers;
- class-D audio amplifiers;
- the output stage of almost every inverter.

Square-wave bridges are still used where the load is resistive and cost matters.`,
        mistakes: [
          { mistake: 'Switching Q1 and Q2 on together “to make zero volts”.', correction: 'That is shoot-through: a short circuit across the battery. Zero is made with Q1 + Q3 or Q2 + Q4.' },
          { mistake: 'Calling a 12 V square wave “12 V AC like the mains, only smaller”.', correction: 'Its RMS is 12 V but its fundamental is only 10.8 V rms; nearly half of its RMS content is harmonics.' },
          { mistake: 'Assuming the laboratory accepts parts placed roughly in the right area.', correction: 'Completion requires the correct electrical connections, verified on the node graph, and a passing simulation test.' },
        ],
        demo: {
          title: 'Build and test project A',
          text: 'Assemble the battery input, the two legs and the gate drivers, then run the test suite. Afterwards break one connection on purpose and watch the matching assembly step fail.',
          link: to.build('Open project A', 'bld-a'),
          embed: 'quasi-square',
        },
        activities: [to.sim('H-bridge operation', 'sim-08'), to.ckt('Full H-bridge exercise', 'ckt-09'), to.lab3d('The MOSFET bridge of the LF-3K', 'lf3k', 'q1')],
        check: [
          { id: 'k1', type: 'mcq', prompt: 'Which pair conducts for a negative load voltage (B positive with respect to A)?', options: ['Q3 and Q2', 'Q1 and Q4', 'Q1 and Q2', 'Q3 and Q4'], answer: 0, explain: 'Current flows + → Q3 → load (B→A) → Q2 → −.' },
          { id: 'k2', type: 'numeric', prompt: 'RMS value of a ±24 V square wave (V)?', answer: 24, tol: 0.01, unit: 'V', explain: 'Square wave: RMS = amplitude.' },
          { id: 'k3', type: 'numeric', prompt: 'Peak of the fundamental of a ±24 V square wave (V)?', answer: 30.56, tol: 0.01, unit: 'V', explain: '(4/π) × 24 = 30.56 V.' },
          { id: 'k4', type: 'mcq', prompt: 'How long is each diagonal pair on at 60 Hz?', options: ['8.33 ms', '16.7 ms', '10 ms', '60 ms'], answer: 0, explain: 'T = 1/60 = 16.7 ms; half of it is 8.33 ms.' },
        ],
        summary: [
          'An H-bridge reverses the load voltage by switching diagonal pairs: Q1 + Q4 positive, Q3 + Q2 negative.',
          'Q1 + Q2 or Q3 + Q4 together is shoot-through; dead time prevents it.',
          'A square wave has RMS = amplitude, fundamental (4/π)·V and odd harmonics at 1/k.',
          'Its THD is 48.3 %, acceptable for resistive loads only.',
          'Project completion is verified electrically and by simulation, not by placement.',
        ],
        homework: {
          id: 'S1.M2.L1.hw',
          title: 'A 24 V bridge for a heater',
          brief: 'A 24 V battery drives a 4.8 Ω heater through an H-bridge with 8 mΩ MOSFETs at 50 Hz.',
          tasks: [
            { id: 'h1', type: 'numeric', prompt: 'Load current (A)?', answer: 4.984, tol: 0.01, unit: 'A', explain: '24/(4.8 + 0.016) = 4.983 A.' },
            { id: 'h2', type: 'numeric', prompt: 'Heater power (W)?', answer: 119.2, tol: 0.01, unit: 'W', explain: 'I²R = 4.983² × 4.8 = 119.2 W.' },
            { id: 'h3', type: 'numeric', prompt: 'RMS of the fundamental of the load voltage (V)?', answer: 21.53, tol: 0.02, unit: 'V', explain: 'V_load = 23.92 V; fundamental 0.9003 × 23.92 = 21.53 V rms.' },
          ],
          written: [{ prompt: 'Explain in your own words why a square wave is unsuitable for an electric fan motor.', model: 'Its large 3rd, 5th and 7th harmonics drive currents at 150–350 Hz that produce no useful torque but heat the windings and iron and cause vibration and buzzing.' }],
        },
      },
    },
    {
      id: 'S1.M2.L2',
      title: 'The square-wave inverter (project B)',
      minutes: 45,
      legacyId: 'bld-b',
      content: {
        objectives: [
          'Explain the role of the DC bus capacitor, the step-up transformer, the output breaker and the earth bond.',
          'Calculate the number of primary turns from the core area, peak flux density and frequency.',
          'Predict how the output of an unregulated inverter follows the battery voltage.',
          'Assemble and test project B, and interpret its no-load, line-voltage and efficiency tests.',
        ],
        introduction: `Project B turns the bare bridge into a real (if crude) mains inverter by adding a step-up [[transformer]]. With it come the components that make it safe and robust:

- a DC [[bus-capacitor|bus capacitor]];
- an output [[breaker]];
- an earth bond.

You will also see the price of having no feedback: the output wanders with the battery voltage.`,
        lecture: `### Why a transformer?

A bridge can only produce ±V_dc. To reach 230 V from 12 V the voltage must be stepped up, ideally by n = 230/12 ≈ 19, slightly more to cover drops. A 50 Hz transformer does this. It also provides [[galvanic-isolation|galvanic isolation]]: the output has no conducting connection to the battery.

### The transformer must not saturate

A square voltage V applied to a winding of N turns makes the core flux ramp linearly during each half-period. Faraday's law, V = N·dΦ/dt, gives a peak flux density

B_pk = V / (4·f·N·A)

where A is the core cross-section. If B_pk exceeds what the iron can carry (about 1.2–1.5 T for laminated silicon steel, typical), the core [[saturation|saturates]]. The [[magnetising-current]] then rises steeply and can destroy the switches. This sets the minimum number of primary turns.

### The DC bus capacitor

The transformer primary draws large currents that reverse every half-cycle. The battery cables have inductance, so the switching current is supplied locally by the bus capacitor, placed close to the bridge. It also absorbs the voltage spike when the switches turn off. Watch the polarity: an electrolytic connected backwards fails, sometimes violently.

### Output protection and earthing

The secondary connects to the load through a two-pole output breaker, which disconnects both line and neutral. The neutral is bonded to [[protective-earth]]. In a real installation an [[rcd]] would also be fitted.

### The unregulated output

With no feedback, V_out ≈ n·(V_dc − drop)·(1 − r_x). The ratio is designed at the nominal 12 V, so:

| Battery | Output (approximate) |
|---|---|
| 10.5 V (cut-off) | about −12 % |
| 12 V (nominal) | 230 V |
| 14.4 V (charging) | about +20 % |

The test suite's "input voltage variation" tests measure this, and the line-regulation criterion for unregulated designs allows ±25 %. Lamps and heaters tolerate it. Electronics may not.`,
        technical: `**Why 4·f in B = V/(4fNA)?** During a half-period T/2 the flux changes by 2·B_pk·A (from −B_pk to +B_pk) under a constant voltage V, so V·T/2 = N·2·B_pk·A, which gives B_pk = V/(4·f·N·A). For a sine wave the same reasoning gives the familiar V_rms = 4.44·f·N·A·B_pk.

**Never apply DC to a transformer.** If one half-cycle is longer, or one switch has a larger drop, the flux "walks" in one direction with every cycle until the core saturates. Real square-wave drivers keep the two half-cycles exactly equal. Troubleshooting task E shows what happens when a winding half is lost.

**Magnetising current in the model.** The simulator represents the core by a magnetising inductance L_m, derived from a typical 3 % magnetising current. It does not model saturation, so a flux walk appears as a growing current rather than a collapse.

**No-load consumption.** The no-load test measures the input current with the load removed. It is the sum of the magnetising current, the switch and core losses, and the control supply.`,
        diagrams: [
          { id: 'inverter-blocks', caption: 'Block structure of the square-wave inverter.' },
          { id: 'schematic:bld-b', caption: 'Project B as assembled: input, bus, bridge, transformer and output.' },
        ],
        formulas: [
          { name: 'Peak flux density (square drive)', expr: 'B_pk = V / (4 · f · N · A)', where: [['B_pk', 'peak flux density', 'T'], ['V', 'primary voltage', 'V'], ['N', 'primary turns', '—'], ['A', 'core cross-section', 'm²']] },
          { name: 'Unregulated output', expr: 'V_out ≈ n · (V_dc − drop) · (1 − r_x)', where: [['r_x', 'transformer resistive regulation', '—']] },
        ],
        examples: [
          {
            title: 'Primary turns for a 50 Hz core',
            problem: 'A core has a cross-section of 20 cm². Using B_pk = 1.2 T, how many primary turns are needed for a 12 V square wave at 50 Hz? How many secondary turns for n = 21.2?',
            steps: ['A = 20 cm² = 0.0020 m²', 'N_p = V / (4 · f · A · B_pk) = 12 / (4 × 50 × 0.0020 × 1.2) = 12 / 0.48 = 25 turns', 'N_s = 21.2 × 25 = 530 turns'],
            answer: '25 primary turns and 530 secondary turns. The primary carries about 45 A, so it is wound with thick copper.',
            check: 'With the battery at 14.4 V the flux rises to 1.2 × 14.4/12 = 1.44 T, so the core must still be below saturation there. ✓',
          },
          {
            title: 'Output at the ends of the battery range',
            problem: 'Project B is designed for 230 V at 12 V. Ignoring the change in drop, estimate the output at 10.5 V and at 14.4 V.',
            steps: ['V_out ∝ V_dc: 230 × 10.5/12 = 201 V', '230 × 14.4/12 = 276 V'],
            answer: 'From about 201 V to 276 V (−12.5 % to +20 %). Lamps visibly brighten while the battery charges.',
          },
        ],
        applications: `Older low-cost inverters and UPS units used exactly this topology, as did emergency lighting inverters. The same 50 Hz transformer, with a bridge, is still the heart of robust "low-frequency" inverters that use SPWM. Their heavy transformers are prized for surge capacity.`,
        mistakes: [
          { mistake: 'Using fewer primary turns to “get more voltage”.', correction: 'Fewer turns raise the flux density; the core saturates and the switches fail. Voltage ratio comes from the turns ratio, not from fewer turns.' },
          { mistake: 'Connecting the bus electrolytic with reversed polarity.', correction: 'Its + terminal must go to the fused positive bus; the assembly step checks it.' },
          { mistake: 'Expecting an unregulated inverter to give 230 V at any battery voltage.', correction: 'V_out follows V_dc; only feedback (projects D, F, G, H) holds it constant.' },
        ],
        demo: {
          title: 'Run the line-voltage tests',
          text: 'Run project B’s suite and compare the “low battery” and “charging battery” readings with the prediction above.',
          link: to.build('Open project B', 'bld-b'),
        },
        activities: [to.ckt('Transformer connection exercise', 'ckt-07'), to.lab3d('The SQ-1K transformer', 'sq1k', 't1'), to.proc('Test transformer windings', 'transformer', 'xfmr-winding'), to.lib('Electrolytic bus capacitors', 'capacitor')],
        check: [
          { id: 'k1', type: 'numeric', prompt: 'Primary turns for 24 V, 50 Hz, A = 25 cm², B_pk = 1.2 T?', answer: 40, tol: 0.01, unit: '', explain: '24/(4 × 50 × 0.0025 × 1.2) = 24/0.6 = 40 turns.' },
          { id: 'k2', type: 'mcq', prompt: 'What happens if the primary of a 50 Hz transformer has too few turns?', options: ['The core saturates and the magnetising current rises steeply', 'The output voltage doubles safely', 'The frequency changes', 'Nothing'], answer: 0, explain: 'B_pk ∝ 1/N; too few turns exceed the core’s flux limit.' },
          { id: 'k3', type: 'numeric', prompt: 'An unregulated inverter gives 230 V at 24 V. Approximate output at 28.8 V (V)?', answer: 276, tol: 0.01, unit: 'V', explain: '230 × 28.8/24 = 276 V.' },
          { id: 'k4', type: 'mcq', prompt: 'Why is the bus capacitor placed close to the bridge?', options: ['The battery cables’ inductance cannot supply fast switching currents', 'To filter the 50 Hz output', 'To isolate the output', 'To reduce transformer turns'], answer: 0, explain: 'Local energy storage supplies the fast current edges and absorbs spikes.' },
        ],
        summary: [
          'The transformer steps the bridge voltage up (n ≈ V_out/V_dc) and isolates the output.',
          'B_pk = V/(4fNA) sets the minimum primary turns; saturation destroys switches.',
          'The bus capacitor supplies switching currents locally; observe its polarity.',
          'Output breaker (two-pole) and neutral–earth bond protect the output side.',
          'Without feedback the output follows the battery: about −12 % to +20 %.',
        ],
        homework: {
          id: 'S1.M2.L2.hw',
          title: 'A 60 Hz, 120 V square-wave inverter',
          brief: '24 V battery, 120 V output at 60 Hz, core 16 cm², B_pk = 1.3 T. Effective primary voltage after drops 23 V, r_x = 0.025.',
          tasks: [
            { id: 'h1', type: 'numeric', prompt: 'Primary turns (round up)?', answer: 49, tol: 0.03, unit: '', explain: '24/(4 × 60 × 0.0016 × 1.3) = 24/0.4992 = 48.1 → 49 turns (use the maximum battery voltage in a careful design).' },
            { id: 'h2', type: 'numeric', prompt: 'Turns ratio for 120 V?', answer: 5.35, tol: 0.01, unit: '', explain: '120/(23 × 0.975) = 5.35.' },
            { id: 'h3', type: 'numeric', prompt: 'Output while charging at 28.8 V (approx., V)?', answer: 144, tol: 0.02, unit: 'V', explain: '120 × 28.8/24 = 144 V.' },
          ],
          written: [{ prompt: 'The turns in h1 were calculated at 24 V. Should a real design use the charging voltage instead? Explain.', model: 'Yes: the flux is highest at the highest battery voltage (28.8 V), so N_p should be calculated there (≈ 58 turns) to avoid saturation while charging.' }],
        },
      },
    },
    {
      id: 'S1.M2.L3',
      title: 'The modified sine-wave inverter (project C)',
      minutes: 45,
      legacyId: 'bld-c',
      content: {
        objectives: [
          'Explain how delaying one bridge leg creates a three-level (+V, 0, −V) output.',
          'Derive the RMS value of a stepped wave from its conduction angle.',
          'Calculate the harmonic content and THD of a stepped wave, and show that it is lowest near 120°.',
          'Assemble and test project C, and identify a phase-setting fault from its measurements.',
        ],
        introduction: `"Modified sine wave" is a marketing name for a [[quasi-square]] wave: a square wave with a rest at zero between pulses. It is made by the same H-bridge as project B, with one change: leg B switches a fixed time after leg A. The result has the peak *and* RMS of a sine wave, which suits many loads better. It is, however, still far from a sine, and this lesson shows exactly how far.`,
        lecture: `### Phase-shift control

Drive leg A with a 50 % square wave and leg B with the same wave delayed by φ.

- While the legs are in *different* states, the load sees ±V.
- While they are in the *same* state, both midpoints sit on the same rail, so the load sees 0. Current freewheels through the two high-side or two low-side switches.

The output is non-zero for δ = φ degrees of each half-cycle: the [[conduction-angle]]. φ = 180° (legs exactly opposite) gives a square wave. φ = 90° gives pulses 90° wide.

### Choosing δ for the right peak and RMS

The transformer ratio is chosen so that the pulse height equals the *peak* of the desired sine: √2 × 230 = 325 V. The RMS of a stepped wave is

V_rms = V_pk · √(δ/180°)

To make this equal 230 V we need √(δ/180) = 1/√2, so **δ = 90°**. Lamps, heaters and many simple power supplies (which charge a capacitor to the peak) then behave as on mains.

### What the harmonics do

The Fourier series of a stepped wave contains only odd harmonics, with amplitudes

V_k ∝ sin(k·δ/2) / k

| δ | THD | Notes |
|---|---|---|
| 180° (square) | 48.3 % | — |
| 90° | 48.3 % | Same THD as a square wave: the RMS is right, but the distortion is not reduced |
| 120° | 31 % (the minimum) | The 3rd harmonic vanishes (sin 180° = 0), and all multiples of 3 with it; for the same pulse height the RMS is then 265 V |

This surprises many people, so the project's waveform test measures it. Its criterion compares the measured [[thd|THD]] and [[crest-factor]] with this theory for the design's conduction angle.

### Project C in the laboratory

The gate-drive generators of leg B (G3, G4) have their *phase* parameter set to 90°. The test suite measures RMS, crest factor (√2 at 90°) and THD. Troubleshooting task C asks you to find a fault from its readings: a crest factor of 1.0 and an output 40 % too high.`,
        technical: `**Deriving the RMS.** Over a half-cycle the wave is V for δ degrees and 0 for 180° − δ. Mean square = V²·δ/180, so V_rms = V·√(δ/180).

**Deriving the harmonics.** For a pulse of width δ centred in each half-cycle, b_k = (4V/(kπ))·sin(kδ/2) for odd k. The fundamental is V₁,rms = (4V/π)·sin(δ/2)/√2, and THD = √(V_rms² − V₁,rms²)/V₁,rms.

At δ = 90°:

- V_rms² = V²/2 and V₁,rms = 0.9003·V·sin 45° = 0.6366·V;
- THD = √(0.5 − 0.4053)/0.6366 = 0.483.

At δ = 120°:

- V_rms² = 2V²/3 and V₁,rms = 0.9003·V·sin 60° = 0.7797·V;
- THD = √(0.6667 − 0.6079)/0.7797 = 0.311.

**Bus sag raises the crest factor.** During each pulse the battery and bus capacitor sag under the load current, and they recover during the zero interval. The peak at the start of the pulse is therefore slightly higher than the average pulse height, and the measured crest factor is a little above √2. The test allows ±15 %.

**Better waveforms.** More steps (multilevel inverters) or SPWM (module S1.M3) are needed to approach a sine.`,
        diagrams: [
          { id: 'quasi-square', caption: 'Stepped waves for different conduction angles, with their RMS, crest factor and THD.' },
          { id: 'schematic:bld-c', caption: 'Project C: the same bridge as B, with leg B phase-delayed.' },
        ],
        formulas: [
          { name: 'RMS of a stepped wave', expr: 'V_rms = V_pk · √(δ / 180°)', where: [['δ', 'conduction angle per half-cycle', '°'], ['V_pk', 'pulse height', 'V']] },
          { name: 'Harmonic amplitudes', expr: 'V_k,pk = (4·V_pk / (k·π)) · sin(k·δ/2),  k odd', where: [['k', 'harmonic order', '—']] },
          { name: 'THD', expr: 'THD = √(V_rms² − V₁,rms²) / V₁,rms', where: [['V₁,rms', 'RMS of the fundamental', 'V']] },
        ],
        examples: [
          {
            title: 'RMS and fundamental at 90°',
            problem: 'A modified sine has a 325 V pulse height and δ = 90°. Find V_rms, the fundamental (RMS) and the THD.',
            steps: ['V_rms = 325 × √(90/180) = 325 × 0.7071 = 229.8 V', 'V₁,pk = (4 × 325/π) × sin 45° = 413.8 × 0.7071 = 292.6 V → V₁,rms = 206.9 V', 'THD = √(229.8² − 206.9²)/206.9 = √(52 808 − 42 808)/206.9 = 100.0/206.9 = 48.3 %'],
            answer: 'The output reads 230 V on a true-RMS meter, but only 207 V of it is at 50 Hz; THD is 48.3 %.',
          },
          {
            title: 'Harmonic spectrum at 120°',
            problem: 'Compare the 3rd, 5th and 7th harmonics with the fundamental for δ = 120°.',
            steps: ['Relative amplitude V_k/V₁ = sin(k·60°) / (k·sin 60°)', 'k = 3: sin 180° = 0 → 0 %', 'k = 5: |sin 300°|/(5 × 0.866) = 0.866/4.33 = 20 %', 'k = 7: sin 420° = sin 60° → 1/7 = 14.3 %'],
            answer: 'No 3rd harmonic at all, 20 % 5th and 14 % 7th: this is why 120° gives the lowest THD of a stepped wave.',
          },
        ],
        applications: `Most low-cost inverters sold for vehicles and small homes are modified sine. They run lamps, heaters, phone chargers and many laptop supplies. They can make motors, fans and fluorescent ballasts hot and noisy. Some electronics with sensitive timing, and audio equipment, can also misbehave on them.`,
        mistakes: [
          { mistake: '“A modified sine has low distortion.”', correction: 'At 90° its THD equals a square wave’s (48 %). It has the right peak and RMS, not the right shape.' },
          { mistake: 'Setting the leg-B delay to 180°.', correction: 'That makes the legs complementary: a square wave whose RMS equals the 325 V peak (40 % high).' },
          { mistake: 'Measuring the output with an average-responding meter.', correction: 'Average-responding meters are calibrated for sine waves and misread stepped waves; use a true-RMS meter or the simulator’s RMS reading.' },
        ],
        demo: {
          title: 'Vary the conduction angle',
          text: 'Use the stepped-wave explorer to move δ from 60° to 180°, and watch the RMS, crest factor, spectrum and THD. Find the minimum THD.',
          link: to.build('Open project C', 'bld-c'),
          embed: 'quasi-square',
        },
        activities: [to.sim('Square-wave and modified-sine inverter', 'sim-09'), to.lab3d('Microcontroller timing in the LF-3K', 'lf3k', 'u6'), to.build('Troubleshoot project C', 'bld-c')],
        check: [
          { id: 'k1', type: 'numeric', prompt: 'RMS of a stepped wave with V_pk = 170 V and δ = 120° (V)?', answer: 138.8, tol: 0.01, unit: 'V', explain: '170 × √(120/180) = 170 × 0.8165 = 138.8 V.' },
          { id: 'k2', type: 'mcq', prompt: 'At which conduction angle is the 3rd harmonic eliminated?', options: ['120°', '90°', '60°', '180°'], answer: 0, explain: 'sin(3 × 120°/2) = sin 180° = 0.' },
          { id: 'k3', type: 'mcq', prompt: 'A “modified sine” inverter reads 325 V rms and a crest factor of 1.0. The likely cause is…', options: ['Leg B delayed by 180° (square wave)', 'A missing filter capacitor', 'A blown fuse', 'A shorted load'], answer: 0, explain: 'Crest factor 1 means no zero step; with the sine-peak transformer ratio the RMS equals 325 V.' },
          { id: 'k4', type: 'numeric', prompt: 'THD of a stepped wave at δ = 90° (%)?', answer: 48.3, tol: 0.01, unit: '%', explain: 'Same as a square wave, 48.3 %.' },
        ],
        summary: [
          'Phase-shifting leg B by δ gives a +V, 0, −V, 0 output of conduction angle δ.',
          'V_rms = V_pk·√(δ/180°); δ = 90° gives the sine-wave peak and RMS together.',
          'Harmonics ∝ sin(kδ/2)/k: THD is 48.3 % at 90° and minimum (31 %) at 120°, where the 3rd vanishes.',
          '“Modified sine” suits resistive loads and simple supplies, not motors.',
          'Measure stepped waves with true-RMS instruments.',
        ],
        homework: {
          id: 'S1.M2.L3.hw',
          title: 'Stepped-wave analysis for a 120 V inverter',
          brief: 'A 120 V, 60 Hz modified-sine inverter has a pulse height of 170 V.',
          tasks: [
            { id: 'h1', type: 'numeric', prompt: 'Conduction angle that gives 120 V rms (°)?', answer: 89.7, tol: 0.01, unit: '°', explain: 'δ = 180 × (120/170)² = 180 × 0.498 = 89.7°.' },
            { id: 'h2', type: 'numeric', prompt: 'Duration of each pulse at 60 Hz (ms)?', answer: 4.15, tol: 0.02, unit: 'ms', explain: 'Half-period 8.33 ms × 89.7/180 = 4.15 ms.' },
            { id: 'h3', type: 'numeric', prompt: 'RMS if δ were 120° with the same 170 V pulses (V)?', answer: 138.8, tol: 0.01, unit: 'V', explain: '170 × √(2/3) = 138.8 V.' },
          ],
          written: [{ prompt: 'A customer complains their fan buzzes on this inverter. Explain why and what you would recommend.', model: 'The stepped output contains large 3rd, 5th and 7th harmonics (THD ≈ 48 %), which cause extra current, heating, torque ripple and noise in the motor. Recommend a pure sine-wave inverter for motor loads.' }],
        },
      },
    },
  ],
  quiz: {
    pass: 0.7,
    questions: [
      { id: 'q1', type: 'mcq', prompt: 'Which state of the H-bridge must never occur?', options: ['Q1 and Q2 on together', 'Q1 and Q4 on together', 'Q2 and Q4 on together', 'All switches off'], answer: 0, explain: 'Q1 + Q2 shorts the battery (shoot-through).' },
      { id: 'q2', type: 'numeric', prompt: 'RMS of the fundamental of a ±12 V square wave (V)?', answer: 10.8, tol: 0.01, unit: 'V', explain: '0.9003 × 12 = 10.80 V.' },
      { id: 'q3', type: 'numeric', prompt: 'B_pk for 12 V square drive, 50 Hz, N = 30, A = 18 cm² (T)?', answer: 1.111, tol: 0.02, unit: 'T', explain: '12/(4 × 50 × 30 × 0.0018) = 12/10.8 = 1.11 T.' },
      { id: 'q4', type: 'mcq', prompt: 'An unregulated square-wave inverter designed at 12 V will, at 14.4 V, give about…', options: ['+20 % output', 'the same output', '−20 % output', 'no output'], answer: 0, explain: 'V_out ∝ V_dc: 14.4/12 = 1.2.' },
      { id: 'q5', type: 'mcq', prompt: 'The conduction angle giving a modified sine the RMS of a sine with the same peak is…', options: ['90°', '120°', '60°', '180°'], answer: 0, explain: '√(δ/180) = 1/√2 → δ = 90°.' },
      { id: 'q6', type: 'mcq', prompt: 'The minimum THD of a stepped (quasi-square) wave occurs near…', options: ['120°', '90°', '180°', '45°'], answer: 0, explain: 'At 120° the 3rd harmonic vanishes; THD ≈ 31 %.' },
      { id: 'q7', type: 'mcq', prompt: 'Why must a square-wave transformer driver keep both half-cycles exactly equal?', options: ['Any DC component walks the flux into saturation', 'To keep the frequency at 50 Hz', 'To reduce THD', 'For the breaker'], answer: 0, explain: 'A net volt-second imbalance accumulates flux each cycle.' },
      { id: 'q8', type: 'multi', prompt: 'Which statements about project assessment are true? (select all)', options: ['Steps are checked on the electrical connection graph', 'Placing parts near the right place completes a step', 'A project is complete only when its simulated tests pass', 'Completion needs the correct electrical behaviour, not just the layout'], answers: [0, 2, 3], explain: 'The laboratory verifies connections and simulated behaviour, never placement alone.' },
    ],
  },
  assignment: {
    id: 'S1.M2.asg',
    title: 'Module assignment: compare three waveforms for one load',
    brief: 'A 230 V, 100 W incandescent lamp (resistive, 529 Ω) is supplied from (a) a 230 V square wave, (b) a modified sine with 325 V pulses at 90°, (c) a pure sine of 230 V.',
    tasks: [
      { id: 'a1', type: 'numeric', prompt: 'Power in the lamp from the 230 V square wave (W)?', answer: 100, tol: 0.01, unit: 'W', explain: 'Square RMS = 230 V → 230²/529 = 100 W.' },
      { id: 'a2', type: 'numeric', prompt: 'Power from the modified sine (W)?', answer: 99.8, tol: 0.01, unit: 'W', explain: 'V_rms = 229.8 V → 99.8 W.' },
      { id: 'a3', type: 'numeric', prompt: 'Fundamental RMS of the 230 V square wave (V)?', answer: 207.1, tol: 0.01, unit: 'V', explain: '0.9003 × 230 = 207.1 V.' },
      { id: 'a4', type: 'numeric', prompt: 'Peak voltage of the square wave (V)?', answer: 230, tol: 0.01, unit: 'V', explain: 'Square: peak = RMS = 230 V (a sine of 230 V rms peaks at 325 V).' },
    ],
    written: [{ prompt: 'A phone charger works on the modified sine but runs warm and its output sags on the square wave. Use peak voltages to explain why.', model: 'Simple chargers rectify to the peak and smooth with a capacitor. The modified sine has a 325 V peak like mains, so the charger sees its normal DC bus. The 230 V square wave peaks at only 230 V, so the charger’s internal bus is about 30 % low; it draws more current to compensate and runs warm, or its output sags.' }],
  },
  practicals: [
    { id: 'S1.M2.P1', title: 'Build project A', description: 'Assemble the basic DC-to-AC inverter and pass its test suite.', link: to.build('Project A', 'bld-a'), evidence: { kind: 'project', id: 'bld-a' } },
    { id: 'S1.M2.P2', title: 'Build project B', description: 'Assemble the square-wave inverter and pass its test suite.', link: to.build('Project B', 'bld-b'), evidence: { kind: 'project', id: 'bld-b' } },
    { id: 'S1.M2.P3', title: 'Build project C', description: 'Assemble the modified sine-wave inverter and pass its test suite.', link: to.build('Project C', 'bld-c'), evidence: { kind: 'project', id: 'bld-c' } },
  ],
}
