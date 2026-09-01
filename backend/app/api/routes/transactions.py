import calendar
import hashlib
from datetime import date
from decimal import Decimal

from fastapi import APIRouter, HTTPException, Query, Request, Response
from sqlalchemy import func

from app.core.dependencies import CurrentUser, DbSession
from app.core.rate_limit import transactions_limit
from app.models.models import (
    Account,
    Balance,
    CategoryEnum,
    Transaction,
    TransactionTypeEnum,
    TransferPair,
)
from app.schemas.schemas import (
    TransactionCreate,
    TransactionOut,
    TransactionUpdate,
    TransferCreate,
)

router = APIRouter(prefix="/transactions", tags=["transactions"])


# ── Helper ────────────────────────────────────────────────────────────────────
def make_ref_id(account_id: int, txn_date: date, amount, note: str) -> str:
    raw = f"{account_id}:{txn_date}:{amount}:{note}"
    return hashlib.sha256(raw.encode()).hexdigest()


def get_latest_account_balance(db, user_id: int, account_id: int):
    from app.models.models import Balance, Transaction, TransactionTypeEnum

    latest = (
        db.query(Balance)
        .filter(
            Balance.account_id == account_id,
            Balance.user_id == user_id,
        )
        .order_by(Balance.recorded_at.desc())
        .first()
    )

    if latest is None:
        return None

    current = latest.amount
    income_total = (
        db.query(Transaction)
        .filter(
            Transaction.account_id == account_id,
            Transaction.user_id == user_id,
            Transaction.type == TransactionTypeEnum.INCOME,
            Transaction.created_at >= latest.recorded_at,
        )
        .with_entities(func.sum(Transaction.amount))
        .scalar() or Decimal("0")
    )
    expense_total = (
        db.query(Transaction)
        .filter(
            Transaction.account_id == account_id,
            Transaction.user_id == user_id,
            Transaction.type == TransactionTypeEnum.EXPENSE,
            Transaction.created_at >= latest.recorded_at,
        )
        .with_entities(func.sum(Transaction.amount))
        .scalar() or Decimal("0")
    )

    return current + income_total - expense_total


def make_transfer_ref_id(
    from_account_id: int,
    to_account_id: int,
    txn_date: date,
    amount,
    fee: str | None = None,
    note: str | None = None,
) -> str:
    """Deterministic hash for a logical transfer.

    The transfer is identified by the source account, destination account, date,
    amount, fee, and note. Both transfer legs share the same logical reference so
    a retry of the same request is rejected instead of creating a second pair.
    """
    raw = (
        f"{from_account_id}:{to_account_id}:{txn_date}:{amount}:"
        f"{fee or 0}:{note or ''}"
    )
    return hashlib.sha256(raw.encode()).hexdigest()


def apply_balance_delta(db, user_id: int, account_id: int, delta: Decimal):
    latest = (
        db.query(Balance)
        .filter(
            Balance.account_id == account_id,
            Balance.user_id == user_id,
        )
        .order_by(Balance.recorded_at.desc())
        .first()
    )

    base_amount = latest.amount if latest else Decimal("0")
    balance = Balance(
        user_id=user_id,
        account_id=account_id,
        amount=base_amount + delta,
    )
    db.add(balance)
    return balance


# ── Routes ────────────────────────────────────────────────────────────────────

