export function FunctionsPage() {
  return (
    <section className="control-page">
      <header className="page-toolbar">
        <h1>Functions</h1>
        <div className="toolbar-actions">
          <button className="ghost-btn" type="button">
            Refresh
          </button>
        </div>
      </header>

      <div className="filter-row">
        <input placeholder="Search by function name" />
        <button className="filter-pill active" type="button">
          Status: Active
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
              <tr>
                <td colSpan={4}>
                  <div className="table-empty large">
                    <p>No functions found</p>
                    <p className="subtle">
                      Backend <code>GET /functions</code> is available; data wiring comes next.
                    </p>
                    <div className="empty-actions">
                      <button className="ghost-btn" type="button">
                        Refresh
                      </button>
                      <button className="mini-btn" type="button">
                        Go to docs
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>
    </section>
  )
}
