'use client'
import { useState, useRef } from 'react'
import { Clock, Mic, Users, Zap, Coffee, Globe } from 'lucide-react'
import { useReveal } from '@/lib/useReveal'

const days = [
  {
    day: 'Day 1', date: 'Sept 15', theme: 'EMERGENCE',
    events: [
      { time: '09:00', title: 'Opening Ceremony', type: 'keynote', speaker: 'Sarah Chen', duration: '60 min', tag: 'KEYNOTE', color: 'ember' },
      { time: '10:15', title: 'The Next Intelligence Frontier', type: 'talk', speaker: 'Dr. Kai Reeves', duration: '45 min', tag: 'AI/ML', color: 'plasma' },
      { time: '11:15', title: 'Coffee & Networking', type: 'break', speaker: '', duration: '30 min', tag: 'BREAK', color: 'mist' },
      { time: '11:45', title: 'Decentralized Identity in Web4', type: 'talk', speaker: 'Amara Singh', duration: '45 min', tag: 'WEB3', color: 'neon' },
      { time: '13:00', title: 'Lunch & Expo Hall', type: 'break', speaker: '', duration: '90 min', tag: 'LUNCH', color: 'mist' },
      { time: '14:30', title: 'Biotech Revolution Panel', type: 'panel', speaker: '5 Panelists', duration: '75 min', tag: 'BIOTECH', color: 'gold' },
      { time: '16:00', title: 'Hack the Future Workshop', type: 'workshop', speaker: 'Teams', duration: '120 min', tag: 'WORKSHOP', color: 'ember' },
      { time: '19:00', title: 'Opening Night Gala', type: 'social', speaker: '', duration: '180 min', tag: 'SOCIAL', color: 'plasma' },
    ]
  },
  {
    day: 'Day 2', date: 'Sept 16', theme: 'CONVERGENCE',
    events: [
      { time: '09:00', title: 'Space Tech Morning Keynote', type: 'keynote', speaker: 'Erika Novak', duration: '60 min', tag: 'KEYNOTE', color: 'ember' },
      { time: '10:15', title: 'Neural Interface Demos', type: 'demo', speaker: 'NeuroLab', duration: '45 min', tag: 'DEMO', color: 'neon' },
      { time: '11:00', title: 'Climate Tech Deep Dive', type: 'talk', speaker: 'Dr. Mia Torres', duration: '45 min', tag: 'CLIMATE', color: 'neon' },
      { time: '13:00', title: 'Lunch & Startup Showcase', type: 'break', speaker: '', duration: '90 min', tag: 'LUNCH', color: 'mist' },
      { time: '14:30', title: 'Venture Capital Roundtable', type: 'panel', speaker: '4 VCs', duration: '75 min', tag: 'VENTURE', color: 'gold' },
      { time: '16:00', title: 'Future of Work Summit', type: 'talk', speaker: 'Marcus Liu', duration: '60 min', tag: 'FUTURE', color: 'plasma' },
      { time: '20:00', title: 'Tech Rooftop Party', type: 'social', speaker: '', duration: '180 min', tag: 'SOCIAL', color: 'plasma' },
    ]
  },
  {
    day: 'Day 3', date: 'Sept 17', theme: 'TRANSCENDENCE',
    events: [
      { time: '09:00', title: 'AI Ethics & Society', type: 'keynote', speaker: 'Prof. Ada Osei', duration: '60 min', tag: 'KEYNOTE', color: 'ember' },
      { time: '10:30', title: 'Hackathon Finals', type: 'competition', speaker: 'Teams', duration: '120 min', tag: 'HACKATHON', color: 'neon' },
      { time: '13:00', title: 'Final Lunch', type: 'break', speaker: '', duration: '90 min', tag: 'LUNCH', color: 'mist' },
      { time: '14:30', title: 'Award Ceremony', type: 'ceremony', speaker: 'All', duration: '60 min', tag: 'AWARDS', color: 'gold' },
      { time: '15:30', title: 'Closing Fireside Chat', type: 'keynote', speaker: 'Sarah Chen + Kai Reeves', duration: '60 min', tag: 'CLOSING', color: 'ember' },
      { time: '17:00', title: 'Farewell Cocktails', type: 'social', speaker: '', duration: '120 min', tag: 'SOCIAL', color: 'plasma' },
    ]
  }
]

const typeIcon = (type: string) => {
  switch (type) {
    case 'keynote': return <Mic className="w-3 h-3" />
    case 'panel': return <Users className="w-3 h-3" />
    case 'break': return <Coffee className="w-3 h-3" />
    case 'workshop': return <Zap className="w-3 h-3" />
    default: return <Globe className="w-3 h-3" />
  }
}

