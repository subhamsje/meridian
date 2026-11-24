import pytest
import asyncio
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../apps/api")))

from fastapi.testclient import TestClient
from database import get_db
from models import Investigation, Company, Organization, User, InvestigationExecution
from durable_investigation_orchestrator import DurableInvestigationOrchestrator

def test_investigation_execution_lifecycle_and_cancellation(client: TestClient, db_session):
    # 1. Register test user
    reg = client.post("/api/v1/auth/register", json={
        "email": "exec.director@meridian.internal",
        "full_name": "Director Marcus Vance",
        "password": "InstitutionalPassword2026!",
        "organization_name": "Vance Sovereign Analytics"
    })
    assert reg.status_code == 200
    token = reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Create investigation
    inv_res = client.post("/api/v1/investigations", headers=headers, json={
        "company_name": "Advanced Micro Devices, Inc.",
        "ticker": "AMD",
        "sector": "Semiconductors & Datacenter Accelerators",
        "company_type": "public",
        "depth": "comprehensive"
    })
    assert inv_res.status_code == 200
    inv_id = inv_res.json()["investigation_id"]

    # 3. Trigger execution
    exec_res = client.post(f"/api/v1/investigations/{inv_id}/executions", headers=headers, json={
        "model_name": "gpt-4o-mini",
        "run_async": False,
        "force_restart": True
    })
    assert exec_res.status_code == 200
    exec_data = exec_res.json()
    assert "execution_id" in exec_data or "id" in exec_data
    exec_id = exec_data.get("id") or exec_data.get("execution_id")

    # 4. List executions
    list_res = client.get(f"/api/v1/investigations/{inv_id}/executions", headers=headers)
    assert list_res.status_code == 200
    execs = list_res.json()
    assert len(execs) >= 1
    assert any(x["id"] == exec_id for x in execs)

    # 5. Cancel execution
    cancel_res = client.post(f"/api/v1/investigations/{inv_id}/executions/{exec_id}/cancel", headers=headers)
    assert cancel_res.status_code == 200
    assert cancel_res.json()["status"] == "cancelled"

    # 6. Verify 19-Section Investment Dossier
    dossier_res = client.get(f"/api/v1/investigations/{inv_id}/dossier", headers=headers)
    assert dossier_res.status_code == 200
    dossier = dossier_res.json()
    assert len(dossier["sections"]) == 19
    assert dossier["investment_decision"] is not None
    assert "0 primary documentary sources" not in dossier["investment_decision"]["overall_verdict"]
