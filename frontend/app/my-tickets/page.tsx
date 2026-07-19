'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Ticket, ArrowLeft, Calendar } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/lib/api'
import { CartItemSkeleton } from '@/components/ui/Skeleton'

interface PaidTicket {
  _id: string
  tier: string
  quantity: number
  unitPrice: number
  paymentRef: string
  updatedAt: string
}

const tierColor: Record<string, { text: string; bg: string; border: string }> = {
  Explorer: { text: 'text-neon', bg: 'bg-neon/5', border: 'border-neon/30' },
  Architect: { text: 'text-ember', bg: 'bg-ember/5', border: 'border-ember/30' },
  Visionary: { text: 'text-gold', bg: 'bg-gold/5', border: 'border-gold/30' },
}

export default function MyTicketsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  const [tickets, setTickets] = useState<PaidTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [authLoading, user, router])

  useEffect(() => {
    if (!user) return
    api
      .getHistory()
      .then((data) => setTickets(data.items))
      .catch((err) => setError(err.message || 'Could not load your tickets'))
      .finally(() => setLoading(false))
  }, [user])

  const totalSpent = tickets.reduce((sum, t) => sum + t.unitPrice * t.quantity, 0)
  const totalTickets = tickets.reduce((sum, t) => sum + t.quantity, 0)

  if (authLoading || !user) {
    return (
      <main className="min-h-screen bg-void flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-ember animate-spin" />
      </main>
    )
  }

  return (
    <main className="relative min-h-screen bg-void px-6 py-24">
      <button
        onClick={() => router.push('/')}
        className="fixed top-6 left-6 z-[150] inline-flex items-center gap-2 px-3 py-2 rounded-lg glass border border-white/10 text-mist hover:text-white hover:border-white/20 transition-colors font-mono text-xs tracking-widest"
      >
        <ArrowLeft className="w-4 h-4" />
        HOME
      </button>

      <div className="max-w-2xl mx-auto">
        <div className="mb-10">
          <h1 className="font-display text-3xl text-white mb-1">My tickets</h1>
          <p className="font-body text-sm text-mist">Everything you've booked for NEXUS 2025</p>
        </div>

        {error && <p className="font-body text-sm text-red-400 mb-6">{error}</p>}

        {loading ? (
          <div className="flex flex-col gap-4">
            {[...Array(2)].map((_, i) => <CartItemSkeleton key={i} />)}
          </div>
        ) : tickets.length === 0 ? (
          <div className="glass border border-white/10 rounded-2xl p-10 text-center">
            <Ticket className="w-10 h-10 text-mist/40 mx-auto mb-4" />
            <p className="font-body text-mist mb-4">You haven't booked any tickets yet</p>
            <button
              onClick={() => router.push('/#tickets')}
              className="px-5 py-2.5 font-display text-sm tracking-wide bg-ember hover:bg-ember/90 text-white rounded transition-all"
            >
              BROWSE TICKETS
            </button>
          </div>
        ) : (
          <>
            {/* Summary */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="glass border border-white/10 rounded-xl p-5">
                <p className="font-mono text-[10px] text-mist/60 tracking-widest mb-1">TOTAL TICKETS</p>
                <p className="font-display text-2xl text-white">{totalTickets}</p>
              </div>
              <div className="glass border border-white/10 rounded-xl p-5">
                <p className="font-mono text-[10px] text-mist/60 tracking-widest mb-1">TOTAL SPENT</p>
                <p className="font-display text-2xl text-neon">${totalSpent.toLocaleString()}</p>
              </div>
            </div>

            {/* Ticket list */}
            <div className="flex flex-col gap-4">
              {tickets.map((t) => {
                const c = tierColor[t.tier] || tierColor.Explorer
                return (
                  <div
                    key={t._id}
                    className={`glass border rounded-xl p-5 flex items-center justify-between gap-4 ${c.border}`}
                  >
                    <div className={`w-12 h-12 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center flex-shrink-0`}>
                      <Ticket className={`w-5 h-5 ${c.text}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className={`font-display text-lg ${c.text}`}>{t.tier}</p>
                      <p className="font-mono text-xs text-mist">{t.quantity} ticket{t.quantity !== 1 ? 's' : ''}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Calendar className="w-3 h-3 text-mist/50" />
                        <p className="font-mono text-[10px] text-mist/50">
                          {new Date(t.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <p className="font-display text-lg text-white">${(t.unitPrice * t.quantity).toLocaleString()}</p>
                      <p className="font-mono text-[10px] text-mist/50">{t.paymentRef}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </main>
  )
}