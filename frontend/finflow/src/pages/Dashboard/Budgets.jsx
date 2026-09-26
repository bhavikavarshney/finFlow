import useCurrency from '../../hooks/useCurrency'
import { demoBudgets } from '../../utils/data'

export default function Budgets() {
  const { formatCurrency } = useCurrency()
  const totalLimit = demoBudgets.reduce((sum, budget) => sum + budget.limit, 0)
  const totalSpent = demoBudgets.reduce((sum, budget) => sum + budget.spent, 0)

  return (
    <section className="page-section">
      <header className="page-title-row"><div><span className="eyebrow"><span className="eyebrow-dot" /> SPENDING PLAN</span><h1>Budgets</h1><p>Keep an eye on spending by category.</p></div></header>
      <section className="budget-summary"><div><span>Spent this month</span><strong>{formatCurrency(totalSpent)}</strong></div><div><span>Total budget</span><strong>{formatCurrency(totalLimit)}</strong></div><div><span>Remaining</span><strong>{formatCurrency(totalLimit - totalSpent)}</strong></div></section>
      <section className="budget-list" aria-label="Sample category budgets">{demoBudgets.map((budget) => { const percent = Math.min(Math.round((budget.spent / budget.limit) * 100), 100); return <article className="budget-item" key={budget.category}><div className="budget-heading"><div><span className={`budget-dot ${budget.color}`} /><strong>{budget.category}</strong></div><span>{percent}% used</span></div><div className="budget-track"><span className={budget.color} style={{ width: `${percent}%` }} /></div><div className="budget-amounts"><span>{formatCurrency(budget.spent)} spent</span><span>of {formatCurrency(budget.limit)}</span></div></article> })}</section>
    </section>
  )
}