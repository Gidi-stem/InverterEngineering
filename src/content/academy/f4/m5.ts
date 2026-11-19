import type { AcademyModule } from '../types'
import { to } from '../s1/links'

/** F4.M5 Control, sensing and thermal. */
export const F4_M5: AcademyModule = {
  id: 'F4.M5',
  title: 'Control, sensing and thermal',
  summary: 'PWM controllers and microcontrollers, voltage and current sensing, heat sinks and thermal resistance, and the PCBs, connectors and terminals that carry it all.',
  lessons: [
    {
      id: 'F4.M5.L1',
      title: 'PWM controllers and microcontrollers',
      minutes: 30,
      content: {
        objectives: [
          'Explain the role of a dedicated PWM controller versus a general-purpose microcontroller in generating switching signals.',
          'Describe closed-loop feedback control at a conceptual level: measuring the output and adjusting the switching pattern to correct it.',
          'Explain why a control fault (lost feedback, frozen firmware) can be just as serious as a power-stage fault.',
        ],
        introduction: `Every switching device and gate driver this module has covered needs a source of switching commands. This lesson covers where those commands come from: a dedicated [[pwm-controller|PWM controller]] or a [[microcontroller|microcontroller]], and the [[feedback|feedback]] loop that lets either one correct the output rather than simply running open-loop.`,
        lecture: `### Dedicated PWM controllers

A dedicated PWM controller IC (such as the SG3525 family referenced in the Component Library) is a purpose-built analog/mixed-signal chip that generates PWM switching signals from a reference and feedback input, with built-in features (soft-start, under-voltage lockout, dead-time generation) specifically for power conversion — simple to apply, robust, but limited to the control strategy its fixed internal architecture supports.

### Microcontroller-based control

A general-purpose microcontroller instead runs FIRMWARE (software) that computes the switching pattern, reads feedback via its analog-to-digital converter, and can implement essentially any control algorithm the firmware author writes — far more flexible (supporting sophisticated control strategies, communication, protection logic and user interfaces all in one chip) at the cost of needing correctly-written and maintained firmware, and introducing software as a new class of potential fault (a firmware bug or a frozen process can misbehave in ways a simpler dedicated PWM IC's fixed hardware logic cannot).

### Closed-loop feedback: measuring and correcting

Either approach typically operates in a **closed loop**: a sensor (F4.M5.L2) measures the actual output (voltage, current), the controller compares this measurement against the DESIRED (reference) value, and adjusts the switching pattern to reduce the difference — continuously correcting for load changes, input voltage variation, and component tolerance that an open-loop (fixed, uncorrected) switching pattern could not compensate for. This feedback loop is what keeps an inverter's output voltage and frequency accurate under varying load, not the switching devices or transformer alone.

### A control fault is a real fault, not a lesser one

Because the controller determines every switching decision, a fault in the control path — lost or corrupted feedback, a frozen firmware process, a damaged PWM controller IC — can be just as serious as a fault in the power stage itself: a controller that loses its feedback signal might drive the output to an uncontrolled, potentially damaging voltage, just as surely as a shorted MOSFET can damage downstream equipment. Diagnosing "no output" or "wrong output" fault symptoms genuinely requires considering the control path, not only the power devices, as a candidate cause.`,
        technical: `**Digital vs analog control.** A microcontroller's digital control loop runs at a finite sample rate and with finite numerical resolution — fast and precise enough for virtually all inverter applications with modern hardware, but a genuinely different set of design considerations (sampling, quantization, computation delay) from a dedicated analog PWM IC's continuous-time operation.

**Watchdog timers.** Microcontroller-based designs commonly include a watchdog timer: a separate hardware mechanism that resets the microcontroller if its firmware fails to "check in" periodically, specifically to recover from a frozen or hung firmware process without needing a human to intervene — a deliberate design response to the software-fault risk this lesson raises.`,
        diagrams: [{ id: 'feedback-loop', caption: 'A closed feedback loop: a sensor measures the actual output, the controller compares it against the desired reference, and adjusts the switching pattern to correct any difference.' }],
        formulas: [{ name: 'Closed-loop correction (concept)', expr: 'switching pattern ← f(reference − measured feedback)', where: [], note: 'A qualitative relationship: the controller adjusts output based on the error between desired and measured values, not a fixed formula applicable to every control scheme.' }],
        examples: [
          {
            title: 'Reasoning about a lost-feedback fault',
            problem: 'An inverter\'s output voltage rises well above its normal regulated value shortly after a voltage-sensing connector becomes loose. Explain the likely mechanism.',
            steps: ['With the feedback connector loose, the controller no longer receives an accurate measurement of the actual output voltage', 'A controller that reads an artificially LOW feedback value (consistent with an open/disconnected sensing path) would interpret this as "output too low" and increase switching duty to compensate'],
            answer: 'The controller, misled by the lost feedback signal into believing the output is too low, drives the switching pattern harder, actually raising the real output voltage well above normal — a classic lost-feedback runaway, and a genuine control-path fault, not a power-stage fault.',
          },
          {
            title: 'Dedicated PWM IC vs microcontroller trade-off',
            problem: 'A simple, fixed-function battery charger needs reliable, predictable control with minimal software risk. Which control approach better fits this requirement?',
            steps: ['A dedicated PWM controller IC\'s behaviour is fixed by its internal hardware design, with no firmware to write, debug or potentially hang', 'A microcontroller would add flexibility this simple, fixed-function application does not need, along with firmware-related fault risk it does not need either'],
            answer: 'A dedicated PWM controller IC is often the better fit here — simplicity and predictability matter more than the flexibility a microcontroller would add, for this specific, fixed-function application.',
          },
        ],
        applications: `The PWM controller and microcontroller test procedures in the Component Library, and any Repair Workshop scenario involving "no output" or "output out of regulation" symptoms, depend on exactly this control-path reasoning.`,
        mistakes: [
          { mistake: 'Assuming an output fault must be in the power stage (switches, transformer) rather than the control path.', correction: 'A lost feedback signal or a firmware fault can produce symptoms (wrong, unstable or absent output) that look identical to a power-stage fault — the control path must be considered too.' },
          { mistake: 'Treating a microcontroller as strictly superior to a dedicated PWM IC.', correction: 'A microcontroller adds flexibility and software-fault risk together; a fixed-function, simplicity-first application can genuinely be better served by a dedicated PWM IC.' },
          { mistake: 'Believing an inverter\'s output accuracy comes from the switching devices alone, without feedback.', correction: 'Feedback is what corrects for load changes, input variation and component tolerance — an open-loop design without it would drift under these changes.' },
        ],
        demo: { title: 'See the PWM controller entry', text: 'Compare the PWM controller and microcontroller entries\' roles in the Component Library.', link: to.lib('PWM controller', 'pwm-controller') },
        activities: [to.lib('PWM controller', 'pwm-controller'), to.lib('Microcontroller', 'microcontroller'), to.cmp('PWM controller vs microcontroller', 'pwm-vs-mcu')],
        check: [
          { id: 'k1', type: 'mcq', prompt: 'A dedicated PWM controller IC, compared with a microcontroller, is typically...', options: ['simpler and more predictable, but less flexible', 'always more flexible', 'incapable of generating PWM at all', 'only usable in digital circuits'], answer: 0, explain: 'Fixed hardware behaviour trades flexibility for predictability.' },
          { id: 'k2', type: 'mcq', prompt: 'A closed feedback loop corrects the switching pattern based on...', options: ['the difference between the desired reference and the measured actual output', 'the ambient room temperature only', 'a fixed, pre-programmed pattern that never changes', 'the switching frequency alone'], answer: 0, explain: 'Error (reference minus measurement) drives the correction.' },
          { id: 'k3', type: 'mcq', prompt: 'A lost or corrupted feedback signal can cause...', options: ['the output to run away toward an incorrect, potentially damaging value', 'no effect, since feedback is optional', 'the switching devices to automatically shut down safely in every case', 'only a cosmetic display error'], answer: 0, explain: 'The controller may drive the output based on a false reading, with no inherent limit.' },
        ],
        summary: [
          'A dedicated PWM controller IC offers simple, predictable, fixed-function control; a microcontroller offers flexible, firmware-defined control with added software-fault risk.',
          'Closed-loop feedback measures the actual output and corrects the switching pattern based on its difference from the desired reference.',
          'A control-path fault (lost feedback, frozen firmware) can produce symptoms as serious as a power-stage fault.',
          'Watchdog timers are a deliberate hardware response to the risk of a hung microcontroller firmware process.',
        ],
        homework: {
          id: 'F4.M5.L1.hw',
          title: 'Control path reasoning',
          brief: 'Reason about feedback and control-path faults.',
          tasks: [{ id: 'h1', type: 'mcq', prompt: 'An inverter\'s output voltage is found to be unstable and oscillating, with all power-stage devices testing healthy out of circuit. The most important remaining area to check is...', options: ['the feedback/control path', 'the enclosure paint finish', 'the AC output terminal labelling', 'nothing further, the fault cannot exist'], answer: 0, explain: 'With power devices confirmed healthy, the control path is the natural remaining candidate.' }],
          written: [{ prompt: 'A technician, finding an inverter\'s output badly out of regulation, immediately replaces several power-stage MOSFETs without testing them first, assuming the power stage must be at fault. The output remains out of regulation after the replacement. Explain what reasoning error was made, and what should have been checked first.', model: 'The technician assumed the fault\'s LOCATION (power stage) without first gathering evidence to support that assumption — replacing parts is not a diagnostic step, and doing so before confirming where the fault actually lies risks exactly this outcome: the real fault (which this lesson suggests could plausibly be in the feedback or control path, not the power stage at all) remains unaddressed, and the replaced parts were likely never faulty. The correct approach is to test the suspect devices out of circuit (or the control path\'s feedback signals) BEFORE replacing anything, letting the evidence identify the fault\'s actual location rather than guessing and replacing speculatively.' }],
        },
      },
    },
    {
      id: 'F4.M5.L2',
      title: 'Voltage and current sensing',
      minutes: 25,
      content: {
        objectives: [
          'Compare resistive-divider voltage sensing with shunt and Hall-effect current sensing.',
          'Explain why a sensor\'s own accuracy and scaling must be verified, not merely its presence.',
          'Explain how a sensing fault can masquerade as a power-stage or load fault.',
        ],
        introduction: `F4.M5.L1's feedback loop is only as trustworthy as the sensors feeding it. This lesson covers the two measurements every control loop in this platform depends on: [[voltage-sensor|voltage sensing]] and [[current-sensor|current sensing]].`,
        lecture: `### Voltage sensing

Measuring a voltage the controller can safely read (commonly a low-voltage ADC input, 0–3.3 V or 0–5 V) from a much higher real circuit voltage is most simply done with a resistive voltage divider (F2's divider principle), scaled so the real operating voltage maps to a safe ADC range. Isolated voltage sensing (where the measurement circuit must not share a direct conductive path with the high-voltage circuit, for safety or noise-isolation reasons) uses other techniques (isolation amplifiers, voltage-sensing transformers) beyond a simple divider.

### Current sensing: shunt versus Hall-effect

A **shunt resistor** (a precision, very low-value resistor placed in the current path) senses current by measuring the small voltage drop across it (V=IR) — simple, accurate and inexpensive, but NOT isolated (it sits directly in the current path) and introduces a small additional series resistance and associated power loss (F4.M1.L1). A [[hall-effect|Hall-effect]] current sensor instead measures the magnetic field around the conductor without breaking the circuit or adding series resistance, giving genuine galvanic isolation between the sensed circuit and the measurement electronics, at typically somewhat lower accuracy and higher cost than a well-designed shunt.

### Verifying scaling and accuracy, not just presence

A sensor that is electrically connected and producing SOME signal is not necessarily producing a CORRECT signal: a voltage-divider ratio that has drifted (from a resistor aging out of tolerance, F4.M1.L1), a shunt whose resistance has changed, or a Hall-effect sensor whose zero-current offset has drifted can each cause the controller to act on a subtly WRONG measurement while appearing, superficially, to be working — exactly the scenario the Component Library's sensing test procedures (vsense-scale, hall-zero) are designed to catch.

### Sensing faults can masquerade as other faults

A drifted voltage or current sensor feeding bad information into the feedback loop of F4.M5.L1 can cause the controller to drive the power stage incorrectly, producing symptoms (wrong output voltage, apparent overcurrent tripping under normal load) that look exactly like a power-stage or load fault — correctly diagnosing this requires checking the SENSOR'S OWN accuracy, independent of the power stage, not just assuming the power stage must be the cause because that is where the symptom is observed.`,
        technical: `**Sensor bandwidth.** A current sensor's bandwidth (how fast it can track a changing current) matters for protection functions expected to respond quickly to a fast-developing fault — a sensor too slow to track a rapidly rising short-circuit current can delay the very protection response it is meant to trigger, a genuine design consideration beyond steady-state accuracy alone.

**Common-mode rejection.** An isolated sensing technique's ability to reject noise or voltage common to both its inputs (common-mode rejection) matters particularly in high-voltage, high-dV/dt switching environments, where a poorly isolated or poorly filtered sensing path can pick up switching noise that corrupts the measurement the control loop relies on.`,
        diagrams: [{ id: 'feedback-loop', caption: 'Voltage and current sensors feeding the same closed feedback loop that F4.M5.L1 introduced, each needing independent accuracy verification.' }],
        formulas: [{ name: 'Shunt current sensing', expr: 'I = V_shunt / R_shunt', where: [['I', 'measured current', 'A'], ['V_shunt', 'voltage drop across the shunt', 'V'], ['R_shunt', 'shunt resistance', 'Ω']] }],
        examples: [
          {
            title: 'Interpreting a shunt measurement',
            problem: 'A 10 mΩ shunt shows a 0.18 V drop. What current does this represent?',
            steps: ['I = V/R', '= 0.18/0.01'],
            answer: '= 18 A.',
          },
          {
            title: 'Diagnosing a masquerading sensing fault',
            problem: 'A circuit repeatedly trips its overcurrent protection under what the load clearly indicates is a normal, moderate load. Power-stage devices test healthy out of circuit. Suggest where to look next.',
            steps: ['A normal-seeming load producing an apparent overcurrent trip suggests the MEASUREMENT, not necessarily the actual current, may be wrong', 'A drifted current sensor (shunt resistance changed, or a Hall-effect sensor\'s zero-offset drifted) could report a falsely high current to the controller even though the real current is normal'],
            answer: 'The current sensor\'s own accuracy (its scaling/zero-offset against a known reference) should be checked next — a sensing fault reporting falsely high current would exactly produce this symptom while leaving the power stage genuinely healthy.',
          },
        ],
        applications: `The voltage-sensor scaling check and the Hall-effect zero-offset check in the Component Library are exactly the verification this lesson describes, applied on the bench.`,
        mistakes: [
          { mistake: 'Assuming a sensor reading something is the same as the sensor reading correctly.', correction: 'Scaling drift or zero-offset drift can leave a sensor producing a plausible-looking but wrong signal — verify against a known reference, not just presence of a signal.' },
          { mistake: 'Treating a shunt and a Hall-effect sensor as simply interchangeable.', correction: 'A shunt is simpler and more accurate but not isolated and adds series loss; a Hall-effect sensor is isolated and lossless in the current path but typically less accurate and more costly.' },
          { mistake: 'Diagnosing an apparent overcurrent trip by assuming the power stage must be drawing too much current.', correction: 'A drifted current sensor can report a false overcurrent reading while the actual current is normal — check sensor accuracy independently.' },
        ],
        demo: { title: 'Run a sensor scaling check', text: 'Verify a voltage sensor\'s scaling against a known reference voltage.', link: to.proc('Voltage sensor scaling check', 'voltage-sensor', 'vsense-scale') },
        activities: [to.proc('Voltage sensor scaling', 'voltage-sensor', 'vsense-scale'), to.proc('Hall-effect zero check', 'current-sensor', 'hall-zero'), to.cmp('Voltage vs current sensing', 'voltage-vs-current-sensing')],
        check: [
          { id: 'k1', type: 'numeric', prompt: 'Current (A) from a 20 mΩ shunt showing 0.24 V?', answer: 12, tol: 0.02, unit: 'A', explain: 'I=0.24/0.02=12 A.' },
          { id: 'k2', type: 'mcq', prompt: 'A shunt resistor, compared with a Hall-effect sensor, is typically...', options: ['simpler and more accurate, but not isolated and adds series loss', 'isolated and lossless but less accurate', 'always more expensive', 'incapable of measuring DC current'], answer: 0, explain: 'A direct series resistance measurement, not isolated.' },
          { id: 'k3', type: 'mcq', prompt: 'A current sensor with drifted zero-offset can cause...', options: ['a false overcurrent (or undercurrent) reading, even with genuinely normal load current', 'no effect on the control loop', 'the load to physically draw more current', 'the power stage to overheat regardless of actual current'], answer: 0, explain: 'A wrong measurement feeds a wrong decision into the control loop.' },
        ],
        summary: [
          'Voltage sensing commonly uses a resistive divider; current sensing uses a shunt (simple, accurate, not isolated) or a Hall-effect sensor (isolated, lossless, less accurate).',
          'A sensor producing some signal is not the same as producing a correct one — scaling and zero-offset must be independently verified.',
          'A drifted sensor can feed wrong information into the feedback loop, producing symptoms that look like a power-stage or load fault.',
          'Diagnosing such symptoms requires checking the sensor\'s own accuracy, not only the power stage where the symptom appears.',
        ],
        homework: {
          id: 'F4.M5.L2.hw',
          title: 'Sensing fault reasoning',
          brief: 'Apply shunt calculations and masquerading-fault reasoning.',
          tasks: [{ id: 'h1', type: 'numeric', prompt: 'Current (A) from a 5 mΩ shunt showing 0.15 V?', answer: 30, tol: 0.02, unit: 'A', explain: 'I=0.15/0.005=30 A.' }],
          written: [{ prompt: 'A battery charger\'s controller reports a battery voltage reading that is consistently 2 V higher than a trusted handheld meter measures at the same terminals. Explain the likely fault category, and why simply recalibrating the displayed number in software (without further investigation) would be a risky fix.', model: 'A consistent, fixed offset between the controller\'s reading and a trusted reference strongly suggests a voltage-sensing scaling or offset fault (for example, a divider resistor drifted out of tolerance) rather than an actual battery voltage discrepancy, since the true battery voltage is the same regardless of which instrument reads it. Simply adjusting the software\'s displayed number to match the trusted meter would mask the symptom without fixing the underlying sensing fault, and critically, the CONTROLLER\'s feedback loop (F4.M5.L1) uses the raw, uncorrected sensor reading to make its actual charging decisions — a software display offset would not fix the wrong value the control loop itself is acting on, leaving the charger still making decisions based on an inaccurate measurement even though the displayed number now looks right.' }],
        },
      },
    },
    {
      id: 'F4.M5.L3',
      title: 'Thermal management: heat sinks and fans',
      minutes: 30,
      content: {
        objectives: [
          'Apply thermal resistance to estimate a device\'s junction temperature from its total loss and ambient temperature.',
          'Explain how forced-air cooling (a fan) changes the thermal resistance a heat sink achieves.',
          'Explain derating and why running a device below its absolute maximum rating is standard, not conservative, practice.',
        ],
        introduction: `F4.M2.L7 showed every switching device dissipates real power as heat. This lesson covers where that heat actually goes: [[thermal-resistance|thermal resistance]], [[heat-sink|heat sinks]] and [[airflow|forced-air cooling]], and the [[derating|derating]] discipline that ties them together.`,
        lecture: `### Thermal resistance: a circuit analogy

Heat flows from a device's junction, through its package, through a heat sink, and finally to the surrounding air — and this path can be modelled, very usefully, exactly like an electrical circuit: temperature difference plays the role of voltage, heat flow (power) plays the role of current, and [[thermal-resistance|thermal resistance]] (°C/W) plays the role of electrical resistance. Junction temperature rise above ambient is then simply total power loss multiplied by the TOTAL thermal resistance of the whole path (junction-to-case, case-to-sink, sink-to-ambient, summed in series exactly like series electrical resistances, F4.M1.L1's series-resistor reasoning applied to heat instead of current).

### Heat sinks and forced air

A heat sink increases the surface area in contact with the surrounding air, lowering the sink-to-ambient thermal resistance compared with the bare device package alone. Adding a fan (forced-air cooling) lowers this thermal resistance FURTHER, by continuously replacing the warmed air near the heat sink's surface with cooler air rather than relying on natural convection alone — a heat sink's rated thermal resistance is typically quoted for BOTH natural convection and one or more specific airflow rates, since the same heat sink genuinely performs very differently under each condition.

### Derating: margin is standard practice, not caution for its own sake

Running a device meaningfully below its absolute maximum rated junction temperature (and below its maximum current/voltage ratings) — [[derating|derating]] — is standard engineering practice, not excessive caution: component tolerance, ambient temperature variation, airflow degradation over the product's life (dust accumulation, fan wear), and the accuracy limits of the thermal model itself all consume some of the nominal margin between normal operation and the absolute maximum rating. A design that runs right at the edge of a device's maximum rating under ideal, freshly-manufactured conditions has effectively no margin left for any of these real-world variations, and is considered poor practice precisely because of this, not merely "less safe than ideal".`,
        technical: `**Thermal runaway risk.** Because several semiconductor parameters (leakage current, F4.M2.L9; R_DS(on), F4.M2.L4) worsen with rising temperature, inadequate cooling can create a positive feedback loop — [[thermal-runaway|thermal runaway]] — where rising temperature increases loss, which raises temperature further, potentially destroying the device well before its nominal steady-state loss calculation alone would suggest, which is exactly why cooling design margin matters more than a single steady-state calculation might imply.

**Fan reliability as a wear-out component.** A cooling fan is itself a mechanical, wearing component (bearings, moving blades) with a finite service life — a fan failure silently removes the forced-air cooling a thermal design was relying on, which is why some designs include fan-fault detection (tachometer feedback, airflow sensing) rather than assuming the fan will simply always be running.`,
        diagrams: [{ id: 'thermal-network', caption: 'The series thermal-resistance path from a device\'s junction, through its case and heat sink, to the surrounding ambient air — modelled exactly like a series electrical circuit.' }],
        formulas: [{ name: 'Junction temperature rise', expr: 'T_j = T_a + P · R_th(total)', where: [['T_j', 'junction temperature', '°C'], ['T_a', 'ambient temperature', '°C'], ['P', 'total device power loss', 'W'], ['R_th(total)', 'total junction-to-ambient thermal resistance', '°C/W']] }],
        examples: [
          {
            title: 'Estimating junction temperature',
            problem: 'A device dissipates 10 W with a total thermal resistance of 3 °C/W, at an ambient of 35 °C. Estimate junction temperature.',
            steps: ['T_j = T_a + P × R_th', '= 35 + 10×3'],
            answer: '= 65 °C.',
          },
          {
            title: 'Checking margin against a maximum rating',
            problem: 'The same device has a maximum rated junction temperature of 150 °C. Comment on the design\'s margin, and on what happens if ambient rises to 50 °C on a hot day with the same loss and thermal resistance.',
            steps: ['At 35 °C ambient: T_j = 65 °C, which is 85 °C below the 150 °C maximum — a generous margin', 'At 50 °C ambient: T_j = 50 + 10×3 = 80 °C, still 70 °C below maximum'],
            answer: 'The design retains a comfortable margin even at the higher ambient — exactly the kind of margin derating is meant to preserve against real-world variation, rather than designing to only just meet the rating at the lowest expected ambient.',
          },
        ],
        applications: `The heat-sink/fan test procedures and the Build Your Own Inverter projects' thermal sizing both depend directly on this series thermal-resistance model and derating discipline.`,
        mistakes: [
          { mistake: 'Calculating junction temperature using only the heat sink\'s thermal resistance, ignoring junction-to-case resistance.', correction: 'All series thermal-resistance stages (junction-to-case, case-to-sink, sink-to-ambient) must be summed for an accurate total, exactly as series electrical resistances are summed.' },
          { mistake: 'Assuming a heat sink\'s rated thermal resistance applies regardless of whether a fan is present.', correction: 'The same heat sink has a meaningfully different (higher) thermal resistance under natural convection alone than with forced air — use the rating that matches the actual cooling condition.' },
          { mistake: 'Designing to just meet the maximum junction temperature rating under ideal, fresh conditions.', correction: 'Derating margin accounts for component tolerance, ambient variation and cooling degradation over the product\'s life — running at the theoretical edge leaves no real-world margin.' },
        ],
        demo: { title: 'Test a heat sink and fan', text: 'Run the heat-sink isolation check and the fan bench test.', link: to.proc('Heat sink isolation check', 'heat-sink', 'heatsink-isolation') },
        activities: [to.proc('Heat sink isolation check', 'heat-sink', 'heatsink-isolation'), to.proc('Fan bench test', 'cooling-fan', 'fan-bench'), to.cmp('Heat sink vs fan', 'heatsink-vs-fan')],
        check: [
          { id: 'k1', type: 'numeric', prompt: 'Junction temperature (°C) for P=8 W, R_th=4 °C/W, T_a=30 °C?', answer: 62, tol: 0.02, unit: '°C', explain: '30+8×4=62 °C.' },
          { id: 'k2', type: 'mcq', prompt: 'Adding forced-air cooling (a fan) to a heat sink...', options: ['lowers its effective thermal resistance compared with natural convection alone', 'has no effect on thermal resistance', 'always raises thermal resistance', 'only matters for AC circuits'], answer: 0, explain: 'Continuously replacing warmed air improves heat removal.' },
          { id: 'k3', type: 'mcq', prompt: 'Derating a device below its absolute maximum rating is considered...', options: ['standard practice, preserving margin for real-world variation', 'unnecessary caution with no real justification', 'only relevant to overvoltage, never temperature', 'a sign of a poor design'], answer: 0, explain: 'Margin accounts for tolerance, ambient variation and degradation over life.' },
        ],
        summary: [
          'Heat flow from junction to ambient can be modelled as a series thermal-resistance circuit, directly analogous to electrical resistance.',
          'Junction temperature rise equals total power loss times total junction-to-ambient thermal resistance.',
          'Forced-air cooling lowers effective thermal resistance compared with natural convection alone, for the same heat sink.',
          'Derating (running below absolute maximum ratings) preserves margin for component tolerance, ambient variation and cooling degradation over the product\'s life.',
        ],
        homework: {
          id: 'F4.M5.L3.hw',
          title: 'Thermal calculation practice',
          brief: 'Apply the junction-temperature formula and margin reasoning.',
          tasks: [{ id: 'h1', type: 'numeric', prompt: 'Junction temperature (°C) for P=12 W, R_th=2.5 °C/W, T_a=40 °C?', answer: 70, tol: 0.02, unit: '°C', explain: '40+12×2.5=70 °C.' }],
          written: [{ prompt: 'An inverter that has run reliably for two years begins shutting down on thermal protection during hot summer afternoons, with no change to its load. Using this lesson\'s ideas, suggest a plausible explanation that does not require assuming a sudden component failure.', model: 'A design that originally had adequate derating margin under its original ambient and cooling conditions can lose that margin gradually over time without any single component failing outright: dust accumulation on the heat sink and fan blades raises the effective thermal resistance of the cooling path, and a fan\'s bearings wearing over two years of service can reduce its airflow below its original rating — both effects raise junction temperature for the SAME power loss and ambient temperature as before. Combined with naturally higher ambient temperatures on hot summer afternoons, a design that had comfortable margin at installation could gradually lose enough of that margin to begin tripping thermal protection, without any individual power component having failed — cleaning the heat sink/fan and checking fan performance would be a reasonable first investigation before suspecting a power-stage fault.' }],
        },
      },
    },
    {
      id: 'F4.M5.L4',
      title: 'PCBs, connectors and terminals',
      minutes: 25,
      content: {
        objectives: [
          'Explain how a PCB trace, a connector and a high-current terminal can each independently develop a high-resistance fault.',
          'Apply a voltage-drop-under-load test to find a high-resistance joint.',
          'Explain why a loose or corroded connection is often more dangerous, not less, than a dead short.',
        ],
        introduction: `This closing lesson covers the humble, easily-overlooked components that carry every signal and every amp of current between all the others F4 has covered: the [[pcb|PCB]] and its [[connector|connectors]] and terminals — collectively one of the most common real-world sources of an inverter fault.`,
        lecture: `### PCB traces: thin copper, real limits

A printed circuit board carries both power and signal connections as thin copper tracks etched onto an insulating board. A trace is rated for a specific current (set by its width and copper thickness) and, like any conductor, dissipates I²R heat — a trace that is too narrow for the current it carries, or one that has been weakened by age, corrosion, or an earlier overcurrent event, can develop a high-resistance "hot spot" that heats, discolours the board, and in a severe case chars and opens completely. Repeated thermal cycling (heating under load, cooling when idle) can also crack a trace or a solder joint over time, even without ever exceeding the trace's rated current in any single event.

### Connectors and terminals: where most real joints actually fail

A [[connector|connector]] or a bolted/crimped terminal joins two conductors mechanically, and this mechanical joint — not the conductors themselves — is overwhelmingly the most common real-world point of failure in an otherwise healthy circuit: a connector that has loosened (from vibration, thermal cycling, or simply not being torqued correctly when installed) or corroded (from moisture, or dissimilar metals in contact) develops increased contact resistance at exactly the joint, which heats under load (I²R again) in a way that a simple no-load continuity check will completely miss, since the joint can look perfectly continuous with no current flowing through it.

### Finding a high-resistance joint: voltage drop under load

The standard test for exactly this fault is a voltage-drop measurement ACROSS the joint WHILE IT IS CARRYING LOAD CURRENT: a healthy joint shows only a few millivolts of drop even at substantial current; a degraded joint shows a much larger drop, directly revealing its elevated resistance — and, combined with the current flowing, the real power being dissipated AT that joint (P=I×V_drop), which is often the more useful number for judging how serious the fault actually is.

### Why a loose connection can be more dangerous than a dead short

A dead short is usually caught quickly by protection devices (F4.M4) sized for exactly that fault current. A loose or corroded connection, by contrast, often draws CURRENT WITHIN NORMAL RANGE for the circuit (the connection still passes current, just with excess resistance) — meaning no fuse or breaker trips, while the joint itself quietly heats, sometimes for a long time, as a genuinely dangerous, undetected fire and failure risk that normal overcurrent protection is not designed to catch at all.`,
        technical: `**Dissimilar-metal corrosion.** Joining two different metals (such as copper and aluminium) directly, without a compatible anti-corrosion compound or plating, can accelerate galvanic corrosion at the joint in the presence of moisture — a specific, well-known cause of connector/terminal degradation beyond simple age or vibration.

**Torque specifications.** Bolted terminals (battery terminals, DC input/output lugs) commonly specify a torque value for a reason: under-torquing leaves excess contact resistance from the start; over-torquing can deform or crack a lug or a PCB pad — both ends of the torque range cause the same underlying fault (a poor mechanical/electrical joint), for different reasons.`,
        diagrams: [{ id: 'circuit-loop', caption: 'A voltage-drop-under-load measurement across a suspect connector or terminal joint, revealing elevated resistance that a no-load continuity check would miss entirely.' }],
        formulas: [{ name: 'Joint heating from contact resistance', expr: 'P_joint = I · V_drop', where: [['P_joint', 'power dissipated at the joint', 'W'], ['I', 'current flowing through the joint', 'A'], ['V_drop', 'voltage drop measured across the joint under that load', 'V']] }],
        examples: [
          {
            title: 'Interpreting a voltage-drop reading',
            problem: 'A battery terminal shows a 4 mV drop at 70 A (healthy reference) versus a 180 mV drop at the same 70 A on a suspect terminal. Compute the power dissipated at the suspect joint and compare.',
            steps: ['Healthy: P = 70 × 0.004 = 0.28 W', 'Suspect: P = 70 × 0.18 = 12.6 W'],
            answer: 'The suspect joint dissipates roughly 45 times more power than the healthy reference at the same current — a genuinely dangerous, localised heating fault that a simple continuity check (both would read as "continuous") would never reveal.',
          },
          {
            title: 'Why a loose connection evades normal overcurrent protection',
            problem: 'Explain why a fuse correctly sized for a circuit\'s normal current does not protect against a loose connection in that same circuit.',
            steps: ['The circuit\'s actual CURRENT remains within the fuse\'s normal operating range — the load still draws its usual current through the (resistive) joint', 'The fuse only responds to current magnitude, not to where in the circuit that current is being dissipated as unwanted heat'],
            answer: 'The fuse sees nothing abnormal in terms of current and has no way to detect that some of the circuit\'s normal current is being wastefully (and dangerously) dissipated as heat at a bad joint rather than reaching the load — a fundamentally different fault signature from the overcurrent conditions fuses and breakers are designed to catch.',
          },
        ],
        applications: `The battery-terminal, DC-input-lug, AC-output-terminal and main-PCB test procedures in the Component Library are exactly this voltage-drop-under-load technique, applied to the specific joints most likely to degrade in a real inverter installation.`,
        mistakes: [
          { mistake: 'Confirming a connector or terminal is healthy with a no-load continuity check alone.', correction: 'A degraded joint can still read as fully continuous with no current flowing — test voltage drop UNDER LOAD to reveal elevated resistance.' },
          { mistake: 'Assuming a connection fault will be caught by the circuit\'s normal overcurrent protection.', correction: 'A loose or corroded joint typically does not raise the circuit\'s overall current beyond normal, so fuses and breakers do not respond to it at all — a fundamentally different fault type.' },
          { mistake: 'Over-torquing a terminal "to be extra safe" against loosening.', correction: 'Over-torquing can itself damage the lug or PCB pad, causing the same class of high-resistance fault from the opposite direction — torque to the specified value, not beyond it.' },
        ],
        demo: { title: 'Run a terminal voltage-drop check', text: 'Measure voltage drop across a battery terminal under load.', link: to.proc('Terminal voltage-drop check', 'battery-terminals', 'terminal-drop') },
        activities: [to.proc('Battery terminal check', 'battery-terminals', 'terminal-drop'), to.proc('PCB trace inspection', 'main-pcb', 'pcb-inspect'), to.proc('AC output terminal check', 'ac-output', 'ac-terminals')],
        check: [
          { id: 'k1', type: 'mcq', prompt: 'A degraded (loose or corroded) connector most reliably shows up as...', options: ['elevated voltage drop across the joint when tested under load', 'an open circuit on a simple no-load continuity check', 'a change in colour visible without disassembly', 'a change in the circuit\'s overall current draw'], answer: 0, explain: 'No-load continuity can look perfectly healthy even with significant contact resistance.' },
          { id: 'k2', type: 'numeric', prompt: 'Power dissipated (W) at a joint with 50 mV drop at 60 A?', answer: 3, tol: 0.02, unit: 'W', explain: 'P=I×V=60×0.05=3 W.' },
          { id: 'k3', type: 'mcq', prompt: 'A loose connection typically evades normal fuse/breaker protection because...', options: ['the circuit\'s overall current stays within normal range, even though heat is wasted at the joint', 'fuses specifically detect loose connections', 'loose connections always draw zero current', 'breakers trip instantly on any resistance increase'], answer: 0, explain: 'Protection devices respond to current magnitude, not to where heat is being wastefully dissipated.' },
        ],
        summary: [
          'PCB traces and connectors/terminals can each independently develop high-resistance faults from aging, corrosion, vibration or incorrect torque.',
          'A voltage-drop measurement across a joint while it carries load current reveals elevated resistance that a no-load continuity check completely misses.',
          'Joint heating power (P=I×V_drop) is often the more useful figure than resistance alone for judging how serious a connection fault is.',
          'A loose or corroded connection typically evades normal overcurrent protection, since it does not raise the circuit\'s overall current — making it a genuinely dangerous, often-undetected fault type.',
        ],
        homework: {
          id: 'F4.M5.L4.hw',
          title: 'Connector and terminal fault practice',
          brief: 'Apply voltage-drop-under-load reasoning.',
          tasks: [{ id: 'h1', type: 'numeric', prompt: 'Power dissipated (W) at a joint with 120 mV drop at 40 A?', answer: 4.8, tol: 0.02, unit: 'W', explain: 'P=40×0.12=4.8 W.' }],
          written: [{ prompt: 'A battery terminal tests as fully continuous (0 Ω-range reading) with the battery disconnected and no load applied, yet the inverter it supplies intermittently shuts down under heavy load. Explain why the no-load test did not catch the fault, and what test should be run instead.', model: 'A no-load continuity test only confirms that SOME conductive path exists across the joint; it cannot reveal a joint whose resistance has increased from a healthy near-zero value to something still low enough to read as "continuous" on a basic meter range, but high enough to cause significant I²R heating and voltage drop once real load current flows through it. This is exactly the fault signature a loose or lightly corroded terminal produces — fine at no load, problematic under the higher current that heavy load demands. A voltage-drop-under-load test (measuring the actual millivolt drop across the joint while the inverter is delivering its heavy load current) is the correct test, since it directly reveals the elevated resistance that only becomes significant once real current is flowing.' }],
        },
      },
    },
  ],
  quiz: {
    pass: 0.8,
    questions: [
      { id: 'q1', type: 'mcq', prompt: 'A closed feedback loop corrects the switching pattern based on...', options: ['the difference between desired reference and measured output', 'ambient temperature only', 'a fixed pattern that never changes', 'switching frequency alone'], answer: 0, explain: 'Error-driven correction is the basis of closed-loop control.' },
      { id: 'q2', type: 'numeric', prompt: 'Current (A) from a 10 mΩ shunt showing 0.3 V?', answer: 30, tol: 0.02, unit: 'A', explain: 'I=0.3/0.01=30 A.' },
      { id: 'q3', type: 'mcq', prompt: 'A current sensor with drifted zero-offset can cause...', options: ['a false over/undercurrent reading despite normal real current', 'no effect on the system', 'the load to change its real current', 'the fuse to change rating'], answer: 0, explain: 'The control loop acts on the wrong measurement.' },
      { id: 'q4', type: 'numeric', prompt: 'Junction temperature (°C) for P=15 W, R_th=2 °C/W, T_a=25 °C?', answer: 55, tol: 0.02, unit: '°C', explain: '25+15×2=55 °C.' },
      { id: 'q5', type: 'mcq', prompt: 'Derating below absolute maximum ratings is...', options: ['standard practice preserving real-world margin', 'unnecessary caution', 'only relevant to voltage, never temperature', 'a sign of poor design'], answer: 0, explain: 'Margin accounts for tolerance, ambient variation and degradation.' },
      { id: 'q6', type: 'mcq', prompt: 'A degraded connector or terminal is most reliably found by...', options: ['a voltage-drop measurement across the joint under load', 'a no-load continuity check alone', 'visual inspection only', 'checking the circuit\'s overall current draw'], answer: 0, explain: 'No-load continuity can look healthy even with significant contact resistance.' },
    ],
  },
  assignment: {
    id: 'F4.M5.assignment',
    title: 'Control, sensing and thermal integration',
    brief: 'Apply sensing, thermal and fault-tracing reasoning together.',
    tasks: [
      { id: 'a1', type: 'numeric', prompt: 'Current (A) from a 15 mΩ shunt showing 0.45 V?', answer: 30, tol: 0.02, unit: 'A', explain: '0.45/0.015=30 A.' },
      { id: 'a2', type: 'numeric', prompt: 'Junction temperature (°C) for P=6 W, R_th=5 °C/W, T_a=32 °C?', answer: 62, tol: 0.02, unit: '°C', explain: '32+6×5=62 °C.' },
      { id: 'a3', type: 'mcq', prompt: 'A healthy power stage with a collapsed near-zero output most likely indicates...', options: ['a control/feedback fault driving duty cycle incorrectly low', 'a shorted MOSFET', 'a blown fuse', 'an oversized heat sink'], answer: 0, explain: 'A control-path explanation fits better than a power-stage one here.' },
    ],
    written: [{ prompt: 'A system exhibits intermittent shutdowns that correlate with both high ambient temperature AND high load, but never with either alone. Using this module\'s ideas, explain why this specific combination (not either factor alone) is diagnostically meaningful, and what subsystem it points toward.', model: 'Junction temperature rise is the product of power loss and thermal resistance, added to ambient temperature (T_j = T_a + P·R_th) — both high ambient AND high load independently push this sum higher, so a design with just enough margin to handle EITHER condition alone comfortably could still exceed its thermal protection threshold only when BOTH combine, exactly matching the reported pattern. This points toward thermal management (F4.M5.L3) being at or near its design margin — rather than a sensing, control or power-stage component fault, which would typically not depend on this specific combined-condition pattern — and suggests investigating cooling performance (heat sink condition, fan function, derating margin) rather than immediately suspecting a failed component.' }],
  },
  practicals: [
    {
      id: 'F4.M5.P1',
      title: 'Thermal and sensing calculation set',
      description: 'Apply shunt current sensing and junction-temperature calculations together. All answers must be correct.',
      task: {
        id: 'f4-thermal-sensing',
        kind: 'calc',
        title: 'Sensing and thermal calculations',
        brief: 'A MOSFET dissipates 9 W total loss with a junction-to-ambient thermal resistance of 3.5 °C/W at a 30 °C ambient. Its current is measured by an 8 mΩ shunt showing a 0.24 V drop.',
        questions: [
          { id: 'c1', type: 'numeric', prompt: 'Junction temperature (°C)?', answer: 61.5, tol: 0.02, unit: '°C', explain: '30+9×3.5=61.5 °C.' },
          { id: 'c2', type: 'numeric', prompt: 'Measured current (A) from the shunt?', answer: 30, tol: 0.02, unit: 'A', explain: '0.24/0.008=30 A.' },
          { id: 'c3', type: 'mcq', prompt: 'If the shunt\'s true resistance has drifted up by 20% without recalibration, the controller will believe current is...', options: ['lower than it actually is', 'higher than it actually is', 'unaffected', 'exactly zero'], answer: 0, explain: 'I=V/R: a higher R for the same V reads as a lower computed current, so the controller under-reads the true current.' },
        ],
        explain: 'Thermal margin and sensing accuracy are independent checks that both feed into whether a system runs safely and is correctly controlled — this task exercises both calculations together.',
      },
      evidence: { kind: 'task', id: 'f4-thermal-sensing' },
    },
    {
      id: 'F4.M5.P2',
      title: 'Diagnose a gate-driver / control-path fault in the Repair Workshop',
      description: 'Confirm, on a real circuit-grounded fault, that you can apply the cross-subsystem fault-tracing reasoning from this module.',
      link: to.repair('Gate-driver signal lost', 'rsc-10'),
      evidence: { kind: 'troubleshoot', project: 'rsc-10' },
    },
  ],
}
