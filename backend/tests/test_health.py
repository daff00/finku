from sqlalchemy.exc import OperationalError


def test_health_check_reports_database_connected(client):
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "healthy", "database": "connected"}


def test_health_check_reports_database_disconnected(client, db, monkeypatch):
    def fail_query(statement):
        raise OperationalError("SELECT 1", {}, Exception("database unavailable"))

    monkeypatch.setattr(db, "execute", fail_query)

    response = client.get("/health")

    assert response.status_code == 503
    assert response.json() == {"status": "unhealthy", "database": "disconnected"}
