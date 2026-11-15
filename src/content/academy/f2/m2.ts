import type { AcademyModule } from '../types'
import { to } from '../s1/links'

/** F2.M2 Resistance, Ohm's law and power. */
export const F2_M2: AcademyModule = {
  id: 'F2.M2',
  title: "Resistance, Ohm's law and power",
  summary: "What sets the resistance of a conductor, the relationship between voltage, current and resistance, and how electrical power and energy become heat — the calculations behind every cable, resistor and fuse.",
  lessons: [
    {
      id: 'F2.M2.L1',
      title: 'Resistance and resistivity',
      minutes: 30,
      content: {
        objectives: [
          'Define resistance and its unit, the ohm.',
          'Calculate the resistance of a conductor from its resistivity, length and cross-section.',
          'Explain how temperature changes resistance.',
          'Read resistor values, tolerances and power ratings.',
        ],
        introduction: `Resistance is the opposition a material offers to current. Sometimes it is wanted: a resistor sets an LED's current, a heating element turns electricity into heat. Often it is not: the resistance of a long battery cable wastes energy and drops voltage. Engineers calculate it from the material and the dimensions, and this lesson shows how.`,
        lecture: `### Resistance

**Resistance (R)** is the ratio of the voltage across a component to the current through it. Its unit is the **ohm (Ω)**: one ohm passes one ampere when one volt is applied. A higher resistance passes less current for the same voltage.

### What determines a conductor's resistance

For a uniform conductor:

**R = ρ · L / A**

- **ρ** ([[resistivity]]) is a property of the material, in ohm-metres (Ω·m).
- **L** is the length of the conductor. Doubling the length doubles the resistance.
- **A** is the cross-sectional area. Doubling the area halves the resistance.

Typical resistivities at 20 °C:

| Material | ρ (Ω·m) |
|---|---|
| Copper | 1.72 × 10⁻⁸ |
| Aluminium | 2.82 × 10⁻⁸ |
| Nichrome (heating wire) | about 1.1 × 10⁻⁶ |

Cable sizes are given as cross-sectional area in mm². Since 1 mm² = 10⁻⁶ m², copper's resistivity is conveniently written **0.0172 Ω·mm²/m**.

### The two-way path

A DC circuit has a **positive and a negative conductor**. The current flows out and back, so the conductor length in the formula is **twice the cable route length**. This is one of the most common errors in DC system design (lesson F2.M5.L2).

### Temperature

The resistance of metals rises with temperature. For copper, by about 0.39 % per °C:

**R_T = R₂₀ · (1 + α · (T − 20))**, with α ≈ 0.0039 /°C.

A copper winding at 90 °C has about 27 % more resistance than at 20 °C. Some materials do the opposite: NTC thermistors (used as temperature sensors in inverters) fall in resistance as they heat.

### Resistors

Resistors are components made to have a specific resistance. Three numbers matter:

- **Value:** in Ω, from a preferred series. E12 has 12 values per decade (10, 12, 15, 18, 22, 27, 33, 39, 47, 56, 68, 82); E24 has 24.
- **Tolerance:** how far the actual value may differ from the marked one, for example ±1 % or ±5 %.
- **Power rating:** the heat it can dissipate continuously without damage, for example 0.25 W, 2 W or 50 W. Exceeding it overheats the resistor (lesson L3).

Colour bands, printed codes (4K7) and SMD codes mark the value.`,
        technical: `**Conductance.** The reciprocal of resistance is conductance, G = 1/R, in siemens (S). It is convenient for parallel circuits (lesson F2.M3.L2) and is what the circuit laboratory's nodal solver uses internally.

**Contact resistance.** Every joint, crimp, screw terminal and fuse holder adds resistance, typically fractions of a milliohm when good. Loose or corroded joints can reach many milliohms. At 100 A even 5 mΩ dissipates 50 W in a few cubic millimetres (lesson F1.M1.L3), which is how terminal fires start.

**Values given here are typical textbook values** for comparison; a design uses the cable or resistor manufacturer's data.`,
        diagrams: [{ id: 'voltage-drop', caption: 'A cable has resistance in both the positive and negative conductors: the conductor length is twice the route length.' }],
        formulas: [
          { name: 'Resistance of a conductor', expr: 'R = ρ · L / A', where: [['ρ', 'resistivity (copper 0.0172)', 'Ω·mm²/m'], ['L', 'conductor length', 'm'], ['A', 'cross-sectional area', 'mm²']] },
          { name: 'Temperature effect (metals)', expr: 'R_T = R₂₀ · (1 + α · (T − 20))', where: [['α', 'temperature coefficient (copper ≈ 0.0039)', '/°C']] },
        ],
        examples: [
          {
            title: 'Resistance of a battery cable',
            problem: 'A battery is 3 m (route) from its inverter, connected with 35 mm² copper cable. Find the total cable resistance.',
            steps: ['Conductor length: L = 2 × 3 = 6 m (positive and negative)', 'R = 0.0172 × 6 / 35 = 0.002 95 Ω ≈ 2.95 mΩ'],
            answer: 'About 2.95 mΩ for the round trip.',
          },
          {
            title: 'A hot winding',
            problem: 'A transformer winding measures 0.40 Ω at 20 °C. Estimate its resistance at 85 °C.',
            steps: ['R_T = R₂₀ · (1 + 0.0039 × (85 − 20))', 'R_T = 0.40 × (1 + 0.2535) = 0.40 × 1.2535 = 0.501 Ω'],
            answer: 'About 0.50 Ω, 25 % higher than cold.',
          },
        ],
        applications: `Cable sizing for battery and PV circuits, the copper loss of transformers and inductors, current-sense shunts, NTC temperature sensors and terminal-heating faults all depend on resistance. Course S2 uses R = ρL/A to size PV and battery cables.`,
        mistakes: [
          { mistake: 'Using the route length instead of the conductor length for a DC circuit.', correction: 'The current goes out and back: double the route length.' },
          { mistake: 'Forgetting to convert mm² when using ρ in Ω·m.', correction: 'Use ρ = 0.0172 Ω·mm²/m with A in mm², or convert A to m².' },
          { mistake: 'Choosing a resistor by value only.', correction: 'Also check its power rating, tolerance and voltage rating.' },
        ],
        demo: {
          title: 'Resistance and voltage drop',
          text: 'Use the voltage-drop demonstration to change cable length and cross-section and watch the round-trip resistance change.',
          link: to.lib('Resistor', 'resistor'),
          embed: 'voltage-drop',
        },
        activities: [to.lib('Resistor', 'resistor'), to.proc('Resistor resistance measurement', 'resistor', 'resistor-ohms'), to.proc('Battery terminal voltage-drop test', 'battery-terminals', 'terminal-drop')],
        check: [
          { id: 'k1', type: 'numeric', prompt: 'Resistance of 10 m of 2.5 mm² copper conductor (Ω)?', answer: 0.0688, tol: 0.01, unit: 'Ω', explain: '0.0172 × 10 / 2.5 = 0.0688 Ω.' },
          { id: 'k2', type: 'mcq', prompt: 'Doubling a cable’s cross-section…', options: ['halves its resistance', 'doubles its resistance', 'does not change it', 'quadruples it'], answer: 0, explain: 'R ∝ 1/A.' },
          { id: 'k3', type: 'mcq', prompt: 'A 4 m cable route in a DC circuit has a conductor length of…', options: ['8 m', '4 m', '2 m', '16 m'], answer: 0, explain: 'Out and back.' },
          { id: 'k4', type: 'mcq', prompt: 'The resistance of copper as it heats…', options: ['rises', 'falls', 'stays constant', 'becomes zero'], answer: 0, explain: 'About +0.39 %/°C.' },
        ],
        summary: [
          'Resistance R = V/I, in ohms.',
          'R = ρL/A; copper ρ = 0.0172 Ω·mm²/m.',
          'In DC circuits the conductor length is twice the route length.',
          'Metal resistance rises with temperature (copper ≈ 0.39 %/°C).',
          'Resistors have a value, tolerance and power rating.',
        ],
        homework: {
          id: 'F2.M2.L1.hw',
          title: 'Conductor resistance',
          brief: 'Copper ρ = 0.0172 Ω·mm²/m.',
          tasks: [
            { id: 'h1', type: 'numeric', prompt: 'Round-trip resistance of a 5 m route of 16 mm² cable (mΩ)?', answer: 10.75, tol: 0.01, unit: 'mΩ', explain: '0.0172 × 10 / 16 = 0.010 75 Ω.' },
            { id: 'h2', type: 'numeric', prompt: 'The same with 25 mm² (mΩ)?', answer: 6.88, tol: 0.01, unit: 'mΩ', explain: '0.0172 × 10 / 25 = 0.006 88 Ω.' },
          ],
          written: [{ prompt: 'Why do inverter battery cables use very large cross-sections even though the voltage is low?', model: 'At low voltage the current for a given power is high, so even milliohms of cable resistance cause significant voltage drop and heating (I²R). A large cross-section keeps the resistance, drop and loss acceptable.' }],
        },
      },
    },
    {
      id: 'F2.M2.L2',
      title: "Ohm's law",
      minutes: 30,
      content: {
        objectives: [
          "State Ohm's law and rearrange it for V, I or R.",
          'Apply it to resistors, cables and simple loads.',
          'Recognise components that do not obey it (non-ohmic devices).',
          'Verify it by measurement in the circuit laboratory.',
        ],
        introduction: `Ohm's law is the most-used relationship in electrical engineering. It connects the three quantities of the previous lessons and lets you predict a current before you switch on, which is the essence of working safely. This lesson's practical is the circuit laboratory exercise ckt-01.`,
        lecture: `### The law

For a resistor at constant temperature, the current is proportional to the voltage:

**V = I · R**

Rearranged:

- **I = V / R**: find the current from the voltage and resistance;
- **R = V / I**: find the resistance from a measurement.

A graph of current against voltage for a resistor is a straight line through the origin. Its slope is 1/R.

### Using it

1. Write down what you know, with units.
2. Convert to base units (V, A, Ω).
3. Choose the arrangement that gives the unknown.
4. Calculate, and check that the answer is sensible.

### Where it applies

- **Resistors** and **conductors** at steady temperature.
- **Cables**: the voltage lost along a cable is I × R_cable (lesson F2.M5.L2).
- **The body**: the current through a person is V / R_body (lesson F1.M1.L2).
- **A short circuit**: the current is limited only by the tiny resistances present (lesson F1.M2.L1).

### Where it does not apply directly

Some components are **non-ohmic**: their current is not proportional to voltage.

- **Diodes and LEDs** conduct almost nothing below a threshold, then very steeply above it (lesson F2.M5.L3).
- **Filament lamps:** resistance rises sharply as the filament heats, so the cold resistance is several times smaller than the hot one, and switch-on current is high.
- **Thermistors and varistors:** resistance changes with temperature or voltage by design.

For these, V = I·R still defines the resistance *at a given operating point*, but R is not constant.

### Predict, then measure

Good practice in any laboratory is:

1. predict the current with Ohm's law;
2. measure it;
3. compare.

A large difference means a wrong assumption, a wrong connection or a fault. The circuit laboratory's ckt-01 checks exactly this.`,
        technical: `**Internal resistance.** Real sources have internal resistance, so the terminal voltage falls as current rises. Ohm's law applied to the whole loop includes it: I = EMF / (R_load + R_internal). This is developed in lesson F2.M5.L1.

**Measuring resistance.** An ohmmeter passes a small known current through the component and measures the voltage. It must **never** be used on a live circuit: the circuit's own voltage corrupts the reading and can damage the meter. Components in circuit may also be paralleled by other parts, so measurements are often taken with one end disconnected.

**Linearity limits.** Even resistors deviate at extremes: very high voltage causes breakdown, and very high current heats them, changing R. Ratings define the region where Ohm's law holds well.`,
        diagrams: [{ id: 'circuit-loop', caption: 'A source, a resistor and the loop: I = V / R.' }],
        formulas: [
          { name: "Ohm's law", expr: 'V = I · R;  I = V / R;  R = V / I', where: [['V', 'voltage', 'V'], ['I', 'current', 'A'], ['R', 'resistance', 'Ω']] },
        ],
        examples: [
          {
            title: 'Current through a resistor',
            problem: 'A 12 V supply is connected across a 1 kΩ resistor (ckt-01). Find the current.',
            steps: ['Convert: R = 1000 Ω', 'I = V / R = 12 / 1000 = 0.012 A = 12 mA'],
            answer: '12 mA.',
          },
          {
            title: 'Finding an unknown resistance',
            problem: 'A heater element draws 8.7 A from 230 V. What is its resistance when hot?',
            steps: ['R = V / I', 'R = 230 / 8.7 = 26.4 Ω'],
            answer: 'About 26.4 Ω (hot).',
          },
        ],
        applications: `Ohm's law sets LED resistors, current-sense shunts, gate resistors in inverter drivers, feedback dividers and cable drops. Inverter fault-finding (course S4) uses it constantly to judge whether a measured current is reasonable.`,
        mistakes: [
          { mistake: 'Using kΩ directly with V and A (12 V / 1 kΩ = 12 A).', correction: 'Convert to ohms first: 12/1000 = 12 mA.' },
          { mistake: 'Measuring resistance on a live circuit.', correction: 'Isolate and discharge first; an ohmmeter supplies its own test current.' },
          { mistake: 'Applying a single R to an LED or lamp at every voltage.', correction: 'Non-ohmic devices have operating-point-dependent resistance.' },
        ],
        demo: {
          title: "Ohm's law explorer",
          text: 'Change the voltage and resistance and watch the current and the I–V line; then build the same circuit in ckt-01 and compare the solver’s current with your prediction.',
          link: to.ckt('Circuit lab: battery and resistor circuit', 'ckt-01'),
          embed: 'ohms-law',
        },
        activities: [to.ckt('Circuit lab: ckt-01', 'ckt-01'), to.lib('Resistor', 'resistor')],
        check: [
          { id: 'k1', type: 'numeric', prompt: 'Current through 470 Ω at 9 V (mA)?', answer: 19.15, tol: 0.01, unit: 'mA', explain: '9/470 = 0.019 15 A.' },
          { id: 'k2', type: 'numeric', prompt: 'Voltage across 2.2 kΩ carrying 5 mA (V)?', answer: 11, tol: 0.01, unit: 'V', explain: '0.005 × 2200 = 11 V.' },
          { id: 'k3', type: 'numeric', prompt: 'Resistance that draws 0.25 A from 12 V (Ω)?', answer: 48, tol: 0.01, unit: 'Ω', explain: '12/0.25 = 48 Ω.' },
          { id: 'k4', type: 'mcq', prompt: 'Which device is non-ohmic?', options: ['An LED', 'A fixed metal-film resistor', 'A short copper wire at room temperature', 'A 1 kΩ carbon resistor'], answer: 0, explain: 'An LED’s current rises steeply above its forward voltage.' },
        ],
        summary: [
          'V = I·R; I = V/R; R = V/I.',
          'Convert to base units first.',
          'Applies to resistors and conductors; diodes, LEDs and lamps are non-ohmic.',
          'Predict, measure, compare: disagreement means a fault or a wrong assumption.',
          'Never measure resistance on a live circuit.',
        ],
        homework: {
          id: 'F2.M2.L2.hw',
          title: "Ohm's law practice",
          brief: 'Find the unknown in each case.',
          tasks: [
            { id: 'h1', type: 'numeric', prompt: '24 V across 68 Ω: current (A)?', answer: 0.353, tol: 0.01, unit: 'A', explain: '24/68 = 0.353 A.' },
            { id: 'h2', type: 'numeric', prompt: '150 mA through 330 Ω: voltage (V)?', answer: 49.5, tol: 0.01, unit: 'V', explain: '0.15 × 330 = 49.5 V.' },
            { id: 'h3', type: 'numeric', prompt: 'A cable drops 0.6 V carrying 120 A: resistance (mΩ)?', answer: 5, tol: 0.01, unit: 'mΩ', explain: '0.6/120 = 0.005 Ω.' },
          ],
          written: [{ prompt: 'A lamp’s cold resistance measures 40 Ω but it draws 0.4 A on 230 V. Explain.', model: 'Hot, its resistance is 230/0.4 = 575 Ω; tungsten’s resistance rises greatly with temperature, so the lamp is non-ohmic and draws a much larger current (≈ 5.75 A) for an instant at switch-on.' }],
        },
      },
    },
    {
      id: 'F2.M2.L3',
      title: 'Power, energy and heat',
      minutes: 35,
      content: {
        objectives: [
          'Calculate electrical power with P = V·I, P = I²R and P = V²/R.',
          'Calculate energy in joules and watt-hours, and convert between them.',
          'Calculate efficiency and losses for a conversion stage.',
          'Choose a resistor power rating with an appropriate margin.',
        ],
        introduction: `Power is the rate at which energy is converted. It decides how big a battery must be, how hot a component gets and how much a system costs to run. Every inverter specification — 1 kW, 93 % efficient, 25 W idle — is a statement about power. This lesson gives the formulas and the habits of using them.`,
        lecture: `### Power

**Power (P)** is energy converted per second, in **watts (W)**: one watt is one joule per second.

**P = V · I**

Combining with Ohm's law gives two more forms, useful when only two quantities are known:

- **P = I² · R**: the heat in a resistance carrying current I. This is the form for cable and terminal losses.
- **P = V² / R**: the power in a resistance with voltage V across it.

### Energy

[[energy|Energy]] is power multiplied by time:

**E = P · t**

- In joules when P is in W and t in s.
- In **watt-hours** when t is in hours: a 100 W load for 5 h uses 500 Wh = 0.5 kWh.
- 1 kWh = 3.6 MJ. Electricity bills, battery capacities and solar yields are all in kWh.

### Efficiency and losses

No conversion is perfect. **Efficiency** is:

**η = P_out / P_in**

- The difference, P_in − P_out, is the **loss**, almost always heat.
- For an inverter delivering 1000 W at η = 0.92: P_in = 1000 / 0.92 = 1087 W, and the loss is 87 W of heat that the heat sink must remove.
- Stages in series multiply: two stages of 0.95 and 0.92 give 0.95 × 0.92 = 0.874 overall.

### Heat and power ratings

Every component converting electrical energy to heat must get rid of it. Its **power rating** says how much it can dissipate continuously in specified conditions.

- Choose resistors with a margin, commonly **at least twice** the calculated dissipation, so they run cooler and last longer.
- Ratings fall at high ambient temperature (derating).
- Power semiconductors need heat sinks (course S1).

### Standby and duty

Average power matters for energy. A fridge rated 150 W that runs 40 % of the time averages 60 W, using 60 × 24 = 1440 Wh per day. Load profiles for solar design (course S2) are built from exactly this reasoning.`,
        technical: `**Why P = I²R dominates low-voltage design.** For a fixed power, halving the system voltage doubles the current and quadruples the I²R losses in the same cable. That is why higher-power battery systems move from 12 V to 24 V or 48 V.

**Peak and average.** Components feel average heating over seconds to minutes (thermal time constants), but fuses, semiconductors and contacts can be damaged by short peaks. Both the average and the peak must be within ratings.

**Energy conservation.** Energy in = energy out + losses, always. A design that claims more output than input, or an efficiency above 100 %, has an error.`,
        diagrams: [{ id: 'battery-model', caption: 'Energy flow from a source to a load, with I²R losses in the internal resistance and the wiring.' }],
        formulas: [
          { name: 'Power', expr: 'P = V · I = I² · R = V² / R', where: [['P', 'power', 'W']] },
          { name: 'Energy', expr: 'E = P · t', where: [['E', 'energy', 'J or Wh'], ['t', 'time', 's or h']] },
          { name: 'Efficiency', expr: 'η = P_out / P_in;  loss = P_in − P_out', where: [['η', 'efficiency', '—']] },
        ],
        examples: [
          {
            title: 'Resistor power rating',
            problem: 'A 100 Ω resistor carries 0.15 A. Find its dissipation and choose a rating from 0.25, 0.5, 1, 2, 5 W with a ×2 margin.',
            steps: ['P = I²R = 0.15² × 100 = 0.0225 × 100 = 2.25 W', 'With ×2 margin: 4.5 W → choose 5 W'],
            answer: '2.25 W dissipated; use a 5 W resistor.',
          },
          {
            title: 'Daily energy of a load',
            problem: 'A 12 V, 5 A pump runs for 3 hours per day. Find its power and daily energy.',
            steps: ['P = V · I = 12 × 5 = 60 W', 'E = 60 × 3 = 180 Wh/day'],
            answer: '60 W and 180 Wh per day.',
          },
        ],
        applications: `Battery sizing, solar array sizing, inverter heat-sink design, cable losses and electricity costs are all power and energy calculations. Course S2's load-profile tool adds up exactly these products of power and hours.`,
        mistakes: [
          { mistake: 'Confusing power (W) with energy (Wh).', correction: 'Power is a rate; energy is power × time.' },
          { mistake: 'Choosing a resistor rated exactly at its dissipation.', correction: 'Use a margin (×2) and derate for high ambient temperature.' },
          { mistake: 'Ignoring efficiency when estimating battery current.', correction: 'Input power = output / η; the battery supplies the losses too.' },
        ],
        demo: {
          title: 'Battery under load',
          text: 'Use the battery-load demonstration to vary the load power and see the current, the I²R loss in the wiring and the energy drawn per hour.',
          link: to.lib('Battery terminals', 'battery-terminals'),
          embed: 'battery-load',
        },
        activities: [to.lib('Heat sink', 'heat-sink'), to.cmp('Heat sink versus fan', 'heatsink-vs-fan')],
        check: [
          { id: 'k1', type: 'numeric', prompt: 'Power in a 22 Ω resistor with 11 V across it (W)?', answer: 5.5, tol: 0.01, unit: 'W', explain: '11²/22 = 121/22 = 5.5 W.' },
          { id: 'k2', type: 'numeric', prompt: 'Energy used by a 1.2 kW kettle in 4 minutes (Wh)?', answer: 80, tol: 0.01, unit: 'Wh', explain: '1200 × (4/60) = 80 Wh.' },
          { id: 'k3', type: 'numeric', prompt: 'Input power of an 800 W output at 90 % efficiency (W)?', answer: 888.9, tol: 0.01, unit: 'W', explain: '800/0.9 = 888.9 W.' },
          { id: 'k4', type: 'numeric', prompt: 'Heat in a 2 mΩ joint carrying 150 A (W)?', answer: 45, tol: 0.01, unit: 'W', explain: '150² × 0.002 = 45 W.' },
        ],
        summary: [
          'P = V·I = I²R = V²/R, in watts.',
          'E = P·t; 1 kWh = 3.6 MJ.',
          'η = P_out/P_in; losses become heat.',
          'Choose power ratings with margin (×2) and derate when hot.',
          'Lower voltage at the same power means higher current and much higher I²R loss.',
        ],
        homework: {
          id: 'F2.M2.L3.hw',
          title: 'Power and energy',
          brief: 'An inverter supplies 500 W for 6 hours at 91 % efficiency from a 24 V battery.',
          tasks: [
            { id: 'h1', type: 'numeric', prompt: 'Battery power (W)?', answer: 549.5, tol: 0.01, unit: 'W', explain: '500/0.91 = 549.5 W.' },
            { id: 'h2', type: 'numeric', prompt: 'Battery current (A)?', answer: 22.9, tol: 0.01, unit: 'A', explain: '549.5/24 = 22.9 A.' },
            { id: 'h3', type: 'numeric', prompt: 'Energy drawn from the battery (kWh)?', answer: 3.297, tol: 0.01, unit: 'kWh', explain: '549.5 × 6 = 3297 Wh.' },
          ],
          written: [{ prompt: 'Where does the 49.5 W difference go, and what must the inverter design provide for it?', model: 'It is lost as heat in the transistors, transformer, inductors and wiring; the design must provide heat sinking and airflow (and thermal protection) to keep components within their temperature ratings.' }],
        },
      },
    },
  ],
  quiz: {
    pass: 0.7,
    questions: [
      { id: 'q1', type: 'numeric', prompt: 'Round-trip resistance of a 2 m route of 50 mm² copper (mΩ)?', answer: 1.376, tol: 0.01, unit: 'mΩ', explain: '0.0172 × 4/50 = 0.001 376 Ω.' },
      { id: 'q2', type: 'numeric', prompt: 'Current through 56 Ω at 14 V (A)?', answer: 0.25, tol: 0.01, unit: 'A', explain: '14/56.' },
      { id: 'q3', type: 'numeric', prompt: 'Power in that resistor (W)?', answer: 3.5, tol: 0.01, unit: 'W', explain: '14 × 0.25 = 3.5 W.' },
      { id: 'q4', type: 'mcq', prompt: 'Suitable rating for that resistor with ×2 margin (0.5, 1, 2, 5, 10 W)?', options: ['10 W', '5 W', '2 W', '1 W'], answer: 0, explain: '2 × 3.5 = 7 W → 10 W.' },
      { id: 'q5', type: 'numeric', prompt: 'Daily energy of a 40 W light used 5 h (Wh)?', answer: 200, tol: 0.01, unit: 'Wh', explain: '40 × 5.' },
      { id: 'q6', type: 'numeric', prompt: 'Overall efficiency of stages 0.96 and 0.93?', answer: 0.8928, tol: 0.01, unit: '', explain: '0.96 × 0.93 = 0.893.' },
      { id: 'q7', type: 'mcq', prompt: 'Halving system voltage at the same power, with the same cable, makes cable loss…', options: ['four times larger', 'twice as large', 'the same', 'half'], answer: 0, explain: 'Current doubles; I²R quadruples.' },
      { id: 'q8', type: 'numeric', prompt: 'Resistance of copper at 70 °C if 1.00 Ω at 20 °C (Ω)?', answer: 1.195, tol: 0.01, unit: 'Ω', explain: '1 + 0.0039 × 50 = 1.195.' },
    ],
  },
  assignment: {
    id: 'F2.M2.asg',
    title: 'Module assignment: a resistive heater on a battery',
    brief: 'A 24 V battery supplies a 4.8 Ω heater through a cable with a 4 m route of 6 mm² copper.',
    tasks: [
      { id: 'a1', type: 'numeric', prompt: 'Round-trip cable resistance (mΩ)?', answer: 22.93, tol: 0.01, unit: 'mΩ', explain: '0.0172 × 8/6 = 0.022 93 Ω.' },
      { id: 'a2', type: 'numeric', prompt: 'Circuit current (A), ignoring battery resistance?', answer: 4.977, tol: 0.01, unit: 'A', explain: '24/(4.8 + 0.022 93) = 4.977 A.' },
      { id: 'a3', type: 'numeric', prompt: 'Heater power (W)?', answer: 118.9, tol: 0.01, unit: 'W', explain: '4.977² × 4.8 = 118.9 W.' },
      { id: 'a4', type: 'numeric', prompt: 'Cable loss (W)?', answer: 0.568, tol: 0.02, unit: 'W', explain: '4.977² × 0.022 93 = 0.568 W.' },
    ],
    written: [{ prompt: 'Is the 6 mm² cable adequate? Discuss the loss and what would change for a 2 kW heater at 24 V.', model: 'Yes: the loss is under 0.5 % of the heater power. At 2 kW the current would be about 83 A, cable loss ≈ 83² × 0.023 = 160 W (8 %), and the cable would overheat; a much larger cross-section (and a higher system voltage) would be required.' }],
  },
  practicals: [
    {
      id: 'F2.M2.P1',
      title: "Circuit laboratory: verify Ohm's law (ckt-01)",
      description: 'Build the battery and resistor circuit, predict the current, read the solver’s current, and pass the exercise check, including the resistor power rating.',
      link: to.ckt('Circuit lab: battery and resistor circuit', 'ckt-01'),
      evidence: { kind: 'exercise', id: 'ckt-01' },
    },
  ],
}
