import { lazy, Suspense } from 'react'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './app/layout/AppShell'
import { MODULES } from './content/modules'
import { DashboardPage } from './features/dashboard/DashboardPage'
import { ModulePage } from './features/modules/ModulePage'
import { ProgressPage } from './features/progress/ProgressPage'

/** The 3D lab (Three.js, R3F, drei) and the component library (full component database) are code-split so the dashboard stays light. */
const Lab3DPage = lazy(() => import('./features/lab3d/Lab3DPage'))
const LibraryPage = lazy(() => import('./features/library/LibraryPage'))
const ComponentDetailPage = lazy(() => import('./features/library/ComponentDetailPage'))
const ComparePage = lazy(() => import('./features/library/ComparePage'))
const CircuitLabPage = lazy(() => import('./features/circuit-lab/CircuitLabPage'))
const BuildPage = lazy(() => import('./features/build/BuildPage'))
const AcademyRouter = lazy(() => import('./features/academy/AcademyPages'))
const SolarPage = lazy(() => import('./features/solar/SolarPage'))
const InstrumentsLabPage = lazy(() => import('./features/instruments/InstrumentsLabPage'))
const pageLoading = <div className="grid h-64 place-items-center text-sm text-ink-400">Loading…</div>
const cktLoading = <div className="grid h-64 place-items-center text-sm text-ink-400">Loading the circuit laboratory…</div>
const libLoading = <div className="grid h-64 place-items-center text-sm text-ink-400">Loading the component library…</div>
const loading = <div className="grid h-64 place-items-center text-sm text-ink-400">Loading the 3D laboratory…</div>

/** Hash routing keeps deep links working on any static host without server rewrites. */
export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<DashboardPage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route
            path="/lab-3d"
            element={
              <Suspense fallback={loading}>
                <Lab3DPage />
              </Suspense>
            }
          />
          <Route path="/components" element={<Suspense fallback={libLoading}><LibraryPage /></Suspense>} />
          <Route path="/components/compare" element={<Suspense fallback={libLoading}><ComparePage /></Suspense>} />
          <Route path="/components/:id" element={<Suspense fallback={libLoading}><ComponentDetailPage /></Suspense>} />
          <Route path="/circuit-lab" element={<Suspense fallback={cktLoading}><CircuitLabPage /></Suspense>} />
          <Route path="/build" element={<Suspense fallback={pageLoading}><BuildPage /></Suspense>} />
          <Route path="/academy/*" element={<Suspense fallback={pageLoading}><AcademyRouter /></Suspense>} />
          <Route path="/solar" element={<Suspense fallback={pageLoading}><SolarPage /></Suspense>} />
          <Route path="/instruments/*" element={<Suspense fallback={pageLoading}><InstrumentsLabPage /></Suspense>} />
          {MODULES.filter((m) => !['dashboard', 'progress', 'lab3d', 'components', 'circuit-lab', 'build', 'academy', 'solar', 'instruments'].includes(m.id)).map((m) => (
            <Route key={m.id} path={m.path} element={<ModulePage moduleId={m.id} />} />
          ))}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
