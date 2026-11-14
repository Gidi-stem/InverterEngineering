import { CH_COLORS, fmtSec, TIME_DIVS } from './scale'
import type { ScopeSettings, SimState } from './useSimulation'

interface Props {
  state: SimState
  onRun: () => void
  onPause: () => void
  onStop: () => void
  onReset: () => void
  onStep: () => void
  stepSize: '1' | '10' | 'div'
  onStepSize: (s: '1' | '10' | 'div') => void
  speed: number
  onSpeed: (s: number) => void
  settings: ScopeSettings
  onSettings: (s: ScopeSettings) => void
  spectrum: boolean
  onSpectrum: (on: boolean) => void
}

const SPEEDS: [number, string][] = [
  [1, '1 div/s'],
  [5, '5 div/s'],
  [20, '20 div/s'],
  [Infinity, 'Max'],
]
const btn = 'inline-flex min-h-9 shrink-0 items-center gap-1 rounded-md border px-2.5 text-xs font-medium disabled:opacity-40'
const sel = 'h-9 shrink-0 rounded-md border border-chassis-600 bg-chassis-950 px-1 text-xs text-ink-100'

/** Run controls, simulation speed, step size, time base, trigger and spectrum view. */
export function SimBar(p: Props) {
  const running = p.state === 'running'
  return (
    <div className="flex items-center gap-1 overflow-x-auto border-b border-chassis-700 bg-chassis-900 px-1.5 py-1" data-testid="sim-bar">
      {running ? (
        <button type="button" className={`${btn} border-caution-400/50 text-caution-400`} onClick={p.onPause} data-testid="sim-pause">
          ❚❚ Pause
        </button>
      ) : (
        <button type="button" className={`${btn} border-live-400/60 bg-live-400/10 text-live-400`} onClick={p.onRun} data-testid="sim-run">
          ▶ {p.state === 'paused' ? 'Resume' : 'Run'}
        </button>
      )}
      <button type="button" className={`${btn} border-chassis-600 text-ink-200`} onClick={p.onStop} disabled={!(running || p.state === 'paused')} data-testid="sim-stop">
        ■ Stop
      </button>
      <button type="button" className={`${btn} border-chassis-600 text-ink-200`} onClick={p.onReset} data-testid="sim-reset">
        ↺ Reset
      </button>
      <button type="button" className={`${btn} border-chassis-600 text-ink-200`} onClick={p.onStep} data-testid="sim-step">
        ⏭ Step
      </button>
      <select className={sel} value={p.stepSize} onChange={(e) => p.onStepSize(e.target.value as Props['stepSize'])} aria-label="Step size" data-testid="sim-step-size">
        <option value="1">1 time step</option>
        <option value="10">10 time steps</option>
        <option value="div">1 division</option>
      </select>
      <span className="mx-1 h-6 w-px shrink-0 bg-chassis-700" aria-hidden="true" />
      <label className="flex shrink-0 items-center gap-1 text-[11px] text-ink-400">
        Speed
        <select className={sel} value={String(p.speed)} onChange={(e) => p.onSpeed(Number(e.target.value))} data-testid="sim-speed">
          {SPEEDS.map(([v, l]) => (
            <option key={l} value={String(v)}>
              {l}
            </option>
          ))}
        </select>
      </label>
      <label className="flex shrink-0 items-center gap-1 text-[11px] text-ink-400">
        Time
        <select className={sel} value={p.settings.timeDiv} onChange={(e) => p.onSettings({ ...p.settings, timeDiv: Number(e.target.value) })} data-testid="sim-timediv">
          {TIME_DIVS.map((t) => (
            <option key={t} value={t}>
              {fmtSec(t)}/div
            </option>
          ))}
        </select>
      </label>
      <label className="flex min-h-9 shrink-0 items-center gap-1 px-1 text-[11px] text-ink-300">
        <input type="checkbox" checked={p.settings.trigger} onChange={(e) => p.onSettings({ ...p.settings, trigger: e.target.checked })} className="accent-signal-500" />
        Trigger CH1
      </label>
      <label className="flex min-h-9 shrink-0 items-center gap-1 px-1 text-[11px] text-ink-300">
        <input type="checkbox" checked={p.spectrum} onChange={(e) => p.onSpectrum(e.target.checked)} className="accent-signal-500" data-testid="sim-spectrum" />
        Spectrum
      </label>
      {p.spectrum && (
        <select className={sel} value={p.settings.spectrumOf} onChange={(e) => p.onSettings({ ...p.settings, spectrumOf: Number(e.target.value) })} aria-label="Spectrum channel" style={{ color: CH_COLORS[p.settings.spectrumOf] }}>
          {p.settings.channels.map((_, i) => (
            <option key={i} value={i}>
              CH{i + 1}
            </option>
          ))}
        </select>
      )}
    </div>
  )
}
