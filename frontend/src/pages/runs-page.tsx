import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { useFunctionsQuery } from '../features/functions/queries'
import { useCancelRunMutation, useRunsQuery } from '../features/runs/queries'

const DEFAULT_ROWS = 200

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
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  return date.toLocaleString()
}

function formatDuration(startedAt: string | null | undefined, endedAt: string | null | undefined): string {
  const start = toTimestamp(startedAt)
  const end = toTimestamp(endedAt)
  if (start <= 0 || end <= 0 || end < start) {
    return '—'
  }
  const durationMs = end - start
  if (durationMs < 1_000) {
    return `${durationMs}ms`
  }
  const seconds = Math.floor(durationMs / 1_000)
  if (seconds < 60) {
    return `${seconds}s`
  }
  const minutes = Math.floor(seconds / 60)
  const remaining = seconds % 60
  return `${minutes}m ${remaining}s`
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

function canCancel(status: string): boolean {
  const normalized = status.toLowerCase()
  return normalized === 'queued' || normalized === 'running'
}

function RunsRowActions(props: { runId: string; status: string }) {
  const cancel = useCancelRunMutation(props.runId)
  const disabled = !canCancel(props.status) || cancel.isPending

  return (
    <button className="mini-btn" type="button" disabled={disabled} onClick={() => cancel.mutate()}>
      {cancel.isPending ? 'Cancelling...' : 'Cancel'}
    </button>
  )
}

export function RunsPage() {
  const navigate = useNavigate()
  const functions = useFunctionsQuery()

  const [runIdInput, setRunIdInput] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [functionFilter, setFunctionFilter] = useState('all')
  const [searchFilter, setSearchFilter] = useState('')
  const [rowLimit, setRowLimit] = useState(DEFAULT_ROWS)

  const runs = useRunsQuery({
    status: statusFilter === 'all' ? undefined : statusFilter,
    functionId: functionFilter === 'all' ? undefined : functionFilter,
    limit: rowLimit,
    offset: 0,
  })

  const functionOptions = useMemo(
    () => (functions.data ?? []).map((fn) => fn.id).sort((a, b) => a.localeCompare(b)),
    [functions.data],
  )

  const filteredRows = useMemo(() => {
    const term = searchFilter.trim().toLowerCase()
    const rows = runs.data ?? []
    if (!term) {
      return rows
    }
    return rows.filter((run) => {
      return [run.id, run.event_id, run.function_id, run.status].some((value) => value.toLowerCase().includes(term))
    })
  }, [runs.data, searchFilter])

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
          <button className="ghost-btn" type="button" onClick={() => runs.refetch()}>
            Refresh runs
          </button>
        </div>
      </header>

      <form className="filter-row" onSubmit={onQuickOpen}>
        <input
          id="run-id-input"
          value={runIdInput}
          onChange={(event) => setRunIdInput(event.target.value)}
          placeholder="Run ID (quick open)"
        />
        <input
          value={searchFilter}
          onChange={(event) => setSearchFilter(event.target.value)}
          placeholder="Filter by run/event/function/status"
        />
        <select className="filter-select" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
          <option value="all">Status: All</option>
          <option value="queued">Status: Queued</option>
          <option value="running">Status: Running</option>
          <option value="completed">Status: Completed</option>
          <option value="failed">Status: Failed</option>
          <option value="cancelled">Status: Cancelled</option>
        </select>
        <select className="filter-select" value={functionFilter} onChange={(event) => setFunctionFilter(event.target.value)}>
          <option value="all">Function: All</option>
          {functionOptions.map((functionId) => (
            <option key={functionId} value={functionId}>
              {functionId}
            </option>
          ))}
        </select>
        <select
          className="filter-select"
          value={String(rowLimit)}
          onChange={(event) => setRowLimit(Number.parseInt(event.target.value, 10))}
        >
          <option value="100">Rows: 100</option>
          <option value="200">Rows: 200</option>
          <option value="500">Rows: 500</option>
        </select>
        <button className="mini-btn" type="submit">
          Open ID
        </button>
      </form>

      <div className="status-strip">
        <span>
          Showing <strong>{filteredRows.length}</strong> of <strong>{runs.data?.length ?? 0}</strong> loaded runs
        </span>
        <span>
          Filters <strong>{statusFilter}</strong> / <strong>{functionFilter}</strong>
        </span>
      </div>

      <article className="panel">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Run ID</th>
                <th>Event</th>
                <th>Function</th>
                <th>Queued at</th>
                <th>Ended at</th>
                <th>Duration</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {runs.isLoading && (
                <tr>
                  <td colSpan={8}>
                    <div className="table-empty">
                      <p>Loading runs...</p>
                    </div>
                  </td>
                </tr>
              )}
              {runs.isError && (
                <tr>
                  <td colSpan={8}>
                    <div className="table-empty">
                      <p>Could not load runs from <code>GET /runs</code>.</p>
                    </div>
                  </td>
                </tr>
              )}
              {!runs.isLoading && !runs.isError && filteredRows.length === 0 && (
                <tr>
                  <td colSpan={8}>
                    <div className="table-empty">
                      <p>No runs match current filters.</p>
                    </div>
                  </td>
                </tr>
              )}
              {!runs.isLoading &&
                !runs.isError &&
                filteredRows.map((run) => (
                  <tr key={run.id}>
                    <td>
                      <span className={statusClassName(run.status)}>{run.status}</span>
                    </td>
                    <td>
                      <Link className="run-link" to={`/runs/${encodeURIComponent(run.id)}`}>
                        {run.id}
                      </Link>
                    </td>
                    <td>
                      <Link className="run-link" to={`/events/${encodeURIComponent(run.event_id)}`}>
                        {run.event_id}
                      </Link>
                    </td>
                    <td>{run.function_id}</td>
                    <td>{formatDate(run.created_at)}</td>
                    <td>{formatDate(run.ended_at)}</td>
                    <td>{formatDuration(run.started_at, run.ended_at)}</td>
                    <td>
                      <RunsRowActions runId={run.id} status={run.status} />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  )
}
