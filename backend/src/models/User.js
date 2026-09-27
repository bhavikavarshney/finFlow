import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  currency: { type: String, enum: ['INR', 'USD', 'EUR', 'GBP'], default: 'INR' },
  avatarDataUrl: { type: String, maxlength: 350000, default: '' },
  status: { type: String, enum: ['active', 'suspended'], default: 'active' },
  lastActiveAt: { type: Date, default: null },
  tokenVersion: { type: Number, default: 0 },
}, { timestamps: true })

export default mongoose.model('User', userSchema)