import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HandHeart } from "lucide-react";
import { defaultLocale } from "@/i18n";

export default function RootNotFound() {
  return (
    <html lang="ne">
      <body className="min-h-screen bg-background font-sans antialiased">
        <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-6">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-union-red/5 via-transparent to-govt-blue/5"
          />
          <div className="relative z-10 mx-auto flex max-w-md flex-col items-center text-center">
            <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-union-red to-govt-blue shadow-lg shadow-union-red/20">
              <HandHeart className="h-8 w-8 text-white" />
            </div>
            <div className="mb-2 text-9xl font-black leading-none tracking-tighter text-union-red/10">
              404
            </div>
            <h1 className="mb-2 text-3xl font-bold tracking-tight">
              ओहो, यो पृष्ठ हराइरहेछ
            </h1>
            <p className="mb-8 max-w-sm leading-relaxed text-muted-foreground">
              तपाईंले खोज्दै हुनुभएको पृष्ठ अब भेटिँदैन जस्तो छ।
              हामीलाई तपाईंलाई फिर्ता मुख्य पृष्ठमा पुर्‍याऔं।
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button variant="union" asChild>
                <Link href={`/${defaultLocale}`}>गृहपृष्ठमा जानुहोस्</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href={`/${defaultLocale}/contact`}>सम्पर्क गर्नुहोस्</Link>
              </Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
