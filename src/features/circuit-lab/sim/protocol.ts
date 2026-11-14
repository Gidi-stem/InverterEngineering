import type { Expected, Observation } from '../../../content/simExperiments'
import type { CircuitDoc } from '../../../engine/circuit/types'
import type { AcResult } from '../../../engine/sim/ac'
import type { Frame, ProbeInfo, ViewReq } from '../../../engine/sim/session'

/** Messages between the circuit lab UI and the simulation worker. */
export type ToWorker =
  | { type: 'load'; doc: CircuitDoc; h?: number; ambient?: number }
  | { type: 'update'; doc: CircuitDoc }
  | { type: 'advance'; seconds: number; budgetMs: number; view: ViewReq }
  | { type: 'step'; n: number; view: ViewReq }
  | { type: 'frame'; view: ViewReq }
  | { type: 'experiment'; id: string; doc: CircuitDoc; req: number }
  | { type: 'ac'; doc: CircuitDoc; input: string; output: string; req: number }

export type FromWorker =
  | { type: 'loaded'; ok: true; h: number; probes: ProbeInfo[] }
  | { type: 'loaded'; ok: false; error: string }
  | { type: 'frame'; frame: Frame; ms: number }
  | { type: 'updated'; hot: boolean; probes?: ProbeInfo[]; h?: number }
  | { type: 'experiment'; req: number; ok: boolean; error?: string; expected: Expected[]; observations: Observation[]; ms: number }
  | { type: 'ac'; req: number; result: AcResult | { error: string } }
