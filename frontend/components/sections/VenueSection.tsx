'use client'
import { useReveal } from '@/lib/useReveal'
import { useState } from 'react'
import {
  MapPin,
  Clock,
  Car,
  Train,
  Plane,
  ChevronRight,
  Navigation,
  Building2,
  Briefcase,
  Mic,
  Crown,
  Monitor,
  Dumbbell,
  UtensilsCrossed,
  ParkingCircle,
} from 'lucide-react'


const amenities = [
  { label: '15 Conference Halls', icon: Building2, color: 'text-blue-400' },
  { label: '3 Expo Floors', icon: Briefcase, color: 'text-indigo-400' },
  { label: '2 Outdoor Stages', icon: Mic, color: 'text-purple-400' },
  { label: 'VIP Lounges', icon: Crown, color: 'text-amber-400' },
  { label: 'Media Center', icon: Monitor, color: 'text-cyan-400' },
  { label: 'Wellness Zone', icon: Dumbbell, color: 'text-rose-400' },
  { label: '4 Restaurants', icon: UtensilsCrossed, color: 'text-orange-400' },
  { label: 'Secure Parking', icon: ParkingCircle, color: 'text-emerald-400' },
]

const transport = [
  { Icon: Train, title: 'BART / Caltrain', desc: 'Powell St Station — 8 min walk', time: '8 min' },
  { Icon: Car, title: 'Driving', desc: 'Valet parking at Howard St entrance', time: '0 min' },
  { Icon: Plane, title: 'SFO Airport', desc: 'BART direct to Moscone — 35 min', time: '35 min' },
]

export default function VenueSection() {
  const ref = useReveal()
  const [view, setView] = useState<'map' | 'floor'>('map')

  return (
    <section id="venue" className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-void via-neon/2 to-void" />

      <div ref={ref} className="reveal relative z-10 max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="h-px w-12 bg-neon/50" />
            <span className="font-mono text-xs text-neon tracking-widest">SAN FRANCISCO, CA</span>
            <div className="h-px w-12 bg-neon/50" />
          </div>
          <h2 className="font-display text-5xl md:text-7xl text-white tracking-wide mb-4">
            THE <span className="text-neon">VENUE</span>
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Map/Floor toggle */}
          <div className="space-y-4">
            <div className="flex gap-2 mb-4">
              {(['map', 'floor'] as const).map(v => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-4 py-2 rounded-lg font-mono text-xs tracking-widest border transition-all duration-300 ${
                    view === v
                      ? 'bg-neon/20 border-neon/50 text-neon'
                      : 'glass border-white/10 text-mist hover:text-white'
                  }`}
                >
                  {v === 'map' ? 'STREET MAP' : 'FLOOR PLAN'}
                </button>
              ))}
            </div>

            {/* Map embed */}
            <div className="relative rounded-2xl overflow-hidden h-80 glass border border-white/10">
              {view === 'map' ? (
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.0761597!2d-122.403!3d37.784!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8085807c8e0d30b5%3A0x6c9dbde3c5c9fc88!2sMoscone+Center!5e0!3m2!1sen!2sus!4v1234567890"
                  width="100%"
                  height="100%"
                  style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) brightness(0.8) contrast(1.1)' }}
                  allowFullScreen
                  loading="lazy"
                  title="Moscone Center Map"
                />
              ) : (
                <div className="h-full flex items-center justify-center bg-ash/50">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 glass rounded-xl flex items-center justify-center border border-neon/20">
                      <Navigation className="w-8 h-8 text-neon" />
                    </div>
                    <p className="font-mono text-sm text-mist">Interactive floor plan</p>
                    <p className="font-mono text-xs text-mist/50 mt-1">Available on event app</p>
                  </div>
                </div>
              )}
              <div className="absolute bottom-3 right-3 glass px-3 py-1.5 rounded-lg border border-white/10">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 text-ember" />
                  <span className="font-mono text-[10px] text-mist">Moscone Center, SF</span>
                </div>
              </div>
            </div>

            {/* Address card */}
            <div className="glass border border-white/8 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-ember/10 border border-ember/20 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-ember" />
                </div>
                <div>
                  <h4 className="font-display text-lg text-white tracking-wide">Moscone Center</h4>
                  <p className="font-mono text-xs text-mist mt-0.5">747 Howard St, San Francisco, CA 94103</p>
                  <a
                    href="https://maps.google.com/?q=Moscone+Center+San+Francisco"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-mono text-xs text-neon mt-2 hover:underline"
                  >
                    Open in Maps <ChevronRight className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Transport */}
            <div>
              <h3 className="font-display text-2xl text-white tracking-wide mb-4">GETTING THERE</h3>
              <div className="space-y-3">
                {transport.map(({ Icon, title, desc, time }, i) => (
                  <div
                    key={i}
                    className="glass border border-white/8 rounded-xl p-4 flex items-center gap-4 hover:border-neon/30 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-neon/10 border border-neon/20 flex items-center justify-center flex-shrink-0 group-hover:bg-neon/20 transition-colors">
                      <Icon className="w-5 h-5 text-neon" />
                    </div>
                    <div className="flex-1">
                      <p className="font-display text-sm text-white tracking-wide">{title}</p>
                      <p className="font-mono text-xs text-mist mt-0.5">{desc}</p>
                    </div>
                    <span className="font-mono text-xs text-neon">{time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Amenities */}
            <div>
              <h3 className="font-display text-2xl text-white tracking-wide mb-4">VENUE AMENITIES</h3>
              <div className="grid grid-cols-2 gap-2.5">
                {amenities.map(({ label, icon: Icon, color }, i) => (
                  <div
                    key={i}
                    className="glass border border-white/8 rounded-lg px-3 py-2.5 flex items-center gap-2.5 hover:border-white/20 transition-colors"
                  >
                    <Icon className={`w-5 h-5 ${color}`} />
                    <span className="font-body text-sm text-mist">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hours */}
            <div className="glass border border-white/8 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-ember" />
                <h4 className="font-display text-sm text-white tracking-wide">EVENT HOURS</h4>
              </div>
              {[
                { day: 'Day 1 (Sept 15)', time: '8:00 AM – 11:00 PM' },
                { day: 'Day 2 (Sept 16)', time: '8:00 AM – 12:00 AM' },
                { day: 'Day 3 (Sept 17)', time: '8:00 AM – 9:00 PM' },
              ].map(({ day, time }, i) => (
                <div key={i} className="flex justify-between py-2 border-b border-white/5 last:border-0">
                  <span className="font-mono text-xs text-mist">{day}</span>
                  <span className="font-mono text-xs text-white">{time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}