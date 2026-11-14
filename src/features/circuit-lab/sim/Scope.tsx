import type { Frame } from '../../../engine/sim/session'
import { eng } from '../format'
import { CH_COLORS, fmtSec } from './scale'
import type { ScopeSettings } from './useSimulation'

const W = 1000
const H = 400

/**
 * Four-channel oscilloscope: 10 × 8 divisions. Each column shows the min/max envelope of the
 * simulated samples that fall in it, so fast PWM edges are never lost by decimation.
 */
export function Scope({ frame, settings, showSpectrum }: { frame: Frame | null; settings: ScopeSettings; showSpectrum: boolean }) {
  const active = settings.channels.map((c, i) => ({ ...c, i })).filter((c) => c.on && c.key)
  const y = (v: number, perDiv: number, offset: number) => Math.max(-20, Math.min(H + 20, H / 2 - (v / perDiv + offset) * (H / 8)))
  return (
    <div className="relative h-full w-full" data-testid="scope">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-full w-full bg-[#05080f]" role="img" aria-label="Oscilloscope display">
        {Array.from({ length: 11 }, (_, k) => (
          <line key={`v${k}`} x1={(k * W) / 10} x2={(k * W) / 10} y1={0} y2={H} stroke={k === 5 ? '#2a3550' : '#162036'} vectorEffect="non-scaling-stroke" />
        ))}
        {Array.from({ length: 9 }, (_, k) => (
          <line key={`h${k}`} y1={(k * H) / 8} y2={(k * H) / 8} x1={0} x2={W} stroke={k === 4 ? '#2a3550' : '#162036'} vectorEffect="non-scaling-stroke" />
        ))}
        {!showSpectrum &&
          frame &&
          active.map((c) => {
            const ch = frame.channels.find((x) => x.key === c.key)
            if (!ch) return null
            const n = ch.min.length
            let d = ''
            for (let k = 0; k < n; k++) {
              if (Number.isNaN(ch.min[k])) continue
              const x = ((k + 0.5) / n) * W
              d += `${d ? 'L' : 'M'}${x.toFixed(1)} ${y(ch.max[k], c.perDiv, c.offset).toFixed(1)}L${x.toFixed(1)} ${y(ch.min[k], c.perDiv, c.offset).toFixed(1)}`
            }
            const zero = y(0, c.perDiv, c.offset)
            return (
              <g key={c.i}>
                <path d={`M0 ${zero}L14 ${zero}`} stroke={CH_COLORS[c.i]} strokeWidth={3} vectorEffect="non-scaling-stroke" />
                <path d={d} fill="none" stroke={CH_COLORS[c.i]} strokeWidth={1.5} vectorEffect="non-scaling-stroke" strokeLinejoin="round" data-testid={`trace-${c.i}`} />
              </g>
            )
          })}
        {showSpectrum && frame?.spectrum && (
          <g>
            {[0, -20, -40].map((d) => (
              <text key={d} x={W - 6} y={H - ((60 + d) / 60) * (H - 40) + 12} textAnchor="end" fill="#64748b" fontSize="11" vectorEffect="non-scaling-stroke">
                {d} dB
              </text>
            ))}
            {frame.spectrum.amp.slice(1).map((a, k) => {
              // dB relative to the fundamental, 0 … −60 dB, so small harmonics stay visible.
              const top = frame.spectrum!.amp[1] || 1
              const db = 20 * Math.log10(Math.max(a / top, 1e-6))
              const hgt = Math.max(0, ((60 + db) / 60) * (H - 40))
              const bw = W / 52
              return <rect key={k} x={(k + 0.6) * bw} y={H - hgt} width={bw * 0.7} height={hgt} fill={k === 0 ? CH_COLORS[settings.spectrumOf] : '#64748b'} />
            })}
          </g>
        )}
      </svg>
      <div className="pointer-events-none absolute top-1 left-2 flex flex-wrap gap-x-3 font-mono text-[10px]">
        {active.map((c) => {
          const ch = frame?.channels.find((x) => x.key === c.key)
          return (
            <span key={c.i} style={{ color: CH_COLORS[c.i] }}>
              CH{c.i + 1} {ch?.label ?? c.key} · {eng(c.perDiv, ch?.unit ?? 'V')}/div
            </span>
          )
        })}
      </div>
      <div className="pointer-events-none absolute right-2 bottom-1 font-mono text-[10px] text-ink-400">
        {showSpectrum
          ? frame?.spectrum
            ? `Harmonics 1–${frame.spectrum.amp.length - 1} of ${eng(frame.spectrum.f0, 'Hz')} (0 to −60 dB relative to the fundamental) · THD ${(frame.spectrum.thd * 100).toFixed(1)} %`
            : 'Spectrum needs at least one full cycle of the channel on screen'
          : `${fmtSec(settings.timeDiv)}/div · t = ${frame ? fmtSec(frame.t) : '0 s'}${frame?.triggered ? ' · triggered' : ''}`}
      </div>
      {!frame && <div className="absolute inset-0 grid place-items-center text-sm text-ink-500">Press Run to simulate this circuit.</div>}
    </div>
  )
}
