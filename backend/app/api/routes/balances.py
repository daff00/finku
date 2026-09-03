from datetime import date
from decimal import Decimal

from fastapi import APIRouter, HTTPException, Request, Response
from sqlalchemy import func

from app.core.dependencies import CurrentUser, DbSession
from app.core.rate_limit import balances_limit
from app.models.models import Account, Balance, Transaction, TransactionTypeEnum
from app.schemas.schemas import BalanceCreate, BalanceOut

router = APIRouter(prefix="/balances", tags=["balances"])


def compute_current_balance(db: DbSession, user_id: int, account_id: int) -> Decimal:
    """
    Computes an account's current balance as:
    latest snapshot amount + net effect of transactions recorded after that snapshot.

    If no snapshot exists, assumes a starting balance of 0.
    """
    latest_snapshot = (
        db.query(Balance)
        .filter(Balance.account_id == account_id, Balance.user_id == user_id)
        .order_by(Balance.recorded_at.desc())
        .first()
    )

    snapshot_amount = latest_snapshot.amount if latest_snapshot else Decimal("0")
    snapshot_date = latest_snapshot.recorded_at if latest_snapshot else date.min

    # Net effect of transactions after the snapshot:
    # INCOME and incoming TRANSFER legs add; EXPENSE and outgoing TRANSFER legs subtract.
    # Since transfers are stored as two separate rows (one leg per account) with a positive
    # amount each, we need to know direction. Simplest correct approach: signed sum based on type,
    # where TRANSFER rows' sign depends on which side of the pair they're on.
    # Given your schema doesn't store direction directly on Transaction, the safest general
    # rule (matching income/expense conventions elsewhere in your app) is:
    #   INCOME  → +amount
    #   EXPENSE → -amount
    #   TRANSFER → +amount (this specific account received it) or -amount (this account sent it)
    #
    # Since TransferPair links from/to transaction ids, we can determine direction via a join,
    # but for a simpler first pass: treat TRANSFER rows on this account using the same
    # signed convention as your dashboard's amount coloring (TransactionRow already treats
    # transfers as neutral display, but for balance math we need real direction).

    income_sum = (
        db.query(func.coalesce(func.sum(Transaction.amount), 0))
        .filter(
            Transaction.account_id == account_id,
            Transaction.user_id == user_id,
            Transaction.type == TransactionTypeEnum.INCOME,
            Transaction.date >= snapshot_date,
        )
        .scalar()
    )

    expense_sum = (
        db.query(func.coalesce(func.sum(Transaction.amount), 0))
        .filter(
            Transaction.account_id == account_id,
            Transaction.user_id == user_id,
            Transaction.type == TransactionTypeEnum.EXPENSE,
            Transaction.date >= snapshot_date,
        )
        .scalar()
    )

    # Transfers: figure out direction via TransferPair
    from app.models.models import TransferPair

    outgoing_transfer_sum = (
        db.query(func.coalesce(func.sum(Transaction.amount), 0))
        .join(TransferPair, TransferPair.from_transaction_id == Transaction.id)
        .filter(
            Transaction.account_id == account_id,
            Transaction.user_id == user_id,
            Transaction.date >= snapshot_date,
        )
        .scalar()
    )

    incoming_transfer_sum = (
        db.query(func.coalesce(func.sum(Transaction.amount), 0))
        .join(TransferPair, TransferPair.to_transaction_id == Transaction.id)
        .filter(
            Transaction.account_id == account_id,
            Transaction.user_id == user_id,
            Transaction.date >= snapshot_date,
        )
        .scalar()
    )

    return (
        snapshot_amount
        + income_sum
        - expense_sum
        + incoming_transfer_sum
        - outgoing_transfer_sum
    )


@router.get("/{account_id}/latest", response_model=BalanceOut)
@balances_limit
def get_latest_balance(
    account_id: int,
    request: Request,
    response: Response,
    current_user: CurrentUser,
    db: DbSession,
):
    account = db.query(Account).filter(
        Account.id == account_id,
        Account.user_id == current_user.id,
    ).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")

    computed_amount = compute_current_balance(db, current_user.id, account_id)

    # Return in the same BalanceOut shape the frontend already expects,
    # but with a live-computed amount instead of a stale stored snapshot.
    latest_snapshot = (
        db.query(Balance)
        .filter(Balance.account_id == account_id, Balance.user_id == current_user.id)
        .order_by(Balance.recorded_at.desc())
        .first()
    )

    return BalanceOut(
        id=latest_snapshot.id if latest_snapshot else 0,
        account_id=account_id,
        amount=computed_amount,
        recorded_at=latest_snapshot.recorded_at if latest_snapshot else date.today(),
    )