from fastapi import FastAPI, Request
import uvicorn
from fastapi.responses import RedirectResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles

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
    return templates.TemplateResponse("home.html", {"request": request})

@app.get("/play/spelling-bee")
async def play_spelling_bee(request: Request):
    return templates.TemplateResponse("play/spelling_bee.html", {"request": request})

@app.get("/play/wordle")
async def play_wordle(request: Request):
    return templates.TemplateResponse("play/wordle.html", {"request": request})

@app.get("/play/sudoku")
async def play_sudoku(request: Request):
    return templates.TemplateResponse("play/sudoku.html", {"request": request})

@app.get("/play/2048")
async def play_2048(request: Request):
    return templates.TemplateResponse("play/2048.html", {"request": request})

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)