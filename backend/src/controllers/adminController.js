import mongoose from 'mongoose'
import User from '../models/User.js'
import { Account, Budget, Goal, Transaction } from '../models/Finance.js'
import { AppSettings, AuditLog, SystemEvent, UsageEvent } from '../models/AdminData.js'

const DAY = 24 * 60 * 60 * 1000

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

async function recordAudit(request, action, targetType, targetId, summary) {
  await AuditLog.create({ actorId: request.user.id, actorType: 'admin', action, targetType, targetId, summary })
}

export async function overview(_request, response, next) {
  try {
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * DAY)
    const [totalUsers, activeUsers, newUsers, totalTransactions, totalAccounts, totalBudgets, totalGoals] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ status: { $ne: 'suspended' }, lastActiveAt: { $gte: thirtyDaysAgo } }),
      User.countDocuments({ createdAt: { $gte: monthStart } }),
      Transaction.countDocuments(),
      Account.countDocuments(),
      Budget.countDocuments(),
      Goal.countDocuments(),
    ])
    response.json({ totalUsers, activeUsers, newUsers, totalTransactions, totalAccounts, totalBudgets, totalGoals })
  } catch (error) { next(error) }
}

export async function listUsers(request, response, next) {
  try {
    const page = Math.max(1, Number.parseInt(request.query.page, 10) || 1)
    const limit = Math.min(50, Math.max(1, Number.parseInt(request.query.limit, 10) || 10))
    const filter = {}
    if (request.query.status === 'active') filter.$and = [{ $or: [{ status: 'active' }, { status: { $exists: false } }] }]
    if (request.query.status === 'suspended') filter.status = 'suspended'
    if (request.query.role === 'user' || request.query.role === 'admin') filter.role = request.query.role
    if (typeof request.query.search === 'string' && request.query.search.trim()) {
      const matcher = new RegExp(escapeRegex(request.query.search.trim().slice(0, 80)), 'i')
      filter.$and = [...(filter.$and || []), { $or: [{ name: matcher }, { email: matcher }] }]
    }

    const [users, total] = await Promise.all([
      User.aggregate([
        { $match: filter },
        { $sort: { createdAt: -1 } },
        { $skip: (page - 1) * limit },
        { $limit: limit },
        { $lookup: { from: Transaction.collection.name, localField: '_id', foreignField: 'userId', as: 'transactionRecords' } },
        { $project: {
          _id: 1,
          name: 1,
          email: 1,
          role: 1,
          status: { $ifNull: ['$status', 'active'] },
          createdAt: 1,
          lastActiveAt: 1,
          transactionCount: { $size: '$transactionRecords' },
        } },
      ]),
      User.countDocuments(filter),
    ])
    response.json({ users, page, pages: Math.max(1, Math.ceil(total / limit)), total })
  } catch (error) { next(error) }
}

export async function updateUserStatus(request, response, next) {
  try {
    const { status } = request.body
    if (!['active', 'suspended'].includes(status)) return response.status(400).json({ message: 'Status must be active or suspended.' })
    if (request.params.userId === request.user.id && status === 'suspended') return response.status(400).json({ message: 'You cannot suspend your own admin account.' })

    const user = await User.findById(request.params.userId).select('name email role status')
    if (!user) return response.status(404).json({ message: 'User not found.' })
    if (user.role === 'admin' && status === 'suspended') {
      const activeAdmins = await User.countDocuments({ role: 'admin', status: { $ne: 'suspended' } })
      if (activeAdmins <= 1) return response.status(409).json({ message: 'The last active administrator cannot be suspended.' })
    }

    user.status = status
    await user.save()
    await recordAudit(request, `user.${status}`, 'user', user.id, `${status === 'active' ? 'Activated' : 'Suspended'} account ${user.email}.`)
    response.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role, status: user.status } })
  } catch (error) { next(error) }
}

