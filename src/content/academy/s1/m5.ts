import type { AcademyModule } from '../types'
import { to } from './links'

/** S1.M5 Solar and hybrid architectures (projects G, H); extended by course S2 in Phase 7. */
export const S1_M5: AcademyModule = {
  id: 'S1.M5',
  title: 'Solar and hybrid architectures',
  summary: 'Inverters that manage more than one energy source: a solar inverter with an MPPT charge stage, and a hybrid inverter that selects between grid, generator and battery. The focus is on energy paths: which source supplies which load, through which components, and when.',
  lessons: [
    {
      id: 'S1.M5.L1',
      title: 'The solar inverter: PV input, MPPT stage and battery charging (project G)',
      minutes: 50,
      legacyId: 'bld-g',
      content: {
        objectives: [
          'Describe the I–V and P–V curves of a PV array and locate the maximum-power point.',
          'Explain how a buck converter’s duty cycle sets the PV operating voltage.',
          'Calculate the MPPT duty, the charge current and the PV fuse and voltage ratings.',
          'Trace the two energy paths of a solar inverter and explain how the battery decouples them.',
        ],
        introduction: `A solar inverter adds a second source to the battery inverter: a [[pv]] array. The array cannot connect straight to the battery. Its best operating voltage is well above the battery voltage, and it changes with light and temperature. A DC-DC converter, the [[mppt]] stage, sits between them and holds the array at the voltage where it delivers most power. Two energy paths then share the battery: PV → battery during the day, and battery → load whenever the load runs.`,
        lecture: `### The PV array as a source

A solar cell is a large-area diode that generates current when light falls on it. An array of cells in series and parallel behaves like:

- a **current source** at low voltage: about the short-circuit current [[isc|I_sc]], proportional to irradiance;
- with its current **collapsing** as the voltage approaches the open-circuit voltage [[voc|V_oc]].

Power P = V·I is zero at both ends and has a maximum, the **maximum-power point (MPP)**, at the knee of the curve. For crystalline silicon, V_mp is typically about 0.8·V_oc.

> **Simplified model.** Project G models the array as a current source I_sc up to a knee at 0.8·V_oc, with the current then falling linearly to zero at V_oc. This places the MPP exactly at the knee: P_mp ≈ 0.8·V_oc·I_sc. A real curve is rounded, with I_mp ≈ 0.9–0.95·I_sc. Course S2 (Phase 7) introduces the single-diode model with irradiance and temperature.

### Setting the PV voltage with a buck converter

A buck converter steps a higher voltage down: in steady state, V_out = D·V_in. Here the output is clamped by the battery, so the relation works the other way round:

V_pv = V_bat / D

The duty D therefore *sets the PV operating voltage*:

| Duty | PV voltage | Result |
|---|---|---|
| Too high | Low, close to the battery voltage | The array works low on its curve: full current, little voltage |
| Too low | Above the knee | The current collapses |
| D = V_bat / V_mp | At V_mp | Maximum power |

Project G lets you choose D by hand and see the PV power. Its MPPT test passes when the array delivers at least 90 % of its maximum. An automatic tracker that perturbs D and observes the power (perturb-and-observe) arrives in Phase 7.

### Charge current

Power is conserved through the buck (less its losses), so the battery receives I_charge ≈ η·P_pv / V_bat. A real charge controller also limits the charge current and voltage to the battery's requirements: bulk, absorption and float stages (course P5).

### Ratings on the PV side

- **Voltage.** The open-circuit voltage *rises* in the cold (roughly 0.3 %/°C for silicon, typical). Equipment must be rated above the cold V_oc; this course uses 1.15 × V_oc.
- **PV fuse.** Current is limited by I_sc, which can exceed its rated value in bright, reflective conditions. Practice rates PV conductors and fuses at 1.25 × 1.25 = 1.56 × I_sc.
- **Isolation.** A PV array cannot be switched off while lit: a DC isolator is required (lesson S1.M1.L1).

### Two energy paths

| Path | Route | When |
|---|---|---|
| **Charging** | PV → buck MPPT → battery | Daytime |
| **Supply** | Battery → fuse → H-bridge → filter → transformer → load | Whenever the load runs |

The battery buffers the difference between the two. At noon the PV may supply the load and charge the battery at the same time. At night the battery supplies everything.`,
        technical: `**Why MPPT and not a direct connection?** Connected straight to a 24 V battery, a 44 V V_oc array would be held at about 25 V: full current but only 25/35 of its MPP voltage. That is roughly 70 % of the available power. A PWM charge controller, which is essentially a switch, does exactly this. An MPPT controller recovers the difference.

**Buck ripple.** The buck stage switches at 5 kHz in project G. Its inductor LM and capacitor CM smooth the currents, using the same principles as the output filter (lesson S1.M3.L4).

**Simulation time step.** The MPPT switching at 5 kHz alongside the 50 Hz inverter requires a 1 µs time step, which makes project G one of the slower suites.`,
        diagrams: [
          { id: 'pv-curve', caption: 'Simplified I–V and P–V curves of the PV array, with the operating point set by the buck duty.' },
          { id: 'solar-paths', caption: 'Energy paths of the solar inverter.' },
        ],
        formulas: [
          { name: 'Maximum-power point (simplified model)', expr: 'V_mp ≈ 0.8 · V_oc,  P_mp ≈ V_mp · I_sc', where: [['V_oc', 'open-circuit voltage', 'V'], ['I_sc', 'short-circuit current', 'A']] },
          { name: 'PV voltage set by the buck duty', expr: 'V_pv = V_bat / D,  D_mp = V_bat / V_mp', where: [['D', 'buck duty cycle', '—']] },
          { name: 'Charge current', expr: 'I_charge ≈ η · P_pv / V_bat', where: [['η', 'MPPT stage efficiency', '—']] },
          { name: 'PV ratings', expr: 'V_rating ≥ 1.15 · V_oc,  I_fuse ≥ 1.56 · I_sc', where: [] },
        ],
        examples: [
          {
            title: 'MPPT duty for project G',
            problem: 'V_oc = 44 V, I_sc = 10 A, V_bat = 24 V. Find V_mp, P_mp, the MPPT duty and the ideal charge current.',
            steps: ['V_mp = 0.8 × 44 = 35.2 V;  P_mp = 35.2 × 10 = 352 W', 'D = 24 / 35.2 = 0.682 (68 %)', 'I_charge ≈ 352 / 24 = 14.7 A (ideal, before losses)'],
            answer: 'D ≈ 0.68 gives the full 352 W and about 14.7 A of charge current.',
          },
          {
            title: 'A badly set duty',
            problem: 'In troubleshooting task G the duty is 0.95. What PV voltage results, and what power?',
            steps: ['V_pv = 24/0.95 = 25.3 V (below the 35.2 V knee, so I = I_sc = 10 A)', 'P = 25.3 × 10 = 253 W'],
            answer: '253 W, only 72 % of the 352 W available, which is exactly what the project G MPPT test measures for the fault.',
          },
        ],
        applications: `Off-grid solar systems in homes, schools, clinics and telecom sites use exactly this architecture: PV array → MPPT charge controller → battery → inverter. In "all-in-one" solar inverters the MPPT stage and the inverter share one enclosure and one controller.`,
        mistakes: [
          { mistake: 'Connecting a PV array directly to the battery “because the voltage is higher”.', correction: 'The battery clamps the array far below its MPP; an MPPT stage recovers the lost power.' },
          { mistake: 'Rating the PV input for the nominal V_oc.', correction: 'V_oc rises in the cold; rate for at least 1.15 × V_oc, and check the actual module datasheet and local minimum temperature.' },
          { mistake: 'Treating the simplified PV curve as real data.', correction: 'It is an educational model with a sharp knee; real modules have a rounded curve given in their datasheets.' },
        ],
        demo: {
          title: 'Find the maximum-power point',
          text: 'In project G, change the MPPT duty in steps from 0.4 to 0.9 and record the PV voltage, current and power each time. Plot P against D and find the maximum.',
          link: to.build('Open project G', 'bld-g'),
        },
        activities: [to.lib('Solar (PV) input', 'solar-input'), to.lab3d('LF-3K PV input terminals', 'lf3k', 'pv-pos'), to.proc('PV open-circuit voltage test', 'solar-input', 'pv-voc')],
        check: [
          { id: 'k1', type: 'numeric', prompt: 'MPPT duty for V_mp = 70 V and a 48 V battery?', answer: 0.686, tol: 0.01, unit: '', explain: '48/70 = 0.686.' },
          { id: 'k2', type: 'numeric', prompt: 'PV fuse for I_sc = 9 A, using 1.56 × I_sc (A)?', answer: 14.04, tol: 0.01, unit: 'A', explain: '1.56 × 9 = 14.0 A → next standard size 15 A.' },
          { id: 'k3', type: 'mcq', prompt: 'Increasing the buck duty in an MPPT stage…', options: ['lowers the PV operating voltage', 'raises the PV voltage', 'has no effect', 'reverses the current'], answer: 0, explain: 'V_pv = V_bat/D.' },
          { id: 'k4', type: 'mcq', prompt: 'Which energy path supplies the load at night?', options: ['Battery → inverter → load', 'PV → load', 'PV → battery', 'Grid → PV'], answer: 0, explain: 'The battery stores the day’s PV energy.' },
        ],
        summary: [
          'A PV array is a current source up to its knee; power peaks at the MPP (≈ 0.8·V_oc for silicon).',
          'A buck MPPT stage clamped by the battery sets V_pv = V_bat/D; D_mp = V_bat/V_mp.',
          'Charge current ≈ η·P_pv/V_bat; real controllers also apply charge profiles.',
          'Rate the PV side above the cold V_oc and fuse at 1.56·I_sc; fit a DC isolator.',
          'Two energy paths (PV → battery, battery → load) are decoupled by the battery.',
        ],
        homework: {
          id: 'S1.M5.L1.hw',
          title: 'Solar design for a 48 V system',
          brief: 'Two arrays in parallel, each V_oc = 88 V, I_sc = 8 A. Battery 48 V. Simplified model.',
          tasks: [
            { id: 'h1', type: 'numeric', prompt: 'Combined P_mp (W)?', answer: 1126.4, tol: 0.01, unit: 'W', explain: 'V_mp = 70.4 V; I_sc = 16 A; P = 70.4 × 16 = 1126 W.' },
            { id: 'h2', type: 'numeric', prompt: 'MPPT duty?', answer: 0.682, tol: 0.01, unit: '', explain: '48/70.4 = 0.682.' },
            { id: 'h3', type: 'numeric', prompt: 'Minimum PV input voltage rating with 1.15 × V_oc (V)?', answer: 101.2, tol: 0.01, unit: 'V', explain: '1.15 × 88 = 101.2 V.' },
          ],
          written: [{ prompt: 'Explain why, with a 48 V battery charging at 57.6 V, the buck MPPT stage still works with these arrays but would not with arrays of V_oc = 60 V.', model: 'A buck can only step down: V_pv must exceed V_bat. Here V_mp = 70.4 V > 57.6 V, so the duty stays below 1 (0.82). With V_oc = 60 V, V_mp = 48 V would be below the charging voltage, and the buck could not hold the array at its MPP (a boost or buck-boost stage would be needed).' }],
        },
      },
    },
    {
      id: 'S1.M5.L2',
      title: 'The hybrid inverter: grid, generator, transfer switching and energy paths (project H)',
      minutes: 55,
      legacyId: 'bld-h',
      content: {
        objectives: [
          'Identify the energy paths of a hybrid inverter and the operating mode in which each is used.',
          'Explain source selection and load transfer with relays, and why the AC sources must never be paralleled in this design.',
          'Calculate the input current, charger power and transfer-relay rating for a hybrid design.',
          'Run project H in grid and backup modes, and diagnose a transfer fault.',
        ],
        introduction: `A hybrid inverter manages several sources: the grid, a generator, the battery, and in Phase 7 the PV array. It decides at every moment which source supplies the load and whether the battery is charging or discharging. The engineering problem is one of *routing*, done safely: two unsynchronised AC sources must never be connected together.`,
        lecture: `### The energy paths

| Path | Route | Mode |
|---|---|---|
| **Grid → load (bypass)** | Grid → breaker CBG → K2 (normally closed, NC) → K1 (NC) → load | Grid available: the load is supplied directly |
| **Grid → battery (charging)** | Grid → K2 → charger (T2, D1–D4, RC) → battery | Grid available: the battery charges at the same time |
| **Battery → load (backup)** | Battery → fuse → H-bridge → filter → transformer → K1 (normally open, NO) → load | Grid lost: the inverter supplies the load |
| **Generator → load** | Generator → breaker CBN → K2 (NO) → K1 (NC) → load | Grid lost and generator running: K2 selects the generator |
| **PV → battery or load** | Via an MPPT stage | Phase 7 |

### Source selection and transfer

Two relays route the energy:

- **K2, the source selector**, chooses grid (NC) or generator (NO) as "the AC input".
- **K1, the [[transfer-switch]]**, connects the load either to the AC input (NC) or to the inverter (NO).

A changeover relay's contacts are mutually exclusive by construction: the load can never be connected to both sides at once. A transfer controller (GK1 and GK2 in project H) energises the coils.

### Why never parallel the sources (here)

The grid and the inverter are both voltage sources. Unless they are synchronised in frequency, phase and amplitude, connecting them together drives a huge current between them. Grid-tied inverters *do* connect to the grid, but only after synchronising, with current control and certified [[anti-islanding]] protection. That is specialist territory (course S2). Project H uses strict changeover.

### Transfer time

Relays take time to move, typically 10–20 ms (about one cycle at 50 Hz). Most loads ride through that; computers usually do. Online UPS designs, in which the inverter always supplies the load, avoid any transfer gap.

### The charger (simplified)

Project H charges from the AC input through:

1. a step-down transformer T2;
2. a bridge rectifier D1–D4;
3. a current-limiting resistor RC.

It is an *educational simplification*: current flows only near the AC peaks, and the resistor wastes power. Real hybrid inverters charge through their bidirectional bridge, or a dedicated converter, with constant-current/constant-voltage control (course P5, Phase 7).

### Sizing

- The **grid input** must carry the load *plus* the charger: I_grid ≈ (P_load + P_charge/η_ch) / V_grid.
- The **transfer relay contacts** must carry the full load current with margin (1.25×), at mains voltage.
- **Each input** has its own breaker, and the neutrals are common and bonded to earth (in this simplified model).`,
        technical: `**Detecting grid loss.** The controller monitors the AC input voltage and frequency, and declares the grid lost when either leaves a window. Thresholds are set by the product and by local rules. It then starts the inverter, if it is not already running, and energises K1.

**Return to grid.** When the grid returns, the controller waits for it to be stable before transferring back. The transfer back to the grid also happens through a changeover, so the inverter and grid are never paralleled.

**What project H simulates.** The test suite runs:

- **grid mode:** grid on; the load is supplied and the battery charges;
- **generator mode:** grid off, generator on; K2 energised;
- **backup mode:** both off; K1 energised, the inverter supplies the load.

It then runs the inverter tests in backup mode. The relays are driven by static controllers set per test, not by a detection algorithm.`,
        diagrams: [
          { id: 'hybrid-paths', caption: 'The four energy paths of the hybrid inverter, and the relay positions that select them.' },
          { id: 'schematic:bld-h', caption: 'Project H as assembled.' },
        ],
        formulas: [
          { name: 'Grid input current', expr: 'I_grid ≈ (P_load + P_charge / η_ch) / V_grid', where: [['P_charge', 'charging power', 'W'], ['η_ch', 'charger efficiency', '—']] },
          { name: 'Charging power', expr: 'P_charge = I_charge · V_charge', where: [['V_charge', 'battery charging voltage', 'V']] },
          { name: 'Transfer relay rating', expr: 'I_contact ≥ 1.25 · I_out', where: [] },
        ],
        examples: [
          {
            title: 'Grid input for project H',
            problem: '500 W load, battery charging at 10 A at 28.8 V, charger efficiency 85 %, 230 V grid. Find the charging power, the grid current and the relay contact rating.',
            steps: ['P_charge = 10 × 28.8 = 288 W', 'Grid power = 500 + 288/0.85 = 500 + 339 = 839 W', 'I_grid = 839/230 = 3.65 A', 'Relay contacts ≥ 1.25 × (500/230) = 2.72 A for the load path; the input path carries 3.65 A, so ≥ 4.6 A'],
            answer: 'The grid supplies about 3.7 A. Relay K2, in the input path, needs a higher contact rating than K1.',
          },
          {
            title: 'What the grid-mode test shows',
            problem: 'Project H’s grid test reports 229.7 V and 498.9 W at the load and a mean battery charge current of 2.06 A, against a design figure of 10 A. Explain the difference.',
            steps: ['The simplified charger conducts only near the AC peaks, when the rectified voltage exceeds the battery voltage', 'Its resistor limits the peak current to about 2 × I_charge, so the mean over a cycle is much less than the design figure', 'The criterion (> 0.5 A) only checks that energy flows in the charging path'],
            answer: 'The load is supplied correctly and the battery is charging, but the simplified charger delivers about a fifth of the design current. A real CC/CV charger (Phase 7) controls the current properly.',
          },
        ],
        applications: `Hybrid inverters with grid, generator and PV inputs are the backbone of backup power in regions with unreliable grids. Homes, schools, hospitals and businesses use them to ride through outages and to reduce generator running hours.`,
        mistakes: [
          { mistake: 'Connecting the generator and the grid to the same bus “for redundancy”.', correction: 'Unsynchronised AC sources must never be paralleled; use a changeover (K2).' },
          { mistake: 'Sizing the grid input for the load only.', correction: 'The charger draws power at the same time; add it.' },
          { mistake: 'Believing the transfer is instantaneous.', correction: 'Relays take 10–20 ms; sensitive loads may need an online UPS.' },
        ],
        demo: {
          title: 'Run all three modes',
          text: 'Build project H and run its grid, generator and backup tests. For each, follow the energy path on the diagram and identify the relay positions. Then run the troubleshooting task, in which the transfer relay is not driven.',
          link: to.build('Open project H', 'bld-h'),
        },
        activities: [to.lib('Relay', 'relay'), to.lab3d('LF-3K transfer relay', 'lf3k', 'k1'), to.cmp('Relay versus semiconductor switch', 'relay-vs-semiconductor'), to.proc('Relay coil and contacts test', 'relay', 'relay-coil-contacts')],
        check: [
          { id: 'k1', type: 'mcq', prompt: 'In backup mode, K1 is…', options: ['energised, connecting the load to the inverter (NO)', 'de-energised, connecting the load to the grid', 'open on both sides', 'shorting the grid to the inverter'], answer: 0, explain: 'K1 changes over to the inverter output.' },
          { id: 'k2', type: 'numeric', prompt: 'Grid current: 800 W load plus 400 W charging at η = 0.8, 230 V (A)?', answer: 5.65, tol: 0.01, unit: 'A', explain: '(800 + 500)/230 = 5.65 A.' },
          { id: 'k3', type: 'mcq', prompt: 'Why must the grid and inverter not be connected together in this design?', options: ['They are unsynchronised voltage sources: a large current would flow between them', 'The battery would discharge', 'It would trip the RCD', 'It is allowed'], answer: 0, explain: 'Only synchronised, current-controlled, certified grid-tie inverters may connect to the grid.' },
          { id: 'k4', type: 'mcq', prompt: 'During a grid failure the load goes dark although the inverter runs. The most likely fault is…', options: ['K1’s coil is not driven, so the load stays on the dead AC input', 'The charger diodes are reversed', 'The battery fuse has blown', 'The filter capacitor is open'], answer: 0, explain: 'K1 remains on NC.' },
        ],
        summary: [
          'Hybrid inverters route energy along paths: grid → load, grid → battery, battery → load, generator → load (and PV in Phase 7).',
          'K2 selects the AC source; K1 transfers the load between the AC input and the inverter.',
          'Changeover contacts are mutually exclusive: unsynchronised sources are never paralleled.',
          'Size the grid input for load plus charger; transfer takes 10–20 ms.',
          'Project H’s charger is a simplified model; real ones use CC/CV control.',
        ],
        homework: {
          id: 'S1.M5.L2.hw',
          title: 'Hybrid system for a school computer room',
          brief: '1500 W of computers (PF 0.9), 48 V battery charging at 20 A at 57.6 V, charger η = 0.9, 230 V grid.',
          tasks: [
            { id: 'h1', type: 'numeric', prompt: 'Apparent power of the load (VA)?', answer: 1666.7, tol: 0.01, unit: 'VA', explain: '1500/0.9 = 1667 VA.' },
            { id: 'h2', type: 'numeric', prompt: 'Charging power (W)?', answer: 1152, tol: 0.01, unit: 'W', explain: '20 × 57.6 = 1152 W.' },
            { id: 'h3', type: 'numeric', prompt: 'Grid current, treating the load as 1667 VA and adding charger power/η (A)?', answer: 12.81, tol: 0.03, unit: 'A', explain: '(1667 + 1280)/230 = 12.8 A (approximation adding VA and W).' },
          ],
          written: [{ prompt: 'Computers can tolerate about 10–20 ms of interruption. Would you recommend a transfer-relay hybrid or an online design? Explain.', model: 'A relay hybrid usually works (most computer power supplies hold up for 10–20 ms), but the margin is small. For critical computers an online design (inverter always supplying, grid feeding the charger/rectifier) avoids any transfer gap, at the cost of continuous conversion losses.' }],
        },
      },
    },
  ],
  quiz: {
    pass: 0.7,
    questions: [
      { id: 'q1', type: 'numeric', prompt: 'P_mp of a V_oc = 44 V, I_sc = 10 A array in the simplified model (W)?', answer: 352, tol: 0.01, unit: 'W', explain: '0.8 × 44 × 10.' },
      { id: 'q2', type: 'numeric', prompt: 'PV voltage with a 24 V battery and D = 0.6 (V)?', answer: 40, tol: 0.01, unit: 'V', explain: '24/0.6 = 40 V.' },
      { id: 'q3', type: 'mcq', prompt: 'A PV array cannot be made safe by…', options: ['switching off the inverter only', 'opening its DC isolator', 'covering it completely', 'disconnecting and proving dead'], answer: 0, explain: 'A lit array still generates; it must be isolated.' },
      { id: 'q4', type: 'mcq', prompt: 'In generator mode of project H, K2 is…', options: ['energised (NO: generator)', 'de-energised (NC: grid)', 'open', 'shorted'], answer: 0, explain: 'K2 selects the generator when energised.' },
      { id: 'q5', type: 'mcq', prompt: 'Why is V_oc rated with a 1.15 factor?', options: ['V_oc rises in cold weather', 'V_oc falls in the cold', 'For the fuse', 'For the battery'], answer: 0, explain: 'Silicon cell voltage increases as temperature falls.' },
      { id: 'q6', type: 'numeric', prompt: 'Grid current for a 1000 W load and 300 W charging at η = 0.75, 230 V (A)?', answer: 6.09, tol: 0.01, unit: 'A', explain: '(1000 + 400)/230 = 6.09 A.' },
      { id: 'q7', type: 'mcq', prompt: 'Which statement about project H’s charger is true?', options: ['It is a simplified model; real chargers use CC/CV control', 'It is a certified charger design', 'It charges at exactly 10 A', 'It needs no transformer'], answer: 0, explain: 'The resistor-limited charger is for illustrating the energy path only.' },
      { id: 'q8', type: 'multi', prompt: 'Which paths exist in project H? (select all)', options: ['Grid → load', 'Grid → battery', 'Battery → load', 'PV → battery'], answers: [0, 1, 2], explain: 'PV is added in Phase 7.' },
    ],
  },
  assignment: {
    id: 'S1.M5.asg',
    title: 'Module assignment: daily energy balance of a solar inverter',
    brief: 'A 352 W (P_mp) array gets 5 peak-sun-hours a day. The load is 500 W for 3 h each evening. MPPT efficiency 95 %, inverter efficiency 92 %, battery round-trip efficiency 85 %.',
    tasks: [
      { id: 'a1', type: 'numeric', prompt: 'PV energy into the battery per day (Wh)?', answer: 1672, tol: 0.01, unit: 'Wh', explain: '352 × 5 × 0.95 = 1672 Wh.' },
      { id: 'a2', type: 'numeric', prompt: 'Energy the inverter must take from the battery for the load (Wh)?', answer: 1630.4, tol: 0.01, unit: 'Wh', explain: '500 × 3 / 0.92 = 1630 Wh.' },
      { id: 'a3', type: 'numeric', prompt: 'Energy that must be charged, allowing for battery efficiency (Wh)?', answer: 1918.1, tol: 0.01, unit: 'Wh', explain: '1630/0.85 = 1918 Wh.' },
    ],
    written: [{ prompt: 'Is the array large enough? If not, by how much should it be increased?', model: 'No: 1672 Wh is available but 1918 Wh is needed. The array should be increased by 1918/1672 = 1.15×, i.e. at least about 405 W, plus a margin for cloudy days.' }],
  },
  practicals: [
    { id: 'S1.M5.P1', title: 'Build project G', description: 'Assemble the solar inverter, set the MPPT duty and pass its test suite.', link: to.build('Project G', 'bld-g'), evidence: { kind: 'project', id: 'bld-g' } },
    { id: 'S1.M5.P2', title: 'Build project H', description: 'Assemble the hybrid inverter and pass its grid, generator and backup tests.', link: to.build('Project H', 'bld-h'), evidence: { kind: 'project', id: 'bld-h' } },
  ],
}
