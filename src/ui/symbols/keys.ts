/** Schematic symbols available in the symbol library (one per catalogued component). */
export const SYMBOL_KEYS = [
  'mosfet',
  'igbt',
  'transformer',
  'inductor',
  'capacitor',
  'diode',
  'resistor',
  'gate-driver',
  'pwm-controller',
  'microcontroller',
  'display-board',
  'main-pcb',
  'relay',
  'fuse',
  'circuit-breaker',
  'voltage-sensor',
  'current-sensor',
  'heat-sink',
  'cooling-fan',
  'battery-terminals',
  'dc-input',
  'ac-output',
  'solar-input',
  'protective-earth',
] as const

export type SymbolKey = (typeof SYMBOL_KEYS)[number]
