import calendar
from datetime import date, datetime
from decimal import Decimal
from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.models import (
    Account,
    Balance,
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

DbSession = Annotated[Session, Depends(get_db)]


# ── Helper ────────────────────────────────────────────────────────────────────
def get_month_range(year: int, month: int) -> tuple[date, date]:
    start = date(year, month, 1)
    end = date(year, month, calendar.monthrange(year, month)[1])
    return start, end


# ── Routes ────────────────────────────────────────────────────────────────────

@router.get("/networth", response_model=NetWorthOut)
def get_net_worth(db: DbSession):
    accounts = db.query(Account).filter(
        Account.is_active.is_(True)
    ).all()

    per_account = []
    total = Decimal("0")

    for acc in accounts:
        latest = (
            db.query(Balance)
            .filter(Balance.account_id == acc.id)
            .order_by(Balance.recorded_at.desc())
            .first()
        )

        if latest is None:
            current = Decimal("0")
        else:
            income_after = (
                db.query(func.sum(Transaction.amount))
                .filter(
                    Transaction.account_id == acc.id,
                    Transaction.type == TransactionTypeEnum.INCOME,
                    Transaction.date > latest.recorded_at.date(),
                )
                .scalar()
            ) or Decimal("0")

            expense_after = (
                db.query(func.sum(Transaction.amount))
                .filter(
                    Transaction.account_id == acc.id,
                    Transaction.type == TransactionTypeEnum.EXPENSE,
                    Transaction.date > latest.recorded_at.date(),
                )
                .scalar()
            ) or Decimal("0")

            current = latest.amount + income_after - expense_after

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
def get_monthly_summary(
    db: DbSession,
    months: int = Query(6, ge=1, le=24),
):
    now = datetime.now()
    result = []

    for i in range(months - 1, -1, -1):
        year = now.year
        month = now.month - i

        # handle year rollover
        while month <= 0:
            month += 12
            year -= 1

        start, end = get_month_range(year, month)
        label = f"{year}-{month:02d}"

        income = (
            db.query(func.sum(Transaction.amount))
            .filter(
                Transaction.type == TransactionTypeEnum.INCOME,
                Transaction.date >= start,
                Transaction.date <= end,
            )
            .scalar()
        ) or Decimal("0")

        expenses = (
            db.query(func.sum(Transaction.amount))
            .filter(
                Transaction.type == TransactionTypeEnum.EXPENSE,
                Transaction.date >= start,
                Transaction.date <= end,
            )
            .scalar()
        ) or Decimal("0")

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
def get_category_breakdown(
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

    rows = (
        db.query(
            Transaction.category,
            func.sum(Transaction.amount).label("total"),
        )
        .filter(
            Transaction.type == TransactionTypeEnum.EXPENSE,
            Transaction.date >= start,
            Transaction.date <= end,
        )
        .group_by(Transaction.category)
        .order_by(func.sum(Transaction.amount).desc())
        .all()
    )

    grand_total = sum(r.total for r in rows) or Decimal("1")

    return [
        CategoryBreakdownOut(
            category=r.category,
            total=r.total,
            percentage=round(float(r.total / grand_total * 100), 2),
        )
        for r in rows
    ]


@router.get("/accounts", response_model=list[AccountBalanceOut])
def get_spending_by_account(
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

    rows = (
        db.query(
            Transaction.account_id,
            func.sum(Transaction.amount).label("total"),
        )
        .filter(
            Transaction.type == TransactionTypeEnum.EXPENSE,
            Transaction.date >= start,
            Transaction.date <= end,
        )
        .group_by(Transaction.account_id)
        .order_by(func.sum(Transaction.amount).desc())
        .all()
    )

    result = []
    for r in rows:
        acc = db.query(Account).filter(Account.id == r.account_id).first()
        if acc:
            result.append(
                AccountBalanceOut(
                    account_id=acc.id,
                    name=acc.name,
                    bank=acc.bank,
                    color=acc.color,
                    balance=r.total,
                )
            )

    return result