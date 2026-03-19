"use client";

import { StatCard } from "@/components/dashboard/StatCard";
import { LiveFeed } from "@/components/dashboard/LiveFeed";
import { RoundTable } from "@/components/dashboard/RoundTable";
import { MOCK_STATS_USER, MOCK_ROUNDS } from "@/lib/mock-data";
import { Mail, ShieldAlert, ShieldCheck, Zap } from "lucide-react";
import { motion } from "framer-motion";

export default function UserDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground mt-2">Real-time insights and latest detection rounds.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Emails Scanned"
          value={MOCK_STATS_USER.totalEmailsScanned.toLocaleString()}
          icon={Mail}
          trend={{ value: 12, isPositive: true }}
          delay={0.1}
        />
        <StatCard
          title="Phishing Detected"
          value={MOCK_STATS_USER.phishingDetected.toLocaleString()}
          icon={ShieldAlert}
          valueClassName="text-accent-red"
          trend={{ value: 5, isPositive: false }}
          delay={0.2}
        />
        <StatCard
          title="Marked Safe"
          value={MOCK_STATS_USER.markedSafe.toLocaleString()}
          icon={ShieldCheck}
          valueClassName="text-accent-green"
          trend={{ value: 8, isPositive: true }}
          delay={0.3}
        />
        <StatCard
          title="Credits Remaining"
          value={MOCK_STATS_USER.creditsRemaining.toLocaleString()}
          icon={Zap}
          delay={0.4}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <RoundTable rounds={MOCK_ROUNDS} />
        </motion.div>
        
        <motion.div 
          className="lg:col-span-1 h-[500px]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <LiveFeed />
        </motion.div>
      </div>
    </div>
  );
}
