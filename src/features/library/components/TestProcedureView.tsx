import { useState } from 'react'
import { INSTRUMENTS, SAFETY_TEXT } from '../../../content/instruments'
import type { TestProcedure, TestStep } from '../../../types/domain'
import { SafetyNotice, Tag } from '../../../ui/primitives'

/** One step with a virtual instrument face: choose the component's condition and read what the instrument would show. */
function StepView({ step, index, compact }: { step: TestStep; index: number; compact: boolean }) {
  const [sel, setSel] = useState(0)
  const r = step.readings[sel]
  const inst = INSTRUMENTS[step.instrument]
  return (
    <li className="rounded-md border border-chassis-700 bg-chassis-900/60 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="readout grid h-6 w-6 place-items-center rounded-full border border-chassis-600 text-[11px] text-ink-400">{index + 1}</span>
        <span className="text-sm text-ink-100">{step.instruction}</span>
      </div>
      <dl className="mt-2 grid gap-x-3 gap-y-1 text-xs sm:grid-cols-[auto_minmax(0,1fr)]">
        <dt className="text-ink-500">Instrument</dt>
        <dd className="text-ink-300">
          {inst.name} <span className="text-ink-500">({inst.short})</span>
        </dd>
        <dt className="text-ink-500">Setting</dt>
        <dd className="readout text-ink-300">{step.setting}</dd>
        <dt className="text-ink-500">Connection</dt>
        <dd className="text-ink-300">{step.connection}</dd>
      </dl>
      <div className={`mt-3 grid gap-3 ${compact ? '' : 'sm:grid-cols-[minmax(0,180px)_minmax(0,1fr)]'}`}>
        <div className="rounded-lg border border-chassis-600 bg-[#1a1d22] p-2 shadow-inner" aria-live="polite">
          <div className="flex items-center justify-between text-[10px] text-ink-500">
            <span>{inst.short}</span>
            <span className="readout">{step.setting.split(',')[0]}</span>
          </div>
          <div className={`readout mt-1 rounded bg-[#9fb59a] px-2 py-1.5 text-right font-semibold text-[#1d2a1b] ${r.display.length > 14 ? 'text-sm' : 'text-xl'}`}>{r.display}</div>
          <div className="mt-1 text-[10px] text-ink-500">Representative reading</div>
        </div>
        <div>
          <div className="flex flex-wrap gap-1" role="radiogroup" aria-label={`Component condition for step ${index + 1}`}>
            {step.readings.map((x, i) => (
              <button key={x.condition} type="button" role="radio" aria-checked={sel === i} onClick={() => setSel(i)} className={`min-h-8 rounded border px-2 text-xs ${sel === i ? (x.good ? 'border-live-400 bg-live-400/15 text-ink-100' : 'border-danger-400 bg-danger-400/15 text-ink-100') : 'border-chassis-600 text-ink-400 hover:text-ink-100'}`}>
                {x.condition}
              </button>
            ))}
          </div>
          <p className={`mt-2 text-sm ${r.good ? 'text-live-400' : 'text-danger-400'}`}>
            {r.good ? '✓ ' : '✗ '}
            {r.meaning}
          </p>
        </div>
      </div>
    </li>
  )
}

/** A complete test procedure: safety preconditions first, then instrument steps with condition-dependent readings. */
export function TestProcedureView({ procedure, compact = false }: { procedure: TestProcedure; compact?: boolean }) {
  return (
    <section className="flex flex-col gap-3" aria-label={procedure.title}>
      <div>
        <h4 className="text-sm font-semibold text-ink-100">{procedure.title}</h4>
        <p className="text-xs text-ink-400">{procedure.purpose}</p>
        <div className="mt-1 flex flex-wrap gap-1">
          {[...new Set(procedure.steps.map((s) => s.instrument))].map((i) => (
            <Tag key={i} tone="signal">
              {INSTRUMENTS[i].short}
            </Tag>
          ))}
        </div>
      </div>
      <SafetyNotice>
        <strong>Before you start:</strong>
        <ul className="mt-1 list-disc space-y-0.5 pl-4">
          {procedure.safety.map((k) => (
            <li key={k}>{SAFETY_TEXT[k]}</li>
          ))}
          {procedure.extraSafety?.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </SafetyNotice>
      <ol className="flex flex-col gap-2">
        {procedure.steps.map((s, i) => (
          <StepView key={i} step={s} index={i} compact={compact} />
        ))}
      </ol>
    </section>
  )
}
