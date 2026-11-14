import { useState } from 'react'
import { useProgress } from '../../../store/progressStore'
import type { InverterModel } from '../../../types/domain'
import { Button, Meter } from '../../../ui/primitives'
import { canInstall, canRemove, currentInstallStage, currentRemovalStage, installableNow, removableNow } from '../logic/procedure'
import { useLab } from '../store/labStore'
import { DischargeSimulator } from './DischargeSimulator'

const ISOLATION_STEPS: Record<string, string[]> = {
  lf3k: ['PV DC breaker switched OFF', 'Both PV connectors unplugged', 'Battery cables disconnected (negative first)', 'AC output wiring disconnected', 'Isolation points locked off and tagged'],
  default: ['Battery cables disconnected', 'AC output wiring disconnected', 'Isolation point tagged'],
}
const RECONNECT_STEPS = ['Protective-earth continuity < 0.1 Ω to chassis, heat sink and cover', 'Insulation resistance check passed', 'Cover fitted with earth strap', 'Battery reconnected (correct polarity, torqued)', 'AC output reconnected', 'Power-on test: correct output voltage and frequency, no fault codes']

function Checklist({ items, onDone, doneLabel }: { items: string[]; onDone: () => void; doneLabel: string }) {
  const [ticked, setTicked] = useState<string[]>([])
  const all = ticked.length === items.length
  return (
    <div className="flex flex-col gap-1.5">
      {items.map((i) => (
        <label key={i} className="flex min-h-9 cursor-pointer items-center gap-2 rounded-md border border-chassis-700 bg-chassis-900/60 px-2.5 text-sm text-ink-300">
          <input type="checkbox" checked={ticked.includes(i)} onChange={() => setTicked((t) => (t.includes(i) ? t.filter((x) => x !== i) : [...t, i]))} className="h-4 w-4 accent-signal-500" />
          {i}
        </label>
      ))}
      <Button variant="primary" onClick={onDone} disabled={!all} className="mt-1">
        {doneLabel}
      </Button>
    </div>
  )
}

