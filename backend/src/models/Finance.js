import mongoose from 'mongoose'

const ownerField = { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true }

const accountSchema = new mongoose.Schema({
  userId: ownerField,
  name: { type: String, required: true, trim: true, maxlength: 80 },
  type: { type: String, enum: ['checking', 'savings', 'salary', 'cash', 'credit', 'investment', 'other'], default: 'checking' },
  currency: { type: String, enum: ['INR', 'USD', 'EUR', 'GBP'], default: 'INR' },
  balance: { type: Number, default: 0, min: 0 },
}, { timestamps: true })

const transactionSchema = new mongoose.Schema({
  userId: ownerField,
  accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', default: null },
  description: { type: String, required: true, trim: true, maxlength: 120 },
  category: { type: String, required: true, trim: true, maxlength: 50 },
  type: { type: String, enum: ['income', 'expense'], required: true },
  amount: { type: Number, required: true, min: 0.01 },
  date: { type: Date, default: Date.now },
}, { timestamps: true })

const budgetSchema = new mongoose.Schema({
  userId: ownerField,
  category: { type: String, required: true, trim: true, maxlength: 50 },
  limit: { type: Number, required: true, min: 0.01 },
  period: { type: String, enum: ['monthly', 'weekly'], default: 'monthly' },
}, { timestamps: true })

const goalSchema = new mongoose.Schema({
  userId: ownerField,
  name: { type: String, required: true, trim: true, maxlength: 80 },
  targetAmount: { type: Number, required: true, min: 0.01 },
  currentAmount: { type: Number, default: 0, min: 0 },
  targetDate: { type: Date, default: null },
}, { timestamps: true })

export const Account = mongoose.models.Account || mongoose.model('Account', accountSchema)
export const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema)
export const Budget = mongoose.models.Budget || mongoose.model('Budget', budgetSchema)
export const Goal = mongoose.models.Goal || mongoose.model('Goal', goalSchema)