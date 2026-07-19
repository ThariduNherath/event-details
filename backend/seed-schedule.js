require('dotenv').config()
const mongoose = require('mongoose')
const ScheduleDay = require('./src/models/Schedule')

const eventsByDay = [
  {
    dayNumber: 1,
    theme: 'EMERGENCE',
    events: [
      { time: '09:00', title: 'Opening Ceremony', type: 'keynote', speaker: 'Sarah Chen', duration: '60 min', tag: 'KEYNOTE', color: 'ember' },
      { time: '10:15', title: 'The Next Intelligence Frontier', type: 'talk', speaker: 'Dr. Kai Reeves', duration: '45 min', tag: 'AI/ML', color: 'plasma' },
      { time: '11:15', title: 'Coffee & Networking', type: 'break', speaker: '', duration: '30 min', tag: 'BREAK', color: 'mist' },
      { time: '11:45', title: 'Decentralized Identity in Web4', type: 'talk', speaker: 'Amara Singh', duration: '45 min', tag: 'WEB3', color: 'neon' },
      { time: '13:00', title: 'Lunch & Expo Hall', type: 'break', speaker: '', duration: '90 min', tag: 'LUNCH', color: 'mist' },
      { time: '14:30', title: 'Biotech Revolution Panel', type: 'panel', speaker: '5 Panelists', duration: '75 min', tag: 'BIOTECH', color: 'gold' },
      { time: '16:00', title: 'Hack the Future Workshop', type: 'workshop', speaker: 'Teams', duration: '120 min', tag: 'WORKSHOP', color: 'ember' },
      { time: '19:00', title: 'Opening Night Gala', type: 'social', speaker: '', duration: '180 min', tag: 'SOCIAL', color: 'plasma' },
    ],
  },
  {
    dayNumber: 2,
    theme: 'CONVERGENCE',
    events: [
      { time: '09:00', title: 'Space Tech Morning Keynote', type: 'keynote', speaker: 'Erika Novak', duration: '60 min', tag: 'KEYNOTE', color: 'ember' },
      { time: '10:15', title: 'Neural Interface Demos', type: 'demo', speaker: 'NeuroLab', duration: '45 min', tag: 'DEMO', color: 'neon' },
      { time: '11:00', title: 'Climate Tech Deep Dive', type: 'talk', speaker: 'Dr. Mia Torres', duration: '45 min', tag: 'CLIMATE', color: 'neon' },
      { time: '13:00', title: 'Lunch & Startup Showcase', type: 'break', speaker: '', duration: '90 min', tag: 'LUNCH', color: 'mist' },
      { time: '14:30', title: 'Venture Capital Roundtable', type: 'panel', speaker: '4 VCs', duration: '75 min', tag: 'VENTURE', color: 'gold' },
      { time: '16:00', title: 'Future of Work Summit', type: 'talk', speaker: 'Marcus Liu', duration: '60 min', tag: 'FUTURE', color: 'plasma' },
      { time: '20:00', title: 'Tech Rooftop Party', type: 'social', speaker: '', duration: '180 min', tag: 'SOCIAL', color: 'plasma' },
    ],
  },
  {
    dayNumber: 3,
    theme: 'TRANSCENDENCE',
    events: [
      { time: '09:00', title: 'AI Ethics & Society', type: 'keynote', speaker: 'Prof. Ada Osei', duration: '60 min', tag: 'KEYNOTE', color: 'ember' },
      { time: '10:30', title: 'Hackathon Finals', type: 'competition', speaker: 'Teams', duration: '120 min', tag: 'HACKATHON', color: 'neon' },
      { time: '13:00', title: 'Final Lunch', type: 'break', speaker: '', duration: '90 min', tag: 'LUNCH', color: 'mist' },
      { time: '14:30', title: 'Award Ceremony', type: 'ceremony', speaker: 'All', duration: '60 min', tag: 'AWARDS', color: 'gold' },
      { time: '15:30', title: 'Closing Fireside Chat', type: 'keynote', speaker: 'Sarah Chen + Kai Reeves', duration: '60 min', tag: 'CLOSING', color: 'ember' },
      { time: '17:00', title: 'Farewell Cocktails', type: 'social', speaker: '', duration: '120 min', tag: 'SOCIAL', color: 'plasma' },
    ],
  },
]

// Add an `order` to each event based on its position in the array, so the timeline stays sorted
const days = eventsByDay.map((day) => ({
  ...day,
  events: day.events.map((ev, i) => ({ ...ev, order: i })),
}))

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to MongoDB')

    await ScheduleDay.deleteMany({})
    console.log('🗑️  Cleared existing schedule')

    await ScheduleDay.insertMany(days)
    console.log(`✅ Inserted ${days.length} days with ${days.reduce((sum, d) => sum + d.events.length, 0)} total events`)

    process.exit(0)
  } catch (err) {
    console.error('❌ Seed error:', err)
    process.exit(1)
  }
}

seed()