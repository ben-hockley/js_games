function getRandomLetters() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const result = [];
    while (result.length < 7) {
        const idx = Math.floor(Math.random() * letters.length);
        result.push(letters.splice(idx, 1)[0]);
    }
    return result;
}

// Example usage:
var randomLetters = getRandomLetters();
console.log(randomLetters);

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
}

function shuffleGrid() {
    // Keep the center letter fixed, shuffle the rest
    const centerLetter = randomLetters[0];
    const outerLetters = randomLetters.slice(1);
    const shuffledOuter = outerLetters.sort(() => Math.random() - 0.5);
    randomLetters = [centerLetter, ...shuffledOuter];
    setRandomGrid();
}
