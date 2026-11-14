import type { PartDef, PartType, PlacedPart, Rotation, TerminalDef } from './types'

/**
 * Circuit-lab part catalogue. Terminal ids match the Component Library entries where a part is
 * modelled on one (componentId), so pins carry the same names everywhere in the application.
 * Parameter ranges keep practical exercises in the low-voltage, current-limited range by default.
 */
const v = (id: string, label: string, x: number, y: number): TerminalDef => ({ id, label, x, y })

const twoPinH = (a: [string, string], b: [string, string]) => [v(a[0], a[1], -2, 0), v(b[0], b[1], 2, 0)]
const twoPinV = (a: [string, string], b: [string, string]) => [v(a[0], a[1], 0, -2), v(b[0], b[1], 0, 2)]
const boxH = { x: -2, y: -1, w: 4, h: 2 }
const boxV = { x: -1.5, y: -2, w: 3, h: 4 }

export const PART_DEFS: Record<PartType, PartDef> = {
  battery: {
    type: 'battery',
    name: 'Battery',
    prefix: 'B',
    group: 'sources',
    description: 'Electrochemical DC source with internal resistance. Not current-limited: a short circuit can deliver very large currents.',
    terminals: twoPinV(['+', '+'], ['-', '−']),
    params: [
      { key: 'V', label: 'Voltage', unit: 'V', default: 12, min: 1.5, max: 48, step: 0.1 },
      { key: 'Rint', label: 'Internal resistance', unit: 'Ω', default: 0.05, min: 0.005, max: 5, step: 0.005 },
    ],
    box: boxV,
  },
  'dc-supply': {
    type: 'dc-supply',
    name: 'Bench DC supply',
    prefix: 'PS',
    group: 'sources',
    description: 'Isolated, current-limited bench supply: constant voltage until the current limit is reached, then constant current. The safe way to power practical circuits.',
    terminals: twoPinV(['+', '+'], ['-', '−']),
    params: [
      { key: 'V', label: 'Voltage setting', unit: 'V', default: 12, min: 0, max: 30, step: 0.1 },
      { key: 'Ilim', label: 'Current limit', unit: 'A', default: 1, min: 0.01, max: 5, step: 0.01 },
    ],
    box: boxV,
  },
  'ac-source': {
    type: 'ac-source',
    name: 'Isolated AC source',
    prefix: 'AC',
    group: 'sources',
    description: 'Low-voltage AC from an isolating transformer. Evaluated at its positive and negative peaks (quasi-static snapshots).',
    terminals: twoPinV(['1', 'L'], ['2', 'N']),
    params: [
      { key: 'Vrms', label: 'Voltage', unit: 'V rms', default: 12, min: 1, max: 240, step: 0.5 },
      { key: 'f', label: 'Frequency', unit: 'Hz', default: 50, min: 40, max: 400, step: 1 },
    ],
    box: boxV,
  },
  'gate-source': {
    type: 'gate-source',
    name: 'Pulse / gate-drive generator',
    prefix: 'G',
    group: 'sources',
    description:
      'Isolated pulse generator and gate driver: OUT is driven to the set voltage above REF when high, and to REF when low (10 Ω output resistance). Static level, PWM (frequency, duty, phase, dead time) or sinusoidal PWM. Connect REF to the switch source/emitter.',
    terminals: twoPinV(['+', 'OUT'], ['-', 'REF']),
    params: [
      { key: 'Vhigh', label: 'High level', unit: 'V', default: 12, min: 3, max: 20, step: 0.5 },
      { key: 'f', label: 'Frequency (SPWM: carrier)', unit: 'Hz', default: 1000, min: 0.1, max: 100_000, step: 1, when: { state: 'mode', values: [1, 2] }, simOnly: true },
      { key: 'duty', label: 'Duty cycle', unit: '%', default: 50, min: 0, max: 100, step: 1, when: { state: 'mode', values: [1] }, simOnly: true },
      { key: 'phase', label: 'Phase delay', unit: '°', default: 0, min: 0, max: 360, step: 1, when: { state: 'mode', values: [1] }, simOnly: true },
      { key: 'fm', label: 'Sine (modulating) frequency', unit: 'Hz', default: 50, min: 1, max: 1000, step: 1, when: { state: 'mode', values: [2] }, simOnly: true },
      { key: 'm', label: 'Modulation index', unit: '', default: 0.9, min: 0, max: 1, step: 0.01, when: { state: 'mode', values: [2] }, simOnly: true },
      { key: 'td', label: 'Dead time (turn-on delay)', unit: 'µs', default: 0, min: 0, max: 1000, step: 0.1, when: { state: 'mode', values: [1, 2] }, simOnly: true },
    ],
    states: [
      { key: 'mode', label: 'Mode', options: [{ value: 0, label: 'Static' }, { value: 1, label: 'PWM' }, { value: 2, label: 'SPWM' }], default: 0 },
      { key: 'level', label: 'Output', options: [{ value: 0, label: 'Low' }, { value: 1, label: 'High' }], default: 0, when: { state: 'mode', values: [0] } },
      { key: 'invert', label: 'Polarity', options: [{ value: 0, label: 'Normal' }, { value: 1, label: 'Inverted' }], default: 0, when: { state: 'mode', values: [1, 2] } },
    ],
    box: boxV,
  },
  resistor: {
    type: 'resistor',
    name: 'Resistor',
    prefix: 'R',
    group: 'passives',
    componentId: 'resistor',
    description: 'Limits current: V = I·R. Its power rating must exceed I²·R.',
    terminals: twoPinH(['1', '1'], ['2', '2']),
    params: [
      { key: 'R', label: 'Resistance', unit: 'Ω', default: 1000, min: 0.1, max: 10_000_000, step: 1 },
      { key: 'Pmax', label: 'Power rating', unit: 'W', default: 0.25, min: 0.125, max: 50, step: 0.125 },
    ],
    box: boxH,
  },
  capacitor: {
    type: 'capacitor',
    name: 'Capacitor (film)',
    prefix: 'C',
    group: 'passives',
    componentId: 'capacitor',
    description: 'Non-polarised capacitor. Open circuit at DC steady state.',
    terminals: twoPinH(['1', '1'], ['2', '2']),
    params: [{ key: 'C', label: 'Capacitance', unit: 'µF', default: 10, min: 0.001, max: 1000, step: 0.1 }],
    box: boxH,
  },
  electrolytic: {
    type: 'electrolytic',
    name: 'Electrolytic capacitor',
    prefix: 'C',
    group: 'passives',
    componentId: 'capacitor',
    description: 'Polarised capacitor: + must stay at a higher voltage than −. Reverse voltage destroys it.',
    terminals: twoPinH(['+', '+'], ['-', '−']),
    params: [
      { key: 'C', label: 'Capacitance', unit: 'µF', default: 1000, min: 1, max: 100_000, step: 1 },
      { key: 'Vmax', label: 'Voltage rating', unit: 'V', default: 25, min: 6.3, max: 450, step: 0.1 },
    ],
    box: boxH,
  },
  inductor: {
    type: 'inductor',
    name: 'Inductor',
    prefix: 'L',
    group: 'magnetics',
    componentId: 'inductor',
    description: 'Opposes changes of current. At DC steady state only its winding resistance remains.',
    terminals: twoPinH(['1', '1'], ['2', '2']),
    params: [
      { key: 'L', label: 'Inductance', unit: 'mH', default: 1, min: 0.001, max: 1000, step: 0.1 },
      { key: 'Rdc', label: 'Winding resistance', unit: 'Ω', default: 0.1, min: 0.001, max: 100, step: 0.01 },
    ],
    box: boxH,
  },
  diode: {
    type: 'diode',
    name: 'Rectifier diode',
    prefix: 'D',
    group: 'semiconductors',
    componentId: 'diode',
    description: 'Conducts from anode (A) to cathode (K, the band) once forward-biased by about 0.7 V.',
    terminals: twoPinH(['a', 'A'], ['k', 'K']),
    params: [
      { key: 'Vf', label: 'Forward voltage (knee)', unit: 'V', default: 0.7, min: 0.2, max: 1.5, step: 0.05 },
      { key: 'Imax', label: 'Current rating', unit: 'A', default: 1, min: 0.1, max: 50, step: 0.1 },
    ],
    box: boxH,
  },
  led: {
    type: 'led',
    name: 'LED',
    prefix: 'LED',
    group: 'semiconductors',
    componentId: 'diode',
    description: 'Light-emitting diode: conducts A→K above its forward voltage (≈ 2 V red). Needs a series resistor to limit current.',
    terminals: twoPinH(['a', 'A'], ['k', 'K']),
    params: [
      { key: 'Vf', label: 'Forward voltage (knee)', unit: 'V', default: 1.8, min: 1.5, max: 3.5, step: 0.1 },
      { key: 'Imax', label: 'Maximum current', unit: 'mA', default: 25, min: 5, max: 50, step: 1 },
    ],
    box: boxH,
  },
  mosfet: {
    type: 'mosfet',
    name: 'N-channel MOSFET',
    prefix: 'Q',
    group: 'semiconductors',
    componentId: 'mosfet',
    description: 'Voltage-controlled switch: drain–source conducts (R_DS(on)) when V_GS exceeds the threshold. Body diode from S to D.',
    terminals: [v('g', 'G', -2, 0), v('d', 'D', 1, -2), v('s', 'S', 1, 2)],
    params: [
      { key: 'Vth', label: 'Gate threshold (fully on above)', unit: 'V', default: 4, min: 1, max: 10, step: 0.1 },
      { key: 'Ron', label: 'R_DS(on)', unit: 'Ω', default: 0.05, min: 0.001, max: 10, step: 0.001 },
      { key: 'Imax', label: 'Current rating', unit: 'A', default: 20, min: 0.1, max: 200, step: 0.1 },
      { key: 'tsw', label: 'Switching time per edge (typical)', unit: 'ns', default: 50, min: 1, max: 5000, step: 1, simOnly: true },
      { key: 'Rth', label: 'Thermal resistance junction→ambient (with heat sink)', unit: '°C/W', default: 5, min: 0.2, max: 100, step: 0.1, simOnly: true },
    ],
    box: { x: -2, y: -2, w: 4, h: 4 },
  },
  igbt: {
    type: 'igbt',
    name: 'IGBT',
    prefix: 'Q',
    group: 'semiconductors',
    componentId: 'igbt',
    description: 'Voltage-controlled switch with a near-constant on-state drop V_CE(sat). Co-packaged diode from E to C.',
    terminals: [v('g', 'G', -2, 0), v('c', 'C', 1, -2), v('e', 'E', 1, 2)],
    params: [
      { key: 'Vth', label: 'Gate threshold (fully on above)', unit: 'V', default: 7, min: 3, max: 12, step: 0.1 },
      { key: 'Vsat', label: 'V_CE(sat)', unit: 'V', default: 1.6, min: 0.8, max: 3, step: 0.1 },
      { key: 'Imax', label: 'Current rating', unit: 'A', default: 20, min: 0.1, max: 200, step: 0.1 },
      { key: 'tsw', label: 'Switching time per edge (typical)', unit: 'ns', default: 300, min: 1, max: 5000, step: 1, simOnly: true },
      { key: 'Rth', label: 'Thermal resistance junction→ambient (with heat sink)', unit: '°C/W', default: 3, min: 0.2, max: 100, step: 0.1, simOnly: true },
    ],
    box: { x: -2, y: -2, w: 4, h: 4 },
  },
  transformer: {
    type: 'transformer',
    name: 'Transformer',
    prefix: 'T',
    group: 'magnetics',
    componentId: 'transformer',
    description: 'Two coupled windings: V_s = n·V_p with n = N_s/N_p. Works only with changing (AC or switched) voltage; DC across a winding drives a large current.',
    terminals: [v('p1', 'P1', -2, -2), v('p2', 'P2', -2, 2), v('s1', 'S1', 2, -2), v('s2', 'S2', 2, 2)],
    params: [
      { key: 'n', label: 'Turns ratio N_s/N_p', unit: '', default: 0.5, min: 0.01, max: 50, step: 0.01 },
      { key: 'Rw', label: 'Winding resistance (each)', unit: 'Ω', default: 0.2, min: 0.001, max: 50, step: 0.01 },
      { key: 'Lm', label: 'Magnetising inductance (primary)', unit: 'H', default: 1, min: 0.001, max: 100, step: 0.001, simOnly: true },
    ],
    box: { x: -2, y: -2, w: 4, h: 4 },
  },
  relay: {
    type: 'relay',
    name: 'Relay',
    prefix: 'K',
    group: 'switching',
    componentId: 'relay',
    description: 'Coil A1–A2 moves the contact: COM–NC when released, COM–NO when energised.',
    terminals: [v('a1', 'A1', -3, -2), v('a2', 'A2', -3, 2), v('nc', 'NC', 1, -2), v('no', 'NO', 3, -2), v('com', 'COM', 2, 2)],
    params: [
      { key: 'Vcoil', label: 'Coil voltage', unit: 'V', default: 12, min: 3, max: 48, step: 1 },
      { key: 'Rcoil', label: 'Coil resistance', unit: 'Ω', default: 160, min: 10, max: 5000, step: 1 },
    ],
    box: { x: -3.5, y: -2, w: 7, h: 4 },
  },
  fuse: {
    type: 'fuse',
    name: 'Fuse',
    prefix: 'F',
    group: 'protection',
    componentId: 'fuse',
    description: 'Opens permanently if current exceeds its rating. Place it directly at the source positive.',
    terminals: twoPinH(['1', '1'], ['2', '2']),
    params: [{ key: 'Irated', label: 'Rating', unit: 'A', default: 2, min: 0.05, max: 200, step: 0.05 }],
    box: boxH,
  },
  breaker: {
    type: 'breaker',
    name: 'DC breaker (2-pole)',
    prefix: 'CB',
    group: 'protection',
    componentId: 'circuit-breaker',
    description: 'Resettable protection and isolation switch for both conductors.',
    terminals: [v('in+', '+ in', -1, -2), v('out+', '+ out', -1, 2), v('in-', '− in', 1, -2), v('out-', '− out', 1, 2)],
    params: [{ key: 'Irated', label: 'Rating', unit: 'A', default: 10, min: 0.5, max: 125, step: 0.5 }],
    states: [{ key: 'on', label: 'Handle', options: [{ value: 0, label: 'Off' }, { value: 1, label: 'On' }], default: 1 }],
    box: { x: -2, y: -2, w: 4, h: 4 },
  },
  switch: {
    type: 'switch',
    name: 'Switch (SPST)',
    prefix: 'S',
    group: 'switching',
    description: 'Manual on/off switch.',
    terminals: twoPinH(['1', '1'], ['2', '2']),
    params: [],
    states: [{ key: 'closed', label: 'Contacts', options: [{ value: 0, label: 'Open' }, { value: 1, label: 'Closed' }], default: 0 }],
    box: boxH,
  },
  ground: {
    type: 'ground',
    name: 'Ground / 0 V reference',
    prefix: 'GND',
    group: 'reference',
    description: 'Defines the 0 V reference node that voltages are measured from. It does not carry current by itself.',
    terminals: [v('gnd', '0 V', 0, 0)],
    params: [],
    box: { x: -1, y: 0, w: 2, h: 1.5 },
  },
  'dc-load': {
    type: 'dc-load',
    name: 'DC load (lamp)',
    prefix: 'LD',
    group: 'loads',
    description: 'Resistive DC load such as a 12 V lamp.',
    terminals: twoPinV(['+', '+'], ['-', '−']),
    params: [{ key: 'R', label: 'Resistance', unit: 'Ω', default: 24, min: 0.5, max: 100_000, step: 0.5 }],
    box: boxV,
  },
  'ac-load': {
    type: 'ac-load',
    name: 'AC load',
    prefix: 'LA',
    group: 'loads',
    description: 'Resistive AC load (e.g. a heater or lamp) for transformer and inverter outputs.',
    terminals: twoPinV(['1', '1'], ['2', '2']),
    params: [{ key: 'R', label: 'Resistance', unit: 'Ω', default: 100, min: 1, max: 100_000, step: 1 }],
    box: boxV,
  },
}

