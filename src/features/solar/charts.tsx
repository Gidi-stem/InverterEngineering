import type { ReactNode } from 'react'

/** Small SVG charts for the solar laboratory and its lesson demonstrations. */
export interface Series {
  name: string
  points: [number, number][]
  cls: string
  dashed?: boolean
  /** Plot against the right-hand axis. */
  right?: boolean
}

const niceMax = (v: number) => {
  if (v <= 0) return 1
  const e = Math.pow(10, Math.floor(Math.log10(v)))
  const f = v / e
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * e
}

export function LineChart({ series, xLabel, yLabel, yRightLabel, xMax, yMax, yRightMax, marks = [], label, h = 220, xTicks, testid }: { series: Series[]; xLabel: string; yLabel: string; yRightLabel?: string; xMax?: number; yMax?: number; yRightMax?: number; marks?: { x: number; y?: number; label: string; cls?: string }[]; label: string; h?: number; xTicks?: number[]; testid?: string }) {
  const W = 640
  const x0 = 56
  const x1 = yRightLabel ? W - 56 : W - 16
  const y0 = 14
  const y1 = h - 34
  const xm = xMax ?? niceMax(Math.max(1e-9, ...series.flatMap((s) => s.points.map((p) => p[0]))))
  const ym = yMax ?? niceMax(Math.max(1e-9, ...series.filter((s) => !s.right).flatMap((s) => s.points.map((p) => p[1]))))
  const yr = yRightMax ?? niceMax(Math.max(1e-9, ...series.filter((s) => s.right).flatMap((s) => s.points.map((p) => p[1]))))
  const X = (v: number) => x0 + (v / xm) * (x1 - x0)
  const Y = (v: number, right?: boolean) => y1 - (v / (right ? yr : ym)) * (y1 - y0)
  const ticks = xTicks ?? [0, 0.25, 0.5, 0.75, 1].map((f) => f * xm)
  const fmt = (v: number) => (Math.abs(v) >= 1000 ? `${(v / 1000).toFixed(v >= 10000 ? 0 : 1)}k` : Math.abs(v) >= 10 ? v.toFixed(0) : v.toFixed(v === 0 ? 0 : 1))
  return (
    <svg viewBox={`0 0 ${W} ${h}`} className="h-auto w-full" role="img" aria-label={label} data-testid={testid}>
      {[0, 0.25, 0.5, 0.75, 1].map((f) => (
        <g key={f}>
          <line x1={x0} x2={x1} y1={Y(f * ym)} y2={Y(f * ym)} className="stroke-chassis-700" strokeWidth={1} />
          <text x={x0 - 6} y={Y(f * ym) + 4} textAnchor="end" className="fill-ink-500 text-[10px]">
            {fmt(f * ym)}
          </text>
          {yRightLabel && (
            <text x={x1 + 6} y={Y(f * yr, true) + 4} className="fill-ink-500 text-[10px]">
              {fmt(f * yr)}
            </text>
          )}
        </g>
      ))}
      {ticks.map((t) => (
        <text key={t} x={X(t)} y={y1 + 14} textAnchor="middle" className="fill-ink-500 text-[10px]">
          {fmt(t)}
        </text>
      ))}
      <line x1={x0} x2={x1} y1={y1} y2={y1} className="stroke-chassis-500" />
      <line x1={x0} x2={x0} y1={y0} y2={y1} className="stroke-chassis-500" />
      {series.map((s) => (
        <path key={s.name} d={s.points.map((p, i) => `${i ? 'L' : 'M'}${X(p[0]).toFixed(1)} ${Y(Math.max(0, p[1]), s.right).toFixed(1)}`).join('')} fill="none" className={s.cls} strokeWidth={1.7} strokeDasharray={s.dashed ? '5 4' : undefined} />
      ))}
      {marks.map((m) => (
        <g key={m.label}>
          <line x1={X(m.x)} x2={X(m.x)} y1={y0} y2={y1} className={m.cls ?? 'stroke-signal-400'} strokeDasharray="3 3" />
          {m.y !== undefined && <circle cx={X(m.x)} cy={Y(m.y)} r={3.5} className="fill-signal-300" />}
          <text x={X(m.x) + 4} y={y0 + 10} className="fill-signal-300 text-[10px]">
            {m.label}
          </text>
        </g>
      ))}
      <text x={(x0 + x1) / 2} y={h - 6} textAnchor="middle" className="fill-ink-400 text-[10px]">
        {xLabel}
      </text>
      <text x={12} y={(y0 + y1) / 2} transform={`rotate(-90 12 ${(y0 + y1) / 2})`} textAnchor="middle" className="fill-ink-400 text-[10px]">
        {yLabel}
      </text>
      {yRightLabel && (
        <text x={W - 6} y={(y0 + y1) / 2} transform={`rotate(90 ${W - 6} ${(y0 + y1) / 2})`} textAnchor="middle" className="fill-ink-400 text-[10px]">
          {yRightLabel}
        </text>
      )}
    </svg>
  )
}

export function Legend({ items }: { items: { name: string; cls: string }[] }) {
  return (
    <div className="flex flex-wrap gap-3 text-xs text-ink-400">
      {items.map((i) => (
        <span key={i.name} className="inline-flex items-center gap-1">
          <svg width="18" height="6" aria-hidden="true">
            <line x1="0" x2="18" y1="3" y2="3" className={i.cls} strokeWidth="2" />
          </svg>
          {i.name}
        </span>
      ))}
    </div>
  )
}

export function Bars({ values, label, unit, testid, hi }: { values: number[]; label: string; unit: string; testid?: string; hi?: number }) {
  const W = 640
  const h = 160
  const m = niceMax(Math.max(1e-9, ...values))
  const bw = (W - 60) / values.length
  return (
    <svg viewBox={`0 0 ${W} ${h}`} className="h-auto w-full" role="img" aria-label={label} data-testid={testid}>
      {values.map((v, i) => (
        <g key={i}>
          <rect x={50 + i * bw + 1} y={130 - (v / m) * 116} width={bw - 2} height={(v / m) * 116} className={i === hi ? 'fill-caution-400' : 'fill-signal-400/80'} />
          {i % 3 === 0 && (
            <text x={50 + i * bw + bw / 2} y={146} textAnchor="middle" className="fill-ink-500 text-[10px]">
              {String(i).padStart(2, '0')}
            </text>
          )}
        </g>
      ))}
      <text x={44} y={18} textAnchor="end" className="fill-ink-500 text-[10px]">
        {m.toFixed(0)} {unit}
      </text>
      <line x1={50} x2={W - 10} y1={130} y2={130} className="stroke-chassis-500" />
      <text x={W / 2} y={158} textAnchor="middle" className="fill-ink-400 text-[10px]">
        hour of day
      </text>
    </svg>
  )
}

export function Stat({ label, value, testid, tone }: { label: string; value: ReactNode; testid?: string; tone?: 'ok' | 'warn' | 'bad' }) {
  const c = tone === 'bad' ? 'text-danger-400' : tone === 'warn' ? 'text-caution-400' : tone === 'ok' ? 'text-live-400' : 'text-ink-100'
  return (
    <div className="rounded-md border border-chassis-700 bg-chassis-850 px-3 py-2">
      <div className="text-[11px] text-ink-500">{label}</div>
      <div className={`readout text-sm ${c}`} data-testid={testid}>
        {value}
      </div>
    </div>
  )
}
