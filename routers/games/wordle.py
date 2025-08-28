from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from fastapi.templating import Jinja2Templates
from database import get_user_by_username, insert_wordle_score

templates = Jinja2Templates(directory="templates")

router = APIRouter()

@router.get("/play/wordle")
async def play_wordle(request: Request):
    return templates.TemplateResponse(request, "play/wordle.html")

@router.post("/wordle-score")
async def wordle_score(request: Request):
    user = request.session.get("user")
    if not user:
        return JSONResponse({"message": "Sign in to save your scores"}, status_code=401)
    data = await request.json()
    score = data.get("score")
    if score is None:
        return JSONResponse({"message": "Invalid score"}, status_code=400)
    db_user = get_user_by_username(user["username"])
    if db_user:
        insert_wordle_score(user_id=db_user.id, score=score)
        return JSONResponse({"message": "Score saved!"})
    return JSONResponse({"message": "User not found"}, status_code=404)
