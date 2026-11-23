# MERIDIAN — Multi-Agent Society, Interaction & Simulation Architecture

## 1. Architectural Foundation & Inspiration
Inspired by the core concepts of **OASIS** (CAMEL-AI action spaces, structured interaction protocols, environment state propagation) and **MiroFish** (ontology-to-agent world construction, multi-persona interviews, graph memory), MERIDIAN has been architected as an institutional-grade company research society.

## 2. Three-Tier System Architecture
```
+-------------------------------------------------------------+
|                 Institutional Web Workspace                 |
|  - Agent Society Roster & Status Monitor (14 Specialists)   |
|  - Live Interaction Timeline (Peer Inquiries & Concessions) |
|  - Direct User Intervention & Interrogation Console         |
|  - Corporate Relationship Graph & Scenario Forecaster       |
+------------------------------+------------------------------+
                               | HTTP / SSE
                               v
+-------------------------------------------------------------+
|               FastAPI Society & Intelligence API            |
|  - 14 Typed Specialist Personas (CFA, CPA, Legal, Security) |
|  - Structured Interaction Protocol (ASK, CHALLENGE, CONCEDE)|
|  - 8-Round Simulation Scheduler & Orchestrator              |
|  - User Intervention Dispatcher & Grounded Agent Answering  |
+------------------------------+------------------------------+
                               |
                               v
+-------------------------------------------------------------+
|                 PostgreSQL Persistent Store                  |
|  - society_agents, agent_memories, position_revisions       |
|  - agent_interactions, corporate_relationships              |
|  - claims, debate_sessions, reports, investigation_events   |
+-------------------------------------------------------------+
```

## 3. The 14 Institutional Specialist Personas
1. **Chief Research Coordinator** (`chief_coordinator`): Dr. Aris Vance
2. **Principal Financial Analyst** (`financial_analyst`): Sarah Chen, CFA
3. **Senior Forensic Accountant** (`forensic_accountant`): Marcus Holst, CPA/CFF
4. **Industry & Market Specialist** (`market_analyst`): Elena Rostova
5. **Competitive Intelligence Director** (`competitive_analyst`): David Sterling
6. **Business Model & Monetization Strategist** (`business_model_analyst`): Priya Nair
7. **Principal Technology Analyst** (`technology_analyst`): Dr. Julian Thorne
8. **Corporate Governance Analyst** (`governance_analyst`): Claire Beauchamp
9. **Bull-Case Thesis Advocate** (`bull_analyst`): Lucas Vance
10. **Bear-Case Thesis Advocate** (`bear_analyst`): Vivian Graves
11. **Evidence Verification Specialist** (`evidence_verifier`): Inspector Jonathan Cole
12. **Chief Risk Officer Specialist** (`risk_analyst`): Arthur Pendelton
13. **Strategic Scenario Modeler** (`scenario_analyst`): Dr. Maya Lin
14. **Final Epistemic Adjudicator** (`final_adjudicator`): The Honourable Justice Simon Cross

## 4. Structured Interaction Protocol & Concession Mechanics
Agents communicate via typed messages: `MESSAGE`, `ASK`, `ANSWER`, `PROPOSE`, `CHALLENGE`, `REBUT`, `SUPPORT`, `CONTRADICT`, `REQUEST_EVIDENCE`, `SHARE_FINDING`, `CONCEDE`, `UPDATE_POSITION`, `ADJUDICATE`, and `USER_INTERVENTION`.
Position changes require an explicit triggering evidence reference and recorded rationale, stored immutably in `position_revisions`.
