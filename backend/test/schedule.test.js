const request = require('supertest')
const app = require('../src/app')
const { createAdminAndLogin } = require('./helpers')

describe('Schedule', () => {
  it('lets an admin create a day and add an event to it', async () => {
    const { cookies } = await createAdminAndLogin()

    const day = await request(app)
      .post('/api/schedule/days')
      .set('Cookie', cookies)
      .send({ dayNumber: 1, theme: 'EMERGENCE' })
    expect(day.status).toBe(201)

    const event = await request(app)
      .post(`/api/schedule/days/${day.body.day._id}/events`)
      .set('Cookie', cookies)
      .send({ time: '09:00', title: 'Opening Ceremony', tag: 'keynote' })

    expect(event.status).toBe(201)
    expect(event.body.day.events.length).toBe(1)
  })

  it('rejects a duplicate day number', async () => {
    const { cookies } = await createAdminAndLogin()
    await request(app).post('/api/schedule/days').set('Cookie', cookies).send({ dayNumber: 2, theme: 'A' })

    const res = await request(app).post('/api/schedule/days').set('Cookie', cookies).send({ dayNumber: 2, theme: 'B' })
    expect(res.status).toBe(409)
  })

  it('deletes a day along with its events', async () => {
    const { cookies } = await createAdminAndLogin()
    const day = await request(app).post('/api/schedule/days').set('Cookie', cookies).send({ dayNumber: 3, theme: 'X' })
    await request(app)
      .post(`/api/schedule/days/${day.body.day._id}/events`)
      .set('Cookie', cookies)
      .send({ time: '10:00', title: 'Talk', tag: 'talk' })

    const del = await request(app).delete(`/api/schedule/days/${day.body.day._id}`).set('Cookie', cookies)
    expect(del.status).toBe(200)

    const all = await request(app).get('/api/schedule')
    expect(all.body.days.find((d) => d._id === day.body.day._id)).toBeUndefined()
  })

  it('is publicly readable without auth', async () => {
    const res = await request(app).get('/api/schedule')
    expect(res.status).toBe(200)
  })
})