const mongoose = require('mongoose')

const TicketCapacitySchema = new mongoose.Schema(
  {
    tier: { type: String, enum: ['Explorer', 'Architect', 'Visionary'], required: true, unique: true },
    capacity: { type: Number, required: true, min: 0 }, // total tickets available for this tier
  },
  { timestamps: true }
)

module.exports = mongoose.model('TicketCapacity', TicketCapacitySchema)