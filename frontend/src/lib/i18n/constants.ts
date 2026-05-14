import type { Locale } from "./types";

export const LOCALE_COOKIE = "preferred_locale";
export const SUPPORTED_LOCALES: Locale[] = ["en", "vi"];
export const DEFAULT_LOCALE: Locale = "en";

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && SUPPORTED_LOCALES.includes(value as Locale);
}
