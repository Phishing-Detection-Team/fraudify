"use client";

import { Download, Chrome, Shield, Mail, Zap, CheckCircle2 } from "lucide-react";
import Link from "next/link";

const INSTALL_STEPS = [
  {
    step: 1,
    title: "Enable Developer Mode",
    description: (
      <>
        Open <code className="px-1.5 py-0.5 bg-background/60 rounded text-accent-cyan text-xs">chrome://extensions</code> (Chrome) or{" "}
        <code className="px-1.5 py-0.5 bg-background/60 rounded text-accent-cyan text-xs">edge://extensions</code> (Edge) and toggle{" "}
        <strong>Developer mode</strong> on.
      </>
    ),
  },
  {
    step: 2,
    title: "Download the extension",
    description: (
      <>
        Download the latest <strong>Sentra Extension</strong> package and unzip it to a permanent folder on your machine.
      </>
    ),
  },
  {
    step: 3,
    title: "Load unpacked",
    description: (
      <>
        Click <strong>Load unpacked</strong> and select the unzipped <code className="px-1.5 py-0.5 bg-background/60 rounded text-accent-cyan text-xs">extension/</code> folder. The Sentra icon will appear in your toolbar.
      </>
    ),
  },
  {
    step: 4,
    title: "Log in to Sentra",
    description: (
      <>
        Click the Sentra toolbar icon and log in with your Sentra credentials. The extension will register your browser automatically.
      </>
    ),
  },
  {
    step: 5,
    title: "Open Gmail or Outlook",
    description: (
      <>
        Navigate to <strong>Gmail</strong> or <strong>Outlook Web</strong> and open any email. Sentra will scan it automatically and show a verdict banner.
      </>
    ),
  },
];

const FEATURES = [
  {
    icon: <Shield size={18} className="text-accent-cyan" />,
    title: "Auto-scan on open",
    description: "Every email you open is scanned instantly — no manual action needed.",
  },
  {
    icon: <Mail size={18} className="text-accent-purple" />,
    title: "Gmail & Outlook",
    description: "Works seamlessly with Gmail and all Outlook Web variants.",
  },
  {
    icon: <Zap size={18} className="text-accent-yellow" />,
    title: "Real-time verdict",
    description: "Color-coded banner shows phishing likelihood and AI reasoning.",
  },
];

export default function ExtensionPage() {
  return (
    <div className="min-h-screen bg-background py-16 px-8">
      <div className="max-w-3xl mx-auto space-y-12">

        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan text-xs font-semibold uppercase tracking-wider mb-2">
            <Chrome size={12} /> Browser Extension
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            Sentra Phishing Detector
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Protect your inbox automatically. Install the Sentra extension for Chrome or Edge and get real-time phishing detection on every email.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <a
              href="#install"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent-cyan text-background font-semibold rounded-lg hover:bg-accent-cyan/90 transition-colors text-sm"
            >
              <Download size={16} />
              Install Now
            </a>
            <Link
              href="/dashboard/user"
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-border/50 rounded-lg hover:border-accent-cyan/30 transition-colors text-sm text-muted-foreground hover:text-foreground"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="glass-panel p-5 rounded-xl space-y-2">
              <div className="flex items-center gap-2">
                {f.icon}
                <span className="font-semibold text-sm">{f.title}</span>
              </div>
              <p className="text-xs text-muted-foreground">{f.description}</p>
            </div>
          ))}
        </div>

        {/* Install Steps */}
        <div id="install" className="space-y-4">
          <h2 className="text-xl font-bold">Installation Guide</h2>
          <ol className="space-y-3">
            {INSTALL_STEPS.map(({ step, title, description }) => (
              <li key={step} className="glass-panel p-5 rounded-xl flex gap-4 items-start" data-testid="install-step">
                <span className="shrink-0 w-7 h-7 rounded-full bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/30 flex items-center justify-center text-xs font-bold">
                  {step}
                </span>
                <div className="space-y-1">
                  <p className="font-semibold text-sm">{title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* Compatibility */}
        <div className="glass-panel p-6 rounded-xl space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Compatibility</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {["Google Chrome 109+", "Microsoft Edge 109+", "Gmail Web", "Outlook Web (live, office, office365)"].map((item) => (
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
