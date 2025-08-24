from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_root_redirect():
    response = client.get("/")
    # Should follow redirect and land on /home
    assert response.status_code == 200
    assert "JS Games" in response.text

def test_home():
    response = client.get("/home")
    assert response.status_code == 200

def test_play_spelling_bee():
    response = client.get("/play/spelling-bee")
    assert response.status_code == 200
    assert "Spelling Bee" in response.text

def test_play_wordle():
    response = client.get("/play/wordle")
    assert response.status_code == 200
    assert "Wordle" in response.text

def test_play_sudoku():
    response = client.get("/play/sudoku")
    assert response.status_code == 200
    assert "Sudoku" in response.text

def test_play_2048():
    response = client.get("/play/2048")
    assert response.status_code == 200
    assert "2048" in response.text

def test_play_minesweeper():
    response = client.get("/play/minesweeper")
    assert response.status_code == 200
    assert "Minesweeper" in response.text

def test_play_snake():
    response = client.get("/play/snake")
    assert response.status_code == 200
    assert "Snake" in response.text

def test_play_connect_4():
    response = client.get("/play/connect-4")
    assert response.status_code == 200
    assert "Connect 4" in response.text