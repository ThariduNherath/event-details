const crypto = require('crypto')
const Booking = require('../models/Booking')
const User = require('../models/User')
const { sendOrderConfirmationEmail } = require('../lib/mailer')

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

    for (const item of cartItems) {
      item.status = 'paid'
      item.paymentRef = paymentRef
      item.isAdminOrder = isAdminOrder
      item.ticketCode = 'TKT-' + crypto.randomBytes(8).toString('hex').toUpperCase()
      await item.save()
    }

    const orderSummary = {
      paymentRef,
      total,
      items: cartItems.map((i) => ({ tier: i.tier, quantity: i.quantity, unitPrice: i.unitPrice })),
    }

    // Fire-and-forget — checkout should never fail or feel slow because of an email hiccup
    User.findById(req.user.userId)
      .then((user) => {
        if (user) sendOrderConfirmationEmail(user.email, user.name, orderSummary).catch((err) => console.error('Order confirmation email failed:', err))
      })
      .catch((err) => console.error('Could not load user for confirmation email:', err))

    res.json({ success: true, ...orderSummary })
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