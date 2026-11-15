import { PART_DEFS } from '../circuit/parts'
import { buildTopology, nodeOfTerminal } from '../circuit/topology'
import type { CircuitDoc } from '../circuit/types'
import type { AssemblyStep, Req } from './generate'

/**
 * Assembly verification on the connection graph. A step is complete when every one of its
 * electrical requirements holds in the student's circuit; where parts sit on the canvas is never
 * checked. Two-terminal parts in a series requirement may be connected either way round.
 */
export interface StepStatus {
  id: string
  done: boolean
  missing: string[]
}

const split = (ref: string): [string, string] => {
  const i = ref.indexOf('.')
  return [ref.slice(0, i), ref.slice(i + 1)]
}

export function verifySteps(doc: CircuitDoc, steps: AssemblyStep[]): StepStatus[] {
  const topo = buildTopology(doc)
  const byId = new Map(doc.parts.map((p) => [p.id, p]))
  const label = (ref: string) => {
    const [pid, tid] = split(ref)
    const p = byId.get(pid)
    const t = p ? PART_DEFS[p.type].terminals.find((x) => x.id === tid)?.label ?? tid : tid
    return `${pid} ${t}`
  }
  const node = (ref: string) => {
    const [pid, tid] = split(ref)
    return byId.has(pid) ? nodeOfTerminal(topo, pid, tid) : -1
  }
  const joined = (a: string, b: string) => {
    const na = node(a)
    return na >= 0 && na === node(b)
  }
  const check = (r: Req): string | null => {
    const ids = r.kind === 'conn' ? [split(r.a)[0], split(r.b)[0]] : [split(r.a)[0], r.part, split(r.b)[0]]
    const absent = ids.find((id) => !byId.has(id))
    if (absent) return `Place ${absent} from the parts kit.`
    if (r.kind === 'conn') return joined(r.a, r.b) ? null : `Connect ${label(r.a)} to ${label(r.b)}.`
    const p = byId.get(r.part)!
    const [t1, t2] = PART_DEFS[p.type].terminals.map((t) => `${p.id}.${t.id}`)
    const ok = (joined(r.a, t1) && joined(t2, r.b)) || (joined(r.a, t2) && joined(t1, r.b))
    return ok ? null : `Connect ${label(r.a)} through ${r.part} to ${label(r.b)}.`
  }
  return steps.map((s) => {
    const missing = s.req.map(check).filter((x): x is string => !!x)
    return { id: s.id, done: missing.length === 0, missing }
  })
}
