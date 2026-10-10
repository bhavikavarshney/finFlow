import { Router } from 'express'
import {
  analytics,
  auditLogs,
  exportReport,
  getSettings,
  health,
  listUsers,
  notifications,
  overview,
  updateSettings,
  updateUserStatus,
} from '../controllers/adminController.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

const router = Router()
router.use(requireAuth, requireRole('admin'))
router.get('/overview', overview)
router.get('/users', listUsers)
router.patch('/users/:userId/status', updateUserStatus)
router.get('/analytics', analytics)
router.get('/health', health)
router.get('/audit-logs', auditLogs)
router.get('/notifications', notifications)
router.get('/settings', getSettings)
router.patch('/settings', updateSettings)
router.get('/reports/usage.csv', exportReport)

export default router
