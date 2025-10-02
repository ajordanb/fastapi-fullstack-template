"""
Global exception handlers for consistent error responses
"""
from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from loguru import logger
from slowapi.errors import RateLimitExceeded
from pydantic import ValidationError


async def http_exception_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
    """Handle HTTP exceptions with consistent formatting"""
    logger.warning(
        f"HTTP {exc.status_code} error on {request.method} {request.url.path}: {exc.detail}",
        extra={"status_code": exc.status_code, "path": request.url.path}
    )

    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": exc.status_code,
                "message": exc.detail,
                "path": str(request.url.path)
            }
        },
        headers=exc.headers,
    )


async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    """Handle validation errors with detailed field information"""
    errors = []
    for error in exc.errors():
        errors.append({
            "field": ".".join(str(loc) for loc in error["loc"]),
            "message": error["msg"],
            "type": error["type"]
        })

    logger.warning(
        f"Validation error on {request.method} {request.url.path}: {errors}",
        extra={"path": request.url.path, "errors": errors}
    )

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": {
                "code": 422,
                "message": "Validation error",
                "path": str(request.url.path),
                "details": errors
            }
        },
    )


async def rate_limit_handler(request: Request, exc: RateLimitExceeded) -> JSONResponse:
    """Handle rate limit exceeded errors"""
    logger.warning(
        f"Rate limit exceeded on {request.method} {request.url.path}",
        extra={"path": request.url.path, "client": request.client.host if request.client else None}
    )

    return JSONResponse(
        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
        content={
            "error": {
                "code": 429,
                "message": "Rate limit exceeded. Please try again later.",
                "path": str(request.url.path)
            }
        },
        headers={"Retry-After": "60"}  # Suggest retry after 60 seconds
    )


async def general_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Handle all uncaught exceptions"""
    logger.error(
        f"Unhandled exception on {request.method} {request.url.path}: {exc}",
        exc_info=exc,
        extra={"path": request.url.path}
    )

    # Don't expose internal error details in production
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": {
                "code": 500,
                "message": "Internal server error. Please contact support if the issue persists.",
                "path": str(request.url.path)
            }
        },
    )


async def pydantic_validation_handler(request: Request, exc: ValidationError) -> JSONResponse:
    """Handle Pydantic validation errors"""
    errors = []
    for error in exc.errors():
        errors.append({
            "field": ".".join(str(loc) for loc in error["loc"]),
            "message": error["msg"],
            "type": error["type"]
        })

    logger.warning(
        f"Pydantic validation error on {request.method} {request.url.path}: {errors}",
        extra={"path": request.url.path, "errors": errors}
    )

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": {
                "code": 422,
                "message": "Data validation error",
                "path": str(request.url.path),
                "details": errors
            }
        },
    )
