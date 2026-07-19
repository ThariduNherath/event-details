'use client'
import { useState, useEffect } from 'react'
import { Clock, Mic, Users, Zap, Coffee, Globe, Loader2, Download } from 'lucide-react'
import { useReveal } from '@/lib/useReveal'
import { api } from '@/lib/api'
import jsPDF from 'jspdf'
import { ScheduleRowSkeleton } from '@/components/ui/Skeleton'

interface ScheduleEvent {
  _id: string
  time: string
  title: string
  type: string
  speaker: string
  duration: string
  tag: string
  color: string
  order: number
}

interface ScheduleDay {
  _id: string
  dayNumber: number
  theme: string
  events: ScheduleEvent[]
}

type DayWithDate = ScheduleDay & { day: string; date: string }

// Must match the key used in CountdownSection.tsx so both sections stay in sync
const STORAGE_KEY = 'nexus-countdown-target'
const CYCLE_MS = 30 * 24 * 60 * 60 * 1000

function getEventStartDate(): Date {
  if (typeof window === 'undefined') return new Date()
  const saved = localStorage.getItem(STORAGE_KEY)
  let target = saved ? parseInt(saved, 10) : NaN
  if (!target || isNaN(target)) {
    target = Date.now() + CYCLE_MS
  }
  while (target <= Date.now()) {
    target += CYCLE_MS
  }
  return new Date(target)
}

const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

const typeIcon = (type: string) => {
  switch (type) {
    case 'keynote': return <Mic className="w-3 h-3" />
    case 'panel': return <Users className="w-3 h-3" />
    case 'break': return <Coffee className="w-3 h-3" />
    case 'workshop': return <Zap className="w-3 h-3" />
    default: return <Globe className="w-3 h-3" />
  }
}

const tagColor = (color: string) => {
  const map: Record<string, string> = {
    ember: 'text-ember border-ember/30 bg-ember/10',
    neon: 'text-neon border-neon/30 bg-neon/10',
    plasma: 'text-plasma border-plasma/30 bg-plasma/10',
    gold: 'text-gold border-gold/30 bg-gold/10',
    mist: 'text-mist border-mist/30 bg-mist/10',
  }
  return map[color] || map.mist
}

// ---------- PDF GENERATION — single day only ----------
function generateDayPdf(d: DayWithDate) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const marginX = 48
  let y = 0

  const emberRGB: [number, number, number] = [255, 69, 0]
  const darkRGB: [number, number, number] = [10, 10, 15]
  const mistRGB: [number, number, number] = [130, 140, 160]

  // Header band
  doc.setFillColor(...darkRGB)
  doc.rect(0, 0, pageWidth, 90, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.text('NEXUS 2025', marginX, 38)
  doc.setFontSize(11)
  doc.setTextColor(...emberRGB)
  doc.text(`${d.day.toUpperCase()} — ${d.theme}`, marginX, 58)
  doc.setTextColor(200, 200, 200)
  doc.setFontSize(9)
  doc.text(d.date || '', marginX, 74)

  y = 120
  doc.setFont('helvetica', 'normal')

  d.events.forEach((event) => {
    if (y > pageHeight - 80) {
      doc.addPage()
      y = 48
    }

    // Time
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(...emberRGB)
    doc.text(event.time, marginX, y)

    // Tag
    doc.setFontSize(8)
    doc.setTextColor(...mistRGB)
    doc.text(`[${event.tag}]  ${event.duration}`, marginX + 60, y)

    // Title
    y += 16
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.setTextColor(20, 20, 25)
    doc.text(event.title, marginX, y)

    // Speaker
    if (event.speaker) {
      y += 14
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(...mistRGB)
      doc.text(event.speaker, marginX, y)
    }

    // Divider
    y += 12
    doc.setDrawColor(230, 230, 230)
    doc.line(marginX, y, pageWidth - marginX, y)
    y += 18
  })

  // File name reflects the specific day, e.g. NEXUS-2025-Day-1-Schedule.pdf
  doc.save(`NEXUS-2025-${d.day.replace(' ', '-')}-Schedule.pdf`)
}

