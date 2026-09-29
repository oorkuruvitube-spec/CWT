import os
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("cwt_backend")

# 1. Preferred PostgreSQL connection
# Can be configured via environment variable DATABASE_URL, or defaults to standard local PostgreSQL
DEFAULT_PG_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql+psycopg2://postgres:postgres@localhost:5432/cwt_db"
)

# 2. SQLite fallback path for instant local zero-setup operation
SQLITE_URL = "sqlite:///./cwt_portal.db"

engine = None
DB_TYPE = "PostgreSQL"

try:
    # Attempt connecting to PostgreSQL first
    test_engine = create_engine(DEFAULT_PG_URL, connect_args={"connect_timeout": 2})
    with test_engine.connect() as conn:
        logger.info("Successfully connected to preferred PostgreSQL database!")
    engine = test_engine
    DB_TYPE = "PostgreSQL"
except Exception as pg_err:
    logger.warning(
        f"PostgreSQL not reachable at {DEFAULT_PG_URL} ({pg_err}). "
        f"Gracefully falling back to robust local SQLite engine: {SQLITE_URL}"
    )
    engine = create_engine(SQLITE_URL, connect_args={"check_same_thread": False})
    DB_TYPE = "SQLite (Local Fallback for PostgreSQL)"

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
