import calendar
from datetime import date, datetime
from decimal import Decimal
from typing import Annotated

from fastapi import APIRouter, Depends, Query, Request, Response
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.dependencies import CurrentUser, DbSession
from app.core.rate_limit import analytics_limit
from app.models.models import (
    Account,
    Balance,
    CurrencyEnum,
    Transaction,
    TransactionTypeEnum,
)
from app.schemas.schemas import (
    AccountBalanceOut,
    CategoryBreakdownOut,
    MonthlySummaryOut,
    NetWorthOut,
)

router = APIRouter(prefix="/analytics", tags=["analytics"])
BASE_CURRENCY = CurrencyEnum.IDR
USD_TO_IDR_RATE = Decimal("15300")


# ── Helper ────────────────────────────────────────────────────────────────────
def get_month_range(year: int, month: int) -> tuple[date, date]:
    start = date(year, month, 1)
    end = date(year, month, calendar.monthrange(year, month)[1])
    return start, end


def convert_value_to_base_currency(
    amount: Decimal,
    currency: CurrencyEnum | str | None,
) -> Decimal:
    amount_decimal = Decimal(str(amount))

    if currency is None:
        currency = BASE_CURRENCY
    elif isinstance(currency, str):
        currency = CurrencyEnum(currency)

    if currency == BASE_CURRENCY:
        return amount_decimal
    if currency == CurrencyEnum.USD:
        return amount_decimal * USD_TO_IDR_RATE
    return amount_decimal


def sum_transactions_in_base_currency(transactions: list[Transaction]) -> Decimal:
    total = Decimal("0")
    for transaction in transactions:
        total += convert_value_to_base_currency(transaction.amount, transaction.currency)
    return total


# ── Routes ────────────────────────────────────────────────────────────────────

@router.get("/networth", response_model=NetWorthOut)
@analytics_limit
def get_net_worth(
    request: Request,
    response: Response,
    current_user: CurrentUser,
    db: DbSession,
):
    accounts = db.query(Account).filter(
        Account.user_id == current_user.id,
        Account.is_active.is_(True),
    ).all()

    per_account = []
    total = Decimal("0")

    for acc in accounts:
        latest = (
            db.query(Balance)
            .filter(
                Balance.account_id == acc.id,
                Balance.user_id == current_user.id,
            )
            .order_by(Balance.recorded_at.desc())
            .first()
        )

        if latest is None:
            income_transactions = db.query(Transaction).filter(
                Transaction.account_id == acc.id,
                Transaction.user_id == current_user.id,
                Transaction.type == TransactionTypeEnum.INCOME,
            ).all()
            expense_transactions = db.query(Transaction).filter(
                Transaction.account_id == acc.id,
                Transaction.user_id == current_user.id,
                Transaction.type == TransactionTypeEnum.EXPENSE,
            ).all()

            income_total = sum_transactions_in_base_currency(income_transactions)
            expense_total = sum_transactions_in_base_currency(expense_transactions)
            current = income_total - expense_total
        else:
            income_transactions = db.query(Transaction).filter(
                Transaction.account_id == acc.id,
                Transaction.user_id == current_user.id,
                Transaction.type == TransactionTypeEnum.INCOME,
                Transaction.date >= latest.recorded_at.date(),
            ).all()
            expense_transactions = db.query(Transaction).filter(
                Transaction.account_id == acc.id,
                Transaction.user_id == current_user.id,
                Transaction.type == TransactionTypeEnum.EXPENSE,
                Transaction.date >= latest.recorded_at.date(),
            ).all()

            income_after = sum_transactions_in_base_currency(income_transactions)
            expense_after = sum_transactions_in_base_currency(expense_transactions)
            current = convert_value_to_base_currency(latest.amount, acc.currency)
            current += income_after - expense_after

        total += current
        per_account.append(
            AccountBalanceOut(
                account_id=acc.id,
                name=acc.name,
                bank=acc.bank,
                color=acc.color,
                balance=current,
            )
        )

    return NetWorthOut(total=total, per_account=per_account)


