const mongoose = require('mongoose')

const EventSchema = new mongoose.Schema({
  time: { type: String, required: true }, // e.g. "09:00"
  title: { type: String, required: true },
  type: {
    type: String,
    enum: ['keynote', 'talk', 'break', 'panel', 'workshop', 'demo', 'social', 'competition', 'ceremony'],
    default: 'talk',
  },
  speaker: { type: String, default: '' },
  duration: { type: String, default: '' }, // e.g. "45 min"
  tag: { type: String, required: true, uppercase: true, trim: true }, // e.g. "KEYNOTE", "AI/ML"
  color: {
    type: String,
    enum: ['ember', 'neon', 'plasma', 'gold', 'mist'],
    default: 'mist',
  },
  order: { type: Number, default: 0 },
})

const ScheduleDaySchema = new mongoose.Schema(
  {
    dayNumber: { type: Number, required: true, unique: true }, // 1, 2, 3...
    theme: { type: String, required: true, trim: true }, // e.g. "EMERGENCE"
    events: { type: [EventSchema], default: [] },
  },
  { timestamps: true }
)

module.exports = mongoose.model('ScheduleDay', ScheduleDaySchema)