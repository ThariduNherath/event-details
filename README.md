# NEXUS 2025 — Event Ticketing Platform

A full stack event ticketing web app for "NEXUS 2025" — a 3-day tech conference landing page with authentication, a ticket cart and checkout, live ticket availability with a waitlist, QR code gate check in, and a full admin dashboard for managing speakers, schedule, tickets, orders, refunds, and more.

---

## Tech Stack

### Frontend
- **Next.js 14** (App Router)
- **TypeScript**
- **React 18**
- **Tailwind CSS** (custom dark theme — `bg-void`, `text-ember`, `text-neon`, `glass`, `font-display`, `font-mono`, `font-body`)
- **lucide-react**, **react-icons** — icons
- **Framer Motion**, **GSAP** — animation
- **three.js** + **@react-three/fiber** + **@react-three/drei** — hero 3D background
- **React Context API** — auth state (`AuthContext`)
- **Google Identity Services** — Google Sign-In button
- **recharts** — admin dashboard charts
- **sweetalert2** — confirmation dialogs
- **react-hot-toast** — toast notifications
- **jsPDF** + **jspdf-autotable** — schedule PDF download, ticket receipt PDF

### Backend
- **Node.js** + **Express.js**
- **MongoDB** + **Mongoose**
- **JWT** — short-lived access tokens (15 min) + rotating refresh tokens (30 days, hashed in DB)
- **bcryptjs** — password hashing
- **google-auth-library** — verifies Google ID tokens server-side
- **nodemailer** — transactional email via Gmail SMTP
- **node-cron** — scheduled event reminder emails
- **qrcode** — generates ticket QR codes
- **cors**, **cookie-parser**, **dotenv**

### Testing / DevOps
- **Jest** + **Supertest** + **mongodb-memory-server** — backend integration tests
- **ESLint** + **Prettier** — linting/formatting (backend + frontend)
- **GitHub Actions** — CI pipeline (lint, test, build on every push/PR)
- **Docker** + **docker-compose** — containerized backend, frontend, and MongoDB

---

## Architecture

Fully **decoupled** — frontend (Next.js, port 3000) and backend (Express, port 5000) run as separate processes/containers, communicating over REST with credentials (`httpOnly` cookies), not Next.js API routes.

```
nexus2025/
├── backend/
│   ├── server.js
│   ├── Dockerfile
│   ├── .env.example
│   ├── jest.config.js
│   ├── eslint.config.js
│   ├── .prettierrc
│   ├── test/                    → Jest + Supertest integration tests
│   └── src/
│       ├── app.js               → Express app, middleware, route mounting
│       ├── config/db.js         → Mongoose connection
│       ├── models/              → User, Booking, Speaker, ScheduleDay,
│       │                          TicketCapacity, Waitlist, AuditLog, RefreshToken
│       ├── middleware/
│       │   ├── auth.js          → requireAuth, requireAdmin
│       │   └── audit.js         → logAction() helper
│       ├── lib/
│       │   └── mailer.js        → nodemailer templates (verify, welcome,
│       │                          order confirmation, reminder)
│       ├── jobs/
│       │   └── reminderJob.js   → daily cron, event countdown reminder emails
│       └── controllers/ + routes/
│           → auth, bookings, payment, admin, speakers, schedule,
│             tickets (capacity + QR/scan), waitlist, audit
│
└── frontend/
    ├── Dockerfile
    ├── .env.local.example
    ├── .eslintrc.json / .prettierrc
    ├── app/
    │   ├── layout.tsx           → AuthProvider, VerifyBanner, Toaster
    │   ├── page.tsx              (event landing page — unchanged from original)
    │   ├── login/ signup/        → email/password + Google Sign-In
    │   ├── verify-email/         → email verification landing page
    │   ├── profile/              → edit name/avatar, change password, delete account
    │   ├── cart/                 → cart, mock checkout, receipt
    │   ├── my-tickets/           → purchase history, QR codes, receipt PDF download
    │   └── admin/                → full admin dashboard (see below)
    ├── components/
    │   ├── providers/ ui/ sections/
    │   │   → Navbar (auth-aware), GoogleButton, Skeleton primitives,
    │   │     VerifyBanner, TicketSection, SpeakersSection, ScheduleSection
    ├── context/
    │   └── AuthContext.tsx      → login, signup, loginWithGoogle, logout,
    │                               updateUser, deleteAccount
    └── lib/
        ├── api.ts               → typed fetch wrapper, auto-refreshes
        │                          access token on 401
        ├── toast.ts             → themed react-hot-toast wrapper
        ├── csvExport.ts         → generic CSV download helper
        └── receiptPdf.ts        → ticket receipt PDF generator
```

---

## Features

