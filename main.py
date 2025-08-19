from fastapi import FastAPI, Request
import uvicorn
from fastapi.responses import RedirectResponse
from fastapi.templating import Jinja2Templates

app = FastAPI()

@app.get("/")
async def root():
    return RedirectResponse(url="/home")

templates = Jinja2Templates(directory="templates")

@app.get("/home")
async def home(request: Request):
    return templates.TemplateResponse("home.html", {"request": request})
    

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)