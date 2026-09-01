import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from datetime import datetime

from app.core.auth_utils import create_access_token, hash_password
from app.core.database import Base, get_db
from app.models.models import User
from app.main import app

# ── Test Database Setup ───────────────────────────────────────────────────────

# separate test database — never touches finku.db
SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///./test.db"

test_engine = create_engine(
    SQLALCHEMY_TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
)

TestSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=test_engine,
)


# ── Fixtures ──────────────────────────────────────────────────────────────────

@pytest.fixture(scope="function")
def db():
    """
    Creates a fresh database for each test.
    Drops all tables after test finishes.
    """
    # create all tables
    Base.metadata.create_all(bind=test_engine)

    session = TestSessionLocal()
    try:
        test_user = User(
            username="testuser",
            password_hash=hash_password("password"),
            display_name="Test User",
            is_active=True,
        )
        session.add(test_user)
        session.commit()
        session.refresh(test_user)
        yield session
    finally:
        session.close()
        # wipe database after each test
        Base.metadata.drop_all(bind=test_engine)


@pytest.fixture(scope="function")
def client(db):
    """
    Creates a FastAPI test client with the test DB injected.
    Overrides the real get_db dependency with test DB.
    """
    def override_get_db():
        try:
            yield db
        finally:
            pass

    test_user = db.query(User).filter(User.username == "testuser").first()
    token = create_access_token({"sub": test_user.username})

    # swap real DB → test DB
    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as test_client:
        test_client.headers.update({"Authorization": f"Bearer {token}"})
        yield test_client

    # clean up override after test
    limiter = getattr(app.state, "limiter", None)
    if limiter is not None and hasattr(limiter, "reset"):
        limiter.reset()
    app.dependency_overrides.clear()


# ── Reusable Sample Data Fixtures ─────────────────────────────────────────────

@pytest.fixture
def sample_account(client):
    """Creates a BCA account and returns the response data."""
    response = client.post(
        "/api/v1/accounts",
        json={
            "name": "BCA Main",
            "bank": "BCA",
            "type": "SAVINGS",
            "color": "#0066AE",
            "currency": "IDR",
        },
    )
    return response.json()


@pytest.fixture
def sample_jago_account(client):
    """Creates a Jago pocket account and returns the response data."""
    response = client.post(
        "/api/v1/accounts",
        json={
            "name": "Jago Main",
            "bank": "JAGO",
            "type": "POCKET",
            "color": "#00B14F",
            "currency": "IDR",
        },
    )
    return response.json()


@pytest.fixture
def sample_transaction(client, sample_account):
    now = datetime.now()
    response = client.post(
        "/api/v1/transactions",
        json={
            "account_id": sample_account["id"],
            "date": f"{now.year}-{now.month:02d}-25",
            "amount": "12500000",
            "type": "INCOME",
            "category": "SALARY",
            "note": "Gaji bulan Juli",
        },
    )
    return response.json()


@pytest.fixture
def sample_expense(client, sample_account):
    now = datetime.now()
    response = client.post(
        "/api/v1/transactions",
        json={
            "account_id": sample_account["id"],
            "date": f"{now.year}-{now.month:02d}-28",
            "amount": "48000",
            "type": "EXPENSE",
            "category": "FOOD",
            "note": "Grab Food",
        },
    )
    return response.json()


@pytest.fixture
def sample_balance(client, sample_account):
    """Creates a balance snapshot and returns the response data."""
    response = client.post(
        "/api/v1/balances",
        json={
            "account_id": sample_account["id"],
            "amount": "32100000",
        },
    )
    return response.json()


@pytest.fixture
def sample_transfer(client, sample_account, sample_jago_account):
    """Creates a funded transfer between BCA and Jago."""
    client.post(
        "/api/v1/balances",
        json={
            "account_id": sample_account["id"],
            "amount": "10000000",
        },
    )
    response = client.post(
        "/api/v1/transactions/transfer",
        json={
            "from_account_id": sample_account["id"],
            "to_account_id": sample_jago_account["id"],
            "date": "2026-07-02",
            "amount": "5000000",
            "note": "Transfer to Jago",
        },
    )
    return response.json()
