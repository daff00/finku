from datetime import date as date_type
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, field_validator

# import your enums from models
from app.models.models import (
    AccountTypeEnum,
    BankEnum,
    CategoryEnum,
    CurrencyEnum,
    SourceEnum,
    TransactionTypeEnum,
)


# Account Schemas
class AccountCreate(BaseModel):
    name: str
    bank: BankEnum
    type: AccountTypeEnum
    color: str
    currency: CurrencyEnum = CurrencyEnum.IDR
    parent_id: int | None = None
    account_number: str | None = None
    
class AccountOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    parent_id: int | None
    account_number: str | None
    name: str
    bank: BankEnum
    type: AccountTypeEnum
    color: str
    currency: CurrencyEnum
    is_active: bool
    created_at: datetime
    

class AccountUpdate(BaseModel):
    parent_id: int | None = None
    name: str | None = None
    color: str | None = None
    currency: CurrencyEnum | None = None
    is_active: bool | None = None
    

# Transaction Schemas
class TransactionCreate(BaseModel):
    date: date_type
    amount: Decimal
    type: TransactionTypeEnum
    category: CategoryEnum
    note: str = ""
    source: SourceEnum = SourceEnum.MANUAL
    currency: CurrencyEnum | None = None
    account_id: int
    original_amount: Decimal | None = None
    original_currency: CurrencyEnum | None = None
    

class TransactionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    account_id: int
    date: date_type
    amount: Decimal
    type: TransactionTypeEnum
    category: CategoryEnum
    note: str
    source: SourceEnum
    currency: CurrencyEnum
    ref_id: str | None
    original_amount: Decimal | None
    original_currency: CurrencyEnum | None
    created_at : datetime
    
class TransactionUpdate(BaseModel):
    date: date_type | None = None
    amount: Decimal | None = None
    type: TransactionTypeEnum | None = None
    category: CategoryEnum | None = None
    note: str | None = None
    source: SourceEnum | None = None
    currency: CurrencyEnum | None = None
    original_amount: Decimal | None = None
    original_currency: CurrencyEnum | None = None


# Transfer Schema
class TransferCreate(BaseModel):
    from_account_id: int
    to_account_id: int
    date: date_type
    amount: Decimal
    note: str = ""
    fee: Decimal = Decimal(0)
    from_currency: CurrencyEnum | None = None
    to_currency: CurrencyEnum | None = None
    from_amount: Decimal | None = None
    to_amount: Decimal | None = None
    rate_applied: Decimal | None = None


# Balance Schemas
class BalanceCreate(BaseModel):
    account_id: int
    amount: Decimal


class BalanceOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    account_id: int
    amount: Decimal
    recorded_at: datetime


class ImportResultOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    total_parsed: int
    imported: int
    duplicates: int
    errors: int
    error_details: list[str]


# Analytics Schemas
class AccountBalanceOut(BaseModel):
    account_id: int
    name: str
    bank: BankEnum
    color: str
    balance: Decimal


class NetWorthOut(BaseModel):
    total: Decimal
    per_account: list[AccountBalanceOut]


class MonthlySummaryOut(BaseModel):
    month: str          # "2026-07"
    income: Decimal
    expenses: Decimal
    savings: Decimal


class CategoryBreakdownOut(BaseModel):
    category: CategoryEnum
    total: Decimal
    percentage: float

# Auth Schemas
class UserCreate(BaseModel):
    username: str
    password: str
    display_name: str

    @field_validator("password")
    @classmethod
    def password_max_length(cls, v: str) -> str:
        if len(v.encode("utf-8")) > 72:
            raise ValueError("Password cannot be longer than 72 characters")
        return v

class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    username: str
    display_name: str
    is_active: bool
    created_at: datetime

class LoginRequest(BaseModel):
    username: str
    password: str

class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    username: str | None = None
    
class ProfileUpdate(BaseModel):
    display_name: str

    @field_validator("display_name")
    @classmethod
    def display_name_not_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Display name cannot be empty")
        return v.strip()


class PasswordChange(BaseModel):
    current_password: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def new_password_length(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        if len(v.encode("utf-8")) > 72:
            raise ValueError("Password cannot be longer than 72 characters")
        return v