import type { CSSProperties } from 'react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { choreoClient } from '../api/client'
import { useFunctionsQuery } from '../features/functions/queries'
import { useHealthQuery } from '../features/health/queries'
import { useRunsQuery } from '../features/runs/queries'

function toTimestamp(value: string | null | undefined): number {
  if (!value) {
    return 0
  }
  const parsed = new Date(value).getTime()
  return Number.isFinite(parsed) ? parsed : 0
}

function formatDate(value: string | null | undefined): string {
  if (!value) {
    return '—'
  }
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return value
  }
  return parsed.toLocaleString()
}

export function OverviewPage() {
  const [windowHours, setWindowHours] = useState(24)
  const [functionFilter, setFunctionFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const health = useHealthQuery()
  const functions = useFunctionsQuery()
  const runs = useRunsQuery({ limit: 500 })

  const registeredFunctions = functions.data ?? []
  const functionOptions = useMemo(
    () => registeredFunctions.map((fn) => fn.id).sort((a, b) => a.localeCompare(b)),
    [registeredFunctions],
  )

  const filteredRuns = useMemo(() => {
    const now = Date.now()
    const cutoff = now - windowHours * 60 * 60 * 1_000
    return (runs.data ?? []).filter((run) => {
      const ts = toTimestamp(run.created_at)
      const inWindow = ts === 0 ? true : ts >= cutoff
      const statusMatches = statusFilter === 'all' ? true : run.status.toLowerCase() === statusFilter
      const functionMatches = functionFilter === 'all' ? true : run.function_id === functionFilter
      return inWindow && statusMatches && functionMatches
    })
  }, [functionFilter, runs.data, statusFilter, windowHours])

  const runStats = useMemo(() => {
    const stats = {
      total: filteredRuns.length,
      completed: 0,
      running: 0,
      failed: 0,
      cancelled: 0,
      other: 0,
    }
    for (const run of filteredRuns) {
      switch (run.status.toLowerCase()) {
        case 'completed':
          stats.completed += 1
          break
        case 'running':
          stats.running += 1
          break
        case 'failed':
          stats.failed += 1
          break
        case 'cancelled':
          stats.cancelled += 1
          break
        default:
          stats.other += 1
      }
    }
    return stats
  }, [filteredRuns])

  const totalFunctions = registeredFunctions.length
  const eventTriggerCount = registeredFunctions.reduce(
    (count, fn) => count + fn.triggers.filter((trigger) => trigger.type === 'event').length,
    0,
  )
  const scheduleTriggerCount = registeredFunctions.reduce(
    (count, fn) => count + fn.triggers.filter((trigger) => trigger.type === 'schedule').length,
    0,
  )

  const segmentA = runStats.total > 0 ? (runStats.completed / runStats.total) * 100 : 0
  const segmentBValue = runStats.total > 0 ? (runStats.running / runStats.total) * 100 : 0
  const segmentAEnd = `${segmentA.toFixed(2)}%`
  const segmentBEnd = `${(segmentA + segmentBValue).toFixed(2)}%`

  const recentFailedRuns = useMemo(
    () =>
      filteredRuns
        .filter((run) => run.status.toLowerCase() === 'failed')
        .sort((a, b) => toTimestamp(b.created_at) - toTimestamp(a.created_at))
        .slice(0, 8),
    [filteredRuns],
  )

  const healthStatus = health.isSuccess ? health.data.status : 'unreachable'
  const databaseStatus = health.isSuccess ? health.data.database : 'unknown'

  function refreshPageData() {
    void health.refetch()
    void functions.refetch()
    void runs.refetch()
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
        <select className="filter-select" value={String(windowHours)} onChange={(event) => setWindowHours(Number(event.target.value))}>
          <option value="24">Last 24h</option>
          <option value="72">Last 3d</option>
          <option value="168">Last 7d</option>
        </select>
        <select className="filter-select" value={functionFilter} onChange={(event) => setFunctionFilter(event.target.value)}>
          <option value="all">Function: All</option>
          {functionOptions.map((functionId) => (
            <option key={functionId} value={functionId}>
              Function: {functionId}
            </option>
          ))}
        </select>
        <select className="filter-select" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
          <option value="all">Status: All</option>
          <option value="running">Status: Running</option>
          <option value="completed">Status: Completed</option>
          <option value="failed">Status: Failed</option>
          <option value="cancelled">Status: Cancelled</option>
        </select>
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
          Runs loaded <strong>{runs.data?.length ?? 0}</strong>
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
              <h3>Run Status Mix</h3>
            </header>
            <div className="donut-wrap">
              <div className="donut" style={{ '--seg-a-end': segmentAEnd, '--seg-b-end': segmentBEnd } as CSSProperties}>
                <span>Total runs</span>
                <strong>{runStats.total}</strong>
              </div>
              <ul className="legend-list">
                <li>Completed {runStats.completed}</li>
                <li>Running {runStats.running}</li>
                <li>Failed {runStats.failed}</li>
                <li>Cancelled {runStats.cancelled}</li>
                <li>Other {runStats.other}</li>
              </ul>
            </div>
          </article>

          <article className="panel">
            <header className="panel-header">
              <h3>Recent Failed Runs</h3>
              <button className="mini-btn" type="button" onClick={() => runs.refetch()}>
                Refresh
              </button>
            </header>
            <div className="overview-list">
              {runs.isLoading && <p className="subtle">Loading runs...</p>}
              {runs.isError && <p className="subtle">Could not load runs from <code>GET /runs</code>.</p>}
              {!runs.isLoading && !runs.isError && recentFailedRuns.length === 0 && (
                <p className="subtle">No failed runs in this window.</p>
              )}
              {!runs.isLoading && !runs.isError && recentFailedRuns.length > 0 && (
                <ul className="compact-list">
                  {recentFailedRuns.map((run) => (
                    <li key={run.id}>
                      <div>
                        <strong>{run.function_id}</strong>
                        <p className="subtle">{run.id}</p>
                      </div>
                      <Link className="mini-btn inline-btn" to={`/runs/${run.id}`}>
                        View
                      </Link>
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
              <h3>Total Runs Throughput</h3>
            </header>
            <div className="chart-placeholder">
              <div className="metric-stack">
                <strong>{runStats.total}</strong>
                <span>Runs created in selected window</span>
                <span className="subtle">Failed: {runStats.failed}</span>
              </div>
            </div>
          </article>

          <article className="panel">
            <header className="panel-header">
              <h3>Function Inventory</h3>
            </header>
            <div className="chart-placeholder">
              <div className="metric-stack">
                <strong>{totalFunctions}</strong>
                <span>Registered functions</span>
                <span className="subtle">Event triggers: {eventTriggerCount}</span>
                <span className="subtle">Schedules: {scheduleTriggerCount}</span>
                <span className="subtle">
                  Latest run: {filteredRuns[0] ? formatDate(filteredRuns[0].created_at) : '—'}
                </span>
              </div>
            </div>
          </article>
        </div>
      </section>
    </section>
  )
}
