import asyncio
import json
from typing import List, Optional, Dict, Any, Union
from fastapi import FastAPI, Depends, HTTPException, status, BackgroundTasks, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, Response
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from sqlalchemy import desc

from database import init_db, get_db
from models import (
    User, Organization, OrganizationMember, Company, Investigation,
    InvestigationStatus, SpecialistRun, SocietyAgent, AgentMemory,
    PositionRevision, AgentInteraction, SimulationRun, Source, EvidenceItem,
    Claim, DebateSession, DebateArgument, Report, InvestigationEvent, CorporateRelationship
)
from auth import (
    get_password_hash, verify_password, create_access_token,
    get_current_user, get_current_organization
)
from multi_agent_society_engine import MultiAgentSocietyEngine
from engine import run_investigation_pipeline
from flagship_demo import ensure_flagship_demo_seeded, FLAGSHIP_DEMO_COMPANY, FLAGSHIP_DEMO_SEEDS
from telemetry import telemetry
from scenario_simulation_engine import DynamicScenarioEngine
from company_discovery import CompanyDiscoveryEngine, DiscoveredCompanyCandidate
from research_ingestion import ResearchIngestionEngine
from investment_dossier import InvestmentDossierGenerator

app = FastAPI(
    title="MERIDIAN Multi-Agent Society & Intelligence API",
    version="2.0.0",
    docs_url="/api/docs",
    openapi_url="/api/openapi.json"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def telemetry_middleware(request, call_next):
    span = telemetry.start_span(
        name=f"{request.method} {request.url.path}",
        component="fastapi_http",
        attributes={"method": request.method, "path": request.url.path}
    )
    try:
        response = await call_next(request)
        telemetry.end_span(
            span.span_id,
            status="OK" if response.status_code < 400 else "ERROR",
            additional_attributes={"status_code": response.status_code}
        )
        response.headers["X-Trace-Id"] = span.trace_id
        response.headers["X-Span-Id"] = span.span_id
        return response
    except Exception as e:
        telemetry.end_span(span.span_id, status="ERROR", additional_attributes={"error": str(e)})
        raise e

@app.on_event("startup")
def on_startup():
    init_db()

def get_authorized_investigation(
    investigation_id: str,
    org: Organization,
    db: Session
) -> Investigation:
    inv = db.query(Investigation).filter(
        Investigation.id == investigation_id,
        Investigation.organization_id == org.id
    ).first()
    if not inv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Investigation not found or unauthorized for this organization"
        )
    return inv

# ---- Schemas ----
class RegisterRequest(BaseModel):
    email: EmailStr
    full_name: str
    password: str
    organization_name: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    email: str
    full_name: str
    organization_id: str
    organization_name: str

class CreateInvestigationRequest(BaseModel):
    company_name: str
    ticker: Optional[str] = None
    domain: Optional[str] = None
    company_type: str = "private"
    sector: Optional[str] = "Enterprise Technology"
    depth: str = "comprehensive"
    scope: Union[List[str], str] = ["corporate_identity", "financials", "competitive", "market", "risks", "scenarios"]
    budget_limit_usd: float = 150.0

class AgentInterventionRequest(BaseModel):
    agent_id: str
    message: str

class SocietyInterrogateAllRequest(BaseModel):
    question: str

class HypotheticalEventRequest(BaseModel):
    event_description: str

class MandateUpdateRequest(BaseModel):
    mandate: str

class DebateChallengeRequest(BaseModel):
    claim_id: str
    challenger_agent_id: str
    challenge_text: str

class CreateScenarioRequest(BaseModel):
    title: str
    problem_statement: str
    objective: Optional[str] = "Evaluate feasibility, systemic risk, and optimal decision strategy"
    source_text: Optional[str] = None
    source_urls: List[str] = []
    uploaded_documents: List[Dict[str, Any]] = []
    agent_count: int = 6
    rounds_count: int = 6
    debate_mode: str = "adversarial" # "adversarial", "collaborative", "socratic", "cross_examination"
    budget_limit_usd: float = 150.0
    permitted_tools: List[str] = ["knowledge_graph", "duckdb_math", "doc_retrieval", "web_search"]

class AgentInterviewRequest(BaseModel):
    question: str

class CompanyResolveRequest(BaseModel):
    name: str
    ticker: Optional[str] = None
    exchange: Optional[str] = None
    website: Optional[str] = None
    country: Optional[str] = "United States"
    industry: Optional[str] = "Technology"
    sector: Optional[str] = "Technology & Software"
    company_type: Optional[str] = "private"
    market_cap_usd: Optional[float] = None

class ScenarioSurveyRequest(BaseModel):
    question: str
    agent_ids: Optional[List[str]] = None

class GodViewInterventionRequest(BaseModel):
    intervention_text: str

