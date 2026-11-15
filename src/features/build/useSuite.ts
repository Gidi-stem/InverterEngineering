import { useCallback, useEffect, useRef, useState } from 'react'
import type { CircuitDoc } from '../../engine/circuit/types'
import type { SuiteContext, TestKind, TestResult } from '../../engine/design/testing'
import type { SuiteReply, SuiteRequest } from './suite.worker'

export interface SuiteRun {
  running: boolean
  done: number
  total: number
  results: TestResult[]
  error: string | null
  ms: number | null
}
const IDLE: SuiteRun = { running: false, done: 0, total: 0, results: [], error: null, ms: null }

/**
 * Runs the engineering test suite in a worker and streams results as each test finishes. A new run
 * cancels the previous one by terminating its worker.
 */
export function useSuite() {
  const [run, setRun] = useState<SuiteRun>(IDLE)
  const worker = useRef<Worker | null>(null)
  const req = useRef(0)
  const stop = useCallback(() => {
    worker.current?.terminate()
    worker.current = null
  }, [])
  useEffect(() => stop, [stop])

  const start = useCallback(
    (doc: CircuitDoc, ctx: SuiteContext, kinds: TestKind[] | undefined, onDone?: (r: TestResult[]) => void) => {
      stop()
      const w = new Worker(new URL('./suite.worker.ts', import.meta.url), { type: 'module' })
      worker.current = w
      const id = ++req.current
      setRun({ ...IDLE, running: true, total: kinds?.length ?? 0 })
      w.onmessage = (e: MessageEvent<SuiteReply>) => {
        const m = e.data
        if (m.req !== id) return
        if (m.type === 'progress') setRun((r) => ({ ...r, done: m.done, total: m.total, results: [...r.results, m.result] }))
        else if (m.type === 'done') {
          setRun({ running: false, done: m.results.length, total: m.results.length, results: m.results, error: null, ms: m.ms })
          stop()
          onDone?.(m.results)
        } else {
          setRun((r) => ({ ...r, running: false, error: m.error }))
          stop()
        }
      }
      w.onerror = (ev) => {
        setRun((r) => ({ ...r, running: false, error: ev.message || 'The test worker failed.' }))
        stop()
      }
      w.postMessage({ req: id, doc, ctx, kinds } satisfies SuiteRequest)
    },
    [stop],
  )
  const cancel = useCallback(() => {
    stop()
    setRun((r) => ({ ...r, running: false }))
  }, [stop])
  return { run, start, cancel }
}
