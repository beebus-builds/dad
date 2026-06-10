import type { MetadataRoute } from "next";
import { locales } from "@/i18n";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const now = new Date();
  const routes = [
    "",
    "about",
    "contact",
    "news",
    "events",
    "membership",
    "legal",
    "donate",
  ];
  return locales.flatMap((locale) =>
    routes.map((r) => ({
      url: `${base}/${locale}${r ? `/${r}` : ""}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: r === "" ? 1 : 0.7,
      alternates: {
        languages: Object.fromEntries(
          locales.map((alt) => [alt, `${base}/${alt}${r ? `/${r}` : ""}`]),
        ),
      },
    })),
  );
}
