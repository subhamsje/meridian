"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Building2, 
  Search, 
  Plus, 
  Layers, 
  Scale, 
  ShieldCheck, 
  FileText, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle2,
  Clock,
  Play,
  RotateCw,
  ExternalLink,
  ChevronRight,
  LogOut,
  FolderOpen,
  Printer,
  Download,
  Share2,
  Network,
  Users,
  MessageSquare,
  Send,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Activity
} from "lucide-react";
import { API_BASE } from "@/lib/utils";
import LivingKnowledgeGraph from "@/components/LivingKnowledgeGraph";

interface Investigation {
  id: string;
  title: string;
  company_name: string;
  ticker?: string;
  status: string;
  depth: string;
  progress_percentage: number;
  current_cost_usd: number;
  created_at: string;
  completed_at?: string;
}

export default function WorkspaceApp() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  const [selectedInvId, setSelectedInvId] = useState<string | null>(null);
  const [invDetail, setInvDetail] = useState<any>(null);
  const [societyAgents, setSocietyAgents] = useState<any[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [interactions, setInteractions] = useState<any[]>([]);
  const [claims, setClaims] = useState<any[]>([]);
  const [debates, setDebates] = useState<any[]>([]);
  const [evidence, setEvidence] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [graphData, setGraphData] = useState<{ nodes: any[]; edges: any[] }>({ nodes: [], edges: [] });
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [selectedEdge, setSelectedEdge] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"society" | "timeline" | "boardroom" | "graph" | "scenarios" | "evidence" | "reports">("society");

  // User Intervention / Question State
  const [interventionQuery, setInterventionQuery] = useState("");
  const [interventionLoading, setInterventionLoading] = useState(false);
  const [interventionHistory, setInterventionHistory] = useState<any[]>([]);

  // Auth Form State
  const [email, setEmail] = useState("lead.analyst@meridian.internal");
  const [password, setPassword] = useState("InstitutionalPassword2026!");
  const [fullName, setFullName] = useState("Lead Portfolio Investigator");
  const [orgName, setOrgName] = useState("Meridian Capital Intelligence");
  const [isRegistering, setIsRegistering] = useState(false);
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(false);

  // New Investigation Modal
  const [showNewModal, setShowNewModal] = useState(false);
  const [newCompany, setNewCompany] = useState("Palantir Technologies");
  const [newTicker, setNewTicker] = useState("PLTR");
  const [newDomain, setNewDomain] = useState("palantir.com");
  const [newSector, setNewSector] = useState("Enterprise Software & Defense AI");

  useEffect(() => {
    const savedToken = localStorage.getItem("meridian_token");
    if (savedToken) {
      setToken(savedToken);
      fetchMe(savedToken);
    }
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setLoading(true);

    const endpoint = isRegistering ? `${API_BASE}/auth/register` : `${API_BASE}/auth/login`;
    const payload = isRegistering 
      ? { email, password, full_name: fullName, organization_name: orgName }
      : { email, password };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Authentication failed");
      }
      localStorage.setItem("meridian_token", data.access_token);
      setToken(data.access_token);
      setUser({ email: data.email, full_name: data.full_name, organization: { name: data.organization_name } });
      fetchInvestigations(data.access_token);
    } catch (err: any) {
      setAuthError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchMe = async (jwt: string) => {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${jwt}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        fetchInvestigations(jwt);
      } else {
        localStorage.removeItem("meridian_token");
        setToken(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchInvestigations = async (jwt: string) => {
    try {
      const res = await fetch(`${API_BASE}/investigations`, {
        headers: { Authorization: `Bearer ${jwt}` }
      });
      if (res.ok) {
        const list = await res.json();
        setInvestigations(list);
        if (list.length > 0 && !selectedInvId) {
          selectInvestigation(list[0].id, jwt);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const selectInvestigation = async (id: string, jwt = token) => {
    setSelectedInvId(id);
    if (!jwt) return;
    try {
      const [detailRes, agentsRes, interRes, claimsRes, debatesRes, evRes, reportsRes, graphRes] = await Promise.all([
        fetch(`${API_BASE}/investigations/${id}`, { headers: { Authorization: `Bearer ${jwt}` } }),
        fetch(`${API_BASE}/investigations/${id}/society/agents`, { headers: { Authorization: `Bearer ${jwt}` } }),
        fetch(`${API_BASE}/investigations/${id}/society/interactions`, { headers: { Authorization: `Bearer ${jwt}` } }),
        fetch(`${API_BASE}/investigations/${id}/claims`, { headers: { Authorization: `Bearer ${jwt}` } }),
        fetch(`${API_BASE}/investigations/${id}/debates`, { headers: { Authorization: `Bearer ${jwt}` } }),
        fetch(`${API_BASE}/investigations/${id}/evidence`, { headers: { Authorization: `Bearer ${jwt}` } }),
        fetch(`${API_BASE}/investigations/${id}/reports`, { headers: { Authorization: `Bearer ${jwt}` } }),
        fetch(`${API_BASE}/investigations/${id}/graph`, { headers: { Authorization: `Bearer ${jwt}` } }),
      ]);

      if (detailRes.ok) setInvDetail(await detailRes.json());
      if (agentsRes.ok) {
        const ags = await agentsRes.json();
        setSocietyAgents(ags);
        if (ags.length > 0 && !selectedAgent) {
          setSelectedAgent(ags[0]);
        }
      }
      if (interRes.ok) setInteractions(await interRes.json());
      if (claimsRes.ok) setClaims(await claimsRes.json());
      if (debatesRes.ok) setDebates(await debatesRes.json());
      if (evRes.ok) setEvidence(await evRes.json());
      if (reportsRes.ok) setReports(await reportsRes.json());
      if (graphRes.ok) setGraphData(await graphRes.json());
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateInvestigation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/investigations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          company_name: newCompany,
          ticker: newTicker,
          domain: newDomain,
          company_type: "public",
          sector: newSector,
          depth: "comprehensive",
          budget_limit_usd: 250.0
        })
      });
      const data = await res.json();
      if (res.ok) {
        setShowNewModal(false);
        await fetch(`${API_BASE}/investigations/${data.investigation_id}/start`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` }
        });
        await fetchInvestigations(token);
        selectInvestigation(data.investigation_id, token);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleStartPipeline = async () => {
    if (!selectedInvId || !token) return;
    try {
      await fetch(`${API_BASE}/investigations/${selectedInvId}/start`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      setTimeout(() => {
        selectInvestigation(selectedInvId, token);
        fetchInvestigations(token);
      }, 1500);
    } catch (e) {
      console.error(e);
    }
  };

  const handleIntervention = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvId || !selectedAgent || !interventionQuery.trim() || !token) return;
    setInterventionLoading(true);

    try {
      const res = await fetch(`${API_BASE}/investigations/${selectedInvId}/society/intervene`, {
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
        // Refresh interactions
        const interRes = await fetch(`${API_BASE}/investigations/${selectedInvId}/society/interactions`, {
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

  const handleLogout = () => {
    localStorage.removeItem("meridian_token");
    setToken(null);
    setUser(null);
    setInvestigations([]);
    setInvDetail(null);
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#111315]">
        <div className="w-full max-w-md bg-[#181b1f] border border-[#30353c] rounded p-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-7 h-7 rounded bg-[#20242a] border border-[#30353c] flex items-center justify-center font-mono font-bold text-[#e5e7eb] text-xs">
              M
            </div>
            <div>
              <div className="font-semibold text-[#f8fafc] uppercase tracking-wider text-xs">Meridian</div>
              <div className="text-[11px] text-[#737c88] font-mono">Institutional Intelligence Terminal</div>
            </div>
          </div>

          <h2 className="text-xl font-serif text-[#f8fafc] mb-1.5">
            {isRegistering ? "Create Institutional Seat" : "Authenticate Workspace"}
          </h2>
          <p className="text-xs text-[#a0a7b1] mb-6 leading-relaxed">
            {isRegistering 
              ? "Establish your organization domain and lead investigator seat."
              : "Enter your institutional credentials to access investigations and audit trails."}
          </p>

          {authError && (
            <div className="mb-4 p-3 rounded bg-[#2c1818] border border-[#ef4444]/40 text-[#fca5a5] text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4 text-xs">
            {isRegistering && (
              <>
                <div>
                  <label className="block text-[#a0a7b1] mb-1 font-mono uppercase text-[10px]">Full Name</label>
                  <input 
                    type="text" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded bg-[#111315] border border-[#30353c] text-[#e5e7eb] focus:outline-none focus:border-[#3b82f6]"
                  />
                </div>
                <div>
                  <label className="block text-[#a0a7b1] mb-1 font-mono uppercase text-[10px]">Organization Name</label>
                  <input 
                    type="text" 
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded bg-[#111315] border border-[#30353c] text-[#e5e7eb] focus:outline-none focus:border-[#3b82f6]"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-[#a0a7b1] mb-1 font-mono uppercase text-[10px]">Work Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 rounded bg-[#111315] border border-[#30353c] text-[#e5e7eb] focus:outline-none focus:border-[#3b82f6]"
              />
            </div>

            <div>
              <label className="block text-[#a0a7b1] mb-1 font-mono uppercase text-[10px]">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 rounded bg-[#111315] border border-[#30353c] text-[#e5e7eb] focus:outline-none focus:border-[#3b82f6]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-medium transition-colors text-xs flex items-center justify-center space-x-1 mt-2 cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? "Authenticating..." : isRegistering ? "Register Organization Seat" : "Sign In to Terminal"}</span>
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-[#30353c] text-center">
            <button
              type="button"
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-xs text-[#3b82f6] hover:underline cursor-pointer"
            >
              {isRegistering ? "Existing seat? Sign In" : "Need an institutional workspace? Register"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const primaryReport = reports[0];

  return (
    <div className="flex h-screen overflow-hidden bg-[#111315] text-[#e5e7eb] font-sans">
      {/* Sidebar: Navigation & Dossier Registry */}
      <aside className="w-80 border-r border-[#30353c] bg-[#181b1f] flex flex-col justify-between">
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="h-14 border-b border-[#30353c] px-4 flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2.5">
              <div className="w-6 h-6 rounded bg-[#20242a] border border-[#30353c] flex items-center justify-center font-mono font-bold text-[#e5e7eb] text-xs">
                M
              </div>
              <span className="font-semibold text-xs tracking-wider uppercase text-[#e5e7eb]">
                Meridian
              </span>
            </Link>
            <button 
              onClick={() => setShowNewModal(true)}
              className="px-2 py-1 rounded bg-[#20242a] hover:bg-[#282e36] border border-[#30353c] text-[#e5e7eb] transition-colors text-xs flex items-center space-x-1 cursor-pointer"
              title="New Company Investigation"
            >
              <Plus className="w-3.5 h-3.5 text-[#3b82f6]" />
              <span>New</span>
            </button>
          </div>

          <div className="px-4 py-2.5 border-b border-[#30353c] bg-[#141619] flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2 overflow-hidden">
              <Building2 className="w-3.5 h-3.5 text-[#737c88] shrink-0" />
              <span className="text-[#a0a7b1] truncate font-medium text-[11px]">
                {user?.organization?.name || "Corporate Strategy Org"}
              </span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#20242a] text-[#a0a7b1] border border-[#30353c] font-mono">
              INSTITUTIONAL
            </span>
          </div>

          <div className="p-3 text-[11px] font-mono text-[#737c88] uppercase tracking-wider flex items-center justify-between">
            <span>Dossier Registry</span>
            <span>{investigations.length} Total</span>
          </div>

          <div className="flex-1 overflow-y-auto px-2 space-y-1">
            {investigations.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#737c88]">
                No active investigations found. Click "New" to start an investigation.
              </div>
            ) : (
              investigations.map((inv) => (
                <button
                  key={inv.id}
                  onClick={() => selectInvestigation(inv.id)}
                  className={`w-full text-left p-3 rounded border transition-colors cursor-pointer ${
                    selectedInvId === inv.id
                      ? "bg-[#20242a] border-[#3b82f6] text-[#f8fafc]"
                      : "bg-[#111315] border-[#30353c] text-[#a0a7b1] hover:text-[#e5e7eb] hover:bg-[#141619]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-xs text-[#e5e7eb] truncate">
                      {inv.company_name}
                    </span>
                    {inv.ticker && (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#181b1f] text-[#3b82f6] border border-[#30353c]">
                        {inv.ticker}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#737c88]">
                    <span className="capitalize">{inv.depth}</span>
                    <span className="font-mono text-[#a0a7b1]">
                      {inv.status === "completed" ? "100%" : `${inv.progress_percentage}%`}
                    </span>
                  </div>
                  <div className="w-full bg-[#111315] h-1 rounded-full mt-2 overflow-hidden border border-[#30353c]/40">
                    <div 
                      className={`h-full ${inv.status === "completed" ? "bg-[#10b981]" : "bg-[#3b82f6]"}`} 
                      style={{ width: `${inv.progress_percentage}%` }}
                    ></div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="p-3 border-t border-[#30353c] bg-[#141619] flex items-center justify-between text-xs">
          <div className="overflow-hidden">
            <div className="font-medium text-[#e5e7eb] truncate">{user?.full_name}</div>
            <div className="text-[11px] text-[#737c88] truncate">{user?.email}</div>
          </div>
          <button 
            onClick={handleLogout}
            className="p-1.5 rounded hover:bg-[#20242a] text-[#737c88] hover:text-[#e5e7eb] transition-colors"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Investigation Panel */}
      <main className="flex-1 flex flex-col overflow-hidden bg-[#111315]">
        {invDetail ? (
          <>
            {/* Top Navigation Bar */}
            <header className="h-14 border-b border-[#30353c] px-6 flex items-center justify-between bg-[#181b1f]">
              <div>
                <div className="flex items-center space-x-3">
                  <h1 className="text-base font-serif font-semibold text-[#f8fafc]">
                    {invDetail.company.name}
                  </h1>
                  {invDetail.company.ticker && (
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#20242a] text-[#a0a7b1] border border-[#30353c]">
                      {invDetail.company.ticker}
                    </span>
                  )}
                  <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${
                    invDetail.status === "completed" 
                      ? "bg-[#142922] text-[#10b981] border-[#10b981]/30" 
                      : "bg-[#182232] text-[#3b82f6] border-[#3b82f6]/30"
                  }`}>
                    {invDetail.status}
                  </span>
                </div>
                <div className="text-[11px] text-[#737c88] flex items-center space-x-2 mt-0.5 font-mono">
                  <span>Sector: {invDetail.company.sector}</span>
                  <span>•</span>
                  <span>Society: {societyAgents.length} Specialists</span>
                  <span>•</span>
                  <span>Interactions: {interactions.length}</span>
                </div>
              </div>

              {/* Action Tabs */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center bg-[#111315] p-0.5 rounded border border-[#30353c] text-xs font-medium">
                  <button
                    onClick={() => setActiveTab("society")}
                    className={`px-3 py-1 rounded transition-colors cursor-pointer flex items-center space-x-1.5 ${
                      activeTab === "society" ? "bg-[#20242a] text-[#f8fafc] border border-[#30353c]" : "text-[#a0a7b1] hover:text-[#e5e7eb]"
                    }`}
                  >
                    <Users className="w-3.5 h-3.5 text-[#3b82f6]" />
                    <span>Specialists ({societyAgents.length})</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("timeline")}
                    className={`px-3 py-1 rounded transition-colors cursor-pointer flex items-center space-x-1.5 ${
                      activeTab === "timeline" ? "bg-[#20242a] text-[#f8fafc] border border-[#30353c]" : "text-[#a0a7b1] hover:text-[#e5e7eb]"
                    }`}
                  >
                    <Activity className="w-3.5 h-3.5 text-[#10b981]" />
                    <span>Timeline ({interactions.length})</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("boardroom")}
                    className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                      activeTab === "boardroom" ? "bg-[#20242a] text-[#f8fafc] border border-[#30353c]" : "text-[#a0a7b1] hover:text-[#e5e7eb]"
                    }`}
                  >
                    Adversarial Debate
                  </button>
                  <button
                    onClick={() => setActiveTab("graph")}
                    className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                      activeTab === "graph" ? "bg-[#20242a] text-[#f8fafc] border border-[#30353c]" : "text-[#a0a7b1] hover:text-[#e5e7eb]"
                    }`}
                  >
                    Corporate Graph ({graphData.nodes.length})
                  </button>
                  <button
                    onClick={() => setActiveTab("scenarios")}
                    className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                      activeTab === "scenarios" ? "bg-[#20242a] text-[#f8fafc] border border-[#30353c]" : "text-[#a0a7b1] hover:text-[#e5e7eb]"
                    }`}
                  >
                    Scenario Matrix
                  </button>
                  <button
                    onClick={() => setActiveTab("reports")}
                    className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                      activeTab === "reports" ? "bg-[#20242a] text-[#f8fafc] border border-[#30353c]" : "text-[#a0a7b1] hover:text-[#e5e7eb]"
                    }`}
                  >
                    Intelligence Dossier
                  </button>
                </div>

                {invDetail.status !== "completed" && (
                  <button
                    onClick={handleStartPipeline}
                    className="px-3.5 py-1.5 rounded bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-medium flex items-center space-x-1.5 cursor-pointer transition-colors"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Run Society Pipeline</span>
                  </button>
                )}
              </div>
            </header>

            {/* TAB 1: Agent Society & Individual Agent Workspace with Direct Intervention */}
            {activeTab === "society" && (
              <div className="flex-1 overflow-hidden grid grid-cols-12 divide-x divide-[#20252e]">
                {/* Left 4 Cols: Society Agents Roster */}
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
                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mt-2 pt-2 border-t border-[#20252e]">
                          <span className="capitalize text-emerald-400">{ag.status}</span>
                          <span>{ag.interaction_count} Interactions</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Right 8 Cols: Selected Agent Detailed Workspace & Live User Intervention Panel */}
                <div className="col-span-8 flex flex-col overflow-hidden bg-[#0b0d10]">
                  {selectedAgent ? (
                    <div className="flex-1 flex flex-col overflow-hidden">
                      {/* Agent Header */}
                      <div className="p-6 border-b border-[#20252e] bg-[#12161e]">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="text-xs font-mono uppercase text-emerald-400 tracking-wider mb-1">
                              {selectedAgent.role}
                            </div>
                            <h2 className="text-xl font-serif font-bold text-slate-100">{selectedAgent.name}</h2>
                            <p className="text-xs text-slate-400 mt-1">{selectedAgent.specialization}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-mono px-2.5 py-1 rounded bg-[#1c222b] border border-[#2d3748] text-slate-200">
                              Style: {selectedAgent.analytical_style}
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-300 mt-3 p-3 rounded bg-[#0b0d10] border border-[#20252e] leading-relaxed">
                          {selectedAgent.biography}
                        </p>

                        <div className="mt-3 text-xs">
                          <span className="font-mono text-slate-400 text-[10px] uppercase">Current Mandate: </span>
                          <span className="text-slate-200">{selectedAgent.mandate}</span>
                        </div>
                      </div>

                      {/* Agent Current Position & Memory */}
                      <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        <div>
                          <h3 className="text-xs font-mono uppercase text-slate-400 tracking-wider mb-2">
                            Current Epistemic Position & Findings
                          </h3>
                          <div className="p-4 rounded-lg bg-[#141922] border border-[#20252e] text-xs text-slate-200 leading-relaxed font-serif">
                            {selectedAgent.current_position || "Preliminary research in progress."}
                          </div>
                        </div>

                        {/* Interactive Direct Interrogation Console */}
                        <div className="p-5 rounded-lg bg-[#12161e] border border-emerald-500/30">
                          <div className="flex items-center space-x-2 text-xs font-medium text-emerald-400 mb-2">
                            <MessageSquare className="w-4 h-4" />
                            <span>Interrogate Specialist (Direct User Intervention)</span>
                          </div>
                          <p className="text-[11px] text-slate-400 mb-4">
                            Directly question {selectedAgent.name}. The specialist will answer grounded in its mandate, verified disclosures, and current investigation evidence.
                          </p>

                          <form onSubmit={handleIntervention} className="space-y-3">
                            <textarea
                              value={interventionQuery}
                              onChange={(e) => setInterventionQuery(e.target.value)}
                              rows={3}
                              placeholder={`Question ${selectedAgent.name} on ${selectedAgent.role.toLowerCase()} observations...`}
                              className="w-full px-3 py-2 rounded bg-[#0b0d10] border border-[#20252e] text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                            />
                            <div className="flex justify-end">
                              <button
                                type="submit"
                                disabled={interventionLoading || !interventionQuery.trim()}
                                className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                              >
                                <Send className="w-3 h-3" />
                                <span>{interventionLoading ? "Questioning..." : "Submit Question"}</span>
                              </button>
                            </div>
                          </form>

                          {/* Interrogation responses history */}
                          {interventionHistory.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-[#20252e] space-y-3 text-xs">
                              {interventionHistory.map((item, idx) => (
                                <div key={idx} className="p-3 rounded bg-[#0b0d10] border border-[#20252e]">
                                  <div className="text-[10px] font-mono text-emerald-400 uppercase">You Asked:</div>
                                  <div className="text-slate-300 italic mb-2">"{item.user_query}"</div>
                                  <div className="text-[10px] font-mono text-cyan-400 uppercase">{item.agent_name} Responded:</div>
                                  <div className="text-slate-200 font-serif leading-relaxed">{item.agent_reply}</div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-slate-500 text-xs">
                      Select an agent from the society roster to inspect their mandate and initiate direct questioning.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: Live Interaction Timeline */}
            {activeTab === "timeline" && (
              <div className="flex-1 overflow-y-auto p-8 max-w-5xl mx-auto w-full">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-serif text-slate-100">Live Multi-Agent Interaction Timeline</h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Chronological stream of agent-to-agent peer inquiries, evidence challenges, rebuttals, concessions, and coordinator assignments.
                    </p>
                  </div>
                  <div className="text-xs font-mono px-3 py-1.5 rounded bg-[#161c24] border border-[#20252e] text-emerald-400">
                    {interactions.length} Structured Interactions
                  </div>
                </div>

                <div className="space-y-3">
                  {interactions.map((msg) => (
                    <div key={msg.id} className="p-4 rounded-lg bg-[#141922] border border-[#20252e] text-xs">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-slate-200 font-mono text-[11px]">
                            {msg.sender_agent_id.replace(/_/g, " ").toUpperCase()}
                          </span>
                          <span className="text-slate-500">→</span>
                          <span className="text-slate-400 font-mono text-[11px]">
                            {msg.recipient_agent_id.replace(/_/g, " ").toUpperCase()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${
                            msg.interaction_type === "CHALLENGE"
                              ? "bg-amber-950/50 text-amber-400 border-amber-500/30"
                              : msg.interaction_type === "CONCEDE"
                              ? "bg-purple-950/50 text-purple-400 border-purple-500/30"
                              : msg.interaction_type === "USER_INTERVENTION"
                              ? "bg-blue-950/50 text-blue-400 border-blue-500/30"
                              : "bg-emerald-950/50 text-emerald-400 border-emerald-500/30"
                          }`}>
                            {msg.interaction_type}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">Round {msg.round_number}</span>
                        </div>
                      </div>
                      <p className="text-slate-300 font-serif leading-relaxed p-2.5 rounded bg-[#0b0d10] border border-[#20252e]">
                        "{msg.content}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: Adversarial Debate Floor */}
            {activeTab === "boardroom" && (
              <div className="flex-1 overflow-y-auto p-8 max-w-5xl mx-auto w-full">
                <div className="mb-6">
                  <h2 className="text-xl font-serif text-slate-100">Adversarial Deliberation & Disputed Claims</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Structured challenges, rebuttals, and final epistemic rulings between Bull, Bear, Forensic, and Adjudicator agents.
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
                      {c.citations && c.citations.length > 0 && (
                        <div className="mt-2.5 pt-2 border-t border-[#20252e]/80 flex flex-wrap gap-1.5">
                          {c.citations.map((cit: any, i: number) => (
                            <span key={i} className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/30">
                              [{cit.source_title.slice(0, 24)}... {cit.location}]
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {debates.map((d) => (
                  <div key={d.id} className="p-6 rounded-lg bg-[#12161e] border border-[#20252e] mb-6">
                    <div className="text-xs font-semibold text-slate-200 mb-4 flex items-center space-x-2">
                      <Scale className="w-4 h-4 text-amber-400" />
                      <span>Debate Session: {d.topic}</span>
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
              </div>
            )}

            {/* TAB 4: Corporate Relationship Graph */}
            {activeTab === "graph" && (
              <div className="flex-1 flex flex-col overflow-hidden bg-[#111315]">
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
                />
              </div>
            )}

            {/* TAB 5: Scenario Matrix */}
            {activeTab === "scenarios" && (
              <div className="flex-1 overflow-y-auto p-8 max-w-5xl mx-auto w-full">
                <div className="mb-6">
                  <h2 className="text-xl font-serif text-slate-100">Quantitative Scenario Matrix & Stress Testing</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Deterministic financial scenario modeling across baseline, enterprise expansion, sales friction, and concentration shock assumptions.
                  </p>
                </div>

                {primaryReport?.scenario_matrix ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(primaryReport.scenario_matrix).map(([key, sc]: [string, any]) => (
                      <div key={key} className="p-5 rounded-lg bg-[#141922] border border-[#20252e]">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-mono uppercase font-semibold text-emerald-400">
                            {key.replace(/_/g, " ")}
                          </span>
                          <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#1c222b] text-slate-300 border border-[#2d3748]">
                            Multiple: {sc.terminal_multiple}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div className="p-2.5 rounded bg-[#0b0d10] border border-[#20252e]">
                            <div className="text-[10px] text-slate-400 font-mono uppercase">Projected Rev</div>
                            <div className="text-base font-mono font-semibold text-slate-100 mt-0.5">
                              ${sc.projected_revenue_m}M
                            </div>
                            <div className={`text-[10px] font-mono mt-0.5 ${sc.growth_rate_pct >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                              {sc.growth_rate_pct >= 0 ? `+${sc.growth_rate_pct}%` : `${sc.growth_rate_pct}%`} YoY
                            </div>
                          </div>

                          <div className="p-2.5 rounded bg-[#0b0d10] border border-[#20252e]">
                            <div className="text-[10px] text-slate-400 font-mono uppercase">EBITDA Margin</div>
                            <div className="text-base font-mono font-semibold text-cyan-400 mt-0.5">
                              {sc.ebitda_margin_pct}%
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                              Normalized Run-rate
                            </div>
                          </div>
                        </div>

                        <p className="text-xs text-slate-300 font-serif leading-relaxed italic bg-[#10141a] p-2.5 rounded border border-[#20252e]">
                          "{sc.assumptions}"
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-500 text-sm">
                    Scenario data pending investigation execution.
                  </div>
                )}
              </div>
            )}

            {/* TAB 6: Institutional Dossier */}
            {activeTab === "reports" && (
              <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto w-full">
                {reports.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 text-sm">
                    Report is generating or pending investigation completion.
                  </div>
                ) : (
                  reports.map((r) => (
                    <article key={r.id} className="p-8 rounded-lg bg-[#12161e] border border-[#20252e] text-slate-200">
                      <div className="border-b border-[#20252e] pb-6 mb-6 flex items-start justify-between">
                        <div>
                          <div className="text-xs font-mono uppercase tracking-widest text-emerald-400 mb-2">
                            Institutional Dossier • Version {r.version}
                          </div>
                          <h1 className="text-2xl font-serif font-bold text-slate-100">{r.title}</h1>
                          <p className="text-xs font-mono text-slate-400 mt-2">
                            Generated on {new Date(r.created_at).toLocaleDateString()} • {r.citations_count} Verified Citations
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
                          {r.executive_summary}
                        </div>
                      </div>

                      {r.financial_analysis && (
                        <div className="mb-8">
                          <h2 className="text-xs font-mono uppercase text-slate-400 tracking-wider mb-3">
                            Financial Health & Unit Metrics
                          </h2>
                          <div className="grid grid-cols-3 gap-4">
                            <div className="p-3.5 rounded bg-[#161c24] border border-[#20252e]">
                              <div className="text-slate-400 text-[11px]">Revenue (LTM)</div>
                              <div className="text-lg font-mono font-semibold text-slate-100 mt-1">
                                ${r.financial_analysis.revenue_usd_m}M
                              </div>
                            </div>
                            <div className="p-3.5 rounded bg-[#161c24] border border-[#20252e]">
                              <div className="text-slate-400 text-[11px]">Gross Margin</div>
                              <div className="text-lg font-mono font-semibold text-emerald-400 mt-1">
                                {r.financial_analysis.gross_margin_pct}%
                              </div>
                            </div>
                            <div className="p-3.5 rounded bg-[#161c24] border border-[#20252e]">
                              <div className="text-slate-400 text-[11px]">Cash Reserves</div>
                              <div className="text-lg font-mono font-semibold text-cyan-400 mt-1">
                                ${r.financial_analysis.cash_reserves_m}M
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="space-y-6">
                        {r.sections?.map((sec: any, idx: number) => (
                          <div key={idx} className="space-y-2">
                            <h3 className="text-sm font-semibold text-slate-100">{sec.title}</h3>
                            <p className="text-xs text-slate-400 leading-relaxed font-serif">{sec.content}</p>
                          </div>
                        ))}
                      </div>

                      {r.risk_register && (
                        <div className="mt-8 pt-6 border-t border-[#20252e]">
                          <h2 className="text-xs font-mono uppercase text-slate-400 tracking-wider mb-3">
                            Adversarial Risk Register
                          </h2>
                          <div className="space-y-2">
                            {r.risk_register.map((risk: any, ri: number) => (
                              <div key={ri} className="p-3 rounded bg-[#161c24] border border-[#20252e] flex items-center justify-between text-xs">
                                <div>
                                  <div className="font-medium text-slate-200">{risk.category}</div>
                                  <div className="text-slate-400 text-[11px]">{risk.detail}</div>
                                </div>
                                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase ${
                                  risk.severity === "HIGH" 
                                    ? "bg-red-950/40 text-red-400 border-red-800/40" 
                                    : "bg-amber-950/40 text-amber-400 border-amber-800/40"
                                }`}>
                                  {risk.severity}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </article>
                  ))
                )}
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
            Select or launch a company investigation to access intelligence.
          </div>
        )}
      </main>

      {/* New Investigation Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="w-full max-w-lg bg-[#12161e] border border-[#20252e] rounded-lg p-6 shadow-2xl">
            <h2 className="text-lg font-serif text-slate-100 mb-1">Launch Company Investigation</h2>
            <p className="text-xs text-slate-400 mb-5">
              Enter target corporate identity. Meridian will activate the 14-agent multi-specialist research society, ingest primary disclosures, and begin deliberation.
            </p>

            <form onSubmit={handleCreateInvestigation} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-mono uppercase text-[10px]">Company Name</label>
                <input 
                  type="text" 
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded bg-[#161c24] border border-[#20252e] text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 mb-1 font-mono uppercase text-[10px]">Stock Ticker</label>
                  <input 
                    type="text" 
                    value={newTicker}
                    onChange={(e) => setNewTicker(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-[#161c24] border border-[#20252e] text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-mono uppercase text-[10px]">Domain</label>
                  <input 
                    type="text" 
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-[#161c24] border border-[#20252e] text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-mono uppercase text-[10px]">Sector / Category</label>
                <input 
                  type="text" 
                  value={newSector}
                  onChange={(e) => setNewSector(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-[#161c24] border border-[#20252e] text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-[#20252e]">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 rounded border border-[#2d3748] text-slate-400 hover:text-slate-200 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-sm cursor-pointer"
                >
                  Initiate Multi-Agent Society
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
