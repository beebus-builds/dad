import { api, type ApiResponse } from "@/lib/api-client";
import type { User } from "@/types";

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
};

export type RegisterResult = {
  userId: string;
  email: string;
  message: string;
};

export type AuthResult = {
  user: User;
  accessToken: string;
  refreshToken: string;
};

export const authService = {
  async login(payload: LoginPayload): Promise<AuthResult> {
    const { data } = await api.post<ApiResponse<AuthResult>>("/auth/login", payload);
    return data.data;
  },

  async register(payload: RegisterPayload): Promise<RegisterResult> {
    const { data } = await api.post<ApiResponse<RegisterResult>>("/auth/register", payload);
    return data.data;
  },

  async verifyEmail(userId: string, code: string): Promise<AuthResult> {
    const { data } = await api.post<ApiResponse<AuthResult>>("/auth/verify-email", { userId, code });
    return data.data;
  },

  async resendOTP(userId: string): Promise<void> {
    await api.post("/auth/resend-otp", { userId });
  },

  async logout(): Promise<void> {
    await api.post("/auth/logout").catch(() => undefined);
  },
  async me(): Promise<User> {
    const { data } = await api.get<ApiResponse<User>>("/auth/me");
    return data.data;
  },
  async updateProfile(payload: { fullName?: string; phone?: string }): Promise<User> {
    const { data } = await api.patch<ApiResponse<User>>("/auth/profile", payload);
    return data.data;
  },
  async forgotPassword(email: string): Promise<void> {
    await api.post("/auth/forgot-password", { email });
  },
  async resetPassword(token: string, password: string): Promise<void> {
    await api.post("/auth/reset-password", { token, password });
  },
  async refresh(refreshToken: string): Promise<AuthResult> {
    const { data } = await api.post<ApiResponse<AuthResult>>("/auth/refresh", { refreshToken });
    return data.data;
  },
};
