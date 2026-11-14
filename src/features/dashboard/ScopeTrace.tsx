import { useEffect, useRef, useState } from 'react'
import { niceStep } from '../../engine/waveform/scale'

interface Props {
  samples: Float64Array
  /** Total time span shown (s). */
  spanS: number
  peak: number
  /** Optional dashed reference line (e.g. RMS level). */
  rms?: number
}

/** Oscilloscope-style trace: 10 horizontal × 8 vertical divisions, drawn at real pixel size. */
export function ScopeTrace({ samples, spanS, peak, rms }: Props) {
  const box = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ w: 640, h: 300 })

  useEffect(() => {
    const el = box.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const { w, h } = size
  const vdiv = niceStep((peak || 1) / 3.5)
  const yScale = h / (8 * vdiv)
  const y = (v: number) => h / 2 - v * yScale
  const n = samples.length
  const step = Math.max(1, Math.floor(n / (w * 3)))
  let d = ''
  for (let i = 0; i < n; i += step) d += `${i === 0 ? 'M' : 'L'}${((i / (n - 1)) * w).toFixed(1)},${y(samples[i]).toFixed(1)}`

  const tdiv = spanS / 10
  const tLabel = tdiv >= 1e-3 ? `${+(tdiv * 1e3).toPrecision(3)} ms/div` : `${+(tdiv * 1e6).toPrecision(3)} µs/div`

  return (
    <div className="relative">
      <div ref={box} className="relative h-[260px] overflow-hidden rounded-md border border-chassis-600 bg-[#050811] sm:h-[300px]">
        <svg width={w} height={h} className="absolute inset-0" role="img" aria-label="Simulated output voltage waveform">
          {Array.from({ length: 11 }, (_, i) => (
            <line key={`v${i}`} x1={(i * w) / 10} x2={(i * w) / 10} y1={0} y2={h} stroke={i === 5 ? '#2a3656' : '#141b31'} />
          ))}
          {Array.from({ length: 9 }, (_, i) => (
            <line key={`h${i}`} y1={(i * h) / 8} y2={(i * h) / 8} x1={0} x2={w} stroke={i === 4 ? '#2a3656' : '#141b31'} />
          ))}
          {rms !== undefined && rms > 0 && (
            <>
              <line x1={0} x2={w} y1={y(rms)} y2={y(rms)} stroke="#6d93ff" strokeDasharray="4 5" opacity={0.7} />
              <line x1={0} x2={w} y1={y(-rms)} y2={y(-rms)} stroke="#6d93ff" strokeDasharray="4 5" opacity={0.35} />
            </>
          )}
          <path d={d} fill="none" stroke="#3ddc97" strokeWidth={1.8} strokeLinejoin="round" style={{ filter: 'drop-shadow(0 0 3px rgb(61 220 151 / .55))' }} />
        </svg>
      </div>
      <div className="readout mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-400">
        <span>
          CH1 <span className="text-live-400">{vdiv} V/div</span>
        </span>
        <span>{tLabel}</span>
        {rms !== undefined && <span className="text-signal-300">- - RMS level</span>}
      </div>
    </div>
  )
}
