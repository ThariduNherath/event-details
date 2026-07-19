const mongoose = require('mongoose')

const SpeakerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    topic: { type: String, required: true, trim: true },
    tag: { type: String, required: true, trim: true, uppercase: true },
    color: { type: String, required: true, default: '#FF4500' },
    avatar: { type: String, required: true },
    bio: { type: String, default: '' },
    sessions: { type: [String], default: [] },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Speaker', SpeakerSchema)