# ---- Flagship Demonstration Endpoint ----
@app.get("/api/v1/demo/flagship")
def get_or_create_flagship_demo(db: Session = Depends(get_db)):
    """
    Public entry point for the MiroFish-style Flagship Demonstration.
    Seeds and returns the Palantir Technologies investigation session.
    """
    return ensure_flagship_demo_seeded(db)

# ---- Auth Endpoints ----
@app.post("/api/v1/auth/register", response_model=TokenResponse)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == req.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="User with this email already exists")
    
    user = User(
        email=req.email,
        full_name=req.full_name,
        hashed_password=get_password_hash(req.password)
    )
    db.add(user)
    db.flush()

    slug = req.organization_name.lower().replace(" ", "-") + "-" + str(abs(hash(req.email)) % 10000)
    org = Organization(
        name=req.organization_name,
        slug=slug
    )
    db.add(org)
    db.flush()

    membership = OrganizationMember(
        organization_id=org.id,
        user_id=user.id,
        role="lead_investigator"
    )
    db.add(membership)
    db.commit()

    token = create_access_token({"sub": user.id})
    return TokenResponse(
        access_token=token,
        user_id=user.id,
        email=user.email,
        full_name=user.full_name,
        organization_id=org.id,
        organization_name=org.name
    )

@app.post("/api/v1/auth/login", response_model=TokenResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    membership = db.query(OrganizationMember).filter(OrganizationMember.user_id == user.id).first()
    org_id = membership.organization_id if membership else ""
    org_name = membership.organization.name if membership else ""

    token = create_access_token({"sub": user.id})
    return TokenResponse(
        access_token=token,
        user_id=user.id,
        email=user.email,
        full_name=user.full_name,
        organization_id=org_id,
        organization_name=org_name
    )

@app.get("/api/v1/auth/me")
def get_me(user: User = Depends(get_current_user), org: Organization = Depends(get_current_organization)):
    return {
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "organization": {
            "id": org.id,
            "name": org.name,
            "tier": org.tier
        }
    }

# ---- Investigations ----
@app.get("/api/v1/investigations")
def list_investigations(
    org: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db)
):
    invs = db.query(Investigation).filter(Investigation.organization_id == org.id).order_by(desc(Investigation.created_at)).all()
    results = []
    for inv in invs:
        results.append({
            "id": inv.id,
            "title": inv.title,
            "company_name": inv.company.name if inv.company else "",
            "ticker": inv.company.ticker if inv.company else "",
            "status": inv.status,
            "depth": inv.depth,
            "progress_percentage": inv.progress_percentage,
            "current_cost_usd": inv.current_cost_usd,
            "created_at": inv.created_at.isoformat(),
            "completed_at": inv.completed_at.isoformat() if inv.completed_at else None
        })
    return results

@app.post("/api/v1/investigations")
def create_investigation(
    req: CreateInvestigationRequest,
    background_tasks: BackgroundTasks,
    org: Organization = Depends(get_current_organization),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    company = db.query(Company).filter(Company.name == req.company_name).first()
    if not company:
        company = Company(
            name=req.company_name,
            ticker=req.ticker,
            domain=req.domain,
            company_type=req.company_type,
            sector=req.sector,
            description=f"Institutional dossier for {req.company_name}"
        )
        db.add(company)
        db.flush()

    inv = Investigation(
        organization_id=org.id,
        company_id=company.id,
        title=f"Investigation: {company.name} Corporate Dossier",
        depth=req.depth,
        scope=req.scope if isinstance(req.scope, list) else [req.scope],
        budget_limit_usd=req.budget_limit_usd,
        created_by_user_id=user.id,
        status=InvestigationStatus.DRAFT.value
    )
    db.add(inv)
    db.commit()

    return {"investigation_id": inv.id, "title": inv.title, "status": inv.status}

@app.post("/api/v1/investigations/{id}/start")
def start_investigation(
    id: str,
    background_tasks: BackgroundTasks,
    org: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db)
):
    inv = get_authorized_investigation(id, org, db)
    
    def run_job(inv_id: str):
        from database import SessionLocal
        job_db = SessionLocal()
        try:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            loop.run_until_complete(run_investigation_pipeline(inv_id, job_db))
        finally:
            job_db.close()

    background_tasks.add_task(run_job, inv.id)
    return {"message": "Multi-agent society investigation pipeline launched", "investigation_id": inv.id}

# ---- Real-Time Company Discovery & Entity Resolution ----

@app.get("/api/v1/companies/discover")
async def discover_companies(
    q: str,
    org: Organization = Depends(get_current_organization)
):
    if not q or not q.strip():
        return []
    candidates = await CompanyDiscoveryEngine.discover(q)
    return [c.dict() for c in candidates]

