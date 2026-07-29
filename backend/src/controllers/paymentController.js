const crypto = require('crypto')
const Booking = require('../models/Booking')

exports.checkout = async (req, res) => {
  try {
    const { cardName, cardNumber, expiry, cvv } = req.body

    if (!cardName || !cardNumber || !expiry || !cvv) {
      return res.status(400).json({ error: 'Please fill in all payment fields' })
    }
    if (cardNumber.replace(/\s/g, '').length < 12) {
      return res.status(400).json({ error: 'Card number looks invalid' })
    }

    const cartItems = await Booking.find({ userId: req.user.userId, status: 'cart' })
    if (cartItems.length === 0) {
      return res.status(400).json({ error: 'Your cart is empty' })
    }

    const isAdminOrder = req.user.role === 'admin'
    const total = cartItems.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)
    const paymentRef = 'NEXUS-' + crypto.randomBytes(6).toString('hex').toUpperCase()

    // Each booking line item gets its own unique ticket code — one code covers the whole
    // quantity on that line (e.g. "3x Explorer" is one QR / one gate scan for the group).
    // If you need one QR per individual ticket instead, split cart items to quantity:1 at add-to-cart time.
    for (const item of cartItems) {
      item.status = 'paid'
      item.paymentRef = paymentRef
      item.isAdminOrder = isAdminOrder
      item.ticketCode = 'TKT-' + crypto.randomBytes(8).toString('hex').toUpperCase()
      await item.save()
    }

    res.json({
      success: true,
      paymentRef,
      total,
      items: cartItems.map((i) => ({ tier: i.tier, quantity: i.quantity, unitPrice: i.unitPrice })),
    })
  } catch (err) {
    console.error('Checkout error:', err)
    res.status(500).json({ error: 'Payment could not be processed. Please try again.' })
  }
}

exports.getHistory = async (req, res) => {
  try {
    const items = await Booking.find({
      userId: req.user.userId,
      status: { $in: ['paid', 'refunded'] },
    }).sort({ updatedAt: -1 })
    res.json({ items })
  } catch (err) {
    console.error('Get history error:', err)
    res.status(500).json({ error: 'Could not load your tickets' })
  }
}