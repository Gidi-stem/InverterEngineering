import { useState, type PointerEvent as RPointerEvent } from 'react'
import { PART_DEFS, PART_GROUP_LABEL } from '../../engine/circuit/parts'
import type { PartDef, PartType } from '../../engine/circuit/types'
import { PartGlyph } from './PartGlyph'

interface Props {
  /** Parts suggested by the exercise; "All parts" shows the full catalogue. */
  suggested: PartType[] | null
  armed: PartType | null
  onArm: (t: PartType | null) => void
  /** Called when a part is dropped at a client position; returns false when outside the workspace. */
  onDrop: (t: PartType, cx: number, cy: number) => boolean
}

const GROUP_ORDER: PartDef['group'][] = ['sources', 'passives', 'semiconductors', 'magnetics', 'protection', 'switching', 'loads', 'reference']

/**
 * Part palette. Drag a part onto the workspace, or tap it to arm it and tap the workspace to place
 * it (the touch-friendly path). Works with mouse, pen and touch through pointer events.
 */
export function Toolbox({ suggested, armed, onArm, onDrop }: Props) {
  const [all, setAll] = useState(false)
  const [ghost, setGhost] = useState<{ type: PartType; x: number; y: number } | null>(null)
  const show = (t: PartType) => all || !suggested || suggested.includes(t)

  const start = (e: RPointerEvent<HTMLButtonElement>, type: PartType) => {
    if (e.button !== 0) return
    const sx = e.clientX
    const sy = e.clientY
    let dragging = false
    const el = e.currentTarget
    el.setPointerCapture(e.pointerId)
    const move = (ev: PointerEvent) => {
      if (!dragging && Math.hypot(ev.clientX - sx, ev.clientY - sy) > 6) dragging = true
      if (dragging) setGhost({ type, x: ev.clientX, y: ev.clientY })
    }
    const up = (ev: PointerEvent) => {
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerup', up)
      el.removeEventListener('pointercancel', cancel)
      setGhost(null)
      if (dragging) {
        if (onDrop(type, ev.clientX, ev.clientY)) onArm(null)
      } else onArm(armed === type ? null : type)
    }
    const cancel = () => {
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerup', up)
      el.removeEventListener('pointercancel', cancel)
      setGhost(null)
    }
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerup', up)
    el.addEventListener('pointercancel', cancel)
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between gap-2 border-b border-chassis-700 px-3 py-2">
        <h2 className="text-xs font-semibold tracking-wide text-ink-300 uppercase">Parts</h2>
        {suggested && (
          <label className="flex items-center gap-1.5 text-[11px] text-ink-400">
            <input type="checkbox" checked={all} onChange={(e) => setAll(e.target.checked)} className="accent-signal-500" />
            All parts
          </label>
        )}
      </div>
      <div className="min-h-0 flex-1 touch-pan-x overflow-x-auto overflow-y-hidden xl:touch-pan-y xl:overflow-x-hidden xl:overflow-y-auto">
        <div className="flex gap-3 p-2 xl:flex-col xl:gap-3">
          {GROUP_ORDER.map((g) => {
            const items = (Object.values(PART_DEFS) as PartDef[]).filter((d) => d.group === g && show(d.type))
            if (!items.length) return null
            return (
              <section key={g} className="shrink-0">
                <h3 className="mb-1 px-1 text-[10px] font-medium tracking-wide text-ink-500 uppercase">{PART_GROUP_LABEL[g]}</h3>
                <ul className="flex gap-1 xl:grid xl:grid-cols-2">
                  {items.map((d) => (
                    <li key={d.type}>
                      <button
                        type="button"
                        data-testid={`tool-${d.type}`}
                        aria-pressed={armed === d.type}
                        title={d.description}
                        onPointerDown={(e) => start(e, d.type)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            onArm(armed === d.type ? null : d.type)
                          }
                        }}
                        className={`flex h-[72px] w-[84px] flex-col items-center justify-center gap-1 rounded-md border px-1 text-center text-[10.5px] leading-tight transition-colors xl:w-full ${
                          armed === d.type ? 'border-signal-400 bg-signal-500/15 text-signal-200' : 'border-chassis-700 bg-chassis-900 text-ink-300 hover:border-chassis-500 hover:text-ink-100'
                        }`}
                      >
                        <svg viewBox="-3.8 -2.6 7.6 5.2" className="h-8 w-12 text-current" aria-hidden="true">
                          <PartGlyph type={d.type} />
                        </svg>
                        <span className="line-clamp-2">{d.name}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            )
          })}
        </div>
      </div>
      {ghost && (
        <div className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-1/2 rounded-md border border-signal-400 bg-chassis-900/90 p-1 text-signal-200 shadow-lg" style={{ left: ghost.x, top: ghost.y }}>
          <svg viewBox="-3.8 -2.6 7.6 5.2" className="h-10 w-14" aria-hidden="true">
            <PartGlyph type={ghost.type} />
          </svg>
        </div>
      )}
    </div>
  )
}
