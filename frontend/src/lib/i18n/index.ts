import en, { privacyEn, termsEn } from "./en";
import vi, { privacyVi, termsVi } from "./vi";
import type { Locale, LegalDocument } from "./types";

export type { Locale, LegalDocument, LegalSection, LegalParagraph } from "./types";
export { LOCALE_COOKIE, SUPPORTED_LOCALES, DEFAULT_LOCALE, isLocale } from "./constants";

function getMessages(locale: Locale) {
  return locale === "vi" ? vi : en;
}

export function t(locale: Locale, key: string): string {
  const messages = getMessages(locale);
  const parts = key.split(".");
  let node: unknown = messages;
  for (const part of parts) {
    if (typeof node !== "object" || node === null) break;
    node = (node as Record<string, unknown>)[part];
  }
  if (typeof node === "string") return node;

  // Fallback to English
  node = en;
  for (const part of parts) {
    if (typeof node !== "object" || node === null) break;
    node = (node as Record<string, unknown>)[part];
  }
  return typeof node === "string" ? node : key;
}

export function getPrivacyContent(locale: Locale): LegalDocument {
  return locale === "vi" ? privacyVi : privacyEn;
}

export function getTermsContent(locale: Locale): LegalDocument {
  return locale === "vi" ? termsVi : termsEn;
}
