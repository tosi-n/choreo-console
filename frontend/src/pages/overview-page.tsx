import type { CSSProperties } from 'react'
import { useMemo } from 'react'

import { ChoreoApiError, choreoClient } from '../api/client'
import { useFunctionsQuery } from '../features/functions/queries'
import { useHealthQuery } from '../features/health/queries'
import { useStimulirTracesQuery, useStimulirWorkerStatusQuery } from '../features/stimulir/queries'

export function OverviewPage() {
  const health = useHealthQuery()
  const functions = useFunctionsQuery()
  const traces = useStimulirTracesQuery({
    status: 'all',
    modelProvider: 'all',
    limit: 100,
  })
  const workerStatus = useStimulirWorkerStatusQuery()

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
  const tracesErrorStatus = traces.error instanceof ChoreoApiError ? traces.error.status : undefined
  const hasTraceMetrics = traces.isSuccess

  const traceStats = useMemo(() => {
    const data = traces.data ?? []
    const stats = {
      total: data.length,
      completed: 0,
      running: 0,
      failed: 0,
      other: 0,
    }

    for (const trace of data) {
      const status = trace.status.toLowerCase()
      if (status === 'completed') {
        stats.completed += 1
      } else if (status === 'running') {
        stats.running += 1
      } else if (status === 'failed') {
        stats.failed += 1
      } else {
        stats.other += 1
      }
    }

    return stats
  }, [traces.data])

  const primaryTotal = hasTraceMetrics ? traceStats.total : totalTriggers
  const segmentA = primaryTotal > 0 ? ((hasTraceMetrics ? traceStats.completed : eventTriggerCount) / primaryTotal) * 100 : 34
  const segmentBValue = primaryTotal > 0 ? ((hasTraceMetrics ? traceStats.running : scheduleTriggerCount) / primaryTotal) * 100 : 33
  const segmentAEnd = `${segmentA.toFixed(2)}%`
  const segmentBEnd = `${(segmentA + segmentBValue).toFixed(2)}%`

  function refreshPageData() {
    void health.refetch()
    void functions.refetch()
    void traces.refetch()
    void workerStatus.refetch()
  }

  return (
    <section className="control-page">
      <header className="page-toolbar">
        <h1>Metrics</h1>
        <div className="toolbar-actions">
          <button className="ghost-btn" type="button" onClick={refreshPageData}>
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
        <span>
          Runs source{' '}
          <strong>{choreoClient.config.stimulirBaseUrl}</strong>
        </span>
      </div>
      {tracesErrorStatus === 401 && (
        <div className="callout-error">
          Stimulir run metrics endpoint is protected in this environment.
        </div>
      )}

      {health.isError && (
        <div className="callout-error">Backend unavailable. Could not reach {choreoClient.config.baseUrl}.</div>
      )}

      <section className="section-block">
        <h2>Overview</h2>
        <div className="card-grid two-up">
          <article className="panel">
            <header className="panel-header">
              <h3>{hasTraceMetrics ? 'Run Status Mix' : 'Functions Coverage'}</h3>
            </header>
            <div className="donut-wrap">
              <div className="donut" style={{ '--seg-a-end': segmentAEnd, '--seg-b-end': segmentBEnd } as CSSProperties}>
                <span>{hasTraceMetrics ? 'Total runs' : 'Total functions'}</span>
                <strong>{hasTraceMetrics ? traceStats.total : totalFunctions}</strong>
              </div>
              <ul className="legend-list">
                {hasTraceMetrics ? (
                  <>
                    <li>Completed {traceStats.completed}</li>
                    <li>Running {traceStats.running}</li>
                    <li>Failed {traceStats.failed}</li>
                    <li>Other {traceStats.other}</li>
                    <li>Database {databaseStatus}</li>
                  </>
                ) : (
                  <>
                    <li>Functions {totalFunctions}</li>
                    <li>Event triggers {eventTriggerCount}</li>
                    <li>Schedule triggers {scheduleTriggerCount}</li>
                    <li>Other triggers {otherTriggerCount}</li>
                    <li>Database {databaseStatus}</li>
                  </>
                )}
              </ul>
            </div>
          </article>
          <article className="panel">
            <header className="panel-header">
              <h3>{hasTraceMetrics ? 'Recent Runs' : 'Registered Functions'}</h3>
              <button
                className="mini-btn"
                type="button"
                onClick={() => (hasTraceMetrics ? traces.refetch() : functions.refetch())}
              >
                Refresh
              </button>
            </header>
            <div className="overview-list">
              {hasTraceMetrics ? (
                <>
                  {traces.isLoading && <p className="subtle">Loading trace runs...</p>}
                  {traces.isError && (
                    <p className="subtle">
                      Could not load <code>GET /api/v1/admin/traces</code>.
                    </p>
                  )}
                  {!traces.isLoading && !traces.isError && traceStats.total === 0 && (
                    <p className="subtle">No run traces found yet.</p>
                  )}
                  {!traces.isLoading && !traces.isError && traceStats.total > 0 && (
                    <ul className="compact-list">
                      {(traces.data ?? []).slice(0, 8).map((trace) => (
                        <li key={trace.id}>
                          <div>
                            <strong>{trace.title ?? trace.model_provider ?? trace.id}</strong>
                            <p className="subtle">{trace.id}</p>
                          </div>
                          <span>{trace.status}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <>
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
                </>
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
              <h3>{hasTraceMetrics ? 'Worker Queue' : 'Event-triggered Functions'}</h3>
            </header>
            <div className="chart-placeholder">
              <div className="metric-stack">
                <strong>{hasTraceMetrics ? (workerStatus.data?.tasks_queued ?? '—') : eventTriggerCount}</strong>
                <span>{hasTraceMetrics ? 'Queued tasks in worker' : 'Functions listening to events'}</span>
              </div>
            </div>
          </article>
          <article className="panel">
            <header className="panel-header">
              <h3>{hasTraceMetrics ? 'Worker Execution' : 'Endpoint Availability'}</h3>
            </header>
            <div className="chart-placeholder">
              <div className="metric-stack">
                {hasTraceMetrics ? (
                  <>
                    <strong>{workerStatus.data?.tasks_executing ?? '—'}</strong>
                    <span>Active task executions</span>
                    <span className="subtle">Failed: {workerStatus.data?.tasks_failed ?? '—'}</span>
                  </>
                ) : (
                  <>
                    <strong>GET /functions</strong>
                    <span>Available in current Choreo build</span>
                    <span className="subtle">Run/Event list endpoints are not exposed by v0.1.4.</span>
                  </>
                )}
              </div>
            </div>
          </article>
        </div>
      </section>
    </section>
  )
}