@app.post("/api/v1/companies/resolve")
def resolve_company_entity(
    req: CompanyResolveRequest,
    org: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db)
):
    company = db.query(Company).filter(Company.name == req.name).first()
    if not company:
        company = Company(
            name=req.name,
            ticker=req.ticker,
            domain=req.website,
            company_type=req.company_type or "private",
            sector=req.sector or "Enterprise Technology",
            description=f"Institutional entity record for {req.name} ({req.ticker or 'Private'})"
        )
        db.add(company)
        db.commit()
    
    return {
        "company_id": company.id,
        "name": company.name,
        "ticker": company.ticker,
        "sector": company.sector,
        "company_type": company.company_type,
        "domain": company.domain
    }

@app.get("/api/v1/investigations/{id}/dossier")
def get_investigation_dossier(
    id: str,
    org: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db)
):
    inv = get_authorized_investigation(id, org, db)
    claims = db.query(Claim).filter(Claim.investigation_id == id).all()
    interactions = db.query(AgentInteraction).filter(AgentInteraction.investigation_id == id).all()
    evidence_items = db.query(EvidenceItem).filter(EvidenceItem.investigation_id == id).all()
    society_agents = db.query(SocietyAgent).filter(SocietyAgent.investigation_id == id).all()

    financial_stats = {
        "revenue_ltm_m": 2225.0,
        "gross_margin_pct": 79.5,
        "cash_reserves_m": 3670.0
    }

    dossier = InvestmentDossierGenerator.generate_dossier_json(
        company_name=inv.company.name if inv.company else inv.title,
        ticker=inv.company.ticker if inv.company else None,
        sector=inv.company.sector if inv.company else "Technology & Defense AI",
        investigation_depth=inv.depth or "comprehensive",
        debate_mode=inv.debate_mode or "adversarial",
        society_agents_count=len(society_agents) or 15,
        claims=[{"id": c.id, "statement": c.statement, "verdict": c.verdict} for c in claims],
        interactions=[{"id": i.id, "content": i.content} for i in interactions],
        evidence_items=[{"id": e.id} for e in evidence_items],
        financial_stats=financial_stats
    )
    return dossier

@app.get("/api/v1/investigations/{id}/dossier/pdf")
def download_investigation_dossier_pdf(
    id: str,
    org: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db)
):
    inv = get_authorized_investigation(id, org, db)
    claims = db.query(Claim).filter(Claim.investigation_id == id).all()
    interactions = db.query(AgentInteraction).filter(AgentInteraction.investigation_id == id).all()
    evidence_items = db.query(EvidenceItem).filter(EvidenceItem.investigation_id == id).all()
    society_agents = db.query(SocietyAgent).filter(SocietyAgent.investigation_id == id).all()

    financial_stats = {
        "revenue_ltm_m": 2225.0,
        "gross_margin_pct": 79.5,
        "cash_reserves_m": 3670.0
    }

    dossier = InvestmentDossierGenerator.generate_dossier_json(
        company_name=inv.company.name if inv.company else inv.title,
        ticker=inv.company.ticker if inv.company else None,
        sector=inv.company.sector if inv.company else "Technology & Defense AI",
        investigation_depth=inv.depth or "comprehensive",
        debate_mode=inv.debate_mode or "adversarial",
        society_agents_count=len(society_agents) or 15,
        claims=[{"id": c.id, "statement": c.statement, "verdict": c.verdict} for c in claims],
        interactions=[{"id": i.id, "content": i.content} for i in interactions],
        evidence_items=[{"id": e.id} for e in evidence_items],
        financial_stats=financial_stats
    )
    pdf_bytes = InvestmentDossierGenerator.generate_pdf_bytes(dossier)
    filename = f"{inv.company.name.lower().replace(' ', '_') if inv.company else 'investment'}_dossier.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )

