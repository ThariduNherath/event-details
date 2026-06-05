'use client'
import { useState } from 'react'
import { Check, Zap, Crown, Star, Shield, ChevronRight } from 'lucide-react'
import { useReveal } from '@/lib/useReveal'

const tiers = [
  {
    id: 'explorer',
    name: 'EXPLORER',
    price: 299,
    originalPrice: 499,
    badge: 'BEST VALUE',
    color: 'neon',
    icon: Zap,
    available: 412,
    total: 1000,
    features: [
      'General admission (all 3 days)',
      'Digital access to all talks',
      'Networking app access',
      'Expo hall access',
      'NEXUS swag bag',
      'Coffee & refreshments',
    ],
    notIncluded: ['VIP lounge', 'Speaker dinners', 'Priority seating'],
  },
  {
    id: 'architect',
    name: 'ARCHITECT',
    price: 799,
    originalPrice: 1200,
    badge: 'MOST POPULAR',
    color: 'ember',
    icon: Star,
    available: 156,
    total: 300,
    featured: true,
    features: [
      'Everything in Explorer',
      'VIP lounge access',
      'Front-row seating priority',
      'Workshop access (all)',
      'Speaker networking sessions',
      'Premium meals included',
      'Recording access (6 months)',
    ],
    notIncluded: ['Speaker dinners'],
  },
  {
    id: 'visionary',
    name: 'VISIONARY',
    price: 2499,
    originalPrice: 3500,
    badge: 'ELITE',
    color: 'gold',
    icon: Crown,
    available: 24,
    total: 50,
    features: [
      'Everything in Architect',
      'Private speaker dinners',
      'VIP backstage access',
      'Personal concierge',
      '1-on-1 mentor sessions (2)',
      'Lifetime recording access',
      'NEXUS Founders Club',
      'Next year discount (25%)',
    ],
    notIncluded: [],
  },
]

const colorMap: Record<string, { btn: string, border: string, text: string, bg: string }> = {
  neon: { btn: 'bg-neon/90 hover:bg-neon text-void', border: 'border-neon/30 hover:border-neon/60', text: 'text-neon', bg: 'bg-neon/5' },
  ember: { btn: 'bg-ember hover:bg-ember/90 text-white glow-ember', border: 'border-ember/40 hover:border-ember', text: 'text-ember', bg: 'bg-ember/5' },
  gold: { btn: 'bg-gold/90 hover:bg-gold text-void', border: 'border-gold/30 hover:border-gold/60', text: 'text-gold', bg: 'bg-gold/5' },
}

