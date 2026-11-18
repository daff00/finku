import calendar
from datetime import date, datetime
from decimal import Decimal
from typing import Annotated

from fastapi import APIRouter, Depends, Query, Request, Response
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.routes.exchange_rate import get_usd_to_idr_rate
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


# ── Helper ────────────────────────────────────────────────────────────────────
def get_month_range(year: int, month: int) -> tuple[date, date]:
    start = date(year, month, 1)
    end = date(year, month, calendar.monthrange(year, month)[1])
    return start, end


def convert_value_to_base_currency(
    amount: Decimal,
    currency: CurrencyEnum | str | None,
    usd_to_idr_rate: Decimal | None = None,
) -> Decimal:
    amount_decimal = Decimal(str(amount))

    if currency is None:
        currency = BASE_CURRENCY
    elif isinstance(currency, str):
        currency = CurrencyEnum(currency)

    if currency == BASE_CURRENCY:
        return amount_decimal
    if currency == CurrencyEnum.USD:
        if usd_to_idr_rate is None:
            raise ValueError("A USD-to-IDR exchange rate is required")
        return (amount_decimal * usd_to_idr_rate).quantize(Decimal("0.01"))
    return amount_decimal


def sum_transactions_in_base_currency(
    transactions: list[Transaction],
    usd_to_idr_rate: Decimal | None = None,
) -> Decimal:
    total = Decimal("0")
    for transaction in transactions:
        total += convert_value_to_base_currency(
            transaction.amount, transaction.currency, usd_to_idr_rate
        )
    return total


# ── Routes ────────────────────────────────────────────────────────────────────

@router.get("/networth", response_model=NetWorthOut)
@analytics_limit
async def get_net_worth(
    request: Request,
    response: Response,
    current_user: CurrentUser,
    db: DbSession,
):
    accounts = db.query(Account).filter(
        Account.user_id == current_user.id,
        Account.is_active.is_(True),
    ).all()

    has_usd_transaction = (
        db.query(Transaction.id)
        .filter(
            Transaction.user_id == current_user.id,
            Transaction.currency == CurrencyEnum.USD,
        )
        .first()
        is not None
    )
    usd_to_idr_rate = (
        await get_usd_to_idr_rate()
        if has_usd_transaction or any(account.currency == CurrencyEnum.USD for account in accounts)
        else None
    )

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

            income_total = sum_transactions_in_base_currency(
                income_transactions, usd_to_idr_rate
            )
            expense_total = sum_transactions_in_base_currency(
                expense_transactions, usd_to_idr_rate
            )
            current = income_total - expense_total
        else:
            income_transactions = db.query(Transaction).filter(
                Transaction.account_id == acc.id,
                Transaction.user_id == current_user.id,
                Transaction.type == TransactionTypeEnum.INCOME,
                Transaction.created_at > latest.recorded_at,
            ).all()
            expense_transactions = db.query(Transaction).filter(
                Transaction.account_id == acc.id,
                Transaction.user_id == current_user.id,
                Transaction.type == TransactionTypeEnum.EXPENSE,
                Transaction.created_at > latest.recorded_at,
            ).all()

            income_after = sum_transactions_in_base_currency(
                income_transactions, usd_to_idr_rate
            )
            expense_after = sum_transactions_in_base_currency(
                expense_transactions, usd_to_idr_rate
            )
            current = convert_value_to_base_currency(
                latest.amount, acc.currency, usd_to_idr_rate
            )
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
async def get_monthly_summary(
    request: Request,
    response: Response,
    current_user: CurrentUser,
    db: DbSession,
    months: int = Query(6, ge=1, le=24),
):
    now = datetime.now()
    result = []
    start_year = now.year
    start_month = now.month - (months - 1)
    while start_month <= 0:
        start_month += 12
        start_year -= 1
    start_date = date(start_year, start_month, 1)
    end_date = date(now.year, now.month, calendar.monthrange(now.year, now.month)[1])
    has_usd_transaction = (
        db.query(Transaction.id)
        .filter(
            Transaction.user_id == current_user.id,
            Transaction.currency == CurrencyEnum.USD,
            Transaction.date >= start_date,
            Transaction.date <= end_date,
        )
        .first()
        is not None
    )
    usd_to_idr_rate = await get_usd_to_idr_rate() if has_usd_transaction else None

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

        income = sum_transactions_in_base_currency(
            income_transactions, usd_to_idr_rate
        )
        expenses = sum_transactions_in_base_currency(
            expenses_transactions, usd_to_idr_rate
        )

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
async def get_category_breakdown(
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
    usd_to_idr_rate = (
        await get_usd_to_idr_rate()
        if any(transaction.currency == CurrencyEnum.USD for transaction in rows)
        else None
    )

    by_category: dict[str, Decimal] = {}
    for transaction in rows:
        bucket = by_category.setdefault(transaction.category.value, Decimal("0"))
        by_category[transaction.category.value] = (
            bucket
            + convert_value_to_base_currency(
                transaction.amount, transaction.currency, usd_to_idr_rate
            )
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
async def get_spending_by_account(
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
    usd_to_idr_rate = (
        await get_usd_to_idr_rate()
        if any(transaction.currency == CurrencyEnum.USD for transaction in rows)
        else None
    )

    totals_by_account: dict[int, Decimal] = {}
    for transaction in rows:
        bucket = totals_by_account.setdefault(transaction.account_id, Decimal("0"))
        totals_by_account[transaction.account_id] = (
            bucket
            + convert_value_to_base_currency(
                transaction.amount, transaction.currency, usd_to_idr_rate
            )
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
