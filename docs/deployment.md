# Deployment

## Environments

| Env         | Branch      | Frontend URL                  | API URL                          | Neon branch   |
|-------------|-------------|-------------------------------|----------------------------------|---------------|
| local       | `*`         | http://localhost:3000         | http://localhost:8080/api/v1     | dev branch    |
| preview     | PR          | https://pr-123.preview.app    | https://pr-123.api.preview.app   | preview branch|
| production  | `main`      | https://app.shramjagaran.np   | https://api.shramjagaran.np/api/v1 | main        |

## Frontend (Next.js)

### Build artifact

```bash
cd frontend
npm ci
npm run build
# .next/standalone (if output: 'standalone') or .next/ for full server
```

### Deploy to Vercel (recommended)

1. Import the repository in <https://vercel.com>.
2. Set **Root Directory** to `frontend`.
3. Build command: `npm run build` (default).
4. Environment variables:
   - `NEXT_PUBLIC_API_URL` = `https://api.shramjagaran.np/api/v1`
5. Custom domain: `app.shramjagaran.np` (proxied through Cloudflare).

### Deploy to Cloudflare Pages (alternative)

1. Connect the repo.
2. Build command: `npm run build`. Output: `.next`.
3. Set the same env vars.

## Backend (Go)

### Build

```bash
cd backend
CGO_ENABLED=0 go build -trimpath -ldflags="-s -w" -o bin/api ./cmd/api
```

The result is a static ~22 MB binary that runs on any Linux/amd64 host.

### Fly.io

```bash
fly launch --no-deploy --name shram-jagaran-api --region bom
fly secrets set \
  DATABASE_URL='postgres://...' \
  JWT_SECRET='change-me-32-chars-minimum' \
  CORS_ORIGINS='https://app.shramjagaran.np'
fly deploy
```

A `Dockerfile` is intentionally **not** shipped (we want a static binary, not a
container). The `fly.toml` is omitted in this scaffold because the laptop used
for development does not support Docker.

### Render

`render.yaml` blueprint (sample):

```yaml
services:
  - type: web
    name: shram-jagaran-api
    runtime: go
    plan: starter
    region: singapore
    buildCommand: cd backend && go build -o ../bin/api ./cmd/api
    startCommand: ./bin/api
    healthCheckPath: /health
    envVars:
      - key: DATABASE_URL
        sync: false
      - key: JWT_SECRET
        generateValue: true
      - key: CORS_ORIGINS
        value: https://app.shramjagaran.np
```

### Bare-metal / VM

```bash
scp bin/api user@host:/opt/shram-jagaran/
ssh user@host "systemctl restart shram-jagaran-api"
```

The systemd unit should set the working directory to `/opt/shram-jagaran` and
load `/etc/shram-jagaran/api.env`.

## Database

### Migrations

Migrations are raw SQL — apply them with `psql` or any migration runner that
understands numbered up/down files.

```bash
psql "$DATABASE_URL" -f migrations/0001_initial_schema.up.sql
psql "$DATABASE_URL" -f migrations/0002_seed_data.up.sql
```

For idempotency on repeat deploys, wrap each migration in
`BEGIN; ... COMMIT;` and use `IF NOT EXISTS` clauses (already done in
`0001_initial_schema`).

### Backups

Neon Pro plans include point-in-time recovery (7–30 days). For free-tier
projects, schedule a daily `pg_dump` to R2:

```bash
pg_dump "$DATABASE_URL" --no-owner --format=custom \
  | aws s3 cp - s3://shram-jagaran-tfstate/backups/$(date -u +%FT%H%M%SZ).dump \
      --endpoint-url https://<accountid>.r2.cloudflarestorage.com
```

## Secret rotation

| Secret          | Rotation policy                          | Procedure |
|-----------------|------------------------------------------|-----------|
| `JWT_SECRET`    | Annually or on suspected compromise      | Update in secret store; restart API. All sessions invalidated. |
| `DATABASE_URL`  | On Neon credential reset                 | Update env; restart. |
| `R2` keys       | Annually                                 | Create new key in Cloudflare; update env. |

## Zero-downtime deploys

Fly.io and Render perform rolling deploys natively. For a bare-metal deploy:

1. Start the new binary on port 8081.
2. Run smoke tests.
3. `nginx -s reload` to switch the upstream to 8081.
4. Stop the old binary on 8080.

## Rollback

- Frontend: Vercel/Render keeps the previous deploy; click "Promote to
  Production".
- Backend: redeploy the previous artifact (`fly releases rollback` or
  redeploy via Render).
- DB: Neon PITR — restore to a timestamp before the bad release, then
  re-apply post-deploy migrations.
