/// <reference lib="webworker" />
import type { CircuitDoc } from '../../engine/circuit/types'
import { runSuite, type SuiteContext, type TestKind, type TestResult } from '../../engine/design/testing'

/** Engineering test-suite worker: each test is a full transient simulation, so it runs off the UI thread. */
export type SuiteRequest = { req: number; doc: CircuitDoc; ctx: SuiteContext; kinds?: TestKind[] }
export type SuiteReply =
  | { type: 'progress'; req: number; result: TestResult; done: number; total: number }
  | { type: 'done'; req: number; results: TestResult[]; ms: number }
  | { type: 'error'; req: number; error: string }

declare const self: DedicatedWorkerGlobalScope
self.onmessage = (e: MessageEvent<SuiteRequest>) => {
  const { req, doc, ctx, kinds } = e.data
  const t0 = performance.now()
  try {
    const results = runSuite(doc, ctx, kinds, (result, done, total) => self.postMessage({ type: 'progress', req, result, done, total } satisfies SuiteReply))
    self.postMessage({ type: 'done', req, results, ms: performance.now() - t0 } satisfies SuiteReply)
  } catch (err) {
    self.postMessage({ type: 'error', req, error: err instanceof Error ? err.message : String(err) } satisfies SuiteReply)
  }
}
