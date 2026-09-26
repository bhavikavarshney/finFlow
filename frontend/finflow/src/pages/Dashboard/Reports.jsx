import { demoReportCategories, demoSummary } from '../../utils/data'
import useCurrency from '../../hooks/useCurrency'

export default function Reports() {
  const { formatCurrency } = useCurrency()

  return (
    <section className="page-section">
      <header className="page-title-row"><div><span className="eyebrow"><span className="eyebrow-dot" /> MONTHLY SNAPSHOT</span><h1>Reports</h1><p>A simple view of this month’s sample activity.</p></div><span className="report-period">SEPTEMBER 2026</span></header>
      <section className="report-summary"><article><span>Income</span><strong>{formatCurrency(demoSummary.income)}</strong></article><article><span>Spending</span><strong>{formatCurrency(demoSummary.spending)}</strong></article><article><span>Net cash flow</span><strong>{formatCurrency(demoSummary.income - demoSummary.spending)}</strong></article></section>
      <section className="report-breakdown"><div className="activity-header"><div><h2>Spending by category</h2><p>Sample monthly totals</p></div></div>{demoReportCategories.map((item) => <article className="report-category" key={item.category}><div className="report-category-heading"><strong>{item.category}</strong><span>{formatCurrency(item.amount)}</span></div><div className="budget-track"><span className="budget-green" style={{ width: `${item.share}%` }} /></div></article>)}</section>
    </section>
  )
}