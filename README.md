# Quick Quack Services

Multi-tenant appointment booking SaaS for service businesses (salons, consultants, coaches, tutors, wellness studios).

**Legal entity:** QUICK QUACK SERVICES LTD (Company No. 16457419), registered office 70 Larch Crescent, Hayes, England, UB4 9DR.  
**Production domain:** https://quickquackservices.store  
Brand and contact config: `src/config/brand.ts`.

## Stack

Next.js (App Router) · TypeScript · MongoDB/Mongoose · Auth.js · Stripe · Resend/SMTP · Tailwind CSS · Framer Motion · Recharts · Playwright · Vitest

## Features

- Public marketing site (home, features, pricing, FAQ, legal, contact)
- Secure auth: register, login, email verify, password reset, RBAC
- Multi-tenant businesses with slug booking pages `/book/[slug]`
- Real booking engine with buffers, holidays, holds, and atomic confirmation
- Business dashboard: services, staff, customers, calendar, booking forms, settings, billing
- Visual booking form builder with server-side answer validation
- Universal categories (presets + custom) and service locations (premises / on-site / online / custom)
- Platform admin dashboard
- Stripe subscriptions + optional deposits (when keys configured)
- Transactional email + reminder cron (when provider configured)
- File uploads via S3-compatible storage (when configured; never stored in MongoDB)
- Cookie consent with analytics gating

## Quick start

```bash
cp .env.example .env.local
# Set MONGODB_URI and AUTH_SECRET (openssl rand -base64 32)
npm install
npm run dev
```

Optional demo data:

```bash
npm run seed
# Login: demo.owner@appointly.local / DemoPass123!  (or SEED_DEMO_PASSWORD)
# Booking: http://localhost:3000/book/demo-studio
```

## Environment

See `.env.example`. Required for core app:

| Variable | Purpose |
|----------|---------|
| `MONGODB_URI` | MongoDB Atlas connection |
| `AUTH_SECRET` | Auth.js session encryption |
| `NEXT_PUBLIC_APP_URL` | Absolute URLs in emails/links |

Optional providers (app shows **unconfigured** states — never fake success):

- `RESEND_API_KEY` or SMTP_* — transactional email
- `STRIPE_*` — subscriptions and deposits
- `SMS_*` — SMS reminders
- `CRON_SECRET` — protect `/api/cron/reminders`
- `S3_*` / `AWS_REGION` — booking-form file uploads

## Scripts

```bash
npm run dev          # development server
npm run build        # production build
npm run start        # start production server
npm run lint         # ESLint
npm run typecheck    # tsc --noEmit
npm run test         # Vitest unit tests
npm run test:e2e     # Playwright (needs server + DB for full suite)
npm run seed         # demo seed data
```

## Deployment (Vercel + MongoDB Atlas)

1. Create Atlas cluster and allow Vercel IPs (or `0.0.0.0/0` with strong credentials).
2. Import project to Vercel; set env vars from `.env.example`.
3. Add Vercel Cron for `GET /api/cron/reminders` hourly with `Authorization: Bearer $CRON_SECRET`.
4. Stripe webhook → `https://YOUR_DOMAIN/api/stripe/webhook`.
5. Configure Resend/SMTP domain for production email.

## Security notes

- Roles and business IDs are never trusted from the client for authorization.
- Tenant isolation is enforced server-side on every mutation.
- Platform admin is **not** available via public registration (seed or manual DB promotion only).
- No card data is stored; Stripe Checkout / Payment Intents only.
- Legal pages are **draft placeholders**, not legal advice.

## Backup / recovery

- Enable Atlas continuous backup or snapshot schedule.
- Export critical collections periodically (`Business`, `Appointment`, `Customer`, `Subscription`).
- Store `AUTH_SECRET` and Stripe keys in a secrets manager; rotate on incident.

## License

Private / proprietary unless otherwise specified.
