"""
Quick test script for BCA PDF parser.
Run from backend/ directory:
    python test_parser.py path/to/your/bca.pdf
"""

import sys
from app.parsers.bca_pdf import BcaPdfParser


def test(pdf_path: str):
    print(f"\n📄 Testing BCA parser on: {pdf_path}\n")

    with open(pdf_path, "rb") as f:
        file_bytes = f.read()

    parser = BcaPdfParser()

    # test period extraction
    year, month = parser._extract_period(file_bytes)
    print(f"📅 Detected period: {month}/{year}\n")

    # test full parse
    results = parser.parse(file_bytes)

    print(f"✅ Total parsed: {len(results)} transactions\n")
    print("─" * 70)

    for i, tx in enumerate(results[:15], 1):
        sign = "+" if tx.type.value == "INCOME" else "-"
        print(
            f"{i:2}. {tx.date} | "
            f"{sign}Rp {tx.amount:>15,.2f} | "
            f"{tx.category.value:<15} | "
            f"{tx.description[:50]}"
        )

    if len(results) > 15:
        print(f"\n... and {len(results) - 15} more")

    print("─" * 70)
    income = sum(t.amount for t in results if t.type.value == "INCOME")
    expense = sum(t.amount for t in results if t.type.value == "EXPENSE")
    print(f"\n💰 Total income:  Rp {income:>15,.2f}")
    print(f"💸 Total expense: Rp {expense:>15,.2f}")
    print(f"💵 Net:           Rp {income - expense:>15,.2f}")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python test_parser.py path/to/bca.pdf")
        sys.exit(1)
    test(sys.argv[1])