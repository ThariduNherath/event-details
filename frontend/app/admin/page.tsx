'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Loader2, DollarSign, Ticket, Users, ShoppingBag, TrendingUp,
  Plus, Pencil, Trash2, X, ArrowLeft, Calendar, CalendarPlus, Download, Save, Search,
} from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/lib/api'
import { exportToCSV } from '@/lib/csvExport'
import { notify } from '@/lib/toast'
import Swal from 'sweetalert2'
import { StatCardSkeleton } from '@/components/ui/Skeleton'

type AdminTab = 'overview' | 'orders' | 'users' | 'speakers' | 'schedule' | 'tickets' | 'waitlist'

interface Stats {
  totalRevenue: number
  totalTicketsSold: number
  totalOrders: number
  totalUsers: number
  newUsersThisWeek: number
  byTier: { tier: string; quantity: number; revenue: number }[]
  dailySales: { date: string; revenue: number; tickets: number; orders: number }[]
  revenueTrend: { date: string; revenue: number }[]
}

interface AdminUser {
  _id: string
  name: string
  email: string
  authProvider: string
  role: string
  createdAt: string
}

interface AdminOrder {
  _id: string
  userId: { name: string; email: string } | null
  tier: string
  quantity: number
  unitPrice: number
  paymentRef: string
  updatedAt: string
  isAdminOrder?: boolean
}

interface Speaker {
  _id: string
  name: string
  role: string
  topic: string
  tag: string
  color: string
  avatar: string
  bio: string
  sessions: string[]
  order: number
}

interface ScheduleEvent {
  _id: string
  time: string
  title: string
  type: string
  speaker: string
  duration: string
  tag: string
  color: string
  order: number
}

interface ScheduleDay {
  _id: string
  dayNumber: number
  theme: string
  events: ScheduleEvent[]
}

interface Availability {
  tier: string
  capacity: number | null
  sold: number
  available: number | null
  soldOut: boolean
}

interface WaitlistEntry {
  _id: string
  name: string
  email: string
  tier: string
  createdAt: string
}

const tierColor: Record<string, string> = {
  Explorer: 'text-neon',
  Architect: 'text-ember',
  Visionary: 'text-gold',
}

const emptySpeakerForm = {
  name: '',
  role: '',
  topic: '',
  tag: '',
  color: '#FF4500',
  avatar: '',
  bio: '',
  sessions: '',
  order: 0,
}

const emptyEventForm = { time: '', title: '', type: 'talk', speaker: '', duration: '', tag: '', color: 'mist', order: 0 }

