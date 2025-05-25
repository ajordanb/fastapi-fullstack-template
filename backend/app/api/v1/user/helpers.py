from datetime import datetime, UTC, timedelta

from fastapi import HTTPException

from app.core.config import settings
from app.models.auth.model import MagicLink
from app.models.user.model import User


async def validate_user_does_not_exist(email: str):
    if _ := await User.by_email(email):
        raise HTTPException(409, "User already exists")


async def validate_user_doesnt_need_verification(user: User):
    if not user:
        raise HTTPException(404, "No account found")
    if user.needs_verification:
        raise HTTPException(400, "Email is not yet verified")
    if user.disabled:
        raise HTTPException(400, "Your account is disabled")


async def validate_user_exists_and_is_enabled(user: User):
    if not user:
        raise HTTPException(404, "No account found")
    if user.disabled:
        raise HTTPException(400, "Your account is disabled")


async def validate_user_state_for_verification(user: User):
    if user is None:
        raise HTTPException(404, "No account found")
    if not user.needs_verification:
        raise HTTPException(400, "Email is already verified")
    if user.disabled:
        raise HTTPException(400, "Your account is disabled")


def generate_magic_link(email: str)-> MagicLink:
    dt = datetime.now(UTC)
    return MagicLink(
        identifier=email,
        payload= {
            "date_requested": dt.isoformat(),
            "granted": True,
            "expiry": (dt + timedelta(minutes=settings.email_reset_token_expire_minutes)).isoformat(),
        }
    )