import { useMemo, useState } from 'react'

import { useFunctionsQuery } from '../features/functions/queries'

export function FunctionsPage() {
  const [search, setSearch] = useState('')
  const functions = useFunctionsQuery()

  const filteredFunctions = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) {
      return functions.data ?? []
    }

    return (functions.data ?? []).filter((fn) => {
      if (fn.name.toLowerCase().includes(term) || fn.id.toLowerCase().includes(term)) {
        return true
      }
      return fn.triggers.some((trigger) => {
        const triggerName = trigger.name ?? ''
        return trigger.type.toLowerCase().includes(term) || triggerName.toLowerCase().includes(term)
      })
    })
  }, [functions.data, search])

  return (
    <section className="control-page">
      <header className="page-toolbar">
        <h1>Functions</h1>
        <div className="toolbar-actions">
          <button className="ghost-btn" type="button" onClick={() => functions.refetch()}>
            Refresh
          </button>
        </div>
      </header>

      <div className="filter-row">
        <input
          placeholder="Search by function name"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <button className="filter-pill active" type="button">
          Active: {(functions.data ?? []).length}
        </button>
      </div>

      <article className="panel">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Function name</th>
                <th>Triggers</th>
                <th>Failure rate (24hr)</th>
                <th>Volume (24h)</th>
              </tr>
            </thead>
            <tbody>
              {functions.isLoading && (
                <tr>
                  <td colSpan={4}>
                    <div className="table-empty">
                      <p>Loading functions...</p>
                    </div>
                  </td>
                </tr>
              )}
              {functions.isError && (
                <tr>
                  <td colSpan={4}>
                    <div className="table-empty">
                      <p>Could not load functions from <code>GET /functions</code>.</p>
                    </div>
                  </td>
                </tr>
              )}
              {!functions.isLoading && !functions.isError && filteredFunctions.length === 0 && (
                <tr>
                  <td colSpan={4}>
                    <div className="table-empty">
                      <p>No matching functions.</p>
                    </div>
                  </td>
                </tr>
              )}
              {!functions.isLoading &&
                !functions.isError &&
                filteredFunctions.map((fn) => (
                  <tr key={fn.id}>
                    <td>
                      <strong>{fn.name}</strong>
                      <p className="subtle">{fn.id}</p>
                    </td>
                    <td>
                      {fn.triggers.length === 0 ? (
                        <span className="subtle">None</span>
                      ) : (
                        <ul className="inline-list">
                          {fn.triggers.map((trigger, index) => (
                            <li key={`${fn.id}-${trigger.type}-${trigger.name ?? trigger.schedule ?? index}`}>
                              {trigger.type}:{' '}
                              <code>{trigger.name ?? trigger.schedule ?? 'unnamed'}</code>
                            </li>
                          ))}
                        </ul>
                      )}
                    </td>
                    <td className="subtle">n/a</td>
                    <td className="subtle">n/a</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  )
}
