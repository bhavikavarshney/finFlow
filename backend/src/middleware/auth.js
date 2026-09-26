import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export async function requireAuth(request, response, next) {
  const authorization = request.headers.authorization
  const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : null

  if (!token) return response.status(401).json({ message: 'Authentication required.' })

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(payload.sub)
    if (!user) return response.status(401).json({ message: 'Your session is no longer valid.' })
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