import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { login } from '../api/authApi'
import Button from '../components/ui/Button'
import { useAuthStore } from '../store/authStore'

function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const setSession = useAuthStore((state) => state.setSession)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const onLogin = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await login({ email, password })
      setSession(response.accessToken, response.user)

      const from = (location.state as { from?: string } | null)?.from
      navigate(from ?? '/dashboard', { replace: true })
    } catch (requestError: any) {
      setError(requestError.message || 'Unable to sign in')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-4 py-10">
      <section className="card-shell p-6 bg-white shadow-xl rounded-2xl">
        <h1 className="text-2xl font-bold text-slate-800">Sign In</h1>
        <p className="mt-1 text-sm text-slate-500">Access your premium research dashboard.</p>

        {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-500 border border-red-100">{error}</p>}

        <form className="mt-6 space-y-4" onSubmit={onLogin}>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-all font-medium"
              placeholder="e.g. name@company.com"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-all font-medium"
              placeholder="••••••••"
            />
          </div>
          <Button fullWidth type="submit" disabled={loading} className="py-3 shadow-lg shadow-yellow-400/20">
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>

        <div className="my-6 flex items-center gap-2 text-[10px] font-bold text-slate-300 uppercase tracking-widest">
          <span className="h-px flex-1 bg-slate-100" />
          OR
          <span className="h-px flex-1 bg-slate-100" />
        </div>

        <Button variant="secondary" fullWidth className="border-slate-200 text-slate-600 bg-white hover:bg-slate-50">
          Continue with Google
        </Button>

        <div className="mt-8 flex items-center justify-between text-xs font-bold border-t border-slate-50 pt-6">
          <Link to="/signup" className="text-blue-600 hover:text-blue-700">
            Create Free Account
          </Link>
          <Link to="/forgot-password" title="Currently disabled" className="text-slate-400 cursor-not-allowed">
            Reset Password
          </Link>
        </div>
      </section>
    </div>
  )
}

export default LoginPage
