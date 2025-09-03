const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Game variables
let birdY = 200;
let velocity = 0;
const gravity = 0.4;
const jumpStrength = -6;
let pipes = [];
let pipeGap = 120;
let pipeWidth = 50;
let pipeSpeed = 2;
let score = 0;
let gameOver = false;

// Bird properties
const birdX = 100;
const birdSize = 20;

// ---------- Helpers for cactus drawing isse isu samjhega ke code kaise karnge  ----------
function roundRect(ctx, x, y, w, h, r) {
    if (w <= 0 || h <= 0) return;
    const rr = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y,     x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x,     y + h, rr);
    ctx.arcTo(x,     y + h, x,     y,     rr);
    ctx.arcTo(x,     y,     x + w, y,     rr);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}

function setCactusStyle() {
    // Fill kar rahe hai  as a subtle vertical gradient
    const g = ctx.createLinearGradient(0, 0, 0, canvas.height);
    g.addColorStop(0, "#2e9b3e");
    g.addColorStop(1, "#1e7d2f");
    ctx.fillStyle = g;

    ctx.strokeStyle = "#145e24";
    ctx.lineWidth = 2;
}

function drawSpikesAlongEdge(x, y, w, h, edge = "left", spacing = 14, length = 5) {
    ctx.save();
    ctx.strokeStyle = "rgba(0,0,0,0.22)";
    ctx.lineWidth = 1;

    if (edge === "left") {
        for (let yy = y + 8; yy < y + h - 8; yy += spacing) {
            ctx.beginPath();
            ctx.moveTo(x, yy);
            ctx.lineTo(x - length, yy - 3);
            ctx.stroke();
        }
    } else if (edge === "right") {
        for (let yy = y + 8; yy < y + h - 8; yy += spacing) {
            ctx.beginPath();
            ctx.moveTo(x + w, yy);
            ctx.lineTo(x + w + length, yy - 3);
            ctx.stroke();
        }
    }
    ctx.restore();
}

function drawCactusArms(x, y, w, h, segmentType) {
    // segmentType: "top" or "bottom" — arms point away from the gap
    ctx.save();
    setCactusStyle();

    const armW = Math.min(22, w - 10);
    const armH = 40;
    const r = 10;

    if (segmentType === "top") {
        // Top cactus: arms go upward/outward
        // Left arm
        let ax = x - armW + 6;
        let ay = y + Math.max(18, h * 0.45) - armH;
        ctx.beginPath();
        roundRect(ctx, ax, ay, armW, armH, r);

        // Right arm
        ax = x + w - 6;
        ay = y + Math.max(18, h * 0.2) - armH;
        roundRect(ctx, ax, ay, armW, armH, r);
    } else {
        // Bottom cactus: arms go upward (israr234classic saguaro)
        // Left arm
        let ax = x - armW + 6;
        let ay = y + Math.min(h * 0.35, h - armH - 8);
        roundRect(ctx, ax, ay, armW, armH, r);

        // Right arm  israr023change 1 
        ax = x + w - 6;
        ay = y + Math.min(h * 0.6, h - armH - 8);
        roundRect(ctx, ax, ay, armW, armH, r);
    }
  
    ctx.restore();
}

function drawCactusBody(x, y, w, h) {
    ctx.save();
    setCactusStyle();
    roundRect(ctx, x, y, w, h, 12);
    // Spikes
    drawSpikesAlongEdge(x, y, w, h, "left");
    drawSpikesAlongEdge(x, y, w, h, "right");
    ctx.restore();
}

