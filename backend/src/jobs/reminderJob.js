const cron = require('node-cron')
const Booking = require('../models/Booking')
const User = require('../models/User')
const { sendReminderEmail } = require('../lib/mailer')

// Must match the key/logic used in CountdownSection.tsx / ScheduleSection.tsx so the
// reminder days-left number agrees with what the frontend shows.
// If your event date isn't stored server-side yet, set it here directly for now.
const EVENT_DATE = new Date(process.env.EVENT_DATE || '2025-09-15')
const REMINDER_DAYS = [7, 3, 1] // send reminders at these day-counts before the event

function daysUntil(target) {
  const now = new Date()
  const diffMs = target.setHours(0, 0, 0, 0) - now.setHours(0, 0, 0, 0)
  return Math.round(diffMs / (24 * 60 * 60 * 1000))
}

async function runReminderCheck() {
  const daysLeft = daysUntil(new Date(EVENT_DATE))
  if (!REMINDER_DAYS.includes(daysLeft)) return

  console.log(`📧 Sending ${daysLeft}-day reminder emails...`)

  // One row per user with at least one paid ticket — group so someone with 2 line items
  // doesn't get the reminder twice
  const paidBookings = await Booking.find({ status: 'paid' }).distinct('userId')
  const users = await User.find({ _id: { $in: paidBookings } })

  const eventDateLabel = new Date(EVENT_DATE).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  for (const user of users) {
    try {
      await sendReminderEmail(user.email, user.name, daysLeft, eventDateLabel)
    } catch (err) {
      console.error(`Reminder email failed for ${user.email}:`, err)
    }
  }

  console.log(`✅ Sent ${users.length} reminder emails`)
}

// Runs once a day at 09:00 server time — checks whether today matches one of REMINDER_DAYS
function startReminderJob() {
  cron.schedule('0 9 * * *', () => {
    runReminderCheck().catch((err) => console.error('Reminder job failed:', err))
  })
  console.log('⏰ Reminder email job scheduled (daily 09:00)')
}

module.exports = { startReminderJob, runReminderCheck }