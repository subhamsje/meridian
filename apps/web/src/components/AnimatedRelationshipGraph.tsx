"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Building2, 
  DollarSign, 
  ShieldAlert, 
  Users, 
  Cpu, 
  Scale, 
  FileCheck2, 
  FileText, 
  ArrowRight,
  TrendingUp,
  Activity,
  Layers,
  Award
} from "lucide-react";

interface NodeData {
  id: string;
  label: string;
  category: "subject" | "input" | "phase";
  icon: any;
  color: string;
  bg: string;
  border: string;
  details: string;
  inrValuation?: string;
  cx: number;
  cy: number;
}

const GRAPH_NODES: NodeData[] = [
  // Central Subject Company Node
  {
    id: "subject",
    label: "NVIDIA Corporation (NVDA)",
    category: "subject",
    icon: Building2,
    color: "#F4F1E9",
    bg: "#172B27",
    border: "#A47B48",
    details: "Target Enterprise · Audited SEC 10-K & Q3 Disclosures · FY2026 Capex Cycle",
    inrValuation: "₹2,68,43,950 Cr ($3.19T)",
    cx: 400,
    cy: 220
  },
  // Ingested Evidence & Domain Nodes (Orbiting on the Left / Outer Ring)
  {
    id: "financials",
    label: "Financial Disclosures",
    category: "input",
    icon: DollarSign,
    color: "#172B27",
    bg: "#FFFFFF",
    border: "#526C60",
    details: "Audited Gross Margins (74.6%), Cash Runway (Infinite), FY25 Net Income ₹2,50,767 Cr",
    cx: 140,
    cy: 80
  },
  {
    id: "risks",
    label: "Single-Foundry Moat",
    category: "input",
    icon: ShieldAlert,
    color: "#8B2834",
    bg: "#FFFFFF",
    border: "#8B2834",
    details: "TSMC CoWoS-L Advanced Packaging Chokepoint & Export Control Licensing Limits",
    cx: 110,
    cy: 220
  },
  {
    id: "customers",
    label: "Hyperscaler Capex",
    category: "input",
    icon: Users,
    color: "#A47B48",
    bg: "#FFFFFF",
    border: "#A47B48",
    details: "Microsoft, Meta, Alphabet & AWS Represent ~41% of Compute & Networking Segment Net Sales",
    cx: 140,
    cy: 360
  },
  {
    id: "technology",
    label: "CUDA & Blackwell HW",
    category: "input",
    icon: Cpu,
    color: "#264D3B",
    bg: "#FFFFFF",
    border: "#264D3B",
    details: "GB200 NVL72 Liquid-Cooled Rack Architecture & Proprietary CUDA Developer Ecosystem",
    cx: 400,
    cy: 70
  },
  {
    id: "governance",
    label: "Regulatory Filings",
    category: "input",
    icon: FileText,
    color: "#172B27",
    bg: "#FFFFFF",
    border: "#526C60",
    details: "100% Primary Regulatory Ground Truth (SEC 10-K, 10-Q Notes, Form 8-K Exhibits)",
    cx: 400,
    cy: 370
  },
  // Processing Pipeline Nodes (Advancing to the Right)
  {
    id: "specialist_society",
    label: "6-Agent Society",
    category: "phase",
    icon: Layers,
    color: "#FFFFFF",
    bg: "#233F3A",
    border: "#A47B48",
    details: "Financial, Forensic, Tech, Moat, Bull, and Bear Specialists Form Independent Hypotheses",
    cx: 640,
    cy: 130
  },
  {
    id: "debate",
    label: "Adversarial Debate",
    category: "phase",
    icon: Scale,
    color: "#FFFFFF",
    bg: "#172B27",
    border: "#D6D0C3",
    details: "3-Round Falsification Protocol: Challenging Claims, Auditing Assumptions & Forcing Revisions",
    cx: 680,
    cy: 250
  },
  {
    id: "dossier",
    label: "Audited Intelligence Memo",
    category: "phase",
    icon: Award,
    color: "#FFFFFF",
    bg: "#A47B48",
    border: "#8F6B3E",
    details: "Deterministic Ratios, Indian Numbering INR Metrics, Conviction Rating & Verified Sources",
    cx: 700,
    cy: 370
  }
];

const GRAPH_EDGES = [
  // Inputs flowing into Subject
  { from: "financials", to: "subject", label: "Audited 10-K Metrics" },
  { from: "risks", to: "subject", label: "Supply Packaging Limits" },
  { from: "customers", to: "subject", label: "41% Cloud Concentration" },
  { from: "technology", to: "subject", label: "CUDA Moat Defense" },
  { from: "governance", to: "subject", label: "Regulatory Provenance" },
  // Subject flowing into Multi-Agent Execution Pipeline
  { from: "subject", to: "specialist_society", label: "Evidence Allocation" },
  { from: "specialist_society", to: "debate", label: "Independent Claims" },
  { from: "debate", to: "dossier", label: "Adjudicated Ground Truth" }
];

