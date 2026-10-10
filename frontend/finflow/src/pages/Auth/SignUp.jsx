import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiArrowRight, FiEye, FiEyeOff, FiLock, FiMail, FiUser } from 'react-icons/fi'
import AuthLayout from '../../components/AuthLayout'
import { useAuth } from '../../context/useAuth'

export default function SignUp() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await signup({
        name: event.currentTarget.name.value,
        email: event.currentTarget.email.value,
        password: event.currentTarget.password.value,
      })
      navigate('/dashboard', { replace: true })
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || 'Unable to connect. Check the API and try again.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout mode="signup">
      <div className="auth-heading">
        <span className="eyebrow lg:hidden">
          <span className="eyebrow-dot" /> YOUR MONEY, IN MOTION
        </span>
        <h2>
          Start fresh<span>.</span>
        </h2>
        <p>A clearer picture is just around the corner.</p>
      </div>
      <form className="auth-form" onSubmit={handleSubmit}>
        <label htmlFor="name">Your name</label>
        <div className="input-wrap">
          <FiUser />
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder="Alex Morgan"
            maxLength={80}
            required
          />
        </div>
        <label htmlFor="email">Email address</label>
        <div className="input-wrap">
          <FiMail />
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
          />
        </div>
        <label htmlFor="password">Password</label>
        <div className="input-wrap">
          <FiLock />
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="At least 8 characters"
            minLength={8}
            maxLength={72}
            required
          />
          <button
            className="password-toggle"
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <FiEyeOff /> : <FiEye />}
          </button>
        </div>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <button className="submit-button" type="submit" disabled={submitting}>
          {submitting ? 'Creating account...' : 'Create account'} <FiArrowRight />
        </button>
      </form>
      <p className="auth-switch">
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </AuthLayout>
  )
}
