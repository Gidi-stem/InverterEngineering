import type { AcademyModule } from '../types'
import { to } from './links'

/** S1.M4 Transformer and high-frequency topologies (projects E, F). */
export const S1_M4: AcademyModule = {
  id: 'S1.M4',
  title: 'Transformer and high-frequency topologies',
  summary: 'Two alternatives to the low-frequency full bridge: the push-pull inverter with a centre-tapped transformer, and the high-frequency inverter that uses a small ferrite transformer and a high-voltage DC bus.',
  lessons: [
    {
      id: 'S1.M4.L1',
      title: 'The push-pull transformer inverter (project E)',
      minutes: 45,
      legacyId: 'bld-e',
      content: {
        objectives: [
          'Explain how two low-side switches and a centre-tapped primary produce an alternating flux.',
          'Derive the 2·V_dc voltage stress on push-pull switches, and estimate turn-off spikes from leakage inductance.',
          'Compare push-pull and full-bridge designs for part count, drive, stress and transformer utilisation.',
          'Assemble and test project E and diagnose a lost half-winding.',
        ],
        introduction: `The [[push-pull]] inverter reaches the same result as project B with half the switches. The battery positive feeds the [[centre-tap]] of the primary. Two MOSFETs, both on the negative rail, connect one end of the winding or the other to the negative. Each switch drives "its" half of the winding in turn, so the flux in the core alternates. Simplicity has a price, which this lesson quantifies.`,
        lecture: `### How it works

- **Q1 on:** current flows from the centre tap through the upper half-winding to Q1. The upper half has +V_dc across it, in the direction that makes the secondary positive.
- **Q2 on:** current flows through the lower half the other way, and the secondary goes negative.

The halves are wound so that their fluxes oppose. Alternating Q1 and Q2 at 50 Hz therefore gives an alternating flux and a square-wave secondary, exactly as in project B.

### Why each switch sees twice the battery voltage

The two halves are on the same core, so they are tightly coupled. When Q1 drives the upper half with V_dc, the lower half has the same V_dc *induced* in it, in series with the battery. The drain of the off switch Q2 therefore sits at V_dc + V_dc = **2·V_dc**. At 14.4 V charging that is 28.8 V. With the 1.5× margin, a 12 V push-pull needs switches rated above 43 V; the configurator applies this automatically.

### Leakage inductance and turn-off spikes

The two half-windings are never perfectly coupled. The uncoupled part, the *leakage inductance* L_lk, stores energy that has nowhere to go when the switch turns off, so the drain voltage spikes: V = L_lk·di/dt. Real push-pull designs need:

- a **clamp** or **snubber** (an RC network, or a diode to a clamp capacitor);
- switches with avalanche rating;
- very tightly coupled (interleaved) windings.

### Comparison with the full bridge

| | Push-pull | Full bridge |
|---|---|---|
| Switches | 2 | 4 |
| Gate drive | Low side only: simple, cheap | Two floating high-side drivers |
| Switch voltage stress | 2·V_dc (+ spikes) | V_dc |
| Primary | Centre-tapped; each half carries current only half the time (poorer copper use) | Single winding used all the time |
| Flux balance | Any mismatch between halves gives a DC flux and walks the core to saturation | Easier to balance |

Push-pull suits low battery voltages and low to medium power. It is also the classic topology for the high-frequency first stage of project F.`,
        technical: `**Copper utilisation.** Each half-winding carries the full current for half of each cycle, so its RMS current is I_pk/√2 for a square wave (compared with I_pk for a full-bridge primary). The copper loss per half is (I_pk/√2)²·R_half. Both halves together need about √2 times the copper of a single full-bridge winding for the same loss.

**Flux walking.** If Q1's on-time or on-voltage differs slightly from Q2's, the volt-seconds applied to the core differ, and the difference accumulates every cycle. Current-mode control, or careful symmetry, prevents it. Troubleshooting task E (one half disconnected) is the extreme case: only one direction is ever driven.

**Model limits.** The simulator models the centre-tapped transformer with ideal coupling and a magnetising inductance. Leakage inductance and the resulting spikes are *not* modelled, so in simulation the off switch sits cleanly at 2·V_dc. Real hardware does not.`,
        diagrams: [
          { id: 'push-pull', caption: 'Push-pull current paths for each half-cycle, and the 2·V_dc stress on the off switch.' },
          { id: 'schematic:bld-e', caption: 'Project E as assembled.' },
        ],
        formulas: [
          { name: 'Off-switch voltage', expr: 'V_DS,off = 2 · V_dc  (+ L_lk · di/dt at turn-off)', where: [['V_dc', 'battery voltage', 'V'], ['L_lk', 'leakage inductance', 'H']] },
          { name: 'Turn-off spike', expr: 'V_spike ≈ L_lk · I / t_off', where: [['I', 'current at turn-off', 'A'], ['t_off', 'turn-off time', 's']] },
          { name: 'Switch rating', expr: 'V_DSS ≥ 1.5 · 2 · V_max', where: [['V_max', 'highest battery voltage', 'V']] },
        ],
        examples: [
          {
            title: 'Voltage stress in a 12 V push-pull',
            problem: 'A 12 V push-pull inverter has V_max = 14.4 V. Find the steady off-state voltage and the minimum switch rating.',
            steps: ['V_DS,off = 2 × 14.4 = 28.8 V', 'V_DSS ≥ 1.5 × 28.8 = 43.2 V → a 60 V class device'],
            answer: '28.8 V steady, rated above 43 V. A full bridge on the same battery needs only 21.6 V.',
          },
          {
            title: 'How big is the leakage spike?',
            problem: 'L_lk = 0.2 µH, the switch turns off 40 A in 100 ns. Estimate the spike.',
            steps: ['V_spike ≈ 0.2 × 10⁻⁶ × 40 / 100 × 10⁻⁹ = 80 V', 'Drain voltage ≈ 28.8 + 80 = 109 V, without a clamp'],
            answer: 'About 110 V on a 60 V switch: it would avalanche or fail. A clamp or snubber is essential in real push-pull hardware, even though the simulation does not show the spike.',
          },
        ],
        applications: `Push-pull stages are common in low-voltage DC-DC converters, in the first stage of many high-frequency inverters, and in older 12 V square-wave inverters, which are often built around an SG3525 PWM controller. The library's PWM-controller entry describes it.`,
        mistakes: [
          { mistake: 'Choosing push-pull switches rated just above the battery voltage.', correction: 'They see 2·V_dc plus spikes: rate them above 3·V_max.' },
          { mistake: 'Connecting the battery positive to one end of the primary.', correction: 'It goes to the centre tap; the switches pull the ends to the negative rail.' },
          { mistake: 'Trusting the clean simulated drain waveform.', correction: 'Leakage inductance is not modelled; real hardware needs a clamp or snubber.' },
        ],
        demo: {
          title: 'Measure the 2·V_dc stress',
          text: 'Build project E and probe the drain of the off switch during each half-cycle. Then run its troubleshooting task, with one half of the primary disconnected.',
          link: to.build('Open project E', 'bld-e'),
        },
        activities: [to.lib('PWM controller (push-pull outputs)', 'pwm-controller'), to.lab3d('SQ-1K transformer and heat sink', 'sq1k', 't1'), to.cmp('Transformer versus inductor', 'transformer-vs-inductor')],
        check: [
          { id: 'k1', type: 'numeric', prompt: 'Steady off-state voltage of a 24 V push-pull switch at V_max = 28.8 V (V)?', answer: 57.6, tol: 0.01, unit: 'V', explain: '2 × 28.8 = 57.6 V.' },
          { id: 'k2', type: 'mcq', prompt: 'The main advantage of push-pull over a full bridge is…', options: ['Only low-side gate drive is needed', 'Lower switch voltage stress', 'Better copper utilisation', 'No transformer'], answer: 0, explain: 'Both switches sit on the negative rail.' },
          { id: 'k3', type: 'numeric', prompt: 'Spike from L_lk = 0.5 µH turning off 20 A in 200 ns (V)?', answer: 50, tol: 0.01, unit: 'V', explain: '0.5 × 10⁻⁶ × 20 / 2 × 10⁻⁷ = 50 V.' },
          { id: 'k4', type: 'mcq', prompt: 'If one half of a push-pull primary is disconnected, the core…', options: ['is driven in one direction only and its flux walks towards saturation', 'works normally at half power', 'doubles its output', 'is unaffected'], answer: 0, explain: 'Only one polarity of volt-seconds is applied.' },
        ],
        summary: [
          'Battery to the centre tap; two low-side switches alternately drive each half-winding.',
          'Off-switch stress is 2·V_dc, plus leakage spikes; rate switches above 3·V_max.',
          'Simple gate drive and fewer switches; poorer copper use and flux-balance sensitivity.',
          'Real hardware needs clamps or snubbers; the simulation omits leakage inductance.',
          'Push-pull is the classic high-frequency first stage (project F).',
        ],
        homework: {
          id: 'S1.M4.L1.hw',
          title: 'Push-pull switch selection',
          brief: 'A 24 V push-pull, 300 W square-wave inverter. V_max = 28.8 V. Leakage spike estimate: 0.1 µH, 15 A turned off in 80 ns.',
          tasks: [
            { id: 'h1', type: 'numeric', prompt: 'Minimum V_DSS with the 1.5 × 2 × V_max rule (V)?', answer: 86.4, tol: 0.01, unit: 'V', explain: '1.5 × 2 × 28.8 = 86.4 V → 100 V class.' },
            { id: 'h2', type: 'numeric', prompt: 'Spike voltage (V)?', answer: 18.75, tol: 0.01, unit: 'V', explain: '0.1 × 10⁻⁶ × 15 / 80 × 10⁻⁹ = 18.75 V.' },
            { id: 'h3', type: 'numeric', prompt: 'Peak drain voltage with the spike (V)?', answer: 76.35, tol: 0.01, unit: 'V', explain: '57.6 + 18.75 = 76.35 V: within a 100 V rating.' },
          ],
          written: [{ prompt: 'Would you choose push-pull or a full bridge for a 48 V, 3 kW inverter? Explain.', model: 'A full bridge: at 48 V the push-pull switches would see about 115 V plus spikes (needing 200 V parts with higher R_DS(on)), and at 3 kW the poorer copper use and flux balance become significant. Push-pull’s simpler drive does not outweigh this.' }],
        },
      },
    },
    {
      id: 'S1.M4.L2',
      title: 'The high-frequency inverter and the HV DC bus (project F)',
      minutes: 55,
      legacyId: 'bld-f',
      content: {
        objectives: [
          'Explain why a higher frequency allows a much smaller transformer.',
          'Trace the two-stage power path: HF push-pull → ferrite transformer → fast rectifier → HV DC bus → HV SPWM bridge → LC filter.',
          'Calculate the HF link ratio, the HV bus voltage and the currents on each side.',
          'Apply the HV DC bus safety rules: ratings, bleeder, discharge time and proving dead.',
        ],
        introduction: `A 1 kW, 50 Hz transformer weighs around 8–10 kg (a typical figure); it is the heaviest part of projects B to E. The high-frequency inverter replaces it with a [[ferrite]] transformer of a few hundred grams. The trick is to do the voltage step-up at kilohertz, rectify it to a high-voltage DC bus, and only then make the 50 Hz sine. The cost is two power stages and a hazardous ~360 V DC bus inside the box.`,
        lecture: `### Why frequency shrinks the transformer

From lesson S1.M2.L2, the peak flux density is B_pk = V/(4·f·N·A). For a given core material (fixed B_pk) and voltage, the product N·A, turns times core area, is inversely proportional to frequency. Going from 50 Hz to 10 kHz (200×) allows a core and winding roughly 200× "smaller" in N·A.

Ferrite carries less flux than steel (about 0.2–0.3 T at these frequencies, typical) but has much lower losses at kHz. Steel laminations would overheat from eddy currents at 10 kHz.

### The two-stage power path

| Stage | Parts | What it does |
|---|---|---|
| **1. HF push-pull** | Q1, Q2 | Drive a centre-tapped ferrite transformer T1 at f_link (10 kHz in the simulation; commercial designs use 20–100 kHz) |
| **2. Rectifier and HV bus** | D1–D4 (fast diodes), C3 | Rectify the secondary into the HV bus C3, about 360 V. A [[bleeder]] R1 discharges it when switched off |
| **3. HV SPWM bridge** | Q3–Q6 (600 V class) | Make SPWM from the HV bus. No output transformer is needed: the bus is already above the 325 V peak |
| **4. Filter, output and feedback** | L1, C2, CB1, VS1 | As in project D |

### Designing the HV bus

The bridge must reach 325 V peak with m ≤ 0.95, so V_bus,min = √2·230/0.95 ≈ 342 V at the lowest battery voltage. The link transformer ratio is

n_link = (V_bus,min + 2·V_f) / (V_min − drop)

for two diode drops V_f. At higher battery voltages the bus rises (it is unregulated in this design), and the SPWM regulator reduces m.

### Currents on each side

Power is the same on both sides, minus losses. With a 48 V battery and a 360 V bus:

- the battery side carries about 22 A;
- the HV side carries about 3 A.

The HV switches need high voltage ratings but modest current ratings: an [[igbt]] or a 600 V MOSFET.

### The hazard

The HV bus holds tens of joules at a lethal voltage, and it stays charged after switch-off unless a bleeder or active discharge empties it. Rules:

1. **Rate** the capacitor ≥ 1.25 × V_bus,max, and the diodes and switches above the bus with margin.
2. **Fit a bleeder** and calculate its discharge time (lesson S1.M1.L1).
3. **Label** the discharge time.
4. **Measure before touching**, every time.

In this course the HV bus exists only in simulation.`,
        technical: `**Fast diodes.** At 10 kHz the rectifier commutates 20 000 times a second. An ordinary 50 Hz rectifier diode keeps conducting backwards for microseconds at each reversal (reverse-recovery charge), dumping energy each time. Fast or ultrafast recovery diodes, or silicon-carbide Schottky diodes, are required. The compatibility check flags slow diodes.

**Area-product method.** Transformer designers size cores by the area product A_e·A_w (core area × window area). It is proportional to the power handled divided by f·B·J (J = current density). This is the formal version of "higher frequency gives a smaller core".

**Simulation choices.** The simulation runs the link at 5–10 kHz with a 1 µs time step so that the test suite finishes in seconds. Commercial designs run faster (and smaller), with soft-switching techniques that are beyond this course.

**The bus is not regulated here.** Project F's HV bus follows the battery: n_link × (V_dc − drop). A commercial design regulates the bus with its first stage, by controlling the push-pull duty.`,
        diagrams: [
          { id: 'hf-link', caption: 'Two-stage power path of the high-frequency inverter, with the hazardous HV DC bus marked.' },
          { id: 'schematic:bld-f', caption: 'Project F as assembled.' },
        ],
        formulas: [
          { name: 'Turns for a given core', expr: 'N = V / (4 · f · A · B_pk)', where: [['A', 'core cross-section', 'm²'], ['B_pk', 'peak flux density', 'T']] },
          { name: 'Minimum HV bus', expr: 'V_bus,min = √2 · V_out / m_max', where: [['m_max', 'maximum modulation index (0.95)', '—']] },
          { name: 'Link ratio', expr: 'n_link = (V_bus,min + 2·V_f) / (V_min − drop)', where: [['V_f', 'rectifier forward voltage', 'V']] },
          { name: 'Current on each side', expr: 'I_dc ≈ P_in / V_dc,  I_bus ≈ P_out / V_bus', where: [] },
        ],
        examples: [
          {
            title: '50 Hz versus 10 kHz windings',
            problem: 'Compare the primary turns for a 48 V square drive: (a) 50 Hz, laminated core A = 20 cm², B_pk = 1.2 T; (b) 10 kHz, ferrite core A = 1.5 cm², B_pk = 0.2 T.',
            steps: ['(a) N = 48 / (4 × 50 × 0.0020 × 1.2) = 48/0.48 = 100 turns on a 20 cm² core', '(b) N = 48 / (4 × 10 000 × 1.5 × 10⁻⁴ × 0.2) = 48/1.2 = 40 turns on a 1.5 cm² core'],
            answer: 'The HF transformer needs fewer turns on a core with about 13× less area, and a correspondingly smaller window and weight.',
          },
          {
            title: 'HV bus and link ratio for project F',
            problem: '48 V battery (V_min = 42 V), drop at full load 1.0 V, V_f = 1.0 V, V_out = 230 V. Find V_bus,min, n_link and the bus at 48 V.',
            steps: ['V_bus,min = √2 × 230 / 0.95 = 342.4 V', 'n_link = (342.4 + 2) / (42 − 1.0) = 344.4/41 = 8.40', 'At 48 V: V_bus = 8.40 × (48 − 1.0) − 2 = 392.8 V'],
            answer: 'n_link ≈ 8.4; the bus runs from about 342 V to 393 V over the battery range. The capacitor needs ≥ 1.25 × 480 V (at 57.6 V charging) ≈ 600 V rating.',
            check: 'At V_max = 57.6 V the bus reaches 8.4 × 56.6 − 2 ≈ 473 V; this sets the HV ratings, not the nominal value. ✓',
          },
        ],
        applications: `Most modern lightweight inverters, solar inverters and UPS units use high-frequency conversion. Grid-tied solar inverters typically have a DC link of 350–800 V. Their service manuals carry prominent warnings about the discharge time of the DC link capacitors.`,
        mistakes: [
          { mistake: 'Rating the HV capacitor for the nominal bus voltage.', correction: 'Use the bus at the highest battery voltage (charging), plus 25 % margin.' },
          { mistake: 'Using standard rectifier diodes in the HF rectifier.', correction: 'Their reverse recovery wastes energy at kHz; use fast, ultrafast or SiC diodes.' },
          { mistake: 'Assuming the bus is safe once the battery is disconnected.', correction: 'The HV capacitors hold their charge; wait the labelled time and prove dead.' },
        ],
        demo: {
          title: 'Build the HF inverter and watch the HV bus',
          text: 'Build project F, probe the HF secondary, the HV bus and the output. Then disconnect the HV bus capacitor in the troubleshooting task and explain the collapse.',
          link: to.build('Open project F', 'bld-f'),
        },
        activities: [to.lab3d('LF-3K PV bus capacitors (HV)', 'lf3k', 'c5'), to.lab3d('LF-3K IGBTs', 'lf3k', 'q5'), to.lib('IGBT', 'igbt'), to.lab3d('Bleeder resistors', 'lf3k', 'r1')],
        check: [
          { id: 'k1', type: 'numeric', prompt: 'Minimum HV bus for a 120 V output with m_max = 0.95 (V)?', answer: 178.6, tol: 0.01, unit: 'V', explain: '√2 × 120 / 0.95 = 178.6 V.' },
          { id: 'k2', type: 'mcq', prompt: 'Why can the HF transformer be so small?', options: ['N·A ∝ 1/f for the same voltage and flux density', 'Ferrite carries more flux than steel', 'It carries less power', 'It has no secondary'], answer: 0, explain: 'From B = V/(4fNA).' },
          { id: 'k3', type: 'numeric', prompt: 'HV-side current for 1500 W on a 375 V bus (A)?', answer: 4, tol: 0.01, unit: 'A', explain: '1500/375 = 4 A.' },
          { id: 'k4', type: 'mcq', prompt: 'Before touching an HF inverter’s board after switching off you must…', options: ['wait the discharge time and prove the HV bus dead with a checked meter', 'only disconnect the battery', 'only switch off the output breaker', 'touch the capacitor briefly'], answer: 0, explain: 'Stored energy remains; measurement proves dead.' },
        ],
        summary: [
          'Higher frequency reduces the transformer’s N·A ∝ 1/f: HF inverters are far lighter.',
          'Two stages: HF push-pull + ferrite transformer + fast rectifier → HV bus → HV SPWM bridge → filter.',
          'V_bus,min = √2·V_out/0.95; n_link from V_min; HV ratings from the bus at V_max.',
          'Battery side: high current, low voltage; HV side: low current, high voltage.',
          'The HV bus is a lethal stored-energy hazard: rate, bleed, label, prove dead.',
        ],
        homework: {
          id: 'S1.M4.L2.hw',
          title: 'HF design for a 24 V, 600 W inverter',
          brief: 'V_min = 21 V, V_max = 28.8 V, drop 0.8 V, V_f = 1 V, V_out = 230 V, bus capacitor 220 µF, bleeder 120 kΩ.',
          tasks: [
            { id: 'h1', type: 'numeric', prompt: 'Link ratio n_link?', answer: 17.05, tol: 0.02, unit: '', explain: '(342.4 + 2)/(21 − 0.8) = 344.4/20.2 = 17.05.' },
            { id: 'h2', type: 'numeric', prompt: 'Bus at V_max (V)?', answer: 475.4, tol: 0.02, unit: 'V', explain: '17.05 × (28.8 − 0.8) − 2 = 475.4 V.' },
            { id: 'h3', type: 'numeric', prompt: 'Time for the bleeder to bring 475 V down to 50 V (s)?', answer: 59.4, tol: 0.03, unit: 's', explain: 'τ = 120 000 × 220 × 10⁻⁶ = 26.4 s; t = 26.4 × ln(475/50) = 26.4 × 2.251 = 59.4 s.' },
          ],
          written: [{ prompt: 'What voltage rating would you specify for the HV bus capacitor and the HV switches, and why?', model: 'At least 1.25 × 475 ≈ 600 V for the capacitor (two 400 V capacitors in series with balancing resistors, or a 600 V part), and 600–650 V class switches, because the bus reaches 475 V at the charging voltage and switching spikes add to it.' }],
        },
      },
    },
  ],
  quiz: {
    pass: 0.7,
    questions: [
      { id: 'q1', type: 'numeric', prompt: 'Off-state switch voltage in a 12 V push-pull at 14.4 V (V)?', answer: 28.8, tol: 0.01, unit: 'V', explain: '2 × 14.4.' },
      { id: 'q2', type: 'mcq', prompt: 'Where does the battery positive connect in a push-pull inverter?', options: ['The primary centre tap', 'The drain of Q1', 'The secondary', 'The gate driver'], answer: 0, explain: 'The switches pull the winding ends to the negative rail.' },
      { id: 'q3', type: 'mcq', prompt: 'What does the simulation leave out that makes real push-pull hardware need a snubber?', options: ['Leakage inductance', 'Magnetising inductance', 'Winding resistance', 'The centre tap'], answer: 0, explain: 'Leakage inductance causes turn-off spikes.' },
      { id: 'q4', type: 'numeric', prompt: 'Turns for 24 V at 20 kHz on a 1 cm² ferrite core with B_pk = 0.2 T?', answer: 15, tol: 0.01, unit: '', explain: '24/(4 × 20 000 × 10⁻⁴ × 0.2) = 24/1.6 = 15.' },
      { id: 'q5', type: 'mcq', prompt: 'Why does the HV bridge of project F not need an output transformer?', options: ['Its bus already exceeds the 325 V output peak', 'It uses a ferrite filter', 'The load is low voltage', 'It runs at 10 kHz'], answer: 0, explain: 'The link transformer has already stepped up the voltage.' },
      { id: 'q6', type: 'mcq', prompt: 'Which rectifier diodes suit a 10 kHz link?', options: ['Fast/ultrafast or SiC Schottky', 'Standard 50 Hz rectifiers', 'Zener diodes', 'LEDs'], answer: 0, explain: 'Reverse recovery losses must be small.' },
      { id: 'q7', type: 'numeric', prompt: 'Stored energy in 470 µF at 400 V (J)?', answer: 37.6, tol: 0.01, unit: 'J', explain: '½ × 470 × 10⁻⁶ × 160 000 = 37.6 J.' },
      { id: 'q8', type: 'multi', prompt: 'Which are advantages of the high-frequency inverter? (select all)', options: ['Smaller, lighter transformer', 'No HV DC hazard', 'Low current on the HV side', 'Fewer power stages'], answers: [0, 2], explain: 'It has an HV hazard and two stages; it is lighter and the HV side carries little current.' },
    ],
  },
  assignment: {
    id: 'S1.M4.asg',
    title: 'Module assignment: compare a 1 kW LF and HF design',
    brief: 'Compare a 24 V, 1 kW low-frequency bridge design (n = 20) with a 24 V high-frequency design (360 V bus) for the same output.',
    tasks: [
      { id: 'a1', type: 'numeric', prompt: 'LF design: primary RMS current, ≈ P/(η·V) with η = 0.93 at 24 V (A)?', answer: 44.8, tol: 0.02, unit: 'A', explain: '1000/(0.93 × 24) = 44.8 A.' },
      { id: 'a2', type: 'numeric', prompt: 'HF design: HV bus current (A)?', answer: 2.78, tol: 0.02, unit: 'A', explain: '1000/360 = 2.78 A.' },
      { id: 'a3', type: 'numeric', prompt: 'Bleeder needed to discharge 330 µF from 450 V to 50 V in 60 s (kΩ)?', answer: 82.8, tol: 0.03, unit: 'kΩ', explain: 'R = t/(C·ln(V₀/V_s)) = 60/(330 × 10⁻⁶ × 2.197) = 82.8 kΩ.' },
    ],
    written: [{ prompt: 'Give two advantages and two disadvantages of each design for a portable 1 kW inverter.', model: 'LF: + robust surge capacity, + simple single power stage and isolation by the 50 Hz transformer; − heavy (≈ 8–10 kg transformer), − large copper and iron losses at light load. HF: + light and compact, + low current on the HV side; − two power stages and more complex control, − hazardous HV DC bus and EMI from fast switching.' }],
  },
  practicals: [
    { id: 'S1.M4.P1', title: 'Build project E', description: 'Assemble the push-pull inverter and pass its test suite.', link: to.build('Project E', 'bld-e'), evidence: { kind: 'project', id: 'bld-e' } },
    { id: 'S1.M4.P2', title: 'Build project F', description: 'Assemble the high-frequency inverter and pass its test suite.', link: to.build('Project F', 'bld-f'), evidence: { kind: 'project', id: 'bld-f' } },
  ],
}
