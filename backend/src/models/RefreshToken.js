const mongoose = require('mongoose')

const RefreshTokenSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    // We never store the raw token — only its hash. If the DB leaks, tokens can't be reused.
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    revoked: { type: Boolean, default: false },
    // Points to the token that replaced this one, once rotated — lets us detect reuse of a dead token
    replacedByHash: { type: String },
    userAgent: { type: String },
  },
  { timestamps: true }
)

// Mongo automatically deletes documents past this date — keeps the collection from growing forever
RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

module.exports = mongoose.model('RefreshToken', RefreshTokenSchema)