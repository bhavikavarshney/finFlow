import { useState } from 'react'
import { FiBell, FiCreditCard, FiEdit2, FiPlus, FiX } from 'react-icons/fi'
import useCurrency from '../../hooks/useCurrency'
import useFinanceData from '../../hooks/useFinanceData'
import {
  isSpending,
  transactionDescription,
  transactionSign,
} from '../../utils/financeTransactions'

const accountTypes = [
  ['debit', 'Debit'],
  ['credit', 'Credit'],
]
const accountCategories = [
  ['bank_account', 'Bank account'],
  ['savings', 'Savings'],
  ['salary', 'Salary'],
  ['cash', 'Cash'],
  ['investment', 'Investment'],
  ['other', 'Other'],
]

const isCredit = (account) => ['credit_card', 'credit'].includes(account.type)
const getCategory = (account) =>
  account.category ||
  { checking: 'bank_account', debit_card: 'bank_account', credit_card: null, credit: null }[
    account.type
  ] ||
  (account.type === 'credit' ? null : account.type || 'bank_account')

function dueLabel(value) {
  if (!value) return 'Set a payment due date'
  const dueDate = new Date(value)
  const today = new Date()
  dueDate.setHours(0, 0, 0, 0)
  today.setHours(0, 0, 0, 0)
  const days = Math.round((dueDate - today) / 86400000)
  if (days < 0) return `Past due by ${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'}`
  if (days === 0) return 'Payment due today'
  if (days <= 7) return `Payment due in ${days} day${days === 1 ? '' : 's'}`
  return `Payment due ${new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(dueDate)}`
}

function dateInputValue(value) {
  return value ? new Date(value).toISOString().slice(0, 10) : ''
}

