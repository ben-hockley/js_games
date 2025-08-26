
const size = 4;
let board = [];
let cells = [];
let score = 0;

function initBoard() {
    board = Array(size * size).fill(0);
    score = 0;
    addRandomTile();
    addRandomTile();
    updateBoard();
    updateScore();
}

function addRandomTile() {
    let empty = [];
    for (let i = 0; i < board.length; i++) {
        if (board[i] === 0) empty.push(i);
    }
    if (empty.length === 0) return;
    let idx = empty[Math.floor(Math.random() * empty.length)];
    board[idx] = Math.random() < 0.9 ? 2 : 4;
}

function updateBoard() {
    for (let i = 0; i < board.length; i++) {
        cells[i].textContent = board[i] === 0 ? "" : board[i];
        cells[i].style.background = getTileColor(board[i]);
        cells[i].style.color = board[i] > 4 ? "#f9f6f2" : "#776e65";
    }
    updateScore();
}

function updateScore() {
    // Score is the sum of all merged tiles (standard 2048 scoring)
    // We'll keep a running total in the move logic
    const scoreElem = document.getElementById("score-value");
    if (scoreElem) scoreElem.textContent = score;
}

function getTileColor(val) {
    const colors = {
        0: "#cdc1b4", 2: "#eee4da", 4: "#ede0c8", 8: "#f2b179",
        16: "#f59563", 32: "#f67c5f", 64: "#f65e3b", 128: "#edcf72",
        256: "#edcc61", 512: "#edc850", 1024: "#edc53f", 2048: "#edc22e"
    };
    return colors[val] || "#3c3a32";
}

function move(dir) {
    let moved = false;
    let merged = Array(size * size).fill(false);

    function index(row, col) { return row * size + col; }

    function slide(row, col, dRow, dCol) {
        let curr = index(row, col);
        if (board[curr] === 0) return false;
        let nextRow = row + dRow, nextCol = col + dCol;
        while (
            nextRow >= 0 && nextRow < size &&
            nextCol >= 0 && nextCol < size
        ) {
            let next = index(nextRow, nextCol);
            if (board[next] === 0) {
                board[next] = board[curr];
                board[curr] = 0;
                curr = next;
                row = nextRow;
                col = nextCol;
                nextRow += dRow;
                nextCol += dCol;
                moved = true;
            } else if (
                board[next] === board[curr] &&
                !merged[next] && !merged[curr]
            ) {
                board[next] *= 2;
                score += board[next]; // Add merged value to score
                board[curr] = 0;
                merged[next] = true;
                moved = true;
                break;
            } else {
                break;
            }
        }
    }

    if (dir === "left") {
        for (let row = 0; row < size; row++) {
            for (let col = 1; col < size; col++) {
                slide(row, col, 0, -1);
            }
        }
    } else if (dir === "right") {
        for (let row = 0; row < size; row++) {
            for (let col = size - 2; col >= 0; col--) {
                slide(row, col, 0, 1);
            }
        }
    } else if (dir === "up") {
        for (let col = 0; col < size; col++) {
            for (let row = 1; row < size; row++) {
                slide(row, col, -1, 0);
            }
        }
    } else if (dir === "down") {
        for (let col = 0; col < size; col++) {
            for (let row = size - 2; row >= 0; row--) {
                slide(row, col, 1, 0);
            }
        }
    }

    if (moved) {
        addRandomTile();
        updateBoard();
        if (isGameOver()) {
            setTimeout(() => {
                alert("Game Over!");
                // Send POST request to /2048-scores with the score
                fetch('/2048-score', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ score: score })
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to save score');
                    }
                    // Optionally handle success
                })
                .catch(error => {
                    // Optionally handle error
                    console.error(error);
                });
            }, 100);
        }
    }
}

function isGameOver() {
    for (let i = 0; i < board.length; i++) {
        if (board[i] === 0) return false;
        let row = Math.floor(i / size), col = i % size;
        if (col < size - 1 && board[i] === board[i + 1]) return false;
        if (row < size - 1 && board[i] === board[i + size]) return false;
    }
    return true;
}

document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") move("left");
    else if (e.key === "ArrowRight") move("right");
    else if (e.key === "ArrowUp") move("up");
    else if (e.key === "ArrowDown") move("down");
});

window.addEventListener("DOMContentLoaded", () => {
    cells = Array.from(document.querySelectorAll(".grid-cell"));
    initBoard();
});
