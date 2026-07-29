const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')
const { requireAuth } = require('../middleware/auth')

router.post('/signup', authController.signup)
router.post('/login', authController.login)
router.post('/google', authController.googleAuth)
router.post('/refresh', authController.refresh)
router.post('/logout', authController.logout)
router.get('/me', requireAuth, authController.me)

router.get('/verify-email/:token', authController.verifyEmail)
router.post('/resend-verification', authController.resendVerification)

router.patch('/profile', requireAuth, authController.updateProfile)
router.patch('/password', requireAuth, authController.changePassword)
router.delete('/account', requireAuth, authController.deleteMyAccount)

module.exports = router