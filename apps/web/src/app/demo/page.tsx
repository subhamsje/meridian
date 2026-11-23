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
  Sparkles, 
  Layers, 
  CheckCircle2, 
  Play, 
  Pause,
  RotateCw, 
  ExternalLink,
  MessageSquare,
  ShieldCheck,
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
  TrendingUp,
  TrendingDown,
  Lock,
  Edit3,
  Check,
  ChevronUp,
  ChevronDown,
  Terminal,
  Radio,
  Clock
} from "lucide-react";
import { API_BASE } from "@/lib/utils";
import LivingKnowledgeGraph, { GraphNode, GraphEdge } from "@/components/LivingKnowledgeGraph";

export default function FlagshipDemoPage() {
  const [loading, setLoading] = useState(true);
  const [demoData, setDemoData] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [currentStage, setCurrentStage] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Loaded Subsystems
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
  const [graphSearch, setGraphSearch] = useState("");
  const [graphTypeFilter, setGraphTypeFilter] = useState("ALL");
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<GraphEdge | null>(null);

  // Stage 03: Direct Interrogation
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
    } catch (e) {
      console.error("Subsystems fetch error:", e);
    }
  };

  // Stage 01: Save Mandate
  const handleSaveMandate = async () => {
    if (!demoData || !token) return;
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

  // Stage 03: Direct Interrogation
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
        // Reload interactions & agent profile
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

  // Stage 03: Exogenous Hypothetical Event Injection
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
        // Reload interactions & graph
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
        // Reload debates and claims
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

  // Compute Category Counts for Stage 02 Hierarchy Sidebar
  const entityCategoryCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: graphData.nodes.length };
    graphData.nodes.forEach(n => {
      const t = n.type || "other";
      counts[t] = (counts[t] || 0) + 1;
    });
    return counts;
  }, [graphData.nodes]);

  // Selected Agent's Investigated Entities (for scanner wave highlight on graph)
  const investigatingEntityNames = useMemo(() => {
    if (!selectedAgent) return [];
    const role = selectedAgent.role?.toLowerCase() || "";
    if (role.includes("financial") || role.includes("coordinator")) {
      return ["Palantir", "DoD", "Army", "Commercial"];
    } else if (role.includes("forensic") || role.includes("accounting")) {
      return ["SEC", "BP", "Airbus", "Palantir"];
    } else if (role.includes("technology") || role.includes("product")) {
      return ["AIP", "Gotham", "Foundry", "Apollo", "AWS"];
    } else if (role.includes("bear") || role.includes("risk")) {
      return ["Snowflake", "Databricks", "Booz Allen", "TITAN"];
    } else if (role.includes("bull")) {
      return ["AIP", "Sompo", "Merck", "NHS"];
    }
    return ["Palantir"];
  }, [selectedAgent]);

  // Filtered Agents
  const filteredAgents = useMemo(() => {
    return societyAgents.filter(ag => {
      const s = agentSearch.toLowerCase();
      return ag.name.toLowerCase().includes(s) || 
             ag.role.toLowerCase().includes(s) || 
             ag.specialization.toLowerCase().includes(s);
    });
  }, [societyAgents, agentSearch]);

  const primaryReport = reports[0];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05070c] flex flex-col items-center justify-center text-slate-300">
        <div className="w-12 h-12 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin mb-4 shadow-[0_0_20px_rgba(6,182,212,0.3)]"></div>
        <p className="text-xs font-mono uppercase tracking-widest text-cyan-400">
          Mounting Institutional Society & Living Graph Engine...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05070c] text-[#e2e8f0] flex flex-col font-sans selection:bg-cyan-950 selection:text-cyan-300">
      {/* Top Persistent Flagship Header */}
      <header className="h-16 border-b border-[#162030] bg-[#070b12]/95 backdrop-blur px-6 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-3.5">
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="w-7 h-7 rounded bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center font-mono font-bold text-cyan-400 text-xs shadow-[0_0_12px_rgba(6,182,212,0.25)]">
              M
            </div>
            <span className="font-semibold text-sm tracking-wider uppercase text-slate-100 group-hover:text-cyan-300 transition-colors">
              Meridian
            </span>
          </Link>
          <span className="text-slate-600 font-mono">/</span>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-500/30 uppercase tracking-wider font-semibold">
              FLAGSHIP: PALANTIR TECHNOLOGIES (PLTR)
            </span>
            <span className="flex items-center space-x-1.5 text-[10px] font-mono text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
              <span>LIVING INTELLIGENCE SOCIETY</span>
            </span>
          </div>
        </div>

        {/* 5-Stage Stepper Navigation */}
        <div className="flex items-center space-x-1 bg-[#0b1019] p-1 rounded-lg border border-[#1a2638] text-xs font-medium">
          {[
            { stage: 1, label: "01. Research Seeds", icon: FileText, state: "Completed" },
            { stage: 2, label: "02. Knowledge Graph", icon: Network, state: "Living Constellation" },
            { stage: 3, label: "03. Agent Society", icon: Users, state: "14 Specialists" },
            { stage: 4, label: "04. Boardroom Debate", icon: Scale, state: "Adjudicated" },
            { stage: 5, label: "05. Intelligence Dossier", icon: ShieldCheck, state: "Compiled" },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = currentStage === item.stage;
            return (
              <button
                key={item.stage}
                onClick={() => setCurrentStage(item.stage as any)}
                className={`px-3 py-1.5 rounded transition-all flex items-center space-x-2 cursor-pointer ${
                  isActive
                    ? "bg-cyan-950/90 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.2)]"
                    : "text-slate-400 hover:text-slate-200 hover:bg-[#121a28]"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-cyan-400" : "text-slate-500"}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowEventDrawer(prev => !prev)}
            className={`text-xs px-2.5 py-1.5 rounded border font-mono flex items-center space-x-1.5 transition-all cursor-pointer ${
              showEventDrawer 
                ? "bg-cyan-950 border-cyan-500/40 text-cyan-300" 
                : "bg-[#0b1019] border-[#1a2638] text-slate-400 hover:text-slate-200"
            }`}
            title="Toggle Live Event Stream Drawer"
          >
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>Event Telemetry</span>
            {showEventDrawer ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
          </button>

          <Link
            href="/app"
            className="text-xs px-3.5 py-1.5 rounded bg-[#101724] hover:bg-cyan-950 border border-[#1e2a3c] text-slate-300 hover:text-cyan-300 font-medium transition-all shadow-sm flex items-center space-x-1.5"
          >
            <span>Custom Workspace</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </header>

      {/* Main Flagship Stage Viewer */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        
        {/* ================= STAGE 01: Research Seeds ================= */}
        {currentStage === 1 && (
          <div className="flex-1 overflow-y-auto p-10 max-w-5xl mx-auto w-full">
            <div className="mb-8">
              <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-widest text-cyan-400 mb-1.5">
                <span>Stage 01 • Primary Corporate Disclosures & Research Provenance</span>
              </div>
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-serif font-bold text-slate-100 tracking-tight">
                    Palantir Technologies Inc. (NYSE: PLTR)
                  </h1>
                  <p className="text-xs text-slate-400 font-mono mt-1">
                    Sector: Enterprise Software & Defense AI • CIK: 0001321655 • Jurisdiction: Delaware, USA
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded bg-[#0b111c] border border-[#1a2638] text-cyan-400">
                    Provenance Integrity: 100%
                  </span>
                </div>
              </div>
              <p className="text-sm text-slate-300 mt-3 max-w-3xl leading-relaxed font-serif">
                {demoData?.company?.description}
              </p>
            </div>

            {/* Editable Investigation Mandate */}
            <div className="p-6 rounded-lg bg-[#0b1019] border border-[#1a2638] mb-8 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono uppercase text-slate-400 tracking-wider flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <span>Investigation Objective & Analytical Mandate</span>
                </span>
                {!mandateEditing ? (
                  <button
                    onClick={() => setMandateEditing(true)}
                    className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Edit Mandate</span>
                  </button>
                ) : (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleSaveMandate}
                      className="text-xs font-mono px-2.5 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white flex items-center space-x-1 cursor-pointer"
                    >
                      <Check className="w-3 h-3" />
                      <span>Save Mandate</span>
                    </button>
                    <button
                      onClick={() => setMandateEditing(false)}
                      className="text-xs font-mono px-2 py-1 rounded border border-[#1a2638] text-slate-400 hover:text-slate-200 cursor-pointer"
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
                  className="w-full mt-2 p-3 rounded bg-[#05070c] border border-cyan-500/40 text-xs text-slate-200 font-serif leading-relaxed focus:outline-none"
                />
              ) : (
                <p className="text-sm font-serif font-medium text-slate-200 leading-relaxed mt-1">
                  "{mandateText}"
                </p>
              )}

              {mandateSaved && (
                <div className="mt-2 text-xs font-mono text-cyan-400 flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Mandate updated and locked into agent research scope.</span>
                </div>
              )}

              {/* Scope Tags */}
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-[#162030]">
                {["Corporate Identity", "ASC 606 Revenue Quality", "Defense Appropriations", "NRR & Customer Concentration", "Quantitative Scenarios"].map(tag => (
                  <span key={tag} className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#101724] border border-[#1e2a3c] text-slate-300">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Ingested Primary Seeds */}
            <h2 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-4 flex items-center justify-between">
              <span>Ingested Primary Disclosures & Provenance Documents ({demoData?.seeds?.length || 3})</span>
              <span className="text-[10px] text-cyan-400">Zero Synthetic Hallucinations</span>
            </h2>

            <div className="space-y-4 mb-10">
              {demoData?.seeds?.map((seed: any, idx: number) => (
                <div key={idx} className="p-5 rounded-lg bg-[#0b1019] border border-[#1a2638] hover:border-slate-600 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
                        {seed.category}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        Verified by SEC / Government Registrar
                      </span>
                    </div>
                    <span className="text-xs font-mono text-cyan-400 font-semibold">
                      Reliability: {(seed.reliability * 100).toFixed(0)}%
                    </span>
                  </div>
                  <h3 className="font-semibold text-slate-100 text-sm mb-1">{seed.title}</h3>
                  <p className="text-xs text-slate-400 mb-3 font-mono">
                    Publisher: {seed.publisher} • Date: {seed.date}
                  </p>
                  
                  <div className="text-xs text-slate-300 leading-relaxed italic bg-[#05070c] p-3 rounded border border-[#141d2b]">
                    "{seed.summary}"
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-2 text-[11px] font-mono">
                    <span className="text-slate-500 truncate max-w-md">Source: {seed.url}</span>
                    <button
                      onClick={() => setSelectedSourceForModal(seed)}
                      className="text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 cursor-pointer"
                    >
                      <Info className="w-3 h-3" />
                      <span>Inspect Excerpt Passage</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Stage Proceed Footer */}
            <div className="flex justify-between items-center pt-6 border-t border-[#162030]">
              <span className="text-xs font-mono text-slate-500">
                Primary factual grounding verified. Entity ontology ready.
              </span>
              <button
                onClick={() => setCurrentStage(2)}
                className="px-5 py-2.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs flex items-center space-x-2 shadow-[0_0_15px_rgba(6,182,212,0.3)] cursor-pointer transition-colors"
              >
                <span>Proceed to Stage 02: Knowledge Graph</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STAGE 02: Living Knowledge Graph (Cyan Reference Layout) ================= */}
        {currentStage === 2 && (
          <div className="flex-1 overflow-hidden grid grid-cols-12 divide-x divide-[#162030]">
            {/* Left 2.5 Cols: Entity Hierarchy & Filter Sidebar */}
            <div className="col-span-3 flex flex-col overflow-hidden bg-[#070a10]">
              <div className="p-3 border-b border-[#162030] bg-[#0b1019] flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-xs font-mono uppercase text-slate-300 tracking-wider">
                  <Layers className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Entity Constellation</span>
                </div>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                  {graphData.nodes.length} Nodes
                </span>
              </div>

              {/* Search Bar */}
              <div className="p-2.5 border-b border-[#162030] bg-[#080d14]">
                <div className="flex items-center space-x-2 bg-[#05070c] px-2.5 py-1.5 rounded border border-[#1a2638]">
                  <Search className="w-3 h-3 text-slate-500" />
                  <input
                    type="text"
                    value={graphSearch}
                    onChange={(e) => setGraphSearch(e.target.value)}
                    placeholder="Search entities (DoD, AWS, TITAN)..."
                    className="w-full bg-transparent text-xs text-slate-200 focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Hierarchy Category List */}
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {[
                  { key: "ALL", label: "All Entities", color: "#38bdf8" },
                  { key: "target_entity", label: "Core Enterprise Hub", color: "#10b981" },
                  { key: "government_customer", label: "Government Customers", color: "#0ea5e9" },
                  { key: "defense_contract", label: "Defense Contracts", color: "#6366f1" },
                  { key: "cloud_infrastructure", label: "Cloud Infrastructure", color: "#14b8a6" },
                  { key: "commercial_customer", label: "Commercial Customers", color: "#059669" },
                  { key: "core_platform", label: "Core Platforms & Tech", color: "#9333ea" },
                  { key: "competitor", label: "Competitors", color: "#c026d3" },
                  { key: "leadership", label: "Leadership & Governance", color: "#ca8a04" },
                  { key: "regulatory_body", label: "Regulatory Authorities", color: "#64748b" },
                ].map((cat) => {
                  const count = cat.key === "ALL" ? graphData.nodes.length : (entityCategoryCounts[cat.key] || 0);
                  const isSelected = graphTypeFilter === cat.key;
                  return (
                    <button
                      key={cat.key}
                      onClick={() => setGraphTypeFilter(cat.key)}
                      className={`w-full text-left px-2.5 py-2 rounded text-xs transition-all flex items-center justify-between cursor-pointer ${
                        isSelected 
                          ? "bg-cyan-950/80 border border-cyan-500/50 text-cyan-200 shadow-sm" 
                          : "text-slate-400 hover:text-slate-200 hover:bg-[#0d1420] border border-transparent"
                      }`}
                    >
                      <div className="flex items-center space-x-2 truncate">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }}></span>
                        <span className="truncate">{cat.label}</span>
                      </div>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#0c121d] text-slate-400">
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Active Shock / Investigation Legend */}
              <div className="p-3 border-t border-[#162030] bg-[#080d14] space-y-2 text-[10px] font-mono">
                <div className="text-slate-400 uppercase tracking-wider">Dynamic Indicators:</div>
                <div className="flex items-center space-x-2 text-amber-400">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                  <span>Amber Pulse: Exogenous Shock Vector</span>
                </div>
                <div className="flex items-center space-x-2 text-cyan-400">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                  <span>Cyan Wave: Active Specialist Scanner</span>
                </div>
              </div>
            </div>

            {/* Center 6.5 Cols: High-Density Canvas */}
            <div className="col-span-6 flex flex-col overflow-hidden relative bg-[#05070c]">
              <LivingKnowledgeGraph
                nodes={graphData.nodes}
                edges={graphData.edges}
                selectedNode={selectedNode}
                onSelectNode={(node) => {
                  setSelectedNode(node);
                  setSelectedEdge(null);
                }}
                selectedEdge={selectedEdge}
                onSelectEdge={(edge) => {
                  setSelectedEdge(edge);
                  setSelectedNode(null);
                }}
                affectedEntityNames={activeHypoResult?.affected_entities || []}
                investigatingEntityNames={investigatingEntityNames}
                searchQuery={graphSearch}
                typeFilter={graphTypeFilter}
              />
            </div>

            {/* Right 2.5 Cols: Node & Provenance Inspector */}
            <div className="col-span-3 flex flex-col overflow-hidden bg-[#070a10]">
              <div className="p-3 border-b border-[#162030] bg-[#0b1019] text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Provenance Inspector</span>
                <span className="text-cyan-400 text-[10px]">
                  {selectedNode ? "Entity Focus" : (selectedEdge ? "Relationship" : "Overview")}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-5">
                {selectedNode ? (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/30">
                        {selectedNode.type?.replace(/_/g, " ")}
                      </span>
                      <span className="text-xs font-mono text-cyan-400 font-semibold">
                        {selectedNode.confidence ? `${(selectedNode.confidence * 100).toFixed(0)}% Conf` : "100% Verified"}
                      </span>
                    </div>

                    <h2 className="text-lg font-serif font-bold text-slate-100 mb-1">{selectedNode.label}</h2>
                    {selectedNode.sector && (
                      <div className="text-[10px] font-mono text-slate-400 mb-3">
                        Sector: {selectedNode.sector} {selectedNode.ticker ? `• ${selectedNode.ticker}` : ""}
                      </div>
                    )}

                    <p className="text-xs text-slate-300 leading-relaxed font-serif bg-[#05070c] p-3 rounded border border-[#162030] mb-4">
                      {selectedNode.description || "Corporate entity mapped within Palantir institutional intelligence network."}
                    </p>

                    <div className="p-3 rounded bg-[#0b1019] border border-[#162030] space-y-1.5 mb-4 text-xs font-mono">
                      <div className="text-[10px] uppercase text-slate-500">Documentary Provenance</div>
                      <div className="text-cyan-400 text-xs">
                        SEC Form 10-K (CIK 0001321655) & CRS Modernization
                      </div>
                      <div className="text-slate-400 text-[10px]">
                        Cryptographic Hash: sha256:4a8c9...71b
                      </div>
                    </div>

                    {/* Connected Relational Edges for this node */}
                    <div>
                      <div className="text-[10px] font-mono uppercase text-slate-400 mb-2">Verified Connections:</div>
                      <div className="space-y-2">
                        {graphData.edges
                          .filter(e => e.source === selectedNode.id || e.target === selectedNode.id)
                          .map(e => {
                            const otherId = e.source === selectedNode.id ? e.target : e.source;
                            const otherNode = graphData.nodes.find(n => n.id === otherId);
                            return (
                              <div 
                                key={e.id}
                                onClick={() => setSelectedEdge(e)}
                                className="p-2.5 rounded bg-[#0b1019] hover:bg-[#101724] border border-[#162030] text-xs cursor-pointer transition-colors"
                              >
                                <div className="flex items-center justify-between text-[10px] font-mono uppercase text-cyan-400 mb-1">
                                  <span>{e.relationship}</span>
                                  <span>{(e.confidence * 100).toFixed(0)}%</span>
                                </div>
                                <div className="font-semibold text-slate-200 text-xs">{otherNode?.label || otherId}</div>
                                {e.description && (
                                  <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 font-serif">{e.description}</p>
                                )}
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  </div>
                ) : selectedEdge ? (
                  <div>
                    <div className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/30 mb-2 inline-block">
                      {selectedEdge.relationship}
                    </div>
                    <h3 className="text-base font-semibold text-slate-100 mb-2">
                      Relationship Provenance
                    </h3>
                    <p className="text-xs text-slate-300 font-serif leading-relaxed bg-[#05070c] p-3 rounded border border-[#162030] mb-4">
                      "{selectedEdge.description}"
                    </p>
                    <div className="text-[10px] font-mono text-slate-500 space-y-1">
                      <div>Confidence Score: {selectedEdge.confidence ? (selectedEdge.confidence * 100).toFixed(0) : 95}%</div>
                      <div>Extraction Method: ASC 606 & Federal Contracting Cross-Validation</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-500 text-xs font-mono">
                    Click any node or relationship connector to inspect documentary provenance.
                  </div>
                )}
              </div>

              {/* Stage Navigation Footer */}
              <div className="p-3 border-t border-[#162030] bg-[#070b12] flex justify-between items-center">
                <button
                  onClick={() => setCurrentStage(1)}
                  className="px-3 py-1.5 rounded border border-[#1a2638] text-slate-400 hover:text-slate-200 text-xs cursor-pointer"
                >
                  Back to Seeds
                </button>
                <button
                  onClick={() => setCurrentStage(3)}
                  className="px-4 py-2 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs flex items-center space-x-1.5 shadow-[0_0_12px_rgba(6,182,212,0.3)] cursor-pointer"
                >
                  <span>Stage 03: Agent Society</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= STAGE 03: Multi-Agent Society & Realtime Interactions ================= */}
        {currentStage === 3 && (
          <div className="flex-1 overflow-hidden grid grid-cols-12 divide-x divide-[#162030]">
            {/* Left 3 Cols: Society Specialists Roster */}
            <div className="col-span-3 flex flex-col overflow-hidden bg-[#070a10]">
              <div className="p-3 border-b border-[#162030] bg-[#0b1019] flex items-center justify-between gap-2">
                <div className="flex items-center space-x-1.5 flex-1">
                  <Search className="w-3 h-3 text-slate-500" />
                  <input
                    type="text"
                    value={agentSearch}
                    onChange={(e) => setAgentSearch(e.target.value)}
                    placeholder="Search 14 specialists..."
                    className="w-full px-2 py-0.5 rounded bg-[#05070c] border border-[#1a2638] text-[11px] text-slate-200 focus:outline-none font-mono"
                  />
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/30">
                  {societyAgents.length} Agents
                </span>
              </div>

              <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
                {filteredAgents.map((ag) => (
                  <button
                    key={ag.id}
                    onClick={() => setSelectedAgent(ag)}
                    className={`w-full text-left p-3 rounded border transition-all cursor-pointer ${
                      selectedAgent?.id === ag.id
                        ? "bg-[#0f1725] border-cyan-500/60 text-slate-100 shadow-[0_0_10px_rgba(6,182,212,0.15)]"
                        : "bg-[#0b1019] border-[#162030] text-slate-300 hover:border-slate-600"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-xs text-slate-100 truncate">{ag.name}</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#101724] text-cyan-400">
                        {(ag.confidence * 100).toFixed(0)}% Conf
                      </span>
                    </div>
                    <div className="text-[11px] font-medium text-slate-400 truncate">{ag.role}</div>
                    <div className="flex items-center space-x-1.5 mt-1.5 text-[9px] font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                      <span className="text-slate-400 uppercase">{ag.status || "RESEARCHING"}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Center 5 Cols: Real-Time Society Deliberation & Timeline */}
            <div className="col-span-5 flex flex-col overflow-hidden bg-[#05070c]">
              <div className="p-3.5 border-b border-[#162030] bg-[#070b12] flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold flex items-center space-x-1.5">
                    <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                    <span>Society Interaction Timeline</span>
                  </span>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    Structured Agent-to-Agent Challenges, Findings & Rebuttals
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0b1019] text-slate-300 border border-[#1a2638]">
                  {interactions.length} Interactions
                </span>
              </div>

              {/* Chronological Society Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {interactions.map((msg, idx) => (
                  <div 
                    key={msg.id || idx}
                    className={`p-3.5 rounded-lg border text-xs ${
                      msg.interaction_type === "CHALLENGE" ? "bg-amber-950/20 border-amber-800/40 text-amber-100" :
                      msg.interaction_type === "REBUT" ? "bg-blue-950/20 border-blue-800/40 text-blue-100" :
                      msg.interaction_type === "CONCEDE" ? "bg-purple-950/20 border-purple-800/40 text-purple-100" :
                      msg.interaction_type === "USER_INTERVENTION" ? "bg-emerald-950/30 border-emerald-500/40 text-emerald-200" :
                      msg.interaction_type === "ADJUDICATE" ? "bg-cyan-950/30 border-cyan-500/40 text-cyan-100" :
                      "bg-[#0b1019] border-[#162030] text-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono uppercase mb-1">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-semibold text-slate-200">{msg.sender_agent_id?.replace(/_/g, " ")}</span>
                        <span className="text-slate-500">→</span>
                        <span className="text-slate-400">{msg.recipient_agent_id?.replace(/_/g, " ")}</span>
                      </div>
                      <span className="font-semibold px-1.5 py-0.2 rounded bg-[#080d14] text-cyan-300">
                        {msg.interaction_type}
                      </span>
                    </div>
                    <p className="leading-relaxed font-serif text-xs text-slate-200 mt-1">
                      {msg.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right 4 Cols: Agent Workspace, Interrogation & Shock Injection */}
            <div className="col-span-4 flex flex-col overflow-hidden bg-[#070a10]">
              {selectedAgent ? (
                <div className="flex-1 flex flex-col overflow-hidden">
                  {/* Selected Agent Header */}
                  <div className="p-4 border-b border-[#162030] bg-[#0b1019]">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-xs font-mono uppercase text-cyan-400 tracking-wider mb-0.5">
                          {selectedAgent.role}
                        </div>
                        <h2 className="text-base font-serif font-bold text-slate-100">{selectedAgent.name}</h2>
                        <p className="text-[11px] text-slate-400 mt-0.5 font-mono">{selectedAgent.specialization}</p>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#101724] border border-[#1a2638] text-slate-200">
                        {selectedAgent.analytical_style}
                      </span>
                    </div>

                    <div className="mt-2.5 p-2.5 rounded bg-[#05070c] border border-[#162030] text-xs text-slate-200 font-serif leading-relaxed">
                      "{selectedAgent.current_position || "Analysis complete."}"
                    </div>

                    {/* Position Revisions if any */}
                    {selectedAgent.position_revisions && selectedAgent.position_revisions.length > 0 && (
                      <div className="mt-2 text-[10px] font-mono text-amber-400 bg-amber-950/20 p-2 rounded border border-amber-800/30 flex items-center space-x-1.5">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Position Revised: "{selectedAgent.position_revisions[0].reason}"</span>
                      </div>
                    )}
                  </div>

                  {/* Scrollable Action Workspace */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {/* Interrogation Console with Mode Selector */}
                    <div className="p-4 rounded-lg bg-[#0b1019] border border-cyan-500/30">
                      <div className="flex items-center justify-between mb-3 border-b border-[#162030] pb-2">
                        <div className="flex items-center space-x-2 text-xs font-medium text-cyan-400">
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Investigator Interrogation</span>
                        </div>
                        <div className="flex items-center space-x-1 p-0.5 bg-[#05070c] rounded border border-[#162030] text-[10px]">
                          <button
                            type="button"
                            onClick={() => setInterrogationMode("single")}
                            className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                              interrogationMode === "single"
                                ? "bg-cyan-500/20 text-cyan-300 font-medium"
                                : "text-slate-400 hover:text-slate-200"
                            }`}
                          >
                            Single Specialist ({selectedAgent.name.split(" ")[0]})
                          </button>
                          <button
                            type="button"
                            onClick={() => setInterrogationMode("all")}
                            className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                              interrogationMode === "all"
                                ? "bg-cyan-500/20 text-cyan-300 font-medium"
                                : "text-slate-400 hover:text-slate-200"
                            }`}
                          >
                            Whole Society (16 Agents)
                          </button>
                        </div>
                      </div>

                      {interrogationMode === "single" ? (
                        <>
                          <div className="text-[11px] text-slate-400 mb-1">
                            Direct inquiry to <span className="text-cyan-300 font-mono">{selectedAgent.name}</span> ({selectedAgent.role}):
                          </div>
                          <form onSubmit={handleIntervention} className="space-y-2 mt-1">
                            <textarea
                              value={interventionQuery}
                              onChange={(e) => setInterventionQuery(e.target.value)}
                              rows={2}
                              placeholder={`Ask e.g. "What is the primary risk if DoD appropriations stall?"...`}
                              className="w-full px-2.5 py-1.5 rounded bg-[#05070c] border border-[#162030] text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-sans"
                            />
                            <div className="flex justify-end">
                              <button
                                type="submit"
                                disabled={interventionLoading || !interventionQuery.trim()}
                                className="px-3.5 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs flex items-center space-x-1 cursor-pointer disabled:opacity-50"
                              >
                                <Send className="w-3 h-3" />
                                <span>{interventionLoading ? "Interrogating..." : "Submit Question"}</span>
                              </button>
                            </div>
                          </form>

                          {interventionHistory.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-[#162030] space-y-2 text-xs">
                              {interventionHistory.map((item, idx) => (
                                <div key={idx} className="p-2.5 rounded bg-[#05070c] border border-[#162030]">
                                  <div className="text-[9px] font-mono text-cyan-400 uppercase font-semibold">You Asked:</div>
                                  <div className="text-slate-300 italic mb-1 text-[11px]">"{item.user_query}"</div>
                                  <div className="text-[9px] font-mono text-emerald-400 uppercase font-semibold">{item.agent_name} Responded:</div>
                                  <div className="text-slate-200 font-serif leading-relaxed mt-0.5 text-xs">{item.agent_reply}</div>
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          <div className="text-[11px] text-slate-400 mb-1">
                            Broadcast question across all <span className="text-cyan-300 font-mono">16 specialist agents</span> simultaneously:
                          </div>
                          <form onSubmit={handleSocietyInterrogateAll} className="space-y-2 mt-1">
                            <textarea
                              value={societyQuestion}
                              onChange={(e) => setSocietyQuestion(e.target.value)}
                              rows={2}
                              placeholder={`Ask e.g. "How defensible is Palantir against cloud hyperscaler commoditization and defense procurement friction?"...`}
                              className="w-full px-2.5 py-1.5 rounded bg-[#05070c] border border-[#162030] text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-sans"
                            />
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] text-slate-500 font-mono">16 Specialists will formulate individual grounded responses</span>
                              <button
                                type="submit"
                                disabled={societyLoading || !societyQuestion.trim()}
                                className="px-3.5 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs flex items-center space-x-1 cursor-pointer disabled:opacity-50"
                              >
                                <Send className="w-3 h-3" />
                                <span>{societyLoading ? "Deliberating..." : "Broadcast Interrogation"}</span>
                              </button>
                            </div>
                          </form>

                          {societyAnswers.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-[#162030] space-y-3 text-xs">
                              {societyAnswers.map((round, rIdx) => (
                                <div key={rIdx} className="p-3 rounded bg-[#05070c] border border-cyan-900/40 space-y-2">
                                  <div className="flex items-center justify-between text-[10px] font-mono text-cyan-400 border-b border-[#162030] pb-1">
                                    <span>QUERY: "{round.question}"</span>
                                    <span>{round.responses_count} Specialists Responded</span>
                                  </div>
                                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                                    {round.responses?.map((resp: any, respIdx: number) => (
                                      <div key={respIdx} className="p-2 rounded bg-[#080d15] border border-[#141d2b]">
                                        <div className="flex items-center justify-between text-[9px] font-mono mb-1">
                                          <span className="text-emerald-400 font-semibold">{resp.agent_name}</span>
                                          <span className="text-slate-500">{resp.role}</span>
                                        </div>
                                        <div className="text-slate-300 font-serif text-[11px] leading-relaxed">
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

                    {/* Exogenous Shock / Hypothetical Event Injection */}
                    <div className="p-4 rounded-lg bg-[#0b1019] border border-amber-800/30">
                      <div className="flex items-center space-x-2 text-xs font-medium text-amber-400 mb-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Exogenous Shock / Scenario Injection</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mb-2">
                        Simulate market shocks. Recalculates stress multiple and flashes graph shock vectors without corrupting baseline.
                      </p>

                      {/* Quick Presets */}
                      <div className="flex flex-wrap gap-1 mb-2">
                        {[
                          "U.S. defense appropriations reduced by 25% amidst procurement delay",
                          "Federal procurement cycle extends beyond 180 days"
                        ].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={(e) => handleInjectHypothetical(e, preset)}
                            className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#101724] hover:bg-amber-950/40 border border-[#1e2a3c] hover:border-amber-600/40 text-slate-300 hover:text-amber-200 cursor-pointer"
                          >
                            + {preset.slice(0, 36)}...
                          </button>
                        ))}
                      </div>

                      <form onSubmit={handleInjectHypothetical} className="flex space-x-1.5">
                        <input
                          type="text"
                          value={hypoEvent}
                          onChange={(e) => setHypoEvent(e.target.value)}
                          placeholder="Custom shock e.g. Contract paused..."
                          className="flex-1 px-2.5 py-1 rounded bg-[#05070c] border border-[#162030] text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-sans"
                        />
                        <button
                          type="submit"
                          disabled={hypoLoading || !hypoEvent.trim()}
                          className="px-3 py-1 rounded bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs cursor-pointer disabled:opacity-50"
                        >
                          {hypoLoading ? "Simulating..." : "Inject"}
                        </button>
                      </form>

                      {/* Live Stressed Shock Results */}
                      {activeHypoResult && (
                        <div className="mt-3 p-3 rounded bg-[#090d14] border border-amber-800/40 space-y-2">
                          <div className="flex items-center justify-between text-[10px] font-mono">
                            <span className="uppercase px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-500/40 font-bold">
                              SHOCK RECORDED
                            </span>
                            <span className="text-slate-400">Baseline Preserved</span>
                          </div>

                          <div className="text-xs font-serif text-slate-200 italic">
                            "{activeHypoResult.event_description}"
                          </div>

                          {activeHypoResult.stressed_metrics && (
                            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#162030]">
                              <div className="p-2 rounded bg-[#05070c] border border-[#162030]">
                                <div className="text-[9px] font-mono text-slate-400">Baseline Multiple</div>
                                <div className="text-xs font-mono font-bold text-cyan-400">
                                  {activeHypoResult.baseline_metrics?.terminal_multiple || "8.0x ARR"}
                                </div>
                              </div>
                              <div className="p-2 rounded bg-[#05070c] border border-amber-900/40">
                                <div className="text-[9px] font-mono text-amber-400">Stressed Multiple</div>
                                <div className="text-xs font-mono font-bold text-amber-300">
                                  {activeHypoResult.stressed_metrics?.terminal_multiple || "3.0x ARR"}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Stage Footer */}
                  <div className="p-3 border-t border-[#162030] bg-[#070b12] flex justify-between items-center">
                    <button
                      onClick={() => setCurrentStage(2)}
                      className="px-3 py-1.5 rounded border border-[#1a2638] text-slate-400 hover:text-slate-200 text-xs cursor-pointer"
                    >
                      Back to Graph
                    </button>
                    <button
                      onClick={() => setCurrentStage(4)}
                      className="px-4 py-2 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs flex items-center space-x-1.5 shadow-[0_0_12px_rgba(6,182,212,0.3)] cursor-pointer"
                    >
                      <span>Stage 04: Boardroom Debate</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}

        {/* ================= STAGE 04: Boardroom Debate ================= */}
        {currentStage === 4 && (
          <div className="flex-1 overflow-hidden grid grid-cols-12 divide-x divide-[#162030]">
            {/* Panel A: 3 Cols - Specialist Roster & Stances */}
            <div className="col-span-3 flex flex-col overflow-hidden bg-[#070a10]">
              <div className="p-3.5 border-b border-[#162030] bg-[#0b1019] text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Specialist Roster</span>
                <span className="text-cyan-400 text-[10px]">Stances</span>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
                {societyAgents.map((ag) => (
                  <div key={ag.id} className="p-2.5 rounded bg-[#0b1019] border border-[#162030] text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-slate-200 text-[11px] truncate">{ag.name}</span>
                      <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                        ag.agent_id === "bull_analyst" ? "bg-emerald-950 text-emerald-400" :
                        ag.agent_id === "bear_analyst" ? "bg-amber-950 text-amber-400" :
                        ag.agent_id === "final_adjudicator" ? "bg-purple-950 text-purple-400" :
                        "bg-[#101724] text-slate-300"
                      }`}>
                        {ag.agent_id === "bull_analyst" ? "BULL" :
                         ag.agent_id === "bear_analyst" ? "BEAR" :
                         ag.agent_id === "final_adjudicator" ? "JUDICIAL" : "ANALYST"}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">{ag.role}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Panel B: 6 Cols - Deliberation Timeline */}
            <div className="col-span-6 flex flex-col overflow-hidden bg-[#05070c]">
              <div className="p-3.5 border-b border-[#162030] bg-[#070b12] flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold">
                    Adversarial Deliberation Floor
                  </span>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">
                    Structured Challenges, Rebuttals & Judicial Rulings
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0b1019] text-slate-300 border border-[#1a2638]">
                  {claims.length} Claims • {debates[0]?.arguments?.length || 4} Arguments
                </span>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Claims Bar */}
                <div className="space-y-2 mb-3">
                  <div className="text-[10px] font-mono uppercase text-slate-400">Audited Claims in Dispute:</div>
                  {claims.map((c) => (
                    <div 
                      key={c.id} 
                      onClick={() => setSelectedClaim(c)}
                      className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                        selectedClaim?.id === c.id 
                          ? "bg-[#0f1725] border-cyan-500/60 shadow-sm" 
                          : "bg-[#0b1019] border-[#162030] hover:border-slate-600"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 rounded bg-[#101724] text-slate-300">
                          {c.specialist_id.replace(/_/g, " ")}
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className={`text-[10px] font-mono uppercase font-semibold ${
                            c.verdict === "supported" ? "text-emerald-400" : "text-amber-400"
                          }`}>
                            Verdict: {c.verdict}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setChallengeModalClaim(c);
                            }}
                            className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/60 hover:bg-amber-900 border border-amber-600/40 text-amber-300 cursor-pointer"
                          >
                            Challenge Claim
                          </button>
                        </div>
                      </div>
                      <p className="text-xs leading-relaxed font-serif text-slate-200">{c.statement}</p>
                    </div>
                  ))}
                </div>

                {/* Deliberation Arguments Thread */}
                {debates.map((d) => (
                  <div key={d.id} className="p-4 rounded-lg bg-[#0b1019] border border-[#162030]">
                    <div className="text-xs font-semibold text-slate-200 mb-3 flex items-center space-x-2">
                      <Scale className="w-4 h-4 text-amber-400" />
                      <span>Adversarial Debate Session: {d.topic}</span>
                    </div>

                    <div className="space-y-3">
                      {d.arguments.map((arg: any) => (
                        <div 
                          key={arg.id} 
                          className={`p-3.5 rounded border text-xs ${
                            arg.argument_type === "adjudication"
                              ? "bg-purple-950/20 border-purple-800/40 text-purple-200"
                              : arg.argument_type === "challenge"
                              ? "bg-amber-950/20 border-amber-800/40 text-amber-200"
                              : "bg-[#0e1420] border-[#162030] text-slate-300"
                          }`}
                        >
                          <div className="flex items-center justify-between text-[10px] font-mono uppercase mb-1">
                            <span className="font-semibold text-slate-200">{arg.specialist_id.replace(/_/g, " ")}</span>
                            <span className="text-slate-400 font-mono">[{arg.argument_type}]</span>
                          </div>
                          <p className="leading-relaxed font-serif text-xs">{arg.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Stage Navigation Footer */}
              <div className="p-3 border-t border-[#162030] bg-[#070b12] flex justify-between items-center">
                <button
                  onClick={() => setCurrentStage(3)}
                  className="px-3 py-1.5 rounded border border-[#1a2638] text-slate-400 hover:text-slate-200 text-xs cursor-pointer"
                >
                  Back to Society
                </button>
                <button
                  onClick={() => setCurrentStage(5)}
                  className="px-4 py-2 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs flex items-center space-x-1.5 shadow-[0_0_12px_rgba(6,182,212,0.3)] cursor-pointer"
                >
                  <span>Stage 05: Intelligence Dossier</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Panel C: 3 Cols - Evidence Inspector */}
            <div className="col-span-3 flex flex-col overflow-hidden bg-[#070a10]">
              <div className="p-3.5 border-b border-[#162030] bg-[#0b1019] text-xs font-mono uppercase tracking-wider text-slate-400">
                Evidence Inspector
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {selectedClaim ? (
                  <div>
                    <div className="text-[10px] font-mono text-cyan-400 uppercase mb-1">Claim Under Audit</div>
                    <div className="text-xs font-serif text-slate-200 bg-[#0b1019] p-3 rounded border border-[#162030] mb-4">
                      "{selectedClaim.statement}"
                    </div>

                    <div className="text-[10px] font-mono uppercase text-slate-400 mb-1.5">Supporting Citations:</div>
                    <div className="p-3 rounded bg-[#05070c] border border-[#162030] space-y-2 text-xs">
                      <div className="text-cyan-400 font-mono text-[11px]">Primary SEC 10-K Filing</div>
                      <p className="text-slate-400 italic text-[11px] font-serif">
                        "For the fiscal year ended December 31, 2025, commercial customer count expanded 54% in the US, with top customer concentration disclosed at 18.2%."
                      </p>
                    </div>

                    <div className="mt-4 p-3 rounded bg-[#05070c] border border-[#162030] space-y-2 text-xs">
                      <div className="text-emerald-400 font-mono text-[11px]">CRS Defense Modernization Report</div>
                      <p className="text-slate-400 italic text-[11px] font-serif">
                        "TITAN prime software phase guarantees vehicle fielding across Army ground stations with multi-year appropriations."
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-500 text-xs font-mono">
                    Select any claim in the deliberation timeline to inspect primary source citations.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================= STAGE 05: Intelligence Dossier ================= */}
        {currentStage === 5 && (
          <div className="flex-1 overflow-y-auto p-10 max-w-4xl mx-auto w-full">
            {primaryReport ? (
              <article className="p-8 rounded-lg bg-[#0b1019] border border-[#1a2638] text-slate-200 shadow-2xl">
                <div className="border-b border-[#162030] pb-6 mb-6 flex items-start justify-between">
                  <div>
                    <div className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-2">
                      Stage 05 • Institutional Dossier • Version {primaryReport.version}
                    </div>
                    <h1 className="text-2xl font-serif font-bold text-slate-100">{primaryReport.title}</h1>
                    <p className="text-xs font-mono text-slate-400 mt-2">
                      Generated on {new Date(primaryReport.created_at).toLocaleDateString()} • {primaryReport.citations_count} Audited Citations • 100% Provenance
                    </p>
                  </div>
                  <button
                    onClick={() => window.print()}
                    className="px-3.5 py-2 rounded border border-[#1a2638] hover:border-slate-500 text-slate-300 text-xs flex items-center space-x-1.5 cursor-pointer shadow-sm hover:bg-[#101724] transition-all"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print / Export PDF</span>
                  </button>
                </div>

                {/* Executive Assessment */}
                <div className="mb-8">
                  <h2 className="text-xs font-mono uppercase text-slate-400 tracking-wider mb-2">
                    Executive Assessment & Adjudication Verdict
                  </h2>
                  <div className="text-sm font-serif leading-relaxed p-4 rounded bg-[#070b12] border border-[#162030] text-slate-300">
                    {primaryReport.executive_summary}
                  </div>
                </div>

                {/* Financial Health & Unit Metrics */}
                {primaryReport.financial_analysis && (
                  <div className="mb-8">
                    <h2 className="text-xs font-mono uppercase text-slate-400 tracking-wider mb-3">
                      Audited Financial Health & Operating Benchmarks
                    </h2>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="p-4 rounded bg-[#070b12] border border-[#162030]">
                        <div className="text-slate-400 text-[11px] font-mono">Revenue (LTM)</div>
                        <div className="text-xl font-mono font-bold text-slate-100 mt-1">
                          ${primaryReport.financial_analysis.revenue_usd_m}M
                        </div>
                        <div className="text-[10px] text-slate-500 mt-1">GAAP SEC Form 10-K</div>
                      </div>
                      <div className="p-4 rounded bg-[#070b12] border border-[#162030]">
                        <div className="text-slate-400 text-[11px] font-mono">Gross Margin</div>
                        <div className="text-xl font-mono font-bold text-emerald-400 mt-1">
                          {primaryReport.financial_analysis.gross_margin_pct}%
                        </div>
                        <div className="text-[10px] text-slate-500 mt-1">Software gross margin</div>
                      </div>
                      <div className="p-4 rounded bg-[#070b12] border border-[#162030]">
                        <div className="text-slate-400 text-[11px] font-mono">Operating Cash Flow</div>
                        <div className="text-xl font-mono font-bold text-cyan-400 mt-1">
                          ${primaryReport.financial_analysis.operating_cash_flow_m}M
                        </div>
                        <div className="text-[10px] text-slate-500 mt-1">Cash conversion &gt; 30%</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-3.5 rounded bg-[#070b12] border border-[#162030]">
                        <div className="text-slate-400 text-[11px] font-mono">Liquid Capital</div>
                        <div className="text-lg font-mono font-semibold text-slate-200 mt-1">
                          ${primaryReport.financial_analysis.cash_reserves_m}M
                        </div>
                      </div>
                      <div className="p-3.5 rounded bg-[#070b12] border border-[#162030]">
                        <div className="text-slate-400 text-[11px] font-mono">Net Retention (NRR)</div>
                        <div className="text-lg font-mono font-semibold text-emerald-400 mt-1">
                          {primaryReport.financial_analysis.nrr_pct}%
                        </div>
                      </div>
                      <div className="p-3.5 rounded bg-[#070b12] border border-[#162030]">
                        <div className="text-slate-400 text-[11px] font-mono">Avg Sales Cycle</div>
                        <div className="text-lg font-mono font-semibold text-slate-200 mt-1">
                          {primaryReport.financial_analysis.sales_cycle_days} Days
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Quantitative Scenario Matrix */}
                {primaryReport.scenario_matrix && (
                  <div className="mb-8">
                    <h2 className="text-xs font-mono uppercase text-slate-400 tracking-wider mb-3">
                      Quantitative Scenario Sensitivity Matrix
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(primaryReport.scenario_matrix).map(([key, sc]: [string, any]) => (
                        <div key={key} className="p-4 rounded bg-[#070b12] border border-[#162030]">
                          <div className="flex items-center justify-between text-xs font-mono text-cyan-400 uppercase font-semibold mb-1">
                            <span>{key.replace(/_/g, " ")}</span>
                            <span>{sc.terminal_multiple}</span>
                          </div>
                          <div className="text-base font-mono font-bold text-slate-100">
                            ${sc.projected_revenue_m}M Projected ARR
                          </div>
                          <p className="text-xs text-slate-400 mt-2 italic font-serif leading-relaxed">
                            "{sc.assumptions}"
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Risk Register */}
                {primaryReport.risk_register && (
                  <div className="mb-8">
                    <h2 className="text-xs font-mono uppercase text-slate-400 tracking-wider mb-3">
                      Adjudicated Institutional Risk Register
                    </h2>
                    <div className="space-y-2">
                      {primaryReport.risk_register.map((r: any, idx: number) => (
                        <div key={idx} className="p-3 rounded bg-[#070b12] border border-[#162030] flex items-center justify-between text-xs">
                          <div>
                            <span className="font-semibold text-slate-200 font-mono">{r.category}: </span>
                            <span className="text-slate-300 font-serif">{r.detail}</span>
                          </div>
                          <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded ml-3 ${
                            r.severity === "HIGH" ? "bg-amber-950 text-amber-400 border border-amber-600/30" : "bg-cyan-950 text-cyan-400"
                          }`}>
                            {r.severity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Final Navigation & Workspace Launch */}
                <div className="flex justify-between items-center pt-6 border-t border-[#162030]">
                  <button
                    onClick={() => setCurrentStage(4)}
                    className="px-4 py-2 rounded border border-[#1a2638] text-slate-400 hover:text-slate-200 text-xs cursor-pointer"
                  >
                    Back to Debate
                  </button>
                  <Link
                    href="/app"
                    className="px-5 py-2.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs flex items-center space-x-2 shadow-lg"
                  >
                    <span>Launch New Custom Investigation in Workspace</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </article>
            ) : (
              <div className="text-center py-12 text-slate-500 text-sm">
                Dossier is compiling.
              </div>
            )}
          </div>
        )}

        {/* Collapsible Real-Time Investigation Event Drawer (Bottom) */}
        {showEventDrawer && (
          <div className="h-48 border-t border-[#162030] bg-[#070b12]/95 backdrop-blur z-40 flex flex-col font-mono text-xs shadow-2xl">
            <div className="px-4 py-2 border-b border-[#162030] bg-[#0b1019] flex items-center justify-between text-[11px] text-slate-400">
              <div className="flex items-center space-x-2">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-slate-200 font-semibold uppercase">Real-Time Investigation Event Telemetry</span>
                <span className="text-slate-600">|</span>
                <span className="text-cyan-400">WebSocket / SSE Stream: ACTIVE</span>
              </div>
              <button 
                onClick={() => setShowEventDrawer(false)}
                className="text-slate-400 hover:text-slate-200 text-xs cursor-pointer"
              >
                ✕ Close
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-1 text-[11px]">
              {events.length > 0 ? (
                events.map((ev, idx) => (
                  <div key={idx} className="flex items-start space-x-2">
                    <span className="text-slate-500">{new Date(ev.created_at).toLocaleTimeString()}</span>
                    <span className="text-cyan-400 font-bold">[{ev.event_type}]</span>
                    <span className="text-slate-300 font-sans">{JSON.stringify(ev.payload)}</span>
                  </div>
                ))
              ) : (
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-500">14:50:12</span>
                    <span className="text-cyan-400 font-bold">[investigation.started]</span>
                    <span className="text-slate-300 font-sans">Palantir Technologies (PLTR) investigation mounted into 14-agent society.</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-500">14:50:13</span>
                    <span className="text-emerald-400 font-bold">[entity.extracted]</span>
                    <span className="text-slate-300 font-sans">Extracted 28 corporate entities: DoD, Army, AWS, TITAN, Airbus, Snowflake, SEC.</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-500">14:50:14</span>
                    <span className="text-purple-400 font-bold">[relationship.verified]</span>
                    <span className="text-slate-300 font-sans">Corroborated 27 relationships against SEC Form 10-K and CRS appropriations.</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-500">14:50:15</span>
                    <span className="text-amber-400 font-bold">[adjudication.recorded]</span>
                    <span className="text-slate-300 font-sans">Justice Simon Cross ruled PARTIALLY_SUPPORTED on ARR acceleration claim.</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Excerpt Passage Modal (Stage 01) */}
      {selectedSourceForModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="max-w-xl w-full p-6 rounded-lg bg-[#0b1019] border border-[#1a2638] text-slate-200 shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/30">
                {selectedSourceForModal.category}
              </span>
              <button 
                onClick={() => setSelectedSourceForModal(null)}
                className="text-slate-400 hover:text-slate-200 text-xs font-mono cursor-pointer"
              >
                ✕ Close
              </button>
            </div>
            <h3 className="font-semibold text-slate-100 text-sm mb-1">{selectedSourceForModal.title}</h3>
            <p className="text-xs text-slate-400 font-mono mb-4">{selectedSourceForModal.publisher} • {selectedSourceForModal.date}</p>
            <div className="p-4 rounded bg-[#05070c] border border-[#162030] text-xs font-serif leading-relaxed text-slate-300 italic mb-4">
              "{selectedSourceForModal.summary}"
            </div>
            <div className="text-[11px] font-mono text-slate-500 truncate mb-4">
              Source URL: {selectedSourceForModal.url}
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setSelectedSourceForModal(null)}
                className="px-4 py-1.5 rounded bg-[#101724] hover:bg-[#162030] text-xs font-medium text-slate-200 cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Adversarial Challenge Modal (Stage 04) */}
      {challengeModalClaim && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="max-w-lg w-full p-6 rounded-lg bg-[#0b1019] border border-amber-800/40 text-slate-200 shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-600/40">
                Initiate Adversarial Challenge
              </span>
              <button 
                onClick={() => setChallengeModalClaim(null)}
                className="text-slate-400 hover:text-slate-200 text-xs font-mono cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <div className="text-xs text-slate-300 italic bg-[#05070c] p-3 rounded border border-[#162030] mb-4 font-serif">
              "{challengeModalClaim.statement}"
            </div>

            <form onSubmit={handleSubmitChallenge} className="space-y-4">
              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">Select Challenging Specialist:</label>
                <select
                  value={challengeChallenger}
                  onChange={(e) => setChallengeChallenger(e.target.value)}
                  className="w-full px-3 py-1.5 rounded bg-[#05070c] border border-[#162030] text-xs text-slate-200 focus:outline-none font-mono"
                >
                  <option value="bear_analyst">Bear-Case Advocate (Inspector Jonathan Cole)</option>
                  <option value="forensic_accountant">Senior Forensic Accountant (Marcus Holst, CPA)</option>
                  <option value="bull_analyst">Bull-Case Advocate (Vivian Graves)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">Enter Challenge Argument:</label>
                <textarea
                  value={challengeText}
                  onChange={(e) => setChallengeText(e.target.value)}
                  rows={3}
                  placeholder="State the counter-evidence or accounting anomaly that challenges this claim..."
                  className="w-full px-3 py-2 rounded bg-[#05070c] border border-[#162030] text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-sans"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setChallengeModalClaim(null)}
                  className="px-3 py-1.5 rounded border border-[#1a2638] text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={challengeLoading || !challengeText.trim()}
                  className="px-4 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs cursor-pointer disabled:opacity-50"
                >
                  {challengeLoading ? "Dispatching Challenge..." : "Submit to Boardroom"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
