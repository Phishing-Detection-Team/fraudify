"use client";

import React, { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { ArrowLeft, ArrowRight, Mail, Github } from "lucide-react";
import { TeamCard, TeamMember } from "@/components/about/TeamCard";
import { ContactForm } from "@/components/about/ContactForm";

const teamMembers: TeamMember[] = [
  {
    name: "Thien Quy Pham",
    role: "Founder",
    photo: "/quy.png",
    affiliation: "Computer Science Student at University of Toledo",
    bio: "Cybersecurity and AI engineer securing LLMs and stopping zero-day phishing in real time.",
    contributions: [
      <span key="1"><strong className="text-cyan-400 font-bold">Browser Defense:</strong> Built a DOM-level interception system that catches and disables hidden HTML payloads before they can trick the AI.</span>,
      <span key="2"><strong className="text-cyan-400 font-bold">AI Safety & Training:</strong> Pen-tested the LLM with prompt-injection attacks and hardened it to eliminate exploitable vulnerabilities.</span>,
      <span key="3"><strong className="text-cyan-400 font-bold">Threat Intelligence:</strong> Integrated the VirusTotal API to cross-check suspicious links against 70+ active antivirus scanners in real-time.</span>,
    ],
    skills: ["Adversarial Prompt Research", "DOM-Level Prompt Defense", "Database Schema Security", "Penetration Testing"],
    links: {
      portfolio: "https://thienquypham.vercel.app/",
      linkedin: "https://www.linkedin.com/in/thienquypham/",
      github: "https://github.com/thienquy05",
    },
  },
  {
    name: "Hoang Nhat Duy Le",
    role: "Co-Founder",
    photo: "/hoang.png",
    affiliation: "Student at University",
    bio: "Innovative problem solver with a strong background in backend systems and real-time processing architectures.",
    contributions: [
      <span key="1"><strong className="text-cyan-400 font-bold">Backend Architecture:</strong> Architected the scalable FastAPI backend infrastructure to handle high-volume real-time requests.</span>,
      <span key="2"><strong className="text-cyan-400 font-bold">Caching Strategy:</strong> Implemented the Redis caching layer to reduce scan latency by 40%.</span>,
      <span key="3"><strong className="text-cyan-400 font-bold">AI Orchestration:</strong> Designed the AI agentic orchestration logic for browser extensions.</span>,
    ],
    skills: ["FastAPI", "Redis", "Docker", "PostgreSQL", "Cloud Config"],
    links: {
      portfolio: "https://hoangnhatduyle.github.io/portfolio/",
      linkedin: "https://www.linkedin.com/in/hoangnhatduyle/",
      github: "https://github.com/hoangnhatduyle",
    },
  },
  {
    name: "Hoang Bao Duy Le",
    affiliation: "Student at University",
    role: "Co-Founder",
    bio: "Dedicated engineer focusing on robust integrations, security protocols, and maintaining flawless user experiences.",
    contributions: [
      "Integrated secure authentication and OAuth pipelines.",
      "Developed the rate-limiting and anti-abuse mechanisms.",
      "Pioneered the browser extension integration with the Sentra backend via WebSockets.",
    ],
    skills: ["Node.js", "Socket.io", "TypeScript", "Security", "REST APIs"],
    links: {
      portfolio: "#",
      linkedin: "https://linkedin.com",
      github: "https://github.com",
    },
  },
  {
    name: "Thanh Dang Huynh",
    affiliation: "Student at University",
    role: "Fullstack Developer",
    bio: "Creative developer who bridges the gap between powerful backend logic and beautiful, accessible frontend interfaces.",
    contributions: [
      "Built the modern Next.js dashboard and analytic views.",
      "Implemented the Sentra design system and Framer Motion animations.",
      "Constructed the secure Chrome Extension UI and popup logic.",
    ],
    skills: ["React", "Tailwind CSS", "Framer Motion", "Next.js", "UX/UI"],
    links: {
      portfolio: "#",
      linkedin: "https://linkedin.com",
      github: "https://github.com",
    },
  },
];

const stats = [
  { value: 44, prefix: "", suffix: "K+", label: "Emails Trained", sublabel: "Diverse phishing dataset" },
  { value: 90, prefix: "", suffix: "%", label: "Detection Accuracy", sublabel: "Against zero-day attacks" },
  { value: 800, prefix: "<", suffix: "µs", label: "Scan Latency", sublabel: "Faster than a blink" },
  { value: 4, prefix: "", suffix: "", label: "Engineers", sublabel: "Building your shield" },
];

const pipeline = [
  { label: "Browser\nExtension", accent: "cyan" },
  { label: "WebSocket\nBridge", accent: "none" },
  { label: "FastAPI\nBackend", accent: "purple" },
  { label: "Redis\nCache", accent: "none" },
  { label: "LLM\nEngine", accent: "cyan" },
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

export default function AboutPage() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      {/* Aurora backdrop */}
      <div className="aurora-backdrop">
        <div className="aurora-orb-1" />
        <div className="aurora-orb-2" />
        <div className="aurora-orb-3" />
      </div>

      {/* Back arrow */}
      <motion.div
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className="fixed top-5 left-5 z-50"
      >
        <Link
          href="/"
          aria-label="Back to home"
          className="flex items-center justify-center w-9 h-9 rounded-full glass-panel border border-border/50 text-foreground/50 hover:text-foreground hover:border-cyan-500/50 hover:shadow-[0_0_12px_rgba(0,212,255,0.2)] transition-all duration-200"
        >
          <ArrowLeft size={15} />
        </Link>
      </motion.div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 relative z-10">

        {/* ── Hero ────────────────────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto pt-24 pb-4 space-y-6"
        >
          <span className="inline-block text-xs font-bold tracking-[0.25em] uppercase text-cyan-400 border border-cyan-500/30 rounded-full px-4 py-1.5 bg-cyan-500/5">
            The People Behind the Shield
          </span>
          <h1 className="text-4xl md:text-5xl xl:text-6xl font-extrabold tracking-tight pb-2">
            Meet the Minds Behind{" "}
            <br />
            <span className="neon-text bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">
              Sentra
            </span>
          </h1>
          <p className="text-lg md:text-xl text-foreground/70 leading-relaxed">
            A focused team of developers and security enthusiasts united by one mission:
            making the web a safer place — before you even know it needs to be.
          </p>
        </motion.section>

        {/* ── Stats Strip ─────────────────────────────────────────── */}
        <section className="py-16">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.3 } },
            }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5"
          >
            {stats.map((stat) => (
              <motion.div
                key={stat.label}
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                className="glass-panel rounded-2xl p-6 md:p-7 text-center border border-border/30 hover:border-cyan-500/30 transition-all duration-300 group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-purple-500/0 group-hover:from-cyan-500/5 group-hover:to-purple-500/5 transition-all duration-500 pointer-events-none rounded-2xl" />
                <div className="text-4xl xl:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400 mb-2 leading-none">
                  <StatCounter value={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
                </div>
                <p className="text-sm font-bold text-foreground/85 mb-0.5">{stat.label}</p>
                <p className="text-xs text-muted-foreground">{stat.sublabel}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ── Story & Architecture ─────────────────────────────────── */}
        <section className="border-t border-border/20 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

            {/* Our Story */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="space-y-5"
            >
              <div className="space-y-3">
                <span className="text-xs font-bold tracking-[0.2em] uppercase text-cyan-400">01 — Origin</span>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Our Story</h2>
                <div className="w-12 h-0.5 bg-gradient-to-r from-cyan-500 to-cyan-500/0 rounded-full" />
              </div>

              <div className="space-y-4 text-foreground/70 text-sm md:text-base leading-relaxed">
                <p>
                  The origins of Sentra are rooted in the rapidly evolving landscape of social engineering.
                  As malicious actors continuously develop more sophisticated tools to harvest personal data,
                  traditional security measures often fall short. The catalyst for Sentra was personal: losing
                  an account to a phishing site that was virtually indistinguishable from the real one.
                </p>
                <p>
                  That moment highlighted a critical vulnerability — if a site looks perfectly legitimate,
                  even cautious users surrender their information. This realization sparked a deep focus on
                  cybersecurity and a drive to use AI to proactively fight advanced phishing campaigns.
                  After joining forces with partners who shared this passion, we built Sentra.
                </p>
              </div>

              {/* Pull quote */}
              <div className="border-l-2 border-cyan-500/50 pl-4 py-1 mt-6">
                <p className="text-foreground/60 italic text-sm leading-relaxed">
                  &ldquo;Security should protect you before you even realize you&apos;re under attack.&rdquo;
                </p>
              </div>
            </motion.div>

            {/* Architecture */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="space-y-5"
            >
              <div className="space-y-3">
                <span className="text-xs font-bold tracking-[0.2em] uppercase text-purple-400">02 — Engineering</span>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">The Architecture</h2>
                <div className="w-12 h-0.5 bg-gradient-to-r from-purple-500 to-purple-500/0 rounded-full" />
              </div>

              <div className="space-y-4 text-foreground/70 text-sm md:text-base leading-relaxed">
                <p>
                  Building something trustworthy enough to protect people required deliberate technical decisions.
                  We recognized early that a simple approach would not withstand today&apos;s threat landscape,
                  so we engineered an architecture focused entirely on speed, privacy, and reliability.
                </p>
                <p>
                  We bridged a lightweight browser extension with a high-performance backend via WebSockets for
                  instant communication, and Redis for threat lookups faster than a single frame of video. At
                  the core is a custom LLM pipeline that analyzes emerging threats without ever storing your
                  personal data.
                </p>
              </div>

              {/* Pipeline visual */}
              <div className="mt-6 glass-panel rounded-xl p-4 border border-border/30">
                <p className="text-xs font-bold tracking-widest uppercase text-muted-foreground mb-4">
                  Detection Pipeline
                </p>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {pipeline.map((node, i) => (
                    <React.Fragment key={node.label}>
                      <div
                        className={`flex-shrink-0 px-3 py-2 rounded-lg text-[11px] font-bold text-center whitespace-pre-line border transition-colors ${
                          node.accent === "cyan"
                            ? "border-cyan-500/40 text-cyan-400 bg-cyan-500/8"
                            : node.accent === "purple"
                            ? "border-purple-500/40 text-purple-400 bg-purple-500/8"
                            : "border-border/40 text-foreground/40 bg-background/50"
                        }`}
                      >
                        {node.label}
                      </div>
                      {i < pipeline.length - 1 && (
                        <div className="flex-1 flex items-center min-w-[12px]">
                          <div className="flex-1 h-px bg-gradient-to-r from-cyan-500/30 to-purple-500/30" />
                          <ArrowRight size={9} className="text-foreground/25 flex-shrink-0" />
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── Core Team ────────────────────────────────────────────── */}
        <section className="border-t border-border/20 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-14 space-y-3"
          >
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-cyan-400">03 — People</span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              The{" "}
              <span className="neon-text bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">
                Core Team
              </span>
            </h2>
            <p className="text-foreground/55 max-w-md mx-auto text-sm md:text-base">
              Click any card to see the full profile, contributions, and tech stack.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
            }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {teamMembers.map((member, idx) => (
              <TeamCard key={idx} member={member} />
            ))}
          </motion.div>
        </section>

        {/* ── Contact ──────────────────────────────────────────────── */}
        <section id="contact" className="border-t border-border/20 py-24 pb-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

            {/* Left: heading + direct contact links */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <div className="space-y-3">
                <span className="text-xs font-bold tracking-[0.2em] uppercase text-cyan-400">04 — Connect</span>
                <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
                  Work with
                  <br />
                  <span className="neon-text bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">
                    our team
                  </span>
                </h2>
                <div className="w-12 h-0.5 bg-gradient-to-r from-cyan-500 to-cyan-500/0 rounded-full" />
              </div>

              <p className="text-foreground/65 text-sm md:text-base leading-relaxed">
                Reach out for partnerships, security research collaboration, or questions about integrating
                Sentra into your organization. We respond to every message.
              </p>

              <div className="space-y-3">
                <a
                  href="mailto:thisshoulebechanged"
                  className="flex items-center gap-4 glass-panel p-4 rounded-xl border border-border/30 hover:border-cyan-500/30 transition-all group"
                >
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 flex-shrink-0">
                    <Mail size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground font-medium mb-0.5">Email us directly</p>
                    <p className="text-sm font-semibold text-foreground group-hover:text-cyan-400 transition-colors truncate">
                      thisshoulebechanged
                    </p>
                  </div>
                </a>

                <a
                  href="https://github.com/Phishing-Detection-Team"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-4 glass-panel p-4 rounded-xl border border-border/30 hover:border-purple-500/30 transition-all group"
                >
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 flex-shrink-0">
                    <Github size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground font-medium mb-0.5">Open source</p>
                    <p className="text-sm font-semibold text-foreground group-hover:text-purple-400 transition-colors truncate">
                      github.com/Phishing-Detection-Team
                    </p>
                  </div>
                </a>
              </div>
            </motion.div>

            {/* Right: form */}
            <ContactForm />
          </div>
        </section>

      </div>
    </div>
  );
}
