const AuditLog = require('../models/AuditLog')

// GET /api/audit — admin only, most recent 200 entries
exports.getAll = async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(200)
    res.json({ logs })
  } catch (err) {
    console.error('Get audit log error:', err)
    res.status(500).json({ error: 'Could not load audit log' })
  }
}