import type { AcademyModule } from '../types'
import { to } from '../s1/links'

/** F1.M1 Electricity and its hazards. */
export const F1_M1: AcademyModule = {
  id: 'F1.M1',
  title: 'Electricity and its hazards',
  summary: 'What voltage, current and resistance are, and how electricity injures people and starts fires. This is the foundation for every safety rule in the programme.',
  lessons: [
    {
      id: 'F1.M1.L1',
      title: 'Voltage, current, resistance and the circuit',
      minutes: 35,
      content: {
        objectives: [
          'Describe voltage, current and resistance in everyday terms and give their units.',
          'Explain why current flows only in a complete circuit, and why a person can become part of that circuit.',
          'Use Ohm’s law, I = V / R, to estimate a current.',
          'Explain why voltage is what makes electricity dangerous to touch, and current is what causes harm.',
        ],
        introduction: `You do not need to be an engineer to understand why electricity is dangerous. You need three ideas — [[voltage]], [[current]] and [[resistance]] — and one rule: current flows only around a complete loop. Once you can picture these, every safety rule in this course makes sense: why we isolate, why we earth metal cases, why wet skin is dangerous, and why a fuse protects a cable.

This first lesson builds that picture. Course F2 then develops the same ideas into full circuit analysis.`,
        lecture: `### Current: the flow of charge

Electric [[current]] is a flow of electric [[charge]]. In a copper wire the moving charges are electrons. Copper is a [[conductor]] because its electrons are free to move. Current is measured in **amperes (A)**. One ampere is a flow of one coulomb of charge per second, which is about 6.24 × 10¹⁸ electrons every second.

| Current | Typical example |
|---|---|
| 0.02 A (20 mA) | An LED indicator |
| 0.5 A | A phone charger at the wall socket |
| 4 A | A 1 kW kettle on 230 V |
| 40 A | A 500 W inverter running from a 12 V battery |
| 1000 A or more | A 12 V battery short circuit |

### Voltage: the push

[[voltage|Voltage]] is the "push" that drives charge around a circuit. More precisely, it is the energy given to each coulomb of charge, measured in **volts (V)**. A 12 V battery gives 12 joules to every coulomb that passes through it. Voltage always exists *between two points*: the battery's two terminals, a mains socket's line and neutral, or a live wire and the earth you stand on.

### Resistance: the opposition

[[resistance|Resistance]] opposes current and is measured in **ohms (Ω)**. Copper wire has very little resistance. An [[insulator]] such as PVC or dry rubber has an enormous resistance. The human body lies in between, and its resistance changes greatly with conditions.

### Ohm's law

For many materials the current is proportional to the voltage:

**I = V / R**

Double the push and you double the flow; double the opposition and you halve it. This one equation explains most of electrical safety:

- A high voltage can drive a dangerous current through a body.
- A low resistance (wet skin, a metal floor) lets more current flow at the same voltage.
- A short circuit (R almost zero) draws an enormous current.

### The complete circuit

Current flows only around a **closed loop**: out from the source, through the load and back. Break the loop anywhere — open a switch, blow a fuse — and the current stops everywhere in the loop at once.

A person is injured when their body **completes a loop**. Two common ways:

- **Between two conductors.** Touching line and neutral at once, or a battery's positive and negative terminals.
- **Between a conductor and earth.** Most public supplies have their neutral connected to earth at the transformer. So touching just the line conductor while standing on the ground completes a loop through your body, the ground and the supply's earth connection. That is why "only touching one wire" is not safe.

### Two quantities, two dangers

- **Voltage determines whether a current can be driven *through you*.** Your body's resistance is relatively high, so it takes a significant voltage to push a harmful current through it.
- **Current determines the harm.** Current through the body causes shock. Large currents through wires and connections cause heating and fire.

This is why both "low-voltage" batteries and high-voltage mains are dangerous, in different ways: one can burn, the other can kill.`,
        technical: `**Ohm's law is a model, not a law of nature.** It holds well for metals at constant temperature. Many components do not obey it: diodes, lamps (whose filament resistance rises as it heats) and the human body (whose skin resistance falls as voltage rises and the skin breaks down). For safety estimates we still use I = V/R with a *typical* resistance, to get an order of magnitude.

**Conventional current versus electron flow.** By historical convention, current is drawn flowing from + to −. Electrons actually move the other way. All circuit analysis uses conventional current, and so does this programme.

**Power.** Electrical power is P = V·I, in watts. Combined with Ohm's law it becomes P = I²·R: the heating in a resistance rises with the square of the current. A wire carrying twice its rated current heats four times as fast. F2 develops this in full.

**AC and DC.** A battery gives direct current ([[dc]]), which flows one way. Mains gives alternating current ([[ac]]), which reverses 50 or 60 times a second. The safety principles in this course apply to both. Where the body's response differs, the difference is noted.`,
        diagrams: [{ id: 'circuit-loop', caption: 'A complete circuit, and the two ways a body can complete a loop: between two conductors, or between a conductor and earth.' }],
        formulas: [
          { name: 'Ohm’s law', expr: 'I = V / R   (V = I · R,  R = V / I)', where: [['I', 'current', 'A'], ['V', 'voltage', 'V'], ['R', 'resistance', 'Ω']] },
          { name: 'Electrical power', expr: 'P = V · I = I² · R', where: [['P', 'power', 'W']] },
          { name: 'Current as charge flow', expr: 'I = Q / t', where: [['Q', 'charge', 'C'], ['t', 'time', 's']] },
        ],
        examples: [
          {
            title: 'Current through a heater element',
            problem: 'A heating element has a resistance of 26.5 Ω and is connected to 230 V. What current flows, and what power does it produce?',
            steps: ['I = V / R = 230 / 26.5 = 8.68 A', 'P = V · I = 230 × 8.68 = 1996 W ≈ 2 kW'],
            answer: 'About 8.7 A and 2 kW: a typical fan heater.',
            check: 'P = I²·R = 8.68² × 26.5 = 1997 W. ✓',
          },
          {
            title: 'What resistance gives 1 A?',
            problem: 'What resistance would draw 1 A from (a) a 12 V battery and (b) a 230 V supply?',
            steps: ['(a) R = V / I = 12 / 1 = 12 Ω', '(b) R = 230 / 1 = 230 Ω'],
            answer: 'At 230 V even a fairly high resistance such as 230 Ω passes 1 A. That is why mains can drive dangerous currents through things, including people, that a 12 V battery cannot.',
          },
          {
            title: 'A short circuit',
            problem: 'A 12 V battery is shorted by a wire of 0.01 Ω (ignore the battery’s own resistance). What current would flow?',
            steps: ['Ohm’s law: I = V / R', 'I = 12 / 0.01 = 1200 A'],
            answer: '1200 A. A real battery’s internal resistance limits it somewhat, but the current is still hundreds of amperes, enough to melt the wire. Lesson F1.M2.L1 returns to this.',
          },
        ],
        applications: `Every electrical installation is designed around Ohm's law:

- **Cables** are sized so that the current they carry does not overheat them.
- **Fuses** open the loop when the current is too large.
- **Insulation** keeps the resistance between conductors and people very high.
- **Earthing** gives a fault current a low-resistance path, so that the protection operates quickly.`,
        mistakes: [
          { mistake: '“It’s only 12 volts, it can’t hurt.”', correction: 'A 12 V battery rarely gives a shock, but it can deliver hundreds of amperes into a short circuit and cause severe burns and fires.' },
          { mistake: '“If I touch only one wire, no current can flow.”', correction: 'The supply neutral is usually earthed, so a single live wire and the ground you stand on complete the loop.' },
          { mistake: '“Voltage flows through the wire.”', correction: 'Current flows; voltage is the push between two points that drives it.' },
        ],
        demo: {
          title: 'Ohm’s law with the body in the circuit',
          text: 'Set the voltage and the body resistance and see the resulting current, compared with published threshold ranges. Notice how strongly the current depends on the resistance of the skin and contact.',
          link: to.lib('Resistor: Ohm’s law and ratings', 'resistor'),
          embed: 'body-current',
        },
        activities: [to.lib('Fuse', 'fuse'), to.lib('Protective earth', 'protective-earth')],
        check: [
          { id: 'k1', type: 'numeric', prompt: 'Current through a 46 Ω load on 230 V (A)?', answer: 5, tol: 0.01, unit: 'A', explain: 'I = 230/46 = 5 A.' },
          { id: 'k2', type: 'mcq', prompt: 'What is needed for current to flow?', options: ['A complete loop from the source and back', 'Only a high voltage', 'Only a thick wire', 'A switch that is open'], answer: 0, explain: 'Current flows only around a closed circuit.' },
          { id: 'k3', type: 'mcq', prompt: 'Why can touching only the live wire of a mains supply give a shock?', options: ['The supply neutral is earthed, so the body and the ground complete the loop', 'Live wires attract current', 'It cannot', 'Because of the fuse'], answer: 0, explain: 'The ground is part of the circuit when the supply is earthed.' },
          { id: 'k4', type: 'numeric', prompt: 'Power drawn by a 12 Ω resistor on 12 V (W)?', answer: 12, tol: 0.01, unit: 'W', explain: 'I = 1 A; P = 12 × 1 = 12 W.' },
        ],
        summary: [
          'Current (A) is the flow of charge; voltage (V) is the push between two points; resistance (Ω) opposes current.',
          'Ohm’s law: I = V/R. Power: P = V·I = I²·R.',
          'Current flows only in a complete loop; a body can complete a loop between two conductors or between a conductor and earth.',
          'Voltage decides whether current can be driven through a person; current causes the harm.',
          'Low-voltage sources can still deliver huge short-circuit currents.',
        ],
        homework: {
          id: 'F1.M1.L1.hw',
          title: 'Ohm’s law practice',
          brief: 'Use I = V/R and P = V·I.',
          tasks: [
            { id: 'h1', type: 'numeric', prompt: 'A lamp draws 0.25 A from 12 V. Its resistance (Ω)?', answer: 48, tol: 0.01, unit: 'Ω', explain: 'R = 12/0.25 = 48 Ω.' },
            { id: 'h2', type: 'numeric', prompt: 'Power of that lamp (W)?', answer: 3, tol: 0.01, unit: 'W', explain: 'P = 12 × 0.25 = 3 W.' },
            { id: 'h3', type: 'numeric', prompt: 'Current drawn by a 2300 W kettle on 230 V (A)?', answer: 10, tol: 0.01, unit: 'A', explain: 'I = P/V = 2300/230 = 10 A.' },
          ],
          written: [{ prompt: 'Explain, using the idea of a complete loop, why a bird can sit on a single overhead line without harm but a person on a ladder touching the same line is in danger.', model: 'The bird touches only one conductor and nothing else, so there is no loop through its body and almost no voltage between its feet. The person on the ladder is also connected to the ground (through the ladder and their body), so the live line, the body and the earth form a loop with the earthed supply, and current flows through them.' }],
        },
      },
    },
    {
      id: 'F1.M1.L2',
      title: 'How electric current harms the body',
      minutes: 35,
      content: {
        objectives: [
          'Describe the effects of current through the body as current increases, using published threshold ranges.',
          'Explain why body resistance, current path and duration change the danger.',
          'Estimate body current for a given voltage and contact condition.',
          'Explain why 30 mA residual current devices are used.',
        ],
        introduction: `Electric shock is the passage of current through the body. The body runs on tiny electrical signals: nerves carry them, and the heart's rhythm is set by them. A current from outside, even a small one by electrical standards, interferes with those signals. This lesson explains what happens as the current increases, and which conditions make a shock more dangerous.

> The thresholds below are **approximate published ranges** from international studies of the effects of current on people (summarised in the IEC 60479 series). Individual people vary widely. Treat them as a guide to *orders of magnitude*, never as a "safe limit" to work near.`,
        lecture: `### Effects of current (AC, 50/60 Hz, hand to hand or hand to feet)

| Current through the body | Typical effect |
|---|---|
| About 0.5 mA | Threshold of perception: a slight tingle |
| A few mA | Painful; muscles start to react |
| About 5–10 mA | "Let-go" threshold: above this, many people cannot release a gripped conductor, because the current contracts the hand muscles |
| Tens of mA | Breathing difficulty; strong muscle contraction |
| About 30–50 mA and above, for long enough | Ventricular fibrillation becomes possible: the heart quivers instead of pumping. This is the main cause of death by electric shock |
| Amperes | Severe burns, internal tissue damage, cardiac arrest |

**Duration matters.** The fibrillation threshold falls as the shock lasts longer, especially if it spans a full heartbeat (about one second). This is why protective devices must disconnect *quickly*.

### Body resistance

The current depends on the body's resistance, which is mostly set by the **skin**.

- **Dry, intact skin** can have tens of thousands of ohms or more.
- **Wet, sweaty or broken skin, or a large contact area,** can bring the total down to about **1000 Ω or less**.
- **The body's interior** is only about 500 Ω.
- **Skin breaks down at higher voltages.** Above roughly 50–100 V its resistance collapses, which makes mains voltage especially dangerous.

Using Ohm's law with a typical 1000 Ω (wet conditions):

- 230 V → I = 230 / 1000 = 230 mA, far above the fibrillation range;
- 50 V → 50 mA;
- 12 V → 12 mA in very wet conditions. That is why even extra-low voltages are restricted in wet locations such as bathrooms and swimming pools.

### Current path

- A path **across the chest** (hand to hand, or left hand to feet) passes near the heart and is the most dangerous.
- A path through one hand only (for example, two fingers of the same hand) is less likely to affect the heart, but can still cause deep burns.

### DC versus AC

For the same current, DC is generally less likely than 50/60 Hz AC to cause fibrillation, and it has no clear "let-go" threshold. But:

- DC causes strong muscle contraction when it starts and stops.
- DC arcs are harder to extinguish (lesson L3).
- High-voltage DC, such as the 360–800 V buses in solar and high-frequency inverters, is lethal.

### Why 30 mA RCDs?

A residual current device ([[rcd]]) measures the difference between the current going out on the line and returning on the neutral. Any difference must be leaking somewhere, possibly through a person. A 30 mA RCD trips when the leakage reaches 30 mA, typically within tens of milliseconds at larger leakage currents. That is below the range where fibrillation is likely for such short durations. It is a powerful extra layer of protection, but **not a licence to work live**: it cannot protect against a shock between line and neutral, because no current leaks to earth.

### After a shock

Anyone who has had a significant shock should get medical attention, even if they feel fine: heart rhythm problems and internal burns can appear later. Never touch a person who is still in contact with a live conductor. Isolate the supply first.`,
        technical: `**Why the heart is vulnerable.** The heart's muscle cells contract in a coordinated wave triggered by an electrical signal. During one part of each heartbeat (the "vulnerable period" of the T-wave) a stimulus can disrupt this wave and start fibrillation. A shock lasting longer than one heartbeat is therefore much more dangerous than a very short one.

**Body impedance is not a simple resistor.** The skin behaves partly like a capacitor in parallel with a resistor, so its impedance falls at higher frequencies and higher voltages. The total body impedance for a large-area, hand-to-hand contact at 230 V is commonly quoted around 1 kΩ (published 50th-percentile values). That is the figure behind the typical 1000 Ω used in teaching estimates.

**Touch voltage limits.** Electrical installation standards limit how long a fault may leave a dangerous [[touch-voltage]] on exposed metal. For ordinary dry conditions the conventional limit is 50 V AC, and lower in wet conditions. That is why earthed metalwork combined with fast disconnection is the basis of shock protection (lesson F1.M4.L2).`,
        diagrams: [{ id: 'body-current', caption: 'Body current versus voltage for dry and wet contact, compared with the published threshold ranges.' }],
        formulas: [{ name: 'Body current estimate', expr: 'I_body ≈ V_touch / R_body', where: [['V_touch', 'voltage across the body', 'V'], ['R_body', 'total body resistance (≈ 1000 Ω wet, much higher dry)', 'Ω']], note: 'An order-of-magnitude estimate. Real body impedance varies with voltage, frequency, path and person.' }],
        examples: [
          {
            title: 'Mains contact with wet hands',
            problem: 'Estimate the current through a person touching 230 V with wet hands (R_body ≈ 1000 Ω). Compare it with the fibrillation range.',
            steps: ['I = 230 / 1000 = 0.23 A = 230 mA', 'The fibrillation range starts around 30–50 mA for long durations'],
            answer: 'About 230 mA: several times the level at which fibrillation becomes possible. Mains contact in wet conditions is potentially lethal.',
          },
          {
            title: 'Dry contact at 48 V DC',
            problem: 'A person touches both terminals of a 48 V battery with dry hands (R_body ≈ 20 kΩ). Estimate the current.',
            steps: ['Ohm’s law: I = V / R_body', 'I = 48 / 20 000 = 0.0024 A = 2.4 mA, above the perception threshold but below the let-go range for dry skin'],
            answer: 'About 2.4 mA: probably felt, possibly painful, below the let-go range. With wet or damaged skin the current could be ten or twenty times larger, so 48 V systems still need insulated terminals and care.',
          },
        ],
        applications: `These numbers explain the rules used everywhere:

- 30 mA RCDs on socket circuits.
- Fast disconnection times for faults.
- Lower extra-low-voltage limits in wet locations.
- Insulated tools.
- The rule that rescuers isolate the supply before touching a casualty.`,
        mistakes: [
          { mistake: '“There is a safe current, say 10 mA, so I can work near it.”', correction: 'Thresholds are approximate and vary by person, path and duration. Never plan to receive any shock: isolate instead.' },
          { mistake: '“An RCD makes live work safe.”', correction: 'An RCD does not trip for a shock between line and neutral (no earth leakage). It is additional protection, not permission.' },
          { mistake: 'Grabbing someone who is being electrocuted.', correction: 'You become part of the circuit. Isolate the supply first, or move them with a dry non-conductive object only if isolation is impossible.' },
        ],
        demo: {
          title: 'Body current explorer',
          text: 'Change the voltage and the contact condition (dry, damp, wet) and read the estimated body current against the threshold bands.',
          link: to.lib('Protective earth and RCD protection', 'protective-earth'),
          embed: 'body-current',
        },
        activities: [to.cmp('Fuse versus circuit breaker', 'fuse-vs-breaker'), to.lib('Circuit breaker', 'circuit-breaker')],
        check: [
          { id: 'k1', type: 'numeric', prompt: 'Estimated body current at 120 V with R_body = 1000 Ω (mA)?', answer: 120, tol: 0.01, unit: 'mA', explain: '120/1000 = 0.12 A = 120 mA.' },
          { id: 'k2', type: 'mcq', prompt: 'What is the main cause of death by electric shock?', options: ['Ventricular fibrillation of the heart', 'Hair loss', 'The tingling sensation', 'Static electricity'], answer: 0, explain: 'Fibrillation stops the heart pumping blood.' },
          { id: 'k3', type: 'mcq', prompt: 'Which condition makes a shock more dangerous?', options: ['Wet skin and a hand-to-hand path across the chest', 'Dry skin and a short contact', 'Rubber-soled shoes', 'A low voltage'], answer: 0, explain: 'Wet skin lowers resistance; the chest path passes near the heart.' },
          { id: 'k4', type: 'mcq', prompt: 'A 30 mA RCD will NOT protect against…', options: ['a shock between line and neutral', 'a shock from line to earth', 'leakage through a damaged cable to earth', 'a faulty appliance case touching line'], answer: 0, explain: 'Line-to-neutral current returns on the neutral, so there is no residual current to detect.' },
        ],
        summary: [
          'Approximate published ranges: perception ~0.5 mA, let-go ~5–10 mA, fibrillation possible from ~30–50 mA for long durations.',
          'Body resistance depends on skin condition: high when dry, ~1000 Ω or less when wet; it falls at higher voltage.',
          'Paths across the chest and longer durations are the most dangerous.',
          '30 mA RCDs disconnect earth-leakage shocks quickly, but not line-to-neutral shocks.',
          'Isolate before touching a casualty; seek medical attention after any significant shock.',
        ],
        homework: {
          id: 'F1.M1.L2.hw',
          title: 'Shock estimates',
          brief: 'Estimate body currents with I = V/R.',
          tasks: [
            { id: 'h1', type: 'numeric', prompt: '230 V, dry contact R = 50 kΩ: current (mA)?', answer: 4.6, tol: 0.02, unit: 'mA', explain: '230/50 000 = 4.6 mA.' },
            { id: 'h2', type: 'numeric', prompt: '230 V, wet contact R = 800 Ω: current (mA)?', answer: 287.5, tol: 0.02, unit: 'mA', explain: '230/800 = 287.5 mA.' },
            { id: 'h3', type: 'numeric', prompt: 'Voltage that drives 30 mA through 1000 Ω (V)?', answer: 30, tol: 0.01, unit: 'V', explain: 'V = 0.03 × 1000 = 30 V.' },
          ],
          written: [{ prompt: 'Why are extra-low-voltage limits lower in bathrooms and around swimming pools?', model: 'Wet skin and immersion greatly reduce body resistance, so a lower voltage can drive a dangerous current; standards therefore require lower voltages (or additional protection) in these locations.' }],
        },
      },
    },
    {
      id: 'F1.M1.L3',
      title: 'Shock, arc flash, burns and fire',
      minutes: 35,
      content: {
        objectives: [
          'Distinguish the four main electrical injuries: shock, arc flash, burns and secondary injuries.',
          'Explain how overloads, short circuits and poor connections start fires.',
          'Calculate the heat produced in a conductor or connection with P = I²R.',
          'Explain why DC arcs are particularly hard to extinguish.',
        ],
        introduction: `Shock is only one way electricity injures people. Many electrical injuries are **burns**:

- from an arc;
- from touching an overheated conductor;
- from molten metal sprayed by a short circuit.

Electrical **fires** destroy buildings and kill people who were never near the faulty equipment. And a mild shock can cause a fall from a ladder. This lesson covers these hazards, all of which apply with full force to battery and inverter systems.`,
        lecture: `### Arc flash

An electric arc forms when current jumps through the air between conductors:

- when a short circuit blows apart;
- when a connector carrying current is pulled apart;
- when a dropped tool bridges two terminals.

The arc is a column of ionised gas at thousands of degrees. It releases intense heat and ultraviolet light, can vaporise copper (which expands violently), and throws molten metal. An [[arc-flash|arc flash]] can cause severe burns and eye damage at a distance of a metre or more, *without touching anything*.

**Battery banks and DC buses can sustain powerful arcs.** A battery can supply very large currents, and DC has no zero-crossing to help the arc go out.

### Why DC arcs are stubborn

An AC current passes through zero 100 or 120 times a second, and an arc tends to go out at each zero. DC never passes through zero, so a DC arc, once established, can keep burning as long as the voltage can sustain it. This is why:

- DC switches, fuses and breakers must be specifically rated for DC at the system voltage. An AC-only switch may fail to interrupt DC.
- PV and battery connectors must never be disconnected under load.

### Burns from heating: P = I²R

Every resistance carrying current heats up, with power P = I²R.

- **Overload:** more current than a cable is rated for. Twice the current gives four times the heat. The insulation softens, ages, and eventually burns.
- **Short circuit:** a near-zero-resistance fault draws enormous current. Wires glow and melt within seconds unless a fuse or breaker opens.
- **Poor connections:** a loose or corroded terminal adds a small resistance exactly where cooling is poor. A few milliohms carrying 100 A can produce tens of watts in one small spot, enough to char plastic and start a fire. Loose connections are a leading cause of electrical fires in battery systems.

### Fire

Electrical fires start where heat builds up faster than it escapes: overloaded cables, loose connections, failed components, overheated batteries. Prevention means:

- correctly sized cables;
- protective devices (fuses and breakers sized for the cable);
- tight, correct connections (torque to the manufacturer's value);
- ventilation;
- keeping combustible materials away from equipment.

> **Electrical fires:** isolate the supply if it can be done safely. Never use water on energised equipment. Use an extinguisher rated for electrical fires (typically CO₂ or dry powder), and follow local emergency procedures. Lithium battery fires need special handling.

### Secondary injuries

A mild shock that is not harmful in itself can make someone jump back, drop a tool, or fall from a ladder. Many electrical accidents cause injury this way. Working on a stable platform, keeping tools secure and isolating first prevent them.`,
        technical: `**Energy in a fault.** The heating of a conductor during a short circuit depends on I²t: the square of the current multiplied by its duration. Fuses and breakers are rated by how quickly they limit I²t. Cables have a matching maximum I²t that their insulation can withstand. Coordinating the two is part of protection design (F1.M4.L1).

**Arc flash in industry.** Industrial installations calculate the "incident energy" an arc could deliver at a working distance. They set boundaries and arc-rated PPE accordingly, using standardised methods. That is specialist work beyond this course; the point here is that arcs injure at a distance.

**Lithium-ion batteries.** Damage, overcharge or internal faults can trigger [[thermal-runaway|thermal runaway]], in which cells heat themselves, vent flammable and toxic gases and can catch fire. LiFePO₄ chemistry is less prone to this than other lithium-ion chemistries, but no battery is risk-free (course P5).`,
        diagrams: [{ id: 'circuit-loop', caption: 'Where heat appears in a circuit: the load, the cables and every connection carry the same current and heat by I²R.' }],
        formulas: [
          { name: 'Heating in a resistance', expr: 'P = I² · R', where: [['P', 'heat produced', 'W'], ['I', 'current', 'A'], ['R', 'resistance', 'Ω']] },
          { name: 'Energy over time', expr: 'E = P · t', where: [['E', 'energy', 'J'], ['t', 'time', 's']] },
        ],
        examples: [
          {
            title: 'A loose battery terminal',
            problem: 'A corroded terminal has a resistance of 5 mΩ and carries 100 A. How much heat is produced in it?',
            steps: ['Heat in a resistance: P = I²R', 'P = 100² × 0.005 = 10 000 × 0.005 = 50 W, concentrated in one small joint'],
            answer: '50 W concentrated in a small terminal: like a soldering iron, enough to melt plastic and start a fire. A good connection (0.1 mΩ) would produce only 1 W.',
          },
          {
            title: 'Overloading a cable',
            problem: 'A cable produces 10 W of heat at its rated current. How much does it produce at 1.5 × and 2 × the rated current?',
            steps: ['Heat ∝ I²', '1.5×: 10 × 1.5² = 22.5 W', '2×: 10 × 2² = 40 W'],
            answer: '22.5 W and 40 W. Doubling the current quadruples the heat, which is why overload protection matters.',
          },
        ],
        applications: `Battery installation manuals specify terminal torques, cable sizes and fuse ratings for exactly these reasons. Thermal imaging cameras find loose connections by their heat before they fail (course S5). DC isolators and fuses are rated for DC breaking.`,
        mistakes: [
          { mistake: 'Using an AC-rated switch or fuse in a battery or PV DC circuit.', correction: 'DC arcs do not self-extinguish; use devices rated for DC at the system voltage.' },
          { mistake: 'Pulling a PV or battery connector apart under load.', correction: 'This draws an arc. Switch off the load and isolate first.' },
          { mistake: 'Using water on an electrical fire.', correction: 'Water conducts. Isolate if safe and use an extinguisher rated for electrical fires.' },
        ],
        demo: {
          title: 'Heat from a bad connection',
          text: 'Use the Ohm’s-law explorer in power mode: hold the current at 100 A and vary the connection resistance from 0.1 mΩ to 10 mΩ, watching the heat produced.',
          link: to.lib('Battery terminals', 'battery-terminals'),
          embed: 'ohms-law',
        },
        activities: [to.lib('Fuse: breaking capacity and DC ratings', 'fuse'), to.lib('Battery terminals', 'battery-terminals')],
        check: [
          { id: 'k1', type: 'numeric', prompt: 'Heat in a 2 mΩ connection carrying 150 A (W)?', answer: 45, tol: 0.01, unit: 'W', explain: '150² × 0.002 = 45 W.' },
          { id: 'k2', type: 'mcq', prompt: 'Why are DC arcs harder to extinguish than AC arcs?', options: ['DC current never passes through zero', 'DC is always higher voltage', 'DC arcs are colder', 'They are not'], answer: 0, explain: 'AC arcs tend to extinguish at each current zero.' },
          { id: 'k3', type: 'mcq', prompt: 'If the current in a cable doubles, its heating…', options: ['quadruples', 'doubles', 'halves', 'stays the same'], answer: 0, explain: 'P = I²R.' },
          { id: 'k4', type: 'mcq', prompt: 'An arc flash can injure…', options: ['a person standing nearby without touching anything', 'only the person touching the conductor', 'nobody if the voltage is DC', 'only in wet conditions'], answer: 0, explain: 'Heat, light and molten metal reach people at a distance.' },
        ],
        summary: [
          'Electrical injuries include shock, arc-flash burns, contact burns and secondary injuries such as falls.',
          'Heat in any resistance is P = I²R: overloads, shorts and loose connections cause fires.',
          'DC arcs do not self-extinguish; use DC-rated devices and never break DC circuits under load.',
          'Prevent fires with correct cable sizes, protection, tight connections and ventilation.',
          'Never use water on electrical fires; isolate if safe.',
        ],
        homework: {
          id: 'F1.M1.L3.hw',
          title: 'Heating calculations',
          brief: 'Use P = I²R and E = P·t.',
          tasks: [
            { id: 'h1', type: 'numeric', prompt: 'Heat in a 0.5 mΩ fuse holder carrying 80 A (W)?', answer: 3.2, tol: 0.01, unit: 'W', explain: '80² × 0.0005 = 3.2 W.' },
            { id: 'h2', type: 'numeric', prompt: 'Energy released by 50 W over 1 hour (kJ)?', answer: 180, tol: 0.01, unit: 'kJ', explain: '50 × 3600 = 180 000 J = 180 kJ.' },
            { id: 'h3', type: 'numeric', prompt: 'A connection heats 4 W at 40 A. Heat at 60 A (W)?', answer: 9, tol: 0.01, unit: 'W', explain: '4 × (60/40)² = 9 W.' },
          ],
          written: [{ prompt: 'List three precautions that prevent a battery terminal from becoming a fire hazard.', model: 'Tighten to the manufacturer’s torque with correct, clean lugs; use correctly sized cable with a fuse rated for the cable; inspect periodically for corrosion or heat discoloration (and ventilate the battery area).' }],
        },
      },
    },
  ],
  quiz: {
    pass: 0.8,
    questions: [
      { id: 'q1', type: 'numeric', prompt: 'Current drawn by a 23 Ω heater on 230 V (A)?', answer: 10, tol: 0.01, unit: 'A', explain: '230/23 = 10 A.' },
      { id: 'q2', type: 'mcq', prompt: 'Which quantity causes harm in the body?', options: ['Current', 'Resistance', 'Frequency', 'Insulation'], answer: 0, explain: 'Current through the body causes the effects; voltage drives it.' },
      { id: 'q3', type: 'mcq', prompt: 'The approximate let-go threshold for AC is…', options: ['about 5–10 mA', 'about 0.5 mA', 'about 1 A', 'about 100 A'], answer: 0, explain: 'Published ranges place it around 5–10 mA.' },
      { id: 'q4', type: 'numeric', prompt: 'Estimated body current at 230 V with 2300 Ω (mA)?', answer: 100, tol: 0.01, unit: 'mA', explain: '230/2300 = 0.1 A.' },
      { id: 'q5', type: 'mcq', prompt: 'Why must fault protection disconnect quickly?', options: ['The fibrillation threshold falls as shock duration increases', 'To save electricity', 'Because of the meter', 'It need not'], answer: 0, explain: 'Duration strongly affects danger.' },
      { id: 'q6', type: 'numeric', prompt: 'Heat in a 4 mΩ joint at 50 A (W)?', answer: 10, tol: 0.01, unit: 'W', explain: '50² × 0.004 = 10 W.' },
      { id: 'q7', type: 'mcq', prompt: 'Which device is required to interrupt a battery DC circuit safely?', options: ['A switch or fuse rated for DC at the system voltage', 'Any AC light switch', 'A plug pulled under load', 'A non-contact tester'], answer: 0, explain: 'DC arcs need DC-rated devices.' },
      { id: 'q8', type: 'multi', prompt: 'Which can injure without touching a live conductor? (select all)', options: ['Arc flash', 'Molten metal from a short circuit', 'A fall caused by a mild shock', 'Reading a meter display'], answers: [0, 1, 2], explain: 'Arcs, molten metal and secondary injuries all harm without direct contact.' },
    ],
  },
  assignment: {
    id: 'F1.M1.asg',
    title: 'Module assignment: hazard analysis of a battery workbench',
    brief: 'A 24 V battery bank (internal resistance 20 mΩ) is on a workbench with a 230 V soldering station plugged in nearby.',
    tasks: [
      { id: 'a1', type: 'numeric', prompt: 'Prospective short-circuit current of the battery through a 5 mΩ spanner (A)?', answer: 960, tol: 0.01, unit: 'A', explain: '24/(0.020 + 0.005) = 960 A.' },
      { id: 'a2', type: 'numeric', prompt: 'Heat in the spanner (kW)?', answer: 4.608, tol: 0.02, unit: 'kW', explain: '960² × 0.005 = 4608 W.' },
      { id: 'a3', type: 'numeric', prompt: 'Body current if a wet hand (1000 Ω) touches 230 V (mA)?', answer: 230, tol: 0.01, unit: 'mA', explain: '230/1000 = 230 mA.' },
    ],
    written: [{ prompt: 'Name the two different hazards on this bench and one control for each.', model: 'Battery short circuit (burns, arc, fire): insulated tools, remove jewellery, terminal covers, a fuse at the battery. Mains shock from the soldering station: an RCD-protected socket, an undamaged cable, keeping it away from water.' }],
  },
  practicals: [
    {
      id: 'F1.M1.P1',
      title: 'Identify the hazards on a workbench',
      description: 'Find every electrical hazard in a described workshop scene, and only the hazards.',
      task: {
        id: 'f1-hazards-bench',
        kind: 'hazards',
        title: 'Workbench hazard identification',
        brief: 'Read the description of the workbench, then select every item that is an electrical hazard. Items that are good practice must not be selected.',
        scene: 'A technician is preparing to replace a fuse in a 12 V inverter connected to a 100 Ah battery. The bench has: a spanner lying across the battery terminals area; the technician wearing a metal watch; a battery with plastic terminal covers fitted on the negative but not the positive; a puddle of spilled coffee next to a mains extension lead; a voltage tester and its proving unit; an extension lead whose outer sheath is cracked, showing the coloured inner wires; a fire extinguisher rated for electrical fires on the wall; and the inverter still switched on with the battery connected.',
        items: [
          { id: 'spanner', label: 'Spanner lying near the battery terminals', hazard: true, why: 'It could bridge the terminals and short the battery: hundreds of amperes, burns and fire.' },
          { id: 'watch', label: 'Metal watch on the wrist', hazard: true, why: 'Metal jewellery can bridge terminals and heat instantly. Remove rings, watches and bracelets.' },
          { id: 'cover', label: 'Positive terminal uncovered', hazard: true, why: 'The exposed positive terminal can be shorted to the frame or a tool; covers should be on both.' },
          { id: 'liquid', label: 'Spilled liquid beside the mains extension lead', hazard: true, why: 'Liquid near mains lowers resistance and can cause shock or tracking.' },
          { id: 'tester', label: 'Voltage tester with proving unit', hazard: false, why: 'Good practice: needed to prove dead before work.' },
          { id: 'sheath', label: 'Cracked extension-lead sheath', hazard: true, why: 'Damaged insulation exposes conductors to touch and mechanical damage. Take the lead out of use.' },
          { id: 'extinguisher', label: 'Electrical-rated fire extinguisher', hazard: false, why: 'Good practice: correct extinguisher available.' },
          { id: 'live', label: 'Inverter on and battery still connected while replacing a fuse', hazard: true, why: 'The work must be done isolated: switch off, disconnect the battery and prove dead first.' },
        ],
        explain: 'Hazards are anything that could create a short circuit, a shock path or an arc, or that leaves equipment energised during work. The tester and the extinguisher are controls, not hazards.',
      },
      evidence: { kind: 'task', id: 'f1-hazards-bench' },
    },
  ],
}
