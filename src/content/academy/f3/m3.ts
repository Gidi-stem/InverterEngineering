import type { AcademyModule } from '../types'
import { to } from '../s1/links'

/** F3.M3 AC power. */
export const F3_M3: AcademyModule = {
  id: 'F3.M3',
  title: 'AC power',
  summary: 'Real, reactive and apparent power; power factor and why current can lag voltage; harmonics and THD as a power-quality concern; and what "energy returned" by a reactive load actually means.',
  lessons: [
    {
      id: 'F3.M3.L1',
      title: 'Real, reactive and apparent power',
      minutes: 30,
      content: {
        objectives: [
          'Define real, reactive and apparent power and their units.',
          'Compute apparent power from RMS voltage and current.',
          'Explain why a load\'s VA rating can differ from its W rating.',
          'Relate real, reactive and apparent power in the power triangle.',
        ],
        introduction: `An inverter's rating in VA and its rating in W are not always the same number, and the difference is not a manufacturing quirk — it is real electrical engineering, and this lesson explains exactly what each quantity means.`,
        lecture: `### Three kinds of AC power

- **Apparent power (S)**, in volt-amperes (VA): S = V_rms × I_rms. This is simply the product of RMS voltage and RMS current, with no regard for phase — it is what you get by multiplying the two numbers on a meter's display.
- **Real power (P)**, in watts (W): the power actually converted to useful work or heat. P = V_rms × I_rms × cos(φ), where φ is the phase angle between voltage and current (F3.M2.L3).
- **Reactive power (Q)**, in volt-amperes reactive (VAR): power that oscillates back and forth into and out of reactive components (capacitors, inductors) without being consumed. Q = V_rms × I_rms × sin(φ).

### Why they differ

For a PURELY resistive load, voltage and current are in phase (φ = 0°), so cos(φ) = 1 and real power equals apparent power exactly: P = S, Q = 0. For a load with significant reactance (a motor, a transformer, many electronic power supplies), φ ≠ 0°, so P < S: the circuit draws more apparent power (current) than the real power it actually uses would suggest.

### The power triangle

S, P and Q relate as the three sides of a right triangle: **S² = P² + Q²**. This is the same Pythagorean relationship as impedance's Z² = R² + X² (F3.M2.L3) — not a coincidence, since power scales from the same voltage, current and phase-angle relationships.

### Why an inverter's VA rating can exceed its W rating

An inverter must be sized to handle the APPARENT power (current) a reactive load draws, even though only the real power is "useful" — this is exactly why inverter and generator nameplates often state BOTH a W and a VA rating, and why a reactive load (such as a motor) can draw its full rated VA from the inverter while delivering less real power than that VA figure might suggest.`,
        technical: `**Why reactive power still matters even though it does "no work".** Reactive power still requires current to flow, and current causes real I²R losses in the supply conductors, transformer windings and the inverter's own switching devices — so a load with poor power factor (high reactive power relative to real power) still costs real losses and capacity, even though the reactive power itself is not "consumed" by the load.

**Sign of reactive power.** By convention, an inductive load is said to draw (positive) reactive power, while a capacitive load is said to supply (negative) reactive power — this sign convention explains why capacitors are sometimes deliberately added to a system (power factor correction, briefly mentioned in F3.M3.L2) to offset an inductive load's reactive power demand.`,
        diagrams: [{ id: 'kirchhoff', caption: 'The power triangle: apparent power S as the hypotenuse, with real power P and reactive power Q as its two perpendicular components.' }],
        formulas: [
          { name: 'Apparent power', expr: 'S = V_rms · I_rms', where: [['S', 'apparent power', 'VA']] },
          { name: 'Real power', expr: 'P = V_rms · I_rms · cos(φ)', where: [['P', 'real power', 'W'], ['φ', 'phase angle between voltage and current', '°']] },
          { name: 'Reactive power', expr: 'Q = V_rms · I_rms · sin(φ)', where: [['Q', 'reactive power', 'VAR']] },
          { name: 'Power triangle', expr: 'S² = P² + Q²', where: [] },
        ],
        examples: [
          {
            title: 'Apparent power of an inverter output',
            problem: 'An inverter supplies 230 V rms at 8.7 A rms. What is the apparent power?',
            steps: ['S = V_rms × I_rms', '= 230 × 8.7'],
            answer: '2001 VA ≈ 2 kVA.',
          },
          {
            title: 'Real power with a 36.9° phase angle',
            problem: 'For the same 2001 VA load, the current lags voltage by 36.9° (cos 36.9° ≈ 0.8). Find the real and reactive power.',
            steps: ['P = S × cos(φ) = 2001 × 0.8', 'Q = S × sin(φ) = 2001 × 0.6 (sin 36.9° ≈ 0.6)'],
            answer: 'P ≈ 1601 W; Q ≈ 1201 VAR.',
            check: 'S² should equal P² + Q²: 2001² ≈ 1601² + 1201² (4,004,001 ≈ 2,563,201 + 1,442,401 = 4,005,602, consistent within rounding).',
          },
        ],
        applications: `This is precisely why installers must check BOTH the W and VA rating of an inverter against a load list when sizing a system (S2's load-profile and system-design modules): a motor-heavy load list can demand far more VA than its headline wattage would suggest.`,
        mistakes: [
          { mistake: 'Treating VA and W as interchangeable.', correction: 'They are equal only for a purely resistive load (φ = 0°); for a reactive load, VA (apparent power) exceeds W (real power).' },
          { mistake: 'Ignoring reactive power because "it does no work".', correction: 'Reactive power still drives real current, causing real I²R losses and consuming supply/inverter capacity.' },
          { mistake: 'Adding P, Q and S arithmetically.', correction: 'They combine as the sides of a right triangle: S² = P² + Q², not a simple sum.' },
        ],
        demo: { title: 'Measure real inverter output quantities', text: 'The oscilloscope\'s RMS measurement and a clamp-meter current reading together give you everything needed to compute S; F3.M3.L2 adds the phase angle for P and Q.', link: to.instrument('Open the oscilloscope', 'scope') },
        activities: [to.instrument('Oscilloscope', 'scope'), to.instrument('Clamp meter', 'clamp'), to.fun('Fundamentals: real, reactive and apparent power (fun-06)', 'fun-06')],
        check: [
          { id: 'k1', type: 'numeric', prompt: 'Apparent power of 120 V rms at 15 A rms (VA)?', answer: 1800, tol: 0.01, unit: 'VA', explain: 'S = 120×15 = 1800 VA.' },
          { id: 'k2', type: 'mcq', prompt: 'For a purely resistive load, real power and apparent power are...', options: ['equal', 'always different', 'related by a fixed 2:1 ratio', 'unrelated'], answer: 0, explain: 'φ = 0° gives cos(φ) = 1, so P = S.' },
          { id: 'k3', type: 'mcq', prompt: 'S, P and Q relate as...', options: ['S² = P² + Q²', 'S = P + Q', 'S = P − Q', 'P = Q always'], answer: 0, explain: 'The power triangle is a right-triangle relationship.' },
          { id: 'k4', type: 'mcq', prompt: 'Why does reactive power still matter even though it does no useful work?', options: ['It still drives real current, causing real I²R losses and consuming supply/inverter capacity', 'It is purely theoretical and has no real effect', 'It only matters for DC systems', 'It cancels real power automatically'], answer: 0, explain: 'Reactive current is still real current flowing through real resistances.' },
        ],
        summary: [
          'Apparent power S = V_rms×I_rms (VA); real power P = S×cos(φ) (W); reactive power Q = S×sin(φ) (VAR).',
          'For a purely resistive load, P = S; for a reactive load, P < S.',
          'S, P and Q combine as a right triangle: S² = P² + Q².',
          'An inverter must be sized for apparent power (VA), because reactive current still flows and causes real losses, even though it does no useful work.',
        ],
        homework: {
          id: 'F3.M3.L1.hw',
          title: 'Power triangle practice',
          brief: 'Compute S, P and Q.',
          tasks: [
            { id: 'h1', type: 'numeric', prompt: 'Apparent power of 48 V rms at 20 A rms (VA)?', answer: 960, tol: 0.01, unit: 'VA', explain: 'S = 48×20 = 960 VA.' },
            { id: 'h2', type: 'numeric', prompt: 'Real power for S = 960 VA at cos(φ) = 0.9 (W)?', answer: 864, tol: 0.01, unit: 'W', explain: 'P = 960×0.9 = 864 W.' },
          ],
          written: [{ prompt: 'An inverter is rated 3000 VA / 2400 W. Explain, using the concepts in this lesson, what this pair of ratings tells an installer about the loads it can safely supply.', model: 'The 2400 W figure is the maximum REAL power the inverter can deliver as useful output; the 3000 VA figure is the maximum APPARENT power (current at rated voltage) it can supply regardless of load phase angle. This implies a minimum acceptable power factor of 2400/3000 = 0.8: if the connected loads have a lower power factor than this (more reactive relative to real power), their apparent-power (current) demand will exceed what the inverter can supply even though their real-power demand looks acceptable, and the inverter\'s current limit (not its wattage limit) becomes the binding constraint.' }],
        },
      },
    },
    {
      id: 'F3.M3.L2',
      title: 'Power factor and current lag',
      minutes: 30,
      content: {
        objectives: [
          'Define power factor and compute it from real and apparent power or from the phase angle.',
          'Explain why an inductive load causes current to lag voltage, and what this means practically.',
          'State the practical consequences of a low power factor for conductor sizing and losses.',
          'Explain, qualitatively, the idea of power factor correction.',
        ],
        introduction: `[[power-factor|Power factor]] packages the phase relationship between voltage and current — and therefore the gap between real and apparent power — into a single number between 0 and 1, the one figure most generator, inverter and utility documentation actually quotes.`,
        lecture: `### Power factor defined

**Power factor (PF) = P / S = cos(φ)**

A PF of 1.0 (unity) means the load is purely resistive: all the apparent power delivered becomes real, useful power. A PF below 1.0 means some of the apparent power is "wasted" as reactive power that still draws current but delivers no useful work. Most inductive loads (motors, transformers, many fluorescent and some switching power supplies) have a PF noticeably below 1.0, typically 0.6–0.9 depending on the device and its loading.

### Lagging versus leading power factor

- **Lagging power factor**: current lags voltage, caused by net INDUCTIVE reactance (F3.M2.L2) — the most common case for motors and transformers.
- **Leading power factor**: current leads voltage, caused by net CAPACITIVE reactance (F3.M2.L1) — less common as a natural load characteristic, but deliberately used in power factor correction.

### Practical consequences of low power factor

A load with a given real-power (W) demand but a low power factor draws MORE current than the same real power at unity power factor would require (because I = P/(V×PF), and a smaller PF means a larger required current for the same P). This larger current means:

- Larger conductors are needed to carry it without excessive voltage drop or overheating.
- Greater I²R losses in those conductors and in the inverter's own output stage.
- The inverter itself may hit its CURRENT (VA) limit before its WATTAGE limit, exactly as explored in F3.M3.L1's worked example.

### Power factor correction

Because inductive and capacitive reactances have opposite effects (F3.M2.L2), adding a correctly sized CAPACITOR in parallel with an inductive load can supply some or all of the reactive power the inductive load demands LOCALLY, reducing the reactive current the supply itself must carry — this is power factor correction, widely used in industrial installations with large motor loads. This programme introduces the concept; detailed correction-capacitor sizing is beyond its scope.`,
        technical: `**Displacement power factor versus true power factor.** The PF = cos(φ) relationship above is strictly correct only for a purely sinusoidal current displaced in phase from a sinusoidal voltage ("displacement power factor"). A non-sinusoidal (harmonic-rich) current, as drawn by many switching power supplies, has a TRUE power factor that also accounts for harmonic content, and can be lower than the displacement power factor alone would suggest — this links directly to F3.M3.L3's treatment of harmonics.

**Why utilities sometimes penalise low power factor.** A utility must still size its own generation, transmission and distribution equipment for the APPARENT power a customer's load draws, even though it bills primarily for real energy (kWh) — this mismatch is why some commercial/industrial tariffs include a power-factor penalty or a demand charge related to apparent power.`,
        diagrams: [{ id: 'kirchhoff', caption: 'Lagging current (inductive load) versus leading current (capacitive load), shown as a phase shift relative to voltage.' }],
        formulas: [{ name: 'Power factor', expr: 'PF = P / S = cos(φ)', where: [['PF', 'power factor', 'dimensionless, 0–1']] }, { name: 'Current for a given real power and power factor', expr: 'I_rms = P / (V_rms · PF)', where: [['I_rms', 'required RMS current', 'A']] }],
        examples: [
          {
            title: 'Power factor from real and apparent power',
            problem: 'A load draws 1600 W real power and 2000 VA apparent power. Find its power factor.',
            steps: ['PF = P/S', '= 1600/2000'],
            answer: 'PF = 0.8 (lagging, if the load is inductive, which it almost always is for a motor).',
          },
          {
            title: 'Extra current from poor power factor',
            problem: 'A 230 V supply must deliver 2000 W of real power to (a) a PF = 1.0 load and (b) a PF = 0.7 load. Compare the required current.',
            steps: ['(a) I = P/(V×PF) = 2000/(230×1.0) = 8.70 A', '(b) I = 2000/(230×0.7) = 12.42 A'],
            answer: 'The PF = 0.7 load requires about 43% more current for the SAME real power delivered — current the conductors and inverter must still carry.',
            check: '12.42/8.70 ≈ 1.43, matching 1/0.7 ≈ 1.43, confirming current scales inversely with power factor for fixed real power.',
          },
        ],
        applications: `This is exactly why a system designer checks a load list's power factor, not just its wattage, when sizing an inverter and its conductors (S2's system-design module) — a motor-heavy load list at PF 0.7–0.8 needs meaningfully more current capacity than its wattage alone implies.`,
        mistakes: [
          { mistake: 'Sizing conductors and inverters from real power (W) alone.', correction: 'Size from the required current, which depends on power factor: I = P/(V×PF) — a lower PF needs more current for the same real power.' },
          { mistake: 'Assuming all loads have a power factor close to 1.0.', correction: 'Motors, transformers and many switching supplies commonly sit at PF 0.6–0.9; check the specific load.' },
          { mistake: 'Confusing lagging and leading power factor.', correction: 'Lagging = inductive load, current behind voltage. Leading = capacitive load, current ahead of voltage.' },
        ],
        demo: { title: 'Relate phase angle to power factor', text: 'The LCR meter\'s impedance readings (F3.M2.L3) give you R and X, from which φ = arctan(X/R) and PF = cos(φ) follow directly.', link: to.instrument('Open the LCR meter', 'lcr') },
        activities: [to.instrument('LCR meter', 'lcr'), to.solar('Load profile and system design', 'design')],
        check: [
          { id: 'k1', type: 'numeric', prompt: 'Power factor for P = 900 W, S = 1000 VA?', answer: 0.9, tol: 0.01, unit: '', explain: 'PF = 900/1000 = 0.9.' },
          { id: 'k2', type: 'mcq', prompt: 'A lagging power factor is caused by...', options: ['net inductive reactance', 'net capacitive reactance', 'purely resistive loads only', 'a fault condition'], answer: 0, explain: 'Inductive loads make current lag voltage.' },
          { id: 'k3', type: 'mcq', prompt: 'A lower power factor, for the same real power, requires...', options: ['more current', 'less current', 'the same current', 'no current'], answer: 0, explain: 'I = P/(V×PF): a smaller PF increases required current.' },
          { id: 'k4', type: 'mcq', prompt: 'Power factor correction typically adds...', options: ['a capacitor in parallel with an inductive load', 'a resistor in series', 'an inductor in parallel with a capacitive load', 'nothing; it is a software setting only'], answer: 0, explain: 'A parallel capacitor supplies reactive power locally, reducing what the supply must carry.' },
        ],
        summary: [
          'Power factor PF = P/S = cos(φ), between 0 and 1; unity PF means a purely resistive load.',
          'Lagging PF (current behind voltage) comes from inductive loads; leading PF comes from capacitive loads.',
          'A lower power factor requires more current for the same real power, increasing conductor and inverter current demand.',
          'Power factor correction adds capacitance in parallel with an inductive load to reduce the reactive current the supply must carry.',
        ],
        homework: {
          id: 'F3.M3.L2.hw',
          title: 'Power factor practice',
          brief: 'Compute power factor and required current.',
          tasks: [
            { id: 'h1', type: 'numeric', prompt: 'Power factor for P = 1200 W, S = 1500 VA?', answer: 0.8, tol: 0.01, unit: '', explain: 'PF = 1200/1500 = 0.8.' },
            { id: 'h2', type: 'numeric', prompt: 'Current for P = 1200 W at 230 V, PF = 0.8 (A)?', answer: 6.52, tol: 0.02, unit: 'A', explain: 'I = 1200/(230×0.8) ≈ 6.52 A.' },
          ],
          written: [{ prompt: 'A customer complains that their inverter "trips on overcurrent" when running a motor rated only 1000 W, well under the inverter\'s 1500 W rating. Using power factor, explain a plausible cause.', model: 'The motor\'s real power (1000 W) may be well under the inverter\'s wattage rating, but motors typically have a power factor well below 1.0 (often 0.6–0.8). At a low power factor, the REQUIRED CURRENT for that real power is higher than it would be at unity power factor (I = P/(V×PF)), and the inverter\'s current (VA) limit — not its wattage limit — may be exceeded even though the real-power demand looks comfortably within rating. This matches F3.M3.L1\'s point that an inverter\'s VA rating, not just its W rating, must be checked against a reactive load.' }],
        },
      },
    },
    {
      id: 'F3.M3.L3',
      title: 'Harmonics and THD',
      minutes: 25,
      content: {
        objectives: [
          'Explain how harmonic current distorts real power calculations beyond simple displacement power factor.',
          'Relate a load\'s harmonic current content to additional heating in supply conductors and transformers.',
          'Explain why some loads specify a maximum acceptable supply THD.',
        ],
        introduction: `F5.M3.L3 introduced THD as a property of an inverter's OUTPUT voltage waveform. This lesson looks at the other side: harmonic CURRENT drawn by non-linear loads (many electronic power supplies, variable-speed drives, LED drivers) and what it costs in real power terms, tying harmonics directly into this module's power calculations.`,
        lecture: `### Harmonic current from non-linear loads

Many modern loads (switch-mode power supplies, LED drivers, variable-frequency drives) do not draw a smooth sinusoidal current even from a perfectly sinusoidal voltage supply — they draw current in short pulses, rich in harmonics, because of their internal rectification and switching stages. This is DIFFERENT from the displacement power factor of F3.M3.L2 (a phase shift of a sinusoidal current); harmonic current distorts the CURRENT'S SHAPE itself.

### Extra heating from harmonic current

Harmonic currents still flow through supply conductors, transformers and protective devices, contributing to I²R heating exactly as the fundamental current does — even though, like reactive current, they may not represent useful delivered power at the fundamental frequency. A conductor or transformer carrying significant harmonic current can overheat even while its TOTAL RMS current appears within rating, because some standard ratings assume a largely sinusoidal current.

### True power factor with harmonics

With harmonic content present, "true power factor" (as distinct from the simpler displacement power factor of F3.M3.L2) accounts for both the phase displacement AND the harmonic distortion of the current — a load can have good displacement power factor (little phase shift) but still poor true power factor because of harmonic content.

### Why some loads specify a maximum supply THD

A small minority of sensitive loads (certain medical, audio, or precision measurement equipment) specify a maximum acceptable THD on their SUPPLY voltage, because harmonic voltage distortion can interact with their own internal circuitry in ways that degrade performance — this is the same THD concept from F5.M3.L3, now viewed as a supply-quality requirement a load can impose, rather than only a property an inverter's output might have.`,
        technical: `**THD on current versus THD on voltage.** F5.M3.L3 discussed output voltage THD (an inverter's own waveform quality). This lesson's harmonic CURRENT is a property of what a LOAD draws from an otherwise clean sinusoidal supply — a different, though related, phenomenon. Both are summarised by the same mathematical THD formula applied to the relevant quantity (voltage or current).

**Triplen harmonics and neutral current.** In three-phase systems (briefly noted here, beyond this course's depth), certain harmonics (odd multiples of 3: the 3rd, 9th, 15th...) can add rather than cancel in the neutral conductor, a specific concern for sizing neutral conductors on harmonic-rich loads — flagged for awareness, not required for calculation at this level.`,
        diagrams: [{ id: 'spwm', caption: 'A non-sinusoidal load current pulse train drawn from a sinusoidal voltage supply, and its harmonic spectrum.' }],
        formulas: [{ name: 'Total harmonic distortion (recap, F5.M3.L3)', expr: 'THD = √(I₂² + I₃² + …) / I₁', where: [['I₁', 'fundamental RMS current', 'A'], ['Iₙ', 'n-th harmonic RMS current', 'A']], note: 'Applied here to load current rather than inverter output voltage.' }],
        examples: [
          {
            title: 'Harmonic current heating a conductor beyond its apparent rating',
            problem: 'A conductor rated 20 A (at a standard, largely sinusoidal current assumption) carries a total RMS current of 18 A, but a third of that RMS total is harmonic content well above the fundamental. Why might this still be a problem despite being "within rating"?',
            steps: ['The conductor\'s 20 A rating assumes a largely sinusoidal current profile typical of resistive/linear loads', 'Significant harmonic content changes how that current distributes and heats the conductor (and nearby equipment such as transformers) differently than the rating\'s assumption'],
            answer: 'A conductor or transformer carrying significant harmonic content can run hotter than its nominal RMS rating alone would predict, because the rating was not derived for a harmonic-rich current profile — this is why harmonic-heavy installations sometimes need derated or specially rated equipment.',
          },
          {
            title: 'Why true power factor can be worse than displacement power factor',
            problem: 'A switch-mode load has almost no phase displacement between the fundamental component of its current and the voltage (displacement PF ≈ 0.99) but draws a strongly non-sinusoidal (harmonic-rich) current. Explain why its TRUE power factor can still be noticeably below 0.99.',
            steps: ['Displacement power factor only accounts for phase shift of the fundamental', 'True power factor also accounts for the extra RMS current from harmonics, which increases S (apparent power) without increasing P (real power)'],
            answer: 'The extra harmonic RMS current raises apparent power (S = V×I_total,rms) without delivering any extra real power, lowering true power factor (P/S) even with near-zero fundamental phase displacement.',
          },
        ],
        applications: `This is why some installation standards limit the proportion of non-linear (harmonic-generating) load a circuit may carry, and why larger harmonic-heavy installations sometimes specify harmonic filters or derated transformers — considerations that feed into S2's system design and commissioning content.`,
        mistakes: [
          { mistake: 'Assuming a load\'s current is sinusoidal just because its voltage supply is.', correction: 'Many non-linear loads (switching supplies, LED drivers, VFDs) draw a distorted current from a clean sinusoidal supply.' },
          { mistake: 'Treating displacement power factor as the whole picture.', correction: 'Harmonic-rich loads need true power factor, which also accounts for current distortion, not just phase shift.' },
          { mistake: '"If total RMS current is within rating, there is no heating concern."', correction: 'Significant harmonic content can cause extra heating beyond what a standard RMS-based rating assumes.' },
        ],
        demo: { title: 'Compare clean and distorted current shapes', text: 'View a clean sinusoidal current versus a pulsed, harmonic-rich current shape on the oscilloscope to see the qualitative difference this lesson describes.', link: to.instrument('Open the oscilloscope', 'scope') },
        activities: [to.instrument('Oscilloscope', 'scope'), to.lib('PWM controller', 'pwm-controller'), to.fun('Fundamentals: harmonics, THD and filtering (fun-05)', 'fun-05')],
        check: [
          { id: 'k1', type: 'mcq', prompt: 'Harmonic current is drawn by...', options: ['non-linear loads such as switching power supplies', 'only purely resistive loads', 'only when the supply voltage is distorted', 'never, in modern equipment'], answer: 0, explain: 'Non-linear internal rectification/switching draws a distorted current.' },
          { id: 'k2', type: 'mcq', prompt: 'True power factor differs from displacement power factor by also accounting for...', options: ['harmonic (current shape) distortion', 'supply frequency only', 'temperature', 'the inverter\'s brand'], answer: 0, explain: 'True PF includes both phase displacement and harmonic content.' },
          { id: 'k3', type: 'mcq', prompt: 'A conductor rated for a sinusoidal current, carrying significant harmonic content at the same total RMS value, may...', options: ['run hotter than the rating alone would predict', 'run cooler', 'be completely unaffected', 'only be affected if the frequency is below 50 Hz'], answer: 0, explain: 'Standard RMS ratings often assume a largely sinusoidal profile.' },
        ],
        summary: [
          'Many non-linear loads draw harmonic-rich current even from a clean sinusoidal voltage supply.',
          'Harmonic current still causes real I²R heating in conductors and transformers, without delivering extra useful power.',
          'True power factor accounts for both phase displacement AND harmonic distortion; it can be noticeably worse than displacement power factor alone.',
          'Some sensitive loads specify a maximum supply voltage THD, extending the THD concept from F5.M3.L3 into a supply-quality requirement.',
        ],
        homework: {
          id: 'F3.M3.L3.hw',
          title: 'Harmonic current reasoning',
          brief: 'Reason about harmonic current effects.',
          tasks: [],
          written: [
            { prompt: 'A facility manager says "our total current is within the transformer\'s rated amps, so there is no problem," despite many LED drivers and switching supplies on the circuit. Evaluate this reasoning.', model: 'Total RMS current being within rating does not fully capture the risk: if a significant fraction of that current is harmonic content, the transformer (and conductors) may run hotter than the rating, which was derived assuming a largely sinusoidal current, would predict. The facility manager should also check the installation\'s harmonic content (or true power factor) against the transformer\'s suitability for non-linear loads, not rely on total RMS amps alone.' },
            { prompt: 'Explain, in your own words, why a load can have a displacement power factor close to 1.0 yet still have a poor true power factor.', model: 'Displacement power factor only measures the phase shift between the fundamental components of voltage and current. A load can draw current with almost no phase shift at the fundamental frequency (good displacement PF) while still drawing substantial harmonic current at other frequencies. That harmonic current adds to the total RMS current and therefore to apparent power S, without adding to real power P, which lowers the true power factor P/S even though the displacement component alone looks good.' },
          ],
        },
      },
    },
    {
      id: 'F3.M3.L4',
      title: 'Energy returned by reactive loads',
      minutes: 25,
      content: {
        objectives: [
          'Explain what "energy returned" by a reactive load means physically.',
          'Describe the cyclical energy exchange between a source and a reactive (capacitive or inductive) load.',
          'Explain why this returned energy still requires current-carrying capacity even though it is not consumed.',
        ],
        introduction: `Reactive power (F3.M3.L1) is sometimes described as energy that is "sent out and sent back" each cycle rather than consumed. This closing lesson of the module makes that description concrete: what is actually flowing, and why it still matters for sizing and losses even though none of it is "used up".`,
        lecture: `### The cyclical exchange

A reactive component (capacitor or inductor) stores energy during part of each AC cycle and returns essentially all of it to the source during another part of the same cycle — ideally, with no net energy consumed over a full cycle (an ideal reactance dissipates nothing; F3.M2.L1–L2). This back-and-forth energy flow is what reactive power represents: energy genuinely flowing in the circuit, but with zero net transfer to the load over a complete cycle.

### Why this still requires capacity, even with zero net transfer

Although the NET energy transferred by the reactive component over a full cycle is zero, the INSTANTANEOUS current needed to move that energy back and forth is real, physical current — it must still flow through the same conductors, switches and windings that carry the real-power current, and it still causes real I²R heating in them (F3.M3.L3 makes the same point for harmonic current). This is why reactive power, despite transferring zero net energy to the load, still consumes real current-carrying capacity and still shows up on an apparent-power (VA) rating.

### A helpful (imperfect) analogy

Imagine a cart being pushed back and forth on a frictionless track: over a full cycle, you do zero NET work on the cart (it ends up back where it started, at the same speed), yet your muscles clearly did real, physical effort throughout — this effort is the "capacity" a reactive load demands from the supply, even though its NET energy balance is zero. The analogy breaks down in detail (muscles are not lossless the way an ideal reactance is), but it captures the key idea: real activity and real net transfer are two different things.

### Tying the module together

This completes the picture begun in F3.M3.L1: real power is net energy transferred and consumed; reactive power is energy genuinely exchanged back and forth with zero net transfer, but which still occupies real current-carrying capacity; apparent power is the total current-related "activity" the supply must be sized for, combining both.`,
        technical: `**Instantaneous power can be negative.** For a purely reactive load, instantaneous power p(t) = v(t)×i(t) oscillates between positive (energy flowing from source to load) and negative (energy flowing from load back to source) values, averaging to exactly zero over a full cycle — this negative-power half of the cycle is the literal mathematical expression of "energy returned".

**Why a battery or inverter still experiences reactive current.** Even though an ideal reactive load returns its borrowed energy rather than consuming it, the SOURCE (battery, inverter output stage) must still supply and then re-absorb that current each cycle, which is why inverter output stages and their protective devices are rated in VA (apparent power) as well as W (real power), as established in F3.M3.L1.`,
        diagrams: [{ id: 'kirchhoff', caption: 'Instantaneous power for a reactive load oscillating between positive (source to load) and negative (load to source) over one cycle, averaging to zero.' }],
        formulas: [{ name: 'Instantaneous power', expr: 'p(t) = v(t) · i(t)', where: [['p(t)', 'instantaneous power', 'W'], ['v(t)', 'instantaneous voltage', 'V'], ['i(t)', 'instantaneous current', 'A']], note: 'For a purely reactive load, p(t) averages to zero over a full cycle, oscillating between positive and negative values.' }],
        examples: [
          {
            title: 'Instantaneous power sign for a reactive load',
            problem: 'At one instant, a capacitor\'s voltage and current are both positive (charging); at a later instant, its voltage is positive but its current is negative (discharging back toward the source). What does the sign of instantaneous power tell you in each case?',
            steps: ['Charging: v>0 and i>0, so p = v×i > 0 — energy flowing INTO the capacitor from the source', 'Discharging: v>0 and i<0, so p = v×i < 0 — energy flowing OUT of the capacitor, back toward the source'],
            answer: 'Positive instantaneous power means energy is flowing from source to load at that instant; negative means it is flowing back from load to source — exactly the "sent out and sent back" picture.',
          },
          {
            title: 'Why a protective device still sees reactive current',
            problem: 'A circuit breaker is rated by the current it must interrupt safely. Explain why a purely reactive load\'s current, despite transferring zero net energy over a cycle, must still be included when checking the breaker\'s rating.',
            steps: ['A circuit breaker responds to the actual instantaneous/RMS current flowing through it, not to net energy transferred', 'A reactive load\'s current is real, physical current flowing through the breaker at every instant, even though its cycle-average energy transfer is zero'],
            answer: 'The breaker must be rated for the full RMS current actually flowing, which includes the reactive component — "zero net energy" does not mean "zero current".',
          },
        ],
        applications: `This is the underlying reason every rating this module has discussed — conductor sizing, inverter VA rating, breaker rating — is based on CURRENT (or apparent power), not on net energy delivered: reactive current is real current, even though its net energy transfer is zero.`,
        mistakes: [
          { mistake: '"Reactive power does nothing, so it can be ignored when sizing equipment."', correction: 'Reactive power still requires real current flow, which must be accommodated by conductor, switch and inverter current ratings.' },
          { mistake: 'Assuming instantaneous power is always positive in an AC circuit.', correction: 'For a reactive load, instantaneous power swings negative for part of each cycle, representing energy flowing back to the source.' },
          { mistake: 'Confusing "zero net energy transfer" with "zero current".', correction: 'A reactive load can have zero net energy transfer over a cycle while still carrying substantial instantaneous current throughout.' },
        ],
        demo: { title: 'See the cyclical pattern', text: 'Capture voltage and current together (conceptually, using this module\'s R/X/φ relationships) to see where instantaneous power would be positive and negative over a cycle.', link: to.instrument('Open the oscilloscope', 'scope') },
        activities: [to.instrument('Oscilloscope', 'scope'), to.sim('H-bridge, inductive load (energy returned to the supply)', 'sim-08')],
        check: [
          { id: 'k1', type: 'mcq', prompt: 'Over a full cycle, an ideal reactive load\'s net energy transfer is...', options: ['zero', 'always positive', 'always negative', 'equal to the real power'], answer: 0, explain: 'Energy stored is returned in full each cycle for an ideal reactance.' },
          { id: 'k2', type: 'mcq', prompt: 'Negative instantaneous power in a reactive circuit means...', options: ['energy is flowing from the load back toward the source at that instant', 'a fault has occurred', 'the meter is broken', 'the frequency has reversed'], answer: 0, explain: 'The sign of p(t) indicates the direction of energy flow at that instant.' },
          { id: 'k3', type: 'mcq', prompt: 'Why must a breaker\'s rating still account for reactive current?', options: ['It responds to actual current flowing, regardless of net energy transferred', 'Reactive current never actually flows', 'Breakers ignore reactive loads by design', 'Reactive current is always safely below rated current'], answer: 0, explain: 'Zero net energy does not mean zero current.' },
        ],
        summary: [
          'A reactive load stores energy during part of each cycle and returns essentially all of it to the source during another part, with zero net transfer over a full cycle.',
          'Instantaneous power p(t) = v(t)×i(t) swings positive and negative for a reactive load, averaging to zero.',
          'This returned energy still requires real, physical current flow through conductors, switches and the inverter\'s output stage.',
          'This is why conductor, breaker and inverter ratings are based on current/apparent power, not on net energy delivered.',
        ],
        homework: {
          id: 'F3.M3.L4.hw',
          title: 'Reactive energy exchange',
          brief: 'Reason about instantaneous power sign and current rating.',
          tasks: [{ id: 'h1', type: 'numeric', prompt: 'A purely reactive load draws 15 A rms from a 230 V rms supply. What apparent power (VA) must the supply conductors be rated for, even though real power delivered is zero?', answer: 3450, tol: 0.01, unit: 'VA', explain: 'S = V_rms×I_rms = 230×15 = 3450 VA, regardless of the zero real power.' }],
          written: [{ prompt: 'A student argues that a large bank of capacitors connected to a 230 V supply with no resistive load at all "uses no power at all, so it needs no current rating on its supply conductors." Evaluate this claim fully, using the ideas from this lesson.', model: 'It is true that an ideal capacitor bank transfers zero NET energy over a full cycle — it stores and returns energy each cycle without net consumption. However, the student\'s conclusion that it "needs no current rating" is wrong: moving that energy back and forth each cycle requires real, physical current (reactive current) to flow through the supply conductors at every instant, and this current causes real I²R heating in those conductors regardless of the zero net energy transfer. The supply conductors must still be rated for the actual RMS current the capacitor bank draws, exactly as if it were doing useful work.' }],
        },
      },
    },
  ],
  quiz: {
    pass: 0.8,
    questions: [
      { id: 'q1', type: 'numeric', prompt: 'Apparent power of 230 V rms at 10 A rms (VA)?', answer: 2300, tol: 0.01, unit: 'VA', explain: 'S = 230×10 = 2300 VA.' },
      { id: 'q2', type: 'mcq', prompt: 'For a purely resistive load, P and S are...', options: ['equal', 'always different', 'related by a fixed ratio', 'unrelated'], answer: 0, explain: 'cos(0°) = 1.' },
      { id: 'q3', type: 'numeric', prompt: 'Power factor for P = 1500 W, S = 2000 VA?', answer: 0.75, tol: 0.01, unit: '', explain: 'PF = 1500/2000 = 0.75.' },
      { id: 'q4', type: 'mcq', prompt: 'A lagging power factor is caused by...', options: ['net inductive reactance', 'net capacitive reactance', 'purely resistive loads', 'a fault'], answer: 0, explain: 'Inductive loads make current lag voltage.' },
      { id: 'q5', type: 'mcq', prompt: 'True power factor differs from displacement power factor by also including...', options: ['harmonic current distortion', 'supply frequency', 'ambient temperature', 'the meter brand'], answer: 0, explain: 'True PF accounts for both phase shift and harmonic content.' },
      { id: 'q6', type: 'mcq', prompt: 'Over a full cycle, an ideal reactive load\'s net energy transfer is...', options: ['zero', 'positive', 'negative', 'equal to apparent power'], answer: 0, explain: 'Energy is stored and returned each cycle.' },
    ],
  },
  practicals: [],
}
