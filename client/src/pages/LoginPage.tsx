import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'
import { useAuthStore } from '../store/authStore'

function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const loginAction = useAuthStore((state) => state.login)
  const loading = useAuthStore((state) => state.loading)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onLogin = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      await loginAction(email, password)
      const from = (location.state as { from?: string } | null)?.from
      navigate(from ?? '/dashboard', { replace: true })
    } catch (requestError: any) {
      setError(requestError.message || 'Unable to sign in')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-4 py-10">
      <section className="glass p-8 rounded-[2rem] relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 rounded-full bg-indigo-500/20 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-32 h-32 rounded-full bg-blue-500/20 blur-2xl"></div>
        
        <div className="relative z-10">
          <h1 className="text-3xl font-black text-gradient">Welcome Back</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Access your premium research dashboard.</p>

        {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-500 border border-red-100">{error}</p>}

        <form className="mt-6 space-y-4" onSubmit={onLogin}>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-white/20 bg-black/5 dark:bg-white/5 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium backdrop-blur-sm placeholder:text-slate-400"
              placeholder="e.g. name@company.com"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-white/20 bg-black/5 dark:bg-white/5 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium backdrop-blur-sm placeholder:text-slate-400"
              placeholder="••••••••"
            />
          </div>
          <Button fullWidth type="submit" disabled={isSubmitting} className="py-3.5 mt-2">
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>

        <div className="my-8 flex items-center gap-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          <span className="h-px flex-1 bg-[var(--border)]" />
          OR
          <span className="h-px flex-1 bg-[var(--border)]" />
        </div>

        <Button variant="secondary" fullWidth className="py-3.5 border border-white/10">
          Continue with Google
        </Button>

        <div className="mt-8 flex items-center justify-between text-xs font-bold border-t border-[var(--border)] pt-6">
          <Link to="/signup" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors">
            Create Free Account
          </Link>
          <Link to="/forgot-password" title="Currently disabled" className="text-slate-400 cursor-not-allowed">
            Reset Password
          </Link>
        </div>
        </div>
      </section>
    </div>
  )
}

export default LoginPage
