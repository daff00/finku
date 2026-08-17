from fastapi import APIRouter, File, Form, HTTPException, Request, Response, UploadFile

from app.core.dependencies import CurrentUser, DbSession
from app.core.rate_limit import imports_limit
from app.models.models import Account, BankEnum
from app.parsers.registry import get_parser_for_bank, is_bank_supported
from app.schemas.schemas import ImportResultOut

router = APIRouter(prefix="/import", tags=["import"])


@router.post("/", response_model=ImportResultOut, status_code=201)
@imports_limit
def import_statement(
    request: Request,
    response: Response,
    current_user: CurrentUser,
    db: DbSession,
    account_id: int = Form(...),
    bank: BankEnum = Form(...),
    file: UploadFile = File(...),
):
    account = db.query(Account).filter(
        Account.id == account_id,
        Account.user_id == current_user.id,
    ).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")

    if account.bank != bank:
        raise HTTPException(
            status_code=400,
            detail="Selected bank does not match the target account",
        )

    if not is_bank_supported(bank):
        raise HTTPException(
            status_code=400,
            detail=f"{bank.value} statement import is not supported yet",
        )

    parser = get_parser_for_bank(bank)

    try:
        file_bytes = file.file.read()
        parsed = parser.parse(file_bytes)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=400,
            detail="Unable to parse statement with the selected bank parser",
        ) from exc
    finally:
        file.file.close()

    if not parsed:
        raise HTTPException(
            status_code=400,
            detail="No transactions could be parsed from the uploaded statement",
        )

    result = parser.save_to_db(parsed, account.id, current_user.id, db)
    return ImportResultOut.model_validate(result)
