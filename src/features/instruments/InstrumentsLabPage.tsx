import { lazy, Suspense, useEffect } from 'react'
import { Link, Route, Routes, useParams } from 'react-router-dom'
import { gateStatus } from '../../content/academy/gates'
import { INSTRUMENTS } from '../../content/instruments'
import { snapshot, useProgress } from '../../store/progressStore'
import type { InstrumentId } from '../../types/domain'
import { GateNotice } from '../academy/GateNotice'

const DmmPanel = lazy(() => import('./DmmPanel'))
const ClampPanel = lazy(() => import('./ClampPanel'))
const ScopePanel = lazy(() => import('./ScopePanel'))
const EsrPanel = lazy(() => import('./EsrPanel'))
const LcrPanel = lazy(() => import('./LcrPanel'))
const BatteryPanel = lazy(() => import('./BatteryPanel'))
const InsulationPanel = lazy(() => import('./InsulationPanel'))
const ComponentTesterPanel = lazy(() => import('./ComponentTesterPanel'))

const PANELS: Record<string, React.ComponentType> = {
  dmm: DmmPanel,
  clamp: ClampPanel,
  scope: ScopePanel,
  esr: EsrPanel,
  lcr: LcrPanel,
  battery: BatteryPanel,
  insulation: InsulationPanel,
  'component-tester': ComponentTesterPanel,
}

const ORDER: (keyof typeof PANELS)[] = ['dmm', 'clamp', 'scope', 'esr', 'lcr', 'battery', 'insulation', 'component-tester']

const loading = <div className="grid h-48 place-items-center text-sm text-ink-400">Loading instrument…</div>

function Breadcrumb({ current }: { current?: string }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-1 text-xs text-ink-500">
      <Link to="/" className="hover:text-ink-300">Dashboard</Link> <span aria-hidden="true">/</span>{' '}
      <Link to="/instruments" className="hover:text-ink-300">Virtual Instruments</Link>
      {current && (
        <>
          {' '}
          <span aria-hidden="true">/</span> <span className="text-ink-300">{current}</span>
        </>
      )}
    </nav>
  )
}

function InstrumentMenu() {
  const visit = useProgress((s) => s.visitModule)
  useEffect(() => {
    visit('instruments')
  }, [visit])
  return (
    <div className="mx-auto max-w-5xl px-4 py-6 lg:px-6">
      <Breadcrumb />
      <h1 className="mt-2 text-xl font-semibold text-ink-100">Virtual Instruments and Measurement Engineering Laboratory</h1>
      <p className="mt-2 max-w-3xl text-sm text-ink-300">
        Eight instruments, each with its own controls, measurement modes and guided exercises. The goal is to become competent at <em>interpreting</em> a measurement — what the reading means, when it is wrong, and what a wrong connection does — not simply at recognising what an instrument looks like.
      </p>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {ORDER.map((id) => {
          const meta = INSTRUMENTS[id as InstrumentId]
          return (
            <li key={id}>
              <Link to={`/instruments/${id}`} className="block min-h-16 rounded-md border border-chassis-600 p-3.5 hover:border-signal-400/50 hover:bg-chassis-800" data-testid={`instrument-tile-${id}`}>
                <div className="text-sm font-medium text-ink-100">{meta.name}</div>
                <div className="mt-0.5 text-xs text-ink-400">{meta.description}</div>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function InstrumentPanelRoute() {
  const { id = '' } = useParams()
  const visit = useProgress((s) => s.visitModule)
  const gate = gateStatus(snapshot(useProgress()), 'instrument')
  useEffect(() => {
    visit('instruments')
  }, [visit])
  const meta = INSTRUMENTS[id as InstrumentId]
  const Panel = PANELS[id]
  if (!meta || !Panel) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-6 lg:px-6">
        <Breadcrumb />
        <p className="mt-4 text-sm text-ink-400">Unknown instrument "{id}". <Link to="/instruments" className="text-signal-300 hover:underline">Back to the instruments menu.</Link></p>
      </div>
    )
  }
  return (
    <div className="mx-auto max-w-5xl px-4 py-6 lg:px-6">
      <Breadcrumb current={meta.name} />
      <h1 className="mt-2 text-xl font-semibold text-ink-100">{meta.name}</h1>
      <p className="mt-1 max-w-3xl text-sm text-ink-400">{meta.description}</p>
      {gate.open ? (
        <div className="mt-5">
          <Suspense fallback={loading}>
            <Panel />
          </Suspense>
        </div>
      ) : (
        <GateNotice status={gate} activity="Operating this instrument" />
      )}
    </div>
  )
}

/** Phase 8 Virtual Instruments and Measurement Engineering Laboratory. */
export default function InstrumentsLabPage() {
  return (
    <Routes>
      <Route index element={<InstrumentMenu />} />
      <Route path=":id" element={<InstrumentPanelRoute />} />
    </Routes>
  )
}
