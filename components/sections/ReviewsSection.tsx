'use client'
import { useState, useRef, useEffect } from 'react'
import { Star, Quote, ChevronLeft, ChevronRight, ThumbsUp } from 'lucide-react'
import { useReveal } from '@/lib/useReveal'

const reviews = [
  {
    name: 'Alexandra Petrov', role: 'CTO, TechFusion', year: 'NEXUS 2024',
    avatar: 'https://randomuser.me/api/portraits/women/12.jpg',
    rating: 5,
    text: "NEXUS completely changed my perspective on AI's trajectory. The networking alone was worth 10x the ticket price. Met my co-founder here.",
    tag: 'Networking',
  },
  {
    name: 'Jordan Kim', role: 'Founder, DataStream', year: 'NEXUS 2023',
    avatar: 'https://randomuser.me/api/portraits/men/23.jpg',
    rating: 5,
    text: "I've been to 50+ tech conferences. Nothing comes close to NEXUS. The production quality, the speakers, the energy — otherworldly.",
    tag: 'Production',
  },
  {
    name: 'Priya Sharma', role: 'AI Researcher, MIT', year: 'NEXUS 2024',
    avatar: 'https://randomuser.me/api/portraits/women/56.jpg',
    rating: 5,
    text: 'Saw demos here 6 months before they went public. NEXUS is where the real future is revealed first. Absolutely essential attendance.',
    tag: 'Cutting Edge',
  },
  {
    name: 'Marcus Webb', role: 'Venture Partner, a16z', year: 'NEXUS 2022',
    avatar: 'https://randomuser.me/api/portraits/men/41.jpg',
    rating: 5,
    text: 'We\'ve made 4 investments directly from connections made at NEXUS. It\'s not just a conference — it\'s a deal-making machine.',
    tag: 'Business',
  },
  {
    name: 'Yuki Tanaka', role: 'Product Lead, Figma', year: 'NEXUS 2024',
    avatar: 'https://randomuser.me/api/portraits/women/33.jpg',
    rating: 5,
    text: 'The workshop sessions are incredible. Hands-on, practical, led by people actually building these technologies. Pure gold.',
    tag: 'Workshops',
  },
  {
    name: 'Carlos Mendez', role: 'Startup CEO', year: 'NEXUS 2023',
    avatar: 'https://randomuser.me/api/portraits/men/67.jpg',
    rating: 5,
    text: "Raised my Series A within 3 months of pitching at NEXUS Startup Showcase. This event literally changed my company's trajectory.",
    tag: 'Funding',
  },
]

const stats = [
  { value: '98%', label: 'Would recommend' },
  { value: '4.9', label: 'Average rating' },
  { value: '2,400+', label: 'Reviews' },
  { value: '3rd', label: 'Year running' },
]

function ReviewCard({ review, active }: { review: typeof reviews[0]; active: boolean }) {
  return (
    <div
      className={`relative glass border rounded-2xl p-6 transition-all duration-500 flex-shrink-0 w-full md:w-[380px] ${
        active ? 'border-ember/30 scale-100' : 'border-white/8 scale-95 opacity-60'
      }`}
    >
      <Quote className="w-8 h-8 text-ember/30 mb-4" />

      <p className="font-body text-sm text-mist leading-relaxed mb-6">{review.text}</p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={review.avatar}
            alt={review.name}
            className="w-10 h-10 rounded-full object-cover border-2 border-ember/20"
          />
          <div>
            <p className="font-body font-medium text-sm text-white">{review.name}</p>
            <p className="font-mono text-[10px] text-mist/60">{review.role}</p>
          </div>
        </div>

        <div className="text-right">
          <div className="flex gap-0.5 justify-end mb-1">
            {[...Array(review.rating)].map((_, i) => (
              <Star key={i} className="w-3 h-3 text-gold fill-gold" />
            ))}
          </div>
          <span className="font-mono text-[10px] text-ember/70">{review.year}</span>
        </div>
      </div>

      {/* Tag */}
      <div className="absolute top-4 right-4 font-mono text-[10px] text-ember/70 bg-ember/10 border border-ember/20 px-2 py-0.5 rounded-full">
        {review.tag}
      </div>
    </div>
  )
}

export default function ReviewsSection() {
  const ref = useReveal()
  const [activeIdx, setActiveIdx] = useState(1)
  const [likes, setLikes] = useState<Record<number, boolean>>({})

  const prev = () => setActiveIdx(i => Math.max(0, i - 1))
  const next = () => setActiveIdx(i => Math.min(reviews.length - 1, i + 1))

  return (
    <section id="reviews" className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-void via-gold/2 to-void" />

      <div ref={ref} className="reveal relative z-10 max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="h-px w-12 bg-gold/50" />
            <span className="font-mono text-xs text-gold tracking-widest">WHAT PEOPLE SAY</span>
            <div className="h-px w-12 bg-gold/50" />
          </div>
          <h2 className="font-display text-5xl md:text-7xl text-white tracking-wide mb-8">
            REAL <span className="gradient-text-gold">REVIEWS</span>
          </h2>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 mb-4">
            {stats.map(({ value, label }, i) => (
              <div key={i} className="text-center">
                <div className="font-display text-3xl text-gold tracking-wide">{value}</div>
                <div className="font-mono text-xs text-mist tracking-widest">{label}</div>
              </div>
            ))}
          </div>

          {/* Stars row */}
          <div className="flex items-center justify-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 text-gold fill-gold" />
            ))}
            <span className="font-mono text-sm text-mist ml-2">4.9 / 5.0</span>
          </div>
        </div>

        {/* Slider */}
        <div className="relative overflow-hidden">
          <div
            className="flex gap-5 transition-transform duration-500 ease-out"
            style={{ transform: `translateX(calc(-${activeIdx * (380 + 20)}px + 50% - 190px))` }}
          >
            {reviews.map((review, i) => (
              <ReviewCard key={i} review={review} active={i === activeIdx} />
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={prev}
            disabled={activeIdx === 0}
            className="w-10 h-10 rounded-full glass border border-white/10 flex items-center justify-center text-mist hover:text-white hover:border-ember/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {reviews.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIdx(i)}
              className={`transition-all duration-300 rounded-full ${
                i === activeIdx ? 'w-6 h-2 bg-ember' : 'w-2 h-2 bg-white/20 hover:bg-white/40'
              }`}
            />
          ))}

          <button
            onClick={next}
            disabled={activeIdx === reviews.length - 1}
            className="w-10 h-10 rounded-full glass border border-white/10 flex items-center justify-center text-mist hover:text-white hover:border-ember/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <a
            href="#"
            className="inline-flex items-center gap-2 font-mono text-sm text-mist/60 hover:text-gold transition-colors"
          >
            <ThumbsUp className="w-4 h-4" />
            Read all 2,400+ reviews on Trustpilot →
          </a>
        </div>
      </div>
    </section>
  )
}
