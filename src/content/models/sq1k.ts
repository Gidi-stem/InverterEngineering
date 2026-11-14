import type { InverterModel, ModelPart, Vec3 } from '../../types/domain'

/**
 * SQ-1K: 1 kW, 12 V square-wave inverter. Push-pull MOSFETs driven by an SG3525 into a
 * centre-tapped transformer. A simple design used to compare with the LF-3K.
 */
const PCB_TOP = 1.15
const MAIN: Vec3 = [-3, PCB_TOP, 2.0]
const rel = (x: number, z: number): [number, number] => [+(x - MAIN[0]).toFixed(2), +(z - MAIN[2]).toFixed(2)]
const terminalStage = ['ac-out', 'fuse', 'bat-pos', 'bat-neg']

const mosfets: ModelPart[] = [-8.2, -6.0, -3.8, -1.6].map((x, i) => ({
  id: `q${i + 1}`,
  componentId: 'mosfet',
  label: `MOSFET Q${i + 1} (push-pull ${i < 2 ? 'side A' : 'side B'})`,
  designator: `Q${i + 1}`,
  assembly: 'power-board',
  position: [x, PCB_TOP, -1.15],
  explodeOffset: [0, 5, 2],
  geometry: { factory: 'to247', kind: 'mosfet', marking: 'IRFP4468' },
  mountedOn: 'pcb-main',
  removalNote: 'Clamped to the heat sink and soldered to the board.',
}))

