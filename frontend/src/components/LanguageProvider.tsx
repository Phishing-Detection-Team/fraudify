"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { useSession } from "next-auth/react";
import { t, LOCALE_COOKIE, isLocale } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { config } from "@/lib/config";

interface LanguageContextValue {
  locale: Locale;
  tr: (key: string) => string;
  setLocale: (locale: Locale) => Promise<void>;
}

const LanguageContext = createContext<LanguageContextValue>({
  locale: "en" as Locale,
  tr: (key: string) => t("en" as Locale, key),
  setLocale: async () => {},
});

function setCookie(locale: Locale) {
  const maxAge = 60 * 60 * 24 * 365;
  const secure = typeof window !== "undefined" && window.location.protocol === "https:" ? ";secure" : "";
  document.cookie = `${LOCALE_COOKIE}=${locale};path=/;max-age=${maxAge};samesite=lax${secure}`;
}

async function persistToBackend(accessToken: string, locale: Locale) {
  try {
    await fetch(`${config.API.BASE_URL}/api/auth/me/language`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ language: locale }),
    });
  } catch {
    // Non-critical — cookie already saved the preference
  }
}

interface LanguageProviderProps {
  initialLocale: Locale;
  children: React.ReactNode;
}

export function LanguageProvider({ initialLocale, children }: LanguageProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const { data: session } = useSession();

  const setLocale = useCallback(
    async (newLocale: Locale) => {
      setLocaleState(newLocale);
      setCookie(newLocale);
      // Sync to browser extension if available
      try {
        const chromeExt = (window as unknown as { chrome?: { storage?: { local?: { set: (v: Record<string, string>) => void } } } }).chrome;
        chromeExt?.storage?.local?.set({ sentra_locale: newLocale });
      } catch {
        // Extension not present — ignore
      }
      if (session?.accessToken) {
        await persistToBackend(session.accessToken, newLocale);
      }
    },
    [session?.accessToken],
  );

  const tr = useCallback((key: string) => t(locale, key), [locale]);

  return (
    <LanguageContext.Provider value={{ locale, tr, setLocale }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  return useContext(LanguageContext);
}

export function resolveInitialLocale(cookieHeader: string | undefined): Locale {
  if (!cookieHeader) return "en";
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${LOCALE_COOKIE}=([^;]+)`));
  const value = match?.[1]?.trim();
  return isLocale(value) ? value : "en";
}
