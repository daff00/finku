from datetime import date, datetime
from decimal import Decimal

from app.core.auth_utils import hash_password
from app.core.database import SessionLocal
from app.models.models import (
    Account,
    AccountTypeEnum,
    Balance,
    BankEnum,
    CurrencyEnum,
    User,
)

db = SessionLocal()


def seed_empty():
    print("🌱 Seeding empty test user with zero balance...")

    user = User(
        username="testuser",
        password_hash=hash_password("testpass"),
        display_name="Test User",
    )
    db.add(user)
    db.flush()
    print(f"✅ Created test user: {user.username} / testpass")

    bca = Account(
        user_id=user.id,
        name="BCA Main",
        bank=BankEnum.BCA,
        type=AccountTypeEnum.SAVINGS,
        color="#0066AE",
        currency=CurrencyEnum.IDR,
    )
    db.add(bca)
    db.flush()
    print("✅ Created BCA Main account")

    # ── CRITICAL FIX: Set snapshot date to January 2026 ──
    snapshot_date = date(2026, 1, 1)  # Before any imported transactions

    balance = Balance(
        user_id=user.id,
        account_id=bca.id,
        amount=Decimal("0"),
        recorded_at=snapshot_date,  # Explicitly set!
    )
    db.add(balance)
    db.flush()
    print(f"✅ Added balance snapshot: Rp 0 on {snapshot_date}")

    db.commit()
    print("🎉 Seeding complete!")
    print("📊 Balance snapshot set to 0 on 2026-01-01")
    print("📈 Net worth will now include transactions after that date.")
    print("🔑 Login: testuser / testpass")


if __name__ == "__main__":
    try:
        seed_empty()
    except Exception as e:
        db.rollback()
        print(f"❌ Error: {e}")
        raise
    finally:
        db.close()