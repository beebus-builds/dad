"use client";

import { Lock } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import type { Permission } from "@/lib/rbac";

export function PermissionGate({
  permission,
  fallback,
  children,
}: {
  permission: Permission | Permission[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}) {
  const can = useAuthStore((s) => s.can);
  const canAny = useAuthStore((s) => s.canAny);
  const allowed = Array.isArray(permission) ? canAny(permission) : can(permission);
  if (allowed) return <>{children}</>;
  return (
    fallback ?? (
      <div className="grid place-items-center rounded-lg border bg-muted/30 p-12 text-center">
        <Lock className="mb-3 h-8 w-8 text-muted-foreground" />
        <h2 className="text-lg font-semibold">Access denied</h2>
        <p className="mt-1 max-w-md text-sm text-muted-foreground">
          You don't have permission to view this resource. Contact your administrator if you
          believe this is a mistake.
        </p>
      </div>
    )
  );
}
