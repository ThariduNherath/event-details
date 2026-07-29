'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, User as UserIcon, Lock, CheckCircle2, ArrowLeft, AlertTriangle } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/lib/api'
import { notify } from '@/lib/toast'
import Swal from 'sweetalert2'

export default function ProfilePage() {
  const router = useRouter()
  const { user, loading: authLoading, updateUser, deleteAccount } = useAuth()

  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState('')
  const [profileError, setProfileError] = useState('')
  const [profileSuccess, setProfileSuccess] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
    if (user) {
      setName(user.name)
      setAvatar(user.avatar || '')
    }
  }, [user, authLoading, router])

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileError('')
    setProfileSuccess(false)

    if (!name.trim()) {
      setProfileError('Name cannot be empty')
      return
    }

    setSavingProfile(true)
    try {
      const data = await api.updateProfile(name, avatar)
      updateUser(data.user)
      setProfileSuccess(true)
      notify.success('Profile updated')
      setTimeout(() => setProfileSuccess(false), 3000)
    } catch (err: any) {
      setProfileError(err.message || 'Could not update profile')
      notify.error(err.message || 'Could not update profile')
    } finally {
      setSavingProfile(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess(false)

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match')
      return
    }

    setSavingPassword(true)
    try {
      await api.changePassword(currentPassword, newPassword)
      setPasswordSuccess(true)
      notify.success('Password updated')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => setPasswordSuccess(false), 3000)
    } catch (err: any) {
      setPasswordError(err.message || 'Could not update password')
      notify.error(err.message || 'Could not update password')
    } finally {
      setSavingPassword(false)
    }
  }

  const handleDeleteAccount = async () => {
    const isLocal = user?.authProvider === 'local'
    let password = ''

    if (isLocal) {
      const { value, isConfirmed } = await Swal.fire({
        title: 'Delete your account?',
        html: `
          <p style="color:#a0a0a0;font-size:14px;margin-bottom:12px;">
            This permanently deletes your profile, cart, and waitlist entries. This cannot be undone.
          </p>
        `,
        input: 'password',
        inputLabel: 'Enter your password to confirm',
        inputPlaceholder: '••••••••',
        showCancelButton: true,
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Delete my account',
        inputValidator: (val) => {
          if (!val) return 'Password is required'
        },
      })
      if (!isConfirmed) return
      password = value
    } else {
      const { isConfirmed } = await Swal.fire({
        title: 'Delete your account?',
        text: 'This permanently deletes your profile, cart, and waitlist entries. This cannot be undone.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Delete my account',
      })
      if (!isConfirmed) return
    }

    setDeleting(true)
    try {
      await deleteAccount(password)
      Swal.fire('Account deleted', 'Sorry to see you go.', 'success')
      router.push('/')
    } catch (err: any) {
      Swal.fire('Error', err.message || 'Could not delete your account', 'error')
    } finally {
      setDeleting(false)
    }
  }

  if (authLoading || !user) {
    return (
      <main className="min-h-screen bg-void flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-ember animate-spin" />
      </main>
    )
  }

  const isGoogleOnlyNoPassword = user.authProvider === 'google'

  return (
    <main className="relative min-h-screen bg-void px-6 py-24">
      <button
        onClick={() => router.push('/')}
        className="fixed top-6 left-6 z-[150] inline-flex items-center gap-2 px-3 py-2 rounded-lg glass border border-white/10 text-mist hover:text-white hover:border-white/20 transition-colors font-mono text-xs tracking-widest"
      >
        <ArrowLeft className="w-4 h-4" />
        HOME
      </button>

      <div className="max-w-lg mx-auto">
        <div className="mb-10">
          <h1 className="font-display text-3xl text-white mb-1">Your profile</h1>
          <p className="font-body text-sm text-mist">Manage your account details</p>
        </div>

        {/* Profile info */}
        <div className="glass border border-white/10 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-6">
            <UserIcon className="w-4 h-4 text-ember" />
            <h2 className="font-display text-lg text-white">Profile info</h2>
          </div>

          <div className="flex items-center gap-4 mb-6">
            {avatar ? (
              <img src={avatar} alt={name} className="w-16 h-16 rounded-full object-cover border border-white/10" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-ash/60 border border-white/10 flex items-center justify-center">
                <UserIcon className="w-6 h-6 text-mist/50" />
              </div>
            )}
            <div>
              <p className="font-body text-sm text-white">{user.email}</p>
              <p className="font-mono text-[10px] text-mist/60 capitalize">{user.authProvider} account</p>
            </div>
          </div>

          <form onSubmit={handleProfileSubmit} className="flex flex-col gap-4">
            <div>
              <label className="font-mono text-xs text-mist/70 tracking-wide">NAME</label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full bg-ash/60 border border-white/10 rounded px-4 py-3 text-white font-body text-sm focus:outline-none focus:border-ember/60 transition-colors"
              />
            </div>

            <div>
              <label className="font-mono text-xs text-mist/70 tracking-wide">AVATAR IMAGE URL (optional)</label>
              <input
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                className="mt-1 w-full bg-ash/60 border border-white/10 rounded px-4 py-3 text-white font-body text-sm focus:outline-none focus:border-ember/60 transition-colors"
                placeholder="https://..."
              />
            </div>

            {profileError && <p className="font-body text-sm text-red-400">{profileError}</p>}
            {profileSuccess && (
              <p className="flex items-center gap-1.5 font-body text-sm text-neon">
                <CheckCircle2 className="w-4 h-4" />
                Profile updated
              </p>
            )}

            <button
              type="submit"
              disabled={savingProfile}
              className="flex items-center justify-center gap-2 px-5 py-3 font-display text-sm tracking-wide bg-ember hover:bg-ember/90 disabled:opacity-60 text-white rounded-lg transition-all glow-ember mt-2"
            >
              {savingProfile && <Loader2 className="w-4 h-4 animate-spin" />}
              SAVE CHANGES
            </button>
          </form>
        </div>

        {/* Password */}
        <div className="glass border border-white/10 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-6">
            <Lock className="w-4 h-4 text-ember" />
            <h2 className="font-display text-lg text-white">
              {isGoogleOnlyNoPassword ? 'Set a password' : 'Change password'}
            </h2>
          </div>

          {isGoogleOnlyNoPassword && (
            <p className="font-body text-xs text-mist/60 mb-4">
              Your account uses Google Sign-In. Setting a password lets you also log in with email and password.
            </p>
          )}

          <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
            <div>
              <label className="font-mono text-xs text-mist/70 tracking-wide">CURRENT PASSWORD {isGoogleOnlyNoPassword && '(leave blank if none set)'}</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="mt-1 w-full bg-ash/60 border border-white/10 rounded px-4 py-3 text-white font-body text-sm focus:outline-none focus:border-ember/60 transition-colors"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="font-mono text-xs text-mist/70 tracking-wide">NEW PASSWORD</label>
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1 w-full bg-ash/60 border border-white/10 rounded px-4 py-3 text-white font-body text-sm focus:outline-none focus:border-ember/60 transition-colors"
                placeholder="At least 6 characters"
              />
            </div>

            <div>
              <label className="font-mono text-xs text-mist/70 tracking-wide">CONFIRM NEW PASSWORD</label>
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 w-full bg-ash/60 border border-white/10 rounded px-4 py-3 text-white font-body text-sm focus:outline-none focus:border-ember/60 transition-colors"
                placeholder="Repeat new password"
              />
            </div>

            {passwordError && <p className="font-body text-sm text-red-400">{passwordError}</p>}
            {passwordSuccess && (
              <p className="flex items-center gap-1.5 font-body text-sm text-neon">
                <CheckCircle2 className="w-4 h-4" />
                Password updated
              </p>
            )}

            <button
              type="submit"
              disabled={savingPassword}
              className="flex items-center justify-center gap-2 px-5 py-3 font-display text-sm tracking-wide bg-ember hover:bg-ember/90 disabled:opacity-60 text-white rounded-lg transition-all glow-ember mt-2"
            >
              {savingPassword && <Loader2 className="w-4 h-4 animate-spin" />}
              UPDATE PASSWORD
            </button>
          </form>
        </div>

        {/* Danger zone */}
        <div className="glass border border-red-500/20 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <h2 className="font-display text-lg text-white">Danger zone</h2>
          </div>
          <p className="font-body text-xs text-mist/60 mb-5">
            Deleting your account removes your profile, cart, and waitlist entries permanently. Your past ticket
            orders remain on record for accounting purposes but will no longer be linked to your name.
          </p>
          <button
            onClick={handleDeleteAccount}
            disabled={deleting}
            className="flex items-center justify-center gap-2 px-5 py-3 font-display text-sm tracking-wide bg-red-500/10 border border-red-500/40 hover:bg-red-500/20 disabled:opacity-60 text-red-400 rounded-lg transition-all"
          >
            {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
            DELETE MY ACCOUNT
          </button>
        </div>
      </div>
    </main>
  )
}