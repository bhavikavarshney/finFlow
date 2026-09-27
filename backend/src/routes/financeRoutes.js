import { Router } from 'express'
import { financeSummary, createFinance, listFinance } from '../controllers/financeController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()
router.use(requireAuth)
router.get('/summary', financeSummary)
router.get('/:resource', listFinance)
router.post('/:resource', createFinance)

export default router