export function ProcedurePanel({ model }: { model: InverterModel }) {
  const level = useProgress((s) => s.level)
  const mode = useLab((s) => s.mode)
  const removed = useLab((s) => s.removed)
  const actionsDone = useLab((s) => s.actionsDone)
  const checkpoint = useLab((s) => s.checkpoint)
  const done = useLab((s) => s.disassemblyDone)
  const hintsUsed = useLab((s) => s.hintsUsed)
  const showHint = useLab((s) => s.showHint)
  const st = useLab.getState()

  if (mode === 'disassemble') {
    const cur = currentRemovalStage(model, removed, actionsDone)
    const stage = model.procedure[cur]
    const cp = checkpoint ? model.procedure.find((x) => x.id === checkpoint)?.checkpoint : undefined
    const next = removableNow(model, removed, actionsDone)
    return (
      <div className="flex flex-col gap-4">
        <div>
          <div className="mb-1 flex justify-between text-xs text-ink-400">
            <span>Disassembly</span>
            <span className="readout">
              step {Math.min(cur + 1, model.procedure.length)} / {model.procedure.length}
            </span>
          </div>
          <Meter value={cur / model.procedure.length} tone="live" label="Disassembly progress" />
        </div>

        {cp ? (
          <section className="rounded-lg border border-signal-500/40 bg-signal-500/10 p-3">
            <h3 className="text-xs font-semibold text-signal-300">Checkpoint question</h3>
            <p className="mt-1 text-sm text-ink-100">{cp.prompt}</p>
            <div className="mt-2 flex flex-col gap-1.5">
              {cp.options.map((o, i) => (
                <button key={o} type="button" onClick={() => st.answerCheckpoint(i)} className="min-h-10 rounded-md border border-chassis-600 bg-chassis-900 px-3 text-left text-sm text-ink-300 hover:border-signal-400 hover:text-ink-100">
                  {o}
                </button>
              ))}
            </div>
          </section>
        ) : done || !stage ? (
          <section className="rounded-lg border border-live-400/40 bg-live-400/8 p-3 text-sm text-ink-100">
            <p>The inverter is fully dismantled.</p>
            <Button variant="primary" className="mt-2" onClick={() => st.setMode('reassemble')}>
              Start reassembly
            </Button>
          </section>
        ) : (
          <section className="rounded-lg border border-chassis-700 bg-chassis-900/60 p-3">
            <h3 className="text-sm font-semibold text-ink-100">
              {cur + 1}. {stage.title}
            </h3>
            <p className="mt-1 text-sm text-ink-300">{stage.instruction}</p>
            <p className="mt-2 text-xs text-ink-400">
              <span className="font-semibold text-ink-300">Why now: </span>
              {stage.why}
            </p>
            {stage.action && !actionsDone.includes(stage.id) && (
              <div className="mt-3">
                {stage.action === 'isolate' && <Checklist items={ISOLATION_STEPS[model.id] ?? ISOLATION_STEPS.default} onDone={() => st.completeAction(stage.id)} doneLabel="Confirm: all sources isolated" />}
                {stage.action === 'discharge' && <DischargeSimulator bank={model.dischargeBank} onVerified={() => st.completeAction(stage.id)} />}
              </div>
            )}
            {(!stage.action || actionsDone.includes(stage.id)) && stage.partIds.length > 0 && (
              <>
                <p className="mt-3 text-xs text-ink-400">{level === 'beginner' ? 'Parts outlined in green can come out now. Click them in 3D or below.' : 'Click the parts to remove in 3D, or use the list below.'}</p>
                <ul className="mt-1.5 flex flex-col gap-1">
                  {stage.partIds.map((id) => {
                    const p = model.parts.find((x) => x.id === id)!
                    const isOut = removed.includes(id)
                    const ok = canRemove(model, removed, actionsDone, id).ok
                    const highlight = (level === 'beginner' || showHint) && ok
                    return (
                      <li key={id}>
                        <button type="button" disabled={isOut} onClick={() => st.clickPart(id)} className={`flex min-h-9 w-full items-center gap-2 rounded-md border px-2.5 text-left text-sm ${isOut ? 'border-transparent text-ink-500 line-through' : highlight ? 'border-live-400/50 bg-live-400/8 text-ink-100' : 'border-chassis-700 text-ink-300 hover:text-ink-100'}`}>
                          <span aria-hidden="true">{isOut ? '✓' : '○'}</span>
                          {p.label}
                        </button>
                      </li>
                    )
                  })}
                </ul>
                {level !== 'beginner' && (
                  <button type="button" onClick={st.useHint} disabled={showHint} className="mt-2 text-xs text-signal-300 hover:text-ink-100 disabled:text-ink-500">
                    {showHint ? `Hint shown: ${next.map((p) => p.label).join(', ')}` : `Show which parts can come out now (hints used: ${hintsUsed})`}
                  </button>
                )}
              </>
            )}
          </section>
        )}
      </div>
    )
  }

  // Reassembly
  const curI = currentInstallStage(model, removed)
  const stage = curI >= 0 ? model.procedure[curI] : null
  const can = installableNow(model, removed)
  const total = model.procedure.flatMap((s) => s.partIds).length
  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="mb-1 flex justify-between text-xs text-ink-400">
          <span>Reassembly</span>
          <span className="readout">
            {total - removed.length} / {total} parts installed
          </span>
        </div>
        <Meter value={(total - removed.length) / total} tone="live" label="Reassembly progress" />
      </div>
      {stage ? (
        <section className="rounded-lg border border-chassis-700 bg-chassis-900/60 p-3">
          <h3 className="text-sm font-semibold text-ink-100">Reverse of: {stage.title}</h3>
          <p className="mt-1 text-sm text-ink-300">{stage.reassemblyTip}</p>
          <h4 className="mt-3 text-xs font-semibold text-ink-400">Parts tray (click to install)</h4>
          <ul className="mt-1.5 flex flex-col gap-1">
            {stage.partIds
              .filter((id) => removed.includes(id))
              .map((id) => {
                const p = model.parts.find((x) => x.id === id)!
                const ok = canInstall(model, removed, id).ok
                const highlight = (level === 'beginner' || showHint) && ok
                return (
                  <li key={id}>
                    <button type="button" onClick={() => st.clickPart(id)} className={`flex min-h-9 w-full items-center gap-2 rounded-md border px-2.5 text-left text-sm ${highlight ? 'border-live-400/50 bg-live-400/8 text-ink-100' : 'border-chassis-700 text-ink-300 hover:text-ink-100'}`}>
                      <span aria-hidden="true">＋</span>
                      {p.label}
                    </button>
                  </li>
                )
              })}
          </ul>
          {level !== 'beginner' && (
            <button type="button" onClick={st.useHint} disabled={showHint} className="mt-2 text-xs text-signal-300 hover:text-ink-100 disabled:text-ink-500">
              {showHint ? `Next valid: ${can.map((p) => p.label).join(', ')}` : 'Show which part goes in next'}
            </button>
          )}
        </section>
      ) : (
        <section className="rounded-lg border border-chassis-700 bg-chassis-900/60 p-3">
          <h3 className="text-sm font-semibold text-ink-100">Reconnect and functional test</h3>
          <p className="mt-1 mb-2 text-sm text-ink-400">{model.procedure[0].reassemblyTip}</p>
          <Checklist items={model.id === 'lf3k' ? [...RECONNECT_STEPS.slice(0, 5), 'PV reconnected with breaker OFF, then switched ON', RECONNECT_STEPS[5]] : RECONNECT_STEPS} onDone={st.finishReassembly} doneLabel="Finish: inverter tested and returned to service" />
        </section>
      )}
    </div>
  )
}
