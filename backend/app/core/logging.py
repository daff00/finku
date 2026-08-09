import sys
import time

from loguru import logger
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request


def setup_logging() -> None:
    # remove default loguru handler
    logger.remove()

    # ── Console handler — colored, human readable ─────────────────
    logger.add(
        sys.stderr,
        format=(
            "<green>{time:YYYY-MM-DD HH:mm:ss}</green> | "
            "<level>{level: <8}</level> | "
            "<cyan>{name}</cyan>:<cyan>{line}</cyan> | "
            "<level>{message}</level>"
        ),
        level="INFO",
        colorize=True,
    )

    # ── File handler — rotates daily, keeps 7 days ────────────────
    logger.add(
        "logs/finku.log",
        format=(
            "{time:YYYY-MM-DD HH:mm:ss} | "
            "{level: <8} | "
            "{name}:{line} | "
            "{message}"
        ),
        level="INFO",
        rotation="1 day",
        retention="7 days",
        encoding="utf-8",
    )

    logger.info("✅ Logging initialized")


class LoggingMiddleware(BaseHTTPMiddleware):
    """Logs every incoming request and its response time."""

    async def dispatch(self, request: Request, call_next):
        start_time = time.perf_counter()

        # process request
        response = await call_next(request)

        # calculate response time
        duration_ms = (time.perf_counter() - start_time) * 1000

        # log based on status code
        status_code = response.status_code
        log_line = (
            f"{request.method} {request.url.path} "
            f"→ {status_code} "
            f"({duration_ms:.1f}ms)"
        )

        if status_code >= 500:
            logger.error(log_line)
        elif status_code >= 400:
            logger.warning(log_line)
        else:
            logger.info(log_line)

        return response