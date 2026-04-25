import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <div className="mx-auto max-w-xl py-16 text-center">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="mt-2 text-sm text-[var(--text-muted)]">The page you are looking for could not be found.</p>
      <Link to="/dashboard" className="mt-4 inline-flex rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white">
        Back to Dashboard
      </Link>
    </div>
  )
}

export default NotFoundPage
