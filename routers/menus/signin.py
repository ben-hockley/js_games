from fastapi import APIRouter, Request, Form
from fastapi.responses import RedirectResponse
from fastapi.templating import Jinja2Templates
from database import get_user_by_username, verify_password

router = APIRouter()
templates = Jinja2Templates(directory="templates")

@router.get("/signin")
async def signin_get(request: Request):
    return templates.TemplateResponse("signin.html", {"request": request})

@router.post("/signin")
async def signin_post(request: Request, username: str = Form(...), password: str = Form(...)):
    user = get_user_by_username(username)
    if user and verify_password(password, user.password):
        request.session["user"] = {"username": user.username, "email": user.email}
        return RedirectResponse(url="/account", status_code=303)
    error = "Invalid username or password."
    return templates.TemplateResponse("signin.html", {"request": request, "error": error})

@router.post("/signout")
async def signout(request: Request):
    request.session.pop("user", None)
    return RedirectResponse(url="/signin", status_code=303)
