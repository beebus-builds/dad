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
    return config;
  });

  instance.interceptors.response.use(
    (res) => res,
    async (error: AxiosError<{ message?: string; code?: string; details?: unknown }>) => {
      const status = error.response?.status ?? 0;
      const data = error.response?.data;

      if (status === 401 && typeof window !== "undefined") {
        Cookies.remove(env.authCookieName);
        Cookies.remove(env.authRefreshCookie);
        if (!window.location.pathname.startsWith("/login")) {
          window.location.href = "/login";
        }
      }

      throw new ApiError(
        data?.message ?? error.message ?? "An unexpected error occurred",
        status,
        data?.code,
        data?.details,
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
