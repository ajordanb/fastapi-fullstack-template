from contextlib import asynccontextmanager

from fastapi import FastAPI
from loguru import logger
from starlette.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.db.db_manager import DBManager, create_app_admins
from app.api.v1.auth.endpoints import auth_router
from app.api.v1.user.endpoints import user_router
from app.api.v1.role.endpoints import role_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.debug(f"🚀 Starting app -> {settings.mode} mode")
    db = DBManager()
    await db.init_db()
    await create_app_admins()
    yield
    logger.debug(f"🛑 Stopping app...")
    await db.close()


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