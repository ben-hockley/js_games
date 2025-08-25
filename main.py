
from fastapi import FastAPI, Request
import uvicorn
from fastapi.responses import RedirectResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
# Import database setup
from database import Base, engine

# Create all tables in the database (run once at startup)
Base.metadata.create_all(bind=engine)

app = FastAPI()

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

@app.get("/play/spelling-bee")
async def play_spelling_bee(request: Request):
    return templates.TemplateResponse(request, "play/spelling_bee.html")

@app.get("/play/wordle")
async def play_wordle(request: Request):
    return templates.TemplateResponse(request, "play/wordle.html")

@app.get("/play/sudoku")
async def play_sudoku(request: Request):
    return templates.TemplateResponse(request, "play/sudoku.html")

@app.get("/play/2048")
async def play_2048(request: Request):
    return templates.TemplateResponse(request, "play/2048.html")

@app.get("/play/minesweeper")
async def play_minesweeper(request: Request):
    return templates.TemplateResponse(request, "play/minesweeper.html")

@app.get("/play/snake")
async def play_snake(request: Request):
    return templates.TemplateResponse(request, "play/snake.html")

@app.get("/play/connect-4")
async def play_connect_4(request: Request):
    return templates.TemplateResponse(request, "play/connect_4.html")

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)