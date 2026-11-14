import type { InverterModel } from '../../../types/domain'
import { useProgress } from '../../../store/progressStore'
import { useLab } from '../store/labStore'

/** Accessible twin of the 3D scene: every part by assembly, keyboard-operable. */
export function PartsTree({ model }: { model: InverterModel }) {
  const mode = useLab((s) => s.mode)
  const selectedId = useLab((s) => s.selectedId)
  const hidden = useLab((s) => s.hidden)
  const isolated = useLab((s) => s.isolated)
  const removed = useLab((s) => s.removed)
  const select = useLab((s) => s.select)
  const clickPart = useLab((s) => s.clickPart)
  const toggleHidden = useLab((s) => s.toggleHidden)
  const isolate = useLab((s) => s.isolate)
  const hover = useLab((s) => s.hover)
  const inspected = useProgress((s) => s.inspectedComponents)

  if (mode === 'identify')
    return <p className="p-4 text-sm text-ink-400">The parts list is hidden during the identification challenge so it cannot give the answers away.</p>

  return (
    <nav aria-label="Inverter parts" className="flex flex-col gap-3 p-3">
      {model.assemblies.map((a) => {
        const parts = model.parts.filter((p) => p.assembly === a.id)
        return (
          <section key={a.id}>
            <div className="mb-1 flex items-center justify-between gap-2">
              <h3 className="text-xs font-semibold text-ink-400">{a.label}</h3>
              {mode === 'explore' && (
                <button type="button" onClick={() => isolate(isolated === a.id ? null : a.id)} aria-pressed={isolated === a.id} className={`rounded px-1.5 py-0.5 text-[11px] ${isolated === a.id ? 'bg-signal-500/25 text-signal-300' : 'text-ink-500 hover:text-ink-100'}`}>
                  {isolated === a.id ? 'Show everything' : 'Isolate'}
                </button>
              )}
            </div>
            <ul className="flex flex-col">
              {parts.map((p) => {
                const isHidden = hidden.includes(p.id)
                const isRemoved = removed.includes(p.id)
                const seen = inspected.includes(p.componentId)
                return (
                  <li key={p.id} className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => (mode === 'explore' ? select(p.id, true) : clickPart(p.id))}
                      onMouseEnter={() => hover(p.id)}
                      onMouseLeave={() => hover(null)}
                      aria-pressed={selectedId === p.id}
                      className={`flex min-h-8 flex-1 items-center gap-2 rounded px-2 text-left text-[13px] ${selectedId === p.id ? 'bg-signal-500/20 text-ink-100' : 'text-ink-300 hover:bg-chassis-800 hover:text-ink-100'} ${isHidden || isRemoved ? 'opacity-50' : ''}`}
                    >
                      {p.designator && <span className="readout w-9 shrink-0 text-[11px] text-signal-300">{p.designator}</span>}
                      <span className="truncate">{p.label}</span>
                      {mode === 'explore' && seen && <span className="ml-auto text-[10px] text-live-400" title="Information studied">●</span>}
                      {mode !== 'explore' && isRemoved && <span className="ml-auto text-[10px] text-ink-500">{mode === 'reassemble' ? 'in tray' : 'removed'}</span>}
                    </button>
                    {mode === 'explore' && (
                      <button type="button" onClick={() => toggleHidden(p.id)} aria-label={`${isHidden ? 'Show' : 'Hide'} ${p.label}`} aria-pressed={!isHidden} className="grid h-8 w-8 shrink-0 place-items-center rounded text-ink-500 hover:bg-chassis-800 hover:text-ink-100">
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
                          {isHidden ? <path d="M3 3l18 18M10.6 6.1A9.8 9.8 0 0 1 12 6c6 0 10 6 10 6a17 17 0 0 1-3.2 3.7M6.6 6.6C3.9 8.4 2 12 2 12s4 6 10 6a9.6 9.6 0 0 0 4.2-1" /> : <><path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></>}
                        </svg>
                      </button>
                    )}
                  </li>
                )
              })}
            </ul>
          </section>
        )
      })}
    </nav>
  )
}
