import { useLab } from '../store/labStore'

const btn = (on: boolean) =>
  `min-h-8 rounded-md border px-2 text-xs font-medium transition-colors ${on ? 'border-signal-400 bg-signal-500/25 text-ink-100' : 'border-chassis-600 bg-chassis-900/90 text-ink-300 hover:text-ink-100'}`

/** Canvas overlay controls: explode/reassemble, labels, connection points, show all, reset view. */
export function Toolbar() {
  const mode = useLab((s) => s.mode)
  const explode = useLab((s) => s.explode)
  const showLabels = useLab((s) => s.showLabels)
  const showConnections = useLab((s) => s.showConnections)
  const hidden = useLab((s) => s.hidden)
  const isolated = useLab((s) => s.isolated)
  const set = useLab.getState()

  return (
    <div className="pointer-events-auto flex flex-wrap items-center gap-1 rounded-lg border border-chassis-700 bg-chassis-950/85 p-1 backdrop-blur" role="toolbar" aria-label="3D view controls">
      {mode === 'explore' && (
        <>
          <label className="flex min-h-8 items-center gap-2 rounded-md border border-chassis-600 bg-chassis-900/90 px-2 text-xs text-ink-300">
            Explode
            <input type="range" min={0} max={1} step={0.01} value={explode} onChange={(e) => set.setExplode(Number(e.target.value))} className="range w-20 xl:w-28" aria-label="Exploded view amount" />
          </label>
          <button type="button" className={btn(false)} onClick={() => {
              set.setExplode(explode > 0.5 ? 0 : 1)
              setTimeout(() => useLab.getState().requestFocus(explode > 0.5 ? 'reset' : 'all'), 750)
            }}>
            {explode > 0.5 ? 'Collapse' : 'Explode'}
          </button>
        </>
      )}
      <button type="button" className={btn(showLabels)} aria-pressed={showLabels} onClick={set.toggleLabels} disabled={mode === 'identify'}>
        Labels
      </button>
      <button type="button" className={btn(showConnections)} aria-pressed={showConnections} onClick={set.toggleConnections} disabled={mode === 'identify'}>
        Connections
      </button>
      {mode === 'explore' && (hidden.length > 0 || isolated) && (
        <button type="button" className={btn(false)} onClick={set.showAll}>
          {hidden.includes('cover') && hidden.length === 1 && !isolated ? 'Show cover' : 'Show all'}
        </button>
      )}
      <button type="button" className={btn(false)} onClick={() => set.requestFocus('reset')}>
        Reset view
      </button>
    </div>
  )
}
