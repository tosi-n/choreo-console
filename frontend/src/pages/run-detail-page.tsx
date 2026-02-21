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
    <section className="page">
      <h1>Run Detail</h1>
      <p className="hint">
        <code>{runId ?? 'missing run id'}</code>
      </p>

      {run.isLoading && <div className="card">Loading run...</div>}
      {run.isError && <div className="card error">Run not found or backend unavailable.</div>}
      {run.data && (
        <article className="card">
          <h2>Run</h2>
          <dl className="run-meta">
            <dt>Status</dt>
            <dd>{run.data.status}</dd>
            <dt>Function</dt>
            <dd>{run.data.function_id}</dd>
            <dt>Event</dt>
            <dd>{run.data.event_id}</dd>
            <dt>Attempt</dt>
            <dd>
              {run.data.attempt}/{run.data.max_attempts}
            </dd>
          </dl>
          <button
            type="button"
            onClick={() => cancelRun.mutate()}
            disabled={cancelRun.isPending || run.data.status === 'completed' || run.data.status === 'cancelled'}
          >
            {cancelRun.isPending ? 'Cancelling...' : 'Cancel Run'}
          </button>
          {cancelRun.isError && <p className="error-text">Cancel failed.</p>}
        </article>
      )}

      {steps.isLoading && <div className="card">Loading steps...</div>}
      {steps.isError && <div className="card error">Could not load steps.</div>}
      {steps.data && (
        <article className="card">
          <h2>Steps</h2>
          {steps.data.length === 0 ? <p>No recorded steps.</p> : <JsonBox value={steps.data} />}
        </article>
      )}
    </section>
  )
}

