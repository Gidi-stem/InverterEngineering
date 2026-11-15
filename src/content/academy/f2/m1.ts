import type { AcademyModule } from '../types'
import { to } from '../s1/links'

/** F2.M1 Charge, current and voltage. */
export const F2_M1: AcademyModule = {
  id: 'F2.M1',
  title: 'Charge, current and voltage',
  summary: 'What electric charge is, why some materials conduct and others insulate, how current and voltage are defined and measured, and the units and prefixes engineers use every day.',
  lessons: [
    {
      id: 'F2.M1.L1',
      title: 'Charge, conductors and insulators',
      minutes: 30,
      content: {
        objectives: [
          'Describe electric charge and state its unit, the coulomb.',
          'Explain why metals conduct and why insulators do not, in terms of free electrons.',
          'Classify common materials as conductors, insulators or semiconductors.',
          'Explain why insulation has a voltage rating and can break down.',
        ],
        introduction: `Every circuit in this programme, from a torch to a 5 kW hybrid inverter, works by moving electric [[charge]]. Before calculating anything, an engineer needs a clear picture of what is moving, what lets it move and what stops it. That picture explains why copper is used for cables, why PVC covers them, and why insulation that is damaged, wet or overstressed becomes dangerous.`,
        lecture: `### Electric charge

Matter is made of atoms. Each atom has a nucleus of positively charged protons, surrounded by negatively charged electrons.

- Charge is measured in **coulombs (C)**.
- One electron carries 1.602 × 10⁻¹⁹ C, so one coulomb is the charge of about 6.24 × 10¹⁸ electrons.
- Like charges repel; unlike charges attract. This force is what pushes charge around a circuit.

An object is **charged** when it has more or fewer electrons than protons. A battery does not create charge. It **separates** charge, building up an excess of electrons at its negative terminal and a shortage at its positive terminal.

### Conductors

In a metal, the outer electrons of each atom are only loosely held. They drift freely between atoms as a "sea" of **free electrons**. When a voltage is applied, this sea drifts as a whole along the wire. That drift is an electric current.

- **Good [[conductor|conductors]]:** silver, copper, gold, aluminium. Copper is the usual choice for cables because it combines low resistance, strength, ease of jointing and reasonable cost. Aluminium is lighter and cheaper but needs larger cross-sections and special terminations.
- **Other conductors:** carbon, salt water, the human body (lesson F1.M1.L2), and wet ground.

### Insulators

In an [[insulator]], the electrons are tightly bound to their atoms. Almost no free charge exists, so almost no current flows even with a large voltage.

- **Common insulators:** PVC, XLPE and rubber (cable insulation); glass and ceramic; dry air; epoxy and FR-4 (circuit boards); varnish (transformer windings).
- **Insulators are not perfect.** Every insulator has a very high but finite resistance, so a tiny leakage current flows. Insulation resistance testing (course S3) measures it.

### Breakdown

Every insulator has a **dielectric strength**: the electric field it can withstand before it breaks down and conducts, often permanently. That is why cables, capacitors and switches have **voltage ratings**. Breakdown becomes much more likely when the insulation is:

- **wet** (water provides conducting paths);
- **contaminated** (dust, salts, carbon tracking);
- **overheated** or aged (PVC softens and cracks);
- **overvoltaged** (lightning, switching spikes, wrong system voltage).

### Semiconductors

Between the two groups sit **semiconductors** such as silicon. Pure silicon conducts poorly, but adding tiny amounts of other elements (doping) controls its conductivity precisely. Diodes, LEDs, MOSFETs and solar cells are all made from semiconductors (lesson F2.M5.L3 and course F4).`,
        technical: `**Drift velocity.** The electrons themselves move slowly: in a 2.5 mm² copper wire carrying 10 A, the average drift velocity is well under a millimetre per second. What travels fast is the *signal*, the electric field, which moves at a large fraction of the speed of light. That is why a light comes on instantly when switched, even though no electron travels from the switch to the lamp in that time.

**Conventional current.** Historically, current was defined as the flow of positive charge from + to −, before the electron was discovered. Electrons actually drift from − to +. Engineers still use **conventional current** (+ to −) in all diagrams and calculations. Every arrow in this programme uses it.

**Typical dielectric strengths.** Dry air breaks down at roughly 3 kV per millimetre; PVC at roughly 10–40 kV/mm depending on grade and temperature. These are approximate textbook values for comparison only: equipment is always designed to its component ratings, not to these figures.`,
        diagrams: [{ id: 'circuit-loop', caption: 'Conventional current flows from the source’s + terminal, through the load and back to −; electrons drift the other way.' }],
        formulas: [
          { name: 'Charge and electrons', expr: 'Q = n · e', where: [['Q', 'charge', 'C'], ['n', 'number of electrons', '—'], ['e', 'charge of one electron, 1.602 × 10⁻¹⁹', 'C']] },
          { name: 'Charge moved by a steady current', expr: 'Q = I · t', where: [['I', 'current', 'A'], ['t', 'time', 's']], note: 'Introduced fully in lesson L2.' },
        ],
        examples: [
          {
            title: 'Counting electrons',
            problem: 'How many electrons make up a charge of 2 C?',
            steps: ['n = Q / e', 'n = 2 / (1.602 × 10⁻¹⁹) = 1.25 × 10¹⁹ electrons'],
            answer: 'About 1.25 × 10¹⁹ electrons.',
          },
          {
            title: 'Choosing materials for a battery cable',
            problem: 'Choose a conductor and an insulator for a flexible battery cable in a vehicle, and say why.',
            steps: ['Conductor: stranded copper, for low resistance and flexibility (many fine strands bend without breaking)', 'Insulator: a flexible, oil- and heat-resistant material such as rubber or a suitable PVC/XLPE, rated above the system voltage'],
            answer: 'Fine-stranded copper with flexible insulation rated for the voltage, temperature and environment.',
          },
        ],
        applications: `Cable selection, enclosure design, PCB creepage and clearance distances, transformer winding insulation and the IP ratings of outdoor solar equipment all apply these ideas. Damp, dusty inverter boards fail through insulation tracking, a common repair finding (course S4).`,
        mistakes: [
          { mistake: 'Thinking that a battery stores electrons that are “used up”.', correction: 'A battery separates charge using chemical energy; the charge circulates. Its stored chemical energy is used up.' },
          { mistake: 'Assuming insulation is perfect at any voltage.', correction: 'Every insulator has a voltage rating and breaks down above it, especially when wet, dirty or hot.' },
          { mistake: 'Drawing current arrows in the direction electrons move.', correction: 'Use conventional current, from + to −, in every diagram and calculation.' },
        ],
        demo: {
          title: 'The closed loop',
          text: 'Use the circuit demonstration to see that current flows only around a complete conducting loop, and that opening the loop anywhere stops it everywhere.',
          link: to.ckt('Circuit lab: build the loop yourself', 'ckt-01'),
          embed: 'ohms-law',
        },
        activities: [to.lib('Resistor (a deliberately poor conductor)', 'resistor'), to.lab3d('LF-3K battery terminals and their insulating covers', 'lf3k', 'bat-pos')],
        check: [
          { id: 'k1', type: 'mcq', prompt: 'Why does copper conduct well?', options: ['Its outer electrons are free to drift between atoms', 'It has no electrons', 'It is magnetic', 'It contains salt'], answer: 0, explain: 'Metals have a sea of free electrons.' },
          { id: 'k2', type: 'mcq', prompt: 'Which is an insulator?', options: ['PVC', 'Copper', 'Salt water', 'Aluminium'], answer: 0, explain: 'PVC binds its electrons tightly.' },
          { id: 'k3', type: 'numeric', prompt: 'Charge of 3.2 × 10¹⁹ electrons (C)?', answer: 5.126, tol: 0.01, unit: 'C', explain: '3.2 × 10¹⁹ × 1.602 × 10⁻¹⁹ = 5.13 C.' },
          { id: 'k4', type: 'mcq', prompt: 'Conventional current flows…', options: ['from + to − outside the source', 'from − to + outside the source', 'only in insulators', 'in both directions at once in DC'], answer: 0, explain: 'The historical convention used throughout engineering.' },
        ],
        summary: [
          'Charge is measured in coulombs; one electron carries 1.602 × 10⁻¹⁹ C.',
          'Conductors have free electrons; insulators bind them tightly; semiconductors are controllable.',
          'Insulation has a voltage rating and breaks down when wet, dirty, hot or overstressed.',
          'Diagrams use conventional current, + to −.',
          'A battery separates charge; it does not create it.',
        ],
        homework: {
          id: 'F2.M1.L1.hw',
          title: 'Charge and materials',
          brief: 'Short calculations and reasoning about charge and insulation.',
          tasks: [
            { id: 'h1', type: 'numeric', prompt: 'How many electrons make 0.5 C (× 10¹⁸)?', answer: 3.121, tol: 0.01, unit: '× 10¹⁸', explain: '0.5 / 1.602 × 10⁻¹⁹ = 3.12 × 10¹⁸.' },
            { id: 'h2', type: 'multi', prompt: 'Which conditions make insulation breakdown more likely? (select all)', options: ['Moisture', 'Dust and contamination', 'Overheating', 'Operating well below its voltage rating'], answers: [0, 1, 2], explain: 'Operating within the rating is the safe case.' },
          ],
          written: [{ prompt: 'Explain why an inverter mounted in a damp, dusty shed is more likely to suffer insulation faults.', model: 'Moisture and dust form conducting films over insulating surfaces and between PCB tracks; leakage currents and tracking grow, eventually breaking down the insulation and causing short circuits or earth faults. A suitable IP rating, ventilation and cleaning prevent it.' }],
        },
      },
    },
    {
      id: 'F2.M1.L2',
      title: 'Current and voltage',
      minutes: 35,
      content: {
        objectives: [
          'Define current as the rate of flow of charge and calculate it with I = Q/t.',
          'Define voltage as energy per unit charge and calculate it with V = W/Q.',
          'Distinguish electromotive force (EMF) and potential difference.',
          'Explain how ammeters and voltmeters are connected, and why.',
        ],
        introduction: `Current and voltage are the two quantities you will measure most often. They are easily confused, and confusing them in the laboratory has real consequences: an ammeter connected like a voltmeter is a short circuit. This lesson defines both precisely and links them to how they are measured.`,
        lecture: `### Current: the flow of charge

**Current** is the rate at which charge passes a point:

**I = Q / t**

- Unit: the **ampere (A)**. One ampere is one coulomb per second.
- Current is the *same at every point* in a single loop. Charge does not pile up anywhere in a steady circuit, so what flows into a component flows out of it.
- Typical values:
  - an LED: 10 mA;
  - a phone charger: 1–2 A;
  - a 2 kW kettle: about 9 A at 230 V;
  - a 3 kW, 24 V inverter at full load: well over 100 A.

### Voltage: energy per charge

**Voltage** (potential difference) is the energy given to, or taken from, each coulomb of charge between two points:

**V = W / Q**

- Unit: the **volt (V)**. One volt is one joule per coulomb.
- Voltage is always *between two points*. "The voltage at a node" means its voltage relative to a chosen reference node, usually called ground or 0 V.
- A 12 V battery gives each coulomb 12 J of energy; a load converts that energy into heat, light or motion.

### EMF and potential difference

- **[[emf|Electromotive force (EMF)]]** is the energy per coulomb that a *source* (battery, solar cell, generator) converts into electrical form.
- **Potential difference (p.d.)** is the energy per coulomb converted into other forms in a *load*.
- They share the unit volt. Around any closed loop, the EMFs equal the sum of the potential differences (Kirchhoff's voltage law, lesson F2.M3.L3).

### Measuring them

- A **voltmeter** measures between two points, so it is connected **across** (in parallel with) the component. It has a very high resistance, so it draws almost no current and does not disturb the circuit.
- An **ammeter** measures the current through a conductor, so it is connected **in series**: the circuit is broken and the meter inserted into the loop. It has a very low resistance, so it barely affects the current.
- **Clamp meters** measure current from the magnetic field around a conductor without breaking the circuit. They are standard for large currents (course F5).

**Never connect an ammeter across a voltage source.** Its low resistance makes it a short circuit (F1.M1.L3).

### DC and AC

This course deals with **direct current (DC)**: current that flows in one direction at a steady value, as from a battery or solar module. **Alternating current (AC)** reverses direction periodically, as from the grid or an inverter's output. It is the subject of course F3.`,
        technical: `**Voltage as a height.** A useful analogy is water in pipes. Voltage is like height (pressure), current like the flow rate, and resistance like a narrow pipe. The analogy breaks down in detail (charge is not pushed by gravity, and there is no "pressure" inside a wire), but it helps with intuition about series and parallel paths.

**Reference node.** In the circuit laboratory, the ground symbol defines 0 V. The solver reports every node voltage relative to it. Moving the ground symbol changes the node voltages, but never the voltage *between* any two nodes, and never any current.

**Meter loading.** A digital multimeter on its voltage range typically has about 10 MΩ input resistance. That is negligible in power circuits, but in high-resistance circuits (megaohm dividers, sensors) it can draw enough current to change the reading noticeably.`,
        diagrams: [{ id: 'circuit-loop', caption: 'A voltmeter is connected across a component; an ammeter is inserted into the loop in series.' }],
        formulas: [
          { name: 'Current', expr: 'I = Q / t', where: [['I', 'current', 'A'], ['Q', 'charge', 'C'], ['t', 'time', 's']] },
          { name: 'Voltage', expr: 'V = W / Q', where: [['V', 'voltage', 'V'], ['W', 'energy', 'J'], ['Q', 'charge', 'C']] },
        ],
        examples: [
          {
            title: 'Charge moved by a battery current',
            problem: 'An inverter draws 50 A from a battery for 2 minutes. How much charge flows?',
            steps: ['Q = I · t', 'Q = 50 × 120 = 6000 C'],
            answer: '6000 C (equivalent to 6000 / 3600 = 1.67 Ah).',
          },
          {
            title: 'Energy delivered',
            problem: 'That 6000 C is delivered by a 24 V battery. How much energy does it transfer?',
            steps: ['W = V · Q', 'W = 24 × 6000 = 144 000 J = 144 kJ'],
            answer: '144 kJ (equivalent to 144 000 / 3600 = 40 Wh).',
          },
        ],
        applications: `Every measurement on a battery, PV string or inverter bus uses these definitions. Battery capacity in ampere-hours (lesson F2.M5.L1) is a measure of charge; watt-hours are a measure of energy.`,
        mistakes: [
          { mistake: 'Connecting an ammeter across a supply to “measure its current”.', correction: 'An ammeter goes in series with the load. Across a supply it is a short circuit.' },
          { mistake: 'Saying “the voltage through a resistor”.', correction: 'Voltage is across (between two points); current is through.' },
          { mistake: 'Thinking current is used up by a load.', correction: 'The same current enters and leaves; it is energy that the load converts.' },
        ],
        demo: {
          title: 'Node voltages in the circuit laboratory',
          text: 'In ckt-01, place a ground symbol, then select each node and component to read voltages relative to 0 V and the current through the resistor.',
          link: to.ckt('Circuit lab: battery and resistor circuit', 'ckt-01'),
        },
        activities: [to.ckt('Circuit lab: battery and resistor circuit', 'ckt-01'), to.cmp('Voltage versus current sensing', 'voltage-vs-current-sensing')],
        check: [
          { id: 'k1', type: 'numeric', prompt: 'Current if 90 C passes in 30 s (A)?', answer: 3, tol: 0.01, unit: 'A', explain: '90/30 = 3 A.' },
          { id: 'k2', type: 'numeric', prompt: 'Voltage if 60 J is given to 5 C (V)?', answer: 12, tol: 0.01, unit: 'V', explain: '60/5 = 12 V.' },
          { id: 'k3', type: 'mcq', prompt: 'A voltmeter is connected…', options: ['across the component', 'in series with the component', 'between the circuit and the bench', 'only to ground'], answer: 0, explain: 'Voltage is measured between two points.' },
          { id: 'k4', type: 'mcq', prompt: 'In a single loop, the current…', options: ['is the same everywhere', 'is largest near the + terminal', 'decreases after each component', 'is zero in the wires'], answer: 0, explain: 'Charge is conserved.' },
        ],
        summary: [
          'Current I = Q/t, in amperes (coulombs per second).',
          'Voltage V = W/Q, in volts (joules per coulomb), always between two points.',
          'EMF is converted into electrical form by a source; p.d. is converted out of it by a load.',
          'Voltmeters go across; ammeters go in series and are never placed across a source.',
          'This course is DC; AC is course F3.',
        ],
        homework: {
          id: 'F2.M1.L2.hw',
          title: 'Current, charge and energy',
          brief: 'A 12 V battery supplies a 4 A load for 15 minutes.',
          tasks: [
            { id: 'h1', type: 'numeric', prompt: 'Charge delivered (C)?', answer: 3600, tol: 0.01, unit: 'C', explain: '4 × 900 = 3600 C (1 Ah).' },
            { id: 'h2', type: 'numeric', prompt: 'Energy delivered (kJ)?', answer: 43.2, tol: 0.01, unit: 'kJ', explain: '12 × 3600 = 43 200 J.' },
          ],
          written: [{ prompt: 'Describe how you would measure the load current and the battery voltage, including where each meter connects.', model: 'Voltage: a voltmeter across the battery terminals (+ to −). Current: break the circuit and insert an ammeter in series with the load, or use a DC clamp meter around one conductor; never place an ammeter across the battery.' }],
        },
      },
    },
    {
      id: 'F2.M1.L3',
      title: 'Units, prefixes and engineering notation',
      minutes: 30,
      content: {
        objectives: [
          'Use the SI units for the main electrical quantities.',
          'Convert between SI prefixes from pico to giga.',
          'Write values in engineering notation and read component markings.',
          'Check a calculation by tracking its units.',
        ],
        introduction: `Electrical engineering spans an enormous range of magnitudes: picofarad capacitors and kilowatt inverters, microsecond switching and 24-hour energy budgets. A misplaced prefix is one of the most common causes of wrong answers, wrong components and damaged equipment. This lesson makes unit handling automatic.`,
        lecture: `### SI units for electrical quantities

| Quantity | Symbol | Unit | Unit symbol |
|---|---|---|---|
| Charge | Q | coulomb | C |
| Current | I | ampere | A |
| Voltage | V | volt | V |
| Resistance | R | ohm | Ω |
| Power | P | watt | W |
| Energy | W or E | joule | J |
| Capacitance | C | farad | F |
| Inductance | L | henry | H |
| Time | t | second | s |
| Frequency | f | hertz | Hz |

### SI prefixes

[[si-prefix|Prefixes]] scale a unit by powers of ten:

| Prefix | Symbol | Factor |
|---|---|---|
| giga | G | 10⁹ |
| mega | M | 10⁶ |
| kilo | k | 10³ |
| (none) | | 1 |
| milli | m | 10⁻³ |
| micro | µ | 10⁻⁶ |
| nano | n | 10⁻⁹ |
| pico | p | 10⁻¹² |

Watch the capitals: **m** (milli) and **M** (mega) differ by a factor of a billion.

### Converting

To convert, multiply by the prefix factor:

- 4.7 kΩ = 4.7 × 10³ Ω = 4700 Ω;
- 220 µF = 220 × 10⁻⁶ F = 0.000 22 F;
- 35 mA = 0.035 A.

Moving between prefixes three steps apart (k to M, m to µ) shifts the decimal point three places.

### Engineering notation

Engineering notation writes numbers with exponents that are multiples of three, so they match prefixes: 0.0047 F = 4.7 × 10⁻³ F = 4.7 mF. Scientific calculators have an ENG mode that does this.

### Component markings

- **Resistor codes:** "4K7" means 4.7 kΩ; "R47" means 0.47 Ω; "1M0" means 1.0 MΩ. The letter replaces the decimal point, because a printed dot can be lost.
- **Capacitor codes:** "104" means 10 × 10⁴ pF = 100 000 pF = 100 nF.
- **Ratings:** 10 µF 63 V, 2 W, 5 A. Always read the rating as well as the value.

### Energy units in practice

The joule is small for battery and solar work. Engineers use the **watt-hour**: 1 Wh = 3600 J, and 1 kWh = 3.6 MJ. Battery charge is often given in **ampere-hours**: 1 Ah = 3600 C.

### Unit checking

Writing units through a calculation catches errors. For example, τ = R × C has units Ω × F = s. If your "time constant" comes out in volts, a step is wrong.`,
        technical: `**Why micro uses µ.** The Greek letter mu is the official symbol. Where it cannot be typed, "u" is commonly substituted (10 uF). Never use "m" for micro.

**Significant figures.** Component values come from preferred series (E12, E24) with tolerances such as ±5 %. Quoting a result as 2.348 917 kΩ implies precision the circuit does not have. Three significant figures is usually appropriate in power-electronics calculations.

**Rounding direction.** When choosing a rating from a calculation, round in the safe direction: a fuse or cable *up*, a maximum permitted current *down*. Lesson F1.M4.L1 applied this to fuse selection.`,
        diagrams: [{ id: 'si-scale', caption: 'The SI prefix ladder: each step is a factor of 1000.' }],
        formulas: [
          { name: 'Prefix conversion', expr: 'value in base units = number × prefix factor', where: [] },
          { name: 'Practical energy and charge units', expr: '1 Wh = 3600 J;  1 Ah = 3600 C', where: [] },
        ],
        examples: [
          {
            title: 'Converting component values',
            problem: 'Convert 0.0022 F, 47 000 Ω and 0.000 015 s into engineering notation with prefixes.',
            steps: ['0.0022 F = 2.2 × 10⁻³ F = 2.2 mF (also 2200 µF)', '47 000 Ω = 47 × 10³ Ω = 47 kΩ', '0.000 015 s = 15 × 10⁻⁶ s = 15 µs'],
            answer: '2.2 mF (2200 µF), 47 kΩ, 15 µs.',
          },
          {
            title: 'A time constant with prefixes',
            problem: 'Find τ = R·C for R = 4.7 kΩ and C = 220 µF.',
            steps: ['Convert: R = 4700 Ω, C = 220 × 10⁻⁶ F', 'τ = 4700 × 220 × 10⁻⁶ = 1.034 s'],
            answer: 'τ ≈ 1.03 s.',
            check: 'Units: Ω × F = s. ✓',
          },
        ],
        applications: `Datasheets, configurator outputs, simulator parameters and component markings all use prefixes. The circuit laboratory's property editor accepts values in the base unit shown beside each field, so converting correctly is part of building any circuit.`,
        mistakes: [
          { mistake: 'Confusing m (milli, 10⁻³) and M (mega, 10⁶).', correction: 'Check the capital letter; they differ by 10⁹.' },
          { mistake: 'Calculating with µF as if it were F.', correction: 'Convert to base units (× 10⁻⁶) before multiplying.' },
          { mistake: 'Reading “104” on a capacitor as 104 pF.', correction: 'The third digit is the multiplier: 10 × 10⁴ pF = 100 nF.' },
        ],
        demo: {
          title: 'Units in the time constant',
          text: 'Use the RC demonstration to enter resistance and capacitance with different prefixes and see the time constant in seconds update.',
          link: to.sim('Simulator: RC charging and discharging', 'sim-01'),
          embed: 'rc-charge',
        },
        activities: [to.lib('Resistor (value codes)', 'resistor'), to.lib('Capacitor (value codes)', 'capacitor')],
        check: [
          { id: 'k1', type: 'numeric', prompt: '3.3 kΩ in ohms?', answer: 3300, tol: 0.001, unit: 'Ω', explain: '3.3 × 10³.' },
          { id: 'k2', type: 'numeric', prompt: '470 µF in farads (× 10⁻⁴)?', answer: 4.7, tol: 0.01, unit: '× 10⁻⁴ F', explain: '470 × 10⁻⁶ = 4.7 × 10⁻⁴ F.' },
          { id: 'k3', type: 'numeric', prompt: '2.4 kWh in megajoules?', answer: 8.64, tol: 0.01, unit: 'MJ', explain: '2400 × 3600 = 8.64 × 10⁶ J.' },
          { id: 'k4', type: 'mcq', prompt: 'A resistor marked “2R2” is…', options: ['2.2 Ω', '2.2 kΩ', '22 Ω', '220 Ω'], answer: 0, explain: 'R marks the decimal point in ohms.' },
        ],
        summary: [
          'Know the SI units: C, A, V, Ω, W, J, F, H, s, Hz.',
          'Prefixes: G, M, k, m, µ, n, p — steps of 1000.',
          'Convert to base units before calculating; carry units through to check.',
          'Read codes: 4K7 = 4.7 kΩ, 104 = 100 nF.',
          '1 Wh = 3600 J; 1 Ah = 3600 C.',
        ],
        homework: {
          id: 'F2.M1.L3.hw',
          title: 'Unit conversions',
          brief: 'Convert each value.',
          tasks: [
            { id: 'h1', type: 'numeric', prompt: '0.068 A in mA?', answer: 68, tol: 0.001, unit: 'mA', explain: '0.068 × 1000.' },
            { id: 'h2', type: 'numeric', prompt: '150 nF in µF?', answer: 0.15, tol: 0.001, unit: 'µF', explain: '150 × 10⁻⁹ = 0.15 × 10⁻⁶.' },
            { id: 'h3', type: 'numeric', prompt: 'A 200 Ah battery holds how much charge (MC = 10⁶ C)?', answer: 0.72, tol: 0.01, unit: 'MC', explain: '200 × 3600 = 720 000 C.' },
          ],
          written: [{ prompt: 'Explain how carrying units through a calculation helps catch mistakes, with an example.', model: 'Each quantity’s units combine with the operations; if the result’s units do not match the expected quantity, a step is wrong. Example: energy = V × Q gives V × C = J; if the result came out in V/s, the formula was misapplied.' }],
        },
      },
    },
  ],
  quiz: {
    pass: 0.7,
    questions: [
      { id: 'q1', type: 'mcq', prompt: 'One ampere is…', options: ['one coulomb per second', 'one joule per coulomb', 'one volt per ohm squared', 'one watt per second'], answer: 0, explain: 'I = Q/t.' },
      { id: 'q2', type: 'mcq', prompt: 'One volt is…', options: ['one joule per coulomb', 'one coulomb per second', 'one ampere per ohm', 'one watt-hour'], answer: 0, explain: 'V = W/Q.' },
      { id: 'q3', type: 'numeric', prompt: 'Charge delivered by 2.5 A for 4 minutes (C)?', answer: 600, tol: 0.01, unit: 'C', explain: '2.5 × 240 = 600 C.' },
      { id: 'q4', type: 'numeric', prompt: 'Energy to move 600 C through 48 V (kJ)?', answer: 28.8, tol: 0.01, unit: 'kJ', explain: '48 × 600 = 28 800 J.' },
      { id: 'q5', type: 'numeric', prompt: '0.47 MΩ in kΩ?', answer: 470, tol: 0.001, unit: 'kΩ', explain: '0.47 × 1000.' },
      { id: 'q6', type: 'mcq', prompt: 'An ammeter is connected…', options: ['in series with the load', 'across the supply', 'across the load', 'to earth'], answer: 0, explain: 'It must carry the current it measures.' },
      { id: 'q7', type: 'mcq', prompt: 'Which material is a semiconductor?', options: ['Silicon', 'Copper', 'PVC', 'Glass'], answer: 0, explain: 'Silicon’s conductivity is controlled by doping.' },
      { id: 'q8', type: 'numeric', prompt: 'τ = R·C for 10 kΩ and 47 µF (s)?', answer: 0.47, tol: 0.01, unit: 's', explain: '10⁴ × 47 × 10⁻⁶ = 0.47 s.' },
    ],
  },
  assignment: {
    id: 'F2.M1.asg',
    title: 'Module assignment: quantities on a battery system',
    brief: 'A 12.8 V, 100 Ah lithium battery runs a 60 W fridge drawing 4.7 A on average.',
    tasks: [
      { id: 'a1', type: 'numeric', prompt: 'Charge stored by the battery (kC)?', answer: 360, tol: 0.01, unit: 'kC', explain: '100 × 3600 = 360 000 C.' },
      { id: 'a2', type: 'numeric', prompt: 'Nominal energy stored (MJ)?', answer: 4.608, tol: 0.01, unit: 'MJ', explain: '12.8 × 360 000 = 4.608 MJ (1.28 kWh).' },
      { id: 'a3', type: 'numeric', prompt: 'Charge drawn by the fridge in 1 hour (C)?', answer: 16920, tol: 0.01, unit: 'C', explain: '4.7 × 3600 = 16 920 C.' },
    ],
    written: [{ prompt: 'Explain the difference between the battery’s 100 Ah and 1.28 kWh ratings.', model: 'Ampere-hours measure charge (how many coulombs the battery can deliver); watt-hours measure energy (charge × voltage). Two batteries with the same Ah but different voltages store different energy.' }],
  },
  practicals: [
    {
      id: 'F2.M1.P1',
      title: 'Units and conversions assessment',
      description: 'Convert and calculate with SI units and prefixes. All answers must be correct.',
      task: {
        id: 'f2-units',
        kind: 'calc',
        title: 'Units, prefixes and quantities',
        brief: 'Work in base units, then express the answer in the unit asked.',
        questions: [
          { id: 'c1', type: 'numeric', prompt: '6.8 kΩ in Ω?', answer: 6800, tol: 0.001, unit: 'Ω', explain: '6.8 × 10³.' },
          { id: 'c2', type: 'numeric', prompt: '0.000 33 F in µF?', answer: 330, tol: 0.001, unit: 'µF', explain: '0.000 33 × 10⁶.' },
          { id: 'c3', type: 'numeric', prompt: 'A 25 mA LED current for 8 hours: charge (C)?', answer: 720, tol: 0.01, unit: 'C', explain: '0.025 × 28 800 = 720 C.' },
          { id: 'c4', type: 'numeric', prompt: 'τ for 2.2 kΩ and 1000 µF (s)?', answer: 2.2, tol: 0.01, unit: 's', explain: '2200 × 0.001 = 2.2 s.' },
          { id: 'c5', type: 'mcq', prompt: 'A capacitor marked “473” is…', options: ['47 nF', '473 pF', '47 µF', '4.7 nF'], answer: 0, explain: '47 × 10³ pF = 47 nF.' },
        ],
        explain: 'Convert every value to base units before calculating and check the units of the result.',
      },
      evidence: { kind: 'task', id: 'f2-units' },
    },
  ],
}
