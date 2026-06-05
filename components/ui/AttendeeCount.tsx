'use client'
import { useEffect, useState } from 'react'
import { Users, TrendingUp } from 'lucide-react'

export default function AttendeeCount() {
  const [count, setCount] = useState(9847)
  const [delta, setDelta] = useState(0)
  const [show, setShow] = useState(false)

  useEffect(() => {
    setShow(true)
    const interval = setInterval(() => {
      const change = Math.floor(Math.random() * 3) + 1
      setCount(prev => prev + change)
      setDelta(change)
      setTimeout(() => setDelta(0), 1500)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className={`relative bg-ash/80 border-b border-white/5 transition-all duration-1000 ${show ? 'opacity-100' : 'opacity-0'}`}>
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Users className="w-4 h-4 text-neon" />
              <div className="absolute inset-0 blur-sm bg-neon/50" />
            </div>
            <span className="font-mono text-xs text-mist">LIVE ATTENDEES</span>
            <span className="font-display text-lg text-white tracking-wide">
              {count.toLocaleString()}
            </span>
            {delta > 0 && (
              <span className="flex items-center gap-0.5 font-mono text-xs text-neon animate-flip-in">
                <TrendingUp className="w-3 h-3" />
                +{delta}
              </span>
            )}
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-ember animate-pulse" />
            <span className="font-mono text-xs text-mist">
              <span className="text-ember font-medium">3,241</span> watching now
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <Stat label="SPEAKERS" value="50+" color="text-plasma" />
          <Stat label="COUNTRIES" value="78" color="text-gold" />
          <Stat label="HOURS" value="72" color="text-ember" />
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="text-center">
      <div className={`font-display text-base ${color} tracking-wide`}>{value}</div>
      <div className="font-mono text-[10px] text-mist/60 tracking-widest">{label}</div>
    </div>
  )
}
