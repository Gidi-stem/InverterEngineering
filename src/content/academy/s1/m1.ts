import type { AcademyModule } from '../types'
import { to } from './links'

/** S1.M1 Design method and construction safety. */
export const S1_M1: AcademyModule = {
  id: 'S1.M1',
  title: 'Design method and construction safety',
  summary: 'How an inverter design is taken from a requirement to a specification, with every current, loss, rating and protection device calculated and explained, and the safety principles that apply to every construction project.',
  lessons: [
    {
      id: 'S1.M1.L1',
      title: 'Safety in inverter construction',
      minutes: 40,
      content: {
        objectives: [
          'Identify the four energy hazards in an inverter: battery short-circuit current, mains-voltage output, high-voltage DC bus and stored capacitor energy.',
          'Calculate the energy stored in a capacitor bank and the time a bleeder resistor needs to discharge it.',
          'Explain how isolation, overcurrent protection, earthing and thermal design each prevent a specific kind of harm.',
          'Distinguish an educational simulation from a certified design, and state who may build and test real mains equipment.',
        ],
        introduction: `Every project in this course ends with a circuit that, if it were built for real, could kill. The output of a mains inverter is 230 V or 110 V [[ac]] at hundreds of watts. A high-frequency inverter carries about 360 V [[dc]] inside it. Even a "harmless" 12 V battery can deliver over a thousand amperes into a short circuit. This lesson comes first because the design decisions you make later (fuse sizes, earthing, discharge resistors, heat sinks) are the engineering expression of these safety principles.

> **All mains-voltage and high-voltage work in this academy is simulated only.** The simulator lets you make mistakes safely. Real construction and testing of mains equipment must be done by qualified people, under supervision, to the standards that apply where you live.`,
        lecture: `### Why electricity is dangerous

Harm comes from **current through the body**, and the [[voltage]] determines how much current can be driven through skin and tissue. Published safety research shows that currents of tens of milliamperes through the chest can disturb the heart's rhythm. That is why an [[rcd]] trips at a residual current of about 30 mA. Mains voltage can drive such currents through a person, and a 12 V battery normally cannot. That is why low-voltage DC is treated as "extra-low voltage". Burns and fire are different hazards, and they depend on **energy** and **current**, not on voltage. A spanner across a 12 V battery can glow red and spray molten metal.

### The four energy hazards of an inverter

1. **Battery short-circuit current.** A healthy 12 V lead-acid battery has an internal [[resistance]] of roughly 10 mΩ (a typical value; see the battery datasheet). By Ohm's law, a short circuit draws about 12 V / 0.01 Ω ≈ 1200 A. The cable heats and burns long before the battery is exhausted. The defence is a [[fuse]] placed as close to the battery positive as possible, so that it protects every wire after it.
2. **Mains-voltage output.** The secondary of the transformer (or the output of a high-voltage bridge) is at 110/230 V rms, with a [[peak]] of 155/325 V. It can deliver a lethal shock. The defences are an output [[breaker]], [[protective-earth]] bonding of the chassis and the neutral, an [[rcd]], insulation, and a closed enclosure.
3. **High-voltage DC bus.** High-frequency inverters (project F) and solar inverters create a DC bus of several hundred volts. DC does not cross zero, so an arc that forms on DC is harder to extinguish than on AC.
4. **Stored energy.** Capacitors stay charged after the power is removed, sometimes for minutes. The stored energy is E = ½·C·V². A bus bank at 360 V can store tens of joules, enough to injure. The defences are a [[bleeder]] resistor, a discharge procedure, and above all **measuring before touching**.

### The safe-isolation sequence

[[isolation|Safe isolation]] is a procedure, not a single action:

1. Switch off and **disconnect every source**: battery (open the fuse or isolator), AC input, generator and PV array. A [[pv]] array generates whenever light falls on it, so it must be isolated with its DC isolator.
2. **Secure** the disconnection against being reconnected (lock-off and a warning label).
3. **Wait** for the bleeders to discharge the capacitors, then **discharge** them through a suitable resistor if the procedure requires it.
4. **Prove dead**: test your meter on a known source, measure every conductor you will touch, then re-test the meter.

### Overcurrent, earthing and thermal protection

- **Fuses and breakers** protect *wiring* from overheating. They are sized from the normal current with a margin, and the cable must be able to carry the fuse rating.
- **Earthing** gives a fault a low-resistance path to earth, so the protection operates instead of leaving metal live.
- **Thermal design** keeps every semiconductor below its maximum [[junction-temperature]]. An overheated switch fails, often as a short circuit, and can start a fire.

### Simulation is not certification

The simulator solves the circuit equations for idealised and *typical* component models. It cannot show:

- manufacturing tolerances;
- insulation breakdown;
- creepage and clearance distances;
- electromagnetic interference;
- component ageing;
- the many fault conditions that a real product must survive.

[[certification|Certification]] of a real inverter requires testing by an accredited laboratory against the applicable standards. A design that passes every test in this course is a **successful educational design**. It is not a construction design that anyone may build and connect.`,
        technical: `**Capacitor discharge through a bleeder.** A capacitor C charged to V₀ and connected to a resistor R decays exponentially: v(t) = V₀·e^(−t/RC). The time to fall to a safe voltage V_s is t = RC·ln(V₀/V_s). One time constant (τ = RC) brings it to 37 % of V₀, and five time constants to below 1 %. Bleeders are chosen as a compromise. A smaller R discharges faster but dissipates P = V²/R continuously while the inverter runs: 360² / 100 kΩ = 1.3 W, so the resistor needs a suitable power and voltage rating.

**Why the fuse goes at the battery.** A fuse protects only the conductors *downstream* of it. A cable between the battery and a fuse placed further away is unprotected, and a short circuit on that cable is limited only by the battery's internal resistance.

**Earth bonding on the output.** In the projects, the output neutral is bonded to protective earth (and, in this simplified model, to the battery negative). A real installation follows the local earthing system (TN, TT and so on) and the manufacturer's instructions. That is specialist work, taught in course S3.

**Simplified models.** The circuit laboratory flags any circuit above 50 V DC or 25 V AC as hazardous. Those thresholds are this course's teaching rule, chosen to be conservative. Legal limits for extra-low voltage differ between countries and standards.`,
        diagrams: [{ id: 'protection-chain', caption: 'Protection chain of a battery inverter: each device protects against a specific harm.' }],
        formulas: [
          { name: 'Stored capacitor energy', expr: 'E = ½ · C · V²', where: [['E', 'stored energy', 'J'], ['C', 'capacitance', 'F'], ['V', 'capacitor voltage', 'V']] },
          { name: 'Discharge time to a safe voltage', expr: 't = R · C · ln(V₀ / V_s)', where: [['R', 'discharge (bleeder) resistance', 'Ω'], ['V₀', 'initial voltage', 'V'], ['V_s', 'safe voltage', 'V'], ['t', 'time', 's']] },
          { name: 'Prospective short-circuit current', expr: 'I_sc = V_bat / (R_int + R_wiring)', where: [['V_bat', 'battery voltage', 'V'], ['R_int', 'battery internal resistance', 'Ω'], ['R_wiring', 'resistance of the fault path', 'Ω']] },
        ],
        examples: [
          {
            title: 'Energy in two capacitor banks',
            problem: 'Compare the energy stored in (a) a 4700 µF battery-bus capacitor charged to 28.8 V and (b) a 470 µF high-voltage bus capacitor charged to 360 V.',
            steps: ['(a) E = ½ × 4700 × 10⁻⁶ F × (28.8 V)² = ½ × 0.0047 × 829.4 = 1.95 J', '(b) E = ½ × 470 × 10⁻⁶ F × (360 V)² = ½ × 0.00047 × 129 600 = 30.5 J'],
            answer: 'The 360 V capacitor stores about 30 J, roughly 16 times more than the battery-bus capacitor, at a voltage that can drive a dangerous current through the body.',
            check: 'Energy scales with V²: (360/28.8)² ≈ 156, and the capacitance is 10× smaller, so the ratio should be about 15.6. ✓',
          },
          {
            title: 'How long must you wait?',
            problem: 'The 470 µF HV bus has a 100 kΩ bleeder. How long does it take to fall from 360 V to below 50 V?',
            steps: ['τ = R·C = 100 000 Ω × 470 × 10⁻⁶ F = 47 s', 't = τ·ln(V₀/V_s) = 47 s × ln(360 / 50) = 47 × 1.974 = 92.8 s'],
            answer: 'About 93 s, i.e. over a minute and a half. Waiting is not proof, though: a failed bleeder leaves the bus charged, so always measure.',
            check: 'Two time constants give 360 × e⁻² = 48.7 V; 2τ = 94 s, consistent with 92.8 s. ✓',
          },
          {
            title: 'Battery short circuit',
            problem: 'A 12 V battery has R_int = 10 mΩ (typical). A spanner of 2 mΩ shorts its terminals. What current flows, and what power is dissipated in the spanner?',
            steps: ['I = 12 V / (0.010 + 0.002) Ω = 1000 A', 'P_spanner = I²·R = 1000² × 0.002 = 2000 W'],
            answer: '1000 A and 2 kW of heat in the spanner: it glows, welds and burns. That is why tools are insulated, rings and watches are removed, and the battery positive is fused.',
          },
        ],
        applications: `Commercial inverters apply exactly these measures:

- a DC input fuse or breaker sized from the maximum input current;
- bus bleeder resistors (in some designs, an active discharge circuit);
- a warning label giving the discharge time;
- an output breaker and RCD;
- earthing of the chassis;
- an over-temperature shut-down driven by a thermistor on the heat sink.

Installers prove dead before work and follow the manufacturer's isolation sequence. You can see the parts of this chain in the 3D laboratory: the LF-3K's fuse, breaker, earth stud and bus capacitors.`,
        mistakes: [
          { mistake: '"12 V cannot hurt me."', correction: 'It rarely causes a shock, but its short-circuit current causes severe burns and fires. Treat battery terminals with the same discipline as mains.' },
          { mistake: '"The inverter is switched off, so the capacitors are safe."', correction: 'Switching off removes the source; it does not empty the capacitors. Wait, discharge, and measure before touching.' },
          { mistake: '"A bigger fuse is safer because it will not blow."', correction: 'A fuse that never blows protects nothing. It must be the smallest standard size above the normal maximum current, and the cable must be rated for it.' },
          { mistake: '"It passed the simulation, so it is safe to build."', correction: 'Simulation proves the educational design behaves as calculated with typical models. Real equipment must be designed, built and certified by qualified people.' },
        ],
        demo: {
          title: 'Discharge a capacitor bank in the 3D laboratory',
          text: 'Open the LF-3K, follow the guided isolation and discharge procedure, and watch the bus voltage decay before the capacitors may be handled. Note the order: isolate, wait, discharge, measure.',
          link: to.lab3d('Open the LF-3K bus capacitors', 'lf3k', 'c1'),
        },
        activities: [
          to.lab3d('Locate the DC fuse and the earth stud', 'lf3k', 'fuse'),
          to.lib('Fuse: ratings and test procedure', 'fuse'),
          to.lib('Protective earth', 'protective-earth'),
          to.cmp('Fuse versus circuit breaker', 'fuse-vs-breaker'),
        ],
        check: [
          { id: 'k1', type: 'mcq', prompt: 'Where should the DC input fuse of a battery inverter be placed?', options: ['As close as possible to the battery positive', 'Next to the transformer', 'In the battery negative, after the earth bond', 'Anywhere, as long as it is in series'], answer: 0, explain: 'A fuse protects only the conductors after it, so it must be the first thing on the battery positive.' },
          { id: 'k2', type: 'numeric', prompt: 'Energy stored in a 1000 µF capacitor charged to 400 V, in joules?', answer: 80, tol: 0.02, unit: 'J', explain: 'E = ½·C·V² = 0.5 × 0.001 × 400² = 80 J.' },
          { id: 'k3', type: 'mcq', prompt: 'After switching an inverter off, what proves the capacitors are safe to touch?', options: ['Measuring them with a meter that has just been checked on a known source', 'Waiting one minute', 'The bleeder resistor', 'The display going dark'], answer: 0, explain: 'Only a measurement proves dead; bleeders can fail open.' },
          { id: 'k4', type: 'multi', prompt: 'Which of these can a simulation NOT demonstrate? (select all)', options: ['Insulation breakdown and creepage distances', 'Compliance with safety standards', 'The RMS output voltage of the model', 'Electromagnetic interference of a real layout'], answers: [0, 1, 3], explain: 'The simulator computes circuit behaviour of idealised models; insulation, standards compliance and real-layout EMI need physical testing.' },
        ],
        summary: [
          'Current through the body causes shock; energy and current cause burns and fire. Low voltage is not harmless.',
          'Inverters contain four energy hazards: battery short-circuit current, mains output, HV DC bus and stored capacitor energy.',
          'Safe isolation: disconnect every source, secure, wait/discharge, prove dead with a checked meter.',
          'Fuse at the battery positive; breaker, earth bond and RCD on the output; heat sinks sized for the losses.',
          'A simulated design is educational; certification and real construction need qualified people and physical testing.',
        ],
        homework: {
          id: 'S1.M1.L1.hw',
          title: 'Safety calculations',
          brief: 'Work out the hazards of a 48 V, 2 kW high-frequency inverter with a 680 µF, 380 V DC bus and a 150 kΩ bleeder.',
          tasks: [
            { id: 'h1', type: 'numeric', prompt: 'Stored energy in the HV bus at 380 V (J)?', answer: 49.1, tol: 0.02, unit: 'J', explain: '½ × 680 × 10⁻⁶ × 380² = 49.1 J.' },
            { id: 'h2', type: 'numeric', prompt: 'Time for the bleeder to discharge it to 50 V (s)?', answer: 206.9, tol: 0.03, unit: 's', explain: 'τ = 150 000 × 680 × 10⁻⁶ = 102 s; t = 102 × ln(380/50) = 102 × 2.028 = 206.9 s.' },
            { id: 'h3', type: 'numeric', prompt: 'Continuous power dissipated in the bleeder at 380 V (W)?', answer: 0.963, tol: 0.03, unit: 'W', explain: 'P = V²/R = 380² / 150 000 = 0.963 W, so a resistor rated at least 2 W (and for the voltage) is appropriate.' },
          ],
          written: [{ prompt: 'Write the safe-isolation sequence you would follow before touching the HV bus of this inverter, naming every source to disconnect.', model: 'Switch off; open the battery fuse/isolator; isolate the AC input and any generator; open the PV DC isolator if fitted; lock off and label; wait at least the calculated discharge time (≈ 3.5 min); test the meter on a known source; measure the HV bus (+ to −, and each rail to earth); measure the battery-side bus; re-test the meter; only then work, using insulated tools.' }],
        },
      },
    },
    {
      id: 'S1.M1.L2',
      title: 'From requirements to specification',
      minutes: 35,
      content: {
        objectives: [
          'Translate a user requirement (loads, supply, backup time) into an inverter specification.',
          'Calculate apparent power, output current and equivalent load resistance from power and power factor.',
          'Choose a battery voltage and explain the effect on currents, cable and fuse sizes.',
          'Choose an output waveform and topology appropriate to the loads.',
        ],
        introduction: `Engineering design starts with a question: *what must this inverter do?* "A 1 kW inverter" is not yet a specification. You also need to know:

- what the loads are;
- whether they include motors;
- what battery voltage is available;
- which country's mains voltage and frequency apply;
- whether a square wave is acceptable.

This lesson turns requirements into numbers. Those numbers fill the configurator of every build project.`,
        lecture: `### The specification parameters

The configurator in each build project asks for these inputs.

| Parameter | Typical choices | Why it matters |
|---|---|---|
| DC input voltage | 12, 24, 48 V | Sets every current on the DC side |
| AC output voltage | 230 V (most of the world), 110/120 V (Americas and some others) | Sets the transformer ratio and output ratings |
| Output frequency | 50 Hz or 60 Hz | Sets transformer size and timing |
| Rated power | W | Sets current, losses, heat |
| Load characteristics | Resistive, inductive (PF < 1) | Sets apparent power and current |
| Topology | Bridge, push-pull, high-frequency link | Sets the components and their stresses |
| Output waveform | Square, modified sine, sine | Sets the controller, filter and load compatibility |
| Switching frequency | 2.5–10 kHz (SPWM) | Sets filter size and switching loss |

### Real power, apparent power and power factor

A heater draws current exactly in step with the voltage, and all the [[apparent-power|apparent power]] becomes heat. A motor's current lags the voltage. Part of each cycle's energy flows back to the source, so the [[real-power|real power]] P is smaller than V_rms·I_rms. The ratio is the [[power-factor]]:

PF = P / S, where S = V_rms·I_rms is the apparent power in volt-amperes ([[va]]).

Switches, wires and transformers heat according to *current*, so they must be sized for S, not P. A 1000 W load at PF 0.8 needs a 1250 VA inverter.

### Battery voltage: the most important early decision

For the same power, the DC current is inversely proportional to the battery voltage. Conduction losses in cables and switches scale with I², so quadrupling the voltage from 12 V to 48 V divides the current by 4 and these losses by 16. As a rule of thumb used throughout the industry, 12 V systems stay below about 1–1.5 kW, 24 V systems below 2–3 kW, and larger systems use 48 V. These are typical practice, not hard limits.

The battery voltage is not constant. A lead-acid battery rated at 12 V operates between roughly **10.5 V** (the low-voltage cut-off) and **14.4 V** (while charging). Every design in this course is checked at both ends of this range, scaled for 24 V and 48 V.

### Choosing the waveform

- **Square wave** (projects A, B, E): simplest and cheapest. It is acceptable for resistive heaters and incandescent lamps, but it heats motors and transformers, and some electronics misbehave on it.
- **Modified sine** (project C): has the correct peak and RMS. It still contains strong [[harmonic|harmonics]].
- **Pure sine** (projects D, F, G, H): needed for motors, compressors, sensitive electronics and anything connected to the grid.

### Choosing the topology

- **Low-frequency bridge plus transformer** (B, C, D, G, H): robust, with excellent surge capacity, but heavy.
- **Push-pull with a centre-tapped transformer** (E): only two low-side switches, but each must block twice the battery voltage.
- **High-frequency link** (F): light and compact, but more complex. It creates a hazardous high-voltage DC bus.`,
        technical: `**Equivalent load resistance.** For testing, a resistive load of rated power P at voltage V is R = V²/P. This is the load used by the "resistive load" test in every project.

**Inductive loads.** An inductive load with power factor PF can be modelled as a resistance in series with an inductance. The test suite inserts a series inductor to get PF ≈ 0.8. The bridge then carries current that does no useful work and, for part of each cycle, returns energy to the battery through the [[body-diode|body diodes]].

**Surge.** Motors draw 3–7 times their running current while starting (a typical range). Low-frequency transformer inverters can supply such surges for seconds because their transformer and switches have thermal mass. The overload test in this course runs at 150 % load.

**Unregulated versus regulated output.** The square and modified-sine projects have no voltage feedback, so their output follows the battery voltage. They are designed at the nominal battery voltage: the output is about −12 % at the cut-off and +20 % while charging. The sine projects regulate their output with feedback (lesson S1.M3.L5).`,
        diagrams: [
          { id: 'design-flow', caption: 'The design flow used in every build project: specify, calculate, select, assemble, simulate, test, report.' },
          { id: 'inverter-blocks', caption: 'Functional blocks of a battery inverter and the parameters that size each block.' },
        ],
        formulas: [
          { name: 'Apparent power', expr: 'S = P / PF', where: [['S', 'apparent power', 'VA'], ['P', 'real power', 'W'], ['PF', 'power factor', '—']] },
          { name: 'Output current', expr: 'I_out = S / V_out', where: [['I_out', 'rated output current', 'A rms'], ['V_out', 'output voltage', 'V rms']] },
          { name: 'Equivalent resistive load', expr: 'R = V_out² / P', where: [['R', 'load resistance', 'Ω']] },
          { name: 'Battery operating range (lead-acid)', expr: 'V_min = 10.5 V × V_dc/12,  V_max = 14.4 V × V_dc/12', where: [['V_dc', 'nominal battery voltage', 'V']], note: 'Typical values for lead-acid; lithium batteries have different limits, set by their BMS.' },
        ],
        examples: [
          {
            title: 'Specifying an inverter for a workshop',
            problem: 'A workshop has a 750 W drill (PF 0.8 typical), 200 W of LED lighting (PF 0.95) and a 300 W heater (PF 1), all running together on 230 V. What apparent power and output current must the inverter supply?',
            steps: ['Drill: S = 750 / 0.8 = 937.5 VA; lighting: S = 200 / 0.95 = 210.5 VA; heater: S = 300 VA', 'Approximate total (adding VA gives a safe upper estimate): S ≈ 937.5 + 210.5 + 300 = 1448 VA', 'Real power: P = 750 + 200 + 300 = 1250 W', 'I_out = 1448 VA / 230 V = 6.30 A rms'],
            answer: 'About 1.45 kVA and 6.3 A. With a margin for motor starting, a 2 kVA pure-sine inverter is appropriate. Because the drill is a motor, a square wave is unsuitable.',
            check: 'The overall PF is 1250/1448 = 0.86, between the individual values. ✓',
          },
          {
            title: 'Effect of the battery voltage',
            problem: 'A 1000 W inverter is 93 % efficient. Compare the DC current from a 12 V and a 48 V battery, and the cable loss in 2 m of cable with 1 mΩ resistance per metre (total loop 4 mΩ).',
            steps: ['P_in = 1000 / 0.93 = 1075 W', '12 V: I = 1075 / 12 = 89.6 A; P_cable = 89.6² × 0.004 = 32.1 W', '48 V: I = 1075 / 48 = 22.4 A; P_cable = 22.4² × 0.004 = 2.0 W'],
            answer: 'The 48 V system draws a quarter of the current and loses one sixteenth of the power in the same cable (2 W instead of 32 W).',
            check: '32.1 / 2.0 = 16 = 4². ✓',
          },
        ],
        applications: `Inverter manufacturers publish exactly these parameters:

- input voltage range;
- continuous and surge power (W and VA);
- output voltage, frequency and waveform;
- efficiency;
- no-load current.

Solar installers use the same apparent-power arithmetic to size an inverter for a household's loads, and choose 48 V battery banks for anything above a few kilowatts.`,
        mistakes: [
          { mistake: 'Sizing the inverter in watts for motor loads.', correction: 'Size it in VA (S = P/PF) and allow for starting surge.' },
          { mistake: 'Using the nominal battery voltage for current calculations.', correction: 'The highest current flows at the lowest battery voltage (10.5 V per 12 V block). Size fuses, cables and switches at V_min.' },
          { mistake: 'Choosing 12 V for a 3 kW system "because the battery is cheaper".', correction: 'About 270 A at 10.5 V needs very heavy cables, fuses and switches; 48 V divides currents by four.' },
        ],
        demo: {
          title: 'Explore the specification in the configurator',
          text: 'Open project B, change the battery voltage from 12 V to 48 V and the power from 500 W to 1500 W, and watch the DC current, fuse and switch-current requirements change in the calculation sheet.',
          link: to.build('Open the square-wave inverter configurator', 'bld-b'),
          embed: 'design-calc',
        },
        activities: [to.build('Configure the pure sine-wave inverter', 'bld-d'), to.sim('H-bridge with an inductive load', 'sim-08'), to.lib('AC output terminals', 'ac-output')],
        check: [
          { id: 'k1', type: 'numeric', prompt: 'A 900 W load has a power factor of 0.75. Apparent power in VA?', answer: 1200, tol: 0.01, unit: 'VA', explain: 'S = P/PF = 900/0.75 = 1200 VA.' },
          { id: 'k2', type: 'numeric', prompt: 'Rated output current of a 2300 VA, 230 V inverter (A rms)?', answer: 10, tol: 0.01, unit: 'A', explain: 'I = S/V = 2300/230 = 10 A.' },
          { id: 'k3', type: 'mcq', prompt: 'At which battery voltage is the DC input current largest?', options: ['The lowest (low-voltage cut-off)', 'The nominal voltage', 'The charging voltage', 'It does not depend on battery voltage'], answer: 0, explain: 'For a given power, I = P_in/V, so the current is largest at the lowest voltage.' },
          { id: 'k4', type: 'mcq', prompt: 'Which waveform is required for a refrigerator compressor?', options: ['Pure sine', 'Square', 'Modified sine', 'Any of them'], answer: 0, explain: 'Motors and compressors run hot and noisy on stepped waveforms; a pure sine is needed.' },
        ],
        summary: [
          'A specification gives input range, output voltage and frequency, power, load type, waveform and topology.',
          'Size current-carrying parts by apparent power S = P/PF; R = V²/P is the equivalent resistive load.',
          'The battery operates from about 10.5 V to 14.4 V per 12 V block; the largest DC current flows at the minimum.',
          'Higher battery voltage means proportionally lower current and quadratically lower conduction loss.',
          'Motors, compressors and electronics need a pure sine; square and modified waves suit resistive loads.',
        ],
        homework: {
          id: 'S1.M1.L2.hw',
          title: 'Specify a clinic backup inverter',
          brief: 'A rural clinic needs to run a 150 W vaccine refrigerator (PF 0.7), 120 W of lighting (PF 0.95) and a 250 W laptop and printer load (PF 0.9) from batteries on a 230 V, 50 Hz output.',
          tasks: [
            { id: 'h1', type: 'numeric', prompt: 'Total real power (W)?', answer: 520, tol: 0.01, unit: 'W', explain: '150 + 120 + 250 = 520 W.' },
            { id: 'h2', type: 'numeric', prompt: 'Total apparent power, adding the VA of each load (VA)?', answer: 618.4, tol: 0.02, unit: 'VA', explain: '150/0.7 + 120/0.95 + 250/0.9 = 214.3 + 126.3 + 277.8 = 618.4 VA.' },
            { id: 'h3', type: 'numeric', prompt: 'DC current at 21 V (24 V battery at cut-off) if the inverter is 92 % efficient (A)?', answer: 26.9, tol: 0.02, unit: 'A', explain: 'P_in = 520/0.92 = 565 W; I = 565/21 = 26.9 A.' },
          ],
          written: [{ prompt: 'Which waveform and battery voltage would you choose, and why?', model: 'Pure sine, because the refrigerator compressor is a motor and the electronics are sensitive. 24 V gives moderate currents (≈ 27 A worst case) with a single string of two 12 V batteries; 12 V would need ≈ 54 A, and 48 V is unnecessary at this power.' }],
        },
      },
    },
    {
      id: 'S1.M1.L3',
      title: 'Design calculations: currents, losses and efficiency',
      minutes: 45,
      content: {
        objectives: [
          'Estimate conduction, switching, transformer, filter and control losses from component parameters.',
          'Calculate efficiency, DC input current at nominal and minimum battery voltage, and DC-side ripple current.',
          'Size the DC input fuse and the AC output breaker from the calculated currents.',
          'Read and check every line of the configurator’s calculation sheet.',
        ],
        introduction: `Efficiency is not a number you choose; it is the result of every loss in the circuit. Each lost watt becomes heat that must be removed, and it raises the current the battery must supply. This lesson builds up the energy balance of an inverter one loss at a time, using exactly the formulas shown in the configurator's calculation sheet.`,
        lecture: `### The energy balance

Input power = output power + losses, so

η = P_out / (P_out + ΣP_loss)

The configurator adds five losses:

1. **Switch [[conduction-loss|conduction loss]]**: heat in the switches while they are on. For a [[mosfet]], P = I_rms²·[[rdson|R_DS(on)]] for every switch in the current path. In a full bridge, two switches carry the current at any time.
2. **Switch [[switching-loss|switching loss]]**: heat during each transition, when voltage and current overlap. Each edge dissipates roughly ½·V·I·t_sw, where t_sw is the switching time.
3. **Transformer loss**: copper loss in the windings plus core loss in the iron. It is estimated from a typical efficiency (96 % for a laminated 50 Hz transformer).
4. **Filter loss**: resistance of the output inductor (about 0.5 % of rated power, typical).
5. **Control loss**: controller, gate drivers, display and fan. About 3 W or 0.5 %, whichever is larger. This is also roughly the no-load consumption.

### DC input current

Once the losses are known:

- I_dc = P_in / V_dc at the nominal battery voltage;
- I_dc,max = P_in / V_min, the worst case.

The worst case sizes the fuse, the cables and the battery terminals.

### Ripple current

A single-phase inverter delivers power that pulses at **twice** the output frequency. The instantaneous power v·i of a sine is proportional to sin², which repeats every half-cycle. The battery and bus capacitors therefore carry a large 100 Hz (or 120 Hz) ripple current, roughly I_dc/√2. This is why bus capacitors are rated by **ripple current** as well as by voltage and capacitance.

### Protection sizing

- **DC fuse:** I_fuse ≥ 1.25 × I_dc,max, rounded up to the next standard size. The 25 % margin stops the fuse from ageing and tripping under normal operation. The cable must be rated for the fuse.
- **AC breaker:** I_n ≥ 1.25 × I_out, rounded up to the next standard size.

### Working with typical values

The configurator uses *typical* values where you have not chosen a component parameter: transformer efficiency, battery internal resistance and junction-to-case thermal resistance. They are marked "assumption" in the calculation sheet. In a real design every one of them would be replaced by a figure from the [[datasheet]] of the specific part.`,
        technical: `**Where the switching-loss formula comes from.** In bipolar [[spwm|SPWM]] all four switches change state once per carrier period, turning on and turning off.

1. One edge dissipates about ½·V_dc·|i|·t_sw. The power over a carrier period is therefore 4 × 2 × ½·V_dc·|i|·t_sw·f_sw = 4·V_dc·|i|·t_sw·f_sw.
2. The load current varies sinusoidally, and the average of |I_pk·sin θ| over a cycle is 2I_pk/π.
3. Combining the two gives P_sw ≈ (8/π)·f_sw·V_dc·I_pk·t_sw.

For a square-wave bridge switching at the output frequency f, the same reasoning gives 4·2f·½·V·I·t_sw, which is tiny.

**Conduction loss and temperature.** R_DS(on) rises with temperature, often 1.5–2 times between 25 °C and 125 °C (the datasheet shows a curve). The configurator uses the value you enter. A careful design enters the hot value.

**IGBT conduction.** An [[igbt]] has a roughly constant [[vcesat|V_CE(sat)]], so P ≈ V_CE(sat)·I_avg. That is why IGBTs are inefficient at low battery voltages: 1.6 V lost out of 12 V is 13 %.`,
        diagrams: [{ id: 'inverter-blocks', caption: 'Where each loss occurs in the power path.' }],
        formulas: [
          { name: 'Efficiency', expr: 'η = P_out / (P_out + P_cond + P_sw + P_T + P_L + P_ctl)', where: [['η', 'efficiency', '—'], ['P_cond', 'conduction loss', 'W'], ['P_sw', 'switching loss', 'W'], ['P_T', 'transformer loss', 'W'], ['P_L', 'filter loss', 'W'], ['P_ctl', 'control and standby', 'W']] },
          { name: 'MOSFET conduction loss (bridge)', expr: 'P_cond = 2 · I_rms² · R_DS(on)', where: [['I_rms', 'primary RMS current', 'A'], ['R_DS(on)', 'on-resistance of one switch', 'Ω']] },
          { name: 'SPWM switching loss', expr: 'P_sw ≈ (8/π) · f_sw · V_dc · I_pk · t_sw', where: [['f_sw', 'switching (carrier) frequency', 'Hz'], ['I_pk', 'peak primary current', 'A'], ['t_sw', 'switching time per edge', 's']] },
          { name: 'DC input current', expr: 'I_dc = P_out / (η · V_dc)', where: [['V_dc', 'battery voltage', 'V']] },
          { name: 'DC fuse', expr: 'I_fuse ≥ 1.25 · I_dc,max  → next standard size', where: [['I_dc,max', 'input current at V_min', 'A']] },
        ],
        examples: [
          {
            title: 'Energy balance of the 500 W square-wave inverter (project B defaults)',
            problem: '12 V battery, 500 W resistive load, R_DS(on) = 2 mΩ, primary current 46.1 A rms, transformer η = 96 %, control 3 W, switching loss negligible (0.01 W). Find η, I_dc at 12 V and at 10.5 V, and the fuse.',
            steps: ['P_cond = 2 × 46.1² × 0.002 = 8.50 W', 'P_T = 500 × (1/0.96 − 1) = 20.8 W', 'ΣP_loss = 8.50 + 0.01 + 20.8 + 3 = 32.3 W', 'η = 500 / (500 + 32.3) = 0.939 (93.9 %)', 'I_dc = 532.3 / 12 = 44.4 A;  I_dc,max = 532.3 / 10.5 = 50.7 A', 'Fuse ≥ 1.25 × 50.7 = 63.4 A → next standard size 80 A'],
            answer: 'η ≈ 93.9 %, I_dc ≈ 44 A (nominal) and 51 A (worst case), 80 A fuse. These are the numbers in project B’s calculation sheet.',
            check: 'The transformer is the largest loss, as expected for a 50 Hz design. ✓',
          },
          {
            title: 'Switching loss of a sine-wave bridge',
            problem: 'A 24 V SPWM bridge switches at 5 kHz with a peak primary current of 120 A and t_sw = 50 ns. Estimate P_sw. What happens at 20 kHz?',
            steps: ['P_sw = (8/π) × 5000 × 24 × 120 × 50 × 10⁻⁹', '= 2.546 × 5000 × 24 × 120 × 5 × 10⁻⁸ = 1.83 W', 'At 20 kHz the loss is 4 times larger: 7.3 W'],
            answer: '≈ 1.8 W at 5 kHz and ≈ 7.3 W at 20 kHz. Switching loss is proportional to frequency, which is one reason not to switch faster than the filter needs.',
          },
        ],
        applications: `Datasheet efficiency curves of commercial inverters show the same shape these formulas predict:

- **light load:** low efficiency, because control and transformer core losses dominate;
- **mid load:** a peak in efficiency;
- **full load:** a slight fall, as I² losses grow.

Fuse and cable tables used by installers are based on the same 125 % continuous-current rule.`,
        mistakes: [
          { mistake: 'Calculating the fuse from the nominal current.', correction: 'Use the current at the lowest battery voltage, then add 25 %.' },
          { mistake: 'Forgetting that two switches conduct in series in a bridge.', correction: 'Conduction loss in a full bridge is 2·I²·R_DS(on) at any instant.' },
          { mistake: 'Treating typical values as guaranteed.', correction: 'Typical efficiencies and resistances are estimates; the datasheet of the chosen part decides.' },
        ],
        demo: {
          title: 'Change one component and watch the efficiency',
          text: 'In project D, change R_DS(on) from 1 mΩ to 10 mΩ and the switching time from 50 ns to 500 ns. Note which loss changes, by how much, and how the heat-sink requirement follows.',
          link: to.build('Open the pure sine-wave design', 'bld-d'),
          embed: 'design-calc',
        },
        activities: [to.sim('MOSFET switching losses', 'sim-05'), to.lib('MOSFET: R_DS(on), ratings', 'mosfet'), to.build('Square-wave inverter calculation sheet', 'bld-b')],
        check: [
          { id: 'k1', type: 'numeric', prompt: 'A 1000 W inverter has 70 W of losses. Efficiency in %?', answer: 93.46, tol: 0.01, unit: '%', explain: 'η = 1000/1070 = 93.5 %.' },
          { id: 'k2', type: 'numeric', prompt: 'A 24 V inverter draws 1070 W. DC current at the 21 V cut-off (A)?', answer: 50.95, tol: 0.01, unit: 'A', explain: 'I = 1070/21 = 51.0 A.' },
          { id: 'k3', type: 'mcq', prompt: 'Doubling the switching frequency of an SPWM bridge approximately…', options: ['doubles the switching loss', 'halves the switching loss', 'doubles the conduction loss', 'does not change losses'], answer: 0, explain: 'P_sw is proportional to f_sw.' },
          { id: 'k4', type: 'mcq', prompt: 'Why do bus capacitors carry a large ripple current in a single-phase inverter?', options: ['Output power pulses at twice the output frequency', 'The battery voltage is unstable', 'Because of the fuse', 'Because of the transformer turns ratio'], answer: 0, explain: 'v·i of a sine is proportional to sin², which pulses at 2f.' },
        ],
        summary: [
          'η = P_out / (P_out + ΣP_loss): conduction, switching, transformer, filter and control losses.',
          'Conduction loss ∝ I²·R_DS(on); switching loss ∝ f_sw·V·I·t_sw.',
          'Size the DC side at the minimum battery voltage: I_dc,max = P_in/V_min.',
          'Fuse ≥ 1.25·I_dc,max and breaker ≥ 1.25·I_out, rounded up to standard sizes.',
          'Single-phase power pulses at 2f, so bus capacitors must be rated for ripple current.',
        ],
        homework: {
          id: 'S1.M1.L3.hw',
          title: 'Loss budget of a 48 V, 2 kW sine inverter',
          brief: 'R_DS(on) = 3 mΩ, primary current 47 A rms, peak 70 A, f_sw = 10 kHz, t_sw = 60 ns, transformer η = 96 %, filter loss 0.5 %, control 10 W.',
          tasks: [
            { id: 'h1', type: 'numeric', prompt: 'Conduction loss (W)?', answer: 13.25, tol: 0.02, unit: 'W', explain: '2 × 47² × 0.003 = 13.25 W.' },
            { id: 'h2', type: 'numeric', prompt: 'Switching loss (W)?', answer: 5.13, tol: 0.03, unit: 'W', explain: '(8/π) × 10 000 × 48 × 70 × 60 × 10⁻⁹ = 5.13 W.' },
            { id: 'h3', type: 'numeric', prompt: 'Efficiency (%), with transformer loss 2000 × (1/0.96 − 1) = 83.3 W and filter loss 10 W?', answer: 94.26, tol: 0.01, unit: '%', explain: 'ΣP = 13.25 + 5.13 + 83.3 + 10 + 10 = 121.7 W; η = 2000/2121.7 = 94.3 %.' },
          ],
          written: [{ prompt: 'Which loss would you attack first to improve efficiency, and how?', model: 'The transformer (83 W, two thirds of the total): a larger core with lower flux density and thicker windings, or a high-frequency design. Halving R_DS(on) would only save about 6.6 W.' }],
        },
      },
    },
    {
      id: 'S1.M1.L4',
      title: 'Choosing switches, drivers and controllers',
      minutes: 45,
      content: {
        objectives: [
          'Derive the voltage and current ratings a bridge switch needs, with margins, from the design numbers.',
          'Choose between a MOSFET and an IGBT from voltage, current and switching frequency.',
          'Select a gate-drive method (low-side, bootstrap, isolated) and a controller (PWM IC or microcontroller).',
          'Distinguish typical library values, simulated values and manufacturer datasheet ratings.',
        ],
        introduction: `The configurator lets you choose a switch type and its key ratings, the driver and the controller. Its compatibility checks then tell you whether your choice will survive. This lesson explains how those checks reason, so that you can make the choice yourself before you look.`,
        lecture: `### Voltage rating

An off switch in a bridge blocks the bus voltage. The rating must cover the *highest* bus voltage, which occurs while charging (14.4 V per 12 V block). It also needs a margin for the voltage spike caused by wiring inductance at turn-off (V = L·di/dt). The rule used here is **V_DSS ≥ 1.5 × V_max**. In a [[push-pull]] stage the off switch sees *twice* the supply, so the requirement is doubled.

### Current rating

The switch carries the transformer's primary current. Its peak is largest at the lowest battery voltage. Datasheet continuous-current ratings are usually quoted with the case held at 25 °C, which never happens in practice. The rule here is therefore **I_D ≥ 2 × I_peak**. Several switches in parallel are common in low-voltage inverters.

### MOSFET or IGBT?

| | MOSFET | IGBT |
|---|---|---|
| On-state | Resistance R_DS(on): loss ∝ I² | Voltage V_CE(sat) ≈ 1.2–2.5 V: loss ∝ I |
| Best at | Low voltage (12–48 V buses), high frequency | High voltage (≥ 300 V buses), high current |
| Switching | Fast, up to hundreds of kHz | Slower, with a tail current; practical up to about 20–40 kHz (typical) |

On a 12 V bus an IGBT's 1.6 V saturation voltage wastes about 13 % of the input, and a modern MOSFET with a few milliohms wastes far less. On a 360 V bus a 600 V-class IGBT is often the better choice. The library's [[mosfet]] versus [[igbt]] comparison explains this in detail.

### Gate drive

A MOSFET needs about 10–12 V between gate and source to be fully on, and an IGBT about 15 V. These are typical; see the datasheet. The low-side switches have their source on the negative rail, so a simple driver referenced to that rail works. The **high-side** switches have their source on the bridge midpoint, which swings between the rails, so their driver must float:

- a **[[bootstrap]]** supply: cheap, and it works when the low-side switch turns on regularly, as in SPWM;
- an **isolated** driver: works for any duty cycle, for example square waves at 50 Hz, where a bootstrap capacitor may droop during a long 10 ms on-time.

Push-pull needs only low-side drivers, which is its main attraction.

### Controller

| Controller | Suits | Limitation |
|---|---|---|
| Dedicated PWM IC (SG3525 class) | Square-wave and push-pull timing: two complementary outputs, dead time | — |
| Microcontroller | Modified sine, SPWM with a sine table, feedback regulation, MPPT, transfer logic, protection | — |

### Three kinds of number

1. **Typical values** in the component library describe a *class* of part: "a 60 V MOSFET of this size typically has R_DS(on) of a few mΩ". They are for learning.
2. **Simulated values** come from the simulator's models with the parameters you entered.
3. **Manufacturer ratings** come from the [[datasheet]] of one specific part number. Only they guarantee anything.

This course never invents datasheet figures. It is your job, in a real design, to find a part whose datasheet meets the requirement.`,
        technical: `**Why 2 × I_peak?** A switch's real current limit is thermal: the [[junction-temperature]] must stay below its maximum. The datasheet's I_D at 25 °C case is a ceiling that cannot be reached in a heat-sinked enclosure at 40 °C. The configurator also checks the thermal design separately, from the calculated losses (lesson S1.M1.L5).

**Parallel MOSFETs** share current reasonably well because R_DS(on) rises with temperature: a hotter device takes less current. IGBTs share less naturally, depending on the device's temperature coefficient.

**Gate charge** (Q_g) sets how much current the driver must supply: I_g ≈ Q_g/t_sw. Large or paralleled MOSFETs need drivers with ampere-level peak outputs.

**Dead time** is set in the controller or driver (lesson S1.M3.L2). Typical values are 0.5–2 µs for MOSFETs and 1–3 µs for IGBTs.`,
        diagrams: [{ id: 'hbridge-states', caption: 'Switch states of a full bridge and the voltage each off switch blocks.' }],
        formulas: [
          { name: 'Switch voltage rating', expr: 'V_DSS ≥ 1.5 · V_max   (push-pull: 1.5 · 2 · V_max)', where: [['V_max', 'highest bus voltage (charging)', 'V']] },
          { name: 'Switch current rating', expr: 'I_D ≥ 2 · I_pk,  I_pk = √2 · n · I_out · V_dc / V_min', where: [['n', 'transformer ratio', '—'], ['I_out', 'rated output current', 'A rms']] },
          { name: 'R_DS(on) for a loss budget', expr: 'R_DS(on) ≤ P_budget / (2 · I_rms²)', where: [['P_budget', 'allowed conduction loss', 'W']] },
        ],
        examples: [
          {
            title: 'Switch ratings for the 1 kW, 24 V pure-sine design',
            problem: 'V_dc = 24 V, n ≈ 20, I_out = 4.35 A rms. Find the voltage and current ratings the bridge MOSFETs need.',
            steps: ['V_max = 14.4 × 24/12 = 28.8 V → V_DSS ≥ 1.5 × 28.8 = 43.2 V → choose the 60 V class', 'I_pk = √2 × 20 × 4.35 × 24/21 = 140.6 A', 'I_D ≥ 2 × 140.6 = 281 A → e.g. several 100 A-class MOSFETs in parallel, or a 300 A module'],
            answer: 'A 60 V class with about 280 A total current capability, which is the requirement shown by project D’s compatibility check.',
          },
          {
            title: 'An on-resistance budget',
            problem: 'In the same design, the primary RMS current at nominal battery voltage is 86.8 A. What total R_DS(on) per switch position keeps the conduction loss to 1 % of 1000 W?',
            steps: ['P_budget = 0.01 × 1000 = 10 W', 'R_DS(on) ≤ 10 / (2 × 86.8²) = 10 / 15 068 = 0.66 mΩ'],
            answer: 'About 0.66 mΩ per position. A single 1 mΩ device gives 15 W (1.5 %), which may be acceptable. Two in parallel (0.5 mΩ) meet the target.',
            check: 'With 1 mΩ: 2 × 86.8² × 0.001 = 15.1 W, matching project D’s calculation sheet. ✓',
          },
        ],
        applications: `Low-voltage commercial inverters often place 4–12 MOSFETs in parallel per bridge position. Large solar inverters with 400–800 V DC links use IGBT or silicon-carbide modules. Driver ICs with bootstrap high-side channels and built-in dead time are standard in SPWM designs.`,
        mistakes: [
          { mistake: 'Choosing a 30 V MOSFET for a 24 V system.', correction: 'The bus reaches 28.8 V while charging, and switching spikes add more. Use V_DSS ≥ 1.5 × V_max, i.e. 60 V.' },
          { mistake: 'Using the datasheet’s 25 °C current rating directly.', correction: 'Real limits are thermal. Use a 2× margin and check the junction temperature.' },
          { mistake: 'Driving high-side switches from the same ground-referenced driver as the low side.', correction: 'High-side gates must be driven relative to their own source, using a bootstrap or isolated driver.' },
          { mistake: 'Quoting a library “typical” value as a guaranteed rating.', correction: 'Typical values teach and estimate; only the chosen part’s datasheet guarantees.' },
        ],
        demo: {
          title: 'Break the compatibility checks on purpose',
          text: 'In project D select an IGBT, then raise the switching frequency to 10 kHz, then lower V_DSS to 30 V. Read the explanation each failed check gives, then restore a compatible selection.',
          link: to.build('Open project D component selection', 'bld-d'),
        },
        activities: [to.cmp('MOSFET versus IGBT', 'mosfet-vs-igbt'), to.lib('Gate driver', 'gate-driver'), to.cmp('PWM controller versus microcontroller', 'pwm-vs-mcu'), to.proc('Test a MOSFET with a multimeter', 'mosfet', 'mosfet-diode')],
        check: [
          { id: 'k1', type: 'numeric', prompt: 'Minimum V_DSS for a 48 V full bridge (V_max = 57.6 V) using the 1.5× rule (V)?', answer: 86.4, tol: 0.01, unit: 'V', explain: '1.5 × 57.6 = 86.4 V, so a 100 V class part.' },
          { id: 'k2', type: 'mcq', prompt: 'For a 12 V, 1 kW bridge at 5 kHz, the better switch is…', options: ['MOSFET', 'IGBT', 'Either; they behave identically', 'A relay'], answer: 0, explain: 'At 12 V an IGBT’s V_CE(sat) wastes a large fraction of the input; MOSFETs have milliohm on-resistance.' },
          { id: 'k3', type: 'mcq', prompt: 'Why can a bootstrap driver struggle with a 50 Hz square-wave bridge?', options: ['The high-side switch stays on for 10 ms and the bootstrap capacitor droops', 'Bootstrap drivers cannot switch MOSFETs', 'The square wave has no dead time', 'It needs a microcontroller'], answer: 0, explain: 'The bootstrap capacitor only recharges while the low-side switch is on.' },
          { id: 'k4', type: 'mcq', prompt: 'Which source guarantees a component’s ratings?', options: ['The manufacturer’s datasheet for that part number', 'The library’s typical values', 'The simulation result', 'A similar part from another manufacturer'], answer: 0, explain: 'Typical and simulated values are estimates; only the datasheet guarantees.' },
        ],
        summary: [
          'Switch voltage rating ≥ 1.5 × highest bus voltage (twice that for push-pull).',
          'Switch current rating ≥ 2 × peak primary current at the lowest battery voltage; check thermal separately.',
          'MOSFETs suit low-voltage, high-frequency bridges; IGBTs suit high-voltage buses below about 20–40 kHz.',
          'High-side switches need floating gate drive (bootstrap or isolated); push-pull needs only low-side drive.',
          'Typical values teach; simulated values come from models; only datasheets guarantee ratings.',
        ],
        homework: {
          id: 'S1.M1.L4.hw',
          title: 'Select switches for a 12 V, 1500 W square-wave inverter',
          brief: 'V_max = 14.4 V, V_min = 10.5 V, n = 21, I_out = 6.52 A rms (230 V).',
          tasks: [
            { id: 'h1', type: 'numeric', prompt: 'Minimum V_DSS (V)?', answer: 21.6, tol: 0.01, unit: 'V', explain: '1.5 × 14.4 = 21.6 V (a 30 V or 40 V class part).' },
            { id: 'h2', type: 'numeric', prompt: 'Peak primary current for a square wave at V_min, I_pk = n·I_out·V_dc/V_min (A)?', answer: 156.5, tol: 0.02, unit: 'A', explain: '21 × 6.52 × 12/10.5 = 156.5 A (a square wave has peak = RMS).' },
            { id: 'h3', type: 'numeric', prompt: 'Required current rating (A)?', answer: 313, tol: 0.02, unit: 'A', explain: '2 × 156.5 = 313 A.' },
          ],
          written: [{ prompt: 'Which gate driver would you choose for this square-wave bridge, and why?', model: 'Isolated high-side drivers (or a charge-pump/isolated supply), because the high-side switches stay on for a full 8.3–10 ms half-cycle and a bootstrap capacitor could discharge; low-side switches can use a simple ground-referenced driver.' }],
        },
      },
    },
    {
      id: 'S1.M1.L5',
      title: 'Transformer, filter, protection and thermal design',
      minutes: 50,
      content: {
        objectives: [
          'Calculate the transformer turns ratio for square, modified-sine and sine outputs, including voltage drops.',
          'Size an LC output filter from a ripple target and a corner frequency.',
          'Design the heat sink from the calculated losses using a thermal-resistance network.',
          'Specify the protection set: DC fuse, AC breaker, low-voltage disconnect, earthing and RCD.',
        ],
        introduction: `The switches make the AC, but the transformer, the filter, the protection devices and the heat sink decide whether it is the *right* AC, and whether the inverter survives. These four designs complete the calculation sheet.`,
        lecture: `### The transformer ratio

A low-frequency bridge applies (nearly) the battery voltage to the primary. The [[turns-ratio]] n = N_s/N_p must lift it to the output, after allowing for:

- the voltage drop in the switches, battery and wiring at full load;
- the transformer's own resistive drop (r_x ≈ 2.5–3 %, from its typical efficiency).

| Output | Design formula | Reasoning |
|---|---|---|
| Square wave | n = V_out / ((V_nom − drop)·(1 − r_x)) | V_rms = V_pk; designed at the nominal battery voltage because it is unregulated |
| Modified sine | n = √2·V_out / ((V_nom − drop)·(1 − r_x)) | The peak of a sine; designed at nominal |
| SPWM sine | n = √2·V_out / (0.95·(V_min − drop)·(1 − r_x)) | Full output must still be reached at the cut-off with m = 0.95; feedback reduces m at higher voltage |

The transformer's [[va]] rating should exceed the apparent power with margin (1.2·S here). Its core must not [[saturation|saturate]], which is why a 50 Hz transformer is large and heavy (lesson S1.M4.L2).

### The LC output filter

An SPWM bridge outputs pulses at f_sw whose *average* is a sine. The [[lc-filter]] removes the pulses:

1. **Inductor from the ripple target.** For bipolar switching the worst-case peak-to-peak ripple current is ΔI = V_bus/(2·L·f_sw). With ΔI = 25 % of the peak current (a typical target), L = V_bus / (2·f_sw·ΔI).
2. **Capacitor from the corner frequency.** The [[corner-frequency]] f_c = 1/(2π√(LC)) is placed about a decade below f_sw, giving ≈ 100× (40 dB) attenuation of the carrier. It must also stay well above 50 Hz, at least 10× f.
3. **Referring the capacitor through the transformer.** When the inductor is on the primary and the capacitor on the secondary, impedances scale by n². A primary-side capacitance C_ref is equivalent to C_ref/n² on the secondary, so C_sec = C_ref/n². The capacitor must be an AC-rated film type.

### Thermal design

Heat flows from the die to the air through [[thermal-resistance|thermal resistances]] in series: junction-to-case R_θjc, case-to-sink R_θcs (insulating pad) and sink-to-air R_θsa. The heat sink is shared by all switches, so

T_j = T_a + P_total·R_θsa + P_each·(R_θjc + R_θcs)

The design target is T_j ≤ 125 °C at 40 °C ambient. Typical datasheet maximums are 150–175 °C, so this leaves a margin. Rearranged:

R_θsa ≤ (T_j,lim − T_a − P_each·(R_θjc + R_θcs)) / P_total

A fan multiplies the effective sink performance (the configurator uses 0.4×, a typical estimate).

### The protection set

| Device | Protects against | Sizing |
|---|---|---|
| DC [[fuse]] | Wiring fire from a DC fault | ≥ 1.25 × I_dc,max, next standard size |
| AC [[breaker]] | Output wiring overload and short circuit | ≥ 1.25 × I_out, next standard size |
| [[lvd|Low-voltage disconnect]] | Damaging deep discharge of the battery | 10.5 V per 12 V (lead-acid, typical) |
| [[protective-earth|Earth]] bond + [[rcd]] | Shock from insulation faults | 30 mA RCD (typical) |
| Current sensor | Bridge destruction by short circuits, faster than any fuse | Electronic shut-down within microseconds |
| Temperature sensor | Overheating | Shut-down above a set heat-sink temperature |`,
        technical: `**Why the corner frequency is f_sw/10.** A second-order LC filter attenuates by (f/f_c)² above its corner. At f = 10·f_c the carrier is reduced 100×. Moving the corner lower gives better filtering but a larger L and C, more reactive current at 50 Hz, and a slower regulator. Moving it higher lets carrier ripple through.

**Reactive current in the capacitor.** The filter capacitor draws I_C = 2π·f·C·V at 50 Hz: for 4.7 µF at 230 V that is 0.34 A, even at no load. It adds to the no-load current and is one reason inverters consume power when idle.

**Fuses are slow.** A fuse protects wiring. Semiconductors fail within microseconds of a short circuit, long before any fuse melts. That is why sine inverters monitor the bridge current electronically (desaturation detection or a shunt or Hall sensor) and turn the gates off within microseconds.

**Simplified thermal model.** The simulator computes T_j from the simulated losses in steady state. It does not model thermal capacitance, so it cannot show how long a switch survives a short surge.`,
        diagrams: [
          { id: 'lc-filter', caption: 'LC filter response: 50 Hz passes, the carrier is attenuated 40 dB per decade above the corner.' },
          { id: 'thermal-network', caption: 'Thermal network from the junctions of four switches to the ambient air.' },
        ],
        formulas: [
          { name: 'Filter inductance (bipolar SPWM)', expr: 'L = V_bus / (2 · f_sw · ΔI)', where: [['ΔI', 'peak-to-peak ripple target (25 % of I_pk)', 'A'], ['V_bus', 'bridge DC voltage', 'V']] },
          { name: 'Filter capacitance from the corner', expr: 'C_ref = 1 / ((2π · f_c)² · L),  C_sec = C_ref / n²', where: [['f_c', 'corner frequency (f_sw/10)', 'Hz'], ['n', 'transformer ratio', '—']] },
          { name: 'Junction temperature', expr: 'T_j = T_a + P_total · R_θsa + P_each · (R_θjc + R_θcs)', where: [['T_a', 'ambient inside the enclosure', '°C'], ['P_total', 'heat into the shared sink', 'W'], ['P_each', 'heat in one switch', 'W']] },
        ],
        examples: [
          {
            title: 'Filter for the 1 kW, 24 V SPWM inverter',
            problem: 'V_bus = 24 V, f_sw = 5 kHz, peak primary current 123 A, n ≈ 20. Size L for 25 % ripple and C for f_c = f_sw/10.',
            steps: ['ΔI = 0.25 × 123 = 30.7 A', 'L = 24 / (2 × 5000 × 30.7) = 7.8 × 10⁻⁵ H = 0.078 mH', 'f_c = 5000/10 = 500 Hz; C_ref = 1 / ((2π × 500)² × 7.8 × 10⁻⁵) = 1 / (9.87 × 10⁶ × 7.8 × 10⁻⁵) = 1.30 × 10⁻³ F', 'C_sec = 1.30 × 10⁻³ / 20² = 3.25 µF (choose 4.7 µF film, AC-rated)'],
            answer: 'L ≈ 0.08 mH on the primary and C ≈ 3.3 µF (4.7 µF standard) on the secondary: project D’s calculation sheet.',
            check: 'f_c / f = 500/50 = 10: the corner is a decade above 50 Hz and a decade below the carrier. ✓',
          },
          {
            title: 'Heat sink for the same design',
            problem: 'Total switch loss 16.9 W shared equally by four switches (4.23 W each), R_θjc = 0.5 °C/W, R_θcs = 0.3 °C/W (typical), T_a = 40 °C, T_j limit 125 °C. What is the largest R_θsa allowed, and T_j with a 1.2 °C/W sink?',
            steps: ['R_θsa ≤ (125 − 40 − 4.23 × 0.8) / 16.9 = (85 − 3.38) / 16.9 = 4.83 °C/W', 'With 1.2 °C/W: T_j = 40 + 16.9 × 1.2 + 4.23 × 0.8 = 40 + 20.3 + 3.4 = 63.7 °C'],
            answer: 'Any sink better than about 4.8 °C/W meets the limit. A 1.2 °C/W sink keeps T_j near 64 °C, leaving margin for the 150 % overload test.',
          },
        ],
        applications: `Filter design, thermal design and the protection set described here are the core of every commercial inverter datasheet's "protection features" list:

- over-temperature, overload and short-circuit shut-down;
- low-battery alarm and shut-down;
- output breaker;
- earth-leakage protection.

Thermal design is often what sets the continuous power rating of a commercial product.`,
        mistakes: [
          { mistake: 'Using an electrolytic capacitor in the AC output filter.', correction: 'Electrolytics are polarised and fail on AC; use an AC-rated film capacitor.' },
          { mistake: 'Placing the filter corner at 50 Hz “to make it smooth”.', correction: 'The corner must be well above 50 Hz (≥ 10×), or the filter resonates with and distorts the fundamental. Place it about f_sw/10.' },
          { mistake: 'Expecting the fuse to protect the MOSFETs.', correction: 'Fuses protect wiring; semiconductors need electronic current limiting that acts within microseconds.' },
          { mistake: 'Forgetting to refer the filter capacitor through the transformer.', correction: 'A capacitor on the secondary looks n² times larger from the primary: C_sec = C_ref/n².' },
        ],
        demo: {
          title: 'See the filter work',
          text: 'Change project D’s filter inductance and capacitance and watch the corner frequency, the attenuation of the carrier and the predicted THD move together.',
          link: to.build('Open project D', 'bld-d'),
          embed: 'lc-filter',
        },
        activities: [to.sim('Pure sine-wave inverter filter', 'sim-10'), to.lab3d('Output inductor and film capacitor', 'lf3k', 'l1'), to.cmp('Heat sink versus fan', 'heatsink-vs-fan'), to.lib('Transformer', 'transformer')],
        check: [
          { id: 'k1', type: 'numeric', prompt: 'Square-wave design: V_out = 230 V, (V_nom − drop) = 11 V, r_x = 0.025. Turns ratio?', answer: 21.45, tol: 0.01, unit: '', explain: 'n = 230 / (11 × 0.975) = 21.4.' },
          { id: 'k2', type: 'numeric', prompt: 'Corner frequency of L = 1 mH and C = 10 µF (Hz)?', answer: 1591.5, tol: 0.01, unit: 'Hz', explain: 'f_c = 1/(2π√(10⁻³ × 10⁻⁵)) = 1/(2π × 10⁻⁴) = 1592 Hz.' },
          { id: 'k3', type: 'numeric', prompt: 'T_j of a switch with P_total = 20 W, R_θsa = 2 °C/W, P_each = 5 W, R_θjc + R_θcs = 0.8 °C/W, T_a = 40 °C (°C)?', answer: 84, tol: 0.01, unit: '°C', explain: '40 + 20 × 2 + 5 × 0.8 = 84 °C.' },
          { id: 'k4', type: 'mcq', prompt: 'Which device stops a bridge short circuit fast enough to save the MOSFETs?', options: ['Electronic current sensing that turns off the gates', 'The DC fuse', 'The AC output breaker', 'The RCD'], answer: 0, explain: 'Only electronic protection acts within microseconds.' },
        ],
        summary: [
          'Turns ratio: square n = V_out/V_eff; modified sine √2·V_out/V_eff; SPWM √2·V_out/(0.95·V_min,eff), allowing for drops.',
          'LC filter: L from the ripple target, C from a corner near f_sw/10 and ≥ 10× f, referred through n².',
          'Heat-sink R_θsa from the T_j limit; a fan improves the effective sink.',
          'Protection set: DC fuse, AC breaker, LVD, earth + RCD, electronic overcurrent and over-temperature shut-down.',
          'Fuses protect wiring; semiconductors need microsecond electronic protection.',
        ],
        homework: {
          id: 'S1.M1.L5.hw',
          title: 'Filter and heat sink for a 48 V, 10 kHz design',
          brief: 'V_bus = 48 V, f_sw = 10 kHz, I_pk = 60 A, n = 5.2, P_total = 12 W (3 W each), R_θjc + R_θcs = 0.8 °C/W, T_a = 40 °C.',
          tasks: [
            { id: 'h1', type: 'numeric', prompt: 'Filter inductance for 25 % ripple (µH)?', answer: 160, tol: 0.02, unit: 'µH', explain: 'ΔI = 15 A; L = 48/(2 × 10 000 × 15) = 160 µH.' },
            { id: 'h2', type: 'numeric', prompt: 'Secondary filter capacitance for f_c = 1 kHz (µF)?', answer: 5.86, tol: 0.03, unit: 'µF', explain: 'C_ref = 1/((2π·1000)² × 160 × 10⁻⁶) = 158 µF; C_sec = 158/5.2² = 5.86 µF.' },
            { id: 'h3', type: 'numeric', prompt: 'Largest R_θsa for T_j ≤ 125 °C (°C/W)?', answer: 6.88, tol: 0.02, unit: '°C/W', explain: '(125 − 40 − 3 × 0.8)/12 = 82.6/12 = 6.88 °C/W.' },
          ],
          written: [{ prompt: 'Why might you still choose a heat sink much better than 6.9 °C/W?', model: 'To survive overload (the 150 % test roughly doubles the losses), higher ambient temperatures, the rise of R_DS(on) when hot, and to extend lifetime; T_j ≈ 125 °C at rated load leaves no margin for any of these.' }],
        },
      },
    },
  ],
  quiz: {
    pass: 0.7,
    questions: [
      { id: 'q1', type: 'mcq', prompt: 'A 600 W load at PF 0.75 requires an inverter rated at least…', options: ['800 VA', '450 VA', '600 VA', '750 VA'], answer: 0, explain: 'S = 600/0.75 = 800 VA.' },
      { id: 'q2', type: 'numeric', prompt: 'A 12 V, 800 W inverter is 92 % efficient. DC current at 10.5 V (A)?', answer: 82.8, tol: 0.02, unit: 'A', explain: 'P_in = 869.6 W; I = 869.6/10.5 = 82.8 A.' },
      { id: 'q3', type: 'mcq', prompt: 'With the 1.25× rule and standard sizes (60, 80, 100 A), the fuse for I_dc,max = 52 A is…', options: ['80 A', '60 A', '100 A', '52 A'], answer: 0, explain: '1.25 × 52 = 65 A → next standard size 80 A.' },
      { id: 'q4', type: 'mcq', prompt: 'Which switch type is preferable for a 360 V bus switched at 10 kHz?', options: ['600 V-class IGBT (or a 600 V MOSFET)', '60 V MOSFET', '40 V MOSFET', 'A relay'], answer: 0, explain: 'The device must block well above 360 V; IGBTs are well suited to high voltage at 10 kHz.' },
      { id: 'q5', type: 'numeric', prompt: 'Energy stored in 2200 µF at 50 V (J)?', answer: 2.75, tol: 0.02, unit: 'J', explain: '½ × 0.0022 × 2500 = 2.75 J.' },
      { id: 'q6', type: 'mcq', prompt: 'Why is the SPWM transformer ratio calculated at the minimum battery voltage?', options: ['So the full output is still reached at the cut-off; feedback reduces m at higher voltages', 'Because the battery is usually flat', 'To reduce switching loss', 'It is not; it uses the maximum'], answer: 0, explain: 'Regulated designs need headroom at the lowest input.' },
      { id: 'q7', type: 'numeric', prompt: 'L = 0.2 mH, C_ref = 500 µF. Corner frequency (Hz)?', answer: 503.3, tol: 0.02, unit: 'Hz', explain: '1/(2π√(2 × 10⁻⁴ × 5 × 10⁻⁴)) = 1/(2π × 3.16 × 10⁻⁴) = 503 Hz.' },
      { id: 'q8', type: 'multi', prompt: 'Which are typical values rather than guaranteed ratings? (select all)', options: ['Transformer efficiency of 96 % used in the calculation sheet', 'Battery internal resistance of 10 mΩ per 12 V', 'The V_DSS printed in the datasheet of the part you bought', 'R_θcs = 0.3 °C/W for an insulating pad'], answers: [0, 1, 3], explain: 'Only the specific part’s datasheet guarantees; the others are typical assumptions marked in the sheet.' },
      { id: 'q9', type: 'mcq', prompt: 'What must you do before touching an inverter’s capacitors after switching off?', options: ['Isolate all sources, wait/discharge and prove dead with a checked meter', 'Wait 10 seconds', 'Remove the fuse only', 'Touch them briefly to test'], answer: 0, explain: 'Safe isolation is a procedure ending with a proving-dead measurement.' },
      { id: 'q10', type: 'numeric', prompt: 'Allowed R_θsa: P_total = 30 W, P_each = 7.5 W, R_θjc + R_θcs = 0.8 °C/W, T_a = 40 °C, T_j limit 125 °C (°C/W)?', answer: 2.63, tol: 0.02, unit: '°C/W', explain: '(125 − 40 − 6)/30 = 79/30 = 2.63 °C/W.' },
    ],
  },
  assignment: {
    id: 'S1.M1.asg',
    title: 'Module assignment: complete design of a 24 V, 800 W square-wave inverter',
    brief: 'Calculate the key design values for a 24 V → 230 V, 50 Hz, 800 W square-wave inverter with typical drops of 1.2 V and r_x = 0.025, R_DS(on) = 4 mΩ, transformer η = 96 %, control 4 W.',
    tasks: [
      { id: 'a1', type: 'numeric', prompt: 'Turns ratio n = 230 / ((24 − 1.2) × 0.975)?', answer: 10.35, tol: 0.01, unit: '', explain: '230 / (22.8 × 0.975) = 10.35.' },
      { id: 'a2', type: 'numeric', prompt: 'Primary RMS current at nominal voltage, n·I_out with I_out = 800/230 (A)?', answer: 36.0, tol: 0.02, unit: 'A', explain: '10.35 × 3.478 = 36.0 A.' },
      { id: 'a3', type: 'numeric', prompt: 'Conduction loss 2·I²·R (W)?', answer: 10.37, tol: 0.03, unit: 'W', explain: '2 × 36.0² × 0.004 = 10.4 W.' },
      { id: 'a4', type: 'numeric', prompt: 'Efficiency (%) with transformer loss 800 × (1/0.96 − 1) = 33.3 W?', answer: 94.37, tol: 0.01, unit: '%', explain: 'ΣP = 10.4 + 33.3 + 4 = 47.7 W; η = 800/847.7 = 94.4 %.' },
      { id: 'a5', type: 'numeric', prompt: 'Worst-case DC current at 21 V (A)?', answer: 40.4, tol: 0.02, unit: 'A', explain: '847.7/21 = 40.4 A.' },
    ],
    written: [{ prompt: 'List the protection devices you would specify for this design with their ratings.', model: 'DC fuse ≥ 1.25 × 40.4 = 50.5 A → 60 A; AC breaker ≥ 1.25 × 3.48 = 4.35 A → 6 A; LVD at 21 V; chassis and neutral earthed with a 30 mA RCD on the output; over-temperature shut-down on the heat sink; electronic current limit on the bridge.' }],
  },
  practicals: [
    { id: 'S1.M1.P1', title: 'Configure a fully compatible design', description: 'In project D, choose a component selection with no failed compatibility checks.', link: to.build('Project D components', 'bld-d'), evidence: { kind: 'activity', id: 'build:design-ok:bld-d' } },
    { id: 'S1.M1.P2', title: 'Discharge a capacitor bank safely', description: 'Complete the guided discharge procedure in the 3D laboratory.', link: to.lab3d('LF-3K bus capacitors', 'lf3k', 'c1'), evidence: { kind: 'activity', id: 'lab3d:discharge' } },
  ],
}
