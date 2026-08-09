import pytest


def test_create_balance(client, sample_account):
    # ── Arrange ───────────────────────────────
    payload = {
        "account_id": sample_account["id"],
        "amount": "32100000",
    }

    # ── Act ───────────────────────────────────
    response = client.post("/api/v1/balances", json=payload)

    # ── Assert ────────────────────────────────
    assert response.status_code == 201
    data = response.json()
    assert data["account_id"] == sample_account["id"]
    assert data["amount"] == "32100000.00"
    assert data["id"] is not None
    assert data["recorded_at"] is not None


def test_create_balance_account_not_found(client):
    # ── Arrange ───────────────────────────────
    payload = {
        "account_id": 999,
        "amount": "32100000",
    }

    # ── Act ───────────────────────────────────
    response = client.post("/api/v1/balances", json=payload)

    # ── Assert ────────────────────────────────
    assert response.status_code == 404
    assert response.json()["error"] == "Account not found"


def test_list_balances(client, sample_balance):
    # ── Act ───────────────────────────────────
    response = client.get("/api/v1/balances")

    # ── Assert ────────────────────────────────
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["amount"] == "32100000.00"


def test_list_balances_empty(client):
    # ── Act ───────────────────────────────────
    response = client.get("/api/v1/balances")

    # ── Assert ────────────────────────────────
    assert response.status_code == 200
    assert response.json() == []


def test_list_balances_filter_by_account(client, sample_account, sample_balance):
    # ── Act ───────────────────────────────────
    response = client.get(f"/api/v1/balances?account_id={sample_account['id']}")

    # ── Assert ────────────────────────────────
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["account_id"] == sample_account["id"]


def test_list_balances_filter_wrong_account(client, sample_balance):
    # ── Act ───────────────────────────────────
    response = client.get("/api/v1/balances?account_id=999")

    # ── Assert ────────────────────────────────
    assert response.status_code == 200
    assert response.json() == []


def test_get_latest_balance(client, sample_account, sample_balance):
    # ── Act ───────────────────────────────────
    response = client.get(f"/api/v1/balances/{sample_account['id']}/latest")

    # ── Assert ────────────────────────────────
    assert response.status_code == 200
    data = response.json()
    assert data["account_id"] == sample_account["id"]
    assert data["amount"] == "32100000.00"


def test_get_latest_balance_returns_most_recent(client, sample_account):
    # ── Arrange — create two snapshots ────────
    client.post("/api/v1/balances", json={
        "account_id": sample_account["id"],
        "amount": "10000000",
    })
    client.post("/api/v1/balances", json={
        "account_id": sample_account["id"],
        "amount": "20000000",  # more recent
    })

    # ── Act ───────────────────────────────────
    response = client.get(f"/api/v1/balances/{sample_account['id']}/latest")

    # ── Assert ────────────────────────────────
    assert response.status_code == 200
    assert response.json()["amount"] == "20000000.00"


def test_get_latest_balance_account_not_found(client):
    # ── Act ───────────────────────────────────
    response = client.get("/api/v1/balances/999/latest")

    # ── Assert ────────────────────────────────
    assert response.status_code == 404
    assert response.json()["error"] == "Account not found"


def test_get_latest_balance_no_snapshot(client, sample_account):
    # ── Act — account exists but no snapshot ──
    response = client.get(f"/api/v1/balances/{sample_account['id']}/latest")

    # ── Assert ────────────────────────────────
    assert response.status_code == 404
    assert response.json()["error"] == "No balance snapshot found for this account"