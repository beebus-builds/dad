"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "@/lib/i18n-navigation";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isHydrated } = useAuthStore();

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      const redirect = encodeURIComponent(pathname);
      router.replace(`/login?redirect=${redirect}`);
    }
  }, [isHydrated, isAuthenticated, router, pathname]);

  if (!isHydrated || !isAuthenticated) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  return <>{children}</>;
}
