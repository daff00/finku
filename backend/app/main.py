from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger

from app.core.config import settings
from app.core.logging import setup_logging, LoggingMiddleware
from app.core.exceptions import register_exception_handlers
from app.api.routes import accounts, transactions, balances, analytics, imports

# setup logging first — before anything else
setup_logging()

app = FastAPI(
    title="Finku API",
    version="1.0.0",
    description="Personal finance tracker — track all your Indonesian bank accounts in one place",
    docs_url="/docs",
    redoc_url="/redoc",
)

# middleware — order matters! logging first
app.add_middleware(LoggingMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# exception handlers
register_exception_handlers(app)

# routes
app.include_router(accounts.router, prefix="/api/v1")
app.include_router(transactions.router, prefix="/api/v1")
app.include_router(balances.router, prefix="/api/v1")
app.include_router(analytics.router, prefix="/api/v1")
app.include_router(imports.router, prefix="/api/v1")


@app.on_event("startup")
async def startup_event():
    logger.info("🚀 Finku API started")
    logger.info(f"📄 Docs available at /docs")
    logger.info(f"🗄️  Database: {settings.DATABASE_URL}")


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