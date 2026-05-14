"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useLanguage } from "@/components/LanguageProvider";
import { Menu, X } from "lucide-react";

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

export function LandingNav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { tr } = useLanguage();

  return (
    <header className="sticky top-0 z-50 glass-panel !rounded-none border-b border-border/50">
      <div className="max-w-6xl mx-auto px-4 md:px-8 h-16 relative flex items-center justify-between">
        {/* Left: Logo */}
        <Link href="/" aria-label="Sentra home">
          <Logo />
        </Link>

        {/* Center: nav links (absolutely centered) */}
        <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-8">
          <Link
            href="/about"
            className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
          >
            {tr("nav.about")}
          </Link>
          <button
            onClick={() => scrollTo("features")}
            className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
          >
            {tr("nav.features")}
          </button>
        </nav>

        {/* Right: language + theme + auth buttons */}
        <div className="hidden md:flex items-center gap-3">
          <LanguageSelector />
          <ThemeToggle />
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-semibold rounded-lg border border-border/60 text-foreground/80 hover:text-foreground hover:border-cyan-500/60 transition-all"
          >
            {tr("nav.logIn")}
          </Link>
          <Link
            href="/signup"
            className="px-4 py-2 text-sm font-semibold rounded-lg bg-cyan-500 text-black hover:bg-cyan-400 transition-colors shadow-[0_0_12px_rgba(0,212,255,0.35)]"
          >
            {tr("nav.signUp")}
          </Link>
        </div>

        {/* Mobile controls */}
        <div className="flex md:hidden items-center gap-2">
          <LanguageSelector />
          <ThemeToggle />
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="p-2 text-muted-foreground hover:text-foreground rounded-md"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border/50 px-4 py-4 space-y-3 bg-background/95 backdrop-blur-md">
          <Link
            href="/about"
            onClick={() => setMobileOpen(false)}
            className="block text-sm font-medium text-foreground/70 hover:text-foreground py-2"
          >
            {tr("nav.about")}
          </Link>
          <button
            onClick={() => { scrollTo("features"); setMobileOpen(false); }}
            className="block w-full text-left text-sm font-medium text-foreground/70 hover:text-foreground py-2"
          >
            {tr("nav.features")}
          </button>
          <div className="flex gap-3 pt-2">
            <Link
              href="/login"
              className="flex-1 text-center px-4 py-2 text-sm font-semibold rounded-lg border border-border/60 text-foreground/80 hover:border-cyan-500/60 transition-all"
            >
              {tr("nav.logIn")}
            </Link>
            <Link
              href="/signup"
              className="flex-1 text-center px-4 py-2 text-sm font-semibold rounded-lg bg-cyan-500 text-black hover:bg-cyan-400 transition-colors"
            >
              {tr("nav.signUp")}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
