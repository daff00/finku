import calendar
import hashlib
from datetime import date

from fastapi import APIRouter, HTTPException, Query, Request, Response

from app.core.dependencies import CurrentUser, DbSession
from app.core.rate_limit import transactions_limit
from app.models.models import (
    Account,
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

    from_tx = Transaction(
        user_id=current_user.id,
        account_id=payload.from_account_id,
        date=payload.date,
        amount=payload.amount,
        type=TransactionTypeEnum.TRANSFER,
        category=CategoryEnum.TRANSFER,
        note=payload.note or f"Transfer to {to_account.name}",
        ref_id=make_ref_id(
            payload.from_account_id, payload.date, payload.amount, "OUT"
        ),
    )
    to_tx = Transaction(
        user_id=current_user.id,
        account_id=payload.to_account_id,
        date=payload.date,
        amount=payload.amount,
        type=TransactionTypeEnum.TRANSFER,
        category=CategoryEnum.TRANSFER,
        note=payload.note or f"Transfer from {from_account.name}",
        ref_id=make_ref_id(
            payload.to_account_id, payload.date, payload.amount, "IN"
        ),
    )

    db.add_all([from_tx, to_tx])
    db.flush()

    pair = TransferPair(
        from_transaction_id=from_tx.id,
        to_transaction_id=to_tx.id,
    )
    db.add(pair)

    # ── BI-FAST fee transaction ───────────────────────────────────
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
                payload.from_account_id, payload.date, payload.fee, "FEE"
            ),
        )
        db.add(fee_tx)

    db.commit()
    db.refresh(from_tx)
    db.refresh(to_tx)
    return [from_tx, to_tx]


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
        **payload.model_dump()
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
    tx = db.query(Transaction).filter(
        Transaction.id == transaction_id,
        Transaction.user_id == current_user.id,
    ).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")

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
