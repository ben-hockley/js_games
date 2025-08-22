// Connect 4 Game vs Computer
const ROWS = 6, COLS = 7;
let board, currentPlayer, gameOver;

function initConnect4() {
    board = Array.from({length: ROWS}, () => Array(COLS).fill(0)); // 0=empty, 1=player, 2=computer
    currentPlayer = 1;
    gameOver = false;
    renderConnect4();
    setMessage("Your turn! (Yellow)");
}

function renderConnect4() {
    const boardDiv = document.getElementById('connect4-board');
    boardDiv.innerHTML = '';
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const cell = document.createElement('div');
            cell.className = 'connect4-cell';
            if (board[r][c] === 1) cell.classList.add('player');
            if (board[r][c] === 2) cell.classList.add('computer');
            cell.dataset.col = c;
            // Allow clicking any cell in a column to drop a counter to the lowest available slot
            if (!gameOver && currentPlayer === 1 && getDropRow(c) !== -1) {
                cell.style.cursor = 'pointer';
                cell.onclick = () => playerMove(c);
            }
            boardDiv.appendChild(cell);
        }
    }

}

function getDropRow(col) {
    for (let r = ROWS - 1; r >= 0; r--) {
        if (board[r][col] === 0) return r;
    }
    return -1;
}

function playerMove(col) {
    if (gameOver) return;
    const row = getDropRow(col);
    if (row === -1) return;
    board[row][col] = 1;
    renderConnect4();
    if (checkWin(1)) {
        setMessage("You win!");
        gameOver = true;
        return;
    }
    if (isBoardFull()) {
        setMessage("It's a draw!");
        gameOver = true;
        return;
    }
    currentPlayer = 2;
    setTimeout(computerMove, 500);
}

function computerMove() {
    if (gameOver) return;
    // Simple AI: pick random valid column
    let validCols = [];
    for (let c = 0; c < COLS; c++) if (getDropRow(c) !== -1) validCols.push(c);
    if (validCols.length === 0) return;
    const col = validCols[Math.floor(Math.random() * validCols.length)];
    const row = getDropRow(col);
    board[row][col] = 2;
    renderConnect4();
    if (checkWin(2)) {
        setMessage("Computer wins!");
        gameOver = true;
        return;
    }
    if (isBoardFull()) {
        setMessage("It's a draw!");
        gameOver = true;
        return;
    }
    currentPlayer = 1;
    setMessage("Your turn! (Yellow)");
    renderConnect4();
}

function checkWin(player) {
    // Horizontal, vertical, diagonal checks
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (
                c + 3 < COLS &&
                board[r][c] === player &&
                board[r][c+1] === player &&
                board[r][c+2] === player &&
                board[r][c+3] === player
            ) return true;
            if (
                r + 3 < ROWS &&
                board[r][c] === player &&
                board[r+1][c] === player &&
                board[r+2][c] === player &&
                board[r+3][c] === player
            ) return true;
            if (
                r + 3 < ROWS && c + 3 < COLS &&
                board[r][c] === player &&
                board[r+1][c+1] === player &&
                board[r+2][c+2] === player &&
                board[r+3][c+3] === player
            ) return true;
            if (
                r - 3 >= 0 && c + 3 < COLS &&
                board[r][c] === player &&
                board[r-1][c+1] === player &&
                board[r-2][c+2] === player &&
                board[r-3][c+3] === player
            ) return true;
        }
    }
    return false;
}

function isBoardFull() {
    for (let c = 0; c < COLS; c++) if (board[0][c] === 0) return false;
    return true;
}

function setMessage(msg) {
    document.getElementById('connect4-message').textContent = msg;
}

document.getElementById('connect4-restart').onclick = initConnect4;

window.addEventListener('DOMContentLoaded', initConnect4);
