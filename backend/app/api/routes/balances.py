from fastapi import APIRouter, HTTPException

from app.core.dependencies import CurrentUser, DbSession
from app.models.models import Account, Balance
from app.schemas.schemas import BalanceCreate, BalanceOut

router = APIRouter(prefix="/balances", tags=["balances"])


@router.get("/", response_model=list[BalanceOut])
def list_balances(
    current_user: CurrentUser,
    db: DbSession,
    account_id: int | None = None,
    limit: int = 100,
    offset: int = 0,
):
    q = db.query(Balance).filter(
        Balance.user_id == current_user.id
    )
    if account_id:
        q = q.filter(Balance.account_id == account_id)
    return (
        q.order_by(Balance.recorded_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )


@router.post("/", response_model=BalanceOut, status_code=201)
def create_balance(
    payload: BalanceCreate,
    current_user: CurrentUser,
    db: DbSession,
):
    account = db.query(Account).filter(
        Account.id == payload.account_id,
        Account.user_id == current_user.id,
    ).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")

    balance = Balance(
        user_id=current_user.id,
        **payload.model_dump()
    )
    db.add(balance)
    db.commit()
    db.refresh(balance)
    return balance


@router.get("/{account_id}/latest", response_model=BalanceOut)
def get_latest_balance(
    account_id: int,
    current_user: CurrentUser,
    db: DbSession,
):
    account = db.query(Account).filter(
        Account.id == account_id,
        Account.user_id == current_user.id,
    ).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")

    balance = (
        db.query(Balance)
        .filter(
            Balance.account_id == account_id,
            Balance.user_id == current_user.id,
        )
        .order_by(Balance.recorded_at.desc())
        .first()
    )
    if not balance:
        raise HTTPException(
            status_code=404,
            detail="No balance snapshot found for this account"
        )
    return balance