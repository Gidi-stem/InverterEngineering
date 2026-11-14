import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useShallow } from 'zustand/react/shallow'
import { BADGES } from '../../content/badges'
import { MODULES, PATHWAY } from '../../content/modules'
import { snapshot, useProgress } from '../../store/progressStore'
import { moduleCompletion, summarise } from '../../store/selectors'
import { Button, Meter, Panel } from '../../ui/primitives'
import { SimulationHistory } from './SimulationHistory'

export function ProgressPage() {
  const data = useProgress(useShallow((s) => snapshot(s)))
  const { visitModule, importProgress, resetProgress, clearSimulationHistory, hydrated } = useProgress(
    useShallow((s) => ({ visitModule: s.visitModule, importProgress: s.importProgress, resetProgress: s.resetProgress, clearSimulationHistory: s.clearSimulationHistory, hydrated: s.hydrated })),
  )
  useEffect(() => {
    visitModule('progress')
  }, [visitModule])
  const [msg, setMsg] = useState<{ tone: 'ok' | 'err'; text: string } | null>(null)
  const [confirmReset, setConfirmReset] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const s = summarise(data)
  const json = () => JSON.stringify(data, null, 2)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(json())
      setMsg({ tone: 'ok', text: 'Backup copied to the clipboard. Paste it into a .json file to keep it.' })
    } catch {
      setMsg({ tone: 'err', text: 'Clipboard access was refused by the browser. Use “Download backup” instead.' })
    }
  }
  const download = () => {
    const url = URL.createObjectURL(new Blob([json()], { type: 'application/json' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `inverter-lab-progress-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    setMsg({ tone: 'ok', text: 'Download started. If nothing downloaded, this viewer blocks downloads; use “Copy backup”.' })
  }
  const onFile = async (f: File | undefined) => {
    if (!f) return
    try {
      const r = importProgress(JSON.parse(await f.text()))
      setMsg(r.ok ? { tone: 'ok', text: `Progress restored from ${f.name}.` } : { tone: 'err', text: r.error })
    } catch {
      setMsg({ tone: 'err', text: 'That file is not valid JSON.' })
    }
    if (fileRef.current) fileRef.current.value = ''
  }

  const rows: [string, string][] = [
    ['Lessons completed', `${s.lessons.done} / ${s.lessons.total}`],
    ['Practical exercises', `${s.exercises.done} / ${s.exercises.total}`],
    ['Engineering projects', `${s.projects.done} / ${s.projects.total}`],
    ['Components identified', `${s.components.done} / ${s.components.total}`],
    ['Assessments attempted', `${s.assessments.taken} / ${s.assessments.total}`],
    ['Assessment average (best attempts)', s.assessments.averagePct === null ? '—' : `${s.assessments.averagePct.toFixed(1)} %`],
    ['Diagnoses submitted', String(s.troubleshooting.attempts)],
    ['Troubleshooting success rate', s.troubleshooting.ratePct === null ? '—' : `${s.troubleshooting.ratePct.toFixed(1)} %`],
    ['Simulation runs logged', String(s.simulations)],
    ['Badges earned', `${s.badges.earned} / ${s.badges.total}`],
    ['Sections opened', `${Object.keys(data.moduleVisits).length} / ${MODULES.length}`],
  ]

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-6 lg:px-6">
      <h1 className="text-[26px] font-semibold leading-tight sm:text-[32px]">Student Progress</h1>
      <p className="mt-1 text-ink-400">
        Records are stored in this browser (IndexedDB){hydrated ? '' : ' — loading…'}. Back them up before changing device or clearing browser data.
      </p>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Panel title={`Summary · overall ${s.overallPct.toFixed(1)} %`}>
          <table className="w-full text-sm">
            <tbody className="divide-y divide-chassis-700">
              {rows.map(([k, v]) => (
                <tr key={k}>
                  <th scope="row" className="py-2 pr-3 text-left font-normal text-ink-400">
                    {k}
                  </th>
                  <td className="readout py-2 text-right text-ink-100">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-xs text-ink-500">Overall weighting: lessons 35 %, exercises 15 %, projects 15 %, assessments 15 %, component identification 10 %, troubleshooting 10 %.</p>
        </Panel>

        <Panel title="Module completion">
          <ul className="flex flex-col gap-3">
            {PATHWAY.map((m) => {
              const c = moduleCompletion(data, m.lessons.map((l) => l.id))
              return (
                <li key={m.id}>
                  <div className="mb-1 flex justify-between text-sm">
                    <Link to={m.path} className="text-ink-300 hover:text-ink-100">
                      {m.title}
                    </Link>
                    <span className="readout text-xs text-ink-500">{Math.round(c * 100)}%</span>
                  </div>
                  <Meter value={c} tone="live" label={`${m.title} completion`} />
                </li>
              )
            })}
          </ul>
        </Panel>

        <Panel title="Simulation history" action={data.simulationRuns.length > 0 && <Button variant="ghost" onClick={clearSimulationHistory}>Clear history</Button>}>
          <SimulationHistory />
        </Panel>

        <div className="flex flex-col gap-5">
          <Panel title="Badges">
            <ul className="flex flex-col gap-1.5 text-sm">
              {BADGES.map((b) => (
                <li key={b.id} className="flex justify-between gap-3">
                  <span className={b.earned(data) ? 'text-live-400' : 'text-ink-400'}>{b.title}</span>
                  <span className="text-right text-xs text-ink-500">{b.earned(data) ? 'Earned' : b.availableFromPhase ? `${b.description} (Phase ${b.availableFromPhase})` : b.description}</span>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Backup, restore and reset">
            <div className="flex flex-wrap gap-2">
              <Button onClick={copy}>Copy backup</Button>
              <Button onClick={download}>Download backup</Button>
              <Button onClick={() => fileRef.current?.click()}>Restore from file…</Button>
              <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
            </div>
            <div className="mt-4 border-t border-chassis-700 pt-4">
              {confirmReset ? (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-danger-400">Erase all progress in this browser?</span>
                  <Button
                    variant="danger"
                    onClick={() => {
                      resetProgress()
                      setConfirmReset(false)
                      setMsg({ tone: 'ok', text: 'All progress has been reset.' })
                    }}
                  >
                    Yes, erase
                  </Button>
                  <Button variant="ghost" onClick={() => setConfirmReset(false)}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button variant="danger" onClick={() => setConfirmReset(true)}>
                  Reset all progress
                </Button>
              )}
            </div>
            {msg && (
              <p role="status" className={`mt-3 text-sm ${msg.tone === 'ok' ? 'text-live-400' : 'text-danger-400'}`}>
                {msg.text}
              </p>
            )}
          </Panel>
        </div>
      </div>
    </div>
  )
}