export const PART_GROUP_LABEL: Record<PartDef['group'], string> = {
  sources: 'Sources',
  passives: 'Passive components',
  semiconductors: 'Semiconductors',
  magnetics: 'Magnetics',
  protection: 'Protection',
  switching: 'Switching',
  loads: 'Loads',
  reference: 'Reference',
}

/** Rotate a local grid point by a multiple of 90° (clockwise in screen coordinates). */
export function rotatePoint(x: number, y: number, r: Rotation): [number, number] {
  switch (r) {
    case 0:
      return [x, y]
    case 90:
      return [-y, x]
    case 180:
      return [-x, -y]
    case 270:
      return [y, -x]
  }
}

/** Absolute grid position of a terminal of a placed part. */
export function terminalPosition(p: PlacedPart, terminalId: string): [number, number] {
  const t = PART_DEFS[p.type].terminals.find((x) => x.id === terminalId)
  if (!t) return [p.x, p.y]
  const [rx, ry] = rotatePoint(t.x, t.y, p.rotation)
  return [p.x + rx, p.y + ry]
}

export function defaultParams(type: PartType): Record<string, number> {
  return Object.fromEntries(PART_DEFS[type].params.map((q) => [q.key, q.default]))
}
export function defaultStates(type: PartType): Record<string, number> {
  return Object.fromEntries((PART_DEFS[type].states ?? []).map((q) => [q.key, q.default]))
}

export const param = (p: PlacedPart, key: string) => p.params[key] ?? PART_DEFS[p.type].params.find((q) => q.key === key)?.default ?? 0
export const stateOf = (p: PlacedPart, key: string, overrides?: Record<string, Record<string, number>>) =>
  overrides?.[p.id]?.[key] ?? p.states[key] ?? PART_DEFS[p.type].states?.find((q) => q.key === key)?.default ?? 0

/** The next free label for a part type, e.g. R3. */
export function nextLabel(parts: PlacedPart[], type: PartType): string {
  const prefix = PART_DEFS[type].prefix
  const used = new Set(parts.map((p) => p.label))
  for (let i = 1; ; i++) if (!used.has(`${prefix}${i}`)) return `${prefix}${i}`
}

export const tkey = (partId: string, terminalId: string) => `${partId}:${terminalId}`
