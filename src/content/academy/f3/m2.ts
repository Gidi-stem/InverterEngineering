import type { AcademyModule } from '../types'
import { to } from '../s1/links'

/** F3.M2 Reactance and impedance. */
export const F3_M2: AcademyModule = {
  id: 'F3.M2',
  title: 'Reactance and impedance',
  summary: 'How capacitors and inductors oppose AC current in a frequency-dependent way, how reactance and resistance combine as impedance, and how resonance and filters follow from these ideas.',
  lessons: [
    {
      id: 'F3.M2.L1',
      title: 'Capacitive reactance',
      minutes: 30,
      content: {
        objectives: [
          'Define capacitive reactance and compute it at a given frequency.',
          'Explain why a capacitor passes AC more easily at higher frequency and blocks DC.',
          'Explain the 90° phase relationship between voltage and current in an ideal capacitor.',
          'Relate capacitive reactance to the LCR meter readings from F5.M4.L2.',
        ],
        introduction: `A capacitor's opposition to current is not a fixed resistance — it depends on frequency. This single idea, [[reactance|capacitive reactance]], explains why capacitors block DC entirely yet pass high-frequency signals almost freely, and is the same physics behind the LCR meter's impedance reading you met in F5.M4.L2.`,
        lecture: `### What reactance is

[[reactance|Reactance]] (symbol X) is the AC opposition to current from a capacitor or inductor, measured in ohms like resistance, but — unlike resistance — it depends on frequency and causes a 90° phase shift between voltage and current rather than dissipating energy as heat.

### Capacitive reactance

**X_C = 1 / (2πfC)**

As frequency f rises, X_C falls: a capacitor opposes current LESS at higher frequency. As f approaches zero (DC), X_C approaches infinity: an ideal capacitor blocks DC completely once fully charged, which is exactly why a capacitor used as a DC-bus reservoir charges up and then stops drawing further current once the ripple it is smoothing has been absorbed.

### Why a capacitor behaves this way

A capacitor stores energy in its electric field by accumulating charge on its plates: i = C(dv/dt), current is proportional to how FAST the voltage is changing, not to the voltage itself. A rapidly changing (high-frequency) voltage drives a large current; a slowly changing (low-frequency) voltage drives little current; a constant (DC) voltage drives none once charged.

### The 90° phase relationship

For an ideal capacitor, current LEADS voltage by 90°: the current is largest exactly when the voltage is changing fastest (crossing zero), and smallest when the voltage is at its peak (momentarily flat, not changing). This phase relationship — current leading voltage in a capacitor — is central to understanding power factor (F3.M3) and resonance (F3.M2.L4).`,
        technical: `**Impedance as a complex number.** A full treatment represents capacitive reactance as the imaginary quantity −j/(ωC) (using complex/phasor notation), which automatically encodes both the magnitude (1/ωC) and the 90° phase shift in one expression. This programme uses the magnitude form (X_C = 1/2πfC) and states the phase relationship separately, which is sufficient for the measurement and power-factor work this course requires.

**Why LCR meters must specify a test frequency (recall F5.M4.L2).** Because X_C depends on frequency, an LCR meter's capacitance READING is largely frequency-independent for a healthy capacitor (it is measuring C itself), but its IMPEDANCE (Z) reading changes with the chosen test frequency — this is exactly the Z-versus-frequency behaviour you measured on this lab's LCR meter.`,
        diagrams: [{ id: 'rc-curve', caption: 'Capacitive reactance falling as frequency rises, following X_C = 1/2πfC, with the DC (f→0) limit shown as X_C→∞.' }],
        formulas: [{ name: 'Capacitive reactance', expr: 'X_C = 1 / (2πfC)', where: [['X_C', 'capacitive reactance', 'Ω'], ['f', 'frequency', 'Hz'], ['C', 'capacitance', 'F']] }],
        examples: [
          {
            title: 'Reactance of a filter capacitor at mains frequency',
            problem: 'Find the reactance of a 100 µF capacitor at 50 Hz.',
            steps: ['X_C = 1 / (2π × 50 × 100×10⁻⁶)', '= 1 / (2π × 0.005) = 1 / 0.0314'],
            answer: '≈ 31.83 Ω.',
          },
          {
            title: 'Same capacitor at a much higher frequency',
            problem: 'Find the reactance of the same 100 µF capacitor at 20 kHz (a typical switching frequency), and compare it with the 50 Hz value.',
            steps: ['X_C = 1 / (2π × 20,000 × 100×10⁻⁶)', '= 1 / (2π × 2) = 1 / 12.566'],
            answer: '≈ 0.0796 Ω — about 400 times smaller than at 50 Hz, confirming the capacitor is a much better path for high-frequency content than for mains-frequency current.',
            check: '20,000/50 = 400, and reactance is inversely proportional to frequency, so a 400× frequency increase gives a 400× reactance decrease. ✓',
          },
        ],
        applications: `This is exactly why a bypass/decoupling capacitor placed across a DC bus is effective at absorbing high-frequency switching ripple while barely affecting the low-frequency (or DC) bus voltage itself — low reactance at high frequency, very high reactance near DC.`,
        mistakes: [
          { mistake: 'Treating capacitive reactance as a fixed resistance value.', correction: 'X_C depends on frequency; always state the frequency a reactance value applies to.' },
          { mistake: '"A capacitor passes DC once it is fully charged."', correction: 'An ideal, fully-charged capacitor passes NO further DC current; it blocks DC completely in steady state.' },
          { mistake: 'Assuming reactance dissipates power the way resistance does.', correction: 'Ideal reactance stores and returns energy each cycle; it does not dissipate heat (real capacitors have some loss, modelled as ESR, F5.M4.L2).' },
        ],
        demo: { title: 'Measure impedance versus frequency', text: 'Sweep the LCR meter\'s test frequency on a capacitor case and watch its impedance change exactly as X_C = 1/2πfC predicts.', link: to.instrument('Open the LCR meter', 'lcr') },
        activities: [to.instrument('LCR meter', 'lcr'), to.lib('Capacitors: electrolytic and film', 'capacitor')],
        check: [
          { id: 'k1', type: 'numeric', prompt: 'X_C of a 47 µF capacitor at 50 Hz (Ω)?', answer: 67.7, tol: 0.02, unit: 'Ω', explain: 'X_C = 1/(2π×50×47e-6) ≈ 67.7 Ω.' },
          { id: 'k2', type: 'mcq', prompt: 'As frequency rises, capacitive reactance...', options: ['falls', 'rises', 'stays constant', 'becomes resistive'], answer: 0, explain: 'X_C is inversely proportional to frequency.' },
          { id: 'k3', type: 'mcq', prompt: 'In an ideal capacitor, current...', options: ['leads voltage by 90°', 'lags voltage by 90°', 'is in phase with voltage', 'is always zero'], answer: 0, explain: 'Current is largest when voltage is changing fastest, which occurs before the voltage peak.' },
          { id: 'k4', type: 'mcq', prompt: 'An ideal capacitor in steady state, with a constant DC voltage applied, carries...', options: ['no further current', 'a constant current equal to C×V', 'an increasing current', 'a current equal to V/R'], answer: 0, explain: 'A constant voltage has dv/dt = 0, so i = C(dv/dt) = 0.' },
        ],
        summary: [
          'Capacitive reactance X_C = 1/(2πfC) falls as frequency rises and approaches infinity as frequency approaches zero (DC).',
          'A capacitor\'s current depends on how fast its voltage changes (i = C·dv/dt), not on the voltage itself.',
          'Current leads voltage by 90° in an ideal capacitor.',
          'This frequency dependence is why capacitors pass high-frequency switching ripple while blocking DC — and why LCR meter impedance readings change with test frequency.',
        ],
        homework: {
          id: 'F3.M2.L1.hw',
          title: 'Capacitive reactance practice',
          brief: 'Compute X_C at different frequencies.',
          tasks: [
            { id: 'h1', type: 'numeric', prompt: 'X_C of a 220 µF capacitor at 50 Hz (Ω)?', answer: 14.47, tol: 0.02, unit: 'Ω', explain: 'X_C = 1/(2π×50×220e-6) ≈ 14.47 Ω.' },
            { id: 'h2', type: 'numeric', prompt: 'X_C of the same capacitor at 1 kHz (Ω)?', answer: 0.72, tol: 0.03, unit: 'Ω', explain: 'X_C = 1/(2π×1000×220e-6) ≈ 0.72 Ω.' },
          ],
          written: [{ prompt: 'A reservoir capacitor on a DC bus is observed to pass essentially no current at steady state, yet clearly carries significant ripple current when examined on an oscilloscope. Explain both observations using capacitive reactance.', model: 'At steady DC, the capacitor\'s voltage is constant, so dv/dt ≈ 0 and essentially no current flows through it — equivalently, its reactance at zero frequency is effectively infinite. The ripple is a higher-frequency component superimposed on the DC level; at that higher frequency, the capacitor\'s reactance is much lower, so it readily carries the ripple current, absorbing it and smoothing the bus voltage.' }],
        },
      },
    },
    {
      id: 'F3.M2.L2',
      title: 'Inductive reactance',
      minutes: 30,
      content: {
        objectives: [
          'Define inductive reactance and compute it at a given frequency.',
          'Explain why an inductor opposes rapid current changes and passes DC freely.',
          'Explain the 90° phase relationship between voltage and current in an ideal inductor.',
          'Contrast inductive and capacitive reactance\'s frequency dependence.',
        ],
        introduction: `An inductor is capacitive reactance's mirror image: where a capacitor opposes LOW-frequency current, an inductor opposes HIGH-frequency current. This lesson derives inductive reactance and its opposite-direction frequency dependence, setting up resonance (F3.M2.L4) where the two effects cancel.`,
        lecture: `### Inductive reactance

**X_L = 2πfL**

As frequency f rises, X_L RISES: an inductor opposes current MORE at higher frequency. As f approaches zero (DC), X_L approaches zero: an ideal inductor offers no opposition to steady DC current at all (only its winding's own DC resistance limits current, F5.M4.L2's DCR check).

### Why an inductor behaves this way

An inductor opposes CHANGE in current by generating a back-EMF proportional to the rate of change: v = L(di/dt). A rapidly changing (high-frequency) current induces a large opposing voltage; a slowly changing (low-frequency) current induces little; a constant (DC) current induces none, once established.

### The 90° phase relationship

For an ideal inductor, current LAGS voltage by 90° — the mirror image of the capacitor's relationship. Voltage is largest exactly when current is changing fastest; current is largest when voltage is momentarily zero (at a point where di/dt is largest).

### Capacitor versus inductor: opposite frequency behaviour

| | Low frequency / DC | High frequency |
|---|---|---|
| Capacitor | Blocks (high X_C) | Passes easily (low X_C) |
| Inductor | Passes easily (low X_L) | Blocks (high X_L) |

This opposite behaviour is exactly what makes LC filters work (F3.M2.L4): a capacitor and inductor arranged together can be designed to pass one frequency range while blocking another.

### Why this matters for inverter output stages

An output choke (series inductor) placed after an SPWM bridge presents low reactance to the 50/60 Hz fundamental, letting it pass through largely unimpeded, while presenting high reactance to the much higher switching-frequency content, blocking a significant part of it from reaching the load directly. This single component's frequency-dependent behaviour is doing real, calculable work in shaping the inverter's output waveform, well before the matching filter capacitor (F3.M2.L1) is even considered.`,
        technical: `**Why an inductor's opposition is called "inductive reactance" and not resistance.** Like capacitive reactance, X_L does not dissipate energy in an ideal inductor — it stores energy in a magnetic field and returns it each cycle. Real inductors have winding resistance (DCR) in series, which DOES dissipate energy as heat — this is why F5.M4.L2's inductor test checks DC resistance separately from inductance.

**Inductive reactance in impedance (complex) form.** A full treatment represents inductive reactance as +jωL, the opposite sign convention from capacitive reactance's −j/(ωC) — this sign difference is precisely why capacitive and inductive reactances can cancel each other at a particular frequency (resonance).`,
        diagrams: [{ id: 'rl-curve', caption: 'Inductive reactance rising with frequency (X_L = 2πfL), the mirror image of capacitive reactance\'s falling curve.' }],
        formulas: [{ name: 'Inductive reactance', expr: 'X_L = 2πfL', where: [['X_L', 'inductive reactance', 'Ω'], ['L', 'inductance', 'H']] }],
        examples: [
          {
            title: 'Reactance of an output choke at mains frequency',
            problem: 'Find the reactance of a 1.2 mH inductor at 50 Hz.',
            steps: ['X_L = 2π × 50 × 1.2×10⁻³', '= 2π × 0.06'],
            answer: '≈ 0.377 Ω.',
          },
          {
            title: 'Same inductor at a switching frequency',
            problem: 'Find the reactance of the same 1.2 mH inductor at 20 kHz, and compare with the 50 Hz value.',
            steps: ['X_L = 2π × 20,000 × 1.2×10⁻³', '= 2π × 24'],
            answer: '≈ 150.8 Ω — about 400 times larger than at 50 Hz, the same 400× factor as frequency, confirming the inductor is a much better block for high-frequency content than for mains-frequency current.',
            check: 'Reactance is directly proportional to frequency for an inductor, so the ratio of reactances equals the ratio of frequencies: 20,000/50 = 400. ✓',
          },
        ],
        applications: `This is exactly why the output inductor in an LC filter (F3.M2.L4, Build lab project D) passes the 50/60 Hz fundamental with little opposition while strongly blocking the high-frequency switching content — the direct complement to the filter capacitor's own frequency-dependent behaviour.`,
        mistakes: [
          { mistake: '"An inductor blocks DC the way a capacitor does."', correction: 'The opposite: an ideal inductor offers NO opposition to steady DC current; it is high-frequency AC that an inductor opposes.' },
          { mistake: 'Confusing the frequency dependence direction of X_L and X_C.', correction: 'X_C falls with frequency; X_L rises with frequency — memorise the table, not just one formula.' },
          { mistake: 'Ignoring winding resistance (DCR) when reasoning about a real inductor\'s behaviour at DC.', correction: 'A real inductor still has some resistance at DC (its DCR), even though its ideal reactance is zero there.' },
        ],
        demo: { title: 'Measure an inductor\'s impedance versus frequency', text: 'Sweep the LCR meter\'s test frequency on an inductor case and watch its impedance rise exactly as X_L = 2πfL predicts — the opposite trend from the capacitor.', link: to.instrument('Open the LCR meter', 'lcr') },
        activities: [to.instrument('LCR meter', 'lcr'), to.lib('Power chokes and filter inductors', 'inductor')],
        check: [
          { id: 'k1', type: 'numeric', prompt: 'X_L of a 10 mH inductor at 50 Hz (Ω)?', answer: 3.14, tol: 0.02, unit: 'Ω', explain: 'X_L = 2π×50×0.01 ≈ 3.14 Ω.' },
          { id: 'k2', type: 'mcq', prompt: 'As frequency rises, inductive reactance...', options: ['rises', 'falls', 'stays constant', 'becomes resistive'], answer: 0, explain: 'X_L is directly proportional to frequency.' },
          { id: 'k3', type: 'mcq', prompt: 'In an ideal inductor, current...', options: ['lags voltage by 90°', 'leads voltage by 90°', 'is in phase with voltage', 'is always zero'], answer: 0, explain: 'The mirror image of the capacitor\'s relationship.' },
          { id: 'k4', type: 'mcq', prompt: 'An ideal inductor at steady DC offers...', options: ['no opposition at all (only winding resistance limits current)', 'infinite opposition', 'the same opposition as at high frequency', 'opposition equal to its DC resistance only at high frequency'], answer: 0, explain: 'X_L = 2πfL → 0 as f → 0.' },
        ],
        summary: [
          'Inductive reactance X_L = 2πfL rises as frequency rises and falls to zero at DC.',
          'An inductor opposes current CHANGE (v = L·di/dt); it offers no opposition to steady DC current.',
          'Current lags voltage by 90° in an ideal inductor — the mirror image of the capacitor.',
          'Capacitors and inductors have opposite frequency behaviour, which is exactly what makes LC filters work.',
        ],
        homework: {
          id: 'F3.M2.L2.hw',
          title: 'Inductive reactance practice',
          brief: 'Compute X_L at different frequencies.',
          tasks: [
            { id: 'h1', type: 'numeric', prompt: 'X_L of a 2 mH inductor at 50 Hz (Ω)?', answer: 0.628, tol: 0.02, unit: 'Ω', explain: 'X_L = 2π×50×0.002 ≈ 0.628 Ω.' },
            { id: 'h2', type: 'numeric', prompt: 'X_L of the same inductor at 10 kHz (Ω)?', answer: 125.7, tol: 0.02, unit: 'Ω', explain: 'X_L = 2π×10,000×0.002 ≈ 125.7 Ω.' },
          ],
          written: [{ prompt: 'An output inductor and an output capacitor are placed together after an SPWM bridge, forming an LC filter. Explain, using the opposite frequency behaviour of X_L and X_C, why this combination is more effective at passing the fundamental and blocking the switching frequency than either component alone.', model: 'The inductor has low reactance at the 50/60 Hz fundamental (passing it with little opposition in series) but high reactance at the switching frequency (blocking it in series). The capacitor has the opposite behaviour: high reactance at the fundamental (so it does not shunt it away) but low reactance at the switching frequency (shunting the high-frequency content to the return path). Together, in an LC arrangement, their complementary behaviour reinforces the filtering in both directions far more effectively than using just one component alone.' }],
        },
      },
    },
    {
      id: 'F3.M2.L3',
      title: 'Impedance and phasors',
      minutes: 35,
      content: {
        objectives: [
          'Combine resistance and reactance into impedance magnitude using Z = √(R² + X²).',
          'Use a phasor diagram to represent the phase relationship between resistive and reactive components.',
          'Compute impedance magnitude and phase angle for a simple R-X combination.',
          'Relate impedance to the LCR meter\'s Z-mode readings from F5.M4.L2.',
        ],
        introduction: `A real component is rarely a pure resistance, a pure capacitance or a pure inductance — it is usually some combination. [[impedance|Impedance]] (Z) combines resistance and reactance into one quantity describing the total AC opposition, exactly as the LCR meter's Z mode (F5.M4.L2) already computes for you.`,
        lecture: `### Combining resistance and reactance

Resistance (R) and reactance (X) cannot simply be added arithmetically, because they are 90° out of phase with each other (resistance dissipates energy in phase with current; reactance stores and returns it 90° out of phase). They combine the way the two legs of a right-angled triangle combine into its hypotenuse:

**Z = √(R² + X²)**

where X is the NET reactance — for a circuit with both capacitance and inductance, X = X_L − X_C (they partially or fully cancel, because they have opposite sign/phase effects).

### Phasor diagrams

A **phasor diagram** represents each quantity (voltage, current, or here resistance/reactance) as an arrow (vector) at the correct angle, rather than writing out full sine-wave equations. Resistance is drawn along one axis; reactance is drawn at 90° to it. The resultant impedance is the vector sum — literally the hypotenuse of a right triangle when there is only one reactance type, or the net reactance after X_L and X_C partially cancel.

### Phase angle of the impedance

The phase angle φ between the circuit's overall voltage and current is:

**φ = arctan(X / R)**

A purely resistive circuit has φ = 0° (voltage and current in phase). A purely reactive circuit approaches φ = ±90°. Real circuits with both resistance and reactance sit somewhere in between — this angle is exactly what determines the power factor covered in F3.M3.

### Relating this to the LCR meter

When F5.M4.L2's LCR meter reports Z at a given test frequency, it is computing precisely this: Z = √(X² + R²), using the component's own series resistance (ESR or DCR) as R and its calculated reactance at that frequency as X.`,
        technical: `**The full complex-number treatment.** Impedance is properly written as a complex number Z = R + jX, where j is the imaginary unit. The magnitude |Z| = √(R² + X²) is what this lesson uses; the phase angle arg(Z) = arctan(X/R) is the second piece of information the complex form carries. This programme works with magnitude and phase angle separately rather than full complex-number arithmetic, which is sufficient for the measurement and power-factor applications this course requires.

**Series versus parallel combination.** This lesson covers series R-X combinations, where impedances simply add (as complex numbers, hence the Pythagorean-style magnitude formula). Parallel combinations of reactive and resistive elements combine differently (by reciprocals, as for parallel resistors) — a more advanced topic flagged here but not required at this level.`,
        diagrams: [{ id: 'kirchhoff', caption: 'A phasor diagram showing resistance along one axis and net reactance at 90° to it, with impedance as the resultant vector and φ as its angle.' }],
        formulas: [
          { name: 'Impedance magnitude', expr: 'Z = √(R² + X²)', where: [['Z', 'impedance magnitude', 'Ω'], ['R', 'resistance', 'Ω'], ['X', 'net reactance (X_L − X_C)', 'Ω']] },
          { name: 'Impedance phase angle', expr: 'φ = arctan(X / R)', where: [['φ', 'phase angle between voltage and current', '° or rad']] },
        ],
        examples: [
          {
            title: 'Impedance of a resistor and capacitor in series',
            problem: 'A 100 Ω resistor is in series with a capacitor whose reactance at the operating frequency is 75 Ω. Find the impedance magnitude and phase angle.',
            steps: ['Z = √(100² + 75²) = √(10,000 + 5625) = √15,625', 'φ = arctan(75/100) = arctan(0.75)'],
            answer: 'Z = 125 Ω; φ ≈ 36.9° (current leading voltage, since the reactance is capacitive).',
            check: '100-75-125 is a scaled 4-3-5 right triangle, confirming Z = 125 Ω exactly.',
          },
          {
            title: 'Impedance from an LCR meter Z-mode reading',
            problem: 'An LCR meter reports Z = 3.52 Ω for a 452 µF capacitor at 100 Hz, with a known ESR of 0.04 Ω. Verify this is consistent with X_C = 1/(2πfC) and Z = √(R²+X²).',
            steps: ['X_C = 1/(2π×100×452×10⁻⁶) ≈ 3.52 Ω', 'Z = √(3.52² + 0.04²) = √(12.39 + 0.0016) ≈ 3.52 Ω (the tiny ESR barely changes the result)'],
            answer: 'Consistent: the reported Z essentially equals X_C here, because ESR (0.04 Ω) is negligible compared with the reactance (3.52 Ω) at this frequency.',
          },
        ],
        applications: `This is the exact calculation behind every "Z (impedance)" reading the LCR meter instrument in this lab produces for a capacitor or inductor case, at whatever test frequency you choose.`,
        mistakes: [
          { mistake: 'Adding resistance and reactance arithmetically (R + X).', correction: 'They are 90° out of phase; combine them as Z = √(R² + X²), not a simple sum.' },
          { mistake: 'Forgetting that X_L and X_C have opposite sign and can cancel.', correction: 'Net reactance X = X_L − X_C; when both are present, they partially or fully offset each other (resonance, F3.M2.L4).' },
          { mistake: 'Assuming impedance is purely a resistance concept.', correction: 'Impedance generalises resistance to include frequency-dependent, phase-shifting reactance; at DC (or for a purely resistive circuit), Z reduces to R.' },
        ],
        demo: { title: 'See Z computed from X and R', text: 'The LCR meter\'s Z mode on this lab\'s cases computes exactly Z = √(X² + R²) at your chosen test frequency.', link: to.instrument('Open the LCR meter', 'lcr') },
        activities: [to.instrument('LCR meter', 'lcr'), to.sim('Impedance experiment', 'sim-04')],
        check: [
          { id: 'k1', type: 'numeric', prompt: 'Z for R = 30 Ω and X = 40 Ω in series (Ω)?', answer: 50, tol: 0.01, unit: 'Ω', explain: '√(900+1600) = √2500 = 50 Ω (3-4-5 triangle).' },
          { id: 'k2', type: 'mcq', prompt: 'A purely resistive circuit has a phase angle φ of...', options: ['0°', '90°', '45°', '180°'], answer: 0, explain: 'Voltage and current are in phase.' },
          { id: 'k3', type: 'mcq', prompt: 'Net reactance in a circuit with both inductance and capacitance is...', options: ['X_L − X_C', 'X_L + X_C', 'always zero', 'the larger of the two only'], answer: 0, explain: 'The two reactances have opposite sign/phase and partially cancel.' },
          { id: 'k4', type: 'numeric', prompt: 'φ for R = 10 Ω, X = 10 Ω (°, to 1 decimal)?', answer: 45, tol: 0.02, unit: '°', explain: 'arctan(10/10) = arctan(1) = 45°.' },
        ],
        summary: [
          'Impedance combines resistance and reactance: Z = √(R² + X²), because they are 90° out of phase.',
          'A phasor diagram represents resistance and reactance as perpendicular vectors, with impedance as the resultant.',
          'Net reactance X = X_L − X_C when both inductance and capacitance are present; they partially cancel.',
          'The phase angle φ = arctan(X/R) between voltage and current is exactly what determines power factor (F3.M3).',
        ],
        homework: {
          id: 'F3.M2.L3.hw',
          title: 'Impedance calculations',
          brief: 'Combine R and X into Z and φ.',
          tasks: [
            { id: 'h1', type: 'numeric', prompt: 'Z for R = 6 Ω and X = 8 Ω (Ω)?', answer: 10, tol: 0.01, unit: 'Ω', explain: '√(36+64)=√100=10 Ω (3-4-5 scaled).' },
            { id: 'h2', type: 'numeric', prompt: 'φ for R = 6 Ω, X = 8 Ω (°, to 1 decimal)?', answer: 53.1, tol: 0.02, unit: '°', explain: 'arctan(8/6) ≈ 53.1°.' },
          ],
          written: [{ prompt: 'A circuit has a 20 Ω resistor, a reactor with X_L = 50 Ω and a capacitor with X_C = 50 Ω, all in series. Find the net reactance and the overall impedance, and explain what has physically happened.', model: 'Net reactance X = X_L − X_C = 50 − 50 = 0 Ω. With no net reactance, the impedance reduces to Z = √(R² + 0²) = R = 20 Ω — the circuit behaves as if it were purely resistive at this frequency, because the inductive and capacitive reactances exactly cancel. This is the condition of resonance, covered in the next lesson.' }],
        },
      },
    },
    {
      id: 'F3.M2.L4',
      title: 'Resonance and filters',
      minutes: 30,
      content: {
        objectives: [
          'Explain what happens at a circuit\'s resonant frequency.',
          'Compute the resonant frequency of a series LC combination.',
          'Explain qualitatively how an LC low-pass filter attenuates frequencies above its cutoff.',
          'Relate resonance and filtering to the inverter output filter and THD (F5.M3.L3).',
        ],
        introduction: `At one specific frequency, an inductor's and a capacitor's reactances exactly cancel — this is [[resonance|resonance]], and it is the underlying reason an LC filter can be DESIGNED to pass one frequency range and block another, exactly the filter behind a pure-sine inverter's clean output.`,
        lecture: `### The resonant frequency

For a series L and C, net reactance X = X_L − X_C is zero when X_L = X_C:

2πf₀L = 1/(2πf₀C) → **f₀ = 1 / (2π√(LC))**

At this frequency f₀, the two reactances cancel exactly, leaving only resistance to oppose current — in a series circuit with very low resistance, this can allow a surprisingly LARGE current to flow for a given applied voltage (resonant rise), which matters both as a design opportunity and a risk (unwanted resonance in a real circuit can cause unexpectedly large voltages or currents).

### LC filters: deliberately shaping frequency response

An inverter's output LC filter is a deliberate application of L and C's opposite frequency behaviour (F3.M2.L1–L2), designed so that:

- Below the filter's cutoff frequency (set well above the fundamental, well below the switching/carrier frequency): the inductor's low reactance and the capacitor's high reactance let the fundamental pass through largely unaffected.
- Above the cutoff: the inductor's high reactance and the capacitor's low reactance combine to strongly attenuate the switching-frequency content.

This is precisely the mechanism behind F5.M3.L3's statement that "an output LC filter reduces THD by attenuating frequencies above the fundamental" — now derived from first principles rather than simply stated.

### Choosing where to place the cutoff

A filter's cutoff frequency is chosen well above the fundamental (so the fundamental is barely attenuated) and well below the switching frequency (so the switching content is strongly attenuated) — typically by at least a factor of 10 in each direction where practical, giving the filter margin to work effectively without needing impractically large components.`,
        technical: `**Resonance as a risk, not only a tool.** An LC combination's resonant frequency can sometimes coincide, unintentionally, with a harmonic of the switching frequency or another signal already present in a circuit, causing unexpectedly large voltages or currents at that frequency ("ringing"). Filter design deliberately chooses component values so that no unwanted resonance falls near a frequency the circuit actually produces.

**Quality factor (Q).** A resonant circuit's "sharpness" (how narrow the frequency range of large response is) is described by its quality factor, set by the ratio of reactance to resistance at resonance — a higher Q circuit is more selective but also raises the resonant current/voltage more sharply. This programme does not require Q calculations, but recognising that resonant behaviour can be sharper or gentler depending on resistance is useful context.`,
        diagrams: [{ id: 'lc-filter', caption: 'An LC low-pass filter\'s frequency response: the fundamental passes with little attenuation, while the switching-frequency content is strongly attenuated above the cutoff.' }],
        formulas: [{ name: 'Series resonant frequency', expr: 'f₀ = 1 / (2π√(LC))', where: [['f₀', 'resonant frequency', 'Hz'], ['L', 'inductance', 'H'], ['C', 'capacitance', 'F']] }],
        examples: [
          {
            title: 'Resonant frequency of an output filter',
            problem: 'An inverter\'s output filter uses a 1.2 mH inductor and a 10 µF capacitor. Find its resonant (cutoff) frequency.',
            steps: ['f₀ = 1 / (2π√(LC)) = 1 / (2π√(1.2×10⁻³ × 10×10⁻⁶))', '= 1 / (2π√(1.2×10⁻⁸)) = 1 / (2π × 1.095×10⁻⁴)'],
            answer: '≈ 1453 Hz.',
            check: 'This sits comfortably above a 50 Hz fundamental (by about 29×) and well below a 20 kHz switching frequency (by about 14×), a sensible filter placement.',
          },
          {
            title: 'Checking filter placement against fundamental and switching frequency',
            problem: 'For the filter in the previous example (f₀ ≈ 1453 Hz), is it well placed between a 50 Hz fundamental and a 20 kHz switching frequency?',
            steps: ['Ratio to fundamental: 1453/50 ≈ 29×, comfortably above 10×', 'Ratio to switching frequency: 20,000/1453 ≈ 13.8×, comfortably above 10×'],
            answer: 'Yes — the cutoff sits well clear of both the fundamental and the switching frequency by more than a factor of 10 each way, giving the filter margin to work effectively.',
          },
        ],
        applications: `This is the exact calculation behind Project D (pure sine-wave inverter) in the Build Your Own Inverter laboratory: choosing L and C values that place the filter's cutoff well above the fundamental and well below the switching frequency.`,
        mistakes: [
          { mistake: 'Placing a filter\'s cutoff too close to the fundamental frequency.', correction: 'This attenuates the fundamental itself, reducing output voltage and distorting the waveform; keep the cutoff well above the fundamental.' },
          { mistake: 'Placing a filter\'s cutoff too close to the switching frequency.', correction: 'This fails to adequately attenuate switching content, leaving significant high-frequency ripple on the output.' },
          { mistake: 'Assuming resonance is always a problem to avoid.', correction: 'Resonance is deliberately exploited in filter design (and other applications); it only becomes a problem when it occurs unintentionally at an unwanted frequency.' },
        ],
        demo: { title: 'Compare filtered and unfiltered output', text: 'View unfiltered SPWM and filtered pure-sine output side by side on the oscilloscope to see the LC filter\'s effect directly.', link: to.instrument('Open the oscilloscope', 'scope') },
        activities: [to.instrument('Oscilloscope', 'scope'), to.build('Project D: pure sine-wave inverter (SPWM + LC filter)', 'bld-d')],
        check: [
          { id: 'k1', type: 'mcq', prompt: 'At the resonant frequency of a series LC circuit, net reactance is...', options: ['zero (X_L and X_C cancel)', 'at its maximum', 'always infinite', 'equal to resistance always'], answer: 0, explain: 'X_L = X_C at resonance, so X_L − X_C = 0.' },
          { id: 'k2', type: 'numeric', prompt: 'Resonant frequency of a 2 mH, 50 µF LC combination (Hz, to the nearest whole number)?', answer: 503, tol: 0.03, unit: 'Hz', explain: 'f₀ = 1/(2π√(2e-3×50e-6)) ≈ 503 Hz.' },
          { id: 'k3', type: 'mcq', prompt: 'An inverter output LC filter\'s cutoff should sit...', options: ['well above the fundamental and well below the switching frequency', 'exactly at the fundamental', 'exactly at the switching frequency', 'below the fundamental'], answer: 0, explain: 'This passes the fundamental and blocks the switching content.' },
          { id: 'k4', type: 'mcq', prompt: 'Unwanted resonance in a real circuit can cause...', options: ['unexpectedly large voltages or currents at that frequency', 'no effect at all', 'only a change in colour of the output', 'lower switching losses automatically'], answer: 0, explain: 'A low-resistance resonant path can allow surprisingly large current or voltage.' },
        ],
        summary: [
          'Resonance occurs when X_L = X_C, cancelling net reactance to zero at the resonant frequency f₀ = 1/(2π√(LC)).',
          'An LC low-pass filter deliberately exploits L and C\'s opposite frequency behaviour to pass low frequencies and block high ones.',
          'A well-placed filter cutoff sits well above the fundamental and well below the switching frequency, typically by a factor of 10 or more each way.',
          'This is the mechanism behind the output filter\'s THD reduction in a pure-sine inverter (F5.M3.L3, Build lab project D).',
        ],
        homework: {
          id: 'F3.M2.L4.hw',
          title: 'Resonance and filter placement',
          brief: 'Compute resonant frequency and check filter placement.',
          tasks: [
            { id: 'h1', type: 'numeric', prompt: 'Resonant frequency of a 0.5 mH, 20 µF LC combination (Hz, to the nearest whole number)?', answer: 1592, tol: 0.03, unit: 'Hz', explain: 'f₀ = 1/(2π√(0.5e-3×20e-6)) ≈ 1592 Hz.' },
          ],
          written: [{ prompt: 'A designer chooses an output filter with a cutoff frequency of 400 Hz for an inverter with a 50 Hz fundamental and a 20 kHz switching frequency. Evaluate this choice using the margin guideline in this lesson, and suggest an improvement if needed.', model: 'The ratio to the fundamental is 400/50 = 8×, which is below the suggested margin of at least 10×, so the fundamental may be noticeably attenuated, reducing output voltage and adding distortion. The ratio to the switching frequency (20,000/400 = 50×) is comfortably large. The designer should raise the cutoff frequency (by reducing L and/or C) to at least about 500 Hz to restore a 10× margin above the fundamental while still staying well below the switching frequency.' }],
        },
      },
    },
  ],
  quiz: {
    pass: 0.8,
    questions: [
      { id: 'q1', type: 'numeric', prompt: 'X_C of a 50 µF capacitor at 50 Hz (Ω)?', answer: 63.66, tol: 0.02, unit: 'Ω', explain: 'X_C = 1/(2π×50×50e-6) ≈ 63.66 Ω.' },
      { id: 'q2', type: 'mcq', prompt: 'As frequency rises, inductive reactance...', options: ['rises', 'falls', 'stays constant', 'becomes resistive'], answer: 0, explain: 'X_L = 2πfL.' },
      { id: 'q3', type: 'numeric', prompt: 'Z for R = 9 Ω, X = 12 Ω (Ω)?', answer: 15, tol: 0.01, unit: 'Ω', explain: '√(81+144)=√225=15 Ω (3-4-5 scaled).' },
      { id: 'q4', type: 'mcq', prompt: 'At resonance, net reactance is...', options: ['zero', 'maximum', 'infinite', 'equal to R always'], answer: 0, explain: 'X_L = X_C at resonance.' },
      { id: 'q5', type: 'mcq', prompt: 'An inverter output LC filter\'s cutoff should sit...', options: ['well above the fundamental, well below the switching frequency', 'exactly at the fundamental', 'exactly at the switching frequency', 'at zero Hz'], answer: 0, explain: 'This passes the fundamental and blocks the switching content.' },
      { id: 'q6', type: 'mcq', prompt: 'In an ideal capacitor, current...', options: ['leads voltage by 90°', 'lags voltage by 90°', 'is in phase with voltage', 'is always zero'], answer: 0, explain: 'Current is largest when voltage changes fastest.' },
    ],
  },
  practicals: [],
}
