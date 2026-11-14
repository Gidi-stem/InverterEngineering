import { param } from '../circuit/parts'
import type { CircuitDoc } from '../circuit/types'
import { luSolve } from './linalg'
import { compile, R_OPEN, signalsOf, type El, type Netlist, type SignalDef } from './netlist'
import { acValue, generatorHigh } from './sources'

/**
 * Transient (time-domain) simulation by modified nodal analysis.
 *
 * Integration: trapezoidal rule (2nd order, no numerical damping) with backward-Euler steps at the
 * start and for two steps after any device state change, the standard cure for trapezoidal
 * ringing at discontinuities. Piecewise-linear devices are iterated to a consistent state at every
 * step; steps that do not settle are subdivided (h/2 … h/8) before the run is stopped with a
 * convergence failure. NaN/Inf or |V| > 1 MV stops the run as numerically unstable.
 *
 * Energy: source and dissipated energies are trapezoidal integrals of instantaneous power v·i, so
 * an ideal switching edge (v·i = 0 before and after) costs no energy; stored energy is ½CV² + ½LI²
 * from the state variables. "delivered − dissipated − stored" is therefore the simulation's genuine
 * energy error: O(h²) on trapezoidal steps, larger on backward-Euler steps and on events faster
 * than the time step.
 */
const G_MIN = 1e-9
const V_LIMIT = 1e6
const MAX_ITER = 40
const MAX_SPLIT = 3
/** Simplified fast-acting fuse: melts when ∫(i² − I_r²)dt exceeds I_r² × 1 s (≈ 0.33 s at 2×, 10 ms at 10×). */
const FUSE_K = 1
/** Simplified breaker: thermal trip when ∫(i² − I_r²)dt > I_r² × 5 s; magnetic trip above 5 × I_r. */
const BREAKER_K = 5
const BREAKER_MAG = 5
const RELAY_PULL_IN = 0.7
const RELAY_DROP_OUT = 0.3

export type Method = 'tr' | 'be'
export interface SimOptions {
  /** Time step (s). Default: automatic from the circuit's sources. */
  h?: number
  /** Ambient temperature for the thermal estimate (°C). */
  ambient?: number
}

export interface EnergyReport {
  /** Energy delivered by sources (J). */
  delivered: number
  /** Dissipated in resistive and semiconductor elements, incl. source internal resistance (J). */
  dissipated: number
  /** Stored now in capacitors and inductors, ½CV² + ½LI² (J). */
  stored: number
  /** delivered − dissipated − stored (J): the integrator's energy error. */
  error: number
}

export interface SwitchLoss {
  part: string
  /** Cumulative conduction energy (J) from the simulated v·i of channel and diode. */
  cond: number
  /** Cumulative switching energy (J): ½·V·I·t_sw per simulated edge. */
  sw: number
  edges: number
}

export interface SimStatus {
  ok: boolean
  error?: string
  /** Time at which the run failed. */
  failedAt?: number
}

/** Automatic step: resolves every periodic source and PWM edge; 20 µs for purely DC circuits. */
export function autoStep(doc: CircuitDoc): number {
  let h = 20e-6
  for (const p of doc.parts) {
    if (p.type === 'ac-source') h = Math.min(h, 1 / (400 * param(p, 'f')))
    if (p.type === 'gate-source') {
      const mode = p.states.mode ?? 0
      if (mode === 1) h = Math.min(h, 1 / (200 * param(p, 'f')))
      if (mode === 2) h = Math.min(h, 1 / (100 * param(p, 'f')), 1 / (400 * param(p, 'fm')))
    }
  }
  // Round to a "nice" value so periods divide into whole steps where possible.
  const nice = [1, 2, 2.5, 5]
  const e = Math.floor(Math.log10(h))
  let best = 10 ** e
  for (const m of nice) if (m * 10 ** e <= h * (1 + 1e-9)) best = m * 10 ** e
  return Math.max(best, 1e-7)
}

