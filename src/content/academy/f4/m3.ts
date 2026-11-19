import type { AcademyModule } from '../types'
import { to } from '../s1/links'

/** F4.M3 Magnetic components. */
export const F4_M3: AcademyModule = {
  id: 'F4.M3',
  title: 'Magnetic components',
  summary: 'Magnetic circuits and saturation, transformers at low and high frequency, output and filter inductors, and testing windings.',
  lessons: [
    {
      id: 'F4.M3.L1',
      title: 'Magnetic circuits: flux, B-H, saturation',
      minutes: 30,
      content: {
        objectives: [
          'Explain how a magnetic core concentrates flux produced by a winding\'s current.',
          'Read a B-H curve\'s general shape and locate the saturation knee on it.',
          'Explain why core material choice is a genuine engineering trade-off, not an arbitrary preference.',
        ],
        introduction: `F4.M1.L3 introduced [[saturation|saturation]] for a single inductor. This lesson gives the underlying magnetic-circuit picture properly, as the shared foundation for both inductors and the transformer this module covers next.`,
        lecture: `### Flux and the magnetic circuit

Current flowing through a [[winding|winding]] produces a magnetic field; a core of magnetic material (iron, ferrite, F4.M1.L3) concentrates this field into a well-defined path, called [[magnetic-flux|magnetic flux (Φ)]], much as a wire concentrates electric current into a well-defined path. The core's **permeability** describes how strongly it concentrates flux for a given magnetising force — a high-permeability core gives far more inductance (or far more flux for the same current) than an air core of the same geometry.

### The B-H curve

A core material's behaviour is summarised by its B-H curve: B (flux density, how much flux per unit cross-sectional area) plotted against H (magnetising force, proportional to current and turns). At low H, B rises steeply and roughly linearly with H — this is the normal, useful operating region, where inductance stays essentially constant. Above some H, the curve bends over sharply (the "saturation knee") and B rises only slowly however much further H increases — the core has run out of additional flux-carrying capacity, and effective inductance collapses (F4.M1.L3's saturation).

### Why core material is a real design trade-off

Different core materials trade permeability, saturation flux density, loss at a given frequency, cost and temperature stability against each other — there is no single "best" material for every application. A material with very high permeability (more inductance per turn) may saturate at a lower flux density, or have excessive loss at the switching frequency the design actually needs; a material with excellent high-frequency loss behaviour may need more turns (more copper, more cost, more copper loss) to reach the same inductance. Selecting a core is a balance across all of these, driven by the application's voltage, current and frequency.`,
        technical: `**Core losses: hysteresis and eddy current.** Beyond the DC saturation picture, a core operating on AC also dissipates energy on every cycle through hysteresis loss (the B-H curve does not retrace itself exactly, enclosing a small loop whose area is energy lost per cycle) and eddy-current loss (circulating currents induced within the core material itself by the changing flux, reduced by laminating the core into thin, insulated sheets or by using a naturally resistive material like ferrite).

**Air gaps.** A deliberate small gap in an otherwise closed magnetic core lowers overall permeability but raises the current at which saturation occurs, letting a designer trade some inductance-per-turn for more current-handling headroom — a standard technique in inductor design, not a manufacturing defect.`,
        diagrams: [{ id: 'rl-curve', caption: 'A B-H curve: the roughly linear low-field region, the saturation knee, and the flattened region beyond it where additional magnetising force produces little extra flux.' }],
        formulas: [{ name: 'Flux density (concept)', expr: 'B = Φ / A', where: [['B', 'flux density', 'T (tesla)'], ['Φ', 'magnetic flux', 'Wb (weber)'], ['A', 'core cross-sectional area', 'm²']], note: 'Saturation is reached at a material-specific maximum B — beyond it, further current gives little additional flux.' }],
        examples: [
          {
            title: 'Reasoning about the saturation knee',
            problem: 'A core\'s datasheet gives a saturation flux density of 0.35 T for a ferrite material and 1.5 T for an iron-powder material, for cores of similar size. Explain one practical consequence of this difference.',
            steps: ['A higher saturation flux density means the iron-powder core can carry substantially more flux (and hence handle more current) before saturating, for a similar core size', 'The ferrite core, with its lower saturation point, would need to be physically larger (or accept a lower current rating) to avoid saturating at the same current'],
            answer: 'For a given current rating, the iron-powder core can be smaller (or carry more current at the same size) before saturating than the lower-saturation ferrite — exactly why material choice depends on the application\'s needs, not a single universally-best material.',
          },
          {
            title: 'Why an air gap raises the saturation current',
            problem: 'Explain, conceptually, why adding a small air gap to an otherwise closed core raises the current at which it saturates, at the cost of some inductance per turn.',
            steps: ['The air gap has far lower permeability than the core material, so it dominates the magnetic circuit\'s overall "resistance" to flux (its magnetic reluctance)', 'This lowers the overall inductance per turn for the same winding', 'But it also means a much larger magnetising force (current) is needed before the CORE material itself reaches its own saturation flux density, since most of the magnetic "effort" is now spent across the gap'],
            answer: 'The gap trades away some inductance per turn in exchange for a substantially higher current-handling headroom before saturation — a deliberate, standard inductor-design technique.',
          },
        ],
        applications: `This magnetic-circuit picture underlies every transformer and inductor you will meet in F4.M3.L2–L3, and the saturation reasoning you apply when diagnosing an overloaded output choke in the Repair Workshop.`,
        mistakes: [
          { mistake: 'Assuming all core materials behave identically, differing only in price.', correction: 'Permeability, saturation flux density, and high-frequency loss genuinely differ by material, and the right choice depends on the application.' },
          { mistake: 'Treating an air gap in a core as a manufacturing fault.', correction: 'A deliberate air gap is a standard design technique that trades inductance per turn for higher saturation-current headroom.' },
          { mistake: 'Believing saturation means "the current stops flowing".', correction: 'Saturation means the CORE stops contributing additional flux for more current — current often then rises sharply, the opposite of stopping.' },
        ],
        demo: { title: 'See the transformer entry next', text: 'This magnetic-circuit picture is the foundation for the transformer lesson that follows.', link: to.lib('Transformer', 'transformer') },
        activities: [to.lib('Transformer', 'transformer'), to.lib('Inductor', 'inductor')],
        check: [
          { id: 'k1', type: 'mcq', prompt: 'A core\'s permeability describes...', options: ['how strongly it concentrates flux for a given magnetising force', 'its physical weight', 'its colour', 'its cost only'], answer: 0, explain: 'Higher permeability concentrates more flux for the same current/turns.' },
          { id: 'k2', type: 'mcq', prompt: 'The "saturation knee" on a B-H curve marks...', options: ['where further magnetising force produces little additional flux', 'where the core material melts', 'the origin (zero point) of the graph', 'the point of maximum permeability'], answer: 0, explain: 'The curve flattens once the core runs out of flux-carrying capacity.' },
          { id: 'k3', type: 'mcq', prompt: 'A deliberate air gap in a core...', options: ['lowers inductance per turn but raises the saturation current', 'has no effect on magnetic behaviour', 'always increases inductance', 'is always a manufacturing defect'], answer: 0, explain: 'A standard trade-off technique in inductor design.' },
        ],
        summary: [
          'A magnetic core concentrates the flux produced by a current-carrying winding, described by its permeability.',
          'A B-H curve\'s roughly linear low-field region gives way to a saturation knee, beyond which additional current produces little extra flux.',
          'Core material choice trades permeability, saturation flux density, high-frequency loss and cost against each other — no single material wins every application.',
          'A deliberate air gap trades some inductance per turn for a higher saturation-current rating.',
        ],
        homework: {
          id: 'F4.M3.L1.hw',
          title: 'Magnetic circuit reasoning',
          brief: 'Reason about core material trade-offs.',
          tasks: [{ id: 'h1', type: 'mcq', prompt: 'A core material with very high permeability but a low saturation flux density is best suited to an application with...', options: ['low current and a need for high inductance in a small size', 'very high current and minimal concern for size', 'no current at all', 'only AC applications above 1 MHz'], answer: 0, explain: 'High permeability gives compact high inductance, but low saturation limits current headroom.' }],
          written: [{ prompt: 'An output choke saturates under a sustained overload, and a colleague proposes simply winding more turns on the same core to "increase its inductance and fix the problem". Explain why this specific fix is likely to make the saturation problem worse, not better, referring to the B-H curve.', model: 'Adding turns increases inductance at LOW current (more flux per unit current, since inductance scales with turns squared for a given core), but it does not raise the core\'s saturation flux density, which is a property of the core material itself, not the winding. For the SAME applied voltage, a higher-inductance winding reaches the same saturation flux density at a LOWER current than before (since more turns means more flux is produced per ampere), so the core would likely saturate at an even lower current than the original design — the opposite of the intended fix. Addressing saturation under overload generally needs a core with a higher saturation flux density or current rating (or a gapped core, or simply addressing the overload itself), not more turns on the same core.' }],
        },
      },
    },
    {
      id: 'F4.M3.L2',
      title: 'Transformers in inverters: LF vs HF',
      minutes: 30,
      content: {
        objectives: [
          'Explain the role of a transformer in a low-frequency (LF) inverter design versus a high-frequency (HF) link design.',
          'Compare the size, weight and efficiency trade-offs between LF and HF transformer designs.',
          'State why galvanic isolation matters for an inverter\'s transformer, beyond voltage transformation alone.',
        ],
        introduction: `You met the [[transformer|transformer]]'s basic principle in F3.M4: mutual induction between windings requires a changing flux, which is why only AC (or switched DC) transforms. This lesson applies that principle to the two very different ways real inverters actually use a transformer: at line frequency (50/60 Hz) or inside a high-frequency switching link.`,
        lecture: `### Low-frequency (LF) transformer designs

A traditional "LF" inverter design switches the battery DC directly at the output frequency (50/60 Hz, or a stepped approximation of it) through a line-frequency transformer that steps the switched low voltage up to mains-level AC. This transformer is large and heavy (transformer size scales inversely with operating frequency for a given power, since lower frequency needs more [[magnetic-flux|flux]] swing per cycle and hence a larger core to avoid saturating), but the design is simple, extremely robust, and tolerates large transient overloads well because of its sheer physical mass and thermal capacity.

### High-frequency (HF) link designs

An "HF" inverter design instead switches the DC at a much higher frequency (commonly tens of kHz) through a small, light HF transformer, then rectifies and further processes the result to produce the final AC output. Because transformer size falls sharply with rising frequency for the same power rating, an HF transformer achieves the SAME power transformation in a small fraction of the size and weight of an equivalent LF transformer — the main reason "HF" or "transformerless-sounding" compact inverters are so much lighter than traditional LF designs of the same power rating. The trade-off is more complex power-electronics control (fast switching devices, F4.M2, and more intricate control, F4.M5) and typically a somewhat lower surge-overload tolerance than a large LF transformer's simple thermal mass provides.

### Isolation is not just about voltage ratio

Beyond stepping voltage up or down, a transformer provides [[galvanic-isolation|galvanic isolation]]: no direct conductive path exists between the battery-side and the output-side windings, energy crossing only magnetically. This isolation is a genuine safety feature in its own right (it can prevent a fault on one side from directly energising the other side with an unexpected reference), independent of whatever voltage ratio the transformer happens to provide — some inverter topologies are explicitly described as "transformerless" precisely because they trade away this isolation for a size/efficiency benefit, which has real implications for how the installation must otherwise be protected and earthed (S3).`,
        technical: `**Core material follows frequency.** LF transformers typically use laminated steel (acceptable loss at low frequency, adequate saturation flux density, lower cost at larger sizes); HF transformers almost always use [[ferrite|ferrite]] cores, since laminated steel's eddy-current losses would be prohibitive at tens of kHz, while ferrite's low high-frequency loss and adequate flux handling suit the smaller HF design well.

**Leakage inductance.** No real transformer couples 100 % of one winding's flux to the other; the small uncoupled fraction behaves as an effective series inductance (leakage inductance) on each winding, which matters more at higher switching frequencies and must be accounted for in HF converter design (often deliberately used, in some topologies, rather than simply minimised).`,
        diagrams: [{ id: 'hf-link', caption: 'Comparing a line-frequency transformer stage against a high-frequency switched link, for the same power transformation.' }],
        formulas: [{ name: 'Transformer size scaling (concept)', expr: 'Core size (for a given power) decreases as switching frequency increases', where: [], note: 'A qualitative design relationship, not a precise formula: higher frequency needs less flux swing per cycle for the same power, allowing a smaller core before saturating.' }],
        examples: [
          {
            title: 'Why an HF transformer can be so much smaller',
            problem: 'Explain, using flux swing per cycle, why a transformer operating at 50 kHz can be dramatically smaller than one of the same power rating operating at 50 Hz.',
            steps: ['Transformer EMF per turn is proportional to frequency times flux swing per cycle (from Faraday\'s law)', 'For the SAME voltage and turns, a 1000× higher frequency (50 kHz vs 50 Hz) allows roughly 1000× LESS flux swing per cycle for the same induced voltage', 'Less required flux swing means a far smaller core can be used before reaching its saturation flux density, for the same power rating'],
            answer: 'The dramatically higher switching frequency lets the core do the same job with a far smaller required flux swing, which is why HF transformers are so much smaller and lighter than LF transformers of equal power rating.',
          },
          {
            title: 'Choosing between LF and HF designs',
            problem: 'A rugged off-grid inverter must tolerate large, repeated surge loads (motor starting) without damage, and weight is not a major constraint. Which design philosophy (LF or HF) better suits this requirement, and why?',
            steps: ['LF transformers\' large thermal and physical mass gives them substantial inherent tolerance of brief large overloads', 'HF designs rely more on fast electronic protection and generally have less inherent surge-overload margin from mass alone'],
            answer: 'An LF (transformer-based) design is often favoured for this kind of rugged, surge-tolerant application, accepting the weight penalty in exchange for robustness — exactly why many heavy-duty off-grid inverters remain LF designs despite HF alternatives being lighter.',
          },
        ],
        applications: `Both the LF (LF-3K) and HF-influenced (SQ-1K) model inverters in the 3D Dissection Laboratory embody this exact design choice — P4's architecture tour lets you see the physical consequence of it directly.`,
        mistakes: [
          { mistake: '"HF designs are strictly better because they are smaller and lighter."', correction: 'HF designs trade control complexity and typically lower inherent surge tolerance for size and weight — the right choice depends on the application, not a universal ranking.' },
          { mistake: 'Assuming all transformers provide galvanic isolation equally, regardless of topology.', correction: 'Some "transformerless" inverter topologies deliberately omit this isolation for other benefits, with real implications for how the installation is otherwise protected and earthed.' },
          { mistake: 'Assuming an LF transformer\'s core material would work equally well at HF switching frequencies.', correction: 'Laminated steel\'s eddy-current losses become prohibitive at tens of kHz; ferrite is the practical HF choice.' },
        ],
        demo: { title: 'Tour the 3D laboratory\'s magnetics', text: 'Compare the physical transformer in each model inverter.', link: to.lab3d('Transformer and inductor', 'lf3k', 't1') },
        activities: [to.lib('Transformer', 'transformer'), to.lab3d('Magnetics tour', 'lf3k')],
        check: [
          { id: 'k1', type: 'mcq', prompt: 'HF transformers are typically much smaller than LF transformers of the same power rating mainly because...', options: ['higher frequency needs less flux swing per cycle for the same induced voltage, allowing a smaller core', 'HF transformers use no core material at all', 'HF transformers carry less power', 'LF transformers are made from cheaper materials'], answer: 0, explain: 'Faraday\'s law links EMF to frequency × flux swing.' },
          { id: 'k2', type: 'mcq', prompt: 'LF transformer designs are often preferred where...', options: ['large surge-overload tolerance from physical/thermal mass matters more than weight', 'minimum weight is the only requirement', 'galvanic isolation is unwanted', 'switching frequency must be in the tens of kHz'], answer: 0, explain: 'LF transformers\' mass gives inherent surge tolerance.' },
          { id: 'k3', type: 'mcq', prompt: 'Galvanic isolation from a transformer provides...', options: ['no direct conductive path between the two sides, a genuine safety benefit independent of voltage ratio', 'a higher voltage ratio only', 'lower cost only', 'faster switching'], answer: 0, explain: 'Isolation is a separate benefit from voltage transformation.' },
        ],
        summary: [
          'LF transformer designs switch DC directly at 50/60 Hz through a large, heavy, line-frequency transformer, with strong inherent surge tolerance.',
          'HF link designs switch at tens of kHz through a small, light ferrite transformer, trading some surge-tolerance margin and control simplicity for size and weight.',
          'Transformer size for a given power falls as switching frequency rises, because less flux swing per cycle is needed for the same induced voltage.',
          'Galvanic isolation is a distinct safety benefit of a transformer, separate from its voltage ratio, and is deliberately absent in some "transformerless" topologies.',
        ],
        homework: {
          id: 'F4.M3.L2.hw',
          title: 'LF vs HF transformer reasoning',
          brief: 'Apply the trade-offs to a short scenario.',
          tasks: [{ id: 'h1', type: 'mcq', prompt: 'A portable, lightweight inverter for camping, with modest surge requirements, most likely uses a...', options: ['high-frequency (HF) link design', 'large line-frequency (LF) transformer', 'no magnetics of any kind', 'only a battery, no transformer'], answer: 0, explain: 'Weight and size favour an HF design where surge tolerance is not the dominant requirement.' }],
          written: [{ prompt: 'A customer complains that their new lightweight HF-design inverter "feels less robust" than their old heavy LF-design unit, even though both are rated for the same continuous power. Explain, in engineering terms (not just "the new one is cheaper"), what real difference between the two designs could justify this impression.', model: 'The two designs can have genuinely the same continuous power rating while differing substantially in surge-overload tolerance: the old LF unit\'s large transformer has significant physical and thermal mass that lets it absorb a brief, large overload (such as motor starting current) without immediate damage, essentially using its bulk as a buffer. The new HF unit achieves the same continuous rating in a much smaller package specifically because it relies on fast active protection and control rather than thermal mass to survive excess current — it may protect itself correctly, but by shutting down or limiting output rather than simply "riding through" a surge the way the heavier unit\'s mass allows. The customer\'s impression reflects a real, explainable design trade-off, not simply a cheaper build.' }],
        },
      },
    },
    {
      id: 'F4.M3.L3',
      title: 'Output and filter inductors',
      minutes: 25,
      content: {
        objectives: [
          'Explain the role of an output inductor in an LC filter stage.',
          'Relate inductor value, switching frequency and ripple current for a given application.',
          'Distinguish an output/filter inductor\'s design priorities from a transformer\'s.',
        ],
        introduction: `This lesson narrows F4.M3's magnetic-circuit picture to the specific component you tested conceptually in F4.M1.L3: the output or filter inductor, whose job is shaping current rather than transforming voltage or providing isolation.`,
        lecture: `### The output inductor's job

In an [[lc-filter|LC filter]] stage (F3.M5), the inductor sits in series with the switched output, resisting rapid changes in current and smoothing the fast-switching current pulses from the bridge into something closer to the intended output waveform, while the paired capacitor handles the voltage side of the same filtering job. Unlike a transformer, an output inductor has only one winding, provides no isolation, and its design priority is purely about current-handling and inductance value at the switching frequency in use — not voltage ratio.

### Ripple current and inductor value

A larger inductance value, for a given switching frequency and voltage, gives LESS ripple current (smoother current) but requires more turns (more copper, more size, more copper loss) and a correspondingly higher saturation-current design margin (F4.M3.L1). A smaller inductance gives a more compact, cheaper part but accepts more ripple current, which in turn means more RMS current for the same average power (worse conduction loss elsewhere) and a rougher raw waveform before capacitor smoothing. Selecting an output inductor's value is this exact balance, almost always informed by the SAME filter-design calculation (corner frequency, F3.M5) used for the paired capacitor.

### Current rating still matters most

As in F4.M1.L3, the output inductor's saturation-current and continuous-current ratings remain the dominant practical concern: an output inductor undersized for the load's real peak current will saturate under exactly the conditions (peak or surge load) where it is needed most, producing the steep, uncontrolled current rise that is this component's characteristic fault.`,
        technical: `**Ripple current as a fraction of average current.** A common design rule of thumb targets output-inductor ripple current at roughly 20–40 % of the average (DC or fundamental) current — enough to keep the filter compact and the inductor's own hysteresis/eddy losses reasonable, without letting ripple current dominate the RMS current (and hence the conduction losses) elsewhere in the circuit.

**Multiple inductors in a filter.** Some designs use two-stage LC filtering (an inductor-capacitor-inductor-capacitor arrangement) for steeper attenuation of switching-frequency content than a single LC stage achieves — a refinement on the same basic principle, not a different mechanism.`,
        diagrams: [{ id: 'lc-filter', caption: 'The output inductor\'s role in an LC filter stage, smoothing switched current into the intended output waveform.' }],
        formulas: [{ name: 'LC corner frequency', expr: 'f_c = 1 / (2π√(LC))', where: [['f_c', 'filter corner frequency', 'Hz'], ['L', 'output inductance', 'H'], ['C', 'filter capacitance', 'F']], note: 'Set well above the fundamental output frequency but well below the switching frequency, so the fundamental passes and switching-frequency content is attenuated (F3.M5).' }],
        examples: [
          {
            title: 'Corner frequency of an output filter',
            problem: 'An output filter uses L = 2 mH and C = 10 µF. Find its corner frequency.',
            steps: ['f_c = 1/(2π√(LC))', '= 1/(2π√(0.002 × 10e-6))', '= 1/(2π√(2e-8))', '= 1/(2π × 1.414e-4)'],
            answer: '≈ 1126 Hz — comfortably above a 50/60 Hz fundamental and well below a typical multi-kHz switching frequency.',
          },
          {
            title: 'Trade-off of a smaller inductance',
            problem: 'A designer halves the output inductor\'s value to reduce size and cost, without changing anything else. Explain the likely consequence for ripple current and for the capacitor\'s job.',
            steps: ['Lower inductance resists current change less effectively at the same switching frequency and voltage, so ripple current rises', 'The corner frequency f_c = 1/(2π√(LC)) rises too (since L fell), which, if left unaddressed, reduces how well the filter attenuates switching-frequency content before it reaches the output'],
            answer: 'Ripple current rises and the filter\'s attenuation of switching noise weakens — the capacitor would likely need to be increased to compensate and restore the original corner frequency, so the "simple" size/cost reduction is not free elsewhere in the design.',
          },
        ],
        applications: `The DC filtering exercise in the Circuit Connection Laboratory, and the output-inductor-related readings in the simulator's filtering experiments, are this lesson applied directly.`,
        mistakes: [
          { mistake: 'Treating an output inductor as functionally the same as a transformer.', correction: 'An output inductor has one winding, no isolation and no voltage-ratio function; its job is purely current smoothing.' },
          { mistake: 'Choosing output inductance purely to minimise size/cost, without checking the resulting ripple current and filter corner frequency.', correction: 'Inductance value, ripple current and corner frequency are all linked — changing one without checking the others can silently degrade filter performance.' },
          { mistake: 'Assuming a higher continuous current rating alone guarantees adequate performance under peak/surge load.', correction: 'Saturation current rating, not just continuous current rating, is what matters at peak or surge load (F4.M3.L1).' },
        ],
        demo: { title: 'Build the DC filtering exercise', text: 'See an output inductor smoothing a switched waveform directly.', link: to.ckt('DC filtering', 'ckt-05') },
        activities: [to.ckt('DC filtering', 'ckt-05'), to.lib('Inductor', 'inductor')],
        check: [
          { id: 'k1', type: 'numeric', prompt: 'Corner frequency (Hz, to nearest whole number) for L=1 mH, C=20 µF?', answer: 1125, tol: 0.02, unit: 'Hz', explain: 'f_c=1/(2π√(0.001×20e-6))≈1125 Hz.' },
          { id: 'k2', type: 'mcq', prompt: 'A smaller output inductance, all else equal, gives...', options: ['more ripple current', 'less ripple current', 'no change in ripple current', 'infinite ripple current'], answer: 0, explain: 'Less current-change resistance means more ripple for the same switching behaviour.' },
          { id: 'k3', type: 'mcq', prompt: 'An output inductor, unlike a transformer, provides...', options: ['no voltage-ratio transformation and no isolation', 'galvanic isolation', 'a step-up voltage ratio', 'a step-down voltage ratio only'], answer: 0, explain: 'It has a single winding and purely a current-smoothing role.' },
        ],
        summary: [
          'An output/filter inductor smooths switched current in an LC filter stage, with one winding and no isolation or voltage-ratio role.',
          'Inductance value trades ripple current against size, copper loss and saturation-current margin.',
          'Corner frequency f_c = 1/(2π√(LC)) links the output inductor and its paired capacitor — changing one without the other shifts filter performance.',
          'Saturation-current rating, not just continuous rating, is the dominant practical limit at peak or surge load.',
        ],
        homework: {
          id: 'F4.M3.L3.hw',
          title: 'Output filter reasoning',
          brief: 'Apply the corner-frequency formula and ripple reasoning.',
          tasks: [{ id: 'h1', type: 'numeric', prompt: 'Corner frequency (Hz, to nearest whole number) for L=3 mH, C=5 µF?', answer: 1299, tol: 0.02, unit: 'Hz', explain: 'f_c=1/(2π√(0.003×5e-6))≈1299 Hz.' }],
          written: [{ prompt: 'An inverter\'s output is noticeably rougher (more residual switching-frequency content) after a repair that replaced a failed output inductor with one of a lower inductance value than the original, matched only on current rating. Explain why matching current rating alone was insufficient here.', model: 'Current rating governs whether the inductor can safely carry the operating and peak current without saturating or overheating, but it says nothing about the filter\'s corner frequency, which depends on BOTH the inductance value and the paired capacitor\'s value. A lower inductance value raises the corner frequency (f_c = 1/(2π√(LC))), weakening the filter\'s attenuation of switching-frequency content relative to the original design — exactly the rougher output observed. The replacement needed to match inductance value (to preserve the intended corner frequency) in addition to current rating, not current rating alone.' }],
        },
      },
    },
    {
      id: 'F4.M3.L4',
      title: 'Testing windings',
      minutes: 25,
      content: {
        objectives: [
          'Apply a winding-resistance test and an insulation test to a transformer or inductor.',
          'Interpret an open, shorted-turns or insulation-breakdown reading correctly.',
          'Explain why insulation testing uses a high test voltage, and the safety precautions this requires.',
        ],
        introduction: `This lesson closes F4.M3 with the bench practice behind every winding-related reading you will take: how to confirm a transformer or inductor's winding is sound, using the Component Library's own test procedures.`,
        lecture: `### Winding resistance

A simple Ω-range (or 4-wire, for very low values, F4.M1.L4) measurement across a winding confirms basic continuity: a healthy winding reads a small, consistent resistance; an OPEN winding (a broken wire, a failed internal joint) reads OL — no path at all. This is the same reading you take for an inductor's DC resistance (F4.M1.L4), applied here to each of a transformer's windings in turn.

### Inductance, and detecting shorted turns

An LCR meter's inductance reading, compared against the healthy marked or reference value, can reveal a winding with a small number of SHORTED turns (adjacent turns whose insulation has failed and are touching) — the winding may still show reasonable continuity on a simple resistance check, since only a small fraction of turns are affected, but inductance drops noticeably because the shorted turns no longer contribute their intended share of the total magnetic effect — a fault a resistance check alone would likely miss.

### Insulation testing

Beyond the windings' own continuity, a transformer must maintain insulation BETWEEN its windings (for galvanic isolation, F4.M3.L2) and between each winding and the core/case (for safety earthing). An insulation (megohmmeter) test applies a high DC test voltage (commonly 500 V for low-voltage equipment) between these points and reads the resulting resistance — a healthy result is very high (commonly hundreds of megohms or more); a low reading indicates insulation breakdown, a genuine safety hazard (it can mean the windings are no longer properly isolated from each other or from earth) requiring the part to be taken out of service, not merely noted.

### Safety around insulation testing

Because the insulation tester itself deliberately produces several hundred volts, the test procedure requires the same isolation and discharge precautions as any other live-adjacent work, plus care to keep hands clear of the test leads during the test and to discharge the winding afterward (a winding under insulation test can retain a stored charge briefly, similar to a capacitor).`,
        technical: `**Turns ratio verification.** Applying a known, safe low AC voltage to a transformer's primary and measuring the resulting secondary voltage lets you verify the actual turns ratio matches the expected design value (F3.M4) — a mismatch (with otherwise healthy resistance and insulation readings) can indicate an incorrectly wound or mislabelled replacement part, a different failure mode from either an open winding or shorted turns.

**Insulation resistance and humidity.** A winding's insulation resistance reading can be temporarily depressed by surface moisture or contamination (without any real internal breakdown) — a genuinely low reading that recovers after cleaning and drying is a different situation from one that stays low, and the two should not be confused.`,
        diagrams: [{ id: 'test-bench', caption: 'The winding test sequence: resistance (continuity), inductance (shorted-turns check), then insulation (breakdown check) — each catching a different failure mode.' }],
        formulas: [{ name: 'Insulation resistance (concept)', expr: 'A healthy result is typically > 100 MΩ (varies by standard and equipment class)', where: [], note: 'A specific pass/fail limit should be taken from the applicable standard or manufacturer\'s specification, not assumed universally.' }],
        examples: [
          {
            title: 'Distinguishing an open winding from shorted turns',
            problem: 'Winding A reads OL on resistance. Winding B reads a normal, healthy resistance but an inductance roughly 30 % below its marked value. Classify each fault.',
            steps: ['Winding A: no continuity at all → open winding', 'Winding B: continuity present (healthy resistance) but reduced inductance → a small number of shorted turns, not a complete open'],
            answer: 'Winding A has an open (broken) winding; Winding B has shorted turns — two distinct fault mechanisms that the resistance test alone would not have told apart.',
          },
          {
            title: 'Interpreting a low insulation reading',
            problem: 'A transformer\'s primary-to-secondary insulation reads 0.4 MΩ, far below the expected >100 MΩ for a healthy part. What should be done?',
            steps: ['0.4 MΩ indicates a significant insulation breakdown, not a borderline or measurement-error result', 'This compromises the galvanic isolation the transformer is relied on to provide'],
            answer: 'The transformer should be taken out of service and replaced — a result this far below healthy is a genuine safety finding, not something to monitor and reassess later.',
          },
        ],
        applications: `The transformer winding-resistance and insulation test procedure in the Component Library, and any Repair Workshop scenario involving a magnetic component, draw on exactly this three-part test sequence.`,
        mistakes: [
          { mistake: 'Checking winding resistance only, and skipping an inductance check.', correction: 'A small number of shorted turns can leave resistance looking healthy while inductance has dropped — both checks catch different fault mechanisms.' },
          { mistake: 'Treating any non-infinite insulation reading as an immediate failure.', correction: 'Compare against the applicable standard/healthy reference; very high but not literally infinite readings are normal, and a borderline low reading recovering after cleaning may indicate surface contamination rather than true breakdown.' },
          { mistake: 'Skipping discharge after an insulation test.', correction: 'The winding can retain a stored charge from the high test voltage briefly afterward — discharge it as part of the standard safety sequence.' },
        ],
        demo: { title: 'Run the winding test procedure', text: 'Work through the transformer\'s resistance and insulation test procedure.', link: to.proc('Winding resistance and insulation test', 'transformer', 'xfmr-winding') },
        activities: [to.proc('Transformer winding test', 'transformer', 'xfmr-winding'), to.proc('Inductor L and DCR test', 'inductor', 'inductor-lcr')],
        check: [
          { id: 'k1', type: 'mcq', prompt: 'A winding reading OL on a resistance check has...', options: ['an open (broken) winding', 'shorted turns', 'perfectly healthy insulation', 'excessive inductance'], answer: 0, explain: 'No continuity at all indicates an open winding.' },
          { id: 'k2', type: 'mcq', prompt: 'Shorted turns are best detected by...', options: ['a reduced inductance reading, even with healthy resistance', 'resistance alone', 'colour of the winding', 'core temperature alone'], answer: 0, explain: 'Resistance can look normal while inductance drops from shorted turns.' },
          { id: 'k3', type: 'mcq', prompt: 'An insulation test uses a high DC test voltage mainly to...', options: ['reveal insulation breakdown that a low-voltage check would not stress enough to show', 'melt any faulty insulation', 'charge the winding permanently', 'measure turns ratio'], answer: 0, explain: 'Breakdown may only become apparent under realistic stress voltage.' },
        ],
        summary: [
          'Winding resistance confirms basic continuity; an open winding reads OL (no path).',
          'An inductance reading can reveal shorted turns even when resistance looks healthy.',
          'Insulation testing (at a high DC test voltage) checks isolation between windings and between windings and the core/earth — a low reading is a genuine safety finding.',
          'Discharge and isolation precautions apply to insulation testing, as the test itself produces several hundred volts.',
        ],
        homework: {
          id: 'F4.M3.L4.hw',
          title: 'Winding test interpretation',
          brief: 'Classify winding faults from combined readings.',
          tasks: [{ id: 'h1', type: 'mcq', prompt: 'A winding reads a healthy resistance AND a healthy inductance, but a low insulation resistance to the core. The fault is best classified as...', options: ['an insulation breakdown, separate from the winding\'s own electrical integrity', 'an open winding', 'shorted turns', 'no fault at all'], answer: 0, explain: 'The winding itself is electrically sound; the fault is in its insulation to the core.' }],
          written: [{ prompt: 'A transformer passes its resistance and inductance checks but fails its insulation test. Explain why it would be incorrect to conclude the transformer is "basically fine, just needs an insulation top-up", and what the correct next step is.', model: 'Insulation breakdown is not something that can be "topped up" — it reflects actual physical degradation of the insulating material between windings or to the core, and once broken down it does not self-repair. Even though the winding\'s own electrical properties (resistance, inductance) remain healthy, the compromised insulation is a genuine safety hazard: it undermines the galvanic isolation the transformer is relied on to provide, and could allow unexpected voltages to appear where they should not. The correct next step is to treat the transformer as failed and replace it, not to continue using it while"monitoring" the insulation.' }],
        },
      },
    },
  ],
  quiz: {
    pass: 0.8,
    questions: [
      { id: 'q1', type: 'mcq', prompt: 'The saturation knee on a B-H curve marks...', options: ['where further magnetising force produces little additional flux', 'the point of zero flux', 'the melting point of the core', 'maximum winding resistance'], answer: 0, explain: 'The curve flattens once the core runs out of flux capacity.' },
      { id: 'q2', type: 'mcq', prompt: 'HF transformers are typically smaller than LF transformers of equal power mainly because...', options: ['higher frequency needs less flux swing per cycle for the same voltage', 'they carry less current', 'they use no magnetic core', 'they operate at lower voltage only'], answer: 0, explain: 'Faraday\'s law links EMF to frequency × flux swing.' },
      { id: 'q3', type: 'mcq', prompt: 'Galvanic isolation from a transformer means...', options: ['no direct conductive path between the two sides', 'a 1:1 voltage ratio', 'no magnetic core present', 'the windings touch directly'], answer: 0, explain: 'Energy crosses only magnetically, not via a direct conductive path.' },
      { id: 'q4', type: 'numeric', prompt: 'Corner frequency (Hz, to nearest whole number) for L=2 mH, C=8 µF?', answer: 1259, tol: 0.02, unit: 'Hz', explain: 'f_c=1/(2π√(0.002×8e-6))≈1259 Hz.' },
      { id: 'q5', type: 'mcq', prompt: 'Shorted turns in a winding are best detected by...', options: ['a reduced inductance reading, even with healthy resistance', 'resistance alone', 'visual inspection only', 'core colour'], answer: 0, explain: 'Resistance can look normal while inductance drops.' },
      { id: 'q6', type: 'mcq', prompt: 'A low insulation-resistance reading on a transformer indicates...', options: ['a genuine safety-relevant insulation breakdown', 'a perfectly healthy part', 'excessive turns ratio', 'normal behaviour at high humidity only'], answer: 0, explain: 'A significantly low reading is a genuine finding requiring action, not a normal variation.' },
    ],
  },
  assignment: {
    id: 'F4.M3.assignment',
    title: 'Magnetic component reasoning and testing',
    brief: 'Apply saturation, filter design and winding-test reasoning.',
    tasks: [
      { id: 'a1', type: 'numeric', prompt: 'Corner frequency (Hz, to nearest whole number) for L=1.5 mH, C=15 µF?', answer: 1061, tol: 0.03, unit: 'Hz', explain: 'f_c=1/(2π√(0.0015×15e-6))≈1061 Hz.' },
      { id: 'a2', type: 'mcq', prompt: 'A winding reading OL on resistance has...', options: ['an open winding', 'shorted turns', 'healthy insulation', 'excessive inductance'], answer: 0, explain: 'No continuity at all.' },
      { id: 'a3', type: 'mcq', prompt: 'An air gap in a core trades...', options: ['inductance per turn for a higher saturation current', 'cost for colour', 'frequency for voltage', 'nothing, it has no effect'], answer: 0, explain: 'A standard inductor-design technique.' },
    ],
    written: [{ prompt: 'A technician measures a suspect output inductor\'s DC resistance and finds it normal, concludes the part is healthy, and refits it — but the circuit continues to show excessive output ripple. Explain what check was skipped and why it matters here.', model: 'A healthy DC resistance reading only confirms the winding has continuity; it does not rule out shorted turns or a change in effective inductance, which would not necessarily show up as a resistance change but would directly affect the filter\'s corner frequency and hence its ripple performance. An inductance check (compared against the marked/healthy value) was skipped, and is exactly the test that would reveal a reduced effective inductance causing the continued excessive ripple, even with normal winding resistance.' }],
  },
  practicals: [
    {
      id: 'F4.M3.P1',
      title: 'Diagnose an output inductor fault in the Repair Workshop',
      description: 'Confirm, on a real circuit-grounded fault, that you can apply the winding-test reasoning from this module.',
      link: to.repair('Output inductor winding open', 'rsc-11'),
      evidence: { kind: 'troubleshoot', project: 'rsc-11' },
    },
  ],
}
