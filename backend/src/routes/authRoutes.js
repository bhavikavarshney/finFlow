import { Router } from 'express'
import { changePassword, currentUser, login, signup, updateProfile } from '../controllers/authController.js'
import { requireAuth, requireRegistrationEnabled } from '../middleware/auth.js'

const router = Router()

router.post('/signup', requireRegistrationEnabled, signup)
router.post('/login', login)
router.get('/me', requireAuth, currentUser)
router.patch('/profile', requireAuth, updateProfile)
router.patch('/password', requireAuth, changePassword)

export default router