"""Security dependencies."""
import httpx
import logging

from authlib.jose import JsonWebToken
from authlib.jose.errors import JoseError
from fastapi import Depends, Request
from fastapi.exceptions import HTTPException
from sqlalchemy import select
from time import time

from ..models import get_session, User
from ..settings import settings


logger = logging.getLogger(__name__)
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
    """Return the authenticated user.

    Creates the user in the database, if it doesn't exist
    """
    async with get_session() as dbsession:
        query = select(User).filter(User.id == claims['sub'])
        result = await dbsession.execute(query)
        user = result.scalar()
        if user is None:
            logger.debug(f'Creating new user {claims["sub"]}')
            user = User(id=claims['sub'],
                        attributes={'email': claims['email'],
                                    'name': f'{claims["given_name"]} {claims["family_name"]}'})
            dbsession.add(user)
            await dbsession.commit()
        elif user.attributes['email'] != claims['email']:
            user.attributes['email'] = claims['email']
            await dbsession.commit()
        return user
