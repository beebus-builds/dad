"use client";

import { useEffect } from "react";
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
    <html lang="ne">
      <body>
        <div className="grid min-h-screen place-items-center bg-background p-6 text-center">
          <div className="max-w-md space-y-4">
            <p className="text-6xl font-bold text-destructive">!</p>
            <h1 className="text-2xl font-semibold tracking-tight">केही गलत भयो</h1>
            <p className="text-muted-foreground">
              अनपेक्षित त्रुटि भयो। हाम्रो टोलालाई सूचित गरिएको छ।
            </p>
            <div className="flex justify-center gap-2">
              <Button onClick={reset}>फेरि प्रयास गर्नुहोस्</Button>
              <Button variant="outline" asChild>
                <Link href="/">गृहमा जानुहोस्</Link>
              </Button>
            </div>
            {error.digest && (
              <p className="text-xs text-muted-foreground">त्रुटि ID: {error.digest}</p>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
