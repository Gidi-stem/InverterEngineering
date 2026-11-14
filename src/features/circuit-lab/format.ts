import { PART_DEFS, param } from '../../engine/circuit/parts'
import type { PlacedPart } from '../../engine/circuit/types'

/** Grid pitch in SVG user units (px at zoom 1). */
export const G = 20

const PREFIX: [number, string][] = [
  [1e6, 'M'],
  [1e3, 'k'],
  [1, ''],
  [1e-3, 'm'],
  [1e-6, 'µ'],
  [1e-9, 'n'],
]

/** Engineering notation: 4700 Ω → "4.7 kΩ", 0.015 A → "15 mA". */
export function eng(value: number, unit: string, digits = 3): string {
  if (!Number.isFinite(value)) return '—'
  if (value === 0) return `0 ${unit}`
  const a = Math.abs(value)
  const [m, p] = PREFIX.find(([m]) => a >= m * 0.9995) ?? PREFIX[PREFIX.length - 1]
  const n = value / m
  return `${Number(n.toPrecision(digits))} ${p}${unit}`
}

/** Capacitance as marked on real parts: µF from 1 µF up (1000 µF, not 1 mF), nF/pF below. */
const capText = (uF: number) => (uF >= 1 ? `${Number(uF.toPrecision(4))} µF` : eng(uF * 1e-6, 'F'))

/** Node/terminal voltage: below 0.5 mV is solver leakage through open contacts, shown as 0 V. */
export const volts = (v: number) => eng(Math.abs(v) < 5e-4 ? 0 : v, 'V')

/** One-line value shown beside a part on the workspace, e.g. "1 kΩ", "12 V · 1 A". */
export function partValue(p: PlacedPart): string {
  const v = (k: string) => param(p, k)
  switch (p.type) {
    case 'battery':
      return eng(v('V'), 'V')
    case 'dc-supply':
      return `${eng(v('V'), 'V')} · ${eng(v('Ilim'), 'A')}`
    case 'ac-source':
      return `${eng(v('Vrms'), 'V')} rms · ${v('f')} Hz`
    case 'gate-source':
      return p.states.level ? `HIGH ${v('Vhigh')} V` : 'LOW'
    case 'resistor':
    case 'dc-load':
    case 'ac-load':
      return eng(v('R'), 'Ω')
    case 'capacitor':
      return capText(v('C'))
    case 'electrolytic':
      return `${capText(v('C'))} ${v('Vmax')} V`
    case 'inductor':
      return eng(v('L') * 1e-3, 'H')
    case 'transformer':
      return `n = ${v('n')}`
    case 'fuse':
      return `${v('Irated')} A`
    case 'breaker':
      return `${v('Irated')} A · ${p.states.on ? 'ON' : 'OFF'}`
    case 'switch':
      return p.states.closed ? 'closed' : 'open'
    case 'relay':
      return `${v('Vcoil')} V coil`
    case 'led':
      return `${v('Imax')} mA max`
    default:
      return ''
  }
}

export const partName = (p: PlacedPart) => PART_DEFS[p.type].name
export const terminalLabel = (p: PlacedPart, tid: string) => PART_DEFS[p.type].terminals.find((t) => t.id === tid)?.label ?? tid
