import { useState } from 'react'
import { FiCheck, FiKey } from 'react-icons/fi'
import Settings from '../Dashboard/Settings'
import { useAuth } from '../../context/useAuth'

export default function AdminProfile() {
  const { changePassword } = useAuth()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function submitPassword(event) {
    event.preventDefault()
    setMessage('')
    setError('')
    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.')
      return
    }
    setSaving(true)
    try {
      setMessage(await changePassword({ currentPassword, newPassword }))
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not change the password.')
    } finally { setSaving(false) }
  }

  return (
    <div className="admin-page admin-profile-page">
      <Settings />
      <section className="admin-panel admin-password-panel"><div className="admin-panel-heading"><div><h2>Change password</h2><p>All other active sessions will be invalidated.</p></div><span className="password-icon"><FiKey /></span></div><form className="admin-password-form" onSubmit={submitPassword}><label>Current password<input type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} autoComplete="current-password" required /></label><label>New password<input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} minLength={8} maxLength={72} autoComplete="new-password" required /></label><label>Confirm new password<input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} minLength={8} maxLength={72} autoComplete="new-password" required /></label>{error && <p className="admin-inline-message" role="alert">{error}</p>}{message && <p className="admin-inline-success" role="status"><FiCheck /> {message}</p>}<button className="admin-primary-action" disabled={saving} type="submit">{saving ? 'Updating…' : 'Update password'}</button></form></section>
    </div>
  )
}