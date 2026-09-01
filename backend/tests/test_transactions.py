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


def test_create_transaction_uses_account_currency(client):
    account_payload = {
        "name": "USD Account",
        "bank": "BCA",
        "type": "SAVINGS",
        "color": "#0066AE",
        "currency": "USD",
    }
    account_response = client.post("/api/v1/accounts", json=account_payload)
    assert account_response.status_code == 201
    account_id = account_response.json()["id"]

    payload = {
        "account_id": account_id,
        "date": "2026-07-25",
        "amount": "20.00",
        "type": "INCOME",
        "category": "SALARY",
        "note": "USD salary",
    }

    response = client.post("/api/v1/transactions", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["currency"] == "USD"
    assert data["amount"] == "20.00"


def test_create_transaction_rejects_currency_mismatch(client):
    account_payload = {
        "name": "USD Account",
        "bank": "BCA",
        "type": "SAVINGS",
        "color": "#0066AE",
        "currency": "USD",
    }
    account_response = client.post("/api/v1/accounts", json=account_payload)
    assert account_response.status_code == 201
    account_id = account_response.json()["id"]

    payload = {
        "account_id": account_id,
        "date": "2026-07-25",
        "amount": "12500000",
        "type": "INCOME",
        "category": "SALARY",
        "note": "Wrong currency",
        "currency": "IDR",
    }

    response = client.post("/api/v1/transactions", json=payload)
    assert response.status_code == 400
    assert "currency" in response.json()["error"].lower()


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


def test_create_duplicate_transaction_retry(client, sample_account):
    """Test idempotency: retry same transaction request twice, expect 409 both times."""
    from datetime import datetime
    now = datetime.now()

    # ── Arrange ───────────────────────────────
    payload = {
        "account_id": sample_account["id"],
        "date": f"{now.year}-{now.month:02d}-20",
        "amount": "5000000",
        "type": "INCOME",
        "category": "SALARY",
        "note": "Retry test transaction",
    }

    # ── Act — First request ───────────────────
    response1 = client.post("/api/v1/transactions", json=payload)

    # ── Assert — First request succeeds ──────
    assert response1.status_code == 201
    tx1_data = response1.json()
    assert tx1_data["ref_id"] is not None

    # ── Act — Retry request ──────────────────
    response2 = client.post("/api/v1/transactions", json=payload)

    # ── Assert — Retry returns 409 ──────────
    assert response2.status_code == 409
    assert "Duplicate" in response2.json()["error"]

    # ── Act — Second retry ───────────────────
    response3 = client.post("/api/v1/transactions", json=payload)

    # ── Assert — Second retry also 409 ──────
    assert response3.status_code == 409


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


def test_delete_transaction_idempotent(client, sample_transaction):
    """Test idempotency: delete same transaction twice, both return 204."""
    # ── Arrange ───────────────────────────────
    transaction_id = sample_transaction["id"]

    # ── Act — First delete ───────────────────
    response1 = client.delete(f"/api/v1/transactions/{transaction_id}")

    # ── Assert — First delete succeeds ──────
    assert response1.status_code == 204

    # ── Act — Retry delete ───────────────────
    response2 = client.delete(f"/api/v1/transactions/{transaction_id}")

    # ── Assert — Retry also returns 204 ────
    assert response2.status_code == 204

    # ── Verify — Transaction is gone ────────
    get_response = client.get(f"/api/v1/transactions/{transaction_id}")
    assert get_response.status_code == 404


def test_delete_nonexistent_transaction(client):
    """Test idempotency: delete non-existent transaction returns 204."""
    # ── Act ───────────────────────────────────
    response = client.delete("/api/v1/transactions/999999")

    # ── Assert ────────────────────────────────
    assert response.status_code == 204


def test_delete_transaction_not_found(client):
    # ── Act ───────────────────────────────────
    response = client.delete("/api/v1/transactions/999")

    # ── Assert ────────────────────────────────
    # Idempotent: return 204 even if not found
    assert response.status_code == 204


def test_create_transfer(client, sample_account, sample_jago_account):
    client.post(
        "/api/v1/balances",
        json={
            "account_id": sample_account["id"],
            "amount": "20000000",
        },
    )
    # ── Arrange ───────────────────────────────
    payload = {
        "from_account_id": sample_account["id"],
        "to_account_id": sample_jago_account["id"],
        "date": "2026-07-02",
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


def test_create_transfer_rejects_insufficient_funds(client, sample_account, sample_jago_account):
    client.post(
        "/api/v1/balances",
        json={"account_id": sample_account["id"], "amount": "1000"},
    )

    payload = {
        "from_account_id": sample_account["id"],
        "to_account_id": sample_jago_account["id"],
        "date": "2026-07-01",
        "amount": "2000",
        "note": "Transfer above balance",
    }

    response = client.post("/api/v1/transactions/transfer", json=payload)

    assert response.status_code == 400
    assert "insufficient" in response.json()["error"].lower()


def test_create_cross_currency_transfer(client):
    from_account = client.post(
        "/api/v1/accounts",
        json={
            "name": "USD Wallet",
            "bank": "BCA",
            "type": "SAVINGS",
            "color": "#0066AE",
            "currency": "USD",
        },
    ).json()
    client.post(
        "/api/v1/balances",
        json={
            "account_id": from_account["id"],
            "amount": "50",
        },
    )
    to_account = client.post(
        "/api/v1/accounts",
        json={
            "name": "IDR Wallet",
            "bank": "JAGO",
            "type": "POCKET",
            "color": "#00B14F",
            "currency": "IDR",
        },
    ).json()

    payload = {
        "from_account_id": from_account["id"],
        "to_account_id": to_account["id"],
        "date": "2026-07-02",
        "amount": "20",
        "from_currency": "USD",
        "to_currency": "IDR",
        "from_amount": "20",
        "to_amount": "320000",
        "rate_applied": "16000",
        "note": "USD to IDR transfer",
    }

    response = client.post("/api/v1/transactions/transfer", json=payload)

    assert response.status_code == 201
    data = response.json()
    assert data[0]["currency"] == "USD"
    assert data[1]["currency"] == "IDR"
    assert data[0]["amount"] == "20.00"
    assert data[1]["amount"] == "320000.00"


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


def test_transfer_to_zero_balance_updates_latest_balance(client, sample_account, sample_jago_account):
    client.post(
        "/api/v1/transactions",
        json={
            "account_id": sample_account["id"],
            "date": "2026-09-01",
            "amount": "250000.00",
            "type": "INCOME",
            "category": "SALARY",
            "note": "Seed source funds",
        },
    )

    response = client.post(
        "/api/v1/transactions/transfer",
        json={
            "from_account_id": sample_account["id"],
            "to_account_id": sample_jago_account["id"],
            "date": "2026-09-02",
            "amount": "125000",
            "note": "Transfer into zero-balance account",
        },
    )

    assert response.status_code == 201

    destination_balance = client.get(f"/api/v1/balances/{sample_jago_account['id']}/latest")
    assert destination_balance.status_code == 200
    assert destination_balance.json()["amount"] == "125000.00"


def test_create_transfer_multiple_same_day_allowed_with_distinct_notes(client, sample_account, sample_jago_account):
    client.post(
        "/api/v1/transactions",
        json={
            "account_id": sample_account["id"],
            "date": "2026-09-01",
            "amount": "500000.00",
            "type": "INCOME",
            "category": "SALARY",
            "note": "Seed source funds",
        },
    )

    first = client.post(
        "/api/v1/transactions/transfer",
        json={
            "from_account_id": sample_account["id"],
            "to_account_id": sample_jago_account["id"],
            "date": "2026-09-05",
            "amount": "7500",
            "note": "First transfer of the day",
        },
    )
    second = client.post(
        "/api/v1/transactions/transfer",
        json={
            "from_account_id": sample_account["id"],
            "to_account_id": sample_jago_account["id"],
            "date": "2026-09-05",
            "amount": "7500",
            "note": "Second transfer of the day",
        },
    )

    assert first.status_code == 201
    assert second.status_code == 201


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


def test_create_transfer_idempotent(client, sample_account, sample_jago_account):
    """Test idempotency: retry same transfer twice, expect 409 on retry."""
    client.post(
        "/api/v1/balances",
        json={
            "account_id": sample_account["id"],
            "amount": "25000000",
        },
    )
    # ── Arrange ───────────────────────────────
    payload = {
        "from_account_id": sample_account["id"],
        "to_account_id": sample_jago_account["id"],
        "date": "2026-08-15",
        "amount": "10000000",
        "note": "Idempotency test transfer",
    }

    # ── Act — First request ───────────────────
    response1 = client.post("/api/v1/transactions/transfer", json=payload)

    # ── Assert — First request succeeds ──────
    assert response1.status_code == 201
    data1 = response1.json()
    assert len(data1) == 2
    from_tx_id_1 = data1[0]["id"]

    # ── Act — Retry request ──────────────────
    response2 = client.post("/api/v1/transactions/transfer", json=payload)

    # ── Assert — Retry returns 409 ──────────
    assert response2.status_code == 409
    assert "Duplicate" in response2.json()["error"]

    # ── Act — Verify no new transactions created ──
    response3 = client.get("/api/v1/transactions")
    assert response3.status_code == 200
    assert len(response3.json()) == 2  # Only the original 2 transfers


def test_create_transfer_with_fee_idempotent(client, sample_account, sample_jago_account):
    """Test idempotency: transfer with fee included, retry twice."""
    client.post(
        "/api/v1/balances",
        json={
            "account_id": sample_account["id"],
            "amount": "20000000",
        },
    )
    # ── Arrange ───────────────────────────────
    payload = {
        "from_account_id": sample_account["id"],
        "to_account_id": sample_jago_account["id"],
        "date": "2026-08-20",
        "amount": "7500000",
        "fee": "10000",
        "note": "Transfer with fee",
    }

    # ── Act — First request ───────────────────
    response1 = client.post("/api/v1/transactions/transfer", json=payload)

    # ── Assert — First request succeeds ──────
    assert response1.status_code == 201
    data1 = response1.json()
    assert len(data1) == 2  # from_tx, to_tx (fee is separate)

    # ── Act — Retry request ──────────────────
    response2 = client.post("/api/v1/transactions/transfer", json=payload)

    # ── Assert — Retry returns 409 ──────────
    assert response2.status_code == 409
    assert "Duplicate" in response2.json()["error"]

    # ── Act — Verify only 3 transactions created (from, to, fee) ──
    response3 = client.get("/api/v1/transactions")
    assert response3.status_code == 200
    assert len(response3.json()) == 3  # from_tx, to_tx, fee_tx


def test_create_transfer_rollback_on_failure(client, sample_account, sample_jago_account, db):
    """Test rollback: if database error occurs, no orphaned transactions remain."""
    client.post(
        "/api/v1/balances",
        json={
            "account_id": sample_account["id"],
            "amount": "5000000",
        },
    )
    # ── Arrange ───────────────────────────────
    payload = {
        "from_account_id": sample_account["id"],
        "to_account_id": sample_jago_account["id"],
        "date": "2026-08-25",
        "amount": "3000000",
        "note": "Rollback test transfer",
    }

    # ── Act — Mock database failure by making transaction unique constraint fail
    # Create a transaction with the same ref_id that would be created
    import hashlib
    from datetime import date
    ref_id = hashlib.sha256(
        f"{sample_account['id']}:{payload['date']}:{payload['amount']}:OUT".encode()
    ).hexdigest()

    # Add a conflicting transaction to cause a unique constraint violation
    from app.models.models import Transaction, TransactionTypeEnum, CategoryEnum
    conflict_tx = Transaction(
        user_id=1,  # same user
        account_id=sample_account["id"],
        date=date.fromisoformat(payload["date"]),
        amount=payload["amount"],
        type=TransactionTypeEnum.TRANSFER,
        category=CategoryEnum.TRANSFER,
        note="Conflict",
        ref_id=ref_id,
    )
    db.add(conflict_tx)
    db.commit()

    # ── Act — Try to create transfer that will conflict ──
    response = client.post("/api/v1/transactions/transfer", json=payload)

    # ── Assert — Should return 409 due to duplicate ref_id ──
    assert response.status_code == 409
    assert "Duplicate" in response.json()["error"]

    # ── Verify — Only 1 transaction exists (the conflicting one) ──
    all_txs = db.query(Transaction).filter(
        Transaction.account_id.in_([sample_account["id"], sample_jago_account["id"]])
    ).all()
    assert len(all_txs) == 1  # No orphaned transactions