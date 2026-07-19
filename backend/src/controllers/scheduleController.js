const ScheduleDay = require('../models/Schedule')

// GET /api/schedule — public
exports.getAll = async (req, res) => {
  try {
    const days = await ScheduleDay.find().sort({ dayNumber: 1 })
    days.forEach((d) => d.events.sort((a, b) => a.order - b.order))
    res.json({ days })
  } catch (err) {
    console.error('Get schedule error:', err)
    res.status(500).json({ error: 'Could not load schedule' })
  }
}

// POST /api/schedule/days — admin
exports.createDay = async (req, res) => {
  try {
    const { dayNumber, theme } = req.body
    if (!dayNumber || !theme) {
      return res.status(400).json({ error: 'Day number and theme are required' })
    }
    const existing = await ScheduleDay.findOne({ dayNumber })
    if (existing) {
      return res.status(409).json({ error: `Day ${dayNumber} already exists` })
    }
    const day = await ScheduleDay.create({ dayNumber, theme, events: [] })
    res.status(201).json({ day })
  } catch (err) {
    console.error('Create day error:', err)
    res.status(500).json({ error: 'Could not create day' })
  }
}

// PATCH /api/schedule/days/:id — admin
exports.updateDay = async (req, res) => {
  try {
    const { dayNumber, theme } = req.body
    const day = await ScheduleDay.findByIdAndUpdate(
      req.params.id,
      { ...(dayNumber && { dayNumber }), ...(theme && { theme }) },
      { new: true, runValidators: true }
    )
    if (!day) return res.status(404).json({ error: 'Day not found' })
    res.json({ day })
  } catch (err) {
    console.error('Update day error:', err)
    res.status(500).json({ error: 'Could not update day' })
  }
}

// DELETE /api/schedule/days/:id — admin
exports.deleteDay = async (req, res) => {
  try {
    const day = await ScheduleDay.findByIdAndDelete(req.params.id)
    if (!day) return res.status(404).json({ error: 'Day not found' })
    res.json({ success: true })
  } catch (err) {
    console.error('Delete day error:', err)
    res.status(500).json({ error: 'Could not delete day' })
  }
}

// POST /api/schedule/days/:dayId/events — admin, add event to a day
exports.addEvent = async (req, res) => {
  try {
    const { time, title, type, speaker, duration, tag, color, order } = req.body
    if (!time || !title || !tag) {
      return res.status(400).json({ error: 'Time, title and tag are required' })
    }
    const day = await ScheduleDay.findById(req.params.dayId)
    if (!day) return res.status(404).json({ error: 'Day not found' })

    day.events.push({
      time,
      title,
      type: type || 'talk',
      speaker: speaker || '',
      duration: duration || '',
      tag: tag.toUpperCase(),
      color: color || 'mist',
      order: order ?? day.events.length,
    })
    await day.save()
    res.status(201).json({ day })
  } catch (err) {
    console.error('Add event error:', err)
    res.status(500).json({ error: 'Could not add event' })
  }
}

// PATCH /api/schedule/events/:eventId — admin, update an event wherever it lives
exports.updateEvent = async (req, res) => {
  try {
    const day = await ScheduleDay.findOne({ 'events._id': req.params.eventId })
    if (!day) return res.status(404).json({ error: 'Event not found' })

    const event = day.events.id(req.params.eventId)
    const payload = { ...req.body }
    if (payload.tag) payload.tag = payload.tag.toUpperCase()
    Object.assign(event, payload)

    await day.save()
    res.json({ day })
  } catch (err) {
    console.error('Update event error:', err)
    res.status(500).json({ error: 'Could not update event' })
  }
}

// DELETE /api/schedule/events/:eventId — admin
exports.deleteEvent = async (req, res) => {
  try {
    const day = await ScheduleDay.findOne({ 'events._id': req.params.eventId })
    if (!day) return res.status(404).json({ error: 'Event not found' })

    day.events.pull({ _id: req.params.eventId })
    await day.save()
    res.json({ day })
  } catch (err) {
    console.error('Delete event error:', err)
    res.status(500).json({ error: 'Could not delete event' })
  }
}