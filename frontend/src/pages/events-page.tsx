import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Link } from 'react-router-dom'

import { choreoClient } from '../api/client'
import { useFunctionsQuery } from '../features/functions/queries'

const defaultPayload = '{\n  "source": "choreo-console",\n  "note": "manual test event"\n}'

export function EventsPage() {
  const functions = useFunctionsQuery()
  const [eventName, setEventName] = useState('')
  const [payloadText, setPayloadText] = useState(defaultPayload)
  const [formError, setFormError] = useState<string | null>(null)

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
  })

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
          <button className="ghost-btn" type="button" onClick={() => functions.refetch()}>
            Refresh functions
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
          <h3>List Endpoint Status</h3>
        </header>
        <div className="table-empty">
          <p className="subtle">
            This Choreo version exposes <code>POST /events</code> and <code>GET /events/:id</code>,
            but not <code>GET /events</code> list.
          </p>
        </div>
      </article>
    </section>
  )
}
