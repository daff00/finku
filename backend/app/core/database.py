from app.core.config import settings
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

# Define database
sqlite_url = settings.DATABASE_URL

# Create Engine
connect_args = (
    {"check_same_thread": False} 
    if settings.DATABASE_URL.startswith("sqlite") 
    else {}
    )
engine = create_engine(sqlite_url, connect_args=connect_args)

# Create session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base calss for database models
class Base(DeclarativeBase):
    pass

# get db
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()