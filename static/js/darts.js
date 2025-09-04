// Darts game logic
const canvas = document.getElementById('dartboard');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('start-game');
const nextTurnBtn = document.getElementById('next-turn');

const boardCenter = { x: canvas.width / 2, y: canvas.height / 2 };
const boardRadius = 200;


let gameState = 'idle'; // 'idle', 'horizontal', 'vertical', 'done'
let crosshair = { x: boardCenter.x, y: boardCenter.y };
let crosshairDir = 1;
let animationFrame;
let darts = [];

let currentTurn = 1;
let turnScore = 0;
let totalScore = 501;
let scoreLog = [];
let dartsThrown = 0;

const scoreCounter = document.getElementById('score-counter');
const scoreList = document.getElementById('score-list');

// Dartboard segment values (clockwise from top)
const segmentValues = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];

function drawBoard() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.save();
	ctx.translate(boardCenter.x, boardCenter.y);
	// ...existing code for board drawing...
	// Draw segments
	for (let i = 0; i < 20; i++) {
		const angle1 = ((i - 0.5) * Math.PI * 2) / 20;
		const angle2 = ((i + 0.5) * Math.PI * 2) / 20;
		ctx.beginPath();
		ctx.moveTo(0, 0);
		ctx.arc(0, 0, boardRadius, angle1, angle2);
		ctx.closePath();
		ctx.fillStyle = i % 2 === 0 ? '#222' : '#fff8dc';
		ctx.fill();
	}
	// Draw double ring
	for (let i = 0; i < 20; i++) {
		let dartScores = [];
		const angle1 = ((i - 0.5) * Math.PI * 2) / 20;
		const angle2 = ((i + 0.5) * Math.PI * 2) / 20;
		ctx.beginPath();
		ctx.arc(0, 0, boardRadius, angle1, angle2);
		ctx.arc(0, 0, boardRadius - 20, angle2, angle1, true);
		ctx.closePath();
		ctx.fillStyle = i % 2 === 0 ? '#e53935' : '#43a047';
		ctx.fill();
	}
	// Draw triple ring
	for (let i = 0; i < 20; i++) {
		const angle1 = ((i - 0.5) * Math.PI * 2) / 20;
		const angle2 = ((i + 0.5) * Math.PI * 2) / 20;
		ctx.beginPath();
		ctx.arc(0, 0, boardRadius - 60, angle1, angle2);
		ctx.arc(0, 0, boardRadius - 80, angle2, angle1, true);
		ctx.closePath();
		ctx.fillStyle = i % 2 === 0 ? '#e53935' : '#43a047';
		ctx.fill();
	}
	// Outer circle
	ctx.beginPath();
	ctx.arc(0, 0, boardRadius, 0, 2 * Math.PI);
	ctx.strokeStyle = '#333';
	ctx.lineWidth = 4;
	ctx.stroke();
	// Bullseye (outer, green background for 25)
	ctx.beginPath();
	ctx.arc(0, 0, 40, 0, 2 * Math.PI);
	ctx.fillStyle = '#43a047';
	ctx.fill();
	ctx.strokeStyle = '#43a047';
	ctx.lineWidth = 2;
	ctx.stroke();
	// Bullseye (inner, red foreground for 50)
	ctx.beginPath();
	ctx.arc(0, 0, 20, 0, 2 * Math.PI);
	ctx.fillStyle = '#e53935';
	ctx.fill();
	ctx.strokeStyle = '#333';
	ctx.lineWidth = 2;
	ctx.stroke();
	// Draw numbers clearly around the edge
	ctx.font = 'bold 32px Arial';
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	for (let i = 0; i < 20; i++) {
		const angle = ((i) * Math.PI * 2) / 20 - Math.PI / 2;
		// Place numbers just outside the double ring
		const x = Math.cos(angle) * (boardRadius + 40);
		const y = Math.sin(angle) * (boardRadius + 40);
		ctx.save();
		ctx.translate(x, y);
		// Draw outline for contrast
		ctx.strokeStyle = '#fff';
		ctx.lineWidth = 4;
		ctx.strokeText(segmentValues[i], 0, 0);
		ctx.fillStyle = '#222';
		ctx.fillText(segmentValues[i], 0, 0);
		ctx.restore();
	}
	ctx.restore();
	// Draw all darts
	darts.forEach(dart => drawDart(dart.x, dart.y));
}

