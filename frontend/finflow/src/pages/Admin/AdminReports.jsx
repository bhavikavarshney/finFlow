import { useState } from 'react'
import { FiActivity, FiDownload, FiFileText, FiShield, FiUsers } from 'react-icons/fi'
import api from '../../utils/api'

export default function AdminReports() {
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  async function downloadReport() {
    setBusy(true)
    setMessage('')
    try {
      const { data } = await api.get('/admin/reports/usage.csv', { responseType: 'blob' })
      const url = URL.createObjectURL(data)
      const link = document.createElement('a')
      link.href = url
      link.download = 'finflow-usage-report.csv'
      link.click()
      URL.revokeObjectURL(url)
      setMessage('Aggregated CSV report downloaded.')
    } catch {
      setMessage('Report export failed. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="admin-page">
      <header className="admin-page-heading">
        <div>
          <span className="admin-kicker">CONTROL CENTER / REPORTING</span>
          <h1>Reports</h1>
          <p>Download high-level growth and product-usage summaries.</p>
        </div>
      </header>
      {message && (
        <p className="admin-inline-message" role="status">
          {message}
        </p>
      )}
      <section className="admin-report-grid">
        <article className="admin-panel admin-report-card">
          <span className="report-icon">
            <FiUsers />
          </span>
          <div>
            <h2>User growth</h2>
            <p>Daily account registrations over the rolling last 30 days.</p>
          </div>
          <span className="report-data-tag">AGGREGATED</span>
          <button
            type="button"
            className="admin-secondary-action"
            onClick={downloadReport}
            disabled={busy}
          >
            <FiDownload /> {busy ? 'Preparing…' : 'Export CSV'}
          </button>
        </article>
        <article className="admin-panel admin-report-card">
          <span className="report-icon report-icon-blue">
            <FiActivity />
          </span>
          <div>
            <h2>Application usage</h2>
            <p>
              Daily transaction creation counts and feature interactions. No monetary values are
              included.
            </p>
          </div>
          <span className="report-data-tag">ANONYMIZED</span>
          <button
            type="button"
            className="admin-secondary-action"
            onClick={downloadReport}
            disabled={busy}
          >
            <FiDownload /> {busy ? 'Preparing…' : 'Export CSV'}
          </button>
        </article>
      </section>
      <div className="admin-privacy-callout">
        <FiShield />
        <span>
          <strong>Privacy boundary</strong> Exports include dates and counts only. They never
          include user identities, descriptions, amounts, or account details.
        </span>
        <FiFileText />
      </div>
    </div>
  )
}
