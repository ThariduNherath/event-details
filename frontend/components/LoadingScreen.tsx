'use client'
import { useEffect, useRef, useState } from 'react'

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0)
  const [exiting, setExiting] = useState(false)
  const [hidden, setHidden] = useState(false)
  const startRef = useRef<number | null>(null)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const DURATION = 1400 // ms — minimum time the screen is shown

    const tick = (t: number) => {
      if (startRef.current === null) startRef.current = t
      const elapsed = t - startRef.current
      const pct = Math.min(100, Math.round((elapsed / DURATION) * 100))
      setProgress(pct)

      if (elapsed < DURATION) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        setExiting(true)
        setTimeout(() => {
          setHidden(true)
          window.dispatchEvent(new Event('app-loaded'))
        }, 700) // matches exit transition duration
      }
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  if (hidden) return null

  const radius = 46
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (progress / 100) * circumference

  return (
    <div
      className={`fixed inset-0 z-[999] flex items-center justify-center bg-void transition-all duration-700 ease-in-out ${
        exiting ? 'opacity-0' : 'opacity-100'
      }`}
      style={{
        clipPath: exiting ? 'circle(0% at 50% 50%)' : 'circle(150% at 50% 50%)',
      }}
    >
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-ember/10 blur-[100px]" />

      <div className="relative flex flex-col items-center gap-6">
        {/* Progress ring + logo */}
        <div className="relative w-28 h-28 flex items-center justify-center">
          <svg className="absolute inset-0 -rotate-90 w-full h-full">
            <circle
              cx="56"
              cy="56"
              r={radius}
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="2"
            />
            <circle
              cx="56"
              cy="56"
              r={radius}
              fill="none"
              stroke="#FF4500"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              style={{
                transition: 'stroke-dashoffset 0.1s linear',
                filter: 'drop-shadow(0 0 6px rgba(255,69,0,0.6))',
              }}
            />
          </svg>

          <div className="relative">
            <svg
              viewBox="0 0 24 24"
              className="w-9 h-9 text-ember animate-pulse"
              fill="currentColor"
            >
              <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />
            </svg>
            <div className="absolute inset-0 blur-md bg-ember/50 animate-pulse" />
          </div>
        </div>

        {/* Wordmark */}
        <div className="flex items-center gap-2">
          <span className="font-display text-2xl tracking-wider text-white">NEXUS</span>
          <span className="font-mono text-xs text-ember border border-ember/40 px-1.5 py-0.5 rounded">
            2025
          </span>
        </div>

        {/* Progress readout */}
        <div className="flex flex-col items-center gap-2 mt-1">
          <span className="font-mono text-xs text-mist tracking-widest">
            LOADING {String(progress).padStart(3, '0')}%
          </span>
          <div className="w-40 h-0.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-ember via-plasma to-neon rounded-full"
              style={{ width: `${progress}%`, transition: 'width 0.1s linear' }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}