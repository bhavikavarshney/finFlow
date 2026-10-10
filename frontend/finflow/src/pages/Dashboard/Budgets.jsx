import { useState } from 'react'
import { FiPlus } from 'react-icons/fi'
import useCurrency from '../../hooks/useCurrency'
import useFinanceData from '../../hooks/useFinanceData'
import { isSpending } from '../../utils/financeTransactions'

export default function Budgets() {
  const { formatCurrency } = useCurrency()
  const { data, error, loading, create } = useFinanceData()
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const budgets = data?.budgets || []
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const weekStart = new Date(now)
  weekStart.setDate(weekStart.getDate() - 7)
  const totalSpent = (data?.transactions || [])
    .filter((item) => isSpending(item, data?.accounts || []) && new Date(item.date) >= monthStart)
    .reduce((sum, item) => sum + item.amount, 0)
  const totalLimit = budgets.reduce((sum, budget) => sum + budget.limit, 0)

  async function submit(event) {
    event.preventDefault()
    setSaving(true)
    setMessage('')
    const form = event.currentTarget
    const values = Object.fromEntries(new FormData(form))
    values.limit = Number(values.limit)
    try {
      await create('budgets', values)
      form.reset()
      setMessage('Budget added.')
    } catch {
      /* Error is shown by the shared finance hook. */
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="page-section">
      <header className="page-title-row">
        <div>
          <span className="eyebrow">
            <span className="eyebrow-dot" /> SPENDING PLAN
          </span>
          <h1>Budgets</h1>
          <p>Set category limits for your personal finances.</p>
        </div>
      </header>
      {error && (
        <p className="finance-message finance-error" role="alert">
          {error}
        </p>
      )}
      {message && (
        <p className="finance-message finance-success" role="status">
          {message}
        </p>
      )}
      <section className="budget-summary">
        <div>
          <span>Spent this month</span>
          <strong>{formatCurrency(totalSpent)}</strong>
        </div>
        <div>
          <span>Total budget limits</span>
          <strong>{formatCurrency(totalLimit)}</strong>
        </div>
        <div>
          <span>Remaining</span>
          <strong>{formatCurrency(Math.max(0, totalLimit - totalSpent))}</strong>
        </div>
      </section>
      <section className="budget-list" aria-label="Your budgets">
        {budgets.map((budget) => {
          const periodStart = budget.period === 'weekly' ? weekStart : monthStart
          const spent = (data?.transactions || [])
            .filter(
              (item) =>
                isSpending(item, data?.accounts || []) &&
                item.category.toLowerCase() === budget.category.toLowerCase() &&
                new Date(item.date) >= periodStart,
            )
            .reduce((sum, item) => sum + item.amount, 0)
          const percent = Math.min(Math.round((spent / budget.limit) * 100), 100)
          return (
            <article className="budget-item" key={budget._id}>
              <div className="budget-heading">
                <div>
                  <span className="budget-dot budget-green" />
                  <strong>{budget.category}</strong>
                </div>
                <span>
                  {percent}% used · {budget.period}
                </span>
              </div>
              <div className="budget-track">
                <span className="budget-green" style={{ width: `${percent}%` }} />
              </div>
              <div className="budget-amounts">
                <span>{formatCurrency(spent)} spent</span>
                <span>of {formatCurrency(budget.limit)}</span>
              </div>
            </article>
          )
        })}
        {!loading && !budgets.length && (
          <p className="finance-empty">No budgets yet. Add a category limit below.</p>
        )}
      </section>
      <section className="finance-form-panel">
        <div className="finance-panel-heading">
          <div>
            <h2>Add budget</h2>
            <p>Create a weekly or monthly spending limit.</p>
          </div>
        </div>
        <form className="finance-form" onSubmit={submit}>
          <label>
            Category
            <input name="category" maxLength="50" placeholder="Food & dining" required />
          </label>
          <label>
            Limit
            <input name="limit" type="number" min="0.01" step="0.01" required />
          </label>
          <label>
            Period
            <select name="period">
              <option value="monthly">Monthly</option>
              <option value="weekly">Weekly</option>
            </select>
          </label>
          <button className="add-button" type="submit" disabled={saving}>
            <FiPlus /> {saving ? 'Adding…' : 'Add budget'}
          </button>
        </form>
      </section>
    </section>
  )
}