@router.post("/transfer", response_model=list[TransactionOut], status_code=201)
@transactions_limit
def create_transfer(
    request: Request,
    response: Response,
    payload: TransferCreate,
    current_user: CurrentUser,
    db: DbSession,
):
    from_account = db.query(Account).filter(
        Account.id == payload.from_account_id,
        Account.user_id == current_user.id,
    ).first()
    if not from_account:
        raise HTTPException(status_code=404, detail="Source account not found")

    to_account = db.query(Account).filter(
        Account.id == payload.to_account_id,
        Account.user_id == current_user.id,
    ).first()
    if not to_account:
        raise HTTPException(status_code=404, detail="Destination account not found")

    if payload.from_account_id == payload.to_account_id:
        raise HTTPException(
            status_code=400,
            detail="Cannot transfer to the same account"
        )

    source_currency = payload.from_currency or from_account.currency
    destination_currency = payload.to_currency or to_account.currency

    if source_currency != from_account.currency:
        raise HTTPException(
            status_code=400,
            detail="Transfer source currency must match the source account currency",
        )
    if destination_currency != to_account.currency:
        raise HTTPException(
            status_code=400,
            detail="Transfer destination currency must match the destination account currency",
        )

    source_amount = payload.from_amount or payload.amount
    destination_amount = payload.to_amount or payload.amount

    if from_account.currency == to_account.currency and source_amount != destination_amount:
        raise HTTPException(
            status_code=400,
            detail="Same-currency transfers require matching source and destination amounts",
        )

    available_balance = get_latest_account_balance(db, current_user.id, payload.from_account_id)
    if available_balance is not None and source_amount > available_balance:
        raise HTTPException(
            status_code=400,
            detail="Insufficient funds in source account",
        )

    try:
        # A retry of the same transfer must be identified by the exact same row-level
        # ref_id used when the original transfer was written. We compare against the
        # source leg, because that is the canonical entry for the transfer and is the
        # value that the second request will re-use.
        legacy_from_ref_id = make_ref_id(
            payload.from_account_id,
            payload.date,
            source_amount,
            "OUT",
        )
        legacy_to_ref_id = make_ref_id(
            payload.to_account_id,
            payload.date,
            destination_amount,
            "IN",
        )
        from_ref_id = make_transfer_ref_id(
            payload.from_account_id,
            payload.to_account_id,
            payload.date,
            source_amount,
            fee=payload.fee,
            note=payload.note or f"Transfer to {to_account.name}",
        )
        to_ref_id = make_transfer_ref_id(
            payload.to_account_id,
            payload.from_account_id,
            payload.date,
            destination_amount,
            fee=payload.fee,
            note=payload.note or f"Transfer from {from_account.name}",
        )

        existing_from_tx = db.query(Transaction).filter(
            Transaction.ref_id.in_([from_ref_id, legacy_from_ref_id]),
            Transaction.user_id == current_user.id,
        ).first()
        if existing_from_tx:
            raise HTTPException(
                status_code=409,
                detail="Duplicate transfer — this transfer already exists"
            )

        if payload.fee and payload.fee > 0:
            fee_ref_id = make_ref_id(
                payload.from_account_id,
                payload.date,
                payload.fee,
                "FEE",
            )
            existing_fee_tx = db.query(Transaction).filter(
                Transaction.ref_id.in_([fee_ref_id]),
                Transaction.user_id == current_user.id,
            ).first()
            if existing_fee_tx:
                raise HTTPException(
                    status_code=409,
                    detail="Duplicate transfer — this transfer already exists"
                )

        from_tx = Transaction(
            user_id=current_user.id,
            account_id=payload.from_account_id,
            date=payload.date,
            amount=source_amount,
            type=TransactionTypeEnum.TRANSFER,
            category=CategoryEnum.TRANSFER,
            note=payload.note or f"Transfer to {to_account.name}",
            ref_id=from_ref_id,
            currency=source_currency,
        )
        to_tx = Transaction(
            user_id=current_user.id,
            account_id=payload.to_account_id,
            date=payload.date,
            amount=destination_amount,
            type=TransactionTypeEnum.TRANSFER,
            category=CategoryEnum.TRANSFER,
            note=payload.note or f"Transfer from {from_account.name}",
            ref_id=to_ref_id,
            currency=destination_currency,
        )

        db.add_all([from_tx, to_tx])
        db.flush()  # Assign IDs to transactions without committing

        # Create transfer pair linking the two transactions
        pair = TransferPair(
            from_transaction_id=from_tx.id,
            to_transaction_id=to_tx.id,
        )
        db.add(pair)

        # ── BI-FAST fee transaction ───────────────────────────────────
        # Fee transactions also need deduplication
        if payload.fee and payload.fee > 0:
            fee_tx = Transaction(
                user_id=current_user.id,
                account_id=payload.from_account_id,
                date=payload.date,
                amount=payload.fee,
                type=TransactionTypeEnum.EXPENSE,
                category=CategoryEnum.BILLS,
                note="BI-FAST transfer fee",
                ref_id=make_ref_id(
                    payload.from_account_id,
                    payload.date,
                    payload.fee,
                    "FEE",
                ),
            )
            db.add(fee_tx)

        db.commit()
        apply_balance_delta(db, current_user.id, payload.from_account_id, -source_amount)
        apply_balance_delta(db, current_user.id, payload.to_account_id, destination_amount)
        if payload.fee and payload.fee > 0:
            apply_balance_delta(db, current_user.id, payload.from_account_id, -payload.fee)
        db.commit()
        db.refresh(from_tx)
        db.refresh(to_tx)
        return [from_tx, to_tx]

    except HTTPException:
        # Re-raise HTTP exceptions (e.g., 404, 409, 400)
        raise
    except Exception as e:
        # Rollback on any unexpected error to prevent orphaned transactions
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Transfer creation failed: {str(e)}"
        ) from e


