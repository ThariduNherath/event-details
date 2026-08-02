const { MongoMemoryServer } = require('mongodb-memory-server')
const mongoose = require('mongoose')

// Never let tests try to actually send email over SMTP — no real credentials exist in
// CI, and fire-and-forget email promises resolving after a test finishes cause noisy
// "Cannot log after tests are done" warnings. Mocking here applies for every test file
// that loads this setup file.
jest.mock('../src/lib/mailer', () => ({
  sendVerificationEmail: jest.fn().mockResolvedValue(true),
  sendWelcomeEmail: jest.fn().mockResolvedValue(true),
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