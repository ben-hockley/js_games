from fastapi import APIRouter, Request
from fastapi.templating import Jinja2Templates

templates = Jinja2Templates(directory="templates")

router = APIRouter()

@router.get("/play/sudoku")
async def play_sudoku(request: Request):
    return templates.TemplateResponse(request, "play/sudoku.html")
