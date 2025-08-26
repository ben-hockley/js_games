import uvicorn

# FASTAPI
from fastapi import FastAPI, Request, Form, APIRouter
from fastapi.responses import RedirectResponse, JSONResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
# Import database setup
from database import User, WordleScore, SnakeScore, Score2048
from database import insert_user, get_user_by_username, verify_password
from database import insert_wordle_score, insert_snake_score, insert_2048_score
from database import SessionLocal, get_top_2048_scores, get_user_top_2048_scores
from sqlalchemy import or_

from starlette.middleware.sessions import SessionMiddleware
import re

from dotenv import load_dotenv
import os

load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY")

# Create all tables in the database (run once at startup)
# Base.metadata.create_all(bind=engine)

app = FastAPI()
# Set a secret key for session management
app.add_middleware(SessionMiddleware, secret_key=SECRET_KEY)

# Mount the static directory
app.mount("/static", StaticFiles(directory="static"), name="static")

# Configure Jinja2 templates
templates = Jinja2Templates(directory="templates")

@app.get("/")
async def root():
    return RedirectResponse(url="/home")

@app.get("/home")
async def home(request: Request):
    return templates.TemplateResponse(request, "home.html")

# Spelling Bee
@app.get("/play/spelling-bee")
async def play_spelling_bee(request: Request):
    return templates.TemplateResponse(request, "play/spelling_bee.html")

# Wordle
@app.get("/play/wordle")
async def play_wordle(request: Request):
    return templates.TemplateResponse(request, "play/wordle.html")

@app.post("/wordle-score")
async def wordle_score(request: Request):
    user = request.session.get("user")
    if not user:
        return JSONResponse({"message": "Sign in to save your scores"}, status_code=401)
    data = await request.json()
    score = data.get("score")
    if score is None:
        return JSONResponse({"message": "Invalid score"}, status_code=400)
    # Get user_id from DB
    db_user = get_user_by_username(user["username"])
    if db_user:
        insert_wordle_score(user_id=db_user.id, score=score)
        return JSONResponse({"message": "Score saved!"})
    return JSONResponse({"message": "User not found"}, status_code=404)

# Sudoku
@app.get("/play/sudoku")
async def play_sudoku(request: Request):
    return templates.TemplateResponse(request, "play/sudoku.html")
# 2048

@app.get("/play/2048")
async def play_2048(request: Request):
    leaderboard = get_top_2048_scores()
    return templates.TemplateResponse(request, "play/2048.html", {"request": request, "leaderboard": leaderboard})

@app.post("/2048-score")
async def save_2048_score(request: Request):
    user = request.session.get("user")
    if not user:
        return JSONResponse({"message": "Sign in to save your scores"}, status_code=401)
    data = await request.json()
    score = data.get("score")
    if score is None:
        return JSONResponse({"message": "Invalid score"}, status_code=400)
    # Get user_id from DB
    db_user = get_user_by_username(user["username"])
    if db_user:
        insert_2048_score(user_id=db_user.id, score=score)
        return JSONResponse({"message": "Score saved!"})
    return JSONResponse({"message": "User not found"}, status_code=404)

# Minesweeper
@app.get("/play/minesweeper")
async def play_minesweeper(request: Request):
    return templates.TemplateResponse(request, "play/minesweeper.html")

# Snake
@app.get("/play/snake")
async def play_snake(request: Request):
    # Get top 5 snake scores and usernames
    session = SessionLocal()
    leaderboard = []
    try:
        results = (
            session.query(SnakeScore.score, User.username)
            .join(User, SnakeScore.user_id == User.id)
            .order_by(SnakeScore.score.desc(), SnakeScore.played_at.asc())
            .limit(5)
            .all()
        )
        leaderboard = [{"score": score, "username": username} for score, username in results]
    finally:
        session.close()
    return templates.TemplateResponse("play/snake.html", {"request": request, "leaderboard": leaderboard})

@app.post("/snake-score")
async def snake_score(request: Request):
    user = request.session.get("user")
    if not user:
        return JSONResponse({"message": "Sign in to save your scores"}, status_code=401)
    data = await request.json()
    score = data.get("score")
    if score is None:
        return JSONResponse({"message": "Invalid score"}, status_code=400)
    # Get user_id from DB
    db_user = get_user_by_username(user["username"])
    if db_user:
        insert_snake_score(user_id=db_user.id, score=score)
        return JSONResponse({"message": "Score saved!"})
    return JSONResponse({"message": "User not found"}, status_code=404)

