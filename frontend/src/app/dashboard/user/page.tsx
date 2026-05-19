"use client";

import { config } from "@/lib/config";
import { StatCard } from "@/components/dashboard/StatCard";
import { LiveFeed } from "@/components/dashboard/LiveFeed";
import {
  Mail, ShieldAlert, ShieldCheck,
  Puzzle, CheckCircle2, Wifi, WifiOff,
  ShieldCheck as ShieldCheckIcon,
  ArrowRight
} from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { getUserStats, type UserStats } from "@/lib/user-api";
import { getExtensionInstances, type ExtensionInstance } from "@/lib/admin-api";
import { useLanguage } from "@/components/LanguageProvider";
import { parseUTC } from "@/lib/utils";
import Link from "next/link";

// ---------------------------------------------------------------------------
// Onboarding / Protection status panel
// ---------------------------------------------------------------------------

function Step({
  number,
  label,
  done,
  children,
}: {
  number: number;
  label: string;
  done?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div
        className={`flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold mt-0.5 ${
          done
            ? "border-accent-green bg-accent-green/10 text-accent-green"
            : "border-border text-muted-foreground"
        }`}
      >
        {done ? <CheckCircle2 size={14} /> : number}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${done ? "text-accent-green" : ""}`}>{label}</p>
        {children && <div className="mt-1">{children}</div>}
      </div>
    </div>
  );
}

function OnboardingPanel({ instances }: { instances: ExtensionInstance[] }) {
  const { LOCALE } = useLanguage();
  const hasInstance = instances.length > 0;
  const hasActive = instances.some((i) => i.is_active);
  const allDone = hasInstance && hasActive;

  return (
    <div
      className={`glass-panel rounded-xl p-6 space-y-5 h-full flex flex-col ${
        allDone ? "border border-accent-green/20" : ""
      }`}
    >
      <div className="flex items-center gap-2">
        {allDone ? (
          <ShieldCheckIcon size={20} className="text-accent-green" />
        ) : (
          <Puzzle size={20} className="text-accent-cyan" />
        )}
        <h3 className={`font-semibold ${allDone ? "text-accent-green" : ""}`}>
          {allDone ? LOCALE.dashboard.user.protectedTitle : LOCALE.dashboard.user.setupTitle}
        </h3>
      </div>
      <p className="text-xs text-muted-foreground mb-2">
        {allDone ? LOCALE.dashboard.user.protectedSubtitle : LOCALE.dashboard.user.setupSubtitle}
      </p>

      <div className="space-y-4 flex-1">
        <Step number={1} label={LOCALE.dashboard.user.step1} done={hasInstance}>
          {!hasInstance && (
            <p className="text-xs text-muted-foreground mt-1">
              {LOCALE.dashboard.user.step1Hint}{" "}
              <Link href="/extension" className="text-accent-cyan hover:underline">
                {LOCALE.dashboard.user.step1Link}
              </Link>
            </p>
          )}
        </Step>

        <Step number={2} label={LOCALE.dashboard.user.step2} done={hasInstance}>
          {!hasInstance && (
            <p className="text-xs text-muted-foreground mt-1">
              {LOCALE.dashboard.user.step2Hint}
            </p>
          )}
        </Step>

        <Step number={3} label={LOCALE.dashboard.user.step3} done={hasActive}>
          {!hasActive && hasInstance && (
            <p className="text-xs text-muted-foreground mt-1">
              {LOCALE.dashboard.user.step3Hint}
            </p>
          )}
        </Step>
      </div>

      {/* Connected instances list */}
      {hasInstance && (
        <ul className="space-y-2 mt-4">
          {instances.map((inst) => (
            <li
              key={inst.id}
              className="flex items-center gap-3 rounded-lg border border-border/40 bg-muted/10 px-4 py-3"
            >
              <div className={inst.is_active ? "text-accent-green" : "text-muted-foreground"}>
                {inst.is_active ? <Wifi size={16} /> : <WifiOff size={16} />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{inst.browser ?? "Extension"}</p>
                {inst.last_seen && (
                  <p className="text-[11px] text-muted-foreground">
                    Last seen {parseUTC(inst.last_seen).toLocaleString()}
                  </p>
                )}
              </div>
              <span
                className={`flex-shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  inst.is_active
                    ? "bg-accent-green/10 text-accent-green"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {inst.is_active ? LOCALE.common.active : LOCALE.common.idle}
              </span>
            </li>
          ))}
        </ul>
      )}

      <Link
        href="/dashboard/user/settings"
        className="inline-flex items-center gap-1.5 text-xs text-accent-cyan hover:underline mt-2"
      >
        {LOCALE.dashboard.user.manageExtension} <ArrowRight size={12} />
      </Link>

      <div className="pt-4 border-t border-border/50">
        <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <ShieldCheckIcon size={16} className="text-accent-cyan" />
          {LOCALE.dashboard.user.securityCenter}
        </h4>
        <div className="rounded-xl border border-border/50 bg-background/20 px-4 py-3 space-y-2">
          <p className="text-xs text-muted-foreground">
            {LOCALE.dashboard.user.securityHint}
          </p>
          <Link
            href="/dashboard/user/scan"
            className="inline-flex items-center gap-1.5 text-xs text-accent-cyan hover:underline"
          >
            {LOCALE.dashboard.user.openSecurityTools} <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function UserDashboard() {
  const { data: session } = useSession();
  const { LOCALE } = useLanguage();
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState<UserStats>({
    totalEmailsScanned: 0,
    phishingDetected: 0,
    markedSafe: 0,
    creditsRemaining: 1000,
  });
  const [instances, setInstances] = useState<ExtensionInstance[]>([]);

  useEffect(() => {
    if (session?.user?.fromBackend && session.accessToken) {
      const token = session.accessToken;
      Promise.all([
        getUserStats(token).then(setStats).catch(() => {}),
        getExtensionInstances(token).then(setInstances).catch(() => {}),
      ]).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [session]);

  const hasActiveExtension = instances.some((i) => i.is_active);

  if (loading) return null;

  return (
    <div className="flex flex-col h-full space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{LOCALE.dashboard.user.title}</h1>
        <p className="text-muted-foreground mt-2">{LOCALE.dashboard.user.subtitle}</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 shrink-0">
        <StatCard
          title={LOCALE.dashboard.user.scanned}
          value={stats.totalEmailsScanned.toLocaleString()}
          icon={Mail}
          delay={0.1}
        />
        <StatCard
          title={LOCALE.dashboard.user.threats}
          value={stats.phishingDetected.toLocaleString()}
          icon={ShieldAlert}
          valueClassName="text-accent-red"
          delay={0.2}
        />
        <StatCard
          title={LOCALE.dashboard.user.safe}
          value={stats.markedSafe.toLocaleString()}
          icon={ShieldCheck}
          valueClassName="text-accent-green"
          delay={0.3}
        />
        <StatCard
          title={LOCALE.dashboard.user.extensionStatus}
          value={hasActiveExtension ? LOCALE.dashboard.user.extensionActive : LOCALE.dashboard.user.extensionNotInstalled}
          icon={Puzzle}
          valueClassName={
            hasActiveExtension ? "text-accent-green" : "text-muted-foreground"
          }
          delay={0.4}
        />
      </div>

      {/* Bottom panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-[560px] lg:h-[680px] pb-6">
        {/* Left (Bigger): Live Feed */}
        <motion.div
           className="lg:col-span-2 h-full min-h-0"
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.15, delay: 0.15 }}
        >
          <LiveFeed />
        </motion.div>

        {/* Right (Smaller): Setup Sentra & Quick Actions */}
        <motion.div
           className="lg:col-span-1 h-full min-h-0"
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.15, delay: 0.2 }}
        >
          <OnboardingPanel instances={instances} />
        </motion.div>
      </div>
    </div>
  );
}
