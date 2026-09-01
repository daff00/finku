# app/core/rate_limit.py
from fastapi import Request
from fastapi.responses import JSONResponse
from slowapi import Limiter
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from app.core.auth_utils import decode_access_token
from app.core.config import settings


def get_rate_limit_key(request: Request) -> str:
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        token = auth_header.removeprefix("Bearer ").strip()
        payload = decode_access_token(token)
        if payload:
            username = payload.get("sub")
            if username:
                return f"user:{username}"

    client_ip = get_remote_address(request) or "unknown"
    return f"ip:{client_ip}"


limiter = Limiter(
    key_func=get_rate_limit_key,
    headers_enabled=True,
    key_style="endpoint",
)

accounts_limit = limiter.shared_limit(
    settings.ACCOUNTS_RATE_LIMIT,
    scope="accounts",
)

transactions_limit = limiter.shared_limit(
    settings.API_RATE_LIMIT,
    scope="transactions",
)

balances_limit = limiter.shared_limit(
    settings.API_RATE_LIMIT,
    scope="balances",
)

analytics_limit = limiter.shared_limit(
    settings.API_RATE_LIMIT,
    scope="analytics",
)

imports_limit = limiter.shared_limit(
    settings.API_RATE_LIMIT,
    scope="imports",
)


def rate_limit(limit: int, per: int):
    """
    Generic rate limit decorator.
    Usage: @rate_limit(limit=60, per=60)  # 60 requests per minute
    """
    rate_string = f"{limit}/{per}s"
    return limiter.shared_limit(rate_string, scope="exchange_rate")


def rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=429,
        content={
            "error": "Too many requests",
            "status_code": 429,
        },
    )