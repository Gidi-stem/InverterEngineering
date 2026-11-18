import { PART_DEFS, param, stateOf, tkey } from './parts'
import type { CircuitDoc, PartResult, PlacedPart, SimMode, Solution, SolveOverrides, Topology } from './types'

/**
 * DC / quasi-static solver by modified nodal analysis (MNA).
 *
 * Unknowns: node voltages (reference node = 0 V) plus one current per ideal transformer in
 * AC-snapshot mode. Sources are Norton equivalents (V/R in parallel with 1/R), so no extra
 * unknowns are needed. Non-linear devices are piecewise linear and iterated until consistent:
 *   diode / LED : off = 1 GΩ; on = knee voltage V_f in series with R_d
 *   MOSFET      : channel R_DS(on) when V_GS > V_th else open; body diode S→D
 *   IGBT        : V_CE(sat) + R when V_GE > V_th; co-packed diode E→C
 *   relay       : contacts follow the coil voltage (pull-in at 70 % of rated)
 *   bench supply: constant voltage until the current limit, then constant current
 * A 1 nS leakage from every node to the reference keeps isolated sub-circuits solvable
 * without measurably affecting results.
 */
export const R_CLOSED = 1e-3
export const R_OPEN = 1e9
const G_MIN = 1e-9

type Prim =
  | { k: 'g'; part: string; tag: string; a: number; b: number; g: number }
  | { k: 'norton'; part: string; tag: string; p: number; m: number; V: number; R: number }
  | { k: 'isrc'; part: string; tag: string; into: number; outOf: number; I: number }
  | { k: 'pwl'; part: string; tag: string; a: number; b: number; on: boolean; Vf: number; Rd: number }
  | { k: 'xfmr'; part: string; tag: string; p1: number; p2: number; s1: number; s2: number; n: number; idx: number }

interface DeviceState {
  pwl: Map<string, boolean>
  switchOn: Map<string, boolean>
  relay: Map<string, boolean>
  cc: Map<string, boolean>
}

const DIODE_RD = 0.05
const LED_RD = 10