export const SQ1K: InverterModel = {
  id: 'sq1k',
  name: 'SQ-1K square-wave inverter (1 kW, 12 V)',
  summary: 'A basic push-pull square-wave inverter: SG3525 oscillator, four MOSFETs, centre-tapped transformer. No sine filter, no solar input, no display. Compare its parts count with the LF-3K.',
  topology: 'square-wave',
  ratedPowerW: 1000,
  batteryV: 12,
  outputVrms: 230,
  outputHz: 50,
  size: [26, 9, 18],
  assemblies: [
    { id: 'chassis', label: 'Chassis and earth' },
    { id: 'terminal-block', label: 'Terminal block' },
    { id: 'power-board', label: 'Power board' },
    { id: 'magnetics', label: 'Transformer' },
    { id: 'cooling', label: 'Cooling' },
  ],
  parts: [
    { id: 'enclosure', componentId: 'enclosure', label: 'Enclosure (chassis tray)', assembly: 'chassis', position: [0, 0, 0], explodeOffset: [0, 0, 0], geometry: { factory: 'enclosure-base', size: [26, 9, 18], displayWindow: false }, removalNote: 'The chassis stays on the bench.' },
    { id: 'cover', componentId: 'enclosure', label: 'Top cover with nameplate', assembly: 'chassis', position: [0, 0, 0], explodeOffset: [0, 12, 0], geometry: { factory: 'enclosure-cover', size: [26, 9, 18], nameplate: ['SQ-1K SQUARE-WAVE INVERTER', '1 kW  12 V ⎓  230 V~ 50 Hz', '⚠ HAZARDOUS VOLTAGE INSIDE'] }, removalNote: 'Four screws and an earth strap.' },
    { id: 'pe', componentId: 'protective-earth', label: 'Protective earth stud', assembly: 'chassis', position: [11, 0.15, -3], explodeOffset: [3, 3, -3], geometry: { factory: 'pe-stud' }, dependsOn: terminalStage, removalNote: 'Last connection removed, first reconnected.' },
    { id: 'bat-pos', componentId: 'battery-terminals', label: 'Battery terminal + (red)', assembly: 'terminal-block', position: [-10.5, 0.15, -7], explodeOffset: [-2, 4, -6], geometry: { factory: 'battery-terminal', polarity: '+' }, removalNote: 'Bolted to the rear shelf.' },
    { id: 'bat-neg', componentId: 'battery-terminals', label: 'Battery terminal − (black)', assembly: 'terminal-block', position: [-7.3, 0.15, -7], explodeOffset: [0, 4, -6], geometry: { factory: 'battery-terminal', polarity: '-' }, removalNote: 'Bolted to the rear shelf.' },
    { id: 'fuse', componentId: 'fuse', label: 'Battery fuse 150 A', assembly: 'terminal-block', position: [-1.5, 0.15, -7], explodeOffset: [0, 4, -6], geometry: { factory: 'mega-fuse', amps: 150 }, removalNote: 'Two bolts on its holder.' },
    { id: 'ac-out', componentId: 'ac-output', label: 'AC output terminals L / N / PE', assembly: 'terminal-block', position: [7, 0.15, -7], explodeOffset: [2, 4, -6], geometry: { factory: 'ac-terminal-block' }, removalNote: 'Screwed to the base.' },
    { id: 'heatsink', componentId: 'heat-sink', label: 'Heat sink', assembly: 'cooling', position: [-4.9, 0.15, -1.5], explodeOffset: [0, 3, -5], geometry: { factory: 'heatsink', length: 9.6, height: 5, finDepth: 2.5, fins: 10 }, removalNote: 'All four MOSFETs are clamped to it.' },
    { id: 'fan', componentId: 'cooling-fan', label: 'Cooling fan 60 mm', assembly: 'cooling', position: [-11.6, 3.2, -2.5], explodeOffset: [-6, 1, 0], geometry: { factory: 'fan', size: 6, depth: 2, rating: '0.18A' }, removalNote: 'Two screws and a plug-in lead.' },
    {
      id: 'pcb-main',
      componentId: 'main-pcb',
      label: 'Main PCB',
      designator: 'PCB1',
      assembly: 'power-board',
      position: MAIN,
      explodeOffset: [0, 2.5, 1],
      geometry: {
        factory: 'pcb',
        size: [14, 6.6],
        color: 'green',
        silk: [...[-8.2, -6.0, -3.8, -1.6].map((x, i) => ({ at: rel(x, -0.2), text: `Q${i + 1}` })), { at: rel(-7.5, 3.6), text: 'C1' }, { at: rel(-4, 3.6), text: 'C2' }, { at: rel(-0.6, 2.2), text: 'U1' }, { at: rel(-0.6, 4.7), text: 'R1' }, { at: rel(2.5, 4.7), text: 'D1' }],
      },
      removalNote: 'Four standoffs; all mounted parts must come off first.',
    },
    ...mosfets,
    ...[-7.5, -4.0].map((x, i): ModelPart => ({ id: `c${i + 1}`, componentId: 'capacitor', label: `Battery-bus capacitor C${i + 1}`, designator: `C${i + 1}`, assembly: 'power-board', position: [x, PCB_TOP, 2.6], explodeOffset: [0, 4, 0], geometry: { factory: 'electrolytic', diameter: 2.5, height: 4, rating: '4700µF 25V 105°C' }, mountedOn: 'pcb-main', removalNote: 'Soldered to the board.' })),
    { id: 'u1', componentId: 'pwm-controller', label: 'PWM oscillator U1', designator: 'U1', assembly: 'power-board', position: [-0.6, PCB_TOP, 3.2], explodeOffset: [0, 3, 0], geometry: { factory: 'ic', pkg: 'dip16', marking: 'SG3525AN' }, mountedOn: 'pcb-main', removalNote: 'DIP-16 in a socket.' },
    { id: 'r1', componentId: 'resistor', label: 'Bleeder resistor R1 (1 kΩ)', designator: 'R1', assembly: 'power-board', position: [-0.6, PCB_TOP, 5.6], explodeOffset: [0, 3, 0.5], geometry: { factory: 'axial-resistor', ohms: 1000, tolerancePct: 5, watts: 2 }, mountedOn: 'pcb-main', removalNote: 'Soldered across the bus capacitors.' },
    { id: 'd1', componentId: 'diode', label: 'Diode D1', designator: 'D1', assembly: 'power-board', position: [2.5, PCB_TOP, 5.6], explodeOffset: [0, 3, 0.5], geometry: { factory: 'axial-diode', marking: '1N5408' }, mountedOn: 'pcb-main', removalNote: 'Soldered to the board.' },
    { id: 't1', componentId: 'transformer', label: 'Centre-tapped transformer T1', designator: 'T1', assembly: 'magnetics', position: [8, 0.15, 2], explodeOffset: [7, 5, 0], geometry: { factory: 'ei-transformer', size: [7, 6, 6], rating: '1kVA 2×12/230V' }, removalNote: 'Four bolts; its leads must be disconnected first.' },
  ],
  procedure: [
    { id: 'isolate', title: 'Isolate the battery and AC output', instruction: 'Disconnect the battery cables and the AC output wiring; tag the isolation point.', why: 'This inverter has two sources: the battery and anything back-fed through the output.', action: 'isolate', partIds: [], reassemblyTip: 'Reconnect PE, then battery, then AC; run a functional test.' },
    { id: 'cover', title: 'Remove the cover', instruction: 'Remove four screws and the earth strap.', why: 'Access only after isolation.', partIds: ['cover'], reassemblyTip: 'Refit the cover and earth strap before reconnecting.' },
    { id: 'discharge', title: 'Check the bus capacitors', instruction: 'Run the discharge simulator and confirm with the meter.', why: 'A 12 V bank is below the shock threshold, but 9 400 µF can still deliver a damaging short-circuit spark; it must be checked like any other bank.', action: 'discharge', partIds: [], reassemblyTip: 'Not needed during reassembly.' },
    { id: 'fan', title: 'Remove the fan', instruction: 'Unplug and unscrew the fan.', why: 'It blocks the heat sink.', partIds: ['fan'], reassemblyTip: 'Airflow into the fins.' },
    { id: 'switches', title: 'Free the MOSFETs', instruction: 'Unclamp each MOSFET from the heat sink and desolder.', why: 'They lock the heat sink to the PCB.', partIds: ['q1', 'q2', 'q3', 'q4'], reassemblyTip: 'New insulating pads under every tab.' },
    { id: 'heatsink', title: 'Remove the heat sink', instruction: 'Remove its base screws.', why: 'Free once the MOSFETs are unclamped.', partIds: ['heatsink'], reassemblyTip: 'Restore its earth bond.' },
    { id: 'power-board', title: 'Strip and remove the PCB', instruction: 'Remove capacitors, oscillator IC, bleeder and diode, then lift the PCB.', why: 'The board comes out last.', partIds: ['c1', 'c2', 'u1', 'r1', 'd1', 'pcb-main'], reassemblyTip: 'Observe capacitor and diode polarity.' },
    { id: 'magnetics', title: 'Remove the transformer', instruction: 'Disconnect its leads and unbolt it.', why: 'Heavy; removed once its connections are free.', partIds: ['t1'], reassemblyTip: 'Bolt down before connecting leads.' },
    { id: 'terminals', title: 'Remove terminals and earth stud', instruction: 'Remove AC terminals, fuse and battery terminals; the PE stud last.', why: 'PE is last off, first on.', partIds: [...terminalStage, 'pe'], reassemblyTip: 'PE first, continuity < 0.1 Ω.' },
  ],
  dischargeBank: { label: 'Battery-bus capacitors C1 + C2', partIds: ['c1', 'c2'], capacitanceF: 9400e-6, initialV: 13.8, bleederOhms: 1000 },
}
