import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <section className="page">
      <h1>Not Found</h1>
      <p className="hint">The page you requested does not exist.</p>
      <Link to="/overview">Go to overview</Link>
    </section>
  )
}

