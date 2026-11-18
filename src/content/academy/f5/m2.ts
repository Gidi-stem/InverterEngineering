import type { AcademyModule } from '../types'
import { to } from '../s1/links'

/** F5.M2 Multimeter and clamp meter. */
export const F5_M2: AcademyModule = {
  id: 'F5.M2',
  title: 'Multimeter and clamp meter',
  summary: 'Operating the digital multimeter across every function and port, the diode test, and measuring current without breaking the circuit with a clamp meter.',
  lessons: [
    {
      id: 'F5.M2.L1',
      title: 'Voltage, current, resistance, continuity and diode test',
      minutes: 35,
      content: {
        objectives: [
          'Select the correct function, range and probe socket for voltage, current, resistance, continuity and diode-test measurements.',
          'Explain why resistance and continuity ranges require the circuit to be isolated.',
          'Predict the consequence of a voltage measurement attempted with the probes in a current socket.',
          'Interpret a diode-test reading to judge a junction as good, open or shorted.',
        ],
        introduction: `The digital multimeter is the one instrument every technician reaches for first, and it is also the one most often connected wrongly. This lesson works through every function — voltage, current, resistance, continuity, diode test — and, deliberately, through the two classic wrong connections, so you experience the consequence in simulation rather than on a real meter.`,
        lecture: `### The dial (function) and the sockets (ports) are two separate choices

A multimeter has a **function dial** (what to measure) and **probe sockets** (where the red probe plugs in). A correct measurement needs both set together:

| Function | Correct red-probe socket |
|---|---|
| DC V, AC V, Ω, continuity, diode test | VΩ socket |
| DC A, AC A (small currents) | mA socket |
| DC A, AC A (large currents) | 10 A (or higher) socket |

### Why mixing them is dangerous, not just wrong

The current sockets connect to an internal **shunt resistor** of a few milliohms or less — intentionally, so that measuring current (which must be done *in series*, breaking the circuit) disturbs the circuit as little as possible. If the probes are left in a current socket but you connect **in parallel** across a voltage source (as you would for a voltage reading), the meter becomes a near-dead-short across that source. The current that flows is limited only by the source and the shunt — easily tens or hundreds of amperes on a mains or inverter-bus measurement. The meter's internal fuse is there for exactly this event, and should open before anything worse happens; an unfused meter, or a bridged fuse, has no such protection.

The opposite mistake — current function selected, but probes left in the VΩ sockets, connected in parallel as if for voltage — is NOT dangerous but is wrong: the meter's voltage-measuring input has a very high impedance, so almost no current flows through it, and the display reads close to zero. It teaches you nothing about the real current.

### Resistance, continuity and diode test: isolate first

These functions work by the meter applying its OWN small test voltage and measuring the resulting current. If the circuit already has power applied, that outside voltage fights the meter's test source, producing an unstable or simply wrong reading, and can feed current back into the meter's measurement circuit in ways it was never designed for. **Always isolate and prove dead (F1.M3) before switching to Ω, continuity or diode test.**

### Diode test

Diode test applies a small forward current and reads the forward voltage drop directly (unlike a resistance range, because a diode does not obey Ohm's law). A healthy silicon junction reads **about 0.5–0.8 V forward**, and **OL (no reading) reverse**, because it blocks reverse current. A shorted junction reads near 0 V both ways; an open junction reads OL both ways; a leaky junction conducts somewhat in both directions.`,
        technical: `**Autoranging vs manual ranging.** Most modern DMMs autorange: they pick the best range automatically. On a manual-range meter, starting on the highest range and working down avoids over-range ("OL") on an unexpectedly large signal, and avoids excess resolution loss on a small one.

**Burden voltage.** Even correctly connected, a current measurement inserts the meter's own small resistance (the shunt) into the circuit, causing a small "burden voltage" drop. For most circuits this is negligible; for very low-voltage, low-impedance circuits it can measurably affect the reading — a limitation worth knowing even though this course does not require you to correct for it.`,
        diagrams: [{ id: 'test-bench', caption: 'Multimeter function and socket combinations, and the two outcomes of mismatching them: safe-but-wrong (current function, voltage sockets) versus dangerous (voltage function, current sockets, live source).' }],
        formulas: [{ name: 'Ohm\'s law (resistance range)', expr: 'R = V_test / I_measured', where: [['V_test', "the meter's own small test voltage", 'V'], ['I_measured', 'current the test voltage drives through the unknown resistance', 'A']], note: 'Resistance, continuity and diode-test ranges work by applying this known small test source and measuring the result — which an external live supply would disturb.' }],
        examples: [
          {
            title: 'Predicting the dangerous mistake',
            problem: 'A 48 V inverter DC bus is live and delivering 11.6 A. A technician leaves the red probe in the 10 A socket from a previous current measurement, then turns the dial to DC V and connects across the bus. What happens?',
            steps: ['The dial says "DC V", but the probe is still physically in the 10 A socket — a near-zero-resistance shunt', 'Connected across 48 V, this is effectively a short circuit through the meter', 'The meter\'s internal fuse should open to protect it; the 48 V source itself briefly sees a large current spike'],
            answer: 'The meter reads "FUSE" or similarly fails, and the fuse opens — a safe outcome only because the fuse did its job. Always return the red probe to the VΩ socket before switching to a voltage function.',
          },
          {
            title: 'Diode test interpretation',
            problem: 'A diode reads 0.00 V forward AND 0.00 V reverse on diode test. What is its condition?',
            steps: ['A healthy junction would read ~0.5–0.8 V forward and OL reverse', '0 V both ways means no junction barrier at all'],
            answer: 'Shorted junction — replace the diode.',
          },
        ],
        applications: `This exact scenario — probes left in the current socket, dial switched to voltage, connected to a live 48 V inverter bus — is reproduced in this lab's multimeter instrument so you can see the "FUSE" result safely before it ever happens on a real bench.`,
        mistakes: [
          { mistake: 'Measuring current with the probes left in the VΩ sockets.', correction: 'Safe but wrong: reads near zero because of the meter\'s high voltage-input impedance. Move the probes to the matched current socket and break the circuit to insert the meter in series.' },
          { mistake: 'Measuring voltage or resistance with the probes left in a current socket.', correction: 'Dangerous: the current socket is a near-short. Always return to the VΩ socket before a voltage, resistance, continuity or diode-test measurement.' },
          { mistake: 'Measuring resistance on a live circuit.', correction: 'Isolate and prove dead first; resistance ranges assume no external voltage is present.' },
        ],
        demo: { title: 'Operate the multimeter', text: 'Choose a scenario, a function, a port and a test point, then measure. Try the wrong-port combinations deliberately and read the explanation.', link: to.instrument('Open the digital multimeter', 'dmm') },
        activities: [to.instrument('Digital multimeter', 'dmm', 'inverter-dc-bus'), to.proc('Diode test procedure', 'diode', 'diode-test')],
        check: [
          { id: 'k1', type: 'mcq', prompt: 'Current function, probes in the VΩ sockets, connected in parallel: the meter reads...', options: ['close to zero (wrong, but not dangerous)', 'the correct current', 'OL always', 'FUSE always'], answer: 0, explain: 'High input impedance in the voltage sockets means almost no current flows.' },
          { id: 'k2', type: 'mcq', prompt: 'Voltage function, probes left in a current socket, connected across a live 48 V source: the result is...', options: ['effectively a short circuit through the meter — dangerous', 'a normal, safe voltage reading', 'always OL', 'identical to the correct connection'], answer: 0, explain: 'The current socket is a near-zero-resistance shunt.' },
          { id: 'k3', type: 'mcq', prompt: 'Why must resistance, continuity and diode-test functions be used on an isolated circuit?', options: ['They apply their own test voltage, which an external live supply disturbs', 'They need mains power to work', 'They are only accurate when live', 'There is no reason; it is just convention'], answer: 0, explain: 'The meter\'s own test source conflicts with an external supply.' },
          { id: 'k4', type: 'mcq', prompt: 'A healthy silicon diode on diode test typically reads approximately...', options: ['0.5–0.8 V forward', '0 V forward', '2–3 V forward', 'the full supply voltage forward'], answer: 0, explain: 'A healthy silicon junction forward-conducts at roughly 0.5–0.8 V.' },
        ],
        summary: [
          'The function dial and the probe socket are two separate, both-required choices.',
          'Current function with probes in the voltage sockets is safe but wrong (near-zero reading). Voltage/resistance function with probes in a current socket, live, is dangerous (near-short).',
          'Resistance, continuity and diode test require an isolated circuit.',
          'Diode test reads forward voltage directly: ~0.5–0.8 V good, OL open, 0 V shorted, conducts both ways if leaky.',
        ],
        homework: {
          id: 'F5.M2.L1.hw',
          title: 'Multimeter function and port practice',
          brief: 'Decide the correct function and port for each situation.',
          tasks: [],
          written: [
            { prompt: 'A technician wants to measure the current drawn by a 230 V kettle without cutting the supply cable. What is wrong with this plan, and what should they do instead?', model: 'A multimeter current range must be broken INTO the circuit in series, which does require interrupting the conductor (or using a clamp meter instead, which senses current without breaking the circuit — F5.M2.L2). Cutting a live mains cable to insert the meter is unsafe and the wrong tool for the job; a clamp meter around one conductor is the correct choice when the circuit cannot or should not be broken.' },
            { prompt: 'Explain, step by step, why leaving the probes in the 10 A socket while measuring voltage on a live 230 V circuit is dangerous.', model: 'The 10 A socket connects to a near-zero-resistance internal shunt. Connecting this in parallel across 230 V (as voltage measurement technique requires) presents almost no resistance to the source, so a very large current tries to flow through the meter — effectively a short circuit. The meter\'s fuse should open to stop this, but the event itself (a sudden short on a live 230 V circuit) is hazardous regardless.' },
          ],
        },
      },
    },
    {
      id: 'F5.M2.L2',
      title: 'Clamp meters and DC/AC current',
      minutes: 25,
      content: {
        objectives: [
          'Explain how a clamp meter senses current without breaking the circuit.',
          'State the single-conductor rule and explain why clamping both conductors cancels the reading.',
          'Describe inrush current and why it affects circuit-protection choices.',
          'Choose between a multimeter (in series) and a clamp meter for a given job.',
        ],
        introduction: `Breaking a live circuit to insert a meter in series is sometimes impractical or unsafe — imagine doing it to every conductor in a distribution board. A **clamp meter** solves this by sensing the magnetic field a current produces around its conductor, with jaws that simply close around the outside of an insulated cable. No circuit interruption, no exposed live connection: just one conductor, clamped alone.`,
        lecture: `### How it senses current

Any current-carrying conductor produces a magnetic field around it (this is the same physics behind the transformer, F3.M4). A clamp meter's jaws form a magnetic core around the conductor; the field induces a signal proportional to the current, which the meter scales and displays. Because the measurement is magnetic, not electrical contact, the clamp meter never needs to touch a live conductor's copper — only its insulation.

### The one-conductor rule

Clamp **only one current-carrying conductor** at a time. If you clamp both the live and the return (neutral) conductor of the same cable together, their currents are equal and opposite (what goes out must come back), so their magnetic fields cancel almost exactly. The meter reads close to zero — not because there is no current, but because the two fields cancel inside the jaws. This is the most common clamp-meter mistake and gives a dangerously misleading "no current" reading on a cable that may be fully loaded.

### Jaw closure

The jaws must close fully around the conductor to form a complete magnetic loop. Partially closed jaws, or jaws around a conductor bundle with a gap, under-read or give an unstable reading.

### Inrush current

Motors, transformers and some switching power supplies draw a brief but very large **inrush current** at the moment of starting — often several times their steady running current — before settling to normal. A clamp meter is well suited to observing this (many have a "peak" or inrush capture mode), because it does not need to be broken into the circuit beforehand. Inrush current is why motor circuits need breakers or fuses with a deliberate time delay ("slow blow", or motor-rated curves) rather than instant-trip protection, which would nuisance-trip on every start.

### DC-capable clamp meters

Most basic clamp meters sense only AC (using a simple transformer-like core). Measuring DC current (for example, a solar string or a battery feed) needs a clamp meter with a Hall-effect sensor, explicitly rated for DC. Check this before relying on a clamp reading on a DC circuit.`,
        technical: `**Why cancellation is exact for a balanced pair.** By Ampère's law, the magnetic field measured by the jaws depends on the net current enclosed. Two equal and opposite currents sum to zero net enclosed current, so the field — and the reading — is zero, regardless of how large either individual current actually is. This is the same principle used deliberately, in reverse, by some earth-leakage ("core balance") current transformers, which are designed to read only the *difference* between two conductors' currents.

**Jaw opening and accuracy.** Larger-jaw clamp meters accommodate thicker cables or bus bars but can lose accuracy on small conductors positioned off-centre in the jaw opening; manufacturers specify the accuracy only for a conductor centred in the jaws.`,
        diagrams: [{ id: 'test-bench', caption: 'A clamp meter\'s jaws around a single conductor versus around a live/return pair: the single-conductor field is sensed; the pair\'s fields cancel.' }],
        formulas: [{ name: 'Net enclosed current (Ampère\'s law, qualitative)', expr: 'I_sensed = I_1 + I_2 + … (signed, by direction)', where: [['I_sensed', 'the current the clamp meter reports', 'A'], ['I_1, I_2, …', 'each current-carrying conductor enclosed by the jaws, signed by direction', 'A']], note: 'A live/return pair gives I_1 = −I_2, so I_sensed ≈ 0 even though real current flows.' }],
        examples: [
          {
            title: 'Why both-conductors reads zero',
            problem: 'A clamp meter is placed around both the live and neutral conductors of a cable supplying 6.52 A to a load. What does it read, and why?',
            steps: ['The live carries 6.52 A out; the neutral carries 6.52 A back', 'Equal and opposite currents inside the same jaws produce cancelling magnetic fields'],
            answer: 'Close to 0.00 A, even though the cable is carrying real current to a real load — a misleading result from an easy mistake.',
          },
          {
            title: 'Sizing protection for a motor',
            problem: 'A motor draws 3.4 A running but 24.8 A at the instant of starting, decaying to normal within 400 ms. Why would an instant-trip 5 A breaker be the wrong choice?',
            steps: ['Running current (3.4 A) is well within a 5 A breaker', 'Starting inrush (24.8 A) is nearly 5 times the breaker rating', 'An instant-trip breaker would open on every start, even though the motor is healthy'],
            answer: 'A motor-rated breaker (or slow-blow fuse) that tolerates a brief surge but still trips on a sustained overload is needed instead.',
          },
        ],
        applications: `Clamp meters are the practical way to measure load current on an installed inverter's AC output, a solar string, or a battery feed without disconnecting anything — exactly the scenarios in this lab's clamp-meter instrument.`,
        mistakes: [
          { mistake: 'Clamping both conductors of a cable together.', correction: 'Clamp only one conductor; the fields of a live/return pair cancel and give a false near-zero reading.' },
          { mistake: 'Using an AC-only clamp meter on a DC circuit.', correction: 'A simple transformer-core clamp meter does not sense DC at all; use one explicitly rated for DC (Hall-effect).' },
          { mistake: 'Protecting a motor circuit with an instant-trip breaker sized for running current.', correction: 'Use a motor-rated device that tolerates inrush but still protects against a sustained overload.' },
        ],
        demo: { title: 'See the cancellation yourself', text: 'Clamp a single conductor, then both conductors together, on the inverter output scenario, and compare the readings.', link: to.instrument('Open the clamp meter', 'clamp', 'inverter-output') },
        activities: [to.instrument('Clamp meter', 'clamp'), to.lib('Current sensor', 'current-sensor')],
        check: [
          { id: 'k1', type: 'mcq', prompt: 'A clamp meter senses current by...', options: ['the magnetic field around the conductor', 'direct electrical contact with the copper', 'measuring voltage drop across itself', 'counting pulses from a PWM controller'], answer: 0, explain: 'The jaws form a magnetic sensing loop.' },
          { id: 'k2', type: 'mcq', prompt: 'Clamping both the live and neutral of the same cable together gives...', options: ['a near-zero reading because the fields cancel', 'double the true current', 'the correct current', 'an OL reading'], answer: 0, explain: 'Equal and opposite currents cancel.' },
          { id: 'k3', type: 'mcq', prompt: 'Inrush current is...', options: ['a brief surge at starting, well above the steady running current', 'the current at full load', 'a fault condition only', 'unrelated to motor starting'], answer: 0, explain: 'Motors and transformers commonly surge at start.' },
          { id: 'k4', type: 'mcq', prompt: 'Most basic (non-Hall-effect) clamp meters can measure...', options: ['AC current only', 'DC current only', 'both equally well', 'neither'], answer: 0, explain: 'A simple transformer-core clamp senses only AC.' },
        ],
        summary: [
          'A clamp meter senses the magnetic field around a conductor; it never needs to break the circuit.',
          'Clamp only ONE current-carrying conductor; clamping a live/return pair together cancels the reading.',
          'Inrush current (motors, transformers) is far above steady running current and shapes protection device choice.',
          'Most basic clamp meters sense AC only; DC current measurement needs a Hall-effect clamp meter.',
        ],
        homework: {
          id: 'F5.M2.L2.hw',
          title: 'Clamp meter scenarios',
          brief: 'Decide what a clamp meter would read in each case.',
          tasks: [{ id: 'h1', type: 'mcq', prompt: 'A clamp meter around a single live conductor carrying 6.52 A rms reads approximately...', options: ['6.52 A', '0 A', '13.04 A', 'OL'], answer: 0, explain: 'A correctly clamped single conductor reads the true current.' }],
          written: [{ prompt: 'A colleague says a circuit "has no load" because their clamp meter reads 0 A, but the lights it supposedly feeds are clearly on. What is the most likely explanation, and what should they check?', model: 'The most likely explanation is that they clamped both the live and return (neutral) conductors of the same cable together, cancelling the fields and producing a false zero reading. They should check that the jaws enclose only ONE conductor, not the whole cable or cable pair.' }],
        },
      },
    },
  ],
  quiz: {
    pass: 0.8,
    questions: [
      { id: 'q1', type: 'mcq', prompt: 'Voltage function, probes in a current socket, connected across a live source: this is...', options: ['dangerous — a near-short through the meter', 'safe and correct', 'only wrong on AC', 'identical to the correct connection'], answer: 0, explain: 'The current socket is a near-short.' },
      { id: 'q2', type: 'mcq', prompt: 'Current function, probes in the VΩ sockets: the meter reads...', options: ['close to zero', 'the true current', 'FUSE', 'OL'], answer: 0, explain: 'High input impedance in the voltage sockets blocks current flow.' },
      { id: 'q3', type: 'mcq', prompt: 'A healthy diode on diode test reads approximately...', options: ['0.5–0.8 V forward, OL reverse', '0 V both directions', 'OL both directions', 'the supply voltage both directions'], answer: 0, explain: 'A healthy silicon junction conducts forward and blocks reverse.' },
      { id: 'q4', type: 'mcq', prompt: 'A clamp meter around both conductors of a loaded cable reads...', options: ['close to zero, misleadingly', 'the true load current', 'twice the true current', 'OL'], answer: 0, explain: 'Equal and opposite currents cancel in the jaws.' },
      { id: 'q5', type: 'mcq', prompt: 'A basic AC-only clamp meter on a DC solar string reads...', options: ['nothing useful — it cannot sense DC', 'the correct DC current', 'half the current', 'double the current'], answer: 0, explain: 'A transformer-core clamp needs a changing field; DC produces none.' },
    ],
  },
  practicals: [],
}
