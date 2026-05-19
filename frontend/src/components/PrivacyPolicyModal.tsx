
"use client";

import { useEffect, useRef } from "react";
import { Lock, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/components/LanguageProvider";
import { getPrivacyContent } from "@/lib/i18n";
import type { LegalParagraph } from "@/lib/i18n";

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function renderParagraph(p: LegalParagraph, i: number) {
  if (typeof p === "string") {
    return <p key={i} className={i > 0 ? "mt-2" : ""}>{p}</p>;
  }
  if ("subheading" in p) {
    return <p key={i} className="font-semibold mt-3 mb-1 text-foreground/90">{p.subheading}</p>;
  }
  if ("bullets" in p) {
    return (
      <ul key={i} className="mt-2 ml-4 space-y-1 list-disc list-outside">
        {p.bullets.map((b, j) => {
          const colonIdx = b.indexOf(":");
          if (colonIdx !== -1) {
            return (
              <li key={j}>
                <strong>{b.slice(0, colonIdx)}:</strong>{b.slice(colonIdx + 1)}
              </li>
            );
          }
          return <li key={j}>{b}</li>;
        })}
      </ul>
    );
  }
  return null;
}

export function PrivacyPolicyModal({ isOpen, onClose }: PrivacyPolicyModalProps) {
  const { locale } = useLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);
  const doc = getPrivacyContent(locale);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => scrollRef.current?.scrollTo({ top: 0 }), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (isOpen) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-2"
          style={{ backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="rounded-2xl w-full max-w-6xl flex flex-col overflow-hidden bg-card text-foreground h-[98vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
              <div className="flex items-center gap-3">
                <Lock className="text-accent-purple" size={22} />
                <div>
                  <h2 className="text-lg font-bold tracking-tight text-accent-purple">
                    {doc.title}
                  </h2>
                  <p className="text-xs text-muted-foreground">{doc.lastUpdated}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-accent-red/10 hover:bg-accent-red/20 text-accent-red transition-colors font-semibold text-sm"
                aria-label="Close"
                title="Close (ESC)"
              >
                <X size={18} />
                <span>{LOCALE.common.close}</span>
              </button>
            </div>

            {/* Scrollable content */}
            <div
              ref={scrollRef}
              className="overflow-y-auto flex-1 px-6 py-5 space-y-5 text-sm leading-relaxed text-foreground/80"
            >
              {doc.sections.map((section, si) => (
                <section key={si}>
                  <h3 className="text-base font-semibold mb-2 text-foreground">{section.title}</h3>
                  {section.content.map((p, pi) => renderParagraph(p, pi))}
                </section>
              ))}

              <p className="text-xs text-muted-foreground text-center pt-4 border-t border-border">
                {doc.footer}
              </p>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-border shrink-0 flex justify-end">
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
