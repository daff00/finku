import pytest


def test_create_transaction(client, sample_account):
    # ── Arrange ───────────────────────────────
    payload = {
        "account_id": sample_account["id"],
        "date": "2026-07-25",
        "amount": "12500000",
        "type": "INCOME",
        "category": "SALARY",
        "note": "Gaji bulan Juli",
    }

    # ── Act ───────────────────────────────────
    response = client.post("/api/v1/transactions", json=payload)

    # ── Assert ────────────────────────────────
    assert response.status_code == 201
    data = response.json()
    assert data["amount"] == "12500000.00"
    assert data["type"] == "INCOME"
    assert data["category"] == "SALARY"
    assert data["account_id"] == sample_account["id"]
    assert data["ref_id"] is not None


def test_create_transaction_account_not_found(client):
    # ── Arrange ───────────────────────────────
    payload = {
        "account_id": 999,
        "date": "2026-07-25",
        "amount": "12500000",
        "type": "INCOME",
        "category": "SALARY",
    }

    # ── Act ───────────────────────────────────
    response = client.post("/api/v1/transactions", json=payload)

    # ── Assert ────────────────────────────────
    assert response.status_code == 404
    assert response.json()["error"] == "Account not found"


def test_create_duplicate_transaction(client, sample_account, sample_transaction):
    from datetime import datetime
    now = datetime.now()

    # print to see what sample_transaction returned
    print(f"\nsample_transaction: {sample_transaction}")

    payload = {
        "account_id": sample_account["id"],
        "date": f"{now.year}-{now.month:02d}-25",
        "amount": "12500000",
        "type": "INCOME",
        "category": "SALARY",
        "note": "Gaji bulan Juli",
    }

    print(f"duplicate payload: {payload}")

    response = client.post("/api/v1/transactions", json=payload)
    print(f"response: {response.json()}")
    assert response.status_code == 409

    # ── Act ───────────────────────────────────
    response = client.post("/api/v1/transactions", json=payload)

    # ── Assert ────────────────────────────────
    assert response.status_code == 409
    assert "Duplicate" in response.json()["error"]


def test_list_transactions(client, sample_transaction):
    # ── Act ───────────────────────────────────
    response = client.get("/api/v1/transactions")

    # ── Assert ────────────────────────────────
    assert response.status_code == 200
    assert len(response.json()) == 1


def test_list_transactions_filter_by_account(client, sample_account, sample_transaction):
    # ── Act ───────────────────────────────────
    response = client.get(
        f"/api/v1/transactions?account_id={sample_account['id']}"
    )

    # ── Assert ────────────────────────────────
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["account_id"] == sample_account["id"]


def test_list_transactions_filter_by_type(client, sample_transaction, sample_expense):
    # ── Act ───────────────────────────────────
    response = client.get("/api/v1/transactions?type=INCOME")

    # ── Assert ────────────────────────────────
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["type"] == "INCOME"


def test_list_transactions_filter_by_category(
    client, sample_transaction, sample_expense
):
    # ── Act ───────────────────────────────────
    response = client.get("/api/v1/transactions?category=FOOD")

    # ── Assert ────────────────────────────────
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["category"] == "FOOD"


def test_list_transactions_filter_by_month(client, sample_transaction):
    from datetime import datetime
    now = datetime.now()
    current_month = f"{now.year}-{now.month:02d}"

    # ── Act — correct month ───────────────────
    response = client.get(f"/api/v1/transactions?month={current_month}")
    assert response.status_code == 200
    assert len(response.json()) == 1

    # ── Act — wrong month ─────────────────────
    response = client.get("/api/v1/transactions?month=2020-01")
    assert response.status_code == 200
    assert len(response.json()) == 0


def test_get_transaction(client, sample_transaction):
    # ── Act ───────────────────────────────────
    response = client.get(f"/api/v1/transactions/{sample_transaction['id']}")

    # ── Assert ────────────────────────────────
    assert response.status_code == 200
    assert response.json()["id"] == sample_transaction["id"]


def test_get_transaction_not_found(client):
    # ── Act ───────────────────────────────────
    response = client.get("/api/v1/transactions/999")

    # ── Assert ────────────────────────────────
    assert response.status_code == 404
    assert response.json()["error"] == "Transaction not found"


