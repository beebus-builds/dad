# Shram Jagaran CMS

Production-grade content management system for the Shram Jagaran trade union.
Members, complaints, events, news, training, legal cases, donations, incidents,
notifications, and an admin dashboard — all in a single bilingual (English +
Nepali) platform.

## Repository layout

```
.
├── frontend/             Next.js 14 dashboard and public site
├── backend/              Go + Gin REST API
├── infrastructure/       Terraform for Neon, R2, Cloudflare DNS
├── docs/                 OpenAPI spec, architecture, runbook
└── .github/workflows/    CI for backend, frontend, validation
```

## Quick start (local development)

### 1. Provision a Neon database

Create a free project at <https://neon.tech>. Copy the **pooled** connection
string.

### 2. Backend

```powershell
cd backend
Copy-Item .env.example .env
# paste DATABASE_URL and JWT_SECRET (32+ chars) into .env

# apply migrations (requires psql in PATH)
psql $env:DATABASE_URL -f migrations/0001_initial_schema.up.sql
psql $env:DATABASE_URL -f migrations/0002_seed_data.up.sql

# build and run
go build -o bin/api.exe ./cmd/api
.\bin\api.exe
```

The server listens on `:8080`. Health check: <http://localhost:8080/health>.

Default super admin (from seed): `admin@shramjagaran.np` / `Admin@123`.

### 3. Frontend

```powershell
cd frontend
Copy-Item .env.example .env.local
# defaults to http://localhost:8080/api/v1

npm install
npm run dev
```

Open <http://localhost:3000>.

## Roles and permissions

Seven roles, 26 permissions. See `backend/internal/domain/rbac/permissions.go`.

| Role            | Scope                                       |
|-----------------|---------------------------------------------|
| `SUPER_ADMIN`   | All permissions across the platform         |
| `NATIONAL_ADMIN`| All branches; cannot manage SUPER_ADMINs    |
| `PROVINCE_ADMIN`| All branches in assigned province           |
| `DISTRICT_ADMIN`| All branches in assigned district           |
| `BRANCH_ADMIN`  | Single branch; manage members and complaints|
| `MEMBER`        | Self-service: profile, complaints, donations|
| `PUBLIC`        | Unauthenticated; read-only public site      |

## Testing

```powershell
# backend
cd backend
go vet ./...
go test -count=1 -race ./...

# frontend
cd frontend
npm run typecheck
npm run lint
npm run build
```

## Deployment

See `docs/deployment.md`. CI runs on every push via GitHub Actions:
- `backend.yml`: `go vet` → `go test -race` → build Linux binary
- `frontend.yml`: `tsc` → `eslint` → `next build`
- `validate.yml`: `redocly lint` on OpenAPI, `terraform fmt + validate`

## Architecture

See `docs/architecture.md` for the full system diagram, data model, and request
flow.

## Operations

See `docs/runbook.md` for incident response, common failure modes, and
maintenance tasks.

## License

Proprietary — © Shram Jagaran Trade Union.
