/**
 * Phase 7 photovoltaic model: an EDUCATIONAL single-diode model fitted to a module's STC
 * datasheet values. It reproduces the shape of real I–V curves and their dependence on
 * irradiance and temperature well enough to teach sizing and MPPT, but it is not a substitute for
 * the manufacturer's data or certified yield software.
 */

/** Datasheet values at Standard Test Conditions (1000 W/m², 25 °C cell, AM1.5). */
export interface ModuleSpec {
  id: string
  name: string
  /** Where the numbers came from: always shown with the module. */
  source: 'illustrative' | 'user'
  pmax: number
  voc: number
  isc: number
  vmp: number
  imp: number
  /** Temperature coefficients, %/°C (Voc and Pmax negative, Isc small positive). */
  betaVoc: number
  alphaIsc: number
  gammaPmax: number
  /** Nominal operating cell temperature, °C. */
  noct: number
  /** Cells in series. */
  cells: number
  /** Maximum series fuse rating, A (datasheet field). */
  maxFuse: number
  /** Maximum system voltage, V. */
  maxSystemV: number
}

/**
 * Example modules with ILLUSTRATIVE values: representative of common module classes, not any
 * manufacturer's product. Learners can edit every field to enter a real datasheet.
 */
export const EXAMPLE_MODULES: ModuleSpec[] = [
  { id: 'mono-400', name: 'Example 400 W, 108 half-cell mono module', source: 'illustrative', pmax: 400, voc: 37.1, isc: 13.8, vmp: 31.0, imp: 12.9, betaVoc: -0.27, alphaIsc: 0.048, gammaPmax: -0.35, noct: 45, cells: 54, maxFuse: 25, maxSystemV: 1000 },
  { id: 'mono-550', name: 'Example 550 W, 144 half-cell mono module', source: 'illustrative', pmax: 550, voc: 49.6, isc: 14.0, vmp: 41.7, imp: 13.2, betaVoc: -0.27, alphaIsc: 0.048, gammaPmax: -0.35, noct: 45, cells: 72, maxFuse: 25, maxSystemV: 1500 },
  { id: 'poly-330', name: 'Example 330 W, 72-cell module', source: 'illustrative', pmax: 330, voc: 46.0, isc: 9.3, vmp: 37.5, imp: 8.8, betaVoc: -0.31, alphaIsc: 0.05, gammaPmax: -0.39, noct: 45, cells: 72, maxFuse: 15, maxSystemV: 1000 },
  { id: 'mono-100-12v', name: 'Example 100 W, 36-cell “12 V” module', source: 'illustrative', pmax: 100, voc: 22.0, isc: 5.9, vmp: 18.0, imp: 5.56, betaVoc: -0.3, alphaIsc: 0.05, gammaPmax: -0.4, noct: 45, cells: 36, maxFuse: 10, maxSystemV: 600 },
]
export const MODULE_BY_ID: Record<string, ModuleSpec> = Object.fromEntries(EXAMPLE_MODULES.map((m) => [m.id, m]))

const K_Q = 8.617333e-5 // Boltzmann / electron charge, V/K

/** Fitted single-diode parameters at STC (shunt resistance taken as infinite). */
export interface DiodeFit {
  /** Modified ideality factor a = n·N_s·kT/q at 25 °C, V. */
  a: number
  /** Series resistance, Ω. */
  rs: number
}

/**
 * Fit a and R_s so that the model passes through (0, I_sc), (V_oc, 0) and (V_mp, I_mp) with
 * dP/dV = 0 at the maximum power point. With I₀·e^x = I_sc − I_mp at the MPP, the conditions are
 * R_s = (V_oc + a·ln(1 − I_mp/I_sc) − V_mp)/I_mp and g·(V_mp − I_mp·R_s) = I_mp with g = (I_sc − I_mp)/a.
 */
export function fitModule(m: ModuleSpec): DiodeFit {
  const rsOf = (a: number) => (m.voc + a * Math.log(1 - m.imp / m.isc) - m.vmp) / m.imp
  const h = (a: number) => ((m.isc - m.imp) / a) * (m.vmp - m.imp * rsOf(a)) - m.imp
  // a ranges from n = 0.8 to n = 2.5 per cell; choose the root with R_s ≥ 0.
  const vt = m.cells * K_Q * 298.15
  let lo = 0.8 * vt
  let hi = 2.5 * vt
  // Keep R_s ≥ 0 at the upper end.
  while (rsOf(hi) < 0 && hi > lo) hi *= 0.98
  if (Math.sign(h(lo)) === Math.sign(h(hi))) {
    // No interior root: fall back to n = 1.3 with R_s from the MPP condition (clamped ≥ 0).
    const a = 1.3 * vt
    return { a, rs: Math.max(0, rsOf(a)) }
  }
  for (let k = 0; k < 80; k++) {
    const mid = (lo + hi) / 2
    if (Math.sign(h(mid)) === Math.sign(h(lo))) lo = mid
    else hi = mid
  }
  const a = (lo + hi) / 2
  return { a, rs: Math.max(0, rsOf(a)) }
}

/** Cell temperature from ambient with the NOCT method: T_c = T_a + (NOCT − 20)/800 · G. */
export function cellTemp(m: ModuleSpec, ambient: number, g: number): number {
  return ambient + ((m.noct - 20) / 800) * g
}

/** Operating parameters of the model at irradiance g (W/m²) and cell temperature t (°C). */
export interface Operating {
  iph: number
  i0: number
  a: number
  rs: number
  voc: number
  isc: number
}

