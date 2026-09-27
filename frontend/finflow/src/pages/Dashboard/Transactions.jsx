import { useState } from 'react'
import { FiArrowDownLeft, FiArrowUpRight, FiPlus } from 'react-icons/fi'
import useCurrency from '../../hooks/useCurrency'
import useFinanceData from '../../hooks/useFinanceData'

export default function Transactions() {
  const { currency, formatCurrency } = useCurrency()
  const { data, error, loading, create } = useFinanceData()
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  async function submit(event) {
    event.preventDefault()
    setSaving(true)
    setMessage('')
    const form = event.currentTarget
    const values = Object.fromEntries(new FormData(form))
    values.amount = Number(values.amount)
    try {
      await create('transactions', values)
      form.reset()
      setMessage('Transaction added.')
    } catch { /* Error is shown by the shared finance hook. */ }
    finally { setSaving(false) }
  }

  return (
    <section className="page-section">
      <header className="page-title-row"><div><span className="eyebrow"><span className="eyebrow-dot" /> FINANCES</span><h1>Transactions</h1><p>Track income and spending in your accounts.</p></div></header>
      {error && <p className="finance-message finance-error" role="alert">{error}</p>}{message && <p className="finance-message finance-success" role="status">{message}</p>}
      <section className="finance-form-panel"><div className="finance-panel-heading"><div><h2>Add transaction</h2><p>Recorded in {currency}.</p></div></div><form className="finance-form finance-form-wide" onSubmit={submit}><label>Description<input name="description" maxLength="120" placeholder="Groceries" required /></label><label>Type<select name="type"><option value="expense">Expense</option><option value="income">Income</option></select></label><label>Amount<input name="amount" type="number" min="0.01" step="0.01" required /></label><label>Category<input name="category" maxLength="50" placeholder="Food & dining" required /></label><label>Account<select name="accountId" defaultValue=""><option value="">Unassigned</option>{data?.accounts.map((account) => <option key={account._id} value={account._id}>{account.name}</option>)}</select></label><label>Date<input name="date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required /></label><button className="add-button" type="submit" disabled={saving}><FiPlus /> {saving ? 'Adding…' : 'Add transaction'}</button></form></section>
      <section className="activity-panel transactions-panel"><div className="activity-header"><div><h2>All transactions</h2><p>{data?.transactionCount || 0} personal records</p></div></div>{data?.transactions.length ? <div className="transaction-list">{data.transactions.map((item) => <article className="activity-item" key={item._id}><span className={`activity-icon ${item.type === 'income' ? 'activity-green' : 'activity-orange'}`}>{item.type === 'income' ? <FiArrowDownLeft /> : <FiArrowUpRight />}</span><div className="activity-detail"><strong>{item.description}</strong><span>{item.category}</span></div><span className="activity-date">{new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(item.date))}</span><strong className={`activity-amount ${item.type === 'income' ? 'positive' : ''}`}>{item.type === 'income' ? '+' : '−'}{formatCurrency(item.amount)}</strong></article>)}</div> : <p className="finance-empty">{loading ? 'Loading transactions…' : 'No transactions yet.'}</p>}</section>
    </section>
  )
}