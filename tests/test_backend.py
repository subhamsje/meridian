import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import asyncio

from main import app
from database import get_db, Base
from models import User, Organization, Investigation, AdjudicationVerdict

SQLALCHEMY_DATABASE_URL = "sqlite:///./test_meridian_suite.db"
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

def test_full_investigation_and_multi_tenant_isolation():
    # 1. Register Org A User
    reg_a = client.post("/api/v1/auth/register", json={
        "email": "analyst@vance-capital.internal",
        "full_name": "Eleanor Vance",
        "password": "SecurePasswordVance2026!",
        "organization_name": "Vance Strategic Intelligence"
    })
    assert reg_a.status_code == 200
    token_a = reg_a.json()["access_token"]
    headers_a = {"Authorization": f"Bearer {token_a}"}

    # 2. Register Org B User
    reg_b = client.post("/api/v1/auth/register", json={
        "email": "partner@blackstone.internal",
        "full_name": "Marcus Stone",
        "password": "SecurePasswordStone2026!",
        "organization_name": "Blackstone Quantitative"
    })
    assert reg_b.status_code == 200
    token_b = reg_b.json()["access_token"]
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # 3. Org A creates an investigation into Snowflake (SNOW)
    create_res = client.post("/api/v1/investigations", headers=headers_a, json={
        "company_name": "Snowflake Inc.",
        "ticker": "SNOW",
        "domain": "snowflake.com",
        "company_type": "public",
        "sector": "Cloud Data & AI Infrastructure",
        "depth": "comprehensive",
        "budget_limit_usd": 250.0
    })
    assert create_res.status_code == 200
    inv_id = create_res.json()["investigation_id"]

    # 4. Run pipeline
    from engine import run_investigation_pipeline
    db = TestingSessionLocal()
    asyncio.run(run_investigation_pipeline(inv_id, db))
    db.close()

    # 5. Org A can access investigation details & sub-resources
    detail_res = client.get(f"/api/v1/investigations/{inv_id}", headers=headers_a)
    assert detail_res.status_code == 200
    data = detail_res.json()
    assert data["status"] == "completed"
    assert data["company"]["ticker"] == "SNOW"

    specs_res = client.get(f"/api/v1/investigations/{inv_id}/specialists", headers=headers_a)
    assert specs_res.status_code == 200
    assert len(specs_res.json()) == 9

    claims_res = client.get(f"/api/v1/investigations/{inv_id}/claims", headers=headers_a)
    assert claims_res.status_code == 200
    assert len(claims_res.json()) >= 4

    reports_res = client.get(f"/api/v1/investigations/{inv_id}/reports", headers=headers_a)
    assert reports_res.status_code == 200
    rep = reports_res.json()[0]
    # Verify that SNOW benchmark numbers were applied rather than hardcoded static text
    assert rep["financial_analysis"]["revenue_usd_m"] == 2806.0
    assert rep["financial_analysis"]["gross_margin_pct"] == 67.8
    assert "scenario_matrix" in rep
    assert "bull_case" in rep["scenario_matrix"]

    # 6. SECURITY AUDIT: Org B attempts to access Org A's investigation (Should receive 404/Forbidden)
    unauthorized_detail = client.get(f"/api/v1/investigations/{inv_id}", headers=headers_b)
    assert unauthorized_detail.status_code == 404

    unauthorized_claims = client.get(f"/api/v1/investigations/{inv_id}/claims", headers=headers_b)
    assert unauthorized_claims.status_code == 404

    unauthorized_reports = client.get(f"/api/v1/investigations/{inv_id}/reports", headers=headers_b)
    assert unauthorized_reports.status_code == 404

    unauthorized_evidence = client.get(f"/api/v1/investigations/{inv_id}/evidence", headers=headers_b)
    assert unauthorized_evidence.status_code == 404

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
