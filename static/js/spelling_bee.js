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

    // set the grid
    setRandomGrid();

    // find valid words
    validWords = findValidWords(randomLetters, randomLetters[0], window.englishWords);
    wordsFound = [];

    console.log("Letter set (First Letter is the Center Letter)")
    console.log(randomLetters);
    console.log("Valid Words:")
    console.log(validWords);

    document.getElementById("words-findable").textContent = validWords.length;
    document.getElementById("words-found").textContent = wordsFound.length;
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


// Example usage:
// let validWords = findValidWords(randomLetters, randomLetters[0], englishWords);
// console.log(validWords);