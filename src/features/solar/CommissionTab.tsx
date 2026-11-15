import { useMemo, useState } from 'react'
import { asBuilt, evaluateCommissioning, type AsBuiltFault, type CommissionReport } from '../../engine/solar/commissioning'
import { useProgress } from '../../store/progressStore'
import { Button, Panel, Tag } from '../../ui/primitives'
import { NumField, SelectField } from './fields'
import { commissioningReport } from './report'
import { useDesign } from './useDesign'

const CONDITIONS = [
  { g: 850, tCell: 41 },
  { g: 720, tCell: 33 },
  { g: 960, tCell: 52 },
]

/**
 * Commissioning: predict, measure, compare and record. Practice mode can inject an as-built fault;
 * the activity is recorded only for a healthy installation with correct predictions.
 */
export default function CommissionTab() {
  const d = useDesign()
  const record = useProgress((s) => s.recordActivity)
  const level = useProgress((s) => s.level)
  const [ci, setCi] = useState(0)
  const [fault, setFault] = useState<AsBuiltFault>('none')
  const c = CONDITIONS[ci]
  const m = useMemo(() => asBuilt(d, c, fault, ci + 1), [d, c, fault, ci])
  const [entries, setEntries] = useState({ vocExpected: 0, iscExpected: 0, irLimit: 0, acNominal: 230, acTol: 0.05 })
  const [rep, setRep] = useState<CommissionReport | null>(null)
  const [recorded, setRecorded] = useState(false)
  const evaluate = () => {
    const r = evaluateCommissioning(d, c, m, entries)
    setRep(r)
    if (r.passed && fault === 'none') {
      record({ activityId: 'solar:commission', label: `Solar laboratory: commissioning record passed (${d.spec.type}, ${d.numbers.series}×${d.numbers.strings} array)`, level })
      setRecorded(true)
    }
  }
  const download = () => {
    if (!rep) return
    const blob = new Blob([commissioningReport(d, c, rep)], { type: 'text/markdown' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'commissioning-record.md'
    a.click()
    URL.revokeObjectURL(a.href)
  }
  const danger = d.issues.some((i) => i.severity === 'danger')
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
      <Panel title="1. Before energising: predict">
        {danger && (
          <p className="mb-3 rounded border border-danger-400/50 bg-danger-400/10 p-2 text-xs text-danger-400" data-testid="com-danger">
            The design on the Design tab has issues that must be fixed. A system is never commissioned with known design faults.
          </p>
        )}
        <p className="text-sm text-ink-300" data-testid="com-conditions">
          Your design: {d.numbers.series} × {d.numbers.strings} of {d.spec.module.name}. Reference cell: <strong>{c.g} W/m²</strong>; module back-sheet temperature <strong>{c.tCell} °C</strong>.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <NumField label="Expected string V_oc" unit="V" step={0.1} value={entries.vocExpected} onChange={(v) => setEntries({ ...entries, vocExpected: v })} testid="com-voc" />
          <NumField label="Expected string I_sc" unit="A" step={0.01} value={entries.iscExpected} onChange={(v) => setEntries({ ...entries, iscExpected: v })} testid="com-isc" />
          <NumField label="Insulation resistance limit (from the applicable standard)" unit="MΩ" step={0.1} value={entries.irLimit} onChange={(v) => setEntries({ ...entries, irLimit: v })} testid="com-ir" />
          <NumField label="Inverter nominal AC voltage (datasheet)" unit="V" value={entries.acNominal} onChange={(v) => setEntries({ ...entries, acNominal: v })} />
          <NumField label="AC voltage tolerance (datasheet, fraction)" step={0.01} value={entries.acTol} onChange={(v) => setEntries({ ...entries, acTol: v })} />
        </div>
        <p className="mt-2 text-xs text-ink-500">Insulation-resistance limits depend on the system voltage and are set by the applicable standard (for PV systems, typically IEC 62446-1 or the national equivalent). Look the value up; this laboratory does not supply it.</p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <SelectField label="Measurement conditions" value={ci} options={CONDITIONS.map((x, i) => ({ value: i, label: `${x.g} W/m², ${x.tCell} °C` }))} onChange={(v) => { setCi(v); setRep(null) }} testid="com-cond" />
          <SelectField
            label="Practice: as-built condition"
            value={fault}
            options={[
              { value: 'none', label: 'As designed (recordable)' },
              { value: 'reversed-string', label: 'Practice fault A' },
              { value: 'low-string', label: 'Practice fault B' },
              { value: 'low-insulation', label: 'Practice fault C' },
            ]}
            onChange={(v) => { setFault(v); setRep(null) }}
            testid="com-fault"
          />
        </div>
      </Panel>
      <Panel title="2. Measure and compare" action={rep ? <Tag tone={rep.passed ? 'live' : 'danger'}>{rep.passed ? 'PASS' : 'FAIL'}</Tag> : undefined}>
        <table className="w-full text-left text-sm" data-testid="com-measured">
          <tbody>
            {m.stringVoc.map((v, k) => (
              <tr key={`v${k}`} className="border-b border-chassis-700">
                <td className="py-1 text-ink-400">String {k + 1} V_oc (+ to −)</td>
                <td className="readout py-1 text-ink-100">{(v * m.polarity[k]).toFixed(1)} V</td>
              </tr>
            ))}
            {m.stringIsc.map((v, k) => (
              <tr key={`i${k}`} className="border-b border-chassis-700">
                <td className="py-1 text-ink-400">String {k + 1} I_sc</td>
                <td className="readout py-1 text-ink-100">{v.toFixed(2)} A</td>
              </tr>
            ))}
            <tr className="border-b border-chassis-700">
              <td className="py-1 text-ink-400">Array insulation resistance (test voltage per the standard)</td>
              <td className="readout py-1 text-ink-100">{m.insulationMOhm} MΩ</td>
            </tr>
            {d.spec.type !== 'grid-tied' && (
              <tr className="border-b border-chassis-700">
                <td className="py-1 text-ink-400">Battery bank at the isolator (before connection)</td>
                <td className="readout py-1 text-ink-100">{m.batteryV.toFixed(2)} V</td>
              </tr>
            )}
            <tr>
              <td className="py-1 text-ink-400">Inverter AC output, no load</td>
              <td className="readout py-1 text-ink-100">{m.inverterV.toFixed(1)} V</td>
            </tr>
          </tbody>
        </table>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button variant="primary" onClick={evaluate} disabled={danger} data-testid="com-evaluate">
            Evaluate commissioning record
          </Button>
          <Button onClick={download} disabled={!rep} data-testid="com-download">
            Download record
          </Button>
        </div>
        {rep && (
          <ul className="mt-3 space-y-1.5" data-testid="com-report" data-passed={rep.passed}>
            {rep.checks.map((x) => (
              <li key={x.id} className={`rounded border px-3 py-1.5 text-xs ${x.pass ? 'border-live-400/40 text-ink-300' : 'border-danger-400/50 bg-danger-400/10 text-danger-400'}`} data-testid={`com-${x.id}`} data-pass={x.pass}>
                <span className="font-medium">{x.pass ? '✓' : '✗'} {x.label}</span> — expected {x.expected}, measured {x.measured}. {x.note}
              </li>
            ))}
          </ul>
        )}
        {recorded && rep?.passed && (
          <p className="mt-2 text-xs text-live-400" role="status" data-testid="com-recorded">
            Commissioning record recorded in your progress.
          </p>
        )}
        <p className="mt-3 text-xs text-ink-500">Simulated practice. Real commissioning follows the installation standard and the manufacturers’ procedures, with calibrated instruments, by qualified persons; PV circuits are live whenever the array is lit.</p>
      </Panel>
    </div>
  )
}
