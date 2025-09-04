// Darts game logic
const canvas = document.getElementById('dartboard');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('start-game');
const nextDartBtn = document.getElementById('next-dart');

const boardCenter = { x: canvas.width / 2, y: canvas.height / 2 };
const boardRadius = 200;


let gameState = 'idle'; // 'idle', 'horizontal', 'vertical', 'done'
let crosshair = { x: boardCenter.x, y: boardCenter.y };
let crosshairDir = 1;
let animationFrame;
let darts = [];

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

function animateHorizontal() {
	drawBoard();
	drawCrosshair();
	// Move crosshair left/right
	crosshair.x += crosshairDir * 4;
	if (crosshair.x > boardCenter.x + boardRadius) crosshairDir = -1;
	if (crosshair.x < boardCenter.x - boardRadius) crosshairDir = 1;
	animationFrame = requestAnimationFrame(animateHorizontal);
}

function animateVertical() {
	drawBoard();
	drawCrosshair();
	// Move crosshair up/down
	crosshair.y += crosshairDir * 4;
	if (crosshair.y > boardCenter.y + boardRadius) crosshairDir = -1;
	if (crosshair.y < boardCenter.y - boardRadius) crosshairDir = 1;
	animationFrame = requestAnimationFrame(animateVertical);
}

function startGame() {
	gameState = 'horizontal';
	crosshair.x = boardCenter.x;
	crosshair.y = boardCenter.y;
	crosshairDir = 1;
	drawBoard();
	animationFrame = requestAnimationFrame(animateHorizontal);
}

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
		console.log('Dart Score:', score);
		alert('Dart Score: ' + score);
	}
};


startBtn.onclick = function () {
	if (gameState === 'idle' || gameState === 'done') {
		darts = [];
		startGame();
	}
};

nextDartBtn.onclick = function () {
	if (gameState === 'done') {
		startGame();
	}
};

// Initial draw
drawBoard();
