import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'
import { useAuthStore } from '../store/authStore'

function SignupPage() {
  const navigate = useNavigate()
  const signupAction = useAuthStore((state) => state.signup)
  
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const onSignup = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!name || !email || !password) {
      setError('Name, email, and password are required')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      await signupAction(email, password, name)
      navigate('/dashboard', { replace: true })
    } catch (requestError: any) {
      setError(requestError.message || 'Unable to create account')
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
          <h1 className="text-3xl font-black text-gradient">Create Account</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Join the elite network of data-driven investors.</p>

        {error && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-500 border border-red-100">{error}</p>}

        <form className="mt-6 space-y-4" onSubmit={onSignup}>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">Full Name</label>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-xl border border-white/20 bg-black/5 dark:bg-white/5 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium backdrop-blur-sm placeholder:text-slate-400"
              placeholder="e.g. John Doe"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-white/20 bg-black/5 dark:bg-white/5 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium backdrop-blur-sm placeholder:text-slate-400"
              placeholder="name@company.com"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-white/20 bg-black/5 dark:bg-white/5 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium backdrop-blur-sm placeholder:text-slate-400"
              placeholder="Min. 8 characters"
            />
          </div>
          <Button fullWidth type="submit" disabled={isSubmitting} className="py-3.5 mt-2">
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>

        <p className="mt-8 text-[10px] text-slate-500 leading-relaxed text-center px-4">
          By clicking Create Account, you agree to our <span className="underline cursor-pointer hover:text-indigo-500">Terms of Service</span> and <span className="underline cursor-pointer hover:text-indigo-500">Privacy Policy</span>.
        </p>

        <div className="mt-8 flex items-center justify-center text-xs font-bold border-t border-[var(--border)] pt-6">
          <p className="text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 ml-1 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
        </div>
      </section>
    </div>
  )
}

export default SignupPage
