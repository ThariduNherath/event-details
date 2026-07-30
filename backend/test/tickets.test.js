const request = require('supertest')
const app = require('../src/app')
const { createUserAndLogin, createAdminAndLogin } = require('./helpers')

describe('Ticket capacity', () => {
  it('is unlimited by default', async () => {
    const res = await request(app).get('/api/tickets/availability')

    expect(res.status).toBe(200)
    const explorer = res.body.availability.find((a) => a.tier === 'Explorer')
    expect(explorer.capacity).toBeNull()
    expect(explorer.soldOut).toBe(false)
  })

  it('lets an admin set a capacity limit', async () => {
    const { cookies } = await createAdminAndLogin()

    const res = await request(app)
      .patch('/api/tickets/capacity/Explorer')
      .set('Cookie', cookies)
      .send({ capacity: 1 })

    expect(res.status).toBe(200)
    expect(res.body.capacity.capacity).toBe(1)
  })

  it('blocks a non-admin from setting capacity', async () => {
    const { cookies } = await createUserAndLogin()

    const res = await request(app)
      .patch('/api/tickets/capacity/Explorer')
      .set('Cookie', cookies)
      .send({ capacity: 5 })

    expect(res.status).toBe(403)
  })

  it('blocks purchase once capacity is fully sold', async () => {
    const { cookies: adminCookies } = await createAdminAndLogin()
    await request(app).patch('/api/tickets/capacity/Architect').set('Cookie', adminCookies).send({ capacity: 1 })

    // A regular customer buys the only available ticket and checks out
    const { cookies: buyerCookies } = await createUserAndLogin()
    await request(app).post('/api/bookings').set('Cookie', buyerCookies).send({ tier: 'Architect', quantity: 1 })
    await request(app)
      .post('/api/payment/checkout')
      .set('Cookie', buyerCookies)
      .send({ cardName: 'Buyer', cardNumber: '4242424242424242', expiry: '12/30', cvv: '123' })

    // A second customer should now be blocked
    const { cookies: secondCookies } = await createUserAndLogin()
    const res = await request(app)
      .post('/api/bookings')
      .set('Cookie', secondCookies)
      .send({ tier: 'Architect', quantity: 1 })

    expect(res.status).toBe(409)
    expect(res.body.soldOut).toBe(true)
  })

  it('lets admins buy past a sold-out limit (admin bypass)', async () => {
    const { cookies: adminCookies } = await createAdminAndLogin()
    await request(app).patch('/api/tickets/capacity/Visionary').set('Cookie', adminCookies).send({ capacity: 0 })

    const res = await request(app)
      .post('/api/bookings')
      .set('Cookie', adminCookies)
      .send({ tier: 'Visionary', quantity: 1 })

    expect(res.status).toBe(201)
  })
})