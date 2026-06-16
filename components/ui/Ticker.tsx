'use client'

import { FaFire, FaBolt, FaMicrophoneAlt, FaTicketAlt, FaGlobeAmericas, FaBrain } from 'react-icons/fa'

const items = [
  { icon: FaFire, text: 'NEXUS 2025 — SEPT 15–17, SAN FRANCISCO', color: 'text-orange-500' },
  { icon: FaBolt, text: '10,000+ ATTENDEES REGISTERED', color: 'text-yellow-400' },
  { icon: FaMicrophoneAlt, text: '50+ WORLD-CLASS SPEAKERS', color: 'text-cyan-400' },
  { icon: FaTicketAlt, text: 'EARLY BIRD TICKETS NOW AVAILABLE', color: 'text-emerald-400' },
  { icon: FaGlobeAmericas, text: 'HYBRID EVENT — IN-PERSON & VIRTUAL', color: 'text-sky-400' },
  { icon: FaBrain, text: 'AI · WEB3 · BIOTECH · SPACE TECH', color: 'text-purple-400' },
]

export default function Ticker() {
  const doubled = [...items, ...items]
  return (
    <div className="relative overflow-hidden bg-ember/10 border-y border-ember/20 py-2.5 z-10">
      <div className="flex animate-ticker whitespace-nowrap" style={{ width: 'max-content' }}>
        {doubled.map(({ icon: Icon, text, color }, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-2 font-mono text-xs text-ember mx-8 tracking-widest"
          >
            <Icon className={`w-4 h-4 ${color} drop-shadow-[0_0_2px_rgba(255,255,255,0.3)]`} />
            {text}
          </span>
        ))}
      </div>
    </div>
  )
}