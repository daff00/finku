import httpx
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, HTTPException, Query, Request
from loguru import logger

from app.core.rate_limit import rate_limit
from app.core.dependencies import CurrentUser

router = APIRouter(prefix="/exchange-rate", tags=["exchange-rate"])

_cache = {
    "rate": None,
    "fetched_at": None,
    "from_currency": "USD",
    "to_currency": "IDR",
}

CACHE_TTL_HOURS = 24
FALLBACK_RATE = 15300.0


async def _fetch_exchange_rate(
    from_currency: str = "USD",
    to_currency: str = "IDR"
) -> float:
    """Fetch exchange rate from exchangerate-api.com."""
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
        logger.error(f"HTTP error from exchange rate API: {e.response.status_code}")
        raise HTTPException(
            status_code=503,
            detail=f"Exchange rate API returned {e.response.status_code}"
        )
    except httpx.RequestError as e:
        logger.error(f"Network error fetching exchange rate: {e}")
        raise HTTPException(
            status_code=503,
            detail="Exchange rate service unavailable (network error)"
        )
    except (KeyError, ValueError, TypeError) as e:
        logger.error(f"Unexpected response format: {e}")
        raise HTTPException(
            status_code=503,
            detail="Invalid response from exchange rate service"
        )
    except Exception as e:
        logger.error(f"Unexpected error fetching exchange rate: {e}")
        raise HTTPException(
            status_code=500,
            detail="Internal error fetching exchange rate"
        )


@router.get("/{from_currency}")
@rate_limit(limit=60, per=60)
async def get_exchange_rate(
    request: Request,  # ✅ required by slowapi
    current_user: CurrentUser,
    from_currency: str,
    to_currency: str = Query("IDR", description="Target currency (default: IDR)"),
    force_refresh: bool = Query(False, description="Force fresh fetch"),
):
    """
    Get exchange rate from one currency to another.
    Requires authentication. Cached for 24 hours.
    """
    now = datetime.now(timezone.utc)
    from_currency = from_currency.upper()
    to_currency = to_currency.upper()

    # Check if cached rate is fresh
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
        }
    except HTTPException:
        if _cache["rate"] is not None:
            logger.warning(f"Returning stale cached rate: {_cache['rate']}")
            return {
                "from": from_currency,
                "to": to_currency,
                "rate": _cache["rate"],
                "fetched_at": _cache["fetched_at"].isoformat(),
                "cached": True,
                "stale": True,
            }
        logger.warning(f"Using fallback rate: {FALLBACK_RATE}")
        return {
            "from": from_currency,
            "to": to_currency,
            "rate": FALLBACK_RATE,
            "cached": False,
            "fallback": True,
        }


@router.get("/USD")
@rate_limit(limit=60, per=60)
async def get_usd_to_idr(
    request: Request,  # ✅ required by slowapi
    current_user: CurrentUser,
    force_refresh: bool = Query(False),
):
    """Get USD→IDR exchange rate (cached for 24 hours)."""
    return await get_exchange_rate("USD", "IDR", force_refresh)


@router.post("/clear-cache")
@rate_limit(limit=5, per=60)
async def clear_exchange_cache(
    request: Request,  # ✅ required by slowapi
    current_user: CurrentUser,
):
    """Admin-only: clear the exchange rate cache."""
    if current_user.username != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    _cache["rate"] = None
    _cache["fetched_at"] = None
    return {"message": "Cache cleared"}