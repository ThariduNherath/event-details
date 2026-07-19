const mongoose = require('mongoose')

const WaitlistSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    tier: { type: String, enum: ['Explorer', 'Architect', 'Visionary'], required: true },
  },
  { timestamps: true }
)

// One waitlist entry per user per tier
WaitlistSchema.index({ userId: 1, tier: 1 }, { unique: true })

module.exports = mongoose.model('Waitlist', WaitlistSchema)