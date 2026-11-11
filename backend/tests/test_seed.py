import pytest

import seed


def test_seed_refuses_production_environment_before_writing(
    monkeypatch, capsys
):
    monkeypatch.setenv("ENVIRONMENT", "production")

    with pytest.raises(SystemExit) as exc_info:
        seed.seed()

    assert exc_info.value.code == 1
    assert "must not be run in production" in capsys.readouterr().out
