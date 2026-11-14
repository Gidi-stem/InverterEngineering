import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useShallow } from 'zustand/react/shallow'
import { INVERTER_MODELS } from '../../content/models'
import { snapshot, useProgress } from '../../store/progressStore'
import type { LearnerLevel } from '../../types/progress'
import { SafetyNotice } from '../../ui/primitives'
import { newlySatisfiedLessons } from './logic/lessons'
import { hasWebGL } from './logic/webgl'
import { ComponentInfoPanel } from './panels/ComponentInfoPanel'
import { IdentifyPanel } from './panels/IdentifyPanel'
import { LessonsPanel } from './panels/LessonsPanel'
import { PartsTree } from './panels/PartsTree'
import { ProcedurePanel } from './panels/ProcedurePanel'
import { Toolbar } from './panels/Toolbar'
import { LabCanvas } from './scene/LabCanvas'
import { getModel, useLab, type LabMode } from './store/labStore'

const MODES: { id: LabMode; label: string; hint: string }[] = [
  { id: 'explore', label: 'Explore', hint: 'Rotate, explode, inspect parts' },
  { id: 'identify', label: 'Identify', hint: 'Find components by name or function' },
  { id: 'disassemble', label: 'Disassemble', hint: 'Safe, sequential teardown' },
  { id: 'reassemble', label: 'Reassemble', hint: 'Rebuild in reverse and test' },
]

const LEVELS: { id: LearnerLevel; label: string }[] = [
  { id: 'beginner', label: 'Beginner' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'advanced', label: 'Advanced' },
]

/** Keeps lesson completion in step with studied components and finished activities. */
function useLessonSync() {
  const p = useProgress(useShallow((s) => snapshot(s)))
  const completeLesson = useProgress((s) => s.completeLesson)
  const hydrated = useProgress((s) => s.hydrated)
  useEffect(() => {
    if (!hydrated) return
    for (const id of newlySatisfiedLessons(p)) completeLesson(id)
  }, [p, hydrated, completeLesson])
}

