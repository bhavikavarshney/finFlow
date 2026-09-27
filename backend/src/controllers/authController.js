import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

function createToken(user) {
  return jwt.sign({ sub: user.id, version: user.tokenVersion || 0 }, process.env.JWT_SECRET, { expiresIn: '1d' })
}

function userResponse(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    currency: user.currency || 'INR',
    avatarDataUrl: user.avatarDataUrl || '',
  }
}

export async function updateProfile(request, response, next) {
  try {
    const updates = {}
    const { name, currency, avatarDataUrl } = request.body

    if (name !== undefined) {
      if (typeof name !== 'string' || !name.trim() || name.trim().length > 80) {
        return response.status(400).json({ message: 'Name must be between 1 and 80 characters.' })
      }
      updates.name = name.trim()
    }

    if (currency !== undefined) {
      if (!['INR', 'USD', 'EUR', 'GBP'].includes(currency)) {
        return response.status(400).json({ message: 'Choose a supported currency.' })
      }
      updates.currency = currency
    }

    if (avatarDataUrl !== undefined) {
      const validImage = typeof avatarDataUrl === 'string'
        && avatarDataUrl.length <= 350000
        && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+=*$/.test(avatarDataUrl)
      if (avatarDataUrl !== '' && avatarDataUrl !== null && !validImage) {
        return response.status(400).json({ message: 'Profile picture must be a small JPEG, PNG, or WebP image.' })
      }
      updates.avatarDataUrl = avatarDataUrl || ''
    }

    if (!Object.keys(updates).length) return response.status(400).json({ message: 'No profile changes were provided.' })

    const user = await User.findByIdAndUpdate(request.user.id, { $set: updates }, { new: true, runValidators: true })
    return response.json({ user: userResponse(user) })
  } catch (error) {
    return next(error)
  }
}

export async function signup(request, response, next) {
  try {
    const name = typeof request.body.name === 'string' ? request.body.name.trim() : ''
    const email = typeof request.body.email === 'string' ? request.body.email.trim().toLowerCase() : ''
    const password = typeof request.body.password === 'string' ? request.body.password : ''

    if (!name || name.length > 80 || !/^\S+@\S+\.\S+$/.test(email) || password.length < 8 || password.length > 72) {
      return response.status(400).json({ message: 'Enter a name, valid email, and password between 8 and 72 characters.' })
    }
    if (await User.exists({ email })) return response.status(409).json({ message: 'An account with this email already exists.' })

    const user = await User.create({ name, email, passwordHash: await bcrypt.hash(password, 12) })
    return response.status(201).json({ token: createToken(user), user: userResponse(user) })
  } catch (error) {
    if (error.code === 11000) return response.status(409).json({ message: 'An account with this email already exists.' })
    return next(error)
  }
}

export async function login(request, response, next) {
  try {
    const email = typeof request.body.email === 'string' ? request.body.email.trim().toLowerCase() : ''
    const password = typeof request.body.password === 'string' ? request.body.password : ''
    const user = await User.findOne({ email }).select('+passwordHash')

    if (!user || !(await bcrypt.compare(password, user.passwordHash)) || user.status === 'suspended') {
      return response.status(401).json({ message: 'Email or password is incorrect.' })
    }
    user.lastActiveAt = new Date()
    await user.save()
    return response.json({ token: createToken(user), user: userResponse(user) })
  } catch (error) {
    return next(error)
  }
}

export function currentUser(request, response) {
  response.json({ user: userResponse(request.user) })
}

export async function changePassword(request, response, next) {
  try {
    const { currentPassword, newPassword } = request.body
    const user = await User.findById(request.user.id).select('+passwordHash')
    if (!user || typeof currentPassword !== 'string' || !(await bcrypt.compare(currentPassword, user.passwordHash))) {
      return response.status(400).json({ message: 'Current password is incorrect.' })
    }
    if (typeof newPassword !== 'string' || newPassword.length < 8 || newPassword.length > 72) {
      return response.status(400).json({ message: 'New password must be between 8 and 72 characters.' })
    }
    user.passwordHash = await bcrypt.hash(newPassword, 12)
    user.tokenVersion = (user.tokenVersion || 0) + 1
    await user.save()
    response.json({ token: createToken(user), message: 'Password changed. Other sessions have been signed out.' })
  } catch (error) { next(error) }
}