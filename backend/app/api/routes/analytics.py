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
    AccountTypeEnum,
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

# Routes
@router.get("/networth", response_model=NetWorthOut)
def get_net_worth(db: DbSession):
    accounts = db.query(Account).filter(
        Account.is_active.is_(True),
        Account.type != AccountTypeEnum.POCKET
    ).all()

    per_account = []
    total = Decimal("0")

    for acc in accounts:
        # 1. get latest snapshot
        latest = ...

        if latest is None:
            current = Decimal("0")
        else:
            # 2. sum income after snapshot
            income_after = ...

            # 3. sum expenses after snapshot
            expense_after = ...

            # 4. calculate current balance
            current = latest.amount + income_after - expense_after

        total += current
        per_account.append(AccountBalanceOut(
            account_id=acc.id,
            name=acc.name,
            bank=acc.bank,
            color=acc.color,
            balance=current,
        ))

    return NetWorthOut(total=total, per_account=per_account)