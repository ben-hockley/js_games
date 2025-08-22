// List of words taken from scrabble game by benjamincrom et al. on github : 
// https://github.com/benjamincrom/scrabble
fetch('/static/lists/dictionary.json')
  .then(response => response.json())
  .then(data => {
    // Convert object keys to array if needed
    let wordsArr;
    if (typeof data === 'object' && !Array.isArray(data)) {
      wordsArr = Object.keys(data);
    } else {
      wordsArr = data;
    }
    // Remove all words under 4 letters
    window.englishWords = wordsArr.filter(word => word.length >= 4);
    // Now you can use englishWords in your functions
  });

function getRandomLetters() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const result = [];
    while (result.length < 7) {
        const idx = Math.floor(Math.random() * letters.length);
        result.push(letters.splice(idx, 1)[0]);
    }
    return result;
}

function updateScoreBar() {
  const percent = maxScore > 0 ? Math.round((currentScore / maxScore) * 100) : 0;
  const bar = document.getElementById('score-progress');
  bar.style.width = percent + '%';
  bar.setAttribute('aria-valuenow', percent);
}

// Variables used to hold the randomly generated letter list and corresponding list of valid words.
var randomLetters;
var validWords;
var wordsFound;
var maxScore;
var currentScore;

function setRandomGrid() {
    // Set center hexagon to first letter (this letter must be used in any valid answers)
    const centerHex = document.querySelector('.hexagon-center');
    if (centerHex) {
        centerHex.textContent = randomLetters[0] || '';
    }
    // Set outer hexagons to the rest (these letters can be used in valid answers but are not required)
    const outerHexes = document.querySelectorAll('.hexagon-outer');
    outerHexes.forEach((hex, index) => {
        hex.textContent = randomLetters[index + 1] || '';
    });
}

function startNewGame() {
    randomLetters = getRandomLetters();

    setRandomGrid();
    validWords = findValidWords(randomLetters, randomLetters[0], window.englishWords);

    while (validWords.length === 0) {
        // If no valid words found, regenerate letters
        randomLetters = getRandomLetters();
        setRandomGrid();
        validWords = findValidWords(randomLetters, randomLetters[0], window.englishWords);
    }

    console.log("Valid Words:");
    console.log(validWords);

    // Calculate the maximum score obtainable based on the list of valid words.
    maxScore = getScore(validWords);
    console.log("Max Score: " + maxScore);

    // Reset the array of words found.
    wordsFound = [];
    currentScore = getScore(wordsFound);

    document.getElementById("words-findable").textContent = validWords.length;
    document.getElementById("words-found").textContent = wordsFound.length;
    document.getElementById("max-score").textContent = maxScore;
    document.getElementById("current-score").textContent = currentScore;

    // Reset the words found list in the DOM
    updateWordsList();
    updateScoreBar();
}

function shuffleGrid() {
    // Keep the center letter fixed, shuffle the rest
    const centerLetter = randomLetters[0];
    const outerLetters = randomLetters.slice(1);
    const shuffledOuter = outerLetters.sort(() => Math.random() - 0.5);
    randomLetters = [centerLetter, ...shuffledOuter];
    setRandomGrid();
}


function findValidWords(letters, centerLetter, dictionary) {
    const letterSet = new Set(letters.map(l => l.toLowerCase()));
    const center = centerLetter.toLowerCase();
    return dictionary.filter(word => {
        const w = word.toLowerCase();
        // The word MUST contain the center letter.
        if (!w.includes(center)) return false;
        // Every letter in word must be in letterSet
        for (let c of w) {
            if (!letterSet.has(c)) return false;
        }
        return true;
    });
}

// calculates the score based on a list of words.
// can be used to calculate the maximum score based on the array of all valid words
// or the current score based on the array of words found so far.
function getScore(validWords) {
    score = 0;
    validWords.forEach(word => {
        if (word.length === 4) {
            score += 1;
        } else {
            score += word.length;
        }
    })
    return score;
}

