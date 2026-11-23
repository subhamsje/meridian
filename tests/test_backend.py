import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import asyncio

from main import app
from database import get_db, Base
from models import User, Organization, Investigation, AdjudicationVerdict

SQLALCHEMY_DATABASE_URL = "sqlite:///./test_meridian.db"
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

def test_full_investigation_lifecycle():
    # 1. Register user & org
    reg_res = client.post("/api/v1/auth/register", json={
        "email": "investigator@blackstone-partners.internal",
        "full_name": "Eleanor Vance",
        "password": "InstitutionalSecurePassword2026!",
        "organization_name": "Vance Strategic Intelligence"
    })
    assert reg_res.status_code == 200
    token = reg_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Verify /auth/me
    me_res = client.get("/api/v1/auth/me", headers=headers)
    assert me_res.status_code == 200
    assert me_res.json()["email"] == "investigator@blackstone-partners.internal"

    # 3. Create Investigation
    create_res = client.post("/api/v1/investigations", headers=headers, json={
        "company_name": "Palantir Technologies",
        "ticker": "PLTR",
        "domain": "palantir.com",
        "company_type": "public",
        "sector": "Enterprise Software & Defense",
        "depth": "comprehensive",
        "budget_limit_usd": 250.0
    })
    assert create_res.status_code == 200
    inv_id = create_res.json()["investigation_id"]

    # 4. Trigger synchronous simulation for verification test
    from engine import run_investigation_pipeline
    db = TestingSessionLocal()
    asyncio.run(run_investigation_pipeline(inv_id, db))
    db.close()

    # 5. Verify Investigation Detail
    detail_res = client.get(f"/api/v1/investigations/{inv_id}", headers=headers)
    assert detail_res.status_code == 200
    data = detail_res.json()
    assert data["status"] == "completed"
    assert data["progress_percentage"] == 100
    assert data["specialists_count"] == 9
    assert data["claims_count"] >= 4
    assert data["evidence_count"] >= 3

    # 6. Verify Specialists
    specs_res = client.get(f"/api/v1/investigations/{inv_id}/specialists", headers=headers)
    assert specs_res.status_code == 200
    assert len(specs_res.json()) == 9

    # 7. Verify Claims with Evidence Citations
    claims_res = client.get(f"/api/v1/investigations/{inv_id}/claims", headers=headers)
    assert claims_res.status_code == 200
    claims = claims_res.json()
    assert len(claims) >= 4
    for c in claims:
        assert "citations" in c
        assert len(c["citations"]) > 0

    # 8. Verify Debates
    debates_res = client.get(f"/api/v1/investigations/{inv_id}/debates", headers=headers)
    assert debates_res.status_code == 200
    debates = debates_res.json()
    assert len(debates) >= 1
    assert len(debates[0]["arguments"]) >= 5

    # 9. Verify Reports
    reports_res = client.get(f"/api/v1/investigations/{inv_id}/reports", headers=headers)
    assert reports_res.status_code == 200
    reports = reports_res.json()
    assert len(reports) >= 1
    assert reports[0]["financial_analysis"]["gross_margin_pct"] == 72.4