function buildPrims(doc: CircuitDoc, topo: Topology, mode: SimMode, st: DeviceState, ov: SolveOverrides) {
  const prims: Prim[] = []
  let extra = 0
  const N = (p: PlacedPart, t: string) => topo.nodeOf.get(tkey(p.id, t))!
  const removed = new Set(ov.remove ?? [])
  for (const p of doc.parts) {
    if (removed.has(p.id)) continue
    const id = p.id
    const g = (tag: string, a: string, b: string, R: number) => prims.push({ k: 'g', part: id, tag, a: N(p, a), b: N(p, b), g: 1 / R })
    const pwl = (tag: string, a: string, b: string, Vf: number, Rd: number) => prims.push({ k: 'pwl', part: id, tag, a: N(p, a), b: N(p, b), on: st.pwl.get(`${id}:${tag}`) ?? false, Vf, Rd })
    switch (p.type) {
      case 'battery':
        prims.push({ k: 'norton', part: id, tag: 'main', p: N(p, '+'), m: N(p, '-'), V: param(p, 'V'), R: Math.max(param(p, 'Rint'), 1e-3) })
        break
      case 'dc-supply':
        if (st.cc.get(id)) prims.push({ k: 'isrc', part: id, tag: 'main', into: N(p, '+'), outOf: N(p, '-'), I: param(p, 'Ilim') })
        else prims.push({ k: 'norton', part: id, tag: 'main', p: N(p, '+'), m: N(p, '-'), V: param(p, 'V'), R: 0.01 })
        break
      case 'ac-source': {
        const vpk = param(p, 'Vrms') * Math.SQRT2
        prims.push({ k: 'norton', part: id, tag: 'main', p: N(p, '1'), m: N(p, '2'), V: mode.kind === 'ac-snapshot' ? mode.polarity * vpk : 0, R: 0.1 })
        break
      }
      case 'gate-source':
        prims.push({ k: 'norton', part: id, tag: 'main', p: N(p, '+'), m: N(p, '-'), V: stateOf(p, 'level', ov.states) ? param(p, 'Vhigh') : 0, R: 10 })
        break
      case 'resistor':
        g('main', '1', '2', param(p, 'R'))
        break
      case 'dc-load':
        g('main', '+', '-', param(p, 'R'))
        break
      case 'ac-load':
        g('main', '1', '2', param(p, 'R'))
        break
      case 'inductor':
        g('main', '1', '2', param(p, 'Rdc'))
        break
      case 'capacitor':
      case 'electrolytic':
        break // open circuit in DC steady state and in quasi-static snapshots
      case 'diode':
        pwl('main', 'a', 'k', param(p, 'Vf'), DIODE_RD)
        break
      case 'led':
        pwl('main', 'a', 'k', param(p, 'Vf'), LED_RD)
        break
      case 'switch':
        g('main', '1', '2', stateOf(p, 'closed', ov.states) ? R_CLOSED : R_OPEN)
        break
      case 'fuse':
        g('main', '1', '2', 5e-3)
        break
      case 'breaker': {
        const on = stateOf(p, 'on', ov.states) === 1
        g('main', 'in+', 'out+', on ? R_CLOSED : R_OPEN)
        g('pole2', 'in-', 'out-', on ? R_CLOSED : R_OPEN)
        break
      }
      case 'mosfet':
        g('main', 'd', 's', st.switchOn.get(id) ? param(p, 'Ron') : R_OPEN)
        pwl('body', 's', 'd', 0.7, DIODE_RD)
        break
      case 'igbt':
        if (st.switchOn.get(id)) pwl('main', 'c', 'e', param(p, 'Vsat'), 0.05)
        else g('main', 'c', 'e', R_OPEN)
        pwl('body', 'e', 'c', 0.8, DIODE_RD)
        break
      case 'relay': {
        g('coil', 'a1', 'a2', param(p, 'Rcoil'))
        const on = st.relay.get(id) ?? false
        g('main', 'com', on ? 'no' : 'nc', R_CLOSED)
        g('open', 'com', on ? 'nc' : 'no', R_OPEN)
        break
      }
      case 'transformer':
        if (mode.kind === 'ac-snapshot') {
          prims.push({ k: 'xfmr', part: id, tag: 'main', p1: N(p, 'p1'), p2: N(p, 'p2'), s1: N(p, 's1'), s2: N(p, 's2'), n: param(p, 'n'), idx: extra++ })
        } else {
          g('main', 'p1', 'p2', param(p, 'Rw'))
          g('sec', 's1', 's2', param(p, 'Rw'))
        }
        break
      case 'pv-array': {
        // Simplified PV: I_sc into + from −, clamped by a knee at 0.8·V_oc that reaches I_sc at V_oc.
        const voc = param(p, 'Voc')
        const isc = param(p, 'Isc')
        prims.push({ k: 'isrc', part: id, tag: 'main', into: N(p, '+'), outOf: N(p, '-'), I: isc })
        pwl('pv', '+', '-', 0.8 * voc, (0.2 * voc) / isc)
        break
      }
      case 'transformer-ct':
        // Steady-state view: winding resistances only (coupling is handled by the transient engine).
        g('main', 'p1', 'pc', param(p, 'Rw'))
        g('half2', 'pc', 'p2', param(p, 'Rw'))
        g('sec', 's1', 's2', param(p, 'Rw'))
        break
      case 'vsense':
        g('main', '+', '-', R_OPEN)
        break
      case 'ground':
        break
    }
  }
  for (const inj of ov.inject ?? []) {
    if ('nodeA' in inj) {
      prims.push({ k: 'isrc', part: 'probe', tag: 'inject', into: inj.nodeA, outOf: inj.nodeB, I: inj.amps })
    } else {
      const p = doc.parts.find((x) => x.id === inj.partId)
      if (p) prims.push({ k: 'isrc', part: inj.partId, tag: 'inject', into: N(p, inj.plus), outOf: N(p, inj.minus), I: inj.amps })
    }
  }
  return { prims, extra }
}

