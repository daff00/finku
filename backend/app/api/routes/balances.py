from fastapi import APIRouter

router = APIRouter(prefix="/balances", tags=["balances"])

@router.get("/")
def list_balances():
    return {"message": "balances route working"}