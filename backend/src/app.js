const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')

// Route Imports
const authRoutes = require('./routes/authRoutes')
const bookingRoutes = require('./routes/bookingRoutes')
const paymentRoutes = require('./routes/paymentRoutes')
const adminRoutes = require('./routes/adminRoutes')
const speakerRoutes = require('./routes/speakerRoutes')
const scheduleRoutes = require('./routes/scheduleRoutes')
const ticketRoutes = require('./routes/ticketRoutes')
const waitlistRoutes = require('./routes/waitlistRoutes')
const ticketScanRoutes = require('./routes/ticketScanRoutes')
const auditRoutes = require('./routes/auditRoutes')

const app = express()

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }))
app.use(express.json())
app.use(cookieParser())

// 💡 IMPORTANT: Mount ticketScanRoutes BEFORE ticketRoutes to avoid endpoint collisions
app.use('/api/tickets', ticketScanRoutes)
app.use('/api/tickets', ticketRoutes)

app.use('/api/auth', authRoutes)
app.use('/api/bookings', bookingRoutes)
app.use('/api/payment', paymentRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/speakers', speakerRoutes)
app.use('/api/schedule', scheduleRoutes)
app.use('/api/waitlist', waitlistRoutes)
app.use('/api/audit', auditRoutes)

// 404 Handler
app.use((req, res) => res.status(404).json({ error: 'Not found' }))

module.exports = app