const tagColor = (color: string) => {
  const map: Record<string, string> = {
    ember: 'text-ember border-ember/30 bg-ember/10',
    neon: 'text-neon border-neon/30 bg-neon/10',
    plasma: 'text-plasma border-plasma/30 bg-plasma/10',
    gold: 'text-gold border-gold/30 bg-gold/10',
    mist: 'text-mist border-mist/30 bg-mist/10',
  }
  return map[color] || map.mist
}

export default function ScheduleSection() {
  const [activeDay, setActiveDay] = useState(0)
  const [hoveredEvent, setHoveredEvent] = useState<number | null>(null)
  const ref = useReveal()

  return (
    <section id="schedule" className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-void via-ash/20 to-void" />

      <div ref={ref} className="reveal relative z-10 max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="h-px w-12 bg-neon/50" />
            <span className="font-mono text-xs text-neon tracking-widest">3-DAY PROGRAM</span>
            <div className="h-px w-12 bg-neon/50" />
          </div>
          <h2 className="font-display text-5xl md:text-7xl text-white tracking-wide">
            EVENT <span className="text-neon">SCHEDULE</span>
          </h2>
        </div>

        {/* Tab navigation */}
        <div className="flex gap-2 md:gap-4 mb-12 flex-wrap justify-center">
          {days.map((d, i) => (
            <button
              key={i}
              onClick={() => setActiveDay(i)}
              className={`relative px-6 py-3 rounded-xl font-body text-sm transition-all duration-300 group overflow-hidden ${
                activeDay === i
                  ? 'bg-ember text-white glow-ember scale-105'
                  : 'glass text-mist hover:text-white border border-white/10 hover:border-ember/30'
              }`}
            >
              <span className="relative z-10">
                <span className="font-display text-base tracking-wide">{d.day}</span>
                <span className="block font-mono text-[10px] tracking-widest opacity-70">{d.date} · {d.theme}</span>
              </span>
              {activeDay !== i && (
                <div className="absolute inset-0 bg-ember/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </button>
          ))}
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[88px] md:left-24 top-0 bottom-0 w-px bg-gradient-to-b from-ember/0 via-ember/30 to-ember/0 hidden sm:block" />

          <div className="space-y-3">
            {days[activeDay].events.map((event, i) => (
              <div
                key={i}
                className={`relative flex gap-4 md:gap-6 items-start group transition-all duration-300 ${
                  hoveredEvent === i ? 'scale-[1.01]' : ''
                }`}
                onMouseEnter={() => setHoveredEvent(i)}
                onMouseLeave={() => setHoveredEvent(null)}
              >
                {/* Time */}
                <div className="w-16 md:w-20 flex-shrink-0 pt-3">
                  <span className="font-mono text-xs text-mist">{event.time}</span>
                </div>

                {/* Dot on timeline */}
                <div className="hidden sm:flex flex-shrink-0 w-8 items-start justify-center pt-4">
                  <div className={`w-2 h-2 rounded-full border transition-all duration-300 ${
                    event.type === 'break' ? 'border-mist/40 bg-mist/20' :
                    hoveredEvent === i ? 'border-ember bg-ember glow-ember scale-150' :
                    'border-ember/60 bg-ember/20'
                  }`} />
                </div>

                {/* Card */}
                <div className={`flex-1 glass rounded-xl p-4 border transition-all duration-300 ${
                  event.type === 'break'
                    ? 'border-white/5 opacity-60'
                    : hoveredEvent === i
                    ? 'border-ember/40 glow-ember'
                    : 'border-white/8 hover:border-white/20'
                }`}>
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`inline-flex items-center gap-1 font-mono text-[10px] tracking-widest border rounded-full px-2 py-0.5 ${tagColor(event.color)}`}>
                          {typeIcon(event.type)}
                          {event.tag}
                        </span>
                        <span className="font-mono text-[10px] text-mist/50">{event.duration}</span>
                      </div>
                      <h3 className={`font-body font-medium text-base leading-tight ${
                        event.type === 'break' ? 'text-mist' : 'text-white'
                      }`}>
                        {event.title}
                      </h3>
                      {event.speaker && (
                        <p className="font-mono text-xs text-mist mt-1">{event.speaker}</p>
                      )}
                    </div>
                    {event.type !== 'break' && (
                      <Clock className="w-4 h-4 text-mist/40 flex-shrink-0 mt-1" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Download CTA */}
        <div className="text-center mt-12">
          <button className="inline-flex items-center gap-2 glass border border-white/10 hover:border-neon/30 px-6 py-3 rounded-xl font-mono text-sm text-mist hover:text-neon transition-all duration-300">
            <Globe className="w-4 h-4" />
            DOWNLOAD FULL SCHEDULE PDF
          </button>
        </div>
      </div>
    </section>
  )
}
