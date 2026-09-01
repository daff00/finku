from pathlib import Path

from app.models.models import Account, AccountTypeEnum, BankEnum, Transaction, User


def _load_bca_pdf_bytes() -> bytes:
    """Build a tiny synthetic PDF with the same row/column layout the BCA parser expects."""
    body = (
        b"BT /F1 12 Tf "
        b"1 0 0 1 20 760 Tm (PERIODE : AGUSTUS 2025) Tj "
        b"1 0 0 1 20 742 Tm (TANGGAL) Tj "
        b"1 0 0 1 90 742 Tm (KETERANGAN) Tj "
        b"1 0 0 1 430 742 Tm (MUTASI) Tj "
        b"1 0 0 1 20 724 Tm (01/08) Tj "
        b"1 0 0 1 90 724 Tm (GOJEK) Tj "
        b"1 0 0 1 430 724 Tm (-250000) Tj "
        b"1 0 0 1 20 706 Tm (02/08) Tj "
        b"1 0 0 1 90 706 Tm (GAJI BULANAN) Tj "
        b"1 0 0 1 430 706 Tm (5000000) Tj "
        b"ET"
    )
    objects = [
        b"<< /Type /Catalog /Pages 2 0 R >>",
        b"<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
        b"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
        b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
        b"<< /Length %d >>\nstream\n" % len(body) + body + b"\nendstream",
    ]
    pdf = bytearray(b"%PDF-1.4\n")
    offsets = [0]
    for i, obj in enumerate(objects, 1):
        offsets.append(len(pdf))
        pdf.extend(f"{i} 0 obj\n".encode())
        pdf.extend(obj)
        pdf.extend(b"\nendobj\n")
    xref = len(pdf)
    pdf.extend(f"xref\n0 {len(objects) + 1}\n".encode())
    pdf.extend(b"0000000000 65535 f \n")
    for off in offsets[1:]:
        pdf.extend(f"{off:010d} 00000 n \n".encode())
    pdf.extend(f"trailer\n<< /Root 1 0 R /Size {len(objects) + 1} >>\nstartxref\n{xref}\n%%EOF\n".encode())
    return bytes(pdf)


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


def test_import_bca_statement_idempotent(client, sample_account, db):
    """Test idempotency: upload same PDF twice, second time skips duplicates."""
    pdf_bytes = _load_bca_pdf_bytes()
    
    # ── Act — First import ────────────────────
    response1 = client.post(
        "/api/v1/import/",
        data={
            "account_id": str(sample_account["id"]),
            "bank": "BCA",
        },
        files={
            "file": ("pdf-bca.pdf", pdf_bytes, "application/pdf"),
        },
    )

    # ── Assert — First import succeeds ──────
    assert response1.status_code == 201
    data1 = response1.json()
    imported_count_1 = data1["imported"]
    assert imported_count_1 > 0
    assert data1["duplicates"] == 0
    assert data1["errors"] == 0

    # ── Act — Re-import same file ───────────
    response2 = client.post(
        "/api/v1/import/",
        data={
            "account_id": str(sample_account["id"]),
            "bank": "BCA",
        },
        files={
            "file": ("pdf-bca.pdf", pdf_bytes, "application/pdf"),
        },
    )

    # ── Assert — Re-import skips duplicates ─
    assert response2.status_code == 201
    data2 = response2.json()
    assert data2["imported"] == 0  # No new transactions
    assert data2["duplicates"] == imported_count_1  # All are duplicates
    assert data2["errors"] == 0
    assert data2["total_parsed"] == imported_count_1  # Same transactions parsed

    # ── Verify — Total transaction count unchanged ──
    saved_count = db.query(Transaction).filter(
        Transaction.account_id == sample_account["id"]
    ).count()
    assert saved_count == imported_count_1  # No duplicates created


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


def test_import_result_includes_error_details(client, sample_account):
    """Test that ImportResult response includes error_details array."""
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
    
    # Verify error_details is present (even if empty list)
    assert "error_details" in data
    assert isinstance(data["error_details"], list)
    
    # On successful import, error_details should be empty
    if data["errors"] == 0:
        assert data["error_details"] == []
