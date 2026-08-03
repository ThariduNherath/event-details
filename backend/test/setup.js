const { MongoMemoryServer } = require('mongodb-memory-server')
const mongoose = require('mongoose')

// Never let tests try to actually send email over SMTP. Every function exported by
// lib/mailer.js must be listed here — if a new email type is added to mailer.js and
// not added here, calling it in a controller throws "X is not a function" during tests
// (that's exactly what happened with sendAdminNewUserAlert).
jest.mock('../src/lib/mailer', () => ({
  sendVerificationEmail: jest.fn().mockResolvedValue(true),
  sendWelcomeEmail: jest.fn().mockResolvedValue(true),
  sendAdminNewUserAlert: jest.fn().mockResolvedValue(true),
  sendOrderConfirmationEmail: jest.fn().mockResolvedValue(true),
  sendReminderEmail: jest.fn().mockResolvedValue(true),
}))

let mongod

beforeAll(async () => {
  mongod = await MongoMemoryServer.create()
  process.env.MONGODB_URI = mongod.getUri()
  process.env.JWT_SECRET = 'test-secret'
  process.env.GOOGLE_CLIENT_ID = 'test-client-id'
  await mongoose.connect(process.env.MONGODB_URI)
})

afterAll(async () => {
  await mongoose.disconnect()
  await mongod.stop()
})

afterEach(async () => {
  const collections = mongoose.connection.collections
  for (const key in collections) {
    await collections[key].deleteMany({})
  }
})