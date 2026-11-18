import type { AcademyModule } from '../types'
import { to } from '../s1/links'

/** F3.M1 Alternating quantities. */
export const F3_M1: AcademyModule = {
  id: 'F3.M1',
  title: 'Alternating quantities',
  summary: 'Why AC is used at all, and the vocabulary — amplitude, period, frequency, phase, peak, average and RMS — needed for everything else in this course.',
  lessons: [
    {
      id: 'F3.M1.L1',
      title: 'Why AC is used',
      minutes: 30,
      content: {
        objectives: [
          'Explain why electrical power is generated, transmitted and mostly used as AC rather than DC.',
          'Explain the role of the transformer in making AC practical for long-distance transmission.',
          'State why an inverter must synthesise AC from a DC source, rather than simply being "turned on".',
        ],
        introduction: `You have already met [[dc|DC]] and [[ac|AC]] in F1 as a safety distinction. This course picks the same two ideas up as an engineering one: WHY does almost every grid, and every inverter's output, use AC rather than DC? The short answer is **transformers** — and transformers only work on AC. Understanding this motivates everything else in F3: reactance, impedance, power factor, and the whole reason inverters exist.`,
        lecture: `### The transmission problem

Electrical power is P = V × I. For a given power delivered, a higher transmission voltage means a lower current, and lower current means smaller conductors and far less resistive loss (P_loss = I²R) over long transmission distances. So power is generated and transmitted at a HIGH voltage, then stepped down to a safe, usable LOW voltage close to where it is consumed.

### Why this needs AC

Stepping voltage up and down efficiently, at high power, with no moving parts and very little loss, is exactly what a **transformer** does — and a transformer works by mutual induction (F3.M4), which requires a CHANGING magnetic field. A steady DC current produces a steady, unchanging magnetic field and induces nothing in a second winding. An alternating current, by continuously changing, induces a continuously changing voltage in the other winding, scaled by the turns ratio. **No practical, lossless way to transform a DC voltage up and down existed until relatively recently (modern DC-DC converters, themselves often built around a high-frequency AC stage inside them) — AC transformers have been doing this job cheaply and reliably for over a century.**

### Why your appliances and the grid still use AC today

Having built an entire grid around efficient AC transmission and transformation, it then made sense to standardise AC at the point of use too: motors, lighting and most appliances are designed to run directly from the grid's AC supply.

### Why an inverter has to *synthesise* AC

A battery or solar array is fundamentally a DC source: it has a fixed polarity and does not reverse on its own. To supply AC loads (or feed an AC grid) from a DC source, an inverter must actively and repeatedly REVERSE the polarity presented to the output, at the required frequency (50 or 60 Hz) — this is exactly the job of the H-bridge you built in the Circuit Connection Laboratory. "Inverting" DC to AC is therefore a genuinely active process requiring switching devices and control, not a passive one.`,
        technical: `**DC transmission exists too.** High-Voltage DC (HVDC) transmission is used for some very long or undersea links, because it avoids some AC-specific losses (reactive power flow) over extreme distances; but it requires expensive power-electronic converter stations at each end to interface with the surrounding AC grid, so it remains the exception, not the rule, for ordinary transmission and distribution.

**Frequency choice (50 vs 60 Hz) is historical, not fundamental.** Different regions settled on 50 Hz or 60 Hz for historical reasons related to early generator and motor designs; neither is intrinsically "better", and this programme treats both as valid depending on the market an inverter is designed for.`,
        diagrams: [{ id: 'system-types', caption: 'Generation at high voltage, step-down by transformer toward the point of use, and the inverter\'s role in supplying AC loads from a DC source.' }],
        formulas: [{ name: 'Transmission loss', expr: 'P_loss = I² · R_line', where: [['P_loss', 'power lost in the transmission line', 'W'], ['I', 'line current', 'A'], ['R_line', "the line's resistance", 'Ω']], note: 'For fixed power delivered, raising voltage lowers current and sharply lowers loss.' }],
        examples: [
          {
            title: 'Why higher transmission voltage reduces loss',
            problem: 'A 100 kW load is supplied at (a) 1000 V and (b) 10,000 V, through a line of resistance 2 Ω. Compare the transmission loss.',
            steps: ['(a) I = P/V = 100,000/1000 = 100 A; loss = I²R = 100² × 2 = 20,000 W', '(b) I = 100,000/10,000 = 10 A; loss = 10² × 2 = 200 W'],
            answer: 'Raising the voltage tenfold cuts the current tenfold and the transmission loss by a hundredfold (20 kW → 200 W) — the direct motivation for high-voltage transmission.',
            check: 'Loss scales with I², so a tenfold drop in current gives a hundredfold drop in loss, consistent with the result.',
          },
          {
            title: 'Why a transformer cannot step down DC',
            problem: 'Explain, in terms of mutual induction, why connecting a DC source to a transformer\'s primary winding does not produce a stepped-down voltage at the secondary (beyond a brief instant at switch-on).',
            steps: ['A transformer induces voltage in its secondary winding only from a CHANGING magnetic flux', 'A steady DC current produces a steady flux once established', 'With no ongoing change in flux, no ongoing voltage is induced'],
            answer: 'Only at the instant of switching the DC on or off does the flux change, inducing a brief pulse; a steady DC current gives essentially zero secondary voltage.',
          },
        ],
        applications: `This is the engineering reason the Build Your Own Inverter laboratory exists at all: converting a battery's or solar array's DC into usable AC is not optional plumbing, it is the entire function of the product.`,
        mistakes: [
          { mistake: '"AC is just how electricity naturally comes out of a generator; DC needs special equipment."', correction: 'Both require specific generator designs; AC was chosen deliberately because it pairs with transformers for efficient transmission.' },
          { mistake: 'Assuming an inverter "converts" DC to AC the way a translator converts language, with no active switching involved.', correction: 'An inverter actively and repeatedly reverses the polarity presented to its output using switching devices under control — it is a genuinely active process.' },
          { mistake: 'Thinking higher voltage is dangerous, so transmission always uses lower voltage.', correction: 'Transmission deliberately uses high voltage to minimise current and loss; the resulting safety management (clearances, insulation, access control) is handled separately, not avoided.' },
        ],
        demo: { title: 'Revisit the H-bridge', text: 'The Circuit Connection Laboratory\'s H-bridge exercise is the switching core behind every inverter output waveform this course studies.', link: to.ckt('H-bridge exercise', 'ckt-09') },
        activities: [to.ckt('Full H-bridge exercise', 'ckt-09'), to.lib('Transformer', 'transformer')],
        check: [
          { id: 'k1', type: 'mcq', prompt: 'Why is power transmitted at high voltage?', options: ['To reduce current and therefore resistive loss for the same delivered power', 'Because generators can only produce high voltage', 'To make it safer to touch', 'To reduce the frequency'], answer: 0, explain: 'Loss = I²R; lower current at the same power sharply reduces loss.' },
          { id: 'k2', type: 'mcq', prompt: 'Why does AC pair naturally with transformers, while DC does not?', options: ['Transformers need a changing magnetic flux, which only alternating current provides continuously', 'Transformers only work below 100 V', 'DC is always more powerful', 'Transformers need high frequency only'], answer: 0, explain: 'A steady DC current gives a steady, non-inducing flux once established.' },
          { id: 'k3', type: 'mcq', prompt: 'An inverter converts DC to AC by...', options: ['actively and repeatedly reversing the polarity presented to the output using switching devices', 'passively filtering the DC', 'simply connecting the battery directly to the load', 'increasing the DC voltage only'], answer: 0, explain: 'This is the H-bridge\'s job.' },
          { id: 'k4', type: 'numeric', prompt: 'Transmission loss through a 1 Ω line carrying 50 A (W)?', answer: 2500, tol: 0.01, unit: 'W', explain: 'P = I²R = 2500 × 1 = 2500 W.' },
        ],
        summary: [
          'Power is transmitted at high voltage to minimise current and resistive loss for the same delivered power.',
          'Transformers only work on AC, because they require a continuously changing magnetic flux.',
          'This is the fundamental reason grids and most appliances use AC.',
          'An inverter actively synthesises AC from a DC source by repeatedly reversing polarity — it does not simply "convert" it passively.',
        ],
        homework: {
          id: 'F3.M1.L1.hw',
          title: 'Transmission loss practice',
          brief: 'Apply P_loss = I²R at different voltages.',
          tasks: [
            { id: 'h1', type: 'numeric', prompt: 'A 50 kW load through a 1.5 Ω line at 5000 V. Current (A)?', answer: 10, tol: 0.02, unit: 'A', explain: 'I = P/V = 50,000/5000 = 10 A.' },
            { id: 'h2', type: 'numeric', prompt: 'Loss for that same current and line resistance (W)?', answer: 150, tol: 0.02, unit: 'W', explain: 'Loss = I²R = 100 × 1.5 = 150 W.' },
          ],
          written: [{ prompt: 'A colleague suggests transmitting power as DC at the same voltage used at the consumer\'s premises, avoiding the "complication" of AC altogether. Explain the practical problem with this suggestion.', model: 'Transmitting at the low voltage used at the premises would require enormous currents for any significant power, causing very large resistive losses (P_loss = I²R) and requiring impractically thick conductors over transmission distances. AC allows efficient, lossless transformation to a high transmission voltage and back down, using transformers; a pure low-voltage DC scheme has no equally practical way to do this at scale.' }],
        },
      },
    },
    {
      id: 'F3.M1.L2',
      title: 'Sine waves: amplitude, period, frequency, phase',
      minutes: 30,
      content: {
        objectives: [
          'Define amplitude, period, frequency and angular frequency for a sine wave.',
          'Convert between period and frequency, and between frequency and angular frequency.',
          'Define phase and phase difference between two waveforms of the same frequency.',
          'Write the standard equation for a sinusoidal voltage or current.',
        ],
        introduction: `Mains and inverter AC voltages are, ideally, sine waves. This lesson gives you the vocabulary to describe one precisely: how big it is, how fast it repeats, and where it sits in time relative to another sine wave — all needed before reactance, power and transformers make sense.`,
        lecture: `### The sine wave equation

v(t) = V_pk · sin(ωt + φ)

- **V_pk** (amplitude/peak) — the maximum value the waveform reaches.
- **ω (angular frequency)**, in radians per second — how fast the angle ωt advances.
- **φ (phase)**, in radians or degrees — where the waveform sits at t = 0, relative to a reference.

### Period and frequency

The **period (T)** is the time for one complete cycle. The **frequency (f)** is the number of cycles per second (hertz, Hz): f = 1/T. **Angular frequency (ω)** relates to frequency by ω = 2πf, because one full cycle corresponds to 2π radians.

### Phase and phase difference

[[phase|Phase]] describes where in its cycle a waveform is at a given instant. Two sine waves of the SAME frequency can be shifted in time relative to each other — this shift, expressed as an angle, is their **phase difference**. A phase difference of 0° means the waveforms rise and fall together (in phase); 180° means one is the exact mirror of the other; 90° means one leads or lags the other by a quarter cycle. Phase difference between voltage and current in a circuit (caused by reactance, F3.M2) is central to AC power calculations (F3.M3).

### Why this matters for inverters

An inverter's output frequency (ideally a stable 50 or 60 Hz) and the phase relationship between its voltage and current (set by the load's reactance) both affect how well it matches grid requirements and how it should be rated and protected.

### Reading phase off a waveform plot

Given two plotted sine waves of the same frequency, the phase difference between them can be read directly from how far one waveform's zero-crossing (or peak) is shifted along the time axis relative to the other's, then expressed as a fraction of a full cycle and converted to degrees or radians — exactly the kind of reading the oscilloscope's cursors let you make directly on a captured trace.`,
        technical: `**Angular frequency as a rotating phasor.** A sine wave can be visualised as the vertical projection of a point rotating at constant angular speed ω around a circle of radius V_pk — this "phasor" picture (developed further in F3.M2) makes phase relationships between multiple waveforms far easier to reason about than working with the raw time-domain equations.

**Radians versus degrees.** Formulas use radians (ωt in radians), but engineers often quote phase in degrees for readability. 2π radians = 360°; converting between them is a simple scaling, but keep units consistent within one calculation.`,
        diagrams: [{ id: 'kirchhoff', caption: 'Two sine waves of the same frequency, one phase-shifted relative to the other, with amplitude, period and phase difference marked.' }],
        formulas: [
          { name: 'Period–frequency', expr: 'f = 1/T,  T = 1/f', where: [['f', 'frequency', 'Hz'], ['T', 'period', 's']] },
          { name: 'Angular frequency', expr: 'ω = 2πf', where: [['ω', 'angular frequency', 'rad/s']] },
          { name: 'Instantaneous sinusoidal voltage', expr: 'v(t) = V_pk · sin(ωt + φ)', where: [['V_pk', 'peak amplitude', 'V'], ['φ', 'phase angle', 'rad or °']] },
        ],
        examples: [
          {
            title: 'Angular frequency of mains',
            problem: 'Find the angular frequency of a 50 Hz supply.',
            steps: ['ω = 2πf', '= 2π × 50'],
            answer: 'ω ≈ 314.16 rad/s.',
          },
          {
            title: 'Voltage at a given instant',
            problem: 'A 230 V rms, 50 Hz supply (take V_pk = 230√2 = 325.3 V) with zero phase. What is the instantaneous voltage at t = 2.5 ms?',
            steps: ['ω = 2π × 50 = 314.16 rad/s', 'ωt = 314.16 × 0.0025 = 0.7854 rad', 'v(t) = 325.3 × sin(0.7854) = 325.3 × 0.7071'],
            answer: '≈ 230 V at that instant (this particular instant happens to land near the RMS-equivalent point of the cycle).',
            check: '0.7854 rad = 45°, and sin(45°) = 0.7071 ≈ 1/√2, consistent with the result.',
          },
        ],
        applications: `Multi-phase systems (used in larger inverters and three-phase grids, briefly referenced later in this programme) are built entirely from several sine waves of the same frequency held at fixed phase differences from each other — the same vocabulary this lesson introduces.`,
        mistakes: [
          { mistake: 'Confusing period and frequency.', correction: 'Period is time per cycle (seconds); frequency is cycles per second (Hz); they are reciprocals.' },
          { mistake: 'Mixing degrees and radians within one calculation.', correction: 'Convert consistently: 2π rad = 360°.' },
          { mistake: 'Assuming "phase difference" only applies to different frequencies.', correction: 'Phase difference is meaningful specifically between waveforms of the SAME frequency; different frequencies drift relative to each other and have no fixed phase relationship.' },
        ],
        demo: { title: 'See a real 50 Hz trace', text: 'Capture a pure-sine waveform on the oscilloscope and read its period directly off the grid.', link: to.instrument('Open the oscilloscope', 'scope') },
        activities: [to.instrument('Oscilloscope', 'scope'), to.sim('AC waveform experiment', 'sim-03')],
        check: [
          { id: 'k1', type: 'numeric', prompt: 'Period of a 60 Hz waveform (ms)?', answer: 16.67, tol: 0.01, unit: 'ms', explain: 'T = 1/60 = 16.67 ms.' },
          { id: 'k2', type: 'numeric', prompt: 'Angular frequency of a 60 Hz waveform (rad/s)?', answer: 376.99, tol: 0.01, unit: 'rad/s', explain: 'ω = 2π×60 = 376.99 rad/s.' },
          { id: 'k3', type: 'mcq', prompt: 'A phase difference of 180° between two same-frequency waveforms means they are...', options: ['exact mirror images of each other', 'identical', 'a quarter cycle apart', 'at different frequencies'], answer: 0, explain: '180° is a half-cycle shift.' },
          { id: 'k4', type: 'mcq', prompt: 'Phase difference is a meaningful concept between...', options: ['two waveforms of the same frequency', 'any two waveforms regardless of frequency', 'only DC signals', 'only square waves'], answer: 0, explain: 'Different frequencies drift relative to each other.' },
        ],
        summary: [
          'A sine wave is described by amplitude (peak), frequency (or period) and phase.',
          'f = 1/T and ω = 2πf relate frequency, period and angular frequency.',
          'Phase difference is meaningful between waveforms of the SAME frequency; it describes their relative timing.',
          'v(t) = V_pk·sin(ωt + φ) is the standard sinusoidal voltage equation.',
        ],
        homework: {
          id: 'F3.M1.L2.hw',
          title: 'Sine wave parameters',
          brief: 'Compute period, frequency and angular frequency.',
          tasks: [
            { id: 'h1', type: 'numeric', prompt: 'Frequency of a waveform with period 4 ms (Hz)?', answer: 250, tol: 0.01, unit: 'Hz', explain: 'f = 1/0.004 = 250 Hz.' },
            { id: 'h2', type: 'numeric', prompt: 'Angular frequency of a 400 Hz waveform (rad/s)?', answer: 2513.27, tol: 0.01, unit: 'rad/s', explain: 'ω = 2π×400 ≈ 2513.27 rad/s.' },
          ],
          written: [{ prompt: 'Two inverters are meant to feed the same load in parallel. Explain, using the idea of phase, why their output waveforms must be kept at a fixed, matched phase relationship (not just the same frequency) for this to work safely.', model: 'Matching frequency alone is not enough: if the two inverters\' outputs are at the same frequency but a different (or drifting) phase, their instantaneous voltages will differ at most moments, driving a large circulating current between them even though both claim the "same" voltage and frequency. Only when frequency AND phase are matched do the two waveforms track each other instant by instant, so they can be safely paralleled onto the same load without a large phase-driven circulating current.' }],
        },
      },
    },
    {
      id: 'F3.M1.L3',
      title: 'Peak, average and RMS',
      minutes: 35,
      content: {
        objectives: [
          'Define peak, average and RMS values of an AC waveform.',
          'Derive and apply V_rms = V_pk/√2 for a pure sine wave.',
          'Explain why RMS, not peak or average, is used for AC power calculations.',
          'Compute RMS for a simple non-sinusoidal (square) waveform.',
        ],
        introduction: `This lesson picks up directly where the Virtual Instruments laboratory's oscilloscope module (F5.M3.L2) left RMS as "the power-equivalent value" and derives WHY that is true, and HOW to compute it for a sine wave and for other waveform shapes you will meet throughout this course and the Build Your Own Inverter laboratory.`,
        lecture: `### Three different "sizes" for one waveform

- **Peak (V_pk)**: maximum instantaneous value.
- **Average**: the mean value over one full cycle. For a symmetric AC waveform (equal positive and negative halves), the average over a FULL cycle is exactly zero — not useful on its own. (A "rectified average", the average of the absolute value, is sometimes used instead, e.g. by cheap AC meters, F5.M3.L2.)
- **RMS (root mean square)**: the value that delivers the SAME heating power into a resistor as the actual time-varying waveform does.

### Deriving RMS for a sine wave

Instantaneous power into a resistance R is p(t) = v(t)²/R. Averaging v(t)² over one cycle for v(t) = V_pk·sin(ωt) gives an average of V_pk²/2 (because sin² averages to 1/2 over a full cycle). The RMS value is defined as the square root of this mean square:

**V_rms = √(V_pk² / 2) = V_pk / √2 ≈ 0.707 · V_pk**

### RMS of other waveforms

RMS depends on SHAPE, not just peak. An ideal square wave spends its entire cycle at ±V_pk, so its mean square is simply V_pk² (not V_pk²/2), giving **V_rms = V_pk** for a square wave — no √2 reduction at all. This is exactly the distinction F5.M3.L2 relied on without deriving; here is the derivation.

### Why RMS, not peak, for power

Because P = V_rms²/R directly, using RMS values in power calculations gives the correct AVERAGE power delivered — exactly matching what a DC source of the same RMS voltage would deliver into the same resistance. Using peak or average (zero) values instead gives systematically wrong answers.`,
        technical: `**The "root mean square" name describes the calculation exactly.** Square the instantaneous value, find its MEAN over one cycle, then take the SQUARE ROOT — "root of the mean of the square", read backward to "root-mean-square". This calculation generalises to ANY periodic waveform, not just sine waves, which is why an oscilloscope or true-RMS meter can report a correct RMS value for a square wave, a modified sine, or an arbitrary distorted waveform, by actually computing this integral (or its sampled equivalent) rather than assuming a sine shape.

**Crest factor**, introduced in F5.M3.L2, is V_pk/V_rms: √2 ≈ 1.414 for a pure sine, exactly 1 for an ideal square wave, and higher for peaky waveforms.`,
        diagrams: [{ id: 'rc-curve', caption: 'v(t) and v(t)² for a sine wave over one cycle, showing why the mean of v² is V_pk²/2 and RMS follows from its square root.' }],
        formulas: [
          { name: 'RMS of a pure sine', expr: 'V_rms = V_pk / √2 ≈ 0.707 · V_pk', where: [['V_pk', 'peak value', 'V']] },
          { name: 'RMS of an ideal square wave', expr: 'V_rms = V_pk', where: [] },
          { name: 'Power from RMS', expr: 'P = V_rms² / R = V_rms · I_rms (resistive load)', where: [['P', 'average power', 'W']] },
        ],
        examples: [
          {
            title: 'RMS of UK/EU mains',
            problem: '230 V mains is quoted as an RMS value. What is its peak voltage?',
            steps: ['V_pk = V_rms × √2', '= 230 × 1.4142'],
            answer: '≈ 325.3 V peak.',
          },
          {
            title: 'Power into a resistive load',
            problem: 'A 230 V rms supply drives a 46 Ω resistive heater. Average power delivered?',
            steps: ['P = V_rms² / R', '= 230² / 46 = 52,900 / 46'],
            answer: '≈ 1150 W.',
            check: 'I_rms = 230/46 = 5 A; P = V·I = 230×5 = 1150 W. ✓ consistent.',
          },
          {
            title: 'RMS of a 48 V square-wave inverter output',
            problem: 'A square-wave inverter output has a 48 V peak. What is its RMS value, and the average power it delivers into a 12 Ω resistive load?',
            steps: ['V_rms = V_pk = 48 V (square wave, no √2 reduction)', 'P = V_rms²/R = 48²/12 = 2304/12'],
            answer: 'V_rms = 48 V; P = 192 W.',
          },
        ],
        applications: `Every power rating, current rating and protective-device sizing calculation from F3.M3 onward uses RMS values. Inverter and component datasheets state RMS voltage and current for exactly this reason.`,
        mistakes: [
          { mistake: 'Using peak voltage in a power calculation.', correction: 'Use RMS voltage; peak overstates average power by a factor related to the crest factor.' },
          { mistake: 'Assuming V_rms = V_pk/√2 for every waveform shape.', correction: 'That relationship holds only for a pure sine. A square wave has V_rms = V_pk; other shapes fall in between or beyond.' },
          { mistake: 'Treating the simple average (which is zero for symmetric AC) as a useful "size" of the waveform.', correction: 'Use RMS, or rectified average with the correct shape-specific correction factor, never the raw zero average.' },
        ],
        demo: { title: 'Confirm RMS with the oscilloscope', text: 'Capture a square wave and a pure sine of the same peak voltage on the scope and compare their RMS cursor readings against this lesson\'s formulas.', link: to.instrument('Open the oscilloscope', 'scope') },
        activities: [to.instrument('Oscilloscope', 'scope'), to.sim('RMS and power experiment', 'sim-04')],
        check: [
          { id: 'k1', type: 'numeric', prompt: 'RMS of a pure sine with 100 V peak (V)?', answer: 70.7, tol: 0.01, unit: 'V', explain: '100/√2 = 70.7 V.' },
          { id: 'k2', type: 'numeric', prompt: 'Peak of a 120 V rms pure sine (V)?', answer: 169.7, tol: 0.01, unit: 'V', explain: '120×√2 = 169.7 V.' },
          { id: 'k3', type: 'mcq', prompt: 'RMS of an ideal square wave equals...', options: ['its peak value', 'peak/√2', 'half its peak', 'zero'], answer: 0, explain: 'A square wave is at full amplitude the whole cycle.' },
          { id: 'k4', type: 'numeric', prompt: 'Average power into a 23 Ω resistor from a 230 V rms supply (W)?', answer: 2300, tol: 0.01, unit: 'W', explain: 'P = 230²/23 = 2300 W.' },
        ],
        summary: [
          'Peak is the maximum instantaneous value; the simple average of a symmetric AC waveform is zero and not useful.',
          'RMS is the value that delivers the same heating power into a resistor as the real waveform — "root of the mean of the square".',
          'V_rms = V_pk/√2 only for a pure sine; V_rms = V_pk for an ideal square wave.',
          'Power calculations (P = V_rms²/R) require RMS values, not peak or average.',
        ],
        homework: {
          id: 'F3.M1.L3.hw',
          title: 'RMS and power practice',
          brief: 'Compute RMS values and resulting power.',
          tasks: [
            { id: 'h1', type: 'numeric', prompt: 'RMS of a pure sine with 12 V peak (V)?', answer: 8.49, tol: 0.01, unit: 'V', explain: '12/√2 = 8.49 V.' },
            { id: 'h2', type: 'numeric', prompt: 'Power into a 9 Ω resistor from a 120 V rms source (W)?', answer: 1600, tol: 0.01, unit: 'W', explain: 'P = 120²/9 = 1600 W.' },
          ],
          written: [{ prompt: 'A modified-sine inverter has the same 325 V peak as a pure-sine inverter, but its RMS output is lower than the pure sine\'s 230 V. Explain, in terms of this lesson, why equal peaks do not mean equal RMS, and what this implies about the power each would deliver to the same resistive load.', model: 'RMS depends on the waveform shape, not just the peak. A modified sine holds zero for part of each half-cycle, so its mean-square value (and hence RMS) is lower than a pure sine of the same peak, which never drops to zero except at the zero crossings. Because average power into a resistive load is P = V_rms²/R, the modified-sine inverter delivers less average power to the same resistive load than the pure-sine inverter, even with identical peak voltages.' }],
        },
      },
    },
    {
      id: 'F3.M1.L4',
      title: 'Non-sinusoidal waveforms',
      minutes: 25,
      content: {
        objectives: [
          'Identify square, modified-sine, PWM and rectified waveforms by their time-domain shape.',
          'Explain why an inverter\'s raw switched output is not a pure sine.',
          'State which inverter waveform families require filtering to approach a pure sine, and why.',
        ],
        introduction: `Real inverters rarely produce a textbook pure sine directly from their switches — filtering is what gets them there. This lesson surveys the waveform families you will build, measure and reason about throughout the rest of this programme: square, modified-sine, PWM and rectified.`,
        lecture: `### The waveform families

- **Square wave**: the switches present +V_dc then −V_dc, with an instant transition, at the fundamental frequency. Simplest to generate, but the roughest output (high THD, F5.M3.L3).
- **Modified sine (quasi-square)**: adds a zero-voltage dwell within each half-cycle, closer in RMS and harmonic content to a sine than a plain square wave, without needing an output filter — the classic "modified sine wave inverter" compromise.
- **PWM / SPWM (sinusoidal pulse-width modulation)**: the switches pulse on and off at a much higher carrier frequency, with the WIDTH of each pulse varying to trace out a sine-shaped average. Unfiltered, this looks nothing like a sine on an oscilloscope (F5.M3.L1) — it only becomes one after the output LC filter removes the high-frequency carrier content.
- **Rectified**: not an inverter output at all, but the result of converting AC back to DC (bridge rectifier, F3.M5) — included here because you will recognise its shape (all-positive "humps") when troubleshooting or analysing a rectifier stage.

### Why not just produce a pure sine directly?

A switching device is fundamentally a two-state (on/off) device — it is efficient precisely because it is either fully on (low loss) or fully off (no current), never in between dissipating power as a linear amplifier would. Producing a smoothly varying sine directly, rather than through fast switching plus filtering, would require linear (non-switching) amplification, which is far less efficient at the power levels inverters operate at. SPWM followed by filtering gets the efficiency of switching with an output close to a pure sine.`,
        technical: `**Why "sinusoidal" PWM specifically.** The pulse width in SPWM is set by comparing a sine-shaped reference signal against a high-frequency triangular carrier (F3.M5, Build lab project D) — this specific modulation scheme is chosen because its filtered output approximates a sine wave more closely, with lower distortion, than simpler fixed-pattern switching schemes.

**Multi-level inverters** (a more advanced topology, mentioned here for completeness, not required at this level) use more than two output voltage levels to approach a sine even more closely before filtering, at the cost of more switching devices and more complex control.`,
        diagrams: [{ id: 'quasi-square', caption: 'Square, modified-sine, unfiltered SPWM and filtered pure-sine waveforms compared over the same time axis.' }],
        formulas: [{ name: 'Crest factor', expr: 'CF = V_pk / V_rms', where: [['CF', 'crest factor', 'dimensionless']], note: 'CF = √2 ≈ 1.414 for a pure sine; CF = 1 for an ideal square wave — one quick way to recognise a waveform family from a meter or scope reading.' }],
        examples: [
          {
            title: 'Why switching is efficient but produces a rough raw waveform',
            problem: 'Explain why a switch dissipates little power while fully on or fully off, but a linear (non-switching) voltage regulator dissipates significant power when regulating the same voltage down.',
            steps: ['A fully-on switch has very low resistance, so P = I²R is small despite high current', 'A fully-off switch has (ideally) zero current, so P = 0 regardless of voltage across it', 'A linear regulator instead drops the "extra" voltage across itself while current still flows, dissipating P = I × V_dropped continuously'],
            answer: 'Switching devices avoid the continuous V×I loss a linear regulator suffers, which is why switching conversion dominates at the power levels inverters operate at, at the cost of a raw output that needs shaping (filtering) rather than being inherently smooth.',
          },
          {
            title: 'Recognising a waveform from its trace',
            problem: 'An oscilloscope trace shows three distinct levels per half-cycle: +Vdc held for part of the cycle, 0 V for the rest, mirrored in the negative half. Which waveform family is this?',
            steps: ['Not a plain square wave (which has only two levels, no zero dwell)', 'Not filtered SPWM/pure sine (which would show a smooth curve)', 'Three levels with a zero dwell matches the modified-sine definition'],
            answer: 'Modified sine (quasi-square).',
          },
        ],
        applications: `This exact survey maps directly onto the Build Your Own Inverter laboratory's projects B (square), C (modified sine) and D (pure sine, filtered SPWM) — and onto what you will actually see on the oscilloscope in each.`,
        mistakes: [
          { mistake: '"An inverter\'s switches produce a sine wave directly."', correction: 'Switches produce square, modified-sine or PWM waveforms; a pure sine requires filtering the switched output.' },
          { mistake: 'Confusing rectified DC with an inverter output waveform.', correction: 'Rectification converts AC to DC (the opposite direction); it produces an all-positive "humped" shape, not an inverter output.' },
          { mistake: 'Assuming modified sine needs an output filter like SPWM does.', correction: 'Modified sine is produced directly by switch timing, without a following filter; SPWM specifically needs filtering to approach a sine.' },
        ],
        demo: { title: 'Compare all four shapes on the scope', text: 'Step through square, modified-sine, PWM and rectified on this lab\'s oscilloscope and match each to the description above.', link: to.instrument('Open the oscilloscope', 'scope') },
        activities: [to.instrument('Oscilloscope', 'scope'), to.build('Project B: square-wave inverter', 'bld-b'), to.build('Project D: pure sine-wave inverter', 'bld-d')],
        check: [
          { id: 'k1', type: 'mcq', prompt: 'Which waveform has a deliberate zero-voltage dwell within each half-cycle?', options: ['Modified sine', 'Plain square wave', 'Pure sine', 'Rectified DC'], answer: 0, explain: 'The zero dwell distinguishes modified sine from a plain square wave.' },
          { id: 'k2', type: 'mcq', prompt: 'Unfiltered SPWM, viewed on an oscilloscope at a fine timebase, looks like...', options: ['a fast train of varying-width pulses, not a smooth sine', 'a smooth sine directly', 'a plain square wave', 'a DC level'], answer: 0, explain: 'Filtering is required afterward to produce a smooth sine.' },
          { id: 'k3', type: 'mcq', prompt: 'Rectification converts...', options: ['AC to DC', 'DC to AC', 'frequency to voltage', 'voltage to current'], answer: 0, explain: 'Rectification is the opposite direction from inversion.' },
          { id: 'k4', type: 'mcq', prompt: 'Why do switching devices (rather than linear amplifiers) dominate inverter design?', options: ['They dissipate little power while fully on or fully off, unlike a continuously-dropping linear stage', 'They are always cheaper', 'They inherently produce a pure sine', 'They require no control circuitry'], answer: 0, explain: 'Switching avoids the continuous V×I loss of linear regulation.' },
        ],
        summary: [
          'Square, modified-sine, PWM and rectified are the main waveform families you will encounter and build throughout this programme.',
          'A switching device is efficient because it is either fully on or fully off, never continuously dropping voltage like a linear regulator.',
          'Square and modified-sine waveforms are produced directly by switch timing; SPWM requires a following filter to approach a pure sine.',
          'Rectification (AC to DC) produces a recognisable all-positive "humped" shape, the opposite direction from inversion.',
        ],
        homework: {
          id: 'F3.M1.L4.hw',
          title: 'Waveform identification',
          brief: 'Identify waveform families from their description.',
          tasks: [{ id: 'h1', type: 'mcq', prompt: 'A waveform that switches instantly between +Vdc and −Vdc with no intermediate level is...', options: ['a plain square wave', 'modified sine', 'filtered pure sine', 'rectified DC'], answer: 0, explain: 'Two levels, no zero dwell: a plain square wave.' }],
          written: [{ prompt: 'Explain why a pure-sine inverter is more complex (and usually more expensive) to build than a square-wave inverter, in terms of the waveform families covered in this lesson.', model: 'A square-wave inverter only needs switches operated at the fundamental frequency with no following filter. A pure-sine inverter needs SPWM switching at a much higher carrier frequency, precise pulse-width control to trace out a sine-shaped average, and an output LC filter sized to remove the carrier-frequency content while passing the fundamental — all of which add components, control complexity and cost compared with simple square-wave switching.' }],
        },
      },
    },
  ],
  quiz: {
    pass: 0.8,
    questions: [
      { id: 'q1', type: 'mcq', prompt: 'Why is power transmitted at high voltage?', options: ['To reduce current and resistive loss for the same power', 'Because generators can only make high voltage', 'To make it safer to touch', 'To reduce frequency'], answer: 0, explain: 'Loss = I²R.' },
      { id: 'q2', type: 'numeric', prompt: 'Period of a 50 Hz waveform (ms)?', answer: 20, tol: 0.01, unit: 'ms', explain: 'T = 1/50 = 20 ms.' },
      { id: 'q3', type: 'mcq', prompt: 'A phase difference is meaningful between...', options: ['two waveforms of the same frequency', 'any two waveforms', 'only DC signals', 'only harmonics'], answer: 0, explain: 'Different frequencies have no fixed phase relationship.' },
      { id: 'q4', type: 'numeric', prompt: 'RMS of a pure sine with 50 V peak (V)?', answer: 35.4, tol: 0.01, unit: 'V', explain: '50/√2 = 35.4 V.' },
      { id: 'q5', type: 'mcq', prompt: 'RMS of an ideal square wave equals...', options: ['its peak value', 'peak/√2', 'half its peak', 'zero'], answer: 0, explain: 'Full amplitude for the whole cycle.' },
      { id: 'q6', type: 'mcq', prompt: 'SPWM requires a following output filter mainly because...', options: ['its unfiltered switched output carries high-frequency carrier content, not a smooth sine', 'it has the wrong fundamental frequency', 'it is DC, not AC', 'filters increase switching frequency'], answer: 0, explain: 'Filtering removes the carrier-frequency content, leaving a sine-like fundamental.' },
    ],
  },
  practicals: [],
}