/** Gaussian elimination with partial pivoting. Returns null if singular. */
function linsolve(A: number[][], b: number[]): number[] | null {
  const n = b.length
  for (let c = 0; c < n; c++) {
    let piv = c
    for (let r = c + 1; r < n; r++) if (Math.abs(A[r][c]) > Math.abs(A[piv][c])) piv = r
    if (Math.abs(A[piv][c]) < 1e-15) return null
    ;[A[c], A[piv]] = [A[piv], A[c]]
    ;[b[c], b[piv]] = [b[piv], b[c]]
    for (let r = c + 1; r < n; r++) {
      const f = A[r][c] / A[c][c]
      if (f === 0) continue
      for (let k = c; k < n; k++) A[r][k] -= f * A[c][k]
      b[r] -= f * b[c]
    }
  }
  const x = new Array(n).fill(0)
  for (let r = n - 1; r >= 0; r--) {
    let s = b[r]
    for (let k = r + 1; k < n; k++) s -= A[r][k] * x[k]
    x[r] = s / A[r][r]
  }
  return x
}

function solveLinear(topo: Topology, prims: Prim[], extra: number) {
  const ref = topo.referenceNode ?? 0
  const nn = topo.nodes.length
  const idx = new Map<number, number>()
  let k = 0
  for (let i = 0; i < nn; i++) if (i !== ref) idx.set(i, k++)
  const size = k + extra
  const A = Array.from({ length: size }, () => new Array(size).fill(0))
  const b = new Array(size).fill(0)
  const G = (a: number, c: number, val: number) => {
    const ia = idx.get(a)
    const ic = idx.get(c)
    if (ia !== undefined && ic !== undefined) A[ia][ic] += val
  }
  const I = (n: number, val: number) => {
    const i = idx.get(n)
    if (i !== undefined) b[i] += val
  }
  const cond = (a: number, c: number, g: number) => {
    G(a, a, g)
    G(c, c, g)
    G(a, c, -g)
    G(c, a, -g)
  }
  for (let i = 0; i < nn; i++) if (i !== ref) G(i, i, G_MIN)
  for (const e of prims) {
    if (e.k === 'g') cond(e.a, e.b, e.g)
    else if (e.k === 'norton') {
      cond(e.p, e.m, 1 / e.R)
      I(e.p, e.V / e.R)
      I(e.m, -e.V / e.R)
    } else if (e.k === 'isrc') {
      I(e.into, e.I)
      I(e.outOf, -e.I)
    } else if (e.k === 'pwl') {
      const g = e.on ? 1 / e.Rd : 1 / R_OPEN
      cond(e.a, e.b, g)
      if (e.on) {
        I(e.a, g * e.Vf)
        I(e.b, -g * e.Vf)
      }
    } else if (e.k === 'xfmr') {
      const col = k + e.idx
      const put = (node: number, val: number) => {
        const i = idx.get(node)
        if (i !== undefined) A[i][col] += val
      }
      put(e.p1, 1)
      put(e.p2, -1)
      put(e.s1, -1 / e.n)
      put(e.s2, 1 / e.n)
      const row = col
      const rowPut = (node: number, val: number) => {
        const i = idx.get(node)
        if (i !== undefined) A[row][i] += val
      }
      rowPut(e.s1, 1)
      rowPut(e.s2, -1)
      rowPut(e.p1, -e.n)
      rowPut(e.p2, e.n)
    }
  }
  const x = linsolve(A, b)
  if (!x) return null
  const V = new Array(nn).fill(0)
  for (const [n, i] of idx) V[n] = x[i]
  return { V, x, k }
}

