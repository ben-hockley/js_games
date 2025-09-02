import uvicorn

# FASTAPI
from fastapi import FastAPI
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from starlette.middleware.sessions import SessionMiddleware

# Import routers for each game
from routers.games.wordle import router as wordle_router
from routers.games.spelling_bee import router as spelling_bee_router
from routers.games.sudoku import router as sudoku_router
from routers.games.snake import router as snake_router
from routers.games.minesweeper import router as minesweeper_router
from routers.games.connect_4 import router as connect_4_router
from routers.games._2048 import router as _2048_router
from routers.games.bowling import router as bowling_router
# Import routers for menus
from routers.menus.home import router as home_router
from routers.menus.account import router as account_router
from routers.menus.signin import router as signin_router
from routers.menus.create_account import router as create_account_router

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

# Register routers for menus
app.include_router(home_router)
app.include_router(account_router)
app.include_router(signin_router)
app.include_router(create_account_router)
# Register routers for each game
app.include_router(wordle_router)
app.include_router(spelling_bee_router)
app.include_router(sudoku_router)
app.include_router(snake_router)
app.include_router(minesweeper_router)
app.include_router(connect_4_router)
app.include_router(_2048_router)
app.include_router(bowling_router)

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)