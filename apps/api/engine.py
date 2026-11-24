import asyncio
import json
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from models import Investigation, InvestigationEvent
from multi_agent_society_engine import MultiAgentSocietyEngine

def emit_event(db: Session, investigation_id: str, event_type: str, payload: Dict[str, Any]):
    last_seq = db.query(InvestigationEvent).filter(InvestigationEvent.investigation_id == investigation_id).count()
    event = InvestigationEvent(
        investigation_id=investigation_id,
        event_type=event_type,
        sequence=last_seq + 1,
        payload=payload
    )
    db.add(event)
    db.commit()

async def run_investigation_pipeline(investigation_id: str, db: Session):
    # Delegate to the Durable Multi-Agent Investigation Orchestrator
    from durable_investigation_orchestrator import DurableInvestigationOrchestrator
    try:
        DurableInvestigationOrchestrator.execute_fresh_investigation(
            investigation_id=investigation_id,
            db=db
        )
    except Exception as e:
        # Fallback to multi-agent society engine if needed
        await MultiAgentSocietyEngine.run_full_society_pipeline(investigation_id, db)
