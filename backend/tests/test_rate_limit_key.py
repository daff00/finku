from starlette.requests import Request

from app.core.rate_limit import get_rate_limit_key


def test_ip_rate_limit_key_uses_request_client_address():
    """SlowAPI keys IP-limited requests from client.host, set by Uvicorn's proxy headers."""
    request = Request(
        {
            "type": "http",
            "asgi": {"version": "3.0"},
            "http_version": "1.1",
            "method": "GET",
            "scheme": "http",
            "path": "/api/v1/accounts",
            "raw_path": b"/api/v1/accounts",
            "query_string": b"",
            "headers": [],
            "client": ("203.0.113.24", 43120),
            "server": ("backend", 8000),
        }
    )

    assert get_rate_limit_key(request) == "ip:203.0.113.24"
