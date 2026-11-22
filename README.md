# WedPlan — Client

[![Next.js](https://img.shields.io/badge/Next.js-16.4.6-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.3-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.3-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Better Auth](https://img.shields.io/badge/Auth-Better%20Auth-7c3aed)](https://www.better-auth.com/)
[![Stripe](https://img.shields.io/badge/Payments-Stripe-635bff?logo=stripe)](https://stripe.com/)

The frontend for **WedPlan**, a wedding-planning marketplace connecting couples with wedding vendors. It is built with the Next.js App Router, React Server Components, shadcn/base-ui components, Better Auth, and a separate Express API.

| Resource | Link |
| --- | --- |
| 🚀 Live application | [wedplan-client-eta.vercel.app](https://wedplan-client-eta.vercel.app) |
| 📦 Source code | [github.com/codeby-fahim/wedplan-client](https://github.com/codeby-fahim/wedplan-client.git) |
| 🔧 API server | [wedplan-server-kohl.vercel.app](https://wedplan-server-kohl.vercel.app) |
| 📦 API source | [github.com/codeby-fahim/wedplan-server](https://github.com/codeby-fahim/wedplan-server.git) |

---

## Features

- **Public browsing** — search, category and location filters, plus price sorting on approved wedding services
- **Service details** — image gallery, vendor information, and authenticated booking requests
- **Authentication** — email/password and Google OAuth via Better Auth, with role-based redirects
- **Vendor dashboard** — service CRUD, availability management, booking requests, subscription plans, and Stripe Checkout
- **Customer dashboard** — booking overview, request history, cancellation of pending requests, and profile settings
- **Admin dashboard** — platform statistics, user management (block/unblock), service moderation, and read-only transaction records
- **Premium subscriptions** — free plan limited to 3 services; Premium unlocks unlimited listings
- **Photo uploads** — image files uploaded to ImgBB through a validated server route handler
- **UX** — responsive layouts, motion animations, skeleton loaders, toast notifications, and graceful error states

---

## Tech stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 16 (App Router, Cache Components, Turbopack) |
| UI | React 19, Tailwind CSS 4, shadcn (base-nova), @base-ui/react, lucide-react |
| Animation | Motion (`motion/react`) |
| Auth | Better Auth with MongoDB adapter and JWT plugin |
| Database | MongoDB Atlas (shared with the API) |
| Payments | Stripe Checkout + signed webhooks |
| Notifications | Sonner |
| Validation | Zod (via Better Auth) and server-side route validation |

---

## Project structure

```
src/
├── app/
│   ├── (public)/            # sign-in, sign-up, profile redirect
│   ├── (dashboard)/         # role-protected dashboard layouts and pages
│   │   └── dashboard/
│   │       ├── vendor/      # overview, services, bookings, subscription, profile
│   │       ├── customer/    # overview, bookings, profile
│   │       └── admin/       # overview, users, services, transactions, profile
│   ├── api/
│   │   ├── auth/[...all]/   # Better Auth handler
│   │   ├── post-login/      # role-aware OAuth landing
│   │   └── upload-image/    # validated ImgBB proxy
│   ├── services/[id]/       # public service details
│   └── layout.tsx           # fonts, theme, navbar, footer, toaster
├── components/
│   ├── shared/              # auth, dashboard, forms, lists, states
│   ├── home/                # homepage sections
│   ├── providers/           # theme provider
│   └── ui/                  # shadcn primitives
├── lib/
│   ├── api/                 # typed Express API clients
│   ├── auth.ts              # Better Auth configuration
│   ├── auth-client.ts       # browser auth client
│   ├── dashboard.ts         # server-side role guards
│   └── ...
├── hooks/                   # sign-out hook
├── proxy.ts                 # optimistic dashboard cookie gate
└── scripts/seed-admin.mjs   # admin bootstrap utility
```

> Authoritative role checks happen in `src/lib/dashboard.ts` inside Server Components. `proxy.ts` is only an optimistic first gate.

---

## Getting started

### Prerequisites

- Node.js 20+
- A MongoDB Atlas cluster
- A Google OAuth client (optional, for Google sign-in)
- An ImgBB API key
- A Stripe account in test mode (optional, for Premium checkout)

### 1. Install

```bash
git clone https://github.com/codeby-fahim/wedplan-client.git
cd wedplan-client
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

| Variable | Description |
| --- | --- |
| `MONGODB_URL` | MongoDB connection string (same database as the API) |
| `BETTER_AUTH_SECRET` | Long random secret used to sign session cookies |
| `BETTER_AUTH_URL` | **This client's** origin — no trailing slash |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth credentials |
| `IMGBB_API_KEY` | Server-only ImgBB key used by `/api/upload-image` |
| `NEXT_PUBLIC_API_URL` | Public URL of the Express API |
| `JWT_ISSUER` / `JWT_AUDIENCE` | Must match the API server values |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Used only by `npm run seed:admin` |

### 3. Start the API

The client depends on the [WedPlan server](https://github.com/codeby-fahim/wedplan-server.git). Run it on `http://localhost:5000` or point `NEXT_PUBLIC_API_URL` at the deployed API.

### 4. Run the client

```bash
npm run dev     # http://localhost:3000
```

---

## Admin account

Public registration can only create `vendor` and `customer` accounts. To create an admin:

```bash
ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD='StrongPass123' npm run seed:admin
```

The script refuses to run with missing credentials or to promote an existing non-admin account. Sign in at `/sign-in` with those credentials.

---

## Stripe sandbox setup

1. Create a recurring **test-mode** Price in Stripe.
2. Set `STRIPE_SECRET_KEY`, `STRIPE_PREMIUM_PRICE_ID`, and `STRIPE_WEBHOOK_SECRET` on the **API server**.
3. Register a webhook pointing to `https://<api-domain>/webhooks/stripe` for:
   - `checkout.session.completed`
   - `customer.subscription.deleted`
   - `customer.subscription.updated`
   - `invoice.payment_failed`
4. The webhook secret must come from that Dashboard endpoint — not from a temporary `stripe listen` session.

Premium is activated only after a verified Stripe event or server-side session verification. The browser redirect alone never changes a plan.

---

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Production build with type checking |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |
| `npm run seed:admin` | Create or reset the admin account from env vars |

---

## Deployment

Deploy to Vercel with all environment variables configured. Remember:

- `BETTER_AUTH_URL` and `CLIENT_URL` (on the API) must be the **client** origin.
- `NEXT_PUBLIC_*` variables are baked at build time — redeploy after changing them.
- `BETTER_AUTH_SECRET` must be identical across every serverless invocation.
- MongoDB Atlas must allow connections from Vercel (`0.0.0.0/0`).

---

## Security notes

- JWTs are verified by the API using JWKS from `${BETTER_AUTH_URL}/api/auth/jwks`, with pinned issuer, audience and algorithm.
- All private API routes re-check authentication, role and resource ownership on the server.
- Profile updates cannot modify role, subscription, or blocked status — those fields are stripped server-side.
- Image uploads validate MIME type, magic bytes, and size, and are rate-limited.
- Payment records are read-only to admins and can only be created/confirmed from verified Stripe data.

---

## License

MIT — built for demonstration and evaluation purposes.
