import pytest
from fastapi.testclient import TestClient
from main import app
from database import SessionLocal
from models import Organization, Company, Investigation, InvestigationExecution
from provider_manager import ProviderManager
from durable_investigation_orchestrator import DurableInvestigationOrchestrator

client = TestClient(app)

def test_provider_status_and_diagnostic():
    response = client.get("/api/v1/providers/status")
    assert response.status_code == 200
    data = response.json()
    assert "providers" in data
    provider_ids = [p["id"] for p in data["providers"]]
    assert "openai" in provider_ids
    assert "anthropic" in provider_ids
    assert "gemini" in provider_ids
    assert "ollama" in provider_ids

    # Diagnostic ping test
    test_resp = client.post("/api/v1/providers/test", json={"provider_id": "ollama"})
    assert test_resp.status_code == 200
    test_data = test_resp.json()
    assert test_data["provider"] == "ollama"
    assert "latency_ms" in test_data
    assert "status" in test_data

def test_stage_gate_orchestration_lifecycle():
    db = SessionLocal()
    try:
        # Get or create company & investigation
        company = db.query(Company).filter(Company.name == "Palantir Technologies").first()
        if not company:
            company = Company(
                name="Palantir Technologies",
                ticker="PLTR",
                sector="Enterprise Software",
                description="Government & Enterprise AI Operating System"
            )
            db.add(company)
            db.commit()

        org = db.query(Organization).first()
        inv = db.query(Investigation).filter(Investigation.company_id == company.id).first()
        if not inv:
            inv = Investigation(
                organization_id=org.id,
                company_id=company.id,
                title="Palantir Forensic Audit",
                status="draft",
                scope=["financials", "competitive"]
            )
            db.add(inv)
            db.commit()

        # Step 1: Run fresh investigation with pause_at_gates=True
        execution = DurableInvestigationOrchestrator.execute_fresh_investigation(
            investigation_id=inv.id,
            db=db,
            model_name="gpt-4o-mini",
            pause_at_gates=True
        )

        assert execution.status == "awaiting_approval"
        assert execution.current_stage == "gate_01_research_complete"
        assert execution.progress_percentage == 45

        # Step 2: Advance Gate 1 -> Gate 2
        execution_gate_2 = DurableInvestigationOrchestrator.advance_execution_gate(
            execution_id=execution.id,
            db=db,
            target_gate="05_adversarial_debate",
            pause_at_next_gate=True
        )

        assert execution_gate_2.status == "awaiting_approval"
        assert execution_gate_2.current_stage == "gate_02_deliberation_complete"
        assert execution_gate_2.progress_percentage == 75

        # Step 3: Advance Gate 2 -> Final Synthesis
        execution_final = DurableInvestigationOrchestrator.advance_execution_gate(
            execution_id=execution_gate_2.id,
            db=db,
            target_gate="06_adjudication",
            pause_at_next_gate=False
        )

        assert execution_final.status == "completed"
        assert execution_final.current_stage == "07_manifest_finalization"
        assert execution_final.progress_percentage == 100

    finally:
        db.close()

def test_flagship_demo_advance_gate_endpoint():
    response = client.post("/api/v1/demo/flagship/advance-gate", json={
        "target_gate": "05_adversarial_debate",
        "pause_at_next_gate": True
    })
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "flagship_gate_advanced"
    assert "execution_id" in data
    assert "current_stage" in data
