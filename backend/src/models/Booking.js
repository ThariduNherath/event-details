const mongoose = require('mongoose')

const TICKET_PRICES = {
  Explorer: 299,
  Architect: 799,
  Visionary: 2499,
}

const BookingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tier: { type: String, enum: Object.keys(TICKET_PRICES), required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    unitPrice: { type: Number, required: true },
    status: { type: String, enum: ['cart', 'paid', 'refunded'], default: 'cart', index: true },
    paymentRef: { type: String },
    isAdminOrder: { type: Boolean, default: false },
    refundReason: { type: String },
    refundedAt: { type: Date },
    // QR / gate entry
    ticketCode: { type: String, unique: true, sparse: true }, // unique code encoded in the QR, generated once paid
    scannedAt: { type: Date },
    scannedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Booking', BookingSchema)
module.exports.TICKET_PRICES = TICKET_PRICES