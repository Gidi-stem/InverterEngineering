import type { AcademyModule } from '../types'
import { to } from './links'

/** S1.M3 Pure sine-wave inverter (project D), the full signal chain. */
export const S1_M3: AcademyModule = {
  id: 'S1.M3',
  title: 'The pure sine-wave inverter',
  summary: 'The complete signal and power chain of a regulated sine-wave inverter: DC input stage and bus, gate drivers and dead time, the MOSFET H-bridge, SPWM generation, the LC filter, feedback regulation and output protection, culminating in project D.',
  lessons: [
    {
      id: 'S1.M3.L1',
      title: 'The signal chain, DC input stage and DC bus',
      minutes: 40,
      content: {
        objectives: [
          'Name every stage of a pure sine-wave inverter and the signal or power that passes between them.',
          'Explain the functions of the DC input stage: fusing, reverse-polarity protection, pre-charge and low-voltage disconnect.',
          'Calculate the inrush current and pre-charge time of a bus capacitor bank.',
          'Explain which currents the battery supplies and which the bus capacitors supply, using impedance at 100 Hz and at the switching frequency.',
        ],
        introduction: `A pure sine-wave inverter has two parallel chains that meet at the H-bridge:

- the **power chain** carries hundreds of watts from the battery to the load;
- the **signal chain** carries milliwatts of information from a sine reference, through modulation and gate drivers, to the switches, and back again from the voltage sensor.

This lesson maps both chains and then looks closely at the first power stage: the DC input and the [[dc-bus]].`,
        lecture: `### The two chains

**Power chain:** battery → DC fuse → DC bus (capacitors) → H-bridge → filter inductor → transformer → filter capacitor → output breaker → load.

**Signal chain:** sine reference (in the microcontroller) → comparison with a triangle [[carrier]] ([[spwm|SPWM]]) → [[dead-time]] insertion → [[gate-driver|gate drivers]] → switch gates. In the other direction: output [[voltage]] sensor → RMS measurement → [[regulation|regulator]] → [[modulation-index]] m → back to the SPWM comparison.

Every one of these blocks appears in project D, and each lesson of this module studies one of them.

### The DC input stage

The battery connects through:

1. **The DC fuse**, at the battery positive (lesson S1.M1.L1), sized at 1.25 × I_dc,max.
2. **Reverse-polarity protection.** A battery connected backwards forward-biases every MOSFET's [[body-diode|body diode]] and shorts the battery through the bridge. Real products use a series MOSFET, a blocking diode (only at low current) or rely on the fuse blowing. *Not modelled in project D.*
3. **Pre-charge.** Connecting a battery directly to thousands of microfarads draws a huge [[inrush]] current that sparks and pits the connector. A resistor in series for the first moments, bypassed by a relay once the capacitors are charged, limits it.
4. **Low-voltage disconnect.** The controller stops the bridge when the battery falls to its cut-off (21 V for a 24 V lead-acid bank).

### Who supplies which current?

The bridge draws two very different kinds of current from the bus:

- **A 100 Hz ripple**, because single-phase power pulses at twice the output frequency (lesson S1.M1.L3). Its RMS is about I_dc/√2.
- **Switching-frequency pulses** at f_sw (5 kHz in project D) and above, as the bridge chops the current on and off.

Current divides between the battery and the bus capacitors in inverse proportion to their impedances at each frequency.

- At 100 Hz, 4700 µF has a reactance of 1/(2π·100·0.0047) = 0.34 Ω. The battery's internal resistance is about 0.02 Ω, so **the battery supplies the 100 Hz ripple**. This is why inverters are tough on batteries.
- At 5 kHz, the capacitor's reactance falls to 6.8 mΩ and the battery cables' inductance raises their impedance, so **the capacitors supply the switching pulses**.

The capacitors must be close to the bridge, with short, low-inductance connections.`,
        technical: `**Inrush through a pre-charge resistor.** Charging C through R from V gives i(t) = (V/R)·e^(−t/RC). The peak is V/R and the time constant is τ = RC; after 5τ the bus is within 1 % of the battery.

**Capacitor ESR and ripple heating.** Each capacitor has an [[esr|ESR]], and ripple current heats it by I²·ESR. Electrolytic lifetime roughly halves for every 10 °C rise (a widely quoted rule of thumb). Ripple-current ratings are therefore a key datasheet parameter, and several capacitors are paralleled to share the current.

**Bus voltage in project D.** The bus is the fused battery: 21–28.8 V for a 24 V bank. The 4700 µF electrolytic is rated 50 V here, more than 1.25 × V_max = 36 V. In the high-frequency design (project F) the bridge's bus is about 360 V instead, with completely different capacitor ratings and hazards.

**Model limits.** The simulator models the battery as an ideal source with internal resistance and the capacitors as ideal capacitances. ESR, ripple heating and connector sparking are not modelled.`,
        diagrams: [
          { id: 'inverter-blocks', caption: 'Power chain (thick) and signal chain (thin) of the pure sine-wave inverter.' },
          { id: 'schematic:bld-d', caption: 'Project D: every stage of both chains in the build laboratory.' },
        ],
        formulas: [
          { name: 'Capacitive reactance', expr: 'X_C = 1 / (2π · f · C)', where: [['X_C', 'reactance', 'Ω'], ['f', 'frequency', 'Hz'], ['C', 'capacitance', 'F']] },
          { name: 'Pre-charge current and time', expr: 'I_peak = V / R,  τ = R · C,  t_charged ≈ 5τ', where: [['R', 'pre-charge resistance', 'Ω']] },
          { name: 'DC-side ripple current', expr: 'I_ripple ≈ I_dc / √2  (at 2·f)', where: [['I_dc', 'mean DC input current', 'A']] },
        ],
        examples: [
          {
            title: 'Pre-charging the bus',
            problem: 'Project D’s 4700 µF bus is connected to a 24 V battery through a 10 Ω pre-charge resistor. Find the peak current, the time constant and the time to charge.',
            steps: ['I_peak = 24/10 = 2.4 A (instead of hundreds of amperes)', 'τ = 10 × 0.0047 = 0.047 s = 47 ms', 'After 5τ = 235 ms the bus is within 1 % of 24 V; the bypass relay can then close'],
            answer: '2.4 A peak, charged in about a quarter of a second.',
            check: 'Energy dissipated in the resistor equals the energy stored: ½ × 0.0047 × 24² = 1.35 J, which is trivial. ✓',
          },
          {
            title: 'Battery or capacitor?',
            problem: 'Compare the impedance of 4700 µF with a 20 mΩ battery at 100 Hz and at 5 kHz. The battery cables add 1 µH of inductance.',
            steps: ['100 Hz: X_C = 1/(2π × 100 × 0.0047) = 0.339 Ω; cable X_L = 2π × 100 × 10⁻⁶ = 0.6 mΩ; battery branch ≈ 0.020 Ω', '5 kHz: X_C = 0.339/50 = 6.8 mΩ; cable X_L = 2π × 5000 × 10⁻⁶ = 31 mΩ; battery branch ≈ √(0.020² + 0.031²) = 37 mΩ'],
            answer: 'At 100 Hz the battery branch is 17× lower in impedance and carries the ripple. At 5 kHz the capacitor is 5× lower and supplies the switching pulses.',
          },
        ],
        applications: `Commercial inverters pre-charge their bus through a resistor or an NTC thermistor; you often hear the bypass relay click a moment after switching on. Battery manufacturers specify the allowed ripple current, and long cable runs between battery and inverter are discouraged because they add inductance.`,
        mistakes: [
          { mistake: 'Thinking the bus capacitors smooth out the 100 Hz ripple so the battery sees pure DC.', correction: 'Reasonable bus capacitances are too small at 100 Hz; the battery carries most of the 100 Hz ripple. The capacitors handle the switching frequency.' },
          { mistake: 'Connecting the battery straight onto a large capacitor bank.', correction: 'Inrush can reach hundreds of amperes; use a pre-charge path.' },
          { mistake: 'Ignoring reverse polarity.', correction: 'A reversed battery conducts through every body diode. Protection or a fuse must handle it.' },
        ],
        demo: {
          title: 'Follow the power and signal chains',
          text: 'Open project D after assembly and probe, in order: the battery current, the bus voltage, one gate signal, the bridge voltage, the transformer primary and the output. The demonstration below shows the same chain from the reference sine to the filtered output.',
          link: to.build('Open project D', 'bld-d'),
          embed: 'spwm-chain',
        },
        activities: [to.lab3d('LF-3K battery terminals and bus capacitors', 'lf3k', 'bat-pos'), to.lib('DC input stage', 'dc-input'), to.proc('Capacitor ESR test', 'capacitor', 'cap-esr'), to.sim('Capacitor filtering', 'sim-04')],
        check: [
          { id: 'k1', type: 'numeric', prompt: 'Reactance of 10 000 µF at 100 Hz (Ω)?', answer: 0.159, tol: 0.02, unit: 'Ω', explain: '1/(2π × 100 × 0.01) = 0.159 Ω.' },
          { id: 'k2', type: 'numeric', prompt: 'Peak inrush through a 4.7 Ω pre-charge resistor from 48 V (A)?', answer: 10.21, tol: 0.01, unit: 'A', explain: '48/4.7 = 10.2 A.' },
          { id: 'k3', type: 'mcq', prompt: 'Which part mainly supplies the 100 Hz ripple current in a battery inverter?', options: ['The battery', 'The bus capacitors', 'The transformer', 'The filter capacitor'], answer: 0, explain: 'At 100 Hz the battery’s impedance is much lower than practical bus capacitors’.' },
          { id: 'k4', type: 'mcq', prompt: 'In the signal chain, what does the regulator adjust?', options: ['The modulation index m', 'The battery voltage', 'The transformer ratio', 'The fuse rating'], answer: 0, explain: 'The fundamental output is proportional to m.' },
        ],
        summary: [
          'Power chain: battery → fuse → bus → bridge → L → transformer → C → breaker → load.',
          'Signal chain: sine reference → SPWM → dead time → drivers → gates; sensor → regulator → m.',
          'The DC input stage fuses, pre-charges, protects against reverse polarity and disconnects at low voltage.',
          'The battery supplies the 100 Hz ripple; the bus capacitors supply switching-frequency pulses and must sit close to the bridge.',
          'Pre-charge limits inrush: I = V/R, τ = RC.',
        ],
        homework: {
          id: 'S1.M3.L1.hw',
          title: 'Input stage of a 48 V, 3 kW inverter',
          brief: 'A 48 V bank, 3 kW output, η = 94 %, 10 000 µF bus, 22 Ω pre-charge resistor.',
          tasks: [
            { id: 'h1', type: 'numeric', prompt: 'Mean DC current at 48 V (A)?', answer: 66.5, tol: 0.01, unit: 'A', explain: '3000/(0.94 × 48) = 66.5 A.' },
            { id: 'h2', type: 'numeric', prompt: '100 Hz ripple current (A rms)?', answer: 47.0, tol: 0.02, unit: 'A', explain: '66.5/√2 = 47.0 A.' },
            { id: 'h3', type: 'numeric', prompt: 'Time to pre-charge (5τ, s)?', answer: 1.1, tol: 0.01, unit: 's', explain: '5 × 22 × 0.01 = 1.1 s.' },
          ],
          written: [{ prompt: 'Why might a battery manufacturer warn against long cables between the battery and an inverter?', model: 'Long cables add resistance (voltage drop, heat) and inductance; the inductance raises the impedance at switching frequencies, so the bus capacitors must work harder, voltage spikes at the bridge grow, and the cables radiate interference.' }],
        },
      },
    },
    {
      id: 'S1.M3.L2',
      title: 'Gate drivers, dead time and H-bridge switching',
      minutes: 45,
      content: {
        objectives: [
          'Explain how a gate driver turns a logic signal into a fast, adequately powered gate transition.',
          'Size a bootstrap capacitor and the driver’s peak current from the MOSFET gate charge.',
          'Explain why dead time is necessary and estimate the output-voltage error it causes.',
          'Trace the current through switches and body diodes during switching with an inductive load.',
        ],
        introduction: `The microcontroller produces 3.3 V logic signals with a few milliamps of drive. A power MOSFET needs its gate charged to 10–12 V, quickly enough that the switching transition takes tens of nanoseconds, and the high-side gates must sit on top of a midpoint that leaps between 0 V and the bus at every switching edge. The [[gate-driver]] makes this possible. [[dead-time|Dead time]] makes it safe.`,
        lecture: `### What a gate driver does

A MOSFET gate is a capacitor. To switch it, the driver must move a charge Q_g, the *total gate charge* from the datasheet (tens to hundreds of nanocoulombs for large power devices), in the time allowed for the transition. The peak gate current is therefore I_g ≈ Q_g / t_sw. To switch 200 nC in 100 ns the driver needs about 2 A. This is why the driver is a separate chip placed right next to the switch.

### Low side and high side

- **Low side** (Q2, Q4): the source is on the negative rail, so the driver works from a 12 V supply referenced to that rail.
- **High side** (Q1, Q3): the source is the leg midpoint. The driver needs a supply 12 V above the *midpoint*, which floats.

In a **[[bootstrap]] driver**, a capacitor C_boot charges through a diode from the 12 V supply whenever the low-side switch is on (the midpoint is then at 0 V). When the high side turns on, C_boot powers its driver. In SPWM the low side conducts every carrier period, so the capacitor is constantly refreshed.

### Dead time

A MOSFET does not stop conducting the instant its gate signal falls; the gate must first discharge. If Q2's signal rose at the same moment Q1's fell, both would conduct briefly: [[shoot-through]]. Every edge would then send a current spike through the leg, heating it and eventually destroying it.

The controller therefore inserts a dead time t_d (about 1 µs in project D) during which **both** switches of a leg are off.

### What happens during the dead time

With an inductive load (the filter inductor and the transformer) the current cannot stop. During t_d it flows through a [[body-diode|body diode]], and which one depends on the current's direction:

- current flowing *out of* the midpoint is carried by the low-side diode, so the midpoint sits at the negative rail;
- current flowing *into* the midpoint is carried by the high-side diode, so the midpoint sits at the positive rail.

The midpoint voltage during t_d is set by the current direction, not by the controller. The result is a small voltage error that always opposes the current.

### The bridge with an inductive load

In each carrier period the switches change state, and the inductor current is either driven by the bus (energy taken from the battery) or freewheels through diodes (energy returned to the bus). This is how the bridge handles reactive loads (lesson S1.M1.L2) and why the input current of an inverter with an inductive load goes briefly negative.`,
        technical: `**Bootstrap capacitor sizing.** While the high side is on, the capacitor supplies Q_g at each turn-on plus the driver's quiescent current. A common design rule is C_boot ≥ 10 × Q_g / ΔV_allowed, where the factor 10 covers leakage and quiescent current. A droop ΔV of 0.5–1 V is acceptable. Use a low-ESR ceramic capacitor.

**Dead-time voltage error.** Each dead time loses (or gains) t_d·V_dc of volt-seconds per edge. With two edges per carrier period, the average error is about ΔV ≈ 2·t_d·f_sw·V_dc, opposing the current. It distorts the waveform near the current zero crossings. Regulation removes the error in the RMS, but not in the waveform shape.

**Too much or too little dead time.** Too little gives shoot-through. Too much increases the distortion and the diode conduction loss. Typical values are 0.5–2 µs for MOSFETs and 1–3 µs for IGBTs (typical ranges, set from the driver and switch datasheets).

**Simplified models.** The simulator's gate-drive generator applies dead time as an interval with both gates low, and the MOSFET model switches in the time t_sw you select. It does not model gate charge, Miller plateau or driver propagation delay.`,
        diagrams: [
          { id: 'deadtime', caption: 'Gate signals of one leg with dead time, and the midpoint voltage set by the current direction during the dead time.' },
          { id: 'hbridge-states', caption: 'Current paths through switches and body diodes.' },
        ],
        formulas: [
          { name: 'Gate drive current', expr: 'I_g ≈ Q_g / t_sw', where: [['Q_g', 'total gate charge (datasheet)', 'C'], ['t_sw', 'switching time', 's']] },
          { name: 'Bootstrap capacitor', expr: 'C_boot ≥ 10 · Q_g / ΔV', where: [['ΔV', 'allowed droop', 'V']] },
          { name: 'Dead-time average voltage error', expr: 'ΔV ≈ 2 · t_d · f_sw · V_dc', where: [['t_d', 'dead time', 's'], ['f_sw', 'switching frequency', 'Hz']] },
        ],
        examples: [
          {
            title: 'Driver and bootstrap for paralleled MOSFETs',
            problem: 'Each bridge position uses three MOSFETs in parallel, each with Q_g = 150 nC (datasheet value of the chosen part). Switching should take 100 ns. Find the gate current and the bootstrap capacitor for 0.5 V droop.',
            steps: ['Q_g,total = 3 × 150 = 450 nC', 'I_g = 450 × 10⁻⁹ / 100 × 10⁻⁹ = 4.5 A peak', 'C_boot ≥ 10 × 450 × 10⁻⁹ / 0.5 = 9 µF → choose 10 µF ceramic'],
            answer: 'A driver rated for at least 4.5 A peak and a 10 µF bootstrap capacitor.',
          },
          {
            title: 'Dead-time distortion in project D',
            problem: 't_d = 1 µs, f_sw = 5 kHz, V_dc = 24 V. Estimate the average voltage error and compare it with the fundamental of the bridge output at m = 0.79.',
            steps: ['ΔV ≈ 2 × 10⁻⁶ × 5000 × 24 = 0.24 V', 'Fundamental peak = m·V_dc = 0.79 × 24 = 19.0 V', 'Ratio = 0.24/19.0 = 1.3 %'],
            answer: 'About 0.24 V, roughly 1 % of the fundamental, concentrated around the current zero crossings. It appears as a small distortion of the measured THD.',
          },
        ],
        applications: `Half-bridge driver ICs with bootstrap high sides, built-in dead time and under-voltage lock-out are standard in inverters, motor drives and switch-mode supplies. Higher-power and high-voltage systems use isolated drivers with desaturation detection for short-circuit protection.`,
        mistakes: [
          { mistake: 'Driving a power MOSFET directly from a microcontroller pin.', correction: 'The pin cannot supply amperes of gate current or 10–12 V of gate voltage; the switch would switch slowly and overheat.' },
          { mistake: 'Setting zero dead time “for a cleaner waveform”.', correction: 'Without dead time, every edge causes shoot-through. Use the smallest dead time the switches and drivers safely allow.' },
          { mistake: 'Believing the bridge midpoint follows the gate signals during the dead time.', correction: 'During the dead time the current direction decides which body diode conducts, and so where the midpoint goes.' },
        ],
        demo: {
          title: 'Watch dead time in the half-bridge experiment',
          text: 'Run the half-bridge experiment, zoom in on a switching edge and measure the dead time between the two gate signals. Then look at the midpoint voltage during that interval.',
          link: to.sim('Half-bridge operation', 'sim-07'),
        },
        activities: [to.lib('Gate driver', 'gate-driver'), to.proc('Check a gate driver with an oscilloscope', 'gate-driver', 'driver-scope'), to.lab3d('LF-3K gate drivers', 'lf3k', 'u2'), to.ckt('Half-bridge exercise', 'ckt-08')],
        check: [
          { id: 'k1', type: 'numeric', prompt: 'Peak gate current to switch 120 nC in 60 ns (A)?', answer: 2, tol: 0.01, unit: 'A', explain: '120/60 = 2 A.' },
          { id: 'k2', type: 'numeric', prompt: 'Average dead-time error: t_d = 2 µs, f_sw = 10 kHz, V_dc = 48 V (V)?', answer: 1.92, tol: 0.01, unit: 'V', explain: '2 × 2 × 10⁻⁶ × 10⁴ × 48 = 1.92 V.' },
          { id: 'k3', type: 'mcq', prompt: 'During the dead time, current flowing out of the midpoint into the load is carried by…', options: ['the low-side body diode', 'the high-side body diode', 'nothing: it stops', 'the gate driver'], answer: 0, explain: 'The current continues and the low-side diode conducts, clamping the midpoint to the negative rail.' },
          { id: 'k4', type: 'mcq', prompt: 'A bootstrap capacitor recharges…', options: ['while the low-side switch of its leg is on', 'while the high-side switch is on', 'only at power-up', 'from the battery directly'], answer: 0, explain: 'With the low side on, the midpoint is at 0 V and the capacitor charges through the bootstrap diode.' },
        ],
        summary: [
          'Gate drivers move the gate charge quickly: I_g ≈ Q_g/t_sw, often amperes.',
          'High-side switches need floating supplies; bootstrap works when the low side switches regularly.',
          'Dead time prevents shoot-through; during it, the current direction decides which body diode conducts.',
          'Dead time causes a small voltage error ≈ 2·t_d·f_sw·V_dc that distorts the waveform near zero current.',
          'With inductive loads, energy flows back to the bus through the diodes in part of each cycle.',
        ],
        homework: {
          id: 'S1.M3.L2.hw',
          title: 'Gate drive for a 48 V, 10 kHz bridge',
          brief: 'Two MOSFETs in parallel per position, Q_g = 180 nC each, t_sw target 80 ns, dead time 1.5 µs, V_dc = 48 V.',
          tasks: [
            { id: 'h1', type: 'numeric', prompt: 'Peak gate current per position (A)?', answer: 4.5, tol: 0.01, unit: 'A', explain: '360 nC / 80 ns = 4.5 A.' },
            { id: 'h2', type: 'numeric', prompt: 'Bootstrap capacitor for 1 V droop (µF)?', answer: 3.6, tol: 0.01, unit: 'µF', explain: '10 × 360 nC / 1 V = 3.6 µF (choose 4.7 µF).' },
            { id: 'h3', type: 'numeric', prompt: 'Average dead-time error (V)?', answer: 1.44, tol: 0.01, unit: 'V', explain: '2 × 1.5 µs × 10 kHz × 48 V = 1.44 V.' },
          ],
          written: [{ prompt: 'Explain why dead time that is safe at 5 kHz may cause noticeably more distortion at 20 kHz.', model: 'The error is proportional to f_sw: the same t_d is lost four times as often per second at 20 kHz, so the volt-second error and the distortion near current zero crossings are four times larger.' }],
        },
      },
    },
    {
      id: 'S1.M3.L3',
      title: 'SPWM generation',
      minutes: 50,
      content: {
        objectives: [
          'Describe how comparing a sine reference with a triangle carrier produces SPWM gate signals.',
          'Derive the duty cycle and the average bridge voltage as functions of time and the modulation index.',
          'Calculate the fundamental output for a given modulation index, bus voltage and transformer ratio.',
          'Explain where the harmonics of bipolar and unipolar SPWM lie, and what over-modulation does.',
        ],
        introduction: `[[pwm|PWM]] controls an *average* voltage by varying the [[duty-cycle]] of a fast switching waveform. If the duty cycle is made to follow a sine wave, the average voltage becomes a sine wave: this is [[spwm|sinusoidal PWM]]. It is the heart of every pure sine-wave inverter, and of nearly every motor drive.`,
        lecture: `### Natural sampling: reference against carrier

The microcontroller generates two signals:

- a **sine reference** v_ref(t) = m·sin(2π·f·t), at the output frequency (50 Hz);
- a **triangle [[carrier]]** between −1 and +1, at the switching frequency f_sw (5 kHz in project D).

A comparator, implemented in the microcontroller's PWM timer, sets each gate:

- while v_ref > carrier: Q1 and Q4 on (bridge output +V_dc);
- while v_ref < carrier: Q3 and Q2 on (bridge output −V_dc).

This is **bipolar** SPWM: the bridge output always jumps between +V_dc and −V_dc.

### Duty cycle and the average voltage

Over one carrier period, the fraction of time spent at +V_dc is

d(t) = (1 + m·sin ωt) / 2

The average bridge voltage over that period is therefore

v̄(t) = d·V_dc − (1 − d)·V_dc = (2d − 1)·V_dc = **m·V_dc·sin ωt**

The bridge produces a fundamental of peak m·V_dc at 50 Hz, plus switching-frequency components that the LC filter removes.

### The modulation index

m (from 0 to 1) is the amplitude of the reference relative to the carrier:

- **m = 0.5** gives a fundamental of half the bus voltage;
- **m = 1** gives the full bus voltage as the peak.

The regulator changes m to hold the output constant (lesson S1.M3.L5).

### Where the harmonics are

| Scheme | How it switches | Harmonics |
|---|---|---|
| Bipolar | Both legs switch together | Clustered around f_sw, 2f_sw, … (5 kHz, 10 kHz…), far above 50 Hz, so a modest LC filter removes them |
| Unipolar (used by many commercial inverters) | Each leg follows its own comparison | First cluster at 2f_sw, giving a smaller filter or lower losses for the same quality |

### Over-modulation

If m > 1, the reference exceeds the carrier near its peaks. The bridge stays at +V_dc for several carrier periods, and the waveform flattens towards a square wave. Low-order harmonics (3rd, 5th…) reappear, and no practical filter removes them. Regulators therefore limit m. Project D designs for m = 0.95 at the lowest battery voltage.

### Frequency ratio

The ratio m_f = f_sw/f (100 in project D) should be large, and an odd integer for symmetry, so the switching harmonics sit far from 50 Hz. Higher f_sw means a smaller filter but more switching loss (lesson S1.M1.L3).`,
        technical: `**Deriving d(t).** Over one carrier period the triangle sweeps linearly from −1 to +1 and back. The reference is almost constant during that short period, at r = m·sin ωt. The fraction of the period in which r > carrier is (1 + r)/2. Hence d = (1 + m·sin ωt)/2 and v̄ = (2d − 1)·V_dc = m·V_dc·sin ωt.

**Digital implementation.** A microcontroller stores a sine table, steps through it at a rate set by the output frequency, and writes each value as the compare register of a centre-aligned PWM timer. The timer generates both complementary outputs with hardware dead time. The simulator's gate-drive generator in SPWM mode does the same comparison continuously.

**Carrier synchronisation.** If f_sw is an integer multiple of f, the switching pattern repeats exactly every output cycle. That avoids sub-harmonics: slow beating components below 50 Hz.

**Educational simplification.** Project D uses bipolar SPWM at 5 kHz so that simulations run in seconds. Commercial designs often use 16–20 kHz (above audibility) with unipolar modulation.`,
        diagrams: [{ id: 'spwm', caption: 'Sine reference and triangle carrier, the resulting gate signals, and the average bridge voltage.' }],
        formulas: [
          { name: 'Duty cycle (bipolar SPWM)', expr: 'd(t) = (1 + m · sin ωt) / 2', where: [['m', 'modulation index (0–1)', '—'], ['ω', '2π·f', 'rad/s']] },
          { name: 'Average bridge voltage', expr: 'v̄(t) = (2d − 1) · V_dc = m · V_dc · sin ωt', where: [['V_dc', 'bus voltage', 'V']] },
          { name: 'Fundamental at the output', expr: 'V_out,rms = m · V_eff · n / √2', where: [['V_eff', 'bus voltage less drops', 'V'], ['n', 'transformer ratio', '—']] },
          { name: 'Frequency ratio', expr: 'm_f = f_sw / f', where: [['f_sw', 'carrier frequency', 'Hz'], ['f', 'output frequency', 'Hz']] },
        ],
        examples: [
          {
            title: 'Duty cycle over a cycle',
            problem: 'With m = 0.8, find the duty cycle at ωt = 0°, 90°, 180° and 270°.',
            steps: ['0°: d = (1 + 0)/2 = 0.50', '90°: d = (1 + 0.8)/2 = 0.90', '180°: d = 0.50', '270°: d = (1 − 0.8)/2 = 0.10'],
            answer: 'The duty swings between 10 % and 90 % around 50 %, sinusoidally. At the zero crossings the bridge spends equal time at ±V_dc, so the average is zero.',
          },
          {
            title: 'Output voltage of project D',
            problem: 'Project D: V_dc = 24 V, drops ≈ 3.3 V at full load, n = 20, m = 0.79. Estimate the output RMS. Which m is needed at the 21 V cut-off?',
            steps: ['V_eff = 24 − 3.3 = 20.7 V; transformer regulation reduces it a further 3 % → 20.1 V', 'V_out = 0.79 × 20.1 × 20 / √2 = 224 V (the regulator trims m to reach 230 V)', 'At 21 V: V_eff = (21 − 3.3) × 0.97 = 17.2 V → m = 230 × √2 / (17.2 × 20) = 0.95'],
            answer: 'About 230 V at m ≈ 0.8, and m must reach 0.95 at the cut-off. That is exactly the design rule used for the turns ratio.',
          },
        ],
        applications: `SPWM, and its refinement space-vector PWM, drives every variable-speed motor drive, grid-tied solar inverter, UPS and electric-vehicle traction inverter. The same comparator principle is built into the PWM timers of microcontrollers designed for motor control.`,
        mistakes: [
          { mistake: 'Thinking the bridge output itself is a sine wave.', correction: 'The bridge output is a train of full-amplitude pulses; only its average (after the LC filter) is a sine.' },
          { mistake: 'Raising m above 1 to get more output voltage.', correction: 'Over-modulation brings back low-order harmonics. Choose the transformer ratio so m ≤ 0.95 at the lowest battery voltage.' },
          { mistake: 'Choosing a very high carrier frequency “for quality”.', correction: 'Switching loss rises in proportion; choose f_sw from the filter size, losses and audible noise together.' },
        ],
        demo: {
          title: 'From reference to filtered output',
          text: 'The demonstration plots the sine reference and carrier, the resulting gate pulses, the bridge voltage and the filtered output on one time axis. Change m and see the pulse widths and the output amplitude follow.',
          link: to.sim('PWM generation', 'sim-06'),
          embed: 'spwm-chain',
        },
        activities: [to.sim('Pure sine-wave inverter', 'sim-10'), to.lib('Microcontroller', 'microcontroller'), to.lab3d('LF-3K microcontroller', 'lf3k', 'u6'), to.cmp('PWM controller versus microcontroller', 'pwm-vs-mcu')],
        check: [
          { id: 'k1', type: 'numeric', prompt: 'Duty cycle at the positive peak with m = 0.6 (%)?', answer: 80, tol: 0.01, unit: '%', explain: '(1 + 0.6)/2 = 0.8.' },
          { id: 'k2', type: 'numeric', prompt: 'Fundamental peak of the bridge output with m = 0.9 and V_dc = 48 V (V)?', answer: 43.2, tol: 0.01, unit: 'V', explain: 'm·V_dc = 0.9 × 48 = 43.2 V.' },
          { id: 'k3', type: 'mcq', prompt: 'In bipolar SPWM, the first cluster of switching harmonics lies near…', options: ['f_sw', '3f (150 Hz)', '2f (100 Hz)', 'f/2'], answer: 0, explain: 'Bipolar SPWM concentrates its harmonics around the carrier frequency and its multiples.' },
          { id: 'k4', type: 'mcq', prompt: 'What happens when m exceeds 1?', options: ['The waveform flattens and low-order harmonics reappear', 'The frequency doubles', 'The output becomes DC', 'The filter removes all distortion'], answer: 0, explain: 'Over-modulation drops pulses near the peaks, approaching a square wave.' },
        ],
        summary: [
          'SPWM compares a sine reference (amplitude m) with a triangle carrier (f_sw) to set the gates.',
          'Bipolar duty d = (1 + m·sin ωt)/2, so the average bridge voltage is m·V_dc·sin ωt.',
          'The fundamental output is m·V_eff·n/√2; the regulator adjusts m.',
          'Harmonics sit around f_sw (bipolar) or 2f_sw (unipolar), far above 50 Hz.',
          'Over-modulation (m > 1) brings back low-order harmonics; design for m ≤ 0.95.',
        ],
        homework: {
          id: 'S1.M3.L3.hw',
          title: 'SPWM for a 48 V, 230 V inverter',
          brief: 'V_eff = 45 V at nominal, 39 V at the cut-off; n = 9; f = 50 Hz; f_sw = 10 kHz.',
          tasks: [
            { id: 'h1', type: 'numeric', prompt: 'm for 230 V at nominal?', answer: 0.803, tol: 0.01, unit: '', explain: 'm = 230 × √2 / (45 × 9) = 325.3/405 = 0.803.' },
            { id: 'h2', type: 'numeric', prompt: 'm needed at the cut-off?', answer: 0.927, tol: 0.01, unit: '', explain: '325.3/(39 × 9) = 0.927.' },
            { id: 'h3', type: 'numeric', prompt: 'Frequency ratio m_f?', answer: 200, tol: 0.001, unit: '', explain: '10 000/50 = 200.' },
          ],
          written: [{ prompt: 'Is n = 9 a good ratio for this design? Justify your answer using h2.', model: 'Yes: at the cut-off m = 0.93 < 0.95, so the output can still be regulated without over-modulation. A smaller ratio would force m above 1 at low battery voltage.' }],
        },
      },
    },
    {
      id: 'S1.M3.L4',
      title: 'The LC output filter',
      minutes: 45,
      content: {
        objectives: [
          'Explain how an LC filter separates the 50 Hz fundamental from the switching harmonics.',
          'Calculate the corner frequency, the carrier attenuation and the resulting output ripple.',
          'Explain resonance and why a light load makes the filter ring.',
          'Calculate the filter capacitor’s reactive current and its effect on no-load consumption.',
        ],
        introduction: `The bridge output in an SPWM inverter is a train of ±V_dc pulses. Its *average* is the sine we want, but it carries enormous switching-frequency content. The [[lc-filter]] lets 50 Hz through almost untouched and removes the pulses. Project D places the inductor on the primary side of the transformer and the capacitor on the secondary. Electrically this is still one LC filter, scaled by the turns ratio.`,
        lecture: `### How the filter works

- The inductor's impedance X_L = 2πfL is small at 50 Hz and large at f_sw.
- The capacitor's impedance X_C = 1/(2πfC) is large at 50 Hz and small at f_sw.

The filter is therefore a voltage divider whose ratio depends on frequency:

- at 50 Hz, almost all the voltage reaches the load;
- at f_sw, the capacitor short-circuits the ripple and the inductor drops it.

### The transfer function

With the load R across the capacitor, the output-to-input ratio is

H(f) = 1 / (1 − (f/f_c)² + j·(f/f_c)/Q)

where f_c = 1/(2π√(LC)) is the [[corner-frequency]] and Q = R·√(C/L) is the quality factor.

- **Well below f_c:** H ≈ 1. The 50 Hz fundamental passes.
- **Well above f_c:** |H| ≈ (f_c/f)². The attenuation is 40 dB per decade (100× per decade).
- **Near f_c:** H rises to about Q. This is resonance.

### Choosing the corner

The design rule is f_c ≈ f_sw/10, and at least 10·f.

- With f_sw = 5 kHz and f = 50 Hz, a 500 Hz corner attenuates the carrier by (5000/500)² = 100. The fundamental passes with only 1/(1 − 0.01) = 1.01 gain, i.e. 1 % boost.
- A higher corner leaves more ripple.
- A lower corner needs larger, heavier L and C, makes the filter resonate closer to the harmonics of the load, and slows the regulator.

### Resonance and damping

At no load, R is very large and Q becomes high: the filter rings when disturbed and amplifies anything near f_c. In practice it is damped by:

- the resistance of the inductor and transformer;
- the load;
- in some designs, a deliberate damping resistor (an RC in parallel with C);
- active damping in the controller.

### Reactive current

The capacitor draws I_C = 2π·f·C·V at 50 Hz even with no load. For 4.7 µF at 230 V that is 0.34 A (78 var). This reactive current circulates through the bridge and the transformer, adding loss at no load. It is one reason a large filter capacitor is not free.

### Referring through the transformer

A capacitor C_s on a secondary with turns ratio n behaves, seen from the primary, like n²·C_s. With L on the primary, f_c = 1/(2π√(L·n²·C_s)).`,
        technical: `**Ripple estimate.** The first carrier harmonic of bipolar SPWM is of the order of V_dc (its exact amplitude depends on m). After the filter it is reduced by (f_c/f_sw)²: from 24 V to about 0.24 V on the primary, i.e. 4.8 V on a 230 V secondary with n = 20. That is roughly 2 % THD, consistent with what project D measures at rated load.

**Load dependence.** A heavy resistive load lowers Q and damps the filter. An inductive load adds to L and lowers the corner slightly. A rectifier load (computer supplies) draws current pulses at the voltage peaks, and these flow through L, distorting the voltage. Feedback can correct part of this.

**Capacitor type.** The output capacitor sees the full AC voltage, so it must be an AC-rated film capacitor (polypropylene), never an electrolytic.

**Model limits.** The simulator's inductor is linear with a series resistance; core saturation and losses, and capacitor ESR, are not modelled.`,
        diagrams: [{ id: 'lc-filter', caption: 'Magnitude response of the output filter for light and rated load, with the 50 Hz and carrier frequencies marked.' }],
        formulas: [
          { name: 'Corner frequency', expr: 'f_c = 1 / (2π · √(L · C))', where: [['L', 'filter inductance', 'H'], ['C', 'filter capacitance (referred to the same side)', 'F']] },
          { name: 'Attenuation above the corner', expr: '|H| ≈ (f_c / f)²  (−40 dB/decade)', where: [['f', 'frequency of interest', 'Hz']] },
          { name: 'Quality factor', expr: 'Q = R · √(C / L)', where: [['R', 'load resistance (same side)', 'Ω']] },
          { name: 'Reactive current of the capacitor', expr: 'I_C = 2π · f · C · V', where: [['V', 'output voltage', 'V rms']] },
        ],
        examples: [
          {
            title: 'Attenuation in project D',
            problem: 'L = 0.1 mH (primary), C = 4.7 µF (secondary), n = 20. Find the corner frequency and the attenuation at 5 kHz.',
            steps: ['C referred to the primary = 20² × 4.7 µF = 1880 µF', 'f_c = 1/(2π√(10⁻⁴ × 1.88 × 10⁻³)) = 1/(2π × 4.34 × 10⁻⁴) = 367 Hz', '|H(5 kHz)| ≈ (367/5000)² = 0.0054 → −45 dB'],
            answer: 'Corner ≈ 370 Hz (7.3× above 50 Hz); the carrier is attenuated about 185×.',
            check: 'The chosen standard values (0.1 mH, 4.7 µF) are larger than the calculated minimum, so the corner is below the 500 Hz target, which is acceptable as long as it stays well above 50 Hz. ✓',
          },
          {
            title: 'Quality factor at no load and at rated load',
            problem: 'Referred to the primary, the rated load is R = 52.9/400 = 0.132 Ω and the filter has L = 0.1 mH, C = 1880 µF. Find Q at rated load and comment on no load.',
            steps: ['√(C/L) = √(1.88 × 10⁻³ / 10⁻⁴) = √18.8 = 4.34', 'Q = 0.132 × 4.34 = 0.57 (well damped)', 'At no load R → very large: Q is limited only by winding and inductor resistance, so the filter can ring'],
            answer: 'Q ≈ 0.6 at rated load; much higher at no load, where resistances in the windings provide the only damping.',
          },
        ],
        applications: `Every grid-tied solar inverter and UPS has an output filter, often an LCL filter, designed to meet grid harmonic limits. Motor drives often omit the capacitor because the motor's inductance filters the current. Long motor cables, however, then need dv/dt filters.`,
        mistakes: [
          { mistake: 'Using an electrolytic capacitor on the AC output.', correction: 'It is polarised and fails on AC. Use an AC-rated film capacitor.' },
          { mistake: 'Making the filter as large as possible.', correction: 'A low corner needs heavy parts, draws large reactive current and slows regulation; place the corner near f_sw/10.' },
          { mistake: 'Forgetting the n² factor when the filter straddles the transformer.', correction: 'Refer C to the inductor’s side: C_p = n²·C_s.' },
        ],
        demo: {
          title: 'Interactive filter response',
          text: 'Move L, C and the load and watch the response curve, the corner frequency, the attenuation at the carrier and Q change. Then open project D and compare the measured THD.',
          link: to.build('Open project D', 'bld-d'),
          embed: 'lc-filter',
        },
        activities: [to.sim('Pure sine-wave inverter', 'sim-10'), to.lib('Inductor', 'inductor'), to.cmp('Capacitor types', 'capacitor-types'), to.lab3d('LF-3K output film capacitor', 'lf3k', 'c7')],
        check: [
          { id: 'k1', type: 'numeric', prompt: 'Corner frequency of L = 2 mH, C = 20 µF (Hz)?', answer: 795.8, tol: 0.01, unit: 'Hz', explain: '1/(2π√(4 × 10⁻⁸)) = 1/(2π × 2 × 10⁻⁴) = 796 Hz.' },
          { id: 'k2', type: 'numeric', prompt: 'Attenuation factor at 10 kHz for f_c = 1 kHz (×)?', answer: 100, tol: 0.01, unit: '×', explain: '(10 000/1000)² = 100 (40 dB).' },
          { id: 'k3', type: 'numeric', prompt: 'Reactive current of 10 µF at 230 V, 50 Hz (A)?', answer: 0.7226, tol: 0.01, unit: 'A', explain: '2π × 50 × 10⁻⁵ × 230 = 0.723 A.' },
          { id: 'k4', type: 'mcq', prompt: 'When does the output filter ring most strongly?', options: ['At no load (high Q)', 'At rated resistive load', 'At overload', 'Never'], answer: 0, explain: 'Q = R·√(C/L) is largest when R is largest.' },
        ],
        summary: [
          'The LC filter passes 50 Hz and attenuates switching harmonics at 40 dB/decade above f_c.',
          'Place f_c near f_sw/10 and at least 10× the output frequency.',
          'Q = R·√(C/L): high at light load, so the filter must be damped by losses, load or design.',
          'The capacitor draws reactive current 2πfCV even at no load; use AC film capacitors.',
          'Across a transformer, refer C by n².',
        ],
        homework: {
          id: 'S1.M3.L4.hw',
          title: 'Filter check for a 48 V design',
          brief: 'L = 0.16 mH on the primary, C_s = 6.8 µF on the secondary, n = 5.2, f_sw = 10 kHz, V_out = 230 V.',
          tasks: [
            { id: 'h1', type: 'numeric', prompt: 'C referred to the primary (µF)?', answer: 183.9, tol: 0.01, unit: 'µF', explain: '5.2² × 6.8 = 27.04 × 6.8 = 183.9 µF.' },
            { id: 'h2', type: 'numeric', prompt: 'Corner frequency (Hz)?', answer: 928, tol: 0.02, unit: 'Hz', explain: '1/(2π√(1.6 × 10⁻⁴ × 1.839 × 10⁻⁴)) = 1/(2π × 1.715 × 10⁻⁴) = 928 Hz.' },
            { id: 'h3', type: 'numeric', prompt: 'Capacitor reactive current at 230 V (A)?', answer: 0.491, tol: 0.02, unit: 'A', explain: '2π × 50 × 6.8 × 10⁻⁶ × 230 = 0.491 A.' },
          ],
          written: [{ prompt: 'Is this filter acceptable? Use f_c/f and f_sw/f_c.', model: 'f_c/f = 18.6 (well above 10) and f_sw/f_c = 10.8 (≈ a decade), giving ≈ 100× carrier attenuation: a sound design.' }],
        },
      },
    },
    {
      id: 'S1.M3.L5',
      title: 'Feedback, regulation and output protection',
      minutes: 45,
      content: {
        objectives: [
          'Explain how voltage feedback holds the output constant against battery and load changes.',
          'Calculate line and load regulation from measurements.',
          'Describe the regulator in project D and why its correction is limited each cycle.',
          'Explain the output protection functions: overcurrent, short circuit, overload, over-temperature and loss of feedback.',
        ],
        introduction: `Without [[feedback]], an inverter's output follows its battery and sags under load (project B). With feedback, the controller measures the output and corrects the [[modulation-index]] until the output matches its set-point. Protection is feedback of a different kind: measurements that turn the inverter *off* before something is damaged.`,
        lecture: `### The feedback loop

1. A **voltage sensor** (VS1 in project D) measures the output, scaled down and isolated.
2. The controller computes the **RMS** over each output cycle.
3. The **error** e = (V_set − V_rms) / V_set is computed.
4. The **regulator** updates m once per cycle: m_new = m · (1 + k·e). Project D uses k = 0.6, with e limited to ±50 % and m kept between 0.02 and 1.
5. The SPWM generator uses the new m.

If the battery falls, the output falls, e becomes positive, and m rises until the output is back at 230 V. If the load is removed, the output rises, and m falls.

### Why limit the correction?

The output can only be measured once per cycle, and the LC filter delays the response. A regulator that corrected the whole error at once, or more, could overshoot and oscillate. A partial correction (k < 1) converges in a few cycles without overshoot. Commercial controllers use PI or more advanced loops, often with an inner current loop and an outer voltage loop. That is the subject of control engineering.

### Measuring regulation

- **[[line-regulation|Line regulation]]** = (V_out at max input − V_out at min input) / V_nominal. A regulated inverter achieves a few per cent or better; an unregulated one ±15–20 %.
- **[[load-regulation|Load regulation]]** = (V_out at no load − V_out at full load) / V_nominal.

Project D's test suite measures both. The regulated criterion is ±5 % line and within ±3 % of 230 V at rated load.

### The regulator's limit

Regulation works only while m can still rise. If the battery is so low that m = 1 is not enough, the output falls. That is why the transformer ratio is designed for m = 0.95 at the cut-off, and why the [[lvd|low-voltage disconnect]] is set there.

### Output protection

| Protection | Sensor | Action |
|---|---|---|
| **Overcurrent / short circuit** | Current sensor (Hall or shunt) or desaturation detection in the driver | Gates off within microseconds; restart attempts or latch-off. The fuse and breaker are too slow to save the switches |
| **Overload** | Current or power measurement | Delivered for a limited time (a few seconds at 150 %, typical), then shut-down; the time depends on the thermal design |
| **Over-temperature** | Heat-sink thermistor | Fan on, then derating, then shut-down |
| **Loss of feedback** | Plausibility check | Shut-down: the controller must not treat a missing sensor signal as "output too low" |
| **Output breaker** | Thermal/magnetic | Protects the output wiring |

### Loss of feedback, in detail

If the sensor is disconnected, the regulator sees 0 V and drives m to its maximum, and the output rises to n·V_dc with no regulation. Troubleshooting task D shows exactly this.`,
        technical: `**A proportional, multiplicative regulator.** Writing the update as m_{k+1} = m_k·(1 + k·e_k) makes the correction proportional to the present m, so it behaves similarly at any operating point. Near steady state, V_rms ∝ m. With k = 0.6, each cycle removes 60 % of the remaining error: after 3 cycles 6.4 % of the original error remains, and after 5 cycles about 1 %.

**Why RMS and not peak?** RMS is what loads respond to. RMS regulation also corrects small waveform distortions only on average. Faster controllers regulate the instantaneous waveform against a sine reference.

**Educational simplification.** The project D regulator is deliberately simple and slow so that its behaviour is visible in the simulation. Its protection functions (fuse, breaker) are modelled; electronic shut-down is described here but not modelled in the circuit.`,
        diagrams: [{ id: 'feedback-loop', caption: 'The voltage regulation loop of project D and the protection signals that override it.' }],
        formulas: [
          { name: 'Regulator update (once per cycle)', expr: 'm_new = m · (1 + k · e),  e = (V_set − V_rms) / V_set', where: [['k', 'regulator gain (0.6 in project D)', '—'], ['V_set', 'set-point', 'V rms']] },
          { name: 'Line regulation', expr: 'LR = (V_out,maxin − V_out,minin) / V_nom', where: [['V_out,maxin', 'output at maximum input', 'V']] },
          { name: 'Load regulation', expr: 'LdR = (V_out,no-load − V_out,full-load) / V_nom', where: [] },
        ],
        examples: [
          {
            title: 'Convergence of the regulator',
            problem: 'The battery drops suddenly and the output falls to 207 V (10 % low). With k = 0.6, how large is the error after 1, 2 and 3 cycles (assuming V_rms ∝ m)?',
            steps: ['Each cycle the remaining error is multiplied by (1 − 0.6) = 0.4', 'After 1 cycle: 10 % × 0.4 = 4 % (221 V)', 'After 2: 1.6 % (226 V); after 3: 0.64 % (228.5 V)'],
            answer: 'Within 1 % in three cycles (60 ms at 50 Hz), without overshoot.',
          },
          {
            title: 'Interpreting project D’s regulation test',
            problem: 'Project D’s suite (reference design) measures 226.3 V at 21 V input and 232.1 V at 28.8 V, and 231.0 V at no load against 229.7 V at full load. Find the line and load regulation.',
            steps: ['Line regulation = (232.1 − 226.3)/230 = 2.5 %', 'Load regulation = (231.0 − 229.7)/230 = 0.6 %'],
            answer: '2.5 % line and 0.6 % load regulation: within the ±5 % criterion. Project B, unregulated, measures 201 V to 276 V over the same battery range (32 %).',
          },
        ],
        applications: `Every UPS and sine-wave inverter regulates its output, and data sheets quote output voltage tolerance (often ±2–5 %). Short-circuit protection by desaturation detection is standard in IGBT drivers. Microcontroller firmware runs plausibility checks on every sensor before trusting it.`,
        mistakes: [
          { mistake: 'Correcting the whole error in one step to make the regulator faster.', correction: 'With a measurement delay and a filter in the loop, full correction overshoots and can oscillate; partial correction converges reliably.' },
          { mistake: 'Relying on the fuse to protect the bridge from an output short.', correction: 'Switches fail in microseconds; electronic current limiting must act first.' },
          { mistake: 'Treating a 0 V sensor reading as a real 0 V output.', correction: 'Check plausibility: a missing or failed sensor must cause a shut-down, not maximum drive.' },
        ],
        demo: {
          title: 'Fault: feedback lost',
          text: 'In project D, run the resistive test, then disconnect the voltage sensor VS1 and run it again. Explain the result in terms of the regulator equation.',
          link: to.build('Open project D', 'bld-d'),
        },
        activities: [to.lib('Voltage sensor', 'voltage-sensor'), to.lib('Current sensor', 'current-sensor'), to.lab3d('LF-3K Hall current sensor', 'lf3k', 'hall'), to.cmp('Voltage versus current sensing', 'voltage-vs-current-sensing')],
        check: [
          { id: 'k1', type: 'numeric', prompt: 'Line regulation: 226 V at minimum input, 234 V at maximum, nominal 230 V (%)?', answer: 3.48, tol: 0.02, unit: '%', explain: '(234 − 226)/230 = 3.5 %.' },
          { id: 'k2', type: 'numeric', prompt: 'With k = 0.5, what fraction of an error remains after 4 cycles (%)?', answer: 6.25, tol: 0.01, unit: '%', explain: '0.5⁴ = 0.0625.' },
          { id: 'k3', type: 'mcq', prompt: 'The output of a regulated inverter is 25 % high and does not change with battery voltage. The most likely fault is…', options: ['Feedback sensor disconnected; m driven to its maximum', 'Output breaker tripped', 'Fuse blown', 'Filter capacitor missing'], answer: 0, explain: 'With no feedback signal the regulator raises m to 1.' },
          { id: 'k4', type: 'mcq', prompt: 'Which protection acts fastest on an output short circuit?', options: ['Electronic overcurrent shut-down of the gates', 'DC fuse', 'Output breaker', 'Over-temperature sensor'], answer: 0, explain: 'Gate shut-down acts in microseconds.' },
        ],
        summary: [
          'Feedback measures the output RMS and adjusts m to hold the set-point.',
          'Partial correction each cycle (k < 1) converges without overshoot.',
          'Line and load regulation quantify how well the output is held.',
          'Regulation fails when m reaches 1: design the ratio for m ≈ 0.95 at the cut-off.',
          'Protection: µs overcurrent shut-down, timed overload, over-temperature, plausibility checks, breaker.',
        ],
        homework: {
          id: 'S1.M3.L5.hw',
          title: 'Regulator and protection analysis',
          brief: 'A regulator with k = 0.4 starts with the output 15 % low.',
          tasks: [
            { id: 'h1', type: 'numeric', prompt: 'Error remaining after 3 cycles (%)?', answer: 3.24, tol: 0.02, unit: '%', explain: '15 % × 0.6³ = 3.24 %.' },
            { id: 'h2', type: 'numeric', prompt: 'Cycles needed to get below 1 % (integer)?', answer: 6, tol: 0.001, unit: '', explain: '15 × 0.6ⁿ < 1 → n > ln(15)/ln(1/0.6) = 5.3 → 6 cycles.' },
            { id: 'h3', type: 'numeric', prompt: 'Time for those cycles at 50 Hz (ms)?', answer: 120, tol: 0.01, unit: 'ms', explain: '6 × 20 ms = 120 ms.' },
          ],
          written: [{ prompt: 'Describe the sequence of protective actions you would design for a sustained 200 % overload.', model: 'Current sensing detects the overload immediately; the controller limits the current (or allows a short surge, e.g. up to a few seconds for motor starting); if it persists, the controller shuts the bridge down and signals an overload fault; the heat-sink sensor provides a backup shut-down; the breaker and fuse are the last line of protection for the wiring.' }],
        },
      },
    },
    {
      id: 'S1.M3.L6',
      title: 'Building the pure sine-wave inverter (project D)',
      minutes: 60,
      legacyId: 'bld-d',
      content: {
        objectives: [
          'Configure, select components for and assemble project D with every step verified.',
          'Probe and explain the relationship between switching signals, the bridge voltage and the filtered output.',
          'Run the complete engineering test suite and interpret every reading.',
          'Diagnose the troubleshooting fault from its measurements.',
        ],
        introduction: `This lesson brings the module together. You will build the inverter in the build laboratory in the order a technician would assemble it. Each step is verified on the electrical graph, and the finished design is put through the same ten tests a development engineer would run.`,
        lecture: `### 1. Configure

Choose the input (12/24/48 V), the output (110/230 V, 50/60 Hz), the power, and the switching frequency (2.5/5/10 kHz). Read the calculation sheet: every number has its formula, its working and an explanation, and assumptions are marked.

### 2. Select components

Choose the switch type and ratings, driver, controller, transformer, filter, bus capacitor, fuse, breaker and sensors. Resolve every failed compatibility check; read every warning. Remember: library values are *typical*. A real build would confirm each one against a [[datasheet]].

### 3. Assemble, in stages

| Stage | What you connect | What is verified |
|---|---|---|
| Input and protection | Battery + to fuse F1; battery − to earth | Fuse in series with the battery positive |
| DC bus | C1 across the fused bus, with correct polarity | C1 + on the fused positive, C1 − on the negative |
| Power stage | Leg A (Q1 above Q2), leg B (Q3 above Q4); drains to the bus, sources to the negative rail | Each switch between the right nodes |
| Control and gate drive | Each generator across its switch’s gate and source; SPWM in complementary pairs with dead time | Gate–source connections; regulated SPWM if a sensor is fitted |
| Filter and transformer | L1 from leg A to the primary; the primary’s other end to leg B; the secondary to C2 | Series path through L1 |
| Output and protection | C2 across the secondary, through breaker CB1 to the load; neutral to earth | Two-pole breaker in both conductors, earth bond |
| Feedback | VS1 across the output | Sensor across line and neutral |

Beginners have the parts pre-placed and see detailed instructions. Intermediate and advanced learners place and rotate the parts themselves, with progressively shorter instructions.

### 4. Probe the chain

With the simulation running, look at four signals on the same time axis:

1. **A gate signal (G1):** pulses at 5 kHz whose width varies sinusoidally.
2. **The bridge voltage (leg A to leg B):** pulses of ±V_dc.
3. **The primary current:** a sine plus a small triangular ripple at 5 kHz (the inductor at work).
4. **The output voltage:** a clean 230 V sine.

The relationship between them is the subject of lessons L3 and L4: duty (1 + m·sin ωt)/2 → average m·V_dc·sin ωt → filtered, then stepped up by n.

### 5. Test

The suite simulates each condition and measures:

| Test | Measures | Criterion |
|---|---|---|
| No-load | Input current, output | Low standby consumption, output regulated |
| Resistive (rated) | V, f, P | Within ±3 % of 230 V, f within ±1 %, power delivered |
| Inductive (PF ≈ 0.8) | V, I, power factor, input current | Output held; energy returns through the diodes |
| Overload (150 %) | V, T_j | Output held with T_j ≤ 150 °C, or protection operates |
| Short circuit | Protection | A protective device must operate |
| Low and high battery | Output | Within ±5 % (regulated) |
| Regulation | Line and load regulation | Within limits |
| Efficiency | η | ≥ 80 % (simulated) |
| Thermal | Hottest T_j | ≤ 125 °C |
| Waveform | THD, frequency | THD < 5 % |

The report records every reading with its criterion and an explanation. You can export it.`,
        technical: `**Why the simulated efficiency is higher than a real product’s.** The models omit core loss beyond the typical transformer figure, capacitor ESR, gate-drive power, wiring and EMI filters. A simulated 93 % may be 88–90 % in reality.

**The test time window.** Each test simulates six output cycles: three to settle (filter, regulator, magnetising current) and three to measure. The regulator converges within about three cycles (lesson L5).

**Thermal results** are steady-state estimates from simulated losses and your heat-sink choice, with no thermal capacitance. A short overload is therefore judged pessimistically.

**What completion means.** The project is complete only when every assembly step is verified on the connection graph *and* every test passes on your circuit as you built it.`,
        diagrams: [
          { id: 'spwm', caption: 'Gate pulses, bridge voltage and filtered output on one time axis.' },
          { id: 'schematic:bld-d', caption: 'The reference assembly of project D.' },
          { id: 'test-bench', caption: 'What each engineering test changes in the circuit.' },
        ],
        formulas: [
          { name: 'Output chain', expr: 'v_out(t) ≈ n · m · V_eff · sin ωt  (after the LC filter)', where: [['V_eff', 'bus voltage less drops', 'V']] },
          { name: 'Measured efficiency', expr: 'η = P_out / P_in = mean(v_out·i_out) / mean(v_bat·i_bat)', where: [] },
        ],
        examples: [
          {
            title: 'Reading project D’s rated-load result',
            problem: 'The suite reports for the reference design: V = 229.7 V, P_out = 997.9 W, mean battery current 47.7 A, and an input power of 1073.7 W measured as the mean of v·i at the battery terminals. Why does 24 V × 47.7 A give a different efficiency?',
            steps: ['Nominal voltage × mean current: 24 × 47.69 = 1144.6 W → η = 997.9/1144.6 = 87.2 %', 'Measured: η = 997.9/1073.7 = 92.9 % (calculation sheet: 93.6 %)', 'Effective terminal voltage = 1073.7/47.69 = 22.5 V: the 20 mΩ battery resistance drops the voltage under load, and with the 100 Hz ripple it is lowest exactly when the current is highest'],
            answer: 'The power lost inside the battery is not an inverter loss. Always compute power as the mean of v·i measured at the same point, not as nominal voltage × mean current.',
          },
          {
            title: 'Bridge voltage to output',
            problem: 'At the instant ωt = 90° (positive peak), m = 0.79, V_dc = 24 V. What duty does G1 have, and what output voltage results with n = 20, ignoring drops?',
            steps: ['d = (1 + 0.79)/2 = 0.895', 'Average bridge voltage = (2 × 0.895 − 1) × 24 = 18.96 V', 'Output ≈ 20 × 18.96 = 379 V peak (drops reduce it to about 325 V)'],
            answer: 'G1 is on 89.5 % of each carrier period at the peak. The ideal output peak of 379 V falls to the regulated 325 V once the drops are included, which is why m is set by the regulator rather than calculated once.',
          },
        ],
        applications: `This is the architecture of a low-frequency pure sine-wave inverter or UPS: a microcontroller generating SPWM, bootstrap drivers, a MOSFET bridge, a 50 Hz transformer with the output filter, and RMS regulation. The 3D LF-3K model is built on the same architecture.`,
        mistakes: [
          { mistake: 'Probing the bridge voltage and expecting a sine.', correction: 'The bridge output is PWM pulses; the sine appears only after the filter.' },
          { mistake: 'Computing input power from the nominal battery voltage.', correction: 'Use the measured terminal voltage and current together.' },
          { mistake: 'Treating a passed simulation as a buildable design.', correction: 'It is an educational design: real construction needs datasheet-verified parts, layout, EMI, safety testing and certification.' },
        ],
        demo: {
          title: 'Build and test project D',
          text: 'Complete project D, probe the four signals above, run the full suite and export the report. Then solve its troubleshooting task.',
          link: to.build('Open project D', 'bld-d'),
          embed: 'spwm-chain',
        },
        activities: [to.build('Project D', 'bld-d'), to.sim('Pure sine-wave inverter experiment', 'sim-10'), to.lab3d('LF-3K architecture', 'lf3k', 'u6')],
        check: [
          { id: 'k1', type: 'mcq', prompt: 'Which signal in project D is a clean 50 Hz sine?', options: ['The output voltage after C2', 'The gate signal G1', 'The bridge voltage', 'The battery current'], answer: 0, explain: 'Only the filtered output is sinusoidal.' },
          { id: 'k2', type: 'numeric', prompt: 'G1 duty at ωt = 270° with m = 0.8 (%)?', answer: 10, tol: 0.01, unit: '%', explain: '(1 − 0.8)/2 = 0.10.' },
          { id: 'k3', type: 'mcq', prompt: 'Which test checks that a protective device operates?', options: ['The short-circuit test', 'The no-load test', 'The waveform test', 'The thermal test'], answer: 0, explain: 'A short across the output must operate the fuse, breaker or electronic protection.' },
          { id: 'k4', type: 'mcq', prompt: 'When is project D credited as complete?', options: ['All assembly steps verified on the connection graph and all tests passed', 'All parts placed', 'The configurator filled in', 'The simulation started'], answer: 0, explain: 'Completion requires correct connections and verified electrical behaviour.' },
        ],
        summary: [
          'Configure → select → assemble in stages → probe → test → report.',
          'Gate pulses (varying width) → bridge pulses (±V_dc) → filtered sine → stepped up by n.',
          'The ten tests cover no-load, rated, inductive, overload, short circuit, line, regulation, efficiency, thermal and waveform.',
          'Compute power from measured voltage and current together.',
          'A passing project is a successful educational design, not a certified one.',
        ],
        homework: {
          id: 'S1.M3.L6.hw',
          title: 'Project D test report analysis',
          brief: 'Use the reference design’s simulated results: rated V = 229.7 V; at 21 V input 226.3 V; at 28.8 V 232.1 V; no load 231.0 V; P_out = 997.9 W; P_in = 1073.7 W; hottest T_j = 76 °C; THD = 2.0 %.',
          tasks: [
            { id: 'h1', type: 'numeric', prompt: 'Efficiency (%)?', answer: 92.94, tol: 0.01, unit: '%', explain: '997.9/1073.7 = 92.9 %.' },
            { id: 'h2', type: 'numeric', prompt: 'Line regulation (%)?', answer: 2.52, tol: 0.02, unit: '%', explain: '(232.1 − 226.3)/230 = 2.5 %.' },
            { id: 'h3', type: 'numeric', prompt: 'Heat produced in the inverter at rated load (W)?', answer: 75.8, tol: 0.01, unit: 'W', explain: '1073.7 − 997.9 = 75.8 W.' },
          ],
          written: [{ prompt: 'Write a short engineering conclusion for this report, including one limitation of the simulation.', model: 'The design meets all criteria: output 229.7 V (−0.1 %), line regulation 2.5 %, efficiency 92.9 %, T_j 76 °C (limit 125 °C), THD 2 % (< 5 %). Limitation: the models omit core and ESR losses, EMI and thermal capacitance, so real efficiency will be lower and real overload capability must be verified by physical testing.' }],
        },
      },
    },
  ],
  quiz: {
    pass: 0.7,
    questions: [
      { id: 'q1', type: 'mcq', prompt: 'Which stage turns the microcontroller’s logic signals into 12 V gate transitions?', options: ['Gate drivers', 'The LC filter', 'The voltage sensor', 'The transformer'], answer: 0, explain: 'Gate drivers supply the gate charge at the right voltage, with floating high sides.' },
      { id: 'q2', type: 'numeric', prompt: 'Bipolar SPWM, m = 0.7: duty at the positive peak (%)?', answer: 85, tol: 0.01, unit: '%', explain: '(1 + 0.7)/2 = 0.85.' },
      { id: 'q3', type: 'numeric', prompt: 'Dead-time error: t_d = 1 µs, f_sw = 20 kHz, V_dc = 24 V (V)?', answer: 0.96, tol: 0.01, unit: 'V', explain: '2 × 10⁻⁶ × 2 × 10⁴ × 24 = 0.96 V.' },
      { id: 'q4', type: 'numeric', prompt: 'Corner frequency of L = 0.5 mH and C = 100 µF (Hz)?', answer: 711.8, tol: 0.01, unit: 'Hz', explain: '1/(2π√(5 × 10⁻⁸)) = 1/(2π × 2.236 × 10⁻⁴) = 712 Hz.' },
      { id: 'q5', type: 'mcq', prompt: 'The battery supplies most of which current component?', options: ['The 100 Hz ripple', 'The 5 kHz switching pulses', 'The gate charge', 'None'], answer: 0, explain: 'At 100 Hz the battery’s impedance is lowest.' },
      { id: 'q6', type: 'mcq', prompt: 'Over-modulation (m > 1) causes…', options: ['low-order harmonics', 'a higher switching frequency', 'zero output', 'lower switching loss only'], answer: 0, explain: 'Pulses merge near the peaks and the wave approaches a square.' },
      { id: 'q7', type: 'numeric', prompt: 'Load regulation: 232 V at no load, 228 V at full load, nominal 230 V (%)?', answer: 1.74, tol: 0.02, unit: '%', explain: '4/230 = 1.7 %.' },
      { id: 'q8', type: 'mcq', prompt: 'The output filter capacitor must be…', options: ['an AC-rated film capacitor', 'an electrolytic', 'a ceramic of any voltage', 'polarised'], answer: 0, explain: 'It sees full AC voltage.' },
      { id: 'q9', type: 'mcq', prompt: 'In project D the voltage sensor is disconnected. The output will…', options: ['rise and stop regulating', 'fall to zero', 'stay at 230 V', 'become DC'], answer: 0, explain: 'The regulator sees 0 V and drives m to its maximum.' },
      { id: 'q10', type: 'multi', prompt: 'Which statements about the pure-sine signal chain are correct? (select all)', options: ['The gate pulse width varies sinusoidally', 'The bridge voltage is a sine', 'The filtered output is a sine', 'The regulator changes m'], answers: [0, 2, 3], explain: 'The bridge voltage is a train of full-amplitude pulses.' },
    ],
  },
  assignment: {
    id: 'S1.M3.asg',
    title: 'Module assignment: design review of a 12 V, 600 W pure sine inverter',
    brief: 'V_eff = 10.2 V at the 10.5 V cut-off (after drops and r_x), f_sw = 5 kHz, I_pk,pri = 95 A, V_out = 230 V.',
    tasks: [
      { id: 'a1', type: 'numeric', prompt: 'Turns ratio for m = 0.95 at the cut-off?', answer: 33.57, tol: 0.01, unit: '', explain: 'n = 325.3/(0.95 × 10.2) = 33.6.' },
      { id: 'a2', type: 'numeric', prompt: 'Filter inductance for 25 % ripple with V_bus = 12 V (µH)?', answer: 50.5, tol: 0.02, unit: 'µH', explain: 'ΔI = 23.75 A; L = 12/(2 × 5000 × 23.75) = 50.5 µH.' },
      { id: 'a3', type: 'numeric', prompt: 'Secondary capacitance for f_c = 500 Hz (µF)?', answer: 1.78, tol: 0.03, unit: 'µF', explain: 'C_ref = 1/((2π × 500)² × 50.5 × 10⁻⁶) = 2006 µF; C_s = 2006/33.57² = 1.78 µF.' },
      { id: 'a4', type: 'numeric', prompt: 'Dead-time error with t_d = 1 µs (V)?', answer: 0.12, tol: 0.01, unit: 'V', explain: '2 × 10⁻⁶ × 5000 × 12 = 0.12 V.' },
    ],
    written: [{ prompt: 'List the protection functions this inverter needs and what senses each.', model: 'DC fuse (wiring) at the battery; LVD at 10.5 V (battery voltage sense); electronic overcurrent/short-circuit shut-down (Hall or shunt current sensor, or driver desaturation); timed overload; over-temperature (heat-sink thermistor) with fan control; feedback plausibility check (voltage sensor); output breaker and earth bond with RCD.' }],
  },
  practicals: [
    { id: 'S1.M3.P1', title: 'Pure sine-wave experiment', description: 'Complete the Phase 5 pure sine-wave inverter experiment.', link: to.sim('Pure sine-wave inverter', 'sim-10'), evidence: { kind: 'activity', id: 'sim:sim-10' } },
    { id: 'S1.M3.P2', title: 'Build project D', description: 'Assemble the pure sine-wave inverter and pass the full test suite.', link: to.build('Project D', 'bld-d'), evidence: { kind: 'project', id: 'bld-d' } },
    { id: 'S1.M3.P3', title: 'Troubleshoot project D', description: 'Diagnose project D’s fault from its test readings.', link: to.build('Project D troubleshooting', 'bld-d'), evidence: { kind: 'troubleshoot', project: 'bld-d' } },
  ],
}
