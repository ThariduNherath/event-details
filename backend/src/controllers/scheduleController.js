const ScheduleDay = require('../models/Schedule')
const { logAction } = require('../middleware/audit')

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

    await logAction(req, 'schedule.day.create', 'ScheduleDay', day._id, { dayNumber, theme })

    res.status(201).json({ day })
  } catch (err) {
    console.error('Create day error:', err)
    res.status(500).json({ error: 'Could not create day' })
  }
}

exports.updateDay = async (req, res) => {
  try {
    const { dayNumber, theme } = req.body
    const day = await ScheduleDay.findByIdAndUpdate(
      req.params.id,
      { ...(dayNumber && { dayNumber }), ...(theme && { theme }) },
      { new: true, runValidators: true }
    )
    if (!day) return res.status(404).json({ error: 'Day not found' })

    await logAction(req, 'schedule.day.update', 'ScheduleDay', day._id, { dayNumber: day.dayNumber, theme: day.theme })

    res.json({ day })
  } catch (err) {
    console.error('Update day error:', err)
    res.status(500).json({ error: 'Could not update day' })
  }
}

exports.deleteDay = async (req, res) => {
  try {
    const day = await ScheduleDay.findByIdAndDelete(req.params.id)
    if (!day) return res.status(404).json({ error: 'Day not found' })

    await logAction(req, 'schedule.day.delete', 'ScheduleDay', day._id, { dayNumber: day.dayNumber, theme: day.theme, eventsRemoved: day.events.length })

    res.json({ success: true })
  } catch (err) {
    console.error('Delete day error:', err)
    res.status(500).json({ error: 'Could not delete day' })
  }
}

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

    await logAction(req, 'schedule.event.create', 'ScheduleDay', day._id, { title, dayNumber: day.dayNumber })

    res.status(201).json({ day })
  } catch (err) {
    console.error('Add event error:', err)
    res.status(500).json({ error: 'Could not add event' })
  }
}

exports.updateEvent = async (req, res) => {
  try {
    const day = await ScheduleDay.findOne({ 'events._id': req.params.eventId })
    if (!day) return res.status(404).json({ error: 'Event not found' })

    const event = day.events.id(req.params.eventId)
    const payload = { ...req.body }
    if (payload.tag) payload.tag = payload.tag.toUpperCase()
    Object.assign(event, payload)

    await day.save()

    await logAction(req, 'schedule.event.update', 'ScheduleDay', day._id, { title: event.title, eventId: req.params.eventId })

    res.json({ day })
  } catch (err) {
    console.error('Update event error:', err)
    res.status(500).json({ error: 'Could not update event' })
  }
}

exports.deleteEvent = async (req, res) => {
  try {
    const day = await ScheduleDay.findOne({ 'events._id': req.params.eventId })
    if (!day) return res.status(404).json({ error: 'Event not found' })

    const event = day.events.id(req.params.eventId)
    const eventTitle = event?.title

    day.events.pull({ _id: req.params.eventId })
    await day.save()

    await logAction(req, 'schedule.event.delete', 'ScheduleDay', day._id, { title: eventTitle, eventId: req.params.eventId })

    res.json({ day })
  } catch (err) {
    console.error('Delete event error:', err)
    res.status(500).json({ error: 'Could not delete event' })
  }
}