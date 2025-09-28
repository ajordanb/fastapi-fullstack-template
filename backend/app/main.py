from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, status
from loguru import logger
from starlette.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.db.db_manager import db_manager, create_app_admins
from app.api.v1.auth.endpoints import auth_router
from app.api.v1.user.endpoints import user_router
from app.api.v1.role.endpoints import role_router
from app.api.v1.dramatiq.endpoints import dramatiq_router

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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(user_router)
app.include_router(role_router)
app.include_router(dramatiq_router)


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    db_healthy = await db_manager.health_check()
    if not db_healthy:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database is unhealthy"
        )
    return {"status": "healthy", "database": "connected"}