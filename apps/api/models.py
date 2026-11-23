import uuid
from datetime import datetime
from enum import Enum
from typing import Optional, List, Dict, Any
from sqlalchemy import (
    Column, String, Text, Integer, Float, Boolean, DateTime, ForeignKey, JSON
)
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class UserRole(str, Enum):
    ADMIN = "admin"
    LEAD_INVESTIGATOR = "lead_investigator"
    ANALYST = "analyst"
    VIEWER = "viewer"

class InvestigationStatus(str, Enum):
    DRAFT = "draft"
    SCHEDULED = "scheduled"
    IN_PROGRESS = "in_progress"
    PAUSED = "paused"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class AdjudicationVerdict(str, Enum):
    SUPPORTED = "supported"
    PARTIALLY_SUPPORTED = "partially_supported"
    CONTRADICTED = "contradicted"
    UNVERIFIED = "unverified"
    INCONCLUSIVE = "inconclusive"

class User(Base):
    __tablename__ = "users"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, nullable=False, index=True)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    memberships = relationship("OrganizationMember", back_populates="user", cascade="all, delete-orphan")

class Organization(Base):
    __tablename__ = "organizations"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
    slug = Column(String(100), unique=True, nullable=False, index=True)
    tier = Column(String(50), default="institutional")
    created_at = Column(DateTime, default=datetime.utcnow)

    members = relationship("OrganizationMember", back_populates="organization", cascade="all, delete-orphan")
    investigations = relationship("Investigation", back_populates="organization", cascade="all, delete-orphan")

class OrganizationMember(Base):
    __tablename__ = "organization_members"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    role = Column(String(50), default=UserRole.ANALYST.value)
    joined_at = Column(DateTime, default=datetime.utcnow)

    organization = relationship("Organization", back_populates="members")
    user = relationship("User", back_populates="memberships")

class Company(Base):
    __tablename__ = "companies"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False, index=True)
    ticker = Column(String(50), nullable=True, index=True)
    domain = Column(String(255), nullable=True, index=True)
    legal_name = Column(String(255), nullable=True)
    jurisdiction = Column(String(100), nullable=True)
    company_type = Column(String(50), default="private")
    sector = Column(String(100), nullable=True)
    headquarters = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    investigations = relationship("Investigation", back_populates="company")
    relationships_as_source = relationship("CorporateRelationship", foreign_keys="CorporateRelationship.source_company_id", back_populates="source_company")
    relationships_as_target = relationship("CorporateRelationship", foreign_keys="CorporateRelationship.target_company_id", back_populates="target_company")

