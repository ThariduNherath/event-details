'use client'

import { useState } from 'react'
import { Mail, X, Loader2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/lib/api'
import { notify } from '@/lib/toast'

export default function VerifyBanner() {
  const { user } = useAuth()
  const [dismissed, setDismissed] = useState(false)
  const [sending, setSending] = useState(false)

  if (!user || user.authProvider !== 'local' || user.emailVerified || dismissed) {
    return null
  }

  const handleResend = async () => {
    setSending(true)
    try {
      await api.resendVerification(user.email)
      notify.success('Verification email sent — check your inbox')
    } catch (err: any) {
      notify.error(err.message || 'Could not resend email')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-[90] bg-ember/90 backdrop-blur-sm px-6 py-2.5 flex items-center justify-center gap-3 flex-wrap">
      <div className="flex items-center gap-2 font-body text-xs text-white">
        <Mail className="w-3.5 h-3.5" />
        Please verify your email to unlock all features
      </div>
      <button
        onClick={handleResend}
        disabled={sending}
        className="flex items-center gap-1.5 font-mono text-[10px] tracking-widest text-white underline hover:no-underline disabled:opacity-60"
      >
        {sending && <Loader2 className="w-3 h-3 animate-spin" />}
        RESEND EMAIL
      </button>
      <button onClick={() => setDismissed(true)} className="text-white/70 hover:text-white">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}