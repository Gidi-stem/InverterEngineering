import type { AcademyModule } from '../types'
import { to } from '../s1/links'

/** S2.M2 Arrays, controllers and conversion. */
export const S2_M2: AcademyModule = {
  id: 'S2.M2',
  title: 'Arrays, controllers and conversion',
  summary: 'How modules are combined into strings and arrays, what shading and mismatch do, how MPPT and PWM charge controllers work, and how off-grid, grid-tied and hybrid inverters are built.',
  lessons: [
    {
      id: 'S2.M2.L1',
      title: 'Series and parallel panel configurations',
      minutes: 40,
      content: {
        objectives: [
          'Configure modules in series strings and parallel strings for a required voltage and current.',
          'Determine the allowed string length from the cold V_oc and hot V_mp limits.',
          'Explain mismatch, partial shading and the action of bypass diodes.',
          'Decide when string fuses are needed and size them.',
        ],
        introduction: `A single module rarely matches what a controller or inverter needs. Modules are therefore connected in series into [[pv-string|strings]] to raise the voltage, and strings in parallel to raise the current. The configuration must keep the voltage inside a window set by temperature and the equipment, and it must protect every string from faults fed by the others.`,
        lecture: `### Series strings

Modules in series carry the same current; their voltages add:

- V_string = n × V_module;
- I_string = I_module.

### Parallel strings

Strings in parallel share the same voltage; their currents add:

- I_array = N_strings × I_string.

Parallel strings must be **identical**: the same number and type of modules, the same orientation. A string with one module fewer has a lower voltage and drags the others away from their maximum power point.

### The voltage window

The string length n must satisfy two limits:

1. **Upper limit (cold):** n × V_oc,cold ≤ the maximum input voltage of the controller or inverter, and ≤ the module's maximum system voltage. Exceeding it on a cold morning can destroy the equipment instantly.
2. **Lower limit (hot):** n × V_mp,hot ≥ the minimum working voltage. For an MPPT battery charger this is the battery's charging voltage plus a headroom (often about 5 V; see the controller's data). For a grid inverter it is the bottom of its MPPT voltage range.

Any n between the two limits is valid. The laboratory chooses the n that uses the fewest modules for the required power.

### Mismatch and shading

In a string the same current must flow through every module. If one module produces less current (dirt, shade, a fault):

- without protection, the weak module would be driven into reverse voltage and could overheat (a hot spot);
- **[[bypass-diode|bypass diodes]]** across each third of the module start conducting, so the string current passes around the shaded cells;
- the string loses that section's voltage, and its P–V curve gains a second, local peak. A simple MPPT can settle on the wrong peak (lesson L2).

Avoid mixing shaded and unshaded modules in one string; use separate strings (or MPPT inputs) for different orientations.

### Reverse current and string fuses

If one string develops a short circuit, all the other parallel strings drive current backwards into it: up to (N − 1) × I_sc. With **two** strings this is one string's current, which modules are designed to withstand. With three or more strings it can exceed the module's **maximum series fuse rating**. Then each string needs a [[string-fuse|string fuse]], typically rated:

**1.56 × I_sc ≤ I_n ≤ maximum series fuse rating**

(1.56 = 1.25 × 1.25, for high irradiance and continuous operation; standards differ slightly — some use 1.5 × I_sc — so follow the applicable one.)

### Combiner and isolation

Parallel strings meet in a [[combiner|combiner box]] containing the string fuses (on both poles where required), often surge protection, and a lockable **DC isolator** rated for the cold V_oc and 1.25 × the array's I_sc.`,
        technical: `**Why 1.25 twice?** One factor of 1.25 allows for irradiance above 1000 W/m² (cloud-edge effects and reflection can briefly raise it); the second for the conductor and fuse running continuously near rating. Cable and fuse ratings for PV circuits therefore start from 1.25 × I_sc and 1.56 × I_sc respectively.

**Multiple MPPT inputs.** Many inverters have two or more independent MPPT inputs. Strings with different orientations or lengths go on separate inputs so that each is held at its own MPP.

**Module-level electronics.** Optimisers and microinverters give each module its own MPPT, which reduces shading losses and allows module-level shutdown, at higher cost and with more components on the roof.`,
        diagrams: [{ id: 'string-config', caption: 'Two strings of three modules with bypass diodes and string fuses, joined in a combiner with a DC isolator.' }],
        formulas: [
          { name: 'String length window', expr: '⌈V_min / V_mp,hot⌉ ≤ n ≤ ⌊V_max / V_oc,cold⌋', where: [['V_min', 'minimum working voltage of the controller/inverter', 'V'], ['V_max', 'lower of equipment and module maximum voltage', 'V']] },
          { name: 'Reverse current into a faulty string', expr: 'I_rev = (N − 1) × 1.25 × I_sc', where: [['N', 'number of parallel strings', '—']] },
          { name: 'String fuse window', expr: '1.56 × I_sc ≤ I_n ≤ I_max,series fuse', where: [] },
        ],
        examples: [
          {
            title: 'String window',
            problem: 'Illustrative 400 W modules: V_oc,cold = 38.40 V, V_mp,hot = 28.07 V. MPPT controller limit 150 V; battery charging at 26.6 V with 5 V headroom. Find the allowed string lengths.',
            steps: ['n_max = ⌊150 / 38.40⌋ = ⌊3.91⌋ = 3', 'n_min = ⌈(26.6 + 5) / 28.07⌉ = ⌈1.13⌉ = 2', 'Allowed: 2 or 3 in series'],
            answer: 'Two or three modules per string.',
          },
          {
            title: 'Are string fuses needed?',
            problem: 'Three parallel strings of modules with I_sc = 13.8 A and a maximum series fuse rating of 25 A. Are fuses needed, and what rating (sizes 20, 25, 32 A)?',
            steps: ['I_rev = (3 − 1) × 1.25 × 13.8 = 34.5 A > 25 A → fuses needed', 'I_n ≥ 1.56 × 13.8 = 21.5 A and ≤ 25 A → 25 A'],
            answer: 'Yes: a 25 A DC-rated fuse in each string.',
          },
        ],
        applications: `Every PV array design. The laboratory's Design tab computes the window, chooses the configuration and decides on string fuses; its troubleshooting tab includes a shaded module, an open string and a reversed string.`,
        mistakes: [
          { mistake: 'Checking string voltage at 25 °C only.', correction: 'Check cold V_oc against the maximum and hot V_mp against the minimum.' },
          { mistake: 'Paralleling strings of different lengths or orientations on one MPPT input.', correction: 'Keep parallel strings identical; use separate MPPT inputs otherwise.' },
          { mistake: 'Omitting string fuses with three or more parallel strings.', correction: 'Check reverse current against the module’s maximum series fuse rating.' },
        ],
        demo: {
          title: 'Array configuration',
          text: 'Change modules in series, parallel strings and the coldest temperature; watch the cold string V_oc against the controller limit and the array current.',
          link: to.solar('Solar laboratory: system design', 'design'),
          embed: 'array-config',
        },
        activities: [to.solar('PV I–V laboratory: shade one module', 'iv'), to.solar('Troubleshooting: shading and open strings', 'faults')],
        check: [
          { id: 'k1', type: 'numeric', prompt: 'Max modules in series: limit 250 V, V_oc,cold 52.7 V?', answer: 4, tol: 0.001, unit: '', explain: '250/52.7 = 4.74 → 4.' },
          { id: 'k2', type: 'numeric', prompt: 'Reverse current into a faulty string with 4 strings of I_sc 9.3 A (A)?', answer: 34.88, tol: 0.01, unit: 'A', explain: '3 × 1.25 × 9.3 = 34.9 A.' },
          { id: 'k3', type: 'mcq', prompt: 'A shaded module’s bypass diode conducts. The string…', options: ['loses about that section’s voltage and its P–V curve gains a second peak', 'stops completely', 'doubles its current', 'is unaffected'], answer: 0, explain: 'Current bypasses the shaded cells.' },
          { id: 'k4', type: 'mcq', prompt: 'With two parallel strings, string fuses are usually…', options: ['not required, because one string’s reverse current is within the module rating', 'always required', 'replaced by RCDs', 'only on the negative'], answer: 0, explain: '(2 − 1) × 1.25 × I_sc is normally below the maximum series fuse.' },
        ],
        summary: [
          'Series adds voltage; parallel strings add current; parallel strings must match.',
          'String length window: cold V_oc below the maximum, hot V_mp above the minimum.',
          'Shading makes bypass diodes conduct and creates multiple power peaks.',
          'Three or more strings may need string fuses: 1.56·I_sc ≤ I_n ≤ max series fuse.',
          'Combiner: fuses, surge protection, lockable DC isolator.',
        ],
        homework: {
          id: 'S2.M2.L1.hw',
          title: 'String design',
          brief: 'Illustrative 550 W modules: V_oc 49.6 V, V_mp 41.7 V, I_sc 14.0 A, β −0.27 %/°C, max series fuse 25 A. Coldest 2 °C; hot cell 63 °C. Grid inverter: 600 V maximum, MPPT range from 120 V.',
          tasks: [
            { id: 'h1', type: 'numeric', prompt: 'Maximum modules in series?', answer: 11, tol: 0.001, unit: '', explain: 'V_oc,cold = 52.68 V; 600/52.68 = 11.4 → 11.' },
            { id: 'h2', type: 'numeric', prompt: 'Minimum modules in series?', answer: 4, tol: 0.001, unit: '', explain: 'V_mp,hot = 37.42 V; 120/37.42 = 3.2 → 4.' },
            { id: 'h3', type: 'mcq', prompt: 'Three parallel strings: are string fuses needed?', options: ['Yes: 2 × 1.25 × 14 = 35 A > 25 A', 'No'], answer: 0, explain: 'Reverse current exceeds the module rating.' },
          ],
          written: [{ prompt: 'Why should modules facing east and west not be in the same string?', model: 'They receive different irradiance at different times, so their currents differ; in one string the weaker modules limit the current or are bypassed, losing energy. East and west strings should be on separate MPPT inputs (or the same MPPT only as separate, identical parallel strings with care).' }],
        },
      },
    },
    {
      id: 'S2.M2.L2',
      title: 'MPPT and PWM charge controllers',
      minutes: 40,
      content: {
        objectives: [
          'Explain how a PWM charge controller operates and why it fixes the array at battery voltage.',
          'Explain MPPT as a DC-DC converter and describe the perturb-and-observe algorithm.',
          'Compare the energy harvested by PWM and MPPT for a given array and battery.',
          'Describe the bulk, absorption and float charging stages and where their set-points come from.',
        ],
        introduction: `The [[charge-controller|charge controller]] sits between the PV array and the battery. It must harvest as much energy as possible and charge the battery correctly without overcharging it. Two types dominate: simple **PWM** controllers and **MPPT** controllers. The difference between them is visible directly on the P–V curve.`,
        lecture: `### PWM controllers

A PWM controller is essentially a switch between the array and the battery:

- While charging, the switch is on and the array is connected **directly to the battery**. The array therefore operates at **battery voltage** (plus small drops), wherever that falls on its curve.
- Near full charge, the switch is pulsed (pulse-width modulated) to hold the battery at its absorption or float voltage.

This works well when the module's V_mp is a little above battery voltage: one 36-cell "12 V" module (V_mp ≈ 18 V) per 12 V of battery. With larger modules (60/72-cell or half-cell, V_mp 30–42 V) most of the power is wasted.

### MPPT controllers

An MPPT controller is a **DC-DC buck converter**:

- It holds the array at its maximum power point voltage V_mp, which can be much higher than the battery.
- It converts that power down to battery voltage at a higher current: P_out = η × P_mp, so I_battery = η × P_mp / V_battery.
- It allows long, high-voltage strings, reducing PV cable current and losses.

Typical efficiencies are 95–98 %.

### Perturb and observe

The [[perturb-observe|perturb-and-observe]] algorithm:

1. measure power at the present operating voltage;
2. change the voltage a little (perturb);
3. if power rose, keep going the same way; if it fell, reverse.

It climbs the P–V curve and oscillates around the peak. On a shaded, multi-peak curve it can stop on a **local** peak; better controllers periodically **sweep** the whole curve to find the global maximum.

### Charging stages

Lead-acid and many lithium batteries are charged in stages:

- **Bulk:** maximum available current until the voltage reaches the absorption set-point.
- **Absorption:** voltage held constant while the current tapers.
- **Float:** a lower voltage that keeps a full lead-acid battery topped up. LiFePO₄ batteries often need no float, or a low one.

The set-points — absorption and float voltages, current limits, temperature compensation — come from the **battery manufacturer's datasheet**. With lithium batteries, the battery management system may also command the charger.

### Sizing a controller

- **Voltage:** maximum PV input ≥ the array's cold V_oc (the most important check).
- **Current:** MPPT output rating ≥ P_array × η / V_battery; PWM rating ≥ 1.25 × I_sc,array.`,
        technical: `**Why buck, not boost?** Most MPPT battery chargers are buck converters, so the array voltage must stay above the battery voltage by a margin under all conditions: hence the hot V_mp minimum in lesson L1. Grid inverters typically use a boost stage instead, so their MPPT range can start lower.

**PWM harvest example.** The laboratory's model of the illustrative 400 W module at 1000 W/m² and 45 °C gives about 370 W at its MPP but only about 175 W at 13.2 V: PWM would harvest less than half. For a matched 36-cell 100 W module the PWM harvest is about 75–85 % of the MPP power.

**Controller self-protection.** Exceeding the maximum PV voltage is usually not survivable: the input semiconductors break down before any protection can act. That is why cold V_oc is a hard design limit.`,
        diagrams: [
          { id: 'mppt-pwm', caption: 'On the P–V curve: MPPT holds the array at its peak; PWM fixes it at battery voltage.' },
          { id: 'charge-stages', caption: 'Bulk (constant current), absorption (constant voltage) and float stages.' },
        ],
        formulas: [
          { name: 'MPPT output current', expr: 'I_bat = η · P_mp / V_bat', where: [['η', 'controller efficiency', '—']] },
          { name: 'PWM operating power', expr: 'P_PWM = V_bat · I(V_bat + V_drop)', where: [['I(V)', 'array current at that voltage, from its I–V curve', 'A']] },
          { name: 'Controller current rating', expr: 'MPPT: I ≥ P_array · η / V_sys;  PWM: I ≥ 1.25 · I_sc,array', where: [] },
        ],
        examples: [
          {
            title: 'MPPT output current',
            problem: 'A 1.6 kW array at its MPP charges a 24 V battery at 26.4 V through an MPPT controller with η = 0.97. Find the charging current.',
            steps: ['P_out = 0.97 × 1600 = 1552 W', 'I = 1552 / 26.4 = 58.8 A'],
            answer: '58.8 A: a 60 A or 70 A controller.',
          },
          {
            title: 'PWM versus MPPT',
            problem: 'A module delivers 370 W at its MPP but 13.2 A at 13.2 V. Compare the power to a 12 V battery with PWM and with MPPT (η = 0.97).',
            steps: ['PWM: P = 13.2 × 13.2 = 174 W', 'MPPT: P = 0.97 × 370 = 359 W', 'MPPT harvests 359 / 174 = 2.06 times as much'],
            answer: 'About twice the energy with MPPT for this module.',
          },
        ],
        applications: `Off-grid and hybrid systems (S2.M4), the MPPT stage of build project G, and the PWM-mismatch troubleshooting scenario all use these principles. Course P5 develops battery charging in depth.`,
        mistakes: [
          { mistake: 'Using large 60/72-cell modules with a PWM controller.', correction: 'PWM fixes the array at battery voltage; use MPPT, or modules matched to the battery.' },
          { mistake: 'Sizing an MPPT controller by array I_sc.', correction: 'Its output current is P × η / V_battery; its input voltage limit is checked against cold V_oc.' },
          { mistake: 'Using generic charging voltages.', correction: 'Take set-points from the battery datasheet (and the BMS for lithium).' },
        ],
        demo: {
          title: 'MPPT tracking and PWM',
          text: 'Shade one module and watch the perturb-and-observe tracker settle on a local peak; set a battery voltage to see where a PWM controller would operate.',
          link: to.solar('Solar laboratory: PV I–V tracer with PWM', 'iv'),
          embed: 'mppt-track',
        },
        activities: [to.build('Build project G: solar inverter with MPPT', 'bld-g'), to.solar('Troubleshooting: PWM mismatch', 'faults')],
        check: [
          { id: 'k1', type: 'numeric', prompt: 'MPPT current: 2.2 kW array, η 0.97, battery 28.8 V (A)?', answer: 74.1, tol: 0.01, unit: 'A', explain: '2134/28.8 = 74.1 A.' },
          { id: 'k2', type: 'mcq', prompt: 'With a PWM controller the array operates at…', options: ['battery voltage', 'its MPP voltage', 'its V_oc', 'zero volts'], answer: 0, explain: 'It is switched directly onto the battery.' },
          { id: 'k3', type: 'mcq', prompt: 'Perturb and observe reverses direction when…', options: ['power falls after a step', 'power rises', 'the battery is full', 'current is zero'], answer: 0, explain: 'It climbs the power hill.' },
          { id: 'k4', type: 'mcq', prompt: 'Absorption and float voltages come from…', options: ['the battery manufacturer’s datasheet', 'the module datasheet', 'a fixed universal value', 'the inverter’s nameplate'], answer: 0, explain: 'They depend on the battery chemistry and product.' },
        ],
        summary: [
          'PWM: array at battery voltage; suits matched 36-cell-per-12 V modules.',
          'MPPT: DC-DC converter at the array’s MPP; I_bat = η·P/V_bat.',
          'P&O climbs the P–V curve; sweeps find the global peak under shading.',
          'Bulk, absorption, float: set-points from the battery datasheet.',
          'Check the controller’s PV voltage limit against cold V_oc first.',
        ],
        homework: {
          id: 'S2.M2.L2.hw',
          title: 'Controller selection',
          brief: 'Array: 2 strings × 3 illustrative 400 W modules (cold V_oc 119.4 V), 48 V battery charging at 54 V; controller classes 100/150/250 V and 30/40/50/60 A.',
          tasks: [
            { id: 'h1', type: 'numeric', prompt: 'MPPT output current at full array power, η 0.97 (A)?', answer: 43.1, tol: 0.01, unit: 'A', explain: '2400 × 0.97 / 54 = 43.1 A.' },
            { id: 'h2', type: 'mcq', prompt: 'Controller choice?', options: ['150 V, 50 A', '100 V, 40 A', '250 V, 30 A', '150 V, 30 A'], answer: 0, explain: '119.4 V > 100 V → 150 V; 43.1 A → 50 A.' },
          ],
          written: [{ prompt: 'Explain why an MPPT controller allows thinner PV cables than PWM for the same power.', model: 'MPPT can accept a much higher string voltage, so the same power flows at lower current; cable losses (I²R) and voltage drop fall with the square and first power of current respectively, so a smaller cross-section meets the drop limit.' }],
        },
      },
    },
    {
      id: 'S2.M2.L3',
      title: 'Solar inverter architecture',
      minutes: 35,
      content: {
        objectives: [
          'Describe the power stages of off-grid, grid-tied and hybrid solar inverters.',
          'Explain anti-islanding and why grid-tied inverters cannot provide back-up on their own.',
          'Compare string inverters, microinverters and optimisers.',
          'Relate inverter ratings (DC input, MPPT range, AC output, surge) to system design.',
        ],
        introduction: `Course S1 built inverters from the bridge up. This lesson places them in solar systems. An off-grid inverter makes its own AC from a battery; a grid-tied inverter follows the grid and pushes PV power into it; a hybrid inverter does both and manages a battery. Their architectures decide what each system can and cannot do during an outage.`,
        lecture: `### Off-grid (battery) inverter

**Battery → (DC bus) → bridge → filter (→ transformer) → AC loads**

- It forms the AC voltage and frequency itself ("grid-forming").
- It must supply every load's surge (motors, compressors).
- It has low-voltage disconnect ([[lvd|LVD]]) to protect the battery.
- The PV charge controller is often separate (or built in as an MPPT stage), with a charger from a generator input.

### Grid-tied inverter

**PV array → MPPT DC-DC (usually boost) → DC link → bridge → filter → grid**

- It synchronises to the grid and injects current in phase with it ("grid-following").
- It has no battery, so it can only deliver what the array produces at that moment.
- **[[anti-islanding|Anti-islanding]]:** it must detect loss of the grid and stop within a short time, so that it cannot energise lines that workers believe are dead. During an outage it produces nothing, even in full sun.
- Ratings to check: maximum DC voltage, MPPT voltage range, maximum input current per MPPT, AC output power and the grid-connection rules of the network operator.

### Hybrid inverter

**PV → MPPT → DC bus ← battery (bidirectional converter) → bridge ⇄ grid and backed-up loads**

- With the grid present it uses PV for the loads, charges the battery and exports any surplus where allowed ([[self-consumption]]).
- When the grid fails it disconnects from the grid (anti-islanding) with an internal or external **[[transfer-switch|transfer switch]]** and supplies the backed-up loads from the battery and PV.
- Many accept a generator input as a second AC source.

### String inverters, microinverters and optimisers

| Type | MPPT | Notes |
|---|---|---|
| String inverter | One per input (often two or more inputs) | Lowest cost per watt; shading of one module affects its string |
| Microinverter | One per module, AC from the roof | Module-level MPPT and shutdown; more units on the roof |
| Optimiser + inverter | DC-DC per module | Module-level MPPT, string inverter for conversion |

### Ratings in design

- **Off-grid:** continuous power ≥ 1.25 × peak load; surge capability ≥ starting loads; DC input voltage = battery system voltage.
- **Grid-tied:** DC/AC ratio typically 1.1–1.3 (arrays rarely reach nameplate power); string window within the MPPT range.
- **Hybrid:** both sets of checks, plus battery charge and discharge power and the backed-up load list.`,
        technical: `**Transformerless grid inverters.** Many grid inverters have no galvanic isolation between PV and grid. This affects earthing arrangements and requires residual-current monitoring inside the inverter, and it is why some module types (and frame earthing rules) are specified with them. These are installation-standard topics (course S3).

**Reactive power and grid codes.** Network operators increasingly require inverters to support the grid: limits on export, power-factor control, ride-through of short disturbances. Settings are made at commissioning to the operator's requirements.

**Build projects.** Build project G is a solar inverter (MPPT stage + battery + sine inverter); build project H is a hybrid with grid/generator selection and a transfer relay. They implement simplified versions of these architectures in the simulator.`,
        diagrams: [
          { id: 'system-types', caption: 'Off-grid, grid-tied and hybrid architectures.' },
          { id: 'hybrid-paths', caption: 'Energy paths of the hybrid inverter built in project H: grid or generator, transfer relay, charger, battery and inverter.' },
        ],
        formulas: [
          { name: 'Off-grid inverter rating', expr: 'P_inv ≥ 1.25 · P_peak;  surge ≥ P_peak + largest starting increment', where: [] },
          { name: 'Grid inverter sizing', expr: 'P_AC ≈ P_array / (DC/AC ratio, typically 1.1–1.3)', where: [] },
        ],
        examples: [
          {
            title: 'Grid inverter size',
            problem: 'A 6.6 kWp array is connected to a grid inverter with a DC/AC ratio of 1.2. What AC rating is indicated?',
            steps: ['P_AC = 6600 / 1.2 = 5500 W', 'Choose the nearest standard size at or above it, for example 6 kW (or 5 kW if a ratio of 1.32 is acceptable to the manufacturer)'],
            answer: 'About 5.5 kW AC, so a 6 kW inverter (check the inverter’s maximum DC power and input limits).',
          },
          {
            title: 'Off-grid inverter',
            problem: 'Peak simultaneous load 1310 W; a 1 kW steriliser and a fridge (starting 600 W, running 120 W). Inverter surge factor 2. Choose from 1500, 2000, 3000 W.',
            steps: ['Continuous: 1.25 × 1310 = 1638 W', 'Surge: 1310 + (600 − 120) = 1790 W → 1790/2 = 895 W (not limiting)', 'Next size ≥ 1638 W → 2000 W'],
            answer: '2000 W.',
          },
        ],
        applications: `Choosing the inverter is part of every S2.M3 design. The laboratory's energy-management tab shows anti-islanding during a grid outage, and how a hybrid system rides through it.`,
        mistakes: [
          { mistake: 'Expecting a grid-tied PV system to power the house during a blackout.', correction: 'Anti-islanding stops it; back-up needs a battery and a hybrid or off-grid inverter.' },
          { mistake: 'Sizing an off-grid inverter by average power.', correction: 'Size by peak simultaneous power and starting surges.' },
          { mistake: 'Ignoring the grid operator’s connection rules.', correction: 'Grid connection needs approval and the specified settings.' },
        ],
        demo: {
          title: 'Energy flows by system type',
          text: 'Choose the off-grid, hybrid and grid-tied examples and watch how PV, battery, grid and load interact over a day.',
          link: to.solar('Solar laboratory: energy management', 'energy'),
          embed: 'energy-day',
        },
        activities: [to.build('Build project G: solar inverter', 'bld-g'), to.build('Build project H: hybrid inverter', 'bld-h'), to.solar('Troubleshooting: no power during an outage', 'faults')],
        check: [
          { id: 'k1', type: 'mcq', prompt: 'A grid-forming inverter…', options: ['creates its own voltage and frequency (off-grid)', 'only follows the grid', 'has no bridge', 'cannot supply loads'], answer: 0, explain: 'Off-grid and hybrid inverters in back-up mode form the grid.' },
          { id: 'k2', type: 'numeric', prompt: 'AC rating for an 8 kWp array at DC/AC ratio 1.25 (kW)?', answer: 6.4, tol: 0.01, unit: 'kW', explain: '8/1.25.' },
          { id: 'k3', type: 'mcq', prompt: 'Why must grid-tied inverters stop during an outage?', options: ['To avoid energising lines workers believe are dead', 'To save the battery', 'Because PV stops', 'To reduce noise'], answer: 0, explain: 'Anti-islanding protects line workers.' },
          { id: 'k4', type: 'mcq', prompt: 'Module-level MPPT is provided by…', options: ['microinverters or optimisers', 'string fuses', 'the battery', 'the transfer switch'], answer: 0, explain: 'Each module has its own tracker.' },
        ],
        summary: [
          'Off-grid: battery → bridge → AC; grid-forming, surge and LVD matter.',
          'Grid-tied: PV → MPPT → bridge → grid; anti-islanding, no back-up.',
          'Hybrid: PV, battery and grid on one DC bus; back-up via a transfer switch.',
          'String inverter vs microinverter vs optimiser: where MPPT happens.',
          'Ratings: continuous, surge, DC voltage, MPPT range, DC/AC ratio.',
        ],
        homework: {
          id: 'S2.M2.L3.hw',
          title: 'Choosing an architecture',
          brief: 'A clinic is connected to an unreliable grid with daily outages of several hours and wants to use solar energy.',
          tasks: [
            { id: 'h1', type: 'mcq', prompt: 'Which architecture supplies the clinic during outages?', options: ['Hybrid with battery', 'Grid-tied without battery', 'PWM controller only', 'Microinverters without battery'], answer: 0, explain: 'Back-up needs storage and grid-forming capability.' },
            { id: 'h2', type: 'numeric', prompt: 'Backed-up loads total 1.2 kW peak. Minimum continuous inverter rating with 1.25 margin (W)?', answer: 1500, tol: 0.01, unit: 'W', explain: '1.25 × 1200.' },
          ],
          written: [{ prompt: 'Explain what happens in the hybrid system at the moment the grid fails, and why.', model: 'The inverter detects the loss (voltage/frequency), opens its grid relay or the transfer switch so it is isolated from the network (anti-islanding), then forms its own AC from the battery and PV to supply the backed-up loads; when the grid returns and is stable it resynchronises and reconnects.' }],
        },
      },
    },
  ],
  quiz: {
    pass: 0.7,
    questions: [
      { id: 'q1', type: 'numeric', prompt: 'String V_oc of 9 modules at 52.68 V cold (V)?', answer: 474.1, tol: 0.01, unit: 'V', explain: '9 × 52.68.' },
      { id: 'q2', type: 'numeric', prompt: 'Minimum string length: MPPT minimum 150 V, V_mp,hot 28.07 V?', answer: 6, tol: 0.001, unit: '', explain: '150/28.07 = 5.34 → 6.' },
      { id: 'q3', type: 'numeric', prompt: 'String fuse minimum for I_sc 9.3 A (A)?', answer: 14.51, tol: 0.01, unit: 'A', explain: '1.56 × 9.3.' },
      { id: 'q4', type: 'mcq', prompt: 'A string has one heavily shaded module. A simple P&O controller may…', options: ['settle on a local power peak', 'trip the RCD', 'charge the battery faster', 'reverse the current'], answer: 0, explain: 'Multi-peak curves can trap P&O.' },
      { id: 'q5', type: 'numeric', prompt: 'MPPT output current: 1.2 kW array, η 0.96, 14 V battery (A)?', answer: 82.29, tol: 0.01, unit: 'A', explain: '1152/14.' },
      { id: 'q6', type: 'mcq', prompt: 'Which pairing suits a PWM controller on 12 V?', options: ['A 36-cell module', 'A 72-cell module', 'A 144-half-cell module', 'Any module'], answer: 0, explain: 'V_mp ≈ 18 V suits a 12 V battery.' },
      { id: 'q7', type: 'mcq', prompt: 'During a grid outage a grid-tied inverter without battery…', options: ['stops producing', 'supplies the house', 'charges a battery', 'exports at full power'], answer: 0, explain: 'Anti-islanding.' },
      { id: 'q8', type: 'mcq', prompt: 'The stage in which the voltage is held constant while current tapers is…', options: ['absorption', 'bulk', 'float', 'equalisation only'], answer: 0, explain: 'Absorption.' },
    ],
  },
  assignment: {
    id: 'S2.M2.asg',
    title: 'Module assignment: configuring an array and controller',
    brief: 'Required array ≈ 2.1 kW from illustrative 550 W modules (V_oc,cold 51.34 V at 12 °C coldest, V_mp,hot 37.76 V, I_sc 14.0 A, max series fuse 25 A). 24 V battery charging at 28.8 V. Controller classes: 100/150/250 V; 50/60/70/80/100 A; η 0.97.',
    tasks: [
      { id: 'a1', type: 'numeric', prompt: 'Modules needed?', answer: 4, tol: 0.001, unit: '', explain: '2100/550 = 3.8 → 4.' },
      { id: 'a2', type: 'numeric', prompt: 'Maximum in series with a 150 V controller?', answer: 2, tol: 0.001, unit: '', explain: '150/51.34 = 2.92 → 2.' },
      { id: 'a3', type: 'numeric', prompt: 'Minimum in series (28.8 + 5 V)?', answer: 1, tol: 0.001, unit: '', explain: '33.8/37.76 = 0.9 → 1.' },
      { id: 'a4', type: 'numeric', prompt: 'With 2 × 2, MPPT output current at 24 V nominal (A)?', answer: 88.92, tol: 0.01, unit: 'A', explain: '2200 × 0.97 / 24 = 88.9 A → 100 A controller.' },
      { id: 'a5', type: 'mcq', prompt: 'String fuses for 2 parallel strings?', options: ['Not required: 1.25 × 14 = 17.5 A ≤ 25 A', 'Required'], answer: 0, explain: 'One string’s reverse current is within the rating.' },
    ],
    written: [{ prompt: 'Would a 250 V controller allow a better configuration? Discuss.', model: 'With 250 V, 4 in series (cold V_oc 205 V) is possible as a single string: lower array current (14 A instead of 28 A), thinner PV cable and no combiner, at the cost of a higher, more hazardous DC voltage and a controller that accepts it. Output current is the same (≈ 89 A at 24 V) because it depends on power.' }],
  },
  practicals: [
    { id: 'S2.M2.P1', title: 'Build project G: solar inverter with MPPT stage', description: 'Design, assemble and test the solar inverter in the build laboratory, including the MPPT stage and battery charging.', link: to.build('Build project G', 'bld-g'), evidence: { kind: 'project', id: 'bld-g' } },
    {
      id: 'S2.M2.P2',
      title: 'Array and controller configuration assessment',
      description: 'Configure strings and select a controller for a given site and battery. All answers must be correct.',
      task: {
        id: 's2-strings',
        kind: 'calc',
        title: 'Strings, fuses and controller',
        brief: 'Illustrative 400 W modules: V_oc 37.1 V, V_mp 31.0 V, I_sc 13.8 A, β −0.27 %/°C, NOCT 45 °C, max series fuse 25 A. Site: coldest −8 °C, hottest 40 °C. 48 V battery charging at 54 V; MPPT needs 5 V headroom. Controller classes 150/250 V. Six modules required.',
        questions: [
          { id: 'c1', type: 'numeric', prompt: 'Module V_oc on the coldest morning (V)?', answer: 40.41, tol: 0.01, unit: 'V', explain: '37.1 × (1 + 0.0027 × 33) = 37.1 × 1.0891 = 40.41 V.' },
          { id: 'c2', type: 'numeric', prompt: 'Hot cell temperature at 800 W/m² (°C)?', answer: 65, tol: 0.01, unit: '°C', explain: '40 + 25.' },
          { id: 'c3', type: 'numeric', prompt: 'Module V_mp when hot (V)?', answer: 27.65, tol: 0.01, unit: 'V', explain: '31.0 × (1 − 0.0027 × 40) = 31.0 × 0.892 = 27.65 V.' },
          { id: 'c4', type: 'numeric', prompt: 'Minimum modules in series?', answer: 3, tol: 0.001, unit: '', explain: '(54 + 5)/27.65 = 2.13 → 3.' },
          { id: 'c5', type: 'numeric', prompt: 'Maximum in series with a 150 V controller?', answer: 3, tol: 0.001, unit: '', explain: '150/40.41 = 3.71 → 3.' },
          { id: 'c6', type: 'mcq', prompt: 'Configuration and controller class?', options: ['3 in series × 2 strings on a 150 V controller', '6 in series on a 150 V controller', '2 in series × 3 strings on 150 V', '1 × 6 on 150 V'], answer: 0, explain: '3 × 2 fits the 150 V window (cold V_oc 121 V); 6 in series (242 V) would need 250 V; 2 in series is below the minimum.' },
        ],
        explain: 'The string window comes from cold V_oc (maximum) and hot V_mp (minimum); then choose the configuration and check the controller voltage class.',
      },
      evidence: { kind: 'task', id: 's2-strings' },
    },
  ],
}
