import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { ChoreoApiError, choreoClient } from '../api/client'
import { useStimulirTracesQuery, useStimulirWorkerStatusQuery } from '../features/stimulir/queries'

const MAX_ROWS = 100

function formatDate(value: string | null | undefined): string {
  if (!value) {
    return '—'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleString()
}

function formatDuration(durationMs: number | null | undefined): string {
  if (!durationMs || durationMs <= 0) {
    return '—'
  }

  if (durationMs < 1_000) {
    return `${durationMs}ms`
  }

  const seconds = Math.floor(durationMs / 1_000)
  if (seconds < 60) {
    return `${seconds}s`
  }

  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}m ${remainingSeconds}s`
}

function statusClassName(status: string): string {
  switch (status.toLowerCase()) {
    case 'completed':
      return 'status-pill completed'
    case 'running':
      return 'status-pill running'
    case 'failed':
      return 'status-pill failed'
    case 'cancelled':
      return 'status-pill cancelled'
    default:
      return 'status-pill neutral'
  }
}

export function RunsPage() {
  const navigate = useNavigate()
  const [runIdInput, setRunIdInput] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [providerFilter, setProviderFilter] = useState('all')
  const [searchFilter, setSearchFilter] = useState('')

  const traces = useStimulirTracesQuery({
    status: statusFilter,
    modelProvider: providerFilter,
    limit: MAX_ROWS,
    offset: 0,
  })
  const workerStatus = useStimulirWorkerStatusQuery()

  const tracesErrorStatus = traces.error instanceof ChoreoApiError ? traces.error.status : undefined

  const filteredRows = useMemo(() => {
    const data = traces.data ?? []
    const term = searchFilter.trim().toLowerCase()

    if (!term) {
      return data
    }

    return data.filter((trace) => {
      return [
        trace.id,
        trace.task_id ?? '',
        trace.durable_session_id ?? '',
        trace.title ?? '',
        trace.context_type ?? '',
        trace.model_provider ?? '',
        trace.status,
      ].some((value) => value.toLowerCase().includes(term))
    })
  }, [searchFilter, traces.data])

  function onQuickOpen(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = runIdInput.trim()
    if (!trimmed) {
      return
    }
    navigate(`/runs/${encodeURIComponent(trimmed)}`)
  }

  return (
    <section className="control-page">
      <header className="page-toolbar">
        <h1>Runs</h1>
        <div className="toolbar-actions">
          <button className="ghost-btn" type="button" onClick={() => traces.refetch()}>
            Refresh runs
          </button>
          <button className="ghost-btn" type="button" onClick={() => workerStatus.refetch()}>
            Refresh worker
          </button>
        </div>
      </header>

      <div className="status-strip">
        <span>
          Source <strong>{choreoClient.config.stimulirBaseUrl}</strong>
        </span>
        {workerStatus.data && (
          <>
            <span>
              Worker <strong>{workerStatus.data.worker_running ? 'running' : 'stopped'}</strong>
            </span>
            <span>
              Orchestrator <strong>{workerStatus.data.orchestrator}</strong>
            </span>
            <span>
              Queued <strong>{workerStatus.data.tasks_queued}</strong>
            </span>
            <span>
              Executing <strong>{workerStatus.data.tasks_executing}</strong>
            </span>
          </>
        )}
      </div>

      <form className="filter-row" onSubmit={onQuickOpen}>
        <input
          id="run-id-input"
          value={runIdInput}
          onChange={(event) => setRunIdInput(event.target.value)}
          placeholder="Run or trace ID (quick open)"
        />
        <input
          value={searchFilter}
          onChange={(event) => setSearchFilter(event.target.value)}
          placeholder="Filter rows by status, provider, title, ID"
        />
        <select className="filter-select" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
          <option value="all">Status: All</option>
          <option value="running">Status: Running</option>
          <option value="completed">Status: Completed</option>
          <option value="failed">Status: Failed</option>
          <option value="cancelled">Status: Cancelled</option>
        </select>
        <select className="filter-select" value={providerFilter} onChange={(event) => setProviderFilter(event.target.value)}>
          <option value="all">Provider: All</option>
          <option value="research_worker">research_worker</option>
          <option value="bookkeeper_worker">bookkeeper_worker</option>
        </select>
        <button className="mini-btn" type="submit">
          Open ID
        </button>
      </form>

      <article className="panel">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Run ID</th>
                <th>Trigger</th>
                <th>Function</th>
                <th>Queued at</th>
                <th>Ended at</th>
              </tr>
            </thead>
            <tbody>
              {traces.isLoading && (
                <tr>
                  <td colSpan={6}>
                    <div className="table-empty">
                      <p>Loading historical runs...</p>
                    </div>
                  </td>
                </tr>
              )}
              {traces.isError && (
                <tr>
                  <td colSpan={6}>
                    <div className="table-empty">
                      <p>Could not load runs from Stimulir traces.</p>
                      {tracesErrorStatus === 401 ? (
                        <p className="subtle">
                          Endpoint is protected in this environment.
                        </p>
                      ) : (
                        <p className="subtle">Check Stimulir backend availability on <code>{choreoClient.config.stimulirBaseUrl}</code>.</p>
                      )}
                    </div>
                  </td>
                </tr>
              )}
              {!traces.isLoading && !traces.isError && filteredRows.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <div className="table-empty">
                      <p>No runs match current filters.</p>
                    </div>
                  </td>
                </tr>
              )}
              {!traces.isLoading &&
                !traces.isError &&
                filteredRows.map((trace) => (
                  <tr key={trace.id}>
                    <td>
                      <span className={statusClassName(trace.status)}>{trace.status}</span>
                    </td>
                    <td>
                      <Link className="run-link" to={`/runs/${encodeURIComponent(trace.id)}`}>
                        {trace.id}
                      </Link>
                    </td>
                    <td>{trace.context_type ?? '—'}</td>
                    <td>{trace.title ?? trace.prompt_key ?? trace.model_provider ?? '—'}</td>
                    <td>{formatDate(trace.created_at)}</td>
                    <td>{trace.completed_at ? `${formatDate(trace.completed_at)} (${formatDuration(trace.duration_ms)})` : '—'}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  )
}
