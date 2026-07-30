const request = require('supertest')
const app = require('../src/app')
const { createAdminAndLogin, createUserAndLogin } = require('./helpers')

describe('Speakers', () => {
  it('lists speakers publicly with no auth needed', async () => {
    const res = await request(app).get('/api/speakers')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body.speakers)).toBe(true)
  })

  it('lets an admin create a speaker', async () => {
    const { cookies } = await createAdminAndLogin()

    const res = await request(app)
      .post('/api/speakers')
      .set('Cookie', cookies)
      .send({
        name: 'Sarah Chen',
        role: 'CEO, NeuralFlow',
        topic: 'The Next 10 Years of AI',
        tag: 'keynote',
        avatar: 'https://example.com/a.jpg',
      })

    expect(res.status).toBe(201)
    expect(res.body.speaker.tag).toBe('KEYNOTE') // controller uppercases it
  })

  it('blocks a non-admin from creating a speaker', async () => {
    const { cookies } = await createUserAndLogin()

    const res = await request(app)
      .post('/api/speakers')
      .set('Cookie', cookies)
      .send({ name: 'X', role: 'Y', topic: 'Z', tag: 'talk', avatar: 'https://example.com/x.jpg' })

    expect(res.status).toBe(403)
  })

  it('rejects a speaker missing required fields', async () => {
    const { cookies } = await createAdminAndLogin()

    const res = await request(app).post('/api/speakers').set('Cookie', cookies).send({ name: 'Incomplete' })

    expect(res.status).toBe(400)
  })

  it('lets an admin update and delete a speaker', async () => {
    const { cookies } = await createAdminAndLogin()
    const created = await request(app)
      .post('/api/speakers')
      .set('Cookie', cookies)
      .send({ name: 'Temp', role: 'Role', topic: 'Topic', tag: 'talk', avatar: 'https://example.com/t.jpg' })

    const updated = await request(app)
      .patch(`/api/speakers/${created.body.speaker._id}`)
      .set('Cookie', cookies)
      .send({ bio: 'Updated bio' })
    expect(updated.body.speaker.bio).toBe('Updated bio')

    const deleted = await request(app).delete(`/api/speakers/${created.body.speaker._id}`).set('Cookie', cookies)
    expect(deleted.status).toBe(200)
  })
})