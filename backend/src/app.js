const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')

const authRoutes = require('./routes/authRoutes')
const bookingRoutes = require('./routes/bookingRoutes')
const paymentRoutes = require('./routes/paymentRoutes')
const adminRoutes = require('./routes/adminRoutes')
const speakerRoutes = require('./routes/speakerRoutes')
const scheduleRoutes = require('./routes/scheduleRoutes')
const ticketRoutes = require('./routes/ticketRoutes')
const waitlistRoutes = require('./routes/waitlistRoutes')

const app = express()

const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000')
  .split(',')
  .map((o) => o.trim())

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
)
app.use(express.json())
app.use(cookieParser())

app.get('/api/health', (req, res) => res.json({ ok: true }))

app.use('/api/auth', authRoutes)
app.use('/api/bookings', bookingRoutes)
app.use('/api/payment', paymentRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/speakers', speakerRoutes)
app.use('/api/schedule', scheduleRoutes)
app.use('/api/tickets', ticketRoutes)
app.use('/api/waitlist', waitlistRoutes)

app.use((req, res) => res.status(404).json({ error: 'Not found' }))

app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: 'Server error' })
})

module.exports = app