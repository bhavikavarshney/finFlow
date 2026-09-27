import { useEffect, useState } from 'react'
import { FiActivity, FiAlertTriangle, FiCheckCircle, FiClock, FiDatabase, FiServer } from 'react-icons/fi'
import api from '../../utils/api'

function formatDate(value) {
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

export default function AdminOperations() {
  const [health, setHealth] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => { api.get('/admin/health').then(({ data }) => setHealth(data)).catch(() => setError('Health check unavailable. The API or database may be unreachable.')) }, [])
  const metrics = health ? [
    { label: 'API status', value: health.api, icon: FiServer, healthy: health.api === 'online' },
    { label: 'Database', value: health.database, icon: FiDatabase, healthy: health.database === 'connected' },
    { label: 'Uptime', value: `${Math.floor(health.uptimeSeconds / 3600)}h ${Math.floor((health.uptimeSeconds % 3600) / 60)}m`, icon: FiClock, healthy: true },
    { label: 'Avg response', value: `${health.averageResponseTimeMs} ms`, icon: FiActivity, healthy: health.averageResponseTimeMs < 1000 },
    { label: 'Error rate', value: `${health.errorRate}%`, icon: FiAlertTriangle, healthy: health.errorRate < 5 },
    { label: 'DB ping', value: `${health.databaseResponseTimeMs} ms`, icon: FiDatabase, healthy: health.databaseResponseTimeMs < 500 },
  ] : []

  return (
    <div className="admin-page">
      <header className="admin-page-heading"><div><span className="admin-kicker">CONTROL CENTER / OPERATIONS</span><h1>System health</h1><p>Live process and database checks. Metrics reset when the API restarts.</p></div><button className="admin-refresh-button" type="button" onClick={() => { setHealth(null); api.get('/admin/health').then(({ data }) => setHealth(data)).catch(() => setError('Health check unavailable.')) }}>Refresh</button></header>
      {error && <p className="admin-inline-message">{error}</p>}
      <section className="admin-health-grid">{metrics.map((metric) => { const Icon = metric.icon; return <article className="admin-health-card" key={metric.label}><div className={`health-state-icon ${metric.healthy ? 'health-good' : 'health-warn'}`}>{metric.healthy ? <FiCheckCircle /> : <Icon />}</div><div><span>{metric.label}</span><strong>{metric.value}</strong></div></article> })}</section>
      <section className="admin-panel admin-errors-panel"><div className="admin-panel-heading"><div><h2>Recent system errors</h2><p>Sanitized server-side events; no request bodies or user finance details</p></div><span className="admin-count-chip">{health?.recentErrors?.length || 0} events</span></div>{health?.recentErrors?.length ? <div className="admin-event-list">{health.recentErrors.map((event) => <article className="admin-event-row" key={event._id}><span className="error-severity-dot" /><div><strong>{event.message}</strong><small>{event.source} · {formatDate(event.createdAt)}</small></div></article>)}</div> : <div className="admin-empty-state"><FiCheckCircle /><strong>No recent system errors</strong><span>New server errors will be recorded here.</span></div>}</section>
      <p className="admin-footer-note">Response-time and error-rate metrics use a rolling in-memory sample of the last 1,000 API responses.</p>
    </div>
  )
}