import type { AcademyModule } from '../types'
import { to } from '../s1/links'

/** F5.M3 Oscilloscope. */
export const F5_M3: AcademyModule = {
  id: 'F5.M3',
  title: 'Oscilloscope',
  summary: 'Timebase, volts/division and triggering; reading period, frequency, duty cycle and RMS off a real inverter waveform; and what harmonics and THD look like on screen.',
  lessons: [
    {
      id: 'F5.M3.L1',
      title: 'Time base, volts per division and trigger',
      minutes: 30,
      content: {
        objectives: [
          'Explain what an oscilloscope displays that a multimeter cannot.',
          'Set an appropriate time/div and volts/div for a given signal.',
          'Explain what a trigger does and why a scope trace is stable without one.',
          'Read an inverter output waveform (square, modified-sine, PWM, pure-sine) correctly from the grid.',
        ],
        introduction: `A multimeter gives you one number. An oscilloscope gives you the whole shape of a signal against time — exactly what you need to tell a square wave from a modified sine wave, or to see switching noise a multimeter would simply average away. This laboratory's oscilloscope reads the same waveform model Phase 5's simulator uses, so what you see here is the identical physics behind every inverter output waveform studied in F3 and built in the Build Your Own Inverter laboratory.`,
        lecture: `### The screen as a grid

A scope screen is divided into a grid, typically **10 horizontal divisions** (time) by **8 vertical divisions** (voltage). Two settings decide what each division represents:

- **Time/div** — seconds per horizontal division. The whole screen width always shows 10 × time/div.
- **Volts/div** — volts per vertical division. The whole screen height shows 8 × volts/div (±4 divisions from the centre line).

Choosing these well means the waveform fills a useful fraction of the screen: too coarse a time/div compresses several cycles into a blur; too fine shows only a sliver of one cycle. Too coarse a volts/div shrinks the trace to a thin line near the centre; too fine clips the top and bottom off the screen.

### Triggering

Without triggering, the scope would start drawing at a different, essentially random point of the waveform on every pass, and a repeating signal would appear to drift or jitter. A **trigger** tells the scope: "start drawing only when the signal crosses this voltage level, in this direction (rising or falling)." Every subsequent sweep then starts at the same point in the cycle, so a repeating waveform appears stationary on screen.

### Reading an inverter waveform

- **Square wave**: a clean two-level trace, switching instantly between +Vdc and −Vdc.
- **Modified sine**: three levels — +Vdc, 0, −Vdc — held for a fraction of each half-cycle (the conduction angle).
- **PWM / unfiltered SPWM**: a fast train of narrow pulses at the switching (carrier) frequency, whose *average* width traces out a sine shape — only visible properly at a fine time/div.
- **Pure sine (filtered)**: a smooth sinusoid, the LC filter's output once the switching ripple is removed.

Set the time/div so that 2–3 full cycles of the FUNDAMENTAL are visible to judge frequency and shape; switch to a much finer time/div (microseconds, not milliseconds) to see individual PWM pulses.`,
        technical: `**Why PWM needs two very different timebases.** The fundamental (50/60 Hz) period is tens of milliseconds; the switching (carrier) period at, say, 1 kHz is 1 ms, and at 20 kHz is 50 µs. A single timebase cannot usefully show both the overall sine shape AND individual switching pulses — this is why real oscilloscope work on PWM signals typically alternates between a slow sweep (to see the fundamental envelope) and a fast sweep (to inspect individual pulse edges, rise time and ringing).

**Rising vs falling edge trigger.** Triggering on a rising edge crossing zero captures the waveform starting at the same point every time; triggering on a falling edge captures the mirror-image starting point. Either is valid; consistency between measurements matters more than the choice.`,
        diagrams: [{ id: 'test-bench', caption: 'The 10×8 division scope grid, with time/div and volts/div scaling the whole screen, and a trigger level fixing where each sweep starts.' }],
        formulas: [{ name: 'Screen span', expr: 'horizontal span = 10 × time/div,  vertical span = 8 × volts/div', where: [['time/div', 'seconds per horizontal division', 's'], ['volts/div', 'volts per vertical division', 'V']] }],
        examples: [
          {
            title: 'Choosing a timebase for 50 Hz',
            problem: 'You want to see about 2 full cycles of a 50 Hz waveform across the screen. What time/div should you choose?',
            steps: ['Period of 50 Hz = 1/50 = 20 ms', '2 cycles = 40 ms total, across 10 divisions', 'time/div = 40 ms / 10 = 4 ms/div'],
            answer: '4 ms/div shows about 2 full cycles.',
          },
          {
            title: 'Choosing volts/div for a 325 V peak signal',
            problem: 'An inverter output has a peak of 325 V. What volts/div keeps the trace within the 8-division screen with some margin?',
            steps: ['Half the screen height (4 divisions) must cover at least 325 V with margin', 'Try 100 V/div: 4 × 100 = 400 V of headroom above and below centre — comfortable'],
            answer: '100 V/div (or a similar "nice" setting) keeps a 325 V peak well within the screen.',
          },
        ],
        applications: `This is exactly the oscilloscope used throughout the Build Your Own Inverter laboratory's waveform checks and in F3's study of square, modified-sine, PWM and pure-sine outputs — the SAME waveform engine, so a trace captured here matches what you would see probing a real simulated inverter output.`,
        mistakes: [
          { mistake: 'Setting volts/div so fine that the waveform clips off the top/bottom of the screen.', correction: 'Increase volts/div until the full peak-to-peak swing fits within the 8 divisions.' },
          { mistake: 'Trying to see both the fundamental shape and individual PWM pulses on one timebase.', correction: 'Use a slow sweep for the overall shape, then a much faster sweep to inspect individual pulses.' },
          { mistake: 'Assuming an untriggered trace is accurate.', correction: 'Without a trigger, a repeating signal appears to drift; set a trigger level and edge to stabilise it.' },
        ],
        demo: { title: 'Capture a real inverter waveform', text: 'Choose a waveform, set time/div, volts/div and trigger, and watch the trace redraw from this lab\'s shared waveform engine — the same model behind Phase 5\'s simulator.', link: to.instrument('Open the oscilloscope', 'scope') },
        activities: [to.instrument('Oscilloscope', 'scope'), to.sim('PWM and filtering experiment', 'sim-08')],
        check: [
          { id: 'k1', type: 'numeric', prompt: 'A screen with 10 divisions at 2 ms/div spans how many ms total?', answer: 20, tol: 0.01, unit: 'ms', explain: '10 × 2 ms = 20 ms.' },
          { id: 'k2', type: 'mcq', prompt: 'What does triggering do?', options: ['Starts each sweep at the same point of the waveform, stabilising the trace', 'Changes the signal\'s frequency', 'Increases the display resolution', 'Protects the scope from overvoltage'], answer: 0, explain: 'Triggering fixes the start point of each sweep.' },
          { id: 'k3', type: 'mcq', prompt: 'A modified-sine inverter output shows how many distinct voltage levels on screen?', options: ['Three: +Vdc, 0, −Vdc', 'Two', 'A continuous sine shape', 'One'], answer: 0, explain: 'Modified sine holds +Vdc and −Vdc for part of each half-cycle, with a zero dwell.' },
          { id: 'k4', type: 'mcq', prompt: 'To inspect individual PWM pulses at a 1 kHz carrier frequency, you should use...', options: ['a much faster (finer) time/div than for viewing the 50 Hz fundamental', 'the same time/div as for the fundamental', 'a slower time/div', 'volts/div, not time/div'], answer: 0, explain: 'Individual pulses are far shorter than the fundamental period.' },
        ],
        summary: [
          'An oscilloscope shows voltage versus time; time/div and volts/div scale the whole screen.',
          'Triggering fixes the start point of each sweep so a repeating waveform appears stationary.',
          'Square, modified-sine, PWM and pure-sine inverter outputs each have a distinctive, recognisable trace shape.',
          'PWM needs two very different timebases to see both the overall shape and individual pulses.',
        ],
        homework: {
          id: 'F5.M3.L1.hw',
          title: 'Timebase and scaling practice',
          brief: 'Work out scope settings for given signals.',
          tasks: [
            { id: 'h1', type: 'numeric', prompt: 'To see 3 full cycles of a 60 Hz signal, time/div should be about ___ ms/div.', answer: 5, tol: 0.05, unit: 'ms', explain: 'Period = 16.7 ms; 3 cycles = 50 ms / 10 divisions = 5 ms/div.' },
            { id: 'h2', type: 'mcq', prompt: 'For a 48 V peak signal, which volts/div setting gives the most comfortable headroom within an 8-division screen?', options: ['20 V/div', '2 V/div', '100 V/div', '1 V/div'], answer: 0, explain: '4 divisions × 20 V/div = 80 V headroom, comfortably above 48 V peak without wasting most of the screen.' },
          ],
          written: [{ prompt: 'Explain why an untriggered oscilloscope trace of a repeating square wave appears to drift sideways across the screen.', model: 'Without a trigger, each horizontal sweep starts at an arbitrary point in time, not at a fixed point of the waveform\'s cycle. Because the sweep period and the signal period are not locked together, each sweep begins at a slightly different phase of the signal, so the displayed waveform appears to shift sideways from one sweep to the next.' }],
        },
      },
    },
    {
      id: 'F5.M3.L2',
      title: 'Measuring frequency, duty cycle and RMS',
      minutes: 30,
      content: {
        objectives: [
          'Measure period and frequency directly from a scope trace.',
          'Define and read duty cycle from a switched waveform.',
          'Explain the difference between true-RMS and average-sensing measurement.',
          'Relate a waveform\'s peak, peak-to-peak and RMS values.',
        ],
        introduction: `Once a waveform is on screen, the scope's own cursor measurements turn the picture into numbers: period, frequency, peak, peak-to-peak, RMS and duty cycle. This lesson uses exactly those measurements, computed from the same captured trace you saw in the previous lesson.`,
        lecture: `### Period and frequency from the grid

Count the horizontal divisions spanned by one full cycle and multiply by time/div to get the period T. Frequency is f = 1/T.

### Peak, peak-to-peak and RMS

- **Peak (V_pk)**: the maximum excursion from zero (or from the centre line if DC-offset).
- **Peak-to-peak (V_pp)**: the full excursion from the most positive point to the most negative.
- **RMS (root mean square)**: the value that would deliver the same heating power into a resistor as the AC waveform does — the figure that matters for power calculations (F3.M3).

For a **pure sine**, V_rms = V_pk / √2 ≈ 0.707 × V_pk. For an **ideal square wave**, V_rms = V_pk (it spends all its time at full amplitude). A **modified sine** sits between these, because it holds zero for part of each half-cycle.

### Duty cycle

[[duty-cycle|Duty cycle]] is the fraction of each period a switched signal spends at its higher level: duty = t_on / T, usually expressed as a percentage. A symmetric square wave has 50 % duty cycle. SPWM varies the duty cycle of individual carrier pulses continuously to trace out a sine-shaped average — this varying duty cycle, averaged by the output filter, is what produces the pure-sine output (F3.M5, Build lab project D).

### True-RMS versus average-sensing meters

A cheap multimeter often measures AC by rectifying the signal and reading its average, then multiplying by a fixed factor (1.11) that is only correct for a pure sine wave. On a non-sinusoidal waveform — a square wave, a modified sine, or anything with switching content — this gives the WRONG answer. A **true-RMS** meter computes the actual root-mean-square value regardless of waveform shape and reads correctly on any of them. An oscilloscope's RMS cursor measurement, computed directly from the sampled waveform (as this lab's scope does), is inherently true-RMS.`,
        technical: `**Why RMS matters for power, not just voltage.** Power delivered to a resistive load is P = V_rms² / R. Using a peak or average value instead of RMS in a power calculation gives a wrong answer by a shape-dependent factor — this is precisely why F3.M3 insists on RMS for power work.

**Crest factor.** The ratio V_pk / V_rms is called the crest factor. A pure sine has a crest factor of √2 ≈ 1.414; a highly peaky waveform (some rectified or distorted signals) has a much higher crest factor, which matters when sizing a component's peak voltage rating even though its RMS current looks modest.`,
        diagrams: [{ id: 'spwm', caption: 'Period, peak, peak-to-peak and duty cycle marked on a captured scope trace.' }],
        formulas: [
          { name: 'Period–frequency', expr: 'f = 1 / T', where: [['f', 'frequency', 'Hz'], ['T', 'period', 's']] },
          { name: 'RMS of a pure sine', expr: 'V_rms = V_pk / √2 ≈ 0.707 · V_pk', where: [['V_pk', 'peak voltage', 'V']] },
          { name: 'Duty cycle', expr: 'duty = t_on / T', where: [['t_on', 'time at the higher level', 's'], ['T', 'period', 's']] },
        ],
        examples: [
          {
            title: 'Period and frequency from the grid',
            problem: 'One full cycle spans exactly 4 horizontal divisions at 5 ms/div. What is the period and frequency?',
            steps: ['T = 4 × 5 ms = 20 ms', 'f = 1 / 0.020 = 50 Hz'],
            answer: 'T = 20 ms, f = 50 Hz.',
          },
          {
            title: 'RMS of a 325 V peak sine',
            problem: 'A pure-sine inverter output has a 325 V peak. What is its RMS value, and does this match a "230 V" mains-equivalent output?',
            steps: ['V_rms = V_pk / √2', 'V_rms = 325 / √2 = 229.8 V'],
            answer: '≈ 230 V rms — yes, this is the standard relationship between 230 V rms mains and its ≈325 V peak.',
          },
          {
            title: 'Why an average-sensing meter misreads a square wave',
            problem: 'A 48 V peak ideal square wave is measured by an average-sensing "AC volts" meter that assumes a sine shape (multiplying the rectified average by 1.11) and by a true-RMS meter. Which is correct, and why?',
            steps: ['True RMS of an ideal square wave = V_pk = 48 V (it is at full amplitude the whole time)', 'An average-sensing meter applies the sine-only 1.11 factor, which does not apply to a square wave, and reads incorrectly'],
            answer: 'The true-RMS meter reads the correct 48 V; the average-sensing meter reads a different, wrong value because its correction factor assumes a sine shape.',
          },
        ],
        applications: `Every power and energy calculation from F3.M3 onward, and every solar/battery load calculation in S2, depends on RMS voltage and current, not peak or average — this is why inverter and power-meter specifications always state RMS figures.`,
        mistakes: [
          { mistake: 'Using an average-sensing ("non-true-RMS") meter on a switched or non-sinusoidal waveform.', correction: 'Use a true-RMS meter, or read RMS directly off an oscilloscope\'s cursor measurement, computed from the real waveform shape.' },
          { mistake: 'Assuming V_rms = V_pk / √2 for every waveform.', correction: 'That relationship holds only for a pure sine. A square wave has V_rms = V_pk; a modified sine is in between.' },
          { mistake: 'Confusing peak-to-peak with peak.', correction: 'Peak-to-peak is twice the peak for a symmetric waveform about zero; check which the instrument is actually displaying.' },
        ],
        demo: { title: 'Read the cursor measurements', text: 'Capture a waveform on the scope and compare its RMS and duty-cycle readouts against the formulas above for different waveform shapes.', link: to.instrument('Open the oscilloscope', 'scope') },
        activities: [to.instrument('Oscilloscope', 'scope'), to.ckt('Bridge rectifier exercise', 'ckt-04')],
        check: [
          { id: 'k1', type: 'numeric', prompt: 'A cycle spans 5 divisions at 2 ms/div. Frequency (Hz)?', answer: 100, tol: 0.01, unit: 'Hz', explain: 'T = 10 ms, f = 1/0.01 = 100 Hz.' },
          { id: 'k2', type: 'numeric', prompt: 'RMS of a pure sine with 170 V peak (V)?', answer: 120.2, tol: 0.02, unit: 'V', explain: '170/√2 = 120.2 V.' },
          { id: 'k3', type: 'mcq', prompt: 'For an ideal square wave, RMS equals...', options: ['the peak value', 'peak/√2', 'half the peak', 'always zero'], answer: 0, explain: 'A square wave is at full amplitude the whole time.' },
          { id: 'k4', type: 'mcq', prompt: 'A true-RMS meter differs from an average-sensing meter by...', options: ['computing the actual RMS regardless of waveform shape', 'always reading higher', 'only working on DC', 'only working above 1 kHz'], answer: 0, explain: 'Average-sensing meters assume a sine shape; true-RMS does not.' },
        ],
        summary: [
          'Period and frequency are read directly from the grid using time/div; f = 1/T.',
          'RMS is the power-equivalent value; V_rms = V_pk/√2 only for a pure sine — a square wave has V_rms = V_pk.',
          'Duty cycle is the fraction of each period spent at the higher level; SPWM varies it continuously to synthesise a sine average.',
          'A true-RMS meter reads correctly on any waveform shape; an average-sensing meter is correct only for a pure sine.',
        ],
        homework: {
          id: 'F5.M3.L2.hw',
          title: 'RMS and duty cycle practice',
          brief: 'Compute RMS and duty cycle for given waveforms.',
          tasks: [
            { id: 'h1', type: 'numeric', prompt: 'RMS of a pure sine with 48 V peak (V)?', answer: 33.9, tol: 0.03, unit: 'V', explain: '48/√2 = 33.9 V.' },
            { id: 'h2', type: 'numeric', prompt: 'A switched waveform is high for 3 ms of a 10 ms period. Duty cycle (%)?', answer: 30, tol: 0.01, unit: '%', explain: '3/10 = 30%.' },
          ],
          written: [{ prompt: 'A 325 V peak square-wave inverter output and a 325 V peak pure-sine inverter output are compared. Explain why they do NOT deliver the same RMS voltage to a resistive load, even though their peaks are identical.', model: 'RMS depends on the waveform shape, not just the peak. The square wave is at full amplitude (±325 V) for the entire cycle, giving V_rms = 325 V. The pure sine spends most of its time below its peak, giving V_rms = 325/√2 ≈ 229.8 V. Equal peaks do not imply equal RMS, and therefore not equal power delivered to the same resistive load.' }],
        },
      },
    },
    {
      id: 'F5.M3.L3',
      title: 'Spectrum and THD',
      minutes: 25,
      content: {
        objectives: [
          'Explain what a harmonic spectrum shows that a time-domain trace does not.',
          'Relate a waveform\'s time-domain shape to its harmonic content qualitatively.',
          'Define total harmonic distortion (THD) and explain why lower is generally better.',
          'Explain why filtering reduces harmonic content.',
        ],
        introduction: `A time-domain trace (what you have been reading so far) shows voltage against time. A **spectrum** shows the same signal a different way: as a set of pure-sine components at different frequencies — the fundamental plus its harmonics — that, added together, reconstruct the original waveform. This view explains WHY a square wave sounds and behaves differently from a sine wave carrying the same fundamental frequency.`,
        lecture: `### From time domain to frequency domain

Any periodic, non-sinusoidal waveform can be represented as a sum of a **fundamental** sine wave (at the signal's own frequency) plus **harmonics**: sine waves at integer multiples of the fundamental frequency (2×, 3×, 4× ...), each with its own amplitude. This decomposition is the Fourier series; a spectrum analyser (or a scope's FFT function) displays the amplitude of each of these components as a bar or peak at its frequency.

### What different inverter waveforms look like in the spectrum

- **Pure sine**: essentially one spike, at the fundamental. Very little harmonic content.
- **Square wave**: a strong fundamental plus significant odd harmonics (3rd, 5th, 7th...), which is why an unfiltered square-wave inverter's output is "rougher" on sensitive loads than a sine wave of the same RMS voltage.
- **Modified sine**: fundamental plus odd harmonics too, generally lower in amplitude than a plain square wave because of the zero dwell, but still present.
- **SPWM (unfiltered)**: energy concentrated near the fundamental PLUS large content clustered around the carrier (switching) frequency and its multiples — very different from the low-order harmonics of a square or modified-sine wave. This high-frequency content is exactly what the output LC filter (F3.M2, Build lab project D) is designed to remove, leaving close to a pure sine.

### Total harmonic distortion (THD)

**THD** is a single number summarising how much harmonic content a waveform carries relative to its fundamental:

THD = √(V₂² + V₃² + V₄² + ...) / V₁

where V₁ is the fundamental's RMS amplitude and V₂, V₃... are the RMS amplitudes of the 2nd, 3rd... harmonics. A pure sine has THD ≈ 0. An unfiltered square wave has a high THD (tens of percent). Many sensitive loads (some electronics, audio equipment, certain motors) specify a maximum acceptable THD, which is why pure-sine inverters are preferred for them over cheaper modified-sine designs.

### Why filtering reduces THD

An LC low-pass filter passes the fundamental frequency with little attenuation but strongly attenuates frequencies well above it — exactly where most of a switched waveform's harmonic (and especially switching-frequency) energy lives. This is why a well-designed filtered SPWM inverter can achieve a THD of only a few percent, far below an unfiltered square or modified-sine design.`,
        technical: `**This course teaches the spectrum qualitatively, not by computing an FFT.** A full Fourier/FFT treatment belongs to a more advanced signal-processing course; here, recognising which waveform shapes carry more or less harmonic energy, and why filtering helps, is the target competency.

**THD is relative to the fundamental, not to a fixed reference.** The same absolute harmonic amplitude gives a lower THD on a waveform with a larger fundamental — this is one reason manufacturers sometimes also quote "THD-F" (relative to fundamental, the usual definition) alongside other conventions; always check which definition a datasheet uses.`,
        diagrams: [{ id: 'spwm', caption: 'Time-domain SPWM pulses alongside a qualitative spectrum: energy near the fundamental and clustered around the carrier frequency, both reduced by the output filter.' }],
        formulas: [{ name: 'Total harmonic distortion', expr: 'THD = √(V₂² + V₃² + V₄² + …) / V₁', where: [['V₁', 'fundamental RMS amplitude', 'V'], ['Vₙ', 'n-th harmonic RMS amplitude', 'V']] }],
        examples: [
          {
            title: 'Estimating THD from two harmonics',
            problem: 'A waveform has a 230 V rms fundamental, a 30 V rms 3rd harmonic and a 15 V rms 5th harmonic (ignore higher harmonics). Estimate its THD.',
            steps: ['THD = √(30² + 15²) / 230', '= √(900 + 225) / 230 = √1125 / 230 = 33.54 / 230'],
            answer: '≈ 14.6 % THD.',
            check: 'A modified-sine-class result: noticeably more distorted than a pure sine (≈0%) but far better than a bare square wave.',
          },
          {
            title: 'How filtering changes the spectrum',
            problem: 'An unfiltered SPWM bridge output has most of its non-fundamental energy clustered around its 1 kHz carrier frequency. After adding an output LC filter with a cutoff well below 1 kHz but above 50 Hz, what happens to the spectrum, qualitatively?',
            steps: ['The filter passes frequencies below its cutoff with little attenuation', 'The fundamental (50 Hz) is well below the cutoff and passes through largely unaffected', 'The carrier-frequency content (1 kHz) is well above the cutoff and is strongly attenuated'],
            answer: 'The fundamental remains essentially intact while the carrier-frequency energy is greatly reduced, so the resulting waveform looks much closer to a pure sine — exactly the effect THD improvement from filtering.',
          },
        ],
        applications: `This is the direct justification for why F3.M5 and the Build Your Own Inverter project D (pure sine) add an output LC filter after the switching bridge: filtering is how a design moves a high-THD switched waveform toward the low-THD sine that sensitive loads require.`,
        mistakes: [
          { mistake: '"Lower frequency content is always the harmonic that matters most."', correction: 'The amplitude of each harmonic matters, not just its order; a smaller high-order harmonic can matter less than a larger low-order one.' },
          { mistake: 'Assuming a modified-sine inverter has the same THD as a square wave.', correction: 'The zero dwell in a modified sine generally reduces (but does not eliminate) harmonic content compared with a plain square wave.' },
          { mistake: 'Thinking filtering removes the fundamental too.', correction: 'A correctly designed low-pass filter is set to pass the fundamental with little attenuation while rejecting higher frequencies.' },
        ],
        demo: { title: 'Compare waveform shapes on the scope', text: 'Capture a square wave, a modified sine and a pure sine at the same fundamental frequency and compare their time-domain shapes as a qualitative guide to their relative harmonic content.', link: to.instrument('Open the oscilloscope', 'scope') },
        activities: [to.instrument('Oscilloscope', 'scope'), to.lib('PWM controller', 'pwm-controller')],
        check: [
          { id: 'k1', type: 'mcq', prompt: 'A spectrum display shows a signal as...', options: ['a fundamental plus harmonic components at different frequencies', 'voltage against time', 'current against voltage', 'temperature against time'], answer: 0, explain: 'A spectrum is the frequency-domain view.' },
          { id: 'k2', type: 'mcq', prompt: 'Which waveform has the LOWEST THD?', options: ['Pure sine', 'Square wave', 'Modified sine', 'Unfiltered PWM'], answer: 0, explain: 'A pure sine is essentially just its fundamental.' },
          { id: 'k3', type: 'mcq', prompt: 'An output LC filter reduces THD mainly by...', options: ['attenuating frequencies well above the fundamental', 'boosting the fundamental', 'removing the fundamental', 'adding harmonics'], answer: 0, explain: 'A low-pass filter passes the fundamental and rejects higher frequencies.' },
          { id: 'k4', type: 'numeric', prompt: 'THD with a 100 V fundamental and a single 10 V third harmonic (ignore all others), as a percentage?', answer: 10, tol: 0.05, unit: '%', explain: 'THD = 10/100 = 10%.' },
        ],
        summary: [
          'A spectrum decomposes a periodic waveform into a fundamental plus harmonics at integer multiples of its frequency.',
          'Square and modified-sine waveforms carry significant low-order odd harmonics; unfiltered SPWM carries energy near the carrier frequency instead.',
          'THD summarises total harmonic content relative to the fundamental; lower THD generally suits sensitive loads better.',
          'An output LC filter reduces THD by attenuating frequencies above the fundamental while passing the fundamental itself.',
        ],
        homework: {
          id: 'F5.M3.L3.hw',
          title: 'THD estimation',
          brief: 'Estimate THD from given harmonic amplitudes.',
          tasks: [{ id: 'h1', type: 'numeric', prompt: 'Fundamental 120 V rms, 3rd harmonic 12 V rms only. THD (%)?', answer: 10, tol: 0.05, unit: '%', explain: '12/120 = 10%.' }],
          written: [{ prompt: 'A customer asks why a cheaper modified-sine inverter is unsuitable for their sensitive audio amplifier, while a pure-sine inverter works fine, even though both deliver the "same 230 V" to the amplifier. Explain the real difference in terms covered in this lesson.', model: 'Both inverters can deliver 230 V RMS, but the modified-sine output carries significant harmonic content (a higher THD) because of its stepped, non-sinusoidal shape, while the pure-sine output is close to a single fundamental frequency with low THD. The audio amplifier is sensitive to the waveform shape, not just the RMS voltage, so the extra harmonic content from the modified-sine inverter can introduce audible distortion or stress that the low-THD pure-sine inverter avoids.' }],
        },
      },
    },
  ],
  quiz: {
    pass: 0.8,
    questions: [
      { id: 'q1', type: 'numeric', prompt: 'A cycle spans 8 divisions at 1 ms/div. Frequency (Hz)?', answer: 125, tol: 0.02, unit: 'Hz', explain: 'T = 8 ms, f = 1/0.008 = 125 Hz.' },
      { id: 'q2', type: 'mcq', prompt: 'RMS of an ideal square wave equals...', options: ['its peak value', 'peak / √2', 'half its peak', 'zero'], answer: 0, explain: 'A square wave is at full amplitude for the whole cycle.' },
      { id: 'q3', type: 'mcq', prompt: 'A true-RMS meter differs from an average-sensing one because it...', options: ['computes actual RMS regardless of waveform shape', 'only works on DC', 'always reads lower', 'requires a trigger'], answer: 0, explain: 'Average-sensing assumes a sine shape.' },
      { id: 'q4', type: 'mcq', prompt: 'The waveform with the lowest THD is...', options: ['pure sine', 'square wave', 'modified sine', 'unfiltered PWM'], answer: 0, explain: 'A pure sine is essentially just its fundamental.' },
      { id: 'q5', type: 'mcq', prompt: 'An output LC filter reduces harmonic content mainly by...', options: ['attenuating frequencies above the fundamental', 'adding harmonics', 'boosting the carrier frequency', 'removing the fundamental'], answer: 0, explain: 'A low-pass filter rejects high-frequency content.' },
    ],
  },
  practicals: [],
}
