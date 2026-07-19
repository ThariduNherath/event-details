'use client'
import { useEffect, useState, useRef } from 'react'
import { useReveal } from '@/lib/useReveal'
import { api } from '@/lib/api'

interface TimeUnit {
  value: number
  label: string
  prev: number
}

interface Availability {
  tier: string
  capacity: number | null
  sold: number
  available: number | null
  soldOut: boolean
}

// Design placeholder totals — used as fallback for tiers the admin hasn't capped yet
const DEFAULT_TOTALS: Record<string, number> = {
  Explorer: 1000,
  Architect: 300,
  Visionary: 50,
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
        <div className="absolute inset-0 bg-ember/20 blur-xl rounded-2xl" />
        <div className="relative w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 glass border border-ember/20 rounded-2xl flex items-center justify-center overflow-hidden group hover:border-ember/50 transition-colors">
          <span
            className={`font-display text-4xl sm:text-5xl md:text-6xl text-white tracking-wide ${
              flipping ? 'flip-in' : ''
            }`}
          >
            {pad(value)}
          </span>
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
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

const CYCLE_DAYS = 30
const CYCLE_MS = CYCLE_DAYS * 24 * 60 * 60 * 1000
const STORAGE_KEY = 'nexus-countdown-target'

// Reads saved target from localStorage, or creates a fresh one 30 days from now.
// If the saved target has already passed, keeps rolling it forward by 30-day
// chunks until it's back in the future — so it survives being closed for a while too.
function getOrCreateTarget(): number {
  if (typeof window === 'undefined') return Date.now() + CYCLE_MS

  const saved = localStorage.getItem(STORAGE_KEY)
  let target = saved ? parseInt(saved, 10) : NaN

  if (!target || isNaN(target)) {
    target = Date.now() + CYCLE_MS
    localStorage.setItem(STORAGE_KEY, String(target))
    return target
  }

  while (target <= Date.now()) {
    target += CYCLE_MS
  }
  localStorage.setItem(STORAGE_KEY, String(target))
  return target
}

export default function CountdownSection() {
  const ref = useReveal()
  const [target, setTarget] = useState<number>(0)
  const [units, setUnits] = useState({ days: 0, hours: 0, mins: 0, secs: 0 })
  const prevRef = useRef({ days: 0, hours: 0, mins: 0, secs: 0 })

  // Real-time ticket availability
  const [availability, setAvailability] = useState<Availability[]>([])

  useEffect(() => {
    const loadAvailability = () => {
      api
        .getAvailability()
        .then((data) => setAvailability(data.availability))
        .catch(() => {})
    }
    loadAvailability()
    const poll = setInterval(loadAvailability, 30000) // refresh every 30s
    return () => clearInterval(poll)
  }, [])

  const aggregate = availability.reduce(
    (acc, a) => {
      const total = a.capacity !== null ? a.capacity : DEFAULT_TOTALS[a.tier] ?? 0
      const sold = a.capacity !== null ? a.sold : 0
      return { total: acc.total + total, sold: acc.sold + sold }
    },
    { total: 0, sold: 0 }
  )
  const soldPct = aggregate.total > 0 ? Math.round((aggregate.sold / aggregate.total) * 100) : 0
  const remaining = aggregate.total - aggregate.sold

  // Set the initial/resumed target once mounted (avoids SSR/client mismatch)
  useEffect(() => {
    setTarget(getOrCreateTarget())
  }, [])

  useEffect(() => {
    if (!target) return

    const tick = () => {
      const now = Date.now()
      let diff = target - now

      // Countdown reached zero — roll forward to a brand new 30-day cycle
      if (diff <= 0) {
        const newTarget = now + CYCLE_MS
        localStorage.setItem(STORAGE_KEY, String(newTarget))
        setTarget(newTarget)
        diff = CYCLE_MS
      }

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target])

  const timeUnits = [
    { value: units.days, label: 'Days', prev: prevRef.current.days },
    { value: units.hours, label: 'Hours', prev: prevRef.current.hours },
    { value: units.mins, label: 'Minutes', prev: prevRef.current.mins },
    { value: units.secs, label: 'Seconds', prev: prevRef.current.secs },
  ]

  return (
    <section id="countdown" className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-void via-ash/30 to-void" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-plasma/5 blur-[100px]" />

      <div ref={ref} className="reveal relative z-10 max-w-5xl mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 mb-6">
          <div className="h-px w-12 bg-ember/50" />
          <span className="font-mono text-xs text-ember tracking-widest">EVENT STARTS IN</span>
          <div className="h-px w-12 bg-ember/50" />
        </div>

        <h2 className="font-display text-5xl md:text-7xl text-white tracking-wide mb-16">
          COUNT<span className="text-ember">DOWN</span>
        </h2>

        <div className="flex items-center justify-center gap-4 sm:gap-6 md:gap-8 flex-wrap">
          {timeUnits.map((unit, i) => (
            <div key={unit.label} className="flex items-center gap-4 sm:gap-6 md:gap-8">
              <FlipCard {...unit} />
              {i < timeUnits.length - 1 && <Separator />}
            </div>
          ))}
        </div>

        <div className="mt-16 max-w-2xl mx-auto">
          <div className="flex justify-between font-mono text-xs text-mist mb-2">
            <span>TICKET AVAILABILITY</span>
            <span className="text-neon">{soldPct}% SOLD</span>
          </div>
          <div className="h-2 bg-ash rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-ember via-plasma to-neon rounded-full relative transition-all duration-1000"
              style={{ width: `${soldPct}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-neon glow-neon animate-pulse" />
            </div>
          </div>
          <p className="font-mono text-xs text-mist/60 mt-2 text-right">
            Only <span className="text-ember">{remaining.toLocaleString()} tickets</span> remaining
          </p>
        </div>
      </div>
    </section>
  )
} 