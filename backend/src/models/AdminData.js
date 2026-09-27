import mongoose from 'mongoose'

const usageEventSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  feature: { type: String, enum: ['overview', 'accounts', 'transactions', 'budgets', 'goals', 'reports'], required: true },
  action: { type: String, required: true, maxlength: 40 },
}, { timestamps: true })

const auditLogSchema = new mongoose.Schema({
  actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  actorType: { type: String, enum: ['admin', 'system'], default: 'admin' },
  action: { type: String, required: true, maxlength: 80 },
  targetType: { type: String, default: '', maxlength: 40 },
  targetId: { type: String, default: '', maxlength: 80 },
  summary: { type: String, required: true, maxlength: 240 },
}, { timestamps: true })

const systemEventSchema = new mongoose.Schema({
  level: { type: String, enum: ['info', 'warning', 'error'], default: 'info' },
  source: { type: String, required: true, maxlength: 60 },
  message: { type: String, required: true, maxlength: 300 },
  resolved: { type: Boolean, default: false },
}, { timestamps: true })

const appSettingsSchema = new mongoose.Schema({
  key: { type: String, default: 'global', unique: true },
  registrationEnabled: { type: Boolean, default: true },
  maintenanceMode: { type: Boolean, default: false },
  featureFlags: {
    accounts: { type: Boolean, default: true },
    transactions: { type: Boolean, default: true },
    budgets: { type: Boolean, default: true },
    goals: { type: Boolean, default: true },
    reports: { type: Boolean, default: true },
  },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true })

export const UsageEvent = mongoose.models.UsageEvent || mongoose.model('UsageEvent', usageEventSchema)
export const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema)
export const SystemEvent = mongoose.models.SystemEvent || mongoose.model('SystemEvent', systemEventSchema)
export const AppSettings = mongoose.models.AppSettings || mongoose.model('AppSettings', appSettingsSchema)