export default function AdminDashboard() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  const [tab, setTab] = useState<AdminTab>('overview')
  const [stats, setStats] = useState<Stats | null>(null)
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [users, setUsers] = useState<AdminUser[]>([])
  const [speakers, setSpeakers] = useState<Speaker[]>([])
  const [scheduleDays, setScheduleDays] = useState<ScheduleDay[]>([])
  const [availability, setAvailability] = useState<Availability[]>([])
  const [capacityInputs, setCapacityInputs] = useState<Record<string, string>>({})
  const [savingCapacity, setSavingCapacity] = useState<Record<string, boolean>>({})
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Search/filter state
  const [orderSearch, setOrderSearch] = useState('')
  const [userSearch, setUserSearch] = useState('')
  const [waitlistSearch, setWaitlistSearch] = useState('')

  // Speaker form state
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptySpeakerForm)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  // Schedule day form state
  const [showDayForm, setShowDayForm] = useState(false)
  const [editingDayId, setEditingDayId] = useState<string | null>(null)
  const [dayForm, setDayForm] = useState({ dayNumber: 1, theme: '' })
  const [dayFormError, setDayFormError] = useState('')
  const [savingDay, setSavingDay] = useState(false)

  // Schedule event form state
  const [showEventForm, setShowEventForm] = useState(false)
  const [eventDayId, setEventDayId] = useState<string | null>(null)
  const [editingEventId, setEditingEventId] = useState<string | null>(null)
  const [eventForm, setEventForm] = useState(emptyEventForm)
  const [eventFormError, setEventFormError] = useState('')
  const [savingEvent, setSavingEvent] = useState(false)

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/')
    }
  }, [authLoading, user, router])

  const loadAll = async () => {
    try {
      const [s, o, u, sp, sc, av, wl] = await Promise.all([
        api.getAdminStats(),
        api.getAdminOrders(),
        api.getAdminUsers(),
        api.getSpeakers(),
        api.getSchedule(),
        api.getAvailability(),
        api.getAdminWaitlist(),
      ])
      setStats(s)
      setOrders(o.orders)
      setUsers(u.users)
      setSpeakers(sp.speakers)
      setScheduleDays(sc.days)
      setAvailability(av.availability)
      const inputs: Record<string, string> = {}
      av.availability.forEach((a: Availability) => { inputs[a.tier] = a.capacity === null ? '' : String(a.capacity) })
      setCapacityInputs(inputs)
      setWaitlist(wl.entries)
    } catch (err: any) {
      setError(err.message || 'Could not load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!user || user.role !== 'admin') return
    loadAll()
  }, [user])

  // ---------- Filtered lists ----------
  const filteredOrders = orders.filter((o) => {
    const q = orderSearch.toLowerCase()
    if (!q) return true
    return (
      o.userId?.name?.toLowerCase().includes(q) ||
      o.userId?.email?.toLowerCase().includes(q) ||
      o.tier.toLowerCase().includes(q) ||
      o.paymentRef.toLowerCase().includes(q)
    )
  })

  const filteredUsers = users.filter((u) => {
    const q = userSearch.toLowerCase()
    if (!q) return true
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q) ||
      u.authProvider.toLowerCase().includes(q)
    )
  })

  const filteredWaitlist = waitlist.filter((w) => {
    const q = waitlistSearch.toLowerCase()
    if (!q) return true
    return (
      w.name.toLowerCase().includes(q) ||
      w.email.toLowerCase().includes(q) ||
      w.tier.toLowerCase().includes(q)
    )
  })

  // ---------- Speaker handlers ----------
  const openAddForm = () => {
    setEditingId(null)
    setForm(emptySpeakerForm)
    setFormError('')
    setShowForm(true)
  }

  const openEditForm = (sp: Speaker) => {
    setEditingId(sp._id)
    setForm({
      name: sp.name,
      role: sp.role,
      topic: sp.topic,
      tag: sp.tag,
      color: sp.color,
      avatar: sp.avatar,
      bio: sp.bio || '',
      sessions: sp.sessions.join(', '),
      order: sp.order,
    })
    setFormError('')
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingId(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')

    if (!form.name || !form.role || !form.topic || !form.tag || !form.avatar) {
      setFormError('Name, role, topic, tag and avatar are required')
      return
    }

    setSaving(true)
    const payload = {
      ...form,
      order: Number(form.order) || 0,
      sessions: form.sessions
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    }

    try {
      if (editingId) {
        await api.updateSpeaker(editingId, payload)
      } else {
        await api.createSpeaker(payload)
      }
      const sp = await api.getSpeakers()
      setSpeakers(sp.speakers)
      notify.success(editingId ? 'Speaker updated' : 'Speaker added')
      closeForm()
    } catch (err: any) {
      setFormError(err.message || 'Could not save speaker')
      notify.error(err.message || 'Could not save speaker')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    })

    if (result.isConfirmed) {
      try {
        await api.deleteSpeaker(id)
        setSpeakers((prev) => prev.filter((s) => s._id !== id))
        Swal.fire('Deleted!', 'The speaker has been deleted.', 'success')
      } catch (err: any) {
        setError(err.message || 'Could not delete speaker')
        Swal.fire('Error!', 'Something went wrong while deleting.', 'error')
      }
    }
  }

  // ---------- Schedule day handlers ----------
  const openAddDayForm = () => {
    setEditingDayId(null)
    setDayForm({ dayNumber: scheduleDays.length + 1, theme: '' })
    setDayFormError('')
    setShowDayForm(true)
  }

  const openEditDayForm = (day: ScheduleDay) => {
    setEditingDayId(day._id)
    setDayForm({ dayNumber: day.dayNumber, theme: day.theme })
    setDayFormError('')
    setShowDayForm(true)
  }

  const handleDaySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setDayFormError('')
    if (!dayForm.theme) {
      setDayFormError('Theme is required')
      return
    }
    setSavingDay(true)
    try {
      if (editingDayId) {
        await api.updateScheduleDay(editingDayId, dayForm)
      } else {
        await api.createScheduleDay(dayForm)
      }
      const sc = await api.getSchedule()
      setScheduleDays(sc.days)
      notify.success(editingDayId ? 'Day updated' : 'Day added')
      setShowDayForm(false)
    } catch (err: any) {
      setDayFormError(err.message || 'Could not save day')
      notify.error(err.message || 'Could not save day')
    } finally {
      setSavingDay(false)
    }
  }

  const handleDeleteDay = async (id: string) => {
    const result = await Swal.fire({
      title: 'Delete this day?',
      text: 'All events in this day will be deleted too. This cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    })

    if (result.isConfirmed) {
      try {
        await api.deleteScheduleDay(id)
        setScheduleDays((prev) => prev.filter((d) => d._id !== id))
        Swal.fire('Deleted!', 'The day has been deleted.', 'success')
      } catch (err: any) {
        setError(err.message || 'Could not delete day')
        Swal.fire('Error!', 'Something went wrong while deleting.', 'error')
      }
    }
  }

  // ---------- Schedule event handlers ----------
  const openAddEventForm = (dayId: string) => {
    setEventDayId(dayId)
    setEditingEventId(null)
    setEventForm(emptyEventForm)
    setEventFormError('')
    setShowEventForm(true)
  }

  const openEditEventForm = (dayId: string, event: ScheduleEvent) => {
    setEventDayId(dayId)
    setEditingEventId(event._id)
    setEventForm({
      time: event.time,
      title: event.title,
      type: event.type,
      speaker: event.speaker,
      duration: event.duration,
      tag: event.tag,
      color: event.color,
      order: event.order,
    })
    setEventFormError('')
    setShowEventForm(true)
  }

  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEventFormError('')
    if (!eventForm.time || !eventForm.title || !eventForm.tag) {
      setEventFormError('Time, title and tag are required')
      return
    }
    setSavingEvent(true)
    const payload = { ...eventForm, order: Number(eventForm.order) || 0 }
    try {
      if (editingEventId) {
        await api.updateScheduleEvent(editingEventId, payload)
      } else if (eventDayId) {
        await api.addScheduleEvent(eventDayId, payload)
      }
      const sc = await api.getSchedule()
      setScheduleDays(sc.days)
      notify.success(editingEventId ? 'Event updated' : 'Event added')
      setShowEventForm(false)
    } catch (err: any) {
      setEventFormError(err.message || 'Could not save event')
      notify.error(err.message || 'Could not save event')
    } finally {
      setSavingEvent(false)
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
    const result = await Swal.fire({
      title: 'Delete this event?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    })

    if (result.isConfirmed) {
      try {
        await api.deleteScheduleEvent(eventId)
        const sc = await api.getSchedule()
        setScheduleDays(sc.days)
        Swal.fire('Deleted!', 'The event has been deleted.', 'success')
      } catch (err: any) {
        setError(err.message || 'Could not delete event')
        Swal.fire('Error!', 'Something went wrong while deleting.', 'error')
      }
    }
  }

  // ---------- Ticket capacity handlers ----------
  const handleSaveCapacity = async (tier: string) => {
    const value = capacityInputs[tier]
    setSavingCapacity((s) => ({ ...s, [tier]: true }))
    try {
      if (value === '') {
        await api.removeCapacity(tier)
      } else {
        await api.setCapacity(tier, Number(value))
      }
      const av = await api.getAvailability()
      setAvailability(av.availability)
      notify.success(`${tier} capacity updated`)
    } catch (err: any) {
      setError(err.message || 'Could not update capacity')
      notify.error(err.message || 'Could not update capacity')
    } finally {
      setSavingCapacity((s) => ({ ...s, [tier]: false }))
    }
  }

  // ---------- Waitlist handlers ----------
  const handleRemoveWaitlistEntry = async (id: string) => {
    const result = await Swal.fire({
      title: 'Remove from waitlist?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, remove',
    })
    if (result.isConfirmed) {
      try {
        await api.removeWaitlistEntry(id)
        setWaitlist((prev) => prev.filter((w) => w._id !== id))
      } catch (err: any) {
        setError(err.message || 'Could not remove entry')
      }
    }
  }

  // ---------- Export handlers ----------
  const handleExportOrders = () => {
    exportToCSV(
      'nexus-orders',
      filteredOrders.map((o) => ({
        buyer_name: o.userId?.name || '',
        buyer_email: o.userId?.email || '',
        tier: o.tier,
        quantity: o.quantity,
        unit_price: o.unitPrice,
        total: o.unitPrice * o.quantity,
        payment_ref: o.paymentRef,
        is_admin_test: o.isAdminOrder ? 'yes' : 'no',
        date: new Date(o.updatedAt).toISOString(),
      }))
    )
    notify.success('CSV downloaded')
  }

  const handleExportUsers = () => {
    exportToCSV(
      'nexus-users',
      filteredUsers.map((u) => ({
        name: u.name,
        email: u.email,
        provider: u.authProvider,
        role: u.role,
        joined: new Date(u.createdAt).toISOString(),
      }))
    )
    notify.success('CSV downloaded')
  }

  if (authLoading || !user || user.role !== 'admin') {
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

      <div className="max-w-6xl mx-auto">
        <div className="mb-10">
          <h1 className="font-display text-3xl text-white mb-1">Admin Dashboard</h1>
          <p className="font-body text-sm text-mist">Revenue, sales, users, speakers, schedule and tickets for NEXUS 2025</p>
        </div>

        {error && <p className="font-body text-sm text-red-400 mb-6">{error}</p>}

        {loading ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              {[...Array(4)].map((_, i) => <StatCardSkeleton key={i} />)}
            </div>
            <div className="glass border border-white/10 rounded-2xl p-6 mb-10">
              <div className="h-5 w-32 bg-white/10 rounded animate-pulse mb-5" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-ash/60 border border-white/10 rounded-xl p-4 flex flex-col gap-2">
                    <div className="h-3 w-16 bg-white/10 rounded animate-pulse" />
                    <div className="h-6 w-20 bg-white/10 rounded animate-pulse" />
                    <div className="h-3 w-12 bg-white/10 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              <StatCard icon={DollarSign} label="TOTAL REVENUE" value={`$${stats!.totalRevenue.toLocaleString()}`} color="text-neon" />
              <StatCard icon={Ticket} label="TICKETS SOLD" value={stats!.totalTicketsSold.toLocaleString()} color="text-ember" />
              <StatCard icon={ShoppingBag} label="ORDERS" value={stats!.totalOrders.toLocaleString()} color="text-gold" />
              <StatCard icon={Users} label="TOTAL USERS" value={stats!.totalUsers.toLocaleString()} color="text-white" sub={`+${stats!.newUsersThisWeek} this week`} />
            </div>

            {/* Sales by tier */}
            <div className="glass border border-white/10 rounded-2xl p-6 mb-10">
              <div className="flex items-center gap-2 mb-5">
                <TrendingUp className="w-4 h-4 text-neon" />
                <h2 className="font-display text-lg text-white">Sales by tier</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {stats!.byTier.length === 0 && (
                  <p className="font-body text-sm text-mist/60">No sales yet</p>
                )}
                {stats!.byTier.map((t) => (
                  <div key={t.tier} className="bg-ash/60 border border-white/10 rounded-xl p-4">
                    <p className={`font-mono text-xs tracking-widest mb-1 ${tierColor[t.tier] || 'text-white'}`}>{t.tier.toUpperCase()}</p>
                    <p className="font-display text-2xl text-white">${t.revenue.toLocaleString()}</p>
                    <p className="font-mono text-xs text-mist mt-1">{t.quantity} tickets</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
              <div className="glass border border-white/10 rounded-2xl p-6">
                <h2 className="font-display text-lg text-white mb-4">Revenue trend (14 days)</h2>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={stats!.revenueTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(d) => d.slice(5)}
                      stroke="rgba(255,255,255,0.4)"
                      fontSize={10}
                    />
                    <YAxis stroke="rgba(255,255,255,0.4)" fontSize={10} />
                    <Tooltip
                      contentStyle={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                      labelStyle={{ color: '#fff' }}
                      formatter={(v: any) => [`$${Number(v).toLocaleString()}`, 'Cumulative revenue'] as [string, string]}
                    />
                    <Line type="monotone" dataKey="revenue" stroke="#FF4500" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="glass border border-white/10 rounded-2xl p-6">
                <h2 className="font-display text-lg text-white mb-4">Daily sales (14 days)</h2>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={stats!.dailySales}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(d) => d.slice(5)}
                      stroke="rgba(255,255,255,0.4)"
                      fontSize={10}
                    />
                    <YAxis stroke="rgba(255,255,255,0.4)" fontSize={10} />
                    <Tooltip
                      contentStyle={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Bar dataKey="tickets" fill="#00FFB2" radius={[4, 4, 0, 0]} name="Tickets sold" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Tabs + export */}
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <div className="flex gap-2 flex-wrap">
                {(['overview', 'orders', 'users', 'speakers', 'schedule', 'tickets', 'waitlist'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`px-4 py-2 rounded-full font-mono text-xs tracking-widest transition-colors ${
                      tab === t ? 'bg-ember text-white' : 'bg-ash/60 text-mist hover:text-white border border-white/10'
                    }`}
                  >
                    {t.toUpperCase()}
                  </button>
                ))}
              </div>

              {tab === 'orders' && (
                <button
                  onClick={handleExportOrders}
                  className="flex items-center gap-2 px-4 py-2 rounded-full font-mono text-xs tracking-widest bg-ash/60 border border-white/10 text-mist hover:text-white transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  EXPORT ORDERS CSV
                </button>
              )}
              {tab === 'users' && (
                <button
                  onClick={handleExportUsers}
                  className="flex items-center gap-2 px-4 py-2 rounded-full font-mono text-xs tracking-widest bg-ash/60 border border-white/10 text-mist hover:text-white transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  EXPORT USERS CSV
                </button>
              )}
            </div>

            {/* Search bar — shown for orders/users/waitlist tabs */}
            {(tab === 'orders' || tab === 'users' || tab === 'waitlist') && (
              <div className="relative mb-6 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mist/50" />
                <input
                  value={tab === 'orders' ? orderSearch : tab === 'users' ? userSearch : waitlistSearch}
                  onChange={(e) => {
                    if (tab === 'orders') setOrderSearch(e.target.value)
                    else if (tab === 'users') setUserSearch(e.target.value)
                    else setWaitlistSearch(e.target.value)
                  }}
                  placeholder={
                    tab === 'orders'
                      ? 'Search by name, email, tier or ref...'
                      : tab === 'users'
                      ? 'Search by name, email, role or provider...'
                      : 'Search by name, email or tier...'
                  }
                  className="input pl-9"
                />
              </div>
            )}

            {tab === 'orders' && (
              <div className="glass border border-white/10 rounded-2xl overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/10">
                      <Th>Buyer</Th>
                      <Th>Tier</Th>
                      <Th>Qty</Th>
                      <Th>Total</Th>
                      <Th>Ref</Th>
                      <Th>Date</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.length === 0 && (
                      <tr><td colSpan={6} className="px-4 py-6 text-center font-body text-sm text-mist/60">
                        {orders.length === 0 ? 'No orders yet' : 'No orders match your search'}
                      </td></tr>
                    )}
                    {filteredOrders.map((o) => (
                      <tr key={o._id} className="border-b border-white/5 hover:bg-white/[0.02]">
                        <Td>
                          <p className="text-white flex items-center gap-1.5">
                            {o.userId?.name || '—'}
                            {o.isAdminOrder && (
                              <span className="font-mono text-[8px] text-gold border border-gold/40 bg-gold/5 px-1.5 py-0.5 rounded-full">
                                TEST
                              </span>
                            )}
                          </p>
                          <p className="text-mist/60 text-xs">{o.userId?.email || '—'}</p>
                        </Td>
                        <Td><span className={tierColor[o.tier] || 'text-white'}>{o.tier}</span></Td>
                        <Td>{o.quantity}</Td>
                        <Td>${(o.unitPrice * o.quantity).toLocaleString()}</Td>
                        <Td className="font-mono text-xs text-mist">{o.paymentRef}</Td>
                        <Td className="text-mist/60 text-xs">{new Date(o.updatedAt).toLocaleDateString()}</Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {tab === 'users' && (
              <div className="glass border border-white/10 rounded-2xl overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/10">
                      <Th>Name</Th>
                      <Th>Email</Th>
                      <Th>Provider</Th>
                      <Th>Role</Th>
                      <Th>Joined</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length === 0 && (
                      <tr><td colSpan={5} className="px-4 py-6 text-center font-body text-sm text-mist/60">
                        {users.length === 0 ? 'No users yet' : 'No users match your search'}
                      </td></tr>
                    )}
                    {filteredUsers.map((u) => (
                      <tr key={u._id} className="border-b border-white/5 hover:bg-white/[0.02]">
                        <Td className="text-white">{u.name}</Td>
                        <Td>{u.email}</Td>
                        <Td className="capitalize">{u.authProvider}</Td>
                        <Td>
                          <span className={`font-mono text-[10px] px-2 py-0.5 rounded-full border ${
                            u.role === 'admin' ? 'text-gold border-gold/40 bg-gold/5' : 'text-mist border-white/10'
                          }`}>
                            {u.role.toUpperCase()}
                          </span>
                        </Td>
                        <Td className="text-mist/60 text-xs">{new Date(u.createdAt).toLocaleDateString()}</Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {tab === 'speakers' && (
              <div>
                <div className="flex justify-end mb-4">
                  <button
                    onClick={openAddForm}
                    className="flex items-center gap-2 px-4 py-2.5 font-display text-sm tracking-wide bg-ember hover:bg-ember/90 text-white rounded-lg transition-all glow-ember"
                  >
                    <Plus className="w-4 h-4" />
                    ADD SPEAKER
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {speakers.length === 0 && (
                    <div className="col-span-full glass border border-white/10 rounded-2xl p-10 text-center">
                      <p className="font-body text-sm text-mist/60">No speakers added yet</p>
                    </div>
                  )}
                  {speakers.map((sp) => (
                    <div key={sp._id} className="glass border border-white/10 rounded-xl p-4 flex flex-col gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={sp.avatar}
                          alt={sp.name}
                          className="w-12 h-12 rounded-full object-cover border border-white/10"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-display text-sm text-white truncate">{sp.name}</p>
                          <p className="font-mono text-[10px] text-mist truncate">{sp.role}</p>
                        </div>
                        <span
                          className="font-mono text-[9px] px-2 py-0.5 rounded-full border"
                          style={{ color: sp.color, borderColor: `${sp.color}40`, background: `${sp.color}15` }}
                        >
                          {sp.tag}
                        </span>
                      </div>

                      <p className="font-mono text-[10px] text-mist/70 truncate">{sp.topic}</p>

                      {sp.bio && <p className="font-body text-xs text-mist line-clamp-2">{sp.bio}</p>}

                      {sp.sessions.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {sp.sessions.map((s, i) => (
                            <span key={i} className="font-mono text-[9px] text-mist/60 bg-white/5 px-1.5 py-0.5 rounded">
                              {s}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex gap-2 mt-auto pt-2 border-t border-white/5">
                        <button
                          onClick={() => openEditForm(sp)}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-ash/60 border border-white/10 text-mist hover:text-white text-xs font-mono transition-colors"
                        >
                          <Pencil className="w-3 h-3" />
                          EDIT
                        </button>
                        <button
                          onClick={() => handleDelete(sp._id)}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-ash/60 border border-white/10 text-mist hover:text-red-400 text-xs font-mono transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                          DELETE
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === 'schedule' && (
              <div>
                <div className="flex justify-end mb-4">
                  <button
                    onClick={openAddDayForm}
                    className="flex items-center gap-2 px-4 py-2.5 font-display text-sm tracking-wide bg-ember hover:bg-ember/90 text-white rounded-lg transition-all glow-ember"
                  >
                    <Calendar className="w-4 h-4" />
                    ADD DAY
                  </button>
                </div>

                {scheduleDays.length === 0 && (
                  <div className="glass border border-white/10 rounded-2xl p-10 text-center">
                    <p className="font-body text-sm text-mist/60">No schedule days added yet</p>
                  </div>
                )}

                <div className="flex flex-col gap-6">
                  {scheduleDays.map((day) => (
                    <div key={day._id} className="glass border border-white/10 rounded-2xl p-5">
                      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                        <div>
                          <p className="font-display text-lg text-white">Day {day.dayNumber} — {day.theme}</p>
                          <p className="font-mono text-[10px] text-mist/60">{day.events.length} events</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => openAddEventForm(day._id)}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-ash/60 border border-white/10 text-mist hover:text-white text-xs font-mono transition-colors"
                          >
                            <CalendarPlus className="w-3.5 h-3.5" />
                            ADD EVENT
                          </button>
                          <button
                            onClick={() => openEditDayForm(day)}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-ash/60 border border-white/10 text-mist hover:text-white text-xs font-mono transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteDay(day._id)}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-ash/60 border border-white/10 text-mist hover:text-red-400 text-xs font-mono transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        {day.events.length === 0 && (
                          <p className="font-body text-xs text-mist/50">No events yet — add one above</p>
                        )}
                        {day.events.map((ev) => (
                          <div
                            key={ev._id}
                            className="flex items-center justify-between gap-3 bg-ash/40 border border-white/5 rounded-lg px-3 py-2"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="font-mono text-xs text-mist w-12 flex-shrink-0">{ev.time}</span>
                              <span className="font-mono text-[9px] px-2 py-0.5 rounded-full border border-white/10 text-mist flex-shrink-0">
                                {ev.tag}
                              </span>
                              <p className="font-body text-sm text-white truncate">{ev.title}</p>
                            </div>
                            <div className="flex gap-1.5 flex-shrink-0">
                              <button
                                onClick={() => openEditEventForm(day._id, ev)}
                                className="p-1.5 rounded text-mist hover:text-white transition-colors"
                              >
                                <Pencil className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleDeleteEvent(ev._id)}
                                className="p-1.5 rounded text-mist hover:text-red-400 transition-colors"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === 'tickets' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {availability.map((a) => (
                  <div key={a.tier} className="glass border border-white/10 rounded-xl p-5">
                    <p className="font-display text-lg text-white mb-1">{a.tier}</p>
                    <p className="font-mono text-xs text-mist mb-4">
                      {a.capacity === null ? 'No limit set' : `${a.sold} sold of ${a.capacity}`}
                    </p>

                    {a.capacity !== null && (
                      <div className="h-1.5 bg-ash rounded-full overflow-hidden mb-4">
                        <div
                          className={`h-full rounded-full ${a.soldOut ? 'bg-red-500' : 'bg-ember'}`}
                          style={{ width: `${Math.min((a.sold / a.capacity) * 100, 100)}%` }}
                        />
                      </div>
                    )}

                    <label className="font-mono text-[10px] text-mist/70 tracking-wide">CAPACITY (blank = unlimited)</label>
                    <div className="flex gap-2 mt-1">
                      <input
                        type="number"
                        min={0}
                        value={capacityInputs[a.tier] ?? ''}
                        onChange={(e) => setCapacityInputs((prev) => ({ ...prev, [a.tier]: e.target.value }))}
                        className="input flex-1"
                        placeholder="Unlimited"
                      />
                      <button
                        onClick={() => handleSaveCapacity(a.tier)}
                        disabled={savingCapacity[a.tier]}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-ember hover:bg-ember/90 disabled:opacity-60 text-white text-xs font-mono transition-colors"
                      >
                        {savingCapacity[a.tier] ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {a.soldOut && (
                      <p className="font-mono text-[10px] text-red-400 mt-2">SOLD OUT</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {tab === 'waitlist' && (
              <div className="glass border border-white/10 rounded-2xl overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/10">
                      <Th>Name</Th>
                      <Th>Email</Th>
                      <Th>Tier</Th>
                      <Th>Joined</Th>
                     
                    </tr>
                  </thead>
                  <tbody>
                    {filteredWaitlist.length === 0 && (
                      <tr><td colSpan={5} className="px-4 py-6 text-center font-body text-sm text-mist/60">
                        {waitlist.length === 0 ? 'No one on the waitlist yet' : 'No entries match your search'}
                      </td></tr>
                    )}
                    {filteredWaitlist.map((w) => (
                      <tr key={w._id} className="border-b border-white/5 hover:bg-white/[0.02]">
                        <Td className="text-white">{w.name}</Td>
                        <Td>{w.email}</Td>
                        <Td><span className={tierColor[w.tier] || 'text-white'}>{w.tier}</span></Td>
                        <Td className="text-mist/60 text-xs">{new Date(w.createdAt).toLocaleDateString()}</Td>
                        <Td>
                          <button
                            onClick={() => handleRemoveWaitlistEntry(w._id)}
                            className="p-1.5 rounded text-mist hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {tab === 'overview' && (
              <div className="glass border border-white/10 rounded-2xl p-8 text-center">
                <p className="font-body text-sm text-mist">
                  Pick <span className="text-white">ORDERS</span>, <span className="text-white">USERS</span>,{' '}
                  <span className="text-white">SPEAKERS</span>, <span className="text-white">SCHEDULE</span>,{' '}
                  <span className="text-white">TICKETS</span> or <span className="text-white">WAITLIST</span> above for the full tables.
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Speaker add/edit modal */}
      {showForm && (
        <div className="fixed inset-0 z-[200] bg-black/70 flex items-center justify-center px-6 py-10 overflow-y-auto">
          <div className="w-full max-w-lg glass border border-white/10 rounded-2xl p-6 relative">
            <button
              onClick={closeForm}
              className="absolute top-4 right-4 text-mist hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="font-display text-xl text-white mb-6">
              {editingId ? 'Edit speaker' : 'Add speaker'}
            </h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="NAME">
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="input"
                    placeholder="Sarah Chen"
                  />
                </Field>
                <Field label="ROLE">
                  <input
                    required
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="input"
                    placeholder="CEO, NeuralFlow"
                  />
                </Field>
              </div>

              <Field label="TALK TOPIC">
                <input
                  required
                  value={form.topic}
                  onChange={(e) => setForm({ ...form, topic: e.target.value })}
                  className="input"
                  placeholder="The Next 10 Years of AI"
                />
              </Field>

              <Field label="AVATAR IMAGE URL">
                <input
                  required
                  value={form.avatar}
                  onChange={(e) => setForm({ ...form, avatar: e.target.value })}
                  className="input"
                  placeholder="https://..."
                />
              </Field>

              <Field label="BIO (optional)">
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  className="input resize-none"
                  rows={3}
                  placeholder="Short bio shown on the card..."
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="TAG (e.g. KEYNOTE, WEB3, ETHICS)">
                  <input
                    required
                    value={form.tag}
                    onChange={(e) => setForm({ ...form, tag: e.target.value.toUpperCase() })}
                    className="input"
                    placeholder="KEYNOTE"
                  />
                </Field>
                <Field label="COLOR">
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={form.color}
                      onChange={(e) => setForm({ ...form, color: e.target.value })}
                      className="w-10 h-10 rounded border border-white/10 bg-transparent cursor-pointer"
                    />
                    <input
                      value={form.color}
                      onChange={(e) => setForm({ ...form, color: e.target.value })}
                      className="input flex-1"
                      placeholder="#FF4500"
                    />
                  </div>
                </Field>
              </div>

              <Field label="SESSIONS (comma separated — count shown as 'N talks')">
                <input
                  value={form.sessions}
                  onChange={(e) => setForm({ ...form, sessions: e.target.value })}
                  className="input"
                  placeholder="Opening Keynote, Closing Fireside"
                />
              </Field>

              <Field label="DISPLAY ORDER">
                <input
                  type="number"
                  value={form.order}
                  onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                  className="input"
                />
              </Field>

              {formError && <p className="font-body text-sm text-red-400">{formError}</p>}

              <button
                type="submit"
                disabled={saving}
                className="flex items-center justify-center gap-2 px-5 py-3 font-display text-sm tracking-wide bg-ember hover:bg-ember/90 disabled:opacity-60 text-white rounded-lg transition-all glow-ember mt-2"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingId ? 'SAVE CHANGES' : 'ADD SPEAKER'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Schedule day add/edit modal */}
      {showDayForm && (
        <div className="fixed inset-0 z-[200] bg-black/70 flex items-center justify-center px-6 py-10 overflow-y-auto">
          <div className="w-full max-w-sm glass border border-white/10 rounded-2xl p-6 relative">
            <button onClick={() => setShowDayForm(false)} className="absolute top-4 right-4 text-mist hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
            <h2 className="font-display text-xl text-white mb-6">{editingDayId ? 'Edit day' : 'Add day'}</h2>
            <form onSubmit={handleDaySubmit} className="flex flex-col gap-4">
              <Field label="DAY NUMBER">
                <input
                  type="number"
                  required
                  value={dayForm.dayNumber}
                  onChange={(e) => setDayForm({ ...dayForm, dayNumber: Number(e.target.value) })}
                  className="input"
                />
              </Field>
              <Field label="THEME (e.g. EMERGENCE)">
                <input
                  required
                  value={dayForm.theme}
                  onChange={(e) => setDayForm({ ...dayForm, theme: e.target.value.toUpperCase() })}
                  className="input"
                  placeholder="EMERGENCE"
                />
              </Field>
              {dayFormError && <p className="font-body text-sm text-red-400">{dayFormError}</p>}
              <button
                type="submit"
                disabled={savingDay}
                className="flex items-center justify-center gap-2 px-5 py-3 font-display text-sm tracking-wide bg-ember hover:bg-ember/90 disabled:opacity-60 text-white rounded-lg transition-all glow-ember mt-2"
              >
                {savingDay && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingDayId ? 'SAVE CHANGES' : 'ADD DAY'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Schedule event add/edit modal */}
      {showEventForm && (
        <div className="fixed inset-0 z-[200] bg-black/70 flex items-center justify-center px-6 py-10 overflow-y-auto">
          <div className="w-full max-w-lg glass border border-white/10 rounded-2xl p-6 relative">
            <button onClick={() => setShowEventForm(false)} className="absolute top-4 right-4 text-mist hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
            <h2 className="font-display text-xl text-white mb-6">{editingEventId ? 'Edit event' : 'Add event'}</h2>
            <form onSubmit={handleEventSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="TIME (e.g. 09:00)">
                  <input required value={eventForm.time} onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })} className="input" placeholder="09:00" />
                </Field>
                <Field label="DURATION">
                  <input value={eventForm.duration} onChange={(e) => setEventForm({ ...eventForm, duration: e.target.value })} className="input" placeholder="45 min" />
                </Field>
              </div>

              <Field label="TITLE">
                <input required value={eventForm.title} onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })} className="input" placeholder="Opening Ceremony" />
              </Field>

              <Field label="SPEAKER (optional)">
                <input value={eventForm.speaker} onChange={(e) => setEventForm({ ...eventForm, speaker: e.target.value })} className="input" placeholder="Sarah Chen" />
              </Field>

              <div className="grid grid-cols-3 gap-4">
                <Field label="TYPE">
                  <select value={eventForm.type} onChange={(e) => setEventForm({ ...eventForm, type: e.target.value })} className="input">
                    {['keynote', 'talk', 'break', 'panel', 'workshop', 'demo', 'social', 'competition', 'ceremony'].map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </Field>
                <Field label="TAG">
                  <input required value={eventForm.tag} onChange={(e) => setEventForm({ ...eventForm, tag: e.target.value.toUpperCase() })} className="input" placeholder="KEYNOTE" />
                </Field>
                <Field label="COLOR">
                  <select value={eventForm.color} onChange={(e) => setEventForm({ ...eventForm, color: e.target.value })} className="input">
                    {['ember', 'neon', 'plasma', 'gold', 'mist'].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </Field>
              </div>

              <Field label="ORDER (controls position in the day)">
                <input type="number" value={eventForm.order} onChange={(e) => setEventForm({ ...eventForm, order: Number(e.target.value) })} className="input" />
              </Field>

              {eventFormError && <p className="font-body text-sm text-red-400">{eventFormError}</p>}

              <button
                type="submit"
                disabled={savingEvent}
                className="flex items-center justify-center gap-2 px-5 py-3 font-display text-sm tracking-wide bg-ember hover:bg-ember/90 disabled:opacity-60 text-white rounded-lg transition-all glow-ember mt-2"
              >
                {savingEvent && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingEventId ? 'SAVE CHANGES' : 'ADD EVENT'}
              </button>
            </form>
          </div>
        </div>
      )}

      <style jsx global>{`
        .input {
          width: 100%;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 0.375rem;
          padding: 0.6rem 0.85rem;
          color: white;
          font-family: var(--font-body);
          font-size: 0.875rem;
          margin-top: 0.25rem;
        }
        .input:focus {
          outline: none;
          border-color: rgba(255, 107, 53, 0.6);
        }
      `}</style>
    </main>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="font-mono text-[10px] text-mist/70 tracking-wide">{label}</label>
      {children}
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color, sub }: { icon: any; label: string; value: string; color: string; sub?: string }) {
  return (
    <div className="glass border border-white/10 rounded-xl p-5">
      <Icon className={`w-4 h-4 mb-3 ${color}`} />
      <p className="font-mono text-[10px] text-mist/60 tracking-widest mb-1">{label}</p>
      <p className="font-display text-2xl text-white">{value}</p>
      {sub && <p className="font-mono text-[10px] text-neon mt-1">{sub}</p>}
    </div>
  )
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-3 font-mono text-[10px] text-mist/60 tracking-widest">{children}</th>
}

function Td({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 font-body text-sm text-mist ${className}`}>{children}</td>
}