export class TransientSim {
  net: Netlist
  signals: SignalDef[]
  h: number
  ambient: number
  t = 0
  steps = 0
  status: SimStatus = { ok: true }
  /** Node voltages (all nodes incl. internal; reference = 0). */
  v: Float64Array
  /** Element currents (a→b inside the element) and terminal voltages at the current time. */
  i: Float64Array
  ve: Float64Array
  private on: Uint8Array
  private beLeft = 2
  private relayOn = new Map<string, boolean>()
  private fuseHeat = new Map<string, number>()
  private blown = new Set<string>()
  private tripped = new Set<string>()
  private eAbs: Float64Array
  private leak = 0
  private losses = new Map<string, SwitchLoss>()

  constructor(net: Netlist, opts: SimOptions = {}) {
    this.net = net
    this.signals = signalsOf(net)
    this.h = opts.h ?? autoStep(net.doc)
    this.ambient = opts.ambient ?? 25
    this.v = new Float64Array(net.allNodes)
    this.i = new Float64Array(net.els.length)
    this.ve = new Float64Array(net.els.length)
    this.on = new Uint8Array(net.els.length)
    this.eAbs = new Float64Array(net.els.length)
    for (const p of net.doc.parts) if (p.type === 'mosfet' || p.type === 'igbt') this.losses.set(p.id, { part: p.id, cond: 0, sw: 0, edges: 0 })
    // Initial discrete states: switches closed as set, supplies in constant-voltage mode.
    net.els.forEach((e, k) => {
      if (e.k === 'SW') this.on[k] = this.ctrlOn(e, this.v) ? 1 : 0
    })
  }

  static fromDoc(doc: CircuitDoc, opts: SimOptions = {}): TransientSim | { error: string } {
    const net = compile(doc)
    if ('error' in net) return net
    return new TransientSim(net, opts)
  }

  /**
   * Apply new parameters/switch states to the running simulation without losing its state
   * (capacitor voltages, inductor currents). Returns false when the topology changed.
   */
  update(doc: CircuitDoc): boolean {
    const next = compile(doc)
    if ('error' in next || next.signature !== this.net.signature || next.els.length !== this.net.els.length) return false
    this.net = next
    this.signals = signalsOf(next)
    this.beLeft = Math.max(this.beLeft, 2)
    // A replaced fuse/reset breaker: parameters changed means the student acted; keep trips unless the part changed state.
    return true
  }

  // ── Discrete device control ──────────────────────────────────────────────
  private partState(id: string, key: string) {
    return this.net.doc.parts.find((p) => p.id === id)?.states[key] ?? 0
  }
  private ctrlOn(e: Extract<El, { k: 'SW' }>, v: Float64Array): boolean {
    const c = e.ctrl
    switch (c.kind) {
      case 'fixed':
        return c.on
      case 'gate':
        return v[c.g] - v[c.s] > c.vth
      case 'relay': {
        const energised = this.relayOn.get(c.relay) ?? false
        return c.contact === 'no' ? energised : !energised
      }
      case 'fuse':
        return !this.blown.has(e.part)
      case 'breaker':
        return this.partState(e.part, 'on') === 1 && !this.tripped.has(e.part)
    }
  }

  private sourceV(e: Extract<El, { k: 'VS' }>, t: number): number {
    const s = e.src
    if (s.kind === 'dc') return s.V
    if (s.kind === 'ac') return acValue(s.vrms, s.f, t)
    return generatorHigh(s.spec, t) ? s.spec.vhigh : 0
  }

