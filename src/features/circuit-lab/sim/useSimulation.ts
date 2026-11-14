import { useCallback, useEffect, useRef, useState } from 'react'
import type { Expected, Observation } from '../../../content/simExperiments'
import type { CircuitDoc } from '../../../engine/circuit/types'
import type { AcResult } from '../../../engine/sim/ac'
import type { Frame, ProbeInfo, ViewReq } from '../../../engine/sim/session'
import type { FromWorker, ToWorker } from './protocol'

export type SimState = 'idle' | 'running' | 'paused' | 'stopped' | 'error'
export interface ScopeChannelSetting {
  key: string
  perDiv: number
  offset: number
  on: boolean
}
export interface ScopeSettings {
  timeDiv: number
  channels: ScopeChannelSetting[]
  trigger: boolean
  spectrumOf: number
}
export interface ExperimentResult {
  ok: boolean
  error?: string
  expected: Expected[]
  observations: Observation[]
  ms: number
}

export const viewOf = (s: ScopeSettings): ViewReq => ({
  timeDiv: s.timeDiv,
  channels: s.channels.filter((c) => c.on && c.key).map((c) => ({ key: c.key })),
  trigger: s.trigger,
  columns: 600,
  spectrumOf: s.spectrumOf,
})

interface Owned {
  owner: string
  state: SimState
  frame: Frame | null
  probes: ProbeInfo[]
  h: number | null
  error: string | null
  notice: string | null
  computeMs: number
}
const blank = (owner: string): Owned => ({ owner, state: 'idle', frame: null, probes: [], h: null, error: null, notice: null, computeMs: 0 })

/**
 * Controller for the simulation worker. RUN streams simulated time to the oscilloscope at
 * `speed` divisions per second of real time (Infinity = as fast as the computer allows), with at
 * most one request in flight, so a slow computer simply runs slower instead of freezing.
 * Everything is keyed to `owner` (the workspace): opening another circuit shows a fresh, idle
 * simulator, with no reset effect needed.
 */
