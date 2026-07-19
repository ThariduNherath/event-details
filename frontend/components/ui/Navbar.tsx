'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Menu, X, Zap, ShoppingCart, LogOut, LayoutDashboard, UserCircle,Ticket } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import Swal from 'sweetalert2' // SweetAlert import කළා

const links = ['Schedule', 'Speakers', 'Tickets', 'Venue', 'Reviews']

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const { user, loading, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollTo = (id: string) => {
    document.getElementById(id.toLowerCase())?.scrollIntoView({ behavior: 'smooth' })
    setOpen(false)
  }

  const handleLogout = () => {
    setOpen(false) // Mobile menu එක close කරනවා

    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to log out?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ff4a57', // ඔයාගේ theme එකට මැච් වෙන ember/red පාටක්
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, log out!',
      background: '#121214', // dark theme එකට ගැලපෙන්න
      color: '#fff'
    }).then(async (result) => {
      if (result.isConfirmed) {
        await logout()
        router.push('/')
        
        // සාර්ථකව logout වුණා කියලා පොඩි alert එකක්
        Swal.fire({
          title: 'Logged Out!',
          text: 'You have been successfully logged out.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
          background: '#121214',
          color: '#fff'
        })
      }
    })
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
      scrolled ? 'glass border-b border-white/5 py-3' : 'py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative">
            <Zap className="w-6 h-6 text-ember group-hover:text-neon transition-colors" fill="currentColor" />
            <div className="absolute inset-0 blur-md bg-ember/50 group-hover:bg-neon/50 transition-colors" />
          </div>
          <span className="font-display text-2xl tracking-wider text-white">NEXUS</span>
          <span className="font-mono text-xs text-ember border border-ember/40 px-1.5 py-0.5 rounded">2025</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {links.map(link => (
            <button
              key={link}
              onClick={() => scrollTo(link)}
              className="relative px-4 py-2 font-body text-sm text-mist hover:text-white transition-colors group"
            >
              {link}
              <span className="absolute bottom-1 left-4 right-4 h-px bg-ember scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            </button>
          ))}
        </div>

        {/* CTA / Auth area */}
        <div className="hidden md:flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-mono text-xs text-neon">
            <span className="w-1.5 h-1.5 rounded-full bg-neon animate-pulse" />
            LIVE
          </span>

          {!loading && user ? (
            <>
              {user.role === 'admin' && (
                <Link
                  href="/admin"
                  className="flex items-center gap-1.5 px-4 py-2 font-mono text-xs text-gold hover:text-white transition-colors"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  ADMIN
                </Link>
              )}
              <Link
                href="/my-tickets"
                className="flex items-center gap-1.5 px-4 py-2 font-mono text-xs text-mist hover:text-white transition-colors"
              >
                <Ticket className="w-3.5 h-3.5" />
                MY TICKETS
              </Link>
              <Link
                href="/cart"
                className="flex items-center gap-1.5 px-4 py-2 font-mono text-xs text-mist hover:text-white transition-colors"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                CART
              </Link>

              <Link
                href="/profile"
                className="flex items-center gap-2 px-2 py-1 rounded-full font-mono text-xs text-mist/70 hover:text-white transition-colors group"
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-7 h-7 rounded-full object-cover border border-white/10 group-hover:border-ember/50 transition-colors"
                  />
                ) : (
                  <UserCircle className="w-7 h-7 text-mist/50 group-hover:text-ember transition-colors" />
                )}
                <span className="max-w-[100px] truncate">{user.name}</span>
              </Link>

              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-4 py-2 font-mono text-xs text-mist hover:text-red-400 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </>
          ) : !loading ? (
            <>
              <Link
                href="/login"
                className="px-4 py-2 font-body text-sm text-mist hover:text-white transition-colors"
              >
                Log in
              </Link>
              <button
                onClick={() => scrollTo('Tickets')}
                className="relative px-5 py-2 font-display text-sm tracking-wide bg-ember hover:bg-ember/90 text-white rounded transition-all glow-ember hover:scale-105"
              >
                GET TICKETS
              </button>
            </>
          ) : null}
        </div>

        {/* Mobile menu */}
        <button className="md:hidden text-white" onClick={() => setOpen(!open)}>
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="md:hidden glass border-t border-white/5 px-6 py-4 flex flex-col gap-3">
          {links.map(link => (
            <button
              key={link}
              onClick={() => scrollTo(link)}
              className="text-left font-body text-base text-mist hover:text-white transition-colors py-1"
            >
              {link}
            </button>
          ))}

          {!loading && user ? (
            <>
              <Link
                href="/profile"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 font-body text-base text-mist hover:text-white py-1"
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-6 h-6 rounded-full object-cover border border-white/10"
                  />
                ) : (
                  <UserCircle className="w-6 h-6 text-mist/50" />
                )}
                Profile
              </Link>

              {user.role === 'admin' && (
                <Link href="/admin" onClick={() => setOpen(false)} className="text-left font-body text-base text-gold hover:text-white py-1">
                  Admin Dashboard
                </Link>
              )}
              <Link href="/my-tickets" onClick={() => setOpen(false)} className="text-left font-body text-base text-mist hover:text-white py-1">
                My Tickets
              </Link>
              <Link href="/cart" onClick={() => setOpen(false)} className="text-left font-body text-base text-mist hover:text-white py-1">
                Cart
              </Link>
              <button onClick={handleLogout} className="text-left font-body text-base text-mist hover:text-red-400 py-1">
                Log out
              </button>
            </>
          ) : !loading ? (
            <>
              <Link href="/login" onClick={() => setOpen(false)} className="text-left font-body text-base text-mist hover:text-white py-1">
                Log in
              </Link>
              <Link href="/signup" onClick={() => setOpen(false)} className="text-left font-body text-base text-mist hover:text-white py-1">
                Sign up
              </Link>
            </>
          ) : null}

          <button
            onClick={() => scrollTo('Tickets')}
            className="mt-2 px-5 py-3 font-display text-sm tracking-wide bg-ember text-white rounded glow-ember"
          >
            GET TICKETS
          </button>
        </div>
      )}
    </nav>
  )
}