  // ── One linear solve with the given discrete states ──────────────────────
  private solve(h: number, method: Method, t1: number, on: Uint8Array): Float64Array | null {
    const { net } = this
    const ref = net.ref
    const nv = net.allNodes
    const n = nv - 1 + net.branches
    const col = (node: number) => (node === ref ? -1 : node < ref ? node : node - 1)
    const A = new Float64Array(n * n)
    const b = new Float64Array(n)
    const G = (a: number, c: number, g: number) => {
      const ia = col(a)
      const ic = col(c)
      if (ia >= 0) A[ia * n + ia] += g
      if (ic >= 0) A[ic * n + ic] += g
      if (ia >= 0 && ic >= 0) {
        A[ia * n + ic] -= g
        A[ic * n + ia] -= g
      }
    }
    /** Current source of value I flowing out of node a into node c (through the element). */
    const J = (a: number, c: number, I: number) => {
      const ia = col(a)
      const ic = col(c)
      if (ia >= 0) b[ia] -= I
      if (ic >= 0) b[ic] += I
    }
    for (let k = 0; k < nv; k++) if (k !== ref) A[col(k) * n + col(k)] += G_MIN
    net.els.forEach((e, k) => {
      switch (e.k) {
        case 'R':
          G(e.a, e.b, 1 / e.R)
          break
        case 'VS': {
          const V = this.sourceV(e, t1)
          G(e.a, e.b, 1 / e.R)
          J(e.a, e.b, -V / e.R) // Norton: current V/R injected into a
          break
        }
        case 'CC':
          if (on[k]) J(e.a, e.b, -e.Ilim)
          else {
            G(e.a, e.b, 1 / 0.01)
            J(e.a, e.b, -e.V / 0.01)
          }
          break
        case 'C': {
          const g = (method === 'tr' ? 2 : 1) * (e.C / h)
          const ieq = method === 'tr' ? g * this.ve[k] + this.i[k] : g * this.ve[k]
          G(e.a, e.b, g)
          J(e.a, e.b, -ieq)
          break
        }
        case 'L': {
          const g = method === 'tr' ? h / (2 * e.L) : h / e.L
          const ieq = method === 'tr' ? this.i[k] + g * this.ve[k] : this.i[k]
          G(e.a, e.b, g)
          J(e.a, e.b, ieq)
          break
        }
        case 'D':
          if (on[k]) {
            G(e.a, e.b, 1 / e.Rd)
            J(e.a, e.b, -e.Vf / e.Rd)
          } else G(e.a, e.b, 1 / R_OPEN)
          break
        case 'SW':
          G(e.a, e.b, on[k] ? 1 / e.Ron : 1 / R_OPEN)
          break
        case 'IG':
          if (on[k]) {
            G(e.a, e.b, 1 / e.Rs)
            J(e.a, e.b, -e.Vsat / e.Rs)
          } else G(e.a, e.b, 1 / R_OPEN)
          break
        case 'X': {
          const c = nv - 1 + e.br
          const put = (node: number, val: number) => {
            const i = col(node)
            if (i >= 0) A[i * n + c] += val
          }
          put(e.a, 1)
          put(e.b, -1)
          put(e.s1, -1 / e.n)
          put(e.s2, 1 / e.n)
          const row = (node: number, val: number) => {
            const i = col(node)
            if (i >= 0) A[c * n + i] += val
          }
          row(e.s1, 1)
          row(e.s2, -1)
          row(e.a, -e.n)
          row(e.b, e.n)
          break
        }
      }
    })
    const x = luSolve(A, b, n)
    if (!x) return null
    const v = new Float64Array(nv + net.branches)
    for (let k = 0; k < nv; k++) v[k] = k === ref ? 0 : x[col(k)]
    for (let k = 0; k < net.branches; k++) v[nv + k] = x[nv - 1 + k]
    return v
  }

  /** Element current (a→b) from a solution, using the companion model of the step. */
  private elCurrent(e: El, k: number, v: Float64Array, h: number, method: Method, on: Uint8Array, t1: number): number {
    const vd = v[e.a] - v[e.b]
    switch (e.k) {
      case 'R':
        return vd / e.R
      case 'VS':
        return (vd - this.sourceV(e, t1)) / e.R
      case 'CC':
        return on[k] ? -e.Ilim : (vd - e.V) / 0.01
      case 'C': {
        const g = (method === 'tr' ? 2 : 1) * (e.C / h)
        return method === 'tr' ? g * (vd - this.ve[k]) - this.i[k] : g * (vd - this.ve[k])
      }
      case 'L':
        return method === 'tr' ? this.i[k] + (h / (2 * e.L)) * (vd + this.ve[k]) : this.i[k] + (h / e.L) * vd
      case 'D':
        return on[k] ? (vd - e.Vf) / e.Rd : vd / R_OPEN
      case 'SW':
        return on[k] ? vd / e.Ron : vd / R_OPEN
      case 'IG':
        return on[k] ? (vd - e.Vsat) / e.Rs : vd / R_OPEN
      case 'X':
        return v[this.net.allNodes + e.br]
    }
  }

