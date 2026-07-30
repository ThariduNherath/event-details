const request = require('supertest')
const app = require('../src/app')

describe('Auth', () => {
  it('signs up a new user', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ name: 'Test User', email: 'test@example.com', password: 'password123' })

    expect(res.status).toBe(201)
    expect(res.body.user.email).toBe('test@example.com')
  })

  it('rejects duplicate signup', async () => {
    await request(app)
      .post('/api/auth/signup')
      .send({ name: 'Test User', email: 'dup@example.com', password: 'password123' })

    const res = await request(app)
      .post('/api/auth/signup')
      .send({ name: 'Test User 2', email: 'dup@example.com', password: 'password123' })

    expect(res.status).toBe(409)
  })

  it('rejects short passwords', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ name: 'Test', email: 'short@example.com', password: '123' })

    expect(res.status).toBe(400)
  })
})