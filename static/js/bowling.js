// Bowling Alley Game Logic
// Draws a horizontal alley, ball, arrow, and pins. Handles aiming and ball movement.

var currentFrame = 0;
var currentTurn = 0;

const canvas = document.getElementById('bowling-canvas');
const ctx = canvas.getContext('2d');

// Responsive canvas size
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = 360;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Game constants
const NUM_FRAMES = 10;
const alleyPadding = 0; // No padding, alley is full width
const gutterWidth = 40; // px, width of each gutter
const ballRadius = 22;
const pinRadius = 22; // Larger pins
const pinRows = [1, 2, 3, 4]; // 10 pins
const pinSpacing = 60; // Larger spacing for wider alley
const alleyTop = gutterWidth;
const alleyBottom = canvas.height - gutterWidth;
const ballStartX = ballRadius + 10;
const ballStartY = canvas.height / 2;
const pinStartX = canvas.width - (pinSpacing * 3) - ballRadius - 10;
const pinStartY = canvas.height / 2;

// Ball state
let ball = {
    x: ballStartX,
    y: ballStartY,
    vx: 0,
    vy: 0,
    moving: false,
    canBowl: true
};

// Arrow state
let arrowAngle = 0; // 0deg (up/12 o'clock)
let arrowDir = 1; // 1 or -1
const arrowMin = 0; // 0deg (12 o'clock)
const arrowMax = Math.PI; // 180deg (6 o'clock)
const arrowSpeed = 1.2; // radians/sec

// Pin positions (standard triangle, front pin centered, fills width)
function getPinPositions() {
    let pins = [];
    const rows = 4;
    const spacing = pinSpacing;
    // Center triangle horizontally, fill alley vertically
    const startX = canvas.width - (rows - 1) * spacing - ballRadius - 10;
    const centerY = canvas.height / 2;
    for (let r = 0; r < rows; r++) {
        let pinsInRow = r + 1;
        let x = startX + r * spacing;
        let rowHeight = (pinsInRow - 1) * spacing;
        for (let i = 0; i < pinsInRow; i++) {
            let y = centerY - rowHeight / 2 + i * spacing;
            pins.push({ x, y, knocked: false });
        }
    }
    return pins;
}
let pins = getPinPositions();

// --- Scoring Logic ---
let scorecard = Array.from({ length: NUM_FRAMES }, () => ({ rolls: [], score: null }));
function calculateScore() {
    let total = 0;
    let rollIndex = 0;
    let rolls = [];
    for (let f = 0; f < NUM_FRAMES; f++) {
        rolls = rolls.concat(scorecard[f].rolls);
    }
    let frameScores = [];
    for (let frame = 0; frame < NUM_FRAMES; frame++) {
        if (frame < 9) {
            let first = rolls[rollIndex] || 0;
            let second = rolls[rollIndex+1] || 0;
            let third = rolls[rollIndex+2] || 0;
            if (first === 10) { // Strike
                let frameScore = 10 + second + third;
                total += frameScore;
                frameScores[frame] = total;
                rollIndex += 1;
            } else if (first + second === 10) { // Spare
                let frameScore = 10 + third;
                total += frameScore;
                frameScores[frame] = total;
                rollIndex += 2;
            } else {
                let frameScore = first + second;
                total += frameScore;
                frameScores[frame] = total;
                rollIndex += 2;
            }
        } else {
            // 10th frame
            let first = rolls[rollIndex] || 0;
            let second = rolls[rollIndex+1] || 0;
            let third = rolls[rollIndex+2] || 0;
            let frameScore = first + second + third;
            total += frameScore;
            frameScores[frame] = total;
        }
    }
    // Attach frame scores to scorecard for display
    for (let i = 0; i < NUM_FRAMES; i++) {
        scorecard[i].score = frameScores[i] || null;
    }
    return total;
}

