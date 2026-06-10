"use client";

import { useLocale } from "next-intl";

export function useLocaleFormat() {
  const locale = useLocale();
  const bcp47 = locale === "ne" ? "ne-NP" : "en-US";
  return {
    locale,
    bcp47,
    date: (value: string | Date, opts?: Intl.DateTimeFormatOptions) =>
      new Intl.DateTimeFormat(bcp47, {
        year: "numeric",
        month: "short",
        day: "numeric",
        ...opts,
      }).format(typeof value === "string" ? new Date(value) : value),
    dateTime: (value: string | Date) =>
      new Intl.DateTimeFormat(bcp47, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(typeof value === "string" ? new Date(value) : value),
    time: (value: string | Date) =>
      new Intl.DateTimeFormat(bcp47, {
        hour: "2-digit",
        minute: "2-digit",
      }).format(typeof value === "string" ? new Date(value) : value),
    number: (value: number, opts?: Intl.NumberFormatOptions) =>
      new Intl.NumberFormat(bcp47, opts).format(value),
    currency: (value: number, currency = "NPR") =>
      new Intl.NumberFormat(bcp47, {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
      }).format(value),
  };
}
