const crypto = require('crypto')
const Booking = require('../models/Booking')

// NOTE: This is a MOCK payment flow — it does not charge a real card.
// For production, swap this out for a real processor (e.g. Stripe PaymentIntents).
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

    const total = cartItems.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)
    const paymentRef = 'NEXUS-' + crypto.randomBytes(6).toString('hex').toUpperCase()

    await Booking.updateMany(
      { _id: { $in: cartItems.map((i) => i._id) } },
      { $set: { status: 'paid', paymentRef } }
    )

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
    const items = await Booking.find({ userId: req.user.userId, status: 'paid' }).sort({ updatedAt: -1 })
    res.json({ items })
  } catch (err) {
    console.error('Get history error:', err)
    res.status(500).json({ error: 'Could not load your tickets' })
  }
}