### Authentication
- Email/password signup and login (bcrypt-hashed passwords)
- Google Sign-In (Google Identity Services button, ID token verified server-side)
- Account linking — signing in with Google using an email that already has a local account links them
- **Email verification** — signup sends a verification link (24h expiry); local accounts can't log in until verified; Google accounts are auto-verified; dismissible banner + resend button for unverified users
- **Short-lived access tokens (15 min) + rotating refresh tokens (30 days)**
  - Refresh tokens are stored as SHA-256 hashes only, never in plaintext
  - Rotation: every refresh issues a new token and revokes the old one
  - Reuse detection: presenting an already-rotated (dead) token revokes **all** sessions for that user (theft response)
  - Frontend transparently refreshes the access token on a 401 and retries the original request
- Role-based access (`user` / `admin`) via `requireAuth` / `requireAdmin` middleware

### Ticketing
- Three tiers — Explorer ($299), Architect ($799), Visionary ($2499) — defined server-side as the single source of truth for pricing
- Cart: add/update quantity/remove, tier merge on duplicate add
- **Mock checkout** (no real payment gateway — Stripe was evaluated and reverted since it doesn't support Sri Lanka; PayHere or another provider would need a separate integration)
- **Ticket capacity limits** — admin can cap how many tickets are sellable per tier; "sold out" state disables purchase
- **Admin bypass** — admin accounts can always buy (for testing), and their test purchases are excluded from public availability counts and revenue stats, but are visible (tagged "TEST") in the admin orders table
- **Waitlist** — once a tier is sold out, users can join a waitlist instead of buying; admin can view/manage entries
- **Refunds** — admin can refund a paid order with a reason; refunded orders are excluded from revenue but remain visible for record-keeping
- **QR code tickets** — each paid line item gets a unique ticket code; the "My Tickets" page renders it as a QR code; admin has a **gate check-in / scan** screen (manual code entry, compatible with hardware barcode scanners) that validates the code, flags already-scanned tickets, and rejects refunded ones
- **Receipt PDF** — downloadable per-ticket PDF receipt (buyer info, tier, price, ref, refunded watermark if applicable)

### Content Management (Admin-editable, no more hardcoded data)
- **Speakers** — full CRUD (name, role, topic, tag, color, avatar, bio, sessions, display order); public speaker section fetches live data and derives its filter tabs from whatever tags admins actually use
- **Schedule/Agenda** — full CRUD for days and their events (time, title, type, speaker, duration, tag, color, order); public schedule section stays synced with the event countdown date; **Download Full Schedule PDF** button generates a multi-page PDF from live data

### Admin Dashboard
Tabs: **Overview · Orders · Users · Speakers · Schedule · Tickets · Waitlist · Audit · Scan**
- Stat cards: total revenue, tickets sold, orders, total users, refunded amount
- Charts: 14-day cumulative revenue trend (line), 14-day daily ticket sales (bar) — Recharts
- Orders table: buyer, tier, qty, total, status, ref, date, refund action, admin-test tag
- Users table: name, email, provider, role, joined date, delete action (self-delete blocked from this route)
- Ticket capacity manager: set/clear a per-tier sell limit, live sold/remaining bar
- Waitlist manager: view/remove entries
- **Audit log** — every admin write action (speaker/schedule CRUD, capacity changes, refunds, user deletion, waitlist removal, ticket scans) is recorded with admin identity, action, target, details, and timestamp
- **Gate check-in (Scan)** — enter/scan a ticket code, see valid/invalid/already-scanned status with buyer details
- **CSV export** — orders and users tables export to CSV (respects active search filter)
- **Search/filter** — client-side search on Orders, Users, and Waitlist tables
- All tables are **scrollable with a sticky header** so long lists don't push the whole page down

### User Features
- **Profile page** — edit name/avatar, change/set password (Google-only accounts can set a first password to also enable email/password login), **danger zone**: self-delete account (password-confirmed for local accounts)
- **My Tickets** — purchase history with active/refunded/checked-in status, QR code modal per ticket, PDF receipt download
- Navbar shows the user's avatar (including Google profile photo), a Cart link, My Tickets link, and an Admin Dashboard link for admins

### Email Notifications
- Verification email on signup
- Welcome email on signup
- Order confirmation email after checkout (itemized, with total and reference)
- **Daily reminder emails** — cron job checks once a day; sends a countdown reminder to everyone with a paid ticket at 7, 3, and 1 days before the event (`EVENT_DATE` env var controls the target date)
- All emails are fire-and-forget — a mail provider hiccup never blocks or slows down signup/checkout

### UI/UX
- Loading skeletons (pulse-animated, shaped to match each section's real content) instead of spinners across ticket cards, speaker cards, schedule rows, cart, and admin dashboard
- Toast notifications (react-hot-toast, themed) for quick success/error feedback; SweetAlert2 reserved for blocking confirmations (deletes, refunds)
- Scrollable, sticky-header tables in the admin dashboard

---

## Environment Variables

### `backend/.env`
```bash
# MongoDB connection string — include the database name in the URI
MONGODB_URI=mongodb://localhost:27017/nexus2025

# Long random string used to sign JWT access tokens
JWT_SECRET=change-this-to-a-long-random-secret-string

PORT=5000

# Frontend origin(s) for CORS, comma-separated
FRONTEND_URL=http://localhost:3000

NODE_ENV=development

# Google OAuth — https://console.cloud.google.com/apis/credentials
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com

# Gmail SMTP — requires a Google Account App Password (not your normal password),
# generated at https://myaccount.google.com/security after enabling 2-Step Verification
EMAIL_USER=youraddress@gmail.com
EMAIL_PASS=your-16-char-app-password

# Target event date for the reminder-email cron job (YYYY-MM-DD)
EVENT_DATE=2025-09-15
```

### `frontend/.env.local`
```bash
NEXT_PUBLIC_API_URL=http://localhost:5000

# Same Google OAuth Client ID as the backend
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

---

## Setup & Run (local, without Docker)

### Backend
```bash
cd backend
npm install
cp .env.example .env      # fill in the values above
npm run dev                # http://localhost:5000
```

### Frontend
```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev                # http://localhost:3000
```

### Make yourself an admin
Email/password signup and Google Sign-In both create `role: "user"` by default — nobody can self-promote to admin through the app (by design). Flip your own role directly in the database:

**MongoDB Compass:** connect → your database → `users` collection → find your document → edit `role` to `"admin"` → save.

**mongosh:**
```javascript
use nexus2025
db.users.updateOne({ email: "you@example.com" }, { $set: { role: "admin" } })
```

Then **log out and log back in** — the role is baked into the JWT at login time, so an existing session won't pick up the change until you re-authenticate. The Admin Dashboard link then appears in the navbar.

---

## Setup & Run (Docker)

```bash
# repo root
cp .env.example .env       # JWT_SECRET, GOOGLE_CLIENT_ID, EMAIL_USER, EMAIL_PASS
docker compose up --build
```

This starts MongoDB, the backend, and the frontend together. Visit `http://localhost:3000`.

```bash
docker compose down          # stop
docker compose down -v       # stop and wipe the database volume
docker compose logs -f backend
```

> `NEXT_PUBLIC_*` variables are baked into the frontend at **build time**. If you change them, rebuild (`docker compose up --build`) rather than just restarting.

---

## Testing

```bash
cd backend
npm run lint
npm test
```

Backend integration tests (Jest + Supertest + an in-memory MongoDB instance, no real database needed) cover: auth (signup/login/duplicate/weak-password), cart/bookings, ticket capacity and sold-out enforcement (including the admin bypass), waitlist, speakers CRUD, schedule CRUD, checkout/payment, and the admin routes (stats accuracy, admin-order exclusion, refunds, user deletion, authorization on every admin endpoint).

```bash
cd frontend
npm run lint
npm run build
```

---

## CI/CD

`.github/workflows/ci.yml` runs on every push/PR to `main`:
1. **Backend job** — install, lint, test
2. **Frontend job** — install, lint, build

A failing lint/test/build blocks the PR from looking green (pair with a branch protection rule requiring the check to pass before merge).

---

## Admin Route Reference

All routes below require `requireAuth` + `requireAdmin` unless noted otherwise.

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/admin/stats` | Revenue, sales, refund totals, 14-day trend/daily charts |
| GET | `/api/admin/orders` | All paid + refunded orders |
| POST | `/api/admin/orders/:id/refund` | Refund a paid order |
| GET | `/api/admin/users` | All users |
| DELETE | `/api/admin/users/:id` | Delete a user (not self) |
| GET / POST / PATCH / DELETE | `/api/speakers` | Speaker CRUD (GET is public) |
| GET / POST / PATCH / DELETE | `/api/schedule` | Schedule day/event CRUD (GET is public) |
| GET | `/api/tickets/availability` | Public — live sold/remaining per tier |
| PATCH / DELETE | `/api/tickets/capacity/:tier` | Set/clear a tier's sell limit |
| POST | `/api/tickets/scan` | Validate + check in a ticket code at the gate |
| GET | `/api/waitlist` / DELETE `/api/waitlist/:id` | Manage the waitlist |
| GET | `/api/audit` | Admin action history |

---

## Known Limitations / Next Steps

- **Payment** is a mock flow — no real card is charged. Stripe was integrated and tested but reverted because Stripe doesn't support Sri Lanka; a production deployment needs PayHere (or another regionally supported processor) wired into `paymentController.js` in place of the mock logic.
- No multi-event support yet — the whole app is hardcoded to a single "NEXUS 2025" event.
- No promo codes / discount coupons.
- No venue-details or reviews/testimonials admin management (those sections are still static on the landing page).
- No multiple-admin permission levels (all admins currently have identical, full access).
- No login/signup rate limiting yet (recommended: `express-rate-limit` on `/api/auth/*`).
- No dark/light theme toggle (the site is dark-mode only by design).