export default function ScheduleSection() {
  const [activeDay, setActiveDay] = useState(0)
  const [hoveredEvent, setHoveredEvent] = useState<number | null>(null)
  const [days, setDays] = useState<DayWithDate[]>([])
  const [loading, setLoading] = useState(true)
  const ref = useReveal()

  useEffect(() => {
    api
      .getSchedule()
      .then((data) => {
        const start = getEventStartDate()
        const withDates = (data.days as ScheduleDay[]).map((d, i) => {
          const eventDate = new Date(start)
          eventDate.setDate(start.getDate() + i)
          return { ...d, day: `Day ${d.dayNumber}`, date: fmt(eventDate) }
        })
        setDays(withDates)
      })
      .catch(() => setDays([]))
      .finally(() => setLoading(false))
  }, [])

  const handleDownloadPdf = () => {
    const current = days[activeDay]
    if (!current) return
    generateDayPdf(current)
  }

  return (
    <section id="schedule" className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-void via-ash/20 to-void" />

      <div ref={ref} className="reveal relative z-10 max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="h-px w-12 bg-neon/50" />
            <span className="font-mono text-xs text-neon tracking-widest">3-DAY PROGRAM</span>
            <div className="h-px w-12 bg-neon/50" />
          </div>
          <h2 className="font-display text-5xl md:text-7xl text-white tracking-wide">
            EVENT <span className="text-neon">SCHEDULE</span>
          </h2>
        </div>

        {loading ? (
          <div className="space-y-3 max-w-4xl mx-auto">
            {[...Array(6)].map((_, i) => <ScheduleRowSkeleton key={i} />)}
          </div>
        ) : days.length === 0 ? (
          <p className="text-center font-body text-sm text-mist/60 py-20">Schedule will be announced soon.</p>
        ) : (
          <>
            {/* Tab navigation */}
            <div className="flex gap-2 md:gap-4 mb-12 flex-wrap justify-center">
              {days.map((d, i) => (
                <button
                  key={d._id}
                  onClick={() => setActiveDay(i)}
                  className={`relative px-6 py-3 rounded-xl font-body text-sm transition-all duration-300 group overflow-hidden ${
                    activeDay === i
                      ? 'bg-ember text-white glow-ember scale-105'
                      : 'glass text-mist hover:text-white border border-white/10 hover:border-ember/30'
                  }`}
                >
                  <span className="relative z-10">
                    <span className="font-display text-base tracking-wide">{d.day}</span>
                    <span className="block font-mono text-[10px] tracking-widest opacity-70">
                      {d.date || '—'} · {d.theme}
                    </span>
                  </span>
                  {activeDay !== i && (
                    <div className="absolute inset-0 bg-ember/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </button>
              ))}
            </div>

            {/* Timeline */}
            <div className="relative">
              <div className="absolute left-[88px] md:left-24 top-0 bottom-0 w-px bg-gradient-to-b from-ember/0 via-ember/30 to-ember/0 hidden sm:block" />

              <div className="space-y-3">
                {days[activeDay]?.events.map((event, i) => (
                  <div
                    key={event._id}
                    className={`relative flex gap-4 md:gap-6 items-start group transition-all duration-300 ${
                      hoveredEvent === i ? 'scale-[1.01]' : ''
                    }`}
                    onMouseEnter={() => setHoveredEvent(i)}
                    onMouseLeave={() => setHoveredEvent(null)}
                  >
                    <div className="w-16 md:w-20 flex-shrink-0 pt-3">
                      <span className="font-mono text-xs text-mist">{event.time}</span>
                    </div>

                    <div className="hidden sm:flex flex-shrink-0 w-8 items-start justify-center pt-4">
                      <div className={`w-2 h-2 rounded-full border transition-all duration-300 ${
                        event.type === 'break' ? 'border-mist/40 bg-mist/20' :
                        hoveredEvent === i ? 'border-ember bg-ember glow-ember scale-150' :
                        'border-ember/60 bg-ember/20'
                      }`} />
                    </div>

                    <div className={`flex-1 glass rounded-xl p-4 border transition-all duration-300 ${
                      event.type === 'break'
                        ? 'border-white/5 opacity-60'
                        : hoveredEvent === i
                        ? 'border-ember/40 glow-ember'
                        : 'border-white/8 hover:border-white/20'
                    }`}>
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className={`inline-flex items-center gap-1 font-mono text-[10px] tracking-widest border rounded-full px-2 py-0.5 ${tagColor(event.color)}`}>
                              {typeIcon(event.type)}
                              {event.tag}
                            </span>
                            <span className="font-mono text-[10px] text-mist/50">{event.duration}</span>
                          </div>
                          <h3 className={`font-body font-medium text-base leading-tight ${
                            event.type === 'break' ? 'text-mist' : 'text-white'
                          }`}>
                            {event.title}
                          </h3>
                          {event.speaker && (
                            <p className="font-mono text-xs text-mist mt-1">{event.speaker}</p>
                          )}
                        </div>
                        {event.type !== 'break' && (
                          <Clock className="w-4 h-4 text-mist/40 flex-shrink-0 mt-1" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Download CTA — downloads only the currently selected day */}
            <div className="text-center mt-12">
              <button
                onClick={handleDownloadPdf}
                className="inline-flex items-center gap-2 glass border border-white/10 hover:border-neon/30 px-6 py-3 rounded-xl font-mono text-sm text-mist hover:text-neon transition-all duration-300"
              >
                <Download className="w-4 h-4" />
                DOWNLOAD {days[activeDay]?.day.toUpperCase()} SCHEDULE PDF
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  )
}