"""Server functionality."""
import logging

from fastapi import FastAPI, Depends
from starlette.middleware.cors import CORSMiddleware

from .security import authenticated_user

logger = logging.getLogger(__name__)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get('/users/current')
async def get_current_user(user: None = Depends(authenticated_user)) -> dict:
    """Return a test message."""
    return {"message": "Hello World"}
