fetch('/static/lists/dictionary.json')
  .then(response => response.json())
  .then(data => {
    let wordsArr;
    if (typeof data === 'object' && !Array.isArray(data)) {
      wordsArr = Object.keys(data);
    } else {
      wordsArr = data;
    }

    // get a list of 5 letter words (including plurals) for guesses.
    window.fiveLetterWords = wordsArr.filter(word => word.length === 5);

    // get a list of 5 letter words (without plurals) for potential solutions.
    window.fiveLetterNonPluralWords = window.fiveLetterWords.filter(
      word => !word.endsWith('s')
    );
    // Only start the game after the words are loaded
    startGame();
  });

function getRandomWord() {
  // Pick a random word from the list of non-plural 5-letter words.
  const randomIndex = Math.floor(Math.random() * window.fiveLetterNonPluralWords.length);
  return window.fiveLetterNonPluralWords[randomIndex];
}

function getGridCells2D() {
  const rows = Array.from(document.querySelectorAll('#wordle-grid > .d-flex'));
  // Each row contains 5 .wordle-cell elements
  return rows.map(row => Array.from(row.querySelectorAll('.wordle-cell')));
}
// Example usage:
// const grid = getGridCells2D();
// grid[0][0] is the first cell, grid[5][4] is the last cell

const grid = getGridCells2D();

var answer;
var currentSquare = [0, 0]; // [Row, Column]

function startGame() {
  answer = getRandomWord();
  console.log(answer);

  currentSquare = [0, 0];
  document.querySelectorAll(".wordle-cell").forEach(element => {
    element.textContent = "";
    element.classList.remove("bg-success", "bg-danger", "bg-warning");
    element.classList.add("bg-light");
  });
}

function newGame() {
  startGame();
}

document.addEventListener('keydown', function(event) {

  // if key pressed = Letter
  if (event.key.length === 1 && event.key.match(/[a-z]/i)) {
    console.log(event.key.toUpperCase());

    if (currentSquare[1] < 5) {
      grid[currentSquare[0]][currentSquare[1]].textContent = event.key.toUpperCase();
      currentSquare[1]++;
    }
  }

  // if Backspace key pressed.
  if (event.key === 'Backspace') {
    if (currentSquare[1] > 0) {
      currentSquare[1]--;
      grid[currentSquare[0]][currentSquare[1]].textContent = "";
    }
  }

  // If Enter key pressed
  if (event.key === 'Enter') {
    const currentGuess = grid[currentSquare[0]].map(cell => cell.textContent).join('');
    console.log(currentGuess);

    if (currentGuess.length === 5) {
      if (!window.fiveLetterWords.includes(currentGuess.toLowerCase())) {
        alert("Invalid word!");
        return;
      }
      if (currentGuess.toLowerCase() === answer.toLowerCase()) {
        // Correct guess
        grid[currentSquare[0]].forEach(cell => cell.classList.remove("bg-light"));
        grid[currentSquare[0]].forEach(cell => cell.classList.add("bg-success"));
        alert("Congratulations! You've guessed the word!");
      } else {
        // Incorrect guess

        // Standard Wordle coloring logic
        const guess = currentGuess.toLowerCase();
        const ans = answer.toLowerCase();
        const rowCells = grid[currentSquare[0]];
        let answerLetterCounts = {};
        // First pass: mark greens and count answer letters
        for (let i = 0; i < 5; i++) {
          rowCells[i].classList.remove("bg-light", "bg-success", "bg-warning", "bg-danger");
          const a = ans[i];
          answerLetterCounts[a] = (answerLetterCounts[a] || 0) + 1;
        }
        // Track which letters are green
        let greenMask = Array(5).fill(false);
        for (let i = 0; i < 5; i++) {
          if (guess[i] === ans[i]) {
            rowCells[i].classList.add("bg-success");
            greenMask[i] = true;
            answerLetterCounts[guess[i]]--;
          }
        }
        // Second pass: mark yellows and reds
        for (let i = 0; i < 5; i++) {
          if (greenMask[i]) continue;
          const g = guess[i];
          if (answerLetterCounts[g] > 0) {
            rowCells[i].classList.add("bg-warning");
            answerLetterCounts[g]--;
          } else {
            rowCells[i].classList.add("bg-danger");
          }
        }

        // Move to next row
        currentSquare[0]++;
        currentSquare[1] = 0;

        // Check if we have more rows to fill
        if (currentSquare[0] >= grid.length) {
          alert(`Game over! The word was: ${answer}`);
        }
      }
    }
  }
});

// Example usage:
// const grid = getGridCells2D();
// grid[0][0] is the first cell, grid[5][4] is the last cell