export default function Accounts() {
  const { currency, formatCurrency } = useCurrency()
  const { data, error, loading, create, updateAccount } = useFinanceData()
  const [newType, setNewType] = useState('debit')
  const [newCategory, setNewCategory] = useState('bank_account')
  const [selectedAccountId, setSelectedAccountId] = useState('')
  const [editingAccount, setEditingAccount] = useState(null)
  const [editingType, setEditingType] = useState('debit')
  const [editingCategory, setEditingCategory] = useState('bank_account')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const accounts = data?.accounts || []
  const transactions = data?.transactions || []
  const now = new Date()
  const selectedAccount = accounts.find((account) => account._id === selectedAccountId)

  async function submitNewAccount(event) {
    event.preventDefault()
    setSaving(true)
    setMessage('')
    const form = event.currentTarget
    const values = Object.fromEntries(new FormData(form))
    values.balance = Number(values.balance)
    if (values.type === 'credit') delete values.category
    if (values.creditLimit) values.creditLimit = Number(values.creditLimit)
    else delete values.creditLimit
    if (!values.paymentDueDate) delete values.paymentDueDate
    try {
      await create('accounts', values)
      form.reset()
      setNewType('debit')
      setNewCategory('bank_account')
      setMessage('Account added.')
    } catch {
      /* The shared finance hook exposes the API validation message. */
    } finally {
      setSaving(false)
    }
  }

  async function submitAccountEdit(event) {
    event.preventDefault()
    if (!editingAccount) return
    setSaving(true)
    setMessage('')
    const values = Object.fromEntries(new FormData(event.currentTarget))
    values.balance = Number(values.balance)
    if (values.creditLimit) values.creditLimit = Number(values.creditLimit)
    else values.creditLimit = null
    if (values.type !== 'credit') {
      values.creditLimit = null
      values.paymentDueDate = null
    } else {
      values.category = null
      if (!values.paymentDueDate) values.paymentDueDate = null
    }
    try {
      await updateAccount(editingAccount._id, values)
      setEditingAccount(null)
      setMessage('Account changes saved.')
    } catch {
      /* The shared finance hook exposes the API validation message. */
    } finally {
      setSaving(false)
    }
  }

  const dueSoonLimit = new Date(now)
  dueSoonLimit.setDate(dueSoonLimit.getDate() + 7)
  const creditCardsDueSoon = accounts.filter(
    (account) =>
      isCredit(account) &&
      account.paymentDueDate &&
      new Date(account.paymentDueDate) <= dueSoonLimit,
  )

  return (
    <section className="page-section">
      <header className="page-title-row">
        <div>
          <span className="eyebrow">
            <span className="eyebrow-dot" /> YOUR FINANCIAL HOME
          </span>
          <h1>Accounts</h1>
          <p>Manage bank accounts, debit cards, and credit cards.</p>
        </div>
        <span className="account-total-chip">
          {accounts.length} account{accounts.length === 1 ? '' : 's'}
        </span>
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
      {creditCardsDueSoon.length > 0 && (
        <section className="account-reminder" aria-label="Credit card payment reminders">
          <FiBell />
          <div>
            <strong>Credit card reminders</strong>
            <span>
              {creditCardsDueSoon
                .map(
                  (account) =>
                    `${account.name}: ${dueLabel(account.paymentDueDate)} (${formatCurrency(account.balance, account.currency)} outstanding)`,
                )
                .join(' · ')}
            </span>
          </div>
        </section>
      )}
      <section className="account-grid" aria-label="Your accounts">
        {accounts.map((account) => {
          const creditCard = isCredit(account)
          const accountTransactions = transactions.filter((item) => item.accountId === account._id)
          const cycleStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          const cycleTransactions = accountTransactions.filter(
            (item) => isSpending(item, [account]) && new Date(item.date) >= cycleStart,
          )
          const cycleSpend = cycleTransactions.reduce((sum, item) => sum + item.amount, 0)
          return (
            <article
              className={`account-card ${creditCard ? 'account-card-credit' : ''}`}
              key={account._id}
            >
              <div className="account-card-top">
                <span className="account-icon">
                  <FiCreditCard />
                </span>
                <span className={`account-type ${creditCard ? 'account-type-credit' : ''}`}>
                  {creditCard
                    ? 'Credit'
                    : `Debit · ${accountCategories.find(([value]) => value === getCategory(account))?.[1] || 'Bank account'}`}
                </span>
              </div>
              <h2>{account.name}</h2>
              <p>
                {account.currency}
                {creditCard ? ' · outstanding balance' : ' · available balance'}
              </p>
              <strong>{formatCurrency(account.balance, account.currency)}</strong>
              {creditCard ? (
                <div className="account-card-meta">
                  <span>
                    This month: {cycleTransactions.length} transaction
                    {cycleTransactions.length === 1 ? '' : 's'}
                    <b>{formatCurrency(cycleSpend, account.currency)}</b>
                  </span>
                  {account.creditLimit != null && (
                    <span>
                      Available credit{' '}
                      <b>
                        {formatCurrency(
                          Math.max(0, account.creditLimit - account.balance),
                          account.currency,
                        )}
                      </b>
                    </span>
                  )}
                  <span
                    className={
                      account.paymentDueDate && new Date(account.paymentDueDate) < new Date()
                        ? 'due-overdue'
                        : ''
                    }
                  >
                    <FiBell /> {dueLabel(account.paymentDueDate)}
                  </span>
                </div>
              ) : (
                <div className="account-card-meta">
                  <span>
                    {accountTransactions.length} linked transaction
                    {accountTransactions.length === 1 ? '' : 's'}
                  </span>
                </div>
              )}
              <div className="account-card-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => {
                    setSelectedAccountId(selectedAccountId === account._id ? '' : account._id)
                    setEditingAccount(null)
                  }}
                >
                  {selectedAccountId === account._id ? 'Hide activity' : 'View activity'}
                </button>
                <button
                  type="button"
                  className="text-button account-edit-button"
                  onClick={() => {
                    setEditingAccount(account)
                    setEditingType(creditCard ? 'credit' : 'debit')
                    setEditingCategory(getCategory(account))
                    setSelectedAccountId(account._id)
                  }}
                >
                  <FiEdit2 /> Edit account
                </button>
              </div>
            </article>
          )
        })}
        {!loading && accounts.length === 0 && (
          <p className="finance-empty account-empty">
            No accounts yet. Add an account to start tracking balances and card activity.
          </p>
        )}
      </section>

      {selectedAccount && !editingAccount && (
        <section className="activity-panel account-activity-panel">
          <div className="activity-header">
            <div>
              <h2>{selectedAccount.name} activity</h2>
              <p>
                {isCredit(selectedAccount)
                  ? `Outstanding ${formatCurrency(selectedAccount.balance, selectedAccount.currency)} · this month's card spend ${formatCurrency(
                      transactions
                        .filter(
                          (item) =>
                            item.accountId === selectedAccount._id &&
                            isSpending(item, [selectedAccount]) &&
                            new Date(item.date) >=
                              new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                        )
                        .reduce((sum, item) => sum + item.amount, 0),
                      selectedAccount.currency,
                    )}`
                  : `Current balance ${formatCurrency(selectedAccount.balance, selectedAccount.currency)}`}
              </p>
            </div>
          </div>
          {transactions.filter((item) => item.accountId === selectedAccount._id).length ? (
            <div className="activity-list">
              {transactions
                .filter((item) => item.accountId === selectedAccount._id)
                .map((item) => (
                  <article className="activity-item" key={item._id}>
                    <span
                      className={`activity-icon ${item.type === 'credit' ? 'activity-green' : 'activity-orange'}`}
                    >
                      <FiCreditCard />
                    </span>
                    <div className="activity-detail">
                      <strong>{item.description}</strong>
                      <span>{transactionDescription(item, selectedAccount)}</span>
                    </div>
                    <span className="activity-date">
                      {new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(
                        new Date(item.date),
                      )}
                    </span>
                    <strong
                      className={`activity-amount ${item.type === 'credit' ? 'positive' : ''}`}
                    >
                      {transactionSign(item.type)}
                      {formatCurrency(item.amount, selectedAccount.currency)}
                    </strong>
                  </article>
                ))}
            </div>
          ) : (
            <p className="finance-empty">No transactions linked to this account yet.</p>
          )}
        </section>
      )}

      {editingAccount && (
        <section className="finance-form-panel account-edit-panel">
          <div className="finance-panel-heading">
            <div>
              <h2>Edit account</h2>
              <p>
                {editingType === 'credit'
                  ? 'Credit cards track outstanding balance, limit, and payment due date.'
                  : 'Choose an account category such as Savings or Salary.'}
              </p>
            </div>
            <button
              type="button"
              className="icon-close-button"
              aria-label="Cancel account editing"
              onClick={() => setEditingAccount(null)}
            >
              <FiX />
            </button>
          </div>
          <form className="finance-form" onSubmit={submitAccountEdit}>
            <label>
              Account name
              <input name="name" maxLength="80" defaultValue={editingAccount.name} required />
            </label>
            <label>
              Type
              <select
                name="type"
                value={editingType}
                onChange={(event) => setEditingType(event.target.value)}
              >
                {accountTypes.map(([value, label]) => (
                  <option value={value} key={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            {editingType === 'debit' && (
              <label>
                Category
                <select
                  name="category"
                  value={editingCategory}
                  onChange={(event) => setEditingCategory(event.target.value)}
                >
                  {accountCategories.map(([value, label]) => (
                    <option value={value} key={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <label>
              {editingType === 'credit' ? 'Outstanding balance' : 'Current balance'}
              <input
                name="balance"
                type="number"
                min="0"
                step="0.01"
                defaultValue={editingAccount.balance}
                required
              />
            </label>
            {editingType === 'credit' && (
              <>
                <label>
                  Credit limit
                  <input
                    name="creditLimit"
                    type="number"
                    min="0.01"
                    step="0.01"
                    defaultValue={editingAccount.creditLimit ?? ''}
                    required
                  />
                </label>
                <label>
                  Next payment due
                  <input
                    name="paymentDueDate"
                    type="date"
                    defaultValue={dateInputValue(editingAccount.paymentDueDate)}
                  />
                </label>
              </>
            )}
            <button className="add-button" type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Save account'}
            </button>
          </form>
        </section>
      )}

      <section className="finance-form-panel">
        <div className="finance-panel-heading">
          <div>
            <h2>Add account</h2>
            <p>
              {newType === 'credit'
                ? 'Credit cards track balance, limit, and payment due date without a category.'
                : 'Choose a category such as Savings or Salary for this debit account.'}
            </p>
          </div>
        </div>
        <form className="finance-form" onSubmit={submitNewAccount}>
          <label>
            Account name
            <input name="name" maxLength="80" placeholder="Everyday account" required />
          </label>
          <label>
            Type
            <select
              name="type"
              value={newType}
              onChange={(event) => setNewType(event.target.value)}
            >
              {accountTypes.map(([value, label]) => (
                <option value={value} key={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          {newType === 'debit' && (
            <label>
              Category
              <select
                name="category"
                value={newCategory}
                onChange={(event) => setNewCategory(event.target.value)}
              >
                {accountCategories.map(([value, label]) => (
                  <option value={value} key={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label>
            {newType === 'credit' ? 'Current outstanding balance' : 'Current balance'}
            <input name="balance" type="number" min="0" step="0.01" defaultValue="0" required />
          </label>
          {newType === 'credit' && (
            <>
              <label>
                Credit limit
                <input name="creditLimit" type="number" min="0.01" step="0.01" required />
              </label>
              <label>
                Next payment due
                <input name="paymentDueDate" type="date" />
              </label>
            </>
          )}
          <input type="hidden" name="currency" value={currency} />
          <button className="add-button" type="submit" disabled={saving}>
            <FiPlus /> {saving ? 'Adding…' : 'Add account'}
          </button>
        </form>
      </section>
    </section>
  )
}
