import Link from "next/link";
import { Button } from "@/components/ui/button";
import { defaultLocale } from "@/i18n";

export default function RootNotFound() {
  return (
    <html lang="en">
      <body>
        <div className="grid min-h-screen place-items-center bg-background p-6 text-center">
          <div className="max-w-md space-y-4">
            <div className="mb-2 text-8xl font-bold leading-none text-primary/20">404</div>
            <h1 className="text-2xl font-semibold tracking-tight">Hmm, this page wandered off</h1>
            <p className="text-muted-foreground leading-relaxed">
              The page you were looking for doesn&apos;t seem to exist anymore. Don&apos;t worry — let&apos;s get you back to where things are happening.
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
