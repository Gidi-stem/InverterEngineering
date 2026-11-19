import type { AcademyModule } from '../types'
import { to } from '../s1/links'

/** P4.M2 Safe disassembly and reassembly. */
export const P4_M2: AcademyModule = {
  id: 'P4.M2',
  title: 'Safe disassembly and reassembly',
  summary: 'The complete, guided isolation, discharge, disassembly and reassembly sequence for a real inverter, performed in the 3D laboratory and verified with a functional test.',
  lessons: [
    {
      id: 'P4.M2.L1',
      title: 'Isolation and discharge in practice',
      minutes: 30,
      content: {
        objectives: [
          'Perform the full isolation sequence (battery, PV, AC output) on a real model before opening it.',
          'Confirm bus-capacitor discharge using the discharge simulator and a meter, not by assumption.',
          'Explain why discharge must be CONFIRMED, not merely expected after a wait time.',
        ],
        introduction: `This lesson puts F1's isolation and discharge drills into practice on a real inverter model: disconnecting every source in the correct order, then confirming — not assuming — that the bus capacitors are safe to work on.`,
        lecture: `### Isolating every source, in order

An inverter can have more than one source feeding its internal bus: the battery, a PV array, and even the AC output itself (which can be back-fed from a connected load or generator in some configurations). F1's isolation drill applies here directly: disconnect the battery, then the PV input, then verify the AC output is also isolated — tag the isolation point as you go, exactly as a real safe-isolation procedure requires.

### Discharge: confirm, don't assume

Bus capacitors (F4.M1.L2) store energy even after every source is disconnected, and a "wait a few minutes" rule of thumb is not a substitute for actually checking. This lesson's discharge simulator reproduces exactly what F1 taught: run the discharge check, then confirm with a (simulated) meter reading across the bus that voltage has actually fallen to a safe level, before touching anything inside.

### Why confirmation matters more here than almost anywhere else

A capacitor bank that SHOULD have discharged but has not (due to a failed bleeder resistor, F4.M1.L1, or a resistor that was never actually connected) is invisible to a visual inspection — it looks exactly like a safely discharged bank. Only a measurement reveals the difference, which is precisely why "confirm, don't assume" is the single most important habit this lesson builds.

### Carrying this habit beyond the laboratory

This is not a laboratory-only exercise. Every real repair job on inverter equipment begins with exactly this sequence, performed on a physical unit rather than a 3D model: isolate every source in order, then measure — not estimate — the bus voltage before any cover comes off or any probe goes near an internal connection. A technician who treats the simulator's discharge check as a box-ticking exercise, rather than internalising the underlying discipline, has learned the wrong lesson entirely; the simulated meter reading here should feel exactly as consequential as a real one, because the habit it is building is meant to transfer directly, unchanged, to real equipment later in a technician's career.`,
        technical: `**Why the discharge time can vary.** A bus capacitor's discharge time constant depends on its capacitance AND the bleeder resistor's value — a failed or disconnected bleeder resistor (F4.M1.L1's testing lesson) can leave a bank charged far longer than the "normal" wait time a technician might expect, which is exactly why a measurement, not a stopwatch, is the real safety check.

**PV-bus versus battery-bus discharge.** The LF-3K model's PV-bus capacitors (C5–C6, rated for a higher voltage than the battery-bus bank C1–C4) have their own dedicated bleeder resistors (F4.M1.L2) — each voltage domain is discharged and confirmed independently, not assumed safe just because the OTHER bank has already been confirmed discharged.`,
        diagrams: [{ id: 'isolation-flow', caption: 'The isolation sequence (battery, PV, AC output) followed by discharge confirmation at the bus capacitors, before any cover is opened.' }],
        formulas: [{ name: 'RC discharge (concept)', expr: 'V(t) = V₀ · e^(−t / (R·C))', where: [['V(t)', 'capacitor voltage after time t', 'V'], ['R', 'bleeder resistor value', 'Ω'], ['C', 'capacitor value', 'F']], note: 'A larger R (e.g. a failed/open bleeder behaving as a much higher resistance) makes discharge far slower than expected — hence the need to measure, not guess.' }],
        examples: [
          {
            title: 'Why a "wait 5 minutes" rule can fail',
            problem: 'A technician always waits exactly 5 minutes after power-off before opening a cover, with no meter check. Using the RC discharge concept, explain a scenario where this is unsafe.',
            steps: ['Discharge time depends on R (bleeder resistor) × C (capacitance)', 'If the bleeder resistor has failed open (F4.M1.L1), the effective R becomes very large, making the RC time constant far longer than 5 minutes'],
            answer: 'With a failed bleeder resistor, the bus capacitor could remain dangerously charged well beyond 5 minutes, even though the fixed-wait rule assumes a healthy resistor every time — this is exactly why a meter confirmation, not a timer, is the real safety check.',
          },
          {
            title: 'Confirming two voltage domains independently',
            problem: 'A model has both a battery-bus bank (C1–C4) and a separate PV-bus bank (C5–C6) at a higher voltage. The battery-bus bank is confirmed discharged. Is it now safe to work near the PV-bus bank too?',
            steps: ["Each bank has its OWN bleeder resistor and discharge path, independent of the other", "Confirming one bank says nothing about the other bank's actual state"],
            answer: "No — the PV-bus bank must be confirmed discharged independently, with its own meter reading, before it is considered safe; one bank's confirmed-safe state does not transfer to the other.",
          },
        ],
        applications: `This exact confirm-don't-assume discipline is what the Repair Workshop's safe-isolation scenarios test directly, and it is the first, non-negotiable step before any of P4.M2's later disassembly steps.`,
        mistakes: [
          { mistake: 'Treating a fixed wait time as equivalent to a discharge confirmation.', correction: 'A failed bleeder resistor can make real discharge time far longer than any fixed wait — only a measurement confirms it.' },
          { mistake: 'Assuming one bus capacitor bank being discharged means all banks are safe.', correction: 'Each voltage domain (e.g. battery-bus and PV-bus) has its own discharge path and must be confirmed independently.' },
          { mistake: 'Skipping AC-output isolation because "the inverter is off anyway".', correction: "Back-feed through the output is a real isolation hazard this lesson's sequence explicitly accounts for, independent of the inverter's own power state." },
        ],
        demo: { title: 'Run the discharge check', text: 'Isolate every source, then confirm bus-capacitor discharge with the simulator and meter.', link: to.lab3d('Isolation and discharge', 'lf3k') },
        activities: [to.lab3d('Isolation and discharge', 'lf3k')],
        check: [
          { id: 'k1', type: 'mcq', prompt: 'A fixed "wait 5 minutes" rule, with no meter check, is unsafe because...', options: ['a failed bleeder resistor can make real discharge time much longer than expected', 'capacitors never actually need to discharge', '5 minutes is always too long', 'bleeder resistors cannot fail'], answer: 0, explain: 'Discharge time depends on R×C; a failed resistor changes R unpredictably.' },
          { id: 'k2', type: 'mcq', prompt: 'Confirming the battery-bus bank is discharged tells you...', options: ["nothing definite about a separate PV-bus bank's state", 'that every bank in the unit is now safe', 'that the AC output is also isolated', 'that the bleeder resistors can be removed'], answer: 0, explain: 'Each voltage domain must be confirmed independently.' },
          { id: 'k3', type: 'mcq', prompt: 'AC output isolation is included in this sequence because...', options: ['back-feed through the output is a real isolation hazard', 'AC terminals are never actually live', 'it is purely a formality with no real risk', 'the battery is the only possible source'], answer: 0, explain: 'A back-fed output is a genuine source the sequence must account for.' },
        ],
        summary: [
          'Every source — battery, PV, AC output — is isolated in sequence before any cover is opened.',
          'Discharge must be CONFIRMED with a measurement, never assumed from a fixed wait time.',
          'A failed bleeder resistor can make real discharge time far longer than expected, invisibly.',
          'Each voltage domain (battery-bus, PV-bus) is confirmed discharged independently.',
        ],
        homework: {
          id: 'P4.M2.L1.hw',
          title: 'Isolation and discharge practice',
          brief: "Apply the confirm-don't-assume discipline.",
          tasks: [{ id: 'h1', type: 'mcq', prompt: 'The correct way to confirm a bus capacitor is discharged is to...', options: ['measure its voltage directly', 'wait a fixed amount of time', 'look at it visually', 'assume it based on the model number'], answer: 0, explain: 'Only a direct measurement confirms actual voltage.' }],
          written: [{ prompt: 'A colleague says "I’ve done this a hundred times, the caps are always discharged by the time I open the cover, so I don’t bother checking anymore." Explain the flaw in this reasoning.', model: "Past experience with HEALTHY bleeder resistors does not guarantee the CURRENT unit's bleeder resistor is still functioning — a bleeder resistor, like any other component, can fail open over time or during a previous repair, and when it does, the capacitor bank will not discharge in the expected time even though it always has before. Relying on \"it's always been fine\" substitutes a statistical pattern from past units for an actual measurement on THIS unit, and the one time the pattern breaks is exactly when skipping the measurement becomes dangerous. The checking habit exists precisely because failures are rare but not impossible, and their consequence (a damaging short-circuit spark or shock) is severe enough that the small, repeated cost of checking is always worth it." }],
        },
      },
    },
    {
      id: 'P4.M2.L2',
      title: 'Disassembly sequence and why',
      minutes: 30,
      content: {
        objectives: [
          'Follow the complete guided disassembly sequence for a real inverter model.',
          "Explain the reasoning behind each major step's position in the sequence.",
          'Distinguish a genuine structural/electrical removal dependency from an arbitrary ordering choice.',
        ],
        introduction: `With isolation and discharge confirmed, this lesson works through the complete disassembly sequence: cover, fan, switches and heat sink, power board, magnetics, and terminals — and WHY each step sits where it does.`,
        lecture: `### The sequence, and the reasoning behind each step

1. **Cover** — removed first, once isolation and discharge are confirmed (P4.M2.L1); access to everything else depends on it.
2. **Fan** — removed early because it physically blocks access to the heat sink; its own connection (plug plus screws) is simple and has no dependency on anything else.
3. **Switches, then heat sink** — the power switches (MOSFETs/IGBTs, P4.M1.L2) must be UNCLAMPED from the heat sink before the heat sink itself can be freed; this is a genuine mechanical dependency, not an arbitrary order.
4. **Power board** — capacitors, the oscillator/control ICs and other soldered parts are desoldered or disconnected, THEN the board itself is lifted; the board cannot come free while parts remain attached to it.
5. **Magnetics (transformer, inductor)** — the output filter (inductor, capacitor) is disconnected before the transformer, since the transformer's own leads connect to the filter (P4.M1.L3); the heaviest part, it is handled with both hands or lifting equipment.
6. **Terminals and earth stud** — removed last, in the SAME order as the original isolation sequence in reverse: AC/fuse/battery terminals, then the PE stud LAST (P4.M1.L1's reasoning restated at the physical-disassembly level).

### Dependency versus convention

Some of this order is a genuine DEPENDENCY (you cannot physically remove the heat sink while switches remain clamped to it; the transformer cannot come free while its leads are still connected to the filter). Other parts of the order are a sensible CONVENTION (removing the fan before the heat sink is easier, but not strictly required by any dependency) — recognising which is which helps a technician adapt safely when a real unit's layout differs slightly from the model.`,
        technical: `**Why the control board comes off before the power board in some designs.** As P4.M1.L4 noted, a control board mounted ABOVE the power board's cable path must be cleared first simply for ACCESS — a spatial dependency, distinct from the mechanical (switch-to-heat-sink) and electrical (transformer-to-filter) dependencies in this sequence.

**Documenting as you go.** Photographing or noting wire positions and orientations before disconnecting them (a habit from any real electronics repair) is what makes an otherwise-correct disassembly sequence actually reversible during reassembly — the sequence alone does not capture every wire's exact routing.`,
        diagrams: [{ id: 'risk-hierarchy', caption: "The disassembly sequence's major steps, each annotated with whether its position reflects a genuine dependency or a sensible convention." }],
        formulas: [{ name: 'Dependency rule (concept)', expr: 'A part cannot be removed while another part it is mechanically clamped to, or electrically wired to, remains attached', where: [] }],
        examples: [
          {
            title: 'Classifying a step as dependency or convention',
            problem: 'In the sequence above, classify "removing the fan before the heat sink" and "unclamping switches before removing the heat sink" as dependency or convention, with reasoning.',
            steps: ['The fan merely sits in front of the heat sink and blocks convenient access, but could, in principle, be left and worked around', 'The switches are physically CLAMPED to the heat sink; the heat sink genuinely cannot be removed while they remain clamped'],
            answer: 'Fan-before-heat-sink is a CONVENTION (practical convenience, not a hard requirement); unclamping switches before the heat sink is a genuine DEPENDENCY (mechanically impossible otherwise) — recognising this distinction helps a technician adapt the sequence safely to a slightly different real unit.',
          },
          {
            title: 'Reasoning about reversed terminal removal order',
            problem: 'Explain why the terminal/earth removal step in disassembly mirrors the ORIGINAL isolation sequence, but in a specific relationship to the earth stud specifically.',
            steps: ['Isolation disconnects sources; the earth stud is NOT a source and was never part of that disconnection sequence', 'In disassembly, the earth stud is removed LAST among the terminals (P4.M1.L1), keeping the chassis earthed as long as possible'],
            answer: 'The source terminals (battery, PV, AC) are removed following the same reasoning as isolation, while the PE stud is specifically removed LAST of all of them — preserving the earth bond for as much of the procedure as physically possible, exactly the P4.M1.L1 principle applied at the disassembly stage.',
          },
        ],
        applications: `Recognising genuine dependencies versus convention is exactly the reasoning skill the Repair Workshop's access-and-removal steps (before a component can be tested or replaced) rely on.`,
        mistakes: [
          { mistake: 'Treating every step in a guided sequence as an equally strict dependency.', correction: 'Some steps are genuine mechanical/electrical dependencies; others are convenient conventions — confusing the two can cause unnecessary difficulty on a real, differently-laid-out unit.' },
          { mistake: 'Forcing the heat sink out while switches are still clamped to it.', correction: 'This risks damaging both the switches and the heat sink; unclamping must happen first, every time, because it is a true dependency.' },
          { mistake: 'Disconnecting wires without documenting their original position or orientation.', correction: 'A correct removal SEQUENCE alone does not guarantee correct REASSEMBLY of every individual wire — documentation closes that gap.' },
        ],
        demo: { title: 'Follow the full disassembly sequence', text: 'Work through cover, fan, switches/heat sink, power board, magnetics and terminals in order.', link: to.lab3d('Disassembly sequence', 'lf3k') },
        activities: [to.lab3d('Disassembly sequence', 'lf3k')],
        check: [
          { id: 'k1', type: 'mcq', prompt: 'Unclamping switches before removing the heat sink is a...', options: ['genuine mechanical dependency', 'arbitrary convention', 'step that can be skipped', 'step with no real reason'], answer: 0, explain: 'The switches are physically clamped to the heat sink.' },
          { id: 'k2', type: 'mcq', prompt: 'Removing the fan before the heat sink is best described as...', options: ['a sensible convention, not a strict dependency', 'mechanically impossible to do otherwise', 'the same kind of constraint as the switch-clamping dependency', 'required by electrical safety rules'], answer: 0, explain: 'It aids access but is not a hard mechanical requirement.' },
          { id: 'k3', type: 'mcq', prompt: 'The PE stud is removed last among the terminals in disassembly because...', options: ['it keeps the chassis earthed for as long as physically possible', 'it is the easiest terminal to access', 'it has no electrical function', 'terminal order has no real reasoning'], answer: 0, explain: 'The same earthing-safety principle from P4.M1.L1, applied here.' },
        ],
        summary: [
          'The disassembly sequence follows cover, fan, switches/heat sink, power board, magnetics, then terminals.',
          'Some steps are genuine mechanical or electrical DEPENDENCIES; others are sensible CONVENTIONS — the two are not the same.',
          'The heat sink genuinely cannot be removed until the switches clamped to it are unclamped first.',
          'The PE stud is removed last among the terminals, preserving the earth bond as long as possible.',
        ],
        homework: {
          id: 'P4.M2.L2.hw',
          title: 'Disassembly sequence reasoning practice',
          brief: 'Classify steps as dependency or convention and justify.',
          tasks: [{ id: 'h1', type: 'mcq', prompt: 'A real unit has its fan mounted somewhere that does NOT block the heat sink. Should the technician still remove it before the heat sink?', options: ['Not necessarily — this ordering was a convention, not a hard dependency', 'Yes, always, with no exception', 'No, the fan should never be removed', 'The heat sink can never be removed in this case'], answer: 0, explain: 'Since this was convention rather than dependency, it can be adapted when the physical layout differs.' }],
          written: [{ prompt: "A new technician follows the guided sequence step by step but struggles when a real unit's layout differs slightly from the model (for example, its fan is mounted elsewhere). Explain how understanding WHICH steps are dependencies versus conventions would have helped them adapt.", model: "If the technician understands that the fan-before-heat-sink ordering in the guided sequence was a CONVENTION (chosen for convenience on that specific model's layout) rather than a DEPENDENCY (a mechanical necessity), they can recognise that a differently-positioned fan on a real unit does not block the same reasoning — the fan can be left until a more convenient point, since nothing else in the sequence actually depends on its removal order. By contrast, recognising that unclamping the switches before the heat sink IS a genuine dependency tells them this particular step cannot be skipped or reordered regardless of the unit's layout, because it reflects an unavoidable physical constraint (the switches are bolted to the sink) rather than a model-specific convenience. Learning to tell these apart, rather than following the sequence as one undifferentiated list of steps, is what allows safe adaptation to a real unit that does not exactly match the guided model." }],
        },
      },
    },
    {
      id: 'P4.M2.L3',
      title: 'Reassembly and functional test',
      minutes: 30,
      content: {
        objectives: [
          'Reverse the disassembly sequence correctly, respecting the dependency relationships identified in P4.M2.L2.',
          'Perform a staged functional test after reassembly rather than assuming correctness from appearance.',
          'Explain why reassembly order is not simply "disassembly, reversed" in every single respect.',
        ],
        introduction: `This closing lesson reverses the disassembly sequence into a correct reassembly, then performs a guided functional test — because a unit that LOOKS correctly reassembled is not the same as one CONFIRMED to work correctly.`,
        lecture: `### Reassembly: mostly reversed, with one deliberate exception

Reassembly follows the disassembly sequence in reverse for almost every step: terminals and PE stud first (PE FIRST this time, matching P4.M1.L1's reasoning exactly), then magnetics, power board, heat sink/switches, fan, and finally the cover. The one deliberate exception that is NOT simply "reversed" is the earth connection itself: it was removed LAST in disassembly and is reconnected FIRST in reassembly — the earth bond's priority is preserved at both ends of the procedure, not mechanically mirrored.

### Reassembly quality checks, step by step

Beyond simply reversing bolt-and-wire positions, reassembly includes real quality checks this lesson revisits from earlier modules: fresh insulating pads under every clamped switch (F4.M2.L10's compatibility/replacement reasoning — old pads are not reused), correct capacitor and diode polarity when the power board is refitted (a reversed electrolytic capacitor is a real, damaging mistake), and confirmed earth continuity (P4.M1.L1) once the earth stud is back in place, BEFORE any source is reconnected.

### Functional test: staged, not all-at-once

A functional test is not "plug everything in and switch it on." It is staged: confirm earth continuity first, then reconnect the battery alone and check for correct standby behaviour before enabling output, then bring up the output under no load, then finally under a real load — checking at each stage before proceeding to the next, exactly the incremental-verification discipline that prevents a single hidden reassembly mistake from causing a much larger failure.`,
        technical: `**Why insulating pads must be fresh, not reused.** F4.M2.L10 explained that a MOSFET/IGBT's insulating pad degrades with thermal cycling; reusing an old pad during reassembly can silently reintroduce exactly the thermal-isolation fault the original repair may have been trying to fix.

**Why capacitor polarity errors are a reassembly-specific risk.** Disassembly removes a charged, correctly-oriented part; reassembly is where a part can be refitted backwards if its orientation was not documented (P4.M2.L2's point about documenting wire/part positions) — this is precisely why documenting orientation during disassembly directly prevents a reassembly-stage fault.`,
        diagrams: [{ id: 'risk-hierarchy', caption: 'The reassembly sequence as the disassembly order reversed, with the earth-bond priority preserved rather than mechanically mirrored, followed by a staged functional test.' }],
        formulas: [{ name: 'Staged verification (concept)', expr: 'Confirm each stage (earth continuity → battery/standby → output no-load → output on load) before proceeding to the next', where: [] }],
        examples: [
          {
            title: 'Why PE is reconnected first, not last',
            problem: "A technician reverses the ENTIRE disassembly sequence mechanically, including leaving PE for the very last reconnection step (mirroring where it was in disassembly's final step). Explain why this is wrong.",
            steps: ['Disassembly removed PE LAST specifically to minimise the unearthed window', 'Reassembly should minimise the SAME unearthed window by reconnecting PE FIRST, not last'],
            answer: 'Reconnecting PE last would leave every reassembled part effectively unearthed throughout nearly the entire reassembly process — exactly backwards from the safety intent; PE must be reconnected FIRST to restore the earth bond as early as possible, which is the one place reassembly is NOT a pure mechanical reversal of disassembly.',
          },
          {
            title: 'Diagnosing a reassembly-introduced fault',
            problem: 'After reassembly, the staged functional test shows correct standby behaviour but the output stage fails only once a real load is applied, not under no-load. Suggest a reassembly-related explanation.',
            steps: ['A no-load pass but load-dependent failure suggests the output stage mostly works but struggles under current', 'A reused insulating pad (F4.M2.L10) or a slightly loose power-switch clamp from reassembly could cause exactly this: adequate at low current/no load, but thermally or electrically marginal under real current'],
            answer: 'This pattern is consistent with a reassembly-introduced thermal or clamping issue at the power switches (e.g. a reused, degraded insulating pad, or an under-torqued clamp) — exactly why the staged test catches a fault that a quick "powers on fine" check would have missed entirely.',
          },
        ],
        applications: `This staged functional-test discipline is exactly what the Repair Workshop expects after any component replacement scenario, and it is the final, practical skill this module builds toward.`,
        mistakes: [
          { mistake: 'Treating reassembly as a purely mechanical reversal of disassembly in every respect.', correction: 'The earth connection is the deliberate exception: reconnected FIRST, not last, preserving the same safety priority at both ends of the procedure.' },
          { mistake: 'Reusing an old insulating pad under a reassembled power switch.', correction: 'A degraded pad can silently reintroduce a thermal-isolation fault; fresh pads are required at reassembly (F4.M2.L10).' },
          { mistake: 'Switching a freshly reassembled unit straight to full load without staged checks.', correction: 'A staged test (earth, then standby, then no-load output, then loaded output) catches a fault at the earliest, safest, least damaging stage.' },
        ],
        demo: { title: 'Reassemble and run the functional test', text: 'Reverse the sequence correctly and complete the staged functional test.', link: to.lab3d('Reassembly and functional test', 'lf3k') },
        activities: [to.lab3d('Reassembly and functional test', 'lf3k')],
        check: [
          { id: 'k1', type: 'mcq', prompt: 'During reassembly, the earth (PE) connection is...', options: ['reconnected first, not last', 'reconnected last, mirroring disassembly exactly', 'optional', 'reconnected at a random point'], answer: 0, explain: 'The one deliberate exception to mechanical reversal, preserving the earthing-safety priority.' },
          { id: 'k2', type: 'mcq', prompt: 'A functional test should bring the unit up...', options: ['in stages, checking at each stage before proceeding', 'straight to full load immediately', 'with no checks until the very end', 'only by visual inspection'], answer: 0, explain: 'Staged verification catches faults early and safely.' },
          { id: 'k3', type: 'mcq', prompt: 'Reusing an old insulating pad on a reassembled power switch risks...', options: ['silently reintroducing a thermal-isolation fault', 'improving thermal performance', 'having no effect at all', 'an immediate, obvious failure every time'], answer: 0, explain: 'Degradation from thermal cycling is not always visible, and its effect can be subtle until under real load.' },
        ],
        summary: [
          'Reassembly reverses the disassembly sequence for almost every step, with the earth connection as the deliberate exception: reconnected first, not last.',
          'Reassembly quality checks (fresh insulating pads, correct polarity, confirmed earth continuity) are real steps, not formalities.',
          'A functional test is staged — earth continuity, then standby, then no-load output, then loaded output — each confirmed before the next.',
          'A load-dependent fault after reassembly often points to a thermal or clamping issue introduced during reassembly itself.',
        ],
        homework: {
          id: 'P4.M2.L3.hw',
          title: 'Reassembly and functional test practice',
          brief: 'Apply staged-verification reasoning to a reassembly scenario.',
          tasks: [{ id: 'h1', type: 'mcq', prompt: 'The correct order for a staged functional test is...', options: ['earth continuity, then standby, then no-load output, then loaded output', 'loaded output first, to save time', 'no-load output only, every time', 'standby only, with no further stages'], answer: 0, explain: 'Each stage confirms safety and correctness before the next, more demanding stage.' }],
          written: [{ prompt: 'Explain why the earth connection being reconnected FIRST during reassembly, while being removed LAST during disassembly, is not actually a contradiction but reflects the same underlying principle applied at both ends of the procedure.', model: 'The underlying principle is not "earth goes first" or "earth goes last" as fixed rules — it is "minimise the time the chassis is unearthed while other work is being done around it." During disassembly, everything else is being disconnected and removed, so keeping PE connected until last keeps the chassis earthed throughout the longest possible portion of that process. During reassembly, everything else is still being reconnected and refitted, so reconnecting PE first restores the earth bond as early as possible, again keeping the chassis earthed throughout the longest possible portion of that process. In both cases, the SAME safety goal — maximise earthed time during the procedure — produces an OPPOSITE position in the sequence (last versus first) simply because disassembly and reassembly are opposite directions of the same process. There is no contradiction; it is one consistent principle correctly applied in two different directions.' }],
        },
      },
    },
  ],
  quiz: {
    pass: 0.8,
    questions: [
      { id: 'q1', type: 'mcq', prompt: 'A failed bleeder resistor makes a "fixed wait time, no meter check" discharge rule unsafe because...', options: ['real discharge time can become far longer than expected', 'capacitors never discharge at all in that case', 'the wait time becomes shorter', 'bleeder resistors cannot actually fail'], answer: 0, explain: 'The RC time constant depends on resistor value; a failed-open resistor extends it unpredictably.' },
      { id: 'q2', type: 'mcq', prompt: 'Unclamping switches before removing the heat sink is a...', options: ['genuine mechanical dependency', 'arbitrary convention', 'step that can always be skipped', 'electrical, not mechanical, requirement'], answer: 0, explain: 'The switches are physically clamped to the heat sink.' },
      { id: 'q3', type: 'mcq', prompt: 'During reassembly, the earth connection is reconnected...', options: ['first, not last', 'last, mirroring disassembly exactly', 'at any convenient point', 'only if time permits'], answer: 0, explain: 'The deliberate exception preserving the earthing-safety priority.' },
      { id: 'q4', type: 'mcq', prompt: 'A functional test should proceed...', options: ['in stages, each confirmed before the next', 'straight to full load', 'by visual inspection only', 'with no particular order'], answer: 0, explain: 'Staged verification limits the consequence of any hidden fault.' },
      { id: 'q5', type: 'mcq', prompt: 'Reusing an old insulating pad on a reassembled switch risks...', options: ['silently reintroducing a thermal-isolation fault', 'improving performance', 'no measurable effect', 'an immediate failure on first power-up every time'], answer: 0, explain: 'Degradation from thermal cycling can be subtle and load-dependent.' },
    ],
  },
  practicals: [
    { id: 'P4.M2.P1', title: 'Isolation, discharge and disassembly', description: 'Isolate every source, confirm bus-capacitor discharge, and complete the guided disassembly sequence on the LF-3K model.', link: to.lab3d('Disassembly sequence', 'lf3k'), evidence: { kind: 'activity', id: 'lab3d:disassembly' } },
    { id: 'P4.M2.P2', title: 'Reassembly and functional test', description: 'Reverse the sequence correctly and pass the staged functional test.', link: to.lab3d('Reassembly and functional test', 'lf3k'), evidence: { kind: 'activity', id: 'lab3d:reassembly' } },
  ],
}
