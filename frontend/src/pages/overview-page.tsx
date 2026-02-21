import type { CSSProperties } from 'react'

import { choreoClient } from '../api/client'
import { useFunctionsQuery } from '../features/functions/queries'
import { useHealthQuery } from '../features/health/queries'

export function OverviewPage() {
  const health = useHealthQuery()
  const functions = useFunctionsQuery()

  const healthStatus = health.isSuccess ? health.data.status : 'unreachable'
  const databaseStatus = health.isSuccess ? health.data.database : 'unknown'
  const registeredFunctions = functions.data ?? []
  const totalFunctions = registeredFunctions.length

  const eventTriggerCount = registeredFunctions.reduce(
    (count, fn) => count + fn.triggers.filter((trigger) => trigger.type === 'event').length,
    0,
  )
  const scheduleTriggerCount = registeredFunctions.reduce(
    (count, fn) => count + fn.triggers.filter((trigger) => trigger.type === 'schedule').length,
    0,
  )
  const otherTriggerCount = registeredFunctions.reduce(
    (count, fn) => count + fn.triggers.filter((trigger) => trigger.type !== 'event' && trigger.type !== 'schedule').length,
    0,
  )
  const totalTriggers = eventTriggerCount + scheduleTriggerCount + otherTriggerCount

  const eventPercent = totalTriggers > 0 ? (eventTriggerCount / totalTriggers) * 100 : 34
  const schedulePercent = totalTriggers > 0 ? (scheduleTriggerCount / totalTriggers) * 100 : 67
  const eventEnd = `${eventPercent.toFixed(2)}%`
  const scheduleEnd = `${(eventPercent + schedulePercent).toFixed(2)}%`

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
              <h3>Functions Coverage</h3>
            </header>
            <div className="donut-wrap">
              <div className="donut" style={{ '--seg-a-end': eventEnd, '--seg-b-end': scheduleEnd } as CSSProperties}>
                <span>Total runs</span>
                <strong>{totalFunctions}</strong>
              </div>
              <ul className="legend-list">
                <li>Functions {totalFunctions}</li>
                <li>Event triggers {eventTriggerCount}</li>
                <li>Schedule triggers {scheduleTriggerCount}</li>
                <li>Other triggers {otherTriggerCount}</li>
                <li>Database {databaseStatus}</li>
              </ul>
            </div>
          </article>
          <article className="panel">
            <header className="panel-header">
              <h3>Registered Functions</h3>
              <button className="mini-btn" type="button" onClick={() => functions.refetch()}>
                Refresh
              </button>
            </header>
            <div className="overview-list">
              {functions.isLoading && <p className="subtle">Loading function registry...</p>}
              {functions.isError && (
                <p className="subtle">Could not load functions from <code>GET /functions</code>.</p>
              )}
              {!functions.isLoading && !functions.isError && totalFunctions === 0 && (
                <p className="subtle">No registered functions yet.</p>
              )}
              {!functions.isLoading && !functions.isError && totalFunctions > 0 && (
                <ul className="compact-list">
                  {registeredFunctions.slice(0, 8).map((fn) => (
                    <li key={fn.id}>
                      <div>
                        <strong>{fn.name}</strong>
                        <p className="subtle">{fn.id}</p>
                      </div>
                      <span>{fn.triggers.length} trigger(s)</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </article>
        </div>
      </section>

      <section className="section-block">
        <h2>Volume</h2>
        <div className="card-grid two-up">
          <article className="panel">
            <header className="panel-header">
              <h3>Event-triggered Functions</h3>
            </header>
            <div className="chart-placeholder">
              <div className="metric-stack">
                <strong>{eventTriggerCount}</strong>
                <span>Functions listening to events</span>
              </div>
            </div>
          </article>
          <article className="panel">
            <header className="panel-header">
              <h3>Endpoint Availability</h3>
            </header>
            <div className="chart-placeholder">
              <div className="metric-stack">
                <strong>GET /functions</strong>
                <span>Available in current Choreo build</span>
                <span className="subtle">Run/Event list endpoints are not exposed by v0.1.4.</span>
              </div>
            </div>
          </article>
        </div>
      </section>
    </section>
  )
}
