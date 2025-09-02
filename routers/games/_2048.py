from fastapi import APIRouter, Request
from fastapi.templating import Jinja2Templates
from fastapi.responses import JSONResponse

from services.service_2048 import insert_2048_score, get_top_2048_scores
from services.user_service import get_user_by_username

templates = Jinja2Templates(directory="templates")

router = APIRouter()

@router.get("/play/2048")
async def play_2048(request: Request):
    leaderboard = get_top_2048_scores()
    return templates.TemplateResponse(request, "play/2048.html", {"request": request, "leaderboard": leaderboard})

@router.post("/2048-score")
async def save_2048_score(request: Request):
    user = request.session.get("user")
    if not user:
        return JSONResponse({"message": "Sign in to save your scores"}, status_code=401)
    data = await request.json()
    score = data.get("score")
    if score is None:
        return JSONResponse({"message": "Invalid score"}, status_code=400)
    db_user = get_user_by_username(user["username"])
    if db_user:
        insert_2048_score(user_id=db_user.id, score=score)
        return JSONResponse({"message": "Score saved!"})
    return JSONResponse({"message": "User not found"}, status_code=404)
