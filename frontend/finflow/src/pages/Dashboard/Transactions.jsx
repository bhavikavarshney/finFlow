import { useState } from 'react'
import { FiArrowDownLeft, FiArrowUpRight, FiPlus } from 'react-icons/fi'
import useCurrency from '../../hooks/useCurrency'
import useFinanceData from '../../hooks/useFinanceData'
import {
  isCreditAccount,
  transactionDescription,
  transactionSign,
} from '../../utils/financeTransactions'

export default function Transactions() {
  const { currency, formatCurrency } = useCurrency()
  const { data, error, loading, create } = useFinanceData()
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [accountId, setAccountId] = useState('')
  const [type, setType] = useState('debit')
  const selectedAccount = data?.accounts.find((account) => account._id === accountId)
  const selectedCreditCard = isCreditAccount(selectedAccount)

  async function submit(event) {
    event.preventDefault()
    setSaving(true)
    setMessage('')
    const form = event.currentTarget
    const values = Object.fromEntries(new FormData(form))
    values.amount = Number(values.amount)
    if (selectedCreditCard) values.type = values.type === 'purchase' ? 'credit' : 'debit'
    try {
      await create('transactions', values)
      form.reset()
      setAccountId('')
      setType('debit')
      setMessage('Transaction added.')
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
            <span className="eyebrow-dot" /> FINANCES
          </span>
          <h1>Transactions</h1>
          <p>Track income and spending in your accounts.</p>
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
      <section className="finance-form-panel">
        <div className="finance-panel-heading">
          <div>
            <h2>Add transaction</h2>
            <p>
              Amounts are entered in {currency}.{' '}
              {selectedCreditCard
                ? 'Purchases use available credit; payments reduce the amount owed.'
                : 'Credit adds available funds; Debit spends them.'}
            </p>
          </div>
        </div>
        <form className="finance-form finance-form-wide" onSubmit={submit}>
          <label>
            Description
            <input
              name="description"
              maxLength="120"
              placeholder="Groceries, salary, or card payment"
              required
            />
          </label>
          <label>
            Type
            <select
              name="type"
              value={selectedCreditCard ? (type === 'credit' ? 'purchase' : 'payment') : type}
              onChange={(event) =>
                setType(
                  selectedCreditCard
                    ? event.target.value === 'purchase'
                      ? 'credit'
                      : 'debit'
                    : event.target.value,
                )
              }
            >
              {selectedCreditCard ? (
                <>
                  <option value="purchase">Purchase · use available credit</option>
                  <option value="payment">Payment or refund · reduce amount owed</option>
                </>
              ) : (
                <>
                  <option value="credit">Credit · money in</option>
                  <option value="debit">Debit · money out</option>
                </>
              )}
            </select>
          </label>
          <label>
            Amount
            <input name="amount" type="number" min="0.01" step="0.01" required />
          </label>
          <label>
            Category
            <input name="category" maxLength="50" placeholder="Food & dining" required />
          </label>
          <label>
            Account
            <select
              name="accountId"
              value={accountId}
              onChange={(event) => {
                const nextAccount = data?.accounts.find(
                  (account) => account._id === event.target.value,
                )
                setAccountId(event.target.value)
                setType(isCreditAccount(nextAccount) ? 'credit' : 'debit')
              }}
            >
              <option value="">Unassigned</option>
              {data?.accounts.map((account) => (
                <option key={account._id} value={account._id}>
                  {account.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Date
            <input
              name="date"
              type="date"
              defaultValue={new Date().toISOString().slice(0, 10)}
              required
            />
          </label>
          <button className="add-button" type="submit" disabled={saving}>
            <FiPlus /> {saving ? 'Adding…' : 'Add transaction'}
          </button>
        </form>
      </section>
      <section className="activity-panel transactions-panel">
        <div className="activity-header">
          <div>
            <h2>All transactions</h2>
            <p>{data?.transactionCount || 0} personal records</p>
          </div>
        </div>
        {data?.transactions.length ? (
          <div className="transaction-list">
            {data.transactions.map((item) => {
              const account = data.accounts.find(
                (entry) => String(entry._id) === String(item.accountId),
              )
              return (
                <article className="activity-item" key={item._id}>
                  <span
                    className={`activity-icon ${item.type === 'credit' ? 'activity-green' : 'activity-orange'}`}
                  >
                    {item.type === 'credit' ? <FiArrowDownLeft /> : <FiArrowUpRight />}
                  </span>
                  <div className="activity-detail">
                    <strong>{item.description}</strong>
                    <span>{transactionDescription(item, account)}</span>
                  </div>
                  <span className="activity-date">
                    {new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(
                      new Date(item.date),
                    )}
                  </span>
                  <strong className={`activity-amount ${item.type === 'credit' ? 'positive' : ''}`}>
                    {transactionSign(item.type)}
                    {formatCurrency(item.amount)}
                  </strong>
                </article>
              )
            })}
          </div>
        ) : (
          <p className="finance-empty">
            {loading ? 'Loading transactions…' : 'No transactions yet.'}
          </p>
        )}
      </section>
    </section>
  )
}
