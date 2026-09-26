import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FiArrowRight, FiEye, FiEyeOff, FiLock, FiMail } from 'react-icons/fi'
import AuthLayout from '../../components/AuthLayout'
import { useAuth } from '../../context/useAuth'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await login({ email: event.currentTarget.email.value, password: event.currentTarget.password.value })
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true })
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to connect. Check the API and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout mode="login">
      <div className="auth-heading">
        <span className="eyebrow lg:hidden"><span className="eyebrow-dot" /> YOUR MONEY, IN MOTION</span>
        <h2>Welcome back<span>.</span></h2>
        <p>Pick up right where you left off.</p>
      </div>
      <form className="auth-form" onSubmit={handleSubmit}>
        <label htmlFor="email">Email address</label>
        <div className="input-wrap"><FiMail /><input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required /></div>
        <div className="label-row"><label htmlFor="password">Password</label></div>
        <div className="input-wrap"><FiLock /><input id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="Your password" required /><button className="password-toggle" type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <FiEyeOff /> : <FiEye />}</button></div>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="submit-button" type="submit" disabled={submitting}>{submitting ? 'Signing in...' : 'Sign in'} <FiArrowRight /></button>
      </form>
      <p className="auth-switch">New to finflow? <Link to="/signup">Create an account</Link></p>
    </AuthLayout>
  )
}
