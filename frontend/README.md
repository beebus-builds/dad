# Shram Jagaran CMS — Frontend

Production-grade Next.js 15 frontend for the **Shram Jagaran** digital transformation platform empowering Nepalese trade unions.

## Tech Stack

- **Next.js 15** (App Router, React Server Components first)
- **TypeScript** (strict)
- **Tailwind CSS** + **ShadCN UI** primitives (Radix)
- **TanStack Query** for data fetching and caching
- **React Hook Form** + **Zod** for forms and validation
- **Zustand** for client state (auth)
- **Axios** with JWT cookie interceptor
- **Sonner** for toasts
- **Lucide React** icons
- **next-themes** for dark mode

## Features

- Public marketing site: Home, About, Contact, News, Events, Membership, Legal Aid, Donate
- Authentication: Login, Register, Forgot Password (JWT cookie based)
- Dashboard with sidebar navigation and RBAC-gated modules
- Modules: Members, Complaints, Events, News, Documents, Donations, Legal Cases, Training, OSH Incidents, Reports, Notifications, Profile, Settings, Support
- Role-Based Access Control across 7 roles (Super → Public)
- Internationalisation-ready (English + Nepali Devanagari typography)
- WCAG AA accessibility (skip links, ARIA labels, focus rings, semantic HTML)
- Security headers and middleware-based route guarding
- SEO ready (sitemap, robots, OpenGraph metadata)

## Getting Started

> Requires **Node.js 18.18+** (Node 20+ recommended). No Docker required.

### 1. Install dependencies

```bash
cd frontend
npm install
```

### 2. Configure environment

`.env.local` is included with sensible defaults. Edit if you need to point to a different backend:

```env
NEXT_PUBLIC_API_URL="http://localhost:8080/api/v1"
```

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Build for production

```bash
npm run build
npm run start
```

### 5. Type-check and lint

```bash
npm run typecheck
npm run lint
```

## Project Structure

```
src/
├── app/
│   ├── (auth)/             # Login, register, forgot password
│   ├── (dashboard)/        # Authenticated dashboard
│   │   └── dashboard/
│   │       ├── members/
│   │       ├── complaints/
│   │       ├── events/
│   │       ├── news/
│   │       ├── documents/
│   │       ├── donations/
│   │       ├── legal-cases/
│   │       ├── training/
│   │       ├── incidents/
│   │       ├── reports/
│   │       ├── profile/
│   │       └── settings/
│   ├── (public)/           # Public marketing pages
│   ├── globals.css
│   ├── layout.tsx
│   ├── providers.tsx
│   ├── not-found.tsx
│   └── global-error.tsx
├── components/
│   ├── auth/               # Guard + permission gate
│   ├── dashboard/          # Sidebar, header, page header
│   ├── public/             # Public header / footer
│   └── ui/                 # ShadCN-style primitives
├── hooks/                  # use-auth
├── lib/                    # api-client, env, rbac, utils, validations, constants
├── services/               # auth, members, ...
├── stores/                 # zustand stores
├── types/                  # shared TS types
└── middleware.ts           # JWT cookie guard
```

## RBAC Model

Seven roles, each with explicit permissions:

| Role             | Description                          |
| ---------------- | ------------------------------------ |
| `SUPER_ADMIN`    | Platform owner, all permissions      |
| `NATIONAL_ADMIN` | Country-wide operations              |
| `PROVINCE_ADMIN` | One of 7 provinces                   |
| `DISTRICT_ADMIN` | District-level                       |
| `BRANCH_ADMIN`   | Single branch                        |
| `MEMBER`         | Logged-in worker                     |
| `PUBLIC`         | Anonymous visitor                    |

UI gates leverage `<PermissionGate>` and the `useAuthStore().can(permission)` helper.

## Notes

- All API calls expect the Go + Gin backend at `NEXT_PUBLIC_API_URL`. Demo pages render mock data so you can preview the UI before wiring the backend.
- Devanagari typography is loaded via `next/font` (`Noto Sans Devanagari`) and exposed as the `font-devanagari` utility for Nepali text fields.
- Dark mode toggling can be added via `useTheme()` from `next-themes`.

## License

© Shram Jagaran. All rights reserved.
