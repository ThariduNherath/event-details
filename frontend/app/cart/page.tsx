'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Loader2, CheckCircle2, Minus, Plus } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'
import { api } from '@/lib/api'
import { notify } from '@/lib/toast'
import { CartItemSkeleton } from '@/components/ui/Skeleton'

interface CartItem {
  _id: string
  tier: string
  quantity: number
  unitPrice: number
}

export default function CartPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { refreshCart } = useCart()

  const [items, setItems] = useState<CartItem[]>([])
  const [total, setTotal] = useState(0)
  const [loadingCart, setLoadingCart] = useState(true)

  const [showPayment, setShowPayment] = useState(false)
  const [cardName, setCardName] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const [paying, setPaying] = useState(false)
  const [receipt, setReceipt] = useState<any>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [authLoading, user, router])

  const loadCart = async () => {
    try {
      const data = await api.getCart()
      setItems(data.items)
      setTotal(data.total)
    } catch (err: any) {
      notify.error(err.message || 'Could not load your cart')
    } finally {
      setLoadingCart(false)
    }
  }

  useEffect(() => {
    if (user) loadCart()
  }, [user])

  const changeQty = async (id: string, quantity: number) => {
    if (quantity < 1) return
    await api.updateCartItem(id, quantity)
    loadCart()
    refreshCart()
  }

  const removeItem = async (id: string) => {
    await api.removeFromCart(id)
    notify.info('Item removed from cart')
    loadCart()
    refreshCart()
  }

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault()
    setPaying(true)
    try {
      const data = await api.checkout(cardName, cardNumber, expiry, cvv)
      setReceipt(data)
      notify.success('Payment confirmed — tickets booked!')
      refreshCart()
    } catch (err: any) {
      notify.error(err.message || 'Payment could not be processed')
    } finally {
      setPaying(false)
    }
  }

  if (authLoading || loadingCart) {
    return (
      <main className="min-h-screen bg-void px-6 py-24">
        <div className="max-w-2xl mx-auto">
          <div className="h-9 w-40 bg-white/10 rounded animate-pulse mb-1" />
          <div className="h-4 w-56 bg-white/10 rounded animate-pulse mb-8" />
          <div className="flex flex-col gap-4">
            {[...Array(2)].map((_, i) => <CartItemSkeleton key={i} />)}
          </div>
        </div>
      </main>
    )
  }

  if (receipt) {
    return (
      <main className="min-h-screen bg-void flex items-center justify-center px-6 py-24">
        <div className="max-w-md w-full glass border border-white/10 rounded-2xl p-8 text-center">
          <CheckCircle2 className="w-14 h-14 text-neon mx-auto mb-4" />
          <h1 className="font-display text-2xl text-white mb-2">Payment confirmed</h1>
          <p className="font-body text-sm text-mist mb-6">Your tickets are booked. See you at NEXUS 2025.</p>
          <div className="bg-ash/60 border border-white/10 rounded-lg p-4 text-left font-mono text-xs text-mist space-y-1 mb-6">
            <p>REF: <span className="text-neon">{receipt.paymentRef}</span></p>
            <p>TOTAL: <span className="text-white">${receipt.total}</span></p>
            {receipt.items.map((i: any, idx: number) => (
              <p key={idx}>{i.quantity}× {i.tier} — ${i.unitPrice * i.quantity}</p>
            ))}
          </div>
          <button
            onClick={() => router.push('/')}
            className="w-full px-5 py-3 font-display text-sm tracking-wide bg-ember hover:bg-ember/90 text-white rounded transition-all glow-ember"
          >
            BACK TO HOME
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-void px-6 py-24">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-display text-3xl text-white mb-1">Your cart</h1>
        <p className="font-body text-sm text-mist mb-8">Review your tickets before checkout</p>

        {items.length === 0 ? (
          <div className="glass border border-white/10 rounded-xl p-10 text-center">
            <p className="font-body text-mist mb-4">Your cart is empty</p>
            <button
              onClick={() => router.push('/#tickets')}
              className="px-5 py-2.5 font-display text-sm tracking-wide bg-ember hover:bg-ember/90 text-white rounded transition-all"
            >
              BROWSE TICKETS
            </button>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-4 mb-8">
              {items.map((item) => (
                <div
                  key={item._id}
                  className="glass border border-white/10 rounded-xl p-5 flex items-center justify-between gap-4"
                >
                  <div>
                    <p className="font-display text-lg text-white">{item.tier}</p>
                    <p className="font-mono text-xs text-mist">${item.unitPrice} each</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => changeQty(item._id, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center rounded bg-ash/60 border border-white/10 text-white hover:border-ember/60 transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-mono text-sm text-white w-4 text-center">{item.quantity}</span>
                    <button
                      onClick={() => changeQty(item._id, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center rounded bg-ash/60 border border-white/10 text-white hover:border-ember/60 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="font-display text-lg text-ember w-16 text-right">
                    ${item.unitPrice * item.quantity}
                  </p>

                  <button
                    onClick={() => removeItem(item._id)}
                    className="text-mist hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between mb-8 px-1">
              <span className="font-mono text-sm text-mist tracking-wide">TOTAL</span>
              <span className="font-display text-2xl text-white">${total}</span>
            </div>

            {!showPayment ? (
              <button
                onClick={() => setShowPayment(true)}
                className="w-full px-5 py-3.5 font-display text-sm tracking-wide bg-ember hover:bg-ember/90 text-white rounded transition-all glow-ember"
              >
                PROCEED TO PAYMENT
              </button>
            ) : (
              <form onSubmit={handlePay} className="glass border border-white/10 rounded-xl p-6 flex flex-col gap-4">
                <p className="font-mono text-xs text-mist/60 tracking-widest mb-1">PAYMENT DETAILS</p>
                <div>
                  <label className="font-mono text-xs text-mist/70">CARDHOLDER NAME</label>
                  <input
                    required
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="mt-1 w-full bg-ash/60 border border-white/10 rounded px-4 py-3 text-white font-body text-sm focus:outline-none focus:border-ember/60"
                    placeholder="Jane Doe"
                  />
                </div>
                <div>
                  <label className="font-mono text-xs text-mist/70">CARD NUMBER</label>
                  <input
                    required
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="mt-1 w-full bg-ash/60 border border-white/10 rounded px-4 py-3 text-white font-body text-sm focus:outline-none focus:border-ember/60"
                    placeholder="4242 4242 4242 4242"
                  />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="font-mono text-xs text-mist/70">EXPIRY</label>
                    <input
                      required
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      className="mt-1 w-full bg-ash/60 border border-white/10 rounded px-4 py-3 text-white font-body text-sm focus:outline-none focus:border-ember/60"
                      placeholder="MM/YY"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="font-mono text-xs text-mist/70">CVV</label>
                    <input
                      required
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      className="mt-1 w-full bg-ash/60 border border-white/10 rounded px-4 py-3 text-white font-body text-sm focus:outline-none focus:border-ember/60"
                      placeholder="123"
                    />
                  </div>
                </div>

                <p className="font-mono text-[10px] text-mist/40">
                  This is a demo checkout — no real card is charged. Plug in Stripe for production.
                </p>

                <button
                  type="submit"
                  disabled={paying}
                  className="flex items-center justify-center gap-2 px-5 py-3.5 font-display text-sm tracking-wide bg-ember hover:bg-ember/90 disabled:opacity-60 text-white rounded transition-all glow-ember"
                >
                  {paying && <Loader2 className="w-4 h-4 animate-spin" />}
                  PAY ${total}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </main>
  )
}