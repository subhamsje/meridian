import asyncio
import json
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, Depends, HTTPException, status, BackgroundTasks, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
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
    scope: List[str] = ["corporate_identity", "financials", "competitive", "market", "risks", "scenarios"]
    budget_limit_usd: float = 150.0

class AgentInterventionRequest(BaseModel):
    agent_id: str
    message: str

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
        scope=req.scope,
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
        "ticker": inv.company.ticker
    }

    for r in rels:
        if r.source_company_id not in nodes_dict:
            src = r.source_company
            nodes_dict[src.id] = {
                "id": src.id,
                "label": src.name,
                "type": src.company_type,
                "sector": src.sector,
                "ticker": src.ticker
            }
        if r.target_company_id not in nodes_dict:
            tgt = r.target_company
            nodes_dict[tgt.id] = {
                "id": tgt.id,
                "label": tgt.name,
                "type": tgt.company_type,
                "sector": tgt.sector,
                "ticker": tgt.ticker
            }

        edges.append({
            "id": r.id,
            "source": r.source_company_id,
            "target": r.target_company_id,
            "relationship": r.relationship_type,
            "description": r.description,
            "confidence": r.confidence
        })

    return {
        "nodes": list(nodes_dict.values()),
        "edges": edges
    }

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
