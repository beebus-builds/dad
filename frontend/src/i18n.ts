import { getRequestConfig } from "next-intl/server";
import { notFound } from "next/navigation";

export const locales = ["en", "ne"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "ne";

export const localeLabels: Record<Locale, string> = {
  en: "English",
  ne: "नेपाली",
};

export const localeHtmlLang: Record<Locale, string> = {
  en: "en",
  ne: "ne",
};

export const localeBcp47: Record<Locale, string> = {
  en: "en-US",
  ne: "ne-NP",
};

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = (locales as readonly string[]).includes(requested ?? "")
    ? (requested as Locale)
    : defaultLocale;

  let messages;
  try {
    messages = (await import(`./messages/${locale}.json`)).default;
  } catch {
    notFound();
  }

  return { locale, messages };
});
