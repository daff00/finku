from fastapi import APIRouter

router = APIRouter(prefix="/accounts", tags=["accounts"])

@router.get("/")
def list_accounts():
    return {"message": "accounts route working"}