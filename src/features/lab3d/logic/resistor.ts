/** IEC 60062 four-band resistor colour code. */
export const BAND_COLOURS = ['black', 'brown', 'red', 'orange', 'yellow', 'green', 'blue', 'violet', 'grey', 'white'] as const
export type BandColour = (typeof BAND_COLOURS)[number] | 'gold' | 'silver'

export const BAND_HEX: Record<BandColour, string> = {
  black: '#1a1a1a',
  brown: '#6b3a1e',
  red: '#c62828',
  orange: '#ef6c00',
  yellow: '#f9d71c',
  green: '#2e7d32',
  blue: '#1565c0',
  violet: '#7b1fa2',
  grey: '#8a8a8a',
  white: '#f2f2f2',
  gold: '#c9a227',
  silver: '#b8bcc2',
}

const TOLERANCE: Record<number, BandColour> = { 1: 'brown', 2: 'red', 5: 'gold', 10: 'silver' }

/** Four-band code for values from 1 Ω up to 99 GΩ with two significant digits. */
export function resistorBands(ohms: number, tolerancePct: 1 | 2 | 5 | 10): [BandColour, BandColour, BandColour, BandColour] {
  if (!(ohms >= 1)) throw new Error('resistorBands supports values ≥ 1 Ω')
  let exp = Math.floor(Math.log10(ohms)) - 1
  let sig = Math.round(ohms / 10 ** exp)
  if (sig >= 100) {
    sig = Math.round(sig / 10)
    exp += 1
  }
  if (exp < 0 || exp > 9) throw new Error('value out of range for a four-band code')
  return [BAND_COLOURS[Math.floor(sig / 10)], BAND_COLOURS[sig % 10], BAND_COLOURS[exp], TOLERANCE[tolerancePct]]
}

export function formatOhms(ohms: number): string {
  if (ohms >= 1e6) return `${+(ohms / 1e6).toPrecision(3)} MΩ`
  if (ohms >= 1e3) return `${+(ohms / 1e3).toPrecision(3)} kΩ`
  return `${+ohms.toPrecision(3)} Ω`
}
