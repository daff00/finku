from fastapi import APIRouter, HTTPException, Request, Response

from app.core.dependencies import CurrentUser, DbSession
from app.core.rate_limit import balances_limit
from app.models.models import Account, Balance
from app.schemas.schemas import BalanceCreate, BalanceOut

router = APIRouter(prefix="/balances", tags=["balances"])


@router.get("/", response_model=list[BalanceOut])
@balances_limit
def list_balances(
    request: Request,
    response: Response,
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
@balances_limit
def create_balance(
    request: Request,
    response: Response,
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

    if payload.amount < 0:
        raise HTTPException(
            status_code=400,
            detail="Balance amount cannot be negative",
        )

    balance = Balance(
        user_id=current_user.id,
        **payload.model_dump()
    )
    db.add(balance)
    db.commit()
    db.refresh(balance)
    return balance


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
