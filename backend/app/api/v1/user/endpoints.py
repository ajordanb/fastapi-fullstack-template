import os
from typing import List

import loguru
from fastapi import APIRouter, Depends, HTTPException, Body, Form, Request

from app.api.v1.user.helpers import generate_email
from app.core.config import settings
from app.email_client import send_email
from app.models.magic_link.model import MagicType, MagicLink
from app.models.role.model import Role
from app.models.user.model import UserAuth, UpdatePassword, UserBase, APIKey, UpdateAPIKey, User, UserOut
from app.core.security.api import (
    get_hashed_password, verify_password, password_context,
    validate_link_token,
)
from app.models.util.model import Message
from app.utills.dependencies import current_user, admin_access, CheckScope

from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

user_router = APIRouter(tags=["User Management"], prefix="/user")
app_admin = Depends(admin_access)
manage_users = Depends(CheckScope("users.write"))


@user_router.post("/all", dependencies=[app_admin, manage_users])
async def get_all_users() -> List[UserOut]:
    """Admin endpoint to get all users"""
    response: List[UserOut] = []
    users = await User.all_users()
    for user in users:
        user_roles = await user.user_roles()
        response.append(UserOut(**user.model_dump(exclude={'roles'}), roles=user_roles))
    return response


@user_router.post("/register", dependencies=[manage_users, app_admin])
async def create_user(
        user_register: UserAuth,

):
    """Admin endpoint to create a new user"""
    if _ := await User.by_email(user_register.email):
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
    return UserBase(**new_user.model_dump())


@user_router.post("/me")
async def profile(
        me: User = Depends(current_user)
) -> UserBase:
    """Retrieve current user's metadata"""
    return me


@user_router.post("/me/update_password")
async def update_password(
        body: UpdatePassword,
        me: User = Depends(current_user),
) -> Message:
    """Update password endpoint"""
    if not verify_password(body.password, me.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect password")
    if body.current_password == body.new_password:
        raise HTTPException(
            status_code=400, detail="New password cannot be the same as the current one"
        )
    hashed_password = get_hashed_password(body.new_password)
    me.password = hashed_password
    await me.save()
    return Message(message="Password updated successfully")


@user_router.post("/by_id", dependencies=[app_admin, manage_users])
async def by_id(
        id: str,
) -> UserBase:
    """Admin endpoint to retrieve a user's profile by id'"""
    return await User.by_id(id)


@user_router.post("/by_email", dependencies=[app_admin, manage_users])
async def by_email(
        email: str,
) -> UserBase:
    """Admin endpoint to retrieve a user's profile by email'"""
    return await User.by_email(email)


@user_router.post("/update", dependencies=[app_admin, manage_users])
async def update_user(
        user_update: UserBase,
) -> UserBase:
    """Admin endpoint to update a user"""
    user = await User.by_id(user_update.id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    await user.update(user_update.model_dump(exclude_unset=True))
    return user


@user_router.post("/me/update", dependencies=[app_admin, manage_users])
async def update_my_user(
        me: User = Depends(current_user),
        user_update: UserBase = Body(...),
) -> UserBase:
    """Update user endpoint"""
    user = await User.by_id(me.id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    await user.update(user_update.model_dump(exclude_unset=True))
    return user


@user_router.post("/api_key/create", dependencies=[app_admin, manage_users])
async def create_api_key(
        api_key: APIKey,
        email: str = Body(...),
) -> APIKey:
    """Create an API key for the specified user."""
    existing_api_key = await User.by_client_id(api_key.client_id, raise_on_zero=False)
    if existing_api_key:
        raise HTTPException(status_code=400, detail="API key already exists.")
    user = await User.by_email(email)
    api_key = APIKey(
        client_id=api_key.client_id,
        hashed_client_secret=password_context.hash(api_key.client_secret),
        scopes=api_key.scopes,
        active=api_key.active
    )
    user.api_keys.append(api_key)
    await user.save()
    return api_key


@user_router.post("/api_key/update", dependencies=[app_admin, manage_users])
async def update_api_key(key_updates: UpdateAPIKey) -> APIKey:
    user = await User.by_client_id(key_updates.client_id, raise_on_zero=False)
    if not user:
        raise HTTPException(status_code=400, detail="Could not find user for API key")
    for i, key in enumerate(user.api_keys):
        if key.client_id == key_updates.client_id:
            to_update = key_updates.model_dump(
                exclude={"client_secret"},  # needs to be hashed separately
                exclude_unset=True
            )
            if key_updates.client_secret:
                to_update["hashed_client_secret"] = password_context.hash(key_updates.client_secret)
            key = key.model_copy(update=to_update)
            user.api_keys[i] = key
            await user.save()
            return key
    raise HTTPException(status_code=400, detail="Could not find API key")


@user_router.post("/api_key/delete", dependencies=[app_admin, manage_users])
async def delete_api_key(
        client_id: str
) -> Message:
    linked_user = await User.by_client_id(client_id)
    linked_user.api_keys = [key for key in linked_user.api_keys if not key.client_id == client_id]
    linked_user.save()
    return Message.success(message="API key deleted.")


@user_router.post("/email_password_reset_link")
@limiter.limit("5/minute")
async def recover_password(request: Request, email: str) -> Message:
    user = await User.by_email(email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.source == "Basic" or user.password is not None:
        await MagicLink.request_magic(identifier=user.id, _type=MagicType.recovery)
        email_data = await generate_email(user, "recover_password")
        send_email(email=email_data)
    else:
        raise HTTPException(status_code=400, detail="User is not authenticated via password.")
    return Message(message="Password recovery email sent")


@user_router.post("/send_magic_link")
@limiter.limit("5/minute")
async def send_magic_link(request: Request, email: str) -> Message:
    if not settings.magic_link_enabled:
        raise HTTPException(status_code=403, detail="Magic link disabled")
    user = await User.by_email(email)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    if user.source.lower() == "basic" or user.password is not None:
        await MagicLink.request_magic(identifier=user.id, _type=MagicType.magic)
        email_data = await generate_email(user, "magic_link")
        send_email(email=email_data)
    else:
        raise HTTPException(status_code=400, detail="User is not authenticated via password.")
    return Message(message="Magic link email sent")

@user_router.post("/reset_password", dependencies=[])
async def reset_password(
        email: str = Form(...),
        password_reset_code: str = Form(...),
        new_password: str = Form(...),
        token = Depends(validate_link_token)
) -> Message:
    user = await User.by_email(email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    loguru.logger.debug(f"Password reset request for {email} {password_reset_code}")
    if user.source == "Basic":
        if not verify_password(password_reset_code, user.reset_code):
            raise HTTPException(status_code=401, detail="Incorrect password")
        hashed_password = get_hashed_password(new_password)
        user.password = hashed_password
        user.password_reset_code = None
        await user.save()
        return Message.success("Password reset successfully.")
    else:
        raise HTTPException(400, "Unable to reset password: User is not authenticated via password.")
