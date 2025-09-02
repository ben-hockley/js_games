from fastapi import APIRouter, Request
from fastapi.responses import RedirectResponse
from fastapi.templating import Jinja2Templates
from database import (get_user_by_username, get_user_wordle_score_distribution,
                        get_top_snake_scores, get_user_top_snake_scores,
                        get_top_2048_scores, get_user_top_2048_scores,
                        get_top_bowling_scores, get_user_top_bowling_scores)

templates = Jinja2Templates(directory="templates")

router = APIRouter()

@router.get("/account")
async def account(request: Request):
    user = request.session.get("user")
    if not user:
        return RedirectResponse(url="/signin")
    db_user = get_user_by_username(user["username"])
    score_freq = {}
    top_snake_scores = []
    user_snake_scores = []
    top_2048_scores = []
    user_2048_scores = []
    top_bowling_scores = []
    user_bowling_scores = []
    if db_user:
        score_freq = get_user_wordle_score_distribution(db_user.id)
        top_snake_scores = get_top_snake_scores()
        user_snake_scores = get_user_top_snake_scores(db_user.id)
        top_2048_scores = get_top_2048_scores()
        user_2048_scores = get_user_top_2048_scores(db_user.id)
        top_bowling_scores = get_top_bowling_scores()
        user_bowling_scores = get_user_top_bowling_scores(db_user.id)
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
            "top_bowling_scores": top_bowling_scores,
            "user_bowling_scores": user_bowling_scores,
        },
    )