// function drawCactusSegment(x, y, w, h, segmentType) {
//     if (h <= 0) return;
//     drawCactusBody(x, y, w, h);
//     drawCactusArms(x, y, w, h, segmentType);
// } kuch change ke sath rakha hai comment vali code bhi correct hai bas function me htoea issue haib 
function drawCactusSegment(x, y, w, h, segmentType) {
    if (h <= 0) return;

    // Gradient fill for cactus body
    let grad = ctx.createLinearGradient(x, y, x + w, y + h);
    grad.addColorStop(0, "#0b3d0b");   // dark green
    grad.addColorStop(0.5, "#145214"); // mid green
    grad.addColorStop(1, "#082d08");   // nearly black
    ctx.fillStyle = grad;
    ctx.strokeStyle = "#021902";
    ctx.lineWidth = 3;
    
    // Main cactus body
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 15);
    ctx.fill();
    ctx.stroke();

    // Add random texture (spots like cactus bumps)
    ctx.fillStyle = "rgba(0,0,0,0.4)";
    for (let i = 0; i < h / 12; i++) {
        let cx = x + Math.random() * w;
        let cy = y + Math.random() * h;
        ctx.beginPath();
        ctx.arc(cx, cy, 2, 0, Math.PI * 2);
        ctx.fill();
    }

    // Spikes (dark scary thorns)
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1.5;
    for (let yy = y + 10; yy < y + h - 10; yy += 18) {
        // left side
        ctx.beginPath();
        ctx.moveTo(x, yy);
        ctx.lineTo(x - 8, yy - 3);
        ctx.stroke();

        // right side
        ctx.beginPath();
        ctx.moveTo(x + w, yy);
        ctx.lineTo(x + w + 8, yy - 3);
        ctx.stroke();
    }

    // Arms (classic cactus arms, jagged look)
    if (segmentType === "bottom") {
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(x - 20, y + h / 3, 20, 50, 8);
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.roundRect(x + w, y + h / 2, 20, 50, 8);
        ctx.fill();
        ctx.stroke();
    } else {
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(x - 20, y + h - 50, 20, 50, 8);
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.roundRect(x + w, y + h - 70, 20, 50, 8);
        ctx.fill();
        ctx.stroke();
    }
}


// ---------- Game logic ----------
function spawnPipe() {
    const topHeight = Math.floor(Math.random() * (canvas.height - pipeGap - 40)) + 20;
    pipes.push({ x: canvas.width, topHeight: topHeight });
}

function resetGame() {
    birdY = 200;
    velocity = 0;
    pipes = [];
    score = 0;
    gameOver = false;
    birdBurned = false;
    spawnPipe();
}

function drawBird() {
    // simple circle bird to pop against green cactus
    ctx.fillStyle = "yellow";
    ctx.beginPath();
    ctx.arc(birdX + birdSize / 2, birdY + birdSize / 2, birdSize / 2, 0, Math.PI * 2);
    ctx.fill();

    // tiny eye
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(birdX + birdSize * 0.65, birdY + birdSize * 0.35, 2.2, 0, Math.PI * 2);
    ctx.fill();
}

// NEW cactus-style pipes (cosmetic only; hitboxes same rectangles)
// function drawPipes() {
//     for (let p of pipes) {
//         const topY = 0;
//         const topH = p.topHeight;
//         const botY = p.topHeight + pipeGap;
//         const botH = canvas.height - botY;

//         // top cactus
//         drawCactusSegment(p.x, topY, pipeWidth, topH, "top");
//         // bottom cactus
//         drawCactusSegment(p.x, botY, pipeWidth, botH, "bottom");
//     }
function drawPipes() {
    for (let p of pipes) {
        const topY = 0;
        const topH = p.topHeight;
        const botY = p.topHeight + pipeGap;
        const botH = canvas.height - botY;

        drawCactusSegment(p.x, topY, pipeWidth, topH, "top");
        drawCactusSegment(p.x, botY, pipeWidth, botH, "bottom");
    }

    // Score display
    ctx.fillStyle = "#ff4444";
    ctx.font = "20px monospace";
    ctx.fillText("Score: " + score, 10, 24);
}
    // A sandy ground strip (visual)
    ctx.fillStyle = "#e7d08b";
    ctx.fillRect(0, canvas.height - 18, canvas.width, 18);
    ctx.fillStyle = "rgba(0,0,0,0.08)";
    for (let i = 0; i < 20; i++) {
        const w = 30, h = 6;
        ctx.fillRect((i * 50 + (performance.now() / 20) % 50), canvas.height - h - 10, w, h);
    }

    // Score
ctx.fillStyle = "#3e2a17";
ctx.font = "20px monospace";
ctx.fillText("Score: " + score, 10, 24);

