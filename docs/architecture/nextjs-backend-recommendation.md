# Next.js Backend Recommendation for Garci Foods

## Current position

The repository is no longer just the original static site.

- The legacy HTML/CSS/JS source still exists for reference.
- The active app is a Next.js App Router project with TypeScript.
- GitHub is the source of truth.
- GitHub Actions is the CI/CD validation layer.
- Contact is email-only.

## Recommended backend architecture

### 1. App and API layer

- Use Next.js App Router and TypeScript.
- Keep UI routes and backend Route Handlers in the same repository.
- Place public and admin APIs under `app/api/*`.

This is already how the current repo is structured.

## 2. Database and ORM

- Use PostgreSQL with Prisma ORM.
- Recommended managed database providers:
  - Neon
  - Supabase Postgres
  - AWS RDS

Current repo status:

- Prisma schema exists in `prisma/schema.prisma`.
- Initial migration exists in `prisma/migrations/20260312_init/migration.sql`.
- Seed script exists in `prisma/seed.ts`.

## 3. Email service

- Preferred provider: Resend
- Fallback provider: Postmark
- Email-only contact flow:
  1. User submits the contact form.
  2. `POST /api/contact` validates with Zod.
  3. Inquiry is saved to PostgreSQL.
  4. Notification email is sent to the Garci inbox.
  5. User-facing success or warning state is returned.

Current repo status:

- Implemented in `app/api/contact/route.ts`.
- Service logic lives in `lib/services/email.ts` and `lib/services/inquiries.ts`.

## 4. Admin and product management

- Use Auth.js for admin authentication and sessions.
- Protect admin routes and admin APIs.
- Required CRUD APIs:
  - `POST /api/admin/products`
  - `PATCH /api/admin/products/[id]`
  - `DELETE /api/admin/products/[id]`

Current repo status:

- Auth.js credentials flow is implemented in `lib/auth.ts`.
- Admin route protection is implemented in `proxy.ts`.
- Admin UI exists under `app/admin/*`.
- Product CRUD APIs exist under `app/api/admin/products/*`.

## 5. File and image storage

- Recommended long-term target for product images:
  - AWS S3
  - Cloudflare R2
  - Supabase Storage

Current repo status:

- Product images are still served from repo-managed assets in `public/assets`.
- This is acceptable for the current migration stage.
- Moving images to S3-compatible storage is still a future enhancement, not a current dependency.

## 6. Security and reliability

- Validate all write endpoints with Zod.
- Rate limit contact and admin write paths with Upstash Redis or equivalent.
- Add Cloudflare Turnstile to public write surfaces.
- Use Sentry for error tracking.

Current repo status:

- Zod validation is in place.
- Upstash-compatible rate limiting is implemented with local fallback.
- Turnstile is integrated into contact and admin login flows.
- Sentry hooks are present through `instrumentation.ts` and the Sentry config files.

## Hosting recommendation

### Recommended option

- Deploy the Next.js runtime to Vercel.
- Keep GitHub Actions responsible for lint, test, typecheck, and build checks.

### Self-managed option

- Use the standalone build for a VPS or container target.
- Back it with GitHub Actions artifact generation and deployment automation.

Detailed deployment notes:

- `docs/deployment/vercel.md`
- `docs/deployment/self-hosted-standalone.md`

## GitHub Pages is not suitable

GitHub Pages cannot host the final Garci app because it does not provide:

- Next.js Route Handler execution
- Auth.js session handling
- Prisma-backed database access
- secure server-side environment variable handling
- server-side email delivery
- Turnstile verification

## MVP API surface

- `GET /api/products`
- `GET /api/products/[slug]`
- `POST /api/contact`
- `POST /api/admin/products`
- `PATCH /api/admin/products/[id]`
- `DELETE /api/admin/products/[id]`

## Minimal schema target

- `Product`: `id`, `slug`, `name`, `description`, `features`, `imageUrl`, `isActive`, `createdAt`, `updatedAt`
- `Inquiry`: `id`, `name`, `email`, `subject`, `message`, `createdAt`
- `User`: `id`, `email`, `role`, `createdAt`

Implementation note:

- The current `User` model also includes `passwordHash` and `updatedAt` because credentials-based Auth.js login requires a stored password hash.

## Final stack shortlist

- Core: Next.js + TypeScript
- DB: PostgreSQL + Prisma
- Email: Resend, with Postmark fallback
- Auth: Auth.js
- Storage: S3 / R2 / Supabase Storage for a later image-storage phase
- Validation: Zod
- Protection: Turnstile + Upstash rate limit
- Monitoring: Sentry
- CI/CD: GitHub Actions
- Runtime hosting: Vercel preferred, standalone Node/container supported
