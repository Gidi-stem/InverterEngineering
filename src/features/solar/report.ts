import type { SolarDesign } from '../../engine/solar/types'
import type { CommissionReport, CommissionConditions } from '../../engine/solar/commissioning'

const fmt = (v: number) => (Math.abs(v) >= 100 ? v.toFixed(0) : Math.abs(v) >= 1 ? v.toFixed(2) : v.toFixed(3))

/** Markdown design report: every sized item with its formula and working, plus the issues. */
export function designReport(d: SolarDesign): string {
  const s = d.spec
  const lines = [
    `# Solar system design report (${s.type})`,
    '',
    'Educational design estimate produced in the Inverter Engineering Lab. Not a certified installation design.',
    '',
    `Site: ${s.site.name}; peak sun hours ${s.site.psh}; ambient ${s.site.tMin} to ${s.site.tMax} °C.`,
    `Module: ${s.module.name} (${s.module.source === 'illustrative' ? 'illustrative values' : 'entered datasheet values'}).`,
    '',
    '## Load profile',
    '',
    '| Load | W | Qty | Duty | Hours on | Start W | AC/DC |',
    '|---|---|---|---|---|---|---|',
    ...s.loads.map((l) => `| ${l.name} | ${l.watts} | ${l.qty} | ${l.duty} | ${l.windows.map(([a, b]) => `${a}–${b}`).join(', ')} | ${l.surgeW} | ${l.ac ? 'AC' : 'DC'} |`),
    '',
    '## Calculations',
    '',
  ]
  let group = ''
  for (const it of d.items) {
    if (it.group !== group) {
      group = it.group
      lines.push(`### ${group}`, '')
    }
    lines.push(`- **${it.label}: ${fmt(it.value)} ${it.unit}**${it.kind === 'assumption' ? ' (assumption)' : ''}`, `  - ${it.formula}`, `  - ${it.working}`, `  - ${it.why}`)
  }
  lines.push('', '## Issues', '', ...(d.issues.length ? d.issues.map((i) => `- [${i.severity}] ${i.message}`) : ['- None.']))
  return lines.join('\n')
}

export function commissioningReport(d: SolarDesign, c: CommissionConditions, r: CommissionReport): string {
  return [
    `# Commissioning record (${d.spec.type})`,
    '',
    'Simulated commissioning in the Inverter Engineering Lab: practice only, not a certificate.',
    '',
    `Conditions: ${c.g} W/m² plane-of-array, module temperature ${c.tCell} °C.`,
    `Array: ${d.numbers.series} modules × ${d.numbers.strings} string(s) of ${d.spec.module.name}.`,
    '',
    '| Test | Expected | Measured | Result | Note |',
    '|---|---|---|---|---|',
    ...r.checks.map((x) => `| ${x.label} | ${x.expected} | ${x.measured} | ${x.pass ? 'PASS' : 'FAIL'} | ${x.note} |`),
    '',
    `Overall: ${r.passed ? 'PASS' : 'FAIL'}`,
  ].join('\n')
}
