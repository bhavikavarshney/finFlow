export function isCreditAccount(account) {
  return account?.type === 'credit' || account?.type === 'credit_card'
}

export function transactionActivity(transaction, accounts = []) {
  const account = accounts.find((item) => String(item._id) === String(transaction.accountId))

  if (isCreditAccount(account)) {
    return transaction.type === 'credit' ? 'spending' : 'card-adjustment'
  }

  return transaction.type === 'credit' ? 'income' : 'spending'
}

export function isSpending(transaction, accounts) {
  return transactionActivity(transaction, accounts) === 'spending'
}

export function isIncome(transaction, accounts) {
  return transactionActivity(transaction, accounts) === 'income'
}

export function transactionSign(type) {
  return type === 'credit' ? '+' : '−'
}

export function transactionDescription(transaction, account) {
  if (isCreditAccount(account)) {
    return transaction.type === 'credit' ? 'Card spend' : 'Card payment or adjustment'
  }
  return transaction.type === 'credit' ? 'Credit to account' : 'Debit from account'
}
