<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# WedPlan — Client Project Guide

## What this project is

WedPlan is a wedding-planning platform with three audiences:

- **Customers** discover wedding-related services, browse vendors, and request bookings.
- **Vendors** create profiles, publish wedding services, and manage incoming booking requests. They can upgrade to a **Premium** subscription to publish unlimited services and get promotional benefits.
- **Admins** manage users, review published services, and monitor platform transactions.

This repository is the **frontend client** only (`wedplan-client`). There is no backend, database, auth provider, or data layer wired up yet — all data-driven features still need to be built.

## Current state

The repo is an early scaffold:

- `src/app/page.tsx` (the `/` landing page) renders the responsive animated `Hero` from `src/components/shared/hero.tsx` (built with the `motion` package and brand tokens).
- `src/app/layout.tsx` sets fonts, metadata, `ThemeProvider`, and the global `Navbar` / `Footer` (from `Footer.tsx`).
- `src/components/shared/Navbar.tsx` renders the global navbar (brand, Home/Browse Services, theme toggle). Auth-dependent UI lives in `auth-nav.tsx` (desktop profile dropdown) and `MobileNav.tsx` (mobile menu); both use `authClient.useSession()` so the navbar updates immediately on sign-in/sign-out.
- `src/app/(public)/sign-up/page.tsx` and `src/app/(public)/sign-in/page.tsx` render responsive auth flows (email/password + Google) via their forms in `src/components/shared/`. `src/app/api/post-login/route.ts` resolves the session role and redirects vendors to `/dashboard`, customers to `/`.
- shadcn "base-nova" UI primitives live in `src/components/ui/` (button, input, label, field, radio-group, card, alert, separator, dropdown-menu, avatar, badge) on top of `@base-ui/react`. Animation uses the `motion` package (`motion/react`) — the current name for framer-motion.
- `src/lib/auth.ts` configures better-auth with MongoDB, custom user fields (`role`, `businessName`, `isBlocked`, `subscriptionPlan`, `subscriptionExpiresAt`), password rules, and role/admin safeguards.
- Full light/dark design tokens and reusable brand classes exist in `src/app/globals.css`, and are used by the navbar and sign-up flow.

## Tech stack

| Area | Choice |
| --- | --- |
| Framework | Next.js `16.4.6` (App Router, `src/` directory) |
| React | `19.3.0` (React Compiler enabled) |
| Language | TypeScript (strict, `@/*` → `./src/*`) |
| Styling | Tailwind CSS `4.3.3` via `@tailwindcss/turbopack` loader, `tw-animate-css`, `shadcn/tailwind.css` |
| UI components | shadcn CLI (`style: "base-nova"`) + `@base-ui/react` primitives; icons from `lucide-react` |
| Theming | `next-themes` (class-based dark mode) |
| Class helper | `cn` from the `cn` npm package, re-exported by `src/lib/utils.ts` |
| Fonts | `next/font/google`: `Playfair_Display` (`--font-heading`) and `Inter` (`--font-body`) |
| Lint | ESLint 9 flat config (`eslint-config-next/core-web-vitals` + `/typescript`) |

`next.config.ts` enables `cacheComponents: true`, `partialPrefetching: true`, and `reactCompiler: true`, plus a Turbopack rule that runs all `*.css` through `@tailwindcss/turbopack`. Do not remove those flags without a deliberate migration.

## Directory structure

