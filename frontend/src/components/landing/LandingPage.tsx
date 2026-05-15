"use client";

import React, { useRef, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { LandingNav } from "./LandingNav";
import { ArrowRight, ChevronDown, ShieldCheck, Zap, Lock, Github, Link2, Linkedin } from "lucide-react";

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

const stats = [
  { value: 44, prefix: "", suffix: "K+", label: "Emails Trained", sublabel: "Diverse phishing dataset" },
  { value: 90, prefix: "", suffix: "%", label: "Detection Accuracy", sublabel: "Against zero-day attacks" },
  { value: 800, prefix: "<", suffix: "µs", label: "Scan Latency", sublabel: "Faster than a blink" },
  { value: 4, prefix: "", suffix: "", label: "Engineers", sublabel: "Building your shield" },
];

const landingTeam = [
  {
    name: "Thien Quy Pham",
    role: "Founder",
    photo: "/quy.png",
    bio: "Cybersecurity and AI engineer securing LLMs and stopping zero-day phishing in real time.",
    links: { portfolio: "https://thienquypham.vercel.app/", linkedin: "https://www.linkedin.com/in/thienquypham/", github: "https://github.com/thienquy05" },
  },
  {
    name: "Hoang Nhat Duy Le",
    role: "Co-Founder",
    photo: "/hoang.png",
    bio: "Innovative problem solver with a strong background in backend systems and real-time processing architectures.",
    links: { portfolio: "https://hoangnhatduyle.github.io/portfolio/", linkedin: "https://www.linkedin.com/in/hoangnhatduyle/", github: "https://github.com/hoangnhatduyle" },
  },
  {
    name: "Hoang Bao Duy Le",
    role: "Co-Founder",
    photo: undefined,
    bio: "Dedicated engineer focusing on robust integrations, security protocols, and maintaining flawless user experiences.",
    links: { linkedin: "https://linkedin.com", github: "https://github.com" },
  },
  {
    name: "Thanh Dang Huynh",
    role: "Fullstack Developer",
    photo: undefined,
    bio: "Creative developer bridging powerful backend logic with beautiful, accessible frontend interfaces.",
    links: { linkedin: "https://linkedin.com", github: "https://github.com" },
  },
];

function StatCounter({
  value,
  prefix = "",
  suffix = "",
}: {
  value: number;
  prefix?: string;
  suffix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let frame = 0;
    const totalFrames = 60;
    const timer = setInterval(() => {
      frame++;
      setCount(Math.floor((frame / totalFrames) * value));
      if (frame >= totalFrames) {
        setCount(value);
        clearInterval(timer);
      }
    }, 1800 / totalFrames);
    return () => clearInterval(timer);
  }, [isInView, value]);

  return (
    <span ref={ref}>
      {prefix}
      {count}
      {suffix}
    </span>
  );
}

