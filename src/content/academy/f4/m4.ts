import type { AcademyModule } from '../types'
import { to } from '../s1/links'

/** F4.M4 Protection and switching devices. */
export const F4_M4: AcademyModule = {
  id: 'F4.M4',
  title: 'Protection and switching devices',
  summary: 'Fuses and circuit breakers, relays and contactors, and how electromechanical switching compares with the semiconductor switching of F4.M2.',
  lessons: [
    {
      id: 'F4.M4.L1',
      title: 'Fuses: I²t, breaking capacity',
      minutes: 25,
      content: {
        objectives: [
          'Explain how a fuse interrupts fault current and why its I²t rating matters.',
          'Define breaking capacity and explain why it is a separate check from current rating.',
          'Select an appropriately-rated fuse for a stated continuous and fault current.',
        ],
        introduction: `Every circuit this platform teaches you to build, test or repair depends on protection devices to limit damage when something goes wrong. This lesson covers the simplest and most widely used of them: the [[fuse|fuse]].`,
        lecture: `### How a fuse works

A fuse is a deliberately thin, calibrated conductor element that heats up in proportion to I²R as current flows through it. Under normal (rated) current, this heating is modest and the element survives indefinitely; under fault current (far above rated), the heating rises sharply (because it scales with the SQUARE of current) and the element melts open within a predictable time, interrupting the circuit. A fuse is a one-shot, sacrificial device — once it has opened, it must be replaced, never simply reset.

### I²t: energy let-through

A fuse's **[[i2t|I²t rating]]** describes the energy it lets through before fully clearing a fault — critical for coordinating protection with whatever downstream component (a switching device, F4.M2) the fuse is meant to protect: if the protected device would be destroyed by less energy than the fuse lets through before clearing, the fuse is not actually protecting it, however correct its current rating looks on paper. Faster-acting fuses have lower I²t for the same current rating, at some cost in nuisance tripping on brief, harmless current surges (such as inrush at switch-on).

### Breaking capacity: a separate check from current rating

A fuse's [[breaking-capacity|breaking capacity]] states the maximum fault current it can safely interrupt without itself failing destructively — a fuse correctly rated for the circuit's normal and fault current can still be the WRONG choice if its breaking capacity is below the circuit's actual prospective fault current (a battery bank's very low internal resistance, F1.M2, can produce prospective fault currents far higher than many people intuitively expect). Current rating and breaking capacity answer two different questions — "does it carry normal load without nuisance tripping" and "can it survive interrupting the worst fault this circuit can produce" — and both must be checked.

### Selecting a fuse

A fuse is selected against TWO figures: the circuit's normal continuous current (it must not nuisance-trip or degrade under normal, rated load) and the circuit's worst-case fault current (it must interrupt it fast enough, and with low enough let-through energy, to protect whatever it is meant to protect, while its breaking capacity exceeds that fault current too). A rating too low causes nuisance tripping under normal load; a rating too high, or an inadequate breaking capacity, fails to protect the downstream component or the fuse itself during an actual fault.`,
        technical: `**Fuse speed classifications.** Fast-acting, time-delay (slow-blow) and semiconductor-protection (ultra-fast) fuse types trade nuisance-trip tolerance against let-through energy differently — a semiconductor-protection fuse, specifically designed for the very low I²t tolerance of power MOSFETs and IGBTs, is a deliberately different product from a general-purpose fuse of the same current rating.

**Voltage rating.** A fuse also carries a voltage rating, separate from its current rating — it must be able to safely extinguish the arc that forms as its element melts open at the circuit's actual voltage; using a fuse below its rated voltage does not relax this requirement, but using one rated below the circuit voltage risks the arc failing to clear, a hazard distinct from an inadequate breaking capacity.`,
        diagrams: [{ id: 'protection-chain', caption: 'A fuse\'s I²t let-through energy against a protected switching device\'s own withstand capability — the coordination check this lesson explains.' }],
        formulas: [{ name: 'Fuse let-through energy', expr: 'I²t = ∫ i²(t) dt (over the clearing time)', where: [['I²t', 'let-through energy', 'A²s'], ['i(t)', 'instantaneous fault current during clearing', 'A']], note: 'A protected component\'s withstand rating must exceed the fuse\'s I²t let-through for genuine protection.' }],
        examples: [
          {
            title: 'Checking breaking capacity against prospective fault current',
            problem: 'A battery bank can deliver a prospective short-circuit current of 2000 A at its terminals. A fuse rated for the circuit\'s normal current has a breaking capacity of only 1000 A. Is this fuse suitable?',
            steps: ['Breaking capacity (1000 A) must exceed the prospective fault current (2000 A) the fuse could actually see', '1000 A < 2000 A'],
            answer: 'No — this fuse is unsuitable despite having the correct current rating for normal load; a higher breaking-capacity device is required, or additional upstream current-limiting must be added.',
          },
          {
            title: 'Why a correctly-rated fuse can still fail to protect a MOSFET',
            problem: 'A fuse is correctly rated for a MOSFET\'s continuous current, but its I²t let-through is higher than the MOSFET\'s own short-circuit withstand rating. Explain the consequence.',
            steps: ['The fuse will eventually clear the fault, interrupting the circuit', 'But the MOSFET may absorb more energy during the fuse\'s clearing time than it can withstand, before the fuse finishes opening'],
            answer: 'The MOSFET can be destroyed by the fault BEFORE the fuse finishes clearing it, even though the fuse itself is correctly rated for continuous current — current rating alone does not guarantee adequate protection; I²t coordination against the protected device\'s withstand rating must also be checked.',
          },
        ],
        applications: `Every Build Your Own Inverter project's fuse sizing, and the Repair Workshop's blown-fuse scenario, rest on exactly this selection and coordination reasoning.`,
        mistakes: [
          { mistake: 'Selecting a fuse on current rating alone.', correction: 'Breaking capacity (against prospective fault current) and I²t let-through (against the protected device\'s withstand rating) must also be checked.' },
          { mistake: 'Resetting a blown fuse by replacing it with a higher-rated one "to stop it blowing".', correction: 'A fuse blowing under normal conditions signals an underlying problem to diagnose; simply up-rating it removes the protection the original rating was providing.' },
          { mistake: 'Assuming all fuses of the same current rating behave identically.', correction: 'Fast, time-delay and semiconductor-protection fuse types differ substantially in I²t let-through and nuisance-trip tolerance at the same current rating.' },
        ],
        demo: { title: 'See fuse ratings', text: 'Compare I²t and breaking-capacity figures for the Component Library\'s fuse entry.', link: to.lib('Fuse', 'fuse') },
        activities: [to.lib('Fuse', 'fuse'), to.proc('Fuse check', 'fuse', 'fuse-check')],
        check: [
          { id: 'k1', type: 'mcq', prompt: 'A fuse interrupts a fault by...', options: ['its element heating (I²R) until it melts open', 'an electromechanical trip mechanism that can be reset', 'reversing current flow', 'raising its own resistance smoothly without melting'], answer: 0, explain: 'A fuse is a sacrificial, heat-based device.' },
          { id: 'k2', type: 'mcq', prompt: 'A fuse\'s breaking capacity must be checked against...', options: ['the circuit\'s prospective fault current', 'only its own price', 'the ambient room temperature only', 'the colour of its casing'], answer: 0, explain: 'A device with insufficient breaking capacity can fail destructively instead of safely interrupting the fault.' },
          { id: 'k3', type: 'mcq', prompt: 'A fuse correctly rated for continuous current but with I²t let-through exceeding a protected MOSFET\'s withstand rating...', options: ['can still fail to protect the MOSFET during a fault', 'always protects the MOSFET perfectly', 'never blows', 'increases the MOSFET\'s voltage rating'], answer: 0, explain: 'I²t coordination against the protected device is a separate check from current rating.' },
        ],
        summary: [
          'A fuse is a one-shot, sacrificial device that melts open from I²R heating under fault current.',
          'I²t let-through energy must be checked against the withstand rating of whatever the fuse protects.',
          'Breaking capacity must exceed the circuit\'s actual prospective fault current, separately from current rating.',
          'A fuse is selected against both normal continuous current and worst-case fault current, not current rating alone.',
        ],
        homework: {
          id: 'F4.M4.L1.hw',
          title: 'Fuse selection practice',
          brief: 'Apply rating-selection reasoning.',
          tasks: [{ id: 'h1', type: 'mcq', prompt: 'A fuse\'s I²t rating matters mainly because it describes...', options: ['the energy let through to the protected device before the fuse fully clears', 'the fuse\'s physical size', 'its voltage rating only', 'how long the fuse lasts in storage'], answer: 0, explain: 'Let-through energy is what the protected device must actually withstand.' }],
          written: [{ prompt: 'A maintenance log shows a circuit\'s fuse has been replaced three times in six months, each time with an identical-rated fuse, with the circuit "working fine" immediately after each replacement. Explain why this pattern should concern a technician more than a single blown fuse would, and what it suggests about root cause versus symptom.', model: 'A fuse blowing once could plausibly be a one-off transient event, but blowing repeatedly at the same rating strongly suggests a recurring underlying condition — an intermittent overload, a developing fault elsewhere in the circuit, or a marginal design that occasionally exceeds the fuse\'s rating — rather than coincidence. Each replacement only restores the SYMPTOM (an open circuit) to working order without addressing whatever is repeatedly pushing current past the fuse\'s rating; continuing to simply replace the fuse risks eventually replacing it with something less protective (a slower-blow or higher-rated type, "to stop the nuisance") specifically because the underlying cause was never investigated. The repeated pattern itself is diagnostic information and should prompt root-cause investigation, not just another replacement.' }],
        },
      },
    },
    {
      id: 'F4.M4.L2',
      title: 'Circuit breakers: thermal, magnetic',
      minutes: 25,
      content: {
        objectives: [
          'Explain how a thermal-magnetic circuit breaker detects and interrupts overcurrent.',
          'Distinguish the thermal and magnetic trip mechanisms and the fault conditions each responds to best.',
          'Compare a breaker\'s resettable behaviour with a fuse\'s one-shot behaviour.',
        ],
        introduction: `F4.M4.L1 covered the fuse's sacrificial, one-shot protection. This lesson covers the [[breaker|circuit breaker]]: a resettable alternative built around two distinct trip mechanisms, each suited to a different kind of overcurrent.`,
        lecture: `### Two trip mechanisms in one device

A common thermal-magnetic breaker combines two separate sensing mechanisms behind one switching mechanism:

- **Thermal trip**: a bimetallic strip heats (from I²R, carrying the circuit's own current) and bends as it heats, mechanically triggering the trip latch once it has heated enough — inherently SLOWER (it takes time for the strip to heat) and better suited to detecting a sustained, moderate overload that builds up gradually.
- **Magnetic trip**: a solenoid coil, carrying the same current, produces a magnetic field strong enough at HIGH current to directly pull a trip armature nearly instantaneously — much FASTER, and suited to a sudden, severe short-circuit current rather than a gradual overload.

Together, these give a breaker a trip-time characteristic that is slow at currents just above its rating (thermal-dominated) and very fast at currents far above its rating (magnetic-dominated) — exactly the shape needed to tolerate brief, harmless surges (motor starting, inrush) at moderate overcurrent while still responding quickly to a genuine short circuit.

### Why a breaker can be reset

Unlike a fuse's melted element, a breaker's trip mechanism is purely mechanical (a bent bimetallic strip returns to shape on cooling; a pulled armature can be re-latched) — once the fault is cleared, the breaker can simply be switched back on, without replacing any part. This makes breakers far more convenient for circuits expected to trip occasionally under normal operating conditions (nuisance overloads, accidental short exposure during maintenance), at a higher unit cost and, for a given size/cost, typically a somewhat higher let-through energy than an equivalently rated fast fuse.

### Selecting a breaker

As with a fuse, a breaker is selected against continuous current (avoiding nuisance tripping), fault current (tripping fast enough to protect the circuit) and breaking capacity (surviving the actual interruption) — the same three checks from F4.M4.L1, applied to a device with two trip mechanisms instead of one melting element.`,
        technical: `**Trip curve classes.** Breakers are commonly sold in trip-curve classes (such as B, C and D in common standards) that set how many times rated current the magnetic trip needs before acting nearly instantaneously — a class chosen to tolerate a specific load's normal inrush (a motor needs a higher-tolerance class than a purely resistive heater) without nuisance tripping.

**Electronic trip units.** Larger or more sophisticated breakers replace the bimetallic-strip and solenoid mechanism with an electronic sensing and tripping unit, offering more precisely configurable trip curves and additional protection functions — a different implementation of the same underlying thermal/magnetic trip philosophy, not a different protection concept.`,
        diagrams: [{ id: 'protection-chain', caption: 'A thermal-magnetic breaker\'s two trip mechanisms: a slower bimetallic-strip response to sustained overload, and a fast magnetic-solenoid response to a severe short circuit.' }],
        formulas: [{ name: 'Breaker trip-time behaviour (concept)', expr: 'Trip time falls sharply as fault current rises, thermal-dominated near rated current and magnetic-dominated at high multiples of rated current', where: [], note: 'A qualitative time-current relationship, formally captured in the breaker\'s published trip curve.' }],
        examples: [
          {
            title: 'Identifying which trip mechanism responds',
            problem: 'A circuit draws a gradually rising overload that settles at 1.3× the breaker\'s rated current for several minutes before it trips. Which trip mechanism most likely responded?',
            steps: ['1.3× rated current is a moderate, sustained overload, not a sudden severe fault', 'The breaker took several minutes to respond, consistent with a bimetallic strip slowly heating'],
            answer: 'The thermal trip mechanism — its characteristic slow response to a moderate, sustained overload.',
          },
          {
            title: 'Comparing breaker and fuse recovery after a fault',
            problem: 'A breaker and a fuse of similar rating both interrupt the same brief overload. Compare what is needed to restore the circuit afterward.',
            steps: ['A fuse\'s element has melted and cannot conduct again', 'A breaker\'s trip mechanism is purely mechanical and has not been consumed by the event'],
            answer: 'The breaker can simply be reset (switched back on); the fuse must be physically replaced — the defining practical difference between the two device types.',
          },
        ],
        applications: `The circuit breaker test procedure in the Component Library, and breaker selection in any Build Your Own Inverter project, apply exactly this thermal/magnetic trip reasoning.`,
        mistakes: [
          { mistake: 'Assuming a breaker responds at a single, fixed overcurrent threshold regardless of how far above rated current the fault is.', correction: 'A thermal-magnetic breaker\'s response time varies sharply with fault current — slow near rated current, fast at high multiples of it.' },
          { mistake: 'Believing a breaker never needs replacing, since it can be reset.', correction: 'Repeated severe trips can still mechanically wear or damage a breaker\'s contacts and trip mechanism over its service life, even though a single reset after a normal trip is expected.' },
          { mistake: 'Selecting a breaker\'s trip-curve class without considering the load\'s normal inrush behaviour.', correction: 'A motor or other inrush-heavy load needs a higher-tolerance trip-curve class than a purely resistive load, to avoid nuisance tripping on normal starting current.' },
        ],
        demo: { title: 'See breaker ratings', text: 'Compare a thermal-magnetic breaker\'s trip behaviour in the Component Library.', link: to.lib('Circuit breaker', 'circuit-breaker') },
        activities: [to.lib('Circuit breaker', 'circuit-breaker'), to.proc('Breaker check', 'circuit-breaker', 'breaker-check'), to.cmp('Fuse vs breaker', 'fuse-vs-breaker')],
        check: [
          { id: 'k1', type: 'mcq', prompt: 'A breaker\'s thermal trip responds to...', options: ['a moderate, sustained overload, relatively slowly', 'only an instantaneous short circuit', 'low voltage only', 'reversed polarity'], answer: 0, explain: 'The bimetallic strip heats gradually under sustained overcurrent.' },
          { id: 'k2', type: 'mcq', prompt: 'A breaker\'s magnetic trip responds to...', options: ['a severe short-circuit current, nearly instantaneously', 'a slow, gradual overload', 'low voltage', 'normal rated current'], answer: 0, explain: 'The solenoid\'s field is only strong enough to trip directly at high current.' },
          { id: 'k3', type: 'mcq', prompt: 'Compared with a fuse, a breaker\'s key practical advantage is...', options: ['it can be reset rather than replaced after a normal trip', 'it always has lower let-through energy', 'it is always cheaper', 'it never nuisance-trips'], answer: 0, explain: 'Resettability is the breaker\'s main convenience advantage.' },
        ],
        summary: [
          'A thermal-magnetic breaker combines a slow bimetallic thermal trip (sustained overload) with a fast magnetic trip (severe short circuit).',
          'This combination gives a trip-time characteristic that tolerates brief harmless surges while still responding quickly to a genuine fault.',
          'A breaker\'s mechanical trip mechanism allows it to be reset after a normal trip, unlike a fuse\'s melted element.',
          'Breaker selection checks continuous current, fault current and breaking capacity, exactly as fuse selection does.',
        ],
        homework: {
          id: 'F4.M4.L2.hw',
          title: 'Breaker trip-mechanism practice',
          brief: 'Classify which trip mechanism responds to a given fault.',
          tasks: [{ id: 'h1', type: 'mcq', prompt: 'A dead short produces a fault current of 15× the breaker\'s rating, and the breaker trips within a few milliseconds. Which mechanism responded?', options: ['the magnetic trip', 'the thermal trip', 'neither, this is too fast for any breaker', 'both equally and simultaneously by design'], answer: 0, explain: 'A high-multiple short-circuit current triggers the fast magnetic trip.' }],
          written: [{ prompt: 'A breaker nuisance-trips every time a particular motor starts, even though the motor\'s continuous running current is well within the breaker\'s rating. Explain, using this lesson\'s ideas, the most likely cause and the most appropriate fix, rather than simply fitting a higher-current-rated breaker.', model: 'Motor starting (inrush) current is typically several times the motor\'s continuous running current for a brief period — if the breaker\'s trip-curve class is too sensitive to tolerate this brief, normal inrush, its thermal (or in some designs, an overly sensitive instantaneous) trip can activate even though the motor\'s steady running current is well within the breaker\'s rating. Simply fitting a higher-current-rated breaker would reduce protection during an actual sustained overload or fault, since the new breaker would also tolerate more sustained overcurrent than the circuit should allow. The more appropriate fix is selecting a breaker with a trip-curve class suited to the motor\'s actual inrush profile, keeping the same current rating but changing how quickly it responds to a brief overcurrent.' }],
        },
      },
    },
    {
      id: 'F4.M4.L3',
      title: 'Relays and contactors',
      minutes: 25,
      content: {
        objectives: [
          'Explain how an electromagnetic relay switches a circuit using a separate control signal.',
          'Distinguish a light-duty relay from a heavier-duty contactor by typical current rating and application.',
          'Explain contact bounce and contact wear, and why they matter for reliability.',
        ],
        introduction: `This lesson introduces a third protection/switching device family: the [[relay|relay]], which switches a circuit using an electromagnetically-actuated mechanical contact, controlled by a separate, often much smaller, signal — a different switching mechanism from the fuses and breakers of F4.M4.L1-L2, and from the semiconductor devices of F4.M2, compared directly in F4.M4.L4.`,
        lecture: `### Electromagnetic switching

A relay's coil, energised by a control signal, creates a magnetic field that pulls a mechanical armature, closing (or opening) a separate set of contacts carrying the switched circuit's current — completely electrically isolated from the control coil (aside from the deliberate magnetic coupling), which is a genuine advantage where the control and switched circuits must not share a conductive path, similar in spirit to the isolation a transformer provides (F4.M3.L2) but via a mechanical rather than magnetic-flux mechanism.

### Relay versus contactor

A small, light-duty relay and a larger, heavier-duty [[contactor|contactor]] work on the identical electromagnetic principle, differing mainly in current/voltage rating and construction robustness: contactor-class devices are built for the higher currents and more frequent switching cycles found in motor control and heavier power-distribution applications, often with features (arc chutes, multiple contact sets) a small relay does not need.

### Contact bounce and contact wear

When a mechanical contact closes, it typically does not settle cleanly on first touch — it physically bounces briefly, opening and reclosing several times within milliseconds ([[contact-bounce|contact bounce]]) before settling, which can cause brief current/voltage glitches a control system must sometimes be designed to tolerate or filter. Over many switching cycles, especially switching significant current, contacts also wear and pit from the small arcs that occur at each make/break — a genuine wear-out mechanism (unlike a solid-state switch, F4.M2, which has no moving parts to wear in this way) that eventually limits a relay or contactor's service life and is why switching-cycle life is a quoted rating, not an afterthought.`,
        technical: `**Coil suppression.** A relay or contactor coil is itself an inductor (F4.M1.L3); abruptly interrupting its drive current induces a large voltage spike (back-EMF) that can damage the driving circuit if not suppressed — a flyback diode (for DC coils) or an RC snubber (for AC coils) across the coil is standard practice, directly paralleling the freewheeling-diode reasoning already met in F4.M2.L2.

**Contact arcing at switch-off.** Interrupting current through an inductive load's contacts at switch-off can draw a small arc across the opening gap, which is part of why contacts wear and why some relays/contactors specify a derated current limit for inductive loads versus purely resistive ones.`,
        diagrams: [{ id: 'isolation-flow', caption: 'A relay\'s coil-actuated contact mechanism, showing the electrical isolation between the control coil circuit and the switched contact circuit.' }],
        formulas: [{ name: 'Coil back-EMF (concept)', expr: 'V_spike ∝ L · (di/dt) at coil de-energisation', where: [], note: 'The same inductive-kick reasoning as a freewheeling MOSFET load (F4.M2.L2) — a suppression diode or snubber limits it.' }],
        examples: [
          {
            title: 'Choosing relay versus contactor',
            problem: 'A control circuit needs to switch a small 24 V, 200 mA signal relay coil versus a 50 A, 400 V three-phase motor. Which device suits each, and why?',
            steps: ['The 200 mA signal load is well within a small relay\'s typical rating', 'The 50 A, 400 V motor load needs a heavy-duty device built for high current/voltage and frequent cycling — a contactor\'s typical application'],
            answer: 'A relay for the small signal load; a contactor for the motor load — matching device robustness and rating to the actual switched current/voltage and expected duty cycle.',
          },
          {
            title: 'Why a flyback diode matters when driving a relay coil from a MOSFET',
            problem: 'A MOSFET directly drives a relay coil with no suppression diode across the coil. Explain the risk when the MOSFET turns off.',
            steps: ['The coil\'s stored magnetic energy (an inductor, F4.M1.L3) must go somewhere when current is interrupted', 'With no freewheeling path, this energy drives a large voltage spike across the now-open MOSFET'],
            answer: 'The spike can exceed the MOSFET\'s voltage rating and destroy it — exactly the freewheeling-diode reasoning from F4.M2.L2, applied here to a relay coil rather than a motor or inductor load.',
          },
        ],
        applications: `Battery-disconnect contactors and auxiliary relays appear throughout real inverter installations (S2, S3) for exactly the isolation and high-current switching reasons this lesson covers.`,
        mistakes: [
          { mistake: 'Treating relays and contactors as interchangeable regardless of current rating.', correction: 'Match the device\'s current/voltage rating and duty-cycle robustness to the actual switched load — a relay undersized for a motor-starting current will fail quickly.' },
          { mistake: 'Omitting a flyback diode or snubber across a relay/contactor coil driven by a semiconductor switch.', correction: 'The coil\'s own inductive back-EMF can destroy the driving switch without suppression — the same reasoning as a freewheeling diode for any inductive load.' },
          { mistake: 'Assuming a mechanical relay/contactor has unlimited switching-cycle life, like a solid-state device.', correction: 'Contact wear from repeated arcing is a genuine, quoted, finite-life wear-out mechanism — directly relevant to F4.M4.L4\'s comparison with semiconductor switches.' },
        ],
        demo: { title: 'See the relay entry', text: 'Compare a relay\'s coil and contact ratings in the Component Library.', link: to.lib('Relay', 'relay') },
        activities: [to.lib('Relay', 'relay'), to.proc('Relay coil and contact test', 'relay', 'relay-coil-contacts')],
        check: [
          { id: 'k1', type: 'mcq', prompt: 'A relay switches its contact circuit by...', options: ['an electromagnetically-actuated mechanical contact, isolated from the control coil', 'direct electrical connection between control and switched circuit', 'a PN junction', 'heating a fusible element'], answer: 0, explain: 'Magnetic coupling, not a direct conductive path, links control and switched circuits.' },
          { id: 'k2', type: 'mcq', prompt: 'Contactors differ from relays mainly in...', options: ['current/voltage rating and construction robustness for heavier-duty switching', 'using a completely different switching principle', 'having no coil at all', 'being solid-state devices'], answer: 0, explain: 'Same principle, built for higher current and more frequent heavy-duty cycling.' },
          { id: 'k3', type: 'mcq', prompt: 'A flyback diode across a relay coil exists to...', options: ['suppress the back-EMF spike when coil current is interrupted', 'increase switching speed', 'reduce coil resistance', 'prevent contact bounce'], answer: 0, explain: 'The same inductive-kick suppression reasoning as a freewheeling diode.' },
        ],
        summary: [
          'A relay or contactor switches a circuit via an electromagnetically-actuated mechanical contact, electrically isolated from its control coil.',
          'Relays and contactors share the same principle, differing mainly in current/voltage rating and robustness for heavier-duty use.',
          'A coil driven by a semiconductor switch needs flyback suppression, exactly as any other inductive load does.',
          'Contact bounce and contact wear are real, quoted limitations of mechanical switching that solid-state devices do not share — the subject of the next lesson\'s comparison.',
        ],
        homework: {
          id: 'F4.M4.L3.hw',
          title: 'Relay and contactor reasoning',
          brief: 'Apply device-selection and coil-suppression reasoning.',
          tasks: [{ id: 'h1', type: 'mcq', prompt: 'A relay coil is directly driven by a microcontroller output with no suppression diode. The main risk at coil de-energisation is...', options: ['a voltage spike that can damage the microcontroller output', 'the relay running backwards', 'the coil gaining extra inductance', 'no risk at all'], answer: 0, explain: 'Back-EMF from the collapsing coil field needs a suppression path.' }],
          written: [{ prompt: 'A battery-disconnect contactor in an inverter installation is reported to click audibly several times before settling into either state. Explain why this is very likely normal behaviour rather than a fault, referring to this lesson\'s ideas.', model: 'Mechanical contacts commonly exhibit contact bounce — a brief, rapid series of make-and-break events before settling into a stable closed or open state — as the moving contact physically settles after being actuated. An audible multiple-click sound on actuation is consistent with this well-understood, normal mechanical behaviour rather than a developing fault, provided the contactor does settle reliably into the correct final state each time and the clicking does not develop into chattering that fails to settle at all (which would be a genuine concern worth investigating separately).' }],
        },
      },
    },
    {
      id: 'F4.M4.L4',
      title: 'Relays versus semiconductor switches',
      minutes: 25,
      content: {
        objectives: [
          'Compare switching speed, isolation, wear and power loss between a relay/contactor and a semiconductor switch.',
          'Explain why some designs use both switching technologies together, each for the job it suits best.',
          'Select the more appropriate switching technology for a stated application.',
        ],
        introduction: `This closing lesson brings F4.M2's semiconductor switches and F4.M4.L1-L3's electromechanical devices together, comparing them directly on the properties that actually decide which to use for a given job.`,
        lecture: `### Switching speed

A relay or contactor's mechanical armature takes milliseconds to physically move; a MOSFET or IGBT switches in nanoseconds to microseconds — a difference of several orders of magnitude. Any application needing fast, repeated switching (PWM at kilohertz frequencies, F4.M2.L7) is only practical with a semiconductor switch; a relay simply cannot physically move fast enough, and would wear out almost immediately if driven at anything close to PWM switching rates.

### Isolation

A relay/contactor provides genuine galvanic isolation between its control coil and switched contacts (F4.M4.L3) with no direct conductive path at all. A MOSFET or IGBT provides no such isolation on its own — its gate and its switched drain-source (or collector-emitter) path share a common reference, and achieving isolation in a semiconductor-switched design needs a deliberately added isolated gate driver (F4.M2.L6) or an isolation transformer elsewhere in the circuit. Where simple, robust isolation matters more than switching speed, a relay's isolation comes "for free" as part of its basic mechanism.

### Wear, reliability and power loss

A relay/contactor has a finite mechanical switching-cycle life from contact wear (F4.M4.L3); a semiconductor switch has no moving parts and, within its electrical ratings, does not wear out from switching cycles at all — a genuine reliability advantage for high-cycle-count applications. Conversely, a relay/contactor's closed contact resistance is typically extremely low (milliohms), giving very low conduction loss once closed, while a semiconductor switch's R_DS(on) or V_CE(sat) (F4.M2.L4-L5) represents a real, continuous conduction loss that a mechanical contact simply does not have.

### Using both together, each for the job it suits

Many real designs use both technologies deliberately, each where it is the better fit: a contactor for a slow, infrequent, high-isolation function (battery disconnect, main power switching) where its low conduction loss and strong isolation matter and its slow speed and finite cycle life are not limiting; semiconductor switches for the fast, frequent, PWM-rate switching inside the power conversion itself, where only they are fast enough and cycle-count durability is the governing requirement. Neither technology is universally superior — the right choice (or combination) depends on the specific switching speed, isolation, loss and reliability requirements of each specific function in the design.`,
        technical: `**Solid-state relays (SSRs).** An SSR packages a semiconductor switch together with an isolated (commonly optical) input stage, aiming to combine a relay's simple isolated control interface with a semiconductor's switching speed and absence of mechanical wear — a deliberate hybrid, at the cost of still having some conduction loss (unlike a mechanical contact's near-zero closed resistance) and generally a lower surge-current tolerance than an equivalent mechanical contactor.

**Contact rating versus semiconductor current rating.** A relay/contactor's current rating for inductive loads is commonly derated relative to its rating for purely resistive loads, reflecting the extra contact wear from inductive switching arcs (F4.M4.L3) — a consideration with no direct semiconductor-switch equivalent, since a properly protected semiconductor switch (with correct freewheeling-diode handling, F4.M2.L2) does not experience an equivalent switching arc.`,
        diagrams: [{ id: 'protection-chain', caption: 'Relay/contactor switching and semiconductor switching compared on speed, isolation, wear and conduction loss — each suited to different roles within the same design.' }],
        formulas: [{ name: 'Qualitative comparison', expr: 'Relay/contactor: slow, isolated, wears mechanically, very low closed-contact loss. Semiconductor: fast, not inherently isolated, no mechanical wear, real conduction loss (I²R_DS(on) or V_CE(sat)·I).', where: [] }],
        examples: [
          {
            title: 'Choosing a switching technology for a battery disconnect',
            problem: 'A design needs to disconnect a battery bank completely, perhaps a few times a day at most, with strong isolation and minimal standing conduction loss. Which switching technology fits better?',
            steps: ['Switching frequency required is very low (a few times a day) — well within a contactor\'s mechanical speed', 'Strong isolation and minimal standing loss both favour the contactor\'s properties over a semiconductor switch\'s'],
            answer: 'A contactor fits this application well — its slow switching speed is not a limitation here, and its isolation and low conduction loss are genuine advantages for this specific role.',
          },
          {
            title: 'Why a relay cannot replace a MOSFET in a PWM bridge leg',
            problem: 'Explain why a relay could not be substituted for a MOSFET switching at 20 kHz in an inverter\'s bridge leg.',
            steps: ['20 kHz switching means a new switching event roughly every 50 microseconds', 'A relay\'s mechanical armature takes milliseconds to move — orders of magnitude too slow to track this switching rate', 'Even if it somehow kept up, the contact wear from millions of switching cycles per second-equivalent would destroy it almost instantly'],
            answer: 'A relay is fundamentally too slow (by several orders of magnitude) and would wear out essentially immediately at this switching rate — this role is only achievable with a semiconductor switch.',
          },
        ],
        applications: `This exact comparison — fast, lossy, wear-free semiconductor switching for PWM versus slow, isolated, low-loss mechanical switching for disconnects — explains the mix of device families you will see across every real inverter design and Build Your Own Inverter project.`,
        mistakes: [
          { mistake: 'Treating one switching technology as universally better than the other.', correction: 'Each has genuine advantages (speed and no wear for semiconductors; isolation and low conduction loss for relays/contactors) suited to different roles.' },
          { mistake: 'Assuming a relay could substitute for a semiconductor switch in a high-frequency PWM application.', correction: 'Mechanical switching speed is orders of magnitude too slow for PWM-rate switching, and would wear out almost immediately if attempted.' },
          { mistake: 'Assuming a semiconductor switch provides isolation "for free" like a relay does.', correction: 'A semiconductor switch needs a deliberately added isolated gate driver or transformer to achieve isolation; it is not inherent to the device the way it is for a relay.' },
        ],
        demo: { title: 'Compare the two switching families directly', text: 'Use the comparison guide to see relay and semiconductor switching properties side by side.', link: to.cmp('Relay vs semiconductor switch', 'relay-vs-semiconductor') },
        activities: [to.cmp('Relay vs semiconductor switch', 'relay-vs-semiconductor'), to.lib('MOSFET', 'mosfet')],
        check: [
          { id: 'k1', type: 'mcq', prompt: 'A relay cannot be used for kilohertz-rate PWM switching mainly because...', options: ['its mechanical switching speed is orders of magnitude too slow', 'it has no coil', 'it conducts in only one direction', 'it requires no control signal'], answer: 0, explain: 'Millisecond mechanical movement versus microsecond switching needs.' },
          { id: 'k2', type: 'mcq', prompt: 'A relay/contactor provides isolation...', options: ['inherently, as part of its basic electromagnetic mechanism', 'only with an added isolated driver', 'never, under any circumstance', 'only in AC circuits'], answer: 0, explain: 'No direct conductive path exists between coil and contacts.' },
          { id: 'k3', type: 'mcq', prompt: 'A semiconductor switch, once fully on, has...', options: ['a real, continuous conduction loss (I²R_DS(on) or V_CE(sat)·I)', 'exactly zero conduction loss', 'infinite conduction loss', 'a mechanical wear-out mechanism identical to a relay\'s'], answer: 0, explain: 'Unlike a near-zero-resistance closed mechanical contact.' },
        ],
        summary: [
          'A relay/contactor switches far more slowly than a semiconductor switch, but provides inherent isolation and very low closed-contact conduction loss.',
          'A semiconductor switch has no mechanical wear-out mechanism and can switch orders of magnitude faster, but has real conduction loss and no inherent isolation.',
          'Neither technology is universally better; many real designs deliberately use both, each for the role it suits.',
          'Solid-state relays attempt to combine properties of both, trading some of each technology\'s pure advantages for a hybrid compromise.',
        ],
        homework: {
          id: 'F4.M4.L4.hw',
          title: 'Switching technology selection practice',
          brief: 'Choose the appropriate switching technology for stated applications.',
          tasks: [{ id: 'h1', type: 'mcq', prompt: 'An application needs to switch a load a few times per hour, with strong isolation and no concern for switching speed. The better-suited technology is...', options: ['a relay or contactor', 'a MOSFET switching at 50 kHz', 'an IGBT switching at 20 kHz', 'neither device family is appropriate'], answer: 0, explain: 'Low switching rate plus isolation strongly favours electromechanical switching.' }],
          written: [{ prompt: 'A design uses a contactor for the main battery disconnect and MOSFETs for the PWM bridge leg within the same inverter. Explain why this is a deliberate, sound engineering choice rather than an inconsistency, using this lesson\'s comparison.', model: 'The two switching functions have genuinely different requirements that favour different technologies: the battery disconnect switches rarely, needs strong isolation for safety, and benefits from the contactor\'s very low closed-contact conduction loss standing in the main current path continuously; the PWM bridge leg must switch at a rate many orders of magnitude beyond any mechanical device\'s capability, where only a semiconductor switch is fast enough and durable against the resulting switching-cycle count. Using the technology best suited to each specific role — rather than picking one technology and forcing it to do both jobs — is exactly the reasoning this lesson\'s comparison supports, not an inconsistency in the design.' }],
        },
      },
    },
  ],
  quiz: {
    pass: 0.8,
    questions: [
      { id: 'q1', type: 'mcq', prompt: 'A fuse interrupts a fault by...', options: ['its element melting open from I²R heating', 'an electromechanical trip that resets', 'reversing polarity', 'raising voltage'], answer: 0, explain: 'A sacrificial, heat-based mechanism.' },
      { id: 'q2', type: 'mcq', prompt: 'A fuse\'s breaking capacity must exceed...', options: ['the circuit\'s prospective fault current', 'only its own continuous current rating', 'the ambient temperature', 'the supply frequency'], answer: 0, explain: 'Otherwise it can fail destructively instead of interrupting safely.' },
      { id: 'q3', type: 'mcq', prompt: 'A breaker\'s magnetic trip mechanism responds to...', options: ['a severe short-circuit current, nearly instantaneously', 'a slow, gradual overload', 'low voltage', 'reversed polarity'], answer: 0, explain: 'The solenoid\'s field is only strong enough to trip directly at high current.' },
      { id: 'q4', type: 'mcq', prompt: 'A relay/contactor coil needs flyback suppression because...', options: ['its collapsing magnetic field induces a damaging voltage spike on de-energisation', 'it has no inductance', 'it always runs on DC only', 'it cannot be driven by semiconductors'], answer: 0, explain: 'The same inductive-kick reasoning as any inductive load.' },
      { id: 'q5', type: 'mcq', prompt: 'A relay cannot be used for kilohertz-rate PWM switching mainly because...', options: ['its mechanical switching speed is orders of magnitude too slow', 'it conducts in only one direction', 'it has no coil', 'it requires isolation'], answer: 0, explain: 'Millisecond mechanical movement versus microsecond switching needs.' },
      { id: 'q6', type: 'mcq', prompt: 'A semiconductor switch, unlike a relay/contactor, does not inherently provide...', options: ['galvanic isolation between control and switched circuit', 'any switching function at all', 'any conduction loss', 'any current rating'], answer: 0, explain: 'Isolation needs a deliberately added isolated driver or transformer.' },
    ],
  },
  assignment: {
    id: 'F4.M4.assignment',
    title: 'Protection and switching device reasoning',
    brief: 'Apply fuse/breaker selection and switching-technology comparison reasoning.',
    tasks: [
      { id: 'a1', type: 'mcq', prompt: 'A fuse correctly rated for continuous current but with excessive I²t let-through for its protected device will...', options: ['potentially fail to protect that device during a fault', 'always protect it perfectly', 'never blow', 'increase the device\'s voltage rating'], answer: 0, explain: 'I²t coordination is a separate, necessary check.' },
      { id: 'a2', type: 'mcq', prompt: 'A breaker\'s thermal trip, compared with its magnetic trip, responds...', options: ['more slowly, to a moderate sustained overload', 'faster, to any current level', 'only to reversed polarity', 'only above its breaking capacity'], answer: 0, explain: 'Thermal response time is inherently slower than the magnetic trip\'s.' },
      { id: 'a3', type: 'mcq', prompt: 'A relay/contactor provides isolation and low conduction loss but is unsuited to PWM-rate switching mainly because of...', options: ['its mechanical switching speed', 'its voltage rating', 'its coil resistance', 'its contact material colour'], answer: 0, explain: 'Mechanical movement cannot track PWM-rate switching.' },
    ],
    written: [{ prompt: 'A technician proposes replacing a worn relay, used to switch a load roughly once per second in a control application, with a MOSFET "to eliminate the wear problem". Explain what would be gained and what would need to be added to preserve the relay\'s other properties.', model: 'Switching once per second is well within a semiconductor switch\'s capability, and the substitution would indeed eliminate the mechanical contact-wear issue, since a MOSFET has no moving parts to wear from switching cycles. However, the relay\'s inherent galvanic isolation between its control signal and switched load would be lost, since a MOSFET\'s gate and drain-source path share a common reference — an isolated gate driver (or some other isolation method) would need to be deliberately added to preserve the isolation the original relay provided "for free". The substitution is reasonable, but it is not simply a drop-in replacement; the isolation requirement must be explicitly re-addressed, not assumed to carry over automatically.' }],
  },
  practicals: [
    {
      id: 'F4.M4.P1',
      title: 'Diagnose a blown fuse in the Repair Workshop',
      description: 'Confirm, on a real circuit-grounded fault, that you can apply the continuity-test and root-cause reasoning from this module.',
      link: to.repair('Blown fuse', 'rsc-02'),
      evidence: { kind: 'troubleshoot', project: 'rsc-02' },
    },
  ],
}
