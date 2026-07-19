const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')
const { requireAuth } = require('../middleware/auth')

router.post('/signup', authController.signup)
router.post('/login', authController.login)
router.post('/google', authController.googleAuth)
router.post('/logout', authController.logout)
router.get('/me', requireAuth, authController.me)

router.patch('/profile', requireAuth, authController.updateProfile)
router.patch('/password', requireAuth, authController.changePassword)

module.exports = router