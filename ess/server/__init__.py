"""Server functionality."""
# from authlib.integrations.starlette_client import OAuth
from fastapi import FastAPI  # , Depends, Request
# from fastapi.exception_handlers import (http_exception_handler)
# from fastapi.responses import RedirectResponse
# from fastapi.security import OpenIdConnect
# from starlette.exceptions import HTTPException as StarletteHTTPException
# from starlette.middleware.sessions import SessionMiddleware
# from secrets import token_hex
# from typing import Optional

# from ..settings import settings

app = FastAPI()

'''
app.add_middleware(
    SessionMiddleware,
    secret_key=token_hex(32),
)

oauth = OAuth()
oauth.register(name='room3b',
               server_metadata_url='https://sso.room3b.eu/realms/Development/.well-known/openid-configuration',
               client_id='experiment-support-system',
               client_secret='6lztJtzdw5eOCagUFr0NeZjgHMZ5V9vy')



@app.exception_handler(StarletteHTTPException)
async def unauthorised_redirect_exception(request, exc):
    if exc.status_code == 403:
        return await oauth.room3b.authorize_redirect(request, 'http://localhost:8000/oauth2/authorize')
    return await http_exception_handler(request, exc)


async def authenticated_user(request: Request):
    return None


@app.get("/")
async def root(user = Depends(authenticated_user)) -> dict:
    """Return a test message."""
    return {"message": "Hello World"}


@app.get("/oauth2/authorize")
async def authorize(request: Request) -> dict:
    """Return a test message."""
    token = await oauth.room3b.authorize_access_token(request)
    print(token)
    return RedirectResponse('/')
'''
