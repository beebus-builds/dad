"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/i18n-navigation";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="grid min-h-screen place-items-center bg-background p-6 text-center">
          <div className="max-w-md space-y-4">
            <p className="text-6xl font-bold text-destructive">!</p>
            <h1 className="text-2xl font-semibold tracking-tight">Something went wrong</h1>
            <p className="text-muted-foreground">
              An unexpected error occurred. Our team has been notified.
            </p>
            <div className="flex justify-center gap-2">
              <Button onClick={reset}>Try again</Button>
              <Button variant="outline" asChild>
                <Link href="/">Go home</Link>
              </Button>
            </div>
            {error.digest && (
              <p className="text-xs text-muted-foreground">Error ID: {error.digest}</p>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