function drawCrosshair() {
	ctx.save();
	ctx.strokeStyle = '#007bff';
	ctx.lineWidth = 2;
	// Horizontal line
	if (gameState === 'horizontal') {
		ctx.beginPath();
		ctx.moveTo(crosshair.x, 0);
		ctx.lineTo(crosshair.x, canvas.height);
		ctx.stroke();
	}
	// Vertical line
	if (gameState === 'vertical') {
		ctx.beginPath();
		ctx.moveTo(0, crosshair.y);
		ctx.lineTo(canvas.width, crosshair.y);
		ctx.stroke();
	}
	ctx.restore();
}

function drawDart(x, y) {
	ctx.save();
	ctx.strokeStyle = '#4169e1'; // Bright royal blue
	ctx.lineWidth = 5;
	// Draw X
	ctx.beginPath();
	ctx.moveTo(x - 12, y - 12);
	ctx.lineTo(x + 12, y + 12);
	ctx.moveTo(x + 12, y - 12);
	ctx.lineTo(x - 12, y + 12);
	ctx.stroke();
	ctx.restore();
}

function getScore(x, y) {
	// Convert to board coordinates
	const dx = x - boardCenter.x;
	const dy = y - boardCenter.y;
	const r = Math.sqrt(dx * dx + dy * dy);
	const angle = Math.atan2(dy, dx);
	let theta = angle < -Math.PI / 2 ? angle + 2 * Math.PI : angle;
	// Find segment
	let seg = Math.floor(((theta + Math.PI / 2) / (2 * Math.PI)) * 20 + 0.5) % 20;
	if (seg < 0) seg += 20;
	const value = segmentValues[seg];
	// Bullseye
	if (r <= 20) return 50;
	if (r <= 40) return 25;
	// Double ring
	if (r >= boardRadius - 20 && r <= boardRadius) return value * 2;
	// Triple ring
	if (r >= boardRadius - 80 && r <= boardRadius - 60) return value * 3;
	// Single
	if (r < boardRadius) return value;
	return 0;
}

// gets the score notation (e.g. T20, D19, 18, BULL, 25)
function getDartNotation(x, y) {
	// Convert to board coordinates
	const dx = x - boardCenter.x;
	const dy = y - boardCenter.y;
	const r = Math.sqrt(dx * dx + dy * dy);
	const angle = Math.atan2(dy, dx);
	let theta = angle < -Math.PI / 2 ? angle + 2 * Math.PI : angle;
	// Find segment
	let seg = Math.floor(((theta + Math.PI / 2) / (2 * Math.PI)) * 20 + 0.5) % 20;
	if (seg < 0) seg += 20;
	const value = segmentValues[seg];
	// Bullseye
	if (r <= 20) return "BULL";
	if (r <= 40) return "25";
	// Double ring
	if (r >= boardRadius - 20 && r <= boardRadius) return "D" + value;
	// Triple ring
	if (r >= boardRadius - 80 && r <= boardRadius - 60) return "T" + value;
	// Single
	if (r < boardRadius) return value.toString();
	return "0";
}

// Crosshair moves left/right to set horizontal position.
function animateHorizontal() {
	drawBoard();
	drawCrosshair();
	// Move crosshair left/right
	crosshair.x += crosshairDir * 4;
	if (crosshair.x > boardCenter.x + boardRadius) crosshairDir = -1;
	if (crosshair.x < boardCenter.x - boardRadius) crosshairDir = 1;
	animationFrame = requestAnimationFrame(animateHorizontal);
}

// Crosshair moves up/down to set vertical position.
function animateVertical() {
	drawBoard();
	drawCrosshair();
	// Move crosshair up/down
	crosshair.y += crosshairDir * 4;
	if (crosshair.y > boardCenter.y + boardRadius) crosshairDir = -1;
	if (crosshair.y < boardCenter.y - boardRadius) crosshairDir = 1;
	animationFrame = requestAnimationFrame(animateVertical);
}

function updateScoreCounter() {
	scoreCounter.textContent = 'Score: ' + totalScore;
}

function updateScoreList() {
	let html = '<strong>Score Log:</strong><br>';
	scoreLog.forEach((turn, index) => {
		html += `<strong>Turn ${index + 1}:</strong> ${turn.join(', ')}<br>`;
	});
	html += `<br><strong>Darts Thrown:</strong> ` + dartsThrown;
	average = (dartsThrown === 0) ? 0 : (501 - totalScore) / dartsThrown * 3;
	html += `(Avg: ` + average.toFixed(2) + `)`;
	scoreList.innerHTML = html;
}

