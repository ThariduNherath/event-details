'use client'
import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { ArrowDown, MapPin, Calendar, Star } from 'lucide-react'

const Scene3D = dynamic(() => import('@/components/3d/Scene3D'), { ssr: false })

export default function HeroBanner() {
  const heroRef = useRef<HTMLDivElement>(null)
  const [scrollY, setScrollY] = useState(0)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setTimeout(() => setLoaded(true), 200)
    const onScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const parallax = scrollY * 0.3

  return (
    <section id="hero" className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-gradient-radial from-plasma/10 via-void to-void" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-ember/5 blur-[120px]" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-plasma/8 blur-[100px]" />

      {/* 3D Scene */}
      <div
        className="absolute inset-0 z-0"
        style={{ transform: `translateY(${parallax}px)` }}
      >
        <Scene3D />
      </div>

      {/* Scanlines */}
      <div className="absolute inset-0 scanlines z-10 pointer-events-none opacity-30" />

      {/* Content */}
      <div className="relative z-20 max-w-7xl mx-auto px-6 pt-24 pb-16 w-full">
        <div className="max-w-3xl">
          {/* Badge */}
          <div
            className={`inline-flex items-center gap-2 glass border-ember/30 rounded-full px-4 py-1.5 mb-8 transition-all duration-1000 ${
              loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-neon animate-pulse" />
            <span className="font-mono text-xs text-neon tracking-widest">REGISTRATION OPEN</span>
            <span className="font-mono text-xs text-mist">· 127 DAYS TO GO</span>
          </div>

          {/* Main title */}
          <h1
            className={`font-display text-[clamp(4rem,12vw,7rem)] leading-none tracking-wide mb-6 transition-all duration-1000 delay-200 ${
              loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <span className="block text-white">THE</span>
            <span className="block gradient-text text-glow-ember">FUTURE</span>
            <span className="block text-white/80">AWAITS</span>
          </h1>

          {/* Subtitle */}
          <p
            className={`font-body text-lg text-mist max-w-lg mb-8 leading-relaxed transition-all duration-1000 delay-300 ${
              loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            Three days. 50 visionaries. Infinite possibilities. NEXUS 2025 is where the world's
            brightest minds converge to shape tomorrow's reality.
          </p>

          {/* Meta info */}
          <div
            className={`flex flex-wrap items-center gap-6 mb-10 transition-all duration-1000 delay-400 ${
              loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <div className="flex items-center gap-2 text-mist">
              <Calendar className="w-4 h-4 text-ember" />
              <span className="font-body text-sm">Sept 15–17, 2025</span>
            </div>
            <div className="flex items-center gap-2 text-mist">
              <MapPin className="w-4 h-4 text-ember" />
              <span className="font-body text-sm">Moscone Center, SF</span>
            </div>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 text-gold fill-gold" />
              ))}
              <span className="font-mono text-xs text-mist ml-1">4.9 (2,400+)</span>
            </div>
          </div>

          {/* CTA buttons */}
          <div
            className={`flex flex-wrap gap-4 transition-all duration-1000 delay-500 ${
              loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <button
              onClick={() => document.getElementById('tickets')?.scrollIntoView({ behavior: 'smooth' })}
              className="relative overflow-hidden px-8 py-4 font-display text-base tracking-wide bg-ember text-white rounded-lg glow-ember hover:scale-105 transition-all duration-300 group"
            >
              <span className="relative z-10">SECURE YOUR SEAT</span>
              <div className="absolute inset-0 bg-gradient-to-r from-ember to-plasma opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>

            <button
              onClick={() => document.getElementById('schedule')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 font-display text-base tracking-wide glass border border-white/20 text-white rounded-lg hover:border-neon/40 hover:text-neon transition-all duration-300"
            >
              VIEW SCHEDULE
            </button>
          </div>
        </div>

        {/* Floating cards */}
        <div className="absolute right-4 md:right-16 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-4">
          {[
            { val: '50+', label: 'Speakers', color: 'text-ember' },
            { val: '10K', label: 'Attendees', color: 'text-neon' },
            { val: '72H', label: 'Content', color: 'text-plasma' },
          ].map((stat, i) => (
            <div
              key={i}
              className={`glass rounded-xl p-4 text-center border-ember/10 transition-all duration-1000 ${
                loaded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
              }`}
              style={{ transitionDelay: `${600 + i * 150}ms` }}
            >
              <div className={`font-display text-2xl ${stat.color}`}>{stat.val}</div>
              <div className="font-mono text-[10px] text-mist tracking-widest mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-20 animate-bounce">
        <span className="font-mono text-[10px] text-mist tracking-widest">SCROLL</span>
        <ArrowDown className="w-4 h-4 text-ember" />
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-void to-transparent z-10" />
    </section>
  )
}
