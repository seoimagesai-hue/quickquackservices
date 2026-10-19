# Quick Quack Services — Architecture & Implementation Checklist

## Brand / legal identity
- **Website name:** Quick Quack Services
- **Legal name:** QUICK QUACK SERVICES LTD (16457419)
- **Domain:** https://quickquackservices.store
- **Tagline:** Book appointments that run themselves
- **Primary:** #6366F1 · **Secondary:** #06B6D4 · **Accent:** #8B5CF6 · **Dark:** #0F172A · **BG:** #F8FAFC
- Config: `src/config/brand.ts`

## Stack
Next.js App Router · TypeScript · MongoDB/Mongoose · Auth.js · Stripe · Resend/SMTP · Tailwind v4 · shadcn-style UI · Framer Motion · Recharts · Playwright · Vitest

## Multi-tenant model
- Every business document keyed by `businessId`
- Membership via `BusinessMember` (owner | staff)
- Server-side authorization only — never trust client roles/business IDs
- Public booking at `/book/[businessSlug]`
- Categories: salon, barber, plumbing, hvac, cleaning, consulting, repair, other
- On-site businesses collect service address + category intake fields; travel buffers apply to slot calc

## Key modules
1. Auth (credentials + email verify + password reset)
2. Onboarding (business profile → services → staff → hours → booking link)
3. Booking engine (slot calc + BookingHold + atomic confirm)
4. Dashboard CRUD (services, staff, customers, appointments, settings)
5. Stripe subscriptions + optional deposits
6. Transactional email + reminder cron
7. Platform admin

## Implementation checklist
- [x] Scaffold + design system
- [x] MongoDB schemas + connection
- [x] Auth + RBAC + rate limits
- [x] Public marketing pages
- [x] Dashboard + onboarding
- [x] Booking engine
- [x] Stripe + email + admin
- [x] Legal/cookies + tests + docs

## Verification (latest)
- `npm test` — Vitest slot + AuthError tests
- `npm run typecheck` / production `npm run build` — pass with `AUTH_SECRET` + `MONGODB_URI` set
- Playwright e2e — requires running app + seeded MongoDB (not claimed green without execution)
