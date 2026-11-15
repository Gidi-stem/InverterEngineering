import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CIRCUIT_EXERCISES, CIRCUIT_EXERCISE_BY_ID } from '../../content/circuitExercises'
import { cloneDoc } from '../../engine/circuit/build'
import { addPart, addWire, deletePart, deleteWire, movePart, reconnectWire, rotatePart, sanitizeDoc, setParam, setState } from '../../engine/circuit/edit'
import { evaluateExercise } from '../../engine/circuit/exercises'
import { PART_DEFS } from '../../engine/circuit/parts'
import { nodeOfTerminal } from '../../engine/circuit/topology'
import type { CircuitDoc, ExerciseResult, PartType, TerminalRef } from '../../engine/circuit/types'
import { analyseCircuit } from '../../engine/circuit/validate'
import { useProgress } from '../../store/progressStore'
import { Button, SafetyNotice } from '../../ui/primitives'
import { modeLabel, nodeVoltageLabels, partVisuals } from './analysis'
import { ChecksPanel } from './ChecksPanel'
import { SANDBOX, useCircuitLab } from './circuitStore'
import { ExercisePanel } from './ExercisePanel'
import { InspectPanel } from './InspectPanel'
import { Toolbox } from './Toolbox'
import { Workspace, type Selection, type WorkspaceApi } from './Workspace'
import { SIM_EXPERIMENTS, SIM_EXPERIMENT_BY_ID } from '../../content/simExperiments'
import { ExperimentPanel } from './sim/ExperimentPanel'
import { Scope } from './sim/Scope'
import { SimBar } from './sim/SimBar'
import { SimPanel } from './sim/SimPanel'
import { defaultScope, scopeFromExperiment } from './sim/defaults'
import { useSimulation, type ScopeSettings } from './sim/useSimulation'
import { BUILD_PROJECTS, BUILD_PROJECT_BY_ID } from '../../content/buildProjects'
import { kitRemaining, placeKitPart, starterDoc } from '../../engine/design/kit'
import { KitToolbox } from '../build/KitToolbox'
import { ProjectPanel } from '../build/ProjectPanel'
import { useProject } from '../build/useProject'

type Tab = 'exercise' | 'simulate' | 'inspect' | 'checks'
const EMPTY: CircuitDoc = { version: 1, parts: [], wires: [] }

/**
 * Circuit Connection Laboratory: toolbox, schematic workspace, inspector, live electrical checks and
 * the ten practical exercises. The circuit is re-analysed (node graph + nodal solution) on every edit.
 */