function update() {
    if (gameOver) return;

    velocity += gravity;
    birdY += velocity;

    for (let p of pipes) {
        p.x -= pipeSpeed;

        // Collision detection (same rectangles – logic unchanged)
        if (
            birdX < p.x + pipeWidth &&
            birdX + birdSize > p.x &&
            (birdY < p.topHeight || birdY + birdSize > p.topHeight + pipeGap)
        ) {
            gameOver = true;
        }

        // Scoring (when bird crosses the trailing edge of pipe)
        // Using <= to be more robust than strict equality
        if (!p.scored && p.x + pipeWidth <= birdX) {
            p.scored = true;
            score++;
        }
    }

    // Remove off-screen pipes
    if (pipes.length && pipes[0].x + pipeWidth < 0) {
        pipes.shift();
    }

    // Spawn new pipe
    if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width - 200) {
        spawnPipe();
    }

    // Ground/ceiling collision
    if (birdY < 0) {
    gameOver = true;
} else if (birdY + birdSize > canvas.height - 40) { 
    // 👇 fire floor collision
    gameOver = true;
     if (!birdBurned) { 
     birdBurned = true;  
    burnBird(birdX + birdSize / 2, canvas.height - 50); 
     }
}
    // if (birdY < 0 || birdY + birdSize > canvas.height) {
    //     gameOver = true;
    // }
// Clouds movement
for (let c of clouds) {
    c.x -= c.speed;
}
if (clouds.length && clouds[0].x + clouds[0].size < 0) {
    clouds.shift(); // remove offscreen
}
if (clouds.length === 0 || clouds[clouds.length - 1].x < canvas.width - 200) {
    spawnCloud();
}
// Random thunder chance
if (!thunderActive && Math.random() < 0.002) { // ~0.2% chance per frame
    triggerThunder();
}

if (thunderActive) {
    thunderTimer--;
    if (thunderTimer <= 0) thunderActive = false;
}
// Remove old bolts when thunder ends
if (!thunderActive) {
    lightningBolts = [];
}
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  
     if (!birdBurned) {
        drawBird(); // 👈 sirf tabhi jab bird zinda hai
    }

    drawPipes();
    drawFire();
    drawAshes();
     drawClouds(); // draw clouds
     drawLightning(); // draw lightning bolts if any
    if (gameOver) {
        ctx.fillStyle = "#3e2a17";
        ctx.font = "40px monospace";
        ctx.fillText("GAME OVER", canvas.width / 2 - 120, canvas.height / 2);
        ctx.font = "20px monospace";
        ctx.fillText("Press Space to Restart", canvas.width / 2 - 130, canvas.height / 2 + 40);
    }
    if (thunderActive) {
        drawLightning();
    ctx.fillStyle = "rgba(255,0,0,0.2)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

document.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
        if (gameOver) {
            resetGame();
        } else {
            velocity = jumpStrength;
        }
    }
});
// Fire animation variables
let fireParticles = [];

function createFire() {
    let x = Math.random() * canvas.width;
    let y = canvas.height - 10;
    let size = Math.random() * 6 + 4;
    let speed = Math.random() * 1 + 0.5;
    fireParticles.push({ x, y, size, speed });
}

function drawFire() {
    // Add new flames
    if (fireParticles.length < 200) {
        createFire();
    }

    for (let i = 0; i < fireParticles.length; i++) {
        let p = fireParticles[i];

        // Gradient flame color
        let grad = ctx.createRadialGradient(p.x, p.y, 1, p.x, p.y, p.size);
        grad.addColorStop(0, "rgba(255,200,50,1)");
        grad.addColorStop(0.5, "rgba(255,80,0,0.9)");
        grad.addColorStop(1, "rgba(0,0,0,0)");

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Movement
        p.y -= p.speed;
        p.size *= 0.97; // shrink slowly

        // Remove tiny particles
        if (p.size < 1) {
            fireParticles.splice(i, 1);
            i--;
        }
    }

    // Draw glowing lava base
    let lavaGrad = ctx.createLinearGradient(0, canvas.height - 50, 0, canvas.height);
    lavaGrad.addColorStop(0, "rgba(255,80,0,0.8)");
    lavaGrad.addColorStop(1, "rgba(100,0,0,1)");
    ctx.fillStyle = lavaGrad;
    ctx.fillRect(0, canvas.height - 40, canvas.width, 40);
}
let ashParticles = [];
function burnBird(x, y) {
    for (let i = 0; i < 40; i++) {
        let angle = Math.random() * Math.PI * 2;
        let speed = Math.random() * 2 + 1;
        ashParticles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 2,
            life: 60,
            size: Math.random() * 3 + 2
        });
    }
}
function drawAshes() {
    for (let i = 0; i < ashParticles.length; i++) {
        let p = ashParticles[i];
        ctx.fillStyle = "rgba(80,80,80," + (p.life / 60) + ")";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05; // little gravity
        p.life--;

        if (p.life <= 0) {
            ashParticles.splice(i, 1);
            i--;
        }
    }
}
let birdBurned = false;

