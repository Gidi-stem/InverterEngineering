import type { AcademyModule } from '../types'
import { to } from '../s1/links'

/** F2.M4 Energy storage and time. */
export const F2_M4: AcademyModule = {
  id: 'F2.M4',
  title: 'Energy storage and time',
  summary: 'How capacitors and inductors store energy, why their voltages and currents change exponentially with a time constant, and what that means for filters, switching and safety. Practised in the simulator and circuit laboratory.',
  lessons: [
    {
      id: 'F2.M4.L1',
      title: 'Capacitors and the RC time constant',
      minutes: 40,
      content: {
        objectives: [
          'Explain how a capacitor stores charge and energy, and define capacitance.',
          'Calculate the time constant τ = R·C and the capacitor voltage during charge and discharge.',
          'Combine capacitors in series and parallel.',
          'Measure τ in the simulator and verify a capacitor circuit in the circuit laboratory.',
        ],
        introduction: `A capacitor stores energy in an electric field between two conductors. Inverters depend on capacitors: the DC-bus bank that supplies the switching current, the output filter that smooths the sine wave, and the small timing capacitors in controllers. Their behaviour in time — charging and discharging exponentially — is what this lesson is about, and it is also why a switched-off inverter can still be dangerous (F1.M2.L2).`,
        lecture: `### Capacitance

A capacitor is two conducting plates separated by an insulator (the dielectric). Applying a voltage moves charge onto one plate and off the other. The charge stored is proportional to the voltage:

**Q = C · V**

- **Capacitance (C)** is measured in **farads (F)**. Practical values range from picofarads to farads, so µF and nF are the usual units.
- Capacitance increases with plate area and dielectric permittivity, and decreases with plate separation.
- Every capacitor has a **voltage rating**. Above it the dielectric breaks down (lesson F2.M1.L1).

### Energy stored

**E = ½ · C · V²**

The energy rises with the *square* of voltage. That is why high-voltage DC buses store dangerous energy even in modest capacitances.

### Charging through a resistor

When a capacitor charges from a voltage V through a resistor R, the current is largest at the start and falls as the capacitor voltage rises:

**v_C(t) = V · (1 − e^(−t/τ)),   τ = R · C**

- The [[time-constant|time constant]] τ is in seconds when R is in Ω and C in F.
- After **1τ** the capacitor reaches 63.2 % of V; after **5τ**, more than 99 %. Engineers treat it as fully charged after 5τ.
- The capacitor voltage **cannot change instantly**. A sudden step of supply voltage appears entirely across the resistor at first.

### Discharging

Discharging from V₀ through R:

**v_C(t) = V₀ · e^(−t/τ)**

After 1τ the voltage has fallen to 36.8 % of V₀; after 5τ, below 1 %. The time to fall to a safe voltage V_s is **t = τ · ln(V₀/V_s)** (lesson F1.M3.L3).

### Combining capacitors

- **Parallel:** capacitances add, C_T = C₁ + C₂ + …. Bus banks parallel several capacitors to increase capacitance and share ripple current.
- **Series:** reciprocals add, 1/C_T = 1/C₁ + 1/C₂ + …. Series connection raises the voltage rating; balancing resistors are then needed to share the voltage evenly.

This is the opposite of resistors.

### Electrolytic capacitors

Aluminium electrolytic capacitors give large capacitance in a small volume but are **polarised**: reversed, they can overheat, vent or explode. They also have significant **ESR** (equivalent series resistance), which causes heating from ripple current and rises as they age (course F4).`,
        technical: `**Capacitor current.** The current into a capacitor is i = C · dv/dt. A fast voltage change demands a large current. That is how bus capacitors supply the inverter bridge's pulsed current, and why a capacitor connected directly across a battery draws a large inrush (pre-charge resistors limit it, course S1).

**The simulator's experiment.** sim-01 drives 1 kΩ and 10 µF from a 10 V square wave with 10 Ω source resistance, so τ = 1010 × 10⁻⁵ = 10.1 ms. With a half-period of 50 ms ≈ 5τ, the capacitor nearly completes each charge and discharge.

**Tolerance.** Electrolytic capacitors often have tolerances of ±20 %, so measured time constants can differ noticeably from the nominal R·C.`,
        diagrams: [{ id: 'rc-curve', caption: 'RC charge and discharge: 63.2 % after one time constant; effectively complete after 5τ.' }],
        formulas: [
          { name: 'Charge and capacitance', expr: 'Q = C · V', where: [['C', 'capacitance', 'F']] },
          { name: 'Stored energy', expr: 'E = ½ · C · V²', where: [] },
          { name: 'RC time constant', expr: 'τ = R · C', where: [['τ', 'time constant', 's']] },
          { name: 'Charge and discharge', expr: 'v_C = V(1 − e^(−t/τ));  v_C = V₀ · e^(−t/τ)', where: [] },
        ],
        examples: [
          {
            title: 'Charging time',
            problem: 'A 1000 µF capacitor charges through 1 kΩ from 12 V (ckt-03). Find τ, the voltage after 1 s, and the time to be considered fully charged.',
            steps: ['τ = 1000 × 1000 × 10⁻⁶ = 1 s', 'v_C(1 s) = 12 × (1 − e⁻¹) = 12 × 0.632 = 7.59 V', 'Fully charged ≈ 5τ = 5 s'],
            answer: 'τ = 1 s; 7.59 V after 1 s; about 5 s to charge fully.',
          },
          {
            title: 'Discharge to a safe voltage',
            problem: 'The same capacitor at 12 V discharges through 2.2 kΩ. How long until it is below 1 V?',
            steps: ['τ = 2200 × 0.001 = 2.2 s', 't = 2.2 × ln(12/1) = 2.2 × 2.485 = 5.47 s'],
            answer: 'About 5.5 s.',
          },
        ],
        applications: `DC-bus banks, output filters, snubbers, timing circuits, soft-start and pre-charge circuits, and the capacitor-discharge procedure of every inverter repair depend on these results.`,
        mistakes: [
          { mistake: 'Adding series capacitances like resistances.', correction: 'Series capacitors combine like parallel resistors; parallel capacitors add.' },
          { mistake: 'Reversing an electrolytic capacitor.', correction: 'Observe the marked polarity; reversed electrolytics can vent or explode.' },
          { mistake: 'Assuming a capacitor is discharged after 1τ.', correction: '1τ leaves 36.8 %; use 5τ or calculate t = τ·ln(V₀/V_s), then measure.' },
        ],
        demo: {
          title: 'RC charge and discharge',
          text: 'Change R and C and watch the charge and discharge curves; mark the 63.2 % point and compare it with τ = R·C. Then run sim-01 and measure τ from the oscilloscope.',
          link: to.sim('Simulator: RC charging and discharging', 'sim-01'),
          embed: 'rc-charge',
        },
        activities: [to.sim('sim-01 RC charging and discharging', 'sim-01'), to.ckt('ckt-03 Capacitor charging and discharging', 'ckt-03'), to.lib('Capacitor', 'capacitor')],
        check: [
          { id: 'k1', type: 'numeric', prompt: 'τ for 47 kΩ and 22 µF (s)?', answer: 1.034, tol: 0.01, unit: 's', explain: '47 000 × 22 × 10⁻⁶ = 1.034 s.' },
          { id: 'k2', type: 'numeric', prompt: 'Percentage of full voltage after 2τ of charging (%)?', answer: 86.47, tol: 0.01, unit: '%', explain: '1 − e⁻² = 0.8647.' },
          { id: 'k3', type: 'numeric', prompt: 'Two 470 µF capacitors in series (µF)?', answer: 235, tol: 0.01, unit: 'µF', explain: 'Equal capacitors in series halve.' },
          { id: 'k4', type: 'numeric', prompt: 'Energy in 100 µF at 50 V (J)?', answer: 0.125, tol: 0.01, unit: 'J', explain: '½ × 10⁻⁴ × 2500.' },
        ],
        summary: [
          'Q = CV; E = ½CV²; voltage rating and polarity matter.',
          'τ = RC; 63.2 % after 1τ, effectively complete after 5τ.',
          'Discharge: v = V₀e^(−t/τ); time to a safe level t = τ·ln(V₀/V_s).',
          'Capacitors in parallel add; in series, reciprocals add.',
          'Capacitor voltage cannot change instantly; i = C·dv/dt.',
        ],
        homework: {
          id: 'F2.M4.L1.hw',
          title: 'RC calculations',
          brief: 'A 330 µF capacitor charges from 24 V through 10 kΩ.',
          tasks: [
            { id: 'h1', type: 'numeric', prompt: 'τ (s)?', answer: 3.3, tol: 0.01, unit: 's', explain: '10⁴ × 330 × 10⁻⁶.' },
            { id: 'h2', type: 'numeric', prompt: 'Voltage after 5 s (V)?', answer: 18.72, tol: 0.01, unit: 'V', explain: 'e^(−5/3.3) = e^(−1.515) = 0.2198, so v = 24 × (1 − 0.2198) = 24 × 0.7802 = 18.72 V.' },
            { id: 'h3', type: 'numeric', prompt: 'Initial charging current (mA)?', answer: 2.4, tol: 0.01, unit: 'mA', explain: '24/10 000 = 2.4 mA (the capacitor starts at 0 V).' },
          ],
          written: [{ prompt: 'Explain why the charging current is largest at the start and zero at the end.', model: 'At the start the capacitor voltage is zero, so the full supply voltage is across the resistor and I = V/R. As the capacitor charges, the resistor’s voltage (V − v_C) falls, so the current falls exponentially, reaching zero when v_C = V.' }],
        },
      },
    },
    {
      id: 'F2.M4.L2',
      title: 'Inductors and the RL time constant',
      minutes: 40,
      content: {
        objectives: [
          'Explain how an inductor stores energy in a magnetic field and define inductance.',
          'Calculate τ = L/R and the current during rise and decay in an RL circuit.',
          'Explain the voltage spike when inductor current is interrupted, and how it is controlled.',
          'Measure τ and the reverse voltage in the simulator.',
        ],
        introduction: `An inductor stores energy in a magnetic field around a coil. Inverters use inductors in their output filters and in boost and MPPT converters; transformers are coupled inductors. The key behaviour is the mirror image of a capacitor's: an inductor's **current** cannot change instantly. Trying to stop it suddenly produces a large voltage, which destroys switches unless designed for.`,
        lecture: `### Inductance

Current through a coil creates a magnetic field. If the current changes, the changing field induces a voltage in the coil that opposes the change:

**v_L = L · di/dt**

- **Inductance (L)** is measured in **henries (H)**, with mH and µH typical in power electronics.
- Inductance rises with the number of turns (as N²) and with a magnetic core of high permeability. A core can **saturate**: beyond a certain current, its inductance collapses (course F4).
- Real inductors also have winding resistance (copper loss, lesson F2.M2.L1).

### Energy stored

**E = ½ · L · I²**

### Current rise in an RL circuit

When a voltage V is applied to a resistor R in series with an inductor L, the current rises exponentially:

**i(t) = (V/R) · (1 − e^(−t/τ)),   τ = L / R**

- After 1τ the current reaches 63.2 % of its final value V/R; after 5τ, more than 99 %.
- At the first instant the inductor has the full voltage across it, and no current flows yet.

### Current decay

If the source is replaced by a path for the current (for example a diode or the source's own resistance), the current decays:

**i(t) = I₀ · e^(−t/τ)**

The inductor *drives* this current, so its voltage reverses: it acts as a source, pushing the current on.

### Interrupting an inductor

If the current path is opened suddenly — a switch opens, a transistor turns off — di/dt becomes enormous, and so does v = L·di/dt. The voltage rises until something breaks down: the switch's contacts arc, or a transistor fails.

Designers provide a path for the current:

- a **freewheeling (flyback) diode** across relay coils and inductive loads;
- the **body diodes** of the MOSFETs in an inverter bridge, which carry inductive load current during dead time;
- **snubbers** (RC networks) to absorb switching spikes.

### Comparing L and C

| | Capacitor | Inductor |
|---|---|---|
| Stores energy in | electric field | magnetic field |
| Cannot change instantly | voltage | current |
| Energy | ½CV² | ½LI² |
| Time constant | RC | L/R |`,
        technical: `**The simulator's experiment.** sim-02 uses R₁ = 100 Ω, L₁ = 100 mH with 1 Ω winding resistance, and a 10 Ω source resistance: R_total = 111 Ω, so τ = 0.1/111 = 0.90 ms and I_final = 10/111 = 90 mA. When the generator switches low, the inductor voltage jumps to about −I·(R₁ + R_gen) ≈ −10 V, because the current continues through the source.

**Relay coils.** A 12 V relay coil of 0.5 H drawing 40 mA, interrupted in 10 µs with no diode, would try to produce v = 0.5 × 0.04 / 10⁻⁵ = 2000 V. That is why every relay driver in the library's relay entry has a flyback diode.

**Saturation.** In a saturated inductor, the current rises much faster than the formula predicts because L has collapsed. Inverter controllers limit current partly for this reason.`,
        diagrams: [{ id: 'rl-curve', caption: 'RL current rise and decay with τ = L/R; the inductor voltage reverses when the source is removed.' }],
        formulas: [
          { name: 'Inductor voltage', expr: 'v_L = L · di/dt', where: [['L', 'inductance', 'H']] },
          { name: 'Stored energy', expr: 'E = ½ · L · I²', where: [] },
          { name: 'RL time constant', expr: 'τ = L / R', where: [['R', 'total series resistance', 'Ω']] },
          { name: 'Rise and decay', expr: 'i = (V/R)(1 − e^(−t/τ));  i = I₀ · e^(−t/τ)', where: [] },
        ],
        examples: [
          {
            title: 'RL time constant',
            problem: 'A 50 mH inductor with 2 Ω winding resistance is connected in series with 48 Ω across 12 V. Find τ, the final current and the current after 1 ms.',
            steps: ['R = 48 + 2 = 50 Ω; τ = 0.05 / 50 = 1 ms', 'I_final = 12 / 50 = 0.24 A', 'i(1 ms) = 0.24 × (1 − e⁻¹) = 0.24 × 0.632 = 0.152 A'],
            answer: 'τ = 1 ms; 240 mA final; 152 mA after 1 ms.',
          },
          {
            title: 'Energy in an output inductor',
            problem: 'An inverter output inductor of 1.5 mH carries a peak current of 20 A. How much energy does it hold, and what must happen when the bridge switches off?',
            steps: ['E = ½ × 0.0015 × 20² = 0.3 J', 'The current must continue: it flows through the MOSFET body diodes (freewheeling) back to the DC bus'],
            answer: '0.3 J, returned through the freewheeling diodes rather than forced to stop.',
          },
        ],
        applications: `Inverter output filters, boost and buck converters in MPPT controllers, transformers, relay coils, current sensing and EMI chokes. Every switching design must provide a path for inductor current.`,
        mistakes: [
          { mistake: 'Switching an inductive load off with no freewheeling path.', correction: 'Provide a diode or snubber; otherwise the voltage spike destroys the switch.' },
          { mistake: 'Forgetting the winding resistance in τ = L/R.', correction: 'R is the total series resistance, including the coil’s own resistance and the source’s.' },
          { mistake: 'Assuming an inductor’s current can change instantly.', correction: 'It rises and falls with τ = L/R; trying to force it creates large voltages.' },
        ],
        demo: {
          title: 'RL response in the simulator',
          text: 'Run sim-02, measure τ from the current trace on CH1, and observe the inductor voltage reverse on CH2 when the generator switches low.',
          link: to.sim('Simulator: RL circuit response', 'sim-02'),
        },
        activities: [to.sim('sim-02 RL circuit response', 'sim-02'), to.lib('Inductor', 'inductor'), to.lib('Relay (coil and flyback diode)', 'relay')],
        check: [
          { id: 'k1', type: 'numeric', prompt: 'τ for 200 mH and 40 Ω total (ms)?', answer: 5, tol: 0.01, unit: 'ms', explain: '0.2/40 = 0.005 s.' },
          { id: 'k2', type: 'numeric', prompt: 'Energy in 10 mH at 5 A (J)?', answer: 0.125, tol: 0.01, unit: 'J', explain: '½ × 0.01 × 25.' },
          { id: 'k3', type: 'mcq', prompt: 'What cannot change instantly in an inductor?', options: ['Its current', 'Its voltage', 'Its resistance', 'Its temperature'], answer: 0, explain: 'v = L·di/dt would be infinite.' },
          { id: 'k4', type: 'mcq', prompt: 'Why is a diode fitted across a relay coil?', options: ['To give the coil current a path when the driver turns off, preventing a voltage spike', 'To rectify AC', 'To light up', 'To increase the coil current'], answer: 0, explain: 'Freewheeling path.' },
        ],
        summary: [
          'v = L·di/dt; E = ½LI²; inductor current cannot change instantly.',
          'τ = L/R (total series resistance); 63.2 % after 1τ.',
          'Interrupting inductor current produces large voltages.',
          'Provide freewheeling diodes, body diodes or snubbers.',
          'L and C are duals: current versus voltage, magnetic versus electric field.',
        ],
        homework: {
          id: 'F2.M4.L2.hw',
          title: 'RL calculations',
          brief: 'A 24 V supply drives a 120 mH coil (3 Ω) through a 9 Ω resistor.',
          tasks: [
            { id: 'h1', type: 'numeric', prompt: 'τ (ms)?', answer: 10, tol: 0.01, unit: 'ms', explain: '0.12/12 = 0.01 s.' },
            { id: 'h2', type: 'numeric', prompt: 'Final current (A)?', answer: 2, tol: 0.01, unit: 'A', explain: '24/12.' },
            { id: 'h3', type: 'numeric', prompt: 'Stored energy at the final current (J)?', answer: 0.24, tol: 0.01, unit: 'J', explain: '½ × 0.12 × 4.' },
          ],
          written: [{ prompt: 'Describe what would happen if the supply were disconnected by a switch with no diode across the coil, and how to prevent it.', model: 'The current would try to drop to zero in microseconds; v = L·di/dt would rise to hundreds or thousands of volts, arcing the switch contacts (or destroying a transistor). A freewheeling diode across the coil lets the current decay gradually through the coil resistance, limiting the voltage to about one diode drop.' }],
        },
      },
    },
  ],
  quiz: {
    pass: 0.7,
    questions: [
      { id: 'q1', type: 'numeric', prompt: 'Charge on 220 µF at 50 V (mC)?', answer: 11, tol: 0.01, unit: 'mC', explain: '220 × 10⁻⁶ × 50 = 0.011 C.' },
      { id: 'q2', type: 'numeric', prompt: 'τ for 1.5 kΩ and 680 µF (s)?', answer: 1.02, tol: 0.01, unit: 's', explain: '1500 × 680 × 10⁻⁶.' },
      { id: 'q3', type: 'numeric', prompt: 'Voltage remaining after 3τ of discharge from 100 V (V)?', answer: 4.979, tol: 0.01, unit: 'V', explain: '100 × e⁻³ = 4.98 V.' },
      { id: 'q4', type: 'numeric', prompt: 'Three 1000 µF capacitors in parallel (µF)?', answer: 3000, tol: 0.01, unit: 'µF', explain: 'They add.' },
      { id: 'q5', type: 'numeric', prompt: 'τ for 30 mH and 15 Ω (ms)?', answer: 2, tol: 0.01, unit: 'ms', explain: '0.03/15.' },
      { id: 'q6', type: 'numeric', prompt: 'Energy in 4 mH at 15 A (J)?', answer: 0.45, tol: 0.01, unit: 'J', explain: '½ × 0.004 × 225.' },
      { id: 'q7', type: 'mcq', prompt: 'An electrolytic capacitor fitted reversed may…', options: ['overheat and vent or explode', 'work normally', 'double its capacitance', 'become an inductor'], answer: 0, explain: 'Electrolytics are polarised.' },
      { id: 'q8', type: 'mcq', prompt: 'In an inverter bridge, inductive load current during dead time flows through…', options: ['the MOSFET body (freewheeling) diodes', 'nothing: it stops instantly', 'the gate driver', 'the fan'], answer: 0, explain: 'The current must continue.' },
    ],
  },
  assignment: {
    id: 'F2.M4.asg',
    title: 'Module assignment: pre-charge and freewheeling',
    brief: 'Part A: an inverter’s 2200 µF bus is pre-charged from a 48 V battery through a 22 Ω resistor before the main contactor closes. Part B: its 24 V cooling-fan relay has a 0.3 H coil of 600 Ω.',
    tasks: [
      { id: 'a1', type: 'numeric', prompt: 'A: pre-charge time constant (ms)?', answer: 48.4, tol: 0.01, unit: 'ms', explain: '22 × 0.0022 = 0.0484 s.' },
      { id: 'a2', type: 'numeric', prompt: 'A: time to reach 95 % of 48 V (ms)?', answer: 145, tol: 0.01, unit: 'ms', explain: 't = τ · ln(1/0.05) = 48.4 × 2.996 = 145 ms.' },
      { id: 'a3', type: 'numeric', prompt: 'A: peak pre-charge current (A)?', answer: 2.182, tol: 0.01, unit: 'A', explain: '48/22 = 2.18 A (instead of kiloamperes with no resistor).' },
      { id: 'a4', type: 'numeric', prompt: 'B: coil current (mA)?', answer: 40, tol: 0.01, unit: 'mA', explain: '24/600.' },
      { id: 'a5', type: 'numeric', prompt: 'B: coil time constant (ms)?', answer: 0.5, tol: 0.01, unit: 'ms', explain: '0.3/600 = 0.0005 s.' },
    ],
    written: [{ prompt: 'Explain the purpose of the pre-charge resistor and the relay’s flyback diode.', model: 'Pre-charge: an uncharged capacitor looks like a short circuit, so closing the contactor directly would draw a huge inrush current, welding contacts and stressing the capacitors; the resistor limits it to about 2 A and charges the bus in about 5τ before the contactor closes. Flyback diode: when the transistor driving the relay turns off, the coil current continues through the diode and decays with τ = L/R, preventing a destructive voltage spike.' }],
  },
  practicals: [
    { id: 'F2.M4.P1', title: 'Simulator: measure an RC time constant (sim-01)', description: 'Run the RC experiment, measure the charging and discharging time constants from the oscilloscope and answer its questions.', link: to.sim('sim-01 RC charging and discharging', 'sim-01'), evidence: { kind: 'activity', id: 'sim:sim-01' } },
    { id: 'F2.M4.P2', title: 'Circuit laboratory: capacitor charge and safe discharge (ckt-03)', description: 'Build the charge and discharge circuit with correct electrolytic polarity and a discharge resistor, and pass the exercise check.', link: to.ckt('ckt-03 Capacitor charging and discharging', 'ckt-03'), evidence: { kind: 'exercise', id: 'ckt-03' } },
    { id: 'F2.M4.P3', title: 'Simulator: RL response (sim-02)', description: 'Run the RL experiment, measure τ = L/R and the peak current, and observe the reverse inductor voltage.', link: to.sim('sim-02 RL circuit response', 'sim-02'), evidence: { kind: 'activity', id: 'sim:sim-02' } },
  ],
}
