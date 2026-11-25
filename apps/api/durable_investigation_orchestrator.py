"""
MERIDIAN Durable Multi-Stage Investigation Orchestration Engine
Implements durable workflow execution, state checkpointing, execution manifest creation,
exact replay vs fresh rerun separation, and investigation run comparison.
"""

import time
import uuid
from typing import Dict, Any, List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from models import (
    Company, Investigation, InvestigationExecution, ExecutionManifest,
    ResearchPlan, SpecialistTask, EvidenceItem, Source, SourceSnapshot,
    Claim, ClaimChallenge, Rebuttal, ClaimRevision, Adjudication,
    ExecutionEvent, InvestigationEvent, Report
)
from task_decomposer import DynamicTaskDecomposer
from evidence_retrieval import SpecialistEvidenceRetrievalEngine
from specialist_runner import IndependentSpecialistRunner
from claim_debate_engine import ClaimDrivenDebateEngine
from research_provider import CompanyResearchResolver

def emit_execution_event(
    execution_id: str,
    stage: str,
    event_type: str,
    payload: Dict[str, Any],
    db: Session,
    investigation_id: Optional[str] = None
):
    """
    Persists durable execution event and mirrors to investigation stream.
    """
    last_seq = db.query(ExecutionEvent).filter(ExecutionEvent.execution_id == execution_id).count()
    event = ExecutionEvent(
        execution_id=execution_id,
        sequence=last_seq + 1,
        stage=stage,
        event_type=event_type,
        payload=payload
    )
    db.add(event)

    if investigation_id:
        inv_seq = db.query(InvestigationEvent).filter(InvestigationEvent.investigation_id == investigation_id).count()
        inv_event = InvestigationEvent(
            investigation_id=investigation_id,
            sequence=inv_seq + 1,
            event_type=f"exec.{event_type}",
            payload={"execution_id": execution_id, "stage": stage, **payload}
        )
        db.add(inv_event)

    db.commit()

