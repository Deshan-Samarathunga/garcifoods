# Self-Hosted Standalone Deployment Path

## Target

This path packages the app as a standalone Node deployment artifact.

## Build locally or in CI

```bash
npm ci
npm run db:generate
npm run build:standalone
```

The packaged output is written to `dist/standalone`.

## What gets packaged

- `.next/standalone`
- `.next/static`
- `public`
- `package.json`

## Start command on the target server

```bash
node server.js
```

Run that command from inside `dist/standalone`.

## Required environment variables

Use the values documented in `.env.example`:

- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `NEXT_PUBLIC_SITE_URL`
- `CONTACT_TO_EMAIL`
- `RESEND_API_KEY` and `RESEND_FROM_EMAIL`, or Postmark fallback credentials
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
- `TURNSTILE_SECRET_KEY`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- Sentry DSNs if monitoring is enabled

## Database rollout

Run the Prisma migration before starting the app:

```bash
npm run db:migrate
npm run db:seed
```

## GitHub Actions pipeline

The workflow in `.github/workflows/self-hosted-standalone.yml` builds the standalone artifact and uploads it for release distribution or deployment automation.

## Runtime notes

- Use a process manager such as `systemd`, `pm2`, or a container runtime.
- Place a reverse proxy such as Nginx or Caddy in front of the Node process.
- Point health checks at `/api/health`.
