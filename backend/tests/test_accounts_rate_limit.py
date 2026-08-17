from app.core.auth_utils import create_access_token, hash_password
from app.core.config import settings
from app.models.models import User


def _parse_rate_limit(limit_value: str) -> int:
    amount, _window = limit_value.split("/", 1)
    return int(amount)


def test_accounts_rate_limit_allows_requests_below_threshold(client):
    limit = _parse_rate_limit(settings.ACCOUNTS_RATE_LIMIT)

    for _ in range(limit - 1):
        response = client.get("/api/v1/accounts")
        assert response.status_code == 200


def test_accounts_rate_limit_blocks_after_threshold(client):
    limit = _parse_rate_limit(settings.ACCOUNTS_RATE_LIMIT)

    for _ in range(limit):
        response = client.get("/api/v1/accounts")
        assert response.status_code == 200

    response = client.get("/api/v1/accounts")
    assert response.status_code == 429
    assert response.json()["status_code"] == 429
    assert response.json()["error"] == "Too many requests"


def test_accounts_rate_limit_is_scoped_per_user(client, db):
    limit = _parse_rate_limit(settings.ACCOUNTS_RATE_LIMIT)

    for _ in range(limit):
        response = client.get("/api/v1/accounts")
        assert response.status_code == 200

    second_user = User(
        username="seconduser",
        password_hash=hash_password("password"),
        display_name="Second User",
        is_active=True,
    )
    db.add(second_user)
    db.commit()
    db.refresh(second_user)

    second_token = create_access_token({"sub": second_user.username})
    response = client.get(
        "/api/v1/accounts",
        headers={"Authorization": f"Bearer {second_token}"},
    )

    assert response.status_code == 200
