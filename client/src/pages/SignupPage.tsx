import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signup } from '../api/authApi'
import Button from '../components/ui/Button'
import { useAuthStore } from '../store/authStore'

function SignupPage() {
  const navigate = useNavigate()
  const setSession = useAuthStore((state) => state.setSession)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const onSignup = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!name || !email || !password) {
      setError('Name, email, and password are required')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await signup({ name, email, password })
      setSession(response.accessToken, response.user)
      navigate('/dashboard', { replace: true })
    } catch (requestError: any) {
      setError(requestError.message || 'Unable to create account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-4 py-10">
      <section className="card-shell p-6 bg-white shadow-xl rounded-2xl">
        <h1 className="text-2xl font-bold text-slate-800">Create Account</h1>
        <p className="mt-1 text-sm text-slate-500">Join the elite network of data-driven investors.</p>

        {error && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-500 border border-red-100">{error}</p>}

        <form className="mt-6 space-y-4" onSubmit={onSignup}>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Full Name</label>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-all font-medium"
              placeholder="e.g. John Doe"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-all font-medium"
              placeholder="name@company.com"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-all font-medium"
              placeholder="Min. 8 characters"
            />
          </div>
          <Button fullWidth type="submit" disabled={loading} className="py-3 shadow-lg shadow-yellow-400/20">
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>

        <p className="mt-6 text-[10px] text-slate-400 leading-relaxed text-center px-4">
          By clicking Create Account, you agree to our <span className="underline cursor-pointer">Terms of Service</span> and <span className="underline cursor-pointer">Privacy Policy</span>.
        </p>

        <div className="mt-8 flex items-center justify-center text-xs font-bold border-t border-slate-50 pt-6">
          <p className="text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 ml-1">
              Sign in
            </Link>
          </p>
        </div>
      </section>
    </div>
  )
}

export default SignupPage
