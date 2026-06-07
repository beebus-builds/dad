import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types";
import type { Permission } from "@/lib/rbac";
import { hasAllPermissions, hasAnyPermission, hasPermission } from "@/lib/rbac";

type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  setUser: (user: User | null) => void;
  setHydrated: (hydrated: boolean) => void;
  logout: () => void;
  can: (permission: Permission) => boolean;
  canAny: (permissions: Permission[]) => boolean;
  canAll: (permissions: Permission[]) => boolean;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isHydrated: false,
      setUser: (user) => set({ user, isAuthenticated: Boolean(user) }),
      setHydrated: (hydrated) => set({ isHydrated: hydrated }),
      logout: () => set({ user: null, isAuthenticated: false }),
      can: (permission) => hasPermission(get().user?.role, permission),
      canAny: (permissions) => hasAnyPermission(get().user?.role, permissions),
      canAll: (permissions) => hasAllPermissions(get().user?.role, permissions),
    }),
    {
      name: "sj-auth",
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
      onRehydrateStorage: () => (state) => state?.setHydrated(true),
    },
  ),
);
