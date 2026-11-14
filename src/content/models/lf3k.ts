import type { InverterModel, ModelPart, Vec3 } from '../../types/domain'

/**
 * LF-3K: 3 kW low-frequency (transformer-based) hybrid inverter.
 * 48 V battery → MOSFET H-bridge → line-frequency transformer → LC filter → 230 V 50 Hz.
 * PV (≤ 450 V) → IGBT MPPT buck charger → 48 V battery.
 * Units: 1 = 10 mm. Origin: centre of the base, y up, front panel at +z.
 */
const PCB_TOP = 1.15
const MAIN: Vec3 = [-5, PCB_TOP, 3.0]
const CTRL: Vec3 = [-9.5, PCB_TOP, 11.5]
const rel = (x: number, z: number, b: Vec3): [number, number] => [+(x - b[0]).toFixed(2), +(z - b[2]).toFixed(2)]

const mosfets: ModelPart[] = [-13.5, -11, -8.5, -6].map((x, i) => ({
  id: `q${i + 1}`,
  componentId: 'mosfet',
  label: `MOSFET Q${i + 1} (H-bridge ${i < 2 ? 'leg A' : 'leg B'})`,
  designator: `Q${i + 1}`,
  assembly: 'power-board',
  position: [x, PCB_TOP, -2.25],
  explodeOffset: [0, 6, 2.5],
  geometry: { factory: 'to247', kind: 'mosfet', marking: 'N-MOS 100V' },
  mountedOn: 'pcb-main',
  removalNote: 'Clamped through its tab to the heat sink (with an insulating pad) and soldered into the power board.',
}))

const igbts: ModelPart[] = [-2.5, 0].map((x, i) => ({
  id: `q${i + 5}`,
  componentId: 'igbt',
  label: `IGBT Q${i + 5} (MPPT charger)`,
  designator: `Q${i + 5}`,
  assembly: 'power-board',
  position: [x, PCB_TOP, -2.25],
  explodeOffset: [0, 6, 2.5],
  geometry: { factory: 'to247', kind: 'igbt', marking: 'IGBT 650V' },
  mountedOn: 'pcb-main',
  removalNote: 'Clamped to the heat sink and soldered into the power board, like the MOSFETs.',
}))

const drivers: ModelPart[] = [-12.2, -7.2, -1.2].map((x, i) => ({
  id: `u${i + 2}`,
  componentId: 'gate-driver',
  label: `Gate driver U${i + 2} (${i < 2 ? `leg ${i === 0 ? 'A' : 'B'}` : 'charger'})`,
  designator: `U${i + 2}`,
  assembly: 'power-board',
  position: [x, PCB_TOP, -0.6],
  explodeOffset: [0, 3.5, 0.5],
  geometry: { factory: 'ic', pkg: 'soic8', marking: 'HB DRIVER' },
  mountedOn: 'pcb-main',
  removalNote: 'Surface-mount IC soldered to the power board; removed with hot air in a real repair.',
}))

const lvCaps: ModelPart[] = [-14.2, -10.6, -7.0, -3.4].map((x, i) => ({
  id: `c${i + 1}`,
  componentId: 'capacitor',
  label: `Battery-bus capacitor C${i + 1}`,
  designator: `C${i + 1}`,
  assembly: 'power-board',
  position: [x, PCB_TOP, 2.2],
  explodeOffset: [0, 5, 0],
  geometry: { factory: 'electrolytic', diameter: 3.5, height: 5, rating: '4700µF 63V 105°C' },
  mountedOn: 'pcb-main',
  removalNote: 'Snap-in can soldered to the power board. Discharge before removal.',
}))

const hvCaps: ModelPart[] = [0.4, 4.0].map((x, i) => ({
  id: `c${i + 5}`,
  componentId: 'capacitor',
  label: `PV-bus capacitor C${i + 5} (450 V)`,
  designator: `C${i + 5}`,
  assembly: 'power-board',
  position: [x, PCB_TOP, 2.2],
  explodeOffset: [0, 5, 0],
  geometry: { factory: 'electrolytic', diameter: 3.5, height: 5.5, rating: '470µF 450V 105°C' },
  mountedOn: 'pcb-main',
  removalNote: 'High-voltage reservoir capacitor soldered to the power board; must be discharged and verified first.',
}))

