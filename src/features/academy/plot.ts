/** Polyline of a function sampled over [0,1] into a rectangle. */
export function plot(f: (t: number) => number, x: number, y: number, w: number, h: number, lo: number, hi: number, n = 400) {
  let d = ''
  for (let i = 0; i <= n; i++) {
    const t = i / n
    const v = f(t)
    const px = x + t * w
    const py = y + h - ((v - lo) / (hi - lo)) * h
    d += `${i ? 'L' : 'M'}${px.toFixed(1)} ${py.toFixed(1)}`
  }
  return d
}