@router.get("/monthly", response_model=list[MonthlySummaryOut])
@analytics_limit
def get_monthly_summary(
    request: Request,
    response: Response,
    current_user: CurrentUser,
    db: DbSession,
    months: int = Query(6, ge=1, le=24),
):
    now = datetime.now()
    result = []

    for i in range(months - 1, -1, -1):
        year = now.year
        month = now.month - i
        while month <= 0:
            month += 12
            year -= 1

        start, end = get_month_range(year, month)
        label = f"{year}-{month:02d}"

        income_transactions = db.query(Transaction).filter(
            Transaction.user_id == current_user.id,
            Transaction.type == TransactionTypeEnum.INCOME,
            Transaction.date >= start,
            Transaction.date <= end,
        ).all()
        expenses_transactions = db.query(Transaction).filter(
            Transaction.user_id == current_user.id,
            Transaction.type == TransactionTypeEnum.EXPENSE,
            Transaction.date >= start,
            Transaction.date <= end,
        ).all()

        income = sum_transactions_in_base_currency(income_transactions)
        expenses = sum_transactions_in_base_currency(expenses_transactions)

        result.append(
            MonthlySummaryOut(
                month=label,
                income=income,
                expenses=expenses,
                savings=income - expenses,
            )
        )

    return result


@router.get("/categories", response_model=list[CategoryBreakdownOut])
@analytics_limit
def get_category_breakdown(
    request: Request,
    response: Response,
    current_user: CurrentUser,
    db: DbSession,
    month: str | None = Query(
        None, description="Format: YYYY-MM, defaults to current month"
    ),
):
    if month:
        year, mon = map(int, month.split("-"))
    else:
        now = datetime.now()
        year, mon = now.year, now.month

    start, end = get_month_range(year, mon)

    rows = db.query(Transaction).filter(
        Transaction.user_id == current_user.id,
        Transaction.type == TransactionTypeEnum.EXPENSE,
        Transaction.date >= start,
        Transaction.date <= end,
    ).all()

    by_category: dict[str, Decimal] = {}
    for transaction in rows:
        bucket = by_category.setdefault(transaction.category.value, Decimal("0"))
        by_category[transaction.category.value] = (
            bucket + convert_value_to_base_currency(transaction.amount, transaction.currency)
        )

    items = [
        CategoryBreakdownOut(
            category=category,
            total=total,
            percentage=0.0,
        )
        for category, total in sorted(
            by_category.items(),
            key=lambda item: item[1],
            reverse=True,
        )
    ]

    grand_total = sum((item.total for item in items), Decimal("0")) or Decimal("1")
    for item in items:
        item.percentage = round(float(item.total / grand_total * 100), 2)

    return items


@router.get("/accounts", response_model=list[AccountBalanceOut])
@analytics_limit
def get_spending_by_account(
    request: Request,
    response: Response,
    current_user: CurrentUser,
    db: DbSession,
    month: str | None = Query(
        None, description="Format: YYYY-MM, defaults to current month"
    ),
):
    if month:
        year, mon = map(int, month.split("-"))
    else:
        now = datetime.now()
        year, mon = now.year, now.month

    start, end = get_month_range(year, mon)

    rows = db.query(Transaction).filter(
        Transaction.user_id == current_user.id,
        Transaction.type == TransactionTypeEnum.EXPENSE,
        Transaction.date >= start,
        Transaction.date <= end,
    ).all()

    totals_by_account: dict[int, Decimal] = {}
    for transaction in rows:
        bucket = totals_by_account.setdefault(transaction.account_id, Decimal("0"))
        totals_by_account[transaction.account_id] = (
            bucket + convert_value_to_base_currency(transaction.amount, transaction.currency)
        )

    result = []
    for account_id, total in sorted(
        totals_by_account.items(),
        key=lambda item: item[1],
        reverse=True,
    ):
        acc = db.query(Account).filter(
            Account.id == account_id,
            Account.user_id == current_user.id,
        ).first()
        if acc:
            result.append(
                AccountBalanceOut(
                    account_id=acc.id,
                    name=acc.name,
                    bank=acc.bank,
                    color=acc.color,
                    balance=total,
                )
            )

    return result
