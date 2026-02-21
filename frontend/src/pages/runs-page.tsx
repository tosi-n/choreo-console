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
    <section className="page">
      <h1>Runs</h1>
      <p className="hint">
        Runs list depends on the upcoming <code>GET /runs</code> endpoint. You can inspect a run by ID
        now.
      </p>
      <form className="card form-inline" onSubmit={onSubmit}>
        <label htmlFor="run-id-input">Run ID</label>
        <input
          id="run-id-input"
          value={runId}
          onChange={(event) => setRunId(event.target.value)}
          placeholder="UUID"
        />
        <button type="submit">Open Run</button>
      </form>
    </section>
  )
}
