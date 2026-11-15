import type { AcademyModule } from '../types'
import { to } from '../s1/links'

/** S2.M4 System types and energy management. */
export const S2_M4: AcademyModule = {
  id: 'S2.M4',
  title: 'System types and energy management',
  summary: 'Off-grid, grid-connected and hybrid systems, generator integration, and the energy-management rules that decide where every watt-hour goes over a day — simulated in the laboratory’s 24-hour energy model.',
  lessons: [
    {
      id: 'S2.M4.L1',
      title: 'Off-grid systems',
      minutes: 35,
      content: {
        objectives: [
          'Describe the components and energy flows of an off-grid system.',
          'Explain low-voltage disconnect, load shedding and curtailment.',
          'Predict state of charge over a sequence of good and poor days.',
          'Identify the design choices that decide reliability.',
        ],
        introduction: `An off-grid system is the only source of electricity for its users: there is no grid to fall back on. Its battery must cover every night and every poor day, and its controls must protect that battery from being destroyed by over-discharge. This lesson follows energy through an off-grid system hour by hour.`,
        lecture: `### Components

**PV array → combiner and DC isolator → charge controller → battery (fuse, isolator) → inverter → AC distribution (protection, RCDs) → loads**

DC loads may be supplied directly from the battery or from the controller's load output.

### Energy flow through a day

- **Night:** the loads are supplied from the battery; state of charge ([[soc|SOC]]) falls.
- **Morning:** PV begins; first it supplies the loads, then any surplus charges the battery.
- **Midday:** PV usually exceeds the load; the battery charges (bulk, then absorption).
- **Battery full:** the controller reduces PV output to what the loads need. The energy the array could have produced is [[curtailment|curtailed]] — not stored and not used.
- **Evening:** PV falls below the load and the battery takes over again.

### Protecting the battery

- **Low-voltage disconnect ([[lvd|LVD]]):** the inverter (or controller load output) switches the loads off when the battery reaches its minimum SOC or voltage, set from the allowed depth of discharge. Loads are **shed** rather than destroying the battery.
- Some systems shed in stages: non-essential loads first, essential loads (vaccine fridge, lighting) last.

### Reliability

An off-grid system's reliability depends on:

- the design month's sun hours (worst-case season);
- autonomy (battery days);
- the ratio of array to load (array margin);
- load discipline (users shifting heavy loads to sunny hours).

A sequence of poor days drains the battery by the daily deficit each day; the battery recovers only on days when PV exceeds the load. The laboratory's energy tab simulates exactly this.`,
        technical: `**Daily deficit.** On a day producing a fraction w of the design-day PV energy, the battery's net change is roughly w × E_PV − E_d/η_bat. With E_PV sized to just replace E_d, a day at 35 % sun drains about 65 % of a day's energy from the battery; two days of autonomy therefore ride through about three such days.

**Inverter standby.** An inverter's idle consumption runs 24 hours: 15 W of idle is 360 Wh per day, a significant fraction of a small system's load. Load-sensing ("search") modes reduce it.

**The simulation.** The laboratory uses 10-minute steps, a clear-sky irradiance shape scaled to the site's peak sun hours and a day-by-day weather factor; battery efficiency is split between charge and discharge.`,
        diagrams: [
          { id: 'energy-balance', caption: 'A day in an off-grid system: midday surplus charges the battery; evening and night loads discharge it.' },
          { id: 'system-types', caption: 'The off-grid architecture alongside grid-tied and hybrid.' },
        ],
        formulas: [
          { name: 'Battery energy change over a day', expr: 'ΔE ≈ w · E_PV · η_charge − E_d', where: [['w', 'weather factor of the day (1 = design day)', '—']] },
          { name: 'Minimum state of charge', expr: 'SOC_min = 1 − DoD', where: [] },
        ],
        examples: [
          {
            title: 'A poor day',
            problem: 'A system stores 15.36 kWh nominal (80 % DoD, so 12.29 kWh usable) and needs 4.0 kWh/day. Its PV delivers about 4.4 kWh to the battery on a design day. Estimate the usable energy left after three days at 35 % sun, starting from full.',
            steps: ['Daily net: 0.35 × 4.4 − 4.0 = 1.54 − 4.0 = −2.46 kWh', 'After three days: 12.29 − 3 × 2.46 = 4.91 kWh usable remains'],
            answer: 'About 4.9 kWh of usable energy left: the system rides through.',
          },
          {
            title: 'Curtailment',
            problem: 'The same battery is full at 11:00 on a sunny day. The array could produce 1.2 kW until 14:00 but the loads draw 0.3 kW. How much energy is curtailed?',
            steps: ['Surplus = 1.2 − 0.3 = 0.9 kW', 'Curtailed ≈ 0.9 × 3 h = 2.7 kWh'],
            answer: 'About 2.7 kWh is not harvested: a reason to schedule pumps or washing at midday.',
          },
        ],
        applications: `Rural homes, clinics, schools, telecom sites and water pumping. The laboratory's off-grid examples and the clinic generator scenario are this kind of system.`,
        mistakes: [
          { mistake: 'Running heavy loads in the evening from the battery.', correction: 'Shift them to sunny hours when surplus PV would otherwise be curtailed.' },
          { mistake: 'Setting the low-voltage disconnect below the battery’s allowed DoD.', correction: 'Set it from the datasheet’s recommended minimum.' },
          { mistake: 'Ignoring inverter standby consumption.', correction: 'Include it in the daily energy, or use a search mode.' },
        ],
        demo: {
          title: 'Off-grid day',
          text: 'Select the off-grid home, change the weather and starting state of charge, and watch PV, load and SOC over 24 hours.',
          link: to.solar('Solar laboratory: energy management', 'energy'),
          embed: 'energy-day',
        },
        activities: [to.solar('Energy management: three-day scenario', 'energy')],
        check: [
          { id: 'k1', type: 'numeric', prompt: 'Minimum SOC for DoD 0.5 (%)?', answer: 50, tol: 0.01, unit: '%', explain: '1 − 0.5.' },
          { id: 'k2', type: 'numeric', prompt: 'Daily net with E_PV 5 kWh at 40 % sun and E_d 4.5 kWh (kWh)?', answer: -2.5, tol: 0.01, unit: 'kWh', explain: '2 − 4.5.' },
          { id: 'k3', type: 'mcq', prompt: 'When the battery is full and the loads are small, surplus PV is…', options: ['curtailed by the controller', 'stored anyway', 'exported to the grid', 'sent to earth'], answer: 0, explain: 'Off-grid systems cannot export.' },
          { id: 'k4', type: 'mcq', prompt: 'The low-voltage disconnect…', options: ['sheds loads to protect the battery from over-discharge', 'charges the battery', 'protects the PV array', 'isolates the grid'], answer: 0, explain: 'LVD protects the battery.' },
        ],
        summary: [
          'PV supplies loads first, then charges the battery; surplus is curtailed when full.',
          'Nights and poor days discharge the battery; LVD sheds loads at the DoD limit.',
          'Reliability: design month, autonomy, array margin and load discipline.',
          'Shift heavy loads to sunny hours.',
          'Include inverter standby consumption.',
        ],
        homework: {
          id: 'S2.M4.L1.hw',
          title: 'Riding through cloudy days',
          brief: 'Usable storage 8 kWh; E_d 3.2 kWh/day; design-day PV to the battery 3.6 kWh.',
          tasks: [
            { id: 'h1', type: 'numeric', prompt: 'Net change on a 25 % sun day (kWh)?', answer: -2.3, tol: 0.01, unit: 'kWh', explain: '0.9 − 3.2.' },
            { id: 'h2', type: 'numeric', prompt: 'Whole days at 25 % sun before LVD, starting full?', answer: 3, tol: 0.001, unit: '', explain: '8/2.3 = 3.48 → 3 full days.' },
          ],
          written: [{ prompt: 'Suggest two operational measures that improve this system’s reliability without new equipment.', model: 'Shift deferrable loads (pumping, washing, ironing) to sunny midday hours; shed non-essential loads early when SOC falls (staged LVD); keep modules clean; switch off the inverter or use search mode at night if no AC loads run.' }],
        },
      },
    },
    {
      id: 'S2.M4.L2',
      title: 'Grid-connected systems',
      minutes: 35,
      content: {
        objectives: [
          'Describe the components and operation of a grid-tied PV system.',
          'Calculate self-consumption, import and export over a day.',
          'Explain anti-islanding behaviour and its safety purpose.',
          'Estimate annual yield and size the inverter with a DC/AC ratio.',
        ],
        introduction: `A [[grid-tied]] system uses the grid as its "battery": PV supplies the site's loads, surplus is exported, and shortfalls are imported. It is the simplest and cheapest way to use solar energy where a reliable grid exists — but it provides no power during an outage. This lesson explains why, and how to estimate what such a system delivers.`,
        lecture: `### Components

**PV array → DC isolator → grid inverter (MPPT + bridge) → AC isolator → consumer unit → meter → grid**

Protection includes AC overcurrent protection and the inverter's internal grid-protection functions; surge protection is often fitted on both sides.

### Energy flow

At every moment: **P_PV,AC = P_load + P_export − P_import**.

- When PV exceeds the load, the surplus is **exported** (where permitted, possibly limited by the network operator).
- When the load exceeds PV, the difference is **imported**.
- **Self-consumption** is the PV energy used on site; **self-sufficiency** is the fraction of the load supplied by PV.

### Anti-islanding

A grid inverter **must** stop exporting within a short time when the grid fails. If it did not, it could keep a section of the network energised — an "island" — while utility workers treat it as dead (back-feed, F1.M2.L3).

Consequences:

- a grid-tied system **gives no back-up**, even in full sun;
- back-up needs a battery and a hybrid or off-grid inverter with a transfer arrangement (lesson L3).

### Yield and sizing

- **Annual yield:** E_year ≈ P_array × PSH_annual × 365 × PR, where the performance ratio PR (≈ k × η_inverter) is typically 0.75–0.85.
- **Inverter:** P_AC ≈ P_array / DC/AC ratio (typically 1.1–1.3).
- **Strings:** within the inverter's MPPT voltage range and below its maximum DC voltage (S2.M2.L1).

### Connection rules

Connection to the grid requires the network operator's approval and settings (export limits, protection settings, power factor). Installation and certification follow the national rules (course S3).`,
        technical: `**Self-consumption depends on timing.** A home that uses most energy in the evening exports most of its midday PV. Shifting loads to daytime, or adding a battery (hybrid), raises self-consumption. The laboratory's grid-tied example shows the export peak at midday and imports in the evening.

**Export limiting.** Where export is not allowed, the inverter must curtail its output to the site's load, using a meter at the grid connection. The energy model represents this as curtailment.

**Annual versus design month.** Grid-tied systems are sized on annual energy, unlike off-grid systems sized on the worst month: the grid absorbs seasonal surpluses and deficits.`,
        diagrams: [{ id: 'system-types', caption: 'The grid-tied architecture: no battery, export and import through the meter.' }],
        formulas: [
          { name: 'Power balance', expr: 'P_PV,AC = P_load + P_export − P_import', where: [] },
          { name: 'Annual yield', expr: 'E_year ≈ P_array × PSH × 365 × PR', where: [['PR', 'performance ratio ≈ k × η_inv', '—']] },
          { name: 'Self-sufficiency', expr: 'S = 1 − E_import / E_load', where: [] },
        ],
        examples: [
          {
            title: 'Annual yield',
            problem: 'A 4 kWp array at a site with 5.0 average peak sun hours and PR 0.8.',
            steps: ['E_year = 4 × 5.0 × 365 × 0.8', 'E_year = 5840 kWh'],
            answer: 'About 5.8 MWh per year.',
          },
          {
            title: 'A day’s import and export',
            problem: 'A home uses 12 kWh/day: 4 kWh between 09:00 and 16:00 and 8 kWh at other times. The PV produces 14 kWh, all between 09:00 and 16:00. Estimate export, import and self-sufficiency.',
            steps: ['Daytime: PV 14 kWh, load 4 kWh → export ≈ 10 kWh (ignoring short dips)', 'Night: import ≈ 8 kWh', 'Self-sufficiency = 1 − 8/12 = 33 %'],
            answer: 'Export ≈ 10 kWh, import ≈ 8 kWh, self-sufficiency ≈ 33 %, although PV exceeds the daily load.',
          },
        ],
        applications: `Rooftop systems on homes, businesses and public buildings wherever the grid is reliable and connection is permitted. The laboratory's “grid-tied home” example and its outage scenario illustrate both the energy flows and anti-islanding.`,
        mistakes: [
          { mistake: 'Promising back-up power from a grid-tied system.', correction: 'Anti-islanding stops it during outages; back-up needs storage.' },
          { mistake: 'Equating daily PV energy greater than load with independence.', correction: 'Timing matters; evening loads are still imported.' },
          { mistake: 'Connecting without the network operator’s approval.', correction: 'Grid connection requires approval and specified settings.' },
        ],
        demo: {
          title: 'Grid-tied day',
          text: 'Select the grid-tied example and watch export at midday and import in the evening; then simulate an outage on the energy tab.',
          link: to.solar('Solar laboratory: energy management with an outage', 'energy'),
          embed: 'energy-day',
        },
        activities: [to.solar('Energy management: grid outage', 'energy'), to.solar('Troubleshooting: no power during an outage', 'faults')],
        check: [
          { id: 'k1', type: 'numeric', prompt: 'Annual yield: 6 kWp, PSH 4.2, PR 0.78 (kWh)?', answer: 7174, tol: 0.01, unit: 'kWh', explain: '6 × 4.2 × 365 × 0.78 = 7174 kWh.' },
          { id: 'k2', type: 'numeric', prompt: 'Self-sufficiency with 9 kWh imported of 15 kWh load (%)?', answer: 40, tol: 0.01, unit: '%', explain: '1 − 0.6.' },
          { id: 'k3', type: 'mcq', prompt: 'During a grid outage at noon, a grid-tied system without battery…', options: ['produces nothing', 'supplies the house', 'exports', 'charges the meter'], answer: 0, explain: 'Anti-islanding.' },
          { id: 'k4', type: 'mcq', prompt: 'Grid-tied systems are usually sized on…', options: ['annual energy', 'the worst month only', 'the peak load', 'battery autonomy'], answer: 0, explain: 'The grid balances the seasons.' },
        ],
        summary: [
          'PV → grid inverter → site loads; surplus exported, deficit imported.',
          'Self-consumption and self-sufficiency depend on timing.',
          'Anti-islanding: no output during outages; protects line workers.',
          'Yield ≈ P × PSH × 365 × PR; inverter ≈ P_array / 1.1–1.3.',
          'Connection needs the network operator’s approval.',
        ],
        homework: {
          id: 'S2.M4.L2.hw',
          title: 'Grid-tied estimates',
          brief: 'A 5 kWp array, average PSH 4.6, PR 0.8; the home uses 6000 kWh/year.',
          tasks: [
            { id: 'h1', type: 'numeric', prompt: 'Annual yield (kWh)?', answer: 6716, tol: 0.01, unit: 'kWh', explain: '5 × 4.6 × 365 × 0.8 = 6716 kWh.' },
            { id: 'h2', type: 'numeric', prompt: 'Inverter AC rating at DC/AC 1.2 (kW)?', answer: 4.167, tol: 0.01, unit: 'kW', explain: '5/1.2.' },
          ],
          written: [{ prompt: 'The owner says “the system makes more than we use, so we never need the grid”. Explain why this is wrong.', model: 'Annual totals hide timing: PV produces only in daylight and more in some seasons, while the home uses energy at night and every day; without storage the home imports in the evenings and at night and exports at midday, and during outages the inverter stops entirely (anti-islanding).' }],
        },
      },
    },
    {
      id: 'S2.M4.L3',
      title: 'Hybrid systems and generator integration',
      minutes: 40,
      content: {
        objectives: [
          'Describe hybrid operating modes: self-consumption, back-up and grid charging.',
          'Integrate a generator: sizing, charger current and automatic start and stop thresholds.',
          'Explain transfer switching and why generator and grid must never be paralleled unintentionally.',
          'Configure reserve and threshold settings and check them in simulation.',
        ],
        introduction: `Hybrid systems combine PV, a battery and one or more AC sources — the grid, a generator, or both. They give the reliability of an off-grid system with the economy of grid connection, and allow a much smaller generator to run less often. Their behaviour is set by a few settings that must be chosen with care: the laboratory's clinic scenario shows what happens when one is wrong.`,
        lecture: `### Hybrid with the grid

Typical operating modes:

- **Self-consumption:** PV supplies the loads first, surplus charges the battery, then any remainder is exported (or curtailed). The battery discharges in the evening down to a **reserve** SOC.
- **Back-up:** the reserve is kept for outages. When the grid fails, the inverter isolates from the grid (anti-islanding) and supplies the backed-up loads from battery and PV.
- **Grid charging:** where useful (time-of-use tariffs, or before an expected outage), the battery is charged from the grid.

### Off-grid with a generator

The generator covers long poor-weather spells, allowing a smaller array and battery:

- **Auto-start** when the SOC falls below a threshold; **auto-stop** above a higher threshold. The gap (hysteresis) prevents frequent short runs.
- The **start threshold must be above the low-voltage disconnect**, or the loads will be shed before the generator starts.
- While running, the generator supplies the loads and the **charger**.

### Sizing the generator

- Charger current: typically about 0.1–0.2 C for lead-acid, or as the battery datasheet allows.
- Charger power: P_ch = I_ch × V_charge / η_charger.
- Generator: S ≥ 1.25 × (P_peak + P_ch) / PF, with PF 0.8 as the usual rating basis.

Running a generator at a reasonable load is also more fuel-efficient than running it lightly loaded.

### Transfer switching

Only one source may supply the AC loads at a time unless equipment is specifically designed to synchronise:

- a **[[transfer-switch|transfer switch]]** (manual or automatic, with interlocking) selects grid or generator;
- the inverter's internal transfer relay switches loads between the AC input (bypass) and its own output.

Connecting a generator to a circuit that is also connected to the grid back-feeds the network (F1.M2.L3) and can destroy the generator when the grid returns. Transfer arrangements are interlocked and installed by qualified persons.`,
        technical: `**Generator start logic in practice.** Controllers combine SOC with other conditions: a minimum run time, quiet hours, a load-power trigger (start if the load exceeds the inverter's rating for some time) and an exercise run. This course models the SOC thresholds, which are the essential design decision.

**The clinic example.** With a 50 % DoD lead-acid bank, a generator start at 20 % SOC can never trigger: the LVD sheds the loads at 50 %. Setting the start at 55 % and the stop at 90 % lets the generator run a few hours after poor days, as the energy tab shows.

**Build project H** implements a simplified hybrid inverter with a grid/generator selector relay and a transfer relay in the simulator.`,
        diagrams: [
          { id: 'hybrid-paths', caption: 'Hybrid energy paths: grid or generator selection, transfer relay, charger, battery and inverter.' },
          { id: 'system-types', caption: 'Hybrid architecture compared with off-grid and grid-tied.' },
        ],
        formulas: [
          { name: 'Charger power', expr: 'P_ch = I_ch × V_charge / η_ch', where: [] },
          { name: 'Generator rating', expr: 'S_gen ≥ 1.25 × (P_peak + P_ch) / PF', where: [['PF', 'rating power factor (0.8)', '—']] },
          { name: 'Threshold rule', expr: 'SOC_stop > SOC_start > SOC_LVD = 1 − DoD', where: [] },
        ],
        examples: [
          {
            title: 'Generator for the clinic',
            problem: 'Lead-acid bank 24 V, 800 Ah; charger current 0.15 C at 28.8 V, η 0.9; peak load 1310 W. Sizes 5, 6, 8, 10 kVA.',
            steps: ['I_ch = 0.15 × 800 = 120 A; P_ch = 120 × 28.8 / 0.9 = 3840 W', 'S = 1.25 × (1310 + 3840) / 0.8 = 8047 VA', 'Next size: 10 kVA'],
            answer: 'A 10 kVA generator; most of its load is battery charging.',
          },
          {
            title: 'Checking the thresholds',
            problem: 'The bank’s DoD is 50 %. The installer set start 20 %, stop 80 %. What happens on a long cloudy spell, and what should be set?',
            steps: ['LVD at 1 − 0.5 = 50 % SOC: loads are shed at 50 %', 'The SOC never reaches 20 %, so the generator never starts', 'Set start above 50 % (for example 55 %) and stop well above it (for example 90 %)'],
            answer: 'The clinic loses power with a working generator; correct thresholds: start 55 %, stop 90 %.',
          },
        ],
        applications: `Clinics, schools, farms and businesses on weak grids or with generator back-up; the laboratory's clinic and hybrid-home examples, the generator-threshold troubleshooting scenario and build project H.`,
        mistakes: [
          { mistake: 'Setting the generator start below the low-voltage disconnect.', correction: 'SOC_start must be above SOC_LVD.' },
          { mistake: 'Sizing the generator for the loads only.', correction: 'Include the charger’s power.' },
          { mistake: 'Connecting a generator without an interlocked transfer arrangement.', correction: 'It can back-feed the grid; use a proper transfer switch installed by a qualified person.' },
        ],
        demo: {
          title: 'Hybrid and generator energy flows',
          text: 'Run the clinic example over three poor days and watch the generator start and stop; then try the hybrid home with a grid outage.',
          link: to.solar('Solar laboratory: energy management', 'energy'),
          embed: 'energy-day',
        },
        activities: [to.build('Build project H: hybrid inverter', 'bld-h'), to.solar('Troubleshooting: generator does not start', 'faults'), to.solar('Energy management: generator scenario', 'energy')],
        check: [
          { id: 'k1', type: 'numeric', prompt: 'Charger power: 60 A at 57.6 V, η 0.9 (W)?', answer: 3840, tol: 0.01, unit: 'W', explain: '60 × 57.6 / 0.9.' },
          { id: 'k2', type: 'numeric', prompt: 'Generator for P_peak 2 kW and P_ch 3.84 kW (kVA)?', answer: 9.125, tol: 0.01, unit: 'kVA', explain: '1.25 × 5840 / 0.8 = 9125 VA.' },
          { id: 'k3', type: 'mcq', prompt: 'LiFePO₄ at 80 % DoD. Which start/stop thresholds work?', options: ['start 30 %, stop 85 %', 'start 15 %, stop 80 %', 'start 50 %, stop 40 %', 'start 10 %, stop 20 %'], answer: 0, explain: 'LVD at 20 %; start must be above it and stop above start.' },
          { id: 'k4', type: 'mcq', prompt: 'In a hybrid system the outage reserve…', options: ['is battery energy kept for grid failures', 'is exported first', 'is the generator fuel', 'is the PV curtailment'], answer: 0, explain: 'Self-consumption stops at the reserve while the grid is up.' },
        ],
        summary: [
          'Hybrid modes: self-consumption to a reserve, back-up on outage, optional grid charging.',
          'Generator: start/stop on SOC with hysteresis; start above the LVD.',
          'S_gen ≥ 1.25 × (P_peak + P_charger)/0.8.',
          'One AC source at a time: interlocked transfer switching.',
          'Check settings in simulation before commissioning.',
        ],
        homework: {
          id: 'S2.M4.L3.hw',
          title: 'Generator integration',
          brief: '48 V lead-acid bank of 400 Ah (DoD 0.5), charger 0.15 C at 57.6 V (η 0.9), peak load 2.5 kW; sizes 5, 6, 8, 10 kVA.',
          tasks: [
            { id: 'h1', type: 'numeric', prompt: 'Charger current (A)?', answer: 60, tol: 0.01, unit: 'A', explain: '0.15 × 400.' },
            { id: 'h2', type: 'numeric', prompt: 'Required generator rating (kVA)?', answer: 9.906, tol: 0.01, unit: 'kVA', explain: 'P_ch = 3840 W; 1.25 × 6340 / 0.8 = 9906 VA → 10 kVA.' },
            { id: 'h3', type: 'mcq', prompt: 'Suitable thresholds?', options: ['start 55 %, stop 90 %', 'start 40 %, stop 90 %', 'start 55 %, stop 50 %', 'start 20 %, stop 95 %'], answer: 0, explain: 'LVD 50 %: start above it, stop well above start.' },
          ],
          written: [{ prompt: 'Explain why a large generator running for 2 hours is often better than a small one running for 8.', model: 'Generators are most efficient near their rated load; a larger unit can supply the loads and a high charging current together, so the battery recharges in fewer, well-loaded hours, reducing fuel per kWh, run hours, noise and maintenance (within the battery’s charge-current limits).' }],
        },
      },
    },
    {
      id: 'S2.M4.L4',
      title: 'Energy management',
      minutes: 40,
      content: {
        objectives: [
          'State the dispatch priorities of off-grid, grid-tied and hybrid systems.',
          'Run multi-day simulations and interpret PV, load, SOC, import, export, generator and unmet energy.',
          'Evaluate a design against weather sequences and outages.',
          'Propose changes to settings, loads or equipment from simulation results.',
        ],
        introduction: `Energy management is the set of rules that decides, moment by moment, where energy comes from and where it goes. Good rules make a modest system perform well; poor rules waste energy or leave users in the dark. This lesson brings the module together in the laboratory's multi-day energy simulation, and teaches you to read it like an engineer.`,
        lecture: `### Dispatch priorities

**Off-grid**

1. PV supplies the loads.
2. Surplus PV charges the battery (up to the controller's current limit).
3. Remaining surplus is curtailed.
4. Shortfalls come from the battery down to its DoD limit.
5. If a generator is configured and SOC is below the start threshold, it supplies the loads and charges until the stop threshold.
6. Anything still unsupplied is **unmet** (loads shed).

**Grid-tied**

1. PV supplies the loads.
2. Surplus is exported (if permitted) or curtailed.
3. Shortfalls are imported.
4. During an outage: no PV output; loads unsupplied.

**Hybrid**

1. PV supplies the loads, then charges the battery, then exports (if permitted).
2. While the grid is up, the battery discharges only down to the reserve; then the grid supplies the loads.
3. During an outage, the battery (down to its DoD limit) and PV supply the backed-up loads.

### Reading a simulation

- **SOC curve:** does it recover each sunny day? How low does it go after poor days?
- **Unmet energy:** the reliability indicator for off-grid systems. Zero on design days is the minimum requirement.
- **Curtailment:** energy wasted when the battery is full; high curtailment suggests moving loads to daytime.
- **Import/export:** for grid-connected systems, the economics.
- **Generator hours and starts:** fuel, noise and maintenance.

### Improving a design

| Symptom in the simulation | Possible changes |
|---|---|
| Unmet load after two poor days | More autonomy, more PV, generator back-up, load reduction |
| SOC never recovers fully | Array too small for the design month |
| Large midday curtailment | Shift loads to daytime; smaller battery may suffice |
| Frequent short generator runs | Wider start/stop hysteresis |
| Large evening import (hybrid) | Larger battery or lower reserve |

### Limits of the model

The simulation uses clear-sky irradiance scaled by a daily weather factor, typical efficiencies and a fixed hourly load profile. Real weather is irregular, loads vary and batteries age. Simulation supports judgement; it does not replace monitoring of the real system.`,
        technical: `**Time step.** The model uses 10-minute steps. Charging power is limited by the controller rating; the battery's efficiency is split equally between charge and discharge (√η each way), so a full round trip loses η.

**Self-sufficiency** is reported as 1 − (grid import + generator energy + unmet)/load. Generator energy that charges the battery is counted against self-sufficiency on the day it runs.

**Monitoring.** Real systems log the same quantities. Comparing logged data with a simulation of the design is how degraded modules, a weak battery or a mis-set threshold are found (S2.M5.L2).`,
        diagrams: [{ id: 'energy-balance', caption: 'PV against the load: the shape of both curves decides how much energy passes through the battery.' }],
        formulas: [
          { name: 'Energy balance over a period', expr: 'E_PV + E_import + E_gen = E_load,served + E_export + E_curtailed + ΔE_battery + losses', where: [] },
          { name: 'Self-sufficiency', expr: 'S = 1 − (E_import + E_gen + E_unmet) / E_load', where: [] },
        ],
        examples: [
          {
            title: 'Reading an off-grid run',
            problem: 'A three-day run (100 %, 35 %, 80 % sun) shows: SOC 70 % → 100 % (day 1) → 41 % (morning of day 3) → 92 % (end); unmet 0; curtailed 3.1 kWh on day 1. Is the design acceptable and what would you suggest?',
            steps: ['The SOC stays above the 20 % limit and recovers: reliable for this sequence', 'Curtailment on the sunny day shows spare midday energy', 'Suggest scheduling pumping and washing for sunny middays; test a longer poor spell'],
            answer: 'Acceptable; use the surplus by shifting loads, and test a worse sequence before relying on it.',
          },
          {
            title: 'A hybrid outage',
            problem: 'A hybrid home with a 10.24 kWh battery (reserve 30 %, DoD 80 %) loses the grid at 18:00 for 6 hours with SOC 60 %. The backed-up evening load averages 600 W. Will the battery cover the outage?',
            steps: ['Energy needed ≈ 0.6 kW × 6 h / 0.9 (inverter) ≈ 4.0 kWh', 'Available from 60 % down to the 20 % DoD limit = 0.4 × 10.24 = 4.1 kWh', '4.1 ≥ 4.0: just enough'],
            answer: 'Just covered; a higher reserve or a larger battery would give margin.',
          },
        ],
        applications: `Every system design is checked in the energy simulation before it is considered complete; the S2 practical requires a recorded simulation. Operators use the same reasoning to set reserves, thresholds and load schedules.`,
        mistakes: [
          { mistake: 'Judging a design from a single sunny day.', correction: 'Test sequences of poor days and, for hybrids, outages.' },
          { mistake: 'Ignoring curtailment.', correction: 'It is wasted energy that load shifting can recover.' },
          { mistake: 'Treating simulation results as guarantees.', correction: 'They are estimates under assumed weather and loads; monitor the real system.' },
        ],
        demo: {
          title: 'Energy management simulation',
          text: 'Pick a system, set three days of weather and the starting state of charge, and read every energy flow and total.',
          link: to.solar('Solar laboratory: energy management', 'energy'),
          embed: 'energy-day',
        },
        activities: [to.solar('Energy management: run and record a simulation', 'energy')],
        check: [
          { id: 'k1', type: 'numeric', prompt: 'Self-sufficiency: load 30 kWh, import 6, generator 0, unmet 0 (%)?', answer: 80, tol: 0.01, unit: '%', explain: '1 − 6/30.' },
          { id: 'k2', type: 'mcq', prompt: 'Off-grid simulation shows unmet energy on day 3 of a cloudy spell. A first remedy to consider is…', options: ['more autonomy, more PV, a generator or fewer loads', 'a larger inverter', 'longer cables', 'a lower DoD limit'], answer: 0, explain: 'Energy, not power, is short.' },
          { id: 'k3', type: 'mcq', prompt: 'In a hybrid with the grid up, the battery discharges…', options: ['down to the reserve, then the grid supplies the loads', 'to empty', 'never', 'only at noon'], answer: 0, explain: 'The reserve is kept for outages.' },
          { id: 'k4', type: 'numeric', prompt: 'Usable energy from 70 % to 20 % of 12 kWh (kWh)?', answer: 6, tol: 0.01, unit: 'kWh', explain: '0.5 × 12.' },
        ],
        summary: [
          'Off-grid: PV → loads → battery → curtail; then battery → generator → unmet.',
          'Grid-tied: PV → loads → export; import shortfalls; nothing in outages.',
          'Hybrid: self-consumption to a reserve; back-up from the battery in outages.',
          'Read SOC, unmet, curtailment, import/export and generator hours.',
          'Test poor-weather sequences and outages; simulations are estimates.',
        ],
        homework: {
          id: 'S2.M4.L4.hw',
          title: 'Evaluate a design',
          brief: 'Run the “Off-grid rural home” example in the laboratory for three days with 100 %, 20 % and 20 % sun, starting at 70 % SOC.',
          tasks: [
            { id: 'h1', type: 'mcq', prompt: 'With two days of autonomy, would you expect load to be shed by the end of day 3?', options: ['Possibly: two very poor days after only a partial recharge can approach the DoD limit; run it and see', 'Never', 'Always on day 1', 'Only if the inverter is too small'], answer: 0, explain: 'Each 20 % day drains about 80 % of a day’s energy.' },
          ],
          written: [{ prompt: 'Report the minimum SOC and any unmet energy from your run, and propose one change to the design or its operation, justifying it from the results.', model: 'A sample answer reports the lowest SOC and unmet kWh read from the energy tab; if load was shed, a justified change is adding autonomy (a third battery string) or a generator with a start threshold above the LVD; if not, shifting the pump to midday to use curtailed energy.' }],
        },
      },
    },
  ],
  quiz: {
    pass: 0.7,
    questions: [
      { id: 'q1', type: 'mcq', prompt: 'In an off-grid system, when the battery is full the controller…', options: ['curtails PV to what the loads need', 'exports', 'disconnects the loads', 'starts the generator'], answer: 0, explain: 'No export path.' },
      { id: 'q2', type: 'numeric', prompt: 'Annual yield: 3 kWp, PSH 5.5, PR 0.8 (kWh)?', answer: 4818, tol: 0.01, unit: 'kWh', explain: '3 × 5.5 × 365 × 0.8.' },
      { id: 'q3', type: 'mcq', prompt: 'A generator start threshold must be…', options: ['above the low-voltage disconnect level', 'below it', 'equal to the stop threshold', 'zero'], answer: 0, explain: 'Otherwise loads are shed first.' },
      { id: 'q4', type: 'numeric', prompt: 'Generator for P_peak 1.5 kW, P_ch 2.5 kW (kVA)?', answer: 6.25, tol: 0.01, unit: 'kVA', explain: '1.25 × 4000 / 0.8.' },
      { id: 'q5', type: 'mcq', prompt: 'Anti-islanding exists to…', options: ['protect people working on lines believed dead', 'save battery energy', 'improve power factor', 'reduce curtailment'], answer: 0, explain: 'Safety of line workers.' },
      { id: 'q6', type: 'numeric', prompt: 'Daily net with E_PV 6 kWh at 30 % sun and E_d 5 kWh (kWh)?', answer: -3.2, tol: 0.01, unit: 'kWh', explain: '1.8 − 5.' },
      { id: 'q7', type: 'mcq', prompt: 'Large curtailment in an off-grid simulation suggests…', options: ['shifting loads to sunny hours', 'adding more modules', 'raising the DoD', 'removing the battery'], answer: 0, explain: 'Use the surplus.' },
      { id: 'q8', type: 'mcq', prompt: 'A transfer switch ensures…', options: ['only one AC source supplies the loads at a time', 'the battery charges faster', 'PV is always exported', 'the generator runs continuously'], answer: 0, explain: 'Prevents paralleling grid and generator.' },
    ],
  },
  assignment: {
    id: 'S2.M4.asg',
    title: 'Module assignment: energy-management study of the clinic',
    brief: 'Use the “Rural clinic with generator back-up” example in the solar laboratory (lead-acid 24 V, 800 Ah, DoD 0.5, generator 10 kVA, start 55 %, stop 90 %).',
    tasks: [
      { id: 'a1', type: 'numeric', prompt: 'Usable battery energy at 24 V (kWh)?', answer: 9.6, tol: 0.01, unit: 'kWh', explain: '24 × 800 × 0.5 = 9.6 kWh.' },
      { id: 'a2', type: 'numeric', prompt: 'Battery energy between start (55 %) and LVD (50 %) (kWh)?', answer: 0.96, tol: 0.01, unit: 'kWh', explain: '0.05 × 19.2.' },
      { id: 'a3', type: 'mcq', prompt: 'At an average evening load of 400 W from the battery, about how long between generator start and LVD?', options: ['About 2 hours', 'About 10 minutes', 'About 24 hours', 'It never reaches LVD'], answer: 0, explain: '0.96 kWh / ~0.44 kW ≈ 2 h; the generator starts at 55 %, so it normally prevents LVD.' },
    ],
    written: [{ prompt: 'Run three days at 30 % sun from 60 % SOC, report generator starts, hours and unmet energy, and then repeat with start 20 %. Explain the difference.', model: 'With start 55 %, the generator starts once or twice, runs a few hours each time and no load is shed. With start 20 %, it never starts because the LVD disconnects the loads at 50 %: several kWh are not supplied. The start threshold must be above the LVD.' }],
  },
  practicals: [
    { id: 'S2.M4.P1', title: 'Solar laboratory: multi-day energy-management simulation', description: 'Run and record a multi-day energy simulation of a design and interpret its results.', link: to.solar('Energy management', 'energy'), evidence: { kind: 'activity', id: 'solar:sim' } },
    { id: 'S2.M4.P2', title: 'Build project H: hybrid inverter', description: 'Design, assemble and test the hybrid inverter with grid/generator selection and transfer relay in the build laboratory.', link: to.build('Build project H', 'bld-h'), evidence: { kind: 'project', id: 'bld-h' } },
    {
      id: 'S2.M4.P3',
      title: 'Generator integration assessment',
      description: 'Size a generator and set its thresholds. All answers must be correct.',
      task: {
        id: 's2-generator',
        kind: 'calc',
        title: 'Generator back-up',
        brief: 'Off-grid 48 V LiFePO₄ bank of 300 Ah, DoD 0.8; charger 0.2 C at 55.2 V, η 0.9; peak load 2.4 kW. Generator sizes 5, 6, 8, 10 kVA (PF 0.8 rating basis).',
        questions: [
          { id: 'c1', type: 'numeric', prompt: 'Charger current (A)?', answer: 60, tol: 0.001, unit: 'A', explain: '0.2 × 300.' },
          { id: 'c2', type: 'numeric', prompt: 'Charger power (W)?', answer: 3680, tol: 0.01, unit: 'W', explain: '60 × 55.2 / 0.9 = 3680 W.' },
          { id: 'c3', type: 'numeric', prompt: 'Required generator rating (kVA)?', answer: 9.5, tol: 0.01, unit: 'kVA', explain: '1.25 × 6080 / 0.8 = 9500 VA.' },
          { id: 'c4', type: 'numeric', prompt: 'Chosen size (kVA)?', answer: 10, tol: 0.001, unit: 'kVA', explain: 'Next size.' },
          { id: 'c5', type: 'numeric', prompt: 'Low-voltage disconnect SOC (%)?', answer: 20, tol: 0.001, unit: '%', explain: '1 − 0.8.' },
          { id: 'c6', type: 'mcq', prompt: 'Thresholds?', options: ['start 30 %, stop 90 %', 'start 15 %, stop 90 %', 'start 30 %, stop 25 %', 'start 90 %, stop 30 %'], answer: 0, explain: 'Start above the LVD; stop above start.' },
        ],
        explain: 'The generator supplies the loads and the charger together with margin; the start threshold sits above the low-voltage disconnect and the stop threshold well above it.',
      },
      evidence: { kind: 'task', id: 's2-generator' },
    },
  ],
}
