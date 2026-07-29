'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Menu, X, Zap, ShoppingCart, LogOut, LayoutDashboard, UserCircle, Ticket, ChevronRight } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'
import Swal from 'sweetalert2' // SweetAlert import කළා

const links = ['Schedule', 'Speakers', 'Tickets', 'Venue', 'Reviews']

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { user, loading, logout } = useAuth()
  const { cartCount } = useCart()
  const router = useRouter()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Mount/unmount with a tick delay so the exit transition can play out.
  useEffect(() => {
    if (open) {
      setMounted(true)
    } else {
      const t = setTimeout(() => setMounted(false), 350)
      return () => clearTimeout(t)
    }
  }, [open])

  const scrollTo = (id: string) => {
    setOpen(false)
    setTimeout(() => {
      document.getElementById(id.toLowerCase())?.scrollIntoView({ behavior: 'smooth' })
    }, 300)
  }

  const handleLogout = () => {
    setOpen(false)

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
      scrolled || open ? 'glass border-b border-white/5 py-3' : 'py-5'
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
                className="relative flex items-center gap-1.5 px-4 py-2 font-mono text-xs text-mist hover:text-white transition-colors"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                CART
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-ember text-white text-[9px] font-mono font-bold glow-ember">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
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

        {/* Mobile/tablet menu trigger */}
        <button
          className="md:hidden relative text-white w-9 h-9 flex items-center justify-center"
          onClick={() => setOpen(!open)}
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          <span className="relative w-6 h-6">
            <Menu className={`absolute inset-0 w-6 h-6 transition-all duration-300 ${open ? 'opacity-0 rotate-90 scale-75' : 'opacity-100 rotate-0 scale-100'}`} />
            <X className={`absolute inset-0 w-6 h-6 transition-all duration-300 ${open ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-75'}`} />
          </span>
          {!open && cartCount > 0 && (
            <span className="absolute top-0 right-0 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-ember text-white text-[9px] font-mono font-bold glow-ember">
              {cartCount > 99 ? '99+' : cartCount}
            </span>
          )}
        </button>
      </div>

      {/* Mobile/tablet dropdown panel — fixed below navbar, no page scroll needed */}
      {mounted && (
        <div
          className={`md:hidden fixed left-0 right-0 top-full z-[150] transition-all duration-350 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            open ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3 pointer-events-none'
          }`}
        >
          <div
            className="glass border-b border-white/10 px-6 pt-4 pb-6 max-h-[calc(100vh-64px)] overflow-y-auto"
            style={{
              background: 'linear-gradient(180deg, rgba(12,12,15,0.98), rgba(8,8,10,0.98))',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}
          >
            {/* Ambient glow */}
            <div className="absolute -top-10 right-10 w-40 h-40 rounded-full bg-ember/10 blur-[70px] pointer-events-none" />

            <div className="relative flex flex-col">
              {links.map((link, i) => (
                <button
                  key={link}
                  onClick={() => scrollTo(link)}
                  className={`group flex items-center justify-between font-body text-base text-mist hover:text-white py-3 border-b border-white/5 transition-all duration-400 ${
                    open ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
                  }`}
                  style={{ transitionDelay: open ? `${60 + i * 40}ms` : '0ms' }}
                >
                  {link}
                  <ChevronRight className="w-4 h-4 text-mist/30 group-hover:text-ember group-hover:translate-x-0.5 transition-all" />
                </button>
              ))}

              <div
                className={`flex flex-col mt-1 transition-all duration-400 ${
                  open ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
                }`}
                style={{ transitionDelay: open ? `${60 + links.length * 40}ms` : '0ms' }}
              >
                {!loading && user ? (
                  <>
                    <Link
                      href="/profile"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 font-body text-base text-mist hover:text-white py-3 border-b border-white/5 transition-colors"
                    >
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-7 h-7 rounded-full object-cover border border-white/10"
                        />
                      ) : (
                        <UserCircle className="w-7 h-7 text-mist/50" />
                      )}
                      <span className="flex-1 truncate">{user.name}</span>
                      <ChevronRight className="w-4 h-4 text-mist/30" />
                    </Link>

                    {user.role === 'admin' && (
                      <Link
                        href="/admin"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 font-body text-base text-gold hover:text-white py-3 border-b border-white/5 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        Admin Dashboard
                      </Link>
                    )}

                    <Link
                      href="/my-tickets"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 font-body text-base text-mist hover:text-white py-3 border-b border-white/5 transition-colors"
                    >
                      <Ticket className="w-4 h-4" />
                      My Tickets
                    </Link>

                    <Link
                      href="/cart"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 font-body text-base text-mist hover:text-white py-3 border-b border-white/5 transition-colors"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span className="flex-1">Cart</span>
                      {cartCount > 0 && (
                        <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-ember text-white text-[10px] font-mono font-bold">
                          {cartCount > 99 ? '99+' : cartCount}
                        </span>
                      )}
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 font-body text-base text-mist hover:text-red-400 py-3 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Log out
                    </button>
                  </>
                ) : !loading ? (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 font-body text-base text-mist hover:text-white py-3 border-b border-white/5 transition-colors"
                    >
                      Log in
                    </Link>
                    <Link
                      href="/signup"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 font-body text-base text-mist hover:text-white py-3 transition-colors"
                    >
                      Sign up
                    </Link>
                  </>
                ) : null}
              </div>

              <div
                className={`pt-4 transition-all duration-400 ${
                  open ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
                }`}
                style={{ transitionDelay: open ? '320ms' : '0ms' }}
              >
                <button
                  onClick={() => scrollTo('Tickets')}
                  className="w-full px-5 py-3.5 font-display text-sm tracking-wide bg-ember hover:bg-ember/90 text-white rounded-xl glow-ember transition-all hover:scale-[1.02]"
                >
                  GET TICKETS
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}