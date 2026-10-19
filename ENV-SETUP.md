# Environment setup — Quick Quack Services

Copy `.env.example` → `.env.local`, then fill values below.  
**Never commit `.env.local`.** Restart `npm run dev` after every change.

---

## 1. Required (app will not work without these)

### `NEXT_PUBLIC_APP_URL`
- **Local:** `http://localhost:3000` (or `3001` if that port is used)
- **Production:** `https://quickquackservices.store`
- Used for auth callbacks, emails, sitemap, absolute links

### `AUTH_SECRET`
- Session encryption for Auth.js
- **How to generate (PowerShell):**
  ```powershell
  node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
  ```
- Paste the output as `AUTH_SECRET=...`

### `MONGODB_URI`
- **Where:** [MongoDB Atlas](https://cloud.mongodb.com) → your project → **Database** → **Connect** → **Drivers** → Node.js
- Copy the connection string
- Replace `<password>` with the DB user password (URL-encode special characters)
- Add database name: `...mongodb.net/appointly?retryWrites=true&w=majority`
- **Network Access:** Atlas → Network Access → Add IP (your IP or `0.0.0.0/0` for local testing)
- **If you see `querySrv ENODATA`:** use the **standard** connection string (not `mongodb+srv`), with shard hosts listed under Connect → Drivers

---

## 2. Email (optional for local; needed for real verification / booking emails)

Pick **one**: Resend **or** SMTP.

### Option A — Resend
1. Sign up: [https://resend.com](https://resend.com)
2. API Keys → create key → `RESEND_API_KEY=re_...`
3. Domain → add `quickquackservices.store` → set DNS (SPF/DKIM) as shown
4. Set:
   ```
   EMAIL_FROM=Quick Quack Services <noreply@quickquackservices.store>
   EMAIL_FROM_ADDRESS=noreply@quickquackservices.store
   ```

### Option B — SMTP (Gmail / Microsoft 365 / other)
```
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASS=app-password
EMAIL_FROM=Quick Quack Services <noreply@quickquackservices.store>
```

### Public contact addresses (already set in brand; override if needed)
```
NEXT_PUBLIC_SUPPORT_EMAIL=support@quickquackservices.store
NEXT_PUBLIC_INFO_EMAIL=info@quickquackservices.store
NEXT_PUBLIC_BILLING_EMAIL=billing@quickquackservices.store
NEXT_PUBLIC_CONTACT_EMAIL=contact@quickquackservices.store
```
These are **proposed** mailboxes until DNS + mailbox hosting is live.

---

## 3. Stripe (optional until billing go-live)

1. [https://dashboard.stripe.com](https://dashboard.stripe.com) → Developers → API keys  
   - `STRIPE_SECRET_KEY=sk_test_...`  
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...`
2. Products → create Starter / Professional / Business (monthly + yearly)  
   - Copy each Price ID → `STRIPE_PRICE_STARTER_MONTHLY=price_...` (and the other five)
3. Developers → Webhooks → Add endpoint  
   - URL: `https://quickquackservices.store/api/stripe/webhook`  
   - Secret → `STRIPE_WEBHOOK_SECRET=whsec_...`  
   - Local test: Stripe CLI `stripe listen --forward-to localhost:3000/api/stripe/webhook`

---

## 4. Cron / reminders (optional)

```
CRON_SECRET=long-random-string
```
Generate like `AUTH_SECRET`.  
Vercel Cron (or similar) calls `/api/cron/reminders` with header:  
`Authorization: Bearer <CRON_SECRET>`

---

## 5. SMS (optional)

```
SMS_PROVIDER=twilio
SMS_API_KEY=...
SMS_FROM=+44...
```
From [Twilio](https://www.twilio.com) (or your provider). Leave empty if unused.

---

## 6. File uploads (optional — booking form file fields)

S3-compatible (AWS S3, Cloudflare R2, MinIO):
```
S3_BUCKET=
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
S3_ENDPOINT=          # R2/MinIO; leave empty for AWS + set AWS_REGION
AWS_REGION=eu-west-2
UPLOAD_MAX_BYTES=5242880
UPLOAD_ALLOWED_TYPES=image/jpeg,image/png,application/pdf
```

---

## 7. Seed / demo only (local)

```
SEED_ADMIN_EMAIL=admin@example.com
SEED_ADMIN_PASSWORD=strong-password
SEED_DEMO_PASSWORD=DemoPass123!
```
Then: `npm run seed`

---

## Minimum local checklist

1. `AUTH_SECRET` generated  
2. `MONGODB_URI` working (Atlas Network Access open)  
3. `NEXT_PUBLIC_APP_URL` matches the URL in the browser  
4. `npm run dev` restarted  

Email + Stripe can stay empty; the app shows **unconfigured** states instead of fake success.
