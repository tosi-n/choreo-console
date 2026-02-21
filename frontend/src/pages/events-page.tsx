export function EventsPage() {
  return (
    <section className="control-page">
      <header className="page-toolbar">
        <h1>Events</h1>
        <div className="toolbar-actions">
          <button className="ghost-btn" type="button">
            Refresh page
          </button>
          <button className="mini-btn" type="button">
            Send event
          </button>
        </div>
      </header>

      <div className="filter-row">
        <button className="filter-pill" type="button">
          Show search
        </button>
        <button className="filter-pill active" type="button">
          Last 3d
        </button>
      </div>

      <article className="panel">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Received at</th>
                <th>Event name</th>
                <th>Functions triggered</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={3}>
                  <div className="table-empty large">
                    <p>No events found</p>
                    <p className="subtle">
                      Requires <code>GET /events</code> and <code>GET /events/:id/runs</code>.
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