export default function AnimatedRelationshipGraph() {
  const [selectedNode, setSelectedNode] = useState<NodeData>(GRAPH_NODES[0]);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  return (
    <div className="w-full bg-[#F4F1E9] border border-[#D6D0C3] rounded-[4px] p-6 shadow-sm overflow-hidden my-8">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#D6D0C3] gap-2">
        <div className="space-y-0.5">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#264D3B] animate-pulse"></span>
            <span className="text-[11px] font-mono uppercase text-[#A47B48] font-semibold tracking-wider">
              Autonomous Intelligence Topology
            </span>
          </div>
          <h3 className="font-serif font-bold text-[#172B27] text-lg">
            How MERIDIAN Transforms Raw Disclosures into Adjudicated Conviction
          </h3>
        </div>
        <div className="text-[10px] font-mono text-[#79756C] bg-white px-2.5 py-1 rounded border border-[#D6D0C3] shrink-0">
          Interactive Flow · Click or Hover Any Entity
        </div>
      </div>

      {/* Main SVG Animated Graph */}
      <div className="relative w-full aspect-[16/9] max-h-[460px] bg-white/60 rounded-[3px] border border-[#D6D0C3]/60 mt-4 overflow-hidden">
        {/* Subtle Background Coordinate Grid */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
          <defs>
            <pattern id="graphGrid" width="24" height="24" patternUnits="userSpaceOnUse">
              <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#D6D0C3" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#graphGrid)" />
        </svg>

        <svg viewBox="0 0 820 450" className="w-full h-full select-none">
          {/* Animated Edge Lines */}
          <g>
            {GRAPH_EDGES.map((edge, i) => {
              const src = GRAPH_NODES.find(n => n.id === edge.from)!;
              const dst = GRAPH_NODES.find(n => n.id === edge.to)!;
              const isHighlighted = hoveredNode === edge.from || hoveredNode === edge.to || selectedNode.id === edge.from || selectedNode.id === edge.to;

              return (
                <g key={i}>
                  {/* Base connecting line */}
                  <line
                    x1={src.cx}
                    y1={src.cy}
                    x2={dst.cx}
                    y2={dst.cy}
                    stroke={isHighlighted ? "#A47B48" : "#D6D0C3"}
                    strokeWidth={isHighlighted ? 2.2 : 1.2}
                    strokeDasharray={edge.from === "subject" ? "4,4" : undefined}
                    className="transition-colors duration-300"
                  />
                  {/* Animated Particle Moving along the edge */}
                  <circle r="2.5" fill={isHighlighted ? "#A47B48" : "#526C60"}>
                    <animateMotion
                      path={`M ${src.cx} ${src.cy} L ${dst.cx} ${dst.cy}`}
                      dur={`${3 + (i % 3)}s`}
                      repeatCount="indefinite"
                    />
                  </circle>
                </g>
              );
            })}
          </g>

          {/* Interactive SVG Nodes */}
          {GRAPH_NODES.map((node) => {
            const isSelected = selectedNode.id === node.id;
            const isHovered = hoveredNode === node.id;
            const isSubject = node.category === "subject";
            const Icon = node.icon;

            return (
              <g
                key={node.id}
                transform={`translate(${node.cx}, ${node.cy})`}
                className="cursor-pointer transition-transform duration-200"
                onClick={() => setSelectedNode(node)}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
              >
                {/* Selection Halo */}
                {(isSelected || isHovered) && (
                  <circle
                    r={isSubject ? 42 : 30}
                    fill="none"
                    stroke={node.border}
                    strokeWidth="2"
                    strokeDasharray="3,3"
                    className="animate-spin-slow opacity-80"
                  />
                )}

                {/* Node Body Circle */}
                <circle
                  r={isSubject ? 36 : 24}
                  fill={node.bg}
                  stroke={node.border}
                  strokeWidth={isSelected ? 2.5 : 1.5}
                  className="shadow-sm transition-all duration-200"
                />

                {/* Node Icon */}
                <foreignObject
                  x={isSubject ? -14 : -10}
                  y={isSubject ? -14 : -10}
                  width={isSubject ? 28 : 20}
                  height={isSubject ? 28 : 20}
                  className="pointer-events-none"
                >
                  <div className="w-full h-full flex items-center justify-center">
                    <Icon 
                      className={`w-full h-full`}
                      style={{ color: node.color }}
                    />
                  </div>
                </foreignObject>

                {/* Node Label */}
                <text
                  y={isSubject ? 50 : 36}
                  textAnchor="middle"
                  className={`text-[10px] font-mono font-medium ${
                    isSelected ? "font-bold fill-[#172B27]" : "fill-[#5C5850]"
                  }`}
                >
                  {node.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Selected Entity Context Pill (Progressive Inspection) */}
        <div className="absolute bottom-3 inset-x-3 bg-white/95 backdrop-blur-xs border border-[#D6D0C3] rounded p-3 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-start sm:items-center space-x-3">
            <div 
              className="w-7 h-7 rounded flex items-center justify-center shrink-0 border"
              style={{ backgroundColor: selectedNode.bg, borderColor: selectedNode.border }}
            >
              <selectedNode.icon className="w-4 h-4" style={{ color: selectedNode.color }} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-serif font-bold text-[#172B27]">{selectedNode.label}</span>
                {selectedNode.inrValuation && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#172B27] text-[#F4F1E9]">
                    Valuation: {selectedNode.inrValuation}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#5C5850] mt-0.5">
                {selectedNode.details}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 font-mono text-[10px] text-[#79756C] shrink-0">
            <span>Flow: Primary Evidence → Adversarial Red-Team → Adjudicated Memo</span>
          </div>
        </div>
      </div>

      {/* 5-Step Pipeline Legend Bar */}
      <div className="mt-4 pt-3 border-t border-[#D6D0C3] grid grid-cols-2 sm:grid-cols-5 gap-2 text-[10px] font-mono text-[#5C5850]">
        <div className="flex items-center space-x-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#172B27]"></span>
          <span>1. Ingest Filings</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#526C60]"></span>
          <span>2. Specialist Research</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#A47B48]"></span>
          <span>3. Claim Formation</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#8B2834]"></span>
          <span>4. Adversarial Debate</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#264D3B]"></span>
          <span>5. Final Dossier</span>
        </div>
      </div>
    </div>
  );
}