// cloude effect 
let clouds = [];
function spawnCloud() {
    let y = Math.random() * 150; // upar ke area me hi
    let size = Math.random() * 80 + 60; // random size
    let speed = Math.random() * 0.5 + 0.2; // slow movement
    clouds.push({
        x: canvas.width,
        y: y,
        size: size,
        speed: speed
    });
}
// 
function drawClouds() {
    ctx.save();
    for (let c of clouds) {
        // Cloud is a group of small circles
        let parts = 5 + Math.floor(Math.random() * 3); // 5–7 blobs
        ctx.fillStyle = "rgba(175, 248, 5, 0.64)";
        for (let i = 0; i < parts; i++) {
            let offsetX = (Math.random() - 0.5) * c.size * 0.6;
            let offsetY = (Math.random() - 0.5) * c.size * 0.3;
            let radius = c.size * (0.3 + Math.random() * 0.4);
             
            
            if (thunderActive) {
                ctx.fillStyle = "rgba(200,50,50,0.7)"; // scary red tint
            } else {
                ctx.fillStyle = "rgba(200,200,200,0.8)";
            }

            ctx.beginPath();
            ctx.arc(c.x + offsetX, c.y + offsetY, radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    ctx.restore();
}
let thunderActive = false;
let thunderTimer = 0;
function triggerThunder() {
    thunderActive = true;
    thunderTimer = 20; // frames (about 1/3 second)
}
let lightningBolts = [];
// function spawnLightning() {
//     let bolt = [];
//     let startX = Math.random() * canvas.width;
//     let y = 0;
//     let x = startX;
//     let segments = 8 + Math.floor(Math.random() * 5); // 8–12 segments

//     for (let i = 0; i < segments; i++) {
//         let xOffset = (Math.random() - 0.5) * 80; // zigzag
//         y += canvas.height / segments;
//         bolt.push({ x: startX + xOffset, y: y });
//     }

//     lightningBolts.push(bolt);
// }
function spawnLightning() {
    let bolt = [];
    let startX = Math.random() * canvas.width; 
    let y = 0;
    let x = startX;

    bolt.push({ x, y });

    // Main zigzag path
    while (y < canvas.height) {
        x += (Math.random() - 0.5) * 80; 
        y += Math.random() * 40 + 20;    
        bolt.push({ x, y });

        // 🌿 Branch spawn chance
        if (Math.random() < 0.3) { // 30% chance branch niklegi
            spawnBranch(x, y, 4); // chhoti side branch
        }
    }

    lightningBolts.push(bolt);
}
function spawnBranch(startX, startY, depth) {
    if (depth <= 0) return;

    let branch = [];
    let x = startX;
    let y = startY;

    branch.push({ x, y });

    let length = Math.floor(Math.random() * 5) + 3; // random steps

    for (let i = 0; i < length; i++) {
        x += (Math.random() - 0.5) * 60; 
        y += Math.random() * 30 + 10;
        branch.push({ x, y });
    }

    lightningBolts.push(branch);

    // 🌿 Chance of recursive sub-branches
    if (Math.random() < 0.2) {
        spawnBranch(x, y, depth - 1);
    }
}

let lightningVisible = false;
let lightningTimer = 0;
function drawLightning() {
    ctx.save();

    // ⚡ Flicker logic
    lightningTimer--;
    if (lightningTimer <= 0) {
        lightningVisible = Math.random() > 0.7; // 30% chance dikhe
        lightningTimer = 5;
    }

    if (lightningVisible) {
        // Agar naye flash pe sound play karna hai
        if (thunderSound.paused) {
            thunderSound.currentTime = 0;
            thunderSound.play();
        }

        // Agar bolt array empty ho jaye to naya spawn karo
        if (lightningBolts.length < 3) {
            spawnLightning();
        }

        // ⚡ Draw har bolt
        for (let bolt of lightningBolts) {
            // 🔴 Outer red glow
            ctx.strokeStyle = "rgba(255, 0, 0, 0.8)";
            ctx.lineWidth = 6;
            ctx.shadowColor = "red";
            ctx.shadowBlur = 25;

            ctx.beginPath();
            ctx.moveTo(bolt[0].x, bolt[0].y);
            for (let i = 1; i < bolt.length; i++) {
                ctx.lineTo(bolt[i].x, bolt[i].y);
            }
            ctx.stroke();

            // ⚪ Inner white core
            ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
            ctx.lineWidth = 2;
            ctx.shadowBlur = 0;

            ctx.beginPath();
            ctx.moveTo(bolt[0].x, bolt[0].y);
            for (let i = 1; i < bolt.length; i++) {
                ctx.lineTo(bolt[i].x, bolt[i].y);
            }
            ctx.stroke();
        }
    }
    ctx.restore();
}

// 🔊 Thunder sound load
const thunderSound = new Audio("music.mp3");
thunderSound.volume = 0.6;

// 🚀 Start game
resetGame();
gameLoop();
// yaha  tk bhi rakhe hai or bhi abaki hai 

// function drawLightning() {
//     ctx.save();

//     // ⚡ Flicker logic yaha rakho (loop ke bahar)
//     lightningTimer--;
//     if (lightningTimer <= 0) {
//         lightningVisible = Math.random() > 0.7; // 30% chance dikhe
//         lightningTimer = 5; // har thodi der me check kare
//     }

//     // if (!lightningVisible) {
//     //     ctx.restore();
//     //     return; // agar flash off hai to kuch draw na ho
//     // }


//     if (lightningVisible) {
//     // Agar sound already play ho raha hai to restart karo
//     thunderSound.currentTime = 0;
//     thunderSound.play();
// }


//     // 🔥 Lightning draw karna sirf tab jab visible hai
//     for (let bolt of lightningBolts) {
//         // 🔴 Outer red glow
//         ctx.strokeStyle = "rgba(255, 0, 0, 0.8)";
//         ctx.lineWidth = 6;
//         ctx.shadowColor = "red";
//         ctx.shadowBlur = 25;

//         ctx.beginPath();
//         ctx.moveTo(bolt[0].x, bolt[0].y);
//         for (let i = 1; i < bolt.length; i++) {
//             ctx.lineTo(bolt[i].x, bolt[i].y);
//         }
//         ctx.stroke();

//         // ⚪ Inner white jagged core
//         ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
//         ctx.lineWidth = 2;
//         ctx.shadowBlur = 0;

//         ctx.beginPath();
//         ctx.moveTo(bolt[0].x, bolt[0].y);
//         for (let i = 1; i < bolt.length; i++) {
//             ctx.lineTo(bolt[i].x, bolt[i].y);
//         }
//         ctx.stroke();
//     }

//     ctx.restore();
// }
// // 🔊 Thunder sound load
// const thunderSound = new Audio("music.mp3");
// thunderSound.volume = 0.6; // halka kam rakha
let paused = false;

// 📱 Jump button → Space ke jaisa
document.getElementById("jumpBtn").addEventListener("click", () => {
    if (gameOver) {
        resetGame();
    } else {
        velocity = jumpStrength;
    }
});

// 📱 Pause button
document.getElementById("pauseBtn").addEventListener("click", () => {
    paused = !paused;
    document.getElementById("pauseBtn").innerText = paused ? "▶️ Resume" : "⏸ Pause";
});

// 🕹 Game loop me pause check add karo
function gameLoop() {
    if (!paused) {
        update();
        draw();
    }
    requestAnimationFrame(gameLoop);
}

// // Start game
// resetGame();
// gameLoop();

