import { Account, Budget, Goal, Transaction } from '../models/Finance.js'
import { AppSettings, UsageEvent } from '../models/AdminData.js'

const models = { accounts: Account, transactions: Transaction, budgets: Budget, goals: Goal }
const creditAccountTypes = ['credit', 'credit_card']
const accountCategories = ['bank_account', 'savings', 'salary', 'cash', 'investment', 'other']
const legacyAccountCategories = {
  checking: 'bank_account',
  debit_card: 'bank_account',
  credit_card: 'bank_account',
  credit: 'bank_account',
  savings: 'savings',
  salary: 'salary',
  cash: 'cash',
  investment: 'investment',
  other: 'other',
}

function normalizeAccount(account) {
  const wasCredit = creditAccountTypes.includes(account.type)
  return {
    ...account,
    type: wasCredit ? 'credit' : 'debit',
    category: wasCredit
      ? null
      : accountCategories.includes(account.category)
        ? account.category
        : legacyAccountCategories[account.type] || 'bank_account',
  }
}

function normalizeTransaction(transaction, accountById) {
  if (transaction.type === 'credit' || transaction.type === 'debit') return transaction

  const account = transaction.accountId ? accountById.get(String(transaction.accountId)) : null
  const isCreditAccount = account && creditAccountTypes.includes(account.type)
  const type =
    transaction.type === 'payment'
      ? 'debit'
      : transaction.type === 'income'
        ? isCreditAccount
          ? 'debit'
          : 'credit'
        : isCreditAccount
          ? 'credit'
          : 'debit'

  return { ...transaction, type }
}

export async function updateAccount(request, response, next) {
  try {
    const allowedFields = ['name', 'type', 'category', 'balance', 'creditLimit', 'paymentDueDate']
    const updates = {}
    for (const field of allowedFields) {
      if (request.body[field] !== undefined) updates[field] = request.body[field]
    }

    if (updates.type !== undefined && !['debit', 'credit'].includes(updates.type)) {
      return response.status(400).json({ message: 'Account type must be debit or credit.' })
    }
    if (updates.type === 'credit') updates.category = null
    if (updates.type === 'debit' && updates.category === undefined)
      updates.category = 'bank_account'
    if (
      updates.category !== undefined &&
      updates.category !== null &&
      !accountCategories.includes(updates.category)
    )
      return response.status(400).json({ message: 'Choose a supported account category.' })
    if (updates.type === undefined && updates.category === null)
      return response.status(400).json({ message: 'Debit accounts need a category.' })
    if (typeof updates.name === 'string') updates.name = updates.name.trim()
    if (updates.balance !== undefined) updates.balance = Number(updates.balance)
    if (updates.creditLimit !== undefined)
      updates.creditLimit =
        updates.creditLimit === '' || updates.creditLimit === null
          ? null
          : Number(updates.creditLimit)
    if (updates.paymentDueDate === '') updates.paymentDueDate = null
    if (updates.paymentDueDate) updates.paymentDueDate = new Date(updates.paymentDueDate)
    if (!Object.keys(updates).length)
      return response.status(400).json({ message: 'No account changes were provided.' })
    if (updates.name !== undefined && !updates.name)
      return response.status(400).json({ message: 'Account name is required.' })
    if (updates.balance !== undefined && (!Number.isFinite(updates.balance) || updates.balance < 0))
      return response.status(400).json({ message: 'Account balance must be zero or more.' })
    if (
      updates.creditLimit !== undefined &&
      updates.creditLimit !== null &&
      (!Number.isFinite(updates.creditLimit) || updates.creditLimit < 0)
    )
      return response.status(400).json({ message: 'Credit limit must be zero or more.' })
    if (updates.paymentDueDate && Number.isNaN(updates.paymentDueDate.getTime()))
      return response.status(400).json({ message: 'Payment due date is invalid.' })

    const currentAccount = await Account.findOne({
      _id: request.params.accountId,
      userId: request.user.id,
    })
    if (!currentAccount) return response.status(404).json({ message: 'Account not found.' })
    const currentIsCredit = creditAccountTypes.includes(currentAccount.type)
    const nextIsCredit = updates.type ? updates.type === 'credit' : currentIsCredit
    const nextBalance = updates.balance ?? currentAccount.balance
    const nextCreditLimit =
      updates.creditLimit === undefined ? currentAccount.creditLimit : updates.creditLimit
    if (currentIsCredit && !nextIsCredit && nextBalance > 0)
      return response.status(400).json({
        message:
          'Record a payment and clear the outstanding card balance before changing this to a debit account.',
      })
    if (
      nextIsCredit &&
      (nextCreditLimit === null || nextCreditLimit === undefined || nextCreditLimit <= 0)
    )
      return response
        .status(400)
        .json({ message: 'Credit cards need a credit limit greater than zero.' })
    if (nextIsCredit && nextCreditLimit && nextBalance > nextCreditLimit)
      return response
        .status(400)
        .json({ message: 'Credit limit cannot be lower than the outstanding balance.' })

    const account = await Account.findOneAndUpdate(
      { _id: request.params.accountId, userId: request.user.id },
      { $set: updates },
      { new: true, runValidators: true },
    )
    if (!account) return response.status(404).json({ message: 'Account not found.' })
    response.json({ item: normalizeAccount(account.toObject()) })
  } catch (error) {
    next(error)
  }
}

