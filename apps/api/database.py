import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from models import Base

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./meridian.db")

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

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
