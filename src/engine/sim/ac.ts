import { solveCircuit } from '../circuit/solve'
import { luSolve } from './linalg'
import { compile, R_OPEN, signalsOf } from './netlist'
import type { CircuitDoc } from '../circuit/types'

/**
 * AC (small-signal frequency-response) analysis by complex modified nodal analysis.
 * The chosen input source is a 1 V phasor; every other source is set to zero (its internal
 * resistance remains). Diodes and transistors are frozen in the state of the DC operating point,
 * so the result describes the linear circuit around that state. The complex system is solved as
 * the equivalent real system [[G, −B], [B, G]].
 */
export interface BodePoint {
  f: number
  /** Output / input magnitude (V/V) and in dB. */
  mag: number
  db: number
  /** Phase in degrees (−180 … 180). */
  phase: number
}

export interface AcResult {
  points: BodePoint[]
  /** Frequency where the response falls 3 dB below its low-frequency value (if it does). */
  f3db: number | null
  /** Frequency of the largest magnitude, if it is a peak above both ends. */
  peak: { f: number; db: number } | null
}

export function acSweep(doc: CircuitDoc, inputPart: string, outputSignal: string, fMin = 1, fMax = 1e5, points = 200): AcResult | { error: string } {
  const net = compile(doc)
  if ('error' in net) return net
  const input = net.els.find((e) => e.part === inputPart && e.k === 'VS')
  if (!input) return { error: 'Choose an AC source or generator as the input.' }
  const sig = signalsOf(net).find((s) => s.key === outputSignal && s.va !== undefined)
  if (!sig) return { error: 'Choose a voltage signal as the output.' }
  const dc = solveCircuit(doc, net.topo, { kind: 'dc' })
  const state = (part: string) => dc.parts[part]?.state ?? ''
  const ref = net.ref
  const nv = net.allNodes
  const n = nv - 1 + net.branches
  const col = (node: number) => (node === ref ? -1 : node < ref ? node : node - 1)
  const out: BodePoint[] = []
  for (let k = 0; k < points; k++) {
    const f = fMin * (fMax / fMin) ** (k / (points - 1))
    const w = 2 * Math.PI * f
    const N2 = 2 * n
    const A = new Float64Array(N2 * N2)
    const b = new Float64Array(N2)
    const adm = (a: number, c: number, g: number, bs: number) => {
      const ia = col(a)
      const ic = col(c)
      const add = (r: number, cc: number, gv: number, bv: number) => {
        A[r * N2 + cc] += gv
        A[r * N2 + n + cc] -= bv
        A[(n + r) * N2 + cc] += bv
        A[(n + r) * N2 + n + cc] += gv
      }
      if (ia >= 0) add(ia, ia, g, bs)
      if (ic >= 0) add(ic, ic, g, bs)
      if (ia >= 0 && ic >= 0) {
        add(ia, ic, -g, -bs)
        add(ic, ia, -g, -bs)
      }
    }
    const real = (r: number, c: number, v: number) => {
      A[r * N2 + c] += v
      A[(n + r) * N2 + n + c] += v
    }
    for (let i = 0; i < nv; i++) if (i !== ref) adm(i, i, 1e-9, 0)
    for (const e of net.els) {
      switch (e.k) {
        case 'R':
          adm(e.a, e.b, 1 / e.R, 0)
          break
        case 'VS':
          adm(e.a, e.b, 1 / e.R, 0)
          if (e === input) {
            const ia = col(e.a)
            const ic = col(e.b)
            if (ia >= 0) b[ia] += 1 / e.R
            if (ic >= 0) b[ic] -= 1 / e.R
          }
          break
        case 'CC':
          adm(e.a, e.b, 100, 0)
          break
        case 'C':
          adm(e.a, e.b, 0, w * e.C)
          break
        case 'L':
          adm(e.a, e.b, 0, -1 / (w * e.L))
          break
        case 'D':
          adm(e.a, e.b, (e.tag === 'main' && state(e.part) === 'conducting' ? 1 / e.Rd : 1 / R_OPEN), 0)
          break
        case 'SW': {
          const closed = e.ctrl.kind === 'gate' ? state(e.part) === 'on' : e.ctrl.kind === 'fixed' ? e.ctrl.on : e.ctrl.kind === 'relay' ? (e.ctrl.contact === 'no') === state(e.part).startsWith('energised') : e.ctrl.kind === 'fuse' ? true : (doc.parts.find((p) => p.id === e.part)?.states.on ?? 1) === 1
          adm(e.a, e.b, closed ? 1 / e.Ron : 1 / R_OPEN, 0)
          break
        }
        case 'IG':
          adm(e.a, e.b, state(e.part) === 'on' ? 1 / e.Rs : 1 / R_OPEN, 0)
          break
        case 'IS':
          break
        case 'X3': {
          const ca = nv - 1 + e.br
          const cb = ca + 1
          const put = (node: number, c: number, v: number) => {
            const i = col(node)
            if (i >= 0) real(i, c, v)
          }
          put(e.a, ca, 1)
          put(e.b, ca, -1)
          put(e.c, cb, 1)
          put(e.d, cb, -1)
          for (const c of [ca, cb]) {
            put(e.s1, c, -1 / e.n)
            put(e.s2, c, 1 / e.n)
          }
          const row = (r: number, node: number, v: number) => {
            const i = col(node)
            if (i >= 0) real(r, i, v)
          }
          row(ca, e.a, 1)
          row(ca, e.b, -1)
          row(ca, e.c, -1)
          row(ca, e.d, 1)
          row(cb, e.s1, 1)
          row(cb, e.s2, -1)
          row(cb, e.a, -e.n)
          row(cb, e.b, e.n)
          break
        }
        case 'X': {
          const c = nv - 1 + e.br
          const put = (node: number, v: number) => {
            const i = col(node)
            if (i >= 0) real(i, c, v)
          }
          put(e.a, 1)
          put(e.b, -1)
          put(e.s1, -1 / e.n)
          put(e.s2, 1 / e.n)
          const row = (node: number, v: number) => {
            const i = col(node)
            if (i >= 0) real(c, i, v)
          }
          row(e.s1, 1)
          row(e.s2, -1)
          row(e.a, -e.n)
          row(e.b, e.n)
          break
        }
      }
    }
    const x = luSolve(A, b, N2)
    if (!x) return { error: `The circuit equations are singular at ${f.toPrecision(3)} Hz.` }
    const V = (node: number): [number, number] => (node === ref ? [0, 0] : [x[col(node)], x[n + col(node)]])
    const [ar, ai] = V(sig.va!)
    const [br, bi] = V(sig.vb!)
    const re = ar - br
    const im = ai - bi
    const mag = Math.hypot(re, im)
    out.push({ f, mag, db: 20 * Math.log10(Math.max(mag, 1e-12)), phase: (Math.atan2(im, re) * 180) / Math.PI })
  }
  const ref0 = out[0].db
  let f3db: number | null = null
  for (let k = 1; k < out.length; k++)
    if (out[k - 1].db > ref0 - 3 && out[k].db <= ref0 - 3) {
      const t = (ref0 - 3 - out[k - 1].db) / (out[k].db - out[k - 1].db)
      f3db = out[k - 1].f * (out[k].f / out[k - 1].f) ** t
      break
    }
  let pk = 0
  for (let k = 1; k < out.length; k++) if (out[k].db > out[pk].db) pk = k
  const peak = pk > 0 && pk < out.length - 1 && out[pk].db > out[0].db + 0.5 && out[pk].db > out[out.length - 1].db + 0.5 ? { f: out[pk].f, db: out[pk].db } : null
  return { points: out, f3db, peak }
}
