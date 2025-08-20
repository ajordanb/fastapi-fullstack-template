from typing import List
from fastapi import HTTPException
from starlette import status
from app.core.security.api import verify_password, get_hashed_password
from app.models.auth.model import Token
from app.models.role.model import Role
from app.models.user.model import UserAuth, User, UserBase, UserOut
from app.models.util.model import Message
from app.services.email.email import EmailService


class UserService:
    def __init__(self,
                 email_service: EmailService,
                 ):
        self.email_service = email_service

    async def get_all_users(self, skip: int = 0, limit: int = 1000) -> List[UserOut]:
        response: List[UserOut] = []
        users = await User.all_users(skip,limit)
        for user in users:
            user_roles = await user.user_roles()
            response.append(UserOut(**user.model_dump(exclude={'roles'}), roles=user_roles))
        return response

    async def get_user_by_id(self, user_id: str):
        user = await User.by_id(user_id)
        return user

    async def get_user_by_email(self, email: str) -> User:
        user = await User.by_email(email)
        return user

    async def create_user(self, user_register: UserAuth):
        if _ := await self.get_user_by_email(user_register.email):
            raise HTTPException(
                status_code=400,
                detail="User already exists",
            )
        for role in user_register.roles:
            if not (_ := await Role.by_id(role)):
                raise HTTPException(
                    status_code=404,
                    detail=f"Role with id {role} does not exist",
                )
        hashed_password = get_hashed_password(user_register.password)
        user_register.password = hashed_password
        new_user = User(**user_register.model_dump())
        await User.insert(new_user)
        return new_user

    async def update_user(self, user_update: UserBase) -> UserBase:
        user = await self.get_user_by_id(user_update.id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        await user.update(user_update.model_dump(exclude_unset=True))
        return user

    async def delete_user(self):
        pass

    async def update_user_password(self):
        pass

    async def current_user(self, token: Token):
        user = await self.get_user_by_email(token.sub)
        if token.client_id:
            api_key = user.get_api_key(token.client_id)
            if not api_key.active:
                raise HTTPException(401, "API key disabled")
            user._using_api_key = True
            user._api_key = api_key
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Could not find user",
            )
        return user


class SelfUserService:
    def __init__(self, me: User):
        self.me: User = me

    async def my_profile(self) -> UserBase:
        return self.me

    async def update_my_password(self, old_password: str, new_password: str) -> Message:
        if not verify_password(new_password, self.me.hashed_password):
            raise HTTPException(status_code=400, detail="Incorrect password")
        if new_password == old_password:
            raise HTTPException(
                status_code=400, detail="New password cannot be the same as the current one"
            )
        hashed_password = get_hashed_password(new_password)
        self.me.password = hashed_password
        await self.me.save()
        return Message(message="Password updated successfully")

    async def update_my_user(self, user_update: UserBase) -> User:
        await self.me.update(user_update.model_dump(exclude_unset=True))
        return self.me

    async def delete_my_user(self):
        await self.me.delete()
        return Message(message="Password updated successfully")

