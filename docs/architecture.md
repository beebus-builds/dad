# Architecture

## High-level diagram

```
                     ┌────────────────────────────────────────┐
                     │          Cloudflare (CDN + WAF)        │
                     │  app.shramjagaran.np   api.shramjagaran.np
                     └─────────────┬───────────────┬──────────┘
                                   │               │
              ┌────────────────────▼──────┐   ┌────▼──────────────────┐
              │  Next.js 14 (Vercel/Pages)│   │  Go + Gin API         │
              │  App Router, RSC          │   │  (Fly.io / Render)    │
              │  Tailwind + ShadCN        │   │  clean architecture   │
              │  Inter + Noto Sans        │   │  pgx / redis / minio  │
              └───────────────────────────┘   └────┬──────────┬───────┘
                                                    │          │
                       ┌────────────────────────────▼─┐   ┌────▼────────┐
                       │  Neon PostgreSQL (ap-south-1) │   │  Cloudflare │
                       │  serverless, pooled + direct  │   │  R2 bucket  │
                       └───────────────────────────────┘   │  uploads    │
                                                           └─────────────┘
                                                  ┌─────────────────────────┐
                                                  │  Upstash Redis (cache,  │
                                                  │  rate-limit, sessions)  │
                                                  └─────────────────────────┘
```

## Backend layout

Clean architecture with strict inward dependencies:

```
cmd/api/                # composition root — wires everything
internal/
  config/               # env loading
  domain/
    entity/             # plain structs (User, Member, ...)
    repository/         # interfaces only
    rbac/               # role → permission matrix
  infrastructure/       # pgxpool, redis client, R2 client
    postgres/           # repository implementations
  usecase/              # business rules
  http/
    handler/            # gin handlers (thin)
    middleware/         # auth, cors, ratelimit, audit, recovery
    router/             # route registration
pkg/                    # framework-agnostic helpers
  apperror/             # typed errors
  jwt/                  # HS256 manager
  password/             # bcrypt
  pagination/           # ?page=&pageSize=
  response/             # uniform JSON envelope
  validator/            # email, phone, strong password
  logger/               # zap
migrations/             # raw SQL up/down
```

Dependency direction: `cmd` → `http` → `usecase` → `domain` ← `infrastructure`.

The `domain` package has no external dependencies, so unit tests of use cases
require no database.

## Data model

17 tables, all UUID `id` primary keys, `created_at`/`updated_at`/`deleted_at`
audit columns. See `migrations/0001_initial_schema.up.sql`.

Core entities:

- `users` — staff and members with a `role` and optional `branch_id`,
  `province_code`, `district_code`.
- `branches` — trade union branches by district.
- `members` — union membership records linked to a `branch`.
- `complaints` — grievance tickets with priority, status, assignee.
- `events`, `news`, `documents` — content with bilingual title fields.
- `donations` — payment records (Khalti, eSewa, bank).
- `legal_cases` — court cases with assigned advisor.
- `training`, `incidents` — OSH records.
- `notifications`, `audit_logs` — system activity.

## Request flow (auth)

```
Browser
  │  POST /api/v1/auth/login {email, password}
  ▼
Gin router
  │  → CORS → rate-limit (per IP)
  ▼
Auth handler
  │  → AuthService.Login
  ▼
UserRepository.GetByEmail        (pgx SELECT)
  │  → bcrypt verify
  │  → jwt.Manager.Generate (access + refresh)
  │  → Set-Cookie: sj_token, sj_refresh (HttpOnly, SameSite=Lax)
  ▼
200 {data: {user, accessToken, refreshToken}}
```

Subsequent calls include `Authorization: Bearer <accessToken>`. The
`middleware.Auth` middleware parses the JWT, attaches `claims` to the gin
context, and `RequirePerm` short-circuits with 403 if the permission is
missing.

## Authorization model

Role → permission map lives in `internal/domain/rbac/permissions.go`. Each role
has a fixed slice of permission strings. JWTs carry the resolved list, so
authorization can be enforced **at the edge** without a DB lookup. New
permissions are added by editing the matrix and migrating `role_permissions`.

## Caching

- Public read endpoints (`GET /branches`, `GET /news`) cache in Redis for
  5 minutes.
- Dashboard reports cache 30 seconds.
- `go-redis/v9` is the client; the cache layer logs a warning and degrades
  gracefully if Redis is unreachable.

## Object storage

Member documents, event cover images, and training certificates are uploaded
to Cloudflare R2 (S3-compatible). The backend issues pre-signed PUT URLs;
clients upload directly to R2 to avoid proxying through the API.

## Observability

- Structured JSON logs via `zap`.
- Every authenticated request logs `request_id`, `user_id`, `route`,
  `status`, `latency_ms`.
- `audit_logs` table persists create/update/delete for sensitive resources.
- Future: OpenTelemetry traces (to be added in a follow-up).

## Why Go + Gin?

- Native concurrency: fits a serverless deploy on Fly.io or Render with
  horizontal autoscaling.
- Static binary, fast cold starts (≈80 ms).
- `pgx` is the highest-throughput pure-Go Postgres driver.
- Single binary, no runtime — easier ops than Node.

## Why Next.js (not Remix / Astro)?

- Mature App Router with React Server Components.
- Native i18n (planned) and image optimization.
- Edge runtime compatible for the public marketing site.
- We chose Next 14 over 15 to stay on React 18 stable (Radix UI primitives
  were not yet released for React 19 RC at the time of writing).
