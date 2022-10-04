"""Server functionality."""
from authlib.integrations.httpx_client import AsyncOAuth2Client
from fastapi import FastAPI, Depends, Request
from starlette.middleware.cors import CORSMiddleware
# from fastapi.exception_handlers import (http_exception_handler)
# from fastapi.responses import RedirectResponse
# from fastapi.security import OpenIdConnect
from secrets import token_hex
# from starlette.exceptions import HTTPException as StarletteHTTPException
from starlette.middleware.sessions import SessionMiddleware
# from typing import Optional

# from ..settings import settings

app = FastAPI()

origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(
    SessionMiddleware,
    secret_key=token_hex(32),
)

oauth = AsyncOAuth2Client(client_id='experiment-support-system', client_secret='6lztJtzdw5eOCagUFr0NeZjgHMZ5V9vy')

# oauth.register(name='room3b',
#               server_metadata_url='https://sso.room3b.eu/realms/Development/.well-known/openid-configuration',
#               client_kwargs={'scope': 'openid'},
#               client_id='experiment-support-system',)
#               client_secret='6lztJtzdw5eOCagUFr0NeZjgHMZ5V9vy')


def authorisation_token(request: Request) -> str:
    """Try this."""
    if 'Authorization' in request.headers:
        if request.headers['Authorization'].startswith('Bearer '):
            return request.headers['Authorization'][7:]


async def authenticated_user(token: str = Depends(authorisation_token)) -> None:
    """Try this."""
    await oauth.introspect_token('https://sso.room3b.eu/realms/Development/protocol/openid-connect/token/introspect',
                                 token=token)
    return None


@app.get('/users/current')
async def get_current_user(user: None = Depends(authenticated_user)) -> dict:
    """Return a test message."""
    return {"message": "Hello World"}

'''




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
