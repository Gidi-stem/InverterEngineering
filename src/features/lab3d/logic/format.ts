/** Human-readable duration for simulated times from milliseconds to minutes. */
export function fmtTime(s: number) {
  if (s < 1) return `${(s * 1000).toFixed(0)} ms`
  if (s < 120) return `${s.toFixed(1)} s`
  return `${(s / 60).toFixed(1)} min`
}
