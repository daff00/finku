from datetime import date, timedelta
from decimal import Decimal
from random import Random

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
rng = Random(20260825)


def money(value: int) -> Decimal:
    return Decimal(str(value))


def add_transaction(
    user,
    account,
    tx_date,
    amount,
    tx_type,
    category,
    note,
    ref_id,
):
    tx = Transaction(
        user_id=user.id,
        account_id=account.id,
        date=tx_date,
        amount=money(amount),
        type=tx_type,
        category=category,
        note=note,
        source=SourceEnum.MANUAL,
        ref_id=ref_id,
    )

    db.add(tx)
    return tx


def random_amount(minimum: int, maximum: int, step: int = 1000) -> int:
    value = rng.randint(minimum // step, maximum // step) * step
    return value


def add_monthly_salary(user, account, year, month):
    tx_date = date(year, month, 25)

    add_transaction(
        user=user,
        account=account,
        tx_date=tx_date,
        amount=12_500_000,
        tx_type=TransactionTypeEnum.INCOME,
        category=CategoryEnum.SALARY,
        note=f"Gaji bulan {tx_date.strftime('%B')}",
        ref_id=f"salary-{year}-{month:02d}",
    )


def add_expenses_for_month(
    user,
    bca,
    mandiri,
    jago_main,
    ovo,
    gopay,
    year,
    month,
):
    start = date(year, month, 1)

    # ------------------------------------------------------------
    # FOOD
    # ------------------------------------------------------------

    food_transactions = [
        ("Lunch kantor", 35_000),
        ("Kopi pagi", 25_000),
        ("Grab Food", 48_000),
        ("Makan malam", 55_000),
        ("Kopi Kenangan", 32_000),
        ("Makan siang", 42_000),
    ]

    for day in [2, 5, 8, 12, 15, 19, 22, 26]:
        note, amount = rng.choice(food_transactions)

        add_transaction(
            user,
            gopay,
            start + timedelta(days=day - 1),
            amount,
            TransactionTypeEnum.EXPENSE,
            CategoryEnum.FOOD,
            note,
            f"food-{year}-{month:02d}-{day:02d}",
        )

    # ------------------------------------------------------------
    # TRANSPORT
    # ------------------------------------------------------------

    for day in [3, 6, 10, 13, 17, 20, 24, 27]:
        amount = rng.choice([
            12_000,
            14_000,
            16_000,
            18_000,
            22_000,
        ])

        add_transaction(
            user,
            ovo,
            start + timedelta(days=day - 1),
            amount,
            TransactionTypeEnum.EXPENSE,
            CategoryEnum.TRANSPORT,
            rng.choice([
                "KRL Commuter",
                "Grab Bike",
                "Gojek",
                "Grab Car",
            ]),
            f"transport-{year}-{month:02d}-{day:02d}",
        )

    # ------------------------------------------------------------
    # SHOPPING
    # ------------------------------------------------------------

    shopping = [
        ("Shopee", 185_000),
        ("Tokopedia", 245_000),
        ("Supermarket", 325_000),
        ("Minimarket", 85_000),
        ("Belanja kebutuhan rumah", 410_000),
    ]

    for day in [7, 18, 28]:
        note, amount = rng.choice(shopping)

        add_transaction(
            user,
            bca,
            start + timedelta(days=day - 1),
            amount,
            TransactionTypeEnum.EXPENSE,
            CategoryEnum.SHOPPING,
            note,
            f"shopping-{year}-{month:02d}-{day:02d}",
        )

    # ------------------------------------------------------------
    # BILLS
    # ------------------------------------------------------------

    bills = [
        (5, "PLN Prepaid", 500_000),
        (10, "Internet", 350_000),
        (15, "Pulsa", 100_000),
    ]

    for day, note, amount in bills:
        add_transaction(
            user,
            bca,
            start + timedelta(days=day - 1),
            amount,
            TransactionTypeEnum.EXPENSE,
            CategoryEnum.BILLS,
            note,
            f"bill-{year}-{month:02d}-{day:02d}",
        )

    # ------------------------------------------------------------
    # SUBSCRIPTIONS
    # ------------------------------------------------------------

    subscriptions = [
        (8, "Netflix", 186_000),
        (20, "Spotify", 55_000),
    ]

    for day, note, amount in subscriptions:
        add_transaction(
            user,
            bca,
            start + timedelta(days=day - 1),
            amount,
            TransactionTypeEnum.EXPENSE,
            CategoryEnum.ENTERTAINMENT,
            note,
            f"subscription-{year}-{month:02d}-{day:02d}",
        )


def add_monthly_transfers(
    user,
    bca,
    jago_main,
    jago_liburan,
    jago_darurat,
    year,
    month,
):
    transfer_date = date(year, month, 26)

    # BCA → Jago Main
    from_tx = add_transaction(
        user,
        bca,
        transfer_date,
        3_000_000,
        TransactionTypeEnum.TRANSFER,
        CategoryEnum.TRANSFER,
        "Alokasi ke Jago Main",
        f"transfer-bca-jago-{year}-{month:02d}-out",
    )

    to_tx = add_transaction(
        user,
        jago_main,
        transfer_date,
        3_000_000,
        TransactionTypeEnum.TRANSFER,
        CategoryEnum.TRANSFER,
        "Alokasi dari BCA",
        f"transfer-bca-jago-{year}-{month:02d}-in",
    )

    db.flush()

    db.add(
        TransferPair(
            from_transaction_id=from_tx.id,
            to_transaction_id=to_tx.id,
        )
    )

    # Jago Main → Liburan
    transfer_date = date(year, month, 3)

    from_tx = add_transaction(
        user,
        jago_main,
        transfer_date,
        1_000_000,
        TransactionTypeEnum.TRANSFER,
        CategoryEnum.TRANSFER,
        "Nabung liburan",
        f"transfer-liburan-{year}-{month:02d}-out",
    )

    to_tx = add_transaction(
        user,
        jago_liburan,
        transfer_date,
        1_000_000,
        TransactionTypeEnum.TRANSFER,
        CategoryEnum.TRANSFER,
        "Nabung liburan",
        f"transfer-liburan-{year}-{month:02d}-in",
    )

    db.flush()

    db.add(
        TransferPair(
            from_transaction_id=from_tx.id,
            to_transaction_id=to_tx.id,
        )
    )

    # Jago Main → Darurat
    transfer_date = date(year, month, 12)

    from_tx = add_transaction(
        user,
        jago_main,
        transfer_date,
        500_000,
        TransactionTypeEnum.TRANSFER,
        CategoryEnum.TRANSFER,
        "Dana darurat",
        f"transfer-darurat-{year}-{month:02d}-out",
    )

    to_tx = add_transaction(
        user,
        jago_darurat,
        transfer_date,
        500_000,
        TransactionTypeEnum.TRANSFER,
        CategoryEnum.TRANSFER,
        "Dana darurat",
        f"transfer-darurat-{year}-{month:02d}-in",
    )

    db.flush()

    db.add(
        TransferPair(
            from_transaction_id=from_tx.id,
            to_transaction_id=to_tx.id,
        )
    )


def add_investment(user, rdn, year, month):
    tx_date = date(year, month, 10)

    add_transaction(
        user,
        rdn,
        tx_date,
        2_000_000,
        TransactionTypeEnum.EXPENSE,
        CategoryEnum.INVESTMENT,
        rng.choice([
            "Buy BBCA",
            "Buy BMRI",
            "Buy TLKM",
            "Buy reksa dana",
        ]),
        f"investment-{year}-{month:02d}",
    )


def seed():
    print("🌱 Seeding database...")

    # ============================================================
    # USER
    # ============================================================

    user = User(
        username="admin",
        password_hash=hash_password("admin"),
        display_name="admin",
    )

    db.add(user)
    db.flush()

    print(f"✅ Created user: {user.username}")

    # ============================================================
    # ACCOUNTS
    # ============================================================

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
        bca,
        mandiri,
        jago_main,
        jago_liburan,
        jago_darurat,
        seabank,
        ovo,
        gopay,
        rdn,
    ]

    db.add_all(accounts)
    db.flush()

    print(f"✅ Created {len(accounts)} accounts")

    # ============================================================
    # 3 MONTHS TRANSACTIONS
    # ============================================================

    months = [
        (2026, 6),
        (2026, 7),
        (2026, 8),
    ]

    for year, month in months:
        print(f"📅 Generating {year}-{month:02d}...")

        add_monthly_salary(
            user,
            bca,
            year,
            month,
        )

        add_expenses_for_month(
            user,
            bca,
            mandiri,
            jago_main,
            ovo,
            gopay,
            year,
            month,
        )

        add_monthly_transfers(
            user,
            bca,
            jago_main,
            jago_liburan,
            jago_darurat,
            year,
            month,
        )

        add_investment(
            user,
            rdn,
            year,
            month,
        )

    db.flush()

    # ============================================================
    # BALANCES
    # ============================================================

    balances = [
        Balance(
            user_id=user.id,
            account_id=bca.id,
            amount=Decimal("32100000"),
        ),
        Balance(
            user_id=user.id,
            account_id=mandiri.id,
            amount=Decimal("8500000"),
        ),
        Balance(
            user_id=user.id,
            account_id=jago_main.id,
            amount=Decimal("15000000"),
        ),
        Balance(
            user_id=user.id,
            account_id=jago_liburan.id,
            amount=Decimal("7000000"),
        ),
        Balance(
            user_id=user.id,
            account_id=jago_darurat.id,
            amount=Decimal("3000000"),
        ),
        Balance(
            user_id=user.id,
            account_id=seabank.id,
            amount=Decimal("4200000"),
        ),
        Balance(
            user_id=user.id,
            account_id=ovo.id,
            amount=Decimal("1600000"),
        ),
        Balance(
            user_id=user.id,
            account_id=gopay.id,
            amount=Decimal("1000000"),
        ),
        Balance(
            user_id=user.id,
            account_id=rdn.id,
            amount=Decimal("11800000"),
        ),
    ]

    db.add_all(balances)
    db.flush()

    print(f"✅ Created {len(balances)} balance snapshots")

    db.commit()

    print("🎉 Seeding complete!")
    print("📊 Generated realistic transactions for June–August 2026")


if __name__ == "__main__":
    try:
        seed()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()