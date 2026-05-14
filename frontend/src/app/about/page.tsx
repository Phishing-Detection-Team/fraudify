"use client";

import React, { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { ArrowLeft, ArrowRight, Mail, Github } from "lucide-react";
import { TeamCard, TeamMember } from "@/components/about/TeamCard";
import { ContactForm } from "@/components/about/ContactForm";
import { useLanguage } from "@/components/LanguageProvider";

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
  const { tr } = useLanguage();

  const stats = [
    { value: 44, prefix: "", suffix: "K+", label: tr("about.statsEmailsTrained"), sublabel: tr("about.statsEmailsTrainedSub") },
    { value: 90, prefix: "", suffix: "%", label: tr("about.statsDetectionAccuracy"), sublabel: tr("about.statsDetectionAccuracySub") },
    { value: 800, prefix: "<", suffix: "µs", label: tr("about.statsLatency"), sublabel: tr("about.statsLatencySub") },
    { value: 4, prefix: "", suffix: "", label: tr("about.statsEngineers"), sublabel: tr("about.statsEngineersSub") },
  ];

  const teamMembers: TeamMember[] = [
    {
      name: tr("about.member1Name"),
      role: tr("about.member1Role"),
      photo: "/quy.png",
      affiliation: tr("about.affiliationUtoledo"),
      bio: tr("about.member1Bio"),
      contributions: [
        <span key="1"><strong className="text-cyan-400 font-bold">{tr("about.browserDefense")}:</strong> {tr("about.member1Contribution1")}</span>,
        <span key="2"><strong className="text-cyan-400 font-bold">{tr("about.aiSafetyTraining")}:</strong> {tr("about.member1Contribution2")}</span>,
        <span key="3"><strong className="text-cyan-400 font-bold">{tr("about.backendSecurity")}:</strong> {tr("about.member1Contribution3")}</span>,
        <span key="4"><strong className="text-cyan-400 font-bold">{tr("about.threatIntelligence")}:</strong> {tr("about.member1Contribution4")}</span>,
      ],
      skills: [
        tr("about.member1Skill1"),
        tr("about.member1Skill2"),
        tr("about.member1Skill3"),
        tr("about.member1Skill4"),
        tr("about.member1Skill5"),
      ],
      links: {
        portfolio: "https://thienquypham.vercel.app/",
        linkedin: "https://www.linkedin.com/in/thienquypham/",
        github: "https://github.com/thienquy05",
      },
    },
    {
      name: tr("about.member2Name"),
      role: tr("about.member2Role"),
      photo: "/hoang.png",
      affiliation: tr("about.affiliationStudent"),
      bio: tr("about.member2Bio"),
      contributions: [
        <span key="1"><strong className="text-cyan-400 font-bold">{tr("about.backendArchitecture")}:</strong> {tr("about.member2Contribution1")}</span>,
        <span key="2"><strong className="text-cyan-400 font-bold">{tr("about.cachingStrategy")}:</strong> {tr("about.member2Contribution2")}</span>,
        <span key="3"><strong className="text-cyan-400 font-bold">{tr("about.aiOrchestration")}:</strong> {tr("about.member2Contribution3")}</span>,
      ],
      skills: [
        tr("about.member2Skill1"),
        tr("about.member2Skill2"),
        tr("about.member2Skill3"),
        tr("about.member2Skill4"),
        tr("about.member2Skill5"),
      ],
      links: {
        portfolio: "https://hoangnhatduyle.github.io/portfolio/",
        linkedin: "https://www.linkedin.com/in/hoangnhatduyle/",
        github: "https://github.com/hoangnhatduyle",
      },
    },
    {
      name: tr("about.member3Name"),
      affiliation: tr("about.affiliationStudent"),
      role: tr("about.member3Role"),
      bio: tr("about.member3Bio"),
      contributions: [
        tr("about.member3Contribution1"),
        tr("about.member3Contribution2"),
        tr("about.member3Contribution3"),
      ],
      skills: [
        tr("about.member3Skill1"),
        tr("about.member3Skill2"),
        tr("about.member3Skill3"),
        tr("about.member3Skill4"),
        tr("about.member3Skill5"),
      ],
      links: {
        portfolio: "#",
        linkedin: "https://linkedin.com",
        github: "https://github.com",
      },
    },
    {
      name: tr("about.member4Name"),
      affiliation: tr("about.affiliationStudent"),
      role: tr("about.member4Role"),
      bio: tr("about.member4Bio"),
      contributions: [
        tr("about.member4Contribution1"),
        tr("about.member4Contribution2"),
        tr("about.member4Contribution3"),
      ],
      skills: [
        tr("about.member4Skill1"),
        tr("about.member4Skill2"),
        tr("about.member4Skill3"),
        tr("about.member4Skill4"),
        tr("about.member4Skill5"),
      ],
      links: {
        portfolio: "#",
        linkedin: "https://linkedin.com",
        github: "https://github.com",
      },
    },
  ];

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
            {tr("about.teamPill")}
          </span>
          <h1 className="text-4xl md:text-5xl xl:text-6xl font-extrabold tracking-tight pb-2">
            {tr("about.heroTitle1")} <br />
            <span className="neon-text bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">
              Sentra
            </span>
          </h1>
          <p className="text-lg md:text-xl text-foreground/70 leading-relaxed">
            {tr("about.heroSubtitle")}
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
                <span className="text-xs font-bold tracking-[0.2em] uppercase text-cyan-400">{tr("about.storyLabel")}</span>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">{tr("about.ourStory")}</h2>
                <div className="w-12 h-0.5 bg-gradient-to-r from-cyan-500 to-cyan-500/0 rounded-full" />
              </div>

              <div className="space-y-4 text-foreground/70 text-sm md:text-base leading-relaxed">
                <p>{tr("about.storyParagraph1")}</p>
                <p>{tr("about.storyParagraph2")}</p>
              </div>

              {/* Pull quote */}
              <div className="border-l-2 border-cyan-500/50 pl-4 py-1 mt-6">
                <p className="text-foreground/60 italic text-sm leading-relaxed">
                  &ldquo;{tr("about.pullQuote")}&rdquo;
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
                <span className="text-xs font-bold tracking-[0.2em] uppercase text-purple-400">{tr("about.engineeringLabel")}</span>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">{tr("about.architecture")}</h2>
                <div className="w-12 h-0.5 bg-gradient-to-r from-purple-500 to-purple-500/0 rounded-full" />
              </div>

              <div className="space-y-4 text-foreground/70 text-sm md:text-base leading-relaxed">
                <p>{tr("about.architectureParagraph1")}</p>
                <p>{tr("about.architectureParagraph2")}</p>
              </div>

              {/* Pipeline visual */}
              <div className="mt-6 glass-panel rounded-xl p-4 border border-border/30">
                <p className="text-xs font-bold tracking-widest uppercase text-muted-foreground mb-4">
                  {tr("about.detectionPipeline")}
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
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-cyan-400">{tr("about.peopleLabel")}</span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              <span className="neon-text bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">
                {tr("about.coreTeam")}
              </span>
            </h2>
            <p className="text-foreground/55 max-w-md mx-auto text-sm md:text-base">
              {tr("about.coreTeamDesc")}
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
                <span className="text-xs font-bold tracking-[0.2em] uppercase text-cyan-400">{tr("about.connectLabel")}</span>
                <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
                  {tr("about.workWith")}
                  <br />
                  <span className="neon-text bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">
                    {tr("about.ourTeam")}
                  </span>
                </h2>
                <div className="w-12 h-0.5 bg-gradient-to-r from-cyan-500 to-cyan-500/0 rounded-full" />
              </div>

              <p className="text-foreground/65 text-sm md:text-base leading-relaxed">
                {tr("about.contactReachOut")}
              </p>

              <div className="space-y-3">
                <a
                  href="mailto:team@sentra.dev"
                  className="flex items-center gap-4 glass-panel p-4 rounded-xl border border-border/30 hover:border-cyan-500/30 transition-all group"
                >
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 flex-shrink-0">
                    <Mail size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground font-medium mb-0.5">{tr("about.emailUsDirect")}</p>
                    <p className="text-sm font-semibold text-foreground group-hover:text-cyan-400 transition-colors truncate">
                      team@sentra.dev
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
                    <p className="text-xs text-muted-foreground font-medium mb-0.5">{tr("about.openSource")}</p>
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
