import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'

import { choreoClient } from '../api/client'
import { useEventsQuery } from '../features/events/queries'
import { useFunctionsQuery } from '../features/functions/queries'
import { useRunsQuery } from '../features/runs/queries'

const defaultPayload = '{\n  "source": "choreo-console",\n  "note": "manual test event"\n}'

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

export function EventsPage() {
  const queryClient = useQueryClient()
  const functions = useFunctionsQuery()
  const [eventName, setEventName] = useState('')
  const [payloadText, setPayloadText] = useState(defaultPayload)
  const [formError, setFormError] = useState<string | null>(null)
  const [nameFilter, setNameFilter] = useState('')
  const [searchFilter, setSearchFilter] = useState('')
  const [rowLimit, setRowLimit] = useState(200)

  const events = useEventsQuery({
    limit: rowLimit,
    offset: 0,
    name: nameFilter.trim() || undefined,
  })
  const runs = useRunsQuery({ limit: 500 })

  const triggerNames = useMemo(() => {
    const names = new Set<string>()
    for (const fn of functions.data ?? []) {
      for (const trigger of fn.triggers) {
        if (trigger.type === 'event' && trigger.name) {
          names.add(trigger.name)
        }
      }
    }
    return Array.from(names).sort((a, b) => a.localeCompare(b))
  }, [functions.data])

  const sendEvent = useMutation({
    mutationFn: (input: { name: string; data: Record<string, unknown> }) => choreoClient.sendEvent(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      queryClient.invalidateQueries({ queryKey: ['runs'] })
    },
  })

  const linkedRuns = useMemo(() => {
    const map = new Map<string, string[]>()
    for (const run of runs.data ?? []) {
      const values = map.get(run.event_id) ?? []
      values.push(run.id)
      map.set(run.event_id, values)
    }
    return map
  }, [runs.data])

  const filteredEvents = useMemo(() => {
    const term = searchFilter.trim().toLowerCase()
    if (!term) {
      return events.data ?? []
    }
    return (events.data ?? []).filter((event) => {
      return [event.id, event.name].some((value) => value.toLowerCase().includes(term))
    })
  }, [events.data, searchFilter])

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedEventName = eventName.trim()

    if (!trimmedEventName) {
      setFormError('Event name is required.')
      return
    }

    let payload: Record<string, unknown>
    try {
      const parsed = JSON.parse(payloadText) as unknown
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        setFormError('Payload must be a JSON object.')
        return
      }
      payload = parsed as Record<string, unknown>
    } catch {
      setFormError('Payload must be valid JSON.')
      return
    }

    setFormError(null)
    sendEvent.mutate({ name: trimmedEventName, data: payload })
  }

  return (
    <section className="control-page">
      <header className="page-toolbar">
        <h1>Events</h1>
        <div className="toolbar-actions">
          <button className="ghost-btn" type="button" onClick={() => events.refetch()}>
            Refresh events
          </button>
          <button className="ghost-btn" type="button" onClick={() => runs.refetch()}>
            Refresh runs
          </button>
        </div>
      </header>

      <div className="filter-row">
        <button className="filter-pill active" type="button">
          Event triggers: {triggerNames.length}
        </button>
      </div>

      <article className="panel">
        <header className="panel-header">
          <h3>Send Test Event</h3>
          <span className="subtle">POST /events</span>
        </header>

        <form className="event-form" onSubmit={onSubmit}>
          <label htmlFor="event-name-input">Event name</label>
          <input
            id="event-name-input"
            placeholder="e.g. reconciliation.bookkeeping_needed"
            value={eventName}
            onChange={(inputEvent) => setEventName(inputEvent.target.value)}
            list="event-trigger-options"
          />

          <datalist id="event-trigger-options">
            {triggerNames.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>

          <label htmlFor="event-payload-input">JSON payload</label>
          <textarea
            id="event-payload-input"
            value={payloadText}
            onChange={(inputEvent) => setPayloadText(inputEvent.target.value)}
            rows={8}
          />

          <div className="empty-actions event-actions">
            <button className="mini-btn" type="submit" disabled={sendEvent.isPending}>
              {sendEvent.isPending ? 'Sending...' : 'Send event'}
            </button>
          </div>

          {formError && <p className="error-text">{formError}</p>}
          {sendEvent.isError && <p className="error-text">Could not send event.</p>}

          {sendEvent.data && (
            <div className="event-result">
              <p>
                Created event <code>{sendEvent.data.event_id}</code>
              </p>
              {sendEvent.data.run_ids.length === 0 ? (
                <p className="subtle">No runs were created for this event.</p>
              ) : (
                <ul className="compact-list">
                  {sendEvent.data.run_ids.map((runId) => (
                    <li key={runId}>
                      <span>Run</span>
                      <Link className="mini-btn inline-btn" to={`/runs/${runId}`}>
                        {runId}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </form>
      </article>

      <article className="panel">
        <header className="panel-header">
          <h3>Tracked Events</h3>
          <div className="toolbar-actions">
            <input
              value={nameFilter}
              onChange={(event) => setNameFilter(event.target.value)}
              placeholder="Server filter by exact name"
            />
            <input
              value={searchFilter}
              onChange={(event) => setSearchFilter(event.target.value)}
              placeholder="Client search by ID/name"
            />
            <select
              className="filter-select"
              value={String(rowLimit)}
              onChange={(event) => setRowLimit(Number.parseInt(event.target.value, 10))}
            >
              <option value="100">Rows: 100</option>
              <option value="200">Rows: 200</option>
              <option value="500">Rows: 500</option>
            </select>
          </div>
        </header>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Received at</th>
                <th>Event name</th>
                <th>Event ID</th>
                <th>Runs</th>
              </tr>
            </thead>
            <tbody>
              {events.isLoading && (
                <tr>
                  <td colSpan={4}>
                    <div className="table-empty">
                      <p>Loading events...</p>
                    </div>
                  </td>
                </tr>
              )}
              {events.isError && (
                <tr>
                  <td colSpan={4}>
                    <div className="table-empty">
                      <p>Could not load events from <code>GET /events</code>.</p>
                    </div>
                  </td>
                </tr>
              )}
              {!events.isLoading && !events.isError && filteredEvents.length === 0 && (
                <tr>
                  <td colSpan={4}>
                    <div className="table-empty">
                      <p>No events found.</p>
                    </div>
                  </td>
                </tr>
              )}
              {!events.isLoading &&
                !events.isError &&
                filteredEvents.map((event) => {
                  const runIds = linkedRuns.get(event.id) ?? []
                  return (
                    <tr key={event.id}>
                      <td>{formatDate(event.timestamp)}</td>
                      <td>{event.name}</td>
                      <td>
                        <Link className="run-link" to={`/events/${encodeURIComponent(event.id)}`}>
                          {event.id}
                        </Link>
                      </td>
                      <td>
                        {runIds.length === 0 ? (
                          <span className="subtle">0</span>
                        ) : (
                          <div className="table-chip-list">
                            {runIds.slice(0, 3).map((runId) => (
                              <Link key={runId} className="table-chip-link" to={`/runs/${encodeURIComponent(runId)}`}>
                                {runId}
                              </Link>
                            ))}
                            {runIds.length > 3 && <span className="subtle">+{runIds.length - 3} more</span>}
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  )
}
