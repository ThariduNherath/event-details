'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, CheckCircle2, XCircle, Zap } from 'lucide-react'
import { api } from '@/lib/api'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setError('No verification token provided')
      return
    }

    api
      .verifyEmail(token)
      .then(() => setStatus('success'))
      .catch((err) => {
        setStatus('error')
        setError(err.message || 'Verification failed')
      })
  }, [token])

  return (
    <div className="relative w-full max-w-md glass border border-white/10 rounded-2xl p-8 text-center">
      <Link href="/" className="flex items-center justify-center gap-2 mb-8 group">
        <div className="relative">
          <Zap className="w-6 h-6 text-ember group-hover:text-neon transition-colors" fill="currentColor" />
          <div className="absolute inset-0 blur-md bg-ember/50" />
        </div>
        <span className="font-display text-2xl tracking-wider text-white">NEXUS</span>
      </Link>

      {status === 'verifying' && (
        <>
          <Loader2 className="w-10 h-10 text-ember animate-spin mx-auto mb-4" />
          <p className="font-body text-sm text-mist">Verifying your email...</p>
        </>
      )}

      {status === 'success' && (
        <>
          <CheckCircle2 className="w-14 h-14 text-neon mx-auto mb-4" />
          <h1 className="font-display text-2xl text-white mb-2">Email verified!</h1>
          <p className="font-body text-sm text-mist mb-6">Your account is now active. You can log in.</p>
          <button
            onClick={() => router.push('/login')}
            className="w-full px-5 py-3 font-display text-sm tracking-wide bg-ember hover:bg-ember/90 text-white rounded transition-all glow-ember"
          >
            GO TO LOGIN
          </button>
        </>
      )}

      {status === 'error' && (
        <>
          <XCircle className="w-14 h-14 text-red-400 mx-auto mb-4" />
          <h1 className="font-display text-2xl text-white mb-2">Verification failed</h1>
          <p className="font-body text-sm text-mist mb-6">{error}</p>
          <Link
            href="/login"
            className="block w-full px-5 py-3 font-display text-sm tracking-wide bg-ash/60 border border-white/10 hover:border-white/30 text-white rounded transition-all"
          >
            BACK TO LOGIN
          </Link>
        </>
      )}
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <main className="relative min-h-screen bg-void flex items-center justify-center px-6 py-24">
      <div className="absolute inset-0 bg-gradient-to-b from-ember/10 via-transparent to-transparent pointer-events-none" />

      <Suspense
        fallback={
          <div className="relative w-full max-w-md glass border border-white/10 rounded-2xl p-8 text-center">
            <Loader2 className="w-10 h-10 text-ember animate-spin mx-auto mb-4" />
            <p className="font-body text-sm text-mist">Loading verification...</p>
          </div>
        }
      >
        <VerifyEmailContent />
      </Suspense>
    </main>
  )
}