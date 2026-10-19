# Appointly — Final Implementation Progress

Updated as work proceeds. Resume from the first incomplete item.

## Foundation
- [x] Next.js / TypeScript / Tailwind / MongoDB / Auth
- [x] Multi-tenant isolation, roles, admin
- [x] Marketing pages, legal drafts, cookie consent
- [x] Category presets + on-site booking fields
- [x] Atomic booking engine (holds + confirm)

## Completed in this pass
- [x] Universal custom category (free-text) + country on registration
- [x] Service location: premises / customer / online / custom
- [x] BookingForm model + visual form builder (`/dashboard/forms`)
- [x] Public booking wizard renders dynamic forms + server `validateFormAnswers`
- [x] BookingFormSubmission persisted on confirm
- [x] Polished multi-step onboarding (8 steps)
- [x] Calendar day/week/month + staff filter
- [x] File upload config gate (`src/lib/storage/uploads.ts`) + `.env.example`
- [x] Form validation unit tests

## Remaining / verify locally
- [ ] Expand Playwright e2e against a test MongoDB (not production)
- [ ] Wire signed S3 PutObject URLs when `S3_*` credentials exist
- [x] README / `.env.example` refreshed for forms + object storage
- [x] Ran: `npm test` (15 passed), `npm run lint` (clean), `npm run build` (success)

## Blocked without credentials
- Live Stripe checkout (keys)
- Live email delivery (Resend/SMTP)
- Object storage uploads (S3/R2) — config gate implemented; signed upload helper needs credentials
- Full Playwright e2e against real MongoDB Atlas
