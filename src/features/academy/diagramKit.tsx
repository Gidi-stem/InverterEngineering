import type { ReactNode } from 'react'

/** Shared drawing primitives for lesson diagrams. */
export const W = 640
export const txt = 'fill-ink-300 text-[11px]'
export const dim = 'fill-ink-500 text-[10px]'

export function Box({ x, y, w = 92, h = 34, label, sub, tone = 'n' }: { x: number; y: number; w?: number; h?: number; label: string; sub?: string; tone?: 'n' | 'p' | 's' | 'd' | 'c' }) {
  const cls = { n: 'fill-chassis-800 stroke-chassis-500', p: 'fill-live-400/10 stroke-live-400', s: 'fill-signal-500/10 stroke-signal-400', d: 'fill-danger-400/10 stroke-danger-400', c: 'fill-caution-400/10 stroke-caution-400' }[tone]
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={5} className={cls} strokeWidth={1.2} />
      <text x={x + w / 2} y={y + (sub ? h / 2 - 2 : h / 2 + 4)} textAnchor="middle" className="fill-ink-100 text-[11px] font-medium">
        {label}
      </text>
      {sub && (
        <text x={x + w / 2} y={y + h / 2 + 11} textAnchor="middle" className={dim}>
          {sub}
        </text>
      )}
    </g>
  )
}
export const Arrow = ({ x1, y1, x2, y2, thick, cls = 'stroke-ink-400' }: { x1: number; y1: number; x2: number; y2: number; thick?: boolean; cls?: string }) => (
  <line x1={x1} y1={y1} x2={x2} y2={y2} className={cls} strokeWidth={thick ? 2.6 : 1.3} markerEnd="url(#ac-arrow)" />
)
export const Defs = () => (
  <defs>
    <marker id="ac-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0 0L10 5L0 10z" className="fill-ink-400" />
    </marker>
  </defs>
)
export function Svg({ h, children, label }: { h: number; children: ReactNode; label: string }) {
  return (
    <svg viewBox={`0 0 ${W} ${h}`} className="h-auto w-full" role="img" aria-label={label}>
      <Defs />
      {children}
    </svg>
  )
}

export function Trace({ d, cls }: { d: string; cls: string }) {
  return <path d={d} fill="none" className={cls} strokeWidth={1.5} />
}
export const Axis = ({ x, y, w, label }: { x: number; y: number; w: number; label: string }) => (
  <g>
    <line x1={x} y1={y} x2={x + w} y2={y} className="stroke-chassis-600" strokeWidth={1} />
    <text x={x - 6} y={y + 4} textAnchor="end" className={dim}>
      {label}
    </text>
  </g>
)


export function Chain({ items, h = 110, label, note }: { items: { l: string; s?: string; t?: 'n' | 'p' | 's' | 'd' | 'c' }[]; h?: number; label: string; note?: string }) {
  const n = items.length
  const bw = Math.min(96, (W - 20 - (n - 1) * 12) / n)
  return (
    <Svg h={h} label={label}>
      {items.map((it, i) => {
        const x = 10 + i * (bw + 12)
        return (
          <g key={i}>
            <Box x={x} y={30} w={bw} h={40} label={it.l} sub={it.s} tone={it.t} />
            {i < n - 1 && <Arrow x1={x + bw} y1={50} x2={x + bw + 11} y2={50} thick />}
          </g>
        )
      })}
      {note && (
        <text x={10} y={h - 10} className={dim}>
          {note}
        </text>
      )}
    </Svg>
  )
}

