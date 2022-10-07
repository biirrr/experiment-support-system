"""Functions for handling frontend routes."""
from fastapi import APIRouter
from fastapi.responses import FileResponse
from importlib import resources


router = APIRouter(prefix='/editor')


@router.get('/{path:path}')
def get_editor(path: str) -> FileResponse:
    """Return the editor or its assets."""
    resource = resources.files('ess.server') / 'backend' / 'dist'
    if path.startswith('assets'):
        for part in path.split('/'):
            resource = resource / part
        return FileResponse(resource)
    else:
        return FileResponse(resource / 'index.html')
