import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'

export function RunsPage() {
  const navigate = useNavigate()
  const [runId, setRunId] = useState('')

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = runId.trim()
    if (!trimmed) {
      return
    }
    navigate(`/runs/${trimmed}`)
  }

  return (
    <section className="control-page">
      <header className="page-toolbar">
        <h1>Runs</h1>
        <div className="toolbar-actions">
          <button className="ghost-btn" type="button">
            Refresh runs
          </button>
        </div>
      </header>

      <form className="filter-row" onSubmit={onSubmit}>
        <input
          id="run-id-input"
          value={runId}
          onChange={(event) => setRunId(event.target.value)}
          placeholder="Run ID (quick open)"
        />
        <button className="filter-pill" type="button">
          Queued at
        </button>
        <button className="filter-pill active" type="button">
          Last 3d
        </button>
        <button className="filter-pill" type="button">
          Status: All
        </button>
        <button className="filter-pill" type="button">
          App: All
        </button>
        <button className="mini-btn" type="submit">
          Open Run
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
              <tr>
                <td colSpan={6}>
                  <div className="table-empty">
                    <p>No results were found.</p>
                    <p className="subtle">
                      This Choreo build does not expose <code>GET /runs</code>; use Run ID quick open.
                    </p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>

      <aside className="side-note">
        <h3>Current API surface</h3>
        <ul>
          <li>
            <code>GET /runs/:id</code>
          </li>
          <li>
            <code>GET /runs/:id/steps</code>
          </li>
          <li>
            <code>POST /runs/:id/cancel</code>
          </li>
        </ul>
      </aside>
    </section>
  )
}
