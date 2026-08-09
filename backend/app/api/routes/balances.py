from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Account, Balance
from app.schemas.schemas import BalanceCreate, BalanceOut

router = APIRouter(prefix="/balances", tags=["balances"])

DbSession = Annotated[Session, Depends(get_db)]


@router.get("/", response_model=list[BalanceOut])
def list_balances(
    db: DbSession,
    account_id: int | None = None,
    limit: int = 100,
    offset: int = 0,
):
    q = db.query(Balance)
    if account_id:
        q = q.filter(Balance.account_id == account_id)
    return (
        q.order_by(Balance.recorded_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

@router.post("/", response_model=BalanceOut, status_code=201)
def create_balance(payload: BalanceCreate, db: DbSession):
    # validate account exists
    account = db.query(Account).filter(
        Account.id == payload.account_id
    ).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")

    balance = Balance(**payload.model_dump())
    db.add(balance)
    db.commit()
    db.refresh(balance)
    return balance

@router.get("/{account_id}/latest", response_model=BalanceOut)
def get_latest_balance(account_id: int, db: DbSession):
    # check account exists first
    account = db.query(Account).filter(
        Account.id == account_id
    ).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")

    balance = (
        db.query(Balance)
        .filter(Balance.account_id == account_id)
        .order_by(Balance.recorded_at.desc())
        .first()
    )
    if not balance:
        raise HTTPException(
            status_code=404,
            detail="No balance snapshot found for this account"
        )
    return balance