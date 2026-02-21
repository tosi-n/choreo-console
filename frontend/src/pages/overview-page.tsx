import { choreoClient } from '../api/client'
import { useHealthQuery } from '../features/health/queries'

export function OverviewPage() {
  const health = useHealthQuery()

  const healthStatus = health.isSuccess ? health.data.status : 'unreachable'
  const databaseStatus = health.isSuccess ? health.data.database : 'unknown'

  return (
    <section className="control-page">
      <header className="page-toolbar">
        <h1>Metrics</h1>
        <div className="toolbar-actions">
          <button className="ghost-btn" type="button" onClick={() => health.refetch()}>
            Refresh page
          </button>
          <button className="icon-btn" type="button" aria-label="settings">
            ⚙
          </button>
        </div>
      </header>

      <div className="filter-row">
        <button className="filter-pill active" type="button">
          Last 24h
        </button>
        <button className="filter-pill" type="button">
          App: All
        </button>
        <button className="filter-pill" type="button">
          Function: All
        </button>
      </div>

      <div className="status-strip">
        <span>
          API <strong>{choreoClient.config.baseUrl}</strong>
        </span>
        <span>
          Service <strong>{healthStatus}</strong>
        </span>
        <span>
          Database <strong>{databaseStatus}</strong>
        </span>
      </div>

      {health.isError && (
        <div className="callout-error">Backend unavailable. Could not reach {choreoClient.config.baseUrl}.</div>
      )}

      <section className="section-block">
        <h2>Overview</h2>
        <div className="card-grid two-up">
          <article className="panel">
            <header className="panel-header">
              <h3>Functions Status</h3>
            </header>
            <div className="donut-wrap">
              <div className="donut">
                <span>Total runs</span>
                <strong>0</strong>
              </div>
              <ul className="legend-list">
                <li>Completed 0%</li>
                <li>Cancelled 0%</li>
                <li>Failed 0%</li>
                <li>Running 0%</li>
                <li>Queued 0%</li>
              </ul>
            </div>
          </article>
          <article className="panel">
            <header className="panel-header">
              <h3>Failed Functions</h3>
              <button className="mini-btn" type="button">
                View all
              </button>
            </header>
            <div className="empty-table">
              <p>No data found</p>
            </div>
          </article>
        </div>
      </section>

      <section className="section-block">
        <h2>Volume</h2>
        <div className="card-grid two-up">
          <article className="panel">
            <header className="panel-header">
              <h3>Total runs throughput</h3>
            </header>
            <div className="chart-placeholder">
              <div className="chart-line" />
            </div>
          </article>
          <article className="panel">
            <header className="panel-header">
              <h3>Total steps throughput</h3>
            </header>
            <div className="chart-placeholder">
              <div className="chart-line" />
            </div>
          </article>
        </div>
      </section>
    </section>
  )
}

