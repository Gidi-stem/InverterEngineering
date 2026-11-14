import { useEffect, useMemo, useRef, useState } from 'react'
import { useProgress } from '../../../store/progressStore'
import type { CapacitorBank } from '../../../types/domain'
import { Button, SafetyNotice } from '../../../ui/primitives'
import { fmtTime } from '../logic/format'
import { SAFE_V, assess, energyAt, formatR, methodsFor, predictionCorrect, tau, voltageAt } from '../logic/discharge'

const REAL_MS = 6000

/**
 * Interactive RC discharge of the model's capacitor bank. Every value on screen comes from
 * V(t) = V₀·e^(−t/RC); simulated time is compressed into a six-second animation.
 */
export function DischargeSimulator({ bank, onVerified }: { bank: CapacitorBank; onVerified: () => void }) {
  const level = useProgress((s) => s.level)
  const methods = useMemo(() => methodsFor(bank), [bank])
  const [methodId, setMethodId] = useState(methods[1].id)
  const m = methods.find((x) => x.id === methodId)!
  const a = assess(bank, m)
  const [prediction, setPrediction] = useState('')
  const [simT, setSimT] = useState(0)
  const [running, setRunning] = useState(false)
  const [ran, setRan] = useState(false)
  const [measured, setMeasured] = useState<number | null>(null)
  const raf = useRef(0)
  const tEnd = Math.max(a.tSafeS * 1.3, tau(bank, m.ohms) * 3)
  const needPrediction = level === 'advanced' && bank.initialV > SAFE_V
  const predicted = Number(prediction)
  const predictionValid = prediction.trim() !== '' && Number.isFinite(predicted) && predicted >= 0

  useEffect(() => () => cancelAnimationFrame(raf.current), [])

  const run = () => {
    cancelAnimationFrame(raf.current)
    setMeasured(null)
    setRunning(true)
    const start = performance.now()
    const step = (now: number) => {
      const f = Math.min((now - start) / REAL_MS, 1)
      setSimT(tEnd * f)
      if (f < 1) raf.current = requestAnimationFrame(step)
      else {
        setRunning(false)
        setRan(true)
      }
    }
    raf.current = requestAnimationFrame(step)
  }

  const choose = (id: string) => {
    cancelAnimationFrame(raf.current)
    setMethodId(id)
    setSimT(0)
    setRunning(false)
    setRan(false)
    setMeasured(null)
  }

  const v = voltageAt(bank, m.ohms, simT)
  const e = energyAt(bank, v)
  const W = 320
  const Hh = 130
  const path = Array.from({ length: 121 }, (_, i) => {
    const t = (i / 120) * tEnd
    const x = 34 + (i / 120) * (W - 44)
    const y = 10 + (1 - voltageAt(bank, m.ohms, t) / bank.initialV) * (Hh - 30)
    return `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`
  }).join('')
  const ySafe = 10 + (1 - Math.min(SAFE_V / bank.initialV, 1)) * (Hh - 30)
  const xNow = 34 + (simT / tEnd) * (W - 44)
  const yNow = 10 + (1 - v / bank.initialV) * (Hh - 30)

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-3 gap-2 text-center">
        {[
          ['Bank', `${(bank.capacitanceF * 1e6).toFixed(0)} µF`],
          ['Initial voltage', `${bank.initialV} V`],
          ['Stored energy ½CV²', `${energyAt(bank, bank.initialV).toFixed(bank.initialV > SAFE_V ? 1 : 2)} J`],
        ].map(([k, val]) => (
          <div key={k} className="rounded-md border border-chassis-700 bg-chassis-950/70 px-2 py-1.5">
            <div className="text-[10px] text-ink-500">{k}</div>
            <div className="readout text-sm text-ink-100">{val}</div>
          </div>
        ))}
      </div>

      <fieldset>
        <legend className="mb-1.5 text-xs font-semibold text-ink-300">Discharge method</legend>
        <div className="flex flex-col gap-1.5">
          {methods.map((x) => (
            <label key={x.id} className={`flex cursor-pointer gap-2 rounded-md border p-2 text-sm ${methodId === x.id ? 'border-signal-400 bg-signal-500/10' : 'border-chassis-700 bg-chassis-900/60'}`}>
              <input type="radio" name="discharge-method" value={x.id} checked={methodId === x.id} onChange={() => choose(x.id)} className="mt-1 accent-signal-500" />
              <span>
                <span className="block text-ink-100">{x.label}</span>
                <span className="block text-xs text-ink-500">
                  {x.kind !== 'short' ? `R = ${formatR(x.ohms)}, τ = RC = ${fmtTime(tau(bank, x.ohms))}. ` : ''}
                  {x.description}
                </span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {a.verdict === 'unsafe' ? (
        <SafetyNotice tone="danger">
          <strong>Refused: unsafe method.</strong> {a.notes.join(' ')}
        </SafetyNotice>
      ) : (
        <>
          {a.notes.length > 0 && (
            <p className={`rounded-md border px-3 py-2 text-xs ${a.verdict === 'caution' ? 'border-caution-400/40 bg-caution-400/8 text-caution-400' : 'border-chassis-700 bg-chassis-900/60 text-ink-400'}`}>{a.notes.join(' ')}</p>
          )}
          {needPrediction && (
            <label className="text-sm text-ink-300">
              Advanced: predict the time to fall below {SAFE_V} V before running (seconds)
              <input type="number" inputMode="decimal" min={0} step="any" value={prediction} onChange={(ev) => setPrediction(ev.target.value)} className="readout mt-1 block min-h-10 w-full rounded-md border border-chassis-600 bg-chassis-950 px-3 text-base text-ink-100" placeholder="t = τ·ln(V₀ / 50)" />
            </label>
          )}
          <svg viewBox={`0 0 ${W} ${Hh}`} className="w-full rounded-md border border-chassis-700 bg-[#050811]" role="img" aria-label={`Voltage decay from ${bank.initialV} volts`}>
            <line x1="34" x2={W - 10} y1={ySafe} y2={ySafe} stroke="#3ddc97" strokeDasharray="4 4" />
            <text x={W - 12} y={ySafe - 4} textAnchor="end" fontSize="9" fill="#3ddc97">
              {SAFE_V} V safe threshold
            </text>
            <path d={path} fill="none" stroke="#ffb84d" strokeWidth="1.8" />
            <line x1="34" x2="34" y1="8" y2={Hh - 20} stroke="#2a3656" />
            <line x1="34" x2={W - 10} y1={Hh - 20} y2={Hh - 20} stroke="#2a3656" />
            <text x="30" y="14" textAnchor="end" fontSize="9" fill="#8a94b0">
              {bank.initialV}V
            </text>
            <text x="34" y={Hh - 6} fontSize="9" fill="#8a94b0">
              0
            </text>
            <text x={W - 10} y={Hh - 6} textAnchor="end" fontSize="9" fill="#8a94b0">
              {fmtTime(tEnd)}
            </text>
            {(running || ran) && <circle cx={xNow} cy={yNow} r="3.5" fill="#ffd166" />}
          </svg>
          <dl className="readout grid grid-cols-5 gap-1 text-center text-xs">
            {[
              ['t', fmtTime(simT)],
              ['V', `${v.toFixed(1)}`],
              ['E (J)', e < 1 ? e.toFixed(3) : e.toFixed(1)],
              ['I', v / m.ohms < 1 ? `${((v / m.ohms) * 1000).toFixed(1)}m` : (v / m.ohms).toFixed(2)],
              ['P (W)', ((v * v) / m.ohms).toFixed(1)],
            ].map(([k, val]) => (
              <div key={k} className="rounded bg-chassis-950/70 py-1">
                <dt className="text-[10px] text-ink-500">{k}</dt>
                <dd className="text-ink-100">{val}</dd>
              </div>
            ))}
          </dl>
          <div className="flex flex-wrap gap-2">
            <Button variant="primary" onClick={run} disabled={running || (needPrediction && !predictionValid)}>
              {ran ? 'Run again' : 'Start discharge'}
            </Button>
            <Button onClick={() => setMeasured(v)} disabled={running}>
              Measure with multimeter
            </Button>
          </div>
          {ran && needPrediction && predictionValid && (
            <p className={`text-sm ${predictionCorrect(bank, m.ohms, predicted) ? 'text-live-400' : 'text-caution-400'}`}>
              Your prediction {fmtTime(predicted)}; simulated {fmtTime(a.tSafeS)} (τ·ln(V₀/{SAFE_V}) = {fmtTime(a.tauS)} × {Math.log(bank.initialV / SAFE_V).toFixed(2)}). {predictionCorrect(bank, m.ohms, predicted) ? 'Within ±15 %: well done.' : 'Outside ±15 %: check τ = R·C.'}
            </p>
          )}
          {measured !== null && (
            <div role="status" className={`rounded-md border px-3 py-2 text-sm ${measured > SAFE_V ? 'border-danger-400/40 bg-danger-400/8 text-danger-400' : 'border-live-400/40 bg-live-400/8 text-live-400'}`}>
              Meter reads <span className="readout">{measured.toFixed(1)} V DC</span>.{' '}
              {measured > SAFE_V ? 'Still hazardous: do not touch. Continue discharging.' : `Below ${SAFE_V} V. Measure again after a minute in real work (dielectric absorption can bring some voltage back).`}
            </div>
          )}
          {measured !== null && measured <= SAFE_V && (
            <Button variant="primary" onClick={onVerified}>
              Confirm: bank verified below {SAFE_V} V
            </Button>
          )}
        </>
      )}
    </div>
  )
}
