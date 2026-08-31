import httpx
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, HTTPException, Query
from loguru import logger

router = APIRouter(prefix="/exchange-rate", tags=["exchange-rate"])

_cache = {
    "rate": None,
    "fetched_at": None,
    "from_currency": "USD",
    "to_currency": "IDR",
}

CACHE_TTL_HOURS = 24
FALLBACK_RATE = 15300.0  # approximate fallback


async def _fetch_exchange_rate(
    from_currency: str = "USD",
    to_currency: str = "IDR"
) -> float:
    """
    Fetch exchange rate from exchangerate-api.com (free, no key).
    Returns the rate as a float.
    """
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            # Using the free tier that doesn't require an API key
            response = await client.get(
                f"https://api.exchangerate-api.com/v4/latest/{from_currency.upper()}"
            )
            response.raise_for_status()
            data = response.json()
            rate = float(data["rates"][to_currency.upper()])
            logger.info(f"Fetched {from_currency}→{to_currency}: {rate}")
            return rate
    except Exception as e:
        logger.error(f"Failed to fetch exchange rate: {e}")
        raise HTTPException(
            status_code=503,
            detail=f"Exchange rate service unavailable: {str(e)}"
        )


@router.get("/{from_currency}")
async def get_exchange_rate(
    from_currency: str,
    to_currency: str = Query("IDR", description="Target currency (default: IDR)"),
    force_refresh: bool = Query(False, description="Force fresh fetch"),
):
    """
    Get exchange rate from one currency to another.
    Cached for 24 hours. Uses exchangerate-api.com (free, no key).
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

    # Attempt to fetch fresh rate
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
        # If fetch fails, return stale cache if available
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
        # No cache, use fallback
        logger.warning(f"Using fallback rate: {FALLBACK_RATE}")
        return {
            "from": from_currency,
            "to": to_currency,
            "rate": FALLBACK_RATE,
            "cached": False,
            "fallback": True,
        }


# Special route for USD→IDR (backward compatibility)
@router.get("/USD")
async def get_usd_to_idr(force_refresh: bool = Query(False)):
    """Get USD→IDR exchange rate (cached for 24 hours)."""
    return await get_exchange_rate("USD", "IDR", force_refresh)