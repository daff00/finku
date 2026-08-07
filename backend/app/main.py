from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.routes import accounts, transactions, balances, analytics, imports

app = FastAPI(
    title="Finku API",
    version="1.0.0",
    description="Personal finance tracker API",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(accounts.router, prefix="/api/v1")
app.include_router(transactions.router, prefix="/api/v1")
app.include_router(balances.router, prefix="/api/v1")
app.include_router(analytics.router, prefix="/api/v1")
app.include_router(imports.router, prefix="/api/v1")

@app.get("/")
def root():
    return {"message": "Finku API is running 🚀"}