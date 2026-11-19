import type { AcademyModule } from '../types'
import { to } from '../s1/links'

/** P4.M3 Identification. */
export const P4_M3: AcademyModule = {
  id: 'P4.M3',
  title: 'Identification',
  summary: "Timed, scored component identification on a real board, and a direct comparison of a square-wave inverter against a hybrid inverter's architecture.",
  lessons: [
    {
      id: 'P4.M3.L1',
      title: 'Recognising components on a board',
      minutes: 20,
      content: {
        objectives: [
          "Identify at least 20 real inverter components by sight, under time pressure, in the 3D laboratory's identification challenge.",
          'Use physical cues (size, markings, mounting, position) rather than labels alone to identify a part.',
          'Explain why rapid, confident identification matters before any repair work begins.',
        ],
        introduction: `This lesson is a direct, scored test of everything the architecture tour (P4.M1) built: can you identify a real inverter's components by SIGHT, quickly and correctly, without relying on labels being conveniently visible?`,
        lecture: `### Identification cues, beyond the label

A real component rarely announces itself with a convenient label reading "MOSFET" — it is identified by a combination of cues: physical size and package type (a TO-247 power device looks different from a small-signal transistor), markings (a datecode or part number silkscreened or printed on the body), mounting (clamped to a heat sink versus free-standing), and position in the circuit (near the gate drivers, or near the output terminals). F4's Component Library taught these cues one component at a time; this identification challenge tests recognising them together, under time pressure, exactly as a technician must when opening an unfamiliar unit.

### Why speed and confidence both matter

A technician who can eventually identify every part, given unlimited time, is not yet ready for real repair work — unlimited time is rarely available, and hesitation over basic identification slows every subsequent diagnostic step. Equally, confident but WRONG identification (mistaking an IGBT for a MOSFET, say) can lead to applying the wrong test procedure (F4.M2.L8) or ordering the wrong replacement part (F4.M2.L10) — so this challenge scores both speed and accuracy, not one alone.

### Common identification traps

Similar-looking parts in different roles are the most common source of error: two capacitors of visually similar size but very different voltage ratings (F4.M1.L2), a relay and a larger contactor that are electrically related but mechanically different (F4.M4.L3), or a MOSFET and an IGBT that can look superficially similar in some packages despite very different characteristics (F4.M2.L4-L5).`,
        technical: `**Datecodes and part numbers as the most reliable cue.** When present and legible, a component's printed part number or datecode is the single most reliable identification cue — far more reliable than package shape alone, which can be shared across genuinely different device types.

**Why position in the circuit is a secondary, not primary, cue.** Position (e.g. "near the heat sink") narrows the likely candidates (a power switch, not a signal-level IC) but does not, by itself, distinguish a MOSFET from an IGBT — both are commonly heat-sink-mounted. Position supports identification; it does not replace checking the part's actual marking.`,
        diagrams: [{ id: 'risk-hierarchy', caption: 'Identification cues in order of reliability: part marking/datecode (most reliable), package/size, mounting, and circuit position (most general, least specific).' }],
        formulas: [{ name: 'Identification scoring (concept)', expr: 'Score reflects both the number correctly identified AND time taken, not accuracy alone', where: [] }],
        examples: [
          {
            title: 'Resolving an identification ambiguity',
            problem: "Two similarly-sized devices sit on a heat sink. One is marked clearly; the other's marking is worn illegible. How should each be identified?",
            steps: ['The clearly marked device is identified directly from its printed part number — the most reliable cue', 'The illegible device cannot be identified with full confidence from marking alone; package shape, pin configuration and circuit position become the best available secondary cues, with lower certainty'],
            answer: 'The marked device is identified with high confidence from its part number; the unmarked device is identified with LOWER confidence from secondary cues, and ideally flagged for confirmation (e.g. by context, circuit tracing, or seeking a clearer marking elsewhere on the part) before being treated as certain.',
          },
          {
            title: 'Why wrong-but-confident identification is worse than slow-but-correct',
            problem: 'Explain, using F4.M2.L10, why confidently misidentifying an IGBT as a MOSFET is more costly than simply taking longer to identify it correctly.',
            steps: ['F4.M2.L10 explained that sourcing a replacement depends on correctly knowing the device TYPE and its exact ratings', 'A confident misidentification leads directly to ordering or fitting the WRONG replacement part, a compatibility failure, not just a delay'],
            answer: "Taking longer to identify correctly costs time; confidently misidentifying costs a wrong replacement part fitted, a real compatibility failure that can damage the circuit or the new part itself — which is why this challenge's scoring values accuracy as much as speed, not speed alone.",
          },
        ],
        applications: `This identification skill is the direct prerequisite for every F4 test procedure and every Repair Workshop scenario — you cannot correctly test or replace a part you have misidentified.`,
        mistakes: [
          { mistake: 'Relying on package shape alone to distinguish a MOSFET from an IGBT.', correction: "Package shape can be shared across different device types; the part's printed marking is the more reliable cue when legible." },
          { mistake: 'Treating circuit position as sufficient to confirm a specific device type.', correction: 'Position narrows the likely candidates but does not replace checking the actual marking — many different device types share similar positions (e.g. heat-sink-mounted).' },
          { mistake: 'Prioritising speed over accuracy in identification.', correction: 'A confident but wrong identification leads to the wrong test procedure or the wrong replacement part — a real, costly compatibility failure, not just a minor error.' },
        ],
        demo: { title: 'Take the identification challenge', text: 'Identify at least 20 real components by sight, under time pressure.', link: to.lab3d('Identification challenge', 'lf3k') },
        activities: [to.lab3d('Identification challenge', 'lf3k')],
        check: [
          { id: 'k1', type: 'mcq', prompt: 'The most reliable single identification cue, when legible, is...', options: ["the part's printed marking or datecode", 'its physical package shape alone', 'its position in the circuit alone', 'its colour'], answer: 0, explain: 'Package and position can be shared across different device types; the marking is specific.' },
          { id: 'k2', type: 'mcq', prompt: 'A confident but WRONG identification is costly mainly because...', options: ['it leads to the wrong test procedure or the wrong replacement part being used', 'it takes longer than being unsure', 'it has no real consequence', 'it only affects the scoring, not real repair work'], answer: 0, explain: 'Wrong identification leads directly to a real compatibility failure.' },
          { id: 'k3', type: 'mcq', prompt: 'Circuit position (e.g. "mounted on the heat sink") is best used as...', options: ['a cue that narrows likely candidates, not a confirmation of exact device type', 'the single most reliable identification method', 'irrelevant to identification', 'proof the part is a MOSFET specifically'], answer: 0, explain: 'Many different device types can share a similar position.' },
        ],
        summary: [
          'Component identification relies on multiple cues together: marking, package, mounting, and circuit position.',
          'A printed part number or datecode, when legible, is the most reliable single cue.',
          'Circuit position narrows likely candidates but does not, by itself, confirm an exact device type.',
          'Confident misidentification is more costly than slow correct identification, since it leads to real compatibility failures in testing or replacement.',
        ],
        homework: {
          id: 'P4.M3.L1.hw',
          title: 'Identification reasoning practice',
          brief: 'Apply the cue-reliability hierarchy to a short scenario.',
          tasks: [{ id: 'h1', type: 'mcq', prompt: "When a part's marking is legible, the correct priority is to...", options: ['trust the marking over package shape or position alone', 'ignore the marking and rely on position', 'trust package shape over the marking', 'guess based on colour'], answer: 0, explain: 'Marking is the most specific and reliable cue when available.' }],
          written: [{ prompt: "A trainee argues that since they can always look up a part's full identity later from its datasheet once it is removed, there is no real value in being able to identify it quickly BY SIGHT while it is still in the circuit. Explain the flaw in this reasoning.", model: "Identifying a part correctly while it is STILL in the circuit matters for reasons that removing it first does not solve: knowing what a part is, and roughly how it should behave, is what tells a technician which test procedure to run on it in the first place (F4's test-procedure lessons are organised by device type), which safety precautions apply before touching it (a capacitor bank is not the same safety case as a resistor), and whether it is even the right suspect for the fault being diagnosed before time is spent removing it at all. Waiting until after removal to identify a part means potentially removing, testing, or disturbing the wrong component before the diagnosis is even clear — by-sight identification while still in place is what makes efficient, safe, targeted diagnosis possible, not merely a shortcut for avoiding a datasheet lookup." }],
        },
      },
    },
    {
      id: 'P4.M3.L2',
      title: 'Comparing a square-wave and a hybrid inverter',
      minutes: 25,
      content: {
        objectives: [
          'Compare the SQ-1K (square-wave) and LF-3K (hybrid, modified/pure-sine-capable) model architectures directly.',
          'Explain which component families appear in one model but not the other, and why.',
          'Relate each architectural difference to the output-waveform-quality and feature differences between the two designs.',
        ],
        introduction: `This closing lesson compares the two model inverters side by side: the simpler SQ-1K (a square-wave design) against the more complex LF-3K (a hybrid design with MPPT charging and sensing) — not as an abstract comparison, but using the real architecture each model exposes.`,
        lecture: `### What the simpler design omits

The SQ-1K model has no MPPT charger stage at all — no IGBTs, no dedicated PWM oscillator for charging, no PV input terminals. Its power board carries a far simpler single-purpose oscillator IC (SG3525-family, exactly the same family used in LF-3K's charger stage, interestingly, but here driving the MAIN output instead) plus a bleeder resistor and a rectifier diode — a design built to do ONE job (square-wave output from a battery) and nothing else.

### What the more complex design adds, and why

The LF-3K adds, on top of the same core H-bridge/transformer/output-filter architecture: a PV input path with its own fuse, breaker and dedicated IGBT-based charger stage (for MPPT charging from solar, F4.M3.L2's LF-vs-HF discussion and F4.M5's sensing/control modules); a Hall-effect current sensor and voltage-sense module (closed-loop feedback, F4.M5.L1-L2, which the simpler SQ-1K design does not need since it has no charging function to regulate); and a microcontroller alongside its PWM controller, where SQ-1K uses only a single PWM oscillator IC with no programmable control at all.

### Connecting architecture to output quality

These additions are not incidental — F4.M5.L1's control-philosophy comparison explained that a microcontroller's flexibility is what makes SPWM-based, higher-quality sine-shaped output possible, something a fixed-function oscillator alone cannot produce. The SQ-1K's simpler square-wave output and the LF-3K's more sophisticated output are a direct, visible consequence of exactly this architectural difference, not an unrelated design choice.`,
        technical: `**Why SQ-1K still uses an SG3525-family IC.** The SAME dedicated-PWM-IC family (F4.M5.L1) appears in both models, but for different jobs: driving the MAIN output directly in SQ-1K's simpler design, versus handling only the SECONDARY charger stage in LF-3K's more complex design, where a microcontroller handles the main output instead. This shows the same component family can suit very different roles depending on what a design as a whole needs.

**Cost and complexity trade-off, made visible.** Every additional part identified in LF-3K that SQ-1K lacks (PV terminals, breaker, IGBTs, current sensor, voltage-sense module, microcontroller) represents real added cost and complexity — a visible, physical illustration of why a square-wave-only design remains a legitimate, simpler, lower-cost choice for applications that do not need solar charging or sine-quality output.`,
        diagrams: [{ id: 'design-chain', caption: 'The SQ-1K and LF-3K architectures side by side, showing which component families the hybrid design adds and how each addition supports a specific extra capability.' }],
        formulas: [{ name: 'Capability-to-architecture mapping (concept)', expr: 'Each extra capability (MPPT charging, closed-loop feedback, programmable SPWM output) corresponds to a specific, identifiable set of extra components', where: [] }],
        examples: [
          {
            title: 'Predicting a missing capability from missing parts',
            problem: "A technician opens an unfamiliar inverter and finds no current sensor, no voltage-sense module, and only a single fixed-function PWM IC with no microcontroller. Based on this comparison, what can be inferred about this unit's likely capabilities?",
            steps: ['No current/voltage sensing suggests no closed-loop feedback control, similar to SQ-1K', 'A single fixed-function PWM IC with no microcontroller suggests no SPWM-based sine-quality output and no MPPT charging capability'],
            answer: 'This unit is architecturally closer to the simpler SQ-1K design: likely a square-wave (or similarly simple) output with no solar-charging capability — an inference drawn directly from which component families are ABSENT, exactly the comparison this lesson builds.',
          },
          {
            title: "Explaining a shared component family's different role",
            problem: 'Both models use an SG3525-family PWM IC, but F4.M5.L1 might seem to suggest a microcontroller is always the "better" choice. Resolve this apparent tension.',
            steps: ['F4.M5.L1 explained each control technology is matched to the job it suits, not that one is universally better', "In SQ-1K, the PWM IC drives the only output the design needs; in LF-3K, it is relegated to a secondary charger role because the main output now needs the microcontroller's flexibility"],
            answer: "There is no real tension: the SAME component can be the right choice for a simple, single-purpose job (SQ-1K's main output) while being only appropriate for a secondary role once a more demanding job (LF-3K's SPWM main output) requires different flexibility — matching technology to job, not ranking one technology as universally superior, is the consistent principle.",
          },
        ],
        applications: `This architecture-to-capability comparison is exactly the reasoning the Repair Workshop and the Component Library's comparison guides (mosfet-vs-igbt, pwm-vs-mcu) rely on when explaining why a specific design uses the parts it does.`,
        mistakes: [
          { mistake: 'Assuming a more complex design is simply a "better" version of a simpler one in every respect.', correction: 'Added complexity (MPPT charging, closed-loop feedback, SPWM output) brings real capability, but also real added cost — the simpler design remains the right choice when those capabilities are not needed.' },
          { mistake: 'Assuming the same IC family always performs the same role across different designs.', correction: "The SG3525-family IC drives the main output in SQ-1K but only a secondary charger stage in LF-3K — its role depends on what the rest of the design needs from it." },
          { mistake: "Inferring a unit's full capability from a single component alone.", correction: 'Capability is inferred from the PATTERN of components present (or absent) together, not any single part in isolation.' },
        ],
        demo: { title: 'Compare SQ-1K and LF-3K', text: 'Tour both models side by side and identify the architectural differences.', link: to.lab3d('Model comparison', 'sq1k') },
        activities: [to.lab3d('Square-wave model', 'sq1k'), to.lab3d('Hybrid model', 'lf3k'), to.cmp('PWM controller vs microcontroller', 'pwm-vs-mcu')],
        check: [
          { id: 'k1', type: 'mcq', prompt: 'The SQ-1K model lacks an MPPT charger stage mainly because...', options: ['it is a simpler design built for one job (square-wave output from a battery) only', 'IGBTs cannot physically fit on its board', 'MPPT charging is impossible with any square-wave design', 'it has no power board at all'], answer: 0, explain: 'A deliberate scope/cost difference, not a technical impossibility.' },
          { id: 'k2', type: 'mcq', prompt: 'The same SG3525-family PWM IC appears in both models because...', options: ['the same component family can suit different roles depending on what the rest of the design needs', "LF-3K copied SQ-1K's design exactly", 'it is the only PWM IC that exists', 'PWM ICs are never role-specific'], answer: 0, explain: 'Role, not just component identity, depends on the overall design.' },
          { id: 'k3', type: 'mcq', prompt: "Inferring a unit's capability from its components should rely on...", options: ['the pattern of components present or absent together, not any single part alone', 'a single component in isolation', 'colour and size alone', "the manufacturer's name only"], answer: 0, explain: 'Capability is a property of the whole architecture, not one isolated part.' },
        ],
        summary: [
          'SQ-1K is a simpler, single-purpose square-wave design; LF-3K adds MPPT charging, closed-loop sensing and SPWM-capable control.',
          'Each added capability in LF-3K corresponds to a specific, identifiable set of extra components absent from SQ-1K.',
          'The same component family (e.g. an SG3525-family PWM IC) can serve different roles depending on what the overall design needs from it.',
          'Architectural complexity is a real capability-versus-cost trade-off, not simply "better" versus "worse".',
        ],
        homework: {
          id: 'P4.M3.L2.hw',
          title: 'Architecture comparison practice',
          brief: 'Apply capability-to-architecture-pattern reasoning.',
          tasks: [{ id: 'h1', type: 'mcq', prompt: 'A unit with no current sensor, no voltage-sense module and a single fixed-function PWM IC is architecturally closest to...', options: ['the simpler SQ-1K design', 'the more complex LF-3K design', 'neither; this combination is impossible', 'a design with MPPT charging'], answer: 0, explain: 'The absence of sensing and programmable control points to the simpler architecture.' }],
          written: [{ prompt: 'A customer asks why they should pay more for a hybrid (LF-3K-style) inverter instead of a cheaper square-wave (SQ-1K-style) unit, if "they both just turn DC into AC". Using this lesson’s comparison, explain what the extra cost is actually paying for.', model: "Both designs do convert DC to AC, but the extra cost of a hybrid-style unit pays for specific, identifiable additional capabilities that a square-wave design cannot provide: an MPPT charging stage (with its own IGBTs, PV terminals, fuse and breaker) that lets the unit charge efficiently from a solar array rather than requiring a separate charge controller; closed-loop current and voltage sensing that allows the unit to regulate and protect itself actively rather than running open-loop; and a microcontroller-based control system capable of generating SPWM, which produces a much cleaner, sine-shaped output waveform suited to sensitive electronics, compared with a square-wave design's simpler, harsher output. The price difference is not arbitrary — it reflects a real, traceable set of extra components and capabilities, each serving a specific function the simpler design was never built to provide." }],
        },
      },
    },
  ],
  quiz: {
    pass: 0.8,
    questions: [
      { id: 'q1', type: 'mcq', prompt: 'The most reliable single component identification cue, when legible, is...', options: ['the printed marking or datecode', 'package shape alone', 'circuit position alone', 'colour'], answer: 0, explain: 'Marking is specific; package and position can be shared across device types.' },
      { id: 'q2', type: 'mcq', prompt: 'A confidently WRONG identification is costly mainly because...', options: ['it leads to the wrong test procedure or replacement part', 'it is slower than correct identification', 'it has no real consequence', 'it only affects a score, never real repair work'], answer: 0, explain: 'Wrong identification causes real downstream compatibility failures.' },
      { id: 'q3', type: 'mcq', prompt: 'SQ-1K lacks an MPPT charger stage mainly because...', options: ['it is a simpler, single-purpose design', 'MPPT is technically impossible on any square-wave unit', 'it has no power board', 'IGBTs cannot be manufactured'], answer: 0, explain: 'A deliberate scope and cost decision.' },
      { id: 'q4', type: 'mcq', prompt: 'The same PWM IC family appearing in both models shows that...', options: ['the same component can suit different roles depending on the overall design', 'LF-3K is a copy of SQ-1K', 'PWM ICs are never role-specific', 'this is a design error'], answer: 0, explain: 'Role depends on what the rest of the design needs, not the component alone.' },
      { id: 'q5', type: 'mcq', prompt: "Inferring a unit's capability should rely on...", options: ['the pattern of components present or absent together', 'one isolated component', 'colour and size', "the manufacturer's name"], answer: 0, explain: 'Capability is a property of the whole architecture.' },
    ],
  },
  practicals: [
    { id: 'P4.M3.P1', title: 'Component identification challenge', description: 'Identify at least 20 real inverter components by sight, under time pressure.', link: to.lab3d('Identification challenge', 'lf3k'), evidence: { kind: 'activity', id: 'lab3d:identify' } },
  ],
}
