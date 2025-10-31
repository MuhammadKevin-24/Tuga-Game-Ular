const canvas = document.getElementById('Gamecanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const gameoverElement = document.getElementById('gameover');

const gridsize = 20;
const gridwidth = canvas.width / gridsize;
const gridheight = canvas.height / gridsize;

let snake = [{ x: Math.floor(gridwidth / 2), y: Math.floor(gridheight / 2) }];
let food = { x: 5, y: 5 };
let direction = 'right';
let score = 0;
let gameRunning = true;

const eatSound = new Audio('sounds/eat.mp3');
const gameOverSound = new Audio('sounds/gameover.wav');

function draw() {
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'lime';
  snake.forEach(segment => {
    ctx.fillRect(segment.x * gridsize, segment.y * gridsize, gridsize, gridsize);
  });
  ctx.fillStyle = 'red';
  ctx.fillRect(food.x * gridsize, food.y * gridsize, gridsize, gridsize);
}
function update() {
  if (!gameRunning) return;
  const head = { ...snake[0] };
  if (direction === 'up') head.y--;
  if (direction === 'down') head.y++;
  if (direction === 'left') head.x--;
  if (direction === 'right') head.x++;
  if (head.x < 0 || head.x >= gridwidth || head.y < 0 || head.y >= gridheight) {
    endGame(); return;
  }
  for (let segment of snake) {
    if (segment.x === head.x && segment.y === head.y) { endGame(); return; }
  }
  snake.unshift(head);
  if (head.x === food.x && head.y === food.y) {
    score += 10;
    scoreElement.textContent = score;
    eatSound.play();
    generateFood();
  } else snake.pop();
}
function generateFood() {
  food = { x: Math.floor(Math.random() * gridwidth), y: Math.floor(Math.random() * gridheight) };
}
function endGame() {
  gameRunning = false;
  gameOverSound.play();
  gameoverElement.style.display = 'block';
  canvas.classList.add('gameover');
}
function resetGame() {
  snake = [{ x: Math.floor(gridwidth / 2), y: Math.floor(gridheight / 2) }];
  direction = 'right'; score = 0;
  scoreElement.textContent = score;
  food = { x: 5, y: 5 };
  gameRunning = true;
  gameoverElement.style.display = 'none';
  canvas.classList.remove('gameover');
  generateFood();
}
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowUp' && direction !== 'down') direction = 'up';
  if (e.key === 'ArrowDown' && direction !== 'up') direction = 'down';
  if (e.key === 'ArrowLeft' && direction !== 'right') direction = 'left';
  if (e.key === 'ArrowRight' && direction !== 'left') direction = 'right';
});
setInterval(() => { update(); draw(); }, 150);
