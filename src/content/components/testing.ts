import type { InstrumentReading, TestProcedure } from '../../types/domain'

/**
 * Test procedures for every component, using the virtual instruments in content/instruments.
 * Readings are REPRESENTATIVE values for teaching, not datasheet limits for a specific part:
 * real limits come from the datasheet of the actual part.
 */
const ok = (condition: string, display: string, meaning: string): InstrumentReading => ({ condition, display, meaning, good: true })
const bad = (condition: string, display: string, meaning: string): InstrumentReading => ({ condition, display, meaning, good: false })

export const TEST_PROCEDURES: Record<string, TestProcedure[]> = {
  mosfet: [
    {
      id: 'mosfet-diode',
      title: 'Out-of-circuit MOSFET check (diode test and gate charge)',
      purpose: 'Confirms a suspected shorted or open switch after a fuse has blown or an output half-cycle is missing.',
      safety: ['isolate', 'discharge', 'esd'],
      extraSafety: ['Remove the MOSFET from the board: parallel parts make in-circuit readings unreliable.'],
      steps: [
        { instruction: 'Measure the body diode.', instrument: 'dmm', setting: 'Diode test', connection: 'Red on S, black on D', readings: [ok('Good', '0.52 V', 'Body diode conducts normally.'), bad('Shorted D-S', '0.00 V', 'Drain-source short: replace.'), bad('Open', 'OL', 'No diode path: internal open circuit.')] },
        { instruction: 'Check the gate is insulated.', instrument: 'dmm', setting: 'Diode test', connection: 'G to S, then G to D (both directions)', readings: [ok('Good', 'OL', 'Gate oxide intact.'), bad('Gate punctured', '0.0x V', 'Gate shorted, usually after a voltage spike: replace (and check the gate driver).')] },
        { instruction: 'Charge the gate briefly (red on G, black on S), then measure D-S.', instrument: 'dmm', setting: 'Diode test', connection: 'Red on D, black on S', readings: [ok('Good', '0.0x V', 'Channel turned on by the gate charge: switch works.'), bad('Will not turn on', 'OL', 'Gate cannot enhance the channel: replace.')] },
      ],
    },
  ],
  igbt: [
    {
      id: 'igbt-check',
      title: 'IGBT check with diode test and bench supply',
      purpose: 'Confirms a failed MPPT charger switch.',
      safety: ['isolate', 'pv-daylight', 'discharge', 'esd', 'current-limit'],
      steps: [
        { instruction: 'Measure the co-packaged diode.', instrument: 'dmm', setting: 'Diode test', connection: 'Red on E, black on C', readings: [ok('Good', '0.45 V', 'Anti-parallel diode conducts.'), bad('Shorted C-E', '0.00 V', 'Collector-emitter short: replace.')] },
        { instruction: 'Turn the IGBT on with 15 V on the gate through a 1 kΩ resistor, then measure C-E with a load resistor from the bench supply.', instrument: 'psu', setting: '15 V, 100 mA limit', connection: 'Gate +15 V via 1 kΩ, emitter to 0 V', readings: [ok('Good', 'V_CE ≈ 1 V', 'Device conducts when driven.'), bad('Will not turn on', 'V_CE = supply', 'No conduction: replace.')] },
      ],
    },
  ],
  transformer: [
    {
      id: 'xfmr-winding',
      title: 'Winding resistance and insulation test',
      purpose: 'Finds open or shorted windings and insulation breakdown.',
      safety: ['isolate', 'discharge', 'heavy'],
      extraSafety: ['The insulation tester produces 500 V: keep hands clear and discharge the winding after the test.'],
      steps: [
        { instruction: 'Measure secondary winding resistance.', instrument: 'dmm', setting: 'Ω, 200 Ω range', connection: 'S1 to S2', readings: [ok('Good', '0.8 Ω', 'Continuous winding (compare with a known-good unit).'), bad('Open winding', 'OL', 'Broken winding: no output possible.')] },
        { instruction: 'Measure insulation primary-to-secondary and windings-to-core.', instrument: 'insulation', setting: '500 V DC', connection: 'P1 to S1; then S1 to core/PE', readings: [ok('Good', '> 200 MΩ', 'Insulation sound.'), bad('Breakdown', '0.3 MΩ', 'Insulation failure: unsafe, replace.')] },
      ],
    },
  ],
  inductor: [
    {
      id: 'inductor-lcr',
      title: 'Inductance and DC resistance',
      purpose: 'Checks the output choke when the output is distorted or the choke overheats.',
      safety: ['isolate', 'discharge', 'hot'],
      steps: [
        { instruction: 'Measure DC resistance.', instrument: 'dmm', setting: 'Ω, 200 Ω range (or 4-wire)', connection: 'Terminal 1 to 2', readings: [ok('Good', '0.03 Ω', 'Winding continuous.'), bad('Open', 'OL', 'Broken winding.')] },
        { instruction: 'Measure inductance and compare with the marked value.', instrument: 'lcr', setting: 'L, 1 kHz', connection: 'Terminal 1 to 2 (lifted from the circuit)', readings: [ok('Good', '1.18 mH', 'Within tolerance of 1.2 mH.'), bad('Shorted turns / cracked core', '0.42 mH', 'Inductance far too low: replace.')] },
      ],
    },
  ],
  capacitor: [
    {
      id: 'cap-esr',
      title: 'Electrolytic capacitor ESR and capacitance',
      purpose: 'Finds aged capacitors causing ripple, resets or low-voltage shutdowns.',
      safety: ['isolate', 'discharge'],
      extraSafety: ['Wear eye protection near suspect electrolytics; a failing can may vent.', 'Never short the terminals to discharge them.'],
      steps: [
        { instruction: 'Confirm the bank is discharged.', instrument: 'dmm', setting: 'DC V', connection: '+ to −', readings: [ok('Safe', '0.4 V', 'Below 50 V: safe to proceed.'), bad('Still charged', '387 V', 'Hazardous: discharge again before touching.')] },
        { instruction: 'Measure ESR in circuit.', instrument: 'esr', setting: 'ESR', connection: '+ to −', readings: [ok('Good', '0.04 Ω', 'Low ESR: healthy for a large can.'), bad('Aged', '1.6 Ω', 'High ESR: replace the whole bank.')] },
        { instruction: 'Measure capacitance out of circuit.', instrument: 'lcr', setting: 'C, 100 Hz', connection: '+ to −', readings: [ok('Good', '452 µF', 'Within −20 % / +20 % of 470 µF.'), bad('Dried out', '210 µF', 'Lost capacitance: replace.')] },
      ],
    },
  ],
  diode: [
    {
      id: 'diode-test',
      title: 'Diode test in both directions',
      purpose: 'Finds shorted or open rectifier and clamp diodes.',
      safety: ['isolate', 'discharge'],
      steps: [
        { instruction: 'Forward direction.', instrument: 'dmm', setting: 'Diode test', connection: 'Red on anode, black on cathode (banded end)', readings: [ok('Good', '0.55 V', 'Junction conducts forward.'), bad('Open', 'OL', 'Internal open circuit.'), bad('Shorted', '0.00 V', 'Shorted junction.')] },
        { instruction: 'Reverse direction.', instrument: 'dmm', setting: 'Diode test', connection: 'Red on cathode, black on anode', readings: [ok('Good', 'OL', 'Blocks reverse current.'), bad('Shorted / leaky', '0.08 V', 'Conducts in reverse: replace.')] },
      ],
    },
  ],
  resistor: [
    {
      id: 'resistor-ohms',
      title: 'Resistance against the colour code',
      purpose: 'Checks bleeders and power resistors for drift or open circuit.',
      safety: ['isolate', 'discharge'],
      extraSafety: ['An open bleeder means the capacitors may still be charged: measure the bus voltage first.'],
      steps: [
        { instruction: 'Lift one leg and measure resistance.', instrument: 'dmm', setting: 'Ω, 200 kΩ range', connection: 'Across the resistor', readings: [ok('Good (47 kΩ ±5 %)', '46.8 kΩ', 'Within the gold-band tolerance (44.65–49.35 kΩ).'), bad('Drifted', '61.2 kΩ', 'Out of tolerance: replace.'), bad('Open', 'OL', 'Burnt open: replace and check why.')] },
      ],
    },
  ],
  'gate-driver': [
    {
      id: 'driver-scope',
      title: 'Gate-drive signals with supply and oscilloscope',
      purpose: 'Finds a missing high-side or low-side drive after a bridge failure.',
      safety: ['isolate', 'discharge', 'esd', 'current-limit'],
      extraSafety: ['Power only the driver from a bench supply with the power stage disconnected.', 'HO is referenced to HS: use a differential probe, never a ground clip on HS.'],
      steps: [
        { instruction: 'Check the driver supply and bootstrap voltage.', instrument: 'dmm', setting: 'DC V', connection: 'VDD to VSS; HB to HS', readings: [ok('Good', '12.0 V / 11.3 V', 'Supply and bootstrap present.'), bad('No bootstrap', '12.0 V / 0.2 V', 'Bootstrap diode or capacitor failed: no high-side drive.')] },
        { instruction: 'Compare logic inputs with gate outputs.', instrument: 'scope', setting: '5 V/div, 20 µs/div', connection: 'CH1 on LI, CH2 on LO', readings: [ok('Good', '0–12 V pulses following LI', 'Driver output follows the input.'), bad('Dead output', 'Flat 0 V on LO', 'Driver damaged (common after a MOSFET failure): replace.')] },
      ],
    },
  ],
  'pwm-controller': [
    {
      id: 'sg3525-check',
      title: 'Reference, oscillator and outputs',
      purpose: 'Checks the PWM controller when its stage produces no pulses.',
      safety: ['isolate', 'discharge', 'esd', 'current-limit'],
      steps: [
        { instruction: 'Measure the reference output.', instrument: 'dmm', setting: 'DC V', connection: 'Pin 16 (VREF) to pin 12 (GND)', readings: [ok('Good', '5.10 V', 'Reference regulator working.'), bad('Missing', '0.0 V', 'No supply on pin 15 or IC failed.')] },
        { instruction: 'Check the oscillator ramp.', instrument: 'scope', setting: '1 V/div', connection: 'Pin 5 (CT) to GND', readings: [ok('Good', 'Clean sawtooth', 'Oscillator running at the design frequency.'), bad('Flat', 'DC level', 'Timing parts or IC failed.')] },
        { instruction: 'Check the outputs and shutdown pin.', instrument: 'scope', setting: '5 V/div', connection: 'Pins 11 and 14; pin 10', readings: [ok('Good', 'Alternating pulses, pin 10 low', 'Outputs active.'), bad('Held off', 'Pin 10 high', 'A protection circuit is holding shutdown: find the fault first.')] },
      ],
    },
  ],
  microcontroller: [
    {
      id: 'mcu-check',
      title: 'Supply, reset and PWM activity',
      purpose: 'Checks a control board that is unresponsive or keeps resetting.',
      safety: ['isolate', 'discharge', 'esd', 'current-limit'],
      extraSafety: ['Use an isolated programmer: the control ground may sit at battery potential.'],
      steps: [
        { instruction: 'Measure the logic supply and reset line.', instrument: 'dmm', setting: 'DC V', connection: 'VDD to VSS; NRST to VSS', readings: [ok('Good', '3.30 V / 3.3 V', 'Powered and out of reset.'), bad('Held in reset', '3.30 V / 0.0 V', 'Reset circuit fault or supervisor holding reset.')] },
        { instruction: 'Look for PWM outputs to the drivers.', instrument: 'scope', setting: '1 V/div, 50 µs/div', connection: 'PWM output pin to VSS', readings: [ok('Running', '3.3 V PWM pulses', 'Firmware running and driving.'), bad('Idle', 'Flat line', 'Firmware halted, protection active or MCU failed.')] },
      ],
    },
  ],
  'display-board': [
    {
      id: 'display-check',
      title: 'Display supply and communication',
      purpose: 'Diagnoses a blank display on an otherwise working inverter.',
      safety: ['isolate', 'discharge', 'esd'],
      steps: [
        { instruction: 'Check the supply at the board connector (powered from a bench supply).', instrument: 'dmm', setting: 'DC V', connection: 'VCC to GND', readings: [ok('Good', '5.02 V', 'Supply present.'), bad('No supply', '0.0 V', 'Ribbon cable or supply fault.')] },
        { instruction: 'Check serial activity.', instrument: 'scope', setting: '2 V/div, 100 µs/div', connection: 'SDA to GND', readings: [ok('Good', 'Bursts of data', 'MCU is talking to the display.'), bad('Silent', 'Flat line', 'Communication fault: check cable, then MCU.')] },
      ],
    },
  ],
  'main-pcb': [
    {
      id: 'pcb-inspect',
      title: 'Visual inspection and trace continuity',
      purpose: 'Finds burnt traces, cracked joints and carbon tracking.',
      safety: ['isolate', 'discharge'],
      steps: [
        { instruction: 'Check a suspect trace end to end.', instrument: 'dmm', setting: 'Continuity', connection: 'Pad to pad', readings: [ok('Good', 'Beep, 0.1 Ω', 'Trace intact.'), bad('Broken', 'OL', 'Burnt or cracked trace: repair with equal cross-section wire or replace the board.')] },
        { instruction: 'Look for heat damage under load (bench test only).', instrument: 'thermal', setting: 'Surface temperature', connection: 'Camera over the board', readings: [ok('Normal', '45 °C hottest joint', 'No hot spots.'), bad('Hot joint', '110 °C at a lug', 'High-resistance joint: reflow or repair.')] },
      ],
    },
  ],
  relay: [
    {
      id: 'relay-coil-contacts',
      title: 'Coil resistance and contact operation',
      purpose: 'Checks a relay that does not click, chatters or will not release.',
      safety: ['isolate', 'discharge', 'current-limit'],
      steps: [
        { instruction: 'Measure the coil.', instrument: 'dmm', setting: 'Ω, 2 kΩ range', connection: 'A1 to A2', readings: [ok('Good', '158 Ω', 'Matches R = V²/P ≈ 160 Ω for a 12 V, 0.9 W coil.'), bad('Open coil', 'OL', 'Coil burnt open: replace.')] },
        { instruction: 'Check contacts with the coil off, then energised from 12 V.', instrument: 'dmm', setting: 'Continuity', connection: 'COM–NC (off), COM–NO (on)', readings: [ok('Good', 'Beep / Beep', 'Contacts switch correctly.'), bad('Burnt contacts', 'OL when energised', 'Clicks but does not conduct: replace.'), bad('Welded', 'COM–NO beeps when off', 'Contacts welded: output cannot disconnect.')] },
      ],
    },
  ],
  fuse: [
    {
      id: 'fuse-check',
      title: 'Fuse continuity',
      purpose: 'Confirms a blown battery fuse when the inverter is completely dead.',
      safety: ['isolate', 'battery-short'],
      extraSafety: ['Find and fix the cause (often a shorted MOSFET or reversed battery) before fitting a new fuse.'],
      steps: [
        { instruction: 'Measure across the fuse with the battery disconnected.', instrument: 'dmm', setting: 'Continuity', connection: 'Bolt 1 to bolt 2', readings: [ok('Good', 'Beep, 0.0 Ω', 'Fuse intact.'), bad('Blown', 'OL', 'Fuse open: investigate the cause, replace with the same rating.')] },
      ],
    },
  ],
  'circuit-breaker': [
    {
      id: 'breaker-check',
      title: 'Breaker contacts on and off',
      purpose: 'Checks the PV breaker after repeated tripping.',
      safety: ['isolate', 'pv-daylight'],
      extraSafety: ['The line terminals stay live from the array in daylight even with the breaker off: isolate at the array or cover the panels.'],
      steps: [
        { instruction: 'Measure each pole with the breaker OFF, then ON.', instrument: 'dmm', setting: 'Continuity', connection: '+ line to + load; − line to − load', readings: [ok('Good', 'OL off / beep on', 'Contacts open and close.'), bad('Welded', 'Beep when off', 'Cannot isolate: replace immediately.')] },
        { instruction: 'Before re-energising after a trip, test the array insulation.', instrument: 'insulation', setting: 'PV insulation test (per tester)', connection: 'Array +/− to earth', readings: [ok('Good', '> 40 MΩ', 'No earth fault.'), bad('Earth fault', '0.1 MΩ', 'Damaged cable or panel: find the fault before reconnecting.')] },
      ],
    },
  ],
  'voltage-sensor': [
    {
      id: 'vsense-scale',
      title: 'Scaling check with a known voltage',
      purpose: 'Finds a drifting sensor that makes the inverter regulate to the wrong voltage.',
      safety: ['isolate', 'discharge', 'current-limit'],
      extraSafety: ['Apply only a safe test voltage from a current-limited supply; never bridge the isolation barrier with probes.'],
      steps: [
        { instruction: 'Apply 20.0 V to the HV input and measure the output.', instrument: 'dmm', setting: 'DC V', connection: 'OUT to GND', readings: [ok('Good', '0.165 V', 'Scale 1:121 as designed (0–400 V → 0–3.3 V).'), bad('Drifted', '0.139 V', 'Divider resistor drifted high: readings too low, so output regulates too high.')] },
      ],
    },
  ],
  'current-sensor': [
    {
      id: 'hall-zero',
      title: 'Zero offset and comparison under load',
      purpose: 'Finds false overload trips or missing overcurrent protection.',
      safety: ['isolate', 'discharge', 'live-qualified', 'cat-rated'],
      steps: [
        { instruction: 'With no current, compare OUT with REF.', instrument: 'dmm', setting: 'DC V', connection: 'OUT to 0 V, REF to 0 V', readings: [ok('Good', '2.50 V / 2.50 V', 'No offset.'), bad('Offset', '2.71 V / 2.50 V', 'Offset ≈ +34 A at 6.25 mV/A: false overload trips.')] },
        { instruction: 'Under load, compare the sensor output with a clamp meter on the same busbar.', instrument: 'clamp', setting: 'DC A', connection: 'Jaws around the busbar', readings: [ok('Good', '40.2 A (sensor ≈ 40 A)', 'Sensor agrees with the clamp.'), bad('Dead sensor', '40.2 A (sensor 0 A)', 'No protection on real overload: replace.')] },
      ],
    },
  ],
  'heat-sink': [
    {
      id: 'heatsink-isolation',
      title: 'Tab insulation and thermal check',
      purpose: 'Finds failed insulating pads and cooling problems.',
      safety: ['isolate', 'discharge', 'hot'],
      steps: [
        { instruction: 'Measure from each device tab to the heat sink.', instrument: 'dmm', setting: 'Ω, highest range', connection: 'Tab to heat-sink fin', readings: [ok('Good', 'OL', 'Pad insulates the live tab.'), bad('Pad failed', '0.2 Ω', 'Tab shorted to the earthed heat sink: replace the pad and check the device.')] },
        { instruction: 'Under load, compare device temperatures.', instrument: 'thermal', setting: 'Surface temperature', connection: 'Camera over the heat sink', readings: [ok('Good', '58 °C, even', 'Matches T = 40 °C + 60 W × 0.3 °C/W.'), bad('Fan failed', '112 °C', 'R_θsa ≈ 1.2 °C/W without airflow: thermal shutdown expected.')] },
      ],
    },
  ],
  'cooling-fan': [
    {
      id: 'fan-bench',
      title: 'Bench run and tachometer check',
      purpose: 'Checks a fan suspected of causing over-temperature faults.',
      safety: ['isolate', 'current-limit'],
      extraSafety: ['Keep fingers clear of the blades.'],
      steps: [
        { instruction: 'Run from 12 V and read the current.', instrument: 'psu', setting: '12 V, 0.5 A limit', connection: 'Red to +, black to −', readings: [ok('Good', '0.28 A, spinning', 'Motor healthy.'), bad('Seized', '0.50 A (limit), not turning', 'Bearing seized: replace.')] },
        { instruction: 'Measure tach pulses (with pull-up resistor).', instrument: 'scope', setting: '5 V/div, 5 ms/div', connection: 'Yellow TACH to GND', readings: [ok('Good', '100 Hz pulses', '2 pulses/rev → 3000 rpm.'), bad('No tach', 'Flat line', 'Controller reports a fan fault.')] },
      ],
    },
  ],
  'battery-terminals': [
    {
      id: 'terminal-drop',
      title: 'Connection voltage drop under load',
      purpose: 'Finds loose or corroded battery connections that cause low-voltage shutdowns or overheating.',
      safety: ['live-qualified', 'battery-short', 'cat-rated'],
      steps: [
        { instruction: 'Under load, measure from the cable lug to the terminal stud.', instrument: 'dmm', setting: 'DC mV', connection: 'Probe on lug, probe on stud', readings: [ok('Good', '4 mV at 70 A', 'Contact resistance ≈ 0.06 mΩ.'), bad('Loose', '180 mV at 70 A', '2.6 mΩ → 12.6 W heating at the joint: clean and re-torque.')] },
        { instruction: 'Before connecting a battery, verify polarity.', instrument: 'dmm', setting: 'DC V', connection: 'Red on cable for +, black on cable for −', readings: [ok('Correct', '+51.8 V', 'Polarity correct.'), bad('Reversed', '−51.8 V', 'Do not connect: reversed polarity can destroy the inverter.')] },
      ],
    },
  ],
  'dc-input': [
    {
      id: 'dclug-inspect',
      title: 'Lug voltage drop and heat check',
      purpose: 'Finds overheated DC input lugs on the power board.',
      safety: ['live-qualified', 'battery-short', 'cat-rated'],
      steps: [
        { instruction: 'Under load, measure from the cable lug to the board lug.', instrument: 'dmm', setting: 'DC mV', connection: 'Across the joint', readings: [ok('Good', '3 mV', 'Low-resistance joint.'), bad('Overheating', '95 mV', 'High-resistance joint: inspect the PCB for charring.')] },
      ],
    },
  ],
  'ac-output': [
    {
      id: 'ac-terminals',
      title: 'Insulation test (isolated) and output check (live)',
      purpose: 'Confirms safe insulation and correct output at the terminal block.',
      safety: ['isolate', 'cat-rated'],
      extraSafety: ['The live step is for qualified persons only: the output can be live from the battery even when the grid is off.'],
      steps: [
        { instruction: 'Isolated: insulation from each conductor to PE.', instrument: 'insulation', setting: '500 V DC', connection: 'L to PE; N to PE', readings: [ok('Good', '> 100 MΩ', 'Insulation sound.'), bad('Fault', '0.2 MΩ', 'Insulation failure: do not energise.')] },
        { instruction: 'Live (qualified only): measure the output.', instrument: 'dmm', setting: 'AC V', connection: 'L to N; N to PE', readings: [ok('Good', '230 V / 0.4 V', 'Correct output, N-PE bond present.'), bad('Low output', '198 V', 'Output too low: investigate the sensing or power stage.')] },
      ],
    },
  ],
  'solar-input': [
    {
      id: 'pv-voc',
      title: 'PV open-circuit voltage and polarity before connection',
      purpose: 'Prevents damage from over-voltage or reversed strings.',
      safety: ['pv-daylight', 'cat-rated', 'live-qualified'],
      steps: [
        { instruction: 'With the breaker OFF, measure the string at its connectors.', instrument: 'dmm', setting: 'DC V (≥ 1000 V rated)', connection: 'Red on PV+, black on PV−', readings: [ok('Good', '+392 V', 'Below the 450 V input maximum, polarity correct.'), bad('Too high', '+478 V', 'Exceeds the input maximum: reconfigure the string.'), bad('Reversed', '−392 V', 'Reversed: correct the wiring before connecting.')] },
      ],
    },
  ],
  'protective-earth': [
    {
      id: 'pe-continuity',
      title: 'Earth-continuity test',
      purpose: 'Proves every exposed metal part is bonded to protective earth.',
      safety: ['isolate'],
      steps: [
        { instruction: 'Measure from the PE terminal to the cover, heat sink and chassis.', instrument: 'earth-bond', setting: 'Low Ω (null the leads first)', connection: 'PE stud to each metal part', readings: [ok('Good', '0.04 Ω', 'Bond sound (≤ 0.1 Ω).'), bad('Missing bond', '2.6 Ω', 'Poor or missing bond: reconnect the earth strap or clean the contact.')] },
      ],
    },
  ],
  enclosure: [
    {
      id: 'enclosure-bond',
      title: 'Cover and panel bonding',
      purpose: 'Confirms the cover is earthed after maintenance.',
      safety: ['isolate'],
      steps: [
        { instruction: 'Measure from the PE stud to the cover.', instrument: 'earth-bond', setting: 'Low Ω', connection: 'PE stud to cover', readings: [ok('Good', '0.06 Ω', 'Cover earthed.'), bad('Strap missing', 'OL', 'Earth strap not refitted: the cover could become live in a fault.')] },
      ],
    },
  ],
}
