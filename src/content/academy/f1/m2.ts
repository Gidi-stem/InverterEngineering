import type { AcademyModule } from '../types'
import { to } from '../s1/links'

/** F1.M2 Energy sources and stored energy. */
export const F1_M2: AcademyModule = {
  id: 'F1.M2',
  title: 'Energy sources and stored energy',
  summary: 'The sources of energy in inverter and solar systems — batteries, capacitors, inductors, PV arrays, the grid and generators — and why each stays dangerous after an obvious switch has been turned off.',
  lessons: [
    {
      id: 'F1.M2.L1',
      title: 'Batteries: short-circuit current, gases and chemicals',
      minutes: 35,
      content: {
        objectives: [
          'Calculate the prospective short-circuit current of a battery from its voltage and internal resistance.',
          'Explain the hydrogen, acid and thermal-runaway hazards of lead-acid and lithium batteries.',
          'State the safe-handling rules for battery work.',
          'Explain why a battery cannot be “switched off”.',
        ],
        introduction: `A battery is a store of chemical energy that is always ready to deliver it. There is no switch inside a battery, and it cannot be made dead: its terminals are live as long as it exists. Battery banks in inverter and solar systems hold kilowatt-hours of energy and can deliver thousands of amperes into a fault. Battery safety is therefore the first practical skill of this programme.`,
        lecture: `### A battery as a source with internal resistance

A battery behaves like an ideal voltage source (its [[emf|EMF]]) in series with a small [[internal-resistance|internal resistance]] R_int. When something connects its terminals, the current is

I = V / (R_int + R_external)

With a short circuit (R_external ≈ 0), only R_int limits the current. Healthy batteries have very low internal resistance, which is exactly what makes them good at delivering power.

| Battery (typical values; see the datasheet) | Internal resistance | Prospective short-circuit current |
|---|---|---|
| 12 V, 100 Ah lead-acid | about 5–10 mΩ | about 1.2–2.4 kA |
| 12.8 V, 100 Ah LiFePO₄ | about 2–5 mΩ | a few kA |
| 48 V bank of four 12 V batteries in series | about 4 × the single-battery value | similar order (V and R both scale ×4) |

### Burns, arcs and jewellery

A spanner or a ring across battery terminals carries that current. The metal heats to glowing in seconds, the arc throws molten metal, and the battery can be damaged or explode. **Remove rings, watches and metal bracelets.** Use insulated tools. Keep terminal covers on, and never lay tools on a battery.

### The fuse belongs at the battery

Because a battery cannot be switched off, the cable from it must be protected by a [[fuse]] (or DC breaker) placed **as close to the battery terminal as possible**. That way every metre of cable after it is protected. A short on the unfused stretch between battery and fuse is limited only by R_int.

### Gases and chemicals

**Lead-acid batteries:**
- Vented ("flooded") types release **hydrogen and oxygen** when charged, especially near full charge. Hydrogen is explosive in air between about 4 % and 75 %.
- Battery rooms and enclosures must be **ventilated**. Sparks and flames must be kept away, including the spark from connecting or disconnecting a terminal.
- The electrolyte is **sulphuric acid**: wear eye protection and have water available for flushing.
- Sealed (VRLA, AGM, gel) types release less gas, but can vent if overcharged.

**Lithium batteries:**
- Damage, overcharging, short circuits or internal defects can cause [[thermal-runaway|thermal runaway]]: rapid heating, venting of flammable and toxic gases, and fire.
- Lithium batteries must be used with a battery management system (BMS) that protects the cells.

### Safe handling rules

1. Wear eye protection; remove metal jewellery; use insulated tools.
2. Ventilate; no sparks or flames near vented lead-acid batteries.
3. Fit terminal covers; never lay tools on a battery.
4. Disconnect the **negative** (earthed) lead first and reconnect it last. Then a slip of the spanner from the positive terminal to the earthed frame cannot cause a short.
5. Fuse at the battery; use cable rated for the fuse.
6. Lift heavy batteries correctly. A 100 Ah lead-acid battery weighs around 25–30 kg (typical).`,
        technical: `**Why “disconnect negative first”?** In most vehicle and many DC systems, the negative terminal is connected to the metal frame. While you loosen the positive terminal, your spanner may touch the frame. If the negative is still connected, that completes a short through the spanner. If the negative is already disconnected, there is no return path. The reverse order applies when reconnecting.

**Series and parallel banks.** In series, voltages add (four 12 V batteries make 48 V) and internal resistances add. In parallel, capacities add and the internal resistance falls, so the short-circuit current *increases*. Course F2 covers battery banks in detail, and course P5 covers battery engineering.

**Ventilation calculations.** Standards for stationary batteries give formulas for the required airflow from the charging current and the number of cells. That is specialist installation work (course S3).`,
        diagrams: [{ id: 'battery-model', caption: 'A battery as an EMF in series with its internal resistance. The short-circuit current is limited only by R_int.' }],
        formulas: [
          { name: 'Prospective short-circuit current', expr: 'I_sc = V / (R_int + R_fault)', where: [['V', 'battery EMF', 'V'], ['R_int', 'internal resistance', 'Ω'], ['R_fault', 'resistance of the fault path', 'Ω']] },
          { name: 'Stored energy of a battery', expr: 'E = V · C_Ah', where: [['E', 'energy', 'Wh'], ['C_Ah', 'capacity', 'Ah']] },
        ],
        examples: [
          {
            title: 'Short-circuit current of a lead-acid battery',
            problem: 'A 12 V battery has R_int = 8 mΩ. A tool of 2 mΩ shorts its terminals. Find the current and the power in the tool.',
            steps: ['I = 12 / (0.008 + 0.002) = 12 / 0.010 = 1200 A', 'P_tool = I²R = 1200² × 0.002 = 2880 W'],
            answer: '1200 A and nearly 3 kW in the tool: it glows and melts within seconds.',
          },
          {
            title: 'Energy in a battery bank',
            problem: 'How much energy is stored in a 48 V, 200 Ah battery bank? How long could it supply a 2 kW load (ignoring losses and depth-of-discharge limits)?',
            steps: ['E = 48 × 200 = 9600 Wh = 9.6 kWh', 't = 9600 / 2000 = 4.8 h'],
            answer: '9.6 kWh, enough for 4.8 hours at 2 kW. That energy can be released in a fault in a fraction of a second.',
          },
        ],
        applications: `Battery installation instructions require all of these measures: fuses or breakers at the battery, terminal covers, ventilation of battery rooms and enclosures, eye-wash stations in larger installations, and BMS protection for lithium systems.`,
        mistakes: [
          { mistake: 'Placing the main fuse next to the inverter, two metres from the battery.', correction: 'The cable between battery and fuse is then unprotected. Fit the fuse at the battery.' },
          { mistake: 'Disconnecting the positive terminal first.', correction: 'Disconnect the earthed negative first, so a spanner touching the frame cannot complete a short.' },
          { mistake: 'Charging a vented lead-acid battery in a closed cupboard.', correction: 'Hydrogen accumulates; ventilate and keep sparks away.' },
        ],
        demo: {
          title: 'Battery under load and in a fault',
          text: 'Change the load resistance on a battery model from normal loads down to a short circuit, and watch the terminal voltage, the current and the heat in the internal resistance.',
          link: to.lib('Battery terminals', 'battery-terminals'),
          embed: 'battery-load',
        },
        activities: [to.lib('Battery terminals', 'battery-terminals'), to.lib('Fuse', 'fuse'), to.lab3d('LF-3K battery terminals', 'lf3k', 'bat-pos')],
        check: [
          { id: 'k1', type: 'numeric', prompt: 'Short-circuit current of a 24 V battery with R_int = 12 mΩ and a 3 mΩ fault (A)?', answer: 1600, tol: 0.01, unit: 'A', explain: '24/0.015 = 1600 A.' },
          { id: 'k2', type: 'mcq', prompt: 'Which terminal should be disconnected first in a system with an earthed negative?', options: ['Negative', 'Positive', 'Either', 'Both at once'], answer: 0, explain: 'Removing the earthed negative removes the return path for an accidental short.' },
          { id: 'k3', type: 'mcq', prompt: 'Which gas is released by vented lead-acid batteries during charging?', options: ['Hydrogen', 'Carbon monoxide', 'Chlorine', 'Helium'], answer: 0, explain: 'Electrolysis of the electrolyte releases hydrogen and oxygen.' },
          { id: 'k4', type: 'numeric', prompt: 'Energy stored in a 12 V, 150 Ah battery (Wh)?', answer: 1800, tol: 0.01, unit: 'Wh', explain: '12 × 150 = 1800 Wh.' },
        ],
        summary: [
          'A battery cannot be switched off; its terminals are always live.',
          'Short-circuit current = V/(R_int + R_fault): often thousands of amperes.',
          'Fuse at the battery; remove jewellery; use insulated tools; keep terminal covers on.',
          'Lead-acid releases explosive hydrogen and contains acid; lithium can enter thermal runaway.',
          'Disconnect the earthed negative first and reconnect it last.',
        ],
        homework: {
          id: 'F1.M2.L1.hw',
          title: 'Battery hazards',
          brief: 'A 48 V bank of four 12 V batteries in series, each with R_int = 6 mΩ.',
          tasks: [
            { id: 'h1', type: 'numeric', prompt: 'Total internal resistance (mΩ)?', answer: 24, tol: 0.01, unit: 'mΩ', explain: '4 × 6 = 24 mΩ.' },
            { id: 'h2', type: 'numeric', prompt: 'Prospective short-circuit current at the bank terminals (A)?', answer: 2000, tol: 0.01, unit: 'A', explain: '48/0.024 = 2000 A.' },
            { id: 'h3', type: 'numeric', prompt: 'Two such banks in parallel: short-circuit current (A)?', answer: 4000, tol: 0.01, unit: 'A', explain: 'R halves to 12 mΩ: 48/0.012 = 4000 A.' },
          ],
          written: [{ prompt: 'Write the safe sequence for disconnecting a battery from an inverter for maintenance.', model: 'Switch the inverter and loads off; open the battery fuse or isolator; remove jewellery and wear eye protection; with insulated tools, disconnect the negative lead first, then the positive; fit terminal covers; prove dead on the inverter side before working on it.' }],
        },
      },
    },
    {
      id: 'F1.M2.L2',
      title: 'Capacitors and inductors: stored energy',
      minutes: 35,
      content: {
        objectives: [
          'Calculate the energy stored in a capacitor and in an inductor.',
          'Calculate the time a capacitor takes to discharge through a resistor.',
          'Explain why opening an inductive circuit causes a high-voltage spike.',
          'Explain why equipment can stay dangerous after it is switched off.',
        ],
        introduction: `Switching off a supply stops new energy arriving. It does not remove energy already stored inside the equipment. Inverters contain large capacitor banks that can hold a lethal charge for minutes after switch-off. They also contain inductors and transformers that release their stored energy as a violent voltage spike when their current is interrupted.`,
        lecture: `### Capacitors

A capacitor stores energy in the electric field between two plates. Its stored energy is

E = ½ · C · V²

where C is the capacitance in farads and V is the voltage. Because the energy rises with V², high-voltage capacitors are especially dangerous.

| Capacitor (typical inverter values) | Voltage | Stored energy |
|---|---|---|
| 4700 µF battery-bus capacitor | 28.8 V | about 2 J: a spark hazard |
| 470 µF HV bus capacitor | 400 V | about 38 J: a dangerous shock |
| 1000 µF photo-flash type | 330 V | about 54 J |

A capacitor stays charged after the supply is removed, unless something discharges it.

### Discharge through a resistor

Connected to a resistor R, a capacitor's voltage decays exponentially:

v(t) = V₀ · e^(−t / RC)

The product RC is the [[time-constant|time constant]] τ. After one τ the voltage is 37 % of V₀; after 5τ it is below 1 %. The time to reach a safe voltage V_s is

t = RC · ln(V₀ / V_s)

Equipment is fitted with [[bleeder]] resistors that discharge the capacitors after switch-off. But bleeders can fail, and the waiting time may be minutes, so the rule is: **wait, then verify with a meter** (lesson F1.M3.L3).

### Inductors

An inductor, such as a coil, a transformer winding or a motor, stores energy in its magnetic field:

E = ½ · L · I²

An inductor resists any change in its current. If you suddenly open a circuit carrying current through an inductor, the inductor generates whatever voltage it takes to keep the current flowing for an instant: V = L · di/dt. Interrupting current quickly can therefore produce hundreds or thousands of volts, enough to:

- jump across switch contacts as an arc;
- destroy semiconductors;
- give a shock even from a low-voltage circuit.

This is why relay coils have diodes across them, and why inverter switches have snubbers and clamps. It is also why you must never disconnect a current-carrying coil by hand.

### Practical consequences

- An inverter switched off seconds ago may still have charged bus capacitors.
- A high-frequency or solar inverter's DC bus (several hundred volts) is the most dangerous stored-energy source in the system.
- Large motors, transformers and long cables can also hold or generate energy after disconnection.`,
        technical: `**Why ln appears.** The discharge current i = v/R removes charge at a rate proportional to the voltage itself, which gives the exponential solution. Taking logarithms of v(t) = V₀ e^(−t/τ) gives t = τ ln(V₀/v).

**Dielectric absorption.** Large electrolytic capacitors can partly recharge themselves after being discharged ("soakage"), as charge trapped in the dielectric returns. A capacitor discharged to zero can read several volts a few minutes later. That is one reason why large capacitors are stored with shorting links, and why voltage is re-checked before work.

**Spike magnitude.** If 2 A in a 0.5 H relay coil is interrupted in 10 µs, L·di/dt = 0.5 × 2 / 10⁻⁵ = 100 000 V in theory. In practice the voltage rises until something breaks down — an arc across the contacts, or a semiconductor — which is exactly the damage engineers design against.`,
        diagrams: [{ id: 'rc-curve', caption: 'Capacitor discharge through a bleeder: after each time constant the voltage falls to 37 % of its previous value.' }],
        formulas: [
          { name: 'Energy in a capacitor', expr: 'E = ½ · C · V²', where: [['C', 'capacitance', 'F'], ['V', 'voltage', 'V'], ['E', 'energy', 'J']] },
          { name: 'Discharge time', expr: 't = R · C · ln(V₀ / V_s)', where: [['R', 'discharge resistance', 'Ω'], ['V₀', 'initial voltage', 'V'], ['V_s', 'safe voltage', 'V']] },
          { name: 'Energy in an inductor', expr: 'E = ½ · L · I²', where: [['L', 'inductance', 'H'], ['I', 'current', 'A']] },
          { name: 'Inductive voltage', expr: 'V = L · di/dt', where: [['di/dt', 'rate of change of current', 'A/s']] },
        ],
        examples: [
          {
            title: 'Energy and waiting time for an HV bus',
            problem: 'A 330 µF bus capacitor is charged to 380 V and has a 220 kΩ bleeder. Find its energy and the time to fall below 50 V.',
            steps: ['E = ½ × 330 × 10⁻⁶ × 380² = ½ × 3.3 × 10⁻⁴ × 144 400 = 23.8 J', 'τ = 220 000 × 330 × 10⁻⁶ = 72.6 s', 't = 72.6 × ln(380/50) = 72.6 × 2.028 = 147 s'],
            answer: '23.8 J, and about 2½ minutes to fall below 50 V, if the bleeder is working.',
          },
          {
            title: 'Energy in an inductor',
            problem: 'An output inductor of 2 mH carries 20 A. How much energy does it store?',
            steps: ['Inductor energy: E = ½ · L · I²', 'E = ½ × 0.002 × 20² = ½ × 0.002 × 400 = 0.4 J'],
            answer: '0.4 J: small, but released in microseconds when the current is interrupted, so the resulting voltage spike can still destroy a switch.',
          },
        ],
        applications: `Inverter service manuals state the capacitor discharge time and require the bus voltage to be measured before work. Relay coils carry flyback diodes. Snubber circuits protect inverter switches from inductive spikes. The 3D laboratory's guided procedure includes a verified discharge before any internal part may be touched.`,
        mistakes: [
          { mistake: '“The display went dark, so the capacitors are empty.”', correction: 'Displays turn off at a much higher voltage than is safe. Measure the bus voltage.' },
          { mistake: 'Shorting a large capacitor with a screwdriver to discharge it.', correction: 'This causes a violent arc, can weld the tool and damage the capacitor. Use a rated discharge resistor and verify with a meter.' },
          { mistake: 'Assuming low-voltage circuits with coils are harmless to interrupt.', correction: 'Interrupting inductor current produces high-voltage spikes.' },
        ],
        demo: {
          title: 'Capacitor discharge timer',
          text: 'Choose a capacitance, an initial voltage and a bleeder resistance, and watch the voltage decay. Read off the stored energy and the time to reach 50 V.',
          link: to.lab3d('LF-3K bus capacitors', 'lf3k', 'c1'),
          embed: 'cap-discharge',
        },
        activities: [to.lib('Capacitor', 'capacitor'), to.lib('Inductor', 'inductor'), to.lab3d('High-voltage bus capacitors', 'lf3k', 'c5')],
        check: [
          { id: 'k1', type: 'numeric', prompt: 'Energy in 2200 µF at 60 V (J)?', answer: 3.96, tol: 0.01, unit: 'J', explain: '½ × 0.0022 × 3600 = 3.96 J.' },
          { id: 'k2', type: 'numeric', prompt: 'Time constant of 470 µF and 100 kΩ (s)?', answer: 47, tol: 0.01, unit: 's', explain: 'τ = RC = 47 s.' },
          { id: 'k3', type: 'mcq', prompt: 'After 5 time constants, a discharging capacitor has…', options: ['less than 1 % of its initial voltage', '50 % of its voltage', '37 % of its voltage', 'no change'], answer: 0, explain: 'e⁻⁵ ≈ 0.7 %.' },
          { id: 'k4', type: 'mcq', prompt: 'Suddenly opening a circuit carrying current through a coil causes…', options: ['a high-voltage spike', 'the current to vanish harmlessly', 'the coil to cool', 'a lower voltage'], answer: 0, explain: 'V = L·di/dt becomes very large.' },
        ],
        summary: [
          'Capacitors store E = ½CV²; high-voltage buses can hold tens of joules for minutes.',
          'Discharge follows v = V₀·e^(−t/RC); t = RC·ln(V₀/V_s).',
          'Bleeders can fail: wait, then measure.',
          'Inductors store E = ½LI² and produce V = L·di/dt spikes when current is interrupted.',
          'Switching off removes the source, not the stored energy.',
        ],
        homework: {
          id: 'F1.M2.L2.hw',
          title: 'Stored energy calculations',
          brief: 'Use E = ½CV², E = ½LI² and t = RC·ln(V₀/V_s).',
          tasks: [
            { id: 'h1', type: 'numeric', prompt: 'Energy in 680 µF at 400 V (J)?', answer: 54.4, tol: 0.01, unit: 'J', explain: '½ × 680 × 10⁻⁶ × 160 000 = 54.4 J.' },
            { id: 'h2', type: 'numeric', prompt: 'Time for it to fall to 50 V through 150 kΩ (s)?', answer: 212.1, tol: 0.02, unit: 's', explain: 'τ = 102 s; t = 102 × ln(8) = 102 × 2.079 = 212 s.' },
            { id: 'h3', type: 'numeric', prompt: 'Energy in a 10 mH inductor at 15 A (J)?', answer: 1.125, tol: 0.01, unit: 'J', explain: '½ × 0.01 × 225 = 1.125 J.' },
          ],
          written: [{ prompt: 'Why is it not enough to wait the calculated discharge time before touching a capacitor bank?', model: 'The bleeder may have failed (open circuit), leaving the bank charged indefinitely; dielectric absorption can also cause recovery voltage. Only a measurement with a verified meter proves the bank is discharged.' }],
        },
      },
    },
    {
      id: 'F1.M2.L3',
      title: 'Multiple sources: PV arrays, grid, generators and back-feed',
      minutes: 35,
      content: {
        objectives: [
          'Identify every source of energy in a solar, battery and inverter installation.',
          'Explain why a PV array cannot be switched off by daylight and how it is isolated.',
          'Explain back-feed from inverters, UPS units, generators and shared neutrals.',
          'Apply the rule “isolate every source” before work.',
        ],
        introduction: `A simple circuit has one source and one switch. Modern energy systems have many sources:

- the grid;
- a generator;
- a battery bank;
- a PV array;
- the inverter itself, which *creates* AC.

Turning off one of them may leave the others energising the circuit you are about to touch. This lesson trains you to find every source.`,
        lecture: `### Count the sources

In a hybrid solar installation (as in build project H), the sources are:

1. **The grid**, at the AC input.
2. **A generator**, at the AC input, often via a changeover switch.
3. **The battery bank** (DC), which is always live.
4. **The PV array** (DC), live whenever light falls on it.
5. **The inverter output** (AC), generated from the battery or PV even when the grid is off.
6. **Stored energy** in capacitors (lesson L2).

Isolation means making *every one* of these safe for the part you will work on.

### PV arrays cannot be switched off by daylight

A [[pv]] array produces voltage whenever light falls on it, even dim daylight or strong moonlight in some conditions. Its open-circuit voltage ([[voc|V_oc]]) appears even when no current flows, and strings of modules in series reach hundreds of volts DC.

- PV arrays are isolated with **DC isolators** rated for the string voltage and current. Covering the array is not a reliable method.
- PV connectors must not be disconnected under load: a DC arc forms (lesson F1.M1.L3).
- The array's short-circuit current ([[isc|I_sc]]) is only a little above its operating current, so a PV fault may *not* blow a fuse. A PV fault can therefore persist and keep heating.

### Back-feed

[[back-feed|Back-feed]] is energy arriving from an unexpected direction:

- **Inverters and UPS units** produce AC on their outputs from batteries. If an inverter output is wired into a circuit, switching off the grid breaker does not de-energise that circuit.
- **Generators** connected without a proper changeover switch can energise the grid wiring, endangering line workers. That is why grid-tied inverters must have [[anti-islanding]] protection, and generators must connect through a changeover.
- **Borrowed neutrals.** If two circuits share a neutral by mistake, isolating one circuit leaves its neutral carrying the other circuit's current, at a dangerous voltage. That is a [[borrowed-neutral|borrowed neutral]].
- **Capacitors and motors** that are still spinning can generate or hold voltage after isolation.

### The rule

**Identify every source from the drawings and labels, isolate each one, and then prove dead at the point of work.** Never assume that turning off "the main switch" makes everything dead. The proving-dead step (lesson F1.M3.L2) exists precisely because isolation can be incomplete.`,
        technical: `**Why PV short-circuit current does not blow fuses.** A module's short-circuit current is typically only 5–10 % above its maximum-power current (see the module datasheet). A fault between two points of a string may therefore draw no more than normal current from the healthy parts. PV fuses protect against *reverse current* from parallel strings, not against faults within a string (course S2).

**Islanding.** If the grid fails while a grid-tied inverter keeps exporting, a section of the grid could stay energised (an "island"). Certified grid-tied inverters detect loss of grid and stop within a defined time. That is required by grid codes, not optional.

**Labels and drawings.** Installation standards require warning labels at points of connection showing all sources, such as "dual supply" or "PV system". Reading the labels and the single-line diagram is the first step of isolation (course S3).`,
        diagrams: [{ id: 'hybrid-paths', caption: 'Every source in a hybrid system: grid, generator, battery, PV (Phase 7) and the inverter output.' }],
        formulas: [{ name: 'PV string open-circuit voltage', expr: 'V_oc,string = N_series × V_oc,module', where: [['N_series', 'modules in series', '—'], ['V_oc,module', 'module open-circuit voltage', 'V']], note: 'V_oc rises in cold weather (course S2).' }],
        examples: [
          {
            title: 'PV string voltage',
            problem: 'A string has 10 modules in series, each with V_oc = 45 V. What voltage is present at the string connectors in daylight with the isolator open?',
            steps: ['In series, module voltages add; with the isolator open no current flows, so each module sits at V_oc', 'V_oc,string = 10 × 45 = 450 V DC'],
            answer: '450 V DC: a lethal voltage that cannot be switched off at the array, only isolated from the rest of the system.',
          },
          {
            title: 'Counting the sources',
            problem: 'A clinic has a grid supply, a diesel generator, a 48 V battery bank, a PV array and a hybrid inverter. You need to replace the inverter’s output breaker. Which sources must be isolated?',
            steps: ['Grid and generator: they reach the output through the transfer relay', 'Battery: the inverter generates AC from it', 'PV: it can power the inverter directly', 'Then wait for the capacitors to discharge, and prove dead at the breaker'],
            answer: 'All four sources, plus stored energy. Turning off only the grid would leave the breaker live from the inverter.',
          },
        ],
        applications: `Utility workers rely on anti-islanding and changeover switches. Solar installers fit DC isolators and labels at every point. Electricians check for borrowed neutrals when testing circuits. All of these follow from the multiple-source principle.`,
        mistakes: [
          { mistake: 'Covering a PV array with a tarpaulin and treating it as dead.', correction: 'Coverings slip and leak light; isolate with the DC isolator and prove dead.' },
          { mistake: 'Switching off the grid breaker and working on an inverter output circuit.', correction: 'The inverter can back-feed from its battery. Isolate the inverter and the battery too.' },
          { mistake: 'Connecting a generator to a house through a socket (“back-feeding”).', correction: 'This energises the grid wiring and endangers others; use a proper changeover switch.' },
        ],
        demo: {
          title: 'Energy paths in a hybrid inverter',
          text: 'Open build project H and trace every path by which energy reaches the load, including those that remain live when the grid is off.',
          link: to.build('Project H: hybrid inverter energy paths', 'bld-h'),
        },
        activities: [to.lib('Solar (PV) input', 'solar-input'), to.lib('Relay (transfer switching)', 'relay'), to.lab3d('LF-3K PV input terminals', 'lf3k', 'pv-pos')],
        check: [
          { id: 'k1', type: 'numeric', prompt: 'Open-circuit voltage of 12 modules with V_oc = 40 V each in series (V)?', answer: 480, tol: 0.01, unit: 'V', explain: '12 × 40 = 480 V.' },
          { id: 'k2', type: 'mcq', prompt: 'How is a PV array made safe to work on downstream?', options: ['Open its DC isolator and prove dead downstream', 'Wait for a cloud', 'Switch off the inverter display', 'Remove the grid fuse'], answer: 0, explain: 'The array keeps generating; isolate it.' },
          { id: 'k3', type: 'mcq', prompt: 'What is back-feed?', options: ['Energy arriving at an isolated circuit from another source', 'A type of fuse', 'A battery charging stage', 'A cable colour'], answer: 0, explain: 'For example, from an inverter, generator or shared neutral.' },
          { id: 'k4', type: 'multi', prompt: 'Which can keep a circuit live after the grid breaker is opened? (select all)', options: ['An inverter with a battery', 'A PV array feeding an inverter', 'A generator without a changeover', 'An opened DC isolator'], answers: [0, 1, 2], explain: 'An opened isolator is a means of isolation, not a source.' },
        ],
        summary: [
          'Energy systems have many sources: grid, generator, battery, PV, inverter output and stored energy.',
          'PV arrays are live in daylight; isolate them with rated DC isolators.',
          'Back-feed comes from inverters, UPS units, generators and borrowed neutrals.',
          'Identify all sources from drawings and labels, isolate each, then prove dead.',
          'PV faults may not blow fuses, because I_sc is close to the operating current.',
        ],
        homework: {
          id: 'F1.M2.L3.hw',
          title: 'Sources in a system',
          brief: 'A home has a grid supply, a 6 kW hybrid inverter, a 51.2 V LiFePO₄ battery and two PV strings of 9 modules (V_oc = 49 V each).',
          tasks: [
            { id: 'h1', type: 'numeric', prompt: 'Open-circuit voltage of one string (V)?', answer: 441, tol: 0.01, unit: 'V', explain: '9 × 49 = 441 V.' },
            { id: 'h2', type: 'numeric', prompt: 'How many separate energy sources (grid, battery, PV strings counted individually, inverter output)?', answer: 5, tol: 0.001, unit: '', explain: 'Grid, battery, string 1, string 2 and the inverter output: 5.' },
          ],
          written: [{ prompt: 'List the isolation points you would expect to find in this installation.', model: 'Grid supply main switch/breaker; inverter AC output isolator or breaker; battery DC breaker/isolator with fuse; a DC isolator for each PV string (and often an array isolator at the inverter); plus labels warning of multiple supplies.' }],
        },
      },
    },
  ],
  quiz: {
    pass: 0.8,
    questions: [
      { id: 'q1', type: 'numeric', prompt: 'Short-circuit current of a 12 V battery with 6 mΩ internal resistance and a 2 mΩ fault (A)?', answer: 1500, tol: 0.01, unit: 'A', explain: '12/0.008 = 1500 A.' },
      { id: 'q2', type: 'mcq', prompt: 'Where should a battery’s main fuse be placed?', options: ['As close to the battery terminal as possible', 'At the load', 'In the negative after the shunt', 'Anywhere in the cable'], answer: 0, explain: 'It protects all cable downstream.' },
      { id: 'q3', type: 'numeric', prompt: 'Energy in 1000 µF at 300 V (J)?', answer: 45, tol: 0.01, unit: 'J', explain: '½ × 0.001 × 90 000 = 45 J.' },
      { id: 'q4', type: 'numeric', prompt: 'Time to discharge 470 µF from 400 V to 50 V through 100 kΩ (s)?', answer: 97.7, tol: 0.02, unit: 's', explain: 'τ = 47 s; t = 47 × ln 8 = 97.7 s.' },
      { id: 'q5', type: 'mcq', prompt: 'Why can a PV fault persist without blowing a fuse?', options: ['PV short-circuit current is only slightly above normal operating current', 'PV produces AC', 'PV has no voltage', 'PV fuses are always oversized'], answer: 0, explain: 'I_sc is close to I_mp.' },
      { id: 'q6', type: 'mcq', prompt: 'Opening a switch in series with a large coil while current flows causes…', options: ['a high-voltage spike and arcing', 'no effect', 'a reduction of voltage', 'battery charging'], answer: 0, explain: 'V = L·di/dt.' },
      { id: 'q7', type: 'mcq', prompt: 'A grid-tied inverter must stop exporting when the grid fails because of…', options: ['anti-islanding requirements protecting line workers', 'battery wear', 'THD limits', 'low efficiency'], answer: 0, explain: 'An energised island endangers people working on the grid.' },
      { id: 'q8', type: 'multi', prompt: 'Which battery precautions are correct? (select all)', options: ['Remove metal jewellery', 'Ventilate vented lead-acid batteries', 'Disconnect the earthed negative first', 'Lay the spanner on top of the battery'], answers: [0, 1, 2], explain: 'Never lay tools on a battery.' },
    ],
  },
  assignment: {
    id: 'F1.M2.asg',
    title: 'Module assignment: stored energy in an inverter',
    brief: 'A high-frequency inverter has a 48 V battery input with a 10 000 µF input capacitor, and an internal 390 V bus with 470 µF and a 180 kΩ bleeder.',
    tasks: [
      { id: 'a1', type: 'numeric', prompt: 'Energy in the input capacitor at 57.6 V (J)?', answer: 16.59, tol: 0.02, unit: 'J', explain: '½ × 0.01 × 57.6² = 16.6 J.' },
      { id: 'a2', type: 'numeric', prompt: 'Energy in the HV bus at 390 V (J)?', answer: 35.74, tol: 0.02, unit: 'J', explain: '½ × 470 × 10⁻⁶ × 152 100 = 35.7 J.' },
      { id: 'a3', type: 'numeric', prompt: 'Time for the HV bus to fall to 50 V (s)?', answer: 173.8, tol: 0.03, unit: 's', explain: 'τ = 84.6 s; t = 84.6 × ln(7.8) = 84.6 × 2.054 = 173.8 s.' },
    ],
    written: [{ prompt: 'Which of the two capacitors is the greater shock hazard, and why, even though the input capacitor stores a similar order of energy?', model: 'The HV bus: at 390 V it can drive a lethal current through the body, whereas 57.6 V generally cannot overcome dry skin resistance. The input capacitor is mainly a spark and burn hazard.' }],
  },
  practicals: [
    {
      id: 'F1.M2.P1',
      title: 'Stored-energy and fault-current assessment',
      description: 'Calculate the hazards of the energy sources in an inverter installation. All answers must be correct.',
      task: {
        id: 'f1-stored-energy',
        kind: 'calc',
        title: 'Stored energy and fault current',
        brief: 'A 24 V battery bank (two 12 V batteries in series, each R_int = 7 mΩ) supplies an inverter with a 400 V internal bus of 330 µF and a 150 kΩ bleeder.',
        questions: [
          { id: 'c1', type: 'numeric', prompt: 'Prospective short-circuit current at the bank terminals, with a 1 mΩ fault (A)?', answer: 1600, tol: 0.02, unit: 'A', explain: '24/(0.014 + 0.001) = 1600 A.' },
          { id: 'c2', type: 'numeric', prompt: 'Energy stored in the 400 V bus (J)?', answer: 26.4, tol: 0.02, unit: 'J', explain: '½ × 330 × 10⁻⁶ × 160 000 = 26.4 J.' },
          { id: 'c3', type: 'numeric', prompt: 'Minimum waiting time for the bus to fall below 50 V (s)?', answer: 102.9, tol: 0.03, unit: 's', explain: 'τ = 49.5 s; t = 49.5 × ln 8 = 102.9 s.' },
          { id: 'c4', type: 'mcq', prompt: 'After waiting that time, what must you do before touching the bus?', options: ['Measure the bus voltage with a verified tester', 'Nothing more', 'Touch it briefly to check', 'Short it with a screwdriver'], answer: 0, explain: 'The bleeder could have failed: prove dead.' },
        ],
        explain: 'Batteries deliver huge fault currents and cannot be switched off; capacitors hold energy after switch-off. Calculation tells you the scale of the hazard and how long to wait, but only measurement proves it safe.',
      },
      evidence: { kind: 'task', id: 'f1-stored-energy' },
    },
  ],
}
