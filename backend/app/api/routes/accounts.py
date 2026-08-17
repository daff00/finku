from fastapi import APIRouter, HTTPException, Request, Response

from app.core.dependencies import CurrentUser, DbSession
from app.core.rate_limit import accounts_limit
from app.models.models import Account, Transaction
from app.schemas.schemas import AccountCreate, AccountOut, AccountUpdate

router = APIRouter(prefix="/accounts", tags=["accounts"])


@router.get("", response_model=list[AccountOut])
@accounts_limit
def list_accounts(
    request: Request,
    response: Response,
    current_user: CurrentUser,
    db: DbSession,
    limit: int = 100,
    offset: int = 0,
):
    return (
        db.query(Account)
        .filter(
            Account.user_id == current_user.id,
            Account.is_active.is_(True),
        )
        .order_by(Account.created_at.asc())
        .offset(offset)
        .limit(limit)
        .all()
    )


@router.post("", response_model=AccountOut, status_code=201)
@accounts_limit
def create_account(
    request: Request,
    response: Response,
    payload: AccountCreate,
    current_user: CurrentUser,
    db: DbSession,
):
    if payload.parent_id:
        parent = db.query(Account).filter(
            Account.id == payload.parent_id,
            Account.user_id == current_user.id,  # ← must belong to same user
        ).first()
        if not parent:
            raise HTTPException(status_code=404, detail="Parent account not found")

    account = Account(
        user_id=current_user.id,  # ← set user_id
        **payload.model_dump()
    )
    db.add(account)
    db.commit()
    db.refresh(account)
    return account


@router.get("/{account_id}", response_model=AccountOut)
@accounts_limit
def get_account(
    account_id: int,
    request: Request,
    response: Response,
    current_user: CurrentUser,
    db: DbSession,
):
    account = db.query(Account).filter(
        Account.id == account_id,
        Account.user_id == current_user.id,  # ← filter by user
    ).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    return account


@router.get("/{account_id}/transactions")
@accounts_limit
def get_account_transactions(
    account_id: int,
    request: Request,
    response: Response,
    current_user: CurrentUser,
    db: DbSession,
    limit: int = 50,
    offset: int = 0,
):
    account = db.query(Account).filter(
        Account.id == account_id,
        Account.user_id == current_user.id,
    ).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")

    return (
        db.query(Transaction)
        .filter(
            Transaction.account_id == account_id,
            Transaction.user_id == current_user.id,
        )
        .order_by(Transaction.date.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )


@router.patch("/{account_id}", response_model=AccountOut)
@accounts_limit
def update_account(
    account_id: int,
    request: Request,
    response: Response,
    payload: AccountUpdate,
    current_user: CurrentUser,
    db: DbSession,
):
    account = db.query(Account).filter(
        Account.id == account_id,
        Account.user_id == current_user.id,
    ).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")

    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(account, field, value)
    db.commit()
    db.refresh(account)
    return account


@router.delete("/{account_id}", status_code=204)
@accounts_limit
def delete_account(
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

    has_transactions = db.query(Transaction).filter(
        Transaction.account_id == account_id,
        Transaction.user_id == current_user.id,
    ).first()
    if has_transactions:
        raise HTTPException(
            status_code=409,
            detail="Cannot delete account with existing transactions"
        )

    account.is_active = False
    db.commit()
