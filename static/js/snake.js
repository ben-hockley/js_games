// Snake Game
const BOARD_SIZE = 20;
const boardDiv = document.createElement('div');
let snake, direction, food, score, interval, gameOver;

function initSnakeGame() {
    snake = [{x: 10, y: 10}];
    direction = {x: 0, y: -1};
    food = randomFood();
    score = 0;
    gameOver = false;
    clearInterval(interval);
    renderBoard();
    updateScore();
    document.getElementById('game-message').textContent = '';
    interval = setInterval(gameLoop, 120);
}

function renderBoard() {
    const board = document.getElementById('snake-board');
    board.innerHTML = '';
    for (let y = 0; y < BOARD_SIZE; y++) {
        for (let x = 0; x < BOARD_SIZE; x++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            if (snake.some(s => s.x === x && s.y === y)) {
                cell.classList.add('snake');
            } else if (food.x === x && food.y === y) {
                cell.classList.add('food');
            }
            board.appendChild(cell);
        }
    }
}

function gameLoop() {
    if (gameOver) return;
    const head = {x: snake[0].x + direction.x, y: snake[0].y + direction.y};
    // Check collision
    if (
        head.x < 0 || head.x >= BOARD_SIZE ||
        head.y < 0 || head.y >= BOARD_SIZE ||
        snake.some(s => s.x === head.x && s.y === head.y)
    ) {
        document.getElementById('game-message').textContent = 'Game Over!';
        gameOver = true;
        clearInterval(interval);
        return;
    }
    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
        score++;
        updateScore();
        food = randomFood();
    } else {
        snake.pop();
    }
    renderBoard();
}

function randomFood() {
    let pos;
    do {
        pos = {
            x: Math.floor(Math.random() * BOARD_SIZE),
            y: Math.floor(Math.random() * BOARD_SIZE)
        };
    } while (snake && snake.some(s => s.x === pos.x && s.y === pos.y));
    return pos;
}

function updateScore() {
    document.getElementById('score').textContent = `Score: ${score}`;
}

document.addEventListener('keydown', e => {
    if (gameOver) return;
    if (e.key === 'ArrowUp' && direction.y !== 1) direction = {x: 0, y: -1};
    else if (e.key === 'ArrowDown' && direction.y !== -1) direction = {x: 0, y: 1};
    else if (e.key === 'ArrowLeft' && direction.x !== 1) direction = {x: -1, y: 0};
    else if (e.key === 'ArrowRight' && direction.x !== -1) direction = {x: 1, y: 0};
});

window.addEventListener('DOMContentLoaded', () => {
    // Add score and board if not present (for template integration)
    if (!document.getElementById('score')) {
        const scoreDiv = document.createElement('div');
        scoreDiv.id = 'score';
        document.body.prepend(scoreDiv);
    }
    if (!document.getElementById('snake-board')) {
        boardDiv.id = 'snake-board';
        document.body.appendChild(boardDiv);
    }
    if (!document.getElementById('restart-btn')) {
        const btn = document.createElement('button');
        btn.id = 'restart-btn';
        btn.textContent = 'Restart';
        btn.className = 'btn btn-success mt-3 d-none';
        document.body.appendChild(btn);
    }
    if (!document.getElementById('start-btn')) {
        const btn = document.createElement('button');
        btn.id = 'start-btn';
        btn.textContent = 'Start Game';
        btn.className = 'btn btn-primary mt-3';
        document.body.appendChild(btn);
    }
    if (!document.getElementById('game-message')) {
        const msg = document.createElement('div');
        msg.id = 'game-message';
        document.body.appendChild(msg);
    }
    // Do not start game automatically
    document.getElementById('start-btn').onclick = () => {
        document.getElementById('start-btn').classList.add('d-none');
        document.getElementById('restart-btn').classList.remove('d-none');
        initSnakeGame();
    };
    document.getElementById('restart-btn').onclick = initSnakeGame;
});
