from fastapi import APIRouter, Depends, Body, HTTPException, Request
from app.routes.auth.helpers import password_authenticated_user, client_id_authenticated_user
from app.routes.auth.model import SocialLoginRequest

from app.routes.auth.api import (
    Token,
    create_access_token,
    create_refresh_token,
    validate_refresh_token,
    policy, CustomOAuth2RequestForm, validate_link_token,
)
from app.routes.auth.model import RefreshToken
from app.routes.auth.social import provider_map
from app.config import settings
from app.routes.user.model import User

auth_router = APIRouter(tags=["Authentication"], prefix="/auth")


@auth_router.post("/token")
async def login_ep(request: Request, form: CustomOAuth2RequestForm = Depends()) -> RefreshToken:
    if form.username and form.password:
        user = await password_authenticated_user(form)
    elif form.client_id:
        user = await client_id_authenticated_user(form)
    else:
        raise HTTPException(401, "No login info")
    scopes, user_role_names = await user.get_user_scopes_and_roles()
    if user._using_api_key:
        access_token, at_expires = create_access_token(subject=user.email, client_id=user._api_key.client_id)
    else:
        access_token, at_expires = create_access_token(subject=user.email, scopes=scopes, roles=user_role_names)
    refresh_token, rt_expires = create_refresh_token(subject=user.email, scopes=scopes, roles=user_role_names)
    return RefreshToken(
        accessToken=access_token,
        accessTokenExpires=at_expires,
        refreshToken=refresh_token,
        refreshTokenExpires=rt_expires,
    )


@auth_router.post("/social_login")
async def social_login_ep(req: SocialLoginRequest) -> RefreshToken:
    email = await provider_map[req.provider](req.data, req.redirect_url)
    user = await User.by_email(email)
    if user is None:
        if not settings.allow_new_users:
            raise HTTPException(
                status_code=403,
                detail="New users are not allowed in this environment",
            )
        user = User(email=email, source=req.provider, referral_code=req.referral_code)
        await user.save()
    scopes, user_role_names = await user.get_user_scopes_and_roles()
    access_token, at_expires = create_access_token(subject=user.email, scopes=scopes, roles=user_role_names)
    refresh_token, rt_expires = create_refresh_token(subject=user.email, scopes=scopes, roles=user_role_names)
    return RefreshToken(
        accessToken=access_token,
        accessTokenExpires=at_expires,
        refreshToken=refresh_token,
        refreshTokenExpires=rt_expires,
    )


@auth_router.post("/refresh")
async def refresh(token_data: Token = Depends(validate_refresh_token)) -> RefreshToken:
    """Returns a new access token from a refresh token"""
    user = await User.by_email(token_data.sub)
    access_token, at_expires = create_access_token(subject=user.email, client_id=token_data.client_id)
    refresh_token, rt_expires = create_refresh_token(subject=user.email)
    return RefreshToken(
        accessToken=access_token,
        accessTokenExpires=at_expires,
        refreshToken=refresh_token,
        refreshTokenExpires=rt_expires,
    )


@auth_router.post("/validate_magic_link", status_code=204)
async def validate_magic_link(token_data=Depends(validate_link_token)) -> RefreshToken:
    user = await User.by_email(token_data.sub)
    access_token, at_expires = create_access_token(subject=user.email, client_id=token_data.client_id)
    refresh_token, rt_expires = create_refresh_token(subject=user.email)
    return RefreshToken(
        accessToken=access_token,
        accessTokenExpires=at_expires,
        refreshToken=refresh_token,
        refreshTokenExpires=rt_expires,
    )


@auth_router.post("/check_password")
async def check_password_strength(password: str = Body(...)):
    from password_strength import tests
    errors = []
    validation = policy.test(password)
    for error in validation:
        if isinstance(error, tests.Length):
            errors.append(
                f"Password should be at least {error.length} characters long."
            )
        elif isinstance(error, tests.Numbers):
            errors.append(f"Password should have at least {error.count} digits.")
        elif isinstance(error, tests.NonLetters):
            errors.append(
                f"Password should have at least {error.count} special characters."
            )
        elif isinstance(error, tests.Uppercase):
            errors.append(
                f"Password should have at least {error.count} uppercase letters."
            )

    return {"errors": errors}
