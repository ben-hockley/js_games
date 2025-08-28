from fastapi import APIRouter, Request
from fastapi.responses import RedirectResponse
from fastapi.templating import Jinja2Templates

templates = Jinja2Templates(directory="templates")

router = APIRouter()

@router.get("/")
async def root():
    return RedirectResponse(url="/home")

@router.get("/home")
async def home(request: Request):
    return templates.TemplateResponse(request, "home.html")