@router.get("/", response_model=list[TransactionOut])
@transactions_limit
def list_transactions(
    request: Request,
    response: Response,
    current_user: CurrentUser,
    db: DbSession,
    account_id: int | None = Query(None),
    type: TransactionTypeEnum | None = Query(None),
    category: CategoryEnum | None = Query(None),
    month: str | None = Query(None, description="Format: YYYY-MM"),
    limit: int = Query(50, le=200),
    offset: int = Query(0),
):
    q = db.query(Transaction).filter(
        Transaction.user_id == current_user.id
    )

    if account_id:
        q = q.filter(Transaction.account_id == account_id)
    if type:
        q = q.filter(Transaction.type == type)
    if category:
        q = q.filter(Transaction.category == category)
    if month:
        year, mon = map(int, month.split("-"))
        start = date(year, mon, 1)
        end = date(year, mon, calendar.monthrange(year, mon)[1])
        q = q.filter(
            Transaction.date >= start,
            Transaction.date <= end,
        )

    return (
        q.order_by(Transaction.date.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )


@router.post("/", response_model=TransactionOut, status_code=201)
@transactions_limit
def create_transaction(
    request: Request,
    response: Response,
    payload: TransactionCreate,
    current_user: CurrentUser,
    db: DbSession,
):
    account = db.query(Account).filter(
        Account.id == payload.account_id,
        Account.user_id == current_user.id,
    ).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")

    submitted_currency = payload.currency
    if submitted_currency and submitted_currency != account.currency:
        raise HTTPException(
            status_code=400,
            detail="Transaction currency must match the account currency",
        )

    if payload.type == TransactionTypeEnum.EXPENSE:
        available_balance = get_latest_account_balance(db, current_user.id, payload.account_id)
        if available_balance is not None and payload.amount > available_balance:
            raise HTTPException(
                status_code=400,
                detail="Insufficient funds in source account",
            )

    payload_data = payload.model_dump()
    payload_data["currency"] = submitted_currency or account.currency

    # ref_id is a deterministic hash of the same business fields the user sees.
    # If the same payload is retried, the hash matches and we reject the duplicate
    # instead of inserting a second transaction for the same event.
    ref_id = make_ref_id(
        payload.account_id,
        payload.date,
        payload.amount,
        payload.note,
    )

    existing = db.query(Transaction).filter(
        Transaction.ref_id == ref_id,
        Transaction.user_id == current_user.id,
    ).first()
    if existing:
        raise HTTPException(
            status_code=409,
            detail="Duplicate transaction — this entry already exists"
        )

    tx = Transaction(
        user_id=current_user.id,
        ref_id=ref_id,
        **payload_data,
    )
    db.add(tx)
    db.commit()
    db.refresh(tx)

    delta = payload.amount if payload.type == TransactionTypeEnum.INCOME else -payload.amount
    if payload.type in {TransactionTypeEnum.INCOME, TransactionTypeEnum.EXPENSE}:
        apply_balance_delta(db, current_user.id, payload.account_id, delta)
        db.commit()

    return tx


@router.get("/{transaction_id}", response_model=TransactionOut)
@transactions_limit
def get_transaction(
    transaction_id: int,
    request: Request,
    response: Response,
    current_user: CurrentUser,
    db: DbSession,
):
    tx = db.query(Transaction).filter(
        Transaction.id == transaction_id,
        Transaction.user_id == current_user.id,
    ).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return tx


@router.patch("/{transaction_id}", response_model=TransactionOut)
@transactions_limit
def update_transaction(
    transaction_id: int,
    request: Request,
    response: Response,
    payload: TransactionUpdate,
    current_user: CurrentUser,
    db: DbSession,
):
    tx = db.query(Transaction).filter(
        Transaction.id == transaction_id,
        Transaction.user_id == current_user.id,
    ).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")

    if tx.type == TransactionTypeEnum.TRANSFER:
        raise HTTPException(
            status_code=400,
            detail="Cannot edit transfer transactions directly"
        )

    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(tx, field, value)
    db.commit()
    db.refresh(tx)
    return tx


@router.delete("/{transaction_id}", status_code=204)
@transactions_limit
def delete_transaction(
    transaction_id: int,
    request: Request,
    response: Response,
    current_user: CurrentUser,
    db: DbSession,
):
    # Idempotency: Fetch transaction if exists
    tx = db.query(Transaction).filter(
        Transaction.id == transaction_id,
        Transaction.user_id == current_user.id,
    ).first()

    # DELETE is intentionally idempotent: retries of the same request should not
    # surface a not-found error, and a second delete should be treated as a no-op.
    response.status_code = 204
    if not tx:
        return response

    # If transaction is a transfer, cascade delete both sides
    if tx.type == TransactionTypeEnum.TRANSFER:
        pair = db.query(TransferPair).filter(
            (TransferPair.from_transaction_id == tx.id) |
            (TransferPair.to_transaction_id == tx.id)
        ).first()
        if pair:
            other_id = (
                pair.to_transaction_id
                if pair.from_transaction_id == tx.id
                else pair.from_transaction_id
            )
            other_tx = db.query(Transaction).filter(
                Transaction.id == other_id,
                Transaction.user_id == current_user.id,
            ).first()
            db.delete(pair)
            db.flush()
            if other_tx:
                db.delete(other_tx)
            db.flush()

    db.delete(tx)
    db.commit()
    return response
