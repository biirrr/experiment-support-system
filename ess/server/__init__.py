"""Server functionality."""
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from .routes import experiments_router, users_router

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
app.include_router(experiments_router)
app.include_router(users_router)
