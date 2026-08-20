from datetime import date as date_type
from datetime import datetime as dt
from datetime import timezone
from decimal import Decimal
from enum import Enum

from sqlalchemy import Date, DateTime, ForeignKey, Numeric, String
from sqlalchemy import Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


# Enum values
class BankEnum(str, Enum):
    # Conventional Bank
    BCA = "BCA"
    MANDIRI = "MANDIRI"

    # Digital Bank
    JAGO = "JAGO"
    SEABANK = "SEABANK"

    # E-Wallets
    OVO = "OVO"
    GOPAY = "GOPAY"

    # Investment / Broker
    MANDIRI_RDN = "MANDIRI_RDN"
    MT4 = "MT4"
    AJAIB_CRYPTO = "AJAIB_CRYPTO"

    # Cash
    CASH = "CASH"

    # Other
    OTHER = "OTHER"


class AccountTypeEnum(str, Enum):
    SAVINGS = "SAVINGS"
    EWALLET = "EWALLET"
    INVESTMENT = "INVESTMENT"
    POCKET = "POCKET"


class TransactionTypeEnum(str, Enum):
    INCOME = "INCOME"
    EXPENSE = "EXPENSE"
    TRANSFER = "TRANSFER"


class CategoryEnum(str, Enum):
    FOOD = "FOOD"
    TRANSPORT = "TRANSPORT"
    SHOPPING = "SHOPPING"
    BILLS = "BILLS"
    INVESTMENT = "INVESTMENT"
    SALARY = "SALARY"
    ENTERTAINMENT = "ENTERTAINMENT"
    HEALTH = "HEALTH"
    EDUCATION = "EDUCATION"
    TRANSFER = "TRANSFER"
    OTHER = "OTHER"


class SourceEnum(str, Enum):
    MANUAL = "MANUAL"
    CSV = "CSV"
    PDF = "PDF"


class CurrencyEnum(str, Enum):
    IDR = "IDR"
    USD = "USD"


# Tables
class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    display_name: Mapped[str] = mapped_column(String(100), nullable=False)
    is_active: Mapped[bool] = mapped_column(default=True)
    created_at: Mapped[dt] = mapped_column(
        DateTime(timezone=True), default=lambda: dt.now(timezone.utc)
    )

    accounts: Mapped[list["Account"]] = relationship("Account", back_populates="user")

class Account(Base):
    __tablename__ = "accounts"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    parent_id: Mapped[int | None] = mapped_column(
        ForeignKey("accounts.id"), default=None
    )
    name: Mapped[str] = mapped_column(String(100))
    bank: Mapped[BankEnum] = mapped_column(SAEnum(BankEnum))
    type: Mapped[AccountTypeEnum] = mapped_column(SAEnum(AccountTypeEnum))
    color: Mapped[str] = mapped_column(String(20))
    currency: Mapped[CurrencyEnum] = mapped_column(
        SAEnum(CurrencyEnum), default=CurrencyEnum.IDR
    )
    # ref_id: Mapped[str | None] = mapped_column(String(255), nullable=True, unique=True)
    is_active: Mapped[bool] = mapped_column(default=True)
    created_at: Mapped[dt] = mapped_column(
        DateTime(timezone=True), default=lambda: dt.now(timezone.utc)
    )
    user: Mapped["User"] = relationship("User", back_populates="accounts")
    children: Mapped[list["Account"]] = relationship("Account", back_populates="parent")
    parent: Mapped["Account | None"] = relationship(
        "Account", back_populates="children", remote_side=[id]
    )
    transactions: Mapped[list["Transaction"]] = relationship(
        "Transaction", back_populates="account"
    )
    balances: Mapped[list["Balance"]] = relationship(
        "Balance", back_populates="account"
    )


class Transaction(Base):
    __tablename__ = "transactions"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    account_id: Mapped[int] = mapped_column(ForeignKey("accounts.id"))
    date: Mapped[date_type] = mapped_column(Date)
    amount: Mapped[Decimal] = mapped_column(Numeric(18, 2))
    type: Mapped[TransactionTypeEnum] = mapped_column(SAEnum(TransactionTypeEnum))
    category: Mapped[CategoryEnum] = mapped_column(SAEnum(CategoryEnum))
    note: Mapped[str] = mapped_column(String(255), default="")
    source: Mapped[SourceEnum] = mapped_column(
        SAEnum(SourceEnum), default=SourceEnum.MANUAL
    )
    currency: Mapped[CurrencyEnum] = mapped_column(
        SAEnum(CurrencyEnum), default=CurrencyEnum.IDR
    )
    ref_id: Mapped[str | None] = mapped_column(String(255), nullable=True, unique=True)
    original_amount: Mapped[Decimal | None] = mapped_column(
        Numeric(18, 2), nullable=True
    )
    original_currency: Mapped[CurrencyEnum | None] = mapped_column(
        SAEnum(CurrencyEnum), nullable=True
    )
    created_at: Mapped[dt] = mapped_column(
        DateTime(timezone=True), default=lambda: dt.now(timezone.utc)
    )
    account: Mapped["Account"] = relationship("Account", back_populates="transactions")
    transfer_from: Mapped["TransferPair | None"] = relationship(
        "TransferPair",
        foreign_keys="TransferPair.from_transaction_id",
        back_populates="from_transaction",
        uselist=False,
    )
    transfer_to: Mapped["TransferPair | None"] = relationship(
        "TransferPair",
        foreign_keys="TransferPair.to_transaction_id",
        back_populates="to_transaction",
        uselist=False,
    )
    user: Mapped["User"] = relationship("User")


class Balance(Base):
    __tablename__ = "balances"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    account_id: Mapped[int] = mapped_column(ForeignKey("accounts.id"))
    amount: Mapped[Decimal] = mapped_column(Numeric(18, 2))
    recorded_at: Mapped[dt] = mapped_column(
        DateTime(timezone=True), default=lambda: dt.now(timezone.utc)
    )
    account: Mapped["Account"] = relationship("Account", back_populates="balances")
    user: Mapped["User"] = relationship("User")


class TransferPair(Base):
    __tablename__ = "transfer_pairs"
    id: Mapped[int] = mapped_column(primary_key=True)
    from_transaction_id: Mapped[int] = mapped_column(ForeignKey("transactions.id"))
    to_transaction_id: Mapped[int] = mapped_column(ForeignKey("transactions.id"))
    created_at: Mapped[dt] = mapped_column(
        DateTime(timezone=True), default=lambda: dt.now(timezone.utc)
    )
    # relationship 1 — for from_transaction_id
    from_transaction: Mapped["Transaction"] = relationship(
        "Transaction",
        foreign_keys=[from_transaction_id],
        back_populates="transfer_from",
    )
    # relationship 2 — for to_transaction_id
    to_transaction: Mapped["Transaction"] = relationship(
        "Transaction",
        foreign_keys=[to_transaction_id],
        back_populates="transfer_to",
    )