export default function TicketSection() {
  const [selected, setSelected] = useState<string | null>(null)
  const [qty, setQty] = useState<Record<string, number>>({ explorer: 1, architect: 1, visionary: 1 })
  const ref = useReveal()

  const handleBuy = (tierId: string) => {
    setSelected(tierId)
    setTimeout(() => setSelected(null), 2000)
  }

  return (
    <section id="tickets" className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-void via-ember/3 to-void" />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-ember/4 blur-[120px]" />

      <div ref={ref} className="reveal relative z-10 max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="h-px w-12 bg-ember/50" />
            <span className="font-mono text-xs text-ember tracking-widest">EARLY BIRD PRICING</span>
            <div className="h-px w-12 bg-ember/50" />
          </div>
          <h2 className="font-display text-5xl md:text-7xl text-white tracking-wide mb-4">
            GET YOUR <span className="text-ember">TICKET</span>
          </h2>
          <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full mt-2">
            <Shield className="w-4 h-4 text-neon" />
            <span className="font-mono text-xs text-mist">30-day money-back guarantee</span>
          </div>
        </div>

        {/* Ticket cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tiers.map((tier) => {
            const c = colorMap[tier.color]
            const soldPct = ((tier.total - tier.available) / tier.total) * 100
            const Icon = tier.icon
            const isSelected = selected === tier.id

            return (
              <div
                key={tier.id}
                className={`relative rounded-2xl transition-all duration-500 ${
                  tier.featured ? 'scale-[1.03] z-10' : ''
                }`}
              >
                {/* Featured border */}
                {tier.featured && (
                  <div className="absolute inset-0 rounded-2xl border-animated" />
                )}

                {/* Badge */}
                <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full font-mono text-[10px] tracking-widest ${c.text} ${c.bg} border ${c.border} whitespace-nowrap`}>
                  {tier.badge}
                </div>

                <div className={`glass border rounded-2xl p-6 h-full flex flex-col transition-colors duration-300 ${c.border} ${tier.featured ? 'border-opacity-60' : ''}`}>
                  {/* Top */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-10 h-10 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 ${c.text}`} />
                      </div>
                      <span className={`font-mono text-xs tracking-widest ${c.text}`}>{tier.name}</span>
                    </div>

                    <div className="flex items-end gap-2">
                      <span className={`font-display text-5xl ${c.text} tracking-wide`}>${tier.price}</span>
                      <div className="pb-1">
                        <span className="font-mono text-xs text-mist/50 line-through block">${tier.originalPrice}</span>
                        <span className="font-mono text-xs text-neon">SAVE ${tier.originalPrice - tier.price}</span>
                      </div>
                    </div>
                    <p className="font-mono text-xs text-mist mt-1">per person · all 3 days</p>

                    {/* Availability bar */}
                    <div className="mt-4">
                      <div className="flex justify-between font-mono text-[10px] text-mist mb-1">
                        <span>{tier.available} remaining</span>
                        <span className={c.text}>{Math.round(soldPct)}% sold</span>
                      </div>
                      <div className="h-1.5 bg-ash rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-1000"
                          style={{
                            width: `${soldPct}%`,
                            background: `var(--${tier.color === 'ember' ? 'ember' : tier.color === 'neon' ? 'neon' : 'gold'})`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="flex-1 mb-6">
                    <ul className="space-y-2.5">
                      {tier.features.map((feat, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className={`w-4 h-4 ${c.text} flex-shrink-0 mt-0.5`} />
                          <span className="font-body text-sm text-mist">{feat}</span>
                        </li>
                      ))}
                      {tier.notIncluded.map((feat, i) => (
                        <li key={i} className="flex items-start gap-2 opacity-40">
                          <span className="w-4 h-4 flex items-center justify-center font-mono text-xs text-mist flex-shrink-0 mt-0.5">✕</span>
                          <span className="font-body text-sm text-mist line-through">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Quantity + CTA */}
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="font-mono text-xs text-mist">QTY:</span>
                      <div className="flex items-center gap-2 glass rounded-lg px-3 py-1 border border-white/10">
                        <button
                          onClick={() => setQty(q => ({ ...q, [tier.id]: Math.max(1, q[tier.id] - 1) }))}
                          className="font-mono text-white w-5 h-5 flex items-center justify-center hover:text-ember transition-colors"
                        >−</button>
                        <span className="font-mono text-sm w-4 text-center">{qty[tier.id]}</span>
                        <button
                          onClick={() => setQty(q => ({ ...q, [tier.id]: Math.min(10, q[tier.id] + 1) }))}
                          className="font-mono text-white w-5 h-5 flex items-center justify-center hover:text-neon transition-colors"
                        >+</button>
                      </div>
                      <span className={`font-mono text-sm ml-auto ${c.text}`}>
                        ${(tier.price * qty[tier.id]).toLocaleString()}
                      </span>
                    </div>

                    <button
                      onClick={() => handleBuy(tier.id)}
                      className={`w-full py-3.5 rounded-xl font-display tracking-wide text-sm transition-all duration-300 flex items-center justify-center gap-2 ${c.btn}`}
                    >
                      {isSelected ? (
                        <>
                          <Check className="w-4 h-4" />
                          ADDED TO CART!
                        </>
                      ) : (
                        <>
                          BUY {tier.name}
                          <ChevronRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap justify-center gap-8 mt-12">
          {['SSL Secured', 'Instant Delivery', 'Full Refund Policy', 'Group Discounts'].map((item, i) => (
            <div key={i} className="flex items-center gap-2 font-mono text-xs text-mist/60">
              <Shield className="w-3.5 h-3.5 text-neon/60" />
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
