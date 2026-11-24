"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { 
  Building2, 
  ShieldCheck, 
  Scale, 
  TrendingUp, 
  FileText, 
  ArrowRight, 
  CheckCircle2, 
  Lock, 
  Search,
  Layers,
  ChevronRight,
  Network,
  Users,
  Compass,
  Database,
  BarChart3,
  Activity,
  Zap,
  Terminal,
  Cpu,
  Eye,
  Sliders,
  Check,
  ExternalLink,
  ShieldAlert,
  Server,
  Share2,
  Sparkles,
  MessageSquare,
  Menu,
  X
} from "lucide-react";
import AnimatedRelationshipGraph from "@/components/AnimatedRelationshipGraph";
import MeridianTopology from "@/components/MeridianTopology";

export default function LandingPage() {
  const [activePreviewTab, setActivePreviewTab] = useState<"graph" | "debate" | "financials" | "provenance">("graph");
  const [activeScenario, setActiveScenario] = useState<"base" | "bull" | "bear" | "stress">("base");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeEvidenceItem, setActiveEvidenceItem] = useState<number>(0);

  return (
    <div className="flex flex-col min-h-screen bg-[#F4F1E9] text-[#303633] font-sans selection:bg-[#172B27] selection:text-[#F4F1E9]">
      {/* =========================================================================
          TOP INSTITUTIONAL NAVIGATION (Deep Forest Executive Masthead)
         ========================================================================= */}
      <header className="fixed top-0 inset-x-0 z-50 bg-[#153B32]/95 text-[#F7F5EF] border-b border-[#233F3A] shadow-md backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          {/* Masthead Logo & Institutional Indicator */}
          <div className="flex items-center space-x-3.5">
            <Link href="/" className="flex items-center space-x-2.5 group">
              <div className="w-7 h-7 rounded-[4px] bg-[#1D4D40] border border-[#B58A4F]/70 flex items-center justify-center font-serif font-bold text-[#F7F5EF] text-sm shadow-xs group-hover:border-[#B58A4F] transition-colors">
                M
              </div>
              <span className="font-serif font-bold text-sm tracking-widest uppercase text-[#F7F5EF]">
                MERIDIAN
              </span>
            </Link>
            <div className="hidden sm:flex items-center space-x-2 pl-3 border-l border-[#2F524C]/80 text-[10px] font-mono text-[#789487]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="tracking-wider uppercase">Institutional Intelligence</span>
            </div>
          </div>

          {/* Balanced 6-Pillar Navigation */}
          <nav className="hidden lg:flex items-center space-x-6 text-xs font-mono text-[#D6D0C3]">
            <Link href="#topology" className="hover:text-[#F7F5EF] transition-colors py-1">Topology</Link>
            <Link href="#process" className="hover:text-[#F7F5EF] transition-colors py-1">Process</Link>
            <Link href="#graph" className="hover:text-[#F7F5EF] transition-colors py-1">Knowledge Graph</Link>
            <Link href="#society" className="hover:text-[#F7F5EF] transition-colors py-1">Specialists</Link>
            <Link href="#provenance" className="hover:text-[#F7F5EF] transition-colors py-1">Evidence Standard</Link>
            <Link href="#financials" className="hover:text-[#F7F5EF] transition-colors py-1">Valuation Engine</Link>
          </nav>

          {/* Medium Screen Navigation (4 pillars) */}
          <nav className="hidden md:flex lg:hidden items-center space-x-4 text-xs font-mono text-[#D6D0C3]">
            <Link href="#topology" className="hover:text-[#F7F5EF] transition-colors">Topology</Link>
            <Link href="#graph" className="hover:text-[#F7F5EF] transition-colors">Graph</Link>
            <Link href="#provenance" className="hover:text-[#F7F5EF] transition-colors">Evidence</Link>
            <Link href="#financials" className="hover:text-[#F7F5EF] transition-colors">Valuation</Link>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center space-x-2.5 sm:space-x-3">
            <Link 
              href="/demo"
              className="text-xs px-3.5 py-1.5 rounded-[4px] bg-[#1D4D40] hover:bg-[#256352] text-[#F7F5EF] border border-[#B58A4F]/60 font-mono transition-all flex items-center space-x-1.5 shadow-xs hover:border-[#B58A4F]"
            >
              <span>Live Demo</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#B58A4F]" />
            </Link>
            <Link 
              href="/app"
              className="text-xs px-4 py-1.5 rounded-[4px] bg-[#B58A4F] hover:bg-[#9E753D] text-white font-medium transition-all shadow-xs whitespace-nowrap"
            >
              Launch Workspace
            </Link>
            <button
              onClick={() => setMobileMenuOpen(prev => !prev)}
              className="md:hidden p-1.5 rounded-[4px] text-[#D6D0C3] hover:text-white hover:bg-[#1D4D40] transition-colors cursor-pointer"
              aria-label="Toggle mobile navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Slide-Down Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden animate-fadeIn">
          <div className="fixed inset-0 bg-[#153B32]/85 backdrop-blur-xs" onClick={() => setMobileMenuOpen(false)} />
          <nav className="fixed top-14 inset-x-0 bg-[#153B32] border-b border-[#233F3A] p-6 shadow-xl flex flex-col space-y-3 text-sm font-medium z-50 text-[#D6D0C3]">
            <Link href="#topology" onClick={() => setMobileMenuOpen(false)} className="hover:text-white transition-colors py-2 border-b border-[#233F3A]">Topology</Link>
            <Link href="#process" onClick={() => setMobileMenuOpen(false)} className="hover:text-white transition-colors py-2 border-b border-[#233F3A]">Process</Link>
            <Link href="#graph" onClick={() => setMobileMenuOpen(false)} className="hover:text-white transition-colors py-2 border-b border-[#233F3A]">Knowledge Graph</Link>
            <Link href="#society" onClick={() => setMobileMenuOpen(false)} className="hover:text-white transition-colors py-2 border-b border-[#233F3A]">Specialists</Link>
            <Link href="#provenance" onClick={() => setMobileMenuOpen(false)} className="hover:text-white transition-colors py-2 border-b border-[#233F3A]">Evidence Standard</Link>
            <Link href="#financials" onClick={() => setMobileMenuOpen(false)} className="hover:text-white transition-colors py-2">Valuation Engine</Link>
            <div className="pt-4 border-t border-[#233F3A] flex flex-col space-y-2.5">
              <Link href="/demo" onClick={() => setMobileMenuOpen(false)} className="w-full text-center py-2.5 rounded-[4px] bg-[#1D4D40] border border-[#B58A4F]/60 text-[#F7F5EF] text-xs font-mono">
                Explore Live Demo
              </Link>
              <Link href="/app" onClick={() => setMobileMenuOpen(false)} className="w-full text-center py-2.5 rounded-[4px] bg-[#B58A4F] text-white text-xs font-medium">
                Launch Workspace
              </Link>
            </div>
          </nav>
        </div>
      )}

      {/* =========================================================================
          HERO SECTION: Institutional Editorial Typography & Warm Ivory Canvas
         ========================================================================= */}
      <section className="relative pt-32 pb-20 px-6 max-w-7xl mx-auto w-full">
        {/* Subtle Architectural Grid Background */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.04] bg-[radial-gradient(#172B27_1px,transparent_1px)] [background-size:28px_28px]"></div>

        <div className="max-w-4xl relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center space-x-2 px-3 py-1 rounded-[4px] border border-[#D6D0C3] bg-white text-[#172B27] text-xs font-mono mb-6 shadow-xs"
          >
            <span className="w-2 h-2 rounded-full bg-[#526C60]"></span>
            <span>ENTERPRISE COMPANY INTELLIGENCE & ADVERSARIAL RESEARCH</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-6xl font-serif tracking-tight text-[#172B27] leading-[1.12] mb-4"
          >
            Understand the company behind the numbers.
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base sm:text-lg text-[#5C5850] leading-relaxed mb-6 max-w-3xl font-normal"
          >
            Independent company intelligence, backed by evidence, specialist analysis, and adversarial debate.
          </motion.p>

          {/* World-Class Autonomous Intelligence Topology (Centerpiece) */}
          <motion.div
            id="topology"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.22 }}
            className="w-full my-6 scroll-mt-20"
          >
            <MeridianTopology />
          </motion.div>

          {/* 30-Second Visual Architecture Flow Cards */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs"
          >
            <div className="p-3.5 rounded bg-white border border-[#D6D0C3] shadow-xs flex items-start space-x-3">
              <div className="w-7 h-7 rounded bg-[#172B27] text-white flex items-center justify-center font-mono font-bold text-xs shrink-0 mt-0.5">
                01
              </div>
              <div className="space-y-0.5">
                <div className="font-serif font-bold text-[#172B27] text-xs">Upload or Search Target</div>
                <p className="text-[#5C5850] text-[11px] leading-relaxed">
                  Drop any SEC 10-K, 10-Q, pitch deck or search any global company ticker.
                </p>
                <div className="text-[10px] font-mono text-[#264D3B] font-semibold pt-0.5">
                  ✓ SHA-256 Checksum Hashing
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded bg-white border border-[#D6D0C3] shadow-xs flex items-start space-x-3">
              <div className="w-7 h-7 rounded bg-[#A47B48] text-white flex items-center justify-center font-mono font-bold text-xs shrink-0 mt-0.5">
                02
              </div>
              <div className="space-y-0.5">
                <div className="font-serif font-bold text-[#172B27] text-xs">Multi-Agent Deliberation</div>
                <p className="text-[#5C5850] text-[11px] leading-relaxed">
                  6 independent specialist agents challenge claims and audit failure modes.
                </p>
                <div className="text-[10px] font-mono text-[#A47B48] font-semibold pt-0.5">
                  ⚡ 3-Round Adversarial Debate
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded bg-white border border-[#D6D0C3] shadow-xs flex items-start space-x-3">
              <div className="w-7 h-7 rounded bg-[#526C60] text-white flex items-center justify-center font-mono font-bold text-xs shrink-0 mt-0.5">
                03
              </div>
              <div className="space-y-0.5">
                <div className="font-serif font-bold text-[#172B27] text-xs">Adjudicated Intelligence Memo</div>
                <p className="text-[#5C5850] text-[11px] leading-relaxed">
                  Deterministic ratios, committee conviction verdict, and 12-section report.
                </p>
                <div className="text-[10px] font-mono text-[#172B27] font-semibold pt-0.5">
                  📄 Institutional PDF Export
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3.5"
          >
            <Link 
              href="/app"
              className="px-6 py-3 rounded-[4px] bg-[#172B27] hover:bg-[#233F3A] text-white font-medium transition-colors flex items-center justify-center space-x-2 text-xs shadow-xs"
            >
              <span>Start an Investigation</span>
              <ArrowRight className="w-4 h-4 text-[#A47B48]" />
            </Link>
            <Link 
              href="/demo"
              className="px-6 py-3 rounded-[4px] border border-[#D6D0C3] bg-white hover:bg-[#E8E3D7] text-[#172B27] font-medium transition-colors text-xs flex items-center justify-center space-x-2 shadow-xs"
            >
              <span>Explore Flagship Demo (NVIDIA Corporation)</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#79756C]" />
            </Link>
          </motion.div>
        </div>

        {/* =========================================================================
            LIVE PRODUCT WORKSTATION PREVIEW (Paper Sheet Folio)
           ========================================================================= */}
        <motion.div 
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-14 rounded-[4px] border border-[#D6D0C3] bg-white overflow-hidden shadow-sm"
        >
          {/* Top Preview Sub-Header with Operational Controls */}
          <div className="h-11 bg-[#F4F1E9] border-b border-[#D6D0C3] px-4 flex items-center justify-between text-xs font-mono text-[#79756C]">
            <div className="flex items-center space-x-3">
              <span className="font-semibold text-[#172B27]">MERIDIAN WORKSTATION</span>
              <span className="text-[#D6D0C3]">|</span>
              <span className="text-[#79756C] hidden sm:inline">SESSION NVDA-2026-INV</span>
            </div>

            {/* Preview View Mode Switcher */}
            <div className="flex items-center space-x-1 bg-white p-0.5 rounded-[3px] border border-[#D6D0C3] text-[11px]">
              {[
                { key: "graph", label: "Knowledge Graph", icon: Network },
                { key: "debate", label: "Adversarial Debate", icon: MessageSquare },
                { key: "financials", label: "Valuation Engine", icon: BarChart3 },
                { key: "provenance", label: "Claim Provenance", icon: ShieldCheck }
              ].map((tab) => {
                const Icon = tab.icon;
                const active = activePreviewTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActivePreviewTab(tab.key as any)}
                    className={`px-2.5 py-1 rounded-[3px] flex items-center space-x-1.5 transition-colors cursor-pointer ${
                      active ? "bg-[#172B27] text-white font-medium" : "text-[#79756C] hover:text-[#172B27]"
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Screen Preview Container */}
          <div className="p-6 bg-white min-h-[340px]">
            {activePreviewTab === "graph" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-mono border-b border-[#D6D0C3] pb-3">
                  <div className="flex items-center space-x-2 text-[#303633]">
                    <span className="w-2 h-2 rounded-full bg-[#172B27]"></span>
                    <span className="font-bold">SUBJECT: Palantir Technologies Inc. (NYSE: PLTR)</span>
                    <span className="text-[#79756C]">· 28 Entities · 42 Validated Edges</span>
                  </div>
                  <span className="text-[10px] text-[#264D3B] bg-[#E8E3D7] px-2 py-0.5 rounded border border-[#D6D0C3] font-mono">
                    GRAPH ENGINE: ACTIVE
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                  <div className="p-3.5 rounded-[4px] bg-[#F4F1E9] border border-[#D6D0C3] space-y-1">
                    <span className="text-[10px] font-mono text-[#79756C] uppercase tracking-wider">Sovereign Cohort</span>
                    <div className="font-serif font-bold text-[#172B27]">DoD Project Maven / TITAN</div>
                    <p className="text-[11px] text-[#5C5850]">US Army Tactical Intelligence Ground Node award (\$178.4M firm-fixed).</p>
                  </div>
                  <div className="p-3.5 rounded-[4px] bg-[#F4F1E9] border border-[#D6D0C3] space-y-1">
                    <span className="text-[10px] font-mono text-[#79756C] uppercase tracking-wider">Infrastructure Moat</span>
                    <div className="font-serif font-bold text-[#172B27]">FedRAMP High & IL-6 Cloud</div>
                    <p className="text-[11px] text-[#5C5850]">Zero-trust air-gapped deployment authority across AWS GovCloud & Azure.</p>
                  </div>
                  <div className="p-3.5 rounded-[4px] bg-[#F4F1E9] border border-[#D6D0C3] space-y-1">
                    <span className="text-[10px] font-mono text-[#79756C] uppercase tracking-wider">Commercial Expansion</span>
                    <div className="font-serif font-bold text-[#172B27]">AIP Enterprise Bootcamps</div>
                    <p className="text-[11px] text-[#5C5850]">Commercial customer count grew 83% YoY to 295 US commercial accounts.</p>
                  </div>
                  <div className="p-3.5 rounded-[4px] bg-[#F4F1E9] border border-[#D6D0C3] space-y-1">
                    <span className="text-[10px] font-mono text-[#79756C] uppercase tracking-wider">Governance Risk</span>
                    <div className="font-serif font-bold text-[#172B27]">Class F Multi-Voting Stock</div>
                    <p className="text-[11px] text-[#5C5850]">Founder voting trust maintains 49.999% irrevocable governance control.</p>
                  </div>
                </div>
              </div>
            )}

            {activePreviewTab === "debate" && (
              <div className="space-y-3 text-xs">
                <div className="p-4 rounded-[4px] bg-[#F4F1E9] border-l-4 border-l-[#94671A] border border-[#D6D0C3] space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-[#94671A] font-bold">CHALLENGE · Round #2</span>
                    <span className="text-[#79756C]">Forensic Accountant → Growth Specialist</span>
                  </div>
                  <p className="text-[#303633] font-serif leading-relaxed">
                    "Growth Lead cites 83% US commercial expansion. However, Rule of 40 accounting reveals customer concentration: Top 20 accounts represent 54% of revenue. If government procurement cycles extend, cash flow contraction risks are underpriced."
                  </p>
                </div>
                <div className="p-4 rounded-[4px] bg-[#F4F1E9] border-l-4 border-l-[#172B27] border border-[#D6D0C3] space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-[#172B27] font-bold">REBUTTAL & TOOL INVOCATION · Round #3</span>
                    <span className="text-[#79756C]">Tech Architect → Forensic Accountant</span>
                  </div>
                  <p className="text-[#303633] font-serif leading-relaxed">
                    "Invoking duckdb_math on SEC 10-K Cash Runway: Cash reserves stand at \$3.67B with zero funded debt and \$580M trailing OCF. Even under a 40% government spending freeze, operational runway exceeds 74 months."
                  </p>
                </div>
              </div>
            )}

            {activePreviewTab === "financials" && (
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
                  <div className="p-3.5 rounded-[4px] bg-[#F4F1E9] border border-[#D6D0C3]">
                    <div className="text-[10px] text-[#79756C] uppercase">FY2023 Revenue</div>
                    <div className="text-base font-serif font-bold text-[#172B27] mt-0.5 tabular-nums">\$2,225M</div>
                    <div className="text-[10px] text-[#264D3B]">+17.5% YoY</div>
                  </div>
                  <div className="p-3.5 rounded-[4px] bg-[#F4F1E9] border border-[#D6D0C3]">
                    <div className="text-[10px] text-[#79756C] uppercase">Gross Margin</div>
                    <div className="text-base font-serif font-bold text-[#172B27] mt-0.5 tabular-nums">79.5%</div>
                    <div className="text-[10px] text-[#264D3B]">Benchmark Top Quartile</div>
                  </div>
                  <div className="p-3.5 rounded-[4px] bg-[#F4F1E9] border border-[#D6D0C3]">
                    <div className="text-[10px] text-[#79756C] uppercase">Cash Reserves</div>
                    <div className="text-base font-serif font-bold text-[#172B27] mt-0.5 tabular-nums">\$3,670M</div>
                    <div className="text-[10px] text-[#526C60]">Zero Debt Balance</div>
                  </div>
                  <div className="p-3.5 rounded-[4px] bg-[#F4F1E9] border border-[#D6D0C3]">
                    <div className="text-[10px] text-[#79756C] uppercase">Operating Cash Flow</div>
                    <div className="text-base font-serif font-bold text-[#172B27] mt-0.5 tabular-nums">\$580M</div>
                    <div className="text-[10px] text-[#264D3B]">26.1% Margin</div>
                  </div>
                </div>
              </div>
            )}

            {activePreviewTab === "provenance" && (
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between text-[11px] font-mono border-b border-[#D6D0C3] pb-2">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="font-bold text-[#172B27]">CRYPTOGRAPHIC PROVENANCE LEDGER</span>
                    <span className="text-[#79756C] hidden sm:inline">· Primary Regulatory Ground Truth</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold text-[10px]">
                    100% VERIFIED DISCLOSURES
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono">
                  <div className="p-3.5 rounded bg-[#F4F1E9] border border-[#D6D0C3] space-y-2">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="px-1.5 py-0.5 rounded bg-[#172B27] text-white font-bold">SEC 10-K · ITEM 1</span>
                      <span className="text-emerald-700 font-bold">AUDITED DISCLOSURE</span>
                    </div>
                    <div className="font-serif text-[#172B27] font-semibold text-xs">
                      Single-Foundry TSMC Wafer & Packaging Allocation
                    </div>
                    <p className="font-serif text-[11px] text-[#5C5850] leading-relaxed italic bg-white/70 p-2 rounded border border-[#D6D0C3]/60">
                      "We rely on third-party foundry TSMC to manufacture our silicon wafers and utilize advanced packaging (CoWoS-L)... packaging capacity dictates delivery lead times."
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-[#79756C] pt-1 border-t border-[#D6D0C3]">
                      <span>Auditor: Supply Chain Lead</span>
                      <span className="font-mono text-[#A47B48]">SHA-256: 9f8e7d...3120</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded bg-[#F4F1E9] border border-[#D6D0C3] space-y-2">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="px-1.5 py-0.5 rounded bg-[#A47B48] text-white font-bold">SEC 10-Q · NOTE 14</span>
                      <span className="text-emerald-700 font-bold">AUDITED DISCLOSURE</span>
                    </div>
                    <div className="font-serif text-[#172B27] font-semibold text-xs">
                      Hyperscaler Customer Concentration & Capex
                    </div>
                    <p className="font-serif text-[11px] text-[#5C5850] leading-relaxed italic bg-white/70 p-2 rounded border border-[#D6D0C3]/60">
                      "Customer A and Customer B represented 14% and 11% of total revenue. Cloud service provider customers accounted for ~41% of compute segment net sales."
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-[#79756C] pt-1 border-t border-[#D6D0C3]">
                      <span>Auditor: Forensic Accountant</span>
                      <span className="font-mono text-[#A47B48]">SHA-256: 4a3b2c...1234</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </section>

      {/* =========================================================================
          SECTION 1: THE FORENSIC THESIS — LLMs vs Verifiable Ground Truth
         ========================================================================= */}
      <section id="process" className="py-20 border-t border-[#D6D0C3] bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-2xl mb-12">
            <span className="text-[10px] font-mono uppercase text-[#A47B48] tracking-wider font-semibold">The Forensic Thesis</span>
            <h2 className="text-3xl font-serif font-bold text-[#172B27] mt-1 mb-3">
              LLMs generate plausible text. Institutional research requires defensible truth.
            </h2>
            <p className="text-sm text-[#5C5850] leading-relaxed">
              When millions in capital allocation or strategic acquisitions are at stake, synthetic hallucinations, confident fabrications, and unverified summaries are catastrophic failure modes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Left: Consumer Chatbots */}
            <div className="p-6 rounded-[4px] border border-[#8B2834]/40 bg-[#F4F1E9] space-y-4">
              <div className="flex items-center space-x-2 text-[#8B2834]">
                <ShieldAlert className="w-4 h-4" />
                <h3 className="font-mono uppercase font-bold tracking-wider">Generic AI Chatbots & Summarizers</h3>
              </div>
              <ul className="space-y-2.5 text-[#5C5850]">
                <li className="flex items-start space-x-2">
                  <span className="text-[#8B2834] font-bold">✕</span>
                  <span><strong>Hallucinated Financials:</strong> Fabricates quarterly metrics and valuation multiples when exact disclosures are absent.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-[#8B2834] font-bold">✕</span>
                  <span><strong>Superficial Consensus:</strong> Agreeable prompt-following that fails to challenge corporate PR spin or hidden balance sheet risks.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-[#8B2834] font-bold">✕</span>
                  <span><strong>Zero Provenance:</strong> Unverifiable assertions with missing citations, fabricated URLs, and non-reproducible answers.</span>
                </li>
              </ul>
            </div>

            {/* Right: MERIDIAN Architecture */}
            <div className="p-6 rounded-[4px] border border-[#264D3B]/40 bg-[#F4F1E9] space-y-4">
              <div className="flex items-center space-x-2 text-[#264D3B]">
                <ShieldCheck className="w-4 h-4" />
                <h3 className="font-mono uppercase font-bold tracking-wider">MERIDIAN Research Architecture</h3>
              </div>
              <ul className="space-y-2.5 text-[#303633]">
                <li className="flex items-start space-x-2">
                  <Check className="w-4 h-4 text-[#264D3B] shrink-0 mt-0.5" />
                  <span><strong>Deterministic DuckDB OLAP:</strong> Financial ratios and sensitivity analysis calculated directly from verified disclosures.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Check className="w-4 h-4 text-[#264D3B] shrink-0 mt-0.5" />
                  <span><strong>Adversarial Specialist Society:</strong> Red-team forensic accountants actively interrogate growth theses and force concessions.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Check className="w-4 h-4 text-[#264D3B] shrink-0 mt-0.5" />
                  <span><strong>SHA-256 Cryptographic Provenance:</strong> Every claim bound to an exact immutable paragraph from SEC filings or official records.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: DYNAMIC KNOWLEDGE GRAPH SHOWCASE
         ========================================================================= */}
      <section id="graph" className="py-20 border-t border-[#D6D0C3] bg-[#F4F1E9]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-[10px] font-mono uppercase text-[#A47B48] tracking-wider font-semibold">Graph Intelligence</span>
              <h2 className="text-3xl font-serif font-bold text-[#172B27] mt-1">
                Visualizing corporate lineage, dependencies, and risk exposure.
              </h2>
            </div>
            <p className="text-xs text-[#79756C] font-mono mt-3 md:mt-0">
              DUAL-ENGINE: HTML5 CANVAS (60 FPS) + REACT FLOW v13
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div className="p-5 rounded-[4px] border border-[#D6D0C3] bg-white space-y-2.5 shadow-xs">
              <div className="w-8 h-8 rounded-[3px] bg-[#F4F1E9] border border-[#D6D0C3] flex items-center justify-center text-[#172B27]">
                <Network className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-serif font-bold text-[#172B27]">Multi-Layout Topologies</h3>
              <p className="text-[#5C5850] leading-relaxed">
                Toggle seamlessly between Force-Relaxed spatial layout, Radial Hierarchical concentric orbits, and Domain Clustering by customer cohort.
              </p>
            </div>

            <div className="p-5 rounded-[4px] border border-[#D6D0C3] bg-white space-y-2.5 shadow-xs">
              <div className="w-8 h-8 rounded-[3px] bg-[#F4F1E9] border border-[#D6D0C3] flex items-center justify-center text-[#526C60]">
                <Layers className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-serif font-bold text-[#172B27]">Entity & Provenance Directory</h3>
              <p className="text-[#5C5850] leading-relaxed">
                Collapsible side drawer with instant search across all extracted entities, degree centrality rankings, and 1-hop neighborhood highlighting.
              </p>
            </div>

            <div className="p-5 rounded-[4px] border border-[#D6D0C3] bg-white space-y-2.5 shadow-xs">
              <div className="w-8 h-8 rounded-[3px] bg-[#F4F1E9] border border-[#D6D0C3] flex items-center justify-center text-[#A47B48]">
                <Activity className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-serif font-bold text-[#172B27]">Real-Time Shock Propagation</h3>
              <p className="text-[#5C5850] leading-relaxed">
                Inject exogenous regulatory shocks or counterparty defaults; observe network illumination and immediate confidence recalibration across all nodes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: MULTI-AGENT ADVERSARIAL SOCIETY & 6-ROUND DELIBERATION
         ========================================================================= */}
      <section id="society" className="py-20 border-t border-[#D6D0C3] bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-2xl mb-12">
            <span className="text-[10px] font-mono uppercase text-[#A47B48] tracking-wider font-semibold">Adversarial Deliberation</span>
            <h2 className="text-3xl font-serif font-bold text-[#172B27] mt-1 mb-3">
              13+ Specialist Personas. Structured Cross-Examination. Zero Scripted Outcomes.
            </h2>
            <p className="text-sm text-[#5C5850] leading-relaxed">
              Every specialist operates under an independent mandate with private memories, permitted tools, and formal debate actions (`CHALLENGE`, `REBUT`, `CONCEDE`).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            {[
              { role: "Principal Systems Architect", name: "Dr. Elena Vance", mandate: "Evaluate architectural integrity, technical bottlenecks, and failure modes.", style: "First-Principles Rigorous Engineering" },
              { role: "Chief Sovereign Risk Officer", name: "Marcus Aurelius Vance", mandate: "Identify regulatory landmines, jurisdictional liability, and governance risks.", style: "Adversarial Forensic Scrutiny" },
              { role: "Chief Quantitative Economist", name: "Dr. Julian Croft", mandate: "Audit economic incentives, unit margins, and capital return thresholds.", style: "Deterministic Quantitative Modeling" },
              { role: "Counter-Thesis (Devil's Advocate)", name: "Sophia Zhang", mandate: "Dismantle dominant assumptions and expose hidden single points of failure.", style: "Uncompromising Adversarial Challenge" },
              { role: "Strategic Growth Lead", name: "Alexander Sterling", mandate: "Identify strategic moats, rapid adoption curves, and enterprise lock-in.", style: "Empirical Expansion Optimism" },
              { role: "Independent Adjudicator", name: "Hon. Evelyn Cross", mandate: "Ensure debate integrity, weight evidence, and synthesize ground truth.", style: "Objective Evidentiary Arbitration" }
            ].map((sp, idx) => (
              <div key={idx} className="p-4 rounded-[4px] border border-[#D6D0C3] bg-[#F4F1E9] space-y-2 shadow-xs">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-[#172B27] font-semibold">{sp.role}</span>
                  <span className="text-[#79756C]">#{idx + 1}</span>
                </div>
                <div className="font-serif font-bold text-[#172B27] text-sm">{sp.name}</div>
                <p className="text-[#5C5850] leading-relaxed text-[11.5px]">{sp.mandate}</p>
                <div className="text-[10px] font-mono text-[#79756C] pt-1 border-t border-[#D6D0C3]">
                  Style: {sp.style}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: EVIDENCE STANDARD & CRYPTOGRAPHIC PROVENANCE (id="provenance")
         ========================================================================= */}
      <section id="provenance" className="py-20 border-t border-[#D6D0C3] bg-white scroll-mt-14">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mb-12">
            <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-[3px] bg-[#264D3B]/10 text-[#264D3B] border border-[#264D3B]/30 font-mono text-[10px] uppercase font-bold mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Cryptographic Ground Truth Standard</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#172B27] mt-1 mb-3">
              Every strategic thesis anchored to primary proof. Zero synthetic citations.
            </h2>
            <p className="text-sm text-[#5C5850] leading-relaxed">
              MERIDIAN enforces an institutional 4-tier evidentiary verification hierarchy. Every claim, graph edge, and debate argument is mathematically bound to raw regulatory disclosures with immutable SHA-256 integrity checksums.
            </p>
          </div>

          {/* 4-Tier Evidentiary Verification Hierarchy Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12 text-xs">
            <div className="p-4 rounded-[4px] border border-[#264D3B]/40 bg-[#F4F1E9] space-y-2">
              <div className="flex items-center justify-between font-mono text-[10px]">
                <span className="px-1.5 py-0.5 rounded bg-[#264D3B] text-white font-bold">TIER 01</span>
                <span className="text-[#264D3B] font-bold">100% AUDITED</span>
              </div>
              <div className="font-serif font-bold text-sm text-[#172B27]">SEC Regulatory Filings</div>
              <p className="text-[#5C5850] text-[11px] leading-relaxed">
                Direct statutory disclosures from SEC EDGAR (Form 10-K, 10-Q, 8-K) with exact item, page, and table line references.
              </p>
            </div>

            <div className="p-4 rounded-[4px] border border-[#A47B48]/40 bg-[#F4F1E9] space-y-2">
              <div className="flex items-center justify-between font-mono text-[10px]">
                <span className="px-1.5 py-0.5 rounded bg-[#A47B48] text-white font-bold">TIER 02</span>
                <span className="text-[#A47B48] font-bold">REPORTED</span>
              </div>
              <div className="font-serif font-bold text-sm text-[#172B27]">Corporate Transcripts & Press</div>
              <p className="text-[#5C5850] text-[11px] leading-relaxed">
                Official quarterly earnings call transcripts, management Q&A disclosures, and formal investor day presentations.
              </p>
            </div>

            <div className="p-4 rounded-[4px] border border-[#172B27]/40 bg-[#F4F1E9] space-y-2">
              <div className="flex items-center justify-between font-mono text-[10px]">
                <span className="px-1.5 py-0.5 rounded bg-[#172B27] text-white font-bold">TIER 03</span>
                <span className="text-[#172B27] font-bold">DETERMINISTIC</span>
              </div>
              <div className="font-serif font-bold text-sm text-[#172B27]">OLAP Computed Formulas</div>
              <p className="text-[#5C5850] text-[11px] leading-relaxed">
                Calculated strictly in Python & DuckDB SQL arithmetic. Ratios, cash runways, and margins are never guessed by an LLM.
              </p>
            </div>

            <div className="p-4 rounded-[4px] border border-[#94671A]/40 bg-[#F4F1E9] space-y-2">
              <div className="flex items-center justify-between font-mono text-[10px]">
                <span className="px-1.5 py-0.5 rounded bg-[#94671A] text-white font-bold">TIER 04</span>
                <span className="text-[#94671A] font-bold">DISPUTED / PENDING</span>
              </div>
              <div className="font-serif font-bold text-sm text-[#172B27]">Adversarial Hypotheses</div>
              <p className="text-[#5C5850] text-[11px] leading-relaxed">
                Contested claims under active multi-agent cross-examination awaiting formal evidentiary rebuttal or judicial concession.
              </p>
            </div>
          </div>

          {/* Interactive Live Evidence Inspector Widget */}
          <div className="p-6 rounded-[4px] border border-[#D6D0C3] bg-[#F4F1E9] shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[#D6D0C3] pb-3 text-xs font-mono">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="font-bold text-[#172B27]">LIVE EVIDENCE PROVENANCE INSPECTOR</span>
                <span className="text-[#79756C]">· Click Disclosure Below</span>
              </div>
              <span className="text-[10px] text-[#264D3B] bg-white px-2 py-0.5 rounded border border-[#D6D0C3]">
                SHA-256 LEDGER: ACTIVE
              </span>
            </div>

            {/* Selector Buttons for 3 Real Filings */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { title: "TSMC Packaging Lead Times", filing: "SEC 10-K · Item 1", tag: "SUPPLY CHAIN" },
                { title: "Hyperscaler Capex Concentration", filing: "SEC 10-Q · Note 14", tag: "FORENSIC ACC" },
                { title: "BIS Compute Export Thresholds", filing: "15 CFR 744 Rule", tag: "GEOPOLITICAL" }
              ].map((item, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setActiveEvidenceItem(idx)}
                  className={`p-3 rounded text-left transition-all cursor-pointer border ${
                    activeEvidenceItem === idx
                      ? "bg-[#172B27] text-white border-[#172B27] shadow-xs"
                      : "bg-white text-[#303633] border-[#D6D0C3] hover:border-[#A47B48]"
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                    <span className={activeEvidenceItem === idx ? "text-[#A47B48]" : "text-[#79756C]"}>
                      {item.filing}
                    </span>
                    <span className={`px-1 py-0.2 rounded text-[9px] ${activeEvidenceItem === idx ? "bg-white/20 text-white" : "bg-[#F4F1E9] text-[#172B27]"}`}>
                      {item.tag}
                    </span>
                  </div>
                  <div className="font-semibold text-xs truncate">{item.title}</div>
                </button>
              ))}
            </div>

            {/* Display Active Disclosure Card */}
            <div className="p-5 rounded bg-white border border-[#D6D0C3] space-y-3">
              {activeEvidenceItem === 0 && (
                <>
                  <div className="flex items-center justify-between text-[10px] font-mono border-b border-[#D6D0C3] pb-2">
                    <span className="font-bold text-[#172B27]">SEC FORM 10-K (CIK: 0001045810) • Item 1. Business</span>
                    <span className="text-[#264D3B] font-bold">STATUS: AUDITED STATUTORY DISCLOSURE</span>
                  </div>
                  <p className="font-serif text-xs text-[#303633] leading-relaxed italic bg-[#F4F1E9] p-3 rounded border border-[#D6D0C3]">
                    "We rely on third-party foundry TSMC to manufacture our silicon wafers and utilize advanced packaging (CoWoS-L)... packaging capacity dictates delivery lead times. Any capacity constraints or geographic disruptions would materially impact revenue recognition."
                  </p>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono pt-1 text-[#79756C]">
                    <div>Auditing Persona: <span className="text-[#172B27] font-semibold">Supply Chain Forensic Auditor</span></div>
                    <div>Integrity Hash: <span className="text-[#A47B48]">SHA-256: 9f8e7d6c5b4a3120ef891234abcd5678</span></div>
                  </div>
                </>
              )}

              {activeEvidenceItem === 1 && (
                <>
                  <div className="flex items-center justify-between text-[10px] font-mono border-b border-[#D6D0C3] pb-2">
                    <span className="font-bold text-[#172B27]">SEC FORM 10-Q • Note 14. Customer Segment Concentration</span>
                    <span className="text-[#264D3B] font-bold">STATUS: AUDITED STATUTORY DISCLOSURE</span>
                  </div>
                  <p className="font-serif text-xs text-[#303633] leading-relaxed italic bg-[#F4F1E9] p-3 rounded border border-[#D6D0C3]">
                    "Customer A and Customer B represented 14% and 11% of total revenue. Top 4 cloud service provider customers accounted for ~41% of compute segment net sales, creating structural revenue sensitivity to hyperscaler capital expenditure cycles."
                  </p>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono pt-1 text-[#79756C]">
                    <div>Auditing Persona: <span className="text-[#172B27] font-semibold">Forensic Accounting Specialist</span></div>
                    <div>Integrity Hash: <span className="text-[#A47B48]">SHA-256: 4a3b2c1d9e8f70615243abcd1234ef56</span></div>
                  </div>
                </>
              )}

              {activeEvidenceItem === 2 && (
                <>
                  <div className="flex items-center justify-between text-[10px] font-mono border-b border-[#D6D0C3] pb-2">
                    <span className="font-bold text-[#172B27]">FEDERAL REGISTER • DoC Bureau of Industry & Security (15 CFR 744)</span>
                    <span className="text-[#264D3B] font-bold">STATUS: BINDING REGULATORY STATUTE</span>
                  </div>
                  <p className="font-serif text-xs text-[#303633] leading-relaxed italic bg-[#F4F1E9] p-3 rounded border border-[#D6D0C3]">
                    "Total processing performance thresholds of 4800 and interconnect bandwidth density rules restrict export of advanced accelerator systems without individual validated end-user license. Compliance revisions prohibit unmodified high-bandwidth packaging to restricted regional jurisdictions."
                  </p>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono pt-1 text-[#79756C]">
                    <div>Auditing Persona: <span className="text-[#172B27] font-semibold">Geopolitical & Export Controls Analyst</span></div>
                    <div>Integrity Hash: <span className="text-[#A47B48]">SHA-256: c8d7e6f5a4b321098765fedc4321ba98</span></div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: FINANCIAL INTELLIGENCE & SCENARIO ANALYSIS
         ========================================================================= */}
      <section id="financials" className="py-20 border-t border-[#D6D0C3] bg-[#F4F1E9]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-2xl mb-8">
            <span className="text-[10px] font-mono uppercase text-[#A47B48] tracking-wider font-semibold">Deterministic Valuation & Stress Testing</span>
            <h2 className="text-3xl font-serif font-bold text-[#172B27] mt-1 mb-3">
              In-process DuckDB OLAP calculations. Never LLM-hallucinated numbers.
            </h2>
            <p className="text-sm text-[#5C5850] leading-relaxed">
              Every financial model is calculated deterministically with pure SQL formulas over verified SEC disclosures, stress-testing valuation under four macro scenarios with institutional INR presentation.
            </p>
          </div>

          {/* Scenario Selector Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 mb-6 text-xs font-mono" role="tablist">
            {[
              { key: "base", label: "Base Case", sub: "Consensus" },
              { key: "bull", label: "Bull Expansion", sub: "+38.9%" },
              { key: "bear", label: "Bear Contraction", sub: "-30.5%" },
              { key: "stress", label: "Severe Stress Shock", sub: "-56.2%" }
            ].map((sc) => {
              const isSelected = activeScenario === sc.key;
              return (
                <button
                  key={sc.key}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveScenario(sc.key as any);
                  }}
                  className={`px-4 py-2.5 rounded-[4px] transition-all cursor-pointer flex items-center space-x-2.5 border select-none active:scale-[0.98] ${
                    isSelected
                      ? "bg-[#153B32] text-white border-[#153B32] shadow-md ring-1 ring-[#B58A4F]"
                      : "bg-white text-[#172B27] font-semibold border-[#C9C3B5] hover:border-[#153B32] hover:bg-[#FAF8F5] shadow-xs"
                  }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${isSelected ? "bg-[#B58A4F] animate-pulse" : "bg-[#C9C3B5]"}`}></span>
                  <span className="font-semibold">{sc.label}</span>
                  <span className={`text-[10px] ${isSelected ? "text-[#D6D0C3] font-bold" : "text-[#5C5850]"}`}>({sc.sub})</span>
                </button>
              );
            })}
          </div>

          {/* Dynamic Active Scenario Hero Card */}
          {(() => {
            const profiles: Record<string, {
              title: string;
              valInr: string;
              valUsd: string;
              horizon: string;
              gm: string;
              wacc: string;
              fcf: string;
              verdict: string;
              desc: string;
            }> = {
              base: {
                title: "Base Case • Standard Equilibrium Trajectory",
                valInr: "₹3,80,358 Cr",
                valUsd: "$45.2B",
                horizon: "74 Months",
                gm: "79.5%",
                wacc: "9.2%",
                fcf: "62.4%",
                verdict: "High-Conviction Allocation",
                desc: "Assumes continuous 18.2% enterprise customer cohort expansion, stable TSMC wafer yield allocation, and 75%+ gross margin durability."
              },
              bull: {
                title: "Bull Expansion • Hyperscaler Compute Supercycle",
                valInr: "₹5,28,462 Cr",
                valUsd: "$62.8B",
                horizon: "Infinite (FCF+)",
                gm: "82.0%",
                wacc: "8.5%",
                fcf: "71.0%",
                verdict: "Aggressive Outperform",
                desc: "Models accelerated CoWoS-L packaging ramp to 45k wpm, sovereign AI datacenter procurement, and Blackwell ASP expansion."
              },
              bear: {
                title: "Bear Contraction • Regulatory Density Caps & ASIC Substitution",
                valInr: "₹2,64,231 Cr",
                valUsd: "$31.4B",
                horizon: "48 Months",
                gm: "74.0%",
                wacc: "10.4%",
                fcf: "51.0%",
                verdict: "Monitored Defensive Hedge",
                desc: "Tests strict US BIS export cap enforcement across Greater China SKUs and internal custom silicon displacement (TPU / Trainium / MTIA)."
              },
              stress: {
                title: "Severe Stress Shock • Sole-Source Foundry Interruption",
                valInr: "₹1,66,617 Cr",
                valUsd: "$19.8B",
                horizon: "32 Months",
                gm: "68.0%",
                wacc: "12.8%",
                fcf: "38.0%",
                verdict: "Capital Preservation / Tactical Put",
                desc: "Simulates severe geopolitical supply chain bottlenecks, Taiwan foundry logistics choke points, and HBM packaging delays."
              }
            };
            const current = profiles[activeScenario] || profiles.base;
            return (
              <div key={activeScenario} className="mb-6 p-5 rounded-lg bg-white border border-[#D6D0C3] shadow-xs space-y-4 animate-fadeIn">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#D6D0C3] pb-3">
                  <div className="space-y-0.5">
                    <div className="text-[10px] font-mono uppercase text-[#A47B48] font-bold tracking-wider">
                      Active Stress Test Model
                    </div>
                    <div className="text-base font-serif font-bold text-[#172B27]">
                      {current.title}
                    </div>
                  </div>
                  <div className="px-3 py-1 rounded bg-[#172B27]/10 border border-[#172B27]/20 text-[#172B27] text-xs font-mono font-semibold">
                    {current.verdict}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
                  <div className="p-3 rounded bg-[#F4F1E9] border border-[#D6D0C3]">
                    <div className="text-[10px] font-mono text-[#79756C] uppercase">Implied Valuation (INR)</div>
                    <div className="text-lg font-serif font-bold text-[#172B27] mt-0.5">{current.valInr}</div>
                    <div className="text-[10px] font-mono text-[#79756C] mt-0.5">{current.valUsd} USD equiv.</div>
                  </div>
                  <div className="p-3 rounded bg-[#F4F1E9] border border-[#D6D0C3]">
                    <div className="text-[10px] font-mono text-[#79756C] uppercase">Cash Runway Horizon</div>
                    <div className="text-lg font-serif font-bold text-[#172B27] mt-0.5">{current.horizon}</div>
                    <div className="text-[10px] font-mono text-[#264D3B] mt-0.5">SEC 10-K Cash Assets</div>
                  </div>
                  <div className="p-3 rounded bg-[#F4F1E9] border border-[#D6D0C3]">
                    <div className="text-[10px] font-mono text-[#79756C] uppercase">Gross Margin Profile</div>
                    <div className="text-lg font-serif font-bold text-[#172B27] mt-0.5">{current.gm}</div>
                    <div className="text-[10px] font-mono text-[#79756C] mt-0.5">Cost of Rev Audited</div>
                  </div>
                  <div className="p-3 rounded bg-[#F4F1E9] border border-[#D6D0C3]">
                    <div className="text-[10px] font-mono text-[#79756C] uppercase">Discount Rate (WACC)</div>
                    <div className="text-lg font-serif font-bold text-[#172B27] mt-0.5">{current.wacc}</div>
                    <div className="text-[10px] font-mono text-[#79756C] mt-0.5">{current.fcf} FCF Conv.</div>
                  </div>
                </div>

                <p className="text-xs text-[#5C5850] leading-relaxed pt-2 border-t border-[#D6D0C3]/60 italic font-serif">
                  "{current.desc}"
                </p>
              </div>
            );
          })()}

          {/* Full Scenario Comparative Datagrid */}
          <div className="p-6 rounded-[4px] border border-[#D6D0C3] bg-white overflow-x-auto text-xs font-mono shadow-xs">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#D6D0C3] text-[#79756C] text-[10px] uppercase">
                  <th className="pb-2.5 px-3">Valuation & Solvency Metric</th>
                  <th className={`pb-2.5 px-3 rounded-t ${activeScenario === "base" ? "bg-[#172B27]/10 text-[#172B27] font-bold" : ""}`}>
                    Base Case {activeScenario === "base" ? "• Active" : ""}
                  </th>
                  <th className={`pb-2.5 px-3 rounded-t ${activeScenario === "bull" ? "bg-[#172B27]/10 text-[#172B27] font-bold" : ""}`}>
                    Bull Case {activeScenario === "bull" ? "• Active" : ""}
                  </th>
                  <th className={`pb-2.5 px-3 rounded-t ${activeScenario === "bear" ? "bg-[#172B27]/10 text-[#172B27] font-bold" : ""}`}>
                    Bear Case {activeScenario === "bear" ? "• Active" : ""}
                  </th>
                  <th className={`pb-2.5 px-3 rounded-t ${activeScenario === "stress" ? "bg-[#172B27]/10 text-[#172B27] font-bold" : ""}`}>
                    Stress Shock {activeScenario === "stress" ? "• Active" : ""}
                  </th>
                  <th className="pb-2.5 px-3">Verification Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D6D0C3]/60 text-[#303633]">
                <tr>
                  <td className="py-3 px-3 font-bold font-serif text-[#172B27]">Implied Enterprise Valuation (INR)</td>
                  <td className={`py-3 px-3 tabular-nums ${activeScenario === "base" ? "bg-[#172B27]/10 font-bold text-[#172B27]" : "font-medium"}`}>
                    ₹3,80,358 Cr <span className="text-[10px] text-[#79756C]">($45.2B)</span>
                  </td>
                  <td className={`py-3 px-3 tabular-nums ${activeScenario === "bull" ? "bg-[#172B27]/10 font-bold text-[#264D3B]" : "text-[#264D3B]"}`}>
                    ₹5,28,462 Cr <span className="text-[10px] text-[#79756C]">($62.8B)</span>
                  </td>
                  <td className={`py-3 px-3 tabular-nums ${activeScenario === "bear" ? "bg-[#172B27]/10 font-bold text-[#94671A]" : "text-[#94671A]"}`}>
                    ₹2,64,231 Cr <span className="text-[10px] text-[#79756C]">($31.4B)</span>
                  </td>
                  <td className={`py-3 px-3 tabular-nums ${activeScenario === "stress" ? "bg-[#172B27]/10 font-bold text-[#8B2834]" : "text-[#8B2834]"}`}>
                    ₹1,66,617 Cr <span className="text-[10px] text-[#79756C]">($19.8B)</span>
                  </td>
                  <td className="py-3 px-3 text-[#79756C]">DuckDB DCF (RBI Benchmark 84.15)</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-bold font-serif text-[#172B27]">Cash Runway Horizon</td>
                  <td className={`py-3 px-3 tabular-nums ${activeScenario === "base" ? "bg-[#172B27]/10 font-bold text-[#172B27]" : ""}`}>74 Months</td>
                  <td className={`py-3 px-3 ${activeScenario === "bull" ? "bg-[#172B27]/10 font-bold text-[#264D3B]" : "text-[#264D3B]"}`}>Infinite (FCF+)</td>
                  <td className={`py-3 px-3 tabular-nums ${activeScenario === "bear" ? "bg-[#172B27]/10 font-bold text-[#172B27]" : ""}`}>48 Months</td>
                  <td className={`py-3 px-3 tabular-nums ${activeScenario === "stress" ? "bg-[#172B27]/10 font-bold text-[#8B2834]" : ""}`}>32 Months</td>
                  <td className="py-3 px-3 text-[#79756C]">SEC 10-K Cash + ST Inv</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-bold font-serif text-[#172B27]">Top-20 Client Concentration</td>
                  <td className={`py-3 px-3 tabular-nums ${activeScenario === "base" ? "bg-[#172B27]/10 font-bold text-[#172B27]" : ""}`}>54.0%</td>
                  <td className={`py-3 px-3 tabular-nums ${activeScenario === "bull" ? "bg-[#172B27]/10 font-bold text-[#172B27]" : ""}`}>42.0%</td>
                  <td className={`py-3 px-3 tabular-nums ${activeScenario === "bear" ? "bg-[#172B27]/10 font-bold text-[#172B27]" : ""}`}>62.0%</td>
                  <td className={`py-3 px-3 tabular-nums ${activeScenario === "stress" ? "bg-[#172B27]/10 font-bold text-[#172B27]" : ""}`}>71.0%</td>
                  <td className="py-3 px-3 text-[#79756C]">Segment Revenue Reporting</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-bold font-serif text-[#172B27]">Gross Margin Stability</td>
                  <td className={`py-3 px-3 tabular-nums ${activeScenario === "base" ? "bg-[#172B27]/10 font-bold text-[#172B27]" : ""}`}>79.5%</td>
                  <td className={`py-3 px-3 tabular-nums ${activeScenario === "bull" ? "bg-[#172B27]/10 font-bold text-[#172B27]" : ""}`}>82.0%</td>
                  <td className={`py-3 px-3 tabular-nums ${activeScenario === "bear" ? "bg-[#172B27]/10 font-bold text-[#172B27]" : ""}`}>74.0%</td>
                  <td className={`py-3 px-3 tabular-nums ${activeScenario === "stress" ? "bg-[#172B27]/10 font-bold text-[#172B27]" : ""}`}>68.0%</td>
                  <td className="py-3 px-3 text-[#79756C]">Audited Cost of Revenue</td>
                </tr>
              </tbody>
            </table>
            <div className="mt-4 pt-3 border-t border-[#D6D0C3]/60 flex flex-wrap items-center justify-between gap-2 text-[10px] text-[#79756C]">
              <span>* All valuations presented in INR under Indian Numbering System standards (₹ Lakh, ₹ Crore, ₹ Lakh Crore) at 1 USD = ₹84.15 benchmark exchange rate.</span>
              <span className="font-semibold text-[#172B27]">Deterministic DuckDB OLAP Engine</span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: ENTERPRISE USE CASES
         ========================================================================= */}
      <section className="py-20 border-t border-[#D6D0C3] bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-2xl mb-12">
            <span className="text-[10px] font-mono uppercase text-[#A47B48] tracking-wider font-semibold">Operational Domains</span>
            <h2 className="text-3xl font-serif font-bold text-[#172B27] mt-1 mb-3">
              Engineered for capital allocators, forensic teams, and sovereign strategists.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
            <div className="p-5 rounded-[4px] border border-[#D6D0C3] bg-[#F4F1E9] space-y-2 shadow-xs">
              <span className="text-[10px] font-mono text-[#172B27] uppercase font-semibold">Institutional Capital</span>
              <h3 className="text-sm font-serif font-bold text-[#172B27]">Long/Short Equity Due Diligence</h3>
              <p className="text-[#5C5850] leading-relaxed">
                Test long theses against adversarial forensic red-teams before establishing multi-hundred-million-dollar positions.
              </p>
            </div>

            <div className="p-5 rounded-[4px] border border-[#D6D0C3] bg-[#F4F1E9] space-y-2 shadow-xs">
              <span className="text-[10px] font-mono text-[#526C60] uppercase font-semibold">Corporate Strategy</span>
              <h3 className="text-sm font-serif font-bold text-[#172B27]">M&A Cross-Examination</h3>
              <p className="text-[#5C5850] leading-relaxed">
                Audit integration friction, regulatory antitrust exposure, and true customer concentration prior to binding acquisition bids.
              </p>
            </div>

            <div className="p-5 rounded-[4px] border border-[#D6D0C3] bg-[#F4F1E9] space-y-2 shadow-xs">
              <span className="text-[10px] font-mono text-[#94671A] uppercase font-semibold">Forensic Accounting</span>
              <h3 className="text-sm font-serif font-bold text-[#172B27]">Short-Seller Investigation</h3>
              <p className="text-[#5C5850] leading-relaxed">
                Probe circular transactions, off-balance-sheet commitments, and aggressive revenue recognition patterns across subsidiaries.
              </p>
            </div>

            <div className="p-5 rounded-[4px] border border-[#D6D0C3] bg-[#F4F1E9] space-y-2 shadow-xs">
              <span className="text-[10px] font-mono text-[#A47B48] uppercase font-semibold">Sovereign & Defense</span>
              <h3 className="text-sm font-serif font-bold text-[#172B27]">Supply Chain Integrity</h3>
              <p className="text-[#5C5850] leading-relaxed">
                Verify defense contractor software supply chains, foreign beneficial ownership, and export control adherence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 6: ARCHITECTURE & SECURITY
         ========================================================================= */}
      <section id="architecture" className="py-20 border-t border-[#D6D0C3] bg-[#F4F1E9]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-2xl mb-12">
            <span className="text-[10px] font-mono uppercase text-[#A47B48] tracking-wider font-semibold">Production Architecture</span>
            <h2 className="text-3xl font-serif font-bold text-[#172B27] mt-1 mb-3">
              Composable, air-gappable, and observable down to the microsecond.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div className="p-5 rounded-[4px] border border-[#D6D0C3] bg-white space-y-2 shadow-xs">
              <div className="flex items-center space-x-2 text-[#172B27]">
                <Server className="w-4 h-4" />
                <h3 className="font-mono font-bold uppercase text-[11px]">In-Process OLAP & Storage</h3>
              </div>
              <p className="text-[#5C5850] leading-relaxed">
                DuckDB embedded analytics engine executing deterministic multi-scenario matrix evaluations in &lt;2ms with zero external daemon dependencies.
              </p>
            </div>

            <div className="p-5 rounded-[4px] border border-[#D6D0C3] bg-white space-y-2 shadow-xs">
              <div className="flex items-center space-x-2 text-[#526C60]">
                <Cpu className="w-4 h-4" />
                <h3 className="font-mono font-bold uppercase text-[11px]">Multi-Agent Orchestrator</h3>
              </div>
              <p className="text-[#5C5850] leading-relaxed">
                Asynchronous state machine with event streaming over SSE, sequence numbers, Last-Event-ID reconnection, and persistent SQLite/PostgreSQL storage.
              </p>
            </div>

            <div className="p-5 rounded-[4px] border border-[#D6D0C3] bg-white space-y-2 shadow-xs">
              <div className="flex items-center space-x-2 text-[#A47B48]">
                <Lock className="w-4 h-4" />
                <h3 className="font-mono font-bold uppercase text-[11px]">Tenant Isolation & Security</h3>
              </div>
              <p className="text-[#5C5850] leading-relaxed">
                Organization-scoped authorization, RBAC seat allocation, PBKDF2 cryptographic password hashing, and zero training retention data pipelines.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 7: INSTITUTIONAL TIERS
         ========================================================================= */}
      <section id="tiers" className="py-20 border-t border-[#D6D0C3] bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-2xl mb-12">
            <span className="text-[10px] font-mono uppercase text-[#A47B48] tracking-wider font-semibold">Deployment Models</span>
            <h2 className="text-3xl font-serif font-bold text-[#172B27] mt-1 mb-3">
              Institutional seats and sovereign enterprise infrastructure.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            {/* Tier 1 */}
            <div className="p-6 rounded-[4px] border border-[#D6D0C3] bg-[#F4F1E9] flex flex-col justify-between space-y-6 shadow-xs">
              <div className="space-y-4">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-[3px] bg-white text-[#172B27] border border-[#D6D0C3]">
                  PROFESSIONAL SEAT
                </span>
                <h3 className="text-xl font-serif font-bold text-[#172B27]">Principal Analyst</h3>
                <p className="text-[#5C5850] leading-relaxed">
                  Single-investigator workstation for equity research analysts and independent forensic specialists.
                </p>
                <div className="space-y-2 text-[#303633] pt-2 border-t border-[#D6D0C3]">
                  <div className="flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-[#264D3B]" />
                    <span>6 Active Autonomous Specialists</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-[#264D3B]" />
                    <span>Living Knowledge Graph (Dual-Engine)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-[#264D3B]" />
                    <span>DuckDB Financial Modeling</span>
                  </div>
                </div>
              </div>
              <Link 
                href="/app"
                className="w-full py-2.5 rounded-[4px] border border-[#D6D0C3] bg-white hover:bg-[#E8E3D7] text-[#172B27] font-medium text-center transition-colors shadow-xs"
              >
                Provision Analyst Seat
              </Link>
            </div>

            {/* Tier 2: Recommended */}
            <div className="p-6 rounded-[4px] border-2 border-[#172B27] bg-[#F4F1E9] flex flex-col justify-between space-y-6 relative shadow-md">
              <div className="absolute -top-3 left-6 px-2.5 py-0.5 rounded-[3px] bg-[#172B27] text-white font-mono text-[9px] uppercase tracking-wider">
                Primary Institutional Tier
              </div>
              <div className="space-y-4 pt-1">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-[3px] bg-[#172B27] text-white">
                  INSTITUTIONAL GROUP
                </span>
                <h3 className="text-xl font-serif font-bold text-[#172B27]">Investment Committee</h3>
                <p className="text-[#5C5850] leading-relaxed">
                  Multi-seat collaborative deployment for fund investment committees, strategy groups, and M&A deal teams.
                </p>
                <div className="space-y-2 text-[#303633] pt-2 border-t border-[#D6D0C3]">
                  <div className="flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-[#264D3B]" />
                    <span>14+ Specialist Society with Plenary Surveys</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-[#264D3B]" />
                    <span>God-View Mid-Stream Interventions</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-[#264D3B]" />
                    <span>Real-Time SSE Event Broadcasting</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-[#264D3B]" />
                    <span>Official Adjudication Dossier Export</span>
                  </div>
                </div>
              </div>
              <Link 
                href="/app"
                className="w-full py-2.5 rounded-[4px] bg-[#172B27] hover:bg-[#233F3A] text-white font-medium text-center transition-colors shadow-xs"
              >
                Launch Institutional Trial
              </Link>
            </div>

            {/* Tier 3 */}
            <div className="p-6 rounded-[4px] border border-[#D6D0C3] bg-[#F4F1E9] flex flex-col justify-between space-y-6 shadow-xs">
              <div className="space-y-4">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-[3px] bg-white text-[#172B27] border border-[#D6D0C3]">
                  SOVEREIGN / DEFENSE
                </span>
                <h3 className="text-xl font-serif font-bold text-[#172B27]">Air-Gapped Enterprise</h3>
                <p className="text-[#5C5850] leading-relaxed">
                  Self-hosted on-premise sovereign cloud deployment for defense intelligence and regulated financial infrastructure.
                </p>
                <div className="space-y-2 text-[#303633] pt-2 border-t border-[#D6D0C3]">
                  <div className="flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-[#264D3B]" />
                    <span>100% Air-Gapped / IL-6 Architecture</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-[#264D3B]" />
                    <span>Custom On-Premises LLM Integration</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-[#264D3B]" />
                    <span>Dedicated Technical Advisory SLA</span>
                  </div>
                </div>
              </div>
              <Link 
                href="/app"
                className="w-full py-2.5 rounded-[4px] border border-[#D6D0C3] bg-white hover:bg-[#E8E3D7] text-[#172B27] font-medium text-center transition-colors shadow-xs"
              >
                Inquire Sovereign Deployment
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          FINAL CALL TO ACTION & EDITORIAL FOOTER
         ========================================================================= */}
      <section className="py-24 border-t border-[#D6D0C3] bg-[#172B27] text-[#F4F1E9] relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-6 relative z-10">
          <span className="text-[10px] font-mono uppercase px-3 py-1 rounded-[3px] border border-[#A47B48]/50 bg-[#233F3A] text-[#A47B48]">
            READY FOR DEPLOYMENT
          </span>
          <h2 className="text-4xl sm:text-5xl font-serif font-bold text-white">
            Experience company intelligence as it should be.
          </h2>
          <p className="text-sm text-[#D6D0C3] max-w-xl mx-auto leading-relaxed">
            Run your first autonomous investigation in under two minutes. Access live corporate knowledge graphs, specialist debates, and deterministic financial valuations.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4 pt-2">
            <Link 
              href="/app"
              className="px-6 py-3 rounded-[4px] bg-[#A47B48] hover:bg-[#8F6B3E] text-white text-xs font-medium transition-colors shadow-xs flex items-center space-x-2"
            >
              <span>Launch Custom Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link 
              href="/demo"
              className="px-6 py-3 rounded-[4px] border border-[#D6D0C3]/40 hover:bg-[#233F3A] text-[#F4F1E9] text-xs font-medium transition-colors"
            >
              Explore Flagship Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Professional Editorial Footer */}
      <footer className="border-t border-[#233F3A] bg-[#101F1C] py-12 px-6 text-xs text-[#B8B0A0]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-3">
            <div className="w-5 h-5 rounded-[3px] bg-[#233F3A] border border-[#A47B48]/40 flex items-center justify-center font-serif font-bold text-white text-[10px]">
              M
            </div>
            <span className="font-serif font-semibold text-xs tracking-wider uppercase text-white">
              Meridian Intelligence Inc.
            </span>
            <span className="text-[10px] font-mono text-[#79756C]">
              © 2026. All rights reserved.
            </span>
          </div>

          <div className="flex items-center space-x-6 text-[11px]">
            <Link href="/demo" className="hover:text-white transition-colors">Flagship Demo</Link>
            <Link href="/app" className="hover:text-white transition-colors">Custom Workspace</Link>
            <span className="hover:text-white cursor-pointer">SEC 10-K Compliance</span>
            <span className="hover:text-white cursor-pointer">Security Whitepaper</span>
            <span className="flex items-center space-x-1.5 text-[#526C60]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#526C60]"></span>
              <span>All Systems Operational</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
