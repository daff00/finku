from datetime import datetime, timezone

import pytest
from fastapi import HTTPException

from app.api.routes import exchange_rate


@pytest.fixture(autouse=True)
def clear_exchange_rate_cache():
    exchange_rate._cache.update(
        {
            "rate": None,
            "fetched_at": None,
            "from_currency": "USD",
            "to_currency": "IDR",
        }
    )
    yield
    exchange_rate._cache.update(
        {
            "rate": None,
            "fetched_at": None,
            "from_currency": "USD",
            "to_currency": "IDR",
        }
    )


def test_fresh_exchange_rate_is_not_stale(client, monkeypatch):
    async def fetch_rate(from_currency: str, to_currency: str) -> float:
        return 15750.0

    monkeypatch.setattr(exchange_rate, "_fetch_exchange_rate", fetch_rate)

    response = client.get("/api/v1/exchange-rate/USD")

    assert response.status_code == 200
    assert response.json()["rate"] == 15750.0
    assert response.json()["is_stale"] is False


def test_provider_failure_returns_matching_cached_rate_as_stale(client, monkeypatch):
    cached_at = datetime(2026, 1, 1, tzinfo=timezone.utc)
    exchange_rate._cache.update(
        {
            "rate": 15000.0,
            "fetched_at": cached_at,
            "from_currency": "USD",
            "to_currency": "IDR",
        }
    )

    async def fail_fetch(from_currency: str, to_currency: str) -> float:
        raise HTTPException(status_code=503, detail="provider unavailable")

    monkeypatch.setattr(exchange_rate, "_fetch_exchange_rate", fail_fetch)

    response = client.get("/api/v1/exchange-rate/USD?force_refresh=true")

    assert response.status_code == 200
    assert response.json()["rate"] == 15000.0
    assert response.json()["is_stale"] is True


def test_provider_failure_without_cache_returns_service_unavailable(client, monkeypatch):
    async def fail_fetch(from_currency: str, to_currency: str) -> float:
        raise HTTPException(status_code=503, detail="provider unavailable")

    monkeypatch.setattr(exchange_rate, "_fetch_exchange_rate", fail_fetch)

    response = client.get("/api/v1/exchange-rate/USD?force_refresh=true")

    assert response.status_code == 503
    assert "no cached rate exists" in response.json()["error"]
