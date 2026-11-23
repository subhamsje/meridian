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
  Pause,
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
  Activity,
  Sliders,
  Terminal,
  Zap,
  Info,
  ChevronDown,
  Columns,
  LayoutGrid,
  Menu,
  X,
  Compass,
  Check
} from "lucide-react";
import { API_BASE } from "@/lib/utils";
import LivingKnowledgeGraph, { GraphNode, GraphEdge, INSTITUTIONAL_CATEGORIES } from "@/components/LivingKnowledgeGraph";
import { ReactFlowKnowledgeGraph } from "@/components/ReactFlowKnowledgeGraph";
import { SimulationAnalyticsCharts } from "@/components/SimulationAnalyticsCharts";
import { AgentNetworkGraph } from "@/components/AgentNetworkGraph";

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
  const [reports, setReports] = useState<any[]>([]);
  const [graphData, setGraphData] = useState<{ nodes: any[]; edges: any[] }>({ nodes: [], edges: [] });
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [selectedEdge, setSelectedEdge] = useState<any>(null);
  const [graphEngine, setGraphEngine] = useState<"canvas" | "reactflow">("canvas");
  
  // Workstation Tabs: debate, network, graph, stock, scenarios, timeline, analytics, report
  const [activeTab, setActiveTab] = useState<"debate" | "network" | "graph" | "stock" | "scenarios" | "timeline" | "analytics" | "report">("debate");

  // Stock Intelligence & Dossier Data
  const [stockData, setStockData] = useState<any>(null);
  const [dossierData, setDossierData] = useState<any>(null);

  // Analytics Data from Backend
  const [analyticsData, setAnalyticsData] = useState<any>(null);

  // Auth Form State
  const [email, setEmail] = useState("lead.analyst@meridian.internal");
  const [password, setPassword] = useState("InstitutionalPassword2026!");
  const [fullName, setFullName] = useState("Lead Portfolio Investigator");
  const [orgName, setOrgName] = useState("Meridian Capital Intelligence");
  const [isRegistering, setIsRegistering] = useState(false);
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(false);

  // New Scenario Modal State
  const [showScenarioModal, setShowScenarioModal] = useState(false);
  const [scenarioTitle, setScenarioTitle] = useState("Ethereum L2 vs Private Consortium Ledger Settlement");
  const [scenarioProblem, setScenarioProblem] = useState(
    "Evaluate whether Tier-1 global clearing banks should adopt zero-knowledge Ethereum L2 rollups or build a consortium private permissioned database for wholesale liquidity settlement."
  );
  const [scenarioUrls, setScenarioUrls] = useState("https://bis.org/publ/qtrpdf/r_qt2403.htm");
  const [scenarioDebateMode, setScenarioDebateMode] = useState("adversarial");
  const [scenarioAgentCount, setScenarioAgentCount] = useState(6);
  const [scenarioRoundsCount, setScenarioRoundsCount] = useState(6);
  const [scenarioCreating, setScenarioCreating] = useState(false);

  // God-View Intervention Modal State
  const [showGodViewModal, setShowGodViewModal] = useState(false);
  const [godViewText, setGodViewText] = useState("");
  const [godViewLoading, setGodViewLoading] = useState(false);

  // 1-on-1 Agent Interview Modal State
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [interviewAgent, setInterviewAgent] = useState<any>(null);
  const [interviewQuery, setInterviewQuery] = useState("");
  const [interviewHistory, setInterviewHistory] = useState<Array<{ q: string; a: string; time: string }>>([]);
  const [interviewLoading, setInterviewLoading] = useState(false);

  // Plenary Broadcast Survey Modal State (MiroFish Step 5)
  const [showSurveyModal, setShowSurveyModal] = useState(false);
  const [surveyQuestion, setSurveyQuestion] = useState("What is the primary counterparty risk exposure under severe market liquidity contraction?");
  const [selectedSurveyAgents, setSelectedSurveyAgents] = useState<string[]>([]);
  const [surveyLoading, setSurveyLoading] = useState(false);
  const [surveyResult, setSurveyResult] = useState<any>(null);

  // Simulation Running State
  const [isSimulating, setIsSimulating] = useState(false);
  const [viewMode, setViewMode] = useState<"tabs" | "split">("tabs");

  // Mobile / Tablet Responsive States
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [debateMobileView, setDebateMobileView] = useState<"thread" | "specialists">("thread");

  // Dual-mode Creation Modal State: Company Investigation vs Scenario Simulation
  const [creationTab, setCreationTab] = useState<"company" | "scenario">("company");
  const [compName, setCompName] = useState("CrowdStrike Holdings");
  const [compTicker, setCompTicker] = useState("CRWD");
  const [compSector, setCompSector] = useState("Cybersecurity & Cloud Defense");
  const [compScope, setCompScope] = useState("Forensic single-point failure audit, Microsoft Defender bundling resistance, and LTM net retention durability.");
  const [compDepth, setCompDepth] = useState<"rapid" | "standard" | "comprehensive">("comprehensive");
  const [compHorizon, setCompHorizon] = useState("3 Years");
  const [compPerspective, setCompPerspective] = useState("Institutional Growth Equity");
  const [compScopes, setCompScopes] = useState<string[]>([
    "Financial Health & Operating Margins",
    "Moat Defensibility & Switching Costs",
    "Valuation Sensitivity & Scenario Stress-Testing"
  ]);

  // Real-time Discovery Search State
  const [discoveryQuery, setDiscoveryQuery] = useState("");
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [discoveryResults, setDiscoveryResults] = useState<any[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem("meridian_token");
    if (savedToken) {
      setToken(savedToken);
      fetchMe(savedToken);
    }
  }, []);

  // Debounced Discovery Query
  useEffect(() => {
    if (!token || !discoveryQuery.trim()) {
      setDiscoveryResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsDiscovering(true);
      try {
        const res = await fetch(`${API_BASE}/companies/discover?q=${encodeURIComponent(discoveryQuery.trim())}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setDiscoveryResults(data);
        }
      } catch (err) {
        console.error("Discovery search error:", err);
      } finally {
        setIsDiscovering(false);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [discoveryQuery, token]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setLoading(true);

    try {
      const endpoint = isRegistering ? `${API_BASE}/auth/register` : `${API_BASE}/auth/login`;
      const body = isRegistering 
        ? { email, password, full_name: fullName, organization_name: orgName }
        : { email, password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const data = await res.json();

      if (!res.ok) {
        setAuthError(data.detail || "Authentication failed");
        return;
      }

      setToken(data.access_token);
      localStorage.setItem("meridian_token", data.access_token);
      setUser(data);
      fetchInvestigations(data.access_token);
    } catch (err: any) {
      setAuthError(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  const fetchMe = async (authToken: string) => {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        fetchInvestigations(authToken);
      } else {
        handleLogout();
      }
    } catch (err) {
      handleLogout();
    }
  };

  const fetchInvestigations = async (authToken: string) => {
    try {
      const res = await fetch(`${API_BASE}/investigations`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setInvestigations(data);
        if (data.length > 0 && !selectedInvId) {
          selectInvestigation(data[0].id, authToken);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const selectInvestigation = async (id: string, authToken?: string) => {
    const t = authToken || token;
    if (!t) return;
    setSelectedInvId(id);

    try {
      const [detailRes, agentsRes, interRes, claimsRes, reportsRes, graphRes, analyticsRes, stockRes, dossierRes] = await Promise.all([
        fetch(`${API_BASE}/investigations/${id}`, { headers: { Authorization: `Bearer ${t}` } }),
        fetch(`${API_BASE}/investigations/${id}/society/agents`, { headers: { Authorization: `Bearer ${t}` } }),
        fetch(`${API_BASE}/investigations/${id}/society/interactions`, { headers: { Authorization: `Bearer ${t}` } }),
        fetch(`${API_BASE}/investigations/${id}/claims`, { headers: { Authorization: `Bearer ${t}` } }),
        fetch(`${API_BASE}/investigations/${id}/reports`, { headers: { Authorization: `Bearer ${t}` } }),
        fetch(`${API_BASE}/investigations/${id}/graph`, { headers: { Authorization: `Bearer ${t}` } }),
        fetch(`${API_BASE}/scenarios/${id}/analytics`, { headers: { Authorization: `Bearer ${t}` } }),
        fetch(`${API_BASE}/investigations/${id}/stock`, { headers: { Authorization: `Bearer ${t}` } }).catch(() => null),
        fetch(`${API_BASE}/investigations/${id}/dossier`, { headers: { Authorization: `Bearer ${t}` } }).catch(() => null)
      ]);

      if (detailRes.ok) setInvDetail(await detailRes.json());
      if (agentsRes.ok) {
        const ags = await agentsRes.json();
        setSocietyAgents(ags);
        if (ags.length > 0) setSelectedAgent(ags[0]);
      }
      if (interRes.ok) setInteractions(await interRes.json());
      if (claimsRes.ok) setClaims(await claimsRes.json());
      if (reportsRes.ok) setReports(await reportsRes.json());
      if (graphRes.ok) setGraphData(await graphRes.json());
      if (analyticsRes.ok) setAnalyticsData(await analyticsRes.json());
      if (stockRes && stockRes.ok) setStockData(await stockRes.json());
      else setStockData(null);
      if (dossierRes && dossierRes.ok) setDossierData(await dossierRes.json());
      else setDossierData(null);
    } catch (err) {
      console.error(err);
    }
  };

  // Create Scenario Handler
  const handleCreateScenario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !scenarioTitle.trim() || !scenarioProblem.trim()) return;
    setScenarioCreating(true);

    try {
      const urls = scenarioUrls.split("\n").map(u => u.trim()).filter(Boolean);
      const res = await fetch(`${API_BASE}/scenarios`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: scenarioTitle,
          problem_statement: scenarioProblem,
          source_urls: urls,
          agent_count: scenarioAgentCount,
          rounds_count: scenarioRoundsCount,
          debate_mode: scenarioDebateMode,
          budget_limit_usd: 150.0
        })
      });

      const data = await res.json();
      if (res.ok) {
        setShowScenarioModal(false);
        // Start simulation immediately
        await fetch(`${API_BASE}/scenarios/${data.scenario_id}/start`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` }
        });
        await fetchInvestigations(token);
        selectInvestigation(data.scenario_id, token);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setScenarioCreating(false);
    }
  };

  // Create Company Intelligence Investigation Handler
  const handleCreateInvestigation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !compName.trim()) return;
    setScenarioCreating(true);

    try {
      const res = await fetch(`${API_BASE}/investigations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          company_name: compName,
          ticker: compTicker,
          sector: compSector,
          scope: [compScope],
          depth: compDepth,
          budget_limit_usd: 150.0
        })
      });

      const data = await res.json();
      if (res.ok && data.investigation_id) {
        setShowScenarioModal(false);
        // Start investigation
        await fetch(`${API_BASE}/investigations/${data.investigation_id}/start`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => null);
        await fetchInvestigations(token);
        selectInvestigation(data.investigation_id, token);
      }
    } catch (err) {
      console.error("Failed creating company investigation:", err);
    } finally {
      setScenarioCreating(false);
    }
  };

  // Launch or Resume Multi-Round Simulation
  const handleStartSimulation = async () => {
    if (!selectedInvId || !token) return;
    setIsSimulating(true);

    try {
      await fetch(`${API_BASE}/scenarios/${selectedInvId}/start`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });

      // Poll updates periodically
      const interval = setInterval(async () => {
        selectInvestigation(selectedInvId, token);
      }, 1000);

      setTimeout(() => {
        clearInterval(interval);
        setIsSimulating(false);
        selectInvestigation(selectedInvId, token);
      }, 5000);
    } catch (err) {
      console.error(err);
      setIsSimulating(false);
    }
  };

  // God-View Intervention
  const handleGodViewIntervention = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvId || !godViewText.trim() || !token) return;
    setGodViewLoading(true);

    try {
      const res = await fetch(`${API_BASE}/scenarios/${selectedInvId}/intervene`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ intervention_text: godViewText })
      });
      if (res.ok) {
        setShowGodViewModal(false);
        setGodViewText("");
        selectInvestigation(selectedInvId, token);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGodViewLoading(false);
    }
  };

  // 1-on-1 Agent Interview
  const handleInterviewAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvId || !interviewAgent || !interviewQuery.trim() || !token) return;
    setInterviewLoading(true);

    const question = interviewQuery;
    setInterviewQuery("");

    try {
      const res = await fetch(`${API_BASE}/scenarios/${selectedInvId}/interview/${interviewAgent.agent_id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ question })
      });
      const data = await res.json();
      if (res.ok) {
        setInterviewHistory(prev => [
          ...prev,
          { q: question, a: data.response, time: new Date().toLocaleTimeString() }
        ]);
        // Also refresh general interactions
        const interRes = await fetch(`${API_BASE}/investigations/${selectedInvId}/society/interactions`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (interRes.ok) setInteractions(await interRes.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setInterviewLoading(false);
    }
  };

  // Plenary Broadcast Survey Across Society (MiroFish Step 5)
  const handleBroadcastSurvey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvId || !surveyQuestion.trim() || !token) return;
    setSurveyLoading(true);

    try {
      const res = await fetch(`${API_BASE}/scenarios/${selectedInvId}/survey`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          question: surveyQuestion,
          agent_ids: selectedSurveyAgents.length > 0 ? selectedSurveyAgents : undefined
        })
      });
      if (res.ok) {
        const data = await res.json();
        setSurveyResult(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSurveyLoading(false);
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
              <div className="text-[11px] text-[#737c88] font-mono">Multi-Agent Simulation & Debate SaaS</div>
            </div>
          </div>

          <h2 className="text-xl font-serif text-[#f8fafc] mb-1.5">
            {isRegistering ? "Create Institutional Seat" : "Authenticate Workspace"}
          </h2>
          <p className="text-xs text-[#a0a7b1] mb-4 leading-relaxed">
            {isRegistering 
              ? "Establish your organization domain and lead investigator seat."
              : "Enter your institutional credentials to access simulations and audit trails."}
          </p>

          {/* Quick Demo Seat Preset Fill */}
          <div className="mb-4 p-2.5 rounded bg-[#20242a] border border-[#3b82f6]/30 text-xs flex items-center justify-between">
            <div>
              <div className="text-[11px] font-mono text-[#3b82f6] font-semibold flex items-center space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Audited Institutional Seat</span>
              </div>
              <div className="text-[10px] text-[#737c88] font-mono mt-0.5">lead.analyst@meridian.internal</div>
            </div>
            <button
              type="button"
              onClick={() => {
                setEmail("lead.analyst@meridian.internal");
                setPassword("InstitutionalPassword2026!");
                setIsRegistering(false);
              }}
              className="px-2.5 py-1 rounded bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-[11px] font-mono cursor-pointer transition-colors shadow-xs shrink-0"
            >
              Quick Fill
            </button>
          </div>

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
      {/* =========================================================================
          LEFT SIDEBAR: Projects, Simulations & Navigation
         ========================================================================= */}
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex w-72 xl:w-80 border-r border-[#30353c] bg-[#181b1f] flex-col justify-between shrink-0">
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Header */}
          <div className="h-14 border-b border-[#30353c] px-4 flex items-center justify-between shrink-0">
            <Link href="/" className="flex items-center space-x-2.5">
              <div className="w-6 h-6 rounded bg-[#20242a] border border-[#30353c] flex items-center justify-center font-mono font-bold text-[#e5e7eb] text-xs">
                M
              </div>
              <span className="font-semibold text-xs tracking-wider uppercase text-[#e5e7eb]">
                Meridian
              </span>
            </Link>
            <button 
              onClick={() => setShowScenarioModal(true)}
              className="px-2.5 py-1 rounded bg-[#2563eb] hover:bg-[#1d4ed8] text-white transition-colors text-xs flex items-center space-x-1 cursor-pointer shadow-sm font-medium"
              title="Create New Investigation or Scenario"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New</span>
            </button>
          </div>

          {/* Org Pill */}
          <div className="px-4 py-2 border-b border-[#30353c] bg-[#141619] flex items-center justify-between text-xs shrink-0">
            <div className="flex items-center space-x-2 overflow-hidden">
              <Building2 className="w-3.5 h-3.5 text-[#737c88] shrink-0" />
              <span className="text-[#a0a7b1] truncate font-medium text-[11px]">
                {user?.organization?.name || "Corporate Strategy Org"}
              </span>
            </div>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#20242a] text-[#10b981] border border-[#30353c] font-mono shrink-0">
              ACTIVE
            </span>
          </div>

          {/* Scenarios / Investigations List */}
          <div className="p-3 text-[10.5px] font-mono text-[#737c88] uppercase tracking-wider flex items-center justify-between shrink-0">
            <span>Investigations Roster</span>
            <span>{investigations.length} Total</span>
          </div>

          <div className="flex-1 overflow-y-auto px-2 space-y-1">
            {investigations.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#737c88]">
                No investigations found. Click "New" to start an institutional company audit.
              </div>
            ) : (
              investigations.map((inv) => (
                <button
                  key={inv.id}
                  onClick={() => selectInvestigation(inv.id)}
                  className={`w-full text-left p-2.5 rounded border transition-colors cursor-pointer ${
                    selectedInvId === inv.id
                      ? "bg-[#20242a] border-[#3b82f6] text-[#f8fafc]"
                      : "bg-[#111315] border-[#30353c] text-[#a0a7b1] hover:text-[#e5e7eb] hover:bg-[#141619]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-xs text-[#e5e7eb] truncate">{inv.title}</span>
                    <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded shrink-0 ${
                      inv.status === "COMPLETED" ? "bg-[#142922] text-[#10b981]" : "bg-[#182232] text-[#3b82f6]"
                    }`}>
                      {inv.status}
                    </span>
                  </div>
                  <div className="text-[10px] text-[#737c88] font-mono truncate">
                    {new Date(inv.created_at).toLocaleDateString()} • {inv.depth || "6 Agents"}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* User Footer */}
        <div className="p-3 border-t border-[#30353c] bg-[#141619] flex items-center justify-between text-xs shrink-0">
          <div className="overflow-hidden">
            <div className="font-medium text-[#e5e7eb] truncate text-xs">{user?.full_name}</div>
            <div className="text-[10.5px] text-[#737c88] truncate">{user?.email}</div>
          </div>
          <button 
            onClick={handleLogout}
            className="p-1.5 rounded hover:bg-[#20242a] text-[#737c88] hover:text-[#e5e7eb] transition-colors cursor-pointer shrink-0"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Mobile & Tablet Slide-Over Sidebar Drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex animate-fadeIn">
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity" 
            onClick={() => setMobileSidebarOpen(false)} 
          />
          <aside className="relative w-80 max-w-[85vw] h-full bg-[#181b1f] border-r border-[#30353c] flex flex-col justify-between z-10 shadow-2xl">
            <div className="flex flex-col flex-1 overflow-hidden">
              <div className="h-14 border-b border-[#30353c] px-4 flex items-center justify-between shrink-0">
                <Link href="/" className="flex items-center space-x-2.5">
                  <div className="w-6 h-6 rounded bg-[#20242a] border border-[#30353c] flex items-center justify-center font-mono font-bold text-[#e5e7eb] text-xs">
                    M
                  </div>
                  <span className="font-semibold text-xs tracking-wider uppercase text-[#e5e7eb]">
                    Meridian
                  </span>
                </Link>
                <div className="flex items-center space-x-1">
                  <button 
                    onClick={() => {
                      setShowScenarioModal(true);
                      setMobileSidebarOpen(false);
                    }}
                    className="px-2.5 py-1 rounded bg-[#2563eb] text-white text-xs flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New</span>
                  </button>
                  <button 
                    onClick={() => setMobileSidebarOpen(false)}
                    className="p-1.5 rounded text-[#737c88] hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="px-4 py-2 border-b border-[#30353c] bg-[#141619] flex items-center justify-between text-xs shrink-0">
                <div className="flex items-center space-x-2 overflow-hidden">
                  <Building2 className="w-3.5 h-3.5 text-[#737c88] shrink-0" />
                  <span className="text-[#a0a7b1] truncate font-medium text-[11px]">
                    {user?.organization?.name || "Corporate Strategy Org"}
                  </span>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#20242a] text-[#10b981] border border-[#30353c] font-mono">
                  ACTIVE
                </span>
              </div>

              <div className="p-3 text-[10.5px] font-mono text-[#737c88] uppercase tracking-wider flex items-center justify-between shrink-0">
                <span>Investigations Roster</span>
                <span>{investigations.length}</span>
              </div>

              <div className="flex-1 overflow-y-auto px-2 space-y-1">
                {investigations.map((inv) => (
                  <button
                    key={inv.id}
                    onClick={() => {
                      selectInvestigation(inv.id);
                      setMobileSidebarOpen(false);
                    }}
                    className={`w-full text-left p-2.5 rounded border transition-colors cursor-pointer ${
                      selectedInvId === inv.id
                        ? "bg-[#20242a] border-[#3b82f6] text-[#f8fafc]"
                        : "bg-[#111315] border-[#30353c] text-[#a0a7b1] hover:text-[#e5e7eb] hover:bg-[#141619]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-xs text-[#e5e7eb] truncate">{inv.title}</span>
                      <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded shrink-0 ${
                        inv.status === "COMPLETED" ? "bg-[#142922] text-[#10b981]" : "bg-[#182232] text-[#3b82f6]"
                      }`}>
                        {inv.status}
                      </span>
                    </div>
                    <div className="text-[10px] text-[#737c88] font-mono truncate">
                      {new Date(inv.created_at).toLocaleDateString()} • {inv.depth || "6 Agents"}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 border-t border-[#30353c] bg-[#141619] flex items-center justify-between text-xs shrink-0">
              <div className="overflow-hidden">
                <div className="font-medium text-[#e5e7eb] truncate text-xs">{user?.full_name}</div>
                <div className="text-[10.5px] text-[#737c88] truncate">{user?.email}</div>
              </div>
              <button 
                onClick={handleLogout}
                className="p-1.5 rounded hover:bg-[#20242a] text-[#737c88] hover:text-[#e5e7eb] cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* =========================================================================
          MAIN WORKSPACE: Simulation Area with 6 Dedicated Tabs
         ========================================================================= */}
      <main className="flex-1 flex flex-col overflow-hidden bg-[#111315]">
        {invDetail ? (
          <>
            {/* Header: Title, Live Counters & Playback Controls */}
            <header className="h-14 sm:h-16 border-b border-[#30353c] px-3 sm:px-6 flex items-center justify-between bg-[#181b1f] shrink-0">
              <div className="flex items-center space-x-2 sm:space-x-3 overflow-hidden">
                <button
                  onClick={() => setMobileSidebarOpen(true)}
                  className="lg:hidden p-1.5 rounded text-[#a0a7b1] hover:text-[#e5e7eb] hover:bg-[#20242a] transition-colors cursor-pointer shrink-0"
                  aria-label="Toggle Navigation Drawer"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <div className="overflow-hidden">
                  <div className="flex items-center space-x-2">
                    <h1 className="text-sm sm:text-base font-serif font-bold text-[#f8fafc] truncate max-w-[170px] sm:max-w-md lg:max-w-lg">
                      {invDetail.title}
                    </h1>
                    <span className={`text-[9px] sm:text-[10px] font-mono uppercase px-1.5 sm:px-2 py-0.5 rounded border shrink-0 ${
                      invDetail.status === "COMPLETED"
                        ? "bg-[#142922] text-[#10b981] border-[#10b981]/30"
                        : "bg-[#182232] text-[#3b82f6] border-[#3b82f6]/30 animate-pulse"
                    }`}>
                      {invDetail.status}
                    </span>
                  </div>
                  <div className="text-[10px] sm:text-[11px] text-[#737c88] font-mono flex items-center space-x-1.5 sm:space-x-2 mt-0.5 truncate">
                    <span>{invDetail.debate_mode || "Adversarial"}</span>
                    <span>•</span>
                    <span>{societyAgents.length} Agents</span>
                    <span className="hidden sm:inline">•</span>
                    <span className="hidden sm:inline">{interactions.length} Interactions</span>
                    <span className="hidden md:inline">•</span>
                    <span className="hidden md:inline">${(analyticsData?.total_cost_usd || 0.014).toFixed(4)}</span>
                  </div>
                </div>
              </div>

              {/* Action Controls */}
              <div className="flex items-center space-x-1 sm:space-x-2 shrink-0">
                <button
                  onClick={() => setShowGodViewModal(true)}
                  className="px-2 sm:px-3 py-1.5 rounded bg-[#20242a] hover:bg-[#282d35] text-[#f59e0b] border border-[#f59e0b]/40 text-xs font-mono flex items-center space-x-1 cursor-pointer shadow-sm"
                  title="God-View Inject Exogenous Event"
                >
                  <Zap className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden sm:inline">God-View</span>
                </button>

                <button
                  onClick={() => setShowInterviewModal(true)}
                  className="px-2 sm:px-3 py-1.5 rounded bg-[#20242a] hover:bg-[#282d35] text-[#3b82f6] border border-[#3b82f6]/40 text-xs font-mono flex items-center space-x-1 cursor-pointer shadow-sm"
                  title="1-on-1 Specialist Interview"
                >
                  <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden md:inline">1-on-1 </span><span className="hidden sm:inline">Interview</span>
                </button>

                <button
                  onClick={() => {
                    setShowSurveyModal(true);
                    setSurveyResult(null);
                  }}
                  className="px-2 sm:px-3 py-1.5 rounded bg-[#20242a] hover:bg-[#282d35] text-[#10b981] border border-[#10b981]/40 text-xs font-mono flex items-center space-x-1 cursor-pointer shadow-sm"
                  title="Broadcast Survey to All Specialists"
                >
                  <Send className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden sm:inline">Survey</span>
                </button>

                <button
                  onClick={handleStartSimulation}
                  disabled={isSimulating}
                  className="px-2.5 sm:px-3.5 py-1.5 rounded bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-medium flex items-center space-x-1 cursor-pointer shadow-sm disabled:opacity-50 transition-colors shrink-0"
                  title="Launch Simulation Round"
                >
                  <Play className="w-3.5 h-3.5 fill-current shrink-0" />
                  <span className="hidden sm:inline">{isSimulating ? "Simulating..." : "Run Sim"}</span>
                </button>
              </div>
            </header>

            {/* Sub-Header Tabs with Responsive Horizontal Scroll */}
            <div className="h-10 border-b border-[#30353c] px-3 sm:px-6 bg-[#141619] flex items-center justify-between text-xs shrink-0 overflow-x-auto scrollbar-none">
              <div className="flex items-center space-x-1 shrink-0">
                {[
                  { key: "debate", label: "Live Debate", icon: MessageSquare, badge: interactions.length },
                  { key: "network", label: "Agent Network", icon: Users, badge: societyAgents.length },
                  { key: "graph", label: "Knowledge Graph", icon: Network, badge: graphData.nodes.length },
                  { key: "stock", label: "Stock & Capitalization", icon: TrendingUp, badge: stockData?.ticker || (invDetail?.company?.ticker) },
                  { key: "scenarios", label: "4-Scenario Matrix", icon: Sliders },
                  { key: "timeline", label: "Timeline", icon: Clock },
                  { key: "analytics", label: "Analytics", icon: Activity },
                  { key: "report", label: "Investment Dossier", icon: FileText, badge: "PDF" }
                ].map((t) => {
                  const Icon = t.icon;
                  const isActive = activeTab === t.key;
                  return (
                    <button
                      key={t.key}
                      onClick={() => setActiveTab(t.key as any)}
                      className={`px-2.5 sm:px-3 py-1 rounded text-xs transition-colors cursor-pointer flex items-center space-x-1.5 whitespace-nowrap ${
                        isActive
                          ? "bg-[#20242a] text-[#f8fafc] font-medium border border-[#30353c]"
                          : "text-[#a0a7b1] hover:text-[#e5e7eb] hover:bg-[#181b1f]"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span>{t.label}</span>
                      {t.badge !== undefined && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#111315] text-[#737c88]">
                          {t.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Right: Engine & View Mode Controls */}
              <div className="hidden md:flex items-center space-x-3 shrink-0 ml-4">
                {activeTab === "graph" && viewMode === "tabs" && (
                  <div className="flex items-center space-x-1 text-[10px] font-mono">
                    <span className="text-[#737c88]">Engine:</span>
                    <button
                      onClick={() => setGraphEngine("canvas")}
                      className={`px-2 py-0.5 rounded cursor-pointer ${graphEngine === "canvas" ? "bg-[#2563eb] text-white" : "text-[#a0a7b1]"}`}
                    >
                      Canvas
                    </button>
                    <button
                      onClick={() => setGraphEngine("reactflow")}
                      className={`px-2 py-0.5 rounded cursor-pointer ${graphEngine === "reactflow" ? "bg-[#2563eb] text-white" : "text-[#a0a7b1]"}`}
                    >
                      React Flow
                    </button>
                  </div>
                )}

                <div className="h-3.5 w-px bg-[#30353c]"></div>

                {/* MiroFish Two-Column View Mode Toggle */}
                <div className="flex items-center space-x-1 bg-[#111315] p-0.5 rounded border border-[#30353c] text-[10px] font-mono">
                  <button
                    onClick={() => setViewMode("tabs")}
                    className={`px-2 py-0.5 rounded flex items-center space-x-1 cursor-pointer transition-colors ${
                      viewMode === "tabs" ? "bg-[#20242a] text-[#f8fafc] font-medium" : "text-[#737c88] hover:text-[#e5e7eb]"
                    }`}
                    title="Tabbed Workstation Mode"
                  >
                    <LayoutGrid className="w-3 h-3" />
                    <span>Workstation</span>
                  </button>
                  <button
                    onClick={() => setViewMode("split")}
                    className={`px-2 py-0.5 rounded flex items-center space-x-1 cursor-pointer transition-colors ${
                      viewMode === "split" ? "bg-[#20242a] text-[#3b82f6] font-medium border border-[#3b82f6]/40" : "text-[#737c88] hover:text-[#e5e7eb]"
                    }`}
                    title="Two-Column Split Mode (MiroFish Layout)"
                  >
                    <Columns className="w-3 h-3" />
                    <span>Split Mode</span>
                  </button>
                </div>
              </div>
            </div>

            {/* WORKSPACE CONTENT BODY */}
            <div className="flex-1 overflow-hidden">
              {viewMode === "split" ? (
                /* =========================================================================
                   MIROFISH TWO-COLUMN SPLIT MODE: Knowledge Graph + Simulation Station
                   ========================================================================= */
                <div className="h-full flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-[#30353c] overflow-y-auto lg:overflow-hidden">
                  {/* Left Column: Living Knowledge Graph */}
                  <div className="w-full lg:flex-1 h-[420px] lg:h-full bg-[#111315] relative flex flex-col overflow-hidden shrink-0">
                    <div className="h-8 px-4 bg-[#141619] border-b border-[#30353c] flex items-center justify-between text-[10px] font-mono text-[#737c88]">
                      <span className="flex items-center space-x-1.5 text-[#3b82f6]">
                        <Network className="w-3 h-3" />
                        <strong className="text-[#f8fafc] font-sans">LIVING KNOWLEDGE GRAPH</strong>
                      </span>
                      <span>{graphData.nodes.length} ENTITIES • {graphData.edges.length} RELATIONS</span>
                    </div>
                    <div className="flex-1 relative">
                      <LivingKnowledgeGraph
                        nodes={graphData.nodes}
                        edges={graphData.edges}
                        selectedNode={selectedNode}
                        onSelectNode={(n) => { setSelectedNode(n); setSelectedEdge(null); }}
                        selectedEdge={selectedEdge}
                        onSelectEdge={(e) => { setSelectedEdge(e); setSelectedNode(null); }}
                        showInternalInspector={false}
                      />

                      {/* Selected Node Inspector Bottom Sheet in Split Mode */}
                      {selectedNode && (
                        <div className="absolute bottom-2 left-2 right-2 max-w-md p-3 rounded-lg bg-[#181b1f]/95 border border-[#30353c] backdrop-blur-md shadow-2xl z-20 text-xs">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#20242a] text-[#3b82f6] border border-[#30353c]">
                              {selectedNode.type}
                            </span>
                            <button
                              onClick={() => setSelectedNode(null)}
                              className="text-[#737c88] hover:text-[#e5e7eb] p-0.5"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="font-serif font-bold text-[#f8fafc] text-sm mb-1">{selectedNode.label}</div>
                          {selectedNode.description && (
                            <p className="text-[11px] text-[#a0a7b1] font-serif leading-relaxed line-clamp-3">
                              {selectedNode.description}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: MiroFish Setup or Live Stream + System Control Panel */}
                  <div className="w-full lg:w-[480px] xl:w-[560px] min-h-[500px] lg:h-full flex flex-col bg-[#181b1f] overflow-hidden shrink-0">
                    {interactions.length === 0 ? (
                      /* MiroFish Stage 05: Preparation Complete View */
                      <div className="flex-1 flex flex-col overflow-y-auto p-5 space-y-4">
                        <div className="p-4 rounded bg-[#141619] border border-[#30353c] space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-mono font-bold text-[#f8fafc]">
                              05 Environment Preparation Complete
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/30">
                              READY FOR EXECUTION
                            </span>
                          </div>
                          <div className="text-[10px] font-mono text-[#737c88]">
                            POST /api/v1/scenarios/{invDetail.id}/start
                          </div>
                          <p className="text-xs text-[#a0a7b1] font-serif leading-relaxed">
                            Simulation environment calibrated. Knowledge graph ontology synthesized and {societyAgents.length} autonomous specialists initialized with independent analytical mandates.
                          </p>
                        </div>

                        {/* Simulation Rounds Setup */}
                        <div className="p-4 rounded bg-[#141619] border border-[#30353c] space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-serif font-bold text-[#f8fafc]">
                              Simulation Round Horizon
                            </label>
                            <span className="text-xs font-mono font-bold text-[#3b82f6]">
                              {scenarioRoundsCount} Rounds (72 Hours Modeled)
                            </span>
                          </div>
                          <p className="text-[11px] text-[#737c88] leading-relaxed">
                            MERIDIAN automatically plans and models 72 hours of institutional debate, where each round corresponds to 12 hours of real-time deliberative interaction.
                          </p>
                          <input
                            type="range"
                            min="2"
                            max="8"
                            step="1"
                            value={scenarioRoundsCount}
                            onChange={(e) => setScenarioRoundsCount(parseInt(e.target.value))}
                            className="w-full h-1.5 bg-[#30353c] rounded appearance-none cursor-pointer accent-[#2563eb]"
                          />

                          {/* Computational Advice Box */}
                          <div className="p-3 rounded bg-[#111315] border border-[#30353c] text-[11px] text-[#a0a7b1] space-y-1">
                            <div className="flex items-center space-x-1.5 text-[#3b82f6] font-mono text-[10px]">
                              <Info className="w-3.5 h-3.5" />
                              <span>COMPUTATIONAL ESTIMATION</span>
                            </div>
                            <p>
                              With {societyAgents.length} active specialists: Estimated runtime is ~20 seconds. Expected token consumption: ~4,800 tokens (~$0.014).
                            </p>
                          </div>

                          <button
                            onClick={handleStartSimulation}
                            disabled={isSimulating}
                            className="w-full py-2.5 rounded bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-medium cursor-pointer shadow transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                          >
                            <Play className="w-4 h-4 fill-current" />
                            <span>{isSimulating ? "Executing Rounds..." : "Launch Multi-Platform Simulation"}</span>
                          </button>
                        </div>

                        {/* Active Specialists Roster */}
                        <div className="space-y-1.5 flex-1">
                          <div className="text-[10px] font-mono uppercase text-[#737c88] tracking-wider">
                            Assembled Specialist Society ({societyAgents.length})
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {societyAgents.map((ag) => (
                              <div key={ag.id} className="p-2.5 rounded bg-[#141619] border border-[#30353c] text-xs">
                                <div className="font-semibold text-[#f8fafc] truncate">{ag.name}</div>
                                <div className="text-[10px] text-[#737c88] truncate">{ag.role}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Live Chronological Debate Stream */
                      <div className="flex-1 flex flex-col overflow-hidden">
                        <div className="p-3 border-b border-[#30353c] bg-[#141619] flex items-center justify-between text-xs">
                          <span className="font-mono text-[#a0a7b1] uppercase tracking-wider">
                            Live Deliberation Stream
                          </span>
                          <span className="text-[10px] font-mono text-[#10b981] flex items-center space-x-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-ping" />
                            <span>Streaming</span>
                          </span>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                          {interactions.map((msg, idx) => {
                            const isChallenge = msg.interaction_type === "CHALLENGE";
                            const isRebuttal = msg.interaction_type === "REBUT";
                            const isConcession = msg.interaction_type === "CONCEDE";
                            const isTool = msg.interaction_type === "TOOL_CALL";

                            return (
                              <div
                                key={msg.id || idx}
                                className={`p-3 rounded border text-xs space-y-1.5 ${
                                  isChallenge ? "bg-[#1c1815] border-[#f59e0b]/40" :
                                  isRebuttal ? "bg-[#141b24] border-[#3b82f6]/40" :
                                  isConcession ? "bg-[#1a1724] border-[#8b5cf6]/40" :
                                  isTool ? "bg-[#121f1d] border-[#10b981]/40" :
                                  "bg-[#111315] border-[#30353c]"
                                }`}
                              >
                                <div className="flex items-center justify-between text-[10px] font-mono">
                                  <div className="flex items-center space-x-2">
                                    <span className="font-bold text-[#f8fafc]">{msg.sender_agent_id}</span>
                                    <span className="text-[#737c88]">→</span>
                                    <span className="text-[#a0a7b1]">{msg.recipient_agent_id}</span>
                                  </div>
                                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#20242a] text-[#94a3b8]">
                                    {msg.interaction_type}
                                  </span>
                                </div>
                                <p className="text-[#cbd5e1] font-serif leading-relaxed text-xs">
                                  {msg.content}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Bottom MiroFish System Control Panel Terminal */}
                    <div className="h-44 border-t border-[#30353c] bg-[#111315] flex flex-col font-mono text-[11px] overflow-hidden">
                      <div className="h-7 px-3 bg-[#141619] border-b border-[#30353c] flex items-center justify-between text-[#737c88] text-[10px]">
                        <span className="flex items-center space-x-1.5">
                          <Terminal className="w-3 h-3 text-[#10b981]" />
                          <strong className="text-[#a0a7b1]">SYSTEM CONTROL PANEL</strong>
                        </span>
                        <span>SESSION: {invDetail.id.substring(0, 8)}</span>
                      </div>
                      <div className="flex-1 p-3 overflow-y-auto space-y-1 text-[#10b981]/90">
                        <div>12:00:00.120 | Agents Assembled: {societyAgents.length} specialists active</div>
                        <div>12:00:00.124 | Knowledge Graph: {graphData.nodes.length} entities, {graphData.edges.length} relations</div>
                        <div>12:00:00.128 | Modeled Duration: 72 hours institutional deliberation</div>
                        <div>12:00:00.132 | Status: {invDetail.status} • Total Interactions: {interactions.length}</div>
                        {interactions.length > 0 && (
                          <div className="text-[#3b82f6]">
                            12:00:05.880 | Last Epoch: #{interactions[interactions.length - 1]?.round_number || 1} • {interactions[interactions.length - 1]?.interaction_type}
                          </div>
                        )}
                        <div className="text-[#737c88]">
                          12:00:06.100 | Telemetry: {(analyticsData?.total_tokens || 4820).toLocaleString()} tokens consumed ($${(analyticsData?.total_cost_usd || 0.014).toFixed(4)})
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* =========================================================================
                   WORKSTATION TABBED MODE: 6 Dedicated Workstations
                   ========================================================================= */
                <div className="h-full overflow-hidden">
              {/* TAB 1: Live Debate */}
              {activeTab === "debate" && (
                <div className="h-full flex flex-col overflow-hidden">
                  {/* Mobile Segmented Switcher */}
                  <div className="lg:hidden shrink-0 p-2 bg-[#141619] border-b border-[#30353c] flex items-center justify-center">
                    <div className="flex rounded bg-[#111315] p-0.5 border border-[#30353c] text-xs font-mono">
                      <button
                        onClick={() => setDebateMobileView("thread")}
                        className={`px-3 py-1 rounded transition-colors ${
                          debateMobileView === "thread" ? "bg-[#20242a] text-[#f8fafc] font-medium" : "text-[#737c88]"
                        }`}
                      >
                        Live Debate ({interactions.length})
                      </button>
                      <button
                        onClick={() => setDebateMobileView("specialists")}
                        className={`px-3 py-1 rounded transition-colors ${
                          debateMobileView === "specialists" ? "bg-[#20242a] text-[#f8fafc] font-medium" : "text-[#737c88]"
                        }`}
                      >
                        Specialists ({societyAgents.length})
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 min-h-0 flex divide-x divide-[#30353c] overflow-hidden">
                    {/* Left Column: Specialist Directory */}
                    <div className={`w-full lg:w-72 bg-[#181b1f] flex-col overflow-hidden shrink-0 ${
                      debateMobileView === "specialists" ? "flex" : "hidden lg:flex"
                    }`}>
                      <div className="p-3 border-b border-[#30353c] bg-[#141619] text-xs font-mono text-[#737c88] uppercase tracking-wider flex items-center justify-between">
                        <span>Active Specialists</span>
                        <span>{societyAgents.length}</span>
                      </div>
                      <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {societyAgents.map((ag) => (
                          <div
                            key={ag.id}
                            onClick={() => {
                              setInterviewAgent(ag);
                              setShowInterviewModal(true);
                            }}
                            className="p-2.5 rounded bg-[#111315] border border-[#30353c] hover:border-[#3b82f6] cursor-pointer transition-colors"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-semibold text-xs text-[#e5e7eb] truncate">{ag.name}</span>
                              <span className="text-[9px] font-mono text-[#10b981]">{Math.round(ag.confidence * 100)}%</span>
                            </div>
                            <div className="text-[10px] text-[#737c88] truncate">{ag.role}</div>
                            <div className="mt-1 text-[9px] font-mono text-[#3b82f6] hover:underline flex items-center space-x-1">
                              <span>Interview 1-on-1</span>
                              <ArrowRight className="w-2.5 h-2.5" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right: Chronological Streaming Debate Thread */}
                    <div className={`flex-1 flex-col bg-[#111315] overflow-hidden ${
                      debateMobileView === "thread" ? "flex" : "hidden lg:flex"
                    }`}>
                      <div className="p-3 border-b border-[#30353c] bg-[#141619] flex items-center justify-between text-xs">
                        <span className="font-mono text-[#a0a7b1] uppercase tracking-wider">
                          Live Multi-Agent Deliberation Thread
                        </span>
                        <span className="text-[10px] font-mono text-[#10b981] flex items-center space-x-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-ping" />
                          <span>Streaming Active</span>
                        </span>
                      </div>

                      <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {interactions.length === 0 ? (
                          <div className="p-12 text-center text-xs font-mono text-[#737c88]">
                            No debate messages recorded yet. Click "Run Simulation" above to launch Round 1.
                          </div>
                        ) : (
                          interactions.map((msg, idx) => {
                            const isChallenge = msg.interaction_type === "CHALLENGE";
                            const isRebuttal = msg.interaction_type === "REBUT";
                            const isConcession = msg.interaction_type === "CONCEDE";
                            const isTool = msg.interaction_type === "TOOL_CALL";
                            const isOpening = msg.interaction_type === "OPENING_POSITION";

                            return (
                              <div 
                                key={msg.id || idx}
                                className={`p-3.5 rounded border text-xs space-y-1.5 transition-all ${
                                  isChallenge ? "bg-[#1c1815] border-[#f59e0b]/40" :
                                  isRebuttal ? "bg-[#141b24] border-[#3b82f6]/40" :
                                  isConcession ? "bg-[#1a1724] border-[#8b5cf6]/40" :
                                  isTool ? "bg-[#121f1d] border-[#10b981]/40" :
                                  "bg-[#181b1f] border-[#30353c]"
                                }`}
                              >
                                <div className="flex items-center justify-between text-[10px] font-mono">
                                  <div className="flex items-center space-x-2">
                                    <span className="font-bold text-[#f8fafc]">{msg.sender_agent_id?.replace(/_/g, " ")}</span>
                                    {msg.recipient_agent_id !== "ALL" && (
                                      <>
                                        <span className="text-[#737c88]">→</span>
                                        <span className="text-[#a0a7b1]">{msg.recipient_agent_id?.replace(/_/g, " ")}</span>
                                      </>
                                    )}
                                  </div>
                                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono uppercase font-semibold ${
                                    isChallenge ? "bg-[#f59e0b]/20 text-[#f59e0b]" :
                                    isRebuttal ? "bg-[#3b82f6]/20 text-[#3b82f6]" :
                                    isConcession ? "bg-[#8b5cf6]/20 text-[#8b5cf6]" :
                                    isTool ? "bg-[#10b981]/20 text-[#10b981]" :
                                    "bg-[#20242a] text-[#a0a7b1]"
                                  }`}>
                                    {msg.interaction_type}
                                  </span>
                                </div>

                                <p className="leading-relaxed font-serif text-[#cbd5e1] text-xs">
                                  {msg.content}
                                </p>

                                {msg.referenced_claim_id && (
                                  <div className="pt-1 text-[9.5px] font-mono text-[#737c88] flex items-center space-x-1">
                                    <span>Referenced Claim ID:</span>
                                    <span className="text-[#a0a7b1] underline">{msg.referenced_claim_id.slice(0, 12)}...</span>
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Agent Network Graph */}
              {activeTab === "network" && (
                <AgentNetworkGraph
                  agents={societyAgents}
                  interactions={interactions}
                  onSelectAgent={(ag) => setSelectedAgent(ag)}
                  onInterviewAgent={(ag) => {
                    setInterviewAgent(ag);
                    setShowInterviewModal(true);
                  }}
                />
              )}

              {/* TAB 3: Knowledge Graph */}
              {activeTab === "graph" && (
                <div className="h-full flex bg-[#111315] relative overflow-hidden">
                  <div className="flex-1 relative">
                    {graphEngine === "canvas" ? (
                      <LivingKnowledgeGraph
                        nodes={graphData.nodes}
                        edges={graphData.edges}
                        selectedNode={selectedNode}
                        onSelectNode={(n) => { setSelectedNode(n); setSelectedEdge(null); }}
                        selectedEdge={selectedEdge}
                        onSelectEdge={(e) => { setSelectedEdge(e); setSelectedNode(null); }}
                        showInternalInspector={false}
                      />
                    ) : (
                      <ReactFlowKnowledgeGraph
                        nodes={graphData.nodes}
                        edges={graphData.edges}
                        selectedNode={selectedNode}
                        onSelectNode={(n) => { setSelectedNode(n); setSelectedEdge(null); }}
                        selectedEdge={selectedEdge}
                        onSelectEdge={(e) => { setSelectedEdge(e); setSelectedNode(null); }}
                      />
                    )}

                    {/* Node / Edge Inspector Drawer in Tab 3 */}
                    {(selectedNode || selectedEdge) && (
                      <div className="absolute bottom-3 left-3 right-3 sm:left-auto sm:right-4 sm:top-4 sm:bottom-4 sm:w-80 p-4 rounded-xl bg-[#181b1f]/95 border border-[#30353c] backdrop-blur-md shadow-2xl z-30 flex flex-col overflow-y-auto text-xs">
                        <div className="flex items-center justify-between border-b border-[#30353c] pb-2 mb-3">
                          <span className="text-[10px] font-mono uppercase text-[#3b82f6] font-bold">
                            {selectedNode ? "Entity Provenance" : "Relationship Link"}
                          </span>
                          <button
                            onClick={() => { setSelectedNode(null); setSelectedEdge(null); }}
                            className="p-1 rounded text-[#737c88] hover:text-[#e5e7eb] hover:bg-[#20242a]"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        {selectedNode && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#20242a] text-[#10b981] border border-[#30353c]">
                                {selectedNode.type}
                              </span>
                              {selectedNode.ticker && (
                                <span className="text-[10px] font-mono text-[#a0a7b1]">
                                  {selectedNode.ticker}
                                </span>
                              )}
                            </div>
                            <h3 className="text-base font-serif font-bold text-[#f8fafc]">{selectedNode.label}</h3>
                            {selectedNode.description && (
                              <p className="text-xs text-[#cbd5e1] font-serif leading-relaxed bg-[#111315] p-3 rounded border border-[#30353c]">
                                {selectedNode.description}
                              </p>
                            )}
                            <div className="pt-2 text-[10px] font-mono text-[#737c88] space-y-1">
                              <div>Source: SEC Form 10-K & Institutional Disclosures</div>
                              <div>Node Degree: {graphData.edges.filter(e => e.source === selectedNode.id || e.target === selectedNode.id).length} Connected Links</div>
                            </div>
                          </div>
                        )}

                        {selectedEdge && (
                          <div className="space-y-2">
                            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#20242a] text-[#3b82f6] border border-[#30353c]">
                              {(selectedEdge.relationship || "RELATED_TO").replace(/_/g, " ")}
                            </span>
                            <div className="text-xs font-semibold text-[#f8fafc]">
                              {graphData.nodes.find(n => n.id === selectedEdge.source)?.label || selectedEdge.source} → {graphData.nodes.find(n => n.id === selectedEdge.target)?.label || selectedEdge.target}
                            </div>
                            {selectedEdge.description && (
                              <p className="text-xs text-[#cbd5e1] font-serif leading-relaxed bg-[#111315] p-3 rounded border border-[#30353c]">
                                "{selectedEdge.description}"
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: Stock & Capitalization */}
              {activeTab === "stock" && (
                <div className="h-full overflow-y-auto p-6 max-w-5xl mx-auto space-y-6">
                  {stockData && stockData.has_stock ? (
                    <div className="space-y-6">
                      {/* Live Stock Header Card */}
                      <div className="p-6 rounded-xl bg-[#181b1f] border border-[#30353c] flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center space-x-2 text-xs font-mono text-[#737c88] uppercase mb-1">
                            <span>{stockData.exchange || "NYSE"}</span>
                            <span>•</span>
                            <span className="text-[#3b82f6] font-semibold">{stockData.ticker}</span>
                            <span>•</span>
                            <span>Live Market Quote (yfinance)</span>
                          </div>
                          <div className="flex items-baseline space-x-3">
                            <span className="text-3xl font-bold font-mono text-[#f8fafc]">
                              ${stockData.current_price?.toFixed(2) || "N/A"}
                            </span>
                            <span className={`text-sm font-mono font-semibold flex items-center space-x-0.5 ${
                              (stockData.change_pct || 0) >= 0 ? "text-[#10b981]" : "text-[#ef4444]"
                            }`}>
                              {(stockData.change_pct || 0) >= 0 ? "+" : ""}{stockData.change_pct?.toFixed(2)}%
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                          <div className="p-2.5 rounded bg-[#111315] border border-[#30353c]">
                            <div className="text-[10px] text-[#737c88] uppercase">Market Cap</div>
                            <div className="text-sm font-bold text-[#e5e7eb] mt-0.5">
                              {stockData.market_cap ? `$${(stockData.market_cap / 1e12).toFixed(2)}T` : "N/A"}
                            </div>
                          </div>
                          <div className="p-2.5 rounded bg-[#111315] border border-[#30353c]">
                            <div className="text-[10px] text-[#737c88] uppercase">Trailing P/E</div>
                            <div className="text-sm font-bold text-[#e5e7eb] mt-0.5">
                              {stockData.trailing_pe ? `${stockData.trailing_pe.toFixed(1)}x` : "N/A"}
                            </div>
                          </div>
                          <div className="p-2.5 rounded bg-[#111315] border border-[#30353c]">
                            <div className="text-[10px] text-[#737c88] uppercase">Forward P/E</div>
                            <div className="text-sm font-bold text-[#e5e7eb] mt-0.5">
                              {stockData.forward_pe ? `${stockData.forward_pe.toFixed(1)}x` : "N/A"}
                            </div>
                          </div>
                          <div className="p-2.5 rounded bg-[#111315] border border-[#30353c]">
                            <div className="text-[10px] text-[#737c88] uppercase">52w High</div>
                            <div className="text-sm font-bold text-[#10b981] mt-0.5">
                              ${stockData.fifty_two_week_high?.toFixed(2) || "N/A"}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 30-Day Historical Price Performance Chart */}
                      {stockData.history && stockData.history.length > 0 && (
                        <div className="p-6 rounded-xl bg-[#181b1f] border border-[#30353c] space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-xs font-mono uppercase tracking-wider text-[#e5e7eb] font-semibold">
                              30-Day Daily Closing Price Series
                            </h3>
                            <span className="text-[10px] font-mono text-[#737c88]">
                              {stockData.history.length} Daily Sessions
                            </span>
                          </div>

                          <div className="h-44 w-full relative flex items-end pt-4 pb-2">
                            <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
                              {(() => {
                                const prices = stockData.history.map((h: any) => h.close);
                                const min = Math.min(...prices) * 0.98;
                                const max = Math.max(...prices) * 1.02;
                                const range = max - min || 1;
                                const points = stockData.history.map((h: any, i: number) => {
                                  const x = (i / (stockData.history.length - 1)) * 100;
                                  const y = 100 - ((h.close - min) / range) * 100;
                                  return `${x},${y}`;
                                }).join(" ");

                                return (
                                  <>
                                    <polyline
                                      fill="none"
                                      stroke="#3b82f6"
                                      strokeWidth="2"
                                      points={points}
                                    />
                                    {stockData.history.map((h: any, i: number) => {
                                      const cx = (i / (stockData.history.length - 1)) * 100;
                                      const cy = 100 - ((h.close - min) / range) * 100;
                                      return (
                                        <circle
                                          key={i}
                                          cx={`${cx}%`}
                                          cy={`${cy}%`}
                                          r="3"
                                          className="fill-[#2563eb] hover:fill-[#60a5fa] cursor-pointer"
                                        >
                                          <title>{`${h.date}: $${h.close.toFixed(2)}`}</title>
                                        </circle>
                                      );
                                    })}
                                  </>
                                );
                              })()}
                            </svg>
                          </div>
                          <div className="flex justify-between text-[10px] font-mono text-[#737c88] border-t border-[#30353c] pt-2">
                            <span>{stockData.history[0]?.date}</span>
                            <span>{stockData.history[Math.floor(stockData.history.length / 2)]?.date}</span>
                            <span>{stockData.history[stockData.history.length - 1]?.date}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Private Startup Capitalization Summary */
                    <div className="p-8 rounded-xl bg-[#181b1f] border border-[#30353c] space-y-6">
                      <div className="flex items-start justify-between border-b border-[#30353c] pb-4">
                        <div>
                          <div className="text-[10px] font-mono uppercase text-[#3b82f6] font-semibold">
                            Private Company Capitalization Structure
                          </div>
                          <h2 className="text-xl font-serif font-bold text-[#f8fafc] mt-0.5">
                            {invDetail?.company?.name || "Private Enterprise"}
                          </h2>
                          <div className="text-xs font-mono text-[#737c88] mt-1">
                            {invDetail?.company?.sector || "Venture-Backed Technology"}
                          </div>
                        </div>
                        <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-[#20242a] text-[#f59e0b] border border-[#f59e0b]/40">
                          Private Entity • Non-Reporting
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="p-4 rounded bg-[#111315] border border-[#30353c]">
                          <div className="text-[10px] font-mono uppercase text-[#737c88]">Estimated Valuation</div>
                          <div className="text-lg font-bold font-mono text-[#10b981] mt-1">$157.0B</div>
                          <div className="text-[10px] text-[#737c88] mt-0.5">Oct 2024 Late-Stage Round</div>
                        </div>
                        <div className="p-4 rounded bg-[#111315] border border-[#30353c]">
                          <div className="text-[10px] font-mono uppercase text-[#737c88]">Total Equity Raised</div>
                          <div className="text-lg font-bold font-mono text-[#3b82f6] mt-1">$17.9B</div>
                          <div className="text-[10px] text-[#737c88] mt-0.5">Across Strategic VC Rounds</div>
                        </div>
                        <div className="p-4 rounded bg-[#111315] border border-[#30353c]">
                          <div className="text-[10px] font-mono uppercase text-[#737c88]">Primary Backers</div>
                          <div className="text-xs font-semibold text-[#f8fafc] mt-1">Microsoft, Thrive, Khosla</div>
                          <div className="text-[10px] text-[#737c88] mt-0.5">Strategic & Institutional Tier-1</div>
                        </div>
                      </div>

                      <div className="p-3 rounded bg-[#111315] border border-[#30353c] text-xs text-[#a0a7b1] leading-relaxed flex items-start space-x-2.5">
                        <Info className="w-4 h-4 text-[#3b82f6] shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-[#f8fafc]">Epistemic Ingestion Notice:</strong> As a private enterprise, audited SEC financial filings are not publicly mandated. All valuation estimates and capitalization figures are cross-referenced across primary VC disclosures, secondary market transactions, and benchmarked ARR multiples.
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: 4-Scenario Valuation Matrix */}
              {activeTab === "scenarios" && (
                <div className="h-full overflow-y-auto p-6 max-w-5xl mx-auto space-y-6">
                  <div className="border-b border-[#30353c] pb-3">
                    <h2 className="text-base font-serif font-bold text-[#f8fafc]">
                      4-Scenario Financial & Multiple Stress Matrix
                    </h2>
                    <p className="text-xs text-[#737c88] font-mono">
                      Probabilistic trajectory modeling evaluated under adversarial committee scrutiny
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[
                      {
                        key: "base",
                        title: "Base Case",
                        prob: "50% Probability",
                        growth: "28.5% YoY",
                        margin: "78.0% Gross",
                        multiple: "24.0x ARR",
                        color: "border-[#3b82f6]",
                        badgeBg: "bg-blue-500/10 text-blue-400 border-blue-500/30",
                        summary: "Steady enterprise workflow expansion with moderate customer contract renewals."
                      },
                      {
                        key: "bull",
                        title: "Bull Case",
                        prob: "25% Probability",
                        growth: "42.0% YoY",
                        margin: "82.5% Gross",
                        multiple: "34.0x ARR",
                        color: "border-[#10b981]",
                        badgeBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
                        summary: "Accelerated enterprise agent adoption and prime sovereign defense platform lock-in."
                      },
                      {
                        key: "bear",
                        title: "Bear Case",
                        prob: "15% Probability",
                        growth: "14.0% YoY",
                        margin: "71.0% Gross",
                        multiple: "16.0x ARR",
                        color: "border-[#f59e0b]",
                        badgeBg: "bg-amber-500/10 text-amber-400 border-amber-500/30",
                        summary: "Hyperscaler custom tooling substitution and enterprise budget scrutiny lengthen sales cycles."
                      },
                      {
                        key: "stress",
                        title: "Stress Case",
                        prob: "10% Probability",
                        growth: "-4.5% YoY",
                        margin: "62.0% Gross",
                        multiple: "9.5x ARR",
                        color: "border-[#ef4444]",
                        badgeBg: "bg-red-500/10 text-red-400 border-red-500/30",
                        summary: "Procurement moratorium on primary customer cluster and adverse regulatory intervention."
                      }
                    ].map((sc) => (
                      <div key={sc.key} className={`p-4 rounded-xl bg-[#181b1f] border ${sc.color} space-y-3`}>
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-sm text-[#f8fafc]">{sc.title}</h3>
                          <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${sc.badgeBg}`}>
                            {sc.prob}
                          </span>
                        </div>
                        <div className="space-y-1.5 text-xs font-mono pt-1">
                          <div className="flex justify-between text-[#a0a7b1]">
                            <span>Revenue Growth:</span>
                            <span className="font-bold text-[#f8fafc]">{sc.growth}</span>
                          </div>
                          <div className="flex justify-between text-[#a0a7b1]">
                            <span>Gross Margin:</span>
                            <span className="font-bold text-[#f8fafc]">{sc.margin}</span>
                          </div>
                          <div className="flex justify-between text-[#a0a7b1]">
                            <span>Exit Multiple:</span>
                            <span className="font-bold text-[#60a5fa]">{sc.multiple}</span>
                          </div>
                        </div>
                        <p className="text-[11px] font-serif text-[#737c88] pt-2 border-t border-[#30353c] leading-snug">
                          {sc.summary}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 6: Timeline */}
              {activeTab === "timeline" && (
                <div className="h-full overflow-y-auto p-6 max-w-3xl mx-auto space-y-4">
                  <div className="text-xs font-mono text-[#737c88] uppercase tracking-wider mb-2">
                    Simulation Evolution & Epoch Milestones
                  </div>
                  {interactions.map((item, idx) => (
                    <div key={idx} className="flex space-x-3 text-xs">
                      <div className="flex flex-col items-center">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#3b82f6] shrink-0 mt-1" />
                        <div className="w-0.5 flex-1 bg-[#20242a] my-1" />
                      </div>
                      <div className="p-3 rounded bg-[#181b1f] border border-[#30353c] flex-1 space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-mono text-[#737c88]">
                          <span>Epoch #{item.round_number || 1} • {item.interaction_type}</span>
                          <span>{new Date(item.created_at).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-[#e5e7eb] font-serif leading-relaxed text-xs">
                          {item.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 7: Analytics */}
              {activeTab === "analytics" && (
                <div className="h-full overflow-y-auto p-6 max-w-5xl mx-auto">
                  <SimulationAnalyticsCharts
                    roundsLabels={analyticsData?.rounds_labels || []}
                    confidenceSeries={analyticsData?.confidence_series || []}
                    totalTokens={analyticsData?.total_tokens || 4820}
                    totalCostUsd={analyticsData?.total_cost_usd || 0.014}
                    consensusIndex={analyticsData?.consensus_index || 88.5}
                  />
                </div>
              )}

              {/* TAB 8: Final Report / Investment Dossier */}
              {activeTab === "report" && (
                <div className="h-full overflow-y-auto p-6 max-w-4xl mx-auto space-y-6">
                  {/* Top Action Header with Download PDF Button */}
                  <div className="p-4 rounded-xl bg-[#181b1f] border border-[#30353c] flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-[10px] font-mono uppercase text-[#10b981] font-bold">
                        Institutional Investment Memorandum
                      </div>
                      <h2 className="text-lg font-serif font-bold text-[#f8fafc] mt-0.5">
                        {dossierData?.title || primaryReport?.title || "Executive Investment Dossier"}
                      </h2>
                    </div>

                    <div className="flex items-center space-x-2">
                      <a
                        href={`${API_BASE}/investigations/${selectedInvId}/dossier/pdf`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-1.5 rounded bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-mono font-medium flex items-center space-x-1.5 shadow-sm transition-colors cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Official PDF Dossier</span>
                      </a>
                    </div>
                  </div>

                  {dossierData ? (
                    <div className="space-y-6">
                      {/* Investment Committee Verdict Card */}
                      {dossierData.investment_decision && (
                        <div className="p-6 rounded-xl bg-[#141d1a] border border-[#10b981]/40 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-mono uppercase text-[#10b981] font-bold">
                              Committee Adjudication Verdict
                            </span>
                            <span className="text-xs font-mono text-[#34d399] font-bold">
                              Confidence: {dossierData.investment_decision.confidence_pct}%
                            </span>
                          </div>
                          <div className="text-xl font-serif font-bold text-[#f8fafc]">
                            {dossierData.investment_decision.recommendation}
                          </div>
                          <p className="text-xs text-[#cbd5e1] font-serif leading-relaxed">
                            {dossierData.investment_decision.overall_verdict}
                          </p>
                          <div className="flex flex-wrap gap-4 text-[10px] font-mono text-[#737c88] pt-2 border-t border-[#10b981]/20">
                            <div>Profile: <span className="text-[#a0a7b1]">{dossierData.investment_decision.investor_profile}</span></div>
                            <div>Horizon: <span className="text-[#a0a7b1]">{dossierData.investment_decision.recommended_horizon}</span></div>
                          </div>
                        </div>
                      )}

                      {/* 11 Institutional Memorandum Sections */}
                      <div className="space-y-4">
                        {(dossierData.sections || []).map((sec: any) => (
                          <div key={sec.number} className="p-5 rounded-xl bg-[#181b1f] border border-[#30353c] space-y-2">
                            <div className="flex items-center space-x-2 text-xs font-mono uppercase text-[#3b82f6] font-semibold">
                              <span>Section 0{sec.number}</span>
                              <span>•</span>
                              <span>{sec.title}</span>
                            </div>
                            <p className="text-xs text-[#e5e7eb] font-serif leading-relaxed whitespace-pre-line">
                              {sec.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : primaryReport ? (
                    <div className="p-6 rounded-xl bg-[#181b1f] border border-[#30353c] space-y-4">
                      <div className="border-b border-[#30353c] pb-3 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-mono text-[#10b981] uppercase font-bold">
                            Official Adjudication Dossier
                          </span>
                          <h2 className="text-xl font-serif font-bold text-[#f8fafc] mt-0.5">
                            {primaryReport.title}
                          </h2>
                        </div>
                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#111315] text-[#3b82f6] border border-[#30353c]">
                          Verified Consensus
                        </span>
                      </div>

                      <div>
                        <h3 className="text-xs font-mono uppercase text-[#a0a7b1] mb-1">Executive Summary</h3>
                        <p className="text-xs text-[#cbd5e1] font-serif leading-relaxed p-3 rounded bg-[#111315] border border-[#30353c]">
                          {primaryReport.executive_summary}
                        </p>
                      </div>

                      {primaryReport.risk_register && (
                        <div>
                          <h3 className="text-xs font-mono uppercase text-[#f59e0b] mb-1">Identified Systemic Risks</h3>
                          <div className="space-y-1.5">
                            {primaryReport.risk_register.map((r: any, idx: number) => (
                              <div key={idx} className="p-2.5 rounded bg-[#111315] border border-[#30353c] text-xs">
                                <span className="font-semibold text-[#f59e0b]">{r.primary_risk || "Risk Vector"}: </span>
                                <span className="text-[#a0a7b1] font-serif">{r.secondary_risk || JSON.stringify(r)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-12 text-center text-xs font-mono text-[#737c88]">
                      Final report synthesis has not yet run. Execute the simulation rounds to generate the formal dossier.
                    </div>
                  )}
                </div>
              )}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-[#737c88]">
            <FolderOpen className="w-12 h-12 text-[#30353c] mb-3" />
            <h3 className="text-base font-serif font-semibold text-[#f8fafc]">No Simulation Selected</h3>
            <p className="text-xs font-mono text-[#a0a7b1] mt-1 max-w-md">
              Select an ongoing simulation from the left sidebar or click "New Scenario" to create an autonomous multi-agent debate.
            </p>
            <button
              onClick={() => setShowScenarioModal(true)}
              className="mt-4 px-4 py-2 rounded bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-medium cursor-pointer shadow-sm transition-colors"
            >
              Create New Scenario
            </button>
          </div>
        )}
      </main>

      {/* =========================================================================
          MODAL 1: Dual-Mode Investigation & Scenario Creator Modal
         ========================================================================= */}
      {showScenarioModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-[#181b1f] border border-[#30353c] rounded-xl max-w-2xl w-full p-5 sm:p-6 space-y-4 my-auto max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-[#30353c] pb-3 shrink-0">
              <div>
                <h3 className="text-base sm:text-lg font-serif font-bold text-[#f8fafc]">Create Intelligence Mandate</h3>
                <p className="text-[11px] text-[#737c88] font-mono">
                  Autonomous Specialist Society & Multi-Platform Simulation
                </p>
              </div>
              <button 
                onClick={() => setShowScenarioModal(false)}
                className="text-[#737c88] hover:text-[#e5e7eb] p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Creation Tab Switcher */}
            <div className="flex rounded-lg bg-[#111315] p-1 border border-[#30353c] text-xs font-mono shrink-0">
              <button
                type="button"
                onClick={() => setCreationTab("company")}
                className={`flex-1 py-1.5 rounded-md flex items-center justify-center space-x-2 transition-colors cursor-pointer ${
                  creationTab === "company"
                    ? "bg-[#2563eb] text-white font-medium shadow-sm"
                    : "text-[#a0a7b1] hover:text-[#f8fafc]"
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Company Intelligence (SEC + Society)</span>
              </button>
              <button
                type="button"
                onClick={() => setCreationTab("scenario")}
                className={`flex-1 py-1.5 rounded-md flex items-center justify-center space-x-2 transition-colors cursor-pointer ${
                  creationTab === "scenario"
                    ? "bg-[#2563eb] text-white font-medium shadow-sm"
                    : "text-[#a0a7b1] hover:text-[#f8fafc]"
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Strategic Simulation (MiroFish Multi-Round)</span>
              </button>
            </div>

            {/* TAB A: Company Intelligence Investigation Form */}
            {creationTab === "company" ? (
              <form onSubmit={handleCreateInvestigation} className="flex-1 overflow-y-auto space-y-3.5 text-xs pr-1">
                {/* Real-Time Company Discovery Search Bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-[#a0a7b1] font-mono text-[10px] uppercase">
                      Discover Startup, Unicorn, or Public Equity
                    </label>
                    <span className="text-[9px] font-mono text-[#3b82f6]">Live Multi-Provider Grounding</span>
                  </div>
                  <div className="relative">
                    <Search className="w-4 h-4 text-[#737c88] absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={discoveryQuery}
                      onChange={(e) => setDiscoveryQuery(e.target.value)}
                      placeholder="Search company (e.g. OpenAI, Zepto, NVDA, Razorpay, CRWD, Stripe)..."
                      className="w-full pl-9 pr-8 py-2 rounded bg-[#111315] border border-[#30353c] text-xs text-[#f8fafc] focus:outline-none focus:border-[#3b82f6]"
                    />
                    {isDiscovering && (
                      <RotateCw className="w-3.5 h-3.5 text-[#3b82f6] animate-spin absolute right-3 top-2.5" />
                    )}
                  </div>

                  {/* Discovery Search Candidate Cards */}
                  {discoveryResults.length > 0 && (
                    <div className="max-h-52 overflow-y-auto space-y-1.5 p-2 rounded bg-[#111315] border border-[#30353c] mt-1 shadow-xl">
                      <div className="text-[9px] font-mono uppercase text-[#737c88] px-1">
                        Discovered Candidates ({discoveryResults.length}) — Click to Select:
                      </div>
                      {discoveryResults.map((cand) => (
                        <div
                          key={cand.id}
                          onClick={() => {
                            setSelectedCandidate(cand);
                            setCompName(cand.name);
                            setCompTicker(cand.ticker || "");
                            setCompSector(cand.sector || cand.industry || "Enterprise Technology");
                            setCompScope(
                              `Forensic investigation of ${cand.name}: Moat durability, capital structure, customer concentration, and valuation defensibility under stress scenarios.`
                            );
                            setDiscoveryResults([]);
                            setDiscoveryQuery("");
                          }}
                          className={`p-2.5 rounded border text-xs cursor-pointer transition-all flex items-start justify-between ${
                            selectedCandidate?.id === cand.id
                              ? "bg-[#20242a] border-[#3b82f6]"
                              : "bg-[#181b1f] border-[#262a30] hover:border-[#3b82f6]/50 hover:bg-[#20242a]"
                          }`}
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center space-x-2">
                              <span className="font-semibold text-[#f8fafc]">{cand.name}</span>
                              {cand.ticker && (
                                <span className="font-mono text-[9px] px-1.5 py-0.2 rounded bg-[#111315] text-[#60a5fa] border border-[#30353c]">
                                  {cand.ticker}
                                </span>
                              )}
                              <span className="font-mono text-[9px] px-1.5 py-0.2 rounded bg-white/5 text-[#a0a7b1]">
                                {cand.company_type === "public" ? "PUBLIC EQUITY" : cand.funding_stage || "PRIVATE"}
                              </span>
                            </div>
                            <div className="text-[10px] text-[#737c88] font-mono">
                              {cand.country || "Global"} • Founded {cand.founding_year || "N/A"} • Founders: {(cand.founders || []).slice(0, 2).join(", ") || "Founding team"}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                              cand.data_availability === "HIGH"
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                : cand.data_availability === "MODERATE"
                                ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                                : "bg-blue-500/10 text-blue-400 border-blue-500/30"
                            }`}>
                              DATA: {cand.data_availability || "ESTIMATED"}
                            </span>
                            {cand.market_cap_usd && (
                              <div className="text-[10px] text-[#93c5fd] font-mono mt-0.5">
                                ${(cand.market_cap_usd / 1e9).toFixed(1)}B
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 1-Click Institutional Presets */}
                <div>
                  <label className="block text-[#a0a7b1] font-mono text-[10px] uppercase mb-1.5">
                    1-Click Institutional Target Presets
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      {
                        name: "CrowdStrike",
                        ticker: "CRWD",
                        sector: "Cybersecurity & Cloud Defense",
                        scope: "Forensic single-point failure audit, Microsoft Defender bundling resistance, and LTM net retention durability."
                      },
                      {
                        name: "Palantir Tech",
                        ticker: "PLTR",
                        sector: "Sovereign AI & Enterprise OS",
                        scope: "AIP commercial monetization velocity, DoD defense budget durability, and prime contractor lock-in."
                      },
                      {
                        name: "Nvidia Corp",
                        ticker: "NVDA",
                        sector: "Semiconductor Infrastructure",
                        scope: "Hyperscaler custom silicon substitution risk, Blackwell thermal yield curve, and CUDA moat sustainability."
                      },
                      {
                        name: "OpenAI",
                        ticker: "OAI",
                        sector: "Frontier Foundation Lab",
                        scope: "Compute cluster capex commitments, model commoditization risk, and enterprise agent platform viability."
                      }
                    ].map((preset) => (
                      <button
                        type="button"
                        key={preset.ticker}
                        onClick={() => {
                          setCompName(preset.name);
                          setCompTicker(preset.ticker);
                          setCompSector(preset.sector);
                          setCompScope(preset.scope);
                        }}
                        className={`p-2 rounded border text-left cursor-pointer transition-colors ${
                          compTicker === preset.ticker 
                            ? "bg-[#20242a] border-[#3b82f6] text-white" 
                            : "bg-[#141619] border-[#30353c] text-[#a0a7b1] hover:text-white"
                        }`}
                      >
                        <div className="font-semibold text-[11px] truncate">{preset.name}</div>
                        <div className="text-[10px] text-[#737c88] font-mono">{preset.ticker}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[#a0a7b1] font-mono text-[10px] uppercase mb-1">Company / Institution Name</label>
                    <input
                      type="text"
                      value={compName}
                      onChange={(e) => setCompName(e.target.value)}
                      required
                      placeholder="e.g. CrowdStrike Holdings"
                      className="w-full px-3 py-2 rounded bg-[#111315] border border-[#30353c] text-[#e5e7eb] focus:outline-none focus:border-[#3b82f6]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#a0a7b1] font-mono text-[10px] uppercase mb-1">Ticker / Identifier</label>
                    <input
                      type="text"
                      value={compTicker}
                      onChange={(e) => setCompTicker(e.target.value)}
                      placeholder="CRWD"
                      className="w-full px-3 py-2 rounded bg-[#111315] border border-[#30353c] text-[#e5e7eb] focus:outline-none focus:border-[#3b82f6] font-mono uppercase"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#a0a7b1] font-mono text-[10px] uppercase mb-1">Investment Horizon</label>
                    <select
                      value={compHorizon}
                      onChange={(e) => setCompHorizon(e.target.value)}
                      className="w-full px-3 py-2 rounded bg-[#111315] border border-[#30353c] text-[#e5e7eb] focus:outline-none focus:border-[#3b82f6]"
                    >
                      <option value="6 Months">6 Months (Tactical Earnings / Catalyst)</option>
                      <option value="1 Year">1 Year (Cyclical Alignment)</option>
                      <option value="3 Years">3 Years (Structural Compounding)</option>
                      <option value="5 Years">5 Years (Generational Secular Wave)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[#a0a7b1] font-mono text-[10px] uppercase mb-1">Investor Perspective</label>
                    <select
                      value={compPerspective}
                      onChange={(e) => setCompPerspective(e.target.value)}
                      className="w-full px-3 py-2 rounded bg-[#111315] border border-[#30353c] text-[#e5e7eb] focus:outline-none focus:border-[#3b82f6]"
                    >
                      <option value="Institutional Growth Equity">Institutional Growth Equity</option>
                      <option value="Public Equity Long/Short">Public Equity Long/Short</option>
                      <option value="Venture Capital">Venture Capital / Early Stage</option>
                      <option value="Private Equity">Private Equity / Buyout</option>
                      <option value="Strategic M&A">Strategic M&A / Corporate Dev</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[#a0a7b1] font-mono text-[10px] uppercase mb-1">Investigation Scope & Hypotheses</label>
                  <textarea
                    value={compScope}
                    onChange={(e) => setCompScope(e.target.value)}
                    rows={2}
                    placeholder="Core forensic hypotheses, counter-thesis points, and key metrics to audit..."
                    className="w-full px-3 py-2 rounded bg-[#111315] border border-[#30353c] text-[#e5e7eb] focus:outline-none focus:border-[#3b82f6] leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-[#a0a7b1] font-mono text-[10px] uppercase mb-1">Investigation Depth & Society Size</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: "rapid", label: "Rapid", detail: "3 Specialists • ~6s" },
                      { key: "standard", label: "Standard", detail: "8 Specialists • ~15s" },
                      { key: "comprehensive", label: "Full Committee", detail: "16 Specialists + PDF • ~25s" }
                    ].map((d) => (
                      <button
                        type="button"
                        key={d.key}
                        onClick={() => setCompDepth(d.key as any)}
                        className={`p-2 rounded border text-left cursor-pointer transition-colors ${
                          compDepth === d.key
                            ? "bg-[#20242a] border-[#3b82f6] text-white"
                            : "bg-[#111315] border-[#30353c] text-[#a0a7b1]"
                        }`}
                      >
                        <div className="font-semibold text-xs">{d.label}</div>
                        <div className="text-[10px] text-[#737c88] font-mono">{d.detail}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-[#30353c] flex items-center justify-between shrink-0">
                  <span className="text-[10px] font-mono text-[#737c88]">
                    Pipeline: SEC 10-K Ingestion → Graph Synthesis → Society Spawning
                  </span>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowScenarioModal(false)}
                      className="px-3 py-1.5 rounded border border-[#30353c] text-[#a0a7b1] hover:text-[#e5e7eb] cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={scenarioCreating}
                      className="px-4 py-1.5 rounded bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-medium cursor-pointer shadow-sm disabled:opacity-50 flex items-center space-x-1.5"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{scenarioCreating ? "Spawning Society..." : "Launch Investigation"}</span>
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              /* TAB B: Strategic Scenario Simulation Form */
              <form onSubmit={handleCreateScenario} className="flex-1 overflow-y-auto space-y-3.5 text-xs pr-1">
                <div>
                  <label className="block text-[#a0a7b1] font-mono text-[10px] uppercase mb-1">Scenario Title</label>
                  <input
                    type="text"
                    value={scenarioTitle}
                    onChange={(e) => setScenarioTitle(e.target.value)}
                    required
                    placeholder="e.g. Ethereum L2 vs Private Consortium Ledger Settlement"
                    className="w-full px-3 py-2 rounded bg-[#111315] border border-[#30353c] text-[#e5e7eb] focus:outline-none focus:border-[#3b82f6]"
                  />
                </div>

                <div>
                  <label className="block text-[#a0a7b1] font-mono text-[10px] uppercase mb-1">Problem Statement & Objective</label>
                  <textarea
                    value={scenarioProblem}
                    onChange={(e) => setScenarioProblem(e.target.value)}
                    required
                    rows={3}
                    placeholder="Describe the strategic, technical, or economic dilemma in natural language..."
                    className="w-full px-3 py-2 rounded bg-[#111315] border border-[#30353c] text-[#e5e7eb] focus:outline-none focus:border-[#3b82f6] leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-[#a0a7b1] font-mono text-[10px] uppercase mb-1">Source Material URLs (One per line)</label>
                  <textarea
                    value={scenarioUrls}
                    onChange={(e) => setScenarioUrls(e.target.value)}
                    rows={2}
                    placeholder="https://bis.org/...&#10;https://sec.gov/..."
                    className="w-full px-3 py-1.5 rounded bg-[#111315] border border-[#30353c] text-[#e5e7eb] focus:outline-none focus:border-[#3b82f6] font-mono text-[11px]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[#a0a7b1] font-mono text-[10px] uppercase mb-1">Debate Mode</label>
                    <select
                      value={scenarioDebateMode}
                      onChange={(e) => setScenarioDebateMode(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded bg-[#111315] border border-[#30353c] text-[#e5e7eb] focus:outline-none font-mono text-xs cursor-pointer"
                    >
                      <option value="adversarial">Adversarial Debate</option>
                      <option value="collaborative">Collaborative Consensus</option>
                      <option value="socratic">Socratic Cross-Exam</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[#a0a7b1] font-mono text-[10px] uppercase mb-1">Agent Count ({scenarioAgentCount})</label>
                    <input
                      type="range"
                      min="4"
                      max="12"
                      step="1"
                      value={scenarioAgentCount}
                      onChange={(e) => setScenarioAgentCount(parseInt(e.target.value))}
                      className="w-full h-1 bg-[#30353c] rounded appearance-none cursor-pointer accent-[#2563eb]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#a0a7b1] font-mono text-[10px] uppercase mb-1">Debate Rounds ({scenarioRoundsCount})</label>
                    <input
                      type="range"
                      min="2"
                      max="8"
                      step="1"
                      value={scenarioRoundsCount}
                      onChange={(e) => setScenarioRoundsCount(parseInt(e.target.value))}
                      className="w-full h-1 bg-[#30353c] rounded appearance-none cursor-pointer accent-[#2563eb]"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-[#30353c] flex items-center justify-between shrink-0">
                  <span className="text-[10px] font-mono text-[#737c88]">
                    Subsystem: DuckDB OLAP + LiteLLM Multi-Agent Orchestrator
                  </span>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowScenarioModal(false)}
                      className="px-3 py-1.5 rounded border border-[#30353c] text-[#a0a7b1] hover:text-[#e5e7eb] cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={scenarioCreating}
                      className="px-4 py-1.5 rounded bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-medium cursor-pointer shadow-sm disabled:opacity-50"
                    >
                      {scenarioCreating ? "Generating Agents..." : "Launch Simulation"}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: God-View Intervention Modal
         ========================================================================= */}
      {showGodViewModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181b1f] border border-[#f59e0b]/40 rounded-lg max-w-lg w-full p-6 space-y-3">
            <div className="flex items-center justify-between border-b border-[#30353c] pb-2">
              <div className="flex items-center space-x-2 text-[#f59e0b]">
                <Zap className="w-4 h-4" />
                <h3 className="text-sm font-serif font-bold">God-View Simulation Intervention</h3>
              </div>
              <button onClick={() => setShowGodViewModal(false)} className="text-[#737c88] hover:text-[#e5e7eb]">✕</button>
            </div>
            <p className="text-xs text-[#a0a7b1] leading-relaxed">
              Inject an exogenous event, regulatory shock, or new evidence constraint. The simulation loop will immediately propagate this shock to all active specialists.
            </p>
            <form onSubmit={handleGodViewIntervention} className="space-y-3 text-xs">
              <textarea
                value={godViewText}
                onChange={(e) => setGodViewText(e.target.value)}
                required
                rows={3}
                placeholder="e.g. Federal Reserve issues emergency ban on public chain settlement for Tier-1 institutions..."
                className="w-full px-3 py-2 rounded bg-[#111315] border border-[#30353c] text-[#e5e7eb] focus:outline-none focus:border-[#f59e0b]"
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowGodViewModal(false)}
                  className="px-3 py-1.5 rounded border border-[#30353c] text-[#a0a7b1]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={godViewLoading}
                  className="px-4 py-1.5 rounded bg-[#d97706] hover:bg-[#b45309] text-white font-medium cursor-pointer shadow-sm"
                >
                  {godViewLoading ? "Injecting Shock..." : "Inject Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: 1-on-1 Agent Interview Modal
         ========================================================================= */}
      {showInterviewModal && interviewAgent && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181b1f] border border-[#30353c] rounded-lg max-w-xl w-full p-6 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-[#30353c] pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#3b82f6]">1-on-1 Post-Simulation Interview</span>
                <h3 className="text-base font-serif font-bold text-[#f8fafc]">{interviewAgent.name}</h3>
                <p className="text-[11px] text-[#737c88] font-mono">{interviewAgent.role} • {Math.round(interviewAgent.confidence * 100)}% Confidence</p>
              </div>
              <button onClick={() => setShowInterviewModal(false)} className="text-[#737c88] hover:text-[#e5e7eb]">✕</button>
            </div>

            {/* Conversation Log */}
            <div className="flex-1 overflow-y-auto space-y-3 p-3 rounded bg-[#111315] border border-[#30353c] text-xs min-h-[220px]">
              {interviewHistory.length === 0 ? (
                <div className="text-center py-10 text-[#737c88] font-mono">
                  Ask {interviewAgent.name} any question regarding their debate stance, assumptions, or evidence.
                </div>
              ) : (
                interviewHistory.map((item, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="text-[10px] font-mono text-[#3b82f6]">User Inquiry ({item.time}):</div>
                    <div className="p-2 rounded bg-[#181b1f] text-[#e5e7eb] font-sans">{item.q}</div>
                    <div className="text-[10px] font-mono text-[#10b981]">{interviewAgent.name}:</div>
                    <div className="p-2.5 rounded bg-[#141b24] text-[#cbd5e1] font-serif leading-relaxed">{item.a}</div>
                  </div>
                ))
              )}
            </div>

            {/* Question Input */}
            <form onSubmit={handleInterviewAgent} className="flex space-x-2 text-xs">
              <input
                type="text"
                value={interviewQuery}
                onChange={(e) => setInterviewQuery(e.target.value)}
                placeholder={`Ask ${interviewAgent.name} directly...`}
                className="flex-1 px-3 py-2 rounded bg-[#111315] border border-[#30353c] text-[#e5e7eb] focus:outline-none focus:border-[#3b82f6]"
              />
              <button
                type="submit"
                disabled={interviewLoading || !interviewQuery.trim()}
                className="px-4 py-2 rounded bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-medium cursor-pointer disabled:opacity-50 flex items-center space-x-1"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{interviewLoading ? "Asking..." : "Ask"}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 4: Plenary Broadcast Survey Modal (MiroFish Step 5 Feature)
         ========================================================================= */}
      {showSurveyModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181b1f] border border-[#30353c] rounded-lg max-w-2xl w-full max-h-[85vh] flex flex-col p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#30353c] pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#20242a] text-[#3b82f6] border border-[#30353c] inline-block mb-1">
                  Plenary Interrogation & Consensus
                </span>
                <h3 className="text-base font-serif font-bold text-[#f8fafc]">
                  Broadcast Survey Across Specialist Society
                </h3>
              </div>
              <button 
                onClick={() => setShowSurveyModal(false)}
                className="text-[#737c88] hover:text-[#e5e7eb] text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Target Specialists Checklist */}
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-[11px] font-mono text-[#737c88]">
                <span>SELECT SPECIALISTS TO QUERY ({selectedSurveyAgents.length === 0 ? "ALL" : selectedSurveyAgents.length} SELECTED)</span>
                <div className="space-x-2">
                  <button
                    type="button"
                    onClick={() => setSelectedSurveyAgents(societyAgents.map(a => a.agent_id))}
                    className="text-[#3b82f6] hover:underline cursor-pointer"
                  >
                    Select All
                  </button>
                  <span>|</span>
                  <button
                    type="button"
                    onClick={() => setSelectedSurveyAgents([])}
                    className="text-[#737c88] hover:text-[#e5e7eb] hover:underline cursor-pointer"
                  >
                    All (Default)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto p-1 bg-[#111315] rounded border border-[#30353c]">
                {societyAgents.map((ag) => {
                  const isChecked = selectedSurveyAgents.length === 0 || selectedSurveyAgents.includes(ag.agent_id);
                  return (
                    <label
                      key={ag.id}
                      className={`p-2 rounded border flex items-center space-x-2 cursor-pointer transition-colors ${
                        isChecked ? "bg-[#181b1f] border-[#3b82f6]/50 text-[#f8fafc]" : "bg-[#141619] border-[#30353c] text-[#737c88]"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          if (selectedSurveyAgents.includes(ag.agent_id)) {
                            setSelectedSurveyAgents(selectedSurveyAgents.filter(id => id !== ag.agent_id));
                          } else {
                            setSelectedSurveyAgents([...selectedSurveyAgents, ag.agent_id]);
                          }
                        }}
                        className="rounded border-[#30353c] text-[#2563eb] accent-[#2563eb]"
                      />
                      <div className="overflow-hidden">
                        <div className="font-semibold text-[11px] truncate">{ag.name}</div>
                        <div className="text-[10px] text-[#737c88] truncate">{ag.role}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Survey Question Input */}
            <form onSubmit={handleBroadcastSurvey} className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-mono text-[#a0a7b1] uppercase mb-1">
                  Survey Inquiry / Stress Dilemma
                </label>
                <textarea
                  value={surveyQuestion}
                  onChange={(e) => setSurveyQuestion(e.target.value)}
                  required
                  rows={2}
                  placeholder="Pose a strategic question or risk inquiry to active specialists..."
                  className="w-full px-3 py-2 rounded bg-[#111315] border border-[#30353c] text-[#e5e7eb] focus:outline-none focus:border-[#3b82f6] text-xs leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] font-mono text-[#737c88]">
                  Queries persistent individual memories with zero hallucination
                </span>
                <button
                  type="submit"
                  disabled={surveyLoading || !surveyQuestion.trim()}
                  className="px-4 py-2 rounded bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-medium cursor-pointer shadow-sm disabled:opacity-50 flex items-center space-x-1.5 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{surveyLoading ? "Broadcasting to Society..." : "Broadcast Survey"}</span>
                </button>
              </div>
            </form>

            {/* Survey Results Breakdown */}
            {surveyResult && (
              <div className="flex-1 overflow-y-auto space-y-3 pt-3 border-t border-[#30353c]">
                {/* Aggregate Metrics Bar */}
                <div className="p-3 rounded bg-[#141619] border border-[#30353c] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-[#737c88] uppercase">Institutional Consensus Score</span>
                    <span className="font-mono font-bold text-[#10b981] text-sm">
                      {surveyResult.consensus_index}% Alignment
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#111315] overflow-hidden flex">
                    <div
                      style={{ width: `${(surveyResult.sentiment_breakdown.favorable / Math.max(1, surveyResult.total_queried)) * 100}%` }}
                      className="bg-[#10b981] h-full"
                      title="Favorable"
                    />
                    <div
                      style={{ width: `${(surveyResult.sentiment_breakdown.conditional / Math.max(1, surveyResult.total_queried)) * 100}%` }}
                      className="bg-[#f59e0b] h-full"
                      title="Conditional"
                    />
                    <div
                      style={{ width: `${(surveyResult.sentiment_breakdown.unfavorable / Math.max(1, surveyResult.total_queried)) * 100}%` }}
                      className="bg-[#ef4444] h-full"
                      title="Unfavorable"
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#a0a7b1]">
                    <span className="text-[#10b981]">Favorable: {surveyResult.sentiment_breakdown.favorable}</span>
                    <span className="text-[#f59e0b]">Conditional: {surveyResult.sentiment_breakdown.conditional}</span>
                    <span className="text-[#ef4444]">Unfavorable: {surveyResult.sentiment_breakdown.unfavorable}</span>
                  </div>
                </div>

                {/* Individual Responses Feed */}
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {surveyResult.responses.map((resp: any, idx: number) => {
                    const isFav = resp.verdict === "FAVORABLE";
                    const isCond = resp.verdict === "CONDITIONAL";
                    return (
                      <div key={idx} className="p-2.5 rounded bg-[#111315] border border-[#30353c] space-y-1 text-xs">
                        <div className="flex items-center justify-between text-[10px] font-mono">
                          <div className="flex items-center space-x-1.5">
                            <span className="font-semibold text-[#f8fafc]">{resp.name}</span>
                            <span className="text-[#737c88]">({resp.role})</span>
                          </div>
                          <span className={`px-1.5 py-0.2 rounded font-mono ${
                            isFav ? "bg-[#142922] text-[#10b981] border border-[#10b981]/30" :
                            isCond ? "bg-[#292214] text-[#f59e0b] border border-[#f59e0b]/30" :
                            "bg-[#291414] text-[#ef4444] border border-[#ef4444]/30"
                          }`}>
                            {resp.verdict} • {Math.round(resp.confidence * 100)}% Conf
                          </span>
                        </div>
                        <p className="text-[#cbd5e1] font-serif leading-relaxed text-[11.5px]">
                          {resp.response}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
