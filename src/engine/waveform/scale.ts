const NICE = [1, 2, 5]

/** Smallest 1-2-5 step ≥ x (oscilloscope volts/div and time/div convention). */
export function niceStep(x: number): number {
  if (!(x > 0) || !Number.isFinite(x)) return 1
  const e = Math.floor(Math.log10(x))
  for (const n of NICE) if (n * 10 ** e >= x) return n * 10 ** e
  return 10 ** (e + 1)
}
