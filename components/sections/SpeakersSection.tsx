'use client'
import { useState } from 'react'
import { Twitter, Linkedin, Globe } from 'lucide-react'
import { useReveal } from '@/lib/useReveal'

const speakers = [
  {
    name: 'Sarah Chen', role: 'CEO, NeuralFlow', topic: 'The Next 10 Years of AI',
    tag: 'KEYNOTE', color: '#FF4500',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    bio: 'Former Google DeepMind researcher. Built the first human-level reasoning model.',
    talks: 2, sessions: ['Opening Keynote', 'Closing Fireside'],
  },
  {
    name: 'Dr. Kai Reeves', role: 'Chief Scientist, Quantum Labs', topic: 'Quantum Computing Today',
    tag: 'SCIENCE', color: '#7B2FFF',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    bio: 'Pioneer in quantum error correction. Published 200+ papers.',
    talks: 1, sessions: ['Intelligence Frontier'],
  },
  {
    name: 'Amara Singh', role: 'Founder, ChainVerse', topic: 'Web4 & Decentralized Identity',
    tag: 'WEB3', color: '#00FFB2',
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
    bio: 'Web3 architect. Built identity protocol used by 50M+ users.',
    talks: 1, sessions: ['Decentralized Identity'],
  },
  {
    name: 'Erika Novak', role: 'VP Engineering, SpaceOS', topic: 'Off-Planet Computing',
    tag: 'SPACE', color: '#FFD700',
    avatar: 'https://randomuser.me/api/portraits/women/17.jpg',
    bio: 'Designed systems running on the ISS. Building the first space-native OS.',
    talks: 2, sessions: ['Space Tech Keynote', 'Panel'],
  },
  {
    name: 'Dr. Mia Torres', role: 'Director, GreenAI Institute', topic: 'Climate & Technology',
    tag: 'CLIMATE', color: '#00FFB2',
    avatar: 'https://randomuser.me/api/portraits/women/29.jpg',
    bio: 'Using ML to solve climate crisis. Advised 3 governments on green tech.',
    talks: 1, sessions: ['Climate Tech Deep Dive'],
  },
  {
    name: 'Marcus Liu', role: 'Future of Work Lead, Meta', topic: 'Augmented Workplaces',
    tag: 'FUTURE', color: '#7B2FFF',
    avatar: 'https://randomuser.me/api/portraits/men/55.jpg',
    bio: 'Designed AR workspaces used by Fortune 500 companies globally.',
    talks: 1, sessions: ['Future of Work Summit'],
  },
  {
    name: 'Prof. Ada Osei', role: 'Oxford AI Ethics Chair', topic: 'Responsible AI Manifesto',
    tag: 'ETHICS', color: '#FF4500',
    avatar: 'https://randomuser.me/api/portraits/women/90.jpg',
    bio: 'Author of "The Ethical Machine". Advisor to UN AI policy group.',
    talks: 1, sessions: ['AI Ethics & Society'],
  },
  {
    name: 'James Park', role: 'CTO, BioMind', topic: 'Neural Interface Revolution',
    tag: 'BIOTECH', color: '#FFD700',
    avatar: 'https://randomuser.me/api/portraits/men/78.jpg',
    bio: 'Built the first commercial BCI. 3 FDA-cleared medical devices.',
    talks: 1, sessions: ['Neural Interface Demos'],
  },
]

