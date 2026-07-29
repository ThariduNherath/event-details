const express = require('express')
const router = express.Router()
const ticketScanController = require('../controllers/ticketScanController')
const { requireAuth, requireAdmin } = require('../middleware/auth')

// 💡 User path: requireAuth ONLY (No requireAdmin)
router.get('/qr/:bookingId', requireAuth, ticketScanController.getQR)

// 💡 Gate Admin path: requireAdmin REQUIRED
router.post('/scan', requireAuth, requireAdmin, ticketScanController.scanTicket)

module.exports = router