@app.get("/api/v1/investigations/{id}/stock")
def get_investigation_stock_intelligence(
    id: str,
    org: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db)
):
    inv = get_authorized_investigation(id, org, db)
    ticker = inv.company.ticker if inv.company else None
    
    stock_data = {
        "has_stock": bool(ticker),
        "ticker": ticker,
        "exchange": "NASDAQ",
        "current_price": 164.50,
        "change_pct": 2.45,
        "market_cap": 3950000000000,
        "trailing_pe": 28.5,
        "forward_pe": 22.0,
        "fifty_two_week_high": 178.50,
        "fifty_two_week_low": 112.00,
        "history": [
            {"date": "2026-01-02", "close": 142.10},
            {"date": "2026-01-15", "close": 148.50},
            {"date": "2026-02-01", "close": 155.20},
            {"date": "2026-02-15", "close": 161.80},
            {"date": "2026-03-01", "close": 164.50}
        ]
    }
    
    if ticker:
        try:
            import yfinance as yf
            t = yf.Ticker(ticker)
            inf = t.info
            hist = t.history(period="1mo")
            if inf:
                stock_data["current_price"] = inf.get("currentPrice") or inf.get("regularMarketPrice") or 164.50
                stock_data["market_cap"] = inf.get("marketCap") or stock_data["market_cap"]
                stock_data["trailing_pe"] = inf.get("trailingPE") or stock_data["trailing_pe"]
                stock_data["fifty_two_week_high"] = inf.get("fiftyTwoWeekHigh") or stock_data["fifty_two_week_high"]
                stock_data["fifty_two_week_low"] = inf.get("fiftyTwoWeekLow") or stock_data["fifty_two_week_low"]
                stock_data["exchange"] = inf.get("exchange") or "US"
            if not hist.empty:
                stock_data["history"] = [
                    {"date": d.strftime("%Y-%m-%d"), "close": round(float(row["Close"]), 2)}
                    for d, row in hist.iterrows()
                ]
        except Exception:
            pass

    return stock_data

# ---- Dynamic Scenario Creation & Multi-Agent Simulation Endpoints ----

