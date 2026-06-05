'use client'
import { useEffect, useState } from 'react'
import { Menu, X, Zap } from 'lucide-react'

const links = ['Schedule', 'Speakers', 'Tickets', 'Venue', 'Reviews']

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollTo = (id: string) => {
    document.getElementById(id.toLowerCase())?.scrollIntoView({ behavior: 'smooth' })
    setOpen(false)
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
      scrolled ? 'glass border-b border-white/5 py-3' : 'py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2 group">
          <div className="relative">
            <Zap className="w-6 h-6 text-ember group-hover:text-neon transition-colors" fill="currentColor" />
            <div className="absolute inset-0 blur-md bg-ember/50 group-hover:bg-neon/50 transition-colors" />
          </div>
          <span className="font-display text-2xl tracking-wider text-white">NEXUS</span>
          <span className="font-mono text-xs text-ember border border-ember/40 px-1.5 py-0.5 rounded">2025</span>
        </div>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {links.map(link => (
            <button
              key={link}
              onClick={() => scrollTo(link)}
              className="relative px-4 py-2 font-body text-sm text-mist hover:text-white transition-colors group"
            >
              {link}
              <span className="absolute bottom-1 left-4 right-4 h-px bg-ember scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            </button>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-mono text-xs text-neon">
            <span className="w-1.5 h-1.5 rounded-full bg-neon animate-pulse" />
            LIVE
          </span>
          <button
            onClick={() => scrollTo('Tickets')}
            className="relative px-5 py-2 font-display text-sm tracking-wide bg-ember hover:bg-ember/90 text-white rounded transition-all glow-ember hover:scale-105"
          >
            GET TICKETS
          </button>
        </div>

        {/* Mobile menu */}
        <button className="md:hidden text-white" onClick={() => setOpen(!open)}>
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="md:hidden glass border-t border-white/5 px-6 py-4 flex flex-col gap-3">
          {links.map(link => (
            <button
              key={link}
              onClick={() => scrollTo(link)}
              className="text-left font-body text-base text-mist hover:text-white transition-colors py-1"
            >
              {link}
            </button>
          ))}
          <button
            onClick={() => scrollTo('Tickets')}
            className="mt-2 px-5 py-3 font-display text-sm tracking-wide bg-ember text-white rounded glow-ember"
          >
            GET TICKETS
          </button>
        </div>
      )}
    </nav>
  )
}
