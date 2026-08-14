"""
Base parser — shared logic for all bank statement parsers.

Every bank parser inherits from BaseParser and implements:
    parse(file_bytes: bytes) -> list[ParsedTransaction]

The base class handles:
    - Deduplication via ref_id hash
    - Saving to database
    - Returning import results
"""

import hashlib
from dataclasses import dataclass
from datetime import date
from decimal import Decimal, InvalidOperation

from sqlalchemy.orm import Session

from app.models.models import (
    CategoryEnum,
    CurrencyEnum,
    SourceEnum,
    Transaction,
    TransactionTypeEnum,
)

# ── Data Classes ──────────────────────────────────────────────────────────────

@dataclass
class ParsedTransaction:
    """
    Intermediate representation of a parsed transaction.
    Bank parsers return a list of these.
    The base class converts them to DB Transaction objects.
    """
    date: date
    amount: Decimal
    type: TransactionTypeEnum
    description: str                                # raw description from bank
    note: str = ""                                  # cleaned note
    category: CategoryEnum = CategoryEnum.OTHER
    currency: CurrencyEnum = CurrencyEnum.IDR
    original_amount: Decimal | None = None
    original_currency: CurrencyEnum | None = None


@dataclass
class ImportResult:
    """Summary of an import operation."""
    total_parsed: int           # total rows found in file
    imported: int               # successfully imported
    duplicates: int             # skipped — already in DB
    errors: int                 # skipped — parse errors
    error_details: list[str]    # list of error messages


# ── Base Parser ───────────────────────────────────────────────────────────────

class BaseParser:
    """
    Base class for all bank statement parsers.
    Subclasses must implement the parse() method.
    """

    source: SourceEnum = SourceEnum.PDF

    def parse(self, file_bytes: bytes) -> list[ParsedTransaction]:
        """
        Parse raw file bytes into a list of ParsedTransaction objects.
        Must be implemented by each bank-specific parser.
        """
        raise NotImplementedError("Subclasses must implement parse()")

    def make_ref_id(
        self,
        account_id: int,
        txn_date: date,
        amount: Decimal,
        description: str,
    ) -> str:
        """
        Generate a unique hash for deduplication.
        Same transaction uploaded twice → same hash → skip.
        """
        raw = f"{account_id}:{txn_date}:{amount}:{description}"
        return hashlib.sha256(raw.encode()).hexdigest()

    def save_to_db(
        self,
        parsed: list[ParsedTransaction],
        account_id: int,
        user_id: int,
        db: Session,
    ) -> ImportResult:
        """
        Save parsed transactions to database.
        Skips duplicates, collects errors.
        """
        imported = 0
        duplicates = 0
        errors = 0
        error_details = []

        for item in parsed:
            try:
                ref_id = self.make_ref_id(
                    account_id,
                    item.date,
                    item.amount,
                    item.description,
                )

                # check for duplicate
                existing = db.query(Transaction).filter(
                    Transaction.ref_id == ref_id
                ).first()

                if existing:
                    duplicates += 1
                    continue

                tx = Transaction(
                    user_id=user_id,
                    account_id=account_id,
                    date=item.date,
                    amount=item.amount,
                    type=item.type,
                    category=item.category,
                    note=item.note or item.description,
                    source=self.source,
                    currency=item.currency,
                    ref_id=ref_id,
                    original_amount=item.original_amount,
                    original_currency=item.original_currency,
                )
                db.add(tx)
                imported += 1

            except Exception as e:
                errors += 1
                error_details.append(
                    f"Row {item.date} {item.description}: {str(e)}"
                )

        db.commit()

        return ImportResult(
            total_parsed=len(parsed),
            imported=imported,
            duplicates=duplicates,
            errors=errors,
            error_details=error_details,
        )


# ── Shared Utilities ──────────────────────────────────────────────────────────

def safe_decimal(value: str) -> Decimal:
    """
    Convert string amount to Decimal safely.
    Handles Indonesian number format: 1.000.000,50 → 1000000.50
    """
    if not value:
        return Decimal("0")
    cleaned = (
        value.strip()
        .replace("Rp", "")
        .replace("IDR", "")
        .replace(" ", "")
        .replace(".", "")
        .replace(",", ".")
    )
    try:
        return Decimal(cleaned)
    except InvalidOperation:
        return Decimal("0")


def auto_categorize(description: str) -> CategoryEnum:
    """
    Auto-categorize transactions based on description keywords.
    Returns CategoryEnum.OTHER if no match found.
    """
    desc = description.upper()

    rules: list[tuple[CategoryEnum, list[str]]] = [
        (CategoryEnum.SALARY, [
            "GAJI", "SALARY", "PAYROLL", "THR", "BONUS",
        ]),
        (CategoryEnum.FOOD, [
            "GRAB FOOD", "GOFOOD", "SHOPEEFOOD", "MCDONALD", "KFC",
            "INDOMARET", "ALFAMART", "SUPERINDO", "HYPERMART",
            "KOPI", "COFFEE", "RESTO", "RESTAURANT", "CAFE",
            "WARTEG", "MAKAN",
        ]),
        (CategoryEnum.TRANSPORT, [
            "GRAB", "GOJEK", "GOCAR", "GRABCAR", "TRANSJAKARTA",
            "KRL", "MRT", "LRT", "BUSWAY", "OJEK",
            "PERTAMINA", "SHELL", "PARKIR",
        ]),
        (CategoryEnum.SHOPPING, [
            "SHOPEE", "TOKOPEDIA", "LAZADA", "BLIBLI", "ZALORA",
            "H&M", "ZARA", "UNIQLO", "STORE", "TOKO",
        ]),
        (CategoryEnum.BILLS, [
            "PLN", "PDAM", "TELKOM", "INDIHOME", "FIRSTMEDIA",
            "BPJS", "INSURANCE", "ASURANSI", "TAGIHAN",
            "NETFLIX", "SPOTIFY", "YOUTUBE",
        ]),
        (CategoryEnum.INVESTMENT, [
            "BIBIT", "AJAIB", "STOCKBIT", "IPOT",
            "SAHAM", "REKSADANA", "OBLIGASI",
            "BBCA", "BBRI", "BMRI",
        ]),
        (CategoryEnum.ENTERTAINMENT, [
            "CINEMA", "BIOSKOP", "XXI", "CGV",
            "GAME", "STEAM", "PLAYSTATION", "XBOX",
        ]),
        (CategoryEnum.HEALTH, [
            "APOTEK", "PHARMACY", "RUMAH SAKIT",
            "HOSPITAL", "KLINIK", "DOKTER", "HALODOC",
        ]),
        (CategoryEnum.EDUCATION, [
            "SEKOLAH", "UNIVERSITAS", "KAMPUS", "KULIAH",
            "COURSE", "UDEMY", "COURSERA",
        ]),
    ]

    for category, keywords in rules:
        if any(k in desc for k in keywords):
            return category

    return CategoryEnum.OTHER