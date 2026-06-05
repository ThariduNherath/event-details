'use client'

const items = [
  '🔥 NEXUS 2025 — SEPT 15–17, SAN FRANCISCO',
  '⚡ 10,000+ ATTENDEES REGISTERED',
  '🎤 50+ WORLD-CLASS SPEAKERS',
  '🎟️ EARLY BIRD TICKETS NOW AVAILABLE',
  '🌐 HYBRID EVENT — IN-PERSON & VIRTUAL',
  '🤖 AI · WEB3 · BIOTECH · SPACE TECH',
]

export default function Ticker() {
  const doubled = [...items, ...items]
  return (
    <div className="relative overflow-hidden bg-ember/10 border-y border-ember/20 py-2.5 z-10">
      <div className="flex animate-ticker whitespace-nowrap" style={{ width: 'max-content' }}>
        {doubled.map((item, i) => (
          <span key={i} className="font-mono text-xs text-ember mx-8 tracking-widest">
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}
