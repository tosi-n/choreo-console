import { NavLink, Navigate, Route, Routes } from 'react-router-dom'

import { EventDetailPage } from './pages/event-detail-page'
import { EventsPage } from './pages/events-page'
import { FunctionsPage } from './pages/functions-page'
import { NotFoundPage } from './pages/not-found-page'
import { OverviewPage } from './pages/overview-page'
import { RunDetailPage } from './pages/run-detail-page'
import { RunsPage } from './pages/runs-page'

function linkClassName({ isActive }: { isActive: boolean }) {
  return isActive ? 'side-link active' : 'side-link'
}

function App() {
  return (
    <div className="console-shell">
      <aside className="side-rail">
        <div className="side-brand">
          <span className="side-brand-name">CHOREO</span>
          <span className="side-brand-sub">Console</span>
        </div>
        <button className="env-switch" type="button">
          Production
        </button>

        <div className="nav-group">
          <p className="nav-group-title">Monitor</p>
          <nav className="side-nav">
            <NavLink className={linkClassName} to="/overview">
              Metrics
            </NavLink>
            <NavLink className={linkClassName} to="/runs">
              Runs
            </NavLink>
            <NavLink className={linkClassName} to="/events">
              Events
            </NavLink>
          </nav>
        </div>

        <div className="nav-group">
          <p className="nav-group-title">Manage</p>
          <nav className="side-nav">
            <NavLink className={linkClassName} to="/functions">
              Functions
            </NavLink>
          </nav>
        </div>

        <div className="side-footer">
          <a href="#" onClick={(event) => event.preventDefault()}>
            Help and Feedback
          </a>
          <div className="user-block">
            <span className="user-avatar">TC</span>
            <div>
              <p className="user-name">Tosin</p>
              <p className="user-role">Operator</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="workspace">
        <main className="workspace-main">
          <Routes>
            <Route path="/" element={<Navigate to="/overview" replace />} />
            <Route path="/overview" element={<OverviewPage />} />
            <Route path="/runs" element={<RunsPage />} />
            <Route path="/runs/:runId" element={<RunDetailPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/:eventId" element={<EventDetailPage />} />
            <Route path="/functions" element={<FunctionsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default App
