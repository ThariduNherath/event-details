require('dotenv').config()
const mongoose = require('mongoose')
const Speaker = require('./src/models/Speaker')

const speakers = [
  {
    name: 'Sarah Chen',
    role: 'CEO, NeuralFlow',
    topic: 'The Next 10 Years of AI',
    tag: 'KEYNOTE',
    color: '#FF4500',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    bio: 'Former Google DeepMind researcher. Built the first human-level reasoning model.',
    sessions: ['Opening Keynote', 'Closing Fireside'],
    order: 1,
  },
  {
    name: 'Dr. Kai Reeves',
    role: 'Chief Scientist, Quantum Labs',
    topic: 'Quantum Computing Today',
    tag: 'SCIENCE',
    color: '#7B2FFF',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    bio: 'Pioneer in quantum error correction. Published 200+ papers.',
    sessions: ['Intelligence Frontier'],
    order: 2,
  },
  {
    name: 'Amara Singh',
    role: 'Founder, ChainVerse',
    topic: 'Web4 & Decentralized Identity',
    tag: 'WEB3',
    color: '#00FFB2',
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
    bio: 'Web3 architect. Built identity protocol used by 50M+ users.',
    sessions: ['Decentralized Identity'],
    order: 3,
  },
  {
    name: 'Erika Novak',
    role: 'VP Engineering, SpaceOS',
    topic: 'Off-Planet Computing',
    tag: 'SPACE',
    color: '#FFD700',
    avatar: 'https://randomuser.me/api/portraits/women/17.jpg',
    bio: 'Designed systems running on the ISS. Building the first space-native OS.',
    sessions: ['Space Tech Keynote', 'Panel'],
    order: 4,
  },
  {
    name: 'Dr. Mia Torres',
    role: 'Director, GreenAI Institute',
    topic: 'Climate & Technology',
    tag: 'CLIMATE',
    color: '#00FFB2',
    avatar: 'https://randomuser.me/api/portraits/women/29.jpg',
    bio: 'Using ML to solve climate crisis. Advised 3 governments on green tech.',
    sessions: ['Climate Tech Deep Dive'],
    order: 5,
  },
  {
    name: 'Marcus Liu',
    role: 'Future of Work Lead, Meta',
    topic: 'Augmented Workplaces',
    tag: 'FUTURE',
    color: '#7B2FFF',
    avatar: 'https://randomuser.me/api/portraits/men/55.jpg',
    bio: 'Designed AR workspaces used by Fortune 500 companies globally.',
    sessions: ['Future of Work Summit'],
    order: 6,
  },
  {
    name: 'Prof. Ada Osei',
    role: 'Oxford AI Ethics Chair',
    topic: 'Responsible AI Manifesto',
    tag: 'ETHICS',
    color: '#FF4500',
    avatar: 'https://randomuser.me/api/portraits/women/90.jpg',
    bio: 'Author of "The Ethical Machine". Advisor to UN AI policy group.',
    sessions: ['AI Ethics & Society'],
    order: 7,
  },
  {
    name: 'James Park',
    role: 'CTO, BioMind',
    topic: 'Neural Interface Revolution',
    tag: 'BIOTECH',
    color: '#FFD700',
    avatar: 'https://randomuser.me/api/portraits/men/78.jpg',
    bio: 'Built the first commercial BCI. 3 FDA-cleared medical devices.',
    sessions: ['Neural Interface Demos'],
    order: 8,
  },
]

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to MongoDB')

    // Clear existing speakers so re-running this script doesn't create duplicates
    await Speaker.deleteMany({})
    console.log('🗑️  Cleared existing speakers')

    await Speaker.insertMany(speakers)
    console.log(`✅ Inserted ${speakers.length} speakers`)

    process.exit(0)
  } catch (err) {
    console.error('❌ Seed error:', err)
    process.exit(1)
  }
}

seed()