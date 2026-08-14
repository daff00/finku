from datetime import date
from decimal import Decimal

from app.core.auth_utils import hash_password
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
    TransferPair,
    User,
)

db = SessionLocal()


def seed():
    print("🌱 Seeding database...")

    # ── Default User ──────────────────────────────────────────────
    user = User(
        username="admin",
        password_hash=hash_password("admin"),
        display_name="admin",
    )
    db.add(user)
    db.flush()
    print(f"✅ Created user: {user.username}")

    # ── Accounts ──────────────────────────────────────────────────
    bca = Account(
        user_id=user.id,
        name="BCA Main",
        bank=BankEnum.BCA,
        type=AccountTypeEnum.SAVINGS,
        color="#0066AE",
        currency=CurrencyEnum.IDR,
    )
    mandiri = Account(
        user_id=user.id,
        name="Mandiri Tabungan",
        bank=BankEnum.MANDIRI,
        type=AccountTypeEnum.SAVINGS,
        color="#F5A623",
        currency=CurrencyEnum.IDR,
    )
    jago_main = Account(
        user_id=user.id,
        name="Jago — Main",
        bank=BankEnum.JAGO,
        type=AccountTypeEnum.POCKET,
        color="#00B14F",
        currency=CurrencyEnum.IDR,
    )
    jago_liburan = Account(
        user_id=user.id,
        name="Jago — Liburan",
        bank=BankEnum.JAGO,
        type=AccountTypeEnum.POCKET,
        color="#00B14F",
        currency=CurrencyEnum.IDR,
    )
    jago_darurat = Account(
        user_id=user.id,
        name="Jago — Darurat",
        bank=BankEnum.JAGO,
        type=AccountTypeEnum.POCKET,
        color="#00B14F",
        currency=CurrencyEnum.IDR,
    )
    seabank = Account(
        user_id=user.id,
        name="Seabank",
        bank=BankEnum.SEABANK,
        type=AccountTypeEnum.SAVINGS,
        color="#FF5C00",
        currency=CurrencyEnum.IDR,
    )
    ovo = Account(
        user_id=user.id,
        name="OVO",
        bank=BankEnum.OVO,
        type=AccountTypeEnum.EWALLET,
        color="#4C3494",
        currency=CurrencyEnum.IDR,
    )
    gopay = Account(
        user_id=user.id,
        name="GoPay",
        bank=BankEnum.GOPAY,
        type=AccountTypeEnum.EWALLET,
        color="#00AED6",
        currency=CurrencyEnum.IDR,
    )
    rdn = Account(
        user_id=user.id,
        name="Mandiri RDN",
        bank=BankEnum.MANDIRI_RDN,
        type=AccountTypeEnum.INVESTMENT,
        color="#E8750A",
        currency=CurrencyEnum.IDR,
    )

    accounts = [
        bca, mandiri, jago_main, jago_liburan,
        jago_darurat, seabank, ovo, gopay, rdn
    ]
    db.add_all(accounts)
    db.flush()
    print(f"✅ Created {len(accounts)} accounts")

    # ── Balance Snapshots ─────────────────────────────────────────
    balances = [
        Balance(user_id=user.id, account_id=bca.id,         amount=Decimal("32100000")),
        Balance(user_id=user.id, account_id=mandiri.id,      amount=Decimal("8500000")),
        Balance(user_id=user.id, account_id=jago_main.id,    amount=Decimal("15000000")),
        Balance(user_id=user.id, account_id=jago_liburan.id, amount=Decimal("7000000")),
        Balance(user_id=user.id, account_id=jago_darurat.id, amount=Decimal("3000000")),
        Balance(user_id=user.id, account_id=seabank.id,      amount=Decimal("4200000")),
        Balance(user_id=user.id, account_id=ovo.id,          amount=Decimal("1600000")),
        Balance(user_id=user.id, account_id=gopay.id,        amount=Decimal("1000000")),
        Balance(user_id=user.id, account_id=rdn.id,          amount=Decimal("11800000")),
    ]
    db.add_all(balances)
    db.flush()
    print(f"✅ Created {len(balances)} balance snapshots")

    # ── Transactions ──────────────────────────────────────────────
    transactions = [
        Transaction(
            user_id=user.id,
            account_id=bca.id,
            date=date(2026, 8, 25),
            amount=Decimal("12500000"),
            type=TransactionTypeEnum.INCOME,
            category=CategoryEnum.SALARY,
            note="Gaji bulan Agustus",
            source=SourceEnum.MANUAL,
            ref_id="bca-salary-2026-08",
        ),
        Transaction(
            user_id=user.id,
            account_id=gopay.id,
            date=date(2026, 8, 12),
            amount=Decimal("48000"),
            type=TransactionTypeEnum.EXPENSE,
            category=CategoryEnum.FOOD,
            note="Grab Food dinner",
            source=SourceEnum.MANUAL,
            ref_id="gopay-grabfood-2026-08-12",
        ),
        Transaction(
            user_id=user.id,
            account_id=seabank.id,
            date=date(2026, 8, 11),
            amount=Decimal("215000"),
            type=TransactionTypeEnum.EXPENSE,
            category=CategoryEnum.SHOPPING,
            note="Shopee haul",
            source=SourceEnum.MANUAL,
            ref_id="seabank-shopee-2026-08-11",
        ),
        Transaction(
            user_id=user.id,
            account_id=rdn.id,
            date=date(2026, 8, 10),
            amount=Decimal("2000000"),
            type=TransactionTypeEnum.EXPENSE,
            category=CategoryEnum.INVESTMENT,
            note="Buy BBCA",
            source=SourceEnum.MANUAL,
            ref_id="rdn-bbca-2026-08-10",
        ),
        Transaction(
            user_id=user.id,
            account_id=ovo.id,
            date=date(2026, 8, 10),
            amount=Decimal("14000"),
            type=TransactionTypeEnum.EXPENSE,
            category=CategoryEnum.TRANSPORT,
            note="KRL Commuter",
            source=SourceEnum.MANUAL,
            ref_id="ovo-krl-2026-08-10",
        ),
        Transaction(
            user_id=user.id,
            account_id=bca.id,
            date=date(2026, 8, 5),
            amount=Decimal("500000"),
            type=TransactionTypeEnum.EXPENSE,
            category=CategoryEnum.BILLS,
            note="PLN Prepaid",
            source=SourceEnum.MANUAL,
            ref_id="bca-pln-2026-08-05",
        ),
        Transaction(
            user_id=user.id,
            account_id=gopay.id,
            date=date(2026, 8, 3),
            amount=Decimal("75000"),
            type=TransactionTypeEnum.EXPENSE,
            category=CategoryEnum.FOOD,
            note="Kopi Kenangan",
            source=SourceEnum.MANUAL,
            ref_id="gopay-kopi-2026-08-03",
        ),
        Transaction(
            user_id=user.id,
            account_id=mandiri.id,
            date=date(2026, 7, 25),
            amount=Decimal("12500000"),
            type=TransactionTypeEnum.INCOME,
            category=CategoryEnum.SALARY,
            note="Gaji bulan Juli",
            source=SourceEnum.MANUAL,
            ref_id="mandiri-salary-2026-07",
        ),
    ]
    db.add_all(transactions)
    db.flush()
    print(f"✅ Created {len(transactions)} transactions")

    # ── Transfer between Jago pockets ─────────────────────────────
    from_tx = Transaction(
        user_id=user.id,
        account_id=jago_main.id,
        date=date(2026, 8, 1),
        amount=Decimal("2000000"),
        type=TransactionTypeEnum.TRANSFER,
        category=CategoryEnum.TRANSFER,
        note="Nabung liburan",
        source=SourceEnum.MANUAL,
        ref_id="jago-transfer-main-liburan-2026-08-01-OUT",
    )
    to_tx = Transaction(
        user_id=user.id,
        account_id=jago_liburan.id,
        date=date(2026, 8, 1),
        amount=Decimal("2000000"),
        type=TransactionTypeEnum.TRANSFER,
        category=CategoryEnum.TRANSFER,
        note="Nabung liburan",
        source=SourceEnum.MANUAL,
        ref_id="jago-transfer-main-liburan-2026-08-01-IN",
    )
    db.add_all([from_tx, to_tx])
    db.flush()

    pair = TransferPair(
        from_transaction_id=from_tx.id,
        to_transaction_id=to_tx.id,
    )
    db.add(pair)
    db.flush()
    print("✅ Created 1 transfer pair (Jago Main → Liburan)")

    db.commit()
    print("🎉 Seeding complete!")


if __name__ == "__main__":
    seed()
    db.close()