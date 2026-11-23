import pytest

def test_flagship_demo_public_seeding_and_pipeline(client):
    # 1. Hit public /api/v1/demo/flagship endpoint
    demo_res = client.get("/api/v1/demo/flagship")
    assert demo_res.status_code == 200
    data = demo_res.json()
    assert "investigation_id" in data
    assert "access_token" in data
    assert data["company"]["ticker"] == "PLTR"
    assert len(data["seeds"]) >= 3

    inv_id = data["investigation_id"]
    token = data["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Stage 02: Verify Knowledge Graph extraction
    graph_res = client.get(f"/api/v1/investigations/{inv_id}/graph", headers=headers)
    assert graph_res.status_code == 200
    graph = graph_res.json()
    assert len(graph["nodes"]) >= 2
    assert len(graph["edges"]) >= 2

    # 3. Stage 03: Verify Society Roster (14 agents) & Interactions
    agents_res = client.get(f"/api/v1/investigations/{inv_id}/society/agents", headers=headers)
    assert agents_res.status_code == 200
    assert len(agents_res.json()) == 14

    inter_res = client.get(f"/api/v1/investigations/{inv_id}/society/interactions", headers=headers)
    assert inter_res.status_code == 200
    assert len(inter_res.json()) >= 6

    # 4. Stage 04: Verify Boardroom Debate Session
    debates_res = client.get(f"/api/v1/investigations/{inv_id}/debates", headers=headers)
    assert debates_res.status_code == 200
    assert len(debates_res.json()) >= 1

    # 5. Stage 05: Verify Intelligence Dossier
    reports_res = client.get(f"/api/v1/investigations/{inv_id}/reports", headers=headers)
    assert reports_res.status_code == 200
    reports = reports_res.json()
    assert len(reports) >= 1
    assert reports[0]["financial_analysis"]["revenue_usd_m"] == 2225.0
