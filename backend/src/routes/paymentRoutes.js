const express = require('express')
const router = express.Router()
const paymentController = require('../controllers/paymentController')
const { requireAuth } = require('../middleware/auth')

router.use(requireAuth)

router.post('/checkout', paymentController.checkout)
router.get('/history', paymentController.getHistory)

module.exports = router