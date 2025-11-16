// ===============================
// GAME CANVAS
// ===============================
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resize();
window.onresize = resize;

// ===============================
// GAME STATE
// ===============================
let W = canvas.width;
let H = canvas.height;

let groundHeight = 90;

let gameSpeed = 7;
let distance = 0;

let day = true;
let daySwitchPoint = 1500;

// Spawn
let nextSpawn = 80; 
let spawnCooldown = 0;

// ===============================
// PLAYER (DINO)
// ===============================
const player = {
    x: 80,
    y: 0,
    w: 40,
    h: 40,
    vy: 0,
    gravity: 0.5,
    jumpPower: 17,
    grounded: false
};

player.y = H - groundHeight - player.h;

// ===============================
// CONTROLS
// ===============================
let keySpace = false;
window.addEventListener("keydown", e=>{
    if (e.code === "Space") keySpace = true;
});
window.addEventListener("keyup", e=>{
    if (e.code === "Space") keySpace = false;
});

// ===============================
// OBSTACLES
// ===============================
let obstacles = [];

function spawnObstacle() {
    let size = 40 + Math.random()*30;
    obstacles.push({
        x: W + 20,
        y: H - groundHeight - size,
        w: size,
        h: size
    });
}

// ===============================
// MARIO-STYLE PIXEL BACKGROUND
// ===============================
function drawSky() {
    let top = day ? "#5fc7ff" : "#001435";
    let bottom = day ? "#8bd7ff" : "#002d6a";

    let g = ctx.createLinearGradient(0,0,0,H);
    g.addColorStop(0, top);
    g.addColorStop(1, bottom);

    ctx.fillStyle = g;
    ctx.fillRect(0,0,W,H);
}

// Pixel cloud NES style
function drawCloud(x,y) {
    ctx.fillStyle = day ? "#ffffff" : "#c7c7c7";
    ctx.fillRect(x, y, 40, 12);
    ctx.fillRect(x+10, y-10, 20, 12);
}

// Draw multiple clouds
function drawClouds() {
    for (let i = 0; i < 6; i++) {
        drawCloud((i*200 + distance*0.2) % (W+200) - 100, 80 + (i%2)*40);
    }
}

// NES Mario hills
function drawHill(x, baseY, col) {
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.moveTo(x, baseY);
    ctx.lineTo(x+120, baseY-90);
    ctx.lineTo(x+240, baseY);
    ctx.closePath();
    ctx.fill();
}

// NES bushes
function drawBush(x, baseY) {
    ctx.fillStyle = "#3bbf3b";
    ctx.fillRect(x, baseY-20, 60, 20);
    ctx.fillRect(x+10, baseY-30, 40, 20);
}

// ===============================
// MARIO GROUND TILES
// ===============================
function drawGroundTiles() {
    let tile = 32;
    ctx.fillStyle = "#8f5a2b";

    let groundY = H - groundHeight;

    for (let x = -(distance % tile)*2; x < W; x += tile) {
        ctx.fillRect(x, groundY, tile, tile);
        ctx.fillRect(x, groundY + tile, tile, tile);
    }
}

// ===============================
// PLAYER UPDATE
// ===============================
function updatePlayer() {
    player.vy += player.gravity;
    player.y += player.vy;

    if (player.y >= H - groundHeight - player.h) {
        player.y = H - groundHeight - player.h;
        player.vy = 0;
        player.grounded = true;
    }

    if (keySpace && player.grounded) {
        player.grounded = false;
        player.vy = -player.jumpPower;
    }
}

// ===============================
// COLLISION CHECK
// ===============================
function isCollide(a,b) {
    return !(a.x+a.w < b.x || a.x > b.x+b.w || a.y+a.h < b.y || a.y > b.y+b.h);
}

// ===============================
// GAME LOOP
// ===============================
function update() {
    W = canvas.width;
    H = canvas.height;

    // Day/Night switch
    if (distance > daySwitchPoint) {
        day = !day;
        daySwitchPoint += 1500;
    }

    // Background
    drawSky();
    drawClouds();
    drawHill(200 - (distance*0.3 % 400), H-groundHeight, "#2fa12f");
    drawHill(600 - (distance*0.4 % 400), H-groundHeight, "#248f24");
    drawBush(150 - (distance*0.5 % 300), H-groundHeight);
    drawBush(450 - (distance*0.5 % 300), H-groundHeight);

    // Ground Tiles (NES Mario)
    drawGroundTiles();

    // Player
    updatePlayer();
    ctx.fillStyle = day ? "#ffb000" : "#ffd65a";
    ctx.fillRect(player.x, player.y, player.w, player.h);

    // Obstacles
    obstacles.forEach(ob=>{
        ob.x -= gameSpeed;
        ctx.fillStyle = "#4c2e00";
        ctx.fillRect(ob.x, ob.y, ob.w, ob.h);
    });

    // Remove off-screen
    obstacles = obstacles.filter(o => o.x + o.w > 0);

    // Spawn logic FIXED (không lỗi nextSpawn)
    if (spawnCooldown <= 0) {
        spawnObstacle();
        spawnCooldown = nextSpawn + Math.random()*60;
    }
    spawnCooldown -= 1;

    // Collision
    for (let ob of obstacles) {
        if (isCollide(player, ob)) {
            alert("Game Over!\nDistance: " + Math.floor(distance) + " m");
            location.reload();
        }
    }

    // Distance
    distance += gameSpeed * 0.1;
    document.getElementById("meter").innerText = Math.floor(distance) + " m";

    requestAnimationFrame(update);
}

update();
