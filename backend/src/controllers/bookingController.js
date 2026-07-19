const Booking = require('../models/Booking')
const { TICKET_PRICES } = require('../models/Booking')
const TicketCapacity = require('../models/TicketCapacity')

exports.getCart = async (req, res) => {
  try {
    const items = await Booking.find({ userId: req.user.userId, status: 'cart' }).sort({ createdAt: -1 })
    const total = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)
    res.json({ items, total })
  } catch (err) {
    console.error('Get cart error:', err)
    res.status(500).json({ error: 'Could not load your cart' })
  }
}

exports.addToCart = async (req, res) => {
  try {
    const { tier, quantity = 1 } = req.body
    const isAdminOrder = req.user.role === 'admin'

    if (!tier || !TICKET_PRICES[tier]) {
      return res.status(400).json({ error: 'Please choose a valid ticket tier' })
    }
    if (quantity < 1 || quantity > 10) {
      return res.status(400).json({ error: 'Quantity must be between 1 and 10' })
    }

    // Capacity check — admin's own test purchases don't count against real capacity,
    // so admins can always buy even when a tier shows sold out for customers
    if (!isAdminOrder) {
      const capacityDoc = await TicketCapacity.findOne({ tier })
      if (capacityDoc) {
        const paid = await Booking.aggregate([
          { $match: { tier, status: 'paid', isAdminOrder: { $ne: true } } },
          { $group: { _id: null, total: { $sum: '$quantity' } } },
        ])
        const sold = paid[0]?.total || 0
        const remaining = capacityDoc.capacity - sold

        if (remaining <= 0) {
          return res.status(409).json({ error: `${tier} is sold out`, soldOut: true })
        }
        if (quantity > remaining) {
          return res.status(409).json({
            error: `Only ${remaining} ${tier} ticket${remaining !== 1 ? 's' : ''} left`,
            soldOut: false,
            remaining,
          })
        }
      }
    }

    let item = await Booking.findOne({ userId: req.user.userId, tier, status: 'cart' })
    if (item) {
      item.quantity += quantity
      item.isAdminOrder = isAdminOrder
      await item.save()
    } else {
      item = await Booking.create({
        userId: req.user.userId,
        tier,
        quantity,
        unitPrice: TICKET_PRICES[tier],
        status: 'cart',
        isAdminOrder,
      })
    }

    res.status(201).json({ item })
  } catch (err) {
    console.error('Add to cart error:', err)
    res.status(500).json({ error: 'Could not add ticket to cart' })
  }
}

exports.updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body
    if (!quantity || quantity < 1 || quantity > 10) {
      return res.status(400).json({ error: 'Quantity must be between 1 and 10' })
    }

    const item = await Booking.findOne({ _id: req.params.id, userId: req.user.userId, status: 'cart' })
    if (!item) return res.status(404).json({ error: 'Cart item not found' })

    item.quantity = quantity
    await item.save()
    res.json({ item })
  } catch (err) {
    console.error('Update cart error:', err)
    res.status(500).json({ error: 'Could not update cart item' })
  }
}

exports.removeFromCart = async (req, res) => {
  try {
    const item = await Booking.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId,
      status: 'cart',
    })
    if (!item) return res.status(404).json({ error: 'Cart item not found' })
    res.json({ success: true })
  } catch (err) {
    console.error('Remove from cart error:', err)
    res.status(500).json({ error: 'Could not remove item' })
  }
}