

import motor.motor_asyncio
from beanie import Document, init_beanie
from loguru import logger

from app.routes.auth.api import password_context
from app.config import settings
from motor.motor_asyncio import AsyncIOMotorClient

from app.routes.role.model import Role, RoleOut
from app.routes.user.model import User


class DBManager:
    _client: AsyncIOMotorClient

    def __init__(self):
        pass

    async def init_db(self, client=None):
        """Initialize the database."""
        if client is None:
            if settings.db_conn_str.startswith("mongodb://localhost"):
                client = motor.motor_asyncio.AsyncIOMotorClient(settings.db_conn_str)
            else:
                client = motor.motor_asyncio.AsyncIOMotorClient(
                    settings.db_conn_str, authmechanism="DEFAULT"
                )

        collections = Document.__subclasses__()
        await init_beanie(database=client[settings.db_name], document_models=collections)
        self._client = client

    async def close(self):
        """Close the MongoDB connection."""
        if hasattr(self, '_client') and self._client is not None:
            self._client.close()


async def wipe():
    collections = Document.__subclasses__()
    await asyncio.gather(*[model.delete_all() for model in collections])

async def create_app_admins():
    admins = settings.default_admin_users
    await create_admin_role()
    admin_role = await Role.by_name("admin")
    for admin in admins:
        user = await User.by_email(admin)
        if user is None:
            pw = password_context.hash(settings.user_default_password)
            admin_user = User(
                email=admin,
                roles=[admin_role.id],
                source="basic",
                email_confirmed= True,
                password=pw,
            )
            await admin_user.create()
            logger.info(f"Created user {admin}")

async def create_admin_role():
    role = await Role.by_name("admin")
    if role is None:
        admin_role = Role(
            name="admin",
            description="Admin role",
            created_by="system",
            scopes=["admin"]
        )
        await admin_role.create()
        logger.info(f"Created admin role: {admin_role}")


if __name__ == "__main__":
    db = DBManager()
    asyncio.run(db.init_db())
