import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'

import { useEventQuery } from '../features/events/queries'
import { useRunsQuery } from '../features/runs/queries'

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

function JsonBox(props: { value: unknown }) {
  return <pre className="json-box">{JSON.stringify(props.value, null, 2)}</pre>
}

export function EventDetailPage() {
  const { eventId: eventIdParam } = useParams<{ eventId: string }>()
  const eventId = useMemo(() => {
    if (!eventIdParam) {
      return undefined
    }
    try {
      return decodeURIComponent(eventIdParam)
    } catch {
      return eventIdParam
    }
  }, [eventIdParam])

  const event = useEventQuery(eventId)
  const runs = useRunsQuery({
    eventId,
    limit: 200,
    enabled: Boolean(eventId),
  })

  return (
    <section className="control-page">
      <header className="page-toolbar">
        <h1>Event Details</h1>
        <div className="toolbar-actions">
          <Link className="mini-btn inline-btn" to="/events">
            Back to events
          </Link>
        </div>
      </header>

      <p className="subtle">
        Event ID <code>{eventId ?? 'missing event id'}</code>
      </p>

      {event.isLoading && <div className="panel">Loading event...</div>}
      {event.isError && <div className="callout-error">Could not load event from <code>GET /events/:id</code>.</div>}

      {event.data && (
        <>
          <div className="split-grid">
            <article className="panel">
              <header className="panel-header">
                <h3>Event metadata</h3>
              </header>
              <dl className="run-meta">
                <dt>Name</dt>
                <dd>{event.data.name}</dd>
                <dt>Event ID</dt>
                <dd>{event.data.id}</dd>
                <dt>Received at</dt>
                <dd>{formatDate(event.data.timestamp)}</dd>
                <dt>User</dt>
                <dd>{event.data.user_id ?? '—'}</dd>
                <dt>Idempotency key</dt>
                <dd>{event.data.idempotency_key ?? '—'}</dd>
              </dl>
            </article>

            <article className="panel">
              <header className="panel-header">
                <h3>Event payload</h3>
              </header>
              <JsonBox value={event.data.data} />
            </article>
          </div>

          <article className="panel">
            <header className="panel-header">
              <h3>Linked runs</h3>
              <button className="mini-btn" type="button" onClick={() => runs.refetch()}>
                Refresh
              </button>
            </header>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Run ID</th>
                    <th>Function</th>
                    <th>Queued at</th>
                    <th>Ended at</th>
                  </tr>
                </thead>
                <tbody>
                  {runs.isLoading && (
                    <tr>
                      <td colSpan={5}>
                        <div className="table-empty">
                          <p>Loading runs...</p>
                        </div>
                      </td>
                    </tr>
                  )}
                  {runs.isError && (
                    <tr>
                      <td colSpan={5}>
                        <div className="table-empty">
                          <p>Could not load linked runs from <code>GET /runs?event_id=...</code>.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                  {!runs.isLoading && !runs.isError && (runs.data ?? []).length === 0 && (
                    <tr>
                      <td colSpan={5}>
                        <div className="table-empty">
                          <p>No runs linked to this event.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                  {!runs.isLoading &&
                    !runs.isError &&
                    (runs.data ?? []).map((run) => (
                      <tr key={run.id}>
                        <td>{run.status}</td>
                        <td>
                          <Link className="run-link" to={`/runs/${encodeURIComponent(run.id)}`}>
                            {run.id}
                          </Link>
                        </td>
                        <td>{run.function_id}</td>
                        <td>{formatDate(run.created_at)}</td>
                        <td>{formatDate(run.ended_at)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </article>
        </>
      )}
    </section>
  )
}
