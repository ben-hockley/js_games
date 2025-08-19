// List of words taken from scrabble game by benjamincrom et al. on github : 
// https://github.com/benjamincrom/scrabble
fetch('/static/lists/dictionary.json')
  .then(response => response.json())
  .then(data => {
    let wordsArr;
    if (typeof data === 'object' && !Array.isArray(data)) {
      wordsArr = Object.keys(data);
    } else {
      wordsArr = data;
    }
    window.englishWords = wordsArr.filter(word => word.length >= 4);
    startNewGame(); // Start the game only after dictionary is ready
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

// Variables used to hold the randomly generated letter list and corresponding list of valid words.
var randomLetters;
var validWords;
var wordsFound;

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
    
    wordsFound = [];

    document.getElementById("words-findable").textContent = validWords.length;
    document.getElementById("words-found").textContent = wordsFound.length;

    // Reset the words found list in the DOM
    updateWordsList();
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
        // if (w.length < 4) return false;
        if (!w.includes(center)) return false;
        // Every letter in word must be in letterSet
        for (let c of w) {
            if (!letterSet.has(c)) return false;
        }
        return true;
    });
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
            document.getElementById("words-found").textContent = wordsFound.length;
            updateWordsList(); // Update the DOM list
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

    // Click on hexagons
    document.querySelectorAll('.hexagon-center, .hexagon-outer').forEach(hex => {
        hex.onclick = function () {
            input.value += hex.textContent.trim();
        };
    });

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

// Call setupInputHandlers after DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    // Do nothing here; wait for dictionary to load
});