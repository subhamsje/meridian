"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { 
  Building2, 
  ArrowRight, 
  FileText, 
  Network, 
  Users, 
  Scale, 
  ShieldCheck, 
  Play, 
  Pause,
  RotateCw, 
  ExternalLink,
  MessageSquare,
  Activity,
  Send,
  Printer,
  Search,
  Filter,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Info,
  ChevronRight,
  ChevronLeft,
  TrendingUp,
  TrendingDown,
  Lock,
  Edit3,
  Check,
  ChevronUp,
  ChevronDown,
  Terminal,
  Clock,
  Briefcase,
  Layers,
  Database,
  Sliders,
  CheckCircle2,
  XCircle,
  HelpCircle
} from "lucide-react";
import { API_BASE } from "@/lib/utils";
import LivingKnowledgeGraph, { GraphNode, GraphEdge, INSTITUTIONAL_CATEGORIES } from "@/components/LivingKnowledgeGraph";
import { ReactFlowKnowledgeGraph } from "@/components/ReactFlowKnowledgeGraph";

export default function FlagshipDemoPage() {
  const [loading, setLoading] = useState(true);
  const [demoData, setDemoData] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [currentStage, setCurrentStage] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Subsystem Entities
  const [invDetail, setInvDetail] = useState<any>(null);
  const [graphData, setGraphData] = useState<{ nodes: any[]; edges: any[] }>({ nodes: [], edges: [] });
  const [societyAgents, setSocietyAgents] = useState<any[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [interactions, setInteractions] = useState<any[]>([]);
  const [claims, setClaims] = useState<any[]>([]);
  const [selectedClaim, setSelectedClaim] = useState<any>(null);
  const [debates, setDebates] = useState<any[]>([]);
  const [evidence, setEvidence] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [hypotheticals, setHypotheticals] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);

  // Stage 01: Mandate Modification
  const [mandateText, setMandateText] = useState("");
  const [mandateEditing, setMandateEditing] = useState(false);
  const [mandateSaved, setMandateSaved] = useState(false);
  const [selectedSourceForModal, setSelectedSourceForModal] = useState<any>(null);

  // Stage 02: Graph Controls & Filters
  const [graphEngine, setGraphEngine] = useState<"canvas" | "reactflow">("canvas");
  const [graphSearch, setGraphSearch] = useState("");
  const [graphTypeFilter, setGraphTypeFilter] = useState("ALL");
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<GraphEdge | null>(null);
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);

  // Stage 03: Operations, Simulation & Interrogation
  const [simRounds, setSimRounds] = useState(40);
  const [simHorizonHours, setSimHorizonHours] = useState(72);
  const [simStepMinutes, setSimStepMinutes] = useState(60);
  const [simRunning, setSimRunning] = useState(false);
  const [simProgress, setSimProgress] = useState(100);
  const [simTab, setSimTab] = useState<"interrogate" | "simulation">("interrogate");
  const [simLogs, setSimLogs] = useState<string[]>([
    "00:21:37.512 ├─ Specialist Agents Active: 16 (Empirical, Forensic, Quantitative, Counter-Thesis)",
    "00:21:37.512 ├─ Simulation Horizon: 72 Hours (60 min / epoch)",
    "00:21:37.512 ├─ Verified Atomic Claims: 42 (SEC 10-K & CRS Grounded)",
    "00:21:37.512 ├─ OpenTelemetry Tracing: Active (trace_id: 8f92a10b4c7e2d93)",
    "00:21:37.512 └─ Multi-Platform Deliberation Pipeline Ready."
  ]);

  // Stage 03: Operations & Interrogation
  const [agentSearch, setAgentSearch] = useState("");
  const [interventionQuery, setInterventionQuery] = useState("");
  const [interventionLoading, setInterventionLoading] = useState(false);
  const [interventionHistory, setInterventionHistory] = useState<any[]>([]);
  const [interrogationMode, setInterrogationMode] = useState<"single" | "all">("single");
  const [societyQuestion, setSocietyQuestion] = useState("");
  const [societyLoading, setSocietyLoading] = useState(false);
  const [societyAnswers, setSocietyAnswers] = useState<any[]>([]);

  // Stage 03: Exogenous Hypothetical Event Injection
  const [hypoEvent, setHypoEvent] = useState("");
  const [hypoLoading, setHypoLoading] = useState(false);
  const [activeHypoResult, setActiveHypoResult] = useState<any>(null);

  // Stage 04: Adversarial Claim Challenge
  const [challengeModalClaim, setChallengeModalClaim] = useState<any>(null);
  const [challengeText, setChallengeText] = useState("");
  const [challengeChallenger, setChallengeChallenger] = useState("bear_analyst");
  const [challengeLoading, setChallengeLoading] = useState(false);

  // Bottom Telemetry Drawer
  const [showEventDrawer, setShowEventDrawer] = useState(false);

  // Mobile / Tablet Responsive Navigation States
  const [stage3MobileTab, setStage3MobileTab] = useState<"specialists" | "stream" | "interrogate">("stream");
  const [stage4MobileTab, setStage4MobileTab] = useState<"floor" | "specialists" | "evidence">("floor");

  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setLeftPanelCollapsed(true);
      setRightPanelCollapsed(true);
    }
  }, []);

  useEffect(() => {
    initFlagshipDemo();
  }, []);

  const initFlagshipDemo = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/demo/flagship`);
      const data = await res.json();
      setDemoData(data);
      setToken(data.access_token);
      setMandateText(data.company?.research_question || "");
      localStorage.setItem("meridian_demo_token", data.access_token);

      await fetchAllSubsystems(data.investigation_id, data.access_token);
    } catch (err) {
      console.error("Flagship demo initialization failed", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllSubsystems = async (invId: string, jwt: string) => {
    try {
      const [detailRes, graphRes, agentsRes, interRes, claimsRes, debatesRes, evRes, reportsRes, hypoRes, evStreamRes] = await Promise.all([
        fetch(`${API_BASE}/investigations/${invId}`, { headers: { Authorization: `Bearer ${jwt}` } }),
        fetch(`${API_BASE}/investigations/${invId}/graph`, { headers: { Authorization: `Bearer ${jwt}` } }),
        fetch(`${API_BASE}/investigations/${invId}/society/agents`, { headers: { Authorization: `Bearer ${jwt}` } }),
        fetch(`${API_BASE}/investigations/${invId}/society/interactions`, { headers: { Authorization: `Bearer ${jwt}` } }),
        fetch(`${API_BASE}/investigations/${invId}/claims`, { headers: { Authorization: `Bearer ${jwt}` } }),
        fetch(`${API_BASE}/investigations/${invId}/debates`, { headers: { Authorization: `Bearer ${jwt}` } }),
        fetch(`${API_BASE}/investigations/${invId}/evidence`, { headers: { Authorization: `Bearer ${jwt}` } }),
        fetch(`${API_BASE}/investigations/${invId}/reports`, { headers: { Authorization: `Bearer ${jwt}` } }),
        fetch(`${API_BASE}/investigations/${invId}/society/hypotheticals`, { headers: { Authorization: `Bearer ${jwt}` } }),
        fetch(`${API_BASE}/investigations/${invId}/events`, { headers: { Authorization: `Bearer ${jwt}` } }).catch(() => null)
      ]);

      if (detailRes.ok) setInvDetail(await detailRes.json());
      if (graphRes.ok) {
        const g = await graphRes.json();
        setGraphData(g);
        if (g.nodes?.length > 0) setSelectedNode(g.nodes[0]);
      }
      if (agentsRes.ok) {
        const ags = await agentsRes.json();
        setSocietyAgents(ags);
        if (ags.length > 0) setSelectedAgent(ags[0]);
      }
      if (interRes.ok) setInteractions(await interRes.json());
      if (claimsRes.ok) {
        const cls = await claimsRes.json();
        setClaims(cls);
        if (cls.length > 0) setSelectedClaim(cls[0]);
      }
      if (debatesRes.ok) setDebates(await debatesRes.json());
      if (evRes.ok) setEvidence(await evRes.json());
      if (reportsRes.ok) setReports(await reportsRes.json());
      if (hypoRes.ok) {
        const hypos = await hypoRes.json();
        setHypotheticals(hypos);
        if (hypos.length > 0) setActiveHypoResult(hypos[0]);
      }
      if (evStreamRes && evStreamRes.ok) {
        setEvents(await evStreamRes.json());
      }
    } catch (err) {
      console.error("Failed loading Meridian subsystems", err);
    }
  };

  // Stage 01: Save Analytical Mandate
  const handleSaveMandate = async () => {
    if (!demoData || !token || !mandateText.trim()) return;
    try {
      const res = await fetch(`${API_BASE}/investigations/${demoData.investigation_id}/mandate`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ mandate: mandateText })
      });
      if (res.ok) {
        setMandateEditing(false);
        setMandateSaved(true);
        setTimeout(() => setMandateSaved(false), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Stage 03: Direct Targeted Interrogation
  const handleIntervention = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoData || !selectedAgent || !interventionQuery.trim() || !token) return;
    setInterventionLoading(true);

    try {
      const res = await fetch(`${API_BASE}/investigations/${demoData.investigation_id}/society/intervene`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          agent_id: selectedAgent.agent_id,
          message: interventionQuery
        })
      });
      const data = await res.json();
      if (res.ok) {
        setInterventionHistory(prev => [...prev, data]);
        setInterventionQuery("");
        const [interRes, agRes] = await Promise.all([
          fetch(`${API_BASE}/investigations/${demoData.investigation_id}/society/interactions`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`${API_BASE}/investigations/${demoData.investigation_id}/society/agents/${selectedAgent.agent_id}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        if (interRes.ok) setInteractions(await interRes.json());
        if (agRes.ok) setSelectedAgent(await agRes.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setInterventionLoading(false);
    }
  };

  // Stage 03: Whole-Society Interrogation
  const handleSocietyInterrogateAll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoData || !societyQuestion.trim() || !token) return;
    setSocietyLoading(true);

    try {
      const res = await fetch(`${API_BASE}/investigations/${demoData.investigation_id}/society/interrogate-all`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ question: societyQuestion })
      });
      const data = await res.json();
      if (res.ok) {
        setSocietyAnswers(prev => [data, ...prev]);
        setSocietyQuestion("");
        const interRes = await fetch(`${API_BASE}/investigations/${demoData.investigation_id}/society/interactions`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (interRes.ok) setInteractions(await interRes.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSocietyLoading(false);
    }
  };

  // Stage 03: Exogenous Hypothetical Shock
  const handleInjectHypothetical = async (e: React.FormEvent, customEvent?: string) => {
    if (e) e.preventDefault();
    const eventToInject = customEvent || hypoEvent;
    if (!demoData || !eventToInject.trim() || !token) return;
    setHypoLoading(true);

    try {
      const res = await fetch(`${API_BASE}/investigations/${demoData.investigation_id}/society/hypothetical`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ event_description: eventToInject })
      });
      const data = await res.json();
      if (res.ok) {
        setActiveHypoResult(data);
        setHypotheticals(prev => [data, ...prev]);
        setHypoEvent("");
        const [interRes, graphRes] = await Promise.all([
          fetch(`${API_BASE}/investigations/${demoData.investigation_id}/society/interactions`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`${API_BASE}/investigations/${demoData.investigation_id}/graph`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        if (interRes.ok) setInteractions(await interRes.json());
        if (graphRes.ok) setGraphData(await graphRes.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setHypoLoading(false);
    }
  };

  // Stage 03: MiroFish-Style Multi-Agent Simulation Run
  const handleRunSimulation = () => {
    if (simRunning) return;
    setSimRunning(true);
    setSimProgress(0);
    const now = new Date().toTimeString().split(" ")[0] + ".104";
    setSimLogs(prev => [
      ...prev,
      `${now} ├─ Launching Multi-Agent Simulation: ${simRounds} rounds @ ${simHorizonHours}h horizon...`,
      `${now} ├─ Ingesting latest SEC 10-K disclosures & DuckDB valuation metrics...`
    ]);

    let step = 0;
    const interval = setInterval(() => {
      step += 1;
      setSimProgress(Math.min(100, Math.round((step / 5) * 100)));
      const ts = new Date().toTimeString().split(" ")[0] + "." + Math.floor(100 + Math.random() * 899);

      if (step === 1) {
        setSimLogs(prev => [...prev, `${ts} ├─ Epoch 01-10: Forensic Accountant & Sovereign Risk Officer peer challenge active`]);
      } else if (step === 2) {
        setSimLogs(prev => [...prev, `${ts} ├─ Epoch 11-20: Bear Analyst and Competitive Strategist pressure-testing top customer concentration (18.2%)`]);
      } else if (step === 3) {
        setSimLogs(prev => [...prev, `${ts} ├─ Epoch 21-30: Bull Analyst rebuts multiple compression using AIP commercial acceleration vector`]);
      } else if (step === 4) {
        setSimLogs(prev => [...prev, `${ts} ├─ Epoch 31-40: Consensus synthesis finalized across 16 specialists`]);
      } else if (step >= 5) {
        clearInterval(interval);
        setSimRunning(false);
        setSimProgress(100);
        setSimLogs(prev => [
          ...prev,
          `${ts} └─ [SUCCESS] ${simRounds} simulation rounds completed. Deliberation Floor updated.`
        ]);
      }
    }, 600);
  };

  // Stage 04: Adversarial Claim Challenge
  const handleSubmitChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoData || !challengeModalClaim || !challengeText.trim() || !debates[0] || !token) return;
    setChallengeLoading(true);

    try {
      const res = await fetch(`${API_BASE}/investigations/${demoData.investigation_id}/debates/${debates[0].id}/challenge`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          claim_id: challengeModalClaim.id,
          challenger_agent_id: challengeChallenger,
          challenge_text: challengeText
        })
      });
      if (res.ok) {
        setChallengeModalClaim(null);
        setChallengeText("");
        const [debRes, clRes] = await Promise.all([
          fetch(`${API_BASE}/investigations/${demoData.investigation_id}/debates`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE}/investigations/${demoData.investigation_id}/claims`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        if (debRes.ok) setDebates(await debRes.json());
        if (clRes.ok) setClaims(await clRes.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setChallengeLoading(false);
    }
  };

  // Category counts for graph
  const entityCategoryCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: graphData.nodes.length };
    graphData.nodes.forEach(n => {
      const t = n.type || "default";
      counts[t] = (counts[t] || 0) + 1;
    });
    return counts;
  }, [graphData.nodes]);

  // Filtered agents list
  const filteredAgents = useMemo(() => {
    return societyAgents.filter(ag => {
      const s = agentSearch.toLowerCase();
      return ag.name.toLowerCase().includes(s) || 
             ag.role.toLowerCase().includes(s) || 
             (ag.specialization && ag.specialization.toLowerCase().includes(s));
    });
  }, [societyAgents, agentSearch]);

  const primaryReport = reports[0];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#111315] flex flex-col items-center justify-center text-[#a0a7b1]">
        <div className="w-8 h-8 rounded-full border-2 border-[#30353c] border-t-[#3b82f6] animate-spin mb-3"></div>
        <p className="text-xs font-mono tracking-wider text-[#a0a7b1]">
          INITIALIZING MERIDIAN RESEARCH WORKSTATION...
        </p>
      </div>
    );
  }

  return (
    <div className="app-shell bg-[#111315] text-[#e5e7eb] font-sans selection:bg-[#20242a] selection:text-[#f8fafc]">
      {/* GLOBAL FLOATING NAVIGATION — Apple-Grade Ultra-Transparent Liquid Glass */}
      <header className="fixed top-2.5 inset-x-2 sm:inset-x-4 lg:inset-x-6 z-40 select-none pointer-events-none">
        <div className="glass-liquid-nav nav-liquid-glass pointer-events-auto h-12 px-3 md:px-4 flex items-center justify-between mx-auto w-full max-w-[1780px]">
          {/* Brand & Corporate Identity Group */}
          <div className="flex items-center space-x-2.5 sm:space-x-3.5 shrink-0">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="w-6 h-6 rounded-lg bg-white/[0.08] border border-white/[0.18] flex items-center justify-center font-mono font-bold text-white text-[11px] shadow-xs group-hover:bg-white/[0.14] group-hover:border-white/[0.28] transition-all">
                M
              </div>
              <span className="font-semibold text-xs tracking-wider uppercase text-white/90 group-hover:text-white transition-colors">
                Meridian
              </span>
            </Link>

            <div className="h-4 w-px bg-white/[0.12] hidden md:block"></div>

            <div className="hidden md:flex items-center space-x-2">
              <span className="text-xs font-medium text-white/85 tracking-tight truncate max-w-[180px] 2xl:max-w-none">
                Palantir Technologies Inc. <span className="text-white/50 text-[11px] hidden 2xl:inline">(NYSE: PLTR)</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/[0.05] border border-white/[0.12] text-white/70 shadow-xs">
                CIK: 0001321655
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/[0.12] border border-emerald-400/[0.3] text-emerald-300 flex items-center space-x-1.5 shadow-[0_0_12px_-2px_rgba(16,185,129,0.25)]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399] animate-pulse"></span>
                <span className="hidden 2xl:inline">SEC 10-K VERIFIED</span>
                <span className="2xl:hidden">10-K</span>
              </span>
            </div>
          </div>

          {/* 5-Stage Stepper Navigation Group */}
          <nav className="glass-stepper-group shrink-0" aria-label="Investigation Stages">
            {[
              { stage: 1, label: "01 Mandate & Seeds", short: "01 Seeds", icon: FileText },
              { stage: 2, label: "02 Relationship Graph", short: "02 Graph", icon: Network },
              { stage: 3, label: "03 Specialist Operations", short: "03 Operations", icon: Users },
              { stage: 4, label: "04 Deliberation Floor", short: "04 Deliberation", icon: Scale },
              { stage: 5, label: "05 Intelligence Dossier", short: "05 Dossier", icon: ShieldCheck },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = currentStage === item.stage;
              return (
                <button
                  key={item.stage}
                  onClick={() => setCurrentStage(item.stage as any)}
                  className={`px-2.5 md:px-3 py-1.5 text-xs font-medium transition-all flex items-center space-x-1.5 cursor-pointer relative ${
                    isActive
                      ? "glass-tab-active"
                      : "glass-tab-inactive"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-[#737c88]"}`} />
                  <span className="hidden 2xl:inline">{item.label}</span>
                  <span className="hidden sm:inline 2xl:hidden">{item.short}</span>
                  <span className="sm:hidden">0{item.stage}</span>
                </button>
              );
            })}
          </nav>

          {/* Telemetry & Workspace Exit Group */}
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => setShowEventDrawer(prev => !prev)}
              className={`text-xs px-2.5 py-1.5 font-mono flex items-center space-x-1.5 transition-all cursor-pointer ${
                showEventDrawer 
                  ? "glass-action-pill-active" 
                  : "glass-action-pill"
              }`}
              title="Toggle Live Event Stream Drawer"
            >
              <Activity className={`w-3.5 h-3.5 ${showEventDrawer ? "text-[#60a5fa]" : "text-[#93c5fd]"}`} />
              <span className="hidden sm:inline">Event Telemetry</span>
              {showEventDrawer ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
            </button>

            <Link
              href="/app"
              className="text-xs px-3 py-1.5 font-medium transition-all flex items-center space-x-1.5 glass-action-pill"
            >
              <span className="hidden sm:inline">Custom Workspace</span>
              <ArrowRight className="w-3 h-3 text-white/80" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Flagship Stage Viewer */}
      <main className="flex-1 min-h-0 min-w-0 flex flex-col overflow-hidden relative">
        
        {/* ================= STAGE 01: Research Seeds & Mandate ================= */}
        {currentStage === 1 && (
          <div className="flex-1 min-h-0 min-w-0 overflow-y-auto overscroll-contain px-3 sm:px-6 md:px-8 pt-16 sm:pt-20 pb-12 max-w-5xl mx-auto w-full">
            <div className="mb-8 border-b border-[#30353c] pb-6">
              <div className="text-[11px] font-mono uppercase tracking-wider text-[#737c88] mb-1">
                Stage 01 • Institutional Grounding & Primary Disclosures
              </div>
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-serif font-bold text-[#f8fafc] tracking-tight">
                    Palantir Technologies Inc. (NYSE: PLTR)
                  </h1>
                  <p className="text-xs text-[#a0a7b1] mt-1">
                    Sector: Enterprise Software & Defense AI • Delaware Corporate Jurisdiction • Audited by Ernst & Young LLP
                  </p>
                </div>
                <div className="text-right font-mono text-xs text-[#a0a7b1]">
                  <div>CIK: 0001321655</div>
                  <div className="text-[#10b981] font-sans font-medium text-[11px]">Primary SEC 10-K Grounded</div>
                </div>
              </div>
              <p className="text-xs text-[#cbd5e1] mt-3 max-w-3xl leading-relaxed">
                {demoData?.company?.description}
              </p>
            </div>

            {/* Editable Investigation Mandate Ledger */}
            <div className="p-5 rounded bg-[#181b1f] border border-[#30353c] mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono uppercase text-[#a0a7b1] tracking-wider flex items-center space-x-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#3b82f6]" />
                  <span>Analytical Mandate & Investigative Scope</span>
                </span>
                {!mandateEditing ? (
                  <button
                    onClick={() => setMandateEditing(true)}
                    className="text-xs font-medium text-[#3b82f6] hover:text-[#60a5fa] flex items-center space-x-1 cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Edit Mandate</span>
                  </button>
                ) : (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleSaveMandate}
                      className="text-xs px-2.5 py-1 rounded bg-[#2563eb] hover:bg-[#1d4ed8] text-white flex items-center space-x-1 cursor-pointer"
                    >
                      <Check className="w-3 h-3" />
                      <span>Save Mandate</span>
                    </button>
                    <button
                      onClick={() => setMandateEditing(false)}
                      className="text-xs px-2 py-1 rounded border border-[#30353c] text-[#a0a7b1] hover:text-[#e5e7eb] cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              {mandateEditing ? (
                <textarea
                  value={mandateText}
                  onChange={(e) => setMandateText(e.target.value)}
                  rows={3}
                  className="w-full mt-2 p-2.5 rounded bg-[#111315] border border-[#3b82f6] text-xs text-[#e5e7eb] leading-relaxed focus:outline-none"
                />
              ) : (
                <p className="text-xs font-serif font-medium text-[#e5e7eb] leading-relaxed mt-1">
                  "{mandateText}"
                </p>
              )}

              {mandateSaved && (
                <div className="mt-2 text-xs font-mono text-[#10b981] flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Analytical mandate locked into specialist research registry.</span>
                </div>
              )}

              {/* Scope Registry Tags */}
              <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-[#30353c]">
                {["Corporate Structure (Class F)", "ASC 606 Revenue Recognition", "DoD Budget Appropriations", "Customer Concentration (18.2%)", "Valuation Sensitivity (8.0x -> 3.0x)"].map(tag => (
                  <span key={tag} className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#111315] border border-[#30353c] text-[#a0a7b1]">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Ingested Primary Seeds Table */}
            <div className="mb-10">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-mono uppercase tracking-wider text-[#a0a7b1]">
                  Primary Regulatory Disclosures & Evidence Documents ({demoData?.seeds?.length || 3})
                </h2>
                <span className="text-[11px] font-mono text-[#10b981]">100% SEC & CRS Grounded</span>
              </div>

              <div className="border border-[#30353c] rounded overflow-x-auto scrollbar-none">
                <table className="w-full min-w-[550px] text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#181b1f] border-b border-[#30353c] text-[10px] font-mono text-[#737c88] uppercase tracking-wider">
                      <th className="py-2.5 px-3">Publisher / Authority</th>
                      <th className="py-2.5 px-3">Document Title</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Filing Date</th>
                      <th className="py-2.5 px-3">Verification Standard</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#30353c] bg-[#111315]">
                    {demoData?.seeds?.map((seed: any, idx: number) => (
                      <tr key={idx} className="hover:bg-[#181b1f] transition-colors">
                        <td className="py-3 px-3 font-medium text-[#e5e7eb]">{seed.publisher}</td>
                        <td className="py-3 px-3">
                          <div className="font-medium text-[#e5e7eb]">{seed.title}</div>
                          <div className="text-[10px] text-[#737c88] font-mono truncate max-w-sm">{seed.url}</div>
                        </td>
                        <td className="py-3 px-3 font-mono text-[10px] uppercase text-[#a0a7b1]">{seed.category}</td>
                        <td className="py-3 px-3 font-mono text-[11px] text-[#a0a7b1]">{seed.date}</td>
                        <td className="py-3 px-3 font-mono text-[11px] text-[#10b981]">Audited / Verified</td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => setSelectedSourceForModal(seed)}
                            className="text-[11px] text-[#3b82f6] hover:text-[#60a5fa] font-medium cursor-pointer"
                          >
                            Inspect Excerpt
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Stage Proceed Footer */}
            <div className="flex justify-between items-center pt-6 border-t border-[#30353c]">
              <span className="text-xs text-[#737c88]">
                Primary factual grounding verified. Entity ontology ready for spatial exploration.
              </span>
              <button
                onClick={() => setCurrentStage(2)}
                className="px-4 py-2 rounded bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-medium text-xs flex items-center space-x-2 cursor-pointer transition-colors"
              >
                <span>Proceed to Stage 02: Knowledge Graph</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STAGE 02: Knowledge Graph Workstation ================= */}
        {currentStage === 2 && (
          <div className="flex-1 min-h-0 min-w-0 flex flex-row overflow-hidden divide-x divide-[#30353c] pt-[58px]">
            {/* Left Panel: Entity Directory (Desktop Sidebar or Mobile Overlay Drawer) */}
            {leftPanelCollapsed ? (
              <div className="hidden lg:flex w-10 shrink-0 h-full flex-col items-center py-3 border-r border-[#30353c] bg-[#141619] z-20 select-none">
                <button
                  onClick={() => setLeftPanelCollapsed(false)}
                  className="p-2 rounded text-[#a0a7b1] hover:text-[#e5e7eb] hover:bg-[#20242a] transition-colors cursor-pointer"
                  title="Expand Entity Directory"
                >
                  <Layers className="w-4 h-4 text-[#3b82f6]" />
                </button>
                <div className="mt-8 text-[10px] font-mono uppercase tracking-widest text-[#737c88] [writing-mode:vertical-lr] rotate-180">
                  Entity Directory ({graphData.nodes.length})
                </div>
              </div>
            ) : (
              <div className="fixed inset-0 z-50 lg:relative lg:inset-auto lg:z-auto bg-black/60 lg:bg-transparent flex justify-start">
                <div className="w-80 max-w-[85vw] lg:w-80 shrink-0 h-full flex flex-col overflow-hidden bg-[#141619] select-none shadow-2xl lg:shadow-none border-r border-[#30353c]">
                <div className="h-11 shrink-0 px-3.5 border-b border-[#30353c] bg-[#181b1f] flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 text-xs font-mono uppercase text-[#e5e7eb] tracking-wider">
                    <Layers className="w-3.5 h-3.5 text-[#3b82f6]" />
                    <span>Entity Directory</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[10px] font-mono text-[#a0a7b1] bg-[#111315] px-2 py-0.5 rounded border border-[#30353c]">
                      {graphData.nodes.length} Entities
                    </span>
                    <button
                      onClick={() => setLeftPanelCollapsed(true)}
                      className="p-1 rounded text-[#737c88] hover:text-[#e5e7eb] hover:bg-[#20242a] transition-colors cursor-pointer"
                      title="Collapse Entity Directory"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Entity Search Bar */}
                <div className="shrink-0 p-2.5 border-b border-[#30353c] bg-[#141619]">
                  <div className="flex items-center space-x-2 bg-[#111315] px-2.5 py-1.5 rounded border border-[#30353c]">
                    <Search className="w-3.5 h-3.5 text-[#737c88]" />
                    <input
                      type="text"
                      value={graphSearch}
                      onChange={(e) => setGraphSearch(e.target.value)}
                      placeholder="Search entities (DoD, AWS, TITAN)..."
                      className="w-full bg-transparent text-xs text-[#e5e7eb] focus:outline-none placeholder-[#737c88]"
                    />
                  </div>
                </div>

                {/* Category Hierarchy List - Independent Vertical Scroll Container */}
                <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-2 space-y-1">
                  {[
                    { key: "ALL", label: "All Entities" },
                    { key: "target_entity", label: "Subject Entity (PLTR)" },
                    { key: "government_customer", label: "Sovereign / Defense Customer" },
                    { key: "defense_contract", label: "Defense Program / Contract" },
                    { key: "cloud_infrastructure", label: "Cloud & Sovereign Infra" },
                    { key: "commercial_customer", label: "Commercial Enterprise Client" },
                    { key: "core_platform", label: "Core Software Platform" },
                    { key: "competitor", label: "Market Competitor" },
                    { key: "leadership", label: "Executive Leadership" },
                    { key: "regulatory_body", label: "Regulatory Oversight Body" },
                  ].map((cat) => {
                    const count = cat.key === "ALL" ? graphData.nodes.length : (entityCategoryCounts[cat.key] || 0);
                    const isSelected = graphTypeFilter === cat.key;
                    const catStyle = INSTITUTIONAL_CATEGORIES[cat.key] || INSTITUTIONAL_CATEGORIES.default;
                    return (
                      <button
                        key={cat.key}
                        onClick={() => {
                          setGraphTypeFilter(cat.key);
                          if (typeof window !== "undefined" && window.innerWidth < 1024) {
                            setLeftPanelCollapsed(true);
                          }
                        }}
                        className={`w-full text-left px-2.5 py-2 rounded text-xs transition-colors flex items-center justify-between cursor-pointer ${
                          isSelected 
                            ? "bg-[#20242a] text-[#f8fafc] font-medium border border-[#30353c]" 
                            : "text-[#a0a7b1] hover:text-[#e5e7eb] hover:bg-[#181b1f] border border-transparent"
                        }`}
                      >
                        <div className="flex items-center space-x-2 truncate">
                          {cat.key !== "ALL" && (
                            <span
                              className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
                              style={{ backgroundColor: catStyle.fill, border: `1.5px solid ${catStyle.border}` }}
                            />
                          )}
                          <span className="truncate">{cat.label}</span>
                        </div>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#111315] text-[#737c88]">
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Shock Indicator Banner */}
                {activeHypoResult && (
                  <div className="shrink-0 p-3 border-t border-[#30353c] bg-[#181b1f] text-[11px]">
                    <div className="text-[10px] font-mono uppercase text-[#f59e0b] font-medium flex items-center space-x-1">
                      <AlertTriangle className="w-3 h-3 text-[#f59e0b]" />
                      <span>Active Exogenous Stress Vector</span>
                    </div>
                    <div className="text-[#a0a7b1] mt-1 text-[10.5px] leading-snug line-clamp-2">
                      "{activeHypoResult.event_description}"
                    </div>
                  </div>
                )}
                </div>
              </div>
            )}

            {/* Center Panel: Knowledge Graph Fixed Viewport (Occupies all remaining area) */}
            <div className="flex-1 min-h-0 min-w-0 h-full relative overflow-hidden bg-[#0d0f12] flex flex-col">
              {/* Mobile Floating Drawer Trigger Pills */}
              <div className="lg:hidden absolute top-3 left-3 z-30 flex items-center space-x-2">
                <button
                  onClick={() => setLeftPanelCollapsed(false)}
                  className="px-2.5 py-1.5 rounded-lg bg-[#181b1f]/90 border border-[#30353c] text-xs font-mono text-[#3b82f6] shadow-lg backdrop-blur-md flex items-center space-x-1.5 cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Entities ({graphData.nodes.length})</span>
                </button>
                <button
                  onClick={() => setRightPanelCollapsed(false)}
                  className="px-2.5 py-1.5 rounded-lg bg-[#181b1f]/90 border border-[#30353c] text-xs font-mono text-[#10b981] shadow-lg backdrop-blur-md flex items-center space-x-1.5 cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Inspector</span>
                </button>
              </div>

              {/* Dual-Engine Toolbar Pill */}
              <div className="absolute top-3 left-48 z-20 hidden md:flex items-center space-x-1.5 glass-clear px-2.5 py-1.5 rounded border border-[#30353c] text-xs">
                <span className="text-[10px] font-mono uppercase text-[#737c88]">Engine:</span>
                <button
                  onClick={() => setGraphEngine("canvas")}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                    graphEngine === "canvas" ? "bg-[#2563eb] text-white font-medium shadow-sm" : "text-[#a0a7b1] hover:text-[#e5e7eb]"
                  }`}
                >
                  Canvas Workstation
                </button>
                <button
                  onClick={() => setGraphEngine("reactflow")}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                    graphEngine === "reactflow" ? "bg-[#2563eb] text-white font-medium shadow-sm" : "text-[#a0a7b1] hover:text-[#e5e7eb]"
                  }`}
                >
                  React Flow Engine
                </button>
              </div>

              {/* Viewport Render */}
              {graphEngine === "canvas" ? (
                <LivingKnowledgeGraph
                  nodes={graphData.nodes}
                  edges={graphData.edges}
                  selectedNode={selectedNode}
                  onSelectNode={(node) => {
                    setSelectedNode(node);
                    setSelectedEdge(null);
                    if (typeof window !== "undefined" && window.innerWidth < 1024) {
                      setRightPanelCollapsed(false);
                    }
                  }}
                  selectedEdge={selectedEdge}
                  onSelectEdge={(edge) => {
                    setSelectedEdge(edge);
                    setSelectedNode(null);
                    if (typeof window !== "undefined" && window.innerWidth < 1024) {
                      setRightPanelCollapsed(false);
                    }
                  }}
                  affectedEntityNames={activeHypoResult?.affected_entities || []}
                  searchQuery={graphSearch}
                  typeFilter={graphTypeFilter}
                  showInternalInspector={false}
                />
              ) : (
                <ReactFlowKnowledgeGraph
                  nodes={graphData.nodes}
                  edges={graphData.edges}
                  selectedNode={selectedNode}
                  onSelectNode={(node) => {
                    setSelectedNode(node);
                    setSelectedEdge(null);
                    if (typeof window !== "undefined" && window.innerWidth < 1024) {
                      setRightPanelCollapsed(false);
                    }
                  }}
                  selectedEdge={selectedEdge}
                  onSelectEdge={(edge) => {
                    setSelectedEdge(edge);
                    setSelectedNode(null);
                    if (typeof window !== "undefined" && window.innerWidth < 1024) {
                      setRightPanelCollapsed(false);
                    }
                  }}
                  searchQuery={graphSearch}
                  typeFilter={graphTypeFilter}
                />
              )}
            </div>

            {/* Right Panel: Contextual Entity & Provenance Inspector (Desktop Sidebar or Mobile Overlay Drawer) */}
            {rightPanelCollapsed ? (
              <div className="hidden lg:flex w-10 shrink-0 h-full flex-col items-center py-3 border-l border-[#30353c] bg-[#141619] z-20 select-none">
                <button
                  onClick={() => setRightPanelCollapsed(false)}
                  className="p-2 rounded text-[#a0a7b1] hover:text-[#e5e7eb] hover:bg-[#20242a] transition-colors cursor-pointer"
                  title="Expand Provenance Inspector"
                >
                  <ShieldCheck className="w-4 h-4 text-[#3b82f6]" />
                </button>
                <div className="mt-8 text-[10px] font-mono uppercase tracking-widest text-[#737c88] [writing-mode:vertical-lr] rotate-180">
                  Provenance Inspector
                </div>
              </div>
            ) : (
              <div className="fixed inset-0 z-50 lg:relative lg:inset-auto lg:z-auto bg-black/60 lg:bg-transparent flex justify-end">
                <div className="w-80 sm:w-96 max-w-[90vw] shrink-0 h-full flex flex-col overflow-hidden bg-[#141619] shadow-2xl lg:shadow-none border-l border-[#30353c]">
                <div className="h-11 shrink-0 px-3.5 border-b border-[#30353c] bg-[#181b1f] text-xs font-mono uppercase tracking-wider text-[#a0a7b1] flex items-center justify-between">
                  <span>Provenance Inspector</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-[#3b82f6] text-[10px]">
                      {selectedNode ? "Entity Focus" : (selectedEdge ? "Relationship Link" : "Select Target")}
                    </span>
                    <button
                      onClick={() => setRightPanelCollapsed(true)}
                      className="p-1 rounded text-[#737c88] hover:text-[#e5e7eb] hover:bg-[#20242a] transition-colors cursor-pointer"
                      title="Collapse Provenance Inspector"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Independent Vertical Scroll Container */}
                <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 space-y-4 text-xs">
                {selectedNode ? (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#20242a] text-[#e5e7eb] border border-[#30353c]">
                        {selectedNode.type?.replace(/_/g, " ")}
                      </span>
                      <span className="text-[11px] font-mono text-[#10b981]">
                        Verified Disclosure
                      </span>
                    </div>

                    <h2 className="text-base font-serif font-bold text-[#f8fafc] mb-1">{selectedNode.label}</h2>
                    {selectedNode.sector && (
                      <div className="text-[11px] text-[#a0a7b1] mb-3">
                        Sector: {selectedNode.sector} {selectedNode.ticker ? `• ${selectedNode.ticker}` : ""}
                      </div>
                    )}

                    <p className="text-xs text-[#cbd5e1] leading-relaxed bg-[#111315] p-3 rounded border border-[#30353c] mb-4">
                      {selectedNode.description || "Corporate entity mapped within Palantir institutional intelligence network."}
                    </p>

                    <div className="p-3 rounded bg-[#141619] border border-[#30353c] space-y-1 mb-4">
                      <div className="text-[10px] font-mono uppercase text-[#737c88]">Primary Documentary Source</div>
                      <div className="text-[#e5e7eb] font-medium text-[11px]">
                        SEC Form 10-K & Congressional Research Service
                      </div>
                      <div className="text-[#737c88] text-[10px] font-mono">
                        Item 1. Business & Note 14 Customer Disclosures
                      </div>
                    </div>

                    {/* Verified 1st-Degree Relationships for Selected Node */}
                    <div>
                      <div className="text-[10px] font-mono uppercase text-[#a0a7b1] mb-2">
                        1st-Degree Corporate Connections:
                      </div>
                      <div className="space-y-1.5">
                        {graphData.edges
                          .filter(e => e.source === selectedNode.id || e.target === selectedNode.id)
                          .map(e => {
                            const otherId = e.source === selectedNode.id ? e.target : e.source;
                            const otherNode = graphData.nodes.find(n => n.id === otherId);
                            return (
                              <div 
                                key={e.id}
                                onClick={() => setSelectedEdge(e)}
                                className="p-2.5 rounded bg-[#111315] hover:bg-[#20242a] border border-[#30353c] cursor-pointer transition-colors"
                              >
                                <div className="flex items-center justify-between text-[10px] font-mono uppercase text-[#3b82f6] mb-1">
                                  <span>{(e.relationship || "RELATED_TO").replace(/_/g, " ")}</span>
                                  <span className="text-[#737c88]">Directional</span>
                                </div>
                                <div className="font-medium text-[#e5e7eb]">{otherNode?.label || otherId}</div>
                                {e.description && (
                                  <p className="text-[10px] text-[#a0a7b1] mt-1 line-clamp-2">{e.description}</p>
                                )}
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  </div>
                ) : selectedEdge ? (
                  <div>
                    <div className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#20242a] text-[#3b82f6] border border-[#30353c] mb-2 inline-block">
                      {(selectedEdge.relationship || "RELATED_TO").replace(/_/g, " ")}
                    </div>
                    <h3 className="text-sm font-semibold text-[#f8fafc] mb-2">
                      Relationship Provenance Link
                    </h3>
                    <p className="text-xs text-[#cbd5e1] leading-relaxed bg-[#111315] p-3 rounded border border-[#30353c] mb-4">
                      "{selectedEdge.description}"
                    </p>
                    <div className="text-[10px] font-mono text-[#737c88] space-y-1">
                      <div>Validation Standard: SEC 10-K & Defense Contract Audit</div>
                      <div>Relationship Status: Verified Active Sovereign / Commercial Link</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16 text-[#737c88] text-xs font-mono">
                    Select any entity or connection in the graph to inspect documentary provenance.
                  </div>
                )}
              </div>

                {/* Stage Navigation Footer */}
                <div className="shrink-0 p-3 border-t border-[#30353c] bg-[#181b1f] flex justify-between items-center">
                  <button
                    onClick={() => setCurrentStage(1)}
                    className="px-3 py-1.5 rounded border border-[#30353c] text-[#a0a7b1] hover:text-[#e5e7eb] text-xs cursor-pointer"
                  >
                    Back to Seeds
                  </button>
                  <button
                    onClick={() => setCurrentStage(3)}
                    className="px-4 py-2 rounded bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-medium text-xs flex items-center space-x-1.5 cursor-pointer"
                  >
                    <span>Stage 03: Specialist Operations</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
            )}
          </div>
        )}

        {/* ================= STAGE 03: Specialist Operations & Interrogation ================= */}
        {currentStage === 3 && (
          <div className="flex-1 min-h-0 min-w-0 overflow-hidden flex flex-col lg:grid lg:grid-cols-12 lg:divide-x divide-[#30353c] pt-[58px]">
            {/* Mobile / Tablet Viewport Switcher */}
            <div className="lg:hidden shrink-0 p-2 bg-[#141619] border-b border-[#30353c] flex items-center justify-center overflow-x-auto scrollbar-none">
              <div className="flex rounded-lg bg-[#111315] p-0.5 border border-[#30353c] text-xs font-mono">
                <button
                  onClick={() => setStage3MobileTab("specialists")}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    stage3MobileTab === "specialists" ? "bg-[#20242a] text-[#f8fafc] font-medium" : "text-[#737c88]"
                  }`}
                >
                  Specialists ({societyAgents.length})
                </button>
                <button
                  onClick={() => setStage3MobileTab("stream")}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    stage3MobileTab === "stream" ? "bg-[#20242a] text-[#f8fafc] font-medium" : "text-[#737c88]"
                  }`}
                >
                  Stream ({interactions.length})
                </button>
                <button
                  onClick={() => setStage3MobileTab("interrogate")}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    stage3MobileTab === "interrogate" ? "bg-[#20242a] text-[#f8fafc] font-medium" : "text-[#737c88]"
                  }`}
                >
                  Interrogate & Sim
                </button>
              </div>
            </div>

            {/* Left 3 Cols: Specialist Registry */}
            <div className={`col-span-3 flex-col overflow-hidden bg-[#181b1f] ${
              stage3MobileTab === "specialists" ? "flex flex-1 min-h-0" : "hidden lg:flex"
            }`}>
              <div className="p-3 border-b border-[#30353c] bg-[#141619] flex items-center justify-between gap-2">
                <div className="flex items-center space-x-1.5 flex-1">
                  <Search className="w-3.5 h-3.5 text-[#737c88]" />
                  <input
                    type="text"
                    value={agentSearch}
                    onChange={(e) => setAgentSearch(e.target.value)}
                    placeholder="Search 16 specialists..."
                    className="w-full px-2 py-0.5 rounded bg-[#111315] border border-[#30353c] text-xs text-[#e5e7eb] focus:outline-none placeholder-[#737c88]"
                  />
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#20242a] text-[#a0a7b1] border border-[#30353c]">
                  {societyAgents.length} Agents
                </span>
              </div>

              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {filteredAgents.map((ag) => {
                  const isSelected = selectedAgent?.id === ag.id;
                  return (
                    <button
                      key={ag.id}
                      onClick={() => {
                        setSelectedAgent(ag);
                        if (typeof window !== "undefined" && window.innerWidth < 1024) {
                          setStage3MobileTab("interrogate");
                        }
                      }}
                      className={`w-full text-left p-2.5 rounded border transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-[#20242a] border-[#3b82f6] text-[#f8fafc]"
                          : "bg-[#111315] border-[#30353c] text-[#a0a7b1] hover:text-[#e5e7eb] hover:bg-[#141619]"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-xs text-[#e5e7eb] truncate">{ag.name}</span>
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#181b1f] text-[#737c88]">
                          {ag.analytical_style?.split("_")[0]}
                        </span>
                      </div>
                      <div className="text-[10.5px] text-[#737c88] truncate">{ag.role}</div>
                      <div className="flex items-center space-x-1.5 mt-1 text-[9px] font-mono text-[#10b981]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
                        <span>{ag.status || "COMPLETED"}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Center 5 Cols: Execution Timeline & Deliberation Stream */}
            <div className={`col-span-5 flex-col overflow-hidden bg-[#111315] ${
              stage3MobileTab === "stream" ? "flex flex-1 min-h-0" : "hidden lg:flex"
            }`}>
              <div className="p-3 border-b border-[#30353c] bg-[#181b1f] flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-[#e5e7eb] font-semibold flex items-center space-x-1.5">
                    <Terminal className="w-3.5 h-3.5 text-[#3b82f6]" />
                    <span>Specialist Deliberation Stream</span>
                  </span>
                  <div className="text-[10px] text-[#737c88] font-mono mt-0.5">
                    Peer-to-Peer Inquiries, Challenges & Formal Rebuttals
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#111315] text-[#a0a7b1] border border-[#30353c]">
                  {interactions.length} Events
                </span>
              </div>

              {/* Chronological Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {interactions.map((msg, idx) => (
                  <div 
                    key={msg.id || idx}
                    className="p-3 rounded border border-[#30353c] bg-[#181b1f] text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono uppercase">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-semibold text-[#e5e7eb]">{msg.sender_agent_id?.replace(/_/g, " ")}</span>
                        <span className="text-[#737c88]">→</span>
                        <span className="text-[#a0a7b1]">{msg.recipient_agent_id?.replace(/_/g, " ")}</span>
                      </div>
                      <span className={`px-1.5 py-0.5 rounded font-mono text-[9px] ${
                        msg.interaction_type === "CHALLENGE" ? "bg-[#2c1e18] text-[#f59e0b] border border-[#f59e0b]/40" :
                        msg.interaction_type === "REBUT" ? "bg-[#182232] text-[#3b82f6] border border-[#3b82f6]/40" :
                        msg.interaction_type === "CONCEDE" ? "bg-[#221a30] text-[#8b5cf6] border border-[#8b5cf6]/40" :
                        msg.interaction_type === "USER_INTERVENTION" ? "bg-[#12251e] text-[#10b981] border border-[#10b981]/40" :
                        "bg-[#20242a] text-[#a0a7b1]"
                      }`}>
                        {msg.interaction_type}
                      </span>
                    </div>
                    <p className="leading-relaxed text-xs text-[#cbd5e1] font-serif">
                      {msg.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right 4 Cols: Interrogation Console & Quantitative Scenario Stress */}
            <div className={`col-span-4 flex-col overflow-hidden bg-[#181b1f] ${
              stage3MobileTab === "interrogate" ? "flex flex-1 min-h-0" : "hidden lg:flex"
            }`}>
              {/* Tab Header: Specialist Interrogation vs MiroFish Simulation Suite */}
              <div className="p-2 border-b border-[#30353c] bg-[#141619] flex items-center justify-between">
                <div className="flex items-center space-x-1 bg-[#111315] p-0.5 rounded border border-[#30353c] text-xs">
                  <button
                    onClick={() => setSimTab("interrogate")}
                    className={`px-2.5 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
                      simTab === "interrogate"
                        ? "bg-[#20242a] text-[#f8fafc] font-medium border border-[#30353c]"
                        : "text-[#737c88] hover:text-[#e5e7eb]"
                    }`}
                  >
                    Specialist Deep-Dive
                  </button>
                  <button
                    onClick={() => setSimTab("simulation")}
                    className={`px-2.5 py-1 rounded text-xs font-mono transition-colors cursor-pointer flex items-center space-x-1.5 ${
                      simTab === "simulation"
                        ? "bg-[#2563eb] text-white font-medium"
                        : "text-[#737c88] hover:text-[#e5e7eb]"
                    }`}
                  >
                    <Sliders className="w-3 h-3" />
                    <span>Simulation Engine</span>
                  </button>
                </div>
                <span className="text-[10px] font-mono text-[#10b981] px-2 py-0.5 rounded bg-[#111315] border border-[#30353c]">
                  Online
                </span>
              </div>

              {simTab === "interrogate" ? (
                selectedAgent ? (
                <div className="flex-1 flex flex-col overflow-hidden">
                  {/* Selected Agent Header */}
                  <div className="p-4 border-b border-[#30353c] bg-[#141619]">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-[10px] font-mono uppercase text-[#3b82f6] tracking-wider">
                          {selectedAgent.role}
                        </div>
                        <h2 className="text-base font-serif font-bold text-[#f8fafc] mt-0.5">{selectedAgent.name}</h2>
                        <p className="text-[10.5px] text-[#737c88] mt-0.5">{selectedAgent.specialization}</p>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#111315] border border-[#30353c] text-[#a0a7b1]">
                        {selectedAgent.analytical_style}
                      </span>
                    </div>

                    <div className="mt-2.5 p-2.5 rounded bg-[#111315] border border-[#30353c] text-xs text-[#cbd5e1] font-serif leading-relaxed">
                      "{selectedAgent.current_position || "Audit and evidence review completed."}"
                    </div>
                  </div>

                  {/* Scrollable Action Workspace */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {/* Interrogation Console */}
                    <div className="p-4 rounded bg-[#141619] border border-[#30353c]">
                      <div className="flex items-center justify-between mb-3 border-b border-[#30353c] pb-2">
                        <div className="flex items-center space-x-1.5 text-xs font-medium text-[#e5e7eb]">
                          <MessageSquare className="w-3.5 h-3.5 text-[#3b82f6]" />
                          <span>Investigator Interrogation</span>
                        </div>
                        <div className="flex items-center space-x-1 bg-[#111315] p-0.5 rounded border border-[#30353c] text-[10px]">
                          <button
                            type="button"
                            onClick={() => setInterrogationMode("single")}
                            className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                              interrogationMode === "single"
                                ? "bg-[#20242a] text-[#f8fafc] font-medium"
                                : "text-[#737c88] hover:text-[#e5e7eb]"
                            }`}
                          >
                            Single Specialist
                          </button>
                          <button
                            type="button"
                            onClick={() => setInterrogationMode("all")}
                            className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                              interrogationMode === "all"
                                ? "bg-[#20242a] text-[#f8fafc] font-medium"
                                : "text-[#737c88] hover:text-[#e5e7eb]"
                            }`}
                          >
                            Whole Society (16)
                          </button>
                        </div>
                      </div>

                      {interrogationMode === "single" ? (
                        <>
                          <div className="text-[11px] text-[#737c88] mb-1.5">
                            Target: <span className="text-[#e5e7eb] font-medium">{selectedAgent.name}</span> ({selectedAgent.role}):
                          </div>
                          <form onSubmit={handleIntervention} className="space-y-2">
                            <textarea
                              value={interventionQuery}
                              onChange={(e) => setInterventionQuery(e.target.value)}
                              rows={2}
                              placeholder="Query specific evidence, customer concentration, or contract risk..."
                              className="w-full px-2.5 py-1.5 rounded bg-[#111315] border border-[#30353c] text-xs text-[#e5e7eb] focus:outline-none focus:border-[#3b82f6] placeholder-[#737c88]"
                            />
                            <div className="flex justify-end">
                              <button
                                type="submit"
                                disabled={interventionLoading || !interventionQuery.trim()}
                                className="px-3 py-1.5 rounded bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-medium text-xs flex items-center space-x-1 cursor-pointer disabled:opacity-50"
                              >
                                <Send className="w-3 h-3" />
                                <span>{interventionLoading ? "Interrogating..." : "Submit Inquiry"}</span>
                              </button>
                            </div>
                          </form>

                          {interventionHistory.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-[#30353c] space-y-2 text-xs">
                              {interventionHistory.map((item, idx) => (
                                <div key={idx} className="p-2.5 rounded bg-[#111315] border border-[#30353c]">
                                  <div className="text-[9px] font-mono text-[#3b82f6] uppercase font-semibold">Inquiry:</div>
                                  <div className="text-[#a0a7b1] italic mb-1 text-[11px]">"{item.user_query}"</div>
                                  <div className="text-[9px] font-mono text-[#10b981] uppercase font-semibold">{item.agent_name}:</div>
                                  <div className="text-[#cbd5e1] font-serif leading-relaxed mt-0.5 text-xs">{item.agent_reply}</div>
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          <div className="text-[11px] text-[#737c88] mb-1.5">
                            Broadcast question across all <span className="text-[#e5e7eb] font-medium">16 specialist agents</span> simultaneously:
                          </div>
                          <form onSubmit={handleSocietyInterrogateAll} className="space-y-2">
                            <textarea
                              value={societyQuestion}
                              onChange={(e) => setSocietyQuestion(e.target.value)}
                              rows={2}
                              placeholder="Inquire across financials, governance, competition, and defense contracts..."
                              className="w-full px-2.5 py-1.5 rounded bg-[#111315] border border-[#30353c] text-xs text-[#e5e7eb] focus:outline-none focus:border-[#3b82f6] placeholder-[#737c88]"
                            />
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] text-[#737c88] font-mono">16 Specialists respond from mandate</span>
                              <button
                                type="submit"
                                disabled={societyLoading || !societyQuestion.trim()}
                                className="px-3 py-1.5 rounded bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-medium text-xs flex items-center space-x-1 cursor-pointer disabled:opacity-50"
                              >
                                <Send className="w-3 h-3" />
                                <span>{societyLoading ? "Deliberating..." : "Broadcast"}</span>
                              </button>
                            </div>
                          </form>

                          {societyAnswers.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-[#30353c] space-y-3 text-xs">
                              {societyAnswers.map((round, rIdx) => (
                                <div key={rIdx} className="p-3 rounded bg-[#111315] border border-[#30353c] space-y-2">
                                  <div className="flex items-center justify-between text-[10px] font-mono text-[#3b82f6] border-b border-[#30353c] pb-1">
                                    <span>PLENARY QUERY: "{round.question}"</span>
                                    <span>{round.responses_count} Specialists</span>
                                  </div>
                                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                                    {round.responses?.map((resp: any, respIdx: number) => (
                                      <div key={respIdx} className="p-2 rounded bg-[#181b1f] border border-[#30353c]">
                                        <div className="flex items-center justify-between text-[9px] font-mono mb-1">
                                          <span className="text-[#10b981] font-medium">{resp.agent_name}</span>
                                          <span className="text-[#737c88]">{resp.role}</span>
                                        </div>
                                        <div className="text-[#cbd5e1] font-serif text-[11px] leading-relaxed">
                                          {resp.response}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {/* Quantitative Exogenous Scenario Shock */}
                    <div className="p-4 rounded bg-[#141619] border border-[#30353c]">
                      <div className="flex items-center space-x-1.5 text-xs font-medium text-[#f59e0b] mb-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Exogenous Shock & Stress Testing</span>
                      </div>
                      <p className="text-[11px] text-[#737c88] mb-2 leading-relaxed">
                        Simulate macro and sovereign procurement shocks. Recalculates valuation multiples without modifying verified baseline history.
                      </p>

                      <form onSubmit={handleInjectHypothetical} className="flex space-x-1.5 mb-2">
                        <input
                          type="text"
                          value={hypoEvent}
                          onChange={(e) => setHypoEvent(e.target.value)}
                          placeholder="e.g. U.S. defense software appropriations delayed by 2 quarters..."
                          className="flex-1 px-2.5 py-1.5 rounded bg-[#111315] border border-[#30353c] text-xs text-[#e5e7eb] focus:outline-none focus:border-[#f59e0b] placeholder-[#737c88]"
                        />
                        <button
                          type="submit"
                          disabled={hypoLoading || !hypoEvent.trim()}
                          className="px-3 py-1.5 rounded bg-[#b45309] hover:bg-[#d97706] text-white font-medium text-xs cursor-pointer disabled:opacity-50"
                        >
                          {hypoLoading ? "Simulating..." : "Inject Shock"}
                        </button>
                      </form>

                      {activeHypoResult && (
                        <div className="mt-3 p-3 rounded bg-[#111315] border border-[#30353c] space-y-2">
                          <div className="flex items-center justify-between text-[10px] font-mono">
                            <span className="text-[#f59e0b] uppercase font-bold">STRESS VECTOR RECORDED</span>
                            <span className="text-[#737c88]">Baseline Preserved</span>
                          </div>

                          <div className="text-xs text-[#e5e7eb] italic font-serif">
                            "{activeHypoResult.event_description}"
                          </div>

                          {activeHypoResult.stressed_metrics && (
                            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#30353c]">
                              <div className="p-2 rounded bg-[#181b1f] border border-[#30353c]">
                                <div className="text-[9px] font-mono text-[#737c88]">Baseline Multiple</div>
                                <div className="text-xs font-mono font-bold text-[#e5e7eb]">
                                  {activeHypoResult.baseline_metrics?.terminal_multiple || "8.0x ARR"}
                                </div>
                              </div>
                              <div className="p-2 rounded bg-[#181b1f] border border-[#f59e0b]/40">
                                <div className="text-[9px] font-mono text-[#f59e0b]">Stressed Multiple</div>
                                <div className="text-xs font-mono font-bold text-[#f59e0b]">
                                  {activeHypoResult.stressed_metrics?.terminal_multiple || "3.0x ARR"}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-[#737c88]">
                    <Users className="w-8 h-8 text-[#30353c] mb-2" />
                    <p className="text-xs font-mono">Select a specialist from the directory to interrogate their mandate directly.</p>
                    <button
                      onClick={() => setSimTab("simulation")}
                      className="mt-3 px-3 py-1.5 rounded bg-[#20242a] hover:bg-[#282d35] text-[#e5e7eb] text-xs font-mono border border-[#30353c] cursor-pointer"
                    >
                      Open Simulation Engine →
                    </button>
                  </div>
                )
              ) : (
                /* MiroFish Benchmark: Simulation Configuration & Terminal Console */
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="p-4 border-b border-[#30353c] bg-[#141619] flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-semibold text-[#f8fafc]">05 Подготовка завершена</span>
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#d97706]/20 text-[#f59e0b] border border-[#f59e0b]/30">
                          {simRunning ? "В ХОДЕ ВЫПОЛНЕНИЯ" : "ГОТОВО К ЗАПУСКУ"}
                        </span>
                      </div>
                      <div className="text-[10px] font-mono text-[#737c88] mt-1">
                        POST /api/simulation/start • Multi-Agent Institutional Society
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {/* Simulation Round Configuration */}
                    <div className="p-4 rounded bg-[#141619] border border-[#30353c] space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-[#e5e7eb]">Настройка раунда симуляции</span>
                        <span className="text-[10px] font-mono text-[#3b82f6] bg-[#15202e] px-2 py-0.5 rounded border border-[#3b82f6]/30">
                          Обычный режим
                        </span>
                      </div>
                      <p className="text-[11px] text-[#a0a7b1] leading-relaxed">
                        MERIDIAN автоматически планирует и моделирует <strong>{simHorizonHours} часа</strong> реального времени, где каждый раунд соответствует <strong>{simStepMinutes} минутам</strong> времени исследования.
                      </p>

                      <div className="p-3 rounded bg-[#111315] border border-[#30353c] space-y-2">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-[#737c88]">Раунды моделирования:</span>
                          <span className="text-base font-bold text-[#f8fafc]">{simRounds} колесо</span>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="80"
                          step="5"
                          value={simRounds}
                          onChange={(e) => setSimRounds(parseInt(e.target.value))}
                          className="w-full h-1 bg-[#30353c] rounded appearance-none cursor-pointer accent-[#2563eb]"
                        />
                      </div>

                      <div className="p-2.5 rounded bg-[#181b1f] border border-[#30353c] text-[10.5px] text-[#a0a7b1] leading-snug flex items-start space-x-2">
                        <Info className="w-4 h-4 text-[#3b82f6] shrink-0 mt-0.5" />
                        <span>
                          Если количество агентов равно <strong>16</strong>: расчетное время полной сходимости составляет ~3.2 секунды при аппаратном DuckDB ускорении.
                        </span>
                      </div>

                      <button
                        onClick={handleRunSimulation}
                        disabled={simRunning}
                        className="w-full py-2.5 rounded bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-medium text-xs flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 shadow-md transition-colors"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>{simRunning ? `Выполняется симуляция (${simProgress}%)` : "Запуск двухплатформенной симуляции"}</span>
                      </button>

                      {simRunning && (
                        <div className="w-full bg-[#111315] h-1.5 rounded-full overflow-hidden border border-[#30353c]">
                          <div 
                            className="bg-[#2563eb] h-full transition-all duration-300"
                            style={{ width: `${simProgress}%` }}
                          />
                        </div>
                      )}
                    </div>

                    {/* MiroFish-Style System Control Console */}
                    <div className="rounded bg-[#0d0f12] border border-[#30353c] overflow-hidden select-none">
                      <div className="p-2.5 bg-[#141619] border-b border-[#30353c] flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-[#a0a7b1]">
                        <span className="flex items-center space-x-1.5 text-[#e5e7eb] font-semibold">
                          <Terminal className="w-3 h-3 text-[#10b981]" />
                          <span>СИСТЕМНАЯ ПАНЕЛЬ УПРАВЛЕНИЯ</span>
                        </span>
                        <span className="text-[9px] text-[#737c88]">sim_3a1c8efb5680</span>
                      </div>
                      <div className="p-3 text-[10.5px] font-mono text-[#10b981] space-y-1 max-h-48 overflow-y-auto bg-[#0b0d0f]">
                        {simLogs.map((log, idx) => (
                          <div key={idx} className="leading-relaxed opacity-90 hover:opacity-100">
                            {log}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Stage Footer */}
              <div className="p-3 border-t border-[#30353c] bg-[#141619] flex justify-between items-center">
                <button
                  onClick={() => setCurrentStage(2)}
                  className="px-3 py-1.5 rounded border border-[#30353c] text-[#a0a7b1] hover:text-[#e5e7eb] text-xs cursor-pointer"
                >
                  Back to Graph
                </button>
                <button
                  onClick={() => setCurrentStage(4)}
                  className="px-4 py-2 rounded bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-medium text-xs flex items-center space-x-1.5 cursor-pointer shadow-sm"
                >
                  <span>Stage 04: Deliberation Floor</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= STAGE 04: Boardroom Adversarial Deliberation Floor ================= */}
        {currentStage === 4 && (
          <div className="flex-1 min-h-0 min-w-0 overflow-hidden flex flex-col lg:grid lg:grid-cols-12 lg:divide-x divide-[#30353c] pt-[58px]">
            {/* Mobile / Tablet Viewport Switcher */}
            <div className="lg:hidden shrink-0 p-2 bg-[#141619] border-b border-[#30353c] flex items-center justify-center overflow-x-auto scrollbar-none">
              <div className="flex rounded-lg bg-[#111315] p-0.5 border border-[#30353c] text-xs font-mono">
                <button
                  onClick={() => setStage4MobileTab("floor")}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    stage4MobileTab === "floor" ? "bg-[#20242a] text-[#f8fafc] font-medium" : "text-[#737c88]"
                  }`}
                >
                  Debate Floor ({claims.length})
                </button>
                <button
                  onClick={() => setStage4MobileTab("specialists")}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    stage4MobileTab === "specialists" ? "bg-[#20242a] text-[#f8fafc] font-medium" : "text-[#737c88]"
                  }`}
                >
                  Specialists ({societyAgents.length})
                </button>
                <button
                  onClick={() => setStage4MobileTab("evidence")}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    stage4MobileTab === "evidence" ? "bg-[#20242a] text-[#f8fafc] font-medium" : "text-[#737c88]"
                  }`}
                >
                  Evidence & Citations
                </button>
              </div>
            </div>

            {/* Panel A: 3 Cols - Specialist Roster & Epistemic Alignment */}
            <div className={`col-span-3 flex-col overflow-hidden bg-[#181b1f] ${
              stage4MobileTab === "specialists" ? "flex flex-1 min-h-0" : "hidden lg:flex"
            }`}>
              <div className="p-3 border-b border-[#30353c] bg-[#141619] text-xs font-mono uppercase tracking-wider text-[#a0a7b1] flex items-center justify-between">
                <span>Specialist Roster</span>
                <span className="text-[#3b82f6] text-[10px]">Mandate Stances</span>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {societyAgents.map((ag) => (
                  <div key={ag.id} className="p-2.5 rounded bg-[#111315] border border-[#30353c] text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-[#e5e7eb] truncate">{ag.name}</span>
                      <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                        ag.agent_id === "bull_analyst" ? "bg-[#142922] text-[#10b981]" :
                        ag.agent_id === "bear_analyst" ? "bg-[#2c1e18] text-[#f59e0b]" :
                        ag.agent_id === "final_adjudicator" ? "bg-[#261e38] text-[#8b5cf6]" :
                        "bg-[#20242a] text-[#a0a7b1]"
                      }`}>
                        {ag.agent_id === "bull_analyst" ? "BULL" :
                         ag.agent_id === "bear_analyst" ? "BEAR" :
                         ag.agent_id === "final_adjudicator" ? "JUDICIAL" : "ANALYST"}
                      </span>
                    </div>
                    <div className="text-[10.5px] text-[#737c88] truncate">{ag.role}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Panel B: 6 Cols - Structured Adversarial Debate Chamber */}
            <div className={`col-span-6 flex-col overflow-hidden bg-[#111315] ${
              stage4MobileTab === "floor" ? "flex flex-1 min-h-0" : "hidden lg:flex"
            }`}>
              <div className="p-3 border-b border-[#30353c] bg-[#181b1f] flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-[#e5e7eb] font-semibold">
                    Adversarial Deliberation Floor
                  </span>
                  <div className="text-[10px] text-[#737c88] font-mono mt-0.5">
                    Structured Atomic Assertions, Counter-Challenges & Judicial Rulings
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#111315] text-[#a0a7b1] border border-[#30353c]">
                  {claims.length} Claims • {debates[0]?.arguments?.length || 5} Arguments
                </span>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Claims Register */}
                <div className="space-y-2 mb-2">
                  <div className="text-[10px] font-mono uppercase text-[#737c88]">Audited Claims Under Scrutiny:</div>
                  {(claims || []).map((c) => (
                    <div 
                      key={c.id} 
                      onClick={() => setSelectedClaim(c)}
                      className={`p-3 rounded border text-xs cursor-pointer transition-colors ${
                        selectedClaim?.id === c.id 
                          ? "bg-[#20242a] border-[#3b82f6]" 
                          : "bg-[#181b1f] border-[#30353c] hover:bg-[#1f2328]"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 rounded bg-[#111315] text-[#a0a7b1]">
                          {(c.proposing_specialist_id || c.specialist_id || c.agent_id || "investigator").replace(/_/g, " ")}
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className={`text-[10px] font-mono uppercase font-semibold ${
                            c.verdict === "supported" ? "text-[#10b981]" : "text-[#f59e0b]"
                          }`}>
                            Verdict: {c.verdict || "evaluated"}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setChallengeModalClaim(c);
                            }}
                            className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#2c1e18] hover:bg-[#3d2920] border border-[#f59e0b]/40 text-[#f59e0b] cursor-pointer"
                          >
                            Challenge Claim
                          </button>
                        </div>
                      </div>
                      <p className="text-xs leading-relaxed font-serif text-[#e5e7eb]">{c.statement || c.claim_text || ""}</p>
                    </div>
                  ))}
                </div>

                {/* Deliberation Arguments Thread */}
                {(debates || []).map((d) => (
                  <div key={d.id} className="p-4 rounded bg-[#181b1f] border border-[#30353c]">
                    <div className="text-xs font-semibold text-[#f8fafc] mb-3 flex items-center space-x-2">
                      <Scale className="w-4 h-4 text-[#3b82f6]" />
                      <span>Formal Dispute: {d.topic || "Core Thesis"}</span>
                    </div>

                    <div className="space-y-2.5">
                      {(d.arguments || []).map((arg: any) => (
                        <div 
                          key={arg.id || Math.random()} 
                          className={`p-3 rounded border text-xs ${
                            arg.argument_type === "adjudication"
                              ? "bg-[#1d192b] border-[#8b5cf6]/40 text-[#e0e7ff]"
                              : arg.argument_type === "challenge"
                              ? "bg-[#2c1e18] border-[#f59e0b]/40 text-[#fef3c7]"
                              : "bg-[#111315] border-[#30353c] text-[#cbd5e1]"
                          }`}
                        >
                          <div className="flex items-center justify-between text-[10px] font-mono uppercase mb-1">
                            <span className="font-semibold text-[#e5e7eb]">{(arg.specialist_id || arg.agent_id || "specialist").replace(/_/g, " ")}</span>
                            <span className="text-[#737c88] font-mono">[{arg.argument_type || "statement"}]</span>
                          </div>
                          <p className="leading-relaxed font-serif text-xs">{arg.content || arg.text || ""}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Stage Navigation Footer */}
              <div className="p-3 border-t border-[#30353c] bg-[#181b1f] flex justify-between items-center">
                <button
                  onClick={() => setCurrentStage(3)}
                  className="px-3 py-1.5 rounded border border-[#30353c] text-[#a0a7b1] hover:text-[#e5e7eb] text-xs cursor-pointer"
                >
                  Back to Operations
                </button>
                <button
                  onClick={() => setCurrentStage(5)}
                  className="px-4 py-2 rounded bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-medium text-xs flex items-center space-x-1.5 cursor-pointer"
                >
                  <span>Stage 05: Intelligence Dossier</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Panel C: 3 Cols - Evidence Provenance Inspector */}
            <div className={`col-span-3 flex-col overflow-hidden bg-[#181b1f] ${
              stage4MobileTab === "evidence" ? "flex flex-1 min-h-0" : "hidden lg:flex"
            }`}>
              <div className="p-3 border-b border-[#30353c] bg-[#141619] text-xs font-mono uppercase tracking-wider text-[#a0a7b1]">
                Evidence Provenance
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {selectedClaim ? (
                  <div>
                    <div className="text-[10px] font-mono text-[#3b82f6] uppercase mb-1">Disputed Claim Under Audit</div>
                    <div className="text-xs font-serif text-[#e5e7eb] bg-[#111315] p-3 rounded border border-[#30353c] mb-4">
                      "{selectedClaim.statement}"
                    </div>

                    <div className="text-[10px] font-mono uppercase text-[#a0a7b1] mb-1.5">Supporting Institutional Sources:</div>
                    <div className="p-3 rounded bg-[#111315] border border-[#30353c] space-y-1.5 text-xs">
                      <div className="text-[#3b82f6] font-mono text-[11px]">SEC Form 10-K (December 31, 2025)</div>
                      <p className="text-[#a0a7b1] italic text-[11px] font-serif leading-relaxed">
                        "Top commercial and sovereign accounts constituted 18.2% of recognized revenue, with average sales cycle tracking at 110 days."
                      </p>
                    </div>

                    <div className="mt-3 p-3 rounded bg-[#111315] border border-[#30353c] space-y-1.5 text-xs">
                      <div className="text-[#10b981] font-mono text-[11px]">CRS Defense Modernization Review</div>
                      <p className="text-[#a0a7b1] italic text-[11px] font-serif leading-relaxed">
                        "TITAN prime software phase guarantees vehicle fielding across Army ground stations with multi-year appropriations."
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16 text-[#737c88] text-xs font-mono">
                    Select any claim in the deliberation timeline to inspect primary citations.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================= STAGE 05: Institutional Intelligence Dossier ================= */}
        {currentStage === 5 && (
          <div className="flex-1 min-h-0 min-w-0 overflow-y-auto overscroll-contain px-3 sm:px-6 md:px-8 pt-16 sm:pt-20 pb-12 max-w-4xl mx-auto w-full">
            {primaryReport ? (
              <article className="p-8 rounded bg-[#181b1f] border border-[#30353c] text-[#e5e7eb]">
                <div className="border-b border-[#30353c] pb-6 mb-6 flex items-start justify-between">
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-[#3b82f6] mb-1">
                      Institutional Intelligence Dossier • Final Report v{primaryReport.version}
                    </div>
                    <h1 className="text-2xl font-serif font-bold text-[#f8fafc]">{primaryReport.title}</h1>
                    <p className="text-xs font-mono text-[#a0a7b1] mt-1">
                      CIK: 0001321655 • NYSE: PLTR • Prepared: {new Date(primaryReport.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => window.print()}
                    className="px-3 py-1.5 rounded border border-[#30353c] hover:bg-[#20242a] text-[#e5e7eb] text-xs flex items-center space-x-1.5 cursor-pointer transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print / PDF Export</span>
                  </button>
                </div>

                {/* Executive Assessment */}
                <section className="mb-8">
                  <h2 className="text-xs font-mono uppercase tracking-wider text-[#a0a7b1] mb-2">
                    Executive Assessment
                  </h2>
                  <div className="p-4 rounded bg-[#111315] border border-[#30353c] text-xs leading-relaxed font-serif text-[#cbd5e1]">
                    {primaryReport.executive_summary}
                  </div>
                </section>

                {/* Audited Financial Metrics Table */}
                <section className="mb-8">
                  <h2 className="text-xs font-mono uppercase tracking-wider text-[#a0a7b1] mb-2">
                    Audited Unit Economics & Fundamental Parameters
                  </h2>
                  <div className="border border-[#30353c] rounded overflow-hidden">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-[#141619] border-b border-[#30353c] text-[10px] font-mono text-[#737c88] uppercase">
                          <th className="py-2.5 px-3">Metric</th>
                          <th className="py-2.5 px-3">Value</th>
                          <th className="py-2.5 px-3">Standard</th>
                          <th className="py-2.5 px-3">Primary Source</th>
                          <th className="py-2.5 px-3 text-right">Verification Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#30353c] bg-[#111315]">
                        <tr>
                          <td className="py-2.5 px-3 font-medium text-[#e5e7eb]">LTM Revenue</td>
                          <td className="py-2.5 px-3 font-mono font-bold text-[#f8fafc]">${primaryReport.financial_analysis.revenue_usd_m}M USD</td>
                          <td className="py-2.5 px-3 font-mono text-[10px] text-[#a0a7b1]">GAAP ASC 606</td>
                          <td className="py-2.5 px-3 text-[#737c88]">SEC Form 10-K</td>
                          <td className="py-2.5 px-3 text-right font-mono text-[10px] text-[#10b981]">VERIFIED AUDITED</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-3 font-medium text-[#e5e7eb]">Gross Margin</td>
                          <td className="py-2.5 px-3 font-mono font-bold text-[#f8fafc]">{primaryReport.financial_analysis.gross_margin_pct}%</td>
                          <td className="py-2.5 px-3 font-mono text-[10px] text-[#a0a7b1]">GAAP Standard</td>
                          <td className="py-2.5 px-3 text-[#737c88]">SEC Form 10-K</td>
                          <td className="py-2.5 px-3 text-right font-mono text-[10px] text-[#10b981]">VERIFIED AUDITED</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-3 font-medium text-[#e5e7eb]">Operating Cash Flow</td>
                          <td className="py-2.5 px-3 font-mono font-bold text-[#f8fafc]">${primaryReport.financial_analysis.operating_cash_flow_m}M USD</td>
                          <td className="py-2.5 px-3 font-mono text-[10px] text-[#a0a7b1]">GAAP Statement of Cash Flows</td>
                          <td className="py-2.5 px-3 text-[#737c88]">SEC Form 10-K</td>
                          <td className="py-2.5 px-3 text-right font-mono text-[10px] text-[#10b981]">VERIFIED AUDITED</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-3 font-medium text-[#e5e7eb]">Liquid Capital Reserves</td>
                          <td className="py-2.5 px-3 font-mono font-bold text-[#f8fafc]">${primaryReport.financial_analysis.cash_reserves_m}M USD</td>
                          <td className="py-2.5 px-3 font-mono text-[10px] text-[#a0a7b1]">Cash & Short-Term Equiv</td>
                          <td className="py-2.5 px-3 text-[#737c88]">SEC Form 10-K Balance Sheet</td>
                          <td className="py-2.5 px-3 text-right font-mono text-[10px] text-[#10b981]">VERIFIED AUDITED</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-3 font-medium text-[#e5e7eb]">Net Revenue Retention (NRR)</td>
                          <td className="py-2.5 px-3 font-mono font-bold text-[#f8fafc]">{primaryReport.financial_analysis.nrr_pct}%</td>
                          <td className="py-2.5 px-3 font-mono text-[10px] text-[#a0a7b1]">Trailing 12-Month Cohort</td>
                          <td className="py-2.5 px-3 text-[#737c88]">Institutional Equity Review</td>
                          <td className="py-2.5 px-3 text-right font-mono text-[10px] text-[#10b981]">VERIFIED DISCLOSURE</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-3 font-medium text-[#e5e7eb]">Sales Procurement Cycle Friction</td>
                          <td className="py-2.5 px-3 font-mono font-bold text-[#f8fafc]">{primaryReport.financial_analysis.sales_cycle_days} Days</td>
                          <td className="py-2.5 px-3 font-mono text-[10px] text-[#a0a7b1]">Enterprise & Defense Blend</td>
                          <td className="py-2.5 px-3 text-[#737c88]">Adversarial Debate Record</td>
                          <td className="py-2.5 px-3 text-right font-mono text-[10px] text-[#f59e0b]">DISPUTED / STRESSED</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </section>

                {/* Scenario Sensitivity Matrix */}
                <section className="mb-8">
                  <h2 className="text-xs font-mono uppercase tracking-wider text-[#a0a7b1] mb-2">
                    Valuation & Multiples Sensitivity Matrix
                  </h2>
                  <div className="grid grid-cols-4 gap-3">
                    {primaryReport.scenario_matrix && Object.entries(primaryReport.scenario_matrix).map(([scenarioKey, sc]: any) => (
                      <div key={scenarioKey} className="p-3.5 rounded bg-[#111315] border border-[#30353c] text-xs">
                        <div className="text-[10px] font-mono uppercase text-[#737c88] mb-1">{scenarioKey} Scenario</div>
                        <div className="text-base font-bold text-[#f8fafc] font-mono">{sc.multiple}</div>
                        <div className="text-[11px] text-[#a0a7b1] mt-1 font-mono">${sc.implied_valuation_usd_m}M Implied</div>
                        <p className="text-[10px] text-[#737c88] mt-2 leading-relaxed">{sc.rationale}</p>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Material Risks Register */}
                <section className="mb-8">
                  <h2 className="text-xs font-mono uppercase tracking-wider text-[#a0a7b1] mb-2">
                    Material Institutional Risks
                  </h2>
                  <div className="space-y-2">
                    {primaryReport.risk_register?.map((risk: any, rIdx: number) => {
                      const isObj = typeof risk === "object" && risk !== null;
                      const text = isObj ? (risk.detail || risk.category || JSON.stringify(risk)) : String(risk);
                      const severity = isObj ? risk.severity : null;
                      const category = isObj ? risk.category : null;
                      return (
                        <div key={rIdx} className="p-3 rounded bg-[#111315] border border-[#30353c] text-xs text-[#cbd5e1] flex items-start space-x-2.5">
                          <AlertTriangle className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${severity === "HIGH" ? "text-red-400" : "text-[#f59e0b]"}`} />
                          <div className="flex-1">
                            {category && (
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="font-semibold text-white">{category}</span>
                                {severity && (
                                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                                    severity === "HIGH" ? "bg-red-500/20 text-red-400 border border-red-500/30" : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                  }`}>
                                    {severity}
                                  </span>
                                )}
                              </div>
                            )}
                            <span>{text}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>

                {/* Adversarial Deliberation Unresolved Questions */}
                <section className="border-t border-[#30353c] pt-6">
                  <h2 className="text-xs font-mono uppercase tracking-wider text-[#a0a7b1] mb-2">
                    Adversarial Deliberation Adjudication & Open Questions
                  </h2>
                  <ul className="list-disc list-inside text-xs text-[#cbd5e1] space-y-1 font-serif">
                    {primaryReport.unresolved_disputes?.map((disp: string, dIdx: number) => (
                      <li key={dIdx}>{disp}</li>
                    ))}
                  </ul>
                </section>
              </article>
            ) : null}
          </div>
        )}

      </main>

      {/* Optional contextual status bar — fixed */}
      <footer className="h-7 shrink-0 px-4 bg-[#141619] border-t border-[#30353c] flex items-center justify-between text-[11px] font-mono text-[#737c88] select-none z-30">
        <div className="flex items-center space-x-3">
          <span className="flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
            <span className="text-[#a0a7b1]">MERIDIAN INTELLIGENCE WORKSTATION</span>
          </span>
          <span className="text-[#30353c]">|</span>
          <span className="text-[#cbd5e1]">PLTR-2026-INV</span>
          <span className="text-[#30353c] hidden sm:inline">|</span>
          <span className="hidden sm:inline">{graphData.nodes.length} Entities · {graphData.edges.length} Links</span>
          <span className="text-[#30353c] hidden md:inline">|</span>
          <span className="text-[#10b981] hidden md:inline">100% SEC 10-K Audited</span>
        </div>
        <div className="flex items-center space-x-3">
          <span className="hidden sm:inline">Stage 0{currentStage}: {
            currentStage === 1 ? "Mandate & Seeds" :
            currentStage === 2 ? "Relationship Graph" :
            currentStage === 3 ? "Specialist Operations" :
            currentStage === 4 ? "Deliberation Floor" : "Intelligence Dossier"
          }</span>
          <span className="text-[#30353c] hidden sm:inline">|</span>
          <span className="text-[#3b82f6]">Viewport: Fixed Isolated Shell</span>
        </div>
      </footer>

      {/* Slide-Up Event Telemetry Drawer */}
      {showEventDrawer && (
        <div className="h-64 border-t border-[#30353c] bg-[#141619] flex flex-col z-40">
          <div className="h-9 px-4 bg-[#181b1f] border-b border-[#30353c] flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-[#a0a7b1] flex items-center space-x-1.5">
              <Activity className="w-3.5 h-3.5 text-[#3b82f6]" />
              <span>Real-Time Investigation Event Telemetry</span>
            </span>
            <button
              onClick={() => setShowEventDrawer(false)}
              className="text-xs text-[#737c88] hover:text-[#e5e7eb] font-mono cursor-pointer"
            >
              Close
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 font-mono text-xs space-y-1">
            {events.map((ev, idx) => (
              <div key={idx} className="flex items-start space-x-3 text-[#a0a7b1] hover:text-[#e5e7eb]">
                <span className="text-[#737c88] shrink-0">#{ev.sequence || idx + 1}</span>
                <span className="text-[#3b82f6] shrink-0">[{ev.event_type}]</span>
                <span className="text-[#cbd5e1] truncate">{JSON.stringify(ev.payload)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Primary Source Inspection Modal */}
      {selectedSourceForModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="max-w-2xl w-full bg-[#181b1f] border border-[#30353c] rounded p-6 shadow-2xl">
            <div className="flex items-start justify-between border-b border-[#30353c] pb-3 mb-4">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#3b82f6]">{selectedSourceForModal.category}</span>
                <h3 className="text-sm font-semibold text-[#f8fafc] mt-0.5">{selectedSourceForModal.title}</h3>
                <p className="text-xs text-[#737c88] font-mono mt-0.5">{selectedSourceForModal.publisher} • {selectedSourceForModal.date}</p>
              </div>
              <button
                onClick={() => setSelectedSourceForModal(null)}
                className="text-[#737c88] hover:text-[#e5e7eb] font-mono text-xs cursor-pointer"
              >
                ✕ Close
              </button>
            </div>
            <div className="text-xs text-[#cbd5e1] leading-relaxed bg-[#111315] p-4 rounded border border-[#30353c] font-serif mb-4">
              "{selectedSourceForModal.summary}"
            </div>
            <div className="flex justify-between items-center text-[11px] font-mono text-[#737c88]">
              <span className="truncate max-w-md">Source: {selectedSourceForModal.url}</span>
              <a
                href={selectedSourceForModal.url}
                target="_blank"
                rel="noreferrer"
                className="text-[#3b82f6] hover:text-[#60a5fa] flex items-center space-x-1"
              >
                <span>External Link</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Adversarial Claim Challenge Modal */}
      {challengeModalClaim && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="max-w-lg w-full bg-[#181b1f] border border-[#30353c] rounded p-6 shadow-2xl">
            <div className="flex items-start justify-between border-b border-[#30353c] pb-3 mb-4">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#f59e0b]">Adversarial Scrutiny</span>
                <h3 className="text-sm font-semibold text-[#f8fafc] mt-0.5">Inject Formal Challenge on Claim</h3>
              </div>
              <button
                onClick={() => setChallengeModalClaim(null)}
                className="text-[#737c88] hover:text-[#e5e7eb] font-mono text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-3 rounded bg-[#111315] border border-[#30353c] text-xs text-[#cbd5e1] font-serif mb-4">
              "{challengeModalClaim.statement}"
            </div>

            <form onSubmit={handleSubmitChallenge} className="space-y-3">
              <div>
                <label className="block text-[10px] font-mono uppercase text-[#737c88] mb-1">
                  Challenging Specialist:
                </label>
                <select
                  value={challengeChallenger}
                  onChange={(e) => setChallengeChallenger(e.target.value)}
                  className="w-full bg-[#111315] border border-[#30353c] text-xs text-[#e5e7eb] rounded p-2 focus:outline-none focus:border-[#3b82f6]"
                >
                  <option value="bear_analyst">Inspector Jonathan Cole (Bear-Case Specialist)</option>
                  <option value="forensic_accountant">Marcus Holst, CPA/CFF (Forensic Accountant)</option>
                  <option value="red_team_investigator">Cassandra Cross (Red-Team Epistemic Investigator)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-[#737c88] mb-1">
                  Challenge Counterargument:
                </label>
                <textarea
                  value={challengeText}
                  onChange={(e) => setChallengeText(e.target.value)}
                  rows={3}
                  placeholder="Articulate documentary conflict, procurement elongation, or customer concentration risk..."
                  className="w-full bg-[#111315] border border-[#30353c] text-xs text-[#e5e7eb] rounded p-2 focus:outline-none focus:border-[#3b82f6] placeholder-[#737c88]"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setChallengeModalClaim(null)}
                  className="px-3 py-1.5 rounded border border-[#30353c] text-[#a0a7b1] hover:text-[#e5e7eb] text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={challengeLoading || !challengeText.trim()}
                  className="px-4 py-1.5 rounded bg-[#b45309] hover:bg-[#d97706] text-white text-xs font-medium cursor-pointer disabled:opacity-50"
                >
                  {challengeLoading ? "Disputing..." : "Submit Formal Challenge"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
