'use client'
import { useEffect, useState } from 'react'
import { Twitter, Linkedin, Globe, Loader2 } from 'lucide-react'
import { useReveal } from '@/lib/useReveal'
import { api } from '@/lib/api'
import { SpeakerCardSkeleton } from '@/components/ui/Skeleton'

interface Speaker {
  _id: string
  name: string
  role: string
  topic: string
  tag: string
  color: string
  avatar: string
  bio: string
  sessions: string[]
}

function SpeakerCard({ speaker }: { speaker: Speaker }) {
  const [hovered, setHovered] = useState(false)
  const talks = speaker.sessions.length

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
      <div
        className="absolute inset-0 rounded-2xl transition-opacity duration-500"
        style={{
          background: `linear-gradient(135deg, ${speaker.color}40, transparent, ${speaker.color}20)`,
          opacity: hovered ? 1 : 0,
        }}
      />

      <div className="relative glass border border-white/8 hover:border-white/20 rounded-2xl overflow-hidden transition-colors">
        <div className="relative h-52 overflow-hidden">
          <img
            src={speaker.avatar}
            alt={speaker.name}
            className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-void via-void/20 to-transparent" />
          <div
            className="absolute top-3 right-3 font-mono text-[10px] tracking-widest px-2 py-1 rounded-full border"
            style={{ color: speaker.color, borderColor: `${speaker.color}40`, background: `${speaker.color}15` }}
          >
            {speaker.tag}
          </div>
          <div className="absolute top-3 left-3 font-mono text-[10px] tracking-widest text-mist glass px-2 py-1 rounded-full">
            {talks} talk{talks !== 1 ? 's' : ''}
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-display text-xl text-white tracking-wide">{speaker.name}</h3>
          <p className="font-mono text-xs mt-0.5" style={{ color: speaker.color }}>{speaker.role}</p>
          {speaker.bio && (
            <p className="font-body text-sm text-mist mt-2 leading-relaxed line-clamp-2">{speaker.bio}</p>
          )}

          {speaker.sessions.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {speaker.sessions.map((s, i) => (
                <span key={i} className="font-mono text-[10px] text-mist/60 bg-white/5 px-2 py-1 rounded">
                  {s}
                </span>
              ))}
            </div>
          )}

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
  const [speakers, setSpeakers] = useState<Speaker[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')

  useEffect(() => {
    api
      .getSpeakers()
      .then((data) => setSpeakers(data.speakers))
      .catch(() => setSpeakers([]))
      .finally(() => setLoading(false))
  }, [])

  const tags = ['ALL', ...Array.from(new Set(speakers.map((s) => s.tag)))]
  const filtered = filter === 'ALL' ? speakers : speakers.filter((s) => s.tag === filter)

  return (
    <section id="speakers" className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-void via-plasma/3 to-void" />
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-plasma/5 blur-[80px]" />

      <div ref={ref} className="reveal relative z-10 max-w-7xl mx-auto px-6">
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

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => <SpeakerCardSkeleton key={i} />)}
          </div>
        ) : speakers.length === 0 ? (
          <p className="text-center font-body text-sm text-mist/60 py-20">Speakers will be announced soon.</p>
        ) : (
          <>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.map((speaker) => (
                <SpeakerCard key={speaker._id} speaker={speaker} />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  )
}