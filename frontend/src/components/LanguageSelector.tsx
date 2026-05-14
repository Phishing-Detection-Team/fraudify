"use client";

import { useLanguage } from "./LanguageProvider";
import type { Locale } from "@/lib/i18n";

interface LanguageSelectorProps {
  className?: string;
}

export function LanguageSelector({ className = "" }: LanguageSelectorProps) {
  const { locale, setLocale } = useLanguage();

  const toggle = () => {
    const next: Locale = locale === "en" ? "vi" : "en";
    setLocale(next);
  };

  return (
    <button
      onClick={toggle}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border/50 text-xs font-semibold text-muted-foreground hover:text-foreground hover:border-accent-cyan/50 transition-all ${className}`}
      aria-label="Toggle language"
      title={locale === "en" ? "Switch to Vietnamese" : "Chuyển sang Tiếng Anh"}
    >
      <span>{locale === "en" ? "🇺🇸" : "🇻🇳"}</span>
      <span>{locale === "en" ? "EN" : "VI"}</span>
    </button>
  );
}
