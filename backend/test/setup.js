const { MongoMemoryServer } = require('mongodb-memory-server')
const mongoose = require('mongoose')

let mongod

beforeAll(async () => {
  mongod = await MongoMemoryServer.create()
  process.env.MONGODB_URI = mongod.getUri()
  process.env.JWT_SECRET = 'test-secret'
  process.env.GOOGLE_CLIENT_ID = 'test-client-id'
  await mongoose.connect(process.env.MONGODB_URI)
}, 60000) // 60 Seconds timeout for initial MongoDB download/startup

afterAll(async () => {
  await mongoose.disconnect()
  if (mongod) {
    await mongod.stop()
  }
})

afterEach(async () => {
  const collections = mongoose.connection.collections
  for (const key in collections) {
    await collections[key].deleteMany({})
  }
})