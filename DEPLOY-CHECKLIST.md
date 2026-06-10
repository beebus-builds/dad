# Deploy-to-Production Checklist

Run through these steps in order every time you deploy **Shram Jagaran CMS** to production.

---

## 0. Pre-flight

- [ ] `git status` — working tree clean on `main`
- [ ] `git log --oneline -5` — the commits you intend to ship
- [ ] All PRs reviewed, CI green

## 1. Backend — Render

- [ ] Push `main` to GitHub (Render auto-deploys if connected)
- [ ] Or manual: Render Dashboard → `shram-jagaran-api` → **Manual Deploy → Deploy latest commit**
- [ ] Wait for build log: `go build -o bin/server ./cmd/api` succeeds
- [ ] Wait for health check: `GET /health` returns `200`
- [ ] Verify `DATABASE_URL` and `JWT_SECRET` are set in Render Environment Variables
- [ ] Verify `FRONTEND_URL` and `CORS_ORIGINS` point to the Vercel frontend

## 2. Database — Neon

- [ ] Verify migrations ran: check `organisation_settings` table has seed data
- [ ] Verify admin user: `admin@shramjagaran.np` / `Admin@123` exists
- [ ] Run a sanity query: `SELECT count(*) FROM members;`
- [ ] (Optional) Run `bash scripts/backup.sh` for a pre-deploy snapshot

## 3. Frontend — Vercel

- [ ] Push `main` to GitHub (Vercel auto-deploys)
- [ ] Or manual: Vercel Dashboard → **Deploy**
- [ ] Set environment variables in Vercel project settings:
  - `NEXT_PUBLIC_APP_URL` → your Vercel domain
  - `NEXT_PUBLIC_API_URL` → `https://shram-jagaran-api.onrender.com/api/v1`
  - `NEXT_PUBLIC_APP_LOCALE` → `ne`
  - (plus all other `NEXT_PUBLIC_*` vars from `.env.example`)
- [ ] Wait for build: `next build` passes (83 pages)
- [ ] Visit `https://your-app.vercel.app/ne` — home page loads

## 4. Smoke Test

- [ ] Visit `/ne` — home page renders in Nepali
- [ ] Visit `/en` — switches to English
- [ ] Visit `/ne/about` — leadership cards visible
- [ ] Visit `/ne/contact` — form loads
- [ ] Visit `/ne/news` — list loads
- [ ] Visit `/ne/membership` — apply form visible
- [ ] Visit `/ne/donate` — donate form visible
- [ ] Visit `/ne/login` — can log in as admin
- [ ] Visit `/ne/dashboard` — dashboard loads with stats
- [ ] Visit `/ne/dashboard/members` — member table loads

## 5. Security & Quality

- [ ] Run `npm run e2e:a11y` — axe-core audit passes (no critical/serious violations)
- [ ] Run `npm run e2e` — all Playwright E2E tests pass
- [ ] Run `bash scripts/zap-scan.sh https://your-app.vercel.app` — review ZAP report

## 6. Object Storage (Cloudflare R2, optional)

- [ ] Create R2 bucket `shram-jagaran-uploads`
- [ ] Set `R2_ENABLED=true` + account/access keys in Render env vars
- [ ] Test: upload a document in `/ne/dashboard/documents/new`

## 7. Domain & DNS

- [ ] Custom domain pointed to Vercel (CNAME to `cname.vercel-dns.com`)
- [ ] Custom domain pointed to Render (CNAME to `onrender.com`)
- [ ] SSL auto-provisioned by both platforms

## 8. Post-deploy

- [ ] Run `bash scripts/backup.sh` — fresh backup saved to `backups/`
- [ ] Monitor logs in Render + Vercel dashboards
- [ ] Test on mobile viewport

## 9. Rollback (if needed)

- **Frontend**: Vercel Dashboard → Deployments → ⋮ → **Promote to Production** (previous deploy)
- **Backend**: Render Dashboard → Deploy → **Revert to previous deploy**
- **Database**: `bash scripts/restore.sh backups/shramjagaran_<timestamp>.sql.gz`
