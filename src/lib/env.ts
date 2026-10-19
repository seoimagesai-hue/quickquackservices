/**
 * Server-side environment helpers.
 * Never hardcode secrets. Missing providers surface as unconfigured.
 */

function optional(key: string): string | undefined {
  const value = process.env[key]?.trim();
  return value || undefined;
}

function requiredInProduction(key: string): string | undefined {
  const value = optional(key);
  if (!value && process.env.NODE_ENV === "production") {
    console.warn(`[env] Missing required production env: ${key}`);
  }
  return value;
}

export const env = {
  appUrl: optional("NEXT_PUBLIC_APP_URL") || "http://localhost:3000",
  mongodbUri: optional("MONGODB_URI"),
  authSecret: optional("AUTH_SECRET") || optional("NEXTAUTH_SECRET"),
  resendApiKey: optional("RESEND_API_KEY"),
  emailFrom:
    optional("EMAIL_FROM") ||
    `Quick Quack Services <${optional("EMAIL_FROM_ADDRESS") || "noreply@quickquackservices.store"}>`,
  supportEmail:
    optional("NEXT_PUBLIC_SUPPORT_EMAIL") || "support@quickquackservices.store",
  contactEmail:
    optional("NEXT_PUBLIC_CONTACT_EMAIL") || "contact@quickquackservices.store",
  billingEmail:
    optional("NEXT_PUBLIC_BILLING_EMAIL") || "billing@quickquackservices.store",
  infoEmail:
    optional("NEXT_PUBLIC_INFO_EMAIL") || "info@quickquackservices.store",
  smtp: {
    host: optional("SMTP_HOST"),
    port: optional("SMTP_PORT") ? Number(process.env.SMTP_PORT) : undefined,
    user: optional("SMTP_USER"),
    pass: optional("SMTP_PASS"),
  },
  stripe: {
    secretKey: optional("STRIPE_SECRET_KEY"),
    webhookSecret: optional("STRIPE_WEBHOOK_SECRET"),
    publishableKey: optional("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"),
  },
  sms: {
    provider: optional("SMS_PROVIDER"),
    apiKey: optional("SMS_API_KEY"),
    from: optional("SMS_FROM"),
  },
  cronSecret: optional("CRON_SECRET"),
  isStripeConfigured: () => Boolean(optional("STRIPE_SECRET_KEY")),
  isEmailConfigured: () =>
    Boolean(optional("RESEND_API_KEY") || optional("SMTP_HOST")),
  isSmsConfigured: () =>
    Boolean(optional("SMS_PROVIDER") && optional("SMS_API_KEY")),
  isDbConfigured: () => Boolean(optional("MONGODB_URI")),
};

export function assertAuthSecret() {
  const secret = requiredInProduction("AUTH_SECRET") || env.authSecret;
  if (!secret) {
    throw new Error(
      "AUTH_SECRET is required. Generate one with: openssl rand -base64 32"
    );
  }
  return secret;
}
