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
  MessageSquare
} from "lucide-react";

export default function LandingPage() {
  const [activePreviewTab, setActivePreviewTab] = useState<"graph" | "debate" | "financials" | "provenance">("graph");
  const [activeScenario, setActiveScenario] = useState<"base" | "bull" | "bear" | "stress">("base");

  return (
    <div className="flex flex-col min-h-screen bg-[#111315] text-[#e5e7eb] font-sans selection:bg-[#2563eb]/30 selection:text-white">
      {/* =========================================================================
          TOP INSTITUTIONAL NAVIGATION (Material A — Clear Glass)
         ========================================================================= */}
      <header className="fixed top-0 inset-x-0 z-50 glass-clear transition-all">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-2.5">
              <div className="w-6 h-6 rounded bg-[#20242a] border border-[#30353c] flex items-center justify-center font-mono font-bold text-[#e5e7eb] text-xs">
                M
              </div>
              <span className="font-semibold text-xs tracking-wider uppercase text-[#e5e7eb]">
                Meridian
              </span>
            </Link>
            <span className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded bg-[#20242a] text-[#a0a7b1] border border-[#30353c]">
              Institutional Intelligence v2.0
            </span>
          </div>

          <nav className="hidden md:flex items-center space-x-6 text-xs text-[#a0a7b1]">
            <Link href="#problem" className="hover:text-[#e5e7eb] transition-colors">Forensic Thesis</Link>
            <Link href="#graph" className="hover:text-[#e5e7eb] transition-colors">Knowledge Graph</Link>
            <Link href="#society" className="hover:text-[#e5e7eb] transition-colors">Specialist Society</Link>
            <Link href="#provenance" className="hover:text-[#e5e7eb] transition-colors">Evidence Standard</Link>
            <Link href="#financials" className="hover:text-[#e5e7eb] transition-colors">Valuation Engine</Link>
            <Link href="#architecture" className="hover:text-[#e5e7eb] transition-colors">Architecture</Link>
            <Link href="#tiers" className="hover:text-[#e5e7eb] transition-colors">Tiers</Link>
          </nav>

          <div className="flex items-center space-x-3">
            <Link 
              href="/demo"
              className="text-xs px-3 py-1.5 rounded bg-[#20242a] hover:bg-[#282d35] text-[#3b82f6] border border-[#3b82f6]/40 font-mono transition-colors flex items-center space-x-1.5"
            >
              <span>Explore Demo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link 
              href="/app"
              className="text-xs px-3.5 py-1.5 rounded bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-medium transition-colors shadow-sm"
            >
              Launch Workspace
            </Link>
          </div>
        </div>
      </header>

      {/* =========================================================================
          HERO SECTION: Layered Depth & Editorial Typography
         ========================================================================= */}
      <section className="relative pt-32 pb-20 px-6 max-w-7xl mx-auto w-full overflow-hidden">
        {/* Subtle Architectural Grid Background */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.035] bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:24px_24px]"></div>

        <div className="max-w-4xl relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-[#30353c] bg-[#181b1f]/80 backdrop-blur text-[#a0a7b1] text-xs font-mono mb-6"
          >
            <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse"></span>
            <span>ENTERPRISE COMPANY INTELLIGENCE & ADVERSARIAL DELIBERATION</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl font-serif tracking-tight text-[#f8fafc] leading-[1.12] mb-6"
          >
            Autonomous corporate research.<br />
            Grounded in cryptographic evidence.
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg text-[#a0a7b1] leading-relaxed mb-8 max-w-3xl font-normal"
          >
            MERIDIAN deploys societies of autonomous domain specialists to investigate public and private companies, synthesize living knowledge graphs, conduct adversarial debate rounds, and audit every strategic thesis against primary regulatory disclosures.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3.5"
          >
            <Link 
              href="/app"
              className="px-6 py-3 rounded bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-medium transition-colors flex items-center justify-center space-x-2 text-xs shadow-md"
            >
              <span>Start an Investigation</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link 
              href="/demo"
              className="px-6 py-3 rounded border border-[#30353c] hover:bg-[#181b1f] text-[#e5e7eb] font-medium transition-colors text-xs flex items-center justify-center space-x-2"
            >
              <span>Explore Flagship Demo (Palantir Technologies)</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#737c88]" />
            </Link>
          </motion.div>
        </div>

        {/* =========================================================================
            LIVE PRODUCT WORKSTATION PREVIEW (Material B & D Hybrid)
           ========================================================================= */}
        <motion.div 
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-14 rounded-lg border border-[#30353c] glass-frosted overflow-hidden shadow-2xl"
        >
          {/* Top Preview Sub-Header with Operational Controls */}
          <div className="h-10 bg-[#141619] border-b border-[#30353c] px-4 flex items-center justify-between text-xs font-mono text-[#737c88]">
            <div className="flex items-center space-x-3">
              <div className="flex space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]/60"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]/60"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]/60"></span>
              </div>
              <span className="text-[#a0a7b1] hidden sm:inline">MERIDIAN RESEARCH WORKSTATION · SESSION PLTR-2026-INV</span>
            </div>

            {/* Preview View Mode Switcher */}
            <div className="flex items-center space-x-1 bg-[#111315] p-0.5 rounded border border-[#30353c] text-[11px]">
              {[
                { key: "graph", label: "Knowledge Graph", icon: Network },
                { key: "debate", label: "Adversarial Debate", icon: MessageSquare },
                { key: "financials", label: "DuckDB Valuation", icon: BarChart3 },
                { key: "provenance", label: "Claim Provenance", icon: ShieldCheck }
              ].map((tab) => {
                const Icon = tab.icon;
                const active = activePreviewTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActivePreviewTab(tab.key as any)}
                    className={`px-2.5 py-1 rounded flex items-center space-x-1.5 transition-colors cursor-pointer ${
                      active ? "bg-[#20242a] text-[#f8fafc] font-medium border border-[#30353c]" : "text-[#737c88] hover:text-[#e5e7eb]"
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
          <div className="p-6 bg-[#111315] min-h-[360px]">
            {activePreviewTab === "graph" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center space-x-2 text-[#a0a7b1]">
                    <span className="w-2 h-2 rounded-full bg-[#3b82f6]"></span>
                    <span>TARGET: Palantir Technologies Inc. (NYSE: PLTR)</span>
                    <span className="text-[#737c88]">· 28 Entities · 42 Validated Edges</span>
                  </div>
                  <span className="text-[10px] text-[#10b981] bg-[#142922] px-2 py-0.5 rounded border border-[#10b981]/30">
                    GRAPH ENGINE: ACTIVE
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded bg-[#181b1f] border border-[#30353c] space-y-1">
                    <span className="text-[10px] font-mono text-[#737c88] uppercase">Sovereign Cohort</span>
                    <div className="font-semibold text-[#f8fafc]">DoD Project Maven / TITAN</div>
                    <p className="text-[11px] text-[#a0a7b1]">US Army Tactical Intelligence Ground Node award (\$178.4M firm-fixed).</p>
                  </div>
                  <div className="p-3 rounded bg-[#181b1f] border border-[#30353c] space-y-1">
                    <span className="text-[10px] font-mono text-[#737c88] uppercase">Infrastructure Moat</span>
                    <div className="font-semibold text-[#f8fafc]">FedRAMP High & IL-6 Cloud</div>
                    <p className="text-[11px] text-[#a0a7b1]">Zero-trust air-gapped deployment authority across AWS GovCloud & Azure.</p>
                  </div>
                  <div className="p-3 rounded bg-[#181b1f] border border-[#30353c] space-y-1">
                    <span className="text-[10px] font-mono text-[#737c88] uppercase">Commercial Expansion</span>
                    <div className="font-semibold text-[#f8fafc]">AIP Enterprise Bootcamps</div>
                    <p className="text-[11px] text-[#a0a7b1]">Commercial customer count grew 83% YoY to 295 US commercial accounts.</p>
                  </div>
                  <div className="p-3 rounded bg-[#181b1f] border border-[#30353c] space-y-1">
                    <span className="text-[10px] font-mono text-[#737c88] uppercase">Governance Risk</span>
                    <div className="font-semibold text-[#f8fafc]">Class F Multi-Voting Stock</div>
                    <p className="text-[11px] text-[#a0a7b1]">Founder voting trust maintains 49.999% irrevocable governance control.</p>
                  </div>
                </div>
              </div>
            )}

            {activePreviewTab === "debate" && (
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded bg-[#181b1f] border border-[#f59e0b]/40 space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-[#f59e0b] font-bold">CHALLENGE · Round #2</span>
                    <span className="text-[#737c88]">Forensic Accountant → Growth Specialist</span>
                  </div>
                  <p className="text-[#cbd5e1] font-serif leading-relaxed">
                    "Growth Lead cites 83% US commercial expansion. However, Rule of 40 accounting reveals customer concentration: Top 20 accounts represent 54% of revenue. If government procurement cycles extend, cash flow contraction risks are underpriced."
                  </p>
                </div>
                <div className="p-3 rounded bg-[#181b1f] border border-[#3b82f6]/40 space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-[#3b82f6] font-bold">REBUTTAL & TOOL INVOCATION · Round #3</span>
                    <span className="text-[#737c88]">Tech Architect → Forensic Accountant</span>
                  </div>
                  <p className="text-[#cbd5e1] font-serif leading-relaxed">
                    "Invoking duckdb_math on SEC 10-K Cash Runway: Cash reserves stand at \$3.67B with zero funded debt and \$580M trailing OCF. Even under a 40% government spending freeze, operational runway exceeds 74 months."
                  </p>
                </div>
              </div>
            )}

            {activePreviewTab === "financials" && (
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
                  <div className="p-3 rounded bg-[#181b1f] border border-[#30353c]">
                    <div className="text-[10px] text-[#737c88] uppercase">FY2023 Revenue</div>
                    <div className="text-base font-bold text-[#f8fafc] mt-0.5">\$2,225M</div>
                    <div className="text-[10px] text-[#10b981]">+17.5% YoY</div>
                  </div>
                  <div className="p-3 rounded bg-[#181b1f] border border-[#30353c]">
                    <div className="text-[10px] text-[#737c88] uppercase">Gross Margin</div>
                    <div className="text-base font-bold text-[#f8fafc] mt-0.5">79.5%</div>
                    <div className="text-[10px] text-[#10b981]">SaaS Benchmark</div>
                  </div>
                  <div className="p-3 rounded bg-[#181b1f] border border-[#30353c]">
                    <div className="text-[10px] text-[#737c88] uppercase">Cash Reserves</div>
                    <div className="text-base font-bold text-[#f8fafc] mt-0.5">\$3,670M</div>
                    <div className="text-[10px] text-[#3b82f6]">Zero Debt</div>
                  </div>
                  <div className="p-3 rounded bg-[#181b1f] border border-[#30353c]">
                    <div className="text-[10px] text-[#737c88] uppercase">Operating Cash Flow</div>
                    <div className="text-base font-bold text-[#f8fafc] mt-0.5">\$580M</div>
                    <div className="text-[10px] text-[#10b981]">26.1% Margin</div>
                  </div>
                </div>
              </div>
            )}

            {activePreviewTab === "provenance" && (
              <div className="space-y-2.5 text-xs font-mono">
                <div className="p-3 rounded bg-[#181b1f] border border-[#30353c] flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-[#10b981] font-bold">VERIFIED DISCLOSURE · SEC FORM 10-K</span>
                    <div className="text-[#e5e7eb] font-sans">Item 1. Business — Government Classification & IL-6 Clearances</div>
                  </div>
                  <span className="text-[10px] text-[#737c88]">SHA-256: 7f4a9b2c...3d1e</span>
                </div>
                <div className="p-3 rounded bg-[#181b1f] border border-[#30353c] flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-[#3b82f6] font-bold">REGULATORY CONTRACT · DEFENSE LOGISTICS AGENCY</span>
                    <div className="text-[#e5e7eb] font-sans">TITAN Ground Station Software Delivery Award #W56KGY-24-C-0008</div>
                  </div>
                  <span className="text-[10px] text-[#737c88]">SHA-256: a8c1e4d9...2b5f</span>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </section>

      {/* =========================================================================
          SECTION 1: THE PROBLEM — Superficial Chatbots vs Forensic Ground Truth
         ========================================================================= */}
      <section id="problem" className="py-20 border-t border-[#30353c] bg-[#141619]/60">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-2xl mb-12">
            <span className="text-[10px] font-mono uppercase text-[#3b82f6] tracking-wider">The Institutional Problem</span>
            <h2 className="text-3xl font-serif font-bold text-[#f8fafc] mt-1 mb-3">
              LLMs generate plausible text. Institutional research requires defensible truth.
            </h2>
            <p className="text-sm text-[#a0a7b1] leading-relaxed">
              When millions in capital allocation or strategic acquisitions are at stake, synthetic hallucinations, confident fabrications, and unverified summaries are catastrophic failure modes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Left: Consumer Chatbots */}
            <div className="p-6 rounded-lg border border-[#ef4444]/30 bg-[#1c1414]/30 space-y-4">
              <div className="flex items-center space-x-2 text-[#ef4444]">
                <ShieldAlert className="w-4 h-4" />
                <h3 className="font-mono uppercase font-bold tracking-wider">Generic AI Chatbots & Summarizers</h3>
              </div>
              <ul className="space-y-2.5 text-[#a0a7b1]">
                <li className="flex items-start space-x-2">
                  <span className="text-[#ef4444] font-bold">✕</span>
                  <span><strong>Hallucinated Financials:</strong> Fabricates quarterly metrics and valuation multiples when exact disclosures are absent.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-[#ef4444] font-bold">✕</span>
                  <span><strong>Superficial Consensus:</strong> Agreeable prompt-following that fails to challenge corporate PR spin or hidden balance sheet risks.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-[#ef4444] font-bold">✕</span>
                  <span><strong>Zero Provenance:</strong> Unverifiable assertions with missing citations, fabricated URLs, and non-reproducible answers.</span>
                </li>
              </ul>
            </div>

            {/* Right: MERIDIAN Architecture */}
            <div className="p-6 rounded-lg border border-[#10b981]/30 bg-[#142922]/20 space-y-4">
              <div className="flex items-center space-x-2 text-[#10b981]">
                <ShieldCheck className="w-4 h-4" />
                <h3 className="font-mono uppercase font-bold tracking-wider">MERIDIAN Research Architecture</h3>
              </div>
              <ul className="space-y-2.5 text-[#e5e7eb]">
                <li className="flex items-start space-x-2">
                  <Check className="w-4 h-4 text-[#10b981] shrink-0 mt-0.5" />
                  <span><strong>Deterministic DuckDB OLAP:</strong> Financial ratios and sensitivity analysis calculated directly from verified disclosures.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Check className="w-4 h-4 text-[#10b981] shrink-0 mt-0.5" />
                  <span><strong>Adversarial Specialist Society:</strong> Red-team forensic accountants actively interrogate growth theses and force concessions.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Check className="w-4 h-4 text-[#10b981] shrink-0 mt-0.5" />
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
      <section id="graph" className="py-20 border-t border-[#30353c] bg-[#111315]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-[10px] font-mono uppercase text-[#3b82f6] tracking-wider">Graph Intelligence</span>
              <h2 className="text-3xl font-serif font-bold text-[#f8fafc] mt-1">
                Visualizing corporate lineage, dependencies, and risk exposure.
              </h2>
            </div>
            <p className="text-xs text-[#737c88] font-mono mt-3 md:mt-0">
              DUAL-ENGINE: HTML5 CANVAS (60 FPS) + REACT FLOW v13
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div className="p-5 rounded border border-[#30353c] bg-[#181b1f] space-y-2.5">
              <div className="w-8 h-8 rounded bg-[#111315] border border-[#30353c] flex items-center justify-center text-[#3b82f6]">
                <Network className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-serif font-bold text-[#f8fafc]">Multi-Layout Topologies</h3>
              <p className="text-[#a0a7b1] leading-relaxed">
                Toggle seamlessly between Force-Relaxed spatial layout, Radial Hierarchical concentric orbits, and Domain Clustering by customer cohort.
              </p>
            </div>

            <div className="p-5 rounded border border-[#30353c] bg-[#181b1f] space-y-2.5">
              <div className="w-8 h-8 rounded bg-[#111315] border border-[#30353c] flex items-center justify-center text-[#10b981]">
                <Layers className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-serif font-bold text-[#f8fafc]">Entity & Provenance Directory</h3>
              <p className="text-[#a0a7b1] leading-relaxed">
                Collapsible side drawer with instant search across all extracted entities, degree centrality rankings, and 1-hop neighborhood highlighting.
              </p>
            </div>

            <div className="p-5 rounded border border-[#30353c] bg-[#181b1f] space-y-2.5">
              <div className="w-8 h-8 rounded bg-[#111315] border border-[#30353c] flex items-center justify-center text-[#f59e0b]">
                <Activity className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-serif font-bold text-[#f8fafc]">Real-Time Shock Propagation</h3>
              <p className="text-[#a0a7b1] leading-relaxed">
                Inject exogenous regulatory shocks or counterparty defaults; observe network illumination and immediate confidence recalibration across all nodes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: MULTI-AGENT ADVERSARIAL SOCIETY & 6-ROUND DELIBERATION
         ========================================================================= */}
      <section id="society" className="py-20 border-t border-[#30353c] bg-[#141619]/60">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-2xl mb-12">
            <span className="text-[10px] font-mono uppercase text-[#3b82f6] tracking-wider">Adversarial Deliberation</span>
            <h2 className="text-3xl font-serif font-bold text-[#f8fafc] mt-1 mb-3">
              13+ Specialist Personas. Structured Cross-Examination. Zero Scripted Outcomes.
            </h2>
            <p className="text-sm text-[#a0a7b1] leading-relaxed">
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
              <div key={idx} className="p-4 rounded border border-[#30353c] bg-[#181b1f] space-y-2">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-[#3b82f6]">{sp.role}</span>
                  <span className="text-[#737c88]">#{idx + 1}</span>
                </div>
                <div className="font-serif font-bold text-[#f8fafc] text-sm">{sp.name}</div>
                <p className="text-[#a0a7b1] leading-relaxed text-[11.5px]">{sp.mandate}</p>
                <div className="text-[10px] font-mono text-[#737c88] pt-1 border-t border-[#30353c]/50">
                  Style: {sp.style}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: FINANCIAL INTELLIGENCE & SCENARIO ANALYSIS
         ========================================================================= */}
      <section id="financials" className="py-20 border-t border-[#30353c] bg-[#111315]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-2xl mb-10">
            <span className="text-[10px] font-mono uppercase text-[#3b82f6] tracking-wider">Deterministic Valuation</span>
            <h2 className="text-3xl font-serif font-bold text-[#f8fafc] mt-1 mb-3">
              In-process DuckDB OLAP calculations. Never LLM-hallucinated numbers.
            </h2>
            <p className="text-sm text-[#a0a7b1] leading-relaxed">
              Every financial model is calculated deterministically with pure SQL formulas over verified SEC disclosures, stress-testing valuation under four macro scenarios.
            </p>
          </div>

          <div className="flex space-x-2 mb-6 text-xs font-mono">
            {[
              { key: "base", label: "Base Case" },
              { key: "bull", label: "Bull Expansion" },
              { key: "bear", label: "Bear Contraction" },
              { key: "stress", label: "Severe Stress Shock" }
            ].map((sc) => (
              <button
                key={sc.key}
                onClick={() => setActiveScenario(sc.key as any)}
                className={`px-3 py-1.5 rounded transition-colors cursor-pointer ${
                  activeScenario === sc.key
                    ? "bg-[#2563eb] text-white font-medium"
                    : "bg-[#181b1f] text-[#737c88] border border-[#30353c] hover:text-[#e5e7eb]"
                }`}
              >
                {sc.label}
              </button>
            ))}
          </div>

          <div className="p-6 rounded-lg border border-[#30353c] bg-[#181b1f] overflow-x-auto text-xs font-mono">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#30353c] text-[#737c88] text-[10px] uppercase">
                  <th className="pb-2">Metric</th>
                  <th className="pb-2">Base Case</th>
                  <th className="pb-2">Bull Case</th>
                  <th className="pb-2">Bear Case</th>
                  <th className="pb-2">Stress Shock</th>
                  <th className="pb-2">Verification Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#30353c]/50 text-[#e5e7eb]">
                <tr>
                  <td className="py-2.5 font-bold">Implied Valuation (USD)</td>
                  <td className="py-2.5 text-[#3b82f6] font-bold">\$45.2B</td>
                  <td className="py-2.5 text-[#10b981] font-bold">\$62.8B</td>
                  <td className="py-2.5 text-[#f59e0b] font-bold">\$31.4B</td>
                  <td className="py-2.5 text-[#ef4444] font-bold">\$19.8B</td>
                  <td className="py-2.5 text-[#737c88]">DuckDB DCF (WACC 9.2%)</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold">Cash Runway Horizon</td>
                  <td className="py-2.5">74 Months</td>
                  <td className="py-2.5">Infinite (FCF+)</td>
                  <td className="py-2.5">48 Months</td>
                  <td className="py-2.5">32 Months</td>
                  <td className="py-2.5 text-[#737c88]">SEC 10-K Cash + ST Inv</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold">Top-20 Client Concentration</td>
                  <td className="py-2.5">54.0%</td>
                  <td className="py-2.5">42.0%</td>
                  <td className="py-2.5">62.0%</td>
                  <td className="py-2.5">71.0%</td>
                  <td className="py-2.5 text-[#737c88]">Segment Revenue Reporting</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold">Gross Margin Stability</td>
                  <td className="py-2.5">79.5%</td>
                  <td className="py-2.5">82.0%</td>
                  <td className="py-2.5">74.0%</td>
                  <td className="py-2.5">68.0%</td>
                  <td className="py-2.5 text-[#737c88]">Audited Cost of Revenue</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: ENTERPRISE USE CASES
         ========================================================================= */}
      <section className="py-20 border-t border-[#30353c] bg-[#141619]/60">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-2xl mb-12">
            <span className="text-[10px] font-mono uppercase text-[#3b82f6] tracking-wider">Operational Domains</span>
            <h2 className="text-3xl font-serif font-bold text-[#f8fafc] mt-1 mb-3">
              Engineered for capital allocators, forensic teams, and sovereign strategists.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
            <div className="p-5 rounded border border-[#30353c] bg-[#181b1f] space-y-2">
              <span className="text-[10px] font-mono text-[#3b82f6] uppercase">Institutional Capital</span>
              <h3 className="text-sm font-serif font-bold text-[#f8fafc]">Long/Short Equity Due Diligence</h3>
              <p className="text-[#a0a7b1] leading-relaxed">
                Test long theses against adversarial forensic red-teams before establishing multi-hundred-million-dollar positions.
              </p>
            </div>

            <div className="p-5 rounded border border-[#30353c] bg-[#181b1f] space-y-2">
              <span className="text-[10px] font-mono text-[#10b981] uppercase">Corporate Strategy</span>
              <h3 className="text-sm font-serif font-bold text-[#f8fafc]">M&A Cross-Examination</h3>
              <p className="text-[#a0a7b1] leading-relaxed">
                Audit integration friction, regulatory antitrust exposure, and true customer concentration prior to binding acquisition bids.
              </p>
            </div>

            <div className="p-5 rounded border border-[#30353c] bg-[#181b1f] space-y-2">
              <span className="text-[10px] font-mono text-[#f59e0b] uppercase">Forensic Accounting</span>
              <h3 className="text-sm font-serif font-bold text-[#f8fafc]">Short-Seller Investigation</h3>
              <p className="text-[#a0a7b1] leading-relaxed">
                Probe circular transactions, off-balance-sheet commitments, and aggressive revenue recognition patterns across subsidiaries.
              </p>
            </div>

            <div className="p-5 rounded border border-[#30353c] bg-[#181b1f] space-y-2">
              <span className="text-[10px] font-mono text-[#8b5cf6] uppercase">Sovereign & Defense</span>
              <h3 className="text-sm font-serif font-bold text-[#f8fafc]">Supply Chain Integrity</h3>
              <p className="text-[#a0a7b1] leading-relaxed">
                Verify defense contractor software supply chains, foreign beneficial ownership, and export control adherence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 6: ARCHITECTURE & SECURITY
         ========================================================================= */}
      <section id="architecture" className="py-20 border-t border-[#30353c] bg-[#111315]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-2xl mb-12">
            <span className="text-[10px] font-mono uppercase text-[#3b82f6] tracking-wider">Production Architecture</span>
            <h2 className="text-3xl font-serif font-bold text-[#f8fafc] mt-1 mb-3">
              Composable, air-gappable, and observable down to the microsecond.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div className="p-5 rounded border border-[#30353c] bg-[#181b1f] space-y-2">
              <div className="flex items-center space-x-2 text-[#3b82f6]">
                <Server className="w-4 h-4" />
                <h3 className="font-mono font-bold uppercase text-[11px]">In-Process OLAP & Storage</h3>
              </div>
              <p className="text-[#a0a7b1] leading-relaxed">
                DuckDB embedded analytics engine executing deterministic multi-scenario matrix evaluations in &lt;2ms with zero external daemon dependencies.
              </p>
            </div>

            <div className="p-5 rounded border border-[#30353c] bg-[#181b1f] space-y-2">
              <div className="flex items-center space-x-2 text-[#10b981]">
                <Cpu className="w-4 h-4" />
                <h3 className="font-mono font-bold uppercase text-[11px]">Multi-Agent Orchestrator</h3>
              </div>
              <p className="text-[#a0a7b1] leading-relaxed">
                Asynchronous state machine with event streaming over SSE, sequence numbers, Last-Event-ID reconnection, and persistent SQLite/PostgreSQL storage.
              </p>
            </div>

            <div className="p-5 rounded border border-[#30353c] bg-[#181b1f] space-y-2">
              <div className="flex items-center space-x-2 text-[#f59e0b]">
                <Lock className="w-4 h-4" />
                <h3 className="font-mono font-bold uppercase text-[11px]">Tenant Isolation & Security</h3>
              </div>
              <p className="text-[#a0a7b1] leading-relaxed">
                Organization-scoped authorization, RBAC seat allocation, PBKDF2 cryptographic password hashing, and zero training retention data pipelines.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 7: INSTITUTIONAL TIERS
         ========================================================================= */}
      <section id="tiers" className="py-20 border-t border-[#30353c] bg-[#141619]/60">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-2xl mb-12">
            <span className="text-[10px] font-mono uppercase text-[#3b82f6] tracking-wider">Deployment Models</span>
            <h2 className="text-3xl font-serif font-bold text-[#f8fafc] mt-1 mb-3">
              Institutional seats and sovereign enterprise infrastructure.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            {/* Tier 1 */}
            <div className="p-6 rounded-lg border border-[#30353c] bg-[#181b1f] flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#20242a] text-[#a0a7b1] border border-[#30353c]">
                  PROFESSIONAL SEAT
                </span>
                <h3 className="text-xl font-serif font-bold text-[#f8fafc]">Principal Analyst</h3>
                <p className="text-[#a0a7b1] leading-relaxed">
                  Single-investigator workstation for equity research analysts and independent forensic specialists.
                </p>
                <div className="space-y-2 text-[#cbd5e1] pt-2 border-t border-[#30353c]/50">
                  <div className="flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-[#10b981]" />
                    <span>6 Active Autonomous Specialists</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-[#10b981]" />
                    <span>Living Knowledge Graph (Dual-Engine)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-[#10b981]" />
                    <span>DuckDB Financial Modeling</span>
                  </div>
                </div>
              </div>
              <Link 
                href="/app"
                className="w-full py-2.5 rounded border border-[#30353c] hover:bg-[#20242a] text-[#e5e7eb] font-medium text-center transition-colors"
              >
                Provision Analyst Seat
              </Link>
            </div>

            {/* Tier 2: Recommended */}
            <div className="p-6 rounded-lg border border-[#3b82f6]/50 bg-[#181b1f] flex flex-col justify-between space-y-6 relative shadow-lg">
              <div className="absolute -top-3 left-6 px-2.5 py-0.5 rounded bg-[#2563eb] text-white font-mono text-[9px] uppercase tracking-wider">
                Most Common Institutional Tier
              </div>
              <div className="space-y-4 pt-1">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#1e293b] text-[#3b82f6] border border-[#3b82f6]/30">
                  INSTITUTIONAL GROUP
                </span>
                <h3 className="text-xl font-serif font-bold text-[#f8fafc]">Investment Committee</h3>
                <p className="text-[#a0a7b1] leading-relaxed">
                  Multi-seat collaborative deployment for fund investment committees, strategy groups, and M&A deal teams.
                </p>
                <div className="space-y-2 text-[#cbd5e1] pt-2 border-t border-[#30353c]/50">
                  <div className="flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-[#10b981]" />
                    <span>14+ Specialist Society with Plenary Surveys</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-[#10b981]" />
                    <span>God-View Mid-Stream Interventions</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-[#10b981]" />
                    <span>Real-Time SSE Event Broadcasting</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-[#10b981]" />
                    <span>Official Adjudication Dossier Export</span>
                  </div>
                </div>
              </div>
              <Link 
                href="/app"
                className="w-full py-2.5 rounded bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-medium text-center transition-colors shadow-sm"
              >
                Launch Institutional Trial
              </Link>
            </div>

            {/* Tier 3 */}
            <div className="p-6 rounded-lg border border-[#30353c] bg-[#181b1f] flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#20242a] text-[#a0a7b1] border border-[#30353c]">
                  SOVEREIGN / DEFENSE
                </span>
                <h3 className="text-xl font-serif font-bold text-[#f8fafc]">Air-Gapped Enterprise</h3>
                <p className="text-[#a0a7b1] leading-relaxed">
                  Self-hosted on-premise sovereign cloud deployment for defense intelligence and regulated financial infrastructure.
                </p>
                <div className="space-y-2 text-[#cbd5e1] pt-2 border-t border-[#30353c]/50">
                  <div className="flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-[#10b981]" />
                    <span>100% Air-Gapped / IL-6 Architecture</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-[#10b981]" />
                    <span>Custom On-Premises LLM Integration</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-[#10b981]" />
                    <span>Dedicated Technical Advisory SLA</span>
                  </div>
                </div>
              </div>
              <Link 
                href="/app"
                className="w-full py-2.5 rounded border border-[#30353c] hover:bg-[#20242a] text-[#e5e7eb] font-medium text-center transition-colors"
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
      <section className="py-24 border-t border-[#30353c] bg-[#111315] relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-6 relative z-10">
          <span className="text-[10px] font-mono uppercase px-3 py-1 rounded-full border border-[#30353c] bg-[#181b1f] text-[#3b82f6]">
            READY FOR DEPLOYMENT
          </span>
          <h2 className="text-4xl sm:text-5xl font-serif font-bold text-[#f8fafc]">
            Experience company intelligence as it should be.
          </h2>
          <p className="text-sm text-[#a0a7b1] max-w-xl mx-auto leading-relaxed">
            Run your first autonomous investigation in under two minutes. Access live corporate knowledge graphs, specialist debates, and deterministic financial valuations.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4 pt-2">
            <Link 
              href="/app"
              className="px-6 py-3 rounded bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-medium transition-colors shadow-md flex items-center space-x-2"
            >
              <span>Launch Custom Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link 
              href="/demo"
              className="px-6 py-3 rounded border border-[#30353c] hover:bg-[#181b1f] text-[#e5e7eb] text-xs font-medium transition-colors"
            >
              Explore Flagship Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Professional Footer */}
      <footer className="border-t border-[#30353c] bg-[#141619] py-12 px-6 text-xs text-[#737c88]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-3">
            <div className="w-5 h-5 rounded bg-[#20242a] border border-[#30353c] flex items-center justify-center font-mono font-bold text-[#e5e7eb] text-[10px]">
              M
            </div>
            <span className="font-semibold text-xs tracking-wider uppercase text-[#e5e7eb]">
              Meridian Intelligence Inc.
            </span>
            <span className="text-[10px] font-mono">
              © 2026. All rights reserved.
            </span>
          </div>

          <div className="flex items-center space-x-6 text-[11px]">
            <Link href="/demo" className="hover:text-[#e5e7eb] transition-colors">Flagship Demo</Link>
            <Link href="/app" className="hover:text-[#e5e7eb] transition-colors">Custom Workspace</Link>
            <span className="hover:text-[#e5e7eb] cursor-pointer">SEC 10-K Compliance</span>
            <span className="hover:text-[#e5e7eb] cursor-pointer">Security Whitepaper</span>
            <span className="flex items-center space-x-1.5 text-[#10b981]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
              <span>All Systems Operational</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
