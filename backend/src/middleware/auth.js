const jwt = require('jsonwebtoken')

function requireAuth(req, res, next) {
  const token = req.cookies?.nexus_token

  if (!token) {
    return res.status(401).json({ error: 'You must be logged in to do this' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded // { userId, email, name, role }
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Session expired, please log in again' })
  }
}

// Must run AFTER requireAuth — checks the role embedded in the JWT
function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access only' })
  }
  next()
}

module.exports = { requireAuth, requireAdmin }