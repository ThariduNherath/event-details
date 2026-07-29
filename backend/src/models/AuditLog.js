const mongoose = require('mongoose')

const AuditLogSchema = new mongoose.Schema(
  {
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    adminName: { type: String, required: true }, // denormalized so log survives if user is deleted
    adminEmail: { type: String, required: true },
    action: { type: String, required: true }, // e.g. "speaker.create", "order.refund"
    targetType: { type: String, required: true }, // e.g. "Speaker", "Booking", "ScheduleDay"
    targetId: { type: String },
    details: { type: mongoose.Schema.Types.Mixed }, // free-form context (e.g. { tier: 'Explorer', reason: '...' })
  },
  { timestamps: true }
)

AuditLogSchema.index({ createdAt: -1 })

module.exports = mongoose.model('AuditLog', AuditLogSchema)