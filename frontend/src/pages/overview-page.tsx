import { choreoClient } from '../api/client'
import { useHealthQuery } from '../features/health/queries'

function LoadingCard() {
  return <div className="card">Checking backend health...</div>
}

export function OverviewPage() {
  const health = useHealthQuery()

  if (health.isLoading) {
    return <LoadingCard />
  }

  if (health.isError) {
    return (
      <div className="card">
        <h2>Backend unavailable</h2>
        <p>Could not reach {choreoClient.config.baseUrl}.</p>
      </div>
    )
  }

  if (!health.data) {
    return <LoadingCard />
  }

  return (
    <section className="page">
      <h1>Overview</h1>
      <div className="card-grid">
        <article className="card">
          <h2>Choreo API</h2>
          <p>{choreoClient.config.baseUrl}</p>
        </article>
        <article className="card">
          <h2>Service status</h2>
          <p>{health.data.status}</p>
        </article>
        <article className="card">
          <h2>Database</h2>
          <p>{health.data.database}</p>
        </article>
      </div>
      <p className="hint">
        Foundation is ready. Next: run/event list endpoints and operational dashboards.
      </p>
    </section>
  )
}
