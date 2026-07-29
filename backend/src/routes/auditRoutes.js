const express = require('express')
const router = express.Router()
const auditController = require('../controllers/auditController')
const { requireAuth, requireAdmin } = require('../middleware/auth')

router.use(requireAuth, requireAdmin)

router.get('/', auditController.getAll)

module.exports = router