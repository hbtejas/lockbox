import { useState } from 'react'
import Button from '../components/ui/Button'

function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  return (
    <div className="mx-auto max-w-md py-10">
      <section className="card-shell p-5">
        <h1 className="text-2xl font-bold">Forgot Password</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">Enter your email to receive password reset instructions.</p>

        <form
          className="mt-4 space-y-3"
          onSubmit={(event) => {
            event.preventDefault()
            if (email) {
              setSubmitted(true)
            }
          }}
        >
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm"
            placeholder="Email"
          />
          <Button fullWidth type="submit">
            Send Reset Link
          </Button>
        </form>

        {submitted && <p className="mt-3 text-xs text-emerald-500">Reset instructions have been sent to your email.</p>}
      </section>
    </div>
  )
}

export default ForgotPasswordPage
