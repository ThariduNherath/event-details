const express = require('express')
const router = express.Router()
const speakerController = require('../controllers/speakerController')
const { requireAuth, requireAdmin } = require('../middleware/auth')

router.get('/', speakerController.getAll)

router.use(requireAuth, requireAdmin)

router.post('/', speakerController.create)
router.patch('/:id', speakerController.update)
router.delete('/:id', speakerController.remove)

module.exports = router