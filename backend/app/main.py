from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, status
from fastapi.exceptions import RequestValidationError
from starlette.middleware.cors import CORSMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from pydantic import ValidationError

from app.core.config import settings
from app.core.logging_config import setup_logging, get_logger
from app.db.db_manager import db_manager, create_app_admins
from app.api.v1.auth.endpoints import auth_router
from app.api.v1.user.endpoints import user_router
from app.api.v1.role.endpoints import role_router
from app.api.v1.dramatiq.endpoints import dramatiq_router
from app.core.exception_handlers import (
    http_exception_handler,
    validation_exception_handler,
    rate_limit_handler,
    general_exception_handler,
    pydantic_validation_handler
)

# Setup logging before anything else
setup_logging()
logger = get_logger()

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.debug(f"🚀 Starting app -> {settings.mode} mode")
    await db_manager.connect()
    await create_app_admins()
    yield
    logger.debug(f"🛑 Stopping app...")
    await db_manager.disconnect()


def create_app() -> FastAPI:
    title = settings.app_name
    if settings.mount_point:
        return FastAPI(
            lifespan=lifespan,
            title=title,
            description=settings.main_app_description,
            root_path=f"/{settings.mount_point}",
            openapi_url=f"/openapi.json"
        )
    return FastAPI(title=title, lifespan=lifespan, openapi_url="/openapi.json")


app = create_app()

# Add rate limiter to app state
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

# Register exception handlers
app.add_exception_handler(StarletteHTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(RateLimitExceeded, rate_limit_handler)
app.add_exception_handler(ValidationError, pydantic_validation_handler)
app.add_exception_handler(Exception, general_exception_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

app.include_router(auth_router)
app.include_router(user_router)
app.include_router(role_router)
app.include_router(dramatiq_router)

# Setup Datadog APM tracing
if settings.dd_trace_enabled:
    from ddtrace import tracer, patch_all
    import os

    # Configure Datadog tracer
    os.environ.setdefault('DD_SERVICE', settings.dd_service)
    os.environ.setdefault('DD_ENV', settings.dd_env)
    os.environ.setdefault('DD_AGENT_HOST', settings.dd_agent_host)
    os.environ.setdefault('DD_LOGS_INJECTION', str(settings.dd_logs_injection).lower())

    if settings.dd_profiling_enabled:
        os.environ.setdefault('DD_PROFILING_ENABLED', 'true')

    # Auto-instrument libraries
    patch_all()

    logger.info(f"Datadog APM enabled: service={settings.dd_service}, env={settings.dd_env}")


@app.get("/health")
async def health_check():
    """
    Comprehensive health check endpoint.
    Returns 200 if all services are healthy, 503 otherwise.
    """
    import redis
    import dramatiq

    health_status = {
        "status": "healthy",
        "services": {}
    }
    all_healthy = True

    # Check database
    db_healthy = await db_manager.health_check()
    health_status["services"]["database"] = {
        "status": "healthy" if db_healthy else "unhealthy",
        "type": "mongodb"
    }
    if not db_healthy:
        all_healthy = False

    # Check Redis
    try:
        redis_client = redis.from_url(settings.redis_url, decode_responses=True)
        redis_client.ping()
        health_status["services"]["redis"] = {
            "status": "healthy",
            "type": "redis"
        }
    except Exception as e:
        logger.warning(f"Redis health check failed: {e}")
        health_status["services"]["redis"] = {
            "status": "unhealthy",
            "type": "redis",
            "error": str(e)
        }
        all_healthy = False

    # Check Dramatiq broker
    try:
        broker = dramatiq.get_broker()
        # Simple check that broker exists and is configured
        health_status["services"]["dramatiq"] = {
            "status": "healthy",
            "type": "dramatiq",
            "broker": broker.__class__.__name__
        }
    except Exception as e:
        logger.warning(f"Dramatiq health check failed: {e}")
        health_status["services"]["dramatiq"] = {
            "status": "unhealthy",
            "type": "dramatiq",
            "error": str(e)
        }
        all_healthy = False

    if not all_healthy:
        health_status["status"] = "degraded"
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=health_status
        )

    return health_status


@app.get("/health/ready")
async def readiness_check():
    """
    Readiness probe - checks if the application is ready to accept traffic.
    """
    db_healthy = await db_manager.health_check()
    if not db_healthy:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={"ready": False, "reason": "Database not ready"}
        )
    return {"ready": True}


@app.get("/health/live")
async def liveness_check():
    """
    Liveness probe - simple check that the application is running.
    """
    return {"alive": True}