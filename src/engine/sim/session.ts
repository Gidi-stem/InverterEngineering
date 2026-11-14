import { PART_DEFS, tkey } from '../circuit/parts'
import type { CircuitDoc } from '../circuit/types'
import { measure, spectrum, type Measurements, type Spectrum } from './analysis'
import { TransientSim, type EnergyReport } from './transient'

/**
 * A simulation session: owns a TransientSim and a ring buffer of recent samples, and produces
 * oscilloscope frames (decimated min/max columns + measurements) on request. Pure TypeScript so it
 * runs inside the Web Worker and in unit tests; nothing here touches the DOM.
 */
export interface ChannelReq {
  key: string
}
export interface ViewReq {
  /** Seconds per division; the screen is 10 divisions wide. */
  timeDiv: number
  channels: ChannelReq[]
  trigger: boolean
  columns: number
  /** Channel index whose harmonic spectrum to compute, or -1. */
  spectrumOf: number
}
export interface ChannelFrame {
  key: string
  label: string
  unit: 'V' | 'A'
  min: Float32Array
  max: Float32Array
  meas: Measurements | null
}
export interface ThermalRow {
  part: string
  label: string
  pCond: number
  pSw: number
  rth: number
  tj: number
}
export interface Frame {
  t: number
  steps: number
  h: number
  /** Window start time and span (s). */
  t0: number
  span: number
  /** Sample spacing in the buffer (s). */
  dt: number
  triggered: boolean
  channels: ChannelFrame[]
  spectrum: Spectrum | null
  energy: EnergyReport
  thermal: ThermalRow[]
  events: { blown: string[]; tripped: string[] }
  status: { ok: boolean; error?: string; failedAt?: number }
}
export interface ProbeInfo {
  key: string
  label: string
  unit: 'V' | 'A'
  group: string
}

const CAPACITY = 40_000

export class SimSession {
  sim: TransientSim
  doc: CircuitDoc
  private cols: number
  private buf: Float32Array
  private head = 0
  private count = 0
  /** Record every `k`-th step. */
  private k = 1
  private sinceRecord = 0
  private nodeCount: number
  private currentIdx: number[]
  private lossParts: string[]
  private rowTemp: Float64Array<ArrayBuffer>

  constructor(sim: TransientSim, doc: CircuitDoc) {
    this.sim = sim
    this.doc = doc
    this.nodeCount = sim.net.nodes
    this.currentIdx = sim.signals.map((s, i) => (s.unit === 'A' ? i : -1)).filter((i) => i >= 0)
    this.lossParts = sim.switchLosses().map((l) => l.part)
    // Row: t, node voltages, current signals, cumulative (cond, sw) energy per transistor.
    this.cols = 1 + this.nodeCount + this.currentIdx.length + 2 * this.lossParts.length
    this.buf = new Float32Array(CAPACITY * this.cols)
    this.rowTemp = new Float64Array(sim.signals.length)
    this.record()
  }

  static create(doc: CircuitDoc, opts: { h?: number; ambient?: number } = {}): SimSession | { error: string } {
    const s = TransientSim.fromDoc(doc, opts)
    if ('error' in s) return s
    return new SimSession(s, doc)
  }

  /** Probes a student can put on a channel. */
  probes(): ProbeInfo[] {
    const out: ProbeInfo[] = this.sim.signals.map((s) => ({ key: s.key, label: s.label, unit: s.unit, group: s.unit === 'V' ? 'Voltage across a part' : 'Current through a part' }))
    const { topo } = this.sim.net
    for (const n of topo.nodes) {
      if (n.id === topo.referenceNode) continue
      const names = n.terminals.slice(0, 3).map((t) => {
        const p = this.doc.parts.find((x) => x.id === t.partId)
        return p ? `${p.label}.${PART_DEFS[p.type].terminals.find((d) => d.id === t.terminalId)?.label ?? t.terminalId}` : t.partId
      })
      out.push({ key: `N:${n.id}`, label: `Node N${n.id} (${names.join(', ')}${n.terminals.length > 3 ? ', …' : ''})`, unit: 'V', group: 'Node voltage to 0 V' })
    }
    return out
  }

