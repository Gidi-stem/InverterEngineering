import type { AcademyModule } from '../types'
import { to } from '../s1/links'

/** F4.M2 Semiconductor devices. */
export const F4_M2: AcademyModule = {
  id: 'F4.M2',
  title: 'Semiconductor devices',
  summary: 'Diodes, MOSFETs, IGBTs and the gate drivers that control them: how each works, how they switch and lose energy, how to test them, and how to recognise and safely replace a failed device.',
  lessons: [
    {
      id: 'F4.M2.L1',
      title: 'Introduction to semiconductors',
      minutes: 25,
      content: {
        objectives: [
          'Explain how doping creates p-type and n-type silicon.',
          'Describe a PN junction and why it conducts in one direction and blocks the other.',
          'Place diodes, MOSFETs and IGBTs as different practical devices all built from one or more PN junctions.',
        ],
        introduction: `Every [[diode|diode]], [[mosfet|MOSFET]] and [[igbt|IGBT]] you will meet from here on is built from the same raw idea: silicon whose conductivity has been deliberately engineered by [[doping|doping]]. This short lesson gives you that one idea once, properly, so every later lesson in this module can build on it rather than re-explaining it.`,
        lecture: `### Pure silicon is nearly an insulator

Pure (intrinsic) silicon has very few free charge carriers at room temperature — it barely conducts at all. Deliberately adding a tiny, controlled amount of another element (doping) changes this dramatically. Adding an element with one more outer electron than silicon (such as phosphorus) creates **n-type** silicon, with an excess of free electrons. Adding an element with one fewer outer electron (such as boron) creates **p-type** silicon, with an excess of "holes" — the absence of an electron, which behaves like a mobile positive charge carrier.

### The PN junction

Where a region of p-type silicon meets a region of n-type silicon, a [[pn-junction|PN junction]] forms. Near the junction, electrons and holes diffuse across and recombine, leaving a thin region depleted of free carriers and a small built-in voltage barrier. Apply an external voltage the right way (p-side positive relative to n-side) and the barrier shrinks, letting current flow easily — **forward bias**. Apply it the other way and the barrier widens, blocking current almost completely — **reverse bias**. This one asymmetry — easy one way, blocked the other — is the entire basis of a diode (F4.M2.L2), and a building block inside every MOSFET and IGBT.

### One idea, many devices

A diode is essentially a single PN junction with two external leads. A MOSFET and an IGBT are far more sophisticated structures (F4.M2.L4, L5) with multiple regions and a controlling gate, but they are still built from doped silicon and PN-junction behaviour at their core — understanding doping and the PN junction here means every later lesson in this module is explaining a variation on one theme, not an unrelated new mechanism each time.`,
        technical: `**Majority and minority carriers.** In n-type silicon, electrons are the majority carrier and holes the minority carrier (and the reverse in p-type) — this distinction matters for understanding switching speed differences between device families (F4.M2.L5's discussion of IGBT tail current, caused by minority-carrier recombination, follows directly from this).

**Why silicon, not some other element.** Silicon's natural oxide (silicon dioxide) is an excellent, stable insulator that can be grown directly on the silicon surface — this is what makes a MOSFET's insulated gate (F4.M2.L4) practical to manufacture reliably at low cost and in enormous volume.`,
        diagrams: [{ id: 'design-flow', caption: 'From doped silicon to a PN junction to the practical device families (diode, MOSFET, IGBT) built from that one underlying junction behaviour.' }],
        formulas: [{ name: 'Forward bias condition', expr: 'V_p-side > V_n-side (by more than the built-in barrier voltage)', where: [['V_p-side', 'voltage applied to the p-type region', 'V'], ['V_n-side', 'voltage applied to the n-type region', 'V']], note: 'Silicon\'s built-in barrier is roughly 0.6–0.7 V — this is where the familiar diode forward voltage (F4.M2.L2) comes from.' }],
        examples: [
          {
            title: 'Identifying bias direction',
            problem: 'A PN junction has +5 V applied to its p-type side and 0 V to its n-type side. Is this forward or reverse bias?',
            steps: ['p-side (5 V) is higher than n-side (0 V)', 'This matches the forward-bias condition'],
            answer: 'Forward bias — the junction conducts (once the barrier voltage is exceeded).',
          },
          {
            title: 'Why reverse bias blocks current',
            problem: 'Explain, in terms of the depletion region, why reverse bias nearly stops current flow across a PN junction.',
            steps: ['Reverse bias pulls majority carriers away from the junction on both sides', 'This widens the depletion region (the carrier-free zone) and increases the barrier', 'With almost no free carriers left near the junction to carry current, conduction is blocked (aside from a tiny leakage current)'],
            answer: 'The widened, carrier-depleted region presents a large barrier to current flow, which is why reverse bias blocks conduction almost completely.',
          },
        ],
        applications: `Every later lesson in this module — diode rectification, MOSFET and IGBT switching, gate drivers, and the fault patterns you will diagnose in the Repair Workshop — is a direct consequence of this one PN-junction behaviour.`,
        mistakes: [
          { mistake: 'Thinking doping "contaminates" silicon and makes it worse.', correction: 'Doping is a deliberate, precisely controlled engineering step that creates the useful conductivity properties semiconductor devices depend on — it is the entire point, not a defect.' },
          { mistake: 'Assuming a PN junction blocks current completely in reverse.', correction: 'A small reverse leakage current always flows; it only becomes a visible fault symptom when it rises far above its healthy, tiny value (F4.M2.L9).' },
          { mistake: 'Treating MOSFETs and IGBTs as unrelated to diodes.', correction: 'All three are built from PN-junction behaviour; MOSFETs and IGBTs add a controlling gate and more complex structure on top of the same underlying physics.' },
        ],
        demo: { title: 'See the diode entry first', text: 'The diode is the simplest practical device built from a single PN junction — open it before the more complex MOSFET and IGBT entries.', link: to.lib('Diode', 'diode') },
        activities: [to.lib('Diode', 'diode'), to.lib('MOSFET', 'mosfet')],
        check: [
          { id: 'k1', type: 'mcq', prompt: 'Doping silicon with an element that has one extra outer electron creates...', options: ['n-type silicon', 'p-type silicon', 'pure silicon', 'an insulator'], answer: 0, explain: 'Excess free electrons define n-type.' },
          { id: 'k2', type: 'mcq', prompt: 'A PN junction conducts easily when...', options: ['forward biased: p-side positive relative to n-side, beyond the barrier voltage', 'reverse biased', 'no voltage at all is applied', 'cooled below freezing'], answer: 0, explain: 'Forward bias shrinks the depletion barrier.' },
          { id: 'k3', type: 'mcq', prompt: 'MOSFETs and IGBTs are related to diodes because...', options: ['all are built from PN-junction behaviour in doped silicon', 'they use completely unrelated physics', 'only diodes use silicon', 'MOSFETs contain no silicon'], answer: 0, explain: 'All three share the same underlying junction physics.' },
        ],
        summary: [
          'Doping deliberately creates n-type (excess electrons) or p-type (excess holes) silicon from otherwise poorly-conducting pure silicon.',
          'A PN junction forms where p-type meets n-type, with a built-in barrier voltage (~0.6–0.7 V for silicon).',
          'Forward bias shrinks the barrier and allows easy conduction; reverse bias widens it and blocks conduction (aside from tiny leakage).',
          'Diodes, MOSFETs and IGBTs are all built from this one underlying PN-junction behaviour, at increasing structural complexity.',
        ],
        homework: {
          id: 'F4.M2.L1.hw',
          title: 'PN junction basics',
          brief: 'Identify bias direction and its consequence.',
          tasks: [{ id: 'h1', type: 'mcq', prompt: 'A PN junction has 0 V on its p-side and +5 V on its n-side. This is...', options: ['reverse bias', 'forward bias', 'neutral', 'undefined'], answer: 0, explain: 'n-side higher than p-side is reverse bias.' }],
          written: [{ prompt: 'Explain, without using the words "diode" or "MOSFET", what a PN junction physically is and why it conducts in only one direction.', model: 'A PN junction is the boundary between two regions of silicon, one deliberately doped to have an excess of free electrons and the other to have an excess of "holes" (missing electrons that behave like mobile positive charges). Near this boundary, a thin region forms where these carriers have diffused across and recombined, leaving few free carriers and a small built-in voltage barrier. Applying voltage one way shrinks this barrier and lets current flow easily; applying it the other way widens the barrier, driving away the remaining carriers and almost completely blocking current — this asymmetry is what gives the junction its one-directional conducting behaviour.' }],
        },
      },
    },
    {
      id: 'F4.M2.L2',
      title: 'Diodes: forward and reverse behaviour, ratings',
      minutes: 30,
      content: {
        objectives: [
          'State the typical forward voltage of a silicon diode and explain why it stays roughly constant across a range of currents.',
          'Define reverse breakdown voltage and explain what happens if it is exceeded.',
          'Identify the key ratings (V_f, I_f, V_rrm) needed to select or check a diode.',
          'Explain the role of a diode\'s [[body-diode|anti-parallel]] use alongside a switching device.',
        ],
        introduction: `The diode is the simplest practical device built from the PN junction of F4.M2.L1 — two leads, [[forward-voltage|conducts forward, blocks reverse]]. This lesson covers how to read a diode's key ratings and recognise its role both as a standalone rectifying part and as the "flyback" partner built into every MOSFET and IGBT.`,
        lecture: `### Forward conduction

Once forward voltage exceeds the junction's barrier (around 0.6–0.7 V for ordinary silicon diodes, lower for Schottky types, around 1.8–3+ V for LEDs depending on colour), the diode conducts, and its voltage drop stays roughly constant across a wide range of currents — very different from a resistor, whose drop rises proportionally with current. This near-constant [[forward-voltage|forward voltage (V_f)]] is why a diode's own power dissipation is approximately P ≈ V_f × I, not I²R.

### Reverse blocking and breakdown

In reverse bias, only a tiny leakage current flows — until the reverse voltage exceeds the diode's rated **reverse breakdown voltage (V_rrm, or peak reverse voltage)**, at which point the junction breaks down and conducts heavily in reverse, almost always destructively for an ordinary rectifier diode (a few specialised diode types, such as zener and avalanche diodes, are DESIGNED to break down controllably — not covered further here).

### Key ratings to check

- **V_f (forward voltage)**: the drop when conducting, at a stated current — sets conduction loss.
- **I_f (forward current, average and/or RMS)**: maximum continuous current the diode can carry.
- **V_rrm (peak repetitive reverse voltage)**: the reverse voltage it must never exceed in normal operation.
- **Reverse recovery time (t_rr)**: how quickly the diode stops conducting once reverse-biased after conducting forward — matters for fast-switching rectification (F4.M2.L3) where a slow diode wastes energy and generates extra heat during the transition.

### The body diode: a diode inside every power switch

Every power MOSFET (and most IGBT modules) includes an [[body-diode|anti-parallel "body" diode]] from source to drain (or emitter to collector), either an intrinsic structural feature (MOSFET) or added deliberately (many IGBT modules). This diode carries [[freewheeling|freewheeling]] current whenever an inductive load's current needs somewhere to go while the main switch is off — a genuinely essential part of every bridge leg (F3.M5, P2), not a side detail.`,
        technical: `**Schottky diodes.** A metal-semiconductor junction instead of a PN junction, giving a lower forward voltage (around 0.2–0.4 V) and very fast (near-instant) reverse recovery, at the cost of a lower reverse voltage rating and a somewhat higher reverse leakage current than an ordinary silicon diode — commonly used where switching speed or forward-voltage loss matters more than voltage headroom.

**Temperature effect on V_f.** A silicon diode's forward voltage falls slightly as it heats (a small negative temperature coefficient), the opposite of a resistor's usual behaviour — relevant when diodes are deliberately paralleled, since without care the hottest diode can end up carrying a disproportionate share of the current.`,
        diagrams: [{ id: 'diode-led', caption: 'A diode\'s forward-conduction and reverse-blocking regions, showing the roughly-constant forward voltage and the sharp reverse breakdown point.' }],
        formulas: [{ name: 'Diode conduction loss (approx.)', expr: 'P_d ≈ V_f · I_avg', where: [['P_d', 'approximate conduction power loss', 'W'], ['V_f', 'forward voltage at that current', 'V'], ['I_avg', 'average forward current', 'A']] }],
        examples: [
          {
            title: 'Diode conduction loss',
            problem: 'A rectifier diode has V_f = 0.7 V and carries an average 8 A. Approximate conduction loss?',
            steps: ['P ≈ V_f × I_avg', '= 0.7 × 8'],
            answer: '≈ 5.6 W.',
          },
          {
            title: 'Checking reverse voltage headroom',
            problem: 'A diode rated V_rrm = 100 V is used in a circuit where the peak reverse voltage it will see is 95 V. Comment on this choice.',
            steps: ['95 V against a 100 V rating leaves only 5 % margin', 'Normal supply variation, switching transients and component tolerance commonly need more headroom than this'],
            answer: 'This is a poor, high-risk choice with almost no margin — a higher-rated diode (commonly chosen with at least 1.5–2× margin over the expected peak reverse voltage) would be the safer, standard engineering practice.',
          },
        ],
        applications: `The bridge rectifier you will build in the Circuit Connection Laboratory, and every MOSFET/IGBT body diode in every bridge leg you study from here on, both rest directly on this lesson's forward/reverse behaviour.`,
        mistakes: [
          { mistake: 'Treating a diode\'s forward drop like a resistor\'s (proportional to current).', correction: 'Forward voltage stays roughly constant across a wide current range; it is not well modelled as a fixed resistance.' },
          { mistake: 'Checking only V_f when selecting a diode, and ignoring V_rrm.', correction: 'Reverse voltage rating is just as critical a check — exceeding it destroys an ordinary rectifier diode.' },
          { mistake: 'Forgetting the body diode exists when analysing a bridge leg with an inductive load.', correction: 'The body diode carries freewheeling current whenever the main switch turns off with inductive current still flowing — ignoring it gives an incomplete picture of the leg\'s behaviour.' },
        ],
        demo: { title: 'See diode ratings in the library', text: 'Compare forward voltage and reverse voltage ratings for the diode entry.', link: to.lib('Diode', 'diode') },
        activities: [to.lib('Diode', 'diode'), to.ckt('LED circuit', 'ckt-02')],
        check: [
          { id: 'k1', type: 'numeric', prompt: 'Approximate conduction loss (W) for V_f = 0.6 V at 10 A average?', answer: 6, tol: 0.02, unit: 'W', explain: 'P ≈ 0.6×10 = 6 W.' },
          { id: 'k2', type: 'mcq', prompt: 'Exceeding a diode\'s V_rrm rating causes...', options: ['reverse breakdown, almost always destructive for an ordinary rectifier diode', 'a slightly higher forward voltage', 'no effect at all', 'an increase in reverse recovery time only'], answer: 0, explain: 'V_rrm is a hard reverse-voltage limit.' },
          { id: 'k3', type: 'mcq', prompt: 'A MOSFET\'s body diode is used mainly to...', options: ['carry freewheeling current from an inductive load while the switch is off', 'block all reverse current permanently', 'increase switching speed', 'replace the gate driver'], answer: 0, explain: 'Essential for inductive loads in a bridge leg.' },
        ],
        summary: [
          'A diode conducts easily above its forward voltage (roughly constant across current) and blocks almost completely in reverse, up to its V_rrm rating.',
          'Key ratings to check: V_f, I_f, V_rrm and reverse recovery time.',
          'Every power MOSFET (and most IGBT modules) includes a body/anti-parallel diode that carries freewheeling current for inductive loads.',
          'Schottky diodes trade a lower voltage rating for lower forward voltage and much faster reverse recovery.',
        ],
        homework: {
          id: 'F4.M2.L2.hw',
          title: 'Diode ratings practice',
          brief: 'Apply conduction loss and reverse-voltage margin checks.',
          tasks: [{ id: 'h1', type: 'numeric', prompt: 'Approximate conduction loss (W) for V_f = 0.65 V at 12 A average?', answer: 7.8, tol: 0.02, unit: 'W', explain: '0.65×12 = 7.8 W.' }],
          written: [{ prompt: 'A design reuses a diode rated V_rrm = 50 V in a new circuit where the peak reverse voltage is only 20 V, but the current is now much higher than the diode\'s I_f rating. Explain which rating is actually at risk here, and why "the voltage rating is fine" is not sufficient reassurance.', model: 'The voltage margin (50 V rating against a 20 V peak) is indeed generous, but that says nothing about the current rating, which is a completely separate specification. If the new circuit\'s current exceeds the diode\'s I_f rating, the diode will overheat and fail from excessive conduction loss and thermal stress, regardless of how much reverse-voltage headroom it has. Every rating (V_f/conduction current, V_rrm, reverse recovery time) must be checked independently against the new application — comfortable margin on one rating never substitutes for a check on another.' }],
        },
      },
    },
    {
      id: 'F4.M2.L3',
      title: 'Rectification with diodes',
      minutes: 25,
      content: {
        objectives: [
          'Describe half-wave and full-wave (bridge) rectification and compare their output ripple frequency.',
          'Explain how many diodes conduct at any instant in a bridge rectifier.',
          'Relate ripple frequency and smoothing capacitor size using the ripple voltage formula.',
        ],
        introduction: `[[rectifier|Rectification]] — turning AC into DC using diodes — is the reverse operation of the inversion this whole platform is built around, and you will meet it wherever an inverter's control electronics or a battery charger needs DC from an AC input. This lesson covers how a diode bridge does it and what determines the resulting ripple.`,
        lecture: `### Half-wave rectification

A single diode in series with an AC source and a load passes only the half-cycles where it is forward biased, blocking the other half entirely. The result is a train of one-sided pulses at the SAME frequency as the input, with the load current (and hence voltage, into a resistive load) at zero for half of every cycle — simple, but wasteful and rough.

### Full-wave (bridge) rectification

Four diodes arranged as a bridge conduct in diagonal PAIRS: one pair for the positive input half-cycle, the other pair for the negative half-cycle, and in both cases current is steered through the load in the SAME direction. At any instant, exactly two diodes conduct (one pair), while the other two block. The result is a train of pulses at TWICE the input frequency (both half-cycles now contribute a pulse), which is both a higher ripple frequency (easier to smooth, F3.M5) and a more complete use of the input waveform than half-wave rectification.

### Smoothing the rectified output

A capacitor across the rectified output (F3.M5, F4.M1.L2) charges toward the peak each pulse and then supplies the load current between pulses, with its voltage sagging by an amount set by the load current, the capacitor value and the time between pulses — the higher ripple FREQUENCY from full-wave rectification directly means LESS sag (less ripple voltage) for the same capacitor value, compared with half-wave. This is exactly the same smoothing-capacitor reasoning met for the output filter of F4.M1.L2, now applied to the raw pulsed output a rectifier bridge produces before any further filtering.`,
        technical: `**Diode drop in a bridge.** Current flows through TWO diodes in series at any instant in a bridge rectifier (one in series with the source going in, one coming back), so the total forward-voltage loss is roughly double a single diode's V_f — a detail that matters more at low output voltages, where two diode drops can be a significant fraction of the total.

**Three-phase rectification** (mentioned for completeness, beyond this course's main scope) uses six diodes and produces a much smoother raw output with far smaller ripple even before any smoothing capacitor, because the six pulses per cycle overlap far more than a single-phase bridge's two.`,
        diagrams: [{ id: 'circuit-loop', caption: 'Current paths through a four-diode bridge rectifier for each half-cycle of the AC input, showing which diagonal pair conducts.' }],
        formulas: [{ name: 'Ripple voltage (approx.)', expr: '∆V ≈ I / (f_ripple · C)', where: [['∆V', 'peak-to-peak ripple voltage', 'V'], ['I', 'load current', 'A'], ['f_ripple', 'ripple frequency (2× mains for full-wave)', 'Hz'], ['C', 'smoothing capacitance', 'F']] }],
        examples: [
          {
            title: 'Ripple frequency from full-wave rectification',
            problem: 'A full-wave bridge rectifies a 50 Hz supply. What is the ripple frequency?',
            steps: ['Full-wave gives two pulses per input cycle', 'f_ripple = 2 × 50'],
            answer: '100 Hz.',
          },
          {
            title: 'Comparing ripple for half-wave vs full-wave',
            problem: 'A 2 A load is smoothed by a 2000 µF capacitor after (a) half-wave rectification (50 Hz ripple) and (b) full-wave rectification (100 Hz ripple). Compare the ripple voltage.',
            steps: ['(a) ∆V ≈ 2/(50 × 0.002) = 2/0.1 = 20 V', '(b) ∆V ≈ 2/(100 × 0.002) = 2/0.2 = 10 V'],
            answer: 'Full-wave rectification halves the ripple voltage (20 V → 10 V) for the identical capacitor and load current, purely from doubling the ripple frequency.',
            check: 'Ripple is inversely proportional to frequency in the formula, so doubling frequency should exactly halve ripple — consistent with the result.',
          },
        ],
        applications: `The Circuit Connection Laboratory's bridge rectifier exercise and DC filtering exercise are this lesson in practice — build the bridge, then watch the smoothing capacitor turn pulsed DC into a usable, low-ripple supply.`,
        mistakes: [
          { mistake: 'Assuming only one diode conducts at a time in a bridge rectifier.', correction: 'Two diodes (one diagonal pair) conduct simultaneously at any instant; the other two block.' },
          { mistake: 'Believing ripple frequency equals the input AC frequency for full-wave rectification.', correction: 'Full-wave rectification doubles the ripple frequency relative to the input, because both half-cycles now contribute a pulse.' },
          { mistake: 'Forgetting the double diode drop in a bridge when working at low output voltages.', correction: 'Two series diode drops (not one) are lost in a bridge at any instant — significant when the target output voltage itself is low.' },
        ],
        demo: { title: 'Build the bridge rectifier', text: 'Build and test the four-diode bridge rectifier in the Circuit Connection Laboratory.', link: to.ckt('Bridge rectifier', 'ckt-04') },
        activities: [to.ckt('Bridge rectifier', 'ckt-04'), to.ckt('DC filtering', 'ckt-05'), to.sim('Bridge rectification experiment', 'sim-03')],
        check: [
          { id: 'k1', type: 'numeric', prompt: 'Ripple frequency (Hz) from full-wave rectification of a 60 Hz supply?', answer: 120, tol: 0.01, unit: 'Hz', explain: '2×60=120 Hz.' },
          { id: 'k2', type: 'mcq', prompt: 'In a bridge rectifier, how many diodes conduct at any one instant?', options: ['two', 'one', 'four', 'zero'], answer: 0, explain: 'One diagonal pair conducts; the other pair blocks.' },
          { id: 'k3', type: 'mcq', prompt: 'Compared with half-wave rectification at the same frequency and smoothing capacitor, full-wave rectification gives...', options: ['lower ripple voltage, from its higher ripple frequency', 'higher ripple voltage', 'identical ripple', 'no DC output at all'], answer: 0, explain: 'Ripple is inversely proportional to ripple frequency.' },
        ],
        summary: [
          'Half-wave rectification passes only alternate half-cycles; full-wave (bridge) rectification uses both.',
          'A bridge rectifier conducts through one diagonal diode pair at a time, at twice the input frequency of ripple pulses.',
          'Higher ripple frequency directly means lower ripple voltage for the same smoothing capacitor and load current.',
          'Two diode drops (not one) are lost in series at any instant in a bridge rectifier.',
        ],
        homework: {
          id: 'F4.M2.L3.hw',
          title: 'Rectification and ripple practice',
          brief: 'Apply ripple frequency and ripple voltage calculations.',
          tasks: [
            { id: 'h1', type: 'numeric', prompt: 'Ripple frequency (Hz) from full-wave rectification of a 50 Hz supply?', answer: 100, tol: 0.01, unit: 'Hz', explain: '2×50=100 Hz.' },
            { id: 'h2', type: 'numeric', prompt: 'Ripple voltage (V) for I=3 A, f=100 Hz, C=3000 µF?', answer: 10, tol: 0.03, unit: 'V', explain: '∆V=3/(100×0.003)=3/0.3=10 V.' },
          ],
          written: [{ prompt: 'A battery charger\'s output ripple is found to be twice as high as the design calculation predicted. A technician discovers one diode in the bridge has failed open-circuit. Explain, using this lesson\'s ideas, why this single open diode would roughly double the ripple.', model: 'With one diode open, the bridge can no longer rectify both half-cycles: effectively, the circuit has degraded from full-wave to half-wave rectification, since current can only complete a path through the bridge during the half-cycles that do not require the failed diode. Half-wave rectification has half the ripple frequency of full-wave for the same input, and ripple voltage is inversely proportional to ripple frequency, so halving the effective ripple frequency roughly doubles the ripple voltage for the same load current and capacitor — exactly matching the observed symptom.' }],
        },
      },
    },
    {
      id: 'F4.M2.L4',
      title: 'MOSFETs: structure, V_th, R_DS(on), body diode',
      minutes: 35,
      content: {
        objectives: [
          'Explain how a MOSFET\'s gate voltage controls conduction between drain and source.',
          'Define threshold voltage (V_th) and R_DS(on), and explain how each affects switching behaviour and loss.',
          'Explain why R_DS(on) rises with temperature and what this means for paralleled MOSFETs.',
          'Identify the body diode\'s terminals and typical role in a bridge leg.',
        ],
        introduction: `The [[mosfet|MOSFET]] is the dominant switching device at the voltage and frequency ranges most battery inverters operate in. This lesson covers how its gate voltage controls conduction, the two ratings ([[threshold-voltage|V_th]] and [[rdson|R_DS(on)]]) that matter most for selecting and testing one, and its built-in [[body-diode|body diode]].`,
        lecture: `### Voltage-controlled switching

A MOSFET's gate is insulated from the rest of the device by a thin oxide layer (hence "metal-oxide-semiconductor") — essentially no DC current flows into the gate once it is charged, only a brief charging/discharging current during switching transitions. Raising the gate-source voltage above the [[threshold-voltage|threshold voltage (V_th)]] creates a conducting channel between drain and source; below V_th, the channel does not form and the device blocks (aside from tiny leakage). This voltage-controlled, near-zero-steady-current gate behaviour is why MOSFETs are relatively easy and efficient to drive compared with older current-controlled device families.

### R_DS(on): the on-state resistance

Once fully on (gate driven well above V_th, commonly 10–15 V for a standard device), a MOSFET behaves approximately like a small resistance, [[rdson|R_DS(on)]], between drain and source. Conduction loss is then simply P = I²·R_DS(on) — exactly the same I²R relationship as a resistor (F4.M1.L1), which is why R_DS(on) is the single most important rating for conduction loss at a given current.

### R_DS(on) rises with temperature

Unlike many materials, a MOSFET's R_DS(on) INCREASES as it heats — commonly by a factor of roughly 1.5–2× from room temperature to a typical maximum junction temperature. This has a genuinely important consequence when MOSFETs are deliberately paralleled to share current: if one device happens to run slightly hotter, its R_DS(on) rises, which in a naive picture might seem to push current AWAY from it toward the cooler devices — a form of natural (if imperfect) self-balancing that helps (but does not guarantee) even current sharing among paralleled devices.

### The body diode, again

As introduced in F4.M2.L2, every power MOSFET has an intrinsic body diode from source to drain, conducting whenever the drain is pulled negative relative to the source by more than a diode drop — carrying freewheeling current for an inductive load whenever the main channel is off. It is generally slower (higher reverse recovery) than a dedicated fast rectifier diode, which matters in some high-frequency designs but not in the switching frequencies most battery inverters use.`,
        technical: `**Gate charge (Q_g).** The total charge the gate driver must deliver to fully turn the MOSFET on (and remove to turn it off), in nanocoulombs — together with switching frequency, this sets the gate-drive power the driver itself must supply, and is one factor in choosing a gate resistor value (F4.M1.L1, F4.M2.L6).

**Avalanche rating.** Many modern power MOSFETs are specifically rated to survive a limited amount of reverse breakdown ("avalanche") energy without damage, giving some tolerance of voltage transients beyond V_DS(max) — a deliberate design margin, not an invitation to operate beyond rated voltage routinely.`,
        diagrams: [{ id: 'hbridge-states', caption: 'A MOSFET\'s gate-controlled channel between drain and source, and how its state (on/off) sets the current path through a bridge leg.' }],
        formulas: [{ name: 'MOSFET conduction loss', expr: 'P_cond = I_rms² · R_DS(on)', where: [['P_cond', 'conduction power loss', 'W'], ['I_rms', 'RMS current through the device', 'A'], ['R_DS(on)', 'on-state drain-source resistance at operating temperature', 'Ω']] }],
        examples: [
          {
            title: 'MOSFET conduction loss',
            problem: 'A MOSFET with R_DS(on) = 15 mΩ carries 20 A RMS. Conduction loss?',
            steps: ['P = I² × R_DS(on)', '= 400 × 0.015'],
            answer: '= 6 W.',
          },
          {
            title: 'Effect of R_DS(on) rising with temperature',
            problem: 'The same MOSFET\'s R_DS(on) rises to 25 mΩ at its hot operating temperature. Recompute the conduction loss at the same 20 A.',
            steps: ['P = I² × R_DS(on), using the new (hotter) R_DS(on)', '= 400 × 0.025'],
            answer: '= 10 W — a 67 % increase in loss purely from the temperature-driven R_DS(on) rise, which further raises temperature (a feedback loop thermal design (F4.M5.L3) must account for).',
            check: '0.025/0.015 ≈ 1.67, matching the 10/6 ≈ 1.67 ratio in the loss — consistent.',
          },
        ],
        applications: `Every MOSFET switching exercise in the Circuit Connection Laboratory and simulator, and the Repair Workshop's MOSFET-failed-open and MOSFET-failed-short scenarios, rest directly on this lesson's structure and ratings.`,
        mistakes: [
          { mistake: 'Assuming a MOSFET needs significant continuous gate current to stay on.', correction: 'The gate is insulated; only a brief charge/discharge current flows during switching transitions, not a sustained on-state current.' },
          { mistake: 'Treating R_DS(on) as a fixed value regardless of temperature.', correction: 'R_DS(on) rises meaningfully with temperature — thermal design must use the HOT value, not the cool datasheet headline figure, for a worst-case loss estimate.' },
          { mistake: 'Forgetting the body diode when analysing why a MOSFET conducts even with its gate held low.', correction: 'The body diode can still conduct (in one direction only) regardless of gate state, if the external voltage across drain-source forward-biases it — this is a real, expected path, not a fault by itself.' },
        ],
        demo: { title: 'See the MOSFET entry', text: 'Compare V_th and R_DS(on) ratings in the Component Library.', link: to.lib('MOSFET', 'mosfet') },
        activities: [to.lib('MOSFET', 'mosfet'), to.ckt('MOSFET switching', 'ckt-06'), to.sim('MOSFET switching experiment', 'sim-05')],
        check: [
          { id: 'k1', type: 'numeric', prompt: 'Conduction loss (W) for R_DS(on)=20 mΩ at 15 A RMS?', answer: 4.5, tol: 0.02, unit: 'W', explain: '15²×0.02=225×0.02=4.5 W.' },
          { id: 'k2', type: 'mcq', prompt: 'Raising gate-source voltage above V_th...', options: ['forms a conducting channel between drain and source', 'has no effect on conduction', 'always destroys the MOSFET', 'only affects the body diode'], answer: 0, explain: 'This is the basic switching action.' },
          { id: 'k3', type: 'mcq', prompt: 'As a MOSFET heats, its R_DS(on) typically...', options: ['rises', 'falls', 'stays exactly constant', 'becomes negative'], answer: 0, explain: 'A positive temperature coefficient of R_DS(on) is typical.' },
          { id: 'k4', type: 'mcq', prompt: 'The body diode conducts when...', options: ['the drain is pulled negative relative to the source by more than a diode drop', 'the gate is driven high', 'the device is cooled', 'never, under any condition'], answer: 0, explain: 'It is a diode from source to drain, independent of gate state.' },
        ],
        summary: [
          'A MOSFET\'s gate voltage (above or below V_th) controls whether a conducting channel forms between drain and source.',
          'R_DS(on) sets conduction loss (P = I²·R_DS(on)) once fully on, and rises meaningfully with temperature.',
          'The rising-R_DS(on)-with-temperature behaviour gives some natural (imperfect) current self-balancing when MOSFETs are paralleled.',
          'The intrinsic body diode conducts in one direction regardless of gate state, carrying freewheeling current for inductive loads.',
        ],
        homework: {
          id: 'F4.M2.L4.hw',
          title: 'MOSFET conduction loss practice',
          brief: 'Apply the conduction-loss formula at different temperatures.',
          tasks: [{ id: 'h1', type: 'numeric', prompt: 'Conduction loss (W) for R_DS(on)=12 mΩ at 25 A RMS?', answer: 7.5, tol: 0.02, unit: 'W', explain: '625×0.012=7.5 W.' }],
          written: [{ prompt: 'Two MOSFETs of the exact same part number are paralleled to share 40 A total. One happens to sit slightly closer to a cooling fan and runs a few degrees cooler than the other. Explain, using R_DS(on)\'s temperature behaviour, which device is likely to carry more current, and why this is a self-limiting (not runaway) effect.', model: 'The cooler device has a slightly lower R_DS(on) (since R_DS(on) rises with temperature) and so initially carries a slightly larger share of the total current for the same voltage drop across both devices. However, carrying more current makes that device dissipate more power and heat up, which in turn raises ITS R_DS(on), pushing some current back toward the other device. This negative-feedback relationship between temperature and R_DS(on) is why parallelled MOSFETs tend toward a reasonably balanced (though rarely perfectly equal) current split, rather than one device progressively taking over all the current in an unstable runaway.' }],
        },
      },
    },
    {
      id: 'F4.M2.L5',
      title: 'IGBTs: V_CE(sat), tail current',
      minutes: 30,
      content: {
        objectives: [
          'Explain why IGBTs are preferred over MOSFETs at higher voltages.',
          'Define V_CE(sat) and compare its loss behaviour with a MOSFET\'s R_DS(on).',
          'Explain tail current and why it makes IGBTs slower to turn off than MOSFETs.',
        ],
        introduction: `The [[igbt|IGBT]] combines a MOSFET-like insulated gate with a bipolar-transistor-like conduction path, giving it an advantage at higher voltages that a comparable MOSFET cannot easily match — at the cost of a switching-speed penalty this lesson explains.`,
        lecture: `### Why IGBTs dominate at higher voltage

A MOSFET's R_DS(on) rises roughly with the square of its voltage rating for a given die size — doubling the voltage rating can mean roughly four times the on-resistance (and conduction loss) for the same physical device size. An IGBT's conduction mechanism does not suffer this same voltage-squared penalty, so at higher voltages (roughly above a few hundred volts, depending on the specific technology generation) an IGBT typically gives lower conduction loss for a given die size and cost than a MOSFET rated for the same voltage — which is why IGBTs dominate the higher-power, higher-voltage end of inverter and motor-drive design, including the MPPT charger stage this platform's component tests already reference.

### V_CE(sat): the IGBT's conduction-loss rating

Rather than behaving like a resistance, a fully-on IGBT has a nearly CONSTANT collector-emitter voltage drop, [[vcesat|V_CE(sat)]] (typically 1.2–2.5 V), largely independent of current over a wide range — so IGBT conduction loss is approximately P ≈ V_CE(sat) × I, much like a diode's conduction loss (F4.M2.L2), rather than the I² relationship a MOSFET's R_DS(on) gives.

### Tail current: the switching-speed trade-off

When an IGBT turns off, it does not stop conducting instantly: a "tail current" persists briefly afterward, caused by minority carriers (F4.M2.L1) that were injected during conduction and must recombine before the device fully blocks. This tail current, flowing while voltage across the device is already rising, causes a genuine turn-off energy loss that MOSFETs (which turn off essentially instantly by comparison) do not suffer — the direct reason IGBTs are generally used at LOWER switching frequencies than MOSFETs for a comparable total loss budget.`,
        technical: `**IGBT generations.** Successive IGBT generations (planar, trench, field-stop and beyond) have progressively reduced tail-current losses and V_CE(sat), narrowing (without eliminating) the switching-speed gap with MOSFETs — datasheets for modern IGBTs quote tail-current-related turn-off energy (E_off) directly for this reason.

**Co-packaged diode.** Nearly every IGBT module includes a fast anti-parallel diode (distinct from a MOSFET's intrinsic body diode, since an IGBT has no equivalent built-in structure) specifically selected for fast reverse recovery to limit the extra loss this combination can otherwise cause during switching transitions.`,
        diagrams: [{ id: 'quasi-square', caption: 'An IGBT\'s collector current during turn-off, showing the sharp initial fall followed by the slower-decaying tail current.' }],
        formulas: [{ name: 'IGBT conduction loss (approx.)', expr: 'P_cond ≈ V_CE(sat) · I_avg', where: [['V_CE(sat)', 'saturation collector-emitter voltage', 'V'], ['I_avg', 'average collector current', 'A']] }],
        examples: [
          {
            title: 'IGBT conduction loss',
            problem: 'An IGBT has V_CE(sat) = 1.8 V and carries an average 15 A. Conduction loss?',
            steps: ['P ≈ V_CE(sat) × I_avg', '= 1.8 × 15'],
            answer: '= 27 W.',
          },
          {
            title: 'Choosing between MOSFET and IGBT',
            problem: 'A 400 V, 10 kHz switching stage is being designed. Which device family is the more natural starting choice, and why?',
            steps: ['400 V is in the range where IGBT conduction loss typically beats a MOSFET of equivalent die size/cost', '10 kHz is a moderate switching frequency where tail-current turn-off loss, while present, is usually still manageable for an IGBT'],
            answer: 'IGBT — the voltage level favours its conduction-loss advantage, and the switching frequency is not so high that tail-current loss would dominate the design, unlike it might at 100+ kHz.',
          },
        ],
        applications: `The MPPT charger switch you tested in the Component Library's IGBT procedure, and any higher-voltage bridge stage in a hybrid or high-frequency inverter, are exactly where this lesson's trade-off plays out in practice.`,
        mistakes: [
          { mistake: 'Assuming IGBTs are simply "better MOSFETs" in every respect.', correction: 'IGBTs trade switching speed (tail current) for lower conduction loss at higher voltage — neither device dominates the other universally; the right choice depends on voltage and frequency.' },
          { mistake: 'Modelling IGBT conduction loss with an I² relationship.', correction: 'Use P ≈ V_CE(sat) × I, not I²R — an IGBT behaves more like a diode\'s roughly-constant voltage drop than a resistor.' },
          { mistake: 'Ignoring tail current when estimating total IGBT switching loss.', correction: 'Tail current is a genuine, datasheet-quantified (E_off) loss mechanism at turn-off, not a negligible detail.' },
        ],
        demo: { title: 'See the IGBT entry', text: 'Compare V_CE(sat) against a MOSFET\'s R_DS(on) for the same current.', link: to.lib('IGBT', 'igbt') },
        activities: [to.lib('IGBT', 'igbt'), to.proc('IGBT check procedure', 'igbt', 'igbt-check')],
        check: [
          { id: 'k1', type: 'numeric', prompt: 'IGBT conduction loss (W) for V_CE(sat)=1.5 V at 20 A average?', answer: 30, tol: 0.02, unit: 'W', explain: '1.5×20=30 W.' },
          { id: 'k2', type: 'mcq', prompt: 'IGBTs are generally preferred over MOSFETs at...', options: ['higher voltages, where their conduction-loss advantage is greatest', 'lower voltages only', 'all voltages equally', 'never, MOSFETs are always better'], answer: 0, explain: 'MOSFET R_DS(on) scales poorly with voltage rating.' },
          { id: 'k3', type: 'mcq', prompt: 'Tail current occurs...', options: ['briefly after turn-off, from minority-carrier recombination', 'only during turn-on', 'continuously while fully on', 'only in MOSFETs'], answer: 0, explain: 'A turn-off phenomenon specific to bipolar-type conduction.' },
        ],
        summary: [
          'IGBTs combine a MOSFET-like gate with bipolar-style conduction, giving lower conduction loss than a comparable MOSFET at higher voltages.',
          'V_CE(sat), not R_DS(on), sets IGBT conduction loss: P ≈ V_CE(sat) × I, roughly independent of current level.',
          'Tail current after turn-off, from minority-carrier recombination, is a genuine IGBT switching-loss mechanism that MOSFETs do not share.',
          'Neither device family dominates universally; the right choice depends on the voltage and switching frequency of the design.',
        ],
        homework: {
          id: 'F4.M2.L5.hw',
          title: 'IGBT conduction loss practice',
          brief: 'Apply the V_CE(sat) loss formula and compare device choices.',
          tasks: [{ id: 'h1', type: 'numeric', prompt: 'IGBT conduction loss (W) for V_CE(sat)=2 V at 18 A average?', answer: 36, tol: 0.02, unit: 'W', explain: '2×18=36 W.' }],
          written: [{ prompt: 'A designer wants to raise a 10 kHz IGBT-based bridge\'s switching frequency to 80 kHz to shrink the output filter\'s size, without changing the device. Explain, using tail current, why this is likely to cause a disproportionate rise in total losses.', model: 'Tail-current turn-off loss occurs once per switching cycle, so the total switching-loss POWER it contributes scales roughly in proportion to switching frequency. Raising the frequency eightfold (10 kHz to 80 kHz) would raise this component of loss roughly eightfold too, on top of whatever conduction loss remains — likely pushing total losses well beyond what the device and its cooling were designed for. This is exactly why IGBTs are generally kept at lower switching frequencies than MOSFETs for a comparable loss budget; a frequency increase this large would normally call for a different device family (or a different circuit topology) rather than simply reusing the same IGBTs faster.' }],
        },
      },
    },
    {
      id: 'F4.M2.L6',
      title: 'Gate drivers: bootstrap, isolation, dead time',
      minutes: 30,
      content: {
        objectives: [
          'Explain why a gate driver, not the control signal directly, is needed to switch a power MOSFET or IGBT.',
          'Explain how a bootstrap supply powers a floating high-side driver.',
          'State what dead time is and why every bridge leg\'s driver must enforce it.',
        ],
        introduction: `A microcontroller or PWM controller (F4.M5.L1) produces small, logic-level signals — nowhere near enough voltage or current to switch a power MOSFET or IGBT quickly. The [[gate-driver|gate driver]] sits between the two, and this lesson covers its three defining jobs: enough drive, a floating high-side supply, and enforced [[dead-time|dead time]].`,
        lecture: `### Why a dedicated driver is needed

Switching a MOSFET or IGBT quickly means charging and discharging its gate capacitance fast, which needs a genuine current pulse (often amps, briefly) at the right voltage (commonly 10–15 V) — far beyond what a microcontroller pin or PWM controller output can supply directly. A gate driver is essentially a fast, high-current amplifier dedicated to this one job, placed as close to the gate as practical to minimise the inductance in the drive path.

### The floating high-side problem, and the bootstrap solution

In a [[half-bridge|half-bridge]] leg, the LOW-side switch's source sits at a fixed reference (commonly 0 V / the negative rail), so its driver can be powered from a simple fixed supply. The HIGH-side switch's source, however, sits at the leg's SWITCHED MIDPOINT voltage, which swings between the two rail voltages as the leg switches — the high-side driver's own supply must "float" and follow this swinging reference. A [[bootstrap|bootstrap supply]] solves this cheaply: a small capacitor and diode that charge while the low-side switch is on (when the midpoint is near the low rail, allowing the bootstrap capacitor to charge relative to it), then supply the high-side driver once it floats up with the midpoint — simple and cheap, but it needs regular low-side on-time to stay charged, which is a real design constraint at very high or very low duty cycles.

### Dead time: preventing shoot-through

If both switches of one leg were ever on simultaneously, even briefly, they would form a direct short circuit across the DC bus — [[shoot-through|shoot-through]] — destroying both switches in microseconds. Every competent gate-driver design enforces [[dead-time|dead time]]: a short, deliberate interval (commonly 0.5–3 µs) where NEITHER switch is driven on, ensuring one has fully turned off before the other is allowed to turn on, even accounting for each device's own turn-off delay.

### Isolated gate drivers

Where the high-side reference swings over a very large voltage range, or where safety requires a complete galvanic barrier between control and power stages, an isolated gate driver (using an isolation transformer or optocoupler internally) is used instead of a bootstrap supply — more complex and costly, but able to float over arbitrarily large voltage swings and provide true electrical isolation.`,
        technical: `**Bootstrap capacitor sizing.** Too small a bootstrap capacitor droops excessively during a long high-side on-time (risking insufficient gate voltage); too large slows its own recharging during the required low-side on-time — a genuine sizing trade-off, not an arbitrary choice.

**Dead time versus switching loss.** Longer dead time gives a larger shoot-through safety margin but also means a longer interval where the leg's output is determined by whichever device's body/freewheeling diode happens to be conducting (rather than the intended switch), introducing a small timing-dependent distortion at the output — so dead time is set with margin, not maximised arbitrarily.`,
        diagrams: [{ id: 'deadtime', caption: 'The enforced dead-time interval between one switch turning off and the other turning on in a bridge leg, preventing shoot-through.' }],
        formulas: [{ name: 'Minimum dead time (practical rule)', expr: 't_dead > t_off(slowest switch) + margin', where: [['t_dead', 'enforced dead time', 's'], ['t_off', 'the slower switch\'s actual turn-off delay', 's']], note: 'Dead time must comfortably exceed the slowest device\'s own turn-off delay, with margin for variation between devices and temperature.' }],
        examples: [
          {
            title: 'Why shoot-through is so destructive',
            problem: 'Explain, in terms of path resistance, why even a brief overlap of both switches in a leg being on causes severe damage.',
            steps: ['Both switches being on connects the full DC bus voltage across only the switches\' own low on-state resistance/voltage, with no load limiting current', 'Current rises extremely rapidly (limited only by stray inductance and the switches\' own tiny resistance), reaching destructive levels in microseconds', 'This is functionally identical to directly short-circuiting the bus with a piece of wire'],
            answer: 'Shoot-through presents almost no impedance to the full bus voltage, so current rises to destructive levels almost instantly — this is why dead time is treated as a non-negotiable safety margin, not a tunable performance parameter.',
          },
          {
            title: 'Why a bootstrap supply needs regular low-side on-time',
            problem: 'A leg is driven at a very high duty cycle, so the high-side switch is on almost continuously and the low-side switch is on only very briefly each cycle. Explain the risk to the bootstrap supply.',
            steps: ['The bootstrap capacitor only recharges while the low-side switch is on', 'A very brief low-side on-time gives very little recharging opportunity each cycle', 'Meanwhile the high-side driver continuously draws a small current from the bootstrap capacitor while the high side is on'],
            answer: 'The bootstrap capacitor can droop further each cycle than it recovers, eventually leaving the high-side gate under-driven — a known limitation of bootstrap supplies at extreme duty cycles, one reason isolated drivers are sometimes chosen instead for such applications.',
          },
        ],
        applications: `Every H-bridge and half-bridge exercise in the Circuit Connection Laboratory assumes correctly enforced dead time; the Repair Workshop's gate-driver-signal-lost scenario is the direct fault-mode counterpart of this lesson.`,
        mistakes: [
          { mistake: 'Assuming a microcontroller pin can switch a power MOSFET directly.', correction: 'A dedicated gate driver is needed to supply the fast, high-current gate charge/discharge a power switch requires.' },
          { mistake: 'Treating dead time as a performance knob to minimise for best waveform quality.', correction: 'Dead time is primarily a shoot-through safety margin; it must comfortably exceed the slowest switch\'s turn-off delay, not be minimised for cosmetic waveform reasons.' },
          { mistake: 'Forgetting that a bootstrap supply needs the low-side switch to turn on periodically to stay charged.', correction: 'At very high (or very low) duty cycles, bootstrap charging can become marginal — a genuine design limitation, not a minor detail.' },
        ],
        demo: { title: 'Check a gate-driver test procedure', text: 'Walk through the gate-driver test procedure, noting the safety steps around the floating high-side reference.', link: to.proc('Gate driver test (scope)', 'gate-driver', 'driver-scope') },
        activities: [to.lib('Gate driver', 'gate-driver'), to.proc('Gate driver scope test', 'gate-driver', 'driver-scope'), to.repair('Gate-driver signal lost', 'rsc-10')],
        check: [
          { id: 'k1', type: 'mcq', prompt: 'A gate driver is needed mainly because...', options: ['switching a power device quickly needs a fast, high-current pulse beyond a logic signal\'s capability', 'the gate needs a continuous large current to stay on', 'MOSFETs have no gate', 'IGBTs do not need gate drive'], answer: 0, explain: 'The gate itself draws little steady current, but switching transitions need a fast charge/discharge pulse.' },
          { id: 'k2', type: 'mcq', prompt: 'A bootstrap supply charges while...', options: ['the low-side switch is on', 'the high-side switch is on', 'both switches are off', 'the bus is disconnected'], answer: 0, explain: 'The midpoint sits near the low rail during low-side conduction, allowing the bootstrap capacitor to charge.' },
          { id: 'k3', type: 'mcq', prompt: 'Dead time exists to prevent...', options: ['shoot-through (both leg switches on at once)', 'excessive switching frequency', 'reverse polarity', 'gate driver overheating'], answer: 0, explain: 'A direct short across the bus if both switches overlap.' },
        ],
        summary: [
          'A gate driver supplies the fast, high-current gate charge/discharge a power device needs, which a logic-level signal cannot provide directly.',
          'A bootstrap supply (capacitor and diode) powers a floating high-side driver cheaply, charging during low-side on-time.',
          'Dead time is an enforced interval with neither leg switch on, preventing destructive shoot-through — set with safety margin, not minimised for performance.',
          'Isolated gate drivers replace bootstrap supplies where voltage swing or safety isolation requirements exceed what a bootstrap can provide.',
        ],
        homework: {
          id: 'F4.M2.L6.hw',
          title: 'Gate driver reasoning practice',
          brief: 'Reason about dead time and bootstrap limitations.',
          tasks: [{ id: 'h1', type: 'mcq', prompt: 'If dead time is set shorter than the slowest switch\'s actual turn-off delay, the risk is...', options: ['shoot-through', 'reduced switching frequency', 'lower conduction loss', 'improved waveform quality'], answer: 0, explain: 'The faster switch could turn on before the slower one has fully turned off.' }],
          written: [{ prompt: 'A bridge leg\'s output waveform shows a brief, unintended glitch at every switching transition. Diagnostics confirm dead time is correctly set and shoot-through is not occurring. Suggest, using this lesson\'s ideas, a plausible benign explanation for the glitch, rather than assuming a fault.', model: 'During the dead-time interval itself, with neither switch actively driven on, the leg\'s output is determined by whichever device\'s body or freewheeling diode happens to be conducting the load current at that moment — not by either switch\'s intended state. This is an expected, designed-in consequence of dead time (not a fault): the output briefly follows the conducting diode\'s voltage during every dead-time window, producing a small, consistent glitch at every transition. Confirming the glitch\'s size and timing match the configured dead time, rather than appearing randomly, would support this benign explanation over a developing fault.' }],
        },
      },
    },
    {
      id: 'F4.M2.L7',
      title: 'Switching characteristics and losses',
      minutes: 30,
      content: {
        objectives: [
          'Distinguish conduction loss from switching loss and explain how each scales with operating conditions.',
          'Explain why switching loss rises with switching frequency.',
          'Combine conduction and switching loss into a total device loss estimate.',
        ],
        introduction: `F4.M2.L4 and L5 covered each device family's conduction loss separately. This lesson adds the other half of the picture — [[switching-loss|switching loss]] — and shows how the two combine into the total heat a switching device actually produces, which (F4.M5.L3) ultimately sets its cooling requirement.`,
        lecture: `### Two different loss mechanisms

- **[[conduction-loss|Conduction loss]]**: dissipated while the device is fully ON, carrying load current (I²·R_DS(on) for a MOSFET, V_CE(sat)·I for an IGBT, F4.M2.L4/L5). Independent of switching frequency.
- **[[switching-loss|Switching loss]]**: dissipated during each turn-ON and turn-OFF TRANSITION, while voltage and current briefly overlap (the device is neither fully off nor fully on) before settling to its new state, plus (for an IGBT) the tail-current energy at turn-off. This happens once per transition, so its total POWER contribution scales roughly in proportion to switching FREQUENCY — more transitions per second means more switching-loss energy dissipated per second.

### Why the trade-off matters for design choices

A higher switching frequency (F3.M5, P3) gives a smaller, cheaper output filter (because the switching "noise" sits further above the fundamental and is easier to filter) but directly raises switching loss. A design must balance filter size/cost against switching loss/cooling cost — neither extreme is free, and the right balance depends on the specific device, voltage and power level, which is exactly why switching frequency is a genuine design decision, not an arbitrary number.

### Total device loss

Total power dissipated by one switching device is, to a reasonable first approximation, the SUM of its conduction loss and its switching loss at the actual operating current, voltage and switching frequency. This total is what the thermal design (F4.M5.L3) must successfully remove as heat to keep the device below its maximum junction temperature.`,
        technical: `**Switching energy (E_on, E_off).** Datasheets commonly quote turn-on and turn-off energy (in µJ or mJ) at a stated test voltage and current; switching loss power is then approximately P_sw ≈ (E_on + E_off) × f_sw, scaled for the actual operating voltage and current if they differ from the datasheet test conditions (switching energy scales roughly with both voltage and current, though not always perfectly linearly).

**Soft-switching techniques** (mentioned for context, beyond this course's main scope) arrange the circuit so that voltage or current is near zero during a transition, substantially reducing switching loss — used in some higher-frequency converter topologies at the cost of added circuit complexity.`,
        diagrams: [{ id: 'thermal-network', caption: 'Conduction loss and switching loss both feeding into the same total heat a switching device must shed through its thermal path.' }],
        formulas: [
          { name: 'Switching loss (approx.)', expr: 'P_sw ≈ (E_on + E_off) · f_sw', where: [['P_sw', 'switching loss power', 'W'], ['E_on', 'turn-on switching energy per event', 'J'], ['E_off', 'turn-off switching energy per event', 'J'], ['f_sw', 'switching frequency', 'Hz']] },
          { name: 'Total device loss', expr: 'P_total = P_cond + P_sw', where: [] },
        ],
        examples: [
          {
            title: 'Switching loss scaling with frequency',
            problem: 'A device has combined switching energy (E_on+E_off) = 50 µJ. Compare switching loss at 10 kHz and 50 kHz.',
            steps: ['At 10 kHz: P = 50e-6 × 10,000 = 0.5 W', 'At 50 kHz: P = 50e-6 × 50,000 = 2.5 W'],
            answer: 'Switching loss rises fivefold (0.5 W → 2.5 W) for a fivefold frequency increase — directly proportional, as the formula predicts.',
          },
          {
            title: 'Total device loss',
            problem: 'A MOSFET has conduction loss 6 W and switching loss 2.5 W at its operating point. Total device loss, and what must remove it?',
            steps: ['P_total = P_cond + P_sw', '= 6 + 2.5'],
            answer: '= 8.5 W, which the device\'s thermal path (case, heat sink, airflow, F4.M5.L3) must remove to keep junction temperature within its rated limit.',
          },
        ],
        applications: `Every efficiency figure quoted for a Build Your Own Inverter project, and every heat-sink/fan sizing decision in F4.M5.L3, ultimately traces back to exactly this conduction-plus-switching loss sum for each switching device in the design.`,
        mistakes: [
          { mistake: 'Assuming switching loss is negligible compared with conduction loss.', correction: 'At higher switching frequencies, switching loss can equal or exceed conduction loss — it must be checked, not assumed away.' },
          { mistake: 'Believing conduction loss depends on switching frequency.', correction: 'Conduction loss depends on current and on-state resistance/voltage only, independent of how fast the device switches; only switching loss scales with frequency.' },
          { mistake: 'Comparing switching-energy figures from different datasheet test conditions without scaling.', correction: 'E_on/E_off figures are quoted at specific test voltage and current; scale appropriately (or use manufacturer-provided scaling curves) before applying them at a different operating point.' },
        ],
        demo: { title: 'See real loss figures', text: 'Compare conduction and switching behaviour on the MOSFET switching circuit exercise.', link: to.ckt('MOSFET switching', 'ckt-06') },
        activities: [to.ckt('MOSFET switching', 'ckt-06'), to.sim('PWM generation experiment', 'sim-06')],
        check: [
          { id: 'k1', type: 'numeric', prompt: 'Switching loss (W) for (E_on+E_off)=30 µJ at 20 kHz?', answer: 0.6, tol: 0.02, unit: 'W', explain: '30e-6×20000=0.6 W.' },
          { id: 'k2', type: 'mcq', prompt: 'Switching loss scales roughly in proportion to...', options: ['switching frequency', 'conduction current only', 'ambient temperature only', 'it does not scale with anything'], answer: 0, explain: 'More transitions per second means more switching-loss energy dissipated per second.' },
          { id: 'k3', type: 'mcq', prompt: 'Total device loss is best estimated as...', options: ['conduction loss plus switching loss', 'conduction loss only', 'switching loss only', 'the larger of the two, ignoring the smaller'], answer: 0, explain: 'Both mechanisms contribute real heat and should be summed.' },
        ],
        summary: [
          'Conduction loss (frequency-independent) and switching loss (frequency-dependent) are two separate mechanisms that together set total device loss.',
          'Switching loss power scales roughly in proportion to switching frequency: P_sw ≈ (E_on+E_off)×f_sw.',
          'Higher switching frequency trades smaller/cheaper filtering against higher switching loss — a genuine design balance.',
          'Total device loss (conduction + switching) is what the thermal design must remove as heat.',
        ],
        homework: {
          id: 'F4.M2.L7.hw',
          title: 'Combined loss practice',
          brief: 'Compute conduction, switching and total loss.',
          tasks: [
            { id: 'h1', type: 'numeric', prompt: 'Switching loss (W) for (E_on+E_off)=40 µJ at 25 kHz?', answer: 1, tol: 0.02, unit: 'W', explain: '40e-6×25000=1 W.' },
            { id: 'h2', type: 'numeric', prompt: 'Total loss (W) for conduction loss 5 W and switching loss 1.2 W?', answer: 6.2, tol: 0.01, unit: 'W', explain: '5+1.2=6.2 W.' },
          ],
          written: [{ prompt: 'A design team proposes doubling a converter\'s switching frequency to halve its output filter\'s physical size, without changing the switching devices. Explain what else must be re-checked before accepting this change, using this lesson\'s loss model.', model: 'Doubling switching frequency roughly doubles switching-loss power (since P_sw scales in proportion to frequency), while conduction loss stays unchanged. The new total device loss, and whether the existing heat sink and airflow can still keep the device below its maximum junction temperature at this higher total loss, must be re-checked (F4.M5.L3) — shrinking the filter is not free, and the thermal design that was adequate at the original frequency may no longer be adequate at the doubled frequency.' }],
        },
      },
    },
    {
      id: 'F4.M2.L8',
      title: 'Component testing: diode, MOSFET and IGBT checks',
      minutes: 30,
      content: {
        objectives: [
          'Apply the diode-test method to confirm a diode, a MOSFET body diode and an IGBT\'s co-packaged diode.',
          'Apply the out-of-circuit MOSFET check (diode test plus gate-charge test) to confirm a suspect switch.',
          'Explain why these devices are normally tested OUT of circuit, removed from the board.',
        ],
        introduction: `This lesson turns F4.M2.L2–L5's theory into bench practice: the actual test procedures used in the Component Library and the Repair Workshop to confirm whether a diode, MOSFET or IGBT is healthy, out of circuit and before it is ever trusted in a repair.`,
        lecture: `### The diode-test method

Most digital multimeters have a dedicated "diode test" range: it forces a small, known current through the probes and displays the resulting voltage drop, which for a healthy silicon PN junction reads close to its expected forward voltage (roughly 0.5–0.7 V) in one probe direction and "OL" (open/no reading) in the other — confirming correct one-directional conduction. A short reads near 0 V in BOTH directions; an open reads OL in both.

### Testing a MOSFET out of circuit

The MOSFET check in the Component Library combines three steps, each isolating one failure mode: (1) diode-test the body diode (source to drain forward, drain to source reverse) to catch a shorted or badly leaking device; (2) diode-test gate-to-source and gate-to-drain in BOTH directions, expecting OL both ways, to confirm the gate oxide has not been punctured (a gate short is a common consequence of a voltage spike reaching the gate, often implicating the gate driver too); (3) briefly charge the gate (forward-biasing it above V_th with the meter's own diode-test voltage, or a small bench supply) and re-check drain-source conduction, confirming the channel actually turns on when commanded.

### Testing an IGBT out of circuit

Because an IGBT's gate is also insulated (like a MOSFET's), a similar two-part check applies: diode-test its co-packaged anti-parallel diode (collector-emitter reverse direction for the diode's forward path), then drive the gate on (commonly +15 V through a current-limiting resistor from a bench supply, since IGBTs are usually used at voltages where a meter's own diode-test current is not representative) and confirm the device conducts with a low V_CE, matching its expected V_CE(sat).

### Why out of circuit

As with passive components (F4.M1.L4), testing in circuit risks reading a parallel path through the rest of the board — doubly true for semiconductor devices in a bridge, where neighbouring devices and freewheeling paths can easily mask or mimic a fault if the suspect device is not isolated first.`,
        technical: `**Gate-charge test current.** A meter's diode-test range typically forces only a few hundred microamps to a few milliamps — enough to momentarily charge a MOSFET's small gate capacitance above V_th for a quick functional check, but far below what a real gate driver supplies; this test confirms the device CAN turn on, not its full switching speed or current-handling capability.

**ESD precautions.** MOSFET and IGBT gates, being capacitively coupled through a thin oxide layer, can be damaged by an electrostatic discharge through the gate pin — anti-static precautions (grounded wrist strap, anti-static mat) are a standard, non-optional part of handling these parts out of circuit, not an excessive precaution.`,
        diagrams: [{ id: 'test-bench', caption: 'The sequence of a MOSFET out-of-circuit check: body diode, gate insulation in both directions, then gate-charge functional test.' }],
        formulas: [{ name: 'Expected diode-test reading (healthy silicon)', expr: 'V_f ≈ 0.45–0.7 V (forward), OL (reverse)', where: [] }],
        examples: [
          {
            title: 'Interpreting a MOSFET body-diode reading',
            problem: 'A suspect MOSFET reads 0.00 V (not OL) with the meter\'s red lead on source and black on drain, in diode-test mode. What does this indicate?',
            steps: ['A healthy body diode would read roughly 0.5 V in this forward direction, not 0.00 V', '0.00 V in a direction that should show a diode drop indicates a direct short, not a healthy junction'],
            answer: 'The MOSFET has a drain-source short (a "failed short" device) and should be replaced; 0.00 V where a diode drop is expected is the signature reading, matching the Repair Workshop\'s MOSFET-failed-short scenario.',
          },
          {
            title: 'Interpreting a gate-insulation reading',
            problem: 'A suspect MOSFET reads 0.0x V (a small but non-zero reading, not OL) from gate to source. What does this suggest, and what else should be checked?',
            steps: ['A healthy gate should read OL (no path) in this test — the gate oxide should present an open circuit', 'A small, non-zero reading suggests the gate oxide has been punctured, often from a voltage spike'],
            answer: 'The gate has very likely been punctured (a gate short), and — because a spike reaching the gate this way is often caused by a gate-driver fault rather than a random event — the gate driver itself should also be checked before simply replacing the switch.',
          },
        ],
        applications: `These exact readings, in this exact sequence, are what you take and interpret in the Repair Workshop's MOSFET-failed-open and MOSFET-failed-short scenarios — this lesson is the theory behind those live measurements.`,
        mistakes: [
          { mistake: 'Testing a MOSFET or IGBT while still soldered into the board.', correction: 'Remove it (or at minimum lift the relevant leads) first — parallel paths through the rest of the board can mask or mimic a fault.' },
          { mistake: 'Skipping the gate-insulation check because the body-diode reading looked healthy.', correction: 'A healthy body diode does not rule out a punctured gate — both failure modes are independent and both must be checked.' },
          { mistake: 'Forgetting ESD precautions when handling a MOSFET or IGBT out of circuit.', correction: 'The insulated gate is genuinely vulnerable to electrostatic discharge damage; anti-static handling is standard practice, not optional caution.' },
        ],
        demo: { title: 'Run the MOSFET check procedure', text: 'Work through the full three-step out-of-circuit MOSFET check.', link: to.proc('Out-of-circuit MOSFET check', 'mosfet', 'mosfet-diode') },
        activities: [to.proc('MOSFET diode/gate-charge check', 'mosfet', 'mosfet-diode'), to.proc('IGBT check', 'igbt', 'igbt-check')],
        check: [
          { id: 'k1', type: 'mcq', prompt: 'A healthy silicon body diode, forward direction, reads approximately...', options: ['0.5–0.7 V', '0.00 V', 'OL', '5 V'], answer: 0, explain: 'A typical silicon forward-voltage reading.' },
          { id: 'k2', type: 'mcq', prompt: 'A gate-to-source reading of OL (both directions) on a MOSFET indicates...', options: ['the gate oxide is intact (healthy)', 'the gate is punctured', 'the channel is conducting', 'the device is shorted'], answer: 0, explain: 'OL both ways means no path exists, as expected for an intact insulated gate.' },
          { id: 'k3', type: 'mcq', prompt: 'A 0.00 V diode-test reading where a body-diode drop is expected indicates...', options: ['a drain-source short', 'a healthy device', 'an open gate', 'normal gate-charge behaviour'], answer: 0, explain: 'A genuine diode drop should not read as a dead short.' },
        ],
        summary: [
          'A meter\'s diode-test range reads a healthy silicon junction\'s forward voltage (~0.5–0.7 V) one way and OL the other.',
          'A MOSFET\'s out-of-circuit check combines a body-diode test, a gate-insulation test (both directions) and a gate-charge functional test.',
          'An IGBT check combines its co-packaged diode test with a driven-gate functional check (commonly from a bench supply at the device\'s real operating voltage).',
          'Testing out of circuit, with ESD precautions for the insulated gate, avoids both masked parallel-path readings and accidental gate damage.',
        ],
        homework: {
          id: 'F4.M2.L8.hw',
          title: 'Semiconductor test interpretation',
          brief: 'Interpret diode-test readings for suspected faults.',
          tasks: [{ id: 'h1', type: 'mcq', prompt: 'A MOSFET reads OL in BOTH directions across drain-source in diode-test mode (no gate charge applied). This is...', options: ['expected/healthy behaviour with the channel off', 'definitely a fault', 'impossible', 'evidence of a short'], answer: 0, explain: 'With no gate charge, the channel is off; OL both ways across drain-source before the body-diode direction is separately checked is a plausible healthy intermediate reading, not a fault by itself.' }],
          written: [{ prompt: 'A suspect MOSFET passes the body-diode test and the gate-insulation test, but fails to show the expected drain-source conduction after the gate-charge step. Explain what this pattern of results suggests, and why testing all three steps (rather than stopping after the first pass) matters.', model: 'Passing the body-diode and gate-insulation tests rules out a drain-source short and a punctured gate, but failing to conduct after the gate is charged indicates the channel itself is not forming correctly when commanded — the device cannot be turned on, even though it is not shorted or gate-punctured. This is a distinct failure mode (effectively an open or non-functional channel) from the other two, and it would have been missed entirely if testing had stopped after the first two steps passed — exactly why all three checks are needed to characterise a MOSFET fully, not just enough to find one problem and stop.' }],
        },
      },
    },
    {
      id: 'F4.M2.L9',
      title: 'Fault identification: short, open, leakage',
      minutes: 25,
      content: {
        objectives: [
          'Classify a semiconductor fault as short, open or excessive leakage from its symptoms and readings.',
          'Explain typical root causes for each fault category in MOSFETs, IGBTs and diodes.',
          'Explain why identifying the ROOT CAUSE, not just the failed part, matters before replacement.',
        ],
        introduction: `Every semiconductor fault you will meet, in this course and in the Repair Workshop, reduces to one of three categories: short, open, or excessive leakage. This lesson gives you the vocabulary and reasoning to classify a fault correctly and — critically — to ask WHY it happened before simply replacing the part.`,
        lecture: `### The three fault categories

- **Short**: the device conducts in both directions, or in a direction/state it should not, offering near-zero resistance where a healthy device would block or show a diode drop. Common causes: voltage/current beyond rating, gate oxide puncture leading to channel failure, or manufacturing/age-related breakdown.
- **Open**: the device fails to conduct even when it should (a blown internal bond wire, a cracked die, a severed internal connection). The device may read OL everywhere, including paths that should show a diode drop.
- **Excessive leakage**: the device still broadly behaves correctly (blocks when it should, conducts when it should) but its OFF-state leakage current has risen far above healthy — often an early-stage, partially-degraded fault rather than a complete failure, and sometimes missed by a simple pass/fail diode test if the leakage is not large enough to show up as a clear reading change.

### Root cause matters, not just the symptom

A shorted MOSFET is a SYMPTOM; the question that actually prevents a repeat failure is WHY it shorted. Common real-world root causes include: a gate driver fault that let shoot-through occur (F4.M2.L6); exceeding the device's voltage rating from an unsuppressed transient; exceeding its current rating from an unrelated downstream fault (an output short, or a saturating inductor, F4.M1.L3); or simple end-of-life degradation under normal stress. Replacing the failed device without investigating which of these applies risks an immediate repeat failure — exactly the reasoning the Repair Workshop's rubric rewards (diagnosis AND repair AND verification, not diagnosis alone).

### Cascading failures

Semiconductor faults often cascade: a shorted MOSFET can blow the fuse protecting it (F4.M4.L1), and a lost gate-driver signal (F4.M2.L6) can leave a switch permanently off, which can then starve a downstream load or confuse a feedback loop. Correctly distinguishing the ORIGINAL fault from its downstream consequences is part of fault identification, not a separate skill.`,
        technical: `**Leakage current versus temperature.** Reverse leakage current in any semiconductor junction roughly doubles for every 8–10 °C rise in junction temperature (an approximate rule of thumb, not a precise law) — a device with borderline-elevated leakage at room temperature can leak dramatically more once hot, sometimes triggering thermal runaway in a weakened part.

**Intermittent faults.** A fault that only appears under load, vibration or temperature (a cracked solder joint, a marginal connector, F4.M4) can pass every static out-of-circuit test yet still be the real cause of a reported symptom — this is why the Repair Workshop's checkpoints also test REPRODUCING a fault under representative conditions, not just a single static reading.`,
        diagrams: [{ id: 'fault-method', caption: 'Classifying a semiconductor fault as short, open or excessive leakage, then tracing back to a plausible root cause before repair.' }],
        formulas: [{ name: 'Approximate leakage-current temperature rule', expr: 'I_leak(T+10°C) ≈ 2 × I_leak(T)', where: [['I_leak', 'reverse/off-state leakage current', 'A']], note: 'A rough rule of thumb for reasoning about thermal sensitivity of leakage faults, not a precise datasheet figure.' }],
        examples: [
          {
            title: 'Classifying a fault from a reading',
            problem: 'A diode reads 0.00 V in both forward and reverse diode-test directions. Classify this fault.',
            steps: ['Healthy: ~0.6 V forward, OL reverse', 'Reading 0.00 V in BOTH directions means it conducts both ways with no barrier at all'],
            answer: 'Short — the junction offers no blocking behaviour in either direction.',
          },
          {
            title: 'Reasoning about root cause before replacement',
            problem: 'A replacement MOSFET, fitted after the original failed short, itself fails short again within minutes of being powered up. Suggest a reasoning approach rather than a specific cause.',
            steps: ['A second, near-immediate failure of a like-for-like replacement strongly suggests an ongoing external cause, not a coincidental second random failure', 'Likely candidates to investigate: the gate driver (is it genuinely enforcing dead time and driving correctly?), the protection sized for this leg (is a fuse/breaker actually interrupting an overcurrent fast enough?), or an unrelated fault elsewhere forcing excessive current or voltage onto this device'],
            answer: 'The repair should not stop at fitting a second replacement; the gate-driver signal, dead-time enforcement, and upstream protection sizing all need investigating as the likely ROOT cause before the switch is trusted to survive.',
          },
        ],
        applications: `This exact reasoning — short/open/leakage classification, then root-cause investigation — is scored explicitly by the Repair Workshop's "diagnose" AND "eliminate" rubric categories; neither is satisfied by naming the symptom alone.`,
        mistakes: [
          { mistake: 'Treating "the MOSFET failed" as a complete diagnosis.', correction: 'Classify HOW it failed (short/open/leakage) and investigate WHY, before considering the diagnosis complete.' },
          { mistake: 'Assuming a repeat failure of a replacement part means a bad batch of parts.', correction: 'A near-immediate repeat failure much more often indicates an unaddressed external root cause than coincidental part defects — investigate the circuit around the device first.' },
          { mistake: 'Dismissing a borderline leakage reading as "probably fine" without comparing to a healthy reference.', correction: 'Elevated leakage is a real, if early-stage, fault signature — compare against a known-healthy reading rather than a gut-feel threshold.' },
        ],
        demo: { title: 'Revisit a faulted scenario', text: 'Work through the Repair Workshop\'s MOSFET-failed-short scenario, classifying the fault before confirming root cause.', link: to.repair('MOSFET failed short', 'rsc-09') },
        activities: [to.repair('MOSFET failed open', 'rsc-08'), to.repair('MOSFET failed short', 'rsc-09')],
        check: [
          { id: 'k1', type: 'mcq', prompt: 'A device that conducts in both directions with near-zero drop, where it should block one way, has failed...', options: ['short', 'open', 'with elevated leakage only', 'within normal tolerance'], answer: 0, explain: 'No blocking behaviour in either direction is the short signature.' },
          { id: 'k2', type: 'mcq', prompt: 'Why investigate root cause before simply replacing a shorted switch?', options: ['An unaddressed external cause (e.g. a gate-driver fault) can destroy the replacement too', 'It is required by the meter', 'Root cause never matters once the part is replaced', 'Replacement parts are always defective'], answer: 0, explain: 'Replacing without fixing the underlying cause risks an immediate repeat failure.' },
          { id: 'k3', type: 'mcq', prompt: 'Reverse leakage current in a semiconductor junction typically...', options: ['rises roughly exponentially with junction temperature', 'is unaffected by temperature', 'falls as temperature rises', 'only matters for resistors'], answer: 0, explain: 'A common rule of thumb is roughly doubling every 8–10 °C.' },
        ],
        summary: [
          'Every semiconductor fault classifies as short, open, or excessive leakage, each with a distinct reading signature.',
          'Classifying HOW a device failed is necessary but not sufficient — WHY it failed (root cause) must also be investigated.',
          'A near-immediate repeat failure of a replacement part strongly suggests an unaddressed external root cause, not coincidence.',
          'Leakage current rises sharply with temperature, so a borderline leakage fault can worsen dramatically once the device is hot.',
        ],
        homework: {
          id: 'F4.M2.L9.hw',
          title: 'Fault classification practice',
          brief: 'Classify faults from readings and reason about root cause.',
          tasks: [{ id: 'h1', type: 'mcq', prompt: 'A diode reads OL in both forward and reverse diode-test directions. This is classified as a...', options: ['open fault', 'short fault', 'healthy device', 'leakage fault'], answer: 0, explain: 'No conduction at all in either direction, where forward conduction is expected, is the open-fault signature.' }],
          written: [{ prompt: 'A technician replaces a MOSFET that read as short, confirms the new part passes all three out-of-circuit checks, refits it, and the circuit works correctly for several weeks before the same fault recurs. Explain why this delayed recurrence is still consistent with an unaddressed root cause, rather than ruling one out.', model: 'A root cause does not have to produce an immediate failure every time — a marginal gate-driver timing issue, a borderline-undersized protective device, or an intermittent overcurrent condition elsewhere in the circuit can stress a replacement part gradually over weeks before it finally fails, rather than destroying it instantly. The delay does not rule out an unaddressed root cause; it is consistent with one that stresses the device more slowly than the original failure did. The same root-cause investigation (gate driver, protection sizing, other components feeding excessive current or voltage to this device) is still warranted, not ruled out by the gap in time.' }],
        },
      },
    },
    {
      id: 'F4.M2.L10',
      title: 'Component replacement and compatibility',
      minutes: 25,
      content: {
        objectives: [
          'List the ratings that must be checked (not just matched on one headline figure) before fitting a replacement semiconductor.',
          'Explain the risk of a "close enough" substitute part.',
          'Explain why a replacement MOSFET or IGBT should be checked before (not only after) fitting.',
        ],
        introduction: `This lesson closes the module by turning F4.M2's component knowledge into a disciplined REPLACEMENT checklist — the single most consequential practical skill this module builds toward, since a careless replacement can turn a successful diagnosis into a second failure.`,
        lecture: `### Matching more than one rating

A direct like-for-like replacement (the same manufacturer part number) is always the safest choice when available. Where it is not, every relevant rating from this module must be independently checked against the original: voltage rating (V_DS/V_CE(max), with margin), current rating (continuous and, where relevant, pulsed), R_DS(on) or V_CE(sat) (affects loss and thermal margin, not just "does it fit"), gate characteristics (V_th, gate charge — a mismatched gate driver/switch pairing can leave the new device under-driven or over-stressed), package and pinout, and — for diodes — V_rrm and reverse recovery time. Matching only the headline voltage or current rating while ignoring the rest is "close enough" thinking that frequently causes a second failure.

### Why "close enough" substitutes are a real risk

A substitute with a higher R_DS(on) than the original, fitted because its voltage and current ratings matched, will run hotter at the same load — potentially fine under light load, but capable of overheating and failing under the conditions that matter most (peak load, hot ambient), exactly the conditions the original part was sized for. Similarly, a substitute with different gate characteristics (a higher gate threshold, say) can leave the device under-driven by an existing gate driver sized for the original part's gate charge, causing excessive switching loss or incomplete turn-on that the original circuit's protection may not have been designed to catch.

### Checking a replacement before fitting, not only after

Applying the out-of-circuit checks from F4.M2.L8 to a NEW replacement part before fitting it — not only to the suspect failed part — catches a defective-from-new replacement before it is soldered in, and confirms the part pulled from stock is genuinely the type expected (mislabelled or miscounted stock is a real, if avoidable, source of repeat failures).`,
        technical: `**Second-source parts.** Many popular power devices are manufactured by more than one company under compatible (but rarely byte-for-byte identical) specifications — a second-source part can be a perfectly valid substitute, but its datasheet must still be checked individually rather than assumed identical to the original manufacturer's part.

**Upgrading, not just matching.** Occasionally a design deliberately fits a BETTER-rated replacement (lower R_DS(on), higher voltage margin) than the original, as a considered improvement — this is a valid engineering decision, but it should be a deliberate choice with its consequences considered (cost, gate-drive compatibility), not an accident of "whatever was in stock that seemed close".`,
        diagrams: [{ id: 'design-chain', caption: 'The chain of ratings — voltage, current, on-state loss, gate characteristics, package — that must each be checked before a replacement semiconductor is accepted as compatible.' }],
        formulas: [{ name: 'Minimum safe voltage margin (rule of thumb)', expr: 'V_rating ≥ 1.5 × V_peak(expected)', where: [['V_rating', 'device\'s rated blocking voltage', 'V'], ['V_peak', 'the highest voltage the device will actually see, including transients', 'V']], note: 'A commonly used rule of thumb for comfortable margin; actual required margin depends on the specific application and any additional transient suppression.' }],
        examples: [
          {
            title: 'Checking voltage margin for a replacement',
            problem: 'A MOSFET\'s drain will see a peak of 60 V including switching transients. Is a 75 V-rated replacement an adequate margin, by the 1.5× rule of thumb?',
            steps: ['Required: 1.5 × 60 = 90 V', '75 V < 90 V'],
            answer: 'No — 75 V falls short of the 90 V suggested by the 1.5× margin rule; a 100 V-rated (or higher) device would be the safer, standard choice here.',
          },
          {
            title: 'Why a lower R_DS(on) substitute is not automatically "better"',
            problem: 'A substitute MOSFET has a much lower R_DS(on) than the original but a smaller gate charge capability relative to its size, meaning it needs faster, more demanding gate drive to switch cleanly at the same frequency. Explain the risk.',
            steps: ['Lower R_DS(on) genuinely reduces conduction loss, which looks like a pure improvement', 'But if the existing gate driver cannot drive the new device\'s gate characteristics as cleanly as it drove the original, switching loss or switching behaviour (ringing, incomplete turn-on) could worsen instead'],
            answer: 'A single improved rating does not guarantee overall improvement — gate-drive compatibility must be checked alongside R_DS(on), or the substitution can trade a conduction-loss improvement for a switching-loss or reliability regression.',
          },
        ],
        applications: `This replacement discipline is exactly what the Repair Workshop's "repair" rubric category rewards: not just naming the right part family, but selecting and fitting a genuinely compatible replacement.`,
        mistakes: [
          { mistake: 'Matching only voltage and current rating, and assuming that is sufficient.', correction: 'On-state loss rating (R_DS(on)/V_CE(sat)) and gate characteristics must also be checked — a "fits the slot" substitute can still cause a second failure.' },
          { mistake: 'Assuming a lower R_DS(on) or higher-rated substitute is automatically a safe upgrade.', correction: 'Check gate-drive compatibility and package/pinout too; an improvement in one rating does not guarantee overall compatibility.' },
          { mistake: 'Fitting a replacement part straight from stock without testing it first.', correction: 'Apply the same out-of-circuit checks (F4.M2.L8) to the NEW part before fitting it, to catch a defective-from-new or mislabelled replacement.' },
        ],
        demo: { title: 'Compare MOSFET vs IGBT selection', text: 'Use the comparison guide to see how rating trade-offs are laid out side by side when selecting a device.', link: to.cmp('MOSFET vs IGBT comparison', 'mosfet-vs-igbt') },
        activities: [to.cmp('MOSFET vs IGBT', 'mosfet-vs-igbt'), to.repair('MOSFET failed open', 'rsc-08')],
        check: [
          { id: 'k1', type: 'mcq', prompt: 'Before fitting a non-identical replacement semiconductor, which of these must be checked?', options: ['Voltage rating, current rating, on-state loss rating and gate characteristics, together', 'Voltage rating only', 'Package size only', 'Nothing — any part that fits physically is acceptable'], answer: 0, explain: 'Every relevant rating must be checked independently.' },
          { id: 'k2', type: 'numeric', prompt: 'Minimum suggested voltage rating (V) by the 1.5× rule for a 40 V expected peak?', answer: 60, tol: 0.01, unit: 'V', explain: '1.5×40=60 V.' },
          { id: 'k3', type: 'mcq', prompt: 'A replacement with a lower R_DS(on) but different gate characteristics than the original...', options: ['is not automatically an improvement — gate-drive compatibility must also be checked', 'is always a safe and complete upgrade', 'cannot be used under any circumstance', 'has no effect on switching behaviour'], answer: 0, explain: 'One improved rating does not guarantee overall compatibility.' },
        ],
        summary: [
          'A direct like-for-like replacement is the safest choice; otherwise every relevant rating (voltage, current, on-state loss, gate characteristics, package) must be checked independently.',
          'A "close enough" substitute matched on only one headline rating is a frequent, avoidable cause of repeat failures.',
          'A single improved rating on a substitute does not guarantee overall compatibility — other characteristics (especially gate drive) can regress.',
          'Testing a new replacement part before fitting catches a defective-from-new or mislabelled part before it causes a second failure.',
        ],
        homework: {
          id: 'F4.M2.L10.hw',
          title: 'Replacement compatibility practice',
          brief: 'Check replacement ratings against the original.',
          tasks: [{ id: 'h1', type: 'numeric', prompt: 'Minimum suggested voltage rating (V) by the 1.5× rule for a 100 V expected peak?', answer: 150, tol: 0.01, unit: 'V', explain: '1.5×100=150 V.' }],
          written: [{ prompt: 'A spares drawer holds a MOSFET with the correct voltage and current rating for a repair, but its R_DS(on) is roughly three times higher than the original part\'s. Explain whether this is a safe substitute, and what would need to be re-checked before using it.', model: 'Matching voltage and current rating is necessary but not sufficient. A threefold higher R_DS(on) means roughly three times the conduction loss (P=I²R_DS(on)) at the same current — this substitute will run noticeably hotter than the original at the same load, and the existing heat sink/airflow (sized for the original device\'s lower loss) may not keep it within its safe operating temperature, especially at peak load. Before using it, the resulting conduction loss at the circuit\'s actual worst-case current, and whether the existing thermal design can still handle it, must both be checked — the "correct voltage and current rating" alone does not confirm this is a safe substitute.' }],
        },
      },
    },
  ],
  quiz: {
    pass: 0.8,
    questions: [
      { id: 'q1', type: 'mcq', prompt: 'A PN junction conducts easily when forward biased because...', options: ['the depletion barrier shrinks, allowing carriers to cross', 'the silicon melts', 'current reverses direction spontaneously', 'doping is removed'], answer: 0, explain: 'Forward bias shrinks the built-in barrier.' },
      { id: 'q2', type: 'numeric', prompt: 'Approximate diode conduction loss (W) for V_f=0.65 V at 10 A average?', answer: 6.5, tol: 0.02, unit: 'W', explain: '0.65×10=6.5 W.' },
      { id: 'q3', type: 'mcq', prompt: 'How many diodes conduct at any instant in a bridge rectifier?', options: ['two', 'one', 'four', 'zero'], answer: 0, explain: 'One diagonal pair conducts.' },
      { id: 'q4', type: 'numeric', prompt: 'MOSFET conduction loss (W) for R_DS(on)=10 mΩ at 30 A RMS?', answer: 9, tol: 0.02, unit: 'W', explain: '30²×0.01=900×0.01=9 W.' },
      { id: 'q5', type: 'mcq', prompt: 'IGBT conduction loss is best modelled as...', options: ['P ≈ V_CE(sat) × I', 'P = I² × R', 'P = V²/R', 'IGBTs have zero conduction loss'], answer: 0, explain: 'A nearly constant saturation voltage, unlike a resistance.' },
      { id: 'q6', type: 'mcq', prompt: 'Dead time exists mainly to prevent...', options: ['shoot-through across a bridge leg', 'excessive gate charge', 'reverse battery polarity', 'capacitor ESR rise'], answer: 0, explain: 'Both leg switches on at once would short the DC bus.' },
      { id: 'q7', type: 'numeric', prompt: 'Switching loss (W) for (E_on+E_off)=25 µJ at 30 kHz?', answer: 0.75, tol: 0.02, unit: 'W', explain: '25e-6×30000=0.75 W.' },
      { id: 'q8', type: 'mcq', prompt: 'A device reading 0.00 V in both diode-test directions, where one should show a diode drop, has failed...', options: ['short', 'open', 'with normal leakage', 'within tolerance'], answer: 0, explain: 'No blocking behaviour in either direction.' },
      { id: 'q9', type: 'mcq', prompt: 'Before fitting a non-identical replacement MOSFET, which rating is it safe to skip checking?', options: ['None — voltage, current, on-state loss and gate characteristics should all be checked', 'Current rating', 'Voltage rating', 'Gate characteristics'], answer: 0, explain: 'Every relevant rating should be checked; none is safe to skip.' },
    ],
  },
  assignment: {
    id: 'F4.M2.assignment',
    title: 'Semiconductor device selection and fault reasoning',
    brief: 'Apply loss calculations and fault classification to short scenarios.',
    tasks: [
      { id: 'a1', type: 'numeric', prompt: 'Total device loss (W): conduction 8 W, switching 1.5 W?', answer: 9.5, tol: 0.01, unit: 'W', explain: '8+1.5=9.5 W.' },
      { id: 'a2', type: 'numeric', prompt: 'IGBT conduction loss (W) for V_CE(sat)=1.6 V at 22 A average?', answer: 35.2, tol: 0.02, unit: 'W', explain: '1.6×22=35.2 W.' },
      { id: 'a3', type: 'mcq', prompt: 'A diode reads OL in both directions. This is classified as...', options: ['open', 'short', 'healthy', 'elevated leakage'], answer: 0, explain: 'No conduction at all where forward conduction is expected.' },
    ],
    written: [{ prompt: 'A repair technician fits a replacement MOSFET matched exactly on voltage and current rating, but with a noticeably different gate threshold voltage (V_th) than the original, and the existing gate driver\'s output voltage was only just adequate for the original part. Explain the risk this specific mismatch creates, distinct from the voltage/current ratings being correct.', model: 'A higher V_th on the replacement, combined with a gate driver whose output was only marginally adequate for the original part\'s lower threshold, risks the new device not being driven fully on — leaving it operating in a partially-conducting state with a much higher effective on-resistance than its rated R_DS(on), or switching more slowly than intended. This would show up as excessive heating or poor switching behaviour even though voltage and current ratings matched exactly, because gate threshold and gate-drive adequacy are an independent compatibility check, not implied by matching the device\'s power ratings.' }],
  },
  practicals: [
    {
      id: 'F4.M2.P1',
      title: 'Semiconductor fault classification and loss calculations',
      description: 'Classify faults from readings and compute device losses. All answers must be correct.',
      task: {
        id: 'f4-semiconductor-faults',
        kind: 'calc',
        title: 'Classifying faults and computing losses',
        brief: 'A diode reads 0.60 V forward / OL reverse (healthy reference). A suspect MOSFET reads 0.00 V in both diode-test directions across drain-source. A second MOSFET has R_DS(on)=18 mΩ and carries 24 A RMS, plus switching energy (E_on+E_off)=35 µJ at 15 kHz.',
        questions: [
          { id: 'c1', type: 'mcq', prompt: 'How is the suspect MOSFET\'s fault classified?', options: ['Short', 'Open', 'Elevated leakage', 'Healthy'], answer: 0, explain: '0.00 V both ways where a diode drop is expected is a short.' },
          { id: 'c2', type: 'numeric', prompt: 'Conduction loss (W) of the second MOSFET?', answer: 10.368, tol: 0.02, unit: 'W', explain: '24²×0.018=576×0.018=10.368 W.' },
          { id: 'c3', type: 'numeric', prompt: 'Switching loss (W) of the second MOSFET?', answer: 0.525, tol: 0.02, unit: 'W', explain: '35e-6×15000=0.525 W.' },
          { id: 'c4', type: 'numeric', prompt: 'Total device loss (W)?', answer: 10.893, tol: 0.02, unit: 'W', explain: '10.368+0.525=10.893 W.' },
        ],
        explain: 'A full semiconductor fault assessment classifies the fault pattern correctly AND computes real operating losses — neither alone is a complete answer.',
      },
      evidence: { kind: 'task', id: 'f4-semiconductor-faults' },
    },
    {
      id: 'F4.M2.P2',
      title: 'Diagnose a MOSFET fault in the Repair Workshop',
      description: 'Confirm, on a real circuit-grounded fault, that you can apply the body-diode and gate-charge reasoning from this module.',
      link: to.repair('MOSFET failed short', 'rsc-09'),
      evidence: { kind: 'troubleshoot', project: 'rsc-09' },
    },
  ],
}
