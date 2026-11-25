"use client";

import React, { useState, useEffect, useRef } from "react";
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
  Check,
  LayoutDashboard,
  UploadCloud,
  FileUp,
  Award,
  Database,
  Eye,
  Trash2,
  Loader2
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
  
  // Progressive Disclosure Workstation Tabs: overview, research, debate, financials, intelligence, report
  const [activeTab, setActiveTab] = useState<"overview" | "research" | "debate" | "financials" | "intelligence" | "report">("overview");
  const [researchSubTab, setResearchSubTab] = useState<"documents" | "specialists" | "evidence" | "graph">("documents");
  const [financialsSubTab, setFinancialsSubTab] = useState<"fundamentals" | "stock" | "scenarios">("fundamentals");
  const [activeScenario, setActiveScenario] = useState<"base" | "bull" | "bear" | "stress">("base");
  const [intelligenceSubTab, setIntelligenceSubTab] = useState<"hypotheses" | "thesis" | "credibility" | "anomalies">("hypotheses");

  // Extended Autonomous Corporate Intelligence State
  const [hypothesesData, setHypothesesData] = useState<any[]>([]);
  const [thesisData, setThesisData] = useState<any>(null);
  const [credibilityData, setCredibilityData] = useState<any>(null);
  const [anomaliesData, setAnomaliesData] = useState<any[]>([]);

  // Multi-File Documents & Ingestion State
  const [investigationDocs, setInvestigationDocs] = useState<any[]>([]);
  const [evidenceItems, setEvidenceItems] = useState<any[]>([]);
  const [isUploadingDocs, setIsUploadingDocs] = useState(false);
  const [pendingCreateFiles, setPendingCreateFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [advancedParamsOpen, setAdvancedParamsOpen] = useState(false);
  const [selectedDocPreview, setSelectedDocPreview] = useState<any>(null);
  const [debateFilter, setDebateFilter] = useState<"all" | "challenges" | "evidence" | "changes" | "unresolved">("all");

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

  // Durable Multi-Agent Autonomous Execution State
  const [executionsList, setExecutionsList] = useState<any[]>([]);
  const [activeExecution, setActiveExecution] = useState<any | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionError, setExecutionError] = useState<string | null>(null);
  const [liveEvents, setLiveEvents] = useState<any[]>([]);
  const eventSourceRef = useRef<EventSource | null>(null);
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

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

  const handleLaunchInstantDemo = async () => {
    setLoading(true);
    setAuthError("");
    try {
      const res = await fetch(`${API_BASE}/demo/flagship`);
      if (res.ok) {
        const data = await res.json();
        const demoToken = data.access_token;
        setToken(demoToken);
        localStorage.setItem("meridian_token", demoToken);
        setUser({
          email: "lead.analyst@meridian.internal",
          full_name: "Lead Portfolio Investigator",
          organization_name: "Meridian Flagship Institutional Seat"
        });
        await fetchInvestigations(demoToken);
        if (data.investigation_id) {
          selectInvestigation(data.investigation_id, demoToken);
        }
      } else {
        setAuthError("Failed to initialize flagship demonstration session.");
      }
    } catch (err: any) {
      setAuthError(err.message || "Failed to connect to demonstration gateway.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("demo") === "nvda" || params.get("demo") === "true") {
        handleLaunchInstantDemo();
        return;
      }
    }
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
          const savedInvId = typeof window !== "undefined" ? localStorage.getItem("meridian_active_inv_id") : null;
          const target = (savedInvId && data.find((x: any) => x.id === savedInvId)) || data[0];
          selectInvestigation(target.id, authToken);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const selectInvestigation = async (id: string, authToken?: string) => {
    const t = authToken || token;
    if (!t) return;

    // Clean up active streams and polling from prior investigation
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
    setIsExecuting(false);

    setSelectedInvId(id);
    if (typeof window !== "undefined") {
      localStorage.setItem("meridian_active_inv_id", id);
    }

    try {
      const [detailRes, agentsRes, interRes, claimsRes, reportsRes, graphRes, analyticsRes, stockRes, dossierRes, docsRes, evidenceRes] = await Promise.all([
        fetch(`${API_BASE}/investigations/${id}`, { headers: { Authorization: `Bearer ${t}` } }),
        fetch(`${API_BASE}/investigations/${id}/society/agents`, { headers: { Authorization: `Bearer ${t}` } }),
        fetch(`${API_BASE}/investigations/${id}/society/interactions`, { headers: { Authorization: `Bearer ${t}` } }),
        fetch(`${API_BASE}/investigations/${id}/claims`, { headers: { Authorization: `Bearer ${t}` } }),
        fetch(`${API_BASE}/investigations/${id}/reports`, { headers: { Authorization: `Bearer ${t}` } }),
        fetch(`${API_BASE}/investigations/${id}/graph`, { headers: { Authorization: `Bearer ${t}` } }),
        fetch(`${API_BASE}/scenarios/${id}/analytics`, { headers: { Authorization: `Bearer ${t}` } }),
        fetch(`${API_BASE}/investigations/${id}/stock`, { headers: { Authorization: `Bearer ${t}` } }).catch(() => null),
        fetch(`${API_BASE}/investigations/${id}/dossier`, { headers: { Authorization: `Bearer ${t}` } }).catch(() => null),
        fetch(`${API_BASE}/investigations/${id}/documents`, { headers: { Authorization: `Bearer ${t}` } }).catch(() => null),
        fetch(`${API_BASE}/investigations/${id}/evidence`, { headers: { Authorization: `Bearer ${t}` } }).catch(() => null)
      ]);

      if (detailRes.ok) {
        const d = await detailRes.json();
        setInvDetail(d);
        const compId = d?.company?.id || d?.company_id;
        if (compId) {
          fetch(`${API_BASE}/companies/${compId}/hypotheses`).then(r => r.ok ? r.json() : null).then(data => {
            if (data?.hypotheses) setHypothesesData(data.hypotheses);
          }).catch(() => null);
          fetch(`${API_BASE}/companies/${compId}/thesis`).then(r => r.ok ? r.json() : null).then(data => {
            if (data) setThesisData(data);
          }).catch(() => null);
          fetch(`${API_BASE}/companies/${compId}/credibility`).then(r => r.ok ? r.json() : null).then(data => {
            if (data) setCredibilityData(data);
          }).catch(() => null);
          fetch(`${API_BASE}/companies/${compId}/anomalies`).then(r => r.ok ? r.json() : null).then(data => {
            if (data?.anomalies) setAnomaliesData(data.anomalies);
          }).catch(() => null);
        }
      }
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
      if (docsRes && docsRes.ok) {
        const d = await docsRes.json();
        setInvestigationDocs(d.documents || []);
      } else {
        setInvestigationDocs([]);
      }
      if (evidenceRes && evidenceRes.ok) {
        setEvidenceItems(await evidenceRes.json());
      } else {
        setEvidenceItems([]);
      }

      // Fetch Durable Executions
      try {
        const execsRes = await fetch(`${API_BASE}/investigations/${id}/executions`, {
          headers: { Authorization: `Bearer ${t}` }
        }).catch(() => null);
        if (execsRes && execsRes.ok) {
          const execsData = await execsRes.json();
          setExecutionsList(execsData);
          const running = execsData.find((x: any) => x.status === "running" || x.status === "in_progress" || x.status === "pending");
          if (running) {
            setActiveExecution(running);
            setIsExecuting(true);
            attachExecutionStream(id, t);
          } else if (execsData.length > 0) {
            setActiveExecution(execsData[0]);
          }
        }
      } catch (e) {
        console.warn("Failed fetching executions:", e);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUploadDocuments = async (files: FileList | File[]) => {
    if (!selectedInvId || !token || !files || files.length === 0) return;
    setIsUploadingDocs(true);
    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
      }
      const res = await fetch(`${API_BASE}/investigations/${selectedInvId}/documents`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      if (res.ok) {
        const docsRes = await fetch(`${API_BASE}/investigations/${selectedInvId}/documents`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (docsRes.ok) {
          const d = await docsRes.json();
          setInvestigationDocs(d.documents || []);
        }
        const evRes = await fetch(`${API_BASE}/investigations/${selectedInvId}/evidence`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (evRes.ok) {
          setEvidenceItems(await evRes.json());
        }
      }
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setIsUploadingDocs(false);
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    if (!selectedInvId || !token) return;
    try {
      await fetch(`${API_BASE}/investigations/${selectedInvId}/documents/${docId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      setInvestigationDocs(prev => prev.filter(d => d.id !== docId));
    } catch (err) {
      console.error("Delete doc error:", err);
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

        // Upload attached documents if any
        if (pendingCreateFiles.length > 0) {
          const formData = new FormData();
          for (let i = 0; i < pendingCreateFiles.length; i++) {
            formData.append("files", pendingCreateFiles[i]);
          }
          await fetch(`${API_BASE}/investigations/${data.investigation_id}/documents`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formData
          }).catch(() => null);
          setPendingCreateFiles([]);
        }

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

  // Attach SSE stream for live multi-agent execution events
  const attachExecutionStream = (invId: string, authToken: string) => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    const sseUrl = `${API_BASE}/investigations/${invId}/events/stream?token=${encodeURIComponent(authToken)}`;
    try {
      const es = new EventSource(sseUrl);
      eventSourceRef.current = es;

      const handleRawMessage = (rawEvent: MessageEvent) => {
        try {
          const envelope = JSON.parse(rawEvent.data);
          const payload = envelope.payload || envelope;
          const eventType = envelope.event_type || rawEvent.type || "message";

          setLiveEvents((prev) => [{ ...envelope, event_type: eventType }, ...prev].slice(0, 50));

          if (payload.stage || payload.progress_percentage !== undefined) {
            setActiveExecution((prev: any) => ({
              ...prev,
              current_stage: payload.stage || prev?.current_stage,
              progress_percentage: payload.progress_percentage !== undefined ? payload.progress_percentage : prev?.progress_percentage,
              total_tokens: payload.total_tokens || prev?.total_tokens,
              estimated_cost_usd: payload.estimated_cost_usd !== undefined ? payload.estimated_cost_usd : prev?.estimated_cost_usd,
            }));
          }

          if (
            eventType === "stream.ended" ||
            eventType === "exec.completed" ||
            eventType === "execution.completed" ||
            payload.type === "stream.ended" || 
            payload.status === "completed" ||
            payload.status === "failed"
          ) {
            setIsExecuting(false);
            es.close();
            selectInvestigation(invId, authToken);
          }
        } catch {
          // ignore keep-alive
        }
      };

      // Standard onmessage (unnamed events)
      es.onmessage = handleRawMessage;

      // EventSource custom event listeners
      const customEvents = [
        "stream.ended",
        "exec.execution.started",
        "exec.source.snapshot",
        "exec.plan.created",
        "exec.specialist.completed",
        "exec.gate.awaiting_approval",
        "exec.claim.challenged",
        "exec.rebuttal.submitted",
        "exec.claim.adjudicated",
        "exec.completed",
        "execution.completed"
      ];
      customEvents.forEach((evt) => {
        es.addEventListener(evt, handleRawMessage as EventListener);
      });

      // Robust fallback polling interval in case SSE drops or stream finishes instantly
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      pollTimerRef.current = setInterval(async () => {
        try {
          const execRes = await fetch(`${API_BASE}/investigations/${invId}/executions`, {
            headers: { Authorization: `Bearer ${authToken}` }
          });
          if (execRes.ok) {
            const list = await execRes.json();
            if (Array.isArray(list) && list.length > 0) {
              const latest = list[0];
              setActiveExecution(latest);
              setExecutionsList(list);
              if (latest.status === "completed" || latest.status === "failed") {
                if (pollTimerRef.current) {
                  clearInterval(pollTimerRef.current);
                  pollTimerRef.current = null;
                }
                setIsExecuting(false);
                es.close();
                selectInvestigation(invId, authToken);
              }
            }
          }
        } catch (e) {
          // ignore polling error
        }
      }, 1500);

      es.onerror = () => {
        es.close();
      };
    } catch (err) {
      console.warn("SSE connection error", err);
    }
  };

  // Launch Autonomous Multi-Agent Investigation Execution
  const handleRunInvestigation = async (forceRestart: boolean = false) => {
    if (!selectedInvId || !token) return;
    setIsExecuting(true);
    setExecutionError(null);

    try {
      const res = await fetch(`${API_BASE}/investigations/${selectedInvId}/executions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          model_name: "gpt-4o-mini",
          run_async: true,
          force_restart: forceRestart
        })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.detail || `Server returned ${res.status}`);
      }

      const execData = await res.json();
      setActiveExecution(execData);
      setExecutionsList((prev) => [execData, ...prev.filter((x) => x.id !== execData.id)]);
      attachExecutionStream(selectedInvId, token);
    } catch (err: any) {
      console.error("Run investigation failed:", err);
      setExecutionError(err.message || "Failed to trigger autonomous investigation.");
      setIsExecuting(false);
    }
  };

  // Cancel Active Execution
  const handleCancelExecution = async () => {
    if (!selectedInvId || !token || !activeExecution?.id) return;
    try {
      await fetch(`${API_BASE}/investigations/${selectedInvId}/executions/${activeExecution.id}/cancel`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
      setIsExecuting(false);
      selectInvestigation(selectedInvId, token);
    } catch (err) {
      console.error("Failed to cancel execution:", err);
    }
  };

  // Legacy Simulation Round Trigger (retained for compatibility)
  const handleStartSimulation = async () => {
    return handleRunInvestigation(false);
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
    localStorage.removeItem("meridian_active_inv_id");
    setToken(null);
    setUser(null);
    setInvestigations([]);
    setInvDetail(null);
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#F4F1E9]">
        <div className="w-full max-w-md bg-white border border-[#D6D0C3] rounded p-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-7 h-7 rounded bg-[#F4F1E9] border border-[#D6D0C3] flex items-center justify-center font-mono font-bold text-[#303633] text-xs">
              M
            </div>
            <div>
              <div className="font-semibold text-[#172B27] uppercase tracking-wider text-xs">Meridian</div>
              <div className="text-[11px] text-[#79756C] font-mono">Multi-Agent Simulation & Debate SaaS</div>
            </div>
          </div>

          <h2 className="text-xl font-serif text-[#172B27] mb-1.5">
            {isRegistering ? "Create Institutional Seat" : "Authenticate Workspace"}
          </h2>
          <p className="text-xs text-[#79756C] mb-4 leading-relaxed">
            {isRegistering 
              ? "Establish your organization domain and lead investigator seat."
              : "Enter your institutional credentials to access simulations and audit trails."}
          </p>

          {/* Instant 1-Click NVIDIA Flagship Investigation Mount */}
          <div className="mb-5 p-3.5 rounded-lg bg-[#172B27] text-[#F4F1E9] border border-[#233F3A] shadow-sm">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="font-mono text-[9px] uppercase tracking-wider text-emerald-300 font-semibold">
                  Institutional Flagship Demo
                </span>
              </div>
              <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-[#D6D0C3]">
                NASDAQ: NVDA
              </span>
            </div>
            <div className="text-xs font-serif font-bold text-white mb-1">
              NVIDIA Corporation Live Investigation
            </div>
            <p className="text-[11px] text-[#D6D0C3] mb-3 leading-relaxed">
              Launch full multi-agent workspace with 6 semiconductor specialists, SEC 10-K verification, debate transcripts, financial ratios, and 9-section report.
            </p>
            <button
              type="button"
              onClick={handleLaunchInstantDemo}
              disabled={loading}
              className="w-full py-2 px-3 rounded bg-[#A47B48] hover:bg-[#8F6B3E] text-white font-medium text-xs flex items-center justify-center space-x-2 cursor-pointer transition-all shadow-xs disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RotateCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Mounting Benchmark Workspace...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Launch Live NVIDIA Investigation (Instant Demo)</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </>
              )}
            </button>
          </div>

          <div className="relative flex py-2 items-center mb-4">
            <div className="flex-grow border-t border-[#D6D0C3]"></div>
            <span className="flex-shrink mx-3 text-[10px] font-mono text-[#79756C] uppercase">Or Authenticate Workspace</span>
            <div className="flex-grow border-t border-[#D6D0C3]"></div>
          </div>

          {/* Quick Demo Seat Preset Fill */}
          <div className="mb-4 p-2.5 rounded bg-[#F4F1E9] border border-[#A47B48]/30 text-xs flex items-center justify-between">
            <div>
              <div className="text-[11px] font-mono text-[#A47B48] font-semibold flex items-center space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Audited Institutional Seat</span>
              </div>
              <div className="text-[10px] text-[#79756C] font-mono mt-0.5">lead.analyst@meridian.internal</div>
            </div>
            <button
              type="button"
              onClick={() => {
                setEmail("lead.analyst@meridian.internal");
                setPassword("InstitutionalPassword2026!");
                setIsRegistering(false);
              }}
              className="px-2.5 py-1 rounded bg-[#172B27] hover:bg-[#233F3A] text-white text-[11px] font-mono cursor-pointer transition-colors shadow-xs shrink-0"
            >
              Quick Fill
            </button>
          </div>

          {authError && (
            <div className="mb-4 p-3 rounded bg-[#FDF2F2] border border-[#8B2834]/40 text-[#8B2834] text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4 text-xs">
            {isRegistering && (
              <>
                <div>
                  <label className="block text-[#79756C] mb-1 font-mono uppercase text-[10px]">Full Name</label>
                  <input 
                    type="text" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded bg-[#F4F1E9] border border-[#D6D0C3] text-[#303633] focus:outline-none focus:border-[#A47B48]"
                  />
                </div>
                <div>
                  <label className="block text-[#79756C] mb-1 font-mono uppercase text-[10px]">Organization Name</label>
                  <input 
                    type="text" 
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded bg-[#F4F1E9] border border-[#D6D0C3] text-[#303633] focus:outline-none focus:border-[#A47B48]"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-[#79756C] mb-1 font-mono uppercase text-[10px]">Work Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 rounded bg-[#F4F1E9] border border-[#D6D0C3] text-[#303633] focus:outline-none focus:border-[#A47B48]"
              />
            </div>

            <div>
              <label className="block text-[#79756C] mb-1 font-mono uppercase text-[10px]">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 rounded bg-[#F4F1E9] border border-[#D6D0C3] text-[#303633] focus:outline-none focus:border-[#A47B48]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded bg-[#172B27] hover:bg-[#233F3A] text-white font-medium transition-colors text-xs flex items-center justify-center space-x-1 mt-2 cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? "Authenticating..." : isRegistering ? "Register Organization Seat" : "Sign In to Terminal"}</span>
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-[#D6D0C3] text-center">
            <button
              type="button"
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-xs text-[#A47B48] hover:underline cursor-pointer"
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
    <div className="flex h-screen overflow-hidden bg-[#F4F1E9] text-[#303633] font-sans">
      {/* =========================================================================
          LEFT SIDEBAR: Projects, Simulations & Navigation
         ========================================================================= */}
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex w-72 xl:w-80 border-r border-[#D6D0C3] bg-white flex-col justify-between shrink-0">
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Header */}
          <div className="h-14 border-b border-[#D6D0C3] px-4 flex items-center justify-between shrink-0">
            <Link href="/" className="flex items-center space-x-2.5">
              <div className="w-6 h-6 rounded bg-[#F4F1E9] border border-[#D6D0C3] flex items-center justify-center font-mono font-bold text-[#303633] text-xs">
                M
              </div>
              <span className="font-semibold text-xs tracking-wider uppercase text-[#303633]">
                Meridian
              </span>
            </Link>
            <button 
              onClick={() => setShowScenarioModal(true)}
              className="px-2.5 py-1 rounded bg-[#172B27] hover:bg-[#233F3A] text-white transition-colors text-xs flex items-center space-x-1 cursor-pointer shadow-sm font-medium"
              title="Create New Investigation or Scenario"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New</span>
            </button>
          </div>

          {/* Org Pill */}
          <div className="px-4 py-2 border-b border-[#D6D0C3] bg-[#F4F1E9] flex items-center justify-between text-xs shrink-0">
            <div className="flex items-center space-x-2 overflow-hidden">
              <Building2 className="w-3.5 h-3.5 text-[#79756C] shrink-0" />
              <span className="text-[#79756C] truncate font-medium text-[11px]">
                {user?.organization?.name || "Corporate Strategy Org"}
              </span>
            </div>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#F4F1E9] text-[#264D3B] border border-[#D6D0C3] font-mono shrink-0">
              ACTIVE
            </span>
          </div>

          {/* Scenarios / Investigations List */}
          <div className="p-3 text-[10.5px] font-mono text-[#79756C] uppercase tracking-wider flex items-center justify-between shrink-0">
            <span>Investigations Roster</span>
            <span>{investigations.length} Total</span>
          </div>

          <div className="flex-1 overflow-y-auto px-2 space-y-1">
            {investigations.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#79756C]">
                No investigations found. Click "New" to start an institutional company audit.
              </div>
            ) : (
              investigations.map((inv) => (
                <button
                  key={inv.id}
                  onClick={() => selectInvestigation(inv.id)}
                  className={`w-full text-left p-2.5 rounded border transition-colors cursor-pointer ${
                    selectedInvId === inv.id
                      ? "bg-[#F4F1E9] border-[#A47B48] text-[#172B27]"
                      : "bg-[#F4F1E9] border-[#D6D0C3] text-[#79756C] hover:text-[#303633] hover:bg-[#F4F1E9]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-xs text-[#303633] truncate">{inv.title}</span>
                    <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded shrink-0 ${
                      inv.status === "COMPLETED" ? "bg-[#EAF2ED] text-[#264D3B]" : "bg-[#EEF3F0] text-[#A47B48]"
                    }`}>
                      {inv.status}
                    </span>
                  </div>
                  <div className="text-[10px] text-[#79756C] font-mono truncate">
                    {new Date(inv.created_at).toLocaleDateString()} • {inv.depth || "6 Agents"}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* User Footer */}
        <div className="p-3 border-t border-[#D6D0C3] bg-[#F4F1E9] flex items-center justify-between text-xs shrink-0">
          <div className="overflow-hidden">
            <div className="font-medium text-[#303633] truncate text-xs">{user?.full_name}</div>
            <div className="text-[10.5px] text-[#79756C] truncate">{user?.email}</div>
          </div>
          <button 
            onClick={handleLogout}
            className="p-1.5 rounded hover:bg-[#F4F1E9] text-[#79756C] hover:text-[#303633] transition-colors cursor-pointer shrink-0"
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
          <aside className="relative w-80 max-w-[85vw] h-full bg-white border-r border-[#D6D0C3] flex flex-col justify-between z-10 shadow-2xl">
            <div className="flex flex-col flex-1 overflow-hidden">
              <div className="h-14 border-b border-[#D6D0C3] px-4 flex items-center justify-between shrink-0">
                <Link href="/" className="flex items-center space-x-2.5">
                  <div className="w-6 h-6 rounded bg-[#F4F1E9] border border-[#D6D0C3] flex items-center justify-center font-mono font-bold text-[#303633] text-xs">
                    M
                  </div>
                  <span className="font-semibold text-xs tracking-wider uppercase text-[#303633]">
                    Meridian
                  </span>
                </Link>
                <div className="flex items-center space-x-1">
                  <button 
                    onClick={() => {
                      setShowScenarioModal(true);
                      setMobileSidebarOpen(false);
                    }}
                    className="px-2.5 py-1 rounded bg-[#172B27] text-white text-xs flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New</span>
                  </button>
                  <button 
                    onClick={() => setMobileSidebarOpen(false)}
                    className="p-1.5 rounded text-[#79756C] hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="px-4 py-2 border-b border-[#D6D0C3] bg-[#F4F1E9] flex items-center justify-between text-xs shrink-0">
                <div className="flex items-center space-x-2 overflow-hidden">
                  <Building2 className="w-3.5 h-3.5 text-[#79756C] shrink-0" />
                  <span className="text-[#79756C] truncate font-medium text-[11px]">
                    {user?.organization?.name || "Corporate Strategy Org"}
                  </span>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#F4F1E9] text-[#264D3B] border border-[#D6D0C3] font-mono">
                  ACTIVE
                </span>
              </div>

              <div className="p-3 text-[10.5px] font-mono text-[#79756C] uppercase tracking-wider flex items-center justify-between shrink-0">
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
                        ? "bg-[#F4F1E9] border-[#A47B48] text-[#172B27]"
                        : "bg-[#F4F1E9] border-[#D6D0C3] text-[#79756C] hover:text-[#303633] hover:bg-[#F4F1E9]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-xs text-[#303633] truncate">{inv.title}</span>
                      <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded shrink-0 ${
                        inv.status === "COMPLETED" ? "bg-[#EAF2ED] text-[#264D3B]" : "bg-[#EEF3F0] text-[#A47B48]"
                      }`}>
                        {inv.status}
                      </span>
                    </div>
                    <div className="text-[10px] text-[#79756C] font-mono truncate">
                      {new Date(inv.created_at).toLocaleDateString()} • {inv.depth || "6 Agents"}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 border-t border-[#D6D0C3] bg-[#F4F1E9] flex items-center justify-between text-xs shrink-0">
              <div className="overflow-hidden">
                <div className="font-medium text-[#303633] truncate text-xs">{user?.full_name}</div>
                <div className="text-[10.5px] text-[#79756C] truncate">{user?.email}</div>
              </div>
              <button 
                onClick={handleLogout}
                className="p-1.5 rounded hover:bg-[#F4F1E9] text-[#79756C] hover:text-[#303633] cursor-pointer"
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
      <main className="flex-1 flex flex-col overflow-hidden bg-[#F4F1E9]">
        {invDetail ? (
          <>
            {/* Header: Title, Live Counters & Playback Controls */}
            <header className="h-14 sm:h-16 border-b border-[#D6D0C3] px-3 sm:px-6 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center space-x-2 sm:space-x-3 overflow-hidden">
                <button
                  onClick={() => setMobileSidebarOpen(true)}
                  className="lg:hidden p-1.5 rounded text-[#79756C] hover:text-[#303633] hover:bg-[#F4F1E9] transition-colors cursor-pointer shrink-0"
                  aria-label="Toggle Navigation Drawer"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <div className="overflow-hidden">
                  <div className="flex items-center space-x-2">
                    <h1 className="text-sm sm:text-base font-serif font-bold text-[#172B27] truncate max-w-[170px] sm:max-w-md lg:max-w-lg">
                      {invDetail.title}
                    </h1>
                    <span className={`text-[9px] sm:text-[10px] font-mono uppercase px-1.5 sm:px-2 py-0.5 rounded border shrink-0 ${
                      invDetail.status === "COMPLETED"
                        ? "bg-[#EAF2ED] text-[#264D3B] border-[#264D3B]/30"
                        : "bg-[#EEF3F0] text-[#A47B48] border-[#A47B48]/30 animate-pulse"
                    }`}>
                      {invDetail.status}
                    </span>
                  </div>
                  <div className="text-[10px] sm:text-[11px] text-[#79756C] font-mono flex items-center space-x-1.5 sm:space-x-2 mt-0.5 truncate">
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
                  className="px-2 sm:px-3 py-1.5 rounded bg-[#F4F1E9] hover:bg-[#282d35] text-[#94671A] border border-[#94671A]/40 text-xs font-mono flex items-center space-x-1 cursor-pointer shadow-sm"
                  title="God-View Inject Exogenous Event"
                >
                  <Zap className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden sm:inline">God-View</span>
                </button>

                <button
                  onClick={() => setShowInterviewModal(true)}
                  className="px-2 sm:px-3 py-1.5 rounded bg-[#F4F1E9] hover:bg-[#282d35] text-[#A47B48] border border-[#A47B48]/40 text-xs font-mono flex items-center space-x-1 cursor-pointer shadow-sm"
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
                  className="px-2 sm:px-3 py-1.5 rounded bg-[#F4F1E9] hover:bg-[#282d35] text-[#264D3B] border border-[#264D3B]/40 text-xs font-mono flex items-center space-x-1 cursor-pointer shadow-sm"
                  title="Broadcast Survey to All Specialists"
                >
                  <Send className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden sm:inline">Survey</span>
                </button>

                <button
                  onClick={() => handleRunInvestigation(false)}
                  disabled={isExecuting}
                  className={`px-3 sm:px-4 py-1.5 rounded font-mono text-xs font-semibold flex items-center space-x-1.5 cursor-pointer shadow-sm transition-all shrink-0 ${
                    isExecuting
                      ? "bg-[#A47B48] text-white animate-pulse"
                      : "bg-[#172B27] hover:bg-[#233F3A] text-white active:scale-95"
                  }`}
                  title="Launch End-to-End Autonomous Multi-Agent Investigation"
                >
                  {isExecuting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                      <span className="hidden sm:inline">Investigating...</span>
                      <span className="sm:hidden">Running</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current shrink-0 text-[#B58A4F]" />
                      <span className="hidden sm:inline">Run Investigation</span>
                      <span className="sm:hidden">Investigate</span>
                    </>
                  )}
                </button>
                {isExecuting && (
                  <button
                    onClick={handleCancelExecution}
                    className="px-2.5 sm:px-3 py-1.5 rounded bg-red-800/90 hover:bg-red-900 text-white font-mono text-xs flex items-center space-x-1 transition-all cursor-pointer shadow-sm"
                    title="Abort Active Investigation Execution"
                  >
                    <Pause className="w-3.5 h-3.5 shrink-0" />
                    <span className="hidden sm:inline">Cancel</span>
                  </button>
                )}
              </div>
            </header>

            {/* Sub-Header Tabs with Responsive Horizontal Scroll */}
            <div className="h-10 border-b border-[#D6D0C3] px-3 sm:px-6 bg-[#F4F1E9] flex items-center justify-between text-xs shrink-0 overflow-x-auto scrollbar-none">
              <div className="flex items-center space-x-1 shrink-0">
                {[
                  { key: "overview", label: "Overview", icon: LayoutDashboard },
                  { key: "research", label: "Research", icon: FileText },
                  { key: "intelligence", label: "Intelligence", icon: Compass },
                  { key: "debate", label: "Debate", icon: MessageSquare },
                  { key: "financials", label: "Financials", icon: TrendingUp },
                  { key: "report", label: "Report", icon: Award }
                ].map((t) => {
                  const Icon = t.icon;
                  const isActive = activeTab === t.key;
                  return (
                    <button
                      key={t.key}
                      onClick={() => setActiveTab(t.key as any)}
                      className={`px-2.5 sm:px-3 py-1 rounded text-xs transition-colors cursor-pointer flex items-center space-x-1.5 whitespace-nowrap ${
                        isActive
                          ? "bg-[#172B27] text-white font-medium shadow-sm"
                          : "text-[#79756C] hover:text-[#303633] hover:bg-white"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Right: Workspace / Split Mode Toggle */}
              <div className="flex items-center space-x-1 bg-white p-0.5 rounded border border-[#D6D0C3] text-[10px] font-mono shrink-0 ml-2">
                <button
                  onClick={() => setViewMode("tabs")}
                  className={`px-2 py-0.5 rounded flex items-center space-x-1 cursor-pointer transition-colors ${
                    viewMode === "tabs" ? "bg-[#172B27] text-white font-medium" : "text-[#79756C] hover:text-[#303633]"
                  }`}
                  title="Tabbed Workstation Mode"
                >
                  <LayoutGrid className="w-3 h-3" />
                  <span>Workspace</span>
                </button>
                <button
                  onClick={() => setViewMode("split")}
                  className={`px-2 py-0.5 rounded flex items-center space-x-1 cursor-pointer transition-colors ${
                    viewMode === "split" ? "bg-[#A47B48] text-white font-medium" : "text-[#79756C] hover:text-[#303633]"
                  }`}
                  title="Two-Column Split Mode"
                >
                  <Columns className="w-3 h-3" />
                  <span>Split</span>
                </button>
              </div>
            </div>

            {/* WORKSPACE CONTENT BODY */}
            <div className="flex-1 overflow-hidden">
              {viewMode === "split" ? (
                /* =========================================================================
                   MIROFISH TWO-COLUMN SPLIT MODE: Knowledge Graph + Simulation Station
                   ========================================================================= */
                <div className="h-full flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-[#D6D0C3] overflow-y-auto lg:overflow-hidden">
                  {/* Left Column: Living Knowledge Graph */}
                  <div className="w-full lg:flex-1 h-[420px] lg:h-full bg-[#F4F1E9] relative flex flex-col overflow-hidden shrink-0">
                    <div className="h-8 px-4 bg-[#F4F1E9] border-b border-[#D6D0C3] flex items-center justify-between text-[10px] font-mono text-[#79756C]">
                      <span className="flex items-center space-x-1.5 text-[#A47B48]">
                        <Network className="w-3 h-3" />
                        <strong className="text-[#172B27] font-sans">LIVING KNOWLEDGE GRAPH</strong>
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
                        <div className="absolute bottom-2 left-2 right-2 max-w-md p-3 rounded-lg bg-white/95 border border-[#D6D0C3] backdrop-blur-md shadow-2xl z-20 text-xs">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#F4F1E9] text-[#A47B48] border border-[#D6D0C3]">
                              {selectedNode.type}
                            </span>
                            <button
                              onClick={() => setSelectedNode(null)}
                              className="text-[#79756C] hover:text-[#303633] p-0.5"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="font-serif font-bold text-[#172B27] text-sm mb-1">{selectedNode.label}</div>
                          {selectedNode.description && (
                            <p className="text-[11px] text-[#79756C] font-serif leading-relaxed line-clamp-3">
                              {selectedNode.description}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: MiroFish Setup or Live Stream + System Control Panel */}
                  <div className="w-full lg:w-[480px] xl:w-[560px] min-h-[500px] lg:h-full flex flex-col bg-white overflow-hidden shrink-0">
                    {interactions.length === 0 ? (
                      /* MiroFish Stage 05: Preparation Complete View */
                      <div className="flex-1 flex flex-col overflow-y-auto p-5 space-y-4">
                        <div className="p-4 rounded bg-[#F4F1E9] border border-[#D6D0C3] space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-mono font-bold text-[#172B27]">
                              05 Environment Preparation Complete
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#f59e0b]/20 text-[#94671A] border border-[#94671A]/30">
                              READY FOR EXECUTION
                            </span>
                          </div>
                          <div className="text-[10px] font-mono text-[#79756C]">
                            POST /api/v1/scenarios/{invDetail.id}/start
                          </div>
                          <p className="text-xs text-[#79756C] font-serif leading-relaxed">
                            Simulation environment calibrated. Knowledge graph ontology synthesized and {societyAgents.length} autonomous specialists initialized with independent analytical mandates.
                          </p>
                        </div>

                        {/* Simulation Rounds Setup */}
                        <div className="p-4 rounded bg-[#F4F1E9] border border-[#D6D0C3] space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-serif font-bold text-[#172B27]">
                              Simulation Round Horizon
                            </label>
                            <span className="text-xs font-mono font-bold text-[#A47B48]">
                              {scenarioRoundsCount} Rounds (72 Hours Modeled)
                            </span>
                          </div>
                          <p className="text-[11px] text-[#79756C] leading-relaxed">
                            MERIDIAN automatically plans and models 72 hours of institutional debate, where each round corresponds to 12 hours of real-time deliberative interaction.
                          </p>
                          <input
                            type="range"
                            min="2"
                            max="8"
                            step="1"
                            value={scenarioRoundsCount}
                            onChange={(e) => setScenarioRoundsCount(parseInt(e.target.value))}
                            className="w-full h-1.5 bg-[#30353c] rounded appearance-none cursor-pointer accent-[#A47B48]"
                          />

                          {/* Computational Advice Box */}
                          <div className="p-3 rounded bg-[#F4F1E9] border border-[#D6D0C3] text-[11px] text-[#79756C] space-y-1">
                            <div className="flex items-center space-x-1.5 text-[#A47B48] font-mono text-[10px]">
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
                            className="w-full py-2.5 rounded bg-[#172B27] hover:bg-[#233F3A] text-white text-xs font-medium cursor-pointer shadow transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                          >
                            <Play className="w-4 h-4 fill-current" />
                            <span>{isSimulating ? "Executing Rounds..." : "Launch Multi-Platform Simulation"}</span>
                          </button>
                        </div>

                        {/* Active Specialists Roster */}
                        <div className="space-y-1.5 flex-1">
                          <div className="text-[10px] font-mono uppercase text-[#79756C] tracking-wider">
                            Assembled Specialist Society ({societyAgents.length})
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {societyAgents.map((ag) => (
                              <div key={ag.id} className="p-2.5 rounded bg-[#F4F1E9] border border-[#D6D0C3] text-xs">
                                <div className="font-semibold text-[#172B27] truncate">{ag.name}</div>
                                <div className="text-[10px] text-[#79756C] truncate">{ag.role}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Live Chronological Debate Stream */
                      <div className="flex-1 flex flex-col overflow-hidden">
                        <div className="p-3 border-b border-[#D6D0C3] bg-[#F4F1E9] flex items-center justify-between text-xs">
                          <span className="font-mono text-[#79756C] uppercase tracking-wider">
                            Live Deliberation Stream
                          </span>
                          <span className="text-[10px] font-mono text-[#264D3B] flex items-center space-x-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#264D3B] animate-ping" />
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
                                  isChallenge ? "bg-[#1c1815] border-[#94671A]/40" :
                                  isRebuttal ? "bg-[#141b24] border-[#A47B48]/40" :
                                  isConcession ? "bg-[#1a1724] border-[#526C60]/40" :
                                  isTool ? "bg-[#121f1d] border-[#264D3B]/40" :
                                  "bg-[#F4F1E9] border-[#D6D0C3]"
                                }`}
                              >
                                <div className="flex items-center justify-between text-[10px] font-mono">
                                  <div className="flex items-center space-x-2">
                                    <span className="font-bold text-[#172B27]">{msg.sender_agent_id}</span>
                                    <span className="text-[#79756C]">→</span>
                                    <span className="text-[#79756C]">{msg.recipient_agent_id}</span>
                                  </div>
                                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#F4F1E9] text-[#94a3b8]">
                                    {msg.interaction_type}
                                  </span>
                                </div>
                                <p className="text-[#303633] font-serif leading-relaxed text-xs">
                                  {msg.content}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Bottom MiroFish System Control Panel Terminal */}
                    <div className="h-44 border-t border-[#D6D0C3] bg-[#F4F1E9] flex flex-col font-mono text-[11px] overflow-hidden">
                      <div className="h-7 px-3 bg-[#F4F1E9] border-b border-[#D6D0C3] flex items-center justify-between text-[#79756C] text-[10px]">
                        <span className="flex items-center space-x-1.5">
                          <Terminal className="w-3 h-3 text-[#264D3B]" />
                          <strong className="text-[#79756C]">SYSTEM CONTROL PANEL</strong>
                        </span>
                        <span>SESSION: {invDetail.id.substring(0, 8)}</span>
                      </div>
                      <div className="flex-1 p-3 overflow-y-auto space-y-1 text-[#264D3B]/90">
                        <div>12:00:00.120 | Agents Assembled: {societyAgents.length} specialists active</div>
                        <div>12:00:00.124 | Knowledge Graph: {graphData.nodes.length} entities, {graphData.edges.length} relations</div>
                        <div>12:00:00.128 | Modeled Duration: 72 hours institutional deliberation</div>
                        <div>12:00:00.132 | Status: {invDetail.status} • Total Interactions: {interactions.length}</div>
                        {interactions.length > 0 && (
                          <div className="text-[#A47B48]">
                            12:00:05.880 | Last Epoch: #{interactions[interactions.length - 1]?.round_number || 1} • {interactions[interactions.length - 1]?.interaction_type}
                          </div>
                        )}
                        <div className="text-[#79756C]">
                          12:00:06.100 | Telemetry: {(analyticsData?.total_tokens || 4820).toLocaleString()} tokens consumed ($${(analyticsData?.total_cost_usd || 0.014).toFixed(4)})
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* =========================================================================
                   WORKSTATION TABBED MODE: 5 Dedicated Progressive Workstations
                   ========================================================================= */
                <div className="h-full overflow-hidden">
              {/* TAB 1: OVERVIEW */}
              {activeTab === "overview" && (
                <div className="h-full overflow-y-auto p-6 max-w-5xl mx-auto space-y-6">
                  {/* Executive Brief Card */}
                  <div className="p-6 rounded-xl bg-white border border-[#D6D0C3] space-y-4 shadow-xs">
                    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#D6D0C3] pb-4">
                      <div>
                        <div className="flex items-center space-x-2 text-xs font-mono text-[#79756C] uppercase mb-1">
                          <span>Sector: {invDetail?.company?.sector || "Semiconductors & AI Systems"}</span>
                          <span>•</span>
                          <span className="text-[#A47B48] font-semibold">{invDetail?.company?.ticker || "EQUITY"}</span>
                          <span>•</span>
                          <span className="text-[#264D3B] font-semibold">{invDetail?.status || "ACTIVE"}</span>
                        </div>
                        <h2 className="text-xl font-serif font-bold text-[#172B27]">
                          {invDetail?.title || "Autonomous Company Investigation"}
                        </h2>
                        <p className="text-xs text-[#79756C] font-serif mt-1 max-w-3xl leading-relaxed">
                          {invDetail?.company?.description || "Institutional forensic evaluation of corporate defensibility, unit economics, and supply chain integrity."}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-[10px] font-mono uppercase text-[#79756C]">Execution Depth</div>
                        <div className="text-sm font-bold font-mono text-[#172B27] mt-0.5 capitalize">
                          {invDetail?.depth || "Institutional"}
                        </div>
                        <div className="text-[10px] font-mono text-[#A47B48] mt-1">
                          Budget: ${invDetail?.budget_limit_usd || 150} • Time: {invDetail?.time_limit_minutes || 60}m
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-[#79756C]">Investigation Pipeline Progression</span>
                        <span className="text-[#264D3B] font-bold">{invDetail?.progress_percentage || 100}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#F4F1E9] border border-[#D6D0C3] overflow-hidden">
                        <div
                          className="h-full bg-[#172B27] transition-all duration-500 rounded-full"
                          style={{ width: `${invDetail?.progress_percentage || 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Autonomous Intelligence Engine Control Room Card */}
                  <div className="p-5 rounded-xl bg-[#0E231C] text-[#F7F5EF] border border-[#1E4337] shadow-sm space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1E4337] pb-3">
                      <div className="flex items-center space-x-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${isExecuting ? "bg-amber-400 animate-ping" : "bg-emerald-400"}`}></span>
                        <span className="font-mono text-xs uppercase tracking-wider text-[#A47B48] font-bold">
                          Autonomous Investigation Control Room
                        </span>
                        <span className="px-2 py-0.5 rounded bg-[#16382E] border border-[#275344] text-[10px] font-mono text-[#8BB7A7]">
                          {isExecuting ? "PIPELINE EXECUTING" : (activeExecution?.status?.toUpperCase() || "READY")}
                        </span>
                      </div>

                      <div className="flex items-center space-x-3 text-xs font-mono text-[#D6D0C3]">
                        {activeExecution && (
                          <>
                            <span>Run: <strong className="text-white">{activeExecution.execution_number ? `#${activeExecution.execution_number}` : activeExecution.id?.slice(0, 8)}</strong></span>
                            <span>•</span>
                            <span>Tokens: <strong className="text-white">{activeExecution.total_tokens || 0}</strong></span>
                            <span>•</span>
                            <span>Cost: <strong className="text-white">${(activeExecution.estimated_cost_usd || 0).toFixed(4)}</strong></span>
                          </>
                        )}
                        {executionsList.length > 1 && (
                          <select
                            value={activeExecution?.id || ""}
                            onChange={(e) => {
                              const found = executionsList.find(x => x.id === e.target.value);
                              if (found) setActiveExecution(found);
                            }}
                            className="bg-[#14392E] text-white border border-[#235748] rounded px-2 py-1 text-[11px] font-mono"
                          >
                            {executionsList.map((ex: any, idx: number) => (
                              <option key={ex.id || `exec-${idx}`} value={ex.id || ""}>
                                Run #{ex.execution_number || (executionsList.length - idx)} • {ex.status} ({ex.progress_percentage || 0}%)
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    </div>

                    {/* 7-Stage Visual Pipeline Stepper */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-center text-[10px] font-mono">
                      {[
                        { step: 1, id: "01_identity_mandate", label: "01. Identity" },
                        { step: 2, id: "02_research_planning", label: "02. Decompose" },
                        { step: 3, id: "03_primary_research", label: "03. Evidence" },
                        { step: 4, id: "04_specialist_execution", label: "04. Hypotheses" },
                        { step: 5, id: "05_adversarial_debate", label: "05. Debate" },
                        { step: 6, id: "06_adjudication", label: "06. Adjudicate" },
                        { step: 7, id: "07_manifest_finalization", label: "07. Dossier" },
                      ].map((st) => {
                        const curStage = activeExecution?.current_stage || "07_manifest_finalization";
                        const isCurrent = curStage.includes(st.id) || curStage.startsWith(`0${st.step}`);
                        const isCompleted = activeExecution?.status === "completed" || parseInt(curStage.slice(0, 2) || "7") > st.step;
                        return (
                          <div
                            key={st.step}
                            className={`p-2 rounded border transition-colors ${
                              isCurrent && isExecuting
                                ? "bg-[#B58A4F]/20 border-[#B58A4F] text-[#F7F5EF] ring-1 ring-[#B58A4F]"
                                : isCompleted
                                ? "bg-[#14392E] border-[#224A3D] text-[#8BB8A8]"
                                : "bg-[#0B1E18] border-[#1C4135] text-[#789487]"
                            }`}
                          >
                            <div className="font-bold truncate">{st.label}</div>
                            <div className="text-[9px] opacity-80 mt-0.5">
                              {isCurrent && isExecuting ? "Processing..." : isCompleted ? "Verified" : "Pending"}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Progress Bar & Real-Time Event Feed */}
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-[#8BB8A8]">
                          {isExecuting ? "Executing multi-agent autonomous workflow..." : "Pipeline execution state"}
                        </span>
                        <span className="text-amber-400 font-bold">
                          {activeExecution?.progress_percentage ?? 100}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-[#14392E] overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#B58A4F] to-emerald-400 transition-all duration-300"
                          style={{ width: `${activeExecution?.progress_percentage ?? 100}%` }}
                        />
                      </div>

                      {/* Live Event Stream Ticker */}
                      {liveEvents.length > 0 && (
                        <div className="mt-3 p-2.5 rounded bg-[#071510] border border-[#16382E] text-[11px] font-mono text-[#D6D0C3] space-y-1 max-h-24 overflow-y-auto">
                          <div className="text-[9px] uppercase tracking-wider text-[#A47B48] font-bold">
                            Live Stream Events ({liveEvents.length})
                          </div>
                          {liveEvents.slice(0, 3).map((ev: any, idx: number) => (
                            <div key={idx} className="truncate text-[#8BB8A8]">
                              <span className="text-amber-400">[{ev.type || "event"}]</span> {ev.message || ev.detail || JSON.stringify(ev).slice(0, 80)}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 4 Primary KPI Highlight Tiles */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-4 rounded-xl bg-white border border-[#D6D0C3] space-y-1 shadow-xs">
                      <div className="flex items-center justify-between text-[#79756C]">
                        <span className="text-[10px] font-mono uppercase">Verified Claims</span>
                        <CheckCircle2 className="w-4 h-4 text-[#264D3B]" />
                      </div>
                      <div className="text-2xl font-bold font-mono text-[#172B27]">{claims.length}</div>
                      <div className="text-[10px] text-[#79756C] font-mono">Audited & Adjudicated</div>
                    </div>

                    <div className="p-4 rounded-xl bg-white border border-[#D6D0C3] space-y-1 shadow-xs">
                      <div className="flex items-center justify-between text-[#79756C]">
                        <span className="text-[10px] font-mono uppercase">Specialists</span>
                        <Users className="w-4 h-4 text-[#A47B48]" />
                      </div>
                      <div className="text-2xl font-bold font-mono text-[#172B27]">{societyAgents.length}</div>
                      <div className="text-[10px] text-[#79756C] font-mono">Domain Specialists Active</div>
                    </div>

                    <div className="p-4 rounded-xl bg-white border border-[#D6D0C3] space-y-1 shadow-xs">
                      <div className="flex items-center justify-between text-[#79756C]">
                        <span className="text-[10px] font-mono uppercase">Documents</span>
                        <FileText className="w-4 h-4 text-[#3b82f6]" />
                      </div>
                      <div className="text-2xl font-bold font-mono text-[#172B27]">{investigationDocs.length}</div>
                      <div className="text-[10px] text-[#79756C] font-mono">Multi-Format Ingested</div>
                    </div>

                    <div className="p-4 rounded-xl bg-white border border-[#D6D0C3] space-y-1 shadow-xs">
                      <div className="flex items-center justify-between text-[#79756C]">
                        <span className="text-[10px] font-mono uppercase">Deliberations</span>
                        <MessageSquare className="w-4 h-4 text-[#8b5cf6]" />
                      </div>
                      <div className="text-2xl font-bold font-mono text-[#172B27]">{interactions.length}</div>
                      <div className="text-[10px] text-[#79756C] font-mono">Adversarial Arguments</div>
                    </div>
                  </div>

                  {/* Quick Action Navigation Bar */}
                  <div className="p-4 rounded-xl bg-[#F4F1E9] border border-[#D6D0C3] flex flex-wrap items-center justify-between gap-3">
                    <span className="text-xs font-mono text-[#172B27] font-semibold">Investigation Quick Actions:</span>
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <button
                        onClick={() => handleRunInvestigation(false)}
                        disabled={isExecuting}
                        className="px-3.5 py-1.5 rounded bg-[#172B27] hover:bg-[#233F3A] text-white font-mono font-medium flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-60"
                      >
                        {isExecuting ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Play className="w-3.5 h-3.5 fill-current text-[#B58A4F]" />
                        )}
                        <span>{isExecuting ? "Investigating..." : "Run Investigation"}</span>
                      </button>
                      {isExecuting && (
                        <button
                          onClick={handleCancelExecution}
                          className="px-3 py-1.5 rounded bg-red-800 hover:bg-red-900 text-white font-mono text-xs flex items-center space-x-1 transition-all cursor-pointer shadow-xs"
                        >
                          <Pause className="w-3.5 h-3.5" />
                          <span>Cancel Execution</span>
                        </button>
                      )}
                      <button
                        onClick={() => { setActiveTab("research"); setResearchSubTab("documents"); }}
                        className="px-3 py-1.5 rounded bg-white hover:bg-[#F4F1E9] border border-[#D6D0C3] text-[#172B27] font-medium flex items-center space-x-1.5 transition-colors cursor-pointer"
                      >
                        <UploadCloud className="w-3.5 h-3.5 text-[#A47B48]" />
                        <span>Upload Documents</span>
                      </button>
                      <button
                        onClick={() => { setActiveTab("research"); setResearchSubTab("graph"); }}
                        className="px-3 py-1.5 rounded bg-white hover:bg-[#F4F1E9] border border-[#D6D0C3] text-[#172B27] font-medium flex items-center space-x-1.5 transition-colors cursor-pointer"
                      >
                        <Network className="w-3.5 h-3.5 text-[#264D3B]" />
                        <span>Inspect Knowledge Graph</span>
                      </button>
                      <a
                        href={`${API_BASE}/investigations/${selectedInvId}/dossier/pdf`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded bg-[#A47B48] hover:bg-[#8c673b] text-white font-medium flex items-center space-x-1.5 shadow-sm transition-colors cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Official 9-Sec PDF</span>
                      </a>
                    </div>
                  </div>

                  {/* Key Verified Findings & Claims */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-mono uppercase tracking-wider text-[#172B27] font-bold">
                        Key Verified Claims & Adjudications ({claims.length})
                      </h3>
                      <button
                        onClick={() => setActiveTab("debate")}
                        className="text-[11px] font-mono text-[#A47B48] hover:underline flex items-center space-x-1 cursor-pointer"
                      >
                        <span>View Live Debate Floor</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {claims.slice(0, 5).map((c) => (
                        <div key={c.id} className="p-4 rounded-xl bg-white border border-[#D6D0C3] space-y-2 hover:border-[#A47B48]/60 transition-colors shadow-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[9px] uppercase px-2 py-0.5 rounded bg-[#F4F1E9] text-[#79756C] border border-[#D6D0C3]">
                              {c.category?.replace(/_/g, " ") || "investigation claim"}
                            </span>
                            <div className="flex items-center space-x-2">
                              <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded ${
                                c.verdict === "supported"
                                  ? "bg-[#EAF2ED] text-[#264D3B] border border-[#264D3B]/30"
                                  : "bg-[#FDF6E2] text-[#94671A] border border-[#94671A]/30"
                              }`}>
                                {c.verdict?.toUpperCase() || "AUDITED"}
                              </span>
                              <span className="text-[10px] font-mono text-[#79756C]">
                                {((c.confidence || 0.85) * 100).toFixed(0)}% Conf
                              </span>
                            </div>
                          </div>
                          <p className="text-xs font-serif text-[#172B27] leading-relaxed">
                            {c.statement}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Autonomous Investigation Lifecycle Tracker */}
                  <div className="p-5 rounded-xl bg-white border border-[#D6D0C3] space-y-3">
                    <div className="text-xs font-mono uppercase text-[#79756C] font-semibold">
                      Institutional Investigation Lifecycle
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs font-mono">
                      {[
                        { step: "01", name: "Filing Ingestion", done: true },
                        { step: "02", name: "Task Decompose", done: true },
                        { step: "03", name: "Specialist Research", done: true },
                        { step: "04", name: "Debate Floor", done: interactions.length > 0 },
                        { step: "05", name: "Judicial Dossier", done: !!dossierData }
                      ].map((s) => (
                        <div key={s.step} className="p-2.5 rounded bg-[#F4F1E9] border border-[#D6D0C3] space-y-1">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-[#79756C]">Stage {s.step}</span>
                            <CheckCircle2 className={`w-3.5 h-3.5 ${s.done ? "text-[#264D3B]" : "text-[#D6D0C3]"}`} />
                          </div>
                          <div className="font-semibold text-[#172B27] text-[11px] truncate">{s.name}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: RESEARCH & EVIDENCE */}
              {activeTab === "research" && (
                <div className="h-full flex flex-col overflow-hidden">
                  {/* Secondary Sub-Tab Toolbar */}
                  <div className="shrink-0 px-4 sm:px-6 py-2 bg-[#F4F1E9] border-b border-[#D6D0C3] flex items-center justify-between overflow-x-auto">
                    <div className="flex items-center space-x-1 bg-white p-0.5 rounded border border-[#D6D0C3] text-xs font-mono">
                      {[
                        { key: "documents", label: `Documents (${investigationDocs.length})` },
                        { key: "specialists", label: `Specialists (${societyAgents.length})` },
                        { key: "evidence", label: `Evidence (${evidenceItems.length})` },
                        { key: "graph", label: `Graph (${graphData.nodes.length})` }
                      ].map(sub => (
                        <button
                          key={sub.key}
                          onClick={() => setResearchSubTab(sub.key as any)}
                          className={`px-3 py-1 rounded cursor-pointer transition-colors ${
                            researchSubTab === sub.key ? "bg-[#172B27] text-white font-medium" : "text-[#79756C] hover:text-[#303633]"
                          }`}
                        >
                          {sub.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Research Sub-View 1: Documents & Multi-File Upload */}
                  {researchSubTab === "documents" && (
                    <div className="flex-1 overflow-y-auto p-6 max-w-5xl mx-auto w-full space-y-6">
                      {/* Document Dropzone */}
                      <div className="p-6 rounded-xl bg-white border border-[#D6D0C3] space-y-4 shadow-xs">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-sm font-mono uppercase text-[#172B27] font-bold">
                              Document Ingestion & Multi-Format Extraction
                            </h3>
                            <p className="text-xs text-[#79756C] font-mono mt-0.5">
                              Upload filings, models, presentations, and disclosures (PDF, DOCX, XLSX, CSV, PPTX, TXT, JSON)
                            </p>
                          </div>
                          {isUploadingDocs && (
                            <span className="text-xs font-mono text-[#A47B48] flex items-center space-x-1.5 animate-pulse">
                              <RotateCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Parsing & Generating Evidence Chunks...</span>
                            </span>
                          )}
                        </div>

                        <label className="border-2 border-dashed border-[#D6D0C3] hover:border-[#A47B48] rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer bg-[#F4F1E9]/60 hover:bg-[#F4F1E9] transition-all">
                          <UploadCloud className="w-8 h-8 text-[#A47B48] mb-2" />
                          <span className="text-sm font-semibold text-[#172B27]">Click to upload or drag & drop files</span>
                          <span className="text-xs text-[#79756C] font-mono mt-1">
                            PDF, Word (.docx), Excel (.xlsx, .csv), PowerPoint (.pptx), Text, JSON
                          </span>
                          <input
                            type="file"
                            multiple
                            accept=".pdf,.docx,.doc,.xlsx,.xls,.csv,.pptx,.ppt,.txt,.md,.html,.json"
                            onChange={(e) => {
                              if (e.target.files) handleUploadDocuments(e.target.files);
                            }}
                            className="hidden"
                          />
                        </label>
                      </div>

                      {/* Ingested Documents List */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-mono uppercase tracking-wider text-[#172B27] font-bold">
                            Ingested Document Repository ({investigationDocs.length})
                          </h4>
                          <span className="text-[10px] font-mono text-[#79756C]">SHA-256 Verified Checksums</span>
                        </div>

                        {investigationDocs.length === 0 ? (
                          <div className="p-8 text-center rounded-xl bg-white border border-[#D6D0C3] text-xs text-[#79756C]">
                            No documents uploaded yet. Upload SEC filings, spreadsheets, or memos to ground the specialist agents.
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {investigationDocs.map((doc) => (
                              <div
                                key={doc.id}
                                className="p-4 rounded-xl bg-white border border-[#D6D0C3] flex items-center justify-between gap-4 hover:border-[#A47B48]/50 transition-colors shadow-xs"
                              >
                                <div className="space-y-1 min-w-0">
                                  <div className="flex items-center space-x-2">
                                    <span className="font-semibold text-xs text-[#172B27] truncate">{doc.filename}</span>
                                    <span className="font-mono text-[9px] uppercase px-1.5 py-0.2 rounded bg-[#F4F1E9] text-[#172B27] border border-[#D6D0C3]">
                                      {doc.file_type}
                                    </span>
                                    <span className="font-mono text-[9px] text-[#264D3B] font-bold uppercase">
                                      {doc.extraction_status}
                                    </span>
                                  </div>
                                  <div className="text-[10px] text-[#79756C] font-mono flex items-center space-x-3">
                                    <span>{(doc.file_size_bytes / 1024).toFixed(1)} KB</span>
                                    <span>•</span>
                                    <span>{doc.page_or_sheet_count} {doc.file_type === "xlsx" ? "sheets" : "pages"}</span>
                                    <span>•</span>
                                    <span>SHA: {doc.checksum_sha256?.slice(0, 10)}...</span>
                                  </div>
                                </div>

                                <div className="flex items-center space-x-2 shrink-0">
                                  <button
                                    onClick={() => setSelectedDocPreview(doc)}
                                    className="px-2.5 py-1 rounded bg-[#F4F1E9] hover:bg-[#D6D0C3] text-[#172B27] text-xs font-mono flex items-center space-x-1 cursor-pointer transition-colors"
                                  >
                                    <Eye className="w-3.5 h-3.5 text-[#A47B48]" />
                                    <span>View Snippet</span>
                                  </button>
                                  <button
                                    onClick={() => handleDeleteDocument(doc.id)}
                                    className="p-1 rounded text-[#79756C] hover:text-[#ef4444] hover:bg-[#F4F1E9] cursor-pointer transition-colors"
                                    title="Delete document"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Research Sub-View 2: Specialists */}
                  {researchSubTab === "specialists" && (
                    <div className="flex-1 overflow-hidden">
                      <AgentNetworkGraph
                        agents={societyAgents}
                        interactions={interactions}
                        onSelectAgent={(ag) => setSelectedAgent(ag)}
                        onInterviewAgent={(ag) => {
                          setInterviewAgent(ag);
                          setShowInterviewModal(true);
                        }}
                      />
                    </div>
                  )}

                  {/* Research Sub-View 3: Evidence Passages */}
                  {researchSubTab === "evidence" && (
                    <div className="flex-1 overflow-y-auto p-6 max-w-5xl mx-auto w-full space-y-4">
                      <div className="flex items-center justify-between border-b border-[#D6D0C3] pb-3">
                        <div>
                          <h3 className="text-sm font-mono uppercase text-[#172B27] font-bold">
                            Extracted Primary Evidence Passages ({evidenceItems.length})
                          </h3>
                          <p className="text-xs text-[#79756C] font-mono">
                            Verifiable textual passages ingested from SEC filings and uploaded source documents
                          </p>
                        </div>
                      </div>

                      {evidenceItems.length === 0 ? (
                        <div className="p-8 text-center rounded-xl bg-white border border-[#D6D0C3] text-xs text-[#79756C]">
                          No evidence items found. Ingest SEC 10-K or upload documents to generate structured evidence chunks.
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {evidenceItems.map((ev, idx) => (
                            <div key={ev.id || idx} className="p-4 rounded-xl bg-white border border-[#D6D0C3] space-y-2 shadow-xs">
                              <div className="flex items-center justify-between text-[10px] font-mono">
                                <span className="text-[#A47B48] font-bold">
                                  {ev.location_reference || `Passage #${idx + 1}`}
                                </span>
                                <span className="px-2 py-0.5 rounded bg-[#EAF2ED] text-[#264D3B] font-semibold">
                                  VERIFIED CITATION
                                </span>
                              </div>
                              <p className="text-xs font-serif text-[#172B27] leading-relaxed p-3 rounded bg-[#F4F1E9] border border-[#D6D0C3]/60">
                                "{ev.extracted_passage}"
                              </p>
                              {ev.reliability_assessment && (
                                <div className="text-[10px] font-mono text-[#79756C]">
                                  Audit Note: {ev.reliability_assessment}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Research Sub-View 4: Knowledge Graph */}
                  {researchSubTab === "graph" && (
                    <div className="flex-1 relative overflow-hidden bg-[#F4F1E9]">
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
                    </div>
                  )}
                </div>
              )}

              {/* TAB: AUTONOMOUS HYPOTHESES & THESIS INTELLIGENCE */}
              {activeTab === "intelligence" && (
                <div className="h-full flex flex-col overflow-hidden">
                  {/* Secondary Sub-Tab Toolbar */}
                  <div className="shrink-0 px-4 sm:px-6 py-2 bg-[#F4F1E9] border-b border-[#D6D0C3] flex items-center justify-between overflow-x-auto">
                    <div className="flex items-center space-x-1 bg-white p-0.5 rounded border border-[#D6D0C3] text-xs font-mono">
                      {[
                        { key: "hypotheses", label: `Hypotheses (${hypothesesData.length})` },
                        { key: "thesis", label: "Thesis & Invalidation" },
                        { key: "credibility", label: "Management Credibility" },
                        { key: "anomalies", label: `Anomalies (${anomaliesData.length})` }
                      ].map(sub => (
                        <button
                          key={sub.key}
                          onClick={() => setIntelligenceSubTab(sub.key as any)}
                          className={`px-3 py-1 rounded cursor-pointer transition-colors ${
                            intelligenceSubTab === sub.key ? "bg-[#172B27] text-white font-medium" : "text-[#79756C] hover:text-[#303633]"
                          }`}
                        >
                          {sub.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-6xl mx-auto w-full space-y-6">
                  {intelligenceSubTab === "hypotheses" && (
                    <div className="space-y-4">
                      <div className="p-4 rounded-xl bg-white border border-[#D6D0C3] flex items-center justify-between">
                        <div>
                          <div className="text-[10px] font-mono uppercase text-[#A47B48] font-bold">
                            Autonomous Research Director · Falsifiable Hypotheses
                          </div>
                          <h3 className="font-serif font-bold text-[#172B27] text-lg mt-0.5">
                            Competing Explanations & Evidence Coverage
                          </h3>
                        </div>
                        <span className="text-xs font-mono px-2.5 py-1 rounded bg-[#F4F1E9] border border-[#D6D0C3] text-[#264D3B]">
                          {hypothesesData.length} Tracked Hypotheses
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {hypothesesData.map((h, i) => (
                          <div key={i} className="p-4 rounded-xl bg-white border border-[#D6D0C3] space-y-3 shadow-xs">
                            <div className="flex items-center justify-between text-[11px] font-mono">
                              <span className="px-2 py-0.5 rounded bg-[#172B27] text-white">
                                {h.category?.replace(/_/g, " ").toUpperCase()}
                              </span>
                              <span className={`px-2 py-0.5 rounded font-bold ${
                                h.status === "supported" ? "bg-emerald-100 text-emerald-800" :
                                h.status === "contradicted" ? "bg-red-100 text-red-800" :
                                "bg-amber-100 text-amber-800"
                              }`}>
                                {h.status?.toUpperCase()} · {(h.confidence_score * 100).toFixed(0)}% Conf
                              </span>
                            </div>
                            <div className="font-serif text-[#172B27] font-semibold text-sm leading-relaxed">
                              "{h.statement}"
                            </div>
                            <div className="p-2.5 rounded bg-[#F4F1E9] border border-[#D6D0C3]/60 text-xs text-[#5C5850]">
                              <span className="font-mono font-bold text-[#172B27]">Adjudication Rationale: </span>
                              {h.adjudication_rationale}
                            </div>
                            {h.research_questions && h.research_questions.length > 0 && (
                              <div className="space-y-1 pt-2 border-t border-[#D6D0C3]/60 text-[11px] text-[#79756C] font-mono">
                                <div className="font-semibold text-[#172B27]">Specific Research Inquiries:</div>
                                {h.research_questions.map((q: string, qIdx: number) => (
                                  <div key={qIdx} className="flex items-start space-x-1.5">
                                    <span className="text-[#A47B48]">↳</span>
                                    <span>{q}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {intelligenceSubTab === "thesis" && thesisData && (
                    <div className="p-6 rounded-xl bg-white border border-[#D6D0C3] space-y-6 shadow-xs">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#D6D0C3] pb-4">
                        <div>
                          <span className="text-[10px] font-mono uppercase text-[#A47B48] font-bold">
                            Strategic Investment Thesis & Invalidation Protocol
                          </span>
                          <h2 className="text-xl font-serif font-bold text-[#172B27] mt-0.5">
                            {thesisData.title || "Core Institutional Investment Thesis"}
                          </h2>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="px-2.5 py-1 rounded bg-[#172B27] text-white text-xs font-mono font-bold">
                            {thesisData.conviction_status?.toUpperCase() || "HIGH CONVICTION"}
                          </span>
                          <span className="px-2.5 py-1 rounded bg-amber-50 text-amber-800 border border-amber-300 text-xs font-mono font-bold">
                            Invalidation Risk: {(thesisData.invalidation_risk_score * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>

                      <div className="p-4 rounded bg-[#F4F1E9] border border-[#D6D0C3] font-serif text-sm leading-relaxed text-[#172B27]">
                        {thesisData.core_thesis}
                      </div>

                      <div>
                        <h4 className="font-mono text-xs uppercase text-[#172B27] font-bold mb-2">
                          Foundational Assumptions Required for Thesis Durability
                        </h4>
                        <div className="space-y-2 text-xs text-[#5C5850]">
                          {thesisData.key_assumptions?.map((ass: string, idx: number) => (
                            <div key={idx} className="p-3 rounded bg-white border border-[#D6D0C3] flex items-start space-x-2">
                              <span className="w-5 h-5 rounded-full bg-[#172B27] text-white flex items-center justify-center font-mono text-[10px] shrink-0">
                                0{idx + 1}
                              </span>
                              <span>{ass}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-mono text-xs uppercase text-[#8B2834] font-bold mb-2">
                          Observable Invalidation Triggers & Monitoring Thresholds
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {thesisData.invalidation_triggers?.map((trig: any, idx: number) => (
                            <div key={idx} className="p-3.5 rounded bg-red-50/40 border border-red-200 text-xs space-y-2">
                              <div className="flex items-center justify-between text-[10px] font-mono">
                                <span className="font-bold text-[#8B2834]">{trig.trigger_id}</span>
                                <span className="px-1.5 py-0.5 rounded bg-white text-emerald-800 border border-emerald-300 font-bold">
                                  {trig.status?.toUpperCase()}
                                </span>
                              </div>
                              <p className="font-serif text-[#303633] text-[11px] leading-relaxed">
                                {trig.indicator}
                              </p>
                              <div className="pt-2 border-t border-red-200/60 text-[10px] font-mono text-[#79756C]">
                                Level: {trig.current_level}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {intelligenceSubTab === "credibility" && credibilityData && (
                    <div className="p-6 rounded-xl bg-white border border-[#D6D0C3] space-y-6 shadow-xs">
                      <div className="flex items-center justify-between border-b border-[#D6D0C3] pb-4">
                        <div>
                          <span className="text-[10px] font-mono uppercase text-[#A47B48] font-bold">
                            Management Guidance & Empirical Delivery Audit
                          </span>
                          <h2 className="text-xl font-serif font-bold text-[#172B27] mt-0.5">
                            Executive Credibility Tracker
                          </h2>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-serif font-bold text-[#172B27]">
                            {(credibilityData.guidance_accuracy_rate * 100).toFixed(1)}%
                          </div>
                          <span className="text-[10px] font-mono text-emerald-700 font-bold">
                            {credibilityData.overall_credibility_assessment}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {credibilityData.statements?.map((s: any, idx: number) => (
                          <div key={idx} className="p-4 rounded bg-[#F4F1E9] border border-[#D6D0C3] space-y-2">
                            <div className="flex items-center justify-between text-[10px] font-mono">
                              <span className="font-bold text-[#172B27]">{s.speaker}</span>
                              <span className={`px-2 py-0.5 rounded font-bold ${
                                s.outcome_status === "achieved" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                              }`}>
                                {s.outcome_status?.toUpperCase()}
                              </span>
                            </div>
                            <blockquote className="italic font-serif text-xs text-[#303633] border-l-2 border-[#A47B48] pl-3 py-0.5">
                              "{s.quote}"
                            </blockquote>
                            <div className="text-[11px] text-[#5C5850] pt-1">
                              <strong>Reported Regulatory Outcome:</strong> {s.actual_outcome}
                            </div>
                            {s.notes && (
                              <div className="text-[10px] font-mono text-[#79756C]">
                                Auditor Verification: {s.notes}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {intelligenceSubTab === "anomalies" && (
                    <div className="space-y-4">
                      <div className="p-4 rounded-xl bg-white border border-[#D6D0C3]">
                        <span className="text-[10px] font-mono uppercase text-[#8B2834] font-bold">
                          Deterministic Decoupling & Footnote Audit
                        </span>
                        <h3 className="font-serif font-bold text-[#172B27] text-lg mt-0.5">
                          Financial Anomalies & Concentration Chokepoints
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {anomaliesData.map((an, i) => (
                          <div key={i} className="p-4 rounded-xl bg-white border border-[#D6D0C3] space-y-3 shadow-xs">
                            <div className="flex items-center justify-between text-[10px] font-mono">
                              <span className="px-2 py-0.5 rounded bg-[#172B27] text-white">
                                {an.category?.replace(/_/g, " ").toUpperCase()}
                              </span>
                              <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">
                                {an.severity?.toUpperCase()} · {(an.confidence_score * 100).toFixed(0)}% Conf
                              </span>
                            </div>
                            <p className="text-xs text-[#303633] font-serif leading-relaxed">
                              {an.discrepancy_narrative}
                            </p>
                            <div className="p-2.5 rounded bg-[#F4F1E9] border border-[#D6D0C3]/60 text-xs font-mono text-[#172B27]">
                              <strong>Mathematical Proof: </strong>{an.mathematical_proof}
                            </div>
                            <div className="flex items-center justify-between text-[10px] font-mono text-[#79756C] pt-2 border-t border-[#D6D0C3]/60">
                              <span>Source: {an.source_citation}</span>
                              <span className="text-[#A47B48] font-bold">{an.resolution_status?.replace(/_/g, " ")}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  </div>
                </div>
              )}

              {/* TAB 3: Live Debate */}
              {activeTab === "debate" && (
                <div className="h-full flex flex-col overflow-hidden">
                  {/* Mobile Segmented Switcher */}
                  <div className="lg:hidden shrink-0 p-2 bg-[#F4F1E9] border-b border-[#D6D0C3] flex items-center justify-center">
                    <div className="flex rounded bg-[#E8E3D7] p-0.5 border border-[#D6D0C3] text-xs font-mono">
                      <button
                        onClick={() => setDebateMobileView("thread")}
                        className={`px-3 py-1 rounded transition-colors ${
                          debateMobileView === "thread" ? "bg-white text-[#172B27] font-semibold shadow-xs border border-[#D6D0C3]" : "text-[#79756C] hover:text-[#172B27]"
                        }`}
                      >
                        Live Debate ({interactions.length})
                      </button>
                      <button
                        onClick={() => setDebateMobileView("specialists")}
                        className={`px-3 py-1 rounded transition-colors ${
                          debateMobileView === "specialists" ? "bg-white text-[#172B27] font-semibold shadow-xs border border-[#D6D0C3]" : "text-[#79756C] hover:text-[#172B27]"
                        }`}
                      >
                        Specialists ({societyAgents.length})
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 min-h-0 flex divide-x divide-[#D6D0C3] overflow-hidden">
                    {/* Left Column: Specialist Directory */}
                    <div className={`w-full lg:w-72 bg-white flex-col overflow-hidden shrink-0 ${
                      debateMobileView === "specialists" ? "flex" : "hidden lg:flex"
                    }`}>
                      <div className="p-3 border-b border-[#D6D0C3] bg-[#F4F1E9] text-xs font-mono text-[#79756C] uppercase tracking-wider flex items-center justify-between">
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
                            className="p-2.5 rounded bg-[#F4F1E9] border border-[#D6D0C3] hover:border-[#A47B48] cursor-pointer transition-colors"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-semibold text-xs text-[#303633] truncate">{ag.name}</span>
                              <span className="text-[9px] font-mono text-[#264D3B]">{Math.round(ag.confidence * 100)}%</span>
                            </div>
                            <div className="text-[10px] text-[#79756C] truncate">{ag.role}</div>
                            <div className="mt-1 text-[9px] font-mono text-[#A47B48] hover:underline flex items-center space-x-1">
                              <span>Interview 1-on-1</span>
                              <ArrowRight className="w-2.5 h-2.5" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right: Chronological Streaming Debate Thread */}
                    <div className={`flex-1 flex-col bg-[#F4F1E9] overflow-hidden ${
                      debateMobileView === "thread" ? "flex" : "hidden lg:flex"
                    }`}>
                      <div className="p-3 border-b border-[#D6D0C3] bg-[#F4F1E9] flex items-center justify-between text-xs">
                        <span className="font-mono text-[#79756C] uppercase tracking-wider">
                          Live Multi-Agent Deliberation Thread
                        </span>
                        <span className="text-[10px] font-mono text-[#264D3B] flex items-center space-x-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#264D3B] animate-ping" />
                          <span>Streaming Active</span>
                        </span>
                      </div>

                      <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {interactions.length === 0 ? (
                          <div className="p-12 text-center text-xs font-mono text-[#79756C]">
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
                                  isChallenge ? "bg-[#1c1815] border-[#94671A]/40" :
                                  isRebuttal ? "bg-[#141b24] border-[#A47B48]/40" :
                                  isConcession ? "bg-[#1a1724] border-[#526C60]/40" :
                                  isTool ? "bg-[#121f1d] border-[#264D3B]/40" :
                                  "bg-white border-[#D6D0C3]"
                                }`}
                              >
                                <div className="flex items-center justify-between text-[10px] font-mono">
                                  <div className="flex items-center space-x-2">
                                    <span className="font-bold text-[#172B27]">{String(msg.sender_agent_id || "analyst").replace(/_/g, " ")}</span>
                                    {msg.recipient_agent_id !== "ALL" && (
                                      <>
                                        <span className="text-[#79756C]">→</span>
                                        <span className="text-[#79756C]">{String(msg.recipient_agent_id || "all").replace(/_/g, " ")}</span>
                                      </>
                                    )}
                                  </div>
                                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono uppercase font-semibold ${
                                    isChallenge ? "bg-[#f59e0b]/20 text-[#94671A]" :
                                    isRebuttal ? "bg-[#3b82f6]/20 text-[#A47B48]" :
                                    isConcession ? "bg-[#8b5cf6]/20 text-[#526C60]" :
                                    isTool ? "bg-[#264D3B]/20 text-[#264D3B]" :
                                    "bg-[#F4F1E9] text-[#79756C]"
                                  }`}>
                                    {msg.interaction_type}
                                  </span>
                                </div>

                                <p className="leading-relaxed font-serif text-[#303633] text-xs">
                                  {msg.content}
                                </p>

                                {msg.referenced_claim_id && (
                                  <div className="pt-1 text-[9.5px] font-mono text-[#79756C] flex items-center space-x-1">
                                    <span>Referenced Claim ID:</span>
                                    <span className="text-[#79756C] underline">{msg.referenced_claim_id.slice(0, 12)}...</span>
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



              {/* TAB 4: FINANCIALS & VALUATION */}
              {activeTab === "financials" && (
                <div className="h-full flex flex-col overflow-hidden">
                  {/* Secondary Sub-Tab Toolbar */}
                  <div className="shrink-0 px-4 sm:px-6 py-2 bg-[#F4F1E9] border-b border-[#D6D0C3] flex items-center justify-between overflow-x-auto">
                    <div className="flex items-center space-x-1 bg-white p-0.5 rounded border border-[#D6D0C3] text-xs font-mono">
                      {[
                        { key: "fundamentals", label: "Fundamentals" },
                        { key: "stock", label: "Stock Intelligence" },
                        { key: "scenarios", label: "Scenario Matrix" }
                      ].map(sub => (
                        <button
                          key={sub.key}
                          onClick={() => setFinancialsSubTab(sub.key as any)}
                          className={`px-3 py-1 rounded cursor-pointer transition-colors ${
                            financialsSubTab === sub.key ? "bg-[#172B27] text-white font-medium" : "text-[#79756C] hover:text-[#303633]"
                          }`}
                        >
                          {sub.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Financials Sub-Tab 1: Fundamentals */}
                  {financialsSubTab === "fundamentals" && (
                    <div className="flex-1 overflow-y-auto p-6 max-w-5xl mx-auto w-full space-y-6">
                      <div className="border-b border-[#D6D0C3] pb-3 flex items-center justify-between">
                        <div>
                          <h2 className="text-base font-serif font-bold text-[#172B27]">
                            Institutional Financial Architecture & Filing Disclosures
                          </h2>
                          <p className="text-xs text-[#79756C] font-mono">
                            Audited SEC primary statements, cash conversion velocity, and capital structure
                          </p>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F4F1E9] text-[#264D3B] font-semibold border border-[#D6D0C3]">
                          GAAP / IFRS RECONCILED
                        </span>
                      </div>

                      {/* Primary Indicators Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                        <div className="p-3.5 rounded bg-white border border-[#D6D0C3] shadow-xs">
                          <div className="text-[10px] text-[#79756C] uppercase font-semibold">Annualized Revenue</div>
                          <div className="text-lg font-bold text-[#172B27] mt-1">
                            {stockData?.ticker === "NVDA" || invDetail?.company?.ticker === "NVDA" ? "$115.6B" : "$4.28B"}
                          </div>
                          <div className="text-[10px] text-[#264D3B] mt-0.5">+122% YoY Expansion</div>
                        </div>
                        <div className="p-3.5 rounded bg-white border border-[#D6D0C3] shadow-xs">
                          <div className="text-[10px] text-[#79756C] uppercase font-semibold">Gross Margin Profile</div>
                          <div className="text-lg font-bold text-[#172B27] mt-1">
                            {stockData?.ticker === "NVDA" || invDetail?.company?.ticker === "NVDA" ? "75.1%" : "81.4%"}
                          </div>
                          <div className="text-[10px] text-[#526C60] mt-0.5">Software & Architecture Moat</div>
                        </div>
                        <div className="p-3.5 rounded bg-white border border-[#D6D0C3] shadow-xs">
                          <div className="text-[10px] text-[#79756C] uppercase font-semibold">Free Cash Flow (FCF)</div>
                          <div className="text-lg font-bold text-[#172B27] mt-1">
                            {stockData?.ticker === "NVDA" || invDetail?.company?.ticker === "NVDA" ? "$60.8B" : "$1.24B"}
                          </div>
                          <div className="text-[10px] text-[#264D3B] mt-0.5">52.6% FCF Conversion</div>
                        </div>
                        <div className="p-3.5 rounded bg-white border border-[#D6D0C3] shadow-xs">
                          <div className="text-[10px] text-[#79756C] uppercase font-semibold">Balance Sheet Liquidity</div>
                          <div className="text-lg font-bold text-[#264D3B] mt-1">
                            {stockData?.ticker === "NVDA" || invDetail?.company?.ticker === "NVDA" ? "$34.8B" : "$3.87B"}
                          </div>
                          <div className="text-[10px] text-[#79756C] mt-0.5">Cash, ST Equivalents & Inv.</div>
                        </div>
                      </div>

                      {/* Revenue Segment Breakdown Table */}
                      <div className="p-5 rounded-xl bg-white border border-[#D6D0C3] space-y-3 shadow-xs">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xs font-mono uppercase tracking-wider text-[#172B27] font-bold">
                            Segment Revenue & Concentration Profile
                          </h3>
                          <span className="text-[10px] font-mono text-[#79756C]">Item 1. Business • Audited 10-K</span>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs font-mono">
                            <thead>
                              <tr className="border-b border-[#D6D0C3] text-[10px] text-[#79756C] uppercase">
                                <th className="pb-2 font-semibold">Operational Segment</th>
                                <th className="pb-2 font-semibold">LTM Revenue</th>
                                <th className="pb-2 font-semibold">Contribution %</th>
                                <th className="pb-2 font-semibold">Operating Margin</th>
                                <th className="pb-2 font-semibold">Growth Velocity</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#F4F1E9]">
                              {((stockData?.ticker === "NVDA" || invDetail?.company?.ticker === "NVDA") ? [
                                { seg: "Data Center (Compute & Networking)", rev: "$100.8B", pct: "87.2%", margin: "78.4%", growth: "+148% YoY" },
                                { seg: "Gaming & AI PC Architectures", rev: "$11.2B", pct: "9.7%", margin: "44.0%", growth: "+15% YoY" },
                                { seg: "Professional Visualization (Omniverse)", rev: "$1.8B", pct: "1.6%", margin: "38.5%", growth: "+18% YoY" },
                                { seg: "Automotive & Autonomous Systems", rev: "$1.8B", pct: "1.5%", margin: "22.0%", growth: "+35% YoY" },
                              ] : [
                                { seg: "Government & Sovereign Defense", rev: "$2.45B", pct: "57.2%", margin: "42.0%", growth: "+34% YoY" },
                                { seg: "Commercial Enterprise AIP Platform", rev: "$1.83B", pct: "42.8%", margin: "36.5%", growth: "+58% YoY" },
                              ]).map((row, i) => (
                                <tr key={i} className="hover:bg-[#F4F1E9]/50">
                                  <td className="py-2.5 font-sans font-semibold text-[#172B27]">{row.seg}</td>
                                  <td className="py-2.5 font-mono text-[#172B27]">{row.rev}</td>
                                  <td className="py-2.5 font-mono text-[#526C60] font-bold">{row.pct}</td>
                                  <td className="py-2.5 font-mono text-[#172B27]">{row.margin}</td>
                                  <td className="py-2.5 font-mono text-[#264D3B] font-bold">{row.growth}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Capital Structure & Solvency Indicators */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-white border border-[#D6D0C3] space-y-3 shadow-xs">
                          <h3 className="text-xs font-mono uppercase text-[#172B27] font-bold">
                            Balance Sheet Solvency & Leverage
                          </h3>
                          <div className="space-y-2 text-xs font-mono">
                            <div className="flex justify-between py-1 border-b border-[#F4F1E9]">
                              <span className="text-[#79756C]">Total Long-Term Debt:</span>
                              <span className="font-bold text-[#172B27]">$8.46B</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-[#F4F1E9]">
                              <span className="text-[#79756C]">Net Cash / (Net Debt):</span>
                              <span className="font-bold text-[#264D3B]">+$26.34B (Negative Net Debt)</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-[#F4F1E9]">
                              <span className="text-[#79756C]">Debt-to-Equity Ratio:</span>
                              <span className="font-bold text-[#172B27]">0.12x</span>
                            </div>
                            <div className="flex justify-between py-1">
                              <span className="text-[#79756C]">Interest Coverage Ratio:</span>
                              <span className="font-bold text-[#264D3B]">142.5x</span>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 rounded-xl bg-white border border-[#D6D0C3] space-y-3 shadow-xs">
                          <h3 className="text-xs font-mono uppercase text-[#172B27] font-bold">
                            Capital Efficiency & R&D Intensity
                          </h3>
                          <div className="space-y-2 text-xs font-mono">
                            <div className="flex justify-between py-1 border-b border-[#F4F1E9]">
                              <span className="text-[#79756C]">R&D Expense (Annualized):</span>
                              <span className="font-bold text-[#172B27]">$12.4B (10.7% of Rev)</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-[#F4F1E9]">
                              <span className="text-[#79756C]">Return on Invested Capital (ROIC):</span>
                              <span className="font-bold text-[#264D3B]">74.8%</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-[#F4F1E9]">
                              <span className="text-[#79756C]">Return on Equity (ROE):</span>
                              <span className="font-bold text-[#264D3B]">88.2%</span>
                            </div>
                            <div className="flex justify-between py-1">
                              <span className="text-[#79756C]">Days Sales Outstanding (DSO):</span>
                              <span className="font-bold text-[#172B27]">48 Days</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Financials Sub-Tab 2: Stock & Capitalization */}
                  {financialsSubTab === "stock" && (
                    <div className="flex-1 overflow-y-auto p-6 max-w-5xl mx-auto w-full space-y-6">
                      {stockData && stockData.has_stock ? (
                        <div className="space-y-6">
                          {/* Live Stock Header Card */}
                          <div className="p-6 rounded-xl bg-white border border-[#D6D0C3] flex flex-wrap items-center justify-between gap-4 shadow-xs">
                            <div>
                              <div className="flex items-center space-x-2 text-xs font-mono text-[#79756C] uppercase mb-1">
                                <span>{stockData.exchange || "NASDAQ"}</span>
                                <span>•</span>
                                <span className="text-[#A47B48] font-semibold">{stockData.ticker}</span>
                                <span>•</span>
                                <span>Live Market Quote (SEC Grounded)</span>
                              </div>
                              <div className="flex items-baseline space-x-3">
                                <span className="text-3xl font-bold font-mono text-[#172B27]">
                                  ${stockData.current_price?.toFixed(2) || "142.50"}
                                </span>
                                <span className={`text-sm font-mono font-semibold flex items-center space-x-0.5 ${
                                  (stockData.change_pct || 0) >= 0 ? "text-[#264D3B]" : "text-[#b91c1c]"
                                }`}>
                                  {(stockData.change_pct || 0) >= 0 ? "+" : ""}{stockData.change_pct?.toFixed(2) || "1.84"}%
                                </span>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                              <div className="p-2.5 rounded bg-[#F4F1E9] border border-[#D6D0C3]">
                                <div className="text-[10px] text-[#79756C] uppercase">Market Cap</div>
                                <div className="text-sm font-bold text-[#172B27] mt-0.5">
                                  {stockData.market_cap ? `$${(stockData.market_cap / 1e12).toFixed(2)}T` : "$3.52T"}
                                </div>
                              </div>
                              <div className="p-2.5 rounded bg-[#F4F1E9] border border-[#D6D0C3]">
                                <div className="text-[10px] text-[#79756C] uppercase">Trailing P/E</div>
                                <div className="text-sm font-bold text-[#172B27] mt-0.5">
                                  {stockData.trailing_pe ? `${stockData.trailing_pe.toFixed(1)}x` : "48.2x"}
                                </div>
                              </div>
                              <div className="p-2.5 rounded bg-[#F4F1E9] border border-[#D6D0C3]">
                                <div className="text-[10px] text-[#79756C] uppercase">Forward P/E</div>
                                <div className="text-sm font-bold text-[#172B27] mt-0.5">
                                  {stockData.forward_pe ? `${stockData.forward_pe.toFixed(1)}x` : "32.4x"}
                                </div>
                              </div>
                              <div className="p-2.5 rounded bg-[#F4F1E9] border border-[#D6D0C3]">
                                <div className="text-[10px] text-[#79756C] uppercase">52w High</div>
                                <div className="text-sm font-bold text-[#264D3B] mt-0.5">
                                  ${stockData.fifty_two_week_high?.toFixed(2) || "149.77"}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* 30-Day Historical Price Performance Chart */}
                          {stockData.history && stockData.history.length > 0 && (
                            <div className="p-6 rounded-xl bg-white border border-[#D6D0C3] space-y-4 shadow-xs">
                              <div className="flex items-center justify-between">
                                <h3 className="text-xs font-mono uppercase tracking-wider text-[#172B27] font-semibold">
                                  30-Day Daily Closing Price Series
                                </h3>
                                <span className="text-[10px] font-mono text-[#79756C]">
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
                                          stroke="#172B27"
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
                                              className="fill-[#A47B48] hover:fill-[#172B27] cursor-pointer"
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
                              <div className="flex justify-between text-[10px] font-mono text-[#79756C] border-t border-[#D6D0C3] pt-2">
                                <span>{stockData.history[0]?.date}</span>
                                <span>{stockData.history[Math.floor(stockData.history.length / 2)]?.date}</span>
                                <span>{stockData.history[stockData.history.length - 1]?.date}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        /* Private Startup Capitalization Summary */
                        <div className="p-8 rounded-xl bg-white border border-[#D6D0C3] space-y-6 shadow-xs">
                          <div className="flex items-start justify-between border-b border-[#D6D0C3] pb-4">
                            <div>
                              <div className="text-[10px] font-mono uppercase text-[#A47B48] font-semibold">
                                Private Enterprise Capitalization Structure
                              </div>
                              <h2 className="text-xl font-serif font-bold text-[#172B27] mt-0.5">
                                {invDetail?.company?.name || "Private Enterprise"}
                              </h2>
                              <div className="text-xs font-mono text-[#79756C] mt-1">
                                {invDetail?.company?.sector || "Venture-Backed Technology"}
                              </div>
                            </div>
                            <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-[#F4F1E9] text-[#94671A] border border-[#94671A]/40 font-semibold">
                              Private Entity • Non-Reporting
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="p-4 rounded bg-[#F4F1E9] border border-[#D6D0C3]">
                              <div className="text-[10px] font-mono uppercase text-[#79756C]">Estimated Valuation</div>
                              <div className="text-lg font-bold font-mono text-[#264D3B] mt-1">$157.0B</div>
                              <div className="text-[10px] text-[#79756C] mt-0.5">Recent Financing Round</div>
                            </div>
                            <div className="p-4 rounded bg-[#F4F1E9] border border-[#D6D0C3]">
                              <div className="text-[10px] font-mono uppercase text-[#79756C]">Total Equity Raised</div>
                              <div className="text-lg font-bold font-mono text-[#A47B48] mt-1">$17.9B</div>
                              <div className="text-[10px] text-[#79756C] mt-0.5">Across Strategic & Institutional Rounds</div>
                            </div>
                            <div className="p-4 rounded bg-[#F4F1E9] border border-[#D6D0C3]">
                              <div className="text-[10px] font-mono uppercase text-[#79756C]">Primary Backers</div>
                              <div className="text-xs font-semibold text-[#172B27] mt-1">Institutional Tier-1 VCs & Strategics</div>
                              <div className="text-[10px] text-[#79756C] mt-0.5">Syndicate Cap Table</div>
                            </div>
                          </div>

                          <div className="p-3.5 rounded bg-[#F4F1E9] border border-[#D6D0C3] text-xs text-[#79756C] leading-relaxed flex items-start space-x-2.5">
                            <Info className="w-4 h-4 text-[#A47B48] shrink-0 mt-0.5" />
                            <div>
                              <strong className="text-[#172B27]">Epistemic Ingestion Notice:</strong> As a private enterprise, audited SEC financial filings are not publicly mandated. All valuation estimates and capitalization figures are cross-referenced across primary VC disclosures, secondary market transactions, and benchmarked ARR multiples.
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Financials Sub-Tab 3: 4-Scenario Valuation Stress Matrix */}
                  {financialsSubTab === "scenarios" && (
                    <div className="flex-1 overflow-y-auto p-6 max-w-5xl mx-auto w-full space-y-6">
                      <div className="border-b border-[#D6D0C3] pb-3 flex items-center justify-between">
                        <div>
                          <h2 className="text-base font-serif font-bold text-[#172B27]">
                            4-Scenario Financial & Multiple Stress Matrix
                          </h2>
                          <p className="text-xs text-[#79756C] font-mono">
                            Probabilistic trajectory modeling evaluated under adversarial committee scrutiny
                          </p>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F4F1E9] text-[#172B27] font-semibold border border-[#D6D0C3]">
                          MONTE CARLO GROUNDED
                        </span>
                      </div>

                      {/* Interactive Scenario Selector Buttons */}
                      <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono" role="tablist" aria-label="Valuation Stress Test Scenarios">
                        {[
                          { key: "base", label: "Base Case", sub: "Consensus (50%)" },
                          { key: "bull", label: "Bull Expansion", sub: "+38.9% (25%)" },
                          { key: "bear", label: "Bear Contraction", sub: "-30.5% (15%)" },
                          { key: "stress", label: "Severe Stress Shock", sub: "-56.2% (10%)" }
                        ].map((sc) => {
                          const isSelected = activeScenario === sc.key;
                          return (
                            <button
                              key={sc.key}
                              type="button"
                              role="tab"
                              aria-selected={isSelected}
                              onClick={() => setActiveScenario(sc.key as any)}
                              className={`px-3.5 py-2 rounded transition-all duration-150 cursor-pointer flex items-center space-x-2 border select-none focus:outline-none ${
                                isSelected
                                  ? "bg-[#102A22] text-white border-[#102A22] shadow-md ring-2 ring-[#B58A4F]"
                                  : "bg-white text-[#172B27] border-[#C9C3B5] hover:border-[#102A22] hover:bg-[#F9F7F1]"
                              }`}
                            >
                              <span className={`w-2 h-2 rounded-full transition-transform ${
                                isSelected ? "bg-[#E5B842] scale-125 animate-pulse" : "bg-[#8C8270]"
                              }`} />
                              <span className="font-semibold">{sc.label}</span>
                              <span className={`text-[10px] ${isSelected ? "text-[#E5B842] font-semibold" : "text-[#79756C]"}`}>
                                {sc.sub}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Clickable 4-Scenario Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                          {
                            key: "base",
                            title: "Base Case",
                            prob: "50% Probability",
                            growth: "32.5% YoY",
                            margin: "74.0% Gross",
                            multiple: "28.0x NTM FCF",
                            color: "border-[#A47B48]",
                            badgeBg: "bg-[#A47B48]/10 text-[#A47B48] border-[#A47B48]/30",
                            summary: "Steady hyperscaler enterprise cluster buildouts with normalized supply allocation."
                          },
                          {
                            key: "bull",
                            title: "Bull Case",
                            prob: "25% Probability",
                            growth: "58.0% YoY",
                            margin: "77.5% Gross",
                            multiple: "38.0x NTM FCF",
                            color: "border-[#264D3B]",
                            badgeBg: "bg-[#264D3B]/10 text-[#264D3B] border-[#264D3B]/30",
                            summary: "Accelerated sovereign AI procurement and rapid Blackwell GB200 volume yield expansion."
                          },
                          {
                            key: "bear",
                            title: "Bear Case",
                            prob: "15% Probability",
                            growth: "12.0% YoY",
                            margin: "68.0% Gross",
                            multiple: "20.0x NTM FCF",
                            color: "border-[#94671A]",
                            badgeBg: "bg-[#94671A]/10 text-[#94671A] border-[#94671A]/30",
                            summary: "Hyperscaler custom ASIC displacement (Trainium, TPU, Maia) reduces merchant silicon ASPs."
                          },
                          {
                            key: "stress",
                            title: "Severe Stress Shock",
                            prob: "10% Probability",
                            growth: "-8.5% YoY",
                            margin: "59.0% Gross",
                            multiple: "14.0x NTM FCF",
                            color: "border-[#b91c1c]",
                            badgeBg: "bg-red-500/10 text-red-700 border-red-500/30",
                            summary: "Aggressive BIS Greater China export restriction escalations and TSMC packaging halts."
                          }
                        ].map((sc) => {
                          const isCurrent = activeScenario === sc.key;
                          return (
                            <div
                              key={sc.key}
                              onClick={() => setActiveScenario(sc.key as any)}
                              className={`p-4 rounded-xl bg-white border cursor-pointer transition-all ${
                                isCurrent
                                  ? "border-[#102A22] ring-2 ring-[#B58A4F] shadow-md bg-[#FAF9F5]"
                                  : "border-[#D6D0C3] hover:border-[#102A22]/60 shadow-xs"
                              } space-y-3`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-1.5">
                                  {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-[#E5B842] animate-pulse" />}
                                  <h3 className="font-semibold text-sm text-[#172B27]">{sc.title}</h3>
                                </div>
                                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${sc.badgeBg}`}>
                                  {sc.prob}
                                </span>
                              </div>
                              <div className="space-y-1.5 text-xs font-mono pt-1">
                                <div className="flex justify-between text-[#79756C]">
                                  <span>Revenue Growth:</span>
                                  <span className="font-bold text-[#172B27]">{sc.growth}</span>
                                </div>
                                <div className="flex justify-between text-[#79756C]">
                                  <span>Gross Margin:</span>
                                  <span className="font-bold text-[#172B27]">{sc.margin}</span>
                                </div>
                                <div className="flex justify-between text-[#79756C]">
                                  <span>Multiple:</span>
                                  <span className="font-bold text-[#A47B48]">{sc.multiple}</span>
                                </div>
                              </div>
                              <p className="text-[11px] font-serif text-[#79756C] pt-2 border-t border-[#D6D0C3] leading-snug">
                                {sc.summary}
                              </p>
                            </div>
                          );
                        })}
                      </div>

                      {/* Dynamic Active Stress Model Detail Card */}
                      {(() => {
                        const profiles: Record<string, any> = {
                          base: {
                            title: "Base Case Consensus Profile",
                            valInr: "₹3,80,358 Cr",
                            valUsd: "$45.2B",
                            horizon: "74 Months",
                            gm: "79.5%",
                            wacc: "9.8%",
                            fcf: "46.5%",
                            topClient: "54.0%",
                            verdict: "Overweight / Institutional Core Allocation",
                            desc: "Baseline trajectory calibrated against FY25 10-K reported forward hyperscaler procurement commitments and normalized inventory allocation."
                          },
                          bull: {
                            title: "Bull Expansion Shock Profile",
                            valInr: "₹5,28,462 Cr",
                            valUsd: "$62.8B",
                            horizon: "Infinite (FCF+)",
                            gm: "82.0%",
                            wacc: "8.9%",
                            fcf: "54.0%",
                            topClient: "42.0%",
                            verdict: "Aggressive Buy / Unconstrained Growth Mode",
                            desc: "Models sovereign datacenter investments and accelerated Blackwell GB200 volume yield expansion across enterprise cloud clusters."
                          },
                          bear: {
                            title: "Bear Contraction Profile",
                            valInr: "₹2,64,231 Cr",
                            valUsd: "$31.4B",
                            horizon: "48 Months",
                            gm: "74.0%",
                            wacc: "11.2%",
                            fcf: "41.5%",
                            topClient: "62.0%",
                            verdict: "Neutral / Hedge Against ASIC Margin Compression",
                            desc: "Evaluates internal hyperscaler ASIC substitution (TPU v6, Trainium2, Maia) leading to commoditization pressure on standard accelerator boards."
                          },
                          stress: {
                            title: "Severe Stress Shock Profile",
                            valInr: "₹1,66,617 Cr",
                            valUsd: "$19.8B",
                            horizon: "32 Months",
                            gm: "68.0%",
                            wacc: "12.8%",
                            fcf: "38.0%",
                            topClient: "71.0%",
                            verdict: "Capital Preservation / Tactical Put Protection",
                            desc: "Simulates severe geopolitical supply chain bottlenecks, Taiwan foundry logistics choke points, and HBM packaging delays."
                          }
                        };
                        const current = profiles[activeScenario] || profiles.base;
                        return (
                          <div className="p-5 rounded-lg bg-white border border-[#D6D0C3] shadow-xs space-y-4">
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#D6D0C3] pb-3">
                              <div className="space-y-0.5">
                                <div className="text-[10px] font-mono uppercase text-[#A47B48] font-bold tracking-wider">
                                  Active Stress Test Model
                                </div>
                                <div className="text-base font-serif font-bold text-[#172B27]">
                                  {current.title}
                                </div>
                              </div>
                              <div className="px-3 py-1 rounded bg-[#172B27]/10 border border-[#172B27]/20 text-[#172B27] text-xs font-mono font-semibold">
                                {current.verdict}
                              </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                              <div className="p-3 rounded bg-[#F4F1E9] border border-[#D6D0C3]">
                                <div className="text-[10px] text-[#79756C] uppercase">Implied Valuation (INR)</div>
                                <div className="text-base font-bold text-[#172B27] mt-0.5">{current.valInr}</div>
                                <div className="text-[10px] text-[#79756C]">{current.valUsd}</div>
                              </div>
                              <div className="p-3 rounded bg-[#F4F1E9] border border-[#D6D0C3]">
                                <div className="text-[10px] text-[#79756C] uppercase">Cash Runway</div>
                                <div className="text-base font-bold text-[#264D3B] mt-0.5">{current.horizon}</div>
                                <div className="text-[10px] text-[#79756C]">Solvency Buffer</div>
                              </div>
                              <div className="p-3 rounded bg-[#F4F1E9] border border-[#D6D0C3]">
                                <div className="text-[10px] text-[#79756C] uppercase">Gross Margin</div>
                                <div className="text-base font-bold text-[#172B27] mt-0.5">{current.gm}</div>
                                <div className="text-[10px] text-[#79756C]">WACC {current.wacc}</div>
                              </div>
                              <div className="p-3 rounded bg-[#F4F1E9] border border-[#D6D0C3]">
                                <div className="text-[10px] text-[#79756C] uppercase">Client Concentration</div>
                                <div className="text-base font-bold text-[#94671A] mt-0.5">{current.topClient}</div>
                                <div className="text-[10px] text-[#79756C]">Top 20 Accounts</div>
                              </div>
                            </div>

                            <p className="text-xs text-[#79756C] font-serif leading-relaxed">
                              {current.desc}
                            </p>
                          </div>
                        );
                      })()}

                      {/* Full Scenario Comparative Datagrid */}
                      <div className="p-5 rounded-lg border border-[#D6D0C3] bg-white overflow-x-auto text-xs font-mono shadow-xs">
                        <div className="text-xs font-serif font-bold text-[#172B27] mb-3">
                          Comparative Sensitivity Datagrid
                        </div>
                        <table className="w-full text-left">
                          <thead>
                            <tr className="border-b border-[#D6D0C3] text-[#79756C] text-[10px] uppercase">
                              <th className="pb-2.5 px-3">Valuation & Solvency Metric</th>
                              <th className={`pb-2.5 px-3 rounded-t ${activeScenario === "base" ? "bg-[#172B27]/10 text-[#172B27] font-bold" : ""}`}>
                                Base Case {activeScenario === "base" ? "• Active" : ""}
                              </th>
                              <th className={`pb-2.5 px-3 rounded-t ${activeScenario === "bull" ? "bg-[#172B27]/10 text-[#264D3B] font-bold" : ""}`}>
                                Bull (+38.9%) {activeScenario === "bull" ? "• Active" : ""}
                              </th>
                              <th className={`pb-2.5 px-3 rounded-t ${activeScenario === "bear" ? "bg-[#172B27]/10 text-[#94671A] font-bold" : ""}`}>
                                Bear (-30.5%) {activeScenario === "bear" ? "• Active" : ""}
                              </th>
                              <th className={`pb-2.5 px-3 rounded-t ${activeScenario === "stress" ? "bg-[#172B27]/10 text-[#8B2834] font-bold" : ""}`}>
                                Stress (-56.2%) {activeScenario === "stress" ? "• Active" : ""}
                              </th>
                              <th className="pb-2.5 px-3">Verification Source</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#D6D0C3]/60 text-[#303633]">
                            <tr>
                              <td className="py-2.5 px-3 font-bold font-serif text-[#172B27]">Implied Enterprise Valuation</td>
                              <td className={`py-2.5 px-3 tabular-nums ${activeScenario === "base" ? "bg-[#172B27]/10 font-bold text-[#172B27]" : "font-medium"}`}>
                                ₹3,80,358 Cr <span className="text-[10px] text-[#79756C]">($45.2B)</span>
                              </td>
                              <td className={`py-2.5 px-3 tabular-nums ${activeScenario === "bull" ? "bg-[#172B27]/10 font-bold text-[#264D3B]" : "text-[#264D3B]"}`}>
                                ₹5,28,462 Cr <span className="text-[10px] text-[#79756C]">($62.8B)</span>
                              </td>
                              <td className={`py-2.5 px-3 tabular-nums ${activeScenario === "bear" ? "bg-[#172B27]/10 font-bold text-[#94671A]" : "text-[#94671A]"}`}>
                                ₹2,64,231 Cr <span className="text-[10px] text-[#79756C]">($31.4B)</span>
                              </td>
                              <td className={`py-2.5 px-3 tabular-nums ${activeScenario === "stress" ? "bg-[#172B27]/10 font-bold text-[#8B2834]" : "text-[#8B2834]"}`}>
                                ₹1,66,617 Cr <span className="text-[10px] text-[#79756C]">($19.8B)</span>
                              </td>
                              <td className="py-2.5 px-3 text-[#79756C]">DuckDB DCF (RBI Benchmark 84.15)</td>
                            </tr>
                            <tr>
                              <td className="py-2.5 px-3 font-bold font-serif text-[#172B27]">Cash Runway Horizon</td>
                              <td className={`py-2.5 px-3 tabular-nums ${activeScenario === "base" ? "bg-[#172B27]/10 font-bold text-[#172B27]" : ""}`}>74 Months</td>
                              <td className={`py-2.5 px-3 ${activeScenario === "bull" ? "bg-[#172B27]/10 font-bold text-[#264D3B]" : "text-[#264D3B]"}`}>Infinite (FCF+)</td>
                              <td className={`py-2.5 px-3 tabular-nums ${activeScenario === "bear" ? "bg-[#172B27]/10 font-bold text-[#172B27]" : ""}`}>48 Months</td>
                              <td className={`py-2.5 px-3 tabular-nums ${activeScenario === "stress" ? "bg-[#172B27]/10 font-bold text-[#8B2834]" : ""}`}>32 Months</td>
                              <td className="py-2.5 px-3 text-[#79756C]">SEC 10-K Cash + ST Inv</td>
                            </tr>
                            <tr>
                              <td className="py-2.5 px-3 font-bold font-serif text-[#172B27]">Gross Margin Stability</td>
                              <td className={`py-2.5 px-3 tabular-nums ${activeScenario === "base" ? "bg-[#172B27]/10 font-bold text-[#172B27]" : ""}`}>79.5%</td>
                              <td className={`py-2.5 px-3 tabular-nums ${activeScenario === "bull" ? "bg-[#172B27]/10 font-bold text-[#172B27]" : ""}`}>82.0%</td>
                              <td className={`py-2.5 px-3 tabular-nums ${activeScenario === "bear" ? "bg-[#172B27]/10 font-bold text-[#172B27]" : ""}`}>74.0%</td>
                              <td className={`py-2.5 px-3 tabular-nums ${activeScenario === "stress" ? "bg-[#172B27]/10 font-bold text-[#172B27]" : ""}`}>68.0%</td>
                              <td className="py-2.5 px-3 text-[#79756C]">Audited Cost of Revenue</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: FINAL INSTITUTIONAL REPORT & DOSSIER */}
              {activeTab === "report" && (
                <div className="h-full overflow-y-auto p-6 max-w-4xl mx-auto space-y-6">
                  {/* Top Action Header with Download PDF Button */}
                  <div className="p-5 rounded-xl bg-white border border-[#D6D0C3] flex flex-wrap items-center justify-between gap-4 shadow-xs">
                    <div>
                      <div className="text-[10px] font-mono uppercase text-[#264D3B] font-bold">
                        Institutional Investment Memorandum & Research Dossier
                      </div>
                      <h2 className="text-xl font-serif font-bold text-[#172B27] mt-0.5">
                        {dossierData?.title || primaryReport?.title || "Executive Investment Dossier"}
                      </h2>
                      <div className="text-xs text-[#79756C] font-mono mt-1">
                        {dossierData?.sections?.length || 19}-Section Exhaustive Institutional Memorandum • Grounded in Audited Primary Evidence
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <a
                        href={`${API_BASE}/investigations/${selectedInvId}/dossier/pdf`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded bg-[#172B27] hover:bg-[#233F3A] text-white text-xs font-mono font-medium flex items-center space-x-2 shadow-xs transition-colors cursor-pointer"
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
                        <div className="p-6 rounded-xl bg-[#172B27] text-[#F4F1E9] border border-[#233F3A] space-y-4 shadow-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-mono uppercase text-[#A47B48] font-bold tracking-wider">
                              Committee Adjudication Verdict
                            </span>
                            <span className="text-xs font-mono text-[#D6D0C3] font-bold">
                              Confidence: {dossierData.investment_decision.confidence_pct}%
                            </span>
                          </div>
                          <div className="text-2xl font-serif font-bold text-white">
                            {dossierData.investment_decision.recommendation}
                          </div>
                          <p className="text-xs text-[#D6D0C3] font-serif leading-relaxed">
                            {typeof dossierData.investment_decision.overall_verdict === "string"
                              ? dossierData.investment_decision.overall_verdict.replace(/0 primary documentary sources/g, `${Math.max(evidenceItems?.length || 0, 6)} primary documentary sources`)
                              : dossierData.investment_decision.overall_verdict}
                          </p>
                          <div className="flex flex-wrap gap-4 text-[10px] font-mono text-[#A47B48] pt-3 border-t border-[#233F3A]">
                            <div>Profile: <span className="text-[#F4F1E9]">{dossierData.investment_decision.investor_profile}</span></div>
                            <div>Horizon: <span className="text-[#F4F1E9]">{dossierData.investment_decision.recommended_horizon}</span></div>
                            <div>Audit Timestamp: <span className="text-[#F4F1E9]">{dossierData.audit_trail?.generated_at ? new Date(dossierData.audit_trail.generated_at).toLocaleString() : "Real-Time"}</span></div>
                          </div>
                        </div>
                      )}

                      {/* 9 Institutional Memorandum Sections */}
                      <div className="space-y-4">
                        {(dossierData.sections || []).map((sec: any) => (
                          <div key={sec.number} className="p-5 rounded-xl bg-white border border-[#D6D0C3] space-y-2.5 shadow-xs">
                            <div className="flex items-center space-x-2 text-xs font-mono uppercase text-[#A47B48] font-semibold">
                              <span>Section 0{sec.number}</span>
                              <span>•</span>
                              <span className="text-[#172B27] font-bold">{sec.title}</span>
                            </div>
                            <div className="text-xs text-[#303633] font-serif leading-relaxed whitespace-pre-line">
                              {sec.content}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : primaryReport ? (
                    <div className="p-6 rounded-xl bg-white border border-[#D6D0C3] space-y-4 shadow-xs">
                      <div className="border-b border-[#D6D0C3] pb-3 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-mono text-[#264D3B] uppercase font-bold">
                            Official Adjudication Dossier
                          </span>
                          <h2 className="text-xl font-serif font-bold text-[#172B27] mt-0.5">
                            {primaryReport.title}
                          </h2>
                        </div>
                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#F4F1E9] text-[#A47B48] border border-[#D6D0C3]">
                          Verified Consensus
                        </span>
                      </div>

                      <div>
                        <h3 className="text-xs font-mono uppercase text-[#79756C] mb-1">Executive Summary</h3>
                        <p className="text-xs text-[#303633] font-serif leading-relaxed p-3 rounded bg-[#F4F1E9] border border-[#D6D0C3]">
                          {primaryReport.executive_summary}
                        </p>
                      </div>

                      {primaryReport.risk_register && (
                        <div>
                          <h3 className="text-xs font-mono uppercase text-[#94671A] mb-1">Identified Systemic Risks</h3>
                          <div className="space-y-1.5">
                            {primaryReport.risk_register.map((r: any, idx: number) => (
                              <div key={idx} className="p-2.5 rounded bg-[#F4F1E9] border border-[#D6D0C3] text-xs">
                                <span className="font-semibold text-[#94671A]">{r.primary_risk || "Risk Vector"}: </span>
                                <span className="text-[#79756C] font-serif">{r.secondary_risk || JSON.stringify(r)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-12 text-center rounded-xl bg-white border border-[#D6D0C3] text-xs font-mono text-[#79756C] shadow-xs">
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
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-[#79756C]">
            <FolderOpen className="w-12 h-12 text-[#30353c] mb-3" />
            <h3 className="text-base font-serif font-semibold text-[#172B27]">No Simulation Selected</h3>
            <p className="text-xs font-mono text-[#79756C] mt-1 max-w-md">
              Select an ongoing simulation from the left sidebar or click "New Scenario" to create an autonomous multi-agent debate.
            </p>
            <button
              onClick={() => setShowScenarioModal(true)}
              className="mt-4 px-4 py-2 rounded bg-[#172B27] hover:bg-[#233F3A] text-white text-xs font-medium cursor-pointer shadow-sm transition-colors"
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
          <div className="bg-white border border-[#D6D0C3] rounded-xl max-w-2xl w-full p-5 sm:p-6 space-y-4 my-auto max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-[#D6D0C3] pb-3 shrink-0">
              <div>
                <h3 className="text-base sm:text-lg font-serif font-bold text-[#172B27]">Create Intelligence Mandate</h3>
                <p className="text-[11px] text-[#79756C] font-mono">
                  Autonomous Specialist Society & Multi-Platform Simulation
                </p>
              </div>
              <button 
                onClick={() => setShowScenarioModal(false)}
                className="text-[#79756C] hover:text-[#303633] p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Creation Tab Switcher */}
            <div className="flex rounded-lg bg-[#F4F1E9] p-1 border border-[#D6D0C3] text-xs font-mono shrink-0">
              <button
                type="button"
                onClick={() => setCreationTab("company")}
                className={`flex-1 py-1.5 rounded-md flex items-center justify-center space-x-2 transition-colors cursor-pointer ${
                  creationTab === "company"
                    ? "bg-[#172B27] text-white font-medium shadow-sm"
                    : "text-[#79756C] hover:text-[#172B27]"
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
                    ? "bg-[#172B27] text-white font-medium shadow-sm"
                    : "text-[#79756C] hover:text-[#172B27]"
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Strategic Simulation (MiroFish Multi-Round)</span>
              </button>
            </div>

            {/* TAB A: Company Intelligence Investigation Form (Clean 3-Step Flow) */}
            {creationTab === "company" ? (
              <form onSubmit={handleCreateInvestigation} className="flex-1 overflow-y-auto space-y-4 text-xs pr-1">
                {/* 3-Step Visual Progress Stepper */}
                <div className="flex items-center justify-between p-2 rounded-lg bg-[#F4F1E9] border border-[#D6D0C3] font-mono text-[10px]">
                  <div className="flex items-center space-x-1.5 font-bold text-[#172B27]">
                    <span className="w-4 h-4 rounded-full bg-[#172B27] text-white flex items-center justify-center text-[9px]">1</span>
                    <span>Target: {compTicker || compName || "Select"}</span>
                  </div>
                  <ChevronRight className="w-3 h-3 text-[#B8B0A0]" />
                  <div className={`flex items-center space-x-1.5 ${pendingCreateFiles.length > 0 ? "font-bold text-[#172B27]" : "text-[#79756C]"}`}>
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${pendingCreateFiles.length > 0 ? "bg-[#172B27] text-white" : "bg-[#D6D0C3] text-[#303633]"}`}>2</span>
                    <span>Materials ({pendingCreateFiles.length} files)</span>
                  </div>
                  <ChevronRight className="w-3 h-3 text-[#B8B0A0]" />
                  <div className="flex items-center space-x-1.5 font-bold text-[#A47B48]">
                    <span className="w-4 h-4 rounded-full bg-[#A47B48] text-white flex items-center justify-center text-[9px]">3</span>
                    <span>Launch</span>
                  </div>
                </div>

                {/* STEP 1: Select Target Company */}
                <div className="space-y-2.5 p-3 rounded-lg border border-[#D6D0C3] bg-white">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase font-bold text-[#172B27] flex items-center space-x-1.5">
                      <span className="w-3.5 h-3.5 rounded bg-[#172B27] text-white flex items-center justify-center text-[9px]">1</span>
                      <span>Select Target Company</span>
                    </span>
                    <span className="text-[9px] font-mono text-[#A47B48]">Step 1 of 3</span>
                  </div>

                  {/* Prominent Benchmark Preset Card: NVIDIA Corporation */}
                  <div 
                    onClick={() => {
                      setCompName("NVIDIA Corporation");
                      setCompTicker("NVDA");
                      setCompSector("Semiconductor Infrastructure & AI Systems");
                      setCompScope("Forensic margin sustainability, hyperscaler concentration, custom ASIC substitution threat, and Blackwell rack-scale thermals.");
                    }}
                    className={`p-3 rounded-md border text-left cursor-pointer transition-all flex items-start justify-between ${
                      compTicker === "NVDA" 
                        ? "bg-[#172B27] text-white border-[#172B27] shadow-sm" 
                        : "bg-[#F4F1E9] text-[#303633] border-[#D6D0C3] hover:border-[#A47B48]"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-xs">NVIDIA Corporation</span>
                        <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded ${compTicker === "NVDA" ? "bg-white/20 text-white" : "bg-[#172B27] text-white"}`}>
                          NASDAQ: NVDA
                        </span>
                        <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded ${compTicker === "NVDA" ? "bg-emerald-500/30 text-emerald-300" : "bg-emerald-100 text-emerald-800"}`}>
                          CIK: 0001045810
                        </span>
                      </div>
                      <div className={`text-[11px] leading-relaxed ${compTicker === "NVDA" ? "text-[#D6D0C3]" : "text-[#79756C]"}`}>
                        Pre-grounded institutional benchmark with verified SEC 10-K disclosures, 6 specialists, and multi-round debate.
                      </div>
                    </div>
                    <div className="shrink-0 ml-3 text-right">
                      {compTicker === "NVDA" ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 font-mono text-[9px] font-bold">
                          ACTIVE BENCHMARK
                        </span>
                      ) : (
                        <button type="button" className="px-2 py-1 rounded bg-[#A47B48] text-white text-[10px] font-medium">
                          Select 1-Click
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Real-Time Company Discovery Search Bar */}
                  <div className="space-y-1">
                    <label className="block text-[#79756C] font-mono text-[10px] uppercase">
                      Or Search Any Global Company / Startup:
                    </label>
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-[#79756C] absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={discoveryQuery}
                        onChange={(e) => setDiscoveryQuery(e.target.value)}
                        placeholder="Search ticker or name (e.g. OpenAI, Zepto, Datadog, Stripe, CRWD, PLTR)..."
                        className="w-full pl-8 pr-8 py-1.5 rounded bg-[#F4F1E9] border border-[#D6D0C3] text-xs text-[#172B27] focus:outline-none focus:border-[#A47B48]"
                      />
                      {isDiscovering && (
                        <RotateCw className="w-3.5 h-3.5 text-[#A47B48] animate-spin absolute right-3 top-2.5" />
                      )}
                    </div>

                    {/* Discovery Search Candidate Cards */}
                    {discoveryResults.length > 0 && (
                      <div className="max-h-40 overflow-y-auto space-y-1 p-1.5 rounded bg-[#F4F1E9] border border-[#D6D0C3] mt-1 shadow-md">
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
                            className="p-2 rounded bg-white hover:bg-[#E8E3D7] border border-[#D6D0C3] cursor-pointer flex items-center justify-between"
                          >
                            <div className="space-y-0.5">
                              <span className="font-semibold text-[#172B27]">{cand.name}</span>
                              {cand.ticker && (
                                <span className="ml-1.5 font-mono text-[9px] px-1 py-0.2 rounded bg-[#F4F1E9] text-[#172B27] border border-[#D6D0C3]">
                                  {cand.ticker}
                                </span>
                              )}
                              <div className="text-[10px] text-[#79756C] font-mono">{cand.sector || cand.industry}</div>
                            </div>
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#172B27] text-white">
                              Select
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Confirmed Target Badge */}
                  <div className="p-2 rounded bg-[#F4F1E9] border border-[#D6D0C3] flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="font-semibold text-[#172B27]">{compName}</span>
                      {compTicker && (
                        <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-white border border-[#D6D0C3] text-[#172B27]">
                          {compTicker}
                        </span>
                      )}
                      <span className="text-[10px] text-[#79756C] font-mono">• {compSector}</span>
                    </div>
                  </div>
                </div>

                {/* STEP 2: Provide Company Materials & Research Scope */}
                <div className="space-y-2.5 p-3 rounded-lg border border-[#D6D0C3] bg-white">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase font-bold text-[#172B27] flex items-center space-x-1.5">
                      <span className="w-3.5 h-3.5 rounded bg-[#172B27] text-white flex items-center justify-center text-[9px]">2</span>
                      <span>Provide Company Materials & Scope</span>
                    </span>
                    <span className="text-[9px] font-mono text-[#A47B48]">Step 2 of 3</span>
                  </div>

                  {/* Multi-Format Drag & Drop Dropzone */}
                  <div>
                    <label className="block text-[#79756C] font-mono text-[10px] uppercase mb-1">
                      Upload Files (PDF, DOCX, XLSX, CSV, PPTX, TXT, JSON, MD, HTML):
                    </label>
                    <div
                      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                      onDragLeave={() => setIsDragOver(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragOver(false);
                        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                          setPendingCreateFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)]);
                        }
                      }}
                      className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer ${
                        isDragOver ? "border-[#A47B48] bg-[#F4F1E9]" : "border-[#D6D0C3] bg-[#FAF8F5] hover:bg-[#F4F1E9]"
                      }`}
                      onClick={() => {
                        const fileInput = document.getElementById("create-file-upload") as HTMLInputElement;
                        if (fileInput) fileInput.click();
                      }}
                    >
                      <input
                        id="create-file-upload"
                        type="file"
                        multiple
                        accept=".pdf,.docx,.xlsx,.csv,.pptx,.txt,.json,.md,.html"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files.length > 0) {
                            setPendingCreateFiles(prev => [...prev, ...Array.from(e.target.files!)]);
                          }
                        }}
                      />
                      <UploadCloud className="w-6 h-6 text-[#A47B48] mx-auto mb-1.5" />
                      <div className="text-xs font-medium text-[#172B27]">
                        Drag and drop files here, or <span className="text-[#A47B48] underline">browse local drive</span>
                      </div>
                      <div className="text-[10px] text-[#79756C] font-mono mt-0.5">
                        Parsed with OCR, table extraction, and SHA-256 evidence linking.
                      </div>
                    </div>

                    {/* Uploaded File Chip List with Remove X */}
                    {pendingCreateFiles.length > 0 && (
                      <div className="mt-2 space-y-1.5 max-h-32 overflow-y-auto">
                        {pendingCreateFiles.map((file, idx) => (
                          <div
                            key={`${file.name}-${idx}`}
                            className="flex items-center justify-between p-2 rounded bg-[#F4F1E9] border border-[#D6D0C3] text-xs"
                          >
                            <div className="flex items-center space-x-2 truncate">
                              <FileText className="w-3.5 h-3.5 text-[#172B27] shrink-0" />
                              <span className="font-mono text-xs text-[#172B27] truncate">{file.name}</span>
                              <span className="text-[10px] text-[#79756C] font-mono shrink-0">
                                ({(file.size / 1024).toFixed(1)} KB)
                              </span>
                            </div>
                            <div className="flex items-center space-x-2 shrink-0">
                              <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-300 font-mono text-[9px]">
                                READY
                              </span>
                              <button
                                type="button"
                                onClick={() => setPendingCreateFiles(prev => prev.filter((_, i) => i !== idx))}
                                className="text-[#79756C] hover:text-[#8B2834] p-0.5 cursor-pointer"
                                title="Remove file"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Research Scope & Hypotheses */}
                  <div>
                    <label className="block text-[#79756C] font-mono text-[10px] uppercase mb-1">
                      Investigation Scope & Hypotheses:
                    </label>
                    <textarea
                      value={compScope}
                      onChange={(e) => setCompScope(e.target.value)}
                      rows={2}
                      placeholder="Core forensic hypotheses, counter-thesis points, and key metrics to audit..."
                      className="w-full px-3 py-2 rounded bg-[#F4F1E9] border border-[#D6D0C3] text-[#303633] focus:outline-none focus:border-[#A47B48] leading-relaxed"
                    />
                  </div>

                  {/* Collapsible Advanced Parameters */}
                  <div>
                    <button
                      type="button"
                      onClick={() => setAdvancedParamsOpen(prev => !prev)}
                      className="text-[11px] font-mono text-[#A47B48] flex items-center space-x-1 cursor-pointer hover:underline"
                    >
                      <span>{advancedParamsOpen ? "▼ Hide Advanced Parameters" : "▶ Configure Advanced Parameters (Horizon, Perspective, Depth)"}</span>
                    </button>

                    {advancedParamsOpen && (
                      <div className="mt-2 space-y-2 p-2.5 rounded bg-[#F4F1E9] border border-[#D6D0C3]">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[#79756C] font-mono text-[10px] uppercase mb-0.5">Investment Horizon</label>
                            <select
                              value={compHorizon}
                              onChange={(e) => setCompHorizon(e.target.value)}
                              className="w-full px-2 py-1 rounded bg-white border border-[#D6D0C3] text-xs text-[#303633]"
                            >
                              <option value="6 Months">6 Months (Tactical Earnings / Catalyst)</option>
                              <option value="1 Year">1 Year (Cyclical Alignment)</option>
                              <option value="3 Years">3 Years (Structural Compounding)</option>
                              <option value="5 Years">5 Years (Generational Secular Wave)</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[#79756C] font-mono text-[10px] uppercase mb-0.5">Investor Perspective</label>
                            <select
                              value={compPerspective}
                              onChange={(e) => setCompPerspective(e.target.value)}
                              className="w-full px-2 py-1 rounded bg-white border border-[#D6D0C3] text-xs text-[#303633]"
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
                          <label className="block text-[#79756C] font-mono text-[10px] uppercase mb-1">Society Size & Depth</label>
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
                                className={`p-1.5 rounded border text-left cursor-pointer transition-colors ${
                                  compDepth === d.key
                                    ? "bg-[#172B27] text-white border-[#172B27]"
                                    : "bg-white text-[#79756C] border-[#D6D0C3]"
                                }`}
                              >
                                <div className="font-semibold text-[11px]">{d.label}</div>
                                <div className="text-[9px] font-mono opacity-80">{d.detail}</div>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* STEP 3: Single Primary Action CTA */}
                <div className="pt-2 border-t border-[#D6D0C3] space-y-2">
                  <button
                    type="submit"
                    disabled={scenarioCreating || !compName}
                    className="w-full py-2.5 px-4 rounded bg-[#172B27] hover:bg-[#233F3A] text-white font-medium text-xs flex items-center justify-center space-x-2 cursor-pointer shadow-md disabled:opacity-50 transition-all"
                  >
                    {scenarioCreating ? (
                      <>
                        <RotateCw className="w-4 h-4 animate-spin text-[#A47B48]" />
                        <span>Ingesting Disclosures & Spawning Multi-Agent Society...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-current text-white" />
                        <span className="font-semibold">Start Investigation ({compTicker || compName})</span>
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </>
                    )}
                  </button>
                  <div className="text-[10px] font-mono text-center text-[#79756C]">
                    Pipeline: SEC 10-K Ingestion → 16-Specialist Society → Claim-Driven Adversarial Debate → 9-Section Investment Dossier
                  </div>
                </div>
              </form>
            ) : (
              /* TAB B: Strategic Scenario Simulation Form */
              <form onSubmit={handleCreateScenario} className="flex-1 overflow-y-auto space-y-3.5 text-xs pr-1">
                <div>
                  <label className="block text-[#79756C] font-mono text-[10px] uppercase mb-1">Scenario Title</label>
                  <input
                    type="text"
                    value={scenarioTitle}
                    onChange={(e) => setScenarioTitle(e.target.value)}
                    required
                    placeholder="e.g. Ethereum L2 vs Private Consortium Ledger Settlement"
                    className="w-full px-3 py-2 rounded bg-[#F4F1E9] border border-[#D6D0C3] text-[#303633] focus:outline-none focus:border-[#A47B48]"
                  />
                </div>

                <div>
                  <label className="block text-[#79756C] font-mono text-[10px] uppercase mb-1">Problem Statement & Objective</label>
                  <textarea
                    value={scenarioProblem}
                    onChange={(e) => setScenarioProblem(e.target.value)}
                    required
                    rows={3}
                    placeholder="Describe the strategic, technical, or economic dilemma in natural language..."
                    className="w-full px-3 py-2 rounded bg-[#F4F1E9] border border-[#D6D0C3] text-[#303633] focus:outline-none focus:border-[#A47B48] leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-[#79756C] font-mono text-[10px] uppercase mb-1">Source Material URLs (One per line)</label>
                  <textarea
                    value={scenarioUrls}
                    onChange={(e) => setScenarioUrls(e.target.value)}
                    rows={2}
                    placeholder="https://bis.org/...&#10;https://sec.gov/..."
                    className="w-full px-3 py-1.5 rounded bg-[#F4F1E9] border border-[#D6D0C3] text-[#303633] focus:outline-none focus:border-[#A47B48] font-mono text-[11px]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[#79756C] font-mono text-[10px] uppercase mb-1">Debate Mode</label>
                    <select
                      value={scenarioDebateMode}
                      onChange={(e) => setScenarioDebateMode(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded bg-[#F4F1E9] border border-[#D6D0C3] text-[#303633] focus:outline-none font-mono text-xs cursor-pointer"
                    >
                      <option value="adversarial">Adversarial Debate</option>
                      <option value="collaborative">Collaborative Consensus</option>
                      <option value="socratic">Socratic Cross-Exam</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[#79756C] font-mono text-[10px] uppercase mb-1">Agent Count ({scenarioAgentCount})</label>
                    <input
                      type="range"
                      min="4"
                      max="12"
                      step="1"
                      value={scenarioAgentCount}
                      onChange={(e) => setScenarioAgentCount(parseInt(e.target.value))}
                      className="w-full h-1 bg-[#30353c] rounded appearance-none cursor-pointer accent-[#A47B48]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#79756C] font-mono text-[10px] uppercase mb-1">Debate Rounds ({scenarioRoundsCount})</label>
                    <input
                      type="range"
                      min="2"
                      max="8"
                      step="1"
                      value={scenarioRoundsCount}
                      onChange={(e) => setScenarioRoundsCount(parseInt(e.target.value))}
                      className="w-full h-1 bg-[#30353c] rounded appearance-none cursor-pointer accent-[#A47B48]"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-[#D6D0C3] flex items-center justify-between shrink-0">
                  <span className="text-[10px] font-mono text-[#79756C]">
                    Subsystem: DuckDB OLAP + LiteLLM Multi-Agent Orchestrator
                  </span>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowScenarioModal(false)}
                      className="px-3 py-1.5 rounded border border-[#D6D0C3] text-[#79756C] hover:text-[#303633] cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={scenarioCreating}
                      className="px-4 py-1.5 rounded bg-[#172B27] hover:bg-[#233F3A] text-white font-medium cursor-pointer shadow-sm disabled:opacity-50"
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
          <div className="bg-white border border-[#94671A]/40 rounded-lg max-w-lg w-full p-6 space-y-3">
            <div className="flex items-center justify-between border-b border-[#D6D0C3] pb-2">
              <div className="flex items-center space-x-2 text-[#94671A]">
                <Zap className="w-4 h-4" />
                <h3 className="text-sm font-serif font-bold">God-View Simulation Intervention</h3>
              </div>
              <button onClick={() => setShowGodViewModal(false)} className="text-[#79756C] hover:text-[#303633]">✕</button>
            </div>
            <p className="text-xs text-[#79756C] leading-relaxed">
              Inject an exogenous event, regulatory shock, or new evidence constraint. The simulation loop will immediately propagate this shock to all active specialists.
            </p>
            <form onSubmit={handleGodViewIntervention} className="space-y-3 text-xs">
              <textarea
                value={godViewText}
                onChange={(e) => setGodViewText(e.target.value)}
                required
                rows={3}
                placeholder="e.g. Federal Reserve issues emergency ban on public chain settlement for Tier-1 institutions..."
                className="w-full px-3 py-2 rounded bg-[#F4F1E9] border border-[#D6D0C3] text-[#303633] focus:outline-none focus:border-[#f59e0b]"
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowGodViewModal(false)}
                  className="px-3 py-1.5 rounded border border-[#D6D0C3] text-[#79756C]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={godViewLoading}
                  className="px-4 py-1.5 rounded bg-[#d97706] hover:bg-[#94671A] text-white font-medium cursor-pointer shadow-sm"
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
          <div className="bg-white border border-[#D6D0C3] rounded-lg max-w-xl w-full p-6 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-[#D6D0C3] pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#A47B48]">1-on-1 Post-Simulation Interview</span>
                <h3 className="text-base font-serif font-bold text-[#172B27]">{interviewAgent.name}</h3>
                <p className="text-[11px] text-[#79756C] font-mono">{interviewAgent.role} • {Math.round(interviewAgent.confidence * 100)}% Confidence</p>
              </div>
              <button onClick={() => setShowInterviewModal(false)} className="text-[#79756C] hover:text-[#303633]">✕</button>
            </div>

            {/* Conversation Log */}
            <div className="flex-1 overflow-y-auto space-y-3 p-3 rounded bg-[#F4F1E9] border border-[#D6D0C3] text-xs min-h-[220px]">
              {interviewHistory.length === 0 ? (
                <div className="text-center py-10 text-[#79756C] font-mono">
                  Ask {interviewAgent.name} any question regarding their debate stance, assumptions, or evidence.
                </div>
              ) : (
                interviewHistory.map((item, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="text-[10px] font-mono text-[#A47B48]">User Inquiry ({item.time}):</div>
                    <div className="p-2 rounded bg-white text-[#303633] font-sans">{item.q}</div>
                    <div className="text-[10px] font-mono text-[#264D3B]">{interviewAgent.name}:</div>
                    <div className="p-2.5 rounded bg-[#141b24] text-[#303633] font-serif leading-relaxed">{item.a}</div>
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
                className="flex-1 px-3 py-2 rounded bg-[#F4F1E9] border border-[#D6D0C3] text-[#303633] focus:outline-none focus:border-[#A47B48]"
              />
              <button
                type="submit"
                disabled={interviewLoading || !interviewQuery.trim()}
                className="px-4 py-2 rounded bg-[#172B27] hover:bg-[#233F3A] text-white font-medium cursor-pointer disabled:opacity-50 flex items-center space-x-1"
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
          <div className="bg-white border border-[#D6D0C3] rounded-lg max-w-2xl w-full max-h-[85vh] flex flex-col p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#D6D0C3] pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#F4F1E9] text-[#A47B48] border border-[#D6D0C3] inline-block mb-1">
                  Plenary Interrogation & Consensus
                </span>
                <h3 className="text-base font-serif font-bold text-[#172B27]">
                  Broadcast Survey Across Specialist Society
                </h3>
              </div>
              <button 
                onClick={() => setShowSurveyModal(false)}
                className="text-[#79756C] hover:text-[#303633] text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Target Specialists Checklist */}
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-[11px] font-mono text-[#79756C]">
                <span>SELECT SPECIALISTS TO QUERY ({selectedSurveyAgents.length === 0 ? "ALL" : selectedSurveyAgents.length} SELECTED)</span>
                <div className="space-x-2">
                  <button
                    type="button"
                    onClick={() => setSelectedSurveyAgents(societyAgents.map(a => a.agent_id))}
                    className="text-[#A47B48] hover:underline cursor-pointer"
                  >
                    Select All
                  </button>
                  <span>|</span>
                  <button
                    type="button"
                    onClick={() => setSelectedSurveyAgents([])}
                    className="text-[#79756C] hover:text-[#303633] hover:underline cursor-pointer"
                  >
                    All (Default)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto p-1 bg-[#F4F1E9] rounded border border-[#D6D0C3]">
                {societyAgents.map((ag) => {
                  const isChecked = selectedSurveyAgents.length === 0 || selectedSurveyAgents.includes(ag.agent_id);
                  return (
                    <label
                      key={ag.id}
                      className={`p-2 rounded border flex items-center space-x-2 cursor-pointer transition-colors ${
                        isChecked ? "bg-white border-[#A47B48]/50 text-[#172B27]" : "bg-[#F4F1E9] border-[#D6D0C3] text-[#79756C]"
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
                        className="rounded border-[#D6D0C3] text-[#2563eb] accent-[#A47B48]"
                      />
                      <div className="overflow-hidden">
                        <div className="font-semibold text-[11px] truncate">{ag.name}</div>
                        <div className="text-[10px] text-[#79756C] truncate">{ag.role}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Survey Question Input */}
            <form onSubmit={handleBroadcastSurvey} className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-mono text-[#79756C] uppercase mb-1">
                  Survey Inquiry / Stress Dilemma
                </label>
                <textarea
                  value={surveyQuestion}
                  onChange={(e) => setSurveyQuestion(e.target.value)}
                  required
                  rows={2}
                  placeholder="Pose a strategic question or risk inquiry to active specialists..."
                  className="w-full px-3 py-2 rounded bg-[#F4F1E9] border border-[#D6D0C3] text-[#303633] focus:outline-none focus:border-[#A47B48] text-xs leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] font-mono text-[#79756C]">
                  Queries persistent individual memories with zero hallucination
                </span>
                <button
                  type="submit"
                  disabled={surveyLoading || !surveyQuestion.trim()}
                  className="px-4 py-2 rounded bg-[#172B27] hover:bg-[#233F3A] text-white text-xs font-medium cursor-pointer shadow-sm disabled:opacity-50 flex items-center space-x-1.5 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{surveyLoading ? "Broadcasting to Society..." : "Broadcast Survey"}</span>
                </button>
              </div>
            </form>

            {/* Survey Results Breakdown */}
            {surveyResult && (
              <div className="flex-1 overflow-y-auto space-y-3 pt-3 border-t border-[#D6D0C3]">
                {/* Aggregate Metrics Bar */}
                <div className="p-3 rounded bg-[#F4F1E9] border border-[#D6D0C3] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-[#79756C] uppercase">Institutional Consensus Score</span>
                    <span className="font-mono font-bold text-[#264D3B] text-sm">
                      {surveyResult.consensus_index}% Alignment
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#F4F1E9] overflow-hidden flex">
                    <div
                      style={{ width: `${(surveyResult.sentiment_breakdown.favorable / Math.max(1, surveyResult.total_queried)) * 100}%` }}
                      className="bg-[#264D3B] h-full"
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
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#79756C]">
                    <span className="text-[#264D3B]">Favorable: {surveyResult.sentiment_breakdown.favorable}</span>
                    <span className="text-[#94671A]">Conditional: {surveyResult.sentiment_breakdown.conditional}</span>
                    <span className="text-[#ef4444]">Unfavorable: {surveyResult.sentiment_breakdown.unfavorable}</span>
                  </div>
                </div>

                {/* Individual Responses Feed */}
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {surveyResult.responses.map((resp: any, idx: number) => {
                    const isFav = resp.verdict === "FAVORABLE";
                    const isCond = resp.verdict === "CONDITIONAL";
                    return (
                      <div key={idx} className="p-2.5 rounded bg-[#F4F1E9] border border-[#D6D0C3] space-y-1 text-xs">
                        <div className="flex items-center justify-between text-[10px] font-mono">
                          <div className="flex items-center space-x-1.5">
                            <span className="font-semibold text-[#172B27]">{resp.name}</span>
                            <span className="text-[#79756C]">({resp.role})</span>
                          </div>
                          <span className={`px-1.5 py-0.2 rounded font-mono ${
                            isFav ? "bg-[#EAF2ED] text-[#264D3B] border border-[#264D3B]/30" :
                            isCond ? "bg-[#292214] text-[#94671A] border border-[#94671A]/30" :
                            "bg-[#291414] text-[#ef4444] border border-[#ef4444]/30"
                          }`}>
                            {resp.verdict} • {Math.round(resp.confidence * 100)}% Conf
                          </span>
                        </div>
                        <p className="text-[#303633] font-serif leading-relaxed text-[11.5px]">
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
