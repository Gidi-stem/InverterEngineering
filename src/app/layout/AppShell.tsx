import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { MODULES } from '../../content/modules'
import { ErrorBoundary } from '../../ui/ErrorBoundary'
import { Icon } from '../../ui/Icon'
import { useProgress } from '../../store/progressStore'
import { summarise } from '../../store/selectors'

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav aria-label="Laboratory sections" className="flex flex-col gap-0.5">
      {MODULES.map((m, i) => (
        <NavLink
          key={m.id}
          to={m.path}
          end={m.path === '/'}
          onClick={onNavigate}
          className={({ isActive }) =>
            `group flex min-h-10 items-center gap-3 rounded-md px-2.5 text-sm transition-colors ${
              isActive ? 'bg-signal-500/15 text-ink-100 shadow-[inset_2px_0_0_var(--color-signal-400)]' : 'text-ink-400 hover:bg-chassis-800 hover:text-ink-100'
            }`
          }
        >
          <span className="readout w-5 text-right text-[11px] text-ink-500">{i + 1}</span>
          <Icon name={m.icon} className="h-[18px] w-[18px] shrink-0" />
          <span className="truncate">{m.title}</span>
          {m.status === 'planned' && <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-chassis-500" title={`Interactive content arrives in Phase ${m.phase}`} />}
        </NavLink>
      ))}
    </nav>
  )
}

function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden="true">
        <rect x="1" y="1" width="30" height="30" rx="6" fill="#141b31" stroke="#2a3656" />
        <path d="M5 16h4V9h7v14h7v-7h4" fill="none" stroke="#6d93ff" strokeWidth="2" strokeLinejoin="round" />
        <path d="M5 16c3-7 8-7 11 0s8 7 11 0" fill="none" stroke="#3ddc97" strokeWidth="1.4" opacity=".9" />
      </svg>
      <div className="leading-tight">
        <div className="text-[13px] font-semibold text-ink-100">Inverter Engineering Lab</div>
        <div className="text-[11px] text-ink-500">Virtual workshop</div>
      </div>
    </div>
  )
}

export function AppShell() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const overall = useProgress((s) => summarise(s).overallPct)

  useEffect(() => {
    setOpen(false)
    document.getElementById('main')?.scrollTo({ top: 0 })
  }, [location.pathname])

  return (
    <div className="flex h-full bg-lab-grid">
      {/* Desktop sidebar */}
      <aside className="hidden w-72 shrink-0 flex-col border-r border-chassis-700 bg-chassis-950/80 lg:flex">
        <div className="border-b border-chassis-700 px-4 py-4">
          <Brand />
        </div>
        <div className="flex-1 overflow-y-auto px-2 py-3">
          <NavList />
        </div>
        <div className="border-t border-chassis-700 px-4 py-3 text-xs text-ink-500">
          Overall progress <span className="readout float-right text-ink-300">{overall.toFixed(1)}%</span>
        </div>
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
          <button type="button" aria-label="Close navigation" className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col border-r border-chassis-700 bg-chassis-950">
            <div className="flex items-center justify-between border-b border-chassis-700 px-4 py-4">
              <Brand />
              <button type="button" aria-label="Close navigation" className="grid h-10 w-10 place-items-center rounded-md text-ink-300 hover:bg-chassis-800" onClick={() => setOpen(false)}>
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-2 py-3">
              <NavList onNavigate={() => setOpen(false)} />
            </div>
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-chassis-700 bg-chassis-950/70 px-4 py-2.5 backdrop-blur lg:px-6">
          <button type="button" aria-label="Open navigation" className="grid h-10 w-10 place-items-center rounded-md text-ink-300 hover:bg-chassis-800 lg:hidden" onClick={() => setOpen(true)}>
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
            </svg>
          </button>
          <div className="lg:hidden">
            <Brand />
          </div>
          <div className="ml-auto flex items-center gap-2 text-xs text-ink-400">
            <span className="h-2 w-2 rounded-full bg-live-400 shadow-[0_0_8px_var(--color-live-400)]" aria-hidden="true" />
            <span className="hidden sm:inline">Simulation environment · modelled values, not real-world measurements</span>
            <span className="sm:hidden">Simulation</span>
          </div>
        </header>
        <main id="main" className="flex-1 overflow-y-auto">
          <ErrorBoundary resetKey={location.pathname}>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  )
}
