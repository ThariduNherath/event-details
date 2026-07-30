const request = require('supertest')
const app = require('../src/app')
const { createUserAndLogin, createAdminAndLogin } = require('./helpers')

describe('Waitlist', () => {
  it('lets a user join the waitlist', async () => {
    const { cookies } = await createUserAndLogin()

    const res = await request(app).post('/api/waitlist').set('Cookie', cookies).send({ tier: 'Explorer' })

    expect(res.status).toBe(201)
    expect(res.body.entry.tier).toBe('Explorer')
  })

  it('prevents joining the same tier twice', async () => {
    const { cookies } = await createUserAndLogin()
    await request(app).post('/api/waitlist').set('Cookie', cookies).send({ tier: 'Architect' })

    const res = await request(app).post('/api/waitlist').set('Cookie', cookies).send({ tier: 'Architect' })

    expect(res.status).toBe(409)
  })

  it('returns the tiers the current user is on', async () => {
    const { cookies } = await createUserAndLogin()
    await request(app).post('/api/waitlist').set('Cookie', cookies).send({ tier: 'Visionary' })

    const res = await request(app).get('/api/waitlist/me').set('Cookie', cookies)

    expect(res.body.tiers).toContain('Visionary')
  })

  it('lets an admin view and remove waitlist entries', async () => {
    const { cookies: userCookies } = await createUserAndLogin()
    const joined = await request(app).post('/api/waitlist').set('Cookie', userCookies).send({ tier: 'Explorer' })

    const { cookies: adminCookies } = await createAdminAndLogin()
    const list = await request(app).get('/api/waitlist').set('Cookie', adminCookies)
    expect(list.body.entries.length).toBeGreaterThan(0)

    const del = await request(app)
      .delete(`/api/waitlist/${joined.body.entry._id}`)
      .set('Cookie', adminCookies)
    expect(del.status).toBe(200)
  })
})