class CorporateRelationship(Base):
    __tablename__ = "corporate_relationships"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    investigation_id = Column(String(36), ForeignKey("investigations.id", ondelete="CASCADE"), nullable=False, index=True)
    source_company_id = Column(String(36), ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    target_company_id = Column(String(36), ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    relationship_type = Column(String(50), nullable=False)
    description = Column(Text, nullable=True)
    evidence_id = Column(String(36), ForeignKey("evidence_items.id", ondelete="SET NULL"), nullable=True)
    confidence = Column(Float, default=0.90)
    created_at = Column(DateTime, default=datetime.utcnow)

    investigation = relationship("Investigation", back_populates="corporate_relationships")
    source_company = relationship("Company", foreign_keys=[source_company_id], back_populates="relationships_as_source")
    target_company = relationship("Company", foreign_keys=[target_company_id], back_populates="relationships_as_target")

class Investigation(Base):
    __tablename__ = "investigations"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    company_id = Column(String(36), ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    status = Column(String(50), default=InvestigationStatus.DRAFT.value, index=True)
    depth = Column(String(50), default="comprehensive")
    scope = Column(JSON, default=list)
    budget_limit_usd = Column(Float, default=150.0)
    current_cost_usd = Column(Float, default=0.0)
    time_limit_minutes = Column(Integer, default=60)
    progress_percentage = Column(Integer, default=0)
    scenario_prompt = Column(Text, nullable=True)
    debate_mode = Column(String(50), default="adversarial")
    target_agents_count = Column(Integer, default=6)
    target_rounds_count = Column(Integer, default=6)
    simulation_state = Column(JSON, default=dict)
    source_metadata = Column(JSON, default=list)
    created_by_user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    organization = relationship("Organization", back_populates="investigations")
    company = relationship("Company", back_populates="investigations")
    specialists = relationship("SpecialistRun", back_populates="investigation", cascade="all, delete-orphan")
    claims = relationship("Claim", back_populates="investigation", cascade="all, delete-orphan")
    evidence_items = relationship("EvidenceItem", back_populates="investigation", cascade="all, delete-orphan")
    debates = relationship("DebateSession", back_populates="investigation", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="investigation", cascade="all, delete-orphan")
    events = relationship("InvestigationEvent", back_populates="investigation", cascade="all, delete-orphan")
    corporate_relationships = relationship("CorporateRelationship", back_populates="investigation", cascade="all, delete-orphan")
    
    # Multi-Agent Society links
    society_agents = relationship("SocietyAgent", back_populates="investigation", cascade="all, delete-orphan")
    interactions = relationship("AgentInteraction", back_populates="investigation", cascade="all, delete-orphan")
    simulation_runs = relationship("SimulationRun", back_populates="investigation", cascade="all, delete-orphan")
    hypothetical_events = relationship("HypotheticalEvent", back_populates="investigation", cascade="all, delete-orphan")

class SpecialistRun(Base):
    __tablename__ = "specialist_runs"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    investigation_id = Column(String(36), ForeignKey("investigations.id", ondelete="CASCADE"), nullable=False, index=True)
    specialist_id = Column(String(100), nullable=False)
    role_name = Column(String(100), nullable=False)
    status = Column(String(50), default="idle")
    confidence = Column(Float, default=0.0)
    current_position = Column(Text, nullable=True)
    mandate = Column(Text, nullable=True)
    tokens_consumed = Column(Integer, default=0)
    cost_usd = Column(Float, default=0.0)
    findings = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    investigation = relationship("Investigation", back_populates="specialists")

# ----------------- MULTI-AGENT SOCIETY ENTITIES -----------------

class SocietyAgent(Base):
    __tablename__ = "society_agents"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    investigation_id = Column(String(36), ForeignKey("investigations.id", ondelete="CASCADE"), nullable=False, index=True)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    agent_id = Column(String(100), nullable=False) # e.g. "financial_analyst", "forensic_accountant"
    name = Column(String(100), nullable=False)
    role = Column(String(100), nullable=False)
    specialization = Column(String(255), nullable=True)
    biography = Column(Text, nullable=True)
    expertise = Column(JSON, default=list)
    mandate = Column(Text, nullable=False)
    analytical_style = Column(String(100), default="empirical_rigorous")
    initial_position = Column(Text, nullable=True)
    current_position = Column(Text, nullable=True)
    confidence = Column(Float, default=0.75)
    assumptions = Column(JSON, default=list)
    active_hypotheses = Column(JSON, default=list)
    permitted_tools = Column(JSON, default=list)
    current_task = Column(String(255), nullable=True)
    status = Column(String(50), default="IDLE") # IDLE, RESEARCHING, IN_DEBATE, AWAITING_EVIDENCE, COMPLETED
    interaction_count = Column(Integer, default=0)
    tokens_consumed = Column(Integer, default=0)
    cost_usd = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    investigation = relationship("Investigation", back_populates="society_agents")
    memories = relationship("AgentMemory", back_populates="agent", cascade="all, delete-orphan")
    position_revisions = relationship("PositionRevision", back_populates="agent", cascade="all, delete-orphan")

class AgentMemory(Base):
    __tablename__ = "agent_memories"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    agent_id = Column(String(36), ForeignKey("society_agents.id", ondelete="CASCADE"), nullable=False, index=True)
    memory_type = Column(String(50), nullable=False) # finding, objection, concession, peer_insight, evidence_provenance
    content = Column(Text, nullable=False)
    source_entity = Column(String(255), nullable=True)
    confidence = Column(Float, default=0.85)
    created_at = Column(DateTime, default=datetime.utcnow)

    agent = relationship("SocietyAgent", back_populates="memories")

class PositionRevision(Base):
    __tablename__ = "position_revisions"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    agent_id = Column(String(36), ForeignKey("society_agents.id", ondelete="CASCADE"), nullable=False, index=True)
    previous_position = Column(Text, nullable=True)
    new_position = Column(Text, nullable=False)
    previous_confidence = Column(Float, default=0.7)
    new_confidence = Column(Float, default=0.8)
    triggering_evidence_id = Column(String(36), ForeignKey("evidence_items.id", ondelete="SET NULL"), nullable=True)
    reason_for_change = Column(Text, nullable=False)
    round_number = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    agent = relationship("SocietyAgent", back_populates="position_revisions")

class AgentInteraction(Base):
    __tablename__ = "agent_interactions"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    investigation_id = Column(String(36), ForeignKey("investigations.id", ondelete="CASCADE"), nullable=False, index=True)
    sender_agent_id = Column(String(100), nullable=False) # e.g. "financial_analyst" or "user"
    recipient_agent_id = Column(String(100), nullable=False) # e.g. "forensic_accountant" or "ALL"
    interaction_type = Column(String(50), nullable=False) # MESSAGE, ASK, CHALLENGE, REBUT, CONCEDE, etc.
    content = Column(Text, nullable=False)
    referenced_claim_id = Column(String(36), ForeignKey("claims.id", ondelete="SET NULL"), nullable=True)
    referenced_evidence_id = Column(String(36), ForeignKey("evidence_items.id", ondelete="SET NULL"), nullable=True)
    round_number = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    investigation = relationship("Investigation", back_populates="interactions")

class SimulationRun(Base):
    __tablename__ = "simulation_runs"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    investigation_id = Column(String(36), ForeignKey("investigations.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    scenario_description = Column(Text, nullable=False)
    status = Column(String(50), default="INITIALIZED") # INITIALIZED, RUNNING, PAUSED, COMPLETED
    current_round = Column(Integer, default=0)
    total_rounds = Column(Integer, default=6)
    injected_events = Column(JSON, default=list) # [{round: 1, event: "Competitor drops prices by 30%"}]
    outcomes = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    investigation = relationship("Investigation", back_populates="simulation_runs")

class HypotheticalEvent(Base):
    __tablename__ = "hypothetical_events"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    investigation_id = Column(String(36), ForeignKey("investigations.id", ondelete="CASCADE"), nullable=False, index=True)
    event_description = Column(Text, nullable=False)
    affected_entities = Column(JSON, default=list)
    affected_agents = Column(JSON, default=list)
    baseline_metrics = Column(JSON, default=dict)
    stressed_metrics = Column(JSON, default=dict)
    agent_reactions = Column(JSON, default=list)
    is_hypothetical = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    investigation = relationship("Investigation", back_populates="hypothetical_events")

# ----------------- END MULTI-AGENT SOCIETY ENTITIES -----------------

class Source(Base):
    __tablename__ = "sources"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    url = Column(String(1024), nullable=True)
    publisher = Column(String(255), nullable=False)
    publication_date = Column(String(100), nullable=True)
    retrieval_date = Column(DateTime, default=datetime.utcnow)
    source_category = Column(String(100), default="public_filing")
    reliability_score = Column(Float, default=0.85)
    checksum = Column(String(64), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    evidence_items = relationship("EvidenceItem", back_populates="source")

class EvidenceItem(Base):
    __tablename__ = "evidence_items"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    investigation_id = Column(String(36), ForeignKey("investigations.id", ondelete="CASCADE"), nullable=False, index=True)
    source_id = Column(String(36), ForeignKey("sources.id", ondelete="CASCADE"), nullable=False, index=True)
    location_reference = Column(String(255), nullable=True)
    extracted_passage = Column(Text, nullable=False)
    is_verified = Column(Boolean, default=True)
    reliability_assessment = Column(Text, nullable=True)
    extraction_method = Column(String(50), default="structured_ingestion")
    created_at = Column(DateTime, default=datetime.utcnow)

    investigation = relationship("Investigation", back_populates="evidence_items")
    source = relationship("Source", back_populates="evidence_items")
    claim_relationships = relationship("EvidenceClaimRelationship", back_populates="evidence")

class Claim(Base):
    __tablename__ = "claims"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    investigation_id = Column(String(36), ForeignKey("investigations.id", ondelete="CASCADE"), nullable=False, index=True)
    proposing_specialist_id = Column(String(100), nullable=False)
    category = Column(String(100), nullable=False)
    statement = Column(Text, nullable=False)
    confidence = Column(Float, default=0.7)
    verdict = Column(String(50), default=AdjudicationVerdict.UNVERIFIED.value)
    disputed = Column(Boolean, default=False)
    adjudication_rationale = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    investigation = relationship("Investigation", back_populates="claims")
    evidence_relationships = relationship("EvidenceClaimRelationship", back_populates="claim")
    arguments = relationship("DebateArgument", back_populates="claim")

class EvidenceClaimRelationship(Base):
    __tablename__ = "evidence_claim_relationships"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    claim_id = Column(String(36), ForeignKey("claims.id", ondelete="CASCADE"), nullable=False)
    evidence_id = Column(String(36), ForeignKey("evidence_items.id", ondelete="CASCADE"), nullable=False)
    relationship_type = Column(String(50), default="supporting")

    claim = relationship("Claim", back_populates="evidence_relationships")
    evidence = relationship("EvidenceItem", back_populates="claim_relationships")

class DebateSession(Base):
    __tablename__ = "debate_sessions"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    investigation_id = Column(String(36), ForeignKey("investigations.id", ondelete="CASCADE"), nullable=False, index=True)
    topic = Column(String(255), nullable=False)
    status = Column(String(50), default="active")
    created_at = Column(DateTime, default=datetime.utcnow)

    investigation = relationship("Investigation", back_populates="debates")
    arguments = relationship("DebateArgument", back_populates="debate", cascade="all, delete-orphan")

class DebateArgument(Base):
    __tablename__ = "debate_arguments"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    debate_id = Column(String(36), ForeignKey("debate_sessions.id", ondelete="CASCADE"), nullable=False)
    claim_id = Column(String(36), ForeignKey("claims.id", ondelete="SET NULL"), nullable=True)
    specialist_id = Column(String(100), nullable=False)
    argument_type = Column(String(50), nullable=False)
    content = Column(Text, nullable=False)
    evidence_ids = Column(JSON, default=list)
    confidence = Column(Float, default=0.7)
    created_at = Column(DateTime, default=datetime.utcnow)

    debate = relationship("DebateSession", back_populates="arguments")
    claim = relationship("Claim", back_populates="arguments")

class Report(Base):
    __tablename__ = "reports"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    investigation_id = Column(String(36), ForeignKey("investigations.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    version = Column(Integer, default=1)
    executive_summary = Column(Text, nullable=False)
    sections = Column(JSON, default=list)
    financial_analysis = Column(JSON, default=dict)
    risk_register = Column(JSON, default=list)
    scenario_matrix = Column(JSON, default=dict)
    unresolved_disputes = Column(JSON, default=list)
    citations_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    investigation = relationship("Investigation", back_populates="reports")

class InvestigationEvent(Base):
    __tablename__ = "investigation_events"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    investigation_id = Column(String(36), ForeignKey("investigations.id", ondelete="CASCADE"), nullable=False, index=True)
    event_type = Column(String(100), nullable=False)
    sequence = Column(Integer, default=1)
    payload = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)

    investigation = relationship("Investigation", back_populates="events")
