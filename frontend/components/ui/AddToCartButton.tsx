'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/lib/api'

interface AddToCartButtonProps {
  tier: 'Explorer' | 'Architect' | 'Visionary'
  quantity?: number
  className?: string
  children?: React.ReactNode
}

export default function AddToCartButton({ tier, quantity = 1, className, children }: AddToCartButtonProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  const handleClick = async () => {
    if (loading) return

    if (!user) {
      router.push('/login')
      return
    }

    setBusy(true)
    try {
      await api.addToCart(tier, quantity)
      router.push('/cart')
    } catch (err) {
      console.error(err)
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={busy}
      className={
        className ||
        'w-full flex items-center justify-center gap-2 px-5 py-3 font-display text-sm tracking-wide bg-ember hover:bg-ember/90 disabled:opacity-60 text-white rounded transition-all glow-ember'
      }
    >
      {busy && <Loader2 className="w-4 h-4 animate-spin" />}
      {children || `BOOK ${tier.toUpperCase()}`}
    </button>
  )
}