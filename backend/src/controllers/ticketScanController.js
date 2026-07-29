const QRCode = require('qrcode')
const crypto = require('crypto')
const Booking = require('../models/Booking')
const { logAction } = require('../middleware/audit')

const generateTicketCode = () => {
  const hash = crypto.randomBytes(4).toString('hex').toUpperCase()
  return `TKT-${hash}`
}

// GET /api/tickets/qr/:bookingId — owner only
exports.getQR = async (req, res) => {
  try {
    // 💡 Fix: Support both req.user.userId AND req.user.id
    const currentUserId = req.user.userId || req.user.id

    const booking = await Booking.findOne({ 
      _id: req.params.bookingId, 
      userId: currentUserId 
    })

    if (!booking) {
      return res.status(404).json({ error: 'Ticket not found or unauthorized' })
    }

    if (booking.status !== 'paid') {
      return res.status(400).json({ error: 'QR codes are only available for paid, active tickets' })
    }

    // 💡 Self-healing: generate code if missing in existing DB record
    if (!booking.ticketCode) {
      let code = generateTicketCode()
      let isDuplicate = await Booking.exists({ ticketCode: code })
      while (isDuplicate) {
        code = generateTicketCode()
        isDuplicate = await Booking.exists({ ticketCode: code })
      }
      booking.ticketCode = code
      await booking.save()
    }

    const qrDataUrl = await QRCode.toDataURL(booking.ticketCode, {
      width: 300,
      margin: 1,
      color: { dark: '#000000', light: '#ffffff' },
    })

    return res.json({ qrDataUrl, ticketCode: booking.ticketCode })
  } catch (err) {
    console.error('Get QR error:', err)
    return res.status(500).json({ error: 'Could not generate QR code' })
  }
}

// POST /api/tickets/scan — admin only
exports.scanTicket = async (req, res) => {
  try {
    const { ticketCode } = req.body
    if (!ticketCode) return res.status(400).json({ error: 'Ticket code is required' })

    const cleanCode = ticketCode.trim().toUpperCase()

    // 💡 Flexible Lookup: Check ticketCode OR paymentRef OR Mongo ID
    const booking = await Booking.findOne({
      $or: [
        { ticketCode: cleanCode },
        { paymentRef: cleanCode },
        { _id: cleanCode.length === 24 ? cleanCode : null }
      ]
    }).populate('userId', 'name email')

    if (!booking) {
      return res.status(404).json({ valid: false, error: 'Ticket code not found' })
    }
    if (booking.status === 'refunded') {
      return res.status(400).json({ valid: false, error: 'This ticket was refunded and is no longer valid' })
    }
    if (booking.status !== 'paid') {
      return res.status(400).json({ valid: false, error: 'This ticket is not active' })
    }
    if (booking.scannedAt) {
      return res.status(409).json({
        valid: false,
        alreadyScanned: true,
        error: 'This ticket has already been scanned',
        scannedAt: booking.scannedAt,
        buyerName: booking.userId?.name,
        tier: booking.tier,
        quantity: booking.quantity,
      })
    }

    booking.scannedAt = new Date()
    booking.scannedBy = req.user.userId || req.user.id
    await booking.save()

    if (typeof logAction === 'function') {
      await logAction(req, 'ticket.scan', 'Booking', booking._id, {
        ticketCode: booking.ticketCode || cleanCode,
        tier: booking.tier,
        buyer: booking.userId?.name,
      })
    }

    return res.json({
      valid: true,
      buyerName: booking.userId?.name,
      buyerEmail: booking.userId?.email,
      tier: booking.tier,
      quantity: booking.quantity,
      scannedAt: booking.scannedAt,
    })
  } catch (err) {
    console.error('Scan ticket error:', err)
    return res.status(500).json({ error: 'Could not verify ticket' })
  }
}