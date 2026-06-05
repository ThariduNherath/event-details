'use client'
import { useEffect, useState, useRef } from 'react'
import { useReveal } from '@/lib/useReveal'

interface TimeUnit {
  value: number
  label: string
  prev: number
}

function FlipCard({ value, label, prev }: TimeUnit) {
  const [flipping, setFlipping] = useState(false)

  useEffect(() => {
    if (value !== prev) {
      setFlipping(true)
      setTimeout(() => setFlipping(false), 300)
    }
  }, [value, prev])

  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        {/* Glow */}
        <div className="absolute inset-0 bg-ember/20 blur-xl rounded-2xl" />
        {/* Card */}
        <div className="relative w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 glass border border-ember/20 rounded-2xl flex items-center justify-center overflow-hidden group hover:border-ember/50 transition-colors">
          <span
            className={`font-display text-4xl sm:text-5xl md:text-6xl text-white tracking-wide ${
              flipping ? 'flip-in' : ''
            }`}
          >
            {pad(value)}
          </span>
          {/* Shine */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          {/* Divider line */}
          <div className="absolute left-0 right-0 top-1/2 h-px bg-black/40" />
        </div>
      </div>
      <span className="font-mono text-xs text-mist tracking-widest uppercase">{label}</span>
    </div>
  )
}

function Separator() {
  const [blink, setBlink] = useState(true)
  useEffect(() => {
    const i = setInterval(() => setBlink(b => !b), 1000)
    return () => clearInterval(i)
  }, [])
  return (
    <div className={`flex flex-col gap-2 mb-7 transition-opacity duration-500 ${blink ? 'opacity-100' : 'opacity-30'}`}>
      <div className="w-1.5 h-1.5 rounded-full bg-ember" />
      <div className="w-1.5 h-1.5 rounded-full bg-ember" />
    </div>
  )
}

const TARGET = new Date('2025-09-15T09:00:00').getTime()

export default function CountdownSection() {
  const ref = useReveal()
  const [units, setUnits] = useState({ days: 0, hours: 0, mins: 0, secs: 0 })
  const prevRef = useRef({ days: 0, hours: 0, mins: 0, secs: 0 })

  useEffect(() => {
    const tick = () => {
      const now = Date.now()
      const diff = Math.max(0, TARGET - now)
      const days = Math.floor(diff / 86400000)
      const hours = Math.floor((diff % 86400000) / 3600000)
      const mins = Math.floor((diff % 3600000) / 60000)
      const secs = Math.floor((diff % 60000) / 1000)
      prevRef.current = { ...units }
      setUnits({ days, hours, mins, secs })
    }
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [])

  const timeUnits = [
    { value: units.days, label: 'Days', prev: prevRef.current.days },
    { value: units.hours, label: 'Hours', prev: prevRef.current.hours },
    { value: units.mins, label: 'Minutes', prev: prevRef.current.mins },
    { value: units.secs, label: 'Seconds', prev: prevRef.current.secs },
  ]

  return (
    <section id="countdown" className="relative py-24 overflow-hidden">
      {/* BG */}
      <div className="absolute inset-0 bg-gradient-to-b from-void via-ash/30 to-void" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-plasma/5 blur-[100px]" />

      <div ref={ref} className="reveal relative z-10 max-w-5xl mx-auto px-6 text-center">
        {/* Label */}
        <div className="inline-flex items-center gap-2 mb-6">
          <div className="h-px w-12 bg-ember/50" />
          <span className="font-mono text-xs text-ember tracking-widest">EVENT STARTS IN</span>
          <div className="h-px w-12 bg-ember/50" />
        </div>

        <h2 className="font-display text-5xl md:text-7xl text-white tracking-wide mb-16">
          COUNT<span className="text-ember">DOWN</span>
        </h2>

        {/* Countdown units */}
        <div className="flex items-center justify-center gap-4 sm:gap-6 md:gap-8 flex-wrap">
          {timeUnits.map((unit, i) => (
            <div key={unit.label} className="flex items-center gap-4 sm:gap-6 md:gap-8">
              <FlipCard {...unit} />
              {i < timeUnits.length - 1 && <Separator />}
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="mt-16 max-w-2xl mx-auto">
          <div className="flex justify-between font-mono text-xs text-mist mb-2">
            <span>TICKET AVAILABILITY</span>
            <span className="text-neon">73% SOLD</span>
          </div>
          <div className="h-2 bg-ash rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-ember via-plasma to-neon rounded-full relative"
              style={{ width: '73%' }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-neon glow-neon animate-pulse" />
            </div>
          </div>
          <p className="font-mono text-xs text-mist/60 mt-2 text-right">
            Only <span className="text-ember">648 tickets</span> remaining
          </p>
        </div>
      </div>
    </section>
  )
}
