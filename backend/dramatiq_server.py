"""
Standalone server for Dramatiq monitoring endpoints.
This can be run alongside the dramatiq worker to provide HTTP access to job monitoring.
"""
import asyncio
import uvicorn
from contextlib import asynccontextmanager
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.db.db_manager import db_manager
from app.api.v1.dramatiq.endpoints import dramatiq_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle manager for the Dramatiq monitoring server"""
    await db_manager.connect()
    yield
    await db_manager.disconnect()


def create_dramatiq_app() -> FastAPI:
    """Create a minimal FastAPI app with only Dramatiq monitoring endpoints"""
    app = FastAPI(
        title="Dramatiq Monitoring Server",
        description="HTTP API for monitoring Dramatiq jobs and queues",
        lifespan=lifespan,
        openapi_url="/openapi.json"
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Only include the dramatiq router
    app.include_router(dramatiq_router)

    @app.get("/health")
    async def health_check():
        """Health check for the Dramatiq monitoring server"""
        return {"status": "healthy", "service": "dramatiq_monitoring"}

    return app


app = create_dramatiq_app()


if __name__ == "__main__":
    uvicorn.run(
        "dramatiq_server:app",
        host="0.0.0.0",
        port=5152,  # Different port from main app
        reload=False
    )