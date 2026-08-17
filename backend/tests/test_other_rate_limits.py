from app.core.config import settings


def _parse_rate_limit(limit_value: str) -> int:
    amount, _window = limit_value.split("/", 1)
    return int(amount)


def test_transactions_rate_limit(client):
    limit = _parse_rate_limit(settings.API_RATE_LIMIT)

    for _ in range(limit):
        response = client.get("/api/v1/transactions")
        assert response.status_code == 200

    response = client.get("/api/v1/transactions")
    assert response.status_code == 429


def test_balances_rate_limit(client):
    limit = _parse_rate_limit(settings.API_RATE_LIMIT)

    for _ in range(limit):
        response = client.get("/api/v1/balances")
        assert response.status_code == 200

    response = client.get("/api/v1/balances")
    assert response.status_code == 429


def test_analytics_rate_limit(client):
    limit = _parse_rate_limit(settings.API_RATE_LIMIT)

    for _ in range(limit):
        response = client.get("/api/v1/analytics/networth")
        assert response.status_code == 200

    response = client.get("/api/v1/analytics/networth")
    assert response.status_code == 429


def test_imports_rate_limit(client, sample_account):
    limit = _parse_rate_limit(settings.API_RATE_LIMIT)
    import_data = {
        "account_id": str(sample_account["id"]),
        "bank": "BCA",
    }
    import_files = {
        "file": ("broken.txt", b"not a pdf", "text/plain"),
    }

    for _ in range(limit):
        response = client.post(
            "/api/v1/import/",
            data=import_data,
            files=import_files,
        )
        assert response.status_code != 429

    response = client.post(
        "/api/v1/import/",
        data=import_data,
        files=import_files,
    )
    assert response.status_code == 429