export default function LandingPage() {
  const handleLearnMore = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background relative">
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
      <section id="features" className="relative z-10 py-14 px-4 md:px-8">
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

      {/* ── Mission & Impact ─────────────────────────────────────── */}
      <section className="relative z-10 py-16 px-4 md:px-8 border-t border-border/20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-gradient-to-br from-cyan-500/6 to-purple-500/6 blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          {/* Founding Quote */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center max-w-4xl mx-auto mb-12 relative px-8 md:px-20"
          >
            <span className="absolute -top-6 left-0 text-[8rem] font-serif leading-none select-none pointer-events-none bg-gradient-to-br from-cyan-400/25 to-transparent bg-clip-text text-transparent">
              &ldquo;
            </span>
            <p className="relative z-10 text-2xl md:text-3xl xl:text-4xl font-semibold italic text-foreground/90 leading-relaxed">
              We were phished by a site indistinguishable from the real one.
            </p>
            <p className="relative z-10 text-lg md:text-2xl text-foreground/45 italic mt-5 leading-relaxed">
              That moment of helplessness became the founding mission of Sentra.
            </p>
            <span className="absolute -bottom-6 right-0 text-[8rem] font-serif leading-none select-none pointer-events-none bg-gradient-to-bl from-purple-400/25 to-transparent bg-clip-text text-transparent">
              &rdquo;
            </span>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
            }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-10"
          >
            {stats.map((stat) => (
              <motion.div
                key={stat.label}
                variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }}
                className="glass-panel rounded-2xl p-6 md:p-8 text-center border border-border/30 hover:border-cyan-500/30 transition-all duration-300 group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-purple-500/0 group-hover:from-cyan-500/5 group-hover:to-purple-500/5 transition-all duration-500 pointer-events-none rounded-2xl" />
                <div className="text-4xl xl:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400 mb-3 leading-none">
                  <StatCounter value={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
                </div>
                <p className="text-sm font-bold text-foreground/90 mb-1">{stat.label}</p>
                <p className="text-xs text-muted-foreground">{stat.sublabel}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Team cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center mb-8"
          >
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-foreground/45">The Team</span>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
            }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-5"
          >
            {landingTeam.map((member) => (
              <motion.div
                key={member.name}
                variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
                className="glass-panel rounded-xl p-6 flex flex-col items-center text-center space-y-4 border border-border/30 hover:border-cyan-500/30 transition-all"
              >
                <div className="relative w-28 h-28 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-500 p-[2px] flex-shrink-0">
                  <div className="relative w-full h-full rounded-full bg-background flex items-center justify-center overflow-hidden">
                    {member.photo ? (
                      <Image
                        src={member.photo}
                        alt={member.name}
                        fill
                        sizes="112px"
                        quality={90}
                        className="object-cover object-[center_32%] rounded-full"
                      />
                    ) : (
                      <span className="text-3xl font-bold neon-text">{member.name.charAt(0)}</span>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-base font-bold text-foreground">{member.name}</h3>
                  <p className="text-xs text-cyan-500/80 font-medium tracking-wide">{member.role}</p>
                </div>

                <p className="text-xs text-foreground/55 leading-relaxed">{member.bio}</p>

                <div className="flex items-center justify-center gap-3 pt-1">
                  {member.links.portfolio && member.links.portfolio !== "#" && (
                    <a href={member.links.portfolio} target="_blank" rel="noreferrer" className="text-foreground/40 hover:text-cyan-500 transition-colors" aria-label="Portfolio">
                      <Link2 size={15} />
                    </a>
                  )}
                  {member.links.linkedin && (
                    <a href={member.links.linkedin} target="_blank" rel="noreferrer" className="text-foreground/40 hover:text-cyan-500 transition-colors" aria-label="LinkedIn">
                      <Linkedin size={15} />
                    </a>
                  )}
                  {member.links.github && (
                    <a href={member.links.github} target="_blank" rel="noreferrer" className="text-foreground/40 hover:text-cyan-500 transition-colors" aria-label="GitHub">
                      <Github size={15} />
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────── */}
      <section
        id="contact"
        className="relative z-10 py-20 px-4 md:px-8 border-t border-border/20 overflow-hidden"
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[500px] bg-gradient-to-r from-cyan-500/7 via-purple-500/9 to-cyan-500/7 blur-3xl rounded-full" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="max-w-4xl mx-auto text-center space-y-8 relative z-10"
        >
          <div className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.25em] uppercase text-cyan-400 border border-cyan-500/30 rounded-full px-4 py-1.5 bg-cyan-500/5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            Active Protection — Install in 60 seconds
          </div>

          <h2 className="text-4xl md:text-5xl xl:text-6xl font-extrabold tracking-tight leading-tight">
            Browse the web with
            <br />
            <span className="neon-text bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">
              zero fear
            </span>
          </h2>

          <p className="text-lg md:text-xl text-foreground/55 max-w-2xl mx-auto leading-relaxed">
            A silent AI shield that activates before you know you&apos;re under attack.
            No configuration. No interruptions. Just protection.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-xl bg-cyan-500 text-black font-bold text-sm tracking-wide hover:bg-cyan-400 transition-all shadow-[0_0_30px_rgba(0,212,255,0.4)] hover:shadow-[0_0_55px_rgba(0,212,255,0.65)] active:scale-[0.98]"
            >
              Get Started Free <ArrowRight size={16} />
            </Link>
            <a
              href="https://github.com/Phishing-Detection-Team"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-xl border border-border/60 text-foreground/80 font-semibold text-sm hover:border-cyan-500/40 hover:text-foreground transition-all"
            >
              <Github size={16} />
              View on GitHub
            </a>
          </div>
        </motion.div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-border/20 py-8 px-4 text-center text-sm text-foreground/40">
        <p>© {new Date().getFullYear()} Sentra. All rights reserved.</p>
      </footer>
    </div>
  );
}
