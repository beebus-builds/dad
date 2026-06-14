"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "@/lib/i18n-navigation";
import Cookies from "js-cookie";
import { toast } from "sonner";
import { authService, type LoginPayload, type RegisterPayload } from "@/services/auth-service";
import { useAuthStore } from "@/stores/auth-store";
import { env } from "@/lib/env";
import { QUERY_KEYS } from "@/lib/constants";

function persistTokens(access: string, refresh: string) {
  Cookies.set(env.authCookieName, access, { sameSite: "lax", expires: 1 });
  Cookies.set(env.authRefreshCookie, refresh, { sameSite: "lax", expires: 7 });
}

function clearTokens() {
  Cookies.remove(env.authCookieName);
  Cookies.remove(env.authRefreshCookie);
}

export function useLogin() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: (payload: LoginPayload) => authService.login(payload),
    onSuccess: (result) => {
      persistTokens(result.accessToken, result.refreshToken);
      setUser(result.user);
      toast.success(`Welcome back, ${result.user.fullName}`);
      router.push("/dashboard");
    },
    onError: (err: Error) => toast.error(err.message ?? "Login failed"),
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (payload: RegisterPayload) => authService.register(payload),
    onError: (err: Error) => toast.error(err.message ?? "Registration failed"),
  });
}

export function useVerifyEmail() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: ({ userId, code }: { userId: string; code: string }) => authService.verifyEmail(userId, code),
    onSuccess: (result) => {
      persistTokens(result.accessToken, result.refreshToken);
      setUser(result.user);
      toast.success("Email verified successfully");
      router.push("/dashboard");
    },
    onError: (err: Error) => toast.error(err.message ?? "Verification failed"),
  });
}

export function useResendOTP() {
  return useMutation({
    mutationFn: (userId: string) => authService.resendOTP(userId),
    onError: (err: Error) => toast.error(err.message ?? "Failed to resend code"),
  });
}

export function useLogout() {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);

  return useMutation({
    mutationFn: () => authService.logout(),
    onSettled: () => {
      clearTokens();
      logout();
      router.push("/login");
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => authService.forgotPassword(email),
    onSuccess: () => toast.success("Password reset link sent to your email"),
    onError: (err: Error) => toast.error(err.message ?? "Failed to send reset link"),
  });
}

export function useCurrentUser() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: QUERY_KEYS.auth.me,
    queryFn: () => authService.me(),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}