# Connect 4
@app.get("/play/connect-4")
async def play_connect_4(request: Request):
    return templates.TemplateResponse(request, "play/connect_4.html")

#----------------Accounts--------------------------------------------------------------------------

# Account route: redirect to sign in if not signed in, else show account details
@app.get("/account")
async def account(request: Request):
    user = request.session.get("user")
    if not user:
        return RedirectResponse(url="/signin")
    # Get Wordle score distribution for this user
    db_user = get_user_by_username(user["username"])
    score_freq = {str(i): 0 for i in range(1, 7)}
    score_freq["0"] = 0  # 0 for losses
    top_snake_scores = []
    user_snake_scores = []
    top_2048_scores = []
    user_2048_scores = []
    if db_user:
        session = SessionLocal()
        try:
            # Wordle score distribution
            scores = session.query(WordleScore.score).filter(WordleScore.user_id == db_user.id).all()
            for (score,) in scores:
                score_freq[str(score)] = score_freq.get(str(score), 0) + 1

            # Top 5 overall snake scores (all users)
            results = (
                session.query(SnakeScore.score, User.username)
                .join(User, SnakeScore.user_id == User.id)
                .order_by(SnakeScore.score.desc(), SnakeScore.played_at.asc())
                .limit(5)
                .all()
            )
            top_snake_scores = [{"score": score, "username": username} for score, username in results]

            # Top 5 snake scores for this user
            user_results = (
                session.query(SnakeScore.score, SnakeScore.played_at)
                .filter(SnakeScore.user_id == db_user.id)
                .order_by(SnakeScore.score.desc(), SnakeScore.played_at.asc())
                .limit(5)
                .all()
            )
            user_snake_scores = [{"score": score, "played_at": played_at} for score, played_at in user_results]
        finally:
            session.close()
        # 2048 leaderboards (all users and user)
        top_2048_scores = get_top_2048_scores()
        user_2048_scores = get_user_top_2048_scores(db_user.id)
    return templates.TemplateResponse(
        "account.html",
        {
            "request": request,
            "user": user,
            "score_freq": score_freq,
            "top_snake_scores": top_snake_scores,
            "user_snake_scores": user_snake_scores,
            "top_2048_scores": top_2048_scores,
            "user_2048_scores": user_2048_scores,
        },
    )

# Sign in page
@app.get("/signin")
async def signin_get(request: Request):
    return templates.TemplateResponse("signin.html", {"request": request})


# Sign in form handler with authentication logic
@app.post("/signin")
async def signin_post(request: Request, username: str = Form(...), password: str = Form(...)):
    user = get_user_by_username(username)
    if user and verify_password(password, user.password):
        request.session["user"] = {"username": user.username, "email": user.email}
        return RedirectResponse(url="/account", status_code=303)
    # Authentication failed
    error = "Invalid username or password."
    return templates.TemplateResponse("signin.html", {"request": request, "error": error})

# Sign out
@app.post("/signout")
async def signout(request: Request):
    request.session.pop("user", None)
    return RedirectResponse(url="/signin", status_code=303)

# Create Account page (GET)
@app.get("/create-account")
async def create_account_get(request: Request):
    return templates.TemplateResponse("create_account.html", {"request": request})

def validate_username(username):
    return re.fullmatch(r"^[a-zA-Z0-9_]{3,20}$", username)

def validate_password(password):
    return re.fullmatch(r"^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+=-]{6,32}$", password)

def validate_email(email):
    return re.fullmatch(r"^[\w\.-]+@[\w\.-]+\.\w{2,}$", email)

@app.post("/create-account")
async def create_account_post(request: Request, username: str = Form(...), password: str = Form(...), email: str = Form(...)):
    # Server-side validation
    error = None
    if not validate_username(username):
        error = "Username must be 3-20 characters, letters, numbers, and underscores only."
    elif not validate_email(email):
        error = "Please enter a valid email address."
    elif not validate_password(password):
        error = "Password must be 6-32 characters, include at least one letter and one number."
    else:
        # Check uniqueness
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
    # If we reach here, there was an error
    return templates.TemplateResponse("create_account.html", {"request": request, "error": error})

#--------------------------------------------------------------------------------------------------
if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)