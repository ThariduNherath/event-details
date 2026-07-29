const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

let refreshPromise: Promise<boolean> | null = null

// Calls /api/auth/refresh once. If multiple requests 401 at the same time, they all
// await the SAME refresh call instead of each firing their own (avoids a refresh race
// that would otherwise revoke each other's freshly-rotated tokens).
async function refreshAccessToken(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_URL}/api/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    })
      .then((res) => res.ok)
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}

async function request(path: string, options: RequestInit = {}, isRetry = false): Promise<any> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  // Access token expired — try a silent refresh, then retry the original request once.
  // Skip this dance for the auth endpoints themselves to avoid infinite loops.
  const isAuthEndpoint = path.startsWith('/api/auth/')
  if (res.status === 401 && !isRetry && !isAuthEndpoint) {
    const refreshed = await refreshAccessToken()
    if (refreshed) {
      return request(path, options, true)
    }
  }

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new Error(data.error || 'Something went wrong')
  }
  return data
}

export const api = {
  signup: (name: string, email: string, password: string) =>
    request('/api/auth/signup', { method: 'POST', body: JSON.stringify({ name, email, password }) }),

  login: (email: string, password: string) =>
    request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  googleAuth: (credential: string) =>
    request('/api/auth/google', { method: 'POST', body: JSON.stringify({ credential }) }),

  logout: () => request('/api/auth/logout', { method: 'POST' }),

  me: () => request('/api/auth/me'),

  getCart: () => request('/api/bookings'),

  addToCart: (tier: string, quantity = 1) =>
    request('/api/bookings', { method: 'POST', body: JSON.stringify({ tier, quantity }) }),

  updateCartItem: (id: string, quantity: number) =>
    request(`/api/bookings/${id}`, { method: 'PATCH', body: JSON.stringify({ quantity }) }),

  removeFromCart: (id: string) => request(`/api/bookings/${id}`, { method: 'DELETE' }),

  checkout: (cardName: string, cardNumber: string, expiry: string, cvv: string) =>
    request('/api/payment/checkout', {
      method: 'POST',
      body: JSON.stringify({ cardName, cardNumber, expiry, cvv }),
    }),

  getHistory: () => request('/api/payment/history'),

  getAdminStats: () => request('/api/admin/stats'),
  getAdminUsers: () => request('/api/admin/users'),
  getAdminOrders: () => request('/api/admin/orders'),

  getSpeakers: () => request('/api/speakers'),
  createSpeaker: (payload: any) =>
    request('/api/speakers', { method: 'POST', body: JSON.stringify(payload) }),
  updateSpeaker: (id: string, payload: any) =>
    request(`/api/speakers/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteSpeaker: (id: string) => request(`/api/speakers/${id}`, { method: 'DELETE' }),

  getSchedule: () => request('/api/schedule'),
  createScheduleDay: (payload: any) =>
    request('/api/schedule/days', { method: 'POST', body: JSON.stringify(payload) }),
  updateScheduleDay: (id: string, payload: any) =>
    request(`/api/schedule/days/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteScheduleDay: (id: string) => request(`/api/schedule/days/${id}`, { method: 'DELETE' }),
  addScheduleEvent: (dayId: string, payload: any) =>
    request(`/api/schedule/days/${dayId}/events`, { method: 'POST', body: JSON.stringify(payload) }),
  updateScheduleEvent: (eventId: string, payload: any) =>
    request(`/api/schedule/events/${eventId}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteScheduleEvent: (eventId: string) =>
    request(`/api/schedule/events/${eventId}`, { method: 'DELETE' }),

  updateProfile: (name: string, avatar: string) =>
    request('/api/auth/profile', { method: 'PATCH', body: JSON.stringify({ name, avatar }) }),

  changePassword: (currentPassword: string, newPassword: string) =>
    request('/api/auth/password', { method: 'PATCH', body: JSON.stringify({ currentPassword, newPassword }) }),

  getAvailability: () => request('/api/tickets/availability'),
  setCapacity: (tier: string, capacity: number) =>
    request(`/api/tickets/capacity/${tier}`, { method: 'PATCH', body: JSON.stringify({ capacity }) }),
  removeCapacity: (tier: string) =>
    request(`/api/tickets/capacity/${tier}`, { method: 'DELETE' }),

  joinWaitlist: (tier: string) =>
    request('/api/waitlist', { method: 'POST', body: JSON.stringify({ tier }) }),
  getMyWaitlist: () => request('/api/waitlist/me'),
  getAdminWaitlist: () => request('/api/waitlist'),
  removeWaitlistEntry: (id: string) => request(`/api/waitlist/${id}`, { method: 'DELETE' }),

  refundOrder: (id: string, reason: string) =>
    request(`/api/admin/orders/${id}/refund`, { method: 'POST', body: JSON.stringify({ reason }) }),

  getAuditLog: () => request('/api/audit'),

  deleteUser: (id: string) => request(`/api/admin/users/${id}`, { method: 'DELETE' }),
  deleteMyAccount: (password: string) =>
    request('/api/auth/account', { method: 'DELETE', body: JSON.stringify({ password }) }),

  getTicketQR: (bookingId: string) => request(`/api/tickets/qr/${bookingId}`),
  scanTicket: (ticketCode: string) =>
    request('/api/tickets/scan', { method: 'POST', body: JSON.stringify({ ticketCode }) }),

  verifyEmail: (token: string) => request(`/api/auth/verify-email/${token}`),
  resendVerification: (email: string) =>
    request('/api/auth/resend-verification', { method: 'POST', body: JSON.stringify({ email }) }),
}