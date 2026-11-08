from fastapi import APIRouter, Depends, Header, HTTPException, Request, Response, status
from fastapi.security import OAuth2PasswordRequestForm

from app.core.auth_utils import create_access_token, hash_password, verify_password
from app.core.config import settings
from app.core.dependencies import CurrentUser, DbSession
from app.core.rate_limit import limiter
from app.models.models import User
from app.schemas.schemas import (
    PasswordChange,
    ProfileUpdate,
    TokenOut,
    UserCreate,
    UserOut,
)

router = APIRouter(prefix="/auth", tags=["auth"])

auth_limit = limiter.shared_limit("10/hour", scope="auth")


@router.post("/register", response_model=UserOut, status_code=201)
@auth_limit
def register(
    request: Request,
    response: Response,
    payload: UserCreate,
    db: DbSession,
    x_admin_key: str | None = Header(default=None, alias="X-Admin-Key"),
):
    """
    Create a new user.
    Behavior depends on settings.REGISTRATION_MODE:
      - "admin_only": requires X-Admin-Key matching ADMIN_SECRET_KEY
      - "public": open signup, no admin key required
    """
    if (
        settings.REGISTRATION_MODE == "admin_only"
        and x_admin_key != settings.ADMIN_SECRET_KEY
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden — invalid admin key",
        )

    existing = db.query(User).filter(
        User.username == payload.username
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username already taken",
        )

    user = User(
        username=payload.username,
        password_hash=hash_password(payload.password),
        display_name=payload.display_name,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=TokenOut)
def login(
    db: DbSession,
    form: OAuth2PasswordRequestForm = Depends(),
):
    """
    Login with username + password.
    Returns JWT access token.
    Accepts form-data (required by OAuth2 standard).
    """
    # 1. find user by username
    user = db.query(User).filter(
        User.username == form.username
    ).first()

    # 2. verify user exists and password is correct
    if not user or not verify_password(form.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 3. check user is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive",
        )

    # 4. create and return JWT token
    token = create_access_token({"sub": user.username})
    return TokenOut(access_token=token)


@router.post("/logout")
def logout(current_user: CurrentUser):
    """
    Logout endpoint.
    JWT is stateless so we just return success.
    Token invalidation can be added later with a blocklist.
    """
    return {"message": f"Successfully logged out — goodbye {current_user.display_name}!"}


@router.post("/refresh", response_model=TokenOut)
def refresh(current_user: CurrentUser):
    """
    Refresh JWT token.
    Requires valid existing token.
    Returns a new token with fresh expiry.
    """
    token = create_access_token({"sub": current_user.username})
    return TokenOut(access_token=token)


@router.get("/me", response_model=UserOut)
def get_me(current_user: CurrentUser):
    """
    Returns the currently authenticated user's info.
    Useful for frontend to know who is logged in.
    """
    return current_user

@router.patch("/me", response_model=UserOut)
def update_profile(
    payload: ProfileUpdate,
    current_user: CurrentUser,
    db: DbSession,
):
    """
    Update the current user's display name.
    Username is intentionally NOT editable — it's the fixed login identifier.
    """
    current_user.display_name = payload.display_name
    db.commit()
    db.refresh(current_user)
    return current_user


@router.post("/change-password")
@auth_limit
def change_password(
    request: Request,
    response: Response,
    payload: PasswordChange,
    current_user: CurrentUser,
    db: DbSession,
):
    """
    Change the current user's password.
    Requires the correct current password before allowing the change.
    """
    if not verify_password(payload.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Current password is incorrect",
        )

    if payload.new_password == payload.current_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be different from current password",
        )

    current_user.password_hash = hash_password(payload.new_password)
    db.commit()

    return {"message": "Password changed successfully"}