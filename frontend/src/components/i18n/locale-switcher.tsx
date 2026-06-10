import { useLocale, useTranslations } from "next-intl";
import { useTransition, useState, useEffect } from "react";
import { usePathname, useRouter } from "@/lib/i18n-navigation";
import { locales, localeLabels, type Locale } from "@/i18n";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import Cookies from "js-cookie";

const LOCALE_COOKIE = "NEXT_LOCALE";

export function LocaleSwitcher() {
  const t = useTranslations("common");
  const currentLocale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const onSelect = (next: Locale) => {
    if (next === currentLocale) return;
    Cookies.set(LOCALE_COOKIE, next, { expires: 365, sameSite: "Lax" });
    startTransition(() => {
      router.replace(pathname, { locale: next });
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          aria-label={t("language")}
          disabled={isPending || !mounted}
          className="gap-2"
        >
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{localeLabels[currentLocale]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => onSelect(loc)}
            aria-current={loc === currentLocale ? "true" : undefined}
            className={loc === currentLocale ? "bg-accent" : ""}
          >
            {localeLabels[loc]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
