/** "18-23, 5-7" ↔ [[18, 23], [5, 7]] */
export const windowsToText = (w: [number, number][]) => w.map(([a, b]) => `${a}-${b}`).join(', ')
export function textToWindows(t: string): [number, number][] | null {
  const parts = t.split(',').map((s) => s.trim()).filter(Boolean)
  const out: [number, number][] = []
  for (const p of parts) {
    const m = /^(\d+(?:\.\d+)?)\s*[-–]\s*(\d+(?:\.\d+)?)$/.exec(p)
    if (!m) return null
    const a = Number(m[1])
    const b = Number(m[2])
    if (a < 0 || a > 24 || b < 0 || b > 24 || a === b) return null
    out.push([a, b])
  }
  return out
}
