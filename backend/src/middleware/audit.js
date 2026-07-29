const AuditLog = require('../models/AuditLog')

// Call this from any controller after a successful admin write action.
// Never throws — a logging failure should never break the actual operation.
async function logAction(req, action, targetType, targetId, details = {}) {
  try {
    await AuditLog.create({
      adminId: req.user.userId,
      adminName: req.user.name,
      adminEmail: req.user.email,
      action,
      targetType,
      targetId: targetId ? String(targetId) : undefined,
      details,
    })
  } catch (err) {
    console.error('Audit log write failed:', err)
  }
}

module.exports = { logAction }