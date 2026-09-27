import { useEffect, useState } from 'react'
import { FiActivity, FiCalendar, FiClock } from 'react-icons/fi'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import api from '../../utils/api'

export default function AdminAnalytics() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => { api.get('/admin/analytics').then(({ data: result }) => setData(result)).catch(() => setError('Analytics could not be loaded.')) }, [])
  const chartStyle = { background: 'var(--admin-panel)', borderColor: 'var(--admin-border)', borderRadius: 7, color: 'var(--admin-text)' }

  return (
    <div className="admin-page">
      <header className="admin-page-heading"><div><span className="admin-kicker">CONTROL CENTER / PRODUCT</span><h1>Usage analytics</h1><p>Aggregate usage and financial activity. No individual financial information.</p></div><span className="admin-count-chip">LAST 30 DAYS</span></header>
      {error && <p className="admin-inline-message">{error}</p>}
      <section className="admin-stat-grid analytics-stat-grid">{[{ label: 'Daily active users', key: 'dailyActiveUsers', icon: FiActivity }, { label: 'Weekly active users', key: 'weeklyActiveUsers', icon: FiCalendar }, { label: 'Monthly active users', key: 'monthlyActiveUsers', icon: FiClock }].map((item) => { const Icon = item.icon; return <article className="admin-stat-card" key={item.key}><div className="admin-stat-icon stat-green"><Icon /></div><span>{item.label}</span><strong>{data?.[item.key]?.toLocaleString('en-IN') ?? '—'}</strong></article> })}</section>
      <section className="admin-chart-grid"><article className="admin-panel"><div className="admin-panel-heading"><div><h2>Transactions created</h2><p>Daily count only; transaction values are excluded</p></div></div><div className="admin-chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={data?.transactionTrend || []}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--admin-chart-grid)" /><XAxis dataKey="date" tickFormatter={(value) => value.slice(5)} tickLine={false} axisLine={false} tick={{ fill: 'var(--admin-chart-muted)', fontSize: 10 }} minTickGap={28} /><YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: 'var(--admin-chart-muted)', fontSize: 10 }} width={28} /><Tooltip contentStyle={chartStyle} /><Bar dataKey="count" name="Transactions" fill="#7199b2" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div></article>
        <article className="admin-panel"><div className="admin-panel-heading"><div><h2>New users</h2><p>Registration trend, daily count</p></div></div><div className="admin-chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={data?.userGrowth || []}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--admin-chart-grid)" /><XAxis dataKey="date" tickFormatter={(value) => value.slice(5)} tickLine={false} axisLine={false} tick={{ fill: 'var(--admin-chart-muted)', fontSize: 10 }} minTickGap={28} /><YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: 'var(--admin-chart-muted)', fontSize: 10 }} width={28} /><Tooltip contentStyle={chartStyle} /><Bar dataKey="count" name="New users" fill="#48a685" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div></article></section>
      <section className="admin-chart-grid"><article className="admin-panel"><div className="admin-panel-heading"><div><h2>Feature usage</h2><p>Aggregated endpoint interactions over 30 days</p></div></div><div className="usage-feature-list">{(data?.featureUsage || []).map((feature) => <div className="usage-feature-row" key={feature.feature}><span>{feature.feature}</span><span>{feature.users} users</span><strong>{feature.events} events</strong></div>)}{data?.featureUsage?.length === 0 && <p className="admin-empty-copy">Usage events will appear as users start using finance features.</p>}</div></article>
        <article className="admin-panel"><div className="admin-panel-heading"><div><h2>Financial activity mix</h2><p>Counts by transaction type, no amounts</p></div></div><div className="usage-feature-list">{(data?.transactionTypes || []).map((item) => <div className="usage-feature-row" key={item.type}><span className="capitalize">{item.type}</span><span /><strong>{item.count} transactions</strong></div>)}{data?.transactionTypes?.length === 0 && <p className="admin-empty-copy">No transaction activity recorded.</p>}</div></article></section>
      <p className="admin-footer-note">No transaction values, descriptions, accounts, or individual financial records are returned by these analytics endpoints.</p>
    </div>
  )
}