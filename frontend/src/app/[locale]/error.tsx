"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link as LocaleLink } from "@/lib/i18n-navigation";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("common");
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
      <div className="text-9xl font-bold text-destructive/20">500</div>
      <h1 className="mt-4 text-3xl font-bold">केही गलत भयो</h1>
      <p className="mt-2 max-w-md text-muted-foreground">
        अनपेक्षित त्रुटि भयो। कृपया फेरि प्रयास गर्नुहोस् वा समस्या भइरहेमा सहायतामा सम्पर्क गर्नुहोस्।
      </p>
      <div className="mt-6 flex gap-2">
        <Button onClick={reset}>{t("tryAgain")}</Button>
        <Button asChild variant="outline">
          <LocaleLink href="/">{t("back")}</LocaleLink>
        </Button>
      </div>
    </div>
  );
}
