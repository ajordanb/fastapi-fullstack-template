from enum import Enum
import json
from pprint import pprint
from typing import Callable, Awaitable
import aiohttp
import jwt


async def exchange_google_sso_data_for_email(data: dict, redirect_uri: str = "") -> str:
    access_token = data["access_token"]
    headers = {"Authorization": f"Bearer {access_token}"}
    async with aiohttp.ClientSession() as session:
        async with session.get(
                "https://www.googleapis.com/oauth2/v3/userinfo?alt=json",
                headers=headers,
        ) as response:
            data = await response.json()
            return data["email"]


async def exchange_microsoft_sso_data_for_email(
        data: dict, redirect_uri: str = ""
) -> str:
    access_token = data["access_token"]
    url = "https://graph.microsoft.com/v1.0/me"
    headers = {"Authorization": f"Bearer {access_token}"}
    async with aiohttp.ClientSession() as session:
        async with session.get(url, headers=headers) as response:
            user_data = await response.json()
            return user_data.get("mail") or user_data.get("userPrincipalName")


async def exchange_facebook_sso_data_for_email(
        data: dict, redirect_uri: str = ""
) -> str:
    access_token = data["accessToken"]
    url = "https://graph.facebook.com/v13.0/me?fields=email"
    headers = {"Authorization": f"Bearer {access_token}"}
    async with aiohttp.ClientSession() as session:
        async with session.get(url, headers=headers) as response:
            user_data = await response.json()
            return user_data.get("email")


async def exchange_apple_sso_data_for_email(data: dict, redirect_uri: str = "") -> str:
    access_token = data["authorization"]["id_token"]
    apple_keys_url = "https://appleid.apple.com/auth/keys"

    async with aiohttp.ClientSession() as session:
        async with session.get(apple_keys_url) as response:
            apple_keys = await response.json()
    unverified_header = jwt.get_unverified_header(access_token)
    key = next((key for key in apple_keys['keys'] if key['kid'] == unverified_header['kid']), None)
    if not key:
        raise Exception("Matching public key not found in Apple's JWK set")

    rsa_key = jwt.algorithms.RSAAlgorithm.from_jwk(json.dumps(key))

    try:
        decoded_token = jwt.decode(
            access_token,
            rsa_key,
            algorithms=["RS256"],
            audience="app.auth",  # Replace with your client ID
            issuer="https://appleid.apple.com"
        )
        pprint(decoded_token)
        return decoded_token.get('email')
    except jwt.exceptions.InvalidSignatureError:
        raise Exception("Signature verification failed")
    except jwt.exceptions.DecodeError:
        raise Exception("Error decoding token")
    except jwt.exceptions.InvalidAudienceError:
        raise Exception("Invalid audience")
    except jwt.exceptions.InvalidIssuerError:
        raise Exception("Invalid issuer")


class SsoProvider(str, Enum):
    GOOGLE = "google"


SsoDataToEmailFunction = Callable[[dict, str], Awaitable[str]]

provider_map: dict[SsoProvider, SsoDataToEmailFunction] = {
    SsoProvider.GOOGLE: exchange_google_sso_data_for_email,
}
