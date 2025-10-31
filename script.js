const canvas = document.getElementById('Gamecanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');
const gameoverElement = document.getElementById('gameover');
const levelupElement = document.getElementById('levelup');
const bgmusic = document.getElementById('bgmusic');

const gridSize = 20;
const gridWidth = canvas.width / gridSize;
const gridHeight = canvas.height / gridSize;

let snake = [{ x: Math.floor(gridWidth / 2), y: Math.floor(gridHeight / 2) }];
let food = { x: 5, y: 5 };
let direction = 'right';
let score = 0;
let level = 1;
let gameRunning = false;
let speed = 150;
let interval;
let particles = [];

const strikeSound = new Audio('sounds/strike.mp3');   // efek makan
const gameOverSound = new Audio('sounds/gameover.wav');

const bgColors = ['#009688', '#1a237e', '#4a148c', '#2e7d32', '#e65100'];

// ==================== PARTICLE EFFECT ====================
function createParticles(x, y) {
  for (let i = 0; i < 10; i++) {
    particles.push({
      x: x * gridSize + gridSize / 2,
      y: y * gridSize + gridSize / 2,
      dx: (Math.random() - 0.5) * 4,
      dy: (Math.random() - 0.5) * 4,
      alpha: 1
    });
  }
}

function updateParticles() {
  particles.forEach(p => {
    p.x += p.dx;
    p.y += p.dy;
    p.alpha -= 0.03;
  });
  particles = particles.filter(p => p.alpha > 0);
}

function drawParticles() {
  particles.forEach(p => {
    ctx.fillStyle = `rgba(255,255,0,${p.alpha})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
    ctx.fill();
  });
}

// ==================== DRAW ====================
function draw() {
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = 'lime';
  snake.forEach(s => ctx.fillRect(s.x * gridSize, s.y * gridSize, gridSize, gridSize));

  ctx.fillStyle = 'red';
  ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);

  drawParticles();
}

// ==================== UPDATE ====================
function update() {
  if (!gameRunning) return;

  const head = { ...snake[0] };
  if (direction === 'up') head.y--;
  if (direction === 'down') head.y++;
  if (direction === 'left') head.x--;
  if (direction === 'right') head.x++;

  // 🚫 Tabrak dinding
  if (head.x < 0 || head.x >= gridWidth || head.y < 0 || head.y >= gridHeight) {
    endGame();
    return;
  }

  // 🚫 Tabrak diri sendiri
  for (let seg of snake) {
    if (seg.x === head.x && seg.y === head.y) {
      endGame();
      return;
    }
  }

  snake.unshift(head);

  // 🍎 Saat makan
  if (head.x === food.x && head.y === food.y) {
    score += 10;
    scoreElement.textContent = score;

    // 🎧 Musik berhenti sebentar → suara makan → lanjut musik
    bgmusic.pause();
    strikeSound.currentTime = 0;
    strikeSound.play();
    strikeSound.onended = () => {
      bgmusic.play().catch(() => {});
    };

    createParticles(food.x, food.y);
    generateFood();

    // 🆙 Naik level tiap 50 poin
    if (score % 50 === 0) {
      level++;
      levelElement.textContent = level;
      speed = Math.max(60, speed - 15);
      document.body.style.background = bgColors[level % bgColors.length];
      showLevelUp();
      restartLoop();
    }
  } else {
    snake.pop();
  }

  updateParticles();
}

// ==================== FOOD ====================
function generateFood() {
  food = {
    x: Math.floor(Math.random() * gridWidth),
    y: Math.floor(Math.random() * gridHeight)
  };
}

// ==================== END GAME ====================
function endGame() {
  gameRunning = false;
  clearInterval(interval);
  gameOverSound.play();
  gameoverElement.style.display = 'block';
  bgmusic.pause();
}

// ==================== RESET ====================
function resetGame() {
  snake = [{ x: Math.floor(gridWidth / 2), y: Math.floor(gridHeight / 2) }];
  direction = 'right';
  score = 0;
  level = 1;
  speed = 150;
  scoreElement.textContent = score;
  levelElement.textContent = level;
  gameoverElement.style.display = 'none';
  gameRunning = true;
  document.body.style.background = bgColors[0];
  bgmusic.currentTime = 0;
  bgmusic.play().catch(()=>{});
  generateFood();
  restartLoop();
}

// ==================== LEVEL UP ====================
function showLevelUp() {
  levelupElement.style.display = 'block';
  setTimeout(() => levelupElement.style.display = 'none', 800);
}

// ==================== LOOP ====================
function restartLoop() {
  clearInterval(interval);
  interval = setInterval(() => {
    update();
    draw();
  }, speed);
}

// ==================== START GAME ====================
function startGame() {
  document.getElementById("startBtn").style.display = "none";
  document.getElementById("resetBtn").style.display = "inline-block";
  bgmusic.volume = 0.5;
  bgmusic.play()
    .then(() => console.log("Musik nyala 🎵"))
    .catch(err => console.warn("Autoplay diblokir:", err));

  gameRunning = true;
  generateFood();
  restartLoop();
}

// ==================== KONTROL ====================
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowUp' && direction !== 'down') direction = 'up';
  if (e.key === 'ArrowDown' && direction !== 'up') direction = 'down';
  if (e.key === 'ArrowLeft' && direction !== 'right') direction = 'left';
  if (e.key === 'ArrowRight' && direction !== 'left') direction = 'right';
});
