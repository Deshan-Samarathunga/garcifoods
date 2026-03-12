# Garci Foods

Garci Foods is now a Next.js App Router application with a backend layer for products, inquiries, and admin product management. GitHub is the source of truth, GitHub Actions is the CI validation layer, and the public contact flow is email-only.

## Current stack

- Next.js App Router + TypeScript
- PostgreSQL + Prisma
- Auth.js for admin authentication
- Resend or Postmark for inquiry email delivery
- Zod for request validation
- Cloudflare Turnstile for bot protection
- Upstash-compatible rate limiting
- Sentry instrumentation
- GitHub Actions for CI and standalone artifact builds

## What is in this repo

- Public marketing routes under `app/*`
- Public APIs under `app/api/products/*` and `app/api/contact`
- Protected admin UI under `app/admin/*`
- Protected admin product APIs under `app/api/admin/products/*`
- Prisma schema, migration, and seed files under `prisma/*`
- Legacy static HTML/CSS/JS files kept for migration reference

## Contact flow

The production contact path is email-only:

1. The user submits the Next.js contact form.
2. `POST /api/contact` validates the payload with Zod.
3. The inquiry is saved to PostgreSQL.
4. A notification email is sent to the configured inbox.
5. Turnstile and rate limiting protect the endpoint.

## Local development

1. Install dependencies:
   ```bash
   npm ci
   ```
2. Create your local environment file from `.env.example`.
3. Generate the Prisma client:
   ```bash
   npm run db:generate
   ```
4. Apply migrations against a PostgreSQL database:
   ```bash
   npm run db:migrate
   ```
5. Seed the initial admin user if needed:
   ```bash
   npm run db:seed
   ```
6. Start the app:
   ```bash
   npm run dev
   ```

## CI/CD

- `.github/workflows/ci.yml` runs install, Prisma generate, typecheck, lint, tests, and production build.
- `.github/workflows/self-hosted-standalone.yml` builds and uploads the standalone deployment artifact.
- Vercel is the preferred runtime host; a self-hosted standalone deployment path is also supported.

## Key docs

- `docs/architecture/nextjs-backend-recommendation.md`
- `docs/deployment/vercel.md`
- `docs/deployment/self-hosted-standalone.md`
- `docs/migration/phase-1-route-map.md`
