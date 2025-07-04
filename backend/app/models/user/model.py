from datetime import datetime, UTC
from typing import List, Self, Optional, Tuple
from beanie import PydanticObjectId, Document
from fastapi import HTTPException
from pydantic import BaseModel
from pymongo import IndexModel

from app.models.role.model import RoleBase, Role



class Activity(BaseModel):
    payload: dict = {}
    activity_date: datetime = datetime.now(UTC)


class LoginActivity(Activity):
    pass

class Access(BaseModel):
    scopes: List[str] = []
    active: Optional[bool] = True


class APIKey(Access):
    client_id: str
    hashed_client_secret: str


class PSK(Access):
    psk: str


class CreateAPIKey(APIKey):
    hashed_client_secret: str


class UpdateAPIKey(APIKey):
    pass


class UserBase(BaseModel):
    """User Base Model"""
    username: Optional[str] = None
    email: str
    name: str = ""
    source: str = ""
    email_confirmed: bool = False
    is_active: bool = True
    password_reset_code: str | None = None
    api_keys: List[APIKey] = []
    roles: List[PydanticObjectId] = [] # This is a list of Role IDs
    last_login_activity: Optional[LoginActivity] = None

    # These properties are not serialized.
    _using_api_key: str | None = None
    """True when the current user has been authenticated via an API key instead of OAuth2. Not stored in DB."""
    _api_key: APIKey | None = None
    """If using_api_key is True, a valid reference to the API key that the user authenticated with."""

    def get_api_key(self, client_id: str) -> APIKey:
        api_key = [x for x in self.api_keys if x.client_id == client_id]
        if len(api_key) == 0:
            raise ValueError(f"API key {api_key} not found for user {self.name}")
        return api_key[0]


class UserAuth(UserBase):
    password: str


class UserOut(UserBase):
    """User out model"""
    id: PydanticObjectId = None
    roles: List[RoleBase]



class UpdatePassword(BaseModel):
    """Update user password"""
    current_password: str
    new_password: str


class User(Document, UserAuth):
    class Settings:
        name = "User"
        indexes = [
            IndexModel("email", unique=True),
            IndexModel("api_keys")
        ]

    def __repr__(self) -> str:
        return f"<User {self.email}>"

    def __str__(self) -> str:
        return self.email

    def __hash__(self) -> int:
        return hash(self.email)

    def __eq__(self, other: object) -> bool:
        if isinstance(other, User):
            return self.email == other.email
        return False

    @property
    def created(self) -> datetime:
        """Datetime user was created from ID"""
        return self.id.generation_time

    @classmethod
    async def all_users(cls, skip: int = 0, limit: int = 100) -> List[Self]:
        """Get all users"""
        return await cls.find().skip(skip).limit(limit).to_list()

    @classmethod
    async def by_username(cls, _username: str) -> Self:
        """Get a user by email"""
        return await cls.find_one({"username": _username})

    @classmethod
    async def by_email(cls, _email: str) -> Self:
        """Get a user by email"""
        return await cls.find_one({"email": _email})

    @classmethod
    async def by_id(cls, _id: PydanticObjectId | str) -> Self:
        """Get a user by id"""
        if isinstance(_id, PydanticObjectId):
            _id = str(_id)
        return await cls.get(_id)

    @classmethod
    async def by_client_id(cls, client_id: str, raise_on_zero=True) -> Self:
        results = await cls.find({"api_keys.client_id": client_id}).to_list()
        if len(results) == 0:
            if raise_on_zero:
                raise HTTPException(status_code=401, detail="Invalid API Key: No matching user found.")
            return None
        if len(results) >= 2:
            raise HTTPException(status_code=401, detail="Invalid API Key: More than one matching user.")
        return results[0]

    @classmethod
    async def has_role(cls, role_id: PydanticObjectId | str ) -> List[Self]:
        if isinstance(role_id, str):
            role_id = PydanticObjectId(role_id)
        results = await cls.find({"roles": role_id}).to_list()
        return results

    async def user_roles(self) -> List[RoleBase]:
        """Get all user roles, by their ids"""
        roles = await Role.find({"_id": {"$in": self.roles}}).to_list()
        return roles

    async def get_user_scopes_and_roles(self) -> Tuple[List[str], List[str]]:
        user_roles = await self.user_roles()
        user_role_names: List = [role.name for role in user_roles]
        scopes: List = [f"{role.name}:{scope}" for role in user_roles for scope in role.scopes]
        return scopes, user_role_names

    def log_login(self, payload: dict):
        self.last_login_activity = LoginActivity(
            activity_date=datetime.now(UTC),
            payload=payload,
        )
