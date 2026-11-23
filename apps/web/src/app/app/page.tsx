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
  FolderOpen
} from "lucide-react";
import { API_BASE } from "@/lib/utils";

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
  const [specialists, setSpecialists] = useState<any[]>([]);
  const [claims, setClaims] = useState<any[]>([]);
  const [debates, setDebates] = useState<any[]>([]);
  const [evidence, setEvidence] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"boardroom" | "evidence" | "reports" | "scenarios">("boardroom");

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
  const [newCompany, setNewCompany] = useState("Snowflake Inc.");
  const [newTicker, setNewTicker] = useState("SNOW");
  const [newDomain, setNewDomain] = useState("snowflake.com");
  const [newSector, setNewSector] = useState("Cloud Data & Analytics");

  // Auto login or check stored token
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
      const [detailRes, specsRes, claimsRes, debatesRes, evRes, reportsRes] = await Promise.all([
        fetch(`${API_BASE}/investigations/${id}`, { headers: { Authorization: `Bearer ${jwt}` } }),
        fetch(`${API_BASE}/investigations/${id}/specialists`, { headers: { Authorization: `Bearer ${jwt}` } }),
        fetch(`${API_BASE}/investigations/${id}/claims`, { headers: { Authorization: `Bearer ${jwt}` } }),
        fetch(`${API_BASE}/investigations/${id}/debates`, { headers: { Authorization: `Bearer ${jwt}` } }),
        fetch(`${API_BASE}/investigations/${id}/evidence`, { headers: { Authorization: `Bearer ${jwt}` } }),
        fetch(`${API_BASE}/investigations/${id}/reports`, { headers: { Authorization: `Bearer ${jwt}` } }),
      ]);

      if (detailRes.ok) setInvDetail(await detailRes.json());
      if (specsRes.ok) setSpecialists(await specsRes.json());
      if (claimsRes.ok) setClaims(await claimsRes.json());
      if (debatesRes.ok) setDebates(await debatesRes.json());
      if (evRes.ok) setEvidence(await evRes.json());
      if (reportsRes.ok) setReports(await reportsRes.json());
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
          budget_limit_usd: 200.0
        })
      });
      const data = await res.json();
      if (res.ok) {
        setShowNewModal(false);
        // Start pipeline immediately
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
      // Polling refresh
      setTimeout(() => {
        selectInvestigation(selectedInvId, token);
        fetchInvestigations(token);
      }, 1500);
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("meridian_token");
    setToken(null);
    setUser(null);
    setInvestigations([]);
    setInvDetail(null);
  };

  // If unauthenticated, show institutional sign-in / registration
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#080a0d]">
        <div className="w-full max-w-md bg-[#10141a] border border-[#20252e] rounded-lg p-8 shadow-2xl">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 rounded bg-emerald-950 border border-emerald-500/40 flex items-center justify-center font-mono font-bold text-emerald-400 text-sm">
              M
            </div>
            <div>
              <div className="font-semibold text-slate-100 uppercase tracking-wider text-sm">Meridian</div>
              <div className="text-[11px] text-slate-400 font-mono">Institutional Intelligence Terminal</div>
            </div>
          </div>

          <h2 className="text-xl font-serif text-slate-100 mb-2">
            {isRegistering ? "Create Institutional Seat" : "Authenticate Workspace"}
          </h2>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            {isRegistering 
              ? "Establish your organization domain and lead investigator seat."
              : "Enter your institutional credentials to access investigations and audit trails."}
          </p>

          {authError && (
            <div className="mb-4 p-3 rounded bg-red-950/40 border border-red-800/50 text-red-300 text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4 text-xs">
            {isRegistering && (
              <>
                <div>
                  <label className="block text-slate-300 mb-1 font-mono uppercase text-[10px]">Full Name</label>
                  <input 
                    type="text" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded bg-[#161c24] border border-[#20252e] text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-mono uppercase text-[10px]">Organization Name</label>
                  <input 
                    type="text" 
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded bg-[#161c24] border border-[#20252e] text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-slate-300 mb-1 font-mono uppercase text-[10px]">Work Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 rounded bg-[#161c24] border border-[#20252e] text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-mono uppercase text-[10px]">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 rounded bg-[#161c24] border border-[#20252e] text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-all text-xs flex items-center justify-center space-x-1 shadow-sm mt-2 cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? "Authenticating..." : isRegistering ? "Register Organization Seat" : "Sign In to Terminal"}</span>
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-[#20252e] text-center">
            <button
              type="button"
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-xs text-emerald-400 hover:underline cursor-pointer"
            >
              {isRegistering ? "Existing seat? Sign In" : "Need an institutional workspace? Register"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated Research Workspace
  return (
    <div className="flex h-screen overflow-hidden bg-[#0b0d10] text-[#e1e4ea] font-sans">
      {/* Sidebar: Navigation & Investigation Registry */}
      <aside className="w-80 border-r border-[#20252e] bg-[#0e1217] flex flex-col justify-between">
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Header */}
          <div className="h-14 border-b border-[#20252e] px-4 flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2.5">
              <div className="w-6 h-6 rounded bg-emerald-950 border border-emerald-500/40 flex items-center justify-center font-mono font-bold text-emerald-400 text-xs">
                M
              </div>
              <span className="font-semibold text-sm tracking-wider uppercase text-slate-100">
                Meridian
              </span>
            </Link>
            <button 
              onClick={() => setShowNewModal(true)}
              className="p-1.5 rounded bg-[#1c222b] hover:bg-emerald-950 hover:text-emerald-400 border border-[#2d3748] text-slate-300 transition-all text-xs flex items-center space-x-1 cursor-pointer"
              title="New Company Investigation"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New</span>
            </button>
          </div>

          {/* Org Scoping Pill */}
          <div className="px-4 py-2.5 border-b border-[#20252e] bg-[#12161e] flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2 overflow-hidden">
              <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span className="text-slate-300 truncate font-medium">
                {user?.organization?.name || "Corporate Strategy Org"}
              </span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-600/30 font-mono">
              INSTITUTIONAL
            </span>
          </div>

          {/* Investigation List */}
          <div className="p-3 text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Dossier Registry</span>
            <span>{investigations.length} Total</span>
          </div>

          <div className="flex-1 overflow-y-auto px-2 space-y-1">
            {investigations.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                No active investigations found. Click "New" to start an investigation.
              </div>
            ) : (
              investigations.map((inv) => (
                <button
                  key={inv.id}
                  onClick={() => selectInvestigation(inv.id)}
                  className={`w-full text-left p-3 rounded border transition-all cursor-pointer ${
                    selectedInvId === inv.id
                      ? "bg-[#181f2a] border-emerald-500/50 text-slate-100"
                      : "bg-[#12161e] border-[#20252e] text-slate-300 hover:border-slate-600"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-xs text-slate-100 truncate">
                      {inv.company_name}
                    </span>
                    {inv.ticker && (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#1c222b] text-emerald-400 border border-[#2d3748]">
                        {inv.ticker}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="capitalize">{inv.depth}</span>
                    <span className="font-mono text-slate-300">
                      {inv.status === "completed" ? "100%" : `${inv.progress_percentage}%`}
                    </span>
                  </div>
                  <div className="w-full bg-[#20252e] h-1 rounded-full mt-2 overflow-hidden">
                    <div 
                      className={`h-full ${inv.status === "completed" ? "bg-emerald-500" : "bg-cyan-500"}`} 
                      style={{ width: `${inv.progress_percentage}%` }}
                    ></div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* User Profile & Sign Out */}
        <div className="p-3 border-t border-[#20252e] bg-[#10141a] flex items-center justify-between text-xs">
          <div className="overflow-hidden">
            <div className="font-medium text-slate-200 truncate">{user?.full_name}</div>
            <div className="text-[11px] text-slate-500 truncate">{user?.email}</div>
          </div>
          <button 
            onClick={handleLogout}
            className="p-1.5 rounded hover:bg-red-950/40 text-slate-400 hover:text-red-300 transition-colors"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Investigation Panel */}
      <main className="flex-1 flex flex-col overflow-hidden bg-[#0b0d10]">
        {invDetail ? (
          <>
            {/* Investigation Top Navigation Bar */}
            <header className="h-16 border-b border-[#20252e] px-6 flex items-center justify-between bg-[#0e1217]">
              <div>
                <div className="flex items-center space-x-3">
                  <h1 className="text-lg font-serif font-semibold text-slate-100">
                    {invDetail.company.name}
                  </h1>
                  {invDetail.company.ticker && (
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#1c222b] text-emerald-400 border border-[#2d3748]">
                      {invDetail.company.ticker}
                    </span>
                  )}
                  <span className={`text-[11px] font-mono uppercase px-2 py-0.5 rounded border ${
                    invDetail.status === "completed" 
                      ? "bg-emerald-950/50 text-emerald-400 border-emerald-500/30" 
                      : "bg-cyan-950/50 text-cyan-400 border-cyan-500/30"
                  }`}>
                    {invDetail.status}
                  </span>
                </div>
                <div className="text-xs text-slate-400 flex items-center space-x-3 mt-0.5 font-mono">
                  <span>Sector: {invDetail.company.sector}</span>
                  <span>•</span>
                  <span>Scope: {invDetail.scope.length} tracks</span>
                  <span>•</span>
                  <span>Cost: ${invDetail.current_cost_usd.toFixed(2)} USD</span>
                </div>
              </div>

              {/* Action Buttons & Tabs */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center bg-[#141922] p-1 rounded border border-[#20252e] text-xs font-medium">
                  <button
                    onClick={() => setActiveTab("boardroom")}
                    className={`px-3 py-1.5 rounded transition-all cursor-pointer ${
                      activeTab === "boardroom" ? "bg-emerald-950 text-emerald-300 border border-emerald-500/40" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Adversarial Boardroom
                  </button>
                  <button
                    onClick={() => setActiveTab("evidence")}
                    className={`px-3 py-1.5 rounded transition-all cursor-pointer ${
                      activeTab === "evidence" ? "bg-emerald-950 text-emerald-300 border border-emerald-500/40" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Evidence Provenance ({evidence.length})
                  </button>
                  <button
                    onClick={() => setActiveTab("reports")}
                    className={`px-3 py-1.5 rounded transition-all cursor-pointer ${
                      activeTab === "reports" ? "bg-emerald-950 text-emerald-300 border border-emerald-500/40" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Intelligence Dossier
                  </button>
                </div>

                {invDetail.status !== "completed" && (
                  <button
                    onClick={handleStartPipeline}
                    className="px-3.5 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium flex items-center space-x-1.5 shadow-sm cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Run Investigation</span>
                  </button>
                )}
              </div>
            </header>

            {/* Tab 1: Adversarial Boardroom & Multi-Specialist Deliberation */}
            {activeTab === "boardroom" && (
              <div className="flex-1 overflow-hidden grid grid-cols-12 divide-x divide-[#20252e]">
                {/* Specialists Column (Left 3 cols) */}
                <div className="col-span-3 flex flex-col overflow-hidden bg-[#0e1217]">
                  <div className="p-3 border-b border-[#20252e] text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center justify-between">
                    <span>Specialist Roster</span>
                    <span className="text-emerald-400">{specialists.length} Deployed</span>
                  </div>
                  <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {specialists.map((s) => (
                      <div key={s.id} className="p-3 rounded bg-[#141922] border border-[#20252e] text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-slate-200">{s.role_name}</span>
                          <span className="font-mono text-emerald-400">{(s.confidence * 100).toFixed(0)}%</span>
                        </div>
                        <p className="text-slate-400 text-[11px] leading-relaxed mb-2">
                          {s.mandate}
                        </p>
                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-2 border-t border-[#20252e]">
                          <span>{s.tokens_consumed} tokens</span>
                          <span className="capitalize text-slate-300">{s.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Deliberation & Claims Floor (Center 6 cols) */}
                <div className="col-span-6 flex flex-col overflow-hidden bg-[#0b0d10]">
                  <div className="p-3 border-b border-[#20252e] text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center justify-between">
                    <span>Adversarial Debate Floor & Claims</span>
                    <span className="text-amber-400">Structured Deliberation</span>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {/* Disputed Claims */}
                    <div className="space-y-2">
                      <div className="text-[11px] font-mono uppercase text-slate-400">Investigative Claims & Adjudication</div>
                      {claims.map((c) => (
                        <div 
                          key={c.id} 
                          className={`p-3.5 rounded border text-xs ${
                            c.disputed 
                              ? "bg-amber-950/20 border-amber-800/40 text-amber-100" 
                              : "bg-[#141922] border-[#20252e] text-slate-200"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-mono text-[10px] uppercase px-1.5 py-0.5 rounded bg-[#1c222b] text-slate-300 border border-[#2d3748]">
                              {c.specialist_id.replace(/_/g, " ")}
                            </span>
                            <span className={`text-[10px] font-mono uppercase font-semibold ${
                              c.verdict === "supported" ? "text-emerald-400" : "text-amber-400"
                            }`}>
                              Verdict: {c.verdict}
                            </span>
                          </div>
                          <p className="text-xs leading-relaxed">{c.statement}</p>
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

                    {/* Debate Exchanges */}
                    {debates.map((d) => (
                      <div key={d.id} className="pt-4 border-t border-[#20252e]">
                        <div className="text-xs font-medium text-slate-300 mb-3 flex items-center space-x-1.5">
                          <Scale className="w-3.5 h-3.5 text-amber-400" />
                          <span>Debate Session: {d.topic}</span>
                        </div>
                        <div className="space-y-2.5">
                          {d.arguments.map((arg: any) => (
                            <div 
                              key={arg.id} 
                              className={`p-3 rounded border text-xs ${
                                arg.argument_type === "adjudication"
                                  ? "bg-emerald-950/30 border-emerald-500/40 text-emerald-200"
                                  : arg.argument_type === "challenge"
                                  ? "bg-amber-950/20 border-amber-800/40 text-amber-200"
                                  : "bg-[#141922] border-[#20252e] text-slate-300"
                              }`}
                            >
                              <div className="flex items-center justify-between text-[10px] font-mono uppercase mb-1">
                                <span className="font-semibold text-slate-200">{arg.specialist_id.replace(/_/g, " ")}</span>
                                <span className="text-slate-400">{arg.argument_type}</span>
                              </div>
                              <p className="leading-relaxed">{arg.content}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Evidence Column (Right 3 cols) */}
                <div className="col-span-3 flex flex-col overflow-hidden bg-[#0e1217]">
                  <div className="p-3 border-b border-[#20252e] text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center justify-between">
                    <span>Evidence Inspector</span>
                    <span className="text-cyan-400">{evidence.length} Passages</span>
                  </div>
                  <div className="flex-1 overflow-y-auto p-3 space-y-3">
                    {evidence.map((ev) => (
                      <div key={ev.id} className="p-3 rounded bg-[#141922] border border-[#20252e] text-xs">
                        <div className="text-[10px] font-mono text-slate-400 uppercase">{ev.publisher}</div>
                        <div className="font-semibold text-slate-200 mt-0.5">{ev.source_title}</div>
                        <p className="text-slate-300 text-[11px] italic mt-2 p-2 rounded bg-[#0b0d10] border border-[#20252e]">
                          "{ev.extracted_passage}"
                        </p>
                        <div className="flex items-center justify-between mt-2 text-[10px] font-mono text-emerald-400">
                          <span>{ev.location_reference}</span>
                          <span>Auth: {(ev.reliability_score * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Evidence Provenance */}
            {activeTab === "evidence" && (
              <div className="flex-1 overflow-y-auto p-6 max-w-5xl mx-auto w-full">
                <div className="mb-6">
                  <h2 className="text-xl font-serif text-slate-100">Evidence Provenance & Verification Audit</h2>
                  <p className="text-xs text-slate-400">
                    Primary source documents ingested, passage extractions, checksums, and institutional reliability ratings.
                  </p>
                </div>

                <div className="space-y-4">
                  {evidence.map((ev) => (
                    <div key={ev.id} className="p-4 rounded-lg bg-[#141922] border border-[#20252e]">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                          {ev.category.toUpperCase()}
                        </span>
                        <span className="text-xs font-mono text-slate-400">
                          Reliability: {(ev.reliability_score * 100).toFixed(0)}%
                        </span>
                      </div>
                      <h3 className="font-medium text-slate-100 text-sm mb-1">{ev.source_title}</h3>
                      <p className="text-xs text-slate-400 mb-3">Publisher: {ev.publisher} • Reference: {ev.location_reference}</p>
                      
                      <div className="p-3 rounded bg-[#0b0d10] border border-[#20252e] text-xs text-slate-200 font-serif leading-relaxed mb-3">
                        "{ev.extracted_passage}"
                      </div>

                      <div className="text-[11px] text-emerald-400/90 font-mono flex items-center space-x-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{ev.reliability_assessment}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 3: Institutional Intelligence Dossier / Reports */}
            {activeTab === "reports" && (
              <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto w-full">
                {reports.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 text-sm">
                    Report is generating or pending investigation completion.
                  </div>
                ) : (
                  reports.map((r) => (
                    <article key={r.id} className="p-8 rounded-lg bg-[#12161e] border border-[#20252e] text-slate-200">
                      <div className="border-b border-[#20252e] pb-6 mb-6">
                        <div className="text-xs font-mono uppercase tracking-widest text-emerald-400 mb-2">
                          Institutional Dossier • Version {r.version}
                        </div>
                        <h1 className="text-2xl font-serif font-bold text-slate-100">{r.title}</h1>
                        <p className="text-xs font-mono text-slate-400 mt-2">
                          Generated on {new Date(r.created_at).toLocaleDateString()} • {r.citations_count} Verified Citations
                        </p>
                      </div>

                      {/* Executive Summary */}
                      <div className="mb-8">
                        <h2 className="text-xs font-mono uppercase text-slate-400 tracking-wider mb-2">
                          Executive Assessment
                        </h2>
                        <div className="text-sm font-serif leading-relaxed p-4 rounded bg-[#161c24] border border-[#20252e] text-slate-300">
                          {r.executive_summary}
                        </div>
                      </div>

                      {/* Financial Analysis Grid */}
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

                      {/* Sections */}
                      <div className="space-y-6">
                        {r.sections?.map((sec: any, idx: number) => (
                          <div key={idx} className="space-y-2">
                            <h3 className="text-sm font-semibold text-slate-100">{sec.title}</h3>
                            <p className="text-xs text-slate-400 leading-relaxed">{sec.content}</p>
                          </div>
                        ))}
                      </div>

                      {/* Risk Register */}
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
              Enter target corporate identity. Meridian will resolve entities, ingest primary disclosures, and activate the specialist roster.
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
                  Initiate Investigation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
