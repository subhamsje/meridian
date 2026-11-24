import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from models import Base

DB_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "meridian.db")
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{DB_FILE}")

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    echo=False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    Base.metadata.create_all(bind=engine)
    # Ensure backward-compatible column migrations for SQLite
    if DATABASE_URL.startswith("sqlite"):
        with engine.connect() as conn:
            # Investigation table migrations
            for col_name, col_type in [
                ("scenario_prompt", "TEXT"),
                ("debate_mode", "VARCHAR(50) DEFAULT 'adversarial'"),
                ("target_agents_count", "INTEGER DEFAULT 6"),
                ("target_rounds_count", "INTEGER DEFAULT 6"),
                ("simulation_state", "JSON DEFAULT '{}'"),
                ("source_metadata", "JSON DEFAULT '[]'")
            ]:
                try:
                    conn.execute(text(f"ALTER TABLE investigations ADD COLUMN {col_name} {col_type}"))
                    conn.commit()
                except Exception:
                    pass

            # Claim table migrations for first-class claim system
            for col_name, col_type in [
                ("execution_id", "VARCHAR(36)"),
                ("specialist_task_id", "VARCHAR(100)"),
                ("materiality", "VARCHAR(50) DEFAULT 'high'"),
                ("status", "VARCHAR(50) DEFAULT 'proposed'"),
                ("assumptions", "JSON DEFAULT '[]'"),
                ("calculations", "JSON DEFAULT '{}'"),
                ("time_period", "VARCHAR(100)"),
                ("contradictory_evidence_ids", "JSON DEFAULT '[]'"),
                ("revision_count", "INTEGER DEFAULT 0")
            ]:
                try:
                    conn.execute(text(f"ALTER TABLE claims ADD COLUMN {col_name} {col_type}"))
                    conn.commit()
                except Exception:
                    pass

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
