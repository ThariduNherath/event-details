const request = require('supertest')
const app = require('../src/app')
const { createUserAndLogin } = require('./helpers')

describe('Payment (checkout)', () => {
  it('rejects checkout with an empty cart', async () => {
    const { cookies } = await createUserAndLogin()

    const res = await request(app)
      .post('/api/payment/checkout')
      .set('Cookie', cookies)
      .send({ cardName: 'A', cardNumber: '4242424242424242', expiry: '12/30', cvv: '123' })

    expect(res.status).toBe(400)
  })

  it('rejects an obviously invalid card number', async () => {
    const { cookies } = await createUserAndLogin()
    await request(app).post('/api/bookings').set('Cookie', cookies).send({ tier: 'Explorer', quantity: 1 })

    const res = await request(app)
      .post('/api/payment/checkout')
      .set('Cookie', cookies)
      .send({ cardName: 'A', cardNumber: '123', expiry: '12/30', cvv: '123' })

    expect(res.status).toBe(400)
  })

  it('completes checkout and marks cart items paid', async () => {
    const { cookies } = await createUserAndLogin()
    await request(app).post('/api/bookings').set('Cookie', cookies).send({ tier: 'Explorer', quantity: 2 })

    const res = await request(app)
      .post('/api/payment/checkout')
      .set('Cookie', cookies)
      .send({ cardName: 'Jane Doe', cardNumber: '4242424242424242', expiry: '12/30', cvv: '123' })

    expect(res.status).toBe(200)
    expect(res.body.paymentRef).toMatch(/^NEXUS-/)
    expect(res.body.total).toBe(598)
  })

  it('shows the paid ticket in purchase history', async () => {
    const { cookies } = await createUserAndLogin()
    await request(app).post('/api/bookings').set('Cookie', cookies).send({ tier: 'Architect', quantity: 1 })
    await request(app)
      .post('/api/payment/checkout')
      .set('Cookie', cookies)
      .send({ cardName: 'Jane', cardNumber: '4242424242424242', expiry: '12/30', cvv: '123' })

    const res = await request(app).get('/api/payment/history').set('Cookie', cookies)
    expect(res.body.items.length).toBe(1)
    expect(res.body.items[0].status).toBe('paid')
  })

  it('clears the cart after checkout', async () => {
    const { cookies } = await createUserAndLogin()
    await request(app).post('/api/bookings').set('Cookie', cookies).send({ tier: 'Visionary', quantity: 1 })
    await request(app)
      .post('/api/payment/checkout')
      .set('Cookie', cookies)
      .send({ cardName: 'Jane', cardNumber: '4242424242424242', expiry: '12/30', cvv: '123' })

    const cart = await request(app).get('/api/bookings').set('Cookie', cookies)
    expect(cart.body.items.length).toBe(0)
  })
})