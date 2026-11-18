/**
 * Live-circuit bridge for the DMM and clamp meter. Builds a `DmmPoint` / `ClampScenario` — the
 * same shapes the preset-scenario engines already consume — from a circuit the student has
 * actually built in the Circuit Lab, so `operateDmm()` / `readClamp()` (dmm.ts, clamp.ts) run
 * completely unchanged and their port-safety and live-circuit-resistance checks apply identically
 * whether the data came from a scripted scenario or a real probe.
 *
 * No second circuit-solving engine: every number below comes from the two solvers the Circuit Lab
 * itself already uses —
 *  - DC and resistance: `buildTopology` + `solveCircuit` + `measureResistance` (Phase 4 MNA solver,
 *    `engine/circuit/solve.ts`) — the same functions that drive the lab's live voltage labels and
 *    the Thevenin-resistance exercise grading.
 *  - True AC rms: `recordRun` + `measure` (Phase 5 time-domain engine, `engine/sim/*`) — the same
 *    engine the Circuit Lab's own oscilloscope and experiment grader already run the doc through,
 *    just for a short headless burst instead of a continuously streamed scope trace.
 */
import { buildTopology } from '../circuit/topology'
import { measureResistance, solveCircuit } from '../circuit/solve'
import { param, tkey } from '../circuit/parts'
import type { CircuitDoc } from '../circuit/types'
import { measure } from '../sim/analysis'
import { recordRun } from '../sim/record'
import type { ClampScenario } from './clamp'
import type { DmmPoint } from './dmm'

export interface ProbeRef {
  partId: string
  terminalId: string
}

const SOURCE_TYPES = new Set(['battery', 'dc-supply', 'ac-source', 'gate-source', 'pv-array'])

/** Longest period among the circuit's periodic drives (AC source, or PWM/variable-frequency gate
 * drive), 0 if the circuit is purely DC. Mirrors `circuit-lab/sim/defaults.ts`'s own scan so the
 * live DMM/clamp pick the same measurement window the lab's scope would default to. */
function longestPeriodS(doc: CircuitDoc): number {
  let period = 0
  for (const p of doc.parts) {
    if (p.type === 'ac-source') period = Math.max(period, 1 / param(p, 'f'))
    if (p.type === 'gate-source') {
      const mode = p.states.mode ?? 0
      if (mode === 1) period = Math.max(period, 1 / param(p, 'f'))
      if (mode === 2 || mode === 3) period = Math.max(period, 1 / param(p, 'fm'))
    }
  }
  return period
}

const probeKey = (a: ProbeRef, b: ProbeRef) => `T:${a.partId}.${a.terminalId}|T:${b.partId}.${b.terminalId}`

/** Node id of a probe's terminal, or undefined if the part/terminal no longer exists (the student
 * edited the circuit after picking the probe point). */
function nodeOf(doc: CircuitDoc, topo: ReturnType<typeof buildTopology>, ref: ProbeRef) {
  const p = doc.parts.find((x) => x.id === ref.partId)
  if (!p) return undefined
  return topo.nodeOf.get(tkey(p.id, ref.terminalId))
}

/**
 * DMM probing two leads across any two terminals of the student's circuit — voltage and
 * resistance/continuity. (Current needs the meter broken into a branch in series: see
 * `liveDmmSeriesPoint` below.)
 */
export function liveDmmTwoProbePoint(doc: CircuitDoc, a: ProbeRef, b: ProbeRef): DmmPoint {
  const label = `${a.partId}:${a.terminalId} ↔ ${b.partId}:${b.terminalId}`
  if (!doc.parts.length) return { id: 'live', label, isLive: false }
  const topo = buildTopology(doc)
  const nodeA = nodeOf(doc, topo, a)
  const nodeB = nodeOf(doc, topo, b)
  if (nodeA === undefined || nodeB === undefined || topo.referenceNode === null) return { id: 'live', label, isLive: false }

  const dc = solveCircuit(doc, topo, { kind: 'dc' })
  const dcVoltage = dc.ok ? (dc.nodeVoltages[nodeA] ?? 0) - (dc.nodeVoltages[nodeB] ?? 0) : undefined
  const { ohms, openCircuitVolts } = measureResistance(doc, topo, nodeA, nodeB)
  const isLive = Math.abs(openCircuitVolts) > 0.5 && doc.parts.some((p) => SOURCE_TYPES.has(p.type))

  const point: DmmPoint = {
    id: 'live',
    label,
    isLive,
    dcVoltage,
    resistanceOhms: Number.isFinite(ohms) ? Math.abs(ohms) : undefined,
  }

  const period = longestPeriodS(doc)
  if (period > 0) {
    const key = probeKey(a, b)
    const run = recordRun(doc, 6 * period, [key], 4 * period)
    if (run.ok) {
      const m = measure(run.traces[key], run.h)
      point.acVoltageRms = m.acRms
      point.acFrequencyHz = m.freq ?? undefined
    }
  }
  return point
}

/** DMM broken into series with one part's branch — the only way a real ammeter is connected. */
export function liveDmmSeriesPoint(doc: CircuitDoc, partId: string): DmmPoint {
  const p = doc.parts.find((x) => x.id === partId)
  const label = p ? `In series with ${p.label}` : 'In series (part not found)'
  if (!p) return { id: 'live', label, isLive: false }
  const topo = buildTopology(doc)
  const dc = solveCircuit(doc, topo, { kind: 'dc' })
  const seriesCurrentDc = dc.ok ? dc.parts[partId]?.i : undefined
  const isLive = doc.parts.some((x) => SOURCE_TYPES.has(x.type))

  const point: DmmPoint = { id: 'live', label, isLive, seriesCurrentDc }

  const period = longestPeriodS(doc)
  if (period > 0) {
    const key = `I:${partId}`
    const run = recordRun(doc, 6 * period, [key], 4 * period)
    if (run.ok) {
      const m = measure(run.traces[key], run.h)
      point.seriesCurrentAcRms = m.rms
    }
  }
  return point
}

/** Clamp meter around one part's lead (non-invasive: the circuit is never broken, unlike the
 * DMM's series ammeter mode above — the pedagogical difference the clamp lesson makes). */
export function liveClampScenario(doc: CircuitDoc, partId: string): ClampScenario | null {
  const p = doc.parts.find((x) => x.id === partId)
  if (!p) return null
  const topo = buildTopology(doc)
  const dc = solveCircuit(doc, topo, { kind: 'dc' })
  const dcCurrent = dc.ok ? Math.abs(dc.parts[partId]?.i ?? 0) : 0
  const period = longestPeriodS(doc)
  if (period === 0) {
    return { id: 'live', title: `${p.label} (your circuit)`, description: `Clamped around ${p.label}'s lead.`, steadyCurrentRms: dcCurrent }
  }
  const key = `I:${partId}`
  const run = recordRun(doc, 6 * period, [key], 4 * period)
  if (!run.ok) return { id: 'live', title: `${p.label} (your circuit)`, description: `Clamped around ${p.label}'s lead.`, steadyCurrentRms: dcCurrent }
  const m = measure(run.traces[key], run.h)
  return { id: 'live', title: `${p.label} (your circuit)`, description: `Clamped around ${p.label}'s lead.`, steadyCurrentRms: m.rms, acFrequencyHz: m.freq ?? undefined }
}
