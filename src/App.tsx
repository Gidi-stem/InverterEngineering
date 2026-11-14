import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './app/layout/AppShell'
import { MODULES } from './content/modules'
import { DashboardPage } from './features/dashboard/DashboardPage'
import { ModulePage } from './features/modules/ModulePage'
import { ProgressPage } from './features/progress/ProgressPage'

/** Hash routing keeps deep links working on any static host without server rewrites. */
export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<DashboardPage />} />
          <Route path="/progress" element={<ProgressPage />} />
          {MODULES.filter((m) => m.id !== 'dashboard' && m.id !== 'progress').map((m) => (
            <Route key={m.id} path={m.path} element={<ModulePage moduleId={m.id} />} />
          ))}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