class DurableInvestigationOrchestrator:
    """
    Orchestrates the complete autonomous multi-agent research and debate pipeline.
    """

    @classmethod
    def execute_fresh_investigation(
        cls,
        investigation_id: str,
        db: Session,
        model_name: str = "gpt-4o-mini",
        user_objective: Optional[str] = None,
        parent_execution_id: Optional[str] = None,
        pause_at_gates: bool = False,
        execution_id: Optional[str] = None
    ) -> InvestigationExecution:
        """
        Executes a genuine fresh autonomous investigation:
        New Execution ID -> Task Decomposition -> Isolated Research -> Debate -> Adjudication -> Manifest.
        If pause_at_gates is True, pauses after independent research and awaits user gate approval.
        """
        investigation = db.query(Investigation).filter(Investigation.id == investigation_id).first()
        if not investigation:
            raise ValueError(f"Investigation {investigation_id} not found")
        
        company = investigation.company

        # 1. Initialize or load pre-created InvestigationExecution record
        if execution_id:
            execution = db.query(InvestigationExecution).filter(InvestigationExecution.id == execution_id).first()
            if not execution:
                execution = InvestigationExecution(
                    id=execution_id,
                    investigation_id=investigation.id,
                    execution_type="rerun" if parent_execution_id else "fresh_run",
                    parent_execution_id=parent_execution_id,
                    status="in_progress",
                    current_stage="01_initialization",
                    progress_percentage=5,
                    model_provider="litellm",
                    model_name=model_name
                )
                db.add(execution)
                db.commit()
        else:
            execution = InvestigationExecution(
                investigation_id=investigation.id,
                execution_type="rerun" if parent_execution_id else "fresh_run",
                parent_execution_id=parent_execution_id,
                status="in_progress",
                current_stage="01_initialization",
                progress_percentage=5,
                model_provider="litellm",
                model_name=model_name
            )
            db.add(execution)
            db.commit()

        # Update parent investigation status
        investigation.status = "in_progress"
        investigation.progress_percentage = 5
        db.commit()

        emit_execution_event(execution.id, "initialization", "execution.started", {
            "company": company.name,
            "execution_type": execution.execution_type,
            "model_name": model_name
        }, db, investigation.id)

        try:
            # 2. Source Ingestion & Snapshotting
            execution.current_stage = "02_source_snapshotting"
            execution.progress_percentage = 15
            db.commit()

            profile = CompanyResearchResolver.resolve_company(
                name=company.name,
                ticker=company.ticker,
                sector=company.sector
            )

            # Ingest sources if not already present
            existing_sources = db.query(Source).filter(Source.organization_id == investigation.organization_id).all()
            sources = list(existing_sources)

            if not sources:
                for s_data in profile.verified_sources:
                    src = Source(
                        organization_id=investigation.organization_id,
                        title=s_data["title"],
                        publisher=s_data["publisher"],
                        source_category=s_data["category"],
                        url=s_data["url"],
                        reliability_score=s_data["reliability"]
                    )
                    db.add(src)
                    db.flush()
                    sources.append(src)

                    for p_idx, p_text in enumerate(s_data["passages"]):
                        ev = EvidenceItem(
                            investigation_id=investigation.id,
                            source_id=src.id,
                            location_reference=f"Section {p_idx+1}, Paragraph 1",
                            extracted_passage=p_text,
                            reliability_assessment=f"Verified institutional filing ({int(s_data['reliability']*100)}%)"
                        )
                        db.add(ev)
                db.commit()

            # Capture immutable SourceSnapshots for this execution
            snapshots = SpecialistEvidenceRetrievalEngine.capture_source_snapshots(execution, sources, db)
            all_evidence = db.query(EvidenceItem).filter(EvidenceItem.investigation_id == investigation.id).all()

            # 3. Dynamic Task Decomposition
            execution.current_stage = "03_dynamic_task_decomposition"
            execution.progress_percentage = 25
            db.commit()

            plan = DynamicTaskDecomposer.decompose_investigation(
                investigation=investigation,
                execution=execution,
                db=db,
                user_objective=user_objective
            )

            emit_execution_event(execution.id, "task_decomposition", "plan.created", {
                "archetype": plan.company_archetype,
                "tasks_count": plan.total_tasks_count,
                "primary_uncertainties": plan.primary_uncertainties
            }, db, investigation.id)

            # 4. Independent Specialist Execution in Initial Isolation
            execution.current_stage = "04_independent_research"
            execution.progress_percentage = 45
            db.commit()

            tasks = db.query(SpecialistTask).filter(SpecialistTask.execution_id == execution.id).all()
            all_generated_claims: List[Claim] = []

            for task in tasks:
                # Retrieve domain-isolated evidence
                domain_ev = SpecialistEvidenceRetrievalEngine.retrieve_for_specialist(
                    execution=execution,
                    task=task,
                    all_evidence=all_evidence,
                    db=db
                )

                # Execute specialist reasoning in isolation
                claims = IndependentSpecialistRunner.run_isolated_task(
                    execution=execution,
                    task=task,
                    company=company,
                    domain_evidence=domain_ev,
                    db=db
                )
                all_generated_claims.extend(claims)

                emit_execution_event(execution.id, "independent_research", "specialist.completed", {
                    "task_id": task.task_id,
                    "specialist_role": task.specialist_role,
                    "claims_count": len(claims)
                }, db, investigation.id)

            if pause_at_gates:
                execution.status = "awaiting_approval"
                execution.current_stage = "gate_01_research_complete"
                execution.progress_percentage = 45
                investigation.status = "in_progress"
                investigation.progress_percentage = 45
                db.commit()
                emit_execution_event(execution.id, "gate", "gate.awaiting_approval", {
                    "gate_id": "gate_01_research_complete",
                    "gate_title": "Specialist Investigation Complete",
                    "prompt": "The specialist investigation is complete. Would you like to proceed to the adversarial deliberation stage?",
                    "claims_count": len(all_generated_claims),
                    "evidence_count": len(all_evidence),
                    "options": [
                        {"id": "review_findings", "label": "Review Findings"},
                        {"id": "review_evidence", "label": "Review Evidence"},
                        {"id": "proceed_deliberation", "label": "Proceed to Deliberation", "action": "approve"}
                    ]
                }, db, investigation.id)
                return execution

            # 5. Claim-Driven Adversarial Debate Lifecycle
            execution.current_stage = "05_adversarial_debate"
            execution.progress_percentage = 65
            db.commit()

            debate_claims = ClaimDrivenDebateEngine.identify_debate_worthy_claims(all_generated_claims)
            challenges_list: List[ClaimChallenge] = []

            for target_claim in debate_claims:
                # Issue targeted challenge
                challenger_role = "Senior Forensic Accounting Auditor" if "financial" in target_claim.category else "Adversarial Red-Team Investigator"
                challenge = ClaimDrivenDebateEngine.generate_challenge(
                    execution=execution,
                    target_claim=target_claim,
                    challenging_role=challenger_role,
                    counter_evidence=all_evidence[1:3] if len(all_evidence) > 2 else all_evidence,
                    db=db
                )
                challenges_list.append(challenge)

                emit_execution_event(execution.id, "adversarial_debate", "claim.challenged", {
                    "claim_id": target_claim.id,
                    "challenging_role": challenger_role,
                    "challenge_type": challenge.challenge_type
                }, db, investigation.id)

                # Solicit direct rebuttal from authoring specialist
                rebuttal, revision = ClaimDrivenDebateEngine.execute_rebuttal(
                    execution=execution,
                    claim=target_claim,
                    challenge=challenge,
                    additional_evidence=all_evidence[2:4] if len(all_evidence) > 3 else all_evidence,
                    db=db
                )

                emit_execution_event(execution.id, "adversarial_debate", "rebuttal.submitted", {
                    "claim_id": target_claim.id,
                    "rebuttal_type": rebuttal.rebuttal_type,
                    "revised": revision is not None
                }, db, investigation.id)

                # Escalate if material unresolved dispute
                if target_claim.materiality == "critical":
                    escalation = ClaimDrivenDebateEngine.escalate_unresolved_dispute(
                        execution=execution,
                        claim=target_claim,
                        challenge=challenge,
                        db=db
                    )
                    emit_execution_event(execution.id, "adversarial_debate", "dispute.escalated", {
                        "claim_id": target_claim.id,
                        "escalation_id": escalation.id
                    }, db, investigation.id)

            if pause_at_gates:
                execution.status = "awaiting_approval"
                execution.current_stage = "gate_02_deliberation_complete"
                execution.progress_percentage = 75
                investigation.status = "in_progress"
                investigation.progress_percentage = 75
                db.commit()
                emit_execution_event(execution.id, "gate", "gate.awaiting_approval", {
                    "gate_id": "gate_02_deliberation_complete",
                    "gate_title": "Adversarial Deliberation Complete",
                    "prompt": "The specialists have completed their challenges and rebuttals. Review the findings before proceeding to final synthesis.",
                    "challenges_count": len(challenges_list),
                    "options": [
                        {"id": "review_debate", "label": "Review Debate"},
                        {"id": "review_disputes", "label": "Review Unresolved Claims"},
                        {"id": "proceed_synthesis", "label": "Proceed to Final Synthesis", "action": "approve"}
                    ]
                }, db, investigation.id)
                return execution

            # 6. Independent Judicial Adjudication (Anti-Majority-Rule)
            execution.current_stage = "06_adjudication"
            execution.progress_percentage = 85
            db.commit()

            adjudications_list: List[Adjudication] = []
            for claim in all_generated_claims:
                adj = ClaimDrivenDebateEngine.adjudicate_claim(
                    execution=execution,
                    claim=claim,
                    db=db
                )
                adjudications_list.append(adj)

                emit_execution_event(execution.id, "adjudication", "claim.adjudicated", {
                    "claim_id": claim.id,
                    "verdict": adj.verdict,
                    "confidence": claim.confidence
                }, db, investigation.id)

            # 7. Generate Execution Manifest & Synthesis
            execution.current_stage = "07_manifest_finalization"
            execution.progress_percentage = 100
            execution.status = "completed"
            execution.completed_at = datetime.utcnow()

            existing_manifest = db.query(ExecutionManifest).filter(ExecutionManifest.execution_id == execution.id).first()
            if existing_manifest:
                manifest = existing_manifest
                manifest.company_context_snapshot = {
                    "name": company.name,
                    "ticker": company.ticker,
                    "sector": company.sector,
                    "description": company.description
                }
                manifest.user_objective = user_objective or "Comprehensive multi-agent investigation"
                manifest.claims_tree = [{
                    "claim_id": c.id,
                    "statement": c.statement,
                    "category": c.category,
                    "confidence": c.confidence,
                    "status": c.status,
                    "verdict": c.verdict
                } for c in all_generated_claims]
                manifest.adjudications_summary = {
                    "total_claims": len(all_generated_claims),
                    "supported": sum(1 for a in adjudications_list if a.verdict == "supported"),
                    "partially_supported": sum(1 for a in adjudications_list if a.verdict == "partially_supported"),
                    "rejected": sum(1 for a in adjudications_list if a.verdict == "rejected")
                }
            else:
                manifest = ExecutionManifest(
                    execution_id=execution.id,
                    manifest_version=1,
                    company_context_snapshot={
                        "name": company.name,
                        "ticker": company.ticker,
                        "sector": company.sector,
                        "description": company.description
                    },
                    user_objective=user_objective or "Comprehensive multi-agent investigation",
                    source_snapshot_version="1.0.0",
                    document_checksums=[s.content_checksum for s in snapshots],
                    research_plan_snapshot={
                        "archetype": plan.company_archetype,
                        "tasks_count": plan.total_tasks_count,
                        "uncertainties": plan.primary_uncertainties
                    },
                    specialist_tasks_snapshot=[{
                        "task_id": t.task_id,
                        "role": t.specialist_role,
                        "objective": t.research_objective,
                        "status": t.status
                    } for t in tasks],
                    model_executions_summary={
                        "model_used": execution.model_name,
                        "total_tokens": execution.total_tokens,
                        "total_cost_usd": execution.total_cost_usd
                    },
                    claims_tree=[{
                        "claim_id": c.id,
                        "statement": c.statement,
                        "category": c.category,
                        "confidence": c.confidence,
                        "status": c.status,
                        "verdict": c.verdict
                    } for c in all_generated_claims],
                    adjudications_summary={
                        "total_claims": len(all_generated_claims),
                        "supported": sum(1 for a in adjudications_list if a.verdict == "supported"),
                        "partially_supported": sum(1 for a in adjudications_list if a.verdict == "partially_supported"),
                        "rejected": sum(1 for a in adjudications_list if a.verdict == "rejected")
                    },
                    financial_formulas={
                        "solvency_check": "operating_cash_flow / total_debt",
                        "nrr_retention": "ending_arr_cohort / starting_arr_cohort"
                    }
                )
                db.add(manifest)

            # Mirror to Report entity for backward compatibility
            existing_report = db.query(Report).filter(Report.investigation_id == investigation.id).first()
            if existing_report:
                report = existing_report
                report.title = f"Autonomous Forensic Dossier: {company.name}"
                report.executive_summary = (
                    f"Autonomous multi-agent investigation of {company.name} completed under execution {execution.id}. "
                    f"Analyzed under {plan.company_archetype} standard with {len(all_generated_claims)} auditable claims."
                )
                report.sections = [{
                    "title": "Adjudicated Findings",
                    "claims": [c.statement for c in all_generated_claims]
                }]
                report.financial_analysis = manifest.financial_formulas
            else:
                report = Report(
                    investigation_id=investigation.id,
                    title=f"Autonomous Forensic Dossier: {company.name}",
                    executive_summary=(
                        f"Autonomous multi-agent investigation of {company.name} completed under execution {execution.id}. "
                        f"Analyzed under {plan.company_archetype} standard with {len(all_generated_claims)} auditable claims."
                    ),
                    sections=[{
                        "title": "Adjudicated Findings",
                        "claims": [c.statement for c in all_generated_claims]
                    }],
                    financial_analysis=manifest.financial_formulas,
                    risk_register=plan.primary_uncertainties,
                    unresolved_disputes=[]
                )
                db.add(report)

            # Update parent investigation status
            investigation.status = "completed"
            investigation.progress_percentage = 100
            db.commit()

            emit_execution_event(execution.id, "manifest_finalization", "execution.completed", {
                "manifest_id": manifest.id,
                "total_claims": len(all_generated_claims),
                "total_tokens": execution.total_tokens,
                "total_cost_usd": execution.total_cost_usd
            }, db, investigation.id)

            return execution

        except Exception as e:
            execution.status = "failed"
            execution.error_message = str(e)
            db.commit()
            emit_execution_event(execution.id, execution.current_stage, "execution.failed", {
                "error": str(e)
            }, db, investigation.id)
            raise

    @classmethod
    def advance_execution_gate(
        cls,
        execution_id: str,
        db: Session,
        target_gate: Optional[str] = None,
        pause_at_next_gate: bool = True
    ) -> InvestigationExecution:
        """
        Advances an execution held at an approval gate (e.g. Gate 1 -> Deliberation, Gate 2 -> Final Synthesis).
        """
        execution = db.query(InvestigationExecution).filter(InvestigationExecution.id == execution_id).first()
        if not execution:
            raise ValueError(f"Execution {execution_id} not found")

        investigation = db.query(Investigation).filter(Investigation.id == execution.investigation_id).first()
        if not investigation:
            raise ValueError(f"Investigation {execution.investigation_id} not found")

        company = db.query(Company).filter(Company.id == investigation.company_id).first()
        all_evidence = db.query(EvidenceItem).filter(EvidenceItem.investigation_id == investigation.id).all()
        all_generated_claims = db.query(Claim).filter(Claim.execution_id == execution.id).all()
        plan = db.query(ResearchPlan).filter(ResearchPlan.investigation_id == investigation.id).first()
        snapshots = db.query(SourceSnapshot).filter(SourceSnapshot.execution_id == execution.id).all()
        tasks = db.query(SpecialistTask).filter(SpecialistTask.execution_id == execution.id).all()

        current_stage = execution.current_stage

        # Advance Gate 1 -> 05_adversarial_debate
        if current_stage == "gate_01_research_complete" or target_gate == "05_adversarial_debate":
            execution.status = "in_progress"
            execution.current_stage = "05_adversarial_debate"
            execution.progress_percentage = 65
            investigation.status = "in_progress"
            investigation.progress_percentage = 65
            db.commit()

            emit_execution_event(execution.id, "gate", "gate.approved", {
                "gate_id": "gate_01_research_complete",
                "next_stage": "05_adversarial_debate"
            }, db, investigation.id)

            debate_claims = ClaimDrivenDebateEngine.identify_debate_worthy_claims(all_generated_claims)
            challenges_list: List[ClaimChallenge] = []

            for target_claim in debate_claims:
                challenger_role = "Senior Forensic Accounting Auditor" if "financial" in (target_claim.category or "") else "Adversarial Red-Team Investigator"
                challenge = ClaimDrivenDebateEngine.generate_challenge(
                    execution=execution,
                    target_claim=target_claim,
                    challenging_role=challenger_role,
                    counter_evidence=all_evidence[1:3] if len(all_evidence) > 2 else all_evidence,
                    db=db
                )
                challenges_list.append(challenge)

                emit_execution_event(execution.id, "adversarial_debate", "claim.challenged", {
                    "claim_id": target_claim.id,
                    "challenging_role": challenger_role,
                    "challenge_type": challenge.challenge_type
                }, db, investigation.id)

                rebuttal, revision = ClaimDrivenDebateEngine.execute_rebuttal(
                    execution=execution,
                    claim=target_claim,
                    challenge=challenge,
                    additional_evidence=all_evidence[2:4] if len(all_evidence) > 3 else all_evidence,
                    db=db
                )

                emit_execution_event(execution.id, "adversarial_debate", "rebuttal.submitted", {
                    "claim_id": target_claim.id,
                    "rebuttal_type": rebuttal.rebuttal_type,
                    "revised": revision is not None
                }, db, investigation.id)

                if target_claim.materiality == "critical":
                    escalation = ClaimDrivenDebateEngine.escalate_unresolved_dispute(
                        execution=execution,
                        claim=target_claim,
                        challenge=challenge,
                        db=db
                    )
                    emit_execution_event(execution.id, "adversarial_debate", "dispute.escalated", {
                        "claim_id": target_claim.id,
                        "escalation_id": escalation.id
                    }, db, investigation.id)

            if pause_at_next_gate:
                execution.status = "awaiting_approval"
                execution.current_stage = "gate_02_deliberation_complete"
                execution.progress_percentage = 75
                investigation.status = "in_progress"
                investigation.progress_percentage = 75
                db.commit()
                emit_execution_event(execution.id, "gate", "gate.awaiting_approval", {
                    "gate_id": "gate_02_deliberation_complete",
                    "gate_title": "Adversarial Deliberation Complete",
                    "prompt": "The specialists have completed their challenges and rebuttals. Review the findings before proceeding to final synthesis.",
                    "challenges_count": len(challenges_list),
                    "options": [
                        {"id": "review_debate", "label": "Review Debate"},
                        {"id": "review_disputes", "label": "Review Unresolved Claims"},
                        {"id": "proceed_synthesis", "label": "Proceed to Final Synthesis", "action": "approve"}
                    ]
                }, db, investigation.id)
                return execution
            else:
                current_stage = "gate_02_deliberation_complete"

        # Advance Gate 2 -> 06_adjudication & 07_manifest_finalization
        if current_stage == "gate_02_deliberation_complete" or target_gate in ["06_adjudication", "07_manifest_finalization"]:
            execution.status = "in_progress"
            execution.current_stage = "06_adjudication"
            execution.progress_percentage = 85
            db.commit()

            emit_execution_event(execution.id, "gate", "gate.approved", {
                "gate_id": "gate_02_deliberation_complete",
                "next_stage": "06_adjudication"
            }, db, investigation.id)

            adjudications_list: List[Adjudication] = []
            for claim in all_generated_claims:
                adj = ClaimDrivenDebateEngine.adjudicate_claim(
                    execution=execution,
                    claim=claim,
                    db=db
                )
                adjudications_list.append(adj)

                emit_execution_event(execution.id, "adjudication", "claim.adjudicated", {
                    "claim_id": claim.id,
                    "verdict": adj.verdict,
                    "confidence": claim.confidence
                }, db, investigation.id)

            execution.current_stage = "07_manifest_finalization"
            execution.progress_percentage = 100
            execution.status = "completed"
            execution.completed_at = datetime.utcnow()

            existing_manifest = db.query(ExecutionManifest).filter(ExecutionManifest.execution_id == execution.id).first()
            if existing_manifest:
                manifest = existing_manifest
                manifest.company_context_snapshot = {
                    "name": company.name if company else "Company",
                    "ticker": company.ticker if company else "TKR",
                    "sector": company.sector if company else "Technology",
                    "description": company.description if company else ""
                }
                manifest.user_objective = getattr(investigation, "title", "Comprehensive multi-agent investigation")
                manifest.claims_tree = [{
                    "claim_id": c.id,
                    "statement": c.statement,
                    "category": c.category,
                    "confidence": c.confidence,
                    "status": c.status,
                    "verdict": c.verdict
                } for c in all_generated_claims]
                manifest.adjudications_summary = {
                    "total_claims": len(all_generated_claims),
                    "supported": sum(1 for a in adjudications_list if a.verdict == "supported"),
                    "partially_supported": sum(1 for a in adjudications_list if a.verdict == "partially_supported"),
                    "rejected": sum(1 for a in adjudications_list if a.verdict == "rejected")
                }
            else:
                manifest = ExecutionManifest(
                    execution_id=execution.id,
                    manifest_version=1,
                    company_context_snapshot={
                        "name": company.name if company else "Company",
                        "ticker": company.ticker if company else "TKR",
                        "sector": company.sector if company else "Technology",
                        "description": company.description if company else ""
                    },
                    user_objective=getattr(investigation, "title", "Comprehensive multi-agent investigation"),
                    source_snapshot_version="1.0.0",
                    document_checksums=[s.content_checksum for s in snapshots],
                    research_plan_snapshot={
                        "archetype": plan.company_archetype if plan else "Enterprise B2B Hardware/Semiconductor",
                        "tasks_count": plan.total_tasks_count if plan else len(tasks),
                        "uncertainties": plan.primary_uncertainties if plan else []
                    },
                    specialist_tasks_snapshot=[{
                        "task_id": t.task_id,
                        "role": t.specialist_role,
                        "objective": t.research_objective,
                        "status": t.status
                    } for t in tasks],
                    model_executions_summary={
                        "model_used": execution.model_name,
                        "total_tokens": execution.total_tokens,
                        "total_cost_usd": execution.total_cost_usd
                    },
                    claims_tree=[{
                        "claim_id": c.id,
                        "statement": c.statement,
                        "category": c.category,
                        "confidence": c.confidence,
                        "status": c.status,
                        "verdict": c.verdict
                    } for c in all_generated_claims],
                    adjudications_summary={
                        "total_claims": len(all_generated_claims),
                        "supported": sum(1 for a in adjudications_list if a.verdict == "supported"),
                        "partially_supported": sum(1 for a in adjudications_list if a.verdict == "partially_supported"),
                        "rejected": sum(1 for a in adjudications_list if a.verdict == "rejected")
                    },
                    financial_formulas={
                        "solvency_check": "operating_cash_flow / total_debt",
                        "nrr_retention": "ending_arr_cohort / starting_arr_cohort"
                    }
                )
                db.add(manifest)

            existing_report = db.query(Report).filter(Report.investigation_id == investigation.id).first()
            if existing_report:
                report = existing_report
                report.title = f"Autonomous Forensic Dossier: {company.name if company else 'Enterprise'}"
                report.executive_summary = (
                    f"Autonomous multi-agent investigation completed under execution {execution.id}. "
                    f"Analyzed with {len(all_generated_claims)} auditable claims."
                )
                report.sections = [{
                    "title": "Adjudicated Findings",
                    "claims": [c.statement for c in all_generated_claims]
                }]
                report.financial_analysis = manifest.financial_formulas
            else:
                report = Report(
                    investigation_id=investigation.id,
                    title=f"Autonomous Forensic Dossier: {company.name if company else 'Enterprise'}",
                    executive_summary=(
                        f"Autonomous multi-agent investigation completed under execution {execution.id}. "
                        f"Analyzed with {len(all_generated_claims)} auditable claims."
                    ),
                    sections=[{
                        "title": "Adjudicated Findings",
                        "claims": [c.statement for c in all_generated_claims]
                    }],
                    financial_analysis=manifest.financial_formulas,
                    risk_register=plan.primary_uncertainties if plan else [],
                    unresolved_disputes=[]
                )
                db.add(report)

            investigation.status = "completed"
            investigation.progress_percentage = 100
            db.commit()

            emit_execution_event(execution.id, "manifest_finalization", "execution.completed", {
                "manifest_id": manifest.id,
                "total_claims": len(all_generated_claims),
                "total_tokens": execution.total_tokens,
                "total_cost_usd": execution.total_cost_usd
            }, db, investigation.id)

        return execution

    @classmethod
    def replay_execution(
        cls,
        execution_id: str,
        db: Session
    ) -> Dict[str, Any]:
        """
        Reconstructs an execution state strictly from persisted events and manifest.
        Guarantees ZERO new model calls or token consumption.
        """
        execution = db.query(InvestigationExecution).filter(InvestigationExecution.id == execution_id).first()
        if not execution:
            raise ValueError(f"Execution {execution_id} not found")

        manifest = db.query(ExecutionManifest).filter(ExecutionManifest.execution_id == execution_id).first()
        events = db.query(ExecutionEvent).filter(ExecutionEvent.execution_id == execution_id).order_by(ExecutionEvent.sequence.asc()).all()
        claims = db.query(Claim).filter(Claim.execution_id == execution_id).all()
        adjudications = db.query(Adjudication).filter(Adjudication.execution_id == execution_id).all()

        return {
            "mode": "replay",
            "execution_id": execution.id,
            "investigation_id": execution.investigation_id,
            "status": execution.status,
            "model_name": execution.model_name,
            "total_tokens": execution.total_tokens,
            "total_cost_usd": execution.total_cost_usd,
            "manifest": manifest.claims_tree if manifest else [],
            "claims": [{
                "id": c.id,
                "statement": c.statement,
                "confidence": c.confidence,
                "verdict": c.verdict,
                "materiality": c.materiality,
                "revisions_count": c.revision_count
            } for c in claims],
            "adjudications": [{
                "claim_id": a.claim_id,
                "verdict": a.verdict,
                "rationale": a.adjudication_rationale
            } for a in adjudications],
            "event_count": len(events),
            "replayed_events": [{
                "seq": ev.sequence,
                "stage": ev.stage,
                "event_type": ev.event_type,
                "payload": ev.payload
            } for ev in events]
        }

    @classmethod
    def compare_executions(
        cls,
        exec_id_a: str,
        exec_id_b: str,
        db: Session
    ) -> Dict[str, Any]:
        """
        Performs an empirical comparison between two investigation runs.
        Identifies differences in research plans, claims, confidence, and adjudications.
        """
        exec_a = db.query(InvestigationExecution).filter(InvestigationExecution.id == exec_id_a).first()
        exec_b = db.query(InvestigationExecution).filter(InvestigationExecution.id == exec_id_b).first()

        if not exec_a or not exec_b:
            raise ValueError("One or both executions not found for comparison")

        claims_a = {c.category: c for c in db.query(Claim).filter(Claim.execution_id == exec_id_a).all()}
        claims_b = {c.category: c for c in db.query(Claim).filter(Claim.execution_id == exec_id_b).all()}

        claim_differences = []
        all_categories = set(claims_a.keys()).union(set(claims_b.keys()))

        for cat in all_categories:
            ca = claims_a.get(cat)
            cb = claims_b.get(cat)
            if ca and cb:
                claim_differences.append({
                    "category": cat,
                    "statement_changed": ca.statement != cb.statement,
                    "confidence_delta": round(cb.confidence - ca.confidence, 2),
                    "verdict_a": ca.verdict,
                    "verdict_b": cb.verdict,
                    "verdict_changed": ca.verdict != cb.verdict
                })
            elif ca and not cb:
                claim_differences.append({"category": cat, "status": "present_only_in_A", "statement": ca.statement})
            elif cb and not ca:
                claim_differences.append({"category": cat, "status": "present_only_in_B", "statement": cb.statement})

        return {
            "comparison": {
                "run_A": {"execution_id": exec_a.id, "model": exec_a.model_name, "tokens": exec_a.total_tokens},
                "run_B": {"execution_id": exec_b.id, "model": exec_b.model_name, "tokens": exec_b.total_tokens},
                "claim_differences": claim_differences,
                "token_variance": exec_b.total_tokens - exec_a.total_tokens,
                "cost_variance": round(exec_b.total_cost_usd - exec_a.total_cost_usd, 4)
            }
        }
