import { useParams } from 'react-router-dom'

import { useCancelRunMutation, useRunQuery, useRunStepsQuery } from '../features/runs/queries'

function JsonBox(props: { value: unknown }) {
  return <pre className="json-box">{JSON.stringify(props.value, null, 2)}</pre>
}

export function RunDetailPage() {
  const { runId } = useParams<{ runId: string }>()
  const run = useRunQuery(runId)
  const steps = useRunStepsQuery(runId)
  const cancelRun = useCancelRunMutation(runId)

  return (
    <section className="control-page">
      <header className="page-toolbar">
        <h1>Run Details</h1>
        <div className="toolbar-actions">
          <button
            className="ghost-btn"
            type="button"
            onClick={() => cancelRun.mutate()}
            disabled={
              cancelRun.isPending || !run.data || run.data.status === 'completed' || run.data.status === 'cancelled'
            }
          >
            {cancelRun.isPending ? 'Cancelling...' : 'Cancel'}
          </button>
          <button className="mini-btn" type="button" disabled>
            Rerun
          </button>
        </div>
      </header>

      <p className="subtle">
        Run ID <code>{runId ?? 'missing run id'}</code>
      </p>

      {run.isLoading && <div className="panel">Loading run...</div>}
      {run.isError && <div className="callout-error">Run not found or backend unavailable.</div>}

      {run.data && (
        <div className="split-grid">
          <article className="panel">
            <header className="panel-header">
              <h3>Run details</h3>
            </header>
            <dl className="run-meta">
              <dt>Status</dt>
              <dd>{run.data.status}</dd>
              <dt>Function</dt>
              <dd>{run.data.function_id}</dd>
              <dt>Queued at</dt>
              <dd>{run.data.created_at}</dd>
              <dt>Started at</dt>
              <dd>{run.data.started_at ?? '—'}</dd>
              <dt>Ended at</dt>
              <dd>{run.data.ended_at ?? '—'}</dd>
              <dt>Attempt</dt>
              <dd>
                {run.data.attempt}/{run.data.max_attempts}
              </dd>
            </dl>
          </article>

          <article className="panel">
            <header className="panel-header">
              <h3>Trigger details</h3>
            </header>
            <dl className="run-meta">
              <dt>Event ID</dt>
              <dd>{run.data.event_id}</dd>
              <dt>Input payload</dt>
              <dd />
            </dl>
            <JsonBox value={run.data.input} />
          </article>
        </div>
      )}

      {cancelRun.isError && <p className="error-text">Cancel failed.</p>}

      {steps.isLoading && <div className="panel">Loading steps...</div>}
      {steps.isError && <div className="callout-error">Could not load steps.</div>}
      {steps.data && (
        <article className="panel">
          <header className="panel-header">
            <h3>Run timeline</h3>
          </header>
          {steps.data.length === 0 ? (
            <p className="subtle">No recorded steps.</p>
          ) : (
            <div className="timeline">
              {steps.data.map((step, index) => (
                <div className="timeline-row" key={step.id}>
                  <div className="timeline-label">
                    <strong>{step.step_id}</strong>
                    <span>{step.status}</span>
                  </div>
                  <div className="timeline-bar-wrap">
                    <div className="timeline-bar" style={{ width: `${55 + (index % 4) * 10}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </article>
      )}

      {steps.data && steps.data.length > 0 && (
        <article className="panel">
          <header className="panel-header">
            <h3>Step payloads</h3>
          </header>
          <JsonBox value={steps.data} />
        </article>
      )}
    </section>
  )
}
