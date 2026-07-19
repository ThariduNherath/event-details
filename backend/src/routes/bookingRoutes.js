const express = require('express')
const router = express.Router()
const bookingController = require('../controllers/bookingController')
const { requireAuth } = require('../middleware/auth')

router.use(requireAuth)

router.get('/', bookingController.getCart)
router.post('/', bookingController.addToCart)
router.patch('/:id', bookingController.updateCartItem)
router.delete('/:id', bookingController.removeFromCart)

module.exports = router