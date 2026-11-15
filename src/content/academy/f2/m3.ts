import type { AcademyModule } from '../types'
import { to } from '../s1/links'

/** F2.M3 Circuits. */
export const F2_M3: AcademyModule = {
  id: 'F2.M3',
  title: 'Circuits',
  summary: 'Series and parallel circuits, voltage and current dividers, Kirchhoff’s laws and combination circuits: the methods used to analyse any DC network, from sensor dividers to battery banks.',
  lessons: [
    {
      id: 'F2.M3.L1',
      title: 'Series circuits and voltage dividers',
      minutes: 35,
      content: {
        objectives: [
          'State the rules for current, voltage and resistance in a series circuit.',
          'Calculate the total resistance, current and each voltage in a series circuit.',
          'Design a voltage divider and explain how a load affects it.',
          'Explain why series cells add voltage, and why one open connection stops the whole circuit.',
        ],
        introduction: `In a [[series-circuit|series circuit]] components are connected end to end, forming a single path. Series connections are everywhere in inverter engineering: the cells inside a battery, the modules in a PV string, the resistors of the voltage-sensing divider that tells an inverter's controller what its battery voltage is.`,
        lecture: `### The three rules

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

One open connection — a broken wire, a blown fuse, a failed cell — stops the current through *everything*. One high-resistance element (a shaded PV module, a weak cell, a corroded link) limits the whole string. That is why PV modules include bypass diodes (course S2).`,
        technical: `**Divider power and impedance.** Lower resistances make a divider stiffer (less affected by loads and noise) but waste more power. A 60 V divider of 56 kΩ and 3.3 kΩ draws about 1 mA and dissipates about 60 mW, which is acceptable; 560 Ω and 33 Ω would waste 6 W. Designers balance stiffness against standby loss.

**Divider accuracy.** The ratio depends on resistor tolerance. Two ±1 % resistors give a ratio accurate to within about ±2 % in the worst case, which is why voltage-sense dividers are calibrated in firmware or built with 0.1 % parts (course F4).

**Polarity in series sources.** A cell connected backwards in a series string *subtracts* its EMF and can be driven into reverse charge, which damages it.`,
        diagrams: [{ id: 'series-parallel', caption: 'Series: one path, same current, voltages add. Parallel: same voltage, currents add.' }],
        formulas: [
          { name: 'Series resistance', expr: 'R_T = R₁ + R₂ + …', where: [] },
          { name: 'Voltage divider', expr: 'V_out = V_in · R₂ / (R₁ + R₂)', where: [['V_out', 'voltage across R₂', 'V']] },
        ],
        examples: [
          {
            title: 'A series circuit',
            problem: 'A 24 V supply feeds 100 Ω, 220 Ω and 160 Ω in series. Find the current and each voltage.',
            steps: ['R_T = 100 + 220 + 160 = 480 Ω', 'I = 24 / 480 = 0.05 A = 50 mA', 'V₁ = 0.05 × 100 = 5 V; V₂ = 0.05 × 220 = 11 V; V₃ = 0.05 × 160 = 8 V'],
            answer: '50 mA; 5 V, 11 V and 8 V.',
            check: '5 + 11 + 8 = 24 V. ✓',
          },
          {
            title: 'A battery-sense divider',
            problem: 'R₁ = 56 kΩ and R₂ = 3.3 kΩ divide a battery voltage. What is V_out when the battery is 54 V?',
            steps: ['V_out = 54 × 3.3 / (56 + 3.3)', 'V_out = 54 × 3.3 / 59.3 = 54 × 0.055 65 = 3.005 V'],
            answer: 'About 3.0 V: suitable for a 3.3 V analogue input.',
          },
        ],
        applications: `Battery and DC-bus voltage sensing, PV strings, cell stacks in batteries, LED strings, and the feedback dividers of regulators. The library's voltage sensor entry describes the divider used in inverters.`,
        mistakes: [
          { mistake: 'Using a voltage divider to power a load.', correction: 'The load drags the output down; use a regulator. Dividers feed high-impedance inputs only.' },
          { mistake: 'Forgetting that the current is the same in all series elements.', correction: 'Find the current once, from R_T, then each voltage.' },
          { mistake: 'Connecting one cell reversed in a series stack.', correction: 'Check polarity: a reversed cell subtracts and can be damaged.' },
        ],
        demo: {
          title: 'Voltage divider and loading',
          text: 'Set R₁ and R₂, then add a load across R₂ and watch V_out fall as the load resistance approaches R₂.',
          link: to.lib('Voltage sensor (a divider in practice)', 'voltage-sensor'),
          embed: 'divider',
        },
        activities: [to.lib('Voltage sensor', 'voltage-sensor'), to.proc('Voltage-sensor scaling check', 'voltage-sensor', 'vsense-scale')],
        check: [
          { id: 'k1', type: 'numeric', prompt: 'Total resistance of 1 kΩ, 2.2 kΩ and 4.7 kΩ in series (kΩ)?', answer: 7.9, tol: 0.01, unit: 'kΩ', explain: '1 + 2.2 + 4.7.' },
          { id: 'k2', type: 'numeric', prompt: 'V_out of a 12 V divider with R₁ = 10 kΩ, R₂ = 5 kΩ (V)?', answer: 4, tol: 0.01, unit: 'V', explain: '12 × 5/15 = 4 V.' },
          { id: 'k3', type: 'numeric', prompt: 'Voltage of a string of 16 LiFePO₄ cells at 3.2 V (V)?', answer: 51.2, tol: 0.01, unit: 'V', explain: '16 × 3.2.' },
          { id: 'k4', type: 'mcq', prompt: 'One module in a series PV string is heavily shaded. The string current…', options: ['is limited by that module (unless bypass diodes conduct)', 'is unaffected', 'doubles', 'reverses'], answer: 0, explain: 'One path: the weakest element limits the current.' },
        ],
        summary: [
          'Series: same current; voltages add; resistances add.',
          'Solve with R_T, then I, then each V; check the voltages add up.',
          'Divider: V_out = V_in·R₂/(R₁ + R₂); load it only lightly (R_L ≫ R₂).',
          'Series sources add voltage; capacity is that of one element.',
          'One open or weak element affects the whole series path.',
        ],
        homework: {
          id: 'F2.M3.L1.hw',
          title: 'Series and divider',
          brief: 'A 48 V battery-sense divider must give 2.5 V at 60 V.',
          tasks: [
            { id: 'h1', type: 'numeric', prompt: 'Required ratio R₂/(R₁ + R₂)?', answer: 0.04167, tol: 0.01, unit: '', explain: '2.5/60 = 0.041 67.' },
            { id: 'h2', type: 'numeric', prompt: 'With R₂ = 4.7 kΩ, R₁ (kΩ)?', answer: 108.1, tol: 0.01, unit: 'kΩ', explain: 'R₁ + R₂ = 4.7/0.041 67 = 112.8 kΩ → R₁ = 108.1 kΩ.' },
            { id: 'h3', type: 'numeric', prompt: 'V_out at 48 V with that divider (V)?', answer: 2, tol: 0.01, unit: 'V', explain: '48 × 0.041 67 = 2.0 V.' },
          ],
          written: [{ prompt: 'Why must the microcontroller input connected to this divider have a high input resistance?', model: 'The input is in parallel with R₂; a low input resistance would reduce the effective R₂, lowering V_out and making the battery-voltage reading wrong. A resistance much larger than R₂ (≥ 10×, ideally 100×) keeps the error small.' }],
        },
      },
    },
    {
      id: 'F2.M3.L2',
      title: 'Parallel circuits and current dividers',
      minutes: 35,
      content: {
        objectives: [
          'State the rules for voltage, current and resistance in a parallel circuit.',
          'Calculate the equivalent resistance of parallel resistors.',
          'Apply the current-divider rule.',
          'Explain why parallel batteries and PV strings add current, and the precautions they need.',
        ],
        introduction: `In a [[parallel-circuit|parallel circuit]] every component is connected across the same two nodes. Building wiring is parallel, so every appliance sees the full supply voltage. Battery banks and PV arrays use parallel connections to increase current capacity. Parallel circuits also hide a hazard: a short in one branch takes the full fault current of every other branch.`,
        lecture: `### The three rules

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

Each load gets the full voltage, can be switched independently, and a failed lamp does not turn off the others. The total current, and therefore the supply cable and main fuse, is the sum of the branch currents.`,
        technical: `**Conductance form.** With conductance G = 1/R, parallel conductances simply add: G_T = G₁ + G₂ + …. Nodal analysis, used by the circuit laboratory's solver, writes every node's equation in terms of conductances.

**Current sharing with unequal wiring.** Two parallel batteries with 5 mΩ internal resistance each, wired with 2 mΩ and 6 mΩ of cable, share current in the ratio of their total branch resistances: (5 + 6) : (5 + 2), so the near battery carries 11/18 = 61 % of the load. Over time it cycles harder and ages faster. Equal cable lengths prevent this.

**Circulating current.** Connecting a 13.2 V battery in parallel with a 12.6 V one through 10 mΩ total gives a momentary 60 A between them. Parallel connections are made at matched voltages.`,
        diagrams: [{ id: 'series-parallel', caption: 'Parallel branches share the same voltage; their currents add at the nodes.' }],
        formulas: [
          { name: 'Parallel resistance', expr: '1/R_T = 1/R₁ + 1/R₂ + …;  two resistors: R_T = R₁R₂/(R₁ + R₂)', where: [] },
          { name: 'Current divider (two branches)', expr: 'I₁ = I · R₂ / (R₁ + R₂)', where: [['I', 'total current', 'A']] },
        ],
        examples: [
          {
            title: 'Equivalent resistance',
            problem: 'Find the equivalent of 12 Ω, 6 Ω and 4 Ω in parallel, and the total current from 12 V.',
            steps: ['1/R_T = 1/12 + 1/6 + 1/4 = 0.0833 + 0.1667 + 0.25 = 0.5', 'R_T = 2 Ω', 'Branch currents: 1 A, 2 A, 3 A; total 6 A = 12/2 ✓'],
            answer: 'R_T = 2 Ω; total current 6 A.',
          },
          {
            title: 'Unequal sharing',
            problem: 'Two parallel battery branches have total resistances 7 mΩ and 11 mΩ and supply 90 A together. How much does each carry?',
            steps: ['I₁ (7 mΩ branch) = 90 × 11 / (7 + 11) = 55 A', 'I₂ (11 mΩ branch) = 90 × 7 / 18 = 35 A'],
            answer: '55 A and 35 A: the lower-resistance branch works harder.',
          },
        ],
        applications: `Parallel battery banks, parallel PV strings into a combiner, building circuits, current-sharing MOSFETs in inverter bridges and current-sense shunts all follow these rules.`,
        mistakes: [
          { mistake: 'Adding parallel resistances directly.', correction: 'Add reciprocals; the result is less than the smallest branch.' },
          { mistake: 'Paralleling batteries at different voltages or states of charge.', correction: 'Match them first; otherwise large circulating currents flow.' },
          { mistake: 'Leaving parallel strings or batteries without branch protection.', correction: 'A fault in one branch is fed by all the others; fuse each branch where required.' },
        ],
        demo: {
          title: 'Parallel branches in the solver',
          text: 'Use the circuit demonstration to add parallel branches and watch the total current rise while each branch keeps the full voltage.',
          link: to.ckt('Circuit lab: free circuit building (after F2)', 'ckt-01'),
          embed: 'ohms-law',
        },
        activities: [to.lib('Fuse (branch protection)', 'fuse'), to.lib('Battery terminals', 'battery-terminals')],
        check: [
          { id: 'k1', type: 'numeric', prompt: 'Equivalent of 330 Ω and 470 Ω in parallel (Ω)?', answer: 193.9, tol: 0.01, unit: 'Ω', explain: '330 × 470/800 = 193.9 Ω.' },
          { id: 'k2', type: 'numeric', prompt: 'Equivalent of four 100 Ω resistors in parallel (Ω)?', answer: 25, tol: 0.01, unit: 'Ω', explain: '100/4.' },
          { id: 'k3', type: 'numeric', prompt: 'Total current of 230 V loads drawing 2 A, 4.5 A and 0.3 A (A)?', answer: 6.8, tol: 0.01, unit: 'A', explain: 'Branch currents add.' },
          { id: 'k4', type: 'mcq', prompt: 'Two 12 V, 100 Ah batteries in parallel give…', options: ['12 V, 200 Ah', '24 V, 100 Ah', '24 V, 200 Ah', '12 V, 100 Ah'], answer: 0, explain: 'Parallel adds capacity at the same voltage.' },
        ],
        summary: [
          'Parallel: same voltage; currents add; reciprocals of resistance add.',
          'R_T is smaller than the smallest branch; two resistors: product over sum.',
          'Current divides inversely with resistance.',
          'Parallel sources add current and capacity; match voltages, equalise cables, fuse branches.',
          'Building wiring is parallel so every load sees full voltage.',
        ],
        homework: {
          id: 'F2.M3.L2.hw',
          title: 'Parallel circuits',
          brief: 'Three PV strings in parallel each deliver 9.8 A at 380 V into a combiner.',
          tasks: [
            { id: 'h1', type: 'numeric', prompt: 'Total current at the combiner output (A)?', answer: 29.4, tol: 0.01, unit: 'A', explain: '3 × 9.8.' },
            { id: 'h2', type: 'numeric', prompt: 'Power delivered (kW)?', answer: 11.17, tol: 0.01, unit: 'kW', explain: '380 × 29.4 = 11 172 W.' },
            { id: 'h3', type: 'numeric', prompt: 'If one string is shorted, the maximum reverse current into it from the other two (A)?', answer: 19.6, tol: 0.01, unit: 'A', explain: 'The other two strings feed it: 2 × 9.8 A.' },
          ],
          written: [{ prompt: 'Explain why parallel PV strings may need string fuses, using your answer to h3.', model: 'If one string develops a fault, the other parallel strings drive current backwards into it; with several strings this can exceed the module’s reverse-current rating and cause overheating or fire. String fuses (or limiting the number of parallel strings) protect against it.' }],
        },
      },
    },
    {
      id: 'F2.M3.L3',
      title: "Kirchhoff's laws and combination circuits",
      minutes: 40,
      content: {
        objectives: [
          "State Kirchhoff's current and voltage laws.",
          'Reduce series-parallel combination circuits step by step.',
          'Write and solve loop and node equations for a two-source circuit.',
          'Check solutions against the circuit laboratory solver.',
        ],
        introduction: `Real circuits mix series and parallel paths and may contain more than one source: a battery and a charger, a PV array and a battery, two batteries of different voltages. Kirchhoff's two laws solve any such network. The circuit laboratory's solver applies them automatically; this lesson teaches you to apply them yourself and check it.`,
        lecture: `### Kirchhoff's current law (KCL)

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
- The power from sources must equal the power in the resistors.`,
        technical: `**Matrix form.** For n unknown nodes, nodal analysis gives n simultaneous equations, G·v = i, where G is the conductance matrix. The circuit laboratory builds this matrix from your schematic (modified nodal analysis, which also handles voltage sources) and solves it by LU factorisation. That is why it can solve circuits of any size instantly.

**Superposition.** In a linear circuit with several sources, the response is the sum of the responses to each source acting alone (the others replaced by their internal resistance). It is a useful check on hand calculations.

**When Kirchhoff needs care.** KVL assumes no changing magnetic flux links the loop. In circuits with large, fast-changing currents (inverter switching loops), stray inductance makes "the voltage between two points" depend on the path. That is why layout matters in power electronics (course P2).`,
        diagrams: [{ id: 'kirchhoff', caption: 'KCL at a node: currents in equal currents out. KVL around a loop: EMFs equal the voltage drops.' }],
        formulas: [
          { name: "Kirchhoff's current law", expr: 'Σ I_in = Σ I_out  (at any node)', where: [] },
          { name: "Kirchhoff's voltage law", expr: 'Σ EMF = Σ I·R  (around any loop)', where: [] },
          { name: 'Branch current between two nodes', expr: 'I = (V_a − V_b) / R', where: [] },
        ],
        examples: [
          {
            title: 'Reducing a combination circuit',
            problem: 'A 12 V supply feeds R₁ = 4 Ω in series with a parallel pair R₂ = 6 Ω and R₃ = 12 Ω. Find the supply current and the current in R₃.',
            steps: ['R₂ ∥ R₃ = 6 × 12 / 18 = 4 Ω', 'R_T = 4 + 4 = 8 Ω; I = 12 / 8 = 1.5 A', 'V across the pair = 1.5 × 4 = 6 V; I₃ = 6 / 12 = 0.5 A (I₂ = 1 A)'],
            answer: 'Supply current 1.5 A; 0.5 A in R₃.',
            check: 'KCL: 1 + 0.5 = 1.5 A ✓. KVL: 1.5 × 4 + 6 = 12 V ✓.',
          },
          {
            title: 'Charger, battery and load',
            problem: 'A 14 V charger with 0.5 Ω output resistance and a 12 V battery with 0.1 Ω internal resistance both connect to node X, which also feeds a 2 Ω load to 0 V. Find V_X and the battery current.',
            steps: ['KCL at X: (14 − V_X)/0.5 + (12 − V_X)/0.1 = V_X/2', 'Expand: 28 − 2V_X + 120 − 10V_X = 0.5V_X → 148 = 12.5V_X → V_X = 11.84 V', 'Battery current = (12 − 11.84)/0.1 = 1.6 A out of the battery; charger (14 − 11.84)/0.5 = 4.32 A; load 11.84/2 = 5.92 A'],
            answer: 'V_X = 11.84 V; the battery supplies 1.6 A (it is discharging, because the load exceeds what the charger can supply at this voltage).',
            check: 'KCL: 4.32 + 1.6 = 5.92 A ✓.',
          },
        ],
        applications: `Every analysis of a charger, battery and inverter sharing a DC bus; current sharing in parallel strings; sensor circuits; and the solver in the circuit laboratory are applications of Kirchhoff’s laws.`,
        mistakes: [
          { mistake: 'Treating a negative current result as a mistake.', correction: 'It means the actual direction is opposite to the one you assumed.' },
          { mistake: 'Combining resistors that are not truly in series or parallel.', correction: 'Series means the same current with no branch between; parallel means connected across the same two nodes.' },
          { mistake: 'Mixing up signs when walking around a KVL loop.', correction: 'Choose a direction, and count rises and drops consistently.' },
        ],
        demo: {
          title: 'Check a hand solution with the solver',
          text: 'Solve a combination circuit by hand, then draw it in the circuit laboratory and compare every node voltage and branch current with the solver.',
          link: to.ckt('Circuit lab: battery and resistor circuit', 'ckt-01'),
          embed: 'divider',
        },
        activities: [to.ckt('Circuit lab: ckt-01 (extend it to a combination circuit)', 'ckt-01'), to.lib('Resistor', 'resistor')],
        check: [
          { id: 'k1', type: 'numeric', prompt: 'Currents of 3 A and 2.5 A enter a node; one wire leaves. Its current (A)?', answer: 5.5, tol: 0.01, unit: 'A', explain: 'KCL.' },
          { id: 'k2', type: 'numeric', prompt: 'A 24 V loop has drops of 10 V and 6.5 V and one more resistor. Its voltage (V)?', answer: 7.5, tol: 0.01, unit: 'V', explain: 'KVL: 24 − 16.5.' },
          { id: 'k3', type: 'numeric', prompt: '10 Ω in series with (20 Ω ∥ 20 Ω): total (Ω)?', answer: 20, tol: 0.01, unit: 'Ω', explain: '10 + 10.' },
          { id: 'k4', type: 'mcq', prompt: 'A nodal-analysis result gives a branch current of −0.8 A. This means…', options: ['0.8 A flows opposite to the assumed direction', 'an error', 'no current', 'the resistor is negative'], answer: 0, explain: 'The sign gives the direction.' },
        ],
        summary: [
          'KCL: current into a node equals current out.',
          'KVL: around a loop, EMFs equal the voltage drops.',
          'Reduce one-source circuits step by step, then work back out.',
          'For several sources, write KCL at unknown nodes (nodal analysis).',
          'Check with KCL, KVL and power balance.',
        ],
        homework: {
          id: 'F2.M3.L3.hw',
          title: 'Combination circuits',
          brief: 'A 9 V source feeds 3 Ω in series with (6 Ω ∥ 3 Ω).',
          tasks: [
            { id: 'h1', type: 'numeric', prompt: 'Equivalent of the parallel pair (Ω)?', answer: 2, tol: 0.01, unit: 'Ω', explain: '6 × 3/9 = 2 Ω.' },
            { id: 'h2', type: 'numeric', prompt: 'Supply current (A)?', answer: 1.8, tol: 0.01, unit: 'A', explain: '9/5 = 1.8 A.' },
            { id: 'h3', type: 'numeric', prompt: 'Current in the 6 Ω resistor (A)?', answer: 0.6, tol: 0.01, unit: 'A', explain: 'V_pair = 3.6 V; 3.6/6 = 0.6 A.' },
          ],
          written: [{ prompt: 'Show that power is conserved in this circuit.', model: 'Source: 9 × 1.8 = 16.2 W. Resistors: 3 Ω: 1.8² × 3 = 9.72 W; 6 Ω: 0.6² × 6 = 2.16 W; 3 Ω (parallel): 1.2² × 3 = 4.32 W; total 16.2 W ✓.' }],
        },
      },
    },
  ],
  quiz: {
    pass: 0.7,
    questions: [
      { id: 'q1', type: 'numeric', prompt: 'Current in 150 Ω + 270 Ω in series across 21 V (mA)?', answer: 50, tol: 0.01, unit: 'mA', explain: '21/420 = 0.05 A.' },
      { id: 'q2', type: 'numeric', prompt: 'Divider output: 18 V, R₁ = 12 kΩ, R₂ = 6 kΩ (V)?', answer: 6, tol: 0.01, unit: 'V', explain: '18 × 6/18.' },
      { id: 'q3', type: 'numeric', prompt: 'Equivalent of 10 Ω, 15 Ω and 30 Ω in parallel (Ω)?', answer: 5, tol: 0.01, unit: 'Ω', explain: '1/10 + 1/15 + 1/30 = 0.2.' },
      { id: 'q4', type: 'numeric', prompt: 'Current divider: 3 A total, R₁ = 2 Ω, R₂ = 4 Ω. Current in R₁ (A)?', answer: 2, tol: 0.01, unit: 'A', explain: '3 × 4/6 = 2 A.' },
      { id: 'q5', type: 'mcq', prompt: 'Two 24 V, 200 Ah batteries in series give…', options: ['48 V, 200 Ah', '24 V, 400 Ah', '48 V, 400 Ah', '24 V, 200 Ah'], answer: 0, explain: 'Series adds voltage.' },
      { id: 'q6', type: 'numeric', prompt: '8 Ω in series with (12 Ω ∥ 24 Ω) across 32 V: supply current (A)?', answer: 2, tol: 0.01, unit: 'A', explain: '12∥24 = 8 Ω; 32/16 = 2 A.' },
      { id: 'q7', type: 'mcq', prompt: 'KCL is a consequence of…', options: ['conservation of charge', 'conservation of momentum', 'Ohm’s law', 'magnetism'], answer: 0, explain: 'Charge cannot accumulate at a node.' },
      { id: 'q8', type: 'mcq', prompt: 'Connecting a load of 1 kΩ across R₂ = 10 kΩ of a divider…', options: ['pulls V_out down a lot', 'has no effect', 'raises V_out', 'only affects R₁'], answer: 0, explain: 'The parallel combination is only 909 Ω.' },
    ],
  },
  assignment: {
    id: 'F2.M3.asg',
    title: 'Module assignment: a battery-sense circuit and a two-battery bank',
    brief: 'Part A: an inverter senses its battery with R₁ = 100 kΩ and R₂ = 4.7 kΩ into an ADC with 1 MΩ input resistance. Part B: two parallel 12.8 V batteries (internal 6 mΩ each) are wired with 3 mΩ and 9 mΩ of cable to a load drawing 120 A.',
    tasks: [
      { id: 'a1', type: 'numeric', prompt: 'A: unloaded V_out at 57.6 V (V)?', answer: 2.586, tol: 0.01, unit: 'V', explain: '57.6 × 4.7/104.7 = 2.586 V.' },
      { id: 'a2', type: 'numeric', prompt: 'A: R₂ in parallel with the 1 MΩ input (kΩ)?', answer: 4.678, tol: 0.01, unit: 'kΩ', explain: '4.7 × 1000/1004.7 = 4.678 kΩ.' },
      { id: 'a3', type: 'numeric', prompt: 'A: loaded V_out (V)?', answer: 2.574, tol: 0.01, unit: 'V', explain: '57.6 × 4.678/104.678 = 2.574 V (0.4 % low).' },
      { id: 'a4', type: 'numeric', prompt: 'B: current in the battery with 3 mΩ cable (A)?', answer: 75, tol: 0.01, unit: 'A', explain: 'Branch resistances: 6 + 3 = 9 mΩ and 6 + 9 = 15 mΩ; I₁ = 120 × 15/(9 + 15) = 75 A (the other carries 45 A).' },
    ],
    written: [{ prompt: 'Comment on both results and recommend improvements for Part B.', model: 'A: the ADC loading error is small (0.4 %) and can be calibrated out. B: the near battery carries 75 A and the far one 45 A, so the near battery cycles harder and ages faster; use equal-length cables (or connect the load diagonally across the bank) and fuse each battery.' }],
  },
  practicals: [
    {
      id: 'F2.M3.P1',
      title: 'Circuit analysis assessment',
      description: 'Analyse series, parallel and combination circuits, including a two-source circuit. All answers must be correct.',
      task: {
        id: 'f2-circuit-analysis',
        kind: 'calc',
        title: 'Analysing DC circuits',
        brief: 'Circuit 1: a 24 V supply feeds R₁ = 6 Ω in series with (R₂ = 12 Ω ∥ R₃ = 6 Ω). Circuit 2: node X connects a 13.6 V charger through 0.2 Ω, a 12.8 V battery through 0.05 Ω, and a 1.6 Ω load to 0 V.',
        questions: [
          { id: 'c1', type: 'numeric', prompt: 'Circuit 1: total resistance (Ω)?', answer: 10, tol: 0.01, unit: 'Ω', explain: '12 ∥ 6 = 4 Ω; 6 + 4 = 10 Ω.' },
          { id: 'c2', type: 'numeric', prompt: 'Circuit 1: supply current (A)?', answer: 2.4, tol: 0.01, unit: 'A', explain: '24/10.' },
          { id: 'c3', type: 'numeric', prompt: 'Circuit 1: current in R₂ (A)?', answer: 0.8, tol: 0.01, unit: 'A', explain: 'V_pair = 2.4 × 4 = 9.6 V; 9.6/12 = 0.8 A.' },
          { id: 'c4', type: 'numeric', prompt: 'Circuit 2: node voltage V_X (V)?', answer: 12.64, tol: 0.005, unit: 'V', explain: 'KCL: (13.6 − V)/0.2 + (12.8 − V)/0.05 = V/1.6 → 68 + 256 = V(5 + 20 + 0.625) → V = 324/25.625 = 12.644 V.' },
          { id: 'c5', type: 'mcq', prompt: 'Circuit 2: is the battery charging or discharging?', options: ['Discharging: V_X is below 12.8 V', 'Charging: V_X is above 12.8 V'], answer: 0, explain: 'Current flows from the battery to the node when V_X < 12.8 V.' },
        ],
        explain: 'Reduce one-source circuits and work back out; for two sources write KCL at the shared node with each current as (V_source − V_X)/R.',
      },
      evidence: { kind: 'task', id: 'f2-circuit-analysis' },
    },
  ],
}
