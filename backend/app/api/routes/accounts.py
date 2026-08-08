from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.models import Account, Transaction
from app.schemas.schemas import AccountCreate, AccountOut, AccountUpdate

router = APIRouter(prefix="/accounts", tags=["accounts"])

DbSession = Annotated[Session, Depends(get_db)]


@router.get("/", response_model=list[AccountOut])
def list_accounts(
    db: DbSession,
    limit: int = 100,
    offset: int = 0,
):
    return (
        db.query(Account)
        .filter(Account.is_active.is_(True))
        .order_by(Account.created_at.asc())
        .offset(offset)
        .limit(limit)
        .all()
    )


@router.post("/", response_model=AccountOut, status_code=201)
def create_account(payload: AccountCreate, db: DbSession):
    if payload.parent_id:
        parent = db.query(Account).filter(
            Account.id == payload.parent_id
        ).first()
        if not parent:
            raise HTTPException(
                status_code=404,
                detail="Parent account not found"
            )
    account = Account(**payload.model_dump())
    db.add(account)
    db.commit()
    db.refresh(account)
    return account


@router.get("/{account_id}", response_model=AccountOut)
def get_account(account_id: int, db: DbSession):
    account = (
        db.query(Account)
        .filter(Account.id == account_id)
        .first()
    )
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    return account


@router.get("/{account_id}/transactions")
def get_account_transactions(
    account_id: int,
    db: DbSession,
    limit: int = 50,
    offset: int = 0,
):
    account = db.query(Account).filter(Account.id == account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    return (
        db.query(Transaction)
        .filter(Transaction.account_id == account_id)
        .order_by(Transaction.date.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )


@router.patch("/{account_id}", response_model=AccountOut)
def update_account(
    account_id: int, payload: AccountUpdate, db: DbSession
):
    account = (
        db.query(Account)
        .filter(Account.id == account_id)
        .first()
    )
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(account, field, value)
    db.commit()
    db.refresh(account)
    return account


@router.delete("/{account_id}", status_code=204)
def delete_account(account_id: int, db: DbSession):
    account = (
        db.query(Account)
        .filter(Account.id == account_id)
        .first()
    )
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")

    # check if account has transactions before deleting
    has_transactions = (
        db.query(Transaction)
        .filter(Transaction.account_id == account_id)
        .first()
    )
    if has_transactions:
        raise HTTPException(
            status_code=409,
            detail="Cannot delete account with existing transactions"
        )

    account.is_active = False
    db.commit()