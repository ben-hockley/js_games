from fastapi import APIRouter, Request
from fastapi.templating import Jinja2Templates

templates = Jinja2Templates(directory="templates")

router = APIRouter()

@router.get("/play/minesweeper")
async def play_minesweeper(request: Request):
    return templates.TemplateResponse(request, "play/minesweeper.html")
