from fastapi import APIRouter

router = APIRouter(prefix="/import", tags=["import"])

@router.get("/")
def get_import():
    return {"message": "import route working"}