const request = require('supertest')
const app = require('../src/app')
const { createUserAndLogin } = require('./helpers')

describe('Bookings (cart)', () => {
  it('adds a ticket to the cart', async () => {
    const { cookies } = await createUserAndLogin()

    const res = await request(app)
      .post('/api/bookings')
      .set('Cookie', cookies)
      .send({ tier: 'Explorer', quantity: 2 })

    expect(res.status).toBe(201)
    expect(res.body.item.tier).toBe('Explorer')
    expect(res.body.item.quantity).toBe(2)
    expect(res.body.item.unitPrice).toBe(299)
  })

  it('rejects an invalid tier', async () => {
    const { cookies } = await createUserAndLogin()

    const res = await request(app)
      .post('/api/bookings')
      .set('Cookie', cookies)
      .send({ tier: 'NotATier', quantity: 1 })

    expect(res.status).toBe(400)
  })

  it('requires authentication', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .send({ tier: 'Explorer', quantity: 1 })

    expect(res.status).toBe(401)
  })

  it('merges quantity when the same tier is added twice', async () => {
    const { cookies } = await createUserAndLogin()

    await request(app).post('/api/bookings').set('Cookie', cookies).send({ tier: 'Architect', quantity: 1 })
    const res = await request(app).post('/api/bookings').set('Cookie', cookies).send({ tier: 'Architect', quantity: 2 })

    expect(res.body.item.quantity).toBe(3)
  })

  it('lists cart items with a correct total', async () => {
    const { cookies } = await createUserAndLogin()
    await request(app).post('/api/bookings').set('Cookie', cookies).send({ tier: 'Visionary', quantity: 1 })

    const res = await request(app).get('/api/bookings').set('Cookie', cookies)

    expect(res.status).toBe(200)
    expect(res.body.total).toBe(2499)
  })

  it('removes an item from the cart', async () => {
    const { cookies } = await createUserAndLogin()
    const add = await request(app).post('/api/bookings').set('Cookie', cookies).send({ tier: 'Explorer', quantity: 1 })

    const res = await request(app).delete(`/api/bookings/${add.body.item._id}`).set('Cookie', cookies)

    expect(res.status).toBe(200)
    const cart = await request(app).get('/api/bookings').set('Cookie', cookies)
    expect(cart.body.items.length).toBe(0)
  })
})