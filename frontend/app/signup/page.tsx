'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Zap, Loader2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import GoogleButton from '@/components/ui/GoogleButton'
import { notify } from '@/lib/toast'

export default function SignupPage() {
  const router = useRouter()
  const { signup, loginWithGoogle } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signup(name, email, password)
      notify.success('Account created — welcome to NEXUS!')
      router.push('/cart')
    } catch (err: any) {
      setError(err.message || 'Could not create account')
      notify.error(err.message || 'Could not create account')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async (credential: string) => {
    setError('')
    try {
      await loginWithGoogle(credential)
      router.push('/cart')
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed')
      notify.error(err.message || 'Google sign-in failed')
    }
  }

  return (
    <main className="relative min-h-screen bg-void flex items-center justify-center px-6 py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-ember/10 via-transparent to-transparent pointer-events-none" />

      <div className="relative w-full max-w-md glass border border-white/10 rounded-2xl p-8">
        <Link href="/" className="flex items-center justify-center gap-2 mb-8 group">
          <div className="relative">
            <Zap className="w-6 h-6 text-ember group-hover:text-neon transition-colors" fill="currentColor" />
            <div className="absolute inset-0 blur-md bg-ember/50" />
          </div>
          <span className="font-display text-2xl tracking-wider text-white">NEXUS</span>
        </Link>

        <h1 className="font-display text-2xl text-white text-center mb-1">Create your account</h1>
        <p className="font-body text-sm text-mist text-center mb-8">Join NEXUS 2025 in seconds</p>

        <div className="mb-6">
          <GoogleButton onCredential={handleGoogle} onError={(msg) => { setError(msg); notify.error(msg) }} />
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="h-px flex-1 bg-white/10" />
          <span className="font-mono text-[10px] text-mist/50 tracking-widest">OR</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="font-mono text-xs text-mist/70 tracking-wide">FULL NAME</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full bg-ash/60 border border-white/10 rounded px-4 py-3 text-white font-body text-sm focus:outline-none focus:border-ember/60 transition-colors"
              placeholder="Jane Doe"
            />
          </div>

          <div>
            <label className="font-mono text-xs text-mist/70 tracking-wide">EMAIL</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full bg-ash/60 border border-white/10 rounded px-4 py-3 text-white font-body text-sm focus:outline-none focus:border-ember/60 transition-colors"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="font-mono text-xs text-mist/70 tracking-wide">PASSWORD</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full bg-ash/60 border border-white/10 rounded px-4 py-3 text-white font-body text-sm focus:outline-none focus:border-ember/60 transition-colors"
              placeholder="At least 6 characters"
            />
          </div>

          {error && <p className="font-body text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex items-center justify-center gap-2 px-5 py-3 font-display text-sm tracking-wide bg-ember hover:bg-ember/90 disabled:opacity-60 text-white rounded transition-all glow-ember"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            CREATE ACCOUNT
          </button>
        </form>

        <p className="font-body text-sm text-mist text-center mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-ember hover:text-neon transition-colors">
            Log in
          </Link>
        </p>
      </div>
    </main>
  )
}