export async function listFinance(request, response, next) {
  try {
    const { resource } = request.params
    const Model = models[resource]
    if (!Model) return response.status(404).json({ message: 'Finance resource not found.' })
    const config = await AppSettings.findOne({ key: 'global' })
      .select(`featureFlags.${resource} maintenanceMode`)
      .lean()
    if (config?.maintenanceMode)
      return response
        .status(503)
        .json({ message: 'Finance features are temporarily unavailable during maintenance.' })
    if (config?.featureFlags?.[resource] === false)
      return response.status(503).json({ message: 'This feature is currently disabled.' })
    const [items, count] = await Promise.all([
      Model.find({ userId: request.user.id }).sort({ createdAt: -1 }).limit(200).lean(),
      Model.countDocuments({ userId: request.user.id }),
    ])
    const feature = resource === 'goals' ? 'goals' : resource
    UsageEvent.create({ userId: request.user.id, feature, action: 'list' }).catch(() => {})
    if (resource === 'accounts') return response.json({ items: items.map(normalizeAccount), count })
    if (resource === 'transactions') {
      const accounts = await Account.find({ userId: request.user.id }).select('type').lean()
      const accountById = new Map(accounts.map((account) => [String(account._id), account]))
      return response.json({
        items: items.map((item) => normalizeTransaction(item, accountById)),
        count,
      })
    }
    response.json({ items, count })
  } catch (error) {
    next(error)
  }
}

