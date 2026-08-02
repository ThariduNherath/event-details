require('dotenv').config()
const connectDB = require('./src/config/db')
const app = require('./src/app')
const { startReminderJob } = require('./src/jobs/reminderJob')

const PORT = process.env.PORT || 5000

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 NEXUS 2025 backend running on http://localhost:${PORT}`)
  })
  startReminderJob()
})