import type { StepStatus } from '../../engine/design/assembly'
import type { TestResult } from '../../engine/design/testing'
import type { ProjectModel } from './useProject'

const n = (v: number | null) => (v === null || !Number.isFinite(v) ? '—' : Math.abs(v) >= 100 ? v.toFixed(1) : Math.abs(v) >= 10 ? v.toFixed(2) : v.toFixed(3))

/** Engineering report (Markdown) of a build project: specification, calculations, components, assembly and test results. */
export function projectReport(m: ProjectModel, steps: StepStatus[], results: TestResult[], at: number): string {
  const { project: p, design: d } = m
  const L: string[] = []
  L.push(`# Engineering report: ${p.letter}. ${p.title}`, '')
  L.push(`Generated ${new Date(at).toLocaleString()} by the Inverter Engineering Lab.`, '')
  L.push('> **Educational simulation.** This is an educational design analysed with simplified and typical component models. It is not a certified construction design. Mains-voltage and high-voltage circuits must only be built and tested by qualified people.', '')
  L.push('## Specification', '')
  L.push(`| Parameter | Value |`, `|---|---|`)
  L.push(`| DC input | ${d.vdc} V |`, `| AC output | ${d.vac} V, ${d.f} Hz, ${d.waveform} |`, `| Rated power | ${d.power} W, ${d.load} load (PF ${d.pf}) |`)
  if (d.waveform === 'sine') L.push(`| Switching frequency | ${d.fsw} Hz |`)
  L.push('', '## Design calculations', '', '| Quantity | Value | Formula | Working | Kind |', '|---|---|---|---|---|')
  for (const it of m.items) L.push(`| ${it.label} | ${n(it.value)} ${it.unit} | ${it.formula} | ${it.working.replace(/\|/g, '/')} | ${it.kind === 'assumption' ? 'typical assumption' : 'calculated'} |`)
  L.push('', '## Component compatibility', '', '| Role | Aspect | Required | Selected | Result |', '|---|---|---|---|---|')
  for (const c of m.compat) L.push(`| ${c.role} | ${c.aspect} | ${c.required} | ${c.selected} | ${c.status.toUpperCase()} |`)
  L.push('', 'Component values are generic ratings chosen in the laboratory (library values are typical). A real build requires parts whose manufacturer datasheets meet every requirement.', '')
  L.push('## Assembly verification', '', `${steps.filter((s) => s.done).length} of ${steps.length} assembly steps verified on the connection graph.`, '')
  for (const s of steps) L.push(`- ${s.done ? '✓' : '✗'} ${s.id}${s.done ? '' : `: ${s.missing.join('; ')}`}`)
  L.push('', '## Test results (simulated)', '')
  for (const r of results) {
    L.push(`### ${r.title}: ${r.status.toUpperCase()}`, '', `Criterion: ${r.criterion}`, '')
    for (const x of r.readings) L.push(`- ${x.label}: ${x.text ?? `${n(x.value)} ${x.unit}`}`)
    L.push('', r.explanation, '')
  }
  L.push('## Limitations', '')
  L.push('- Component models are idealised or piecewise-linear with typical parameters; no tolerances, ageing or manufacturer data.')
  L.push('- Not modelled: core saturation and detailed core loss, leakage inductance and switching spikes, capacitor ESR, EMI, thermal capacitance, insulation and creepage.')
  L.push('- Protection devices use simplified models; electronic shut-down is not simulated.')
  L.push('- Certification requires physical testing by an accredited laboratory against the applicable standards.')
  return L.join('\n')
}