  /** Re-evaluate discrete states against a solution; returns true if anything changed. */
  private updateStates(v: Float64Array, on: Uint8Array): boolean {
    let changed = false
    this.net.els.forEach((e, k) => {
      let next = on[k]
      if (e.k === 'D') {
        const vd = v[e.a] - v[e.b]
        next = on[k] ? ((vd - e.Vf) / e.Rd > -1e-9 ? 1 : 0) : vd > e.Vf + 1e-9 ? 1 : 0
      } else if (e.k === 'IG') {
        const gate = v[e.g] - v[e.e] > e.vth
        const vd = v[e.a] - v[e.b]
        next = gate && (on[k] ? (vd - e.Vsat) / e.Rs > -1e-9 : vd > e.Vsat + 1e-9) ? 1 : 0
      } else if (e.k === 'SW') {
        next = this.ctrlOn(e, v) ? 1 : 0
      } else if (e.k === 'CC') {
        const vout = v[e.a] - v[e.b]
        next = on[k] ? (vout < e.V - 1e-6 ? 1 : 0) : (e.V - vout) / 0.01 > e.Ilim ? 1 : 0
      }
      if (next !== on[k]) {
        on[k] = next
        changed = true
      }
    })
    return changed
  }

  /** Relay coils with hysteresis (pull-in 70 %, drop-out 30 % of rated voltage). */
  private updateRelays(v: Float64Array): boolean {
    let changed = false
    for (const p of this.net.doc.parts) {
      if (p.type !== 'relay') continue
      const coil = this.net.els.find((e) => e.part === p.id && e.tag === 'coil')!
      const vc = Math.abs(v[coil.a] - v[coil.b])
      const was = this.relayOn.get(p.id) ?? false
      const now = was ? vc > RELAY_DROP_OUT * param(p, 'Vcoil') : vc >= RELAY_PULL_IN * param(p, 'Vcoil')
      if (now !== was) {
        this.relayOn.set(p.id, now)
        changed = true
      }
    }
    return changed
  }

  /** Solve one step of length h; null if the device states do not settle. */
  private trySolve(h: number, t1: number): { v: Float64Array; on: Uint8Array; method: Method; changed: boolean } | null {
    let method: Method = this.beLeft > 0 ? 'be' : 'tr'
    const on = new Uint8Array(this.on)
    let changedAny = false
    for (let it = 0; it < MAX_ITER; it++) {
      const v = this.solve(h, method, t1, on)
      if (!v) return null
      const changed = this.updateStates(v, on) || this.updateRelays(v)
      if (!changed) return { v, on, method, changed: changedAny }
      changedAny = true
      // A state change inside this step is a discontinuity: integrate it with backward Euler.
      method = 'be'
    }
    return null
  }

