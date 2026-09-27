import { useState } from 'react'
import { FiCreditCard, FiPlus } from 'react-icons/fi'
import useCurrency from '../../hooks/useCurrency'
import useFinanceData from '../../hooks/useFinanceData'

const accountTypes = [['checking', 'Checking'], ['savings', 'Savings'], ['salary', 'Salary'], ['cash', 'Cash'], ['credit', 'Credit'], ['investment', 'Investment'], ['other', 'Other']]

export default function Accounts() {
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
    values.balance = Number(values.balance)
    try {
      await create('accounts', values)
      form.reset()
      setMessage('Account added.')
    } catch { /* Error is shown by the shared finance hook. */ }
    finally { setSaving(false) }
  }

  return (
    <section className="page-section">
      <header className="page-title-row"><div><span className="eyebrow"><span className="eyebrow-dot" /> YOUR FINANCIAL HOME</span><h1>Accounts</h1><p>Keep your personal accounts together.</p></div></header>
      {error && <p className="finance-message finance-error" role="alert">{error}</p>}{message && <p className="finance-message finance-success" role="status">{message}</p>}
      <section className="account-grid" aria-label="Your accounts">{data?.accounts.map((account) => <article className="account-card" key={account._id}><div className="account-card-top"><span className="account-icon"><FiCreditCard /></span><span className="account-type">{account.type}</span></div><h2>{account.name}</h2><p>{account.currency}</p><strong>{formatCurrency(account.balance, account.currency)}</strong></article>)}{!loading && !data?.accounts.length && <p className="finance-empty account-empty">No accounts yet. Add an account to start tracking your balances.</p>}</section>
      <section className="finance-form-panel"><div className="finance-panel-heading"><div><h2>Add account</h2><p>Balances are visible only in your own workspace.</p></div></div><form className="finance-form" onSubmit={submit}><label>Account name<input name="name" maxLength="80" placeholder="Everyday account" required /></label><label>Account type<select name="type" defaultValue="checking">{accountTypes.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label><label>Opening balance<input name="balance" type="number" min="0" step="0.01" defaultValue="0" required /></label><input type="hidden" name="currency" value={currency} /><button className="add-button" type="submit" disabled={saving}><FiPlus /> {saving ? 'Adding…' : 'Add account'}</button></form></section>
    </section>
  )
}