// Animation loop
let lastTime = null;
function drawGame(ts) {
    if (!lastTime) lastTime = ts;
    const dt = (ts - lastTime) / 1000;
    lastTime = ts;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw alley
    ctx.fillStyle = '#e0c097';
    ctx.fillRect(0, alleyTop, canvas.width, alleyBottom - alleyTop);
    // Draw gutters
    ctx.fillStyle = '#888';
    ctx.fillRect(0, 0, canvas.width, gutterWidth); // Top gutter
    ctx.fillRect(0, canvas.height - gutterWidth, canvas.width, gutterWidth); // Bottom gutter

    // Draw pins
    for (let i = 0; i < pins.length; i++) {
        if (pins[i].knocked) continue;
        ctx.save();
        ctx.beginPath();
        ctx.arc(pins[i].x, pins[i].y, pinRadius, 0, 2 * Math.PI);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#b88';
        ctx.stroke();
        // Draw pin index (1-based)
        ctx.fillStyle = '#222';
        ctx.font = `${pinRadius + 4}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText((i).toString(), pins[i].x, pins[i].y);
        ctx.restore();
    }

    // Draw ball
    ctx.save();
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ballRadius, 0, 2 * Math.PI);
    ctx.fillStyle = '#4444cc';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#222';
    ctx.stroke();
    ctx.restore();

    // Draw arrow (if not moving)
    if (!ball.moving && ball.canBowl) {
        ctx.save();
        ctx.translate(ball.x, ball.y);
        ctx.rotate(arrowAngle);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -48); // Arrow points up at 0deg
        ctx.lineTo(-8, -38);
        ctx.moveTo(0, -48);
        ctx.lineTo(8, -38);
        ctx.strokeStyle = '#ff3333';
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.restore();
    }

    // Animate arrow
    if (!ball.moving) {
        arrowAngle += arrowDir * arrowSpeed * dt;
        if (arrowAngle > arrowMax) { arrowAngle = arrowMax; arrowDir = -1; }
        if (arrowAngle < arrowMin) { arrowAngle = arrowMin; arrowDir = 1; }
    }

    // Move ball
    if (ball.moving) {
        ball.x += ball.vx * dt;
        ball.y += ball.vy * dt;
        // Check for gutter collision
        if (!ball.inGutter && (ball.y - ballRadius < gutterWidth || ball.y + ballRadius > canvas.height - gutterWidth)) {
            // Ball enters gutter
            ball.inGutter = true;
            // Center in gutter (inside the gutter, not on top)
            if (ball.y < canvas.height / 2) {
                ball.y = gutterWidth / 2;
            } else {
                ball.y = canvas.height - gutterWidth / 2;
            }
            ball.vy = 0; // Only roll horizontally
        }
        // If in gutter, keep y fixed
        if (ball.inGutter) {
            // y stays at gutter center
            if (ball.y < canvas.height / 2) {
                ball.y = gutterWidth / 2;
            } else {
                ball.y = canvas.height - gutterWidth / 2;
            }
        }
        for (let i = 0; i < pins.length; i++) {
            if (pins[i].knocked) continue;
            let dx = ball.x - pins[i].x;
            let dy = ball.y - pins[i].y;
            // Pythagoras Theorem
            let dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < ballRadius + pinRadius) {
                // Knock over this pin by ball
                console.log("Knocked Over Pin:", i);
                console.log("Distance to Pin:", dist);
                pins[i].knocked = true;
                // Ball trajectory is NOT affected
            }
        }
        // Stop at end of alley
        if (ball.x > canvas.width - ballRadius) {
            ball.x = canvas.width - ballRadius;
            ball.vx = 0;
            ball.vy = 0;
            ball.moving = false;
            ball.inGutter = false;
            // Remove arrow and prevent rebowl
            ball.canBowl = false;
            // Pins knocked over by other falling pins - run once after ball stops
            if (!drawGame.knockChecked && !ball.moving) {
                // Check for pin collisions
                // Pin Formation (by index in pins)
                //    0   (row 1)
                //   1 2   (row 2)
                //  3 4 5   (row 3)
                // 6 7 8 9   (row 4)
                // Process : Knock check row 2 -> Knock check row 3 -> Knock check row 4
                // Knock check row 2

                // PIN 0
                if (pins[0].knocked && !pins[1].knocked) {
                    // If pin 0 knocked, 50% chance to knock 1
                    if (Math.random() < 0.5) {
                        pins[1].knocked = true;
                        console.log("Knocked Over Pin: 1, by falling pin 0");
                    }
                }
                if (pins[0].knocked && !pins[2].knocked) {
                    // If pin 0 knocked, 50% chance to knock 2
                    if (Math.random() < 0.5) {
                        pins[2].knocked = true;
                        console.log("Knocked Over Pin: 2, by falling pin 0");
                    }
                }
                // Knock check row 3

                // PIN 1
                if (pins[1].knocked && !pins[3].knocked) {
                    // If pin 1 knocked, 50% chance to knock 3
                    if (Math.random() < 0.5) {
                        pins[3].knocked = true;
                        console.log("Knocked Over Pin: 3, by falling pin 1");
                    }
                }
                if (pins[1].knocked && !pins[4].knocked) {
                    // If pin 1 knocked, 50% chance to knock 4
                    if (Math.random() < 0.5) {
                        pins[4].knocked = true;
                        console.log("Knocked Over Pin: 4, by falling pin 1");
                    }
                }

                // PIN 2
                if (pins[2].knocked && !pins[4].knocked) {
                    // If pin 2 knocked, 50% chance to knock 4
                    if (Math.random() < 0.5) {
                        pins[4].knocked = true;
                        console.log("Knocked Over Pin: 4, by falling pin 2");
                    }
                }
                if (pins[2].knocked && !pins[5].knocked) {
                    // If pin 2 knocked, 50% chance to knock 5
                    if (Math.random() < 0.5) {
                        pins[5].knocked = true;
                        console.log("Knocked Over Pin: 5, by falling pin 2");
                    }
                }
                // Knock check row 4

                // PIN 3
                if (pins[3].knocked && !pins[6].knocked) {
                    // If pin 3 knocked, 50% chance to knock 6
                    if (Math.random() < 0.5) {
                        pins[6].knocked = true;
                        console.log("Knocked Over Pin: 6, by falling pin 3");
                    }
                }
                if (pins[3].knocked && !pins[7].knocked) {
                    // If pin 3 knocked, 50% chance to knock 7
                    if (Math.random() < 0.5) {
                        pins[7].knocked = true;
                        console.log("Knocked Over Pin: 7, by falling pin 3");
                    }
                }

                // PIN 4
                if (pins[4].knocked && !pins[7].knocked) {
                    // If pin 4 knocked, 50% chance to knock 7
                    if (Math.random() < 0.5) {
                        pins[7].knocked = true;
                        console.log("Knocked Over Pin: 8, by falling pin 4");
                    }
                }
                if (pins[4].knocked && !pins[8].knocked) {
                    // If pin 4 knocked, 50% chance to knock 8
                    if (Math.random() < 0.5) {
                        pins[8].knocked = true;
                        console.log("Knocked Over Pin: 8, by falling pin 4");
                    }
                }

                // PIN 5
                if (pins[5].knocked && !pins[8].knocked) {
                    // If pin 5 knocked, 50% chance to knock 8
                    if (Math.random() < 0.5) {
                        pins[8].knocked = true;
                        console.log("Knocked Over Pin: 8, by falling pin 5");
                    }
                }
                if (pins[5].knocked && !pins[9].knocked) {
                    // If pin 5 knocked, 50% chance to knock 9
                    if (Math.random() < 0.5) {
                        pins[9].knocked = true;
                        console.log("Knocked Over Pin: 9, by falling pin 5");
                    }
                }
                drawGame.knockChecked = true;
            }
            // After Knock checks complete, check how many pins have fallen.
            noOfPinsDown = pins.filter(pin => pin.knocked).length;
            console.log(`Number of Pins Down: ${noOfPinsDown}`);
            // Update the scorecard
            // Wait 5 seconds, then reset
            
            updateScorecard(currentFrame, [noOfPinsDown]);
            console.log(currentTurn)
            if (currentTurn == 1) {
                currentFrame++;
                currentTurn = 0
                setTimeout(resetBallAndPins,5000)
            } else {
                // Wait 5 seconds, then reset
                setTimeout(resetBall, 5000);
                currentTurn += 1;
            }
        }
    }
    requestAnimationFrame(drawGame);
}

requestAnimationFrame(drawGame);

// --- Scorecard UI ---
function drawScorecard() {
    let container = document.getElementById('scorecard-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'scorecard-container';
        container.style.margin = '24px auto';
        container.style.width = 'fit-content';
        container.style.background = '#222';
        container.style.color = '#fff';
        container.style.padding = '12px 18px';
        container.style.borderRadius = '8px';
        container.style.fontFamily = 'monospace';
        container.style.fontSize = '18px';
        document.body.appendChild(container);
    }
    let html = '<table style="border-collapse:collapse;"><tr>';
    for (let i = 0; i < NUM_FRAMES; i++) {
        html += `<th style='border:1px solid #888;padding:4px 8px;'>${i+1}</th>`;
    }
    html += '<th style="border:1px solid #888;padding:4px 8px;">Total</th></tr><tr>';
    for (let i = 0; i < NUM_FRAMES; i++) {
        let rolls = scorecard[i].rolls;
        let disp = '';
        for (let j = 0; j < (i === 9 ? 3 : 2); j++) {
            if (rolls[j] === undefined) disp += '&nbsp;';
            else if (rolls[j] === 10 && j === 0) disp += 'X';
            else if (j > 0 && rolls[j-1] + rolls[j] === 10 && rolls[j] !== undefined) disp += '/';
            else disp += rolls[j];
            if (j < (i === 9 ? 2 : 1)) disp += ' ';
        }
        // Show frame score below rolls
        let scoreDisp = scorecard[i].score !== null ? `<div style='font-size:14px;color:#ffd700;'>${scorecard[i].score}</div>` : '';
        html += `<td style='border:1px solid #888;padding:4px 8px;text-align:center;'>${disp}${scoreDisp}</td>`;
    }
    // Running total
    let total = calculateScore();
    html += `<td style='border:1px solid #888;padding:4px 8px;text-align:center;font-weight:bold;'>${total}</td></tr></table>`;
    container.innerHTML = html;
}

function updateScorecard(frame, rolls) {
    if (frame < 0 || frame >= NUM_FRAMES) return;
    scorecard[frame].rolls = rolls;
    scorecard[frame].score = calculateScore(frame);
    drawScorecard();
}

drawScorecard();

// Launch ball on click/touch
function launchBall() {
    if (ball.moving || !ball.canBowl) return;
    const speed = 700; // px/sec
    ball.vx = Math.sin(arrowAngle) * speed;
    ball.vy = -Math.cos(arrowAngle) * speed;
    ball.moving = true;
    ball.inGutter = false;
    ball.canBowl = false;
}
canvas.addEventListener('mousedown', launchBall);
canvas.addEventListener('touchstart', function(e) { e.preventDefault(); launchBall(); });

// Reset ball when stopped
function resetBall(){
    ball.x = ballRadius + 10;
    ball.y = canvas.height / 2;
    ball.vx = 0;
    ball.vy = 0;
    ball.moving = false;
    ball.inGutter = false;
    ball.canBowl = true;
    arrowAngle = 0;
    arrowDir = 1;
    drawGame.knockChecked = false;
    // pins = getPinPositions(); // Do not reset pins here
}
function resetBallAndPins() {
    resetBall();
    pins = getPinPositions();
}
window.addEventListener('keyup', function(e) {
    if (e.code === 'Space' && !ball.moving) resetBall();
});

// Recalculate pins and ball position on resize
window.addEventListener('resize', () => {
    ball.x = ballRadius + 10;
    ball.y = canvas.height / 2;
    pins = getPinPositions();
});
