"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  FileText,
  PhoneCall,
  Presentation,
  ShieldCheck,
  Newspaper,
  BarChart3,
  Database,
  Cpu,
  Layers,
  Search,
  Scale,
  Award,
  ArrowRight,
  TrendingUp,
  Activity,
  AlertTriangle,
  Users,
  Compass,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  GitCommit,
  Network
} from "lucide-react";

export type ViewMode = "graph" | "flow" | "research";

export interface TopologyNode {
  id: string;
  stage: "input" | "ingestion" | "director" | "specialist" | "claims" | "debate" | "adjudication" | "dossier";
  title: string;
  subtitle?: string;
  icon: any;
  x: number;
  y: number;
  categoryColor: string;
  bg: string;
  borderColor: string;
  methodology: string;
  primarySources: string[];
  analyticalScope: string;
  keyDeliverable: string;
}

export const TOPOLOGY_NODES: TopologyNode[] = [
  // 1. DATA INPUT CLUSTER (Left Column)
  {
    id: "src_filings",
    stage: "input",
    title: "SEC Financial Filings",
    subtitle: "10-K, 10-Q & 8-K Exhibits",
    icon: FileText,
    x: 70,
    y: 60,
    categoryColor: "#153B32",
    bg: "#FFFFFF",
    borderColor: "#D6D0C3",
    methodology: "Direct SEC EDGAR Ingestion & Item 8 Footnote Parsing",
    primarySources: ["Item 1 Business Description", "Item 7 MD&A", "Note 14 Segment & Customer Breakdown"],
    analyticalScope: "Primary audited financial statements, historical segment disclosures, and legal entity structures.",
    keyDeliverable: "SHA-256 Hashed Primary Financial Tables & Footnote Extracts"
  },
  {
    id: "src_earnings",
    stage: "input",
    title: "Earnings Calls & Q&A",
    subtitle: "Quarterly Executive Transcripts",
    icon: PhoneCall,
    x: 70,
    y: 130,
    categoryColor: "#1D4D40",
    bg: "#FFFFFF",
    borderColor: "#D6D0C3",
    methodology: "Verbatim Speaker Attribution & Guidance Boundary Extraction",
    primarySources: ["CEO Prepared Remarks", "CFO Guidance Disclosures", "Analyst Q&A Inquiries"],
    analyticalScope: "Management forward commitments, gross margin expectations, and Capex allocations.",
    keyDeliverable: "Audited Management Statement Records with Forward Verification Dates"
  },
  {
    id: "src_presentations",
    stage: "input",
    title: "Investor Decks & Capital Days",
    subtitle: "Strategic Roadmaps & Capex",
    icon: Presentation,
    x: 70,
    y: 200,
    categoryColor: "#789487",
    bg: "#FFFFFF",
    borderColor: "#D6D0C3",
    methodology: "Multimodal Slide & Chart Extraction",
    primarySources: ["Global Investor Presentation", "Technology Architecture Briefing"],
    analyticalScope: "Long-term revenue targets, TAM expansion vectors, and architectural roadmaps.",
    keyDeliverable: "Quantified Unit Economic Assumptions & TAM Matrices"
  },
  {
    id: "src_regulatory",
    stage: "input",
    title: "Regulatory Disclosures",
    subtitle: "Export Controls & Antitrust",
    icon: ShieldCheck,
    x: 70,
    y: 270,
    categoryColor: "#A33B45",
    bg: "#FFFFFF",
    borderColor: "#D6D0C3",
    methodology: "Statutory Rule Compliance & Sanctions Screening",
    primarySources: ["US Bureau of Industry and Security (BIS)", "DoD Defense Authorization Disclosures"],
    analyticalScope: "Export licensing barriers, geopolitical delivery caps, and antitrust compliance.",
    keyDeliverable: "Jurisdictional Vulnerability Register & Sanction Risk Scores"
  },
  {
    id: "src_industry",
    stage: "input",
    title: "Industry & Peer Disclosures",
    subtitle: "Competitor 10-Ks & Foundry Metrics",
    icon: BarChart3,
    x: 70,
    y: 340,
    categoryColor: "#B58A4F",
    bg: "#FFFFFF",
    borderColor: "#D6D0C3",
    methodology: "Cross-Entity Comparative Benchmarking",
    primarySources: ["TSMC Packaging Index", "AMD / Intel Peer Filings", "Hyperscaler Capex Releases"],
    analyticalScope: "Merchant accelerator market share, packaging lead times, and cloud substitution rates.",
    keyDeliverable: "Relative Competitive Defensibility Matrix"
  },

  // 2. INGESTION & PROCESSING NODE
  {
    id: "stage_ingest",
    stage: "ingestion",
    title: "Ingest & Processing Pipeline",
    subtitle: "Extract · Hash · Normalize",
    icon: Database,
    x: 230,
    y: 200,
    categoryColor: "#153B32",
    bg: "#FCFBF8",
    borderColor: "#153B32",
    methodology: "Deterministic Cryptographic Ingestion",
    primarySources: ["SHA-256 Content Hashing", "Zero-Copy Table Structuring", "OCR Discrepancy Reconciliation"],
    analyticalScope: "Sanitizes untrusted text against prompt-injection delimiter overrides and binds passages to immutable line offsets.",
    keyDeliverable: "Verified Evidence Registry with Cryptographic Fingerprints"
  },

  // 3. CENTRAL RESEARCH DIRECTOR
  {
    id: "stage_director",
    stage: "director",
    title: "Meridian Research Director",
    subtitle: "Plan · Orchestrate · Monitor · Synthesize",
    icon: Compass,
    x: 410,
    y: 200,
    categoryColor: "#B58A4F",
    bg: "#153B32",
    borderColor: "#B58A4F",
    methodology: "Autonomous Task Decomposition & Budget Management",
    primarySources: ["User Mandate", "Company Archetype", "Historical Knowledge Base"],
    analyticalScope: "Dynamically constructs dependency-aware specialist task DAGs, establishes blind-first research boundaries, and guides execution.",
    keyDeliverable: "Immutable Task Briefings & Epistemic Investigation Plan"
  },

  // 4. INDEPENDENT SPECIALISTS (Orbiting Ring)
  {
    id: "spec_financial",
    stage: "specialist",
    title: "Financial Analyst",
    subtitle: "Dr. Julian Croft",
    icon: TrendingUp,
    x: 310,
    y: 70,
    categoryColor: "#153B32",
    bg: "#FFFFFF",
    borderColor: "#153B32",
    methodology: "Deterministic OLAP Ratio & Statement Auditing",
    primarySources: ["Consolidated Financial Statements", "Cash Flow Statements", "Operating Net Income Disclosures"],
    analyticalScope: "Unit economics, gross margin durability, cash runway, and capital return thresholds (ROIC/ROE).",
    keyDeliverable: "Quantitative Solvency Audit & INR Converted Valuation Multiples"
  },
  {
    id: "spec_forensic",
    stage: "specialist",
    title: "Forensic Accountant",
    subtitle: "Dr. Marcus Vance",
    icon: Search,
    x: 510,
    y: 70,
    categoryColor: "#A33B45",
    bg: "#FFFFFF",
    borderColor: "#A33B45",
    methodology: "Adversarial Discrepancy & Footnote Cross-Examination",
    primarySources: ["Note 14 Disclosures", "Accounts Receivable Aging Schedules", "Related-Party Transaction Notes"],
    analyticalScope: "Revenue vs receivables growth decoupling, unbilled contract assets, and customer concentration.",
    keyDeliverable: "Financial Anomaly Register & Decoupling Proofs"
  },
  {
    id: "spec_competitive",
    stage: "specialist",
    title: "Competitive Analyst",
    subtitle: "Alexander Sterling",
    icon: Network,
    x: 290,
    y: 330,
    categoryColor: "#B58A4F",
    bg: "#FFFFFF",
    borderColor: "#B58A4F",
    methodology: "Moat Analysis & Enterprise Switching Cost Quantification",
    primarySources: ["Peer 10-K Filings", "Hyperscaler Custom Silicon Benchmarks", "Developer Platform Reports"],
    analyticalScope: "Proprietary software lock-in (CUDA), full-rack networking defensibility, and ASIC substitution velocity.",
    keyDeliverable: "Substitutability Audit & Competitive Pressure Score"
  },
  {
    id: "spec_bear",
    stage: "specialist",
    title: "Bear / Red-Team Analyst",
    subtitle: "Sophia Zhang",
    icon: AlertTriangle,
    x: 530,
    y: 330,
    categoryColor: "#A33B45",
    bg: "#FFFFFF",
    borderColor: "#A33B45",
    methodology: "First-Principles Downside Falsification Protocol",
    primarySources: ["Supply Chain Packaging Disclosures", "Export Control Filing Exhibits", "Contract Backlog Friction"],
    analyticalScope: "Sole-source foundry chokepoints (TSMC CoWoS), hyperscaler capex compression, and sovereign regulatory caps.",
    keyDeliverable: "Downside Stress Scenarios & Vulnerability Vectors"
  },

  // 5. CLAIMS & EVIDENCE REGISTER
  {
    id: "stage_claims",
    stage: "claims",
    title: "Claims & Evidence Registry",
    subtitle: "Testable Factual Propositions",
    icon: Layers,
    x: 620,
    y: 200,
    categoryColor: "#789487",
    bg: "#FCFBF8",
    borderColor: "#789487",
    methodology: "Blind-First Epistemic Proposition Locking",
    primarySources: ["Specialist Task Outputs", "Evidence Claim Cross-References"],
    analyticalScope: "Locks independent findings into falsifiable propositions bound to immutable evidence IDs before debate begins.",
    keyDeliverable: "Immutable Proposition Ledger with Epistemic Confidence Ratings"
  },

  // 6. ADVERSARIAL DEBATE STAGE
  {
    id: "stage_debate",
    stage: "debate",
    title: "Adversarial Debate Engine",
    subtitle: "Challenge · Rebut · Concede",
    icon: Scale,
    x: 760,
    y: 200,
    categoryColor: "#153B32",
    bg: "#FCFBF8",
    borderColor: "#153B32",
    methodology: "Structured 3-Round Falsification Protocol",
    primarySources: ["Peer Rebuttals", "Counter-Evidence Ingestion", "Claim Revisions"],
    analyticalScope: "Cross-examines claims using adversarial challenge categories without majority voting.",
    keyDeliverable: "Audited Rebuttal Log & Calibrated Claim Revisions"
  },

  // 7. INDEPENDENT ADJUDICATION
  {
    id: "stage_adjudication",
    stage: "adjudication",
    title: "Independent Judicial Adjudication",
    subtitle: "Hon. Evelyn Cross",
    icon: ShieldCheck,
    x: 900,
    y: 200,
    categoryColor: "#B58A4F",
    bg: "#FFFFFF",
    borderColor: "#B58A4F",
    methodology: "Evidentiary Weighting & Rigorous Non-Consensus Adjudication",
    primarySources: ["Debate History", "Cited Regulatory Disclosures", "Adjudication Verdicts"],
    analyticalScope: "Assesses claims strictly on documentary provenance, source authority, and logic—rejecting consensus voting.",
    keyDeliverable: "Formal Verdict Manifest (Supported / Contradicted / Unresolved)"
  },

  // 8. FINAL INTELLIGENCE DOSSIER
  {
    id: "stage_dossier",
    stage: "dossier",
    title: "Final Institutional Intelligence Dossier",
    subtitle: "12-Section Memorandum & PDF Export",
    icon: Award,
    x: 1040,
    y: 200,
    categoryColor: "#B58A4F",
    bg: "#153B32",
    borderColor: "#B58A4F",
    methodology: "Deterministic Synthesis & Standardized INR Presentation",
    primarySources: ["Execution Manifest", "Verified Evidence Registry", "Adjudicated Verdicts"],
    analyticalScope: "Comprehensive institutional investment thesis, committee conviction rating, thesis invalidation triggers, and monitoring radar.",
    keyDeliverable: "Institutional Investment Memorandum (PDF Export Ready)"
  }
];