export function useSimulation(owner: string, doc: CircuitDoc, settings: ScopeSettings, speed: number, timeStep: number | undefined) {
  const worker = useRef<Worker | null>(null)
  const [st, setSt] = useState<Owned>(() => blank(owner))
  const cur = st.owner === owner ? st : blank(owner)
  const ownerRef = useRef(owner)
  const stRef = useRef(st)
  const loadedFor = useRef<string | null>(null)
  const busy = useRef(false)
  const docRef = useRef(doc)
  const viewRef = useRef(viewOf(settings))
  const speedRef = useRef(speed)
  const stepRef = useRef(timeStep)
  const pendingStep = useRef<number | null>(null)
  const req = useRef(0)
  const waiters = useRef(new Map<number, (v: unknown) => void>())

  /** Patch the current owner's record (starting from blank if the owner changed). */
  const patch = useCallback((p: Partial<Owned>) => {
    setSt((prev) => {
      const base = prev.owner === ownerRef.current ? prev : blank(ownerRef.current)
      const next = { ...base, ...p }
      stRef.current = next
      return next
    })
  }, [])
  const send = (m: ToWorker) => worker.current?.postMessage(m)

  useEffect(() => {
    if (ownerRef.current !== owner) {
      // The workspace changed: forget in-flight work of the previous circuit.
      busy.current = false
      pendingStep.current = null
    }
    ownerRef.current = owner
    docRef.current = doc
    viewRef.current = viewOf(settings)
    speedRef.current = speed
    stepRef.current = timeStep
  })

  useEffect(() => {
    const w = new Worker(new URL('./sim.worker.ts', import.meta.url), { type: 'module' })
    worker.current = w
    w.onmessage = (e: MessageEvent<FromWorker>) => {
      const m = e.data
      const mine = loadedFor.current === ownerRef.current
      if (m.type === 'loaded') {
        busy.current = false
        if (!m.ok) {
          loadedFor.current = null
          patch({ error: m.error, state: 'error' })
          return
        }
        patch({ error: null, probes: m.probes, h: m.h })
        busy.current = true
        if (pendingStep.current !== null) {
          w.postMessage({ type: 'step', n: pendingStep.current, view: viewRef.current } satisfies ToWorker)
          pendingStep.current = null
        } else w.postMessage({ type: 'frame', view: viewRef.current } satisfies ToWorker)
      } else if (m.type === 'frame') {
        busy.current = false
        if (!mine) return
        if (m.frame.status.ok) patch({ frame: m.frame, computeMs: m.ms })
        else patch({ frame: m.frame, computeMs: m.ms, error: m.frame.status.error ?? 'The simulation stopped.', state: 'error' })
      } else if (m.type === 'updated') {
        if (!m.hot) patch({ notice: 'The circuit structure changed, so the simulation restarted from t = 0.', frame: null, ...(m.probes ? { probes: m.probes } : {}), ...(m.h ? { h: m.h } : {}) })
        const s = stRef.current.owner === ownerRef.current ? stRef.current.state : 'idle'
        if (s !== 'running' && !busy.current) {
          busy.current = true
          w.postMessage({ type: 'frame', view: viewRef.current } satisfies ToWorker)
        }
      } else {
        const done = waiters.current.get(m.req)
        waiters.current.delete(m.req)
        done?.(m)
      }
    }
    return () => {
      w.terminate()
      worker.current = null
    }
  }, [patch])

  const stateNow = useCallback((): SimState => (stRef.current.owner === ownerRef.current ? stRef.current.state : 'idle'), [])
  const isLoaded = useCallback(() => loadedFor.current === ownerRef.current, [])

  const load = useCallback(() => {
    loadedFor.current = ownerRef.current
    busy.current = true
    patch({ error: null, notice: null, frame: null })
    worker.current?.postMessage({ type: 'load', doc: docRef.current, h: stepRef.current } satisfies ToWorker)
  }, [patch])

  // The run loop.
  const running = cur.state === 'running'
  useEffect(() => {
    if (!running) return
    let raf = 0
    let last = performance.now()
    const tick = (now: number) => {
      const dtReal = Math.min(0.1, (now - last) / 1000)
      last = now
      if (isLoaded() && !busy.current) {
        busy.current = true
        const max = !Number.isFinite(speedRef.current)
        worker.current?.postMessage({ type: 'advance', seconds: max ? 10 : speedRef.current * viewRef.current.timeDiv * dtReal, budgetMs: max ? 30 : 14, view: viewRef.current } satisfies ToWorker)
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [running, owner, isLoaded])

  // Live parameter changes go to the loaded simulation of this workspace.
  useEffect(() => {
    if (isLoaded() && stateNow() !== 'idle') worker.current?.postMessage({ type: 'update', doc } satisfies ToWorker)
  }, [doc, isLoaded, stateNow])

  // Scope settings changed while not running: redraw from the buffer.
  useEffect(() => {
    if (isLoaded() && stateNow() !== 'running' && !busy.current) {
      busy.current = true
      worker.current?.postMessage({ type: 'frame', view: viewOf(settings) } satisfies ToWorker)
    }
  }, [settings, isLoaded, stateNow])

  const run = useCallback(() => {
    const s = stateNow()
    if (s === 'paused' && isLoaded()) return patch({ state: 'running' })
    if (s === 'running') return
    load()
    patch({ state: 'running' })
  }, [load, patch, stateNow, isLoaded])
  const pause = useCallback(() => {
    if (stateNow() === 'running') patch({ state: 'paused' })
  }, [patch, stateNow])
  const stop = useCallback(() => {
    const s = stateNow()
    if (s === 'running' || s === 'paused') patch({ state: 'stopped' })
  }, [patch, stateNow])
  const reset = useCallback(() => {
    load()
    patch({ state: 'idle' })
  }, [load, patch])
  const step = useCallback(
    (n: number) => {
      const s = stateNow()
      // A finished or failed run starts again from t = 0; an idle (reset) one is already loaded.
      if (!isLoaded() || s === 'stopped' || s === 'error') {
        pendingStep.current = n
        load()
        patch({ state: 'paused' })
        return
      }
      patch({ state: 'paused' })
      if (busy.current) return
      busy.current = true
      worker.current?.postMessage({ type: 'step', n, view: viewRef.current } satisfies ToWorker)
    },
    [load, patch, stateNow, isLoaded],
  )
  /** Back to idle (used when the experiment circuit is restored). */
  const clear = useCallback(() => {
    loadedFor.current = null
    busy.current = false
    pendingStep.current = null
    patch(blank(ownerRef.current))
  }, [patch])
  const ask = <T,>(m: ToWorker & { req: number }) =>
    new Promise<T>((resolve) => {
      waiters.current.set(m.req, resolve as (v: unknown) => void)
      send(m)
    })
  const runExperiment = useCallback((id: string, d: CircuitDoc) => ask<ExperimentResult>({ type: 'experiment', id, doc: d, req: ++req.current }), [])
  const runAc = useCallback(async (d: CircuitDoc, input: string, output: string) => (await ask<{ result: AcResult | { error: string } }>({ type: 'ac', doc: d, input, output, req: ++req.current })).result, [])

  return { ...cur, run, pause, stop, reset, clear, step, runExperiment, runAc, dismissNotice: () => patch({ notice: null }) }
}
