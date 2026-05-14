"use client";

import { Download, Chrome, Shield, Mail, Zap, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";

export default function ExtensionPage() {
  const { tr } = useLanguage();

  const INSTALL_STEPS = [
    { step: 1, titleKey: "extension.step1Title", descKey: "extension.step1Desc" },
    { step: 2, titleKey: "extension.step2Title", descKey: "extension.step2Desc" },
    { step: 3, titleKey: "extension.step3Title", descKey: "extension.step3Desc" },
    { step: 4, titleKey: "extension.step4Title", descKey: "extension.step4Desc" },
    { step: 5, titleKey: "extension.step5Title", descKey: "extension.step5Desc" },
  ];

  const FEATURES = [
    {
      icon: <Shield size={18} className="text-accent-cyan" />,
      titleKey: "extension.feature1Title",
      descKey: "extension.feature1Desc",
    },
    {
      icon: <Mail size={18} className="text-accent-purple" />,
      titleKey: "extension.feature2Title",
      descKey: "extension.feature2Desc",
    },
    {
      icon: <Zap size={18} className="text-accent-yellow" />,
      titleKey: "extension.feature3Title",
      descKey: "extension.feature3Desc",
    },
  ];

  const COMPAT_ITEMS = [
    tr("extension.chrome"),
    tr("extension.edge"),
    tr("extension.gmail"),
    tr("extension.outlook"),
  ];

  return (
    <div className="min-h-screen bg-background py-16 px-8">
      <div className="max-w-3xl mx-auto space-y-12">

        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan text-xs font-semibold uppercase tracking-wider mb-2">
            <Chrome size={12} /> {tr("extension.badge")}
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            {tr("extension.title")}
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            {tr("extension.subtitle")}
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <a
              href="#install"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent-cyan text-background font-semibold rounded-lg hover:bg-accent-cyan/90 transition-colors text-sm"
            >
              <Download size={16} />
              {tr("extension.installNow")}
            </a>
            <Link
              href="/dashboard/user"
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-border/50 rounded-lg hover:border-accent-cyan/30 transition-colors text-sm text-muted-foreground hover:text-foreground"
            >
              {tr("extension.goToDashboard")}
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <div key={f.titleKey} className="glass-panel p-5 rounded-xl space-y-2">
              <div className="flex items-center gap-2">
                {f.icon}
                <span className="font-semibold text-sm">{tr(f.titleKey)}</span>
              </div>
              <p className="text-xs text-muted-foreground">{tr(f.descKey)}</p>
            </div>
          ))}
        </div>

        {/* Install Steps */}
        <div id="install" className="space-y-4">
          <h2 className="text-xl font-bold">{tr("extension.installTitle")}</h2>
          <ol className="space-y-3">
            {INSTALL_STEPS.map(({ step, titleKey, descKey }) => (
              <li key={step} className="glass-panel p-5 rounded-xl flex gap-4 items-start" data-testid="install-step">
                <span className="shrink-0 w-7 h-7 rounded-full bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/30 flex items-center justify-center text-xs font-bold">
                  {step}
                </span>
                <div className="space-y-1">
                  <p className="font-semibold text-sm">{tr(titleKey)}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{tr(descKey)}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* Compatibility */}
        <div className="glass-panel p-6 rounded-xl space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{tr("extension.compatTitle")}</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {COMPAT_ITEMS.map((item) => (
              <div key={item} className="flex items-center gap-2 text-foreground/80">
                <CheckCircle2 size={14} className="text-accent-green shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
