import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getTranslations, setRequestLocale } from "next-intl/server";

export default async function NotFound() {
  const t = await getTranslations("common");
  return (
    <div className="grid min-h-screen place-items-center bg-background p-6 text-center">
      <div className="max-w-md space-y-4">
        <p className="text-7xl font-bold text-primary">404</p>
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("error")} — 404
        </h1>
        <p className="text-muted-foreground">
          We couldn't find the page you're looking for. It may have been moved or deleted.
        </p>
        <Button asChild>
          <Link href="/">{t("back")}</Link>
        </Button>
      </div>
    </div>
  );
}
