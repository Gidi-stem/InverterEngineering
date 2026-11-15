import { useMemo, useState } from 'react'
import { SOLAR_FAULTS, faultDesign } from '../../engine/solar/faults'
import { SOLAR_PRESET_BY_ID } from '../../engine/solar/presets'
import { useProgress } from '../../store/progressStore'
import { Button, Panel, Tag } from '../../ui/primitives'

/** Solar troubleshooting: symptoms and engine-generated readings; the learner chooses the diagnosis. */
export default function FaultTab() {
  const [id, setId] = useState(SOLAR_FAULTS[0].id)
  const [choice, setChoice] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const record = useProgress((s) => s.recordActivity)
  const activities = useProgress((s) => s.activities)
  const level = useProgress((s) => s.level)
  const f = SOLAR_FAULTS.find((x) => x.id === id)!
  const d = useMemo(() => faultDesign(f), [f])
  const readings = useMemo(() => f.readings(d), [f, d])
  const solved = (fid: string) => activities.some((a) => a.activityId === `solar:fault:${fid}`)
  const correct = submitted && choice === f.answer
  const submit = () => {
    setSubmitted(true)
    if (choice === f.answer && !solved(f.id)) record({ activityId: `solar:fault:${f.id}`, label: `Solar troubleshooting: ${f.title}`, level })
  }
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.4fr)]">
      <Panel title={`Scenarios (${SOLAR_FAULTS.filter((x) => solved(x.id)).length}/${SOLAR_FAULTS.length} diagnosed)`}>
        <ul className="space-y-1.5" data-testid="fault-list">
          {SOLAR_FAULTS.map((x) => (
            <li key={x.id}>
              <button
                type="button"
                onClick={() => {
                  setId(x.id)
                  setChoice(null)
                  setSubmitted(false)
                }}
                className={`flex min-h-10 w-full items-center justify-between gap-2 rounded-md border px-3 text-left text-sm ${x.id === id ? 'border-signal-400 bg-signal-500/15 text-ink-100' : 'border-chassis-600 bg-chassis-850 text-ink-300 hover:text-ink-100'}`}
                data-testid={`fault-${x.id}`}
              >
                <span>{x.title}</span>
                {solved(x.id) && <Tag tone="live">diagnosed</Tag>}
              </button>
            </li>
          ))}
        </ul>
      </Panel>
      <Panel title={f.title} action={<Tag tone="neutral">{SOLAR_PRESET_BY_ID[f.preset].title}</Tag>}>
        <div className="space-y-3 text-sm" data-testid="fault-detail">
          <p className="text-ink-300">
            <strong className="text-ink-100">Symptom.</strong> {f.symptom}
          </p>
          <p className="text-ink-400">
            <strong className="text-ink-300">Conditions.</strong> {f.conditions}
          </p>
          <table className="w-full text-left text-sm" data-testid="fault-readings">
            <thead className="text-xs text-ink-500">
              <tr>
                <th className="py-1 font-normal">Reading</th>
                <th className="py-1 font-normal">Measured</th>
                <th className="py-1 font-normal">Healthy system</th>
              </tr>
            </thead>
            <tbody>
              {readings.map((r) => (
                <tr key={r.label} className="border-t border-chassis-700">
                  <td className="py-1.5 pr-2 text-ink-300">{r.label}</td>
                  <td className="readout py-1.5 pr-2 text-ink-100">
                    {r.value} {r.unit}
                  </td>
                  <td className="readout py-1.5 text-ink-500">{r.healthy !== undefined ? `${r.healthy} ${r.unit}` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <fieldset className="space-y-1.5">
            <legend className="mb-1 text-xs text-ink-400">Your diagnosis</legend>
            {f.options.map((o, i) => (
              <label key={o} className={`flex min-h-10 cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 ${choice === i ? 'border-signal-400 bg-signal-500/10' : 'border-chassis-600'}`}>
                <input type="radio" name="diag" checked={choice === i} onChange={() => setChoice(i)} className="accent-signal-500" data-testid={`diag-${i}`} />
                <span className="text-ink-300">{o}</span>
              </label>
            ))}
          </fieldset>
          <Button variant="primary" disabled={choice === null} onClick={submit} data-testid="diag-submit">
            Submit diagnosis
          </Button>
          {submitted && (
            <div className={`rounded-md border p-3 ${correct ? 'border-live-400/50 bg-live-400/10' : 'border-danger-400/50 bg-danger-400/10'}`} role="status" data-testid="diag-result" data-correct={correct}>
              <p className={correct ? 'text-live-400' : 'text-danger-400'}>{correct ? 'Correct diagnosis — recorded in your progress.' : 'Not the cause. Look again at which readings differ from a healthy system, and how.'}</p>
              {correct && (
                <>
                  <p className="mt-2 text-ink-300">{f.explain}</p>
                  <p className="mt-2 text-ink-300">
                    <strong className="text-ink-100">Fix.</strong> {f.fix}
                  </p>
                </>
              )}
            </div>
          )}
          <p className="text-xs text-ink-500">All readings are generated by the solar engine from the reference system with the fault applied. On a real system every step starts with safe isolation (F1.M3); PV conductors stay live in daylight.</p>
        </div>
      </Panel>
    </div>
  )
}
