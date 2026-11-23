import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import asyncio

from main import app
from database import get_db, Base
from models import User, Organization, Investigation, AdjudicationVerdict

SQLALCHEMY_DATABASE_URL = "sqlite:///./test_meridian_society.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

def test_multi_agent_society_and_intervention():
    # 1. Register User and Organization
    reg = client.post("/api/v1/auth/register", json={
        "email": "lead.investigator@meridian-intel.internal",
        "full_name": "Dr. Eleanor Vance",
        "password": "InstitutionalSecurePassword2026!",
        "organization_name": "Vance Global Intelligence"
    })
    assert reg.status_code == 200
    token = reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Create Investigation into Palantir (PLTR)
    create_res = client.post("/api/v1/investigations", headers=headers, json={
        "company_name": "Palantir Technologies",
        "ticker": "PLTR",
        "domain": "palantir.com",
        "company_type": "public",
        "sector": "Enterprise Software & Defense AI",
        "depth": "comprehensive",
        "budget_limit_usd": 300.0
    })
    assert create_res.status_code == 200
    inv_id = create_res.json()["investigation_id"]

    # 3. Execute 8-round multi-agent society pipeline
    from multi_agent_society_engine import MultiAgentSocietyEngine
    db = TestingSessionLocal()
    asyncio.run(MultiAgentSocietyEngine.run_full_society_pipeline(inv_id, db))
    db.close()

    # 4. Verify Society Agents Roster (14 distinct specialists)
    agents_res = client.get(f"/api/v1/investigations/{inv_id}/society/agents", headers=headers)
    assert agents_res.status_code == 200
    agents = agents_res.json()
    assert len(agents) == 14
    
    agent_ids = [ag["agent_id"] for ag in agents]
    assert "chief_coordinator" in agent_ids
    assert "financial_analyst" in agent_ids
    assert "forensic_accountant" in agent_ids
    assert "bull_analyst" in agent_ids
    assert "bear_analyst" in agent_ids
    assert "evidence_verifier" in agent_ids
    assert "final_adjudicator" in agent_ids

    # 5. Verify Persistent Interactions (Direct messaging, challenges, concessions)
    inter_res = client.get(f"/api/v1/investigations/{inv_id}/society/interactions", headers=headers)
    assert inter_res.status_code == 200
    interactions = inter_res.json()
    assert len(interactions) >= 6

    # Verify at least one CHALLENGE and one CONCEDE exists
    types = [i["interaction_type"] for i in interactions]
    assert "CHALLENGE" in types
    assert "CONCEDE" in types

    # 6. Verify Position Revision Tracking on Bull Analyst
    bull_prof_res = client.get(f"/api/v1/investigations/{inv_id}/society/agents/bull_analyst", headers=headers)
    assert bull_prof_res.status_code == 200
    bull_profile = bull_prof_res.json()
    assert len(bull_profile["position_revisions"]) >= 1
    assert "Conceded to Forensic Accountant" in bull_profile["position_revisions"][0]["reason"]

    # 7. Test User Intervention into Agent (Questioning Forensic Accountant)
    intervene_res = client.post(f"/api/v1/investigations/{inv_id}/society/intervene", headers=headers, json={
        "agent_id": "forensic_accountant",
        "message": "What is the primary risk if Palantir loses its largest government contract?"
    })
    assert intervene_res.status_code == 200
    data = intervene_res.json()
    assert "agent_reply" in data
    assert "Forensic Accountant" in data["agent_reply"] or "forensic" in data["agent_reply"].lower()

def test_financial_scenario_calculations():
    from research_provider import ScenarioForecaster
    scenarios = ScenarioForecaster.calculate_scenarios(
        rev=1000.0,
        gm=70.0,
        ocf=150.0,
        cash=500.0,
        conc=20.0
    )
    assert scenarios["base_case"]["projected_revenue_m"] == 1180.0
    assert scenarios["bull_case"]["projected_revenue_m"] == 1285.0
    assert scenarios["bear_case"]["projected_revenue_m"] == 1065.0
    assert scenarios["stress_case"]["projected_revenue_m"] == 880.0
