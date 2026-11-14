import { lazy, Suspense } from 'react'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './app/layout/AppShell'
import { MODULES } from './content/modules'
import { DashboardPage } from './features/dashboard/DashboardPage'
import { ModulePage } from './features/modules/ModulePage'
import { ProgressPage } from './features/progress/ProgressPage'

/** The 3D lab (Three.js, R3F, drei) is code-split so the dashboard stays light. */
const Lab3DPage = lazy(() => import('./features/lab3d/Lab3DPage'))
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
          {MODULES.filter((m) => !['dashboard', 'progress', 'lab3d'].includes(m.id)).map((m) => (
            <Route key={m.id} path={m.path} element={<ModulePage moduleId={m.id} />} />
          ))}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
