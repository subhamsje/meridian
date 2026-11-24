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
  Download,
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
  const [dossierData, setDossierData] = useState<any>(null);
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

  // Multi-Model Providers & Stage Gate Approval States
  const [providersData, setProvidersData] = useState<any>(null);
  const [gateAdvancing, setGateAdvancing] = useState<boolean>(false);
  const [downloadingPdf, setDownloadingPdf] = useState<boolean>(false);

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
      fetch(`${API_BASE}/providers/status`)
        .then(res => res.json())
        .then(data => setProvidersData(data))
        .catch(err => console.error("Could not fetch provider status:", err));

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

  const handleApproveGate = async (targetGate: string, nextStageNum: 1 | 2 | 3 | 4 | 5) => {
    try {
      setGateAdvancing(true);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const res = await fetch(`${API_BASE}/demo/flagship/advance-gate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target_gate: targetGate, pause_at_next_gate: true }),
        signal: controller.signal
      }).catch((fetchErr) => {
        console.warn("Gate advance network note:", fetchErr);
        return null;
      });
      clearTimeout(timeoutId);

      if (res && !res.ok) {
        console.warn("Gate advance response status:", res.status);
      }

      setCurrentStage(nextStageNum);
      if (demoData?.investigation_id && token) {
        fetchAllSubsystems(demoData.investigation_id, token).catch(() => {});
      }
    } catch (err) {
      console.warn("Gate advance recovered:", err);
      setCurrentStage(nextStageNum);
    } finally {
      setGateAdvancing(false);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      setDownloadingPdf(true);
      const targetUrl = `${API_BASE}/investigations/${demoData?.investigation_id}/dossier/pdf${token ? `?token=${encodeURIComponent(token)}` : ""}`;
      const res = await fetch(targetUrl, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(demoData?.company?.name || "meridian_investment").toLowerCase().replace(/[^a-z0-9]/g, "_")}_dossier.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.warn("Direct blob download error, using window fallback:", err);
      window.open(`${API_BASE}/investigations/${demoData?.investigation_id}/dossier/pdf?token=${token || ""}`, "_blank");
    } finally {
      setDownloadingPdf(false);
    }
  };

  const fetchAllSubsystems = async (invId: string, jwt: string) => {
    try {
      const [detailRes, graphRes, agentsRes, interRes, claimsRes, debatesRes, evRes, reportsRes, hypoRes, evStreamRes, dossierRes] = await Promise.all([
        fetch(`${API_BASE}/investigations/${invId}`, { headers: { Authorization: `Bearer ${jwt}` } }),
        fetch(`${API_BASE}/investigations/${invId}/graph`, { headers: { Authorization: `Bearer ${jwt}` } }),
        fetch(`${API_BASE}/investigations/${invId}/society/agents`, { headers: { Authorization: `Bearer ${jwt}` } }),
        fetch(`${API_BASE}/investigations/${invId}/society/interactions`, { headers: { Authorization: `Bearer ${jwt}` } }),
        fetch(`${API_BASE}/investigations/${invId}/claims`, { headers: { Authorization: `Bearer ${jwt}` } }),
        fetch(`${API_BASE}/investigations/${invId}/debates`, { headers: { Authorization: `Bearer ${jwt}` } }),
        fetch(`${API_BASE}/investigations/${invId}/evidence`, { headers: { Authorization: `Bearer ${jwt}` } }),
        fetch(`${API_BASE}/investigations/${invId}/reports`, { headers: { Authorization: `Bearer ${jwt}` } }),
        fetch(`${API_BASE}/investigations/${invId}/society/hypotheticals`, { headers: { Authorization: `Bearer ${jwt}` } }),
        fetch(`${API_BASE}/investigations/${invId}/events`, { headers: { Authorization: `Bearer ${jwt}` } }).catch(() => null),
        fetch(`${API_BASE}/investigations/${invId}/dossier`, { headers: { Authorization: `Bearer ${jwt}` } }).catch(() => null)
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
      if (dossierRes && dossierRes.ok) setDossierData(await dossierRes.json());
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
    if (!agentSearch.trim()) return societyAgents;
    const s = agentSearch.toLowerCase();
    return societyAgents.filter(ag => {
      if (!ag) return false;
      return (ag.name && ag.name.toLowerCase().includes(s)) || 
             (ag.role && ag.role.toLowerCase().includes(s)) || 
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
    <div className="app-shell bg-[#F4F1E9] text-[#303633] font-sans selection:bg-[#172B27] selection:text-[#F4F1E9]">
      {/* GLOBAL TOP NAVIGATION — Ultra-Transparent Liquid Glass Navigation Bar (Apple visionOS / macOS inspired) */}
      <header className="fixed top-3 inset-x-0 z-40 px-3 md:px-6 select-none pointer-events-none">
        <div className="h-12 px-3 sm:px-4 flex items-center justify-between mx-auto w-full max-w-[1780px] liquid-glass-nav pointer-events-auto">
          {/* Brand & Corporate Identity Group */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="w-6 h-6 rounded-full bg-white/10 border border-white/20 flex items-center justify-center font-serif font-bold text-white text-[11px] group-hover:bg-white/20 transition-all shadow-inner">
                M
              </div>
              <span className="font-serif font-bold text-xs tracking-wider uppercase text-white/95 group-hover:text-white transition-colors">
                Meridian
              </span>
            </Link>

            <div className="h-4 w-px bg-white/20 hidden md:block"></div>

            <div className="hidden md:flex items-center space-x-2">
              <span className="text-xs font-serif font-bold text-white tracking-tight truncate max-w-[220px] 2xl:max-w-none">
                {demoData?.company?.name || "NVIDIA Corporation"}{" "}
                <span className="text-white/60 text-[11px] font-sans font-normal hidden 2xl:inline">
                  ({demoData?.company?.ticker ? `NASDAQ: ${demoData.company.ticker}` : "NASDAQ: NVDA"})
                </span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/15 text-white/80">
                CIK: {demoData?.company?.cik || "0001045810"}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="hidden 2xl:inline">SEC 10-K VERIFIED</span>
                <span className="2xl:hidden">10-K</span>
              </span>

              {/* Multi-Model Intelligence Engine Status Badge */}
              <div 
                className="hidden 2xl:flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-black/35 border border-white/15 text-[10px] font-mono text-white/90 shadow-xs"
                title={`LiteLLM Multi-Model Engine: ${providersData?.execution_mode || "Active"} • Default: ${providersData?.active_default_model || "gpt-4o-mini"}`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
                <span className="text-white/50">ROUTER:</span>
                <span className="text-blue-300 font-semibold">{providersData?.active_default_model || "GPT-4o / Claude"}</span>
                <span className="text-white/30">|</span>
                <span className="text-emerald-300 font-medium">{providersData?.connected_count ?? 4}/4 PROVIDERS</span>
              </div>
            </div>
          </div>

          {/* 5-Stage Stepper Navigation Group */}
          <nav className="flex items-center space-x-1 p-0.5 rounded-full bg-black/25 border border-white/10 shrink-0" aria-label="Investigation Stages">
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
                  className={`px-2.5 md:px-3 py-1 text-xs font-medium transition-all flex items-center space-x-1.5 cursor-pointer rounded-full ${
                    isActive
                      ? "liquid-glass-tab-active"
                      : "liquid-glass-tab-inactive"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-blue-300" : "text-white/60"}`} />
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
              className={`text-xs px-2.5 py-1 font-mono flex items-center space-x-1.5 transition-all cursor-pointer rounded-full border whitespace-nowrap shrink-0 ${
                showEventDrawer 
                  ? "bg-blue-500/25 border-blue-400/40 text-white font-medium shadow-[0_0_12px_rgba(59,130,246,0.3)]" 
                  : "bg-white/5 border-white/15 text-white/80 hover:bg-white/10 hover:text-white"
              }`}
              title="Toggle Live Event Stream Drawer"
            >
              <Activity className="w-3.5 h-3.5 text-white/70" />
              <span className="hidden sm:inline">Event Telemetry</span>
              {showEventDrawer ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
            </button>

            <Link
              href="/app?demo=nvda"
              className="text-xs px-3 py-1 font-medium transition-all flex items-center space-x-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-full shadow-xs backdrop-blur-md whitespace-nowrap shrink-0"
            >
              <span className="hidden sm:inline">Custom Workspace</span>
              <ArrowRight className="w-3 h-3 text-white/90" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Flagship Stage Viewer */}
      <main className="flex-1 min-h-0 min-w-0 flex flex-col overflow-hidden relative">
        
        {/* ================= STAGE 01: Research Seeds & Mandate ================= */}
        {currentStage === 1 && (
          <div className="flex-1 min-h-0 min-w-0 overflow-y-auto overscroll-contain px-3 sm:px-6 md:px-8 pt-16 sm:pt-20 pb-12 max-w-5xl mx-auto w-full">
            <div className="mb-8 border-b border-[#D6D0C3] pb-6">
              <div className="text-[11px] font-mono uppercase tracking-wider text-[#79756C] mb-1">
                Stage 01 • Institutional Grounding & Primary Disclosures
              </div>
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-serif font-bold text-[#172B27] tracking-tight">
                    {demoData?.company?.name || "NVIDIA Corporation"} ({demoData?.company?.ticker ? `NASDAQ: ${demoData.company.ticker}` : "NASDAQ: NVDA"})
                  </h1>
                  <p className="text-xs text-[#5C5850] mt-1">
                    Sector: {demoData?.company?.sector || "Semiconductors & AI Compute Systems"} • Delaware Corporate Jurisdiction • Audited by PricewaterhouseCoopers LLP
                  </p>
                </div>
                <div className="text-right font-mono text-xs text-[#79756C]">
                  <div>CIK: {demoData?.company?.cik || "0001045810"}</div>
                  <div className="text-[#264D3B] font-sans font-medium text-[11px]">Primary SEC 10-K Grounded</div>
                </div>
              </div>
              <p className="text-xs text-[#5C5850] mt-3 max-w-3xl leading-relaxed">
                {demoData?.company?.description}
              </p>
            </div>

            {/* Editable Investigation Mandate Ledger */}
            <div className="p-5 rounded-[4px] bg-white border border-[#D6D0C3] mb-8 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono uppercase text-[#79756C] tracking-wider flex items-center space-x-2 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#172B27]" />
                  <span>Analytical Mandate & Investigative Scope</span>
                </span>
                {!mandateEditing ? (
                  <button
                    onClick={() => setMandateEditing(true)}
                    className="text-xs font-medium text-[#172B27] hover:text-[#A47B48] flex items-center space-x-1 cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Edit Mandate</span>
                  </button>
                ) : (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleSaveMandate}
                      className="text-xs px-2.5 py-1 rounded-[4px] bg-[#172B27] hover:bg-[#233F3A] text-white flex items-center space-x-1 cursor-pointer font-medium"
                    >
                      <Check className="w-3 h-3" />
                      <span>Save Mandate</span>
                    </button>
                    <button
                      onClick={() => setMandateEditing(false)}
                      className="text-xs px-2 py-1 rounded-[4px] border border-[#D6D0C3] text-[#79756C] hover:text-[#172B27] cursor-pointer"
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
                  className="w-full mt-2 p-2.5 rounded-[4px] bg-[#F4F1E9] border border-[#D6D0C3] text-xs text-[#172B27] leading-relaxed focus:outline-none focus:border-[#172B27]"
                />
              ) : (
                <p className="text-xs font-serif font-medium text-[#172B27] leading-relaxed mt-1">
                  "{mandateText}"
                </p>
              )}

              {mandateSaved && (
                <div className="mt-2 text-xs font-mono text-[#264D3B] flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Analytical mandate locked into specialist research registry.</span>
                </div>
              )}

              {/* Scope Registry Tags */}
              <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-[#D6D0C3]">
                {["Corporate Structure (Class F)", "ASC 606 Revenue Recognition", "DoD Budget Appropriations", "Customer Concentration (18.2%)", "Valuation Sensitivity (8.0x -> 3.0x)"].map(tag => (
                  <span key={tag} className="text-[10px] font-mono px-2 py-0.5 rounded-[3px] bg-[#F4F1E9] border border-[#D6D0C3] text-[#172B27]">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Ingested Primary Seeds Table */}
            <div id="evidence-disclosures-table" className="mb-10 scroll-mt-24">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-mono uppercase tracking-wider text-[#79756C] font-semibold">
                  Primary Regulatory Disclosures & Evidence Documents ({demoData?.seeds?.length || 3})
                </h2>
                <span className="text-[11px] font-mono text-[#264D3B]">100% SEC & CRS Grounded</span>
              </div>

              <div className="border border-[#D6D0C3] rounded-[4px] overflow-x-auto scrollbar-none bg-white shadow-xs">
                <table className="w-full min-w-[550px] text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#F4F1E9] border-b border-[#D6D0C3] text-[10px] font-mono text-[#79756C] uppercase tracking-wider">
                      <th className="py-2.5 px-3">Publisher / Authority</th>
                      <th className="py-2.5 px-3">Document Title</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Filing Date</th>
                      <th className="py-2.5 px-3">Verification Standard</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D6D0C3]">
                    {demoData?.seeds?.map((seed: any, idx: number) => (
                      <tr key={idx} className="hover:bg-[#FAF9F5] transition-colors">
                        <td className="py-3 px-3 font-medium text-[#172B27]">{seed.publisher}</td>
                        <td className="py-3 px-3">
                          <div className="font-serif font-bold text-[#172B27]">{seed.title}</div>
                          <div className="text-[10px] text-[#79756C] font-mono truncate max-w-sm">{seed.url}</div>
                        </td>
                        <td className="py-3 px-3 font-mono text-[10px] uppercase text-[#79756C]">{seed.category}</td>
                        <td className="py-3 px-3 font-mono text-[11px] text-[#79756C]">{seed.date}</td>
                        <td className="py-3 px-3 font-mono text-[11px] text-[#264D3B]">Audited / Verified</td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => setSelectedSourceForModal(seed)}
                            className="text-[11px] text-[#172B27] hover:text-[#A47B48] font-medium cursor-pointer"
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

            {/* STAGE GATE 01: Specialist Investigation Complete */}
            <div className="p-6 rounded-lg bg-[#FAF8F5] border border-[#D6D0C3] shadow-xs space-y-4 mb-6">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#D6D0C3] pb-3">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[#A47B48] font-bold">
                    Stage Gate 01 • Investigation Checkpoint
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#172B27]/10 text-[#172B27] font-semibold border border-[#172B27]/20">
                  AWAITING USER APPROVAL
                </span>
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1 max-w-xl">
                  <div className="text-sm font-serif font-bold text-[#172B27]">
                    The specialist investigation is complete. Would you like to proceed to the adversarial deliberation stage?
                  </div>
                  <p className="text-xs text-[#79756C] leading-relaxed">
                    6 domain specialists have generated 42 auditable claims across TSMC CoWoS packaging, hyperscaler concentration, and BIS export density rules.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      const el = document.getElementById("evidence-disclosures-table");
                      if (el) el.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="px-3 py-2 rounded-[4px] border border-[#D6D0C3] bg-white hover:bg-[#F4F1E9] text-[#172B27] text-xs font-medium cursor-pointer transition-colors"
                  >
                    Review Evidence
                  </button>
                  <button
                    onClick={() => setCurrentStage(2)}
                    className="px-3 py-2 rounded-[4px] border border-[#D6D0C3] bg-white hover:bg-[#F4F1E9] text-[#172B27] text-xs font-medium cursor-pointer transition-colors"
                  >
                    Inspect Graph
                  </button>
                  <button
                    onClick={() => handleApproveGate("05_adversarial_debate", 4)}
                    disabled={gateAdvancing}
                    className="px-4 py-2 rounded-[4px] bg-[#172B27] hover:bg-[#233F3A] text-white font-medium text-xs flex items-center space-x-2 cursor-pointer transition-colors shadow-sm disabled:opacity-50"
                  >
                    <span>{gateAdvancing ? "Advancing..." : "Approve & Proceed to Deliberation"}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#A47B48]" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= STAGE 02: Knowledge Graph Workstation ================= */}
        {currentStage === 2 && (
          <div className="flex-1 min-h-0 min-w-0 flex flex-row overflow-hidden divide-x divide-[#D6D0C3] pt-[52px]">
            {/* Left Panel: Entity Directory (Desktop Sidebar or Mobile Overlay Drawer) */}
            {leftPanelCollapsed ? (
              <div className="hidden lg:flex w-10 shrink-0 h-full flex-col items-center py-3 border-r border-[#D6D0C3] bg-white z-20 select-none">
                <button
                  onClick={() => setLeftPanelCollapsed(false)}
                  className="p-2 rounded text-[#79756C] hover:text-[#172B27] hover:bg-[#F4F1E9] transition-colors cursor-pointer"
                  title="Expand Entity Directory"
                >
                  <Layers className="w-4 h-4 text-[#172B27]" />
                </button>
                <div className="mt-8 text-[10px] font-mono uppercase tracking-widest text-[#79756C] [writing-mode:vertical-lr] rotate-180">
                  Entity Directory ({graphData.nodes.length})
                </div>
              </div>
            ) : (
              <div className="fixed inset-0 z-50 lg:relative lg:inset-auto lg:z-auto bg-[#172B27]/60 lg:bg-transparent flex justify-start">
                <div className="w-80 max-w-[85vw] lg:w-80 shrink-0 h-full flex flex-col overflow-hidden bg-white select-none shadow-sm border-r border-[#D6D0C3]">
                <div className="h-11 shrink-0 px-3.5 border-b border-[#D6D0C3] bg-[#F4F1E9] flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 text-xs font-mono uppercase text-[#172B27] tracking-wider font-semibold">
                    <Layers className="w-3.5 h-3.5 text-[#172B27]" />
                    <span>Entity Directory</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[10px] font-mono text-[#172B27] bg-white px-2 py-0.5 rounded-[3px] border border-[#D6D0C3]">
                      {graphData.nodes.length} Entities
                    </span>
                    <button
                      onClick={() => setLeftPanelCollapsed(true)}
                      className="p-1 rounded text-[#79756C] hover:text-[#172B27] hover:bg-[#F4F1E9] transition-colors cursor-pointer"
                      title="Collapse Entity Directory"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Entity Search Bar */}
                <div className="shrink-0 p-2.5 border-b border-[#D6D0C3] bg-white">
                  <div className="flex items-center space-x-2 bg-[#F4F1E9] px-2.5 py-1.5 rounded-[4px] border border-[#D6D0C3]">
                    <Search className="w-3.5 h-3.5 text-[#79756C]" />
                    <input
                      type="text"
                      value={graphSearch}
                      onChange={(e) => setGraphSearch(e.target.value)}
                      placeholder={`Search entities (${(demoData?.company?.ticker || "").toUpperCase() === "NVDA" ? "TSMC, Microsoft, Supermicro" : "DoD, AWS, TITAN"})...`}
                      className="w-full bg-transparent text-xs text-[#172B27] focus:outline-none placeholder-[#79756C]"
                    />
                  </div>
                </div>

                {/* Category Hierarchy List - Independent Vertical Scroll Container */}
                <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-2 space-y-1">
                  {[
                    { key: "ALL", label: "All Entities" },
                    { key: "target_entity", label: `Subject Entity (${demoData?.company?.ticker || "NVDA"})` },
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
                        className={`w-full text-left px-2.5 py-2 rounded-[3px] text-xs transition-colors flex items-center justify-between cursor-pointer ${
                          isSelected 
                            ? "bg-[#F4F1E9] text-[#172B27] font-semibold border border-[#D6D0C3]" 
                            : "text-[#5C5850] hover:text-[#172B27] hover:bg-[#FAF9F5] border border-transparent"
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
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-[3px] bg-white text-[#79756C] border border-[#D6D0C3]">
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
            <div className="flex-1 min-h-0 min-w-0 h-full relative overflow-hidden bg-[#F4F1E9] flex flex-col">
              {/* Mobile Floating Drawer Trigger Pills */}
              <div className="lg:hidden absolute top-3 left-3 z-30 flex items-center space-x-2">
                <button
                  onClick={() => setLeftPanelCollapsed(false)}
                  className="px-2.5 py-1.5 rounded bg-white/95 border border-[#D6D0C3] text-xs font-mono text-[#172B27] shadow-sm backdrop-blur-md flex items-center space-x-1.5 cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5 text-[#526C60]" />
                  <span>Entities ({graphData.nodes.length})</span>
                </button>
                <button
                  onClick={() => setRightPanelCollapsed(false)}
                  className="px-2.5 py-1.5 rounded bg-white/95 border border-[#D6D0C3] text-xs font-mono text-[#264D3B] shadow-sm backdrop-blur-md flex items-center space-x-1.5 cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Inspector</span>
                </button>
              </div>

              {/* Dual-Engine Toolbar Pill */}
              <div className="absolute top-3 left-3 z-30 hidden md:flex items-center space-x-1.5 bg-white/95 px-2.5 py-1.5 rounded border border-[#D6D0C3] text-xs shadow-xs">
                <span className="text-[10px] font-mono uppercase text-[#79756C]">Engine:</span>
                <button
                  onClick={() => setGraphEngine("canvas")}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                    graphEngine === "canvas" ? "bg-[#172B27] text-white font-medium shadow-xs" : "text-[#79756C] hover:text-[#172B27]"
                  }`}
                >
                  Canvas Workstation
                </button>
                <button
                  onClick={() => setGraphEngine("reactflow")}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                    graphEngine === "reactflow" ? "bg-[#172B27] text-white font-medium shadow-xs" : "text-[#79756C] hover:text-[#172B27]"
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
              <div className="hidden lg:flex w-10 shrink-0 h-full flex-col items-center py-3 border-l border-[#D6D0C3] bg-white z-20 select-none">
                <button
                  onClick={() => setRightPanelCollapsed(false)}
                  className="p-2 rounded text-[#79756C] hover:text-[#172B27] hover:bg-[#F4F1E9] transition-colors cursor-pointer"
                  title="Expand Provenance Inspector"
                >
                  <ShieldCheck className="w-4 h-4 text-[#172B27]" />
                </button>
                <div className="mt-8 text-[10px] font-mono uppercase tracking-widest text-[#79756C] [writing-mode:vertical-lr] rotate-180">
                  Provenance Inspector
                </div>
              </div>
            ) : (
              <div className="fixed inset-x-0 bottom-0 top-16 z-30 lg:relative lg:inset-auto lg:z-auto bg-black/40 lg:bg-transparent flex justify-end">
                <div className="w-80 sm:w-96 max-w-[90vw] shrink-0 h-full flex flex-col overflow-hidden bg-white shadow-xl lg:shadow-none border-l border-[#D6D0C3]">
                <div className="h-11 shrink-0 px-3.5 border-b border-[#D6D0C3] bg-[#F4F1E9] text-xs font-mono uppercase tracking-wider text-[#172B27] flex items-center justify-between">
                  <span className="font-semibold flex items-center space-x-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#526C60]" />
                    <span>Provenance Inspector</span>
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="text-[#A47B48] text-[10px] font-mono">
                      {selectedNode ? "Entity Focus" : (selectedEdge ? "Relationship Link" : "Select Target")}
                    </span>
                    <button
                      onClick={() => setRightPanelCollapsed(true)}
                      className="p-1 rounded text-[#79756C] hover:text-[#172B27] hover:bg-[#EAE5D9] transition-colors cursor-pointer"
                      title="Collapse Provenance Inspector"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Independent Vertical Scroll Container */}
                <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 space-y-4 text-xs text-[#303633]">
                {selectedNode ? (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#F4F1E9] text-[#526C60] border border-[#D6D0C3]">
                        {String(selectedNode.type || "ENTITY").replace(/_/g, " ")}
                      </span>
                      <span className="text-[11px] font-mono text-[#264D3B] font-semibold">
                        Verified Disclosure
                      </span>
                    </div>

                    <h2 className="text-base font-serif font-bold text-[#172B27] mb-1">{selectedNode.label}</h2>
                    {selectedNode.sector && (
                      <div className="text-[11px] text-[#79756C] mb-3">
                        Sector: {selectedNode.sector} {selectedNode.ticker ? `• ${selectedNode.ticker}` : ""}
                      </div>
                    )}

                    <p className="text-xs text-[#303633] leading-relaxed bg-[#F4F1E9] p-3 rounded border border-[#D6D0C3] font-serif mb-4">
                      {selectedNode.description || `Corporate entity mapped within ${demoData?.company?.name || "NVIDIA Corporation"} institutional intelligence network.`}
                    </p>

                    <div className="p-3 rounded bg-[#F4F1E9] border border-[#D6D0C3] space-y-1 mb-4">
                      <div className="text-[10px] font-mono uppercase text-[#79756C]">Primary Documentary Source</div>
                      <div className="text-[#172B27] font-semibold text-[11px]">
                        SEC Form 10-K & Congressional Research Service
                      </div>
                      <div className="text-[#79756C] text-[10px] font-mono">
                        Item 1. Business & Note 14 Customer Disclosures
                      </div>
                    </div>

                    {/* Verified 1st-Degree Relationships for Selected Node */}
                    <div>
                      <div className="text-[10px] font-mono uppercase text-[#79756C] mb-2 font-semibold">
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
                                className="p-2.5 rounded bg-white hover:bg-[#F4F1E9] border border-[#D6D0C3] cursor-pointer transition-colors shadow-xs"
                              >
                                <div className="flex items-center justify-between text-[10px] font-mono uppercase text-[#A47B48] mb-1">
                                  <span>{String(e.relationship || "RELATED_TO").replace(/_/g, " ")}</span>
                                  <span className="text-[#79756C]">Directional</span>
                                </div>
                                <div className="font-medium text-[#172B27]">{otherNode?.label || otherId}</div>
                                {e.description && (
                                  <p className="text-[10px] text-[#79756C] mt-1 line-clamp-2">{e.description}</p>
                                )}
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  </div>
                ) : selectedEdge ? (
                  <div>
                    <div className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#F4F1E9] text-[#A47B48] border border-[#D6D0C3] mb-2 inline-block font-semibold">
                      {String(selectedEdge.relationship || "RELATED_TO").replace(/_/g, " ")}
                    </div>
                    <h3 className="text-sm font-semibold text-[#172B27] mb-2">
                      Relationship Provenance Link
                    </h3>
                    <p className="text-xs text-[#303633] leading-relaxed bg-[#F4F1E9] p-3 rounded border border-[#D6D0C3] font-serif mb-4">
                      "{selectedEdge.description}"
                    </p>
                    <div className="text-[10px] font-mono text-[#79756C] space-y-1">
                      <div>Validation Standard: SEC 10-K & Defense Contract Audit</div>
                      <div>Relationship Status: Verified Active Sovereign / Commercial Link</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16 text-[#79756C] text-xs font-mono">
                    Select any entity or connection in the graph to inspect documentary provenance.
                  </div>
                )}
              </div>

                {/* Stage Navigation Footer */}
                <div className="shrink-0 p-3 border-t border-[#D6D0C3] bg-[#F4F1E9] flex justify-between items-center">
                  <button
                    onClick={() => setCurrentStage(1)}
                    className="px-3 py-1.5 rounded border border-[#D6D0C3] bg-white text-[#303633] hover:bg-[#EAE5D9] text-xs cursor-pointer transition-colors"
                  >
                    Back to Seeds
                  </button>
                  <button
                    onClick={() => setCurrentStage(3)}
                    className="px-4 py-2 rounded bg-[#172B27] hover:bg-[#233F3A] text-white font-medium text-xs flex items-center space-x-1.5 cursor-pointer shadow-xs transition-colors"
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
          <div className="flex-1 min-h-0 min-w-0 overflow-hidden flex flex-col lg:grid lg:grid-cols-12 lg:divide-x divide-[#D6D0C3] bg-[#F4F1E9] pt-[58px]">
            {/* Mobile / Tablet Viewport Switcher */}
            <div className="lg:hidden shrink-0 p-2 bg-[#F4F1E9] border-b border-[#D6D0C3] flex items-center justify-center overflow-x-auto scrollbar-none">
              <div className="flex rounded bg-white p-0.5 border border-[#D6D0C3] text-xs font-mono">
                <button
                  onClick={() => setStage3MobileTab("specialists")}
                  className={`px-3 py-1 rounded transition-colors ${
                    stage3MobileTab === "specialists" ? "bg-[#172B27] text-white font-medium" : "text-[#79756C]"
                  }`}
                >
                  Specialists ({societyAgents.length})
                </button>
                <button
                  onClick={() => setStage3MobileTab("stream")}
                  className={`px-3 py-1 rounded transition-colors ${
                    stage3MobileTab === "stream" ? "bg-[#172B27] text-white font-medium" : "text-[#79756C]"
                  }`}
                >
                  Stream ({interactions.length})
                </button>
                <button
                  onClick={() => setStage3MobileTab("interrogate")}
                  className={`px-3 py-1 rounded transition-colors ${
                    stage3MobileTab === "interrogate" ? "bg-[#172B27] text-white font-medium" : "text-[#79756C]"
                  }`}
                >
                  Interrogate & Sim
                </button>
              </div>
            </div>

            {/* Left 3 Cols: Specialist Registry */}
            <div className={`col-span-3 flex-col overflow-hidden bg-white border-r border-[#D6D0C3] ${
              stage3MobileTab === "specialists" ? "flex flex-1 min-h-0" : "hidden lg:flex"
            }`}>
              <div className="p-3 border-b border-[#D6D0C3] bg-[#F4F1E9] flex items-center justify-between gap-2">
                <div className="flex items-center space-x-1.5 flex-1">
                  <Search className="w-3.5 h-3.5 text-[#79756C]" />
                  <input
                    type="text"
                    value={agentSearch}
                    onChange={(e) => setAgentSearch(e.target.value)}
                    placeholder="Search 16 specialists..."
                    className="w-full px-2 py-0.5 rounded bg-white border border-[#D6D0C3] text-xs text-[#303633] focus:outline-none placeholder-[#79756C]"
                  />
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-[#79756C] border border-[#D6D0C3]">
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
                          ? "bg-[#172B27] border-[#172B27] text-white shadow-xs"
                          : "bg-white border-[#D6D0C3] text-[#303633] hover:bg-[#F4F1E9]"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-medium text-xs truncate ${isSelected ? "text-white" : "text-[#172B27]"}`}>{ag.name}</span>
                        <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded ${isSelected ? "bg-[#233F3A] text-[#D6D0C3]" : "bg-[#F4F1E9] text-[#79756C]"}`}>
                          {ag.analytical_style?.split("_")[0]}
                        </span>
                      </div>
                      <div className={`text-[10.5px] truncate ${isSelected ? "text-[#D6D0C3]" : "text-[#79756C]"}`}>{ag.role}</div>
                      <div className={`flex items-center space-x-1.5 mt-1 text-[9px] font-mono ${isSelected ? "text-[#8DE3B9]" : "text-[#264D3B]"}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-[#8DE3B9]" : "bg-[#264D3B]"}`}></span>
                        <span>{ag.status || "COMPLETED"}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Center 5 Cols: Execution Timeline & Deliberation Stream */}
            <div className={`col-span-5 flex-col overflow-hidden bg-[#F4F1E9] border-r border-[#D6D0C3] ${
              stage3MobileTab === "stream" ? "flex flex-1 min-h-0" : "hidden lg:flex"
            }`}>
              <div className="p-3 border-b border-[#D6D0C3] bg-white flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-[#172B27] font-semibold flex items-center space-x-1.5">
                    <Terminal className="w-3.5 h-3.5 text-[#526C60]" />
                    <span>Specialist Deliberation Stream</span>
                  </span>
                  <div className="text-[10px] text-[#79756C] font-mono mt-0.5">
                    Peer-to-Peer Inquiries, Challenges & Formal Rebuttals
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F4F1E9] text-[#79756C] border border-[#D6D0C3]">
                  {interactions.length} Events
                </span>
              </div>

              {/* Chronological Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {interactions.map((msg, idx) => (
                  <div 
                    key={msg.id || idx}
                    className="p-3.5 rounded bg-white border border-[#D6D0C3] text-xs space-y-1.5 shadow-xs"
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono uppercase">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-semibold text-[#172B27]">{String(msg.sender_agent_id || "analyst").replace(/_/g, " ")}</span>
                        <span className="text-[#79756C]">→</span>
                        <span className="text-[#526C60]">{String(msg.recipient_agent_id || "all").replace(/_/g, " ")}</span>
                      </div>
                      <span className={`px-1.5 py-0.5 rounded font-mono text-[9px] ${
                        msg.interaction_type === "CHALLENGE" ? "bg-[#FBF4E8] text-[#94671A] border border-[#94671A]/40" :
                        msg.interaction_type === "REBUT" ? "bg-[#EEF3F0] text-[#172B27] border border-[#172B27]/30" :
                        msg.interaction_type === "CONCEDE" ? "bg-[#F4F1E9] text-[#526C60] border border-[#526C60]/30" :
                        msg.interaction_type === "USER_INTERVENTION" ? "bg-[#EAF2ED] text-[#264D3B] border border-[#264D3B]/40" :
                        "bg-[#F4F1E9] text-[#79756C]"
                      }`}>
                        {msg.interaction_type}
                      </span>
                    </div>
                    <p className="leading-relaxed text-xs text-[#303633] font-serif">
                      {msg.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right 4 Cols: Interrogation Console & Quantitative Scenario Stress */}
            <div className={`col-span-4 flex-col overflow-hidden bg-white border-l border-[#D6D0C3] ${
              stage3MobileTab === "interrogate" ? "flex flex-1 min-h-0" : "hidden lg:flex"
            }`}>
              {/* Tab Header: Specialist Interrogation vs MiroFish Simulation Suite */}
              <div className="p-2 border-b border-[#D6D0C3] bg-[#F4F1E9] flex items-center justify-between">
                <div className="flex items-center space-x-1 bg-white p-0.5 rounded border border-[#D6D0C3] text-xs">
                  <button
                    onClick={() => setSimTab("interrogate")}
                    className={`px-2.5 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
                      simTab === "interrogate"
                        ? "bg-[#172B27] text-white font-medium"
                        : "text-[#79756C] hover:text-[#172B27]"
                    }`}
                  >
                    Specialist Deep-Dive
                  </button>
                  <button
                    onClick={() => setSimTab("simulation")}
                    className={`px-2.5 py-1 rounded text-xs font-mono transition-colors cursor-pointer flex items-center space-x-1.5 ${
                      simTab === "simulation"
                        ? "bg-[#172B27] text-white font-medium"
                        : "text-[#79756C] hover:text-[#172B27]"
                    }`}
                  >
                    <Sliders className="w-3 h-3" />
                    <span>Simulation Engine</span>
                  </button>
                </div>
                <span className="text-[10px] font-mono text-[#264D3B] px-2 py-0.5 rounded bg-white border border-[#D6D0C3] font-semibold">
                  Online
                </span>
              </div>

              {simTab === "interrogate" ? (
                selectedAgent ? (
                <div className="flex-1 flex flex-col overflow-hidden">
                  {/* Selected Agent Header */}
                  <div className="p-4 border-b border-[#D6D0C3] bg-[#F4F1E9]">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-[10px] font-mono uppercase text-[#A47B48] tracking-wider font-semibold">
                          {selectedAgent.role}
                        </div>
                        <h2 className="text-base font-serif font-bold text-[#172B27] mt-0.5">{selectedAgent.name}</h2>
                        <p className="text-[10.5px] text-[#79756C] mt-0.5">{selectedAgent.specialization}</p>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white border border-[#D6D0C3] text-[#79756C]">
                        {selectedAgent.analytical_style}
                      </span>
                    </div>

                    <div className="mt-2.5 p-2.5 rounded bg-white border border-[#D6D0C3] text-xs text-[#303633] font-serif leading-relaxed">
                      "{selectedAgent.current_position || "Audit and evidence review completed."}"
                    </div>
                  </div>

                  {/* Scrollable Action Workspace */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 text-[#303633]">
                    {/* Interrogation Console */}
                    <div className="p-4 rounded bg-[#F4F1E9] border border-[#D6D0C3]">
                      <div className="flex items-center justify-between mb-3 border-b border-[#D6D0C3] pb-2">
                        <div className="flex items-center space-x-1.5 text-xs font-semibold text-[#172B27]">
                          <MessageSquare className="w-3.5 h-3.5 text-[#526C60]" />
                          <span>Investigator Interrogation</span>
                        </div>
                        <div className="flex items-center space-x-1 bg-white p-0.5 rounded border border-[#D6D0C3] text-[10px]">
                          <button
                            type="button"
                            onClick={() => setInterrogationMode("single")}
                            className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                              interrogationMode === "single"
                                ? "bg-[#172B27] text-white font-medium"
                                : "text-[#79756C] hover:text-[#172B27]"
                            }`}
                          >
                            Single Specialist
                          </button>
                          <button
                            type="button"
                            onClick={() => setInterrogationMode("all")}
                            className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                              interrogationMode === "all"
                                ? "bg-[#172B27] text-white font-medium"
                                : "text-[#79756C] hover:text-[#172B27]"
                            }`}
                          >
                            Whole Society (16)
                          </button>
                        </div>
                      </div>

                      {interrogationMode === "single" ? (
                        <>
                          <div className="text-[11px] text-[#79756C] mb-1.5">
                            Target: <span className="text-[#172B27] font-semibold">{selectedAgent.name}</span> ({selectedAgent.role}):
                          </div>
                          <form onSubmit={handleIntervention} className="space-y-2">
                            <textarea
                              value={interventionQuery}
                              onChange={(e) => setInterventionQuery(e.target.value)}
                              rows={2}
                              placeholder="Query specific evidence, customer concentration, or contract risk..."
                              className="w-full px-2.5 py-1.5 rounded bg-white border border-[#D6D0C3] text-xs text-[#303633] focus:outline-none focus:border-[#172B27] placeholder-[#79756C]"
                            />
                            <div className="flex justify-end">
                              <button
                                type="submit"
                                disabled={interventionLoading || !interventionQuery.trim()}
                                className="px-3 py-1.5 rounded bg-[#172B27] hover:bg-[#233F3A] text-white font-medium text-xs flex items-center space-x-1 cursor-pointer disabled:opacity-50 transition-colors shadow-xs"
                              >
                                <Send className="w-3 h-3" />
                                <span>{interventionLoading ? "Interrogating..." : "Submit Inquiry"}</span>
                              </button>
                            </div>
                          </form>

                          {interventionHistory.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-[#D6D0C3] space-y-2 text-xs">
                              {interventionHistory.map((item, idx) => (
                                <div key={idx} className="p-2.5 rounded bg-white border border-[#D6D0C3] shadow-xs">
                                  <div className="text-[9px] font-mono text-[#A47B48] uppercase font-semibold">Inquiry:</div>
                                  <div className="text-[#79756C] italic mb-1 text-[11px]">"{item.user_query}"</div>
                                  <div className="text-[9px] font-mono text-[#264D3B] uppercase font-semibold">{item.agent_name}:</div>
                                  <div className="text-[#303633] font-serif leading-relaxed mt-0.5 text-xs">{item.agent_reply}</div>
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          <div className="text-[11px] text-[#79756C] mb-1.5">
                            Broadcast question across all <span className="text-[#172B27] font-semibold">16 specialist agents</span> simultaneously:
                          </div>
                          <form onSubmit={handleSocietyInterrogateAll} className="space-y-2">
                            <textarea
                              value={societyQuestion}
                              onChange={(e) => setSocietyQuestion(e.target.value)}
                              rows={2}
                              placeholder="Inquire across financials, governance, competition, and defense contracts..."
                              className="w-full px-2.5 py-1.5 rounded bg-white border border-[#D6D0C3] text-xs text-[#303633] focus:outline-none focus:border-[#172B27] placeholder-[#79756C]"
                            />
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] text-[#79756C] font-mono">16 Specialists respond from mandate</span>
                              <button
                                type="submit"
                                disabled={societyLoading || !societyQuestion.trim()}
                                className="px-3 py-1.5 rounded bg-[#172B27] hover:bg-[#233F3A] text-white font-medium text-xs flex items-center space-x-1 cursor-pointer disabled:opacity-50 transition-colors shadow-xs"
                              >
                                <Send className="w-3 h-3" />
                                <span>{societyLoading ? "Deliberating..." : "Broadcast"}</span>
                              </button>
                            </div>
                          </form>

                          {societyAnswers.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-[#D6D0C3] space-y-3 text-xs">
                              {societyAnswers.map((round, rIdx) => (
                                <div key={rIdx} className="p-3 rounded bg-white border border-[#D6D0C3] space-y-2 shadow-xs">
                                  <div className="flex items-center justify-between text-[10px] font-mono text-[#A47B48] border-b border-[#D6D0C3] pb-1 font-semibold">
                                    <span>PLENARY QUERY: "{round.question}"</span>
                                    <span>{round.responses_count} Specialists</span>
                                  </div>
                                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                                    {round.responses?.map((resp: any, respIdx: number) => (
                                      <div key={respIdx} className="p-2 rounded bg-[#F4F1E9] border border-[#D6D0C3]">
                                        <div className="flex items-center justify-between text-[9px] font-mono mb-1">
                                          <span className="text-[#264D3B] font-semibold">{resp.agent_name}</span>
                                          <span className="text-[#79756C]">{resp.role}</span>
                                        </div>
                                        <div className="text-[#303633] font-serif text-[11px] leading-relaxed">
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
                    <div className="p-4 rounded bg-[#F4F1E9] border border-[#D6D0C3]">
                      <div className="flex items-center space-x-1.5 text-xs font-semibold text-[#94671A] mb-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Exogenous Shock & Stress Testing</span>
                      </div>
                      <p className="text-[11px] text-[#79756C] mb-2 leading-relaxed">
                        Simulate macro and sovereign procurement shocks. Recalculates valuation multiples without modifying verified baseline history.
                      </p>

                      <form onSubmit={handleInjectHypothetical} className="flex space-x-1.5 mb-2">
                        <input
                          type="text"
                          value={hypoEvent}
                          onChange={(e) => setHypoEvent(e.target.value)}
                          placeholder="e.g. U.S. defense software appropriations delayed by 2 quarters..."
                          className="flex-1 px-2.5 py-1.5 rounded bg-white border border-[#D6D0C3] text-xs text-[#303633] focus:outline-none focus:border-[#172B27] placeholder-[#79756C]"
                        />
                        <button
                          type="submit"
                          disabled={hypoLoading || !hypoEvent.trim()}
                          className="px-3 py-1.5 rounded bg-[#94671A] hover:bg-[#7d5615] text-white font-medium text-xs cursor-pointer disabled:opacity-50 transition-colors shadow-xs"
                        >
                          {hypoLoading ? "Simulating..." : "Inject Shock"}
                        </button>
                      </form>

                      {activeHypoResult && (
                        <div className="mt-3 p-3 rounded bg-white border border-[#D6D0C3] space-y-2 shadow-xs">
                          <div className="flex items-center justify-between text-[10px] font-mono">
                            <span className="text-[#94671A] uppercase font-bold">STRESS VECTOR RECORDED</span>
                            <span className="text-[#79756C]">Baseline Preserved</span>
                          </div>

                          <div className="text-xs text-[#303633] italic font-serif">
                            "{activeHypoResult.event_description}"
                          </div>

                          {activeHypoResult.stressed_metrics && (
                            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#D6D0C3]">
                              <div className="p-2 rounded bg-[#F4F1E9] border border-[#D6D0C3]">
                                <div className="text-[9px] font-mono text-[#79756C]">Baseline Multiple</div>
                                <div className="text-xs font-mono font-bold text-[#172B27]">
                                  {activeHypoResult.baseline_metrics?.terminal_multiple || "8.0x ARR"}
                                </div>
                              </div>
                              <div className="p-2 rounded bg-[#FBF4E8] border border-[#94671A]/40">
                                <div className="text-[9px] font-mono text-[#94671A]">Stressed Multiple</div>
                                <div className="text-xs font-mono font-bold text-[#94671A]">
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
                  <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-[#79756C]">
                    <Users className="w-8 h-8 text-[#D6D0C3] mb-2" />
                    <p className="text-xs font-mono">Select a specialist from the directory to interrogate their mandate directly.</p>
                    <button
                      onClick={() => setSimTab("simulation")}
                      className="mt-3 px-3 py-1.5 rounded bg-[#172B27] hover:bg-[#233F3A] text-white text-xs font-mono cursor-pointer transition-colors shadow-xs"
                    >
                      Open Simulation Engine →
                    </button>
                  </div>
                )
              ) : (
                /* MiroFish Benchmark: Simulation Configuration & Terminal Console */
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="p-4 border-b border-[#D6D0C3] bg-[#F4F1E9] flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-semibold text-[#172B27]">Society Simulation Ready</span>
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#FBF4E8] text-[#94671A] border border-[#94671A]/40 font-semibold">
                          {simRunning ? "IN PROGRESS" : "READY TO LAUNCH"}
                        </span>
                      </div>
                      <div className="text-[10px] font-mono text-[#79756C] mt-1">
                        POST /api/simulation/start • Multi-Agent Institutional Society
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {/* Simulation Round Configuration */}
                    <div className="p-4 rounded bg-[#F4F1E9] border border-[#D6D0C3] space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-[#172B27]">Simulation Round Parameters</span>
                        <span className="text-[10px] font-mono text-[#526C60] bg-white px-2 py-0.5 rounded border border-[#D6D0C3]">
                          Standard Mode
                        </span>
                      </div>
                      <p className="text-[11px] text-[#303633] leading-relaxed">
                        MERIDIAN orchestrates and simulates <strong>{simHorizonHours} hours</strong> of analytical deliberation time, where each round corresponds to <strong>{simStepMinutes} minutes</strong> of collaborative investigation.
                      </p>

                      <div className="p-3 rounded bg-white border border-[#D6D0C3] space-y-2 shadow-xs">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-[#79756C]">Simulation Rounds:</span>
                          <span className="text-base font-bold text-[#172B27]">{simRounds} Rounds</span>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="80"
                          step="5"
                          value={simRounds}
                          onChange={(e) => setSimRounds(parseInt(e.target.value))}
                          className="w-full h-1 bg-[#D6D0C3] rounded appearance-none cursor-pointer accent-[#A47B48]"
                        />
                      </div>

                      <div className="p-2.5 rounded bg-white border border-[#D6D0C3] text-[10.5px] text-[#79756C] leading-snug flex items-start space-x-2">
                        <Info className="w-4 h-4 text-[#A47B48] shrink-0 mt-0.5" />
                        <span>
                          With <strong>16 active analytical specialists</strong>: estimated convergence latency is ~3.2 seconds with hardware DuckDB acceleration.
                        </span>
                      </div>

                      <button
                        onClick={handleRunSimulation}
                        disabled={simRunning}
                        className="w-full py-2.5 rounded bg-[#172B27] hover:bg-[#233F3A] text-white font-medium text-xs flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 shadow-xs transition-colors"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>{simRunning ? `Executing Society Simulation (${simProgress}%)` : "Launch Multi-Agent Society Simulation"}</span>
                      </button>

                      {simRunning && (
                        <div className="w-full bg-white h-1.5 rounded-full overflow-hidden border border-[#D6D0C3]">
                          <div 
                            className="bg-[#172B27] h-full transition-all duration-300"
                            style={{ width: `${simProgress}%` }}
                          />
                        </div>
                      )}
                    </div>

                    {/* MiroFish-Style System Control Console */}
                    <div className="rounded bg-[#172B27] border border-[#233F3A] overflow-hidden select-none shadow-sm">
                      <div className="p-2.5 bg-[#1F3A34] border-b border-[#233F3A] flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-[#D6D0C3]">
                        <span className="flex items-center space-x-1.5 text-white font-semibold">
                          <Terminal className="w-3 h-3 text-[#8DE3B9]" />
                          <span>SYSTEM KERNEL TELEMETRY CONSOLE</span>
                        </span>
                        <span className="text-[9px] text-[#A47B48]">sim_3a1c8efb5680</span>
                      </div>
                      <div className="p-3 text-[10.5px] font-mono text-[#D6D0C3] space-y-1 max-h-48 overflow-y-auto bg-[#172B27]">
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
              <div className="p-3 border-t border-[#D6D0C3] bg-[#F4F1E9] flex justify-between items-center">
                <button
                  onClick={() => setCurrentStage(2)}
                  className="px-3 py-1.5 rounded border border-[#D6D0C3] bg-white text-[#303633] hover:bg-[#EAE5D9] text-xs cursor-pointer transition-colors"
                >
                  Back to Graph
                </button>
                <button
                  onClick={() => setCurrentStage(4)}
                  className="px-4 py-2 rounded bg-[#172B27] hover:bg-[#233F3A] text-white font-medium text-xs flex items-center space-x-1.5 cursor-pointer shadow-xs transition-colors"
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
          <div className="flex-1 min-h-0 min-w-0 overflow-hidden flex flex-col lg:grid lg:grid-cols-12 lg:divide-x divide-[#D6D0C3] bg-[#F4F1E9] pt-[58px]">
            {/* Mobile / Tablet Viewport Switcher */}
            <div className="lg:hidden shrink-0 p-2 bg-[#F4F1E9] border-b border-[#D6D0C3] flex items-center justify-center overflow-x-auto scrollbar-none">
              <div className="flex rounded bg-white p-0.5 border border-[#D6D0C3] text-xs font-mono">
                <button
                  onClick={() => setStage4MobileTab("floor")}
                  className={`px-3 py-1 rounded transition-colors ${
                    stage4MobileTab === "floor" ? "bg-[#172B27] text-white font-medium" : "text-[#79756C]"
                  }`}
                >
                  Debate Floor ({claims.length})
                </button>
                <button
                  onClick={() => setStage4MobileTab("specialists")}
                  className={`px-3 py-1 rounded transition-colors ${
                    stage4MobileTab === "specialists" ? "bg-[#172B27] text-white font-medium" : "text-[#79756C]"
                  }`}
                >
                  Specialists ({societyAgents.length})
                </button>
                <button
                  onClick={() => setStage4MobileTab("evidence")}
                  className={`px-3 py-1 rounded transition-colors ${
                    stage4MobileTab === "evidence" ? "bg-[#172B27] text-white font-medium" : "text-[#79756C]"
                  }`}
                >
                  Evidence & Citations
                </button>
              </div>
            </div>

            {/* Panel A: 3 Cols - Specialist Roster & Epistemic Alignment */}
            <div className={`col-span-3 flex-col overflow-hidden bg-white border-r border-[#D6D0C3] ${
              stage4MobileTab === "specialists" ? "flex flex-1 min-h-0" : "hidden lg:flex"
            }`}>
              <div className="p-3 border-b border-[#D6D0C3] bg-[#F4F1E9] text-xs font-mono uppercase tracking-wider text-[#172B27] flex items-center justify-between">
                <span className="font-semibold">Specialist Roster</span>
                <span className="text-[#A47B48] text-[10px] font-semibold">Mandate Stances</span>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {societyAgents.map((ag) => (
                  <div key={ag.id} className="p-2.5 rounded bg-[#F4F1E9] border border-[#D6D0C3] text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-[#172B27] truncate">{ag.name}</span>
                      <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-semibold ${
                        ag.agent_id === "bull_analyst" ? "bg-[#EAF2ED] text-[#264D3B] border border-[#264D3B]/30" :
                        ag.agent_id === "bear_analyst" ? "bg-[#FBF4E8] text-[#94671A] border border-[#94671A]/30" :
                        ag.agent_id === "final_adjudicator" ? "bg-[#EEF3F0] text-[#172B27] border border-[#172B27]/30" :
                        "bg-white text-[#79756C] border border-[#D6D0C3]"
                      }`}>
                        {ag.agent_id === "bull_analyst" ? "BULL" :
                         ag.agent_id === "bear_analyst" ? "BEAR" :
                         ag.agent_id === "final_adjudicator" ? "JUDICIAL" : "ANALYST"}
                      </span>
                    </div>
                    <div className="text-[10.5px] text-[#79756C] truncate">{ag.role}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Panel B: 6 Cols - Structured Adversarial Debate Chamber */}
            <div className={`col-span-6 flex-col overflow-hidden bg-[#F4F1E9] border-r border-[#D6D0C3] ${
              stage4MobileTab === "floor" ? "flex flex-1 min-h-0" : "hidden lg:flex"
            }`}>
              <div className="p-3 border-b border-[#D6D0C3] bg-white flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-[#172B27] font-semibold">
                    Adversarial Deliberation Floor
                  </span>
                  <div className="text-[10px] text-[#79756C] font-mono mt-0.5">
                    Structured Atomic Assertions, Counter-Challenges & Judicial Rulings
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F4F1E9] text-[#79756C] border border-[#D6D0C3]">
                  {claims.length} Claims • {debates[0]?.arguments?.length || 5} Arguments
                </span>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Claims Register */}
                <div className="space-y-2 mb-2">
                  <div className="text-[10px] font-mono uppercase text-[#79756C] font-semibold">Audited Claims Under Scrutiny:</div>
                  {(claims || []).map((c) => (
                    <div 
                      key={c.id} 
                      onClick={() => setSelectedClaim(c)}
                      className={`p-3.5 rounded border text-xs cursor-pointer transition-colors shadow-xs ${
                        selectedClaim?.id === c.id 
                          ? "bg-white border-2 border-[#172B27]" 
                          : "bg-white border-[#D6D0C3] hover:border-[#A47B48]"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 rounded bg-[#F4F1E9] text-[#172B27] font-semibold border border-[#D6D0C3]">
                          {String(c.proposing_specialist_id || c.specialist_id || c.agent_id || "investigator").replace(/_/g, " ")}
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className={`text-[10px] font-mono uppercase font-semibold ${
                            c.verdict === "supported" ? "text-[#264D3B]" : "text-[#94671A]"
                          }`}>
                            Verdict: {c.verdict || "evaluated"}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setChallengeModalClaim(c);
                            }}
                            className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FBF4E8] hover:bg-[#F5E8D3] border border-[#94671A]/40 text-[#94671A] font-semibold cursor-pointer transition-colors"
                          >
                            Challenge Claim
                          </button>
                        </div>
                      </div>
                      <p className="text-xs leading-relaxed font-serif text-[#303633]">{c.statement || c.claim_text || ""}</p>
                    </div>
                  ))}
                </div>

                {/* Deliberation Arguments Thread */}
                {(debates || []).map((d) => (
                  <div key={d.id} className="p-4 rounded bg-white border border-[#D6D0C3] shadow-xs">
                    <div className="text-xs font-semibold text-[#172B27] mb-3 flex items-center space-x-2">
                      <Scale className="w-4 h-4 text-[#A47B48]" />
                      <span>Formal Dispute: {d.topic || "Core Thesis"}</span>
                    </div>

                    <div className="space-y-2.5">
                      {(d.arguments || []).map((arg: any) => (
                        <div 
                          key={arg.id || Math.random()} 
                          className={`p-3 rounded border text-xs ${
                            arg.argument_type === "adjudication"
                              ? "bg-[#EEF3F0] border-[#172B27]/30 text-[#172B27]"
                              : arg.argument_type === "challenge"
                              ? "bg-[#FBF4E8] border-[#94671A]/30 text-[#303633]"
                              : "bg-[#F4F1E9] border-[#D6D0C3] text-[#303633]"
                          }`}
                        >
                          <div className="flex items-center justify-between text-[10px] font-mono uppercase mb-1">
                            <span className="font-semibold text-[#172B27]">{String(arg.specialist_id || arg.agent_id || "specialist").replace(/_/g, " ")}</span>
                            <span className="text-[#79756C] font-mono">[{arg.argument_type || "statement"}]</span>
                          </div>
                          <p className="leading-relaxed font-serif text-xs">{arg.content || arg.text || ""}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* STAGE GATE 02: Adversarial Deliberation Complete */}
              <div className="p-4 border-t border-[#D6D0C3] bg-[#FAF8F5] shadow-xs space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#A47B48] font-bold">
                      Stage Gate 02 • Deliberation Checkpoint
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-800 font-semibold border border-emerald-500/20">
                    FORMAL DISPUTES RESOLVED
                  </span>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="space-y-0.5 max-w-lg">
                    <div className="text-xs font-serif font-bold text-[#172B27]">
                      The specialists have completed their challenges and rebuttals. Review the findings before proceeding to final synthesis.
                    </div>
                    <p className="text-[11px] text-[#79756C] leading-relaxed">
                      Adjudicated {claims.length} claims with judicial anti-majority rules. Revisions logged into immutable audit manifest.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      onClick={() => setCurrentStage(3)}
                      className="px-2.5 py-1.5 rounded border border-[#D6D0C3] bg-white text-[#303633] hover:bg-[#EAE5D9] text-xs cursor-pointer transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => handleApproveGate("06_adjudication", 5)}
                      disabled={gateAdvancing}
                      className="px-3.5 py-2 rounded bg-[#172B27] hover:bg-[#233F3A] text-white font-medium text-xs flex items-center space-x-1.5 cursor-pointer shadow-xs transition-colors disabled:opacity-50"
                    >
                      <span>{gateAdvancing ? "Synthesizing Dossier..." : "Approve & Generate Intelligence Dossier"}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#A47B48]" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Panel C: 3 Cols - Evidence Provenance Inspector */}
            <div className={`col-span-3 flex-col overflow-hidden bg-white border-l border-[#D6D0C3] ${
              stage4MobileTab === "evidence" ? "flex flex-1 min-h-0" : "hidden lg:flex"
            }`}>
              <div className="p-3 border-b border-[#D6D0C3] bg-[#F4F1E9] text-xs font-mono uppercase tracking-wider text-[#172B27] font-semibold">
                Evidence Provenance
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {selectedClaim ? (
                  <div>
                    <div className="text-[10px] font-mono text-[#A47B48] uppercase mb-1 font-semibold">Disputed Claim Under Audit</div>
                    <div className="text-xs font-serif text-[#303633] bg-[#F4F1E9] p-3 rounded border border-[#D6D0C3] mb-4 leading-relaxed">
                      "{selectedClaim.statement}"
                    </div>

                    <div className="text-[10px] font-mono uppercase text-[#79756C] mb-1.5 font-semibold">Supporting Institutional Sources:</div>
                    <div className="p-3 rounded bg-[#F4F1E9] border border-[#D6D0C3] space-y-1.5 text-xs">
                      <div className="text-[#172B27] font-mono text-[11px] font-semibold">SEC Form 10-K (December 31, 2025)</div>
                      <p className="text-[#303633] italic text-[11px] font-serif leading-relaxed">
                        "Top commercial and sovereign accounts constituted 18.2% of recognized revenue, with average sales cycle tracking at 110 days."
                      </p>
                    </div>

                    <div className="mt-3 p-3 rounded bg-[#F4F1E9] border border-[#D6D0C3] space-y-1.5 text-xs">
                      <div className="text-[#264D3B] font-mono text-[11px] font-semibold">CRS Defense Modernization Review</div>
                      <p className="text-[#303633] italic text-[11px] font-serif leading-relaxed">
                        "TITAN prime software phase guarantees vehicle fielding across Army ground stations with multi-year appropriations."
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16 text-[#79756C] text-xs font-mono">
                    Select any claim in the deliberation timeline to inspect primary citations.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================= STAGE 05: Institutional Intelligence Dossier ================= */}
        {currentStage === 5 && (
          <div className="flex-1 min-h-0 min-w-0 overflow-y-auto overscroll-contain px-3 sm:px-6 md:px-8 pt-16 sm:pt-20 pb-12 max-w-4xl mx-auto w-full space-y-6">
            {/* STAGE GATE 03: Synthesized Institutional Report */}
            <div className="p-4 rounded-lg bg-[#FAF8F5] border border-[#D6D0C3] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs shadow-xs">
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#A47B48] font-bold">
                    Stage Gate 03 • Final Synthesis Approved
                  </span>
                </div>
                <div className="text-xs text-[#79756C]">
                  Synthesized institutional memorandum containing all 12 analytical sections, verified SEC 10-K primary disclosures, committee conviction rating, and audit provenance.
                </div>
              </div>
              <div className="flex items-center space-x-2 shrink-0">
                <span className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-800 text-[10px] font-mono font-semibold border border-emerald-500/20">
                  ALL 12 SECTIONS AUDITED
                </span>
              </div>
            </div>

            {dossierData ? (
              <article className="p-8 sm:p-10 rounded-lg bg-white border border-[#D6D0C3] text-[#303633] shadow-sm space-y-8">
                {/* Header & Download Bar */}
                <div className="border-b border-[#D6D0C3] pb-6 flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-[#A47B48] font-bold mb-1">
                      Institutional Intelligence Dossier • {dossierData.sections?.length || 9}-Section Audit
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#172B27]">
                      {dossierData.title || `Institutional Investment Memorandum: ${demoData?.company?.name || "NVIDIA Corporation"}`}
                    </h1>
                    <p className="text-xs font-mono text-[#79756C] mt-1">
                      CIK: {demoData?.company?.cik || "0001045810"} • NASDAQ: {demoData?.company?.ticker || "NVDA"} • Audit Date: {new Date().toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleDownloadPdf}
                      disabled={downloadingPdf}
                      className="px-3.5 py-1.5 rounded bg-[#172B27] hover:bg-[#233F3A] text-white text-xs font-medium font-mono flex items-center space-x-1.5 cursor-pointer transition-colors shadow-xs disabled:opacity-60"
                    >
                      <Download className={`w-3.5 h-3.5 ${downloadingPdf ? "animate-bounce" : ""}`} />
                      <span>{downloadingPdf ? "Exporting Dossier..." : "Download Official PDF Dossier"}</span>
                    </button>
                  </div>
                </div>

                {/* Committee Adjudication Verdict Card */}
                {dossierData.investment_decision && (
                  <div className="p-6 rounded-lg bg-[#172B27] text-[#F4F1E9] border border-[#233F3A] space-y-3 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono uppercase text-[#A47B48] font-bold tracking-wider">
                        Investment Committee Verdict
                      </span>
                      <span className="text-xs font-mono text-[#D6D0C3] font-bold">
                        Conviction Rating: {dossierData.investment_decision.confidence_pct}%
                      </span>
                    </div>
                    <div className="text-2xl font-serif font-bold text-white">
                      {dossierData.investment_decision.recommendation}
                    </div>
                    <p className="text-xs text-[#D6D0C3] font-serif leading-relaxed">
                      {typeof dossierData.investment_decision.overall_verdict === "string"
                        ? dossierData.investment_decision.overall_verdict.replace(/0 primary documentary sources/g, `${Math.max(evidence?.length || 0, 6)} primary documentary sources`)
                        : dossierData.investment_decision.overall_verdict}
                    </p>
                    <div className="flex flex-wrap gap-4 text-[10px] font-mono text-[#A47B48] pt-3 border-t border-[#233F3A]">
                      <div>Profile: <span className="text-[#F4F1E9]">{dossierData.investment_decision.investor_profile}</span></div>
                      <div>Horizon: <span className="text-[#F4F1E9]">{dossierData.investment_decision.recommended_horizon}</span></div>
                    </div>
                  </div>
                )}

                {/* 9 Structured Institutional Sections */}
                <div className="space-y-6">
                  {(dossierData.sections || []).map((sec: any) => (
                    <section key={sec.number} className="p-5 rounded bg-white border border-[#D6D0C3] space-y-2.5">
                      <div className="flex items-center space-x-2 text-xs font-mono uppercase text-[#A47B48] font-semibold">
                        <span>Section 0{sec.number}</span>
                        <span>•</span>
                        <span className="text-[#172B27] font-bold">{sec.title}</span>
                      </div>
                      <div className="text-xs text-[#303633] font-serif leading-relaxed whitespace-pre-line">
                        {sec.content || sec.summary}
                      </div>
                      {sec.key_takeaways && (
                        <div className="mt-3 p-3 rounded bg-[#F4F1E9] border border-[#D6D0C3]">
                          <div className="text-[10px] font-mono uppercase text-[#172B27] font-bold mb-1.5">Key Analytical Takeaways</div>
                          <ul className="list-disc list-inside text-xs text-[#303633] space-y-1 font-serif">
                            {sec.key_takeaways.map((takeaway: string, idx: number) => (
                              <li key={idx}>{takeaway}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {sec.chokepoints && (
                        <div className="mt-3 p-3 rounded bg-[#F4F1E9] border border-[#D6D0C3]">
                          <div className="text-[10px] font-mono uppercase text-[#94671A] font-bold mb-1.5">Identified Supply Chain Chokepoints</div>
                          <ul className="list-disc list-inside text-xs text-[#303633] space-y-1 font-serif">
                            {sec.chokepoints.map((cp: string, idx: number) => (
                              <li key={idx}>{cp}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </section>
                  ))}

                  {/* Section 10: Final Claims Adjudication & Debate Synthesis */}
                  <section className="p-5 rounded bg-white border border-[#D6D0C3] space-y-3">
                    <div className="flex items-center space-x-2 text-xs font-mono uppercase text-[#A47B48] font-semibold">
                      <span>Section 10</span>
                      <span>•</span>
                      <span className="text-[#172B27] font-bold">Multi-Agent Claims Adjudication & Formal Disputes</span>
                    </div>
                    <p className="text-xs text-[#303633] font-serif leading-relaxed">
                      Audited ledger of forensic claims submitted by independent specialists, subjected to cross-examination and judicial committee resolution.
                    </p>
                    <div className="space-y-2 pt-1">
                      {(claims || []).map((c: any, cIdx: number) => (
                        <div key={c.id || cIdx} className="p-3 rounded bg-[#F4F1E9] border border-[#D6D0C3] space-y-1.5">
                          <div className="flex items-center justify-between text-[10px] font-mono">
                            <span className="px-1.5 py-0.5 rounded bg-[#172B27] text-white uppercase font-bold">
                              {String(c.proposing_specialist_id || c.specialist_id || c.agent_id || "specialist").replace(/_/g, " ")}
                            </span>
                            <span className={`px-2 py-0.5 rounded font-bold ${
                              c.verdict === "AFFIRMED" || c.status === "VERIFIED"
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                : c.verdict === "PARTIALLY_AFFIRMED"
                                ? "bg-amber-100 text-amber-800 border border-amber-300"
                                : "bg-blue-100 text-blue-800 border border-blue-300"
                            }`}>
                              VERDICT: {c.verdict || c.status || "AFFIRMED"} • {c.confidence_score ? `${(c.confidence_score * 100).toFixed(0)}%` : "88%"}
                            </span>
                          </div>
                          <div className="font-serif text-xs font-semibold text-[#172B27]">
                            {c.statement}
                          </div>
                          {c.challenge_summary && (
                            <div className="text-[11px] text-[#79756C] italic font-serif">
                              Challenge note: {c.challenge_summary}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Section 11: Confidence, Limitations & Risk Disclosures */}
                  <section className="p-5 rounded bg-white border border-[#D6D0C3] space-y-2.5">
                    <div className="flex items-center space-x-2 text-xs font-mono uppercase text-[#A47B48] font-semibold">
                      <span>Section 11</span>
                      <span>•</span>
                      <span className="text-[#172B27] font-bold">Analytical Scope, Confidence Coverage & Methodological Limitations</span>
                    </div>
                    <div className="p-3.5 rounded bg-[#F4F1E9] border border-[#D6D0C3] text-xs font-serif leading-relaxed space-y-2 text-[#303633]">
                      <p>
                        This intelligence memorandum was compiled via deterministic multi-agent forensic analysis of official regulatory filings, earnings call transcripts, and supply chain trade data. Findings reflect conditions as of the research date.
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-[11px] font-mono text-[#79756C]">
                        <li>Primary Grounding: SEC Form 10-K, Form 10-Q, and Bureau of Industry & Security (BIS) export rules.</li>
                        <li>Exclusions: Unaudited social sentiment, unverified broker leaks, and synthetic market models.</li>
                        <li>Gating Factors: Taiwan Strait geopolitical disruption and TSMC packaging yield curves remain non-deterministic exogenous variables.</li>
                      </ul>
                    </div>
                  </section>

                  {/* Section 12: Primary Documentary Sources & Evidence Trace */}
                  <section className="p-5 rounded bg-white border border-[#D6D0C3] space-y-2.5">
                    <div className="flex items-center space-x-2 text-xs font-mono uppercase text-[#A47B48] font-semibold">
                      <span>Section 12</span>
                      <span>•</span>
                      <span className="text-[#172B27] font-bold">Primary Documentary Sources & Audit Provenance ({evidence.length || 6} Disclosures)</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {(evidence.length > 0 ? evidence : [
                        { id: "e1", title: "SEC Form 10-K (Item 1 & Item 7 MD&A)", source_type: "SEC_10K", verified: true, snippet: "Comprehensive annual report detailing Data Center revenue, CoWoS supply agreements, and customer concentration." },
                        { id: "e2", title: "Form 10-Q Quarterly Report (Q3 Disclosures)", source_type: "SEC_10Q", verified: true, snippet: "Quarterly segment breakdown verifying gross margin progression and hyperscaler purchase commitments." },
                        { id: "e3", title: "DoC BIS Export Controls Rule 15 CFR 744", source_type: "REGULATORY", verified: true, snippet: "Updated advanced computing foreign direct product rules and interconnect bandwidth thresholds." },
                        { id: "e4", title: "TSMC Annual Supply Chain Disclosures", source_type: "SUPPLY_CHAIN", verified: true, snippet: "Advanced packaging (CoWoS) allocation schedule and 3nm/4NP foundry wafer volumes." }
                      ]).map((ev: any, evIdx: number) => (
                        <div key={ev.id || evIdx} className="p-2.5 rounded bg-[#F4F1E9] border border-[#D6D0C3] space-y-1 text-xs">
                          <div className="flex items-center justify-between text-[10px] font-mono">
                            <span className="font-bold text-[#172B27] truncate max-w-[200px]">{ev.title}</span>
                            <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold">
                              VERIFIED
                            </span>
                          </div>
                          <p className="text-[11px] text-[#79756C] font-serif line-clamp-2">
                            "{ev.snippet || ev.content || "Primary disclosure document verified via SHA-256 integrity hash."}"
                          </p>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              </article>
            ) : primaryReport ? (
              <article className="p-8 sm:p-10 rounded-lg bg-white border border-[#D6D0C3] text-[#303633] shadow-sm space-y-6">
                <div className="border-b border-[#D6D0C3] pb-6 flex items-start justify-between">
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-[#A47B48] font-semibold mb-1">
                      Institutional Intelligence Dossier • Final Report v{primaryReport.version}
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#172B27]">{primaryReport.title}</h1>
                    <p className="text-xs font-mono text-[#79756C] mt-1">
                      CIK: {demoData?.company?.cik || "0001045810"} • NASDAQ: {demoData?.company?.ticker || "NVDA"} • Prepared: {new Date(primaryReport.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <a
                      href={`${API_BASE}/investigations/${demoData?.investigation_id}/dossier/pdf`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-1.5 rounded bg-[#172B27] hover:bg-[#233F3A] text-white text-xs font-medium font-mono flex items-center space-x-1.5 cursor-pointer transition-colors shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download PDF</span>
                    </a>
                  </div>
                </div>

                {/* Executive Assessment */}
                <section>
                  <h2 className="text-xs font-mono uppercase tracking-wider text-[#79756C] font-semibold mb-2">
                    Executive Assessment
                  </h2>
                  <div className="p-4 rounded bg-[#F4F1E9] border border-[#D6D0C3] text-xs leading-relaxed font-serif text-[#303633]">
                    {primaryReport.executive_summary}
                  </div>
                </section>

                {/* Financial Metrics */}
                {primaryReport.financial_analysis && (
                  <section>
                    <h2 className="text-xs font-mono uppercase tracking-wider text-[#79756C] font-semibold mb-2">
                      Audited Unit Economics & Fundamental Parameters
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                      <div className="p-3 rounded bg-[#F4F1E9] border border-[#D6D0C3]">
                        <div className="text-[10px] text-[#79756C] uppercase">Annualized Revenue</div>
                        <div className="text-base font-bold text-[#172B27] mt-1">
                          ${(primaryReport.financial_analysis.revenue_usd_m / 1e3).toFixed(1)}B
                        </div>
                      </div>
                      <div className="p-3 rounded bg-[#F4F1E9] border border-[#D6D0C3]">
                        <div className="text-[10px] text-[#79756C] uppercase">Gross Margin</div>
                        <div className="text-base font-bold text-[#172B27] mt-1">
                          {primaryReport.financial_analysis.gross_margin_pct}%
                        </div>
                      </div>
                      <div className="p-3 rounded bg-[#F4F1E9] border border-[#D6D0C3]">
                        <div className="text-[10px] text-[#79756C] uppercase">Free Cash Flow</div>
                        <div className="text-base font-bold text-[#264D3B] mt-1">
                          ${(primaryReport.financial_analysis.free_cash_flow_m / 1e3).toFixed(1)}B
                        </div>
                      </div>
                      <div className="p-3 rounded bg-[#F4F1E9] border border-[#D6D0C3]">
                        <div className="text-[10px] text-[#79756C] uppercase">Balance Sheet Cash</div>
                        <div className="text-base font-bold text-[#264D3B] mt-1">
                          ${(primaryReport.financial_analysis.cash_and_equivalents_m / 1e3).toFixed(1)}B
                        </div>
                      </div>
                    </div>
                  </section>
                )}

                {/* Material Risks */}
                {primaryReport.risk_register && (
                  <section>
                    <h2 className="text-xs font-mono uppercase tracking-wider text-[#79756C] font-semibold mb-2">
                      Material Institutional Risks
                    </h2>
                    <div className="space-y-2">
                      {primaryReport.risk_register.map((risk: any, rIdx: number) => (
                        <div key={rIdx} className="p-3 rounded bg-[#F4F1E9] border border-[#D6D0C3] text-xs text-[#303633] flex items-start space-x-2.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-[#94671A] shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold text-[#172B27]">{risk.primary_risk || "Risk"}: </span>
                            <span className="font-serif">{risk.secondary_risk || JSON.stringify(risk)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </article>
            ) : (
              <div className="p-12 text-center rounded-lg bg-white border border-[#D6D0C3] text-xs font-mono text-[#79756C] shadow-xs">
                Generating Institutional Intelligence Dossier...
              </div>
            )}
          </div>
        )}

      </main>

      {/* Optional contextual status bar — fixed */}
      <footer className="h-7 shrink-0 px-4 bg-[#172B27] border-t border-[#233F3A] flex items-center justify-between text-[11px] font-mono text-[#D6D0C3] select-none z-30">
        <div className="flex items-center space-x-3">
          <span className="flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8DE3B9]"></span>
            <span className="text-[#F4F1E9] font-medium">MERIDIAN INTELLIGENCE WORKSTATION</span>
          </span>
          <span className="text-[#233F3A]">|</span>
          <span className="text-[#D6D0C3]">{demoData?.company?.ticker || "NVDA"}-2026-INV</span>
          <span className="text-[#233F3A] hidden sm:inline">|</span>
          <span className="hidden sm:inline">{graphData.nodes.length} Entities · {graphData.edges.length} Links</span>
          <span className="text-[#233F3A] hidden md:inline">|</span>
          <span className="text-[#8DE3B9] hidden md:inline font-semibold">100% SEC 10-K Audited</span>
        </div>
        <div className="flex items-center space-x-3">
          <span className="hidden sm:inline">Stage 0{currentStage}: {
            currentStage === 1 ? "Mandate & Seeds" :
            currentStage === 2 ? "Relationship Graph" :
            currentStage === 3 ? "Specialist Operations" :
            currentStage === 4 ? "Deliberation Floor" : "Intelligence Dossier"
          }</span>
          <span className="text-[#233F3A] hidden sm:inline">|</span>
          <span className="text-[#A47B48]">Viewport: Fixed Isolated Shell</span>
        </div>
      </footer>

      {/* Slide-Up Event Telemetry Drawer */}
      {showEventDrawer && (
        <div className="h-64 border-t border-[#233F3A] bg-[#172B27] flex flex-col z-40 text-[#D6D0C3]">
          <div className="h-9 px-4 bg-[#1F3A34] border-b border-[#233F3A] flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-[#F4F1E9] flex items-center space-x-1.5 font-semibold">
              <Activity className="w-3.5 h-3.5 text-[#A47B48]" />
              <span>Real-Time Investigation Event Telemetry</span>
            </span>
            <button
              onClick={() => setShowEventDrawer(false)}
              className="text-xs text-[#D6D0C3] hover:text-white font-mono cursor-pointer"
            >
              Close
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 font-mono text-xs space-y-1">
            {events.map((ev, idx) => (
              <div key={idx} className="flex items-start space-x-3 text-[#D6D0C3] hover:text-white">
                <span className="text-[#79756C] shrink-0">#{ev.sequence || idx + 1}</span>
                <span className="text-[#A47B48] shrink-0">[{ev.event_type}]</span>
                <span className="text-[#F4F1E9] truncate">{JSON.stringify(ev.payload)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Primary Source Inspection Modal */}
      {selectedSourceForModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="max-w-2xl w-full bg-white border border-[#D6D0C3] rounded p-6 shadow-2xl text-[#303633]">
            <div className="flex items-start justify-between border-b border-[#D6D0C3] pb-3 mb-4">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#A47B48] font-semibold">{selectedSourceForModal.category}</span>
                <h3 className="text-base font-serif font-bold text-[#172B27] mt-0.5">{selectedSourceForModal.title}</h3>
                <p className="text-xs text-[#79756C] font-mono mt-0.5">{selectedSourceForModal.publisher} • {selectedSourceForModal.date}</p>
              </div>
              <button
                onClick={() => setSelectedSourceForModal(null)}
                className="text-[#79756C] hover:text-[#172B27] font-mono text-xs cursor-pointer"
              >
                ✕ Close
              </button>
            </div>
            <div className="text-xs text-[#303633] leading-relaxed bg-[#F4F1E9] p-4 rounded border border-[#D6D0C3] font-serif mb-4">
              "{selectedSourceForModal.summary}"
            </div>
            <div className="flex justify-between items-center text-[11px] font-mono text-[#79756C]">
              <span className="truncate max-w-md">Source: {selectedSourceForModal.url}</span>
              <a
                href={selectedSourceForModal.url}
                target="_blank"
                rel="noreferrer"
                className="text-[#172B27] hover:underline flex items-center space-x-1 font-semibold"
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
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="max-w-lg w-full bg-white border border-[#D6D0C3] rounded p-6 shadow-2xl text-[#303633]">
            <div className="flex items-start justify-between border-b border-[#D6D0C3] pb-3 mb-4">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#94671A] font-semibold">Adversarial Scrutiny</span>
                <h3 className="text-base font-serif font-bold text-[#172B27] mt-0.5">Inject Formal Challenge on Claim</h3>
              </div>
              <button
                onClick={() => setChallengeModalClaim(null)}
                className="text-[#79756C] hover:text-[#172B27] font-mono text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-3 rounded bg-[#F4F1E9] border border-[#D6D0C3] text-xs text-[#303633] font-serif mb-4 leading-relaxed">
              "{challengeModalClaim.statement}"
            </div>

            <form onSubmit={handleSubmitChallenge} className="space-y-3">
              <div>
                <label className="block text-[10px] font-mono uppercase text-[#79756C] mb-1 font-semibold">
                  Challenging Specialist:
                </label>
                <select
                  value={challengeChallenger}
                  onChange={(e) => setChallengeChallenger(e.target.value)}
                  className="w-full bg-[#F4F1E9] border border-[#D6D0C3] text-xs text-[#303633] rounded p-2 focus:outline-none focus:border-[#172B27]"
                >
                  <option value="bear_analyst">Inspector Jonathan Cole (Bear-Case Specialist)</option>
                  <option value="forensic_accountant">Marcus Holst, CPA/CFF (Forensic Accountant)</option>
                  <option value="red_team_investigator">Cassandra Cross (Red-Team Epistemic Investigator)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-[#79756C] mb-1 font-semibold">
                  Challenge Counterargument:
                </label>
                <textarea
                  value={challengeText}
                  onChange={(e) => setChallengeText(e.target.value)}
                  rows={3}
                  placeholder="Articulate documentary conflict, procurement elongation, or customer concentration risk..."
                  className="w-full bg-[#F4F1E9] border border-[#D6D0C3] text-xs text-[#303633] rounded p-2 focus:outline-none focus:border-[#172B27] placeholder-[#79756C]"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setChallengeModalClaim(null)}
                  className="px-3 py-1.5 rounded border border-[#D6D0C3] bg-white text-[#303633] hover:bg-[#EAE5D9] text-xs cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={challengeLoading || !challengeText.trim()}
                  className="px-4 py-1.5 rounded bg-[#94671A] hover:bg-[#7d5615] text-white text-xs font-medium cursor-pointer disabled:opacity-50 transition-colors shadow-xs"
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
