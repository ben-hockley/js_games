from fastapi import APIRouter, Request
from fastapi.templating import Jinja2Templates

from database import SessionLocal
from fastapi.responses import JSONResponse

templates = Jinja2Templates(directory="templates")

router = APIRouter()

from services.snake_service import insert_snake_score, get_top_snake_scores
from services.user_service import get_user_by_username

@router.get("/play/snake")
async def play_snake(request: Request):
    leaderboard = get_top_snake_scores()
    return templates.TemplateResponse("play/snake.html", {"request": request, "leaderboard": leaderboard})

@router.post("/snake-score")
async def snake_score(request: Request):
    user = request.session.get("user")
    if not user:
        return JSONResponse({"message": "Sign in to save your scores"}, status_code=401)
    data = await request.json()
    score = data.get("score")
    if score is None:
        return JSONResponse({"message": "Invalid score"}, status_code=400)
    db_user = get_user_by_username(user["username"])
    if db_user:
        insert_snake_score(user_id=db_user.id, score=score)
        return JSONResponse({"message": "Score saved!"})
    return JSONResponse({"message": "User not found"}, status_code=404)
