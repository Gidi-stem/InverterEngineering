/** 1-2-5 sequences for oscilloscope controls. */
const seq = (from: number, to: number) => {
  const out: number[] = []
  for (let e = Math.floor(Math.log10(from)); e <= Math.ceil(Math.log10(to)); e++)
    for (const m of [1, 2, 5]) {
      const v = Number((m * 10 ** e).toPrecision(3))
      if (v >= from * 0.999 && v <= to * 1.001) out.push(v)
    }
  return out
}
export const TIME_DIVS = seq(1e-6, 1)
export const V_DIVS = seq(0.01, 500)
export const A_DIVS = seq(0.001, 50)

/** Smallest scale that fits `pkpk` into about 6 divisions. */
export function autoScale(pkpk: number, unit: 'V' | 'A', maxAbs: number) {
  const list = unit === 'V' ? V_DIVS : A_DIVS
  const need = Math.max(pkpk / 6, maxAbs / 3.8)
  return list.find((d) => d >= need) ?? list[list.length - 1]
}

export const CH_COLORS = ['#facc15', '#22d3ee', '#f472b6', '#a3e635']

export function fmtSec(t: number) {
  const a = Math.abs(t)
  if (a === 0) return '0 s'
  if (a < 1e-3) return `${Number((t * 1e6).toPrecision(3))} µs`
  if (a < 1) return `${Number((t * 1e3).toPrecision(4))} ms`
  return `${Number(t.toPrecision(4))} s`
}
