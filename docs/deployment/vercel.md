# Vercel Deployment Path

## Recommended deployment model

Use Vercel for the Next.js runtime and keep GitHub Actions as the quality gate.

## Why this is the recommended path

- Native support for Next.js App Router, Route Handlers, image optimization, and edge/runtime primitives.
- Managed environment variables and preview deployments for pull requests.
- No custom process management for the Node runtime.

## Setup steps

1. Create a PostgreSQL database and set `DATABASE_URL`.
2. Create an Upstash Redis database and set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`.
3. Configure Resend or Postmark credentials.
4. Configure Cloudflare Turnstile site and secret keys.
5. Configure `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, and `NEXT_PUBLIC_SITE_URL`.
6. Import the repository into Vercel.
7. Add the environment variables in the Vercel project settings.
8. Set the build command to `npm run build` and install command to `npm ci` if you want explicit overrides.
9. Run the Prisma migration in your deployment pipeline or as a one-time release step:
   `npm run db:migrate`
10. Seed the initial admin user if needed:
    `npm run db:seed`

## GitHub Actions relationship

- The workflow in `.github/workflows/ci.yml` should remain required in GitHub branch protection.
- Vercel can deploy automatically after GitHub reports the checks as successful.

## GitHub Pages is not suitable

GitHub Pages only serves static files. This application needs:

- Next.js Route Handlers under `app/api/*`
- Auth.js session handling
- PostgreSQL access through Prisma
- Secure server-side environment variables
- Email delivery and Turnstile verification on the server

That rules GitHub Pages out for the final backend-enabled app.
