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
    company_type = Column(String(50), default="private") # public, private, startup
    sector = Column(String(100), nullable=True)
    headquarters = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    investigations = relationship("Investigation", back_populates="company")

class Investigation(Base):
    __tablename__ = "investigations"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    company_id = Column(String(36), ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    status = Column(String(50), default=InvestigationStatus.DRAFT.value, index=True)
    depth = Column(String(50), default="comprehensive") # rapid, standard, comprehensive, forensic
    scope = Column(JSON, default=list) # List of categories: ["corporate_identity", "financials", "competitive", "market", "risks", "scenarios"]
    budget_limit_usd = Column(Float, default=150.0)
    current_cost_usd = Column(Float, default=0.0)
    time_limit_minutes = Column(Integer, default=60)
    progress_percentage = Column(Integer, default=0)
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

class SpecialistRun(Base):
    __tablename__ = "specialist_runs"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    investigation_id = Column(String(36), ForeignKey("investigations.id", ondelete="CASCADE"), nullable=False, index=True)
    specialist_id = Column(String(100), nullable=False) # e.g. "financial_analyst"
    role_name = Column(String(100), nullable=False)
    status = Column(String(50), default="idle") # idle, running, completed, disputed, conceded
    confidence = Column(Float, default=0.0)
    current_position = Column(Text, nullable=True)
    mandate = Column(Text, nullable=True)
    tokens_consumed = Column(Integer, default=0)
    cost_usd = Column(Float, default=0.0)
    findings = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    investigation = relationship("Investigation", back_populates="specialists")

class Source(Base):
    __tablename__ = "sources"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    url = Column(String(1024), nullable=True)
    publisher = Column(String(255), nullable=False)
    publication_date = Column(String(100), nullable=True)
    retrieval_date = Column(DateTime, default=datetime.utcnow)
    source_category = Column(String(100), default="public_filing") # sec_filing, news, registry, company_disclosure, market_data
    reliability_score = Column(Float, default=0.85) # 0.0 - 1.0 based on institutional authority
    checksum = Column(String(64), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    evidence_items = relationship("EvidenceItem", back_populates="source")

class EvidenceItem(Base):
    __tablename__ = "evidence_items"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    investigation_id = Column(String(36), ForeignKey("investigations.id", ondelete="CASCADE"), nullable=False, index=True)
    source_id = Column(String(36), ForeignKey("sources.id", ondelete="CASCADE"), nullable=False, index=True)
    location_reference = Column(String(255), nullable=True) # Page 12, Item 7, Section 3.2
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
    category = Column(String(100), nullable=False) # financial, competitive, governance, legal, risk
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
    relationship_type = Column(String(50), default="supporting") # supporting, contradicting, context

    claim = relationship("Claim", back_populates="evidence_relationships")
    evidence = relationship("EvidenceItem", back_populates="claim_relationships")

class DebateSession(Base):
    __tablename__ = "debate_sessions"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    investigation_id = Column(String(36), ForeignKey("investigations.id", ondelete="CASCADE"), nullable=False, index=True)
    topic = Column(String(255), nullable=False)
    status = Column(String(50), default="active") # active, resolved, stalemate
    created_at = Column(DateTime, default=datetime.utcnow)

    investigation = relationship("Investigation", back_populates="debates")
    arguments = relationship("DebateArgument", back_populates="debate", cascade="all, delete-orphan")

class DebateArgument(Base):
    __tablename__ = "debate_arguments"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    debate_id = Column(String(36), ForeignKey("debate_sessions.id", ondelete="CASCADE"), nullable=False)
    claim_id = Column(String(36), ForeignKey("claims.id", ondelete="SET NULL"), nullable=True)
    specialist_id = Column(String(100), nullable=False)
    argument_type = Column(String(50), nullable=False) # assertion, challenge, rebuttal, concession
    content = Column(Text, nullable=False)
    evidence_ids = Column(JSON, default=list) # Array of evidence item IDs cited
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
