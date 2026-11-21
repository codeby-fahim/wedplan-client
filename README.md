# WedPlan

Wedding-planning platform with a Next.js 16 client and a separate Express API (`wedplan-server`).

## Local setup

```bash
# client
cp .env.example .env
npm install
npm run dev        # http://localhost:3000

# server (in ../wedplan-server)
cp .env.example .env
npm install
npm start          # http://localhost:5000
```

Fill in `.env` on both sides. `JWT_ISSUER` / `JWT_AUDIENCE` must match, and `BETTER_AUTH_URL` / `CLIENT_URL` must point to the **client** origin.

## Admin credentials

Public registration can only create `vendor` and `customer` accounts. To create or reset an admin:

```bash
# client/.env
ADMIN_EMAIL=admin@admin.com
ADMIN_PASSWORD=Admin@123
ADMIN_NAME=WedPlan Admin

npm run seed:admin
```

`ADMIN_EMAIL` and `ADMIN_PASSWORD` are required — the script refuses to run with defaults or promote an existing non-admin account. Then sign in at `/sign-in` with those credentials. On a deployed site, set the same variables in the hosting environment and run the script once against the production database.

## Stripe sandbox

Set `STRIPE_SECRET_KEY`, `STRIPE_PREMIUM_PRICE_ID` and `STRIPE_WEBHOOK_SECRET` on the **server**. Register a webhook for:

- `checkout.session.completed`
- `customer.subscription.deleted`
- `customer.subscription.updated`
- `invoice.payment_failed`

For local testing: `stripe listen --forward-to localhost:5000/webhooks/stripe` and use the printed `whsec_…` as `STRIPE_WEBHOOK_SECRET`. Premium is activated **only** by a verified webhook.

## Deployment

- Deploy the Next.js client to Vercel with all client env vars (including `NEXT_PUBLIC_API_URL` pointing to the public API URL).
- Deploy the Express API to a public HTTPS host (Render, Railway, Fly.io, etc.). It cannot run as a long-lived process on Vercel without conversion.
- Set `CLIENT_URL` and `BETTER_AUTH_URL` on the server to the public client origin — this fixes CORS, JWKS-based JWT verification and Stripe return URLs.
- Ensure all routes are served through the Next.js app so refreshes of `/dashboard/*` and `/services/[id]` resolve correctly (the proxy + server layouts handle auth).
- Never expose `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `IMGBB_API_KEY`, `BETTER_AUTH_SECRET`, `GOOGLE_CLIENT_SECRET` or `MONGODB_URL` to the browser. Only `NEXT_PUBLIC_*` values are public.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run seed:admin` | Create/reset the admin account from env |
