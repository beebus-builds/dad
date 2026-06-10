import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { locales, defaultLocale } from "@/i18n";

const intlMiddleware = createMiddleware({
  locales: [...locales],
  defaultLocale,
  localePrefix: "always",
  localeDetection: true,
});

const PROTECTED_PREFIXES_REGEX = /^\/(en|ne)\/dashboard/;
const PUBLIC_AUTH_REGEX = /^\/(en|ne)\/(login|register|forgot-password)$/;

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const cookieName = process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME ?? "sj_token";
  const token = request.cookies.get(cookieName)?.value;

  if (PROTECTED_PREFIXES_REGEX.test(pathname) && !token) {
    const url = request.nextUrl.clone();
    const locale = pathname.split("/")[1] || defaultLocale;
    url.pathname = `/${locale}/login`;
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  if (token && PUBLIC_AUTH_REGEX.test(pathname)) {
    const url = request.nextUrl.clone();
    const locale = pathname.split("/")[1] || defaultLocale;
    url.pathname = `/${locale}/dashboard`;
    return NextResponse.redirect(url);
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
