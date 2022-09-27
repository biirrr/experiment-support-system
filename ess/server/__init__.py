"""Server functionality."""
from fastapi import FastAPI

app = FastAPI()


@app.get("/")
async def root() -> dict:
    """Return a test message."""
    return {"message": "Hello World"}
