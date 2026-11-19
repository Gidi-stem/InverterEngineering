import type { AcademyModule } from '../types'
import { to } from '../s1/links'

/** P4.M1 Architecture tour. */
export const P4_M1: AcademyModule = {
  id: 'P4.M1',
  title: 'Architecture tour',
  summary: 'A guided tour of a real inverter\'s five functional areas in the 3D Dissection Laboratory: enclosure and terminals, power stage, magnetics, control electronics, and protection and sensing.',
  lessons: [
    {
      id: 'P4.M1.L1',
      title: 'Enclosure, terminals and earthing',
      minutes: 25,
      content: {
        objectives: [
          'Identify an inverter\'s enclosure, battery/PV/AC terminals and protective earth stud in the 3D laboratory.',
          'Explain why the protective earth connection is always the last removed and the first reconnected.',
          'Relate each terminal to the component family it belongs to, from F1 and F4.',
        ],
        introduction: `This module is a guided tour through a real inverter's internal architecture, using the two model inverters (LF-3K and SQ-1K) in the 3D Dissection Laboratory. This first lesson starts at the outside: the enclosure, its external terminals, and the [[protective-earth|protective earth]] connection that ties the whole chassis to a safe reference.`,
        lecture: `### The enclosure as a safety boundary, not just a box

An inverter's enclosure is not simply a container — it is the first line of defence between hazardous internal voltages (the DC bus, F1.M2) and anyone nearby. Opening the LF-3K model in the laboratory, you will find the cover held by multiple screws and bonded to the chassis by an earth strap, exactly matching the removal sequence F1 taught: isolate, discharge, THEN open the cover, never the reverse.

### External terminals, by family

Walking the terminal block, each terminal corresponds to a component family you met in F1 and F4: battery terminals (+ and −, bolted, torque-specified, F4.M5.L4), a battery [[fuse|fuse]] (F4.M4.L1) in series with the positive terminal, PV input terminals (for a solar-capable model), a DC [[breaker|circuit breaker]] (F4.M4.L2), and AC output terminals (L, N, PE). Each of these is a real, separately testable part in the Component Library (F4) — the 3D laboratory shows you WHERE it physically sits and how it connects to everything else, which a library entry alone cannot.

### Why the earth connection is special

The [[protective-earth|protective earth (PE)]] stud is wired to bond the chassis, the enclosure and every earthed terminal to one common reference. In the removal sequence, PE is deliberately the LAST connection removed when disassembling and the FIRST reconnected when reassembling — this way, every other part of the chassis remains earthed throughout the entire procedure except for the briefest possible window, minimising the time any metal part could become unexpectedly live relative to the technician.`,
        technical: `**Earth continuity, not just presence.** A visibly connected earth strap is not sufficient on its own — F1's earth-continuity testing (a low-resistance check between the PE stud and every bonded metal part) is what actually confirms the bond is doing its job, exactly the same test procedure used on real equipment before it is ever considered safe to work on.

**Terminal torque and the lesson this module revisits.** Every bolted terminal here (battery, DC input, AC output) is exactly the class of joint F4.M5.L4 covered: specified torque, and a voltage-drop-under-load check as the real-world way to confirm it is still sound after use, not a one-time install check.`,
        diagrams: [{ id: 'risk-hierarchy', caption: 'The enclosure and earth bond as the outermost layer of an inverter\'s defence, with each external terminal mapped to the component family it belongs to.' }],
        formulas: [{ name: 'Earth continuity (concept)', expr: 'R_bond should read a small fraction of an ohm, end to end, confirmed by a dedicated low-resistance test', where: [], note: 'A qualitative pass/fail check, not a calculated value — see F1\'s earth-continuity procedure.' }],
        examples: [
          {
            title: 'Reasoning about removal order',
            problem: 'A technician removes the PE stud before disconnecting the battery terminals, to "get it out of the way first". Explain why this is the wrong order.',
            steps: ['Removing PE first leaves the chassis and every other still-connected part without its earth reference for the entire remainder of the procedure, not just a brief moment', 'The battery and any other live source remain connected throughout this extended unearthed window'],
            answer: 'This maximises, rather than minimises, the time the chassis is unearthed while still potentially live — PE should be removed LAST (after every source is isolated and discharged) and reconnected FIRST, keeping the unearthed window as short as possible.',
          },
          {
            title: 'Matching a terminal to its component family',
            problem: 'While touring the LF-3K model, you find a bolted terminal block labelled "DC IN" near a MEGA-style fuse. Which F4 component families does this terminal and its neighbour belong to?',
            steps: ['The terminal block itself is a DC input/battery-terminal type component (F4.M5.L4 testing)', 'The neighbouring part is a fuse, protecting that DC input circuit (F4.M4.L1)'],
            answer: 'A DC-input terminal (tested by voltage-drop-under-load, F4.M5.L4) in series with a protective fuse (I²t and breaking-capacity rated, F4.M4.L1) — exactly the pairing F4 taught in theory, now seen as a real physical assembly.',
          },
        ],
        applications: `Every terminal and the earth stud you identify here is the same physical part, and the same test procedure, you met in F1's safety drills and F4's component modules — this lesson is where that knowledge becomes a real, located, three-dimensional object.`,
        mistakes: [
          { mistake: 'Treating the enclosure as just a cosmetic cover.', correction: 'It is a deliberate safety boundary, and its removal sequence (isolate, discharge, then open) is not optional ceremony.' },
          { mistake: 'Removing the earth connection early "to get it out of the way".', correction: 'PE must be the LAST connection removed and the FIRST reconnected, minimising the unearthed window.' },
          { mistake: 'Assuming a visibly intact earth strap means the bond is electrically sound.', correction: 'A dedicated continuity test, not visual inspection, confirms the earth bond is actually doing its job.' },
        ],
        demo: { title: 'Tour the enclosure and terminals', text: 'Open the LF-3K model and identify each external terminal and the earth stud.', link: to.lab3d('Enclosure and terminals', 'lf3k', 'enclosure') },
        activities: [to.lab3d('Enclosure and terminals', 'lf3k', 'enclosure'), to.lab3d('Protective earth stud', 'lf3k', 'pe'), to.proc('Battery terminal check', 'battery-terminals', 'terminal-drop')],
        check: [
          { id: 'k1', type: 'mcq', prompt: 'The protective earth connection is removed...', options: ['last, and reconnected first', 'first, and reconnected last', 'at any convenient point in the sequence', 'only if the model has a battery'], answer: 0, explain: 'Minimising the unearthed window is the whole point of this sequencing.' },
          { id: 'k2', type: 'mcq', prompt: 'A visibly connected earth strap...', options: ['still needs a continuity test to confirm it is electrically sound', 'is always electrically sound by inspection alone', 'is never tested in practice', 'replaces the need for isolation before opening the cover'], answer: 0, explain: 'Visual inspection alone does not confirm low-resistance continuity.' },
          { id: 'k3', type: 'mcq', prompt: 'A DC input terminal block paired with a fuse in series represents...', options: ['a terminal (F4.M5.L4) protected by a fuse (F4.M4.L1), the same pairing taught in F4', 'two unrelated, coincidental parts', 'a single component with two names', 'a fault condition'], answer: 0, explain: 'This is the standard, intentional terminal/fuse pairing.' },
        ],
        summary: [
          'The enclosure is a deliberate safety boundary, removed only after isolation and discharge.',
          'External terminals (battery, fuse, PV, breaker, AC output) each correspond to a real, separately testable F4 component family.',
          'The protective earth connection is removed last and reconnected first, minimising the time the chassis is unearthed.',
          'A continuity test, not visual inspection, is what actually confirms an earth bond is sound.',
        ],
        homework: {
          id: 'P4.M1.L1.hw',
          title: 'Enclosure and terminal identification',
          brief: 'Apply the removal-order and terminal-family reasoning.',
          tasks: [{ id: 'h1', type: 'mcq', prompt: 'Which is removed first when disassembling: the cover, or the PE stud?', options: ['The cover', 'The PE stud', 'Both simultaneously', 'Neither is ever removed'], answer: 0, explain: 'PE stays connected until every other disconnection is complete.' }],
          written: [{ prompt: 'Explain, in your own words, why a technician who is confident the battery is already disconnected still should not remove the PE stud early "since the battery is safe anyway".', model: 'The earth bond\'s purpose is not limited to protecting against the battery specifically — it protects against ANY unexpected voltage appearing on the chassis, including from a fault, a miswired connection, or a source the technician did not anticipate (such as back-feed through the AC output terminals). Removing PE early removes this general safety margin for the rest of the procedure, regardless of how confident the technician is about the battery alone — the earth bond is protection against the unexpected, not just against the one source that has been checked.' }],
        },
      },
    },
    {
      id: 'P4.M1.L2',
      title: 'The power stage',
      minutes: 30,
      content: {
        objectives: [
          'Identify the MOSFETs, IGBT, gate drivers, bus capacitors and relay on a real power board.',
          'Relate each identified part\'s physical placement to its electrical role from F4.M2.',
          'Explain why the power-board layout places switches directly against the heat sink.',
        ],
        introduction: `Having toured the outside of the inverter, this lesson moves to its functional heart: the [[pcb|power board]], where the [[mosfet|MOSFETs]], [[igbt|IGBT]], [[gate-driver|gate drivers]] and bus capacitors you studied in F4.M2 sit as real, physical, soldered parts.`,
        lecture: `### Reading a real power board

The LF-3K model's main PCB carries six power switches silkscreened Q1–Q6: four MOSFETs (Q1–Q4, forming the H-bridge legs) and two IGBTs (Q5–Q6, in the MPPT charger stage) — exactly the device-family split F4.M2.L4/L5 explained: MOSFETs where switching speed dominates, an IGBT-friendly stage where a different voltage/frequency trade-off applies. Alongside them sit three gate drivers (U2–U4, F4.M2.L6), one per switching leg, placed as close as practical to their respective gates to minimise stray inductance in the drive path.

### Bus capacitors, bleeders and the relay

Six capacitors (C1–C6) form the battery-bus and PV-bus smoothing banks (F4.M1.L2), each sized for its own voltage domain; two bleeder resistors (F4.M1.L1, F1.M2) sit across the higher-voltage bank specifically to discharge it safely after power-off. A relay (K1, F4.M4.L3) handles output/transfer switching — a job suited to a relay's isolation and low conduction loss rather than a semiconductor switch, exactly the reasoning F4.M4.L4 compared directly.

### Why switches are clamped to the heat sink

Every one of the six power switches is physically clamped to the main heat sink, not merely placed near it — F4.M5.L3's thermal-resistance path (junction → case → sink → ambient) only works if the THERMAL contact between device and sink is as good as the removal note warns: "all six power switches are clamped to it and must be unclamped first" before the heat sink itself can come out. This clamping is a mechanical requirement of the thermal design, not an assembly convenience.`,
        technical: `**Hall-effect current sensor placement.** The CT1 Hall sensor is soldered with the main battery busbar passing directly through its aperture (F4.M5.L2) — a physical arrangement that lets it sense current without breaking the circuit or adding series resistance, visibly demonstrating the isolation advantage F4.M5.L2 described in theory.

**DC input lugs soldered directly to the board.** Unlike a separate terminal block, this board's DC input lugs (J1) are soldered straight into the PCB — meaning a high-resistance joint here (F4.M5.L4) would show up as PCB heat damage around the lugs themselves, not just a loose connector, a detail worth knowing before inspecting a real board for heat damage.`,
        diagrams: [{ id: 'hbridge-states', caption: 'The power board\'s six switches (four MOSFETs, two IGBTs), their gate drivers, and the bus capacitors and relay around them, mapped to their F4.M2/M4 electrical roles.' }],
        formulas: [{ name: 'Removal dependency (concept)', expr: 'Switches must be unclamped before the heat sink can be removed; the heat sink must be freed before the board beneath it is accessible', where: [], note: 'A removal-ORDER relationship, not a numeric formula — see P4.M2 for the full disassembly sequence this constrains.' }],
        examples: [
          {
            title: 'Matching silkscreen labels to device families',
            problem: 'The board\'s silkscreen shows Q1–Q4 near one driver group and Q5–Q6 near another. Based on F4.M2, what is the most likely reason these are split into two groups rather than six identical switches?',
            steps: ['F4.M2.L4/L5 explained that MOSFETs and IGBTs suit different voltage/frequency trade-offs', 'A board with both an H-bridge (needing fast, repeated switching) and an MPPT charger stage (often at different voltage/frequency requirements) would plausibly use the device best suited to each stage rather than one device type for both'],
            answer: 'Q1–Q4 (MOSFETs) likely serve the H-bridge, where switching speed matters most; Q5–Q6 (IGBTs) likely serve the MPPT charger stage, where the IGBT\'s conduction-loss advantage at its operating voltage is the better fit — exactly the selection reasoning F4.M2.L5 taught.',
          },
          {
            title: 'Why the heat sink cannot be removed first',
            problem: 'A new technician tries to remove the heat sink before unclamping the power switches. Explain why this fails and what it reveals about the thermal design.',
            steps: ['The switches are physically clamped TO the heat sink, not merely resting near it', 'Removing the heat sink while switches remain clamped would mean trying to pull the switches\' thermal contact apart forcibly, risking damage to both'],
            answer: 'The clamping must be released first — this removal dependency exists precisely BECAUSE the thermal design relies on firm, continuous mechanical contact between each switch and the heat sink (F4.M5.L3); it is not an arbitrary assembly order.',
          },
        ],
        applications: `This lesson is the direct physical counterpart of F4.M2 (semiconductor devices) and F4.M4.L3 (relays) — the Repair Workshop's MOSFET and gate-driver scenarios are diagnosing faults on exactly this kind of real board layout.`,
        mistakes: [
          { mistake: 'Assuming every power switch on a real board is the same device type.', correction: 'A real design commonly mixes MOSFETs and IGBTs, each where its own strengths suit a different stage of the circuit.' },
          { mistake: 'Treating the heat sink as removable independently of the switches clamped to it.', correction: 'The clamping is a genuine mechanical thermal-design requirement; switches must be unclamped before the heat sink can come free.' },
          { mistake: 'Overlooking the gate drivers\' placement as incidental.', correction: 'Drivers are placed close to their respective gates deliberately, to minimise stray inductance in the drive path (F4.M2.L6).' },
        ],
        demo: { title: 'Tour the power board', text: 'Identify the MOSFETs, IGBT, gate drivers and bus capacitors on the LF-3K power board.', link: to.lab3d('Power board', 'lf3k', 'pcb-main') },
        activities: [to.lab3d('Power switches', 'lf3k', 'q1'), to.lab3d('Gate drivers', 'lf3k', 'u2'), to.lab3d('Bus capacitors', 'lf3k', 'c1'), to.lib('MOSFET', 'mosfet')],
        check: [
          { id: 'k1', type: 'mcq', prompt: 'A real power board mixing MOSFETs and IGBTs most likely reflects...', options: ['each device family being used where its own strengths suit a different stage of the circuit', 'a manufacturing error', 'random component selection', 'cost-cutting with no technical reason'], answer: 0, explain: 'Deliberate selection per F4.M2\'s device-comparison reasoning.' },
          { id: 'k2', type: 'mcq', prompt: 'Power switches are clamped directly to the heat sink because...', options: ['good thermal contact is a mechanical requirement of the cooling design', 'it is easier to solder them that way', 'it has no real purpose', 'it reduces their electrical rating'], answer: 0, explain: 'Firm mechanical contact is what makes the thermal-resistance path work.' },
          { id: 'k3', type: 'mcq', prompt: 'A Hall-effect current sensor with the busbar passing through its aperture demonstrates...', options: ['current sensing without breaking the circuit or adding series resistance', 'a wiring fault', 'a shunt-resistor sensing method', 'a voltage-sensing method'], answer: 0, explain: 'This is the Hall-effect isolation advantage from F4.M5.L2, seen physically.' },
        ],
        summary: [
          'A real power board mixes MOSFETs and IGBTs, each placed where its own electrical strengths suit that stage of the circuit.',
          'Gate drivers sit close to their respective switches to minimise stray inductance in the drive path.',
          'Bus capacitors and bleeder resistors are sized per voltage domain, exactly as F4.M1 described.',
          'Power switches are mechanically clamped to the heat sink, a genuine thermal-design requirement that constrains disassembly order.',
        ],
        homework: {
          id: 'P4.M1.L2.hw',
          title: 'Power board identification practice',
          brief: 'Apply device-family and thermal-design reasoning to the power board.',
          tasks: [{ id: 'h1', type: 'mcq', prompt: 'Before the heat sink can be removed from a real power board, what must happen first?', options: ['The power switches clamped to it must be unclamped', 'The battery must be reconnected', 'The gate drivers must be re-soldered', 'Nothing; it lifts out freely at any time'], answer: 0, explain: 'Clamped switches must be freed before the heat sink itself is removable.' }],
          written: [{ prompt: 'A technician identifies six power switches on a board and assumes, without checking further, that all six must be MOSFETs since "that\'s the most common power switch". Explain why this assumption could lead to an incorrect replacement if one of them fails.', model: 'A real board can deliberately mix MOSFETs and IGBTs across different stages (F4.M2.L4/L5), so assuming every switch is the same device type without checking its actual marking or datasheet risks sourcing and fitting the wrong replacement part entirely — a MOSFET fitted where an IGBT belonged (or vice versa) would likely have mismatched ratings, gate-drive characteristics, and conduction-loss behaviour, exactly the compatibility failure F4.M2.L10 warned against. Correctly identifying each specific device, not assuming uniformity, is essential before any replacement.' }],
        },
      },
    },
    {
      id: 'P4.M1.L3',
      title: 'Magnetics',
      minutes: 25,
      content: {
        objectives: [
          'Identify the transformer, output inductor and output filter capacitor on a real power board.',
          'Relate their physical size and mounting to the design considerations from F4.M3.',
          'Explain why the transformer is one of the last parts removed in disassembly.',
        ],
        introduction: `This lesson tours the [[transformer|transformer]], output inductor and output filter capacitor — the magnetic components of F4.M3, now seen as real, substantial physical parts rather than symbols on a schematic.`,
        lecture: `### The transformer: seen and felt

The LF-3K model's transformer (T1) is an EI-core, line-frequency design rated 3 kVA, 30/230 V — and its removal note states its mass directly: roughly 25 kg, requiring two hands and four clamp-foot bolts to remove. This is F4.M3.L2's LF-versus-HF size comparison made completely concrete: a line-frequency transformer really is this large and heavy for its power rating, which is exactly why an HF-link design (achieving the same power transformation with a small ferrite core) is so much lighter in practice, not just in theory.

### The output filter: inductor and capacitor together

Immediately after the transformer's secondary comes the output filter: a toroidal inductor (L1, rated 1.2 mH, 15 A) and a film capacitor (C7, rated 10 µF, 275 V AC) — the exact LC pairing F4.M3.L3 described, sized together to set a corner frequency that passes the 50 Hz fundamental while attenuating switching-frequency content. Their physical ordering on the board — transformer, then inductor, then capacitor, following the actual current path — mirrors the signal-flow order you would trace on a schematic.

### Why the transformer comes out near-last

The transformer's own removal note explains the dependency directly: its leads connect to the output filter, which must be removed first, and only then can the transformer itself — the heaviest part — be lifted out. This is a genuine structural/electrical dependency (the filter parts are wired to the transformer and must be disconnected before it can move), not an arbitrary sequencing choice, and it is exactly the kind of removal-order reasoning P4.M2 will formalise into a complete disassembly sequence.`,
        technical: `**Core material, visibly.** The EI-core geometry (laminated steel, F4.M3.L2) is visually distinct from the output inductor's toroidal ferrite/powder core — two different core technologies, chosen for two different jobs (line-frequency isolation versus high-frequency-content filtering), sitting a few centimetres apart on the same board.

**Why the output capacitor is a film type, not electrolytic.** The output filter capacitor is specifically a film capacitor (F4.M1.L2), not an electrolytic — film types tolerate the AC ripple current and reversing voltage at the switching/output frequency far better than a polarised electrolytic would, which is why this specific capacitor family is used at exactly this point in the circuit.`,
        diagrams: [{ id: 'lc-filter', caption: 'The transformer, output inductor and output filter capacitor in physical sequence on the power board, mirroring the signal-flow order of F4.M3\'s LC filter stage.' }],
        formulas: [{ name: 'Removal dependency (concept)', expr: 'Output filter parts (inductor, capacitor) must be disconnected before the transformer, which they are wired to, can be lifted free', where: [] }],
        examples: [
          {
            title: 'Relating mass to transformer technology',
            problem: 'The LF-3K\'s transformer is rated 3 kVA and weighs roughly 25 kg. Using F4.M3.L2\'s reasoning, estimate (qualitatively, not numerically) how an equivalent-power HF-link design\'s magnetics would compare in mass.',
            steps: ['F4.M3.L2 explained that HF transformer size falls sharply as switching frequency rises, for the same power, because far less flux swing per cycle is needed', 'An HF-link transformer of the same power rating would therefore need a dramatically smaller, lighter core than this 25 kg line-frequency unit'],
            answer: 'An equivalent-power HF-link design\'s transformer would be expected to weigh a small fraction of 25 kg — this real part\'s mass is a direct, physical demonstration of the LF-versus-HF trade-off F4.M3.L2 covered in theory.',
          },
          {
            title: 'Why film, not electrolytic, at the output filter',
            problem: 'Explain why the output filter capacitor (C7) is a film type rather than the electrolytic type used for the DC bus capacitors elsewhere on the board.',
            steps: ['The output filter capacitor sees AC ripple current and a reversing (AC-like) voltage at the output/switching frequency', 'An electrolytic capacitor is polarised and generally tolerates AC/reversing voltage and high ripple current poorly compared with a film type (F4.M1.L2)'],
            answer: 'A film capacitor is selected specifically because it tolerates the reversing voltage and AC ripple current at this point in the circuit far better than an electrolytic would — matching the capacitor type to its actual operating conditions, not just its capacitance value.',
          },
        ],
        applications: `The transformer-versus-inductor comparison guide and the magnetics-related Repair Workshop scenarios both draw directly on exactly this physical layout and reasoning.`,
        mistakes: [
          { mistake: 'Assuming the transformer can be removed as soon as its mounting bolts are visible.', correction: 'Its leads connect to the output filter, which must be disconnected first — a genuine wiring dependency, not just a bolt-removal order.' },
          { mistake: 'Treating all capacitors on a board as interchangeable once their capacitance value matches.', correction: 'Capacitor TYPE (film versus electrolytic) must match the actual operating conditions (AC ripple, reversing voltage) at that specific point in the circuit.' },
          { mistake: 'Assuming a transformer\'s size is simply a manufacturing choice unrelated to its switching frequency.', correction: 'Size scales directly with required flux swing per cycle, which is set by operating frequency — this is physics, not an arbitrary design preference.' },
        ],
        demo: { title: 'Tour the magnetics', text: 'See the transformer, output inductor and filter capacitor on the LF-3K power board.', link: to.lab3d('Transformer and output filter', 'lf3k', 't1') },
        activities: [to.lab3d('Transformer', 'lf3k', 't1'), to.lab3d('Output inductor', 'lf3k', 'l1'), to.cmp('Transformer vs inductor', 'transformer-vs-inductor')],
        check: [
          { id: 'k1', type: 'mcq', prompt: 'The LF-3K transformer\'s substantial mass (~25 kg) for 3 kVA directly illustrates...', options: ['why line-frequency transformers are much larger than HF-link designs of equal power', 'a manufacturing defect', 'an oversized, poorly designed part', 'nothing relevant to F4.M3'], answer: 0, explain: 'Mass is a direct physical consequence of operating at line frequency.' },
          { id: 'k2', type: 'mcq', prompt: 'The output filter capacitor is a film type rather than electrolytic because...', options: ['it must tolerate AC ripple current and reversing voltage at this point in the circuit', 'film capacitors are always cheaper', 'electrolytics cannot be used anywhere in an inverter', 'capacitance value is the only consideration'], answer: 0, explain: 'Capacitor type must match actual operating conditions.' },
          { id: 'k3', type: 'mcq', prompt: 'The transformer is removed near-last in the disassembly sequence because...', options: ['its leads connect to the output filter, which must be disconnected first', 'it is the lightest part on the board', 'it has no electrical connections', 'removal order has no real constraint here'], answer: 0, explain: 'A genuine wiring dependency, not an arbitrary choice.' },
        ],
        summary: [
          'The transformer\'s substantial physical size and mass directly demonstrate the LF-versus-HF trade-off F4.M3.L2 covered in theory.',
          'The output inductor and filter capacitor sit immediately after the transformer, mirroring the LC filter\'s actual signal-flow order.',
          'The output filter capacitor is a film type specifically because it tolerates AC ripple and reversing voltage better than an electrolytic.',
          'The transformer\'s removal depends on first disconnecting the output filter parts wired to it — a genuine structural dependency.',
        ],
        homework: {
          id: 'P4.M1.L3.hw',
          title: 'Magnetics identification practice',
          brief: 'Apply LF/HF and capacitor-type reasoning to the real board.',
          tasks: [{ id: 'h1', type: 'mcq', prompt: 'An output filter capacitor seeing AC ripple and reversing voltage should be a...', options: ['film capacitor', 'electrolytic capacitor', 'ceramic capacitor only', 'any capacitor type, it makes no difference'], answer: 0, explain: 'Film capacitors tolerate these conditions far better than electrolytics.' }],
          written: [{ prompt: 'A student argues that since the transformer and the output inductor are both "magnetic components", they could be removed in either order without consequence. Explain why the actual wiring dependency makes this incorrect.', model: 'Being in the same general category (magnetic components, F4.M3) does not mean two parts are interchangeable in a removal sequence — what matters is their actual WIRING relationship, not their component family. Here, the output inductor and filter capacitor are wired directly to the transformer\'s secondary leads, so the transformer cannot be freed and lifted out until those connections are disconnected; attempting to remove the transformer first would mean pulling on wires still attached to the inductor and capacitor, risking damage to the connections or the parts themselves. The correct removal order follows the actual electrical dependency, not a generic grouping by component category.' }],
        },
      },
    },
    {
      id: 'P4.M1.L4',
      title: 'Control electronics',
      minutes: 25,
      content: {
        objectives: [
          'Identify the microcontroller, PWM controller, voltage-sense module and display board on a real control board.',
          'Relate each part\'s physical connection (ribbon cable, header pins, solder) to how it is removed and tested.',
          'Explain why the control board sits above the power board\'s cable path in the removal sequence.',
        ],
        introduction: `This lesson tours the [[microcontroller|microcontroller]], [[pwm-controller|PWM controller]] and voltage-sensing module — the control electronics of F4.M5.L1-L2 — together with the display board, as real parts on their own dedicated control board.`,
        lecture: `### Two control philosophies, side by side

The LF-3K model's control board carries BOTH control philosophies F4.M5.L1 compared: a 32-bit microcontroller (U6, fine-pitch LQFP64 package, running firmware) handling the main inversion control, and a dedicated PWM controller IC (U1, a through-hole DIP-16 SG3525-family part) handling the simpler MPPT charger stage — exactly the "use the right tool for each job" reasoning F4.M5.L1 taught, now visible as two different IC packages doing two different control jobs on the same board.

### Connection types tell you how a part is removed and tested

Different parts connect differently, and this directly determines how they come off: the microcontroller and PWM controller are soldered (the MCU fine-pitch, the PWM controller in a socket), the voltage-sense module is a plug-in unit on header pins (unplug its high-voltage sense leads first, since it floats at a different reference, F4.M5.L2's isolation discussion), and the display board connects via a ribbon cable with a latch (release the latch, don't pull the ribbon). Reading a part's connection type before touching it is the real-world equivalent of checking a datasheet before testing a component out of circuit (F4.M2.L8).

### Why the control board comes off before the power board

The removal sequence takes the control board's own components off first (voltage-sense module unplugged, MCU and PWM controller noted for inspection), then the control board itself, specifically because it sits ABOVE the power board's cable path — leaving it in place would block access to what is underneath. This is a spatial, not electrical, constraint, but it is just as real a dependency as the transformer/output-filter wiring dependency from P4.M1.L3.`,
        technical: `**Isolated programmer for firmware work.** If the microcontroller's firmware needs reading or reprogramming on real equipment, an isolated programmer is required, since the control ground may sit at battery potential rather than earth — a safety detail directly tied to F4.M5.L1's point that the control path is not automatically isolated from the power stage.

**A blank display is not necessarily a display fault.** The display board's own test procedure (F4.M5) checks its supply voltage AND its serial communication separately — a blank display with healthy supply voltage points to a communication fault (cable or MCU) rather than the display board itself, exactly the "check the sensor/signal before assuming the obvious part" discipline F4.M5.L2 taught for current sensors.`,
        diagrams: [{ id: 'feedback-loop', caption: 'The microcontroller and PWM controller on the control board implementing the closed feedback loop of F4.M5.L1, alongside the voltage-sense module and display board.' }],
        formulas: [{ name: 'Removal dependency (concept)', expr: 'Control-board components are removed, then the control board itself, before the power board beneath it becomes accessible', where: [] }],
        examples: [
          {
            title: 'Why two different control ICs appear on one board',
            problem: 'Explain, using F4.M5.L1, why this board uses a microcontroller for the main inversion control but a simpler dedicated PWM IC for the charger stage, rather than one microcontroller doing both jobs.',
            steps: ['F4.M5.L1 explained that a dedicated PWM IC offers simple, predictable, fixed-function control with no firmware risk', 'The charger stage is plausibly a simpler, more fixed function than the main inversion control, which benefits from the microcontroller\'s flexibility'],
            answer: 'Using a dedicated PWM IC for the simpler, fixed-function charger stage avoids adding unnecessary firmware complexity and risk there, while reserving the microcontroller\'s flexibility for the main control function that actually needs it — matching each control philosophy to the job it suits, exactly as F4.M5.L1 argued in the abstract.',
          },
          {
            title: 'Diagnosing a blank display using connection-type knowledge',
            problem: 'A display is blank. Its ribbon cable is confirmed properly latched. What should be checked next, and why, rather than assuming the display board itself has failed?',
            steps: ['The display\'s own test procedure checks supply voltage and serial communication as two SEPARATE steps', 'A properly latched cable with power present but no communication points toward a communication-path or MCU fault, not necessarily the display hardware'],
            answer: 'Check the supply voltage at the display board connector first, then look for serial activity on the data line with a scope — only if BOTH are healthy and the display is still blank does the display board itself become the more likely suspect, rather than being assumed first.',
          },
        ],
        applications: `This lesson is the physical counterpart of F4.M5.L1-L2, and the Repair Workshop's gate-driver-signal-lost scenario traces a fault through exactly this kind of control-board layout.`,
        mistakes: [
          { mistake: 'Assuming a board with both a microcontroller and a dedicated PWM IC has one redundant/unnecessary control chip.', correction: 'Each handles a different function, matched to the control philosophy (flexible firmware vs simple fixed-function) that function actually needs.' },
          { mistake: 'Pulling a ribbon cable free without releasing its latch first.', correction: 'A half-seated or forcibly removed ribbon connection is a known, preventable cause of exactly the blank-display symptom this lesson discusses.' },
          { mistake: 'Diagnosing a blank display as a display-board fault before checking its supply and communication separately.', correction: 'The display\'s own healthy-vs-faulty readings are split across two independent checks — jumping to "replace the display" skips evidence that would narrow the actual cause.' },
        ],
        demo: { title: 'Tour the control board', text: 'Identify the microcontroller, PWM controller, voltage-sense module and display board.', link: to.lab3d('Control board', 'lf3k', 'u6') },
        activities: [to.lab3d('Microcontroller', 'lf3k', 'u6'), to.lab3d('PWM controller', 'lf3k', 'u1'), to.lab3d('Display board', 'lf3k', 'disp'), to.proc('Display board check', 'display-board', 'display-check')],
        check: [
          { id: 'k1', type: 'mcq', prompt: 'This board uses both a microcontroller and a dedicated PWM IC because...', options: ['each control philosophy is matched to the specific job it suits best', 'one of them is redundant and unused', 'microcontrollers cannot generate PWM at all', 'dedicated PWM ICs cannot be used alongside microcontrollers'], answer: 0, explain: 'Deliberate matching of control technology to function, per F4.M5.L1.' },
          { id: 'k2', type: 'mcq', prompt: 'A blank display with confirmed-healthy supply voltage and a properly latched cable most likely points to...', options: ['a serial communication fault', 'definitely a failed display board', 'a power-stage MOSFET fault', 'normal operation'], answer: 0, explain: 'Supply and communication are separately tested; a healthy supply shifts suspicion toward communication.' },
          { id: 'k3', type: 'mcq', prompt: 'The control board is removed before the power board beneath it mainly because...', options: ['it physically sits above the power board\'s cable path, blocking access', 'it has no electrical connections', 'the power board is never actually removed', 'removal order has no constraint here'], answer: 0, explain: 'A spatial access dependency, not an electrical one.' },
        ],
        summary: [
          'A real control board can carry both a flexible microcontroller and a simple dedicated PWM IC, each matched to the function it suits.',
          'Each part\'s connection type (soldered, plug-in header, ribbon cable) determines how it is safely removed and tested.',
          'A blank display is diagnosed by checking supply and communication separately, not assumed to be a display-board fault.',
          'The control board\'s removal before the power board reflects a spatial access dependency, distinct from the electrical dependencies seen in P4.M1.L3.',
        ],
        homework: {
          id: 'P4.M1.L4.hw',
          title: 'Control electronics identification practice',
          brief: 'Apply connection-type and fault-separation reasoning.',
          tasks: [{ id: 'h1', type: 'mcq', prompt: 'A voltage-sense module\'s high-voltage sense leads should be unplugged...', options: ['before the module itself is removed from its header pins', 'only after the module is already removed', 'never, it is permanently soldered', 'at the very end of the whole disassembly'], answer: 0, explain: 'The module floats at a different reference; its sense leads come off first.' }],
          written: [{ prompt: 'A technician sees a microcontroller and a separate PWM controller IC on the same board and assumes the PWM controller is a legacy leftover from an older design that the microcontroller has since made redundant. Explain why this assumption is not safe to act on without further investigation.', model: 'Two control ICs coexisting on a board is not, by itself, evidence that one is obsolete — F4.M5.L1 explained that a dedicated PWM IC is often deliberately retained for a specific, simpler, fixed-function role (such as a charger stage) precisely because it avoids the firmware complexity and risk a microcontroller would add there, even in a design whose main control is otherwise microcontroller-based. Removing or disabling the PWM controller on the assumption that it is redundant, without first confirming what function it actually serves in this specific board\'s design, risks disabling a function the microcontroller was never intended to handle.' }],
        },
      },
    },
    {
      id: 'P4.M1.L5',
      title: 'Protection and sensing',
      minutes: 25,
      content: {
        objectives: [
          'Identify the fuse, breaker, current sensor and voltage-sense module as a coordinated protection/sensing layer.',
          'Relate their physical placement to the feedback and protection reasoning from F4.M4-M5.',
          'Explain why protection and sensing are reviewed together, not as separate, unrelated systems.',
        ],
        introduction: `This closing lesson of the architecture tour brings together the [[fuse|fuse]], [[breaker|breaker]], [[current-sensor|current sensor]] and voltage-sense module as one coordinated system — protection (F4.M4) and sensing/feedback (F4.M5.L1-L2) are physically distributed across the board, but functionally they work together.`,
        lecture: `### Protection devices, located

The battery fuse sits in series with the positive battery terminal, immediately downstream of the terminal block — exactly where F4.M4.L1 would place it, as close as practical to the source it protects. The DC breaker sits on the PV input path, where its resettable nature (F4.M4.L2) suits a circuit that may trip occasionally from normal PV-related transients without needing a part replaced each time.

### Sensing, located

The Hall-effect current sensor (CT1) is positioned with the main battery busbar passing through its aperture — current sensing without adding series resistance or breaking the circuit, physically demonstrating the isolation advantage F4.M5.L2 described. The voltage-sense module sits on the control board as a plug-in unit specifically because it must handle a high-voltage reference safely isolated from the low-voltage control logic around it.

### Why protection and sensing are reviewed together

Both systems watch the SAME electrical quantities (voltage and current) for different purposes: protection devices (fuses, breakers) act independently and mechanically when a quantity exceeds a hard physical limit; sensors feed the SAME kind of quantity to the control loop (F4.M5.L1) for continuous, software-mediated correction. A fault in either can produce overlapping symptoms — F4.M5.L2 showed how a drifted sensor can mimic an overcurrent condition that looks like it should trip the breaker but is, in fact, a sensing fault the breaker never sees at all, since the breaker and the sensor are independent systems measuring the same current for different reasons.`,
        technical: `**Independence as a safety principle.** Protection devices (fuses, breakers) are deliberately independent of the control/sensing system — they trip on the ACTUAL current or voltage, regardless of whether the control loop's sensors are reporting correctly. This independence is what allows a fuse to still protect the circuit even during a sensing-path fault that has fooled the control loop into misbehaving (F4.M5.L2).

**Where this layout would show up in the Repair Workshop.** A scenario presenting "overcurrent trips with no obvious cause" on this kind of board is exactly where this lesson's protection/sensing distinction matters: confirming whether the fuse/breaker tripped from a genuine overcurrent, or whether a sensor fault misled the control loop into a behaviour that merely resembles one, is the key diagnostic fork.`,
        diagrams: [{ id: 'protection-chain', caption: 'Protection devices (fuse, breaker) and sensing devices (current sensor, voltage-sense module) watching the same electrical quantities independently, for different purposes.' }],
        formulas: [{ name: 'Independence principle (concept)', expr: 'Protection devices trip on actual current/voltage, independent of what the sensing/control system reports', where: [], note: 'A qualitative design principle, not a numeric formula — the basis of why protection still works during a sensing fault.' }],
        examples: [
          {
            title: 'Distinguishing a protection trip from a sensing fault',
            problem: 'A unit\'s breaker has tripped. Load current, measured independently with a clamp meter at the time of the trip, was well within normal range. Explain what this tells you.',
            steps: ['A breaker trips on the ACTUAL current it sees, independent of the control system\'s own sensor readings', 'If independently measured current was genuinely normal, the breaker tripping suggests either a brief transient the clamp meter missed, or a fault in the breaker itself — not a sensing fault, since the breaker does not rely on the voltage-sense/current-sense modules at all'],
            answer: 'Since the breaker is independent of the sensing system, this points toward a genuine (if possibly brief) overcurrent event or breaker fault, not a sensor-reporting fault — a useful diagnostic fork this lesson\'s independence principle makes possible.',
          },
          {
            title: 'Why a sensing fault would not stop the fuse protecting the circuit',
            problem: 'A current sensor fails and begins reporting a falsely LOW current to the control loop, causing it to drive excessive duty cycle. Explain why the circuit\'s fuse can still protect it despite this sensing fault.',
            steps: ['The fuse responds to the ACTUAL current flowing through it, from I²R heating of its own element', 'It has no electrical connection to, or dependency on, the current-sensor\'s reading at all'],
            answer: 'The fuse will still open if the actual current (now elevated because the control loop was misled into driving harder) exceeds its rating — its protection function is completely independent of the sensor fault that caused the problem in the first place, which is exactly the safety value of this independence.',
          },
        ],
        applications: `This lesson's protection/sensing distinction is directly tested by the Repair Workshop scenarios that combine an apparent overcurrent symptom with a healthy power stage — exactly the diagnostic fork this lesson sets up.`,
        mistakes: [
          { mistake: 'Assuming a tripped breaker always means the sensing/control system detected a problem correctly.', correction: 'The breaker trips independently of the sensing system — it responds to the actual current, not to what any sensor reports.' },
          { mistake: 'Assuming a sensing fault would leave the circuit unprotected.', correction: 'Protection devices (fuses, breakers) remain independently functional even during a sensing-path fault, by design.' },
          { mistake: 'Treating "protection" and "sensing" as unrelated board features with nothing in common.', correction: 'Both watch the same underlying electrical quantities, for different purposes — understanding both together, not in isolation, is what resolves overlapping fault symptoms.' },
        ],
        demo: { title: 'Tour the protection and sensing layer', text: 'Locate the fuse, breaker, current sensor and voltage-sense module together.', link: to.lab3d('Protection and sensing', 'lf3k', 'hall') },
        activities: [to.lab3d('Current sensor', 'lf3k', 'hall'), to.lab3d('Battery fuse', 'lf3k', 'fuse'), to.lab3d('PV breaker', 'lf3k', 'breaker'), to.repair('Gate-driver signal lost', 'rsc-10')],
        check: [
          { id: 'k1', type: 'mcq', prompt: 'A fuse protects a circuit...', options: ['independently of what the sensing/control system reports', 'only if the current sensor confirms the overcurrent first', 'only when the microcontroller commands it to trip', 'never, protection always requires sensing input'], answer: 0, explain: 'Fuses and breakers act on actual current, with no dependency on the sensing system.' },
          { id: 'k2', type: 'mcq', prompt: 'A current sensor reporting falsely low current while a fuse still protects the circuit demonstrates...', options: ['the independence of protection devices from the sensing/control system', 'a design flaw', 'that fuses require sensor confirmation', 'that the sensor and fuse are the same device'], answer: 0, explain: 'This independence is a deliberate, valuable safety property.' },
          { id: 'k3', type: 'mcq', prompt: 'Protection and sensing are reviewed together in this lesson because...', options: ['both watch the same underlying electrical quantities, for different purposes', 'they are actually the same device', 'protection devices do not exist on real boards', 'sensing has no relationship to the quantities protection devices watch'], answer: 0, explain: 'Shared quantities, different purposes — hence overlapping fault symptoms.' },
        ],
        summary: [
          'Protection devices (fuses, breakers) are placed close to what they protect and act independently of the sensing/control system.',
          'Sensing devices (current sensor, voltage-sense module) feed the control loop for continuous correction, a different purpose from protection.',
          'Both systems watch the same underlying electrical quantities, which is why a sensing fault can produce symptoms resembling a protection-related event.',
          'Protection devices remain functional during a sensing-path fault, by design — a genuine safety property, not a coincidence.',
        ],
        homework: {
          id: 'P4.M1.L5.hw',
          title: 'Protection and sensing reasoning practice',
          brief: 'Apply the independence principle to a short scenario.',
          tasks: [{ id: 'h1', type: 'mcq', prompt: 'A breaker trips while an independently-measured current confirms a genuine overcurrent occurred. This is most consistent with...', options: ['the protection system correctly doing its job', 'a sensing fault only', 'a display fault', 'no real event having occurred'], answer: 0, explain: 'Independent confirmation of genuine overcurrent is consistent with correct protection behaviour.' }],
          written: [{ prompt: 'Summarise, in your own words, why this lesson treats protection devices and sensing devices as two related but functionally independent systems, rather than as one combined protective function.', model: 'Protection devices (fuses, breakers) and sensing devices (current and voltage sensors) both monitor the same underlying electrical quantities, but they serve different purposes and operate through entirely different mechanisms: protection devices respond mechanically or thermally to the actual current or voltage they experience, with no dependency on any sensor reading, while sensing devices feed measurements into a software-mediated control loop for continuous correction. Treating them as functionally independent — rather than as one combined system — is what explains both why protection still works during a sensing fault, and why a sensing fault can produce symptoms that superficially resemble a protection event without actually being one; conflating the two would make exactly this kind of fault much harder to diagnose correctly.' }],
        },
      },
    },
  ],
  quiz: {
    pass: 0.8,
    questions: [
      { id: 'q1', type: 'mcq', prompt: 'The protective earth connection is removed...', options: ['last, and reconnected first', 'first, and reconnected last', 'at any convenient point', 'only on models without a battery'], answer: 0, explain: 'Minimising the unearthed window.' },
      { id: 'q2', type: 'mcq', prompt: 'A real power board mixing MOSFETs and IGBTs most likely reflects...', options: ['each device family used where its strengths suit a different stage', 'a manufacturing error', 'random selection', 'cost-cutting with no technical basis'], answer: 0, explain: 'Deliberate device selection per F4.M2.' },
      { id: 'q3', type: 'mcq', prompt: 'The LF-3K transformer\'s substantial mass for its power rating directly illustrates...', options: ['why line-frequency transformers are larger than HF-link designs of equal power', 'a design flaw', 'an oversized part', 'nothing relevant to F4.M3'], answer: 0, explain: 'A direct physical consequence of line-frequency operation.' },
      { id: 'q4', type: 'mcq', prompt: 'This board uses both a microcontroller and a dedicated PWM IC because...', options: ['each control philosophy is matched to the job it suits best', 'one is a redundant leftover', 'microcontrollers cannot generate PWM', 'PWM ICs cannot coexist with microcontrollers'], answer: 0, explain: 'Deliberate matching per F4.M5.L1.' },
      { id: 'q5', type: 'mcq', prompt: 'A fuse protects a circuit...', options: ['independently of what the sensing/control system reports', 'only with sensor confirmation', 'only when commanded by firmware', 'never without sensing input'], answer: 0, explain: 'Protection devices act on actual current, independent of sensing.' },
    ],
  },
  practicals: [],
}
