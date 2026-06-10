import { Loader2 } from "lucide-react";
import { getTranslations } from "next-intl/server";

export default async function Loading() {
  const t = await getTranslations("common");
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <div className="flex items-center gap-3 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm">{t("loading")}</span>
      </div>
    </div>
  );
}
