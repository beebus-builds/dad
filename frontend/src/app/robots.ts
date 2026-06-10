import type { MetadataRoute } from "next";
import { locales } from "@/i18n";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/dashboard", "/api", "/ne/dashboard", "/en/dashboard"] },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