  /** Choose the recording interval so the buffer holds 2.5 screen widths. Clears the buffer if it changes. */
  setWindow(timeDiv: number) {
    const k = Math.max(1, Math.ceil((2.5 * 10 * timeDiv) / (this.sim.h * CAPACITY)))
    if (k !== this.k) {
      this.k = k
      this.head = 0
      this.count = 0
      this.sinceRecord = 0
      this.record()
    }
  }

  private record() {
    const s = this.sim
    const row = this.head * this.cols
    const b = this.buf
    b[row] = s.t
    for (let n = 0; n < this.nodeCount; n++) b[row + 1 + n] = s.nodeVoltage(n)
    s.values(this.rowTemp)
    let c = row + 1 + this.nodeCount
    for (const i of this.currentIdx) b[c++] = this.rowTemp[i]
    if (this.lossParts.length) {
      const L = s.switchLosses()
      for (const l of L) {
        b[c++] = l.cond
        b[c++] = l.sw
      }
    }
    this.head = (this.head + 1) % CAPACITY
    this.count = Math.min(this.count + 1, CAPACITY)
  }

  /** Advance up to `seconds` of simulated time, stopping after `budgetMs` of wall time. */
  advance(seconds: number, budgetMs: number, now: () => number): number {
    const target = this.sim.t + seconds
    const start = now()
    let n = 0
    while (this.sim.t < target - this.sim.h / 2 && this.sim.status.ok) {
      if (!this.sim.step()) break
      n++
      if (++this.sinceRecord >= this.k) {
        this.sinceRecord = 0
        this.record()
      }
      if ((n & 63) === 0 && now() - start > budgetMs) break
    }
    return n
  }

  stepN(n: number): number {
    let done = 0
    for (; done < n && this.sim.step(); done++) {
      if (++this.sinceRecord >= this.k) {
        this.sinceRecord = 0
        this.record()
      }
    }
    return done
  }

  /** Column reader for a probe key over buffer rows (null if it does not resolve). */
  private reader(key: string): ((row: number) => number) | null {
    const bar = key.indexOf('|')
    if (bar > 0) {
      const a = this.reader(key.slice(0, bar))
      const b = this.reader(key.slice(bar + 1))
      return a && b ? (r) => a(r) - b(r) : null
    }
    const node = (n: number | undefined) => (n === undefined || n < 0 || n >= this.nodeCount ? null : (r: number) => this.buf[r * this.cols + 1 + n])
    if (key.startsWith('T:')) {
      const ref = key.slice(2)
      const dot = ref.indexOf('.')
      return node(this.sim.net.topo.nodeOf.get(tkey(ref.slice(0, dot), ref.slice(dot + 1))))
    }
    if (key.startsWith('N:')) return node(Number(key.slice(2)))
    const si = this.sim.signals.findIndex((s) => s.key === key)
    if (si < 0) return null
    const s = this.sim.signals[si]
    if (s.unit === 'V') {
      const a = node(s.va)
      const b = node(s.vb)
      return a && b ? (r) => a(r) - b(r) : null
    }
    const ci = this.currentIdx.indexOf(si)
    return ci < 0 ? null : (r) => this.buf[r * this.cols + 1 + this.nodeCount + ci]
  }

  private probeMeta(key: string): { label: string; unit: 'V' | 'A' } {
    const s = this.sim.signals.find((x) => x.key === key)
    if (s) return { label: s.label, unit: s.unit }
    if (key.includes('|')) return { label: key.split('|').map((k) => this.probeMeta(k).label.replace(/^V /, '')).join(' − '), unit: 'V' }
    if (key.startsWith('T:')) return { label: `V(${key.slice(2)})`, unit: 'V' }
    if (key.startsWith('N:')) return { label: `V(N${key.slice(2)})`, unit: 'V' }
    return { label: key, unit: 'V' }
  }

