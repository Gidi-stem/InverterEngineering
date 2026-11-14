/// <reference lib="webworker" />
import { SIM_EXPERIMENT_BY_ID } from '../../../content/simExperiments'
import { acSweep } from '../../../engine/sim/ac'
import { recordRun } from '../../../engine/sim/record'
import { SimSession } from '../../../engine/sim/session'
import type { FromWorker, ToWorker } from './protocol'

/**
 * Simulation worker: the solver runs here so the page stays responsive however heavy the circuit.
 * The UI asks for frames; each request advances the simulation within a time budget and replies
 * with the oscilloscope window, measurements, energy and thermal figures.
 */
declare const self: DedicatedWorkerGlobalScope
let session: SimSession | null = null
let opts: { h?: number; ambient?: number } = {}
const post = (m: FromWorker) => self.postMessage(m)
const now = () => performance.now()

self.onmessage = (e: MessageEvent<ToWorker>) => {
  const m = e.data
  try {
    switch (m.type) {
      case 'load': {
        opts = { h: m.h, ambient: m.ambient }
        const s = SimSession.create(m.doc, opts)
        if ('error' in s) {
          session = null
          post({ type: 'loaded', ok: false, error: s.error })
        } else {
          session = s
          post({ type: 'loaded', ok: true, h: s.sim.h, probes: s.probes() })
        }
        break
      }
      case 'update': {
        if (session && session.update(m.doc)) post({ type: 'updated', hot: true })
        else {
          const s = SimSession.create(m.doc, opts)
          session = 'error' in s ? null : s
          post(session ? { type: 'updated', hot: false, probes: session.probes(), h: session.sim.h } : { type: 'loaded', ok: false, error: (s as { error: string }).error })
        }
        break
      }
      case 'advance':
      case 'step':
      case 'frame': {
        if (!session) break
        const t = now()
        session.setWindow(m.view.timeDiv)
        if (m.type === 'advance') session.advance(m.seconds, m.budgetMs, now)
        if (m.type === 'step') session.stepN(m.n)
        post({ type: 'frame', frame: session.frame(m.view), ms: now() - t })
        break
      }
      case 'experiment': {
        const ex = SIM_EXPERIMENT_BY_ID[m.id]
        const t = now()
        if (!ex) break
        const r = recordRun(m.doc, ex.run.duration, ex.run.keys, ex.run.keep)
        const expected = ex.expected(m.doc)
        post({ type: 'experiment', req: m.req, ok: r.ok, error: r.error, expected, observations: r.ok ? ex.observe(m.doc, r) : [], ms: now() - t })
        break
      }
      case 'ac':
        post({ type: 'ac', req: m.req, result: acSweep(m.doc, m.input, m.output) })
        break
    }
  } catch (err) {
    post({ type: 'loaded', ok: false, error: `Simulation error: ${err instanceof Error ? err.message : String(err)}` })
  }
}