function primCurrent(e: Prim, V: number[], x: number[], k: number): number {
  switch (e.k) {
    case 'g':
      return e.g * (V[e.a] - V[e.b])
    case 'norton':
      return (e.V - (V[e.p] - V[e.m])) / e.R // delivered out of +
    case 'isrc':
      return e.I
    case 'pwl':
      return e.on ? (V[e.a] - V[e.b] - e.Vf) / e.Rd : (V[e.a] - V[e.b]) / R_OPEN
    case 'xfmr':
      return x[k + e.idx]
  }
}

/** Solve a circuit for one analysis mode. Deterministic: identical input gives identical output. */
export function solveCircuit(doc: CircuitDoc, topo: Topology, mode: SimMode, overrides: SolveOverrides = {}): Solution {
  const empty: Solution = { ok: false, mode, nodeVoltages: [], parts: {}, iterations: 0 }
  if (!doc.parts.length || topo.referenceNode === null) return { ...empty, error: 'Empty circuit' }
  const st: DeviceState = { pwl: new Map(), switchOn: new Map(), relay: new Map(), cc: new Map() }
  const vOf = (V: number[], p: PlacedPart, t: string) => V[topo.nodeOf.get(tkey(p.id, t))!]
  let result: { V: number[]; x: number[]; k: number; prims: Prim[] } | null = null
  let it = 0
  for (; it < 80; it++) {
    const { prims, extra } = buildPrims(doc, topo, mode, st, overrides)
    const r = solveLinear(topo, prims, extra)
    if (!r) return { ...empty, error: 'The circuit equations have no unique solution (check for ideal loops of sources or transformers with nothing connected).', iterations: it }
    result = { ...r, prims }
    let changed = false
    for (const e of prims)
      if (e.k === 'pwl') {
        const key = `${e.part}:${e.tag}`
        const vd = r.V[e.a] - r.V[e.b]
        const cur = e.on ? (vd - e.Vf) / e.Rd : 0
        const next = e.on ? cur > -1e-9 : vd > e.Vf + 1e-9
        if (next !== e.on) {
          st.pwl.set(key, next)
          changed = true
        }
      }
    for (const p of doc.parts) {
      if (p.type === 'mosfet' || p.type === 'igbt') {
        const vgs = vOf(r.V, p, 'g') - vOf(r.V, p, p.type === 'mosfet' ? 's' : 'e')
        const on = vgs > param(p, 'Vth')
        if (on !== (st.switchOn.get(p.id) ?? false)) {
          st.switchOn.set(p.id, on)
          changed = true
        }
      } else if (p.type === 'relay') {
        const on = Math.abs(vOf(r.V, p, 'a1') - vOf(r.V, p, 'a2')) >= 0.7 * param(p, 'Vcoil')
        if (on !== (st.relay.get(p.id) ?? false)) {
          st.relay.set(p.id, on)
          changed = true
        }
      } else if (p.type === 'dc-supply') {
        const vout = vOf(r.V, p, '+') - vOf(r.V, p, '-')
        const cc = st.cc.get(p.id) ?? false
        const iout = cc ? param(p, 'Ilim') : (param(p, 'V') - vout) / 0.01
        const next = cc ? vout < param(p, 'V') - 1e-6 : iout > param(p, 'Ilim')
        if (next !== cc) {
          st.cc.set(p.id, next)
          changed = true
        }
      }
    }
    if (!changed) break
  }
  if (!result) return empty
  const { V, x, k, prims } = result
  const parts: Record<string, PartResult> = {}
  for (const p of doc.parts) {
    const v: Record<string, number> = {}
    for (const t of PART_DEFS[p.type].terminals) v[t.id] = vOf(V, p, t.id)
    const mine = prims.filter((e) => e.part === p.id && e.tag !== 'inject')
    const cur = (tag: string) => mine.filter((e) => e.tag === tag).reduce((s, e) => s + primCurrent(e, V, x, k), 0)
    const t0 = PART_DEFS[p.type].terminals[0]?.id
    const t1 = PART_DEFS[p.type].terminals[1]?.id
    let i = cur('main')
    let state: string | undefined
    const extraI: Record<string, number> = {}
    let pw = t0 && t1 ? (v[t0] - v[t1]) * i : 0
    switch (p.type) {
      case 'battery':
      case 'ac-source':
      case 'gate-source':
        pw = -(v[t0] - v[t1]) * i
        break
      case 'dc-supply':
        state = st.cc.get(p.id) ? 'current limit' : 'constant voltage'
        pw = -(v['+'] - v['-']) * i
        break
      case 'diode':
      case 'led':
        state = st.pwl.get(`${p.id}:main`) ? 'conducting' : 'off'
        break
      case 'mosfet':
      case 'igbt': {
        const body = cur('body')
        const [d, s] = p.type === 'mosfet' ? ['d', 's'] : ['c', 'e']
        i = i - body
        pw = (v[d] - v[s]) * i
        state = st.switchOn.get(p.id) ? 'on' : body > 1e-3 ? 'off, body diode conducting' : 'off'
        extraI.body = body
        break
      }
      case 'relay':
        extraI.coil = cur('coil')
        state = st.relay.get(p.id) ? 'energised (COM–NO)' : 'released (COM–NC)'
        pw = (v.a1 - v.a2) * extraI.coil
        break
      case 'transformer':
        if (mode.kind === 'ac-snapshot') {
          extraI.secondary = -i / param(p, 'n')
        } else extraI.secondary = cur('sec')
        pw = 0
        break
      case 'breaker':
        extraI.pole2 = cur('pole2')
        state = stateOf(p, 'on', overrides.states) ? 'on' : 'off'
        pw = 0
        break
      case 'switch':
        state = stateOf(p, 'closed', overrides.states) ? 'closed' : 'open'
        break
      case 'capacitor':
      case 'electrolytic':
        i = 0
        pw = 0
        break
    }
    parts[p.id] = { v, i, p: pw, state, extra: Object.keys(extraI).length ? extraI : undefined }
  }
  const converged = it < 80
  return { ok: converged, error: converged ? undefined : 'Device states did not settle (oscillating switching condition).', mode, nodeVoltages: V, parts, iterations: it + 1 }
}

