import { useState, type PointerEvent as RPointerEvent } from 'react'
import { PART_DEFS } from '../../engine/circuit/parts'
import type { PlacedPart } from '../../engine/circuit/types'
import { PartGlyph } from '../circuit-lab/PartGlyph'

interface Props {
  remaining: PlacedPart[]
  total: number
  armed: string | null
  onArm: (id: string | null) => void
  /** Drop at a client position; returns false when outside the workspace. */
  onDrop: (part: PlacedPart, cx: number, cy: number) => boolean
}

/**
 * The project's parts kit: the components of this design, with the values from the configurator.
 * Drag a part onto the workspace, or tap it and then tap the workspace (touch friendly).
 */
export function KitToolbox({ remaining, total, armed, onArm, onDrop }: Props) {
  const [ghost, setGhost] = useState<{ part: PlacedPart; x: number; y: number } | null>(null)
  const start = (e: RPointerEvent<HTMLButtonElement>, part: PlacedPart) => {
    if (e.button !== 0) return
    const sx = e.clientX
    const sy = e.clientY
    let dragging = false
    const el = e.currentTarget
    el.setPointerCapture(e.pointerId)
    const move = (ev: PointerEvent) => {
      if (!dragging && Math.hypot(ev.clientX - sx, ev.clientY - sy) > 6) dragging = true
      if (dragging) setGhost({ part, x: ev.clientX, y: ev.clientY })
    }
    const end = (ev: PointerEvent | null) => {
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerup', up)
      el.removeEventListener('pointercancel', cancel)
      setGhost(null)
      if (!ev) return
      if (dragging) {
        if (onDrop(part, ev.clientX, ev.clientY)) onArm(null)
      } else onArm(armed === part.id ? null : part.id)
    }
    const up = (ev: PointerEvent) => end(ev)
    const cancel = () => end(null)
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerup', up)
    el.addEventListener('pointercancel', cancel)
  }
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between gap-2 border-b border-chassis-700 px-3 py-2">
        <h2 className="text-xs font-semibold tracking-wide text-ink-300 uppercase">Parts kit</h2>
        <span className="readout text-[11px] text-ink-500" data-testid="kit-count">
          {total - remaining.length}/{total} placed
        </span>
      </div>
      <div className="min-h-0 flex-1 touch-pan-x overflow-x-auto overflow-y-hidden xl:touch-pan-y xl:overflow-x-hidden xl:overflow-y-auto">
        {remaining.length === 0 ? (
          <p className="p-3 text-xs text-ink-400">Every part of the kit is on the workspace. Delete a part to return it to the kit.</p>
        ) : (
          <ul className="flex gap-1 p-2 xl:flex-col">
            {remaining.map((p) => (
              <li key={p.id} className="shrink-0">
                <button
                  type="button"
                  data-testid={`kit-${p.id}`}
                  aria-pressed={armed === p.id}
                  title={p.label}
                  onPointerDown={(e) => start(e, p)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      onArm(armed === p.id ? null : p.id)
                    }
                  }}
                  className={`flex h-[72px] w-[124px] items-center gap-2 rounded-md border px-1.5 text-left text-[10.5px] leading-tight xl:w-full ${
                    armed === p.id ? 'border-signal-400 bg-signal-500/15 text-signal-200' : 'border-chassis-700 bg-chassis-900 text-ink-300 hover:border-chassis-500 hover:text-ink-100'
                  }`}
                >
                  <svg viewBox="-3.8 -3.6 7.6 7.2" className="h-9 w-10 shrink-0 text-current" aria-hidden="true">
                    <PartGlyph type={p.type} />
                  </svg>
                  <span className="min-w-0">
                    <span className="block font-mono font-semibold text-ink-100">{p.id}</span>
                    <span className="line-clamp-2">{PART_DEFS[p.type].name}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {ghost && (
        <div className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-1/2 rounded-md border border-signal-400 bg-chassis-900/90 p-1 text-signal-200 shadow-lg" style={{ left: ghost.x, top: ghost.y }}>
          <svg viewBox="-3.8 -3.6 7.6 7.2" className="h-10 w-12" aria-hidden="true">
            <PartGlyph type={ghost.part.type} />
          </svg>
        </div>
      )}
    </div>
  )
}
