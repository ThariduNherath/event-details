const bcrypt = require('bcryptjs')
const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/User')

// Signs up a user via the real endpoint and returns their auth cookies.
// Signup itself doesn't require email verification, so this is safe for regular-user tests.
async function createUserAndLogin(overrides = {}) {
  const email = overrides.email || `user${Date.now()}${Math.random()}@example.com`
  const res = await request(app)
    .post('/api/auth/signup')
    .send({ name: overrides.name || 'Test User', email, password: 'password123' })

  const cookies = res.headers['set-cookie']
  return { cookies, user: res.body.user, email }
}

// Creates a fully-verified admin user directly in the DB (bypasses signup's default
// role: 'user' and emailVerified: false), then logs in once to get real, working
// session cookies with role: 'admin' baked into the JWT.
async function createAdminAndLogin() {
  const email = `admin${Date.now()}${Math.random()}@example.com`
  const hashed = await bcrypt.hash('password123', 10)

  await User.create({
    name: 'Admin User',
    email,
    password: hashed,
    role: 'admin',
    emailVerified: true,
    authProvider: 'local',
  })

  const loginRes = await request(app).post('/api/auth/login').send({ email, password: 'password123' })

  if (!loginRes.headers['set-cookie']) {
    throw new Error(`Admin login failed in test helper: ${JSON.stringify(loginRes.body)}`)
  }

  return { cookies: loginRes.headers['set-cookie'], user: loginRes.body.user, email }
}

module.exports = { createUserAndLogin, createAdminAndLogin }