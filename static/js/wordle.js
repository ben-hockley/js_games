// get the list of words from the dictionary and filter it down to only 5 letter words to get all
// the valid guesses.
fetch('/static/lists/dictionary.json')
  .then(response => response.json())
  .then(data => {
    let wordsArr;
    if (typeof data === 'object' && !Array.isArray(data)) {
      wordsArr = Object.keys(data);
    } else {
      wordsArr = data;
    }
    window.fiveLetterWords = wordsArr.filter(word => word.length === 5);

    // Only start the game after the words are loaded
    startGame();
  });

function getRandomWord() {
  const randomIndex = Math.floor(Math.random() * window.fiveLetterWords.length);
  return window.fiveLetterWords[randomIndex];
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
      if (currentGuess.toLowerCase() === answer.toLowerCase()) {
        // Correct guess
        grid[currentSquare[0]].forEach(cell => cell.classList.remove("bg-light"));
        grid[currentSquare[0]].forEach(cell => cell.classList.add("bg-success"));
        alert("Congratulations! You've guessed the word!");
      } else {
        // Incorrect guess
        grid[currentSquare[0]].forEach((cell, index) => {
          cell.classList.remove("bg-light");
          if (currentGuess.toLowerCase()[index] === answer.toLowerCase()[index]) {
            cell.classList.add("bg-success");
          } else if (answer.toLowerCase().includes(cell.textContent.toLowerCase())) {
            cell.classList.add("bg-warning");
          } else {
            cell.classList.add("bg-danger");
          }
        });

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