export default function Lab3DPage() {
  const [webgl] = useState(hasWebGL)
  const modelId = useLab((s) => s.modelId)
  const model = useMemo(() => getModel(modelId), [modelId])
  const mode = useLab((s) => s.mode)
  const selectedId = useLab((s) => s.selectedId)
  const message = useLab((s) => s.message)
  const st = useLab.getState()
  const level = useProgress((s) => s.level)
  const setLevel = useProgress((s) => s.setLevel)
  const visit = useProgress((s) => s.visitModule)
  const inspect = useProgress((s) => s.inspectComponent)
  const selected = model.parts.find((p) => p.id === selectedId)

  useEffect(() => {
    visit('lab3d')
  }, [visit])
  useLessonSync()
  useEffect(() => {
    if (mode === 'explore' && selected) inspect(selected.componentId)
  }, [mode, selected, inspect])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !(e.target instanceof HTMLInputElement)) useLab.getState().select(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const side =
    mode === 'explore' ? (
      selected ? (
        <ComponentInfoPanel key={selected.id} model={model} part={selected} />
      ) : (
        <div className="text-sm text-ink-400">
          <h3 className="mb-1 text-sm font-semibold text-ink-100">{model.name}</h3>
          <p>{model.summary}</p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-xs">
            <li>Click any part (or choose it in the parts list) to open its engineering information.</li>
            <li>Drag to rotate, scroll or pinch to zoom, right-drag or two-finger drag to pan.</li>
            <li>Use Explode to separate the assemblies, and Isolate to inspect one board.</li>
            <li>The cover is hidden so you can see inside. Use “Show all” to put it back.</li>
          </ul>
        </div>
      )
    ) : mode === 'identify' ? (
      <IdentifyPanel model={model} />
    ) : (
      <ProcedurePanel model={model} />
    )

  return (
    <div className="mx-auto flex max-w-[1600px] flex-col px-3 py-4 lg:px-5">
      <nav aria-label="Breadcrumb" className="mb-1 text-xs text-ink-500">
        <Link to="/" className="hover:text-ink-300">
          Dashboard
        </Link>{' '}
        / <span className="text-ink-300">3D Inverter Laboratory</span>
      </nav>
      <header className="mb-3 flex flex-wrap items-end gap-x-6 gap-y-3">
        <div className="w-full min-w-0 sm:w-auto">
          <h1 className="text-[24px] font-semibold leading-tight sm:text-[28px]">3D Inverter Laboratory</h1>
          <label className="mt-1 flex min-w-0 items-center gap-2 text-sm text-ink-400">
            Model
            <select value={modelId} onChange={(e) => st.setModel(e.target.value)} className="min-h-9 max-w-full min-w-0 flex-1 rounded-md border border-chassis-600 bg-chassis-900 px-2 text-sm text-ink-100 sm:flex-none">
              {INVERTER_MODELS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name.replace(/\s*\(.*\)/, '')} · {m.ratedPowerW / 1000} kW
                </option>
              ))}
            </select>
          </label>
        </div>
        <div role="radiogroup" aria-label="Learning level" className="flex rounded-md border border-chassis-600 bg-chassis-950 p-0.5">
          {LEVELS.map((l) => (
            <button key={l.id} type="button" role="radio" aria-checked={level === l.id} onClick={() => setLevel(l.id)} className={`min-h-9 rounded px-3 text-xs font-medium ${level === l.id ? 'bg-signal-500 text-white' : 'text-ink-400 hover:text-ink-100'}`}>
              {l.label}
            </button>
          ))}
        </div>
        <div role="tablist" aria-label="Laboratory mode" className="flex flex-wrap gap-1">
          {MODES.map((m) => (
            <button key={m.id} type="button" role="tab" aria-selected={mode === m.id} title={m.hint} onClick={() => st.setMode(m.id)} className={`min-h-10 rounded-md border px-3 text-sm ${mode === m.id ? 'border-signal-400 bg-signal-500/20 text-ink-100' : 'border-chassis-600 bg-chassis-800 text-ink-400 hover:text-ink-100'}`}>
              {m.label}
            </button>
          ))}
        </div>
      </header>

      <div className="grid gap-3 lg:h-[calc(100vh-190px)] lg:min-h-[560px] lg:grid-cols-[210px_minmax(0,1fr)_330px] 2xl:grid-cols-[250px_minmax(0,1fr)_380px]">
        <aside className="panel order-3 max-h-[60vh] overflow-y-auto lg:order-1 lg:max-h-none" aria-label="Parts list">
          <PartsTree model={model} />
        </aside>

        <section className="relative order-1 h-[58vh] min-h-[340px] overflow-hidden rounded-lg border border-chassis-700 lg:order-2 lg:h-auto" aria-label="3D workspace">
          {webgl ? (
            <LabCanvas model={model} />
          ) : (
            <div className="grid h-full place-items-center p-6 text-center text-sm text-ink-400">
              <div>
                <p className="font-medium text-ink-100">3D view unavailable</p>
                <p className="mt-1">This browser or device has WebGL turned off. The parts list, information panels and procedures still work.</p>
              </div>
            </div>
          )}
          {webgl && (
            <div className="pointer-events-none absolute inset-x-2 top-2 flex justify-between gap-2">
              <Toolbar />
            </div>
          )}
          {message && (
            <div
              role="status"
              className={`absolute inset-x-2 bottom-2 flex items-start gap-3 rounded-lg border px-3 py-2 text-sm shadow-lg backdrop-blur sm:inset-x-auto sm:right-3 sm:left-3 ${
                message.tone === 'wrong' ? 'border-danger-400/50 bg-[#2a1216]/95 text-ink-100' : message.tone === 'ok' ? 'border-live-400/50 bg-[#0f2a20]/95 text-ink-100' : message.tone === 'done' ? 'border-signal-400/60 bg-[#121c3a]/95 text-ink-100' : 'border-chassis-600 bg-chassis-950/95 text-ink-100'
              }`}
            >
              <span className="flex-1">{message.text}</span>
              <button type="button" onClick={st.dismissMessage} aria-label="Dismiss message" className="-my-1 grid h-8 w-8 shrink-0 place-items-center rounded text-ink-400 hover:text-ink-100">
                ✕
              </button>
            </div>
          )}
        </section>

        <aside className="panel order-2 max-h-[80vh] overflow-y-auto p-4 lg:order-3 lg:max-h-none" aria-label={mode === 'explore' ? 'Component information' : 'Activity'}>
          {side}
        </aside>
      </div>

      <section className="mt-5" aria-labelledby="lab-lessons">
        <h2 id="lab-lessons" className="mb-2 text-sm font-semibold text-ink-100">
          Lessons in this laboratory
        </h2>
        <LessonsPanel model={model} />
      </section>
      <div className="mt-4">
        <SafetyNotice>
          <strong>Simulated equipment.</strong> Voltages, stored energy and procedures here are modelled. On real inverters, isolate every source, wait the time stated on the nameplate, and verify with a rated meter under qualified supervision.
        </SafetyNotice>
      </div>
    </div>
  )
}
