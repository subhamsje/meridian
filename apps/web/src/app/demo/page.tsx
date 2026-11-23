"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  Check
} from "lucide-react";
import { API_BASE } from "@/lib/utils";

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

  // Stage 01: Mandate Modification
  const [mandateText, setMandateText] = useState("");
  const [mandateEditing, setMandateEditing] = useState(false);
  const [mandateSaved, setMandateSaved] = useState(false);
  const [selectedSourceForModal, setSelectedSourceForModal] = useState<any>(null);

  // Stage 02: Graph Controls & Filters
  const [graphSearch, setGraphSearch] = useState("");
  const [graphTypeFilter, setGraphTypeFilter] = useState("ALL");
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [selectedEdge, setSelectedEdge] = useState<any>(null);
  const [graphZoom, setGraphZoom] = useState(1);

  // Stage 03: Direct Interrogation
  const [agentSearch, setAgentSearch] = useState("");
  const [interventionQuery, setInterventionQuery] = useState("");
  const [interventionLoading, setInterventionLoading] = useState(false);
  const [interventionHistory, setInterventionHistory] = useState<any[]>([]);

  // Stage 03: Exogenous Hypothetical Event Injection
  const [hypoEvent, setHypoEvent] = useState("");
  const [hypoLoading, setHypoLoading] = useState(false);
  const [activeHypoResult, setActiveHypoResult] = useState<any>(null);

  // Stage 04: Adversarial Claim Challenge
  const [challengeModalClaim, setChallengeModalClaim] = useState<any>(null);
  const [challengeText, setChallengeText] = useState("");
  const [challengeChallenger, setChallengeChallenger] = useState("bear_analyst");
  const [challengeLoading, setChallengeLoading] = useState(false);

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
      const [detailRes, graphRes, agentsRes, interRes, claimsRes, debatesRes, evRes, reportsRes, hypoRes] = await Promise.all([
        fetch(`${API_BASE}/investigations/${invId}`, { headers: { Authorization: `Bearer ${jwt}` } }),
        fetch(`${API_BASE}/investigations/${invId}/graph`, { headers: { Authorization: `Bearer ${jwt}` } }),
        fetch(`${API_BASE}/investigations/${invId}/society/agents`, { headers: { Authorization: `Bearer ${jwt}` } }),
        fetch(`${API_BASE}/investigations/${invId}/society/interactions`, { headers: { Authorization: `Bearer ${jwt}` } }),
        fetch(`${API_BASE}/investigations/${invId}/claims`, { headers: { Authorization: `Bearer ${jwt}` } }),
        fetch(`${API_BASE}/investigations/${invId}/debates`, { headers: { Authorization: `Bearer ${jwt}` } }),
        fetch(`${API_BASE}/investigations/${invId}/evidence`, { headers: { Authorization: `Bearer ${jwt}` } }),
        fetch(`${API_BASE}/investigations/${invId}/reports`, { headers: { Authorization: `Bearer ${jwt}` } }),
        fetch(`${API_BASE}/investigations/${invId}/society/hypotheticals`, { headers: { Authorization: `Bearer ${jwt}` } }),
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
        // Reload interactions
        const interRes = await fetch(`${API_BASE}/investigations/${demoData.investigation_id}/society/interactions`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (interRes.ok) setInteractions(await interRes.json());
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

  // Filtered Graph Nodes
  const filteredGraphNodes = useMemo(() => {
    return graphData.nodes.filter(n => {
      const matchSearch = n.label.toLowerCase().includes(graphSearch.toLowerCase()) || 
                          (n.type && n.type.toLowerCase().includes(graphSearch.toLowerCase()));
      if (!matchSearch) return false;
      if (graphTypeFilter === "ALL") return true;
      return n.type?.toUpperCase() === graphTypeFilter.toUpperCase();
    });
  }, [graphData.nodes, graphSearch, graphTypeFilter]);

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
      <div className="min-h-screen bg-[#080a0d] flex flex-col items-center justify-center text-slate-300">
        <div className="w-10 h-10 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 animate-spin mb-4"></div>
        <p className="text-xs font-mono uppercase tracking-widest text-emerald-400">
          Mounting Institutional Society & Palantir (PLTR) Investigation...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080a0d] text-[#e1e4ea] flex flex-col font-sans selection:bg-emerald-950 selection:text-emerald-300">
      {/* Top Persistent Flagship Header */}
      <header className="h-16 border-b border-[#1c222c] bg-[#0c1015]/95 backdrop-blur px-6 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-3.5">
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="w-7 h-7 rounded bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-center font-mono font-bold text-emerald-400 text-xs shadow-inner">
              M
            </div>
            <span className="font-semibold text-sm tracking-wider uppercase text-slate-100 group-hover:text-emerald-300 transition-colors">
              Meridian
            </span>
          </Link>
          <span className="text-slate-600 font-mono">/</span>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider font-semibold">
              FLAGSHIP: PALANTIR TECHNOLOGIES (PLTR)
            </span>
            <span className="flex items-center space-x-1.5 text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>VERIFIED & ADJUDICATED</span>
            </span>
          </div>
        </div>

        {/* 5-Stage Stepper Navigation */}
        <div className="flex items-center space-x-1 bg-[#12161f] p-1 rounded-lg border border-[#1f2633] text-xs font-medium">
          {[
            { stage: 1, label: "01. Research Seeds", icon: FileText, state: "Completed" },
            { stage: 2, label: "02. Knowledge Graph", icon: Network, state: "Mapped" },
            { stage: 3, label: "03. Agent Society", icon: Users, state: "Active" },
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
                    ? "bg-emerald-950/90 text-emerald-300 border border-emerald-500/40 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-[#181f2a]"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-emerald-400" : "text-slate-500"}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/app"
            className="text-xs px-3.5 py-1.5 rounded bg-[#161c24] hover:bg-emerald-950 border border-[#273243] text-slate-300 hover:text-emerald-300 font-medium transition-all shadow-sm flex items-center space-x-1.5"
          >
            <span>Custom Workspace</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </header>

      {/* Main Flagship Stage Viewer */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* ================= STAGE 01: Research Seeds ================= */}
        {currentStage === 1 && (
          <div className="flex-1 overflow-y-auto p-10 max-w-5xl mx-auto w-full">
            <div className="mb-8">
              <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-widest text-emerald-400 mb-1.5">
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
                  <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded bg-[#161c24] border border-[#273243] text-emerald-400">
                    Provenance Integrity: 100%
                  </span>
                </div>
              </div>
              <p className="text-sm text-slate-300 mt-3 max-w-3xl leading-relaxed font-serif">
                {demoData?.company?.description}
              </p>
            </div>

            {/* Editable Investigation Mandate */}
            <div className="p-6 rounded-lg bg-[#11151c] border border-[#1f2633] mb-8 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono uppercase text-slate-400 tracking-wider flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Investigation Objective & Analytical Mandate</span>
                </span>
                {!mandateEditing ? (
                  <button
                    onClick={() => setMandateEditing(true)}
                    className="text-xs font-mono text-emerald-400 hover:text-emerald-300 flex items-center space-x-1 cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Edit Mandate</span>
                  </button>
                ) : (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleSaveMandate}
                      className="text-xs font-mono px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white flex items-center space-x-1 cursor-pointer"
                    >
                      <Check className="w-3 h-3" />
                      <span>Save Mandate</span>
                    </button>
                    <button
                      onClick={() => setMandateEditing(false)}
                      className="text-xs font-mono px-2 py-1 rounded border border-[#273243] text-slate-400 hover:text-slate-200 cursor-pointer"
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
                  className="w-full mt-2 p-3 rounded bg-[#0a0d12] border border-emerald-500/40 text-xs text-slate-200 font-serif leading-relaxed focus:outline-none"
                />
              ) : (
                <p className="text-sm font-serif font-medium text-slate-200 leading-relaxed mt-1">
                  "{mandateText}"
                </p>
              )}

              {mandateSaved && (
                <div className="mt-2 text-xs font-mono text-emerald-400 flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Mandate updated and locked into agent research scope.</span>
                </div>
              )}

              {/* Scope Tags */}
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-[#1c222c]">
                {["Corporate Identity", "ASC 606 Revenue Quality", "Defense Appropriations", "NRR & Customer Concentration", "Quantitative Scenarios"].map(tag => (
                  <span key={tag} className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#161c24] border border-[#273243] text-slate-300">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Ingested Primary Seeds */}
            <h2 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-4 flex items-center justify-between">
              <span>Ingested Primary Disclosures & Provenance Documents ({demoData?.seeds?.length || 3})</span>
              <span className="text-[10px] text-emerald-400">Zero Synthetic Hallucinations</span>
            </h2>

            <div className="space-y-4 mb-10">
              {demoData?.seeds?.map((seed: any, idx: number) => (
                <div key={idx} className="p-5 rounded-lg bg-[#11151c] border border-[#1f2633] hover:border-slate-600 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
                        {seed.category}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        Verified by SEC / Government Registrar
                      </span>
                    </div>
                    <span className="text-xs font-mono text-emerald-400 font-semibold">
                      Reliability: {(seed.reliability * 100).toFixed(0)}%
                    </span>
                  </div>
                  <h3 className="font-semibold text-slate-100 text-sm mb-1">{seed.title}</h3>
                  <p className="text-xs text-slate-400 mb-3 font-mono">
                    Publisher: {seed.publisher} • Date: {seed.date}
                  </p>
                  
                  <div className="text-xs text-slate-300 leading-relaxed italic bg-[#0a0d12] p-3 rounded border border-[#1a202c]">
                    "{seed.summary}"
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-2 text-[11px] font-mono">
                    <span className="text-slate-500 truncate max-w-md">Source: {seed.url}</span>
                    <button
                      onClick={() => setSelectedSourceForModal(seed)}
                      className="text-emerald-400 hover:text-emerald-300 flex items-center space-x-1 cursor-pointer"
                    >
                      <Info className="w-3 h-3" />
                      <span>Inspect Excerpt Passage</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Stage Proceed Footer */}
            <div className="flex justify-between items-center pt-6 border-t border-[#1c222c]">
              <span className="text-xs font-mono text-slate-500">
                Primary factual grounding verified. Entity ontology ready.
              </span>
              <button
                onClick={() => setCurrentStage(2)}
                className="px-5 py-2.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center space-x-2 shadow-lg cursor-pointer transition-colors"
              >
                <span>Proceed to Stage 02: Knowledge Graph</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STAGE 02: Knowledge Graph ================= */}
        {currentStage === 2 && (
          <div className="flex-1 overflow-hidden grid grid-cols-12 divide-x divide-[#1c222c]">
            {/* Left 8 Cols: Interactive Graph Canvas & Filters */}
            <div className="col-span-8 flex flex-col overflow-hidden bg-[#0a0d12]">
              {/* Filter & Search Bar */}
              <div className="p-3 border-b border-[#1c222c] bg-[#10141b] flex items-center justify-between gap-3">
                <div className="flex items-center space-x-2 flex-1">
                  <Search className="w-3.5 h-3.5 text-slate-500" />
                  <input
                    type="text"
                    value={graphSearch}
                    onChange={(e) => setGraphSearch(e.target.value)}
                    placeholder="Search entities (e.g. DoD, AWS, TITAN, Azure)..."
                    className="w-full px-2 py-1 rounded bg-[#0a0d12] border border-[#1f2633] text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex items-center space-x-1 text-[11px] font-mono">
                  {["ALL", "CUSTOMER", "PARTNER", "COMPETITOR", "LEADERSHIP"].map((f) => (
                    <button
                      key={f}
                      onClick={() => setGraphTypeFilter(f)}
                      className={`px-2 py-1 rounded cursor-pointer ${
                        graphTypeFilter === f
                          ? "bg-emerald-950 text-emerald-300 border border-emerald-500/40"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>

                <div className="flex items-center space-x-1 pl-2 border-l border-[#1c222c]">
                  <button 
                    onClick={() => setGraphZoom(prev => Math.min(prev + 0.15, 1.8))}
                    className="p-1 rounded hover:bg-[#1a202c] text-slate-400 hover:text-slate-200"
                    title="Zoom in"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => setGraphZoom(prev => Math.max(prev - 0.15, 0.7))}
                    className="p-1 rounded hover:bg-[#1a202c] text-slate-400 hover:text-slate-200"
                    title="Zoom out"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => setGraphZoom(1)}
                    className="p-1 rounded hover:bg-[#1a202c] text-slate-400 hover:text-slate-200"
                    title="Reset view"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Interactive Graph Network Canvas */}
              <div className="flex-1 relative overflow-auto p-8 flex items-center justify-center">
                <div 
                  className="w-full h-full min-h-[500px] border border-[#1a202c] rounded-lg bg-[#0c1015] relative flex items-center justify-center p-8 transition-transform"
                  style={{ transform: `scale(${graphZoom})`, transformOrigin: "center center" }}
                >
                  {/* Center Node: Palantir */}
                  <div 
                    onClick={() => {
                      setSelectedNode({
                        id: "palantir_core",
                        label: "Palantir Technologies (PLTR)",
                        type: "Core Company",
                        description: "Prime enterprise software provider spanning defense command (Gotham), corporate intelligence (Foundry), continuous deployment (Apollo), and ontology-driven LLMs (AIP).",
                        confidence: 1.0,
                        citation: "SEC Form 10-K (CIK 0001321655)"
                      });
                      setSelectedEdge(null);
                    }}
                    className="z-20 px-4 py-3 rounded-xl bg-emerald-950/90 border-2 border-emerald-500 text-slate-100 shadow-xl cursor-pointer hover:scale-105 transition-all text-center"
                  >
                    <div className="text-[10px] font-mono uppercase text-emerald-400 font-bold">Investigated Entity</div>
                    <div className="font-serif font-bold text-sm">Palantir Technologies</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">NYSE: PLTR • Delaware, USA</div>
                  </div>

                  {/* Radiating Satellite Nodes */}
                  <div className="absolute inset-0 pointer-events-none">
                    <svg className="w-full h-full">
                      {/* Connection lines from center */}
                      <line x1="50%" y1="50%" x2="20%" y2="25%" stroke="#059669" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
                      <line x1="50%" y1="50%" x2="80%" y2="25%" stroke="#0284c7" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
                      <line x1="50%" y1="50%" x2="80%" y2="75%" stroke="#d97706" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
                      <line x1="50%" y1="50%" x2="20%" y2="75%" stroke="#10b981" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
                      <line x1="50%" y1="50%" x2="50%" y2="15%" stroke="#06b6d4" strokeWidth="1.5" opacity="0.6" />
                      <line x1="50%" y1="50%" x2="50%" y2="85%" stroke="#a855f7" strokeWidth="1.5" opacity="0.6" />
                    </svg>
                  </div>

                  {/* Satellite Node 1: U.S. Department of Defense */}
                  <div 
                    onClick={() => {
                      setSelectedNode({
                        id: "dod_agency",
                        label: "U.S. Department of Defense",
                        type: "Government Agency",
                        description: "Primary enterprise software customer driving Project Maven and Army command modernizations.",
                        confidence: 0.99,
                        citation: "CRS Report R47890 & FY2026 Defense Appropriations"
                      });
                      setSelectedEdge({
                        relationship: "CUSTOMER_OF",
                        source: "Palantir Technologies",
                        target: "U.S. Department of Defense",
                        confidence: 0.99,
                        description: "Prime enterprise software and intelligence operating system contract.",
                        citation: "DoD Contract Award Database"
                      });
                    }}
                    className="absolute top-[20%] left-[15%] z-20 p-3 rounded-lg bg-[#141922] border border-emerald-500/40 text-slate-100 hover:border-emerald-400 cursor-pointer text-center shadow-lg"
                  >
                    <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400">Customer (99%)</span>
                    <div className="font-semibold text-xs mt-1">U.S. Dept of Defense</div>
                    <div className="text-[9px] text-slate-400 font-mono">Government Agency</div>
                  </div>

                  {/* Satellite Node 2: Amazon Web Services */}
                  <div 
                    onClick={() => {
                      setSelectedNode({
                        id: "aws_cloud",
                        label: "Amazon Web Services",
                        type: "Cloud Infrastructure",
                        description: "Strategic cloud infrastructure partner providing GovCloud hosting and IL6 FedRAMP High accreditations.",
                        confidence: 0.96,
                        citation: "Palantir 10-K Note 4 & AWS Strategic Defense Alliance"
                      });
                      setSelectedEdge({
                        relationship: "PARTNERS_WITH",
                        source: "Palantir Technologies",
                        target: "Amazon Web Services",
                        confidence: 0.96,
                        description: "Strategic cloud infrastructure and IL6 security alliance.",
                        citation: "AWS GovCloud Defense Portal"
                      });
                    }}
                    className="absolute top-[20%] right-[15%] z-20 p-3 rounded-lg bg-[#141922] border border-cyan-500/40 text-slate-100 hover:border-cyan-400 cursor-pointer text-center shadow-lg"
                  >
                    <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400">Partner (96%)</span>
                    <div className="font-semibold text-xs mt-1">Amazon Web Services</div>
                    <div className="text-[9px] text-slate-400 font-mono">Cloud Infrastructure</div>
                  </div>

                  {/* Satellite Node 3: Microsoft Azure Government */}
                  <div 
                    onClick={() => {
                      setSelectedNode({
                        id: "azure_comp",
                        label: "Microsoft Azure Government",
                        type: "Competitor",
                        description: "Direct competitor in federal cloud analytics, AI infrastructure, and DoD joint warfighting software contracts.",
                        confidence: 0.93,
                        citation: "Morgan Stanley Sector Equity Analysis"
                      });
                      setSelectedEdge({
                        relationship: "COMPETES_WITH",
                        source: "Palantir Technologies",
                        target: "Microsoft Azure Government",
                        confidence: 0.93,
                        description: "Direct competition in government cloud analytics and defense deployments.",
                        citation: "DoD Enterprise Software Market Review"
                      });
                    }}
                    className="absolute bottom-[20%] right-[15%] z-20 p-3 rounded-lg bg-[#141922] border border-amber-500/40 text-slate-100 hover:border-amber-400 cursor-pointer text-center shadow-lg"
                  >
                    <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-amber-950 text-amber-400">Competitor (93%)</span>
                    <div className="font-semibold text-xs mt-1">Microsoft Azure</div>
                    <div className="text-[9px] text-slate-400 font-mono">Defense Cloud</div>
                  </div>

                  {/* Satellite Node 4: TITAN Program */}
                  <div 
                    onClick={() => {
                      setSelectedNode({
                        id: "titan_contract",
                        label: "TITAN Ground Station Program",
                        type: "Defense Contract",
                        description: "Tactical Intelligence Targeting Access Node vehicle integration contract awarded to Palantir as prime software integrator.",
                        confidence: 0.98,
                        citation: "U.S. Army Acquisition Program Baseline"
                      });
                      setSelectedEdge({
                        relationship: "CONTRACTED_WITH",
                        source: "Palantir Technologies",
                        target: "TITAN Ground Station Program",
                        confidence: 0.98,
                        description: "Prime software integration vehicle contract.",
                        citation: "Army Contracting Command Award"
                      });
                    }}
                    className="absolute bottom-[20%] left-[15%] z-20 p-3 rounded-lg bg-[#141922] border border-emerald-500/40 text-slate-100 hover:border-emerald-400 cursor-pointer text-center shadow-lg"
                  >
                    <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400">Contract (98%)</span>
                    <div className="font-semibold text-xs mt-1">TITAN Program</div>
                    <div className="text-[9px] text-slate-400 font-mono">U.S. Army Tactical Node</div>
                  </div>

                  {/* Satellite Node 5: AIP Enterprise Platform */}
                  <div 
                    onClick={() => {
                      setSelectedNode({
                        id: "aip_platform",
                        label: "AIP Enterprise Platform",
                        type: "Core Product",
                        description: "Proprietary software platform enabling commercial enterprise automation and real-time defense battle management ontologies.",
                        confidence: 0.99,
                        citation: "Palantir Technologies Official Product Specifications"
                      });
                    }}
                    className="absolute top-[8%] left-[50%] -translate-x-1/2 z-20 p-2.5 rounded-lg bg-[#141922] border border-cyan-500/40 text-slate-100 hover:border-cyan-400 cursor-pointer text-center shadow-lg"
                  >
                    <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400">Product (99%)</span>
                    <div className="font-semibold text-xs mt-0.5">AIP Enterprise Platform</div>
                  </div>

                  {/* Satellite Node 6: Leadership (Alex Karp & Peter Thiel) */}
                  <div 
                    onClick={() => {
                      setSelectedNode({
                        id: "leadership_node",
                        label: "Dr. Alex Karp & Peter Thiel",
                        type: "Leadership / Founders",
                        description: "Co-founders directing sovereign government focus, Class F voting control structure, and commercial go-to-market.",
                        confidence: 0.99,
                        citation: "SEC DEF 14A Proxy Statement"
                      });
                    }}
                    className="absolute bottom-[8%] left-[50%] -translate-x-1/2 z-20 p-2.5 rounded-lg bg-[#141922] border border-purple-500/40 text-slate-100 hover:border-purple-400 cursor-pointer text-center shadow-lg"
                  >
                    <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-purple-950 text-purple-400">Governance (99%)</span>
                    <div className="font-semibold text-xs mt-0.5">Alex Karp & Peter Thiel</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right 4 Cols: Entity & Relationship Inspector */}
            <div className="col-span-4 flex flex-col overflow-hidden bg-[#0e1217]">
              <div className="p-3.5 border-b border-[#1c222c] bg-[#12161f] text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Entity & Provenance Inspector</span>
                <span className="text-emerald-400 text-[10px]">Active Node</span>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                {selectedNode ? (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                        {selectedNode.type}
                      </span>
                      <span className="text-xs font-mono text-emerald-400 font-semibold">
                        Confidence: {(selectedNode.confidence * 100).toFixed(0)}%
                      </span>
                    </div>

                    <h2 className="text-xl font-serif font-bold text-slate-100 mb-1">{selectedNode.label}</h2>
                    <p className="text-xs text-slate-300 leading-relaxed font-serif bg-[#0a0d12] p-3 rounded border border-[#1f2633] mb-4">
                      {selectedNode.description}
                    </p>

                    <div className="p-3 rounded bg-[#12161e] border border-[#1f2633] space-y-2 mb-4 text-xs font-mono">
                      <div className="text-[10px] uppercase text-slate-500">Documentary Provenance</div>
                      <div className="text-emerald-400 text-xs">{selectedNode.citation || "SEC 10-K & Defense Registries"}</div>
                    </div>

                    {selectedEdge && (
                      <div className="p-3.5 rounded bg-[#141922] border border-cyan-800/40 text-xs">
                        <div className="text-[10px] font-mono uppercase text-cyan-400 mb-1">Inspected Relationship</div>
                        <div className="font-semibold text-slate-200 mb-1">
                          {selectedEdge.source} <span className="text-cyan-400 font-mono">[{selectedEdge.relationship}]</span> {selectedEdge.target}
                        </div>
                        <p className="text-xs text-slate-300 font-serif leading-relaxed mb-2">
                          "{selectedEdge.description}"
                        </p>
                        <div className="text-[10px] font-mono text-slate-500">
                          Source: {selectedEdge.citation}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-500 text-xs font-mono">
                    Click any node or connector to inspect its entity provenance.
                  </div>
                )}
              </div>

              {/* Stage Navigation Footer */}
              <div className="p-4 border-t border-[#1c222c] bg-[#10141b] flex justify-between items-center">
                <button
                  onClick={() => setCurrentStage(1)}
                  className="px-3 py-1.5 rounded border border-[#273243] text-slate-400 hover:text-slate-200 text-xs cursor-pointer"
                >
                  Back to Seeds
                </button>
                <button
                  onClick={() => setCurrentStage(3)}
                  className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center space-x-1.5 shadow-lg cursor-pointer"
                >
                  <span>Stage 03: Agent Society</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= STAGE 03: Agent Society & Interrogation ================= */}
        {currentStage === 3 && (
          <div className="flex-1 overflow-hidden grid grid-cols-12 divide-x divide-[#1c222c]">
            {/* Left 4 Cols: Society Agents Roster */}
            <div className="col-span-4 flex flex-col overflow-hidden bg-[#0c1015]">
              <div className="p-3 border-b border-[#1c222c] bg-[#10141b] flex items-center justify-between gap-2">
                <div className="flex items-center space-x-1.5 flex-1">
                  <Search className="w-3 h-3 text-slate-500" />
                  <input
                    type="text"
                    value={agentSearch}
                    onChange={(e) => setAgentSearch(e.target.value)}
                    placeholder="Search 14 specialists..."
                    className="w-full px-2 py-0.5 rounded bg-[#080a0d] border border-[#1f2633] text-[11px] text-slate-200 focus:outline-none"
                  />
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30">
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
                        ? "bg-[#161c26] border-emerald-500/60 text-slate-100 shadow-sm"
                        : "bg-[#11151c] border-[#1c222c] text-slate-300 hover:border-slate-600"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-xs text-slate-100 truncate">{ag.name}</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#1c222c] text-emerald-400">
                        {(ag.confidence * 100).toFixed(0)}% Conf
                      </span>
                    </div>
                    <div className="text-[11px] font-medium text-slate-400 truncate">{ag.role}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{ag.specialization}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Right 8 Cols: Agent Workspace, Interrogation & Shock Injection */}
            <div className="col-span-8 flex flex-col overflow-hidden bg-[#080a0d]">
              {selectedAgent ? (
                <div className="flex-1 flex flex-col overflow-hidden">
                  {/* Selected Agent Header */}
                  <div className="p-6 border-b border-[#1c222c] bg-[#10141b]">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-xs font-mono uppercase text-emerald-400 tracking-wider mb-1">
                          {selectedAgent.role}
                        </div>
                        <h2 className="text-xl font-serif font-bold text-slate-100">{selectedAgent.name}</h2>
                        <p className="text-xs text-slate-400 mt-0.5 font-mono">{selectedAgent.specialization}</p>
                      </div>
                      <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-[#161c24] border border-[#273243] text-slate-200">
                        Style: {selectedAgent.analytical_style}
                      </span>
                    </div>

                    <div className="mt-3 p-3 rounded bg-[#080a0d] border border-[#1c222c] text-xs text-slate-200 font-serif leading-relaxed">
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
                  <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Direct Interrogation Console */}
                    <div className="p-5 rounded-lg bg-[#11151c] border border-emerald-500/30">
                      <div className="flex items-center space-x-2 text-xs font-medium text-emerald-400 mb-2">
                        <MessageSquare className="w-4 h-4" />
                        <span>Direct Interrogation Console (Question {selectedAgent.name})</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mb-3">
                        Ask this specialist about audited figures, revenue durability, or customer concentration. Responses are grounded in verified evidence.
                      </p>
                      <form onSubmit={handleIntervention} className="space-y-3">
                        <textarea
                          value={interventionQuery}
                          onChange={(e) => setInterventionQuery(e.target.value)}
                          rows={2}
                          placeholder={`Ask ${selectedAgent.name} e.g. "What is the primary risk if the DoD contract fails to renew?"...`}
                          className="w-full px-3 py-2 rounded bg-[#080a0d] border border-[#1c222c] text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-sans"
                        />
                        <div className="flex justify-between items-center">
                          <div className="text-[10px] font-mono text-slate-500">
                            Context: SEC 10-K • CRS Appropriations • MS Research
                          </div>
                          <button
                            type="submit"
                            disabled={interventionLoading || !interventionQuery.trim()}
                            className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                          >
                            <Send className="w-3 h-3" />
                            <span>{interventionLoading ? "Interrogating..." : "Submit Question"}</span>
                          </button>
                        </div>
                      </form>

                      {interventionHistory.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-[#1c222c] space-y-3 text-xs">
                          {interventionHistory.map((item, idx) => (
                            <div key={idx} className="p-3.5 rounded bg-[#080a0d] border border-[#1c222c]">
                              <div className="text-[10px] font-mono text-emerald-400 uppercase font-semibold">You Asked:</div>
                              <div className="text-slate-300 italic mb-2">"{item.user_query}"</div>
                              <div className="text-[10px] font-mono text-cyan-400 uppercase font-semibold">{item.agent_name} Responded:</div>
                              <div className="text-slate-200 font-serif leading-relaxed mt-1">{item.agent_reply}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Exogenous Shock / Hypothetical Event Injection */}
                    <div className="p-5 rounded-lg bg-[#11151c] border border-amber-800/30">
                      <div className="flex items-center space-x-2 text-xs font-medium text-amber-400 mb-1">
                        <Sparkles className="w-4 h-4" />
                        <span>Exogenous Shock / Hypothetical Event Injection</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mb-3">
                        Simulate an exogenous market shock. Stressed models will dynamically recalculate while preserving verified canonical history.
                      </p>

                      {/* Quick Presets */}
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {[
                          "U.S. defense appropriations reduced by 25% amidst procurement delay",
                          "Federal procurement cycle extends beyond 180 days",
                          "Tier 1 hyperscaler cancels sovereign IL6 cloud exclusivity"
                        ].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={(e) => handleInjectHypothetical(e, preset)}
                            className="text-[10px] font-mono px-2 py-1 rounded bg-[#161c24] hover:bg-amber-950/40 border border-[#273243] hover:border-amber-600/40 text-slate-300 hover:text-amber-200 cursor-pointer"
                          >
                            + {preset.slice(0, 42)}...
                          </button>
                        ))}
                      </div>

                      <form onSubmit={handleInjectHypothetical} className="flex space-x-2">
                        <input
                          type="text"
                          value={hypoEvent}
                          onChange={(e) => setHypoEvent(e.target.value)}
                          placeholder="Or type custom shock: e.g. Contract cancellation in NATO sovereign segment..."
                          className="flex-1 px-3 py-1.5 rounded bg-[#080a0d] border border-[#1c222c] text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-sans"
                        />
                        <button
                          type="submit"
                          disabled={hypoLoading || !hypoEvent.trim()}
                          className="px-4 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs cursor-pointer disabled:opacity-50"
                        >
                          {hypoLoading ? "Simulating..." : "Inject Shock"}
                        </button>
                      </form>

                      {/* Live Stressed Shock Results */}
                      {activeHypoResult && (
                        <div className="mt-4 p-4 rounded bg-[#0e131a] border border-amber-800/40 space-y-3">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/40 font-bold">
                              HYPOTHETICAL SHOCK RECORDED
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              Baseline History Preserved
                            </span>
                          </div>

                          <div className="text-xs font-serif text-slate-200 italic">
                            "{activeHypoResult.event_description}"
                          </div>

                          {/* Delta Comparison Matrix */}
                          {activeHypoResult.stressed_metrics && (
                            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#1c222c]">
                              <div className="p-2.5 rounded bg-[#080a0d] border border-[#1c222c]">
                                <div className="text-[10px] font-mono text-slate-400">Baseline Multiple</div>
                                <div className="text-sm font-mono font-bold text-emerald-400 mt-0.5">
                                  {activeHypoResult.baseline_metrics?.terminal_multiple || "8.0x ARR"}
                                </div>
                                <div className="text-[10px] text-slate-500 mt-1">Revenue: $2,225M</div>
                              </div>
                              <div className="p-2.5 rounded bg-[#080a0d] border border-amber-900/40">
                                <div className="text-[10px] font-mono text-amber-400">Stressed Multiple</div>
                                <div className="text-sm font-mono font-bold text-amber-300 mt-0.5">
                                  {activeHypoResult.stressed_metrics?.terminal_multiple || "3.0x ARR"}
                                </div>
                                <div className="text-[10px] text-amber-400/80 mt-1">
                                  Stressed Rev: ${activeHypoResult.stressed_metrics?.revenue_usd_m}M
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Agent Reactions */}
                          {activeHypoResult.agent_reactions && (
                            <div className="space-y-1.5 pt-2 border-t border-[#1c222c]">
                              <div className="text-[10px] font-mono uppercase text-slate-400">Cross-Agent Reactions:</div>
                              {activeHypoResult.agent_reactions.map((rx: any, idx: number) => (
                                <div key={idx} className="text-xs p-2 rounded bg-[#080a0d] border border-[#1c222c]">
                                  <span className="font-semibold text-slate-200 text-[11px]">{rx.agent_name}: </span>
                                  <span className="text-slate-300 font-serif">{rx.reaction}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Stage Footer */}
                  <div className="p-4 border-t border-[#1c222c] bg-[#10141b] flex justify-between items-center">
                    <button
                      onClick={() => setCurrentStage(2)}
                      className="px-4 py-2 rounded border border-[#273243] text-slate-400 hover:text-slate-200 text-xs cursor-pointer"
                    >
                      Back to Graph
                    </button>
                    <button
                      onClick={() => setCurrentStage(4)}
                      className="px-5 py-2.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center space-x-2 shadow-lg cursor-pointer"
                    >
                      <span>Proceed to Stage 04: Boardroom Debate</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}

        {/* ================= STAGE 04: Boardroom Debate ================= */}
        {currentStage === 4 && (
          <div className="flex-1 overflow-hidden grid grid-cols-12 divide-x divide-[#1c222c]">
            {/* Panel A: 3 Cols - Specialist Roster & Stances */}
            <div className="col-span-3 flex flex-col overflow-hidden bg-[#0c1015]">
              <div className="p-3.5 border-b border-[#1c222c] bg-[#10141b] text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Specialist Roster</span>
                <span className="text-emerald-400 text-[10px]">Stances</span>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
                {societyAgents.map((ag) => (
                  <div key={ag.id} className="p-2.5 rounded bg-[#11151c] border border-[#1c222c] text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-slate-200 text-[11px] truncate">{ag.name}</span>
                      <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                        ag.agent_id === "bull_analyst" ? "bg-emerald-950 text-emerald-400" :
                        ag.agent_id === "bear_analyst" ? "bg-amber-950 text-amber-400" :
                        ag.agent_id === "final_adjudicator" ? "bg-purple-950 text-purple-400" :
                        "bg-[#1c222c] text-slate-300"
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
            <div className="col-span-6 flex flex-col overflow-hidden bg-[#080a0d]">
              <div className="p-3.5 border-b border-[#1c222c] bg-[#10141b] flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-emerald-400">
                    Adversarial Deliberation Floor
                  </span>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">
                    Structured Challenges, Rebuttals & Judicial Rulings
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#161c24] text-slate-300 border border-[#273243]">
                  {claims.length} Claims • {debates[0]?.arguments?.length || 4} Arguments
                </span>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {/* Claims Bar */}
                <div className="space-y-2 mb-4">
                  <div className="text-[10px] font-mono uppercase text-slate-400">Audited Claims in Dispute:</div>
                  {claims.map((c) => (
                    <div 
                      key={c.id} 
                      onClick={() => setSelectedClaim(c)}
                      className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                        selectedClaim?.id === c.id 
                          ? "bg-[#18202b] border-emerald-500/60 shadow-sm" 
                          : "bg-[#11151c] border-[#1c222c] hover:border-slate-600"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 rounded bg-[#1c222c] text-slate-300">
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
                  <div key={d.id} className="p-4 rounded-lg bg-[#10141b] border border-[#1c222c]">
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
                              : "bg-[#141922] border-[#1c222c] text-slate-300"
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
              <div className="p-4 border-t border-[#1c222c] bg-[#10141b] flex justify-between items-center">
                <button
                  onClick={() => setCurrentStage(3)}
                  className="px-4 py-2 rounded border border-[#273243] text-slate-400 hover:text-slate-200 text-xs cursor-pointer"
                >
                  Back to Society
                </button>
                <button
                  onClick={() => setCurrentStage(5)}
                  className="px-5 py-2.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center space-x-2 shadow-lg cursor-pointer"
                >
                  <span>Proceed to Stage 05: Intelligence Dossier</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Panel C: 3 Cols - Evidence Inspector */}
            <div className="col-span-3 flex flex-col overflow-hidden bg-[#0c1015]">
              <div className="p-3.5 border-b border-[#1c222c] bg-[#10141b] text-xs font-mono uppercase tracking-wider text-slate-400">
                Evidence Inspector
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {selectedClaim ? (
                  <div>
                    <div className="text-[10px] font-mono text-emerald-400 uppercase mb-1">Claim Under Audit</div>
                    <div className="text-xs font-serif text-slate-200 bg-[#12161e] p-3 rounded border border-[#1c222c] mb-4">
                      "{selectedClaim.statement}"
                    </div>

                    <div className="text-[10px] font-mono uppercase text-slate-400 mb-1.5">Supporting Citations:</div>
                    <div className="p-3 rounded bg-[#0a0d12] border border-[#1c222c] space-y-2 text-xs">
                      <div className="text-emerald-400 font-mono text-[11px]">Primary SEC 10-K Filing</div>
                      <p className="text-slate-400 italic text-[11px] font-serif">
                        "For the fiscal year ended December 31, 2025, commercial customer count expanded 54% in the US, with top customer concentration disclosed at 18.2%."
                      </p>
                    </div>

                    <div className="mt-4 p-3 rounded bg-[#0a0d12] border border-[#1c222c] space-y-2 text-xs">
                      <div className="text-cyan-400 font-mono text-[11px]">CRS Defense Modernization Report</div>
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
              <article className="p-8 rounded-lg bg-[#11151c] border border-[#1f2633] text-slate-200 shadow-xl">
                <div className="border-b border-[#1c222c] pb-6 mb-6 flex items-start justify-between">
                  <div>
                    <div className="text-xs font-mono uppercase tracking-widest text-emerald-400 mb-2">
                      Stage 05 • Institutional Dossier • Version {primaryReport.version}
                    </div>
                    <h1 className="text-2xl font-serif font-bold text-slate-100">{primaryReport.title}</h1>
                    <p className="text-xs font-mono text-slate-400 mt-2">
                      Generated on {new Date(primaryReport.created_at).toLocaleDateString()} • {primaryReport.citations_count} Audited Citations • 100% Provenance
                    </p>
                  </div>
                  <button
                    onClick={() => window.print()}
                    className="px-3.5 py-2 rounded border border-[#273243] hover:border-slate-500 text-slate-300 text-xs flex items-center space-x-1.5 cursor-pointer shadow-sm hover:bg-[#161c24] transition-all"
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
                  <div className="text-sm font-serif leading-relaxed p-4 rounded bg-[#0e1218] border border-[#1c222c] text-slate-300">
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
                      <div className="p-4 rounded bg-[#0e1218] border border-[#1c222c]">
                        <div className="text-slate-400 text-[11px] font-mono">Revenue (LTM)</div>
                        <div className="text-xl font-mono font-bold text-slate-100 mt-1">
                          ${primaryReport.financial_analysis.revenue_usd_m}M
                        </div>
                        <div className="text-[10px] text-slate-500 mt-1">GAAP SEC Form 10-K</div>
                      </div>
                      <div className="p-4 rounded bg-[#0e1218] border border-[#1c222c]">
                        <div className="text-slate-400 text-[11px] font-mono">Gross Margin</div>
                        <div className="text-xl font-mono font-bold text-emerald-400 mt-1">
                          {primaryReport.financial_analysis.gross_margin_pct}%
                        </div>
                        <div className="text-[10px] text-slate-500 mt-1">Software gross margin</div>
                      </div>
                      <div className="p-4 rounded bg-[#0e1218] border border-[#1c222c]">
                        <div className="text-slate-400 text-[11px] font-mono">Operating Cash Flow</div>
                        <div className="text-xl font-mono font-bold text-cyan-400 mt-1">
                          ${primaryReport.financial_analysis.operating_cash_flow_m}M
                        </div>
                        <div className="text-[10px] text-slate-500 mt-1">Cash conversion &gt; 30%</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-3.5 rounded bg-[#0e1218] border border-[#1c222c]">
                        <div className="text-slate-400 text-[11px] font-mono">Liquid Capital</div>
                        <div className="text-lg font-mono font-semibold text-slate-200 mt-1">
                          ${primaryReport.financial_analysis.cash_reserves_m}M
                        </div>
                      </div>
                      <div className="p-3.5 rounded bg-[#0e1218] border border-[#1c222c]">
                        <div className="text-slate-400 text-[11px] font-mono">Net Retention (NRR)</div>
                        <div className="text-lg font-mono font-semibold text-emerald-400 mt-1">
                          {primaryReport.financial_analysis.nrr_pct}%
                        </div>
                      </div>
                      <div className="p-3.5 rounded bg-[#0e1218] border border-[#1c222c]">
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
                        <div key={key} className="p-4 rounded bg-[#0e1218] border border-[#1c222c]">
                          <div className="flex items-center justify-between text-xs font-mono text-emerald-400 uppercase font-semibold mb-1">
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
                        <div key={idx} className="p-3 rounded bg-[#0e1218] border border-[#1c222c] flex items-center justify-between text-xs">
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
                <div className="flex justify-between items-center pt-6 border-t border-[#1c222c]">
                  <button
                    onClick={() => setCurrentStage(4)}
                    className="px-4 py-2 rounded border border-[#273243] text-slate-400 hover:text-slate-200 text-xs cursor-pointer"
                  >
                    Back to Debate
                  </button>
                  <Link
                    href="/app"
                    className="px-5 py-2.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center space-x-2 shadow-lg"
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
      </main>

      {/* Excerpt Passage Modal (Stage 01) */}
      {selectedSourceForModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="max-w-xl w-full p-6 rounded-lg bg-[#11151c] border border-[#1f2633] text-slate-200 shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30">
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
            <div className="p-4 rounded bg-[#0a0d12] border border-[#1c222c] text-xs font-serif leading-relaxed text-slate-300 italic mb-4">
              "{selectedSourceForModal.summary}"
            </div>
            <div className="text-[11px] font-mono text-slate-500 truncate mb-4">
              Source URL: {selectedSourceForModal.url}
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setSelectedSourceForModal(null)}
                className="px-4 py-1.5 rounded bg-[#161c24] hover:bg-[#1e2633] text-xs font-medium text-slate-200 cursor-pointer"
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
          <div className="max-w-lg w-full p-6 rounded-lg bg-[#11151c] border border-amber-800/40 text-slate-200 shadow-2xl">
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

            <div className="text-xs text-slate-300 italic bg-[#0a0d12] p-3 rounded border border-[#1c222c] mb-4 font-serif">
              "{challengeModalClaim.statement}"
            </div>

            <form onSubmit={handleSubmitChallenge} className="space-y-4">
              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">Select Challenging Specialist:</label>
                <select
                  value={challengeChallenger}
                  onChange={(e) => setChallengeChallenger(e.target.value)}
                  className="w-full px-3 py-1.5 rounded bg-[#0a0d12] border border-[#1c222c] text-xs text-slate-200 focus:outline-none font-mono"
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
                  className="w-full px-3 py-2 rounded bg-[#0a0d12] border border-[#1c222c] text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-sans"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setChallengeModalClaim(null)}
                  className="px-3 py-1.5 rounded border border-[#273243] text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
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