export const TOPOLOGY_CONNECTORS = [
  // Inputs to Ingestion
  { from: "src_filings", to: "stage_ingest" },
  { from: "src_earnings", to: "stage_ingest" },
  { from: "src_presentations", to: "stage_ingest" },
  { from: "src_regulatory", to: "stage_ingest" },
  { from: "src_industry", to: "stage_ingest" },
  // Ingestion to Director
  { from: "stage_ingest", to: "stage_director" },
  // Director to Specialists
  { from: "stage_director", to: "spec_financial" },
  { from: "stage_director", to: "spec_forensic" },
  { from: "stage_director", to: "spec_competitive" },
  { from: "stage_director", to: "spec_bear" },
  // Specialists to Claims
  { from: "spec_financial", to: "stage_claims" },
  { from: "spec_forensic", to: "stage_claims" },
  { from: "spec_competitive", to: "stage_claims" },
  { from: "spec_bear", to: "stage_claims" },
  // Pipeline progression
  { from: "stage_claims", to: "stage_debate" },
  { from: "stage_debate", to: "stage_adjudication" },
  { from: "stage_adjudication", to: "stage_dossier" }
];

export default function MeridianTopology() {
  const [selectedNode, setSelectedNode] = useState<TopologyNode>(TOPOLOGY_NODES[6]); // default to Research Director
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("graph");
  const [activeTimelineStep, setActiveTimelineStep] = useState<number>(1);

  return (
    <section className="relative w-full bg-[#F7F5EF] text-[#343A36] py-16 px-4 sm:px-6 lg:px-8 border-y border-[#D6D0C3]/70 overflow-hidden select-none">
      {/* Background Engineering Paper Texture Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.06] bg-[radial-gradient(#153B32_1px,transparent_1px)] [background-size:24px_24px]"></div>

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        {/* =========================================================================
            HEADER & HERO CONTEXT PANEL
           ========================================================================= */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-[#D6D0C3]">
          <div className="max-w-3xl space-y-2">
            <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded bg-[#FCFBF8] border border-[#D6D0C3] text-[11px] font-mono tracking-wider uppercase text-[#153B32] shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#1D4D40] animate-pulse"></span>
              <span className="font-semibold">Autonomous Intelligence Topology</span>
              <span className="text-[#D6D0C3]">|</span>
              <span className="text-[#789487]">System Operational</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-serif font-bold text-[#153B32] tracking-tight leading-[1.12]">
              From Raw Disclosures to Adjudicated Conviction.
            </h2>
            <p className="text-sm sm:text-base text-[#5C5850] font-normal leading-relaxed max-w-2xl">
              MERIDIAN independently investigates companies, challenges competing interpretations across domain specialists, and produces evidence-backed intelligence for consequential investment decisions.
            </p>
          </div>

          {/* Context & View Switcher */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-3 shrink-0">
            {/* View Mode Switcher */}
            <div className="flex items-center bg-[#FCFBF8] p-1 rounded border border-[#D6D0C3] shadow-xs text-xs font-mono">
              {[
                { mode: "graph", label: "Graph View" },
                { mode: "flow", label: "Flow View" },
                { mode: "research", label: "Research View" }
              ].map(item => (
                <button
                  key={item.mode}
                  onClick={() => setViewMode(item.mode as ViewMode)}
                  className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                    viewMode === item.mode
                      ? "bg-[#153B32] text-[#FCFBF8] font-semibold shadow-xs"
                      : "text-[#789487] hover:text-[#153B32]"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Benchmark Status Pill */}
            <div className="text-[11px] font-mono text-[#5C5850] bg-white px-3 py-1.5 rounded border border-[#D6D0C3] flex items-center space-x-2 shadow-xs">
              <span className="font-semibold text-[#153B32]">Subject:</span>
              <span>NVIDIA Corp (NVDA)</span>
              <span className="text-[#B58A4F] font-bold">₹2,68,43,950 Cr</span>
            </div>
          </div>
        </div>

        {/* =========================================================================
            CENTERPIECE SVG INTERACTIVE CANVAS
           ========================================================================= */}
        <div className="relative w-full bg-[#FCFBF8] border border-[#D6D0C3] rounded-lg shadow-sm p-4 sm:p-6 overflow-hidden">
          {/* Top Canvas Micro-Bar */}
          <div className="flex items-center justify-between text-[11px] font-mono text-[#789487] pb-3 border-b border-[#D6D0C3]/60 mb-2">
            <div className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B58A4F]"></span>
              <span className="font-semibold text-[#153B32]">MERIDIAN SYSTEM SCHEMATIC · v2.5</span>
              <span className="hidden md:inline text-[#D6D0C3]">|</span>
              <span className="hidden md:inline">Deterministic OLAP + Adversarial Multi-Agent Engine</span>
            </div>
            <div className="text-[10px] text-[#A47B48]">
              Interactive Node Inspection Active
            </div>
          </div>

          {/* Main SVG Visualization */}
          <div className="w-full aspect-[16/7] max-h-[520px] relative select-none">
            <svg viewBox="0 0 1140 420" className="w-full h-full">
              <defs>
                {/* Linear Gradients for Flow Connectors */}
                <linearGradient id="streamGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#789487" stopOpacity="0.3" />
                  <stop offset="50%" stopColor="#B58A4F" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#153B32" stopOpacity="0.9" />
                </linearGradient>

                {/* Subtle Glow Filter for Central Research Director */}
                <filter id="subtleGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Connecting Geometric Lines with Animated SVG Markers */}
              <g>
                {TOPOLOGY_CONNECTORS.map((c, i) => {
                  const src = TOPOLOGY_NODES.find(n => n.id === c.from)!;
                  const dst = TOPOLOGY_NODES.find(n => n.id === c.to)!;
                  const isHighlighted = hoveredNode === c.from || hoveredNode === c.to || selectedNode.id === c.from || selectedNode.id === c.to;

                  // Render path based on viewMode
                  const isDirectorConnection = c.from === "stage_director" || c.to === "stage_director";
                  const pathD = `M ${src.x} ${src.y} C ${(src.x + dst.x) / 2} ${src.y}, ${(src.x + dst.x) / 2} ${dst.y}, ${dst.x} ${dst.y}`;

                  return (
                    <g key={i}>
                      {/* Underlying Fine Connecting Wire */}
                      <path
                        d={pathD}
                        fill="none"
                        stroke={isHighlighted ? "#B58A4F" : "#D6D0C3"}
                        strokeWidth={isHighlighted ? 2.0 : 1.1}
                        strokeDasharray={isDirectorConnection ? "3,3" : undefined}
                        className="transition-colors duration-300"
                      />
                      {/* Animated Evidence Particle along the wire */}
                      <circle r={isHighlighted ? "2.5" : "1.8"} fill={isHighlighted ? "#B58A4F" : "#1D4D40"}>
                        <animateMotion
                          path={pathD}
                          dur={`${2.8 + (i % 4) * 0.7}s`}
                          repeatCount="indefinite"
                        />
                      </circle>
                    </g>
                  );
                })}
              </g>

              {/* Interactive Topology Nodes */}
              {TOPOLOGY_NODES.map((node) => {
                const isSelected = selectedNode.id === node.id;
                const isHovered = hoveredNode === node.id;
                const isDirector = node.stage === "director";
                const isSpecialist = node.stage === "specialist";
                const isDossier = node.stage === "dossier";
                const Icon = node.icon;

                // Radius calculations based on institutional hierarchy
                const radius = isDirector ? 40 : (isDossier ? 34 : (isSpecialist ? 26 : 22));

                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x}, ${node.y})`}
                    className="cursor-pointer transition-transform duration-200"
                    onClick={() => setSelectedNode(node)}
                    onMouseEnter={() => setHoveredNode(node.id)}
                    onMouseLeave={() => setHoveredNode(null)}
                  >
                    {/* Concentric Orbital Halo on Selected or Hovered Node */}
                    {(isSelected || isHovered) && (
                      <circle
                        r={radius + 8}
                        fill="none"
                        stroke={node.borderColor}
                        strokeWidth="1.5"
                        strokeDasharray="4,4"
                        className="opacity-70 animate-spin-slow"
                      />
                    )}

                    {/* Node Core Geometry */}
                    <circle
                      r={radius}
                      fill={node.bg}
                      stroke={isSelected ? "#B58A4F" : node.borderColor}
                      strokeWidth={isSelected ? 2.5 : 1.5}
                      filter={isDirector ? "url(#subtleGlow)" : undefined}
                      className="transition-all duration-200"
                    />

                    {/* Concentric Ring for Central Research Director */}
                    {isDirector && (
                      <circle
                        r={radius - 8}
                        fill="none"
                        stroke="#B58A4F"
                        strokeWidth="1"
                        strokeOpacity="0.6"
                      />
                    )}

                    {/* Node Centered Icon */}
                    <foreignObject
                      x={-10}
                      y={-10}
                      width={20}
                      height={20}
                      className="pointer-events-none"
                    >
                      <div className="w-full h-full flex items-center justify-center">
                        <Icon
                          className="w-4 h-4"
                          style={{ color: isDirector || isDossier ? "#FCFBF8" : node.categoryColor }}
                        />
                      </div>
                    </foreignObject>

                    {/* Node Micro-Label */}
                    <text
                      y={radius + 15}
                      textAnchor="middle"
                      className={`text-[9.5px] font-mono ${
                        isSelected ? "font-bold fill-[#153B32]" : "fill-[#5C5850]"
                      }`}
                    >
                      {node.title.length > 20 ? `${node.title.slice(0, 19)}…` : node.title}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* =========================================================================
              ACTIVE NODE INSPECTION PANEL (Deep Analytical Context)
             ========================================================================= */}
          <div className="mt-4 pt-4 border-t border-[#D6D0C3] bg-white rounded p-4 sm:p-5 border shadow-xs flex flex-col lg:flex-row items-start justify-between gap-6">
            {/* Left: Active Node Definition */}
            <div className="space-y-2 flex-1">
              <div className="flex items-center space-x-2.5">
                <div
                  className="w-8 h-8 rounded flex items-center justify-center border shrink-0"
                  style={{ backgroundColor: selectedNode.bg, borderColor: selectedNode.borderColor }}
                >
                  <selectedNode.icon
                    className="w-4 h-4"
                    style={{ color: selectedNode.stage === "director" || selectedNode.stage === "dossier" ? "#FFFFFF" : selectedNode.categoryColor }}
                  />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-serif font-bold text-base text-[#153B32]">
                      {selectedNode.title}
                    </h4>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F7F5EF] border border-[#D6D0C3] text-[#789487] uppercase font-semibold">
                      {selectedNode.stage}
                    </span>
                  </div>
                  {selectedNode.subtitle && (
                    <div className="text-xs text-[#789487] font-mono">{selectedNode.subtitle}</div>
                  )}
                </div>
              </div>

              <p className="text-xs text-[#5C5850] font-sans leading-relaxed pt-1">
                {selectedNode.analyticalScope}
              </p>
            </div>

            {/* Middle: Methodology & Primary Sources */}
            <div className="space-y-1.5 lg:border-l lg:border-[#D6D0C3] lg:pl-6 flex-1 text-xs">
              <div className="font-mono text-[10px] uppercase text-[#B58A4F] font-bold">
                Methodology & Audit Sources
              </div>
              <div className="font-serif text-[#153B32] font-semibold">
                {selectedNode.methodology}
              </div>
              <ul className="space-y-1 pt-1 text-[11px] text-[#5C5850]">
                {selectedNode.primarySources.map((src, idx) => (
                  <li key={idx} className="flex items-start space-x-1.5">
                    <span className="text-[#1D4D40] font-bold">↳</span>
                    <span>{src}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right: Key Deliverable Pill */}
            <div className="lg:border-l lg:border-[#D6D0C3] lg:pl-6 space-y-1.5 w-full lg:w-72 text-xs shrink-0">
              <div className="font-mono text-[10px] uppercase text-[#153B32] font-bold">
                Audited System Deliverable
              </div>
              <div className="p-2.5 rounded bg-[#F7F5EF] border border-[#D6D0C3] font-mono text-[11px] text-[#153B32] font-medium leading-relaxed">
                {selectedNode.keyDeliverable}
              </div>
              <div className="text-[10px] text-[#789487] font-mono pt-0.5">
                Cryptographic Verification Standard: Strict
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            FIVE CORE INSTITUTIONAL INTELLIGENCE CAPABILITIES
           ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3.5 pt-2">
          {[
            {
              title: "Corporate Knowledge Graph",
              desc: "Ownership lineages, sole-source packaging dependencies, and customer concentration networks.",
              icon: Network
            },
            {
              title: "Temporal Intelligence",
              desc: "Multi-year statement progression, management forward guidance delivery, and historical claim audits.",
              icon: Activity
            },
            {
              title: "Financial Intelligence",
              desc: "Deterministic OLAP ratios, quality of earnings, reverse DCF, and INR scenario stress-testing.",
              icon: BarChart3
            },
            {
              title: "Information Asymmetry",
              desc: "Systematic auditing of disclosed vs unverified corporate metrics and footnote discrepancies.",
              icon: Search
            },
            {
              title: "Thesis Invalidation Radar",
              desc: "Falsifiable investment theses paired with observable invalidation conditions and continuous monitors.",
              icon: AlertTriangle
            }
          ].map((cap, idx) => {
            const Icon = cap.icon;
            return (
              <div
                key={idx}
                className="p-4 rounded bg-[#FCFBF8] border border-[#D6D0C3] hover:border-[#153B32] transition-colors shadow-xs space-y-2 group cursor-pointer"
              >
                <div className="w-7 h-7 rounded bg-[#F7F5EF] border border-[#D6D0C3] flex items-center justify-center text-[#153B32] group-hover:bg-[#153B32] group-hover:text-white transition-colors">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="font-serif font-bold text-xs text-[#153B32]">
                  {cap.title}
                </div>
                <p className="text-[11px] text-[#5C5850] leading-relaxed">
                  {cap.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* =========================================================================
            BOTTOM 6-STAGE REFINED PROCESS TIMELINE
           ========================================================================= */}
        <div className="pt-4 border-t border-[#D6D0C3]">
          <div className="text-[10px] font-mono uppercase text-[#789487] font-bold mb-3 tracking-wider">
            Sequential Evidence Flow Lifecycle
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
            {[
              { num: "01", title: "Ingest Filings", desc: "Extract & SHA-256 hash primary SEC disclosures" },
              { num: "02", title: "Specialist Research", desc: "Domain-partitioned independent investigations" },
              { num: "03", title: "Claim Formation", desc: "Convert findings into testable propositions" },
              { num: "04", title: "Adversarial Debate", desc: "Cross-examine, rebut, and revise claims" },
              { num: "05", title: "Judicial Adjudication", desc: "Evidentiary weight review (no majority voting)" },
              { num: "06", title: "Final Dossier", desc: "Actionable conviction memo & PDF report" }
            ].map((step, idx) => (
              <div
                key={idx}
                onClick={() => setActiveTimelineStep(idx + 1)}
                className={`p-3 rounded border transition-all cursor-pointer ${
                  activeTimelineStep === idx + 1
                    ? "bg-[#153B32] text-[#FCFBF8] border-[#153B32] shadow-xs"
                    : "bg-[#FCFBF8] text-[#5C5850] border-[#D6D0C3] hover:border-[#153B32]"
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                  <span className={activeTimelineStep === idx + 1 ? "text-[#B58A4F] font-bold" : "text-[#789487]"}>
                    STAGE {step.num}
                  </span>
                  {activeTimelineStep === idx + 1 && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B58A4F] animate-pulse"></span>
                  )}
                </div>
                <div className={`font-serif font-bold text-xs ${activeTimelineStep === idx + 1 ? "text-[#FCFBF8]" : "text-[#153B32]"}`}>
                  {step.title}
                </div>
                <p className={`text-[10.5px] mt-1 leading-snug ${activeTimelineStep === idx + 1 ? "text-[#D6D0C3]" : "text-[#789487]"}`}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
