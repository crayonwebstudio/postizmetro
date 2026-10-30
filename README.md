# PostizMetro

Standalone Postiz (v2.10.1 backend, workers, cron) with a Metronic Next.js
frontend, for UI/UX review only. No separate Postiz login/register in this
review build: the backend uses a single fixed review workspace (see
backend/apps/backend/src/services/auth/public.workspace.middleware.ts),
and auth, billing, and marketplace routes return 410 in review mode.
Do NOT merge the review middleware or guard bypass into a main app repo.
At merge, delete those review files, restore AuthMiddleware, and restore
login handling as the main app requires.

## Architecture

- frontend: Metronic Next.js 16, Node 24, domain postizmetro.woodwolfdigital.com
- backend: Postiz NestJS 10, Node 22, domain api-postizmetro.woodwolfdigital.com
- workers, cron: same backend image, different start commands
- postgres: 14.5, redis: 7.2, both inside the same Coolify compose application

## Environment (set in Coolify only, never in this repo)

DATABASE_URL, REDIS_URL, JWT_SECRET, FRONTEND_URL, NEXT_PUBLIC_BACKEND_URL,
BACKEND_INTERNAL_URL, MAIN_URL, STORAGE_PROVIDER, UPLOAD_DIRECTORY,
POSTIZMETRO_REVIEW_MODE, POSTIZMETRO_REVIEW_USER_ID, POSTIZMETRO_REVIEW_ORG_ID,
POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB, plus seed-only values for
backend/scripts/seed-review-workspace.mjs.

## Known review limits

- Social OAuth redirect URIs must be updated per provider to the
  PostizMetro domain before a connect test can succeed, and a Metronic
  OAuth callback page (/integrations/social/[provider]) is not yet built.
  Connect is therefore open until milan provides provider app access.
- Scheduled publishing end to end requires a real connected channel.
  Without one, workers/cron can be verified as running, but a real publish
  cannot be claimed.
- Billing and marketplace are disabled (410) in review mode. AI shows an
  honest empty/error state without an AI key.
