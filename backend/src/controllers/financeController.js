import { Account, Budget, Goal, Transaction } from '../models/Finance.js'
import { AppSettings, UsageEvent } from '../models/AdminData.js'

const models = { accounts: Account, transactions: Transaction, budgets: Budget, goals: Goal }

export async function listFinance(request, response, next) {
  try {
    const { resource } = request.params
    const Model = models[resource]
    if (!Model) return response.status(404).json({ message: 'Finance resource not found.' })
    const config = await AppSettings.findOne({ key: 'global' }).select(`featureFlags.${resource} maintenanceMode`).lean()
    if (config?.maintenanceMode) return response.status(503).json({ message: 'Finance features are temporarily unavailable during maintenance.' })
    if (config?.featureFlags?.[resource] === false) return response.status(503).json({ message: 'This feature is currently disabled.' })
    const [items, count] = await Promise.all([
      Model.find({ userId: request.user.id }).sort({ createdAt: -1 }).limit(200).lean(),
      Model.countDocuments({ userId: request.user.id }),
    ])
    const feature = resource === 'goals' ? 'goals' : resource
    UsageEvent.create({ userId: request.user.id, feature, action: 'list' }).catch(() => {})
    response.json({ items, count })
  } catch (error) { next(error) }
}

export async function createFinance(request, response, next) {
  try {
    const { resource } = request.params
    const Model = models[resource]
    if (!Model) return response.status(404).json({ message: 'Finance resource not found.' })
    const config = await AppSettings.findOne({ key: 'global' }).select(`featureFlags.${resource} maintenanceMode`).lean()
    if (config?.maintenanceMode) return response.status(503).json({ message: 'Finance features are temporarily unavailable during maintenance.' })
    if (config?.featureFlags?.[resource] === false) return response.status(503).json({ message: 'This feature is currently disabled.' })
    const input = { ...request.body }
    for (const [key, value] of Object.entries(input)) if (value === '') delete input[key]
    if (resource === 'accounts' && !input.currency) input.currency = request.user.currency || 'INR'

    if (resource === 'transactions' && input.accountId) {
      const account = await Account.findOne({ _id: input.accountId, userId: request.user.id })
      if (!account) return response.status(400).json({ message: 'Choose one of your own accounts.' })
      if (account.currency !== request.user.currency) return response.status(400).json({ message: 'Transaction and account currencies must match your profile currency.' })
      if (input.type === 'expense' && Number(input.amount) > account.balance) return response.status(400).json({ message: 'This expense exceeds the selected account balance.' })
    }

    const item = await Model.create({ ...input, userId: request.user.id })
    if (resource === 'transactions' && item.accountId) {
      const delta = item.type === 'income' ? item.amount : -item.amount
      await Account.updateOne({ _id: item.accountId, userId: request.user.id }, { $inc: { balance: delta } })
    }
    await UsageEvent.create({ userId: request.user.id, feature: resource, action: 'create' })
    response.status(201).json({ item })
  } catch (error) { next(error) }
}

export async function financeSummary(request, response, next) {
  try {
    const userId = request.user.id
    const config = await AppSettings.findOne({ key: 'global' }).select('featureFlags maintenanceMode').lean()
    if (config?.maintenanceMode) return response.status(503).json({ message: 'Finance features are temporarily unavailable during maintenance.' })
    const enabled = (feature) => config?.featureFlags?.[feature] !== false
    const [accounts, budgets, goals, transactions, transactionCount] = await Promise.all([
      enabled('accounts') ? Account.find({ userId }).select('name type currency balance').lean() : [],
      enabled('budgets') ? Budget.find({ userId }).select('category limit period').lean() : [],
      enabled('goals') ? Goal.find({ userId }).select('name targetAmount currentAmount targetDate').lean() : [],
      enabled('transactions') ? Transaction.find({ userId }).select('type amount date category description').sort({ date: -1 }).limit(200).lean() : [],
      enabled('transactions') ? Transaction.countDocuments({ userId }) : 0,
    ])
    await UsageEvent.create({ userId, feature: 'overview', action: 'view' })
    response.json({ accounts, budgets, goals, transactions, transactionCount })
  } catch (error) { next(error) }
}