function updateStartButtonText() {
    if (gameState === 'idle' || gameState === 'done') {
        startBtn.textContent = 'Start Game';
    } else {
        startBtn.textContent = 'Restart Game';
    }
}

function startGame() {
	gameState = 'horizontal';
	crosshair.x = boardCenter.x;
	crosshair.y = boardCenter.y;
	crosshairDir = 1;
	drawBoard();
	animationFrame = requestAnimationFrame(animateHorizontal);
	updateStartButtonText();
}

// Call this function after every game state change:
canvas.onclick = function (e) {
	if (gameState === 'horizontal') {
		// Stop horizontal, start vertical from current x
		cancelAnimationFrame(animationFrame);
		gameState = 'vertical';
		crosshairDir = 1;
		drawBoard();
		drawCrosshair();
		animationFrame = requestAnimationFrame(animateVertical);
	} else if (gameState === 'vertical') {
		// Stop vertical, mark dart
		cancelAnimationFrame(animationFrame);
		gameState = 'done';
		// Save dart
		darts.push({ x: crosshair.x, y: crosshair.y });
		drawBoard();
		// Calculate and log score
		const score = getScore(crosshair.x, crosshair.y);
		const dartNotation = getDartNotation(crosshair.x, crosshair.y)
		console.log(dartNotation)
		console.log('Dart Score:', score);
		// Save score before turn for bust logic
		if (currentTurn === 1) {
			window._scoreBeforeTurn = totalScore;
		}
		// Update turn score and total score
		turnScore += score;
		totalScore -= score;
		dartsThrown ++;
		// Bust logic (If score goes below 0 or is 1, you can't finish on a double from 1.)
		if (totalScore < 0 || totalScore === 1) {
			scoreLog[scoreLog.length - 1].push('BUST');
			totalScore = window._scoreBeforeTurn;
			updateScoreCounter();
			updateScoreList();
			darts = [];
			setTimeout(() => {
				drawBoard();
			}, 3000);
			currentTurn = 1;
			turnScore = 0;
			return;
		}

		// Win logic: check if score is exactly 0 and last dart is a double
		let isDouble = false;
		const dx = crosshair.x - boardCenter.x;
		const dy = crosshair.y - boardCenter.y;
		const r = Math.sqrt(dx * dx + dy * dy);
		if (r >= boardRadius - 20 && r <= boardRadius) isDouble = true;

		if (totalScore === 0) {
			if (isDouble) {
				scoreLog[scoreLog.length - 1].push(dartNotation);
				updateScoreList();
				updateScoreCounter();
				setTimeout(() => {
					alert('Game Over in ' + dartsThrown + ' darts!');
				}, 100);
				gameState = 'idle';
				updateStartButtonText();
				return;
			} else {
				// Bust Logic: must finish on a double.
				scoreLog[scoreLog.length - 1].push('BUST');
				totalScore = window._scoreBeforeTurn;
				updateScoreCounter();
				updateScoreList();
				darts = [];
				setTimeout(() => {
					drawBoard();
				}, 3000);
				currentTurn = 1;
				turnScore = 0;
				return;
			}
		}

		scoreLog[scoreLog.length - 1].push(dartNotation); // Log this dart's score
		updateScoreList();
		updateScoreCounter();
		// Check if turn is over
		if (currentTurn === 3) {
			console.log('Total Score for Turn:', turnScore);
			darts = [];
			setTimeout(() => {
				drawBoard();
			}, 3000);
			currentTurn = 1;
			turnScore = 0;
		} else {
			currentTurn++;
			startGame();
		}
	}
};


startBtn.onclick = function () {
	if (gameState === 'idle' || gameState === 'done') {
		darts = [];
		totalScore = 501;
		scoreLog = [];
		dartsThrown = 0;
		updateScoreCounter();
		updateScoreList();
		scoreLog.push([]);
		startGame();
	}
};

nextTurnBtn.onclick = function () {
	if (gameState === 'done') {
		scoreLog.push([]); // Start a new turn log
		startGame();
	}
};

// Initial draw
updateScoreCounter();
drawBoard();
