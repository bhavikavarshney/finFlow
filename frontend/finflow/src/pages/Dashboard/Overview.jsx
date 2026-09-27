import { useNavigate } from 'react-router-dom'
import { FiArrowDownLeft, FiArrowUpRight, FiCreditCard, FiPlus, FiTrendingUp } from 'react-icons/fi'
import { useAuth } from '../../context/useAuth'
import useCurrency from '../../hooks/useCurrency'
import useFinanceData from '../../hooks/useFinanceData'

export default function Overview() {
  const { user } = useAuth()
  const { formatCurrency } = useCurrency()
  const { data, error, loading } = useFinanceData()
  const navigate = useNavigate()
  const transactions = data?.transactions || []
  const accountBalance = (data?.accounts || []).reduce((total, account) => total + account.balance, 0)
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  const monthlyTransactions = transactions.filter((item) => new Date(item.date) >= monthStart)
  const income = monthlyTransactions.filter((item) => item.type === 'income').reduce((total, item) => total + item.amount, 0)
  const spending = monthlyTransactions.filter((item) => item.type === 'expense').reduce((total, item) => total + item.amount, 0)
  const today = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: '2-digit', year: 'numeric' }).format(new Date()).toUpperCase()

  return (
    <>
      <section className="welcome-row"><div><span className="eyebrow"><span className="eyebrow-dot" /> {today}</span><h1>Good morning, {user?.name?.split(' ')[0]}.</h1><p>Your accounts and activity at a glance.</p></div><button className="add-button" type="button" onClick={() => navigate('/dashboard/transactions')}><FiPlus /> Add transaction</button></section>
      {error && <p className="finance-message finance-error" role="alert">{error}</p>}
      <section className="overview-grid" aria-label="Personal finance summary">
        <article className="balance-panel"><div className="balance-top"><span>Total balance</span><span className="balance-period">{data?.accounts.length || 0} ACCOUNTS</span></div><p className="balance-amount">{loading ? '—' : formatCurrency(accountBalance)}</p><div className="balance-change"><span><FiTrendingUp /> PERSONAL</span> <span>across your accounts</span></div><div className="account-balance-note"><span><FiCreditCard /> Account balances are private to your profile</span><button type="button" onClick={() => navigate('/dashboard/accounts')}>View accounts <FiArrowUpRight /></button></div></article>
        <article className="metric-panel income-panel"><div className="metric-icon"><FiArrowDownLeft /></div><p>Income <span>THIS MONTH</span></p><strong>{loading ? '—' : formatCurrency(income)}</strong><small>{monthlyTransactions.filter((item) => item.type === 'income').length} transactions this month</small><div className="metric-rule"><i /></div></article>
        <article className="metric-panel spending-panel"><div className="metric-icon"><FiArrowUpRight /></div><p>Spending <span>THIS MONTH</span></p><strong>{loading ? '—' : formatCurrency(spending)}</strong><small>{monthlyTransactions.filter((item) => item.type === 'expense').length} transactions this month</small><div className="metric-rule"><i /></div></article>
      </section>
      <section className="activity-panel"><div className="activity-header"><div><h2>Recent activity</h2><p>Your latest personal transactions</p></div><button type="button" onClick={() => navigate('/dashboard/transactions')}>View all <FiArrowUpRight /></button></div>{transactions.length ? <div className="activity-list">{transactions.slice(0, 5).map((item) => <article className="activity-item" key={item._id}><span className={`activity-icon ${item.type === 'income' ? 'activity-green' : 'activity-orange'}`}>{item.type === 'income' ? <FiArrowDownLeft /> : <FiArrowUpRight />}</span><div className="activity-detail"><strong>{item.description}</strong><span>{item.category}</span></div><span className="activity-date">{new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(item.date))}</span><strong className={`activity-amount ${item.type === 'income' ? 'positive' : ''}`}>{item.type === 'income' ? '+' : '−'}{formatCurrency(item.amount)}</strong></article>)}</div> : <p className="finance-empty">{loading ? 'Loading your activity…' : 'No transactions yet. Add your first transaction to get started.'}</p>}</section>
    </>
  )
}