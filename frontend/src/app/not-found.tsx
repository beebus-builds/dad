import Link from "next/link";
import { Button } from "@/components/ui/button";
import { defaultLocale } from "@/i18n";

export default function RootNotFound() {
  return (
    <html lang="en">
      <body>
        <div className="grid min-h-screen place-items-center bg-background p-6 text-center">
          <div className="max-w-md space-y-4">
            <p className="text-7xl font-bold text-primary">404</p>
            <h1 className="text-2xl font-semibold tracking-tight">Page not found</h1>
            <p className="text-muted-foreground">
              The page you're looking for doesn't exist.
            </p>
            <Button asChild>
              <Link href={`/${defaultLocale}`}>Go to homepage</Link>
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}
