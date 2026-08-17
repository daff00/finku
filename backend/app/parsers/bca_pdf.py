"""
BCA PDF Statement Parser

Uses coordinate-based word extraction since BCA's table
structure is complex with merged cells and multi-line rows.
"""

import io
import re
from datetime import date
from decimal import Decimal
from itertools import groupby

import pdfplumber

from app.models.models import SourceEnum, TransactionTypeEnum
from app.parsers.base_parser import (
    BaseParser,
    ParsedTransaction,
    auto_categorize,
    safe_decimal,
)

# Indonesian month → number
BULAN = {
    "JANUARI": 1, "FEBRUARI": 2, "MARET": 3, "APRIL": 4,
    "MEI": 5, "JUNI": 6, "JULI": 7, "AGUSTUS": 8,
    "SEPTEMBER": 9, "OKTOBER": 10, "NOVEMBER": 11, "DESEMBER": 12,
}

# Column X boundaries (based on actual BCA PDF coordinates)
COL_TANGGAL_MAX    = 60
COL_KETERANGAN_MAX = 340
COL_CBG_MAX        = 380
COL_MUTASI_MAX     = 480
# SALDO: x0 > 480


class BcaPdfParser(BaseParser):
    source = SourceEnum.PDF

    def parse(self, file_bytes: bytes) -> list[ParsedTransaction]:
        year, month = self._extract_period(file_bytes)
        all_words = self._extract_all_words(file_bytes)
        rows = self._group_words_into_rows(all_words)
        transactions = self._parse_rows(rows, year, month)
        return transactions

    # ── Period Extraction ─────────────────────────────────────────

    def _extract_period(self, file_bytes: bytes) -> tuple[int, int]:
        """Extract year and month from PERIODE header."""
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            for page in pdf.pages:
                text = page.extract_text() or ""
                match = re.search(
                    r"PERIODE\s*:\s*([A-Z]+)\s+(\d{4})",
                    text.upper()
                )
                if match:
                    month_name = match.group(1)
                    year = int(match.group(2))
                    month = BULAN.get(month_name, 1)
                    return year, month

        from datetime import datetime
        now = datetime.now()
        return now.year, now.month

    # ── Word Extraction ───────────────────────────────────────────

    def _extract_all_words(self, file_bytes: bytes) -> list[dict]:
        """Extract all words with coordinates from all pages."""
        all_words = []
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            for page_num, page in enumerate(pdf.pages):
                words = page.extract_words(
                    x_tolerance=3,
                    y_tolerance=3,
                    keep_blank_chars=False,
                )
                # add page offset to doctop so pages don't overlap
                for word in words:
                    word["page"] = page_num
                all_words.extend(words)
        return all_words

    # ── Row Grouping ──────────────────────────────────────────────

    def _group_words_into_rows(
        self, words: list[dict]
    ) -> list[dict]:
        """
        Group words by their vertical position (top coordinate).
        Words within 3px of each other = same row.
        Returns list of row dicts with column values.
        """
        if not words:
            return []

        # sort by page then top position
        words_sorted = sorted(words, key=lambda w: (w["page"], w["top"]))

        rows = []
        current_row_words = [words_sorted[0]]
        current_top = words_sorted[0]["top"]
        current_page = words_sorted[0]["page"]

        for word in words_sorted[1:]:
            # new row if Y position changes significantly or new page
            if (
                word["page"] != current_page
                or abs(word["top"] - current_top) > 4
            ):
                rows.append(self._words_to_row(current_row_words))
                current_row_words = [word]
                current_top = word["top"]
                current_page = word["page"]
            else:
                current_row_words.append(word)

        # don't forget the last row
        if current_row_words:
            rows.append(self._words_to_row(current_row_words))

        return rows

    def _words_to_row(self, words: list[dict]) -> dict:
        """
        Convert a list of words (same Y position) into column dict.
        Uses X coordinate to assign each word to correct column.
        """
        tanggal    = []
        keterangan = []
        cbg        = []
        mutasi     = []
        saldo      = []

        for word in words:
            x = word["x0"]
            text = word["text"]

            if x <= COL_TANGGAL_MAX:
                tanggal.append(text)
            elif x <= COL_KETERANGAN_MAX:
                keterangan.append(text)
            elif x <= COL_CBG_MAX:
                cbg.append(text)
            elif x <= COL_MUTASI_MAX:
                mutasi.append(text)
            else:
                saldo.append(text)

        return {
            "tanggal":    " ".join(tanggal),
            "keterangan": " ".join(keterangan),
            "cbg":        " ".join(cbg),
            "mutasi":     " ".join(mutasi),
            "saldo":      " ".join(saldo),
            "top":        words[0]["top"],
            "page":       words[0]["page"],
        }

    # ── Transaction Parsing ───────────────────────────────────────

    def _parse_rows(
        self,
        rows: list[dict],
        year: int,
        month: int,
    ) -> list[ParsedTransaction]:
        """
        Convert grouped rows into ParsedTransaction objects.
        Handles multi-line transactions by accumulating
        description lines until next date row.
        """
        results = []

        # skip header rows
        skip_keywords = {
            "TANGGAL", "KETERANGAN", "MUTASI", "SALDO",
            "CBG", "PERIODE", "REKENING", "HALAMAN",
            "CATATAN", "INDONESIA", "BANTEN",
        }

        current_date = None
        current_desc_lines = []
        current_mutasi = ""

        def flush_current():
            """Save accumulated transaction."""
            if not current_date or not current_mutasi:
                return None
            amount, txn_type = self._parse_mutasi(current_mutasi)
            if amount == Decimal("0"):
                return None
            description = self._clean_description(
                " ".join(current_desc_lines)
            )
            return ParsedTransaction(
                date=current_date,
                amount=amount,
                type=txn_type,
                description=description,
                note=description,
                category=auto_categorize(description),
            )

        for row in rows:
            tanggal    = row["tanggal"].strip()
            keterangan = row["keterangan"].strip()
            mutasi     = row["mutasi"].strip()

            # skip empty rows
            if not tanggal and not keterangan and not mutasi:
                continue

            # skip header/footer rows
            if any(k in keterangan.upper() for k in skip_keywords):
                if not re.match(r"\d{1,2}/\d{1,2}", tanggal):
                    continue

            # skip SALDO AWAL
            if "SALDO AWAL" in keterangan.upper():
                continue

            # detect new transaction — row has a date
            date_match = re.match(r"(\d{1,2})/(\d{1,2})", tanggal)
            if date_match:
                # save previous transaction
                tx = flush_current()
                if tx:
                    results.append(tx)

                # start new transaction
                day = int(date_match.group(1))
                txn_month = int(date_match.group(2))
                txn_year = year - 1 if txn_month > month else year

                try:
                    current_date = date(txn_year, txn_month, day)
                except ValueError:
                    current_date = None

                current_desc_lines = [keterangan] if keterangan else []
                current_mutasi = mutasi

            else:
                # continuation line — add to current description
                if keterangan:
                    current_desc_lines.append(keterangan)
                # sometimes mutasi appears on continuation line
                if mutasi and not current_mutasi:
                    current_mutasi = mutasi

        # flush last transaction
        tx = flush_current()
        if tx:
            results.append(tx)

        return results

    # ── Helpers ───────────────────────────────────────────────────

    def _parse_mutasi(
        self, mutasi: str
    ) -> tuple[Decimal, TransactionTypeEnum]:
        """
        Parse mutasi string.
        "60,000.00 DB" → (60000.00, EXPENSE)
        "1,000,000.00"  → (1000000.00, INCOME)
        """
        mutasi = mutasi.strip().upper()
        is_debit = "DB" in mutasi
        amount_str = mutasi.replace("DB", "").strip()
        amount = safe_decimal(amount_str)
        txn_type = (
            TransactionTypeEnum.EXPENSE
            if is_debit
            else TransactionTypeEnum.INCOME
        )
        return amount, txn_type

    def _clean_description(self, keterangan: str) -> str:
        if not keterangan:
            return "BCA Transaction"

        # remove technical patterns
        keterangan = re.sub(r"TGL\s*:\s*\d{1,2}/\d{1,2}", "", keterangan)
        keterangan = re.sub(r"TANGGAL\s*:\s*\d{1,2}/\d{1,2}", "", keterangan)
        keterangan = re.sub(r"\bQR\w*\s*\d+\b", "", keterangan)
        keterangan = re.sub(r"\b\d{4}/\w+/\w+\b", "", keterangan)

        # remove merchant codes — patterns like:
        # "00000.00XL" → remove leading zeros + dot + digits
        # ".00IDM"     → remove dot + digits at start of word
        # "00XL"       → remove leading zeros before text
        keterangan = re.sub(r"\b0+\.?\d*(?=[A-Z])", "", keterangan)
        keterangan = re.sub(r"\.00(?=[A-Z])", "", keterangan)
        keterangan = re.sub(r"\b\d{5,}\.?\d*\b", "", keterangan)
        keterangan = re.sub(r"^\.", "", keterangan.strip())
        keterangan = re.sub(r"\s+\.", " ", keterangan)

        # clean common prefixes
        replacements = {
            "TRANSAKSI DEBIT": "Debit",
            "TRANSAKSI KREDIT": "Kredit",
            "TRSF E-BANKING DB": "Transfer Keluar",
            "TRSF E-BANKING CR": "Transfer Masuk",
            "TARIKAN ATM": "Tarik ATM",
            "KARTU DEBIT": "Kartu Debit",
            "BI-FAST DB BIF": "BI-FAST Transfer Keluar",
            "BI-FAST CR BIF": "BI-FAST Transfer Masuk",
            "BI-FAST DB": "BI-FAST Transfer Keluar",
            "BI-FAST CR": "BI-FAST Transfer Masuk",
            "FLAZZ BCA TOPUP": "Flazz Top Up",
            "BIAYA ADM": "Biaya Admin",
        }

        for old, new in replacements.items():
            if keterangan.upper().startswith(old):
                rest = keterangan[len(old):].strip()
                keterangan = f"{new} {rest}".strip()
                break

        # final cleanup
        keterangan = re.sub(r"\s+", " ", keterangan).strip()

        return keterangan or "BCA Transaction"