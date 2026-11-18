import type { AcademyModule } from '../types'
import { to } from '../s1/links'

/** F3.M4 Transformers. */
export const F3_M4: AcademyModule = {
  id: 'F3.M4',
  title: 'Transformers',
  summary: 'Mutual induction and turns ratio, ideal versus real transformer behaviour, isolation and safety, and the main transformer connection types.',
  lessons: [
    {
      id: 'F3.M4.L1',
      title: 'Mutual induction and turns ratio',
      minutes: 30,
      content: {
        objectives: [
          'Explain mutual induction as the physical basis of transformer action.',
          'State and apply the turns-ratio relationship between primary and secondary voltage.',
          'Explain how transformer current relates inversely to the turns ratio.',
          'Relate this to F3.M1.L1\'s claim that transformers require AC.',
        ],
        introduction: `F3.M1.L1 stated that transformers require AC because they rely on a changing magnetic flux. This lesson derives exactly how that changing flux links two separate windings and produces the turns-ratio relationship behind every step-up and step-down transformer you will meet.`,
        lecture: `### Mutual induction

Two coils of wire, wound around a common magnetic core, are linked by the same magnetic flux Φ passing through both. When the current in one coil (the **primary**) changes, so does the flux it produces, and — by Faraday's law — this changing flux induces a voltage in the SECOND coil (the **secondary**), even though the two coils have no direct electrical connection. This is **mutual induction**, and it is the entire physical basis of transformer action.

### Turns ratio and voltage

Each winding's induced voltage is proportional to its number of turns (N), because each turn links the same changing flux and contributes its own small induced voltage, which add in series along the winding:

**V_s / V_p = N_s / N_p**

A transformer with MORE secondary turns than primary turns (N_s > N_p) is a **step-up** transformer (V_s > V_p); fewer secondary turns gives a **step-down** transformer (V_s < V_p).

### Turns ratio and current (ideal transformer)

For an IDEAL transformer (no losses), input and output apparent power are equal: V_p·I_p = V_s·I_s. Combined with the voltage turns-ratio relationship, this gives current in the OPPOSITE ratio to voltage:

**I_s / I_p = N_p / N_s**

A step-up transformer (higher secondary voltage) therefore has LOWER secondary current than primary current, for the same transferred power — exactly why high-voltage transmission lines (F3.M1.L1) can use comparatively thin conductors for a given power.

### Why this needs AC (tying back to F3.M1.L1)

Mutual induction depends entirely on a CHANGING flux. A steady DC primary current produces a steady flux once established, inducing no ongoing secondary voltage — this lesson's physics is exactly what F3.M1.L1 asserted without deriving.`,
        technical: `**The magnetising current and core.** A real transformer's primary draws a small "magnetising current" even with no secondary load, needed to establish the core's magnetic flux; this is one of the real-transformer imperfections examined in F3.M4.L2. The core itself (laminated iron, or ferrite at higher frequencies) is chosen to carry the flux efficiently with low loss — core material and construction are a significant transformer design topic beyond this lesson's scope.

**Transformers at switching frequency.** The high-frequency transformers sometimes used inside inverter power stages (as opposed to a 50/60 Hz mains transformer) rely on exactly the same turns-ratio physics, but use a much smaller, lighter core because mutual induction is more efficient at higher frequency for a given core size — a design trade-off noted here for context, not required for calculation at this level.`,
        diagrams: [{ id: 'hf-link', caption: 'Primary and secondary windings linked by a common magnetic core and flux, with the turns-ratio relationship between V_p, V_s, N_p and N_s.' }],
        formulas: [
          { name: 'Voltage turns ratio', expr: 'V_s / V_p = N_s / N_p', where: [['V_p, V_s', 'primary and secondary voltage', 'V'], ['N_p, N_s', 'primary and secondary turns', 'turns']] },
          { name: 'Current turns ratio (ideal)', expr: 'I_s / I_p = N_p / N_s', where: [['I_p, I_s', 'primary and secondary current', 'A']] },
        ],
        examples: [
          {
            title: 'Step-down transformer voltage',
            problem: 'A transformer has 1000 primary turns and 50 secondary turns, with 230 V applied to the primary. Find the secondary voltage.',
            steps: ['V_s = V_p × (N_s/N_p)', '= 230 × (50/1000)'],
            answer: '11.5 V.',
          },
          {
            title: 'Secondary current for the same transformer',
            problem: 'For the transformer in the previous example, the secondary load draws 4 A. Find the (ideal) primary current.',
            steps: ['I_p = I_s × (N_s/N_p) = 4 × (50/1000)', 'Check with apparent power: S_p = V_p×I_p = 230×0.2 = 46 VA; S_s = V_s×I_s = 11.5×4 = 46 VA'],
            answer: 'I_p = 0.2 A, and both sides\' apparent power match at 46 VA, confirming the ideal-transformer power balance.',
            check: '46 VA = 46 VA on both sides, consistent with lossless power transfer.',
          },
        ],
        applications: `This is exactly how a mains isolation transformer (F3.M4.L3) or a battery-charging transformer steps 230 V or 120 V mains down to a safer or more usable secondary voltage, and it is the same turns-ratio principle behind the high-voltage step-up transformers used at power stations (F3.M1.L1).`,
        mistakes: [
          { mistake: '"A transformer increases power."', correction: 'An ideal transformer transfers power unchanged (V_p×I_p = V_s×I_s); it changes voltage and current, not power.' },
          { mistake: 'Assuming secondary current scales the same way as secondary voltage.', correction: 'Current scales in the OPPOSITE ratio to voltage: a step-up transformer has lower secondary current, not higher.' },
          { mistake: 'Believing a transformer works on DC if the DC is "strong enough".', correction: 'Mutual induction requires a CHANGING flux; a steady DC current, however large, induces no ongoing secondary voltage once established.' },
        ],
        demo: { title: 'See transformer inductance values', text: 'The LCR meter\'s inductance readings on transformer-style components relate directly to the turns and core properties behind this lesson\'s formulas.', link: to.instrument('Open the LCR meter', 'lcr') },
        activities: [to.instrument('LCR meter', 'lcr'), to.lib('Transformer', 'transformer')],
        check: [
          { id: 'k1', type: 'numeric', prompt: 'Secondary voltage for N_p=800, N_s=40, V_p=230 V (V)?', answer: 11.5, tol: 0.01, unit: 'V', explain: 'V_s = 230×(40/800) = 11.5 V.' },
          { id: 'k2', type: 'mcq', prompt: 'A step-up transformer has...', options: ['more secondary turns than primary turns', 'fewer secondary turns than primary turns', 'equal turns always', 'no core'], answer: 0, explain: 'N_s > N_p gives V_s > V_p.' },
          { id: 'k3', type: 'mcq', prompt: 'For an ideal transformer, secondary current relative to primary current, on a step-up transformer, is...', options: ['lower', 'higher', 'equal', 'undefined'], answer: 0, explain: 'Current scales in the opposite ratio to voltage.' },
          { id: 'k4', type: 'mcq', prompt: 'Mutual induction requires...', options: ['a changing magnetic flux', 'a steady DC flux', 'no magnetic core at all', 'direct electrical connection between windings'], answer: 0, explain: 'Only a changing flux induces an ongoing voltage.' },
        ],
        summary: [
          'Mutual induction links primary and secondary windings through a shared, changing magnetic flux — the physical basis of transformer action.',
          'Voltage turns ratio: V_s/V_p = N_s/N_p.',
          'Current turns ratio (ideal transformer): I_s/I_p = N_p/N_s — the opposite ratio from voltage, since power is conserved.',
          'This changing-flux requirement is exactly why transformers need AC, as F3.M1.L1 asserted.',
        ],
        homework: {
          id: 'F3.M4.L1.hw',
          title: 'Turns ratio practice',
          brief: 'Apply the voltage and current turns-ratio relationships.',
          tasks: [
            { id: 'h1', type: 'numeric', prompt: 'V_s for N_p=500, N_s=25, V_p=120 V (V)?', answer: 6, tol: 0.01, unit: 'V', explain: 'V_s=120×(25/500)=6 V.' },
            { id: 'h2', type: 'numeric', prompt: 'I_p for N_p=500, N_s=25, I_s=10 A (A)?', answer: 0.5, tol: 0.01, unit: 'A', explain: 'I_p=10×(25/500)=0.5 A.' },
          ],
          written: [{ prompt: 'A step-down transformer\'s secondary is short-circuited by accident. Using the turns-ratio relationship between primary and secondary current, explain what happens to the primary current, and why this matters for protection (fusing/breaker sizing).', model: 'A short circuit drives the secondary current I_s toward a very large value (limited mainly by winding resistance). Because I_p = I_s×(N_s/N_p), the primary current rises in the same proportion, so the primary also sees a greatly increased current, even though the fault is physically on the secondary side. This is why primary-side (and sometimes also secondary-side) protective devices must be sized to detect and clear a secondary fault promptly — the fault\'s effect is not confined to the secondary winding alone.' }],
        },
      },
    },
    {
      id: 'F3.M4.L2',
      title: 'Ideal and real transformers',
      minutes: 30,
      content: {
        objectives: [
          'List the assumptions of an ideal transformer.',
          'Identify the main loss mechanisms in a real transformer: copper loss, core (iron) loss and leakage reactance.',
          'Explain why transformer efficiency varies with load.',
          'Relate these losses to the LCR meter\'s ESR/DCR measurements (F5.M4.L2).',
        ],
        introduction: `F3.M4.L1's turns-ratio formulas assume an IDEAL transformer with no losses. Real transformers fall short of this ideal in specific, well-understood ways — and recognising each loss mechanism is exactly what F5.M4.L2's inductor/transformer DCR test was designed to probe.`,
        lecture: `### Assumptions of an ideal transformer

An ideal transformer assumes: zero winding resistance, no core losses, perfect magnetic coupling between windings (all flux links both), and no magnetising current needed. None of these hold exactly in a real transformer.

### Copper loss (I²R loss)

Real windings have resistance (their DCR, as measured in F5.M4.L2), so current flowing through them dissipates power as heat: **P_copper = I_p²R_p + I_s²R_s**. Copper loss RISES with the square of load current, so it is small at light load and significant at or above rated load.

### Core (iron) loss

The core itself loses energy on every AC cycle through two mechanisms: **hysteresis loss** (energy lost magnetising and demagnetising the core material each cycle) and **eddy current loss** (small circulating currents induced within the core material itself by the changing flux, which the core's lamination — thin, insulated sheets rather than one solid block — is specifically designed to reduce). Core loss is roughly CONSTANT regardless of load, because it depends on the applied voltage and frequency, not on load current.

### Leakage reactance

Not all of the flux produced by the primary links the secondary perfectly — some "leaks" without contributing to mutual induction. This imperfect coupling behaves like a small series inductance (leakage reactance) in each winding, causing some voltage drop under load beyond what resistance alone would cause.

### Why efficiency varies with load

Total loss = copper loss (rises with load²) + core loss (roughly constant). At very light load, core loss dominates relative to the small amount of power being delivered, so efficiency is poor. At very heavy load (or overload), rapidly rising copper loss dominates. Peak efficiency typically occurs somewhere in between, where the two loss mechanisms are roughly balanced — a transformer specified for a particular typical load is usually designed so this peak falls near that load point.`,
        technical: `**Relating this to F5.M4.L2's instrument work.** The LCR meter's DCR (DC resistance) check on an inductor or transformer winding directly measures the resistance responsible for copper loss; its ESR reading on a capacitor is the analogous concept for that component. This course now supplies the physical reasoning (I²R copper loss) behind why that single DCR number matters for efficiency, not just for a pass/fail health check.

**Transformer efficiency formula.** η = P_output / (P_output + P_copper + P_core), expressed as a percentage. Well-designed mains transformers commonly achieve efficiencies in the mid-90s to high-90s percent range at their rated load; this programme does not require memorising specific efficiency figures, only the loss mechanisms behind the formula.`,
        diagrams: [{ id: 'hf-link', caption: 'A real transformer\'s equivalent circuit showing winding resistance (copper loss), leakage reactance and a core-loss/magnetising branch, alongside the ideal turns-ratio core.' }],
        formulas: [
          { name: 'Copper loss', expr: 'P_copper = I_p²R_p + I_s²R_s', where: [['R_p, R_s', 'primary and secondary winding resistance', 'Ω']] },
          { name: 'Transformer efficiency', expr: 'η = P_out / (P_out + P_copper + P_core) × 100%', where: [['η', 'efficiency', '%']] },
        ],
        examples: [
          {
            title: 'Copper loss at two different load levels',
            problem: 'A transformer\'s secondary resistance is 0.05 Ω. Compare copper loss at (a) 10 A and (b) 20 A secondary current (ignore primary-side loss for simplicity).',
            steps: ['(a) P = I²R = 10² × 0.05 = 5 W', '(b) P = 20² × 0.05 = 20 W'],
            answer: 'Doubling the current quadruples the copper loss (5 W → 20 W), consistent with loss scaling as I².',
            check: '(20/10)² = 4, matching the 20/5 = 4× increase in loss.',
          },
          {
            title: 'Why a lightly loaded transformer has poor efficiency',
            problem: 'A transformer has a constant core loss of 8 W, and delivers only 40 W of output at light load with negligible copper loss at this low current. Find its efficiency at this operating point, and explain why it differs from a heavily loaded case.',
            steps: ['η = P_out/(P_out + P_core) ×100%', '= 40/(40+8) ×100%'],
            answer: '≈ 83.3% — noticeably worse than the mid-90s to high-90s percent efficiency typical nearer rated load, because the roughly constant 8 W core loss is a large fraction of the small 40 W delivered at this light load.',
          },
        ],
        applications: `This is the exact reasoning behind sizing a transformer appropriately for its typical load (neither oversized, which wastes core loss at light load, nor undersized, which incurs excessive copper loss and heating near or above rated load) in solar and battery system design (S2).`,
        mistakes: [
          { mistake: 'Assuming a real transformer has zero loss, like the ideal model.', correction: 'Real transformers have copper loss, core loss and leakage reactance; the ideal model is a simplifying approximation.' },
          { mistake: 'Assuming core loss scales with load current the way copper loss does.', correction: 'Core loss is roughly constant with load (depends on voltage/frequency); copper loss rises with load current squared.' },
          { mistake: '"A bigger transformer than needed is always better, since it has more margin."', correction: 'An oversized, lightly loaded transformer suffers relatively poor efficiency because its roughly constant core loss is large relative to the small load it is actually delivering.' },
        ],
        demo: { title: 'Measure winding resistance directly', text: 'Use the LCR meter\'s DCR check on an inductor/transformer case to see the real resistance responsible for copper loss.', link: to.instrument('Open the LCR meter', 'lcr') },
        activities: [to.instrument('LCR meter', 'lcr'), to.solar('System sizing and efficiency', 'design')],
        check: [
          { id: 'k1', type: 'mcq', prompt: 'Copper loss in a transformer winding scales with...', options: ['the square of load current', 'load current directly (linearly)', 'frequency only', 'core material only'], answer: 0, explain: 'P = I²R.' },
          { id: 'k2', type: 'mcq', prompt: 'Core (iron) loss is roughly...', options: ['constant regardless of load current', 'proportional to load current squared', 'zero at all times', 'only present at DC'], answer: 0, explain: 'Core loss depends mainly on applied voltage and frequency.' },
          { id: 'k3', type: 'mcq', prompt: 'Lamination of a transformer core is used to reduce...', options: ['eddy current loss', 'copper loss', 'leakage reactance entirely', 'the turns ratio'], answer: 0, explain: 'Thin insulated laminations limit circulating eddy currents within the core.' },
          { id: 'k4', type: 'numeric', prompt: 'Copper loss for I=15 A, R=0.02 Ω (W)?', answer: 4.5, tol: 0.02, unit: 'W', explain: 'P = 15²×0.02 = 4.5 W.' },
        ],
        summary: [
          'An ideal transformer assumes zero winding resistance, no core loss and perfect magnetic coupling; real transformers fall short in specific ways.',
          'Copper loss (I²R in the windings) rises with the square of load current.',
          'Core loss (hysteresis plus eddy current loss) is roughly constant regardless of load, depending mainly on applied voltage and frequency.',
          'Efficiency typically peaks where copper and core loss are roughly balanced; an oversized, lightly loaded transformer has relatively poor efficiency.',
        ],
        homework: {
          id: 'F3.M4.L2.hw',
          title: 'Transformer loss practice',
          brief: 'Compute copper loss and efficiency.',
          tasks: [
            { id: 'h1', type: 'numeric', prompt: 'Copper loss for I=25 A, R=0.03 Ω (W)?', answer: 18.75, tol: 0.02, unit: 'W', explain: 'P=25²×0.03=18.75 W.' },
            { id: 'h2', type: 'numeric', prompt: 'Efficiency for P_out=500 W, P_copper=15 W, P_core=10 W (%, to 1 decimal)?', answer: 95.2, tol: 0.02, unit: '%', explain: 'η=500/(500+15+10)×100 ≈ 95.2%.' },
          ],
          written: [{ prompt: 'A battery-based inverter system is specified with a transformer rated far above the typical daily load it will actually carry, "to be safe". Using this lesson\'s loss mechanisms, evaluate this design choice.', model: 'An oversized transformer running well below its rated load still incurs its roughly constant core loss, which becomes a larger fraction of the (smaller) actual power delivered, lowering day-to-day efficiency compared with a transformer sized closer to the typical load. While some headroom above typical load is reasonable for occasional peaks, choosing a transformer far larger than needed "to be safe" trades away efficiency for margin that is rarely used — a transformer sized closer to the expected typical and peak load range would likely perform better in practice.' }],
        },
      },
    },
    {
      id: 'F3.M4.L3',
      title: 'Isolation and safety',
      minutes: 25,
      content: {
        objectives: [
          'Explain how a transformer provides electrical isolation between primary and secondary circuits.',
          'Explain the safety benefit of isolation in the context of insulation testing (F5.M4.L1).',
          'Distinguish an isolation transformer from an autotransformer in terms of safety.',
        ],
        introduction: `A transformer's secondary winding has NO direct electrical connection to its primary — only a magnetic link. This isolation is not an incidental side-effect; it is a deliberate and valuable safety property, and it is exactly why F5.M4.L1's insulation resistance tester checks for breakdown of this very separation.`,
        lecture: `### What isolation means

Because the primary and secondary windings of a transformer are magnetically, not electrically, coupled, a transformer can transfer power across a complete electrical break: no conductive path exists between the two sides under normal, healthy operation. This is **galvanic isolation**.

### Why isolation matters for safety

Isolation means a fault (such as a live conductor contacting the equipment's enclosure) on one side does NOT automatically create a shock hazard that connects back through the supply on the other side, because there is no conductive path between them. This is one reason isolation transformers are specified for certain hazardous environments (medical equipment, test benches working on live equipment, portable tools used outdoors) — they break a potential fault path between the mains supply and the equipment side.

### Isolation breakdown and insulation testing

The isolation barrier between windings relies on the quality of the INSULATION separating them. If that insulation degrades (moisture ingress, age, physical damage, overheating), a conductive path can form between primary and secondary, defeating the isolation and creating exactly the shock hazard isolation was meant to prevent. This is precisely what F5.M4.L1's insulation resistance tester is designed to detect — a healthy transformer should show very high insulation resistance (megohms or more) between windings; a low reading signals isolation breakdown.

### Isolation transformer versus autotransformer

An **autotransformer** uses a SINGLE winding with a tapped connection to achieve a voltage ratio, which means there IS a direct electrical (conductive) connection between its "primary" and "secondary" sides — it provides voltage transformation WITHOUT isolation. A true **isolation transformer** uses two entirely separate windings specifically to preserve the no-direct-connection safety property. The two are not interchangeable where isolation is a safety requirement, even though both can change voltage.`,
        technical: `**Isolation and the inverter's own output.** Some inverter designs include an internal isolation transformer on the output stage specifically to provide galvanic separation between the DC source (battery/solar array) side and the AC output side — a design choice with real safety implications for installation and fault protection, distinct from inverter designs that are transformerless (and therefore not inherently isolated) for efficiency or size reasons.

**Common-mode versus isolated measurement.** When using the oscilloscope or DMM to probe across an isolation barrier (one probe on the primary side, one on the secondary side), extra care is needed because the two sides may be at very different potentials relative to a shared reference (such as a protective earth) — a practical safety point connecting this lesson directly to the DMM/scope safety practices covered in F5.M1.L2.`,
        diagrams: [{ id: 'isolation-flow', caption: 'An isolation transformer\'s two separate windings with no direct conductive path, compared with an autotransformer\'s single tapped winding with a direct connection.' }],
        formulas: [{ name: 'Insulation resistance pass check (recap, F5.M4.L1)', expr: 'R_insulation ≥ R_min', where: [['R_insulation', 'measured insulation resistance between windings', 'MΩ'], ['R_min', 'minimum acceptable value for the test voltage used', 'MΩ']], note: 'A reading at or above the guideline minimum indicates the isolation barrier is intact; a low reading signals breakdown.' }],
        examples: [
          {
            title: 'Why an isolation transformer protects against a specific fault path',
            problem: 'A tool\'s internal live conductor contacts its metal casing (an insulation fault) while the tool is powered through an isolation transformer. Explain why a person touching the casing and an earthed object is at lower risk than without the isolation transformer.',
            steps: ['Without isolation: the casing becomes connected, through the fault, back to the mains supply\'s own earth reference, so a person forms a conductive path to earth through their body', 'With isolation: the secondary side has no direct conductive connection to the mains earth reference, so the same casing fault does not automatically create a path back to earth through the person'],
            answer: 'The isolation transformer removes the direct conductive link back to the supply\'s earth reference, reducing (though not eliminating, since other fault paths can exist) the shock risk from this particular single fault.',
          },
          {
            title: 'Why insulation breakdown defeats isolation',
            problem: 'An isolation transformer\'s winding insulation degrades until a low-resistance path exists between primary and secondary. Explain why this is now functionally similar to an autotransformer, from a safety standpoint.',
            steps: ['Isolation\'s safety benefit depends on there being NO conductive path between primary and secondary', 'Degraded insulation creates exactly such a conductive path, even though the transformer was designed as two separate windings'],
            answer: 'Once insulation breaks down enough to create a conductive path, the transformer no longer provides the galvanic isolation it was designed for, regardless of its original two-winding construction — which is why periodic insulation resistance testing (F5.M4.L1) matters even for equipment that was isolated when new.',
          },
        ],
        applications: `This is exactly why installation and maintenance standards call for periodic insulation resistance testing (F5.M4.L1) on isolation transformers and similar equipment — isolation is a property that must be VERIFIED periodically, not simply assumed from the original design.`,
        mistakes: [
          { mistake: 'Assuming any transformer provides isolation.', correction: 'An autotransformer, despite changing voltage, has a direct electrical connection between its sides and does NOT provide isolation; only a two-separate-winding isolation transformer does.' },
          { mistake: '"Isolation makes a circuit completely safe regardless of other faults."', correction: 'Isolation addresses one specific fault path; other hazards (double faults, high voltage itself) still require their own protective measures.' },
          { mistake: 'Assuming isolation, once provided by design, remains perfect indefinitely.', correction: 'Insulation can degrade over time; periodic insulation resistance testing verifies isolation is still intact.' },
        ],
        demo: { title: 'Revisit the insulation tester', text: 'The safety-procedure-gated insulation resistance tester in the Virtual Instruments lab is testing exactly the isolation barrier this lesson describes.', link: to.instrument('Open the insulation resistance tester', 'insulation') },
        activities: [to.instrument('Insulation resistance tester', 'insulation'), to.lib('Transformer', 'transformer')],
        check: [
          { id: 'k1', type: 'mcq', prompt: 'Galvanic isolation means...', options: ['no direct conductive (electrical) path exists between primary and secondary', 'the voltage ratio is always 1:1', 'the transformer has no core', 'the secondary has no load'], answer: 0, explain: 'Only a magnetic link exists between the windings.' },
          { id: 'k2', type: 'mcq', prompt: 'An autotransformer differs from an isolation transformer because it...', options: ['has a direct electrical connection between its sides via a single tapped winding', 'cannot change voltage at all', 'has two entirely separate windings', 'is always more expensive'], answer: 0, explain: 'A single tapped winding provides no isolation.' },
          { id: 'k3', type: 'mcq', prompt: 'Insulation resistance testing on a transformer checks...', options: ['whether the isolation barrier between windings is still intact', 'the turns ratio', 'the core loss', 'the output frequency'], answer: 0, explain: 'Degraded insulation can create an unwanted conductive path, defeating isolation.' },
        ],
        summary: [
          'A transformer\'s windings are magnetically, not electrically, linked — this galvanic isolation is a deliberate safety property.',
          'Isolation removes a specific conductive fault path back to the supply, reducing (not eliminating) certain shock risks.',
          'An autotransformer provides voltage transformation without isolation, via a direct electrical connection between its sides.',
          'Insulation resistance testing (F5.M4.L1) verifies that an isolation barrier remains intact over time, since insulation can degrade.',
        ],
        homework: {
          id: 'F3.M4.L3.hw',
          title: 'Isolation reasoning',
          brief: 'Reason about isolation and safety.',
          tasks: [{ id: 'h1', type: 'mcq', prompt: 'A transformer under test shows an insulation resistance of 0.3 MΩ between windings, well below the guideline minimum. This most likely indicates...', options: ['isolation breakdown and a possible shock hazard', 'perfectly healthy isolation', 'an oversized core', 'a step-up winding ratio'], answer: 0, explain: 'A low insulation resistance reading signals degraded insulation between the windings.' }],
          written: [{ prompt: 'A maintenance technician proposes replacing a damaged isolation transformer with an autotransformer of the same voltage ratio, "since it does the same job". Evaluate this proposal from a safety standpoint.', model: 'An autotransformer and an isolation transformer can indeed produce the same voltage ratio, but they are not equivalent from a safety standpoint: the autotransformer has a direct electrical connection between its input and output sides, providing no galvanic isolation, while the original isolation transformer specifically protected against certain fault paths by having no such connection. If the original equipment was specified with an isolation transformer for safety reasons (as is common for medical equipment, test benches, or portable tools used in harsh environments), substituting an autotransformer would remove that safety property even though the voltage output looks the same, and the proposal should be rejected unless isolation is confirmed not to be a requirement for this specific application.' }],
        },
      },
    },
    {
      id: 'F3.M4.L4',
      title: 'Transformer connection',
      minutes: 25,
      content: {
        objectives: [
          'Describe common single-phase transformer winding configurations: simple, centre-tapped, and multiple secondaries.',
          'Explain the purpose of a centre-tapped secondary.',
          'Explain, at an introductory level, why three-phase transformers use star/delta connections.',
        ],
        introduction: `Beyond the simple one-primary, one-secondary transformer of earlier lessons, real transformers are built with a variety of winding configurations to suit particular applications — this closing lesson surveys the main ones you are likely to encounter.`,
        lecture: `### Centre-tapped secondary

A **centre-tapped** secondary winding has an additional connection brought out from the electrical MIDPOINT of the winding, in addition to its two ends. This gives three usable terminals instead of two, and two equal half-voltages referenced to the centre tap (e.g. a 24 V centre-tapped secondary gives +12 V and −12 V relative to the centre tap, as well as the full 24 V across the two ends). Centre-tapped secondaries are commonly used to derive a dual-polarity supply (+V and −V relative to a common reference) and in certain rectifier topologies.

### Multiple secondaries

A single transformer core can carry more than one separate secondary winding, each delivering its own voltage (set by its own turns count) and isolated from the others as well as from the primary — useful where a piece of equipment needs several different voltage rails from one transformer rather than several separate transformers.

### Three-phase transformer connections (introductory)

Larger power systems use THREE-PHASE supplies (three AC voltages of the same frequency and magnitude, spaced 120° apart in phase — a direct extension of this module's phase-difference concept, F3.M1.L2). Three-phase transformers connect their windings in one of two basic patterns:

- **Star (wye)**: each winding's one end connects to a common neutral point, with the other end brought out as a phase terminal — giving access to both a phase-to-neutral and a phase-to-phase voltage.
- **Delta**: windings are connected end-to-end in a closed loop, with phase terminals brought out from the junctions — no neutral point is available directly from a delta winding.

Different combinations (star-star, star-delta, delta-star, delta-delta) on the primary and secondary sides are chosen for reasons including neutral availability, fault behaviour and harmonic circulation — a substantial topic in its own right, introduced here only so the terms are recognisable; detailed three-phase transformer design is beyond this course's scope.`,
        technical: `**Why star-delta combinations are common.** A star-delta transformer (star primary, delta secondary, or vice versa) is often chosen because the delta winding provides a closed path for certain harmonic currents (notably triplen harmonics, briefly flagged in F3.M3.L3) to circulate within the transformer rather than flowing out onto the wider network — a practical benefit beyond simply setting the voltage ratio.

**This programme's inverter focus.** Most of the inverter equipment in the Build Your Own Inverter laboratory is single-phase; three-phase transformer connections are included here for recognition and vocabulary, since larger commercial/industrial inverter installations (introduced at a survey level elsewhere in this programme) do use three-phase equipment.`,
        diagrams: [{ id: 'hf-link', caption: 'A centre-tapped secondary winding alongside star and delta three-phase winding connection patterns.' }],
        formulas: [{ name: 'Centre-tap half-voltage', expr: 'V_half = V_end-to-end / 2', where: [['V_half', 'voltage from either end to the centre tap', 'V'], ['V_end-to-end', 'voltage across the full winding', 'V']] }],
        examples: [
          {
            title: 'Voltages available from a centre-tapped secondary',
            problem: 'A transformer has a centre-tapped secondary rated 36 V end-to-end. What voltages are available relative to the centre tap, and end-to-end?',
            steps: ['End-to-end: 36 V (the full winding)', 'Each half, relative to the centre tap: 36/2 = 18 V'],
            answer: '+18 V and −18 V relative to the centre tap, plus the full 36 V across the two ends.',
          },
          {
            title: 'Why a delta winding has no neutral point',
            problem: 'Explain why a delta-connected three-phase winding cannot directly provide a neutral conductor, while a star-connected winding can.',
            steps: ['A star connection joins one end of each of the three windings together at a single common point — this common point is the neutral', 'A delta connection joins windings end-to-end in a closed loop, with phase terminals at the junctions — no single common point exists to serve as a neutral'],
            answer: 'Only the star connection has a natural common point (where the three windings meet) to bring out as a neutral conductor; a delta winding has no such point.',
          },
        ],
        applications: `Centre-tapped secondaries are directly relevant to several rectifier and dual-supply topologies you will build in F3.M5 and the Build Your Own Inverter laboratory; three-phase connections become relevant for larger commercial installations covered at a survey level elsewhere in the broader curriculum.`,
        mistakes: [
          { mistake: 'Assuming a centre tap doubles the available voltage.', correction: 'A centre tap splits the SAME end-to-end voltage into two equal halves relative to the tap; it does not add voltage.' },
          { mistake: 'Assuming a delta connection provides a neutral conductor.', correction: 'Only a star connection has a common point available to serve as a neutral; delta does not.' },
          { mistake: 'Treating three-phase transformer connections as simply "three single-phase transformers with no further considerations".', correction: 'The choice of star/delta combination affects neutral availability, fault behaviour and harmonic circulation, not just the voltage ratio.' },
        ],
        demo: { title: 'Measure a transformer winding\'s inductance', text: 'The LCR meter can measure the inductance of each winding or half-winding of a centre-tapped transformer case independently.', link: to.instrument('Open the LCR meter', 'lcr') },
        activities: [to.instrument('LCR meter', 'lcr'), to.ckt('Transformer connection exercise', 'ckt-07')],
        check: [
          { id: 'k1', type: 'mcq', prompt: 'A centre-tapped secondary provides...', options: ['an additional connection at the winding\'s electrical midpoint, giving two equal half-voltages', 'twice the end-to-end voltage', 'isolation between its two halves', 'a built-in rectifier'], answer: 0, explain: 'It splits the same total voltage into two equal halves relative to the tap.' },
          { id: 'k2', type: 'mcq', prompt: 'A star (wye) winding connection provides a natural point for...', options: ['a neutral conductor', 'a delta loop', 'isolation', 'a centre tap'], answer: 0, explain: 'The common junction of the three windings serves as the neutral.' },
          { id: 'k3', type: 'mcq', prompt: 'A delta winding connection...', options: ['has no natural neutral point', 'always provides a neutral', 'is the same as a centre tap', 'cannot carry three-phase power'], answer: 0, explain: 'Windings are joined end-to-end in a loop, with no common point.' },
        ],
        summary: [
          'A centre-tapped secondary brings out a connection at the winding\'s midpoint, giving two equal half-voltages plus the full end-to-end voltage.',
          'A transformer core can carry multiple isolated secondary windings, each with its own voltage.',
          'Three-phase transformers use star (wye) or delta winding connections; star provides a natural neutral point, delta does not.',
          'The choice of star/delta combination affects neutral availability, fault behaviour and harmonic circulation, a topic introduced here at survey level.',
        ],
        homework: {
          id: 'F3.M4.L4.hw',
          title: 'Transformer connections practice',
          brief: 'Apply centre-tap and star/delta concepts.',
          tasks: [{ id: 'h1', type: 'numeric', prompt: 'Half-voltage relative to the centre tap for a 48 V end-to-end centre-tapped secondary (V)?', answer: 24, tol: 0.01, unit: 'V', explain: '48/2 = 24 V.' }],
          written: [{ prompt: 'A designer needs both +15 V and −15 V DC rails, referenced to a common ground, from a single AC transformer secondary feeding a rectifier stage. Explain how a centre-tapped secondary would help achieve this, in terms of this lesson\'s concepts.', model: 'A centre-tapped secondary naturally provides two equal half-voltages (here, AC equivalents of the eventual ±15 V) on either side of the centre tap, which can be used as the common reference (ground) point. Feeding each half separately into its own rectifier stage referenced to the centre tap produces a positive DC rail from one half and a negative DC rail from the other, both referenced to the same common point — exactly the dual-polarity supply this lesson identified as a typical use of a centre-tapped secondary.' }],
        },
      },
    },
  ],
  quiz: {
    pass: 0.8,
    questions: [
      { id: 'q1', type: 'numeric', prompt: 'V_s for N_p=600, N_s=30, V_p=230 V (V)?', answer: 11.5, tol: 0.01, unit: 'V', explain: 'V_s=230×(30/600)=11.5 V.' },
      { id: 'q2', type: 'mcq', prompt: 'Copper loss scales with...', options: ['the square of load current', 'load current linearly', 'frequency only', 'voltage only'], answer: 0, explain: 'P=I²R.' },
      { id: 'q3', type: 'mcq', prompt: 'Core loss is roughly...', options: ['constant regardless of load', 'proportional to load squared', 'zero always', 'only present at light load'], answer: 0, explain: 'Depends mainly on applied voltage and frequency.' },
      { id: 'q4', type: 'mcq', prompt: 'Galvanic isolation means...', options: ['no direct conductive path between primary and secondary', 'a 1:1 voltage ratio', 'no magnetic core', 'no load connected'], answer: 0, explain: 'Only a magnetic link exists.' },
      { id: 'q5', type: 'mcq', prompt: 'An autotransformer provides voltage transformation...', options: ['without isolation, via a direct electrical connection', 'with full isolation', 'only at DC', 'only for three-phase systems'], answer: 0, explain: 'A single tapped winding has a direct connection.' },
      { id: 'q6', type: 'mcq', prompt: 'A star winding connection provides a natural point for...', options: ['a neutral conductor', 'a centre tap', 'core lamination', 'leakage reactance'], answer: 0, explain: 'The common junction of the three windings.' },
    ],
  },
  practicals: [],
}
