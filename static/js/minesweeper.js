const ROWS = 9, COLS = 9, MINES = 10;
let board, mineLocations, revealed, flagged, gameOver;

function initGame() {
  board = Array.from({length: ROWS}, () => Array(COLS).fill(0));
  revealed = Array.from({length: ROWS}, () => Array(COLS).fill(false));
  flagged = Array.from({length: ROWS}, () => Array(COLS).fill(false));
  mineLocations = [];
  gameOver = false;
  document.getElementById('game-message').textContent = '';
  placeMines();
  calculateNumbers();
  renderBoard();
  updateMinesLeft();
}

function placeMines() {
  let placed = 0;
  while (placed < MINES) {
    let r = Math.floor(Math.random() * ROWS);
    let c = Math.floor(Math.random() * COLS);
    if (board[r][c] === 'M') continue;
    board[r][c] = 'M';
    mineLocations.push([r, c]);
    placed++;
  }
}

function calculateNumbers() {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (board[r][c] === 'M') continue;
      let count = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          let nr = r + dr, nc = c + dc;
          if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && board[nr][nc] === 'M') count++;
        }
      }
      board[r][c] = count;
    }
  }
}

function renderBoard() {
  const boardDiv = document.getElementById('minesweeper-board');
  boardDiv.innerHTML = '';
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = document.createElement('button');
      cell.className = 'minesweeper-cell';
      cell.dataset.row = r;
      cell.dataset.col = c;
      if (revealed[r][c]) {
        cell.classList.add('revealed');
        if (board[r][c] === 'M') {
          cell.classList.add('mine');
          cell.textContent = '💣';
        } else if (board[r][c] > 0) {
          cell.textContent = board[r][c];
          cell.style.color = getNumberColor(board[r][c]);
        }
      } else if (flagged[r][c]) {
        cell.classList.add('flagged');
        cell.textContent = '🚩';
      }
      cell.oncontextmenu = (e) => { e.preventDefault(); flagCell(r, c); };
      cell.onclick = () => revealCell(r, c);
      boardDiv.appendChild(cell);
    }
  }
}

function getNumberColor(n) {
  const colors = ['#1976d2', '#388e3c', '#d32f2f', '#7b1fa2', '#fbc02d', '#0288d1', '#c2185b', '#388e3c'];
  return colors[n - 1] || '#333';
}

function revealCell(r, c) {
  if (gameOver || revealed[r][c] || flagged[r][c]) return;
  revealed[r][c] = true;
  if (board[r][c] === 'M') {
    gameOver = true;
    revealAllMines();
    document.getElementById('game-message').textContent = 'Game Over!';
  } else if (board[r][c] === 0) {
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        let nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) revealCell(nr, nc);
      }
    }
  }
  renderBoard();
  if (checkWin()) {
    gameOver = true;
    document.getElementById('game-message').textContent = 'You Win!';
    revealAllMines(true);
  }
}

function flagCell(r, c) {
  if (gameOver || revealed[r][c]) return;
  flagged[r][c] = !flagged[r][c];
  updateMinesLeft();
  renderBoard();
}

function revealAllMines(win = false) {
  for (const [r, c] of mineLocations) {
    revealed[r][c] = true;
  }
  renderBoard();
}

function checkWin() {
  let safeCells = ROWS * COLS - MINES;
  let revealedCount = 0;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (revealed[r][c] && board[r][c] !== 'M') revealedCount++;
    }
  }
  return revealedCount === safeCells;
}

function updateMinesLeft() {
  let flags = 0;
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) if (flagged[r][c]) flags++;
  document.getElementById('mines-left').textContent = `Mines: ${MINES - flags}`;
}

document.getElementById('reset-btn').onclick = initGame;

initGame();