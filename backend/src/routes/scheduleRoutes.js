const express = require('express')
const router = express.Router()
const scheduleController = require('../controllers/scheduleController')
const { requireAuth, requireAdmin } = require('../middleware/auth')

router.get('/', scheduleController.getAll)

router.use(requireAuth, requireAdmin)

router.post('/days', scheduleController.createDay)
router.patch('/days/:id', scheduleController.updateDay)
router.delete('/days/:id', scheduleController.deleteDay)

router.post('/days/:dayId/events', scheduleController.addEvent)
router.patch('/events/:eventId', scheduleController.updateEvent)
router.delete('/events/:eventId', scheduleController.deleteEvent)

module.exports = router