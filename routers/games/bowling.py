from fastapi import APIRouter, Request, Depends
from fastapi.templating import Jinja2Templates
from fastapi.responses import JSONResponse

from services.bowling_service import insert_bowling_score, get_top_bowling_scores, get_user_top_bowling_scores
from services.user_service import get_user_by_username

templates = Jinja2Templates(directory="templates")
router = APIRouter()


@router.get("/play/bowling")
async def play_bowling(request: Request):
    user = request.session.get("user") if hasattr(request, "session") else None
    user = get_user_by_username(user["username"]) if user else None
    user_id = user.id if user else None
    top_scores = get_top_bowling_scores()
    user_scores = get_user_top_bowling_scores(user_id) if user_id else []
    return templates.TemplateResponse(
        "play/bowling.html",
        {
            "request": request,
            "top_scores": top_scores,
            "user_scores": user_scores,
        },
    )


@router.post("/bowling-score")
async def save_bowling_score(request: Request):
    user = request.session.get("user")
    if not user:
        return JSONResponse(
            {"message": "Sign in to save your scores"}, status_code=401
        )
    data = await request.json()
    score = data.get("score")
    if score is None:
        return JSONResponse({"message": "Invalid score"}, status_code=400)
    db_user = get_user_by_username(user["username"])
    if db_user:
        insert_bowling_score(user_id=db_user.id, score=score)
        return JSONResponse({"message": "Score saved!"})
    return JSONResponse({"message": "User not found"}, status_code=404)