export async function analytics(_request, response, next) {
  try {
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekStart = new Date(todayStart.getTime() - 6 * DAY)
    const monthStart = new Date(todayStart.getTime() - 29 * DAY)
    const [dailyActiveUsers, weeklyActiveUsers, monthlyActiveUsers, featureUsage, transactionTrend, userGrowth, transactionTypes] = await Promise.all([
      User.countDocuments({ status: { $ne: 'suspended' }, lastActiveAt: { $gte: todayStart } }),
      User.countDocuments({ status: { $ne: 'suspended' }, lastActiveAt: { $gte: weekStart } }),
      User.countDocuments({ status: { $ne: 'suspended' }, lastActiveAt: { $gte: monthStart } }),
      UsageEvent.aggregate([
        { $match: { createdAt: { $gte: monthStart } } },
        { $group: { _id: '$feature', events: { $sum: 1 }, users: { $addToSet: '$userId' } } },
        { $project: { feature: '$_id', events: 1, users: { $size: '$users' }, _id: 0 } },
        { $sort: { events: -1 } },
      ]),
      Transaction.aggregate([
        { $match: { createdAt: { $gte: monthStart } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
        { $project: { date: '$_id', count: 1, _id: 0 } },
      ]),
      User.aggregate([
        { $match: { createdAt: { $gte: monthStart } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
        { $project: { date: '$_id', count: 1, _id: 0 } },
      ]),
      Transaction.aggregate([
        { $group: { _id: '$type', count: { $sum: 1 } } },
        { $project: { type: '$_id', count: 1, _id: 0 } },
      ]),
    ])

    response.json({
      dailyActiveUsers,
      weeklyActiveUsers,
      monthlyActiveUsers,
      featureUsage,
      transactionTrend,
      userGrowth,
      transactionTypes,
      windowStart: monthStart,
    })
  } catch (error) { next(error) }
}

export async function health(request, response, next) {
  try {
    const startedAt = Date.now()
    await mongoose.connection.db.admin().ping()
    const databaseResponseTimeMs = Date.now() - startedAt
    const recentErrors = await SystemEvent.find({ level: 'error' }).sort({ createdAt: -1 }).limit(8).select('source message createdAt resolved').lean()
    response.json({
      api: 'online',
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      uptimeSeconds: Math.floor(process.uptime()),
      databaseResponseTimeMs,
      errorRate: request.app.locals.metrics.errorRate(),
      averageResponseTimeMs: request.app.locals.metrics.averageResponseTime(),
      recentErrors,
    })
  } catch (error) { next(error) }
}

export async function auditLogs(request, response, next) {
  try {
    const limit = Math.min(100, Math.max(1, Number.parseInt(request.query.limit, 10) || 30))
    const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(limit)
      .populate('actorId', 'name email')
      .select('actorId actorType action targetType targetId summary createdAt')
      .lean()
    response.json({ logs })
  } catch (error) { next(error) }
}

export async function notifications(_request, response, next) {
  try {
    const events = await SystemEvent.find({ resolved: false }).sort({ createdAt: -1 }).limit(30).select('level source message createdAt').lean()
    response.json({ notifications: events })
  } catch (error) { next(error) }
}

export async function getSettings(_request, response, next) {
  try {
    const settings = await AppSettings.findOneAndUpdate({ key: 'global' }, { $setOnInsert: { key: 'global' } }, { new: true, upsert: true, setDefaultsOnInsert: true }).lean()
    response.json({ settings })
  } catch (error) { next(error) }
}

export async function updateSettings(request, response, next) {
  try {
    const { registrationEnabled, maintenanceMode, featureFlags } = request.body
    const updates = {}
    if (typeof registrationEnabled === 'boolean') updates.registrationEnabled = registrationEnabled
    if (typeof maintenanceMode === 'boolean') updates.maintenanceMode = maintenanceMode
    if (featureFlags && typeof featureFlags === 'object' && !Array.isArray(featureFlags)) {
      const validFlags = ['accounts', 'transactions', 'budgets', 'goals', 'reports']
      for (const [key, value] of Object.entries(featureFlags)) {
        if (!validFlags.includes(key) || typeof value !== 'boolean') return response.status(400).json({ message: 'Feature flags must use supported names and boolean values.' })
        updates[`featureFlags.${key}`] = value
      }
    }
    if (!Object.keys(updates).length) return response.status(400).json({ message: 'No valid settings were provided.' })
    updates.updatedBy = request.user.id
    const settings = await AppSettings.findOneAndUpdate({ key: 'global' }, { $set: updates }, { new: true, upsert: true, setDefaultsOnInsert: true })
    await recordAudit(request, 'settings.updated', 'application', 'global', 'Updated application settings.')
    response.json({ settings })
  } catch (error) { next(error) }
}

export async function exportReport(request, response, next) {
  try {
    const since = new Date(Date.now() - 29 * DAY)
    const [users, transactions] = await Promise.all([
      User.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Transaction.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
    ])
    const rows = [['date', 'new_users', 'transactions_created']]
    const days = new Map()
    for (const item of users) days.set(item._id, { users: item.count, transactions: 0 })
    for (const item of transactions) days.set(item._id, { ...days.get(item._id), transactions: item.count })
    for (const [date, counts] of [...days.entries()].sort(([a], [b]) => a.localeCompare(b))) rows.push([date, counts.users || 0, counts.transactions || 0])
    await recordAudit(request, 'report.exported', 'report', 'usage', 'Exported an aggregated usage report.')
    response.type('text/csv').attachment('finflow-usage-report.csv').send(rows.map((row) => row.join(',')).join('\n'))
  } catch (error) { next(error) }
}