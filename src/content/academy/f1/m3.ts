import type { AcademyModule } from '../types'
import { to } from '../s1/links'

/** F1.M3 Safe isolation. */
export const F1_M3: AcademyModule = {
  id: 'F1.M3',
  title: 'Safe isolation',
  summary: 'The procedure that makes electrical work safe: isolate every source, lock it off, discharge stored energy and prove dead with a verified tester. Practised here as assessed drills.',
  lessons: [
    {
      id: 'F1.M3.L1',
      title: 'Isolation and lock-out/tag-out',
      minutes: 35,
      content: {
        objectives: [
          'Distinguish switching off, isolating and securing.',
          'List the steps of a safe-isolation procedure in the correct order.',
          'Explain the purpose of personal locks, tags and the restoration procedure.',
          'Apply the procedure to an inverter installation with several sources.',
        ],
        introduction: `Most electrical injuries to technicians happen on equipment they *thought* was dead. Safe isolation is the disciplined procedure that turns "I think it's off" into "I have proved it's dead and nobody can turn it back on". It is the same everywhere in the world in its essentials. You will practise it in this module until it is automatic.`,
        lecture: `### Switching off is not isolating

- **Switching off** (functional switching) stops the equipment working. A control switch may break only one conductor, may be operated by an automatic controller, and does not guarantee a safe gap.
- **[[isolation|Isolation]]** disconnects the equipment from *every* source with a device designed for isolation. Such a device gives a secure gap between its contacts and shows its position reliably.
- **Securing** prevents anyone from reconnecting the source while you work.

### The safe-isolation procedure

1. **Identify** the equipment and *every* source supplying it, from drawings, labels and inspection (lesson F1.M2.L3).
2. **Inform** the people affected that the supply will be off.
3. **Switch off** the load, so that you do not open the isolator under full current.
4. **Isolate** each source with its isolating device: main switch, breaker, DC isolator, battery fuse.
5. **Secure**: lock each isolator off with *your own* padlock and fit a warning tag with your name, the date and the reason. This is [[lockout|lock-out/tag-out]].
6. **Dissipate stored energy**: wait for the capacitors to discharge, and discharge them through a rated resistor if the procedure requires it (lesson L3).
7. **Prove dead** at the point of work with a voltage tester verified before and after (lesson L2).
8. **Work.**
9. **Restore**: make the work safe, remove tools, refit covers, inform people, then remove *your* lock and re-energise in a controlled order.

### Locks and tags

- Each person working fits their **own** lock and keeps the key. If three people are working, the isolator carries three locks (using a multi-lock hasp), and it cannot be switched on until all three have finished.
- A **tag** alone is not security: it is information. Where an isolator cannot be locked, the risk must be controlled another way, for example by removing and keeping the fuse.
- Never remove someone else's lock.

### Isolating an inverter system

For a battery-inverter-PV installation:

- open the **AC input** (grid and generator);
- open the **AC output** where you will work;
- open the **battery** fuse or breaker;
- open the **PV** DC isolators;
- lock and tag each one;
- then wait for the internal capacitors to discharge, and prove dead at the point of work. Prove the DC side as well as the AC side.`,
        technical: `**Why switch off the load before isolating?** Many isolators (switch-disconnectors excepted) are not designed to break full load current. Opening them on load can draw an arc, especially on DC (lesson F1.M1.L3).

**Isolation devices.** Standards define which devices are suitable for isolation: switch-disconnectors, plugs and sockets, removable fuse-carriers and some circuit breakers marked for isolation. A semiconductor switch (such as an inverter's own transistors) is **never** a means of isolation, because it can fail short-circuit or be switched on by its controller.

**Permits to work.** On larger installations a written permit-to-work system records who isolated what, who is working and when the work is complete. It is an administrative control that supports, but never replaces, locks and proving dead.`,
        diagrams: [{ id: 'isolation-flow', caption: 'The safe-isolation sequence, from identifying sources to controlled restoration.' }],
        formulas: [{ name: 'Sources to isolate', expr: 'N_isolations = number of independent sources reaching the point of work', where: [], note: 'Count grid, generator, battery, each PV string and any inverter output. Each needs its own lock.' }],
        examples: [
          {
            title: 'Isolation plan for an inverter output breaker',
            problem: 'You must replace the output breaker of a hybrid inverter supplied by grid, battery and one PV string. Write the isolation plan.',
            steps: ['Identify: grid (AC in), battery (DC), PV string (DC); the inverter output is generated from these', 'Inform the occupants; switch off the loads', 'Open and lock: the grid supply breaker, the battery breaker, the PV DC isolator; tag each one', 'Wait for the inverter’s capacitors to discharge (see the label)', 'Prove dead at the breaker terminals (AC) and at the inverter’s DC terminals'],
            answer: 'Three locks (grid, battery, PV), a waiting time, and proving dead on both the AC and the DC side before touching anything.',
          },
          {
            title: 'Two people working',
            problem: 'You and a colleague work on the same battery bank. How many locks go on the battery isolator, and when may it be switched on?',
            steps: ['Each person fits their own lock on a multi-lock hasp', 'The isolator cannot be operated until every lock is removed by its owner'],
            answer: 'Two locks. The isolator is switched on only when both of you have finished and removed your own locks.',
          },
        ],
        applications: `Industrial sites, utilities and solar installers all use lock-out/tag-out. Inverter manuals list the isolation points and discharge times. The F1 practical assessments drill the sequence.`,
        mistakes: [
          { mistake: 'Relying on the inverter’s own on/off button for isolation.', correction: 'A control switch is not an isolator. The battery, PV and AC remain connected to the internals.' },
          { mistake: 'Using one lock for a team.', correction: 'Each worker uses their own lock and key.' },
          { mistake: 'Isolating the grid but forgetting the PV array.', correction: 'Identify every source from the drawings and labels; PV is live in daylight.' },
        ],
        demo: {
          title: 'Safe isolation drill',
          text: 'Practise the isolation sequence in this module’s practical assessment: choose the correct steps, reject the unsafe ones, and put them in order.',
          link: to.lab3d('3D laboratory: the LF-3K isolation points', 'lf3k', 'breaker'),
        },
        activities: [to.lib('Circuit breaker (isolation)', 'circuit-breaker'), to.lab3d('LF-3K output breaker', 'lf3k', 'breaker')],
        check: [
          { id: 'k1', type: 'mcq', prompt: 'Which comes first in safe isolation?', options: ['Identify every source supplying the equipment', 'Prove dead', 'Start work', 'Remove the cover'], answer: 0, explain: 'You cannot isolate sources you have not identified.' },
          { id: 'k2', type: 'mcq', prompt: 'Why does each worker fit their own lock?', options: ['So the supply cannot be restored until every worker has finished', 'Locks are cheap', 'To share keys', 'It is optional'], answer: 0, explain: 'Each person controls their own safety.' },
          { id: 'k3', type: 'mcq', prompt: 'Which is NOT a means of isolation?', options: ['The inverter’s transistor switches', 'A lockable switch-disconnector', 'A removable fuse carrier', 'A lockable DC isolator'], answer: 0, explain: 'Semiconductors can fail short or be switched on.' },
          { id: 'k4', type: 'mcq', prompt: 'When is stored energy dealt with?', options: ['After isolating and securing, before proving dead', 'After starting work', 'Never', 'Before identifying sources'], answer: 0, explain: 'Capacitors are discharged once no source can recharge them.' },
        ],
        summary: [
          'Switching off ≠ isolating ≠ securing.',
          'Procedure: identify, inform, switch off, isolate, secure, dissipate, prove dead, work, restore.',
          'Every worker fits their own lock; tags inform, locks secure.',
          'Semiconductor switches and control buttons are never isolation.',
          'In inverter systems isolate grid, generator, battery and every PV string.',
        ],
        homework: {
          id: 'F1.M3.L1.hw',
          title: 'Isolation planning',
          brief: 'An off-grid cabin has a battery bank, two PV strings, an inverter and a petrol generator connected through a changeover switch.',
          tasks: [{ id: 'h1', type: 'numeric', prompt: 'How many sources must be locked off to work on the AC distribution board (battery, each PV string, generator)?', answer: 4, tol: 0.001, unit: '', explain: 'Battery, PV string 1, PV string 2 and the generator: 4 (the inverter output is removed by isolating its sources).' }],
          written: [{ prompt: 'Write the full isolation plan, including stored energy and proving dead.', model: 'Inform users; switch off loads; stop the generator and lock its isolator/changeover off; open and lock both PV string DC isolators; open and lock the battery breaker/fuse; tag every lock; wait the inverter’s discharge time; prove dead at the AC board (L–N, L–E, N–E) with a tester verified before and after; work; restore in a controlled order.' }],
        },
      },
    },
    {
      id: 'F1.M3.L2',
      title: 'Proving dead',
      minutes: 35,
      content: {
        objectives: [
          'Explain why a voltage tester must be verified before and after testing.',
          'List the conductor combinations that must be tested on AC and DC circuits.',
          'Explain why non-contact detectors and multimeters on the wrong setting are not reliable proof.',
          'Interpret a set of proving-dead readings and decide whether the circuit is safe.',
        ],
        introduction: `Isolation can fail silently:

- the wrong breaker was opened;
- a second source exists;
- a neutral is shared;
- the isolator's contacts have welded.

**Proving dead** is the measurement that catches all of these. It is the last check between you and the conductor, and it must be done the same way every time.`,
        lecture: `### Test, prove, test

1. **Test the tester** on a known live source, ideally a dedicated [[proving-unit|proving unit]]. This proves the tester, its leads and its battery work.
2. **Test the circuit**: every combination of conductors at the point of work.
3. **Test the tester again** on the proving unit. This proves the tester did not fail during the test. A tester that died halfway would show "0 V" everywhere.

If the tester fails either check, the "dead" readings mean nothing.

### What to test

**Single-phase AC:**
- line–neutral (L–N);
- line–earth (L–E);
- neutral–earth (N–E).

**DC (battery, PV):**
- positive–negative;
- positive–earth;
- negative–earth.

**Three-phase:** every phase to every other phase, to neutral and to earth.

Testing only L–N can miss a dangerous voltage. For example, a [[borrowed-neutral|borrowed neutral]] can sit at tens of volts above earth while L–N reads zero.

### Which instrument?

- **A two-pole voltage tester** designed for proving dead, used with a proving unit. It has fused, shrouded probes, an appropriate [[measurement-category|measurement category]] rating, and it indicates without needing a range selection.
- **A multimeter** can be used if it is suitably rated and on the correct range, but a wrong setting (for example, current mode) can create a short circuit or show nothing. Many organisations therefore require a dedicated tester.
- **Non-contact voltage detectors** ("volt sticks") are useful for a quick check, but they are **not proof of dead**. They can miss DC entirely, miss shielded cables, and fail silently.

### After proving dead

If the circuit is dead, work may start, with the isolation still locked. If *any* reading shows a voltage, the circuit is **not** dead:

- stop, and do not touch anything;
- find the unisolated source;
- isolate it;
- test again.`,
        technical: `**Why proving units?** A proving unit generates a known test voltage on demand, so a tester can be checked anywhere, including where no known live source is nearby. Using a live socket as the "known source" works, but it exposes the tester user to mains.

**Phantom (ghost) voltages.** High-impedance multimeters can read tens of volts on an isolated conductor that runs alongside live cables, through capacitive coupling. Testers designed for proving dead apply a small load that collapses such phantom readings. A reading that collapses under load suggests coupling rather than a real source, but the rule remains: **any unexplained voltage means not dead** until it is understood.

**DC capacitors.** On the DC side of an inverter, a reading that falls steadily while you watch is a capacitor still discharging. Wait, and test again.`,
        diagrams: [{ id: 'isolation-flow', caption: 'Proving dead sits between securing the isolation and starting work: test the tester, test every combination, test the tester again.' }],
        formulas: [{ name: 'Combinations to test (single-phase AC)', expr: 'L–N, L–E, N–E  (DC: +/−, + to earth, − to earth)', where: [] }],
        examples: [
          {
            title: 'Interpreting readings',
            problem: 'After isolating a socket circuit you measure: tester on proving unit OK; L–N 0 V; L–E 0 V; N–E 48 V; tester on proving unit OK. Is the circuit dead?',
            steps: ['The tester is proven before and after, so the readings are valid', 'N–E = 48 V means the neutral is at a voltage relative to earth', 'Likely cause: the neutral is shared with another live circuit (a borrowed neutral)'],
            answer: 'Not dead. Stop and find the other circuit sharing the neutral, isolate it, and test again.',
          },
          {
            title: 'A tester that failed',
            problem: 'A technician tests the tester on the proving unit (OK), measures L–N, L–E, N–E (all 0 V), but forgets the final check. Later the tester is found to have a broken lead. What could have happened?',
            steps: ['If the lead broke before the measurements, every reading would show 0 V regardless of the actual voltage', 'Only the final proving check would have revealed the failure'],
            answer: 'The circuit could have been live while reading “dead”. The final proving check is essential.',
          },
        ],
        applications: `Proving dead is required before work on any conductor in electrical safety regulations worldwide. The F1 prove-dead drill reproduces it with a virtual tester, including a scenario in which isolation was incomplete.`,
        mistakes: [
          { mistake: 'Using a non-contact detector as proof of dead.', correction: 'It is a screening tool only. Prove dead with a two-pole tester verified on a proving unit.' },
          { mistake: 'Testing only line to neutral.', correction: 'Test all combinations including to earth; a borrowed neutral or earth fault may otherwise be missed.' },
          { mistake: 'Skipping the second proving check.', correction: 'A tester can fail during use; re-prove it after testing.' },
        ],
        demo: {
          title: 'Prove-dead drill',
          text: 'In the practical assessment for this module, use a virtual tester on an isolated circuit, record every reading, and decide whether it is safe to work.',
          link: to.proc('Fuse check: a procedure that begins with isolation', 'fuse', 'fuse-check'),
        },
        activities: [to.lib('Protective earth', 'protective-earth'), to.cmp('Voltage versus current sensing', 'voltage-vs-current-sensing')],
        check: [
          { id: 'k1', type: 'mcq', prompt: 'Why is the tester checked on the proving unit after testing?', options: ['To prove it did not fail during the test', 'To recharge it', 'To calibrate the circuit', 'It is not necessary'], answer: 0, explain: 'A tester failing mid-test would show false “dead” readings.' },
          { id: 'k2', type: 'multi', prompt: 'Which combinations are tested on a single-phase AC circuit? (select all)', options: ['L–N', 'L–E', 'N–E', 'L–L'], answers: [0, 1, 2], explain: 'Single-phase has one line conductor.' },
          { id: 'k3', type: 'mcq', prompt: 'A non-contact detector shows nothing on an isolated DC battery cable. You conclude…', options: ['Nothing: these detectors cannot detect DC; prove dead with a two-pole tester', 'The cable is dead', 'The battery is flat', 'The detector is faulty'], answer: 0, explain: 'Most non-contact detectors respond only to AC fields.' },
          { id: 'k4', type: 'mcq', prompt: 'L–N reads 0 V but L–E reads 230 V. The circuit is…', options: ['live: stop and find the source', 'dead', 'safe because L–N is zero', 'only dangerous to the neutral'], answer: 0, explain: 'Any voltage between conductors and earth means not dead.' },
        ],
        summary: [
          'Test the tester on a proving unit, test every combination, test the tester again.',
          'Single-phase: L–N, L–E, N–E; DC: +/−, + to earth, − to earth.',
          'Use a two-pole tester; non-contact detectors are not proof.',
          'Any reading above zero means not dead: stop, find the source, isolate, retest.',
          'Falling DC readings indicate capacitors still discharging.',
        ],
        homework: {
          id: 'F1.M3.L2.hw',
          title: 'Reading the readings',
          brief: 'Decide whether each set of proving-dead readings shows a dead circuit.',
          tasks: [
            { id: 'h1', type: 'mcq', prompt: 'Tester OK before; L–N 0 V, L–E 0 V, N–E 0 V; tester OK after.', options: ['Dead: work may start (with isolation locked)', 'Not dead'], answer: 0, explain: 'All combinations tested with a verified tester.' },
            { id: 'h2', type: 'mcq', prompt: 'Tester OK before; + to − 38 V and falling; tester OK after.', options: ['Not yet dead: capacitors still discharging, wait and retest', 'Dead'], answer: 0, explain: 'A falling DC voltage is stored charge.' },
            { id: 'h3', type: 'mcq', prompt: 'Tester not checked before; all readings 0 V; tester OK after.', options: ['Not valid: the tester was not proven before testing', 'Dead'], answer: 0, explain: 'Both checks are required.' },
          ],
          written: [{ prompt: 'Explain why proving dead is still necessary after you personally opened and locked the isolator.', model: 'The isolator may be the wrong one, its contacts may have failed, a second source or back-feed may exist (inverter, PV, borrowed neutral), or stored energy may remain. Only a measurement at the point of work confirms the conductors are actually dead.' }],
        },
      },
    },
    {
      id: 'F1.M3.L3',
      title: 'Capacitor discharge and verification',
      minutes: 35,
      content: {
        objectives: [
          'State the safe method for discharging a capacitor bank and verifying it.',
          'Choose a discharge resistor for a given capacitor bank and time.',
          'Calculate the peak discharge current and energy dissipated.',
          'Explain why discharge is verified by measurement after it is done.',
        ],
        introduction: `Inverters and solar equipment contain capacitor banks that can stay charged after isolation (lesson F1.M2.L2). Before touching any internal part, the stored energy must be removed safely and the result proved by measurement. This lesson gives the method. The 3D laboratory's guided procedure, which opens once F1 is passed, lets you carry it out on the LF-3K.`,
        lecture: `### Wait first

Most equipment has [[bleeder]] resistors that discharge the capacitors after isolation. The manufacturer states the discharge time on a label or in the manual, often several minutes. **Wait at least that long.**

### Then measure

Measure the voltage across the capacitor bank with a voltage tester verified on a proving unit, exactly as in proving dead. If the voltage is below the safe level given in the procedure (this course uses 50 V), discharge is complete. Re-check large banks after a minute or two for recovery voltage.

### If discharge is needed

If the voltage is still above the safe level (a failed bleeder, or a procedure that requires active discharge):

1. Use a **discharge tool**: a resistor of suitable resistance, power and voltage rating, with insulated, shrouded probes.
2. Connect it across the capacitor terminals, **never** a screwdriver or a wire. A dead short releases the energy in microseconds as an arc, can weld the tool, injure you and damage the capacitor.
3. Hold it for at least 5 time constants (τ = R·C).
4. Remove it and **measure again**.

### Choosing the resistor

- **Resistance:** high enough to keep the initial current modest (I_peak = V₀/R), low enough to discharge in a reasonable time (t = RC·ln(V₀/V_s)).
- **Energy:** all of the stored energy ½CV² ends up in the resistor, within seconds. A resistor rated for a few watts continuously can absorb this as a short pulse, but its pulse rating must be adequate. That is the reason for using purpose-made tools.
- **Voltage rating:** at least the bank's maximum voltage.

### Verification is the proof

Calculations predict; measurements prove. A discharge resistor with a broken lead does nothing, and the meter is the only thing that will tell you so.`,
        technical: `**Pulse energy versus continuous power.** A 10 W resistor can absorb far more than 10 J if the energy arrives in a short pulse, because its thermal mass heats up gradually. Manufacturers give pulse-energy curves. The 3D laboratory's discharge simulator uses a simplified rule (rated W × 5 s) to illustrate this. Real tools are specified by their makers.

**Recovery voltage (dielectric absorption).** After a large electrolytic capacitor is discharged and the resistor removed, its voltage can creep back up by a few per cent of the original value over minutes. For high-voltage banks, procedures may require shorting links to be fitted after discharge.

**Never discharge through the body or a meter.** A meter on its voltage range has a very high resistance and will hardly discharge anything. On a current or resistance range it can short the capacitor and be damaged.`,
        diagrams: [{ id: 'rc-curve', caption: 'Discharge through a rated resistor: the voltage falls by 63 % per time constant.' }],
        formulas: [
          { name: 'Peak discharge current', expr: 'I_peak = V₀ / R', where: [['V₀', 'initial capacitor voltage', 'V'], ['R', 'discharge resistance', 'Ω']] },
          { name: 'Discharge time', expr: 't = R · C · ln(V₀ / V_s)', where: [['V_s', 'safe voltage', 'V']] },
          { name: 'Energy absorbed by the resistor', expr: 'E = ½ · C · (V₀² − V_s²)', where: [] },
        ],
        examples: [
          {
            title: 'Choosing a discharge resistor',
            problem: 'A 470 µF bank at 400 V must be discharged to below 50 V within 10 s. What is the largest resistance that achieves this, and what is the peak current?',
            steps: ['t = RC·ln(V₀/V_s) → R = t / (C·ln(V₀/V_s)) = 10 / (470 × 10⁻⁶ × ln 8) = 10 / (470 × 10⁻⁶ × 2.079) = 10 234 Ω', 'Choose 10 kΩ (a little lower); I_peak = 400 / 10 000 = 0.04 A'],
            answer: 'About 10 kΩ, giving a modest 40 mA peak. The resistor must be rated above 400 V and absorb about 37 J as a pulse.',
            check: 'E = ½ × 470 × 10⁻⁶ × (400² − 50²) = 37.0 J. ✓',
          },
          {
            title: 'Why not a screwdriver?',
            problem: 'The same bank is shorted by a screwdriver with 0.05 Ω total resistance. Estimate the peak current.',
            steps: ['Peak current: I_peak = V₀ / R', 'I_peak = 400 / 0.05 = 8000 A (limited in practice by capacitor ESR and inductance, but still kiloamperes)'],
            answer: 'Thousands of amperes for microseconds: a violent arc that can weld the tool, throw molten metal and damage the capacitor.',
          },
        ],
        applications: `Service procedures for inverters, drives and power supplies all include a discharge-and-verify step. The 3D laboratory refuses unsafe discharge methods (such as a screwdriver short) and explains why.`,
        mistakes: [
          { mistake: 'Shorting capacitors with a screwdriver.', correction: 'Use a rated discharge resistor with insulated probes.' },
          { mistake: 'Assuming the discharge worked because the resistor was applied.', correction: 'Always measure afterwards; leads break and contacts fail.' },
          { mistake: 'Using a meter on its resistance range to “drain” a capacitor.', correction: 'Meters are not discharge devices and can be damaged.' },
        ],
        demo: {
          title: 'Discharge timer',
          text: 'Use the capacitor discharge demonstration to choose a resistor that brings a 400 V bank below 50 V in a set time, and read the peak current and the absorbed energy.',
          link: to.lab3d('3D laboratory: guided discharge (after F1)', 'lf3k', 'c5'),
          embed: 'cap-discharge',
        },
        activities: [to.proc('Capacitor ESR and discharge check', 'capacitor', 'cap-esr'), to.lib('Capacitor', 'capacitor')],
        check: [
          { id: 'k1', type: 'numeric', prompt: 'Peak current discharging 300 V through 15 kΩ (mA)?', answer: 20, tol: 0.01, unit: 'mA', explain: '300/15 000 = 0.02 A.' },
          { id: 'k2', type: 'numeric', prompt: 'Energy absorbed discharging 1000 µF from 100 V to 0 V (J)?', answer: 5, tol: 0.01, unit: 'J', explain: '½ × 0.001 × 100² = 5 J.' },
          { id: 'k3', type: 'mcq', prompt: 'After applying a discharge resistor, you must…', options: ['measure the voltage with a verified tester', 'touch the terminals to check', 'assume it is discharged', 'apply it again without measuring'], answer: 0, explain: 'Measurement is the proof.' },
          { id: 'k4', type: 'mcq', prompt: 'Why is a very low-resistance short dangerous for discharging?', options: ['It releases the energy in microseconds as an arc with kiloampere currents', 'It is too slow', 'It charges the capacitor', 'It is safe'], answer: 0, explain: 'I = V/R becomes enormous.' },
        ],
        summary: [
          'Wait the stated discharge time, then measure with a verified tester.',
          'If discharge is needed, use a rated resistor with insulated probes for ≥ 5τ.',
          'R from t = RC·ln(V₀/V_s); peak current V₀/R; the resistor absorbs ½C(V₀² − V_s²).',
          'Never use a screwdriver, a wire or a meter to discharge.',
          'Always verify by measurement; re-check large banks for recovery voltage.',
        ],
        homework: {
          id: 'F1.M3.L3.hw',
          title: 'Discharge design',
          brief: 'A 680 µF bank at 380 V must reach 50 V within 15 s.',
          tasks: [
            { id: 'h1', type: 'numeric', prompt: 'Largest discharge resistance (kΩ)?', answer: 10.88, tol: 0.03, unit: 'kΩ', explain: 'R = 15 / (680 × 10⁻⁶ × ln(7.6)) = 15 / (680 × 10⁻⁶ × 2.028) = 10.88 kΩ.' },
            { id: 'h2', type: 'numeric', prompt: 'Peak current with a 10 kΩ resistor (mA)?', answer: 38, tol: 0.01, unit: 'mA', explain: '380/10 000 = 38 mA.' },
            { id: 'h3', type: 'numeric', prompt: 'Energy absorbed from 380 V to 50 V (J)?', answer: 48.25, tol: 0.02, unit: 'J', explain: '½ × 680 × 10⁻⁶ × (144 400 − 2500) = 48.2 J.' },
          ],
          written: [{ prompt: 'Describe the complete discharge-and-verify procedure for this bank, starting from an isolated inverter.', model: 'Confirm isolation is locked; wait the labelled discharge time; verify the tester on a proving unit; measure the bank voltage; if above 50 V apply a rated 10 kΩ discharge tool across the terminals for at least 5τ (≈ 34 s); remove it; measure again (and again after a minute for recovery); re-verify the tester; only then touch internal parts.' }],
        },
      },
    },
  ],
  quiz: {
    pass: 0.8,
    questions: [
      { id: 'q1', type: 'mcq', prompt: 'What does “securing” an isolation mean?', options: ['Locking and tagging the isolator so it cannot be switched on', 'Switching off the load', 'Testing the tester', 'Removing the cover'], answer: 0, explain: 'Securing prevents re-energisation.' },
      { id: 'q2', type: 'mcq', prompt: 'Which order is correct?', options: ['Isolate → secure → dissipate stored energy → prove dead', 'Prove dead → isolate → secure', 'Work → isolate → prove dead', 'Dissipate → isolate → work'], answer: 0, explain: 'Prove dead only after sources are secured and stored energy removed.' },
      { id: 'q3', type: 'mcq', prompt: 'A reading of 40 V between neutral and earth on an isolated circuit suggests…', options: ['a shared (borrowed) neutral from another live circuit', 'a safe circuit', 'a faulty earth rod only', 'a flat tester battery'], answer: 0, explain: 'The neutral carries another circuit’s current.' },
      { id: 'q4', type: 'mcq', prompt: 'Which instrument is acceptable proof of dead?', options: ['A two-pole voltage tester verified before and after on a proving unit', 'A non-contact detector', 'A multimeter on the current range', 'The equipment’s display'], answer: 0, explain: 'Only a verified two-pole tester proves dead.' },
      { id: 'q5', type: 'numeric', prompt: 'Largest R to discharge 1000 µF from 200 V to 50 V within 5 s (kΩ)?', answer: 3.607, tol: 0.03, unit: 'kΩ', explain: 'R = 5/(0.001 × ln 4) = 5/1.386 = 3.61 kΩ.' },
      { id: 'q6', type: 'mcq', prompt: 'Three technicians work on one battery bank. The isolator carries…', options: ['three personal locks', 'one shared lock', 'a tag only', 'no lock if they are careful'], answer: 0, explain: 'Each worker has their own lock.' },
      { id: 'q7', type: 'mcq', prompt: 'A DC bus reads 62 V and falling during proving dead. You…', options: ['wait and test again until below the safe level', 'start work', 'conclude the tester is faulty', 'short it with a screwdriver'], answer: 0, explain: 'The capacitors are still discharging.' },
      { id: 'q8', type: 'multi', prompt: 'Which are NOT valid means of isolation? (select all)', options: ['The inverter’s on/off button', 'The inverter’s transistors', 'A lockable switch-disconnector', 'A removed and retained fuse'], answers: [0, 1], explain: 'Control buttons and semiconductors are never isolation.' },
    ],
  },
  assignment: {
    id: 'F1.M3.asg',
    title: 'Module assignment: isolation procedure for an inverter repair',
    brief: 'A 5 kW hybrid inverter (grid input, 48 V battery, one PV string) has a 420 V internal bus with 560 µF and 200 kΩ bleeders. Its output terminal block must be replaced.',
    tasks: [
      { id: 'a1', type: 'numeric', prompt: 'Bus energy at 420 V (J)?', answer: 49.39, tol: 0.02, unit: 'J', explain: '½ × 560 × 10⁻⁶ × 176 400 = 49.4 J.' },
      { id: 'a2', type: 'numeric', prompt: 'Bleeder time to 50 V (s)?', answer: 238.3, tol: 0.03, unit: 's', explain: 'τ = 112 s; t = 112 × ln(8.4) = 112 × 2.128 = 238 s.' },
      { id: 'a3', type: 'numeric', prompt: 'Number of personal locks needed if two technicians isolate grid, battery and PV?', answer: 6, tol: 0.001, unit: '', explain: '3 isolation points × 2 workers = 6 locks (on multi-lock hasps).' },
    ],
    written: [{ prompt: 'Write the complete procedure from identification to restoration.', model: 'Identify grid, battery and PV sources from the labels and diagram; inform occupants; switch off loads; open and lock (each technician’s lock) the grid breaker, battery breaker and PV isolator, tag each; wait ≥ 4 minutes; verify the tester on a proving unit; prove dead at the output terminals (L–N, L–E, N–E) and on the DC bus (+/−, + and − to earth); re-verify the tester; replace the terminal block; refit covers, remove tools, inform; each technician removes their own locks; energise in the manufacturer’s order and check operation.' }],
  },
  practicals: [
    {
      id: 'F1.M3.P1',
      title: 'Safe isolation sequence drill',
      description: 'Build the safe-isolation procedure for a solar-battery-inverter system: choose the correct steps, reject the unsafe ones and put them in order.',
      task: {
        id: 'f1-isolation-sequence',
        kind: 'sequence',
        title: 'Isolating a solar-battery-inverter system',
        brief: 'You must work on the AC output wiring of an off-grid inverter supplied by a battery bank and a PV string. Choose the steps you would carry out, in order. Some offered steps are wrong or unsafe.',
        steps: [
          'Identify every source from the drawings and labels: battery, PV string, inverter output',
          'Inform the people who use the system',
          'Switch off the loads and the inverter',
          'Open the PV DC isolator and the battery breaker',
          'Lock and tag each isolator with your own lock',
          'Wait for the inverter’s capacitors to discharge (labelled time)',
          'Verify the voltage tester on the proving unit',
          'Test L–N, L–E and N–E at the point of work, and the DC terminals',
          'Verify the voltage tester on the proving unit again',
        ],
        distractors: [
          { text: 'Cover the PV array with a sheet instead of opening the isolator', why: 'A covering can slip or leak light; the PV string must be isolated with its DC isolator.' },
          { text: 'Check for voltage with a non-contact detector only', why: 'Non-contact detectors are not proof of dead and usually cannot detect DC.' },
          { text: 'Discharge the capacitors by shorting them with a screwdriver', why: 'A short releases the energy as a violent arc; use a rated discharge resistor if needed, then measure.' },
        ],
        explain: 'The sequence is identify → inform → switch off → isolate → secure → dissipate stored energy → test the tester → test → test the tester. Every source must be isolated and the result proved by measurement.',
      },
      evidence: { kind: 'task', id: 'f1-isolation-sequence' },
    },
    {
      id: 'F1.M3.P2',
      title: 'Prove-dead drill with a virtual tester',
      description: 'Perform proving dead on an isolated socket circuit, read each result and decide whether it is safe to work.',
      task: {
        id: 'f1-prove-dead',
        kind: 'procedure',
        title: 'Proving dead an isolated circuit',
        brief: 'The breaker for a workshop socket circuit has been opened, locked and tagged. Carry out proving dead at the socket. Choose actions one at a time; each result is shown. Then record your conclusion.',
        actions: [
          { id: 'prove1', label: 'Check the voltage tester on the proving unit', result: 'Tester indicates 230 V on the proving unit: working.' },
          { id: 'ln', label: 'Test line to neutral at the socket', result: 'L–N: 0 V' },
          { id: 'le', label: 'Test line to earth at the socket', result: 'L–E: 0 V' },
          { id: 'ne', label: 'Test neutral to earth at the socket', result: 'N–E: 46 V' },
          { id: 'prove2', label: 'Check the voltage tester on the proving unit again', result: 'Tester indicates 230 V on the proving unit: still working.' },
          { id: 'ncv', label: 'Hold a non-contact detector near the socket', result: 'The detector does not light. (Not proof of dead.)' },
          { id: 'touch', label: 'Touch the socket terminals to confirm they are dead', result: '—', unsafe: 'Never touch conductors to “test” them. Use a verified tester.' },
          { id: 'trust', label: 'Start work because the breaker is locked off', result: '—', unsafe: 'A locked breaker is not proof: prove dead at the point of work first.' },
        ],
        required: ['prove1', 'ln', 'le', 'ne', 'prove2'],
        conclusion: {
          prompt: 'What do you conclude?',
          options: ['The circuit is dead: start work', 'The circuit is NOT dead: the neutral is at 46 V, probably shared with another live circuit; stop, find and isolate it, then test again', 'The tester is faulty'],
          answer: 1,
          explain: 'A verified tester showed 46 V between neutral and earth. The neutral is shared with another circuit that is still live (a borrowed neutral), so the circuit is not safe.',
        },
        explain: 'Test the tester, test every combination, test the tester again — and believe the readings. Testing only L–N would have missed the live neutral.',
      },
      evidence: { kind: 'task', id: 'f1-prove-dead' },
    },
  ],
}
