const request = require('supertest')
const app = require('../src/app')
const { createUserAndLogin, createAdminAndLogin } = require('./helpers')

async function buyOneTicket(cookies, tier = 'Explorer') {
  await request(app).post('/api/bookings').set('Cookie', cookies).send({ tier, quantity: 1 })
  return request(app)
    .post('/api/payment/checkout')
    .set('Cookie', cookies)
    .send({ cardName: 'Buyer', cardNumber: '4242424242424242', expiry: '12/30', cvv: '123' })
}

describe('Admin', () => {
  it('blocks non-admins from all admin routes', async () => {
    const { cookies } = await createUserAndLogin()
    const res = await request(app).get('/api/admin/stats').set('Cookie', cookies)
    expect(res.status).toBe(403)
  })

  it('computes revenue and ticket counts correctly', async () => {
    const { cookies: buyerCookies } = await createUserAndLogin()
    await buyOneTicket(buyerCookies, 'Explorer')

    const { cookies: adminCookies } = await createAdminAndLogin()
    const res = await request(app).get('/api/admin/stats').set('Cookie', adminCookies)

    expect(res.status).toBe(200)
    expect(res.body.totalRevenue).toBeGreaterThanOrEqual(299)
    expect(res.body.totalTicketsSold).toBeGreaterThanOrEqual(1)
  })

  it('excludes admin test purchases from revenue stats', async () => {
    const { cookies: adminCookies } = await createAdminAndLogin()
    const before = await request(app).get('/api/admin/stats').set('Cookie', adminCookies)

    await buyOneTicket(adminCookies, 'Architect') // admin buys for themselves

    const after = await request(app).get('/api/admin/stats').set('Cookie', adminCookies)
    expect(after.body.totalRevenue).toBe(before.body.totalRevenue) // unchanged
  })

  it('lists orders and lets an admin refund one', async () => {
    const { cookies: buyerCookies } = await createUserAndLogin()
    await buyOneTicket(buyerCookies, 'Visionary')

    const { cookies: adminCookies } = await createAdminAndLogin()
    const orders = await request(app).get('/api/admin/orders').set('Cookie', adminCookies)
    expect(orders.body.orders.length).toBeGreaterThan(0)

    const orderId = orders.body.orders[0]._id
    const refund = await request(app)
      .post(`/api/admin/orders/${orderId}/refund`)
      .set('Cookie', adminCookies)
      .send({ reason: 'Test refund' })

    expect(refund.status).toBe(200)
    expect(refund.body.order.status).toBe('refunded')
  })

  it('rejects refunding an already-refunded order', async () => {
    const { cookies: buyerCookies } = await createUserAndLogin()
    await buyOneTicket(buyerCookies, 'Explorer')

    const { cookies: adminCookies } = await createAdminAndLogin()
    const orders = await request(app).get('/api/admin/orders').set('Cookie', adminCookies)
    const orderId = orders.body.orders.find((o) => o.status === 'paid')._id

    await request(app).post(`/api/admin/orders/${orderId}/refund`).set('Cookie', adminCookies).send({})
    const second = await request(app).post(`/api/admin/orders/${orderId}/refund`).set('Cookie', adminCookies).send({})

    expect(second.status).toBe(400)
  })

  it('lets an admin delete another user', async () => {
    const { user } = await createUserAndLogin()
    const { cookies: adminCookies } = await createAdminAndLogin()

    const res = await request(app).delete(`/api/admin/users/${user.id}`).set('Cookie', adminCookies)
    expect(res.status).toBe(200)

    const list = await request(app).get('/api/admin/users').set('Cookie', adminCookies)
    expect(list.body.users.find((u) => u._id === user.id)).toBeUndefined()
  })

  it("prevents an admin from deleting their own account via this route", async () => {
    const { cookies, user } = await createAdminAndLogin()
    const res = await request(app).delete(`/api/admin/users/${user.id}`).set('Cookie', cookies)
    expect(res.status).toBe(400)
  })
})