const terminalStage = ['ac-out', 'breaker', 'pv-pos', 'pv-neg', 'fuse', 'bat-pos', 'bat-neg']

export const LF3K: InverterModel = {
  id: 'lf3k',
  name: 'LF-3K hybrid inverter (3 kW, transformer-based)',
  summary:
    '48 V battery inverter with a line-frequency transformer, SPWM H-bridge, LC output filter, IGBT MPPT solar charger and grid-transfer relay. A common design in off-grid and backup systems.',
  topology: 'hybrid',
  ratedPowerW: 3000,
  batteryV: 48,
  outputVrms: 230,
  outputHz: 50,
  size: [40, 12, 30],
  assemblies: [
    { id: 'chassis', label: 'Chassis and earth' },
    { id: 'terminal-block', label: 'Terminal block' },
    { id: 'power-board', label: 'Power board' },
    { id: 'magnetics', label: 'Magnetics and output filter' },
    { id: 'cooling', label: 'Cooling' },
    { id: 'control-board', label: 'Control board' },
    { id: 'display-board', label: 'Display board' },
  ],
  parts: [
    { id: 'enclosure', componentId: 'enclosure', label: 'Enclosure (chassis tray)', assembly: 'chassis', position: [0, 0, 0], explodeOffset: [0, 0, 0], geometry: { factory: 'enclosure-base', size: [40, 12, 30], displayWindow: true }, removalNote: 'The chassis is the frame that every other part mounts to; it stays on the bench.' },
    {
      id: 'cover',
      componentId: 'enclosure',
      label: 'Top cover with nameplate',
      assembly: 'chassis',
      position: [0, 0, 0],
      explodeOffset: [0, 16, 0],
      geometry: { factory: 'enclosure-cover', size: [40, 12, 30], nameplate: ['LF-3K HYBRID INVERTER', '3 kW  48 V ⎓  230 V~ 50 Hz  PV ≤ 450 V', '⚠ HAZARDOUS VOLTAGE INSIDE', 'Wait 5 min after disconnection'] },
      removalNote: 'Held by eight screws and an earth strap. Only remove after every source is isolated.',
    },
    { id: 'pe', componentId: 'protective-earth', label: 'Protective earth stud', assembly: 'chassis', position: [17.5, 0.15, -8], explodeOffset: [4, 4, -4], geometry: { factory: 'pe-stud' }, dependsOn: terminalStage, removalNote: 'The earth bond is the last connection removed and the first reconnected; every other terminal must be off first.' },
    { id: 'bat-pos', componentId: 'battery-terminals', label: 'Battery terminal + (red)', assembly: 'terminal-block', position: [-16, 0.15, -12.5], explodeOffset: [-3, 5, -8], geometry: { factory: 'battery-terminal', polarity: '+' }, removalNote: 'Bolted to the terminal shelf; the cable lug must be disconnected first.' },
    { id: 'bat-neg', componentId: 'battery-terminals', label: 'Battery terminal − (black)', assembly: 'terminal-block', position: [-12.8, 0.15, -12.5], explodeOffset: [-1, 5, -8], geometry: { factory: 'battery-terminal', polarity: '-' }, removalNote: 'Bolted to the terminal shelf.' },
    { id: 'fuse', componentId: 'fuse', label: 'Battery fuse 150 A (MEGA)', assembly: 'terminal-block', position: [-7.5, 0.15, -12.5], explodeOffset: [0, 5, -8], geometry: { factory: 'mega-fuse', amps: 150 }, removalNote: 'Two bolts on its holder, in series with the battery positive.' },
    { id: 'pv-pos', componentId: 'solar-input', label: 'PV+ input connector', assembly: 'terminal-block', position: [-2.6, 0.15, -12.8], explodeOffset: [0, 6, -8], geometry: { factory: 'mc4', polarity: '+' }, removalNote: 'Panel-mount connector held by a lock nut through the rear panel.' },
    { id: 'pv-neg', componentId: 'solar-input', label: 'PV− input connector', assembly: 'terminal-block', position: [-0.6, 0.15, -12.8], explodeOffset: [0, 6, -8], geometry: { factory: 'mc4', polarity: '-' }, removalNote: 'Panel-mount connector held by a lock nut.' },
    { id: 'breaker', componentId: 'circuit-breaker', label: 'PV DC breaker 2-pole', assembly: 'terminal-block', position: [3.5, 0.15, -14.7], explodeOffset: [2, 6, -6], geometry: { factory: 'din-breaker', rating: 'C20 2P' }, removalNote: 'Clipped onto a DIN rail; its four screw terminals must be released first.' },
    { id: 'ac-out', componentId: 'ac-output', label: 'AC output terminals L / N / PE', assembly: 'terminal-block', position: [9.5, 0.15, -12.5], explodeOffset: [3, 5, -8], geometry: { factory: 'ac-terminal-block' }, removalNote: 'Screwed to the base; output wiring must be removed first.' },
    { id: 'heatsink', componentId: 'heat-sink', label: 'Main heat sink', assembly: 'cooling', position: [-6, 0.15, -2.6], explodeOffset: [0, 4, -8], geometry: { factory: 'heatsink', length: 20, height: 7, finDepth: 3.6, fins: 16 }, removalNote: 'Bolted to the base and earth-bonded. All six power switches are clamped to it and must be unclamped first.' },
    { id: 'fan', componentId: 'cooling-fan', label: 'Cooling fan 80 mm', assembly: 'cooling', position: [-18.3, 4.15, -4.7], explodeOffset: [-9, 2, 0], geometry: { factory: 'fan', size: 8, depth: 2.5, rating: '0.30A' }, removalNote: 'Four screws through the side wall and a plug-in three-wire lead.' },
    {
      id: 'pcb-main',
      componentId: 'main-pcb',
      label: 'Main power PCB',
      designator: 'PCB1',
      assembly: 'power-board',
      position: MAIN,
      explodeOffset: [0, 3, 1],
      geometry: {
        factory: 'pcb',
        size: [22, 10.8],
        color: 'green',
        silk: [
          ...[-13.5, -11, -8.5, -6, -2.5, 0].map((x, i) => ({ at: rel(x, -1.5, MAIN), text: `Q${i + 1}` })),
          ...[-12.2, -7.2, -1.2].map((x, i) => ({ at: rel(x, 0.3, MAIN), text: `U${i + 2}` })),
          ...[-14.2, -10.6, -7.0, -3.4, 0.4, 4.0].map((x, i) => ({ at: rel(x, 4.3, MAIN), text: `C${i + 1}` })),
          { at: rel(0.4, 5.7, MAIN), text: 'R1' },
          { at: rel(4.0, 5.7, MAIN), text: 'R2' },
          { at: rel(-12, 7.4, MAIN), text: 'D1' },
          { at: rel(-9.4, 7.4, MAIN), text: 'D2' },
          { at: rel(-5.5, 8.0, MAIN), text: 'CT1' },
          { at: rel(3.6, 8.6, MAIN), text: 'K1' },
          { at: rel(-14.5, 8.6, MAIN), text: 'J1 DC IN' },
        ],
      },
      removalNote: 'Fixed on four standoffs. Every part soldered to it must be removed before the board can be lifted.',
    },
    ...mosfets,
    ...igbts,
    ...drivers,
    ...lvCaps,
    ...hvCaps,
    ...[0.4, 4.0].map((x, i): ModelPart => ({ id: `r${i + 1}`, componentId: 'resistor', label: `Bleeder resistor R${i + 1} (47 kΩ, 2 W)`, designator: `R${i + 1}`, assembly: 'power-board', position: [x, PCB_TOP, 5.1], explodeOffset: [0, 4, 1], geometry: { factory: 'axial-resistor', ohms: 47000, tolerancePct: 5, watts: 2 }, mountedOn: 'pcb-main', removalNote: 'Axial resistor soldered across the PV-bus capacitors.' })),
    ...[-12, -9.4].map((x, i): ModelPart => ({ id: `d${i + 1}`, componentId: 'diode', label: `Rectifier diode D${i + 1}`, designator: `D${i + 1}`, assembly: 'power-board', position: [x, PCB_TOP, 6.6], explodeOffset: [0, 4, 1], geometry: { factory: 'axial-diode', marking: '1N5408' }, mountedOn: 'pcb-main', removalNote: 'Axial diode soldered to the power board (auxiliary supply rectifier).' })),
    { id: 'hall', componentId: 'current-sensor', label: 'Hall current sensor CT1', designator: 'CT1', assembly: 'power-board', position: [-5.5, PCB_TOP, 6.6], explodeOffset: [0, 4, 1], geometry: { factory: 'hall-sensor', marking: 'HALL 100A' }, mountedOn: 'pcb-main', removalNote: 'Soldered to the board with the battery busbar passing through its aperture.' },
    { id: 'k1', componentId: 'relay', label: 'Output / transfer relay K1', designator: 'K1', assembly: 'power-board', position: [3.6, PCB_TOP, 7.0], explodeOffset: [0, 4, 1.5], geometry: { factory: 'relay', marking: 'RELAY K1' }, mountedOn: 'pcb-main', removalNote: 'PCB relay soldered to the power board.' },
    { id: 'dc-lugs', componentId: 'dc-input', label: 'DC input lugs J1', designator: 'J1', assembly: 'power-board', position: [-14.5, PCB_TOP, 7.5], explodeOffset: [0, 4, 1.5], geometry: { factory: 'dc-lugs' }, mountedOn: 'pcb-main', removalNote: 'Threaded lugs soldered into the board; the battery cables bolt on here.' },
    { id: 't1', componentId: 'transformer', label: 'Line-frequency transformer T1', designator: 'T1', assembly: 'magnetics', position: [12.5, 0.15, -1], explodeOffset: [10, 7, -1], geometry: { factory: 'ei-transformer', size: [9, 8, 7.5], rating: '3kVA 30/230V' }, dependsOn: ['l1', 'c7'], removalNote: 'Four bolts through its clamp feet (≈ 25 kg). Its leads connect to the output filter, which must be removed first.' },
    { id: 'l1', componentId: 'inductor', label: 'Output filter inductor L1', designator: 'L1', assembly: 'magnetics', position: [12.5, 0.15, 7.5], explodeOffset: [9, 6, 6], geometry: { factory: 'toroid', outerDiameter: 6, height: 2.2, turns: 22, rating: '1.2mH 15A' }, removalNote: 'Held by a centre bolt and clamp; two leads to the transformer and relay.' },
    { id: 'c7', componentId: 'capacitor', label: 'Output filter capacitor C7 (film)', designator: 'C7', assembly: 'magnetics', position: [17.4, 0.15, 7.5], explodeOffset: [11, 6, 6], geometry: { factory: 'film-cap', size: [2.6, 2.2, 1.4], rating: '10µF 275V~' }, removalNote: 'Bracket-mounted AC film capacitor across the output.' },
    {
      id: 'pcb-ctrl',
      componentId: 'main-pcb',
      label: 'Control PCB',
      designator: 'PCB2',
      assembly: 'control-board',
      position: CTRL,
      explodeOffset: [0, 4, 6],
      geometry: { factory: 'pcb', size: [13, 5], color: 'blue', silk: [{ at: rel(-12.5, 10.0, CTRL), text: 'U6 MCU' }, { at: rel(-8.5, 10.0, CTRL), text: 'U1' }, { at: rel(-5, 9.6, CTRL), text: 'U7' }] },
      removalNote: 'Four standoffs and a ribbon cable to the power board.',
    },
    { id: 'u6', componentId: 'microcontroller', label: 'Microcontroller U6', designator: 'U6', assembly: 'control-board', position: [-12.5, PCB_TOP, 11.5], explodeOffset: [0, 3, 0], geometry: { factory: 'ic', pkg: 'lqfp64', marking: 'MCU 32-BIT' }, mountedOn: 'pcb-ctrl', removalNote: 'Fine-pitch IC soldered to the control board.' },
    { id: 'u1', componentId: 'pwm-controller', label: 'PWM controller U1 (charger)', designator: 'U1', assembly: 'control-board', position: [-8.5, PCB_TOP, 11.5], explodeOffset: [0, 3, 0], geometry: { factory: 'ic', pkg: 'dip16', marking: 'SG3525' }, mountedOn: 'pcb-ctrl', removalNote: 'Through-hole DIP-16 in a socket on the control board.' },
    { id: 'u7', componentId: 'voltage-sensor', label: 'Voltage-sense module U7', designator: 'U7', assembly: 'control-board', position: [-5, PCB_TOP, 11.5], explodeOffset: [0, 3, 0], geometry: { factory: 'voltage-sensor', marking: 'V-SENSE ISO' }, mountedOn: 'pcb-ctrl', removalNote: 'Plug-in module on header pins; unplug the HV sense leads first.' },
    { id: 'disp', componentId: 'display-board', label: 'Display board', assembly: 'display-board', position: [6.5, 3.0, 14.4], explodeOffset: [0, 4, 9], geometry: { factory: 'display-board', lines: ['AC  230V 50.0Hz', 'BAT 52.4V  86%', 'PV  1.24kW MPPT'] }, removalNote: 'Screwed to the inside of the front panel; a ribbon cable runs to the control board.' },
  ],
  procedure: [
    {
      id: 'isolate',
      title: 'Isolate every energy source',
      instruction: 'Switch the PV breaker OFF, unplug both PV connectors, disconnect the battery cables, and disconnect the AC output wiring. Lock off and tag the isolation points.',
      why: 'A hybrid inverter has three independent sources: battery, solar array and AC. Removing only one leaves the others able to drive dangerous voltages inside.',
      action: 'isolate',
      partIds: [],
      reassemblyTip: 'Reconnect last: PE first, then battery, then AC output, then PV, after the cover is fitted. Then run a functional test.',
      checkpoint: {
        prompt: 'The battery is disconnected and the display has gone dark. Which statement is correct?',
        options: ['The inverter is now safe to open', 'The PV input and the bus capacitors may still be live', 'Only the AC output terminals can still be live', 'A dark display proves the capacitors are discharged'],
        correct: 1,
        explanation: 'Daylight on the panels keeps the PV input live, and capacitors hold charge independently of the display. Isolation means every source, and stored energy is dealt with separately.',
      },
    },
    { id: 'cover', title: 'Remove the cover', instruction: 'Remove the eight cover screws, lift the cover and unclip its earth strap.', why: 'Access is needed, but only after isolation; the nameplate warns that stored energy remains for 5 minutes.', partIds: ['cover'], reassemblyTip: 'Refit the cover and reconnect its earth strap before any source is reconnected.' },
    {
      id: 'discharge',
      title: 'Discharge and verify the PV-bus capacitors',
      instruction: 'Run the discharge simulator: choose a safe method, watch the voltage and energy decay, then confirm below 50 V with the meter.',
      why: 'C5 + C6 (940 µF) hold about 83 J at 420 V, enough to injure. The bleeder resistors are slow and can fail open, so the voltage must be measured, never assumed.',
      action: 'discharge',
      partIds: [],
      reassemblyTip: 'Not needed during reassembly: the bank stays discharged until power is restored.',
      checkpoint: {
        prompt: 'If the voltage on a capacitor halves, its stored energy…',
        options: ['halves', 'falls to one quarter', 'stays the same', 'doubles'],
        correct: 1,
        explanation: 'E = ½·C·V². Energy is proportional to V², so half the voltage leaves (½)² = ¼ of the energy.',
      },
    },
    { id: 'display', title: 'Remove the display board', instruction: 'Release the ribbon cable latch and unscrew the display board from the front panel.', why: 'Its cable runs over the control board, so it comes out first.', partIds: ['disp'], reassemblyTip: 'Reconnect the ribbon with the latch fully closed; a half-seated ribbon causes a blank display.' },
    { id: 'control', title: 'Remove the control electronics', instruction: 'Unplug the voltage-sense module, lift out the MCU and PWM controller for inspection, then remove the control PCB.', why: 'The control board sits above the power-board cable path. Its components come off before the board itself.', partIds: ['u7', 'u6', 'u1', 'pcb-ctrl'], reassemblyTip: 'Board first, then its components; check IC orientation by the pin-1 marks.' },
    { id: 'fan', title: 'Remove the cooling fan', instruction: 'Unplug the three-wire fan lead and remove the four screws.', why: 'The fan is mounted in front of the heat-sink fin channel and blocks the heat sink.', partIds: ['fan'], reassemblyTip: 'Airflow arrow must point into the heat-sink fins.' },
    {
      id: 'switches',
      title: 'Free the power switches',
      instruction: 'Remove the clamp screw through each TO-247 tab, keep the insulating pads, and desolder the leads.',
      why: 'Each switch is bolted to the heat sink and soldered into the power board, so it locks the two together until it is freed.',
      partIds: ['q1', 'q2', 'q3', 'q4', 'q5', 'q6'],
      reassemblyTip: 'Fit new insulating pads and bushes; torque the clamp screws evenly; check tab-to-heat-sink resistance is OL.',
      checkpoint: {
        prompt: 'Why must an insulating thermal pad be fitted under each TO-247 tab?',
        options: ['It makes the screw easier to tighten', 'The tab is at drain/collector potential and the heat sink is earthed; the pad insulates while conducting heat', 'It reduces the switching frequency', 'It is only cosmetic'],
        correct: 1,
        explanation: 'Without the pad, the live tab would short to the earthed heat sink. Pads are thin enough to conduct heat but rated to withstand the voltage.',
      },
    },
    { id: 'heatsink', title: 'Remove the heat sink', instruction: 'Disconnect the heat-sink earth bond and remove its base bolts.', why: 'Now that the switches are free, the heat sink can be lifted out.', partIds: ['heatsink'], reassemblyTip: 'Reconnect the earth bond to the heat sink before fitting the switches.' },
    {
      id: 'power-board',
      title: 'Strip and remove the power board',
      instruction: 'Remove the board-mounted parts (capacitors, bleeders, diodes, gate drivers, current sensor, relay, DC lugs), then lift the PCB off its standoffs.',
      why: 'Parts are soldered to the board; the board can only come out once it is empty.',
      partIds: ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'r1', 'r2', 'd1', 'd2', 'u2', 'u3', 'u4', 'hall', 'k1', 'dc-lugs', 'pcb-main'],
      reassemblyTip: 'Board first, then parts. Electrolytic polarity: the stripe marks the negative pin; diode band marks the cathode.',
    },
    { id: 'magnetics', title: 'Remove the output filter and transformer', instruction: 'Disconnect the filter leads, remove the toroid L1 and film capacitor C7, then lift out the transformer with two hands.', why: 'L1 and C7 are wired to the transformer secondary, and the transformer is the heaviest part.', partIds: ['l1', 'c7', 't1'], reassemblyTip: 'Transformer first and bolted down, then the filter parts; restore the core earth bond.' },
    {
      id: 'terminals',
      title: 'Remove the terminal block and earth stud',
      instruction: 'Remove AC terminals, PV breaker, PV connectors, fuse and battery terminals. Remove the protective-earth stud last.',
      why: 'The earth bond protects anyone touching the chassis; it is the last connection removed and the first restored.',
      partIds: [...terminalStage, 'pe'],
      reassemblyTip: 'Fit the protective-earth stud first and check continuity (< 0.1 Ω) before anything else.',
      checkpoint: {
        prompt: 'During reassembly, which connection should be made first and checked before anything else?',
        options: ['AC line terminal', 'Protective earth bonding', 'PV positive connector', 'Display ribbon cable'],
        correct: 1,
        explanation: 'The protective earth makes the chassis safe if any later connection is faulty, so it goes first and is verified by a continuity test.',
      },
    },
  ],
  dischargeBank: { label: 'PV-bus capacitors C5 + C6', partIds: ['c5', 'c6'], capacitanceF: 940e-6, initialV: 420, bleederOhms: 94_000 },
}