def test_update_transaction(client, sample_transaction):
    # ── Arrange ───────────────────────────────
    payload = {"note": "Updated note", "category": "OTHER"}

    # ── Act ───────────────────────────────────
    response = client.patch(
        f"/api/v1/transactions/{sample_transaction['id']}",
        json=payload,
    )

    # ── Assert ────────────────────────────────
    assert response.status_code == 200
    data = response.json()
    assert data["note"] == "Updated note"
    assert data["category"] == "OTHER"
    assert data["amount"] == sample_transaction["amount"]  # unchanged


def test_update_transfer_transaction_blocked(client, sample_transfer):
    # ── Arrange ───────────────────────────────
    transfer_id = sample_transfer[0]["id"]

    # ── Act ───────────────────────────────────
    response = client.patch(
        f"/api/v1/transactions/{transfer_id}",
        json={"note": "Try to edit transfer"},
    )

    # ── Assert ────────────────────────────────
    assert response.status_code == 400
    assert "Cannot edit transfer" in response.json()["error"]


def test_delete_transaction(client, sample_transaction):
    # ── Act ───────────────────────────────────
    response = client.delete(f"/api/v1/transactions/{sample_transaction['id']}")

    # ── Assert ────────────────────────────────
    assert response.status_code == 204

    # verify deleted
    get_response = client.get(f"/api/v1/transactions/{sample_transaction['id']}")
    assert get_response.status_code == 404


def test_delete_transaction_not_found(client):
    # ── Act ───────────────────────────────────
    response = client.delete("/api/v1/transactions/999")

    # ── Assert ────────────────────────────────
    assert response.status_code == 404


def test_create_transfer(client, sample_account, sample_jago_account):
    # ── Arrange ───────────────────────────────
    payload = {
        "from_account_id": sample_account["id"],
        "to_account_id": sample_jago_account["id"],
        "date": "2026-07-01",
        "amount": "5000000",
        "note": "Transfer to Jago",
    }

    # ── Act ───────────────────────────────────
    response = client.post("/api/v1/transactions/transfer", json=payload)

    # ── Assert ────────────────────────────────
    assert response.status_code == 201
    data = response.json()
    assert len(data) == 2  # two transactions created

    from_tx = data[0]
    to_tx = data[1]

    assert from_tx["account_id"] == sample_account["id"]
    assert from_tx["type"] == "TRANSFER"
    assert to_tx["account_id"] == sample_jago_account["id"]
    assert to_tx["type"] == "TRANSFER"
    assert from_tx["amount"] == to_tx["amount"]


def test_create_transfer_same_account(client, sample_account):
    # ── Arrange ───────────────────────────────
    payload = {
        "from_account_id": sample_account["id"],
        "to_account_id": sample_account["id"],  # same account!
        "date": "2026-07-01",
        "amount": "5000000",
    }

    # ── Act ───────────────────────────────────
    response = client.post("/api/v1/transactions/transfer", json=payload)

    # ── Assert ────────────────────────────────
    assert response.status_code == 400
    assert "same account" in response.json()["error"]


def test_create_transfer_source_not_found(client, sample_jago_account):
    # ── Arrange ───────────────────────────────
    payload = {
        "from_account_id": 999,
        "to_account_id": sample_jago_account["id"],
        "date": "2026-07-01",
        "amount": "5000000",
    }

    # ── Act ───────────────────────────────────
    response = client.post("/api/v1/transactions/transfer", json=payload)

    # ── Assert ────────────────────────────────
    assert response.status_code == 404
    assert response.json()["error"] == "Source account not found"


def test_delete_transfer_cascades(client, sample_transfer):
    # ── Arrange ───────────────────────────────
    from_tx_id = sample_transfer[0]["id"]
    to_tx_id = sample_transfer[1]["id"]

    # ── Act — delete one side ─────────────────
    response = client.delete(f"/api/v1/transactions/{from_tx_id}")

    # ── Assert — both sides deleted ───────────
    assert response.status_code == 204

    from_response = client.get(f"/api/v1/transactions/{from_tx_id}")
    assert from_response.status_code == 404

    to_response = client.get(f"/api/v1/transactions/{to_tx_id}")
    assert to_response.status_code == 404