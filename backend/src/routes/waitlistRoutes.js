const express = require('express')
const router = express.Router()
const waitlistController = require('../controllers/waitlistController')
const { requireAuth, requireAdmin } = require('../middleware/auth')

router.use(requireAuth)

router.post('/', waitlistController.join)
router.get('/me', waitlistController.getMine)

router.get('/', requireAdmin, waitlistController.getAll)
router.delete('/:id', requireAdmin, waitlistController.remove)

module.exports = router