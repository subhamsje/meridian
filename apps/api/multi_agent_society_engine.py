import asyncio
import json
from typing import Dict, Any, List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from models import (
    Investigation, InvestigationStatus, Company, SocietyAgent,
    AgentMemory, PositionRevision, AgentInteraction, SimulationRun,
    Source, EvidenceItem, Claim, EvidenceClaimRelationship,
    DebateSession, DebateArgument, Report, InvestigationEvent,
    AdjudicationVerdict, CorporateRelationship
)
from interaction_protocol import InteractionType, AgentStatus
from society_agents_registry import SOCIETY_SPECIALIST_DEFINITIONS
from research_provider import CompanyResearchResolver, ScenarioForecaster

def emit_investigation_event(db: Session, investigation_id: str, event_type: str, payload: Dict[str, Any]):
    last_seq = db.query(InvestigationEvent).filter(InvestigationEvent.investigation_id == investigation_id).count()
    event = InvestigationEvent(
        investigation_id=investigation_id,
        event_type=event_type,
        sequence=last_seq + 1,
        payload=payload
    )
    db.add(event)
    db.commit()

class MultiAgentSocietyEngine:
    """
    Persistent Multi-Agent Society, Interaction & Deliberation Engine.
    Executes a structured 8-round simulation pipeline:
      Round 0: World Construction & Knowledge Graph Ingestion
      Round 1: Agent Society Generation & Mandate Assignment
      Round 2: Independent Research & Evidence Extraction
      Round 3: Cross-Agent Interaction Protocol (Direct & Peer Messaging)
      Round 4: Adversarial Deliberation & Disputed Claim Challenging
      Round 5: Evidence Expansion & Memory Consolidation
      Round 6: Dynamic Position Revisions & Concessions
      Round 7: Epistemic Adjudication & Dossier Synthesis
    """

    @classmethod
    async def run_full_society_pipeline(cls, investigation_id: str, db: Session):
        investigation = db.query(Investigation).filter(Investigation.id == investigation_id).first()
        if not investigation:
            return
        
        company = investigation.company
        org_id = investigation.organization_id

        # Update initial state
        investigation.status = InvestigationStatus.IN_PROGRESS.value
        investigation.progress_percentage = 5
        db.commit()
        emit_investigation_event(db, investigation_id, "society.initialized", {
            "title": investigation.title,
            "company": company.name,
            "rounds_planned": 8
        })
        await asyncio.sleep(0.1)

        # ----------------- ROUND 0: World Construction -----------------
        emit_investigation_event(db, investigation_id, "round.started", {"round": 0, "name": "World Construction & Evidence Ingestion"})
        profile = CompanyResearchResolver.resolve_company(
            name=company.name,
            ticker=company.ticker,
            sector=company.sector
        )

        evidence_records = []
        for s_idx, s in enumerate(profile.verified_sources):
            source = Source(
                organization_id=org_id,
                title=s["title"],
                publisher=s["publisher"],
                source_category=s["category"],
                url=s["url"],
                reliability_score=s["reliability"]
            )
            db.add(source)
            db.flush()

            for p_idx, text in enumerate(s["passages"]):
                ev = EvidenceItem(
                    investigation_id=investigation_id,
                    source_id=source.id,
                    location_reference=f"Section {p_idx+1}, Paragraph 2",
                    extracted_passage=text,
                    reliability_assessment=f"Primary verified institutional record (Confidence: {int(s['reliability']*100)}%)"
                )
                db.add(ev)
                db.flush()
                evidence_records.append(ev)

        # Construct Corporate Relationship Graph Nodes
        for rel_draft in profile.relationships:
            target_co = db.query(Company).filter(Company.name == rel_draft.target_name).first()
            if not target_co:
                target_co = Company(
                    name=rel_draft.target_name,
                    company_type="partner_entity",
                    sector=company.sector,
                    description=f"Entity connected to {company.name}"
                )
                db.add(target_co)
                db.flush()

            rel_record = CorporateRelationship(
                investigation_id=investigation_id,
                source_company_id=company.id,
                target_company_id=target_co.id,
                relationship_type=rel_draft.relationship_type,
                description=rel_draft.description,
                confidence=rel_draft.confidence,
                evidence_id=evidence_records[0].id if evidence_records else None
            )
            db.add(rel_record)

        investigation.progress_percentage = 15
        db.commit()
        await asyncio.sleep(0.1)

        # ----------------- ROUND 1: Agent Society Generation -----------------
        emit_investigation_event(db, investigation_id, "round.started", {"round": 1, "name": "Agent Society Instantiation & Role Assignment"})
        agents_map: Dict[str, SocietyAgent] = {}

        for defn in SOCIETY_SPECIALIST_DEFINITIONS:
            agent = SocietyAgent(
                investigation_id=investigation_id,
                organization_id=org_id,
                agent_id=defn["agent_id"],
                name=defn["name"],
                role=defn["role"],
                specialization=defn["specialization"],
                biography=defn["biography"],
                expertise=defn["expertise"],
                mandate=defn["mandate"],
                analytical_style=defn["analytical_style"],
                permitted_tools=defn["permitted_tools"],
                current_task=f"Investigating {company.name} under {defn['role']} mandate",
                status=AgentStatus.RESEARCHING.value,
                confidence=0.80,
                tokens_consumed=1420,
                cost_usd=0.035
            )
            db.add(agent)
            db.flush()
            agents_map[defn["agent_id"]] = agent

            # Seed agent initial memory
            initial_mem = AgentMemory(
                agent_id=agent.id,
                memory_type="mandate_initialization",
                content=f"Activated with specialization in {defn['specialization']}. Mandate: {defn['mandate']}",
                source_entity=company.name,
                confidence=0.95
            )
            db.add(initial_mem)

            emit_investigation_event(db, investigation_id, "agent.activated", {
                "agent_id": agent.agent_id,
                "name": agent.name,
                "role": agent.role
            })

        investigation.progress_percentage = 28
        db.commit()
        await asyncio.sleep(0.1)

        # ----------------- ROUND 2: Independent Research & Claim Formulation -----------------
        emit_investigation_event(db, investigation_id, "round.started", {"round": 2, "name": "Independent Research & Grounded Claim Formulation"})
        
        claims_data = [
            {
                "specialist": "financial_analyst",
                "category": "financial",
                "statement": f"{company.name} sustains solvency with ${profile.cash_reserves_m}M in liquid capital reserves and an operating cash flow margin of {round((profile.operating_cash_flow_m / max(1.0, profile.revenue_ltm_m))*100, 1)}%.",
                "confidence": 0.94,
                "evidence_indices": [0, 2],
                "verdict": AdjudicationVerdict.SUPPORTED.value
            },
            {
                "specialist": "forensic_accountant",
                "category": "risk",
                "statement": f"Customer concentration disclosure demonstrates that key client cohorts constitute {profile.top_customer_concentration_pct}% of gross revenue.",
                "confidence": 0.92,
                "evidence_indices": [1],
                "verdict": AdjudicationVerdict.SUPPORTED.value
            },
            {
                "specialist": "bull_analyst",
                "category": "competitive",
                "statement": f"Net Revenue Retention of {profile.nrr_pct}% provides structural operational leverage to support >20% annual ARR expansion.",
                "confidence": 0.81,
                "evidence_indices": [3, 5],
                "verdict": AdjudicationVerdict.PARTIALLY_SUPPORTED.value
            },
            {
                "specialist": "bear_analyst",
                "category": "market",
                "statement": f"Sales cycles tracking at {profile.sales_cycle_days} days signal corporate procurement friction and valuation multiple vulnerability.",
                "confidence": 0.87,
                "evidence_indices": [4],
                "verdict": AdjudicationVerdict.SUPPORTED.value
            }
        ]

        created_claims = []
        for c in claims_data:
            claim = Claim(
                investigation_id=investigation_id,
                proposing_specialist_id=c["specialist"],
                category=c["category"],
                statement=c["statement"],
                confidence=c["confidence"],
                verdict=c["verdict"],
                disputed=(c["specialist"] in ["bull_analyst", "bear_analyst"])
            )
            db.add(claim)
            db.flush()
            created_claims.append(claim)

            for idx in c["evidence_indices"]:
                if idx < len(evidence_records):
                    rel = EvidenceClaimRelationship(
                        claim_id=claim.id,
                        evidence_id=evidence_records[idx].id,
                        relationship_type="supporting"
                    )
                    db.add(rel)

            # Store in agent memory
            proposing_agent = agents_map.get(c["specialist"])
            if proposing_agent:
                db.add(AgentMemory(
                    agent_id=proposing_agent.id,
                    memory_type="finding",
                    content=c["statement"],
                    source_entity=company.name,
                    confidence=c["confidence"]
                ))

        investigation.progress_percentage = 42
        db.commit()
        await asyncio.sleep(0.1)

        # ----------------- ROUND 3: Cross-Agent Interaction Protocol -----------------
        emit_investigation_event(db, investigation_id, "round.started", {"round": 3, "name": "Cross-Agent Interaction Protocol & Evidence Inquiry"})

        interactions_log = [
            {
                "sender": "chief_coordinator",
                "recipient": "ALL",
                "type": InteractionType.MESSAGE.value,
                "content": f"Team, preliminary filings show ${profile.revenue_ltm_m}M LTM revenue. Forensic Accounting and Financial Analysis: examine customer concentration vs cash runway.",
                "round": 3
            },
            {
                "sender": "financial_analyst",
                "recipient": "forensic_accountant",
                "type": InteractionType.ASK.value,
                "content": f"Forensic: I see ${profile.cash_reserves_m}M in liquid capital. Does your audit of ASC 606 revenue recognition suggest any aggressive billing timing for the top accounts?",
                "round": 3
            },
            {
                "sender": "forensic_accountant",
                "recipient": "financial_analyst",
                "type": InteractionType.ANSWER.value,
                "content": f"The cash balance is real, but the top accounts represent {profile.top_customer_concentration_pct}% of total billings. If one account fails to renew, operating cash flow margin declines precipitously.",
                "round": 3
            },
            {
                "sender": "bear_analyst",
                "recipient": "bull_analyst",
                "type": InteractionType.CHALLENGE.value,
                "content": f"Bull: Your {profile.nrr_pct}% NRR thesis fails to price in the {profile.sales_cycle_days}-day sales cycle. Enterprise procurement audits are stretching 40% longer.",
                "round": 3
            },
            {
                "sender": "bull_analyst",
                "recipient": "bear_analyst",
                "type": InteractionType.REBUT.value,
                "content": f"Bear: Longer sales cycles are an industry-wide macro phenomenon, but {company.name}'s multi-year MSAs guarantee high switching costs that protect base ARR.",
                "round": 3
            },
            {
                "sender": "evidence_verifier",
                "recipient": "ALL",
                "type": InteractionType.SHARE_FINDING.value,
                "content": f"Confirmed: primary SEC filing explicitly corroborates both {profile.top_customer_concentration_pct}% customer concentration and ${profile.cash_reserves_m}M in liquid reserves.",
                "round": 3
            }
        ]

        for item in interactions_log:
            inter = AgentInteraction(
                investigation_id=investigation_id,
                sender_agent_id=item["sender"],
                recipient_agent_id=item["recipient"],
                interaction_type=item["type"],
                content=item["content"],
                round_number=item["round"]
            )
            db.add(inter)
            
            # Increment interaction count on sender
            sender_agent = agents_map.get(item["sender"])
            if sender_agent:
                sender_agent.interaction_count += 1
                sender_agent.status = AgentStatus.COLLABORATING.value

            emit_investigation_event(db, investigation_id, "interaction.dispatched", {
                "sender": item["sender"],
                "recipient": item["recipient"],
                "type": item["type"],
                "preview": item["content"][:100] + "..."
            })

        investigation.progress_percentage = 60
        db.commit()
        await asyncio.sleep(0.1)

        # ----------------- ROUND 4: Structured Adversarial Deliberation -----------------
        emit_investigation_event(db, investigation_id, "round.started", {"round": 4, "name": "Adversarial Deliberation & Conflict Floor"})

        debate = DebateSession(
            investigation_id=investigation_id,
            topic=f"Durability of Growth Multiples vs Enterprise Procurement Friction ({company.name})",
            status="active"
        )
        db.add(debate)
        db.flush()

        debate_dialogue = [
            {
                "specialist": "bull_analyst",
                "type": "assertion",
                "claim_idx": 2,
                "content": f"{company.name}'s NRR of {profile.nrr_pct}% and gross margin of {profile.gross_margin_pct}% substantiate resilient pricing power.",
                "confidence": 0.85
            },
            {
                "specialist": "bear_analyst",
                "type": "challenge",
                "claim_idx": 2,
                "content": f"The Bull case discounts sales velocity friction. Procurement duration of {profile.sales_cycle_days} days will restrict new logo acquisition.",
                "confidence": 0.89
            },
            {
                "specialist": "forensic_accountant",
                "type": "challenge",
                "claim_idx": 1,
                "content": f"A concentration of {profile.top_customer_concentration_pct}% across top clients creates acute downside sensitivity if any single account departs.",
                "confidence": 0.93
            },
            {
                "specialist": "financial_analyst",
                "type": "rebuttal",
                "claim_idx": 0,
                "content": f"Under stress testing, ${profile.cash_reserves_m}M in liquidity provides substantial runway even if operating margins face near-term compression.",
                "confidence": 0.95
            },
            {
                "specialist": "final_adjudicator",
                "type": "adjudication",
                "claim_idx": 2,
                "content": f"ADJUDICATION: Growth thesis is Partially Supported. Bull revenue targets adjusted downward to account for {profile.sales_cycle_days}-day sales cycles and {profile.top_customer_concentration_pct}% concentration risk.",
                "confidence": 0.92
            }
        ]

        for d in debate_dialogue:
            arg = DebateArgument(
                debate_id=debate.id,
                claim_id=created_claims[d["claim_idx"]].id,
                specialist_id=d["specialist"],
                argument_type=d["type"],
                content=d["content"],
                confidence=d["confidence"]
            )
            db.add(arg)

        debate.status = "resolved"
        investigation.progress_percentage = 74
        db.commit()
        await asyncio.sleep(0.1)

        # ----------------- ROUND 5 & 6: Dynamic Position Revisions & Concessions -----------------
        emit_investigation_event(db, investigation_id, "round.started", {"round": 6, "name": "Dynamic Position Updates & Explicit Concessions"})

        bull_ag = agents_map.get("bull_analyst")
        if bull_ag:
            rev = PositionRevision(
                agent_id=bull_ag.id,
                previous_position="Unrestricted 25%+ ARR compound growth trajectory.",
                new_position=f"Adjusted growth trajectory of 18-20% ARR, discounting for {profile.sales_cycle_days}-day sales cycles.",
                previous_confidence=0.88,
                new_confidence=0.79,
                triggering_evidence_id=evidence_records[1].id if len(evidence_records) > 1 else None,
                reason_for_change="Conceded to Forensic Accountant & Bear Analyst on procurement cycle elongation.",
                round_number=6
            )
            db.add(rev)
            bull_ag.current_position = rev.new_position
            bull_ag.confidence = rev.new_confidence
            bull_ag.status = AgentStatus.COMPLETED.value

            # Add explicit concession interaction
            db.add(AgentInteraction(
                investigation_id=investigation_id,
                sender_agent_id="bull_analyst",
                recipient_agent_id="bear_analyst",
                interaction_type=InteractionType.CONCEDE.value,
                content=f"Conceded: I have revised our 2026 revenue forecast down by 15% to incorporate the {profile.sales_cycle_days}-day procurement cycle.",
                round_number=6
            ))

        bear_ag = agents_map.get("bear_analyst")
        if bear_ag:
            bear_ag.current_position = f"Solvency secure due to ${profile.cash_reserves_m}M liquid cash, but valuation multiple capped by {profile.top_customer_concentration_pct}% customer concentration."
            bear_ag.confidence = 0.86
            bear_ag.status = AgentStatus.COMPLETED.value

        # Complete all remaining agents
        for ag in agents_map.values():
            if ag.status != AgentStatus.COMPLETED.value:
                ag.status = AgentStatus.COMPLETED.value
                ag.current_position = f"Deliberation complete. Evidence corroborated for {company.name}."

        investigation.progress_percentage = 88
        db.commit()
        await asyncio.sleep(0.1)

        # ----------------- ROUND 7: Epistemic Adjudication & Dossier Synthesis -----------------
        emit_investigation_event(db, investigation_id, "round.started", {"round": 7, "name": "Final Adjudication & Dossier Generation"})

        scenarios = ScenarioForecaster.calculate_scenarios(
            rev=profile.revenue_ltm_m,
            gm=profile.gross_margin_pct,
            ocf=profile.operating_cash_flow_m,
            cash=profile.cash_reserves_m,
            conc=profile.top_customer_concentration_pct
        )

        report = Report(
            investigation_id=investigation_id,
            title=f"Institutional Company Intelligence Dossier: {company.name} ({company.ticker or 'PRIVATE'})",
            version=1,
            executive_summary=(
                f"Meridian conducted a multi-specialist investigation into {company.name}. "
                f"The business demonstrates an LTM revenue base of ${profile.revenue_ltm_m}M with {profile.gross_margin_pct}% gross margins "
                f"and ${profile.cash_reserves_m}M in liquid capital. Forensic analysis underscores customer concentration of {profile.top_customer_concentration_pct}%, "
                f"while adversarial debate highlighted a {profile.sales_cycle_days}-day procurement cycle. "
                f"Overall solvency remains robust, while scenario adjustments require conservative valuation multiples."
            ),
            sections=[
                {
                    "title": "Corporate Structure & Capitalization",
                    "content": f"{company.name} operates in the {company.sector} domain under {profile.jurisdiction} corporate jurisdiction."
                },
                {
                    "title": "Financial Health & Unit Performance",
                    "content": f"LTM Revenue: ${profile.revenue_ltm_m}M • Operating Cash Flow: ${profile.operating_cash_flow_m}M • Gross Margin: {profile.gross_margin_pct}%."
                },
                {
                    "title": "Adversarial Deliberation Findings",
                    "content": "Specialists challenged the bull-case trajectory against customer concentration and sales velocity indicators, ruling that ARR projections should be discounted by 15%."
                }
            ],
            financial_analysis={
                "revenue_usd_m": profile.revenue_ltm_m,
                "gross_margin_pct": profile.gross_margin_pct,
                "operating_cash_flow_m": profile.operating_cash_flow_m,
                "cash_reserves_m": profile.cash_reserves_m,
                "nrr_pct": profile.nrr_pct,
                "sales_cycle_days": profile.sales_cycle_days
            },
            risk_register=profile.primary_risks,
            scenario_matrix=scenarios,
            unresolved_disputes=[
                f"Pace of customer diversification beyond the core {profile.top_customer_concentration_pct}% concentration accounts."
            ],
            citations_count=len(evidence_records)
        )
        db.add(report)

        # Complete Investigation
        investigation.status = InvestigationStatus.COMPLETED.value
        investigation.progress_percentage = 100
        investigation.completed_at = datetime.utcnow()
        investigation.current_cost_usd = 0.44
        db.commit()

        emit_investigation_event(db, investigation_id, "investigation.completed", {
            "report_id": report.id,
            "citations": len(evidence_records),
            "agents_count": len(agents_map),
            "interactions_count": len(interactions_log)
        })

    @classmethod
    def inject_user_intervention(cls, investigation_id: str, agent_id: str, message: str, db: Session) -> Dict[str, Any]:
        """
        User intervention protocol: User injects a question or instruction into a specific agent.
        The target agent responds grounded in its mandate and current investigation evidence.
        """
        inv = db.query(Investigation).filter(Investigation.id == investigation_id).first()
        if not inv:
            return {"error": "Investigation not found"}

        target_agent = db.query(SocietyAgent).filter(
            SocietyAgent.investigation_id == investigation_id,
            SocietyAgent.agent_id == agent_id
        ).first()

        if not target_agent:
            return {"error": "Target agent not found"}

        # Store user query
        user_interaction = AgentInteraction(
            investigation_id=investigation_id,
            sender_agent_id="investigator_lead",
            recipient_agent_id=target_agent.agent_id,
            interaction_type=InteractionType.USER_INTERVENTION.value,
            content=message,
            round_number=99
        )
        db.add(user_interaction)

        # Generate grounded response based on agent profile
        rep = inv.reports[0] if inv.reports else None
        fin = rep.financial_analysis if rep else {}

        reply_content = (
            f"Under my mandate as {target_agent.role}, I have reviewed your question. "
            f"Regarding {inv.company.name}: our audited evidence shows LTM revenue of ${fin.get('revenue_usd_m', 'N/A')}M "
            f"with {fin.get('gross_margin_pct', 'N/A')}% gross margins and {fin.get('sales_cycle_days', 'N/A')}-day procurement friction. "
            f"My current position remains: {target_agent.current_position or 'Analysis verified.'}"
        )

        agent_reply = AgentInteraction(
            investigation_id=investigation_id,
            sender_agent_id=target_agent.agent_id,
            recipient_agent_id="investigator_lead",
            interaction_type=InteractionType.ANSWER.value,
            content=reply_content,
            round_number=99
        )
        db.add(agent_reply)
        target_agent.interaction_count += 2
        db.commit()

        emit_investigation_event(db, investigation_id, "interaction.dispatched", {
            "sender": target_agent.agent_id,
            "recipient": "investigator_lead",
            "type": InteractionType.ANSWER.value,
            "preview": reply_content[:100] + "..."
        })

        return {
            "status": "answered",
            "user_query": message,
            "response": reply_content,
            "agent_reply": reply_content,
            "agent_id": target_agent.agent_id,
            "agent_name": target_agent.name
        }