  private commit(h: number, t1: number, r: { v: Float64Array; on: Uint8Array; method: Method; changed: boolean }) {
    const { net } = this
    const prevV = this.ve.slice()
    const prevI = this.i.slice()
    const prevOn = this.on.slice()
    const nv = net.allNodes
    for (let k = 0; k < nv; k++) {
      if (k !== net.ref) this.leak += (h * G_MIN * (this.v[k] ** 2 + r.v[k] ** 2)) / 2
    }
    net.els.forEach((e, k) => {
      const i1 = this.elCurrent(e, k, r.v, h, r.method, r.on, t1)
      const v1 = r.v[e.a] - r.v[e.b]
      if (e.k === 'X') {
        // Ideal transformer: primary and secondary powers cancel exactly; record the primary branch current.
        this.ve[k] = v1
        this.i[k] = i1
        return
      }
      // Trapezoidal integral of instantaneous power: an ideal switch edge (v·i = 0 before and after) costs nothing.
      this.eAbs[k] += (h * (v1 * i1 + prevV[k] * prevI[k])) / 2
      this.ve[k] = v1
      this.i[k] = i1
    })
    // Switching-loss estimate on each simulated edge of a transistor channel.
    net.els.forEach((e, k) => {
      if ((e.k !== 'SW' || e.ctrl.kind !== 'gate') && e.k !== 'IG') return
      const L = this.losses.get(e.part)
      if (!L) return
      const gateNow = e.k === 'IG' ? r.v[e.g] - r.v[e.e] > e.vth : r.on[k] === 1
      const gateBefore = e.k === 'IG' ? this.v[e.g] - this.v[e.e] > e.vth : prevOn[k] === 1
      if (gateNow === gateBefore) return
      const p = net.doc.parts.find((x) => x.id === e.part)!
      const tsw = param(p, 'tsw') * 1e-9
      const vBlock = Math.abs(gateNow ? prevV[k] : this.ve[k])
      const iCond = Math.abs(gateNow ? this.i[k] : prevI[k])
      L.sw += 0.5 * vBlock * iCond * tsw
      L.edges++
    })
    this.v = r.v.slice(0, nv)
    this.on = r.on
    this.t = t1
    // Protection devices act after the step (their state does not change inside a step).
    for (const p of net.doc.parts) {
      if (p.type !== 'fuse' && p.type !== 'breaker') continue
      if (this.blown.has(p.id) || this.tripped.has(p.id)) continue
      const k = net.els.findIndex((e) => e.part === p.id && e.tag === 'main')
      const k2 = net.els.findIndex((e) => e.part === p.id && e.tag === 'pole2')
      const I = Math.max(Math.abs(this.i[k]), k2 >= 0 ? Math.abs(this.i[k2]) : 0)
      const Ir = param(p, 'Irated')
      const heat = Math.max(0, (this.fuseHeat.get(p.id) ?? 0) + h * (I * I - Ir * Ir))
      this.fuseHeat.set(p.id, heat)
      if (p.type === 'fuse' && heat > FUSE_K * Ir * Ir) {
        this.blown.add(p.id)
        this.beLeft = 2
      }
      if (p.type === 'breaker' && (heat > BREAKER_K * Ir * Ir || I > BREAKER_MAG * Ir)) {
        this.tripped.add(p.id)
        this.beLeft = 2
      }
    }
    if (this.blown.size || this.tripped.size)
      net.els.forEach((e, k) => {
        if (e.k === 'SW' && (e.ctrl.kind === 'fuse' || e.ctrl.kind === 'breaker')) this.on[k] = this.ctrlOn(e, this.v) ? 1 : 0
      })
    let changed = r.changed
    for (let k = 0; k < this.on.length; k++) if (this.on[k] !== prevOn[k]) changed = true
    if (changed) this.beLeft = 2
    else if (this.beLeft > 0) this.beLeft--
  }

  private advance(h: number, depth: number): boolean {
    const t1 = this.t + h
    const r = this.trySolve(h, t1)
    if (r) {
      this.commit(h, t1, r)
      return true
    }
    if (depth >= MAX_SPLIT) return false
    this.beLeft = Math.max(this.beLeft, 2)
    return this.advance(h / 2, depth + 1) && this.advance(h / 2, depth + 1)
  }

  /** Advance one time step. Returns false (and sets status) when the run cannot continue. */
  step(): boolean {
    if (!this.status.ok) return false
    const target = (this.steps + 1) * this.h
    const ok = this.advance(target - this.t, 0)
    if (!ok) {
      this.status = {
        ok: false,
        failedAt: this.t,
        error: `Convergence failure at t = ${fmtTime(this.t)}: the switching devices could not reach a consistent state even with the time step divided by ${2 ** MAX_SPLIT}. Results after this time are not shown. Check for ideal loops (sources or capacitors joined directly by closed switches) or switches driven on together.`,
      }
      return false
    }
    this.t = target
    this.steps++
    for (let k = 0; k < this.v.length; k++) {
      const x = this.v[k]
      if (!Number.isFinite(x) || Math.abs(x) > V_LIMIT) {
        this.status = { ok: false, failedAt: this.t, error: `Numerical instability at t = ${fmtTime(this.t)}: a node voltage became ${Number.isFinite(x) ? 'larger than 1 MV' : 'undefined'}. The run was stopped and results after this point are not shown.` }
        return false
      }
    }
    return true
  }

