# Shram Jagaran CMS — Backend

Production-grade Go + Gin REST API for the **Shram Jagaran** Nepalese trade union platform.

## Stack

- **Go 1.22+**
- **Gin** HTTP framework
- **pgx/v5** PostgreSQL driver (Neon-compatible)
- **go-redis/v9** for caching
- **minio-go/v7** for Cloudflare R2 (S3-compatible)
- **JWT (HS256)** access + refresh tokens
- **RBAC** with 26 fine-grained permissions
- **Zap** structured logging
- **golang.org/x/time/rate** for IP rate-limiting
- **bcrypt** for password hashing

## Clean Architecture

```
cmd/api/                      # entry point
internal/
  config/                     # env loading & validation
  domain/
    entity/                   # User, Member, Complaint, Event, etc.
    repository/               # interface contracts
    rbac/                     # permission map per role
  infrastructure/
    db/                       # pgx connection pool
    postgres/                 # SQL repository implementations
    cache/                    # Redis client
    storage/                  # Cloudflare R2 client
  http/
    handler/                  # Gin HTTP handlers
    middleware/               # auth, rbac, rate-limit, CORS, audit
    router/                   # route wiring
  usecase/                    # business logic
pkg/                           # shared helpers
  apperror/  jwt/  logger/  password/  response/  pagination/  validator/
migrations/                    # 0001 schema, 0002 seed
```

## API

All endpoints are versioned under `/api/v1`.

| Route group      | Endpoints                                                   |
| ---------------- | ----------------------------------------------------------- |
| `/auth`          | `POST login`, `POST register`, `POST refresh`, `POST forgot-password`, `POST logout`, `GET me` |
| `/members`       | CRUD, list w/ pagination                                    |
| `/complaints`    | CRUD, stats, list                                           |
| `/events`        | CRUD                                                        |
| `/news`          | CRUD, view tracking                                         |
| `/documents`     | CRUD                                                        |
| `/payments`      | CRUD, total                                                 |
| `/legal-cases`   | CRUD                                                        |
| `/training`      | CRUD                                                        |
| `/incidents`     | CRUD                                                        |
| `/notifications` | list, mark-read, mark-all-read                              |
| `/reports`       | dashboard KPIs                                              |
| `/branches`      | public list                                                 |
| `/health`        | liveness                                                    |

## Quickstart

### 1. Provision PostgreSQL

This backend is wired for **Neon PostgreSQL**. Create a Neon project and copy its connection string into `DATABASE_URL`.

### 2. Configure environment

```bash
cd backend
cp .env.example .env
# Edit .env: set DATABASE_URL and JWT_SECRET (>= 32 chars)
```

### 3. Install + run

```bash
make deps
make migrate    # apply 0001 + 0002 migrations
make run        # starts the API on :8080
```

### 4. Seed admin user

The default super admin is created by `0002_seed_data.up.sql`:

- **email**: `admin@shramjagaran.np`
- **password**: `Admin@123`

> **Change this password in production!**

### 5. Test the API

```bash
# Health check
curl http://localhost:8080/health

# Login
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@shramjagaran.np","password":"Admin@123"}'

# Use the returned accessToken in Authorization: Bearer <token>
curl http://localhost:8080/api/v1/members \
  -H "Authorization: Bearer $TOKEN"
```

## RBAC

7 roles, 26 permissions. Permissions are encoded in JWT claims, so authorization is
enforced both at the edge (middleware) and inside use cases. See
`internal/domain/rbac/permissions.go`.

## Storage & Caching

- **R2** is optional — when disabled, the upload endpoint still records the document
  but no actual file is stored. Provide credentials to enable.
- **Redis** is optional — used for caching read-heavy endpoints. When unreachable, the
  server logs a warning and continues without it.

## Project Structure

```
backend/
├── cmd/api/main.go
├── internal/
│   ├── config/config.go
│   ├── domain/
│   │   ├── entity/        # 13 entity files
│   │   ├── repository/    # interfaces
│   │   └── rbac/          # permissions per role
│   ├── infrastructure/
│   │   ├── db/
│   │   ├── postgres/      # 6 repository impls
│   │   ├── cache/
│   │   └── storage/
│   ├── http/
│   │   ├── handler/       # 4 handler files
│   │   ├── middleware/    # auth, rbac, ratelimit, cors, audit
│   │   └── router/
│   └── usecase/           # 4 usecase files
├── pkg/
│   ├── apperror/
│   ├── jwt/
│   ├── logger/
│   ├── pagination/
│   ├── password/
│   ├── response/
│   └── validator/
├── migrations/
│   ├── 0001_initial_schema.up.sql
│   ├── 0001_initial_schema.down.sql
│   ├── 0002_seed_data.up.sql
│   └── 0002_seed_data.down.sql
├── Makefile
├── go.mod
├── .env.example
└── README.md
```

## Security

- bcrypt password hashing
- JWT (HS256) with separate access & refresh tokens
- Permission-gated routes
- IP-based rate limiting (token bucket)
- Audit log table for write actions
- CORS allowlist
- Recovery middleware

## License

© Shram Jagaran. All rights reserved.
