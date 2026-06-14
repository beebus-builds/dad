import { Link } from "@/lib/i18n-navigation";
import { Button } from "@/components/ui/button";
import { HandHeart } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { DhakaPattern } from "@/components/decorative-pattern";

export default async function NotFound({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("common");

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-6">
      <DhakaPattern className="pointer-events-none absolute inset-0 text-union-red/5" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-union-red/[0.03] via-transparent to-govt-blue/[0.03]"
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
            <Link href="/">{t("back")}</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/contact">सम्पर्क गर्नुहोस्</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