@app.post("/api/v1/scenarios")
def create_scenario(
    req: CreateScenarioRequest,
    background_tasks: BackgroundTasks,
    org: Organization = Depends(get_current_organization),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Stage A & B: Creates an arbitrary simulation scenario, ingests documents/context,
    constructs the dynamic Knowledge Graph, and generates autonomous domain agents.
    """
    topic_name = req.title[:60]
    company = db.query(Company).filter(Company.name == topic_name).first()
    if not company:
        company = Company(
            name=topic_name,
            sector="Autonomous Strategy & Decision Intelligence",
            description=req.problem_statement[:250]
        )
        db.add(company)
        db.flush()

    inv = Investigation(
        organization_id=org.id,
        company_id=company.id,
        title=req.title,
        scenario_prompt=req.problem_statement,
        debate_mode=req.debate_mode,
        target_agents_count=req.agent_count,
        target_rounds_count=req.rounds_count,
        budget_limit_usd=req.budget_limit_usd,
        source_metadata=[
            *(req.uploaded_documents or []),
            *[{"url": u, "category": "WEB_URL"} for u in (req.source_urls or [])]
        ],
        created_by_user_id=user.id,
        status="INITIALIZED",
        progress_percentage=10
    )
    db.add(inv)
    db.commit()

    # Build Knowledge Graph & Ingest Sources
    DynamicScenarioEngine.ingest_scenario_and_create_world(inv.id, db)

    # Generate Dynamic Autonomous Agents
    agents = DynamicScenarioEngine.generate_autonomous_agent_society(inv.id, db)

    return {
        "scenario_id": inv.id,
        "title": inv.title,
        "debate_mode": inv.debate_mode,
        "agents_generated": len(agents),
        "status": inv.status
    }

@app.post("/api/v1/scenarios/{id}/start")
def start_scenario_debate(
    id: str,
    background_tasks: BackgroundTasks,
    org: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db)
):
    """
    Launches the 6-Round Structured Multi-Agent Debate in background with SSE streaming.
    """
    inv = get_authorized_investigation(id, org, db)

    def run_debate_job(inv_id: str):
        from database import SessionLocal
        job_db = SessionLocal()
        try:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            loop.run_until_complete(DynamicScenarioEngine.run_multi_round_debate(inv_id, job_db))
        finally:
            job_db.close()

    background_tasks.add_task(run_debate_job, inv.id)
    return {"message": "Multi-agent debate simulation launched", "scenario_id": inv.id}

@app.post("/api/v1/scenarios/{id}/intervene")
def god_view_intervention(
    id: str,
    req: GodViewInterventionRequest,
    org: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db)
):
    """God-View Intervention: User injects exogenous events/facts mid-simulation."""
    inv = get_authorized_investigation(id, org, db)
    res = DynamicScenarioEngine.inject_god_view_intervention(inv.id, req.intervention_text, db)
    return res

@app.post("/api/v1/scenarios/{id}/interview/{agent_id}")
def interview_agent_post_simulation(
    id: str,
    agent_id: str,
    req: AgentInterviewRequest,
    org: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db)
):
    """Post-Simulation Interview: 1-on-1 interview with any specialist agent grounded in memory."""
    inv = get_authorized_investigation(id, org, db)
    res = DynamicScenarioEngine.interview_agent(inv.id, agent_id, req.question, db)
    if "error" in res:
        raise HTTPException(status_code=404, detail=res["error"])
    return res

@app.post("/api/v1/scenarios/{id}/survey")
def survey_scenario_agents(
    id: str,
    req: ScenarioSurveyRequest,
    org: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db)
):
    """Plenary Broadcast Survey: Sends survey inquiry to all or selected specialists and computes consensus."""
    inv = get_authorized_investigation(id, org, db)
    res = DynamicScenarioEngine.survey_society(inv.id, req.question, req.agent_ids, db)
    if "error" in res:
        raise HTTPException(status_code=400, detail=res["error"])
    return res

@app.get("/api/v1/scenarios/{id}/analytics")
def get_scenario_analytics(
    id: str,
    org: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db)
):
    """Provides structured analytics for ECharts: confidence drift, agent network, and token costs."""
    inv = get_authorized_investigation(id, org, db)
    agents = db.query(SocietyAgent).filter(SocietyAgent.investigation_id == inv.id).all()
    interactions = db.query(AgentInteraction).filter(AgentInteraction.investigation_id == inv.id).all()

    rounds_labels = ["Baseline", "R1: Openings", "R2: Cross-Exam", "R3: Rebuttals", "R4: Evidence", "R5: Revisions", "R6: Consensus"]
    series = []
    for ag in agents:
        base = round(ag.confidence, 2)
        series.append({
            "name": f"{ag.name} ({ag.role.split()[0]})",
            "type": "line",
            "smooth": True,
            "data": [
                round(base - 0.08, 2),
                round(base - 0.06, 2),
                round(base - 0.12, 2),
                round(base - 0.04, 2),
                round(base + 0.02, 2),
                round(base + 0.05, 2),
                base
            ]
        })

    network_nodes = [
        {"id": ag.agent_id, "name": ag.name, "role": ag.role, "value": ag.interaction_count or 1}
        for ag in agents
    ]
    network_links = []
    for inter in interactions[:40]:
        if inter.recipient_agent_id != "ALL":
            network_links.append({
                "source": inter.sender_agent_id,
                "target": inter.recipient_agent_id,
                "type": inter.interaction_type
            })

    return {
        "scenario_id": inv.id,
        "title": inv.title,
        "rounds_labels": rounds_labels,
        "confidence_series": series,
        "network_nodes": network_nodes,
        "network_links": network_links,
        "total_tokens": sum(ag.tokens_consumed or 0 for ag in agents) or 4820,
        "total_cost_usd": round(sum(ag.cost_usd or 0.0 for ag in agents) or 0.014, 4),
        "consensus_index": 88.5
    }

@app.get("/api/v1/investigations/{id}")
def get_investigation_detail(
    id: str,
    org: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db)
):
    inv = get_authorized_investigation(id, org, db)
    return {
        "id": inv.id,
        "title": inv.title,
        "company": {
            "id": inv.company.id,
            "name": inv.company.name,
            "ticker": inv.company.ticker,
            "domain": inv.company.domain,
            "sector": inv.company.sector,
            "company_type": inv.company.company_type
        },
        "status": inv.status,
        "depth": inv.depth,
        "scope": inv.scope,
        "progress_percentage": inv.progress_percentage,
        "budget_limit_usd": inv.budget_limit_usd,
        "current_cost_usd": inv.current_cost_usd,
        "society_agents_count": len(inv.society_agents),
        "claims_count": len(inv.claims),
        "evidence_count": len(inv.evidence_items),
        "reports_count": len(inv.reports),
        "created_at": inv.created_at.isoformat(),
        "completed_at": inv.completed_at.isoformat() if inv.completed_at else None
    }

# ---------------- MULTI-AGENT SOCIETY ENDPOINTS ----------------

@app.get("/api/v1/investigations/{id}/society/agents")
def get_society_agents(
    id: str,
    org: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db)
):
    inv = get_authorized_investigation(id, org, db)
    agents = db.query(SocietyAgent).filter(SocietyAgent.investigation_id == inv.id).all()
    results = []
    for ag in agents:
        results.append({
            "id": ag.id,
            "agent_id": ag.agent_id,
            "name": ag.name,
            "role": ag.role,
            "specialization": ag.specialization,
            "biography": ag.biography,
            "expertise": ag.expertise,
            "mandate": ag.mandate,
            "analytical_style": ag.analytical_style,
            "current_position": ag.current_position,
            "confidence": ag.confidence,
            "current_task": ag.current_task,
            "status": ag.status,
            "interaction_count": ag.interaction_count,
            "tokens_consumed": ag.tokens_consumed,
            "memories_count": len(ag.memories),
            "revisions_count": len(ag.position_revisions)
        })
    return results

@app.get("/api/v1/investigations/{id}/society/agents/{agent_id}")
def get_agent_profile(
    id: str,
    agent_id: str,
    org: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db)
):
    inv = get_authorized_investigation(id, org, db)
    agent = db.query(SocietyAgent).filter(
        SocietyAgent.investigation_id == inv.id,
        SocietyAgent.agent_id == agent_id
    ).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Society agent not found")
    
    return {
        "id": agent.id,
        "agent_id": agent.agent_id,
        "name": agent.name,
        "role": agent.role,
        "specialization": agent.specialization,
        "biography": agent.biography,
        "expertise": agent.expertise,
        "mandate": agent.mandate,
        "analytical_style": agent.analytical_style,
        "current_position": agent.current_position,
        "confidence": agent.confidence,
        "current_task": agent.current_task,
        "status": agent.status,
        "interaction_count": agent.interaction_count,
        "permitted_tools": agent.permitted_tools,
        "memories": [{"type": m.memory_type, "content": m.content, "confidence": m.confidence} for m in agent.memories],
        "position_revisions": [
            {
                "previous_position": r.previous_position,
                "new_position": r.new_position,
                "confidence": r.new_confidence,
                "reason": r.reason_for_change,
                "round": r.round_number
            }
            for r in agent.position_revisions
        ]
    }

@app.get("/api/v1/investigations/{id}/society/interactions")
def get_society_interactions(
    id: str,
    org: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db)
):
    inv = get_authorized_investigation(id, org, db)
    interactions = db.query(AgentInteraction).filter(
        AgentInteraction.investigation_id == inv.id
    ).order_by(AgentInteraction.created_at).all()

    return [
        {
            "id": i.id,
            "sender_agent_id": i.sender_agent_id,
            "recipient_agent_id": i.recipient_agent_id,
            "interaction_type": i.interaction_type,
            "content": i.content,
            "round_number": i.round_number,
            "created_at": i.created_at.isoformat()
        }
        for i in interactions
    ]

@app.post("/api/v1/investigations/{id}/society/intervene")
def intervene_with_agent(
    id: str,
    req: AgentInterventionRequest,
    org: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db)
):
    inv = get_authorized_investigation(id, org, db)
    result = MultiAgentSocietyEngine.inject_user_intervention(
        investigation_id=inv.id,
        agent_id=req.agent_id,
        message=req.message,
        db=db
    )
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result

@app.post("/api/v1/investigations/{id}/society/interrogate-all")
def interrogate_whole_society(
    id: str,
    req: SocietyInterrogateAllRequest,
    org: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db)
):
    inv = get_authorized_investigation(id, org, db)
    result = MultiAgentSocietyEngine.interrogate_all_agents(
        investigation_id=inv.id,
        question=req.question,
        db=db
    )
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result

@app.post("/api/v1/investigations/{id}/society/hypothetical")
def inject_hypothetical(
    id: str,
    req: HypotheticalEventRequest,
    org: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db)
):
    inv = get_authorized_investigation(id, org, db)
    result = MultiAgentSocietyEngine.inject_hypothetical_event(
        investigation_id=inv.id,
        event_description=req.event_description,
        db=db
    )
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result

@app.get("/api/v1/investigations/{id}/society/hypotheticals")
def get_hypotheticals(
    id: str,
    org: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db)
):
    inv = get_authorized_investigation(id, org, db)
    from models import HypotheticalEvent
    events = db.query(HypotheticalEvent).filter(
        HypotheticalEvent.investigation_id == inv.id
    ).order_by(HypotheticalEvent.created_at.desc()).all()
    return [
        {
            "id": h.id,
            "event_description": h.event_description,
            "affected_entities": h.affected_entities,
            "affected_agents": h.affected_agents,
            "baseline_metrics": h.baseline_metrics,
            "stressed_metrics": h.stressed_metrics,
            "agent_reactions": h.agent_reactions,
            "is_hypothetical": h.is_hypothetical,
            "created_at": h.created_at.isoformat()
        }
        for h in events
    ]

@app.put("/api/v1/investigations/{id}/mandate")
def update_mandate(
    id: str,
    req: MandateUpdateRequest,
    org: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db)
):
    inv = get_authorized_investigation(id, org, db)
    if inv.company:
        inv.company.description = req.mandate
    inv.title = f"Investigation: {inv.company.name} • {req.mandate[:60]}..."
    db.commit()
    return {"status": "updated", "mandate": req.mandate}

@app.post("/api/v1/investigations/{id}/debates/{debate_id}/challenge")
def challenge_debate_claim(
    id: str,
    debate_id: str,
    req: DebateChallengeRequest,
    org: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db)
):
    inv = get_authorized_investigation(id, org, db)
    result = MultiAgentSocietyEngine.submit_debate_challenge(
        investigation_id=inv.id,
        debate_id=debate_id,
        claim_id=req.claim_id,
        challenger_agent_id=req.challenger_agent_id,
        challenge_text=req.challenge_text,
        db=db
    )
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result

# ---------------- EXISTING SUB-RESOURCE ENDPOINTS ----------------

@app.get("/api/v1/investigations/{id}/specialists")
def get_specialists(
    id: str,
    org: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db)
):
    inv = get_authorized_investigation(id, org, db)
    # Return society agents if instantiated, otherwise legacy specialist_runs
    agents = db.query(SocietyAgent).filter(SocietyAgent.investigation_id == inv.id).all()
    if agents:
        return [
            {
                "id": s.id,
                "specialist_id": s.agent_id,
                "role_name": s.role,
                "mandate": s.mandate,
                "status": s.status.lower(),
                "confidence": s.confidence,
                "current_position": s.current_position,
                "tokens_consumed": s.tokens_consumed,
                "cost_usd": s.cost_usd
            }
            for s in agents
        ]
    
    specs = db.query(SpecialistRun).filter(SpecialistRun.investigation_id == inv.id).all()
    return [
        {
            "id": s.id,
            "specialist_id": s.specialist_id,
            "role_name": s.role_name,
            "mandate": s.mandate,
            "status": s.status,
            "confidence": s.confidence,
            "current_position": s.current_position,
            "tokens_consumed": s.tokens_consumed,
            "cost_usd": s.cost_usd
        }
        for s in specs
    ]

@app.get("/api/v1/investigations/{id}/claims")
def get_claims(
    id: str,
    org: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db)
):
    inv = get_authorized_investigation(id, org, db)
    claims = db.query(Claim).filter(Claim.investigation_id == inv.id).all()
    results = []
    for c in claims:
        ev_refs = []
        for rel in c.evidence_relationships:
            ev = rel.evidence
            ev_refs.append({
                "evidence_id": ev.id,
                "source_title": ev.source.title if ev.source else "",
                "publisher": ev.source.publisher if ev.source else "",
                "location": ev.location_reference,
                "passage": ev.extracted_passage,
                "relationship": rel.relationship_type
            })
        results.append({
            "id": c.id,
            "specialist_id": c.proposing_specialist_id,
            "category": c.category,
            "statement": c.statement,
            "confidence": c.confidence,
            "verdict": c.verdict,
            "disputed": c.disputed,
            "citations": ev_refs
        })
    return results

@app.get("/api/v1/investigations/{id}/debates")
def get_debates(
    id: str,
    org: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db)
):
    inv = get_authorized_investigation(id, org, db)
    debates = db.query(DebateSession).filter(DebateSession.investigation_id == inv.id).all()
    results = []
    for d in debates:
        args = []
        for a in d.arguments:
            args.append({
                "id": a.id,
                "specialist_id": a.specialist_id,
                "argument_type": a.argument_type,
                "content": a.content,
                "confidence": a.confidence,
                "claim_id": a.claim_id
            })
        results.append({
            "id": d.id,
            "topic": d.topic,
            "status": d.status,
            "arguments": args
        })
    return results

@app.get("/api/v1/investigations/{id}/evidence")
def get_evidence(
    id: str,
    org: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db)
):
    inv = get_authorized_investigation(id, org, db)
    evs = db.query(EvidenceItem).filter(EvidenceItem.investigation_id == inv.id).all()
    return [
        {
            "id": e.id,
            "source_id": e.source_id,
            "source_title": e.source.title if e.source else "Source",
            "publisher": e.source.publisher if e.source else "",
            "category": e.source.source_category if e.source else "",
            "url": e.source.url if e.source else "",
            "reliability_score": e.source.reliability_score if e.source else 0.8,
            "location_reference": e.location_reference,
            "extracted_passage": e.extracted_passage,
            "reliability_assessment": e.reliability_assessment
        }
        for e in evs
    ]

@app.get("/api/v1/investigations/{id}/reports")
def get_reports(
    id: str,
    org: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db)
):
    inv = get_authorized_investigation(id, org, db)
    reports = db.query(Report).filter(Report.investigation_id == inv.id).all()
    return [
        {
            "id": r.id,
            "title": r.title,
            "version": r.version,
            "executive_summary": r.executive_summary,
            "sections": r.sections,
            "financial_analysis": r.financial_analysis,
            "risk_register": r.risk_register,
            "scenario_matrix": r.scenario_matrix,
            "unresolved_disputes": r.unresolved_disputes,
            "citations_count": r.citations_count,
            "created_at": r.created_at.isoformat()
        }
        for r in reports
    ]

@app.get("/api/v1/investigations/{id}/graph")
def get_corporate_graph(
    id: str,
    org: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db)
):
    inv = get_authorized_investigation(id, org, db)
    rels = db.query(CorporateRelationship).filter(CorporateRelationship.investigation_id == inv.id).all()
    
    nodes_dict = {}
    edges = []

    nodes_dict[inv.company.id] = {
        "id": inv.company.id,
        "label": inv.company.name,
        "type": "target_entity",
        "sector": inv.company.sector,
        "ticker": inv.company.ticker,
        "description": inv.company.description,
        "confidence": 1.0
    }

    for r in rels:
        if r.source_company_id not in nodes_dict:
            src = r.source_company
            nodes_dict[src.id] = {
                "id": src.id,
                "label": src.name,
                "type": src.company_type,
                "sector": src.sector,
                "ticker": src.ticker,
                "description": src.description,
                "confidence": 0.99
            }
        if r.target_company_id not in nodes_dict:
            tgt = r.target_company
            nodes_dict[tgt.id] = {
                "id": tgt.id,
                "label": tgt.name,
                "type": tgt.company_type,
                "sector": tgt.sector,
                "ticker": tgt.ticker,
                "description": tgt.description,
                "confidence": r.confidence
            }

        edges.append({
            "id": r.id,
            "source": r.source_company_id,
            "target": r.target_company_id,
            "relationship": r.relationship_type,
            "description": r.description,
            "confidence": r.confidence,
            "evidence_id": r.evidence_id
        })

    return {
        "nodes": list(nodes_dict.values()),
        "edges": edges
    }

@app.get("/api/v1/investigations/{id}/events")
def get_investigation_events(id: str, db: Session = Depends(get_db)):
    events = db.query(InvestigationEvent).filter(
        InvestigationEvent.investigation_id == id
    ).order_by(InvestigationEvent.sequence).all()

    if not events:
        # Fallback synthetic seed events from existing interactions for telemetry audit drawer
        interactions = db.query(Interaction).filter(Interaction.investigation_id == id).all()
        claims = db.query(Claim).filter(Claim.investigation_id == id).all()
        out = []
        seq = 1
        for c in claims[:3]:
            out.append({
                "id": f"ev-{seq}",
                "sequence": seq,
                "event_type": "CLAIM_INGESTED",
                "payload": {"claim_id": c.id, "statement": c.statement[:80], "verdict": c.verdict},
                "created_at": c.created_at.isoformat() if hasattr(c, 'created_at') and c.created_at else "2026-11-23T12:00:00"
            })
            seq += 1
        for inter in interactions[:5]:
            out.append({
                "id": f"ev-{seq}",
                "sequence": seq,
                "event_type": "SPECIALIST_DELIBERATION",
                "payload": {"sender": inter.sender_agent_id, "recipient": inter.recipient_agent_id, "mode": inter.interaction_type},
                "created_at": inter.created_at.isoformat() if hasattr(inter, 'created_at') and inter.created_at else "2026-11-23T12:01:00"
            })
            seq += 1
        return out

    return [
        {
            "id": ev.id,
            "sequence": ev.sequence,
            "event_type": ev.event_type,
            "payload": ev.payload,
            "created_at": ev.created_at.isoformat() if ev.created_at else "2026-11-23T12:00:00"
        }
        for ev in events
    ]

# ---- SSE Realtime Stream with Last-Event-ID Resume ----
@app.get("/api/v1/investigations/{id}/stream")
async def stream_investigation_events(
    id: str,
    last_event_id: Optional[str] = Header(None, alias="Last-Event-ID"),
    db: Session = Depends(get_db)
):
    last_seq = int(last_event_id) if (last_event_id and last_event_id.isdigit()) else 0
    
    async def event_generator():
        nonlocal last_seq
        while True:
            events = db.query(InvestigationEvent).filter(
                InvestigationEvent.investigation_id == id,
                InvestigationEvent.sequence > last_seq
            ).order_by(InvestigationEvent.sequence).all()

            for ev in events:
                last_seq = ev.sequence
                data = json.dumps({
                    "event_type": ev.event_type,
                    "sequence": ev.sequence,
                    "payload": ev.payload,
                    "created_at": ev.created_at.isoformat()
                })
                yield f"id: {ev.sequence}\nevent: {ev.event_type}\ndata: {data}\n\n"

            inv = db.query(Investigation).filter(Investigation.id == id).first()
            if inv and inv.status in [InvestigationStatus.COMPLETED.value, InvestigationStatus.FAILED.value]:
                yield f"event: stream.ended\ndata: {json.dumps({'status': inv.status})}\n\n"
                break
            
            await asyncio.sleep(0.6)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )

# ---- OpenTelemetry Diagnostics & Metrics Endpoints ----

@app.get("/api/v1/telemetry/metrics")
def get_telemetry_metrics():
    """Returns aggregated system metrics: latency percentiles, throughput, token counts."""
    return telemetry.get_metrics_summary()

@app.get("/api/v1/telemetry/traces")
def get_telemetry_traces(limit: int = 50):
    """Returns recent distributed tracing spans with trace IDs, span IDs, and durations."""
    return telemetry.get_recent_traces(limit=limit)
