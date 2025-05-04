from typing import TypeVar
from fastapi import HTTPException, Depends
from starlette import status

from app.auth.api import valid_access_token
from app.auth.model import Token
from app.role.model import Role
from app.user.model import User

T = TypeVar('T')


async def current_user(
        token: Token = Depends(valid_access_token),
) -> User:
    """Access the current user. If a token is not provided it will fall back on API key."""
    if not token:
        raise HTTPException(401, "Not authenticated.")
    user = await User.by_email(token.sub)
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



def admin_access(user: User = Depends(current_user)) -> User:
    if "admin" in user.roles:
        return user
    else:
        raise HTTPException(
            status_code=401, detail="Not enough privileges."
        )


class CheckScope:
    def __init__(self, scope: str):
        self.scope = scope

    async def __call__(self, user: User = Depends(current_user)):
        if user._using_api_key:
            if self.scope in user._api_key.scopes:
                return
            else:
                raise HTTPException(status_code=403, detail=f"Missing scope (API key): {self.scope.value}")
        else:
            user_roles = user.roles
            if not user_roles:
                raise HTTPException(status_code=403, detail="User is not authorized to access tenant")
            all_roles: dict[str, Role] = {r.name: r for r in (await Role.all().to_list())}
            for role in user_roles:
                if role == "admin":
                    return
                if self.scope in all_roles[role].scopes:
                    return
            else:
                raise HTTPException(status_code=403, detail=f"Missing scope: {self.scope}")
