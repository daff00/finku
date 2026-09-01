import pytest


def test_create_account(client):
    # ── Arrange ───────────────────────────────
    payload = {
        "name": "BCA Main",
        "bank": "BCA",
        "type": "SAVINGS",
        "color": "#0066AE",
        "currency": "IDR",
    }

    # ── Act ───────────────────────────────────
    response = client.post("/api/v1/accounts", json=payload)

    # ── Assert ────────────────────────────────
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "BCA Main"
    assert data["bank"] == "BCA"
    assert data["type"] == "SAVINGS"
    assert data["color"] == "#0066AE"
    assert data["currency"] == "IDR"
    assert data["is_active"] is True
    assert data["id"] is not None
    assert data["created_at"] is not None


def test_create_account_missing_required_fields(client):
    # ── Arrange ───────────────────────────────
    payload = {"name": "BCA Main"}  # missing bank, type, color

    # ── Act ───────────────────────────────────
    response = client.post("/api/v1/accounts", json=payload)

    # ── Assert ────────────────────────────────
    assert response.status_code == 422
    assert response.json()["error"] == "Validation error"


def test_create_account_duplicate_name(client):
    payload = {
        "name": "BCA Main",
        "bank": "BCA",
        "type": "SAVINGS",
        "color": "#0066AE",
        "currency": "IDR",
    }

    first = client.post("/api/v1/accounts", json=payload)
    assert first.status_code == 201

    second = client.post("/api/v1/accounts", json=payload)
    assert second.status_code == 409
    assert "Duplicate account" in second.json()["error"]


def test_create_account_duplicate_name_with_different_currency(client):
    payload_idr = {
        "name": "BCA Main",
        "bank": "BCA",
        "type": "SAVINGS",
        "color": "#0066AE",
        "currency": "IDR",
    }
    payload_usd = {
        "name": "BCA Main",
        "bank": "BCA",
        "type": "SAVINGS",
        "color": "#0066AE",
        "currency": "USD",
    }

    first = client.post("/api/v1/accounts", json=payload_idr)
    assert first.status_code == 201

    second = client.post("/api/v1/accounts", json=payload_usd)
    assert second.status_code == 201
    assert second.json()["currency"] == "USD"


def test_list_accounts(client, sample_account):
    # ── Act ───────────────────────────────────
    response = client.get("/api/v1/accounts")

    # ── Assert ────────────────────────────────
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["name"] == "BCA Main"


def test_list_accounts_empty(client):
    # ── Act ───────────────────────────────────
    response = client.get("/api/v1/accounts")

    # ── Assert ────────────────────────────────
    assert response.status_code == 200
    assert response.json() == []


def test_get_account(client, sample_account):
    # ── Act ───────────────────────────────────
    response = client.get(f"/api/v1/accounts/{sample_account['id']}")

    # ── Assert ────────────────────────────────
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == sample_account["id"]
    assert data["name"] == "BCA Main"


def test_get_account_not_found(client):
    # ── Act ───────────────────────────────────
    response = client.get("/api/v1/accounts/999")

    # ── Assert ────────────────────────────────
    assert response.status_code == 404
    assert response.json()["error"] == "Account not found"


def test_update_account(client, sample_account):
    # ── Arrange ───────────────────────────────
    payload = {"name": "BCA Salary", "color": "#003F8A"}

    # ── Act ───────────────────────────────────
    response = client.patch(
        f"/api/v1/accounts/{sample_account['id']}",
        json=payload,
    )

    # ── Assert ────────────────────────────────
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "BCA Salary"
    assert data["color"] == "#003F8A"
    assert data["bank"] == "BCA"  # unchanged


def test_update_account_not_found(client):
    # ── Act ───────────────────────────────────
    response = client.patch(
        "/api/v1/accounts/999",
        json={"name": "New Name"},
    )

    # ── Assert ────────────────────────────────
    assert response.status_code == 404
    assert response.json()["error"] == "Account not found"


def test_delete_account(client, sample_account):
    # ── Act ───────────────────────────────────
    response = client.delete(f"/api/v1/accounts/{sample_account['id']}")

    # ── Assert ────────────────────────────────
    assert response.status_code == 204

    # verify soft deleted — not in list anymore
    list_response = client.get("/api/v1/accounts")
    assert len(list_response.json()) == 0


def test_delete_account_idempotent(client, sample_account):
    """Test idempotency: delete same account twice, both return 204."""
    # ── Arrange ───────────────────────────────
    account_id = sample_account["id"]

    # ── Act — First delete ───────────────────
    response1 = client.delete(f"/api/v1/accounts/{account_id}")

    # ── Assert — First delete succeeds ──────
    assert response1.status_code == 204

    # ── Act — Retry delete ───────────────────
    response2 = client.delete(f"/api/v1/accounts/{account_id}")

    # ── Assert — Retry also returns 204 ────
    assert response2.status_code == 204

    # ── Verify — Account no longer in list ──
    list_response = client.get("/api/v1/accounts")
    assert len(list_response.json()) == 0


def test_delete_account_not_found(client):
    """Test idempotency: delete non-existent account returns 204."""
    # ── Act ───────────────────────────────────
    response = client.delete("/api/v1/accounts/999999")

    # ── Assert ────────────────────────────────
    # Idempotent: return 204 even if not found
    assert response.status_code == 204


def test_delete_account_with_transactions(client, sample_account, sample_transaction):
    # ── Act ───────────────────────────────────
    response = client.delete(f"/api/v1/accounts/{sample_account['id']}")

    # ── Assert ────────────────────────────────
    assert response.status_code == 409
    assert response.json()["error"] == "Cannot delete account with existing transactions"


def test_create_pocket_with_valid_parent(client, sample_account):
    # ── Arrange ───────────────────────────────
    payload = {
        "name": "Jago Liburan",
        "bank": "JAGO",
        "type": "POCKET",
        "color": "#00B14F",
        "parent_id": sample_account["id"],
    }

    # ── Act ───────────────────────────────────
    response = client.post("/api/v1/accounts", json=payload)

    # ── Assert ────────────────────────────────
    assert response.status_code == 201
    data = response.json()
    assert data["parent_id"] == sample_account["id"]
    assert data["type"] == "POCKET"


def test_create_pocket_with_invalid_parent(client):
    # ── Arrange ───────────────────────────────
    payload = {
        "name": "Jago Liburan",
        "bank": "JAGO",
        "type": "POCKET",
        "color": "#00B14F",
        "parent_id": 999,  # non-existent
    }

    # ── Act ───────────────────────────────────
    response = client.post("/api/v1/accounts", json=payload)

    # ── Assert ────────────────────────────────
    assert response.status_code == 404
    assert response.json()["error"] == "Parent account not found"


def test_get_account_transactions(client, sample_account, sample_transaction):
    # ── Act ───────────────────────────────────
    response = client.get(f"/api/v1/accounts/{sample_account['id']}/transactions")

    # ── Assert ────────────────────────────────
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["account_id"] == sample_account["id"]