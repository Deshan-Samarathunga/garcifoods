# Phase 1 Route Migration Map

## Status

This file is now a historical Phase 1 artifact.

- The migration has progressed beyond the initial scaffold.
- The active application is a Next.js App Router + TypeScript project with backend Route Handlers.
- GitHub is the source of truth and GitHub Actions is the CI validation path.
- The contact flow is now email-only through `POST /api/contact`.
- The current backend/runtime recommendation is documented in `docs/architecture/nextjs-backend-recommendation.md`.
- The route map below remains useful as the original static-to-Next transition reference.

## Scope

Phase 1 establishes the production Next.js skeleton without deleting the current static site files.

- Static source pages remain in the repo:
  - `index.html`
  - `pages/about.html`
  - `pages/products.html`
  - `pages/contact.html`
- Shared assets are copied into `public/assets/` so the new app can reuse the same paths.
- Shared shell components now own the header, footer, and route-level metadata.

## Route map

The table below reflects the original Phase 1 to Phase 2 plan, not the current implementation status.

| Next.js route | Legacy source | Phase 1 status | Phase 2 target |
| --- | --- | --- | --- |
| `/` | `index.html` | Route scaffolded with shared layout and preserved metadata. | Port hero, product slider, gallery, and reviews. |
| `/about` | `pages/about.html` | Route scaffolded with shared layout and preserved metadata. | Port mission, promise, and founder sections. |
| `/products` | `pages/products.html` | Route scaffolded with shared layout and preserved metadata. | Port catalog cards and modal behavior into React components. |
| `/contact` | `pages/contact.html` | Route scaffolded with shared layout and preserved metadata. | Port the UI, then replace the mailto flow with an email API. |

## Asset strategy

- Current static assets remain under `assets/` so the legacy pages are not broken during migration.
- Next.js serves a copied version from `public/assets/` so the new app can use `/assets/...` URLs immediately.
- The duplicated asset tree can be consolidated after the static HTML files are fully retired.

## Current repo reality

- Public product APIs exist at `app/api/products/route.ts` and `app/api/products/[slug]/route.ts`.
- The contact backend exists at `app/api/contact/route.ts` and stores inquiries before attempting email delivery.
- Admin product APIs exist under `app/api/admin/products/*`.
- Authentication and route protection are already in place for the admin surface.