/** AC sources or gate drives present → quasi-static snapshots with transformer coupling. */
export function defaultModes(doc: CircuitDoc): SimMode[] {
  return doc.parts.some((p) => p.type === 'ac-source')
    ? [
        { kind: 'ac-snapshot', polarity: 1 },
        { kind: 'ac-snapshot', polarity: -1 },
      ]
    : doc.parts.some((p) => p.type === 'gate-source') && doc.parts.some((p) => p.type === 'transformer')
      ? [{ kind: 'ac-snapshot', polarity: 1 }]
      : [{ kind: 'dc' }]
}

/**
 * Resistance an ohmmeter would see between two nodes: the same two-solve Thevenin-resistance trick
 * `exercises.ts` already uses for a single part's terminals (inject a small test current, divide
 * the extra voltage it produces by the current), generalised to any two nodes so a probe can land
 * on two different parts — exactly what two free meter leads do. No new solving logic: both solves
 * go through `solveCircuit` above. Also returns the open-circuit voltage already present between
 * the probes, so a caller can flag a live circuit the way a real ohmmeter cannot.
 */
export function measureResistance(doc: CircuitDoc, topo: Topology, nodeA: number, nodeB: number, mode: SimMode = { kind: 'dc' }): { ohms: number; openCircuitVolts: number } {
  const s0 = solveCircuit(doc, topo, mode)
  const v0 = (s0.nodeVoltages[nodeA] ?? 0) - (s0.nodeVoltages[nodeB] ?? 0)
  const I = 1e-3
  const s1 = solveCircuit(doc, topo, mode, { inject: [{ nodeA, nodeB, amps: I }] })
  const v1 = (s1.nodeVoltages[nodeA] ?? 0) - (s1.nodeVoltages[nodeB] ?? 0)
  return { ohms: (v1 - v0) / I, openCircuitVolts: v0 }
}
