# Backup & recovery

## MongoDB Atlas

1. Enable **Cloud Backup** (or Continuous Backup) on the Atlas cluster.
2. Schedule daily snapshots; retain at least 7–30 days for production.
3. Test restore into a non-production cluster quarterly.

## Critical collections

Prioritize: `users`, `businesses`, `businessmembers`, `appointments`, `customers`, `subscriptions`, `payments`, `stripewebhookevents`.

## Application secrets

Store `AUTH_SECRET`, Stripe keys, MongoDB URI, and `CRON_SECRET` in a secrets manager (Vercel env + offline backup). Rotate after any exposure.

## Recovery steps

1. Restore Atlas snapshot to a new cluster (or point-in-time).
2. Point `MONGODB_URI` at the restored cluster.
3. Redeploy the Next.js app on Vercel with env vars intact.
4. Verify Auth login, a sample booking, and Stripe webhook delivery.
5. Re-run reminder cron once and confirm no duplicate sends (dedupe via `reminderEmailSentAt`).
