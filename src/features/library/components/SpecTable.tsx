import type { ComponentSpec, SpecKind } from '../../../types/domain'
import { Tag } from '../../../ui/primitives'

const KIND: Record<SpecKind, { label: string; tone: 'neutral' | 'signal' | 'caution'; explain: string }> = {
  typical: { label: 'Typical', tone: 'neutral', explain: 'Typical range for this class of component, for learning.' },
  model: { label: 'Model value', tone: 'signal', explain: 'Design value chosen for the simulated inverter in this lab.' },
  'part-type': { label: 'Part type', tone: 'caution', explain: 'Published characteristic of an industry-standard part type made by several manufacturers: confirm on the actual maker’s datasheet.' },
}

/** Specification table with provenance on every row. None of the values is a manufacturer rating for a specific part. */
export function SpecTable({ specs, compact = false }: { specs: ComponentSpec[]; compact?: boolean }) {
  const kinds = [...new Set(specs.map((s) => s.kind))]
  return (
    <div>
      <table className="w-full text-sm">
        <tbody className="divide-y divide-chassis-700 align-top">
          {specs.map((s) => (
            <tr key={s.name}>
              <th scope="row" className="py-1.5 pr-2 text-left font-normal text-ink-400">
                {s.name}
              </th>
              <td className="readout py-1.5 pr-2 text-right text-ink-100">
                {s.value}
                {s.unit ? ` ${s.unit}` : ''}
              </td>
              <td className="py-1.5 text-right">
                <Tag tone={KIND[s.kind].tone}>{KIND[s.kind].label}</Tag>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-2 rounded-md border border-chassis-700 bg-chassis-950/60 px-3 py-2 text-xs text-ink-400">
        {!compact && (
          <ul className="mb-1.5 space-y-0.5">
            {kinds.map((k) => (
              <li key={k}>
                <span className="font-medium text-ink-300">{KIND[k].label}:</span> {KIND[k].explain}
              </li>
            ))}
          </ul>
        )}
        <p>
          <span className="font-medium text-caution-400">Not manufacturer ratings.</span> The components in this lab are generic educational models. For a real part, read its marking and use that exact part’s datasheet.
        </p>
      </div>
    </div>
  )
}
