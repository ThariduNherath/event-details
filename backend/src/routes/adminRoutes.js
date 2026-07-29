const express = require('express')
const router = express.Router()
const adminController = require('../controllers/adminController')
const { requireAuth, requireAdmin } = require('../middleware/auth')

router.use(requireAuth, requireAdmin)

router.get('/stats', adminController.getStats)
router.get('/users', adminController.getUsers)
router.delete('/users/:id', adminController.deleteUser)
router.get('/orders', adminController.getOrders)
router.post('/orders/:id/refund', adminController.refundOrder)

module.exports = router