  frame(view: ViewReq): Frame {
    this.setWindow(view.timeDiv)
    const span = 10 * view.timeDiv
    const dt = this.k * this.sim.h
    const rowAt = (i: number) => (this.head - this.count + i + CAPACITY) % CAPACITY // i = 0 oldest
    const tAt = (i: number) => this.buf[rowAt(i) * this.cols]
    const last = this.count - 1
    const tEnd = this.count ? tAt(last) : 0
    // Window: latest whole screen, aligned to a rising crossing of CH1 when triggering.
    let startIdx = Math.max(0, this.count - Math.round(span / dt) - 1)
    let triggered = false
    const readers = view.channels.map((c) => this.reader(c.key))
    if (view.trigger && readers[0] && this.count > 3) {
      const r0 = readers[0]
      const lookback = Math.min(this.count, Math.round((2 * span) / dt))
      let lo = Infinity
      let hi = -Infinity
      for (let i = this.count - lookback; i < this.count; i++) {
        const v = r0(rowAt(i))
        lo = Math.min(lo, v)
        hi = Math.max(hi, v)
      }
      const mid = (lo + hi) / 2
      const need = Math.round(span / dt)
      if (hi - lo > 1e-9) {
        for (let i = this.count - need - 1; i > this.count - lookback && i > 0; i--) {
          if (r0(rowAt(i - 1)) < mid && r0(rowAt(i)) >= mid) {
            startIdx = i
            triggered = true
            break
          }
        }
      }
    }
    const t0 = this.count ? (triggered ? tAt(startIdx) : Math.max(0, tEnd - span)) : 0
    const endIdx = Math.min(this.count, startIdx + Math.round(span / dt) + 1)
    const channels: ChannelFrame[] = view.channels.map((c, ci) => {
      const meta = this.probeMeta(c.key)
      const rd = readers[ci]
      const min = new Float32Array(view.columns).fill(NaN)
      const max = new Float32Array(view.columns).fill(NaN)
      if (!rd) return { key: c.key, ...meta, min, max, meas: null }
      const data = new Float64Array(Math.max(0, endIdx - startIdx))
      for (let i = startIdx; i < endIdx; i++) {
        const r = rowAt(i)
        const v = rd(r)
        data[i - startIdx] = v
        const col = Math.floor(((this.buf[r * this.cols] - t0) / span) * view.columns)
        if (col < 0 || col >= view.columns) continue
        if (!(v >= min[col])) min[col] = Number.isNaN(min[col]) ? v : Math.min(min[col], v)
        if (!(v <= max[col])) max[col] = Number.isNaN(max[col]) ? v : Math.max(max[col], v)
      }
      return { key: c.key, ...meta, min, max, meas: data.length > 4 ? measure(data, dt) : null, data }
    }) as (ChannelFrame & { data?: Float64Array })[]
    let spec: Spectrum | null = null
    const sc = channels[view.spectrumOf] as (ChannelFrame & { data?: Float64Array }) | undefined
    if (sc?.meas?.freq && sc.data) spec = spectrum(sc.data, dt, sc.meas.freq, 50)
    for (const c of channels as (ChannelFrame & { data?: Float64Array })[]) delete c.data
    // Thermal: losses averaged over the window from the cumulative energy columns.
    const thermal: ThermalRow[] = []
    if (this.lossParts.length && endIdx - startIdx > 1) {
      const a = rowAt(startIdx)
      const b = rowAt(endIdx - 1)
      const T = this.buf[b * this.cols] - this.buf[a * this.cols]
      const base = 1 + this.nodeCount + this.currentIdx.length
      this.lossParts.forEach((id, j) => {
        const p = this.doc.parts.find((x) => x.id === id)!
        const pc = T > 0 ? (this.buf[b * this.cols + base + 2 * j] - this.buf[a * this.cols + base + 2 * j]) / T : 0
        const ps = T > 0 ? (this.buf[b * this.cols + base + 2 * j + 1] - this.buf[a * this.cols + base + 2 * j + 1]) / T : 0
        const rth = p.params.Rth ?? PART_DEFS[p.type].params.find((q) => q.key === 'Rth')!.default
        thermal.push({ part: id, label: p.label, pCond: pc, pSw: ps, rth, tj: this.sim.ambient + (pc + ps) * rth })
      })
    }
    const ev = this.sim.events()
    return {
      t: this.sim.t,
      steps: this.sim.steps,
      h: this.sim.h,
      t0,
      span,
      dt,
      triggered,
      channels,
      spectrum: spec,
      energy: this.sim.energy(),
      thermal,
      events: { blown: ev.blown, tripped: ev.tripped },
      status: this.sim.status,
    }
  }

  /** Apply a parameter/state change while running; false when the topology changed. */
  update(doc: CircuitDoc): boolean {
    if (!this.sim.update(doc)) return false
    this.doc = doc
    return true
  }
}
