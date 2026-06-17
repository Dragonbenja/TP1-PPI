/* ===========================
   MDN Breakout — game.js
   Basado en el tutorial de MDN:
   https://developer.mozilla.org/en-US/docs/Games/Tutorials/2D_Breakout_game_pure_JavaScript
   =========================== */

"use strict";

/* ---------- Referencias al DOM ---------- */
const canvas   = document.getElementById("gameCanvas");
const ctx      = canvas.getContext("2d");
const overlay  = document.getElementById("msgOverlay");
const scoreEl  = document.getElementById("scoreVal");
const livesEl  = document.getElementById("livesVal");
const levelEl  = document.getElementById("levelVal");

/* ---------- Dimensiones ---------- */
const W = canvas.width;   // 480
const H = canvas.height;  // 320

/* ---------- Constantes de ladrillos ---------- */
const BRICK_ROWS       = 5;
const BRICK_COLS       = 7;
const BRICK_W          = 55;
const BRICK_H          = 16;
const BRICK_PAD        = 8;
const BRICK_OFFSET_TOP = 40;
const BRICK_OFFSET_LEFT = 18;

/* Colores por fila (de arriba hacia abajo) */
const BRICK_COLORS = [
  "#e05a5a",  // fila 0 — rojo
  "#e09450",  // fila 1 — naranja
  "#d4c842",  // fila 2 — amarillo
  "#56b356",  // fila 3 — verde
  "#4d8fd4",  // fila 4 — azul
];

/* ---------- Estado del juego ---------- */
let ball, paddle, bricks;
let score, lives, level;
let running = false;
let raf     = null;
let keys    = {};

/* ================================================
   INICIALIZACIÓN
   ================================================ */

function initGame(lv) {
  level = lv || 1;
  score = 0;
  lives = 3;
  resetBall();
  resetPaddle();
  buildBricks();
  updateHUD();
}

function resetBall() {
  const speed = 2.2 + (level - 1) * 0.3;
  ball = {
    x:  W / 2,
    y:  H - 50,
    dx: speed * (Math.random() > 0.5 ? 1 : -1),
    dy: -speed,
    r:  8,
  };
}

function resetPaddle() {
  paddle = {
    x: (W - 75) / 2,
    y: H - 20,
    w: 75,
    h: 10,
  };
}

function buildBricks() {
  bricks = [];
  for (let r = 0; r < BRICK_ROWS; r++) {
    bricks[r] = [];
    for (let c = 0; c < BRICK_COLS; c++) {
      bricks[r][c] = { status: 1 };
    }
  }
}

/* ================================================
   HUD
   ================================================ */

function updateHUD() {
  scoreEl.textContent = score;
  livesEl.textContent = lives;
  levelEl.textContent = level;
}

/* ================================================
   DIBUJO — Lección 1 + 2
   ================================================ */

function drawBall() {
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
  ctx.fillStyle = "#e0e0e0";
  ctx.fill();
  ctx.closePath();
}

function drawPaddle() {
  ctx.beginPath();
  ctx.rect(paddle.x, paddle.y, paddle.w, paddle.h);
  ctx.fillStyle = "#4d8fd4";
  ctx.fill();
  ctx.closePath();
}

/* Lección 6 — campo de ladrillos */
function drawBricks() {
  for (let r = 0; r < BRICK_ROWS; r++) {
    for (let c = 0; c < BRICK_COLS; c++) {
      if (bricks[r][c].status === 1) {
        const bx = c * (BRICK_W + BRICK_PAD) + BRICK_OFFSET_LEFT;
        const by = r * (BRICK_H + BRICK_PAD) + BRICK_OFFSET_TOP;
        ctx.beginPath();
        ctx.rect(bx, by, BRICK_W, BRICK_H);
        ctx.fillStyle = BRICK_COLORS[r % BRICK_COLORS.length];
        ctx.fill();
        ctx.closePath();
      }
    }
  }
}

/* Lección 8 — puntuación en canvas */
function drawScore() {
  ctx.font = "13px sans-serif";
  ctx.fillStyle = "#666";
  ctx.fillText("Score: " + score, 8, 20);
}

function drawLives() {
  ctx.font = "13px sans-serif";
  ctx.fillStyle = "#666";
  ctx.fillText("Lives: " + lives, W - 72, 20);
}

/* ================================================
   DETECCIÓN DE COLISIONES — Lección 7
   ================================================ */

function collisionDetection() {
  for (let r = 0; r < BRICK_ROWS; r++) {
    for (let c = 0; c < BRICK_COLS; c++) {
      const b = bricks[r][c];
      if (b.status !== 1) continue;

      const bx = c * (BRICK_W + BRICK_PAD) + BRICK_OFFSET_LEFT;
      const by = r * (BRICK_H + BRICK_PAD) + BRICK_OFFSET_TOP;

      if (
        ball.x > bx &&
        ball.x < bx + BRICK_W &&
        ball.y > by &&
        ball.y < by + BRICK_H
      ) {
        ball.dy = -ball.dy;
        b.status = 0;
        score += 10;
        updateHUD();

        if (allBricksCleared()) {
          onLevelWin();
          return;
        }
      }
    }
  }
}

