from fastapi import APIRouter, Request
from fastapi.templating import Jinja2Templates

templates = Jinja2Templates(directory="templates")

router = APIRouter()

@router.get("/play/bowling")
async def play_bowling(request: Request):
    return templates.TemplateResponse(request, "play/bowling.html")