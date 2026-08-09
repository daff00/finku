from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import accounts, analytics, balances, imports, transactions
from app.core.config import settings
from app.core.database import engine
from app.core.exceptions import register_exception_handlers
from app.models.models import Base

app = FastAPI(
    title="Finku API",
    version="1.0.0",
    description="Personal finance tracker — track all your Indonesian bank accounts in one place",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception handlers
register_exception_handlers(app)

# Routes
app.include_router(accounts.router, prefix="/api/v1")
app.include_router(transactions.router, prefix="/api/v1")
app.include_router(balances.router, prefix="/api/v1")
app.include_router(analytics.router, prefix="/api/v1")
app.include_router(imports.router, prefix="/api/v1")


@app.get("/")
def root():
    return {
        "message": "Finku API is running 🚀",
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "database": "connected",
    }