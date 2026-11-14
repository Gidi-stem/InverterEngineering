import { useShallow } from 'zustand/react/shallow'
import { PANEL_ENTRY_BY_ID } from '../../../content/components'
import { MODULE_BY_ID } from '../../../content/modules'
import { snapshot, useProgress } from '../../../store/progressStore'
import type { InverterModel } from '../../../types/domain'
import { Meter } from '../../../ui/primitives'
import { LAB3D_LESSONS, lessonProgress } from '../logic/lessons'
import { useLab } from '../store/labStore'

/** 3D Lab lessons with live completion criteria; unstudied parts are one click away. */
export function LessonsPanel({ model }: { model: InverterModel }) {
  const p = useProgress(useShallow((s) => snapshot(s)))
  const select = useLab((s) => s.select)
  const mode = useLab((s) => s.mode)
  const lessons = MODULE_BY_ID.lab3d.lessons
  return (
    <ol className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {LAB3D_LESSONS.map((c, i) => {
        const l = lessons.find((x) => x.id === c.lessonId)!
        const { done, total } = lessonProgress(p, c)
        const complete = p.completedLessons.includes(c.lessonId)
        const todo = (c.inspect ?? []).filter((id) => !p.inspectedComponents.includes(id))
        return (
          <li key={c.lessonId} className={`rounded-lg border p-3 ${complete ? 'border-live-400/40 bg-live-400/6' : 'border-chassis-700 bg-chassis-900/60'}`}>
            <div className="flex items-start gap-2">
              <span className={`readout grid h-6 w-6 shrink-0 place-items-center rounded-full border text-[11px] ${complete ? 'border-live-400 text-live-400' : 'border-chassis-600 text-ink-500'}`}>{complete ? '✓' : i + 1}</span>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-medium text-ink-100">{l.title}</h3>
                <p className="mt-0.5 text-xs text-ink-400">{c.summary}</p>
              </div>
            </div>
            <div className="mt-2">
              <Meter value={done / total} tone="live" label={`${l.title} progress`} />
              <div className="readout mt-1 text-[11px] text-ink-500">
                {done}/{total} criteria
              </div>
            </div>
            {!complete && todo.length > 0 && mode === 'explore' && (
              <div className="mt-2 flex flex-wrap gap-1">
                {todo.map((id) => {
                  const part = model.parts.find((x) => x.componentId === id)
                  const name = PANEL_ENTRY_BY_ID[id].name.replace(/\s*\(.*\)/, '')
                  return part ? (
                    <button key={id} type="button" onClick={() => select(part.id, true)} className="min-h-7 rounded border border-chassis-600 px-1.5 text-[11px] text-signal-300 hover:text-ink-100">
                      Study: {name}
                    </button>
                  ) : (
                    <span key={id} className="text-[11px] text-ink-500">
                      {name} (other model)
                    </span>
                  )
                })}
              </div>
            )}
          </li>
        )
      })}
    </ol>
  )
}
