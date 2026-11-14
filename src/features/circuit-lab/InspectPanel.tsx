import { useState } from 'react'
import { Link } from 'react-router-dom'
import { nodeOfTerminal } from '../../engine/circuit/topology'
import { PART_DEFS } from '../../engine/circuit/parts'
import type { CircuitAnalysis } from '../../engine/circuit/validate'
import type { CircuitDoc, ParamDef, PlacedPart } from '../../engine/circuit/types'
import { Button, Tag } from '../../ui/primitives'
import { floatingNodes, modeLabel } from './analysis'
import { eng, terminalLabel, volts } from './format'
import type { Selection } from './Workspace'

interface Props {
  doc: CircuitDoc
  analysis: CircuitAnalysis
  selection: Selection
  onParam: (id: string, key: string, v: number) => void
  onState: (id: string, key: string, v: number) => void
  onRotate: (id: string) => void
  onDelete: (id: string) => void
  onDeleteWire: (id: string) => void
  onSelectNode: (node: number | null) => void
}

const tref = (doc: CircuitDoc, partId: string, tid: string) => {
  const p = doc.parts.find((x) => x.id === partId)
  return p ? `${p.label}.${terminalLabel(p, tid)}` : `${partId}.${tid}`
}

function ParamInput({ part, def, onCommit }: { part: PlacedPart; def: ParamDef; onCommit: (v: number) => void }) {
  const current = part.params[def.key] ?? def.default
  const [text, setText] = useState<string | null>(null)
  const commit = () => {
    if (text === null) return
    const v = Number(text)
    setText(null)
    if (!Number.isFinite(v)) return
    onCommit(Math.min(def.max, Math.max(def.min, v)))
  }
  return (
    <label className="grid grid-cols-[1fr_auto] items-center gap-2 text-xs">
      <span className="text-ink-300">
        {def.label}
        <span className="ml-1 text-ink-500">
          ({def.min}–{def.max} {def.unit})
        </span>
      </span>
      <span className="flex items-center gap-1">
        <input
          type="number"
          inputMode="decimal"
          aria-label={`${def.label} (${def.unit})`}
          data-testid={`param-${def.key}`}
          className="h-9 w-24 rounded-md border border-chassis-600 bg-chassis-950 px-2 text-right font-mono text-ink-100 focus:border-signal-400 focus:outline-none"
          value={text ?? String(current)}
          min={def.min}
          max={def.max}
          step={def.step ?? 'any'}
          onChange={(e) => setText(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => e.key === 'Enter' && commit()}
        />
        <span className="w-9 text-ink-400">{def.unit}</span>
      </span>
    </label>
  )
}

export function InspectPanel({ doc, analysis, selection, onParam, onState, onRotate, onDelete, onDeleteWire, onSelectNode }: Props) {
  const { topo, solutions } = analysis
  const sols = solutions.filter((s) => s.ok)
  const floating = floatingNodes(doc, analysis)
  const nodeV = (s: (typeof sols)[number], n: number) => (floating.has(n) ? 'floating' : volts(s.nodeVoltages[n] ?? 0))

  if (selection?.kind === 'part') {
    const p = doc.parts.find((x) => x.id === selection.id)
    if (!p) return null
    const def = PART_DEFS[p.type]
    return (
      <div className="space-y-4" data-testid="inspect-part">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-mono text-base font-semibold text-ink-100">{p.label}</h3>
            <p className="text-sm text-ink-300">{def.name}</p>
          </div>
          <div className="flex gap-1">
            <Button variant="secondary" onClick={() => onRotate(p.id)} aria-label="Rotate 90°" title="Rotate 90° (R)">
              ⟳
            </Button>
            <Button variant="danger" onClick={() => onDelete(p.id)} aria-label="Delete part" title="Delete (Del)">
              Delete
            </Button>
          </div>
        </div>
        <p className="text-xs leading-relaxed text-ink-400">{def.description}</p>
        {def.componentId && (
          <Link to={`/components/${def.componentId}`} className="inline-flex text-xs text-signal-300 underline-offset-2 hover:underline">
            Open the {def.name.toLowerCase()} entry in the Component Library →
          </Link>
        )}

        {(def.states ?? []).map((st) => (
          <div key={st.key} className="space-y-1">
            <div className="text-xs text-ink-300">{st.label}</div>
            <div className="inline-flex rounded-md border border-chassis-600 p-0.5" role="group" aria-label={st.label}>
              {st.options.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  aria-pressed={(p.states[st.key] ?? st.default) === o.value}
                  data-testid={`state-${st.key}-${o.value}`}
                  onClick={() => onState(p.id, st.key, o.value)}
                  className={`min-h-9 rounded px-3 text-xs font-medium ${(p.states[st.key] ?? st.default) === o.value ? 'bg-signal-500 text-white' : 'text-ink-300 hover:bg-chassis-800'}`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        ))}

        {def.params.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-[11px] font-semibold tracking-wide text-ink-400 uppercase">Parameters</h4>
            {def.params.map((q) => (
              <ParamInput key={`${p.id}-${q.key}`} part={p} def={q} onCommit={(v) => onParam(p.id, q.key, v)} />
            ))}
            <p className="text-[11px] text-ink-500">Typical educational values, not ratings of a particular manufacturer’s part.</p>
          </div>
        )}

        <div className="space-y-2">
          <h4 className="text-[11px] font-semibold tracking-wide text-ink-400 uppercase">Terminals and solved values</h4>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-ink-500">
                <th className="py-1 font-medium">Pin</th>
                <th className="py-1 font-medium">Node</th>
                {sols.map((s, i) => (
                  <th key={i} className="py-1 text-right font-medium">
                    V ({modeLabel(s)})
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {def.terminals.map((t) => {
                const n = nodeOfTerminal(topo, p.id, t.id)
                const wired = doc.wires.some((w) => (w.a.partId === p.id && w.a.terminalId === t.id) || (w.b.partId === p.id && w.b.terminalId === t.id))
                return (
                  <tr key={t.id} className="border-t border-chassis-800">
                    <td className="py-1 font-mono text-ink-100">{t.label}</td>
                    <td className="py-1">
                      {wired ? (
                        <button type="button" className="font-mono text-signal-300 hover:underline" onClick={() => onSelectNode(n)}>
                          N{n}
                          {n === topo.referenceNode ? ' (0 V)' : ''}
                        </button>
                      ) : (
                        <Tag tone="caution">unconnected</Tag>
                      )}
                    </td>
                    {sols.map((s, i) => (
                      <td key={i} className="py-1 text-right font-mono text-ink-200">
                        {floating.has(n) ? 'floating' : volts(s.parts[p.id]?.v[t.id] ?? 0)}
                      </td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
          {sols.map((s, i) => {
            const r = s.parts[p.id]
            if (!r || p.type === 'ground') return null
            return (
              <dl key={i} className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 rounded-md bg-chassis-950 px-3 py-2 text-xs">
                <dt className="col-span-2 text-[10px] font-semibold tracking-wide text-ink-500 uppercase">{modeLabel(s)}</dt>
                <dt className="text-ink-400">Current</dt>
                <dd className="text-right font-mono text-ink-100">{eng(r.i, 'A')}</dd>
                <dt className="text-ink-400">{r.p < 0 ? 'Power delivered' : 'Power absorbed'}</dt>
                <dd className="text-right font-mono text-ink-100">{eng(Math.abs(r.p), 'W')}</dd>
                {r.state && (
                  <>
                    <dt className="text-ink-400">State</dt>
                    <dd className="text-right text-ink-100">{r.state}</dd>
                  </>
                )}
                {Object.entries(r.extra ?? {}).map(([k, v]) => (
                  <div key={k} className="contents">
                    <dt className="text-ink-400">{k === 'body' ? 'Body-diode current' : k === 'coil' ? 'Coil current' : k === 'secondary' ? 'Secondary current' : k === 'pole2' ? 'Second-pole current' : k}</dt>
                    <dd className="text-right font-mono text-ink-100">{eng(v, 'A')}</dd>
                  </div>
                ))}
              </dl>
            )
          })}
        </div>
      </div>
    )
  }

  if (selection?.kind === 'wire') {
    const w = doc.wires.find((x) => x.id === selection.id)
    if (!w) return null
    const n = nodeOfTerminal(topo, w.a.partId, w.a.terminalId)
    const node = topo.nodes[n]
    return (
      <div className="space-y-3" data-testid="inspect-wire">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-mono text-sm font-semibold text-ink-100">
              {tref(doc, w.a.partId, w.a.terminalId)} — {tref(doc, w.b.partId, w.b.terminalId)}
            </h3>
            <p className="text-xs text-ink-400">
              Wire {w.id} on node N{n}
              {n === topo.referenceNode ? ' (0 V reference)' : ''}
            </p>
          </div>
          <Button variant="danger" onClick={() => onDeleteWire(w.id)}>
            Delete wire
          </Button>
        </div>
        <p className="text-xs text-ink-400">To reconnect, drag either square end handle onto another terminal.</p>
        <div className="text-xs">
          <div className="mb-1 text-ink-300">All terminals on node N{n} (one electrical point):</div>
          <div className="flex flex-wrap gap-1">
            {node?.terminals.map((t) => (
              <Tag key={`${t.partId}:${t.terminalId}`} tone="signal">
                {tref(doc, t.partId, t.terminalId)}
              </Tag>
            ))}
          </div>
          {sols.length > 0 && (
            <div className="mt-2 font-mono text-ink-200">
              {sols.map((s) => `${modeLabel(s)}: ${nodeV(s, n)}`).join('   ')}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Nothing selected: the connection graph.
  const wired = new Set(doc.wires.flatMap((w) => [`${w.a.partId}:${w.a.terminalId}`, `${w.b.partId}:${w.b.terminalId}`]))
  const nodes = topo.nodes.filter((n) => n.terminals.some((t) => wired.has(`${t.partId}:${t.terminalId}`)))
  return (
    <div className="space-y-3" data-testid="inspect-graph">
      <p className="text-xs text-ink-400">Select a part or wire to inspect it. Every wired group of terminals is one electrical node:</p>
      {nodes.length === 0 ? (
        <p className="text-sm text-ink-500">No connections yet. Drag from one terminal to another to draw a wire.</p>
      ) : (
        <table className="w-full text-xs">
          <thead>
            <tr className="text-left text-ink-500">
              <th className="py-1 font-medium">Node</th>
              <th className="py-1 font-medium">Terminals</th>
              <th className="py-1 text-right font-medium">Voltage</th>
            </tr>
          </thead>
          <tbody>
            {nodes.map((n) => (
              <tr key={n.id} className="border-t border-chassis-800 align-top hover:bg-chassis-800/40" onPointerEnter={() => onSelectNode(n.id)} onPointerLeave={() => onSelectNode(null)}>
                <td className="py-1.5 font-mono text-ink-100">
                  N{n.id}
                  {n.id === topo.referenceNode && <div className="text-[10px] text-ink-500">0 V ref</div>}
                </td>
                <td className="py-1.5 text-ink-300">{n.terminals.map((t) => tref(doc, t.partId, t.terminalId)).join(', ')}</td>
                <td className="py-1.5 text-right font-mono whitespace-nowrap text-ink-200">{sols.map((s) => nodeV(s, n.id)).join(' | ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
