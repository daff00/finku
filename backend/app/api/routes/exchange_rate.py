import httpx
from datetime import datetime, timezone, timedelta
from decimal import Decimal
from fastapi import APIRouter, HTTPException, Query, Request, Response
from fastapi.responses import JSONResponse
from loguru import logger

from app.core.rate_limit import limiter
from app.core.dependencies import CurrentUser
from app.schemas.schemas import ExchangeRateOut

router = APIRouter(prefix="/exchange-rate", tags=["exchange-rate"])

_cache = {
    "rate": None,
    "fetched_at": None,
    "from_currency": "USD",
    "to_currency": "IDR",
}

CACHE_TTL_HOURS = 24


async def _fetch_exchange_rate(
    from_currency: str = "USD",
    to_currency: str = "IDR"
) -> float:
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                f"https://api.exchangerate-api.com/v4/latest/{from_currency.upper()}"
            )
            response.raise_for_status()
            data = response.json()
            rates = data.get("rates")
            if not rates or to_currency.upper() not in rates:
                raise ValueError(f"Rate for {to_currency.upper()} not found")
            rate = float(rates[to_currency.upper()])
            logger.info(f"Fetched {from_currency}→{to_currency}: {rate}")
            return rate
    except httpx.HTTPStatusError as e:
        logger.error(f"HTTP error: {e.response.status_code}")
        raise HTTPException(status_code=503, detail=f"API returned {e.response.status_code}")
    except httpx.RequestError as e:
        logger.error(f"Network error: {e}")
        raise HTTPException(status_code=503, detail="Exchange rate service unavailable")
    except (KeyError, ValueError, TypeError) as e:
        logger.error(f"Response format error: {e}")
        raise HTTPException(status_code=503, detail="Invalid response from exchange rate service")
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise HTTPException(status_code=500, detail="Internal error fetching exchange rate")


async def _get_rate_response(
    from_currency: str, to_currency: str, force_refresh: bool
) -> dict[str, str | float | bool]:
    """Shared logic for fetching/caching an exchange rate. Not a route itself."""
    now = datetime.now(timezone.utc)
    from_currency = from_currency.upper()
    to_currency = to_currency.upper()

    is_fresh = (
        _cache["rate"] is not None
        and _cache["fetched_at"] is not None
        and _cache["from_currency"] == from_currency
        and _cache["to_currency"] == to_currency
        and now - _cache["fetched_at"] < timedelta(hours=CACHE_TTL_HOURS)
    )

    if is_fresh and not force_refresh:
        return {
            "from": from_currency,
            "to": to_currency,
            "rate": _cache["rate"],
            "fetched_at": _cache["fetched_at"].isoformat(),
            "cached": True,
            "is_stale": False,
        }

    try:
        rate = await _fetch_exchange_rate(from_currency, to_currency)
        _cache.update({
            "rate": rate,
            "fetched_at": now,
            "from_currency": from_currency,
            "to_currency": to_currency,
        })
        return {
            "from": from_currency,
            "to": to_currency,
            "rate": rate,
            "fetched_at": now.isoformat(),
            "cached": False,
            "is_stale": False,
        }
    except HTTPException as error:
        has_matching_cache = (
            _cache["rate"] is not None
            and _cache["fetched_at"] is not None
            and _cache["from_currency"] == from_currency
            and _cache["to_currency"] == to_currency
        )
        if has_matching_cache:
            logger.warning(f"Returning stale cached rate: {_cache['rate']}")
            return {
                "from": from_currency,
                "to": to_currency,
                "rate": _cache["rate"],
                "fetched_at": _cache["fetched_at"].isoformat(),
                "cached": True,
                "is_stale": True,
            }
        logger.warning(f"Exchange rate unavailable without matching cache: {error.detail}")
        raise HTTPException(
            status_code=503,
            detail="Exchange rate unavailable: provider request failed and no cached rate exists",
        ) from error


async def get_usd_to_idr_rate() -> Decimal:
    response = await _get_rate_response("USD", "IDR", False)
    return Decimal(str(response["rate"]))


# NOTE: /USD must be declared BEFORE /{from_currency}, or it will never match.
@router.get("/USD", response_model=ExchangeRateOut)
@limiter.limit("10/minute")
async def get_usd_to_idr(
    request: Request,
    response: Response,
    current_user: CurrentUser,
    force_refresh: bool = Query(False),
):
    return await _get_rate_response("USD", "IDR", force_refresh)


@router.get("/{from_currency}", response_model=ExchangeRateOut)
@limiter.limit("10/minute")
async def get_exchange_rate(
    request: Request,
    response: Response,
    current_user: CurrentUser,
    from_currency: str,
    to_currency: str = Query("IDR", description="Target currency (default: IDR)"),
    force_refresh: bool = Query(False, description="Force fresh fetch"),
):
    return await _get_rate_response(from_currency, to_currency, force_refresh)


@router.post("/clear-cache")
@limiter.limit("5/minute")
async def clear_exchange_cache(
    request: Request,
    response: Response,
    current_user: CurrentUser,
):
    if current_user.username != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    _cache["rate"] = None
    _cache["fetched_at"] = None
    return JSONResponse({"message": "Cache cleared"})