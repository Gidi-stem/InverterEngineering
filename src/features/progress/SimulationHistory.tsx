import { useProgress } from '../../store/progressStore'

const time = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' })

export function SimulationHistory({ limit }: { limit?: number }) {
  const runs = useProgress((s) => s.simulationRuns)
  const shown = limit ? runs.slice(0, limit) : runs
  if (!runs.length)
    return <p className="text-sm text-ink-500">No runs yet. Adjust the output-stage bench on the dashboard and choose “Log this run” to record a simulation.</p>
  return (
    <ul className="divide-y divide-chassis-700">
      {shown.map((r) => (
        <li key={r.id} className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 py-2 text-sm">
          <span className="min-w-0 text-ink-100">{r.label}</span>
          <span className="readout whitespace-nowrap text-xs text-ink-400">
            {r.results.acOutputVrms !== undefined && <>{r.results.acOutputVrms.toFixed(1)} V rms</>}
            {r.results.thd !== undefined && Number.isFinite(r.results.thd) && <> · THD {(r.results.thd * 100).toFixed(1)}%</>}
          </span>
          <span className="w-full text-xs text-ink-500">{time.format(r.at)}</span>
        </li>
      ))}
    </ul>
  )
}
