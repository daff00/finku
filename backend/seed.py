from datetime import date
from decimal import Decimal

from app.core.database import SessionLocal
from app.models.models import (
    Account,
    AccountTypeEnum,
    Balance,
    BankEnum,
    CategoryEnum,
    CurrencyEnum,
    SourceEnum,
    Transaction,
    TransactionTypeEnum,
)

db = SessionLocal()

def seed():
    print("🌱 Seeding database...")

    # ── Accounts ──────────────────────────────────────────────────
    bca = Account(
        name="BCA Main",
        bank=BankEnum.BCA,
        type=AccountTypeEnum.SAVINGS,
        color="#0066AE",
        currency=CurrencyEnum.IDR,
    )
    mandiri = Account(
        name="Mandiri Tabungan",
        bank=BankEnum.MANDIRI,
        type=AccountTypeEnum.SAVINGS,
        color="#F5A623",
        currency=CurrencyEnum.IDR,
    )
    jago = Account(
        name="Bank Jago",
        bank=BankEnum.JAGO,
        type=AccountTypeEnum.SAVINGS,
        color="#00B14F",
        currency=CurrencyEnum.IDR,
    )
    jago_pocket = Account(
        name="Jago — Liburan",
        bank=BankEnum.JAGO,
        type=AccountTypeEnum.POCKET,
        color="#00B14F",
        currency=CurrencyEnum.IDR,
    )
    seabank = Account(
        name="Seabank",
        bank=BankEnum.SEABANK,
        type=AccountTypeEnum.SAVINGS,
        color="#FF5C00",
        currency=CurrencyEnum.IDR,
    )
    ovo = Account(
        name="OVO",
        bank=BankEnum.OVO,
        type=AccountTypeEnum.EWALLET,
        color="#4C3494",
        currency=CurrencyEnum.IDR,
    )
    gopay = Account(
        name="GoPay",
        bank=BankEnum.GOPAY,
        type=AccountTypeEnum.EWALLET,
        color="#00AED6",
        currency=CurrencyEnum.IDR,
    )
    rdn = Account(
        name="Mandiri RDN",
        bank=BankEnum.MANDIRI_RDN,
        type=AccountTypeEnum.INVESTMENT,
        color="#E8750A",
        currency=CurrencyEnum.IDR,
    )

    db.add_all([bca, mandiri, jago, seabank, ovo, gopay, rdn])
    db.flush()  # get IDs

    # set jago pocket parent
    jago_pocket.parent_id = jago.id
    db.add(jago_pocket)
    db.flush()

    print(f"✅ Created {8} accounts")

    # ── Balance Snapshots ─────────────────────────────────────────
    balances = [
        Balance(account_id=bca.id,     amount=Decimal("32100000")),
        Balance(account_id=mandiri.id,  amount=Decimal("8500000")),
        Balance(account_id=jago.id,     amount=Decimal("25000000")),
        Balance(account_id=seabank.id,  amount=Decimal("4200000")),
        Balance(account_id=ovo.id,      amount=Decimal("1600000")),
        Balance(account_id=gopay.id,    amount=Decimal("1000000")),
        Balance(account_id=rdn.id,      amount=Decimal("11800000")),
    ]
    db.add_all(balances)
    db.flush()

    print(f"✅ Created {len(balances)} balance snapshots")

    # ── Transactions ──────────────────────────────────────────────
    transactions = [
        Transaction(
            account_id=bca.id,
            date=date(2026, 7, 25),
            amount=Decimal("12500000"),
            type=TransactionTypeEnum.INCOME,
            category=CategoryEnum.SALARY,
            note="Gaji bulan Juli",
            source=SourceEnum.MANUAL,
            ref_id="bca-salary-2026-07",
        ),
        Transaction(
            account_id=gopay.id,
            date=date(2026, 7, 12),
            amount=Decimal("48000"),
            type=TransactionTypeEnum.EXPENSE,
            category=CategoryEnum.FOOD,
            note="Grab Food dinner",
            source=SourceEnum.MANUAL,
            ref_id="gopay-grabfood-2026-07-12",
        ),
        Transaction(
            account_id=seabank.id,
            date=date(2026, 7, 11),
            amount=Decimal("215000"),
            type=TransactionTypeEnum.EXPENSE,
            category=CategoryEnum.SHOPPING,
            note="Shopee haul",
            source=SourceEnum.MANUAL,
            ref_id="seabank-shopee-2026-07-11",
        ),
        Transaction(
            account_id=rdn.id,
            date=date(2026, 7, 10),
            amount=Decimal("2000000"),
            type=TransactionTypeEnum.EXPENSE,
            category=CategoryEnum.INVESTMENT,
            note="Buy BBCA",
            source=SourceEnum.MANUAL,
            ref_id="rdn-bbca-2026-07-10",
        ),
        Transaction(
            account_id=ovo.id,
            date=date(2026, 7, 10),
            amount=Decimal("14000"),
            type=TransactionTypeEnum.EXPENSE,
            category=CategoryEnum.TRANSPORT,
            note="KRL Commuter",
            source=SourceEnum.MANUAL,
            ref_id="ovo-krl-2026-07-10",
        ),
        Transaction(
            account_id=bca.id,
            date=date(2026, 7, 5),
            amount=Decimal("500000"),
            type=TransactionTypeEnum.EXPENSE,
            category=CategoryEnum.BILLS,
            note="PLN Prepaid",
            source=SourceEnum.MANUAL,
            ref_id="bca-pln-2026-07-05",
        ),
        Transaction(
            account_id=gopay.id,
            date=date(2026, 7, 3),
            amount=Decimal("75000"),
            type=TransactionTypeEnum.EXPENSE,
            category=CategoryEnum.FOOD,
            note="Kopi Kenangan",
            source=SourceEnum.MANUAL,
            ref_id="gopay-kopi-2026-07-03",
        ),
        Transaction(
            account_id=mandiri.id,
            date=date(2026, 6, 25),
            amount=Decimal("12500000"),
            type=TransactionTypeEnum.INCOME,
            category=CategoryEnum.SALARY,
            note="Gaji bulan Juni",
            source=SourceEnum.MANUAL,
            ref_id="mandiri-salary-2026-06",
        ),
    ]
    db.add_all(transactions)
    db.flush()

    print(f"✅ Created {len(transactions)} transactions")

    db.commit()
    print("🎉 Seeding complete!")

if __name__ == "__main__":
    seed()
    db.close()