from fastapi import HTTPException
from app.core.security.api import create_access_token
from app.email_client import generate_magic_link_email, generate_reset_password_email
from app.models.user.model import User
from app.utills.util import generate_random_text


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



async def generate_email(user: User, type: str):
    scopes, roles = await user.get_user_scopes_and_roles()
    access_token, at_expires = create_access_token(subject=user.email, scopes=scopes, roles=roles)
    if type == "magic_link":
        return generate_magic_link_email(user_email=user.email, token=access_token)
    elif type == "recover_password":
        random_text = generate_random_text()
        user.password_reset_code = random_text
        await user.save()
        return generate_reset_password_email(reset_email=user.email, reset_code=random_text, token=access_token)
    return None
