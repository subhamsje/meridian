"""
MERIDIAN Extended Corporate Intelligence Test Suite
Tests:
1. Autonomous Research Director & Hypothesis Generation / Evaluation
2. Management Credibility & Guidance Variance Auditing
3. Investment Thesis Construction & Invalidation Trigger Scenarios
4. Corporate Entity Relationship Graph Extraction
5. Financial Anomaly & Discrepancy Auditing
"""

import pytest
import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), "..", "apps", "api"))
from models import Organization, Company, Investigation
from extended_models import (
    CorporateHypothesis, ManagementStatement, InvestmentThesis,
    CorporateEntityRelationship, FinancialAnomalyRecord
)

def seed_test_company(db):
    company = db.query(Company).filter(Company.ticker == "NVDA").first()
    if not company:
        company = Company(
            id="comp_nvda_test",
            name="NVIDIA Corporation",
            ticker="NVDA",
            sector="Semiconductor & AI Infrastructure",
            description="Accelerated computing architecture, datacenter silicon, and CUDA platform."
        )
        db.add(company)
        db.commit()
    return company

def test_autonomous_hypotheses_lifecycle(client, db_session):
    company = seed_test_company(db_session)
    response = client.get(f"/api/v1/companies/{company.id}/hypotheses")
    assert response.status_code == 200
    data = response.json()
    assert "hypotheses_count" in data
    assert data["hypotheses_count"] >= 4
    first_hypo = data["hypotheses"][0]
    assert "statement" in first_hypo
    assert "category" in first_hypo
    assert "status" in first_hypo
    assert len(first_hypo["research_questions"]) >= 1

def test_management_credibility_tracker(client, db_session):
    company = seed_test_company(db_session)
    response = client.get(f"/api/v1/companies/{company.id}/credibility")
    assert response.status_code == 200
    data = response.json()
    assert data["total_statements_tracked"] >= 3
    assert "guidance_accuracy_rate" in data
    assert 0.0 <= data["guidance_accuracy_rate"] <= 1.0
    assert "overall_credibility_assessment" in data
    assert len(data["statements"]) >= 3

def test_investment_thesis_and_invalidation_triggers(client, db_session):
    company = seed_test_company(db_session)
    response = client.get(f"/api/v1/companies/{company.id}/thesis")
    assert response.status_code == 200
    data = response.json()
    assert "core_thesis" in data
    assert "conviction_status" in data
    assert "invalidation_risk_score" in data
    assert len(data["key_assumptions"]) >= 3
    assert len(data["invalidation_triggers"]) >= 3

def test_corporate_relationship_graph_payload(client, db_session):
    company = seed_test_company(db_session)
    response = client.get(f"/api/v1/companies/{company.id}/graph")
    assert response.status_code == 200
    data = response.json()
    assert data["nodes_count"] >= 5
    assert data["edges_count"] >= 4
    assert any(n["category"] == "subject" for n in data["nodes"])
    assert any(e["relationship"] == "sole_source_supplier" for e in data["edges"])

def test_financial_anomaly_auditing(client, db_session):
    company = seed_test_company(db_session)
    response = client.get(f"/api/v1/companies/{company.id}/anomalies")
    assert response.status_code == 200
    data = response.json()
    assert data["anomalies_count"] >= 2
    first_anomaly = data["anomalies"][0]
    assert "category" in first_anomaly
    assert "discrepancy_narrative" in first_anomaly
    assert "mathematical_proof" in first_anomaly
    assert "source_citation" in first_anomaly
