// Cyber-Retro Snake – script (musik pause saat makan)
const canvas = document.getElementById('Gamecanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');
const gameoverElement = document.getElementById('gameover');
const levelupElement = document.getElementById('levelup');
const bgmusic = document.getElementById('bgmusic');

const gridSize = 20;
const gridWidth = Math.floor(canvas.width / gridSize);
const gridHeight = Math.floor(canvas.height / gridSize);

let snake = [{ x: Math.floor(gridWidth/2), y: Math.floor(gridHeight/2) }];
let food = { x: 5, y: 5 };
let direction = 'right';
let score = 0;
let level = 1;
let running = false;
let speed = 140;
let tickHandle = null;

// sounds
const strikeSound = new Audio('sounds/strike.mp3');
const gameOverSound = new Audio('sounds/gameover.wav');

// small neon particle system (subtle)
let particles = [];
function spawnParticles(x, y, color='cyan', count=8){
  for(let i=0;i<count;i++){
    particles.push({
      x: x*gridSize+gridSize/2 + (Math.random()-0.5)*6,
      y: y*gridSize+gridSize/2 + (Math.random()-0.5)*6,
      vx: (Math.random()-0.5)*2.2,
      vy: (Math.random()-0.5)*2.2,
      life: 30 + Math.floor(Math.random()*20),
      color
    });
  }
}
function updateParticles(){
  for(let i=particles.length-1;i>=0;i--){
    const p = particles[i];
    p.x += p.vx; p.y += p.vy; p.life--;
    if(p.life<=0) particles.splice(i,1);
  }
}
function drawParticles(){
  for(const p of particles){
    const alpha = Math.max(0, p.life / 50);
    ctx.fillStyle = `rgba(${p.color==='mag'?'255,99,231':'0,240,255'},${alpha})`;
    ctx.beginPath();
    ctx.arc(p.x,p.y, 2.2, 0, Math.PI*2);
    ctx.fill();
  }
}

// draw functions – neon + slight pixel look
function clearCanvas(){
  // subtle vignette background
  const g = ctx.createLinearGradient(0,0,0,canvas.height);
  g.addColorStop(0, '#00121a');
  g.addColorStop(1, '#001827');
  ctx.fillStyle = g;
  ctx.fillRect(0,0,canvas.width,canvas.height);
}
function draw(){
  clearCanvas();
  // draw food as small glowing orb (retro)
  ctx.save(); ctx.globalCompositeOperation='lighter';
  ctx.fillStyle = '#ff0066';
  ctx.beginPath();
  ctx.arc(food.x*gridSize + gridSize/2, food.y*gridSize + gridSize/2, gridSize*0.35,0,Math.PI*2);
  ctx.fill();
  // glow
  ctx.fillStyle = 'rgba(255,0,102,0.12)'; ctx.beginPath();
  ctx.arc(food.x*gridSize + gridSize/2, food.y*gridSize + gridSize/2, gridSize*0.9,0,Math.PI*2); ctx.fill();
  ctx.restore();

  // draw snake segments with neon gradient
  for(let i=0;i<snake.length;i++){
    const s = snake[i];
    const t = i / snake.length;
    const r = Math.floor(24 + 200 * (1-t));
    const g = Math.floor(255 * (t));
    const b = Math.floor(255 * (1-t)*0.8);
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    // pixelated rectangle
    ctx.fillRect(s.x*gridSize, s.y*gridSize, gridSize, gridSize);
    // small inner shine
    ctx.fillStyle = `rgba(255,255,255,${0.04 + 0.18 * (1-t)})`;
    ctx.fillRect(s.x*gridSize + 2, s.y*gridSize + 2, gridSize-4, gridSize-4);
  }

  drawParticles();
}

// update game state
function step(){
  if(!running) return;
  const head = {...snake[0]};
  if(direction==='up') head.y--;
  if(direction==='down') head.y++;
  if(direction==='left') head.x--;
  if(direction==='right') head.x++;

  // collisions
  if(head.x<0||head.x>=gridWidth||head.y<0||head.y>=gridHeight){ return gameOver(); }
  for(const seg of snake){ if(seg.x===head.x&&seg.y===head.y) return gameOver(); }

  snake.unshift(head);

  if(head.x===food.x && head.y===food.y){
    score += 10;
    scoreElement.textContent = score;
    // pause music briefly, play strike
    try {
      bgmusic.pause();
    } catch(_){}
    strikeSound.currentTime = 0;
    strikeSound.play().catch(()=>{});
    strikeSound.onended = ()=>{ try{ bgmusic.play().catch(()=>{}); }catch(_){} };

    // subtle retro particles
    spawnParticles(food.x, food.y, 'cyan', 10);
    // food respawn
    generateFood();

    // level up?
    if(score % 50 === 0){
      level++;
      levelElement.textContent = level;
      speed = Math.max(60, speed - 12);
      // small flash overlay: show levelup text
      showLevelUp();
      restartLoop();
    }
  } else {
    snake.pop();
  }
  updateParticles();
}

// helpers
function generateFood(){
  let tries = 0;
  while(true){
    const c = {x: Math.floor(Math.random()*gridWidth), y: Math.floor(Math.random()*gridHeight)};
    if(!snake.some(s=>s.x===c.x && s.y===c.y)){ food = c; break; }
    if(++tries>200){ food = {x:0,y:0}; break;}
  }
}
function gameOver(){
  running=false;
  clearInterval(tickHandle);
  gameOverSound.currentTime = 0;
  gameOverSound.play().catch(()=>{});
  document.getElementById('gameover').style.display='block';
  try{ bgmusic.pause(); }catch(_){}
  // show burst
  for(let i=0;i<40;i++) spawnParticles(Math.random()*gridWidth, Math.random()*gridHeight, i%2? 'mag':'cyan', 6);
}

// ui functions
function restartLoop(){ clearInterval(tickHandle); tickHandle = setInterval(()=>{ step(); draw(); }, speed); }
function startGame(){
  document.getElementById('startBtn').style.display='none';
  document.getElementById('resetBtn').style.display='inline-block';
  document.getElementById('gameover').style.display='none';
  running=true; generateFood(); restartLoop();
  try{ bgmusic.volume=0.45; bgmusic.play().catch(()=>{}); }catch(_){}
}
function resetGame(){
  snake = [{ x: Math.floor(gridWidth/2), y: Math.floor(gridHeight/2) }]; direction='right';
  score=0; level=1; speed=140;
  scoreElement.textContent=0; levelElement.textContent=1;
  document.getElementById('gameover').style.display='none';
  running=true; generateFood(); restartLoop();
  try{ bgmusic.currentTime=0; bgmusic.play().catch(()=>{}); }catch(_){}
}
function showLevelUp(){
  const el = document.getElementById('levelup');
  el.style.display='block'; el.style.opacity='1';
  setTimeout(()=>{ el.style.transition='opacity 600ms'; el.style.opacity='0'; }, 600);
  setTimeout(()=>{ el.style.display='none'; el.style.transition=''; }, 1400);
}

// input
document.addEventListener('keydown', e=>{
  if(e.key==='ArrowUp' && direction!=='down') direction='up';
  if(e.key==='ArrowDown' && direction!=='up') direction='down';
  if(e.key==='ArrowLeft' && direction!=='right') direction='left';
  if(e.key==='ArrowRight' && direction!=='left') direction='right';
});

// init
generateFood();
draw();
