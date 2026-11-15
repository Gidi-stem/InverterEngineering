import type { AcademyModule } from '../types'
import { to } from '../s1/links'

/** F2.M5 DC sources and DC systems. */
export const F2_M5: AcademyModule = {
  id: 'F2.M5',
  title: 'DC sources and DC systems',
  summary: 'Batteries as real sources with EMF, internal resistance and capacity; the wiring of DC systems — conductor size, voltage drop, fusing and polarity; and diodes and LEDs as one-way devices. This module prepares for battery engineering (P5) and solar design (S2).',
  lessons: [
    {
      id: 'F2.M5.L1',
      title: 'Batteries as sources: EMF, internal resistance, capacity, series and parallel',
      minutes: 40,
      content: {
        objectives: [
          'Model a battery as an EMF in series with an internal resistance and calculate its terminal voltage under load.',
          'Calculate capacity in Ah and Wh, usable energy and runtime.',
          'Configure cells and batteries in series and parallel for a required voltage and capacity.',
          'Explain why terminal voltage sags under load and recovers at rest.',
        ],
        introduction: `A battery is not an ideal voltage source. Its voltage falls when it delivers current, falls as it discharges and depends on temperature and age. Every inverter's low-voltage cut-off, every runtime estimate and every battery-bank design starts from a simple model: an [[emf|EMF]] behind an [[internal-resistance|internal resistance]], with a limited [[capacity]].`,
        lecture: `### The battery model

A battery behaves like an ideal EMF E in series with an internal resistance r. With a load current I:

**V_terminal = E − I · r**

- At no load (open circuit), V = E: the **open-circuit voltage**.
- Under load, the terminal voltage **sags** by I·r. The lost power I²r heats the battery.
- When the load is removed, the voltage **recovers**. That is why a battery's state of charge must be judged at rest, or by a battery monitor, not from its voltage under heavy load.

The short-circuit current is I_sc = E / r: thousands of amperes for a large battery (lesson F1.M2.L1).

### Capacity

- **Ampere-hours (Ah):** the charge a battery delivers over a specified discharge, for example 100 Ah at the 20-hour rate (5 A for 20 h).
- **Watt-hours (Wh):** energy = nominal voltage × Ah. A 12.8 V, 100 Ah battery stores 1280 Wh nominal.
- **C-rate:** current as a multiple of capacity. 0.2C on a 100 Ah battery is 20 A. Lead-acid batteries deliver less than their rated Ah at high rates.

### Usable energy and runtime

Batteries must not be fully discharged routinely:

- **Depth of discharge (DoD):** a typical design value is 50 % for lead-acid and 80–90 % for lithium iron phosphate (LiFePO₄). These are typical design values; the manufacturer's data sets the actual limits and the cycle life that follows.
- **Usable energy** = nominal Wh × DoD.
- **Runtime** = usable energy × inverter efficiency / load power.

### Series and parallel

- **Series** adds voltage at the same Ah: four 12 V, 100 Ah batteries in series give 48 V, 100 Ah (4.8 kWh).
- **Parallel** adds Ah at the same voltage: two 12 V, 100 Ah in parallel give 12 V, 200 Ah (2.4 kWh).
- **Series-parallel:** for 48 V, 200 Ah from 12 V, 100 Ah units, use two parallel strings of four in series (8 batteries, 9.6 kWh).

Rules (from lessons F2.M3.L1 and L2):

- use identical batteries of the same type, age and state of charge;
- fuse parallel strings;
- equalise cable lengths;
- in lithium systems, follow the manufacturer's rules for series and parallel connection and battery management (course P5).

### Chemistries (overview)

- **Lead-acid** (flooded, AGM, gel): mature and inexpensive, heavy, limited DoD, releases hydrogen when charging (ventilation).
- **Lithium iron phosphate (LiFePO₄):** 3.2 V nominal per cell, high DoD, long cycle life, requires a battery management system (BMS).

Course P5 covers chemistries, charging and battery management in depth.`,
        technical: `**Measuring internal resistance.** Apply a known load step ΔI and measure the voltage change ΔV: r = ΔV/ΔI. For example, a voltage that falls from 12.80 V to 12.62 V when 60 A is applied gives r = 0.18/60 = 3 mΩ (including terminal contacts).

**Why voltage is a poor fuel gauge for LiFePO₄.** Its open-circuit voltage is very flat across most of the state-of-charge range, so a few tens of millivolts separate 30 % and 70 %. Battery monitors count charge in and out (coulomb counting) instead.

**Temperature.** Cold raises internal resistance and reduces available capacity. Lithium batteries must not be charged below their specified minimum temperature (often around 0 °C); the BMS enforces this. Values given in this lesson are typical, for learning; real designs use the manufacturer's datasheet.`,
        diagrams: [{ id: 'battery-model', caption: 'A battery modelled as an EMF E with internal resistance r: the terminal voltage falls by I·r under load.' }],
        formulas: [
          { name: 'Terminal voltage', expr: 'V = E − I · r', where: [['E', 'EMF (open-circuit voltage)', 'V'], ['r', 'internal resistance', 'Ω']] },
          { name: 'Energy capacity', expr: 'E_Wh = V_nom · Ah', where: [] },
          { name: 'Runtime', expr: 't = (E_Wh · DoD · η) / P_load', where: [['DoD', 'allowed depth of discharge', '—'], ['η', 'inverter efficiency', '—'], ['P_load', 'load power', 'W']] },
        ],
        examples: [
          {
            title: 'Terminal voltage under load',
            problem: 'A battery with E = 25.6 V and r = 12 mΩ supplies 80 A. Find the terminal voltage and the internal loss.',
            steps: ['V = 25.6 − 80 × 0.012 = 25.6 − 0.96 = 24.64 V', 'Loss = I²r = 80² × 0.012 = 76.8 W'],
            answer: '24.64 V at the terminals; 76.8 W of heat inside the battery.',
          },
          {
            title: 'Runtime of an inverter load',
            problem: 'A 12.8 V, 200 Ah LiFePO₄ battery (80 % DoD) supplies a 300 W AC load through an inverter with η = 0.90. Estimate the runtime.',
            steps: ['Energy: 12.8 × 200 = 2560 Wh; usable = 2560 × 0.8 = 2048 Wh', 'Runtime = 2048 × 0.90 / 300 = 6.14 h'],
            answer: 'About 6.1 hours.',
          },
        ],
        applications: `Battery bank design for inverters and solar systems (courses S1, S2, P5), low-voltage cut-off settings, and diagnosing weak batteries from voltage sag all use this model.`,
        mistakes: [
          { mistake: 'Judging state of charge from voltage under heavy load.', correction: 'Voltage sags by I·r under load; judge at rest or use a battery monitor.' },
          { mistake: 'Calculating runtime from the full nominal capacity.', correction: 'Apply the allowed depth of discharge and the inverter efficiency.' },
          { mistake: 'Mixing old and new, or different-capacity, batteries in one bank.', correction: 'Use identical batteries of the same age and state of charge.' },
        ],
        demo: {
          title: 'Battery under load',
          text: 'Change the load current and internal resistance to see the terminal voltage sag, the internal heat and the runtime for a given capacity and depth of discharge.',
          link: to.lib('Battery terminals', 'battery-terminals'),
          embed: 'battery-load',
        },
        activities: [to.lib('Battery terminals', 'battery-terminals'), to.proc('Terminal voltage-drop test', 'battery-terminals', 'terminal-drop'), to.lab3d('LF-3K battery input', 'lf3k', 'bat-pos')],
        check: [
          { id: 'k1', type: 'numeric', prompt: 'Terminal voltage: E = 12.9 V, r = 15 mΩ, I = 40 A (V)?', answer: 12.3, tol: 0.01, unit: 'V', explain: '12.9 − 0.6.' },
          { id: 'k2', type: 'numeric', prompt: 'Energy of a 48 V, 100 Ah battery (kWh)?', answer: 4.8, tol: 0.01, unit: 'kWh', explain: '48 × 100 = 4800 Wh.' },
          { id: 'k3', type: 'numeric', prompt: 'Number of 3.2 V LiFePO₄ cells for a 25.6 V battery?', answer: 8, tol: 0.001, unit: '', explain: '25.6/3.2.' },
          { id: 'k4', type: 'mcq', prompt: 'Four 12 V, 100 Ah batteries for 24 V, 200 Ah are connected…', options: ['two in series, and two such strings in parallel', 'all four in series', 'all four in parallel', 'three in series, one in parallel'], answer: 0, explain: '2S2P.' },
        ],
        summary: [
          'Battery model: EMF E with internal resistance r; V = E − I·r.',
          'Capacity in Ah (charge) and Wh (energy = V × Ah).',
          'Usable energy = Wh × DoD; runtime = usable × η / load.',
          'Series adds voltage; parallel adds Ah; use identical units and fuse parallel strings.',
          'Real limits come from the manufacturer’s data.',
        ],
        homework: {
          id: 'F2.M5.L1.hw',
          title: 'Battery calculations',
          brief: 'A 24 V lead-acid bank (50 % DoD) must run a 400 W load for 5 hours through a 90 % efficient inverter.',
          tasks: [
            { id: 'h1', type: 'numeric', prompt: 'Energy drawn from the battery (Wh)?', answer: 2222, tol: 0.01, unit: 'Wh', explain: '400 × 5 / 0.9 = 2222 Wh.' },
            { id: 'h2', type: 'numeric', prompt: 'Nominal capacity needed (Wh)?', answer: 4444, tol: 0.01, unit: 'Wh', explain: '2222 / 0.5.' },
            { id: 'h3', type: 'numeric', prompt: 'Capacity in Ah at 24 V?', answer: 185.2, tol: 0.01, unit: 'Ah', explain: '4444/24 = 185 Ah.' },
          ],
          written: [{ prompt: 'A battery reads 12.1 V while a 1 kW inverter is running and 12.7 V a few minutes after it stops. Explain the difference and which reading indicates its state of charge.', model: 'Under load the terminal voltage sags by I·r (plus a slower chemical polarisation); when the load is removed it recovers towards its open-circuit voltage. The rested reading (12.7 V) indicates state of charge; the loaded reading mainly reflects internal resistance and current.' }],
        },
      },
    },
    {
      id: 'F2.M5.L2',
      title: 'DC system wiring: conductor size, voltage drop, fusing and polarity',
      minutes: 40,
      content: {
        objectives: [
          'Calculate voltage drop in a DC cable and select a cross-section for a drop limit.',
          'Check a cable against its current-carrying capacity and choose its protection.',
          'Explain DC polarity conventions, marking and the consequences of reverse polarity.',
          'Design the wiring of a simple battery-inverter circuit.',
        ],
        introduction: `DC systems run at low voltage and high current, so their wiring is dominated by two questions: will the cable overheat, and how much voltage will it lose? A third question, polarity, is unique to DC: connect it backwards and many devices are destroyed. This lesson combines resistance (F2.M2), Ohm's law and protection (F1.M4) into a design method.`,
        lecture: `### Voltage drop

The [[voltage-drop|voltage drop]] along a DC cable is the current times the round-trip resistance:

**V_drop = I · R_cable = I · ρ · (2 · L_route) / A**

As a percentage of the system voltage: drop % = V_drop / V_system × 100.

**Typical design limits** (installation guidance and manufacturers commonly use values of this order; check the applicable rules):

- **battery to inverter:** 1–3 %;
- **PV array to controller:** 1–3 %;
- **DC loads (lighting):** up to 3–5 %.

A large drop wastes energy and makes the inverter see a lower voltage, triggering low-voltage cut-off early.

### Selecting the cross-section for a drop limit

Rearranging:

**A = ρ · 2 · L_route · I / V_drop,max**

Then choose the next larger standard size: 1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120 mm².

### Current-carrying capacity

Separately, the cable must carry the current without overheating. Its [[ampacity|current-carrying capacity]] I_z depends on the cross-section, insulation, installation method, grouping and ambient temperature. It comes from the cable manufacturer's tables or the wiring regulations, never from guesswork.

The chosen cable must satisfy **both** the voltage-drop limit and I_b ≤ I_n ≤ I_z (lesson F1.M4.L1). Low-voltage battery cables are usually sized by voltage drop; long, low-current runs by voltage drop; short, high-current runs by current capacity.

### Fusing

- Fuse at the **source end** (the battery positive), as close to the terminal as practical, so the whole cable is protected.
- Use DC-rated devices with adequate breaking capacity (F1.M4.L1).
- Parallel batteries and strings need branch protection where required (F2.M3.L2).

### Polarity

[[polarity|Polarity]] means which conductor is positive. Conventions:

- red (or marked +) for positive; black (or marked −) for negative. Some installation standards use other colour codes, such as brown and grey; follow the applicable rules and label clearly.
- Terminals are marked + and −.

**Reverse polarity** — connecting a battery backwards — forward-biases protection diodes and MOSFET body diodes inside an inverter, creating a short circuit that blows the fuse at best and destroys the input stage at worst. Many devices include reverse-polarity protection; many do not. **Check polarity with a meter before the final connection.**

### Connection quality

- crimp lugs with the correct tool and die for the cable size;
- tighten to the specified torque;
- protect terminals with covers;
- keep positive and negative cables together to reduce loop inductance and magnetic fields.`,
        technical: `**Why keep conductors together?** Separated positive and negative cables form a large loop. At the high, pulsed currents an inverter draws, that loop has significant inductance, causing voltage spikes on the DC bus and radiated interference. Twisting or bundling the pair reduces it.

**Temperature and drop.** Hot cables have higher resistance (≈ +0.39 %/°C for copper). Calculations at 20 °C slightly underestimate the drop of a heavily loaded cable at operating temperature; a margin covers this.

**The circuit laboratory.** Its validator warns when a circuit draws more current than a wire or component is rated for, and flags reversed electrolytic capacitors and diodes: the same polarity and rating checks applied to real installations.`,
        diagrams: [{ id: 'voltage-drop', caption: 'Voltage drop along the positive and negative conductors: the load sees V_battery − I·R_cable.' }],
        formulas: [
          { name: 'Voltage drop', expr: 'V_drop = I · ρ · 2L / A', where: [['L', 'route length', 'm'], ['A', 'cross-section', 'mm²'], ['ρ', '0.0172 for copper', 'Ω·mm²/m']] },
          { name: 'Cross-section for a drop limit', expr: 'A = ρ · 2L · I / V_drop,max', where: [] },
          { name: 'Drop as a percentage', expr: 'drop % = V_drop / V_system × 100', where: [] },
        ],
        examples: [
          {
            title: 'Sizing a battery cable by voltage drop',
            problem: 'A 24 V inverter draws up to 110 A from a battery 2.5 m away. Size the copper cable for a maximum 2 % drop.',
            steps: ['V_drop,max = 0.02 × 24 = 0.48 V', 'A = 0.0172 × 5 × 110 / 0.48 = 19.7 mm² → next standard size 25 mm²', 'Check actual drop: 110 × 0.0172 × 5 / 25 = 0.378 V (1.6 %) ✓'],
            answer: '25 mm², giving a 1.6 % drop. Then check its current-carrying capacity in the manufacturer’s table is above the fuse rating.',
          },
          {
            title: 'Checking an existing cable',
            problem: 'A 12 V, 1000 W inverter (η = 0.9, current at 12 V) uses 16 mm² cable over a 3 m route. What is the drop?',
            steps: ['I = 1000 / (0.9 × 12) = 92.6 A', 'V_drop = 92.6 × 0.0172 × 6 / 16 = 0.597 V = 5.0 % of 12 V'],
            answer: '5 %: too high. The inverter would reach low-voltage cut-off early. Use a larger cable (35 mm² gives 2.3 %) or shorten the run.',
          },
        ],
        applications: `Battery-inverter cabling, PV string and array cables, DC load circuits in vehicles, boats and cabins, and telecom DC plants. Course S2's design tool applies these calculations to every cable in a solar system.`,
        mistakes: [
          { mistake: 'Sizing a cable by current alone at low voltage.', correction: 'Check the voltage drop too; at 12–48 V it usually decides the size.' },
          { mistake: 'Using the route length instead of twice the route length.', correction: 'The current flows out and back.' },
          { mistake: 'Making the final battery connection without checking polarity.', correction: 'Verify + and − with a meter first; reverse polarity destroys many inverters.' },
        ],
        demo: {
          title: 'Voltage drop calculator',
          text: 'Vary the current, route length, cross-section and system voltage and watch the drop percentage, the cable loss and the voltage the load sees.',
          link: to.lib('DC input', 'dc-input'),
          embed: 'voltage-drop',
        },
        activities: [to.lib('DC input', 'dc-input'), to.proc('DC lug inspection', 'dc-input', 'dclug-inspect'), to.lib('Fuse', 'fuse'), to.lab3d('LF-3K battery fuse', 'lf3k', 'fuse')],
        check: [
          { id: 'k1', type: 'numeric', prompt: 'Drop for 50 A on a 4 m route of 25 mm² (V)?', answer: 0.275, tol: 0.01, unit: 'V', explain: '50 × 0.0172 × 8/25 = 0.275 V.' },
          { id: 'k2', type: 'numeric', prompt: 'Minimum cross-section: 12 V, 60 A, 2 m route, 3 % drop (mm²)?', answer: 11.47, tol: 0.01, unit: 'mm²', explain: '0.0172 × 4 × 60/0.36 = 11.47 → 16 mm².' },
          { id: 'k3', type: 'mcq', prompt: 'Where is the main fuse of a battery circuit placed?', options: ['As close as practical to the battery positive terminal', 'At the inverter end', 'In the negative cable only', 'Anywhere'], answer: 0, explain: 'So the whole cable is protected.' },
          { id: 'k4', type: 'mcq', prompt: 'A battery is connected in reverse to an inverter without polarity protection. Likely result?', options: ['Large current through internal diodes, blowing the fuse or destroying the input stage', 'The inverter runs backwards', 'Nothing', 'Higher output voltage'], answer: 0, explain: 'Body diodes conduct in reverse.' },
        ],
        summary: [
          'V_drop = I·ρ·2L/A; keep battery and PV drops to a few per cent.',
          'Size A for the drop limit, then check current capacity from manufacturer tables.',
          'Satisfy both the drop limit and I_b ≤ I_n ≤ I_z.',
          'Fuse at the battery positive with DC-rated devices.',
          'Mark and check polarity before connecting; keep + and − together.',
        ],
        homework: {
          id: 'F2.M5.L2.hw',
          title: 'DC cable design',
          brief: 'A 48 V inverter draws 70 A from a battery with a 6 m cable route. Standard sizes: 10, 16, 25, 35 mm². Limit: 1.5 %.',
          tasks: [
            { id: 'h1', type: 'numeric', prompt: 'Maximum drop (V)?', answer: 0.72, tol: 0.01, unit: 'V', explain: '0.015 × 48.' },
            { id: 'h2', type: 'numeric', prompt: 'Minimum cross-section (mm²)?', answer: 20.07, tol: 0.01, unit: 'mm²', explain: '0.0172 × 12 × 70/0.72 = 20.07 → 25 mm².' },
            { id: 'h3', type: 'numeric', prompt: 'Actual drop with 25 mm² (%)?', answer: 1.204, tol: 0.01, unit: '%', explain: '70 × 0.0172 × 12/25 = 0.578 V = 1.20 %.' },
          ],
          written: [{ prompt: 'Why is a 48 V system easier to wire than a 12 V system of the same power?', model: 'For the same power, 48 V draws a quarter of the current of 12 V, so the same cable has a quarter of the voltage drop in volts — one-sixteenth as a percentage of the higher system voltage — and one-sixteenth of the I²R loss; much smaller cables meet the limits.' }],
        },
      },
    },
    {
      id: 'F2.M5.L3',
      title: 'Diodes and LEDs: one-way valves and current limiting',
      minutes: 35,
      content: {
        objectives: [
          'Explain forward and reverse bias of a diode and its forward voltage.',
          'Identify anode and cathode and predict whether a diode conducts.',
          'Calculate an LED series resistor and its power.',
          'Describe the main uses of diodes in DC and inverter systems.',
        ],
        introduction: `A [[diode]] lets current flow one way only. That simple property is used throughout power electronics: rectifiers, reverse-polarity protection, freewheeling paths for inductors (F2.M4.L2), solar bypass and blocking diodes, and the body diode inside every MOSFET. The [[led|LED]] is a diode that emits light, and it is the classic first example of designing a current limit. This lesson's practical is ckt-02.`,
        lecture: `### Forward and reverse bias

A diode has two terminals: the **anode (A)** and the **cathode (K)**. The cathode is marked with a band on the body; on the symbol, the arrow points from anode to cathode, in the direction of conventional current.

- **Forward bias** (anode more positive than cathode): once the voltage exceeds the **forward voltage V_f**, the diode conducts and its voltage stays close to V_f whatever the current. Typical V_f: about 0.6–0.7 V for a silicon diode, 0.2–0.4 V for a Schottky diode, roughly 1.8–3.3 V for LEDs depending on colour.
- **Reverse bias** (cathode more positive): almost no current flows, up to the **reverse voltage rating**. Beyond it the diode breaks down.

The diode is **non-ohmic** (lesson F2.M2.L2): its current rises very steeply above V_f, so it must never be connected directly across a voltage source without something to limit the current.

### Ratings

- maximum forward current (average and surge);
- maximum reverse voltage;
- power dissipation: P = V_f · I (a 0.7 V diode carrying 10 A dissipates 7 W and needs a heat sink).

### LEDs and current limiting

An LED needs a set current, typically a few to 20 mA for indicator LEDs. With a supply V_s, a series resistor sets it:

**R = (V_s − V_f) / I_LED**

Choose the next standard value up (lower current), and check the resistor power, P = I² · R.

Without the resistor, the LED's current would be limited only by the supply's internal resistance: it would burn out instantly. Reversed, the LED does not light, and a large reverse voltage can damage it (LED reverse ratings are often only about 5 V).

### Uses in DC and inverter systems

- **Rectifiers:** converting AC to DC (course F3).
- **Reverse-polarity protection:** a series diode blocks a reversed battery, at the cost of a forward-voltage drop and loss.
- **Freewheeling diodes** across inductive loads.
- **Blocking and bypass diodes** in PV modules and arrays (course S2).
- **MOSFET body diodes** carrying current during dead time in inverter bridges.
- **Indicators:** status LEDs on every inverter front panel.`,
        technical: `**Temperature.** A silicon diode's forward voltage falls by roughly 2 mV per °C as it heats. In parallel diodes, the hotter one conducts more and heats further, so diodes are not simply paralleled to share current.

**Reverse recovery.** When a conducting diode is switched off rapidly, it conducts briefly in reverse while its stored charge clears. In fast switching converters this causes losses and spikes; fast-recovery and Schottky diodes are chosen for those positions (course P2).

**The circuit laboratory model.** The solver uses a piecewise-linear diode: a forward voltage plus a small series resistance when forward-biased, and a very high resistance when reversed. It is accurate enough for current-limit design; real diodes follow the exponential characteristic in their datasheets.`,
        diagrams: [{ id: 'diode-led', caption: 'Diode symbol, forward and reverse bias, and an LED with its series current-limiting resistor.' }],
        formulas: [
          { name: 'LED series resistor', expr: 'R = (V_s − V_f) / I_LED', where: [['V_s', 'supply voltage', 'V'], ['V_f', 'LED forward voltage', 'V'], ['I_LED', 'required current', 'A']] },
          { name: 'Diode dissipation', expr: 'P = V_f · I', where: [] },
        ],
        examples: [
          {
            title: 'An LED on 9 V (ckt-02)',
            problem: 'A red LED (V_f = 2.0 V) should run at about 15 mA from 9 V. Choose R from 330, 390, 470, 560 Ω and find the current and resistor power.',
            steps: ['R = (9 − 2.0) / 0.015 = 467 Ω → choose 470 Ω', 'I = (9 − 2.0) / 470 = 14.9 mA', 'P_R = 0.0149² × 470 = 0.104 W → a 0.25 W resistor is adequate'],
            answer: '470 Ω, 14.9 mA, about 0.1 W.',
          },
          {
            title: 'Reverse-polarity protection loss',
            problem: 'A series silicon diode (V_f = 0.8 V at 5 A) protects a 12 V device drawing 5 A. Find its dissipation and the voltage the device receives.',
            steps: ['P = 0.8 × 5 = 4 W (needs a heat sink)', 'Device voltage = 12 − 0.8 = 11.2 V'],
            answer: '4 W lost and 0.8 V less at the device. For high currents, a MOSFET-based protection circuit is used instead.',
          },
        ],
        applications: `Status LEDs, rectifiers, reverse-polarity protection, freewheeling diodes, PV bypass diodes and inverter bridges. The circuit laboratory exercise ckt-02 assesses LED current limiting.`,
        mistakes: [
          { mistake: 'Connecting an LED directly to a supply.', correction: 'Always use a series resistor (or a current-regulated driver).' },
          { mistake: 'Fitting a diode the wrong way round.', correction: 'The band marks the cathode; the arrow on the symbol points to it.' },
          { mistake: 'Ignoring diode dissipation at high currents.', correction: 'P = V_f·I; amperes through a diode need heat sinking.' },
        ],
        demo: {
          title: 'LED circuit in the circuit laboratory',
          text: 'Build ckt-02: a supply, a resistor and an LED. Try 470 Ω, then reverse the LED, then remove the resistor (in simulation only) and read the solver’s warnings.',
          link: to.ckt('Circuit lab: LED circuit', 'ckt-02'),
        },
        activities: [to.ckt('ckt-02 LED circuit', 'ckt-02'), to.lib('Diode', 'diode'), to.proc('Diode test', 'diode', 'diode-test')],
        check: [
          { id: 'k1', type: 'numeric', prompt: 'Resistor for a 3.0 V LED at 20 mA from 12 V (Ω)?', answer: 450, tol: 0.01, unit: 'Ω', explain: '(12 − 3)/0.02 = 450 Ω → use 470 Ω.' },
          { id: 'k2', type: 'numeric', prompt: 'Power in a diode with V_f = 0.7 V carrying 15 A (W)?', answer: 10.5, tol: 0.01, unit: 'W', explain: '0.7 × 15.' },
          { id: 'k3', type: 'mcq', prompt: 'A diode conducts when…', options: ['its anode is more positive than its cathode by at least V_f', 'its cathode is more positive', 'any voltage is applied', 'it is cold'], answer: 0, explain: 'Forward bias.' },
          { id: 'k4', type: 'mcq', prompt: 'The band on a diode body marks…', options: ['the cathode', 'the anode', 'the voltage rating', 'nothing'], answer: 0, explain: 'Cathode band.' },
        ],
        summary: [
          'Diodes conduct anode → cathode once forward voltage is exceeded; they block in reverse.',
          'V_f ≈ 0.6–0.7 V silicon, 0.2–0.4 V Schottky, ≈ 1.8–3.3 V LEDs (typical).',
          'LED resistor R = (V_s − V_f)/I; check its power.',
          'Diode dissipation P = V_f·I.',
          'Diodes rectify, protect, freewheel, bypass and indicate.',
        ],
        homework: {
          id: 'F2.M5.L3.hw',
          title: 'Diode and LED design',
          brief: 'A green LED (V_f = 2.2 V) indicator must run at 10 mA from a 24 V battery.',
          tasks: [
            { id: 'h1', type: 'numeric', prompt: 'Calculated resistance (kΩ)?', answer: 2.18, tol: 0.01, unit: 'kΩ', explain: '(24 − 2.2)/0.01 = 2180 Ω → 2.2 kΩ.' },
            { id: 'h2', type: 'numeric', prompt: 'Current with 2.2 kΩ (mA)?', answer: 9.909, tol: 0.01, unit: 'mA', explain: '21.8/2200 = 9.91 mA.' },
            { id: 'h3', type: 'numeric', prompt: 'Resistor power (W)?', answer: 0.216, tol: 0.02, unit: 'W', explain: '0.009 909² × 2200 = 0.216 W → use a 0.5 W resistor (×2 margin).' },
          ],
          written: [{ prompt: 'Why does the same LED need a much larger resistor on 24 V than on 5 V, and what happens to the efficiency?', model: 'The resistor must drop the difference between supply and LED voltage at the set current; at 24 V that is 21.8 V versus 2.8 V at 5 V, so R is about 8× larger and wastes 21.8 × 0.01 = 0.22 W versus 0.03 W: most of the power heats the resistor. Constant-current drivers are used for higher-power LEDs.' }],
        },
      },
    },
  ],
  quiz: {
    pass: 0.7,
    questions: [
      { id: 'q1', type: 'numeric', prompt: 'A battery reads 13.0 V open-circuit and 12.4 V at 50 A. Internal resistance (mΩ)?', answer: 12, tol: 0.01, unit: 'mΩ', explain: '0.6/50 = 0.012 Ω.' },
      { id: 'q2', type: 'numeric', prompt: 'Usable energy of 25.6 V, 100 Ah LiFePO₄ at 80 % DoD (Wh)?', answer: 2048, tol: 0.01, unit: 'Wh', explain: '2560 × 0.8.' },
      { id: 'q3', type: 'numeric', prompt: 'Runtime of that energy for a 500 W load at η = 0.92 (h)?', answer: 3.768, tol: 0.01, unit: 'h', explain: '2048 × 0.92/500 = 3.77 h.' },
      { id: 'q4', type: 'numeric', prompt: 'Drop for 120 A on a 1.5 m route of 35 mm² (V)?', answer: 0.1769, tol: 0.01, unit: 'V', explain: '120 × 0.0172 × 3/35 = 0.177 V.' },
      { id: 'q5', type: 'mcq', prompt: 'A 12 V battery cable sized only for current capacity, over a long run, will most likely…', options: ['have excessive voltage drop', 'be too large', 'overheat at low current', 'reverse polarity'], answer: 0, explain: 'At low voltage the drop usually decides the size.' },
      { id: 'q6', type: 'numeric', prompt: 'LED resistor: 5 V supply, V_f = 2.0 V, 10 mA (Ω)?', answer: 300, tol: 0.01, unit: 'Ω', explain: '3/0.01.' },
      { id: 'q7', type: 'mcq', prompt: 'Which battery bank gives 48 V, 200 Ah from 12 V, 100 Ah batteries?', options: ['Two parallel strings of four in series (8 batteries)', 'Four in series', 'Eight in series', 'Four in parallel'], answer: 0, explain: '4S2P.' },
      { id: 'q8', type: 'mcq', prompt: 'A freewheeling diode across an inductor is connected…', options: ['reverse-biased by the supply, so it conducts only when the switch opens', 'forward-biased all the time', 'in series with the inductor', 'across the battery'], answer: 0, explain: 'It carries the inductor current only after switch-off.' },
    ],
  },
  assignment: {
    id: 'F2.M5.asg',
    title: 'Module assignment: a small off-grid DC system',
    brief: 'A cabin needs 1.2 kWh per day from its battery (inverter losses included). Use 12 V, 100 Ah AGM batteries (50 % DoD, internal resistance 6 mΩ each) for a 24 V system with one day of autonomy. The inverter peak draw is 75 A over a 2 m cable route with a 2 % drop limit.',
    tasks: [
      { id: 'a1', type: 'numeric', prompt: 'Nominal capacity required (Wh)?', answer: 2400, tol: 0.01, unit: 'Wh', explain: '1200/0.5.' },
      { id: 'a2', type: 'numeric', prompt: 'Capacity required at 24 V (Ah)?', answer: 100, tol: 0.01, unit: 'Ah', explain: '2400/24.' },
      { id: 'a3', type: 'numeric', prompt: 'Number of 12 V, 100 Ah batteries?', answer: 2, tol: 0.001, unit: '', explain: 'Two in series: 24 V, 100 Ah = 2400 Wh.' },
      { id: 'a4', type: 'numeric', prompt: 'Bank internal resistance (mΩ)?', answer: 12, tol: 0.01, unit: 'mΩ', explain: 'Series resistances add: 6 + 6.' },
      { id: 'a5', type: 'numeric', prompt: 'Minimum cable cross-section for the drop limit (mm²)?', answer: 10.75, tol: 0.01, unit: 'mm²', explain: '0.0172 × 4 × 75/0.48 = 10.75 → 16 mm².' },
    ],
    written: [{ prompt: 'Describe the full DC wiring: configuration, polarity, fusing and connection practice.', model: 'Two batteries in series (+ of one to − of the other) give 24 V; the bank + goes through a DC-rated fuse at the battery (sized ≥ 1.25 × 75 ≈ 94 A → 100 A, within the 16 mm² cable’s rating per the manufacturer’s table — otherwise use 25 mm²) to the inverter +; bank − to inverter −; red/black marked, polarity verified with a meter before final connection, crimped lugs torqued to specification, terminal covers fitted, cables run together.' }],
  },
  practicals: [
    { id: 'F2.M5.P1', title: 'Circuit laboratory: LED current limiting (ckt-02)', description: 'Build the LED circuit with a correctly sized series resistor and correct polarity, and pass the exercise check (5–20 mA).', link: to.ckt('ckt-02 LED circuit', 'ckt-02'), evidence: { kind: 'exercise', id: 'ckt-02' } },
    {
      id: 'F2.M5.P2',
      title: 'DC system design assessment',
      description: 'Design the battery bank, cable and fuse for a DC system. All answers must be correct.',
      task: {
        id: 'f2-dc-design',
        kind: 'calc',
        title: 'Designing a battery-inverter DC circuit',
        brief: 'A 48 V system must deliver 3.6 kWh per day (inverter losses included) with 1 day of autonomy from 12.8 V, 100 Ah LiFePO₄ batteries (80 % DoD). The inverter draws at most 80 A, 3 m cable route, 1.5 % drop limit. Cable sizes: 10, 16, 25, 35 mm². Fuse sizes: 80, 100, 125, 160 A.',
        questions: [
          { id: 'c1', type: 'numeric', prompt: 'Nominal capacity required (Wh)?', answer: 4500, tol: 0.01, unit: 'Wh', explain: '3600/0.8.' },
          { id: 'c2', type: 'numeric', prompt: 'Batteries in series per string (12.8 V each to ≈ 48 V)?', answer: 4, tol: 0.001, unit: '', explain: '4 × 12.8 = 51.2 V nominal.' },
          { id: 'c3', type: 'numeric', prompt: 'Parallel strings needed (each string 51.2 V × 100 Ah = 5120 Wh)?', answer: 1, tol: 0.001, unit: '', explain: '5120 ≥ 4500: one string.' },
          { id: 'c4', type: 'numeric', prompt: 'Minimum cable cross-section for 1.5 % at 48 V (mm²)?', answer: 11.47, tol: 0.01, unit: 'mm²', explain: '0.0172 × 6 × 80/0.72 = 11.47 → 16 mm².' },
          { id: 'c5', type: 'numeric', prompt: 'Fuse rating with the 1.25 margin (A)?', answer: 100, tol: 0.001, unit: 'A', explain: '1.25 × 80 = 100 A.' },
          { id: 'c6', type: 'mcq', prompt: 'Before the final battery connection you must…', options: ['verify polarity with a meter and keep the fuse open until connections are complete', 'connect quickly to avoid sparks', 'remove the fuse permanently', 'reverse the cables to test protection'], answer: 0, explain: 'Polarity check and controlled energisation.' },
        ],
        explain: 'Size the bank from daily energy, depth of discharge and voltage; size the cable for the drop limit and check its current capacity; fuse at 1.25 × the maximum current at the battery positive; verify polarity before connecting.',
      },
      evidence: { kind: 'task', id: 'f2-dc-design' },
    },
  ],
}
