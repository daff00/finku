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
    TransferDirectionEnum,
    TransferPair,
)
from app.schemas.schemas import (
    TransactionCreate,
    TransactionOut,
    TransactionUpdate,
    TransferCreate,
)

router = APIRouter(prefix="/transactions", tags=["transactions"])


# ── Helpers ────────────────────────────────────────────────────────────────────
def make_ref_id(account_id: int, txn_date: date, amount, note: str) -> str:
    raw = f"{account_id}:{txn_date}:{amount}:{note}"
    return hashlib.sha256(raw.encode()).hexdigest()


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


def compute_current_balance(db: DbSession, user_id: int, account_id: int) -> Decimal:
    """
    Computes an account's current balance live from transaction history.

    Balance = latest manual checkpoint (if any) + net effect of every
    transaction recorded on/after that checkpoint's date.

    This replaces the old append-only "apply a delta on every mutation"
    approach. There is nothing to keep in sync — the balance is always
    derived fresh from the actual Transaction rows, so editing or deleting
    a transaction automatically produces the correct balance with no
    separate reversal bookkeeping required.
    """
    latest_checkpoint = (
        db.query(Balance)
        .filter(Balance.account_id == account_id, Balance.user_id == user_id)
        .order_by(Balance.recorded_at.desc())
        .first()
    )

    checkpoint_amount = latest_checkpoint.amount if latest_checkpoint else Decimal("0")
    checkpoint_date = (
        latest_checkpoint.recorded_at.date()
        if latest_checkpoint and hasattr(latest_checkpoint.recorded_at, "date")
        else (latest_checkpoint.recorded_at if latest_checkpoint else date.min)
    )

    income_sum = (
        db.query(func.coalesce(func.sum(Transaction.amount), 0))
        .filter(
            Transaction.account_id == account_id,
            Transaction.user_id == user_id,
            Transaction.type == TransactionTypeEnum.INCOME,
            Transaction.date >= checkpoint_date,
        )
        .scalar()
    )

    expense_sum = (
        db.query(func.coalesce(func.sum(Transaction.amount), 0))
        .filter(
            Transaction.account_id == account_id,
            Transaction.user_id == user_id,
            Transaction.type == TransactionTypeEnum.EXPENSE,
            Transaction.date >= checkpoint_date,
        )
        .scalar()
    )

    transfer_out_sum = (
        db.query(func.coalesce(func.sum(Transaction.amount), 0))
        .filter(
            Transaction.account_id == account_id,
            Transaction.user_id == user_id,
            Transaction.type == TransactionTypeEnum.TRANSFER,
            Transaction.direction == TransferDirectionEnum.OUT,
            Transaction.date >= checkpoint_date,
        )
        .scalar()
    )

    transfer_in_sum = (
        db.query(func.coalesce(func.sum(Transaction.amount), 0))
        .filter(
            Transaction.account_id == account_id,
            Transaction.user_id == user_id,
            Transaction.type == TransactionTypeEnum.TRANSFER,
            Transaction.direction == TransferDirectionEnum.IN,
            Transaction.date >= checkpoint_date,
        )
        .scalar()
    )

    return (
        checkpoint_amount
        + income_sum
        - expense_sum
        + transfer_in_sum
        - transfer_out_sum
    )


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

    available_balance = compute_current_balance(db, current_user.id, payload.from_account_id)
    total_outflow = source_amount + (payload.fee or Decimal("0"))
    if total_outflow > available_balance:
        raise HTTPException(
            status_code=400,
            detail="Insufficient funds in source account",
        )

    try:
        legacy_from_ref_id = make_ref_id(
            payload.from_account_id, payload.date, source_amount, "OUT",
        )
        legacy_to_ref_id = make_ref_id(
            payload.to_account_id, payload.date, destination_amount, "IN",
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
                payload.from_account_id, payload.date, payload.fee, "FEE",
            )
            existing_fee_tx = db.query(Transaction).filter(
                Transaction.ref_id == fee_ref_id,
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
            direction=TransferDirectionEnum.OUT,
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
            direction=TransferDirectionEnum.IN,
            category=CategoryEnum.TRANSFER,
            note=payload.note or f"Transfer from {from_account.name}",
            ref_id=to_ref_id,
            currency=destination_currency,
        )

        db.add_all([from_tx, to_tx])
        db.flush()

        pair = TransferPair(
            from_transaction_id=from_tx.id,
            to_transaction_id=to_tx.id,
        )
        db.add(pair)
        db.flush()

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
                    payload.from_account_id, payload.date, payload.fee, "FEE",
                ),
            )
            db.add(fee_tx)
            db.flush()
            pair.fee_transaction_id = fee_tx.id

        db.commit()
        db.refresh(from_tx)
        db.refresh(to_tx)
        return [from_tx, to_tx]

    except HTTPException:
        raise
    except Exception as e:
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
        available_balance = compute_current_balance(db, current_user.id, payload.account_id)
        if payload.amount > available_balance:
            raise HTTPException(
                status_code=400,
                detail="Insufficient funds in source account",
            )

    payload_data = payload.model_dump()
    payload_data["currency"] = submitted_currency or account.currency

    ref_id = make_ref_id(
        payload.account_id, payload.date, payload.amount, payload.note,
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

    update_data = payload.model_dump(exclude_none=True)

    # Determine what the resulting type/amount/account will be after this update,
    # so we can validate sufficient funds BEFORE committing anything.
    new_type = update_data.get("type", tx.type)
    new_amount = update_data.get("amount", tx.amount)
    new_account_id = tx.account_id  # account_id is not editable per TransactionUpdate schema

    if new_type == TransactionTypeEnum.EXPENSE:
        # Compute current balance, then add back this transaction's OLD effect
        # (since it's still counted in the live total until we commit the change),
        # giving us the true balance available for the NEW amount.
        current_balance = compute_current_balance(db, current_user.id, new_account_id)
        if tx.type == TransactionTypeEnum.EXPENSE:
            current_balance += tx.amount
        elif tx.type == TransactionTypeEnum.INCOME:
            current_balance -= tx.amount

        if new_amount > current_balance:
            raise HTTPException(
                status_code=400,
                detail="Insufficient funds in account",
            )

    for field, value in update_data.items():
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
    tx = db.query(Transaction).filter(
        Transaction.id == transaction_id,
        Transaction.user_id == current_user.id,
    ).first()

    response.status_code = 204
    if not tx:
        return response

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

            # Delete the linked fee transaction, if any — no more date/note
            # guessing, the pair links to it directly now.
            if pair.fee_transaction_id:
                fee_tx = db.query(Transaction).filter(
                    Transaction.id == pair.fee_transaction_id,
                    Transaction.user_id == current_user.id,
                ).first()
                if fee_tx:
                    db.delete(fee_tx)

            db.delete(pair)
            db.flush()
            if other_tx:
                db.delete(other_tx)
            db.flush()

    db.delete(tx)
    db.commit()
    return response