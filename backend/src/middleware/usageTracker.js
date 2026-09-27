import { UsageEvent } from '../models/AdminData.js'

export function trackFeature(feature, action) {
  return (request, _response, next) => {
    UsageEvent.create({ userId: request.user.id, feature, action }).catch((error) => console.error('Usage event write failed:', error.message))
    next()
  }
}