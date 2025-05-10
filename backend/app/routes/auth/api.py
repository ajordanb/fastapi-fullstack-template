from datetime import datetime, timedelta, UTC
from typing import Any, Tuple, Union, Optional, List, Dict
from password_strength import PasswordPolicy

from app.routes.auth.model import Token, TokenType
from app.config import settings
from fastapi import Depends, HTTPException, Form
from fastapi.security import OAuth2PasswordBearer
from passlib.context import CryptContext
import jwt
from pydantic import BaseModel, ValidationError
from starlette import status

ACCESS_TOKEN_EXPIRE_MINUTES = settings.token_expire_minutes
REFRESH_TOKEN_EXPIRE_MINUTES = settings.refresh_token_expire_minutes
ALGORITHM = "HS256"
JWT_SECRET_KEY = settings.secret_key
JWT_REFRESH_SECRET_KEY = settings.authjwt_refresh_key

password_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
if settings.mount_point:
    reuseable_oauth = OAuth2PasswordBearer(tokenUrl=f"/{settings.mount_point}/auth/token", scheme_name="JWT",
                                           auto_error=False)
else:
    reuseable_oauth = OAuth2PasswordBearer(tokenUrl=f"/auth/token", scheme_name="JWT", auto_error=False)

token_expired_exception = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Token expired",
    headers={"WWW-Authenticate": "Bearer"},
)

invalid_credentials_exception = HTTPException(
    status_code=status.HTTP_403_FORBIDDEN,
    detail="Could not validate credentials",
    headers={"WWW-Authenticate": "Bearer"},
)

invalid_token_format_exception = HTTPException(
    status_code=status.HTTP_403_FORBIDDEN,
    detail="Invalid token format",
    headers={"WWW-Authenticate": "Bearer"},
)


class CustomOAuth2RequestForm:
    def __init__(
            self,
            grant_type: str = Form(None, pattern="password"),
            username: str = Form(None),
            password: str = Form(None),
            client_id: Optional[str] = Form(None),
            client_secret: Optional[str] = Form(None),
            payload: Optional[dict] = Form(None)
    ):
        self.grant_type = grant_type
        self.username = username
        self.password = password
        self.client_id = client_id
        self.client_secret = client_secret
        self.payload = payload or {}


def _validate_token(token: str, key: str, token_type: TokenType = TokenType.jwt):
    match token_type:
        case TokenType.jwt:
            return jwt.decode(
                token, key, algorithms=[ALGORITHM], options={"verify_exp": False}
            )
        case TokenType.psk:
            return jwt.decode(token, key, algorithms=[ALGORITHM])
        case _:
            raise invalid_credentials_exception


def validate_token(token: str, key: str) -> Token:
    try:
        raw_jwt_payload = _validate_token(token, key, TokenType.jwt)
        token_data: Token = Token.model_validate(raw_jwt_payload)
        if token_data.is_expired():
            print("Expired Token")
            raise token_expired_exception
    except jwt.PyJWTError:
        print("Invalid credentials")
        raise invalid_credentials_exception
    except ValidationError:
        print("Invalid token format")
        raise invalid_token_format_exception

    return token_data


class RefreshTokenReq(BaseModel):
    refreshToken: str


def validate_refresh_token(req: RefreshTokenReq) -> Token:
    return validate_token(req.refreshToken, JWT_REFRESH_SECRET_KEY)


def valid_access_token(token: str = Depends(reuseable_oauth)) -> Token | None:
    if token:
        return validate_token(token, JWT_SECRET_KEY)
    return None


def get_hashed_password(password: str) -> str:
    return password_context.hash(password)


def verify_password(password: str, hashed_pass: str) -> bool:
    try:
        return password_context.verify(password, hashed_pass)
    except Exception as e:
        return False


def create_access_token(
        subject: Union[str, Any], expires_delta: int = None,
        scopes: Optional[List] = None, roles: Optional[List] = None,
        client_id: Optional[str] = None
) -> Tuple[str, datetime]:
    expires_delta = expires_delta or ACCESS_TOKEN_EXPIRE_MINUTES
    return encoded_token_data(subject=subject,
                              expires_delta=expires_delta,
                              client_id=client_id,
                              roles=roles,
                              scopes=scopes)


def create_refresh_token(
        subject: Union[str, Any], expires_delta: int = None,
        scopes: Optional[List] = None, roles: Optional[List] = None,
        client_id: Optional[str] = None
) -> Tuple[str, datetime]:
    expires_delta = expires_delta or REFRESH_TOKEN_EXPIRE_MINUTES
    return encoded_token_data(subject=subject,
                              expires_delta=expires_delta,
                              client_id=client_id,
                              roles=roles,
                              scopes=scopes)


def encoded_token_data(subject: Union[str, Any], expires_delta: int = None,
                       client_id: Optional[str] = None, scopes: Optional[List] = None, roles: Optional[List] = None) -> \
        Tuple[str, datetime]:
    exp = datetime.now(UTC) + timedelta(minutes=expires_delta)
    payload = {
        "sub": subject,
        "exp": exp,
        "client_id": client_id,
        "scopes": scopes,
        "roles": roles,
    }
    encoded = jwt.encode(payload, JWT_SECRET_KEY, ALGORITHM)
    return encoded, exp


policy = PasswordPolicy.from_names(
    length=8,  # min length: 8
    uppercase=1,  # need min. 2 uppercase letters
    numbers=1,  # need min. 2 digits
    nonletters=1,  # need min. 2 special characters
)


def password_is_weak(password: str) -> bool:
    return bool(policy.test(password))
