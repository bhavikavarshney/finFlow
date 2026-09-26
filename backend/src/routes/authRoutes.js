import { Router } from 'express'
import { currentUser, login, signup, updateProfile } from '../controllers/authController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.post('/signup', signup)
router.post('/login', login)
router.get('/me', requireAuth, currentUser)
router.patch('/profile', requireAuth, updateProfile)

export default router