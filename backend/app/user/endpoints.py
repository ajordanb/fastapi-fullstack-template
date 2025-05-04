import os
from typing import List
import loguru
from fastapi import APIRouter, Depends, HTTPException, Body, Query, Form
from app.email_client import generate_reset_password_email, send_email
from app.role.model import Role
from app.shared.model import Message
from app.user.model import UserAuth, UpdatePassword, UserBase, APIKey, CreateAPIKey, UpdateAPIKey, User
from app.shared.dependencies import current_user, CheckScope, admin_access
from app.auth.api import (
    get_hashed_password, verify_password, password_context,
)

user_router = APIRouter(tags=["User Management"], prefix="/user")
app_admin = Depends(admin_access)
manage_users = Depends(CheckScope("users.write"))


@user_router.post("/all", response_model=List[UserBase], dependencies=[app_admin, manage_users])
async def get_all_users() -> List[UserBase]:
    """Admin endpoint to get all users"""
    users = await User.all_users()
    return [UserBase(**u.model_dump()) for u in users]


@user_router.post("/register", dependencies=[manage_users, app_admin])
async def create_user(
        user_register: UserAuth
):
    """Admin endpoint to create a new user"""
    if _ := await User.by_email(user_register.email):
        raise HTTPException(
            status_code=400,
            detail="User already exists",
        )
    for role in user_register.roles:
            if not (_ := await Role.by_name(role)):
                raise HTTPException(
                    status_code=404,
                    detail=f"Role with name {role} does not exist",
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
        id: str = Query(...),
        user_update: UserBase = Body(...),
) -> UserBase:
    """Update user endpoint"""
    user = await User.by_id(id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    await user.update(user_update.model_dump(exclude_unset=True))
    return user


@user_router.post("/api_key/create", dependencies=[app_admin, manage_users])
async def create_api_key(
        api_key: CreateAPIKey,
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
async def recover_password(email: str) -> Message:
    user = await User.by_email(email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.source == "Basic":
        random_text = os.urandom(48).hex()
        user.password_reset_code = random_text
        await user.save()
        email_data = generate_reset_password_email(reset_email=user.email, token=random_text)
        send_email(email=email_data)
    else:
        raise HTTPException(status_code=400, detail="User is not authenticated via password.")
    return Message(message="Password recovery email sent")


@user_router.post("/reset_password")
async def reset_password(
        email: str = Form(...),
        password_reset_code: str = Form(...),
        new_password: str = Form(...),
) -> Message:
    user = await User.by_email(email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    loguru.logger.debug(f"Password reset request for {email} {password_reset_code}")
    if user.source == "Basic":
        if user.password_reset_code == password_reset_code:
            hashed_password = password_context.hash(new_password)
            user.password = hashed_password
            random_text = os.urandom(48).hex()
            user.password_reset_code = random_text
            await user.save()
            return Message.success("Password reset successfully.")
        else:
            raise HTTPException(400, "Unable to reset password: reset code error")
    else:
        raise HTTPException(400, "Unable to reset password: User is not authenticated via password.")
