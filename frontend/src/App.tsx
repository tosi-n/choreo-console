import { NavLink, Navigate, Route, Routes } from 'react-router-dom'

import { EventsPage } from './pages/events-page'
import { FunctionsPage } from './pages/functions-page'
import { NotFoundPage } from './pages/not-found-page'
import { OverviewPage } from './pages/overview-page'
import { RunDetailPage } from './pages/run-detail-page'
import { RunsPage } from './pages/runs-page'

function linkClassName({ isActive }: { isActive: boolean }) {
  return isActive ? 'nav-link active' : 'nav-link'
}

function App() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <strong>Choreo Console</strong>
          <span>Frontend foundation</span>
        </div>
        <nav className="app-nav">
          <NavLink className={linkClassName} to="/overview">
            Overview
          </NavLink>
          <NavLink className={linkClassName} to="/runs">
            Runs
          </NavLink>
          <NavLink className={linkClassName} to="/events">
            Events
          </NavLink>
          <NavLink className={linkClassName} to="/functions">
            Functions
          </NavLink>
        </nav>
      </header>
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Navigate to="/overview" replace />} />
          <Route path="/overview" element={<OverviewPage />} />
          <Route path="/runs" element={<RunsPage />} />
          <Route path="/runs/:runId" element={<RunDetailPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/functions" element={<FunctionsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
