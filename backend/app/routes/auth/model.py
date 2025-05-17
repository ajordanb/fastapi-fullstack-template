from datetime import datetime
from enum import Enum
from typing import Optional
from pydantic import BaseModel, model_validator, EmailStr


class MagicLink(BaseModel):
    identifier: EmailStr
    payload: dict

class AccessToken(BaseModel):
    """Access token details"""

    accessToken: str
    accessTokenExpires: datetime
    access_token: Optional[str] = None

    @model_validator(mode="before")
    def validate_access_token(cls, values: dict):
        values["access_token"] = values["accessToken"]
        return values


class RefreshToken(AccessToken):
    """Access and refresh token details"""

    refreshToken: str
    refreshTokenExpires: datetime


class MsAuthRequest(BaseModel):
    code: str
    code_verifier: str


class SocialLoginRequest(BaseModel):
    provider: str
    data: dict
    redirect_url: str | None = ""


class GoogleAuthToken(BaseModel):
    token: str


class NewPassword(BaseModel):
    token: str
    new_password: str


class TokenType(str, Enum):
    jwt = "jwt"
    psk = "psk"


class Token(BaseModel):
    sub: str
    exp: int
    domain: Optional[dict] = None
    client_id: Optional[str] = None

    @property
    def expiration_date(self) -> datetime:
        return datetime.fromtimestamp(self.exp)

    def is_expired(self, as_of=None):
        return self.expiration_date < (as_of or datetime.now())
