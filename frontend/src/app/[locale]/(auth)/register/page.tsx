import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n-navigation";
import { RegisterForm } from "./register-form";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth.register" });
  return { title: t("title") };
}

export default async function RegisterPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("auth.register");
  return (
    <div className="space-y-7">
      <div className="space-y-2 text-center">
        <div className="bg-union-red/10 text-union-red mx-auto flex h-12 w-12 items-center justify-center rounded-2xl">
          <span className="text-lg font-bold">+</span>
        </div>
        <h1 className="text-3xl font-bold tracking-[-0.03em]">{t("title")}</h1>
        <p className="text-muted-foreground text-sm leading-relaxed">{t("subtitle")}</p>
      </div>
      <RegisterForm />
      <p className="text-muted-foreground text-center text-sm">
        {t("hasAccount")}{" "}
        <Link href="/login" className="text-primary font-semibold hover:underline">
          {t("signIn")}
        </Link>
      </p>
    </div>
  );
}