function allBricksCleared() {
  for (let r = 0; r < BRICK_ROWS; r++)
    for (let c = 0; c < BRICK_COLS; c++)
      if (bricks[r][c].status === 1) return false;
  return true;
}

/* ================================================
   MOVIMIENTO DE LA PALETA — Lección 4
   ================================================ */

function movePaddle() {
  if (keys["ArrowLeft"] || keys["Left"]) {
    paddle.x = Math.max(0, paddle.x - 5);
  }
  if (keys["ArrowRight"] || keys["Right"]) {
    paddle.x = Math.min(W - paddle.w, paddle.x + 5);
  }
}

/* ================================================
   BUCLE PRINCIPAL — Lecciones 2, 3, 4, 5
   ================================================ */

function draw() {
  /* Limpiar canvas */
  ctx.clearRect(0, 0, W, H);

  /* Dibujar elementos */
  drawBricks();
  drawBall();
  drawPaddle();
  drawScore();
  drawLives();

  /* Colisiones con ladrillos */
  collisionDetection();

  /* Mover paleta por teclado */
  movePaddle();

  /* Lección 3 — rebote en paredes laterales y techo */
  if (ball.x + ball.dx > W - ball.r || ball.x + ball.dx < ball.r) {
    ball.dx = -ball.dx;
  }
  if (ball.y + ball.dy < ball.r) {
    ball.dy = -ball.dy;
  }

  /* Rebote en paleta o pérdida de vida — Lección 5 */
  if (ball.y + ball.dy > H - ball.r) {
    const hitPaddle =
      ball.x > paddle.x &&
      ball.x < paddle.x + paddle.w;

    if (hitPaddle) {
      /* Ángulo de rebote según punto de impacto */
      const hitPos = (ball.x - (paddle.x + paddle.w / 2)) / (paddle.w / 2);
      ball.dx = hitPos * 3.5;
      ball.dy = -Math.abs(ball.dy);
    } else {
      /* Lección 5 — perder una vida */
      lives--;
      updateHUD();

      if (lives === 0) {
        onGameOver();
        return;
      }
      resetBall();
      resetPaddle();
    }
  }

  /* Mover la pelota */
  ball.x += ball.dx;
  ball.y += ball.dy;
}

function loop() {
  if (!running) return;
  draw();
  raf = requestAnimationFrame(loop);
}

/* ================================================
   ESTADOS DEL JUEGO
   ================================================ */

function onGameOver() {
  running = false;
  cancelAnimationFrame(raf);
  showOverlay(
    "Game Over",
    "Puntuación final: " + score,
    "Reiniciar",
    function () {
      initGame(1);
      running = true;
      loop();
    }
  );
}

function onLevelWin() {
  running = false;
  cancelAnimationFrame(raf);
  showOverlay(
    "¡Nivel " + level + " completado!",
    "Puntuación: " + score,
    "Siguiente nivel",
    function () {
      level++;
      buildBricks();
      resetBall();
      resetPaddle();
      updateHUD();
      running = true;
      loop();
    }
  );
}

/* ================================================
   OVERLAY (pantalla de mensaje)
   ================================================ */

function showOverlay(title, subtitle, btnLabel, onBtnClick) {
  overlay.innerHTML =
    "<h3>" + title + "</h3>" +
    "<p>" + subtitle + "</p>" +
    '<button id="startBtn">' + btnLabel + "</button>";
  overlay.style.display = "flex";

  document.getElementById("startBtn").addEventListener("click", function () {
    overlay.style.display = "none";
    onBtnClick();
  });
}

/* ================================================
   CONTROLES — Lecciones 4 y 9
   ================================================ */

/* Teclado */
document.addEventListener("keydown", function (e) {
  keys[e.key] = true;
  if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
    e.preventDefault();
  }
});

document.addEventListener("keyup", function (e) {
  keys[e.key] = false;
});

/* Mouse — Lección 9 */
canvas.addEventListener("mousemove", function (e) {
  const rect  = canvas.getBoundingClientRect();
  const relX  = e.clientX - rect.left;
  paddle.x = Math.min(Math.max(relX - paddle.w / 2, 0), W - paddle.w);
});

/* Táctil (bonus de usabilidad) */
canvas.addEventListener("touchmove", function (e) {
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const relX = e.touches[0].clientX - rect.left;
  paddle.x = Math.min(Math.max(relX - paddle.w / 2, 0), W - paddle.w);
}, { passive: false });

/* ================================================
   ARRANQUE
   ================================================ */

initGame(1);

/* Dibujar frame estático inicial antes de que el jugador pulse Jugar */
ctx.clearRect(0, 0, W, H);
drawBricks();
drawPaddle();
drawBall();
drawScore();
drawLives();

/* Botón inicial en el overlay */
document.getElementById("startBtn").addEventListener("click", function () {
  overlay.style.display = "none";
  running = true;
  loop();
});
