const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/User')

// Signs up a user and returns their auth cookies (for requests that need requireAuth)
async function createUserAndLogin(overrides = {}) {
  const email = overrides.email || `user${Date.now()}${Math.random()}@example.com`
  const res = await request(app)
    .post('/api/auth/signup')
    .send({ name: overrides.name || 'Test User', email, password: 'password123' })

  const cookies = res.headers['set-cookie']
  return { cookies, user: res.body.user, email }
}

// Signs up a user then flips their role to admin directly in the DB (bypasses normal signup flow)
async function createAdminAndLogin() {
  const { cookies, user, email } = await createUserAndLogin({ name: 'Admin User' })
  await User.findByIdAndUpdate(user.id, { role: 'admin' })

  // Re-login so the JWT actually carries role: 'admin' (role is baked into the token at login time)
  const loginRes = await request(app).post('/api/auth/login').send({ email, password: 'password123' })
  return { cookies: loginRes.headers['set-cookie'], user: loginRes.body.user, email }
}

module.exports = { createUserAndLogin, createAdminAndLogin }