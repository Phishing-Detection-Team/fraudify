"use client";

import { StatCard } from "@/components/dashboard/StatCard";
import { RoundTable } from "@/components/dashboard/RoundTable";
import { CostPieChart } from "@/components/dashboard/CostPieChart";
import { AgentLogsTable } from "@/components/dashboard/AgentLogsTable";
import { MOCK_STATS_ADMIN, MOCK_ROUNDS, MOCK_AGENTS } from "@/lib/mock-data";
import { Mail, ShieldAlert, BadgeDollarSign, Activity } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminDashboard() {
  const mergedCosts = MOCK_ROUNDS.flatMap(r => r.apiCosts).reduce((acc, curr) => {
    const existing = acc.find(a => a.model === curr.model);
    if (existing) {
      existing.cost += curr.cost;
      existing.calls += curr.calls;
    } else {
      acc.push({ ...curr });
    }
    return acc;
  }, [] as typeof MOCK_ROUNDS[0]["apiCosts"]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Overview</h1>
        <p className="text-muted-foreground mt-2">System performance, cost analysis, and active agents.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total API Cost"
          value={`$${MOCK_STATS_ADMIN.totalApiCost?.toLocaleString()}`}
          icon={BadgeDollarSign}
          trend={{ value: 4.5, isPositive: false }}
          delay={0.1}
          valueClassName="text-accent-cyan"
        />
        <StatCard
          title="Active Agents"
          value={MOCK_STATS_ADMIN.activeAgents || 0}
          icon={Activity}
          delay={0.2}
        />
        <StatCard
          title="Global Scanning"
          value={MOCK_STATS_ADMIN.totalEmailsScanned.toLocaleString()}
          icon={Mail}
          delay={0.3}
        />
        <StatCard
          title="Total Threats Detected"
          value={MOCK_STATS_ADMIN.phishingDetected.toLocaleString()}
          icon={ShieldAlert}
          valueClassName="text-accent-red"
          delay={0.4}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          className="lg:col-span-2 flex flex-col gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <RoundTable rounds={MOCK_ROUNDS} />
        </motion.div>
        
        <motion.div 
          className="lg:col-span-1 flex flex-col gap-6 h-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <div className="flex-1 min-h-[300px]">
            <CostPieChart data={mergedCosts} />
          </div>
          <div className="flex-1 min-h-[350px]">
            <AgentLogsTable agents={MOCK_AGENTS} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
