import { useEffect, useState } from 'react'
import { FiCheck, FiSettings } from 'react-icons/fi'
import api from '../../utils/api'

const flags = [
  ['accounts', 'Accounts'],
  ['transactions', 'Transactions'],
  ['budgets', 'Budgets'],
  ['goals', 'Goals'],
  ['reports', 'Reports'],
]

export default function AdminSettings() {
  const [settings, setSettings] = useState(null)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => { api.get('/admin/settings').then(({ data }) => setSettings(data.settings)).catch(() => setError('Could not load application settings.')) }, [])

  function updateFlag(name, value) {
    setSettings((current) => ({ ...current, featureFlags: { ...current.featureFlags, [name]: value } }))
  }

  async function save(patch) {
    setError('')
    setSaved(false)
    try {
      const { data } = await api.patch('/admin/settings', patch)
      setSettings(data.settings)
      setSaved(true)
    } catch (requestError) { setError(requestError.response?.data?.message || 'Could not save this setting.') }
  }

  if (!settings && !error) return <div className="admin-page"><p className="admin-empty-copy">Loading application settings…</p></div>

  return (
    <div className="admin-page">
      <header className="admin-page-heading"><div><span className="admin-kicker">CONTROL CENTER / CONFIGURATION</span><h1>Admin settings</h1><p>Manage registration, maintenance, and product availability.</p></div></header>
      {error && <p className="admin-inline-message" role="alert">{error}</p>}{saved && <p className="admin-inline-success" role="status"><FiCheck /> Settings saved.</p>}
      {settings && <><section className="admin-panel admin-settings-panel"><div className="admin-panel-heading"><div><h2>Platform access</h2><p>High-impact settings are applied by the API.</p></div><FiSettings /></div>
        {[['registrationEnabled', 'New registrations', 'Allow new users to create an account.'], ['maintenanceMode', 'Maintenance mode', 'Pause finance features and signup while maintenance is active.']].map(([key, label, description]) => <div className="admin-setting-row" key={key}><div><strong>{label}</strong><span>{description}</span></div><button type="button" role="switch" aria-checked={settings[key]} className={`admin-switch ${settings[key] ? 'switch-on' : ''}`} onClick={() => save({ [key]: !settings[key] })}><i /></button></div>)}
      </section><section className="admin-panel admin-settings-panel"><div className="admin-panel-heading"><div><h2>Feature flags</h2><p>Disabled features reject create and list requests at the API.</p></div></div>{flags.map(([key, label]) => <div className="admin-setting-row compact-setting" key={key}><div><strong>{label}</strong><span>Availability for finance workspace users</span></div><button type="button" role="switch" aria-checked={settings.featureFlags?.[key] !== false} className={`admin-switch ${settings.featureFlags?.[key] !== false ? 'switch-on' : ''}`} onClick={() => { const next = settings.featureFlags?.[key] === false; updateFlag(key, next); save({ featureFlags: { [key]: next } }) }}><i /></button></div>)}</section></>}
      <p className="admin-footer-note">Use maintenance mode before deployments. Admin endpoints remain available while maintenance mode is enabled.</p>
    </div>
  )
}