import type { AcademyModule } from '../types'
import { to } from '../s1/links'

/** S2.M1 Photovoltaic fundamentals. */
export const S2_M1: AcademyModule = {
  id: 'S2.M1',
  title: 'Photovoltaic fundamentals',
  summary: 'How solar cells convert light to electricity, how modules are built and specified, and how to calculate their voltage, current and power under real irradiance and temperature.',
  lessons: [
    {
      id: 'S2.M1.L1',
      title: 'Solar photovoltaic fundamentals',
      minutes: 40,
      content: {
        objectives: [
          'Explain the photovoltaic effect in a silicon p–n junction.',
          'Describe a PV cell with the single-diode model.',
          'Interpret I–V and P–V curves and identify V_oc, I_sc and the maximum power point.',
          'Explain why a PV module behaves as a current source over most of its curve.',
        ],
        introduction: `A solar cell converts light directly into electricity with no moving parts. Every design decision in this course — how many modules in a string, which controller, how big the cables — follows from the shape of one curve: the cell's current–voltage characteristic. This lesson explains where that curve comes from. The [[pv|PV]] I–V laboratory lets you explore it.`,
        lecture: `### The photovoltaic effect

A silicon solar cell is a large, thin [[diode]]:

- a thin **n-type** layer (doped to have free electrons) on top of a thicker **p-type** wafer (doped to have "holes");
- at the junction between them, an internal electric field forms.

When a photon with enough energy is absorbed, it frees an electron and leaves a hole. The junction field pushes electrons towards the n side and holes towards the p side. Connect an external circuit and this separated charge flows: a **light-generated current**, proportional to the light absorbed.

### The single-diode model

A cell behaves like:

- a **current source I_ph** proportional to [[irradiance]];
- in parallel with a **diode** (the junction itself), which takes some of that current as the voltage rises;
- with a small **series resistance R_s** (fingers, busbars, contacts).

**I = I_ph − I₀ · [e^((V + I·R_s)/a) − 1]**

where I₀ is the diode's saturation current and a = n·N_cells·kT/q depends on the number of cells in series and the temperature. The laboratory fits I₀, a and R_s to each module's datasheet.

### The I–V curve

- **Short-circuit current [[isc|I_sc]]** (V = 0): all the light current flows out. It is proportional to irradiance.
- **Open-circuit voltage [[voc|V_oc]]** (I = 0): all the light current flows through the internal diode. For one silicon cell it is about 0.6–0.7 V; a module adds cells in series.
- Between them, the curve is nearly flat (a **current source**) until the diode starts conducting near V_oc, where it falls steeply (a **voltage source**).

### The power curve and the maximum power point

Power P = V·I is zero at both ends of the curve and has a maximum at the **maximum power point (MPP)**: V_mp, I_mp, P_max. Typically:

- V_mp ≈ 0.8 × V_oc;
- I_mp ≈ 0.93 × I_sc for modern modules.

Operating anywhere else wastes power. Keeping the array at its MPP is the job of an [[mppt|MPPT]] controller (lesson S2.M2.L2).

### Why it matters for safety

A PV module is a current source whenever it is lit:

- it **cannot be switched off** at the module;
- short-circuiting it does not produce a huge current (only I_sc), so **fuses barely respond** to many PV faults;
- strings of modules produce hazardous DC voltages in daylight (F1.M2.L3).`,
        technical: `**Fill factor.** FF = P_max / (V_oc · I_sc) measures how "square" the curve is: about 0.75–0.82 for good crystalline modules. Series resistance and shunt leakage reduce it. For the example 400 W module (illustrative values V_oc 37.1 V, I_sc 13.8 A): FF = 400 / (37.1 × 13.8) = 0.781.

**Efficiency.** Module efficiency = P_max / (G × area). A 400 W module of 1.95 m² at 1000 W/m² is 400 / 1950 = 20.5 % efficient. Efficiency matters for roof area, not for the electrical design, which uses the module's ratings.

**Model limits.** The laboratory's single-diode model ignores shunt resistance and spectral effects. It reproduces the datasheet points and the trends with irradiance and temperature, which is what design teaching needs.`,
        diagrams: [
          { id: 'pv-cell', caption: 'The photovoltaic effect in a p–n junction, and the single-diode equivalent circuit.' },
          { id: 'iv-family', caption: 'I–V curves of the example module: current follows irradiance, voltage falls with temperature; dots mark the MPPs.' },
        ],
        formulas: [
          { name: 'Single-diode model', expr: 'I = I_ph − I₀ · [e^((V + I·R_s)/a) − 1]', where: [['I_ph', 'light-generated current (≈ I_sc)', 'A'], ['I₀', 'diode saturation current', 'A'], ['a', 'modified ideality factor n·N_cells·kT/q', 'V'], ['R_s', 'series resistance', 'Ω']] },
          { name: 'Fill factor', expr: 'FF = P_max / (V_oc · I_sc)', where: [] },
          { name: 'Module efficiency', expr: 'η = P_max / (G · A)', where: [['G', 'irradiance', 'W/m²'], ['A', 'module area', 'm²']] },
        ],
        examples: [
          {
            title: 'Fill factor and efficiency',
            problem: 'A module has V_oc = 49.6 V, I_sc = 14.0 A, P_max = 550 W and an area of 2.58 m² (illustrative values). Find its fill factor and efficiency.',
            steps: ['FF = 550 / (49.6 × 14.0) = 550 / 694.4 = 0.792', 'η = 550 / (1000 × 2.58) = 0.213 = 21.3 %'],
            answer: 'FF = 0.79; efficiency 21.3 %.',
          },
          {
            title: 'Where on the curve?',
            problem: 'A module (V_oc 37.1 V, V_mp 31.0 V, I_mp 12.9 A, I_sc 13.8 A) is connected straight across a 12.8 V battery. Roughly what current and power does it deliver?',
            steps: ['12.8 V is far below V_mp, on the flat (current-source) part of the curve, so I ≈ I_sc ≈ 13.5 A', 'P ≈ 12.8 × 13.5 ≈ 173 W, compared with P_max = 400 W'],
            answer: 'About 13.5 A and 173 W: less than half the module’s rating. This is why MPPT matters (S2.M2.L2).',
          },
        ],
        applications: `Every PV system design, MPPT algorithm, fault-finding measurement (V_oc and I_sc tests) and safety rule for PV work starts from this curve. The PV I–V laboratory traces it for any module, irradiance and temperature.`,
        mistakes: [
          { mistake: 'Treating a PV module like a battery (a voltage source).', correction: 'Over most of its curve it is a current source set by irradiance; its voltage depends on the load and temperature.' },
          { mistake: 'Assuming a short circuit on a PV string will blow a fuse.', correction: 'Short-circuit current is only about I_sc; protection must be designed for that.' },
          { mistake: 'Thinking a module can be switched off.', correction: 'It generates whenever lit; isolate with DC isolators and treat conductors as live.' },
        ],
        demo: {
          title: 'I–V and P–V curves',
          text: 'Change irradiance and cell temperature and watch V_oc, I_sc and the maximum power point move on the curves computed by the single-diode model.',
          link: to.solar('Solar laboratory: PV I–V tracer', 'iv'),
          embed: 'pv-iv',
        },
        activities: [to.solar('PV I–V laboratory', 'iv'), to.lib('Solar input', 'solar-input'), to.proc('PV open-circuit voltage test', 'solar-input', 'pv-voc')],
        check: [
          { id: 'k1', type: 'mcq', prompt: 'What separates the electron–hole pairs created by light in a solar cell?', options: ['The electric field at the p–n junction', 'The glass cover', 'The series resistance', 'The bypass diode'], answer: 0, explain: 'The junction field drives electrons and holes apart.' },
          { id: 'k2', type: 'mcq', prompt: 'I_sc of a module is proportional to…', options: ['irradiance', 'temperature only', 'the battery voltage', 'the cable length'], answer: 0, explain: 'The light current scales with irradiance.' },
          { id: 'k3', type: 'numeric', prompt: 'Fill factor of a module with V_oc 46 V, I_sc 9.3 A, P_max 330 W?', answer: 0.7714, tol: 0.01, unit: '', explain: '330/(46 × 9.3) = 0.771.' },
          { id: 'k4', type: 'mcq', prompt: 'On the flat part of the I–V curve a module behaves as…', options: ['a current source', 'a voltage source', 'a short circuit', 'an open circuit'], answer: 0, explain: 'Current is almost constant as voltage changes.' },
        ],
        summary: [
          'Light frees electron–hole pairs; the junction field separates them into a current.',
          'Single-diode model: current source in parallel with a diode, with series resistance.',
          'I_sc ∝ irradiance; V_oc ≈ 0.6–0.7 V per silicon cell.',
          'Power peaks at the MPP (V_mp ≈ 0.8 V_oc); operating elsewhere wastes power.',
          'PV is live whenever lit and limited to about I_sc in a fault.',
        ],
        homework: {
          id: 'S2.M1.L1.hw',
          title: 'Reading the curve',
          brief: 'Illustrative module: P_max 100 W, V_oc 22.0 V, I_sc 5.9 A, V_mp 18.0 V, I_mp 5.56 A, area 0.67 m².',
          tasks: [
            { id: 'h1', type: 'numeric', prompt: 'Fill factor?', answer: 0.7704, tol: 0.01, unit: '', explain: '100/(22 × 5.9) = 0.770.' },
            { id: 'h2', type: 'numeric', prompt: 'Efficiency (%)?', answer: 14.93, tol: 0.01, unit: '%', explain: '100/(1000 × 0.67) = 14.9 %.' },
            { id: 'h3', type: 'numeric', prompt: 'V_mp/V_oc ratio?', answer: 0.818, tol: 0.01, unit: '', explain: '18/22.' },
          ],
          written: [{ prompt: 'Explain, using the I–V curve, why a fault on a PV string may not blow a fuse, and what this means for safety.', model: 'A short circuit moves the operating point to I_sc, only slightly above normal operating current, so a fuse sized above normal current may never operate. PV faults can therefore persist and arc while the sun shines; designers rely on correct string protection, DC isolators, insulation monitoring and safe isolation rather than expecting fuses to clear every fault.' }],
        },
      },
    },
    {
      id: 'S2.M1.L2',
      title: 'Solar panel construction and specifications',
      minutes: 35,
      content: {
        objectives: [
          'Describe the construction of a crystalline-silicon PV module.',
          'Read a module datasheet: STC ratings, NOCT, temperature coefficients, tolerances and limits.',
          'Distinguish manufacturer values, typical values and simulated values.',
          'Identify the datasheet limits that constrain system design (maximum system voltage, maximum series fuse).',
        ],
        introduction: `A module datasheet is the starting point of every PV calculation. Reading it correctly — and knowing which numbers are guaranteed limits and which are typical — is a professional skill. This lesson takes a module apart, then reads its datasheet line by line. The modules in this programme's laboratory carry *illustrative* values, clearly labelled; a real design always uses the chosen product's datasheet.`,
        lecture: `### Construction

From front to back, a typical crystalline module has:

1. **tempered glass** (about 3.2 mm), anti-reflective coated;
2. an **encapsulant** layer (EVA or POE) bonding everything together;
3. the **cells**: 60/72 full cells or 108/120/144 half-cells, connected in series by ribbons or wires;
4. a second encapsulant layer;
5. a **backsheet** (polymer) or a second glass (glass–glass and bifacial modules);
6. an **aluminium frame** for strength and mounting, bonded to earth in many installations;
7. a **junction box** with the **[[bypass-diode|bypass diodes]]** (usually three) and two output cables with polarised DC connectors.

Half-cell modules cut each cell in two, halving the current in each half and reducing resistive losses; they are wired as two parallel halves.

### Standard Test Conditions

Ratings are measured at **[[stc|STC]]**: 1000 W/m², 25 °C cell temperature, air mass 1.5 spectrum. Real conditions are almost never STC: cells usually run much hotter.

### The electrical table (STC)

| Item | Meaning |
|---|---|
| P_max | Maximum power (W), with a power tolerance such as 0/+5 W |
| V_mp, I_mp | Voltage and current at maximum power |
| V_oc | Open-circuit voltage |
| I_sc | Short-circuit current |
| Module efficiency | P_max / (1000 W/m² × area) |

### Temperature behaviour

- **[[noct|NOCT]]** (or NMOT): the cell temperature in standard field-like conditions, typically about 42–46 °C.
- **[[temp-coefficient|Temperature coefficients]]**:
  - of P_max, γ (about −0.3 to −0.4 %/°C);
  - of V_oc, β (about −0.25 to −0.35 %/°C);
  - of I_sc, α (about +0.04 to +0.06 %/°C).

### Limits that constrain the design

- **Maximum system voltage** (for example 1000 V or 1500 V DC): the string's cold V_oc must never exceed it.
- **Maximum series fuse rating** (for example 25 A): the largest reverse current the module may carry; it decides whether [[string-fuse|string fuses]] are needed.
- **Operating temperature range**, mechanical load ratings, fire and safety class.

### Three kinds of value

- **Manufacturer (datasheet) values:** measured and guaranteed within stated tolerances for that product. These go into real designs.
- **Typical values:** representative of a class of products (as in "β is about −0.3 %/°C"). Useful for learning and first estimates, never for final design.
- **Simulated values:** produced by a model, such as the laboratory's I–V tracer. They show behaviour, not guaranteed performance.`,
        technical: `**NOCT and cell temperature.** A common estimate is T_cell = T_ambient + (NOCT − 20)/800 × G. For NOCT 45 °C at 35 °C ambient and 800 W/m²: T_cell = 35 + 25 = 60 °C. Mounting matters: modules flush on a roof run hotter than open-rack ones.

**Power tolerance and degradation.** A positive-only tolerance (0/+5 W) means no module is below its rating at delivery. Output then degrades slowly (often warranted to stay above a stated fraction after 25 years); designs may allow for it.

**Bifacial modules.** These also collect reflected light from the rear, so their effective output depends on the ground. Datasheets give a "bifaciality" factor and ratings at several rear-irradiance levels.`,
        diagrams: [{ id: 'pv-cell', caption: 'Cells in series behind glass; bypass diodes in the junction box protect groups of cells.' }],
        formulas: [
          { name: 'Cell temperature (NOCT method)', expr: 'T_cell = T_amb + (NOCT − 20) / 800 · G', where: [['NOCT', 'nominal operating cell temperature', '°C'], ['G', 'irradiance', 'W/m²']] },
          { name: 'Temperature correction', expr: 'X(T) = X_STC · [1 + c · (T_cell − 25)]', where: [['c', 'temperature coefficient of X', '%/°C ÷ 100']] },
        ],
        examples: [
          {
            title: 'Hot module power',
            problem: 'An illustrative 400 W module has γ = −0.35 %/°C and NOCT 45 °C. Estimate its P_max at 1000 W/m² with the cells at 60 °C.',
            steps: ['ΔT = 60 − 25 = 35 °C', 'P = 400 × (1 − 0.0035 × 35) = 400 × 0.8775 = 351 W'],
            answer: 'About 351 W: a 12 % loss from heat alone.',
          },
          {
            title: 'Cell temperature',
            problem: 'Find the cell temperature of a module with NOCT 44 °C on a 30 °C day at 900 W/m².',
            steps: ['T_cell = 30 + (44 − 20)/800 × 900', 'T_cell = 30 + 0.03 × 900 = 30 + 27 = 57 °C'],
            answer: '57 °C.',
          },
        ],
        applications: `Datasheet values feed every step of the S2.M3 sizing method and the S2.M5 commissioning tests. The laboratory lets you replace the illustrative module with values from a real datasheet.`,
        mistakes: [
          { mistake: 'Using STC power as the real output.', correction: 'Correct for temperature, irradiance, soiling and wiring losses.' },
          { mistake: 'Ignoring the maximum system voltage and maximum series fuse rating.', correction: 'They are hard limits that constrain string length and protection.' },
          { mistake: 'Treating typical or simulated values as datasheet values.', correction: 'Final designs use the manufacturer’s data for the chosen product.' },
        ],
        demo: {
          title: 'Enter a datasheet',
          text: 'On the solar laboratory’s Design tab, select an example module and then edit any field to enter a real datasheet; the I–V tracer and the sizing use your values.',
          link: to.solar('Solar laboratory: module datasheet fields', 'design'),
          embed: 'pv-iv',
        },
        activities: [to.solar('PV I–V laboratory', 'iv'), to.lib('Solar input', 'solar-input')],
        check: [
          { id: 'k1', type: 'mcq', prompt: 'STC means…', options: ['1000 W/m², 25 °C cell, AM1.5', '800 W/m², 20 °C ambient', 'the hottest summer day', 'the module’s maximum voltage'], answer: 0, explain: 'Standard Test Conditions.' },
          { id: 'k2', type: 'numeric', prompt: 'Cell temperature: NOCT 45 °C, ambient 25 °C, 1000 W/m² (°C)?', answer: 56.25, tol: 0.01, unit: '°C', explain: '25 + 25/800 × 1000 = 56.25 °C.' },
          { id: 'k3', type: 'numeric', prompt: 'P_max of a 550 W module (γ −0.35 %/°C) at 55 °C cell (W)?', answer: 492.25, tol: 0.01, unit: 'W', explain: '550 × (1 − 0.0035 × 30) = 492.25 W.' },
          { id: 'k4', type: 'mcq', prompt: 'Which datasheet value decides whether string fuses are needed?', options: ['Maximum series fuse rating', 'Module efficiency', 'Frame colour', 'NOCT'], answer: 0, explain: 'It is the largest reverse current the module may carry.' },
        ],
        summary: [
          'Glass, encapsulant, series-connected cells, backsheet, frame and junction box with bypass diodes.',
          'Ratings at STC; real cells run hotter (NOCT method).',
          'Temperature coefficients: P_max and V_oc fall, I_sc rises slightly.',
          'Maximum system voltage and maximum series fuse are design limits.',
          'Manufacturer, typical and simulated values are different things.',
        ],
        homework: {
          id: 'S2.M1.L2.hw',
          title: 'Datasheet reading',
          brief: 'Illustrative module: P_max 330 W, V_oc 46.0 V, I_sc 9.3 A, γ −0.39 %/°C, β −0.31 %/°C, α +0.05 %/°C, NOCT 45 °C.',
          tasks: [
            { id: 'h1', type: 'numeric', prompt: 'Cell temperature at 32 °C ambient, 800 W/m² (°C)?', answer: 57, tol: 0.01, unit: '°C', explain: '32 + 25 = 57 °C.' },
            { id: 'h2', type: 'numeric', prompt: 'P_max at that cell temperature and 1000 W/m² (W)?', answer: 288.8, tol: 0.01, unit: 'W', explain: '330 × (1 − 0.0039 × 32) = 330 × 0.8752 = 288.8 W.' },
            { id: 'h3', type: 'numeric', prompt: 'V_oc at 57 °C (V)?', answer: 41.44, tol: 0.01, unit: 'V', explain: '46 × (1 − 0.0031 × 32) = 46 × 0.9008 = 41.44 V.' },
          ],
          written: [{ prompt: 'Explain the difference between a datasheet value, a typical value and a simulated value, with an example of each from this lesson.', model: 'Datasheet: the chosen product’s measured, guaranteed ratings (e.g. this module’s V_oc 46.0 V at STC within tolerance). Typical: representative of a class (β about −0.3 %/°C for crystalline silicon). Simulated: model output (the I–V tracer’s curve at 600 W/m²). Only datasheet values are used for a final design.' }],
        },
      },
    },
    {
      id: 'S2.M1.L3',
      title: 'PV voltage, current and power calculations',
      minutes: 40,
      content: {
        objectives: [
          'Calculate V_oc, I_sc and P_max at any irradiance and cell temperature.',
          'Calculate the coldest-morning V_oc and hottest-day V_mp of a string.',
          'Calculate daily energy from peak sun hours with derating factors.',
          'Verify predictions with the laboratory’s I–V tracer.',
        ],
        introduction: `System design needs three predictions: the **highest voltage** the array can ever produce (a cold, bright morning), the **lowest working voltage** (a hot afternoon), and the **energy** it delivers each day. This lesson turns the datasheet into those numbers. The laboratory's measurement task asks you to make the same predictions and checks them against the model.`,
        lecture: `### Current with irradiance and temperature

**I_sc(G, T) = I_sc,STC · (G / 1000) · [1 + α(T − 25)]**

Current is directly proportional to irradiance and rises slightly with temperature.

### Voltage with temperature

**V_oc(T) = V_oc,STC · [1 + β(T − 25)]**

β is negative, so voltage **rises in the cold**. The highest voltage occurs on the coldest morning, when the cells are at about the ambient temperature and the sun is already bright enough to bring them close to V_oc.

V_oc also falls slightly at low irradiance, logarithmically: by a·ln(G/1000), where a is the module's diode parameter (lesson L1). This is a small effect: the laboratory's task gives you a.

### Voltage at the maximum power point

V_mp falls with temperature at about the same rate as V_oc:

**V_mp,hot ≈ V_mp,STC · [1 + β(T_cell,hot − 25)]**

On a hot day the string's working voltage is lowest. It must remain above the minimum operating voltage of the MPPT controller or inverter.

### Power

**P(G, T) ≈ P_max,STC · (G / 1000) · [1 + γ(T − 25)]**

At low irradiance a small correction for the lower voltage improves the estimate (multiply by V_oc(G)/V_oc(1000)).

### Strings

For n modules in series:

- V_string = n × V_module;
- I_string = I_module;
- P_string = n × P_module.

Parallel strings add current (lesson S2.M2.L1).

### Energy per day

[[psh|Peak sun hours]] (PSH) express a day's solar energy as hours at 1000 W/m². An array of P_STC watts produces approximately:

**E_day = P_STC × PSH × k**

where k combines the losses:

- temperature: 1 + γ(T_cell − 25);
- soiling (typical 0.95–0.98);
- DC wiring (typical 0.97–0.99);
- module mismatch (typical 0.98).

Inverter or controller efficiency is applied after that.`,
        technical: `**Why not use NOCT power?** Datasheets often quote power at NOCT (800 W/m², ≈ 45 °C), which is closer to real conditions than STC. The sizing method in this course works from STC with explicit corrections, so each loss is visible and can be changed.

**Design temperatures.** The coldest expected ambient and hottest design ambient come from climate data for the site. Standards specify how they are chosen (for example the record or a statistical low). Using a too-mild cold temperature underestimates V_oc and is a common cause of damaged controllers.

**Checking with the tracer.** The I–V tracer solves the single-diode model directly; your linear estimates should agree to within a few per cent. Differences show the effect of the model's curvature at low irradiance.`,
        diagrams: [{ id: 'iv-family', caption: 'The same module at 1000 W/m² and 600 W/m² (25 °C) and at 65 °C: current scales with light, voltage falls with heat.' }],
        formulas: [
          { name: 'Short-circuit current', expr: 'I_sc(G,T) = I_sc,STC · (G/1000) · [1 + α(T − 25)]', where: [] },
          { name: 'Open-circuit voltage', expr: 'V_oc(T) = V_oc,STC · [1 + β(T − 25)]  (+ a·ln(G/1000) at low light)', where: [] },
          { name: 'Power', expr: 'P ≈ P_STC · (G/1000) · [1 + γ(T − 25)]', where: [] },
          { name: 'Daily energy', expr: 'E_day = P_STC × PSH × k', where: [['PSH', 'peak sun hours', 'h'], ['k', 'combined derating factor', '—']] },
        ],
        examples: [
          {
            title: 'Coldest-morning string voltage',
            problem: 'A string of 4 illustrative 400 W modules (V_oc 37.1 V, β −0.27 %/°C) is installed where the coldest morning is −5 °C. What is the highest string voltage?',
            steps: ['V_oc,module = 37.1 × [1 − 0.0027 × (−5 − 25)] = 37.1 × 1.081 = 40.11 V', 'V_oc,string = 4 × 40.11 = 160.4 V'],
            answer: '160.4 V: too high for a 150 V controller. Three modules in series (120.3 V) would fit.',
          },
          {
            title: 'Daily energy',
            problem: 'A 1.6 kW array (γ −0.35 %/°C) runs with cells at 60 °C; site PSH = 4.5; soiling 0.95, wiring 0.97, mismatch 0.98. Estimate its daily DC energy.',
            steps: ['Temperature factor = 1 − 0.0035 × 35 = 0.8775', 'k = 0.8775 × 0.95 × 0.97 × 0.98 = 0.7925', 'E = 1600 × 4.5 × 0.7925 = 5706 Wh'],
            answer: 'About 5.7 kWh per day before controller and battery losses.',
          },
        ],
        applications: `String design (S2.M2.L1), array sizing (S2.M3.L2), controller selection (S2.M2.L2) and commissioning measurements (S2.M5.L1) all use these formulas. The laboratory's Design tab shows each of them with your numbers.`,
        mistakes: [
          { mistake: 'Using V_oc at 25 °C to check the controller’s voltage limit.', correction: 'Use the coldest expected temperature; voltage rises in the cold.' },
          { mistake: 'Applying the temperature coefficient to the ambient instead of the cell temperature.', correction: 'Estimate the cell temperature first (NOCT method).' },
          { mistake: 'Multiplying PSH by the nameplate power with no derating.', correction: 'Apply temperature, soiling, wiring and mismatch factors.' },
        ],
        demo: {
          title: 'Predict, then check',
          text: 'In the I–V laboratory’s measurement task, predict a string’s V_oc, I_sc and P_mp for the given conditions, then check them against the tracer.',
          link: to.solar('Solar laboratory: measurement task', 'iv'),
          embed: 'array-config',
        },
        activities: [to.solar('PV I–V laboratory: measurement task', 'iv'), to.build('Build project G: solar inverter (MPPT stage)', 'bld-g')],
        check: [
          { id: 'k1', type: 'numeric', prompt: 'I_sc of a 13.8 A module at 700 W/m², 25 °C (A)?', answer: 9.66, tol: 0.01, unit: 'A', explain: '13.8 × 0.7.' },
          { id: 'k2', type: 'numeric', prompt: 'V_oc of a 49.6 V module (β −0.27 %/°C) at 0 °C (V)?', answer: 52.95, tol: 0.01, unit: 'V', explain: '49.6 × (1 + 0.0027 × 25) = 52.95 V.' },
          { id: 'k3', type: 'numeric', prompt: 'Daily energy: 2 kW array, PSH 5, k = 0.8 (kWh)?', answer: 8, tol: 0.01, unit: 'kWh', explain: '2 × 5 × 0.8.' },
          { id: 'k4', type: 'mcq', prompt: 'The highest string voltage occurs…', options: ['on a cold, bright morning', 'at noon in summer', 'at night', 'when the battery is full'], answer: 0, explain: 'Cold cells and full light give the highest V_oc.' },
        ],
        summary: [
          'I_sc ∝ G, with a small positive temperature coefficient.',
          'V_oc and V_mp fall with temperature (β < 0): highest when cold.',
          'P ≈ P_STC·(G/1000)·[1 + γ(T − 25)].',
          'Strings: series multiplies voltage; parallel multiplies current.',
          'E_day = P_STC × PSH × k, with k for temperature, soiling, wiring, mismatch.',
        ],
        homework: {
          id: 'S2.M1.L3.hw',
          title: 'PV calculations',
          brief: 'Illustrative 550 W module: V_oc 49.6 V, V_mp 41.7 V, I_sc 14.0 A, β −0.27 %/°C, γ −0.35 %/°C, NOCT 45 °C. Site: coldest 2 °C, hottest 38 °C, PSH 5.2.',
          tasks: [
            { id: 'h1', type: 'numeric', prompt: 'Module V_oc on the coldest morning (V)?', answer: 52.68, tol: 0.01, unit: 'V', explain: '49.6 × (1 + 0.0027 × 23) = 49.6 × 1.0621 = 52.68 V.' },
            { id: 'h2', type: 'numeric', prompt: 'Maximum modules in series under a 250 V controller limit?', answer: 4, tol: 0.001, unit: '', explain: '250/52.68 = 4.75 → 4.' },
            { id: 'h3', type: 'numeric', prompt: 'Hot cell temperature at 800 W/m² (°C)?', answer: 63, tol: 0.01, unit: '°C', explain: '38 + 25 = 63 °C.' },
            { id: 'h4', type: 'numeric', prompt: 'Module V_mp at that cell temperature (V)?', answer: 37.42, tol: 0.01, unit: 'V', explain: '41.7 × (1 − 0.0027 × 38) = 41.7 × 0.8974 = 37.42 V.' },
          ],
          written: [{ prompt: 'A 48 V battery charges at up to 57.6 V and the MPPT controller needs the PV voltage at least 5 V above the battery. Is a string of 2 of these modules enough on the hottest day? Show your reasoning.', model: 'Required: 57.6 + 5 = 62.6 V. Two modules at 63 °C give 2 × 37.42 = 74.8 V > 62.6 V, so yes; one module (37.4 V) would not be. Combined with h2, 2–4 modules in series are valid for this site and controller.' }],
        },
      },
    },
  ],
  quiz: {
    pass: 0.7,
    questions: [
      { id: 'q1', type: 'mcq', prompt: 'The light-generated current of a cell is proportional to…', options: ['irradiance', 'the battery voltage', 'the cable size', 'the inverter rating'], answer: 0, explain: 'More photons, more current.' },
      { id: 'q2', type: 'numeric', prompt: 'Fill factor: V_oc 40 V, I_sc 10 A, P_max 312 W?', answer: 0.78, tol: 0.01, unit: '', explain: '312/400.' },
      { id: 'q3', type: 'numeric', prompt: 'Cell temperature: NOCT 46 °C, ambient 28 °C, 800 W/m² (°C)?', answer: 54, tol: 0.01, unit: '°C', explain: '28 + 26.' },
      { id: 'q4', type: 'numeric', prompt: 'V_oc of a 37.1 V module (β −0.27 %/°C) at −10 °C (V)?', answer: 40.61, tol: 0.01, unit: 'V', explain: '37.1 × 1.0945 = 40.61 V.' },
      { id: 'q5', type: 'numeric', prompt: 'P of a 400 W module (γ −0.35 %/°C) at 800 W/m² and 50 °C (W)?', answer: 292, tol: 0.01, unit: 'W', explain: '400 × 0.8 × (1 − 0.0875) = 292 W.' },
      { id: 'q6', type: 'mcq', prompt: 'Which datasheet limit constrains the number of modules in series?', options: ['Maximum system voltage', 'Maximum series fuse', 'NOCT', 'Efficiency'], answer: 0, explain: 'Cold string V_oc must stay below it.' },
      { id: 'q7', type: 'numeric', prompt: 'Daily energy: 3 kW array, PSH 4, k = 0.78 (kWh)?', answer: 9.36, tol: 0.01, unit: 'kWh', explain: '3 × 4 × 0.78.' },
      { id: 'q8', type: 'mcq', prompt: 'Bypass diodes are found…', options: ['in the module junction box', 'in the inverter output', 'in the battery', 'in the combiner fuse'], answer: 0, explain: 'Usually three per module.' },
    ],
  },
  assignment: {
    id: 'S2.M1.asg',
    title: 'Module assignment: characterising an array',
    brief: 'Six illustrative 400 W modules (V_oc 37.1 V, V_mp 31.0 V, I_sc 13.8 A, β −0.27 %/°C, α +0.048 %/°C, γ −0.35 %/°C, NOCT 45 °C) in two strings of three. Site: coldest −2 °C, hottest 36 °C, PSH 4.8; soiling 0.95, wiring 0.97, mismatch 0.98.',
    tasks: [
      { id: 'a1', type: 'numeric', prompt: 'String V_oc on the coldest morning (V)?', answer: 119.4, tol: 0.01, unit: 'V', explain: '3 × 37.1 × (1 + 0.0027 × 27) = 3 × 39.80 = 119.4 V.' },
      { id: 'a2', type: 'numeric', prompt: 'Hot cell temperature at 800 W/m² (°C)?', answer: 61, tol: 0.01, unit: '°C', explain: '36 + 25.' },
      { id: 'a3', type: 'numeric', prompt: 'String V_mp when hot (V)?', answer: 83.96, tol: 0.01, unit: 'V', explain: '3 × 31.0 × (1 − 0.0027 × 36) = 3 × 27.99 = 83.96 V.' },
      { id: 'a4', type: 'numeric', prompt: 'Array I_sc at STC (A)?', answer: 27.6, tol: 0.01, unit: 'A', explain: '2 × 13.8.' },
      { id: 'a5', type: 'numeric', prompt: 'Daily DC energy (kWh)?', answer: 9.093, tol: 0.02, unit: 'kWh', explain: 'k = (1 − 0.0035 × 36) × 0.95 × 0.97 × 0.98 = 0.874 × 0.9031 = 0.7893; E = 2400 × 4.8 × 0.7893 = 9093 Wh.' },
    ],
    written: [{ prompt: 'Which controller voltage class (100, 150 or 250 V) would you choose, and why?', model: 'The cold string V_oc is 119.4 V, above 100 V, so a 150 V controller is the smallest suitable class, leaving about 25 % headroom; 250 V would also work but is unnecessary unless the strings may be lengthened.' }],
  },
  practicals: [
    {
      id: 'S2.M1.P1',
      title: 'PV I–V laboratory: predict and verify a string',
      description: 'Complete the I–V laboratory’s measurement task: predict a string’s V_oc, I_sc and P_mp for given conditions within tolerance.',
      link: to.solar('PV I–V laboratory', 'iv'),
      evidence: { kind: 'activity', id: 'solar:iv' },
    },
  ],
}
