export const APP_ROUTES = {
  home: "/",
  about: "/about",
  contact: "/contact",
  news: "/news",
  events: "/events",
  membership: "/membership",
  legal: "/legal",
  donate: "/donate",
  login: "/login",
  register: "/register",
  forgotPassword: "/forgot-password",
  dashboard: "/dashboard",
  members: "/dashboard/members",
  complaints: "/dashboard/complaints",
  dashEvents: "/dashboard/events",
  dashNews: "/dashboard/news",
  documents: "/dashboard/documents",
  donations: "/dashboard/donations",
  legalCases: "/dashboard/legal-cases",
  training: "/dashboard/training",
  incidents: "/dashboard/incidents",
  reports: "/dashboard/reports",
  settings: "/dashboard/settings",
  profile: "/dashboard/profile",
} as const;

export const PAGINATION = {
  defaultPageSize: 20,
  pageSizes: [10, 20, 50, 100],
} as const;

export const QUERY_KEYS = {
  auth: {
    me: ["auth", "me"] as const,
  },
  members: {
    all: ["members"] as const,
    list: (params: unknown) => ["members", "list", params] as const,
    detail: (id: string) => ["members", "detail", id] as const,
  },
  complaints: {
    all: ["complaints"] as const,
    list: (params: unknown) => ["complaints", "list", params] as const,
    detail: (id: string) => ["complaints", "detail", id] as const,
  },
  events: {
    all: ["events"] as const,
    list: (params: unknown) => ["events", "list", params] as const,
    detail: (id: string) => ["events", "detail", id] as const,
  },
  news: {
    all: ["news"] as const,
    list: (params: unknown) => ["news", "list", params] as const,
    detail: (slug: string) => ["news", "detail", slug] as const,
  },
  reports: {
    dashboard: ["reports", "dashboard"] as const,
  },
} as const;

export const NEPAL_PROVINCES = [
  { code: "P1", name: "Koshi" },
  { code: "P2", name: "Madhesh" },
  { code: "P3", name: "Bagmati" },
  { code: "P4", name: "Gandaki" },
  { code: "P5", name: "Lumbini" },
  { code: "P6", name: "Karnali" },
  { code: "P7", name: "Sudurpashchim" },
] as const;

export const MEMBERSHIP_TIERS = [
  { value: "STANDARD", label: "Standard" },
  { value: "LIFETIME", label: "Lifetime" },
  { value: "HONORARY", label: "Honorary" },
] as const;
