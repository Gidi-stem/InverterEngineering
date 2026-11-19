import{t as e}from"./links-ClIw6rLF.js";var t={id:`F2`,title:`DC Electrical Systems and Fundamentals`,level:`beginner`,stage:`foundation`,summary:`Charge, current, voltage and units; resistance, Ohm’s law, power and energy; series, parallel and Kirchhoff analysis; capacitors and inductors in time; batteries, DC wiring, voltage drop, fusing, polarity, diodes and LEDs. Passing F2 opens DC construction, battery and solar practicals.`,prerequisites:[`F1`],status:`published`,phase:7,competency:`CU-02`,modules:[{id:`F2.M1`,title:`Charge, current and voltage`,summary:`What electric charge is, why some materials conduct and others insulate, how current and voltage are defined and measured, and the units and prefixes engineers use every day.`,lessons:[{id:`F2.M1.L1`,title:`Charge, conductors and insulators`,minutes:30,content:{objectives:[`Describe electric charge and state its unit, the coulomb.`,`Explain why metals conduct and why insulators do not, in terms of free electrons.`,`Classify common materials as conductors, insulators or semiconductors.`,`Explain why insulation has a voltage rating and can break down.`],introduction:`Every circuit in this programme, from a torch to a 5 kW hybrid inverter, works by moving electric [[charge]]. Before calculating anything, an engineer needs a clear picture of what is moving, what lets it move and what stops it. That picture explains why copper is used for cables, why PVC covers them, and why insulation that is damaged, wet or overstressed becomes dangerous.`,lecture:`### Electric charge

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

Between the two groups sit **semiconductors** such as silicon. Pure silicon conducts poorly, but adding tiny amounts of other elements (doping) controls its conductivity precisely. Diodes, LEDs, MOSFETs and solar cells are all made from semiconductors (lesson F2.M5.L3 and course F4).`,technical:`**Drift velocity.** The electrons themselves move slowly: in a 2.5 mm² copper wire carrying 10 A, the average drift velocity is well under a millimetre per second. What travels fast is the *signal*, the electric field, which moves at a large fraction of the speed of light. That is why a light comes on instantly when switched, even though no electron travels from the switch to the lamp in that time.

**Conventional current.** Historically, current was defined as the flow of positive charge from + to −, before the electron was discovered. Electrons actually drift from − to +. Engineers still use **conventional current** (+ to −) in all diagrams and calculations. Every arrow in this programme uses it.

**Typical dielectric strengths.** Dry air breaks down at roughly 3 kV per millimetre; PVC at roughly 10–40 kV/mm depending on grade and temperature. These are approximate textbook values for comparison only: equipment is always designed to its component ratings, not to these figures.`,diagrams:[{id:`circuit-loop`,caption:`Conventional current flows from the source’s + terminal, through the load and back to −; electrons drift the other way.`}],formulas:[{name:`Charge and electrons`,expr:`Q = n · e`,where:[[`Q`,`charge`,`C`],[`n`,`number of electrons`,`—`],[`e`,`charge of one electron, 1.602 × 10⁻¹⁹`,`C`]]},{name:`Charge moved by a steady current`,expr:`Q = I · t`,where:[[`I`,`current`,`A`],[`t`,`time`,`s`]],note:`Introduced fully in lesson L2.`}],examples:[{title:`Counting electrons`,problem:`How many electrons make up a charge of 2 C?`,steps:[`n = Q / e`,`n = 2 / (1.602 × 10⁻¹⁹) = 1.25 × 10¹⁹ electrons`],answer:`About 1.25 × 10¹⁹ electrons.`},{title:`Choosing materials for a battery cable`,problem:`Choose a conductor and an insulator for a flexible battery cable in a vehicle, and say why.`,steps:[`Conductor: stranded copper, for low resistance and flexibility (many fine strands bend without breaking)`,`Insulator: a flexible, oil- and heat-resistant material such as rubber or a suitable PVC/XLPE, rated above the system voltage`],answer:`Fine-stranded copper with flexible insulation rated for the voltage, temperature and environment.`}],applications:`Cable selection, enclosure design, PCB creepage and clearance distances, transformer winding insulation and the IP ratings of outdoor solar equipment all apply these ideas. Damp, dusty inverter boards fail through insulation tracking, a common repair finding (course S4).`,mistakes:[{mistake:`Thinking that a battery stores electrons that are “used up”.`,correction:`A battery separates charge using chemical energy; the charge circulates. Its stored chemical energy is used up.`},{mistake:`Assuming insulation is perfect at any voltage.`,correction:`Every insulator has a voltage rating and breaks down above it, especially when wet, dirty or hot.`},{mistake:`Drawing current arrows in the direction electrons move.`,correction:`Use conventional current, from + to −, in every diagram and calculation.`}],demo:{title:`The closed loop`,text:`Use the circuit demonstration to see that current flows only around a complete conducting loop, and that opening the loop anywhere stops it everywhere.`,link:e.ckt(`Circuit lab: build the loop yourself`,`ckt-01`),embed:`ohms-law`},activities:[e.lib(`Resistor (a deliberately poor conductor)`,`resistor`),e.lab3d(`LF-3K battery terminals and their insulating covers`,`lf3k`,`bat-pos`)],check:[{id:`k1`,type:`mcq`,prompt:`Why does copper conduct well?`,options:[`Its outer electrons are free to drift between atoms`,`It has no electrons`,`It is magnetic`,`It contains salt`],answer:0,explain:`Metals have a sea of free electrons.`},{id:`k2`,type:`mcq`,prompt:`Which is an insulator?`,options:[`PVC`,`Copper`,`Salt water`,`Aluminium`],answer:0,explain:`PVC binds its electrons tightly.`},{id:`k3`,type:`numeric`,prompt:`Charge of 3.2 × 10¹⁹ electrons (C)?`,answer:5.126,tol:.01,unit:`C`,explain:`3.2 × 10¹⁹ × 1.602 × 10⁻¹⁹ = 5.13 C.`},{id:`k4`,type:`mcq`,prompt:`Conventional current flows…`,options:[`from + to − outside the source`,`from − to + outside the source`,`only in insulators`,`in both directions at once in DC`],answer:0,explain:`The historical convention used throughout engineering.`}],summary:[`Charge is measured in coulombs; one electron carries 1.602 × 10⁻¹⁹ C.`,`Conductors have free electrons; insulators bind them tightly; semiconductors are controllable.`,`Insulation has a voltage rating and breaks down when wet, dirty, hot or overstressed.`,`Diagrams use conventional current, + to −.`,`A battery separates charge; it does not create it.`],homework:{id:`F2.M1.L1.hw`,title:`Charge and materials`,brief:`Short calculations and reasoning about charge and insulation.`,tasks:[{id:`h1`,type:`numeric`,prompt:`How many electrons make 0.5 C (× 10¹⁸)?`,answer:3.121,tol:.01,unit:`× 10¹⁸`,explain:`0.5 / 1.602 × 10⁻¹⁹ = 3.12 × 10¹⁸.`},{id:`h2`,type:`multi`,prompt:`Which conditions make insulation breakdown more likely? (select all)`,options:[`Moisture`,`Dust and contamination`,`Overheating`,`Operating well below its voltage rating`],answers:[0,1,2],explain:`Operating within the rating is the safe case.`}],written:[{prompt:`Explain why an inverter mounted in a damp, dusty shed is more likely to suffer insulation faults.`,model:`Moisture and dust form conducting films over insulating surfaces and between PCB tracks; leakage currents and tracking grow, eventually breaking down the insulation and causing short circuits or earth faults. A suitable IP rating, ventilation and cleaning prevent it.`}]}}},{id:`F2.M1.L2`,title:`Current and voltage`,minutes:35,content:{objectives:[`Define current as the rate of flow of charge and calculate it with I = Q/t.`,`Define voltage as energy per unit charge and calculate it with V = W/Q.`,`Distinguish electromotive force (EMF) and potential difference.`,`Explain how ammeters and voltmeters are connected, and why.`],introduction:`Current and voltage are the two quantities you will measure most often. They are easily confused, and confusing them in the laboratory has real consequences: an ammeter connected like a voltmeter is a short circuit. This lesson defines both precisely and links them to how they are measured.`,lecture:`### Current: the flow of charge

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

This course deals with **direct current (DC)**: current that flows in one direction at a steady value, as from a battery or solar module. **Alternating current (AC)** reverses direction periodically, as from the grid or an inverter's output. It is the subject of course F3.`,technical:`**Voltage as a height.** A useful analogy is water in pipes. Voltage is like height (pressure), current like the flow rate, and resistance like a narrow pipe. The analogy breaks down in detail (charge is not pushed by gravity, and there is no "pressure" inside a wire), but it helps with intuition about series and parallel paths.

**Reference node.** In the circuit laboratory, the ground symbol defines 0 V. The solver reports every node voltage relative to it. Moving the ground symbol changes the node voltages, but never the voltage *between* any two nodes, and never any current.

**Meter loading.** A digital multimeter on its voltage range typically has about 10 MΩ input resistance. That is negligible in power circuits, but in high-resistance circuits (megaohm dividers, sensors) it can draw enough current to change the reading noticeably.`,diagrams:[{id:`circuit-loop`,caption:`A voltmeter is connected across a component; an ammeter is inserted into the loop in series.`}],formulas:[{name:`Current`,expr:`I = Q / t`,where:[[`I`,`current`,`A`],[`Q`,`charge`,`C`],[`t`,`time`,`s`]]},{name:`Voltage`,expr:`V = W / Q`,where:[[`V`,`voltage`,`V`],[`W`,`energy`,`J`],[`Q`,`charge`,`C`]]}],examples:[{title:`Charge moved by a battery current`,problem:`An inverter draws 50 A from a battery for 2 minutes. How much charge flows?`,steps:[`Q = I · t`,`Q = 50 × 120 = 6000 C`],answer:`6000 C (equivalent to 6000 / 3600 = 1.67 Ah).`},{title:`Energy delivered`,problem:`That 6000 C is delivered by a 24 V battery. How much energy does it transfer?`,steps:[`W = V · Q`,`W = 24 × 6000 = 144 000 J = 144 kJ`],answer:`144 kJ (equivalent to 144 000 / 3600 = 40 Wh).`}],applications:`Every measurement on a battery, PV string or inverter bus uses these definitions. Battery capacity in ampere-hours (lesson F2.M5.L1) is a measure of charge; watt-hours are a measure of energy.`,mistakes:[{mistake:`Connecting an ammeter across a supply to “measure its current”.`,correction:`An ammeter goes in series with the load. Across a supply it is a short circuit.`},{mistake:`Saying “the voltage through a resistor”.`,correction:`Voltage is across (between two points); current is through.`},{mistake:`Thinking current is used up by a load.`,correction:`The same current enters and leaves; it is energy that the load converts.`}],demo:{title:`Node voltages in the circuit laboratory`,text:`In ckt-01, place a ground symbol, then select each node and component to read voltages relative to 0 V and the current through the resistor.`,link:e.ckt(`Circuit lab: battery and resistor circuit`,`ckt-01`)},activities:[e.ckt(`Circuit lab: battery and resistor circuit`,`ckt-01`),e.cmp(`Voltage versus current sensing`,`voltage-vs-current-sensing`)],check:[{id:`k1`,type:`numeric`,prompt:`Current if 90 C passes in 30 s (A)?`,answer:3,tol:.01,unit:`A`,explain:`90/30 = 3 A.`},{id:`k2`,type:`numeric`,prompt:`Voltage if 60 J is given to 5 C (V)?`,answer:12,tol:.01,unit:`V`,explain:`60/5 = 12 V.`},{id:`k3`,type:`mcq`,prompt:`A voltmeter is connected…`,options:[`across the component`,`in series with the component`,`between the circuit and the bench`,`only to ground`],answer:0,explain:`Voltage is measured between two points.`},{id:`k4`,type:`mcq`,prompt:`In a single loop, the current…`,options:[`is the same everywhere`,`is largest near the + terminal`,`decreases after each component`,`is zero in the wires`],answer:0,explain:`Charge is conserved.`}],summary:[`Current I = Q/t, in amperes (coulombs per second).`,`Voltage V = W/Q, in volts (joules per coulomb), always between two points.`,`EMF is converted into electrical form by a source; p.d. is converted out of it by a load.`,`Voltmeters go across; ammeters go in series and are never placed across a source.`,`This course is DC; AC is course F3.`],homework:{id:`F2.M1.L2.hw`,title:`Current, charge and energy`,brief:`A 12 V battery supplies a 4 A load for 15 minutes.`,tasks:[{id:`h1`,type:`numeric`,prompt:`Charge delivered (C)?`,answer:3600,tol:.01,unit:`C`,explain:`4 × 900 = 3600 C (1 Ah).`},{id:`h2`,type:`numeric`,prompt:`Energy delivered (kJ)?`,answer:43.2,tol:.01,unit:`kJ`,explain:`12 × 3600 = 43 200 J.`}],written:[{prompt:`Describe how you would measure the load current and the battery voltage, including where each meter connects.`,model:`Voltage: a voltmeter across the battery terminals (+ to −). Current: break the circuit and insert an ammeter in series with the load, or use a DC clamp meter around one conductor; never place an ammeter across the battery.`}]}}},{id:`F2.M1.L3`,title:`Units, prefixes and engineering notation`,minutes:30,content:{objectives:[`Use the SI units for the main electrical quantities.`,`Convert between SI prefixes from pico to giga.`,`Write values in engineering notation and read component markings.`,`Check a calculation by tracking its units.`],introduction:`Electrical engineering spans an enormous range of magnitudes: picofarad capacitors and kilowatt inverters, microsecond switching and 24-hour energy budgets. A misplaced prefix is one of the most common causes of wrong answers, wrong components and damaged equipment. This lesson makes unit handling automatic.`,lecture:`### SI units for electrical quantities

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

Writing units through a calculation catches errors. For example, τ = R × C has units Ω × F = s. If your "time constant" comes out in volts, a step is wrong.`,technical:`**Why micro uses µ.** The Greek letter mu is the official symbol. Where it cannot be typed, "u" is commonly substituted (10 uF). Never use "m" for micro.

**Significant figures.** Component values come from preferred series (E12, E24) with tolerances such as ±5 %. Quoting a result as 2.348 917 kΩ implies precision the circuit does not have. Three significant figures is usually appropriate in power-electronics calculations.

**Rounding direction.** When choosing a rating from a calculation, round in the safe direction: a fuse or cable *up*, a maximum permitted current *down*. Lesson F1.M4.L1 applied this to fuse selection.`,diagrams:[{id:`si-scale`,caption:`The SI prefix ladder: each step is a factor of 1000.`}],formulas:[{name:`Prefix conversion`,expr:`value in base units = number × prefix factor`,where:[]},{name:`Practical energy and charge units`,expr:`1 Wh = 3600 J;  1 Ah = 3600 C`,where:[]}],examples:[{title:`Converting component values`,problem:`Convert 0.0022 F, 47 000 Ω and 0.000 015 s into engineering notation with prefixes.`,steps:[`0.0022 F = 2.2 × 10⁻³ F = 2.2 mF (also 2200 µF)`,`47 000 Ω = 47 × 10³ Ω = 47 kΩ`,`0.000 015 s = 15 × 10⁻⁶ s = 15 µs`],answer:`2.2 mF (2200 µF), 47 kΩ, 15 µs.`},{title:`A time constant with prefixes`,problem:`Find τ = R·C for R = 4.7 kΩ and C = 220 µF.`,steps:[`Convert: R = 4700 Ω, C = 220 × 10⁻⁶ F`,`τ = 4700 × 220 × 10⁻⁶ = 1.034 s`],answer:`τ ≈ 1.03 s.`,check:`Units: Ω × F = s. ✓`}],applications:`Datasheets, configurator outputs, simulator parameters and component markings all use prefixes. The circuit laboratory's property editor accepts values in the base unit shown beside each field, so converting correctly is part of building any circuit.`,mistakes:[{mistake:`Confusing m (milli, 10⁻³) and M (mega, 10⁶).`,correction:`Check the capital letter; they differ by 10⁹.`},{mistake:`Calculating with µF as if it were F.`,correction:`Convert to base units (× 10⁻⁶) before multiplying.`},{mistake:`Reading “104” on a capacitor as 104 pF.`,correction:`The third digit is the multiplier: 10 × 10⁴ pF = 100 nF.`}],demo:{title:`Units in the time constant`,text:`Use the RC demonstration to enter resistance and capacitance with different prefixes and see the time constant in seconds update.`,link:e.sim(`Simulator: RC charging and discharging`,`sim-01`),embed:`rc-charge`},activities:[e.lib(`Resistor (value codes)`,`resistor`),e.lib(`Capacitor (value codes)`,`capacitor`)],check:[{id:`k1`,type:`numeric`,prompt:`3.3 kΩ in ohms?`,answer:3300,tol:.001,unit:`Ω`,explain:`3.3 × 10³.`},{id:`k2`,type:`numeric`,prompt:`470 µF in farads (× 10⁻⁴)?`,answer:4.7,tol:.01,unit:`× 10⁻⁴ F`,explain:`470 × 10⁻⁶ = 4.7 × 10⁻⁴ F.`},{id:`k3`,type:`numeric`,prompt:`2.4 kWh in megajoules?`,answer:8.64,tol:.01,unit:`MJ`,explain:`2400 × 3600 = 8.64 × 10⁶ J.`},{id:`k4`,type:`mcq`,prompt:`A resistor marked “2R2” is…`,options:[`2.2 Ω`,`2.2 kΩ`,`22 Ω`,`220 Ω`],answer:0,explain:`R marks the decimal point in ohms.`}],summary:[`Know the SI units: C, A, V, Ω, W, J, F, H, s, Hz.`,`Prefixes: G, M, k, m, µ, n, p — steps of 1000.`,`Convert to base units before calculating; carry units through to check.`,`Read codes: 4K7 = 4.7 kΩ, 104 = 100 nF.`,`1 Wh = 3600 J; 1 Ah = 3600 C.`],homework:{id:`F2.M1.L3.hw`,title:`Unit conversions`,brief:`Convert each value.`,tasks:[{id:`h1`,type:`numeric`,prompt:`0.068 A in mA?`,answer:68,tol:.001,unit:`mA`,explain:`0.068 × 1000.`},{id:`h2`,type:`numeric`,prompt:`150 nF in µF?`,answer:.15,tol:.001,unit:`µF`,explain:`150 × 10⁻⁹ = 0.15 × 10⁻⁶.`},{id:`h3`,type:`numeric`,prompt:`A 200 Ah battery holds how much charge (MC = 10⁶ C)?`,answer:.72,tol:.01,unit:`MC`,explain:`200 × 3600 = 720 000 C.`}],written:[{prompt:`Explain how carrying units through a calculation helps catch mistakes, with an example.`,model:`Each quantity’s units combine with the operations; if the result’s units do not match the expected quantity, a step is wrong. Example: energy = V × Q gives V × C = J; if the result came out in V/s, the formula was misapplied.`}]}}}],quiz:{pass:.7,questions:[{id:`q1`,type:`mcq`,prompt:`One ampere is…`,options:[`one coulomb per second`,`one joule per coulomb`,`one volt per ohm squared`,`one watt per second`],answer:0,explain:`I = Q/t.`},{id:`q2`,type:`mcq`,prompt:`One volt is…`,options:[`one joule per coulomb`,`one coulomb per second`,`one ampere per ohm`,`one watt-hour`],answer:0,explain:`V = W/Q.`},{id:`q3`,type:`numeric`,prompt:`Charge delivered by 2.5 A for 4 minutes (C)?`,answer:600,tol:.01,unit:`C`,explain:`2.5 × 240 = 600 C.`},{id:`q4`,type:`numeric`,prompt:`Energy to move 600 C through 48 V (kJ)?`,answer:28.8,tol:.01,unit:`kJ`,explain:`48 × 600 = 28 800 J.`},{id:`q5`,type:`numeric`,prompt:`0.47 MΩ in kΩ?`,answer:470,tol:.001,unit:`kΩ`,explain:`0.47 × 1000.`},{id:`q6`,type:`mcq`,prompt:`An ammeter is connected…`,options:[`in series with the load`,`across the supply`,`across the load`,`to earth`],answer:0,explain:`It must carry the current it measures.`},{id:`q7`,type:`mcq`,prompt:`Which material is a semiconductor?`,options:[`Silicon`,`Copper`,`PVC`,`Glass`],answer:0,explain:`Silicon’s conductivity is controlled by doping.`},{id:`q8`,type:`numeric`,prompt:`τ = R·C for 10 kΩ and 47 µF (s)?`,answer:.47,tol:.01,unit:`s`,explain:`10⁴ × 47 × 10⁻⁶ = 0.47 s.`}]},assignment:{id:`F2.M1.asg`,title:`Module assignment: quantities on a battery system`,brief:`A 12.8 V, 100 Ah lithium battery runs a 60 W fridge drawing 4.7 A on average.`,tasks:[{id:`a1`,type:`numeric`,prompt:`Charge stored by the battery (kC)?`,answer:360,tol:.01,unit:`kC`,explain:`100 × 3600 = 360 000 C.`},{id:`a2`,type:`numeric`,prompt:`Nominal energy stored (MJ)?`,answer:4.608,tol:.01,unit:`MJ`,explain:`12.8 × 360 000 = 4.608 MJ (1.28 kWh).`},{id:`a3`,type:`numeric`,prompt:`Charge drawn by the fridge in 1 hour (C)?`,answer:16920,tol:.01,unit:`C`,explain:`4.7 × 3600 = 16 920 C.`}],written:[{prompt:`Explain the difference between the battery’s 100 Ah and 1.28 kWh ratings.`,model:`Ampere-hours measure charge (how many coulombs the battery can deliver); watt-hours measure energy (charge × voltage). Two batteries with the same Ah but different voltages store different energy.`}]},practicals:[{id:`F2.M1.P1`,title:`Units and conversions assessment`,description:`Convert and calculate with SI units and prefixes. All answers must be correct.`,task:{id:`f2-units`,kind:`calc`,title:`Units, prefixes and quantities`,brief:`Work in base units, then express the answer in the unit asked.`,questions:[{id:`c1`,type:`numeric`,prompt:`6.8 kΩ in Ω?`,answer:6800,tol:.001,unit:`Ω`,explain:`6.8 × 10³.`},{id:`c2`,type:`numeric`,prompt:`0.000 33 F in µF?`,answer:330,tol:.001,unit:`µF`,explain:`0.000 33 × 10⁶.`},{id:`c3`,type:`numeric`,prompt:`A 25 mA LED current for 8 hours: charge (C)?`,answer:720,tol:.01,unit:`C`,explain:`0.025 × 28 800 = 720 C.`},{id:`c4`,type:`numeric`,prompt:`τ for 2.2 kΩ and 1000 µF (s)?`,answer:2.2,tol:.01,unit:`s`,explain:`2200 × 0.001 = 2.2 s.`},{id:`c5`,type:`mcq`,prompt:`A capacitor marked “473” is…`,options:[`47 nF`,`473 pF`,`47 µF`,`4.7 nF`],answer:0,explain:`47 × 10³ pF = 47 nF.`}],explain:`Convert every value to base units before calculating and check the units of the result.`},evidence:{kind:`task`,id:`f2-units`}}]},{id:`F2.M2`,title:`Resistance, Ohm's law and power`,summary:`What sets the resistance of a conductor, the relationship between voltage, current and resistance, and how electrical power and energy become heat — the calculations behind every cable, resistor and fuse.`,lessons:[{id:`F2.M2.L1`,title:`Resistance and resistivity`,minutes:30,content:{objectives:[`Define resistance and its unit, the ohm.`,`Calculate the resistance of a conductor from its resistivity, length and cross-section.`,`Explain how temperature changes resistance.`,`Read resistor values, tolerances and power ratings.`],introduction:`Resistance is the opposition a material offers to current. Sometimes it is wanted: a resistor sets an LED's current, a heating element turns electricity into heat. Often it is not: the resistance of a long battery cable wastes energy and drops voltage. Engineers calculate it from the material and the dimensions, and this lesson shows how.`,lecture:`### Resistance

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

Colour bands, printed codes (4K7) and SMD codes mark the value.`,technical:`**Conductance.** The reciprocal of resistance is conductance, G = 1/R, in siemens (S). It is convenient for parallel circuits (lesson F2.M3.L2) and is what the circuit laboratory's nodal solver uses internally.

**Contact resistance.** Every joint, crimp, screw terminal and fuse holder adds resistance, typically fractions of a milliohm when good. Loose or corroded joints can reach many milliohms. At 100 A even 5 mΩ dissipates 50 W in a few cubic millimetres (lesson F1.M1.L3), which is how terminal fires start.

**Values given here are typical textbook values** for comparison; a design uses the cable or resistor manufacturer's data.`,diagrams:[{id:`voltage-drop`,caption:`A cable has resistance in both the positive and negative conductors: the conductor length is twice the route length.`}],formulas:[{name:`Resistance of a conductor`,expr:`R = ρ · L / A`,where:[[`ρ`,`resistivity (copper 0.0172)`,`Ω·mm²/m`],[`L`,`conductor length`,`m`],[`A`,`cross-sectional area`,`mm²`]]},{name:`Temperature effect (metals)`,expr:`R_T = R₂₀ · (1 + α · (T − 20))`,where:[[`α`,`temperature coefficient (copper ≈ 0.0039)`,`/°C`]]}],examples:[{title:`Resistance of a battery cable`,problem:`A battery is 3 m (route) from its inverter, connected with 35 mm² copper cable. Find the total cable resistance.`,steps:[`Conductor length: L = 2 × 3 = 6 m (positive and negative)`,`R = 0.0172 × 6 / 35 = 0.002 95 Ω ≈ 2.95 mΩ`],answer:`About 2.95 mΩ for the round trip.`},{title:`A hot winding`,problem:`A transformer winding measures 0.40 Ω at 20 °C. Estimate its resistance at 85 °C.`,steps:[`R_T = R₂₀ · (1 + 0.0039 × (85 − 20))`,`R_T = 0.40 × (1 + 0.2535) = 0.40 × 1.2535 = 0.501 Ω`],answer:`About 0.50 Ω, 25 % higher than cold.`}],applications:`Cable sizing for battery and PV circuits, the copper loss of transformers and inductors, current-sense shunts, NTC temperature sensors and terminal-heating faults all depend on resistance. Course S2 uses R = ρL/A to size PV and battery cables.`,mistakes:[{mistake:`Using the route length instead of the conductor length for a DC circuit.`,correction:`The current goes out and back: double the route length.`},{mistake:`Forgetting to convert mm² when using ρ in Ω·m.`,correction:`Use ρ = 0.0172 Ω·mm²/m with A in mm², or convert A to m².`},{mistake:`Choosing a resistor by value only.`,correction:`Also check its power rating, tolerance and voltage rating.`}],demo:{title:`Resistance and voltage drop`,text:`Use the voltage-drop demonstration to change cable length and cross-section and watch the round-trip resistance change.`,link:e.lib(`Resistor`,`resistor`),embed:`voltage-drop`},activities:[e.lib(`Resistor`,`resistor`),e.proc(`Resistor resistance measurement`,`resistor`,`resistor-ohms`),e.proc(`Battery terminal voltage-drop test`,`battery-terminals`,`terminal-drop`)],check:[{id:`k1`,type:`numeric`,prompt:`Resistance of 10 m of 2.5 mm² copper conductor (Ω)?`,answer:.0688,tol:.01,unit:`Ω`,explain:`0.0172 × 10 / 2.5 = 0.0688 Ω.`},{id:`k2`,type:`mcq`,prompt:`Doubling a cable’s cross-section…`,options:[`halves its resistance`,`doubles its resistance`,`does not change it`,`quadruples it`],answer:0,explain:`R ∝ 1/A.`},{id:`k3`,type:`mcq`,prompt:`A 4 m cable route in a DC circuit has a conductor length of…`,options:[`8 m`,`4 m`,`2 m`,`16 m`],answer:0,explain:`Out and back.`},{id:`k4`,type:`mcq`,prompt:`The resistance of copper as it heats…`,options:[`rises`,`falls`,`stays constant`,`becomes zero`],answer:0,explain:`About +0.39 %/°C.`}],summary:[`Resistance R = V/I, in ohms.`,`R = ρL/A; copper ρ = 0.0172 Ω·mm²/m.`,`In DC circuits the conductor length is twice the route length.`,`Metal resistance rises with temperature (copper ≈ 0.39 %/°C).`,`Resistors have a value, tolerance and power rating.`],homework:{id:`F2.M2.L1.hw`,title:`Conductor resistance`,brief:`Copper ρ = 0.0172 Ω·mm²/m.`,tasks:[{id:`h1`,type:`numeric`,prompt:`Round-trip resistance of a 5 m route of 16 mm² cable (mΩ)?`,answer:10.75,tol:.01,unit:`mΩ`,explain:`0.0172 × 10 / 16 = 0.010 75 Ω.`},{id:`h2`,type:`numeric`,prompt:`The same with 25 mm² (mΩ)?`,answer:6.88,tol:.01,unit:`mΩ`,explain:`0.0172 × 10 / 25 = 0.006 88 Ω.`}],written:[{prompt:`Why do inverter battery cables use very large cross-sections even though the voltage is low?`,model:`At low voltage the current for a given power is high, so even milliohms of cable resistance cause significant voltage drop and heating (I²R). A large cross-section keeps the resistance, drop and loss acceptable.`}]}}},{id:`F2.M2.L2`,title:`Ohm's law`,minutes:30,content:{objectives:[`State Ohm's law and rearrange it for V, I or R.`,`Apply it to resistors, cables and simple loads.`,`Recognise components that do not obey it (non-ohmic devices).`,`Verify it by measurement in the circuit laboratory.`],introduction:`Ohm's law is the most-used relationship in electrical engineering. It connects the three quantities of the previous lessons and lets you predict a current before you switch on, which is the essence of working safely. This lesson's practical is the circuit laboratory exercise ckt-01.`,lecture:`### The law

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

A large difference means a wrong assumption, a wrong connection or a fault. The circuit laboratory's ckt-01 checks exactly this.`,technical:`**Internal resistance.** Real sources have internal resistance, so the terminal voltage falls as current rises. Ohm's law applied to the whole loop includes it: I = EMF / (R_load + R_internal). This is developed in lesson F2.M5.L1.

**Measuring resistance.** An ohmmeter passes a small known current through the component and measures the voltage. It must **never** be used on a live circuit: the circuit's own voltage corrupts the reading and can damage the meter. Components in circuit may also be paralleled by other parts, so measurements are often taken with one end disconnected.

**Linearity limits.** Even resistors deviate at extremes: very high voltage causes breakdown, and very high current heats them, changing R. Ratings define the region where Ohm's law holds well.`,diagrams:[{id:`circuit-loop`,caption:`A source, a resistor and the loop: I = V / R.`}],formulas:[{name:`Ohm's law`,expr:`V = I · R;  I = V / R;  R = V / I`,where:[[`V`,`voltage`,`V`],[`I`,`current`,`A`],[`R`,`resistance`,`Ω`]]}],examples:[{title:`Current through a resistor`,problem:`A 12 V supply is connected across a 1 kΩ resistor (ckt-01). Find the current.`,steps:[`Convert: R = 1000 Ω`,`I = V / R = 12 / 1000 = 0.012 A = 12 mA`],answer:`12 mA.`},{title:`Finding an unknown resistance`,problem:`A heater element draws 8.7 A from 230 V. What is its resistance when hot?`,steps:[`R = V / I`,`R = 230 / 8.7 = 26.4 Ω`],answer:`About 26.4 Ω (hot).`}],applications:`Ohm's law sets LED resistors, current-sense shunts, gate resistors in inverter drivers, feedback dividers and cable drops. Inverter fault-finding (course S4) uses it constantly to judge whether a measured current is reasonable.`,mistakes:[{mistake:`Using kΩ directly with V and A (12 V / 1 kΩ = 12 A).`,correction:`Convert to ohms first: 12/1000 = 12 mA.`},{mistake:`Measuring resistance on a live circuit.`,correction:`Isolate and discharge first; an ohmmeter supplies its own test current.`},{mistake:`Applying a single R to an LED or lamp at every voltage.`,correction:`Non-ohmic devices have operating-point-dependent resistance.`}],demo:{title:`Ohm's law explorer`,text:`Change the voltage and resistance and watch the current and the I–V line; then build the same circuit in ckt-01 and compare the solver’s current with your prediction.`,link:e.ckt(`Circuit lab: battery and resistor circuit`,`ckt-01`),embed:`ohms-law`},activities:[e.ckt(`Circuit lab: ckt-01`,`ckt-01`),e.lib(`Resistor`,`resistor`)],check:[{id:`k1`,type:`numeric`,prompt:`Current through 470 Ω at 9 V (mA)?`,answer:19.15,tol:.01,unit:`mA`,explain:`9/470 = 0.019 15 A.`},{id:`k2`,type:`numeric`,prompt:`Voltage across 2.2 kΩ carrying 5 mA (V)?`,answer:11,tol:.01,unit:`V`,explain:`0.005 × 2200 = 11 V.`},{id:`k3`,type:`numeric`,prompt:`Resistance that draws 0.25 A from 12 V (Ω)?`,answer:48,tol:.01,unit:`Ω`,explain:`12/0.25 = 48 Ω.`},{id:`k4`,type:`mcq`,prompt:`Which device is non-ohmic?`,options:[`An LED`,`A fixed metal-film resistor`,`A short copper wire at room temperature`,`A 1 kΩ carbon resistor`],answer:0,explain:`An LED’s current rises steeply above its forward voltage.`}],summary:[`V = I·R; I = V/R; R = V/I.`,`Convert to base units first.`,`Applies to resistors and conductors; diodes, LEDs and lamps are non-ohmic.`,`Predict, measure, compare: disagreement means a fault or a wrong assumption.`,`Never measure resistance on a live circuit.`],homework:{id:`F2.M2.L2.hw`,title:`Ohm's law practice`,brief:`Find the unknown in each case.`,tasks:[{id:`h1`,type:`numeric`,prompt:`24 V across 68 Ω: current (A)?`,answer:.353,tol:.01,unit:`A`,explain:`24/68 = 0.353 A.`},{id:`h2`,type:`numeric`,prompt:`150 mA through 330 Ω: voltage (V)?`,answer:49.5,tol:.01,unit:`V`,explain:`0.15 × 330 = 49.5 V.`},{id:`h3`,type:`numeric`,prompt:`A cable drops 0.6 V carrying 120 A: resistance (mΩ)?`,answer:5,tol:.01,unit:`mΩ`,explain:`0.6/120 = 0.005 Ω.`}],written:[{prompt:`A lamp’s cold resistance measures 40 Ω but it draws 0.4 A on 230 V. Explain.`,model:`Hot, its resistance is 230/0.4 = 575 Ω; tungsten’s resistance rises greatly with temperature, so the lamp is non-ohmic and draws a much larger current (≈ 5.75 A) for an instant at switch-on.`}]}}},{id:`F2.M2.L3`,title:`Power, energy and heat`,minutes:35,content:{objectives:[`Calculate electrical power with P = V·I, P = I²R and P = V²/R.`,`Calculate energy in joules and watt-hours, and convert between them.`,`Calculate efficiency and losses for a conversion stage.`,`Choose a resistor power rating with an appropriate margin.`],introduction:`Power is the rate at which energy is converted. It decides how big a battery must be, how hot a component gets and how much a system costs to run. Every inverter specification — 1 kW, 93 % efficient, 25 W idle — is a statement about power. This lesson gives the formulas and the habits of using them.`,lecture:`### Power

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

Average power matters for energy. A fridge rated 150 W that runs 40 % of the time averages 60 W, using 60 × 24 = 1440 Wh per day. Load profiles for solar design (course S2) are built from exactly this reasoning.`,technical:`**Why P = I²R dominates low-voltage design.** For a fixed power, halving the system voltage doubles the current and quadruples the I²R losses in the same cable. That is why higher-power battery systems move from 12 V to 24 V or 48 V.

**Peak and average.** Components feel average heating over seconds to minutes (thermal time constants), but fuses, semiconductors and contacts can be damaged by short peaks. Both the average and the peak must be within ratings.

**Energy conservation.** Energy in = energy out + losses, always. A design that claims more output than input, or an efficiency above 100 %, has an error.`,diagrams:[{id:`battery-model`,caption:`Energy flow from a source to a load, with I²R losses in the internal resistance and the wiring.`}],formulas:[{name:`Power`,expr:`P = V · I = I² · R = V² / R`,where:[[`P`,`power`,`W`]]},{name:`Energy`,expr:`E = P · t`,where:[[`E`,`energy`,`J or Wh`],[`t`,`time`,`s or h`]]},{name:`Efficiency`,expr:`η = P_out / P_in;  loss = P_in − P_out`,where:[[`η`,`efficiency`,`—`]]}],examples:[{title:`Resistor power rating`,problem:`A 100 Ω resistor carries 0.15 A. Find its dissipation and choose a rating from 0.25, 0.5, 1, 2, 5 W with a ×2 margin.`,steps:[`P = I²R = 0.15² × 100 = 0.0225 × 100 = 2.25 W`,`With ×2 margin: 4.5 W → choose 5 W`],answer:`2.25 W dissipated; use a 5 W resistor.`},{title:`Daily energy of a load`,problem:`A 12 V, 5 A pump runs for 3 hours per day. Find its power and daily energy.`,steps:[`P = V · I = 12 × 5 = 60 W`,`E = 60 × 3 = 180 Wh/day`],answer:`60 W and 180 Wh per day.`}],applications:`Battery sizing, solar array sizing, inverter heat-sink design, cable losses and electricity costs are all power and energy calculations. Course S2's load-profile tool adds up exactly these products of power and hours.`,mistakes:[{mistake:`Confusing power (W) with energy (Wh).`,correction:`Power is a rate; energy is power × time.`},{mistake:`Choosing a resistor rated exactly at its dissipation.`,correction:`Use a margin (×2) and derate for high ambient temperature.`},{mistake:`Ignoring efficiency when estimating battery current.`,correction:`Input power = output / η; the battery supplies the losses too.`}],demo:{title:`Battery under load`,text:`Use the battery-load demonstration to vary the load power and see the current, the I²R loss in the wiring and the energy drawn per hour.`,link:e.lib(`Battery terminals`,`battery-terminals`),embed:`battery-load`},activities:[e.lib(`Heat sink`,`heat-sink`),e.cmp(`Heat sink versus fan`,`heatsink-vs-fan`)],check:[{id:`k1`,type:`numeric`,prompt:`Power in a 22 Ω resistor with 11 V across it (W)?`,answer:5.5,tol:.01,unit:`W`,explain:`11²/22 = 121/22 = 5.5 W.`},{id:`k2`,type:`numeric`,prompt:`Energy used by a 1.2 kW kettle in 4 minutes (Wh)?`,answer:80,tol:.01,unit:`Wh`,explain:`1200 × (4/60) = 80 Wh.`},{id:`k3`,type:`numeric`,prompt:`Input power of an 800 W output at 90 % efficiency (W)?`,answer:888.9,tol:.01,unit:`W`,explain:`800/0.9 = 888.9 W.`},{id:`k4`,type:`numeric`,prompt:`Heat in a 2 mΩ joint carrying 150 A (W)?`,answer:45,tol:.01,unit:`W`,explain:`150² × 0.002 = 45 W.`}],summary:[`P = V·I = I²R = V²/R, in watts.`,`E = P·t; 1 kWh = 3.6 MJ.`,`η = P_out/P_in; losses become heat.`,`Choose power ratings with margin (×2) and derate when hot.`,`Lower voltage at the same power means higher current and much higher I²R loss.`],homework:{id:`F2.M2.L3.hw`,title:`Power and energy`,brief:`An inverter supplies 500 W for 6 hours at 91 % efficiency from a 24 V battery.`,tasks:[{id:`h1`,type:`numeric`,prompt:`Battery power (W)?`,answer:549.5,tol:.01,unit:`W`,explain:`500/0.91 = 549.5 W.`},{id:`h2`,type:`numeric`,prompt:`Battery current (A)?`,answer:22.9,tol:.01,unit:`A`,explain:`549.5/24 = 22.9 A.`},{id:`h3`,type:`numeric`,prompt:`Energy drawn from the battery (kWh)?`,answer:3.297,tol:.01,unit:`kWh`,explain:`549.5 × 6 = 3297 Wh.`}],written:[{prompt:`Where does the 49.5 W difference go, and what must the inverter design provide for it?`,model:`It is lost as heat in the transistors, transformer, inductors and wiring; the design must provide heat sinking and airflow (and thermal protection) to keep components within their temperature ratings.`}]}}}],quiz:{pass:.7,questions:[{id:`q1`,type:`numeric`,prompt:`Round-trip resistance of a 2 m route of 50 mm² copper (mΩ)?`,answer:1.376,tol:.01,unit:`mΩ`,explain:`0.0172 × 4/50 = 0.001 376 Ω.`},{id:`q2`,type:`numeric`,prompt:`Current through 56 Ω at 14 V (A)?`,answer:.25,tol:.01,unit:`A`,explain:`14/56.`},{id:`q3`,type:`numeric`,prompt:`Power in that resistor (W)?`,answer:3.5,tol:.01,unit:`W`,explain:`14 × 0.25 = 3.5 W.`},{id:`q4`,type:`mcq`,prompt:`Suitable rating for that resistor with ×2 margin (0.5, 1, 2, 5, 10 W)?`,options:[`10 W`,`5 W`,`2 W`,`1 W`],answer:0,explain:`2 × 3.5 = 7 W → 10 W.`},{id:`q5`,type:`numeric`,prompt:`Daily energy of a 40 W light used 5 h (Wh)?`,answer:200,tol:.01,unit:`Wh`,explain:`40 × 5.`},{id:`q6`,type:`numeric`,prompt:`Overall efficiency of stages 0.96 and 0.93?`,answer:.8928,tol:.01,unit:``,explain:`0.96 × 0.93 = 0.893.`},{id:`q7`,type:`mcq`,prompt:`Halving system voltage at the same power, with the same cable, makes cable loss…`,options:[`four times larger`,`twice as large`,`the same`,`half`],answer:0,explain:`Current doubles; I²R quadruples.`},{id:`q8`,type:`numeric`,prompt:`Resistance of copper at 70 °C if 1.00 Ω at 20 °C (Ω)?`,answer:1.195,tol:.01,unit:`Ω`,explain:`1 + 0.0039 × 50 = 1.195.`}]},assignment:{id:`F2.M2.asg`,title:`Module assignment: a resistive heater on a battery`,brief:`A 24 V battery supplies a 4.8 Ω heater through a cable with a 4 m route of 6 mm² copper.`,tasks:[{id:`a1`,type:`numeric`,prompt:`Round-trip cable resistance (mΩ)?`,answer:22.93,tol:.01,unit:`mΩ`,explain:`0.0172 × 8/6 = 0.022 93 Ω.`},{id:`a2`,type:`numeric`,prompt:`Circuit current (A), ignoring battery resistance?`,answer:4.977,tol:.01,unit:`A`,explain:`24/(4.8 + 0.022 93) = 4.977 A.`},{id:`a3`,type:`numeric`,prompt:`Heater power (W)?`,answer:118.9,tol:.01,unit:`W`,explain:`4.977² × 4.8 = 118.9 W.`},{id:`a4`,type:`numeric`,prompt:`Cable loss (W)?`,answer:.568,tol:.02,unit:`W`,explain:`4.977² × 0.022 93 = 0.568 W.`}],written:[{prompt:`Is the 6 mm² cable adequate? Discuss the loss and what would change for a 2 kW heater at 24 V.`,model:`Yes: the loss is under 0.5 % of the heater power. At 2 kW the current would be about 83 A, cable loss ≈ 83² × 0.023 = 160 W (8 %), and the cable would overheat; a much larger cross-section (and a higher system voltage) would be required.`}]},practicals:[{id:`F2.M2.P1`,title:`Circuit laboratory: verify Ohm's law (ckt-01)`,description:`Build the battery and resistor circuit, predict the current, read the solver’s current, and pass the exercise check, including the resistor power rating.`,link:e.ckt(`Circuit lab: battery and resistor circuit`,`ckt-01`),evidence:{kind:`exercise`,id:`ckt-01`}}]},{id:`F2.M3`,title:`Circuits`,summary:`Series and parallel circuits, voltage and current dividers, Kirchhoff’s laws and combination circuits: the methods used to analyse any DC network, from sensor dividers to battery banks.`,lessons:[{id:`F2.M3.L1`,title:`Series circuits and voltage dividers`,minutes:35,content:{objectives:[`State the rules for current, voltage and resistance in a series circuit.`,`Calculate the total resistance, current and each voltage in a series circuit.`,`Design a voltage divider and explain how a load affects it.`,`Explain why series cells add voltage, and why one open connection stops the whole circuit.`],introduction:`In a [[series-circuit|series circuit]] components are connected end to end, forming a single path. Series connections are everywhere in inverter engineering: the cells inside a battery, the modules in a PV string, the resistors of the voltage-sensing divider that tells an inverter's controller what its battery voltage is.`,lecture:`### The three rules

For components in series:

1. **The same current flows through every component.** There is only one path.
2. **The voltages add up to the supply voltage:** V = V₁ + V₂ + … (Kirchhoff's voltage law, lesson L3).
3. **The resistances add:** R_T = R₁ + R₂ + …

### Solving a series circuit

1. Find the total resistance R_T.
2. Find the current I = V / R_T.
3. Find each voltage V_n = I · R_n.
4. Check: the voltages should add up to the supply.

### The voltage divider

Two resistors in series across a voltage V_in divide it in proportion to their resistances. The voltage across R₂ is:

**V_out = V_in · R₂ / (R₁ + R₂)**

This [[voltage-divider|voltage divider]] is how electronics measures large voltages with a small, low-voltage input. For example, an inverter's controller may read its 0–60 V battery voltage through a divider that gives 0–3.0 V at its analogue input.

### Loading a divider

If a load resistance R_L is connected across R₂, it is in parallel with R₂ (lesson L2). That lowers the effective lower resistance and pulls V_out down.

- **Rule of thumb:** the load should be at least about 10 times R₂ for the divider to stay within roughly 10 % of its unloaded value. A much higher ratio keeps the error correspondingly smaller.
- Dividers therefore feed high-impedance inputs (microcontroller ADCs, op-amps). They are never used to supply power to a load.

### Series sources

Sources in series add their EMFs (with attention to polarity):

- 4 × 3.2 V LiFePO₄ cells = 12.8 V;
- 10 × 40 V PV modules = 400 V string.

The current capacity is that of one element.

### The weakness of series circuits

One open connection — a broken wire, a blown fuse, a failed cell — stops the current through *everything*. One high-resistance element (a shaded PV module, a weak cell, a corroded link) limits the whole string. That is why PV modules include bypass diodes (course S2).`,technical:`**Divider power and impedance.** Lower resistances make a divider stiffer (less affected by loads and noise) but waste more power. A 60 V divider of 56 kΩ and 3.3 kΩ draws about 1 mA and dissipates about 60 mW, which is acceptable; 560 Ω and 33 Ω would waste 6 W. Designers balance stiffness against standby loss.

**Divider accuracy.** The ratio depends on resistor tolerance. Two ±1 % resistors give a ratio accurate to within about ±2 % in the worst case, which is why voltage-sense dividers are calibrated in firmware or built with 0.1 % parts (course F4).

**Polarity in series sources.** A cell connected backwards in a series string *subtracts* its EMF and can be driven into reverse charge, which damages it.`,diagrams:[{id:`series-parallel`,caption:`Series: one path, same current, voltages add. Parallel: same voltage, currents add.`}],formulas:[{name:`Series resistance`,expr:`R_T = R₁ + R₂ + …`,where:[]},{name:`Voltage divider`,expr:`V_out = V_in · R₂ / (R₁ + R₂)`,where:[[`V_out`,`voltage across R₂`,`V`]]}],examples:[{title:`A series circuit`,problem:`A 24 V supply feeds 100 Ω, 220 Ω and 160 Ω in series. Find the current and each voltage.`,steps:[`R_T = 100 + 220 + 160 = 480 Ω`,`I = 24 / 480 = 0.05 A = 50 mA`,`V₁ = 0.05 × 100 = 5 V; V₂ = 0.05 × 220 = 11 V; V₃ = 0.05 × 160 = 8 V`],answer:`50 mA; 5 V, 11 V and 8 V.`,check:`5 + 11 + 8 = 24 V. ✓`},{title:`A battery-sense divider`,problem:`R₁ = 56 kΩ and R₂ = 3.3 kΩ divide a battery voltage. What is V_out when the battery is 54 V?`,steps:[`V_out = 54 × 3.3 / (56 + 3.3)`,`V_out = 54 × 3.3 / 59.3 = 54 × 0.055 65 = 3.005 V`],answer:`About 3.0 V: suitable for a 3.3 V analogue input.`}],applications:`Battery and DC-bus voltage sensing, PV strings, cell stacks in batteries, LED strings, and the feedback dividers of regulators. The library's voltage sensor entry describes the divider used in inverters.`,mistakes:[{mistake:`Using a voltage divider to power a load.`,correction:`The load drags the output down; use a regulator. Dividers feed high-impedance inputs only.`},{mistake:`Forgetting that the current is the same in all series elements.`,correction:`Find the current once, from R_T, then each voltage.`},{mistake:`Connecting one cell reversed in a series stack.`,correction:`Check polarity: a reversed cell subtracts and can be damaged.`}],demo:{title:`Voltage divider and loading`,text:`Set R₁ and R₂, then add a load across R₂ and watch V_out fall as the load resistance approaches R₂.`,link:e.lib(`Voltage sensor (a divider in practice)`,`voltage-sensor`),embed:`divider`},activities:[e.lib(`Voltage sensor`,`voltage-sensor`),e.proc(`Voltage-sensor scaling check`,`voltage-sensor`,`vsense-scale`)],check:[{id:`k1`,type:`numeric`,prompt:`Total resistance of 1 kΩ, 2.2 kΩ and 4.7 kΩ in series (kΩ)?`,answer:7.9,tol:.01,unit:`kΩ`,explain:`1 + 2.2 + 4.7.`},{id:`k2`,type:`numeric`,prompt:`V_out of a 12 V divider with R₁ = 10 kΩ, R₂ = 5 kΩ (V)?`,answer:4,tol:.01,unit:`V`,explain:`12 × 5/15 = 4 V.`},{id:`k3`,type:`numeric`,prompt:`Voltage of a string of 16 LiFePO₄ cells at 3.2 V (V)?`,answer:51.2,tol:.01,unit:`V`,explain:`16 × 3.2.`},{id:`k4`,type:`mcq`,prompt:`One module in a series PV string is heavily shaded. The string current…`,options:[`is limited by that module (unless bypass diodes conduct)`,`is unaffected`,`doubles`,`reverses`],answer:0,explain:`One path: the weakest element limits the current.`}],summary:[`Series: same current; voltages add; resistances add.`,`Solve with R_T, then I, then each V; check the voltages add up.`,`Divider: V_out = V_in·R₂/(R₁ + R₂); load it only lightly (R_L ≫ R₂).`,`Series sources add voltage; capacity is that of one element.`,`One open or weak element affects the whole series path.`],homework:{id:`F2.M3.L1.hw`,title:`Series and divider`,brief:`A 48 V battery-sense divider must give 2.5 V at 60 V.`,tasks:[{id:`h1`,type:`numeric`,prompt:`Required ratio R₂/(R₁ + R₂)?`,answer:.04167,tol:.01,unit:``,explain:`2.5/60 = 0.041 67.`},{id:`h2`,type:`numeric`,prompt:`With R₂ = 4.7 kΩ, R₁ (kΩ)?`,answer:108.1,tol:.01,unit:`kΩ`,explain:`R₁ + R₂ = 4.7/0.041 67 = 112.8 kΩ → R₁ = 108.1 kΩ.`},{id:`h3`,type:`numeric`,prompt:`V_out at 48 V with that divider (V)?`,answer:2,tol:.01,unit:`V`,explain:`48 × 0.041 67 = 2.0 V.`}],written:[{prompt:`Why must the microcontroller input connected to this divider have a high input resistance?`,model:`The input is in parallel with R₂; a low input resistance would reduce the effective R₂, lowering V_out and making the battery-voltage reading wrong. A resistance much larger than R₂ (≥ 10×, ideally 100×) keeps the error small.`}]}}},{id:`F2.M3.L2`,title:`Parallel circuits and current dividers`,minutes:35,content:{objectives:[`State the rules for voltage, current and resistance in a parallel circuit.`,`Calculate the equivalent resistance of parallel resistors.`,`Apply the current-divider rule.`,`Explain why parallel batteries and PV strings add current, and the precautions they need.`],introduction:`In a [[parallel-circuit|parallel circuit]] every component is connected across the same two nodes. Building wiring is parallel, so every appliance sees the full supply voltage. Battery banks and PV arrays use parallel connections to increase current capacity. Parallel circuits also hide a hazard: a short in one branch takes the full fault current of every other branch.`,lecture:`### The three rules

For components in parallel:

1. **Every branch has the same voltage** across it.
2. **The branch currents add up to the total current:** I = I₁ + I₂ + … (Kirchhoff's current law, lesson L3).
3. **The reciprocals of resistance add:** 1/R_T = 1/R₁ + 1/R₂ + …

The equivalent resistance is **always smaller than the smallest branch**. Each extra branch gives the current another path.

### Shortcuts

- **Two resistors:** R_T = R₁ · R₂ / (R₁ + R₂) ("product over sum").
- **n equal resistors R:** R_T = R / n.

### Solving a parallel circuit

1. Each branch current is I_n = V / R_n.
2. The total current is the sum.
3. Check: V / R_T should equal the total.

### The current divider

For two branches carrying a total current I:

**I₁ = I · R₂ / (R₁ + R₂)**

Note the *other* branch's resistance in the numerator: **more current takes the lower-resistance path**.

### Parallel sources

- Batteries in parallel keep the voltage of one battery and add capacity (Ah) and current capability.
- PV strings in parallel keep the string voltage and add current.

**Precautions:**

- Only parallel sources of the **same voltage and type**, at the same state of charge. Otherwise large currents flow between them.
- Use **equal-length cables** to a common point so that branches share current evenly.
- **Fuse each branch:** if one battery or string develops a short, all the others feed into it (lesson F1.M2.L3). Course S2 specifies when string fuses are required.

### Why buildings are wired in parallel

Each load gets the full voltage, can be switched independently, and a failed lamp does not turn off the others. The total current, and therefore the supply cable and main fuse, is the sum of the branch currents.`,technical:`**Conductance form.** With conductance G = 1/R, parallel conductances simply add: G_T = G₁ + G₂ + …. Nodal analysis, used by the circuit laboratory's solver, writes every node's equation in terms of conductances.

**Current sharing with unequal wiring.** Two parallel batteries with 5 mΩ internal resistance each, wired with 2 mΩ and 6 mΩ of cable, share current in the ratio of their total branch resistances: (5 + 6) : (5 + 2), so the near battery carries 11/18 = 61 % of the load. Over time it cycles harder and ages faster. Equal cable lengths prevent this.

**Circulating current.** Connecting a 13.2 V battery in parallel with a 12.6 V one through 10 mΩ total gives a momentary 60 A between them. Parallel connections are made at matched voltages.`,diagrams:[{id:`series-parallel`,caption:`Parallel branches share the same voltage; their currents add at the nodes.`}],formulas:[{name:`Parallel resistance`,expr:`1/R_T = 1/R₁ + 1/R₂ + …;  two resistors: R_T = R₁R₂/(R₁ + R₂)`,where:[]},{name:`Current divider (two branches)`,expr:`I₁ = I · R₂ / (R₁ + R₂)`,where:[[`I`,`total current`,`A`]]}],examples:[{title:`Equivalent resistance`,problem:`Find the equivalent of 12 Ω, 6 Ω and 4 Ω in parallel, and the total current from 12 V.`,steps:[`1/R_T = 1/12 + 1/6 + 1/4 = 0.0833 + 0.1667 + 0.25 = 0.5`,`R_T = 2 Ω`,`Branch currents: 1 A, 2 A, 3 A; total 6 A = 12/2 ✓`],answer:`R_T = 2 Ω; total current 6 A.`},{title:`Unequal sharing`,problem:`Two parallel battery branches have total resistances 7 mΩ and 11 mΩ and supply 90 A together. How much does each carry?`,steps:[`I₁ (7 mΩ branch) = 90 × 11 / (7 + 11) = 55 A`,`I₂ (11 mΩ branch) = 90 × 7 / 18 = 35 A`],answer:`55 A and 35 A: the lower-resistance branch works harder.`}],applications:`Parallel battery banks, parallel PV strings into a combiner, building circuits, current-sharing MOSFETs in inverter bridges and current-sense shunts all follow these rules.`,mistakes:[{mistake:`Adding parallel resistances directly.`,correction:`Add reciprocals; the result is less than the smallest branch.`},{mistake:`Paralleling batteries at different voltages or states of charge.`,correction:`Match them first; otherwise large circulating currents flow.`},{mistake:`Leaving parallel strings or batteries without branch protection.`,correction:`A fault in one branch is fed by all the others; fuse each branch where required.`}],demo:{title:`Parallel branches in the solver`,text:`Use the circuit demonstration to add parallel branches and watch the total current rise while each branch keeps the full voltage.`,link:e.ckt(`Circuit lab: free circuit building (after F2)`,`ckt-01`),embed:`ohms-law`},activities:[e.lib(`Fuse (branch protection)`,`fuse`),e.lib(`Battery terminals`,`battery-terminals`)],check:[{id:`k1`,type:`numeric`,prompt:`Equivalent of 330 Ω and 470 Ω in parallel (Ω)?`,answer:193.9,tol:.01,unit:`Ω`,explain:`330 × 470/800 = 193.9 Ω.`},{id:`k2`,type:`numeric`,prompt:`Equivalent of four 100 Ω resistors in parallel (Ω)?`,answer:25,tol:.01,unit:`Ω`,explain:`100/4.`},{id:`k3`,type:`numeric`,prompt:`Total current of 230 V loads drawing 2 A, 4.5 A and 0.3 A (A)?`,answer:6.8,tol:.01,unit:`A`,explain:`Branch currents add.`},{id:`k4`,type:`mcq`,prompt:`Two 12 V, 100 Ah batteries in parallel give…`,options:[`12 V, 200 Ah`,`24 V, 100 Ah`,`24 V, 200 Ah`,`12 V, 100 Ah`],answer:0,explain:`Parallel adds capacity at the same voltage.`}],summary:[`Parallel: same voltage; currents add; reciprocals of resistance add.`,`R_T is smaller than the smallest branch; two resistors: product over sum.`,`Current divides inversely with resistance.`,`Parallel sources add current and capacity; match voltages, equalise cables, fuse branches.`,`Building wiring is parallel so every load sees full voltage.`],homework:{id:`F2.M3.L2.hw`,title:`Parallel circuits`,brief:`Three PV strings in parallel each deliver 9.8 A at 380 V into a combiner.`,tasks:[{id:`h1`,type:`numeric`,prompt:`Total current at the combiner output (A)?`,answer:29.4,tol:.01,unit:`A`,explain:`3 × 9.8.`},{id:`h2`,type:`numeric`,prompt:`Power delivered (kW)?`,answer:11.17,tol:.01,unit:`kW`,explain:`380 × 29.4 = 11 172 W.`},{id:`h3`,type:`numeric`,prompt:`If one string is shorted, the maximum reverse current into it from the other two (A)?`,answer:19.6,tol:.01,unit:`A`,explain:`The other two strings feed it: 2 × 9.8 A.`}],written:[{prompt:`Explain why parallel PV strings may need string fuses, using your answer to h3.`,model:`If one string develops a fault, the other parallel strings drive current backwards into it; with several strings this can exceed the module’s reverse-current rating and cause overheating or fire. String fuses (or limiting the number of parallel strings) protect against it.`}]}}},{id:`F2.M3.L3`,title:`Kirchhoff's laws and combination circuits`,minutes:40,content:{objectives:[`State Kirchhoff's current and voltage laws.`,`Reduce series-parallel combination circuits step by step.`,`Write and solve loop and node equations for a two-source circuit.`,`Check solutions against the circuit laboratory solver.`],introduction:`Real circuits mix series and parallel paths and may contain more than one source: a battery and a charger, a PV array and a battery, two batteries of different voltages. Kirchhoff's two laws solve any such network. The circuit laboratory's solver applies them automatically; this lesson teaches you to apply them yourself and check it.`,lecture:`### Kirchhoff's current law (KCL)

**The total current into a [[node]] equals the total current out of it.**

Charge cannot accumulate at a node. Writing currents into a node as positive and currents out as negative: ΣI = 0.

### Kirchhoff's voltage law (KVL)

**Around any closed loop, the sum of the EMFs equals the sum of the voltage drops.**

Equivalently, the algebraic sum of all voltages around a loop is zero. Energy gained from sources equals energy given to loads.

### Reducing a combination circuit

For circuits with one source:

1. Find groups that are purely series or purely parallel.
2. Replace each group with its equivalent resistance.
3. Repeat until one resistance remains.
4. Find the total current.
5. Work back out, using Ohm's law and the divider rules, to find every voltage and current.

### Circuits with two sources

When a circuit has two sources (for example a charger and a battery feeding a load), reduction alone is not enough. Use **node voltages**:

1. Choose a reference node (0 V).
2. Name the unknown node voltage(s).
3. Write KCL at each unknown node, expressing each branch current with Ohm's law: I = (V_a − V_b) / R.
4. Solve the equations.

This is **nodal analysis**, the method the circuit laboratory's solver uses. With one unknown node it reduces to a single equation.

### Sign conventions

- Choose a direction for each unknown current. If the answer is negative, the current flows the other way: that is information, not an error.
- Keep voltages as "node minus node" consistently.

### Checking

- KCL must balance at every node.
- KVL must balance around every loop.
- The power from sources must equal the power in the resistors.`,technical:`**Matrix form.** For n unknown nodes, nodal analysis gives n simultaneous equations, G·v = i, where G is the conductance matrix. The circuit laboratory builds this matrix from your schematic (modified nodal analysis, which also handles voltage sources) and solves it by LU factorisation. That is why it can solve circuits of any size instantly.

**Superposition.** In a linear circuit with several sources, the response is the sum of the responses to each source acting alone (the others replaced by their internal resistance). It is a useful check on hand calculations.

**When Kirchhoff needs care.** KVL assumes no changing magnetic flux links the loop. In circuits with large, fast-changing currents (inverter switching loops), stray inductance makes "the voltage between two points" depend on the path. That is why layout matters in power electronics (course P2).`,diagrams:[{id:`kirchhoff`,caption:`KCL at a node: currents in equal currents out. KVL around a loop: EMFs equal the voltage drops.`}],formulas:[{name:`Kirchhoff's current law`,expr:`Σ I_in = Σ I_out  (at any node)`,where:[]},{name:`Kirchhoff's voltage law`,expr:`Σ EMF = Σ I·R  (around any loop)`,where:[]},{name:`Branch current between two nodes`,expr:`I = (V_a − V_b) / R`,where:[]}],examples:[{title:`Reducing a combination circuit`,problem:`A 12 V supply feeds R₁ = 4 Ω in series with a parallel pair R₂ = 6 Ω and R₃ = 12 Ω. Find the supply current and the current in R₃.`,steps:[`R₂ ∥ R₃ = 6 × 12 / 18 = 4 Ω`,`R_T = 4 + 4 = 8 Ω; I = 12 / 8 = 1.5 A`,`V across the pair = 1.5 × 4 = 6 V; I₃ = 6 / 12 = 0.5 A (I₂ = 1 A)`],answer:`Supply current 1.5 A; 0.5 A in R₃.`,check:`KCL: 1 + 0.5 = 1.5 A ✓. KVL: 1.5 × 4 + 6 = 12 V ✓.`},{title:`Charger, battery and load`,problem:`A 14 V charger with 0.5 Ω output resistance and a 12 V battery with 0.1 Ω internal resistance both connect to node X, which also feeds a 2 Ω load to 0 V. Find V_X and the battery current.`,steps:[`KCL at X: (14 − V_X)/0.5 + (12 − V_X)/0.1 = V_X/2`,`Expand: 28 − 2V_X + 120 − 10V_X = 0.5V_X → 148 = 12.5V_X → V_X = 11.84 V`,`Battery current = (12 − 11.84)/0.1 = 1.6 A out of the battery; charger (14 − 11.84)/0.5 = 4.32 A; load 11.84/2 = 5.92 A`],answer:`V_X = 11.84 V; the battery supplies 1.6 A (it is discharging, because the load exceeds what the charger can supply at this voltage).`,check:`KCL: 4.32 + 1.6 = 5.92 A ✓.`}],applications:`Every analysis of a charger, battery and inverter sharing a DC bus; current sharing in parallel strings; sensor circuits; and the solver in the circuit laboratory are applications of Kirchhoff’s laws.`,mistakes:[{mistake:`Treating a negative current result as a mistake.`,correction:`It means the actual direction is opposite to the one you assumed.`},{mistake:`Combining resistors that are not truly in series or parallel.`,correction:`Series means the same current with no branch between; parallel means connected across the same two nodes.`},{mistake:`Mixing up signs when walking around a KVL loop.`,correction:`Choose a direction, and count rises and drops consistently.`}],demo:{title:`Check a hand solution with the solver`,text:`Solve a combination circuit by hand, then draw it in the circuit laboratory and compare every node voltage and branch current with the solver.`,link:e.ckt(`Circuit lab: battery and resistor circuit`,`ckt-01`),embed:`divider`},activities:[e.ckt(`Circuit lab: ckt-01 (extend it to a combination circuit)`,`ckt-01`),e.lib(`Resistor`,`resistor`)],check:[{id:`k1`,type:`numeric`,prompt:`Currents of 3 A and 2.5 A enter a node; one wire leaves. Its current (A)?`,answer:5.5,tol:.01,unit:`A`,explain:`KCL.`},{id:`k2`,type:`numeric`,prompt:`A 24 V loop has drops of 10 V and 6.5 V and one more resistor. Its voltage (V)?`,answer:7.5,tol:.01,unit:`V`,explain:`KVL: 24 − 16.5.`},{id:`k3`,type:`numeric`,prompt:`10 Ω in series with (20 Ω ∥ 20 Ω): total (Ω)?`,answer:20,tol:.01,unit:`Ω`,explain:`10 + 10.`},{id:`k4`,type:`mcq`,prompt:`A nodal-analysis result gives a branch current of −0.8 A. This means…`,options:[`0.8 A flows opposite to the assumed direction`,`an error`,`no current`,`the resistor is negative`],answer:0,explain:`The sign gives the direction.`}],summary:[`KCL: current into a node equals current out.`,`KVL: around a loop, EMFs equal the voltage drops.`,`Reduce one-source circuits step by step, then work back out.`,`For several sources, write KCL at unknown nodes (nodal analysis).`,`Check with KCL, KVL and power balance.`],homework:{id:`F2.M3.L3.hw`,title:`Combination circuits`,brief:`A 9 V source feeds 3 Ω in series with (6 Ω ∥ 3 Ω).`,tasks:[{id:`h1`,type:`numeric`,prompt:`Equivalent of the parallel pair (Ω)?`,answer:2,tol:.01,unit:`Ω`,explain:`6 × 3/9 = 2 Ω.`},{id:`h2`,type:`numeric`,prompt:`Supply current (A)?`,answer:1.8,tol:.01,unit:`A`,explain:`9/5 = 1.8 A.`},{id:`h3`,type:`numeric`,prompt:`Current in the 6 Ω resistor (A)?`,answer:.6,tol:.01,unit:`A`,explain:`V_pair = 3.6 V; 3.6/6 = 0.6 A.`}],written:[{prompt:`Show that power is conserved in this circuit.`,model:`Source: 9 × 1.8 = 16.2 W. Resistors: 3 Ω: 1.8² × 3 = 9.72 W; 6 Ω: 0.6² × 6 = 2.16 W; 3 Ω (parallel): 1.2² × 3 = 4.32 W; total 16.2 W ✓.`}]}}}],quiz:{pass:.7,questions:[{id:`q1`,type:`numeric`,prompt:`Current in 150 Ω + 270 Ω in series across 21 V (mA)?`,answer:50,tol:.01,unit:`mA`,explain:`21/420 = 0.05 A.`},{id:`q2`,type:`numeric`,prompt:`Divider output: 18 V, R₁ = 12 kΩ, R₂ = 6 kΩ (V)?`,answer:6,tol:.01,unit:`V`,explain:`18 × 6/18.`},{id:`q3`,type:`numeric`,prompt:`Equivalent of 10 Ω, 15 Ω and 30 Ω in parallel (Ω)?`,answer:5,tol:.01,unit:`Ω`,explain:`1/10 + 1/15 + 1/30 = 0.2.`},{id:`q4`,type:`numeric`,prompt:`Current divider: 3 A total, R₁ = 2 Ω, R₂ = 4 Ω. Current in R₁ (A)?`,answer:2,tol:.01,unit:`A`,explain:`3 × 4/6 = 2 A.`},{id:`q5`,type:`mcq`,prompt:`Two 24 V, 200 Ah batteries in series give…`,options:[`48 V, 200 Ah`,`24 V, 400 Ah`,`48 V, 400 Ah`,`24 V, 200 Ah`],answer:0,explain:`Series adds voltage.`},{id:`q6`,type:`numeric`,prompt:`8 Ω in series with (12 Ω ∥ 24 Ω) across 32 V: supply current (A)?`,answer:2,tol:.01,unit:`A`,explain:`12∥24 = 8 Ω; 32/16 = 2 A.`},{id:`q7`,type:`mcq`,prompt:`KCL is a consequence of…`,options:[`conservation of charge`,`conservation of momentum`,`Ohm’s law`,`magnetism`],answer:0,explain:`Charge cannot accumulate at a node.`},{id:`q8`,type:`mcq`,prompt:`Connecting a load of 1 kΩ across R₂ = 10 kΩ of a divider…`,options:[`pulls V_out down a lot`,`has no effect`,`raises V_out`,`only affects R₁`],answer:0,explain:`The parallel combination is only 909 Ω.`}]},assignment:{id:`F2.M3.asg`,title:`Module assignment: a battery-sense circuit and a two-battery bank`,brief:`Part A: an inverter senses its battery with R₁ = 100 kΩ and R₂ = 4.7 kΩ into an ADC with 1 MΩ input resistance. Part B: two parallel 12.8 V batteries (internal 6 mΩ each) are wired with 3 mΩ and 9 mΩ of cable to a load drawing 120 A.`,tasks:[{id:`a1`,type:`numeric`,prompt:`A: unloaded V_out at 57.6 V (V)?`,answer:2.586,tol:.01,unit:`V`,explain:`57.6 × 4.7/104.7 = 2.586 V.`},{id:`a2`,type:`numeric`,prompt:`A: R₂ in parallel with the 1 MΩ input (kΩ)?`,answer:4.678,tol:.01,unit:`kΩ`,explain:`4.7 × 1000/1004.7 = 4.678 kΩ.`},{id:`a3`,type:`numeric`,prompt:`A: loaded V_out (V)?`,answer:2.574,tol:.01,unit:`V`,explain:`57.6 × 4.678/104.678 = 2.574 V (0.4 % low).`},{id:`a4`,type:`numeric`,prompt:`B: current in the battery with 3 mΩ cable (A)?`,answer:75,tol:.01,unit:`A`,explain:`Branch resistances: 6 + 3 = 9 mΩ and 6 + 9 = 15 mΩ; I₁ = 120 × 15/(9 + 15) = 75 A (the other carries 45 A).`}],written:[{prompt:`Comment on both results and recommend improvements for Part B.`,model:`A: the ADC loading error is small (0.4 %) and can be calibrated out. B: the near battery carries 75 A and the far one 45 A, so the near battery cycles harder and ages faster; use equal-length cables (or connect the load diagonally across the bank) and fuse each battery.`}]},practicals:[{id:`F2.M3.P1`,title:`Circuit analysis assessment`,description:`Analyse series, parallel and combination circuits, including a two-source circuit. All answers must be correct.`,task:{id:`f2-circuit-analysis`,kind:`calc`,title:`Analysing DC circuits`,brief:`Circuit 1: a 24 V supply feeds R₁ = 6 Ω in series with (R₂ = 12 Ω ∥ R₃ = 6 Ω). Circuit 2: node X connects a 13.6 V charger through 0.2 Ω, a 12.8 V battery through 0.05 Ω, and a 1.6 Ω load to 0 V.`,questions:[{id:`c1`,type:`numeric`,prompt:`Circuit 1: total resistance (Ω)?`,answer:10,tol:.01,unit:`Ω`,explain:`12 ∥ 6 = 4 Ω; 6 + 4 = 10 Ω.`},{id:`c2`,type:`numeric`,prompt:`Circuit 1: supply current (A)?`,answer:2.4,tol:.01,unit:`A`,explain:`24/10.`},{id:`c3`,type:`numeric`,prompt:`Circuit 1: current in R₂ (A)?`,answer:.8,tol:.01,unit:`A`,explain:`V_pair = 2.4 × 4 = 9.6 V; 9.6/12 = 0.8 A.`},{id:`c4`,type:`numeric`,prompt:`Circuit 2: node voltage V_X (V)?`,answer:12.64,tol:.005,unit:`V`,explain:`KCL: (13.6 − V)/0.2 + (12.8 − V)/0.05 = V/1.6 → 68 + 256 = V(5 + 20 + 0.625) → V = 324/25.625 = 12.644 V.`},{id:`c5`,type:`mcq`,prompt:`Circuit 2: is the battery charging or discharging?`,options:[`Discharging: V_X is below 12.8 V`,`Charging: V_X is above 12.8 V`],answer:0,explain:`Current flows from the battery to the node when V_X < 12.8 V.`}],explain:`Reduce one-source circuits and work back out; for two sources write KCL at the shared node with each current as (V_source − V_X)/R.`},evidence:{kind:`task`,id:`f2-circuit-analysis`}}]},{id:`F2.M4`,title:`Energy storage and time`,summary:`How capacitors and inductors store energy, why their voltages and currents change exponentially with a time constant, and what that means for filters, switching and safety. Practised in the simulator and circuit laboratory.`,lessons:[{id:`F2.M4.L1`,title:`Capacitors and the RC time constant`,minutes:40,content:{objectives:[`Explain how a capacitor stores charge and energy, and define capacitance.`,`Calculate the time constant τ = R·C and the capacitor voltage during charge and discharge.`,`Combine capacitors in series and parallel.`,`Measure τ in the simulator and verify a capacitor circuit in the circuit laboratory.`],introduction:`A capacitor stores energy in an electric field between two conductors. Inverters depend on capacitors: the DC-bus bank that supplies the switching current, the output filter that smooths the sine wave, and the small timing capacitors in controllers. Their behaviour in time — charging and discharging exponentially — is what this lesson is about, and it is also why a switched-off inverter can still be dangerous (F1.M2.L2).`,lecture:`### Capacitance

A capacitor is two conducting plates separated by an insulator (the dielectric). Applying a voltage moves charge onto one plate and off the other. The charge stored is proportional to the voltage:

**Q = C · V**

- **Capacitance (C)** is measured in **farads (F)**. Practical values range from picofarads to farads, so µF and nF are the usual units.
- Capacitance increases with plate area and dielectric permittivity, and decreases with plate separation.
- Every capacitor has a **voltage rating**. Above it the dielectric breaks down (lesson F2.M1.L1).

### Energy stored

**E = ½ · C · V²**

The energy rises with the *square* of voltage. That is why high-voltage DC buses store dangerous energy even in modest capacitances.

### Charging through a resistor

When a capacitor charges from a voltage V through a resistor R, the current is largest at the start and falls as the capacitor voltage rises:

**v_C(t) = V · (1 − e^(−t/τ)),   τ = R · C**

- The [[time-constant|time constant]] τ is in seconds when R is in Ω and C in F.
- After **1τ** the capacitor reaches 63.2 % of V; after **5τ**, more than 99 %. Engineers treat it as fully charged after 5τ.
- The capacitor voltage **cannot change instantly**. A sudden step of supply voltage appears entirely across the resistor at first.

### Discharging

Discharging from V₀ through R:

**v_C(t) = V₀ · e^(−t/τ)**

After 1τ the voltage has fallen to 36.8 % of V₀; after 5τ, below 1 %. The time to fall to a safe voltage V_s is **t = τ · ln(V₀/V_s)** (lesson F1.M3.L3).

### Combining capacitors

- **Parallel:** capacitances add, C_T = C₁ + C₂ + …. Bus banks parallel several capacitors to increase capacitance and share ripple current.
- **Series:** reciprocals add, 1/C_T = 1/C₁ + 1/C₂ + …. Series connection raises the voltage rating; balancing resistors are then needed to share the voltage evenly.

This is the opposite of resistors.

### Electrolytic capacitors

Aluminium electrolytic capacitors give large capacitance in a small volume but are **polarised**: reversed, they can overheat, vent or explode. They also have significant **ESR** (equivalent series resistance), which causes heating from ripple current and rises as they age (course F4).`,technical:`**Capacitor current.** The current into a capacitor is i = C · dv/dt. A fast voltage change demands a large current. That is how bus capacitors supply the inverter bridge's pulsed current, and why a capacitor connected directly across a battery draws a large inrush (pre-charge resistors limit it, course S1).

**The simulator's experiment.** sim-01 drives 1 kΩ and 10 µF from a 10 V square wave with 10 Ω source resistance, so τ = 1010 × 10⁻⁵ = 10.1 ms. With a half-period of 50 ms ≈ 5τ, the capacitor nearly completes each charge and discharge.

**Tolerance.** Electrolytic capacitors often have tolerances of ±20 %, so measured time constants can differ noticeably from the nominal R·C.`,diagrams:[{id:`rc-curve`,caption:`RC charge and discharge: 63.2 % after one time constant; effectively complete after 5τ.`}],formulas:[{name:`Charge and capacitance`,expr:`Q = C · V`,where:[[`C`,`capacitance`,`F`]]},{name:`Stored energy`,expr:`E = ½ · C · V²`,where:[]},{name:`RC time constant`,expr:`τ = R · C`,where:[[`τ`,`time constant`,`s`]]},{name:`Charge and discharge`,expr:`v_C = V(1 − e^(−t/τ));  v_C = V₀ · e^(−t/τ)`,where:[]}],examples:[{title:`Charging time`,problem:`A 1000 µF capacitor charges through 1 kΩ from 12 V (ckt-03). Find τ, the voltage after 1 s, and the time to be considered fully charged.`,steps:[`τ = 1000 × 1000 × 10⁻⁶ = 1 s`,`v_C(1 s) = 12 × (1 − e⁻¹) = 12 × 0.632 = 7.59 V`,`Fully charged ≈ 5τ = 5 s`],answer:`τ = 1 s; 7.59 V after 1 s; about 5 s to charge fully.`},{title:`Discharge to a safe voltage`,problem:`The same capacitor at 12 V discharges through 2.2 kΩ. How long until it is below 1 V?`,steps:[`τ = 2200 × 0.001 = 2.2 s`,`t = 2.2 × ln(12/1) = 2.2 × 2.485 = 5.47 s`],answer:`About 5.5 s.`}],applications:`DC-bus banks, output filters, snubbers, timing circuits, soft-start and pre-charge circuits, and the capacitor-discharge procedure of every inverter repair depend on these results.`,mistakes:[{mistake:`Adding series capacitances like resistances.`,correction:`Series capacitors combine like parallel resistors; parallel capacitors add.`},{mistake:`Reversing an electrolytic capacitor.`,correction:`Observe the marked polarity; reversed electrolytics can vent or explode.`},{mistake:`Assuming a capacitor is discharged after 1τ.`,correction:`1τ leaves 36.8 %; use 5τ or calculate t = τ·ln(V₀/V_s), then measure.`}],demo:{title:`RC charge and discharge`,text:`Change R and C and watch the charge and discharge curves; mark the 63.2 % point and compare it with τ = R·C. Then run sim-01 and measure τ from the oscilloscope.`,link:e.sim(`Simulator: RC charging and discharging`,`sim-01`),embed:`rc-charge`},activities:[e.sim(`sim-01 RC charging and discharging`,`sim-01`),e.ckt(`ckt-03 Capacitor charging and discharging`,`ckt-03`),e.lib(`Capacitor`,`capacitor`)],check:[{id:`k1`,type:`numeric`,prompt:`τ for 47 kΩ and 22 µF (s)?`,answer:1.034,tol:.01,unit:`s`,explain:`47 000 × 22 × 10⁻⁶ = 1.034 s.`},{id:`k2`,type:`numeric`,prompt:`Percentage of full voltage after 2τ of charging (%)?`,answer:86.47,tol:.01,unit:`%`,explain:`1 − e⁻² = 0.8647.`},{id:`k3`,type:`numeric`,prompt:`Two 470 µF capacitors in series (µF)?`,answer:235,tol:.01,unit:`µF`,explain:`Equal capacitors in series halve.`},{id:`k4`,type:`numeric`,prompt:`Energy in 100 µF at 50 V (J)?`,answer:.125,tol:.01,unit:`J`,explain:`½ × 10⁻⁴ × 2500.`}],summary:[`Q = CV; E = ½CV²; voltage rating and polarity matter.`,`τ = RC; 63.2 % after 1τ, effectively complete after 5τ.`,`Discharge: v = V₀e^(−t/τ); time to a safe level t = τ·ln(V₀/V_s).`,`Capacitors in parallel add; in series, reciprocals add.`,`Capacitor voltage cannot change instantly; i = C·dv/dt.`],homework:{id:`F2.M4.L1.hw`,title:`RC calculations`,brief:`A 330 µF capacitor charges from 24 V through 10 kΩ.`,tasks:[{id:`h1`,type:`numeric`,prompt:`τ (s)?`,answer:3.3,tol:.01,unit:`s`,explain:`10⁴ × 330 × 10⁻⁶.`},{id:`h2`,type:`numeric`,prompt:`Voltage after 5 s (V)?`,answer:18.72,tol:.01,unit:`V`,explain:`e^(−5/3.3) = e^(−1.515) = 0.2198, so v = 24 × (1 − 0.2198) = 24 × 0.7802 = 18.72 V.`},{id:`h3`,type:`numeric`,prompt:`Initial charging current (mA)?`,answer:2.4,tol:.01,unit:`mA`,explain:`24/10 000 = 2.4 mA (the capacitor starts at 0 V).`}],written:[{prompt:`Explain why the charging current is largest at the start and zero at the end.`,model:`At the start the capacitor voltage is zero, so the full supply voltage is across the resistor and I = V/R. As the capacitor charges, the resistor’s voltage (V − v_C) falls, so the current falls exponentially, reaching zero when v_C = V.`}]}}},{id:`F2.M4.L2`,title:`Inductors and the RL time constant`,minutes:40,content:{objectives:[`Explain how an inductor stores energy in a magnetic field and define inductance.`,`Calculate τ = L/R and the current during rise and decay in an RL circuit.`,`Explain the voltage spike when inductor current is interrupted, and how it is controlled.`,`Measure τ and the reverse voltage in the simulator.`],introduction:`An inductor stores energy in a magnetic field around a coil. Inverters use inductors in their output filters and in boost and MPPT converters; transformers are coupled inductors. The key behaviour is the mirror image of a capacitor's: an inductor's **current** cannot change instantly. Trying to stop it suddenly produces a large voltage, which destroys switches unless designed for.`,lecture:`### Inductance

Current through a coil creates a magnetic field. If the current changes, the changing field induces a voltage in the coil that opposes the change:

**v_L = L · di/dt**

- **Inductance (L)** is measured in **henries (H)**, with mH and µH typical in power electronics.
- Inductance rises with the number of turns (as N²) and with a magnetic core of high permeability. A core can **saturate**: beyond a certain current, its inductance collapses (course F4).
- Real inductors also have winding resistance (copper loss, lesson F2.M2.L1).

### Energy stored

**E = ½ · L · I²**

### Current rise in an RL circuit

When a voltage V is applied to a resistor R in series with an inductor L, the current rises exponentially:

**i(t) = (V/R) · (1 − e^(−t/τ)),   τ = L / R**

- After 1τ the current reaches 63.2 % of its final value V/R; after 5τ, more than 99 %.
- At the first instant the inductor has the full voltage across it, and no current flows yet.

### Current decay

If the source is replaced by a path for the current (for example a diode or the source's own resistance), the current decays:

**i(t) = I₀ · e^(−t/τ)**

The inductor *drives* this current, so its voltage reverses: it acts as a source, pushing the current on.

### Interrupting an inductor

If the current path is opened suddenly — a switch opens, a transistor turns off — di/dt becomes enormous, and so does v = L·di/dt. The voltage rises until something breaks down: the switch's contacts arc, or a transistor fails.

Designers provide a path for the current:

- a **freewheeling (flyback) diode** across relay coils and inductive loads;
- the **body diodes** of the MOSFETs in an inverter bridge, which carry inductive load current during dead time;
- **snubbers** (RC networks) to absorb switching spikes.

### Comparing L and C

| | Capacitor | Inductor |
|---|---|---|
| Stores energy in | electric field | magnetic field |
| Cannot change instantly | voltage | current |
| Energy | ½CV² | ½LI² |
| Time constant | RC | L/R |`,technical:`**The simulator's experiment.** sim-02 uses R₁ = 100 Ω, L₁ = 100 mH with 1 Ω winding resistance, and a 10 Ω source resistance: R_total = 111 Ω, so τ = 0.1/111 = 0.90 ms and I_final = 10/111 = 90 mA. When the generator switches low, the inductor voltage jumps to about −I·(R₁ + R_gen) ≈ −10 V, because the current continues through the source.

**Relay coils.** A 12 V relay coil of 0.5 H drawing 40 mA, interrupted in 10 µs with no diode, would try to produce v = 0.5 × 0.04 / 10⁻⁵ = 2000 V. That is why every relay driver in the library's relay entry has a flyback diode.

**Saturation.** In a saturated inductor, the current rises much faster than the formula predicts because L has collapsed. Inverter controllers limit current partly for this reason.`,diagrams:[{id:`rl-curve`,caption:`RL current rise and decay with τ = L/R; the inductor voltage reverses when the source is removed.`}],formulas:[{name:`Inductor voltage`,expr:`v_L = L · di/dt`,where:[[`L`,`inductance`,`H`]]},{name:`Stored energy`,expr:`E = ½ · L · I²`,where:[]},{name:`RL time constant`,expr:`τ = L / R`,where:[[`R`,`total series resistance`,`Ω`]]},{name:`Rise and decay`,expr:`i = (V/R)(1 − e^(−t/τ));  i = I₀ · e^(−t/τ)`,where:[]}],examples:[{title:`RL time constant`,problem:`A 50 mH inductor with 2 Ω winding resistance is connected in series with 48 Ω across 12 V. Find τ, the final current and the current after 1 ms.`,steps:[`R = 48 + 2 = 50 Ω; τ = 0.05 / 50 = 1 ms`,`I_final = 12 / 50 = 0.24 A`,`i(1 ms) = 0.24 × (1 − e⁻¹) = 0.24 × 0.632 = 0.152 A`],answer:`τ = 1 ms; 240 mA final; 152 mA after 1 ms.`},{title:`Energy in an output inductor`,problem:`An inverter output inductor of 1.5 mH carries a peak current of 20 A. How much energy does it hold, and what must happen when the bridge switches off?`,steps:[`E = ½ × 0.0015 × 20² = 0.3 J`,`The current must continue: it flows through the MOSFET body diodes (freewheeling) back to the DC bus`],answer:`0.3 J, returned through the freewheeling diodes rather than forced to stop.`}],applications:`Inverter output filters, boost and buck converters in MPPT controllers, transformers, relay coils, current sensing and EMI chokes. Every switching design must provide a path for inductor current.`,mistakes:[{mistake:`Switching an inductive load off with no freewheeling path.`,correction:`Provide a diode or snubber; otherwise the voltage spike destroys the switch.`},{mistake:`Forgetting the winding resistance in τ = L/R.`,correction:`R is the total series resistance, including the coil’s own resistance and the source’s.`},{mistake:`Assuming an inductor’s current can change instantly.`,correction:`It rises and falls with τ = L/R; trying to force it creates large voltages.`}],demo:{title:`RL response in the simulator`,text:`Run sim-02, measure τ from the current trace on CH1, and observe the inductor voltage reverse on CH2 when the generator switches low.`,link:e.sim(`Simulator: RL circuit response`,`sim-02`)},activities:[e.sim(`sim-02 RL circuit response`,`sim-02`),e.lib(`Inductor`,`inductor`),e.lib(`Relay (coil and flyback diode)`,`relay`)],check:[{id:`k1`,type:`numeric`,prompt:`τ for 200 mH and 40 Ω total (ms)?`,answer:5,tol:.01,unit:`ms`,explain:`0.2/40 = 0.005 s.`},{id:`k2`,type:`numeric`,prompt:`Energy in 10 mH at 5 A (J)?`,answer:.125,tol:.01,unit:`J`,explain:`½ × 0.01 × 25.`},{id:`k3`,type:`mcq`,prompt:`What cannot change instantly in an inductor?`,options:[`Its current`,`Its voltage`,`Its resistance`,`Its temperature`],answer:0,explain:`v = L·di/dt would be infinite.`},{id:`k4`,type:`mcq`,prompt:`Why is a diode fitted across a relay coil?`,options:[`To give the coil current a path when the driver turns off, preventing a voltage spike`,`To rectify AC`,`To light up`,`To increase the coil current`],answer:0,explain:`Freewheeling path.`}],summary:[`v = L·di/dt; E = ½LI²; inductor current cannot change instantly.`,`τ = L/R (total series resistance); 63.2 % after 1τ.`,`Interrupting inductor current produces large voltages.`,`Provide freewheeling diodes, body diodes or snubbers.`,`L and C are duals: current versus voltage, magnetic versus electric field.`],homework:{id:`F2.M4.L2.hw`,title:`RL calculations`,brief:`A 24 V supply drives a 120 mH coil (3 Ω) through a 9 Ω resistor.`,tasks:[{id:`h1`,type:`numeric`,prompt:`τ (ms)?`,answer:10,tol:.01,unit:`ms`,explain:`0.12/12 = 0.01 s.`},{id:`h2`,type:`numeric`,prompt:`Final current (A)?`,answer:2,tol:.01,unit:`A`,explain:`24/12.`},{id:`h3`,type:`numeric`,prompt:`Stored energy at the final current (J)?`,answer:.24,tol:.01,unit:`J`,explain:`½ × 0.12 × 4.`}],written:[{prompt:`Describe what would happen if the supply were disconnected by a switch with no diode across the coil, and how to prevent it.`,model:`The current would try to drop to zero in microseconds; v = L·di/dt would rise to hundreds or thousands of volts, arcing the switch contacts (or destroying a transistor). A freewheeling diode across the coil lets the current decay gradually through the coil resistance, limiting the voltage to about one diode drop.`}]}}}],quiz:{pass:.7,questions:[{id:`q1`,type:`numeric`,prompt:`Charge on 220 µF at 50 V (mC)?`,answer:11,tol:.01,unit:`mC`,explain:`220 × 10⁻⁶ × 50 = 0.011 C.`},{id:`q2`,type:`numeric`,prompt:`τ for 1.5 kΩ and 680 µF (s)?`,answer:1.02,tol:.01,unit:`s`,explain:`1500 × 680 × 10⁻⁶.`},{id:`q3`,type:`numeric`,prompt:`Voltage remaining after 3τ of discharge from 100 V (V)?`,answer:4.979,tol:.01,unit:`V`,explain:`100 × e⁻³ = 4.98 V.`},{id:`q4`,type:`numeric`,prompt:`Three 1000 µF capacitors in parallel (µF)?`,answer:3e3,tol:.01,unit:`µF`,explain:`They add.`},{id:`q5`,type:`numeric`,prompt:`τ for 30 mH and 15 Ω (ms)?`,answer:2,tol:.01,unit:`ms`,explain:`0.03/15.`},{id:`q6`,type:`numeric`,prompt:`Energy in 4 mH at 15 A (J)?`,answer:.45,tol:.01,unit:`J`,explain:`½ × 0.004 × 225.`},{id:`q7`,type:`mcq`,prompt:`An electrolytic capacitor fitted reversed may…`,options:[`overheat and vent or explode`,`work normally`,`double its capacitance`,`become an inductor`],answer:0,explain:`Electrolytics are polarised.`},{id:`q8`,type:`mcq`,prompt:`In an inverter bridge, inductive load current during dead time flows through…`,options:[`the MOSFET body (freewheeling) diodes`,`nothing: it stops instantly`,`the gate driver`,`the fan`],answer:0,explain:`The current must continue.`}]},assignment:{id:`F2.M4.asg`,title:`Module assignment: pre-charge and freewheeling`,brief:`Part A: an inverter’s 2200 µF bus is pre-charged from a 48 V battery through a 22 Ω resistor before the main contactor closes. Part B: its 24 V cooling-fan relay has a 0.3 H coil of 600 Ω.`,tasks:[{id:`a1`,type:`numeric`,prompt:`A: pre-charge time constant (ms)?`,answer:48.4,tol:.01,unit:`ms`,explain:`22 × 0.0022 = 0.0484 s.`},{id:`a2`,type:`numeric`,prompt:`A: time to reach 95 % of 48 V (ms)?`,answer:145,tol:.01,unit:`ms`,explain:`t = τ · ln(1/0.05) = 48.4 × 2.996 = 145 ms.`},{id:`a3`,type:`numeric`,prompt:`A: peak pre-charge current (A)?`,answer:2.182,tol:.01,unit:`A`,explain:`48/22 = 2.18 A (instead of kiloamperes with no resistor).`},{id:`a4`,type:`numeric`,prompt:`B: coil current (mA)?`,answer:40,tol:.01,unit:`mA`,explain:`24/600.`},{id:`a5`,type:`numeric`,prompt:`B: coil time constant (ms)?`,answer:.5,tol:.01,unit:`ms`,explain:`0.3/600 = 0.0005 s.`}],written:[{prompt:`Explain the purpose of the pre-charge resistor and the relay’s flyback diode.`,model:`Pre-charge: an uncharged capacitor looks like a short circuit, so closing the contactor directly would draw a huge inrush current, welding contacts and stressing the capacitors; the resistor limits it to about 2 A and charges the bus in about 5τ before the contactor closes. Flyback diode: when the transistor driving the relay turns off, the coil current continues through the diode and decays with τ = L/R, preventing a destructive voltage spike.`}]},practicals:[{id:`F2.M4.P1`,title:`Simulator: measure an RC time constant (sim-01)`,description:`Run the RC experiment, measure the charging and discharging time constants from the oscilloscope and answer its questions.`,link:e.sim(`sim-01 RC charging and discharging`,`sim-01`),evidence:{kind:`activity`,id:`sim:sim-01`}},{id:`F2.M4.P2`,title:`Circuit laboratory: capacitor charge and safe discharge (ckt-03)`,description:`Build the charge and discharge circuit with correct electrolytic polarity and a discharge resistor, and pass the exercise check.`,link:e.ckt(`ckt-03 Capacitor charging and discharging`,`ckt-03`),evidence:{kind:`exercise`,id:`ckt-03`}},{id:`F2.M4.P3`,title:`Simulator: RL response (sim-02)`,description:`Run the RL experiment, measure τ = L/R and the peak current, and observe the reverse inductor voltage.`,link:e.sim(`sim-02 RL circuit response`,`sim-02`),evidence:{kind:`activity`,id:`sim:sim-02`}}]},{id:`F2.M5`,title:`DC sources and DC systems`,summary:`Batteries as real sources with EMF, internal resistance and capacity; the wiring of DC systems — conductor size, voltage drop, fusing and polarity; and diodes and LEDs as one-way devices. This module prepares for battery engineering (P5) and solar design (S2).`,lessons:[{id:`F2.M5.L1`,title:`Batteries as sources: EMF, internal resistance, capacity, series and parallel`,minutes:40,content:{objectives:[`Model a battery as an EMF in series with an internal resistance and calculate its terminal voltage under load.`,`Calculate capacity in Ah and Wh, usable energy and runtime.`,`Configure cells and batteries in series and parallel for a required voltage and capacity.`,`Explain why terminal voltage sags under load and recovers at rest.`],introduction:`A battery is not an ideal voltage source. Its voltage falls when it delivers current, falls as it discharges and depends on temperature and age. Every inverter's low-voltage cut-off, every runtime estimate and every battery-bank design starts from a simple model: an [[emf|EMF]] behind an [[internal-resistance|internal resistance]], with a limited [[capacity]].`,lecture:`### The battery model

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

Course P5 covers chemistries, charging and battery management in depth.`,technical:`**Measuring internal resistance.** Apply a known load step ΔI and measure the voltage change ΔV: r = ΔV/ΔI. For example, a voltage that falls from 12.80 V to 12.62 V when 60 A is applied gives r = 0.18/60 = 3 mΩ (including terminal contacts).

**Why voltage is a poor fuel gauge for LiFePO₄.** Its open-circuit voltage is very flat across most of the state-of-charge range, so a few tens of millivolts separate 30 % and 70 %. Battery monitors count charge in and out (coulomb counting) instead.

**Temperature.** Cold raises internal resistance and reduces available capacity. Lithium batteries must not be charged below their specified minimum temperature (often around 0 °C); the BMS enforces this. Values given in this lesson are typical, for learning; real designs use the manufacturer's datasheet.`,diagrams:[{id:`battery-model`,caption:`A battery modelled as an EMF E with internal resistance r: the terminal voltage falls by I·r under load.`}],formulas:[{name:`Terminal voltage`,expr:`V = E − I · r`,where:[[`E`,`EMF (open-circuit voltage)`,`V`],[`r`,`internal resistance`,`Ω`]]},{name:`Energy capacity`,expr:`E_Wh = V_nom · Ah`,where:[]},{name:`Runtime`,expr:`t = (E_Wh · DoD · η) / P_load`,where:[[`DoD`,`allowed depth of discharge`,`—`],[`η`,`inverter efficiency`,`—`],[`P_load`,`load power`,`W`]]}],examples:[{title:`Terminal voltage under load`,problem:`A battery with E = 25.6 V and r = 12 mΩ supplies 80 A. Find the terminal voltage and the internal loss.`,steps:[`V = 25.6 − 80 × 0.012 = 25.6 − 0.96 = 24.64 V`,`Loss = I²r = 80² × 0.012 = 76.8 W`],answer:`24.64 V at the terminals; 76.8 W of heat inside the battery.`},{title:`Runtime of an inverter load`,problem:`A 12.8 V, 200 Ah LiFePO₄ battery (80 % DoD) supplies a 300 W AC load through an inverter with η = 0.90. Estimate the runtime.`,steps:[`Energy: 12.8 × 200 = 2560 Wh; usable = 2560 × 0.8 = 2048 Wh`,`Runtime = 2048 × 0.90 / 300 = 6.14 h`],answer:`About 6.1 hours.`}],applications:`Battery bank design for inverters and solar systems (courses S1, S2, P5), low-voltage cut-off settings, and diagnosing weak batteries from voltage sag all use this model.`,mistakes:[{mistake:`Judging state of charge from voltage under heavy load.`,correction:`Voltage sags by I·r under load; judge at rest or use a battery monitor.`},{mistake:`Calculating runtime from the full nominal capacity.`,correction:`Apply the allowed depth of discharge and the inverter efficiency.`},{mistake:`Mixing old and new, or different-capacity, batteries in one bank.`,correction:`Use identical batteries of the same age and state of charge.`}],demo:{title:`Battery under load`,text:`Change the load current and internal resistance to see the terminal voltage sag, the internal heat and the runtime for a given capacity and depth of discharge.`,link:e.lib(`Battery terminals`,`battery-terminals`),embed:`battery-load`},activities:[e.lib(`Battery terminals`,`battery-terminals`),e.proc(`Terminal voltage-drop test`,`battery-terminals`,`terminal-drop`),e.lab3d(`LF-3K battery input`,`lf3k`,`bat-pos`)],check:[{id:`k1`,type:`numeric`,prompt:`Terminal voltage: E = 12.9 V, r = 15 mΩ, I = 40 A (V)?`,answer:12.3,tol:.01,unit:`V`,explain:`12.9 − 0.6.`},{id:`k2`,type:`numeric`,prompt:`Energy of a 48 V, 100 Ah battery (kWh)?`,answer:4.8,tol:.01,unit:`kWh`,explain:`48 × 100 = 4800 Wh.`},{id:`k3`,type:`numeric`,prompt:`Number of 3.2 V LiFePO₄ cells for a 25.6 V battery?`,answer:8,tol:.001,unit:``,explain:`25.6/3.2.`},{id:`k4`,type:`mcq`,prompt:`Four 12 V, 100 Ah batteries for 24 V, 200 Ah are connected…`,options:[`two in series, and two such strings in parallel`,`all four in series`,`all four in parallel`,`three in series, one in parallel`],answer:0,explain:`2S2P.`}],summary:[`Battery model: EMF E with internal resistance r; V = E − I·r.`,`Capacity in Ah (charge) and Wh (energy = V × Ah).`,`Usable energy = Wh × DoD; runtime = usable × η / load.`,`Series adds voltage; parallel adds Ah; use identical units and fuse parallel strings.`,`Real limits come from the manufacturer’s data.`],homework:{id:`F2.M5.L1.hw`,title:`Battery calculations`,brief:`A 24 V lead-acid bank (50 % DoD) must run a 400 W load for 5 hours through a 90 % efficient inverter.`,tasks:[{id:`h1`,type:`numeric`,prompt:`Energy drawn from the battery (Wh)?`,answer:2222,tol:.01,unit:`Wh`,explain:`400 × 5 / 0.9 = 2222 Wh.`},{id:`h2`,type:`numeric`,prompt:`Nominal capacity needed (Wh)?`,answer:4444,tol:.01,unit:`Wh`,explain:`2222 / 0.5.`},{id:`h3`,type:`numeric`,prompt:`Capacity in Ah at 24 V?`,answer:185.2,tol:.01,unit:`Ah`,explain:`4444/24 = 185 Ah.`}],written:[{prompt:`A battery reads 12.1 V while a 1 kW inverter is running and 12.7 V a few minutes after it stops. Explain the difference and which reading indicates its state of charge.`,model:`Under load the terminal voltage sags by I·r (plus a slower chemical polarisation); when the load is removed it recovers towards its open-circuit voltage. The rested reading (12.7 V) indicates state of charge; the loaded reading mainly reflects internal resistance and current.`}]}}},{id:`F2.M5.L2`,title:`DC system wiring: conductor size, voltage drop, fusing and polarity`,minutes:40,content:{objectives:[`Calculate voltage drop in a DC cable and select a cross-section for a drop limit.`,`Check a cable against its current-carrying capacity and choose its protection.`,`Explain DC polarity conventions, marking and the consequences of reverse polarity.`,`Design the wiring of a simple battery-inverter circuit.`],introduction:`DC systems run at low voltage and high current, so their wiring is dominated by two questions: will the cable overheat, and how much voltage will it lose? A third question, polarity, is unique to DC: connect it backwards and many devices are destroyed. This lesson combines resistance (F2.M2), Ohm's law and protection (F1.M4) into a design method.`,lecture:`### Voltage drop

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
- keep positive and negative cables together to reduce loop inductance and magnetic fields.`,technical:`**Why keep conductors together?** Separated positive and negative cables form a large loop. At the high, pulsed currents an inverter draws, that loop has significant inductance, causing voltage spikes on the DC bus and radiated interference. Twisting or bundling the pair reduces it.

**Temperature and drop.** Hot cables have higher resistance (≈ +0.39 %/°C for copper). Calculations at 20 °C slightly underestimate the drop of a heavily loaded cable at operating temperature; a margin covers this.

**The circuit laboratory.** Its validator warns when a circuit draws more current than a wire or component is rated for, and flags reversed electrolytic capacitors and diodes: the same polarity and rating checks applied to real installations.`,diagrams:[{id:`voltage-drop`,caption:`Voltage drop along the positive and negative conductors: the load sees V_battery − I·R_cable.`}],formulas:[{name:`Voltage drop`,expr:`V_drop = I · ρ · 2L / A`,where:[[`L`,`route length`,`m`],[`A`,`cross-section`,`mm²`],[`ρ`,`0.0172 for copper`,`Ω·mm²/m`]]},{name:`Cross-section for a drop limit`,expr:`A = ρ · 2L · I / V_drop,max`,where:[]},{name:`Drop as a percentage`,expr:`drop % = V_drop / V_system × 100`,where:[]}],examples:[{title:`Sizing a battery cable by voltage drop`,problem:`A 24 V inverter draws up to 110 A from a battery 2.5 m away. Size the copper cable for a maximum 2 % drop.`,steps:[`V_drop,max = 0.02 × 24 = 0.48 V`,`A = 0.0172 × 5 × 110 / 0.48 = 19.7 mm² → next standard size 25 mm²`,`Check actual drop: 110 × 0.0172 × 5 / 25 = 0.378 V (1.6 %) ✓`],answer:`25 mm², giving a 1.6 % drop. Then check its current-carrying capacity in the manufacturer’s table is above the fuse rating.`},{title:`Checking an existing cable`,problem:`A 12 V, 1000 W inverter (η = 0.9, current at 12 V) uses 16 mm² cable over a 3 m route. What is the drop?`,steps:[`I = 1000 / (0.9 × 12) = 92.6 A`,`V_drop = 92.6 × 0.0172 × 6 / 16 = 0.597 V = 5.0 % of 12 V`],answer:`5 %: too high. The inverter would reach low-voltage cut-off early. Use a larger cable (35 mm² gives 2.3 %) or shorten the run.`}],applications:`Battery-inverter cabling, PV string and array cables, DC load circuits in vehicles, boats and cabins, and telecom DC plants. Course S2's design tool applies these calculations to every cable in a solar system.`,mistakes:[{mistake:`Sizing a cable by current alone at low voltage.`,correction:`Check the voltage drop too; at 12–48 V it usually decides the size.`},{mistake:`Using the route length instead of twice the route length.`,correction:`The current flows out and back.`},{mistake:`Making the final battery connection without checking polarity.`,correction:`Verify + and − with a meter first; reverse polarity destroys many inverters.`}],demo:{title:`Voltage drop calculator`,text:`Vary the current, route length, cross-section and system voltage and watch the drop percentage, the cable loss and the voltage the load sees.`,link:e.lib(`DC input`,`dc-input`),embed:`voltage-drop`},activities:[e.lib(`DC input`,`dc-input`),e.proc(`DC lug inspection`,`dc-input`,`dclug-inspect`),e.lib(`Fuse`,`fuse`),e.lab3d(`LF-3K battery fuse`,`lf3k`,`fuse`)],check:[{id:`k1`,type:`numeric`,prompt:`Drop for 50 A on a 4 m route of 25 mm² (V)?`,answer:.275,tol:.01,unit:`V`,explain:`50 × 0.0172 × 8/25 = 0.275 V.`},{id:`k2`,type:`numeric`,prompt:`Minimum cross-section: 12 V, 60 A, 2 m route, 3 % drop (mm²)?`,answer:11.47,tol:.01,unit:`mm²`,explain:`0.0172 × 4 × 60/0.36 = 11.47 → 16 mm².`},{id:`k3`,type:`mcq`,prompt:`Where is the main fuse of a battery circuit placed?`,options:[`As close as practical to the battery positive terminal`,`At the inverter end`,`In the negative cable only`,`Anywhere`],answer:0,explain:`So the whole cable is protected.`},{id:`k4`,type:`mcq`,prompt:`A battery is connected in reverse to an inverter without polarity protection. Likely result?`,options:[`Large current through internal diodes, blowing the fuse or destroying the input stage`,`The inverter runs backwards`,`Nothing`,`Higher output voltage`],answer:0,explain:`Body diodes conduct in reverse.`}],summary:[`V_drop = I·ρ·2L/A; keep battery and PV drops to a few per cent.`,`Size A for the drop limit, then check current capacity from manufacturer tables.`,`Satisfy both the drop limit and I_b ≤ I_n ≤ I_z.`,`Fuse at the battery positive with DC-rated devices.`,`Mark and check polarity before connecting; keep + and − together.`],homework:{id:`F2.M5.L2.hw`,title:`DC cable design`,brief:`A 48 V inverter draws 70 A from a battery with a 6 m cable route. Standard sizes: 10, 16, 25, 35 mm². Limit: 1.5 %.`,tasks:[{id:`h1`,type:`numeric`,prompt:`Maximum drop (V)?`,answer:.72,tol:.01,unit:`V`,explain:`0.015 × 48.`},{id:`h2`,type:`numeric`,prompt:`Minimum cross-section (mm²)?`,answer:20.07,tol:.01,unit:`mm²`,explain:`0.0172 × 12 × 70/0.72 = 20.07 → 25 mm².`},{id:`h3`,type:`numeric`,prompt:`Actual drop with 25 mm² (%)?`,answer:1.204,tol:.01,unit:`%`,explain:`70 × 0.0172 × 12/25 = 0.578 V = 1.20 %.`}],written:[{prompt:`Why is a 48 V system easier to wire than a 12 V system of the same power?`,model:`For the same power, 48 V draws a quarter of the current of 12 V, so the same cable has a quarter of the voltage drop in volts — one-sixteenth as a percentage of the higher system voltage — and one-sixteenth of the I²R loss; much smaller cables meet the limits.`}]}}},{id:`F2.M5.L3`,title:`Diodes and LEDs: one-way valves and current limiting`,minutes:35,content:{objectives:[`Explain forward and reverse bias of a diode and its forward voltage.`,`Identify anode and cathode and predict whether a diode conducts.`,`Calculate an LED series resistor and its power.`,`Describe the main uses of diodes in DC and inverter systems.`],introduction:`A [[diode]] lets current flow one way only. That simple property is used throughout power electronics: rectifiers, reverse-polarity protection, freewheeling paths for inductors (F2.M4.L2), solar bypass and blocking diodes, and the body diode inside every MOSFET. The [[led|LED]] is a diode that emits light, and it is the classic first example of designing a current limit. This lesson's practical is ckt-02.`,lecture:`### Forward and reverse bias

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
- **Indicators:** status LEDs on every inverter front panel.`,technical:`**Temperature.** A silicon diode's forward voltage falls by roughly 2 mV per °C as it heats. In parallel diodes, the hotter one conducts more and heats further, so diodes are not simply paralleled to share current.

**Reverse recovery.** When a conducting diode is switched off rapidly, it conducts briefly in reverse while its stored charge clears. In fast switching converters this causes losses and spikes; fast-recovery and Schottky diodes are chosen for those positions (course P2).

**The circuit laboratory model.** The solver uses a piecewise-linear diode: a forward voltage plus a small series resistance when forward-biased, and a very high resistance when reversed. It is accurate enough for current-limit design; real diodes follow the exponential characteristic in their datasheets.`,diagrams:[{id:`diode-led`,caption:`Diode symbol, forward and reverse bias, and an LED with its series current-limiting resistor.`}],formulas:[{name:`LED series resistor`,expr:`R = (V_s − V_f) / I_LED`,where:[[`V_s`,`supply voltage`,`V`],[`V_f`,`LED forward voltage`,`V`],[`I_LED`,`required current`,`A`]]},{name:`Diode dissipation`,expr:`P = V_f · I`,where:[]}],examples:[{title:`An LED on 9 V (ckt-02)`,problem:`A red LED (V_f = 2.0 V) should run at about 15 mA from 9 V. Choose R from 330, 390, 470, 560 Ω and find the current and resistor power.`,steps:[`R = (9 − 2.0) / 0.015 = 467 Ω → choose 470 Ω`,`I = (9 − 2.0) / 470 = 14.9 mA`,`P_R = 0.0149² × 470 = 0.104 W → a 0.25 W resistor is adequate`],answer:`470 Ω, 14.9 mA, about 0.1 W.`},{title:`Reverse-polarity protection loss`,problem:`A series silicon diode (V_f = 0.8 V at 5 A) protects a 12 V device drawing 5 A. Find its dissipation and the voltage the device receives.`,steps:[`P = 0.8 × 5 = 4 W (needs a heat sink)`,`Device voltage = 12 − 0.8 = 11.2 V`],answer:`4 W lost and 0.8 V less at the device. For high currents, a MOSFET-based protection circuit is used instead.`}],applications:`Status LEDs, rectifiers, reverse-polarity protection, freewheeling diodes, PV bypass diodes and inverter bridges. The circuit laboratory exercise ckt-02 assesses LED current limiting.`,mistakes:[{mistake:`Connecting an LED directly to a supply.`,correction:`Always use a series resistor (or a current-regulated driver).`},{mistake:`Fitting a diode the wrong way round.`,correction:`The band marks the cathode; the arrow on the symbol points to it.`},{mistake:`Ignoring diode dissipation at high currents.`,correction:`P = V_f·I; amperes through a diode need heat sinking.`}],demo:{title:`LED circuit in the circuit laboratory`,text:`Build ckt-02: a supply, a resistor and an LED. Try 470 Ω, then reverse the LED, then remove the resistor (in simulation only) and read the solver’s warnings.`,link:e.ckt(`Circuit lab: LED circuit`,`ckt-02`)},activities:[e.ckt(`ckt-02 LED circuit`,`ckt-02`),e.lib(`Diode`,`diode`),e.proc(`Diode test`,`diode`,`diode-test`)],check:[{id:`k1`,type:`numeric`,prompt:`Resistor for a 3.0 V LED at 20 mA from 12 V (Ω)?`,answer:450,tol:.01,unit:`Ω`,explain:`(12 − 3)/0.02 = 450 Ω → use 470 Ω.`},{id:`k2`,type:`numeric`,prompt:`Power in a diode with V_f = 0.7 V carrying 15 A (W)?`,answer:10.5,tol:.01,unit:`W`,explain:`0.7 × 15.`},{id:`k3`,type:`mcq`,prompt:`A diode conducts when…`,options:[`its anode is more positive than its cathode by at least V_f`,`its cathode is more positive`,`any voltage is applied`,`it is cold`],answer:0,explain:`Forward bias.`},{id:`k4`,type:`mcq`,prompt:`The band on a diode body marks…`,options:[`the cathode`,`the anode`,`the voltage rating`,`nothing`],answer:0,explain:`Cathode band.`}],summary:[`Diodes conduct anode → cathode once forward voltage is exceeded; they block in reverse.`,`V_f ≈ 0.6–0.7 V silicon, 0.2–0.4 V Schottky, ≈ 1.8–3.3 V LEDs (typical).`,`LED resistor R = (V_s − V_f)/I; check its power.`,`Diode dissipation P = V_f·I.`,`Diodes rectify, protect, freewheel, bypass and indicate.`],homework:{id:`F2.M5.L3.hw`,title:`Diode and LED design`,brief:`A green LED (V_f = 2.2 V) indicator must run at 10 mA from a 24 V battery.`,tasks:[{id:`h1`,type:`numeric`,prompt:`Calculated resistance (kΩ)?`,answer:2.18,tol:.01,unit:`kΩ`,explain:`(24 − 2.2)/0.01 = 2180 Ω → 2.2 kΩ.`},{id:`h2`,type:`numeric`,prompt:`Current with 2.2 kΩ (mA)?`,answer:9.909,tol:.01,unit:`mA`,explain:`21.8/2200 = 9.91 mA.`},{id:`h3`,type:`numeric`,prompt:`Resistor power (W)?`,answer:.216,tol:.02,unit:`W`,explain:`0.009 909² × 2200 = 0.216 W → use a 0.5 W resistor (×2 margin).`}],written:[{prompt:`Why does the same LED need a much larger resistor on 24 V than on 5 V, and what happens to the efficiency?`,model:`The resistor must drop the difference between supply and LED voltage at the set current; at 24 V that is 21.8 V versus 2.8 V at 5 V, so R is about 8× larger and wastes 21.8 × 0.01 = 0.22 W versus 0.03 W: most of the power heats the resistor. Constant-current drivers are used for higher-power LEDs.`}]}}}],quiz:{pass:.7,questions:[{id:`q1`,type:`numeric`,prompt:`A battery reads 13.0 V open-circuit and 12.4 V at 50 A. Internal resistance (mΩ)?`,answer:12,tol:.01,unit:`mΩ`,explain:`0.6/50 = 0.012 Ω.`},{id:`q2`,type:`numeric`,prompt:`Usable energy of 25.6 V, 100 Ah LiFePO₄ at 80 % DoD (Wh)?`,answer:2048,tol:.01,unit:`Wh`,explain:`2560 × 0.8.`},{id:`q3`,type:`numeric`,prompt:`Runtime of that energy for a 500 W load at η = 0.92 (h)?`,answer:3.768,tol:.01,unit:`h`,explain:`2048 × 0.92/500 = 3.77 h.`},{id:`q4`,type:`numeric`,prompt:`Drop for 120 A on a 1.5 m route of 35 mm² (V)?`,answer:.1769,tol:.01,unit:`V`,explain:`120 × 0.0172 × 3/35 = 0.177 V.`},{id:`q5`,type:`mcq`,prompt:`A 12 V battery cable sized only for current capacity, over a long run, will most likely…`,options:[`have excessive voltage drop`,`be too large`,`overheat at low current`,`reverse polarity`],answer:0,explain:`At low voltage the drop usually decides the size.`},{id:`q6`,type:`numeric`,prompt:`LED resistor: 5 V supply, V_f = 2.0 V, 10 mA (Ω)?`,answer:300,tol:.01,unit:`Ω`,explain:`3/0.01.`},{id:`q7`,type:`mcq`,prompt:`Which battery bank gives 48 V, 200 Ah from 12 V, 100 Ah batteries?`,options:[`Two parallel strings of four in series (8 batteries)`,`Four in series`,`Eight in series`,`Four in parallel`],answer:0,explain:`4S2P.`},{id:`q8`,type:`mcq`,prompt:`A freewheeling diode across an inductor is connected…`,options:[`reverse-biased by the supply, so it conducts only when the switch opens`,`forward-biased all the time`,`in series with the inductor`,`across the battery`],answer:0,explain:`It carries the inductor current only after switch-off.`}]},assignment:{id:`F2.M5.asg`,title:`Module assignment: a small off-grid DC system`,brief:`A cabin needs 1.2 kWh per day from its battery (inverter losses included). Use 12 V, 100 Ah AGM batteries (50 % DoD, internal resistance 6 mΩ each) for a 24 V system with one day of autonomy. The inverter peak draw is 75 A over a 2 m cable route with a 2 % drop limit.`,tasks:[{id:`a1`,type:`numeric`,prompt:`Nominal capacity required (Wh)?`,answer:2400,tol:.01,unit:`Wh`,explain:`1200/0.5.`},{id:`a2`,type:`numeric`,prompt:`Capacity required at 24 V (Ah)?`,answer:100,tol:.01,unit:`Ah`,explain:`2400/24.`},{id:`a3`,type:`numeric`,prompt:`Number of 12 V, 100 Ah batteries?`,answer:2,tol:.001,unit:``,explain:`Two in series: 24 V, 100 Ah = 2400 Wh.`},{id:`a4`,type:`numeric`,prompt:`Bank internal resistance (mΩ)?`,answer:12,tol:.01,unit:`mΩ`,explain:`Series resistances add: 6 + 6.`},{id:`a5`,type:`numeric`,prompt:`Minimum cable cross-section for the drop limit (mm²)?`,answer:10.75,tol:.01,unit:`mm²`,explain:`0.0172 × 4 × 75/0.48 = 10.75 → 16 mm².`}],written:[{prompt:`Describe the full DC wiring: configuration, polarity, fusing and connection practice.`,model:`Two batteries in series (+ of one to − of the other) give 24 V; the bank + goes through a DC-rated fuse at the battery (sized ≥ 1.25 × 75 ≈ 94 A → 100 A, within the 16 mm² cable’s rating per the manufacturer’s table — otherwise use 25 mm²) to the inverter +; bank − to inverter −; red/black marked, polarity verified with a meter before final connection, crimped lugs torqued to specification, terminal covers fitted, cables run together.`}]},practicals:[{id:`F2.M5.P1`,title:`Circuit laboratory: LED current limiting (ckt-02)`,description:`Build the LED circuit with a correctly sized series resistor and correct polarity, and pass the exercise check (5–20 mA).`,link:e.ckt(`ckt-02 LED circuit`,`ckt-02`),evidence:{kind:`exercise`,id:`ckt-02`}},{id:`F2.M5.P2`,title:`DC system design assessment`,description:`Design the battery bank, cable and fuse for a DC system. All answers must be correct.`,task:{id:`f2-dc-design`,kind:`calc`,title:`Designing a battery-inverter DC circuit`,brief:`A 48 V system must deliver 3.6 kWh per day (inverter losses included) with 1 day of autonomy from 12.8 V, 100 Ah LiFePO₄ batteries (80 % DoD). The inverter draws at most 80 A, 3 m cable route, 1.5 % drop limit. Cable sizes: 10, 16, 25, 35 mm². Fuse sizes: 80, 100, 125, 160 A.`,questions:[{id:`c1`,type:`numeric`,prompt:`Nominal capacity required (Wh)?`,answer:4500,tol:.01,unit:`Wh`,explain:`3600/0.8.`},{id:`c2`,type:`numeric`,prompt:`Batteries in series per string (12.8 V each to ≈ 48 V)?`,answer:4,tol:.001,unit:``,explain:`4 × 12.8 = 51.2 V nominal.`},{id:`c3`,type:`numeric`,prompt:`Parallel strings needed (each string 51.2 V × 100 Ah = 5120 Wh)?`,answer:1,tol:.001,unit:``,explain:`5120 ≥ 4500: one string.`},{id:`c4`,type:`numeric`,prompt:`Minimum cable cross-section for 1.5 % at 48 V (mm²)?`,answer:11.47,tol:.01,unit:`mm²`,explain:`0.0172 × 6 × 80/0.72 = 11.47 → 16 mm².`},{id:`c5`,type:`numeric`,prompt:`Fuse rating with the 1.25 margin (A)?`,answer:100,tol:.001,unit:`A`,explain:`1.25 × 80 = 100 A.`},{id:`c6`,type:`mcq`,prompt:`Before the final battery connection you must…`,options:[`verify polarity with a meter and keep the fuse open until connections are complete`,`connect quickly to avoid sparks`,`remove the fuse permanently`,`reverse the cables to test protection`],answer:0,explain:`Polarity check and controlled energisation.`}],explain:`Size the bank from daily energy, depth of discharge and voltage; size the cable for the drop limit and check its current capacity; fuse at 1.25 × the maximum current at the battery positive; verify polarity before connecting.`},evidence:{kind:`task`,id:`f2-dc-design`}}]}],exam:{pass:.7,minutes:60,attempts:3,cooldownHours:24,questions:[{id:`e1`,type:`numeric`,prompt:`Current when 1800 C passes in 10 minutes (A)?`,answer:3,tol:.01,unit:`A`,explain:`1800/600.`},{id:`e2`,type:`numeric`,prompt:`0.0047 F in µF?`,answer:4700,tol:.001,unit:`µF`,explain:`0.0047 × 10⁶.`},{id:`e3`,type:`mcq`,prompt:`A voltmeter is connected…`,options:[`across the component`,`in series`,`only to earth`,`between two loops`],answer:0,explain:`Voltage is between two points.`},{id:`e4`,type:`numeric`,prompt:`Round-trip resistance of a 4 m route of 10 mm² copper (mΩ)?`,answer:13.76,tol:.01,unit:`mΩ`,explain:`0.0172 × 8/10.`},{id:`e5`,type:`numeric`,prompt:`Current in 680 Ω at 17 V (mA)?`,answer:25,tol:.01,unit:`mA`,explain:`17/680.`},{id:`e6`,type:`numeric`,prompt:`Power in 47 Ω carrying 0.2 A (W)?`,answer:1.88,tol:.01,unit:`W`,explain:`0.04 × 47.`},{id:`e7`,type:`numeric`,prompt:`Battery input power for 1500 W output at η = 0.94 (W)?`,answer:1596,tol:.01,unit:`W`,explain:`1500/0.94 = 1595.7 W.`},{id:`e8`,type:`numeric`,prompt:`Total of 220 Ω, 330 Ω and 470 Ω in series (Ω)?`,answer:1020,tol:.01,unit:`Ω`,explain:`They add.`},{id:`e9`,type:`numeric`,prompt:`Divider output: 30 V, R₁ = 27 kΩ, R₂ = 3 kΩ (V)?`,answer:3,tol:.01,unit:`V`,explain:`30 × 3/30.`},{id:`e10`,type:`numeric`,prompt:`60 Ω ∥ 30 Ω (Ω)?`,answer:20,tol:.01,unit:`Ω`,explain:`1800/90.`},{id:`e11`,type:`numeric`,prompt:`2 Ω in series with (3 Ω ∥ 6 Ω) across 12 V: supply current (A)?`,answer:3,tol:.01,unit:`A`,explain:`3∥6 = 2 Ω; 12/4 = 3 A.`},{id:`e12`,type:`mcq`,prompt:`Kirchhoff’s current law states that…`,options:[`current into a node equals current out`,`voltages around a loop add to zero`,`V = IR`,`power is conserved`],answer:0,explain:`Conservation of charge.`},{id:`e13`,type:`numeric`,prompt:`τ for 4.7 kΩ and 470 µF (s)?`,answer:2.209,tol:.01,unit:`s`,explain:`4700 × 470 × 10⁻⁶.`},{id:`e14`,type:`numeric`,prompt:`Capacitor voltage after 1τ charging from 0 to 20 V (V)?`,answer:12.64,tol:.01,unit:`V`,explain:`20 × 0.632.`},{id:`e15`,type:`numeric`,prompt:`τ for 60 mH and 20 Ω (ms)?`,answer:3,tol:.01,unit:`ms`,explain:`0.06/20.`},{id:`e16`,type:`mcq`,prompt:`Switching off an inductive load with no freewheeling path causes…`,options:[`a large voltage spike across the switch`,`a current spike in the supply`,`nothing`,`the inductor to charge`],answer:0,explain:`v = L·di/dt.`},{id:`e17`,type:`numeric`,prompt:`Terminal voltage: E = 51.2 V, r = 20 mΩ, I = 60 A (V)?`,answer:50,tol:.01,unit:`V`,explain:`51.2 − 1.2.`},{id:`e18`,type:`numeric`,prompt:`Runtime: 4.8 kWh bank, 50 % DoD, 400 W load, η = 0.9 (h)?`,answer:5.4,tol:.01,unit:`h`,explain:`2400 × 0.9/400.`},{id:`e19`,type:`numeric`,prompt:`Minimum cable: 24 V, 100 A, 3 m route, 2 % drop (mm²)?`,answer:21.5,tol:.01,unit:`mm²`,explain:`0.0172 × 6 × 100/0.48 = 21.5 → 25 mm².`},{id:`e20`,type:`numeric`,prompt:`LED resistor: 12 V supply, V_f = 2.0 V, 10 mA (Ω)?`,answer:1e3,tol:.01,unit:`Ω`,explain:`10/0.01.`}]}};export{t as F2};