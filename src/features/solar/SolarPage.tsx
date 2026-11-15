import { lazy, Suspense, useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { gateStatus } from '../../content/academy/gates'
import { snapshot, useProgress } from '../../store/progressStore'
import { SafetyNotice } from '../../ui/primitives'
import { GateNotice } from '../academy/GateNotice'

const DesignTab = lazy(() => import('./DesignTab'))
const IvTab = lazy(() => import('./IvTab'))
const EnergyTab = lazy(() => import('./EnergyTab'))
const FaultTab = lazy(() => import('./FaultTab'))
const CommissionTab = lazy(() => import('./CommissionTab'))

const TABS = [
  { id: 'design', label: 'System design', hint: 'Load profile → complete system' },
  { id: 'iv', label: 'PV I–V laboratory', hint: 'Curves, MPPT and PWM' },
  { id: 'energy', label: 'Energy management', hint: '24–72 h simulation' },
  { id: 'faults', label: 'Troubleshooting', hint: 'Diagnose faults' },
  { id: 'commission', label: 'Commissioning', hint: 'Predict, measure, record' },
] as const
type TabId = (typeof TABS)[number]['id']

/** Phase 7 Solar and Hybrid Engineering Laboratory. */
export default function SolarPage() {
  const visit = useProgress((s) => s.visitModule)
  const gate = gateStatus(snapshot(useProgress()), 'solar')
  const [params, setParams] = useSearchParams()
  const initial = (TABS.find((t) => t.id === params.get('tab'))?.id ?? 'design') as TabId
  const [tab, setTab] = useState<TabId>(initial)
  useEffect(() => {
    visit('solar')
  }, [visit])
  const choose = (t: TabId) => {
    setTab(t)
    setParams(t === 'design' ? {} : { tab: t }, { replace: true })
  }
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 lg:px-6">
      <nav aria-label="Breadcrumb" className="mb-1 text-xs text-ink-500">
        <Link to="/" className="hover:text-ink-300">
          Dashboard
        </Link>{' '}
        / <span className="text-ink-300">Solar and Hybrid Engineering Laboratory</span>
      </nav>
      <h1 className="text-[26px] font-semibold">Solar and Hybrid Engineering Laboratory</h1>
      <p className="mt-1 max-w-3xl text-ink-400">
        Start from an actual load profile and calculate a complete installation: inverter, battery bank, PV array and strings, charge controller, cables, fuses, isolators and generator. Then trace PV I–V curves, watch MPPT and PWM controllers work, simulate energy flows through off-grid, grid-tied and hybrid systems, diagnose faults and commission the design. Taught in course{' '}
        <Link to="/academy/S2" className="text-signal-300 hover:underline">
          S2 Solar PV and Hybrid Engineering
        </Link>
        .
      </p>
      <div className="mt-4">
        <SafetyNotice tone="danger">
          <strong>Simulated only.</strong> PV arrays are live whenever light falls on them and cannot be switched off at the modules; strings above 120 V DC and battery banks are hazardous. Designs here are educational estimates. Real installations are designed to the applicable standards with the manufacturers’ data, and installed, inspected and certified by qualified persons.
        </SafetyNotice>
      </div>
      {!gate.open ? (
        <GateNotice status={gate} activity="The solar and hybrid laboratory" />
      ) : (
        <>
          <div role="tablist" aria-label="Solar laboratory sections" className="mt-5 flex flex-wrap gap-2" data-testid="solar-tabs">
            {TABS.map((t) => (
              <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} title={t.hint} onClick={() => choose(t.id)} className={`min-h-10 rounded-md border px-3 text-sm ${tab === t.id ? 'border-signal-400 bg-signal-500/20 text-ink-100' : 'border-chassis-600 bg-chassis-800 text-ink-400 hover:text-ink-100'}`} data-testid={`tab-${t.id}`}>
                {t.label}
              </button>
            ))}
          </div>
          <div className="mt-4" role="tabpanel">
            <Suspense fallback={<div className="grid h-40 place-items-center text-sm text-ink-400">Loading…</div>}>
              {tab === 'design' && <DesignTab />}
              {tab === 'iv' && <IvTab />}
              {tab === 'energy' && <EnergyTab />}
              {tab === 'faults' && <FaultTab />}
              {tab === 'commission' && <CommissionTab />}
            </Suspense>
          </div>
        </>
      )}
    </div>
  )
}
