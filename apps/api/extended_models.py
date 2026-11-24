"""
MERIDIAN Autonomous Corporate Intelligence Models
Extends the core data model with:
1. Hypothesis & Competing Explanations Engine
2. Management Credibility & Guidance Tracker
3. Investment Thesis & Invalidation Conditions Engine
4. Corporate Knowledge Graph & Temporal Timeline Entities
5. Financial Anomaly & Discrepancy Detection
6. Continuous Monitoring Watchlists & Early-Warning Alerts
"""

import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Text, Float, Integer, Boolean, DateTime, ForeignKey, JSON
)
from sqlalchemy.orm import relationship
from database import Base

class CorporateHypothesis(Base):
    __tablename__ = "corporate_hypotheses"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    company_id = Column(String(36), ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    investigation_id = Column(String(36), ForeignKey("investigations.id", ondelete="CASCADE"), nullable=True, index=True)
    statement = Column(Text, nullable=False) # e.g. "Growth is driven by hyperscaler capex pull-forward rather than enterprise software adoption"
    category = Column(String(50), nullable=False) # demand_sustainability, margin_durability, technical_moat, accounting_quality, competitive_erosion
    originating_agent_role = Column(String(100), nullable=False)
    status = Column(String(50), default="evaluating") # supported, partially_supported, weakly_supported, contradicted, unresolved, not_assessable
    confidence_score = Column(Float, default=0.75) # 0.0 to 1.0
    supporting_evidence_ids = Column(JSON, default=list)
    contradictory_evidence_ids = Column(JSON, default=list)
    related_claim_ids = Column(JSON, default=list)
    research_questions = Column(JSON, default=list)
    adjudication_rationale = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    company = relationship("Company")
    investigation = relationship("Investigation")

class ManagementStatement(Base):
    __tablename__ = "management_statements"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    company_id = Column(String(36), ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    speaker_name = Column(String(150), nullable=False)
    speaker_role = Column(String(100), nullable=False) # CEO, CFO, COO
    verbatim_quote = Column(Text, nullable=False)
    source_document = Column(String(255), nullable=False) # Q3 2026 Earnings Call, FY2025 10-K
    source_url = Column(String(500), nullable=True)
    statement_date = Column(DateTime, nullable=False)
    statement_category = Column(String(50), nullable=False) # margin_guidance, capex_commitment, product_launch, debt_repayment, revenue_target
    target_metric = Column(String(100), nullable=False) # Gross Margin, Free Cash Flow, Shipment Timeline
    target_value = Column(String(100), nullable=True) # "75.0%", "$500M", "H2 2026"
    target_period = Column(String(50), nullable=True) # FY2026, Q4 2026
    actual_outcome = Column(Text, nullable=True)
    outcome_status = Column(String(50), default="pending") # achieved, partially_achieved, missed, revised, pending, not_assessable
    variance_percentage = Column(Float, nullable=True)
    credibility_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    company = relationship("Company")

class InvestmentThesis(Base):
    __tablename__ = "investment_theses"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    company_id = Column(String(36), ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    investigation_id = Column(String(36), ForeignKey("investigations.id", ondelete="CASCADE"), nullable=True, index=True)
    thesis_title = Column(String(255), nullable=False)
    core_thesis = Column(Text, nullable=False)
    time_horizon = Column(String(50), default="3-5 Years")
    conviction_status = Column(String(50), default="high_conviction") # high_conviction, neutral, weakened, invalidated
    key_assumptions = Column(JSON, default=list) # Critical assumptions required for thesis validity
    invalidation_triggers = Column(JSON, default=list) # Observable conditions that would disprove thesis
    supporting_claim_ids = Column(JSON, default=list)
    contrary_indicators_detected = Column(JSON, default=list)
    invalidation_score = Column(Float, default=0.15) # 0.0 (safe) to 1.0 (invalidated)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    company = relationship("Company")
    investigation = relationship("Investigation")

class CorporateEntityRelationship(Base):
    __tablename__ = "corporate_entity_relationships"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    source_entity_id = Column(String(36), ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    target_entity_name = Column(String(255), nullable=False)
    target_entity_ticker = Column(String(20), nullable=True)
    target_entity_category = Column(String(50), nullable=False) # supplier, customer, competitor, partner, subsidiary, regulator
    relationship_type = Column(String(50), nullable=False) # sole_source_supplier, hyperscaler_customer, direct_competitor, joint_venture, packaging_partner
    description = Column(Text, nullable=False)
    materiality = Column(String(50), default="high") # critical, high, medium, low
    verification_status = Column(String(50), default="verified_disclosure") # verified_disclosure, reported, inferred
    source_reference = Column(String(255), nullable=True)
    evidence_item_id = Column(String(36), ForeignKey("evidence_items.id", ondelete="SET NULL"), nullable=True)
    start_period = Column(String(50), nullable=True)
    end_period = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    source_company = relationship("Company", foreign_keys=[source_entity_id])
    evidence_item = relationship("EvidenceItem")

class FinancialAnomalyRecord(Base):
    __tablename__ = "financial_anomaly_records"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    company_id = Column(String(36), ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    anomaly_category = Column(String(50), nullable=False) # revenue_vs_receivables, cashflow_divergence, inventory_build, margin_decoupling, footnote_restatement
    affected_metrics = Column(JSON, default=list)
    severity = Column(String(50), default="high") # critical, high, moderate, low
    confidence_score = Column(Float, default=0.88)
    discrepancy_narrative = Column(Text, nullable=False)
    mathematical_proof = Column(Text, nullable=True) # Deterministic calculation trace
    detection_method = Column(String(100), default="deterministic_ratio_and_footnote_audit")
    source_citation = Column(String(255), nullable=True)
    resolution_status = Column(String(50), default="open") # open, investigated, explained_by_management, substantiated_discrepancy
    created_at = Column(DateTime, default=datetime.utcnow)

    company = relationship("Company")

class CompanyWatchlist(Base):
    __tablename__ = "company_watchlists"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    company_id = Column(String(36), ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    monitoring_scope = Column(JSON, default=lambda: ["sec_filings", "capex_commitments", "guidance_updates", "management_turnover"])
    alert_frequency = Column(String(50), default="immediate_material") # immediate_material, daily_digest, weekly_radar
    is_active = Column(Boolean, default=True)
    last_monitored_at = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

    organization = relationship("Organization")
    company = relationship("Company")

class EarlyWarningAlert(Base):
    __tablename__ = "early_warning_alerts"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    watchlist_id = Column(String(36), ForeignKey("company_watchlists.id", ondelete="CASCADE"), nullable=False, index=True)
    company_id = Column(String(36), ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    alert_title = Column(String(255), nullable=False)
    material_change_type = Column(String(50), nullable=False) # guidance_miss, unexpected_capex_jump, customer_churn_signal, export_restriction, auditor_departure
    impact_assessment = Column(Text, nullable=False)
    suggested_investigation_mandate = Column(Text, nullable=False)
    evidence_source_url = Column(String(500), nullable=True)
    is_dismissed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    watchlist = relationship("CompanyWatchlist")
    company = relationship("Company")