function SpeakerCard({ speaker, index }: { speaker: typeof speakers[0], index: number }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className={`relative group rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 ${
        hovered ? 'scale-[1.03] z-10' : 'scale-100'
      }`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        boxShadow: hovered ? `0 0 40px ${speaker.color}30, 0 0 80px ${speaker.color}15` : 'none',
      }}
    >
      {/* Animated gradient border */}
      <div
        className="absolute inset-0 rounded-2xl transition-opacity duration-500"
        style={{
          background: `linear-gradient(135deg, ${speaker.color}40, transparent, ${speaker.color}20)`,
          opacity: hovered ? 1 : 0,
        }}
      />

      <div className="relative glass border border-white/8 hover:border-white/20 rounded-2xl overflow-hidden transition-colors">
        {/* Image area */}
        <div className="relative h-52 overflow-hidden">
          <img
            src={speaker.avatar}
            alt={speaker.name}
            className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-110"
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-void via-void/20 to-transparent" />
          {/* Tag */}
          <div
            className="absolute top-3 right-3 font-mono text-[10px] tracking-widest px-2 py-1 rounded-full border"
            style={{ color: speaker.color, borderColor: `${speaker.color}40`, background: `${speaker.color}15` }}
          >
            {speaker.tag}
          </div>
          {/* Sessions count */}
          <div className="absolute top-3 left-3 font-mono text-[10px] tracking-widest text-mist glass px-2 py-1 rounded-full">
            {speaker.talks} talk{speaker.talks > 1 ? 's' : ''}
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="font-display text-xl text-white tracking-wide">{speaker.name}</h3>
          <p className="font-mono text-xs mt-0.5" style={{ color: speaker.color }}>{speaker.role}</p>
          <p className="font-body text-sm text-mist mt-2 leading-relaxed line-clamp-2">{speaker.bio}</p>

          {/* Sessions */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {speaker.sessions.map((s, i) => (
              <span key={i} className="font-mono text-[10px] text-mist/60 bg-white/5 px-2 py-1 rounded">
                {s}
              </span>
            ))}
          </div>

          {/* Social */}
          <div
            className={`flex gap-3 mt-3 transition-all duration-300 ${hovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
          >
            {[Twitter, Linkedin, Globe].map((Icon, i) => (
              <button
                key={i}
                className="w-8 h-8 rounded-full glass flex items-center justify-center text-mist hover:text-white transition-colors"
              >
                <Icon className="w-3.5 h-3.5" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SpeakersSection() {
  const ref = useReveal()
  const [filter, setFilter] = useState('ALL')
  const tags = ['ALL', 'KEYNOTE', 'AI/ML', 'WEB3', 'SPACE', 'BIOTECH', 'ETHICS']

  const filtered = filter === 'ALL' ? speakers : speakers.filter(s => s.tag === filter)

  return (
    <section id="speakers" className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-void via-plasma/3 to-void" />
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-plasma/5 blur-[80px]" />

      <div ref={ref} className="reveal relative z-10 max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="h-px w-12 bg-plasma/50" />
            <span className="font-mono text-xs text-plasma tracking-widest">WORLD-CLASS LINEUP</span>
            <div className="h-px w-12 bg-plasma/50" />
          </div>
          <h2 className="font-display text-5xl md:text-7xl text-white tracking-wide mb-4">
            MEET THE <span className="text-plasma">SPEAKERS</span>
          </h2>
          <p className="font-body text-mist max-w-lg mx-auto">
            50+ visionaries who are actively reshaping the boundaries of what's possible.
          </p>
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {tags.map(tag => (
            <button
              key={tag}
              onClick={() => setFilter(tag)}
              className={`px-4 py-1.5 rounded-full font-mono text-xs tracking-widest border transition-all duration-300 ${
                filter === tag
                  ? 'bg-plasma text-white border-plasma glow-plasma'
                  : 'glass border-white/10 text-mist hover:border-plasma/30 hover:text-white'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((speaker, i) => (
            <SpeakerCard key={speaker.name} speaker={speaker} index={i} />
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <p className="font-mono text-sm text-mist mb-4">+42 more speakers to be announced</p>
          <button className="glass border border-plasma/30 hover:border-plasma px-6 py-3 rounded-xl font-mono text-sm text-mist hover:text-white transition-all duration-300">
            VIEW FULL SPEAKER LIST →
          </button>
        </div>
      </div>
    </section>
  )
}