function handleWordSubmit() {
    const input = document.getElementById('current-word-input');
    const word = input.value.trim().toLowerCase();
    let message = '';
    if (!word) {
        input.value = '';
        return;
    }
    if (validWords && validWords.includes(word)) {
        if (wordsFound && wordsFound.includes(word)) {
            message = "This word has already been found";
        } else {
            wordsFound.push(word);
            currentScore = getScore(wordsFound)
            document.getElementById("words-found").textContent = wordsFound.length;
            document.getElementById("current-score").textContent = currentScore;
            updateWordsList(); // Update the DOM list
            updateScoreBar();
            message = "New word!";
        }
    } else {
        message = "Word not found";
    }
    alert(message);
    input.value = '';
}

// Update the words found list in the DOM
function updateWordsList() {
    const ul = document.getElementById('words-list');
    if (!ul) return;
    ul.innerHTML = '';
    wordsFound.forEach(word => {
        const li = document.createElement('li');
        li.textContent = word;
        ul.appendChild(li);
    });
}

function setupInputHandlers() {
    const input = document.getElementById('current-word-input');
    input.value = '';

    // Remove any previous keydown handler to prevent stacking
    if (window._spellingBeeKeydownHandler) {
        document.removeEventListener('keydown', window._spellingBeeKeydownHandler);
    }

    // Click on hexagons
    document.querySelectorAll('.hexagon-center, .hexagon-outer').forEach(hex => {
        hex.onclick = function () {
            input.value += hex.textContent.trim();
        };
    });

    // Keyboard input: allow only grid letters
    window._spellingBeeKeydownHandler = function (e) {
        // If focus is on input, let user type freely
        if (document.activeElement === input) {
            // If Enter is pressed, trigger submit
            if (e.key === "Enter") {
                e.preventDefault();
                const submitBtn = document.getElementById('submit-word-btn');
                if (submitBtn) submitBtn.click();
            }
            return;
        }
        // Only allow grid letters
        if (!randomLetters) return;
        const pressed = e.key.toUpperCase();
        if (randomLetters.includes(pressed)) {
            input.value += pressed;
        }
        // Enter triggers submit
        if (e.key === "Enter") {
            e.preventDefault();
            const submitBtn = document.getElementById('submit-word-btn');
            if (submitBtn) submitBtn.click();
        }
        // Backspace removes last letter
        if (e.key === "Backspace") {
            input.value = input.value.slice(0, -1);
        }
    };
    document.addEventListener('keydown', window._spellingBeeKeydownHandler);

    // Submit button
    const submitBtn = document.getElementById('submit-word-btn');
    if (submitBtn) {
        submitBtn.onclick = handleWordSubmit;
    }

    // Clear button
    const clearBtn = document.getElementById('clear-word-btn');
    if (clearBtn) {
        clearBtn.onclick = function() {
            document.getElementById('current-word-input').value = '';
        };
    }
}

// Call setupInputHandlers after DOM is loaded and after each new game/shuffle
document.addEventListener('DOMContentLoaded', function () {
    // Wait for dictionary to load before starting the game
    function tryStartGame() {
        if (window.englishWords && window.englishWords.length > 0) {
            startNewGame(); // Start a new game on load
        } else {
            setTimeout(tryStartGame, 50);
        }
    }
    tryStartGame();
});

// Re-setup handlers after new game or shuffle (since hexagons are re-rendered)
function setRandomGrid() {
    // Set center hexagon to first letter
    const centerHex = document.querySelector('.hexagon-center');
    if (centerHex) {
        centerHex.textContent = randomLetters[0] || '';
    }
    // Set outer hexagons to the rest
    const outerHexes = document.querySelectorAll('.hexagon-outer');
    outerHexes.forEach((hex, index) => {
        hex.textContent = randomLetters[index + 1] || '';
    });
    // Set up input handlers again
    setupInputHandlers();
}