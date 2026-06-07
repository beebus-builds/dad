export const env = {
  appName: process.env.NEXT_PUBLIC_APP_NAME ?? "Shram Jagaran CMS",
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  locale: process.env.NEXT_PUBLIC_APP_LOCALE ?? "en",
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api/v1",
  apiTimeout: Number(process.env.NEXT_PUBLIC_API_TIMEOUT ?? 30000),
  authCookieName: process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME ?? "sj_token",
  authRefreshCookie: process.env.NEXT_PUBLIC_AUTH_REFRESH_COOKIE ?? "sj_refresh",
  features: {
    donations: process.env.NEXT_PUBLIC_FEATURE_DONATIONS === "true",
    legalAid: process.env.NEXT_PUBLIC_FEATURE_LEGAL_AID === "true",
    training: process.env.NEXT_PUBLIC_FEATURE_TRAINING === "true",
  },
  monitoring: {
    sentryDsn: process.env.NEXT_PUBLIC_SENTRY_DSN ?? "",
    betterStackToken: process.env.NEXT_PUBLIC_BETTERSTACK_TOKEN ?? "",
  },
} as const;
