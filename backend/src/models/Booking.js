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
    status: { type: String, enum: ['cart', 'paid'], default: 'cart', index: true },
    paymentRef: { type: String },
    // True if the buyer was an admin at the time of purchase — excluded from
    // public sold-out counts and revenue stats so admin testing doesn't affect real customers
    isAdminOrder: { type: Boolean, default: false },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Booking', BookingSchema)
module.exports.TICKET_PRICES = TICKET_PRICES 