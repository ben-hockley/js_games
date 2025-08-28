from fastapi import APIRouter, Request, Form
from fastapi.templating import Jinja2Templates
from fastapi.responses import RedirectResponse
from database import insert_user, get_user_by_username, User, SessionLocal
from sqlalchemy import or_
import re

templates = Jinja2Templates(directory="templates")

router = APIRouter()

def validate_username(username):
    return re.fullmatch(r"^[a-zA-Z0-9_]{3,20}$", username)

def validate_password(password):
    return re.fullmatch(r"^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+=-]{6,32}$", password)

def validate_email(email):
    return re.fullmatch(r"^[\w\.-]+@[\w\.-]+\.\w{2,}$", email)

@router.get("/create-account")
async def create_account_get(request: Request):
    return templates.TemplateResponse("create_account.html", {"request": request})

@router.post("/create-account")
async def create_account_post(request: Request, username: str = Form(...), password: str = Form(...), email: str = Form(...)):
    error = None
    if not validate_username(username):
        error = "Username must be 3-20 characters, letters, numbers, and underscores only."
    elif not validate_email(email):
        error = "Please enter a valid email address."
    elif not validate_password(password):
        error = "Password must be 6-32 characters, include at least one letter and one number."
    else:
        session = SessionLocal()
        try:
            existing = session.query(User).filter(or_(User.username == username, User.email == email)).first()
            if existing:
                if existing.username == username:
                    error = "Username is already taken."
                else:
                    error = "Email is already registered."
            else:
                user = insert_user(username=username, password=password, email=email)
                request.session["user"] = {"username": user.username, "email": user.email}
                return RedirectResponse(url="/account", status_code=303)
        finally:
            session.close()
    return templates.TemplateResponse("create_account.html", {"request": request, "error": error})
