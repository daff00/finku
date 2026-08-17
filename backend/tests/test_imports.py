from pathlib import Path

from app.models.models import Account, AccountTypeEnum, BankEnum, Transaction, User


def _load_bca_pdf_bytes() -> bytes:
    pdf_path = Path(__file__).resolve().parents[1] / "app" / "parsers" / "temp_doc" / "pdf-bca.pdf"
    return pdf_path.read_bytes()


def test_import_bca_statement(client, sample_account, db):
    response = client.post(
        "/api/v1/import/",
        data={
            "account_id": str(sample_account["id"]),
            "bank": "BCA",
        },
        files={
            "file": ("pdf-bca.pdf", _load_bca_pdf_bytes(), "application/pdf"),
        },
    )

    assert response.status_code == 201
    data = response.json()
    assert data["total_parsed"] > 0
    assert data["imported"] > 0
    assert data["errors"] == 0

    saved_count = db.query(Transaction).filter(
        Transaction.account_id == sample_account["id"]
    ).count()
    assert saved_count == data["imported"]


def test_import_rejects_cross_user_account(client, db):
    other_user = User(
        username="other-user",
        password_hash="hash",
        display_name="Other User",
        is_active=True,
    )
    db.add(other_user)
    db.commit()
    db.refresh(other_user)

    other_account = Account(
        user_id=other_user.id,
        name="Other BCA",
        bank=BankEnum.BCA,
        type=AccountTypeEnum.SAVINGS,
        color="#0066AE",
    )
    db.add(other_account)
    db.commit()
    db.refresh(other_account)

    response = client.post(
        "/api/v1/import/",
        data={
            "account_id": str(other_account.id),
            "bank": "BCA",
        },
        files={
            "file": ("pdf-bca.pdf", _load_bca_pdf_bytes(), "application/pdf"),
        },
    )

    assert response.status_code == 404
    assert response.json()["error"] == "Account not found"


def test_import_rejects_unsupported_or_unreadable_input(client, sample_account):
    response = client.post(
        "/api/v1/import/",
        data={
            "account_id": str(sample_account["id"]),
            "bank": "BCA",
        },
        files={
            "file": ("broken.txt", b"not a pdf", "text/plain"),
        },
    )

    assert response.status_code == 400
    assert "Unable to parse statement" in response.json()["error"]
