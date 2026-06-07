# Runbook

## On-call checklist (first 5 minutes)

1. Check status: `curl https://api.shramjagaran.np/health` → expect 200.
2. Tail logs for `error` or `panic`.
3. Look at Neon dashboard: CPU, connections, replication lag.
4. Check rate-limit counters: a sudden spike often indicates a misbehaving
   client.
5. Page the on-call engineer if root cause is not obvious in 5 minutes.

## Common failure modes

### API returns 500 on every request

**Likely cause**: database unreachable.

```bash
# Test connectivity
psql "$DATABASE_URL" -c "SELECT 1"
```

Fix: check Neon status page, verify password rotation, check
`pg_hba.conf`/IP-allowlist (Neon enforces password auth + TLS only).

### Login is slow (>2 s)

**Likely cause**: cold start of Neon autoscale.

Solution: Neon pauses compute after 5 minutes of inactivity. Either raise
`suspend_timeout_seconds` or accept the cold-start latency. For interactive
logins this is usually fine.

### "Too many requests" from the API

Rate limit is **60 req/min per IP** by default. If the user is legitimate,
they are probably behind a shared NAT (e.g., corporate office). Either:

- Issue a per-user token with a higher quota, or
- Loosen the limit by setting `RATE_LIMIT_REQUESTS=300` in `.env`.

### Cookies not set / login appears to fail

The API sets `sj_token` and `sj_refresh` cookies. Browsers refuse cross-origin
cookies unless `CORS_ORIGINS` matches the frontend origin exactly and the
request uses `credentials: 'include'`.

Verify in browser DevTools → Application → Cookies. If absent, check
`Access-Control-Allow-Credentials: true` and `Access-Control-Allow-Origin`
**must not** be `*`.

### Migration failed halfway

The `pgx` driver does not auto-rollback a failed transaction. If you see
half-applied tables, drop them manually and re-run:

```sql
BEGIN;
DROP TABLE IF EXISTS audit_logs CASCADE;
-- ... other tables in reverse order
COMMIT;
```

Then re-apply. Migrations are written to be idempotent (`IF NOT EXISTS`).

### Frontend build fails with "Module not found"

```bash
rm -rf node_modules .next
npm install
```

If a transitive dep broke, pin it in `package.json` and document why in the
PR.

## Routine maintenance

### Rotate `JWT_SECRET`

```bash
fly secrets set JWT_SECRET="$(openssl rand -hex 32)"
```

All existing sessions are invalidated; users must log in again.

### Vacuum / analyze

Neon runs autovacuum automatically. Manual:

```sql
VACUUM (ANALYZE, VERBOSE) members;
```

### Re-seed reference data

If a non-production environment gets out of sync with seed data:

```bash
psql "$DATABASE_URL" -f migrations/0002_seed_data.up.sql
```

It uses `ON CONFLICT DO NOTHING`, so it is safe to re-apply.

## Disaster recovery

| Scenario                       | RTO         | RPO          | Procedure |
|--------------------------------|-------------|--------------|-----------|
| Single region outage           | < 1 hour    | 0 (active)   | Failover handled by Neon/R2/Cloudflare. |
| Database corruption            | < 4 hours   | Last 7 days  | Neon PITR to timestamp before corruption. |
| API binary rolled out broken   | < 5 minutes | 0            | `fly releases rollback` or redeploy last good artifact. |
| Compromise of `JWT_SECRET`     | < 10 min    | 0            | Rotate secret, force re-login, audit `audit_logs` for suspicious activity. |
| Accidental data deletion       | < 24 hours  | Last 7 days  | PITR; or restore from `pg_dump` in R2 backups. |

## Monitoring targets (suggested)

- API: p50 latency < 200 ms, p99 < 1 s, error rate < 0.5 %.
- Neon: CPU < 70 %, connections < 80 % of pool size.
- R2: 4xx/5xx rate < 0.1 %.
- Cloudflare cache hit rate > 80 %.

Wire these to a hosted monitoring service (Better Stack, Datadog, Grafana
Cloud) once the MVP is live.

## Contact

- On-call rotation: <oncall@shramjagaran.np>
- Security incidents: <security@shramjagaran.np>
- General: <ops@shramjagaran.np>
