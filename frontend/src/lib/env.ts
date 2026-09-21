import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_APP_NAME: z.string().min(1).default("Shram Jagaran CMS"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_APP_LOCALE: z.string().default("en"),
  NEXT_PUBLIC_API_URL: z.string().url().default("http://localhost:8080/api/v1"),
  NEXT_PUBLIC_API_TIMEOUT: z.coerce.number().int().positive().default(30000),
  NEXT_PUBLIC_AUTH_COOKIE_NAME: z.string().min(1).default("sj_token"),
  NEXT_PUBLIC_AUTH_REFRESH_COOKIE: z.string().min(1).default("sj_refresh"),
  NEXT_PUBLIC_FEATURE_DONATIONS: z.string().optional(),
  NEXT_PUBLIC_FEATURE_LEGAL_AID: z.string().optional(),
  NEXT_PUBLIC_FEATURE_TRAINING: z.string().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional().default(""),
  NEXT_PUBLIC_BETTERSTACK_TOKEN: z.string().optional().default(""),
});

function loadEnv() {
  const parsed = envSchema.safeParse(process.env);
  // Fail fast only on Vercel production builds — `next build` sets
  // NODE_ENV=production even locally, where strictness would just
  // break `npm run build` without any env configured.
  const failFast = process.env.VERCEL_ENV === "production";
  if (!parsed.success) {
    const details = parsed.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
    if (failFast) {
      throw new Error(`Invalid environment configuration: ${details}`);
    }
    // eslint-disable-next-line no-console
    console.warn(`[env] invalid configuration, using defaults: ${details}`);
  }
  const v = parsed.success ? parsed.data : envSchema.parse({});

  if (failFast && !process.env.NEXT_PUBLIC_API_URL) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is required in production (refusing localhost fallback)",
    );
  }

  return {
    appName: v.NEXT_PUBLIC_APP_NAME,
    appUrl: v.NEXT_PUBLIC_APP_URL,
    locale: v.NEXT_PUBLIC_APP_LOCALE,
    apiUrl: v.NEXT_PUBLIC_API_URL,
    apiTimeout: v.NEXT_PUBLIC_API_TIMEOUT,
    authCookieName: v.NEXT_PUBLIC_AUTH_COOKIE_NAME,
    authRefreshCookie: v.NEXT_PUBLIC_AUTH_REFRESH_COOKIE,
    features: {
      donations: v.NEXT_PUBLIC_FEATURE_DONATIONS === "true",
      legalAid: v.NEXT_PUBLIC_FEATURE_LEGAL_AID === "true",
      training: v.NEXT_PUBLIC_FEATURE_TRAINING === "true",
    },
    monitoring: {
      sentryDsn: v.NEXT_PUBLIC_SENTRY_DSN ?? "",
      betterStackToken: v.NEXT_PUBLIC_BETTERSTACK_TOKEN ?? "",
    },
  } as const;
}

export const env = loadEnv();
