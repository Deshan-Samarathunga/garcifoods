const production = process.env.NODE_ENV === "production";

export const env = {
  isProduction: production,
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
  hasTurnstileSiteKey: Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY),
  hasTurnstileSecret: Boolean(process.env.TURNSTILE_SECRET_KEY),
  contactToEmail: process.env.CONTACT_TO_EMAIL ?? "info@garcifoods.com",
  resendApiKey: process.env.RESEND_API_KEY,
  resendFromEmail: process.env.RESEND_FROM_EMAIL,
  postmarkServerToken: process.env.POSTMARK_SERVER_TOKEN,
  postmarkFromEmail: process.env.POSTMARK_FROM_EMAIL,
  turnstileSiteKey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
  turnstileSecretKey: process.env.TURNSTILE_SECRET_KEY,
  sentryDsn: process.env.SENTRY_DSN,
  sentryClientDsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  nextAuthSecret: process.env.NEXTAUTH_SECRET,
  nextAuthUrl: process.env.NEXTAUTH_URL,
  upstashUrl: process.env.UPSTASH_REDIS_REST_URL,
  upstashToken: process.env.UPSTASH_REDIS_REST_TOKEN,
} as const;
