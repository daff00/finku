import pytest
from datetime import datetime
now = datetime.now()


def test_networth_no_data(client):
    # ── Act ───────────────────────────────────
    response = client.get("/api/v1/analytics/networth")

    # ── Assert ────────────────────────────────
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == "0"
    assert data["per_account"] == []


def test_networth_with_snapshot(client, sample_account, sample_balance):
    # ── Act ───────────────────────────────────
    response = client.get("/api/v1/analytics/networth")

    # ── Assert ────────────────────────────────
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == "32100000.00"
    assert len(data["per_account"]) == 1
    assert data["per_account"][0]["balance"] == "32100000.00"
    assert data["per_account"][0]["name"] == "BCA Main"
    assert data["per_account"][0]["color"] == "#0066AE"


def test_networth_with_transactions_after_snapshot(
    client, sample_account, sample_balance, sample_transaction, sample_expense
):
    # ── Assert ────────────────────────────────
    # snapshot = 32,100,000
    # + income  = 12,500,000
    # - expense =     48,000
    # = 44,552,000
    response = client.get("/api/v1/analytics/networth")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == "44552000.00"


def test_networth_no_snapshot_account(client, sample_account):
    # ── Act — account with no snapshot ────────
    response = client.get("/api/v1/analytics/networth")

    # ── Assert ────────────────────────────────
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == "0.00"
    assert data["per_account"][0]["balance"] == "0.00"


def test_networth_manual_expense_same_day_as_latest_snapshot_does_not_double_count(
    client,
):
    response = client.post(
        "/api/v1/accounts",
        json={
            "name": "BCA Manual",
            "bank": "BCA",
            "type": "SAVINGS",
            "color": "#0066AE",
            "currency": "IDR",
        },
    )
    account = response.json()

    response = client.post(
        "/api/v1/balances",
        json={
            "account_id": account["id"],
            "amount": "10000",
        },
    )
    assert response.status_code == 201

    response = client.post(
        "/api/v1/transactions",
        json={
            "account_id": account["id"],
            "date": "2026-09-01",
            "amount": "5000",
            "type": "INCOME",
            "category": "SALARY",
            "note": "Monthly salary",
        },
    )
    assert response.status_code == 201

    response = client.post(
        "/api/v1/transactions",
        json={
            "account_id": account["id"],
            "date": "2026-09-01",
            "amount": "2000",
            "type": "EXPENSE",
            "category": "FOOD",
            "note": "Lunch",
        },
    )
    assert response.status_code == 201

    response = client.get("/api/v1/analytics/networth")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == "13000.00"
    assert data["per_account"][0]["balance"] == "13000.00"


def test_networth_counts_transactions_when_no_snapshot_exists(client, sample_account):
    # Arrange: no snapshot exists, but the account does have a new income transaction.
    response = client.post(
        "/api/v1/transactions",
        json={
            "account_id": sample_account["id"],
            "date": "2026-09-01",
            "amount": "25000.00",
            "type": "INCOME",
            "category": "SALARY",
            "note": "Monthly salary",
        },
    )
    assert response.status_code == 201

    # Act
    response = client.get("/api/v1/analytics/networth")

    # Assert
    assert response.status_code == 200
    data = response.json()
    assert data["per_account"][0]["balance"] == "25000.00"
    assert data["total"] == "25000.00"


def test_monthly_summary(client, sample_transaction, sample_expense):
    # ── Act ───────────────────────────────────
    response = client.get("/api/v1/analytics/monthly?months=1")

    # ── Assert ────────────────────────────────
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    july = data[0]
    assert july["month"] == f"{now.year}-{now.month:02d}"
    assert july["income"] == "12500000.00"
    assert july["expenses"] == "48000.00"
    assert july["savings"] == "12452000.00"


def test_monthly_summary_default_6_months(client):
    # ── Act ───────────────────────────────────
    response = client.get("/api/v1/analytics/monthly")

    # ── Assert ────────────────────────────────
    assert response.status_code == 200
    assert len(response.json()) == 6


def test_monthly_summary_custom_months(client):
    # ── Act ───────────────────────────────────
    response = client.get("/api/v1/analytics/monthly?months=12")

    # ── Assert ────────────────────────────────
    assert response.status_code == 200
    assert len(response.json()) == 12


def test_category_breakdown(client, sample_expense):
    from datetime import datetime
    now = datetime.now()
    current_month = f"{now.year}-{now.month:02d}"

    response = client.get(f"/api/v1/analytics/categories?month={current_month}")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["category"] == "FOOD"
    assert data[0]["total"] == "48000.00"
    assert data[0]["percentage"] == 100.0


def test_category_breakdown_empty(client):
    # ── Act ───────────────────────────────────
    response = client.get("/api/v1/analytics/categories?month=2026-01")

    # ── Assert ────────────────────────────────
    assert response.status_code == 200
    assert response.json() == []


def test_category_breakdown_multiple_categories(
    client, sample_expense, sample_account
):
    from datetime import datetime
    now = datetime.now()
    current_month = f"{now.year}-{now.month:02d}"

    # ── Arrange — add shopping expense ────────
    client.post("/api/v1/transactions", json={
        "account_id": sample_account["id"],
        "date": f"{now.year}-{now.month:02d}-15",
        "amount": "215000",
        "type": "EXPENSE",
        "category": "SHOPPING",
        "note": "Shopee haul",
    })

    # ── Act ───────────────────────────────────
    response = client.get(f"/api/v1/analytics/categories?month={current_month}")

    # ── Assert ────────────────────────────────
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert data[0]["category"] == "SHOPPING"
    assert data[1]["category"] == "FOOD"
    total_pct = sum(item["percentage"] for item in data)
    assert round(total_pct, 1) == 100.0


def test_spending_by_account(client, sample_expense):
    from datetime import datetime
    now = datetime.now()
    current_month = f"{now.year}-{now.month:02d}"

    response = client.get(f"/api/v1/analytics/accounts?month={current_month}")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["balance"] == "48000.00"
    assert data[0]["color"] == "#0066AE"


def test_networth_mixed_currency_accounts(client):
    usd_account = client.post(
        "/api/v1/accounts",
        json={
            "name": "USD Savings",
            "bank": "BCA",
            "type": "SAVINGS",
            "color": "#0066AE",
            "currency": "USD",
        },
    )
    idr_account = client.post(
        "/api/v1/accounts",
        json={
            "name": "IDR Savings",
            "bank": "BCA",
            "type": "SAVINGS",
            "color": "#0066AE",
            "currency": "IDR",
        },
    )

    client.post(
        "/api/v1/transactions",
        json={
            "account_id": usd_account.json()["id"],
            "date": "2026-09-01",
            "amount": "20",
            "type": "INCOME",
            "category": "SALARY",
            "note": "USD salary",
            "currency": "USD",
        },
    )
    client.post(
        "/api/v1/transactions",
        json={
            "account_id": idr_account.json()["id"],
            "date": "2026-09-01",
            "amount": "100000",
            "type": "INCOME",
            "category": "SALARY",
            "note": "IDR salary",
            "currency": "IDR",
        },
    )

    response = client.get("/api/v1/analytics/networth")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == "406000.00"


def test_spending_by_account_empty(client):
    # ── Act ───────────────────────────────────
    response = client.get("/api/v1/analytics/accounts?month=2026-01")

    # ── Assert ────────────────────────────────
    assert response.status_code == 200
    assert response.json() == []