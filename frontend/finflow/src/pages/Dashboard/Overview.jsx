import { useNavigate } from 'react-router-dom'
import { FiArrowDownLeft, FiArrowUpRight, FiChevronDown, FiCreditCard, FiPlus, FiTrendingUp } from 'react-icons/fi'
import { useAuth } from '../../context/useAuth'
import useCurrency from '../../hooks/useCurrency'
import { demoSummary, demoTransactions } from '../../utils/data'

const icons = { card: FiCreditCard, income: FiArrowDownLeft, transport: FiArrowUpRight }

export default function Overview() {
  const { user } = useAuth()
  const { formatCurrency } = useCurrency()
  const navigate = useNavigate()
  const today = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: '2-digit', year: 'numeric' }).format(new Date()).toUpperCase()

  return (
    <>
      <section className="welcome-row"><div><span className="eyebrow"><span className="eyebrow-dot" /> {today}</span><h1>Good morning, {user?.name?.split(' ')[0]}.</h1><p>Here’s your money at a glance.</p></div><button className="add-button" type="button" onClick={() => navigate('/dashboard/transactions')}><FiPlus /> Add transaction</button></section>
      <section className="overview-grid" aria-label="Sample financial summary">
        <article className="balance-panel"><div className="balance-top"><span>Total balance</span><span className="balance-period">ALL ACCOUNTS <FiChevronDown /></span></div><p className="balance-amount">{formatCurrency(demoSummary.balance)}</p><div className="balance-change"><span><FiTrendingUp /> 8.2%</span> <span>compared to last month</span></div><div className="balance-chart" aria-label="Sample balance trend"><svg viewBox="0 0 540 90" preserveAspectRatio="none" role="img"><path className="chart-fill" d="M0 76 C32 68 34 54 69 61 S112 46 139 52 S184 30 211 43 S258 48 281 32 S321 40 350 26 S396 33 422 18 S468 28 493 13 S524 22 540 4 V90 H0Z" /><path className="chart-line" d="M0 76 C32 68 34 54 69 61 S112 46 139 52 S184 30 211 43 S258 48 281 32 S321 40 350 26 S396 33 422 18 S468 28 493 13 S524 22 540 4" /></svg><div className="chart-labels"><span>SEP 01</span><span>SEP 08</span><span>SEP 15</span><span>SEP 22</span><span>TODAY</span></div></div></article>
        <article className="metric-panel income-panel"><div className="metric-icon"><FiArrowDownLeft /></div><p>Income <span>THIS MONTH</span></p><strong>{formatCurrency(demoSummary.income)}</strong><small><b>+{demoSummary.incomeChange}%</b> from last month</small><div className="metric-rule"><i /></div></article>
        <article className="metric-panel spending-panel"><div className="metric-icon"><FiArrowUpRight /></div><p>Spending <span>THIS MONTH</span></p><strong>{formatCurrency(demoSummary.spending)}</strong><small><b>{demoSummary.spendingChange}%</b> from last month</small><div className="metric-rule"><i /></div></article>
      </section>
      <section className="activity-panel"><div className="activity-header"><div><h2>Recent activity</h2><p>Sample transactions</p></div><button type="button" onClick={() => navigate('/dashboard/transactions')}>View all <FiArrowUpRight /></button></div><div className="activity-list">{demoTransactions.slice(0, 3).map((item) => { const Icon = icons[item.icon]; return <article className="activity-item" key={item.id}><span className={`activity-icon ${item.color}`}><Icon /></span><div className="activity-detail"><strong>{item.merchant}</strong><span>{item.category}</span></div><span className="activity-date">{item.date}</span><strong className={`activity-amount ${item.amount > 0 ? 'positive' : ''}`}>{item.amount > 0 ? '+' : '−'}{formatCurrency(Math.abs(item.amount))}</strong></article> })}</div></section>
    </>
  )
}