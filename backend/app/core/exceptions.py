from loguru import logger
from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse


def register_exception_handlers(app: FastAPI):

    @app.exception_handler(HTTPException)
    async def http_exception_handler(request: Request, exc: HTTPException):
        if exc.status_code >= 500:
            logger.error(
                f"HTTP {exc.status_code} | "
                f"{request.method} {request.url.path} | "
                f"{exc.detail}"
            )
        else:
            logger.warning(
                f"HTTP {exc.status_code} | "
                f"{request.method} {request.url.path} | "
                f"{exc.detail}"
            )
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "error": exc.detail,
                "status_code": exc.status_code,
            },
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(
        request: Request, exc: RequestValidationError
    ):
        details = [
            f"{' -> '.join(str(l) for l in err['loc'])}: {err['msg']}"
            for err in exc.errors()
        ]
        logger.warning(
            f"Validation error | "
            f"{request.method} {request.url.path} | "
            f"{details}"
        )
        return JSONResponse(
            status_code=422,
            content={
                "error": "Validation error",
                "status_code": 422,
                "details": details,
            },
        )

    @app.exception_handler(Exception)
    async def generic_exception_handler(request: Request, exc: Exception):
        logger.exception(
            f"Unhandled exception | "
            f"{request.method} {request.url.path} | "
            f"{str(exc)}"
        )
        return JSONResponse(
            status_code=500,
            content={
                "error": "Internal server error — please try again later",
                "status_code": 500,
            },
        )