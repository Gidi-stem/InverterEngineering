import type { AcademyModule } from '../types'
import { to } from '../s1/links'

/** S2.M3 System design from a load profile. */
export const S2_M3: AcademyModule = {
  id: 'S2.M3',
  title: 'System design from a load profile',
  summary: 'The complete sizing method: from a real list of appliances to daily energy and peak demand, then the inverter, the PV array and the battery bank, each with its formula, working and assumptions.',
  lessons: [
    {
      id: 'S2.M3.L1',
      title: 'Load profiles and energy budgets',
      minutes: 40,
      content: {
        objectives: [
          'Build a load profile from appliance power, quantity, duty and hours of use.',
          'Calculate daily AC and DC energy and the energy drawn from the battery.',
          'Determine peak simultaneous demand and starting surge.',
          'Size the inverter and choose the system voltage.',
        ],
        introduction: `Every solar design starts with the loads. Overestimate them and the system is needlessly expensive; underestimate them and it fails on the first cloudy evening. A [[load-profile|load profile]] lists each appliance with its power and when it runs. From it come two different numbers: the daily **energy** (which sizes the battery and the array) and the **peak power** (which sizes the inverter). In this module you will size a complete system by hand and check every number in the solar laboratory.`,
        lecture: `### Collecting the data

For each load record:

- **power** (W): from the nameplate or, better, measured with a power meter;
- **quantity**;
- **hours of use** and *when* (morning, daytime, evening, all day);
- **duty**: the fraction of its on-time it actually draws power. A refrigerator's compressor cycles, so it may run 30–50 % of the time;
- **starting power**: motors and compressors draw several times their running power for a moment when starting.

Reduce loads first: efficient appliances (LED lighting, inverter fridges) are always cheaper than extra modules and batteries.

### Daily energy

For each load: **E = P × qty × duty × hours**. Sum the AC loads and the DC loads separately.

Energy drawn from the battery:

**E_d = E_AC / η_inverter + E_DC**

The inverter's efficiency (and its idle consumption) adds to every AC watt-hour.

### Peak and surge

- **Peak simultaneous load:** the largest total running power of loads that can be on at the same time. The profile's timing matters: a pump at 06:00 and a TV at 20:00 do not add.
- **Surge:** the peak plus the largest single starting increment (P_start − P_run).

### The inverter

- **Continuous rating** ≥ 1.25 × peak (margin for heat and ageing).
- **Surge capability** (from the datasheet, often given as a multiple of rating for a few seconds) ≥ surge.

### System voltage

Higher battery voltage means lower current for the same power (F2.M2.L3). A common rule of thumb:

| Inverter | Battery voltage |
|---|---|
| up to about 1.2 kW | 12 V |
| up to about 3 kW | 24 V |
| larger | 48 V |

At 12 V a 1.5 kW inverter draws about 140 A; at 48 V about 36 A.`,
        technical: `**Profiles, not just totals.** The hour-by-hour profile matters for energy management (S2.M4): energy used at midday can come straight from PV, while evening energy must pass through the battery, with its losses. The laboratory draws the hourly profile from your windows of use.

**Measured data.** For existing buildings, a week of logged consumption is more reliable than nameplate estimates. Nameplate power is often a maximum; duty and standby must be estimated or measured.

**Values in this course.** The appliance library in the laboratory uses typical values for learning. A real design uses nameplate or measured values for the actual appliances.`,
        diagrams: [{ id: 'design-chain', caption: 'The sizing sequence: each step uses the result of the one before.' }],
        formulas: [
          { name: 'Load energy', expr: 'E = P × qty × duty × hours', where: [['duty', 'fraction of on-time drawing power', '—']] },
          { name: 'Energy at the battery', expr: 'E_d = E_AC / η_inv + E_DC', where: [] },
          { name: 'Inverter rating', expr: 'P_inv ≥ 1.25 · P_peak;  surge ≥ P_peak + max(P_start − P_run)', where: [] },
        ],
        examples: [
          {
            title: 'A rural home',
            problem: 'Loads: 8 LED lamps 8 W 18–23 h; fridge 120 W, duty 0.4, all day (starting 600 W); TV 80 W 19–22 h; 4 phone chargers 10 W 18–22 h; laptop 60 W 9–13 h; 2 fans 50 W 12–17 h; pump 750 W 06–07 h (starting 2250 W); router 10 W all day. Inverter η = 0.9. Find the daily energy at the battery.',
            steps: ['LEDs 8 × 8 × 5 = 320; fridge 120 × 0.4 × 24 = 1152; TV 80 × 3 = 240; chargers 4 × 10 × 4 = 160', 'Laptop 60 × 4 = 240; fans 2 × 50 × 5 = 500; pump 750 × 1 = 750; router 10 × 24 = 240', 'E_AC = 3602 Wh; E_d = 3602 / 0.9 = 4002 Wh'],
            answer: '3.60 kWh/day of AC energy; 4.00 kWh/day from the battery.',
          },
          {
            title: 'Peak, surge and inverter',
            problem: 'For the same home, find the peak simultaneous load, the surge and the inverter rating (sizes 1000, 1500, 2000 W; surge factor 2).',
            steps: ['06:00–07:00: pump 750 + fridge 120 + router 10 = 880 W (evening: 64 + 120 + 80 + 40 + 10 = 314 W)', 'Surge: 880 + (2250 − 750) = 2380 W', 'Continuous 1.25 × 880 = 1100 W; surge 2380 / 2 = 1190 W → 1500 W'],
            answer: 'Peak 880 W, surge 2380 W: a 1500 W inverter; the pump’s start decides it. At 1.5 kW a 24 V system is chosen.',
          },
        ],
        applications: `The solar laboratory’s Design tab builds exactly this profile; the example "Off-grid rural home" is the home in these examples. Changing a load updates every later number in the design.`,
        mistakes: [
          { mistake: 'Adding the running power of every appliance to get the peak.', correction: 'Only loads that can run at the same time add; use the time profile.' },
          { mistake: 'Ignoring duty cycles (using a fridge’s full power for 24 h).', correction: 'Multiply by the fraction of time it runs, or measure its daily energy.' },
          { mistake: 'Forgetting motor starting surges.', correction: 'Check the inverter’s surge capability against the largest starting load.' },
        ],
        demo: {
          title: 'Load profile',
          text: 'Choose an example system and read its hourly profile, daily energy, peak and surge; then edit the loads on the laboratory’s Design tab.',
          link: to.solar('Solar laboratory: load profile', 'design'),
          embed: 'load-profile',
        },
        activities: [to.solar('Solar laboratory: build your own load profile', 'design')],
        check: [
          { id: 'k1', type: 'numeric', prompt: 'Daily energy of a 150 W freezer, duty 0.45, all day (Wh)?', answer: 1620, tol: 0.01, unit: 'Wh', explain: '150 × 0.45 × 24.' },
          { id: 'k2', type: 'numeric', prompt: 'Energy at the battery for 2.4 kWh AC at η 0.92 (kWh)?', answer: 2.609, tol: 0.01, unit: 'kWh', explain: '2.4/0.92.' },
          { id: 'k3', type: 'numeric', prompt: 'Inverter minimum continuous rating for a 1.8 kW peak (W)?', answer: 2250, tol: 0.01, unit: 'W', explain: '1.25 × 1800.' },
          { id: 'k4', type: 'mcq', prompt: 'Which number sizes the inverter?', options: ['Peak simultaneous power and surge', 'Daily energy', 'Battery capacity', 'Peak sun hours'], answer: 0, explain: 'Energy sizes the battery and array; power sizes the inverter.' },
        ],
        summary: [
          'Record power, quantity, duty, hours and starting power for every load.',
          'E = P × qty × duty × hours; E_d = E_AC/η + E_DC.',
          'Peak = largest simultaneous running power; surge adds the largest start.',
          'Inverter ≥ 1.25 × peak, surge capability ≥ surge.',
          'Choose 12/24/48 V to keep battery current reasonable.',
        ],
        homework: {
          id: 'S2.M3.L1.hw',
          title: 'Profile a small clinic',
          brief: 'Loads: 12 LED lamps 8 W for 8 h; vaccine fridge 60 W, duty 0.5, 24 h; 2 laptops 60 W for 8 h; steriliser 1000 W for 1 h. Inverter η 0.9.',
          tasks: [
            { id: 'h1', type: 'numeric', prompt: 'Daily AC energy (Wh)?', answer: 3448, tol: 0.01, unit: 'Wh', explain: 'LEDs 12 × 8 × 8 = 768; vaccine fridge 60 × 0.5 × 24 = 720; laptops 2 × 60 × 8 = 960; steriliser 1000 × 1 = 1000; total 3448 Wh.' },
            { id: 'h2', type: 'numeric', prompt: 'Energy at the battery (Wh)?', answer: 3831, tol: 0.01, unit: 'Wh', explain: '3448/0.9 = 3831 Wh.' },
          ],
          written: [{ prompt: 'Explain why the clinic’s steriliser should run during the day.', model: 'Daytime energy can come directly from PV without passing through the battery (avoiding battery losses and cycling), and the steriliser’s high power then coincides with PV production; at night it would add 1 kWh of battery discharge and a large current peak.' }],
        },
      },
    },
    {
      id: 'S2.M3.L2',
      title: 'Solar array sizing',
      minutes: 40,
      content: {
        objectives: [
          'Calculate the array power required to replace the daily energy in the design month.',
          'Apply temperature, soiling, wiring, mismatch, controller and battery losses.',
          'Convert the required power to a number of modules and a string configuration.',
          'Check the configuration against the controller’s voltage and current limits.',
        ],
        introduction: `The array must replace each day's energy in the design month — usually the month with the least sun for the loads it serves. This lesson turns daily energy into kilowatts of modules, accounting honestly for every loss on the way from sunlight to the battery. The method is exactly the one the laboratory shows on its Design tab.`,
        lecture: `### The design month and peak sun hours

Solar energy varies through the year. An off-grid system is sized for the **design month**: the one with the lowest ratio of sunlight to load (often the winter month, or the rainy season in the tropics). Its daily irradiation, in kWh/m²/day, equals the [[psh|peak sun hours]].

### Losses from module to battery

1. **Temperature:** k_T = 1 + γ(T_cell − 25), using the hot cell temperature.
2. **Soiling:** typical 0.95–0.98 (dust).
3. **DC wiring:** typical 0.97–0.99.
4. **Mismatch:** typical 0.98.
5. **Controller efficiency:** MPPT about 0.95–0.98.
6. **Battery round-trip efficiency:** lead-acid about 0.8–0.85, LiFePO₄ about 0.92–0.97 (typical values; use the datasheet).

The first four combine into the array derating factor k.

### Required array power

**P_array = E_d / (η_battery × η_controller × PSH × k)**

For a PWM controller, also divide by the PWM harvest factor (the fraction of MPP power available at battery voltage, lesson S2.M2.L2).

For a grid-tied system there is no battery: P_array = E_AC × offset / (PSH × k), where the offset is the fraction of the load to be produced on average.

### Modules and strings

- N = ⌈P_array / P_max⌉;
- choose the string length within the voltage window (lesson S2.M2.L1);
- strings = ⌈N / n⌉; installed modules = n × strings (often a little more than N).

### The controller

- MPPT output current ≥ P_installed × η / V_sys, next standard size;
- PV input voltage limit ≥ the cold string V_oc.

### Margins and judgement

The result is an estimate. Designers often add a margin for future loads or degradation, but every margin costs money: state it explicitly, as the laboratory does with its "assumption" labels.`,
        technical: `**Why the battery efficiency appears.** Off-grid energy used at night passes through the battery twice (charge and discharge). The method applies the round-trip efficiency to all of E_d, which is conservative for loads that run in daylight directly from PV. The 24-hour simulation (S2.M4) shows how much actually passes through the battery.

**Tilt and orientation.** Peak sun hours must be for the array's plane (tilt and azimuth), not the horizontal. Climate databases and design tools provide plane-of-array values; this course gives PSH directly.

**Cross-check.** E_produced = P_installed × PSH × k × η_controller should be at least E_d / η_battery. The laboratory's energy tab is a further check over several days.`,
        diagrams: [{ id: 'energy-balance', caption: 'PV production against the load: midday surplus charges the battery for the evening and night.' }],
        formulas: [
          { name: 'Array derating factor', expr: 'k = [1 + γ(T_cell − 25)] × k_soiling × k_wiring × k_mismatch', where: [] },
          { name: 'Required array power (off-grid, MPPT)', expr: 'P_array = E_d / (η_bat · η_ctrl · PSH · k)', where: [['E_d', 'daily energy at the battery', 'Wh'], ['PSH', 'design-month peak sun hours', 'h']] },
          { name: 'Number of modules', expr: 'N = ⌈P_array / P_max⌉', where: [] },
        ],
        examples: [
          {
            title: 'Array for the rural home',
            problem: 'E_d = 4002 Wh; illustrative 400 W modules (γ −0.35 %/°C, NOCT 45 °C); hottest 35 °C; PSH 4.5; soiling 0.95, wiring 0.97, mismatch 0.98; MPPT 0.97; LiFePO₄ 0.95.',
            steps: ['T_cell = 35 + 25 = 60 °C; k_T = 1 − 0.0035 × 35 = 0.8775', 'k = 0.8775 × 0.95 × 0.97 × 0.98 = 0.7925', 'P_array = 4002 / (0.95 × 0.97 × 4.5 × 0.7925) = 4002 / 3.286 = 1218 W', 'N = ⌈1218 / 400⌉ = 4 modules'],
            answer: '1.22 kW required: four 400 W modules (1.6 kWp installed).',
          },
          {
            title: 'Strings and controller',
            problem: 'For those modules: cold V_oc 38.40 V (12 °C), hot V_mp 28.07 V; 150 V MPPT; 24 V battery charging at 26.6 V. Configure the array and size the controller (sizes 40, 50, 60, 70, 80 A).',
            steps: ['Window: n_max = ⌊150/38.40⌋ = 3; n_min = ⌈31.6/28.07⌉ = 2', 'Four modules: 2 × 2 uses exactly four (3 × 2 would need six)', 'I = 1600 × 0.97 / 24 = 64.7 A → 70 A'],
            answer: 'Two strings of two; a 150 V, 70 A MPPT controller. Cold string V_oc 76.8 V.',
          },
        ],
        applications: `The laboratory’s Design tab performs this method for any profile and shows the working; its energy tab then tests the result through a sequence of good and poor days.`,
        mistakes: [
          { mistake: 'Using annual-average peak sun hours for an off-grid system.', correction: 'Use the design month, or the system will fail in the poorest season.' },
          { mistake: 'Leaving out the battery and controller efficiencies.', correction: 'Include every loss between the array and the loads.' },
          { mistake: 'Rounding modules down.', correction: 'Round up, then fit the string window.' },
        ],
        demo: {
          title: 'Change the site and watch the array',
          text: 'On the Design tab, change the peak sun hours and the hottest temperature and watch the derating factor, the required array power and the string configuration update.',
          link: to.solar('Solar laboratory: array sizing', 'design'),
          embed: 'array-config',
        },
        activities: [to.solar('Solar laboratory: system design', 'design'), to.solar('Energy management: test the design', 'energy')],
        check: [
          { id: 'k1', type: 'numeric', prompt: 'Derating factor: k_T 0.9, soiling 0.95, wiring 0.98, mismatch 0.98?', answer: 0.8211, tol: 0.01, unit: '', explain: '0.9 × 0.95 × 0.98 × 0.98.' },
          { id: 'k2', type: 'numeric', prompt: 'P_array for E_d 3 kWh, η_bat 0.85, η_ctrl 0.97, PSH 5, k 0.8 (W)?', answer: 909.6, tol: 0.01, unit: 'W', explain: '3000/(0.85 × 0.97 × 5 × 0.8) = 909.6 W.' },
          { id: 'k3', type: 'numeric', prompt: 'Modules of 330 W for 1.9 kW?', answer: 6, tol: 0.001, unit: '', explain: '1900/330 = 5.76 → 6.' },
          { id: 'k4', type: 'mcq', prompt: 'An off-grid array is sized for…', options: ['the design month with the least sun for the load', 'the sunniest month', 'the annual average', 'night-time'], answer: 0, explain: 'It must work in the poorest season.' },
        ],
        summary: [
          'Use the design month’s plane-of-array peak sun hours.',
          'k = temperature × soiling × wiring × mismatch.',
          'P_array = E_d / (η_bat · η_ctrl · PSH · k); PWM also ÷ harvest factor.',
          'N = ⌈P/P_max⌉, then fit the string window.',
          'Controller: I ≥ P·η/V_sys; V_max ≥ cold string V_oc.',
        ],
        homework: {
          id: 'S2.M3.L2.hw',
          title: 'Array sizing',
          brief: 'E_d = 6.2 kWh/day; illustrative 550 W modules (γ −0.35 %/°C, NOCT 45 °C); hottest 35 °C; PSH 4.5; soiling 0.95, wiring 0.97, mismatch 0.98; MPPT 0.97; lead-acid 0.85.',
          tasks: [
            { id: 'h1', type: 'numeric', prompt: 'Derating factor k?', answer: 0.7925, tol: 0.01, unit: '', explain: '0.8775 × 0.9031.' },
            { id: 'h2', type: 'numeric', prompt: 'Required array power (W)?', answer: 2109, tol: 0.01, unit: 'W', explain: '6200/(0.85 × 0.97 × 4.5 × 0.7925) = 6200/2.940 = 2109 W.' },
            { id: 'h3', type: 'numeric', prompt: 'Number of modules?', answer: 4, tol: 0.001, unit: '', explain: '2109/550 = 3.83 → 4.' },
          ],
          written: [{ prompt: 'The same clinic is moved to a site with PSH 3.2 in the rainy season. What changes, and what alternative to a larger array is worth considering?', model: 'The required array rises in proportion (×4.5/3.2 = 1.41) to about 2.97 kW: six modules. Alternatives: reduce or shift loads, accept generator back-up during the rainy season (hybrid off-grid design), or increase autonomy; the trade-off is cost against reliability.' }],
        },
      },
    },
    {
      id: 'S2.M3.L3',
      title: 'Battery bank sizing',
      minutes: 40,
      content: {
        objectives: [
          'Calculate the battery energy and capacity for a required autonomy and depth of discharge.',
          'Configure batteries in series and parallel for the system voltage and capacity.',
          'Check discharge rate, charge current and the number of parallel strings.',
          'Size the battery cable, fuse and isolator.',
        ],
        introduction: `The battery carries the loads through the night and through cloudy days. Its size is a trade-off between reliability, cost and battery life: too small and it is cycled deeply and fails early; too large and it costs more than it saves. This lesson completes the design with the battery bank and its DC protection.`,
        lecture: `### Energy and capacity

**E_battery = E_d × autonomy / DoD**

- **[[autonomy|Autonomy]]:** days the battery must supply the loads without charging. Typical choices are 1–3 days for homes, more for critical loads in cloudy climates; less where a generator or the grid backs up the system.
- **[[dod|Depth of discharge]]:** the fraction of capacity used in normal cycling. Typical design values: about 50 % for lead-acid, about 80 % for LiFePO₄ (the datasheet's cycle-life curve sets the real value).

**C = E_battery / V_sys** (in Ah at the system voltage).

### Configuration

- Batteries in series per string: N_s = V_sys / V_unit (for example 2 × 12.8 V for 24 V, 4 × 12 V for 48 V).
- Parallel strings: N_p = ⌈C / C_unit⌉.
- Keep N_p small (ideally 1–3): more parallel strings share current unevenly and each needs a fuse. Prefer larger-capacity batteries or cells.
- Use identical batteries of the same type, age and state of charge; never mix chemistries.

### Discharge and charge rates

- Maximum discharge current: I_max = P_inverter / (η × V_cut-off).
- C-rate = I_max / C_bank. Check it against the datasheet. As typical guidance, lead-acid prefers about 0.2C or less; LiFePO₄ often allows 0.5C continuous or more, limited by its BMS.
- Charge current from the controller and any generator charger must also be within the datasheet limits.

### DC protection and cabling

From F1.M4 and F2.M5:

- **Battery fuse** at the battery positive: I_n ≥ 1.25 × I_max, DC-rated, with a breaking capacity above the bank's short-circuit current.
- **Fuse on each parallel string** when N_p > 1.
- **Cable** sized for the voltage-drop limit (often 1–2 % between battery and inverter) and checked for current-carrying capacity against the fuse rating.
- **Lockable battery isolator** for safe isolation.

### Hybrid systems

For hybrid systems the "autonomy" is the storage wanted for self-consumption and outages. A fraction of a day's energy is common; an outage reserve (for example 30 % SOC) is kept for back-up.`,
        technical: `**Temperature.** Lead-acid capacity falls in the cold (often 10–20 % at 0 °C); some designs add a temperature factor. Lithium batteries must not be charged below the minimum temperature in their datasheet, which their BMS enforces.

**Usable versus nominal.** A 25.6 V, 600 Ah LiFePO₄ bank is 15.36 kWh nominal and about 12.3 kWh usable at 80 % DoD. Always state which one a number refers to.

**System voltage versus bank voltage.** A "24 V" LiFePO₄ bank is nominally 25.6 V (8 cells). The method uses the system voltage (24 V) for the capacity in Ah, which is slightly conservative.`,
        diagrams: [{ id: 'battery-model', caption: 'The bank as an EMF with internal resistance: current, voltage sag and losses set the cable, fuse and C-rate checks.' }],
        formulas: [
          { name: 'Battery energy', expr: 'E_bat = E_d × autonomy / DoD', where: [] },
          { name: 'Capacity and configuration', expr: 'C = E_bat / V_sys;  N_s = V_sys / V_unit;  N_p = ⌈C / C_unit⌉', where: [] },
          { name: 'Maximum discharge current', expr: 'I_max = P_inv / (η · V_cut-off)', where: [['V_cut-off', 'low-voltage cut-off (≈ 0.875 × nominal)', 'V']] },
        ],
        examples: [
          {
            title: 'Bank for the rural home',
            problem: 'E_d = 4002 Wh, 2 days of autonomy, LiFePO₄ at 80 % DoD, 24 V system, 12.8 V 200 Ah batteries.',
            steps: ['E_bat = 4002 × 2 / 0.8 = 10 006 Wh', 'C = 10 006 / 24 = 417 Ah', 'N_s = 24 / 12.8 → 2 (25.6 V); N_p = ⌈417 / 200⌉ = 3'],
            answer: 'Two in series, three strings in parallel: six batteries, 25.6 V, 600 Ah, 15.36 kWh nominal.',
          },
          {
            title: 'Current, fuse and cable',
            problem: 'The 1500 W inverter (η 0.9) cuts off at 21 V. Cable route 2 m; 2 % drop limit at 24 V; fuse sizes 80, 100, 125 A; cable sizes 16, 25, 35 mm².',
            steps: ['I_max = 1500 / (0.9 × 21) = 79.4 A; C-rate = 79.4 / 600 = 0.13C', 'Fuse ≥ 1.25 × 79.4 = 99.2 A → 100 A', 'A ≥ 0.0172 × 4 × 79.4 / 0.48 = 11.4 mm² → 16 mm² (check its current rating ≥ 100 A in the manufacturer’s table; otherwise 25 mm²)'],
            answer: '100 A fuse; 16 mm² meets the drop limit if its rating is at least 100 A, otherwise 25 mm². Plus a fuse on each of the three strings rated at least 1.25 × 79.4 / 3 = 33 A (next standard size, 40 A).',
          },
        ],
        applications: `The laboratory's Design tab sizes the bank and its protection, and flags excessive C-rates and too many parallel strings; the energy tab shows the state of charge over several days.`,
        mistakes: [
          { mistake: 'Sizing the battery for one day with lead-acid at 100 % DoD.', correction: 'Allow for autonomy and the allowed depth of discharge.' },
          { mistake: 'Paralleling many small batteries.', correction: 'Keep strings few; use larger units and fuse each string.' },
          { mistake: 'Forgetting the battery fuse’s breaking capacity.', correction: 'It must interrupt the bank’s short-circuit current at the DC voltage.' },
        ],
        demo: {
          title: 'Battery under load',
          text: 'Vary the load, internal resistance and capacity to see terminal voltage sag, internal heat and runtime; then size the bank on the Design tab.',
          link: to.solar('Solar laboratory: battery bank', 'design'),
          embed: 'battery-load',
        },
        activities: [to.solar('Solar laboratory: battery and protection', 'design'), to.lib('Battery terminals', 'battery-terminals'), to.lib('Fuse', 'fuse')],
        check: [
          { id: 'k1', type: 'numeric', prompt: 'E_bat for E_d 2.5 kWh, 3 days, DoD 0.5 (kWh)?', answer: 15, tol: 0.01, unit: 'kWh', explain: '2.5 × 3 / 0.5.' },
          { id: 'k2', type: 'numeric', prompt: 'Capacity at 48 V for 15 kWh (Ah)?', answer: 312.5, tol: 0.01, unit: 'Ah', explain: '15 000/48.' },
          { id: 'k3', type: 'numeric', prompt: 'Parallel strings of 200 Ah batteries for 312.5 Ah?', answer: 2, tol: 0.001, unit: '', explain: '⌈1.56⌉ = 2.' },
          { id: 'k4', type: 'numeric', prompt: 'I_max: 3 kW inverter, η 0.92, cut-off 42 V (A)?', answer: 77.64, tol: 0.01, unit: 'A', explain: '3000/(0.92 × 42) = 77.6 A.' },
        ],
        summary: [
          'E_bat = E_d × autonomy / DoD; C = E_bat / V_sys.',
          'N_s = V_sys/V_unit; N_p = ⌈C/C_unit⌉; keep N_p small and fuse each string.',
          'Check C-rate and charge current against the datasheet.',
          'Battery fuse ≥ 1.25 × I_max with adequate breaking capacity; cable for drop and rating.',
          'Hybrid storage: a fraction of daily energy plus an outage reserve.',
        ],
        homework: {
          id: 'S2.M3.L3.hw',
          title: 'Battery design for the clinic',
          brief: 'E_d = 6.2 kWh/day; 1.5 days of autonomy; lead-acid 12 V 200 Ah at 50 % DoD; 24 V; 2 kW inverter (η 0.9, cut-off 21 V).',
          tasks: [
            { id: 'h1', type: 'numeric', prompt: 'Battery energy (Wh)?', answer: 18600, tol: 0.01, unit: 'Wh', explain: '6200 × 1.5 / 0.5.' },
            { id: 'h2', type: 'numeric', prompt: 'Capacity (Ah)?', answer: 775, tol: 0.01, unit: 'Ah', explain: '18 600/24.' },
            { id: 'h3', type: 'numeric', prompt: 'Total batteries?', answer: 8, tol: 0.001, unit: '', explain: '2 in series × ⌈775/200⌉ = 4 strings = 8.' },
            { id: 'h4', type: 'numeric', prompt: 'C-rate at full inverter load?', answer: 0.1323, tol: 0.02, unit: 'C', explain: 'I = 2000/(0.9 × 21) = 105.8 A; 105.8/800 = 0.132C.' },
          ],
          written: [{ prompt: 'Four parallel strings will be flagged. Suggest two ways to reduce them.', model: 'Use larger-capacity units (for example 2 V cells of 800 Ah, 12 in series, one string) or move to 48 V with fewer, larger batteries; alternatively reduce autonomy by adding generator back-up. Fewer strings share current evenly and need fewer fuses.' }],
        },
      },
    },
  ],
  quiz: {
    pass: 0.7,
    questions: [
      { id: 'q1', type: 'numeric', prompt: 'Daily energy: 6 LEDs 10 W × 6 h + TV 100 W × 4 h (Wh)?', answer: 760, tol: 0.01, unit: 'Wh', explain: '360 + 400.' },
      { id: 'q2', type: 'numeric', prompt: 'Battery-side energy for 760 Wh at η 0.9 (Wh)?', answer: 844.4, tol: 0.01, unit: 'Wh', explain: '760/0.9.' },
      { id: 'q3', type: 'numeric', prompt: 'Surge: peak 900 W, a 600 W pump starting at 1800 W (W)?', answer: 2100, tol: 0.01, unit: 'W', explain: '900 + 1200.' },
      { id: 'q4', type: 'numeric', prompt: 'P_array: E_d 5 kWh, η_bat 0.95, η_ctrl 0.97, PSH 4, k 0.8 (W)?', answer: 1696, tol: 0.01, unit: 'W', explain: '5000/2.948 = 1696 W.' },
      { id: 'q5', type: 'numeric', prompt: 'E_bat: E_d 5 kWh, 2 days, DoD 0.8 (kWh)?', answer: 12.5, tol: 0.01, unit: 'kWh', explain: '5 × 2 / 0.8.' },
      { id: 'q6', type: 'numeric', prompt: '51.2 V, 100 Ah batteries for 12.5 kWh at 48 V?', answer: 3, tol: 0.001, unit: '', explain: '12 500/48 = 260 Ah → 3 in parallel.' },
      { id: 'q7', type: 'mcq', prompt: 'Which value sizes the battery?', options: ['Daily energy, autonomy and DoD', 'Peak power only', 'Inverter surge', 'Cable length'], answer: 0, explain: 'Energy storage.' },
      { id: 'q8', type: 'mcq', prompt: 'An inverter of 4 kW on 12 V would draw roughly…', options: ['about 420 A at cut-off: choose 48 V instead', '40 A', '100 A', '10 A'], answer: 0, explain: '4000/(0.9 × 10.5) = 423 A at cut-off: far too high for 12 V.' },
    ],
  },
  assignment: {
    id: 'S2.M3.asg',
    title: 'Module assignment: size a complete off-grid system by hand',
    brief: 'Use the rural home from S2.M3.L1 (E_d = 4002 Wh, peak 880 W, surge 2380 W). LiFePO₄ 12.8 V 200 Ah, DoD 0.8, η 0.95; 2 days autonomy; illustrative 400 W modules (cold V_oc 38.40 V, hot V_mp 28.07 V); PSH 4.5; k 0.7925; MPPT 0.97, 150 V.',
    tasks: [
      { id: 'a1', type: 'numeric', prompt: 'Inverter rating (1000/1500/2000 W, surge factor 2) (W)?', answer: 1500, tol: 0.001, unit: 'W', explain: 'max(1100, 1190) → 1500 W.' },
      { id: 'a2', type: 'numeric', prompt: 'Batteries in total?', answer: 6, tol: 0.001, unit: '', explain: '2S × 3P.' },
      { id: 'a3', type: 'numeric', prompt: 'Required array power (W)?', answer: 1218, tol: 0.01, unit: 'W', explain: '4002/(0.95 × 0.97 × 4.5 × 0.7925).' },
      { id: 'a4', type: 'numeric', prompt: 'Controller output current at 24 V (A)?', answer: 64.67, tol: 0.01, unit: 'A', explain: '1600 × 0.97/24 → 70 A controller.' },
      { id: 'a5', type: 'numeric', prompt: 'Battery fuse (A)?', answer: 100, tol: 0.001, unit: 'A', explain: '1.25 × 79.4 = 99.2 → 100 A.' },
    ],
    written: [{ prompt: 'Enter the same home in the solar laboratory, compare its explained items with your answers, and run three days (100 %, 35 %, 80 % sun) on the energy tab. Report the lowest state of charge and any energy not supplied, and comment.', model: 'The laboratory reproduces the hand results (1500 W, 2S3P 15.36 kWh, 2 × 2 modules, 70 A, 100 A fuse). With 70 % starting SOC the bank stays above its 20 % limit through the poor day and recovers on the good days with no unmet energy; a run of several very poor days would eventually shed load, showing why autonomy and design-month sun hours matter.' }],
  },
  practicals: [
    { id: 'S2.M3.P1', title: 'Solar laboratory: complete system design from a load profile', description: 'Design a complete system from a load profile in the solar laboratory with no design faults, and record it.', link: to.solar('Solar laboratory: Design tab', 'design'), evidence: { kind: 'activity', id: 'solar:design-ok' } },
    {
      id: 'S2.M3.P2',
      title: 'Hand-sizing assessment',
      description: 'Size a small off-grid system by hand. All answers must be correct.',
      task: {
        id: 's2-sizing',
        kind: 'calc',
        title: 'Sizing an off-grid system',
        brief: 'Loads (AC, η_inv 0.9): 6 LED lamps 10 W for 5 h; a fridge 100 W with duty 0.5 for 24 h (starting 500 W); a TV 70 W for 4 h. Peak simultaneous load 230 W. 12 V LiFePO₄ 12.8 V 100 Ah batteries, DoD 0.8, η 0.95, 2 days autonomy. PSH 5; k 0.8; MPPT η 0.97. Inverter sizes 300, 500, 800 W; surge factor 2.',
        questions: [
          { id: 'c1', type: 'numeric', prompt: 'Daily AC energy (Wh)?', answer: 1780, tol: 0.01, unit: 'Wh', explain: '300 + 1200 + 280.' },
          { id: 'c2', type: 'numeric', prompt: 'Energy at the battery (Wh)?', answer: 1977.8, tol: 0.01, unit: 'Wh', explain: '1780/0.9.' },
          { id: 'c3', type: 'numeric', prompt: 'Inverter rating (W)?', answer: 500, tol: 0.001, unit: 'W', explain: 'Continuous 1.25 × 230 = 288 W; surge 230 + 400 = 630 W → 315 W; → 500 W (300 W is below 315 W).' },
          { id: 'c4', type: 'numeric', prompt: 'Battery capacity at 12 V (Ah)?', answer: 412, tol: 0.01, unit: 'Ah', explain: '1977.8 × 2 / 0.8 / 12 = 412 Ah.' },
          { id: 'c5', type: 'numeric', prompt: 'Number of 100 Ah batteries?', answer: 5, tol: 0.001, unit: '', explain: '⌈4.12⌉ = 5 in parallel (consider larger units).' },
          { id: 'c6', type: 'numeric', prompt: 'Required array power (W)?', answer: 536.7, tol: 0.01, unit: 'W', explain: '1977.8/(0.95 × 0.97 × 5 × 0.8) = 536.6 W.' },
        ],
        explain: 'Energy sizes the battery and array; power and surge size the inverter. Every efficiency between the array and the loads is included.',
      },
      evidence: { kind: 'task', id: 's2-sizing' },
    },
  ],
}
