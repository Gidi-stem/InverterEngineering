import { Fragment, useState, type ReactNode } from 'react'
import { GLOSSARY } from '../../content/academy/glossary'

/**
 * Renders the lesson markdown subset: "### " headings, "- " and "1. " lists, "| " tables, "> " notes
 * and paragraphs; inline **bold**, *italic*, `code` and glossary terms [[id]] / [[id|text]], which
 * open their definition when tapped or focused.
 */
export function Rich({ text }: { text: string }) {
  const blocks: ReactNode[] = []
  const lines = text.split('\n')
  let i = 0
  let k = 0
  while (i < lines.length) {
    const line = lines[i]
    if (!line.trim()) {
      i++
      continue
    }
    if (line.startsWith('### ')) {
      blocks.push(
        <h3 key={k++} className="mt-5 mb-2 text-[15px] font-semibold text-ink-100">
          <Inline text={line.slice(4)} />
        </h3>,
      )
      i++
    } else if (line.startsWith('|')) {
      const rows: string[][] = []
      while (i < lines.length && lines[i].startsWith('|')) {
        const cells = lines[i].split('|').slice(1, -1).map((c) => c.trim())
        if (!cells.every((c) => /^-+$/.test(c))) rows.push(cells)
        i++
      }
      const [head, ...body] = rows
      blocks.push(
        <div key={k++} className="my-3 overflow-x-auto">
          <table className="w-full min-w-[480px] border-collapse text-sm">
            <thead>
              <tr>
                {head.map((c, j) => (
                  <th key={j} className="border-b border-chassis-600 px-2 py-1.5 text-left font-medium text-ink-200">
                    <Inline text={c} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {body.map((r, ri) => (
                <tr key={ri} className="border-b border-chassis-700 align-top">
                  {r.map((c, j) => (
                    <td key={j} className="px-2 py-1.5 text-ink-300">
                      <Inline text={c} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      )
    } else if (/^- /.test(line) || /^\d+\. /.test(line)) {
      const ordered = /^\d+\. /.test(line)
      const items: string[] = []
      while (i < lines.length && (ordered ? /^\d+\. /.test(lines[i]) : /^- /.test(lines[i]))) {
        items.push(lines[i].replace(ordered ? /^\d+\. / : /^- /, ''))
        i++
      }
      const Tag = ordered ? 'ol' : 'ul'
      blocks.push(
        <Tag key={k++} className={`my-2 space-y-1 pl-5 text-ink-300 ${ordered ? 'list-decimal' : 'list-disc'}`}>
          {items.map((t, j) => (
            <li key={j}>
              <Inline text={t} />
            </li>
          ))}
        </Tag>,
      )
    } else if (line.startsWith('> ')) {
      const parts: string[] = []
      while (i < lines.length && lines[i].startsWith('> ')) {
        parts.push(lines[i].slice(2))
        i++
      }
      blocks.push(
        <div key={k++} role="note" className="my-3 rounded-md border border-caution-400/35 bg-caution-400/8 px-3.5 py-2.5 text-sm text-ink-300 [&_strong]:text-ink-100">
          <Inline text={parts.join(' ')} />
        </div>,
      )
    } else {
      const parts: string[] = []
      while (i < lines.length && lines[i].trim() && !/^(### |\||- |\d+\. |> )/.test(lines[i])) {
        parts.push(lines[i])
        i++
      }
      blocks.push(
        <p key={k++} className="my-2 leading-relaxed text-ink-300">
          <Inline text={parts.join(' ')} />
        </p>,
      )
    }
  }
  return <>{blocks}</>
}

const TOKEN = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[\[[a-z0-9-]+(?:\|[^\]]+)?\]\])/g

export function Inline({ text }: { text: string }) {
  const parts = text.split(TOKEN)
  return (
    <>
      {parts.map((p, i) => {
        if (!p) return null
        if (p.startsWith('**')) return <strong key={i} className="font-semibold text-ink-100"><Inline text={p.slice(2, -2)} /></strong>
        if (p.startsWith('[[')) {
          const [id, shown] = p.slice(2, -2).split('|')
          return <Term key={i} id={id} shown={shown} />
        }
        if (p.startsWith('`')) return <code key={i} className="rounded bg-chassis-800 px-1 font-mono text-[0.9em] text-signal-200">{p.slice(1, -1)}</code>
        if (p.startsWith('*') && p.endsWith('*') && p.length > 2) return <em key={i}>{p.slice(1, -1)}</em>
        return <Fragment key={i}>{p}</Fragment>
      })}
    </>
  )
}

function Term({ id, shown }: { id: string; shown?: string }) {
  const g = GLOSSARY[id]
  const [open, setOpen] = useState(false)
  const label = shown ?? g?.term.replace(/\s*\(.*\)$/, '') ?? id
  if (!g) return <>{label}</>
  return (
    <span className="relative inline">
      <button
        type="button"
        className="cursor-help border-b border-dotted border-signal-400 text-inherit"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        onBlur={() => setOpen(false)}
        data-testid={`term-${id}`}
      >
        {label}
      </button>
      {open && (
        <span role="tooltip" className="absolute top-full left-0 z-30 mt-1 block w-72 max-w-[80vw] rounded-md border border-chassis-600 bg-chassis-900 p-2.5 text-left text-xs leading-snug font-normal text-ink-300 shadow-lg">
          <span className="mb-0.5 block font-semibold text-ink-100">{g.term}</span>
          {g.def}
        </span>
      )}
    </span>
  )
}
