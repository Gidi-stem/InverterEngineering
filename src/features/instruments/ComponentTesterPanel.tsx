import { useState } from 'react'
import { availableProcedures, evaluateComponentTest } from '../../engine/instruments/componentTester'
import { COMPONENT_BY_ID } from '../../content/components'
import { TEST_PROCEDURES } from '../../content/components/testing'
import type { InstrumentReading } from '../../types/domain'
import { Button, Panel, Tag } from '../../ui/primitives'

const COMPONENT_IDS = Object.keys(TEST_PROCEDURES)

export default function ComponentTesterPanel() {
  const [componentId, setComponentId] = useState(COMPONENT_IDS[0])
  const procedures = availableProcedures(componentId)
  const [procedureId, setProcedureId] = useState(procedures[0]?.id)
  const procedure = procedures.find((p) => p.id === procedureId) ?? procedures[0]
  const [chosen, setChosen] = useState<Record<number, InstrumentReading>>({})

  const verdict = procedure && Object.keys(chosen).length >= procedure.steps.length ? evaluateComponentTest({ componentId, procedure, chosenReadingPerStep: procedure.steps.map((_, i) => chosen[i]) }) : null

  const choose = (componentIdNext: string) => {
    setComponentId(componentIdNext)
    const next = availableProcedures(componentIdNext)
    setProcedureId(next[0]?.id)
    setChosen({})
  }

  return (
    <div className="space-y-5">
      <Panel title="Component" action={<span className="text-xs text-ink-500">Procedures reused from the Component Library</span>}>
        <select className="w-full rounded-md border border-chassis-600 bg-chassis-900 px-2.5 py-2 text-sm text-ink-100" value={componentId} onChange={(e) => choose(e.target.value)}>
          {COMPONENT_IDS.map((id) => <option key={id} value={id}>{COMPONENT_BY_ID[id]?.name ?? id}</option>)}
        </select>
        {procedures.length > 1 && (
          <select className="mt-2 w-full rounded-md border border-chassis-600 bg-chassis-900 px-2.5 py-2 text-sm text-ink-100" value={procedureId} onChange={(e) => { setProcedureId(e.target.value); setChosen({}) }}>
            {procedures.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
          </select>
        )}
      </Panel>

      {procedure && (
        <Panel title={procedure.title}>
          <p className="text-sm text-ink-400">{procedure.purpose}</p>
          <ol className="mt-4 space-y-4">
            {procedure.steps.map((step, i) => (
              <li key={step.instruction} className="rounded-md border border-chassis-700 p-3">
                <p className="text-sm text-ink-100">{i + 1}. {step.instruction}</p>
                <p className="mt-0.5 text-xs text-ink-500">Instrument: {step.instrument} · Setting: {step.setting} · Connection: {step.connection}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {step.readings.map((r) => (
                    <Button key={r.display} variant={chosen[i] === r ? 'primary' : 'secondary'} onClick={() => setChosen((c) => ({ ...c, [i]: r }))}>
                      {r.condition}: {r.display}
                    </Button>
                  ))}
                </div>
                {chosen[i] && <p className="mt-2 text-xs text-ink-400">{chosen[i].meaning}</p>}
              </li>
            ))}
          </ol>
        </Panel>
      )}

      {verdict && (
        <Panel title="Verdict">
          <Tag tone={verdict.verdict === 'good' ? 'signal' : 'danger'}>{verdict.verdict === 'good' ? 'Component passes' : 'Component faulty'}</Tag>
          <p className="mt-2 text-sm text-ink-300">{verdict.summary}</p>
        </Panel>
      )}
    </div>
  )
}
