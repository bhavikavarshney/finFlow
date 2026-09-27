import { useEffect, useState } from 'react'
import { FiActivity, FiArrowDownLeft, FiArrowUpRight, FiCreditCard, FiLayers, FiShield, FiUsers } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import api from '../../utils/api'

const cards = [
  { key: 'totalUsers', label: 'Total users', icon: FiUsers, tone: 'green' },
  { key: 'activeUsers', label: 'Active users · 30d', icon: FiActivity, tone: 'blue' },
  { key: 'newUsers', label: 'New users · month', icon: FiArrowDownLeft, tone: 'orange' },
  { key: 'totalTransactions', label: 'Transactions', icon: FiArrowUpRight, tone: 'green' },
  { key: 'totalAccounts', label: 'Accounts', icon: FiCreditCard, tone: 'blue' },
  { key: 'totalBudgets', label: 'Budgets', icon: FiLayers, tone: 'orange' },
]

export default function AdminOverview() {
  const [summary, setSummary] = useState(null)
  const [growth, setGrowth] = useState([])
  const [errors, setErrors] = useState('')

  useEffect(() => {
    Promise.all([api.get('/admin/overview'), api.get('/admin/analytics'), api.get('/admin/notifications')])
      .then(([overviewResponse, analyticsResponse, alertResponse]) => {
        setSummary(overviewResponse.data)
        setGrowth(analyticsResponse.data.userGrowth)
        setErrors(alertResponse.data.notifications.length ? `${alertResponse.data.notifications.length} unresolved system events` : '')
      })
      .catch(() => setErrors('Admin metrics could not be loaded. Check API and database status.'))
  }, [])

  return (
    <div className="admin-page">
      <header className="admin-page-heading"><div><span className="admin-kicker">CONTROL CENTER / OVERVIEW</span><h1>Good morning.</h1><p>A clear, privacy-conscious view of FinFlow.</p></div><span className="admin-live-pill"><i /> Live data</span></header>
      {errors && <Link className="admin-alert-banner" to="/admin/alerts"><FiActivity /> {errors}<span>Review alerts</span></Link>}
      <section className="admin-stat-grid" aria-label="Application overview">{cards.map((card) => { const Icon = card.icon; return <article className="admin-stat-card" key={card.key}><div className={`admin-stat-icon stat-${card.tone}`}><Icon /></div><span>{card.label}</span><strong>{summary ? (summary[card.key] ?? 0).toLocaleString('en-IN') : '—'}</strong></article> })}</section>
      <section className="admin-overview-grid">
        <article className="admin-panel admin-growth-panel"><div className="admin-panel-heading"><div><h2>User growth</h2><p>New registrations over the last 30 days</p></div><Link to="/admin/reports">View reports <FiArrowUpRight /></Link></div><div className="admin-chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={growth}><defs><linearGradient id="growthFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#38a481" stopOpacity={0.22} /><stop offset="95%" stopColor="#38a481" stopOpacity={0.01} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--admin-chart-grid)" /><XAxis dataKey="date" tickFormatter={(value) => value.slice(5)} tickLine={false} axisLine={false} tick={{ fill: 'var(--admin-chart-muted)', fontSize: 10 }} minTickGap={28} /><YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: 'var(--admin-chart-muted)', fontSize: 10 }} width={28} /><Tooltip contentStyle={{ background: 'var(--admin-panel)', borderColor: 'var(--admin-border)', borderRadius: 7, color: 'var(--admin-text)' }} /><Area type="monotone" dataKey="count" name="New users" stroke="#38a481" strokeWidth={2} fill="url(#growthFill)" /></AreaChart></ResponsiveContainer></div></article>
        <article className="admin-panel admin-privacy-panel"><div className="admin-panel-heading"><div><h2>Privacy by design</h2><p>Finance analytics are aggregated</p></div><FiShield /></div><div className="privacy-rule"><span>Admin visibility</span><strong>Counts & trends only</strong></div><div className="privacy-rule"><span>Transaction amounts</span><strong>Never shown</strong></div><div className="privacy-rule"><span>Personal finance data</span><strong>Owner-scoped</strong></div><Link to="/admin/analytics" className="admin-text-link">Explore usage analytics <FiArrowUpRight /></Link></article>
      </section>
      <div className="admin-footer-note">Financial amounts and individual transactions are never included in admin analytics.</div>
    </div>
  )
}