  /** Run n steps (or until failure). Returns the number of steps completed. */
  run(n: number): number {
    let k = 0
    while (k < n && this.step()) k++
    return k
  }

  /** Current value of every signal. */
  values(out = new Float64Array(this.signals.length)): Float64Array {
    this.signals.forEach((s, j) => {
      if (s.va !== undefined) out[j] = this.v[s.va] - this.v[s.vb!]
      else if (s.delivered !== undefined) out[j] = -this.i[s.delivered]
      else out[j] = s.terms!.reduce((acc, t) => acc + t.sign * this.i[t.el], 0)
    })
    return out
  }

  nodeVoltage(node: number) {
    return this.v[node]
  }

  /**
   * Getter for any probe key: a signal key ("V:R1", "I:L1"), a terminal voltage to the reference
   * ("T:Q1.s"), or a difference of two probes ("T:Q1.s|T:Q3.s"). Null if the key does not resolve.
   */
  probe(key: string): (() => number) | null {
    const bar = key.indexOf('|')
    if (bar > 0) {
      const a = this.probe(key.slice(0, bar))
      const b = this.probe(key.slice(bar + 1))
      return a && b ? () => a() - b() : null
    }
    if (key.startsWith('T:')) {
      const ref = key.slice(2)
      const dot = ref.indexOf('.')
      const node = this.net.topo.nodeOf.get(`${ref.slice(0, dot)}:${ref.slice(dot + 1)}`)
      return node === undefined ? null : () => this.v[node]
    }
    if (key.startsWith('N:')) {
      const node = Number(key.slice(2))
      return Number.isInteger(node) && node >= 0 && node < this.net.nodes ? () => this.v[node] : null
    }
    const s = this.signals.find((x) => x.key === key)
    if (!s) return null
    if (s.va !== undefined) return () => this.v[s.va!] - this.v[s.vb!]
    if (s.delivered !== undefined) return () => -this.i[s.delivered!]
    return () => s.terms!.reduce((acc, t) => acc + t.sign * this.i[t.el], 0)
  }

  energy(): EnergyReport {
    let delivered = 0
    let dissipated = this.leak
    let stored = 0
    this.net.els.forEach((e, k) => {
      if (e.k === 'VS' || e.k === 'CC') {
        // The element's absorbed energy is −(ideal source energy) + internal resistance loss; report terminal energy.
        delivered -= this.eAbs[k]
      } else if (e.k === 'C') {
        stored += 0.5 * e.C * this.ve[k] ** 2
      } else if (e.k === 'L') {
        stored += 0.5 * e.L * this.i[k] ** 2
      } else dissipated += this.eAbs[k]
    })
    return { delivered, dissipated, stored, error: delivered - dissipated - stored }
  }

  /** Cumulative conduction (from simulated v·i) and switching energy for every transistor. */
  switchLosses(): SwitchLoss[] {
    return [...this.losses.values()].map((L) => {
      let cond = 0
      this.net.els.forEach((e, k) => {
        if (e.part === L.part && (e.k === 'SW' || e.k === 'IG' || e.k === 'D')) cond += this.eAbs[k]
      })
      return { ...L, cond }
    })
  }

  /** Discrete events that a student should know about (fuse blown, breaker tripped, relay state). */
  events() {
    return { blown: [...this.blown], tripped: [...this.tripped], relays: Object.fromEntries(this.relayOn) }
  }
}

export function fmtTime(t: number) {
  return t < 1e-3 ? `${(t * 1e6).toFixed(1)} µs` : t < 1 ? `${(t * 1e3).toFixed(3)} ms` : `${t.toFixed(4)} s`
}
