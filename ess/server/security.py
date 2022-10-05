"""Security dependencies."""
import httpx

from authlib.jose import JsonWebToken
from authlib.jose.errors import JoseError
from fastapi import Depends, Request
from fastapi.exceptions import HTTPException
from time import time

from ..settings import settings


jwt = JsonWebToken(algorithms=['RS256'])
_oauth2_config = None
_jwks = None


async def oauth2_config() -> dict:
    """Fetch the OAuth2 Authorization Server configuration."""
    global _oauth2_config
    if _oauth2_config is None:
        async with httpx.AsyncClient() as client:
            response = await client.get(settings.security.oidc_config_endpoint)
            if response.status_code == 200:
                _oauth2_config = response.json()
            else:
                raise HTTPException(status_code=500, detail='Could not fetch OAuth2 configuration')
    return _oauth2_config


async def oauth2_jwks(config: dict = Depends(oauth2_config)) -> list[dict]:
    """Get the JWKS provided by the OAuth2 Authorization Server."""
    global _jwks
    if _jwks is None:
        if 'jwks_uri' in config:
            async with httpx.AsyncClient() as client:
                response = await client.get(config['jwks_uri'])
                if response.status_code == 200:
                    _jwks = response.json()
                else:
                    raise HTTPException(status_code=500, detail='Could not fetch OAuth2 JWKS')
        else:
            raise HTTPException(status_code=500, detail='No Oauth2 JWKS URI configured')
    return _jwks


async def oauth2_claims(request: Request, jkws: list[dict] = Depends(oauth2_jwks)) -> dict:
    """Extract and validate the OAuth2 claims from the Authorization header."""
    if 'Authorization' in request.headers:
        if request.headers['Authorization'].startswith('Bearer '):
            token = request.headers['Authorization'][7:]
            try:
                claims = jwt.decode(token, key=jkws)
                if time() < claims['exp']:
                    if 'allowed-origins' in claims:
                        if 'Origin' in request.headers and request.headers['Origin'] in claims['allowed-origins']:
                            return claims
                    else:
                        return claims
            except JoseError:
                pass
            except ValueError:
                pass
    raise HTTPException(403)


async def authenticated_user(claims: dict = Depends(oauth2_claims)) -> None:
    """Try this."""
    return None
