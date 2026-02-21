import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <section className="control-page">
      <h1>Not Found</h1>
      <p className="subtle">The page you requested does not exist.</p>
      <Link className="mini-btn inline-btn" to="/overview">
        Go to metrics
      </Link>
    </section>
  )
}