export async function createFinance(request, response, next) {
  try {
    const { resource } = request.params
    const Model = models[resource]
    if (!Model) return response.status(404).json({ message: 'Finance resource not found.' })
    const config = await AppSettings.findOne({ key: 'global' })
      .select(`featureFlags.${resource} maintenanceMode`)
      .lean()
    if (config?.maintenanceMode)
      return response
        .status(503)
        .json({ message: 'Finance features are temporarily unavailable during maintenance.' })
    if (config?.featureFlags?.[resource] === false)
      return response.status(503).json({ message: 'This feature is currently disabled.' })
    const input = { ...request.body }
    for (const [key, value] of Object.entries(input)) if (value === '') delete input[key]
    if (resource === 'accounts') {
      if (!input.currency) input.currency = request.user.currency || 'INR'
      if (!input.type) input.type = 'debit'
      if (!['debit', 'credit'].includes(input.type))
        return response.status(400).json({ message: 'Account type must be debit or credit.' })
      if (input.type === 'credit') input.category = null
      else {
        if (!input.category) input.category = 'bank_account'
        if (!accountCategories.includes(input.category))
          return response.status(400).json({ message: 'Choose a supported account category.' })
      }
    }
    if (resource === 'accounts' && input.type === 'credit') {
      input.creditLimit = Number(input.creditLimit)
      if (!Number.isFinite(input.creditLimit) || input.creditLimit <= 0)
        return response
          .status(400)
          .json({ message: 'Credit cards need a credit limit greater than zero.' })
      if (Number(input.balance || 0) > input.creditLimit)
        return response
          .status(400)
          .json({ message: 'Outstanding balance cannot exceed the credit limit.' })
    }
    let linkedAccount = null
    if (resource === 'transactions' && input.accountId) {
      linkedAccount = await Account.findOne({ _id: input.accountId, userId: request.user.id })
      if (!linkedAccount)
        return response.status(400).json({ message: 'Choose one of your own accounts.' })
      if (linkedAccount.currency !== request.user.currency)
        return response
          .status(400)
          .json({ message: 'Transaction and account currencies must match your profile currency.' })
    }

    if (resource === 'transactions') {
      const isCreditAccount = linkedAccount && creditAccountTypes.includes(linkedAccount.type)
      if (input.type === 'income') input.type = isCreditAccount ? 'debit' : 'credit'
      if (input.type === 'expense') input.type = isCreditAccount ? 'credit' : 'debit'
      if (input.type === 'payment') {
        if (!isCreditAccount)
          return response
            .status(400)
            .json({ message: 'Card payments can only be recorded on a credit account.' })
        input.type = 'debit'
      }
      if (!['credit', 'debit'].includes(input.type))
        return response.status(400).json({ message: 'Transaction type must be credit or debit.' })

      const amount = Number(input.amount)
      if (
        linkedAccount &&
        input.type === 'debit' &&
        !isCreditAccount &&
        amount > linkedAccount.balance
      ) {
        return response
          .status(400)
          .json({ message: 'This debit exceeds the available account balance.' })
      }
      if (
        linkedAccount &&
        input.type === 'credit' &&
        isCreditAccount &&
        linkedAccount.creditLimit &&
        linkedAccount.balance + amount > linkedAccount.creditLimit
      ) {
        return response.status(400).json({ message: 'This credit exceeds the credit limit.' })
      }
      if (
        linkedAccount &&
        isCreditAccount &&
        input.type === 'debit' &&
        amount > linkedAccount.balance
      ) {
        return response.status(400).json({
          message:
            'This card payment exceeds the outstanding balance. To record a new purchase, choose Purchase; available credit is checked against the credit limit.',
        })
      }
    }

    const item = await Model.create({ ...input, userId: request.user.id })
    if (resource === 'transactions' && item.accountId) {
      const delta = item.type === 'credit' ? item.amount : -item.amount
      await Account.updateOne(
        { _id: item.accountId, userId: request.user.id },
        { $inc: { balance: delta } },
      )
    }
    await UsageEvent.create({ userId: request.user.id, feature: resource, action: 'create' })
    response.status(201).json({ item })
  } catch (error) {
    next(error)
  }
}

export async function financeSummary(request, response, next) {
  try {
    const userId = request.user.id
    const config = await AppSettings.findOne({ key: 'global' })
      .select('featureFlags maintenanceMode')
      .lean()
    if (config?.maintenanceMode)
      return response
        .status(503)
        .json({ message: 'Finance features are temporarily unavailable during maintenance.' })
    const enabled = (feature) => config?.featureFlags?.[feature] !== false
    const [accounts, budgets, goals, transactions, transactionCount] = await Promise.all([
      enabled('accounts')
        ? Account.find({ userId })
            .select('name type category currency balance creditLimit paymentDueDate')
            .lean()
            .then((accounts) => accounts.map(normalizeAccount))
        : [],
      enabled('budgets') ? Budget.find({ userId }).select('category limit period').lean() : [],
      enabled('goals')
        ? Goal.find({ userId }).select('name targetAmount currentAmount targetDate').lean()
        : [],
      enabled('transactions')
        ? Transaction.find({ userId })
            .select('accountId type amount date category description')
            .sort({ date: -1 })
            .limit(200)
            .lean()
        : [],
      enabled('transactions') ? Transaction.countDocuments({ userId }) : 0,
    ])
    const accountById = new Map(accounts.map((account) => [String(account._id), account]))
    const normalizedTransactions = transactions.map((transaction) =>
      normalizeTransaction(transaction, accountById),
    )
    await UsageEvent.create({ userId, feature: 'overview', action: 'view' })
    response.json({
      accounts,
      budgets,
      goals,
      transactions: normalizedTransactions,
      transactionCount,
    })
  } catch (error) {
    next(error)
  }
}