```
src/
├── app/
│   ├── (public)/
│   │   ├── profile/
│   │   │   └── page.tsx        # Profile settings page
│   │   ├── sign-in/
│   │   │   └── page.tsx        # Responsive sign-in page
│   │   └── sign-up/
│   │       └── page.tsx        # Responsive sign-up page
│   ├── api/
│   │   ├── auth/[...all]/route.ts  # better-auth handler
│   │   ├── post-login/route.ts     # Role-based post-login redirect
│   │   └── upload-image/route.ts   # ImgBB image upload
│   ├── globals.css        # Tailwind layers, design tokens, brand utility classes
│   ├── icon.png
│   ├── layout.tsx         # Root layout (fonts, metadata, ThemeProvider, Navbar)
│   └── page.tsx           # Landing page (currently empty)
├── components/
│   ├── providers/
│   │   └── theme-provider.tsx  # Local next-themes wrapper (used by layout)
│   ├── shared/
│   │   ├── Navbar.tsx          # Global navigation shell
│   │   ├── Footer.tsx          # Global footer (brand, links, contact, socials)
│   │   ├── hero.tsx            # Client component: animated landing hero (motion)
│   │   ├── auth-nav.tsx        # Client component: desktop auth UI + profile dropdown
│   │   ├── MobileNav.tsx       # Client component: responsive auth-aware menu
│   │   ├── sign-in-form.tsx    # Client component: email/password + Google sign-in
│   │   ├── sign-up-form.tsx    # Client component: email/password + Google sign-up
│   │   └── theme-toggle.tsx    # Client component: light/dark switch
│   └── ui/
│       ├── button.tsx          # shadcn/base-nova Button primitive
│       └── ...                 # input, label, field, radio-group, card, alert, separator, dropdown-menu, avatar
└── lib/
    ├── auth.ts                 # better-auth server config + security hooks
    ├── auth-client.ts          # better-auth React client
    └── utils.ts                # re-exports `cn` from the `cn` package
src/hooks/
└── use-sign-out.ts             # Shared client hook: sign out + redirect home
public/
└── logo.png
```

## Architecture and conventions

### Routing and rendering

