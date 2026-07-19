const express = require('express')
const router = express.Router()
const adminController = require('../controllers/adminController')
const { requireAuth, requireAdmin } = require('../middleware/auth')

router.use(requireAuth, requireAdmin)

router.get('/stats', adminController.getStats)
router.get('/users', adminController.getUsers)
router.get('/orders', adminController.getOrders)

module.exports = router