export default function CircuitLabPage() {
  const [params, setParams] = useSearchParams()
  const exId = params.get('ex')
  const experiment = exId ? (SIM_EXPERIMENT_BY_ID[exId] ?? null) : null
  const project = !experiment && exId ? (BUILD_PROJECT_BY_ID[exId] ?? null) : null
  const exercise = experiment || project ? null : exId && CIRCUIT_EXERCISE_BY_ID[exId] ? CIRCUIT_EXERCISE_BY_ID[exId] : exId === SANDBOX ? null : CIRCUIT_EXERCISES[0]
  const key = experiment?.id ?? project?.id ?? exercise?.id ?? SANDBOX
  const model = useProject(project?.id ?? null)
  const level = useProgress((s) => s.level)
  const projectStarter = useMemo(() => (model ? starterDoc(model.build, level) : null), [model, level])

  const stored = useCircuitLab((s) => s.docs[key])
  const savedAt = useCircuitLab((s) => s.savedAt[key])
  const solutionUsed = useCircuitLab((s) => !!s.solutionUsed[key])
  const canUndo = useCircuitLab((s) => (s.undo[key]?.length ?? 0) > 0)
  const hydrated = useCircuitLab((s) => s.hydrated)
  const commitDoc = useCircuitLab((s) => s.commit)
  const undoLast = useCircuitLab((s) => s.undoLast)
  const restore = useCircuitLab((s) => s.restore)
  const starter = experiment?.circuit ?? projectStarter ?? exercise?.starter ?? EMPTY
  const doc = stored ?? starter

  const completed = useProgress((s) => s.completedExercises)
  const completedProjects = useProgress((s) => s.completedProjects)
  const visit = useProgress((s) => s.visitModule)
  const completeExercise = useProgress((s) => s.completeExercise)
  const completeLesson = useProgress((s) => s.completeLesson)
  const recordAssessment = useProgress((s) => s.recordAssessment)
  const recordActivity = useProgress((s) => s.recordActivity)

  const [selection, setSelection] = useState<Selection>(null)
  const [wireFrom, setWireFrom] = useState<TerminalRef | null>(null)
  const [armed, setArmed] = useState<PartType | null>(null)
  const [armedKit, setArmedKit] = useState<string | null>(null)
  const kitLeft = useMemo(() => (model ? kitRemaining(doc, model.build) : []), [doc, model])
  const armedKitPart = armedKit ? (kitLeft.find((p) => p.id === armedKit) ?? null) : null
  // Panel tab and Build/Simulate mode belong to the workspace: opening another circuit starts from its defaults.
  const [tabState, setTabState] = useState<{ key: string; tab: Tab }>({ key, tab: 'exercise' })
  const tab = tabState.key === key ? tabState.tab : 'exercise'
  const setTab = (t: Tab) => setTabState({ key, tab: t })
  const [modeState, setModeState] = useState<{ key: string; mode: 'build' | 'simulate' }>({ key, mode: experiment ? 'simulate' : 'build' })
  const mode = modeState.key === key ? modeState.mode : experiment ? 'simulate' : 'build'
  const setMode = (m: 'build' | 'simulate') => setModeState({ key, mode: m })
  const [scope, setScope] = useState<{ key: string; s: ScopeSettings }>(() => ({ key, s: experiment ? scopeFromExperiment(experiment) : defaultScope(doc) }))
  const scopeSettings = scope.key === key ? scope.s : experiment ? scopeFromExperiment(experiment) : defaultScope(doc)
  const setScopeSettings = (s: ScopeSettings) => setScope({ key, s })
  const [speed, setSpeed] = useState(5)
  const [stepSize, setStepSize] = useState<'1' | '10' | 'div'>('div')
  const [timeStep, setTimeStep] = useState<number | undefined>(undefined)
  const [spectrumOn, setSpectrumOn] = useState(false)
  const sim = useSimulation(key, doc, scopeSettings, speed, timeStep)
  const activities = useProgress((s) => s.activities)
  const experimentDone = (id: string) => activities.some((a) => a.activityId === `sim:${id}`)
  const [focus, setFocus] = useState<string[] | null>(null)
  const [focusNode, setFocusNode] = useState<number | null>(null)
  const [showV, setShowV] = useState(true)
  const [notice, setNotice] = useState<{ text: string; tone: 'info' | 'error' | 'ok' } | null>(null)
  const [confirmReset, setConfirmReset] = useState(false)
  const [check, setCheck] = useState<{ key: string; json: string; result: ExerciseResult } | null>(null)
  const api = useRef<WorkspaceApi | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const noticeTimer = useRef<number | undefined>(undefined)

  useEffect(() => {
    visit('circuit-lab')
  }, [visit])



  const analysis = useMemo(() => analyseCircuit(doc), [doc])
  const visual = useMemo(() => partVisuals(doc, analysis), [doc, analysis])
  const labels = useMemo(() => (showV ? nodeVoltageLabels(doc, analysis) : null), [doc, analysis, showV])
  const danger = useMemo(() => new Set(analysis.issues.filter((i) => i.severity === 'danger').flatMap((i) => i.parts)), [analysis])
  const highlight = useMemo(() => new Set(focus ?? []), [focus])
  const hazardous = analysis.issues.some((i) => i.kind === 'hazardous-voltage')
  const counts = { danger: 0, warning: 0, info: 0 }
  for (const i of analysis.issues) counts[i.severity]++

  const selectedWire = selection?.kind === 'wire' ? doc.wires.find((w) => w.id === selection.id) : undefined
  const activeNode = focusNode ?? (selectedWire ? nodeOfTerminal(analysis.topo, selectedWire.a.partId, selectedWire.a.terminalId) : null)
  const nodeTerminals = useMemo(() => {
    if (activeNode === null) return new Set<string>()
    return new Set((analysis.topo.nodes[activeNode]?.terminals ?? []).map((t) => `${t.partId}:${t.terminalId}`))
  }, [analysis, activeNode])

  const flash = useCallback((text: string, tone: 'info' | 'error' | 'ok' = 'info') => {
    setNotice({ text, tone })
    window.clearTimeout(noticeTimer.current)
    noticeTimer.current = window.setTimeout(() => setNotice(null), 3500)
  }, [])

  const commit = useCallback((next: CircuitDoc) => commitDoc(key, next), [commitDoc, key])

  const place = useCallback(
    (type: PartType, x: number, y: number) => {
      const r = addPart(doc, type, x, y)
      commit(r.doc)
      setSelection({ kind: 'part', id: r.id })
      setArmed(null)
      setTabState({ key, tab: 'inspect' })
    },
    [doc, commit, key],
  )

  const wire = (a: TerminalRef, b: TerminalRef) => {
    const r = addWire(doc, a, b)
    if (r.error) flash(r.error, 'error')
    else {
      commit(r.doc)
      setSelection({ kind: 'wire', id: r.id! })
    }
  }

  const removeSelected = useCallback(() => {
    if (selection?.kind === 'part') commit(deletePart(doc, selection.id))
    else if (selection?.kind === 'wire') commit(deleteWire(doc, selection.id))
    else return
    setSelection(null)
  }, [selection, doc, commit])

  const rotateSelected = useCallback(() => {
    if (selection?.kind === 'part') commit(rotatePart(doc, selection.id))
  }, [selection, doc, commit])

  const undo = useCallback(() => {
    undoLast(key)
    setSelection(null)
  }, [undoLast, key])

  // Keyboard shortcuts (ignored while typing in a field).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement
      if (t.closest('input, textarea, select')) return
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        undo()
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selection) {
          e.preventDefault()
          removeSelected()
        }
      } else if (e.key.toLowerCase() === 'r' && !e.ctrlKey && !e.metaKey) rotateSelected()
      else if (e.key === 'Escape') {
        setArmed(null)
        setArmedKit(null)
        setWireFrom(null)
        setSelection(null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [undo, removeSelected, rotateSelected, selection])

  // Fit the view when switching workspace or once the saved circuit has loaded.
  useEffect(() => {
    const id = requestAnimationFrame(() => api.current?.fit())
    return () => cancelAnimationFrame(id)
  }, [key, hydrated])

  // Browser test hook (read-mostly): the regression scripts inspect and load circuits through this.
  useEffect(() => {
    const w = window as unknown as { __circuitLab?: unknown }
    w.__circuitLab = {
      key,
      doc,
      issues: analysis.issues.map((i) => ({ kind: i.kind, severity: i.severity, parts: i.parts })),
      load: (d: unknown) => {
        const s = sanitizeDoc(d)
        if (s) restore(key, s)
        return !!s
      },
    }
    return () => {
      delete w.__circuitLab
    }
  }, [key, doc, analysis, restore])

  const switchExercise = (id: string) => {
    setParams({ ex: id })
    setSelection(null)
    setWireFrom(null)
    setArmed(null)
    setArmedKit(null)
    setTab('exercise')
    setConfirmReset(false)
  }

  const runCheck = () => {
    if (!exercise) return
    const result = evaluateExercise(exercise.id, doc)
    setCheck({ key, json: JSON.stringify(doc), result })
    if (result.passed && !solutionUsed) {
      const first = !completed.includes(exercise.id)
      completeExercise(exercise.id)
      if (first) recordActivity({ activityId: `circuit:${exercise.id}`, label: `Circuit Lab: ${exercise.title}`, level, score: result.score, maxScore: result.maxScore })
      if (exercise.id === 'ckt-09') {
        completeLesson('asm-03')
        recordAssessment('asm-03', result.score, result.maxScore)
      }
      flash(first ? 'Exercise complete: recorded in your progress.' : 'Exercise passed again.', 'ok')
    }
  }

  const exportDoc = () => {
    const blob = new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `circuit-${key}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }
  const importDoc = async (f: File) => {
    try {
      const d = sanitizeDoc(JSON.parse(await f.text()))
      if (!d) throw new Error('not a circuit')
      restore(key, d)
      setSelection(null)
      requestAnimationFrame(() => api.current?.fit())
      flash(`Loaded ${d.parts.length} parts and ${d.wires.length} wires.`, 'ok')
    } catch {
      flash('That file is not a circuit saved from this laboratory.', 'error')
    }
  }

  const result = check && check.key === key ? check.result : null
  const stale = !!check && check.key === key && check.json !== JSON.stringify(doc)
  const hint = armedKitPart
    ? `Tap the workspace to place ${armedKitPart.id}. Esc cancels.`
    : armed
    ? `Tap the workspace to place a ${PART_DEFS[armed].name.toLowerCase()}. Esc cancels.`
    : wireFrom
      ? 'Tap another terminal to finish the wire. Tap empty space or press Esc to cancel.'
      : 'Drag parts to move · drag from a terminal (or tap two terminals) to wire · tap a selected switch to toggle it · scroll or pinch to zoom'

  return (
    <div className="mx-auto flex max-w-[1680px] flex-col px-3 py-4 lg:px-5">
      <nav aria-label="Breadcrumb" className="mb-1 text-xs text-ink-500">
        <Link to="/" className="hover:text-ink-300">
          Dashboard
        </Link>{' '}
        / <span className="text-ink-300">Circuit Connection Laboratory</span>
      </nav>
      <header className="mb-3 flex flex-wrap items-end gap-x-6 gap-y-2">
        <div className="min-w-0">
          <h1 className="text-[24px] leading-tight font-semibold sm:text-[28px]">Circuit Connection Laboratory</h1>
          <p className="text-sm text-ink-400">Wire real circuit topologies on a virtual bench. Every check is calculated from the connection graph and a nodal solution of the circuit.</p>
        </div>
        <label className="flex items-center gap-2 text-sm text-ink-400">
          Exercise
          <select
            value={key}
            onChange={(e) => switchExercise(e.target.value)}
            data-testid="exercise-select"
            className="min-h-10 max-w-[78vw] rounded-md border border-chassis-600 bg-chassis-900 px-2 text-sm text-ink-100"
          >
            <optgroup label="Circuit exercises">
            {CIRCUIT_EXERCISES.map((e, i) => (
              <option key={e.id} value={e.id}>
                {i + 1}. {e.title}
                {completed.includes(e.id) ? ' ✓' : ''}
              </option>
            ))}
            </optgroup>
            <optgroup label="Simulation experiments">
              {SIM_EXPERIMENTS.map((e, i) => (
                <option key={e.id} value={e.id}>
                  E{i + 1}. {e.title}
                  {experimentDone(e.id) ? ' ✓' : ''}
                </option>
              ))}
            </optgroup>
            <optgroup label="Construction projects">
              {BUILD_PROJECTS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.letter}. {p.title}
                  {completedProjects.includes(p.id) ? ' ✓' : ''}
                </option>
              ))}
            </optgroup>
            <option value={SANDBOX}>Free build (sandbox)</option>
          </select>
        </label>
      </header>

      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_320px] xl:h-[calc(100vh-170px)] xl:min-h-[600px] xl:grid-cols-[200px_minmax(0,1fr)_360px]">
        <aside className="panel h-[128px] overflow-hidden md:col-span-2 xl:col-span-1 xl:h-auto" aria-label="Parts toolbox">
          {model ? (
            <KitToolbox
              remaining={kitLeft}
              total={model.build.doc.parts.length}
              armed={armedKit}
              onArm={(id) => {
                setArmedKit(id)
                setArmed(null)
                setWireFrom(null)
              }}
              onDrop={(part, cx, cy) => {
                const g = api.current?.clientToGrid(cx, cy)
                if (!g) return false
                commit(placeKitPart(doc, part, g[0], g[1]))
                setSelection({ kind: 'part', id: part.id })
                return true
              }}
            />
          ) : (
          <Toolbox
            suggested={exercise?.toolbox ?? null}
            armed={armed}
            onArm={(t) => {
              setArmed(t)
              setWireFrom(null)
            }}
            onDrop={(t, cx, cy) => {
              const g = api.current?.clientToGrid(cx, cy)
              if (!g) return false
              place(t, Math.round(g[0]), Math.round(g[1]))
              return true
            }}
          />
          )}
        </aside>

        <section className="panel relative flex h-[62vh] min-h-[380px] flex-col overflow-hidden xl:h-auto" aria-label="Circuit workspace">
          <div className="flex items-center gap-0.5 overflow-x-auto border-b border-chassis-700 px-1.5 py-1 [&_button]:min-h-9 [&_button]:shrink-0 [&_button]:px-2.5">
            <div role="tablist" aria-label="Laboratory mode" className="mr-1 flex shrink-0 rounded-md border border-chassis-600 p-0.5">
              {(['build', 'simulate'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  role="tab"
                  aria-selected={mode === m}
                  data-testid={`mode-${m}`}
                  onClick={() => {
                    setMode(m)
                    if (m === 'simulate') setTab(experiment ? 'exercise' : 'simulate')
                  }}
                  className={`min-h-8 rounded px-2.5 text-xs font-medium ${mode === m ? 'bg-signal-500 text-white' : 'text-ink-300 hover:text-ink-100'}`}
                >
                  {m === 'build' ? 'Build' : 'Simulate'}
                </button>
              ))}
            </div>
            <Button variant="ghost" onClick={rotateSelected} disabled={selection?.kind !== 'part'} title="Rotate 90° (R)" data-testid="btn-rotate">
              Rotate
            </Button>
            <Button variant="ghost" onClick={removeSelected} disabled={!selection} title="Delete (Del)" data-testid="btn-delete">
              Delete
            </Button>
            <Button variant="ghost" onClick={undo} disabled={!canUndo} title="Undo (Ctrl+Z)" data-testid="btn-undo">
              Undo
            </Button>
            <span className="mx-1 h-6 w-px bg-chassis-700" aria-hidden="true" />
            <Button variant="ghost" onClick={() => api.current?.zoom(1.25)} aria-label="Zoom in">
              +
            </Button>
            <Button variant="ghost" onClick={() => api.current?.zoom(0.8)} aria-label="Zoom out">
              −
            </Button>
            <Button variant="ghost" onClick={() => api.current?.fit()}>
              Fit
            </Button>
            <label className="ml-1 flex min-h-9 shrink-0 items-center gap-1.5 px-1 text-xs whitespace-nowrap text-ink-300">
              <input type="checkbox" checked={showV} onChange={(e) => setShowV(e.target.checked)} className="accent-signal-500" />
              Voltages
            </label>
            <div className="ml-auto flex shrink-0 items-center gap-0.5">
              <Button variant="ghost" onClick={exportDoc} title="Download this circuit as a file">
                Export
              </Button>
              <Button variant="ghost" onClick={() => fileRef.current?.click()} title="Load a circuit file">
                Import
              </Button>
              <input
                ref={fileRef}
                type="file"
                accept="application/json,.json"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) void importDoc(f)
                  e.target.value = ''
                }}
              />
              {confirmReset ? (
                <>
                  <Button
                    variant="danger"
                    data-testid="btn-reset-confirm"
                    onClick={() => {
                      restore(key, cloneDoc(starter))
                      setSelection(null)
                      setConfirmReset(false)
                      setCheck(null)
                    }}
                  >
                    Confirm reset
                  </Button>
                  <Button variant="ghost" onClick={() => setConfirmReset(false)}>
                    Cancel
                  </Button>
                </>
              ) : (
                <Button variant="ghost" onClick={() => setConfirmReset(true)} data-testid="btn-reset">
                  Reset
                </Button>
              )}
            </div>
          </div>

          <div className="relative min-h-0 flex-1 bg-chassis-950">
            <Workspace
              doc={doc}
              selection={selection}
              wireFrom={wireFrom}
              armed={armedKitPart?.type ?? armed}
              zones={model?.build.zones}
              visual={visual}
              highlight={highlight}
              danger={danger}
              nodeLabels={labels}
              nodeTerminals={nodeTerminals}
              apiRef={api}
              onSelect={(s) => {
                setSelection(s)
                setFocusNode(null)
                if (s) setTab('inspect')
              }}
              onMove={(id, x, y) => commit(movePart(doc, id, x, y))}
              onTap={(id) => {
                const p = doc.parts.find((x) => x.id === id)
                const st = p && PART_DEFS[p.type].states?.[0]
                if (!p || !st) return
                const cur = p.states[st.key] ?? st.default
                const next = st.options[(st.options.findIndex((o) => o.value === cur) + 1) % st.options.length]
                commit(setState(doc, id, st.key, next.value))
              }}
              onWire={wire}
              onWireFrom={setWireFrom}
              onReconnect={(id, end, to) => {
                const r = reconnectWire(doc, id, end, to)
                if (r.error) flash(r.error, 'error')
                else commit(r.doc)
              }}
              onPlace={(x, y) => {
                if (armedKitPart) {
                  commit(placeKitPart(doc, armedKitPart, x, y))
                  setSelection({ kind: 'part', id: armedKitPart.id })
                  setArmedKit(null)
                } else if (armed) place(armed, x, y)
              }}
            />
            {hazardous && (
              <div className="pointer-events-none absolute inset-x-2 top-2">
                <SafetyNotice tone="danger">
                  <strong>Simulated only.</strong> This circuit contains hazardous voltage (above 50 V DC or 25 V AC). Never build it as a practical exercise.
                </SafetyNotice>
              </div>
            )}
            {notice && (
              <div
                role="status"
                className={`absolute right-3 bottom-3 left-3 rounded-md border px-3 py-2 text-sm shadow-lg sm:left-auto sm:max-w-sm ${
                  notice.tone === 'error' ? 'border-danger-400/50 bg-[#2a1216]/95 text-ink-100' : notice.tone === 'ok' ? 'border-live-400/50 bg-[#0f2a20]/95 text-ink-100' : 'border-chassis-600 bg-chassis-900/95 text-ink-100'
                }`}
              >
                {notice.text}
              </div>
            )}
          </div>

          {mode === 'simulate' && (
            <div className="flex h-[300px] shrink-0 flex-col border-t border-chassis-700 xl:h-[46%]" data-testid="sim-area">
              <SimBar
                state={sim.state}
                onRun={sim.run}
                onPause={sim.pause}
                onStop={sim.stop}
                onReset={sim.reset}
                onStep={() => sim.step(stepSize === 'div' ? Math.max(1, Math.round(scopeSettings.timeDiv / (sim.h ?? 1e-5))) : Number(stepSize))}
                stepSize={stepSize}
                onStepSize={setStepSize}
                speed={speed}
                onSpeed={setSpeed}
                settings={scopeSettings}
                onSettings={setScopeSettings}
                spectrum={spectrumOn}
                onSpectrum={setSpectrumOn}
              />
              <div className="relative min-h-0 flex-1">
                <Scope frame={sim.frame} settings={scopeSettings} showSpectrum={spectrumOn} />
                {sim.notice && (
                  <button type="button" onClick={sim.dismissNotice} className="absolute top-6 right-2 left-2 rounded border border-caution-400/50 bg-chassis-950/95 px-2 py-1 text-left text-xs text-caution-400">
                    {sim.notice} ✕
                  </button>
                )}
                {sim.error && <div className="absolute inset-x-2 bottom-6 rounded border border-danger-400/60 bg-[#2a1216]/95 px-2 py-1 text-xs text-ink-100" data-testid="sim-error">{sim.error}</div>}
              </div>
            </div>
          )}

          <footer className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-chassis-700 px-3 py-1.5 text-[11px] text-ink-400" data-testid="status-bar">
            <span>
              {doc.parts.length} parts · {doc.wires.length} wires · {analysis.topo.nodes.length} nodes
            </span>
            {analysis.solutions.length > 0 && <span>Solved: {analysis.solutions.map(modeLabel).join(', ')}</span>}
            <button type="button" className="flex gap-2" onClick={() => setTab('checks')} data-testid="status-issues">
              <span className={counts.danger ? 'text-danger-400' : ''}>{counts.danger} danger</span>
              <span className={counts.warning ? 'text-caution-400' : ''}>{counts.warning} {counts.warning === 1 ? 'warning' : 'warnings'}</span>
            </button>
            {savedAt && <span title="Circuits are saved automatically in this browser">Saved {new Date(savedAt).toLocaleTimeString()}</span>}
            <span className="hidden text-ink-500 lg:inline">{hint}</span>
          </footer>
        </section>

        <aside className="panel flex max-h-[85vh] min-h-[380px] flex-col md:h-[62vh] md:max-h-none xl:h-auto" aria-label="Exercise, inspector and checks">
          <div role="tablist" aria-label="Side panel" className="flex border-b border-chassis-700">
            {(
              [
                ['exercise', experiment ? 'Experiment' : project ? 'Project' : exercise ? 'Exercise' : 'Free build'],
                ['simulate', 'Simulate'],
                ['inspect', 'Inspect'],
                ['checks', `Checks${counts.danger + counts.warning ? ` (${counts.danger + counts.warning})` : ''}`],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={tab === id}
                data-testid={`tab-${id}`}
                onClick={() => setTab(id)}
                className={`min-h-11 flex-1 border-b-2 px-2 text-sm font-medium ${tab === id ? 'border-signal-400 text-ink-100' : 'border-transparent text-ink-400 hover:text-ink-100'} ${id === 'checks' && counts.danger ? 'text-danger-400' : ''}`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            {tab === 'simulate' && (
              <SimPanel
                doc={doc}
                state={sim.state}
                frame={sim.frame}
                probes={sim.probes}
                h={sim.h}
                computeMs={sim.computeMs}
                error={sim.error}
                settings={scopeSettings}
                onSettings={setScopeSettings}
                timeStep={timeStep}
                onTimeStep={setTimeStep}
                onParam={(id, k, v) => commit(setParam(doc, id, k, v))}
                onState={(id, k, v) => commit(setState(doc, id, k, v))}
                runAc={sim.runAc}
              />
            )}
            {tab === 'exercise' && experiment && (
              <ExperimentPanel
                key={experiment.id}
                experiment={experiment}
                doc={doc}
                completed={experimentDone(experiment.id)}
                onMeasure={() => sim.runExperiment(experiment.id, doc)}
                onRestore={() => {
                  restore(key, cloneDoc(experiment.circuit))
                  setScopeSettings(scopeFromExperiment(experiment))
                  sim.clear()
                }}
                onComplete={(score, max) => {
                  if (!experimentDone(experiment.id)) recordActivity({ activityId: `sim:${experiment.id}`, label: `Simulation experiment: ${experiment.title}`, level, score, maxScore: max })
                  flash('Experiment complete: recorded in your progress.', 'ok')
                }}
              />
            )}
            {tab === 'exercise' && model && (
              <ProjectPanel model={model} doc={doc} level={level} dangerCount={counts.danger} onCommit={commit} onFocus={setFocus} flash={flash} />
            )}
            {tab === 'exercise' && !experiment && !model && (
              <ExercisePanel
                exercise={exercise}
                result={result}
                stale={stale}
                completed={!!exercise && completed.includes(exercise.id)}
                solutionUsed={solutionUsed}
                onCheck={runCheck}
                onLoadSolution={() => {
                  if (!exercise) return
                  restore(key, cloneDoc(exercise.reference), { solution: true })
                  setSelection(null)
                  requestAnimationFrame(() => api.current?.fit())
                  flash('Worked solution loaded. Study it, then reset and build it yourself for credit.', 'info')
                }}
              />
            )}
            {tab === 'inspect' && (
              <InspectPanel
                doc={doc}
                analysis={analysis}
                selection={selection}
                onParam={(id, k, v) => commit(setParam(doc, id, k, v))}
                onState={(id, k, v) => commit(setState(doc, id, k, v))}
                onRotate={(id) => commit(rotatePart(doc, id))}
                onDelete={(id) => {
                  commit(deletePart(doc, id))
                  setSelection(null)
                }}
                onDeleteWire={(id) => {
                  commit(deleteWire(doc, id))
                  setSelection(null)
                }}
                onSelectNode={setFocusNode}
              />
            )}
            {tab === 'checks' && (
              <ChecksPanel
                doc={doc}
                analysis={analysis}
                onFocus={setFocus}
                onSelectPart={(id) => {
                  setSelection({ kind: 'part', id })
                  setTab('inspect')
                }}
              />
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
