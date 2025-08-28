from fastapi import APIRouter, Request
from fastapi.templating import Jinja2Templates

templates = Jinja2Templates(directory="templates")

router = APIRouter()

@router.get("/play/connect-4")
async def play_connect_4(request: Request):
    return templates.TemplateResponse(request, "play/connect_4.html")
