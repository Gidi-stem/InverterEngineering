import type { ElectronicComponent } from '../../types/domain'

/** Power switching and power conversion devices. */
export const POWER_COMPONENTS: ElectronicComponent[] = [
  {
    id: 'mosfet',
    name: 'Power MOSFET (N-channel)',
    category: 'power-switching',
    symbol: 'mosfet',
    plainSummary:
      'A very fast electronic switch with no moving parts. A small voltage on the gate turns a large battery current on or off thousands of times a second. Four of them, arranged as an H-bridge, make the current flow first one way and then the other through the transformer, which is how DC becomes AC.',
    function:
      'Switches the battery-side current in the H-bridge. In this inverter four MOSFETs alternately connect each end of the transformer primary to the 48 V bus or to ground.',
    operatingPrinciple:
      'A voltage between gate and source (V_GS) above the threshold (typically 2–4 V) creates a conductive channel between drain and source. Fully enhanced at V_GS ≈ 10–12 V, the channel behaves like a small resistor R_DS(on), so conduction loss is I²·R_DS(on). The gate is insulated, so it draws current only while its capacitance charges or discharges during a switching edge. An intrinsic body diode from source to drain conducts reverse current.',
    applications: ['Low-voltage H-bridges in 12/24/48 V inverters', 'DC-DC converters and MPPT chargers', 'Battery protection switches in BMS units', 'Motor drives'],
    terminals: [
      { id: 'g', label: 'G (pin 1)', role: 'control', description: 'Gate. Left-hand lead when the marked face is towards you and the leads point down.' },
      { id: 'd', label: 'D (pin 2)', role: 'power-in', description: 'Drain. Centre lead; internally connected to the metal tab.' },
      { id: 's', label: 'S (pin 3)', role: 'power-out', description: 'Source. Right-hand lead; return path for both load current and gate drive.' },
      { id: 'tab', label: 'Tab = D', role: 'power-in', description: 'Metal mounting tab, electrically the drain. Must be insulated from an earthed heat sink with a thermal pad and bush.' },
    ],
    ioBehaviour:
      'Input: gate-source voltage from the gate driver (0 V = off, 10–12 V = on). Output: drain-source path that is either open (blocks up to V_DSS) or a few milliohms. Switching edges take tens to hundreds of nanoseconds.',
    failureSymptoms: [
      'Drain-source short circuit: fuse blows or overcurrent protection trips immediately at power-on',
      'Gate-source short (often after a voltage spike): gate driver overheats, no switching',
      'Open circuit: one half of the output waveform missing, transformer hum changes, output low',
      'Overheating or a discoloured board area around the tab',
    ],
    replacementNotes: [
      'Match or exceed V_DSS, continuous I_D, and match R_DS(on) and gate charge Q_g closely, so the gate driver and heating stay the same.',
      'Replace all MOSFETs in a failed leg (often the whole bridge); a surviving device may be weakened.',
      'Fit a new insulating thermal pad and bush; torque the clamp screw to the datasheet value.',
      'Check the gate resistor and gate driver before powering up; a failed driver will destroy new MOSFETs.',
    ],
    safety: [
      'The tab is live at drain potential during operation.',
      'Static-sensitive: handle by the body with an earthed wrist strap.',
      'Never power the bridge with a MOSFET missing from a leg that is still driven.',
    ],
    related: ['gate-driver', 'heat-sink', 'transformer', 'capacitor', 'igbt'],
    typicalSpecs: [
      { name: 'V_DSS needed for a 48 V bridge', value: '100–150', unit: 'V', kind: 'typical' },
      { name: 'R_DS(on) of low-voltage power MOSFETs', value: '≈ 1–10', unit: 'mΩ', kind: 'typical' },
      { name: 'Total gate charge Q_g', value: 'tens to a few hundred', unit: 'nC', kind: 'typical' },
      { name: 'Devices in the LF-3K bridge', value: '4', unit: '', kind: 'model' },
    ],
    advancedNote:
      'A 48 V bus should use parts rated at least 100 V, because leakage inductance produces voltage overshoot at turn-off. Losses split into conduction loss, I_rms²·R_DS(on) rising with temperature (about 1.7× at 125 °C), and switching loss, ½·V·I·(t_r+t_f)·f_sw. Paralleled devices share current well because R_DS(on) rises with temperature, but each needs its own gate resistor to prevent oscillation.',
  },
  {
    id: 'igbt',
    name: 'IGBT (Insulated-Gate Bipolar Transistor)',
    category: 'power-switching',
    symbol: 'igbt',
    plainSummary:
      'A power switch for higher voltages. It is controlled like a MOSFET, with a voltage on the gate, but carries current like a bipolar transistor, so it handles hundreds of volts efficiently. Here it switches the high-voltage solar input.',
    function:
      'High-side switch of the MPPT buck charger that converts the solar array voltage (up to 450 V) down to the 48 V battery.',
    operatingPrinciple:
      'A MOSFET structure on the input drives a PNP bipolar output stage. When V_GE exceeds the threshold the device conducts with a nearly constant on-state voltage V_CE(sat), typically 1.5–2 V, instead of a resistance. Conduction loss is therefore ≈ V_CE(sat)·I, which favours IGBTs at high voltage and high current. At turn-off, stored minority carriers cause a "tail current" that limits practical switching frequency to about 20–40 kHz.',
    applications: ['High-voltage MPPT chargers and PV boost stages', 'Grid-tied inverter bridges (400–800 V DC bus)', 'Motor drives and welding inverters', 'Induction heating'],
    terminals: [
      { id: 'g', label: 'G (pin 1)', role: 'control', description: 'Gate. Left lead, marked face towards you.' },
      { id: 'c', label: 'C (pin 2)', role: 'power-in', description: 'Collector. Centre lead, connected to the tab.' },
      { id: 'e', label: 'E (pin 3)', role: 'power-out', description: 'Emitter. Right lead; gate-drive return.' },
      { id: 'tab', label: 'Tab = C', role: 'power-in', description: 'Collector tab, live at up to the PV voltage. Insulate from the heat sink.' },
    ],
    ioBehaviour:
      'Input: gate-emitter voltage, typically +15 V on and 0 V or −8 V off. Output: collector-emitter path that blocks up to V_CES or conducts with ≈1.6–2 V drop. Most discrete IGBTs include a co-packaged anti-parallel diode.',
    failureSymptoms: [
      'Collector-emitter short: PV input breaker or fuse trips, charger disabled with a fault code',
      'No solar charging while PV voltage is present',
      'Excessive heating at low switching frequency (degraded V_CE(sat))',
    ],
    replacementNotes: [
      'Match V_CES, current rating, V_CE(sat), switching speed class and whether an anti-parallel diode is included.',
      'A faster IGBT can ring or overshoot in the original layout; keep the same gate resistor.',
      'Renew the insulating pad and check the snubber components.',
    ],
    safety: [
      'Works at PV string voltage (hazardous DC). Solar panels keep producing voltage in daylight; isolate at the PV disconnect.',
      'DC arcs do not self-extinguish like AC arcs; never break a PV connection under load.',
    ],
    related: ['mosfet', 'solar-input', 'gate-driver', 'heat-sink', 'diode'],
    typicalSpecs: [
      { name: 'Common V_CES classes', value: '600–1200', unit: 'V', kind: 'typical' },
      { name: 'V_CE(sat) at rated current', value: '≈ 1.5–2.5', unit: 'V', kind: 'typical' },
      { name: 'Practical switching frequency (discrete)', value: 'up to ≈ 20–40', unit: 'kHz', kind: 'typical' },
      { name: 'PV input limit the LF-3K charger must block', value: '450', unit: 'V', kind: 'model' },
    ],
    advancedNote:
      'Choose an IGBT over a MOSFET when V_CE(sat)·I is smaller than I²·R_DS(on) at the operating current and voltage, which is usually above about 400 V. The tail current makes turn-off energy E_off the dominant switching loss, so P_sw ≈ (E_on + E_off)·f_sw from the datasheet curves. Negative turn-off gate voltage and a Miller clamp prevent dv/dt-induced false turn-on.',
  },
  {
    id: 'transformer',
    name: 'Line-frequency transformer',
    category: 'power-conversion',
    symbol: 'transformer',
    plainSummary:
      'Two coils of copper wire wound around an iron core. The H-bridge feeds a low voltage into the thick primary coil and the thin secondary coil delivers 230 V. It also isolates the battery side from the mains side.',
    function: 'Steps the 48 V H-bridge output up to 230 V AC and provides galvanic isolation between the battery and the AC output.',
    operatingPrinciple:
      'An alternating current in the primary produces an alternating magnetic flux in the laminated steel core (Faraday\'s law). The flux links the secondary and induces a voltage in proportion to the turns ratio: V_s/V_p = N_s/N_p. Power is conserved apart from losses, so the current ratio is inverse. Laminations reduce eddy-current losses. The core must not saturate, which requires V/(f·N) to stay below the design limit, so frequency matters.',
    applications: ['Low-frequency (LF) inverters and UPS units', 'Mains isolation transformers', 'Battery chargers that run the inverter bridge in reverse', 'Welding sets'],
    terminals: [
      { id: 'p1', label: 'P1', role: 'power-in', description: 'Primary winding start (thick conductor), from H-bridge leg A.' },
      { id: 'p2', label: 'P2', role: 'power-in', description: 'Primary winding finish, from H-bridge leg B.' },
      { id: 's1', label: 'S1', role: 'power-out', description: 'Secondary start, to output filter and line (L) via the output relay.' },
      { id: 's2', label: 'S2', role: 'power-out', description: 'Secondary finish, to neutral (N).' },
    ],
    ioBehaviour:
      'Input: low-voltage AC from the bridge, roughly 30 V rms at full modulation. Output: 230 V rms at 50 Hz. In charge mode, power flows backwards: the mains feeds the secondary and the bridge rectifies the primary to charge the battery.',
    failureSymptoms: [
      'Burnt smell, darkened or blistered winding varnish',
      'Very loud hum or buzzing (loose laminations, overload or DC offset saturation)',
      'Open winding: no output at all, bridge sees no load current',
      'Shorted turns: high no-load current, overheating, low output voltage',
    ],
    replacementNotes: [
      'Match VA rating, voltage ratio, frequency, and insulation class.',
      'Transformers are heavy (about 20–30 kg for 3 kVA); support the weight and use all mounting bolts.',
      'Restore the protective-earth bond to the core and clamp.',
    ],
    safety: [
      'The secondary produces mains voltage whenever the bridge runs, including from the battery alone.',
      'Heavy: lift with correct posture or two people.',
    ],
    related: ['mosfet', 'inductor', 'relay', 'ac-output', 'protective-earth'],
    typicalSpecs: [
      { name: 'Rating', value: '3', unit: 'kVA', kind: 'model' },
      { name: 'Primary voltage at full modulation', value: '≈ 30', unit: 'V rms', kind: 'model' },
      { name: 'Secondary voltage', value: '230', unit: 'V rms', kind: 'model' },
      { name: 'Peak flux density, grain-oriented steel', value: '≈ 1.2–1.5', unit: 'T', kind: 'typical' },
    ],
    advancedNote:
      'Core cross-section follows from V_rms = 4.44·f·N·A_e·B_max, with B_max ≈ 1.2–1.5 T for grain-oriented steel. Any DC offset in the bridge drive walks the core into saturation, so the controller must keep volt-seconds balanced every cycle. The leakage inductance can serve as part of the output filter.',
  },
  {
    id: 'inductor',
    name: 'Power inductor (toroidal choke)',
    category: 'passive',
    symbol: 'inductor',
    plainSummary:
      'A coil of copper wire on a ring-shaped core. It resists sudden changes in current, smoothing the chopped PWM waveform into a clean sine wave together with a capacitor.',
    function: 'Forms the LC output filter with the AC film capacitor, removing switching-frequency ripple so the output is a low-distortion sine wave.',
    operatingPrinciple:
      'Voltage across an inductor is V = L·di/dt: it opposes changes in current by storing energy in its magnetic field (E = ½·L·I²). With a capacitor it forms a low-pass filter whose corner frequency is f_c = 1/(2π√(LC)). Ripple at the PWM frequency, well above f_c, is attenuated at about 40 dB per decade, while the 50 Hz fundamental passes.',
    applications: ['Inverter output LC filters', 'Buck/boost converter energy storage (e.g. MPPT charger)', 'EMI common-mode chokes', 'Power-factor correction'],
    terminals: [
      { id: '1', label: '1', role: 'passive', description: 'Winding end 1 (not polarised for a single-winding choke).' },
      { id: '2', label: '2', role: 'passive', description: 'Winding end 2.' },
    ],
    ioBehaviour: 'Input: PWM voltage with high-frequency ripple. Output: smoothed current; ripple current ΔI ≈ V·D·(1−D)/(L·f_sw) for a half-bridge leg.',
    failureSymptoms: ['Audible whine at the switching frequency (loose winding)', 'Overheating or cracked core (saturation, overload)', 'Distorted output if the core saturates at peak current', 'Open winding: no output'],
    replacementNotes: ['Match inductance, saturation current and DC resistance.', 'Core material changes the losses; keep the same material (iron powder, ferrite, amorphous).', 'Re-secure with the original clamp; vibration causes noise.'],
    safety: ['Carries full output current and gets hot.', 'Stored magnetic energy causes an arc if a circuit carrying current is opened.'],
    related: ['capacitor', 'transformer', 'mosfet'],
    typicalSpecs: [
      { name: 'Output filter inductance', value: '1.2', unit: 'mH', kind: 'model' },
      { name: 'Rated current', value: '15', unit: 'A rms', kind: 'model' },
      { name: 'Tolerance of power chokes', value: '±10–20', unit: '%', kind: 'typical' },
    ],
    advancedNote:
      'Choose L to limit ripple to about 20–40 % of peak current, then choose C for a corner frequency 10–20× below f_sw but well above 50 Hz to avoid resonance with loads. Iron-powder toroids saturate softly (inductance falls gradually), which is forgiving at overload peaks. Ferrite saturates abruptly.',
  },
  {
    id: 'capacitor',
    name: 'Capacitors: electrolytic and film',
    category: 'passive',
    symbol: 'capacitor',
    plainSummary:
      'Capacitors store electrical energy for short periods. Large electrolytic "cans" act as reservoirs that steady the DC supply when the switches draw sudden pulses of current. Film capacitors filter the AC output. Big capacitors can stay charged after switch-off, so they are discharged before anyone touches the board.',
    function:
      'Electrolytic bank: reservoir on the DC buses (48 V battery bus, high-voltage PV bus) supplying the switching ripple current. Film capacitor: the C of the output LC filter and snubbers.',
    operatingPrinciple:
      'Charge is stored on two plates separated by a dielectric: Q = C·V, energy E = ½·C·V². Aluminium electrolytics use a very thin oxide layer for large capacitance in a small volume. They are polarised: reverse voltage destroys them. Film capacitors (polypropylene) are non-polarised, have low losses and self-heal small faults, so they suit AC filtering. The equivalent series resistance (ESR) heats the capacitor as ripple current flows: P = I_ripple²·ESR.',
    applications: ['DC-link and reservoir banks', 'AC output filters (X2/AC-rated film)', 'Snubbers across switches', 'Decoupling of control ICs'],
    terminals: [
      { id: '+', label: '+ (electrolytic)', role: 'passive', description: 'Positive lead. Snap-in cans are marked by the stripe on the opposite (negative) side; the + lead is unmarked.' },
      { id: '-', label: '− (electrolytic)', role: 'passive', description: 'Negative lead, beside the printed stripe of "−" symbols on the sleeve.' },
      { id: '1', label: '1 (film)', role: 'passive', description: 'Film capacitor lead; non-polarised.' },
      { id: '2', label: '2 (film)', role: 'passive', description: 'Film capacitor lead; non-polarised.' },
    ],
    ioBehaviour: 'Current leads voltage: I = C·dV/dt. On a DC bus the voltage stays almost constant while the capacitor sources and sinks the high-frequency pulse current the switches draw.',
    failureSymptoms: [
      'Bulging or opened vent on the top, electrolyte residue',
      'High ESR: increased bus ripple, distorted output, resets under load, overheating',
      'Low capacitance: low-voltage shutdowns under sudden load',
      'Short circuit: fuse blows at connection, and violent venting is possible',
    ],
    replacementNotes: [
      'Match capacitance, voltage rating (never lower), ripple-current rating, ESR and temperature rating (105 °C for power stages).',
      'Observe polarity; a reversed electrolytic can explode.',
      'Replace all cans in a bank together; they age together.',
      'For AC filter positions use AC-rated film capacitors (X2 or "~" rated), never DC types.',
    ],
    safety: [
      'Stored energy remains after disconnection. A 940 µF bank at 420 V holds about 83 J, enough to cause a dangerous shock and burns.',
      'Never discharge with a screwdriver; use a rated discharge resistor tool and verify with a meter.',
      'Wear eye protection near suspect electrolytics; vents can rupture.',
    ],
    related: ['inductor', 'resistor', 'mosfet', 'voltage-sensor'],
    typicalSpecs: [
      { name: 'PV-bus electrolytics C5, C6', value: '470 µF / 450 V', unit: '', kind: 'model' },
      { name: 'Battery-bus electrolytics C1–C4', value: '4700 µF / 63 V', unit: '', kind: 'model' },
      { name: 'Output film capacitor C7', value: '10 µF / 275 V~', unit: '', kind: 'model' },
      { name: 'Electrolytic capacitance tolerance', value: '±20', unit: '%', kind: 'typical' },
      { name: 'Power-stage electrolytic temperature rating', value: '105', unit: '°C', kind: 'typical' },
    ],
    advancedNote:
      'Electrolytic life halves for every 10 °C rise (Arrhenius), so rated life at 105 °C is scaled up at the real core temperature, which itself depends on I_ripple²·ESR. Size the bank by ripple current first and capacitance second. In a single-phase inverter the battery bus also carries 100 Hz ripple power, which sets the minimum bulk capacitance.',
  },
  {
    id: 'diode',
    name: 'Rectifier diode',
    category: 'passive',
    symbol: 'diode',
    plainSummary: 'A one-way valve for current. It lets current flow from anode to cathode and blocks it the other way. The silver band marks the cathode.',
    function: 'Rectifies the auxiliary supply and provides freewheeling and clamp paths; the H-bridge itself uses the MOSFET body diodes.',
    operatingPrinciple:
      'A P-N junction conducts when forward-biased above about 0.6–1.0 V (silicon) and blocks when reverse-biased, up to its rated reverse voltage V_RRM. When switching off, stored charge causes a reverse-recovery current; fast-recovery and Schottky types reduce it.',
    applications: ['Bridge rectifiers in chargers', 'Freewheel and clamp paths for inductive loads (relay coils, inductors)', 'Reverse-polarity protection', 'Bootstrap supply for high-side gate drivers'],
    terminals: [
      { id: 'a', label: 'A (anode)', role: 'passive', description: 'Unmarked end.' },
      { id: 'k', label: 'K (cathode)', role: 'passive', description: 'End with the silver/white band.' },
    ],
    ioBehaviour: 'Forward: conducts with ≈0.9 V drop at rated current (1N5408). Reverse: blocks up to 1000 V with microamp leakage.',
    failureSymptoms: ['Shorted: fuse blows or auxiliary supply collapses', 'Open: no rectified output, relay coil spikes damage the driver', 'Cracked or darkened body'],
    replacementNotes: ['Match V_RRM, average current, and recovery speed (standard, fast, ultrafast, Schottky).', 'Band orientation must match the silkscreen.'],
    safety: ['Can be at mains or bus potential in operation.'],
    related: ['mosfet', 'relay', 'resistor', 'capacitor'],
    typicalSpecs: [
      { name: '1N5408 repetitive reverse voltage', value: '1000', unit: 'V', kind: 'part-type' },
      { name: '1N5408 average forward current', value: '3', unit: 'A', kind: 'part-type' },
      { name: 'Forward voltage of silicon rectifiers at rated current', value: '≈ 0.9–1.2', unit: 'V', kind: 'typical' },
    ],
    advancedNote: 'In hard-switched converters, diode reverse recovery adds turn-on loss to the opposing switch; replace standard diodes with ultrafast or SiC Schottky types in high-frequency positions. Conduction loss is ≈ V_F0·I_avg + r_d·I_rms².',
  },
  {
    id: 'resistor',
    name: 'Resistor (bleeder / power)',
    category: 'passive',
    symbol: 'resistor',
    plainSummary: 'A component that limits current. Colour bands give its value. Across the large capacitors, bleed resistors slowly drain the stored charge after switch-off.',
    function: 'Bleeder resistors discharge the high-voltage capacitor bank after shutdown; other resistors set gate drive speed, sense current and divide voltages.',
    operatingPrinciple:
      'Ohm\'s law: V = I·R, with power dissipated P = V²/R = I²·R as heat. With a capacitor C, a bleeder forms an RC circuit whose voltage decays as V(t) = V₀·e^(−t/RC); after one time constant τ = RC, the voltage has fallen to 37 %.',
    applications: ['Capacitor bleeders', 'Gate resistors controlling switching speed', 'Current-sense shunts', 'Voltage dividers for feedback'],
    terminals: [
      { id: '1', label: '1', role: 'passive', description: 'Lead 1 (non-polarised).' },
      { id: '2', label: '2', role: 'passive', description: 'Lead 2 (non-polarised).' },
    ],
    ioBehaviour: 'Linear: current is proportional to voltage. Two 47 kΩ bleeders in series across a 420 V bank draw 420/94 000 ≈ 4.5 mA and dissipate 1.9 W in total, about 0.94 W each, well inside their 2 W rating. Series connection also halves the voltage across each resistor.',
    failureSymptoms: ['Open bleeder: capacitors stay charged for a very long time (shock hazard)', 'Burnt or cracked body, value drifted high', 'Discoloured PCB under overheating resistors'],
    replacementNotes: ['Match resistance, power rating and voltage rating (high-voltage bleeders need ≥ 500 V element rating, often by using several in series).', 'Keep the same spacing from the PCB for cooling.'],
    safety: ['An open bleeder means the capacitors stay dangerous; always verify discharge with a meter rather than relying on the bleeder.'],
    related: ['capacitor', 'voltage-sensor', 'mosfet'],
    typicalSpecs: [
      { name: 'Bleeder value (each)', value: '47', unit: 'kΩ', kind: 'model' },
      { name: 'Bleeder power rating (each)', value: '2', unit: 'W', kind: 'model' },
      { name: 'Gold tolerance band', value: '±5', unit: '%', kind: 'typical' },
      { name: 'Derating at high ambient temperature', value: 'use ≤ 50–60 % of rated power', unit: '', kind: 'typical' },
    ],
    advancedNote:
      'Bleeder sizing is a trade-off: smaller R discharges faster (product standards commonly require the voltage to fall to a safe level within a stated time) but wastes V²/R continuously during operation. Here, 2 × 47 kΩ across 940 µF gives τ ≈ 88 s. Derate film/metal resistors to about 50–60 % of rated power at high ambient temperature.',
  },
]
