import useCurrency from '../../hooks/useCurrency'
import useFinanceData from '../../hooks/useFinanceData'

export default function Reports() {
  const { formatCurrency } = useCurrency()
  const { data, error, loading } = useFinanceData()
  const transactions = data?.transactions || []
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  const monthly = transactions.filter((item) => new Date(item.date) >= monthStart)
  const income = monthly.filter((item) => item.type === 'income').reduce((sum, item) => sum + item.amount, 0)
  const spending = monthly.filter((item) => item.type === 'expense').reduce((sum, item) => sum + item.amount, 0)
  const byCategory = monthly.filter((item) => item.type === 'expense').reduce((totals, item) => ({ ...totals, [item.category]: (totals[item.category] || 0) + item.amount }), {})
  const categories = Object.entries(byCategory).map(([category, amount]) => ({ category, amount })).sort((a, b) => b.amount - a.amount)
  const highest = Math.max(1, ...categories.map((item) => item.amount))

  return (
    <section className="page-section">
      <header className="page-title-row"><div><span className="eyebrow"><span className="eyebrow-dot" /> MONTHLY SNAPSHOT</span><h1>Reports</h1><p>A summary of your own activity this month.</p></div><span className="report-period">{new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' }).format(new Date()).toUpperCase()}</span></header>
      {error && <p className="finance-message finance-error" role="alert">{error}</p>}
      <section className="report-summary"><article><span>Income</span><strong>{loading ? '—' : formatCurrency(income)}</strong></article><article><span>Spending</span><strong>{loading ? '—' : formatCurrency(spending)}</strong></article><article><span>Net cash flow</span><strong>{loading ? '—' : formatCurrency(income - spending)}</strong></article></section>
      <section className="report-breakdown"><div className="activity-header"><div><h2>Spending by category</h2><p>Based on your recorded expenses</p></div></div>{categories.length ? categories.map((item) => <article className="report-category" key={item.category}><div className="report-category-heading"><strong>{item.category}</strong><span>{formatCurrency(item.amount)}</span></div><div className="budget-track"><span className="budget-green" style={{ width: `${Math.round(item.amount / highest * 100)}%` }} /></div></article>) : <p className="finance-empty">{loading ? 'Loading your report…' : 'No expense data for this month yet.'}</p>}</section>
    </section>
  )
}