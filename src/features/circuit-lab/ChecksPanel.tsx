import type { CircuitAnalysis } from '../../engine/circuit/validate'
import type { CircuitDoc, ValidationIssue } from '../../engine/circuit/types'
import { Tag } from '../../ui/primitives'
import { modeLabel } from './analysis'

interface Props {
  doc: CircuitDoc
  analysis: CircuitAnalysis
  onFocus: (parts: string[] | null) => void
  onSelectPart: (id: string) => void
}

const TONE = { danger: 'danger', warning: 'caution', info: 'neutral' } as const
const SEVERITY = { danger: 'Danger', warning: 'Warning', info: 'Note' } as const

function IssueCard({ issue, doc, onFocus, onSelectPart }: { issue: ValidationIssue; doc: CircuitDoc; onFocus: Props['onFocus']; onSelectPart: Props['onSelectPart'] }) {
  const border = issue.severity === 'danger' ? 'border-danger-400/50 bg-danger-400/5' : issue.severity === 'warning' ? 'border-caution-400/40 bg-caution-400/5' : 'border-chassis-700 bg-chassis-900'
  return (
    <li className={`rounded-md border p-3 ${border}`} onPointerEnter={() => onFocus(issue.parts)} onPointerLeave={() => onFocus(null)} data-testid={`issue-${issue.kind}`}>
      <div className="mb-1 flex flex-wrap items-center gap-2">
        <Tag tone={TONE[issue.severity]}>{SEVERITY[issue.severity]}</Tag>
        <h3 className="text-sm font-semibold text-ink-100">{issue.title}</h3>
      </div>
      <p className="text-xs leading-relaxed text-ink-300">{issue.explanation}</p>
      <p className="mt-1.5 text-xs leading-relaxed text-ink-200">
        <span className="font-semibold text-live-400">Fix: </span>
        {issue.fix}
      </p>
      {issue.parts.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {issue.parts.map((id) => (
            <button key={id} type="button" onClick={() => onSelectPart(id)} className="rounded border border-chassis-600 px-1.5 py-0.5 font-mono text-[11px] text-ink-300 hover:border-signal-400 hover:text-signal-200">
              {doc.parts.find((p) => p.id === id)?.label ?? id}
            </button>
          ))}
        </div>
      )}
    </li>
  )
}

/** Live electrical checks: every issue comes from the node graph or from the solved circuit. */
export function ChecksPanel({ doc, analysis, onFocus, onSelectPart }: Props) {
  const { issues, solutions } = analysis
  const failed = solutions.find((s) => !s.ok)
  return (
    <div className="space-y-3" data-testid="checks">
      <div className="rounded-md bg-chassis-950 px-3 py-2 text-[11px] leading-relaxed text-ink-400">
        {doc.parts.length === 0
          ? 'Place parts to start the analysis.'
          : failed
            ? `The solver could not find an operating point: ${failed.error ?? 'check the connections.'}`
            : `Solved: ${solutions.map(modeLabel).join(' and ')}${solutions.some((s) => s.mode.kind !== 'dc') ? ' (AC evaluated at its positive and negative peaks)' : ' operating point'}. ${analysis.topo.nodes.length} nodes.`}
      </div>
      {issues.length === 0 && doc.parts.length > 0 && (
        <p className="rounded-md border border-live-400/30 bg-live-400/5 p-3 text-sm text-live-400" data-testid="no-issues">
          No faults found in the circuit as built.
        </p>
      )}
      <ul className="space-y-2">
        {issues.map((i) => (
          <IssueCard key={i.id} issue={i} doc={doc} onFocus={onFocus} onSelectPart={onSelectPart} />
        ))}
      </ul>
      <details className="text-[11px] leading-relaxed text-ink-500">
        <summary className="cursor-pointer text-ink-400">What the simulator calculates</summary>
        <p className="mt-1">
          A nodal (modified nodal analysis) solution of the circuit as wired: resistors, sources with internal resistance, a current-limited bench supply, piecewise-linear diodes and LEDs, MOSFETs and IGBTs as gate-controlled switches with
          body/anti-parallel diodes, relays, fuses and breakers. Capacitors are open circuits at DC; RC time constants are calculated from the resistance the capacitor sees. Transformers are ideal (with winding resistance) and only pass
          AC: AC sources are evaluated at their positive and negative peaks. Switching transients, ripple waveforms, magnetic saturation and thermal effects are not simulated; values shown as estimates are labelled as such.
        </p>
      </details>
    </div>
  )
}
