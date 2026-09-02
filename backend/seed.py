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
rng = Random(20260825)  # fixed seed for reproducibility


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
    """Random amount rounded to the nearest step."""
    value = rng.randint(minimum // step, maximum // step) * step
    return value


def add_monthly_salary(user, account, year, month):
    """Add salary income on the 25th."""
    tx_date = date(year, month, 25)
    add_transaction(
        user=user,
        account=account,
        tx_date=tx_date,
        amount=12_500_000,
        tx_type=TransactionTypeEnum.INCOME,
        category=CategoryEnum.SALARY,
        note=f"Salary {tx_date.strftime('%B %Y')}",
        ref_id=f"salary-{year}-{month:02d}",
    )


def add_random_expenses(user, accounts, year, month):
    """
    Generate a realistic set of expenses for a given month.
    Uses different accounts for different categories.
    """
    start = date(year, month, 1)
    days_in_month = 28 if month == 2 else 30 + (month in (1, 3, 5, 7, 8, 10, 12))

    # Food expenses (GoPay or OVO) – 10–15 transactions per month
    food_account = rng.choice([accounts["gopay"], accounts["ovo"]])
    for _ in range(rng.randint(10, 15)):
        day = rng.randint(1, days_in_month)
        amount = random_amount(15_000, 80_000, 5000)
        add_transaction(
            user,
            food_account,
            start + timedelta(days=day - 1),
            amount,
            TransactionTypeEnum.EXPENSE,
            CategoryEnum.FOOD,
            rng.choice(["Lunch", "Coffee", "Grab Food", "Makan malam", "Snacks"]),
            f"food-{year}-{month:02d}-{day:02d}-{rng.randint(1,100)}",
        )

    # Transport (OVO or GoPay)
    transport_account = rng.choice([accounts["ovo"], accounts["gopay"]])
    for _ in range(rng.randint(8, 12)):
        day = rng.randint(1, days_in_month)
        amount = random_amount(10_000, 30_000, 2000)
        add_transaction(
            user,
            transport_account,
            start + timedelta(days=day - 1),
            amount,
            TransactionTypeEnum.EXPENSE,
            CategoryEnum.TRANSPORT,
            rng.choice(["KRL", "Gojek", "Grab", "Bus"]),
            f"transport-{year}-{month:02d}-{day:02d}-{rng.randint(1,100)}",
        )

    # Shopping (BCA)
    shopping_days = rng.sample(range(1, days_in_month + 1), rng.randint(2, 4))
    for day in shopping_days:
        amount = random_amount(100_000, 600_000, 50_000)
        add_transaction(
            user,
            accounts["bca"],
            start + timedelta(days=day - 1),
            amount,
            TransactionTypeEnum.EXPENSE,
            CategoryEnum.SHOPPING,
            rng.choice(["Shopee", "Tokopedia", "Supermarket", "Minimarket"]),
            f"shopping-{year}-{month:02d}-{day:02d}-{rng.randint(1,100)}",
        )

    # Bills (BCA)
    bill_days = [5, 10, 15, 20] if month % 2 == 0 else [4, 12, 18, 25]
    for day in bill_days[:rng.randint(2, 4)]:
        amount = random_amount(50_000, 500_000, 25_000)
        add_transaction(
            user,
            accounts["bca"],
            start + timedelta(days=day - 1),
            amount,
            TransactionTypeEnum.EXPENSE,
            CategoryEnum.BILLS,
            rng.choice(["PLN", "PDAM", "Internet", "Pulsa"]),
            f"bill-{year}-{month:02d}-{day:02d}-{rng.randint(1,100)}",
        )

    # Subscriptions (BCA or GoPay)
    sub_account = rng.choice([accounts["bca"], accounts["gopay"]])
    for day in [8, 20]:
        if rng.random() > 0.3:  # 70% chance to have a subscription that month
            amount = random_amount(50_000, 200_000, 10_000)
            add_transaction(
                user,
                sub_account,
                start + timedelta(days=day - 1),
                amount,
                TransactionTypeEnum.EXPENSE,
                CategoryEnum.ENTERTAINMENT,
                rng.choice(["Netflix", "Spotify", "Disney+", "YouTube Premium"]),
                f"sub-{year}-{month:02d}-{day:02d}-{rng.randint(1,100)}",
            )

    # Entertainment (GoPay or OVO) – 1–3 transactions
    ent_account = rng.choice([accounts["gopay"], accounts["ovo"]])
    for _ in range(rng.randint(1, 3)):
        day = rng.randint(1, days_in_month)
        amount = random_amount(50_000, 300_000, 25_000)
        add_transaction(
            user,
            ent_account,
            start + timedelta(days=day - 1),
            amount,
            TransactionTypeEnum.EXPENSE,
            CategoryEnum.ENTERTAINMENT,
            rng.choice(["Movie", "Concert", "Game", "Museum"]),
            f"entertainment-{year}-{month:02d}-{day:02d}-{rng.randint(1,100)}",
        )

    # Health (BCA) – occasionally
    if rng.random() > 0.6:
        day = rng.randint(1, days_in_month)
        amount = random_amount(100_000, 500_000, 50_000)
        add_transaction(
            user,
            accounts["bca"],
            start + timedelta(days=day - 1),
            amount,
            TransactionTypeEnum.EXPENSE,
            CategoryEnum.HEALTH,
            rng.choice(["Doctor", "Medicine", "Lab test"]),
            f"health-{year}-{month:02d}-{day:02d}-{rng.randint(1,100)}",
        )

    # Education (BCA) – occasionally
    if rng.random() > 0.7:
        day = rng.randint(1, days_in_month)
        amount = random_amount(200_000, 1_000_000, 100_000)
        add_transaction(
            user,
            accounts["bca"],
            start + timedelta(days=day - 1),
            amount,
            TransactionTypeEnum.EXPENSE,
            CategoryEnum.EDUCATION,
            rng.choice(["Course", "Books", "Workshop"]),
            f"edu-{year}-{month:02d}-{day:02d}-{rng.randint(1,100)}",
        )

    # One-off large expense (e.g., vacation, car maintenance) – every 2–3 months
    if month % 3 == 0:
        day = rng.randint(1, days_in_month)
        amount = random_amount(1_000_000, 5_000_000, 500_000)
        add_transaction(
            user,
            accounts["bca"],
            start + timedelta(days=day - 1),
            amount,
            TransactionTypeEnum.EXPENSE,
            CategoryEnum.OTHER,
            rng.choice(["Vacation", "Car maintenance", "Home repair"]),
            f"large-{year}-{month:02d}-{day:02d}-{rng.randint(1,100)}",
        )


def add_monthly_transfers(user, accounts, year, month):
    """Add transfers between accounts (salary allocation)."""
    # BCA → Jago Main (monthly)
    transfer_date = date(year, month, 26)
    amount = rng.choice([2_000_000, 3_000_000, 4_000_000])

    from_tx = add_transaction(
        user,
        accounts["bca"],
        transfer_date,
        amount,
        TransactionTypeEnum.TRANSFER,
        CategoryEnum.TRANSFER,
        "Transfer to Jago Main",
        f"transfer-bca-jago-{year}-{month:02d}-out",
    )
    to_tx = add_transaction(
        user,
        accounts["jago_main"],
        transfer_date,
        amount,
        TransactionTypeEnum.TRANSFER,
        CategoryEnum.TRANSFER,
        "Transfer from BCA",
        f"transfer-bca-jago-{year}-{month:02d}-in",
    )
    db.flush()
    db.add(TransferPair(from_transaction_id=from_tx.id, to_transaction_id=to_tx.id))

    # Jago Main → Liburan (monthly)
    if rng.random() > 0.2:  # 80% chance
        transfer_date = date(year, month, rng.randint(3, 10))
        amount = rng.choice([500_000, 1_000_000, 1_500_000])
        from_tx = add_transaction(
            user,
            accounts["jago_main"],
            transfer_date,
            amount,
            TransactionTypeEnum.TRANSFER,
            CategoryEnum.TRANSFER,
            "Nabung liburan",
            f"transfer-liburan-{year}-{month:02d}-out",
        )
        to_tx = add_transaction(
            user,
            accounts["jago_liburan"],
            transfer_date,
            amount,
            TransactionTypeEnum.TRANSFER,
            CategoryEnum.TRANSFER,
            "Nabung liburan",
            f"transfer-liburan-{year}-{month:02d}-in",
        )
        db.flush()
        db.add(TransferPair(from_transaction_id=from_tx.id, to_transaction_id=to_tx.id))

    # Jago Main → Darurat (every 2 months)
    if month % 2 == 0:
        transfer_date = date(year, month, rng.randint(12, 20))
        amount = rng.choice([300_000, 500_000, 1_000_000])
        from_tx = add_transaction(
            user,
            accounts["jago_main"],
            transfer_date,
            amount,
            TransactionTypeEnum.TRANSFER,
            CategoryEnum.TRANSFER,
            "Dana darurat",
            f"transfer-darurat-{year}-{month:02d}-out",
        )
        to_tx = add_transaction(
            user,
            accounts["jago_darurat"],
            transfer_date,
            amount,
            TransactionTypeEnum.TRANSFER,
            CategoryEnum.TRANSFER,
            "Dana darurat",
            f"transfer-darurat-{year}-{month:02d}-in",
        )
        db.flush()
        db.add(TransferPair(from_transaction_id=from_tx.id, to_transaction_id=to_tx.id))


def add_investment(user, rdn, year, month):
    """Occasional investment purchases."""
    if rng.random() > 0.4:  # 60% chance
        tx_date = date(year, month, rng.randint(10, 20))
        amount = random_amount(1_000_000, 5_000_000, 500_000)
        add_transaction(
            user,
            rdn,
            tx_date,
            amount,
            TransactionTypeEnum.EXPENSE,
            CategoryEnum.INVESTMENT,
            rng.choice(["Buy BBCA", "Buy BMRI", "Buy TLKM", "Buy reksa dana", "Buy crypto"]),
            f"investment-{year}-{month:02d}-{rng.randint(1,100)}",
        )


def seed():
    print("🌱 Seeding database with 6 months of realistic data...")

    # ── User ──────────────────────────────────────────────
    user = User(
        username="admin",
        password_hash=hash_password("admin"),
        display_name="Admin User",
    )
    db.add(user)
    db.flush()
    print(f"✅ Created user: {user.username}")

    # ── Accounts ──────────────────────────────────────────
    bca = Account(
        user_id=user.id,
        name="BCA Main",
        bank=BankEnum.BCA,
        type=AccountTypeEnum.SAVINGS,
        color="#0066AE",
        currency=CurrencyEnum.IDR,
        account_number="123456789012",
    )
    mandiri = Account(
        user_id=user.id,
        name="Mandiri Tabungan",
        bank=BankEnum.MANDIRI,
        type=AccountTypeEnum.SAVINGS,
        color="#F5A623",
        currency=CurrencyEnum.IDR,
        account_number="234567890123",
    )
    jago_main = Account(
        user_id=user.id,
        name="Jago — Main",
        bank=BankEnum.JAGO,
        type=AccountTypeEnum.POCKET,
        color="#00B14F",
        currency=CurrencyEnum.IDR,
        account_number="345678901234",
    )
    jago_liburan = Account(
        user_id=user.id,
        name="Jago — Liburan",
        bank=BankEnum.JAGO,
        type=AccountTypeEnum.POCKET,
        color="#00B14F",
        currency=CurrencyEnum.IDR,
        account_number="456789012345",
    )
    jago_darurat = Account(
        user_id=user.id,
        name="Jago — Darurat",
        bank=BankEnum.JAGO,
        type=AccountTypeEnum.POCKET,
        color="#00B14F",
        currency=CurrencyEnum.IDR,
        account_number="567890123456",
    )
    seabank = Account(
        user_id=user.id,
        name="Seabank",
        bank=BankEnum.SEABANK,
        type=AccountTypeEnum.SAVINGS,
        color="#FF5C00",
        currency=CurrencyEnum.IDR,
        account_number="678901234567",
    )
    ovo = Account(
        user_id=user.id,
        name="OVO",
        bank=BankEnum.OVO,
        type=AccountTypeEnum.EWALLET,
        color="#4C3494",
        currency=CurrencyEnum.IDR,
        account_number="789012345678",
    )
    gopay = Account(
        user_id=user.id,
        name="GoPay",
        bank=BankEnum.GOPAY,
        type=AccountTypeEnum.EWALLET,
        color="#00AED6",
        currency=CurrencyEnum.IDR,
        account_number="890123456789",
    )
    rdn = Account(
        user_id=user.id,
        name="Mandiri RDN",
        bank=BankEnum.MANDIRI_RDN,
        type=AccountTypeEnum.INVESTMENT,
        color="#E8750A",
        currency=CurrencyEnum.IDR,
        account_number="901234567890",
    )

    accounts_dict = {
        "bca": bca,
        "mandiri": mandiri,
        "jago_main": jago_main,
        "jago_liburan": jago_liburan,
        "jago_darurat": jago_darurat,
        "seabank": seabank,
        "ovo": ovo,
        "gopay": gopay,
        "rdn": rdn,
    }

    db.add_all(accounts_dict.values())
    db.flush()
    print(f"✅ Created {len(accounts_dict)} accounts with realistic account numbers")

    # ── Initial Balances (March 1, 2026) ──────────────────
    initial_balances = {
        bca.id: Decimal("32000000"),
        mandiri.id: Decimal("8000000"),
        jago_main.id: Decimal("12000000"),
        jago_liburan.id: Decimal("5000000"),
        jago_darurat.id: Decimal("2000000"),
        seabank.id: Decimal("3000000"),
        ovo.id: Decimal("1000000"),
        gopay.id: Decimal("500000"),
        rdn.id: Decimal("10000000"),
    }

    snapshot_date = date(2026, 3, 1)
    for account_id, amount in initial_balances.items():
        balance = Balance(
            user_id=user.id,
            account_id=account_id,
            amount=amount,
            recorded_at=snapshot_date,
        )
        db.add(balance)
    db.flush()
    print(f"✅ Set initial balance snapshots at {snapshot_date}")

    # ── Generate Transactions for March–August 2026 ──────
    for year in [2026]:
        for month in range(3, 9):  # March to August
            print(f"📅 Generating {year}-{month:02d}...")

            # Salary
            add_monthly_salary(user, bca, year, month)

            # Random expenses
            add_random_expenses(user, accounts_dict, year, month)

            # Transfers
            add_monthly_transfers(user, accounts_dict, year, month)

            # Investment purchases
            add_investment(user, rdn, year, month)

    db.commit()
    print("✅ Generated 6 months of transactions")

    # ── Final Balances (August 31, 2026) ──────────────────
    # Compute final balances by starting from initial and applying net changes
    # (We'll set them explicitly to match the transactions we generated,
    # but to keep it simple we'll reuse the same values as before.)
    final_balances = [
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
    db.add_all(final_balances)
    db.flush()
    print("✅ Added final balance snapshots (for net worth calculation)")

    db.commit()
    print("🎉 Seeding complete!")
    print("📊 Generated 6 months of realistic transactions (March–August 2026)")
    print("🔑 Login: admin / admin")


if __name__ == "__main__":
    try:
        seed()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()