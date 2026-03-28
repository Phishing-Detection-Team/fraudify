"use client";

import { config } from "@/lib/config";
import { MOCK_ROUNDS } from "@/lib/mock-data";
import { getRound } from "@/lib/admin-api";
import { ShieldAlert, ShieldCheck, ArrowLeft, Bot, Activity, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import type { Round } from "@/types";

interface BackendEmail {
  id: number;
  subject: string | null;
  generator_output: string | null;
  detector_output: string | null;
  detector_verdict: string | null;
  confidence_score: number | null;
}

export function RoundDetailView() {
  const { data: session } = useSession();
  const params = useParams();
  const [isDemo, setIsDemo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [round, setRound] = useState<Round | null>(null);
  const [emails, setEmails] = useState<BackendEmail[]>([]);

  const isAdmin = session?.user?.role === "admin";
  const baseHref = isAdmin ? "/dashboard/admin" : "/dashboard/user";
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  useEffect(() => {
    const demoFlag = localStorage.getItem(config.STORAGE_KEYS.IS_DEMO) === "true";
    setIsDemo(demoFlag);

    if (demoFlag) {
      const found = MOCK_ROUNDS.find((r) => r.id === id) ?? null;
      setRound(found as Round | null);
      setLoading(false);
      return;
    }

    if (!session?.accessToken || !session.user?.fromBackend) {
      setLoading(false);
      return;
    }

    const apiBase = config.API.BASE_URL;
    const token = session.accessToken;

    Promise.all([
      getRound(token, Number(id)),
      fetch(`${apiBase}/api/rounds/${id}/emails?per_page=100`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => (r.ok ? r.json() : { items: [] })),
    ])
      .then(([roundData, emailsJson]) => {
        setRound(roundData);
        setEmails((emailsJson.items ?? emailsJson.data ?? []) as BackendEmail[]);
      })
      .catch(() => {
        setRound(null);
        setEmails([]);
      })
      .finally(() => setLoading(false));
  }, [session, id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground gap-2">
        <Loader2 size={20} className="animate-spin" />
        Loading round details…
      </div>
    );
  }

  if (!round) {
    if (!isDemo) {
      return (
        <div className="space-y-6">
          <Link
            href={baseHref}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent-cyan transition-colors"
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
          <div className="p-8 text-center text-muted-foreground pt-20">
            Round not found or no data available yet.
          </div>
        </div>
      );
    }
    return (
      <div className="p-8 text-center text-muted-foreground pt-20">Round not found</div>
    );
  }

  // Merge demo emails with backend emails
  const displayEmails = isDemo
    ? round.emails
    : emails.map((e) => ({
        id: String(e.id),
        subject: e.subject ?? "(no subject)",
        generatorResponse: e.generator_output ?? "",
        detectorResponse: e.detector_output ?? "",
        verdict: (e.detector_verdict === "phishing" ? "phishing" : "safe") as "phishing" | "safe",
        confidence: e.confidence_score ?? 0,
        timestamp: "",
      }));

  return (
    <div className="space-y-6">
      <Link
        href={`${baseHref}/rounds`}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent-cyan transition-colors"
      >
        <ArrowLeft size={16} /> Back to Rounds
      </Link>

      <div className="glass-panel p-6 rounded-xl flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">
            Round #{round.id} details
          </h1>
          <p className="text-muted-foreground text-sm flex items-center gap-2">
            <span>{new Date(round.date).toLocaleString()}</span> •
            <span
              className={
                round.detectionRate > 80 ? "text-accent-red font-medium" : ""
              }
            >
              {round.detectionRate}% Detection
            </span>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                round.status === "completed"
                  ? "bg-accent-green/10 text-accent-green"
                  : round.status === "in_progress"
                  ? "bg-accent-cyan/10 text-accent-cyan"
                  : "bg-accent-red/10 text-accent-red"
              }`}
            >
              {round.status === "in_progress" && (
                <Loader2 size={9} className="animate-spin mr-1" />
              )}
              {round.status.replace("_", " ")}
            </span>
          </p>
        </div>

        <div className="flex gap-4">
          <div className="text-right">
            <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">
              Generator
            </div>
            <div className="flex items-center gap-2 bg-background/50 px-3 py-1.5 rounded border border-border/50 text-sm">
              <Bot size={16} className="text-accent-purple" />
              gemini-2.0-flash
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">
              Detector
            </div>
            <div className="flex items-center gap-2 bg-background/50 px-3 py-1.5 rounded border border-border/50 text-sm">
              <Activity size={16} className="text-accent-cyan" />
              claude-3-5-haiku
            </div>
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-background/50 border-b border-border/50">
              <tr>
                <th className="px-6 py-4 font-medium w-16">#</th>
                <th className="px-6 py-4 font-medium w-1/3">Subject</th>
                <th className="px-6 py-4 font-medium flex-1">Generator & Detector Responses</th>
                <th className="px-6 py-4 font-medium w-32">Verdict</th>
                <th className="px-6 py-4 font-medium w-24 text-right">Conf.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {displayEmails.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    {round.status === "in_progress"
                      ? "Round is still running — refresh to see results."
                      : "No emails processed in this round."}
                  </td>
                </tr>
              ) : (
                <AnimatePresence>
                  {displayEmails.map((email, idx) => (
                    <motion.tr
                      key={email.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(idx * 0.05, 0.5) }}
                      className={`group transition-colors ${
                        email.verdict === "phishing"
                          ? "bg-accent-red/5 hover:bg-accent-red/10"
                          : "bg-accent-green/5 hover:bg-accent-green/10"
                      }`}
                    >
                      <td className="px-6 py-4 font-mono font-medium text-muted-foreground">
                        {idx + 1}
                      </td>
                      <td className="px-6 py-4 font-medium">{email.subject}</td>
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <div className="text-xs">
                            <span className="font-semibold text-accent-purple uppercase tracking-wider mr-2 text-[10px]">
                              Gen
                            </span>
                            <span className="text-muted-foreground">
                              {email.generatorResponse}
                            </span>
                          </div>
                          <div className="text-xs">
                            <span className="font-semibold text-accent-cyan uppercase tracking-wider mr-2 text-[10px]">
                              Det
                            </span>
                            <span className="text-foreground">
                              {email.detectorResponse}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            email.verdict === "phishing"
                              ? "bg-accent-red/20 text-accent-red border border-accent-red/30"
                              : "bg-accent-green/20 text-accent-green border border-accent-green/30"
                          }`}
                        >
                          {email.verdict === "phishing" ? (
                            <ShieldAlert size={12} />
                          ) : (
                            <ShieldCheck size={12} />
                          )}
                          {email.verdict}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-medium">
                        {email.confidence}%
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
