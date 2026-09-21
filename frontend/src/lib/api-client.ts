import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from "axios";
import Cookies from "js-cookie";
import { env } from "@/lib/env";

export class ApiError extends Error {
  status: number;
  code?: string;
  details?: unknown;

  constructor(message: string, status: number, code?: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

type RetryableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

function cookieOpts(days: number): Cookies.CookieAttributes {
  return {
    sameSite: "lax",
    expires: days,
    // js-cookie cannot set HttpOnly (server-only); mark Secure on HTTPS
    // so tokens are never sent over plaintext. Real HttpOnly cookies
    // should be set by the backend on login responses.
    secure:
      typeof window !== "undefined" &&
      window.location.protocol === "https:",
  };
}

export function persistTokens(access: string, refresh: string) {
  Cookies.set(env.authCookieName, access, cookieOpts(1));
  Cookies.set(env.authRefreshCookie, refresh, cookieOpts(7));
}

export function clearTokens() {
  Cookies.remove(env.authCookieName);
  Cookies.remove(env.authRefreshCookie);
}

function createApiClient(): AxiosInstance {
  const instance = axios.create({
    baseURL: env.apiUrl,
    timeout: env.apiTimeout,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    withCredentials: true,
  });

  instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = typeof window !== "undefined" ? Cookies.get(env.authCookieName) : undefined;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Correlate frontend requests with backend logs.
    if (typeof window !== "undefined" && !config.headers["X-Request-ID"]) {
      config.headers["X-Request-ID"] =
        globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
    }
    return config;
  });

  instance.interceptors.response.use(
    (res) => res,
    async (error: AxiosError<{ error?: { code?: string; message?: string; details?: unknown } }>) => {
      const status = error.response?.status ?? 0;
      const err = error.response?.data?.error;
      const original = error.config as RetryableConfig | undefined;

      // Attempt one silent refresh-token rotation before forcing login.
      const isAuthCall = original?.url?.includes("/auth/");
      if (status === 401 && typeof window !== "undefined" && original && !original._retry && !isAuthCall) {
        original._retry = true;
        try {
          const refreshToken = Cookies.get(env.authRefreshCookie);
          const res = await axios.post(
            `${env.apiUrl}/auth/refresh`,
            refreshToken ? { refreshToken } : {},
            { timeout: env.apiTimeout, withCredentials: true },
          );
          const { accessToken, refreshToken: nextRefresh } = res.data?.data ?? res.data ?? {};
          if (accessToken) {
            persistTokens(accessToken, nextRefresh ?? refreshToken ?? "");
            original.headers.Authorization = `Bearer ${accessToken}`;
            return instance(original);
          }
        } catch {
          // Refresh failed — fall through to logout below.
        }
        clearTokens();
        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/login";
        }
      }

      throw new ApiError(
        err?.message ?? error.message ?? "An unexpected error occurred",
        status,
        err?.code,
        err?.details,
      );
    },
  );

  return instance;
}

export const api = createApiClient();

export type Paginated<T> = {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

export type ApiResponse<T> = {
  data: T;
  message?: string;
};
