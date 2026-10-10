import { Router } from 'express'
import {
  financeSummary,
  createFinance,
  listFinance,
  updateAccount,
} from '../controllers/financeController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()
router.use(requireAuth)
router.get('/summary', financeSummary)
router.patch('/accounts/:accountId', updateAccount)
router.get('/:resource', listFinance)
router.post('/:resource', createFinance)

export default router
