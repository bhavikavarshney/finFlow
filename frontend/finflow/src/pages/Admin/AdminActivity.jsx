import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { FiBell, FiFileText } from 'react-icons/fi'
import api from '../../utils/api'

function formatDate(value) {
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(value),
  )
}

export default function AdminActivity() {
  const { section } = useParams()
  const alerts = section === 'alerts'
  const [items, setItems] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get(alerts ? '/admin/notifications' : '/admin/audit-logs')
      .then(({ data }) => setItems(alerts ? data.notifications : data.logs))
      .catch(() => setError(`Could not load ${alerts ? 'notifications' : 'audit events'}.`))
  }, [alerts])

  return (
    <div className="admin-page">
      <header className="admin-page-heading">
        <div>
          <span className="admin-kicker">CONTROL CENTER / GOVERNANCE</span>
          <h1>{alerts ? 'Notifications' : 'Audit log'}</h1>
          <p>
            {alerts
              ? 'Unresolved system events and alerts.'
              : 'Admin and system actions, recorded with timestamps.'}
          </p>
        </div>
        <span className="admin-count-chip">{items.length} records</span>
      </header>
      {error && <p className="admin-inline-message">{error}</p>}
      <section className="admin-panel admin-event-panel">
        <div className="admin-panel-heading">
          <div>
            <h2>{alerts ? 'Open alerts' : 'Recent actions'}</h2>
            <p>{alerts ? 'System-generated notifications' : 'Latest 30 audit records'}</p>
          </div>
        </div>
        {items.length ? (
          <div className="admin-event-list">
            {items.map((item) => (
              <article className="admin-event-row" key={item._id}>
                <span className={`event-icon ${alerts ? `event-${item.level}` : 'event-info'}`}>
                  {alerts ? <FiBell /> : <FiFileText />}
                </span>
                <div className="event-content">
                  <strong>{item.summary || item.message}</strong>
                  <small>
                    {item.actorId?.name || item.actorType || item.source || 'system'}
                    {item.actorId?.email ? ` · ${item.actorId.email}` : ''} ·{' '}
                    {formatDate(item.createdAt)}
                  </small>
                </div>
                {item.action && <span className="event-action-label">{item.action}</span>}
              </article>
            ))}
          </div>
        ) : (
          <div className="admin-empty-state">
            <FiFileText />
            <strong>{alerts ? 'All clear' : 'No audit events yet'}</strong>
            <span>
              {alerts
                ? 'There are no unresolved system alerts.'
                : 'Admin actions will be recorded here.'}
            </span>
          </div>
        )}
      </section>
      <p className="admin-footer-note">
        Audit and alert feeds never include transaction amounts, passwords, JWTs, or account
        balances.
      </p>
    </div>
  )
}
