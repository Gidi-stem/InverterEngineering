import type { AcademyModule } from '../types'
import { to } from '../s1/links'

/** F1.M4 Protection, earthing and workshop practice. */
export const F1_M4: AcademyModule = {
  id: 'F1.M4',
  title: 'Protection, earthing and workshop practice',
  summary: 'How fuses, breakers, earthing, RCDs and insulation protect people and property, and how to organise safe practical work: PPE, rated tools and instruments, risk assessment and knowing when to stop.',
  lessons: [
    {
      id: 'F1.M4.L1',
      title: 'Fuses and circuit breakers',
      minutes: 35,
      content: {
        objectives: [
          'Explain what overcurrent protection protects, and what it does not.',
          'Apply the coordination rule I_b ≤ I_n ≤ I_z to choose a protective device.',
          'Distinguish overload and short-circuit protection, and explain breaking capacity.',
          'Select a fuse for a battery circuit from its maximum current and cable rating.',
        ],
        introduction: `A [[fuse]] or a [[breaker|circuit breaker]] is the device that opens a circuit when the current becomes dangerous. Its job is very specific: it protects the **cable and equipment from overheating and fire**. It does not protect people from shock, and it does not protect sensitive semiconductors, which fail far faster than any fuse can act. Choosing it correctly is a basic engineering skill.`,
        lecture: `### Two kinds of overcurrent

- **Overload:** a moderate excess current that persists, such as too many appliances on a circuit or a motor straining. The cable heats slowly, so protection can take seconds to minutes.
- **Short circuit:** a fault with almost no resistance, drawing enormous current. Protection must act within milliseconds, before the cable is damaged.

### How the devices work

- **A fuse** contains a calibrated element that melts when the current is too high for too long. It is simple, fast and reliable, but must be replaced after operating.
- **A circuit breaker** combines two mechanisms:
  - a *thermal* trip (a bimetal strip) for overloads;
  - a *magnetic* trip (a coil) for short circuits.
  It can be reset, and some types are also suitable for isolation.

Both have a **time–current characteristic**: the larger the overcurrent, the faster they operate.

### The coordination rule

For a circuit with design current I_b, protective device rating I_n and cable current-carrying capacity [[ampacity|I_z]]:

**I_b ≤ I_n ≤ I_z**

- The device must carry the normal current without operating (I_n ≥ I_b).
- It must operate before the cable overheats (I_n ≤ I_z).

Battery and inverter circuits commonly also apply a margin, I_n ≥ 1.25 × the maximum continuous current, so that the device does not age or trip in normal use. This is the rule used in course S1.

### Breaking capacity

A protective device must be able to **interrupt the largest fault current** that can flow at its location (the prospective short-circuit current) without exploding or welding shut. A battery bank can deliver several kiloamperes (lesson F1.M2.L1), so battery fuses must have a breaking capacity above that, at the DC voltage. A cheap automotive fuse may not interrupt a large battery's fault current safely.

### What protection does *not* do

- It does **not prevent shock**. A few tens of milliamperes through a person is far below any fuse rating. Earthing and RCDs handle that (lesson L2).
- It does **not protect semiconductors**. A MOSFET fails within microseconds of a short. Inverters need electronic current limiting.
- It does **not** stop a PV fault whose current is close to normal (lesson F1.M2.L3).`,
        technical: `**I²t.** A fuse's let-through energy is characterised by I²t, the integral of current squared over its operating time. A cable can withstand a maximum I²t = k²S², where S is its cross-section and k a constant for its conductor and insulation (about 115 for PVC-insulated copper in installation standards). The fuse's I²t must be below the cable's.

**DC ratings.** A fuse or breaker rated "250 V AC" may be rated much lower for DC, or not at all, because a DC arc does not self-extinguish (lesson F1.M1.L3). Always check the DC voltage rating, and for breakers check polarity marking: some DC breakers must be connected the right way round.

**Selectivity.** In larger systems, devices are chosen so that the one closest to a fault operates first, leaving the rest of the installation working. That is called discrimination or selectivity.`,
        diagrams: [{ id: 'protection-chain', caption: 'Each protective device protects against a specific harm: fuses and breakers protect wiring.' }],
        formulas: [
          { name: 'Coordination rule', expr: 'I_b ≤ I_n ≤ I_z', where: [['I_b', 'design (normal maximum) current', 'A'], ['I_n', 'device rating', 'A'], ['I_z', 'cable current-carrying capacity', 'A']] },
          { name: 'Margin used for battery and inverter circuits', expr: 'I_n ≥ 1.25 · I_max  (next standard size)', where: [['I_max', 'maximum continuous current', 'A']] },
          { name: 'Breaking capacity requirement', expr: 'I_cu ≥ I_sc (at the device, at the system voltage)', where: [['I_cu', 'rated breaking capacity', 'A'], ['I_sc', 'prospective short-circuit current', 'A']] },
        ],
        examples: [
          {
            title: 'Fuse for an inverter battery cable',
            problem: 'A 1000 W, 12 V inverter draws at most 105 A (at low battery). The cable is rated I_z = 160 A. Standard fuse sizes include 100, 125, 150 and 200 A. Choose the fuse.',
            steps: ['Margin: I_n ≥ 1.25 × 105 = 131 A → next standard size 150 A', 'Check I_n ≤ I_z: 150 ≤ 160 ✓'],
            answer: 'A 150 A fuse, with a DC voltage rating ≥ 14.4 V and a breaking capacity above the battery’s fault current.',
          },
          {
            title: 'A cable that is too small',
            problem: 'The same inverter is wired with cable rated I_z = 120 A. Can the 150 A fuse protect it?',
            steps: ['I_n = 150 A > I_z = 120 A ✗ (the cable could overheat without the fuse operating)', 'Options: larger cable (I_z ≥ 150 A), or reduce the load so a smaller fuse is adequate'],
            answer: 'No. The fuse must never be larger than the cable rating. Use a larger cable.',
          },
        ],
        applications: `Every circuit in a building or an inverter system has overcurrent protection sized by these rules. Course S1's configurator calculates fuse and breaker sizes in exactly this way. Course S2 applies them to PV strings and battery banks.`,
        mistakes: [
          { mistake: 'Replacing a blown fuse with a larger one “because it kept blowing”.', correction: 'A blowing fuse indicates a fault or an overload. A larger fuse removes the cable’s protection: find the cause.' },
          { mistake: 'Using an AC-only breaker on a battery circuit.', correction: 'Use devices rated for DC at the system voltage, with adequate breaking capacity.' },
          { mistake: 'Believing a fuse protects people from shock.', correction: 'Shock currents are far below fuse ratings; earthing and RCDs protect people.' },
        ],
        demo: {
          title: 'Fuse versus breaker',
          text: 'Read the library’s comparison of fuses and circuit breakers: operating principles, characteristics, DC ratings and when each is used.',
          link: to.cmp('Fuse versus circuit breaker', 'fuse-vs-breaker'),
        },
        activities: [to.lib('Fuse', 'fuse'), to.lib('Circuit breaker', 'circuit-breaker'), to.proc('Fuse check procedure', 'fuse', 'fuse-check')],
        check: [
          { id: 'k1', type: 'numeric', prompt: 'Minimum fuse rating for a 60 A maximum current with the 1.25 margin (A)?', answer: 75, tol: 0.01, unit: 'A', explain: '1.25 × 60 = 75 A, then round up to a standard size.' },
          { id: 'k2', type: 'mcq', prompt: 'A cable rated 100 A is protected by a 125 A fuse. This is…', options: ['wrong: I_n must not exceed I_z', 'correct', 'correct if the fuse is fast', 'only wrong for AC'], answer: 0, explain: 'I_n ≤ I_z.' },
          { id: 'k3', type: 'mcq', prompt: 'What does breaking capacity describe?', options: ['The largest fault current the device can safely interrupt', 'The normal current rating', 'The voltage drop', 'The number of operations'], answer: 0, explain: 'It must exceed the prospective fault current.' },
          { id: 'k4', type: 'mcq', prompt: 'Overcurrent devices primarily protect…', options: ['cables and equipment from overheating and fire', 'people from shock', 'MOSFETs from short circuits', 'batteries from sulphation'], answer: 0, explain: 'That is their purpose.' },
        ],
        summary: [
          'Fuses and breakers protect wiring and equipment from overload and short circuit.',
          'Coordination: I_b ≤ I_n ≤ I_z; in battery circuits I_n ≥ 1.25·I_max.',
          'Breaking capacity must exceed the prospective fault current at the system (DC) voltage.',
          'They do not protect against shock or protect semiconductors.',
          'Never up-rate a blowing fuse: find the fault.',
        ],
        homework: {
          id: 'F1.M4.L1.hw',
          title: 'Protection selection',
          brief: 'Standard sizes: 20, 25, 32, 40, 50, 63, 80, 100, 125 A.',
          tasks: [
            { id: 'h1', type: 'numeric', prompt: 'A 24 V inverter draws 38 A maximum. Standard fuse with the 1.25 margin (A)?', answer: 50, tol: 0.001, unit: 'A', explain: '1.25 × 38 = 47.5 → 50 A.' },
            { id: 'h2', type: 'mcq', prompt: 'The cable is rated 45 A. Is the 50 A fuse acceptable?', options: ['No: use a larger cable', 'Yes'], answer: 0, explain: 'I_n (50) > I_z (45).' },
            { id: 'h3', type: 'numeric', prompt: 'Battery fault current if V = 25.6 V and R_int + wiring = 8 mΩ (A)?', answer: 3200, tol: 0.01, unit: 'A', explain: '25.6/0.008 = 3200 A: the fuse breaking capacity must exceed this.' },
          ],
          written: [{ prompt: 'Explain why a fuse that keeps blowing must not be replaced with a larger one.', model: 'The fuse is sized to protect the cable; a larger fuse would let the cable overheat before operating, risking fire. Repeated blowing indicates an overload or fault that must be found and corrected.' }],
        },
      },
    },
    {
      id: 'F1.M4.L2',
      title: 'Earthing, bonding, RCDs and insulation',
      minutes: 35,
      content: {
        objectives: [
          'Explain how protective earthing and automatic disconnection prevent dangerous touch voltages.',
          'Explain the operating principle of an RCD and its limits.',
          'Distinguish basic insulation, double insulation and the IP code.',
          'Calculate a fault current and touch voltage in a simple earth-fault loop.',
        ],
        introduction: `Fuses protect cables; **earthing and RCDs protect people**. If insulation fails inside an appliance and the line conductor touches its metal case, the case becomes live. Earthing and protective devices are designed so that this fault is cleared within a fraction of a second, before anyone can be harmed. Insulation is the first barrier; earthing and RCDs are the safety net.`,
        lecture: `### Protective earthing and automatic disconnection

Exposed metal parts (cases, frames, enclosures) are connected by a [[protective-earth]] conductor (PE, green/yellow) to the installation's earthing system. If a line conductor touches the case:

1. A large **fault current** flows from line, through the case and the PE conductor, back to the source.
2. This current is large enough to make the fuse or breaker operate quickly. That is **automatic disconnection of supply**.
3. While the fault persists, the case rises to a [[touch-voltage|touch voltage]]. The design keeps this low or short-lived.

The path the fault current takes is the **earth fault loop**. Its impedance must be low enough to give a fault current that operates the protection within the required time.

### Bonding

**Equipotential bonding** connects metal parts that a person could touch at the same time (pipes, structural steel, equipment frames). They therefore rise to the same voltage during a fault, so there is no dangerous voltage *between* them.

### The RCD

A residual current device ([[rcd]]) passes the line and neutral conductors through a sensing core.

- Normally the outgoing and returning currents are equal and cancel.
- If some current leaks to earth (through a damaged cable, a wet appliance, or a person), the imbalance is detected. A 30 mA RCD disconnects at a residual current of 30 mA or less, typically within tens of milliseconds for larger leakage.

**Limits:** an RCD does not detect line-to-neutral contact (the current returns on the neutral), nor overcurrent. It is *additional* protection.

### Insulation

- **Basic insulation** covers live parts so they cannot be touched.
- **[[double-insulation|Double or reinforced insulation (Class II)]]** adds a second independent layer, so that a single insulation failure cannot make accessible parts live. Class II equipment has no earth connection.
- **Enclosures and the [[ip-code|IP code]]:** IP2X means fingers cannot reach live parts; IPX4 is splash-proof; IP65 is dust-tight and protected against water jets. Outdoor PV and inverter equipment needs a suitable IP rating.

### Earthing in inverter systems

- Inverter chassis are bonded to PE.
- The AC output's neutral–earth arrangement depends on the installation's earthing system and the manufacturer's instructions. In off-grid systems the inverter often creates the neutral–earth bond itself.
- PV array frames are bonded.

These are installation design decisions covered in course S3. The F1 principle is simple: **exposed metal must be earthed or double-insulated, and faults must disconnect quickly.**`,
        technical: `**Fault current calculation.** In a simplified TN system, the fault current is I_f = U₀ / Z_s, where U₀ is the line-to-earth voltage (230 V) and Z_s the earth-fault loop impedance. The protective device must operate within the required disconnection time at I_f. For example, a type B breaker of rating I_n operates magnetically at 3–5 × I_n.

**Touch voltage.** During a fault, the case voltage is roughly I_f × R_PE (the resistance of the protective conductor from the case to the main earthing point). Equipotential bonding reduces the voltage *between* simultaneously accessible parts.

**Earthing systems.** TN-S, TN-C-S and TT differ in how the neutral and earth are connected and where. In TT systems, earth-fault currents are small (limited by the earth-electrode resistance), so RCDs provide the disconnection. That is specialist installation design, governed by local regulations (course S3).`,
        diagrams: [
          { id: 'fault-loop', caption: 'An earth fault: current flows from line, through the faulty case and the protective earth, back to the source, operating the protection.' },
          { id: 'rcd', caption: 'RCD principle: line and neutral currents cancel in the core; a leak to earth leaves a residual current that trips the device.' },
        ],
        formulas: [
          { name: 'Earth-fault current', expr: 'I_f = U₀ / Z_s', where: [['U₀', 'line-to-earth voltage', 'V'], ['Z_s', 'earth-fault loop impedance', 'Ω']] },
          { name: 'Touch voltage on a faulty case', expr: 'U_t ≈ I_f · R_PE', where: [['R_PE', 'protective conductor resistance from the case', 'Ω']] },
          { name: 'Residual current', expr: 'I_Δ = I_line − I_neutral', where: [] },
        ],
        examples: [
          {
            title: 'Will the breaker trip?',
            problem: 'A 230 V circuit has an earth-fault loop impedance of 1.15 Ω and is protected by a 16 A type B breaker, which trips magnetically at 5 × I_n. Will an earth fault trip it instantly?',
            steps: ['I_f = 230 / 1.15 = 200 A', 'Magnetic trip at 5 × 16 = 80 A', '200 A > 80 A ✓'],
            answer: 'Yes. 200 A operates the magnetic trip within a fraction of a second.',
          },
          {
            title: 'Residual current',
            problem: 'A washing machine draws 8.000 A on the line conductor and 7.975 A returns on the neutral. What is the residual current, and will a 30 mA RCD trip?',
            steps: ['I_Δ = 8.000 − 7.975 = 0.025 A = 25 mA', '25 mA is below 30 mA; the RCD may hold (it trips somewhere between 50 % and 100 % of 30 mA)'],
            answer: '25 mA of leakage. The RCD may or may not trip; such a leak shows insulation is deteriorating and needs investigating.',
          },
        ],
        applications: `Earthing and RCDs are required in building wiring regulations worldwide. Inverter installation manuals specify the earthing arrangement. Course S3 teaches the testing used during commissioning: continuity, insulation resistance, earth-fault loop impedance and RCD trip time.`,
        mistakes: [
          { mistake: 'Removing the earth wire because the RCD keeps tripping.', correction: 'The RCD is detecting a leak. Find the fault; removing the earth makes the equipment dangerous.' },
          { mistake: 'Assuming double-insulated equipment needs an earth.', correction: 'Class II equipment is designed to be safe without an earth connection; it must not be earthed through its accessible parts.' },
          { mistake: 'Believing an RCD protects against touching line and neutral together.', correction: 'No current leaks to earth in that case, so the RCD cannot detect it.' },
        ],
        demo: {
          title: 'Earth connections in a real inverter',
          text: 'Find the protective earth stud and the bonding of the enclosure in the LF-3K model, and read the library entry on protective earth.',
          link: to.lab3d('LF-3K protective earth', 'lf3k', 'pe'),
        },
        activities: [to.lib('Protective earth', 'protective-earth'), to.proc('PE continuity test', 'protective-earth', 'pe-continuity'), to.lab3d('LF-3K cover (bonded enclosure)', 'lf3k', 'cover')],
        check: [
          { id: 'k1', type: 'numeric', prompt: 'Earth-fault current with U₀ = 230 V and Z_s = 0.92 Ω (A)?', answer: 250, tol: 0.01, unit: 'A', explain: '230/0.92 = 250 A.' },
          { id: 'k2', type: 'numeric', prompt: 'Residual current: line 5.040 A, neutral 5.000 A (mA)?', answer: 40, tol: 0.01, unit: 'mA', explain: '0.040 A = 40 mA: a 30 mA RCD trips.' },
          { id: 'k3', type: 'mcq', prompt: 'What makes the fuse or breaker operate on an earth fault?', options: ['A large fault current through the protective earth conductor', 'The RCD only', 'The touch voltage', 'The insulation'], answer: 0, explain: 'Low earth-fault loop impedance gives a large current.' },
          { id: 'k4', type: 'mcq', prompt: 'IP2X means…', options: ['fingers cannot reach live parts', 'fully waterproof', 'dust-tight', 'no protection'], answer: 0, explain: 'First digit 2: protected against objects ≥ 12.5 mm (fingers).' },
        ],
        summary: [
          'Earthing plus automatic disconnection clears faults on exposed metal quickly.',
          'Bonding keeps simultaneously accessible metal parts at the same voltage.',
          'RCDs trip on residual (leakage) current, e.g. 30 mA; they do not detect line–neutral contact.',
          'Insulation (basic, double), enclosures and IP ratings are the first barrier.',
          'Never remove earths to stop RCD trips: find the leak.',
        ],
        homework: {
          id: 'F1.M4.L2.hw',
          title: 'Earth-fault calculations',
          brief: 'A 230 V circuit protected by a 20 A type B breaker (magnetic trip 5 × I_n).',
          tasks: [
            { id: 'h1', type: 'numeric', prompt: 'Maximum Z_s for the magnetic trip to operate (Ω)?', answer: 2.3, tol: 0.01, unit: 'Ω', explain: 'I_f ≥ 100 A → Z_s ≤ 230/100 = 2.3 Ω.' },
            { id: 'h2', type: 'numeric', prompt: 'Fault current if Z_s = 0.8 Ω (A)?', answer: 287.5, tol: 0.01, unit: 'A', explain: '230/0.8 = 287.5 A.' },
            { id: 'h3', type: 'numeric', prompt: 'Touch voltage if R_PE = 0.3 Ω carries that current (V)?', answer: 86.25, tol: 0.01, unit: 'V', explain: '287.5 × 0.3 = 86 V, which exists only until the breaker trips (milliseconds).' },
          ],
          written: [{ prompt: 'Why is an RCD added even when earthing and breakers are correctly designed?', model: 'Breakers need a large fault current; an RCD detects small leakage currents (such as through a person or damp insulation) that would never operate a breaker, and disconnects quickly, giving additional protection against shock.' }],
        },
      },
    },
    {
      id: 'F1.M4.L3',
      title: 'Workshop practice: PPE, tools, measurement categories and risk assessment',
      minutes: 35,
      content: {
        objectives: [
          'Apply the hierarchy of controls to an electrical task.',
          'Choose appropriately rated tools, instruments and PPE, including measurement categories.',
          'Carry out and record a simple risk assessment.',
          'Recognise when a task is beyond your competence and must be handed to a qualified person.',
        ],
        introduction: `Safe practical work is organised before the first tool is picked up. This lesson brings the module together:

- **plan** the task;
- **control** the risks in the right order;
- use tools and instruments **rated** for the job;
- know when to **stop**.

These habits apply in the virtual laboratory as they will in any supervised practical training.`,
        lecture: `### The hierarchy of controls

Controls are applied in this order, most effective first:

1. **Eliminate:** remove the hazard. Work dead (isolated) instead of live.
2. **Substitute:** use a lower-hazard alternative. Practise on a current-limited, low-voltage bench supply rather than a battery bank or mains.
3. **Engineering controls:** guards, terminal covers, insulated enclosures, fuses, RCDs, interlocks.
4. **Administrative controls:** procedures, permits, training, warning labels, supervision.
5. **PPE:** personal protective equipment, the last line of defence.

### Tools and instruments

- **Insulated tools** rated for 1000 V (to the relevant standard, marked with a double triangle), with no damage to the insulation.
- **Voltage testers and multimeters** rated for the [[measurement-category|measurement category]]:
  - CAT II: appliances and socket outlets;
  - CAT III: distribution boards and fixed installations;
  - CAT IV: the supply origin.
  Higher categories withstand larger transient surges without the meter failing violently. Use fused, shrouded test leads with a matching rating.
- **Inspect before use:** damaged leads, cracked cases or blown fuses take an instrument out of service.

### PPE

The appropriate [[ppe|PPE]] depends on the task's risk assessment:

- safety glasses or a face shield (battery acid, arc flash);
- insulating gloves of the right class for live work (done only where justified and permitted);
- arc-rated clothing where arc-flash energy requires it;
- safety footwear;
- removal of jewellery.

PPE does not make an unsafe method safe.

### Risk assessment

A [[risk-assessment|risk assessment]] answers five questions:

1. What are the **hazards**? (Shock, burns, arc, fire, stored energy, falls, lifting.)
2. Who could be **harmed**, and how?
3. How **likely** is it, and how **severe**?
4. What **controls** will be used (in hierarchy order)?
5. What is the **remaining risk**, and is it acceptable? Record it, and review it if conditions change.

A simple scoring method multiplies likelihood (1–5) by severity (1–5). Scores above an agreed threshold need further controls before work starts.

### Knowing your limits

Stop and ask a qualified, authorised person when:

- the task needs live work;
- the system is unfamiliar or the drawings do not match;
- the isolation cannot be secured;
- you find unexpected voltage;
- the task requires qualifications you do not hold.

**This academy develops knowledge and virtual skill. Real practical work requires supervised training and the qualifications required where you live.**`,
        technical: `**Measurement categories and transients.** Lightning and switching can put voltage spikes of several kilovolts on supply conductors. The nearer to the supply origin, the larger the spike. Meter categories specify the impulse voltage the meter must withstand. A CAT II meter used on a distribution board (CAT III) could fail and arc into the user's hands.

**Live work.** Most safety regulations permit live work only when it is unreasonable to work dead, when it is reasonable to work live, and when suitable precautions are taken. Fault-finding measurements are the common example. Even then, the work is planned, and done by competent people with the right equipment. In this programme, live measurements happen only in the simulator.

**Risk matrices.** Organisations use 3×3 or 5×5 likelihood-severity matrices with defined action levels. The method in this lesson is a typical example, not a legal standard.`,
        diagrams: [{ id: 'risk-hierarchy', caption: 'The hierarchy of controls: elimination is most effective, PPE least.' }],
        formulas: [{ name: 'Risk score (typical matrix method)', expr: 'Risk = Likelihood (1–5) × Severity (1–5)', where: [['Likelihood', '1 rare … 5 almost certain', '—'], ['Severity', '1 minor … 5 fatal', '—']], note: 'An illustrative method; organisations define their own matrices and action levels.' }],
        examples: [
          {
            title: 'Risk score before and after controls',
            problem: 'Replacing a battery fuse with the battery connected: likelihood of a short circuit 3, severity 4. After isolating the battery and using insulated tools: likelihood 1, severity 4. Compare the scores.',
            steps: ['Before: 3 × 4 = 12 (high: not acceptable)', 'After: 1 × 4 = 4 (low)'],
            answer: 'Isolation (elimination) and insulated tools (engineering) reduce the risk from 12 to 4. Severity stays the same: controls mostly reduce likelihood.',
          },
          {
            title: 'Choosing a meter category',
            problem: 'You will measure at an inverter’s AC output terminals inside a distribution board, and at a socket outlet. Which minimum meter category?',
            steps: ['A socket outlet is CAT II', 'A distribution board is CAT III', 'Use the higher requirement for the job'],
            answer: 'A CAT III (or CAT IV) meter rated for the voltage, with matching test leads.',
          },
        ],
        applications: `Workplaces require risk assessments for electrical work. Training centres use current-limited practice supplies. The virtual laboratory applies substitution: you learn on simulated circuits with no real hazard before any supervised practical training.`,
        mistakes: [
          { mistake: 'Relying on gloves instead of isolating.', correction: 'PPE is the last line of defence; eliminate the hazard by working dead first.' },
          { mistake: 'Using a cheap CAT II meter in a distribution board.', correction: 'Use an instrument rated for the measurement category and voltage.' },
          { mistake: 'Carrying on when readings do not match expectations.', correction: 'Unexpected readings mean stop, review and ask a qualified person.' },
        ],
        demo: {
          title: 'Practice supplies in the circuit laboratory',
          text: 'After passing F1, the circuit laboratory’s practical exercises start with an isolated, current-limited, low-voltage bench supply: substitution in practice.',
          link: to.ckt('Circuit lab: battery and resistor circuit (after F1)', 'ckt-01'),
        },
        activities: [to.lab3d('LF-3K cover and its earth strap', 'lf3k', 'cover'), to.cmp('Heat sink versus fan', 'heatsink-vs-fan')],
        check: [
          { id: 'k1', type: 'mcq', prompt: 'Which control is the most effective?', options: ['Eliminating the hazard, for example by working dead', 'PPE', 'Warning signs', 'Training'], answer: 0, explain: 'Elimination removes the hazard entirely.' },
          { id: 'k2', type: 'mcq', prompt: 'A distribution board requires at least which meter category?', options: ['CAT III', 'CAT I', 'CAT II', 'No category'], answer: 0, explain: 'Distribution level is CAT III.' },
          { id: 'k3', type: 'numeric', prompt: 'Risk score for likelihood 2 and severity 5?', answer: 10, tol: 0.001, unit: '', explain: '2 × 5 = 10.' },
          { id: 'k4', type: 'mcq', prompt: 'You find 120 V on a circuit you isolated. You should…', options: ['stop, make the area safe and ask a qualified person', 'continue carefully', 'remove the RCD', 'touch it with gloves'], answer: 0, explain: 'Unexpected voltage means the isolation has failed.' },
        ],
        summary: [
          'Hierarchy of controls: eliminate, substitute, engineer, administer, PPE.',
          'Use insulated 1000 V tools and meters rated for the measurement category; inspect before use.',
          'Risk assessment: hazards, who, likelihood × severity, controls, residual risk, record.',
          'Stop and ask when the task is unfamiliar, live, unsecured or unexpected.',
          'Virtual practice is not a qualification; real work needs supervised training.',
        ],
        homework: {
          id: 'F1.M4.L3.hw',
          title: 'Risk assessment',
          brief: 'Assess the task “connect a new 24 V battery bank to an off-grid inverter”.',
          tasks: [
            { id: 'h1', type: 'numeric', prompt: 'Short-circuit risk score with uncovered terminals and ordinary tools (likelihood 3, severity 4)?', answer: 12, tol: 0.001, unit: '', explain: '3 × 4 = 12.' },
            { id: 'h2', type: 'numeric', prompt: 'Score after terminal covers, insulated tools, jewellery removed and the battery fuse open (likelihood 1, severity 4)?', answer: 4, tol: 0.001, unit: '', explain: '1 × 4 = 4.' },
          ],
          written: [{ prompt: 'List the controls for this task in hierarchy order.', model: 'Eliminate: connect with the battery fuse/isolator open and the inverter off. Substitute: not applicable (or use pre-made fused cables). Engineering: terminal covers, insulated tools, correct fuse at the battery. Administrative: follow the manufacturer’s sequence (negative last on connection where frame-earthed), supervision. PPE: eye protection, remove jewellery.' }],
        },
      },
    },
  ],
  quiz: {
    pass: 0.8,
    questions: [
      { id: 'q1', type: 'mcq', prompt: 'The coordination rule for overcurrent protection is…', options: ['I_b ≤ I_n ≤ I_z', 'I_z ≤ I_n ≤ I_b', 'I_n ≥ I_z', 'I_n = I_b'], answer: 0, explain: 'Design current ≤ device rating ≤ cable capacity.' },
      { id: 'q2', type: 'numeric', prompt: 'Fuse for 88 A maximum, 1.25 margin, standard sizes 100/125/150 A (A)?', answer: 125, tol: 0.001, unit: 'A', explain: '1.25 × 88 = 110 → 125 A.' },
      { id: 'q3', type: 'mcq', prompt: 'A battery fuse must have a breaking capacity…', options: ['above the battery’s prospective short-circuit current at the DC voltage', 'equal to its current rating', 'below 100 A', 'irrelevant for DC'], answer: 0, explain: 'It must interrupt the largest possible fault.' },
      { id: 'q4', type: 'numeric', prompt: 'Earth-fault current, 230 V, Z_s = 1.6 Ω (A)?', answer: 143.75, tol: 0.01, unit: 'A', explain: '230/1.6 = 143.75 A.' },
      { id: 'q5', type: 'mcq', prompt: 'An RCD trips when…', options: ['line and neutral currents differ by more than its rating', 'current exceeds the cable rating', 'voltage is high', 'the neutral is earthed'], answer: 0, explain: 'It detects residual current.' },
      { id: 'q6', type: 'mcq', prompt: 'Class II equipment…', options: ['has double insulation and no earth connection', 'must be earthed', 'is for outdoor use only', 'has no insulation'], answer: 0, explain: 'Double insulation replaces the earth.' },
      { id: 'q7', type: 'mcq', prompt: 'PPE is…', options: ['the last line of defence after other controls', 'the first control to apply', 'unnecessary if you are careful', 'a substitute for isolation'], answer: 0, explain: 'Hierarchy of controls.' },
      { id: 'q8', type: 'multi', prompt: 'When should you stop and ask a qualified person? (select all)', options: ['Unexpected voltage after isolation', 'The isolation cannot be locked', 'The task requires live work', 'The task is going as planned'], answers: [0, 1, 2], explain: 'All except the last.' },
    ],
  },
  assignment: {
    id: 'F1.M4.asg',
    title: 'Module assignment: protecting a battery-inverter circuit',
    brief: 'A 48 V, 3000 W inverter (η = 0.93) is fed from a 48 V lead-acid bank (cut-off 42 V). Cable options: 70 A, 100 A and 125 A ratings. Fuse sizes: 63, 80, 100, 125 A. Bank fault current: 3 kA.',
    tasks: [
      { id: 'a1', type: 'numeric', prompt: 'Maximum DC current at 42 V (A)?', answer: 76.8, tol: 0.02, unit: 'A', explain: '3000/(0.93 × 42) = 76.8 A.' },
      { id: 'a2', type: 'numeric', prompt: 'Fuse rating with the 1.25 margin (A)?', answer: 100, tol: 0.001, unit: 'A', explain: '1.25 × 76.8 = 96 A → 100 A.' },
      { id: 'a3', type: 'numeric', prompt: 'Smallest cable rating that satisfies I_n ≤ I_z (A)?', answer: 100, tol: 0.001, unit: 'A', explain: 'I_z ≥ 100 A → the 100 A cable (125 A gives margin).' },
      { id: 'a4', type: 'mcq', prompt: 'The fuse must have a breaking capacity of at least…', options: ['3 kA at ≥ 57.6 V DC', '100 A', '3 kA at 230 V AC only', '48 A'], answer: 0, explain: 'Above the prospective fault current at the maximum DC voltage.' },
    ],
    written: [{ prompt: 'Where is the fuse installed, and what else protects people in this system?', model: 'At the battery positive terminal, protecting the whole cable run. People are protected by insulation and terminal covers, earthing/bonding of the inverter chassis, an RCD on the AC output where required, and safe isolation before work.' }],
  },
  practicals: [
    {
      id: 'F1.M4.P1',
      title: 'Protection selection assessment',
      description: 'Select protective devices and check coordination for a battery-inverter installation. All answers must be correct.',
      task: {
        id: 'f1-protection',
        kind: 'calc',
        title: 'Selecting protection',
        brief: 'A 24 V, 1500 W inverter (η = 0.92, battery cut-off 21 V) has cable rated I_z = 125 A. Battery fault current is 2.4 kA. Fuse sizes: 63, 80, 100, 125, 150 A. The 230 V output circuit has Z_s = 1.4 Ω and a 10 A type B breaker (magnetic trip at 5 × I_n).',
        questions: [
          { id: 'c1', type: 'numeric', prompt: 'Maximum DC current (A)?', answer: 77.6, tol: 0.02, unit: 'A', explain: '1500/(0.92 × 21) = 77.6 A.' },
          { id: 'c2', type: 'numeric', prompt: 'Battery fuse rating (A)?', answer: 100, tol: 0.001, unit: 'A', explain: '1.25 × 77.6 = 97 → 100 A; 100 ≤ 125 ✓.' },
          { id: 'c3', type: 'numeric', prompt: 'Earth-fault current on the output circuit (A)?', answer: 164.3, tol: 0.02, unit: 'A', explain: '230/1.4 = 164 A.' },
          { id: 'c4', type: 'mcq', prompt: 'Does the 10 A type B breaker trip magnetically on that fault?', options: ['Yes: 164 A > 50 A', 'No'], answer: 0, explain: '5 × 10 = 50 A.' },
          { id: 'c5', type: 'mcq', prompt: 'What protects a person touching line and neutral at the output?', options: ['Nothing automatic: only insulation and isolation prevent it', 'The RCD', 'The fuse', 'The breaker'], answer: 0, explain: 'No residual current and far below fuse ratings.' },
        ],
        explain: 'Fuses and breakers are sized from the maximum current with margin and must not exceed the cable rating; earth faults must give enough current to trip quickly; no device protects against line–neutral contact, which is why isolation comes first.',
      },
      evidence: { kind: 'task', id: 'f1-protection' },
    },
  ],
}
