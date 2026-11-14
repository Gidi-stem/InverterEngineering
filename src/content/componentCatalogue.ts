import type { ComponentCategory } from '../types/domain'

/**
 * Index of the components students must learn to identify.
 * Phase 3 attaches the full ElectronicComponent entries; this index is used now
 * as the denominator for identification progress so the number is stable.
 */
export const COMPONENT_INDEX: { id: string; name: string; category: ComponentCategory }[] = [
  { id: 'mosfet', name: 'MOSFET', category: 'power-switching' },
  { id: 'igbt', name: 'IGBT', category: 'power-switching' },
  { id: 'transformer', name: 'Transformer', category: 'power-conversion' },
  { id: 'capacitor', name: 'Capacitor', category: 'passive' },
  { id: 'inductor', name: 'Inductor', category: 'passive' },
  { id: 'diode', name: 'Diode', category: 'passive' },
  { id: 'resistor', name: 'Resistor', category: 'passive' },
  { id: 'relay', name: 'Relay', category: 'protection' },
  { id: 'gate-driver', name: 'Gate driver', category: 'control' },
  { id: 'pwm-controller', name: 'PWM controller', category: 'control' },
  { id: 'microcontroller', name: 'Microcontroller', category: 'control' },
  { id: 'heat-sink', name: 'Heat sink', category: 'cooling' },
  { id: 'cooling-fan', name: 'Cooling fan', category: 'cooling' },
  { id: 'fuse', name: 'Fuse', category: 'protection' },
  { id: 'circuit-breaker', name: 'Circuit breaker', category: 'protection' },
  { id: 'voltage-sensor', name: 'Voltage sensor', category: 'measurement' },
  { id: 'current-sensor', name: 'Current sensor', category: 'measurement' },
  { id: 'main-pcb', name: 'Main PCB', category: 'control' },
  { id: 'battery-terminals', name: 'Battery terminals', category: 'battery-charging' },
  { id: 'dc-input', name: 'DC input terminals', category: 'io-connection' },
  { id: 'ac-output', name: 'AC output terminals', category: 'io-connection' },
  { id: 'solar-input', name: 'Solar input terminals', category: 'io-connection' },
  { id: 'display-board', name: 'Display board', category: 'control' },
  { id: 'protective-earth', name: 'Protective earth', category: 'protection' },
]
