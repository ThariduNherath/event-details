const Speaker = require('../models/Speaker')
const { logAction } = require('../middleware/audit')

exports.getAll = async (req, res) => {
  try {
    const speakers = await Speaker.find().sort({ order: 1, createdAt: -1 })
    res.json({ speakers })
  } catch (err) {
    console.error('Get speakers error:', err)
    res.status(500).json({ error: 'Could not load speakers' })
  }
}

exports.create = async (req, res) => {
  try {
    const { name, role, topic, tag, color, avatar, bio, sessions, order } = req.body

    if (!name || !role || !topic || !tag || !avatar) {
      return res.status(400).json({ error: 'Name, role, topic, tag and avatar are required' })
    }

    const speaker = await Speaker.create({
      name,
      role,
      topic,
      tag: tag.toUpperCase(),
      color: color || '#FF4500',
      avatar,
      bio: bio || '',
      sessions: sessions || [],
      order: order || 0,
    })

    await logAction(req, 'speaker.create', 'Speaker', speaker._id, { name: speaker.name, tag: speaker.tag })

    res.status(201).json({ speaker })
  } catch (err) {
    console.error('Create speaker error:', err)
    res.status(500).json({ error: 'Could not create speaker' })
  }
}

exports.update = async (req, res) => {
  try {
    const payload = { ...req.body }
    if (payload.tag) payload.tag = payload.tag.toUpperCase()

    const speaker = await Speaker.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    })
    if (!speaker) return res.status(404).json({ error: 'Speaker not found' })

    await logAction(req, 'speaker.update', 'Speaker', speaker._id, { name: speaker.name })

    res.json({ speaker })
  } catch (err) {
    console.error('Update speaker error:', err)
    res.status(500).json({ error: 'Could not update speaker' })
  }
}

exports.remove = async (req, res) => {
  try {
    const speaker = await Speaker.findByIdAndDelete(req.params.id)
    if (!speaker) return res.status(404).json({ error: 'Speaker not found' })

    await logAction(req, 'speaker.delete', 'Speaker', speaker._id, { name: speaker.name })

    res.json({ success: true })
  } catch (err) {
    console.error('Delete speaker error:', err)
    res.status(500).json({ error: 'Could not delete speaker' })
  }
}