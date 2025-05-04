from fastapi import HTTPException

from app.user.model import _Users


async def validate_user_does_not_exist(email: str):
    if _ := await _Users.by_email(email):
        raise HTTPException(409, "User already exists")


async def validate_user_doesnt_need_verification(user: _Users):
    if not user:
        raise HTTPException(404, "No account found")
    if user.needs_verification:
        raise HTTPException(400, "Email is not yet verified")
    if user.disabled:
        raise HTTPException(400, "Your account is disabled")


async def validate_user_exists_and_is_enabled(user: _Users):
    if not user:
        raise HTTPException(404, "No account found")
    if user.disabled:
        raise HTTPException(400, "Your account is disabled")


async def validate_user_state_for_verification(user: _Users):
    if user is None:
        raise HTTPException(404, "No account found")
    if not user.needs_verification:
        raise HTTPException(400, "Email is already verified")
    if user.disabled:
        raise HTTPException(400, "Your account is disabled")
