import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { AppSettings } from '../models/AdminData.js'

export async function requireAuth(request, response, next) {
  const authorization = request.headers.authorization
  const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : null

  if (!token) return response.status(401).json({ message: 'Authentication required.' })

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(payload.sub)
    if (!user) return response.status(401).json({ message: 'Your session is no longer valid.' })
    if (payload.version !== undefined && payload.version !== user.tokenVersion) return response.status(401).json({ message: 'Your session is no longer valid.' })
    if (user.status === 'suspended') return response.status(403).json({ message: 'This account has been suspended.' })
    if (!user.lastActiveAt || Date.now() - user.lastActiveAt.getTime() > 5 * 60 * 1000) {
      User.updateOne({ _id: user.id }, { $set: { lastActiveAt: new Date() } }).catch(() => {})
    }
    request.user = user
    return next()
  } catch {
    return response.status(401).json({ message: 'Your session is invalid or has expired.' })
  }
}

export function requireRole(...roles) {
  return (request, response, next) => {
    if (!request.user || !roles.includes(request.user.role)) {
      return response.status(403).json({ message: 'You do not have permission to access this resource.' })
    }
    return next()
  }
}

export async function requireRegistrationEnabled(_request, response, next) {
  try {
    const settings = await AppSettings.findOne({ key: 'global' }).select('registrationEnabled maintenanceMode').lean()
    if (settings?.registrationEnabled === false || settings?.maintenanceMode === true) return response.status(503).json({ message: 'New account registration is currently paused.' })
    return next()
  } catch (error) { return next(error) }
}