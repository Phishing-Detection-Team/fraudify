"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { LandingNav } from "./LandingNav";
import { ContactForm } from "@/components/about/ContactForm";
import { ArrowRight, ChevronDown, ShieldCheck, Zap, Lock } from "lucide-react";

const DOT_BG = {
  backgroundImage:
    "radial-gradient(circle at 1px 1px, hsl(var(--border)) 1px, transparent 0)",
  backgroundSize: "40px 40px",
};

const features = [
  {
    icon: ShieldCheck,
    color: "cyan",
    title: "Intelligent Threat Detection",
    body: "Trained on over 44,000 diverse emails, our AI engine uses deep contextual understanding to identify malicious intent and neutralize adversarial tricks — achieving up to 90% detection accuracy against zero-day phishing attacks within 20 seconds.",
  },
  {
    icon: Zap,
    color: "purple",
    title: "Sub-Millisecond Latency",
    body: "We've optimized our technology to scan for known threats averaging under 800 microseconds — faster than the blink of an eye. Real-time protection directly in your browser with zero perceptible lag.",
  },
  {
    icon: Lock,
    color: "cyan",
    title: "Zero-Trust Data Protection",
    body: "Security is built into the core, not bolted on. We enforce a zero-trust model where sensitive credentials are never exposed or logged in plain text, with 100% of your data cryptographically hashed and salted.",
  },
];

const teamMembers = [
  { name: "Thien Quy Pham", role: "Founder", photo: "/quy.png" },
  { name: "Hoang Nhat Duy Le", role: "Co-Founder", photo: "/hoang.png" },
  { name: "Hoang Bao Duy Le", role: "Co-Founder", photo: null },
  { name: "Thanh Dang Huynh", role: "Fullstack Developer", photo: null },
];

export default function LandingPage() {
  const handleLearnMore = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* Aurora animated backdrop — fixed, behind all content */}
      <div className="aurora-backdrop">
        <div className="aurora-orb-1" />
        <div className="aurora-orb-2" />
        <div className="aurora-orb-3" />
      </div>

      <LandingNav />

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 text-center">
        <div
          className="absolute inset-0 pointer-events-none opacity-20 select-none"
          style={DOT_BG}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative z-10 max-w-4xl mx-auto space-y-6"
        >
          <span className="inline-block text-xs font-bold tracking-[0.25em] uppercase text-cyan-400 border border-cyan-500/30 rounded-full px-4 py-1.5 bg-cyan-500/5">
            AI-Powered Phishing Detection
          </span>

          <h1 className="text-5xl md:text-6xl xl:text-7xl font-extrabold tracking-tight leading-tight">
            Stop Phishing
            <br />
            <span className="neon-text bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">
              Before It Starts
            </span>
          </h1>

          <p className="text-lg md:text-xl text-foreground/70 max-w-2xl mx-auto leading-relaxed">
            Sentra is an enterprise-grade, AI-driven browser extension that detects
            and blocks phishing attacks in real time — before you ever realize
            you&apos;re under attack.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-cyan-500 text-black font-bold text-sm tracking-wide hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(0,212,255,0.4)] hover:shadow-[0_0_30px_rgba(0,212,255,0.6)] active:scale-[0.98]"
            >
              Get Started <ArrowRight size={16} />
            </Link>
            <a
              href="#features"
              onClick={handleLearnMore}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl border border-border/60 text-foreground/80 font-semibold text-sm hover:border-cyan-500/40 hover:text-foreground transition-all"
            >
              Learn More <ChevronDown size={16} />
            </a>
          </div>
        </motion.div>

        {/* Scroll nudge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
          >
            <ChevronDown size={22} className="text-foreground/30" />
          </motion.div>
        </motion.div>
      </section>

      {/* ── Features ─────────────────────────────────────────────── */}
      <section id="features" className="relative z-10 py-24 px-4 md:px-8">
        <div className="max-w-6xl mx-auto space-y-16 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-3"
          >
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Why Choose{" "}
              <span className="neon-text bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">
                Sentra?
              </span>
            </h2>
            <p className="text-foreground/60 max-w-xl mx-auto">
              Enterprise-grade protection that installs in under 60 seconds and
              requires zero configuration.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
            }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {features.map(({ icon: Icon, color, title, body }) => (
              <motion.div
                key={title}
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                className={`glass-panel p-6 rounded-xl border ${
                  color === "cyan"
                    ? "border-cyan-500/20 hover:border-cyan-500/40"
                    : "border-purple-500/20 hover:border-purple-500/40"
                } transition-all group`}
              >
                <div
                  className={`mb-4 w-10 h-10 rounded-lg flex items-center justify-center ${
                    color === "cyan"
                      ? "bg-cyan-500/10 text-cyan-400"
                      : "bg-purple-500/10 text-purple-400"
                  }`}
                >
                  <Icon size={20} />
                </div>
                <h3
                  className={`text-lg font-bold mb-2 ${
                    color === "cyan" ? "text-cyan-400" : "text-purple-400"
                  }`}
                >
                  {title}
                </h3>
                <p className="text-foreground/70 text-sm leading-relaxed">{body}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── About Teaser ─────────────────────────────────────────── */}
      <section className="relative z-10 py-24 px-4 md:px-8 border-t border-border/20">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
          >
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
                  Built by Security
                  <br />
                  <span className="neon-text bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">
                    Enthusiasts
                  </span>
                </h2>
                <div className="w-16 h-1 bg-cyan-500 rounded-full shadow-[0_0_10px_rgba(0,255,255,0.6)]" />
              </div>
              <p className="text-foreground/70 text-base leading-relaxed">
                Sentra was born from a personal encounter with a phishing site
                indistinguishable from the real thing. That moment drove us to build
                an AI-powered platform that protects users before they realize
                they&apos;re under attack — combining cutting-edge machine learning
                with zero-trust security principles.
              </p>
              <p className="text-foreground/70 text-base leading-relaxed">
                We are a focused team of developers and security engineers united by
                one mission: making the web safer for everyone.
              </p>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-cyan-400 font-semibold hover:text-cyan-300 transition-colors group"
              >
                Meet the Team
                <ArrowRight
                  size={16}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Link>
            </div>

            {/* Avatar strip */}
            <div className="grid grid-cols-2 gap-5">
              {teamMembers.map((m) => (
                <div
                  key={m.name}
                  className="glass-panel rounded-xl p-5 flex items-center gap-4 border border-border/30 hover:border-cyan-500/30 transition-all"
                >
                  <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-border/40">
                    {m.photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={m.photo}
                        alt={m.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sm font-bold text-cyan-400">
                        {m.name
                          .split(" ")
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join("")}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-base font-semibold text-foreground truncate">{m.name}</p>
                    <p className="text-sm text-foreground/50">{m.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Contact ──────────────────────────────────────────────── */}
      <section id="contact" className="relative z-10 py-24 px-4 md:px-8 border-t border-border/20">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12 space-y-3"
          >
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Get in{" "}
              <span className="neon-text bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">
                Touch
              </span>
            </h2>
            <p className="text-foreground/60 max-w-md mx-auto">
              Questions, partnerships, or just want to say hi — we&apos;d love to
              hear from you.
            </p>
          </motion.div>
          <ContactForm />
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-border/20 py-8 px-4 text-center text-sm text-foreground/40">
        <p>© {new Date().getFullYear()} Sentra. All rights reserved.</p>
      </footer>
    </div>
  );
}