- Use the **App Router**: routes are folders in `src/app` with `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `route.ts`, etc.
- Pages and layouts are **Server Components by default**. Add `"use client"` only to files that need state, effects, event handlers, browser APIs, or custom hooks (e.g. `theme-toggle.tsx`). Keep client boundaries small — put the directive on the smallest interactive component, not on whole layouts/pages.
- Route props are typed with the globally generated helpers `PageProps<'/path'>` and `LayoutProps<'/path'>` (no import needed; generated by `next dev`/`next build`/`next typegen`). `src/app/layout.tsx` already uses `LayoutProps<"/">`.
- In this version `params` and `searchParams` are **Promises** — `await` them in async Server Components (`const { slug } = await params`). Use the `searchParams` prop for data loading on the server; use `useSearchParams()` only for client-only filtering.
- Use `next/link` (`<Link>`) for internal navigation and `next/image` (`<Image>`) for images.
- For auth/redirect/rewrite logic use `proxy.ts` at the `src/` level — **Middleware was renamed to Proxy in Next.js 16**. Only one `proxy.ts` is allowed; keep it thin and move logic into imported modules.

### Data, caching, and mutations (when wiring the backend)

- Fetch in Server Components (async `fetch`, ORM, or DB client); keep secrets and credentials server-side. Only `NEXT_PUBLIC_`-prefixed env vars reach the client. Use `import 'server-only'` in server-only modules to prevent accidental client imports.
- `fetch` is not cached by default. With `cacheComponents: true`, use the `use cache` directive (paired with `cacheLife(...)`) for cacheable data/UI, and `<Suspense>` + `loading.tsx` to stream fresh data. Use `revalidateTag`/`revalidatePath` after mutations.
- Mutations use Server Functions / Server Actions (`"use server"`), typically via `<form action={...}>` or `startTransition`. **Always re-check auth and ownership inside every Server Function** — they are reachable by direct POST, not just via the UI.
- API endpoints belong in `app/api/**/route.ts` (Web `Request`/`Response`). A `route.ts` cannot live at the same segment level as a `page.tsx`.
- Planned feature slices for the domain: customer discovery/booking requests, vendor profiles + service publishing + request management, Premium subscription/entitlements, admin user/service moderation, and transaction monitoring. Add `loading.tsx` and `error.tsx` for each data-heavy route group.

### Styling and theming

- **Required for every feature:** When building any feature or UI, use **shadcn UI** components and the **brand colors from `src/app/globals.css`**. Generate primitives with the shadcn CLI into `src/components/ui/` and compose them in `src/components/shared/`. Style with the brand tokens (`--brand`, `--brand-hover`, `--brand-soft`, `--page-background`, `--surface`, `--text-primary`, etc.) and the existing reusable classes — do not hand-roll custom UI primitives or introduce hardcoded colors.
- Tailwind v4 is CSS-first: global styles, tokens, and custom classes live in `src/app/globals.css`. There is no `tailwind.config` file — `components.json` points Tailwind at `src/app/globals.css`.
- Color tokens are HSL channel values (e.g. `--primary: 340.7 25.2% 43.5%`) used as `hsl(var(--primary))`; shadcn-style semantic names (`--background`, `--card`, `--muted`, `--border`, `--ring`, chart/sidebar tokens, etc.) are defined for both `:root` and `.dark`.
- WedPlan brand tokens are plain CSS colors (`--brand`, `--brand-hover`, `--brand-soft`, `--surface`, `--surface-muted`, `--text-primary`, `--text-secondary`, `--page-background`) with matching light/dark values. Prefer these and the existing reusable classes in `@layer components`: `.brand-button`, `.brand-outline-button`, `.theme-card`, `.muted-text`.
- Headings use the `--font-heading` family (Playfair Display) and body text uses `--font-body` (Inter); both are injected as CSS variables by `next/font` in the root layout. Add new fonts via `next/font` in `layout.tsx`, not by importing remote CSS.
- Compose class names with `cn` from `@/lib/utils` — do not hand-roll `clsx`/`tailwind-merge` logic.
- Generate new UI primitives with the shadcn CLI using the existing `components.json` (`base-nova` style, `@base-ui/react` primitives, `lucide` icons). Generated components go in `src/components/ui/`; app-specific composition goes in `src/components/shared/`.

## Common workflows

```bash
npm run dev     # dev server at http://localhost:3000
npm run build   # production build (also runs type checking)
npm run start   # serve a production build
npm run lint    # ESLint
```

Before writing Next.js code, consult `node_modules/next/dist/docs/01-app/` for the current API (especially `05-server-and-client-components.md`, `03-layouts-and-pages.md`, `06-fetching-data.md`–`09-revalidating.md`, `15-route-handlers.md`, and `16-proxy.md`).

## Known rough edges to be aware of

- `src/app/layout.tsx` uses the local wrapper at `src/components/providers/theme-provider.tsx`, which sets `attribute="class"` so the `.dark` tokens in `globals.css` apply. Keep `suppressHydrationWarning` on `<html>` — next-themes adds the class after hydration.
- `src/app/globals.css` maps Tailwind's `--font-sans` / `--font-serif` to the `next/font` variables (`--font-body` / `--font-heading`) inside `@theme inline`, and a custom `@utility font-heading` keeps shadcn headings in Playfair Display. Don't redeclare `--font-heading` inside `@theme inline` — it would shadow the `next/font` variable.
- Because semantic tokens are HSL channel values (`--card: 0 0% 100%`), every `--color-*` entry inside `@theme inline` MUST be wrapped in `hsl(var(--token))`. Mapping them to bare `var(--token)` makes `bg-card`, `bg-popover`, `border-border`, `text-muted-foreground`, etc. emit invalid CSS and render unstyled. Also keep `--radius` defined in `:root` — `rounded-lg`/`rounded-md` resolve from it.
- `src/components/shared/theme-toggle.tsx` has an ESLint suppression for `react-hooks/set-state-in-effect` (the `mounted` guard that avoids hydration mismatch); keep that guard when modifying the toggle.
- No test runner or test scripts are configured. Add one deliberately if tests are required.
