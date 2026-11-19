import type { AcademyModule } from '../types'
import { to } from '../s1/links'

/** F4.M1 Passive components. */
export const F4_M1: AcademyModule = {
  id: 'F4.M1',
  title: 'Passive components',
  summary: 'Resistors, capacitors and inductors: how each stores or dissipates energy, how to read their markings and ratings, and how to test each one out of circuit.',
  lessons: [
    {
      id: 'F4.M1.L1',
      title: 'Resistors: types, codes, power, tolerance',
      minutes: 30,
      content: {
        objectives: [
          'Read a four-band and five-band resistor colour code to find value and tolerance.',
          'Explain why a resistor\'s power rating, not just its resistance value, must be checked for a given circuit.',
          'Compare the common resistor construction types (carbon film, metal film, wirewound) and where each is used in an inverter.',
          'State the practical consequence of exceeding a resistor\'s power rating.',
        ],
        introduction: `You met Ohm's law and resistance as ideas in F1. This lesson treats the [[resistance|resistor]] as a physical PART you will hold, read, select and test: how its value and [[tolerance|tolerance]] are marked, why its [[power-rating|power rating]] matters just as much as its ohm value, and which construction type belongs where in an inverter — from the gate-resistor on a MOSFET to the high-power bleeder across a DC bus.`,
        lecture: `### Reading the colour code

A resistor's value is almost always printed as coloured bands, not as text (it is too small to print legibly on a tiny part). The standard four-band code is: **band 1** (first digit), **band 2** (second digit), **band 3** (multiplier, ×10^n), **band 4** (tolerance). Each colour stands for a digit: black=0, brown=1, red=2, orange=3, yellow=4, green=5, blue=6, violet=7, grey=8, white=9. A five-band resistor (tighter, more precise tolerances) adds a third digit before the multiplier band. The tolerance band is usually gold (±5 %), silver (±10 %), red (±2 %) or brown (±1 %).

### Why power rating matters as much as resistance

A resistor's job is to dissipate the power P = I²R (or V²/R) as heat. Two resistors can share the same marked value and tolerance yet have very different power ratings (commonly 1/8 W, 1/4 W, 1 W, 5 W, 10 W, up to tens of watts for a bleeder or current-sense resistor) simply because they are physically different sizes — more surface area and often a larger body sheds heat faster. Fitting a resistor whose power rating is too low for the actual current it will carry is one of the most common, entirely preventable component failures: it overheats, drifts in value, discolours, and eventually opens or chars the board around it.

### Construction types and where each belongs

- **Carbon film**: cheap, general-purpose, modest tolerance (commonly ±5 %) and modest noise performance — fine for bias and pull-up/pull-down resistors in control circuitry.
- **Metal film**: tighter tolerance (±1 % common), lower temperature coefficient, lower noise — used wherever the actual value matters precisely, such as in a voltage-sensing divider (F4.M5) where accuracy directly sets measurement accuracy.
- **Wirewound**: a resistance wire wound on a former, able to dissipate real power (watts to tens of watts) in a small body — used for bleeder resistors, current-shunt resistors and gate resistors that must survive repeated switching pulses, though its own small self-inductance can matter at high switching frequencies.

### Resistors as gate resistors

A small series resistor between a gate driver (F4.M2.L6) and a MOSFET or IGBT gate — the "gate resistor" — slows the gate's charge and discharge rate, trading switching speed (and switching loss) against ringing and electromagnetic noise. Its own power rating is normally small, since gate charge/discharge energy is tiny, but its resistance VALUE is a real design choice, not an arbitrary round number.`,
        technical: `**Temperature coefficient of resistance (TCR).** Every resistor's value drifts slightly with temperature, quoted in ppm/°C. Metal film types have a far lower TCR than carbon film, which is why precision sensing circuits specify metal film even though both might show the same room-temperature tolerance band.

**Surface-mount (SMD) resistors** use a numeric code instead of colour bands (e.g. "103" = 10 × 10³ = 10,000 Ω = 10 kΩ; "4R7" = 4.7 Ω), printed directly on the tiny ceramic body where space allows, or left completely unmarked below a certain size — identification then relies on circuit position and an in-circuit or desoldered measurement.`,
        diagrams: [{ id: 'series-parallel', caption: 'Resistors in series and parallel, and how their combined value and power handling differ from a single equivalent resistor.' }],
        formulas: [
          { name: 'Four-band value', expr: 'R = (10·d1 + d2) × 10^mult  Ω', where: [['d1', 'first digit', ''], ['d2', 'second digit', ''], ['mult', 'multiplier band exponent', '']] },
          { name: 'Power dissipated', expr: 'P = I²R = V²/R', where: [['P', 'power dissipated as heat', 'W']], note: 'Must stay below the resistor\'s rated power, with margin (derating, F3.M5/F4.M5.L3 thermal context).' },
        ],
        examples: [
          {
            title: 'Decoding a four-band resistor',
            problem: 'A resistor shows yellow, violet, orange, gold. Find its value and tolerance.',
            steps: ['Yellow = 4, violet = 7 → "47"', 'Orange multiplier = ×10³', 'R = 47 × 1000 = 47,000 Ω', 'Gold tolerance band = ±5 %'],
            answer: '47 kΩ ± 5 % (44.65 kΩ to 49.35 kΩ).',
          },
          {
            title: 'Checking a power rating is adequate',
            problem: 'A 100 Ω bleeder resistor is placed across a 400 V DC bus. Is a standard 2 W resistor adequate?',
            steps: ['P = V²/R = 400²/100 = 160,000/100', '= 1600 W'],
            answer: 'No — 1600 W vastly exceeds a 2 W rating; the resistor would fail almost instantly. A bleeder at this voltage and resistance needs either a far higher resistance value (to limit power) or multiple high-power resistors in series/parallel, sized and derated correctly.',
            check: 'A 2 W part surviving 1600 W is off by nearly three orders of magnitude — a sanity check alone flags the mismatch before any detailed design.',
          },
        ],
        applications: `Every reference you will use in the Component Library and in the Repair Workshop's resistor-related checkpoints assumes you can read a value off the part itself, not just look it up — exactly this skill.`,
        mistakes: [
          { mistake: 'Treating tolerance as "basically irrelevant" for a general-purpose resistor.', correction: 'Tolerance sets the real worst-case range of behaviour; in a sensing divider or timing circuit it directly limits the achievable accuracy.' },
          { mistake: 'Assuming any resistor of the right ohm value will do, regardless of power rating.', correction: 'Power rating must be checked separately against the actual current/voltage in the circuit, with margin.' },
          { mistake: 'Reading colour bands in the wrong direction.', correction: 'The tolerance band (gold/silver/red/brown) is always read last; start from the opposite end, nearer a lead, with the tolerance band itself usually spaced slightly apart from the value bands.' },
          { mistake: 'Assuming a resistor that measures "roughly right" on a meter is definitely healthy.', correction: 'A resistor can drift within tolerance from age/heat and still mislead a quick check; compare against both the colour-code value and the circuit\'s expected behaviour (F4.M1.L4).' },
        ],
        demo: { title: 'Read resistors in the library', text: 'Open the resistor entry in the Component Library and compare marked values against the colour-code method above.', link: to.lib('Resistor', 'resistor') },
        activities: [to.lib('Resistor', 'resistor'), to.ckt('Battery and resistor circuit', 'ckt-01')],
        check: [
          { id: 'k1', type: 'numeric', prompt: 'Value (Ω) of a resistor coded brown, black, red?', answer: 1000, tol: 0.01, unit: 'Ω', explain: '10 × 10² = 1000 Ω.' },
          { id: 'k2', type: 'mcq', prompt: 'A gold fourth band means tolerance of...', options: ['±5 %', '±1 %', '±10 %', '±20 %'], answer: 0, explain: 'Gold = ±5 %.' },
          { id: 'k3', type: 'mcq', prompt: 'Why might two resistors of the same value and tolerance have very different physical sizes?', options: ['Different power ratings', 'Different colours', 'Different manufacturers always differ', 'There is no reason, they must be identical'], answer: 0, explain: 'A higher power rating usually needs a larger body to dissipate heat.' },
          { id: 'k4', type: 'mcq', prompt: 'Metal film resistors are preferred over carbon film where...', options: ['precise, stable value matters (e.g. a sensing divider)', 'maximum power dissipation is needed', 'cost must be minimised above all else', 'the resistor carries no current'], answer: 0, explain: 'Metal film gives tighter tolerance and lower temperature drift.' },
        ],
        summary: [
          'A resistor\'s value and tolerance are read from colour bands (or a numeric code on SMD parts), not printed in full.',
          'Power rating is a separate check from resistance value — both must suit the actual circuit.',
          'Carbon film, metal film and wirewound constructions trade cost, precision and power handling differently.',
          'Exceeding a resistor\'s power rating causes overheating, value drift and eventual failure — a common, preventable fault.',
        ],
        homework: {
          id: 'F4.M1.L1.hw',
          title: 'Resistor code and power practice',
          brief: 'Decode values and check power ratings.',
          tasks: [
            { id: 'h1', type: 'numeric', prompt: 'Value (Ω) of red, red, brown?', answer: 220, tol: 0.01, unit: 'Ω', explain: '22 × 10¹ = 220 Ω.' },
            { id: 'h2', type: 'numeric', prompt: 'Power dissipated by a 10 Ω resistor carrying 2 A (W)?', answer: 40, tol: 0.01, unit: 'W', explain: 'P = I²R = 4×10 = 40 W.' },
          ],
          written: [{ prompt: 'A technician replaces a failed 10 Ω, 1 W current-sense resistor with another 10 Ω resistor pulled from a drawer of mixed parts, without checking its power rating. Explain the risk in this practice and how to avoid repeating the same failure.', model: 'The replacement resistor may have the correct resistance value but an inadequate power rating for the actual current in that circuit, in which case it will overheat and fail again (possibly damaging nearby parts or causing a fire risk) even though "the right value" was fitted. The correct practice is to check BOTH the resistance value and the power rating (with margin/derating) against the circuit\'s actual current and voltage, not just match the ohm value, and ideally to investigate why the original resistor failed before assuming a like-for-like replacement is sufficient.' }],
        },
      },
    },
    {
      id: 'F4.M1.L2',
      title: 'Capacitors: electrolytic, film and ceramic; ESR; polarity',
      minutes: 30,
      content: {
        objectives: [
          'Compare electrolytic, film and ceramic capacitors by construction, capacitance range, ESR and polarity.',
          'Explain why reversing polarity on an electrolytic capacitor is dangerous, not just "wrong".',
          'Define ESR and explain why it is the key aging indicator for electrolytic capacitors.',
          'Identify which capacitor type belongs on the DC bus versus the AC/switching side of an inverter.',
        ],
        introduction: `Capacitors appear everywhere in an inverter: smoothing the DC bus, filtering the switched output, decoupling control electronics. This lesson compares the three families you will meet in the Component Library and the Repair Workshop — [[electrolytic-capacitor|electrolytic]], [[film-capacitor|film]] and [[ceramic-capacitor|ceramic]] — and introduces [[esr|ESR]], the single most useful aging indicator for the type that fails most often: the electrolytic bus capacitor.`,
        lecture: `### The three families

- **Electrolytic**: achieves high capacitance (µF to many mF) in a compact can using a liquid or gel electrolyte. **Polarised** — the can is marked with a stripe showing the negative lead, and reversing it is not merely "wrong wiring", it can cause the electrolyte to break down, generate gas, and vent or rupture the can. Used for DC bus smoothing ([[bus-capacitor|bus capacitors]]) where bulk capacitance matters more than precision.
- **Film**: a thin plastic dielectric, not polarised, low ESR, stable value, long-lived — but larger per microfarad than an electrolytic. Used on the AC/switching side and in snubber and filter applications where low loss and long life matter more than raw capacitance per volume.
- **Ceramic**: a ceramic dielectric, not polarised, very low ESR, compact at small-to-moderate values — used for high-frequency decoupling on control boards, though some ceramic types lose a meaningful fraction of their capacitance as applied DC voltage rises (a datasheet characteristic, not a fault).

### ESR: the aging electrolytic's tell

An ideal capacitor has zero resistance in series with its capacitance. A real one has a small [[esr|equivalent series resistance (ESR)]], mostly from the electrolyte and internal construction. As an electrolytic capacitor ages — especially under heat and ripple current — its electrolyte slowly dries out, and its ESR rises steadily, long before its capacitance value itself falls far out of tolerance. Rising ESR means the capacitor heats itself more under the same ripple current (P = I²·ESR), which accelerates further drying in a feedback loop, and it becomes progressively less effective at absorbing the fast switching currents the DC bus needs — the classic, slow "aged electrolytic capacitor" fault you will meet directly in the Repair Workshop.

### Why polarity matters this much

Forward (correct) polarity on an electrolytic maintains a thin internal oxide layer that IS the dielectric. Reverse polarity (even briefly, at voltage) breaks this layer down electrochemically, generating heat and gas inside a sealed can — the mechanism behind the characteristic bulging top or vented case of a reverse-biased or over-voltage electrolytic failure, and the reason this fault carries its own safety handling (discharge and isolate before any suspect electrolytic is touched or removed).`,
        technical: `**Ripple current rating.** An electrolytic capacitor's datasheet specifies a maximum RMS ripple current it can carry continuously at a stated temperature and frequency — exceeding it heats the part internally via I²·ESR even if the applied DC voltage is well within its voltage rating. Bus capacitors are often chosen (or paralleled) as much for ripple-current capability as for bulk capacitance.

**Capacitors in series and parallel.** Paralleled capacitors add capacitance directly (C_total = C1 + C2 + …) and divide the total ripple current between them, which is why multiple smaller bus capacitors in parallel are common instead of one large one. Series capacitors add in reciprocal (like resistors in parallel) and divide the total voltage between them — occasionally used to reach a voltage rating beyond any single part, with balancing resistors to equalise the voltage split.`,
        diagrams: [{ id: 'rc-curve', caption: 'A capacitor charging and discharging through a resistance, and where ESR sits in the equivalent circuit of a real (non-ideal) capacitor.' }],
        formulas: [
          { name: 'ESR heating', expr: 'P_ESR = I_rms² · ESR', where: [['P_ESR', 'heat generated inside the capacitor by its own ESR', 'W'], ['I_rms', 'RMS ripple current through it', 'A']], note: 'Rising ESR with age directly increases self-heating at the same ripple current — a feedback loop that accelerates further aging.' },
          { name: 'Parallel capacitance', expr: 'C_total = C1 + C2 + …', where: [] },
        ],
        examples: [
          {
            title: 'ESR self-heating as a capacitor ages',
            problem: 'A bus capacitor carries 3 A RMS ripple. Compare its self-heating when new (ESR = 0.05 Ω) against aged (ESR = 0.4 Ω).',
            steps: ['New: P = 3² × 0.05 = 9 × 0.05 = 0.45 W', 'Aged: P = 9 × 0.4 = 3.6 W'],
            answer: 'Self-heating rises from 0.45 W to 3.6 W — eightfold — at the exact same ripple current, purely from ESR aging.',
            check: 'Power scales linearly with ESR for a fixed current, so an 8× ESR rise gives an 8× power rise; consistent with 0.4/0.05 = 8.',
          },
          {
            title: 'Choosing a capacitor family for a DC bus',
            problem: 'A 400 V DC bus needs 1000 µF of bulk smoothing capacitance. Which family is appropriate, and why not ceramic?',
            steps: ['Required capacitance (1000 µF) is far beyond what a ceramic capacitor can practically provide at this voltage in a sensible size', 'Film capacitors can reach this range but are physically large and costly at high µF values', 'Electrolytic capacitors are the practical, compact, cost-effective choice for bulk bus smoothing at this scale'],
            answer: 'Electrolytic — it is the only family that reaches the needed bulk capacitance in a practical size and cost at this voltage, accepting the trade-off of polarity sensitivity and ESR aging as a known, managed limitation.',
          },
        ],
        applications: `The Repair Workshop's "dried-out smoothing capacitor" scenario is built entirely around this lesson's ESR concept: the live reading you will take there is exactly an ESR-style comparison between a healthy and an aged bus capacitor.`,
        mistakes: [
          { mistake: 'Assuming a capacitor that still reads close to its rated capacitance on a basic meter is definitely healthy.', correction: 'Capacitance can stay close to nominal while ESR has risen significantly; ESR, not just capacitance, is the key aging indicator for electrolytics (F4.M1.L4).' },
          { mistake: 'Treating "polarised" as just a wiring convention to get right, with no real consequence if reversed.', correction: 'Reverse polarity on an electrolytic can cause electrochemical breakdown, gas generation and venting — a genuine safety hazard, not only a non-functioning circuit.' },
          { mistake: 'Using a ceramic capacitor wherever a film capacitor is specified, assuming "capacitor is a capacitor".', correction: 'The three families differ in polarity sensitivity, ESR, voltage-dependent capacitance and practical size per microfarad — the specified family is rarely interchangeable without re-checking the application.' },
        ],
        demo: { title: 'Compare capacitor types in the library', text: 'Open the capacitor entry and compare the electrolytic, film and ceramic families against this lesson\'s descriptions.', link: to.lib('Capacitor', 'capacitor') },
        activities: [to.lib('Capacitor', 'capacitor'), to.ckt('Capacitor charging and discharging', 'ckt-03'), to.repair('Aged/sulfated battery (ESR-style aging)', 'rsc-05')],
        check: [
          { id: 'k1', type: 'mcq', prompt: 'Which capacitor family is polarised and must never have reversed voltage applied?', options: ['Electrolytic', 'Film', 'Ceramic', 'All of them equally'], answer: 0, explain: 'Electrolytic capacitors are polarised; film and ceramic normally are not.' },
          { id: 'k2', type: 'mcq', prompt: 'ESR is best described as...', options: ['the small series resistance inside a real capacitor', 'the capacitor\'s voltage rating', 'a type of capacitor', 'the ripple frequency'], answer: 0, explain: 'Equivalent series resistance: a real-world non-ideality of a real capacitor.' },
          { id: 'k3', type: 'numeric', prompt: 'ESR self-heating (W) for 2 A RMS ripple through 0.2 Ω ESR?', answer: 0.8, tol: 0.01, unit: 'W', explain: 'P = I²·ESR = 4 × 0.2 = 0.8 W.' },
          { id: 'k4', type: 'mcq', prompt: 'As an electrolytic capacitor ages under heat and ripple, its ESR typically...', options: ['rises steadily, well before capacitance falls far out of tolerance', 'falls steadily', 'stays exactly constant until sudden failure', 'has no relationship to capacitance'], answer: 0, explain: 'Drying electrolyte raises ESR progressively — the classic aging signature.' },
        ],
        summary: [
          'Electrolytic capacitors give high capacitance in a small size but are polarised and age via rising ESR.',
          'Film capacitors are unpolarised, low-ESR and long-lived, but larger per microfarad.',
          'Ceramic capacitors are unpolarised and very low-ESR, used for high-frequency decoupling at smaller values.',
          'Rising ESR, not falling capacitance, is the primary real-world aging signature of a failing electrolytic.',
        ],
        homework: {
          id: 'F4.M1.L2.hw',
          title: 'Capacitor family and ESR practice',
          brief: 'Apply ESR heating and choose the right family.',
          tasks: [{ id: 'h1', type: 'numeric', prompt: 'ESR self-heating (W) for 1.5 A RMS through 0.3 Ω ESR?', answer: 0.675, tol: 0.02, unit: 'W', explain: 'P = 1.5² × 0.3 = 2.25 × 0.3 = 0.675 W.' }],
          written: [{ prompt: 'A colleague suggests fitting a ceramic capacitor in place of a failed 2200 µF electrolytic bus capacitor because "ceramic capacitors are more reliable and don\'t age". Explain why this substitution is not practical, referring to what each family can actually provide.', model: 'Reliability is not the limiting factor here — capacity is. A ceramic capacitor cannot practically provide 2200 µF of capacitance at bus voltage in any reasonable physical size; the families differ fundamentally in how much capacitance per unit volume they can deliver at a given voltage. The correct fix is a like-for-like (or better-rated) electrolytic replacement, chosen for adequate ripple-current rating and voltage rating, not a substitution to a different capacitor family that cannot meet the bulk-capacitance requirement at all.' }],
        },
      },
    },
    {
      id: 'F4.M1.L3',
      title: 'Inductors: cores, saturation, current rating',
      minutes: 30,
      content: {
        objectives: [
          'Explain how an inductor stores energy in a magnetic field and resists a change in current.',
          'Define saturation and explain its consequence for an inductor\'s effective inductance and the current it then draws.',
          'Compare common core materials (iron powder, ferrite) and the trade-offs each makes.',
          'State why an inductor\'s current rating, not only its inductance value, limits where it can be used.',
        ],
        introduction: `An inductor is the "other" energy-storage component, alongside the capacitor, and the two are deliberately paired in the output [[lc-filter|LC filter]] that turns a switched waveform into something close to a clean sine (F3.M5, P3). This lesson covers the physical inductor itself: its core, its [[saturation|saturation]] limit, and why its current rating is just as critical as its inductance value.`,
        lecture: `### Storing energy in a magnetic field

A [[current|current]] flowing through a coiled [[winding|winding]] creates a magnetic field in and around the coil; energy is stored in that field (E = ½LI²). An inductor resists a CHANGE in current (the dual of a capacitor, which resists a change in voltage) — exactly the property an output choke uses to smooth the current drawn from a switching bridge into something closer to a steady DC or slowly-varying AC value.

### Core materials and saturation

Most practical inductors wind the coil around a magnetic core (iron powder, laminated steel, or [[ferrite|ferrite]]) to concentrate the [[magnetic-flux|magnetic flux]] and achieve far more inductance for the same number of turns than an air-core coil would. But every core material has a limit: above some flux density, the core material [[saturation|saturates]] — it can carry no more flux no matter how much more current flows, so the inductor's EFFECTIVE inductance collapses sharply, and current then rises steeply and uncontrollably for the same applied voltage, since the circuit has effectively lost its current-limiting inductance. A saturating output inductor under overload is a genuine fault mode, not just a design corner case: it is one reason output inductors carry an explicit current rating.

- **Iron powder cores**: moderate permeability, graceful ("soft") saturation behaviour, used widely for output chokes where some tolerance of overcurrent without catastrophic behaviour is valued.
- **Ferrite cores**: higher permeability for a given size (so a smaller part for the same inductance) but sharper saturation onset, and low loss at the high switching frequencies used in SPWM — the usual choice for the higher-frequency inductors inside a sine-wave inverter's filter stage.

### Current rating versus inductance value

An inductor's datasheet value (say, 1.2 mH) describes its behaviour only up to its rated current — beyond that, saturation changes the picture entirely. Selecting (or replacing) an inductor purely by matching the inductance value, while ignoring its current rating, is the same class of mistake as matching a resistor's ohm value while ignoring its power rating (F4.M1.L1): both ratings must independently suit the actual circuit.`,
        technical: `**DC resistance (DCR).** Every real winding has some resistance, causing I²·R copper loss and a small, usually unavoidable voltage drop under load — this is the same winding-resistance reading used in the inductor's own test procedure (F4.M1.L4) to detect an open or partially broken winding.

**Saturation current rating (I_sat) versus RMS current rating.** Datasheets often distinguish between the current at which the core begins to saturate (I_sat, sometimes defined as a stated percentage inductance drop) and the current the winding can carry continuously without overheating (I_rms, a copper-loss/thermal limit) — the lower of the two is the part's true practical limit in a given application.`,
        diagrams: [{ id: 'rl-curve', caption: 'Current rising in an inductor over time, and how the curve steepens sharply once the core saturates and the effective inductance collapses.' }],
        formulas: [
          { name: 'Stored energy', expr: 'E = ½ L I²', where: [['E', 'energy stored in the magnetic field', 'J'], ['L', 'inductance', 'H'], ['I', 'current', 'A']] },
          { name: 'Copper loss', expr: 'P_cu = I_rms² · R_dc', where: [['R_dc', 'winding DC resistance', 'Ω']] },
        ],
        examples: [
          {
            title: 'Stored energy in an output choke',
            problem: 'An output inductor of 1.5 mH carries 8 A. Energy stored?',
            steps: ['E = ½ L I²', '= ½ × 0.0015 × 64'],
            answer: '≈ 0.048 J (48 mJ).',
          },
          {
            title: 'Why saturation causes a steep current rise',
            problem: 'Explain, in terms of effective inductance, why current rises much faster once a choke\'s core saturates under a fault that pushes current above its rating.',
            steps: ['Below saturation, the core multiplies the coil\'s inductance substantially (high permeability)', 'Once saturated, the core can carry no additional flux, so the effective inductance collapses toward the much lower air-core value', 'With applied voltage roughly unchanged but inductance now far lower, di/dt = V/L rises sharply, so current rises far faster than before saturation'],
            answer: 'The core\'s loss of permeability at saturation removes most of the inductor\'s current-limiting ability, so current rises steeply — exactly the uncontrolled-current signature of a saturating choke under overload.',
          },
        ],
        applications: `The Repair Workshop's open-winding output-inductor scenario and this lesson's winding-resistance reading are the same measurement: a healthy low DC resistance versus an open (infinite) reading at the broken joint.`,
        mistakes: [
          { mistake: 'Choosing a replacement inductor by inductance value alone.', correction: 'Current rating (both I_sat and I_rms) must also suit the actual application; the lower of the two limits is what matters.' },
          { mistake: '"An inductor with a higher current rating is always a safe drop-in replacement."', correction: 'A higher-current, lower-inductance-tolerance part can still behave differently in the filter it sits in (corner frequency, F3.M5) — match inductance as well as rating, not rating alone.' },
          { mistake: 'Assuming saturation means the inductor is "broken".', correction: 'Saturation is a normal physical limit of any core material reached under excessive current; the component itself may be completely healthy, and the real question is why the current reached that level.' },
        ],
        demo: { title: 'See the inductor entry', text: 'Compare core materials and current ratings in the Component Library.', link: to.lib('Inductor', 'inductor') },
        activities: [to.lib('Inductor', 'inductor'), to.repair('Output inductor winding open', 'rsc-11')],
        check: [
          { id: 'k1', type: 'numeric', prompt: 'Energy (J) stored in a 2 mH inductor carrying 5 A?', answer: 0.025, tol: 0.02, unit: 'J', explain: '½ × 0.002 × 25 = 0.025 J.' },
          { id: 'k2', type: 'mcq', prompt: 'Saturation means...', options: ['the core can carry no more magnetic flux, so effective inductance collapses', 'the winding has melted', 'the inductor has the wrong polarity', 'the inductor is overrated'], answer: 0, explain: 'A core physical limit, not necessarily a fault.' },
          { id: 'k3', type: 'mcq', prompt: 'Ferrite cores, compared with iron powder, typically offer...', options: ['higher permeability for a given size, with sharper saturation onset', 'lower permeability always', 'no saturation limit at all', 'only use at DC, never at switching frequency'], answer: 0, explain: 'Ferrite suits smaller, higher-frequency designs; iron powder saturates more gracefully.' },
          { id: 'k4', type: 'mcq', prompt: 'Selecting a replacement inductor should check...', options: ['both inductance value and current rating', 'inductance value only', 'physical size only', 'colour of the winding only'], answer: 0, explain: 'Mirrors the resistor power-rating lesson: value and rating are separate checks.' },
        ],
        summary: [
          'An inductor stores energy in a magnetic field and resists a change in current.',
          'Saturation is a core material limit: beyond it, effective inductance collapses and current rises steeply.',
          'Iron powder and ferrite cores trade permeability, saturation behaviour and high-frequency loss differently.',
          'Current rating (I_sat and I_rms) must be checked alongside inductance value, exactly as a resistor\'s power rating must be checked alongside its ohm value.',
        ],
        homework: {
          id: 'F4.M1.L3.hw',
          title: 'Inductor energy and rating practice',
          brief: 'Compute stored energy and reason about saturation.',
          tasks: [{ id: 'h1', type: 'numeric', prompt: 'Energy (J) stored in a 0.8 mH inductor carrying 10 A?', answer: 0.04, tol: 0.02, unit: 'J', explain: '½ × 0.0008 × 100 = 0.04 J.' }],
          written: [{ prompt: 'An output choke rated at 1.2 mH, 6 A begins drawing a much larger, rapidly rising current under a sustained overload. Explain, using the idea of saturation, why simply fitting a core of the same inductance but with a higher saturation current rating is a better fix than fitting a larger-value inductor of the same current rating.', model: 'The problem under overload is that the core has run out of headroom before saturating, not that the inductance value itself is wrong for normal operation. A higher saturation-current-rated core of the same inductance keeps the filter\'s normal behaviour (corner frequency, ripple) unchanged while giving the extra margin needed to stay out of saturation under the overload condition. Simply raising the inductance value at the same current rating would change the filter\'s normal behaviour and still saturate at the same current, so it does not address the actual limitation.' }],
        },
      },
    },
    {
      id: 'F4.M1.L4',
      title: 'Testing passive components',
      minutes: 30,
      content: {
        objectives: [
          'State the correct instrument and setting for testing a resistor, a capacitor and an inductor out of circuit.',
          'Interpret a resistance, ESR and inductance reading against a healthy reference value.',
          'Explain why passive components are normally tested OUT of circuit, isolated from the rest of the board.',
          'Apply the Component Library\'s test procedures to a resistor, capacitor and inductor.',
        ],
        introduction: `This lesson ties F4.M1.L1–L3 together into practice: how to actually confirm a resistor, capacitor or inductor is healthy on the bench, using the same test procedures built into the Component Library and relied on throughout the Repair Workshop.`,
        lecture: `### Why isolate the part first

Measuring a component while it is still connected into a circuit risks reading the PARALLEL combination of that part and everything else connected to the same two nodes, not the part alone — a resistor reading low could be perfectly healthy with another low-resistance path alongside it, or a capacitor's apparent capacitance could include a neighbouring capacitor on the same rail. Lifting at least one lead (or fully removing the part) before testing removes this ambiguity, which is why every test procedure in the Component Library begins with isolation (and, for capacitors, discharge) before any reading is taken.

### Resistors: ohms, compared against the colour code

A digital multimeter's resistance (Ω) range reads a resistor directly once isolated. Compare the reading against the value decoded from its colour code (F4.M1.L1), within its marked tolerance — a reading well outside that tolerance, or an open (no continuity) reading, confirms a fault.

### Capacitors: capacitance AND ESR

A basic meter's capacitance range confirms gross value, but (F4.M1.L2) ESR is the more sensitive aging indicator for an electrolytic. A dedicated ESR meter (or an LCR meter capable of measuring at the right frequency) reads this directly; compared against a healthy reference value for the same part, a significantly raised ESR confirms an aging or failing electrolytic even when its capacitance still reads close to nominal.

### Inductors: DC resistance AND inductance

An inductor's health needs two separate readings (F4.M1.L3): DC resistance (Ω range, or a 4-wire measurement for very low values) confirms the winding is continuous and not developing excess resistance; an LCR meter's inductance reading, compared against the marked value, confirms the winding has not partially shorted turns or that the core has not cracked — either of which can collapse the measured inductance well below its healthy value even while DC resistance looks normal.`,
        technical: `**4-wire (Kelvin) resistance measurement.** For very low resistances (a fraction of an ohm, typical of inductor windings or current shunts), the voltage drop across the test leads themselves becomes comparable to the reading — a 4-wire measurement uses separate current-carrying and voltage-sensing lead pairs to eliminate this lead-resistance error, giving an accurate low-ohm reading that a standard 2-wire measurement cannot.

**Comparing against a "healthy" reference, not a fixed universal threshold.** Component tolerances and typical aging ranges vary by part and application; the test procedures in this platform quote representative healthy and faulty readings for TEACHING, not a datasheet limit for one specific real part — always confirm against that part's own datasheet for a genuine repair decision.`,
        diagrams: [{ id: 'test-bench', caption: 'The out-of-circuit test bench setup: isolate, discharge where relevant, then measure with the correct instrument and setting for each passive component.' }],
        formulas: [{ name: 'Acceptable range from tolerance', expr: 'R_min = R_nom(1 − tol),  R_max = R_nom(1 + tol)', where: [['R_nom', 'nominal (colour-code) value', 'Ω'], ['tol', 'tolerance as a fraction', '']], note: 'A reading outside this range (or open/short) confirms a fault; within range is consistent with health but does not rule out a borderline drift.' }],
        examples: [
          {
            title: 'Judging a resistor reading against tolerance',
            problem: 'A resistor coded for 1 kΩ ± 5 % reads 1080 Ω out of circuit. Is this within tolerance?',
            steps: ['R_min = 1000 × 0.95 = 950 Ω', 'R_max = 1000 × 1.05 = 1050 Ω', '1080 Ω > 1050 Ω'],
            answer: 'No — 1080 Ω is outside the ±5 % tolerance band, indicating the resistor has drifted (likely from heat or age) and should be treated as suspect.',
          },
          {
            title: 'Interpreting an ESR reading',
            problem: 'A healthy reference reading for a particular bus capacitor is 0.05 Ω ESR. A suspect capacitor of the same part number reads 0.6 Ω. What does this indicate, and what should be checked next?',
            steps: ['0.6 Ω is twelve times the healthy reference value', 'This magnitude of ESR rise, with capacitance possibly still near nominal, matches the classic aging signature (F4.M1.L2)'],
            answer: 'The capacitor is almost certainly aged/failing and should be replaced; its capacitance reading alone would likely not have revealed this, which is exactly why ESR is checked separately.',
          },
        ],
        applications: `Every circuit-grounded Repair Workshop scenario that involves a passive component reports exactly these readings (resistance, ESR, or inductance) taken live from the real circuit engine — this lesson is the theory behind interpreting them correctly.`,
        mistakes: [
          { mistake: 'Measuring a component while it is still wired into the rest of the circuit.', correction: 'Isolate (lift at least one lead, or remove the part) before measuring, to avoid reading a parallel combination with other parts.' },
          { mistake: 'Checking capacitance but not ESR on a suspect electrolytic.', correction: 'ESR rises well before capacitance drifts noticeably for most aging electrolytics — ESR is the more sensitive test.' },
          { mistake: 'Treating any reading "in the right ballpark" as automatically healthy.', correction: 'Compare precisely against the colour-code/marked value and its tolerance (resistors), or a stated healthy reference (ESR, inductance) — "roughly right" can still hide a real fault.' },
        ],
        demo: { title: 'Run a real test procedure', text: 'Open the resistor test procedure in the Component Library and work through its steps and readings.', link: to.proc('Resistor Ω-range test', 'resistor', 'resistor-ohms') },
        activities: [to.proc('Resistor test', 'resistor', 'resistor-ohms'), to.proc('Capacitor ESR test', 'capacitor', 'cap-esr'), to.proc('Inductor L and DCR test', 'inductor', 'inductor-lcr')],
        check: [
          { id: 'k1', type: 'mcq', prompt: 'Why isolate a component before testing it?', options: ['To avoid reading it in parallel with everything else connected to the same nodes', 'Because meters cannot be used in circuit at all', 'To discharge the battery', 'It is not necessary'], answer: 0, explain: 'A parallel path would give a misleading reading.' },
          { id: 'k2', type: 'mcq', prompt: 'The most sensitive early indicator of an aging electrolytic capacitor is...', options: ['rising ESR', 'falling capacitance', 'colour change', 'weight loss'], answer: 0, explain: 'ESR rises well before capacitance drifts far.' },
          { id: 'k3', type: 'mcq', prompt: 'A 4-wire (Kelvin) resistance measurement is used specifically for...', options: ['very low resistance values, to eliminate lead-resistance error', 'very high resistance values', 'AC measurements only', 'capacitor testing'], answer: 0, explain: 'Separate current and sense leads remove the lead-resistance error that matters most at low ohms.' },
          { id: 'k4', type: 'numeric', prompt: 'Maximum acceptable resistance (Ω) for a 470 Ω, ±10 % resistor?', answer: 517, tol: 0.01, unit: 'Ω', explain: '470 × 1.10 = 517 Ω.' },
        ],
        summary: [
          'Passive components are tested out of circuit (isolated, and discharged where relevant) to avoid misleading parallel readings.',
          'Resistors are checked against their colour-code value and tolerance.',
          'Capacitors need both a capacitance check and an ESR check — ESR is the more sensitive aging indicator.',
          'Inductors need both a DC resistance check (winding continuity) and an inductance check (core/turns integrity).',
        ],
        homework: {
          id: 'F4.M1.L4.hw',
          title: 'Interpreting passive-component readings',
          brief: 'Judge readings against tolerance and healthy references.',
          tasks: [{ id: 'h1', type: 'numeric', prompt: 'Minimum acceptable resistance (Ω) for a 2.2 kΩ, ±5 % resistor?', answer: 2090, tol: 0.01, unit: 'Ω', explain: '2200 × 0.95 = 2090 Ω.' }],
          written: [{ prompt: 'A junior technician measures a suspect bus capacitor\'s capacitance, finds it within 5 % of its marked value, and concludes the capacitor is healthy without checking ESR. A few weeks later the same capacitor is confirmed as the cause of excessive output ripple. Explain what the technician\'s check missed and why.', model: 'Capacitance staying close to its marked value does not rule out a failing electrolytic, because the primary real-world aging mechanism (drying electrolyte raising ESR) shows up in ESR well before it noticeably affects the bulk capacitance reading. By checking capacitance alone, the technician missed exactly the measurement most likely to reveal early-stage aging, and the capacitor\'s rising ESR — not its capacitance — was almost certainly the actual cause of the excessive ripple that surfaced later.' }],
        },
      },
    },
  ],
  quiz: {
    pass: 0.8,
    questions: [
      { id: 'q1', type: 'numeric', prompt: 'Value (Ω) of a resistor coded orange, orange, red?', answer: 3300, tol: 0.01, unit: 'Ω', explain: '33 × 10² = 3300 Ω.' },
      { id: 'q2', type: 'mcq', prompt: 'Which resistor band gives the tolerance?', options: ['The last band (commonly gold, silver, red or brown)', 'The first band', 'The multiplier band', 'There is no tolerance band'], answer: 0, explain: 'Tolerance is the final band.' },
      { id: 'q3', type: 'mcq', prompt: 'Which capacitor family is polarised?', options: ['Electrolytic', 'Film', 'Ceramic', 'None of them'], answer: 0, explain: 'Electrolytic capacitors must not have reversed polarity.' },
      { id: 'q4', type: 'numeric', prompt: 'ESR self-heating (W) for 2.5 A RMS through 0.1 Ω ESR?', answer: 0.625, tol: 0.02, unit: 'W', explain: '2.5² × 0.1 = 6.25 × 0.1 = 0.625 W.' },
      { id: 'q5', type: 'mcq', prompt: 'Saturation in an inductor core causes...', options: ['effective inductance to collapse and current to rise steeply', 'inductance to rise sharply', 'the winding to open automatically', 'no measurable effect'], answer: 0, explain: 'Loss of permeability removes current-limiting ability.' },
      { id: 'q6', type: 'mcq', prompt: 'Passive components are tested out of circuit mainly to avoid...', options: ['reading a parallel combination with other connected parts', 'damaging the meter', 'the need for a reference value', 'exceeding the meter\'s voltage rating'], answer: 0, explain: 'Isolation removes ambiguity from parallel paths.' },
    ],
  },
  assignment: {
    id: 'F4.M1.assignment',
    title: 'Passive component selection and testing',
    brief: 'Apply resistor, capacitor and inductor selection and testing to short scenarios.',
    tasks: [
      { id: 'a1', type: 'numeric', prompt: 'Power (W) dissipated by a 22 Ω resistor carrying 1.5 A?', answer: 49.5, tol: 0.02, unit: 'W', explain: 'P = I²R = 2.25×22 = 49.5 W.' },
      { id: 'a2', type: 'numeric', prompt: 'ESR self-heating (W) for 4 A RMS through 0.15 Ω ESR?', answer: 2.4, tol: 0.02, unit: 'W', explain: 'P = 16×0.15 = 2.4 W.' },
      { id: 'a3', type: 'mcq', prompt: 'A replacement inductor should match the original in...', options: ['both inductance value and current rating', 'physical colour only', 'inductance value only, any current rating', 'current rating only, any inductance'], answer: 0, explain: 'Both ratings matter independently.' },
    ],
    written: [{ prompt: 'A 1000 µF, 400 V electrolytic bus capacitor is replaced after confirmed ESR failure with a part of the same capacitance and voltage rating but a lower ripple-current rating than the original. Explain why this is still a risk, even though the two headline specifications (capacitance, voltage) match.', model: 'Ripple-current rating is a separate specification from capacitance and voltage rating, governing how much self-heating (via I²·ESR) the capacitor can tolerate continuously. A replacement with a lower ripple-current rating may overheat under the same operating conditions the original was designed for, even though its capacitance and voltage rating are identical on paper — all of a capacitor\'s relevant ratings, not just the two most commonly quoted, must be checked when selecting a replacement.' }],
  },
  practicals: [
    {
      id: 'F4.M1.P1',
      title: 'Passive component rating calculations',
      description: 'Check resistor power ratings, capacitor ESR heating and inductor saturation margin against real operating figures. All answers must be correct.',
      task: {
        id: 'f4-passive-ratings',
        kind: 'calc',
        title: 'Rating a resistor, a capacitor and an inductor',
        brief: 'A 15 Ω bleeder resistor carries 3 A. A bus capacitor with ESR 0.25 Ω carries 2 A RMS ripple. An output choke of 1 mH is rated for a saturation current of 9 A.',
        questions: [
          { id: 'c1', type: 'numeric', prompt: 'Power dissipated in the bleeder resistor (W)?', answer: 135, tol: 0.02, unit: 'W', explain: 'P = I²R = 9×15 = 135 W.' },
          { id: 'c2', type: 'numeric', prompt: 'Self-heating in the bus capacitor from its ESR (W)?', answer: 1, tol: 0.02, unit: 'W', explain: 'P = I²·ESR = 4×0.25 = 1 W.' },
          { id: 'c3', type: 'numeric', prompt: 'Energy stored in the output choke at a load current of 6 A (J)?', answer: 0.018, tol: 0.03, unit: 'J', explain: '½×0.001×36 = 0.018 J.' },
          { id: 'c4', type: 'mcq', prompt: 'If the load current rises to 10 A, what happens to the output choke?', options: ['It exceeds its saturation rating and its effective inductance collapses', 'Nothing, it has unlimited headroom', 'Its resistance drops to zero', 'Its inductance increases to compensate'], answer: 0, explain: '10 A exceeds the 9 A saturation rating.' },
        ],
        explain: 'Each rating (power, ESR heating, saturation current) is an independent check against the actual operating current — matching one specification (value) while ignoring another (rating) is the recurring mistake this module warns against.',
      },
      evidence: { kind: 'task', id: 'f4-passive-ratings' },
    },
    {
      id: 'F4.M1.P2',
      title: 'Diagnose a dried-out smoothing capacitor',
      description: 'Confirm, in the Repair Workshop, that you can apply the ESR-aging reasoning from this module to a real circuit-grounded fault.',
      link: to.repair('Dried-out smoothing capacitor', 'rsc-04'),
      evidence: { kind: 'troubleshoot', project: 'rsc-04' },
    },
  ],
}
