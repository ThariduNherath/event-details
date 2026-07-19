const express = require('express')
const router = express.Router()
const ticketController = require('../controllers/ticketController')
const { requireAuth, requireAdmin } = require('../middleware/auth')

router.get('/availability', ticketController.getAvailability)

router.use(requireAuth, requireAdmin)

router.patch('/capacity/:tier', ticketController.setCapacity)
router.delete('/capacity/:tier', ticketController.removeCapacity)

module.exports = router