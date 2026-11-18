import type { AcademyModule } from '../types'
import { to } from '../s1/links'

/** F3.M5 Rectification. */
export const F3_M5: AcademyModule = {
  id: 'F3.M5',
  title: 'Rectification',
  summary: 'Half-wave and full-wave rectification, the bridge rectifier topology, and smoothing with ripple analysis — the AC-to-DC conversion this course set up as the opposite of inversion.',
  lessons: [
    {
      id: 'F3.M5.L1',
      title: 'Half-wave and full-wave rectification',
      minutes: 30,
      content: {
        objectives: [
          'Explain how a single diode produces half-wave rectification.',
          'Explain how a full-wave rectifier uses both halves of the AC cycle.',
          'Compare the average (DC) output and ripple frequency of half-wave and full-wave rectification.',
          'Relate rectifier diode behaviour to the diode test covered in F5.M2.L1.',
        ],
        introduction: `F3.M1.L4 flagged rectification as the reverse of inversion: converting AC back to DC. This lesson builds that conversion from its simplest component — a single diode — up to the more practical full-wave arrangement, directly using the diode behaviour you tested with the DMM in F5.M2.L1.`,
        lecture: `### The diode as a one-way valve

A [[diode|diode]] conducts current in one direction (forward) with a small voltage drop, and blocks it almost entirely in the other (reverse) — exactly the behaviour F5.M2.L1's diode test mode measured directly. This one-way property is the entire basis of rectification.

### Half-wave rectification

A single diode placed in series with an AC source and a load conducts only during the half of each cycle where the source polarity forwards-biases it, and blocks during the other half. The result is a pulsed, ALL-POSITIVE (or all-negative, depending on diode orientation) output — current flows for only half of each cycle, with the output sitting at zero for the other half.

### Full-wave rectification

A full-wave rectifier uses additional diodes (either a centre-tapped transformer secondary with two diodes, or four diodes in a bridge arrangement, F3.M5.L2) so that BOTH halves of the AC cycle contribute current to the load, with the negative half-cycle's current redirected (inverted in direction, not blocked) rather than simply discarded. The result is a pulsed, all-positive output with NO zero-output interval — the "humps" appear twice per input cycle instead of once.

### Comparing the two

- **Average (DC) output**: full-wave rectification gives roughly TWICE the average output of half-wave rectification for the same peak input voltage, because it uses both half-cycles instead of discarding one.
- **Ripple frequency**: half-wave rectification produces one pulse per input cycle (ripple at the fundamental frequency, e.g. 50 Hz); full-wave rectification produces two pulses per input cycle (ripple at TWICE the fundamental frequency, e.g. 100 Hz) — a higher ripple frequency that, as F3.M5.L3 will show, is easier to smooth with a given smoothing capacitor.`,
        technical: `**Why full-wave rectification is almost always preferred in practice.** Beyond the twice-as-high average output, full-wave rectification's higher ripple frequency means a smoothing capacitor of a given size produces LESS residual ripple voltage (F3.M5.L3) than the same capacitor would with half-wave rectification's lower ripple frequency — a double benefit that makes half-wave rectification rare in anything beyond the simplest, lowest-power applications.

**Diode forward voltage drop's effect on output.** A real diode's forward voltage drop (silicon: typically around 0.6–0.7 V, as measured in F5.M2.L1's diode test) subtracts directly from the rectified output at every conducting instant — a detail that matters more at low output voltages (where 0.7 V is a significant fraction of the total) than at high output voltages.`,
        diagrams: [{ id: 'quasi-square', caption: 'Half-wave rectified output (one pulse per cycle, with a zero interval) compared with full-wave rectified output (two pulses per cycle, no zero interval).' }],
        formulas: [{ name: 'Diode forward drop (recap, F5.M2.L1)', expr: 'V_out ≈ V_source − V_F', where: [['V_F', 'diode forward voltage drop', 'V (≈0.6–0.7 V silicon)']], note: 'Each conducting diode subtracts its own forward drop from the rectified output at every conducting instant.' }],
        examples: [
          {
            title: 'Diode conduction direction in half-wave rectification',
            problem: 'An AC source\'s instantaneous voltage is +10 V (forward-biasing a series diode) then −10 V (reverse-biasing it) half a cycle later. Describe the load current in each half-cycle.',
            steps: ['At +10 V: diode is forward-biased, conducts, current flows to the load (reduced slightly by the diode\'s forward voltage drop)', 'At −10 V: diode is reverse-biased, blocks almost all current, load current is essentially zero'],
            answer: 'Current flows only during the positive half-cycle (for this diode orientation), giving the pulsed, half-wave output with a zero interval each cycle.',
          },
          {
            title: 'Ripple frequency comparison',
            problem: 'For a 60 Hz AC input, state the ripple frequency produced by (a) half-wave and (b) full-wave rectification.',
            steps: ['Half-wave: one pulse per input cycle → ripple at the fundamental, 60 Hz', 'Full-wave: two pulses per input cycle (one per half-cycle) → ripple at twice the fundamental, 120 Hz'],
            answer: '(a) 60 Hz; (b) 120 Hz.',
            check: 'Full-wave ripple frequency is always exactly double the input frequency, consistent with using both half-cycles.',
          },
        ],
        applications: `This is directly relevant to the rectifier stage inside a battery charger or any AC-to-DC power supply, and to the Build Your Own Inverter laboratory's own treatment of rectification as the "reverse direction" companion to the inverter projects.`,
        mistakes: [
          { mistake: 'Assuming half-wave and full-wave rectifiers produce the same average output for the same input.', correction: 'Full-wave rectification gives roughly double the average output of half-wave for the same peak input, since it uses both half-cycles.' },
          { mistake: 'Assuming rectified output is smooth DC directly from the diodes alone.', correction: 'Diode rectification alone produces a pulsed, ripple-containing output; smoothing (F3.M5.L3) is a separate following stage.' },
          { mistake: 'Ignoring the diode\'s forward voltage drop when estimating output voltage.', correction: 'Each conducting diode subtracts its forward voltage drop (silicon: ~0.6–0.7 V) from the output at every conducting instant.' },
        ],
        demo: { title: 'Confirm diode behaviour directly', text: 'Use the DMM\'s diode test mode to confirm forward conduction and reverse blocking on a real diode, the exact behaviour behind rectification.', link: to.instrument('Open the DMM', 'dmm') },
        activities: [to.instrument('Digital multimeter', 'dmm'), to.lib('Diode', 'diode')],
        check: [
          { id: 'k1', type: 'mcq', prompt: 'Half-wave rectification uses...', options: ['only one half of the AC input cycle', 'both halves of the cycle', 'no diodes at all', 'only the negative half always'], answer: 0, explain: 'The diode blocks the other half-cycle entirely.' },
          { id: 'k2', type: 'mcq', prompt: 'Compared with half-wave, full-wave rectification\'s average output for the same peak input is roughly...', options: ['double', 'the same', 'half', 'zero'], answer: 0, explain: 'Both half-cycles contribute current instead of one.' },
          { id: 'k3', type: 'numeric', prompt: 'Ripple frequency from full-wave rectification of a 50 Hz input (Hz)?', answer: 100, tol: 0.01, unit: 'Hz', explain: 'Full-wave gives two pulses per cycle: 2×50 = 100 Hz.' },
          { id: 'k4', type: 'mcq', prompt: 'A diode\'s forward voltage drop...', options: ['subtracts from the rectified output at every conducting instant', 'adds to the output voltage', 'only matters at high frequency', 'is always exactly zero'], answer: 0, explain: 'A real diode has a small but non-zero forward drop.' },
        ],
        summary: [
          'A diode\'s one-way conduction is the basis of rectification: half-wave rectification uses one diode and one half of each AC cycle.',
          'Full-wave rectification uses both halves of the cycle, roughly doubling average output for the same peak input.',
          'Full-wave ripple frequency is twice the input frequency; half-wave ripple frequency equals the input frequency.',
          'A diode\'s forward voltage drop subtracts from the rectified output at every conducting instant.',
        ],
        homework: {
          id: 'F3.M5.L1.hw',
          title: 'Rectification comparison',
          brief: 'Compare half-wave and full-wave rectification.',
          tasks: [{ id: 'h1', type: 'numeric', prompt: 'Ripple frequency from full-wave rectification of a 60 Hz input (Hz)?', answer: 120, tol: 0.01, unit: 'Hz', explain: '2×60 = 120 Hz.' }],
          written: [{ prompt: 'A low-cost nightlight circuit uses a single diode (half-wave rectification) to power a small DC LED from AC mains, while a battery charger uses a full-wave bridge. Suggest why the designers might have made these different choices for these two applications.', model: 'The nightlight\'s LED load is small, cost-sensitive, and tolerant of the lower average output and more pronounced ripple of half-wave rectification — a single diode minimises component count and cost, which matters more than efficiency or smoothness for this simple application. A battery charger, by contrast, needs to deliver a specific, well-controlled average charging current/voltage efficiently, where half-wave rectification\'s lower average output and harder-to-smooth lower-frequency ripple would be a real disadvantage — the extra diodes in a full-wave bridge are a worthwhile cost for the better output quality and efficiency this application needs.' }],
        },
      },
    },
    {
      id: 'F3.M5.L2',
      title: 'The bridge rectifier',
      minutes: 25,
      content: {
        objectives: [
          'Describe the bridge rectifier topology and trace current flow for each half-cycle.',
          'Explain why a bridge rectifier does not require a centre-tapped transformer secondary.',
          'State the component tester\'s relevance to verifying bridge rectifier diodes.',
        ],
        introduction: `The most common way to achieve full-wave rectification (F3.M5.L1) without needing a centre-tapped transformer secondary is the four-diode **bridge rectifier** — a specific, elegant arrangement worth tracing through carefully.`,
        lecture: `### The bridge arrangement

Four diodes are arranged so that, for EITHER polarity of the AC input, exactly two of the four diodes conduct and direct current through the load in the SAME direction, while the other two block. As the AC input reverses polarity each half-cycle, the PAIR of conducting diodes swaps, but the current direction through the load stays the same — this is what produces a full-wave, all-one-polarity output from a single, non-tapped AC source.

### Tracing current for each half-cycle

- **Positive half-cycle** (source terminal A positive relative to B): current flows from A, through one diode, through the load (in a fixed direction), through a second diode, and back to B.
- **Negative half-cycle** (B now positive relative to A): current flows from B, through a DIFFERENT diode, through the load (in the SAME fixed direction as before), through the fourth diode, and back to A.

In both cases, the load sees current in the same direction — this swapping of which diode pair conducts, while keeping load current direction fixed, is the key trick of the bridge arrangement.

### Why no centre tap is needed

The alternative full-wave method (F3.M5.L1) uses a centre-tapped secondary with two diodes, exploiting the two equal half-voltages on either side of the centre tap (F3.M4.L4). The bridge rectifier achieves the same full-wave result using FOUR diodes and an ORDINARY (non-centre-tapped) secondary — a simpler transformer at the cost of two extra diodes, which is why the bridge rectifier is the far more common choice in practice, since diodes are cheap and a non-tapped transformer secondary is simpler to wind.

### Checking bridge rectifier diodes

Each diode in a bridge rectifier can be checked individually with the DMM's diode test mode (F5.M2.L1) or evaluated with the component tester's diode procedure (F5.M4's component-tester coverage) — a failed diode in a bridge (open or shorted) causes a characteristic half-wave-like or short-circuit-like fault in the bridge's output, which is a common real-world fault-finding scenario.`,
        technical: `**Bridge rectifier voltage drop.** Because TWO diodes conduct in series at any instant (rather than one, as in the simpler full-wave centre-tap method), a bridge rectifier's output is reduced by roughly TWICE a single diode's forward voltage drop (around 1.2–1.4 V for silicon diodes) rather than one drop — a detail that matters more at low output voltages.

**Integrated bridge rectifier packages.** In practice, bridge rectifiers are very commonly sold as a single four-terminal packaged component (two AC input terminals, two DC output terminals) rather than built from four discrete diodes — the LCR/component-tester and DMM diode-test principles still apply to each internal diode, though direct individual access may not be possible on a packaged bridge.`,
        diagrams: [{ id: 'quasi-square', caption: 'A bridge rectifier\'s four diodes, with current paths traced for the positive and negative AC half-cycles, both producing the same load current direction.' }],
        formulas: [{ name: 'Bridge rectifier peak output (silicon)', expr: 'V_out,pk ≈ V_in,pk − 2·V_F', where: [['V_in,pk', 'peak of the AC input to the bridge', 'V'], ['V_F', 'single diode forward drop', 'V (≈0.6–0.7 V)']], note: 'Two diodes conduct in series at any instant, so the combined drop is roughly double a single diode\'s.' }],
        examples: [
          {
            title: 'Diagnosing a bridge rectifier fault from its output',
            problem: 'A bridge rectifier\'s output, viewed on an oscilloscope, shows only ONE pulse per input AC cycle instead of the expected two (half-wave-like behaviour from a circuit built as a full bridge). Suggest a plausible fault.',
            steps: ['Normal full-wave bridge output has two pulses per cycle, from alternating diode pairs conducting each half-cycle', 'A single-pulse-per-cycle output suggests only ONE half-cycle is actually reaching the load — consistent with one diode (or diode pair) having failed open, so current only flows during the half-cycle that does not need the failed component'],
            answer: 'A plausible fault is one failed-open diode in the bridge, causing the circuit to behave like a half-wave rectifier for one half-cycle while the other half-cycle\'s path is broken.',
          },
          {
            title: 'Why bridge output voltage is slightly lower than expected',
            problem: 'A bridge rectifier fed from a transformer secondary with 12 V rms is measured to give a peak output noticeably less than 12×√2 = 16.97 V. Explain, using diode conduction, why this is expected.',
            steps: ['Two diodes conduct in series at any instant in a bridge rectifier', 'Each diode drops roughly 0.6–0.7 V, so the pair drops roughly 1.2–1.4 V total'],
            answer: 'The expected peak output is reduced by roughly 1.2–1.4 V from the theoretical 16.97 V peak, due to the combined forward voltage drop of the two series-conducting diodes — consistent with a lower-than-theoretical measured peak.',
          },
        ],
        applications: `This is the rectifier topology used in essentially every mains-to-DC power supply and battery charger you will encounter in this programme and in practice, and is the stage the oscilloscope and component tester are most often used together to fault-find.`,
        mistakes: [
          { mistake: 'Assuming a bridge rectifier needs a centre-tapped transformer.', correction: 'A bridge rectifier specifically avoids needing a centre tap, using four diodes with an ordinary secondary instead.' },
          { mistake: 'Forgetting that TWO diodes conduct in series in a bridge, doubling the voltage drop.', correction: 'Account for roughly 1.2–1.4 V total drop (two diodes in series) when estimating a silicon bridge rectifier\'s output, not just one diode\'s drop.' },
          { mistake: 'Assuming all four bridge diodes conduct simultaneously at any instant.', correction: 'Exactly two of the four conduct at a time (the pair appropriate to the current half-cycle\'s polarity); the other two block.' },
        ],
        demo: { title: 'Test bridge rectifier diodes', text: 'Use the component tester\'s diode procedure (or the DMM\'s diode mode) to check each diode in a bridge arrangement individually.', link: to.instrument('Open the component tester', 'component-tester') },
        activities: [to.instrument('Component tester', 'component-tester'), to.instrument('Digital multimeter', 'dmm'), to.sim('Bridge rectifier experiment', 'sim-03'), to.ckt('Bridge rectifier exercise', 'ckt-04')],
        check: [
          { id: 'k1', type: 'mcq', prompt: 'In a bridge rectifier, how many diodes conduct at any one instant?', options: ['two', 'one', 'four', 'zero'], answer: 0, explain: 'One pair conducts per half-cycle; the other pair blocks.' },
          { id: 'k2', type: 'mcq', prompt: 'A key advantage of the bridge rectifier over the centre-tapped full-wave method is...', options: ['it does not require a centre-tapped transformer secondary', 'it uses fewer diodes', 'it produces half-wave output', 'it eliminates ripple entirely'], answer: 0, explain: 'It trades a simpler transformer for two extra diodes.' },
          { id: 'k3', type: 'mcq', prompt: 'A bridge rectifier\'s output voltage is reduced by roughly...', options: ['two diode forward-voltage drops (since two diodes conduct in series)', 'one diode forward-voltage drop', 'zero, ideally', 'four diode drops'], answer: 0, explain: 'Two diodes are in the conducting path at any instant.' },
        ],
        summary: [
          'A bridge rectifier uses four diodes arranged so that each AC half-cycle is directed through the load in the same fixed direction, via a swapping pair of conducting diodes.',
          'A bridge rectifier does not require a centre-tapped transformer secondary, unlike the alternative full-wave method.',
          'Because two diodes conduct in series at any instant, bridge output voltage is reduced by roughly two diode forward-voltage drops.',
          'The DMM\'s diode test and the component tester can each verify individual bridge rectifier diodes, aiding fault diagnosis.',
        ],
        homework: {
          id: 'F3.M5.L2.hw',
          title: 'Bridge rectifier reasoning',
          brief: 'Reason about bridge rectifier operation and faults.',
          tasks: [{ id: 'h1', type: 'numeric', prompt: 'Expected peak bridge output for a 9 V rms secondary (V_in,pk = 9×√2 = 12.73 V), with two silicon diodes dropping 0.65 V each (V, to 2 decimals)?', answer: 11.43, tol: 0.03, unit: 'V', explain: 'V_out,pk ≈ 12.73 − 2×0.65 = 11.43 V.' }],
          written: [{ prompt: 'A bridge rectifier\'s DC output is measured to be a steady, non-zero voltage, but an oscilloscope shows a flat line with no ripple at all — unusually smooth even for a well-smoothed supply. Suggest what this might indicate, and how you would investigate further.', model: 'A completely flat, ripple-free DC output could indicate either an exceptionally well-designed smoothing stage, or more likely for a simple circuit, a measurement or wiring issue — such as the oscilloscope probe actually measuring a point after an unusually large smoothing capacitor that has essentially become a constant voltage source (if the load is very light), or a fault bypassing the rectifier entirely (such as a shorted diode providing a low-impedance path that happens to look steady). To investigate, I would check the circuit\'s smoothing capacitor value and load current against the expected ripple using this module\'s formulas, verify each bridge diode individually with the DMM\'s diode test or the component tester, and confirm the probe is actually connected at the intended measurement point.' }],
        },
      },
    },
    {
      id: 'F3.M5.L3',
      title: 'Smoothing and ripple',
      minutes: 30,
      content: {
        objectives: [
          'Explain how a smoothing (reservoir) capacitor reduces ripple after rectification.',
          'Estimate ripple voltage from load current, capacitance and ripple frequency.',
          'Explain why full-wave rectification produces less ripple than half-wave for the same smoothing capacitor and load.',
          'Relate smoothing capacitor selection to the ESR/capacitance measurements of F5.M4.L2.',
        ],
        introduction: `A rectified but unsmoothed output is still a pulsing, far-from-steady voltage. A smoothing (reservoir) capacitor placed across the rectifier's output is what turns those pulses into a usable, nearly-constant DC voltage — and this closing lesson quantifies exactly how well it does so.`,
        lecture: `### How a smoothing capacitor works

A large capacitor placed across the rectifier output charges up toward the peak of each rectified pulse, then — because the capacitor's reactance at the ripple frequency is far lower than the load's resistance at the DC level (F3.M2.L1's reactance ideas applied directly) — it supplies the load's current itself during the brief interval BETWEEN pulses, when the rectifier's own output would otherwise dip toward zero. The capacitor's voltage sags slightly during this interval, then is topped back up at the next pulse — this residual sag is the **ripple voltage**.

### Estimating ripple voltage

A widely used approximation treats the capacitor as discharging into the load at a roughly constant current I_load during the time T between successive pulses:

**ΔV_ripple ≈ I_load / (f_ripple · C)**

where f_ripple is the ripple frequency (F3.M5.L1: equal to the input frequency for half-wave, or double it for full-wave). This approximation improves as the ripple voltage becomes small relative to the DC level (the usual, well-designed case).

### Why full-wave rectification smooths more easily

For the SAME capacitor and load current, full-wave rectification's ripple frequency is DOUBLE that of half-wave (F3.M5.L1), and the formula above shows ripple voltage is INVERSELY proportional to ripple frequency — so full-wave rectification gives roughly HALF the ripple voltage of half-wave, for the same capacitor and load. This is the second half of the "double benefit" flagged in F3.M5.L1's technical note.

### Choosing a smoothing capacitor

A larger capacitance C, for the same load current and ripple frequency, gives proportionally lower ripple voltage — which is why smoothing capacitors in rectifier/charger circuits are often large electrolytic types, and why their HEALTH (capacitance and ESR, exactly as measured by the LCR meter in F5.M4.L2) matters directly: a capacitor that has dried out and lost capacitance will show noticeably increased ripple on the DC output, often the first symptom of ageing in an electronic power supply.`,
        technical: `**ESR's additional contribution to ripple.** Beyond the capacitance-based ripple estimate above, a capacitor's own ESR (F5.M4.L2) adds a further small ripple component, because the ripple current flowing through the capacitor also develops a small voltage across its internal ESR. For a healthy capacitor with low ESR this is a minor addition; for an aged capacitor with elevated ESR, this extra ripple contribution can become significant — another reason ESR testing is a meaningful health check beyond capacitance alone.

**Ripple and regulation stages.** In practice, many DC supplies follow the rectifier/smoothing-capacitor stage with a further voltage regulation stage (linear or switching) that further reduces ripple and holds the output voltage constant despite input or load variation — a topic beyond this course's scope, but worth knowing this lesson's "smoothed but not perfectly flat" output is often not the final word.`,
        diagrams: [{ id: 'rc-curve', caption: 'A smoothing capacitor charging to the peak of each rectified pulse and discharging slightly into the load between pulses, producing a sawtooth-like ripple voltage.' }],
        formulas: [{ name: 'Approximate ripple voltage', expr: 'ΔV_ripple ≈ I_load / (f_ripple · C)', where: [['ΔV_ripple', 'peak-to-peak ripple voltage', 'V'], ['I_load', 'load current', 'A'], ['f_ripple', 'ripple frequency', 'Hz'], ['C', 'smoothing capacitance', 'F']] }],
        examples: [
          {
            title: 'Ripple voltage for a full-wave supply',
            problem: 'A full-wave rectified 50 Hz supply (ripple frequency 100 Hz) feeds a 2 A load through a 4700 µF smoothing capacitor. Estimate the ripple voltage.',
            steps: ['ΔV ≈ I_load / (f_ripple × C) = 2 / (100 × 4700×10⁻⁶)', '= 2 / 0.47'],
            answer: '≈ 4.26 V peak-to-peak ripple.',
          },
          {
            title: 'Comparing half-wave and full-wave ripple for the same components',
            problem: 'For the same 2 A load and 4700 µF capacitor as the previous example, but with half-wave rectification instead (ripple frequency 50 Hz), estimate the ripple voltage and compare.',
            steps: ['ΔV ≈ 2 / (50 × 4700×10⁻⁶)', '= 2 / 0.235'],
            answer: '≈ 8.51 V peak-to-peak — almost exactly double the full-wave result (4.26 V), confirming the "half the ripple" benefit of full-wave rectification for the same capacitor and load.',
            check: '8.51/4.26 ≈ 2.0, matching the expected doubling from halving the ripple frequency.',
          },
        ],
        applications: `This is the exact calculation behind sizing the smoothing/reservoir capacitor in a battery charger or any rectified power supply in this programme — and it directly explains why a worn-out electrolytic capacitor (reduced capacitance, elevated ESR — both detectable with F5.M4.L2's LCR meter) is a classic cause of "unusually noisy" or "hum-heavy" DC output in failing equipment.`,
        mistakes: [
          { mistake: 'Assuming a smoothing capacitor produces perfectly flat DC.', correction: 'Some residual ripple always remains; the capacitor reduces it, following ΔV ≈ I_load/(f_ripple×C), rather than eliminating it.' },
          { mistake: 'Forgetting that half-wave and full-wave rectification give different ripple for the same capacitor.', correction: 'Full-wave\'s higher ripple frequency (2× half-wave) gives roughly half the ripple voltage for the same C and load current.' },
          { mistake: 'Ignoring ESR\'s contribution to ripple on an aged capacitor.', correction: 'Elevated ESR adds its own ripple contribution beyond the basic capacitance-based estimate, which is why ESR testing matters for diagnosing ripple problems.' },
        ],
        demo: { title: 'Check a smoothing capacitor\'s health', text: 'Use the LCR meter\'s capacitance and ESR readings to assess whether a smoothing capacitor is likely to be producing excess ripple due to ageing.', link: to.instrument('Open the LCR meter', 'lcr') },
        activities: [to.instrument('LCR meter', 'lcr'), to.instrument('Oscilloscope', 'scope'), to.sim('DC filtering experiment', 'sim-04'), to.ckt('DC filtering exercise', 'ckt-05')],
        check: [
          { id: 'k1', type: 'numeric', prompt: 'Ripple voltage for I=1 A, f=100 Hz, C=2200 µF (V, to 2 decimals)?', answer: 4.55, tol: 0.03, unit: 'V', explain: 'ΔV=1/(100×2200e-6)=1/0.22≈4.55 V.' },
          { id: 'k2', type: 'mcq', prompt: 'For the same capacitor and load current, full-wave rectification\'s ripple voltage compared with half-wave is roughly...', options: ['half', 'double', 'the same', 'four times larger'], answer: 0, explain: 'Double the ripple frequency halves the ripple voltage.' },
          { id: 'k3', type: 'mcq', prompt: 'A larger smoothing capacitance, for the same load and ripple frequency, gives...', options: ['proportionally lower ripple voltage', 'proportionally higher ripple voltage', 'no change in ripple', 'only a change in ripple frequency'], answer: 0, explain: 'Ripple voltage is inversely proportional to capacitance.' },
          { id: 'k4', type: 'mcq', prompt: 'An aged capacitor with reduced capacitance and elevated ESR, used for smoothing, typically produces...', options: ['increased ripple voltage', 'decreased ripple voltage', 'no change in ripple', 'a higher ripple frequency'], answer: 0, explain: 'Lower C and higher ESR both tend to increase ripple.' },
        ],
        summary: [
          'A smoothing capacitor charges to each rectified pulse\'s peak and supplies load current between pulses, producing a residual ripple voltage.',
          'ΔV_ripple ≈ I_load/(f_ripple×C): ripple falls with higher ripple frequency or larger capacitance.',
          'Full-wave rectification\'s double ripple frequency gives roughly half the ripple voltage of half-wave, for the same capacitor and load.',
          'A capacitor\'s ESR adds a further ripple contribution; elevated ESR from ageing (detectable with the LCR meter) is a classic cause of excess ripple in failing equipment.',
        ],
        homework: {
          id: 'F3.M5.L3.hw',
          title: 'Ripple calculation practice',
          brief: 'Estimate ripple voltage for given parameters.',
          tasks: [
            { id: 'h1', type: 'numeric', prompt: 'Ripple voltage for I=3 A, f=120 Hz, C=4700 µF (V, to 2 decimals)?', answer: 5.32, tol: 0.03, unit: 'V', explain: 'ΔV=3/(120×4700e-6)=3/0.564≈5.32 V.' },
            { id: 'h2', type: 'numeric', prompt: 'Required capacitance for ΔV=2 V, I=1.5 A, f=100 Hz (µF, to the nearest whole number)?', answer: 7500, tol: 0.03, unit: 'µF', explain: 'C=I/(f×ΔV)=1.5/(100×2)=0.0075 F=7500 µF.' },
          ],
          written: [{ prompt: 'A piece of equipment that previously ran quietly develops an audible 100 Hz hum from its power supply after several years of service, with no other changes to the circuit or load. Using this lesson\'s formula, explain a plausible cause and how you would confirm it.', model: 'An audible 100 Hz hum (the full-wave ripple frequency for a 50 Hz supply) appearing after years of service, with no change in load, suggests the smoothing capacitor\'s effective capacitance has fallen (electrolytic capacitors commonly dry out and lose capacitance with age) — since ΔV_ripple ≈ I_load/(f_ripple×C), a lower C directly increases ripple voltage for the same load current and frequency, and that increased ripple can become audible through a power supply\'s downstream circuitry. I would confirm this by measuring the capacitor\'s capacitance and ESR with the LCR meter and comparing against its rated value and a healthy ESR range; a significant capacitance drop or ESR rise would confirm the capacitor as the cause and the next step would be replacement.' }],
        },
      },
    },
  ],
  quiz: {
    pass: 0.8,
    questions: [
      { id: 'q1', type: 'mcq', prompt: 'Half-wave rectification uses...', options: ['only one half of the AC cycle', 'both halves of the cycle', 'no diodes', 'only negative half always'], answer: 0, explain: 'The diode blocks the other half-cycle.' },
      { id: 'q2', type: 'numeric', prompt: 'Ripple frequency from full-wave rectification of a 50 Hz input (Hz)?', answer: 100, tol: 0.01, unit: 'Hz', explain: '2×50 = 100 Hz.' },
      { id: 'q3', type: 'mcq', prompt: 'A bridge rectifier avoids needing...', options: ['a centre-tapped transformer secondary', 'any diodes', 'an AC input', 'a load'], answer: 0, explain: 'Four diodes with an ordinary secondary replace the centre-tap method.' },
      { id: 'q4', type: 'mcq', prompt: 'In a bridge rectifier, how many diodes conduct at any instant?', options: ['two', 'one', 'four', 'zero'], answer: 0, explain: 'One pair per half-cycle.' },
      { id: 'q5', type: 'numeric', prompt: 'Ripple voltage for I=2 A, f=100 Hz, C=4000 µF (V, to 2 decimals)?', answer: 5, tol: 0.03, unit: 'V', explain: 'ΔV=2/(100×4000e-6)=2/0.4=5 V.' },
      { id: 'q6', type: 'mcq', prompt: 'For the same capacitor and load, full-wave rectification\'s ripple voltage versus half-wave is roughly...', options: ['half', 'double', 'the same', 'four times'], answer: 0, explain: 'Double ripple frequency halves ripple voltage.' },
    ],
  },
  practicals: [],
}
