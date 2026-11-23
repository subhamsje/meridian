"use client";

import React, { useState, useEffect } from "react";
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
  Printer
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
  const [debates, setDebates] = useState<any[]>([]);
  const [evidence, setEvidence] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);

  // User Intervention in Demo
  const [interventionQuery, setInterventionQuery] = useState("");
  const [interventionLoading, setInterventionLoading] = useState(false);
  const [interventionHistory, setInterventionHistory] = useState<any[]>([]);

  // Exogenous Hypothetical Event Injection
  const [hypoEvent, setHypoEvent] = useState("");
  const [hypoInjected, setHypoInjected] = useState(false);

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
      const [detailRes, graphRes, agentsRes, interRes, claimsRes, debatesRes, evRes, reportsRes] = await Promise.all([
        fetch(`${API_BASE}/investigations/${invId}`, { headers: { Authorization: `Bearer ${jwt}` } }),
        fetch(`${API_BASE}/investigations/${invId}/graph`, { headers: { Authorization: `Bearer ${jwt}` } }),
        fetch(`${API_BASE}/investigations/${invId}/society/agents`, { headers: { Authorization: `Bearer ${jwt}` } }),
        fetch(`${API_BASE}/investigations/${invId}/society/interactions`, { headers: { Authorization: `Bearer ${jwt}` } }),
        fetch(`${API_BASE}/investigations/${invId}/claims`, { headers: { Authorization: `Bearer ${jwt}` } }),
        fetch(`${API_BASE}/investigations/${invId}/debates`, { headers: { Authorization: `Bearer ${jwt}` } }),
        fetch(`${API_BASE}/investigations/${invId}/evidence`, { headers: { Authorization: `Bearer ${jwt}` } }),
        fetch(`${API_BASE}/investigations/${invId}/reports`, { headers: { Authorization: `Bearer ${jwt}` } }),
      ]);

      if (detailRes.ok) setInvDetail(await detailRes.json());
      if (graphRes.ok) setGraphData(await graphRes.json());
      if (agentsRes.ok) {
        const ags = await agentsRes.json();
        setSocietyAgents(ags);
        if (ags.length > 0) setSelectedAgent(ags[0]);
      }
      if (interRes.ok) setInteractions(await interRes.json());
      if (claimsRes.ok) setClaims(await claimsRes.json());
      if (debatesRes.ok) setDebates(await debatesRes.json());
      if (evRes.ok) setEvidence(await evRes.json());
      if (reportsRes.ok) setReports(await reportsRes.json());
    } catch (e) {
      console.error(e);
    }
  };

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
        // Reload interactions
        const interRes = await fetch(`${API_BASE}/investigations/${demoData.investigation_id}/society/interactions`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (interRes.ok) setInteractions(await interRes.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setInterventionLoading(false);
    }
  };

  const handleInjectHypothetical = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hypoEvent.trim()) return;
    setHypoInjected(true);
  };

  const primaryReport = reports[0];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080a0d] flex flex-col items-center justify-center text-slate-300">
        <div className="w-10 h-10 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 animate-spin mb-4"></div>
        <p className="text-xs font-mono uppercase tracking-widest text-emerald-400">
          Mounting Flagship Investigation & Agent Society...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0d10] text-[#e1e4ea] flex flex-col font-sans">
      {/* Top Flagship Header */}
      <header className="h-16 border-b border-[#20252e] bg-[#0e1217] px-6 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <Link href="/" className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded bg-emerald-950 border border-emerald-500/40 flex items-center justify-center font-mono font-bold text-emerald-400 text-xs">
              M
            </div>
            <span className="font-semibold text-sm tracking-wider uppercase text-slate-100">
              Meridian
            </span>
          </Link>
          <span className="text-slate-600">|</span>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
            Flagship Investigation: Palantir Technologies (PLTR)
          </span>
        </div>

        {/* 5-Stage Stepper Navigation */}
        <div className="flex items-center space-x-1 bg-[#141922] p-1 rounded-lg border border-[#20252e] text-xs font-medium">
          {[
            { stage: 1, label: "01. Research Seeds", icon: FileText },
            { stage: 2, label: "02. Knowledge Graph", icon: Network },
            { stage: 3, label: "03. Agent Society", icon: Users },
            { stage: 4, label: "04. Boardroom Debate", icon: Scale },
            { stage: 5, label: "05. Intelligence Dossier", icon: ShieldCheck },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = currentStage === item.stage;
            return (
              <button
                key={item.stage}
                onClick={() => setCurrentStage(item.stage as any)}
                className={`px-3 py-1.5 rounded transition-all flex items-center space-x-1.5 cursor-pointer ${
                  isActive
                    ? "bg-emerald-950 text-emerald-300 border border-emerald-500/40 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/app"
            className="text-xs px-3.5 py-1.5 rounded bg-[#1c222b] hover:bg-emerald-950 border border-[#2d3748] text-slate-300 hover:text-emerald-300 font-medium transition-all"
          >
            Open Analyst Workspace
          </Link>
        </div>
      </header>

      {/* Main Flagship Stage Viewer */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* STAGE 01: Research Seeds */}
        {currentStage === 1 && (
          <div className="flex-1 overflow-y-auto p-10 max-w-5xl mx-auto w-full">
            <div className="mb-8">
              <span className="text-xs font-mono uppercase tracking-widest text-emerald-400">
                Stage 01 • Primary Corporate Disclosures & Research Seeds
              </span>
              <h1 className="text-3xl font-serif font-bold text-slate-100 mt-2">
                Palantir Technologies Inc. (NYSE: PLTR)
              </h1>
              <p className="text-sm text-slate-400 mt-2 max-w-3xl leading-relaxed">
                {demoData?.company?.description}
              </p>
            </div>

            <div className="p-5 rounded-lg bg-[#141922] border border-[#20252e] mb-8">
              <div className="text-xs font-mono uppercase text-slate-400 mb-1">Investigation Objective & Mandate</div>
              <p className="text-sm font-serif font-medium text-slate-200 leading-relaxed">
                "{demoData?.company?.research_question}"
              </p>
            </div>

            <h2 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-4">
              Ingested Primary Disclosures & Verified Seeds ({demoData?.seeds?.length || 3})
            </h2>

            <div className="space-y-4 mb-10">
              {demoData?.seeds?.map((seed: any, idx: number) => (
                <div key={idx} className="p-5 rounded-lg bg-[#12161e] border border-[#20252e]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                      {seed.category}
                    </span>
                    <span className="text-xs font-mono text-emerald-400">
                      Reliability Score: {(seed.reliability * 100).toFixed(0)}%
                    </span>
                  </div>
                  <h3 className="font-semibold text-slate-100 text-sm mb-1">{seed.title}</h3>
                  <p className="text-xs text-slate-400 mb-2 font-mono">Publisher: {seed.publisher} • {seed.date}</p>
                  <p className="text-xs text-slate-300 leading-relaxed italic bg-[#0b0d10] p-3 rounded border border-[#20252e]">
                    "{seed.summary}"
                  </p>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setCurrentStage(2)}
                className="px-5 py-2.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center space-x-2 shadow-lg cursor-pointer"
              >
                <span>Proceed to Stage 02: Knowledge Graph</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STAGE 02: Ontology & Knowledge Graph */}
        {currentStage === 2 && (
          <div className="flex-1 overflow-y-auto p-10 max-w-6xl mx-auto w-full">
            <div className="mb-8 flex items-start justify-between">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-emerald-400">
                  Stage 02 • Corporate Lineage & Knowledge Graph
                </span>
                <h1 className="text-2xl font-serif font-bold text-slate-100 mt-2">
                  Entity Extraction & Corporate Network
                </h1>
                <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                  Extracted relationships mapping prime government customers, underlying cloud infrastructure vendors, and direct defense competitors.
                </p>
              </div>
              <div className="text-xs font-mono px-3 py-1.5 rounded bg-[#161c24] border border-[#20252e] text-emerald-400">
                {graphData.nodes.length} Verified Nodes • {graphData.edges.length} Relational Edges
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {graphData.edges.map((edge: any) => (
                <div key={edge.id} className="p-4 rounded-lg bg-[#141922] border border-[#20252e]">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${
                      edge.relationship === "customer" 
                        ? "bg-emerald-950/50 text-emerald-400 border-emerald-500/30"
                        : edge.relationship === "competitor"
                        ? "bg-amber-950/50 text-amber-400 border-amber-500/30"
                        : "bg-cyan-950/50 text-cyan-400 border-cyan-500/30"
                    }`}>
                      {edge.relationship}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      Confidence: {(edge.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-slate-100 mb-1">
                    Palantir Technologies <span className="text-slate-500">→</span> {graphData.nodes.find((n: any) => n.id === edge.target)?.label || "Connected Node"}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed font-serif">
                    {edge.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-6 border-t border-[#20252e]">
              <button
                onClick={() => setCurrentStage(1)}
                className="px-4 py-2 rounded border border-[#2d3748] text-slate-400 hover:text-slate-200 text-xs"
              >
                Back to Stage 01
              </button>
              <button
                onClick={() => setCurrentStage(3)}
                className="px-5 py-2.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center space-x-2 shadow-lg cursor-pointer"
              >
                <span>Proceed to Stage 03: Agent Society</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STAGE 03: Multi-Agent Society & Interactive Interrogation */}
        {currentStage === 3 && (
          <div className="flex-1 overflow-hidden grid grid-cols-12 divide-x divide-[#20252e]">
            {/* Left 4 Cols: Society Agents */}
            <div className="col-span-4 flex flex-col overflow-hidden bg-[#0e1217]">
              <div className="p-3 border-b border-[#20252e] text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Society Population</span>
                <span className="text-emerald-400">{societyAgents.length} Agents</span>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
                {societyAgents.map((ag) => (
                  <button
                    key={ag.id}
                    onClick={() => setSelectedAgent(ag)}
                    className={`w-full text-left p-3 rounded border transition-all cursor-pointer ${
                      selectedAgent?.id === ag.id
                        ? "bg-[#181f2a] border-emerald-500/50 text-slate-100"
                        : "bg-[#12161e] border-[#20252e] text-slate-300 hover:border-slate-600"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-xs text-slate-100 truncate">{ag.name}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#1c222b] text-emerald-400">
                        {(ag.confidence * 100).toFixed(0)}% Conf
                      </span>
                    </div>
                    <div className="text-[11px] font-medium text-slate-400">{ag.role}</div>
                    <div className="text-[10px] text-slate-500 mt-1 line-clamp-1">{ag.specialization}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Right 8 Cols: Interrogation Console & Society Deliberation */}
            <div className="col-span-8 flex flex-col overflow-hidden bg-[#0b0d10]">
              {selectedAgent ? (
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="p-6 border-b border-[#20252e] bg-[#12161e]">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-xs font-mono uppercase text-emerald-400 tracking-wider mb-1">
                          {selectedAgent.role}
                        </div>
                        <h2 className="text-xl font-serif font-bold text-slate-100">{selectedAgent.name}</h2>
                        <p className="text-xs text-slate-400 mt-1">{selectedAgent.specialization}</p>
                      </div>
                      <span className="text-xs font-mono px-2.5 py-1 rounded bg-[#1c222b] border border-[#2d3748] text-slate-200">
                        Style: {selectedAgent.analytical_style}
                      </span>
                    </div>

                    <div className="mt-3 p-3 rounded bg-[#0b0d10] border border-[#20252e] text-xs text-slate-200 font-serif leading-relaxed">
                      "{selectedAgent.current_position || "Analysis complete."}"
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Direct Interrogation Console */}
                    <div className="p-5 rounded-lg bg-[#12161e] border border-emerald-500/30">
                      <div className="flex items-center space-x-2 text-xs font-medium text-emerald-400 mb-2">
                        <MessageSquare className="w-4 h-4" />
                        <span>Direct Interrogation Console (Question {selectedAgent.name})</span>
                      </div>
                      <form onSubmit={handleIntervention} className="space-y-3">
                        <textarea
                          value={interventionQuery}
                          onChange={(e) => setInterventionQuery(e.target.value)}
                          rows={2}
                          placeholder={`Ask ${selectedAgent.name} about customer concentration or government contract exposure...`}
                          className="w-full px-3 py-2 rounded bg-[#0b0d10] border border-[#20252e] text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                        />
                        <div className="flex justify-end">
                          <button
                            type="submit"
                            disabled={interventionLoading || !interventionQuery.trim()}
                            className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                          >
                            <Send className="w-3 h-3" />
                            <span>{interventionLoading ? "Interrogating..." : "Submit Question"}</span>
                          </button>
                        </div>
                      </form>

                      {interventionHistory.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-[#20252e] space-y-3 text-xs">
                          {interventionHistory.map((item, idx) => (
                            <div key={idx} className="p-3 rounded bg-[#0b0d10] border border-[#20252e]">
                              <div className="text-[10px] font-mono text-emerald-400 uppercase">You Asked:</div>
                              <div className="text-slate-300 italic mb-1.5">"{item.user_query}"</div>
                              <div className="text-[10px] font-mono text-cyan-400 uppercase">{item.agent_name} Responded:</div>
                              <div className="text-slate-200 font-serif leading-relaxed">{item.agent_reply}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Exogenous Event Injection */}
                    <div className="p-5 rounded-lg bg-[#12161e] border border-amber-800/30">
                      <div className="flex items-center space-x-2 text-xs font-medium text-amber-400 mb-2">
                        <Sparkles className="w-4 h-4" />
                        <span>Exogenous Shock / Hypothetical Event Injection</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mb-3">
                        Simulate an exogenous market shock (e.g., "U.S. defense appropriations reduced by 20%").
                      </p>
                      <form onSubmit={handleInjectHypothetical} className="flex space-x-2">
                        <input
                          type="text"
                          value={hypoEvent}
                          onChange={(e) => setHypoEvent(e.target.value)}
                          placeholder="e.g. Federal procurement cycle extends beyond 150 days..."
                          className="flex-1 px-3 py-1.5 rounded bg-[#0b0d10] border border-[#20252e] text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                        />
                        <button
                          type="submit"
                          className="px-4 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs cursor-pointer"
                        >
                          Inject Shock
                        </button>
                      </form>
                      {hypoInjected && (
                        <div className="mt-3 p-2.5 rounded bg-amber-950/30 border border-amber-800/40 text-xs text-amber-200">
                          Exogenous shock recorded. Society risk parameters adjusted into Stress Case scenario.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-4 border-t border-[#20252e] bg-[#12161e] flex justify-between items-center">
                    <button
                      onClick={() => setCurrentStage(2)}
                      className="px-4 py-2 rounded border border-[#2d3748] text-slate-400 hover:text-slate-200 text-xs"
                    >
                      Back to Stage 02
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

        {/* STAGE 04: Boardroom Debate */}
        {currentStage === 4 && (
          <div className="flex-1 overflow-y-auto p-10 max-w-5xl mx-auto w-full">
            <div className="mb-8">
              <span className="text-xs font-mono uppercase tracking-widest text-emerald-400">
                Stage 04 • Adversarial Deliberation Floor
              </span>
              <h1 className="text-2xl font-serif font-bold text-slate-100 mt-2">
                Deliberation & Adjudicated Claims
              </h1>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                Structured challenges, rebuttals, concessions, and judicial adjudications on growth sustainability vs concentration risks.
              </p>
            </div>

            <div className="space-y-4 mb-8">
              {claims.map((c) => (
                <div 
                  key={c.id} 
                  className={`p-4 rounded-lg border text-xs ${
                    c.disputed 
                      ? "bg-amber-950/20 border-amber-800/40 text-amber-100" 
                      : "bg-[#141922] border-[#20252e] text-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded bg-[#1c222b] text-slate-300 border border-[#2d3748]">
                      {c.specialist_id.replace(/_/g, " ")}
                    </span>
                    <span className={`text-[10px] font-mono uppercase font-semibold ${
                      c.verdict === "supported" ? "text-emerald-400" : "text-amber-400"
                    }`}>
                      Verdict: {c.verdict}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed font-serif">{c.statement}</p>
                </div>
              ))}
            </div>

            {debates.map((d) => (
              <div key={d.id} className="p-6 rounded-lg bg-[#12161e] border border-[#20252e] mb-8">
                <div className="text-xs font-semibold text-slate-200 mb-4 flex items-center space-x-2">
                  <Scale className="w-4 h-4 text-amber-400" />
                  <span>Adversarial Debate Session: {d.topic}</span>
                </div>
                <div className="space-y-3">
                  {d.arguments.map((arg: any) => (
                    <div 
                      key={arg.id} 
                      className={`p-3.5 rounded border text-xs ${
                        arg.argument_type === "adjudication"
                          ? "bg-emerald-950/30 border-emerald-500/40 text-emerald-200"
                          : arg.argument_type === "challenge"
                          ? "bg-amber-950/20 border-amber-800/40 text-amber-200"
                          : "bg-[#161c24] border-[#20252e] text-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono uppercase mb-1.5">
                        <span className="font-semibold text-slate-200">{arg.specialist_id.replace(/_/g, " ")}</span>
                        <span className="text-slate-400">{arg.argument_type}</span>
                      </div>
                      <p className="leading-relaxed font-serif">{arg.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="flex justify-between items-center pt-6 border-t border-[#20252e]">
              <button
                onClick={() => setCurrentStage(3)}
                className="px-4 py-2 rounded border border-[#2d3748] text-slate-400 hover:text-slate-200 text-xs"
              >
                Back to Stage 03
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
        )}

        {/* STAGE 05: Intelligence Dossier */}
        {currentStage === 5 && (
          <div className="flex-1 overflow-y-auto p-10 max-w-4xl mx-auto w-full">
            {primaryReport ? (
              <article className="p-8 rounded-lg bg-[#12161e] border border-[#20252e] text-slate-200">
                <div className="border-b border-[#20252e] pb-6 mb-6 flex items-start justify-between">
                  <div>
                    <div className="text-xs font-mono uppercase tracking-widest text-emerald-400 mb-2">
                      Stage 05 • Institutional Dossier • Version {primaryReport.version}
                    </div>
                    <h1 className="text-2xl font-serif font-bold text-slate-100">{primaryReport.title}</h1>
                    <p className="text-xs font-mono text-slate-400 mt-2">
                      Generated on {new Date(primaryReport.created_at).toLocaleDateString()} • {primaryReport.citations_count} Verified Citations
                    </p>
                  </div>
                  <button
                    onClick={() => window.print()}
                    className="px-3 py-1.5 rounded border border-[#2d3748] hover:border-slate-500 text-slate-300 text-xs flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print / Export PDF</span>
                  </button>
                </div>

                <div className="mb-8">
                  <h2 className="text-xs font-mono uppercase text-slate-400 tracking-wider mb-2">
                    Executive Assessment
                  </h2>
                  <div className="text-sm font-serif leading-relaxed p-4 rounded bg-[#161c24] border border-[#20252e] text-slate-300">
                    {primaryReport.executive_summary}
                  </div>
                </div>

                {primaryReport.financial_analysis && (
                  <div className="mb-8">
                    <h2 className="text-xs font-mono uppercase text-slate-400 tracking-wider mb-3">
                      Financial Health & Unit Metrics
                    </h2>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-3.5 rounded bg-[#161c24] border border-[#20252e]">
                        <div className="text-slate-400 text-[11px]">Revenue (LTM)</div>
                        <div className="text-lg font-mono font-semibold text-slate-100 mt-1">
                          ${primaryReport.financial_analysis.revenue_usd_m}M
                        </div>
                      </div>
                      <div className="p-3.5 rounded bg-[#161c24] border border-[#20252e]">
                        <div className="text-slate-400 text-[11px]">Gross Margin</div>
                        <div className="text-lg font-mono font-semibold text-emerald-400 mt-1">
                          {primaryReport.financial_analysis.gross_margin_pct}%
                        </div>
                      </div>
                      <div className="p-3.5 rounded bg-[#161c24] border border-[#20252e]">
                        <div className="text-slate-400 text-[11px]">Cash Reserves</div>
                        <div className="text-lg font-mono font-semibold text-cyan-400 mt-1">
                          ${primaryReport.financial_analysis.cash_reserves_m}M
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {primaryReport.scenario_matrix && (
                  <div className="mb-8">
                    <h2 className="text-xs font-mono uppercase text-slate-400 tracking-wider mb-3">
                      Quantitative Scenario Matrix & Terminal Valuation
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(primaryReport.scenario_matrix).map(([key, sc]: [string, any]) => (
                        <div key={key} className="p-4 rounded bg-[#161c24] border border-[#20252e]">
                          <div className="flex items-center justify-between text-xs font-mono text-emerald-400 uppercase font-semibold mb-1">
                            <span>{key.replace(/_/g, " ")}</span>
                            <span>{sc.terminal_multiple}</span>
                          </div>
                          <div className="text-sm font-mono text-slate-100">${sc.projected_revenue_m}M Projected</div>
                          <p className="text-xs text-slate-400 mt-2 italic font-serif">"{sc.assumptions}"</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center pt-6 border-t border-[#20252e]">
                  <button
                    onClick={() => setCurrentStage(4)}
                    className="px-4 py-2 rounded border border-[#2d3748] text-slate-400 hover:text-slate-200 text-xs"
                  >
                    Back to Stage 04
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
    </div>
  );
}
