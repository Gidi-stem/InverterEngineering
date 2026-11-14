import type { AcResult } from '../../../engine/sim/ac'
import { eng } from '../format'

/** Bode magnitude (dB) and phase (°) against log frequency. */
export function Bode({ result }: { result: AcResult }) {
  const W = 320
  const H = 150
  const pts = result.points
  const lf = (f: number) => Math.log10(f)
  const f0 = lf(pts[0].f)
  const f1 = lf(pts[pts.length - 1].f)
  const dbMax = Math.ceil(Math.max(...pts.map((p) => p.db)) / 10) * 10
  const dbMin = Math.min(dbMax - 20, Math.max(dbMax - 80, Math.floor(Math.min(...pts.map((p) => p.db)) / 10) * 10))
  const x = (f: number) => 30 + ((lf(f) - f0) / (f1 - f0)) * (W - 36)
  const y = (db: number) => 8 + ((dbMax - Math.max(db, dbMin)) / (dbMax - dbMin)) * (H - 26)
  const yp = (ph: number) => 8 + ((180 - ph) / 360) * (H - 26)
  const mag = pts.map((p, i) => `${i ? 'L' : 'M'}${x(p.f).toFixed(1)} ${y(p.db).toFixed(1)}`).join('')
  const ph = pts.map((p, i) => `${i ? 'L' : 'M'}${x(p.f).toFixed(1)} ${yp(p.phase).toFixed(1)}`).join('')
  const decades = Array.from({ length: Math.round(f1 - f0) + 1 }, (_, k) => 10 ** (Math.ceil(f0) + k)).filter((f) => lf(f) <= f1)
  return (
    <figure className="rounded-md bg-chassis-950 p-2" data-testid="bode">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Frequency response: magnitude and phase">
        {decades.map((f) => (
          <g key={f}>
            <line x1={x(f)} x2={x(f)} y1={8} y2={H - 18} className="stroke-chassis-700" />
            <text x={x(f)} y={H - 6} textAnchor="middle" className="fill-ink-500 text-[8px]">
              {eng(f, 'Hz', 2)}
            </text>
          </g>
        ))}
        {[dbMax, (dbMax + dbMin) / 2, dbMin].map((d) => (
          <text key={d} x={26} y={y(d) + 3} textAnchor="end" className="fill-ink-500 text-[8px]">
            {d} dB
          </text>
        ))}
        <path d={ph} fill="none" strokeWidth={1} strokeDasharray="3 2" className="stroke-caution-400" />
        <path d={mag} fill="none" strokeWidth={1.6} className="stroke-signal-400" />
      </svg>
      <figcaption className="mt-1 flex flex-wrap gap-3 text-[11px] text-ink-400">
        <span className="flex items-center gap-1">
          <span className="h-0.5 w-4 bg-signal-400" /> magnitude
        </span>
        <span className="flex items-center gap-1">
          <span className="h-0.5 w-4 bg-caution-400" /> phase (−180°…180°)
        </span>
        {dbMax < -150 && <span className="text-caution-400">No transfer from this input to the output at the DC operating point (for example, the switches between them are off, or the input only drives gates).</span>}
        {result.f3db && <span>−3 dB at {eng(result.f3db, 'Hz')}</span>}
        {result.peak && (
          <span>
            Peak {result.peak.db.toFixed(1)} dB at {eng(result.peak.f, 'Hz')}
          </span>
        )}
      </figcaption>
    </figure>
  )
}