export function operating(m: ModuleSpec, g: number, t: number, fit = fitModule(m)): Operating {
  const dT = t - 25
  const a = fit.a * ((t + 273.15) / 298.15)
  const isc = Math.max(0, m.isc * (g / 1000) * (1 + (m.alphaIsc / 100) * dT))
  if (isc <= 0) return { iph: 0, i0: 1e-30, a, rs: fit.rs, voc: 0, isc: 0 }
  // V_oc falls linearly with temperature (datasheet β) and logarithmically with irradiance.
  const voc = Math.max(0, m.voc * (1 + (m.betaVoc / 100) * dT) + a * Math.log(g / 1000))
  const i0 = isc / Math.expm1(voc / a)
  return { iph: isc, i0, a, rs: fit.rs, voc, isc }
}

/** Module current at terminal voltage v (Newton iteration on the implicit diode equation). */
export function currentAt(op: Operating, v: number): number {
  if (op.isc <= 0) return 0
  if (v >= op.voc) return 0
  let i = op.isc * (1 - Math.max(0, v) / op.voc)
  for (let k = 0; k < 50; k++) {
    const e = Math.exp((v + i * op.rs) / op.a)
    const f = op.iph - op.i0 * (e - 1) - i
    const df = -op.i0 * e * (op.rs / op.a) - 1
    const step = f / df
    i -= step
    if (Math.abs(step) < 1e-9) break
  }
  return Math.max(0, i)
}

/** Module voltage at current i (closed form for infinite shunt resistance). */
export function voltageAt(op: Operating, i: number): number {
  if (i >= op.iph) return 0
  return op.a * Math.log((op.iph - i) / op.i0 + 1) - i * op.rs
}

export interface CurvePoint {
  v: number
  i: number
  p: number
}

/**
 * I–V curve of a string of `series` modules and `strings` identical strings in parallel. Each
 * module of a string may have its own irradiance (partial shading); a module whose current
 * capability is exceeded is bypassed by its diode (−vBypass per module). Identical strings are assumed.
 */
export function arrayCurve(m: ModuleSpec, opts: { series: number; strings: number; g: number | number[]; tCell: number; vBypass?: number; points?: number }): CurvePoint[] {
  const fit = fitModule(m)
  const gs = Array.isArray(opts.g) ? opts.g : Array.from({ length: opts.series }, () => opts.g as number)
  const ops = gs.map((g) => operating(m, g, opts.tCell, fit))
  const vb = opts.vBypass ?? 0.5
  const imax = Math.max(...ops.map((o) => o.isc))
  const n = opts.points ?? 240
  const pts: CurvePoint[] = []
  for (let k = 0; k <= n; k++) {
    const i = (imax * k) / n
    let v = 0
    for (const o of ops) v += i < o.iph ? voltageAt(o, i) : -vb
    const vs = Math.max(0, v)
    const ia = i * opts.strings
    pts.push({ v: vs, i: ia, p: vs * ia })
  }
  // Order by voltage for plotting and search.
  return pts.sort((x, y) => x.v - y.v)
}

/** Maximum power point of a curve (global). */
export function mpp(curve: CurvePoint[]): CurvePoint {
  return curve.reduce((b, p) => (p.p > b.p ? p : b), curve[0] ?? { v: 0, i: 0, p: 0 })
}

/** Linear interpolation of the curve's current at voltage v. */
export function curveCurrent(curve: CurvePoint[], v: number): number {
  if (!curve.length) return 0
  if (v <= curve[0].v) return curve[0].i
  for (let k = 1; k < curve.length; k++) {
    const a = curve[k - 1]
    const b = curve[k]
    if (v <= b.v) return b.v === a.v ? Math.max(a.i, b.i) : a.i + ((b.i - a.i) * (v - a.v)) / (b.v - a.v)
  }
  return 0
}

export interface TrackStep {
  v: number
  p: number
}

/**
 * Perturb-and-observe MPPT: start at 80 % of V_oc, step ΔV, keep direction while power rises,
 * reverse when it falls. On a multi-peak (shaded) curve it can settle on a local peak; with
 * `scan` it first sweeps the whole curve (as many real controllers do periodically).
 */
export function perturbObserve(curve: CurvePoint[], opts: { steps?: number; dv?: number; scan?: boolean } = {}): { path: TrackStep[]; final: TrackStep } {
  const vocA = curve[curve.length - 1]?.v ?? 0
  const dv = opts.dv ?? Math.max(0.2, vocA * 0.01)
  let v = opts.scan ? mpp(curve).v : 0.8 * vocA
  let dir = -1
  let p = v * curveCurrent(curve, v)
  const path: TrackStep[] = [{ v, p }]
  for (let k = 0; k < (opts.steps ?? 60); k++) {
    const nv = Math.min(vocA, Math.max(0, v + dir * dv))
    const np = nv * curveCurrent(curve, nv)
    if (np < p) dir = -dir
    v = nv
    p = np
    path.push({ v, p })
  }
  return { path, final: path[path.length - 1] }
}

/**
 * PWM controller: the array is connected (through the switch) straight to the battery, so it
 * operates at the battery voltage plus the wiring and switch drop, wherever that falls on its curve.
 */
export function pwmOperating(curve: CurvePoint[], vBattery: number, vDrop = 0.5): CurvePoint {
  const v = vBattery + vDrop
  const i = curveCurrent(curve, v)
  // Power delivered to the battery is at battery voltage.
  return { v, i, p: vBattery * i }
}
