from fastapi import APIRouter, Request
from fastapi.templating import Jinja2Templates

templates = Jinja2Templates(directory="templates")

router = APIRouter()

@router.get("/play/spelling-bee")
async def play_spelling_bee(request: Request):
    return templates.TemplateResponse(request, "play/spelling_bee.html")
